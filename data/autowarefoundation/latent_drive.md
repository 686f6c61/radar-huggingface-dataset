# AutowareFoundation/latent_drive

## Resumen

LatentDrive es un modelo de planificación end-to-end para conducción autónoma desarrollado por AutowareFoundation. Convierte los últimos 2 segundos de vídeo de cámara frontal, seis puntos de la ruta y el estado de movimiento del vehículo en una trayectoria futura de 4 segundos a 10 Hz. Se trata de un modelo camera-only y mapless: no requiere detección de objetos, tracking ni mapas de alta definición, sino que planifica directamente a partir de las características latentes extraídas del vídeo.

La arquitectura se construye sobre un modelo del mundo latente. El codificador de vídeo es un V-JEPA ViT-L de 304 millones de parámetros, preentrenado de forma autosupervisada sobre vídeo de conducción, que aprende cómo evolucionan las escenas prediciendo partes enmascaradas en su propio espacio latente en lugar de en píxeles. Una cabeza de planificación de 6 millones de parámetros lee esas características junto con la ruta y el estado del ego, sumando 310 millones de parámetros en total.

Se publican dos variantes que comparten codificador, entrada de ruta y salida: una de tres cámaras (frontal, frontal-izquierda y frontal-derecha) y otra de una sola cámara frontal. Los modelos se distribuyen en formato ONNX y se ejecutan con TensorRT mediante la librería `autoware_latent_drive`, que incluye una muestra offline y un nodo ROS 2. Es relevante ahora porque demuestra que un world model latente puede sostener planificación en tiempo real (10 Hz sin ticks perdidos) en un vehículo de pruebas, con una latencia de unos 14 ms por plan en una RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo latente: codificador de vídeo V-JEPA ViT-L (304M) + cabeza de planificación (6M) |
| Parametros totales | 310M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4 fotogramas por vista a 0,5 s de separación (ventana de 2 s); 6 puntos de ruta a 5, 10, 15, 20, 30 y 50 m |
| Tipos de cuantizacion | ONNX en fp32; en TensorRT el codificador se ejecuta en fp16 y la cabeza de planificación se fija en fp32 (receta "mixed" validada por la librería) |
| Idiomas soportados | No disponible (modelo de percepción y planificación, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18), fp32, autocontenido, eje de batch dinámico; motores TensorRT generados localmente |

## Arquitectura y entrenamiento

LatentDrive es un planificador end-to-end basado en un modelo del mundo latente. El codificador es un V-JEPA ViT-L preentrenado de forma autosupervisada sobre vídeo de conducción: aprende la dinámica de las escenas prediciendo partes enmascaradas del vídeo en el espacio latente, no en píxeles. En inferencia, el codificador se ejecuta una vez por vista de cámara con pesos compartidos, y una cabeza de planificación pequeña (6M) combina las características latentes de los fotogramas con los puntos de ruta y el estado del ego (velocidad y aceleración) para producir la trayectoria. No hay detección ni tracking intermedios.

La entrada de vídeo son 4 fotogramas por vista separados 0,5 s (de t − 1,5 s a t), recortados al centro en proporción 2:1, redimensionados a 512 × 256 y normalizados con media y desviación típica de ImageNet. La ruta se remuestrea cada 1 m, se proyecta el ego sobre ella y se toman los puntos a 5, 10, 15, 20, 30 y 50 m de longitud de arco en el marco del ego, divididos por 10 y truncados al final de la ruta. La salida son 40 poses a intervalos de 0,1 s que cubren de 0,1 s a 4,0 s. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Planificación de trayectoria del ego: genera 40 poses a 0,1 s de separación (0,1 s a 4,0 s) en el marco actual del vehículo, con coordenadas x (adelante), y (izquierda) y delta de guiñada en radianes.
- Conducción end-to-end sin mapas: planifica solo con cámara, ruta y estado del ego, sin detección de objetos, tracking ni mapas de alta definición.
- Entrada multimodal de sensores: 3 vistas de cámara (frontal, frontal-izquierda, frontal-derecha) o una sola cámara frontal, según la variante.
- Integración de ruta: consume seis puntos de la ruta en el marco del ego, lo que permite seguir una misión definida por lanelets en Autoware.
- Integración con ROS 2: se ejecuta mediante el nodo ROS 2 de `autoware_latent_drive`, con topics de cámara y mensajes `autoware_planning_msgs/msg/LaneletRoute`.
- Ejecución en tiempo real: mantiene 10 Hz sin ticks perdidos en el ordenador del vehículo de pruebas.
- Despliegue con TensorRT: los modelos ONNX se compilan a motores TensorRT específicos de la GPU; no requieren plugins de TensorRT.
- Replay offline: la librería incluye una muestra offline que puede construir los puntos de ruta desde la misión y el mapa Lanelet2.

## Casos de uso

