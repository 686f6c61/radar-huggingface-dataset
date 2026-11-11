# minodori/omx_tomato_act

## Resumen

`minodori/omx_tomato_act` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada con LeRobot 0.6.1 por el usuario minodori. El modelo resuelve una tarea de manipulación muy concreta: un brazo robótico ROBOTIS OMX follower debe coger un tomate y depositarlo en un contenedor, usando dos cámaras USB (vista superior y vista de muñeca) como entrada visual. No es un modelo de lenguaje ni un modelo fundacional de propósito general, sino una política de imitación de pequeño tamaño (51,7 millones de parámetros) entrenada sobre un dataset propio de 50 episodios.

El interés del modelo es fundamentalmente práctico y educativo: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, desde la teleoperación con un brazo líder hasta el despliegue en un brazo seguidor real. La model card documenta con inusual honestidad las condiciones exactas de despliegue, los offsets observados en el agarre y las variables de entorno que degradan el rendimiento, lo que lo convierte en una referencia útil para quien esté montando un setup similar.

Es relevante ahora porque el ecosistema LeRobot está creciendo rápido y los ejemplos reales de políticas ACT desplegadas en hardware de bajo coste (brazos OMX, cámaras USB, una GPU de portátil) escasean. El modelo no compite en benchmarks generales: su valor está en la trazabilidad del entrenamiento y en las lecciones de robustez que documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), backbone ResNet-18, VAE activado |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk_size de 100 pasos de acción) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual convolucional (ResNet-18) con un transformer que predice un chunk de 100 acciones futuras de forma conjunta, en lugar de una acción por paso. El modelo incorpora un VAE (activado en esta configuración) que modela la variabilidad de las demostraciones humanas, y recibe como entrada el estado de 6 articulaciones (`observation.state`) más dos imágenes de 640x480 a 30 fps (`observation.images.top` y `observation.images.wrist`). La salida es un vector de 6 articulaciones: pan, lift, elbow, wrist_flex, wrist_roll y gripper.

El entrenamiento se realizó con `lerobot-train` (tipo de política `act`) durante 30.000 pasos, con batch size 8 y semilla 1000, sobre el dataset `minodori/omx_tomato` (50 episodios, 34.432 frames a 30 fps). El tomate se colocó en 5 posiciones durante la grabación, con 10 episodios por posición. Los datos se capturaron mediante teleoperación con un brazo OMX leader y dos cámaras USB. No se documenta uso de RLHF ni DPO, algo esperable en una política de imitación supervisada. La innovación técnica relevante aquí no está en la arquitectura (ACT es un diseño conocido) sino en el uso de *temporal ensembling* en el despliegue: la configuración guardada lo tiene desactivado y, sin él, el brazo salta en cada frontera de chunk.

## Capacidades

- Generación de acciones de manipulación robótica: predice chunks de 100 acciones de 6 articulaciones a partir de observaciones visuales y propioceptivas.
- Percepción visual con dos cámaras: una vista superior cenital y una vista de muñeca, ambas a 640x480 y 30 fps.
- Agarre y colocación de un objeto concreto (tomate) en un contenedor, en las posiciones entrenadas y en puntos intermedios no vistos.
- Ejecución en bucle cerrado a 30 fps con temporal ensembling activado (`temporal_ensemble_coeff=0.01`, `n_action_steps=1`).
- Generalización limitada a variaciones de posición del objeto dentro del área de entrenamiento (posiciones intermedias entre 1-3 y 1-6 funcionaron).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modalities de audio o texto. Es una política robótica, no un modelo generativo de propósito general.

## Casos de uso

- **Docencia y prácticas de robótica**: el modelo sirve como ejemplo completo y reproducible de un pipeline de aprendizaje por imitación con LeRobot, desde la teleoperación hasta el despliegue, adecuado para asignaturas de robótica de manipulación.
- **Prototipado rápido de tareas pick-and-place**: para validar un setup de brazo OMX con dos cámaras antes de invertir en un dataset mayor, el modelo demuestra que la tarea es viable con 50 episodios y 30.000 pasos de entrenamiento.
- **Referencia de robustez en despliegue**: la model card documenta offsets de 10-30 mm causados por cambios de fondo, posición de cámara o pose inicial; útil para diseñar protocolos de calibración y alineación en otros proyectos.
- **Banco de pruebas de temporal ensembling**: permite comparar el comportamiento del brazo con y sin ensamblado temporal (saltos en fronteras de chunk frente a movimiento continuo) en hardware real.
- **Base para fine-tuning en tareas similares**: al estar bajo Apache 2.0 y en formato LeRobot, puede reentrenarse con un dataset propio de otra tarea de manipulación con el mismo brazo y cámaras.
- **Evaluación de sensibilidad a la cámara**: sirve para medir experimentalmente cuánto afecta un desplazamiento de pocos píxeles en la cámara superior al punto de agarre, un dato relevante para diseñar montajes rígidos.
- **Integración en laboratorios de bajo coste**: el requisito de cómputo (unos 15 ms por inferencia en una RTX 5060 Laptop) lo hace desplegable en un portátil con GPU consumer, sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. La model card incluye únicamente resultados anecdóticos de despliegue en robot real, con recuentos de ensayos pequeños:

