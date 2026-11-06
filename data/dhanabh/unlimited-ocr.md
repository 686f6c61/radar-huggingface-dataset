# Dhanabh/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo vision-language especializado en reconocimiento óptico de caracteres (OCR) y parsing de documentos, desarrollado por Baidu. Se presenta como una evolución de DeepSeek-OCR y su propuesta central es el "one-shot long-horizon parsing": la capacidad de procesar documentos completos, incluyendo múltiples páginas o PDFs, en una sola pasada sin necesidad de segmentar el contenido en fragmentos independientes.

El modelo tiene 3.336.106.240 parámetros (~3,3 mil millones) y se distribuye en formato safetensors con un repositorio de 6,8 GB. Está pensado para tareas de extracción estructurada de texto a partir de imágenes y documentos, con soporte multilingüe y una ventana de contexto de 32.768 tokens según los ejemplos de inferencia de la model card. La licencia es MIT, lo que facilita su adopción comercial.

Su relevancia actual radica en que cubre el pipeline completo de digitalización documental: desde una imagen suelta hasta un PDF de varias páginas convertido a imágenes, con salida estructurada y soporte para despliegue en vLLM y SGLang además de Transformers. La disponibilidad de recetas oficiales de despliegue y su integración con ms-swift para entrenamiento lo sitúan como una opción práctica para pipelines de OCR a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con codificador de imagen y decodificador de texto (detalles internos no disponibles) |
| Parametros totales | 3.336.106.240 (~3,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_length en los ejemplos de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere trust_remote_code y custom_code) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo vision-language con pipeline `image-text-to-text` y código personalizado (`custom_code`), lo que implica que la implementación de referencia depende de módulos propios del autor que deben cargarse con `trust_remote_code=True`. El modelo recibe imágenes y produce texto estructurado, con dos configuraciones de inferencia para imagen única (`gundam`: base_size=1024, image_size=640, crop_mode=True; `base`: base_size=1024, image_size=1024, crop_mode=False) y una configuración específica para multipágina y PDF (`image_size=1024`).

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo se apoya en la línea de DeepSeek-OCR y que el paper está disponible en arXiv (2606.23050), pero no se reproducen en la ficha los detalles técnicos del mismo. Sí se documenta una innovación operativa destacable: la decodificación con `no_repeat_ngram_size` y `ngram_window` configurables para evitar repeticiones en salidas largas, un problema habitual en OCR de documentos extensos.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes individuales con dos modos de resolución (gundam y base).
- Parsing de documentos multipágina en una sola llamada mediante `infer_multi`, manteniendo coherencia entre páginas.
- Procesamiento de PDFs completos mediante conversión previa de páginas a imágenes con PyMuPDF y posterior parsing multipágina.
- Salida de texto estructurado orientada a la extracción de contenido documental.
- Soporte multilingüe declarado en los metadatos del modelo.
- Control de repeticiones mediante parámetros de n-gramas (`no_repeat_ngram_size`, `ngram_window`) adaptados a la longitud de la salida.
- Integración con Transformers, vLLM y SGLang para inferencia, y con ms-swift para entrenamiento.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión general más allá de OCR, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede procesar una imagen de factura y extraer el texto estructurado en una sola llamada, con el modo `gundam` para imágenes de resolución moderada y `base` para documentos de mayor detalle.
- Procesamiento de contratos en PDF: convirtiendo las páginas a imágenes con PyMuPDF a 300 dpi y usando `infer_multi`, se obtiene el texto de un contrato completo manteniendo el orden de páginas y la coherencia entre secciones.
- Archivado masivo de documentación escaneada: el soporte de vLLM y SGLang permite desplegar el modelo como servidor y procesar lotes de imágenes en paralelo, lo que encaja en pipelines de digitalización de archivos históricos o administrativos.
- Extracción de contenido de informes técnicos con tablas y texto mixto: el parsing multipágina evita tener que segmentar manualmente el documento y reduce los errores de concatenación entre páginas.
- Digitalización de documentación multilingüe: el soporte multilingüe declarado permite aplicar el mismo modelo a documentos en distintos idiomas sin cambiar de pipeline.
- Automatización de la entrada de datos en sistemas de gestión: la salida de texto estructurado puede alimentar procesos posteriores de extracción de campos y validación, reduciendo la transcripción manual.
- Procesamiento de documentación regulatoria o legal de varias páginas donde la continuidad del texto entre páginas es crítica, gracias a la ventana de contexto de 32.768 tokens.
- Integración en flujos de trabajo de investigación documental: el modelo puede servir como primer paso de OCR antes de aplicar modelos de lenguaje para resumen o búsqueda semántica sobre el texto extraído.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,3 mil millones de parámetros en bfloat16, el peso del modelo ronda los 6,7 GB; se recomienda al menos 10-12 GB de VRAM para dejar margen a activaciones y al procesamiento de imágenes de alta resolución.
- GPU recomendadas: A100 y H100 para despliegue en producción con vLLM o SGLang; RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con Transformers.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM para bfloat16; en tarjetas de 8 GB sería necesario cuantizar, aunque no se documentan formatos de cuantización en la información disponible.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM (imágenes Docker `vllm/vllm-openai:unlimited-ocr` y `unlimited-ocr-cu129` para Hopper), SGLang (wheel local y `kernels==0.11.7`), y entrenamiento con ms-swift.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Unlimited-OCR (Baidu) | ~3,3 B | 32.768 tokens | MIT | Hugging Face, ModelScope, Baidu Cloud |
| DeepSeek-OCR | no disponible | no disponible | no disponible | GitHub de DeepSeek |
| Alternativas genéricas de OCR vision-language | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con DeepSeek-OCR, del que se indica que Unlimited-OCR busca ir "un paso más allá", pero sin datos concretos de parámetros, contexto o rendimiento de DeepSeek-OCR en la información proporcionada. No se dispone de datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar y confiar en la implementación del autor antes de desplegarlo en producción.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto que no aparece en la imagen, especialmente en documentos de baja calidad o con ruido; los parámetros `no_repeat_ngram_size` y `ngram_window` mitigan repeticiones pero no eliminan el riesgo.
- La longitud de contexto de 32.768 tokens limita el número de páginas que pueden procesarse en una sola llamada; documentos muy extensos requerirán dividirse en lotes.
- El soporte multilingüe está declarado pero no se especifican los idiomas concretos ni su cobertura.
- Aunque la licencia es MIT, el uso de código personalizado y dependencias específicas (versiones fijadas de torch, transformers y otras) puede complicar la integración en entornos con restricciones de versiones.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere validación propia.
- El modelo está especializado en OCR y parsing documental; no debe esperarse un rendimiento generalista en tareas de visión o razonamiento fuera de ese dominio.

## Enlaces

- Hugging Face: https://huggingface.co/Dhanabh/Unlimited-OCR
- Hugging Face oficial (Baidu): https://huggingface.co/baidu/Unlimited-OCR
- GitHub: https://github.com/baidu/Unlimited-OCR
- arXiv: https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Receta vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- ms-swift: https://github.com/modelscope/ms-swift
- DeepSeek-OCR: https://github.com/deepseek-ai/DeepSeek-OCR
