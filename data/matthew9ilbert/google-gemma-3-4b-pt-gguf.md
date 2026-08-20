# matthew9ilbert/google.gemma-3-4b-pt-GGUF

## Resumen

El modelo `matthew9ilbert/google.gemma-3-4b-pt-GGUF` es una versión cuantizada en formato GGUF del modelo base multimodal `google/gemma-3-4b-pt`, desarrollado por Google. Esta cuantización, creada por el usuario matthew9ilbert, tiene como objetivo facilitar el despliegue del modelo en entornos con recursos limitados, como equipos de consumo o servidores sin GPUs de alta gama. El modelo base es un transformer multimodal que procesa entradas de texto e imagen para generar texto, con 4 mil millones de parámetros y una ventana de contexto de 128.000 tokens. La cuantización reduce el tamaño del modelo manteniendo, en la medida de lo posible, sus capacidades originales, aunque el repositorio no especifica las variantes de cuantización disponibles ni su licencia exacta.

Al tratarse de una versión GGUF, el modelo está optimizado para su uso con librerías como llama.cpp, Ollama o vLLM, lo que lo hace accesible para inferencia en CPU o GPU de baja VRAM. Sin embargo, es importante señalar que el modelo base es una variante de preentrenamiento (`pt`), no de instrucciones (`it`), por lo que no está alineado para tareas de chat ni para seguir instrucciones complejas sin un ajuste fino posterior. Aun así, conserva las capacidades multimodales de la familia Gemma 3, lo que lo hace útil para tareas de generación de descripciones de imágenes, clasificación visual y otras aplicaciones de visión-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) |
| Parametros totales | 3.880.099.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | No disponible (repositorio GGUF sin especificar variantes) |
| Idiomas soportados | No disponible (modelo base: más de 140 idiomas) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-4b-pt` es un transformer multimodal con decodificador, entrenado sobre 4 billones de tokens que incluyen documentos web, código, matemáticas e imágenes. Su arquitectura incorpora módulos de visión para procesar imágenes junto con texto, y genera respuestas de hasta 8.192 tokens. La cuantización GGUF es una técnica de compresión que reduce la precisión de los pesos (por ejemplo, de FP16 a Q4 o Q8) para disminuir el uso de memoria y acelerar la inferencia, manteniendo un equilibrio entre fidelidad y rendimiento. No se han publicado detalles sobre el proceso específico de cuantización de esta versión, como el tipo de cuantización (Q4_K_M, Q5_0, etc.) ni si se ha realizado calibración adicional. El repositorio no incluye información sobre el conjunto de datos de entrenamiento de la cuantización ni sobre técnicas de alineamiento (RLHF, DPO), ya que se trata de una transformación de pesos del modelo original.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto, como descripciones de imágenes, respuesta a preguntas visuales y resumen de contenido gráfico.
- Razonamiento básico sobre escenas visuales y texto, aprovechando la arquitectura multimodal del modelo base.
- Procesamiento de contexto largo de hasta 128.000 tokens, lo que permite analizar documentos extensos o conversaciones largas.
- Soporte multilingüe del modelo base, que abarca más de 140 idiomas, aunque la cuantización no altera esta capacidad.
- No incluye soporte de tool calling ni de agentes, ya que es un modelo de preentrenamiento sin ajuste de instrucciones.
- No presenta modo de pensamiento (thinking mode) ni capacidades de audio; es exclusivamente texto e imagen a texto.

## Casos de uso

- **Generación de descripciones de imágenes en entornos de documentación**: el modelo puede procesar una imagen y generar un texto descriptivo, útil para automatizar el etiquetado de imágenes en bases de datos o generar accesibilidad para personas con discapacidad visual. Gracias a su contexto de 128K, puede manejar imágenes con múltiples detalles y generar descripciones extensas.
- **Clasificación de imágenes con texto**: se puede emplear para asignar categorías a imágenes mediante una entrada de texto que especifica las categorías, y el modelo genera la etiqueta correspondiente. Es adecuado para sistemas de moderación de contenido o organización de galerías.
- **Extracción de información de documentos escaneados**: al combinar una imagen de un documento (factura, formulario) con una consulta textual, el modelo puede extraer campos específicos como fechas, números o nombres. La ventana de contexto permite procesar documentos largos.
- **Generación de subtítulos para vídeos**: utilizando fotogramas de vídeo como entrada, el modelo puede generar subtítulos descriptivos en varios idiomas, facilitando la indexación de contenido audiovisual.
- **Asistencia en investigación de campo**: investigadores pueden capturar imágenes de especímenes o entornos y obtener descripciones técnicas automáticas, apoyando la documentación de estudios científicos.
- **Base para ajuste fino (fine-tuning)**: dado que es un modelo base, se puede utilizar como punto de partida para entrenar modelos especializados en tareas de visión y lenguaje, como sistemas de diagnóstico médico por imagen o asistentes de navegación para personas con discapacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otras cuantizaciones. Para evaluar la calidad de esta versión cuantizada, se recomienda consultar los resultados del modelo base `google/gemma-3-4b-pt` en los documentos oficiales de Google, aunque no se han facilitado aquí.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización GGUF típica de un modelo de ~3.9B parámetros, el tamaño de pesos puede variar entre ~2.5 GB (Q4) y ~7 GB (Q8). Se recomienda un mínimo de 8 GB de VRAM para inferencia con cuantización media (Q4/Q5) y 16 GB para cuantizaciones más altas o uso con contexto largo.
- **GPU recomendadas**: GPUs de consumo como la NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) son suficientes para la mayoría de cuantizaciones. Para entornos de producción, se recomienda una A100 (40 GB) o H100 (80 GB) si se necesitan altas velocidades de inferencia con múltiples peticiones.
- **Compatibilidad con GPU de consumo**: sí, las versiones GGUF están diseñadas para ejecutarse en GPUs de bajo VRAM, incluso en CPU. La mayoría de las cuantizaciones Q4 y Q5 caben en GPUs de 6-8 GB, como la RTX 3060 o la GTX 1660.
- **Opciones de despliegue**: se puede usar con llama.cpp, Ollama, vLLM, TGI (Text Generation Inference) o cualquier framework que soporte GGUF. Ollama ofrece una integración sencilla para ejecución local.
- **Latencia y throughput**: no se dispone de datos específicos. En una GPU RTX 4090 con cuantización Q4, se podría esperar una velocidad de generación de entre 30 y 60 tokens por segundo, pero no hay cifras confirmadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-3-4b-pt (base) | 3.88B | 128K | Sí (imagen+texto) | Gemma Terms of Use | Safetensors |
| matthew9ilbert/google.gemma-3-4b-pt-GGUF | 3.88B | 128K | Sí (imagen+texto) | No disponible | GGUF |
| Qwen2.5-3B-Instruct | 3.09B | 32K | No | Apache 2.0 | Safetensors, GGUF |
| Llama-3.2-3B | 3.21B | 8K | No | Llama 3 License | Safetensors, GGUF |

La comparación se basa en el tamaño de parámetros y el contexto. El modelo Gemma 3 destaca por su multimodalidad y su ventana de 128K, mientras que los otros modelos son solo de texto y con contexto menor. No se dispone de datos de rendimiento para esta cuantización, pero el modelo base de Gemma 3 supera típicamente a modelos de tamaño similar en tareas de razonamiento y visión en los benchmarks oficiales de Google.

## Limitaciones y advertencias

- **Modelo de preentrenamiento**: al ser una variante `pt`, no está alineado para seguir instrucciones ni para mantener conversaciones coherentes. Su uso directo en aplicaciones de chat o asistentes requiere un ajuste fino previo.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar contenido sesgado o inventado, especialmente en tareas de razonamiento complejo. El modelo base fue entrenado con datos de internet, por lo que hereda sesgos de género, etnia y cultura.
- **Limitaciones de idioma**: aunque el modelo base soporta más de 140 idiomas, el rendimiento puede ser desigual en idiomas de baja representación en los datos de entrenamiento. La cuantización no mejora esta limitación.
- **Restricciones de licencia**: la licencia exacta de esta cuantización no está especificada. El modelo base `google/gemma-3-4b-pt` está bajo la Licencia Gemma de Google, que permite uso comercial con restricciones (como no usar para fines militares o de vigilancia). Se recomienda revisar la licencia oficial antes de desplegar el modelo en producción.
- **Riesgo de degradación por cuantización**: aunque GGUF mantiene una buena fidelidad, la cuantización puede reducir ligeramente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código. Se debe validar el comportamiento en el caso de uso concreto.
- **Contexto largo**: aunque el modelo soporta 128K tokens, en la práctica el uso de contextos muy largos puede aumentar el consumo de memoria y la latencia, y puede provocar pérdida de rendimiento si no se usa con técnicas de atención eficiente.

## Enlaces

- Repositorio HuggingFace: [matthew9ilbert/google.gemma-3-4b-pt-GGUF](https://huggingface.co/matthew9ilbert/google.gemma-3-4b-pt-GGUF)
- Modelo base: [google/gemma-3-4b-pt](https://huggingface.co/google/gemma-3-4b-pt)
- Documentación oficial de Gemma: [Gemma models overview - Google AI for Developers](https://ai.google.dev/gemma/docs)
- Página de Gemma 4 (referencia a la familia): [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- Ejemplo de cuantización oficial de Google: [google/gemma-3-4b-it-qat-q4_0-gguf](https://huggingface.co/google/gemma-3-4b-it-qat-q4_0-gguf)
