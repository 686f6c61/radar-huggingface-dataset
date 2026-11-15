# HashNuke/barge-in-detector

## Resumen

HashNuke/barge-in-detector es un clasificador binario de texto derivado de intfloat/multilingual-e5-small (117,65 millones de parámetros, arquitectura BERT) y ajustado para una tarea conversacional muy concreta: decidir si una intervención del usuario mientras un agente de voz está hablando constituye un *barge-in* (interrupción que debe cederle el turno) o un *backchannel* (señal de escucha que permite al agente continuar). El modelo lo publica el desarrollador independiente HashNuke bajo licencia MIT y se distribuye en formato safetensors para `transformers`.

La relevancia del checkpoint es acotada y su propio autor la delimita con claridad: es un artefacto experimental, no apto para producción. Sobre un conjunto sintético de validación de 333 ejemplos alcanza un 99,4 % de exactitud, pero en un conjunto desafiante en inglés revisado por humanos cae al 73,5 % y deja pasar 25 de 30 interrupciones cortas, incluidas órdenes como «stop» o «wait». Las probabilidades no están calibradas y el umbral de decisión se delega al sistema en tiempo de ejecución.

El interés técnico reside en su eficiencia: clasifica en CPU con una latencia p50 de 13,1 ms para entradas típicas y 26,8 ms con el presupuesto completo de 64 tokens, con un RSS de proceso en caliente de aproximadamente 1.164 MiB. Es, por tanto, una pieza plausible para prototipos de agentes de voz multilingües (14 idiomas declarados), siempre que se asuma su alta tasa de falsos negativos en interrupciones cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), clasificación de secuencias |
| Parametros totales | 117.654.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (truncado recomendado en inferencia) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp32; ONNX/int8 sin medir) |
| Idiomas soportados | en, hi, kn, ta, te, ml, zh, ja, id, fil, fr, de, es, it |
| Licencia | MIT |
| Formato de pesos | safetensors (con config.json, tokenizer.json y tokenizer_config.json) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de intfloat/multilingual-e5-small, un encoder BERT multilingüe de 117,65 millones de parámetros con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). La entrada debe pasar previamente por el limpiador del dataset: minúsculas, puntuación eliminada y escrituras nativas opcionalmente mezcladas con inglés. No requiere contexto del agente, audio ni indicación de idioma, y se conservan los primeros 64 tokens del tokenizador. Las etiquetas son 0 = backchannel y 1 = barge_in.

El entrenamiento usó 2.640 filas sintéticas, 333 de validación y 331 de test, durante cinco épocas con batch 32, entropía cruzada ponderada, AdamW, tasa de aprendizaje 3e-5, 10 % de warm-up y semilla 20261115, en BF16 sobre una única RTX 5090. La época se seleccionó por macro F1 de validación (0,99324). El conjunto desafiante en inglés se redactó antes de la inferencia, fue revisado por el autor y reconciliado con la autorización; los splits sintéticos comparten criterios de generación y, aunque no hay filtración exacta de texto limpio, el autor señala que la fuga por plantilla y semántica no está auditada.

## Capacidades

- Clasificación binaria de enunciados cortos del usuario en dos clases: `backchannel` (el agente continúa) y `barge_in` (el agente cede el turno).
- Funcionamiento multilingüe declarado en 14 idiomas: inglés, hindi, kannada, tamil, telugu, malayo, chino, japonés, indonesio, filipino, francés, alemán, español e italiano.
- Inferencia en CPU sin GPU, con latencia de milisegundos y huella de memoria moderada.
- Salida de probabilidad (`p_barge_in`) mediante softmax sobre los logits, con umbral por defecto de 0,5 configurable en el runtime.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es exclusivamente un clasificador de texto.
- No procesa audio: requiere que el ASR y el limpiador de texto hayan producido la transcripción normalizada.

## Casos de uso

- Turn-taking en agentes de voz: el clasificador se invoca sobre la transcripción parcial del usuario mientras el agente habla para decidir si se detiene la síntesis de voz (barge_in) o se mantiene (backchannel). Su latencia p50 de 13,1 ms en CPU encaja en el bucle de decisión de un diálogo en tiempo real.
- Prototipado e investigación en interacción conversacional: permite experimentar con políticas de cesión de turno y medir el impacto de distintos umbrales sin depender de infraestructura GPU.
- Filtrado de falsas interrupciones en sistemas de dictado o asistentes domésticos: los murmullos de asentimiento («mmm», «ya», «ok») se clasifican como backchannel y evitan cortes innecesarios de la respuesta del agente.
- Evaluación comparativa de pipelines ASR: al recibir texto limpio, sirve para medir cuánto degrada la transcripción automática la detección de interrupciones frente a transcripciones de referencia.
- Despliegue en entornos con recursos limitados: con unos 1.164 MiB de RSS en caliente y sin GPU, puede ejecutarse en una VM de cuatro vCPU junto al resto del stack del agente.
- Investigación multilingüe: permite obtener una primera señal de clasificación en 14 idiomas, útil como línea base antes de entrenar variantes específicas por idioma con datos humanos verificados.

