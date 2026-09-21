# distil-labs/distil-qwen3.5-4b-invoice-decision

## Resumen

Distil-Qwen3.5-4B-Invoice-Decision es un ajuste fino del modelo base Qwen/Qwen3.5-4B desarrollado por distil labs, orientado exclusivamente a una tarea de cuentas por pagar: leer una factura de proveedor junto con el pedido de compra (PO) y el albarán de recepción, razonar sobre cuatro comprobaciones en orden y emitir una decision JSON entre cinco posibles etiquetas. Con 4.205.751.296 parametros, es un modelo pequeno (SLM) pensado para desplegarse en produccion con un coste de inferencia bajo y una latencia reducida frente a alternativas frontera.

El problema que resuelve es acotado pero critico en cualquier ERP: decidir si una factura se paga o se retiene, y por que motivo. La politica implementada cubre cuatro causas de retencion —falta de PO, cantidad facturada superior a la recibida, precio unitario mas de un 2 % por encima del PO y total que no cuadra con la suma de lineas mas el flete permitido— y devuelve `approve` cuando todas pasan. Es relevante ahora porque demuestra que un modelo destilado de ~4B, servido con razonamiento activado, supera a los baselines de una sola pasada y se acerca a modelos frontera en esta tarea concreta.

El modelo se entreno sobre 4.156 ejemplos sinteticos generados por un profesor (GLM 5.3 con esfuerzo de razonamiento alto) a partir de 40 ejemplos semilla, mediante LoRA de rango 64 durante 4 epocas con pesos fusionados. Forma parte del pipeline de procesamiento de facturas de distil labs como paso 2a, en su variante "decision-only", y existe una compilacion GGUF para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura declarada como qwen3_5_text |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; existe una compilacion GGUF publicada por el autor (distil-labs/distil-qwen3.5-4b-invoice-decision-gguf), que habilita cuantizaciones propias de llama.cpp |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; tambien disponible en GGUF |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 8,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B subyacente, marcada en HuggingFace con el tag `qwen3_5_text`: un transformer decoder-only con modo de razonamiento explicito. El ajuste se realizo con LoRA (rank 64) durante 4 epocas, fusionando posteriormente los pesos en el modelo final, por lo que en inferencia se comporta como un modelo denso convencional sin adaptadores separados. El tipo de tarea declarado es "question answering with JSON output".

El proceso de destilacion partio de 40 ejemplos semilla escritos por el equipo; el profesor, GLM 5.3 con esfuerzo de razonamiento alto, genero 4.156 ejemplos sinteticos sobre los que se entreno al estudiante. No se menciona RLHF ni DPO. La innovacion destacable no esta en el entrenamiento sino en el formato de salida aprendido: el modelo fue entrenado para razonar antes de responder con una estructura fija y corta de aproximadamente 160 tokens —las comprobaciones en el orden de la politica, una linea por linea de factura, una suma acumulada y parada en el primer fallo— y solo despues emite el objeto JSON con la decision. Este razonamiento intermedio es lo que le permite detectar los 16 totales incorrectos del conjunto de prueba que los baselines de una sola pasada pasan por alto.

## Capacidades

- Generacion de texto con razonamiento previo a la respuesta en formato fijo y acotado (unos 160 tokens de cadena de razonamiento).
- Clasificacion de facturas en cinco decisiones: `approve`, `hold_no_po`, `hold_quantity`, `hold_price` y `hold_total`.
- Conciliacion entre tres documentos distintos: mensaje de correo con la factura, pedido de compra del ERP y albaran de recepcion del ERP.
- Emparejamiento de lineas de factura con lineas de PO aunque el orden difiera y aunque el proveedor use sus propios nombres o abreviaturas de articulo.
- Aritmetica de comprobacion: suma acumulada de totales de linea y validacion contra el total declarado, incluido el tratamiento del flete segun lo que indique el PO.
- Filtrado de importes ajenos a la factura (saldo anterior, pago recibido, presupuesto) que aparecen en el mensaje pero no forman parte del documento.
- Salida estricta en JSON (`{"decision": "<label>"}`) apta para consumo programatico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el razonamiento esta fijado a la politica de una sola tarea.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo thinking (obligatorio en la practica; se activa con `chat_template_kwargs: {"enable_thinking": true}`); sin vision ni audio.

## Casos de uso

