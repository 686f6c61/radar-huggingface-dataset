# nesoai/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo de visión-lenguaje (VLM) multimodal desarrollado por Baidu, presentado el 22 de junio de 2026, que se posiciona como una evolución de DeepSeek-OCR. Su objetivo principal es el procesamiento de documentos largos de una sola pasada, superando la limitación de las herramientas OCR tradicionales que dividen los documentos página a página y pierden el hilo contextual. Con 3.336 millones de parámetros totales y 500 millones activos por inferencia, el modelo emplea una ventana de contexto de 32.000 tokens, lo que le permite retener el contexto completo del documento durante el parsing.

El modelo está disponible bajo licencia MIT y se distribuye en formato safetensors. Soporta múltiples idiomas (etiquetado como "multilingual") y acepta imágenes y texto como entrada, generando texto estructurado como salida. Se puede ejecutar con Transformers, vLLM y SGLang, y existe una demo pública en Hugging Face Spaces. Su arquitectura y entrenamiento se describen en el artículo arXiv 2606.23050.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) basado en DeepSeek-OCR, con mezcla de expertos (MoE) |
| Parametros totales | 3.336.106.240 (3,3B) |
| Parametros activos | 500 millones (según DataLearnerAI) |
| Longitud de contexto | 32.000 tokens (ventana de contexto y salida máxima) |
| Tipos de cuantizacion | no disponible (se recomienda bfloat16 para inferencia) |
| Idiomas soportados | Multilingue (etiquetado como "multilingual", sin lista detallada) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Unlimited-OCR es un modelo de visión-lenguaje con arquitectura de mezcla de expertos (MoE), lo que explica que solo 500 millones de sus 3.336 millones de parámetros se activen por inferencia. Está diseñado para procesar documentos completos de múltiples páginas en una sola pasada, manteniendo el contexto global gracias a su ventana de 32.000 tokens. El modelo acepta imágenes de entrada junto con un prompt de texto y genera texto estructurado (markdown, por ejemplo) como salida.

El entrenamiento se basa en el trabajo previo de DeepSeek-OCR, extendiéndolo para manejar documentos largos de forma "one-shot" (una sola llamada). No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El modelo se presenta con dos configuraciones de inferencia para imágenes: "gundam" (base_size=1024, image_size=640, crop_mode=True) y "base" (base_size=1024, image_size=1024, crop_mode=False), siendo la segunda la recomendada para documentos multi-página y PDF.

## Capacidades

- Parsing de documentos largos de una sola pasada, incluyendo documentos multi-página y PDF (convirtiendo páginas a imágenes).
- Reconocimiento óptico de caracteres (OCR) con salida en texto estructurado (markdown).
- Comprensión de documentos con contexto largo (32K tokens), manteniendo el hilo argumental entre páginas.
- Soporte de entrada multimodal: imágenes y texto (prompt).
- Capacidades multilingües (etiquetado como "multilingual").
- Inferencia con Transformers, vLLM y SGLang, con soporte de Docker para despliegue.
- Procesamiento de imágenes con dos modos de resolución (gundam y base) para adaptarse a diferentes tipos de documento.

## Casos de uso