## Benchmarks y rendimiento

| Evaluación | Exactitud | Interrupciones perdidas | Falsas interrupciones |
|---|---|---|---|
| Validación sintética (333) | 99,4 % | 0,45 % | 0,90 % |
| Test sintético (331) | 100 % | 0 % | 0 % |
| Desafío en inglés revisado (98) | 73,5 % | 54,2 % | 0 % |
| Desafío no visto en ningún split sintético (93) | 72,0 % | 54,2 % | 0 % |

Latencia en CPU (VM AMD EPYC Genoa de cuatro vCPU, PyTorch 2.15.0+cpu fp32, cuatro hilos, batch uno, 100 calentamientos y 1.000 llamadas medidas por escenario):

| Escenario | p50 | p95 | p99 |
|---|---|---|---|
| Texto típico de test multilingüe | 13,1 ms | 19,4 ms | 25,3 ms |
| Presupuesto completo de 64 tokens | 26,8 ms | 33,3 ms | 37,9 ms |

Arranque en frío del proceso Python hasta la primera etiqueta: mediana de 4,22 s (rango 3,85–4,81 s en diez ejecuciones), incluyendo importaciones y carga local del modelo y del tokenizador. El autor advierte que los resultados sintéticos no establecen exactitud representativa en el mundo real y que la exactitud verificada por humanos en los 14 idiomas no está establecida.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el checkpoint fp32 de 117,65 millones de parámetros ocupa aproximadamente 0,5 GB de pesos, por lo que cabría en cualquier GPU consumer con 2 GB o más (dato de VRAM no publicado explícitamente).
- GPU recomendadas: no hay requisitos publicados para inferencia; el entrenamiento se realizó en una única RTX 5090 en BF16. El autor sugiere alquilar una RTX 5090 de centro de datos por debajo de 0,65 USD/hora solo para entrenamiento.
- Cabe en GPU consumer: sí, por tamaño de pesos; el modelo está diseñado para ejecutarse en CPU.
- Opciones de despliegue: `transformers` con `AutoTokenizer` y `AutoModelForSequenceClassification`; el repo incluye módulos propios (`barge_in_detector_model.infer`, `train`, `evaluate`) gestionados con `uv`. Los tags indican compatibilidad con text-embeddings-inference y endpoints, aunque no se documenta un despliegue específico. ONNX e int8 no están medidos.
- Latencia y throughput: p50 de 13,1 ms y p99 de 25,3 ms para entradas típicas en CPU; p50 de 26,8 ms y p99 de 37,9 ms con 64 tokens. El throughput no se publica.
- Memoria: RSS máximo del proceso en caliente de aproximadamente 1.164 MiB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HashNuke/barge-in-detector | 117,65 M | 64 tokens | Clasificación barge-in / backchannel | MIT | Hugging Face |
| intfloat/multilingual-e5-small (modelo base) | 117,65 M | 512 tokens (típico de e5-small) | Embeddings multilingües | MIT | Hugging Face |
| Clasificadores de turn-taking comerciales | no disponible | no disponible | Detección de fin de turno / interrupción | propietaria | APIs comerciales |

No se dispone de benchmarks públicos comparables de otros clasificadores de barge-in en la información proporcionada; la comparación con el modelo base es estructural (mismo encoder y tamaño), no de rendimiento en la tarea.

## Limitaciones y advertencias

- No apto para producción según su propio autor: pierde 25 de 30 interrupciones cortas en inglés del conjunto desafiante, incluidas «stop» y «wait», con una tasa de interrupciones perdidas del 54,2 % en ese conjunto.
- Probabilidades no calibradas: el umbral debe fijarse y ajustarse en el sistema en tiempo de ejecución, no en el modelo.
- Sesgo de evaluación: los resultados del 99,4 % y 100 % provienen de splits sintéticos con criterios de generación compartidos; la fuga por plantilla y semántica no está auditada y no se ha establecido exactitud representativa en el mundo real.
- Cobertura lingüística desigual: los 14 idiomas solo tienen resultados sintéticos; no hay exactitud verificada por humanos en ninguno de ellos.
- Contexto muy corto: 64 tokens, suficiente para enunciados breves pero inadecuado para intervenciones largas o con contexto conversacional.
- Requiere preprocesado estricto (minúsculas, sin puntuación); desviarse del limpiador del dataset puede degradar la clasificación.
- No procesa audio ni contexto del agente: la calidad depende por completo del ASR y del pipeline previo.
- Licencia MIT: permite uso comercial y modificación, pero el aviso de no estar listo para producción traslada al integrador la responsabilidad sobre los fallos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza aparente por falta de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HashNuke/barge-in-detector
- Dataset: https://huggingface.co/datasets/HashNuke/barge-in-detector-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
