# humanoid-benchmark/deltaflow

## Resumen

Delta Flow es un conjunto de checkpoints de política robótica para cuerpo completo (whole-body policy) publicado por el perfil `humanoid-benchmark` en Hugging Face. Se enmarca dentro del Humanoid Benchmark y se distribuye con la misma estructura de directorios que otros modelos del mismo perfil (`humanoid-benchmark/groot` y `humanoid-benchmark/pi05`), lo que sugiere que está pensado como una entrada más de una comparativa estandarizada de políticas de imitación para robots humanoides. La model card lo describe como "ImageWAM / HumanWAM whole-body delta-flow policy", lo que apunta a un enfoque de flow matching aplicado a acciones (delta-flow) sobre observaciones visuales y propioceptivas.

El repositorio ocupa 81,3 GB y contiene checkpoints organizados por tarea y época (`<task-dir>/epoch-XXX/`), con carpetas para tareas concretas como `b6-pedal-bin`, `a3-fridge-open`, `a7-cabinet-close`, `a18-pour-water`, `a10-trolley-push`, `a20-basket-transfer` y `a17-unscrew-bottle`. La model card indica que la ronda de entrenamiento de benchmark de Delta Flow está programada y que las carpetas de tareas irán apareciendo a medida que finalicen las ejecuciones, por lo que el contenido puede estar incompleto en el momento de la consulta.

La relevancia actual del modelo reside en su encaje en un protocolo de benchmark común para políticas humanoides, lo que facilita la comparación directa con otras aproximaciones (por ejemplo, `groot` o `pi05`) bajo las mismas tareas y métricas. No obstante, la información pública disponible es muy limitada: no se detallan parámetros, contexto, licencia ni idiomas, y el autor advierte explícitamente que la carpeta `legacy/` contiene experimentos antiguos que no siguen el protocolo de benchmark y no deben usarse como baseline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona "whole-body delta-flow policy", sin detalle de backbone) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 81,3 GB con checkpoints por tarea y época; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

La model card describe Delta Flow como una política de cuerpo completo basada en "delta-flow" (ImageWAM / HumanWAM), lo que sugiere un modelo generativo de acciones condicionado por observaciones visuales y posiblemente proprioceptivas, entrenado mediante imitación. No se proporcionan detalles sobre el backbone (transformer, difusión, flow matching con integrador ODE, etc.), el número de parámetros ni la composición del dataset de entrenamiento.

El entrenamiento se organiza por tareas del Humanoid Benchmark, con checkpoints por época (`epoch-XXX/`) dentro de cada carpeta de tarea. La model card indica que la ronda de entrenamiento de benchmark está programada y que las carpetas aparecerán a medida que finalicen las ejecuciones. Además, se advierte que la carpeta `legacy/` contiene experimentos anteriores que no siguen el protocolo de benchmark (distintos datos, aumentación o dimensiones de entrada) y que no deben usarse como baseline; se remite a `legacy/README.md` para más detalles.

## Capacidades

- Control de políticas de imitación para robots humanoides en tareas de manipulación y locomoción definidas por el Humanoid Benchmark.
- Ejecución de tareas específicas: `b6-pedal-bin`, `a3-fridge-open`, `a7-cabinet-close`, `a18-pour-water`, `a10-trolley-push`, `a20-basket-transfer` y `a17-unscrew-bottle`.
- Política de cuerpo completo (whole-body), orientada a coordinar base y extremidades en entornos simulados o reales.
- Checkpoints versionados por época para evaluar la evolución del entrenamiento y seleccionar el mejor punto de la curva.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modos de razonamiento explícito.

## Casos de uso

- Evaluación comparativa en el Humanoid Benchmark: usar los checkpoints por tarea para medir la tasa de éxito de Delta Flow frente a `groot` y `pi05` bajo el mismo protocolo y las mismas tareas.
- Selección de checkpoints por época: comparar `epoch-XXX` dentro de una tarea para analizar la curva de aprendizaje y elegir el punto con mejor rendimiento antes de desplegar.
- Investigación en imitación de cuerpo completo: emplear las políticas entrenadas como referencia para estudiar el comportamiento de políticas delta-flow en manipulación humanoide.
- Reproducción de experimentos: al compartir estructura con otros modelos del perfil, permite integrar Delta Flow en pipelines de evaluación ya existentes para `groot` y `pi05`.
- Análisis de tareas de contacto rico: tareas como `a17-unscrew-bottle` o `a3-fridge-open` permiten estudiar el comportamiento de la política en manipulación precisa con contacto.
- Estudio de transferencia entre tareas: comparar checkpoints de tareas distintas (`a18-pour-water` frente a `a20-basket-transfer`) para analizar qué habilidades se comparten y cuáles requieren entrenamiento específico.
- Docencia y divulgación: usar el repositorio como ejemplo de organización de checkpoints de benchmark en robótica, siempre que se respete la advertencia sobre `legacy/`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama, TGI ni frameworks de robótica concretos).
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio ocupa 81,3 GB, lo que implica espacio en disco considerable para alojar todos los checkpoints por tarea y época.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| humanoid-benchmark/deltaflow | no disponible | no disponible | no disponible | no disponible | Hugging Face (repo de 81,3 GB) |
| humanoid-benchmark/groot | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| humanoid-benchmark/pi05 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación se limita a la existencia de los tres modelos en el mismo perfil y con la misma estructura de directorios por tarea; no se dispone de datos de parámetros, contexto, rendimiento ni licencia para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- La model card indica que la ronda de entrenamiento de benchmark está programada; es posible que falten carpetas de tareas o checkpoints en el momento de la consulta.
- La carpeta `legacy/` contiene experimentos que no siguen el protocolo de benchmark (distintos datos, aumentación o dimensiones de entrada) y no debe usarse como baseline; consultar `legacy/README.md`.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas; al tratarse de una política robótica, los riesgos relevantes son de seguridad física en despliegue real, no cubiertos en la información disponible.
- No se detallan los requisitos de hardware ni el formato de pesos, lo que dificulta planificar el despliegue.
- El tamaño del repositorio (81,3 GB) puede suponer un coste significativo de almacenamiento y descarga.
- No hay descargas ni likes registrados, lo que sugiere un uso muy limitado o reciente y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/humanoid-benchmark/deltaflow
- Modelo comparable `groot`: https://huggingface.co/humanoid-benchmark/groot
- Modelo comparable `pi05`: https://huggingface.co/humanoid-benchmark/pi05
