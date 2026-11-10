# litert-community/Qwen2.5-1.5B-Instruct

## Resumen

litert-community/Qwen2.5-1.5B-Instruct es una distribución del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen, adaptada y empaquetada por la comunidad LiteRT (antes TFLite) de Google para su despliegue en dispositivos Android, iOS y web mediante la pila LiteRT, la API MediaPipe LLM Inference (en modo solo mantenimiento) y LiteRT-LM. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del modelo base a formatos ejecutables en el edge (.task para MediaPipe, .litertlm para LiteRT-LM), con cuantización dinámica int8 y variantes de longitud de contexto.

El modelo resuelve el problema de llevar un LLM de chat de 1.500 millones de parámetros a teléfonos y dispositivos móviles con un consumo de memoria contenido (en torno a 1,6 GB de pesos en int8 y un pico de RSS de aproximadamente 1,8-2,2 GB según backend y contexto). Es relevante ahora porque la pila LiteRT-LM está recibiendo soporte activo y porque el modelo base Qwen2.5-1.5B-Instruct ofrece un equilibrio razonable entre calidad de chat, seguimiento de instrucciones y huella de memoria para hardware móvil.

La ficha describe las variantes publicadas en el repositorio, su rendimiento medido en un Samsung S25 Ultra y las consideraciones prácticas para integrarlo en aplicaciones Android o iOS. La información sobre benchmarks de calidad del modelo base no se incluye en la model card de esta distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); empaquetada para LiteRT/MediaPipe/LiteRT-LM |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1280 o 4096 tokens segun variante publicada (ekv1280 / ekv4096) |
| Tipos de cuantizacion | fp32 (baseline) y dynamic_int8 (q8) |
| Idiomas soportados | no disponible en la model card de esta distribucion |
| Licencia | Apache 2.0 |
| Formato de pesos | .task (MediaPipe) y .litertlm (LiteRT-LM); tamano de repo 67,6 GB por acumulacion de variantes |
| Libreria | litert-lm |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Backends soportados | CPU y GPU en Android (segun tabla de rendimiento) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. Esta distribucion no reentrena el modelo: aplica conversiones y cuantizacion para que sea ejecutable en la pila LiteRT. Se publican variantes con cuantizacion fp32 y dynamic_int8, y con dos longitudes de contexto efectivas (1280 y 4096 tokens, codificadas en el nombre del fichero como ekv1280 y ekv4096). Las variantes int8 reducen el tamano del modelo a aproximadamente 1.598 MB frente a los 6.182 MB de la version fp32.

La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO; esa informacion corresponde a la model card del modelo base Qwen2.5-1.5B-Instruct y no se reproduce aqui. La innovacion tecnica de esta distribucion es el empaquetado para edge: firmas de prefill multiples (multi-prefill-seq) que aceleran la fase de prefill en GPU movil, y ficheros optimizados para LiteRT-LM 0.18.0 o superior.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas en formato chat multi-turno.
- Generacion de codigo y tareas de texto estructurado, segun las capacidades del modelo base.
- Ejecucion local en dispositivo (on-device) sin conexion a red, lo que permite privacidad por diseno.
- Soporte de inferencia en CPU y GPU en Android a traves de LiteRT-LM y MediaPipe LLM Inference.
- Integracion en aplicaciones Android mediante la dependencia `com.google.ai.edge.litertlm:litertlm-android`.
- Capacidades multilingues: no disponibles en la model card de esta distribucion (dependen del modelo base).
- Tool calling, agentes y modos de razonamiento extendido: no documentados en esta model card.

## Casos de uso

- Asistente de chat on-device en Android: integrar el fichero `.litertlm` con LiteRT-LM en una app movil para ofrecer un asistente conversacional que funciona sin conexion, con contexto de hasta 4096 tokens y un pico de memoria de aproximadamente 2,2 GB en CPU.
- Procesamiento de texto privado en el dispositivo: resumir notas, correos o mensajes sin enviar datos a un servidor, aprovechando que la inferencia ocurre localmente con cuantizacion int8.
- Funciones de autocompletado y redaccion en apps de productividad movil: usar la variante de contexto 1280 con prefill rapido en GPU (hasta 1.667 tk/s medidos) para sugerencias de texto de baja latencia.
- Clasificacion y extraccion de informacion en local: ejecutar tareas de etiquetado o extraccion de entidades sobre textos cortos en el propio telefono, reduciendo costes de backend.
- Prototipado rapido con Colab: validar prompts y flujos de LiteRT-LM en un notebook antes de trasladarlos a un dispositivo real, teniendo en cuenta que el rendimiento en Colab puede ser peor que en movil.
- Demos y aplicaciones educativas: usar la Edge Gallery App de Google para probar el modelo sin escribir codigo y evaluar su comportamiento en un dispositivo Android real.
- Integracion en apps iOS mediante la guia de MediaPipe LLM Inference (en modo solo mantenimiento), para escenarios donde se prefiera esa pila.

