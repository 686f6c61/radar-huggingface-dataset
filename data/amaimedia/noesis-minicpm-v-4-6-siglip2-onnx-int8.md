# AMAImedia/NOESIS-MiniCPM-V-4.6-SigLIP2-ONNX-INT8

## Resumen

NOESIS-MiniCPM-V-4.6-SigLIP2-ONNX-INT8 es un extractor de características de imagen basado en el vision encoder SigLIP2, extraído del modelo multimodal MiniCPM-V-4.6 de OpenBMB y cuantizado a INT8 en formato ONNX. Ha sido publicado por AMAImedia como parte de su plataforma NOESIS de doblaje profesional, donde actúa como componente auxiliar para tareas de diagnóstico visual como preparación de carteles, etiquetado de fotogramas de referencia y verificación de key-frames. No forma parte del núcleo de doblaje de audio, según las reglas internas del proyecto.

El modelo se distribuye como un único archivo ONNX de aproximadamente 465 MB, lo que permite su despliegue en entornos con recursos limitados, incluyendo CPU mediante onnxruntime. Al ser un encoder de visión puro, no incluye el modelo de lenguaje completo de MiniCPM-V-4.6, sino únicamente el componente de visión. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en pipelines de procesamiento de imágenes.

La relevancia de este modelo radica en su formato optimizado para inferencia ligera: la cuantización INT8 reduce el tamaño a aproximadamente la mitad del original BF16, manteniendo la funcionalidad de extracción de embeddings de imagen. Esto lo hace adecuado para aplicaciones de visión por computador en dispositivos edge o servidores sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 vision encoder (extraido de MiniCPM-V-4.6) |
| Parametros totales | no disponible (el encoder SigLIP2-400M del modelo base tiene ~400M, pero no se confirma para este bundle) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (encoder de vision, no procesa texto) |
| Tipos de cuantizacion | INT8 (per-channel) |
| Idiomas soportados | en, zh (idiomas del modelo base, aunque el encoder no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (vision_encoder_int8.onnx, ~465 MB) |

## Arquitectura y entrenamiento

El modelo es un vision encoder SigLIP2, un transformer de visión con atención basada en el mecanismo de atención por ventanas y entrenado con objetivos contrastivos imagen-texto. SigLIP2 es la segunda generación de la familia SigLIP, que combina las ventajas de CLIP y SigLIP para producir embeddings de imagen de alta calidad. En este bundle, el encoder ha sido extraído del modelo MiniCPM-V-4.6, que utiliza SigLIP2-400M como componente de visión junto con el LLM Qwen3.5-0.8B.

El proceso de cuantización a INT8 se realizó por canal, reduciendo el tamaño del archivo de ~996 MB (BF16) a ~465 MB, un factor de compresión de aproximadamente 2,14×. No se proporcionan detalles sobre el dataset de entrenamiento del encoder original ni sobre el proceso de cuantización específico (si se usó calibración, fine-tuning post-cuantización, etc.). El modelo se distribuye con su configuración (`config.json`), preprocesador (`preprocessor_config.json`) y una plantilla de chat heredada de MiniCPM-V, aunque esta última no es relevante para un encoder puro.

## Capacidades

- Extracción de embeddings de imagen: genera representaciones vectoriales densas de imágenes de entrada, útiles para tareas de búsqueda, similitud y clasificación.
- Preprocesamiento estándar: incluye un preprocesador que realiza resize y normalización según la configuración de SigLIP2.
- Compatibilidad con onnxruntime: puede ejecutarse en CPU, CUDA y DirectML, lo que facilita su integración en múltiples entornos.
- Soporte para imágenes RGB: acepta imágenes en formato RGB, como se muestra en el ejemplo de uso con PIL.
- Integración con Hugging Face Transformers: se puede cargar el preprocesador mediante `AutoImageProcessor`, simplificando el flujo de trabajo.
- No incluye capacidades de generación de texto, razonamiento multimodal ni tool calling, ya que es únicamente el encoder de visión.

## Casos de uso

- Etiquetado automático de fotogramas en producción audiovisual: el encoder puede generar embeddings de cada fotograma de una película o serie para clasificarlos automáticamente por escena, iluminación o contenido, facilitando la organización de material de archivo.
- Verificación de key-frames en pipelines de doblaje: en el contexto de NOESIS, se utiliza para comprobar que los fotogramas de referencia coinciden con las escenas esperadas, ayudando a detectar errores de sincronización.
- Búsqueda de imágenes por similitud: al generar embeddings, se puede construir un índice vectorial para encontrar imágenes visualmente similares en grandes colecciones, útil en bibliotecas de medios o catálogos de productos.
- Preparación de carteles y material promocional: el encoder puede analizar imágenes de pósters para extraer características visuales que ayuden a generar variaciones o a verificar la coherencia con la marca.
- Clasificación de imágenes en sistemas de moderación de contenido: los embeddings pueden alimentar clasificadores ligeros para detectar contenido inapropiado o categorizar imágenes automáticamente.
- Preprocesamiento para modelos de generación de imágenes: los embeddings extraídos pueden servir como condiciones para modelos de difusión o GANs, permitiendo controlar la generación basada en imágenes de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un encoder de visión cuantizado, y no se proporcionan métricas de precisión en tareas como ImageNet, COCO o retrieval. Tampoco se comparan sus embeddings con los del SigLIP2 original en términos de degradación por cuantización.

## Requisitos de hardware

- VRAM estimada: al ser un modelo INT8 de ~465 MB, requiere menos de 1 GB de VRAM si se ejecuta en GPU. En CPU, la memoria RAM necesaria es similar al tamaño del archivo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o integradas modernas). También puede ejecutarse en CPU sin GPU.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: onnxruntime con providers CPUExecutionProvider, CUDAExecutionProvider o DirectML. También se puede usar a través de Hugging Face Transformers con el preprocesador.
- Latencia y throughput: no se proporcionan datos específicos. En CPU, la inferencia de un solo lote de imágenes de tamaño típico (224x224) debería completarse en decenas de milisegundos, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| NOESIS-MiniCPM-V-4.6-SigLIP2-ONNX-INT8 | Vision encoder SigLIP2 | ~465 MB (INT8) | ONNX | Apache-2.0 | Extraccion de embeddings |
| openbmb/MiniCPM-V-4.6 (completo) | MLLM (vision + lenguaje) | 1.3B params | safetensors | Apache-2.0 | Razonamiento multimodal |
| google/siglip2-base-patch16-224 | Vision encoder SigLIP2 | ~400M params | safetensors | Apache-2.0 | Extraccion de embeddings |
| openai/clip-vit-base-patch32 | Vision encoder CLIP | ~150M params | safetensors | MIT | Extraccion de embeddings |

