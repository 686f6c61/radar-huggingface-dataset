# Gydeai/vehicle-complaint-triage-us-nhtsa

## Resumen

Gyde Vehicle Complaint Triage `us-nhtsa` es un adaptador LoRA sobre el modelo base Qwen3-8B, desarrollado por Gyde (DAI Labs Private Limited, Pune, India). Su funcion es clasificar quejas de defectos de vehiculos estadounidenses en uno de los 17 grupos de componentes que utiliza la NHTSA (National Highway Traffic Safety Administration), como frenos de servicio, airbags o tren motriz. El adaptador sustituye la logica de enrutamiento de reclamaciones de garantia y tickets de servicio en el sector de fabricacion: el cliente describe la averia con sus propias palabras y el modelo la dirige al equipo responsable de ese componente.

Tecnicamente, se trata de un adaptador de bajo rango (LoRA rank 16, alpha 32, dropout 0.05) aplicado sobre las proyecciones de atencion y MLP de Qwen3-8B. El modelo se usa con decodificacion greedy (temperatura 0), modo de pensamiento desactivado y una plantilla de prompt muy concreta que fuerza una respuesta JSON con la etiqueta del componente. Segun la model card, alcanza un 87.6% de precision y un macro-F1 de 0.846 sobre un conjunto de prueba de 2.000 quejas, lo que lo situa practicamente a la par de Claude Sonnet 5.5 (86.3%) y unos 10 puntos por encima del Qwen3-8B sin ajustar (77.5%).

La relevancia actual es doble: por un lado, demuestra que un ajuste fino pequeno y barato sobre un modelo abierto de 8.000 millones de parametros puede igualar a modelos propietarios de primera linea en una tarea de clasificacion vertical muy especifica; por otro, publica cifras de coste por cada 1.000 quejas procesadas (del orden de 0,004 a 0,024 USD en una GPU A30 o L4), lo que lo hace atractivo para despliegues en produccion con volumen alto y presupuesto ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformer decoder Qwen3-8B |
| Parametros totales | No disponible (el adaptador pesa 0.2 GB; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador); Qwen3-8B bajo su propia licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder de 8.000 millones de parametros. Los modulos LoRA se insertan en todas las proyecciones de atencion y MLP, con rango 16, alpha 32 y dropout 0.05. El entrenamiento consistio en una sola epoca sobre 8.000 quejas, con tasa de aprendizaje 2e-4 y una duracion de 20 minutos en una unica GPU A100 de 80 GB. La perdida se calculo unicamente sobre la respuesta (la etiqueta del componente), no sobre el texto de la queja, lo que concentra el ajuste en la tarea de clasificacion.

Los datos provienen del fichero `COMPLAINTS_RECEIVED_2025-2026` de la Office of Defects Investigation de la NHTSA (obra del gobierno estadounidense). Se filtraron las quejas registradas bajo un unico componente, con narrativas de entre 200 y 4.000 caracteres, eliminando la categoria "Unknown or other", fusionando grupos renombrados (por ejemplo, "Service brakes, hydraulic" en "Service brakes") y descartando grupos con menos de 400 quejas, asi como textos de campanas de retirada que citaban el componente. La particion se hizo por fecha: 8.000 quejas para entrenamiento (las mas antiguas), 1.000 para validacion y 2.000 para prueba (las mas recientes, de octubre de 2026). El conjunto de entrenamiento no se distribuye con el adaptador.

## Capacidades

- Clasificacion de quejas de defectos de vehiculos en 17 grupos de componentes de la NHTSA (frenos de servicio, airbags, tren motriz, entre otros).
- Generacion de respuestas en formato JSON estricto (`{"component": ...}`) cuando se usa la plantilla de prompt de entrenamiento.
- Enrutamiento de reclamaciones de garantia y tickets de servicio a equipos responsables de componentes.
- Procesamiento de texto libre escrito por propietarios de vehiculos, con narrativas de entre 200 y 4.000 caracteres.
- Funcionamiento con decodificacion greedy y modo de pensamiento desactivado, lo que reduce latencia y coste por consulta.
- No soporta tool calling, agentes, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Enrutamiento de reclamaciones de garantia en fabricantes de automocion: el modelo recibe la descripcion del fallo escrita por el cliente y la asigna al equipo de componente correspondiente, reduciendo el tiempo de triaje manual y los errores de asignacion.
- Clasificacion de tickets de servicio en concesionarios y talleres: integrado en el sistema de gestion de tickets, asigna automaticamente cada averia a la cola del mecanico o especialista adecuado segun el componente afectado.
- Analitica de defectos y tendencias: al etiquetar grandes volumenes de quejas de forma consistente, permite agregar y detectar patrones por componente a lo largo del tiempo, alimentando informes de calidad.
- Procesamiento por lotes nocturno de miles de quejas: con un coste estimado de 0,022 USD por cada 1.000 quejas en una A30, es viable reprocesar historicos completos de reclamaciones cada noche.
- Monitorizacion de seguridad postventa: el modelo puede clasificar quejas entrantes en tiempo real para detectar picos en componentes criticos (frenos, airbags) y activar alertas tempranas al equipo de calidad.
- Sustitucion de clasificadores de palabras clave (TF-IDF): el adaptador supera en unos 5 puntos de precision a un clasificador TF-IDF entrenado con los mismos datos, por lo que puede reemplazar sistemas de reglas o palabras clave ya existentes.
- Despliegue en la nube del cliente con vLLM y LoRA habilitado: permite servir el adaptador junto al modelo base en infraestructura propia, manteniendo los datos de quejas dentro del perimetro de la organizacion.

