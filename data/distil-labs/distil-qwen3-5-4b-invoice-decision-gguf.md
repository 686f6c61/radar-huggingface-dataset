# distil-labs/distil-qwen3.5-4b-invoice-decision-gguf

## Resumen

Distil-Qwen3.5-4B-Invoice-Decision es un modelo especializado de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por distil-labs mediante destilación sobre el modelo base Qwen/Qwen3.5-4B. Su función es concreta: leer tres documentos de un proceso de cuentas a pagar (el mensaje de factura del proveedor, la orden de compra del ERP y el albarán de recepción de mercancías), razonar paso a paso sobre cuatro comprobaciones en orden y emitir una decisión de pago con una de cinco etiquetas posibles: `approve`, `hold_no_po`, `hold_quantity`, `hold_price` o `hold_total`.

El modelo se entrenó en la plataforma de distil labs a partir de 40 ejemplos semilla, sobre los que un modelo profesor (GLM 5.3 con esfuerzo de razonamiento alto) generó 4.156 ejemplos sintéticos de entrenamiento. El ajuste se hizo con LoRA de rango 64 durante 4 épocas y los pesos se fusionaron posteriormente. El repositorio publicado contiene la cuantización GGUF Q8_0 (`distil-qwen3.5-4b-invoice-decision-q8_0.gguf`), pensada para servirse con llama.cpp; los pesos en safetensors están en un repositorio aparte.

Es relevante ahora porque demuestra que un modelo pequeño y destilado, ejecutable en hardware de consumo, puede superar a modelos frontera en una tarea empresarial estrecha pero crítica: obtiene 98 decisiones correctas sobre 100 facturas de prueba, frente a 96 del profesor GLM 5.3, 84 de la mejor configuración de Jev o 76 de Gemini 3.5 Flash Lite, y solo por detrás de GPT-5.6 Luna con razonamiento alto (100). Forma parte de una pipeline de procesamiento de facturas publicada como código abierto y es la variante "solo decisión" del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; es un ajuste fino del modelo base Qwen/Qwen3.5-4B (con modo de razonamiento/thinking) |
| Parámetros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el ejemplo de despliegue del autor usa `-c 16384` (16.384 tokens) |
| Tipos de cuantización | GGUF Q8_0 (único publicado en este repositorio); pesos completos en safetensors en el repositorio hermano |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) y safetensors (repositorio separado) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible más allá de que se trata de un ajuste de Qwen/Qwen3.5-4B, un modelo con modo de razonamiento explícito que se activa mediante `chat_template_kwargs: {"enable_thinking": true}`. El modelo fue entrenado para razonar antes de responder en un formato fijo y corto (unos 160 tokens): aplica las comprobaciones en orden de política, recorre una línea por cada línea de factura manteniendo una suma acumulada y se detiene en el primer fallo. La respuesta JSON va después del razonamiento.

El entrenamiento siguió un esquema de destilación: 40 ejemplos semilla definidos por el equipo, generación de 4.156 ejemplos sintéticos por parte del profesor GLM 5.3 con razonamiento alto, y ajuste del alumno mediante LoRA de rango 64 durante 4 épocas con fusión posterior de pesos. El tipo de tarea declarado es "question answering con salida JSON". No se indica en la ficha el número de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO; tampoco se documenta ninguna innovación de decodificación específica más allá del propio formato de razonamiento destilado.

## Capacidades

- Razonamiento estructurado sobre tres documentos (factura, orden de compra y albarán) antes de emitir una decisión.
- Clasificación en cinco etiquetas cerradas: `approve`, `hold_no_po`, `hold_quantity`, `hold_price`, `hold_total`.
- Emparejamiento de líneas de factura con líneas de orden de compra por artículo, tolerando orden distinto, nombres propios del proveedor o abreviaturas.
- Aplicación de cuatro reglas de política en orden: coincidencia exacta del número de orden de compra, cantidad facturada no superior a la recibida, precio unitario no más de un 2 % por encima del precio de la orden, y total de factura coherente con la suma de líneas más portes solo si la orden los permite.
- Suma acumulada de totales de línea para detectar totales incorrectos.
- Ignorar importes del mensaje ajenos a la factura (saldos anteriores, pagos recibidos, presupuestos).
- Salida en JSON estricto con una única clave `decision`.
- Traza de razonamiento corta y auditable (aproximadamente 160 tokens), útil para registro y revisión.
- Servicio a través de endpoint compatible con OpenAI mediante llama.cpp con plantilla Jinja.
- No soporta tool calling, uso de agentes, visión, audio ni capacidades multilingües según la información disponible.

