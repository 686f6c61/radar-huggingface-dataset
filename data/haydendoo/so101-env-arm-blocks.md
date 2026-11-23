# haydendoo/so101-env-arm-blocks

## Resumen

`haydendoo/so101-env-arm-blocks` no es un modelo de lenguaje, sino un paquete de entorno de simulación para LeRobot EnvHub. Concretamente, define el escenario de la tarea de bloques y bandeja del robot SO-101 sobre una reconstrucción de mesa NuRec, construido con `env.py` a partir de una especificación YAML y el módulo `so101_platform/compose.py`. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

El paquete proporciona la interfaz de observación (dos cámaras RGB de 480x640, `front` cenital y `wrist` en la pinza, más 6 posiciones articulares en `agent_pos`) y de acción (6 objetivos articulares absolutos en unidades LeRobot SO-101), con una tasa de control de 30 fps sobre física a 60 Hz con decimación 2. La tarea concreta es "Pick up the red block and place it in the tray", con una condición de éxito basada en contacto de la mordaza, elevación y permanencia del bloque en la bandeja durante 10 pasos.

Su relevancia es acotada pero específica: sirve como entorno de evaluación reproducible para políticas de imitación (por ejemplo ACT) entrenadas sobre el conjunto de datos `datasets/lerobot/*`, ya que declara los mismos nombres de componente y unidades que la salida de `cli/convert.py`. No obstante, la model card documenta explícitamente que la ruta de extremo a extremo con Isaac Sim no está conectada y que existen conflictos de dependencias sin resolver.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de simulación (no es un modelo neuronal); escena Arena construida desde especificación YAML |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el paquete contiene código Python, YAML, USDZ y calibraciones de cámara) |

Especificaciones del entorno:

| Parametro | Valor |
|---|---|
| Observación | `pixels`: `front` (cenital) y `wrist` (pinza), RGB 480x640; `agent_pos`: 6 posiciones articulares |
| Acción | 6 objetivos articulares absolutos (brazo -100..100, pinza 0..100) |
| Tasa de control | 30 fps (física a 60 Hz, decimación 2) |
| Tarea | "Pick up the red block and place it in the tray." |
| Condición de éxito | `info["is_success"]`: contacto de mordaza, elevación y bloque en bandeja durante 10 pasos |
| Fin de episodio | Término de éxito de Arena o `episode_length_s` (70 s por defecto) |
| Domain randomization | Seleccionada por especificación (`none`, `light`, `physics`, `full`); semilla por reinicio |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un entorno de simulación. `env.py` construye la escena Arena a partir de una especificación YAML mediante `so101_platform/compose.py`; cambiar la escena, la tarea o el perfil de domain randomization es un cambio de especificación, no de `env.py`. El paquete incluye un payload NuRec (`scene_payload/export_nurec.usdz`) y calibraciones de cámara relativas que se resuelven contra el bundle, de modo que funciona desde cualquier directorio de trabajo.

La model card documenta tres verificaciones realizadas: (1) el contrato y el bucle LeRobot sobre un backend falso en CPU, ejecutando un episodio ACT con `lerobot_eval`; (2) la escena Arena real en Kit mediante el wrapper oficial `policy_runner.py` con la tarea `Recon-SO101-PickPlace-v0`; y (3) el round-trip al Hub, subiendo el bundle a un repositorio privado (56 archivos, 73 MB, commit `4f51c378e49cf98ee614a72e76afa1a466784b7a`) y reconstruyendo `ArenaSO101Env(spec_path=...)`, donde se corrigieron errores de conversión de tensores CUDA y de cierre de `AppLauncher.close`.

El sistema de staging (`stage.py`, `envforge.py env push/pull`) permite empaquetar entornos con nombre, escribiendo `envhub.json` con id, clave de escena, rutas de especificación, workspace y cámaras, hashes y commit del código. `env.py` selecciona la especificación por orden: `SO101_ENV_SPEC`, luego `envhub.json`, luego el valor por defecto del repositorio.

## Capacidades

- Definición de un entorno de simulación completo para la tarea de recogida y colocación de bloques con el robot SO-101.
- Observaciones multimodales: dos cámaras RGB (cenital y de pinza) más estado articular de 6 dimensiones.
- Acciones continuas de 6 dimensiones en unidades LeRobot SO-101, compatibles con políticas entrenadas sobre `datasets/lerobot/*`.
- Domain randomization configurable por especificación en cuatro niveles (`none`, `light`, `physics`, `full`) con semilla por reinicio.
- Cálculo de éxito determinista y terminación de episodio configurable.
- Empaquetado y distribución de entornos vía EnvHub con `envforge env push` y `envforge env pull`.
- Compatibilidad declarada con el bucle de evaluación de LeRobot 0.7 (`--env.type=envhub`).
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes: es exclusivamente un entorno de evaluación de políticas robóticas.

## Casos de uso

