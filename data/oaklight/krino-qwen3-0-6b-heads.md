# oaklight/krino-qwen3-0.6b-heads

## Resumen

Krino Adapter: Qwen3-0.6B (identificador `oaklight/krino-qwen3-0.6b-heads`) es un conjunto de cabezas de decision ligeras entrenadas sobre un backbone Qwen3-0.6B congelado. No genera texto: produce decisiones tipadas y calibradas con tres formatos de salida posibles (noul o binaria si/no, choice o seleccion entre opciones, y score o valor escalar). Lo desarrolla el usuario oaklight dentro del proyecto Krino, bajo licencia MIT.

La propuesta tecnica es inusual: en lugar de afinar un modelo generativo para que emita etiquetas en lenguaje natural, se mantiene intacto el backbone y se anaden 402.000 parametros entrenables (rank 64, mediante cabezas de atencion cruzada) sobre los estados ocultos de un modelo de 596 millones de parametros. El resultado es un clasificador muy compacto que reutiliza el conocimiento del Qwen3-0.6B original.

Su relevancia actual es de nicho pero clara para quien necesita decisiones estructuradas (no texto libre) con un coste de entrenamiento minimo y un footprint de parametros muy bajo. El autor reporta un 57,4 % de precision agregada sobre 19 benchmarks de NLU, con un rendimiento desigual segun la tarea: sobresale en clasificacion de noticias, inferencia y sentimiento, y falla en tareas de razonamiento mas complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen3) congelado + cabezas de decision ligeras (linear+sigmoid para Noul, cross-attention+softmax para Choice, cross-attention+valor esperado para Score) |
| Parametros totales | ~596,4 M (596 M del backbone congelado + 402 K entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,0 GB, lo que sugiere que contiene unicamente las cabezas y no el backbone completo) |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3-0.6B congelado, de arquitectura transformer decoder causal, con tres cabezas entrenables de rango 64 que consumen los estados ocultos del backbone. Cada cabeza implementa un tipo de decision distinto: NoulHead aplica una capa lineal seguida de sigmoide para producir P(yes); ChoiceHead aplica atencion cruzada y softmax para producir P(option_k); y ScoreHead aplica atencion cruzada seguida de un valor esperado para emitir una puntuacion continua. En total, solo 402.000 parametros son entrenables sobre los 596 millones del backbone.

El entrenamiento es multi-tarea sobre 19 benchmarks de NLU, con muestreo equilibrado por tipo de decision (type-balanced sampling) y 20 epocas. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. La innovacion principal es precisamente la separacion entre representacion (backbone congelado) y decision (cabezas entrenables), lo que reduce drasticamente el coste de adaptacion frente al afinado completo.

## Capacidades

- Clasificacion de texto con opciones mutuamente excluyentes (tipo choice), por ejemplo clasificacion de noticias o de intenciones.
- Decisiones binarias tipo si/no (tipo noul), como inferencia de lenguaje natural o verificacion de afirmaciones.
- Puntuacion escalar (tipo score), aplicable a tareas de regresion semantica y valoracion de calidad.
- Salida de decisiones tipadas y calibradas en lugar de texto generado.
- Clasificacion de fragmentos de codigo (benchmark codesearchnet).
- Analisis de sentimiento binario y de cinco clases (sst2, yelp, sst5).
- Verificacion de tablas y hechos (tabfact, fever).
- Revision de contratos (contractnli).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo esta etiquetado unicamente como ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: el modelo obtiene un 71,2 % en banking77, por lo que puede enrutar mensajes de usuario a la intencion correcta (seguimiento de pedido, cancelacion, incidencia) dentro de un flujo de soporte automatizado.
- Triaje y enrutado de tickets: con la salida tipo choice se pueden definir las categorias como opciones y obtener una distribucion de probabilidad para decidir a que cola derivar cada ticket.
- Analisis de sentimiento en resenas: los resultados en sst2 (76,6 %) y yelp (56,8 %) permiten puntuar opiniones de producto o servicio y agregar senales de calidad.
- Verificacion de hechos y afirmaciones: la salida tipo noul, con 58,0 % en fever, sirve como componente de filtrado previo en pipelines de fact-checking donde se necesita una decision rapida y barata.
- Deduplicacion e inferencia de pares de frases: mnli (82,2 %) y mednli (79,4 %) permiten detectar contradicciones o equivalencias semanticas en corpus documentales.
- Clasificacion de codigo: codesearchnet (63,3 %) posibilita etiquetar fragmentos de codigo por lenguaje o por tipo de contenido en herramientas de analisis estatico o indexacion.
- Revision automatizada de contratos: contractnli (61,8 %) permite comprobar si un contrato cumple o contradice clausulas predefinidas.
- Puntuacion de riesgo o calidad (tipo score): con stsb (26,8 %) y sst5 (54,2 %) puede emitir una nota escalar, util como senal auxiliar de moderacion o priorizacion, siempre con supervision humana por la baja precision en esta modalidad.

