# Aiidkx/Unlimited-OCR-2

## Resumen

Unlimited OCR 2 es un modelo vision-lenguaje especializado en extracción de texto y estructura de documentos, desarrollado por Baidu y publicado originalmente bajo el identificador `baidu/Unlimited-OCR-2`. Esta ficha cubre la réplica alojada por el usuario Aiidkx en Hugging Face (`Aiidkx/Unlimited-OCR-2`), que reproduce los pesos del modelo original con licencia MIT. El modelo resuelve el problema del parseo de documentos de longitud ilimitada: en lugar de degradarse con documentos de cientos de páginas, mantiene latencia y memoria prácticamente constantes gracias a un mecanismo de atención de ventana deslizante con referencias dispersas (SR-SWA).

Con 3.340 millones de parámetros en formato safetensors (6,9 GB en bf16), el modelo se sitúa en la gama media de los VLM, lo que lo hace desplegable en una sola GPU profesional. Su innovación principal, SR-SWA, comprime las interacciones texto-visual de secuencias ultra-largas a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens), eliminando el escalado cuadrático de la atención y los cuellos de botella de memoria a medida que crece el documento.

Es relevante ahora porque el equipo de Baidu ha publicado simultáneamente el paper (arXiv 2610.39308), un benchmark específico para documentos ultra-largos (MarathonDocBench) y soporte para inferencia con SGLang y vLLM, lo que facilita su adopción en pipelines de digitalización a escala industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer con Sparse Reference Sliding Window Attention (SR-SWA) |
| Parametros totales | 3.343.978.497 (≈3,34 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (ventana finita con horizonte de parseo ilimitado via SR-SWA) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | Multilingue (sin desglose de idiomas en la informacion disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,9 GB) |

## Arquitectura y entrenamiento

Unlimited OCR 2 es un modelo vision-lenguaje que combina un codificador de imagen con un decodificador de lenguaje, e incorpora como pieza central Sparse Reference Sliding Window Attention (SR-SWA). Este mecanismo sustituye la atención completa sobre la secuencia texto-visual por una ventana deslizante que mantiene un conjunto fijo de referencias de trabajo (del orden de 512 tokens), de modo que el coste computacional por paso de decodificación y el consumo de memoria se mantienen acotados con independencia de la longitud del documento. El resultado es un parseo de horizonte ilimitado dentro de una ventana de contexto finita.

El modelo soporta dos modos de inferencia documentados: un modo multi-página (`infer_multi`) que procesa todas las páginas de un documento en una sola petición con contexto cruzado entre páginas, y un modo de página única (`infer`) que aplica teselado dinámico (modo "gundam") por defecto. No se han detallado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo se distribuye con código personalizado (`trust_remote_code`) y requiere `transformers==4.52.1` según las instrucciones del autor.

## Capacidades

- Extracción de texto (OCR) en documentos de varias páginas y de cientos de páginas en una sola petición.
- Parseo de estructura documental con marcadores de página (`<PAGE>`) que preservan el orden de las imágenes de entrada.
- Comprensión de contexto cruzado entre páginas, al procesar el documento completo de forma conjunta.
- Procesamiento de imagen a texto (`image-text-to-text`) con pipeline dedicado en transformers.
- Soporte multilingüe declarado en los metadatos del modelo.
- Inferencia en modo página única con teselado dinámico para capturar detalle fino en imágenes densas.
- Integración con SGLang (recomendado para serving) y con vLLM para despliegue de alto rendimiento.
- Soporte de entrenamiento y ajuste fino mediante ms-swift, según el registro de versiones del autor.
- No se documenta en la información disponible soporte explícito de tool calling, agentes o modos de razonamiento extendido.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo puede procesar expedientes completos de decenas o cientos de páginas en una sola llamada con `infer_multi`, manteniendo el contexto entre páginas y evitando pipelines fragmentados que pierden referencias cruzadas.
- Extracción de contratos y documentación legal: la ventana deslizante con referencias fijas permite recorrer contratos largos sin que la latencia crezca con el número de páginas, algo crítico en revisiones documentales por lotes.
- Procesamiento de informes financieros y memorias anuales: documentos de cientos de páginas con tablas y texto corrido se parsean en una única petición, preservando la estructura por página para su posterior indexación.
- Alimentación de pipelines RAG sobre corpus escaneados: la salida estructurada por página facilita el troceado y la trazabilidad de cada fragmento extraído a su página de origen, requisito habitual en sistemas de recuperación documental.
- Digitalización de publicaciones científicas y preprints: el modo de página única con teselado dinámico captura fórmulas y texto en columnas, mientras que el modo multi-página permite procesar el artículo completo de una vez.
- Automatización de back-office en seguros y banca: extracción de pólizas, siniestros y extractos bancarios escaneados con despliegue en SGLang o vLLM para servir múltiples peticiones concurrentes con latencia estable.
- Archivo y preservación digital: conversión de fondos documentales históricos a texto estructurado con un modelo de licencia MIT que permite uso comercial y modificación sin restricciones de atribución adicionales.

## Benchmarks y rendimiento

El autor declara en la model card resultados de estado del arte en benchmarks de documentos de decenas de páginas (MPDocBench) y de documentos extremos de cientos de páginas (MarathonDocBench), pero no se incluyen cifras numéricas en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| MPDocBench | SOTA declarado, sin cifra disponible |
| MarathonDocBench | SOTA declarado, sin cifra disponible |

No se han publicado resultados numéricos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB en bfloat16 para los pesos (3,34 mil millones de parámetros), más memoria para activaciones y procesamiento de imagen; el autor reporta pruebas en una NVIDIA A800 de 80 GB, aunque el modelo es mucho más pequeño que esa GPU.
- GPU recomendadas: A100, A800, H100 para serving concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 de un solo documento.
- GPU de consumo: cabe en tarjetas con 12-16 GB de VRAM en bf16 para página única; en cuantización de 8 bits o inferior cabría en GPUs de 8 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers nativo (pruebas rápidas), SGLang (recomendado por el autor para serving) y vLLM (soporte añadido en la versión 1.0). El autor no menciona llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; el autor afirma que SR-SWA mantiene la latencia por paso y la memoria casi constantes con independencia de la longitud del documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited OCR 2 | 3,34 mil M | Finito con horizonte ilimitado (SR-SWA) | OCR de documentos ultra-largos | MIT | Hugging Face, ModelScope, Baidu Cloud |
| DeepSeek-OCR | No disponible | No disponible | OCR vision-lenguaje | No disponible | Hugging Face, GitHub |
| Unlimited-OCR (v1) | No disponible | No disponible | OCR de documentos largos | No disponible | Hugging Face, ModelScope |

La model card sitúa explícitamente a Unlimited OCR 2 como evolución de DeepSeek-OCR y de la versión 1 del propio modelo, pero no se proporcionan en la información disponible los parámetros ni el contexto de esos modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo OCR multilingüe, puede presentar menor precisión en idiomas o escrituras poco representadas en sus datos de entrenamiento.
- Riesgo de alucinación: los modelos vision-lenguaje pueden generar texto que no aparece en la imagen, especialmente en regiones de baja calidad o con ruido; se recomienda validación posterior en flujos críticos.
- Limitaciones de contexto o idioma: aunque el parseo es de horizonte ilimitado, la ventana de atención efectiva es finita (referencias de 512 tokens), lo que puede degradar la coherencia en documentos con dependencias muy alejadas entre páginas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución sin restricciones adicionales, pero esta ficha cubre una réplica no oficial (`Aiidkx/Unlimited-OCR-2`); para producción se recomienda verificar los pesos originales de `baidu/Unlimited-OCR-2`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar el código antes de desplegar en entornos sensibles.
- El repositorio réplica registra 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento ni de integridad de los pesos respecto al original.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face (réplica): https://huggingface.co/Aiidkx/Unlimited-OCR-2
- Modelo original en Hugging Face: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio GitHub: https://github.com/baidu/Unlimited-OCR
- Paper arXiv (Unlimited OCR 2): https://arxiv.org/abs/2610.39308
- Paper arXiv (Unlimited OCR 1.0): https://arxiv.org/abs/2606.23050
- Dataset MarathonDocBench: https://huggingface.co/datasets/baidu/MarathonDocBench
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR-2
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Documentación en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Repositorio ms-swift: https://github.com/modelscope/ms-swift
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio DeepSeek-OCR: https://github.com/deepseek-ai/DeepSeek-OCR
