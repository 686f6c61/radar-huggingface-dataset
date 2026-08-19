# AayushiBhatiya/Skeleton_Free_Motion_Transfer_Aayushi_Bhatiya_250272297

## Resumen

El modelo `Skeleton_Free_Motion_Transfer` es un sistema de transferencia de movimiento sin esqueleto desarrollado como proyecto de disertación de máster en Queen Mary University of London. Su objetivo es transferir capturas de movimiento humano (del dataset AMASS) a mallas animales no riggeadas (del dataset DeformingThings4D) sin necesidad de esqueleto, rig ni datos apareados. Para ello, el modelo predice un campo de Jacobianos por cara que se integra mediante una solución de Poisson diferenciable, permitiendo deformar la malla objetivo de forma coherente con el movimiento de origen.

La arquitectura combina un codificador de forma basado en PointNet++, un codificador de movimiento basado en GRU, y un decodificador que produce el campo de Jacobianos. El modelo se entrena con varias funciones de pérdida (perceptual, rigidez ARAP, consistencia cíclica) y se publican múltiples checkpoints correspondientes a distintas ablaciones. El tamaño total de parámetros no se especifica en la información disponible, y el repositorio contiene únicamente los pesos en formato PyTorch state dict.

La relevancia de este trabajo radica en que aborda un problema abierto en animación 3D: transferir movimiento entre mallas con topologías y estructuras completamente diferentes sin requerir correspondencias explícitas ni rigging manual. El modelo card advierte explícitamente que el resultado principal es metodológico y que algunas afirmaciones de mejora (como la pérdida perceptual) no se sostienen tras controlar por el desplazamiento de la malla.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de forma (PointNet++), codificador de movimiento (GRU), decodificador de campo de Jacobianos + solve de Poisson diferenciable |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de geometría 3D, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantización publicada) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | research-only-amass-derived (uso exclusivo para investigación y no comercial, derivada de la licencia de AMASS) |
| Formato de pesos | PyTorch state dicts (`.pt`) con estructura `{"step", "model", "optimizer", "scheduler", "best_val", "cfg"}` |

## Arquitectura y entrenamiento

El modelo sigue un enfoque de transferencia de deformación sin esqueleto. La entrada es una malla objetivo (animal) y una secuencia de poses humanas (AMASS). Un codificador de forma PointNet++ extrae características geométricas de la malla, mientras que un codificador GRU procesa la secuencia de movimiento. Ambos embeddings se combinan y un decodificador predice un campo de Jacobianos por cara, que luego se integra mediante un solve de Poisson diferenciable para obtener la deformación final de la malla.

El entrenamiento se realiza sin datos apareados: se utilizan pérdidas de consistencia cíclica, rigidez (ARAP) y una pérdida perceptual (LVDP, basada en DINOv2) para guiar la transferencia. Los checkpoints publicados corresponden a distintas configuraciones de pérdidas y semillas, incluyendo ablaciones donde se elimina cada término por separado. El modelo card documenta que la pérdida perceptual no produce una mejora significativa (resultado nulo) y que la métrica de rigidez está confundida con el desplazamiento de la malla, por lo que las conclusiones principales se limitan a la viabilidad del sustrato de deformación y a un trade-off real entre precisión y rigidez cuando se elimina el término ARAP.

## Capacidades

- Transferencia de movimiento entre mallas con topologías diferentes sin esqueleto ni rig.
- Predicción de campos de Jacobianos por cara y reconstrucción de la deformación mediante solve de Poisson.
- Soporte para secuencias de movimiento (entrada temporal) gracias al codificador GRU.
- Manejo de mallas arbitrarias (no solo humanoides) siempre que estén en el dominio de DeformingThings4D.
- Capacidad de warm-start desde reconstrucciones within-identity para mejorar la convergencia en transferencias cross-identity.
- No incluye capacidades de generación de texto, código, visión general ni tool calling.

## Casos de uso

