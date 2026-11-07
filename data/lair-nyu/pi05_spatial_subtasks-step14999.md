# lair-nyu/pi05_spatial_subtasks-step14999

## Resumen

pi05_spatial_subtasks-step14999 es un checkpoint de política robótica (vision-language-action, VLA) publicado por el laboratorio LAIR de la Universidad de Nueva York (lair-nyu) en Hugging Face. Se trata de un fine-tuning del modelo base pi05 (familia π0/π0.5 de Physical Intelligence) entrenado con la librería openpi y con la herramienta de entrenamiento pi-atlas. El checkpoint corresponde al paso 14.999 de un entrenamiento de 15.000 pasos sobre una configuración denominada `spatial_balanced_v1`.

El modelo está diseñado para control robótico guiado por instrucciones en lenguaje natural en las que se incluye, además de la subtarea, su objetivo espacial expresado en el marco de referencia de la base del robot y en metros. El muestreo del dataset está balanceado por habilidad, grupo y episodio, lo que busca evitar que las subtareas o episodios sobrerrepresentados dominen el aprendizaje.

Es relevante ahora porque forma parte del ecosistema abierto de VLA robóticos (openpi, pi05) y porque publica únicamente los pesos, las estadísticas de normalización y los metadatos de entrenamiento, sin el estado del optimizador. Su uso requiere la configuración de entrenamiento de pi-atlas para reconstruir la arquitectura y las transformaciones de datos, lo que limita su adopción a entornos que reproduzcan ese stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA) basada en pi05, no disponible en detalle |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors dentro de `params/` (repo de 12,4 GB); incluye `assets/` con `norm_stats.json` y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El modelo es un checkpoint de la familia pi05, un modelo visión-lenguaje-acción que combina un backbone de visión y lenguaje con una cabeza de acciones para generar comandos motores a partir de observaciones e instrucciones. La model card no detalla la arquitectura interna (número de parámetros, tipo de transformer, mecanismo de atención o decodificación de acciones), por lo que esos datos no están disponibles.

El entrenamiento se realizó con la configuración `configs/pi05_spatial_subtasks.py` de pi-atlas (commit `4556d3d8777cdb01caf07eb91705f3e0d733a652`) sobre el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)` de openpi. Se ejecutaron 15.000 pasos con muestreo balanceado por habilidad, grupo y episodio (`spatial_balanced_v1`). Las instrucciones incluyen la subtarea junto con su objetivo espacial en el marco de la base del robot, en metros. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El repositorio incluye `subtask_summary.json` con las subtareas, recuentos de chunks, proporciones de muestreo y episodios reservados (held-out).

## Capacidades

- Control robótico guiado por lenguaje: genera acciones a partir de instrucciones que combinan una subtarea y un objetivo espacial en coordenadas de la base del robot.
- Razonamiento espacial explícito: el prompt incorpora la posición objetivo en metros, lo que permite condicionar la política a metas geométricas concretas.
- Ejecución de subtareas descompuestas: el entrenamiento se organiza por subtareas, habilidades y grupos, lo que sugiere soporte para flujos de trabajo por etapas.
- Procesamiento de observaciones visuales: al ser un modelo VLA, consume imágenes del entorno además del texto.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni thinking mode.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación robótica con metas espaciales: el modelo recibe la subtarea y la posición objetivo en el marco de la base del robot, lo que permite dirigir el efector a coordenadas concretas en tareas de pick-and-place.
- Descomposición de tareas de largo horizonte: al estar entrenado por subtareas balanceadas, puede emplearse como política de bajo nivel dentro de un planificador que emita subtareas sucesivas con sus metas espaciales.
- Investigación en VLA: sirve como checkpoint de referencia para comparar estrategias de muestreo balanceado (`spatial_balanced_v1`) frente a otras configuraciones del mismo autor.
- Evaluación con episodios reservados: el `subtask_summary.json` incluye episodios held-out, lo que facilita la validación reproducible en entornos simulados o reales.
- Reproducción de experimentos: al publicar la configuración y los commits exactos de pi-atlas y openpi, permite replicar el entrenamiento y el ajuste fino sobre nuevos datasets.
- Integración en pipelines de openpi: puede cargarse mediante `policy_config.create_trained_policy` desde un checkout de pi-atlas para desplegar la política en un robot compatible con el stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo de pesos ocupa 12,4 GB, lo que da una cota inferior aproximada del tamaño de los parámetros en precisión de entrenamiento, pero no se especifica el tamaño del modelo ni la cuantización.
- GPU recomendadas: no disponible. Por el tamaño del repo, es probable que requiera GPU con al menos 16-24 GB de VRAM en precisión reducida, pero este dato no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada; no disponible.
- Opciones de despliegue: openpi con la configuración de pi-atlas (`policy_config.create_trained_policy`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| pi05_spatial_subtasks-step14999 | no disponible | no disponible | no disponible | Fine-tuning de pi05 con metas espaciales y muestreo balanceado |
| lair-nyu/pi05_sanity_subtasks-step14999 | no disponible | no disponible | no disponible | Mismo autor y stack; pérdida final de entrenamiento 0,0014; config `pi05_sanity_subtasks` |
| pi05 base (openpi) | no disponible | no disponible | no disponible | Modelo base sobre el que se ajusta este checkpoint |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial.
- Requiere la configuración de entrenamiento de pi-atlas para cargarse; no es autónomo con openpi estándar.
- El checkpoint no incluye el estado del optimizador (`train_state/`), por lo que no permite reanudar el entrenamiento tal cual.
- El commit de openpi figura como `dirty`, lo que puede dificultar la reproducibilidad exacta.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma.
- Al ser una política robótica, su validez está acotada al dominio, la morfología del robot y la distribución de subtareas del entrenamiento; el rendimiento fuera de ese dominio no está caracterizado.
- No hay datos publicados de benchmarks ni de latencia, lo que impide evaluar su idoneidad en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lair-nyu/pi05_spatial_subtasks-step14999
- Organización LAIR NYU: https://huggingface.co/lair-nyu/models
- Checkpoint relacionado: https://huggingface.co/lair-nyu/pi05_sanity_subtasks-step14999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- openpi (commit referenciado): `c5efff14d4ea36a09a0b365cd0dc60a527027b73`
