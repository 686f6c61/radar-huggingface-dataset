# jerryyan/TraceML-Labelers

## Resumen

TraceML-Labelers es un conjunto de dos modelos de etiquetado automático desarrollados por Jiarui Yan (usuario `jerryyan`) como parte del proyecto TraceML, publicado en la track Evaluations & Datasets de NeurIPS 2026. Ambos son ajustes finos de Qwen3-1.7B entrenados sobre etiquetas restringidas por esquema generadas por un modelo profesor GPT de mayor tamano, y juntos etiquetaron las 151.088 versiones de código que componen el corpus TraceML. No son modelos de propósito general: son clasificadores generativos especializados en analizar el desarrollo de soluciones de machine learning.

El repositorio contiene dos subcarpetas. El etiquetador `state/` recibe una versión del código de una solución de ML y devuelve un JSON con las etapas del pipeline presentes (8 etiquetas gruesas, etiquetas finas de una lista cerrada de 136 con confianza, un resumen y palabras clave). El etiquetador `action/` recibe una transición entre dos versiones (diff, etiquetas de estado de ambas y cambio de puntuación) y devuelve qué hizo la edición y por qué: 10 acciones gruesas, acciones finas de una lista cerrada de 85, uno o dos de 6 intenciones, magnitud del cambio y efecto sobre la puntuación.

Su relevancia es doble. Por un lado, es infraestructura de investigación reproducible para estudiar cómo trabajan los agentes de auto-investigación en desarrollo de ML de horizonte largo. Por otro, es un ejemplo práctico de destilación de etiquetas estructuradas desde un profesor grande hacia un modelo de 1,7B parámetros que se puede ejecutar localmente en una GPU de consumo. La licencia es Apache-2.0, heredada de Qwen3, y los idiomas declarados son inglés y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Qwen3-1.7B); no se detalla en la informacion proporcionada |
| Parametros totales | ~1,7 mil millones por etiquetador (base Qwen/Qwen3-1.7B) |
| Longitud de contexto | No especificada en la informacion proporcionada; heredada de Qwen3-1.7B. El toolkit del proyecto trocea el codigo largo para ajustarlo a la ventana |
| Tipos de cuantizacion | No se publican pesos cuantizados (ni GGUF, ni AWQ, ni GPTQ). Pesos en safetensors, pensados para bf16 en GPU y float32 en CPU |
| Idiomas soportados | Ingles y codigo (declarados: `en`, `code`). Los prompts y el esquema de salida estan en ingles |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | safetensors, organizados en dos subcarpetas (`state/` y `action/`) |
| Tamano del repositorio | 6,9 GB en total (incluye los dos etiquetadores) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-1.7B (fine-tune) |

## Arquitectura y entrenamiento

Cada etiquetador es un fine-tune completo de Qwen3-1.7B, un transformer denso decoder-only. No hay innovaciones arquitectónicas propias: el interés está en el procedimiento de destilación de etiquetas. Las etiquetas de entrenamiento provienen de un modelo profesor GPT de mayor tamano que generó anotaciones restringidas por esquema (JSON con vocabularios cerrados y niveles de confianza), y el alumno de 1,7B se ajustó para reproducir ese formato de salida. La ficha no especifica el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO.

La decodificación recomendada es greedy (`do_sample=False`) con el modo de razonamiento desactivado, ya que `generation_config.json` conserva los valores de muestreo por defecto de Qwen3 y hay que sobrescribirlos explícitamente. Las etiquetas publicadas en TraceML se generaron con vLLM 0.8.5 en bf16, decodificación greedy y caché de prefijos desactivada, con `max_new_tokens=2000`. El toolkit del proyecto se encarga de reconstruir los prompts exactos, trocear el código largo para que quepa en la ventana de contexto y parsear la salida; el orden de ejecución es obligatorio: primero el etiquetador de estado de ambas versiones y después el de acción, porque este último consume las etiquetas de estado como entrada.

## Capacidades

