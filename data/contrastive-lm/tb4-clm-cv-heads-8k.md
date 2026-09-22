# Contrastive-LM/tb4-clm-cv-heads-8k

## Resumen

`Contrastive-LM/tb4-clm-cv-heads-8k` no es un modelo de lenguaje generativo, sino un conjunto de tres cabezas de proyeccion (projection heads) entrenadas con aprendizaje contrastivo para evaluar y clasificar trayectorias del benchmark Terminal-Bench 4.0. El repositorio lo publica el usuario Contrastive-LM y contiene los checkpoints `foldN/best_head.pt` de una validacion cruzada de 3 pliegues (3-fold cross-validation) sobre las 66 tareas de la configuracion "Fable 5.1 MAX" con cinco candidatos por tarea.

La utilidad del artefacto es metodologica: cada pliegue reserva 22 tareas y entrena la cabeza unicamente con trayectorias exitosas de los otros dos pliegues, de modo que `fold_spec.json` asigna a cada tarea reservada la cabeza que nunca la vio durante el entrenamiento. Esto permite medir la capacidad de generalizacion del clasificador sin fuga de informacion entre tareas (task-disjoint), algo relevante para cualquiera que construya verificadores o selectores de trayectorias agénticas sobre benchmarks de terminal.

El backbone sobre el que operan las cabezas es `Qwen/Qwen3-8B` (revision `b968826d9c46dd6066d109eabc6255188de91218`), con pooling sobre el ultimo token y contexto de 8K, inicializado desde `Contrastive-LM/CLM-v0.1-8B/CLM_v0.1-8B.pt`. El resultado verificado es 39/66 = 59,091 % con la regla `min(last 12)`, frente al 57,879 % de la seleccion aleatoria y al 78,788 % del oraculo any-success. La mejora sobre el azar es, por tanto, de aproximadamente 1,2 puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de proyeccion contrastiva (CLM) sobre un encoder transformer denso, `Qwen/Qwen3-8B`, con final-token pooling |
| Parametros totales | no disponible para las cabezas; el encoder subyacente es Qwen/Qwen3-8B (la informacion no detalla el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8K (segun la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el encoder Qwen3-8B es multilingue, pero la model card no declara idiomas para este artefacto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `foldN/best_head.pt`, `CLM_v0.1-8B.pt` |
| Tamano del repositorio | 0,2 GB |
| Numero de checkpoints | 3 (un pliegue por cada `foldN`) |
| Tareas cubiertas | 66 (22 reservadas por pliegue) |
| Dataset asociado | `Contrastive-LM/tb4-clm-cv-embeddings-8k`, split `evaluation` |
| Libreria | pytorch |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El artefacto se compone de tres cabezas de proyeccion para aprendizaje contrastivo (CLM) que se aplican sobre las representaciones de `Qwen/Qwen3-8B`. Las representaciones se extraen con pooling del ultimo token sobre un contexto de 8K, y la inicializacion del entrenamiento parte de `Contrastive-LM/CLM-v0.1-8B/CLM_v0.1-8B.pt`. La model card no especifica la funcion de perdida concreta, el margen ni la dimensionalidad de la proyeccion, por lo que esos detalles quedan como "no disponible".

El esquema de entrenamiento es de validacion cruzada con separacion por tarea: de las 66 tareas del Terminal-Bench 4.0 (configuracion "Fable 5.1 MAX", cinco candidatos por tarea), cada pliegue reserva 22 tareas y entrena su cabeza exclusivamente con trayectorias exitosas de los otros dos pliegues. En inferencia, `fold_spec.json` mapea cada tarea reservada a la cabeza que no la vio en entrenamiento. La evaluacion se realiza con `evaluation/bon_eval.py`, invocada con `--n 5 --window 12`, es decir, seleccionando el minimo de las ultimas 12 observaciones de cada candidato. Los autores advierten explicitamente de que este resultado de validacion cruzada task-disjoint no debe sustituir al checkpoint de unica cabeza publicado en el chart de las 66 tareas.

## Capacidades

- Puntuacion y ranking de trayectorias: dado un conjunto de embeddings de trayectorias de terminal, la cabeza produce una puntuacion que permite ordenar candidatos.
- Prediccion de exito por tarea: clasifica si una trayectoria concreta resolvera la tarea, usada aqui para seleccionar 1 de 5 candidatos.
- Generalizacion task-disjoint: cada cabeza opera sobre tareas que no formaron parte de su entrenamiento, lo que permite estimar la transferencia a tareas nuevas.
- Seleccion con ventana temporal: soporta la regla `min(last 12)`, que agrega las ultimas 12 observaciones de un candidato.
- Aprendizaje contrastivo sobre representaciones de LLM: emplea embeddings de `Qwen3-8B` con pooling del ultimo token y 8K de contexto.
- Integracion en scripts de evaluacion: el `fold_spec.json` usa rutas relativas que se pasan directamente a `evaluation/bon_eval.py`.
- No dispone de generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento explicito: es un modulo de scoring, no un modelo conversacional.

## Casos de uso

- Seleccion de mejores candidatos en evaluaciones agénticas: con cinco candidatos por tarea y una ventana de 12 observaciones, la cabeza permite elegir la trayectoria con mayor probabilidad de exito sin ejecutar un verificador humano, reduciendo el coste de validacion en pipelines de evaluacion de agentes de terminal.
- Validacion metodologica de clasificadores de trayectorias: el esquema de 3 pliegues con separacion por tarea sirve como protocolo de referencia para comprobar si un verificador aprende senales generalizables o simplemente memoriza tareas concretas.
- Reproduccion de resultados de Terminal-Bench 4.0: permite replicar el 59,091 % publicado ejecutando `bon_eval.py` con el dataset de embeddings y el indice de trials indicados en la model card.
- Filtrado de trayectorias exitosas para generar datos: dado que cada pliegue se entrena solo con trayectorias exitosas de los otros pliegues, el mismo procedimiento puede reutilizarse para etiquetar y curar conjuntos de trayectorias destinadas a entrenamiento por imitacion o a modelos de recompensa.
- Auditoria de benchmarks y deteccion de tareas degeneradas: la comparacion entre el selector CLM (59,091 %), el azar (57,879 %) y el oraculo (78,788 %) cuantifica cuanta senal queda sin explotar, util para decidir si merece la pena invertir en un verificador mas costoso.
- Comparacion de variantes de cabeza: el artefacto sirve de referencia para contrastar la version de validacion cruzada frente al checkpoint de unica cabeza de 66 tareas publicado en el chart, evaluando el impacto de la separacion por tarea.
- Investigacion en aprendizaje contrastivo aplicado a LLM: al apoyarse en embeddings de `Qwen3-8B` con pooling del ultimo token y contexto de 8K, es un banco de pruebas para estudiar como afectan el pooling, la ventana de contexto y la inicializacion al rendimiento de la cabeza.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Terminal-Bench 4.0, validacion cruzada 3-fold, regla `min(last 12)` | 39/66 = 59,091 % |
| Seleccion aleatoria (baseline) | 57,879 % |
| Oraculo any-success (techo) | 78,788 % |
| Diferencia sobre seleccion aleatoria | +1,212 puntos porcentuales |
| Cobertura del techo por parte del selector | 1,767 puntos porcentuales de los 20,909 disponibles respecto al azar |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para este artefacto.

## Requisitos de hardware

- VRAM para las cabezas: minima; el repositorio completo ocupa 0,2 GB y contiene tres checkpoints `.pt`, por lo que el almacenamiento y la memoria de las cabezas son despreciables frente al encoder.
- VRAM para el encoder `Qwen3-8B`: el coste dominante. En bf16/fp16 se necesitan aproximadamente 16 GB de pesos mas memoria de activaciones para secuencias de hasta 8K tokens; en cuantizacion de 4 bits el requisito baja a aproximadamente 5-6 GB de pesos. Estas cifras son estimaciones derivadas del tamano del encoder y no aparecen en la model card, que no publica requisitos de hardware.
- GPUs recomendadas: el entrenamiento de las cabezas y la extraccion de embeddings a 8K se benefician de GPUs de 24 GB o mas (RTX 4090, L40S, A100 40/80 GB, H100). Para solo ejecutar las cabezas sobre embeddings precalculados del dataset `tb4-clm-cv-embeddings-8k` basta con CPU, ya que no se requiere el encoder en el momento de la evaluacion.
- Cabe en GPU de consumo: si, siempre que se disponga de al menos 16 GB en bf16 o de aproximadamente 6-8 GB con cuantizacion de 4 bits para servir el encoder; si se consumen los embeddings ya generados, el requisito es practicamente nulo.
- Opciones de despliegue: el flujo documentado es el script `evaluation/bon_eval.py` junto con `hf download`; para servir el encoder `Qwen3-8B` como paso previo de extraccion de embeddings pueden emplearse frameworks habituales como vLLM, TGI o llama.cpp/Ollama (en GGUF), aunque la model card no especifica ninguno.
- Latencia y throughput: no disponibles. La model card solo indica que la seleccion se realiza sobre 5 candidatos por tarea con una ventana de 12 observaciones.
- Dependencia adicional: el artefacto requiere el dataset de embeddings `Contrastive-LM/tb4-clm-cv-embeddings-8k` (split `evaluation`) y el indice `evaluation/tb4_fable_max_index.json`, por lo que no es autonomo respecto al repositorio de evaluacion.

## Comparativa con modelos similares

No se dispone de informacion sobre cabezas de seleccion equivalentes en la documentacion proporcionada. La comparativa disponible se limita a las referencias internas del propio experimento:

| Referencia | Naturaleza | Resultado en Terminal-Bench 4.0 |
|---|---|---|
| CLM 3-fold CV (este artefacto) | Cabeza contrastiva con validacion cruzada task-disjoint | 59,091 % (39/66) |
| Seleccion aleatoria | Baseline sin aprendizaje | 57,879 % |
| Oraculo any-success | Techo superior con conocimiento del exito de todos los candidatos | 78,788 % |
| Checkpoint de unica cabeza del chart de 66 tareas | Cabeza publicada por los mismos autores | no disponible en la informacion proporcionada |
| Modelos comparables de terceros | no disponible | no disponible |

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de lenguaje; no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe presentarse como tal.
- Margen escaso sobre el azar: la mejora es de 1,212 puntos porcentuales sobre la seleccion aleatoria y queda 19,697 puntos por debajo del oraculo any-success, lo que sugiere una senal discriminativa debil en el escenario evaluado.
- Sustitucion no permitida: los autores advierten explicitamente de que este resultado de validacion cruzada task-disjoint no debe sustituir al checkpoint de unica cabeza publicado en el chart de las 66 tareas.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: la model card no especifica idiomas soportados; cualquier afirmacion sobre capacidades multilingues seria especulativa.
- Dependencia de artefactos externos: la evaluacion exige el dataset de embeddings `tb4-clm-cv-embeddings-8k`, el indice de trials y el repositorio de evaluacion; sin ellos el checkpoint es inutilizable.
- Sesgo de dominio: el entrenamiento se limita a trayectorias exitosas de tareas de terminal, por lo que la cabeza esta sesgada hacia ese dominio y no hay evidencia de transferencia a otras tareas agénticas.
- Riesgo de fuga residual: aunque el diseno es task-disjoint, el uso de cinco candidatos y ventanas solapadas de 12 observaciones puede introducir correlaciones no controladas; la model card no documenta analisis de ablacion.
- Metadatos inconsistentes: las fechas de creacion y actualizacion (2026-09-22) no coinciden con la fecha habitual de publicacion de los modelos citados, por lo que conviene verificar la procedencia y vigencia del repositorio.
- Cero traccion: 0 descargas y 0 likes implican ausencia de validacion independiente por parte de la comunidad.
- Alucinacion y sesgos: no aplican en el sentido generativo, pero si existe riesgo de sobreconfianza en la puntuacion de la cabeza, dado que no se publican intervalos de confianza ni calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Contrastive-LM/tb4-clm-cv-heads-8k
- Dataset de embeddings asociado: https://huggingface.co/datasets/Contrastive-LM/tb4-clm-cv-embeddings-8k
- Encoder base: https://huggingface.co/Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`)
- Checkpoint de inicializacion del entrenamiento: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Script de evaluacion referenciado en la model card: `evaluation/bon_eval.py` (ruta relativa al repositorio de evaluacion del autor; no se proporciona URL publica en la informacion disponible)
- Indice de trials referenciado: `evaluation/tb4_fable_max_index.json` (ruta relativa; sin URL publica en la informacion disponible)
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio enlaces relevantes sobre este modelo.
