# sanyam2005/anlp-a2-part2-adamw

## Resumen

`anlp-a2-part2-adamw` es un transformer denso decoder-only de 27.269.632 parametros entrenado desde cero por el usuario Sanyam Agrawal (sanyam2005), en el marco de la asignacion 2 de un curso de Procesamiento de Lenguaje Natural Avanzado (etiqueta `anlp-assignment-2`). El modelo no es un lanzamiento de producto ni una contribucion de investigacion: es un artefacto academico cuyo proposito es comparar el comportamiento de distintos optimizadores implementados a mano. En esta variante concreta el optimizador es AdamW, implementado desde cero, y el modelo actua como linea base del experimento.

El entrenamiento se hizo sobre el corpus `browndw/human-ai-parallel-corpus` (texto paralelo humano/IA en ingles), durante una unica pasada sobre el dataset, con 41.648.128 tokens procesados. El autor reporta una perdida de validacion final de 3,8305 y un BLEU de 1,22 en continuacion de 64 tokens, cifras que situan al modelo muy lejos de un uso productivo y que son coherentes con su naturaleza de ejercicio de laboratorio.

Su relevancia es, por tanto, limitada y acotada al ambito docente y de reproducibilidad: sirve como referencia para estudiar el efecto del optimizador en un presupuesto de computo minimo (entrenamiento sobre ~41,6 M de tokens con un modelo de 27 M de parametros). No hay evidencia de pipeline declarado, licencia ni resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (causal LM) |
| Parametros totales | 27.269.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no se han publicado versiones GGUF cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Volumen del repositorio | 0,1 GB |
| Tokens de entrenamiento | 41.648.128 (1 pasada sobre el dataset) |
| Optimizador | AdamW implementado desde cero |
| Hiperparametros | `lr=0.002`, `betas=[0.9, 0.95]`, `eps=1e-08`, `weight_decay=0.1` |

## Arquitectura y entrenamiento

La model card describe un transformer denso decoder-only, es decir, un modelo autorregresivo causal convencional basado en atencion, sin mezcla de expertos ni componentes de espacio de estados. No se especifican en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el vocabulario ni la longitud de contexto soportada. El dato de 27.269.632 parametros es el unico estructural confirmado, y se corresponde con un modelo de escala muy pequena, del orden de decenas de millones de parametros.

El entrenamiento se realizo desde cero sobre `browndw/human-ai-parallel-corpus`, un corpus paralelo humano/IA en ingles, con objetivo de modelado de lenguaje causal y una sola pasada sobre los datos (41.648.128 tokens). El elemento metodologico central del experimento es el optimizador: AdamW con decaimiento de peso desacoplado, implementado a mano en lugar de usar la version de una libreria estandar. No hay informacion sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT, ni sobre decodificacion especulativa, atencion lineal u otras innovaciones. La perdida de validacion final reportada es 3,8305.

## Capacidades

- Generacion de texto causal en ingles: continuacion de secuencias dado un prefijo, que es la tarea para la que fue entrenado.
- Continuacion de 64 tokens: la metrica BLEU reportada se calcula sobre continuaciones de esa longitud, lo que indica el regimen de generacion evaluado.
- No hay evidencia de soporte de tool calling ni de function calling en la informacion disponible.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues: el modelo esta etiquetado unicamente como ingles.
- No hay modo de razonamiento explicito (thinking mode), ni vision, ni audio, ni ninguna otra modalidad.
- Dado el entrenamiento sobre un corpus paralelo humano/IA, es plausible que el modelo haya absorbido sesgos de estilo de ese corpus concreto, pero no hay evaluacion publicada al respecto.

## Casos de uso

