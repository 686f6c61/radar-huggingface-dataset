# chiffonng/incidentbench-summary_control

## Resumen

`incidentbench-summary_control` es un adaptador LoRA de rango 16 entrenado por el usuario de Hugging Face chiffonng sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo independiente, sino un artefacto de investigación que forma parte del proyecto IncidentBench, un banco de pruebas para la clasificación conjunta de incidentes en siete dominios de riesgo definidos por el MIT (o la etiqueta `No incident (potential only)`). El adaptador responde a una pregunta experimental concreta: aislar el efecto del resumen (summary) en la tarea de clasificación, usando las mismas filas que la variante `summary_target` pero con una respuesta estándar.

La relevancia de este adaptador es metodológica más que práctica. Permite a los investigadores comparar el rendimiento del modelo con y sin información de resumen en el prompt, manteniendo constantes el resto de variables. Las etiquetas de entrenamiento son generadas por el propio modelo ("silver") siguiendo la guía de anotación del proyecto, no anotaciones humanas gold, lo que limita su validez para aplicaciones reales. El autor lo describe explícitamente como un artefacto de investigación y advierte de que no debe usarse para tomar decisiones sobre sistemas reales.

El adaptador se aplica sin fusionar sobre el modelo base y se sirve con vLLM habilitando LoRA. El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors compatibles con la librería PEFT. La licencia es "other", sin que se especifiquen términos adicionales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El adaptador se aplica sin fusionar sobre el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto IncidentBench. La tarea es una clasificación conjunta: el modelo emite una única respuesta entre siete dominios de riesgo del MIT o la etiqueta `No incident (potential only)`, y tanto la detección como la categoría se leen de esa misma respuesta.

El entrenamiento utiliza etiquetas generadas por modelo ("silver") bajo la guía de anotación del proyecto, no anotaciones humanas gold. El stack de entrenamiento emplea transformers 5.9.0 y peft 0.19.1. El prompt, las filas de entrenamiento y los hashes están documentados en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`. La variante `summary_control` responde a la misma pregunta que `summary_target` pero con una respuesta estándar, aislando así el efecto del resumen. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de lo indicado.

## Capacidades

- Clasificación de incidentes en siete dominios de riesgo del MIT más la categoría `No incident (potential only)`.
- Detección y categorización conjuntas a partir de una única respuesta generada.
- Clasificación condicionada por un prompt con información de resumen (variante de control del experimento).
- Decodificación greedy para inferencia reproducible.
- Servicio mediante vLLM con soporte de LoRA (`--enable-lora --max-lora-rank 16`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador.

## Casos de uso

- Investigación comparativa sobre el efecto del resumen: el adaptador sirve para medir cómo cambia la clasificación de incidentes cuando se incluye o no un resumen en el prompt, manteniendo fijas las demás variables experimentales.
- Reproducción de resultados de IncidentBench: permite replicar la ejecución reportada en el informe del proyecto con el prompt de la variante `orig` y decodificación greedy.
- Evaluación de clasificadores de riesgo basados en LLM: útil para estudiar el comportamiento de un modelo de 7B en tareas de clasificación multietiqueta de dominios de riesgo.
- Análisis de fallos de detección: el autor documenta que el adaptador tiende a infra-detectar incidentes ("under-calls"), lo que lo hace útil para estudiar modos de fallo en clasificadores automáticos.
- Docencia y experimentación con PEFT: ejemplo práctico de adaptador LoRA de rango 16 servido con vLLM sobre un modelo base de 7B.
- Comparación de estrategias de anotación: al usar etiquetas silver, permite analizar la brecha entre supervisión generada por modelo y anotación humana en tareas de clasificación de incidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen2.5-7B-Instruct y de la cuantización empleada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 7B requiere cuantización para caber en GPUs de consumo típicas, pero no se aportan datos concretos.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules summary_control=chiffonng/incidentbench-summary_control`, enviando el prompt de la variante `orig` y decodificación greedy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-summary_control | LoRA r=16 sobre 7B | no disponible | Clasificación de incidentes (MIT) | other | Hugging Face (13 descargas) |
| incidentbench-summary_target | LoRA sobre 7B | no disponible | Clasificación de incidentes (MIT) | no disponible | Hugging Face (variante del mismo proyecto) |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible | Generación general | no disponible | Hugging Face |

La comparación más directa es con la variante `summary_target` del mismo proyecto, que usa las mismas filas pero con una respuesta objetivo distinta, y con el modelo base sin adaptador. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor advierte explícitamente de que no debe usarse para decisiones sobre sistemas reales.
- Etiquetas silver: el entrenamiento usa etiquetas generadas por modelo, no anotaciones humanas gold, lo que introduce sesgos y errores sistemáticos.
- Infra-detección: el autor documenta que el adaptador tiende a no detectar incidentes que debería detectar ("under-calls").
- Licencia "other": no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso productivo.
- Idiomas: no se documentan los idiomas soportados por el adaptador.
- Contexto: no se especifica la longitud de contexto efectiva del adaptador, aunque hereda la del modelo base.
- Dependencia del prompt: el rendimiento depende del formato de prompt exacto (`orig`) y de la decodificación greedy; desviarse de esa configuración puede alterar los resultados.
- Sin benchmarks publicados en la información disponible: no es posible evaluar su rendimiento frente a alternativas con datos objetivos.

## Enlaces

- Hugging Face: https://huggingface.co/chiffonng/incidentbench-summary_control
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Manifiesto de datos: `data_manifest.json` (referenciado en la model card, no enlazado)
- Manifiesto de entrenamiento: `train_manifest.json` (referenciado en la model card, no enlazado)
- Informe de IncidentBench: referenciado en la model card, sin URL disponible
