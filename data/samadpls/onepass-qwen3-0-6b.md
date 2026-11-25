# samadpls/onepass-qwen3-0.6b

## Resumen

onepass 0.6B es un modelo de decisión tipada construido como un fine-tuning con LoRA de Qwen/Qwen3-0.6B. A diferencia de un modelo generativo convencional, no produce tokens: recibe un texto de estado y un conjunto de preguntas tipadas (sí/no, elección única o nivel en una escala) y devuelve, en un único forward pass, una distribución de probabilidad sobre todas las respuestas posibles de todas las preguntas simultáneamente. Al no generar texto libre, la salida no puede ser sintácticamente inválida, lo que elimina una clase entera de fallos en producción.

Lo desarrolla samadpls y se publica bajo licencia Apache 2.0, con pesos en safetensors (bf16 con el adaptador fusionado), adaptador PEFT separado y cuantizaciones GGUF para llama.cpp. El modelo tiene 596.049.920 parámetros y está entrenado exclusivamente con datos en inglés sobre una veintena de datasets abiertos (NLI, BoolQ, PAWS, Banking77, CLINC OOS, HelpSteer2, Civil Comments, GoEmotions, entre otros).

Su relevancia radica en el nicho: sustituye a un LLM generativo en tareas de clasificación y enrutamiento estructurado (triaje de tickets, extracción de decisiones en trazas de agentes, verificación de soporte de respuestas RAG) con una latencia de ~185 ms por caso en una GPU de portátil y un tamaño de 639 MB en 8 bits. Incluye una versión hermana de 1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA fusionado; cabeza de decisión tipada sobre el estado oculto |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B; el autor no la declara) |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF); adaptador PEFT en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador PEFT |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y le superpone un adaptador LoRA entrenado para una tarea concreta: dado un `state` (texto libre) y un diccionario de `questions` con tipos `noul` (sí/no), `choice` (elección entre opciones) y escala (`pick a level`), el modelo calcula logits sobre las etiquetas candidatas y los normaliza en probabilidades. No hay decodificación autoregresiva ni muestreo de tokens; la inferencia es un único forward pass que produce todas las respuestas a la vez. El autor denomina a este enfoque "system one" en la API (`/v1/systemone`).

El entrenamiento usa datos abiertos y nunca incluye el benchmark de evaluación. La lista de datasets cubre inferencia de lenguaje natural (MultiNLI, WANLI, UNLI), QA booleana (BoolQ), paráfrasis (PAWS), clasificación de intenciones (Banking77, CLINC OOS), temas (DBpedia14), moderación y emociones (Civil Comments, Hate Speech Offensive, GoEmotions, Measuring Hate Speech, BRIGHTER), preferencias (HelpSteer2), spam (SMS Spam Collection), verificación factual (VitaminC) y conjuntos sintéticos de decisiones tipadas (`typed-decisions-synth`, `sn92-specialists`, `procedural-typed-decisions`). No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta ni si hubo RLHF o DPO; el pipeline y el cuaderno de entrenamiento están en el repositorio GitHub del proyecto.

La innovación técnica principal es la calibración: el modelo no solo acierta la etiqueta, sino que produce probabilidades calibradas (ECE de 0.049 en el benchmark principal), lo que permite umbrales de confianza y abstención. El autor publica además métricas de deriva de calibración por cuantización (shift de 0.004 en Q8_0 y 0.030 en Q4_K_M frente a 16 bits).

## Capacidades

- Clasificación y decisión tipada: responde preguntas de sí/no, elección única y escala de niveles sobre un texto de entrada.
- Salida multi-pregunta en un solo paso: resuelve todas las preguntas del payload simultáneamente con una sola pasada.
- Probabilidades calibradas por respuesta, aptas para umbrales de confianza y abstención.
- Salida estructuralmente válida por construcción: al no generar tokens, no puede producir JSON malformado ni etiquetas fuera del catálogo.
- Enrutamiento y triaje: asignación a equipos o categorías (por ejemplo, `billing` vs `tech`).
- Evaluación de soporte factual: puede usarse para decidir si una respuesta está respaldada por el contexto (caso RAGTruth).
- Detección de emoción, toxicidad y spam, gracias a los datasets de moderación incluidos en el entrenamiento.
- No soporta tool calling generativo, agentes multi-paso ni razonamiento en cadena: es un clasificador, no un generador.
- Multilingüe: no; solo inglés declarado.