- Validacion automatica de facturas antes del pago: el modelo recibe el correo de factura, el PO y el albaran, ejecuta las cuatro comprobaciones en orden y devuelve una etiqueta lista para que el ERP decida si bloquea el pago o lo libera. Es su proposito original y el escenario medido en la model card.
- Triaje de la cola de cuentas por pagar: al devolver tambien el motivo de retencion (`hold_no_po`, `hold_quantity`, `hold_price`, `hold_total`), permite enrutar cada factura retenida al equipo correspondiente (compras, almacen, tesoreria) sin revision manual previa.
- Deteccion de discrepancias de cantidad en recepciones parciales: al comparar la cantidad facturada con la cantidad efectivamente recibida por articulo, detecta facturas emitidas por encima de lo entregado, un caso frecuente con entregas divididas.
- Control de desviaciones de precio: la tolerancia del 2 % sobre el precio unitario del PO permite aprobar automaticamente variaciones menores y retener las que superan el umbral, reduciendo el ruido en la revision manual.
- Auditoria de totales con flete: valida que la suma de las lineas cuadre con el total declarado y que el flete solo se incluya cuando el PO lo autoriza expresamente, evitando pagos de portes no pactados.
- Integracion en un pipeline ERP-to-ERP mediante endpoint compatible con OpenAI: se sirve con `vllm serve` y se consume con el SDK de OpenAI, de modo que puede insertarse en un flujo existente sin cambiar la capa de aplicacion.
- Generacion de trazas de auditoria: la cadena de razonamiento intermedia (comprobaciones, lineas y suma acumulada) puede registrarse como justificacion documental de cada decision de pago o retencion.
- Procesamiento por lotes de alto volumen: con ~4,2B parametros y respuestas de longitud fija, el coste por factura es bajo comparado con invocar un modelo frontera para cada documento, lo que permite ejecutar la conciliacion completa de un periodo contable en una sola pasada nocturna.
- Filtro previo a la revision humana: combinar este modelo decisor con el modelo de decision fundamentada del mismo autor (`distil-qwen3.5-4b-invoice-grounded-decision`) para separar la decision de su justificacion textual.

## Benchmarks y rendimiento

La model card publica un unico conjunto de resultados sobre 100 facturas de prueba: 32 aprobables (20 de ellas "near misses", por ejemplo un precio un 1,8 % por encima del PO), 60 que fallan una comprobacion y 8 que fallan dos.

| Modelo | Decisiones correctas (100 facturas de prueba) |
|---|---|
| Este modelo | 98 |
| Qwen3.5-4B sin ajustar, thinking on, mismo prompt | LLM-as-a-judge 0,41 |
| Jev, mejor de tres configuraciones | 84 |
| GPT-5.6 Luna, reasoning high | 100 |
| GLM 5.3, reasoning high (el profesor) | 96 |
| GPT-5.6 Luna, reasoning off | 81 |
| Gemini 3.5 Flash Lite | 76 |

