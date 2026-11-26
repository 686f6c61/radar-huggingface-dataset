# HazLove/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF del modelo DeepSeek-V4.1-Flash-1017 (763B parámetros, 384 expertos) a la que se le ha aplicado una edición de "abliteration" para eliminar la dirección de rechazo (refusal direction) de los tensores densos que escriben en el residual. El trabajo lo publica el usuario HazLove sobre la base de las cuantizaciones GSQ-RCO de ISTA-DASLab, con la edición de rechazo desarrollada por el equipo de AtomicChat. El resultado es un modelo sin rechazos explícitos que, según las mediciones del autor, conserva la precisión en tareas de razonamiento.

La relevancia técnica del artefacto no está en el modelo base —un MoE de 763B con 384 expertos—, sino en la técnica de edición: solo se sustituyen los tensores densos que escriben en el residual (salida de atención `attn_output_b`, proyección down del experto compartido `ffn_down_shexp` y proyección de valor del Engram `engram_wkv`), dejando los 384 expertos enrutados intactos byte a byte. Esto preserva el redondeo de baja precisión aprendido por GSQ y mantiene el tamaño de cada fichero, de modo que el modelo editado se ejecuta exactamente donde lo hace el original.

El modelo está pensado para ejecutarse con Strata en una única GPU de 12 GB, con el backbone en memoria del sistema y la tabla Engram (110 GB) en streaming desde SSD. No es compatible con llama.cpp en el momento de la publicación. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con 384 expertos enrutados, experto compartido y tabla Engram; transformer con proyección de valor Engram |
| Parámetros totales | 551.880.949.208 (≈551,9B según safetensors); la model card indica 763B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw), IQ1_M (1,75 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards, con fichero Engram separado) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un MoE de 384 expertos enrutados con un experto compartido y una tabla Engram (lookup table de 110 GB) que se consulta mediante una proyección de valor (`engram_wkv`). La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido sobre los expertos enrutados. La edición de este artefacto sustituye únicamente los tensores densos que escriben en el residual —salida de atención, proyección down del experto compartido y proyección de valor del Engram— con la dirección de rechazo de DeepSeek proyectada fuera a fuerza 2,0, a precisión completa y luego cuantizada al tipo por tensor exacto de ISTA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la preservación byte a byte de los expertos enrutados, lo que mantiene el tamaño de fichero y la compatibilidad de ejecución con el original, además del uso de la tabla Engram en streaming desde SSD para permitir inferencia en hardware de consumidor.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento de alto esfuerzo ("thinking high"), evaluado con 30 preguntas en la model card.
- Razonamiento científico y matemático: evaluado en GPQA-Diamond y AIME25.
- Conocimiento general: evaluado en MMLU (500 preguntas).
- Ejecución sin rechazos explícitos en las rúbricas medidas (JailbreakBench EN, XSTest).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el artefacto permite estudiar cómo la proyección de la dirección de rechazo sobre los tensores densos del residual afecta al comportamiento del modelo sin tocar los expertos enrutados, con métricas de KL y benchmarks publicadas para replicar el experimento.
- Evaluación de robustez de clasificadores de rechazo: al eliminar los rechazos medidos, sirve para probar la eficacia de clasificadores de seguridad propios frente a un modelo sin refusal direction.
- Despliegue local en hardware de consumidor: con Strata y una GPU de 12 GB, el backbone reside en RAM del sistema y la tabla Engram se transmite desde SSD, lo que permite ejecutar un modelo de 763B en una máquina de escritorio.
- Comparación de cuantizaciones de baja precisión: las tres variantes (IQ1_M, IQ2_XXS, IQ2_XS) permiten medir el compromiso entre tamaño (231-266 GB), precisión en MMLU y tasa de rechazo en el mismo modelo.
- Experimentos de razonamiento con esfuerzo configurable: el modo "thinking high" con esfuerzo 50 se usa en las evaluaciones de GPQA-Diamond y AIME25, útil para estudiar el efecto del esfuerzo de razonamiento en tareas científicas.
- Reproducción de benchmarks: el repositorio de métricas incluye prompts, puertas de evaluación y registros por pregunta, lo que facilita la verificación independiente de los resultados de abliteration.

## Benchmarks y rendimiento

Resultados de la model card del autor, comparando la variante editada con la cuantización GSQ-RCO original en Strata:

| Benchmark | GSQ-RCO original | Uncensored (este modelo) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

Métricas por rung de cuantización (original → editado):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (rechazo seguro) | Thinking high (30) | MMLU (500) | KL frente al original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

El KL se mide con el modo de puntuación teacher-forced de Strata y es una cota inferior con top-64, por lo que el KL real es algo mayor.

## Requisitos de hardware

- VRAM estimada: el modelo está diseñado para ejecutarse en una única GPU de 12 GB con Strata; el backbone reside en memoria del sistema y la tabla Engram (110 GB) se transmite desde SSD.
- GPU recomendadas: no disponible; el requisito declarado es una GPU de 12 GB.
- Cabe en GPU de consumidor: sí, según el autor, con una GPU de 12 GB y suficiente RAM de sistema más un SSD rápido para el Engram.
- Opciones de despliegue: Strata (único runtime soportado según el autor; DeepSeek-V4.1 con fichero Engram separado no está en llama.cpp en el momento de la publicación). vLLM, TGI, Ollama y llama.cpp: no disponibles.
- Latencia y throughput: no disponibles.
- Espacio en disco: 231 GB (IQ1_M), 249 GB (IQ2_XXS) o 266 GB (IQ2_XS) por rung, más el fichero Engram compartido de 110 GB de ISTA-DASLab.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (HazLove, uncensored GSQ-RCO) | ≈551,9B (763B según model card) | no disponible | MIT | GGUF | Sin refusal direction; requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | ≈551,9B | no disponible | no disponible | GGUF | Base cuantizada sin editar; mantiene rechazos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | ≈551,9B | no disponible | no disponible | GGUF | Misma edición de rechazo, sin la preservación byte a byte de expertos GSQ |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | ≈551,9B | no disponible | no disponible | no disponible | Modelo original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos.
- Con el modo thinking activado, la edición planifica una respuesta a una solicitud de rechazo (texto truncado en la model card).
- No todas las variantes superaron todas las puertas de evaluación; las que no lo hicieron se publican con sus números tal cual.
- El KL medido es una cota inferior (top-64), por lo que la divergencia real frente al original es algo mayor que la reportada.
- Solo se ejecuta en Strata; no hay soporte en llama.cpp en el momento de la publicación.
- Requiere descargar por separado el fichero Engram de 110 GB desde el repositorio de ISTA-DASLab y mantenerlo en un SSD rápido.
- No se dispone de información sobre sesgos, idiomas soportados ni contexto máximo.
- La licencia MIT se declara en los metadatos, pero conviene verificar las condiciones del modelo base de DeepSeek antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HazLove/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Strata (runtime): https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
