# JonathanColetti/Qwen3.8-27B-Uncensored-GGUF

## Resumen

El modelo Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada y con el comportamiento de rechazo reducido del modelo Qwen3.8-27B de Qwen, publicada por JonathanColetti. Su objetivo es eliminar de forma sustancial las respuestas de rechazo del modelo original ante peticiones que considera inapropiadas, manteniendo intactas sus capacidades generales. Para ello se emplea la técnica de abliteración con la herramienta Heretic, que identifica y elimina direcciones de rechazo en los pesos sin necesidad de fine-tuning ni datos adicionales. El resultado se distribuye en formato GGUF para su uso con llama.cpp, conservando la cabeza de predicción multi-token (MTP) para decodificación especulativa.

El modelo base tiene 27.320 millones de parámetros, 64 capas, un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Incluye además una torre de visión para entrada de imágenes. Se ofrecen cinco niveles de cuantización (IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0), cada uno disponible con o sin la cabeza MTP integrada. Las evaluaciones 0-shot muestran una degradación media de solo -0,5 puntos respecto al modelo base en tareas de razonamiento y lenguaje, dentro del margen de error estadístico, lo que indica que la edición de pesos apenas afecta al rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, 64 capas, vocab 248320) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (formato GGUF) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con archivos separados para target y draft MTP |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.300 millones de parametros con 64 capas y un vocabulario de 248.320 tokens. Incluye una cabeza de prediccion multi-token (MTP) de 1 capa que permite decodificacion especulativa: el modelo genera varios tokens por paso y el token objetivo los verifica. Tambien incorpora una torre de vision (mmproj) para entrada de imagenes, aunque la model card no detalla su arquitectura especifica.

El proceso de "desensurado" se realizo mediante abliteracion con la herramienta Heretic, que co-minimiza el numero de rechazos frente a la divergencia KL con el modelo base. No se uso fine-tuning ni datos adicionales. La abliteracion se ejecuto en bf16 (sin cuantizacion intermedia) y el LoRA resultante se fusiono en el modelo base bf16. Los tensores `mtp.*` se copiaron directamente del checkpoint base tras la fusion, ya que la abliteracion no los modifica. La cabeza draft se entreno contra el modelo sin modificar, por lo que la tasa de aceptacion puede caer ligeramente, pero la decodificacion especulativa verifica cada token contra el objetivo, por lo que la calidad de salida no se ve afectada.

La cuantizacion se realizo con llama.cpp (commit `a94d563ed`) y la matriz de importancia (imatrix) se calculo directamente desde el f16, usando wikitext-2 raw con 200 chunks. Cada archivo se verifico post-cuantizacion para confirmar la presencia de los tensores MTP.

## Capacidades

- Generacion de texto en ingles y chino, con razonamiento y comprension de lenguaje natural.
- Razonamiento de varios pasos (multi-step reasoning) gracias a la arquitectura transformer de 27B.
- Soporte de vision: el modelo incluye una torre de vision (mmproj) para entrada de imagenes, aunque la model card no detalla las tareas especificas de vision.
- Decodificacion especulativa integrada: la cabeza MTP permite acelerar la inferencia generando multiples tokens por paso, con verificacion del token objetivo.
- Tool calling / function calling: no se menciona explicitamente en la model card; se desconoce si el modelo base lo soporta.
- Capacidades multilingues limitadas a ingles y chino (segun la model card).
- Comportamiento "uncensored": reduccion sustancial de rechazos a peticiones que el modelo base rechazaria, aunque no eliminados por completo.

## Casos de uso

