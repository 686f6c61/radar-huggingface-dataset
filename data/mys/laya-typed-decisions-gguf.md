# mys/laya-typed-decisions-GGUF

## Resumen

Laya Typed-Decisions GGUF es una compilacion a formato GGUF del modelo convaiinnovations/laya-typed-decisions, un encoder ModernBERT-large de 421 millones de parametros (422.541.323 parametros reales) especializado en la resolucion de decisiones tipadas en una sola pasada del encoder. No es un modelo generativo: dado un estado (texto de entrada) y una pregunta tipada de tipo `choice`, `score` o `noul`, devuelve probabilidades calibradas en lugar de generar tokens de forma autorregresiva. La ventana de contexto es de 1024 tokens y el tokenizer es el ingles de ModernBERT (`[CLS]/[SEP]/[PAD]/[MASK]`).

El modelo base es la reproduccion abierta de TypeSafe Jev, un sistema de "System 1" orientado a decisiones rapidas. Este checkpoint es el hermano especialista del modelo general en ingles de la misma familia, entrenado sobre flujos de decision tipados y afinado para cuatro dominios concretos: conciliacion de facturas (invoice match), alertas SOC (security), siguiente accion en atencion al cliente (customer_service) y arneses de trazas de agentes (harness).

La relevancia practica de esta ficha esta en que los ficheros no son GGUF de llama.cpp, sino artefactos producidos por ggmlc, un compilador de redes neuronales que baja modelos de PyTorch, JAX, Flax y Keras a ejecucion GGML de alto rendimiento. Cargarlos con llama-cli falla por diseno. El consumo se realiza con el binario `laya`, que expone CLI (`decide`, `info`, `bench`, `serve`, `daemon`) y un servidor HTTP con interfaz Decision Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), no autorregresiva |
| Parametros totales | 422.541.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (`max_len=1024`) |
| Tipos de cuantizacion | F16, Q8_0, UD_Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (compilador ggmlc: MIT) |
| Formato de pesos | GGUF generado por ggmlc (no compatible con llama.cpp) |
| Tipo de tarea | Puntuacion de decisiones tipadas (`choice` / `score` / `noul`) |
| Tokenizer | ModernBERT ingles (`[CLS]/[SEP]/[PAD]/[MASK]`) |
| Tamano del repositorio | 1.7 GB |
| Ficheros publicados | `laya_typed_decisions_f16.gguf` (~811 MB), `laya_typed_decisions_q8_0.gguf` (~434 MB), `laya_typed_decisions_ud_q4_k_m.gguf` (~404 MB) |
| Modelo base | convaiinnovations/laya-typed-decisions |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo ModernBERT-large con 421 millones de parametros y contexto de 1024 tokens. A diferencia de los modelos de lenguaje convencionales, no existe decodificacion autorregresiva: todas las preguntas tipadas se puntuan en una unica pasada del encoder. La salida son probabilidades calibradas sobre las opciones o puntuaciones definidas en la pregunta, lo que convierte al modelo en un clasificador/ranker en lugar de un generador de texto.

El checkpoint deriva de convaiinnovations/laya-typed-decisions mediante destilacion de pesos a GGUF con ggmlc. El modelo base es la reproduccion abierta de TypeSafe Jev y forma parte de la familia Laya, que incluye un modelo general en ingles y una variante multilingue. Segun la model card, este checkpoint especialista comparte familia de tokenizer con el modelo general, tiene contexto mas largo y fue entrenado sobre flujos de trabajo de decision tipados. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es el pipeline de compilacion: ggmlc rebaja el grafo desde PyTorch/JAX/Flax/Keras a GGML, con soporte de ejecucion en CUDA, Metal o CPU y uso de `--cuda-graph`.

## Capacidades

- Puntuacion de decisiones tipadas en una sola pasada del encoder, sin generacion de tokens.
- Preguntas de tipo `choice` (seleccion entre opciones), `score` (puntuacion) y `noul` (sin opciones definidas).
- Conciliacion de facturas (preset `invoice`).
- Triaje y evaluacion de alertas SOC (preset `security`).
- Prediccion de la siguiente accion en atencion al cliente (preset `customer_service`).
- Soporte de arneses de trazas de agentes (preset `harness`).
- Salida en JSON mediante `--json` en el subcomando `decide`.
- Modo servidor HTTP: `GET /` sirve Decision Studio y `POST /api/decide` expone la decision.
- Modo daemon con JSON-RPC por lineas sobre stdin/stdout.
- Seleccion automatica de dispositivo (`--device auto`: CUDA o Metal si estan presentes, si no CPU).
- Enrutado por familia con `--family typed-decisions` o por identificadores de pregunta especialistas (`invoice`, `security`, `customer_service`, `harness`).
- No dispone de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking: no es un modelo generativo ni conversacional.

## Casos de uso