- Reproducibilidad de experimentos de optimizadores: el modelo sirve como punto de referencia (baseline AdamW) para comparar contra variantes como SGD con momento, Adafactor o implementaciones alternativas bajo el mismo presupuesto de datos, aislando el efecto del optimizador.
- Material docente en cursos de PLN: permite a estudiantes inspeccionar los pesos, la configuracion y el procedimiento de entrenamiento de un transformer entrenado desde cero, algo poco habitual en modelos publicos de gran escala.
- Estudio del sobreajuste en regimenes de bajos datos: con 41,6 M de tokens y una unica epoca, es un caso util para analizar como se comporta la perdida de validacion cuando el presupuesto de datos es muy ajustado.
- Pruebas de infraestructura de entrenamiento y evaluacion: al ser un modelo de 27 M de parametros, se puede entrenar y evaluar en minutos, lo que lo hace adecuado para validar pipelines, scripts de tokenizacion o metricas como BLEU antes de escalar a modelos mayores.
- Analisis del corpus `browndw/human-ai-parallel-corpus`: permite estudiar que tipo de distribucion linguistica aprende un modelo cuando se entrena exclusivamente sobre ese material paralelo.
- Experimentos de generacion de texto a pequena escala en ingles sin requisitos de hardware: util para prototipar interfaces de inferencia o para ejercicios de clase sobre generacion autorregresiva.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes ni ninguna aplicacion real con usuarios: los resultados reportados (BLEU 1,22) no lo justifican.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados por el autor son la perdida de validacion y el BLEU de test. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 3,8305 |
| BLEU de test (continuacion de 64 tokens) | 1,22 |
| Tokens de entrenamiento | 41.648.128 |
| Epocas sobre el dataset | 1 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 109 MB solo para pesos (27.269.632 parametros x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 55 MB para pesos. En int8, unos 27 MB; en int4, unos 14 MB. Son estimaciones aritmeticas a partir del numero de parametros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente incluso en GPUs integradas o en CPU. No hay datos publicados de latencia ni de throughput.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en la mayoria de GPUs de generaciones anteriores, dado el tamano de 0,1 GB del repositorio.
- Opciones de despliegue: al publicarse solo safetensors, es directamente cargable con `transformers`. Para llama.cpp, Ollama o vLLM seria necesario convertir los pesos y disponer de la configuracion exacta de arquitectura, que no esta documentada en la informacion disponible; no hay confirmacion de compatibilidad con esos motores.
- No se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sanyam2005/anlp-a2-part2-adamw | 27.269.632 | no disponible | no disponible | HuggingFace (safetensors) | Variante con AdamW del ejercicio ANLP A2 |
| unignoramus/anlp-a2-p2-adamw | no disponible | no disponible | no disponible | HuggingFace | Mismo ejercicio, optimizador AdamW, transformer decoder-only preentrenado sobre el corpus paralelo humano/IA en ingles |
| Otros modelos de ~27 M de parametros (por ejemplo, GPT-2 small tiene 124 M) | No se dispone de comparativas publicadas en la informacion proporcionada | no disponible | no disponible | no disponible | No hay benchmarks comunes que permitan una comparacion rigurosa |

No hay datos de rendimiento comparables entre estas variantes en la informacion disponible. La unica comparacion posible es de naturaleza experimental (mismo corpus, mismo presupuesto, distinto optimizador), y los resultados de esa comparacion no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo: un BLEU de 1,22 en continuacion de 64 tokens indica que la calidad del texto generado es practicamente inutilizable en produccion.
- Riesgo elevado de alucinacion y de texto incoherente: el modelo ha visto solo 41,6 M de tokens en una unica epoca, muy por debajo de lo necesario para una modelizacion del lenguaje fiable.
- Sesgos conocidos: no hay evaluacion publicada. El entrenamiento sobre un corpus paralelo humano/IA en ingles puede introducir sesgos de estilo y de contenido propios de ese corpus.
- Limitacion idiomatica: solo ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto: no disponible. Se desconoce la ventana maxima soportada, lo que impide planificar usos con entradas largas.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial. Se debe tratar como material sin permisos claros hasta consultar al autor.
- Naturaleza academica: es un artefacto de una asignatura, sin mantenimiento, sin documentacion de arquitectura completa y con 0 descargas y 0 likes en el momento de la consulta.
- Sin garantias de compatibilidad: al no publicarse la configuracion de arquitectura, la carga con librerias distintas de las usadas por el autor puede requerir trabajo adicional.
- Advertencia de produccion: no se debe desplegar en ningun sistema con usuarios reales ni usar como base para fine-tuning destinado a tareas criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyam2005/anlp-a2-part2-adamw
- Perfil del autor: https://huggingface.co/sanyam2005
- Variante equivalente de otro autor (AdamW): https://huggingface.co/unignoramus/anlp-a2-p2-adamw
- Referencia sobre la implementacion de AdamW en el contexto del curso: https://deepwiki.com/cmu-l3/anlp-fall2025-hw1/3.3-adamw-optimizer-(optimizer.py)
- Articulo original de AdamW (Loshchilov y Hutter, 2017): no disponible como enlace en la informacion proporcionada
- Paper, blog o demo adicional: no disponible