- Etiquetado de estado de código de ML: clasifica una versión de código en 8 etiquetas gruesas (`data_io`, `feature_eng`, `model_def`, `training_cfg`, `ensemble_blend`, `validation_cv`, `inference_submit`, `infra_util`) y en etiquetas finas de una lista cerrada de 136, cada una con nivel de confianza.
- Etiquetado de acciones sobre transiciones: dado un diff, las etiquetas de estado de las dos versiones y el cambio de puntuación, produce 10 acciones gruesas (`data`, `features`, `augmentation`, `model`, `training`, `ensemble`, `validation`, `inference`, `infra`, `housekeeping`) y acciones finas de una lista cerrada de 85.
- Clasificación de intención de la edición: una o dos de seis intenciones (`exploration`, `optimization`, `pivoting`, `debugging`, `restructuring`, `verification`), con confianza.
- Estimación de magnitud del cambio: `micro`, `minor`, `major` u `overhaul`.
- Estimación del efecto sobre la puntuación: `improving`, `plateau`, `regressing` o `unknown`.
- Generación de campos de texto libre acotados: resumen y palabras clave para el estado; `goal_nl` y `diff_summary` para la acción.
- Salida estrictamente estructurada en JSON conforme a un esquema cerrado, lo que facilita el parseo determinista en pipelines.
- Capacidades de generación de texto y código heredadas del modelo base, pero orientadas al etiquetado; no se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio.
- No se declaran capacidades multilingües más allá del inglés y el código.

## Casos de uso

- Etiquetado retrospectivo de repositorios de competiciones de ML: dado un histórico de versiones de notebooks o scripts de una solución, el etiquetador `state/` produce para cada versión las etapas del pipeline presentes y sus etiquetas finas con confianza. Es útil para convertir un repositorio sin estructura en un dataset analizable.
- Análisis de trayectorias de agentes de auto-investigación: el etiquetador `action/` permite reconstruir qué hizo cada edición de un agente (acción, intención, magnitud, efecto en la métrica), que es exactamente la señal que TraceML usa para estudiar qué se les escapa a estos agentes en desarrollo de ML de horizonte largo.
- Detección automática de regresiones: usando `score_effect = regressing` combinado con la acción y la intención, se pueden generar alertas sobre ediciones que degradan la métrica y revisar el diff asociado sin intervención humana.
- Telemetría y analítica interna de plataformas de MLOps: clasificar los commits o versiones subidas por los equipos para construir paneles de qué tipo de trabajo consume el tiempo (por ejemplo, porcentaje de cambios en `training_cfg` frente a `feature_eng`).
- Onboarding y documentación técnica: a partir del estado y las acciones etiquetadas se pueden generar resúmenes de "qué se cambió y con qué objetivo" por versión, útiles para revisar el trabajo de un compañero o de un agente.
- Curación y búsqueda semántica de corpus de código: las etiquetas finas con confianza permiten filtrar e indexar grandes colecciones de soluciones de ML por etapa del pipeline o por tipo de acción, por ejemplo para recuperar solo transiciones de tipo `augmentation`.
- Generación de datasets de investigación reproducibles: el toolkit permite reetiquetar runs propios con el mismo esquema y vocabularios cerrados que TraceML, de modo que los resultados sean comparables con las cohortes humanas publicadas.
- Auditoría de experimentos en cuadernos de Kaggle: dado que el corpus original son versiones de soluciones de Kaggle, el flujo `state/` + `action/` sirve para auditar cómo se llegó a una puntuación concreta y en qué punto se produjo la meseta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye métricas de precisión, recall ni F1 frente a las etiquetas del profesor para ninguno de los dos etiquetadores, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos de un etiquetador ocupan aproximadamente 3,4 GB; hay que sumar el espacio de la caché KV, que depende de la longitud del prompt y de los hasta 2000 tokens nuevos de salida. Con vLLM, reservar del orden de 6-8 GB por instancia aporta margen suficiente.
- En float32 (configuración usada en CPU en el ejemplo de la ficha), los pesos ocupan aproximadamente 6,8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar un etiquetador en bf16. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB, una RTX 4080 o una RTX 4090 son suficientes; también cabe en A100, H100 y L40S, aunque están sobredimensionadas para 1,7B de parámetros.
- Cabe en GPU de consumo: sí. El caso ajustado es una GPU de 8 GB (RTX 3070, RTX 4060), donde conviene limitar `max_new_tokens` y la longitud de entrada. En 4 GB no cabe con holgura en bf16.
- También se puede ejecutar en CPU con float32 y en Apple Silicon vía MPS en bf16, tal como muestra el ejemplo de la ficha.
- Opciones de despliegue: `transformers` (ruta más directa, con los constructores de prompt y el parser del toolkit `traceml-toolkit`), vLLM 0.8.5 o superior (requiere descargar primero el subdirectorio con `snapshot_download` y apuntar a un directorio local) y cualquier servidor compatible con modelos transformers. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia operativa, las etiquetas de TraceML se generaron con vLLM 0.8.5 en bf16, decodificación greedy y caché de prefijos desactivada, con `max_new_tokens=2000`.

