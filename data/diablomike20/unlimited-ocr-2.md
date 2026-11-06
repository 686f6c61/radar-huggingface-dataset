# diablomike20/Unlimited-OCR-2

## Resumen

Unlimited OCR 2 es un modelo de visión-lenguaje especializado en extracción de texto (OCR) y parseo estructurado de documentos, desarrollado por Baidu y publicado originalmente bajo el identificador `baidu/Unlimited-OCR-2`. Esta ficha cubre la réplica alojada por el usuario `diablomike20` en Hugging Face, que reproduce los pesos con licencia MIT. El modelo resuelve el problema del parseo de documentos extremadamente largos: en lugar de procesar página a página con una ventana de contexto limitada, mantiene una atención de ventana deslizante sobre referencias comprimidas que permite abordar documentos de cientos de páginas con coste computacional acotado.

La innovación central es SR-SWA (Sparse Reference Sliding Window Attention), que comprime las interacciones texto-visión de secuencias ultra-largas a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens), eliminando el escalado cuadrático de la atención y los cuellos de botella de memoria a medida que crece el documento. Con 3.343.978.497 parámetros (~3,34 mil millones) y pesos en safetensors de 6,9 GB, es un modelo de tamaño medio diseñado para despliegue en una sola GPU de 80 GB.

