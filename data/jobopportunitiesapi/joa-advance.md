# JobOpportunitiesAPI/joa-advance

## Resumen

JOA Advance es un modelo especializado en extracción de información estructurada a partir de anuncios de empleo. Lo desarrolla Job Opportunities API (JOA), una empresa independiente de datos con sede en Tesalónica (Grecia) que comercializa acceso vía API a datos de ofertas laborales. El modelo recibe el texto de una oferta y devuelve 11 campos estructurados en JSON (título, empresa, ubicación, moneda y rango salarial, periodo, seniority, modalidad de teletrabajo, fecha de publicación y si el anunciante es una agencia de colocación), dejando vacío cualquier campo que no aparezca en el texto.

Técnicamente no es un modelo entrenado desde cero: es un adaptador LoRA de rango 16 aplicado sobre ibm-granite/granite-3.3-8b-instruct de IBM, un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros. El ajuste se hizo con 38.488 ejemplos y una sola época, sobre datos generados por Qwen/Qwen3.5-27B a partir de ofertas recogidas por JOA y filtrados por criterio de anclaje (grounding) en el texto original. El entrenamiento se ejecutó en el supercomputador EuroHPC Discoverer+ (Bulgaria) dentro de una asignación AI Factories Playground.

La relevancia actual es doble. Por un lado, demuestra que un adaptador pequeño sobre un modelo de 8B puede superar en una tarea concreta de extracción a un modelo generativo mucho mayor (Qwen3.5-27B), reduciendo además el coste de inferencia de manera drástica. Por otro, es un caso atípico: el autor publica la página de estado, la metodología y los resultados, pero **los pesos no están liberados** (estado a 6 de octubre de 2026), por lo que hoy no es desplegable ni reproducible sin permiso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base granite-3.3-8b-instruct) con adaptador LoRA de rango 16 |
| Parametros totales | ~8.000 millones en el modelo base; número exacto de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (los pesos no se han publicado) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | JOA Model License (prevista, aún no aplicada porque no hay pesos); el modelo base es Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados) |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-3.3-8b-instruct (IBM, Apache 2.0), un transformer decoder-only de tipo denso. Sobre él se entrena un adaptador LoRA de rango 16 durante una única época, con un total de 38.488 ejemplos de entrenamiento. La tarea es de extracción directa: el modelo responde sin traza de razonamiento larga, lo que explica su mediana de 123 tokens de salida frente a los 2.946 del modelo que generó las etiquetas.

Los datos de entrenamiento se construyeron en dos pasos. Primero, Qwen/Qwen3.5-27B (Apache 2.0) extrajo los 11 campos a partir de ofertas recopiladas por JOA. Después se conservaron únicamente los campos anclados en el texto de la oferta (por ejemplo, un título o un salario que aparecen literalmente en el anuncio). Se excluyeron del conjunto de entrenamiento los 250 anuncios de la arena de evaluación y los 250 del conjunto de verificación, para evitar contaminación. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineación posterior; el ajuste es exclusivamente supervisado sobre el adaptador.

No se describen innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, mezcla de expertos). El interés técnico está en la metodología de evaluación y en la eficiencia de inferencia, no en cambios de arquitectura.

## Capacidades

