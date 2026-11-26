# ABrunsch/Unlimited-OCR-2-repacked

## Resumen

Unlimited-OCR-2 es un modelo vision-language especializado en extracción y parseo de texto a partir de imágenes de documentos, desarrollado por Baidu. Se presenta como la evolución de Unlimited-OCR (junio de 2026) y su objetivo es llevar el parseo de documentos de "horizonte largo" a "horizonte ilimitado": procesar documentos de cientos de páginas sin que el coste computacional crezca de forma cuadrática con la longitud. La innovación central es Sparse Reference Sliding Window Attention (SR-SWA), que comprime las interacciones texto-visuales a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens), manteniendo latencia y memoria casi constantes independientemente de la longitud del documento.

El modelo tiene 3.343.978.497 parámetros (aproximadamente 3,3 mil millones) y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. Está pensado para pipelines de digitalización documental, extracción estructurada y comprensión de documentos escaneados en múltiples idiomas.

La ficha que sigue describe el repositorio `ABrunsch/Unlimited-OCR-2-repacked`, un reempaquetado del modelo original `baidu/Unlimited-OCR-2` en el que únicamente se han dividido los pesos safetensors en 4 fragmentos de un máximo de 1.900 MB cada uno para facilitar su almacenamiento y transferencia. Los pesos, según el autor del repack, son idénticos a los de la revisión original `cb16b920ec2249c4b280f3aa67942e00b5099122`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con Sparse Reference Sliding Window Attention (SR-SWA); detalles completos de la arquitectura no disponibles |
| Parametros totales | 3.343.978.497 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo está diseñado para parseo de horizonte ilimitado mediante SR-SWA, sin ventana de contexto fija declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (sin listado concreto de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (4 fragmentos, máximo ~1.900 MB por fragmento) |

## Arquitectura y entrenamiento

Unlimited-OCR-2 es un modelo vision-language de tipo image-text-to-text orientado a OCR y comprensión de documentos. Su componente diferenciador es SR-SWA (Sparse Reference Sliding Window Attention), que sustituye la atención completa sobre secuencias ultra-largas por atención sobre un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens). Esto acota la complejidad computacional por paso de decodificación y evita el crecimiento cuadrático del coste y de la memoria a medida que aumenta el número de páginas del documento. Según Baidu, el resultado es un parseo sin límite práctico de longitud dentro de una ventana de contexto finita.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `baidu/Unlimited-OCR-2`, y la model card menciona soporte de entrenamiento a través de ms-swift y compatibilidad de inferencia con vLLM y SGLang. El paper asociado es arXiv:2610.39308 (Unlimited OCR Works 2); existe también un paper previo de la versión 1 en arXiv:2606.23050.

## Capacidades

- Extracción de texto (OCR) a partir de imágenes de documentos, incluidos documentos de muchas páginas.
- Parseo de documentos de horizonte ilimitado: procesamiento de documentos de decenas y cientos de páginas con latencia y memoria aproximadamente constantes gracias a SR-SWA.
- Comprensión de documentos (image-text-to-text): no solo transcripción, sino interpretación del contenido visual y textual combinado.
- Soporte multilingüe (el modelo declara el tag `multilingual`, sin desglose de idiomas).
- Integración con pipelines de transformers (`AutoModel`, `AutoTokenizer`) y con motores de serving como vLLM y SGLang.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión general o audio: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos: procesar lotes de documentos escaneados de cientos de páginas sin fragmentarlos manualmente, ya que SR-SWA mantiene el coste por paso acotado con independencia de la longitud.
- Extracción de datos estructurados de facturas y albaranes: convertir imágenes de documentos comerciales en campos de texto explotables para sistemas de contabilidad o ERP.
- Procesamiento de expedientes legales o administrativos: parsear contratos y expedientes extensos manteniendo coherencia a lo largo de todo el documento, algo que los modelos con ventana de contexto limitada no pueden garantizar.
- Enriquecimiento de bases de conocimiento: indexar el contenido de PDFs escaneados y libros para motores de búsqueda internos o sistemas RAG.
- Automatización de back-office en banca o seguros: extracción de información de formularios y pólizas escaneadas en múltiples idiomas.
- Digitalización de documentación técnica y manuales: convertir planos, manuales y documentación de ingeniería en texto consultable, aprovechando la capacidad de manejar documentos muy largos.
- Despliegue en producción con SGLang o vLLM: servir el modelo como endpoint de OCR en una infraestructura existente, ya que la model card indica soporte explícito para ambos motores.

## Benchmarks y rendimiento

La model card menciona que Unlimited-OCR-2 alcanza estado del arte en benchmarks de documentos de decenas de páginas (por ejemplo, MPDocBench) y de documentos extremos de cientos de páginas (por ejemplo, MarathonDocBench), pero no se incluyen cifras numéricas en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,34 mil millones de parámetros, en FP16 se necesitan aproximadamente 6,7 GB solo para los pesos, más la memoria de activaciones y del codificador visual; en cuantización de 8 bits o 4 bits el requisito sería menor, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: la model card indica que las pruebas de inferencia con Transformers se realizaron en una NVIDIA A800-80GB. No se especifican otros modelos probados.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos (unos 6,9 GB en el repositorio), podría caber en GPUs de consumo con 12-16 GB de VRAM o más, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: Transformers (prueba rápida), SGLang (recomendado para serving según la model card) y vLLM (soporte anunciado). No se menciona llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles. La model card afirma que SR-SWA mantiene la latencia por paso de decodificación y el uso de memoria "casi constantes" con independencia de la longitud del documento, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR-2 (este repack) | 3,34 B | Horizonte ilimitado vía SR-SWA | OCR y parseo de documentos largos | MIT | Hugging Face, ModelScope, Baidu Cloud |
| Unlimited-OCR (versión 1) | no disponible | no disponible | OCR de documentos largos | no disponible en la información | Hugging Face, ModelScope |
| DeepSeek-OCR | no disponible | no disponible | OCR (referencia que Unlimited-OCR busca superar) | no disponible en la información | GitHub de DeepSeek |

No se dispone de datos de rendimiento comparativos numéricos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un reempaquetado no oficial: los pesos se declaran idénticos a los originales, pero la responsabilidad del mantenimiento recae en el autor del repack, no en Baidu.
- No se documentan sesgos conocidos del modelo en la información disponible.
- Riesgo de alucinación: no cuantificado; como modelo generativo de texto a partir de imágenes, puede producir transcripciones incorrectas en documentos de baja calidad o con tipografías poco habituales, aunque no hay datos publicados al respecto.
- No se especifica la lista concreta de idiomas soportados, solo el tag genérico `multilingual`.
- No se documentan límites de longitud de contexto ni de resolución de imagen.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo original `baidu/Unlimited-OCR-2` y de los datasets de entrenamiento antes de un despliegue en producción.
- No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible; el despliegue en hardware limitado requeriría generarlas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una réplica reciente sin validación comunitaria.

## Enlaces

- Repositorio del repack: https://huggingface.co/ABrunsch/Unlimited-OCR-2-repacked
- Modelo original: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio GitHub: https://github.com/baidu/Unlimited-OCR
- Paper Unlimited OCR Works 2: https://arxiv.org/abs/2610.39308
- Paper Unlimited-OCR (versión 1): https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR-2
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Documentación en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Entrada web TextMind: https://console.bce.baidu.com/textmind/application/textParser
- ms-swift (entrenamiento): https://github.com/modelscope/ms-swift
- vLLM: https://github.com/vllm-project/vllm
- DeepSeek-OCR (referencia): https://github.com/deepseek-ai/DeepSeek-OCR
