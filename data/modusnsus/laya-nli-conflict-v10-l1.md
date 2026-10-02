# Modusnsus/laya-nli-conflict-v10-l1

## Resumen

laya-nli-conflict-v10-l1 es un checkpoint de clasificación de texto (inferencia de relación textual, NLI) publicado por el usuario Modusnsus dentro del ecosistema Laya de ConvAI Innovations. Se trata de un fine-tune de convaiinnovations/laya-multilingual, con encoder declarado jhu-clsp/mmBERT-base y 321.908.998 parámetros totales en safetensors (aproximadamente 0,32B), entrenado para la tarea específica de detectar conflictos de memoria: decidir si un par de frases mantiene, contradice o es neutral respecto a un atributo del mismo sujeto.

Lo relevante de esta ficha es su naturaleza: no es un modelo entregado ni un artefacto de producción, sino un archivo de investigación correspondiente a la ronda 10 del protocolo preregistrado del proyecto (2026-09-30 a 2026-10-01). El experimento consistió en un diseño de palanca única: se eliminó el bloque B del corpus v9 y se midió el efecto. El resultado fue concluyente en sentido negativo: B2 pasó por primera vez (0,1216), pero B1 se desplomó de 0,9078 a 0,2648 y la variante swap-B1 también se invirtió, lo que demuestra que el bloque B es la "pared de carga" de la regla "contradicción de atributo del mismo sujeto implica verdadero". El propio autor etiqueta el checkpoint como research-archive y not-delivered.

Además, el checkpoint es una reconstrucción local, no un artefacto directo de kernel: tras un fallo de extracción de salida de Kaggle, los pesos se recuperaron mediante salvamento parcial de zip verificado por CRC y las métricas se recalcularon en CPU local, con un reajuste local del umbral τ(noul) a 1,0288. La precisión de validación reportada es 0,900 sobre n_val = 1000. La cabeza de producción actual del proyecto es otro modelo, Modusnsus/laya-nli-memory-conflict (v4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabecera de clasificación; fine-tune de convaiinnovations/laya-multilingual, encoder declarado jhu-clsp/mmBERT-base |
| Parametros totales | 321.908.998 (≈0,32B), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en bf16/safetensors, sin artefactos GGUF, INT8 ni GPTQ publicados |
| Idiomas soportados | No disponible en esta ficha; el modelo base laya-multilingual declara enrutado multilingue en mas de 100 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, SHA256 ed77fc7d…aed7e7) |
| Pipeline declarado | text-classification |
| Dataset de entrenamiento | nyu-mll/multi_nli y daphnelaurent/nli-conflict-pairs v15 |
| Tamano del repositorio | 0,7 GB |
| Precision de pesos | bf16 |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un clasificador derivado de convaiinnovations/laya-multilingual, encuadrado en el paradigma que el proyecto denomina "System 1" y "typed-decisions": decisiones rapidas y tipadas en lugar de generacion autoregresiva libre. El encoder subyacente declarado es jhu-clsp/mmBERT-base, trabajando en bf16, con una cabecera de clasificacion para NLI orientada al caso concreto de conflicto de memoria. No se detalla el numero de capas, dimension oculta, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa; esos datos no estan disponibles en la informacion proporcionada.

El entrenamiento se ejecuto en kernels GPU de Kaggle (secuencia de tres versiones bajo el identificador daphnelaurent/laya-nli-conflict-ce) sobre el dataset daphnelaurent/nli-conflict-pairs v15, complementado con nyu-mll/multi_nli. El campo metrics.json indica explicitamente no_rl: true, es decir, no hubo fase de RLHF ni DPO en esta ronda. La innovacion metodologica destacable no es arquitectonica sino experimental: un protocolo preregistrado de tres ejecuciones con una unica palanca manipulada (borrado del bloque B del corpus v9) y una banda de ruido establecida de antemano para interpretar los deltas. Los deltas observados (B2 −77 pp, B1 −64 pp) quedaron muy fuera de esa banda, lo que permitio concluir que el bloque B es imprescindible. El umbral de decision τ(noul) se reajusto localmente a 1,0288 tras la reconstruccion de los pesos.

## Capacidades

- Clasificacion de pares de frases en el espacio NLI: implicacion, contradiccion y neutralidad, con enfasis en contradicciones de atributo sobre el mismo sujeto.
- Deteccion de conflictos de memoria: identificar cuando una afirmacion nueva contradice un hecho previamente almacenado sobre la misma entidad.
- Salida de probabilidad calibrada sobre el conjunto de validacion congelado (val_probs.json), util para umbralizar decisiones con τ(noul).
- Decisiones tipadas ("typed-decisions"), orientadas a emitir una etiqueta accionable en lugar de texto libre.
- Inferencia de baja latencia por diseno del proyecto (motor System 1 no autorregresivo), aunque no se publican cifras especificas para este checkpoint.
- Sin soporte declarado de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Cobertura multilingue no confirmada para este checkpoint concreto; la herencia multilingue proviene del modelo base, no de una validacion propia reportada aqui.
- Capacidad de investigacion en diagnostico de sesgo: la ronda incluye una prueba de sesgo con resultado 11/14 y un conjunto "old-20" con 19/20 aciertos.