Es relevante ahora porque empuja la frontera del OCR más allá del paradigma de "contexto largo" hacia el de "horizonte ilimitado", y porque se publica junto con un nuevo benchmark (MarathonDocBench) específico para documentos de cientos de páginas, además de soporte de inferencia en vLLM y SGLang y entrenamiento vía ms-swift.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer con Sparse Reference Sliding Window Attention (SR-SWA); requiere `trust_remote_code` |
| Parametros totales | 3.343.978.497 (~3,34 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el diseño SR-SWA permite parseo de horizonte ilimitado con ventana de trabajo fija (p. ej. 512 tokens de referencia) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16 safetensors) |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`; lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,9 GB) |

## Arquitectura y entrenamiento

El modelo es un sistema image-text-to-text de tipo visión-lenguaje orientado a OCR. Su componente distintivo es SR-SWA, un mecanismo de atención que sustituye la atención completa sobre secuencias texto-visión ultra-largas por una ventana deslizante sobre un conjunto comprimido y fijo de referencias de trabajo. Esto acota la complejidad computacional por paso de decodificación y mantiene la latencia y el consumo de memoria prácticamente constantes independientemente de la longitud del documento, habilitando el "parseo de horizonte ilimitado" dentro de una ventana de contexto finita.

La inferencia multipágina (`infer_multi`) procesa todas las páginas de un documento en una sola petición, de modo que el modelo aprovecha contexto entre páginas; el prompt se construye automáticamente como `"<PAGE><image>"` repetido por página más la instrucción "Multi page parsing.", y la salida contiene un `<PAGE>` por página de entrada en el mismo orden. La inferencia de página única (`infer`) emplea tiling dinámico para codificar la imagen. El modelo fue entrenado con soporte de la comunidad ms-swift; no se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

## Capacidades

- Extracción de texto (OCR) y parseo estructurado de documentos a partir de imágenes de página.
- Parseo multipágina con contexto entre páginas en una sola petición.
- Parseo de documentos de horizonte ultra-largo (cientos de páginas) con coste acotado gracias a SR-SWA.
- Procesamiento de documentos con tiling dinámico en modo página única.
- Soporte multilingüe (etiqueta `multilingual`; cobertura concreta no disponible).
- Integración como modelo image-text-to-text en el pipeline de Transformers.
- Inferencia servida mediante vLLM y SGLang (recomendado para serving).
- Entrenamiento/ajuste compatible con ms-swift.
- Capacidades de tool calling, agentes o audio: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos: el modelo puede procesar documentos de cientos de páginas en una sola petición con `infer_multi`, manteniendo latencia y memoria casi constantes gracias a SR-SWA, lo que lo hace adecuado para lotes de escaneos históricos o expedientes.
- Parseo de informes financieros y memorias anuales: documentos de decenas a cientos de páginas con tablas y estructura compleja se convierten a texto estructurado preservando el orden de página mediante las marcas `<PAGE>`.
- Extracción de texto en expedientes legales o administrativos: la ventana de trabajo fija permite abordar contratos y sumarios extensos sin truncar el contexto entre páginas.
- Pipeline de ingesta documental para RAG: la salida estructurada por página sirve como base para indexar y recuperar fragmentos en sistemas de recuperación aumentada.
- Procesamiento de documentación técnica y manuales: el tiling dinámico en modo página única maneja páginas densas, y el modo multipágina mantiene coherencia entre secciones.
- Servicio de OCR como API: el soporte de vLLM y SGLang permite desplegar el modelo como backend de serving con throughput controlado en una GPU de 80 GB.
- Ajuste fino para dominios específicos: la compatibilidad con ms-swift facilita adaptar el modelo a tipografías, idiomas o layouts propios de un cliente.

## Benchmarks y rendimiento

La model card afirma alcanzar estado del arte en benchmarks de decenas de páginas (por ejemplo, MPDocBench) y en benchmarks extremos de cientos de páginas (por ejemplo, MarathonDocBench), pero no se incluyen cifras numéricas en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 (~6,9 GB de safetensors), la inferencia requiere del orden de 14-16 GB de VRAM para pesos y estados, más memoria para activaciones de imagen; la referencia de pruebas del autor es una NVIDIA A800-80GB.
- GPU recomendadas: A800-80GB (configuración probada por el autor), A100-80GB y H100 por capacidad equivalente; GPU consumer de 24 GB (RTX 3090/4090) podrían ser suficientes para página única en precisión reducida, aunque no se confirma en la información disponible.
- Cabe en GPU consumer: probablemente en RTX 3090/4090 de 24 GB con precisión reducida; no confirmado oficialmente.
- Opciones de despliegue: Transformers nativo (pruebas rápidas), SGLang (recomendado para serving), vLLM (soporte anunciado), ms-swift para entrenamiento.
- Latencia y throughput: no disponibles; el diseño SR-SWA mantiene la latencia por paso y la memoria casi constantes respecto a la longitud del documento, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited OCR 2 | ~3,34 B | Horizonte ilimitado vía SR-SWA (ventana fija) | OCR / parseo documental VL | MIT | Hugging Face, ModelScope, Baidu Cloud |
| DeepSeek-OCR | No disponible | No disponible | OCR VL | No disponible | Hugging Face/GitHub |
| Unlimited-OCR (v1) | No disponible | Contexto largo | OCR VL | No disponible | Hugging Face/GitHub |

La model card sitúa explícitamente a Unlimited-OCR como evolución de DeepSeek-OCR ("push DeepSeek-OCR one step further"), y Unlimited OCR 2 como sucesor de Unlimited-OCR 1.0 con SR-SWA. No se dispone de datos de parámetros, contexto ni rendimiento de los comparables en la información proporcionada.

## Limitaciones y advertencias

- Esta ficha corresponde a una réplica de terceros (`diablomike20/Unlimited-OCR-2`); el modelo original es de Baidu. Verificar integridad de pesos antes de usar en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de desplegar.
- Riesgo de alucinación en texto manuscrito, layouts atípicos o imágenes de baja calidad; el OCR generativo puede producir texto plausible pero incorrecto.
- Sesgos lingüísticos y de dominio no documentados; la cobertura multilingüe concreta no se especifica.
- No se dispone de información sobre límites exactos de resolución de imagen, número máximo de páginas ni comportamiento en documentos mixtos (tablas, fórmulas, figuras).
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones de los pesos originales de Baidu y de los componentes de terceros.
- Sin resultados de benchmarks numéricos publicados en la información disponible, la comparación de rendimiento es cualitativa.
- Las fechas de creación del repositorio (2026) y del paper (arXiv 2606.23050) deben tratarse con cautela; verificar su vigencia.

## Enlaces

- Repositorio Hugging Face (réplica): https://huggingface.co/diablomike20/Unlimited-OCR-2
- Modelo original en Hugging Face: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio GitHub: https://github.com/baidu/Unlimited-OCR
- Paper en arXiv: https://arxiv.org/abs/2606.23050
- PDF del paper en el repo: https://huggingface.co/baidu/Unlimited-OCR-2/blob/main/Unlimited-OCR-2.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR-2
- Demo anterior (v1): https://huggingface.co/spaces/baidu/Unlimited-OCR
- Benchmark MarathonDocBench: https://huggingface.co/datasets/baidu/MarathonDocBench
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Baidu Cloud (documentación OCR): https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- ms-swift (entrenamiento): https://github.com/modelscope/ms-swift
- vLLM: https://github.com/vllm-project/vllm
- Rama v1 en GitHub: https://github.com/baidu/Unlimited-OCR/tree/UnlimitedOCR1.0
- DeepSeek-OCR: https://github.com/deepseek-ai/DeepSeek-OCR
- Twitter de Baidu: https://x.com/Baidu_Inc
