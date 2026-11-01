# pedrojb04/triunfo

## Resumen

Triunfo es un adaptador LoRA de tipo PEFT publicado por el usuario pedrojb04 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su proposito concreto es transformar peticiones en lenguaje natural en llamadas a funciones (tool calling), seleccionando la herramienta adecuada de una lista proporcionada y rellenando sus argumentos con los datos extraidos del enunciado. El adaptador se entrena con supervisión sobre el dataset sintetico ToolACE y produce una salida en formato `[tool_name(argument=value)]`, con valores en sintaxis literal de Python.

El modelo resuelve un problema acotado pero relevante en el desarrollo de agentes: la capa de enrutamiento entre la intencion del usuario y la ejecucion de funciones en un backend. Con solo 1.5B parametros en el modelo base y 4.358.144 parametros entrenables en el adaptador, el coste de despliegue es muy bajo, lo que lo hace atractivo para prototipos de asistentes con tool calling en entornos con GPU modestas.

La relevancia actual del proyecto reside en su enfoque metodologico: el autor documenta un protocolo de evaluacion fijado antes del test, con splits agrupados por peticion normalizada y conjunto de herramientas, y reporta ganancias medibles frente al modelo base sin adaptador. No obstante, se trata de un experimento de investigacion con 16 descargas, sin publicacion de benchmarks estandar (BFCL, MMLU, HumanEval) y con limitaciones explicitas en el propio model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible (modelo base: 1.5B; adaptador: 4.358.144 entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en entrenamiento (modelo base soporta mas, no especificado en la ficha) |
| Tipos de cuantizacion | No disponible (entrenado en float16 sin cuantizacion; el adaptador se publica en safetensors) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + tokenizer |
| Rank LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj |
| Dataset de entrenamiento | Team-ACE/ToolACE (revision 6bda777c88d21e5a204703c1ee45597a8fa4f734) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (revision 989aa7980e4cf806f80c7fef2b1adb7bc71aa306) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.5B parametros con atencion de tipo causal estandar. La intervencion LoRA se limita a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) con rank 16, alpha 32 y dropout 0,05, lo que anade 4.358.144 parametros entrenables sobre los pesos congelados del modelo base. El adaptador requiere los pesos originales de Qwen para funcionar y no es un modelo autonomo.

El entrenamiento se realizo sobre un recorte de 5.586 ejemplos del dataset ToolACE, divididos en 4.469 de entrenamiento, 559 de validacion y 558 de test con semilla 42. El agrupamiento garantiza que la misma peticion normalizada o el mismo conjunto de descripciones de herramientas permanezcan en el mismo split, aunque herramientas individuales y parafrasis pueden reaparecer entre splits, por lo que no constituye una evaluacion sobre APIs ineditas. Se entreno una epoca con 559 actualizaciones, batch fisico 1, acumulacion de gradiente 8, optimizador AdamW, learning rate 0,0001, 28 pasos de calentamiento y reduccion lineal. La supervisión se aplico solo sobre la respuesta y el token de cierre de chat, con contexto de 2.048 tokens sin truncar ejemplos (maximo observado de 1.711). El entrenamiento se ejecuto en una GPU T4 con precision mixta float16, adaptadores en float32 y sin cuantizacion, con un pico de memoria asignada de 6,02 GiB y aproximadamente 35 minutos de duracion.

## Capacidades

- Tool calling: recibe una peticion del usuario y una lista de funciones con descripciones y parametros, y genera una unica llamada en formato `[tool_name(argument=value)]`.
- Seleccion de herramienta: identifica la funcion adecuada entre las disponibles y descarta las irrelevantes en el caso evaluado.
- Extraccion de argumentos: rellena los parametros con valores en sintaxis literal de Python, respetando tipos como float, string o boolean.
- Manejo de nombres de herramientas con espacios o puntos, copiandolos literalmente.
- Generacion de respuestas de aclaracion o rechazo cuando falta informacion o ninguna herramienta cubre la peticion (comportamiento presente en entrenamiento pero no garantizado segun el autor).
- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de conversaciones multi-turno a traves del chat template de Qwen2.5.
- No se documentan capacidades de vision, audio, razonamiento extendido ni modo thinking.

## Casos de uso

- Enrutamiento de funciones en asistentes conversacionales: el adaptador recibe la peticion del usuario y el catalogo de funciones del backend, y devuelve la llamada concreta que la aplicacion debe validar y ejecutar. Es adecuado por su bajo coste de inferencia y su formato de salida parseable.
- Prototipado rapido de agentes con tool calling: al ser un adaptador LoRA de 4,3M parametros sobre un modelo de 1,5B, permite iterar en local o en una GPU T4 sin infraestructura dedicada.
- Extraccion estructurada de parametros desde texto libre: por ejemplo, convertir "compre una chaqueta por 120 dolares con un 25% de descuento" en `[calculate_discount_amount(price=120.0, discount_percentage=25.0)]` para su uso en pipelines de calculo.
- Automatizacion de consultas a APIs internas: el modelo selecciona entre funciones de consulta de inventario, estado de pedidos o calculo de precios, siempre que la aplicacion valide la salida antes de ejecutar.
- Educacion e investigacion sobre fine-tuning: el repositorio incluye `experiment_config.json` y `evaluation_results.json`, lo que facilita reproducir el experimento y estudiar el efecto de LoRA sobre tool calling en modelos pequenos.
- Filtrado y clasificacion de intenciones en sistemas de ticketing: el modelo puede mapear una solicitud a una funcion de creacion, consulta o escalado, con la ventaja de que la salida es directamente interpretable por un lector automatico.
- Evaluacion comparativa de tecnicas de SFT: sirve como referencia para medir la mejora de un adaptador LoRA frente al modelo base en tareas de function calling con el mismo protocolo.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test reservado (558 ejemplos, de los cuales 444 son llamadas unicas):