## Casos de uso

- Verificacion de memoria en agentes conversacionales: antes de escribir un hecho nuevo en la memoria a largo plazo de un agente, pasar el par (hecho almacenado, hecho candidato) por el clasificador para bloquear contradicciones sobre el mismo sujeto. Es el caso de uso para el que fue entrenado y donde se midio su rendimiento.
- Auditoria de respuestas en pipelines RAG: comparar la respuesta generada con los fragmentos recuperados y marcar contradicciones antes de mostrarla al usuario, reduciendo alucinaciones factuales en documentacion tecnica.
- Control de calidad en atencion al cliente: detectar cuando el historial de un cliente y la respuesta del sistema entran en conflicto (direccion, plan contratado, importe), usando la salida de clasificacion como semaforo previo al envio.
- Curacion de datasets NLI: filtrar pares contradictorios mal etiquetados o duplicados con etiqueta incoherente en corpus de entrenamiento, aprovechando la cabecera de clasificacion de tres clases.
- Investigacion sobre calibracion y umbrales de decision: reutilizar el volcado de probabilidades congelado y el umbral τ(noul) = 1,0288 para estudiar el efecto del umbral en la tasa de falsos positivos y negativos.
- Reproducibilidad de experimentos con palanca unica: servir como punto de comparacion frente a las ejecuciones hermanas (v10-s2 como linea base de ruido, v10-l2 como repeticion de la configuracion v9) en estudios de ablacion.
- Analisis de sesgo en clasificadores NLI: el protocolo de diagnostico de sesgo incluido permite estudiar comportamientos sistematicos ante pares con sesgo de nombre o atributo.

