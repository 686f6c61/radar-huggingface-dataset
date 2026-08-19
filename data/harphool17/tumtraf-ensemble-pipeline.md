# harphool17/tumtraf-ensemble-pipeline

## Resumen

El repositorio `harphool17/tumtraf-ensemble-pipeline` contiene el pipeline de ensemble que obtuvo el tercer puesto en la competición DriveX 2026 sobre el dataset TUMTraf V2X, un conjunto de datos de percepción cooperativa para conducción autónoma. El pipeline combina múltiples modelos de detección 3D (CoopDet3D y CenterPoint) mediante una estrategia de votación y fusión a nivel de predicciones, logrando un mAP de 0.9062 en la tarea de detección de objetos 3D en intersecciones con sensores de carretera y a bordo.

El autor, harphool17 (Harphool Singh Bajdoliya), es un desarrollador activo en Hugging Face con otros proyectos como un fine-tune de NVIDIA Parakeet para reconocimiento de voz. Este pipeline no es un modelo de lenguaje ni un modelo único, sino un sistema de ensamblaje de predicciones que aprovecha las fortalezas de diferentes arquitecturas de detección. Su relevancia radica en demostrar cómo la combinación estratégica de modelos puede superar el rendimiento de cualquier modelo individual en tareas de percepción 3D cooperativa, un campo crítico para la seguridad en vehículos autónomos.

La información disponible se limita a la model card del autor y algunos enlaces externos; no se proporcionan detalles sobre arquitectura interna, parámetros o licencia, por lo que muchos campos técnicos quedan sin especificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de detección 3D: CoopDet3D (base y variantes) + CenterPoint (Ep150, Ep180) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (tarea de percepción, no procesamiento de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa datos de sensores LiDAR y cámaras) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoints de PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El pipeline no es un modelo único sino un sistema de ensamblaje que combina las predicciones de varios modelos de detección 3D. Según la model card, se utilizan:

- **CoopDet3D** en varias versiones: base, "ped-boost Ep18", "Ep60", y "Ep60" con relleno de CenterPoint. CoopDet3D es un modelo cooperativo de fusión multimodal que procesa datos de LiDAR y cámaras de múltiples agentes (vehículos e infraestructura).
- **CenterPoint** en dos versiones: Ep150 y Ep180, un detector basado en puntos que utiliza centros de objetos como representación intermedia.

La estrategia de ensemble incluye:
- **Selección por clase del mejor modelo**: se elige el modelo con mejor rendimiento histórico para cada tipo de vehículo.
- **Unión multi-época para peatones**: se fusionan predicciones de las épocas 46, 48, 50, 52, 55, 58 y 60 del modelo CoopDet3D, con umbral de confianza >0.30 y distancia >1.5m.
- **Relleno quirúrgico sin solapamiento**: las predicciones de alta confianza de CenterPoint Ep150 se insertan solo en espacios vacíos donde el modelo de cámara no detectó nada, evitando cajas duplicadas.

No se proporcionan detalles sobre el entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO) porque no es un modelo generativo de texto. El dataset TUMTraf V2X contiene 2,000 nubes de puntos etiquetadas y 5,000 imágenes de cinco sensores de carretera y cuatro sensores a bordo.

## Capacidades

- Detección de objetos 3D en escenarios de tráfico cooperativo (vehículos, peatones, bicicletas, motocicletas, autobuses, camiones, remolques y furgonetas).
- Fusión de datos multimodales (LiDAR y cámaras) de múltiples agentes (infraestructura y vehículos).
- Estrategia de ensemble que combina predicciones de diferentes modelos y épocas de entrenamiento para mejorar la robustez.
- Relleno quirúrgico de detecciones faltantes sin duplicar cajas, mediante el uso de modelos complementarios.
- Capacidad de manejar objetos pequeños y en movimiento rápido (peatones) mediante la unión multi-época.

## Casos de uso

- **Detección de objetos 3D en intersecciones urbanas**: el pipeline está diseñado para el dataset TUMTraf V2X, que captura intersecciones con sensores de carretera y a bordo. Es adecuado para sistemas de conducción autónoma que necesitan percibir el entorno desde múltiples perspectivas.
- **Sistemas de percepción cooperativa V2X**: puede integrarse en infraestructuras de comunicación vehículo-a-todo (V2X) donde los vehículos reciben datos de sensores de carretera y de otros vehículos, mejorando la seguridad en puntos ciegos.
- **Evaluación de modelos de detección 3D**: sirve como referencia de cómo combinar modelos existentes (CoopDet3D, CenterPoint) para alcanzar un mAP superior al de cualquier modelo individual, útil para investigadores que desarrollan nuevos enfoques.
- **Desarrollo de pipelines de ensemble en visión por computador**: la estrategia de selección por clase, unión multi-época y relleno quirúrgico puede adaptarse a otros dominios de detección (2D, segmentación) donde se disponga de múltiples modelos.
- **Investigación en fusión de sensores**: el pipeline demuestra la complementariedad entre LiDAR y cámaras, y cómo combinar sus predicciones de forma eficiente sin solapamientos, relevante para sistemas de percepción robustos.
- **Participación en competiciones de conducción autónoma**: el repositorio documenta una estrategia ganadora (3er puesto en DriveX 2026) que puede servir como punto de partida para equipos que compiten en desafíos similares.

