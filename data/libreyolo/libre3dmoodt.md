# LibreYOLO/Libre3DMOODt

## Resumen

Libre3DMOODt es un checkpoint para detección de objetos 3D monocular, basado en la arquitectura 3D-MOOD con backbone Swin-Tiny. El modelo fue adaptado por el proyecto LibreYOLO para exponerse a través de su API `detect3d`, manteniendo los parámetros aprendidos y la serialización originales del sistema upstream desarrollado por el Computer Vision and Geometry Lab de ETH Zurich. Resuelve el problema de localizar y dimensionar objetos en el espacio tridimensional a partir de una única imagen RGB, utilizando además las intrinsics de la cámara como entrada obligatoria. Su relevancia actual radica en que combina detección 3D con vocabulario abierto, permitiendo consultas de texto para identificar categorías arbitrarias, todo ello bajo una licencia Apache-2.0.

El modelo se distribuye como un archivo `.pt` de 0.8 GB, y la integración en LibreYOLO es exclusivamente para inferencia, sin soporte de entrenamiento. Al no ser un modelo de lenguaje, no se aplican conceptos como longitud de contexto ni cuantización típica de LLMs. La implementación evita la extensión `vis4d_cuda_ops` de licencia no declarada, seleccionando en su lugar una ruta de atención PyTorch portátil y permisiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D-MOOD con backbone Swin-T (Transformer) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch checkpoint) |

## Arquitectura y entrenamiento

El modelo se basa en el sistema 3D-MOOD, una arquitectura que combina un backbone Swin-Tiny con un módulo de detección de objetos 3D monocular. El checkpoint original fue entrenado durante 120 épocas en el dataset Omni3D, tal como se indica en la nomenclatura del fichero fuente: `gdino3d_swin-t_120e_omni3d_699f69.pt`. La entrada del modelo consiste en una imagen RGB y las intrinsics de la cámara, junto con una consulta de texto para especificar las categorías de interés. Como salida, produce cajas tridimensionales y un mapa de profundidad.

No se han publicado en la información disponible los detalles sobre el proceso de entrenamiento, como la composición exacta del dataset, número de tokens o si se aplicaron técnicas de ajuste por preferencias (RLHF/DPO). El checkpoint se ha reutilizado de manera íntegra, sin modificar los pesos aprendidos. La adaptación realizada por LibreYOLO se limita a la capa de integración, sustituyendo la extensión CUDA del runtime upstream por una implementación portable de atención en PyTorch.

## Capacidades

- Detección de objetos 3D monocular a partir de una única imagen RGB.
- Vocabulario abierto: permite indicar categorías mediante consultas de texto, por ejemplo `["chair", "table"]`.
- Generación de cajas tridimensionales (`boxes3d.xyz`) con coordenadas en el espacio.
- Estimación de mapas de profundidad (`depth_map`).
- Requiere intrinsics de cámara como entrada para la proyección 3D.
- Integración exclusiva de inferencia través de la API `detect3d` de LibreYOLO.
- No soporta function calling, tool calling ni razonamiento multi-step (no aplica a modelos de visión).
- No dispone de capacidades de visión más allá de detección 3D, ni entrada de audio.

## Casos de uso

- Robótica de manipulación: el modelo puede integrarse en un sistema robótico para identificar objetos en el espacio de trabajo y calcular su posición y orientación 3D, facilitando tareas de agarre y ensamblaje a partir de una sola cámara monocular.

- Conducción autónoma: en vehículos con cámaras frontales, permite estimar la ubicación tridimensional de obstáculos como vehículos o peatones, complementando o sustituyendo a sensores LIDAR en escenarios de bajo coste.

- Realidad aumentada: al generar cajas 3D y profundidad, posibilita el anclaje de objetos virtuales en escenas reales con una oclusión correcta, útil para aplicaciones de visualización arquitectónica o retail virtual.

- Logística y almacenes: automatiza el inventario detectando palets, cajas y productos en estanterías, devolviendo su tamaño y posición en tres dimensiones para planificar rutas de robots móviles.

- Monitorización de seguridad: en cámaras fijas, detecta objetos y personas en 3D, lo que permite medir distancias y velocidades aproximadas de los sujetos en la escena.

- Análisis con drones: en imágenes aéreas captadas por un dron, el modelo puede identificar estructuras o vehículos con coordenadas tridimensionales, aportando información métrica para cartografía o inspección de infraestructuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles.
- No se ha confirmado si el modelo puede ejecutarse en GPUs de consumo, aunque el tamaño del repositorio (0.8 GB) sugiere un checkpoint ligero.
- Opciones de despliegue: la integración requiere un runtime de 3D-MOOD instalado por separado y un intérprete de Python virtual, además de la librería LibreYOLO. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, Libre3DMOODt es una variante con backbone Swin-T dentro de la familia 3D-MOOD, que también incluye configuraciones con backbones más grandes como Swin-L, pero no se han facilitado resultados cuantitativos para dichas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información específica, pero al tratarse de un modelo de vocabulario abierto entrenado en el dataset Omni3D, es probable que su rendimiento sea desigual según la categoría consultada.
- Riesgo de alucinación: la detección 3D monocular puede producir falsos positivos o errores en la estimación de profundidad, especialmente en escenas con oclusiones complejas.
- Limitaciones de entrada: las intrinsics de cámara son obligatorias; no se puede utilizar el modelo sin ellas.
- La integración es solo de inferencia; no se proporciona soporte para reentrenamiento o ajuste fino a través de LibreYOLO.
- Al sustituir la extensión `vis4d_cuda_ops` por una ruta de atención PyTorch portable, el rendimiento numérico podría diferir ligeramente del checkpoint original.
- Licencia Apache-2.0: permite uso comercial y modificación, pero debe conservarse el aviso de copyright del laboratorio ETH Zurich.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/Libre3DMOODt
- Repositorio upstream de 3D-MOOD: https://github.com/cvg/3D-MOOD
- Checkpoint fuente: https://huggingface.co/RoyYang0714/3D-MOOD
- GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Sitio web de LibreYOLO: https://www.libreyolo.com/
