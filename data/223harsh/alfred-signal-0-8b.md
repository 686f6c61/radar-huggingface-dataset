# 223Harsh/alfred-signal-0.8b

## Resumen

ALFRED Signal Reader 0.8B es un modelo de clasificación de correo electrónico de clientes bancarios, presentado como un fine-tuning del modelo base Qwen/Qwen3.5-0.8B con 852.985.920 parámetros. Lo desarrolla el autor independiente 223Harsh en el contexto del hackathon GDG "Agentic AI in companies" (Turín, 21 de noviembre de 2026) para el banco ficticio Lumen Bank. Su función concreta es leer un correo de un cliente moroso y devolver una de siete señales: `hardship`, `dispute`, `deceased_notice`, `complaint`, `payment_promise`, `change_of_details` o `no_signal`.

El problema que resuelve es operativo: evitar que un piloto automático de recordatorios de deuda envíe avisos a personas en situación de dificultad financiera, que están disputando la deuda o que han notificado un fallecimiento. El modelo actúa como puerta de seguridad y enruta esos casos a revisión humana. Se ha destilado del asistente ALFRED de 9B del mismo autor, conservando únicamente las salidas que coincidían con las etiquetas de referencia, con un tiempo de entrenamiento declarado de 3,1 minutos.

La relevancia del modelo es doble: por un lado, demuestra que un modelo de menos de mil millones de parámetros puede alcanzar el 85,7% de acierto en frases no vistas, frente al 35,0% del Qwen3.5-0.8B sin ajustar; por otro, su enfoque de despliegue on-premise con datos sintéticos encaja con los requisitos de gobernanza de entidades reguladas. El repositorio ocupa 1,7 GB y se publica con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | en, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros, y se especializa mediante destilación desde el asistente ALFRED de 9B del mismo autor. El proceso de destilación descrito en la model card es selectivo: se generan salidas con el modelo profesor y solo se conservan aquellas que coinciden con las etiquetas de referencia (gold labels), de modo que el estudiante aprende sobre ejemplos ya validados. El entrenamiento declarado duró 3,1 minutos.

Los datos de entrenamiento son íntegramente sintéticos: clientes ficticios generados con Faker, complementados con los conjuntos de datos públicos mencionados en la model card (sin detallar su composición exacta). No se emplean datos reales de clientes ni información personal. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación, ni el número de tokens de entrenamiento, la composición exacta del dataset o innovaciones de atención o decodificación.

## Capacidades

- Clasificación de correo de cliente bancario en siete categorías de señal: `hardship`, `dispute`, `deceased_notice`, `complaint`, `payment_promise`, `change_of_details` y `no_signal`.
- Generación de texto conversacional como tarea de pipeline (`text-generation`), orientada a producir la etiqueta de señal a partir del correo.
- Enrutamiento de casos inciertos o con señal negativa hacia revisión humana, según la recomendación explícita de la model card.
- Soporte de dos idiomas: inglés e italiano.
- Capacidad de destilación desde un modelo mayor (9B) manteniendo parte de su comportamiento en la tarea específica.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Enrutamiento de seguridad en cobros automatizados: el modelo lee el correo entrante de un cliente con deuda vencida y, si detecta `hardship`, `dispute` o `deceased_notice`, detiene el envío automático del recordatorio y lo deriva a un gestor humano. Es el caso de uso principal para el que fue entrenado.
- Triaje de bandeja de entrada de atención al cliente: clasificar los correos de una cartera de morosos en las siete señales permite priorizar la cola de trabajo de los agentes y asignar los casos de mayor sensibilidad primero.
- Detección de promesas de pago: la etiqueta `payment_promise` permite registrar compromisos de pago declarados por el cliente y programar el seguimiento correspondiente sin intervención manual inicial.
- Actualización de datos de contacto: la señal `change_of_details` identifica correos en los que el cliente comunica cambios de dirección o teléfono, que pueden canalizarse a un flujo de actualización de registro.
- Gestión de reclamaciones: la etiqueta `complaint` separa las quejas formales del resto del correo, lo que facilita su derivación al departamento de calidad o cumplimiento normativo.
- Despliegue on-premise en entornos regulados: con 853 millones de parámetros y pesos safetensors, el modelo puede ejecutarse en infraestructura propia del banco sin enviar correos de clientes a servicios externos, lo que encaja con los requisitos de confidencialidad del sector financiero.
- Filtro previo en pipelines de agentes: como clasificador ligero y rápido, puede situarse delante de un asistente mayor (por ejemplo, el ALFRED de 9B) para decidir qué correos requieren razonamiento completo y cuáles pueden resolverse con una etiqueta.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-0.8B base | ALFRED Signal 0.8B | Asistente 9B (zero-shot) |
|---|---|---|---|
| Frases no vistas (280), accuracy | 35,0% | 85,7% | 95,4% |

Los datos proceden de la model card del autor y corresponden a un conjunto de 280 formulaciones no vistas durante el entrenamiento. El asistente de 9B, aproximadamente 11 veces mayor, se evalúa en modo zero-shot. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 852.985.920 parámetros, en fp16 serían aproximadamente 1,7 GB de pesos, y en cuantizaciones de 8 o 4 bits cabría en menos de 1 GB, aunque el autor no publica cifras ni variantes cuantizadas.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPU de consumo, si bien no se detalla ningún modelo concreto (RTX 4090, A100, H100 u otras).
- Cabe en GPU de consumo: previsiblemente sí por el número de parámetros, aunque no hay confirmación ni requisitos publicados por el autor.
- Opciones de despliegue: no se documentan en la información proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en frases no vistas (280) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALFRED Signal Reader 0.8B | 852.985.920 | no disponible | 85,7% | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | 35,0% | no disponible en la informacion | Hugging Face |
| Asistente ALFRED 9B | ~9B (aprox. 11x mayor) | no disponible | 95,4% (zero-shot) | no disponible en la informacion | Referenciado en la model card |

La comparación se limita a los tres modelos citados por el autor en la model card. No se dispone de datos de otros clasificadores de correo bancario comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (clasificación de correo bancario en siete señales) y no debe emplearse como asistente general.
- El 85,7% de acierto implica que aproximadamente 1 de cada 7 correos no vistos puede clasificarse de forma incorrecta; la model card recomienda enrutar a una persona los casos inciertos o con señal negativa.
- Los datos de entrenamiento son sintéticos (Faker) y de conjuntos públicos; el rendimiento sobre correos reales de clientes puede diferir del medido en frases de evaluación.
- Solo se declaran los idiomas inglés e italiano; no hay soporte documentado de español ni de otras lenguas.
- No se documentan sesgos conocidos, riesgos específicos de alucinación ni limitaciones de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se presenta en el contexto de un hackathon sobre un banco ficticio; no se documenta validación en producción ni auditoría regulatoria.
- No se publican requisitos de hardware, opciones de cuantización ni guías de despliegue, lo que dificulta estimar costes operativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/223Harsh/alfred-signal-0.8b
- Repositorio de código, scripts de evaluación y arena de red-team: https://github.com/Harsh223/alfred
- Demo en vivo y arena: https://alfred.harsh.one
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
