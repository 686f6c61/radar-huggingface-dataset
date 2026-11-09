# DecentVLA/droidfull8_pi05_fedavg

## Resumen

droidfull8_pi05_fedavg es un checkpoint de robótica basado en π0.5 (pi05), el modelo de visión-lenguaje-acción (VLA) de Physical Intelligence, publicado por el colectivo DecentVLA. Se trata de un ajuste fino completo (full fine-tune) del checkpoint base `pi05_base` siguiendo la receta oficial de openpi para el conjunto de datos DROID (`pi05_full_droid_finetune`), pero con un entrenamiento federado: ocho clientes, cada uno compuesto por edificios completos del dataset DROID, agregados mediante FedAvg ponderado por número de frames.

El modelo resuelve el problema de generar acciones de control robótico de tipo joint-position a partir de observaciones visuales: una cámara exterior y una cámara de muñeca, más el estado del robot (7 posiciones articulares y gripper). Produce chunks de 16 pasos de objetivos articulares absolutos junto con la acción del gripper, con la misma interfaz de entrada y salida que el checkpoint de referencia `pi05_droid_jointpos`.

Su relevancia radica en que demuestra empíricamente que el entrenamiento federado sobre particiones naturales del dataset (edificios completos, sin fuga entre clientes) puede reproducir el pipeline de openpi con pesos servibles directamente por el servidor estándar de openpi. El repositorio ocupa 96,3 GB e incluye tanto los pesos EMA en formato openpi como el checkpoint de entrenamiento con el estado del optimizador y el cliente de robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) π0.5 de openpi, implementación JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos servidos en precisión nativa del checkpoint openpi) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint openpi (`params/` con pesos EMA y `assets/droid/norm_stats.json`); además `server_round_0400.pt` con pesos y shadow EMA |

## Arquitectura y entrenamiento

El modelo se basa en π0.5, la arquitectura VLA de Physical Intelligence implementada en openpi sobre JAX. La tarea es control de robot con acciones de posición articular en chunks de 16 pasos: la entrada combina una cámara exterior, una cámara de muñeca y el estado propioceptivo (7 posiciones articulares más gripper), y la salida son objetivos articulares absolutos más gripper para cada paso del chunk.

El entrenamiento parte de `pi05_base` con la receta `pi05_full_droid_finetune` de openpi sobre el release RLDS `droid/1.0.1`, filtrando episodios exitosos y aplicando el filtro de frames inactivos de openpi: 78.864 episodios y 22,13 M frames. Se usó learning rate 5e-5, clipping 1.0, EMA 0.99 y 25,6 M muestras procesadas. La innovación principal es el esquema federado: 8 clientes formados por conjuntos de edificios completos de DROID (sin dividir edificios entre clientes), balanceados por frames de entrenamiento, con FedAvg ponderado por frames, 400 rondas de 250 pasos locales y batch 32 por cliente. Los pesos servidos son los EMA, tal como los sirve openpi.

## Capacidades

- Generación de acciones de control robótico de posición articular en chunks de 16 pasos.
- Procesamiento multimodal de dos cámaras (exterior y muñeca) más estado propioceptivo del robot.
- Control de gripper integrado en la secuencia de acciones.
- Compatibilidad directa con el servidor de políticas de openpi (`serve_policy.py`).
- Evaluación en simulación mediante RoboLab (familia pi0) y en robot DROID real.
- Entrenamiento federado reproducible con agregación FedAvg ponderada por frames.
- No se documentan capacidades de texto, razonamiento, código, tool calling ni agentes, por tratarse de un modelo de robótica.

## Casos de uso

