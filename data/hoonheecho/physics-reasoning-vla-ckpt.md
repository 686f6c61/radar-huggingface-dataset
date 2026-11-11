# HoonheeCho/physics-reasoning-vla-ckpt

## Resumen

`physics-reasoning-vla-ckpt` es una coleccion de checkpoints finales de politicas vision-language-action (VLA) desarrolladas por el usuario HoonheeCho. Cada checkpoint combina el modelo vision-language SmolVLM2-500M con un experto de accion SmolVLA, entrenado sobre un conjunto de datos de manipulacion simulada con cuatro tareas: pick, bounce, basket y curling. El repositorio ocupa 14,7 GB y esta publicado bajo licencia Apache 2.0.

El modelo aborda el problema de dotar a un VLA de razonamiento fisico explicito durante el control robotic. Para ello, la coleccion incluye variantes con y sin tokens de razonamiento, con token de seguimiento (track token), con cabeza de prediccion de propiedades fisicas, con objetivos de timing y con modulacion FiLM. Esta ablacion sistematica permite estudiar el impacto de cada componente sobre el comportamiento de la politica, algo relevante para investigadores que trabajan en integracion de razonamiento simbólico en politicas de accion.

La relevancia actual radica en que los VLA de pequeno tamano (500M de parametros en la torre VLM) son candidatos viables para despliegue en robotica de bajo coste, y este repositorio publica los pesos finales tras 47.064 pasos de entrenamiento con batch de 24, lo que facilita la reproducibilidad y la comparacion entre variantes arquitectonicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: SmolVLM2-500M + experto de accion SmolVLA |
| Parametros totales | no disponible (torre VLM de 500M; total del conjunto no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio LeRobot `pretrained_model` con config.json, model.safetensors y ficheros de pre/post-procesado) |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma VLA: una torre vision-language (SmolVLM2-500M) procesa observaciones visuales y texto, y un experto de accion (SmolVLA) genera las acciones motoras. Sobre esta base, el autor anade componentes opcionales segun la variante: tokens de razonamiento (reasoning tokens), un track token para seguimiento de objetos, una cabeza de prediccion de propiedades fisicas (property head), objetivos de timing y modulacion FiLM para condicionar las representaciones internas.

El entrenamiento se realizo sobre un dataset de manipulacion simulada con cuatro tareas (pick, bounce, basket, curling), durante 47.064 pasos con batch de 24. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Cada carpeta del repositorio corresponde a una ablacion concreta (por ejemplo, `plain1f_none`, `baseline_tokens`, `R6_tokens_track_head`, `R8b_tokens_track_head_timing_film`), y un fichero `source_run_name.txt` documenta el nombre original del run de entrenamiento. La carga requiere el plugin `lerobot_policy_smolvla_phys` del repositorio de codigo del proyecto, y las rutas relativas al dataset dentro de `config.json` estan escritas como `${DATA_ROOT}`, por lo que deben apuntarse manualmente a la raiz del dataset.

## Capacidades