## Benchmarks y rendimiento

Rendimiento medido en un Samsung S25 Ultra con firmas multi-prefill habilitadas (datos de la model card):

| Backend | Cuantizacion | Contexto | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Tamano modelo (MB) | Pico RSS (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU | fp32 (baseline) | 1280 | 49,50 | 10,00 | 21,25 | 6182 | 6254 | N/A |
| CPU | dynamic_int8 | 1280 | 297,58 | 34,25 | 3,71 | 1598 | 1997 | N/A |
| CPU | dynamic_int8 | 4096 | 162,72 | 26,06 | 6,57 | 1598 | 2216 | N/A |
| GPU | dynamic_int8 | 1280 | 1667,75 | 30,88 | 3,63 | 1598 | 1846 | 1505 |
| GPU | dynamic_int8 | 4096 | 933,45 | 27,30 | 4,77 | 1598 | 1846 | 1505 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores son de rendimiento de inferencia en hardware movil, no de calidad.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,6 GB para los pesos int8; pico de RSS de 1.846-2.216 MB segun backend y contexto. La variante fp32 requiere unos 6,2 GB.
- GPU recomendadas: no aplica en el sentido de servidor; el objetivo es GPU integrada movil (Adreno en el Samsung S25 Ultra usado en las mediciones). En escritorio no se documentan GPU de referencia.
- Cabe en consumer GPU: si, en cualquier GPU de consumo con al menos 8 GB de VRAM si se ejecuta la variante int8 mediante una pila compatible; no obstante, el destino optimizado es movil.
- Opciones de despliegue: LiteRT-LM (Android, recomendado, requiere 0.18.0 o superior), MediaPipe LLM Inference API (solo mantenimiento), Edge Gallery App para pruebas, y guias de LiteRT para iOS y web.
- Latencia y throughput: en Samsung S25 Ultra, TTFT de 3,63-6,57 s y decode de 26-34 tk/s en las variantes int8; prefill de hasta 1.667 tk/s en GPU con contexto 1280.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino | Notas |
|---|---|---|---|---|---|
| litert-community/Qwen2.5-1.5B-Instruct | 1,5B | 1280 / 4096 (variantes) | Apache 2.0 | .task / .litertlm para LiteRT | Distribucion edge del modelo Qwen |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Apache 2.0 | safetensors (Hugging Face) | Modelo base original, pensado para servidor/GPU |
| Otros modelos edge de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparativa se limita al modelo base por falta de datos de alternativas edge equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Modelo de 1,5B parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos mayores; riesgo de alucinacion en preguntas abiertas.
- Contexto limitado a 1280 o 4096 tokens segun variante, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no documentados en esta model card; el comportamiento multilingue depende del modelo base y no se garantiza.
- La cuantizacion dynamic_int8 puede degradar ligeramente la calidad respecto a fp32; no se publican metricas de esa degradacion.
- MediaPipe LLM Inference API esta en modo solo mantenimiento; para nuevos desarrollos se recomienda LiteRT-LM.
- El rendimiento en Colab puede ser notablemente peor que en dispositivo movil; las cifras de la tabla corresponden a un Samsung S25 Ultra concreto.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen2.5-1.5B-Instruct y de las dependencias de LiteRT.
- El repositorio ocupa 67,6 GB por acumular multiples variantes; descargar solo el fichero necesario para el dispositivo objetivo.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento extendido; no asumirlas en produccion sin validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- LiteRT (antes TFLite): https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Guia LiteRT-LM para Android: https://ai.google.dev/edge/litert-lm/android
- Guia LLM Inference para iOS: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/ios
- Edge Gallery App (GitHub): https://github.com/google-ai-edge/gallery
- Edge Gallery App (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/Qwen2.5-1.5B-Instruct/blob/main/notebook.ipynb
