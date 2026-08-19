# harphool17/tumtraf-coopdet3d-base

## Resumen

CoopDet3D es un modelo de percepción cooperativa multimodal para detección 3D de objetos en escenarios de tráfico, desarrollado por el equipo del dataset TUMTraf y presentado en el CVPR 2024. El modelo fusiona información de cámaras y LiDAR procedentes de múltiples agentes (vehículos e infraestructura vial) para mejorar la precisión de la detección en entornos complejos. Este repositorio concreto, `harphool17/tumtraf-coopdet3d-base`, contiene los pesos preentrenados oficiales del modelo base, utilizados como punto de partida para la participación en el DriveX Grand Challenge 2026, donde se obtuvo el tercer puesto internacional con una mAP de 0.9062.

La relevancia actual de este modelo radica en su capacidad para abordar la percepción cooperativa V2X (vehicle-to-everything), un área clave para la conducción autónoma segura. Al combinar sensores heterogéneos y datos de múltiples ubicaciones, CoopDet3D demuestra mejoras significativas frente a enfoques de detección individual. La arquitectura se basa en una fusión cooperativa que integra características de cámara y LiDAR mediante mecanismos de atención, permitiendo una representación unificada del entorno. El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo de dimensiones moderadas, aunque no se especifican los parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CoopDet3D (fusión cooperativa cámara + LiDAR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT (según repositorio oficial del modelo; no especificada en la model card de HuggingFace) |
| Formato de pesos | no disponible (probablemente .pth o .pt, no confirmado) |

## Arquitectura y entrenamiento

CoopDet3D es un modelo de fusión cooperativa multimodal diseñado para la detección 3D de objetos. Su arquitectura integra características extraídas de cámaras y LiDAR de múltiples agentes (vehículos e infraestructura) mediante un mecanismo de atención cruzada, lo que permite combinar información de sensores heterogéneos y ubicaciones distintas. El modelo se entrena sobre el dataset TUMTraf-V2X, que contiene 2.000 nubes de puntos etiquetadas y 5.000 imágenes procedentes de cinco sensores en infraestructura y cuatro sensores a bordo de vehículos, con un total de 30.000 cajas 3D anotadas con identificadores de seguimiento y datos GPS/IMU.

El entrenamiento se realiza de forma supervisada para la detección de objetos en 3D, con clases como autobús, bicicleta y peatón. No se han publicado detalles sobre el número de épocas, el optimizador o las técnicas de regularización empleadas. El modelo base aquí presentado corresponde a los pesos preentrenados oficiales, que posteriormente se ajustan para tareas específicas de la competición DriveX. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección 3D de objetos en escenarios de tráfico, incluyendo autobuses, bicicletas y peatones.
- Fusión cooperativa de datos de cámara y LiDAR procedentes de múltiples agentes (vehículos e infraestructura).
- Integración de información de sensores heterogéneos mediante atención cruzada, lo que permite una representación unificada del entorno.
- Soporte para percepción cooperativa V2X, mejorando la robustez frente a oclusiones y campos de visión limitados.
- Capacidad de procesar datos de múltiples puntos de vista simultáneamente, gracias a la fusión de sensores de distintos agentes.
- No incluye capacidades de generación de texto, razonamiento simbólico ni procesamiento de lenguaje natural.

## Casos de uso

- Conducción autónoma cooperativa: el modelo puede integrarse en sistemas de vehículos conectados para fusionar percepciones de varios vehículos y de la infraestructura, permitiendo una detección más fiable de peatones y ciclistas en cruces complejos.
- Gestión inteligente del tráfico: las autoridades pueden desplegar sensores en infraestructura (semáforos, postes) y utilizar CoopDet3D para monitorizar intersecciones, detectar vehículos y peatones en tiempo real, mejorando la seguridad vial.
- Sistemas avanzados de asistencia al conductor (ADAS): el modelo puede procesar datos de cámaras y LiDAR a bordo del vehículo, junto con información de otros agentes, para alertar sobre obstáculos en puntos ciegos.
- Investigación en percepción V2X: los investigadores pueden utilizar estos pesos preentrenados como punto de partida para desarrollar nuevas arquitecturas de fusión cooperativa o para evaluar mejoras en datasets propios.
- Simulación de entornos de tráfico: el modelo puede emplearse en simuladores para generar detecciones realistas de objetos en escenarios cooperativos, facilitando el entrenamiento de políticas de conducción.
- Evaluación de algoritmos de fusión multimodal: dado que el modelo ya está preentrenado, sirve como referencia para comparar el rendimiento de otras técnicas de fusión cámara-LiDAR en tareas de detección 3D.

## Benchmarks y rendimiento

Según la model card, los resultados de la submission final en el CodaBench del DriveX Grand Challenge 2026 son los siguientes:

| Clase | AP |
|---|---|
| BUS | 1.000 |
| BICYCLE | 0.866 |
| PEDESTRIAN | 0.696 |
| **mAP** | **0.9062** |

Estos resultados corresponden al modelo ajustado para la competición, no necesariamente al modelo base preentrenado. En la búsqueda web se mencionan otros valores (BUS 1.0, PEDESTRIAN 0.569, BICYCLE 0.820) que podrían corresponder al modelo base sin fine-tuning, pero no se especifica claramente su origen. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible. El tamaño del repositorio es de 0.3 GB, lo que sugiere que los pesos del modelo son relativamente compactos, pero no se puede estimar la VRAM necesaria sin conocer la arquitectura completa y la resolución de las entradas.
- Para inferencia, se recomienda una GPU con al menos 8 GB de VRAM si se utilizan imágenes de alta resolución y nubes de puntos densas, aunque no hay datos oficiales.
- Dado que es un modelo de visión y fusión, es probable que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no está confirmado.
- Opciones de despliegue: no se mencionan frameworks específicos. Al ser un modelo basado en PyTorch (probablemente), se podría servir con TorchServe o mediante scripts personalizados. No hay soporte conocido para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección cooperativa 3D en los datos proporcionados. Existen alternativas como V2X-ViT o CoBEVT, pero no se han encontrado datos de rendimiento comparables en esta búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El dataset TUMTraf-V2X es relativamente pequeño (2.000 nubes de puntos y 5.000 imágenes), lo que puede limitar la generalización del modelo a escenarios muy diversos.
- La licencia del dataset es CC BY-NC-ND 4.0, lo que restringe su uso comercial y prohíbe la creación de obras derivadas. Aunque el modelo en sí está bajo MIT, el uso del dataset para entrenamiento o fine-tuning puede estar sujeto a estas restricciones.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno de tráfico concreto (probablemente alemán), podría tener un rendimiento inferior en otras regiones con diferentes infraestructuras o tipos de vehículos.
- La model card no especifica la licencia del modelo en HuggingFace, aunque el repositorio oficial indica MIT. Se recomienda verificar antes de un uso comercial.
- No se proporcionan detalles sobre la robustez ante condiciones climáticas adversas o situaciones de oclusión severa, más allá de lo que permite la fusión cooperativa.
- El modelo no es un sistema de lenguaje, por lo que no debe utilizarse para tareas de NLP.

## Enlaces

- HuggingFace: https://huggingface.co/harphool17/tumtraf-coopdet3d-base
- Paper (arXiv): https://arxiv.org/abs/2403.01316
- Repositorio oficial del modelo: https://github.com/tum-traffic-dataset/coopdet3d
- Web del dataset TUMTraf-V2X: https://tum-traffic-dataset.github.io/tumtraf-v2x/
