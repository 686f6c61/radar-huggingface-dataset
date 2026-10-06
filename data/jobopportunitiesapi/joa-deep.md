# JobOpportunitiesAPI/joa-deep

## Resumen

JOA Deep es un adaptador LoRA de rango 16 construido sobre Qwen/Qwen3.8-27B (Qwen team, Alibaba Cloud, licencia Apache 2.0) por Job Opportunities API (JOA), una empresa de datos con sede en Salonica (Grecia). El modelo resuelve una tarea muy concreta: leer el texto de una oferta de empleo y devolver 11 campos estructurados en JSON (puesto, empresa, ubicacion, moneda y rango salarial, periodo, seniority, tipo de remoto, fecha de publicacion y si el anunciante es una agencia de colocacion), dejando vacio cualquier campo que no aparezca en el texto.

El modelo fue entrenado con 60.000 ejemplos durante una sola epoca sobre el supercomputador EuroHPC Discoverer+ en Bulgaria, dentro de una asignacion AI Factories Playground (proyecto EHPC-AIF-2026PG01-1124). Los datos de entrenamiento se generaron a partir de extracciones de Qwen/Qwen3.5-27B sobre ofertas recopiladas por JOA, conservando solo los campos fundamentados literalmente en el texto original.

Es relevante ahora por dos motivos. Primero, por su eficiencia: obtiene 92,2 puntos en el arena de extraccion de JOA, frente a los 88,7 del Qwen3.8-27B sin ajustar, con una mediana de solo 111 tokens de salida frente a 2.517, es decir, respuestas directas sin traza de razonamiento larga. Segundo, y mas importante para quien quiera evaluarlo: a fecha del 6 de octubre de 2026 los pesos **no estan publicados**. La model card documenta resultados y metodologia, pero no existe todavia descarga disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre transformer de base Qwen3.8-27B |
| Parametros totales | No disponible para el adaptador; modelo base de 27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos no publicados) |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | JOA Model License (planificada, aun no efectiva); modelo base Apache 2.0 |
| Formato de pesos | No disponible (pesos no liberados) |

## Arquitectura y entrenamiento

Se trata de un ajuste por adaptador LoRA de rango 16, no de un modelo entrenado desde cero. El modelo base es Qwen/Qwen3.8-27B, un transformer de 27.000 millones de parametros desarrollado por el equipo Qwen de Alibaba Cloud bajo licencia Apache 2.0. El entrenamiento consistio en una unica epoca sobre 60.000 ejemplos de extraccion. No se menciona uso de RLHF ni DPO; el objetivo es una tarea de extraccion determinista, no de alineacion conversacional.

Los datos de entrenamiento se construyeron de forma indirecta: Qwen/Qwen3.5-27B (tambien Apache 2.0) extrajo los campos de las ofertas recopiladas por JOA, y solo se conservaron los ejemplos en los que el valor estaba fundamentado en el texto de la oferta (por ejemplo, un titulo o un salario que aparece literalmente). Se excluyeron del entrenamiento las 250 ofertas del arena y las 250 del conjunto de verificacion. La innovacion destacable no es arquitectonica sino de eficiencia de salida: el modelo responde directamente en JSON sin cadena de razonamiento, lo que reduce la mediana de tokens generados de 2.517 (base) a 111. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion estructurada de 11 campos de una oferta de empleo a JSON: title, company, location, salary currency, salary min, salary max, salary period, seniority, remote type, posted date y agency.
- Respuesta directa sin traza de razonamiento larga (mediana de 111 tokens de salida en el arena), apta para pipelines de alto volumen.
- Omision controlada: deja un campo vacio cuando la oferta no lo declara, en lugar de inventarlo.
- Generacion de texto derivada del modelo base, aunque no es su funcion objetivo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue explicita en la informacion disponible.
- No se documenta capacidad de vision, audio ni modo thinking.
- Ambito funcional unico: es un extractor de ofertas de empleo, no un asistente general.

## Casos de uso

- Ingesta masiva de ofertas de empleo en un job board: el modelo convierte texto libre en JSON con 11 campos, lo que permite indexar y filtrar por salario, seniority o modalidad remota sin trabajo manual.
- Normalizacion de salarios para comparativas de mercado: al extraer moneda, minimo, maximo y periodo, se pueden agregar rangos salariales por puesto y region de forma automatizada.
- Deteccion de agencias de colocacion: el campo "agency" (96 de puntuacion en el arena) permite separar anuncios de empleadores directos de los de intermediarios, util para moderacion de calidad del listado.
- Alimentacion de motores de busqueda y recomendacion: con los campos estructurados se pueden construir filtros facetados (ubicacion, remoto, seniority) sobre un corpus de ofertas sin procesamiento posterior.
- Pipelines de datos para productos analiticos: al ser un LoRA sobre un base Apache 2.0, puede integrarse en flujos por lotes donde prime el coste por documento bajo (111 tokens de salida por oferta).
- Clasificacion y enrutado de candidaturas: los campos de seniority y tipo de remoto permiten dirigir ofertas a segmentos de candidatos o a bolsas de empleo especificas de forma automatica.
- Enriquecimiento de CRM o ATS: al devolver JSON directo, encaja como paso de extraccion dentro de un sistema de seguimiento de candidaturas que ya consuma ese formato.

