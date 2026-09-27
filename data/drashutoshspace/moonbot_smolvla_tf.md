# drashutoshspace/moonbot_smolvla_tf

## Resumen

moonbot_smolvla_tf es un ajuste fino (fine-tune) completo del modelo base [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base), un modelo de vision-lenguaje-accion (VLA) compacto orientado a robotica de bajo coste. Lo publica el usuario drashutoshspace dentro del flujo de trabajo LeRobot y esta especializado en una tarea concreta de manipulacion: apilar tres bloques ("three blocks stack"). El modelo combina un codificador de vision, un componente de lenguaje-visual (VLM) y una cabeza de accion, y en este caso se ha entrenado con señal de fuerza/par (force/torque) integrada en su contrato de despliegue.

La relevancia de esta ficha es que forma parte de una comparativa controlada de seis ejecuciones entre pi0, SmolVLA y ACT, con y sin fuerza/par. El modelo parte de los pesos de SmolVLA, que la propia Hugging Face describe como un VLA asequible pensado para "democratizar" el acceso a este tipo de modelos, y que requiere ajuste fino sobre datos propios para un rendimiento optimo en un montaje especifico (la documentacion de LeRobot recomienda grabar del orden de 50 episodios de la tarea como punto de partida).

El modelo se distribuye como un conjunto de checkpoints autocontenidos (pesos, pre/post-procesadores, tokenizador, scripts de despliegue y prueba offline) bajo licencia Apache-2.0. El contrato de despliegue define un estado de 21 dimensiones (8 de lectura articular + 7 de posicion de la punta + 6 de fuerza/par en el efector final), 3 camaras de entrada y una accion de 8 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en SmolVLA, derivada de lerobot/smolvla_base |
| Parametros totales | no disponible (modelo base SmolVLA de tamano compacto; cifra exacta no confirmada en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como fine-tune en precision de entrenamiento) |
| Idiomas soportados | no disponible (recibe instrucciones en lenguaje natural; idiomas heredados del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot); checkpoints autocontenidos con pesos, pre/post-procesadores y tokenizador PaliGemma |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA: un VLA que adapta un modelo de vision-lenguaje preentrenado a control robotico, en lugar de entrenar una politica desde cero. Este fine-tune concreto es un ajuste fino completo en el que el codificador de vision y el componente VLM son entrenables (misma configuracion que en las ejecuciones comparativas con pi0). Las camaras del montaje se renombran a camera1, camera2 y camera3 (originalmente front, eef y right).

