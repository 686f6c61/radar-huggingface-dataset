# AST-1320/4xNomosWebPhoto_RealPLKSR

## Resumen

El modelo 4xNomosWebPhoto_RealPLKSR es un modelo de superresolución 4x orientado a la restauración de fotografías, desarrollado por Philip Hofmann (alias Helaman) y publicado bajo licencia CC-BY-4.0. Está diseñado para reconstruir imágenes reales degradadas por ruido, desenfoque de lente y recompresión JPEG/WebP, un problema común en fotografías digitales antiguas o comprimidas. El modelo utiliza la arquitectura RealPLKSR, implementada en el framework NeoSR, y se entrenó sobre el dataset Nomos-v2 con 6000 imágenes de alta calidad, aplicando degradaciones realistas generadas con herramientas específicas. Su relevancia reside en que ofrece una alternativa de restauración fotográfica de alta calidad con un enfoque en degradaciones reales, no sintéticas, y con un ajuste fino de las fuerzas de degradación respecto a modelos anteriores de la serie RealWebPhoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RealPLKSR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en formato .pth) |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | CC-BY-4.0 (según YAML de HuggingFace; la model card indica "CC-BY-0.4", posible errata) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

RealPLKSR es una arquitectura de superresolución basada en redes neuronales convolucionales con kernels de gran tamaño parcialmente aplicados (Partial Large Kernel), diseñada para capturar dependencias espaciales de largo alcance en imágenes. El modelo fue entrenado con el framework NeoSR, utilizando las técnicas de aumento de datos mixup, cutmix, resizemix y cutblur, y optimizado con el optimizador Nadam. El entrenamiento se realizó en dos fases: una primera de 404.000 iteraciones y una segunda de 445.000, con un tamaño de lote de 12 y 4 respectivamente, y tamaños de imagen GT de 128, 256 y 512 píxeles. El modelo final es una interpolación entre los checkpoints de 404.000 y 445.000 iteraciones, una técnica sugerida por la comunidad para mejorar la estabilidad. El dataset de entrenamiento fue Nomos-v2, compuesto por 6000 imágenes, sobre las cuales se generaron 12 carpetas de baja resolución con degradaciones realistas: reescalado y compresión mediante kim's datasetdestroyer, ruido realista mediante el modelo Ludvae200 y desenfoque de lente flotante mediante wtp_dataset_destroyer. No se utilizaron aumentos on-the-fly (OTF). El modelo parte de un preentrenamiento 4x_realplksr_gan_pretrain.

## Capacidades

- Superresolución 4x de imágenes fotográficas con restauración de detalles.
- Manejo de degradaciones realistas: ruido, desenfoque de lente y artefactos de compresión JPEG/WebP.
- Interpolación de checkpoints para mejorar la estabilidad y calidad percibida.
- Compatible con herramientas de la comunidad como chaiNNer y NeoSR.
- No incluye capacidades de visión general (detección, segmentación), solo restauración de imágenes.

## Casos de uso

- Restauración de fotografías antiguas escaneadas: el modelo puede recuperar textura y nitidez en imágenes con ruido de grano y desenfoque, útil para digitalización de archivos históricos.
- Mejora de imágenes comprimidas para impresión: al reducir artefactos de JPEG/WebP, permite reutilizar imágenes de baja calidad en publicaciones impresas o de alta resolución.
- Preprocesado para visión artificial: mejorar la calidad de imágenes de entrada en pipelines de OCR, detección de objetos o reconocimiento facial, cuando las fuentes son cámaras de baja resolución.
- Ampliación de imágenes para diseño gráfico: escalado 4x de fotografías de stock o capturas de pantalla para su uso en cartelería o presentaciones.
- Restauración de capturas de video antiguas: aplicado a frames individuales, puede mejorar la calidad de metraje digitalizado.
- Mejora de imágenes médicas o científicas no especializadas: en contextos donde se dispone de fotografías de campo con ruido y compresión, el modelo puede facilitar la inspección visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como PSNR, SSIM o comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El modelo se distribuye como un archivo .pth de PyTorch, por lo que requiere un runtime de PyTorch y una GPU con CUDA para inferencia eficiente.
- La VRAM necesaria depende del tamaño de la imagen de entrada; para imágenes típicas de 512x512 píxeles se estima que una GPU con 4-6 GB de VRAM es suficiente, pero no se dispone de datos oficiales.
- GPU recomendadas: RTX 3060 o superiores, aunque modelos más antiguos como GTX 1080 Ti pueden funcionar con limitaciones.
- En CPU es posible ejecutar la inferencia pero con latencia elevada; no se recomienda para producción.
- Opciones de despliegue: chaiNNer (interfaz gráfica), NeoSR (CLI), o integración directa en scripts de Python con PyTorch.
- No se conocen datos de throughput o latencia específicos para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de superresolución. Cualitativamente, se sitúa en la categoría de modelos de restauración fotográfica como Real-ESRGAN o SwinIR, pero con un enfoque específico en degradaciones realistas y una arquitectura más moderna. No se pueden aportar cifras concretas sin datos publicados.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para fotografías; su rendimiento en otros dominios (ilustraciones, gráficos, texto) puede ser subóptimo.
- Puede introducir artefactos o alucinaciones de textura en zonas con degradación extrema o información ausente.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe verificar que la atribución se realice correctamente.
- La model card indica "CC-BY-0.4" en el texto, lo que podría ser un error tipográfico; se recomienda consultar la licencia oficial antes de uso comercial.
- No se han publicado resultados de evaluación en conjuntos de datos estándar (Set5, Set14, DIV2K), por lo que la comparación objetiva con otros modelos es limitada.
- El tamaño del repositorio en HuggingFace es de 0.0 GB, lo que sugiere que los pesos no están alojados directamente en esa página; el acceso se realiza a través del enlace de GitHub Release.

## Enlaces

- [HuggingFace - AST-1320/4xNomosWebPhoto_RealPLKSR](https://huggingface.co/AST-1320/4xNomosWebPhoto_RealPLKSR)
- [GitHub Release - Phhofm/models](https://github.com/Phhofm/models/releases/tag/4xNomosWebPhoto_RealPLKSR)
- [OpenModelDB - 4xNomosWebPhoto_RealPLKSR](https://openmodeldb.info/models/4x-NomosWebPhoto-RealPLKSR)
- [PDF de documentación del proceso](https://huggingface.co/Phips/4xNomosWebPhoto_RealPLKSR/blob/main/4xNomosWebPhoto-4.pdf)
- [Repositorio NeoSR](https://github.com/muslll/neosr)
- [chaiNNer](https://github.com/chaiNNer-org/chaiNNer)