La comparativa muestra que este modelo es una versión cuantizada y extraída del encoder SigLIP2, con un tamaño reducido respecto al modelo completo MiniCPM-V-4.6. Frente a otros encoders como CLIP, ofrece la ventaja de un formato ONNX listo para producción y una licencia permisiva, aunque no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es únicamente un encoder de visión: no genera texto, no responde preguntas ni realiza razonamiento multimodal. Para tareas que requieran lenguaje, es necesario combinarlo con un modelo de lenguaje.
- La cuantización INT8 puede degradar ligeramente la calidad de los embeddings en comparación con la versión BF16, aunque no se cuantifica esta pérdida en la documentación.
- El modelo está pensado para un caso de uso específico dentro de la plataforma NOESIS (diagnóstico de doblaje). Su uso fuera de ese contexto puede requerir adaptación.
- No se proporcionan detalles sobre el proceso de cuantización (calibración, dataset de validación), lo que dificulta evaluar su robustez en dominios muy diferentes.
- Los idiomas listados (en, zh) se refieren al modelo base MiniCPM-V-4.6, pero el encoder de visión no tiene dependencia de idioma; la etiqueta es informativa.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright y la atribución correspondiente.
- El modelo no incluye el LLM de MiniCPM-V-4.6, por lo que no se puede utilizar para tareas de chat o generación de texto.

## Enlaces

- [HuggingFace - AMAImedia/NOESIS-MiniCPM-V-4.6-SigLIP2-ONNX-INT8](https://huggingface.co/AMAImedia/NOESIS-MiniCPM-V-4.6-SigLIP2-ONNX-INT8)
- [HuggingFace - openbmb/MiniCPM-V-4.6](https://huggingface.co/openbmb/MiniCPM-V-4.6)
- [GitHub - OpenBMB/MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V)
- [Modelo base - openbmb/MiniCPM-V-4_5](https://huggingface.co/openbmb/MiniCPM-V-4_5)
