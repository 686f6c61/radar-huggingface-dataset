# moonbox-ai/ormbg-MLX

## Resumen

ORMBG MLX es una conversión a formato MLX del modelo ORMBG (Open Remove Background Model), un sistema de eliminación de fondos y matting de imagen especializado en figuras humanas. Lo desarrolla moonbox-ai como port a Apple Silicon del modelo original de schirrmacher, y está pensado para ejecutarse de forma nativa en Macs con chips de la serie M mediante el framework MLX de Apple. El modelo resuelve la tarea de segmentación de imagen con canal alfa (matting), es decir, separar el sujeto del fondo con bordes suaves y precisos.

La arquitectura subyacente es una red convolucional basada en la investigación DIS (Highly Accurate Dichotomous Image Segmentation), con capas BatchNorm plegadas en las convoluciones para optimizar la inferencia. El repositorio ofrece dos precisiones, fp16 y bf16, ambas de 88 MB, sin builds de 8, 6 o 4 bits porque MLX no cuantiza capas convolucionales. El modelo procesa entradas redimensionadas a 1024x1024 y devuelve una máscara alfa de la misma resolución que la imagen de entrada.

La relevancia actual radica en que permite ejecutar localmente en hardware Apple una tarea de visión clásicamente dependiente de GPU dedicada, con latencias de 0,17-0,18 segundos por imagen en un M5 y una fidelidad respecto al modelo PyTorch original muy alta (IoU de máscara de 0,998 en fp16). La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional basada en DIS (Highly Accurate Dichotomous Image Segmentation), BatchNorm plegado en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1024x1024) |
| Tipos de cuantizacion | fp16 y bf16 (sin builds de 8/6/4 bits porque MLX no cuantiza convoluciones) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con config.json y mlx_model.py por carpeta de precisión |

## Arquitectura y entrenamiento

El modelo es una red convolucional de segmentación derivada de la línea de investigación DIS, orientada a la extracción de alta precisión del sujeto respecto al fondo. En esta conversión MLX, las capas BatchNorm se han plegado dentro de las convoluciones para reducir operaciones en inferencia, y los pesos se han almacenado en fp16 o bf16. La entrada se redimensiona internamente a 1024x1024 y la salida es una máscara alfa de tipo uint8 con las dimensiones de la imagen original.

El entrenamiento del modelo original, según su model card, partió de un dataset sintético de 10.000 imágenes generado con BlenderProc, tras descartar un primer conjunto creado con LayerDiffuse por falta de precisión. Posteriormente se incorporaron datasets reales de segmentación humana: P3M-10K, AIM-500 y PPM-100, además de aplicar Grid Dropout como augmentación. Tras 100.000 iteraciones, el autor reporta una mejora de F1 de 0,9888 a 0,9932 y de MAE de 0,0113 a 0,008 sobre su conjunto de validación. No se especifican en la información disponible detalles sobre número total de tokens (no aplica), composición exacta del dataset final ni uso de RLHF/DPO.

## Capacidades

- Eliminación de fondo de imágenes con generación de canal alfa (matting) de alta precisión.
- Segmentación específicamente optimizada para imágenes con personas.
- Salida de máscara alfa con bordes suaves, adecuada para composición y recorte profesional.
- Procesamiento de imágenes RGB de entrada con redimensionado interno a 1024x1024.
- Ejecución nativa en Apple Silicon mediante MLX, con solo las dependencias `mlx` y `numpy`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola tarea.

## Casos de uso

- Edición fotográfica automatizada en macOS: integrar el modelo en una app de retoque para eliminar fondos de retratos de forma local, sin enviar imágenes a la nube, aprovechando la latencia de 0,17 s por imagen en un M5.
- Generación de avatares y fotos de perfil: recortar automáticamente al sujeto de imágenes de personas para producir PNG con transparencia en pipelines de creación de contenido.
- Comercio electrónico y catálogos de moda: separar modelos y prendas del fondo para estandarizar imágenes de producto, con la ventaja de que el modelo está entrenado específicamente con figuras humanas.
- Herramientas de videoconferencia y streaming: sustitución de fondo en tiempo real en aplicaciones nativas de Mac, dado el bajo coste computacional por fotograma.
- Preprocesado para pipelines de visión por computador: generar máscaras alfa limpias antes de tareas de reidentificación, análisis de pose o segmentación semántica posterior.
- Automatización de flujos de diseño gráfico: integración en scripts que procesen lotes de imágenes para preparar assets con transparencia en herramientas de diseño.
- Investigación en segmentación: servir como baseline reproducible en MLX para comparar técnicas de matting en hardware Apple sin depender de CUDA.