- Evaluación de políticas de imitación tipo ACT: el paquete expone el contrato de observación y acción idéntico al de los datos de entrenamiento, por lo que una política entrenada sobre `datasets/lerobot/*` puede evaluarse sin adaptadores de claves ni conversión de unidades.
- Reproducción de experimentos de manipulación robótica: al fijar la especificación YAML y la semilla de domain randomization por reinicio, se obtienen condiciones de evaluación reproducibles entre ejecuciones.
- Estudio de robustez ante domain randomization: los perfiles `none`, `light`, `physics` y `full` permiten medir la degradación de una política al aumentar la variabilidad física y visual del entorno.
- Integración en pipelines de entrenamiento con LeRobot: el bucle `lerobot_eval` con `--env.type=envhub` permite lanzar episodios de evaluación y generar métricas y vídeo de forma automatizada.
- Desarrollo de nuevas tareas sobre la mesa reconstruida: al ser la escena, la tarea y el perfil de DR cambios de especificación y no de código, se pueden derivar variantes de la tarea sin tocar `env.py`.
- Distribución de entornos entre equipos: `envforge env push` y `env pull` permiten publicar y recuperar entornos con nombre, con calibraciones de cámara opcionales y referencias relativas resueltas contra el bundle.
- Validación de la cadena de simulación: la ejecución en Kit con `policy_runner.py` y la tarea `Recon-SO101-PickPlace-v0` sirve para comprobar que la escena NuRec se carga correctamente antes de invertir en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta verificaciones funcionales (ejecución de un episodio ACT en CPU con backend falso, ejecución de 5 pasos en Kit con `so101_check.sh --task Recon-SO101-PickPlace-v0 --steps 5 --viz none`, y round-trip al Hub), sin métricas de tasa de éxito ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no ser un modelo neuronal, no aplica un cálculo de VRAM por parámetros; el consumo vendrá determinado por la política evaluada y por el simulador.
- GPU recomendadas: no disponible en la información proporcionada. La ruta verificada en Kit requiere Isaac Sim 6.2, Isaac Lab 3.0 y Arena 0.3.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue:
  - Backend falso en CPU con LeRobot 0.7 (`envhub/tests/`), válido para probar el contrato de observación/acción sin Isaac Sim.
  - Kit con el wrapper oficial `policy_runner.py` y la tarea `Recon-SO101-PickPlace-v0`.
  - Servidor de políticas LeRobot remoto mediante `arena_so101/evaluate.sh`, que ejecuta LeRobot e Isaac Sim en procesos separados y es, según la model card, la única disposición que respeta ambos pines de numpy.
- Latencia y throughput: no disponibles. La tasa de control del entorno es de 30 fps sobre física a 60 Hz.

Advertencia de dependencias documentada por el autor: LeRobot 0.7 requiere `numpy<2.3`, `transformers>=5.22` y `huggingface_hub>=1.31`, mientras que Arena 0.3 (Isaac Sim 6.2 / Lab 3.0) fija `numpy==2.3.1`, `transformers==5.10` y `huggingface_hub==1.16`. La ruta en proceso y la del servidor de simulador con Docker están bloqueadas; LeRobot 0.6.1 tampoco resuelve el conflicto y además carece del registro genérico `--env.type=envhub` y de `lerobot-env-server`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros entornos EnvHub comparables ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- La ruta de extremo a extremo con Isaac Sim no está conectada: la model card califica el bloqueo como explícito y sin resolver.
- Conflicto de dependencias entre LeRobot 0.7 y Arena 0.3 en `numpy`, `transformers` y `huggingface_hub`; instalar LeRobot en el venv del simulador rompe el simulador.
- La ruta del servidor de simulador con Docker requiere construir una imagen personalizada con Isaac Sim 6.2, Isaac Lab 3.0 y Arena, incluyendo el prepend de `omni.usd.libs` en `PYTHONPATH` y `LD_LIBRARY_PATH`; el `requirements.txt` del repositorio solo cubre la parte instalable por pip.
- El repositorio no registra descargas ni likes, y la licencia no está declarada: no hay autorización explícita para uso comercial.
- El paquete no incluye pesos de modelo; la calidad de los resultados dependerá de la política que se evalúe.
- Los entornos recuperados con `env pull` son de solo ejecución: volver a ejecutar pose, workspace o finalize requiere el workspace original.
- No se han publicado métricas de tasa de éxito ni benchmarks, por lo que no es posible estimar de antemano el rendimiento de una política en este entorno.
- El tamaño del repositorio (0,1 GB) y la inclusión del payload NuRec implican que el bundle descargado incluye la escena completa, con el coste de almacenamiento asociado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haydendoo/so101-env-arm-blocks
- Documentación de LeRobot EnvHub: https://huggingface.co/docs/lerobot/envhub
- Referencia de evaluación de políticas citada en la model card: `../docs/policy-evaluation.md` (ruta relativa dentro del repositorio)
- Guía del servidor remoto de políticas LeRobot citada: `../course/12-compose-a-task.md` (ruta relativa dentro del repositorio)
- Repositorio privado de round-trip mencionado: `haydendoo/so101-recon-envs` (commit `4f51c378e49cf98ee614a72e76afa1a466784b7a`, 56 archivos, 73 MB)
