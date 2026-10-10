# Jinstudio/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo de visión-lenguaje especializado en OCR y parsing de documentos, desarrollado por Baidu Inc. y publicado originalmente bajo el identificador `baidu/Unlimited-OCR`. La ficha que nos ocupa, `Jinstudio/Unlimited-OCR`, es una reproducción del repositorio oficial en la que se conservan los pesos en safetensors, el código personalizado (`custom_code`) y la licencia MIT. El objetivo declarado del proyecto es "empujar DeepSeek-OCR un paso más allá", enmarcándose en lo que sus autores denominan la era del "one-shot long-horizon parsing", es decir, el parseo de documentos largos (multipágina, PDF completo) en una sola pasada.

El modelo tiene 3.336.106.240 parámetros totales (aproximadamente 3,34 mil millones), lo que lo sitúa en la gama de modelos compactos de visión-lenguaje, aptos para despliegue en una sola GPU. Se distribuye con el pipeline `image-text-to-text` y admite entrada de imágenes individuales, secuencias multipágina y PDF convertidos previamente a imágenes. Los ejemplos oficiales de inferencia configuran `max_length=32768`, lo que da una idea del horizonte de generación previsto para documentos extensos, si bien no se especifica la ventana de contexto nativa del modelo.

Su relevancia actual reside en que combina un tamaño contenido (3,34B) con soporte de inferencia en vLLM y SGLang, además de integración con ms-swift para entrenamiento y disponibilidad en Baidu Cloud, ModelScope y un Space de Hugging Face. Esto lo convierte en un candidato práctico para pipelines de digitalización documental en producción, donde el coste por página y el throughput importan tanto como la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de vision-lenguaje para OCR; la model card no detalla la arquitectura interna, requiere `trust_remote_code=True`) |
| Parametros totales | 3.336.106.240 (aproximadamente 3,34B) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | 32768 tokens configurados como `max_length` en los ejemplos oficiales de inferencia; ventana nativa no especificada |
| Tipos de cuantizacion | No disponible; los ejemplos de inferencia usan `torch.bfloat16` |
| Idiomas soportados | Multilingue (no se detalla la lista concreta de idiomas) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`use_safetensors=True`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de backbone visual, encoder de lenguaje, si emplea atención lineal, decodificación especulativa u otras innovaciones). Lo que sí se indica es que se trata de un modelo de visión-lenguaje orientado a OCR y parsing de documentos, que se apoya en código personalizado dentro de la librería Transformers (etiqueta `custom_code`, obliga a `trust_remote_code=True` al cargarlo) y que se posiciona explícitamente como una evolución de DeepSeek-OCR. La model card enfatiza el "one-shot long-horizon parsing", es decir, la capacidad de procesar documentos largos de una sola vez en lugar de fragmentarlos.