## Benchmarks y rendimiento

Datos reportados en la model card, comparando cada build MLX contra el modelo PyTorch fp32 original sobre las mismas entradas:

| Precision | Tamano | Alpha MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) | Tiempo por imagen en M5 |
|---|---|---|---|---|
| fp16 | 88 MB | 0,0004 | 0,998 | 0,17 s |
| bf16 | 88 MB | 0,0026 | 0,987 | 0,18 s |

Métricas del modelo original sobre su conjunto de validación (tras 100k iteraciones):

| Metrica | Antes | Despues |
|---|---|---|
| F1 | 0,9888 | 0,9932 |
| MAE | 0,0113 | 0,008 |

No se han publicado en la información disponible resultados comparativos con otros modelos de eliminación de fondo (por ejemplo, rembg o BiRefNet) ni métricas sobre benchmarks estándar de segmentación.

## Requisitos de hardware

- VRAM/memoria unificada: el modelo pesa 88 MB en fp16 y bf16, por lo que el consumo de memoria es mínimo (del orden de cientos de MB incluyendo buffers de activación a 1024x1024).
- Hardware objetivo: Apple Silicon (serie M). El autor reporta tiempos en un chip M5; no se especifican requisitos mínimos de generación.
- No está pensado para GPU NVIDIA ni CUDA: requiere el framework MLX, exclusivo del ecosistema Apple.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos modelos de gama base con memoria unificada de 8 GB.
- Despliegue: carga directa con `mlx_model.load()` desde Python; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 0,17 s por imagen en fp16 y 0,18 s en bf16 sobre un M5, según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| ORMBG MLX (este) | CNN DIS, matting humano | no disponible (88 MB de pesos) | 1024x1024 | Apache-2.0 | Apple Silicon (MLX) | Port nativo para Mac, fp16/bf16 |
| ORMBG (original) | CNN DIS, matting humano | no disponible | 1024x1024 | Apache-2.0 | PyTorch (CPU/GPU) | Modelo de referencia del que deriva este port |
| rembg / U2-Net | CNN de segmentación general | no disponible en la información | variable | según variante | CPU/GPU | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada, por lo que la comparación se limita a aspectos de licencia, hardware y formato.

## Limitaciones y advertencias

- Modelo especializado en figuras humanas: el rendimiento puede degradarse en sujetos no humanos, objetos, animales o escenas complejas.
- Riesgo de bordes imperfectos en imágenes con oclusiones, iluminación artificial intensa o fondos de similar color al sujeto, según advierte el propio autor sobre la brecha entre datos sintéticos y reales.
- No incluye cuantizaciones de 8, 6 o 4 bits, lo que limita la reducción adicional de memoria en MLX (aunque el modelo ya es muy pequeño).
- Dependencia exclusiva de MLX y Apple Silicon: no es portable a CUDA ni a CPU genérica sin reconversión.
- No procesa lenguaje ni texto: no admite prompts, tool calling ni instrucciones en lenguaje natural.
- Licencia Apache-2.0 permite uso comercial, pero al ser un derivado del modelo original, se mantiene la licencia y las condiciones de este.
- Alucinaciones no aplican en el sentido textual, pero sí existe riesgo de máscaras incorrectas (falsos positivos o negativos) en imágenes fuera de distribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria del port.

## Enlaces

- Repositorio Hugging Face del port: https://huggingface.co/moonbox-ai/ormbg-MLX
- Modelo original: https://huggingface.co/schirrmacher/ormbg
- Demo del modelo original: https://huggingface.co/spaces/schirrmacher/ormbg
- Dataset de entrenamiento (humanos): https://huggingface.co/datasets/schirrmacher/humans
- Repositorio de investigación DIS: https://github.com/xuebinqin/DIS
- Paper de referencia sobre datos sintéticos: https://arxiv.org/pdf/2112.09290
- BlenderProc: https://github.com/DLR-RM/BlenderProc
- LayerDiffuse: https://github.com/layerdiffusion/LayerDiffuse
- Dataset P3M-10K: https://paperswithcode.com/dataset/p3m-10k
- Dataset AIM-500: https://paperswithcode.com/dataset/aim-500
- Dataset PPM-100: https://github.com/ZHKKKe/PPM
- Documentación de Grid Dropout (Albumentations): https://albumentations.ai/docs/api_reference/augmentations/dropout/grid_dropout/