- Conciliacion automatica de facturas: el preset `invoice` permite enfrentar el estado documental (factura frente a pedido o albaran) y obtener una probabilidad calibrada de coincidencia, lo que se traduce directamente en un umbral de aprobacion o revision manual en un ERP.
- Triaje de alertas de seguridad (SOC): el preset `security` puntua alertas para decidir si se escalan, se cierran o se enriquecen, reduciendo el volumen que llega a analistas humanos y aportando una probabilidad en lugar de una etiqueta binaria rigida.
- Enrutado de la siguiente accion en atencion al cliente: el preset `customer_service` decide entre acciones discretas (responder, escalar, pedir informacion, cerrar) a partir del estado de la conversacion, integrable en un motor de flujos o en un orquestador de agentes.
- Evaluacion de arneses de agentes (harness): el preset `harness` puntua trazas de ejecucion para decidir si una trayectoria de agente es correcta, ambigua o fallida, util para construir conjuntos de evaluacion automaticos sobre logs de agentes.
- Clasificacion de intenciones de baja latencia: al ser un encoder de 421 M con una unica pasada, encaja en pipelines de clasificacion en tiempo real donde un modelo generativo anadiria latencia innecesaria (por ejemplo, enrutado de tickets o etiquetado masivo).
- Moderacion y validacion de formularios: las preguntas de tipo `choice` permiten verificar si un texto cumple una politica o si un campo libre es coherente, devolviendo puntuaciones calibradas en lugar de texto libre.
- Servicio interno de decisiones: mediante `laya serve ... --port 8080` se expone `POST /api/decide`, de modo que varios servicios pueden consultar el mismo modelo como microservicio de decision.
- Integracion en aplicaciones de escritorio o embebidas: los ficheros Q8_0 (~434 MB) y UD_Q4_K_M (~404 MB) permiten despliegues ligeros, incluso en CPU, con el binario `laya` como dependencia unica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificacion equivalentes, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo. Existe un subcomando `laya bench` (`laya bench <fichero> --preset invoice --device auto --cuda-graph`) para medir rendimiento en local, pero no se han publicado resultados del mismo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia, los propios ficheros ocupan ~811 MB (F16), ~434 MB (Q8_0) y ~404 MB (UD_Q4_K_M); la memoria total sera del orden del tamano del fichero mas el estado de activaciones para entradas de hasta 1024 tokens en un encoder de 421 M.
- GPU recomendadas: no especificadas. El binario `laya` selecciona CUDA o Metal automaticamente mediante `--device auto`, con soporte de `--cuda-graph` para capturar el grafo.
- Ejecucion en GPU de consumo: por el rango de tamano (menos de 1 GB de pesos en F16 y ~404 MB en la cuantizacion mas agresiva), es previsible que quepa holgadamente en cualquier GPU de consumo actual, aunque el fabricante no publica una lista de modelos validados.
- Ejecucion en CPU: soportada explicitamente (`--device auto` cae a CPU si no hay CUDA ni Metal), coherente con el rango de 421 M de parametros.
- Opciones de despliegue: exclusivamente el binario `laya` de ggmlc. Formatos soportados: CLI (`decide`, `info`, `list-presets`, `bench`), servidor (`serve` con Decision Studio y `POST /api/decide`) y daemon JSON-RPC por stdin/stdout. No es compatible con vLLM, TGI, Ollama, llama.cpp ni `llama-cli`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por decision ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mys/laya-typed-decisions-GGUF | 422.541.323 | 1024 | Probabilidades calibradas sobre decisiones tipadas | Apache 2.0 | GGUF para binario `laya` (ggmlc) |
| convaiinnovations/laya-typed-decisions | 421 M (segun model card) | 1024 | Probabilidades calibradas sobre decisiones tipadas | Apache 2.0 | Pesos originales (PyTorch y similares) |
| mys/laya-GGUF | no disponible | no disponible | Decisiones tipadas (modelo general en ingles) | Apache 2.0 | GGUF para `laya` |
| mys/laya-multilingual-GGUF | no disponible | no disponible | Decisiones tipadas (multilingue) | Apache 2.0 | GGUF para `laya` |

No se dispone de datos de benchmark ni de especificaciones completas de los modelos hermanos, por lo que la comparacion se limita a parametros, contexto, tipo de salida, licencia y formato de distribucion. Frente a clasificadores encoder convencionales o modelos generativos, la diferencia estructural es la interfaz de decision tipada con probabilidades calibradas en una sola pasada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo puntua preguntas tipadas.
- Formato no estandar: los ficheros son GGUF producidos por ggmlc y cargarlos en llama.cpp o `llama-cli` falla. No sirven con vLLM, TGI u Ollama.
- Solo ingles: el campo `language` de la model card indica unicamente `en`; no hay soporte multilingue en este checkpoint (existe una variante aparte, laya-multilingual-GGUF).
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones extensas sin troceado previo.
- Riesgo de alucinacion: al devolver probabilidades calibradas en lugar de texto, el riesgo se manifiesta como confianza mal calibrada en dominios alejados de los flujos de entrenamiento; conviene validar umbrales con datos propios.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad en la informacion disponible.
- Enrutado automatico: `--models-dir` no selecciona esta familia de forma automatica salvo que se indique `--family typed-decisions` o que los identificadores de pregunta coincidan con los flujos especialistas (`invoice`, `security`, `customer_service`, `harness`). En un directorio con varios modelos, esto puede provocar selecciones inesperadas.
- Especializacion estrecha: los presets estan afinados para cuatro flujos concretos; su rendimiento fuera de ellos no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no publica garantias ni evaluaciones de produccion. El compilador ggmlc se distribuye bajo licencia MIT.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- La busqueda web no aporto informacion independiente ni documentacion de terceros sobre el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mys/laya-typed-decisions-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Compilador ggmlc: https://github.com/monatis/ggmlc
- Ejemplos y CLI Laya en ggmlc: https://github.com/monatis/ggmlc/tree/main/examples/laya
- Binarios de ggmlc (releases): https://github.com/monatis/ggmlc/releases/latest
- Repositorio del proyecto Laya: https://github.com/NandhaKishorM/laya
- Familia Laya en ingles (GGUF): https://huggingface.co/mys/laya-GGUF
- Familia Laya multilingue (GGUF): https://huggingface.co/mys/laya-multilingual-GGUF

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas genericas sin relacion con Laya, ggmlc o TypeSafe Jev.
