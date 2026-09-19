# Dengliming/StreamPIReal6_3w

## Resumen

StreamPI Piper-X Real6 es un checkpoint de política vision-lenguaje-acción (VLA) publicado en HuggingFace por el usuario Dengliming bajo licencia Apache 2.0. Se trata de un ajuste fino de la política base π0.5 con la extensión temporal StreamPI, entrenado con JAX sobre seis tareas de manipulación bimanual real con la plataforma Piper-X de doble brazo. El paquete, de 12,9 GB, no contiene solo los pesos: incluye también el marco de trabajo StreamPI/OpenPI completo, las estadísticas de normalización `real_piper_x_6tasks`, un servidor de política por WebSocket con su cliente de robot, scripts de evaluación por replay offline y metadatos de procedencia.

El interés de este checkpoint es doble. Por un lado, ejemplifica el patrón de publicación de políticas robóticas reales: en lugar de un modelo de lenguaje, se distribuye un artefacto de inferencia fuertemente acoplado a un esquema de observación y acción concreto (tres cámaras, estado y acción de 6 articulaciones por brazo más pinza). Por otro, documenta explícitamente el condicionamiento temporal como línea de investigación dentro de las políticas VLA, que es lo que aporta la extensión StreamPI sobre π0.5.

Conviene señalar de entrada dos cautelas importantes. La model card incluye un aviso que indica que el checkpoint por defecto es `checkpoints/29999` (un candidato de 30k pasos), que la validación en GPU L40 y la aceptación en robot físico siguen pendientes y que el artefacto no debe publicarse ni tratarse como congelado. Además, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado fuentes externas que lo documenten o evalúen de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política vision-lenguaje-acción (VLA); base π0.5 con extensión temporal StreamPI |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (política de control por observación; no se documenta ventana textual) |
| Tipos de cuantizacion | no disponible (se distribuyen parámetros de inferencia JAX) |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en el formato del dataset de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | JAX (checkpoint de inferencia; sin safetensors ni GGUF documentados) |
| Framework de entrenamiento | JAX |
| Robot objetivo | Piper-X de doble brazo |
| Tareas entrenadas | 6 tareas de manipulación en robot real |
| Paso de entrenamiento publicado | 20.000 (el aviso de la model card apunta a `checkpoints/29999` como checkpoint por defecto) |
| Identidad de dataset/config | `real_piper_x_6tasks` |
| Tamano del repositorio | 12,9 GB |
| Transporte de política | Servidor y cliente WebSocket |

## Arquitectura y entrenamiento

La política base es π0.5, sobre la que se aplica StreamPI como extensión temporal. El resultado es un modelo VLA que consume observaciones multimodales (tres flujos de cámara) junto con el estado propioceptivo del robot y produce fragmentos de acción (`action chunks`) para los dos brazos y sus pinzas. El entrenamiento se ha realizado íntegramente en JAX, y el dominio declarado es la manipulación en robot real sobre la plataforma Piper-X, con seis tareas.

La interfaz de observación y acción es estricta y forma parte del contrato del modelo. Se esperan tres cámaras con nombres fijos: `cam_high` como cámara externa, y `cam_left_wrist` y `cam_right_wrist` como cámaras de muñeca. El estado y la acción se descomponen en `left_joint_1..6` más `left_gripper` para el brazo izquierdo, y `right_joint_1..6` más `right_gripper` para el derecho. La normalización debe aplicarse con las estadísticas empaquetadas de `real_piper_x_6tasks`; la propia model card advierte que sustituir estadísticas de otro robot, dataset o checkpoint puede generar acciones inválidas aunque las dimensiones tensoriales coincidan. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El repositorio incluye además estadísticas de normalización de otros entornos (`assets/pi05_calvin/InternRobotics/InternData-Calvin_ABC/norm_stats.json`, `assets/pi05_libero/physical-intelligence/libero/norm_stats.json` y `assets/streampi05/unified_robodojo_all_arx_x5/norm_stats.json`), lo que sugiere un pipeline de trabajo con varios entornos, aunque el checkpoint publicado está ajustado específicamente a Piper-X Real6.

## Capacidades