## Benchmarks y rendimiento

La model card reporta los resultados finales del pipeline en el conjunto de validación de TUMTraf V2X, con un mAP global de 0.9062 (3er puesto en DriveX 2026):

| Clase | Precision | Recall | AP | Modelo |
|---|---|---|---|---|
| BUS | 1.000 | 1.000 | 1.000 | CoopDet3D base |
| MOTORCYCLE | 1.000 | 1.000 | 1.000 | CenterPoint Ep180 |
| VAN | 1.000 | 0.950 | 0.950 | CoopDet3D ped-boost Ep18 + CP fill |
| TRUCK | 1.000 | 0.941 | 0.941 | CoopDet3D ped-boost Ep18 |
| TRAILER | 0.994 | 0.931 | 0.925 | CoopDet3D ped-boost Ep18 + CP fill |
| CAR | 0.967 | 0.902 | 0.872 | CoopDet3D Ep60 + CP fill |
| BICYCLE | 0.952 | 0.909 | 0.866 | CoopDet3D Ep60 |
| PEDESTRIAN | 0.822 | 0.847 | 0.696 | Multi-epoch union (Ep46-60) |
| **Overall** | | | **0.9062** | |

No se dispone de comparaciones con otros pipelines en la información proporcionada, más allá de que el resultado corresponde al tercer puesto de la competición.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Al ser un pipeline de detección 3D basado en LiDAR y cámaras, requiere GPUs de alto rendimiento para inferencia en tiempo real, típicamente NVIDIA V100, A100 o RTX 3090/4090, aunque no se confirma.
- El uso de múltiples modelos (CoopDet3D y CenterPoint) implica un coste computacional adicional en comparación con un único modelo, aunque el relleno quirúrgico reduce el trabajo redundante.
- No se indican opciones de despliegue (vLLM, Ollama, etc.) porque no es un modelo de lenguaje; probablemente se ejecute con frameworks de detección 3D como OpenPCDet o MMDetection3D, pero no se confirma.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros pipelines de ensemble en la información proporcionada. Los modelos base que componen el ensemble (CoopDet3D y CenterPoint) son arquitecturas conocidas en el ámbito de detección 3D cooperativa, pero no se aportan métricas individuales de estos modelos en este repositorio. La comparativa se limita a los resultados internos del pipeline.

## Limitaciones y advertencias

- **Alcance limitado**: el pipeline está diseñado específicamente para el dataset TUMTraf V2X; su generalización a otros datasets o entornos no está validada.
- **Dependencia de múltiples modelos**: requiere ejecutar varios modelos (CoopDet3D, CenterPoint) y gestionar sus predicciones, lo que aumenta la complejidad operativa y el coste computacional.
- **Rendimiento desigual por clase**: la precisión para peatones es notablemente inferior (AP 0.696) en comparación con vehículos grandes, lo que indica que la detección de objetos pequeños sigue siendo un desafío.
- **Documentación incompleta**: no se proporcionan detalles sobre licencia, pesos, configuración de entrenamiento ni requisitos de hardware, lo que dificulta la reproducibilidad.
- **Riesgo de sobreajuste a la competición**: la estrategia de selección por clase y unión multi-época se optimizó para el conjunto de validación de TUMTraf V2X; podría no transferirse bien a otros escenarios.
- **Sin soporte para tareas de lenguaje**: no es un modelo de generación de texto ni tiene capacidades de razonamiento simbólico; su uso se limita a percepción 3D.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/harphool17/tumtraf-ensemble-pipeline
- Perfil del autor: https://huggingface.co/harphool17
- Modelo base CoopDet3D (repositorio del autor): https://huggingface.co/harphool17/tumtraf-coopdet3d-base
- Código de CoopDet3D en GitHub: https://github.com/yangje0ngwoo/coopdet3d
- Dataset TUMTraf V2X: https://tum-traffic-dataset.github.io/tumtraf-v2x/
- Dataset TUMTraf-A (accidentes): https://tum-traffic-dataset.github.io/tumtraf-a/