- Planificación en tiempo real en vehículos Autoware: el modelo se integra como nodo ROS 2 y sustituye o complementa la pila de planificación clásica, generando trayectorias a 10 Hz a partir de las cámaras y la ruta de misión.
- Conducción urbana sin mapas de alta definición: al ser mapless, puede desplegarse en entornos donde no hay mapas HD actualizados, usando solo los puntos de ruta de los lanelets preferidos.
- Seguimiento de carril y cambios de carril: con la variante de tres cámaras, las vistas laterales aportan contexto sobre carriles adyacentes, útil para mantenerse en carril a velocidades de crucero (por ejemplo, 40 km/h en las escenas publicadas).
- Gestión de intersecciones: las escenas de ejemplo incluyen giros a la derecha cediendo el paso a tráfico en sentido contrario, giros a la izquierda y arranques en verde, escenarios donde el modelo debe anticipar la evolución de la escena.
- Control de velocidad ante semáforos y obstáculos: las escenas publicadas muestran deceleración ante un semáforo en rojo, lo que permite usar el modelo para regular la velocidad de forma anticipada.
- Validación offline y regresión: la muestra offline y el replay en bucle abierto permiten evaluar el modelo sobre rosbags grabados antes de desplegarlo en el vehículo.
- Investigación en world models para robótica: al estar en ONNX y con licencia Apache-2.0, sirve como base para experimentar con planificación en espacio latente y con codificadores V-JEPA en robótica.
- Prototipado en plataformas con GPU de consumo: la variante de una cámara reduce la latencia a 11–12,5 ms por tick, lo que facilita pruebas en equipos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta latencias de ejecución: aproximadamente 14 ms por plan con tres cámaras en una NVIDIA GeForce RTX 4090, y en el ordenador del vehículo de pruebas unos 35 ms por tick con tres cámaras y 11–12,5 ms con una, manteniendo 10 Hz sin ticks perdidos en ambos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los ONNX pesan 1,25 GB (tres cámaras) y 1,24 GB (una cámara) en fp32, y el motor TensorRT en la receta mixta (codificador fp16, cabeza fp32) ocupa del orden de 0,6–0,7 GB de pesos.
- GPU recomendadas: NVIDIA GeForce RTX 4090 (referencia de latencia de la model card); cualquier GPU NVIDIA compatible con la versión de TensorRT usada para compilar el motor.
- Cabe en GPU de consumo: sí, según la referencia de la RTX 4090; no se detallan otras GPU de consumo.
- Opciones de despliegue: TensorRT mediante `autoware_latent_drive` (librería C++, muestra offline y nodo ROS 2); los motores se compilan localmente con `scripts/build.sh` (unos 7 minutos para tres cámaras y 1,5 minutos para una cámara). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: unos 14 ms por plan con tres cámaras en RTX 4090; en el vehículo de pruebas, unos 35 ms por tick con tres cámaras y 11–12,5 ms con una, a 10 Hz sin ticks perdidos.
- Nota: los motores TensorRT no se distribuyen porque dependen de la arquitectura de GPU y de la versión de TensorRT; deben compilarse en el equipo de destino.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentDrive (3 cámaras) | Planificador end-to-end con world model latente (V-JEPA ViT-L) | 310M | 4 fotogramas × 3 vistas (2 s) + 6 puntos de ruta + estado del ego | Apache-2.0 | ONNX en Hugging Face |
| LatentDrive (1 cámara) | Planificador end-to-end con world model latente (V-JEPA ViT-L) | 310M | 4 fotogramas × 1 vista (2 s) + 6 puntos de ruta + estado del ego | Apache-2.0 | ONNX en Hugging Face |
| Alternativas de planificación end-to-end | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (planificación end-to-end camera-only con world model latente), por lo que la comparativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card; al entrenarse con vídeo de conducción, puede heredar sesgos de los escenarios, geografías y condiciones meteorológicas presentes en esos datos.
- Riesgo de alucinación: como modelo generativo de trayectorias, puede producir planes plausibles pero incorrectos ante escenas fuera de distribución; no hay métricas publicadas de seguridad ni de tasa de fallo.
- Limitaciones de contexto: la ventana de entrada es de solo 2 s de vídeo (4 fotogramas por vista a 0,5 s); no hay información sobre el horizonte temporal ni sobre el comportamiento en maniobras que requieran contexto más largo.
- Dependencia de la ruta: los puntos de ruta se truncan al final de la ruta y se dividen por 10; una ruta mal definida o ausente degrada la planificación.
- Vistas laterales: en entrenamiento, una vista lateral ausente solo se vio como imagen completamente a cero antes de la normalización; no se garantiza el comportamiento con vistas laterales faltantes en producción.
- Sincronización de cámaras: en entrenamiento las vistas laterales estaban dentro de 50 ms respecto a la frontal; desviaciones mayores no están cubiertas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los motores TensorRT deben compilarse localmente y no se distribuyen; hay que validar la versión de TensorRT y la GPU de destino.
- Caveat para producción: no se han publicado benchmarks de seguridad, ni evaluaciones cerradas, ni métricas de intervención; el modelo se presenta con replays en bucle abierto, no con resultados de conducción autónoma cerrada.
- Idiomas: no aplica ni se documenta soporte lingüístico; es un modelo de percepción y planificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutowareFoundation/latent_drive
- Librería de despliegue `autoware_latent_drive`: https://github.com/autowarefoundation/autoware_latent_drive
- Proyecto Autoware: https://autoware.org/
- Organización en GitHub: https://github.com/autowarefoundation