El entrenamiento se realizo sobre el dataset [gdiazsrl/three_blocks_stack_sep22](https://huggingface.co/datasets/gdiazsrl/three_blocks_stack_sep22), con un tamano de lote de 16, 20.000 pasos, semilla 1000 (valor por defecto), optimizador y planificador propios del preset de LeRobot y sin particion de validacion (igual que en las ejecuciones de pi0). Se generan checkpoints en los pasos 5.000, 10.000, 15.000 y 20.000, coincidentes con la ejecucion gemela sin fuerza/par. La innovacion destacable no esta en la arquitectura base, sino en la incorporacion de señal de fuerza/par (6 dimensiones) dentro del estado de observacion, lo que conecta el modelo con el control de fuerza durante la manipulacion.

## Capacidades

- Generacion de acciones de control robotico a partir de observaciones visuales y de estado (8 dimensiones de accion).
- Percepcion visual multi-camara: 3 camaras de entrada simultaneas.
- Integracion de fuerza/par en el estado de entrada (F_ee, 6 dimensiones), permitiendo politicas sensibles al contacto.
- Ejecucion de tareas de manipulacion guiadas por instrucciones en lenguaje natural (condicionamiento por tarea, herencia de SmolVLA).
- Apilado de tres bloques ("three blocks stack") como tarea objetivo del ajuste fino.
- Soporte de tool calling / function calling: no aplica (modelo de robotica, no un LLM conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidades declaradas (politica de control, no agente de texto).
- Capacidades multilingues: no disponibles.
- Capacidades especiales: contrato de despliegue robotico completo (21-dim de estado, 3 camaras, 8-dim de accion).

## Casos de uso

- Manipulacion robotica con control de fuerza: la inclusion de fuerza/par en el estado permite tareas de apilado o ensamblaje donde el contacto debe regularse; el modelo emite acciones de 8 dimensiones ajustadas a esa señal.
- Apilado de bloques en entornos de investigacion: caso de uso directo del ajuste fino, util como referencia reproducible en laboratorio de robotica.
- Comparativas de algoritmos VLA: sirve como una de las seis ejecuciones controladas (pi0 / SmolVLA / ACT, con y sin fuerza/par) sobre el mismo dataset, lote, pasos y semilla, para evaluar el efecto de la señal de fuerza.
- Investigacion en VLA asequible: al derivar de SmolVLA, es adecuado para estudiar politicas VLA con recursos limitados y hardware de bajo coste.
- Validacion de politicas offline: cada checkpoint incluye test_offline.py, lo que permite reproducir la inferencia sin el robot antes del despliegue fisico.
- Despliegue sobre montaje propio con el flujo LeRobot: los checkpoints son autocontenidos (prepare_deploy.py, DEPLOY.md, contrato rosetta de la ejecucion), lo que simplifica llevar la politica al robot real.
- Punto de partida para ajuste fino posterior: al ser un modelo de tarea especifica, puede reutilizarse el contrato y los pre/post-procesadores para adaptaciones a variantes de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las ejecuciones comparativas (pi0 / SmolVLA / ACT, con y sin fuerza/par) y enlaza curvas de entrenamiento en Weights & Biases, pero no incluye tablas de metricas de evaluacion ni resultados cuantitativos de exito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un VLA de tamano compacto (herencia de SmolVLA), es esperable que quepa en GPUs de consumo, pero no hay cifras confirmadas en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por el perfil del modelo (VLA compacto) es plausible su uso en GPUs de gama consumer, aunque no se confirma.
- Cabe en GPU consumer: probablemente si, dado el caracter compacto del modelo base, pero no confirmado en la informacion disponible.
- Opciones de despliegue: flujo LeRobot; checkpoints autocontenidos con prepare_deploy.py y DEPLOY.md. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no aplicable o no disponible (modelo de robotica, no LLM de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto de comparacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| moonbot_smolvla_tf | VLA (SmolVLA fine-tune, con fuerza/par) | Una de seis ejecuciones comparativas; mismo dataset, lote 16, 20.000 pasos y semilla | Apache-2.0 | Hugging Face (drashutoshspace) |
| moonbot_smolvla_no_tf | VLA (SmolVLA fine-tune, sin fuerza/par) | Ejecucion gemela del mismo ajuste sin señal de fuerza | Apache-2.0 | Hugging Face (drashutoshspace) |
| moonbot_pi0_three_blocks_stack | VLA (pi0 fine-tune) | Ejecucion de pi0 con el mismo dataset, lote, pasos y semilla | Apache-2.0 | Hugging Face (drashutoshspace) |
| ACT | Politica de imitacion | Algoritmo comparado en el conjunto de seis ejecuciones | no disponible | no disponible en esta informacion |

Comparativa de parametros, contexto y rendimiento entre estas alternativas: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea especifica: esta ajustado para "three blocks stack"; su rendimiento fuera de esa tarea o montaje no esta garantizado.
- Sesgos: la informacion proporcionada no documenta analisis de sesgos; al entrenar sobre un dataset concreto, hereda las condiciones y posibles sesgos de ese dataset.
- Riesgo de alucinacion: en el contexto de un VLA, el riesgo se traduce en acciones erroneas o inseguras ante situaciones fuera de distribucion; no hay evaluacion publicada al respecto.
- Restricciones de contexto o idioma: no se especifica longitud de contexto ni idiomas soportados; las instrucciones de tarea dependen del modelo base.
- Ausencia de particion de validacion: la ejecucion se entreno sin split de validacion, lo que limita la estimacion de generalizacion sobre datos no vistos.
- Dependencia del contrato de despliegue: el modelo espera un estado de 21 dimensiones (8+7+6), 3 camaras y produce acciones de 8 dimensiones; desviarse de ese contrato invalida su uso.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base (SmolVLA) y del dataset utilizado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion reciente sin validacion externa conocida.
- Caveat de tokenizador: la model card menciona un tokenizador PaliGemma incluido en los checkpoints, dato a verificar frente al backbone real del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drashutoshspace/moonbot_smolvla_tf
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/gdiazsrl/three_blocks_stack_sep22
- Ejecucion comparativa con pi0: https://huggingface.co/drashutoshspace/moonbot_pi0_three_blocks_stack
- Ejecucion gemela sin fuerza/par: https://huggingface.co/drashutoshspace/moonbot_smolvla_no_tf
- Curvas de entrenamiento (Weights & Biases): https://wandb.ai/drmishra-space/lerobot/runs/rn1je6y9
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Modelo relacionado moonbot_pi0_v2: https://huggingface.co/drashutoshspace/moonbot_pi0_v2
