# llmtech/decider-4b-nvfp4

## Resumen

decider-4b-nvfp4 es una versión cuantizada del modelo Mapika/decider-4b v2.1, un modelo de decisión y clasificación de texto (pipeline `text-classification`) que responde preguntas estructuradas sobre un estado textual en una sola pasada. La cuantización la ha realizado LLM Tech con NVIDIA ModelOpt 0.46.1 y el formato NVFP4: pesos y activaciones en coma flotante de 4 bits con escalas de bloque en FP8 (tamaño de bloque 16). El resultado ocupa 3,29 GB frente a los 8,41 GB del checkpoint bf16, lo que reduce el coste de despliegue a menos de la mitad.

El modelo no genera texto libre: recibe un estado (por ejemplo, el texto de una incidencia) y un conjunto de preguntas con tipos definidos (como `choice` o `noul` del formato Jev de TypeSafe) y devuelve la respuesta estructurada en una única pasada, sin cadena de razonamiento explícita (enfoque "system one"). Es relevante porque permite servir clasificación multi-tarea calibrada a alto rendimiento: en una RTX PRO 6000 Blackwell con vLLM 0.29.0 alcanza 78.054 tokens/s de prefill con estados de 1.024 tokens, el doble que el checkpoint bf16, con una pérdida de precisión de 0,6 puntos en tareas vistas y 0,7 en tareas retenidas.

El checkpoint se publica bajo licencia Apache 2.0, solo soporta inglés y está pensado para ejecutarse con vLLM, no con `transformers`. La model card advierte de que los detalles de entrenamiento, el protocolo de evaluación y la definición funcional del modelo son de Mapika, mientras que LLM Tech solo ha realizado la cuantización y las mediciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (etiqueta del repositorio); híbrida con capas de atención completa y capas de atención lineal tipo delta-net (`linear_attn`, `in_proj_qkv`, `in_proj_z`, `out_proj`), más MLP. No se detalla la configuración completa en la información disponible |
| Parametros totales | 2.423.172.096 (~2,42 mil millones, dato real de safetensors; el nombre del modelo indica "4b") |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | máximo declarado no disponible; se han medido y servido estados de hasta 32.768 tokens y peticiones de 29.033 tokens |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones FP4 con escalas de bloque FP8, bloque de 16); checkpoint base en bf16 en Mapika/decider-4b. La caché KV no está cuantizada |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,3 GB de repositorio) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es `qwen3_5_text`. La lista de capas excluidas de la cuantización revela una topología híbrida: además de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y bloques MLP (`gate_proj`, `up_proj`, `down_proj`), aparecen módulos de atención lineal con convolución (`linear_attn.conv1d`) y proyecciones propias de una red delta (`in_proj_qkv`, `in_proj_z`, `out_proj`), junto con `in_proj_a` e `in_proj_b` que se mantienen en bf16. En total se cuantizaron 200 capas lineales. La model card no especifica el número de capas, cabezas ni dimensiones ocultas.

