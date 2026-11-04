# IITM-2026T3-DSAI-GROUP2/gemma-4-e4b-socratic-tutor

## Resumen

Gemma 4 E4B Socratic Tutor es un adaptador LoRA sobre el modelo base google/gemma-4-E4B-it, desarrollado por el grupo IITM-2026T3-DSAI-GROUP2 en el marco del proyecto de laboratorio del BS in Data Science & Applications del IIT Madras. Su objetivo es convertir un modelo conversacional general en un tutor socratico especializado en materias STEM (matematicas y ciencias), que guia al estudiante mediante preguntas dirigidas en lugar de entregar la solucion directamente.

El adaptador se entrena sobre 1.995 dialogos multi-turno derivados de los conjuntos SocraTeach y MathDial, y modifica los modulos de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj) con un rango LoRA de 16, lo que supone aproximadamente 34,9 millones de parametros entrenables. El resultado es un modelo que reduce la longitud media de respuesta de 48 a 20,45 palabras y mantiene una tasa de filtracion de soluciones (leak rate) del 0,0 % en el conjunto de evaluacion.

Es relevante porque demuestra que un ajuste fino ligero y de bajo coste (62 minutos de entrenamiento en una sola GPU) puede alinear el estilo pedagogico de un modelo abierto sin sacrificar la adherencia a la formulacion de preguntas. No obstante, se trata de un artefacto academico con licencia no declarada y sin publicacion de benchmarks estandar, por lo que su uso en produccion requiere validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (google/gemma-4-E4B-it) |
| Parametros totales | ~34,9 M de parametros entrenables en el adaptador (el modelo base no se distribuye en este repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible para el adaptador; el baseline se evaluo en 4 bits |
| Idiomas soportados | no disponible (la model card no declara idiomas; los datos de entrenamiento son en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16 y alpha=16, dropout de 0,05, aplicado sobre los siete modulos lineales del transformer base (proyecciones de query, key, value y output de atencion, y las proyecciones gate, up y down del bloque MLP). El entrenamiento se realizo durante 1 epoca sobre 1.995 dialogos multi-turno extraidos del fichero candidate_train.jsonl.gz del dataset Socratic Tutoring Dataset, que combina SocraTeach y MathDial. Se uso una tasa de aprendizaje de 2e-4, batch efectivo de 8 (batch de 1 con 8 pasos de acumulacion de gradiente) y un warmup ratio de 0,05. El tiempo total de entrenamiento fue de aproximadamente 62,1 minutos en GPU.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal no es arquitectonica sino de alineacion conductual: el ajuste fino reorienta el estilo de respuesta hacia preguntas cortas de andamiaje, con una reduccion drastica de la verbosidad (de 48 a 20,45 palabras por turno) y una mejora sustancial en ROUGE-L y BLEU respecto al baseline.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a tutoria socratica en matematicas y ciencias.
- Formulacion de preguntas de sondeo para diagnosticar la comprension del estudiante antes de responder.
- Andamiaje paso a paso a traves de misconceptions, sin revelar la solucion final (0,0 % de leak rate en el conjunto de evaluacion).
- Respuestas concisas, con una media de 20,45 palabras por turno, proxima a la de tutores humanos (22,16 palabras).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo esta disenado para interaccion conversacional, no para planificacion autonoma.
- Capacidades multilingues: no declaradas; los datos de entrenamiento son en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Tutoria de matematicas de secundaria: el modelo recibe el enunciado del estudiante y responde con preguntas guia ("¿Que operacion deshace la suma?") en lugar de resolver la ecuacion, lo que encaja con su entrenamiento sobre MathDial y su baja tasa de filtracion.
- Acompanamiento en ciencias en plataformas educativas: puede gestionar dialogos multi-turno sobre conceptos cientificos, manteniendo respuestas de ~20 palabras que reducen la carga cognitiva del estudiante.
- Asistente de refuerzo en entornos de aprendizaje adaptativo: integrado como capa conversacional sobre un sistema de ejercicios, permite andamiaje personalizado sin desvelar la respuesta correcta del banco de ejercicios.
- Formacion de profesores y evaluacion de tecnicas socraticas: el adaptador sirve como referencia de estilo pedagogico para comparar respuestas docentes o generar ejemplos de andamiaje.
- Investigacion en alineacion conductual: al ser un LoRA pequeno (34,9 M de parametros) y con hiperparametros documentados, es util para estudiar como el ajuste fino modifica el estilo sin alterar el conocimiento del modelo base.
- Despliegue de bajo coste en laboratorios docentes: el adaptador se carga sobre el modelo base con PEFT y transformers, lo que permite experimentar con cuantizacion en GPUs de gama media sin reentrenar.

## Benchmarks y rendimiento

Evaluacion sobre 100 contextos de test repartidos entre SocraTeach y MathDial, segun la model card:

| Metrica | Baseline (Gemma 4 en 4 bits) | LoRA ajustado | Tutores humanos |
|---|---|---|---|
| Leak rate (%) | 0,0 | 0,0 | 1,0 |
| Question adherence (%) | 87,0 | 69,0 (SocraTeach: 80,0) | 62,0 |
| Longitud media (palabras) | 48,0 | 20,45 | 22,16 |
| ROUGE-L | 0,1888 | 0,3187 | 1,0000 |
| BLEU | 0,0395 | 0,1747 | 1,0000 |
| Validation loss | 2,7645 | 1,1188 | - |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,4 GB (repositorio completo), por lo que el requisito real de VRAM lo determina el modelo base google/gemma-4-E4B-it, cuyas dimensiones no se detallan en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador anade un coste marginal despreciable (~35 M de parametros).
- GPU recomendadas: no disponibles en la informacion proporcionada; el entrenamiento se completo en ~62 minutos en una unica GPU no especificada.
- Encaje en GPU de consumo: no confirmado; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: transformers + PEFT (documentado en la model card); compatibilidad con vLLM, llama.cpp, Ollama o TGI no declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B Socratic Tutor (este) | ~34,9 M entrenables (LoRA) | no disponible | Tutoria socratica STEM | no disponible | HuggingFace (0 descargas) |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Chat general | no disponible en la informacion | HuggingFace (modelo oficial) |
| Alternativas de tutoria socratica especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de tutoria socratica en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso comercial ni la licencia del adaptador, lo que impide su adopcion en produccion sin aclaracion previa del autor.
- Idiomas no declarados: los datos de entrenamiento son en ingles (SocraTeach y MathDial), por lo que el rendimiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion: aunque el leak rate medido es del 0,0 %, la evaluacion se limita a 100 contextos; no hay garantia fuera de la distribucion de entrenamiento.
- Caida de adherencia a preguntas: la tasa de question adherence baja del 87,0 % del baseline al 69,0 % en el adaptador, lo que indica que en un tercio de los casos el modelo no formula la pregunta esperada.
- Entrenamiento muy corto: una sola epoca sobre 1.995 dialogos y 62 minutos de GPU; no se documenta validacion cruzada ni ablaciones completas fuera del grid_search incluido.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o de genero en la model card.
- Sin benchmarks estandar: no hay resultados de MMLU, GSM8K ni HumanEval, lo que impide comparar su capacidad de razonamiento con otros modelos.
- Artefacto academico: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni mantenimiento.
- Dependencia del modelo base: cualquier limitacion de contexto, idioma o licencia de google/gemma-4-E4B-it se hereda y no se detalla en este repositorio.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/gemma-4-e4b-socratic-tutor
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de tutoria socratica: https://huggingface.co/datasets/IITM-2026T3-DSAI-GROUP2/socratic-tutoring-dataset
- Resultados de evaluacion (imagen): results.png en el repositorio del adaptador
- Metricas completas: results.json en el repositorio del adaptador
- Contextos de evaluacion: eval_contexts.csv en el repositorio del adaptador
- Generaciones durante la evaluacion: generations_final.csv en el repositorio del adaptador
- Checkpoints de ablacion: carpeta grid_search/ en el repositorio del adaptador
