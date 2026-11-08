# reeed/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF derivada de DeepSeek-V4.1-Flash-1017, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) de 763B parámetros brutos con 384 expertos enrutados, desarrollado originalmente por DeepSeek. La versión que nos ocupa la publica el usuario `reeed` a partir del backbone GSQ-RCO de ISTA-DASLab, aplicando una edición de "abliteration" (proyección de la dirección de rechazo) sobre los tensores densos que escriben en el residual: la salida de atención (`attn_output_b`), la proyección down del experto compartido (`ffn_down_shexp`) y la proyección de valor del Engram (`engram_wkv`).

El objetivo del modelo es eliminar el comportamiento de rechazo (refusals) del modelo base sin degradar su capacidad de razonamiento. Según la model card, los expertos enrutados (384 capas) se mantienen byte a byte idénticos a los publicados por ISTA-DASLab, de modo que el redondeo de baja precisión aprendido por GSQ se preserva y el tamaño de cada fichero no cambia. La edición se aplica a precisión completa y luego se cuantiza al tipo por tensor exacto de ISTA.

La relevancia práctica del modelo reside en su formato de despliegue: gracias a la separación entre el backbone y la tabla Engram (que se transmite desde SSD), el modelo puede ejecutarse en una única GPU de 12 GB mediante el runtime Strata, algo inusual para un modelo de 552B parámetros efectivos. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con 384 expertos enrutados y componente Engram |
| Parametros totales | 551.880.949.208 (552B); la model card cita 763B brutos con 384 expertos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_XXS (2.0 bpw), IQ2_XS (2.25 bpw), IQ1_M (1.75 bpw) |
| Idiomas soportados | no disponible (la model card y los tags no los detallan) |
| Licencia | MIT |
| Formato de pesos | GGUF (shards por rung + fichero Engram separado de ~110 GB) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer MoE con 384 expertos enrutados y 763B parámetros brutos según la model card. La arquitectura incorpora un componente denominado Engram, una tabla de consulta de aproximadamente 110 GB que se mantiene en un fichero separado y se transmite desde SSD durante la inferencia. Los pesos publicados por ISTA-DASLab en formato GSQ-RCO incorporan un redondeo de baja precisión aprendido para los expertos enrutados, que esta versión conserva intacto.

La modificación respecto al backbone original es una abliteration de una sola dirección con fuerza 2.0, aplicada a los tensores densos que escriben en el residual (salida de atención, down del experto compartido y proyección de valor del Engram). Según la model card, el desplazamiento de distribución medido como KL respecto al rung original es de aproximadamente 0,02 (cota inferior top-64), lo que indica una alteración pequeña del comportamiento del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en formato GGUF, con pipeline `text-generation`.
- Razonamiento de múltiples pasos con modo "thinking" (la model card mide "Thinking high" sobre 30 preguntas).
- Razonamiento matemático y científico: se reportan resultados en AIME25 y GPQA-Diamond.
- Conocimiento general evaluado con MMLU (500 preguntas).
- Comportamiento sin rechazos (uncensored) en todos los temas, incluyendo jailbreaks.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; solo se han medido evaluaciones en inglés (JailbreakBench EN, XSTest).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de eliminar la dirección de rechazo sobre el comportamiento del modelo, con métricas publicadas de JailbreakBench (85,2% → 0,0% en IQ2_XXS) y XSTest (7,6% → 0,0%), útil para analizar qué se pierde y qué se conserva tras una abliteration.
- Evaluación de cuantizaciones de baja precisión en modelos MoE masivos: los tres rungs (IQ1_M, IQ2_XXS, IQ2_XS) permiten comparar precisión frente a tamaño (231 GB, 249 GB y 266 GB) con métricas de MMLU y KL respecto al original.
- Despliegue local en hardware de consumo: con Strata y una GPU de 12 GB, el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD, lo que permite ejecutar un modelo de 552B parámetros en una máquina de escritorio.
- Generación de texto creativo sin restricciones de contenido: el modelo no rechaza peticiones en ningún tema, adecuado para entornos controlados de escritura de ficción o guiones donde el filtrado del modelo base resulta limitante.
- Experimentación con razonamiento de alto esfuerzo: el modo thinking permite resolver problemas de matemáticas y ciencia (AIME25, GPQA-Diamond) manteniendo la precisión del cuantizado original según la model card.
- Pruebas de robustez frente a jailbreaks: al tener el rechazo proyectado fuera, sirve como referencia para comparar clasificadores de seguridad y medir falsos positivos y negativos en pipelines de moderación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el rung IQ2_XXS frente al cuantizado GSQ-RCO original, ejecutados en Strata con esfuerzo de razonamiento 50:

| Benchmark | GSQ-RCO original | Uncensored (este modelo) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

Métricas de la edición por rung (JailbreakBench EN, XSTest y Thinking high sobre 30 preguntas):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (rechazo seguro) | Thinking high (30) | MMLU (500) | KL vs original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

## Requisitos de hardware

- VRAM: el modelo está diseñado para ejecutarse en una única GPU de 12 GB con el runtime Strata; el backbone reside en memoria del sistema y la tabla Engram (~110 GB) se transmite desde SSD.
- Almacenamiento: se requiere descargar un rung completo (231 GB para IQ1_M, 249 GB para IQ2_XXS, 266 GB para IQ2_XS) más el fichero Engram compartido de ~110 GB, que debe residir en un SSD rápido.
- GPU recomendadas: no disponible más allá de la indicación de una GPU de 12 GB; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: sí, según la model card, en una GPU de 12 GB con Strata.
- Opciones de despliegue: Strata (runtime indicado por el autor). La model card señala que llama.cpp todavía no soporta DeepSeek-V4.1 con fichero Engram separado. vLLM, Ollama y TGI no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (reeed, uncensored GSQ-RCO) | 552B (763B brutos, 384 expertos) | no disponible | MIT | GGUF + Engram | Abliteration sobre tensores densos; requiere Strata |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 552B (mismo base) | no disponible | MIT | GGUF | Misma edición de rechazo según la model card; sirve como referencia directa |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 552B (mismo base) | no disponible | MIT | GGUF + Engram | Backbone original sin edición; base de esta versión |
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-Coder-GGUF | no disponible | no disponible | MIT | GGUF | Variante orientada a código del mismo linaje uncensored |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos.
- Con el modo thinking activado, la model card advierte de que la edición planifica una respuesta a una petición (texto truncado en la información disponible).
- Riesgo de alucinación: no se han publicado métricas específicas de factualidad; aplican las limitaciones generales de los modelos de lenguaje.
- Idiomas: no se documentan los idiomas soportados y las evaluaciones publicadas son en inglés.
- Contexto: no se especifica la longitud máxima de contexto.
- Uso comercial: la licencia es MIT, por lo que se permite uso comercial, pero el contenido generado sin filtros de rechazo puede ser inapropiado en productos orientados al público; se recomienda moderación externa.
- Dependencia del runtime Strata: los ficheros no funcionan en llama.cpp según la model card, lo que limita las opciones de despliegue.
- El modelo base es una cuantización de baja precisión (1,75–2,25 bpw); la precisión puede degradarse frente a los pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reeed/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo de referencia de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Backbone GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Dataset de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Variante Coder: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-Coder-GGUF
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X de Atomic Chat: https://x.com/atomic_chat_hq