## Benchmarks y rendimiento

Precision agregada por tipo de decision:

| Tipo | Precision |
|---|---|
| Choice | 51,9 % |
| Noul | 70,4 % |
| Score | 46,6 % |
| Agregado | 57,4 % |

Resultados por benchmark:

| Benchmark | Tipo | Precision |
|---|---|---|
| agnews | choice | 88,2 % |
| mnli | noul | 82,2 % |
| mednli | noul | 79,4 % |
| sst2 | noul | 76,6 % |
| multirc | noul | 71,6 % |
| banking77 | choice | 71,2 % |
| codesearchnet | choice | 63,3 % |
| contractnli | noul | 61,8 % |
| fever | choice | 58,0 % |
| yelp | score | 56,8 % |
| typed_decisions | choice | 56,4 % |
| sst5 | score | 54,2 % |
| tabfact | noul | 52,0 % |
| swag | choice | 41,0 % |
| arc | choice | 37,0 % |
| hellaswag | choice | 35,4 % |
| race | choice | 27,8 % |
| stsb | score | 26,8 % |

Nota: la model card afirma que el modelo se entrena sobre 19 benchmarks, pero solo lista 18 filas de resultados por benchmark; no se detalla cual falta. No se proporcionan numeros de comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano del backbone; no confirmada por el autor): ~2,4 GB en fp32, ~1,2 GB en fp16/bf16, ~0,6 GB en int8 y ~0,3-0,4 GB en int4. Las cabezas (402 K parametros) anaden un consumo despreciable.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 cubren el modelo con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU o en dispositivos integrados.
- Opciones de despliegue: la libreria Python `krino` mediante `KrinoModel.from_pretrained(...)`; el backbone puede cargarse con Transformers de HuggingFace o PyTorch. Los frameworks orientados a generacion de texto (vLLM, llama.cpp, Ollama, TGI) no son directamente aplicables porque el modelo no emite tokens de texto; no se documentan integraciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos comparables en la informacion proporcionada. Como referencia de la misma familia, el autor publica `oaklight/krino-qwen3.5-4b-heads`, una variante del mismo enfoque construida sobre un backbone mayor, pero no se aportan numeros de rendimiento para ella.

| Modelo | Backbone | Parametros entrenables | Licencia | Benchmarks |
|---|---|---|---|---|
| krino-qwen3-0.6b-heads | Qwen3-0.6B (596 M) | 402 K | MIT | 57,4 % agregado, 18 benchmarks listados |
| krino-qwen3.5-4b-heads | Qwen3.5-4B (tamano no detallado) | no disponible | MIT | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: solo produce decisiones tipadas, por lo que no sirve para tareas de generacion, resumen o dialogo.
- Precision agregada modesta (57,4 %) y muy desigual por tarea; en razonamiento de sentido comun (hellaswag 35,4 %, arc 37,0 %) y comprension lectora (race 27,8 %) los resultados estan cerca de lo aleatorio.
- La modalidad de puntuacion (score) es la mas debil, con 46,6 % de media y un 26,8 % en stsb, lo que desaconseja su uso sin supervision en tareas de regresion semantica.
- Solo idioma ingles; no hay soporte multilingue declarado, por lo que su uso en castellano no esta validado.
- No se documentan datos de entrenamiento, composicion del dataset ni procesos de alineacion, lo que dificulta evaluar sesgos. El riesgo de sesgos heredados del backbone Qwen3-0.6B queda sin cuantificar.
- Al ser un clasificador, el riesgo de alucinacion en el sentido generativo no aplica, pero si existe el riesgo de producir una decision confiada e incorrecta sobre entradas fuera de distribucion.
- La licencia es MIT, permisiva para uso comercial, pero se desconoce la licencia y las condiciones del backbone subyacente (Qwen3-0.6B), que conviene revisar por separado.
- El repositorio ocupa 0,0 GB y la model card no indica el formato de pesos; es probable que solo contenga las cabezas y requiera descargar el backbone aparte, pero esto no esta confirmado.
- No se documenta compatibilidad con herramientas de inferencia estandar para clasificacion tipo ONNX o TensorRT.
- No hay resultados de benchmarks frente a clasificadores dedicados como BERT o DeBERTa en las mismas tareas, lo que impide situar su rendimiento relativo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/oaklight/krino-qwen3-0.6b-heads
- Backbone Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3 Technical Report: https://arxiv.org/html/2505.09388v1
- Variante de mayor tamano del mismo autor: https://huggingface.co/oaklight/krino-qwen3.5-4b-heads
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
- Repositorio de Qualcomm AI Hub Models (Qwen3-0.6B): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_0_6b/README.md
- Paper del proyecto Krino: no disponible.
