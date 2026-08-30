# aonuzhdin/FUSED

## Resumen

FUSED es un modelo de forense de imágenes desarrollado por Anton Nuzhdin (aonuzhdin) que combina un SparseViT con un CLIP-ConvNeXt-XXL congelado, fusionados mediante un MoE disperso (sparse Mixture of Experts). Su propósito es la detección y localización de manipulación por inpainting en imágenes, es decir, identificar regiones que han sido editadas o rellenadas artificialmente. El modelo se publica bajo licencia MIT y está pensado para tareas de análisis forense digital.

La arquitectura integra un SparseViT entrenado específicamente para forense con un extractor de características visuales ConvNeXt-XXL preentrenado en CLIP, y una cabeza conjunta de detección y localización. El repositorio incluye dos checkpoints entrenados en los conjuntos de datos OpenSDID (SD1.5) y So-Fake, además de una inicialización forense para el SparseViT. El peso total del repositorio es de 0,8 GB, con checkpoints de aproximadamente 306 MB cada uno. No se especifica el número total de parámetros ni la longitud de contexto, al tratarse de un modelo de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SparseViT + CLIP-ConvNeXt-XXL fusionados por MoE disperso |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE disperso, sin cifra publicada) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

FUSED combina dos componentes principales: un SparseViT (Vision Transformer con atención dispersa) especializado en tareas forenses, y un CLIP-ConvNeXt-XXL congelado que actúa como extractor de características visuales de alto nivel. Ambos se fusionan mediante un MoE disperso, lo que permite combinar las señales de ambos modelos de forma eficiente. La cabeza conjunta de detección y localización produce tanto una predicción global de manipulación como un mapa de localización a nivel de píxel.

El modelo se entrena en dos conjuntos de datos: OpenSDID (basado en Stable Diffusion 1.5) y So-Fake (con balanceo por raíz cuadrada). El repositorio incluye un checkpoint de inicialización forense para el SparseViT, que se utiliza como punto de partida durante el entrenamiento. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta de los datos ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de manipulación por inpainting en imágenes, indicando si una imagen ha sido editada.
- Localización a nivel de píxel de las regiones manipuladas, generando mapas de máscara.
- Combinación de características de un SparseViT forense y un CLIP-ConvNeXt-XXL para mejorar la robustez.
- Soporte para inferencia con checkpoints entrenados en diferentes conjuntos de datos (OpenSDID y So-Fake).
- Integración con el ecosistema PyTorch y carga de pesos desde Hugging Face Hub.

## Casos de uso

- Verificación de autenticidad de imágenes en medios de comunicación: un periodista puede analizar una imagen sospechosa para determinar si ha sido manipulada mediante inpainting, usando el checkpoint entrenado en OpenSDID para detectar ediciones típicas de generadores SD1.5.
- Auditoría de contenido en redes sociales: plataformas pueden integrar FUSED en sus pipelines de moderación para identificar imágenes alteradas que puedan difundir desinformación.
- Análisis forense en investigaciones legales: peritos pueden utilizar el modelo para localizar regiones concretas de una imagen que han sido rellenadas, aportando evidencia técnica en casos judiciales.
- Control de calidad en bancos de imágenes: agencias de stock pueden verificar que las imágenes subidas no contengan ediciones no declaradas mediante inpainting.
- Investigación académica en forense digital: investigadores pueden usar FUSED como baseline o componente en estudios sobre detección de manipulaciones, gracias a su licencia MIT y su arquitectura modular.
- Desarrollo de herramientas de análisis de imágenes: desarrolladores pueden integrar FUSED en aplicaciones de escritorio o web para ofrecer servicios de verificación de integridad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como precisión, recall o IoU en los conjuntos de datos utilizados.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación proporcionada. Dado que el modelo incluye un ConvNeXt-XXL (arquitectura de gran tamaño) y un SparseViT, es razonable esperar que requiera una GPU con al menos 16 GB de VRAM para inferencia, aunque no se confirma. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se recomienda consultar el repositorio de GitHub para obtener detalles sobre el entorno de ejecución.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- El modelo está especializado en detección de inpainting y puede no generalizar a otros tipos de manipulación (splicing, copy-move, etc.).
- Los checkpoints están entrenados en conjuntos de datos específicos (OpenSDID y So-Fake), por lo que su rendimiento puede degradarse en imágenes con distribuciones muy diferentes.
- El ConvNeXt-XXL no se almacena en el repositorio; se carga desde `timm` (`convnext_xxlarge.clip_laion2b_soup`), lo que requiere conexión a internet y la instalación de esa librería.
- No se proporcionan métricas de rendimiento ni estudios de sesgos, por lo que se desconoce su comportamiento en poblaciones o estilos de imagen diversos.
- Al ser un modelo de investigación, no se garantiza su idoneidad para producción sin una validación adicional.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las licencias de los datos de entrenamiento subyacentes.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/aonuzhdin/FUSED
- Repositorio de GitHub (mencionado en la model card): https://github.com/AntonNuzhdin/FUSED
- Perfil del autor en Hugging Face: https://huggingface.co/aonuzhdin
