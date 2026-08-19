# SCU-VIP-Lab/Learned-image-compression-with-transformers

## Resumen

El modelo **Learned Image Compression with Transformers** es un checkpoint oficial del trabajo homónimo de Tianma Shen y Ying Liu, publicado en la conferencia SPIE Defense + Commercial Sensing en mayo de 2023. El repositorio pertenece al Santa Clara University Video and Image Processing Lab (SCU-VIP-Lab), dirigido por Ying Liu, cuyo grupo investiga en compresión de imágenes y vídeo basada en deep learning, codificación visual para máquinas y modelos generativos.

El problema que resuelve es la compresión de imágenes con pérdida mediante redes neuronales, una alternativa a los códecs clásicos como JPEG o HEVC. La relevancia actual radica en que los métodos de compresión aprendida superan en tasa-distorsión a los estándares tradicionales, y la incorporación de arquitecturas Transformer permite capturar dependencias de largo alcance que las redes convolucionales puras no modelan bien.

El repositorio contiene pesos en formato PyTorch con un tamaño de 20.2 GB, aunque la información pública no detalla la arquitectura exacta, el número de parámetros ni la longitud de contexto. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo. Por el titulo del trabajo, se trata de un sistema de compresion aprendida de imagenes basado en Transformer. Segun el articulo relacionado "Learned Image Compression with Mixed Transformer-CNN" (arXiv:2303.14978), los metodos LIC existentes se dividen en basados en CNN y basados en Transformer, cada uno con ventajas distintas. El trabajo de Shen y Liu explora como combinar ambas aproximaciones para mejorar el rendimiento tasa-distorsion.

El checkpoint se publica como parte de la investigacion del SCU-VIP-Lab, que trabaja en compresion de imagenes y video, codificacion visual para maquinas y modelos generativos. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens/imagenes utilizados, ni si se aplicaron tecnicas de aprendizaje reforzado o ajuste fino adicional.

## Capacidades

- Compresion de imagenes con perdida mediante redes neuronales.
- Codificacion visual orientada a maquinas (visual coding for machines), segun las lineas de investigacion del laboratorio.
- Reduccion de tasa de bits manteniendo calidad visual, en comparacion con codecs clasicos.
- Potencial integracion con tareas de deteccion, dado el tag "detection" en el repositorio.
- Capacidades multilingue: no aplica, es un modelo de vision.

## Casos de uso

- **Compresion de imagenes para almacenamiento en la nube**: el modelo puede reducir el espacio necesario para grandes volumenes de imagenes manteniendo calidad, adecuado para servicios de backup y archivo.
- **Transmision de imagenes en redes de baja capacidad**: al superar en tasa-distorsion a codecs clasicos, permite enviar imagenes con menos bits sin perdida perceptible de calidad.
- **Preprocesamiento para vision por computador**: al estar orientado a maquinas, puede comprimir imagenes preservando las caracteristicas relevantes para tareas de deteccion y clasificacion.
- **Sistemas de videovigilancia**: la compresion eficiente es critica en despliegues con multiples camaras y ancho de banda limitado.
- **Aplicaciones medicas de imagen**: la compresion con perdida controlada puede reducir el coste de almacenamiento de radiografias y tomografias, aunque requiere validacion especifica.
- **Edge computing y dispositivos embebidos**: los modelos de compresion aprendida pueden ejecutarse en dispositivos con recursos limitados, aunque el tamano del checkpoint (20.2 GB) sugiere que se necesita hardware con VRAM considerable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original se presento en SPIE Defense + Commercial Sensing en 2023, pero no se incluyen metricas como PSNR, MS-SSIM o comparativas con JPEG/HEVC en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamano del repositorio (20.2 GB) sugiere que el checkpoint completo requiere al menos 20 GB de memoria para cargar los pesos en precision FP32.
- GPU recomendadas: no disponible. Para modelos de compresion de este tamano, una GPU con 24 GB o mas (RTX 3090/4090, A100) seria necesaria para inferencia.
- En consumer GPU: probablemente no cabe en GPUs de 8-12 GB sin cuantizacion, pero no se dispone de versiones cuantizadas.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con TorchServe o mediante un script de inferencia propio. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos de compresion aprendida. Los metodos LIC mas conocidos incluyen:

| Modelo | Arquitectura | Tamano | Contexto | Licencia |
|---|---|---|---|---|
| Este modelo | Transformer | no disponible | no disponible | MIT |
| LIC_TCM (jmliu206) | Mixto Transformer-CNN | no disponible | no disponible | no disponible |
| Codecs clasicos (JPEG/HEVC) | No neuronal | N/A | N/A | Estandar |

No se han encontrado datos publicos de rendimiento relativo entre estos modelos.

## Limitaciones y advertencias

- No se dispone de informacion sobre el rendimiento real en tareas de compresion; los datos de PSNR o MS-SSIM no estan publicados.
- El checkpoint tiene un tamano de 20.2 GB, lo que limita su uso en entornos con restricciones de memoria.
- No se especifican los datasets de entrenamiento ni las condiciones de evaluacion, lo que dificulta la reproducibilidad.
- Al ser un modelo de compresion con perdida, existe riesgo de artefactos visuales en imagenes con texturas complejas o bordes muy definidos.
- No se documentan sesgos ni limitaciones de dominio; el modelo puede no generalizar bien a dominios muy distintos de los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero no hay garantias de soporte ni mantenimiento por parte del laboratorio.
- No se proporcionan scripts de inferencia ni ejemplos de uso, lo que aumenta la curva de adopcion.

## Enlaces

- HuggingFace: https://huggingface.co/SCU-VIP-Lab/Learned-image-compression-with-transformers
- Perfil del laboratorio: https://huggingface.co/SCU-VIP-Lab
- Pagina de Ying Liu en SCU: https://www.cse.scu.edu/~yliu1/
- Publicaciones de Ying Liu: https://www.cse.scu.edu/~yliu1/publications.html
- Repositorio relacionado LIC_TCM: https://github.com/jmliu206/LIC_TCM
- Articulo relacionado (arXiv): https://arxiv.org/abs/2303.14978
