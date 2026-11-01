# chiffonng/incidentbench-stage_ordinal_lt2026

## Resumen

`incidentbench-stage_ordinal_lt2026` es un adaptador LoRA de rango 16 entrenado sobre `Qwen/Qwen2.5-7B-Instruct` por el usuario `chiffonng` como parte del proyecto IncidentBench. No es un modelo de propósito general, sino un artefacto de investigación: un clasificador conjunto que debe devolver una única respuesta entre siete dominios de riesgo MIT o la etiqueta `No incident (potential only)`, de la que se derivan tanto la detección de incidente como su categoría.

Este brazo concreto del experimento responde a una pregunta metodológica muy específica: si se añade un campo ordinal de etapa del incidente (`no_event < potential < near_miss < disputed < alleged < incident`, más dos valores fuera de escala) antes de la clase, ¿mejora o empeora la detección y la categorización? El adaptador se ha entrenado con etiquetas generadas por modelo ("silver") bajo la guía de anotación del proyecto, no con anotaciones humanas gold.

El modelo es relevante únicamente en el contexto de evaluación de clasificadores de incidentes y de investigación sobre anotación automática. El propio autor advierte que es un artefacto de investigación con fallos conocidos (subestima incidentes) y que no debe usarse para tomar decisiones sobre sistemas reales. El repositorio ocupa 0,2 GB y contiene solo los pesos del adaptador, que se aplican sin fusionar sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre `Qwen2.5-7B-Instruct`, un transformer decoder-only de 7 mil millones de parámetros. El adaptador se aplica sin fusionar sobre el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto. La librería declarada es `peft`, y el stack de entrenamiento empleado fue `transformers 5.9.0` y `peft 0.19.1`.

La tarea de entrenamiento es una clasificación conjunta: el modelo debe producir una sola respuesta que contenga un campo ordinal de etapa del incidente seguido de la clase, entre siete dominios de riesgo MIT o `No incident (potential only)`. La detección y la categoría se leen de esa única respuesta. Las etiquetas de entrenamiento son "silver", generadas por modelo bajo la guía de anotación del proyecto, no anotaciones humanas gold. El prompt de evaluación corresponde a la transformación `nonamed_stage` de `train/build_data.py` y la decodificación es greedy. Los detalles de formato de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`.

## Capacidades

- Clasificación de incidentes en siete dominios de riesgo MIT más la categoría `No incident (potential only)`.
- Emisión de un campo ordinal de etapa del incidente (`no_event`, `potential`, `near_miss`, `disputed`, `alleged`, `incident`, más dos valores fuera de escala).
- Detección y categorización derivadas de una única respuesta generada.
- Decodificación greedy para inferencia determinista.
- Despliegue como adaptador LoRA servido con vLLM sobre el modelo base.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre clasificación de incidentes: el adaptador sirve para medir si un campo ordinal de etapa mejora o empeora la detección y la categoría frente a otros brazos del experimento IncidentBench.
- Evaluación de anotación "silver": permite estudiar cómo se comporta un clasificador entrenado con etiquetas generadas por modelo en lugar de anotaciones humanas.
- Reproducción de experimentos: junto con `data_manifest.json` y `train_manifest.json`, permite replicar la ejecución con el prompt `nonamed_stage` y decodificación greedy.
- Análisis de fallos de clasificación: el autor documenta que el modelo subestima incidentes, lo que lo hace útil como caso de estudio de sesgos de etiquetado.
- Comparación de brazos del proyecto: sirve como referencia frente a otras variantes de IncidentBench que no incluyen el campo ordinal.
- Despliegue de referencia con vLLM: el comando de servicio con `--enable-lora --max-lora-rank 16` sirve como plantilla para servir adaptadores LoRA de clasificación en pipelines de evaluación.
- No es adecuado para decisiones sobre sistemas reales, según la advertencia explícita del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados y modos de fallo conocidos al informe de IncidentBench, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al aplicarse sobre un base de 7B, los requisitos serán los del modelo base más el adaptador (0,2 GB de repositorio), pero no se declaran cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM con soporte LoRA, mediante `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules stage_ordinal_lt2026=chiffonng/incidentbench-stage_ordinal_lt2026`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-stage_ordinal_lt2026 | LoRA r=16 sobre 7B | no disponible | Clasificación de incidentes (7 dominios MIT) | other | HuggingFace, 10 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo instructivo general | no disponible en esta ficha | HuggingFace (modelo base) |
| Otros brazos de IncidentBench | no disponible | no disponible | Clasificación de incidentes | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no debe usarse para decisiones sobre sistemas reales.
- Etiquetas "silver": el entrenamiento usa etiquetas generadas por modelo bajo la guía de anotación, no anotaciones humanas gold.
- Fallo conocido: el modelo subestima incidentes (under-calls incidents), según el informe de IncidentBench.
- Licencia "other": no se detallan los términos de uso comercial en la información disponible; es necesario consultar el repositorio para conocer las restricciones.
- Idiomas soportados no declarados en la model card.
- Longitud de contexto no declarada en la model card.
- El adaptador debe aplicarse sin fusionar sobre el modelo base; las ejecuciones reportadas usan esa configuración.
- Solo 10 descargas y 0 likes: sin validación comunitaria significativa.
- Requiere el prompt de evaluación exacto (`nonamed_stage`) y decodificación greedy para reproducir los resultados reportados.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-stage_ordinal_lt2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de IncidentBench: no disponible como enlace en la información proporcionada
- Repositorio del proyecto (referenciado como `train/build_data.py`): no disponible como enlace en la información proporcionada