En cuanto al entrenamiento, no se publican en la información proporcionada el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Sí consta soporte de entrenamiento mediante ms-swift (integrado el 21 de julio de 2026), lo que abre la puerta al ajuste fino por parte de terceros. Los ejemplos de inferencia incluyen dos configuraciones para imagen única —`gundam` (`base_size=1024`, `image_size=640`, `crop_mode=True`) y `base` (`base_size=1024`, `image_size=1024`, `crop_mode=False`)— y una configuración única para multipágina/PDF con `image_size=1024`, lo que sugiere un pipeline de preprocesado con recorte y reescalado configurable según el tipo de documento.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes individuales, con dos modos de preprocesado (`gundam` con recorte y `base` sin recorte).
- Parsing de documentos multipágina: el método `infer_multi` acepta una lista de imágenes y las procesa de forma conjunta.
- Procesamiento de PDF: la model card incluye un ejemplo completo de conversión de páginas PDF a imágenes con PyMuPDF (300 DPI) antes del parseo multipágina.
- Salida de texto estructurado correspondiente al contenido del documento, con parámetros de control de repetición (`no_repeat_ngram_size=35`, `ngram_window=128` para imagen única y `ngram_window=1024` para multipágina).
- Multilingüe según las etiquetas del repositorio, aunque sin listado explícito de idiomas cubiertos.
- Generación de texto e imagen-a-texto a través del pipeline `image-text-to-text` de Transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión general (no OCR), audio: no disponible en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos históricos: el modelo puede procesar documentos escaneados página a página o en lotes mediante `infer_multi`, con salida de texto reutilizable para indexación posterior; su tamaño de 3,34B permite ejecutarlo en una GPU de gama alta de consumo.
- Extracción de datos de facturas y formularios: usando el modo `base` con `image_size=1024` sobre cada página, se obtiene el contenido textual necesario para alimentar un pipeline de contabilidad o ERP; el parámetro `no_repeat_ngram_size=35` reduce bucles de generación en documentos repetitivos.
- Construcción de bases de conocimiento y RAG: convertir PDFs técnicos o normativos a texto con OCR de alta fidelidad es el paso previo habitual a un sistema de recuperación aumentada; con `max_length=32768` es posible abordar documentos densos sin trocear en exceso.
- Automatización de back-office en seguros o banca: parseo de pólizas, contratos y expedientes en formato imagen o PDF, desplegando el modelo con vLLM para atender peticiones concurrentes mediante una API compatible con OpenAI.
- Accesibilidad documental: transcripción de material impreso o escaneado a texto plano para lectores de pantalla y herramientas de síntesis de voz, aprovechando la licencia MIT para integrarlo en productos derivados.
- Pipelines de CI/CD y procesamiento por lotes: al poder lanzarse con Transformers, vLLM o SGLang sobre GPUs NVIDIA, el modelo puede integrarse como servicio interno que transforma lotes de PDF en texto dentro de un flujo automatizado de ingesta de datos.
- Digitalización de documentación técnica y manuales multipágina: el flujo específico de PDF (conversión a PNG a 300 DPI y `infer_multi` con `ngram_window=1024`) está pensado para documentos de decenas de páginas con estructura y tablas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas con métricas tipo MMLU, HumanEval, GSM8K ni métricas específicas de OCR (como precisión de edición de caracteres o comparativas frente a DeepSeek-OCR), pese a referenciar el artículo de arXiv 2606.23050 como fuente del trabajo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en `bfloat16` ocupan aproximadamente 6,7 GB (3,34B × 2 bytes), coherente con el tamaño del repositorio de 6,8 GB. En cuantización de 8 bits bajaría a unos 3,3 GB y en 4 bits a unos 1,7 GB (estimaciones calculadas a partir del número de parámetros; no confirmadas en la model card).
- A esa cifra hay que sumar la caché KV y las activaciones derivadas de los tokens de imagen, que en configuraciones con `image_size=1024` y `max_length=32768` no son despreciables.
- GPU recomendadas: las pruebas oficiales se hicieron con PyTorch 2.10.0 y CUDA 12.9 sobre GPUs NVIDIA. No se listan modelos concretos. Por tamaño, el modelo es desplegable en una NVIDIA H100, A100 (40/80 GB), L40S o RTX 6000 Ada.
- GPU de consumo: con 6,7 GB de pesos en bf16 más activaciones, cabe con holgura en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB). En tarjetas de 8 GB requeriría cuantización, opción no documentada oficialmente.
- Opciones de despliegue: Transformers (`AutoModel` con `trust_remote_code=True`), vLLM mediante las imágenes Docker `vllm/vllm-openai:unlimited-ocr` (CUDA 13.0) y `vllm/vllm-openai:unlimited-ocr-cu129` para GPUs Hopper, SGLang (rueda local `sglang-0.0.0.dev11416+g92e8bb79e` con `kernels` y `pymupdf==1.27.2.2`), Baidu Cloud, ModelScope y entrenamiento con ms-swift.
- Latencia y throughput: no disponibles. La model card no publica medidas de tokens por segundo ni de tiempo por página.
- Dependencias de inferencia probadas: python 3.12.3, torch 2.10.0, torchvision 0.25.0, transformers 4.57.1, Pillow 12.1.1, matplotlib 3.10.8, einops 0.8.2, addict 2.4.0, easydict 1.13, pymupdf 1.27.2.2, psutil 7.2.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR (Baidu) | 3,34B | 32768 tokens configurados en inferencia | No disponible | MIT | Hugging Face, ModelScope, Baidu Cloud, vLLM, SGLang |
| DeepSeek-OCR | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | GitHub de DeepSeek |
| Otras alternativas de OCR de vision-lenguaje | No disponible | No disponible | No disponible | No disponible | No disponible |

La única referencia comparativa explícita en la información proporcionada es DeepSeek-OCR, respecto al cual Unlimited-OCR se presenta como un paso adelante, pero no se aportan especificaciones ni métricas de ninguno de los dos que permitan una comparación cuantitativa. No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La ficha `Jinstudio/Unlimited-OCR` tiene 0 descargas y 0 likes y fue creada el 10 de octubre de 2026, mientras que la model card referencia de forma consistente el repositorio oficial `baidu/Unlimited-OCR`. Antes de usarla en producción conviene verificar la procedencia de los pesos y considerar el repositorio de Baidu como fuente canónica.
- La arquitectura y las decisiones de entrenamiento no están documentadas en la información disponible, lo que dificulta anticipar su comportamiento fuera de los dominios de documento habituales.
- No se publican métricas de precisión de OCR ni evaluaciones de sesgo, por lo que no es posible cuantificar la tasa de error esperada en documentos manuscritos, tablas complejas, sellos, sellos de agua o texto en baja resolución.
- Riesgo de alucinación: como todo modelo generativo de visión-lenguaje, puede producir texto plausible que no aparece en la imagen, especialmente en zonas ilegibles o degradadas. Los parámetros `no_repeat_ngram_size` y `ngram_window` mitigan bucles de repetición, pero no garantizan fidelidad literal.
- El soporte multilingüe está declarado de forma genérica; no se especifica la cobertura real por idioma ni la calidad relativa entre ellos.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar ese código en entornos con requisitos estrictos de seguridad.
- Licencia MIT: permite uso comercial y modificaciones con atribución y sin garantías, pero el usuario asume la responsabilidad sobre el cumplimiento de normativas de protección de datos si procesa documentos con información personal.
- El despliegue en GPU de 8 GB o menos no está documentado; no se ofrecen pesos GGUF ni cuantizaciones oficiales para llama.cpp u Ollama.
- El flujo de PDF requiere conversión previa de las páginas a imágenes (por ejemplo con PyMuPDF a 300 DPI), lo que añade coste de CPU y almacenamiento temporal al pipeline.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Jinstudio/Unlimited-OCR
- Repositorio oficial en Hugging Face: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio de código en GitHub: https://github.com/baidu/Unlimited-OCR
- Articulo en arXiv: https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Receta de despliegue en vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- Documentacion en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Twitter de Baidu Inc.: https://x.com/Baidu_Inc
- Ficha en Trendshift: https://trendshift.io/repositories/62053
- Repositorio de ms-swift: https://github.com/modelscope/ms-swift
- DeepSeek-OCR (referencia comparativa citada): https://github.com/deepseek-ai/DeepSeek-OCR
