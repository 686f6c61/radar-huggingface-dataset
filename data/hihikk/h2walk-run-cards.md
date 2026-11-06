# hihikk/H2walk-run-cards

## Resumen

H2walk-run-cards es un repositorio de artefactos de entrenamiento publicado por el usuario hihikk en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional en el sentido habitual, sino de un conjunto de "run cards" (fichas de ejecución) que documentan dos procesos de entrenamiento de políticas de locomoción para el robot humanoide Unitree H2. El repositorio contiene dos carpetas, `isaac_walk_bootstrap_20261031/` y `mujoco_clr2_v4/`, cada una con la configuración congelada, el comando de lanzamiento exacto y los metadatos del entorno de ejecución.

El primer conjunto de artefactos corresponde a un entrenamiento de bootstrap de velocidad de marcha realizado en Isaac Lab con 4096 entornos paralelos, usando los ficheros `params/env.yaml` y `params/agent.yaml` congelados en el momento del lanzamiento. El segundo corresponde a un entrenamiento con MuJoCo y Stable Baselines3 (SB3) sobre la variante `low_v4`, que incluye escaleras de 3,5 cm, documentado mediante el comando de lanzamiento y ficheros auxiliares `.curriculum.json`.

La relevancia de este repositorio es de trazabilidad y reproducibilidad en robótica con aprendizaje por refuerzo: cada carpeta incluye un `LAUNCH.md` con el comando exacto, el contenedor o entorno virtual utilizado, las rutas de host y de contenedor, y la revisión del código. No se dispone de información sobre pesos del modelo, arquitectura de red, licencia ni idiomas, por lo que esta ficha se limita a documentar lo que el autor ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de control entrenadas con Isaac Lab y SB3; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene configuraciones YAML, comandos de lanzamiento y sidecars `.curriculum.json`) |

## Arquitectura y entrenamiento

El repositorio documenta dos pipelines de entrenamiento distintos. El primero, `isaac_walk_bootstrap_20261031/`, emplea la tarea `Unitree-H2-Velocity-Walk-Bootstrap` de Isaac Lab con 4096 entornos simulados en paralelo, una configuración típica de entrenamiento masivo por refuerzo en GPU para políticas de locomoción. La configuración queda congelada en `params/env.yaml` y `params/agent.yaml` en el momento del lanzamiento, lo que permite reconstruir el experimento. El segundo, `mujoco_clr2_v4/`, usa MuJoCo junto con Stable Baselines3 en la variante `low_v4`, orientada a superar escaleras de 3,5 cm, y se documenta mediante el comando de lanzamiento y ficheros `.curriculum.json` que reflejan el currículo de dificultad progresiva.

No se especifica en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO; tampoco se detalla la arquitectura de red de las políticas (por ejemplo, MLP, transformer o red recurrente), el algoritmo concreto de RL empleado más allá de la referencia a SB3, ni las innovaciones técnicas del entrenamiento. La información se limita a los metadatos de reproducibilidad: comando exacto, contenedor o venv, rutas de host y de contenedor, y revisión del código.

## Capacidades

- Entrenamiento de políticas de locomoción para el robot humanoide Unitree H2 en simulación.
- Bootstrap de velocidad de marcha con 4096 entornos paralelos en Isaac Lab.
- Entrenamiento con MuJoCo y Stable Baselines3 sobre la variante `low_v4`.
- Currículo de dificultad progresiva documentado mediante ficheros `.curriculum.json`.
- Superación de obstáculos de tipo escalera de 3,5 cm en el pipeline de MuJoCo.
- Reproducibilidad de experimentos mediante `LAUNCH.md` con comando, contenedor, rutas y revisión de código.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de locomoción: un investigador puede reconstruir el entrenamiento de `isaac_walk_bootstrap_20261031/` usando los YAML congelados y el comando de `LAUNCH.md`, lo que facilita la verificación de resultados y la comparación entre ejecuciones.
- Auditoría de pipelines de RL en robótica: las run cards permiten trazar qué contenedor, revisión de código y rutas se usaron en cada entrenamiento, lo que resulta útil en entornos de laboratorio con múltiples versiones de Isaac Lab y MuJoCo.
- Transferencia sim-to-real del robot Unitree H2: el bootstrap de velocidad de marcha con 4096 entornos sirve como punto de partida para políticas que luego se ajustan o validan en MuJoCo antes del despliegue físico.
- Entrenamiento de superación de escaleras: el pipeline `mujoco_clr2_v4/` con escaleras de 3,5 cm y currículo progresivo es adecuado para estudiar la robustez de la locomoción ante obstáculos de altura creciente.
- Docencia y formación en RL aplicado a robótica: las run cards sirven como material de referencia para mostrar cómo se estructura un experimento reproducible con Isaac Lab y SB3.
- Comparación de simuladores: al documentar por separado Isaac Lab y MuJoCo con el mismo robot, el repositorio permite contrastar comportamientos y configuraciones entre ambos entornos.
- Gestión de experimentos en laboratorio: los sidecars `.curriculum.json` y los YAML congelados facilitan el versionado y la reanudación de entrenamientos sin ambigüedad sobre la configuración usada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no publica pesos ni políticas entrenadas).
- GPU recomendadas: no disponible para inferencia; para el entrenamiento con Isaac Lab y 4096 entornos paralelos se requiere una GPU de datacenter con gran capacidad de cómputo y memoria, aunque el autor no especifica modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan exportaciones a ONNX, TensorRT, MuJoCo deploy ni formatos similares).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica pesos ni políticas comparables, y no se dispone de información sobre run cards equivalentes de otros autores para el Unitree H2 en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni políticas entrenadas, solo configuraciones, comandos y metadatos de ejecución.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan idiomas, sesgos, riesgo de alucinación ni limitaciones de contexto porque no es un modelo de lenguaje.
- La reproducibilidad depende de disponer de las versiones exactas de Isaac Lab, MuJoCo, Stable Baselines3 y del contenedor o venv indicados en cada `LAUNCH.md`.
- El entrenamiento con 4096 entornos paralelos en Isaac Lab exige hardware de gama alta; no se indica el mínimo viable.
- No hay información sobre validación sim-to-real ni sobre el rendimiento de las políticas resultantes en el robot físico.
- Las fechas de creación y actualización del repositorio (2026) y el nombre de la carpeta `isaac_walk_bootstrap_20261031/` deben tratarse con cautela hasta verificar su coherencia con el resto de metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hihikk/H2walk-run-cards
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información proporcionada.
