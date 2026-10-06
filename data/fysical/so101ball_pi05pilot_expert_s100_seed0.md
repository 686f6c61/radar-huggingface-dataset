# fysical/so101ball_pi05pilot_expert_S100_seed0

## Resumen

El modelo `fysical/so101ball_pi05pilot_expert_S100_seed0` es una política de robótica del tipo Vision-Language-Action (VLA) publicada por el usuario `fysical` en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence, un modelo VLA disenado para generalizacion en entornos abiertos. El modelo consume observaciones visuales de varias camaras junto con el estado del robot y produce acciones de control de bajo nivel.

El problema que resuelve es el de la manipulacion robotica mediante aprendizaje por imitacion: a partir de demostraciones humanas, la politica aprende a ejecutar una tarea concreta. En este caso, la tarea es "coger la pelota verde y colocarla en la cesta, ignorando las dos pelotas rojas distractoras". El modelo cuenta con 4.143.404.816 parametros totales (unos 4.14 mil millones), esta publicado bajo licencia Apache 2.0 y emplea pesos en formato safetensors.

Es relevante porque ejemplifica el flujo de trabajo de LeRobot para entrenar y desplegar politicas VLA sobre robots reales (tipo `so_follower`, el brazo SO-101 de bajo coste), permitiendo a desarrolladores e investigadores reproducir el pipeline de imitacion con hardware asequible y una base preentrenada de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4.14 mil millones) |
| Parametros activos | no disponible (no se especifica composicion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | so_follower |
| Camaras | front, wrist |
| Entradas | `observation.images.base_0_rgb` (3,224,224); `observation.images.left_wrist_0_rgb` (3,224,224); `observation.images.right_wrist_0_rgb` (3,224,224); `observation.state` (32,) |
| Salidas | `action` (6,) |
| Modelo base | lerobot/pi05_base |
| Tamano del repositorio | 40.1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura es la de π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence. Segun la model card, evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementacion de LeRobot esta adaptada del repositorio de codigo abierto OpenPI del propio autor original. El modelo procesa tres flujos visuales (una camara frontal y dos de muneca) a resolucion 224x224, junto con un vector de estado del robot de dimension 32, y emite un vector de accion de dimension 6.

El fine-tuning se realizo sobre el dataset `fysical/greenball_pool_225_v1`, compuesto por 225 episodios y 116.164 fotogramas a 30 FPS, correspondientes a la tarea de recogida selectiva de una pelota verde descartando dos pelotas rojas. La configuracion de entrenamiento fue: 6.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 0 y LeRobot version 0.6.2. No se detalla en la informacion disponible la composicion exacta del preentrenamiento del modelo base ni si hubo etapas de RLHF/DPO aplicadas a este ajuste concreto.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado, para el brazo `so_follower`.
- Percepcion visual multi-camara: integra simultaneamente una vista frontal y dos vistas de muneca (`front`, `left_wrist`, `right_wrist`).
- Ejecucion de una tarea especifica: "coger la pelota verde y colocarla en la cesta, ignorando las dos pelotas rojas distractoras".
- Generalizacion de entornos: al derivar de Pi05, esta disenado para transferir a situaciones no vistas durante el entrenamiento, aunque la model card no aporta evidencia empirica de ello para este ajuste.
- Integracion con LeRobot: soporta ejecucion mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode, ya que no es un modelo de lenguaje conversacional sino una politica de control.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: desplegar la politica sobre un SO-101 para reproducir la tarea de recogida y colocacion de la pelota verde, sirviendo como banco de pruebas de imitacion learning.
- Investigacion en aprendizaje por imitacion: usar esta politica como referencia entrenada para comparar tecnicas de data augmentation, variaciones de dataset o hiperparametros de LeRobot.
- Punto de partida para fine-tuning de nuevas tareas: reentrenar sobre el base `lerobot/pi05_base` o ajustar este modelo para tareas de recogida con distintos objetos y contenedores.
- Evaluacion de robustez ante distractores: la tarea incluye explicitamente dos pelotas rojas distractoras, por lo que es util para medir la resistencia de la politica a objetos irrelevantes.
- Clasificacion y seleccion de objetos por color: extrapolable a lineas de separacion sencillas donde el robot debe elegir un objeto segun su apariencia visual.
- Demostracion educativa de VLA: ejemplo didactico de pipeline completo (grabacion de datos, entrenamiento, rollout) con documentacion oficial de LeRobot.
- Pruebas de integracion de control a 30 FPS: permite validar la sincronizacion entre camaras, estado del robot y frecuencia de control en un montaje real.
- Benchmark interno de politica sobre hardware de bajo coste: util para equipos con presupuesto limitado que quieran experimentar con modelos VLA sin GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que "no se han proporcionado resultados de evaluacion para esta politica todavia" (ningun numero de tasa de exito ni de ensayos en robot real).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los ~4.14 mil millones de parametros ocupan aproximadamente 8,3 GB; con overhead de activaciones y buffers, se estiman unos 10-12 GB. En fp32 serian aproximadamente 16,6 GB de pesos, con un total estimado de 18-22 GB.
- GPUs recomendadas: A100 (40/80 GB) o H100 (80 GB) para entrenamiento o despliegue con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en bf16.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM (por ejemplo RTX 4070 Ti Super, RTX 4080, RTX 4090). En GPUs de 8 GB probablemente requiera cuantizacion, que no esta documentada en la informacion disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento) sobre PyTorch con CUDA. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 30 FPS, pero no se especifica la latencia real de inferencia de la politica.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fysical/so101ball_pi05pilot_expert_S100_seed0 | ~4.14 mil millones | VLA (Pi05 fine-tuned) | no disponible | apache-2.0 | HuggingFace |
| lerobot/pi05_base | no disponible | VLA (Pi05 base) | no disponible | no disponible | HuggingFace |
| lerobot/pi0_base | no disponible | VLA (Pi0) | no disponible | no disponible | HuggingFace |
| OpenVLA | ~7 mil millones | VLA | no disponible | no disponible | Repositorio publico |

Nota: los datos de los modelos comparables no estaban disponibles en la informacion proporcionada; la comparacion es cualitativa y debe verificarse en las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Tarea unica: la politica esta ajustada exclusivamente para "coger la pelota verde y colocarla en la cesta, ignorando las dos pelotas rojas distractoras"; no se documenta su comportamiento en otras tareas.
- Sin resultados de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste al entorno de entrenamiento: al provenir de un fine-tuning con solo 6.000 pasos sobre 225 episodios, la generalizacion a cambios de iluminacion, posicion de objetos o robot puede degradarse.
- Dependencia del montaje: las entradas esperadas exigen tres camaras concretas (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) con nombres de observacion exactos; un montaje distinto impide el funcionamiento directo.
- Sin datos de sesgos ni idioma: al no ser un modelo de lenguaje, no aplican sesgos linguisticos, pero no se han analizado sesgos visuales o de comportamiento.
- Riesgo de alucinacion: en el contexto de politicas VLA se traduce en acciones incorrectas o movimientos no previstos; no hay evaluacion de seguridad fisica.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base `lerobot/pi05_base` y los derechos de Pi05/OpenPI deben revisarse por separado.
- Repositorio de gran tamano: 40.1 GB, lo que implica tiempos de descarga y almacenamiento considerables.
- Cero descargas y cero likes: sin adopcion ni validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fysical/so101ball_pi05pilot_expert_S100_seed0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fysical/greenball_pool_225_v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_pool_225_v1
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (implementacion original): https://github.com/Physical-Intelligence/openpi
- Guia de inferencia de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
