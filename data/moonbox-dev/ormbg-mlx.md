# moonbox-dev/ormbg-MLX

## Resumen

ORMBG MLX es una conversión a MLX del modelo Open Remove Background Model (ormbg), un removedor de fondos de código abierto especializado en imágenes con personas. El modelo original lo desarrolla schirrmacher y esta versión la publica moonbox-dev para ejecución nativa en Apple Silicon. La arquitectura deriva de la investigación Highly Accurate Dichotomous Image Segmentation (IS-Net/DIS), una red totalmente convolucional que produce una máscara alfa de alta precisión (matting) en lugar de una segmentación binaria.

El modelo resuelve el problema de separar personas del fondo con bordes finos (pelo, ropa, transparencias), lo que lo hace útil para edición fotográfica, generación de recortes para e-commerce y pipelines de composición. Su relevancia actual radica en que es completamente abierto (Apache-2.0) y en que esta variante MLX permite inferencia local en Macs sin depender de CUDA ni de servicios en la nube.

La conversión incluye dos precisiones (fp16 y bf16), ambas de 88 MB, con verificación numérica frente al modelo PyTorch original. No hay builds de 8, 6 o 4 bits porque la red es puramente convolucional y MLX no cuantiza ese tipo de capas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional IS-Net (DIS), BatchNorm plegado en las convoluciones |
| Parámetros totales | no disponible (pesos de 88 MB en fp16/bf16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada redimensionada a 1024x1024) |
| Tipos de cuantización | fp16 y bf16; sin builds de 8/6/4 bits |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `config.json` y `mlx_model.py` |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional basada en la investigación Highly Accurate Dichotomous Image Segmentation (DIS/IS-Net), orientada a matting de alta precisión. En esta conversión MLX las capas BatchNorm se han plegado dentro de las convoluciones para simplificar el grafo de inferencia, y el modelo solo requiere las librerías `mlx` y `numpy`. La entrada se redimensiona a 1024x1024 y la salida es una máscara alfa de tipo uint8 con las mismas dimensiones que la imagen de entrada.

El entrenamiento del modelo original combina datos sintéticos y reales. La versión inicial se entrenó con imágenes sintéticas del Human Segmentation Dataset generadas con LayerDiffuse, pero el autor detectó un gap entre dominio sintético y real. Posteriormente se generó un dataset sintético de 10.000 imágenes con BlenderProc, se eliminaron los datos de LayerDiffuse por falta de precisión y se añadieron los conjuntos P3M-10K, AIM-500 y PPM-100 para entrenamiento y validación, junto con Grid Dropout como aumento de datos. Tras 100.000 iteraciones el autor reporta F1 de 0,9932 y MAE de 0,008 sobre su conjunto de validación. No se documenta uso de RLHF ni DPO, al no tratarse de un modelo generativo de lenguaje.

## Capacidades

- Eliminación de fondo (background removal) en imágenes, con salida de máscara alfa.
- Matting de alta precisión en imágenes con personas, incluyendo bordes finos como pelo o ropa.
- Segmentación de imagen con salida continua (alpha) en lugar de máscara binaria.
- Inferencia local en Apple Silicon mediante MLX, sin CUDA.
- Ejecución con un único fichero de pesos por precisión (fp16 o bf16) y código de modelo autocontenido.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Edición fotográfica y retoque: generar recortes con alfa de personas para sustituir fondos en herramientas de diseño, aprovechando el matting de bordes finos y la salida alfa de 8 bits.
- E-commerce y catálogo de producto con modelos: automatizar la eliminación de fondo de fotos de personas para fichas de producto, ejecutando el modelo localmente en un Mac de estudio.
- Composición y generación de imágenes: producir máscaras alfa que alimenten pipelines de composición o modelos generativos que necesiten separar primer plano y fondo.
- Preprocesado en aplicaciones de videollamada o streaming: extraer la silueta del hablante para efectos de fondo virtual, con latencia de 0,17 s por imagen en un M5.
- Herramientas de escritorio para macOS: integrar el modelo en apps nativas de Apple Silicon usando MLX, sin dependencias de CUDA ni de servicios externos.
- Anonimización y privacidad: aislar a personas en imágenes antes de publicarlas o de aplicar difuminado selectivo sobre el fondo.
- Prototipado e investigación en segmentación: servir de baseline reproducible y abierto (Apache-2.0) para experimentos de matting en hardware Apple.

