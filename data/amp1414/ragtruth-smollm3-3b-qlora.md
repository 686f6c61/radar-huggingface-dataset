# amp1414/ragtruth-smollm3-3b-qlora

## Resumen

RAGTruth SmolLM3-3B QLoRA es un adaptador LoRA (no un modelo independiente) publicado por el usuario amp1414 sobre el backbone instruido HuggingFaceTB/SmolLM3-3B. Su funcion es actuar como verificador de groundedness en sistemas RAG: recibe una pregunta, los pasajes de evidencia recuperados y una respuesta candidata, y emite una etiqueta binaria (`SUPPORTED` o `UNSUPPORTED`) que indica si la respuesta esta respaldada por la evidencia proporcionada. Resuelve el problema de la deteccion de alucinaciones a nivel de respuesta en pipelines de generacion aumentada por recuperacion.

El adaptador se entrena con SFT sobre QLoRA (cuantizacion 4-bit NF4 con doble cuantizacion y computo en BF16) empleando exclusivamente la particion de question-answering del dataset RAGTruth. Entrena 15.114.240 parametros (~0,489% de los 3.090.212.864 del backbone) con rango LoRA 8 y alpha 16, en una sola epoca y 516 pasos de optimizador. El resultado es un clasificador especializado, no un modelo de chat mejorado ni un verificador de hechos independiente.

Su relevancia practica esta en que ofrece una etapa de filtrado barata (adaptador de 0,1 GB sobre un backbone de 3B) que en la evaluacion held-out del autor eleva el macro-F1 de 0,5336 a 0,8292 y la precision de la clase `UNSUPPORTED` de 26,47% a 70,91% frente al mismo backbone sin adaptador. El modelo esta pensado como etapa de senalizacion previa a revision humana, no como sustituto de la misma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder SmolLM3-3B instruido |
| Parametros totales | 15.114.240 en el adaptador; 3.090.212.864 en el backbone |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; entrenamiento con ejemplos de hasta 1.152 tokens sin truncado ni packing |
| Tipos de cuantizacion | backbone en 4-bit NF4 con doble cuantizacion y computo BF16; adaptador en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |
| Libreria | peft |
| Tamano del repo | 0,1 GB |
| Backbone | HuggingFaceTB/SmolLM3-3B (instruido, revision `b49c77130b3407155d9b83b404d9b28b5d1845ae`) |
| Dataset | ParticleMedia/RAGTruth, solo tarea QA (revision `c103204b9ce28d6bbad859304bf30de72b8ed8fe`) |
| Metodo de entrenamiento | SFT con QLoRA/PEFT |
| Rango / alpha / dropout LoRA | 8 / 16 / 0,05 |
| Modulos objetivo | `all-linear`, sin bias entrenable |
| Epocas / pasos | 1 / 516 |
| Optimizador / scheduler | AdamW / cosine, lr 2e-4, warmup 3% |
| Batch fisico / acumulacion | 1 / 8 (efectivo ~8) |
| Semilla | 42 |
| Hardware de entrenamiento | GeForce RTX 4070 Laptop GPU (8 GB VRAM) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM3-3B, un transformer decoder instruido, congelando todos los pesos del backbone y actualizando unicamente los parametros LoRA insertados en todas las capas lineales (`all-linear`), sin bias entrenable. El backbone se cuantiza en 4-bit NF4 con doble cuantizacion y el computo se realiza en BF16. El entrenamiento es SFT supervisado con la perdida calculada exclusivamente sobre los tokens de la etiqueta de salida (los tokens de pregunta, evidencia y prompt estan enmascarados), usando la plantilla de chat de SmolLM3 con `enable_thinking=False` y una longitud maxima de 1.152 tokens por ejemplo, sin truncado ni packing.

Los datos provienen de la particion QA de RAGTruth: 4.122 respuestas de calidad `good` para entrenamiento (2.837 `SUPPORTED` / 1.285 `UNSUPPORTED`, sin remuestreo ni pesos de clase) y 729 para validacion. La particion original de train se subdividio por fuente de evidencia para evitar fugas entre train y validacion, y una revision de solapamiento excluyo siete grupos de fuentes potencialmente solapados; el conjunto de test oficial de 900 respuestas se mantuvo intacto. La etiqueta se asigna a nivel de respuesta: cualquier span anotado como alucinacion en RAGTruth convierte la respuesta en `UNSUPPORTED`. No se aplicaron correcciones manuales de etiquetas tras la auditoria.

## Capacidades

- Clasificacion binaria de groundedness a nivel de respuesta: emite `SUPPORTED` o `UNSUPPORTED` para una respuesta dada una pregunta y los pasajes de evidencia.
- Deteccion de alucinaciones respecto a la evidencia proporcionada (no respecto a conocimiento externo).
- Manejo de respuestas con mezcla de afirmaciones: si contiene al menos un span no soportado, la etiqueta resultante es `UNSUPPORTED`.
- Tratamiento de no-respuestas o rechazos: pueden recibir `SUPPORTED` segun la politica de anotacion del dataset.
- Generacion de texto restringida en la practica a una etiqueta corta (evaluacion con `max_new_tokens=12` y decodificacion greedy).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles (`en`).
- Modo thinking: desactivado explicitamente en entrenamiento (`enable_thinking=False`).

## Casos de uso