## Casos de uso

- Automatización del triaje de cuentas a pagar: el modelo recibe el correo de factura, la orden de compra y el albarán, aplica las cuatro comprobaciones y devuelve `approve` o el motivo de retención, lo que permite pagar automáticamente las facturas limpias y desviar solo las excepcionales a revisión humana.
- Three-way matching en ERP: integrado como paso de decisión en la pipeline del propio autor, sustituye la comparación manual entre los tres documentos y reduce el trabajo de los equipos de cuentas a pagar sobre facturas que fallan una o dos comprobaciones (68 de las 100 facturas del conjunto de prueba).
- Detección de sobreprecios: la regla de `hold_price` tolera hasta un 2 % por encima del precio de la orden de compra, de modo que el modelo marca automáticamente facturas con desviaciones como el caso cercano de un 1,8 % incluido en el conjunto de prueba, sin bloquear precios inferiores.
- Control de cantidades facturadas frente a recepciones: la etiqueta `hold_quantity` permite detectar facturación superior a lo realmente recibido, un escenario habitual en discrepancias de recepción parcial o devoluciones.
- Verificación de totales y portes: el modelo recalcula la suma de los totales de línea y comprueba que los portes solo se incluyen si la orden de compra los autoriza, lo que resulta útil cuando el proveedor añade gastos de envío no pactados.
- Enrutado de excepciones por motivo: las cinco etiquetas se pueden mapear a colas distintas (falta de orden de compra, discrepancia de cantidad, de precio o de total), lo que permite dirigir cada caso al equipo o al flujo de resolución correspondiente.
- Auditoría y trazabilidad: la traza fija de razonamiento, con las comprobaciones en orden y la suma acumulada, se puede almacenar como justificación de la decisión en un contexto de control interno o cumplimiento.
- Despliegue on-premise con datos financieros sensibles: al ejecutarse con llama.cpp sobre GGUF Q8_0 en una GPU de consumo, permite mantener facturas y órdenes de compra dentro de la infraestructura propia sin enviarlas a APIs externas.
- Comparación de estrategias de razonamiento: sirve como referencia interna para medir si merece la pena un modelo mayor con razonamiento frente a un SLM destilado en una tarea de política fija.

## Benchmarks y rendimiento

| Modelo | Decisiones correctas (100 facturas de prueba) |
|---|---|
| Este modelo (Distil-Qwen3.5-4B-Invoice-Decision, Q8_0) | 98 |
| Qwen3.5-4B sin ajustar, thinking activado, mismo prompt | 0,41 con LLM como juez |
| Jev, mejor de tres configuraciones (una pregunta por línea y comprobación) | 84 |
| GPT-5.6 Luna, razonamiento alto | 100 |
| GLM 5.3, razonamiento alto (el profesor) | 96 |
| GPT-5.6 Luna, razonamiento desactivado | 81 |
| Gemini 3.5 Flash Lite | 76 |