- Extracción estructurada de 11 campos de una oferta de empleo en formato JSON: título, empresa, ubicación, moneda salarial, salario mínimo, salario máximo, periodo salarial, seniority, modalidad de teletrabajo, fecha de publicación y detección de agencia de colocación.
- Respuesta directa, sin cadena de razonamiento larga: mediana de 123 tokens de salida en la arena de evaluación.
- Abstención ante campos ausentes: deja el campo vacío cuando la oferta no lo declara, en lugar de rellenarlo.
- Una única tarea, dominio restringido a anuncios de empleo. No es un asistente general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Agregación e indexación de ofertas de empleo: el modelo convierte texto libre en campos normalizados, lo que permite alimentar buscadores y filtros facetados (salario, ubicación, seniority, teletrabajo) sin parseadores hechos a mano por cada portal.
- Normalización salarial para análisis de mercado laboral: extrae moneda, mínimo, máximo y periodo, lo que facilita comparar rangos entre países y detectar tendencias de compensación por sector y seniority.
- Detección de agencias de colocación en marketplaces: el campo booleano de "agencia" permite filtrar o etiquetar anuncios publicados por intermediarios, algo útil para portales que quieren priorizar ofertas de empleadores directos.
- Enriquecimiento de feeds internos de ATS: un sistema de seguimiento de candidaturas puede procesar ofertas entrantes en texto plano y poblar automáticamente su base de datos estructurada antes de que un reclutador las revise.
- Sistemas de recomendación y matching empleo-candidato: con los campos extraídos se pueden construir vectores de oferta y cruzarlos con perfiles sin necesidad de un LLM grande en el bucle en línea.
- Cumplimiento y transparencia salarial: en jurisdicciones que obligan a publicar el rango salarial, la extracción permite auditar automáticamente qué porcentaje de ofertas lo declara y con qué formato.
- Deduplicación de ofertas: al normalizar título, empresa y ubicación, se pueden detectar publicaciones repetidas del mismo puesto en distintos portales.
- Monitorización de liveness y caducidad (con matiz): el modelo por sí solo no detecta ofertas cerradas según sus propias limitaciones; el caso de uso requiere combinarlo con la comprobación de actividad que JOA realiza por separado.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a dos conjuntos de evaluación con fechas de septiembre y octubre de 2026.

Arena de extracción (250 ofertas reales, 11 campos, dos modelos jueces, bootstrap emparejado, evaluado el 29 de septiembre de 2026):

| Modelo | Puntuación (regla A) | Rango del 95% | Puesto de 84 | Tokens de salida (mediana) |
|---|---|---|---|---|
| JOA Advance | 92,7 | 91,6–93,9 | 2 | 123 |
| granite-3.3-8b-instruct sin ajustar | 86,4 | 84,4–88,2 | 20 | 266 |
| Qwen/Qwen3.5-27B (generador de las etiquetas) | 89,2 | 86,9–91,4 | 4 | 2.946 |

Desglose por campo de JOA Advance (regla A): título 99, empresa 96, ubicación 90, moneda salarial 93, salario mínimo 94, salario máximo 94, periodo salarial 95, seniority 83, modalidad de teletrabajo 91, fecha de publicación 84, agencia 96.

Conjunto verificado (otras 250 ofertas recientes, cada una verificada dos veces por Claude Opus contra la página en vivo y el flujo de solicitud; coincidencia exacta sobre las ofertas abiertas que los tres modelos respondieron; evaluado el 2 de octubre de 2026, n = 237):

| Modelo | Coincidencia exacta |
|---|---|
| granite-3.3-8b-instruct sin ajustar | 71,4 % |
| JOA Advance | 84,7 % |
| Qwen/Qwen3.5-27B | 86,3 % |

