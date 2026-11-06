# kalyan-ks/Ammu-1.0-FactCheck-Need-base-ONNX-INT8

## Resumen

Ammu-1.0-FactCheck-Need-base-ONNX-INT8 es un clasificador de texto binario derivado de la familia Ammu 1.0, desarrollado por kalyan-ks. Su tarea es decidir, dado un prompt de usuario, si la respuesta requiere verificacion factual externa (busqueda o recuperacion, etiqueta `FACT_CHECK_NEEDED`) o si puede responderse directamente sin recuperacion (etiqueta `NO_FACT_CHECK_NEEDED`). Esta funcion es util como enrutador semantico previo a un pipeline RAG: evita llamadas innecesarias a motores de busqueda o indices vectoriales cuando el prompt es autocontenido.

El modelo se construye sobre una arquitectura ModernBERT de 150M parametros y se distribuye como artefacto ONNX cuantizado dinamicamente a INT8, con las capas sensibles y la cabeza de clasificacion preservadas en FP32. El repositorio ocupa 0,3 GB y esta pensado para inferencia en CPU mediante ONNX Runtime, con latencia de decenas de milisegundos por consulta.

La relevancia practica del modelo reside en su relacion rendimiento/coste: declara un Macro-F1 global de 0,9513 en un conjunto de test de 4.214 instancias, mantiene el 98,89 % del rendimiento del modelo FP32 original y reduce el tamano en un 50,2 % respecto a este, con una mejora de latencia de 1,43x en CPU. Todo ello bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 150M (segun model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card recomienda `max_length=128` para clasificacion de prompts) |
| Tipos de cuantizacion | INT8 dinamica (PTQ) con capas sensibles y cabeza en FP32; artefacto ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`), cargable con `optimum.onnxruntime.ORTModelForSequenceClassification` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 150M parametros adaptado a clasificacion de secuencias con dos etiquetas (`FACT_CHECK_NEEDED` / `NO_FACT_CHECK_NEEDED`). Sobre el checkpoint base `kalyan-ks/Ammu-1.0-FactCheck-Need-base` se aplico un proceso de cuantizacion post-entrenamiento (PTQ) dinamica a INT8, con perfilado de sensibilidad por capa sobre datos de validacion: las capas criticas y la cabeza de clasificacion se mantienen en FP32 y el resto se cuantiza con `QuantType.QInt8`. El resultado se exporta a ONNX para ejecucion con ONNX Runtime.

El conjunto de entrenamiento descrito en la model card cubre prompts de usuario de 120 topicos, 19 formatos de interaccion y 29 personas de usuario, y se publica como `kalyan-ks/fact-check-need-classification`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede para un clasificador, pero no se confirma el proceso de ajuste). La evaluacion se realiza sobre un holdout ciego de 4.214 instancias balanceadas con tres niveles de dificultad (Easy: 826, Medium: 1.688, Hard: 1.700), con `max_length=128` en CPU.

## Capacidades

- Clasificacion binaria de prompts: determina si un prompt requiere verificacion factual externa o puede responderse sin recuperacion.
- Enrutamiento semantico para pipelines RAG: actua como guardrail previo a la llamada al retriever o al buscador.
- Manejo de prompts de frontera (casos "Hard"), con Macro-F1 de 0,9335 en esa franja.
- Procesamiento de prompts con conocimiento oculto que requiere consulta externa (por ejemplo, fechas de nacimiento o datos enciclopedicos).
- Distincion de tareas NLP autocontenidas sobre texto proporcionado (extraccion de entidades, resumen, etc.) que no necesitan verificacion.
- Distincion de instrucciones creativas o generativas autocontenidas.
- Inferencia en CPU con ONNX Runtime, sin dependencia de GPU.
- No soporta tool calling, agentes multi-step, vision, audio ni modo thinking: es un clasificador, no un modelo generativo.

## Casos de uso

- Enrutamiento en pipelines RAG: antes de invocar el retriever, el clasificador decide si el prompt necesita recuperacion; si la salida es `NO_FACT_CHECK_NEEDED`, se responde directamente con el LLM, ahorrando latencia y coste de tokens.
- Guardrail de verificacion factual: en asistentes de dominio publico, marcar prompts que requieren contraste con fuentes externas para activar un flujo de fact-checking antes de responder.
- Reduccion de coste en atencion al cliente automatizada: clasificar consultas entrantes para derivar solo las que requieren consulta a base de conocimiento o busqueda web, manteniendo el resto en respuesta directa.
- Optimizacion de agentes con busqueda web: evitar llamadas innecesarias a APIs de busqueda cuando la consulta es autocontenida (por ejemplo, "extrae las entidades de esta frase").
- Filtrado previo en sistemas de QA sobre documentacion interna: separar preguntas que exigen recuperar un documento de aquellas que se resuelven con instrucciones o plantillas.
- Despliegue en entornos con CPU exclusivamente: con 284,7 MB en disco y 35,73 ms de latencia mediana por consulta, es viable en contenedores sin GPU, edge o servicios de bajo coste.
- Clasificacion por lotes para analitica de trazas: etiquetar grandes volumenes de prompts historicos para medir que proporcion requeria recuperacion externa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (conjunto de test de 4.214 instancias, `verified: false`):

| Metrica | Valor |
|---|---|
| Macro-F1 (global) | 0,9513 |
| Macro-F1 (Easy) | 0,9879 |
| Macro-F1 (Medium) | 0,9514 |
| Macro-F1 (Hard) | 0,9335 |

Datos de eficiencia declarados en la model card:

| Metrica | FP32 base | ONNX INT8 |
|---|---|---|
| Tamano en disco | 571,3 MB | 284,7 MB (2,01x compresion) |
| Latencia mediana por consulta (CPU) | 51,00 ms | 35,73 ms (1,43x) |
| Throughput | 10,9 q/s | 14,7 q/s (+34,9 %) |
| Retencion de rendimiento vs FP32 | referencia | 98,89 % |

Comparacion declarada por el autor con el baseline `llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck`: 69,42 % de Macro-F1, es decir, +25,71 puntos por debajo de este modelo pese a tener el doble de parametros.

## Requisitos de hardware

- Inferencia en CPU: es el modo previsto; el artefacto ONNX INT8 esta disenado para `CPUExecutionProvider` de ONNX Runtime.
- VRAM: no requiere GPU; en CPU el consumo de memoria es del orden de cientos de MB (tamano del modelo 284,7 MB mas overhead de runtime).
- GPU recomendadas: no aplica para el caso de uso previsto; podria ejecutarse en GPU via ONNX Runtime con `CUDAExecutionProvider`, pero no se publican metricas para ese escenario.
- Cabe en cualquier equipo consumer: portatiles, contenedores pequenos y dispositivos edge son suficientes.
- Despliegue: `optimum[onnxruntime]` con `ORTModelForSequenceClassification` y `pipeline("text-classification")`; compatible con ONNX Runtime >= 1.19 y `transformers` >= 4.48 segun la model card.
- Latencia y throughput: 35,73 ms por consulta y 14,7 q/s en CPU con `max_length=128` (cifras del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (tarea) | Licencia | Formato |
|---|---|---|---|---|---|
| Ammu-1.0-FactCheck-Need-base-ONNX-INT8 | 150M | no disponible | 0,9513 | MIT | ONNX INT8 |
| Ammu-1.0-FactCheck-Need-base (FP32) | 150M | no disponible | ~0,9620 (98,89 % retenido) | MIT | safetensors (no confirmado) |
| llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck | 307M | no disponible | 0,6942 | no disponible | no disponible |

No se dispone de informacion sobre otros clasificadores comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el modelo declara `language: en`; su uso con prompts en castellano u otros idiomas no esta validado.
- Clasificador binario: no genera texto ni razona; cualquier expectativa de respuesta generativa es un error de uso.
- Riesgo de error en prompts de frontera: el Macro-F1 en la franja Hard es 0,9335, lo que implica aproximadamente un 6,7 % de clasificaciones incorrectas en ese subconjunto.
- Los resultados de benchmarks estan declarados por el autor y no verificados de forma independiente (`verified: false`).
- Sesgos: no se documentan analisis de sesgo; el dataset se describe por topicos, formatos y personas, pero no se detalla su composicion demografica.
- Dependencia de umbral: el uso en produccion como guardrail requiere calibrar el umbral de confianza; una clasificacion erronea puede derivar en respuestas sin verificacion o en recuperaciones innecesarias.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia ni soporte por parte del autor.
- Sin datos sobre longitud de contexto maxima del encoder: la model card solo recomienda truncar a 128 tokens para esta tarea, lo que limita prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalyan-ks/Ammu-1.0-FactCheck-Need-base-ONNX-INT8
- Modelo base FP32: https://huggingface.co/kalyan-ks/Ammu-1.0-FactCheck-Need-base
- Dataset de entrenamiento: https://huggingface.co/datasets/kalyan-ks/fact-check-need-classification
- Baseline comparado: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
