# chingisbadmaev/gemma-3-27b-it-int4-awq

## Resumen

Este repositorio contiene una conversión no oficial del modelo Gemma 3 27B Instruction-tuned de Google DeepMind, cuantizado a INT4 mediante QAT (quantization-aware training) y empaquetado en formato AWQ para su uso directo con Hugging Face Transformers y text-generation-inference. El autor, chingisbadmaev, ha convertido el checkpoint Flax INT4 publicado en Kaggle al formato HF+AWQ, aclarando explícitamente que AWQ no se utilizó como método de cuantización, sino como contenedor de los pesos ya cuantizados.

El modelo base, Gemma 3 27B IT, es un transformer multimodal que acepta texto e imágenes como entrada y genera texto, con una ventana de contexto de 128K tokens, soporte para más de 140 idiomas y una arquitectura optimizada para reducir el uso de memoria de la KV-cache en contextos largos. Esta versión cuantizada reduce significativamente el requisito de VRAM respecto al modelo en bfloat16, lo que permite ejecutarlo en GPUs de consumo o en entornos con recursos limitados, manteniendo las capacidades del modelo original con una pérdida de precisión mínima.

La relevancia de esta conversión radica en que facilita el despliegue de un modelo de 27B parámetros multimodal en hardware asequible, sin necesidad de infraestructura de servidor dedicada. Al estar en formato AWQ, es compatible con las principales herramientas de inferencia del ecosistema, como vLLM, TGI y Transformers, lo que simplifica su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con encoder de vision |
| Parametros totales | 27.432.406.640 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens de entrada, 8192 tokens de salida |
| Tipos de cuantizacion | INT4 (QAT), empaquetado en formato AWQ |
| Idiomas soportados | Mas de 140 (segun model card del modelo base) |
| Licencia | Gemma (licencia de Google, con restricciones de uso) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 3 27B IT es un transformer decoder-only multimodal que incorpora un encoder de vision para procesar imagenes, normalizadas a 896x896 píxeles y codificadas en 256 tokens cada una. La arquitectura incluye una modificacion respecto a Gemma 2 para reducir el crecimiento de la KV-cache en contextos largos, lo que permite mantener los 128K tokens de ventana sin un aumento desproporcionado de memoria. El entrenamiento del modelo original combina preentrenamiento en un corpus multilingue y un posterior ajuste por instrucciones con tecnicas de RLHF.

Esta version concreta no ha sido entrenada por el autor del repositorio, sino que proviene de un checkpoint QAT INT4 generado por Google y publicado en Kaggle. La cuantizacion QAT integra la cuantizacion durante el entrenamiento, lo que suele producir mejores resultados que la cuantizacion post-hoc. El autor ha convertido ese checkpoint Flax al formato AWQ de Hugging Face, incluyendo el script de conversion en el repositorio. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre los hiperparametros de la cuantizacion.

## Capacidades

- Generacion de texto, razonamiento, resumen y respuesta a preguntas en mas de 140 idiomas.
- Comprension de imagenes: puede analizar fotografias, diagramas, capturas y documentos escaneados, y responder preguntas sobre su contenido.
- Razonamiento multimodal: combina informacion textual y visual para tareas como descripcion de escenas, extraccion de informacion de graficos o resolucion de problemas con soporte visual.
- Contexto largo de 128K tokens, adecuado para procesar documentos extensos, libros o conversaciones de muchas vueltas.
- Soporte de chat multi-turno con plantillas de conversacion integradas en Transformers.
- Capacidad de tool calling y function calling: no confirmada explicitamente en la informacion disponible, aunque el modelo base Gemma 3 la incluye; se recomienda verificar en la documentacion oficial.
- Generacion de codigo y asistencia en programacion, heredada del modelo base.

## Casos de uso

