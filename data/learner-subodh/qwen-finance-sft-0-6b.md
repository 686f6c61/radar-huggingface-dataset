# learner-subodh/qwen-finance-sft-0.6b

## Resumen

Finance-SFT (Experiment A) es un ajuste fino supervisado del modelo Qwen3-0.6B, desarrollado por el usuario learner-subodh, orientado a razonamiento numerico financiero y a preguntas y respuestas fundamentadas en tablas (estilo FinQA y TAT-QA). El modelo parte de los pesos de Qwen/Qwen3-0.6B, un transformer decoder-only de aproximadamente 596 millones de parametros y 28 capas, y se entrena mediante QLoRA convencional sobre pares instruccion-respuesta derivados de las anotaciones gold de FinQA y TAT-QA, mas tablas sinteticas generadas programaticamente.

El objetivo declarado del autor es de investigacion: comprobar si un modelo pequeno puede retener al menos el 90% del rendimiento de un modelo profesor (Qwen3-8B) en esta tarea, mediante ajuste supervisado y/o destilacion. Esta variante concreta (Experiment A) no emplea destilacion guiada por profesor; el modelo resultante fusiona el adaptador LoRA en los pesos base en fp16. La salida sigue un formato fijo de tres campos (calculo, respuesta y escala), con una etiqueta explicita `NOT_ANSWERABLE` cuando falta informacion.

Es relevante ahora como referencia metodologica para quien investigue adaptacion de modelos pequenos a dominios financieros con recursos limitados: el autor publica configuracion de entrenamiento, hashes de dataset, controles de fuga de datos y resultados de evaluacion con intervalos de confianza, aunque sobre submuestras de solo 50 ejemplos por benchmark. No esta pensado para uso en produccion financiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only), 28 capas, hidden size 1024 |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (entrenamiento con max_seq_len 1024) |
| Tipos de cuantizacion | fp16 (pesos fusionados publicados); entrenamiento en 4-bit NF4 QLoRA; evaluacion del profesor en 4-bit NF4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un Qwen3 denso de 28 capas y dimension oculta 1024, con aproximadamente 0,6B de parametros. Se parte del checkpoint `Qwen/Qwen3-0.6B` (revision `c1899de289a04d12100db370d81485cdf75e47ca`) y se aplica QLoRA con rango 16, alpha 32 y dropout 0,05, lo que supone 10.092.544 parametros entrenables. El entrenamiento usa precision mixta fp16, cuantizacion 4-bit NF4, AdamW paginado de 8 bits y scheduler coseno, con learning rate 1e-4, 2 epocas, batch efectivo 4 y longitud maxima de secuencia 1024. El adaptador resultante se fusiona en los pesos base en fp16.

Los datos provienen de los splits de entrenamiento oficiales de FinQA y TAT-QA mas tablas sinteticas generadas programaticamente; los objetivos se construyen de forma determinista a partir de las anotaciones gold (respuestas y expresiones aritmeticas de los programas). El pipeline de procesado incluye separacion a nivel de documento, deduplicacion exacta, eliminacion de supervision contradictoria (18 ejemplos en FinQA, 6 en TAT-QA), eliminacion de casi-duplicados mediante MinHash contra contextos de validacion y test, filtrado por longitud de tokens y enmascaramiento de perdida solo en la respuesta. El conjunto final de entrenamiento tiene 500 filas. El entrenamiento se ejecuto en una Tesla T4 con un pico de 3,05 GB de VRAM y una duracion de 837,5 s en la sesion final; la mejor perdida de evaluacion fue 0,3146.

## Capacidades

- Generacion de texto con formato estructurado de tres campos: calculo, respuesta y escala.
- Razonamiento numerico sobre documentos financieros: extraccion de cifras y ejecucion de operaciones aritmeticas derivadas de programas gold.
- Preguntas y respuestas fundamentadas en tablas (table QA) al estilo TAT-QA, incluyendo agregaciones y comparaciones entre celdas.
- Deteccion de informacion ausente mediante la etiqueta `NOT_ANSWERABLE`.
- Ajuste al dominio financiero limitado al documento proporcionado en el contexto.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso mas alla de la aritmetica implicita en la respuesta.
- Capacidades multilingues: no disponibles; la model card no documenta idiomas soportados.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre retencion de capacidad en modelos pequenos: usar esta variante como linea base (SFT sin destilacion) frente a las variantes M3 y M4 del mismo experimento para medir el efecto de la destilacion guiada por profesor en tareas FinQA/TAT-QA.
- Extraccion de cifras de estados financieros en formato tabla: el modelo recibe una tabla y una pregunta y devuelve el calculo intermedio y la respuesta con su escala, lo que facilita la verificacion manual en entornos de anotacion.
- Prototipado de asistentes de analisis documental interno: con 0,6B de parametros y pesos fp16 de aproximadamente 1,2 GB, puede desplegarse en una sola GPU consumer para experimentar con flujos de QA sobre informes anuales antes de escalar a modelos mayores.
- Generacion de datos sinteticos de entrenamiento: dado su formato de salida determinista, puede emplearse para producir pares pregunta-calculo-respuesta sobre tablas generadas y ampliar corpus de ajuste fino.
- Validacion de pipelines de evaluacion: sirve como sujeto de prueba para scripts de scoring numerico y de exact match en entornos de investigacion, dado que el autor documenta la metodologia y las metricas empleadas.
- Docencia y demostraciones: su tamano permite ejecutarlo en portatiles con GPU modesta para ilustrar tecnicas de QLoRA y evaluacion con intervalos de confianza en dominios financieros.
- Filtrado de preguntas no respondibles: la etiqueta `NOT_ANSWERABLE` permite construir clasificadores auxiliares que descarten consultas sin soporte documental antes de enviarlas a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre submuestras de 50 ejemplos por benchmark, con decodificacion greedy y prompt identico entre modelos. M1 es el estudiante original sin ajustar, M2 es esta variante (Finance-SFT, Experiment A), M3 y M4 son otras variantes del experimento y M5 es el profesor Qwen3-8B evaluado en 4-bit NF4.