Sobre las 244 ofertas de la arena que el modelo entrenador respondió, JOA Advance quedó por delante en 1,9 puntos (rango del 95 %: +0,5 a +3,5).

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador concreto, porque los pesos no se han publicado. Como referencia genérica para el modelo base de ~8B en FP16 se necesitan del orden de 16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones para un transformer denso de ese tamaño y no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para FP16 (RTX 4090, A10G, L4, A100 40 GB, H100). El modelo no requiere hardware de centro de datos en su versión de 8B.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones de 4 y 8 bits sobre RTX 3090, 4080, 4090 y GPUs con 12 GB o más, de nuevo como estimación para un modelo de ~8B.
- Opciones de despliegue: se podría servir con vLLM, TGI, llama.cpp u Ollama una vez publicados los pesos; la elección dependerá del formato que libere el autor (no confirmado). Con adaptadores LoRA, vLLM y TGI permiten cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles. El único dato relacionado es la mediana de 123 tokens de salida en la arena de extracción, notablemente inferior a los 2.946 tokens de Qwen3.5-27B, lo que reduce el coste por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JOA Advance | ~8B (base) + LoRA r16 | no disponible | 92,7 en arena; 84,7 % en verificación | JOA Model License (prevista) | Pesos no publicados |
| granite-3.3-8b-instruct (sin ajustar) | ~8B | no disponible en esta ficha | 86,4 en arena; 71,4 % en verificación | Apache 2.0 | Pesos públicos en HuggingFace |
| Qwen/Qwen3.5-27B (generador de etiquetas) | ~27B | no disponible en esta ficha | 89,2 en arena; 86,3 % en verificación | Apache 2.0 | Pesos públicos en HuggingFace |

La comparación relevante es de eficiencia: JOA Advance iguala o supera al modelo de 27B en la arena con menos de una vigésima parte de tokens de salida, aunque el modelo grande conserva una ligera ventaja (1,6 puntos) en el conjunto verificado. Frente a su propio modelo base sin ajustar, la mejora es de 6,3 puntos en la arena y 13,3 puntos en verificación, lo que cuantifica el efecto del adaptador.

## Limitaciones y advertencias

- Pesos no publicados. A 6 de octubre de 2026 el modelo está entrenado y evaluado, pero los pesos no están disponibles. La licencia descrita es un plan, no una concesión vigente: no se puede usar, redistribuir ni evaluar de forma independiente.
- El modelo lee el texto almacenado por JOA, no la página en vivo. Ese texto suele ser el cuerpo de la descripción, de modo que la cabecera de la página (donde suelen estar el título, la ubicación y la fecha de publicación) puede faltar. Un campo que no está en la entrada no puede extraerse.
- No detecta ofertas cerradas. En el conjunto de verificación clasificó algunas ofertas caducadas como abiertas, porque el texto almacenado no contiene ninguna señal de cierre. JOA comprueba la actividad por separado.
- Campo más débil: la fecha de publicación, con 84 puntos, frente a 88 del modelo entrenador.
- Sesgo de origen en las etiquetas y en la evaluación. Las respuestas de referencia las generó un modelo (Qwen3.5-27B) y los jueces también son modelos. El uso de dos jueces, referencias verificadas e intervalos de confianza reduce el riesgo, pero no lo elimina.
- Modelo de una sola tarea. No es un asistente general y no se debe esperar de él rendimiento en conversación, código o razonamiento abierto.
- Rendimiento limitado por dominio: cualquier oferta con formatos poco habituales, texto truncado o idiomas distintos de los presentes en los datos de entrenamiento puede degradar la extracción.
- Licencia prevista con obligación de atribución visible ("Built with JOA Advance by Job Opportunities API" con enlace) en documentación, página de producto o interfaz, y en la model card de cualquier derivado, además de conservar los avisos Apache 2.0 del modelo base.
- Aviso de no afiliación: el modelo es un fine-tune de granite-3.3-8b-instruct de IBM y no está hecho, respaldado ni soportado por IBM.
- Origen geográfico y contacto: Job Opportunities API es una empresa individual de Loukas Tzekos (Tesalónica, Grecia); contacto legal en luca@tzekos.eu.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/JobOpportunitiesAPI/joa-advance
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- Dataset de la arena de extracción: https://huggingface.co/datasets/JobOpportunitiesAPI/joa-extraction-arena
- Licencia del modelo (LICENSE.md en el repositorio): https://huggingface.co/JobOpportunitiesAPI/joa-advance/blob/main/LICENSE.md
- Sitio de Job Opportunities API: https://jobopportunitiesapi.org
- Contacto general: hello@jobopportunitiesapi.org
- Contacto legal: luca@tzekos.eu
