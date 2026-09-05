# AST-1320/DA3-BASE

## Resumen

Depth Anything 3 (DA3) es un modelo de visión computacional desarrollado por el equipo ByteDance Seed que predice geometría espacialmente consistente a partir de un número arbitrario de imágenes, con o sin poses de cámara conocidas. Su objetivo es unificar tareas de visión geométrica como la estimación de profundidad monocular y multi-view, la estimación de pose de cámara y la reconstrucción 3D en un solo modelo. La arquitectura es un transformer plano (basado en un codificador DINO estándar) que utiliza una representación unificada de rayos de profundidad, lo que evita la necesidad de aprendizaje multitarea complejo. El modelo DA3-BASE tiene 135.366.599 parámetros (aproximadamente 0.12B) y se ha entrenado exclusivamente con datasets académicos públicos. Es relevante porque establece un nuevo estado del arte en el benchmark de geometría visual que proponen los autores, superando a VGGT en precisión de pose de cámara y precisión geométrica, y a Depth Anything 2 en estimación de profundidad monocular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (transformer plano) con representacion de rayos de profundidad unificada |
| Parametros totales | 135.366.599 (0.12B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DA3 se basa en un transformer plano sin especialización arquitectónica, utilizando un codificador DINO estándar como backbone. La innovación clave es la representación de rayos de profundidad: en lugar de predecir mapas de profundidad y poses de cámara de forma separada, el modelo predice un único objetivo que codifica la geometría de la escena, lo que simplifica el entrenamiento y mejora la consistencia espacial. El entrenamiento sigue un paradigma profesor-alumno, donde el modelo estudiante aprende a imitar las predicciones de un modelo profesor, logrando un nivel de detalle y generalización comparable al de Depth Anything 2. Todos los datos de entrenamiento provienen de datasets académicos públicos, sin uso de datos propietarios.

## Capacidades

- Estimación de profundidad relativa en imágenes individuales y en múltiples vistas.
- Estimación de pose de cámara (extrínsecos e intrínsecos) a partir de imágenes.
- Pose conditioning, es decir, capacidad de condicionar la predicción a poses conocidas.
- Generación de geometría 3D exportable a formatos como GLB, PLY, NPZ o nubes de puntos Gaussianas.
- Cálculo de mapas de confianza que indican la fiabilidad de la profundidad estimada.
- Soporte de entrada de un número arbitrario de imágenes (any-view), no limitado a pares o secuencias fijas.
- No soporta generación de texto, tool calling, ni tareas de lenguaje.

## Casos de uso

- Reconstrucción 3D de escenas a partir de fotografías: el modelo procesa varias imágenes de una escena y exporta una malla 3D en formato GLB, útil para visualización arquitectónica o documentación patrimonial.
- Navegación robótica: los mapas de profundidad y las poses de cámara estimadas permiten a un robot localizarse y planificar rutas en entornos interiores o exteriores.
- Realidad aumentada: la estimación de pose y profundidad en tiempo real permite anclar objetos virtuales a la geometría del mundo real, mejorando la oclusión y el escalado.
- Fotogrametría ligera: para generar nubes de puntos (PLY) o modelos 3D a partir de conjuntos pequeños de imágenes, sin necesidad de equipos LiDAR.
- Percepción en conducción autónoma: la estimación de profundidad monocular y multi-view proporciona información de distancia de objetos y estructura de la escena, complementando sensores activos.
- Análisis de secuencias de vídeo: el modelo puede procesar frames consecutivos para reconstruir la escena y estimar el movimiento de la cámara, útil en posprocesado de vídeo o cinematografía virtual.
- Generación de activos 3D para videojuegos: a partir de referencias fotográficas, se puede obtener geometría aproximada para integrarla en pipelines de modelado.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. La model card indica que DA3 supera a VGGT en un promedio del 44.3% en precisión de pose de cámara y del 25.1% en precisión geométrica, y que supera a Depth Anything 2 en estimación de profundidad monocular. No se proporcionan cifras absolutas en la documentación consultada.

| Comparación | Mejora relativa |
|---|---|
| DA3 vs. VGGT (precisión de pose de cámara) | +44.3% |
| DA3 vs. VGGT (precisión geométrica) | +25.1% |
| DA3 vs. Depth Anything 2 (profundidad monocular) | Supera, sin cifras publicadas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. Dado el tamaño del modelo (135M parámetros), es plausible que funcione en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: inferencia local mediante PyTorch, usando la API `DepthAnything3.from_pretrained`; también se ofrece una interfaz de línea de comandos (`da3 auto`) y un modo backend para inferencia repetida.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DA3-BASE | 135M | No aplica | Apache 2.0 | HuggingFace, GitHub | Nuevo SOTA en geometría visual multi-view |
| Depth Anything 2 | No disponible | No aplica | No disponible | No disponible | Modelo de profundidad monocular, superado por DA3 |
| VGGT | No disponible | No aplica | No disponible | No disponible | Modelo multi-view previo, superado por DA3 en pose y geometría |

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente con datasets académicos, por lo que puede presentar limitaciones en imágenes de dominios específicos no representados (por ejemplo, fotografía médica, imágenes aéreas muy concretas o texturas inusuales).
- El rendimiento puede degradarse con imágenes de baja calidad, condiciones de iluminación extremas o escenas con geometría ambigua (superficies reflectantes, oclusiones complejas).
- Al ser un modelo de visión, no aplican sesgos lingüísticos, pero sí pueden existir sesgos en la estimación de profundidad según la distribución de los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se cumplan los términos de la licencia.
- Se recomienda verificar la procedencia del repositorio: el modelo está disponible como `AST-1320/DA3-BASE` en HuggingFace, pero la model card hace referencia a `depth-anything/da3-base` como fuente oficial. Conviene utilizar la versión oficial para producción.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/AST-1320/DA3-BASE
- Página del proyecto: https://depth-anything-3.github.io
- Paper: https://arxiv.org/abs/2511.10647
- Repositorio de GitHub: https://github.com/ByteDance-Seed/depth-anything-3
- Demo en HuggingFace: https://huggingface.co/spaces/depth-anything/Depth-Anything-3
- Documentación: https://github.com/ByteDance-Seed/depth-anything-3#-useful-documentation
