# RoyYang0714/3D-MOOD

## Resumen

3D-MOOD (3D Monocular Open-set Object Detector) es el primer detector de objetos 3D monocular de extremo a extremo diseñado para entornos de conjunto abierto (open-set). Desarrollado por un equipo de investigadores de ETH Zurich y CVG (Computer Vision and Geometry Group), el modelo resuelve el problema de la detección de objetos en 3D a partir de una única imagen cuando aparecen categorías de objetos y escenas no vistas durante el entrenamiento. Los métodos anteriores se limitaban a conjuntos cerrados, donde las clases y escenas de entrenamiento y prueba coinciden, lo que falla en aplicaciones reales como robótica o realidad aumentada.

La propuesta técnica consiste en "elevar" (lift) la detección 2D open-set al espacio 3D mediante una cabeza de caja delimitadora 3D, permitiendo el entrenamiento conjunto de tareas 2D y 3D. Las consultas de objeto se condicionan con una prioridad geométrica para mejorar la generalización en la estimación 3D entre escenas diversas, y se introduce un espacio de imagen canónico para un entrenamiento eficiente entre conjuntos de datos. El modelo se evalúa tanto en configuración de conjunto cerrado (Omni3D) como en open-set (Omni3D a Argoverse 2 y ScanNet), logrando resultados de última generación. El repositorio de Hugging Face tiene un tamaño de 1,8 GB y está publicado bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos 3D monocular basado en transformer (estilo DETR) con cabeza de caja 3D y consultas condicionadas geométricamente |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (binarios .pt / .pth, no se especifica safetensors) |

## Arquitectura y entrenamiento

3D-MOOD se basa en un detector de objetos 2D open-set (probablemente un transformer con consultas de objeto, similar a DETR o variantes) al que se añade una cabeza de regresión de cajas 3D. La clave está en el "lifting" de la detección 2D al espacio 3D: las consultas de objeto se inicializan con una prioridad geométrica (por ejemplo, distribución de tamaños y posiciones 3D esperadas) que permite una estimación 3D robusta incluso para categorías no vistas. Además, se define un espacio de imagen canónico que normaliza las imágenes de diferentes conjuntos de datos para facilitar el entrenamiento conjunto entre datasets heterogéneos (Omni3D, Argoverse 2, ScanNet).

El entrenamiento es conjunto y de extremo a extremo para las tareas 2D y 3D, lo que mejora el rendimiento global frente a pipelines separados. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de refuerzo (RLHF/DPO), ya que no es un modelo de lenguaje. El código oficial está disponible en GitHub (cvg/3D-MOOD) y el modelo se publica bajo Apache 2.0.

## Capacidades

- Detección de objetos 3D monocular: estima la posición, dimensiones y orientación de objetos en 3D a partir de una única imagen RGB.
- Open-set: reconoce categorías de objetos no vistas durante el entrenamiento, gracias a la generalización del espacio de características 2D y la prioridad geométrica.
- Generalización entre escenas: funciona en entornos diversos (interiores, exteriores, conducción) sin reentrenamiento específico.
- Entrenamiento conjunto 2D+3D: la cabeza 2D y la 3D se optimizan simultáneamente, mejorando la coherencia de las predicciones.
- Compatibilidad con múltiples datasets: diseñado para entrenamiento cross-dataset mediante el espacio de imagen canónico.
- Inferencia de extremo a extremo: no requiere etapas post-procesado complejas, produce directamente cajas 3D.

## Casos de uso

- Robótica de servicio: un robot móvil puede detectar y localizar objetos novedosos en entornos domésticos u oficinas sin necesidad de reentrenamiento para cada categoría, gracias a la capacidad open-set y la estimación 3D a partir de una cámara monocular.
- Realidad aumentada y virtual: superposición de objetos virtuales en el mundo real requiere conocer la posición y orientación 3D de los objetos físicos; 3D-MOOD permite anclar contenido AR a objetos no catalogados previamente.
- Conducción autónoma: detección de vehículos, peatones y obstáculos en escenarios urbanos, con capacidad de generalizar a nuevas categorías o entornos de conducción no vistos en el entrenamiento.
- Navegación autónoma de drones: un dron puede evitar colisiones con objetos desconocidos (ramas, cables, animales) estimando su posición 3D en tiempo real a partir de una cámara a bordo.
- Inspección industrial: detección de piezas o defectos en entornos de fabricación donde las categorías de objetos pueden cambiar según la línea de producción; la naturaleza open-set evita retrenar el modelo para cada nueva pieza.
- Gestión de inventario en almacenes: localización de objetos en 3D para robots de picking, incluyendo cajas o productos no predefinidos, usando solo una cámara monocular montada en el brazo robótico.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper (arXiv 2507.23567) indica que el modelo logra resultados de última generación (SOTA) en los conjuntos de evaluación Omni3D (closed-set) y en la transferencia open-set de Omni3D a Argoverse 2 y ScanNet, pero no se proporcionan métricas concretas (como AP3D, AP2D, etc.) en la model card ni en los resultados de búsqueda. Se recomienda consultar el paper para obtener los valores exactos.

## Requisitos de hardware

- El repositorio pesa 1,8 GB, lo que sugiere un modelo de tamaño medio (probablemente entre 100 y 300 millones de parámetros, aunque no se confirma).
- No se especifican requisitos de VRAM ni GPUs recomendadas en la documentación disponible.
- Al ser un modelo PyTorch estándar para visión, se puede ejecutar en GPUs de consumo como RTX 3090/4090 (24 GB) para inferencia, y en GPUs de datacenter (A100, H100) para entrenamiento.
- Opciones de despliegue: el código oficial en GitHub proporciona scripts de demo (`demo.py`) y el modelo se puede integrar en pipelines PyTorch. No hay soporte documentado para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Open-set | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 3D-MOOD | Detector 3D monocular | Sí | no disponible | no aplica | Apache 2.0 | HF, GitHub |
| MonoDETR | Detector 3D monocular | No | ~35 M | no aplica | MIT | GitHub |
| SMOKE | Detector 3D monocular | No | ~20 M | no aplica | MIT | GitHub |
| MonoDETR3D | Detector 3D monocular | No | no disponible | no aplica | Apache 2.0 | GitHub |

La diferencia principal de 3D-MOOD frente a alternativas como MonoDETR o SMOKE es su capacidad open-set y el entrenamiento conjunto 2D+3D. No hay datos de rendimiento comparativo disponibles en la información recopilada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicas del modelo; al ser un detector de objetos, el riesgo de alucinación se traduce en falsos positivos de cajas 3D.
- La generalización open-set tiene límites: categorías muy diferentes a las vistas en el entrenamiento pueden no detectarse correctamente, a pesar de la prioridad geométrica.
- La estimación 3D monocular es inherentemente ambigua (problema de escala y profundidad), lo que puede producir errores en distancias lejanas o con oclusiones.
- No hay información sobre el rendimiento en condiciones adversas (iluminación extrema, desenfoque, etc.).
- El modelo está pensado para imágenes estáticas; no se ha validado para vídeo en tiempo real con secuencias temporales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el paper y el código para verificar atribuciones y patentes asociadas.

## Enlaces

- Hugging Face: https://huggingface.co/RoyYang0714/3D-MOOD
- Paper (arXiv): https://huggingface.co/papers/2507.23567
- Página del proyecto: https://royyang0714.github.io/3D-MOOD/
- Código en GitHub: https://github.com/cvg/3D-MOOD
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/RoyYang0714/3D-MOOD
- Dataset en Hugging Face: https://huggingface.co/datasets/RoyYang0714/3D-MOOD
