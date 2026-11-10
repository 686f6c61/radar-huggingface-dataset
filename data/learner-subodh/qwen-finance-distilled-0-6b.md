# learner-subodh/qwen-finance-distilled-0.6b

## Resumen

`learner-subodh/qwen-finance-distilled-0.6b` es un ajuste fino experimental del modelo Qwen3-0.6B de Alibaba Cloud, orientado a razonamiento numerico financiero y a preguntas y respuestas ancladas a tablas (estilo FinQA y TAT-QA). Lo desarrolla el usuario de Hugging Face `learner-subodh` como parte de un estudio comparativo sobre distillation de conocimiento en modelos pequenos, con el objetivo declarado de comprobar si un estudiante de ~0,6B puede retener al menos el 90% del rendimiento de un profesor de mayor tamano (Qwen3-8B).

El modelo parte de la arquitectura Qwen3ForCausalLM (28 capas, hidden size 1024) y se entrena mediante QLoRA de 4 bits sobre trazas de calculo y respuestas estructuradas generadas por el profesor, con un formato de salida fijo `Calculation / Answer / Scale` y la etiqueta `NOT_ANSWERABLE` para informacion ausente. No se usan logits del profesor: es distillation black-box basada en respuestas, no en distribuciones.

Es relevante ahora porque documenta de forma transparente (hashes de dataset, recuentos de leakage, intervalos de confianza bootstrap) un resultado negativo util para la comunidad: el estudiante no alcanza el objetivo de retencion del 90%, con una retencion global medida del 52,5% (IC 95% 36,0-72,7). El modelo tiene 596.049.920 parametros reales, licencia Apache 2.0 y un peso de repositorio de 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso), 28 capas, hidden size 1024 |
| Parametros totales | 596.049.920 (~0,60B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_seq_len de 1024; la ventana del modelo base no se especifica en la informacion) |
| Tipos de cuantizacion | pesos publicados en fp16; entrenamiento con QLoRA 4-bit NF4; evaluacion del profesor en 4-bit NF4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con 28 capas y dimension oculta de 1024, cargado mediante `Qwen3ForCausalLM`. El checkpoint publicado son los pesos fp16 con el adaptador LoRA fusionado sobre `Qwen/Qwen3-0.6B` (revision `c1899de289a04d12100db370d81485cdf75e47ca`). Durante el entrenamiento se aplicaron 10.092.544 parametros entrenables con LoRA de r=16, alpha=32 y dropout 0,05.

