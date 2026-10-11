# mrm8488/Qwen3.5-0.8B-ft-decision-8k

## Resumen

Qwen3.5-0.8B-ft-decision-8k es un ajuste fino supervisado del modelo denso Qwen/Qwen3.5-0.8B, publicado por el usuario mrm8488 en Hugging Face. Su particularidad es que no devuelve una etiqueta unica, sino una distribucion de probabilidad calibrada sobre las respuestas posibles de un esquema de preguntas tipadas definido por el usuario. El modelo acepta texto libre (un ticket de soporte, una traza de agente, una factura, una alerta de seguridad) junto con un esquema de preguntas y responde a cada una de ellas. Con 873.438.784 parametros (aproximadamente 0,87 mil millones) y una longitud de contexto maxima de 8192 tokens, esta pensado para caber en hardware modesto.

El modelo soporta tres tipos de pregunta: `choice` (elegir una opcion entre criterios nombrados), `noul` (decision binaria si/no) y `score` (escala ordinal, que ademas devuelve una puntuacion esperada). El entrenamiento se hizo sobre el dataset LocalLLaMA/typed-decisions, compuesto por 1.6k registros repartidos en cuatro flujos de trabajo: agent_trace_observability, customer_service, invoice_processing y security_incidents. Las etiquetas de referencia son distribuciones suaves agregadas a partir de varios anotadores, de modo que el modelo aprende a reproducir la distribucion completa y no solo el argmax.

La relevancia de esta ficha radica en su enfoque: en lugar de un clasificador opaco, ofrece probabilidades calibradas (ECE de 0,0412 en validacion y 0,0377 en el split de test) que permiten aplicar umbrales de confianza y derivar a un humano los casos dudosos. Es un modelo de investigacion y experimentacion, orientado a enrutamiento, triaje y colas de revision, no un asistente conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-0.8B); detalles internos de capas y atencion no disponibles |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | safetensors en bf16; GGUF Q8_0 y Q4_K_M publicados por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (llama.cpp / LM Studio / Ollama) |
| Tamano del repositorio | 1,8 GB |
| Pipeline declarado | zero-shot-classification |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Dataset de entrenamiento | LocalLLaMA/typed-decisions (subset `all`, 1.6k registros) |
| Fecha de creacion en Hugging Face | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de aproximadamente 0,87 mil millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA de rango 128, alpha 64, dropout 0 y gradient checkpointing de Unsloth, con semilla 3407 y contexto maximo de 8192 tokens. La configuracion de entrenamiento fue de batch size 64 por dispositivo sin acumulacion de gradientes (batch efectivo 64), 10 epochs y 180 pasos totales, learning rate 2e-4 con scheduler coseno, weight decay 0,01, 10 pasos de warmup y precision bf16 con fallback a fp16. La estrategia de evaluacion y guardado fue por epoch, cargando el mejor modelo por perdida de validacion. El checkpoint publicado corresponde a la epoch 7, la de menor perdida de validacion (0,845596); la perdida de validacion se estanca a partir de la epoch 4.

La innovacion principal no esta en la arquitectura, sino en la formulacion de la tarea: el modelo emite distribuciones calibradas sobre esquemas de preguntas tipadas y se entrena contra distribuciones suaves en lugar de etiquetas duras, minimizando entropia cruzada contra el gold blando. La perdida de validacion apenas mejora respecto al modelo base (1,214 frente a 1,210), pero la exactitud pasa del 40,5 % al 83,0 % y el ECE se reduce de 0,0796 a 0,0412, lo que indica que el ajuste mejora principalmente la asignacion de masa de probabilidad y la calibracion, no la perplejidad. En la model card no se documenta composicion detallada del dataset, uso de RLHF o DPO, ni mecanismos como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion estructurada con esquemas definidos por el usuario: preguntas de tipo `choice` (opcion entre criterios nombrados), `noul` (binaria si/no) y `score` (escala ordinal con puntuacion esperada).
- Salida de probabilidades calibradas por pregunta, aptas para umbralizar y derivar casos de baja confianza a revision humana.
- Procesamiento de texto libre como entrada: tickets de soporte, trazas de agente, facturas y alertas de seguridad.
- Enrutamiento y triaje multicriterio en una sola pasada, respondiendo varias preguntas sobre el mismo registro.
- Capacidades de observabilidad sobre trazas de agentes (agent_trace_observability), segun los flujos de trabajo cubiertos por el dataset.
- Soporte multilingue: no disponible; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- Integracion con vLLM y con los formatos GGUF para llama.cpp, LM Studio y Ollama.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un esquema con preguntas como "que equipo debe gestionarlo" (choice), "el cliente pide reembolso" (noul) y "cual es la urgencia" (score), devolviendo distribuciones que permiten enrutar automaticamente y escalar a un humano por debajo de un umbral de confianza.
- Procesamiento de facturas: clasificacion de documentos entrantes por tipo, deteccion de duplicados o incidencias y asignacion de cola de revision, aprovechando el flujo invoice_processing del dataset de entrenamiento.
- Colas de revision de alertas de seguridad: sobre alertas y eventos, el modelo responde a preguntas binarias y ordinales de severidad, y las probabilidades permiten priorizar solo los casos con alta confianza y dejar el resto para analistas.
- Observabilidad de agentes: analisis de trazas de agentes (browser-agent, computer-use) para etiquetar si una traza contiene un fallo, que tipo de fallo es y su gravedad, con salida probabilistica agregable en paneles.
- Enrutamiento en pipelines de automatizacion: uso como clasificador previo a un LLM mayor, de modo que solo las peticiones con decision clara se envian al modelo grande y las dudosas se derivan a un humano, reduciendo coste de inferencia.
- Anotacion asistida y control de calidad de etiquetado: comparar las distribuciones predichas con las etiquetas de anotadores para detectar desacuerdos, dado que el modelo se entreno contra distribuciones agregadas de varios anotadores.
- Investigacion sobre calibracion y clasificacion probabilistica: modelo pequeno y abierto para experimentar con perdidas sobre etiquetas suaves, medicion de ECE y tecnicas de umbralizado.

