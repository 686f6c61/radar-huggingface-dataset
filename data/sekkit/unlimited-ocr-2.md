# sekkit/Unlimited-OCR-2

## Resumen

Unlimited OCR Works 2 (Unlimited-OCR-2) es un modelo de visión-lenguaje especializado en OCR y parsing de documentos, desarrollado por Baidu Inc. Se presenta como la segunda iteración de la familia Unlimited-OCR, que a su vez partió de DeepSeek-OCR para llevar el parsing de documentos largos un paso más allá. Su novedad principal es la atención SR-SWA (Sparse Reference Sliding Window Attention), que comprime las interacciones texto-visual de secuencias ultra largas en un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens), manteniendo la latencia y memoria de decodificación casi constantes con independencia de la longitud del documento.

El problema que resuelve es el escalado cuadrático de la atención y el consumo de memoria cuando se procesan documentos de decenas o cientos de páginas. Gracias a SR-SWA, el modelo logra "unlimited-horizon parsing": parsing sin límite de horizonte dentro de una ventana de contexto finita. Según su model card, alcanza el estado del arte en benchmarks de documentos largos como MPDocBench (decenas de páginas) y MarathonDocBench (cientos de páginas).

El modelo pesa aproximadamente 3,34 mil millones de parámetros (según los metadatos de safetensors), se distribuye bajo licencia MIT con pesos en safetensors y requiere `trust_remote_code=True` en Transformers. Está orientado a extracción de texto multilingüe a partir de imágenes y documentos multipágina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model para OCR con SR-SWA (Sparse Reference Sliding Window Attention) |
| Parametros totales | 3.343.978.497 (≈3,34 B, según safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (parsing de horizonte ilimitado mediante ventanas y referencias comprimidas, p. ej. 512 tokens de referencia) |
| Tipos de cuantizacion | no disponible (inferencia documentada en bfloat16) |
| Idiomas soportados | multilingue (sin lista concreta publicada) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,9 GB, custom code con trust_remote_code) |

## Arquitectura y entrenamiento

Unlimited-OCR-2 es un modelo imagen-texto-a-texto basado en arquitectura transformer para visión-lenguaje. Su innovación central es la SR-SWA (Sparse Reference Sliding Window Attention): en lugar de atender a toda la secuencia texto-visual generada al parsear un documento ultra largo, comprime esas interacciones en un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens). Esto acota la complejidad computacional, de modo que la latencia por paso de decodificación y la huella de memoria permanecen casi constantes sea cual sea la longitud del documento, eliminando el escalado cuadrático de la atención.

El modelo ofrece dos modos de codificación de imagen: modo base, donde cada página se codifica como una vista global (usado en inferencia multipágina con `infer_multi`, que concatena `"<PAGE><image>"` por página y permite contexto cruzado entre páginas), y modo gundam, con tiling dinámico para páginas individuales (`infer`). En serving con SGLang se soporta planificación por ventanas de páginas para documentos muy largos, reutilizando la cola de KV de la ventana anterior. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Parsing OCR de documentos de horizonte ilimitado: decenas y cientos de páginas en una sola tarea, con contexto cruzado entre páginas.
- Parsing de página única con tiling dinámico (modo gundam) para imágenes de alta resolución.
- Inferencia multipágina en una sola petición, con salida estructurada por página (un `<PAGE>` por página de entrada, en orden).
- Capacidades multilingües de extracción de texto (sin lista de idiomas publicada).
- Soporte de inferencia con Transformers (uso nativo) y SGLang (recomendado para serving), además de compatibilidad previa con vLLM reportada para la versión 1.0.
- Entrenamiento/fine-tuning soportado mediante ms-swift.
- Conversión de PDF a imágenes mediante PyMuPDF en el pipeline de serving.
- No se documenta soporte de tool calling, agentes, audio ni generación de código.

## Casos de uso