No hay información sobre el entrenamiento en esta ficha: la model card remite explícitamente a la tarjeta del checkpoint bf16 para saber qué es el modelo y cómo se entrenó, e indica que el modelo, su entrenamiento y su protocolo de evaluación son de Mapika. Lo que sí se documenta es el proceso de cuantización: NVIDIA ModelOpt 0.46.1 con la configuración `NVFP4_DEFAULT_CFG` y las mismas exclusiones usadas en `decider-35b-a3b-nvfp4`. La calibración se hizo con 512 prompts de como máximo 2.048 tokens (210 de media), extraídos con semilla 11 del lado de entrenamiento de las tareas públicas de decisión y de los datos del profesor, descartando 2 prompts que solapaban con filas de evaluación. Ninguna fila de evaluación se usó para calibrar ni para tomar decisiones de cuantización. Se mantienen en bf16 `embed_tokens`, `lm_head`, `linear_attn.conv1d`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b` y las normalizaciones; se cuantizan las proyecciones de atención, las proyecciones delta-net y las tres proyecciones del MLP. La revisión base es `eb5fbdfc9448473ec25e399882912863afbdb70e`, y el tokenizador, la plantilla de chat, la configuración de generación y `decider_config.json` (incluidas las temperaturas) se conservan sin cambios salvo los campos `version` y `quantization`.

## Capacidades

- Clasificación y decisión estructurada multi-tarea: responde conjuntos de preguntas tipadas sobre un estado textual (tipos como `choice` y `noul` del formato Jev de TypeSafe), devolviendo la respuesta en una sola pasada.
- Salida calibrada: la model card reporta ECE de 0,0312 en tareas vistas y 0,0814 en retenidas, lo que permite usar las probabilidades para umbrales y no solo el argmax.
- Modo "system one" de una sola pasada: no hay cadena de razonamiento intermedia ni generación de texto abierto.
- Inferencia por lotes de alto volumen: la evaluación de regresión se midió sobre 144.226 filas y 95 tareas (67 vistas y 28 retenidas).
- Cobertura de dominios variada según las tareas evaluadas: veracidad (truthfulqa), medicina (medqa, medmcqa), detección de ironía (tweet_irony), además de las tareas de decisión del conjunto de regresión.
- Decodificación con caché de prefijo: una misma entrada de 29.033 tokens pasa de 602 ms en frío a 58 ms al repetirse.
- No soporta tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento largo según la información disponible.
- Multilingüismo: solo inglés.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo oficial de la model card envía el estado "My card was charged twice for the same purchase." con una pregunta `choice` sobre el departamento (`billing`, `technical support`, `sales`) y una pregunta `noul` sobre si requiere reembolso. El modelo devuelve ambas respuestas en una sola llamada a `POST /v1/systemone`, lo que permite integrarlo como primer paso de un flujo de atención al cliente.
- Triage de consultas médicas: sobre las tareas medqa (1.273 filas) y medmcqa (1.500 filas) del conjunto de regresión el modelo mantiene una precisión de 0,8247 en tareas vistas, suficiente para clasificar y priorizar consultas antes de derivarlas a un profesional.
- Moderación y análisis de tono: la tarea tweet_irony (784 filas) evalúa la detección de ironía, aplicable a sistemas de moderación que necesitan distinguir sarcasmo de afirmaciones literales.
- Filtrado de veracidad en respuestas generadas: la tarea truthfulqa (817 filas) permite usar el modelo como verificador de afirmaciones dudosas dentro de un pipeline más grande, con la ventaja de que su salida está calibrada (ECE 0,0312) para fijar umbrales de confianza.
- Agentes de navegador y automatización web: el checkpoint bf16 se evaluó en Mind2Web y en tareas de navegador según su tarjeta, de modo que este checkpoint puede actuar como selector de la siguiente acción en una sola pasada, con latencias de 21 ms para estados de 1.024 tokens.
- Etiquetado y codificación de datos a gran escala: con 78.054 tokens/s de prefill en estados de 1.024 tokens y 3,29 GB de pesos, es viable clasificar cientos de miles de filas (el conjunto de regresión usado tiene 144.226) en un único GPU.
- Extracción estructurada en formularios y encuestas: al aceptar varias preguntas por estado con criterios predefinidos, se puede usar para normalizar respuestas abiertas a categorías cerradas sin escribir un prompt distinto por campo.
- Decisiones de juego o simulación por turnos: la model card del bf16 menciona evaluaciones de juego; el modo de una sola pasada con un token de salida encaja en bucles de decisión con presupuesto de latencia bajo.

## Benchmarks y rendimiento

Precisión frente a los pesos bf16, medida con vLLM 0.29.0 sobre el conjunto de regresión reconstruido desde datos públicos (95 tareas, 67 vistas y 28 retenidas, 144.226 filas) y los 231 ítems públicos de JevBench:

| Version | In-task acc / NLL / ECE (67 tareas) | Held-out acc / NLL / ECE (28 tareas) | JevBench facil / estandar / dificil |
|---|---|---|---|
| bf16 | 0,8308 / 0,4146 / 0,0302 | 0,7837 / 0,5686 / 0,0773 | 48/48, 71/72, 73/111 |
| NVFP4 | 0,8247 / 0,4298 / 0,0312 | 0,7768 / 0,5933 / 0,0814 | 48/48, 70/72, 72/111 |

Desglose: la precisión cae 0,6 puntos en tareas vistas y 0,7 en retenidas; la NLL sube 0,0152 y 0,0247. Por tarea, el resultado es peor en 72, mejor en 16 e igual en 7. Las mayores caídas son truthfulqa (-3,4 en 817 filas), medqa (-3,3 en 1.273 filas), medmcqa (-3,0 en 1.500 filas) y tweet_irony (-2,2 en 784 filas). Las diferencias de uno a tres ítems en JevBench están dentro del ruido de esos conjuntos.

Rendimiento con vLLM 0.29.0 en una RTX PRO 6000 Blackwell Server Edition (96 GB), caché de prefijo desactivada, un token de salida por fila:

| Longitud del estado | bf16 tokens/s | NVFP4 tokens/s | bf16 latencia | NVFP4 latencia |
|---|---|---|---|---|
| 1.024 | 38.941 | 78.054 (x2,00) | 34 ms | 21 ms |
| 8.192 | 36.724 | 69.394 (x1,89) | 228 ms | 120 ms |
| 32.768 | 30.699 | 51.146 (x1,67) | 1.082 ms | 657 ms |

El throughput de prefill es el mejor entre tamaños de lote de 1 a 64; la latencia corresponde a una petición aislada. No se han publicado resultados de benchmarks de OpenJev, Mind2Web, navegador, juego ni Bespoke para este checkpoint cuantizado: la model card indica explícitamente que esas cifras del bf16 no se volvieron a medir.

## Requisitos de hardware

- Pesos: 3,29 GB en NVFP4 frente a 8,41 GB del checkpoint bf16.
- VRAM medida: 10,5 GB de pico sirviendo 32 peticiones concurrentes de 29.033 tokens, con `DECIDER_VLLM_GPU_MEMORY_UTILIZATION=0.08` y compartiendo la GPU con otros dos checkpoints decider. La caché KV no está cuantizada, por lo que la VRAM depende de la concurrencia y de la longitud del estado.
- GPU empleada en las mediciones: RTX PRO 6000 Blackwell Server Edition (96 GB, SM120). Es la única configuración probada.
- GPU de consumo: el peso de 3,29 GB cabría en GPUs con 8 GB o más de VRAM, pero la ejecución requiere soporte de kernels NVFP4 (Blackwell, SM120) y vLLM 0.29.0; no hay mediciones publicadas en Ampere, Ada ni otras arquitecturas, por lo que el comportamiento en GPUs de consumo anteriores a Blackwell es no disponible.
- Despliegue: vLLM 0.29.0 con el paquete del autor, `pip install "decider-ai[serve]==1.6.0" vllm==0.29.0 ninja`, y arranque con `DECIDER_MODEL=llmtech/decider-4b-nvfp4 uvicorn decider.serve_vllm:app --port 8000`. El endpoint es `POST /v1/systemone`.
- `transformers` por sí solo no ejecuta los pesos NVFP4; hay que usar vLLM. No se ha medido con TensorRT-LLM ni con SGLang. No hay soporte documentado para llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: 21 ms de latencia para un estado de 1.024 tokens y 657 ms para 32.768; 78.054 tokens/s de prefill en estados de 1.024 y 51.146 en 32.768. Con caché de prefijo, un estado de 29.033 tokens tarda 58 ms si se repite frente a 602 ms en frío.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Precision (in-task / held-out) | Latencia 1.024 / 32.768 | Licencia |
|---|---|---|---|---|---|
| llmtech/decider-4b-nvfp4 | 2,42 mil millones | NVFP4, 3,29 GB | 0,8247 / 0,7768 | 21 ms / 657 ms | Apache 2.0 |
| Mapika/decider-4b (bf16) | 2,42 mil millones | bf16, 8,41 GB | 0,8308 / 0,7837 | 34 ms / 1.082 ms | Apache 2.0 |
| Mapika/decider-35b-a3b-nvfp4 | no disponible | NVFP4, mismas exclusiones de cuantización | no disponible | no disponible | Apache 2.0 |

Frente al checkpoint bf16 del mismo autor, la versión NVFP4 sacrifica 0,6 puntos en tareas vistas y 0,7 en retenidas a cambio de un 40 % menos de espacio, el doble de velocidad con estados de 1.024 tokens y un 39 % menos de latencia con estados de 32.768. La comparación con modelos de clasificación de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización cuesta 0,6 puntos de precisión en tareas vistas y 0,7 en retenidas respecto a bf16 en el mismo motor, con un aumento de NLL de 0,0152 y 0,0247.
- En ítems limítrofes el argmax puede diferir del bf16: en JevBench la coincidencia por nivel fue del 95 % al 100 %, y en una comprobación puntual el modelo dio una respuesta distinta a la del bf16 en una pregunta que este había respondido con 0,62 de confianza. No conviene tratar la salida como determinista entre versiones.
- Solo se volvieron a medir el conjunto de regresión y los ítems públicos de JevBench; las cifras de OpenJev, Mind2Web, navegador, juego y Bespoke del checkpoint bf16 no se reevaluaron. No hay garantía de que se mantengan.
- Las mediciones se hicieron únicamente con vLLM 0.29.0 sobre RTX PRO 6000 Blackwell; no hay datos con TensorRT-LLM, SGLang ni otras GPUs.
- Idiomas: solo inglés. No hay soporte declarado de otros idiomas, lo que limita su uso en despliegues multilingües.
- Riesgo de alucinación: al ser un clasificador sobre texto libre, puede producir etiquetas plausibles pero incorrectas en entradas ambiguas o fuera de la distribución de entrenamiento, sin que exista una señal de abstención documentada más allá de la calibración.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de equidad en la información disponible. Las caídas de precisión se concentran en tareas médicas y de detección de ironía, por lo que su uso en esos dominios requiere validación propia.
- Etiquetado engañoso en HuggingFace: entre las etiquetas del repositorio figura `8-bit`, que no se corresponde con la cuantización NVFP4 de 4 bits descrita en la model card.
- Restricciones de licencia: Apache 2.0, sin restricciones de uso comercial conocidas. La model card atribuye el modelo y su entrenamiento a Mapika y la cuantización y medición a LLM Tech; conviene conservar ambas atribuciones.
- Producción: la tarjeta advierte de que `transformers` no ejecuta estos pesos y de que el checkpoint solo se ha probado con vLLM sobre Blackwell, lo que acota las plataformas de despliegue válidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmtech/decider-4b-nvfp4
- Modelo base bf16: https://huggingface.co/Mapika/decider-4b
- Repositorio de Mapika en GitHub: https://github.com/Mapika/decider
- Checkpoint relacionado decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- LLM Tech (autor de la cuantización): https://llmtech.eu
- Documentación de NVIDIA ModelOpt: no disponible en la información proporcionada
- Enlace a JevBench: no disponible en la información proporcionada
