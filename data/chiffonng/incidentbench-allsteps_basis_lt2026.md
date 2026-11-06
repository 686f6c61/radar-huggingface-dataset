# chiffonng/incidentbench-allsteps_basis_lt2026

## Resumen

`incidentbench-allsteps_basis_lt2026` es un adaptador LoRA de rango 16 sobre el modelo base Qwen2.5-7B-Instruct, publicado por el usuario chiffonng en Hugging Face. No es un modelo de propósito general, sino un artefacto de investigación orientado a una tarea concreta: la clasificación conjunta de incidentes en el marco del proyecto IncidentBench, donde el modelo debe emitir una única respuesta que indique si hubo incidente y, en su caso, a cuál de los siete dominios de riesgo de MIT pertenece. La detección y la categorización se derivan de esa misma respuesta única.

El adaptador se ha entrenado para la variante `allsteps_basis_lt2026`, que presenta al modelo todos los pasos registrados de un caso, incluido el incidente, con un corte temporal anterior a 2026. Esto permite que la justificación de la clasificación se apoye en el contenido del propio prompt. Las etiquetas de entrenamiento son generadas por modelos ("silver") siguiendo la guía de anotación del proyecto, no anotaciones humanas gold, lo que condiciona la fiabilidad de sus salidas.

Se trata, por tanto, de un artefacto de investigación con un alcance muy delimitado: el propio autor advierte que no debe usarse para tomar decisiones sobre sistemas reales y que presenta modos de fallo conocidos, en particular una tendencia a infravalorar la presencia de incidentes. Su interés radica en documentar y reproducir un brazo concreto de un benchmark de evaluación, no en ofrecer capacidades generales de razonamiento o generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 7B; el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se sirve sin fusionar sobre el base; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea PEFT con rango 16 sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El adaptador se aplica sin fusionar sobre el modelo base, tal como se hizo en todas las ejecuciones reportadas del proyecto. La pila de entrenamiento declarada es transformers 5.9.0 y peft 0.19.1.

El entrenamiento se realizó sobre la variante `allsteps_basis_lt2026`, en la que cada caso se presenta con todos los pasos registrados, incluido el incidente, y con un corte temporal anterior a 2026, de modo que la justificación puede fundamentarse en el prompt. Las etiquetas son generadas por modelos ("silver") bajo la guía de anotación del proyecto, no anotaciones humanas. El prompt, las filas de entrenamiento y los hashes están documentados en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`. La decodificación recomendada es greedy.

## Capacidades

- Clasificación conjunta de incidentes: emite una única respuesta que combina la detección del incidente y su categoría entre siete dominios de riesgo de MIT, o bien la etiqueta `No incident (potential only)`.
- Justificación basada en el prompt: al mostrarse todos los pasos del caso, la respuesta puede apoyarse en la evidencia incluida en la entrada.
- Formato de salida restringido: una sola respuesta por caso, sin razonamiento multi-turno ni tool calling.
- No dispone de capacidades generales de generación, código, matemáticas, visión o audio más allá de las heredadas del modelo base, que no se han evaluado en este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No soporta agentes ni razonamiento multi-paso más allá de la lectura del prompt completo.

## Casos de uso

- Reproducción de experimentos de IncidentBench: el adaptador permite replicar el brazo `allsteps_basis_lt2026` con decodificación greedy y el prompt definido en `train/build_data.py`, transformación `allsteps_basis`, para comparar resultados con otros brazos del benchmark.
- Evaluación de clasificadores de riesgo: sirve como línea base para medir la capacidad de un modelo de 7B de identificar y categorizar incidentes a partir de trazas completas de un caso.
- Estudio de etiquetas "silver": al haberse entrenado con etiquetas generadas por modelos, es útil para analizar el impacto de la calidad de las anotaciones en el rendimiento de clasificadores especializados.
- Análisis de modos de fallo: el propio autor documenta que el adaptador infravalora los incidentes, lo que lo hace adecuado para estudiar sesgos de detección en sistemas de clasificación de riesgos.
- Docencia e investigación metodológica: permite ilustrar el flujo completo de adaptación LoRA con PEFT, despliegue con vLLM y evaluación sobre un benchmark concreto.
- Pruebas de infraestructura de servir adaptadores: útil para validar configuraciones de vLLM con `--enable-lora --max-lora-rank 16` y múltiples adaptadores sobre un mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para consultar las puntuaciones y los modos de fallo conocidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del despliegue del base Qwen2.5-7B-Instruct (el adaptador añade una sobrecarga mínima, con un repositorio de 0,2 GB).
- GPU recomendadas: no disponibles en la información proporcionada; para un base de 7B en precisión completa se requieren GPUs de centro de datos (A100, H100) y en cuantización puede caber en GPUs de consumo, pero no se aportan datos concretos.
- Despliegue: vLLM con soporte LoRA, mediante `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules allsteps_basis_lt2026=chiffonng/incidentbench-allsteps_basis_lt2026`, enviando el prompt del brazo y decodificación greedy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros adaptadores o modelos comparables del proyecto IncidentBench, ni resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver": generadas por modelos, no por anotadores humanos, lo que introduce ruido y sesgos en el comportamiento aprendido.
- Infravaloración de incidentes: el autor documenta explícitamente que el adaptador tiende a no declarar incidentes cuando existen.
- Artefacto de investigación: el autor advierte que no debe usarse para tomar decisiones sobre sistemas reales.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere consultar las condiciones del autor.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento adecuado fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no documentada en la ficha: depende del modelo base y del formato del prompt del brazo.
- Formato de entrada y salida muy restringido: requiere el prompt exacto de la transformación `allsteps_basis` y decodificación greedy para reproducir los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chiffonng/incidentbench-allsteps_basis_lt2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del proyecto IncidentBench: no disponible en la informacion proporcionada
- Informe de IncidentBench: no disponible en la informacion proporcionada
- Paper: no disponible en la informacion proporcionada
