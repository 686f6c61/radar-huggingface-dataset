# lair-nyu/pi05_baseline_j22_lift-step39999

## Resumen

`pi05_baseline_j22_lift-step39999` es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el grupo `lair-nyu`, correspondiente al paso final (39999) del entrenamiento `baseline_j22_lift_v1`. Se basa en la arquitectura pi05 (familia openpi) y está entrenado sobre el denominado "YOR baseline dataset" con articulaciones de 22 dimensiones, para una tarea concreta de manipulación: levantar un objeto ("lift") hacia un objetivo de altura absoluta. No es un modelo de lenguaje generalista, sino un artefacto de investigación orientado a control robótico, publicado principalmente para reproducibilidad de experimentos.

El repositorio incluye únicamente los pesos del modelo (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y los metadatos del checkpoint (`_CHECKPOINT_METADATA`); el estado del optimizador (`train_state/`) se ha eliminado, por lo que no sirve para reanudar el entrenamiento. La carga requiere el config de entrenamiento de pi-atlas (`configs/pi05_baseline_j22_lift.py`), que aporta la arquitectura del modelo y las transformaciones de datos, además de la librería openpi.

Su relevancia es acotada: se trata de un checkpoint de una sola tarea y un solo dataset, sin métricas publicadas, sin licencia declarada y sin descargas. Resulta útil como referencia para quien reproduzca el pipeline pi-atlas/openpi o quiera inspeccionar el resultado de un entrenamiento baseline, pero no como modelo de propósito general ni como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (familia openpi), política vision-language-action; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` (formato nativo de openpi; no se especifica safetensors ni GGUF) |

Datos adicionales del repositorio: tamaño total de 12,4 GB, biblioteca `openpi`, pipeline `robotics`, tarea `lift` con articulaciones de 22 dimensiones, checkpoint en el paso 39999.

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi05 del ecosistema openpi, una línea de políticas robóticas que combinan percepción visual y lenguaje con acciones motoras (VLA). El autor no detalla en la model card la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o esquema de difusión/flujo de acciones), por lo que estos datos deben considerarse no disponibles. La configuración que define la arquitectura y las transformaciones de datos vive en el repositorio externo pi-atlas, en el fichero `configs/pi05_baseline_j22_lift.py` (commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`), sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)`.

El entrenamiento se realizó sobre el "YOR baseline dataset" con representación de articulaciones de 22 dimensiones y una tarea de lift con objetivo de altura absoluta. El repositorio incluye `subtask_summary.json`, que documenta las subtareas de entrenamiento, el número de chunks, la proporción de muestras y los episodios reservados (held-out). No se especifican el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias; en robótica estos esquemas no son habituales y no hay evidencia en la información proporcionada.

## Capacidades

- Control robótico de manipulación: genera acciones de 22 dimensiones para ejecutar la tarea de lift sobre un objetivo de altura absoluta.
- Política condicionada por observación visual e instrucción (VLA), según la familia pi05; el detalle exacto de las entradas no se documenta en la model card.
- Ejecución de una única tarea especializada; no es un modelo multitarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje).
- No se documentan modos especiales (thinking, visión general, audio).

## Casos de uso

- Reproducción de experimentos: cargar el checkpoint con pi-atlas y openpi para verificar los resultados del run `baseline_j22_lift_v1` en el paso 39999.
- Línea base comparativa: usar este checkpoint como referencia de "baseline" frente a variantes posteriores del mismo pipeline sobre el dataset YOR.
- Evaluación de políticas de lift en simulación: ejecutar la política sobre los episodios held-out listados en `subtask_summary.json` para medir éxito en la tarea de altura absoluta.
- Estudio de normalización de acciones: inspeccionar `assets/norm_stats.json` para analizar la distribución de las 22 dimensiones articulares del dataset de entrenamiento.
- Desarrollo de infraestructura de despliegue: integrar el checkpoint en un pipeline de inferencia openpi para probar latencias y formatos de entrada/salida antes de entrenar un modelo propio.
- Docencia e investigación en VLA: emplear el par pi-atlas + openpi con este checkpoint como ejemplo mínimo de entrenamiento de una política robótica de una sola tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,4 GB en disco, lo que da una cota inferior aproximada del tamaño de los pesos en su formato original (sin contar overhead de activaciones).
- GPU recomendadas: no disponible. Por tamaño de pesos, una GPU con 16-24 GB de VRAM (RTX 4090, A5000, L4) sería el mínimo razonable para cargar los pesos sin cuantizar, pero el autor no lo confirma.
- Cabe en GPU de consumo: probablemente sí en modelos con 24 GB o más, sujeto a verificación; no confirmado por el autor.
- Opciones de despliegue: la vía documentada es openpi junto con el config de pi-atlas (`policy_config.create_trained_policy`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_baseline_j22_lift-step39999 | no disponible | no disponible | Lift, 22-dim joints | no disponible | Hugging Face (0 descargas) |
| Otros checkpoints pi05 de openpi | no disponible | no disponible | Manipulación robótica | según openpi | no disponible en la información proporcionada |
| Políticas VLA alternativas (p. ej. RT-2, OpenVLA) | no disponible | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea de lift sobre el dataset YOR; no generaliza a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; es necesario contactar con el autor antes de cualquier uso productivo.
- Sin métricas publicadas: no hay evidencia de tasa de éxito, robustez ni generalización más allá de la referencia a episodios held-out en `subtask_summary.json`.
- Reproducibilidad dependiente de dependencias externas: la carga exige el config de pi-atlas en un commit concreto y openpi en un commit marcado como "dirty", lo que puede dificultar la reproducción exacta.
- Checkpoint sin estado de optimizador: no permite reanudar el entrenamiento, solo inferencia o fine-tuning desde cero del estado del optimizador.
- Riesgo de alucinación: no aplica en el sentido de lenguaje generativo, pero sí existe riesgo de acciones erróneas o inseguras en el robot; requiere supervisión y límites de seguridad en el entorno físico.
- Sesgos: no documentados; dependen del dataset YOR, no descrito en detalle.
- Idiomas y contexto: no aplicables o no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_baseline_j22_lift-step39999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- Config de entrenamiento: `configs/pi05_baseline_j22_lift.py` (commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`) en el repositorio pi-atlas
- openpi (commit de referencia `c5efff14d4ea36a09a0b365cd0dc60a527027b73`): no se proporciona URL en la información disponible