- Animación de personajes 3D para producción independiente: el modelo permite transferir capturas de movimiento humano a criaturas o animales sin necesidad de riggear manualmente, acelerando el pipeline de animación en estudios pequeños.
- Prototipado rápido en VFX: los artistas pueden aplicar movimientos capturados a mallas provisionales para previsualizar escenas sin invertir horas en setup de rigs.
- Investigación en transferencia de deformación: sirve como punto de partida para estudiar métodos sin esqueleto, especialmente para analizar la interacción entre pérdidas de rigidez y perceptuales.
- Generación de datos sintéticos de movimiento para entrenar otros modelos: las mallas deformadas pueden usarse como ground truth para tareas de predicción de movimiento o reconstrucción 3D.
- Simulación de biomecánica animal: al transferir movimientos humanos a mallas animales, se pueden explorar hipótesis sobre locomoción y posturas sin necesidad de captura de movimiento animal.
- Educación y demostraciones en gráficos por computador: el modelo sirve como ejemplo práctico de técnicas de diferenciación geométrica y optimización de mallas en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval, etc.) porque el modelo no pertenece a la categoría de modelos de lenguaje. Los resultados reportados en la model card son específicos del proyecto:

- Se establece un trade-off real entre precisión y rigidez cuando se elimina el término ARAP (factor 2.28x, p<0.001).
- Se observa paridad (no mejora) con un baseline SfPT reproducido en la métrica ARAP clásica.
- Se diagnostica y corrige parcialmente un fallo de colapso por inversión geométrica.
- La pérdida perceptual (LVDP) no produce una mejora significativa (resultado nulo, p=0.016 pero no identificable al controlar por desplazamiento).

No se proporcionan números absolutos de métricas como error medio de vértice o IoU, por lo que no es posible presentar una tabla comparativa con otros métodos.

## Requisitos de hardware

- No se especifican requisitos concretos de VRAM ni GPU en la información disponible.
- Dado que el modelo procesa mallas 3D y utiliza PyTorch3D, se requiere una GPU NVIDIA con soporte CUDA y suficiente memoria para alojar las mallas y los tensores intermedios. Para mallas de tamaño moderado (decenas de miles de caras), una GPU de gama media (por ejemplo, RTX 3060 con 12 GB) podría ser suficiente, pero no está confirmado.
- El repositorio solo contiene pesos, no el código de inferencia. El código se encuentra en el repositorio del proyecto (no enlazado en la model card), por lo que el despliegue requiere reconstruir la arquitectura `MotionTransferModel` desde `src/models/pipeline.py`.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de una comparativa formal con otros métodos de transferencia de deformación sin esqueleto en la información proporcionada. La model card menciona un baseline "SfPT" (Skeleton-free Pose Transfer) reproducido para comparar la métrica ARAP, pero no se dan detalles de parámetros, contexto ni rendimiento. Por tanto, no es posible construir una tabla comparativa fiable.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: los pesos se derivan de AMASS, que tiene una licencia académica. Cualquier uso comercial queda excluido, y el usuario debe revisar los términos de AMASS y DeformingThings4D antes de utilizarlos.
- Resultados metodológicos limitados: la model card advierte que la afirmación principal de mejora con la pérdida perceptual es un resultado nulo, y que las métricas de rigidez están confundidas con el desplazamiento de la malla. No se debe confiar en mejoras cuantitativas sin controlar ese factor.
- Dependencia de datos con licencia: para ejecutar los checkpoints se necesita acceso a AMASS, SMPL-H y DeformingThings4D, que no se redistribuyen y tienen sus propias restricciones.
- Fallo de colapso por inversión geométrica: se ha diagnosticado este fallo en algunas configuraciones; aunque se ha mitigado parcialmente, no está completamente resuelto.
- Sin soporte para mallas fuera del dominio de entrenamiento: el modelo está entrenado con DeformingThings4D, por lo que su generalización a otras topologías o categorías de malla no está garantizada.
- El repositorio no incluye código de inferencia, solo pesos. El usuario debe obtener el código del proyecto desde otra fuente (no enlazada en la model card).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AayushiBhatiya/Skeleton_Free_Motion_Transfer_Aayushi_Bhatiya_250272297
- Licencia AMASS: https://amass.is.tue.mpg.de/license.html
- Dataset AMASS: https://amass.is.tue.mpg.de
- DeformingThings4D: https://github.com/rabbityl/DeformingThings4D
- Neural Jacobian Fields (paper base): https://dl.acm.org/doi/10.1145/3528223.3530120 (referencia en el modelo card)
- DINOv2 (usado en la pérdida perceptual): https://github.com/facebookresearch/dinov2 (mencionado en el modelo card)
