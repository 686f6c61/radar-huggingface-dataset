# lokeshe09/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización en formato NVFP4 (4 bits en punto flotante de NVIDIA) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario lokeshe09 en Hugging Face. El objetivo es reducir el tamaño y el coste computacional del modelo original, que cuenta con 27 000 millones de parámetros, para facilitar su despliegue en entornos con recursos limitados, como GPUs de consumo o instancias en la nube con VRAM restringida.

La cuantización se ha realizado con la librería llm-compressor del proyecto vLLM, mediante calibración *oneshot*, y mantiene en precisión original el vision encoder, las capas de atención *gated-delta* (conv1d / linear_attn), la cabeza de salida (`lm_head`), las embeddings y las capas de normalización. Esto preserva la calidad en las partes más sensibles del modelo mientras se comprime el resto de los pesos.

El modelo resultante es un checkpoint en formato safetensors, con un tamaño de repositorio de 26,8 GB, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Es relevante porque ofrece una vía práctica para ejecutar un modelo multimodal de gran tamaño en hardware más asequible, manteniendo la arquitectura original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + gated-delta attention) |
| Parametros totales | 27 000 millones (modelo base); pesos cuantizados: 18 675 163 136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa tanto imágenes como texto. Su arquitectura incluye un vision encoder para la entrada de imágenes y un mecanismo de atención *gated-delta* que combina convoluciones 1D y atención lineal, lo que reduce el coste computacional frente a la atención completa. La cuantización NVFP4 se aplicó sobre este modelo sin modificar su arquitectura, utilizando la herramienta llm-compressor con calibración *oneshot* sobre un conjunto de datos de referencia.

No se ha realizado ningún entrenamiento adicional; se trata exclusivamente de una compresión de los pesos. Las capas críticas (vision encoder, atención gated-delta, `lm_head`, embeddings y normalización) se mantienen en su precisión original (probablemente FP16 o BF16) para minimizar la pérdida de calidad. El proceso de cuantización es el estándar para NVFP4, que almacena los pesos en un formato de 4 bits con exponente y mantisa reducidos, optimizado para las GPUs NVIDIA con soporte FP4 (arquitecturas Blackwell y posteriores).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que incluye comprensión de lenguaje natural, razonamiento lógico y matemático, y generación de código.
- Procesamiento multimodal: al mantener el vision encoder en precisión original, el modelo puede recibir imágenes como entrada y responder preguntas sobre ellas, realizar descripciones o extraer información visual.
- Conversación multi-turno: el modelo base está diseñado para diálogos extensos, aunque la longitud de contexto no se ha especificado en la información disponible.
- Tool calling y function calling: el modelo base Qwen3.8-27B soporta invocación de herramientas, y esta capacidad se conserva en la versión cuantizada, aunque no se han publicado pruebas específicas.
- Multilingüismo: no se han indicado los idiomas soportados, pero el modelo base de Qwen suele cubrir múltiples lenguas, incluido el español.

## Casos de uso

- Despliegue de un asistente multimodal en una GPU de consumo: gracias a la cuantización NVFP4, el modelo puede ejecutarse en una RTX 4090 (24 GB VRAM) o similar, permitiendo a desarrolladores integrar capacidades de visión y lenguaje en aplicaciones locales sin depender de servicios en la nube.
- Automatización de atención al cliente con soporte visual: el modelo puede analizar capturas de pantalla o imágenes de productos y responder consultas de usuarios en un chat, manteniendo el contexto de la conversación.
- Generación de código asistida por imágenes: un desarrollador puede subir un diagrama o una captura de una interfaz y pedir al modelo que genere el código correspondiente, aprovechando la entrada multimodal.
- Análisis de documentos escaneados: el modelo puede extraer información de imágenes de documentos, facturas o formularios, combinando OCR implícito con razonamiento textual.
- Prototipado rápido de aplicaciones de IA: al ser un checkpoint ligero, permite iterar rápidamente en entornos de desarrollo con recursos limitados, como portátiles con GPU de 16 GB.
- Investigación en cuantización multimodal: sirve como referencia para estudiar el impacto de NVFP4 en tareas de visión y lenguaje, comparando con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta cuantización específica. Se recomienda consultar el modelo base Qwen/Qwen3.8-27B para obtener referencias de rendimiento en su versión sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 26,8 GB en disco, pero al ser pesos de 4 bits, la memoria necesaria en GPU se estima en torno a 10-12 GB para cargar el modelo completo, más overhead de activaciones y contexto. Una GPU con 16 GB de VRAM debería ser suficiente para inferencia básica.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB o 80 GB), H100 (80 GB). Para aprovechar NVFP4 de forma óptima, se requieren GPUs con soporte FP4 nativo, como las arquitecturas Blackwell (B200, RTX 50 series). En GPUs sin soporte FP4, el modelo podría ejecutarse con emulación, pero con menor rendimiento.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de consumo con 16 GB o más, siempre que el framework utilizado soporte el formato NVFP4.
- Opciones de despliegue: vLLM (que es el ecosistema de llm-compressor), así como otros frameworks que soporten compressed-tensors. No se ha confirmado compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependerán del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otras cuantizaciones del mismo modelo base (por ejemplo, AWQ o GPTQ) ni con modelos de tamaño similar. La información proporcionada no incluye datos de rendimiento ni de otras versiones cuantizadas de Qwen3.8-27B. Se recomienda consultar el repositorio del modelo base para obtener referencias.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir una degradación en la precisión, especialmente en tareas de razonamiento complejo, matemáticas o generación de código, en comparación con el modelo original en FP16/BF16.
- No se han publicado evaluaciones de calidad ni pruebas de robustez para esta cuantización específica; el rendimiento real puede variar según la tarea.
- El formato NVFP4 requiere hardware compatible (GPUs NVIDIA con soporte FP4) para obtener el máximo rendimiento; en GPUs más antiguas, la inferencia podría ser más lenta o requerir conversión.
- La longitud de contexto no se ha especificado; se desconoce si la cuantización afecta a la ventana de contexto máxima del modelo base.
- No se han indicado los idiomas soportados; aunque el modelo base de Qwen suele ser multilingüe, no hay garantía de cobertura completa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B, ya que podría haber condiciones adicionales.
- El modelo no ha sido validado en producción; se recomienda realizar pruebas exhaustivas antes de desplegarlo en entornos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lokeshe09/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
