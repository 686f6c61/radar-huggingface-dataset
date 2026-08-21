# SCU-VIP-Lab/Conditional-Image-Compression

## Resumen

El modelo **Conditional-Image-Compression** es un checkpoint oficial del laboratorio Video and Image Processing (VIP) de la Universidad de Santa Clara (SCU), correspondiente al artículo *Learning-Based Conditional Image Compression* presentado en ISCAS 2024. Se trata de un sistema de compresión de imágenes basado en deep learning que adopta un paradigma de codificación condicional inspirado en la compresión de vídeo. En lugar de comprimir directamente la imagen completa, el método comprime primero una versión de baja resolución de la imagen objetivo, la decodifica y la amplía mediante un modelo de super-resolución preentrenado, utilizando esa reconstrucción como condición para codificar los residuos de alta frecuencia.

Este enfoque resulta relevante porque aborda la compresión de imágenes con una perspectiva novedosa que separa la información de baja y alta frecuencia, lo que puede mejorar la eficiencia de compresión y la calidad perceptual en comparación con métodos tradicionales. El modelo está implementado en PyTorch y se distribuye bajo licencia MIT, lo que permite su uso comercial y académico sin restricciones. Aunque el repositorio no especifica el número de parámetros ni la arquitectura exacta, el tamaño del repositorio (12,7 GB) sugiere que contiene múltiples checkpoints o pesos de gran tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificación condicional) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch (formato no especificado, probablemente .pt o .pth) |

## Arquitectura y entrenamiento

Según el artículo, el modelo emplea una arquitectura basada en transformer para la compresión condicional de imágenes. El proceso se divide en dos etapas: primero se comprime una versión de baja resolución de la imagen de entrada, que se decodifica y se amplía mediante un modelo de super-resolución externo (off-the-shelf). Esta reconstrucción ampliada actúa como condición para un segundo codificador que procesa los residuos de alta frecuencia entre la imagen original y la versión condicionada. El uso de transformers permite modelar dependencias de largo alcance en la imagen, mejorando la eficiencia de compresión frente a métodos convolucionales puros.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de optimización (si se usó RLHF, DPO u otro). El artículo se centra en la propuesta arquitectónica y su evaluación en tareas de compresión, sin publicar detalles sobre el entrenamiento en la información disponible.

## Capacidades

- Compresión de imágenes con pérdida basada en deep learning, orientada a reducir el tamaño de archivo manteniendo calidad visual.
- Codificación condicional que separa información de baja y alta frecuencia, permitiendo una reconstrucción progresiva.
- Integración con modelos de super-resolución preentrenados para mejorar la calidad de la reconstrucción.
- Potencial uso en tareas de detección de objetos (el repositorio incluye la etiqueta `detection`), aunque no se especifica cómo se aplica.
- Implementación en PyTorch, lo que facilita su integración en pipelines de visión por computador existentes.

## Casos de uso

- **Almacenamiento eficiente de imágenes médicas**: el modelo puede comprimir radiografías o tomografías manteniendo detalles clínicos relevantes, reduciendo el espacio de almacenamiento en hospitales y sistemas de salud.
- **Transmisión de imágenes en redes de baja capacidad**: al comprimir primero una versión de baja resolución y luego refinar, se puede enviar una vista previa rápida y completar los detalles según la disponibilidad de ancho de banda.
- **Compresión de imágenes para sistemas de vigilancia**: la etiqueta `detection` sugiere que el modelo podría usarse para comprimir imágenes que luego serán procesadas por algoritmos de detección de objetos, reduciendo el coste de transmisión en cámaras IP.
- **Optimización de CDN y entrega de contenido web**: al reducir el peso de las imágenes sin pérdida perceptible, se acelera la carga de páginas web y se reduce el consumo de datos en aplicaciones móviles.
- **Preprocesamiento para entrenamiento de modelos de visión**: comprimir datasets de imágenes antes de entrenar otros modelos puede ahorrar espacio y acelerar el acceso a los datos, manteniendo la información esencial.
- **Compresión de imágenes satelitales o aéreas**: para aplicaciones de teledetección donde el volumen de datos es enorme, este método puede facilitar el almacenamiento y la transmisión de imágenes de alta resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (ISCAS 2024) incluye evaluaciones comparativas, pero no se han extraído los datos numéricos en la documentación consultada. Se recomienda consultar el PDF del paper para obtener métricas detalladas de PSNR, MS-SSIM o tasas de bits.

## Requisitos de hardware

- El tamaño del repositorio (12,7 GB) indica que los checkpoints son voluminosos; se estima que la inferencia requiere al menos 16 GB de VRAM para cargar el modelo completo en precisión FP32.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o superiores con suficiente memoria.
- Es posible que quepa en GPUs de consumo con cuantización, pero no se proporcionan versiones cuantizadas.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con TorchScript, ONNX o mediante frameworks de inferencia como TensorRT, aunque no hay guías oficiales.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de compresión de imágenes (como CompressAI, ELIC, etc.) en la documentación consultada. Se recomienda revisar el paper para comparaciones con métodos tradicionales (JPEG, JPEG2000) y otros métodos de compresión aprendida.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al ser un modelo de compresión, podría degradar la calidad en imágenes con texturas muy finas o bordes nítidos.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero la reconstrucción puede introducir artefactos en regiones de alta frecuencia.
- Limitaciones de contexto o idioma: no aplica.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías; el laboratorio no ofrece soporte técnico.
- Para producción, se recomienda validar el rendimiento en el dominio específico, ya que no se han publicado benchmarks independientes.

## Enlaces

- [HuggingFace - SCU-VIP-Lab/Conditional-Image-Compression](https://huggingface.co/SCU-VIP-Lab/Conditional-Image-Compression)
- [Paper (PDF) - Learning-Based Conditional Image Compression](https://www.cse.scu.edu/~yliu1/papers/ISCAS2024-TianmaShen-FinalSubmission.pdf)
- [Página del laboratorio VIP de SCU](https://www.cse.scu.edu/~yliu1/)
- [Perfil de la organización SCU-VIP-Lab en HuggingFace](https://huggingface.co/SCU-VIP-Lab)
