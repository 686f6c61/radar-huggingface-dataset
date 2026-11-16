# huidong-ma/CVPR2026-SAAF-Weights

## Resumen

SAAF (Sparse Attention and Adaptive Frequency) es un método de compresión de imágenes aprendida presentado en CVPR 2026 por Huidong Ma, Xinyan Shi, Hui Sun, Xiaofei Yue, Xiaoguang Liu, Gang Wang y Wentong Cai. Este repositorio de Hugging Face no contiene un modelo de lenguaje, sino los pesos preentrenados de un codec neuronal de imagen que cubre múltiples puntos de operación en la curva tasa-distorsión. El problema que resuelve es el de la compresión de imágenes con redes neuronales, un área donde los codecs aprendidos han superado progresivamente a los estándares tradicionales como JPEG, WebP o VVC en términos de relación calidad-tasa.

La propuesta técnica combina mecanismos de atención dispersa con un modelado adaptativo de frecuencias, dos componentes que buscan capturar dependencias espaciales de largo alcance sin el coste cuadrático de la atención densa y modelar de forma más eficiente las distribuciones de coeficientes latentes. El modelo se entrenó sobre OpenImages con error cuadrático medio (MSE) como objetivo de optimización.

El repositorio ocupa 3,1 GB y está orientado a investigadores que quieran reproducir o evaluar los resultados del paper. No se trata de un modelo generativo ni conversacional: no tiene tokenizador, ni contexto de texto, ni capacidades de razonamiento o tool calling. Su relevancia actual reside en el interés creciente por codecs neuronales desplegables en producción para reducir ancho de banda y almacenamiento manteniendo fidelidad perceptual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal de imagen con atención dispersa y modelado adaptativo de frecuencias (SAAF) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch (checkpoints para la librería `pytorch`) |
| Tamaño del repositorio | 3,1 GB |
| Dataset de entrenamiento | OpenImages |
| Objetivo de optimización | MSE (error cuadrático medio) |
| Puntos de operación | múltiples puntos tasa-distorsión |
| Fecha de publicación | 16 de noviembre de 2026 |

## Arquitectura y entrenamiento

SAAF es un codec de compresión de imagen aprendida que combina dos innovaciones: atención dispersa y modelado adaptativo de frecuencias. La atención dispersa reduce el coste computacional del modelado de dependencias espaciales de largo alcance, permitiendo capturar correlaciones globales en la imagen sin la complejidad cuadrática de la atención densa. El componente de frecuencia adaptativa modela las distribuciones de los coeficientes latentes de forma dependiente del contenido, lo que mejora la eficiencia de la entropía codificada.

El entrenamiento se realizó sobre el dataset OpenImages con MSE como función objetivo, lo que sitúa al modelo en la tradición de codecs optimizados para distorsión (PSNR) más que para métricas perceptuales como LPIPS o DISTS. El repositorio incluye pesos para varios puntos de operación en la curva tasa-distorsión, lo que permite al usuario seleccionar el compromiso entre tamaño de archivo y calidad según el caso de uso. No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si se emplearon técnicas de refinamiento posteriores.

## Capacidades