- Digitalización de archivos y expedientes largos: parsing completo de documentos de cientos de páginas (contratos, historiales, legajos) en una sola pasada, gracias al horizonte ilimitado de SR-SWA.
- Conversión de PDFs técnicos a texto estructurado: el pipeline de SGLang incluye conversión PDF-imagen con PyMuPDF, apto para montar servicios de extracción masiva de documentación.
- Procesamiento de documentación multilingüe: extracción de texto de documentos en varios idiomas sin cambiar de modelo.
- OCR de página única de alta calidad: el modo gundam con tiling dinámico es adecuado para escaneos de alta resolución donde se requiere detalle fino (facturas, formularios, manuscritos impresos).
- Servicios de OCR en la nube: el modelo está disponible en Baidu Cloud, lo que permite integrarlo sin gestionar infraestructura propia.
- Fine-tuning a dominios específicos: mediante ms-swift se puede adaptar el modelo a corpus especializados (médico, legal, histórico).
- RAG sobre documentos extensos: la salida estructurada por página facilita indexar documentos largos en sistemas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en formato numérico. La model card indica que el modelo logra estado del arte en MPDocBench (documentos de decenas de páginas) y MarathonDocBench (documentos de cientos de páginas), e incluye una imagen de leaderboard, pero sin los valores concretos extraíbles.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial; la inferencia documentada se ha probado en una NVIDIA A800 de 80 GB con bfloat16. Con ~3,34 B de parámetros en bf16, los pesos ocupan en torno a 6,7 GB, por lo que una GPU de 16-24 GB debería ser suficiente para el modelo en sí, quedando margen para el KV cache según la longitud del documento.
- GPU recomendadas: NVIDIA A800-80GB (configuración de prueba oficial); por tamaño de modelo, GPUs consumer como RTX 4090 (24 GB) son plausibles para inferencia, aunque no verificadas en la documentación.
- Consumer GPU: dado el tamaño (~3,3 B parámetros, repo de 6,9 GB), el modelo debería caber en GPUs de 16-24 GB; no hay confirmación oficial.
- Opciones de despliegue: Transformers nativo (pruebas rápidas, requiere `trust_remote_code=True`), SGLang con wheel personalizado `sglang-0.5.20.dev10+g8d62f5fb9c` (recomendado para serving, con planificación por ventanas de páginas), vLLM (soporte reportado para la versión anterior) y Baidu Cloud como servicio gestionado.
- Latencia y throughput: no disponible en cifras; la model card afirma que la latencia por paso de decodificación y la memoria se mantienen casi constantes con independencia de la longitud del documento.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto/documentos | Licencia |
|---|---|---|---|---|
| Unlimited-OCR-2 (Baidu) | ≈3,34 B | OCR con horizonte ilimitado (SR-SWA) | Documentos de cientos de páginas, latencia casi constante | MIT |
| DeepSeek-OCR | no disponible en la ficha | OCR de documentos largos (base de la familia) | Documentos largos, con límite de contexto | no disponible en la ficha |
| Unlimited-OCR 1.0 (Baidu) | no disponible en la ficha | OCR de documentos largos, precursor | Parsing de horizonte largo (no ilimitado) | no disponible en la ficha |

La principal diferenciación de Unlimited-OCR-2 frente a DeepSeek-OCR y su propia versión 1.0 es el paso de parsing de horizonte largo a horizonte ilimitado mediante SR-SWA, junto con estado del arte declarado en MPDocBench y MarathonDocBench.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del autor; conviene revisarlo antes de usarlo en producción.
- Para serving se necesita un wheel de SGLang personalizado (versión de desarrollo), no el paquete estándar, lo que puede complicar la integración y actualizaciones.
- No se publica lista concreta de idiomas soportados pese a etiquetarse como multilingüe; conviene validar el rendimiento en los idiomas objetivo.
- No hay cifras públicas de benchmarks numéricos en la model card, solo la afirmación de estado del arte y una imagen de leaderboard.
- No se documenta soporte de tool calling, agentes ni salida estructurada tipo JSON; el foco es el parsing de texto por página.
- Al ser un modelo reciente con muy pocas descargas (34) y un solo like, hay poca evidencia comunitaria de estabilidad y reproducibilidad.
- La licencia MIT permite uso comercial sin restricciones relevantes, pero el código personalizado asociado debe revisarse por separado.
- Riesgo de alucinación y sesgos: no disponible; no se han publicado evaluaciones de alucinación ni análisis de sesgos.

## Enlaces

- Hugging Face (espejo de sekkit): https://huggingface.co/sekkit/Unlimited-OCR-2
- Hugging Face (repositorio original de Baidu): https://huggingface.co/baidu/Unlimited-OCR-2
- GitHub: https://github.com/baidu/Unlimited-OCR
- Paper (arXiv): https://arxiv.org/abs/2606.23050
- PDF en el repo: https://huggingface.co/baidu/Unlimited-OCR-2/blob/main/Unlimited-OCR-2.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- ms-swift (entrenamiento): https://github.com/modelscope/ms-swift
- vLLM: https://github.com/vllm-project/vllm