| Metrica (444 llamadas) | Modelo original | LoRA Triunfo |
|---|---:|---:|
| Llamada interpretable por el lector | 254/444 — 57,21% | 416/444 — 93,69% |
| Herramienta correcta | 251/444 — 56,53% | 412/444 — 92,79% |
| Herramienta y argumentos iguales a la referencia | 173/444 — 38,96% | 280/444 — 63,06% |

El autor reporta una ganancia de 24,10 puntos porcentuales en correspondencia exacta, con 128 ejemplos corregidos y 21 regresiones. En validacion (430 llamadas), la correspondencia exacta paso de 36,28% a 63,49%. El protocolo se fijo antes del test, sin reentrenamiento ni seleccion de checkpoint por resultado de test. La metrica compara valores JSON estrictos ignorando el orden de claves, distingue `120` de `120.0`, no ejecuta herramientas y no mide equivalencia funcional. Los 114 ejemplos restantes del test (respuestas en otro formato) recibieron generaciones y observaciones sin nota semantica automatica. El autor advierte explicitamente que no se trata de un resultado BFCL.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-1.5B-Instruct en float16 ocupa aproximadamente 3 GB de pesos; el adaptador anade unos 17 MB en float32. Con overhead de activaciones y cache KV, se estima un uso de 4-6 GB en float16 para contextos moderados.
- VRAM de entrenamiento observada: pico de 6,02 GiB en una T4 con precision mixta float16 y adaptadores float32, sin cuantizacion.
- GPU recomendadas: NVIDIA T4 (validada por el autor), RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100. Cabe en practicamente cualquier GPU consumer con al menos 6 GB de VRAM en float16.
- Despliegue: compatible con Transformers + PEFT, vLLM (previa fusion del adaptador con el modelo base), llama.cpp y Ollama (requieren conversion a GGUF tras fusionar el adaptador), y TGI. El autor documenta el flujo con Transformers, PEFT y Accelerate.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triunfo (pedrojb04) | 1.5B base + 4,3M LoRA | 2.048 en entrenamiento | Tool calling especializado | Apache 2.0 | HuggingFace (16 descargas) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 (segun ficha oficial de Qwen) | Instruccion general | Apache 2.0 | HuggingFace |
| Qwen2.5-3B-Instruct | 3B | 32.768 (segun ficha oficial de Qwen) | Instruccion general | Apache 2.0 | HuggingFace |
| Hermes-2-Pro-Mistral-7B | 7B | 32.768 | Tool calling y JSON mode | Apache 2.0 | HuggingFace |

La comparativa con modelos de tool calling dedicados de mayor tamano no esta disponible en la informacion proporcionada. Triunfo se posiciona como una alternativa de muy bajo coste frente a modelos genericos mas grandes, a costa de un contexto de entrenamiento mas corto y de un rendimiento en correspondencia exacta del 63,06% en su propio test.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado y evaluado en ingles; no se garantiza su funcionamiento en castellano u otros idiomas.
- El formato de salida es rigido (`[tool_name(argument=value)]`) y requiere que la aplicacion lo valide y ejecute; el modelo no ejecuta funciones ni verifica resultados.
- La metrica de evaluacion compara valores JSON estrictos y distingue `120` de `120.0`; no mide equivalencia funcional ni veracidad de los valores extraidos.
- El agrupamiento de splits permite que herramientas individuales y parafrasis reaparezcan entre entrenamiento y test, por lo que no es una evaluacion sobre APIs ineditas.
- Los comportamientos de aclaracion y rechazo estan presentes en entrenamiento pero el autor reporta fallos en la evaluacion y no los garantiza.
- Riesgo de alucinacion en la seleccion de herramienta o en los argumentos cuando la peticion es ambigua o el catalogo de funciones es grande.
- El contexto de entrenamiento es de 2.048 tokens; peticiones o catalogos de herramientas mas largos pueden degradar el rendimiento.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar Qwen/Qwen2.5-1.5B-Instruct en la revision fijada.
- Proyecto experimental con 16 descargas y 0 likes; no hay evidencia de uso en produccion ni de validacion independiente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se han publicado resultados en benchmarks estandar, por lo que la comparacion con alternativas consolidadas es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/pedrojb04/triunfo
- Repositorio GitHub (codigo, datos y evaluacion): https://github.com/pedrojbDev/triunfo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