- Compresión de imágenes con un codec neuronal entrenado de extremo a extremo.
- Cobertura de múltiples puntos de operación tasa-distorsión mediante distintos conjuntos de pesos.
- Optimización orientada a MSE, adecuada para métricas de fidelidad como PSNR y MS-SSIM.
- Procesamiento de imágenes naturales del dominio de OpenImages.
- Integración con PyTorch para inferencia y evaluación.
- Reproducción de los resultados del paper CVPR 2026 mediante el repositorio GitHub asociado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Evaluación académica de codecs neuronales: investigadores pueden cargar los pesos y reproducir las curvas tasa-distorsión del paper sobre conjuntos de validación estándar (Kodak, CLIC, Tecnick) para comparar con JPEG, WebP, VVC y otros codecs aprendidos.
- Reducción de ancho de banda en servicios de imágenes: un backend de CDN podría integrar el codec para recomprimir imágenes bajo demanda seleccionando el punto de operación adecuado según el dispositivo del cliente.
- Archivado y almacenamiento a largo plazo: la compresión orientada a MSE permite preservar fidelidad de píxel en bibliotecas de imágenes científicas o patrimoniales donde el PSNR es crítico.
- Pipelines de preprocesado para visión por computador: comprimir datasets de entrenamiento antes de alimentar modelos de detección o segmentación, reduciendo el almacenamiento sin degradar significativamente las métricas aguas abajo.
- Investigación en modelado de entropía: el componente de frecuencia adaptativa sirve como banco de pruebas para estudiar distribuciones latentes y técnicas de codificación aritmética.
- Aplicaciones móviles de compartición de fotos: los pesos pueden cuantizarse o destilarse para despliegue en dispositivos con recursos limitados, aunque esto requiere trabajo adicional no incluido en el repositorio.
- Benchmarking de infraestructura: medir latencia y throughput de decodificación neuronal en GPUs frente a codecs tradicionales en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de PSNR, MS-SSIM, BD-Rate ni comparaciones numéricas con otros codecs. Se recomienda consultar el paper CVPR 2026 para obtener las métricas oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (3,1 GB) sugiere que los pesos completos de todos los puntos de operación caben en GPUs consumer, pero no se especifica el consumo por checkpoint individual.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del repositorio, es plausible que una RTX 3090 o RTX 4090 sea suficiente para un único punto de operación, pero no está confirmado.
- Compatibilidad con GPU consumer: probable dado el tamaño del repositorio, aunque no verificado.
- Opciones de despliegue: PyTorch nativo; el repositorio GitHub de SAAF contiene las instrucciones de setup y evaluación. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un codec de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dataset | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAAF (este) | Codec neuronal con atención dispersa y frecuencia adaptativa | OpenImages | MSE | no disponible | Pesos en HF |
| Modelos de compresión aprendida tipo hyperprior (p. ej. Ballé et al.) | Codec neuronal con hyperprior | Varía | MSE / perceptual | Varía por implementación | Múltiples repos |
| Codecs tradicionales (VVC, HEVC, AV1) | Codec no aprendido | no aplica | Distorsión perceptual | Estándares abiertos | Amplia |
| JPEG / WebP | Codec no aprendido | no aplica | Distorsión | Estándares abiertos | Universal |

No se dispone de datos numéricos comparativos en la información proporcionada para establecer diferencias cuantitativas de BD-Rate frente a estos sistemas.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con los autores antes de desplegar en producción.
- El modelo está entrenado con MSE, lo que puede producir artefactos perceptuales (suavizado excesivo, pérdida de textura fina) en comparación con codecs optimizados para métricas perceptuales.
- El dominio de entrenamiento es OpenImages; el rendimiento puede degradarse en imágenes médicas, satelitales, sintéticas o de dominios muy distintos.
- No hay información sobre sesgos, robustez ante ataques adversariales o comportamiento en imágenes de alta resolución fuera de distribución.
- No se han publicado benchmarks en la información disponible, por lo que no es posible validar las afirmaciones de rendimiento del paper sin acceso al mismo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es muy reciente y no ha sido validado por la comunidad.
- No incluye tokenizador, pipeline ni demo interactiva; requiere integración manual con el código del repositorio GitHub.
- La fecha de creación (noviembre de 2026) es posterior a la fecha habitual de CVPR 2026, lo que puede indicar una subida tardía de los artefactos o un desfase en los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huidong-ma/CVPR2026-SAAF-Weights
- Página de archivos: https://huggingface.co/huidong-ma/CVPR2026-SAAF-Weights/tree/main
- Repositorio GitHub de SAAF: https://github.com/huidong-ma/SAAF
- Paper (referencia en la model card): Ma, Huidong et al., "Learned Image Compression via Sparse Attention and Adaptive Frequency", CVPR 2026, pp. 41278-41287.