Segun el autor, los modelos que responden en una sola pasada puntuan entre 75 y 84, mientras que este modelo razona primero y detecta los 16 totales incorrectos. Sus dos errores son fallos en la suma acumulada de totales de linea del orden de miles. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento de parametros, no dato publicado por el autor): en FP16/BF16 en torno a 8,5-9 GB contando pesos y overhead de activaciones y cache KV; en cuantizacion de 8 bits, aproximadamente 4,5-5 GB; en cuantizacion de 4 bits (GGUF Q4), alrededor de 2,5-3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 si se usa vLLM con `max_num_seqs` bajo (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para lotes concurrentes altos o contexto largo, una A100 40/80 GB o H100 aporta margen sobrado, aunque el modelo quede muy por debajo de su capacidad.
- Cabe en GPU de consumo: si. En cuantizacion de 4 bits entra en GPUs de 4-6 GB (GTX 1650 4 GB limitado, RTX 3050 6 GB, RTX 2060 6 GB); en FP16 requiere al menos 8-10 GB.
- Opciones de despliegue: vLLM (es el recomendado explicitamente en la model card, con `--port 8001` y endpoint compatible con OpenAI), llama.cpp y derivados mediante el repositorio GGUF publicado (distil-labs/distil-qwen3.5-4b-invoice-decision-gguf), y cualquier runtime compatible con `transformers`. No se mencionan TGI, Ollama ni SGLang en la informacion disponible.
- Latencia y throughput estimados: no disponible. El unico dato indirecto es que la secuencia de salida ronda los 160 tokens entre razonamiento y respuesta JSON, con temperatura 0.
- Configuracion de servicio obligatoria: thinking activado (`chat_template_kwargs: {"enable_thinking": true}`), temperatura 0 y el system prompt exacto del entrenamiento. El autor advierte que el modelo se degrada fuera de esa configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decisiones correctas (100 facturas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Distil-Qwen3.5-4B-Invoice-Decision | ~4,2B | no disponible | 98 | Apache-2.0 | Pesos abiertos en HuggingFace (safetensors y GGUF) |
| Qwen3.5-4B (base sin ajustar) | 4B | no disponible | 0,41 segun LLM-as-a-judge | no disponible en la informacion facilitada | Pesos abiertos |
| GLM 5.3 (profesor, reasoning high) | no disponible | no disponible | 96 | no disponible | no disponible |
| GPT-5.6 Luna (reasoning high / off) | no disponible | no disponible | 100 / 81 | Propietaria | API |
| Gemini 3.5 Flash Lite | no disponible | no disponible | 76 | Propietaria | API |
| Jev (mejor de tres configuraciones) | no disponible | no disponible | 84 | no disponible | no disponible |

El modelo iguala o supera a su propio profesor (98 frente a 96) y se queda a dos decisiones del mejor resultado absoluto (GPT-5.6 Luna con razonamiento alto, 100), con la diferencia de que aqui los pesos son abiertos, el modelo es ~4B y puede ejecutarse en hardware de consumo. La comparacion esta limitada a esta unica tarea: no hay datos que permitan situarlo frente a alternativas en capacidades generales.

## Limitaciones y advertencias

- Especializacion extrema: no es un asistente general. Esta entrenado para una unica tarea y una unica politica de cuentas por pagar; fuera de ese flujo su comportamiento no esta caracterizado.
- Dependencia del prompt: el autor advierte explicitamente que el modelo se degrada fuera de su configuracion de entrenamiento. Hay que mantener el system prompt exacto, activar thinking y usar temperatura 0.
- Datos sinteticos: todo el conjunto de entrenamiento y prueba es sintetico, generado por un profesor, en torno a una empresa ficticia ("Northwind"), en ingles y con una sola divisa. La transferencia a facturas reales, con formatos heterogeneos, otros idiomas o multiples divisas, no esta demostrada.
- Idioma: solo ingles. No hay soporte multilingue declarado.
- Riesgo de error aritmetico: los dos unicos fallos del conjunto de prueba fueron errores en la suma acumulada de totales de linea del orden de miles. En documentos con importes altos o muchas lineas este tipo de fallo puede repetirse.
- Riesgo de alucinacion en el emparejamiento de lineas: el modelo debe emparejar lineas de factura con lineas de PO por articulo, tarea propensa a errores cuando el proveedor usa abreviaturas o nomenclatura muy distinta; no se publican metricas desagregadas de esa fase.
- Politica fija y no configurable: la tolerancia del 2 %, el tratamiento del flete y el orden de las comprobaciones estan fijados por el prompt del entrenamiento. Cambiar la politica exige reentrenar, no solo editar el prompt.
- Limitaciones de contexto: la longitud de contexto no esta publicada, por lo que no se puede garantizar el comportamiento con facturas muy largas o mensajes de correo con mucho hilo citado.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, que no se detallan en la informacion disponible.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y el modelo es reciente (publicado el 2026-09-21). No hay evidencia de uso en produccion fuera del propio pipeline del autor.
- Ausencia de benchmarks generales: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, ni evaluaciones de sesgo o robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-decision
- Compilacion GGUF para llama.cpp: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-decision-gguf
- Variante de decision fundamentada: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-grounded-decision
- Repositorio del pipeline (resultados, baselines y salidas crudas): https://github.com/distil-labs/invoice-processing-pipeline
- Datos de entrenamiento, conjunto de prueba, descripcion del puesto y configuracion: https://github.com/distil-labs/invoice-processing-pipeline/tree/main/training/decider
- Organizacion en GitHub: https://github.com/distil-labs
- Perfil de HuggingFace del autor: https://huggingface.co/distil-labs
- Sitio de distil labs: https://www.distillabs.ai
- LinkedIn: https://www.linkedin.com/company/distil-labs/
- Slack de la comunidad: https://distil-labs-community.slack.com/join/shared_invite/zt-36zqj87le-i3quWUn2bjErRq22xoE58g
- X: https://x.com/distil_labs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
