# sekkit/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF en formato de bajo número de bits (GSQ-RCO) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario sekkit y construida sobre el trabajo previo de ISTA-DASLab y AtomicChat. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) de 763 mil millones de parámetros totales con 384 expertos enrutados, y esta variante concreta aplica una edición de "abliteration" que proyecta fuera la dirección de rechazo (refusal direction) de los tensores densos que escriben en el residual: la salida de atención (`attn_output_b`), la proyección down del experto compartido (`ffn_down_shexp`) y la proyección de valores Engram (`engram_wkv`). Los expertos enrutados se mantienen intactos byte a byte respecto al cuantizado original.

El interés de esta ficha radica en dos factores. Primero, demuestra que es posible eliminar el comportamiento de rechazo de un modelo de 763B sin degradar su precisión en tareas de razonamiento: según las mediciones del autor, GPQA-Diamond se mantiene idéntico (83,3 %) y AIME25 sube ligeramente (76,7 % → 80,0 %) respecto al cuantizado original. Segundo, el formato GSQ-RCO combinado con el motor de inferencia Strata permite ejecutar un modelo de este tamaño en una única GPU de 12 GB, manteniendo el backbone en memoria del sistema y transmitiendo la tabla Engram desde un SSD.

La relevancia actual es doble: por un lado, ilustra una técnica de modificación de pesos (abliteration selectiva sobre tensores densos) que preserva la precisión de tarea; por otro, muestra una vía práctica de despliegue de modelos MoE masivos en hardware de consumo mediante cuantización extrema (1,75–2,25 bits por peso) y offloading estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 384 expertos enrutados, experto compartido y módulo Engram |
| Parametros totales | 551.880.949.208 (≈551,9B según safetensors; la model card cita 763B para el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GSQ-RCO en tres niveles: IQ1_M (1,75 bpw, 231 GB), IQ2_XXS (2,0 bpw, 249 GB), IQ2_XS (2,25 bpw, 266 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards, con archivo Engram separado de ~110 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer MoE con 384 expertos enrutados, un experto compartido y un componente denominado Engram que actúa como tabla de consulta (lookup table) de aproximadamente 110 GB, servida por separado. La cuantización GSQ-RCO aplica un redondeo de bajo número de bits aprendido sobre los expertos enrutados, mientras que los tensores densos que escriben en el residual se mantienen en el tipo por tensor exacto definido por ISTA-DASLab. La edición de abliteration (fuerza 2,0) se aplica en precisión completa sobre esos tensores densos antes de cuantizarlos, de modo que los 384 expertos enrutados permanecen idénticos al cuantizado original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. La innovación técnica destacable es la combinación de cuantización extrema (1,75–2,25 bpw) con offloading estructurado: el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD, lo que permite ejecutar un modelo de este tamaño en una GPU de 12 GB mediante el motor Strata. La edición de rechazo se limita a tres tensores densos, lo que según el autor preserva la precisión de tarea (KL ~0,02 respecto al cuantizado original).

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento de alto esfuerzo ("thinking high"), con modo de pensamiento configurable (se midió con esfuerzo 50 y 30).
- Razonamiento matemático y científico: evaluado en AIME25 y GPQA-Diamond.
- Conocimiento general y académico: evaluado en MMLU (500 preguntas).
- Comportamiento sin rechazos ("uncensored"): la dirección de rechazo se ha proyectado fuera de los tensores densos de residual.
- Compatibilidad con endpoints (`endpoints_compatible` según tags).
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de eliminar la dirección de rechazo sobre el comportamiento del modelo, con métricas de jailbreak (JailbreakBench) y de rechazo seguro (XSTest) publicadas por rung de cuantización.
- Evaluación de técnicas de abliteration selectiva: sirve como caso de estudio de edición de pesos que preserva la precisión de tarea (GPQA-Diamond idéntico, AIME25 dentro del ruido), útil para comparar metodologías de modificación de modelos.
- Despliegue local de un MoE de gran escala en hardware de consumo: con Strata y una GPU de 12 GB más SSD rápido, permite experimentar con un modelo de 763B sin infraestructura de centro de datos.
- Generación de texto sin restricciones para entornos de investigación controlados: útil en estudios que requieren respuestas sin filtros de rechazo, con la advertencia de que el clasificador de rechazo solo lee el inicio de la respuesta.
- Benchmarking de cuantizaciones extremas: los tres rungs (IQ1_M, IQ2_XXS, IQ2_XS) permiten medir el compromiso entre tamaño (231–266 GB), bits por peso (1,75–2,25) y precisión (MMLU 80,6–82,8 %).
- Reproducción de mediciones: el repositorio de métricas (`AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics`) incluye prompts, puertas de calidad y registros por pregunta, lo que facilita replicar los resultados en otros entornos.

## Benchmarks y rendimiento

Comparativa entre el rung original GSQ-RCO y esta variante uncensored, servidos ambos en Strata con los mismos prompts y plantilla:

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (rechazo seguro) | Thinking high (30) | MMLU (500) | KL vs original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2 % → 0,0 % | 7,6 % → 0,0 % | 27/30 → 0/30 | 82,8 % (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4 % → 0,0 % | 4,0 % → 0,4 % | 27/30 → 2/30 | 81,6 % (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9 % → 0,0 % | 4,8 % → 0,0 % | 27/30 → 1/30 | 80,6 % (p=0,75) | 0,0207 |

Comparativa de razonamiento (rung IQ2_XXS editado frente al cuantizado original, Strata, esfuerzo de razonamiento 50):

| Benchmark | GSQ-RCO original | Uncensored (esta variante) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |

El KL indicado es una cota inferior (top-64) de la divergencia respecto al rung original; el autor señala que el KL real es algo mayor.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo corre en una única GPU de 12 GB con Strata, ya que el backbone reside en memoria del sistema y la tabla Engram (~110 GB) se transmite desde SSD.
- Almacenamiento: cada rung ocupa entre 231 GB (IQ1_M) y 266 GB (IQ2_XS), más el archivo Engram compartido de ~110 GB; el repositorio completo ocupa 414,2 GB.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU de 12 GB. No se documenta compatibilidad con A100, H100 o RTX 4090 en la información disponible.
- Opciones de despliegue: exclusivamente Strata (`strata launch --model-path ...`). El autor indica que, en el momento de publicación, estos archivos no funcionan en llama.cpp porque DeepSeek-V4.1 con archivo Engram separado aún no está soportado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (sekkit, uncensored GSQ-RCO) | ≈551,9B (safetensors); 763B citado para el base | no disponible | MIT | GGUF + Engram | Abliteration selectiva sobre tensores densos |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 763B (base) | no disponible | no disponible | GGUF + Engram | Cuantizado original sin edición de rechazo |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 763B (base) | no disponible | no disponible | GGUF | Misma edición de rechazo, mediciones por rung |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B (base) | no disponible | no disponible | safetensors (presumiblemente) | Modelo original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo empleado en la evaluación lee el inicio de la respuesta, por lo que un rechazo suave situado más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos. No debe tratarse como un modelo "parcialmente alineado".
- Con el modo de pensamiento activado, la edición planifica una respuesta a una solicitud (frase truncada en la model card); conviene revisar el comportamiento completo antes de usarlo en producción.
- Riesgo de alucinación: no se han publicado métricas específicas de factualidad o alucinación en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Licencia MIT, lo que permite uso comercial, pero la ausencia de filtros de rechazo traslada al operador la responsabilidad sobre el contenido generado.
- Dependencia exclusiva de Strata: no funciona en llama.cpp ni, presumiblemente, en otras pilas de inferencia estándar (vLLM, TGI, Ollama) en el momento de publicación.
- Requiere almacenamiento considerable (231–266 GB por rung más 110 GB de Engram) y un SSD rápido para el streaming de la tabla Engram.
- El modelo base figura con 763B parámetros según la model card, mientras que el dato de safetensors indica 551,9B; la discrepancia no se explica en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Motor de inferencia Strata: https://github.com/Niko1221/Strata
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
