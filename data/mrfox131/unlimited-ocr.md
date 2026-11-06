# MrFox131/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo de visión-lenguaje especializado en extracción de texto y parseo de documentos, desarrollado por Baidu y publicado originalmente bajo el identificador `baidu/Unlimited-OCR`. La versión aquí descrita es un espejo alojado por el usuario MrFox131 en Hugging Face (`MrFox131/Unlimited-OCR`), con licencia MIT y 34 descargas en el momento de la consulta. El modelo se presenta como una evolución de DeepSeek-OCR y está orientado al parseo de documentos de largo horizonte en una sola pasada ("one-shot long-horizon parsing"), incluyendo documentos multipágina y PDF completos.

Técnicamente es un modelo de 3.336.106.240 parámetros (aproximadamente 3,3 mil millones) en formato safetensors, con un repositorio de 6,8 GB. Se distribuye con código personalizado (`trust_remote_code=True`) y requiere la librería `transformers` (versión 4.57.1 en las pruebas del autor) sobre GPUs NVIDIA. Soporta entrada de imagen y texto, con pipeline `image-text-to-text`, y está etiquetado como multilingüe.

Su relevancia actual radica en que aborda el cuello de botella del OCR tradicional en documentos extensos: en lugar de procesar página a página con pérdida de contexto, el modelo permite concatenar múltiples páginas en una sola inferencia con una longitud máxima de 32.768 tokens, lo que facilita la reconstrucción coherente de tablas, formularios y estructuras de documento a lo largo de varias páginas. Cuenta con soporte de inferencia en vLLM y SGLang, además de un espacio de demostración en Hugging Face Spaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalles específicos no disponibles en la información proporcionada) |
| Parametros totales | 3.336.106.240 (~3,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en inferencia (`max_length=32768`) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | multilingüe (sin listado detallado de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su naturaleza vision-language y su integración con `transformers` mediante código personalizado. El modelo procesa imágenes con dos configuraciones de resolución: el modo "gundam" (`base_size=1024`, `image_size=640`, `crop_mode=True`), pensado para imágenes individuales, y el modo "base" (`base_size=1024`, `image_size=1024`, `crop_mode=False`), empleado para parseo multipágina y PDF. La conversión de PDF a imágenes se realiza con PyMuPDF a 300 DPI en el ejemplo del autor.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo busca llevar un paso más allá a DeepSeek-OCR y que se publicó un artículo en arXiv (2606.23050), que sería la fuente adecuada para los detalles de entrenamiento. Sí se documenta una innovación operativa relevante: el parseo multipágina en una sola pasada con control de repetición mediante `no_repeat_ngram_size` y `ngram_window` ajustables según el caso (35/128 para imagen única, 35/1024 para multipágina).

## Capacidades

- Extracción de texto (OCR) de imágenes de documentos, con preservación de estructura.
- Parseo de documentos multipágina en una sola inferencia, incluyendo PDF convertidos a imágenes.
- Procesamiento de imágenes individuales en dos configuraciones de resolución (gundam y base).
- Generación de salida estructurada guardable en disco (`save_results=True`).
- Soporte multilingüe según la etiqueta del modelo.
- Integración con `transformers` mediante código personalizado.
- Inferencia optimizada en vLLM (imágenes Docker oficiales) y SGLang.
- Entrenamiento soportado mediante ms-swift según la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o modo de razonamiento explícito.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede procesar cada documento como imagen o como conjunto multipágina, extrayendo texto y estructura en una sola pasada gracias a su ventana de 32.768 tokens, lo que reduce la fragmentación de la información entre páginas.
- Procesamiento de contratos y documentación legal: el parseo multipágina permite mantener la coherencia de cláusulas y referencias cruzadas a lo largo de documentos extensos, algo que un OCR página a página pierde.
- Extracción de tablas y formularios en informes financieros: la configuración base con `image_size=1024` y el control de repetición con ventana de ngramas amplia (1024) favorecen la reconstrucción de estructuras repetitivas sin bucles degenerados.
- Archivado masivo de PDF escaneados: el flujo documentado convierte PDF a imágenes con PyMuPDF a 300 DPI y llama a `infer_multi`, lo que permite integrarlo en pipelines de digitalización por lotes.
- Enriquecimiento de bases documentales para RAG: el texto extraído puede alimentar índices de recuperación; el soporte multilingüe del modelo amplía su aplicabilidad a corpus en varios idiomas.
- Despliegue como servicio de OCR en producción: la disponibilidad de recetas de vLLM y SGLang, con imágenes Docker para CUDA 13.0 y CUDA 12.9 (Hopper), facilita servirlo como endpoint compatible con la API de OpenAI.
- Investigación en parseo de documentos: al ser un modelo de 3,3 B con licencia MIT y soporte de entrenamiento vía ms-swift, es viable para ajuste fino y experimentación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 3,3 B parámetros en bfloat16, los pesos ocupan aproximadamente 6,7 GB, por lo que se necesita margen adicional para activaciones y procesamiento de imagen; una GPU de 16 GB o superior es un punto de partida razonable, aunque no confirmado por el autor.
- GPU recomendadas: el autor valida el entorno en NVIDIA GPUs con CUDA 12.9; para vLLM se ofrecen imágenes Docker para CUDA 13.0 (por defecto) y CUDA 12.9 específica para GPUs Hopper (H100/H200).
- Cabe en GPU de consumo: probable en tarjetas con 16-24 GB (por ejemplo, RTX 4090) dado el tamaño de pesos, aunque no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), vLLM (receta oficial e imágenes Docker `vllm/vllm-openai:unlimited-ocr` y `unlimited-ocr-cu129`), SGLang (rueda local y servidor `sglang.launch_server`), Baidu Cloud y ModelScope.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR (Baidu) | ~3,3 B | 32.768 tokens | OCR y parseo multipágina | MIT | Hugging Face, ModelScope, Baidu Cloud, vLLM, SGLang |
| DeepSeek-OCR | no disponible | no disponible | OCR | no disponible | GitHub de DeepSeek |
| OCR tradicional (p. ej., Tesseract) | no aplica | no aplica | OCR página a página | Apache 2.0 | Amplia |

La model card sitúa explícitamente a Unlimited-OCR como una evolución de DeepSeek-OCR, pero no se proporcionan cifras comparativas de rendimiento entre ambos. No hay datos suficientes en la información disponible para una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio consultado es un espejo de terceros (`MrFox131/Unlimited-OCR`) con 34 descargas y 0 likes; para producción conviene verificar el repositorio original `baidu/Unlimited-OCR`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; debe auditarse antes de desplegar en entornos sensibles.
- La versión de `transformers` validada es la 4.57.1; otras versiones pueden presentar incompatibilidades.
- El parseo multipágina solo funciona con la configuración base (`image_size=1024`); el modo gundam está restringido a imágenes individuales.
- Los parámetros de control de repetición (`no_repeat_ngram_size`, `ngram_window`) deben ajustarse según el caso; una configuración incorrecta puede provocar bucles o pérdida de contenido repetitivo legítimo.
- No se detallan sesgos conocidos, tasas de alucinación ni limitaciones por idioma en la información proporcionada; el etiquetado "multilingual" no especifica cobertura real.
- La licencia MIT permite uso comercial, pero al tratarse de un espejo no oficial debe confirmarse que los términos se corresponden con los del modelo original.
- No hay datos publicados de benchmarks en la información disponible, por lo que la calidad relativa frente a alternativas no puede evaluarse con cifras.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/MrFox131/Unlimited-OCR
- Hugging Face (original): https://huggingface.co/baidu/Unlimited-OCR
- GitHub: https://github.com/baidu/Unlimited-OCR
- arXiv: https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- Receta de vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- ms-swift: https://github.com/modelscope/ms-swift
- DeepSeek-OCR (referencia): https://github.com/deepseek-ai/DeepSeek-OCR
- Trendshift: https://trendshift.io/repositories/62053
- Twitter de Baidu: https://x.com/Baidu_Inc