El entrenamiento es distillation black-box basada en respuestas: el estudiante se ajusta sobre trazas de calculo concisas y respuestas estructuradas generadas por Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`), filtradas por rejection sampling determinista (solo se conservan las respuestas que parsean, cuya aritmetica evalua correctamente y cuya respuesta final coincide con el gold). Los datos combinan los splits oficiales de entrenamiento de FinQA y TAT-QA con tablas sinteticas generadas programaticamente. Se aplico deduplicacion exacta, eliminacion de near-duplicates con MinHash contra contextos de validacion y test, eliminacion de supervision contradictoria (18 en FinQA, 6 en TAT-QA) y enmascaramiento de perdida solo en la respuesta. La configuracion fue QLoRA 4-bit NF4, fp16 AMP, paged AdamW 8-bit, LR 1e-4, 2 epocas, batch efectivo 4, max_seq_len 1024, seed 42 y 247 filas de entrenamiento. El entrenamiento se ejecuto en una Tesla T4 con un pico de 3,62 GB de memoria GPU y 404,2 s en la sesion final.

## Capacidades

- Generacion de texto con razonamiento numerico financiero sobre documentos y tablas proporcionadas en el contexto.
- Resolucion de preguntas tipo FinQA y TAT-QA con formato de salida estructurado `Calculation / Answer / Scale`.
- Deteccion de informacion ausente mediante la etiqueta `NOT_ANSWERABLE`.
- Table QA: lectura de tablas financieras incluidas en el prompt para extraer cifras y operar con ellas.
- Trazas de calculo explicitas: el modelo emite los pasos aritmeticos antes de la respuesta final.
- Conversacional basico (tag `conversational`), aunque no validado para chat financiero general.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning general: no disponible; el multi-step se limita a la traza de calculo.
- Capacidades multilingues: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Extraccion y calculo sobre estados financieros en pipelines internos: dado un fragmento de tabla y una pregunta acotada (por ejemplo, variacion de margen entre dos periodos), el modelo devuelve la traza de calculo y la cifra final en el formato estructurado, lo que facilita el parseo posterior y la auditoria del resultado.
- Preprocesado de informes anuales para analistas: uso como primer paso para responder preguntas cerradas sobre tablas concretas antes de la revision humana, aprovechando la etiqueta `NOT_ANSWERABLE` para descartar preguntas fuera del documento.
- Generacion de datasets sinteticos de razonamiento financiero: el formato de salida fijo y las trazas de calculo sirven como plantilla para construir pares pregunta-respuesta verificables en tareas de evaluacion.
- Investigacion en distillation de modelos pequenos: el checkpoint y la metodologia documentada permiten reproducir el experimento y comparar variantes (M1-M4) con el mismo estudiante y configuracion QLoRA.
- Prototipado rapido en entornos con recursos limitados: con ~0,6B parametros cabe en GPUs de consumo y permite iterar sobre prompts y formatos de tabla sin coste de infraestructura elevado.
- Clasificacion de preguntas respondibles frente a no respondibles en documentacion financiera: la salida `NOT_ANSWERABLE` puede usarse como filtro previo en un sistema de atencion a consultas internas sobre tablas contables.
- Evaluacion de robustez numerica: banco de pruebas para medir donde falla un modelo pequeno en aritmetica financiera antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre submuestras de 50 items de test, decodificacion greedy y prompt identico. FinQA usa accuracy numerica determinista (no el script oficial de program-match); TAT-QA usa answer EM con scorer `approx_fallback`.

| Modelo | Benchmark | Metrica | Valor | n |
|---|---|---|---|---|
| M1 (Qwen3-0.6B base) | FinQA | numeric_acc | 0,000 | 50 |
| M1 (Qwen3-0.6B base) | TAT-QA | em | 0,000 | 50 |
| M5 (Qwen3-8B profesor, NF4) | FinQA | numeric_acc | 0,480 | 50 |
| M5 (Qwen3-8B profesor, NF4) | TAT-QA | em | 0,320 | 50 |
| M2 | FinQA | numeric_acc | 0,280 | 50 |
| M2 | TAT-QA | em | 0,400 | 50 |
| M3 | FinQA | numeric_acc | 0,240 | 50 |
| M3 | TAT-QA | em | 0,180 | 50 |
| M4 | FinQA | numeric_acc | 0,200 | 50 |
| M4 | TAT-QA | em | 0,180 | 50 |

Retencion relativa respecto al profesor (bootstrap pareado, 500 remuestreos):

| Modelo | Benchmark | Estudiante | Profesor | Retencion (%) | IC 95% | Gap absoluto |
|---|---|---|---|---|---|---|
| M2 | FinQA | 0,280 | 0,480 | 58,333 | 36,000-86,055 | 0,200 |
| M2 | TAT-QA | 0,400 | 0,320 | 125,000 | 86,957-189,472 | -0,080 |
| M2 | Global | - | - | 85,000 | 64,529-112,937 | - |
| M3 | FinQA | 0,240 | 0,480 | 50,000 | 27,273-76,193 | 0,240 |
| M3 | TAT-QA | 0,180 | 0,320 | 56,250 | 25,000-89,472 | 0,140 |
| M3 | Global | - | - | 52,500 | 35,999-72,727 | - |
| M4 | FinQA | 0,200 | 0,480 | 41,667 | 23,077-65,000 | 0,280 |
| M4 | TAT-QA | 0,180 | 0,320 | 56,250 | 25,000-92,308 | 0,140 |
| M4 | Global | - | - | 47,500 | 30,110-66,280 | - |

La retencion global medida es del 52,5% (IC 95% 36,0-72,7) para M3, y el objetivo de retencion del 90% no se alcanzo. La model card advierte explicitamente que la retencion relativa no equivale a capacidad absoluta y que deben leerse los scores absolutos. No hay resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2-1,5 GB para pesos, mas overhead de activaciones y cache KV; en la practica, por debajo de 4 GB en configuraciones razonables.
- Entrenamiento documentado: Tesla T4 con pico de 3,62 GB usando QLoRA 4-bit NF4, lo que da una referencia directa del consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el autor uso una T4. Una RTX 4090 o A100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas; tambien es viable en CPU con cuantizacion, aunque no hay datos publicados de rendimiento en ese escenario.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); el soporte para vLLM, llama.cpp u Ollama no esta documentado en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento financiero | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-finance-distilled-0.6b (M3) | ~0,60B | no disponible (entrenado a 1024) | FinQA 0,240; TAT-QA 0,180 | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-0.6B (base) | ~0,60B | no disponible en la informacion | FinQA 0,000; TAT-QA 0,000 | Apache 2.0 | Hugging Face, ampliamente disponible |
| Qwen/Qwen3-8B (profesor) | ~8B | no disponible en la informacion | FinQA 0,480; TAT-QA 0,320 (NF4) | Apache 2.0 | Hugging Face, ampliamente disponible |

La comparacion con otros modelos financieros especializados de tamano similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Objetivo de retencion no alcanzado: la retencion global medida es del 52,5% (IC 95% 36,0-72,7), lejos del 90% planteado; los scores absolutos son bajos (FinQA 0,240; TAT-QA 0,180 en M3).
- Evaluacion sobre submuestras de 50 items por benchmark, con metricas no oficiales (accuracy numerica determinista en FinQA y scorer `approx_fallback` en TAT-QA); los numeros no son directamente comparables con los del leaderboard oficial.
- Riesgo de alucinacion numerica: el modelo puede emitir cifras plausibles pero incorrectas, especialmente fuera del documento suministrado; la model card limita el uso a preguntas sobre tablas o texto aportados en el contexto.
- Fuera de alcance declarado: asesoramiento de inversion, prevision de precios, analisis de sentimiento, chat financiero general y cualquier decision sin verificacion humana.
- No validado para contextos externos al documento proporcionado; no hay informacion sobre sesgos, idiomas soportados ni comportamiento multilingue.
- Dataset de entrenamiento pequeno (247 filas tras filtrado), lo que limita la generalizacion y aumenta el riesgo de sobreajuste al formato de salida.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental, la falta de validacion en produccion y los resultados pobres desaconsejan su despliegue sin evaluacion propia.
- Actividad nula en Hugging Face (0 descargas, 0 likes) y creado en 2026-11-10; no hay evidencia de mantenimiento ni de comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner-subodh/qwen-finance-distilled-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
