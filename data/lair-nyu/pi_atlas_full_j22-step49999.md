# lair-nyu/pi_atlas_full_j22-step49999

## Resumen

pi_atlas_full_j22-step49999 es un checkpoint de política robótica (vision-language-action, VLA) publicado por el grupo lair-nyu en Hugging Face. Se trata de un ajuste fino del modelo pi05 (familia openpi) sobre un conjunto de tareas manipulativas denominado atlas_full_j22, entrenado durante 50.000 pasos. El modelo recibe instrucciones en lenguaje natural que incluyen, además de la descripción de la subtarea, un objetivo espacial expresado en el marco de referencia de la base del robot y en metros (por ejemplo, «open the fridge {0.62 -0.18 1.04}»).

La relevancia de este checkpoint radica en su enfoque de condicionamiento espacial explícito: en lugar de depender únicamente de la instrucción textual, el prompt incorpora coordenadas 3D del objetivo, lo que facilita tareas de manipulación con localización precisa. Además, emplea «modality dropout» durante el entrenamiento, una técnica que permite al modelo funcionar aunque falte alguna de las modalidades de entrada (texto o coordenadas).

El repositorio contiene únicamente los pesos del modelo (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y metadatos del checkpoint; se ha eliminado el estado del optimizador. La carga requiere la configuración de entrenamiento de pi-atlas, que define la arquitectura y las transformaciones de datos. El tamaño del repositorio es de 12,4 GB y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia pi05 / openpi; VLA basada en transformer, detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo incluye `params/`, `assets/norm_stats.json` y `_CHECKPOINT_METADATA`; formato concreto de los ficheros no especificado) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi05 de openpi, una línea de políticas vision-language-action para robótica. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, etc.), pero sí indica que la carga requiere la configuración `configs/pi_atlas_full_j22.py` del repositorio pi-atlas, que aporta la arquitectura del modelo y las transformaciones de datos. El checkpoint fue entrenado sobre el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73` de openpi y el commit `4468e502638fb5733f3d6732c1d34a2d2f6f530e` de pi-atlas.

El entrenamiento se realizó durante 50.000 pasos (run `atlas_full_j22_v2`) sobre el conjunto de subtareas atlas_full_j22, cuya composición exacta (número de subtareas, recuento de chunks, proporción de muestras y episodios reservados) se documenta en `subtask_summary.json`, incluido en el repositorio. Dos innovaciones destacan en el diseño: por un lado, el prompt incorpora el objetivo espacial de la subtarea en el marco de la base del robot y en metros, lo que proporciona una señal de localización explícita; por otro, se aplica modality dropout, de modo que el modelo se entrena para operar con entradas parciales. El modelo base de referencia es `lair-nyu/pi05_full_j22-step49999`.

## Capacidades

- Control robótico de manipulación guiado por instrucciones en lenguaje natural.
- Condicionamiento espacial explícito mediante coordenadas 3D del objetivo en el marco de la base del robot (metros).
- Robustez ante entradas parciales gracias al modality dropout (permite prescindir de la modalidad textual o de las coordenadas).
- Ejecución de subtareas manipulativas definidas en el conjunto atlas_full_j22 (por ejemplo, abrir un frigorífico).
- Integración con el ecosistema openpi y pi-atlas para carga y despliegue de políticas.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica con objetivo espacial: el modelo recibe una instrucción como «open the fridge {0.62 -0.18 1.04}» y genera acciones para alcanzar el punto indicado, aprovechando el condicionamiento en coordenadas para tareas de precisión.
- Investigación en políticas VLA: sirve como checkpoint de referencia para comparar variantes de pi05 con y sin condicionamiento espacial en el prompt, usando como línea base `pi05_full_j22-step49999`.
- Evaluación de robustez ante entradas incompletas: el modality dropout permite estudiar el comportamiento del modelo cuando se omite la instrucción textual o las coordenadas, un escenario relevante en entornos reales con sensores ruidosos.
- Reproducción de experimentos: al incluir `subtask_summary.json` con la composición de subtareas y los episodios reservados, facilita la replicación de resultados sobre el conjunto atlas_full_j22.
- Ajuste fino posterior: al conservar los pesos y las estadísticas de normalización, puede servir como punto de partida para entrenar políticas en tareas manipulativas adicionales dentro del ecosistema pi-atlas.
- Despliegue en pipelines de investigación robótica: la integración mediante `policy_config.create_trained_policy` permite cargar la política en un checkout de pi-atlas para experimentos de control en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 12,4 GB, pero incluye pesos y assets; no se especifica el número de parámetros ni los requisitos de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la librería `openpi` con la configuración de entrenamiento de pi-atlas (`policy_config.create_trained_policy` y `registry.get_config("pi_atlas_full_j22")`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi_atlas_full_j22-step49999 | no disponible | no disponible | no disponible | no disponible | Hugging Face (lair-nyu) |
| pi05_full_j22-step49999 (línea base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (lair-nyu) |
| Otros modelos VLA de openpi | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card identifica explícitamente `lair-nyu/pi05_full_j22-step49999` como línea base, pero no proporciona datos comparativos de rendimiento entre ambos. No se dispone de información suficiente para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no puede confirmarse el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados ni la composición lingüística del entrenamiento.
- El modelo está especializado en las subtareas de atlas_full_j22; su generalización a otras tareas o entornos no está garantizada.
- El condicionamiento espacial depende de coordenadas expresadas en el marco de la base del robot y en metros; errores en la calibración o en la transformación de coordenadas degradarán el rendimiento.
- El checkpoint se entrenó con un commit marcado como «dirty» en pi-atlas; la model card aclara que la marca proviene de ediciones posteriores no relacionadas (umbral de contradicción del gripper para un reentrenamiento futuro), pero conviene verificar la reproducibilidad exacta.
- No se incluye el estado del optimizador (`train_state/`), por lo que no es posible reanudar el entrenamiento desde este checkpoint sin reconstruirlo.
- La carga requiere un checkout de pi-atlas y la configuración de entrenamiento correspondiente; no es un modelo autónomo cargable con librerías estándar de transformers.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi_atlas_full_j22-step49999
- Modelo base de referencia: https://huggingface.co/lair-nyu/pi05_full_j22-step49999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- openpi (commit de entrenamiento): https://github.com/Physical-Intelligence/openpi