- Digitalización de documentos legales: el modelo puede procesar contratos o expedientes de múltiples páginas en una sola llamada, manteniendo el contexto entre cláusulas y anexos, lo que facilita la extracción de información relevante sin perder referencias cruzadas.
- Análisis de informes financieros anuales: con su ventana de 32K tokens, puede leer un informe completo (incluyendo tablas, gráficos y notas al pie) y generar un resumen estructurado en markdown, útil para auditorías o análisis de inversión.
- Conversión de libros escaneados a texto digital: al procesar documentos de cientos de páginas sin segmentación manual, permite digitalizar bibliotecas completas con alta fidelidad contextual.
- Automatización de facturas y recibos: el modelo puede extraer campos clave (importes, fechas, proveedores) de facturas escaneadas de varias páginas, integrándose en pipelines de contabilidad.
- Asistencia a la investigación académica: para leer artículos científicos o tesis en PDF, extrayendo secciones, referencias y ecuaciones en formato estructurado, facilitando el análisis de literatura.
- Procesamiento de documentos médicos: historiales clínicos con múltiples páginas (informes, análisis, recetas) pueden convertirse en texto estructurado para sistemas de gestión sanitaria, manteniendo la coherencia entre episodios.
- Generación de contenido accesible: convertir documentos escaneados en texto legible por lectores de pantalla, mejorando la accesibilidad para personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como una extensión de DeepSeek-OCR, pero no se proporcionan métricas comparativas (MMLU, HumanEval, GSM8K, etc.) ni evaluaciones específicas de OCR en la documentación revisada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 3,3B parámetros en bfloat16, se estima un consumo de memoria de aproximadamente 7-8 GB solo para los pesos, más overhead de activaciones y KV cache. En la práctica, una GPU con al menos 16 GB de VRAM sería recomendable para la configuración base con contexto largo.
- GPU recomendadas: NVIDIA GPUs con soporte CUDA 12.9 o 13.0 (según la versión de vLLM). Se mencionan explícitamente GPUs Hopper para la imagen Docker `unlimited-ocr-cu129`. Modelos como A100, H100 o RTX 4090 serían adecuados.
- Compatibilidad con GPUs de consumo: sí, es posible ejecutar el modelo en una RTX 3090 o 4090 (24 GB VRAM) con cuantización o bfloat16, aunque el contexto de 32K tokens puede requerir más memoria.
- Opciones de despliegue: Transformers (Hugging Face), vLLM (con receta oficial en recipes.vllm.ai), SGLang, y Docker (imágenes `vllm/vllm-openai:unlimited-ocr` para CUDA 13.0 y `unlimited-ocr-cu129` para Hopper/CUDA 12.9).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Unlimited-OCR (Baidu) | 3,3B totales, 500M activos | 32K | MIT | Hugging Face, ModelScope, Baidu Cloud, vLLM, SGLang |
| DeepSeek-OCR | no disponible | no disponible | no disponible | GitHub, Hugging Face |
| PaddleOCR (Baidu) | no disponible (modelos más pequeños) | no aplica (OCR tradicional) | Apache 2.0 | GitHub, pip |

Unlimited-OCR se posiciona como una mejora directa de DeepSeek-OCR, añadiendo la capacidad de procesar documentos largos de una sola pasada. A diferencia de herramientas OCR tradicionales como PaddleOCR (también de Baidu), que procesan página a página, Unlimited-OCR mantiene el contexto global del documento. No se dispone de datos cuantitativos para una comparación de rendimiento.

## Limitaciones y advertencias

- El modelo está diseñado principalmente para parsing de documentos; no se han documentado capacidades de razonamiento general o generación de código.
- La información sobre el entrenamiento (dataset, número de tokens, técnicas de alineación) no está disponible públicamente, lo que dificulta evaluar posibles sesgos.
- Aunque es multilingüe, no se especifica qué idiomas cubre ni su calidad relativa en cada uno.
- El uso de `custom_code` en Hugging Face requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se recomienda revisar el código antes de usarlo en entornos de producción.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantías sobre la exactitud del OCR en todos los tipos de documento (manuscritos, fuentes poco comunes, etc.).
- El modelo puede alucinar contenido en documentos ambiguos o de baja calidad; se recomienda validación humana para casos críticos.
- El contexto de 32K tokens, aunque amplio, puede no ser suficiente para documentos extremadamente largos (más de 50-100 páginas densas), requiriendo segmentación manual.

## Enlaces

- Hugging Face (modelo original): https://huggingface.co/baidu/Unlimited-OCR
- Hugging Face (modelo duplicado nesoai): https://huggingface.co/nesoai/Unlimited-OCR
- GitHub (código): https://github.com/baidu/Unlimited-OCR
- Paper arXiv: https://arxiv.org/abs/2606.23050
- Demo Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Receta vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