## Comparativa con modelos similares

No se identifican modelos directamente comparables publicados con el mismo esquema de etiquetado de trayectorias de ML. La tabla siguiente compara este fine-tune con su modelo base y con alternativas generalistas del mismo orden de tamaño, señalando que no son equivalentes funcionales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TraceML-Labelers (`state/`, `action/`) | ~1,7B por etiquetador | no disponible | Clasificacion generativa con esquema JSON cerrado sobre codigo de ML | Apache-2.0 | HuggingFace, safetensors, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-1.7B (base) | ~1,7B | no disponible en la informacion proporcionada | Generacion de texto y codigo de proposito general | Apache-2.0 | Ampliamente disponible en HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | no disponible en la informacion proporcionada | Generacion y asistencia de codigo | Apache-2.0 | Ampliamente disponible en HuggingFace |
| SmolLM2-1.7B-Instruct | ~1,7B | no disponible en la informacion proporcionada | Generacion de texto de proposito general | Apache-2.0 | Ampliamente disponible en HuggingFace |

Rendimiento comparado: no disponible. La ficha de TraceML-Labelers no publica metricas que permitan comparar calidad de etiquetado frente a estas alternativas ni frente al profesor GPT que genero las etiquetas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo está ajustado para producir un JSON con un esquema y unos vocabularios cerrados. Fuera de esa tarea, su comportamiento no está documentado y no debería usarse como modelo conversacional o de generación general.
- Dependencia del esquema: los vocabularios cerrados (8 etiquetas gruesas de estado, 136 finas, 10 acciones gruesas, 85 finas, 6 intenciones) pueden no cubrir frameworks, herramientas o prácticas nuevas. Una etiqueta que no exista en la lista no se puede emitir.
- Campos de texto libre: `summary`, `keywords`, `goal_nl` y `diff_summary` son generados por el modelo y pueden contener afirmaciones no respaldadas por el código o el diff. Es la parte con mayor riesgo de alucinación; conviene tratarlos como texto auxiliar, no como hechos verificados.
- Sesgo de destilación: las etiquetas provienen de un profesor GPT de mayor tamaño. El alumno hereda tanto los criterios como los errores sistemáticos del profesor, sin que la ficha documente una evaluación humana independiente de esa calidad.
- Idiomas: solo inglés y código. No hay soporte declarado para castellano ni para otros idiomas, aunque el código fuente sea multilingüe en identificadores o comentarios.
- Contexto y longitud de código: la ficha no especifica la ventana de contexto del fine-tune. El toolkit trocea el código largo, y ese troceado puede perder relaciones entre partes distantes del archivo, lo que afecta al etiquetado de estados complejos.
- Orden de ejecución obligatorio: el etiquetador de acción necesita las etiquetas de estado de las dos versiones. Un error en el etiquetado de estado se propaga a la clasificación de la transición.
- Configuración de decodificación delicada: `generation_config.json` conserva los valores de muestreo de Qwen3. Si no se fuerzan los ajustes greedy, la salida puede no ser reproducible ni parseable.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad. Cualquier uso en producción debería ir precedido de una evaluación propia contra un conjunto anotado a mano.
- Licencia: Apache-2.0, heredada de Qwen3, permite uso comercial. Aun así, conviene revisar los términos del modelo base y del dataset TraceML si se redistribuyen las etiquetas derivadas.
- Restricciones de producción: al ser un modelo pequeño y especializado, el coste de un fallo silencioso (etiqueta incorrecta con confianza alta) es más relevante que el coste computacional. Se recomienda validación por esquema y umbrales de confianza antes de consumir la salida en pipelines automáticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jerryyan/TraceML-Labelers
- Subcarpeta del etiquetador de estado: https://huggingface.co/jerryyan/TraceML-Labelers/tree/main/state
- Subcarpeta del etiquetador de acción: https://huggingface.co/jerryyan/TraceML-Labelers/tree/main/action
- Dataset TraceML: https://huggingface.co/datasets/jerryyan/TraceML
- Esquemas y vocabularios completos: https://huggingface.co/datasets/jerryyan/TraceML/tree/main/manifests/schemas
- Pesos originales en el repositorio del dataset: https://huggingface.co/datasets/jerryyan/TraceML/tree/main/models
- Toolkit TraceML: https://github.com/JerryYan123/TraceML
- Página del proyecto: https://jerryyan123.github.io/TraceML/
- Paper: https://arxiv.org/abs/2608.26086
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