- Asistencia conversacional sin restricciones: el modelo puede mantener dialogos multi-turno sobre temas que el modelo base rechazaria, como discusion de temas controvertidos o contenido para adultos, siempre que se respete la legalidad. Su contexto de 256K permite manejar conversaciones largas.
- Generacion de codigo con decodificacion especulativa: gracias a la cabeza MTP, la inferencia es mas rapida, lo que lo hace adecuado para entornos de desarrollo donde se necesita completar codigo de forma interactiva.
- Analisis de documentos largos: con 262.144 tokens de contexto, puede procesar libros completos, informes extensos o transcripciones largas en una sola pasada.
- Investigacion en seguridad de IA: el modelo sirve como caso de estudio para evaluar el impacto de la abliteracion en el rendimiento y el comportamiento, comparando con el modelo base.
- Creacion de contenido creativo sin censura: escritores y guionistas pueden explorar temas sensibles sin que el modelo se niegue a responder, manteniendo la calidad del texto.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ4_XS y Q4_K_M (15-17 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3090 o 4090, aunque con contexto reducido.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion 0-shot con lm-evaluation-harness, comparando el modelo uncensored con el base en bf16:

| Tarea | Base | Uncensored | Δ |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | -0,2 |
| ARC-Challenge | 58,9 | 57,7 | -1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | -0,8 |
| Media | | | -0,5 |

Todos los deltas estan dentro o cerca del error estandar reportado (MMLU ±0,30, ARC ±1,44, HellaSwag ±0,38, Winogrande ±1,21), por lo que no son estadisticamente significativos. Tambien se reporta perplejidad (PPL) en wikitext-2 para la cuantizacion Q4_K_M: 7,1814 ± 0,25227. No se proporcionan benchmarks de codigo, matematicas o vision.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, los archivos van de 15,1 GB (IQ4_XS sin MTP) a 29,0 GB (Q8_0 con MTP). Para contexto completo de 256K se necesitaria VRAM adicional para el KV cache; con contexto reducido (por ejemplo, 8K) cabe en GPUs de 24 GB.
- GPUs recomendadas: para Q4_K_M (16,8 GB) se necesita al menos una RTX 3090/4090 (24 GB) o A10G; para Q8_0 (29 GB) se requiere una A100 40GB o H100. En consumer, la RTX 4090 puede manejar Q5_K_M (19,5 GB) con contexto moderado.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), compatible con vLLM y Ollama si se convierten los GGUF, aunque la model card solo menciona llama.cpp. Tambien se puede usar con el runtime de Hugging Face (endpoints_compatible).
- Latencia y throughput: no se proporcionan mediciones directas, pero la decodificacion especulativa con MTP puede mejorar el throughput entre 1,5x y 3x dependiendo del hardware y la longitud de draft (ver dataset de benchmark enlazado).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la model card. Se puede comparar con el modelo base Qwen3.8-27B (misma arquitectura, sin abliteracion) y con otros modelos uncensored de tamaño similar como Dolphin 2.5 (basado en Llama) o Nous Hermes, pero no hay datos cuantitativos de estos en la informacion proporcionada. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El comportamiento "uncensored" no es absoluto: la model card indica que el rechazo se ha reducido sustancialmente, no eliminado. Algunas peticiones pueden seguir siendo rechazadas.
- La abliteracion puede introducir sesgos o comportamientos impredecibles en dominios sensibles. No se han realizado evaluaciones de seguridad o sesgo en esta version.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de idioma: solo ingles y chino; no soporta otros idiomas de forma nativa.
- La cabeza MTP puede tener una tasa de aceptacion reducida porque se entreno contra el modelo sin modificar; esto puede afectar al rendimiento de la decodificacion especulativa.
- El contexto de 256K requiere mucha memoria para el KV cache; en GPUs de consumo se recomienda reducir el contexto a 8K-16K.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias restricciones (aunque Qwen suele usar Apache 2.0 tambien). Se debe verificar la licencia del modelo base.
- No se han publicado evaluaciones de seguridad, sesgo o robustez para esta version uncensored.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset de benchmark de decodificacion especulativa: https://huggingface.co/datasets/JonathanColetti/qwen3.8-spec-decode-bench
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