- Control robotic de manipulacion en entornos simulados para cuatro tareas: pick, bounce, basket y curling.
- Procesamiento conjunto de vision y lenguaje mediante la torre SmolVLM2-500M.
- Generacion de acciones motoras a traves del experto SmolVLA.
- Razonamiento explicito opcional mediante reasoning tokens (variantes `tokens`).
- Seguimiento de objetos mediante track token (variantes `track`).
- Prediccion de propiedades fisicas mediante property head (variantes `head`).
- Modelado temporal con objetivos de timing (variantes `timing`).
- Condicionamiento de representaciones mediante FiLM (variantes `film`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step general: no disponible (el razonamiento esta orientado a la politica de accion).
- Capacidades multilingues: no disponible.
- Capacidades de vision general, audio o thinking mode fuera del ambito robotic: no disponible.

## Casos de uso

- Investigacion en ablacion de componentes VLA: el repositorio publica variantes con y sin reasoning tokens, track token, property head, timing y FiLM, lo que permite aislar la contribucion de cada modulo comparando checkpoints bajo el mismo dataset y presupuesto de entrenamiento.
- Manipulacion robotica simulada en tareas de pick-and-place: la variante `plain1f_none` o `plain3f_none` sirve como linea base para experimentos de agarre y colocacion en simulador con una o tres frames por camara.
- Seguimiento de objetos en tareas dinamicas (bounce, curling): las variantes con track token (`trackonly_none_extdet`, `R6_tokens_track_head`) estan disenadas para mantener la referencia del objeto durante trayectorias no estaticas.
- Razonamiento fisico en entornos simulados: las variantes con property head y objetivos de timing (`R8a_tokens_track_head_timing`, `R8b_tokens_track_head_timing_film`) permiten estudiar si la prediccion explicita de propiedades mejora la politica en tareas con fisica no trivial.
- Reproduccion de experimentos academicos: al incluir `source_run_name.txt` y los pesos finales tras 47.064 pasos, el repositorio facilita la replicacion de resultados en publicaciones sobre VLA.
- Evaluacion de SmolVLA como experto de accion de bajo coste: con una torre VLM de 500M, el conjunto es adecuado para probar pipelines LeRobot en hardware modesto antes de escalar a modelos mayores.
- Desarrollo de plugins LeRobot: la dependencia del plugin `lerobot_policy_smolvla_phys` lo convierte en banco de pruebas para extender el ecosistema LeRobot con cabezas de accion personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 14,7 GB en safetensors, lo que incluye multiples checkpoints. Un unico checkpoint con torre VLM de 500M es previsiblemente ligero, pero no se especifica el tamano por carpeta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano de la torre VLM (500M) es plausible en GPUs consumer, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot con el plugin `lerobot_policy_smolvla_phys`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (el modelo es una politica de accion, no un LLM de chat).
- Latencia y throughput: no disponible.
- Requisito adicional: es necesario apuntar `${DATA_ROOT}` en `config.json` a la raiz del dataset para cargar los checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| physics-reasoning-vla-ckpt | Torre VLM 500M + experto SmolVLA | no disponible | VLA de manipulacion simulada | Apache 2.0 | Hugging Face (0 descargas) |
| SmolVLA (base) | ~450M (segun publicacion original) | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face |
| OpenVLA | ~7B | no disponible | VLA de manipulacion | no disponible en esta ficha | Hugging Face |
| RT-2 | no disponible | no disponible | VLA de robotica | propietaria | no publico |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion con cuatro tareas (pick, bounce, basket, curling); la transferencia a robot real no esta documentada.
- Requiere el plugin `lerobot_policy_smolvla_phys` del repositorio de codigo del proyecto; no es cargable con LeRobot estandar sin ese plugin.
- Las rutas del dataset en `config.json` usan `${DATA_ROOT}` y deben reescribirse manualmente; una carga sin ajuste fallara.
- El repositorio contiene multiples checkpoints (14,7 GB en total); no se especifica cual es el recomendado para cada tarea.
- Sin datos publicados de benchmarks, tasas de exito por tarea ni comparaciones con lineas base.
- Sin informacion sobre sesgos, riesgo de alucinacion en la parte VLM, ni comportamiento fuera de distribucion.
- Idiomas soportados no documentados; la interfaz de lenguaje no esta caracterizada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion en robot real limita su uso en produccion sin validacion adicional.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/HoonheeCho/physics-reasoning-vla-ckpt
- Repositorio de codigo del proyecto (plugin `lerobot_policy_smolvla_phys`): no disponible en la informacion proporcionada
- Paper de SmolVLA: no disponible en la informacion proporcionada
- Paper de SmolVLM2: no disponible en la informacion proporcionada
- Documentacion de LeRobot: no disponible en la informacion proporcionada