## Benchmarks y rendimiento

Resultados sobre 2.000 quejas de un solo componente recibidas entre el 6 y el 28 de octubre de 2026 (todas posteriores a las de entrenamiento). Mismo conjunto de prueba para todos los modelos.

| Modelo | Precision | Macro-F1 | Respuestas invalidas |
|---|---:|---:|---:|
| Este adaptador (Qwen3-8B + LoRA, rank 16) | 87.6% | 0.846 | 0 |
| Claude Sonnet 5.5, lista de componentes en el prompt | 86.3% | 0.828 | 0 |
| Claude Haiku 5.5, lista de componentes en el prompt | 85.6% | 0.810 | 1 |
| Clasificador TF-IDF por palabras clave, mismos datos | 82.2% | No disponible | No disponible |
| Qwen3-8B sin ajustar, lista de componentes en el prompt | 77.5% | 0.729 | 3 |

Coste por cada 1.000 quejas (USD), segun la model card:

| Modelo | Tiempo real | Lote nocturno de 1.000 | Lote de 10.000 |
|---|---:|---:|---:|
| Este adaptador en una NVIDIA A30 | ~0.004 | ~0.022 | ~0.006 |
| Este adaptador en una NVIDIA L4 | ~0.007 | ~0.024 | ~0.009 |
| Claude Haiku 5.5 | ~0.11 | ~0.056 | ~0.056 |
| Claude Sonnet 5.5 | ~1.68 | ~0.84 | ~0.84 |

Mediciones del adaptador: 2.000 quejas en 72 s en una A30 (JarvisLabs, 0.41 USD/h) y en 135 s en una L4 (CloudPe, 0.37 USD/h), con 64 peticiones en paralelo y una precision del 87.5% al 87.6%. Los lotes incluyen 160 s de arranque de la GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el adaptador en si ocupa 0.2 GB y se suma a los requisitos del modelo base Qwen3-8B.
- GPU recomendadas segun las mediciones publicadas: NVIDIA A30 y NVIDIA L4 para produccion; el entrenamiento se realizo en una A100 de 80 GB.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; Qwen3-8B en cuantizaciones de 4 bits suele caber en GPUs de 8-16 GB, pero no hay datos especificos para este adaptador.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16` y el modulo `us-nhtsa`; la model card proporciona un ejemplo con el cliente OpenAI compatible.
- Latencia y throughput: 2.000 quejas en 72 s en A30 y en 135 s en L4 con 64 peticiones en paralelo; coste estimado de 0,004 a 0,024 USD por cada 1.000 quejas segun el modo de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (test NHTSA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyde `us-nhtsa` (Qwen3-8B + LoRA) | 8.000 M (base) + adaptador | No disponible | 87.6% | Apache 2.0 | Hugging Face, pesos abiertos |
| Claude Sonnet 5.5 | No disponible | No disponible | 86.3% | Propietaria | API de Anthropic |
| Claude Haiku 5.5 | No disponible | No disponible | 85.6% | Propietaria | API de Anthropic |
| Qwen3-8B sin ajustar | 8.000 M | No disponible | 77.5% | Apache 2.0 | Hugging Face |
| Clasificador TF-IDF | No aplica | No aplica | 82.2% | No disponible | Entrenamiento propio |

La comparativa se limita a los modelos incluidos en la model card; no se dispone de datos de otros adaptadores o modelos especializados en triaje de quejas de vehiculos.

## Limitaciones y advertencias

- Solo cubre vehiculos estadounidenses y los grupos de componentes de la NHTSA; los codigos de garantia propios de cada fabricante requieren un entrenamiento especifico.
- Solo funciona en ingles, tal y como lo escriben los propietarios.
- Esta pensado para enrutamiento y analitica, no para decisiones de seguridad ni determinaciones de defectos; las respuestas de baja confianza deben derivarse a una persona.
- Riesgo de alucinacion: aunque el adaptador fue entrenado para emitir solo una etiqueta de componente, no se documentan mecanismos de validacion de la salida mas alla del formato JSON.
- El modelo base procede de Qwen (Alibaba Cloud) y esta sujeto a su propia licencia Apache 2.0.
- Los datos de entrenamiento no se distribuyen con el adaptador; la NHTSA anonimiza la mayoria de datos personales, pero algunas narrativas pueden contener telefonos o VIN.
- No se han publicado datos sobre sesgos especificos del adaptador.
- El adaptador esta disenado para funcionar con una plantilla de prompt concreta; desviarse de ella puede degradar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Gydeai/vehicle-complaint-triage-us-nhtsa
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Datos de quejas NHTSA: https://static.nhtsa.gov/odi/ffdd/cmpl/
- Sitio del desarrollador: https://gyde.ai