| Modelo | Benchmark | Metrica | Valor | n |
|---|---|---|---|---|
| M1 (base) | FinQA | numeric_acc | 0,000 | 50 |
| M1 (base) | TAT-QA | em | 0,000 | 50 |
| M5 (profesor 8B) | FinQA | numeric_acc | 0,480 | 50 |
| M5 (profesor 8B) | TAT-QA | em | 0,320 | 50 |
| M2 (este modelo) | FinQA | numeric_acc | 0,280 | 50 |
| M2 (este modelo) | TAT-QA | em | 0,400 | 50 |
| M3 | FinQA | numeric_acc | 0,240 | 50 |
| M3 | TAT-QA | em | 0,180 | 50 |
| M4 | FinQA | numeric_acc | 0,200 | 50 |
| M4 | TAT-QA | em | 0,180 | 50 |

Retencion relativa frente al profesor (bootstrap pareado, 500 remuestreos):

| Modelo | Benchmark | Estudiante | Profesor | Retencion (%) | IC 95% | Brecha absoluta |
|---|---|---|---|---|---|---|
| M2 | FinQA | 0,280 | 0,480 | 58,333 | 36,000-86,055 | 0,200 |
| M2 | TAT-QA | 0,400 | 0,320 | 125,000 | 86,957-189,472 | -0,080 |
| M2 | Global | - | - | 85,000 | 64,529-112,937 | - |

La retencion global del 85,0% no alcanza el objetivo del 90% declarado por el autor. Los intervalos de confianza reflejan unicamente el ruido de muestreo del test (una sola semilla de entrenamiento), no la varianza entre semillas. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,2-1,5 GB para pesos mas overhead de activaciones y cache KV; el repo pesa 1,2 GB.
- VRAM estimada en 4-bit: aproximadamente 0,4-0,6 GB para pesos, viable en GPUs con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en Tesla T4, la GPU usada por el autor para entrenamiento.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en iGPU con suficiente memoria compartida en cuantizacion 4-bit.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documenta soporte explicito de vLLM, llama.cpp u Ollama, aunque al ser un Qwen3 estandar la conversion a GGUF es tecnicamente posible.
- Latencia y throughput: no disponibles; la model card menciona mediciones en Tesla T4 con batch size 1 pero el texto proporcionado esta truncado antes de incluir cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FinQA (numeric_acc) | TAT-QA (em) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Finance-SFT 0.6B (este) | ~0,6B | no disponible | 0,280 | 0,400 | apache-2.0 | Hugging Face |
| Qwen3-0.6B base | ~0,6B | no disponible | 0,000 | 0,000 | apache-2.0 | Hugging Face |
| Qwen3-8B (profesor) | ~8B | no disponible | 0,480 | 0,320 | apache-2.0 | Hugging Face |
| Variantes M3/M4 del mismo experimento | ~0,6B | no disponible | 0,200-0,240 | 0,180 | apache-2.0 | Hugging Face (no verificadas) |

La comparativa se limita al ecosistema del propio experimento porque no se dispone de datos de otros modelos financieros especializados en la informacion proporcionada. El resultado mas llamativo es que este modelo supera al profesor de 8B en TAT-QA (0,400 frente a 0,320) pero queda por debajo en FinQA (0,280 frente a 0,480), con intervalos de confianza amplios por el tamano muestral de 50 ejemplos.

## Limitaciones y advertencias

- El modelo no esta validado para uso en produccion: el autor lo declara explicitamente como herramienta de investigacion.
- Uso fuera de alcance: asesoramiento de inversion, prediccion de precios, analisis de sentimiento, chat financiero general o cualquier decision sin verificacion humana.
- Solo responde sobre el documento proporcionado en el contexto; no tiene conocimiento financiero externo validado.
- Riesgo de alucinacion en cifras y calculos: los resultados de FinQA (0,280) y TAT-QA (0,400) implican que entre el 60% y el 72% de las respuestas no son correctas en la submuestra evaluada.
- Entrenado con solo 500 filas y 2 epocas sobre una T4, lo que limita la generalizacion y aumenta la sensibilidad al formato del prompt.
- Evaluacion sobre 50 ejemplos por benchmark y una unica semilla de entrenamiento: los intervalos de confianza no capturan la varianza entre semillas, por lo que la robustez real es desconocida.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre FinQA y TAT-QA, corpus predominantemente en ingles, por lo que el rendimiento en castellano es incierto.
- La licencia apache-2.0 permite uso comercial, pero dado el estado experimental del modelo y la falta de validacion, no se recomienda su explotacion comercial sin una evaluacion propia exhaustiva.
- El texto de la model card esta truncado en la seccion de rendimiento de inferencia, por lo que no se dispone de datos de latencia ni throughput.
- No se documenta soporte de tool calling, agentes ni modo thinking, lo que limita su integracion en pipelines agenticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner-subodh/qwen-finance-sft-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-8B
- Dataset FinQA: https://github.com/czyssrs/FinQA
- Dataset TAT-QA: https://github.com/NExTplusplus/TAT-QA