- Manipulación robótica en plataformas DROID: el modelo recibe las imágenes de cámara exterior y de muñeca y emite objetivos articulares absolutos, integrándose con el cliente `droid_jointpos_main.py` para control en tiempo real con límite de seguridad por paso (`--max-joint-step`, por defecto 0,25 rad).
- Evaluación en simulación con RoboLab: se sirve con `scripts/serve_policy.py` y se ejecuta `policies/pi0_family/run.py --policy pi05 --headless`, permitiendo validar políticas antes de desplegarlas en hardware.
- Investigación en aprendizaje federado para robótica: el checkpoint `server_round_0400.pt` incluye pesos, shadow EMA y log de entrenamiento, lo que permite reproducir y analizar la agregación FedAvg sobre particiones por edificio.
- Benchmarking frente al checkpoint de referencia `pi05_droid_jointpos`: al compartir exactamente la misma interfaz de entrada y salida, permite comparaciones controladas de rendimiento sin adaptar el pipeline.
- Desarrollo de pipelines de ajuste fino sobre DROID: la configuración `openpi_pi05_droidfull8_fedavg_local.yaml` sirve como plantilla para entrenamientos locales con la receta oficial.
- Prototipado de control articular en robots con 7 grados de libertad más gripper: la salida en posiciones articulares absolutas simplifica la integración con controladores de bajo nivel que aceptan consignas de posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA obligatoria; no se contempla ejecución en CPU.
- Para evaluación en RoboLab: RTX con al menos 48 GB de VRAM.
- Para servir únicamente la política: al menos 16 GB de VRAM.
- El despliegue se realiza con el servidor de openpi (`scripts/serve_policy.py`) y la variable `XLA_PYTHON_CLIENT_MEM_FRACTION=0.5` en el ejemplo del autor.
- El repositorio completo ocupa 96,3 GB, por lo que conviene descargar solo el subdirectorio `openpi/*` con `huggingface-cli download --include "openpi/*"`.
- No se documentan cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Entrenamiento | Contexto / acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droidfull8_pi05_fedavg | π0.5 (openpi, JAX) | Federado, 8 clientes, FedAvg sobre DROID completo | Chunks de 16 pasos, joint-position | apache-2.0 | Hugging Face (DecentVLA) |
| pi05_droid_jointpos (referencia) | π0.5 (openpi, JAX) | Centralizado con receta oficial `pi05_full_droid_finetune` | Chunks de 16 pasos, joint-position | no disponible en la información | `gs://openpi-assets-simeval/pi05_droid_jointpos` |
| π0.5 base (`pi05_base`) | π0.5 | Preentrenamiento base | no disponible | no disponible en la información | openpi |

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje general y no debe emplearse para tareas de texto, código o razonamiento.
- La interfaz está fijada a una configuración concreta: una cámara exterior, una cámara de muñeca, 7 posiciones articulares y gripper; cambios en la morfología o el número de cámaras requieren adaptación.
- El entrenamiento usa únicamente episodios exitosos de DROID, lo que puede limitar la robustez ante recuperación de errores.
- El particionado federado por edificios completos implica que el modelo puede presentar sesgos hacia las condiciones de escena y objetos presentes en DROID.
- Riesgo de alucinación de acciones no evaluado en la información disponible; en robótica real conviene mantener límites de seguridad por paso (`--max-joint-step`).
- Licencia apache-2.0 permite uso comercial, pero no se documentan restricciones adicionales de los datos DROID subyacentes.
- No se publican benchmarks, métricas de éxito ni comparaciones cuantitativas con el checkpoint de referencia.
- El repositorio es de gran tamaño (96,3 GB) y los ficheros llegan mediante pull request según la model card, por lo que la disponibilidad puede ser parcial hasta su fusión.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/droidfull8_pi05_fedavg
- Runbook y código de decent-vla (tag `droidfull8-v1`): `examples/droid/README_droidfull8.md` en el repositorio decent-vla
- Checkpoint de referencia: `gs://openpi-assets-simeval/pi05_droid_jointpos`
- openpi (Physical Intelligence): repositorio openpi con `scripts/serve_policy.py` y la receta `pi05_full_droid_finetune`
- RoboLab (NVLabs): instrucciones en `policies/pi0_family/README.md` y fork `xuningy/openpi`
- DROID: release RLDS `droid/1.0.1`
