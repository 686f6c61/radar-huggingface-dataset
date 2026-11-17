# HlibPlakhtii/microduck-tug-cup-nov17-v4

## Resumen

microduck-tug-cup-nov17-v4 es una política de control para robótica (pipeline `robotics`, librería `microduck`) publicada por HlibPlakhtii. No se trata de un modelo de lenguaje: es una composición de políticas entrenadas para el entorno de simulación Microduck Arena, concretamente para una tarea de arrastre de un objeto ("tug cup") con dos patos simulados y una cuerda. El repositorio no contiene pesos de red nuevos, sino una combinación de trayectorias y controladores heredados de modelos previos.

El modelo se presenta como un merge de `HlibPlakhtii/microduck-tug-cup-nov17-v3` y `jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b`. Según la model card, la composición eleva la puntuación local de 168,89963030815125 cm a 168,9017128944397 cm, con cinco victorias en "pit". El controlador general es idéntico byte a byte a cup-nov17-v3 y combina un controlador primario derivado de "lg21" con un alternativo derivado de "Titan" usando observaciones de velocidad angular, velocidad articular y gravedad proyectada.

La relevancia es acotada: se trata de un artefacto de investigación en simulación para un benchmark concreto de robótica, sin pesos de red nuevos ni licencia declarada. El tamaño del repositorio es de 0,0 GB y no hay descargas ni likes en el momento de la consulta. La model card incide en que la verificación realizada son comprobaciones de paridad, no una victoria de torneo reclamada, y que la clasificación oficial del servidor es la autoritativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica (composición de controladores; no es un transformer ni un LLM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible (la model card indica que no se afirma una licencia nueva o global sobre contribuciones heredadas) |
| Formato de pesos | ONNX (tag `onnx`); repositorio de 0,0 GB con artefactos de verificación (`rating-replay.npz`, JSONs de verificación) |

## Arquitectura y entrenamiento

La arquitectura no es una red neuronal de lenguaje. Según la model card, el controlador general es byte-idéntico a cup-nov17-v3 y combina un controlador primario derivado de "lg21" con un controlador alternativo derivado de "Titan". La mezcla se realiza usando observaciones de velocidad angular ordinaria, velocidad articular y gravedad proyectada. El modelo se distribuye en formato ONNX y se ejecuta mediante la librería `microduck`.

No se han entrenado pesos de red nuevos. La operación realizada es una composición atribuida ("attributed composition") que combina la trayectoria seed3 de jrubiosainz y las semillas retenidas 1, 2 y 5 con la trayectoria seed4 de cup-nov17-v2 de HlibPlakhtii. La model card indica que se conservan URLs fijadas, hashes, comparaciones por semilla y autoría en `source.json`, `rating-composition-verification.json` y `rating-upstream/`. La verificación con el runner nativo (runner5) reprodujo ambos patos y la cuerda exactamente en las cinco rondas de rating, y el overlay de rating reprodujo el controlador general sin cambios en 16 rondas independientes contra la política recién publicada de jrubiosainz. El autor califica explícitamente estas pruebas como comprobaciones de paridad, no como una victoria de torneo.

## Capacidades

- Control de una política de arrastre ("tug") para dos patos simulados y una cuerda en el entorno Microduck Arena.
- Mezcla de dos controladores (primario tipo lg21 y alternativo tipo Titan) mediante observaciones de velocidad angular, velocidad articular y gravedad proyectada.
- Ejecución en formato ONNX a través de la librería `microduck`.
- Reproducción determinista de trayectorias y verificación de paridad frente a políticas de referencia.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No dispone de tool calling, function calling ni soporte de agentes multi-paso.
- No dispone de modo de razonamiento ("thinking mode") ni de otras capacidades cognitivas.

## Casos de uso

- Investigación en benchmarks de robótica simulada: sirve como entrada reproducible para el entorno Microduck Arena, permitiendo comparar políticas de arrastre bajo las mismas condiciones de simulación.
- Reproducción de experimentos: los artefactos `rating-replay.npz`, `source.json` y `rating-composition-verification.json` permiten replicar las rondas de rating y auditar la composición de trayectorias.
- Auditoría de autoría y atribución: los ficheros `generic-upstream/` y `RATING_NOTICE` documentan los modelos fuente, autores y avisos heredados, útiles para estudios de procedencia en merges de políticas.
- Composición de políticas heredadas: el script `compose_tug_rating.py` documenta cómo se combinan trayectorias de distintos autores, útil como referencia metodológica para merges de controladores.
- Exportación a ONNX para despliegue en simulación: `export_tug_switch.py` permite generar el artefacto ONNX que consume la librería `microduck` en un pipeline de evaluación.
- Verificación de paridad de controladores: el controlador general byte-idéntico permite comprobar que una nueva política no altera el comportamiento base en 16 rondas independientes, como caso de test de regresión en robótica simulada.
- Docencia en robótica simulada: ejemplo práctico de mezcla de controladores con observaciones físicas (velocidad angular, velocidad articular, gravedad proyectada) en un entorno controlado.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a este tipo de artefacto. Los únicos datos numéricos publicados son los de la propia composición:

| Metrica | Valor |
|---|---|
| Puntuación local previa (referencia) | 168,89963030815125 cm |
| Puntuación local tras la composición | 168,9017128944397 cm |
| Victorias en "pit" | 5 |
| Rondas de rating reproducidas con runner5 | 5 (paridad exacta de ambos patos y la cuerda) |
| Rondas independientes del overlay de rating | 16 (paridad exacta del controlador general) |

El autor indica que la clasificación oficial del servidor y el resultado de la Cup son autoritativos, y que estas cifras no constituyen una victoria de torneo reclamada. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y no se especifican pesos de red, por lo que no se puede estimar un requisito de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al no haber pesos de red publicados, no se puede determinar.
- Opciones de despliegue: ejecución mediante la librería `microduck` con artefactos ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup-nov17-v4 | Política de control (composición) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| HlibPlakhtii/microduck-tug-cup-nov17-v3 | Política de control (modelo base) | no disponible | no aplica | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b | Política de control (modelo base) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de las cifras de rating local citadas en la model card. No se identifican en la información proporcionada otras alternativas de la misma categoría fuera de los modelos base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos para este tipo de artefacto.
- Riesgo de alucinación: no aplica en el sentido de LLM; el riesgo relevante es que la política no generalice fuera del entorno Microduck Arena para el que fue compuesta.
- Limitaciones de contexto o idioma: no aplica; no es un modelo de lenguaje.
- Restricciones de licencia: la licencia no está disponible y la model card indica explícitamente que no se afirma una licencia nueva o global sobre las contribuciones heredadas; los ámbitos de aviso heredados se conservan en `RATING_NOTICE`. El uso comercial queda sin garantías legales claras.
- La model card subraya que las verificaciones realizadas son comprobaciones de paridad, no una victoria de torneo, y que la clasificación oficial del servidor es la autoritativa.
- Solo simulación: no se ha validado en hardware físico ni fuera del entorno Microduck Arena.
- No se han entrenado pesos de red nuevos; el artefacto es una composición de trayectorias y controladores existentes, por lo que su valor depende de la reproducibilidad de los artefactos de verificación incluidos.
- El repositorio tiene 0,0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar completamente disponibles o que el modelo es de muy reciente publicación.

## Enlaces

- Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v4
- Modelo base 1: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v3
- Modelo base 2: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b
- Repositorio y artefactos de verificación citados en la model card: `source.json`, `rating-composition-verification.json`, `rating-upstream/`, `local-verification.json`, `cup-validation/`, `generic-upstream/`, `RATING_NOTICE`, `compose_tug_rating.py`, `prepare_tug_cup_entry.py`, `export_tug_switch.py`, `rating-replay.npz` (todos dentro del repositorio de Hugging Face)
- Microduck y Arena (Pollen Robotics): no se proporciona URL directa en la información disponible