Advertencia transversal: al tratarse de un archivo de investigacion no entregado y con pesos reconstruidos, no se recomienda su uso en produccion; para ese fin el proyecto apunta a Modusnsus/laya-nli-memory-conflict (v4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos son las metricas internas del protocolo de la ronda 10, recalculadas en CPU local sobre pesos reconstruidos, y las de la ronda v9 con la que se compara:

| Metrica (interna, ronda 10) | v10-l1 (bloque B eliminado) | v9 (referencia, bloque B presente) |
|---|---|---|
| B1 (regla "contradiccion de atributo del mismo sujeto implica verdadero") | 0,2648 | 0,9078 |
| B2 | 0,1216 (primer aprobado historico) | no superado |
| Precision de validacion principal | 0,900 (recalculada, n_val = 1000) | no disponible |
| Conjunto "old-20" | 19/20 | no disponible |
| Diagnostico de sesgo | 11/14 | no disponible |
| Veredicto global | 10 PASS / 2 FAIL | no disponible |
| Uso de RL | no_rl = true | no disponible |

La lectura de estos numeros es que la eliminacion del bloque B mejora una prueba concreta (B2) a costa de destruir la regla principal (B1, −64 pp) y su variante swap-B1, con ambos deltas muy por encima de la banda de ruido. Se trata por tanto de un resultado experimental negativo respecto al objetivo de simplificar el corpus.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 0,65-0,8 GB solo para pesos (321,9 M de parametros), mas activaciones y overhead de runtime; el repositorio completo ocupa 0,7 GB.
- VRAM estimada en cuantizacion INT8: aproximadamente 0,35 GB de pesos; en INT4, aproximadamente 0,18 GB (estimacion aritmetica, no hay artefactos cuantizados publicados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas de gama de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sobradamente. Tambien es viable en GPU de datacenter (A100, H100) aunque claramente sobredimensionadas para este tamano.
- Ejecucion en CPU: viable para inferencia por lotes, que es de hecho el modo en que el autor recalculo las metricas (reconstruccion local en CPU).
- Cabe en GPU de consumo: si, en practicamente todas las del mercado actual, incluidos portatiles con GPU integrada de gama media.
- Opciones de despliegue: transformers con pipeline de text-classification, Hugging Face Inference Endpoints (la ficha esta marcada como endpoints_compatible), servidor propio con FastAPI o similar, y exportacion a ONNX. vLLM y llama.cpp no son las rutas naturales para un clasificador de 0,32B y no se documentan artefactos GGUF.
- Latencia y throughput: no disponibles. La documentacion del proyecto Laya menciona un motor System 1 por debajo de 35 ms, pero esa cifra corresponde al motor global y no se atribuye especificamente a este checkpoint.

## Comparativa con modelos similares

La comparacion mas pertinente es con los propios artefactos hermanos del proyecto, ya que no se aportan datos de modelos NLI externos en la informacion disponible.

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Modusnsus/laya-nli-conflict-v10-l1 (este) | Ablacion ronda 10: corpus v9 sin bloque B | 321.908.998 | no disponible | apache-2.0 | Publicado, archivo de investigacion, no entregado |
| Modusnsus/laya-nli-conflict-v10-s2 | Linea base de ruido de la ronda 10 | no disponible | no disponible | no disponible | Publicado en Hugging Face |
| Modusnsus/laya-nli-conflict-v10-l2 | Repeticion de la configuracion v9 | no disponible | no disponible | no disponible | Publicado en Hugging Face |
| Modusnsus/laya-nli-memory-conflict (v4) | Cabeza de produccion actual del proyecto | no disponible | no disponible | no disponible | Publicado en Hugging Face |
| Modusnsus/laya-typed-decisions-multilingual | Modelo de decisiones tipadas multilingue | 0,4B | no disponible | no disponible | Publicado en Hugging Face |
| convaiinnovations/laya-multilingual | Modelo base del fine-tune | no disponible | no disponible | no disponible | Publicado en Hugging Face |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables mas alla de lo indicado, por lo que no es posible establecer una comparacion cuantitativa con alternativas externas de la misma categoria (por ejemplo, cross-encoders NLI genericos): esa informacion no esta disponible.

## Limitaciones y advertencias

- No es un modelo entregado: el autor lo etiqueta explicitamente como research-archive y not-delivered. No debe tratarse como un artefacto listo para produccion.
- Pesos reconstruidos: el checkpoint es una reconstruccion local a partir de un salvamento parcial de zip verificado por CRC tras un fallo de extraccion de salida en Kaggle, no un artefacto directo de kernel.
- Metricas recalculadas en CPU: la precision de 0,900 y el umbral τ(noul) = 1,0288 provienen de un recalculo local, no de la ejecucion original, lo que introduce una desviacion documentada por el propio autor en HANDOFF_NLI_V10.md §10.0.
- Resultado experimental negativo: el borrado del bloque B provoca una caida de 64 pp en B1 y de 77 pp en B2 respecto a la banda de ruido, con la variante swap-B1 tambien invertida. El corpus abreviado no es una alternativa valida.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos en la clasificacion: la tarea es de decision binaria/multiclase, no de generacion, pero un umbral mal ajustado desplaza sistematicamente las decisiones.
- Sesgos: el protocolo incluye un diagnostico de sesgo con resultado 11/14 y un caso de contradiccion de nombre en el conjunto old-20 que no se resolvio; hay evidencia de comportamiento sistematico ante variaciones de nombre que no esta caracterizado en detalle.
- Cobertura de idiomas no declarada para este checkpoint; no debe asumirse el multilingueismo del modelo base sin validacion propia.
- Sin datos publicados sobre longitud de contexto, por lo que no se puede garantizar el comportamiento con pares de frases largos o documentos extensos.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero al ser un archivo de investigacion no entregado la idoneidad tecnica, no la legal, es el factor limitante.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- No hay soporte declarado de tool calling, agentes, vision ni audio; cualquier expectativa en ese sentido es infundada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Modusnsus/laya-nli-conflict-v10-l1
- Cabeza de produccion actual: https://huggingface.co/Modusnsus/laya-nli-memory-conflict
- Ejecucion hermana (linea base de ruido): https://huggingface.co/Modusnsus/laya-nli-conflict-v10-s2
- Ejecucion hermana (repeticion de configuracion v9): https://huggingface.co/Modusnsus/laya-nli-conflict-v10-l2
- Modelo de decisiones tipadas multilingue: https://huggingface.co/Modusnsus/laya-typed-decisions-multilingual
- Perfil del autor en Hugging Face: https://huggingface.co/Modusnsus
- Repositorio del proyecto Laya: https://github.com/modusensus/laya
- Registro de la ronda y tabla de gates: https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V10.md
- Manifiesto de hashes SHA256: https://github.com/modusensus/laya/blob/main/kaggle_eval/archive_sha256_manifest.txt
- Sitio del motor System 1 de Laya: https://laya.convaiinnovations.com/
- Ficha de registro de Laya NLI Memory Conflict en free2aitools: https://free2aitools.com/model/modusnsus/laya-nli-memory-conflict
- Proyecto homonimo no relacionado (centro de notificaciones local-first): https://github.com/aayushch/laya
