# lair-nyu/pi05_handoff_subtasks-step14999

## Resumen

`pi05_handoff_subtasks-step14999` es un checkpoint de robótica entrenado con el framework openpi (familia pi0 / pi05 de Physical Intelligence) y publicado por el grupo lair-nyu. No es un modelo de lenguaje: es una política visomotora (vision-language-action, VLA) que mapea observaciones de cámara e instrucciones de tarea a acciones de control de un robot. El checkpoint corresponde al paso final (14999) del run `handoff_balanced_v1`, entrenado con la herramienta pi-atlas sobre un commit concreto de openpi.

El nombre sugiere que la política se ha entrenado para tareas de "handoff" (entrega o paso de objetos entre agentes o brazos) descompuestas en subtareas, con un reparto balanceado de muestras entre ellas (`handoff_balanced_v1`). El repositorio incluye únicamente pesos (`params/`), estadísticas de normalización (`assets/norm_stats.json`) y metadatos de checkpoint; se ha eliminado el estado del optimizador, por lo que no sirve para reanudar entrenamiento, solo para inferencia.

Es relevante para quien investigue en manipulación robótica con modelos VLA y quiera reproducir o comparar una política pi05 especializada en una tarea concreta. Su utilidad práctica está limitada al entorno y la configuración de datos exactos con que se entrenó: la carga requiere el config de pi-atlas `pi05_handoff_subtasks`, que define arquitectura y transformaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA de la familia pi05, framework openpi; detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` (formato openpi, no especificado); `assets/norm_stats.json`; `_CHECKPOINT_METADATA`; tamano del repo 12,4 GB |

## Arquitectura y entrenamiento

El checkpoint se entrena con pi-atlas (config `configs/pi05_handoff_subtasks.py`, commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`) sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)`. La arquitectura concreta la aporta ese config de pi-atlas, no el repositorio publicado; la model card no detalla capas, dimensión de embeddings, número de parámetros ni esquema de atención. Por la nomenclatura, se trata de una política de la familia pi05 de Physical Intelligence, que combina un backbone de visión-lenguaje con un cabezal de acciones, pero los datos concretos de esta instancia no están publicados.

El run se denomina `handoff_balanced_v1` y ha alcanzado el paso 14999 (paso final). El fichero `subtask_summary.json` del repositorio lista las subtareas de entrenamiento, el número de chunks, la proporción de muestras por subtarea y los episodios reservados (held-out). No se documentan en la model card el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias; en robótica VLA lo habitual es imitación supervisada sobre demostraciones, pero no hay confirmación explícita en la información disponible.

## Capacidades

- Control visomotor: genera acciones de robot a partir de observaciones de cámara e instrucción de tarea, en el esquema de políticas pi05.
- Ejecución de tareas de "handoff" descompuestas en subtareas, con reparto balanceado de muestras durante el entrenamiento.
- Carga mediante `policy_config.create_trained_policy` de openpi con el config de pi-atlas `pi05_handoff_subtasks`.
- Inferencia con estadísticas de normalización incluidas (`norm_stats.json`), necesarias para escalar observaciones y acciones.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito; es un modelo de política robótica, no un LLM de propósito general.

## Casos de uso

- Reproducción de experimentos de manipulación: cargar el checkpoint con el config de pi-atlas y evaluar la política en el mismo entorno y conjunto de tareas con que se entrenó, para validar resultados del run `handoff_balanced_v1`.
- Investigación en paso de objetos entre brazos o agentes: usar la política como referencia para tareas de handoff con subtareas balanceadas y comparar frente a políticas entrenadas con otros repartos de datos.
- Evaluación de episodios held-out: emplear `subtask_summary.json` para identificar los episodios reservados y medir la generalización de la política en esas trayectorias.
- Punto de partida para ajuste fino: aunque el estado del optimizador se ha eliminado, los pesos sirven como inicialización para nuevos entrenamientos con pi-atlas sobre tareas relacionadas.
- Análisis de descomposición en subtareas: estudiar cómo afecta el balanceo de muestras entre subtareas al comportamiento final de la política en el paso 14999.
- Despliegue en banco de pruebas robótico: integrar la política en un pipeline openpi de inferencia sobre el robot objetivo, siempre que coincida con la configuración de observaciones y acciones del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,4 GB en pesos, lo que da una cota inferior orientativa del espacio en memoria necesario para cargarlos, pero no se especifica el tamaño del modelo ni la precisión de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño real del modelo, que no se publica.
- Opciones de despliegue: inferencia mediante openpi (`policy_config.create_trained_policy`) con el config de pi-atlas `pi05_handoff_subtasks`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros checkpoints pi05 comparables ni métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia no está publicada; no se puede asumir uso comercial sin consultar al autor.
- El checkpoint solo es cargable con el config de pi-atlas `pi05_handoff_subtasks` en el commit indicado; sin él no se dispone de arquitectura ni transformaciones de datos.
- Se ha eliminado `train_state/` (estado del optimizador): no es posible reanudar el entrenamiento desde este checkpoint, solo inferencia o inicialización.
- El entrenamiento se realizó sobre un commit de openpi marcado como `(dirty)`, lo que puede introducir diferencias no reproducibles respecto al código publicado.
- Política especializada en tareas de handoff y en el entorno de entrenamiento; no se documenta su generalización a otros robots, cámaras o tareas.
- No hay información sobre sesgos, tasas de alucinación (no aplica en el sentido de LLM, pero sí riesgo de acciones erróneas), idiomas ni robustez en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_handoff_subtasks-step14999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- openpi (framework base): no se incluye enlace en la información proporcionada; el commit referenciado es `c5efff14d4ea36a09a0b365cd0dc60a527027b73`.