## Benchmarks y rendimiento

Metricas definidas en la model card: `accuracy` (fraccion de preguntas individuales en las que la etiqueta predicha coincide con el argmax del gold), `record_accuracy` (fraccion de registros en los que todas las preguntas se responden correctamente), `ece` (expected calibration error, menor es mejor) y `loss` (entropia cruzada contra las distribuciones suaves).

Comparativa antes y despues del ajuste fino (conjunto de validacion, checkpoint de la epoch 7):

| Modelo | Accuracy | Record accuracy | ECE | Loss |
|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 40,5 % | 0,0 % | 0,0796 | 1,210 |
| Qwen3.5-0.8B-ft-decision-8k | 83,0 % | 42,5 % | 0,0412 | 1,214 |

Resultados en el split de test:

| Modelo | Accuracy | Record accuracy | ECE | Loss |
|---|---|---|---|---|
| Qwen3.5-0.8B-ft-decision-8k | 80 % | 38,75 % | 0,0377 | 1,279 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Tampoco se proporcionan resultados desagregados por flujo de trabajo (customer_service, invoice_processing, security_incidents, agent_trace_observability).

## Requisitos de hardware

- Pesos en bf16/fp16 (repo principal): aproximadamente 1,75 GB solo de pesos; con cache KV para 8192 tokens el consumo total es superior, aunque no se documenta la cifra exacta.
- Cuantizacion Q8_0: aproximadamente 0,93 GB de pesos, descrita por el autor como casi sin perdida y recomendada.
- Cuantizacion Q4_K_M: aproximadamente 0,5 GB de pesos, la opcion mas ligera publicada.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso en GPU de 4-6 GB con cuantizacion Q4_K_M.
- GPU profesionales (A100, H100) no son necesarias para un modelo de 873 millones de parametros; se usarian solo por agregacion de muchas peticiones concurrentes.
- Despliegue: vLLM (etiqueta declarada en el modelo), llama.cpp, LM Studio y Ollama mediante los GGUF publicados, TGI y la ruta Unsloth `FastDecisionModel` mostrada en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La unica comparacion con datos disponibles es contra el modelo base del que deriva, evaluado en el mismo conjunto:

| Modelo | Parametros | Contexto | Accuracy | Record accuracy | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-ft-decision-8k | 873.438.784 | 8192 | 83,0 % (val) / 80 % (test) | 42,5 % (val) / 38,75 % (test) | 0,0412 (val) / 0,0377 (test) | apache-2.0 | safetensors y GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | no disponible | no disponible | 40,5 % (val) | 0,0 % (val) | 0,0796 (val) | no disponible | Hugging Face |

No se dispone de datos de benchmarks para clasificadores de decision alternativos de la misma categoria en la informacion proporcionada, por lo que no se incluye una comparacion con terceros modelos. La model card no aporta comparaciones con otras familias (por ejemplo, clasificadores encoder como DeBERTa) ni con modelos de enrutamiento de otros autores.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion proporcionada; el modelo solo se ha evaluado sobre cuatro flujos de trabajo concretos y 1.6k registros.
- Riesgo de alucinacion: limitado por la naturaleza de la tarea (distribuciones sobre opciones predefinidas), pero el modelo puede asignar probabilidad alta a opciones incorrectas en esquemas o dominios alejados de los del dataset.
- Idioma: entrenado y declarado unicamente en ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto: la ventana maxima es de 8192 tokens; entradas mas largas requeriran truncado o fragmentacion.
- La perdida de validacion apenas mejora respecto al modelo base (1,214 frente a 1,210), lo que sugiere que la mejora se concentra en la calibracion y la decision por argmax, no en la modelizacion de la distribucion.
- La model card advierte explicitamente de que el rendimiento debe validarse sobre los flujos y esquemas propios antes de desplegar en produccion.
- Licencia apache-2.0, que permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia; conviene verificar la licencia del modelo base Qwen3.5-0.8B, no detallada en la informacion proporcionada.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y no hay validacion independiente por terceros.
- Inconsistencia documental: el ejemplo de codigo de la model card carga el identificador `mrm8488/Qwen3.5-0.8B-ft-typed-decisions`, que no coincide con el identificador del repositorio `mrm8488/Qwen3.5-0.8B-ft-decision-8k`; conviene verificar cual es el repositorio correcto antes de integrarlo.
- La seccion de cuantizaciones de la model card aparece truncada en la informacion disponible, por lo que podrian existir otras cuantizaciones no listadas aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrm8488/Qwen3.5-0.8B-ft-decision-8k
- Cuantizacion GGUF Q8: https://huggingface.co/mrm8488/Qwen3.5-0.8B-ft-decision-8k-3-gguf-q8
- Cuantizacion GGUF Q4: https://huggingface.co/mrm8488/Qwen3.5-0.8B-ft-decision-8k-3-gguf-q4
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a portadas de un medio de noticias, Sky News) y no aportan informacion tecnica util. No se han encontrado papers, blogs, repositorios ni demos adicionales del modelo en la informacion disponible.