| Posición | Resultado observado |
|---|---|
| 1 (centro) | El gripper aterriza ligeramente a la derecha del tomate (menos de 20 mm); 4 de 5 agarres con éxito |
| 3 | Unos 10 mm a la derecha; éxito |
| 4 | Unos 10 mm a la derecha; 3 de 3 con éxito |
| 5, 6 | Prácticamente sin offset; éxito |
| Puntos no entrenados entre 1-3 y 1-6 | Éxito |

Latencia medida: aproximadamente 15 ms por inferencia en una RTX 5060 Laptop y unos 200 ms en CPU, insuficiente para un bucle de 30 fps.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; con 51,7 millones de parámetros y backbone ResNet-18, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: RTX 5060 Laptop verificada por el autor (15 ms por inferencia); cualquier GPU NVIDIA consumer reciente es suficiente. No se requieren A100 ni H100.
- **CPU**: funciona (unos 200 ms por inferencia) pero es demasiado lenta para el bucle de control a 30 fps; solo válida para pruebas offline.
- **Despliegue**: librería `lerobot` 0.6.1 con `ACTPolicy.from_pretrained`. Se debe activar temporal ensembling en el rollout con `--policy.temporal_ensemble_coeff=0.01 --policy.n_action_steps=1`.
- **Hardware robótico**: brazo ROBOTIS OMX follower, brazo OMX leader para teleoperación y dos cámaras USB (superior y de muñeca) a 640x480 y 30 fps.
- **Throughput**: no disponible más allá de la latencia por inferencia citada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `minodori/omx_tomato_act` | ACT + ResNet-18 + VAE | 51,7 M | chunk_size 100 | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | ACT | variable | variable | variable | no disponible (no se han identificado alternativas concretas en la información proporcionada) |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | variable | variable | variable | no disponible (no se han identificado alternativas concretas en la información proporcionada) |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría. La comparación cualitativa con otras políticas del ecosistema LeRobot requeriría datos de benchmarks que no se han publicado.

## Limitaciones y advertencias

- **Sensibilidad a la posición de la cámara superior**: un desplazamiento de pocos píxeles cambia el punto donde aterriza el gripper. El autor recomienda alinear la vista en vivo sobre el primer frame de una grabación antes de cada prueba.
- **Sensibilidad a la pose inicial**: arrancar desde una pose casera distinta de las demostraciones provoca un giro de unos 5 grados al inicio. La pose media de las 50 demostraciones es pan 2.4, lift -63.7, elbow 55.7, wrist_flex 45.0, wrist_roll 1.6, gripper 50.6.
- **Sensibilidad al fondo**: una mano en el encuadre, el trazado de cables o el fondo del lado derecho desplazan el objetivo entre 10 y 30 mm a la derecha.
- **Sin probar fuera de las condiciones de grabación**: no se ha evaluado con otros objetos, otras mesas, otra iluminación ni otro montaje de cámara.
- **Rotación de objetos**: el wrist_roll apenas varía en los datos de entrenamiento, por lo que es probable que falle con objetos rotados.
- **Saltos en fronteras de chunk sin temporal ensembling**: la configuración guardada tiene el ensamblado temporal desactivado; sin activarlo, el brazo salta en cada frontera de chunk de 3,3 segundos.
- **Resultados anecdóticos**: los recuentos de éxito se basan en pocos ensayos y el propio autor pide tratarlos como anecdóticos.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento; requiere supervisión y paradas de emergencia en el robot.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el modelo está entrenado para una tarea y un hardware muy específicos; su utilidad comercial directa es limitada sin reentrenamiento.
- **Sesgos**: no se documentan sesgos sociales; el sesgo relevante es de distribución (posiciones, fondos, iluminación y objetos del dataset de entrenamiento).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minodori/omx_tomato_act
- Dataset de entrenamiento: https://huggingface.co/datasets/minodori/omx_tomato
- Repositorio GitHub con scripts de grabación, entrenamiento y rollout: no disponible (la model card indica que el enlace se añadirá)
- Documentación de LeRobot: no disponible en la información proporcionada
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