- Etapa de filtrado en pipelines RAG: tras generar una respuesta, el sistema invoca al adaptador con la pregunta, los documentos recuperados y la respuesta; si devuelve `UNSUPPORTED`, se marca para revision o se regenera. Adecuado por su bajo coste (adaptador de 0,1 GB) y su precision de 70,91% en la clase no soportada.
- Revision humana asistida en dominios de alto riesgo: el adaptador actua como primera pasada que prioriza que respuestas revisar, reduciendo el volumen de revision manual sin sustituirla.
- Monitorizacion de calidad en produccion: registrar la tasa de `UNSUPPORTED` por consulta y por fuente de evidencia permite detectar documentos problematicos o consultas donde el recuperador falla.
- Control de regresiones en cambios de recuperador o de generador: usar el adaptador como metrica automatica de groundedness antes y despues de modificar el sistema RAG.
- Evaluacion de datasets sinteticos de QA: filtrar pares pregunta-respuesta generados automaticamente que no esten respaldados por las fuentes citadas.
- Enrutado de respuestas: enviar las respuestas `SUPPORTED` directamente al usuario y derivar las `UNSUPPORTED` a un flujo con busqueda adicional o aclaracion.
- Investigacion sobre alucinacion: servir como linea base reproducible sobre RAGTruth QA con particion held-out documentada y control sin adaptador comparable.

## Benchmarks y rendimiento

Evaluacion held-out del autor sobre las 900 respuestas originales del test oficial de QA de RAGTruth (740 `SUPPORTED`, 160 `UNSUPPORTED`), con decodificacion greedy y `max_new_tokens=12`:

| Metrica | Backbone NF4 sin adaptador | Backbone NF4 + adaptador QLoRA |
|---|---:|---:|
| Macro-F1 | 0,5336 | 0,8292 |
| Precision (accuracy) | 76,33% | 89,89% |
| Precision clase `UNSUPPORTED` | 26,47% | 70,91% |
| Recall clase `UNSUPPORTED` | 16,88% | 73,13% |
| F1 clase `UNSUPPORTED` | 0,2061 | 0,7200 |
| Generaciones invalidas | 5 / 900 | 0 / 900 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone SmolLM3-3B en 4-bit NF4 ocupa aproximadamente 2 GB de pesos; con overhead de contexto y activaciones, el adaptador se entreno en una GPU de 8 GB (RTX 4070 Laptop), lo que sirve como cota superior practica para inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para el backbone cuantizado en 4-bit; A100, H100 o L40S para despliegue en BF16 sin cuantizar.
- Cabe en GPU consumer: si, en tarjetas de 8 GB como la RTX 4070 Laptop empleada en el entrenamiento, y previsiblemente en modelos con 6 GB o mas usando cuantizacion 4-bit.
- Opciones de despliegue: PEFT sobre transformers (carga del backbone mas `PeftModel`), vLLM con soporte de adaptadores LoRA, TGI con adaptadores; llama.cpp/Ollama requeririan conversion del adaptador a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion se limita a 12 tokens nuevos, lo que reduce el coste por inferencia frente a una generacion abierta.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros adaptadores o modelos de deteccion de alucinaciones (por ejemplo, clasificadores especificos sobre RAGTruth). La unica comparacion disponible es contra el mismo backbone sin adaptador:

| Modelo | Parametros entrenables | Contexto de entrenamiento | Macro-F1 (RAGTruth QA test) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| RAGTruth SmolLM3-3B QLoRA | 15.114.240 | 1.152 tokens | 0,8292 | apache-2.0 | Hugging Face (adaptador) |
| SmolLM3-3B NF4 sin adaptador (control) | 0 | 1.152 tokens | 0,5336 | apache-2.0 | Hugging Face (backbone) |

## Limitaciones y advertencias

- No es un modelo independiente: requiere cargar el backbone instruido SmolLM3-3B (no la variante Base) y aplicar el adaptador con PEFT.
- Verifica soporte respecto a la evidencia proporcionada, no veracidad absoluta: una respuesta puede ser cierta y aun asi recibir `UNSUPPORTED` si la evidencia no la respalda, y viceversa.
- Prediccion a nivel de respuesta, no de span: no localiza que fragmento concreto es la alucinacion.
- Politica de anotacion del dataset: un rechazo o no-respuesta puede etiquetarse como `SUPPORTED`, lo que puede no alinearse con las necesidades de un producto concreto.
- Desbalance de clases en entrenamiento (2.837 frente a 1.285) sin remuestreo ni pesos de clase; el recall de la clase minoritaria en test es 73,13%, con un 26,87% de casos no soportados que se escapan.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinacion del propio verificador: las generaciones invalidas fueron 0 en la evaluacion, pero el modelo genera texto libre y podria producir salidas fuera de las dos etiquetas en entradas fuera de distribucion.
- Fugas de datos: la revision por solapamiento de fuentes reduce el riesgo pero no demuestra la eliminacion total de solapamiento semantico.
- Uso comercial: la licencia apache-2.0 del adaptador lo permite, pero debe verificarse la licencia del backbone SmolLM3-3B y del dataset RAGTruth para el caso de uso concreto.
- No apto como sustituto de revision humana en aplicaciones de alto riesgo; el autor lo recomienda explicitamente como etapa de senalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amp1414/ragtruth-smollm3-3b-qlora
- Backbone: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset RAGTruth (repositorio): https://github.com/ParticleMedia/RAGTruth
- Paper de referencia citado en los tags: https://arxiv.org/abs/2401.00396
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