## Casos de uso

- Triaje de tickets de soporte: con un `state` que contenga el mensaje del cliente y preguntas del tipo `team` (billing, tech, etc.) y `refund` (sí/no), el modelo devuelve ambas probabilidades en una sola llamada de ~185 ms. El ejemplo de la model card muestra `refund=true` con 0.96 y `team=billing` con 0.98 para una queja por doble cobro.
- Enrutamiento en pipelines de agentes: dado un turno de conversación, decidir la siguiente acción o herramienta mediante preguntas de elección única, sin generar texto que luego haya que parsear.
- Verificación de respuestas RAG: comprobar si la respuesta generada está soportada por el contexto recuperado (tipo `noul`), usando la probabilidad como señal de abstención antes de mostrar la respuesta al usuario.
- Moderación de contenido: clasificar toxicidad, odio o emoción en comentarios con umbrales calibrados, aprovechando los datasets de Civil Comments, GoEmotions y Measuring Hate Speech.
- Extracción de decisiones en trazas de agentes: etiquetar pasos de una traza (¿se llamó a la herramienta correcta?, ¿se cumplió el objetivo?) para evaluación automática de agentes, uno de los workflows medidos en el benchmark (accuracy 0.564).
- Clasificación de intenciones en asistentes conversacionales: mapear el mensaje del usuario a una de las intenciones de un catálogo tipo Banking77 o CLINC OOS, con la ventaja de que la salida siempre pertenece al catálogo definido.
- Procesamiento de facturas y correo operativo: decidir campos booleanos y categóricos sobre documentos cortos (workflow "invoices" con accuracy 0.614 en el benchmark).
- Despliegue en local o edge: al caber en 639 MB (Q8_0) o 397 MB (Q4_K_M) y correr en llama.cpp, es viable en portátiles y entornos sin GPU dedicada.

## Benchmarks y rendimiento

Evaluado sobre el split de test de 400 casos (2.000 decisiones) de `LocalLLaMA/typed-decisions`, con las fórmulas del script oficial del benchmark:

| Modelo | Accuracy | KL from gold | Brier | ECE |
|---|---|---|---|---|
| Qwen3-0.6B sin fine-tuning | 0.311 | 0.888 | 0.428 | 0.306 |
| Frecuencias de etiqueta del train split (baseline sin entrada) | 0.481 | 0.327 | 0.181 | 0.036 |
| onepass 0.6B | 0.601 | 0.270 | 0.154 | 0.049 |

Desglose por tipo de pregunta y workflow:

| Categoría | Accuracy |
|---|---|
| Sí/no | 0.737 |
| Elección única | 0.518 |
| Nivel en escala | 0.561 |
| Trazas de agentes | 0.564 |
| Atención al cliente | 0.630 |
| Facturas | 0.614 |
| Incidentes de seguridad | 0.596 |

Conjuntos humanos held-out (nunca vistos en entrenamiento):

| Conjunto | Baseline mayoritaria | Antes → después |
|---|---|---|
| CondaQA (negación, sí/no) | 0.483 | 0.455 → 0.563 |
| Cosmos QA (sentido común, elección) | 0.260 | 0.282 → 0.373 |
| SummEval (calidad de resumen, escala) | 0.651 | 0.504 → 0.265 |
| RAGTruth (¿respuesta soportada?, sí/no) | 0.768 | 0.704 → 0.752 |

El autor reconoce que la accuracy es mixta (empeora en SummEval), pero las probabilidades mejoran en los cuatro conjuntos: el KL frente al gold cae en todos.

Rendimiento por cuantización (mediana en GPU de MacBook Pro M3 Pro, llama.cpp):

