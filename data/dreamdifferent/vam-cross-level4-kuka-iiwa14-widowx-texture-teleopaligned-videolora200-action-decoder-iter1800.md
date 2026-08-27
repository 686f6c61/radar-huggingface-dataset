# dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800

## Resumen

Este repositorio contiene un checkpoint del decoder World2Action del sistema MimicVideo, desarrollado por el usuario dreamdifferent. Se trata de un componente de un pipeline de robótica que convierte secuencias de video en comandos de acción para un brazo robótico, concretamente para un KUKA iiwa 14 y un WidowX con dos cámaras. El checkpoint corresponde a la iteración 1800 de un entrenamiento que se detuvo por causas no especificadas, y se ha verificado que el conjunto de pesos es completo y válido.

El modelo forma parte de una línea de investigación sobre aprendizaje por imitación y predicción de acciones basada en video, un área relevante para la manipulación robótica autónoma. Aunque no se proporcionan detalles de arquitectura interna, se sabe que el decoder trabaja con características de video generadas por un backbone congelado y un LoRA de video también congelado, y que produce acciones de 15 dimensiones (posición del efector final y apertura del gripper) a 5 Hz. La licencia, los idiomas y los benchmarks no están disponibles en la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de acciones World2Action (arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 1.0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder de acciones que forma parte del framework MimicVideo, especificamente del componente World2Action. Segun la model card, el checkpoint proviene de un entrenamiento denominado `w2a_kuka_iiwa14_level4_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`. El decoder recibe como entrada caracteristicas de video fusionadas de un backbone Video2World (inicializado desde `dreamdifferent/widowx250-video-fused`) y un Video LoRA congelado, y genera acciones de control del robot.

El entrenamiento se realizo sobre un dataset de teleoperacion con 144 episodios y 55 448 frames, capturados con dos camaras (`corner_cam` y `front_cam`). Las acciones objetivo son 15 valores (posicion del efector final y apertura del gripper) a una frecuencia de 5 Hz, con la pose relativa a la pose actual del efector y rotacion representada en formato `rotation_6d`. No se especifican detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni el uso de tecnicas como RLHF o DPO. El entrenamiento se detuvo por una causa desconocida, pero se verifico que el checkpoint es completo.

## Capacidades

- Prediccion de acciones de robot a partir de video: el decoder convierte secuencias de video en comandos de accion para un brazo robotico.
- Soporte multi-camara: utiliza dos camaras simultaneas (`corner_cam` y `front_cam`) para capturar la escena.
- Salida de acciones de 15 dimensiones: incluye posicion del efector final (traslacion y rotacion en 6D) y apertura del gripper.
- Integracion con backbone congelado: disenado para funcionar con un backbone Video2World y un Video LoRA especificos, ambos congelados durante el entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes.

## Casos de uso

- Aprendizaje por imitacion en robotica: el modelo puede utilizarse para entrenar politicas de control que imiten demostraciones humanas capturadas en video, reduciendo la necesidad de programacion manual de trayectorias.
- Control de brazo robotico KUKA iiwa 14: al estar entrenado con datos de este robot, puede servir como componente de un sistema de control basado en vision para tareas de manipulacion precisa.
- Teleoperacion asistida: el decoder puede convertir video de teleoperacion en comandos de accion, permitiendo la generacion de datos de entrenamiento o la ejecucion remota de tareas.
- Investigacion en World2Action: util como punto de partida para estudiar la transferencia de informacion visual a acciones motoras en entornos simulados o reales.
- Desarrollo de sistemas de robotica con dos camaras: su soporte para dos vistas laterales y frontal lo hace adecuado para escenarios donde la percepcion estereoscopica es relevante.
- Evaluacion de checkpoints intermedios: al ser un checkpoint de una iteracion concreta, puede usarse para analizar la evolucion del entrenamiento y comparar con iteraciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni evaluaciones especificas de robotica (exito en tareas, precision de trayectoria, etc.).

## Requisitos de hardware

- No se dispone de informacion sobre requisitos de VRAM, GPU recomendadas o latencia.
- El tamano del repositorio es de 1.0 GB, lo que sugiere que el checkpoint podria cargarse en GPUs con al menos 8 GB de VRAM, pero no se puede confirmar sin conocer la arquitectura exacta.
- Al ser un decoder que depende de un backbone congelado, el despliegue completo requeriria tambien el backbone y el LoRA, cuyos requisitos no se especifican.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de robotica, probablemente se integraria en frameworks de robotica como ROS o MuJoCo, pero no se documenta.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (decoders de acciones basados en video para robotica). No se pueden establecer comparaciones con alternativas como RT-1, RT-2 u otros modelos de politica visual, ya que no se proporcionan datos de rendimiento ni especificaciones tecnicas de estos.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente, lo que limita su adopcion en entornos de produccion sin consulta legal previa.
- Datos de entrenamiento limitados: solo 144 episodios, lo que puede provocar un rendimiento deficiente en escenarios no vistos o con variaciones de iluminacion, textura o configuracion del robot.
- Dependencia de componentes congelados: el decoder no es autonomo; requiere el backbone Video2World y el Video LoRA especificos, que no estan incluidos en este repositorio.
- Riesgo de alucinacion de acciones: al ser un modelo generativo, podria producir comandos de accion inconsistentes con la fisica del robot o con el entorno, especialmente en situaciones fuera de la distribucion de entrenamiento.
- Sesgos potenciales: el dataset de teleoperacion puede reflejar sesgos del operador humano, como preferencias de velocidad o trayectorias, que se transferiran al modelo.
- Sin informacion sobre robustez: no se documentan pruebas de generalizacion a otros robots, entornos o condiciones de iluminacion.
- Formato de pesos no especificado: no se indica si los pesos estan en safetensors, GGUF u otro formato, lo que dificulta su integracion en pipelines existentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Modelo relacionado (UR5e): https://huggingface.co/dreamdifferent/vam-cross-level4-ur5e-widowx-texture-teleopaligned-videolora400-action-decoder-iter1800
- Escena MuJoCo del KUKA iiwa 14: https://github.com/google-deepmind/mujoco_menagerie/blob/main/kuka_iiwa_14/scene.xml
- Modelo MuJoCo del KUKA iiwa 14: https://github.com/google-deepmind/mujoco_menagerie/blob/main/kuka_iiwa_14/iiwa14.xml
- Pagina del producto KUKA LBR iiwa 14 R820: https://my.kuka.com/s/product/lbr-iiwa-14-r820/01t58000002hnktAAA?language=en_US
- Documentacion del modelo KUKA iiwa en VTPRL: https://deepwiki.com/tum-i6/VTPRL/5.1-kuka-iiwa-robot-model