Composición del conjunto de prueba: 32 facturas aprobables (20 de ellas casos límite, como un precio un 1,8 % por encima del precio de la orden de compra), 60 que fallan una comprobación y 8 que fallan dos. Según el autor, los modelos que responden en una sola pasada obtienen entre 75 y 84, mientras que este modelo razona primero y detecta los 16 totales incorrectos. Sus dos errores son deslices en la suma acumulada de totales de línea en el rango de los miles. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 4,5 GB (tamaño del repositorio), a lo que hay que sumar la caché KV. Con 16.384 tokens de contexto, una estimación razonable se sitúa en torno a 6-8 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Cabe en tarjetas de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. Para lotes grandes o mayor contexto, A100 o H100 ofrecen margen sobrado, aunque están muy por encima de lo necesario para un modelo de 4,2 mil millones de parámetros.
- Ejecución en CPU: viable con llama.cpp en CPU, con latencia mayor; también cabe en Mac con memoria unificada a partir de 8-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), cualquier servidor compatible con GGUF y endpoint compatible con OpenAI. El comando documentado por el autor es `llama-server -m models/distil-qwen3.5-4b-invoice-decision-q8_0.gguf --port 8001 --jinja -c 16384 -np 4`, donde `--jinja` es obligatorio porque la plantilla de chat incluye el interruptor de razonamiento. Para los safetensors, vLLM o TGI son opciones habituales, aunque no se documentan en la ficha.
- Latencia y throughput: no disponibles. La única referencia indirecta es la longitud del razonamiento, de unos 160 tokens antes de la respuesta.
- Parámetros de inferencia recomendados: temperatura 0 y `enable_thinking: true`, con el prompt de sistema exacto del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decisiones correctas (100 facturas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Distil-Qwen3.5-4B-Invoice-Decision | 4,2 mil millones | no especificado (ejemplo con 16.384) | 98 | Apache 2.0 | GGUF Q8_0 y safetensors en HuggingFace |
| Qwen3.5-4B sin ajustar (base) | 4 mil millones (según el modelo base) | no disponible | 0,41 con LLM como juez | según el modelo base Qwen/Qwen3.5-4B | HuggingFace |
| Distil-Qwen3.5-4B-Invoice-Grounded-Decision (variante hermana) | 4,2 mil millones | no especificado | no disponible en esta información | Apache 2.0 | HuggingFace |
| GLM 5.3 (profesor, razonamiento alto) | no disponible | no disponible | 96 | no disponible | no disponible |
| GPT-5.6 Luna (razonamiento alto / desactivado) | no disponible | no disponible | 100 / 81 | propietaria | API |
| Gemini 3.5 Flash Lite | no disponible | no disponible | 76 | propietaria | API |

La comparación directa en parámetros, contexto o licencia con los modelos frontera no es posible porque la información disponible no incluye esos datos. La comparación publicada se limita a la exactitud de decisión sobre el conjunto de prueba del autor, lo que favorece al modelo destilado frente a alternativas propietarias más pequeñas o con razonamiento desactivado.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos, generados alrededor de una empresa ficticia (Northwind), en inglés y con importes en una única moneda. No hay garantía de generalización a datos reales ni a otras divisas.
- El modelo está entrenado para una única tarea y una única política de cuentas a pagar. No es un asistente general y su rendimiento fuera de ese dominio no está evaluado.
- El propio autor advierte de que el modelo se degrada fuera de su configuración de entrenamiento: hay que mantener el prompt de sistema exactamente como se publicó y usar temperatura 0.
- Es obligatorio servir con razonamiento activado (`enable_thinking: true`) y con la plantilla Jinja (`--jinja`); desactivarlo probablemente empeore mucho los resultados, como sugiere el caso de GPT-5.6 Luna sin razonamiento (81 frente a 100).
- Los dos errores documentados corresponden a sumas acumuladas de totales de línea en el rango de los miles, un punto débil conocido en aritmética de varios pasos.
- Riesgo de alucinación en la coincidencia de artículos entre factura y orden de compra cuando los nombres del proveedor no sean reconocibles, dado que el emparejamiento se hace por nombre de artículo.
- Solo se publica la cuantización Q8_0 en GGUF; no hay versiones Q4 o Q5 en este repositorio, lo que limita el ahorro de memoria.
- La licencia Apache 2.0 cubre este ajuste, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3.5-4B antes de un uso comercial en producción.
- El repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe validación independiente de la comunidad ni de terceros.
- Los casos límite del conjunto de prueba están construidos por el mismo autor del modelo, lo que introduce un posible sesgo de evaluación; la comparación con GPT-5.6 Luna o Gemini se realizó sobre ese conjunto propio.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo listados de ofertas de empleo sin relación), por lo que no hay fuentes externas que corroboren o amplíen la información de la model card.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-decision-gguf
- Pesos en safetensors: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-decision
- Variante con decisión fundamentada: https://huggingface.co/distil-labs/distil-qwen3.5-4b-invoice-grounded-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la pipeline de facturas: https://github.com/distil-labs/invoice-processing-pipeline
- Datos semilla, conjunto de prueba y configuración: https://github.com/distil-labs/invoice-processing-pipeline/tree/main/training/decider
- Plataforma distil labs: https://www.distillabs.ai
- Organización en GitHub: https://github.com/distil-labs
- Organización en HuggingFace: https://huggingface.co/distil-labs
- LinkedIn: https://www.linkedin.com/company/distil-labs/
- Comunidad en Slack: https://distil-labs-community.slack.com/join/shared_invite (URL truncada en la model card)
- Resultados de la búsqueda web: sin resultados relevantes sobre el modelo; solo listados de ofertas de empleo sin relación con la consulta.