## Benchmarks y rendimiento

El autor de la conversión publica métricas de fidelidad frente al modelo PyTorch original y tiempos de inferencia, no benchmarks estándar de segmentación. Se reproducen a continuación.

| Precisión | Tamaño | Alpha MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) | Tiempo por imagen en M5 |
|---|---|---|---|---|
| fp16 | 88 MB | 0,0004 | 0,998 | 0,17 s |
| bf16 | 88 MB | 0,0026 | 0,987 | 0,18 s |

Métricas del modelo original reportadas por su autor sobre su conjunto de validación (tras 100.000 iteraciones):

| Métrica | Antes | Después |
|---|---|---|
| F1 | 0,9888 | 0,9932 |
| MAE | 0,0113 | 0,008 |

No se han publicado resultados de benchmarks estándar (por ejemplo, sobre P3M-10K o AIM-500) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 88 MB, por lo que la huella es mínima; el coste dominante es la activación a resolución 1024x1024.
- GPU recomendadas: Apple Silicon con soporte MLX (el autor mide en un M5). No se documenta soporte CUDA en esta variante.
- Cabe en cualquier Mac moderno con Apple Silicon; no requiere GPU dedicada.
- Despliegue: MLX nativo con `mlx_model.load()` y `mlx_model.matte()`; solo requiere `mlx` y `numpy`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 0,17 s por imagen en fp16 y 0,18 s en bf16 sobre un M5. No se publica throughput por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Licencia | Notas |
|---|---|---|---|---|
| ormbg-MLX (este) | IS-Net convolucional, MLX | 88 MB | Apache-2.0 | Conversión para Apple Silicon; fp16/bf16 |
| ormbg (original) | IS-Net convolucional, PyTorch | no disponible | Apache-2.0 | Modelo base; requiere PyTorch |
| REMBG / U2-Net | U-Net para eliminación de fondo | no disponible | no disponible en la información | Alternativa popular, no comparada numéricamente aquí |
| BiRefNet | Segmentación dicotómica de alta resolución | no disponible | no disponible en la información | Familia relacionada con DIS; sin datos comparativos en la información |

No se dispone de comparaciones numéricas directas con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en imágenes con personas; el rendimiento en otros sujetos (productos, animales, paisajes) no está documentado y puede degradarse.
- El propio autor señala que los datos puramente sintéticos no generalizan bien al dominio real; la calidad depende de la mezcla de datos de entrenamiento.
- Riesgo de errores en bordes complejos, oclusiones o iluminación extrema; el matting alfa puede presentar halos o fugas en casos difíciles.
- Solo se distribuyen fp16 y bf16: no hay versiones cuantizadas a 8/6/4 bits, lo que limita optimizaciones de memoria adicionales.
- Requiere mantener juntos los ficheros de cada carpeta de precisión (`model.safetensors`, `config.json`, `mlx_model.py`); mezclarlos rompe la carga.
- Dependencia de MLX y, por tanto, de hardware Apple Silicon para esta variante; en otras plataformas debe usarse el modelo original en PyTorch.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado hereda la licencia del modelo original, que debe respetarse.
- No es un modelo de lenguaje: no admite instrucciones en texto, tool calling ni razonamiento; cualquier expectativa de ese tipo es un error de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/ormbg-MLX
- Modelo base original: https://huggingface.co/schirrmacher/ormbg
- Demo del modelo original: https://huggingface.co/spaces/schirrmacher/ormbg
- Repositorio de investigación DIS: https://github.com/xuebinqin/DIS
- Dataset de entrenamiento (humanos): https://huggingface.co/datasets/schirrmacher/humans
- LayerDiffuse: https://github.com/layerdiffusion/LayerDiffuse
- BlenderProc: https://github.com/DLR-RM/BlenderProc
- Paper PEOPLESANSPEOPLE (arXiv:2112.09290): https://arxiv.org/pdf/2112.09290
- Dataset P3M-10K: https://paperswithcode.com/dataset/p3m-10k
- Dataset AIM-500: https://paperswithcode.com/dataset/aim-500
- Dataset PPM-100: https://github.com/ZHKKKe/PPM
- Grid Dropout (Albumentations): https://albumentations.ai/docs/api_reference/augmentations/dropout/grid_dropout/