## Benchmarks y rendimiento

Arena de extraccion de JOA (250 ofertas reales, 11 campos, dos modelos juez, bootstrap emparejado; evaluado el 2 de octubre de 2026):

| Modelo | Puntuacion (regla A) | Rango 95% | Puesto de 84 | Tokens de salida (mediana) |
|---|---|---|---|---|
| JOA Deep | 92,2 | 91,0-93,4 | 3 | 111 |
| Qwen3.8-27B base | 88,7 | 86,5-90,8 | 9 | 2.517 |
| Qwen3.5-27B (entrenador) | 89,2 | 86,9-91,4 | 4 | 2.946 |

Puntuacion por campo (regla A): title 99, company 96, location 90, salary currency 92, salary min 93, salary max 93, salary period 96, seniority 86, remote type 92, posted date 72, agency 96.

Conjunto de ofertas verificadas (250 anuncios recientes, cada uno verificado dos veces con Claude Opus contra la pagina en vivo; coincidencia exacta en los anuncios abiertos que los tres modelos respondieron; n = 240, evaluado el 2 de octubre de 2026):

| Modelo | Tasa de coincidencia exacta |
|---|---|
| Qwen3.8-27B base | 82,2% |
| JOA Deep | 85,3% |
| Qwen3.5-27B (entrenador) | 86,1% |

## Requisitos de hardware

- Los pesos del adaptador no estan publicados, por lo que no hay cifras oficiales de despliegue. Las estimaciones siguientes se derivan del tamano del modelo base (27B) y son orientativas.
- VRAM estimada para el modelo base en FP16: aproximadamente 54 GB; en cuantizacion de 8 bits, en torno a 27 GB; en 4 bits, alrededor de 14-16 GB. El adaptador LoRA anade una sobrecarga minima.
- GPU recomendadas: A100 80 GB o H100 para FP16; A100 40 GB o L40S para 8 bits; una RTX 4090 (24 GB) podria alojar el modelo base en cuantizacion de 4 bits.
- Cabe en GPU de consumo (RTX 3090, 4090, 5090) solo con cuantizacion agresiva de 4 bits del modelo base.
- Opciones de despliegue: vLLM o TGI para el modelo base con el adaptador aplicado; llama.cpp u Ollama si se convierte a GGUF; PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles. Como referencia de coste, el modelo genera una mediana de 111 tokens de salida por oferta, muy por debajo de los 2.517 del modelo base sin ajustar.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Puntuacion arena | Tokens de salida (mediana) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JOA Deep | Base 27B + LoRA r16 | Extraccion de ofertas | 92,2 | 111 | JOA Model License (planificada) | Pesos no publicados |
| Qwen3.8-27B base | 27B | Modelo generalista | 88,7 | 2.517 | Apache 2.0 | Publicado |
| Qwen3.5-27B (entrenador) | 27B | Modelo generalista | 89,2 | 2.946 | Apache 2.0 | Publicado |
| JOA Small | No disponible | Extraccion de ofertas | Superior a JOA Deep en el arena segun la model card | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los pesos no estan liberados a fecha del 6 de octubre de 2026; la licencia JOA Model License es un plan, no una concesion efectiva. No se puede usar en produccion todavia.
- El modelo lee el texto almacenado por JOA, no la pagina en vivo. Ese texto suele ser el cuerpo de la descripcion, por lo que la cabecera (donde suelen estar el titulo, la ubicacion y la fecha) puede faltar. Un campo ausente en la entrada no puede extraerse.
- No puede detectar que una oferta se ha cerrado: en el conjunto de verificacion clasifico algunos anuncios muertos como abiertos. JOA comprueba la vigencia por separado.
- La fecha de publicacion es su punto debil manifiesto (72, frente a 92 del modelo base y 89 de JOA Small). No se debe confiar en ese campo hasta un reentrenamiento.
- Segun la propia model card, "mas grande no es mejor": el modelo queda estadisticamente por detras de JOA Small en el arena pese a costar mucho mas de ejecutar.
- Las respuestas de referencia y los jueces son modelos, no anotadores humanos. El uso de dos jueces, referencias verificadas e intervalos de confianza reduce el riesgo, pero no lo elimina.
- Es una herramienta de una sola tarea; no debe emplearse como asistente general.
- Los sesgos conocidos y el comportamiento multilingue no se documentan en la informacion disponible.
- La licencia planificada exige credito visible ("Built with JOA Deep by Job Opportunities API" con enlace) en documentacion, pagina de acerca de o interfaz, y en la model card de cualquier derivado, ademas de conservar la licencia Apache 2.0 del modelo base y no implicar respaldo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JobOpportunitiesAPI/joa-deep
- Dataset del arena de extraccion: https://huggingface.co/datasets/JobOpportunitiesAPI/joa-extraction-arena
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo empleado como entrenador: https://huggingface.co/Qwen/Qwen3.5-27B
- Sitio de Job Opportunities API: https://jobopportunitiesapi.org
- Licencia (LICENSE.md en el repositorio del modelo)
- Contacto general: hello@jobopportunitiesapi.org
- Asuntos legales: luca@tzekos.eu