- Asistente de atencion al cliente multimodal: el modelo puede recibir capturas de pantalla o fotos de productos junto con la consulta del usuario, y mantener conversaciones de muchas vueltas gracias a su ventana de 128K tokens, lo que permite gestionar historiales completos de interaccion sin perder contexto.
- Analisis de documentos tecnicos con imagenes: en sectores como ingenieria o medicina, el modelo puede procesar manuales, diagramas o radiografias y responder preguntas especificas sobre su contenido, combinando la informacion visual y textual en una sola pasada.
- Generacion de codigo asistida en entornos con recursos limitados: al ser una version INT4, puede ejecutarse en una GPU de 16 GB, lo que permite integrarlo en entornos de desarrollo locales o en pipelines de CI/CD para generar y revisar fragmentos de codigo, aunque se debe validar la salida antes de usarla en produccion.
- Sistema de resumen de largas conversaciones o documentos: con 128K tokens de contexto, puede resumir libros, actas de reuniones o hilos de correo extensos, y su capacidad multimodal permite incluir graficos o tablas escaneadas en el resumen.
- Clasificacion y extraccion de informacion de imagenes en entornos industriales: el modelo puede leer etiquetas, placas de identificacion o paneles de control fotografiados y extraer datos estructurados, reduciendo la necesidad de OCR especializado.
- Chatbot educativo multilingue: al soportar mas de 140 idiomas, puede actuar como tutor en multiples lenguas, explicando conceptos con apoyo de imagenes o diagramas, y adaptandose al nivel del estudiante mediante conversaciones de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion INT4 en la informacion disponible. El modelo base Gemma 3 27B IT tiene resultados publicados en el technical report de Gemma 3 (arXiv:2503.19786), pero no se incluyen aqui al no estar disponibles en la documentacion del repositorio. Se recomienda consultar el technical report para obtener datos de MMLU, HumanEval, GSM8K y otras evaluaciones del modelo sin cuantizar.

## Requisitos de hardware

- Tamano del repositorio: 18.5 GB en disco, lo que sugiere un uso de VRAM estimado entre 18 y 20 GB durante la inferencia, incluyendo overhead de activaciones y KV-cache.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o cualquier GPU con al menos 20 GB de VRAM. En GPUs de 16 GB (como RTX 4080 o A10G) podria caber con secuencias cortas y batch reducido, pero no esta garantizado.
- No cabe en GPUs de consumo de gama baja (8 GB o menos) debido al tamano del modelo.
- Opciones de despliegue: compatible con Transformers, text-generation-inference (TGI), vLLM (con soporte AWQ) y endpoints compatibles con TGI. Tambien puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependera del hardware, el batch size y la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-3-27b-it (base) | 27.4B | 128K | bf16 | Gemma | Hugging Face |
| chingisbadmaev/gemma-3-27b-it-int4-awq (este) | 27.4B | 128K | INT4 (QAT) | Gemma | Hugging Face |
| google/gemma-3-27b-it-qat (GGUF oficial) | 27.4B | 128K | INT4 (QAT) | Gemma | Coleccion Hugging Face |

La diferencia principal entre este repositorio y el modelo base es la cuantizacion: el primero reduce el requisito de VRAM de aproximadamente 54 GB (bf16) a unos 18-20 GB, a costa de una posible perdida de precision. Respecto a los GGUF oficiales de Google, esta conversion ofrece el mismo nivel de cuantizacion pero en formato AWQ, que es mas adecuado para inferencia con vLLM o TGI, mientras que GGUF esta orientado a llama.cpp y Ollama. No se dispone de datos de rendimiento comparativo entre ambas versiones cuantizadas.

## Limitaciones y advertencias

- La cuantizacion INT4 puede introducir una degradacion en tareas de alta precision, como matematicas complejas o razonamiento logico extenso, respecto al modelo en bf16. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.
- El modelo base puede presentar sesgos presentes en sus datos de entrenamiento, que no se han documentado en detalle en la informacion disponible. Google publica un Responsible Generative AI Toolkit que incluye evaluaciones de sesgo y seguridad.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de generacion libre. La validacion humana es necesaria en aplicaciones criticas.
- La licencia Gemma de Google impone restricciones de uso comercial: no se permite utilizar el modelo para ciertos fines prohibidos (como actividades ilegales o daninas) y se requiere dar atribucion. Es obligatorio revisar los terminos completos en la pagina de licencia de Gemma.
- Este repositorio es una conversion no oficial creada por un tercero. No hay garantia de que el proceso de conversion haya preservado exactamente las capacidades del checkpoint QAT original de Kaggle. Se recomienda verificar la integridad del modelo antes de su uso.
- El modelo tiene una longitud de salida maxima de 8192 tokens, lo que limita la generacion de respuestas muy largas, aunque la entrada puede ser de hasta 128K tokens.
- No se proporcionan datos sobre el rendimiento en tareas especificas de vision (como deteccion de objetos o OCR) en esta version cuantizada.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/chingisbadmaev/gemma-3-27b-it-int4-awq
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-27b-it
- Technical report de Gemma 3: https://arxiv.org/html/2503.19786v1
- Pagina oficial de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Coleccion de GGUF QAT oficiales de Google: https://huggingface.co/collections/google/gemma-3-qat-67ee61ccacbf2be4195c265b
- Documentacion de Gemma en Google AI: https://ai.google.dev/gemma/docs/core