| Fichero | Tamaño | Accuracy | KL | Brier | ECE | Shift | Tiempo/caso |
|---|---|---|---|---|---|---|---|
| 16-bit (no subido) | 1.198 MB | 0.601 | 0.270 | 0.154 | 0.048 | — | 180 ms |
| Q8_0 | 639 MB | 0.605 | 0.270 | 0.154 | 0.054 | 0.004 | 185 ms |
| Q4_K_M | 397 MB | 0.603 | 0.268 | 0.153 | 0.064 | 0.030 | 191 ms |

## Requisitos de hardware

- VRAM estimada: ~1,2 GB en bf16 (safetensors), ~640 MB en Q8_0 y ~400 MB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta tiempos en una GPU integrada de MacBook Pro M3 Pro.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx en adelante), en iGPU Apple Silicon y en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (recomendado por el autor), runtime propio `onepass-serve` (servidor local con API `/v1/systemone` y página de demo), transformers con el `model.safetensors`, PEFT con el adaptador sobre Qwen3-0.6B. El repo incluye el tag `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: ~185 ms por caso en Q8_0 y ~191 ms en Q4_K_M (mediana, M3 Pro). El throughput no se publica, pero al ser un único forward pass por caso, el coste es proporcional al número de decisiones, no al número de tokens generados.
- Repo total: 2,3 GB (incluye todas las variantes de pesos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onepass 0.6B | 596 M | no disponible | Decisión tipada calibrada, un forward pass | Apache 2.0 | HF (safetensors, GGUF, PEFT) |
| onepass 1.7B (mismo autor) | no disponible | no disponible | Igual, mayor tamaño | Apache 2.0 | HF |
| Qwen3-0.6B base | 596 M | no disponible | Generación de texto | Apache 2.0 | HF |
| Baseline de frecuencias de etiqueta | 0 | — | Predicción sin entrada | — | Referencia del benchmark |

Frente a Qwen3-0.6B sin ajuste, onepass sube la accuracy de 0.311 a 0.601 y reduce el ECE de 0.306 a 0.049 en el benchmark de decisiones tipadas. Frente al baseline de frecuencias, mejora la accuracy (0.601 vs 0.481) y el KL (0.270 vs 0.327), aunque el baseline tiene mejor ECE (0.036 vs 0.049), lo que indica que onepass está bien calibrado pero no perfectamente. No se dispone de comparación con otros modelos de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: cualquier uso en castellano u otros idiomas carece de garantías; el autor declara únicamente `en`.
- No es un generador: no sirve para producir texto, código, resúmenes ni razonamiento en cadena; intentar usarlo así produce resultados sin sentido.
- Accuracy desigual: 0.518 en elección única y 0.561 en escalas, frente a 0.737 en sí/no; en SummEval el fine-tuning empeora la accuracy (0.504 → 0.265), aunque mejora la calibración.
- Riesgo de sesgo: entrenado con datasets de moderación y emoción (Civil Comments, Hate Speech Offensive, GoEmotions), puede heredar sesgos de anotación en la clasificación de toxicidad y emoción.
- Calibración dependiente de la cuantización: en Q4_K_M, respuestas individuales pueden desplazarse hasta 0.22; para umbrales de confianza estrictos se recomienda Q8_0 o bf16.
- Longitud de contexto no documentada: el autor no declara la ventana efectiva; estados largos pueden truncarse sin aviso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Proyecto muy reciente y con tracción mínima (0 descargas, 0 likes en el momento de la ficha): no hay validación externa ni comunidad que reporte fallos en producción.
- El benchmark principal es el mismo sobre el que se reportan todas las cifras; los conjuntos held-out muestran resultados mixtos, así que conviene validar en el dominio propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samadpls/onepass-qwen3-0.6b
- Versión 1.7B: https://huggingface.co/samadpls/onepass-qwen3-1.7b
- Repositorio GitHub (código, pipeline de datos y cuaderno de entrenamiento): https://github.com/samadpls/onepass
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Proyecto relacionado del hackathon: https://github.com/junaiddshaukat/finetune-anywhere