- Generación de acciones de manipulación bimanual: produce comandos para dos brazos de 6 articulaciones y sus respectivas pinzas, condicionados por observaciones visuales y de estado.
- Percepción visual multivista: integra una cámara externa (`cam_high`) y dos cámaras de muñeca en la misma observación.
- Condicionamiento temporal: la extensión StreamPI está orientada al modelado de dependencias temporales dentro de la política, que es el objeto de estudio declarado del release.
- Ejecución de seis tareas concretas de robot real dentro de la distribución de entrenamiento de `real_piper_x_6tasks`.
- Servido remoto de política: incluye servidor WebSocket (`src/openpi/serving/websocket_policy_server.py`) y cliente (`packages/openpi-client/src/openpi_client/websocket_client_policy.py`), lo que permite desacoplar la inferencia del ordenador de control del robot.
- Evaluación offline: incorpora scripts de replay continuo, de evaluación a 30 pasos y de comprobación rápida (`offline_continuous_replay.py`, `offline_replay_eval_30.py`, `offline_replay_smoke.py`).
- Integración con LeRobot: el paquete incluye ejemplos y scripts de evaluación de LeRobot (`lerobot/examples/2_evaluate_pretrained_policy.py`, `lerobot/lerobot/scripts/eval.py`).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso genérico, generación de código, matemáticas, audio o modo de pensamiento explícito. Tampoco se detalla soporte multilingüe.

## Casos de uso

- Reproducción de experimentos de manipulación bimanual: el paquete incluye manifiesto de release y metadatos de procedencia, de modo que un laboratorio con una plataforma Piper-X puede reconstruir el entorno de ejecución y repetir las seis tareas entrenadas con la misma configuración de cámaras, orden de articulaciones y normalización.
- Evaluación offline por replay antes de tocar hardware: los scripts `offline_replay_eval_30.py` y `offline_replay_smoke.py` permiten comparar las acciones predichas contra episodios grabados y detectar NaN, Inf, discontinuidades o violaciones de rango sin riesgo físico.
- Investigación sobre condicionamiento temporal en políticas VLA: al ser un ajuste de π0.5 con la extensión StreamPI, sirve como punto de partida para estudiar cómo afecta el modelado temporal a la consistencia de los fragmentos de acción frente a la política base.
- Banco de pruebas de seguridad robótica: la secuencia de validación recomendada por el autor (verificar carga, cámaras, dimensiones, unidades, normalización, replay offline, inspección de acciones y prueba con par desactivado) puede reutilizarse como protocolo interno de aceptación de nuevos checkpoints.
- Arquitectura de despliegue desacoplada: el servidor WebSocket permite ejecutar la inferencia en un nodo con GPU y enviar las acciones al cliente del robot, lo que facilita integrar la política en un stack de control existente sin reescribir el bucle de control.
- Ajuste fino sobre nuevas tareas: al distribuirse el marco StreamPI/OpenPI completo, el checkpoint 20k puede actuar como inicialización para un conjunto adicional de tareas de manipulación sobre el mismo embodiment.
- Estudio comparativo de estadísticas de normalización: el repositorio empaqueta `norm_stats.json` de varios entornos (Calvin, LIBERO, RoboDojo ARX X5 y Piper-X), lo que permite analizar el efecto de las convenciones de normalización entre plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que el release incluye «offline replay-evaluation scripts and saved results», pero no reproduce cifras en el texto proporcionado, por lo que no se ofrecen tasas de éxito ni métricas comparativas.

## Requisitos de hardware

- Los pesos suman 12,9 GB de repositorio, que incluye el checkpoint de inferencia JAX junto con código, estadísticas de normalización y utilidades; el tamaño exacto de los parámetros no se documenta.
- La model card menciona que la validación en una GPU NVIDIA L40 (48 GB de VRAM) está pendiente, lo que indica que es el hardware de referencia previsto por el autor.
- No se especifican requisitos mínimos de VRAM, ni si el modelo cabe en GPU de consumo. No hay datos para confirmarlo.
- Opciones de despliegue documentadas: servidor de política WebSocket propio de OpenPI/StreamPI, cliente `piperx_client.py` para el robot Piper-X, y scripts de evaluación de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no a este tipo de política.
- Latencia y throughput: no disponible. Las cifras dependerán del hardware, del número de cámaras activas y de la convención de ejecución de fragmentos de acción.
- Requisito adicional de hardware: una plataforma Piper-X de doble brazo con tres cámaras configuradas según los nombres esperados, para cualquier validación en robot real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StreamPI Piper-X Real6 (este) | VLA con extensión temporal, ajuste para Piper-X | no disponible | no disponible | apache-2.0 | HuggingFace, 12,9 GB, 0 descargas |
| π0.5 (physical-intelligence) | Política VLA base sobre la que se construye este checkpoint | no disponible en la informacion disponible | no disponible | no disponible en la informacion disponible | referenciada en la model card como política base |
| StreamPI / OpenPI upstream | Marco de trabajo y extensión temporal | no disponible en la informacion disponible | no disponible | no disponible en la informacion disponible | documentado en `docs/UPSTREAM_STREAMPI_README.md` dentro del release |

