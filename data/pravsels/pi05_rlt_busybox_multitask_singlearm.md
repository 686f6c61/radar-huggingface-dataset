# pravsels/pi05_rlt_busybox_multitask_singlearm

## Resumen

El modelo `pi05_rlt_busybox_multitask_singlearm` es un encoder/decoder de tokens RL (RLT Stage 1) desarrollado por el usuario `pravsels` sobre el checkpoint congelado del VLA π0.5 BusyBox multitask. Pertenece al ecosistema OpenPI de Physical Intelligence y está pensado para tareas de robótica, específicamente para control de un brazo manipulador en entornos multitarea. Su función principal es extraer tokens de representación latente a partir de observaciones visuales y de estado, que luego pueden ser utilizados por una política de control.

El modelo se basa en la arquitectura π0.5, un modelo de visión-lenguaje-acción (VLA) de flujo, al que se le añade un módulo RLT (RL-token) que actúa como tokenizador de acciones. Está entrenado sobre el dataset `villekuosmanen/busybox_multitask` con 66 episodios y 27 tareas, usando una sola cámara superior, una cámara de muñeca y una frontal. El tamaño del repositorio es de 6.3 GB, lo que indica que los pesos están publicados en formato de parámetros y assets, sin incluir el estado de entrenamiento.

La relevancia de este modelo radica en que permite integrar el tokenizado RLT en el flujo de trabajo de OpenPI para robótica, facilitando la investigación en control de manipuladores con aprendizaje por refuerzo. Al estar basado en un VLA congelado, el modelo se centra en la extracción de características temporales y de acción, lo que lo hace útil para experimentos de control en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 + RLT (Pi0RLConfig, pi05=true) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de robótica, sin soporte lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo combina el VLA π0.5 (un modelo de flujo que procesa observaciones visuales y lingüísticas para generar acciones) con un módulo RLT (RL-token) que actúa como encoder/decoder de tokens de acción. La política se configura como `Pi0RLConfig` con `pi05=true`, lo que indica que se usa la versión 0.5 de π0. El VLA subyacente (el checkpoint congelado `pravsels/pi05_busybox_multitask`) se mantiene fijo durante el entrenamiento, con un peso de pérdida `rl_vla_loss_weight=0.0`, de modo que solo se entrenan los componentes RLT.

El entrenamiento se realizó en una GPU A100 de 80GB en GCloud durante 20,000 pasos con un batch global de 16 y un horizonte de acción de 30. Se utilizó el dataset `villekuosmanen/busybox_multitask` con 66 episodios y 27 tareas, y las instrucciones se remapearon por frame mediante `prompt_from_task`. La normalización de acciones se hizo por timestep con percentiles 1%/99%, y los assets del hub se copiaron sin recalcular. Las cámaras se mapearon de la siguiente forma: `top` a `base_0_rgb`, `wrist` a `left_wrist_0_rgb` y `front` a `base_1_rgb`. El espacio de acción tiene 6 dimensiones: 5 articulaciones en delta y la pinza en valor absoluto.

## Capacidades

- Generación de acciones de control para un brazo robótico de 6 grados de libertad (5 articulaciones + pinza).
- Extracción de tokens RL a partir de observaciones visuales (tres cámaras) y de estado, para su uso en políticas de aprendizaje por refuerzo.
- Soporte de tareas multitarea: el modelo está entrenado en 27 tareas diferentes dentro del entorno BusyBox.
- Integración con el ecosistema OpenPI: se puede cargar mediante `policy_config.create_trained_policy` y servir a través de `serve_policy.py`.
- No soporta lenguaje natural, tool calling ni razonamiento general; es un modelo específico para robótica.

## Casos de uso

- Control de brazo robótico en simulación: el modelo puede usarse en entornos como BusyBox para ejecutar tareas de manipulación (apilar, insertar, etc.) usando las observaciones de cámara y las acciones generadas.
- Investigación en aprendizaje por refuerzo: al ser un tokenizador RLT, permite estudiar la representación latente de acciones en políticas VLA, facilitando experimentos de RL sobre el espacio de tokens.
- Desarrollo de políticas de manipulación en tiempo real: gracias a su horizonte de acción de 30 pasos, puede generar secuencias de control para tareas de precisión.
- Benchmarking de arquitecturas VLA: sirve como punto de comparación para evaluar el rendimiento de π0.5 con tokenizado RL frente a otras variantes.
- Prototipado de sistemas de control basados en OpenPI: el código de ejemplo de carga y servido permite integrarlo rápidamente en pipelines robóticos.
- Estudio de generalización multitarea: al estar entrenado en 27 tareas, se puede analizar su capacidad de transferencia entre tareas del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento: se realizó en una GPU A100 de 80GB, lo que sugiere que la inferencia en tiempo real también requerirá una GPU de alta capacidad (al menos 40GB de VRAM, aunque no se especifica).
- No se indican requisitos mínimos de VRAM para inferencia, pero dado el tamaño del repo (6.3 GB) y la arquitectura VLA, se estima que necesita al menos 16-24GB de VRAM con cuantización, aunque no hay datos confirmados.
- El modelo se puede desplegar con las herramientas de OpenPI, como `serve_policy.py`, que utiliza vLLM o TGI como backend según la configuración.
- No se proporcionan estimaciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo especializado en robótica; no es adecuado para tareas de lenguaje o visión generales.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación.
- El dataset de entrenamiento es reducido (66 episodios), lo que puede limitar la generalización a entornos o tareas fuera de BusyBox.
- No se publica el estado de entrenamiento (`train_state/`), por lo que no es posible continuar el entrenamiento desde el checkpoint final.
- Las instrucciones de tarea se remapean por frame; si se usan instrucciones fuera de las 27 definidas, el comportamiento puede degradarse.
- No se han reportado evaluaciones de seguridad o sesgos, y al ser un modelo de control físico, errores en la generación de acciones podrían causar daños en entornos reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/pravsels/pi05_rlt_busybox_multitask_singlearm)
- [Modelo VLA congelado asociado](https://huggingface.co/pravsels/pi05_busybox_multitask)
- [Dataset BusyBox multitask](https://huggingface.co/datasets/villekuosmanen/busybox_multitask)
- [Repositorio OpenPI en GitHub](https://github.com/Physical-Intelligence/openpi)
- [Proyecto W&B del entrenamiento](https://wandb.ai/pravsels/busybox_multitask_rlt_singlearm)
- [Run W&B específico](https://wandb.ai/pravsels/busybox_multitask_rlt_singlearm/runs/xmkdxvrl)