No se dispone de datos verificables de otros modelos comparables de la misma categoría (políticas VLA bimanuales ajustadas a un robot concreto) en la información proporcionada, por lo que no se incluyen parámetros ni métricas comparativas. Las entradas de π0.5 y StreamPI se incluyen únicamente porque aparecen citadas en la model card, no como comparación medida.

## Limitaciones y advertencias

- Estado no congelado: la model card incluye el aviso «30k candidate: default checkpoint is `checkpoints/29999`. L40 and physical-robot acceptance are still pending. Do not publish or treat as frozen». El release no debe considerarse estable ni validado en hardware físico.
- Discrepancia de versión: el título del release indica 20k pasos y el aviso apunta a `checkpoints/29999` como checkpoint por defecto, lo que genera ambigüedad sobre qué pesos se están sirviendo realmente.
- Alcance muy limitado: solo seis tareas de robot real. El rendimiento fuera de la distribución de entrenamiento no está garantizado.
- Sensibilidad al entorno: la colocación de cámaras, la iluminación, la geometría del espacio de trabajo, la calibración del embodiment y las convenciones de acción afectan de forma material al comportamiento.
- Acoplamiento estricto a la normalización: usar estadísticas de otro robot, dataset o checkpoint puede producir acciones inválidas aunque las dimensiones coincidan. Lo mismo aplica al orden de articulaciones, la convención de pinza, las claves de imagen y los rangos de normalización.
- El replay offline consistente no garantiza éxito en bucle cerrado. La propia model card lo advierte.
- Seguridad física: el modelo puede generar acciones inseguras o fuera de distribución. La ejecución en robot real exige salvaguardas independientes de colisión, espacio de trabajo, velocidad y parada de emergencia.
- Riesgo de alucinación: no aplica en el sentido textual habitual, pero sí existe riesgo de predicciones degeneradas (NaN, Inf, discontinuidades, valores fuera de rango) que deben filtrarse antes de enviar comandos.
- Sesgos: no se documenta ningún análisis de sesgos de percepción (iluminación, materiales, sesgo de escena) en la información disponible.
- Licencia Apache 2.0: permite uso comercial según los términos de esa licencia, pero el autor restringe explícitamente el uso previsto a investigación, evaluación offline y despliegue controlado en una plataforma Piper-X compatible.
- Madurez ecosistémica: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados y sin fuentes externas de validación independiente. No se han encontrado referencias en la búsqueda web realizada.
- Idiomas: no se documenta cobertura multilingüe ni el idioma de las instrucciones de tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dengliming/StreamPIReal6_3w
- Estadísticas de normalización Piper-X Real6: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/checkpoints/20000/assets/real_piper_x_6tasks/norm_stats.json
- Estadísticas de normalización Calvin ABC: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/assets/pi05_calvin/InternRobotics/InternData-Calvin_ABC/norm_stats.json
- Estadísticas de normalización LIBERO: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/assets/pi05_libero/physical-intelligence/libero/norm_stats.json
- Estadísticas de normalización RoboDojo ARX X5: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/assets/streampi05/unified_robodojo_all_arx_x5/norm_stats.json
- Cliente de robot Piper-X: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/deployment/piperx_client.py
- Evaluación por replay continuo: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/evaluation/scripts/offline_continuous_replay.py
- Evaluación por replay a 30 pasos: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/evaluation/scripts/offline_replay_eval_30.py
- Prueba rápida de replay: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/evaluation/scripts/offline_replay_smoke.py
- Servidor de política WebSocket: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/src/openpi/serving/websocket_policy_server.py
- Cliente de política WebSocket: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/packages/openpi-client/src/openpi_client/websocket_client_policy.py
- Ejemplo de evaluación de LeRobot: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/lerobot/examples/2_evaluate_pretrained_policy.py
- Configuración de evaluación de LeRobot: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/lerobot/lerobot/configs/eval.py
- Script de evaluación de LeRobot: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/lerobot/lerobot/scripts/eval.py
- Documentación upstream de StreamPI: https://huggingface.co/Dengliming/StreamPIReal6_3w/blob/main/docs/UPSTREAM_STREAMPI_README.md
