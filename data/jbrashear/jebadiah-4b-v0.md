# jbrashear/jebadiah-4b-v0

## Resumen

Jebadiah 4B v0 (abreviado "Jeb") es un modelo de decisión de estilo Sistema 1 publicado por el usuario jbrashear. No es un modelo generativo: en lugar de producir texto, responde preguntas tipadas devolviendo una distribución de probabilidad calibrada sobre las etiquetas de opción. Se distribuye como un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B-Base (revisión fijada `1001bb4d`), con licencia Apache 2.0 y soporte únicamente para inglés.

El modelo cubre tres tipos de pregunta: `choice` (elegir una entre N opciones), `noul` (una afirmación de sí/no devuelta como P(sí)) y `score` (situar el estado en una rúbrica ordenada). El adaptador se entrenó con el entrenador de AINode sobre 11.072 preguntas públicas del conjunto LocalLLaMA/typed-decisions, una sola época, en una H100 PCIe durante 39 minutos. El repositorio ocupa 0,2 GB y existe un hermano de 9B, jbrashear/jebadiah-9b-v0.

Su relevancia actual está en el nicho de los modelos de decisión enrutables: sustituye la generación libre por una lectura de logits en la última posición del prompt, lo que permite obtener probabilidades calibradas y auditar cada decisión. La versión v0 es fija y no se sobrescribirá; las versiones nuevas se publicarán como repositorios independientes. A fecha de la información disponible el modelo acumula 0 descargas y 0 "likes", por lo que carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only causal (Qwen/Qwen3.5-4B-Base); detalles internos del base no disponibles |
| Parametros totales | 4B en el modelo base; adaptador LoRA de 0,2 GB (peso real del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye el adaptador en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B-Base, revision fijada 1001bb4d |
| Dataset de entrenamiento | LocalLLaMA/typed-decisions (11.072 preguntas publicas, 1 epoca) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Qwen/Qwen3.5-4B-Base, un transformer decoder-only causal, sobre el que se aplica un adaptador LoRA entrenado con la librería PEFT. La innovación no está en el backbone sino en la interfaz de salida: el prompt se renderiza con el sistema propio de AINode (`ainode.api.decide.build_messages`, commit de origen `e5c08938`, con `prompt_source_sha256 d2660ebe...` registrado en `prompt_contract.json`) a través de la plantilla de chat del modelo base con el modo de razonamiento desactivado. Los estados, instrucciones y opciones se presentan como texto estructurado, las etiquetas de opción son tokens únicos (68 en total) y la respuesta se obtiene como la distribución sobre esos tokens de etiqueta en la última posición del prompt, leída en fp32 desde el último estado oculto y reescalada por temperatura según el tipo: `choice` 0,95, `noul` 1,09 y `score` 0,40 (valores en `temperatures.json`, ajustados sobre una porción de calibración reservada del conjunto de entrenamiento). No se genera ningún token de texto.

El entrenamiento consistió en una única época sobre 11.072 preguntas públicas, ejecutada en una H100 PCIe en 39 minutos. No se documentan en la información disponible ni el número total de tokens procesados, ni la composición detallada del dataset, ni si hubo etapas de RLHF o DPO; el uso de "targets de profesor suaves" se menciona de forma indirecta al justificar el ajuste de la temperatura del tipo `score`. Toda la traza de evaluación (claves de opción, probabilidades, elección, etiqueta, repetición y orden de opciones por pregunta) se conserva en el directorio `eval/` del repositorio, con `eval/results.json` conteniendo el conjunto completo de métricas (Brier, NLL, ECE bruto y ajustado, suelos por pregunta y flips con sus diferencias top-2) junto a la configuración de entrenamiento resuelta.

## Capacidades

- Clasificación con decisiones tipadas: devuelve una distribución de probabilidad sobre etiquetas de opción, no texto libre.
- Tipo `choice`: selección de una opción entre N alternativas (evaluado con 77 opciones en Banking77).
- Tipo `noul`: afirmaciones de sí/no devueltas como probabilidad P(sí) (evaluado en PubMedQA).
- Tipo `score`: ubicación de un estado en una rúbrica ordenada (evaluado con 5 niveles en HelpSteer2 helpfulness).
- Probabilidades calibradas: la model card reporta ECE de 0,021 en PubMedQA, 0,110 en Banking77 y 0,082 en el conjunto retenido de Nimble, con temperaturas aplicadas por tipo.
- Estabilidad entre repeticiones: entre 0,0 % y 0,7 % de cambios de elección en repeticiones idénticas según el conjunto.
- Multilingüe: no. El campo `language` declarado es únicamente `en`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas; la lectura es de una sola pasada por pregunta.
- Capacidades especiales: modo de "system one" expuesto mediante las rutas `/v1/decide` y `/v1/systemone` de AINode; no hay visión, audio ni modo de pensamiento.

## Casos de uso

- Enrutamiento de tickets de soporte: con preguntas de tipo `choice` se puede asignar cada ticket a un equipo (por ejemplo, `billing`, `support`, `sales`) y obtener la probabilidad de cada destino, lo que permite definir umbrales de confianza y derivar a revisión humana los casos dudosos.
- Triaje de urgencia en atención al cliente: una pregunta de tipo `noul` como "el cliente está bloqueado para trabajar" devuelve P(sí) directamente, integrable en colas de priorización sin necesidad de parsear texto generado.
- Moderación de contenido y seguridad: el conjunto aegis2 obtiene 80,0 de exactitud en la evaluación de Nimble, por lo que es utilizable como clasificador de seguridad con decisión auditable.
- Clasificación de intención en asistentes conversacionales: 68,7 de exactitud con 77 intenciones posibles (Banking77) lo sitúa como candidato para enrutado de intenciones en dominios acotados, siempre con margen de error asumido.
- Filtrado de respuestas en pipelines de generación: combinado con un modelo generativo, puede actuar como verificador `noul` sobre la consistencia, relevancia o fidelidad al contexto antes de mostrar la respuesta al usuario.
- Enrutado de consultas clínicas o científicas: 87,7 de exactitud y ECE de 0,021 en PubMedQA permiten usar la probabilidad como señal fiable en flujos de pregunta-respuesta biomédica donde importa cuantificar la incertidumbre.
- Evaluación automática de calidad con rúbricas: aunque el tipo `score` es su punto débil (36,3 de exactitud en HelpSteer2, por debajo del suelo de 41,7), puede emplearse en rúbricas internas solo si se valida previamente la calibración en el dominio concreto.
- Puerta de decisión en sistemas multiagente: con una sola lectura de logits por pregunta y latencia dependiente únicamente del prefill, sirve como paso barato de desambiguación entre agentes especializados.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (`verified: false` en todos los casos). La exactitud es la proporción de preguntas cuya etiqueta principal coincide con la etiqueta humana; el Decision Score de Jevals se define como 100 = perfecto, 0 = equiparable a adivinar según las tasas base, y por debajo de 0 = peor que eso.

| Conjunto (preguntas) | Tipo | Exactitud | Suelo (etiqueta mayoritaria) | Decision score (Jevals) | ECE (temperaturas aplicadas) | Flips en repeticiones idénticas |
|---|---|---:|---:|---:|---:|---:|
| Jevals PubMedQA (300) | noul | 87,7 | 62,0 | 62,0 | 0,021 | 0,3 % |
| Jevals Banking77 (300, 77 opciones) | choice | 68,7 | 1,3 | 53,8 | 0,110 | 0,7 % |
| Jevals HelpSteer2 helpfulness (300, 5 niveles) | score | 36,3 | 41,7 | -20,2 | 0,439 (bruto 0,249) | 0,3 % |
| Nimble held-out eval (324) | mixto | 77,5 | 17,6 | 59,2 | 0,082 | 0,0 % |
| Kev transfer-v4 test (764) | mixto | 82,5 | 21,5 | 63,6 | 0,062 | 0,3 % |
| Kev decision-v7 test (1.440) | mixto | 78,5 | 20,3 | 66,8 | 0,118 | n/a |
| typed-decisions test (2.000) | mixto | 79,8 | 15,3 | 59,0 | 0,077 | 0,1 % |

Resultados de la model card declarados en el `model-index` para los tres conjuntos principales: PubMedQA (noul) con exactitud 87,7 y decision score 62,0; Banking77 (choice, 77 vías) con exactitud 68,7 y decision score 53,8; y los 13 subconjuntos públicos etiquetados por humanos de Nimble con exactitud macro 73,0.

Desglose por subconjunto de Nimble (3.880 preguntas en total, exactitud macro 73,0):

| Subconjunto | Exactitud |
|---|---:|
| aegis2 | 80,0 |
| boolq | 87,0 |
| civil_comments | 79,3 |
| helpsteer2 | 33,3 |
| massive-de-DE | 82,6 |
| massive-en-US | 84,6 |
| multinli | 83,6 |
| paws | 79,2 |
| pubmedqa | 68,0 |
| squad2 | 73,6 |
| summeval-consistency | 79,2 |
| summeval-relevance | 45,4 |
| vitaminc-dev | 73,6 |

Referencia comparativa aportada por el propio autor: sobre los mismos subconjuntos de Nimble, la tabla publicada de Bespoke sitúa a Nimble-9B en 74,8 y a Jev en 76,0 con su scorer, mientras que el modelo base de 4B sin entrenar obtiene 65,7 con el scorer propio.

## Requisitos de hardware

- Naturaleza del artefacto: el repositorio contiene únicamente el adaptador LoRA (0,2 GB). La VRAM necesaria corresponde al modelo base Qwen/Qwen3.5-4B-Base más el adaptador.
- VRAM estimada para inferencia (orientativa, no publicada por el autor): en torno a 9-10 GB en bf16/fp16, 4-5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits.
- GPU recomendadas: el autor indica que se sirve en cualquier GPU NVIDIA a través de AINode. El entrenamiento se realizó en una H100 PCIe.
- GPU de consumo: sí cabe en GPU de consumo con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080, RTX 3090, RTX 4090), especialmente con el base cuantizado.
- Opciones de despliegue: la vía soportada es AINode, que expone las rutas `/v1/decide` y `/v1/systemone` y reproduce el prompt exactamente como se entrenó. También se documenta el uso independiente con `transformers` + `peft` (`AutoModelForCausalLM` + `PeftModel`), siempre que el renderizado, los tokens de etiqueta y la lectura en fp32 respeten el contrato (`prompt_contract.json` y el código fuente de AINode).
- Compatibilidad con otros servidores: no disponible. No se documenta vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles para inferencia. El único dato temporal publicado es el entrenamiento: 1 época sobre 11.072 preguntas en 39 minutos en una H100 PCIe. El coste por consulta equivale a un único prefill con lectura de logits en la última posición, sin fase de decodificación generativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jebadiah-4b-v0 | 4B (base) + LoRA | no disponible | 73,0 macro en Nimble (scorer propio); 87,7 PubMedQA; 68,7 Banking77 | apache-2.0 | HuggingFace, via AINode |
| jbrashear/jebadiah-9b-v0 | 9B (base) + LoRA | no disponible | No disponible en esta informacion | no disponible | HuggingFace |
| Nimble-9B | 9B | no disponible | 74,8 macro en Nimble (scorer de Bespoke) | no disponible | Tabla publicada por Bespoke |
| Jev | no disponible | no disponible | 76,0 macro en Nimble (scorer de Bespoke) | no disponible | Tabla publicada por Bespoke |
| Qwen/Qwen3.5-4B-Base sin entrenar | 4B | no disponible | 65,7 macro en Nimble (scorer propio) | no disponible | HuggingFace |

La comparación directa en los subconjuntos de Nimble sugiere que el adaptador aporta 7,3 puntos de exactitud macro sobre el modelo base sin entrenar, pero queda por debajo de las cifras publicadas para Nimble-9B (-1,8) y Jev (-3,0) medidas con otro scorer, por lo que la comparación no es estrictamente homogénea.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto y no puede usarse para chat, redacción ni resumen. Solo emite distribuciones sobre 68 tokens de etiqueta predefinidos.
- El tipo `score` sobre rúbricas humanas es claramente deficiente: 36,3 de exactitud en HelpSteer2 helpfulness frente a un suelo de 41,7 (decision score -20,2) y 45,4 en summeval-relevance. La temperatura ajustada de 0,40 empeora la calibración de HelpSteer2 (ECE 0,439 frente a 0,249 en bruto), según reconoce el propio autor.
- Riesgo de dependencia del contrato de prompt: el renderizado, los tokens de etiqueta y la lectura en fp32 deben coincidir exactamente con `prompt_contract.json`; cualquier desviación invalida las métricas publicadas.
- Idiomas: únicamente inglés. El único subconjunto no inglés evaluado (massive-de-DE, 82,6) forma parte de una suite multilingüe, pero el campo `language` declarado no incluye el alemán.
- Sesgos conocidos: la información disponible no documenta auditorías de sesgo. Los subconjuntos de civil_comments y aegis2 tienen implicaciones de moderación que conviene validar en el dominio propio.
- Calibración variable por tarea: el ECE va de 0,021 (PubMedQA) a 0,110 (Banking77), por lo que los umbrales de decisión deben recalibrarse por dominio.
- Benchmarks sin verificar: los 17 valores del `model-index` y de la tabla ampliada están marcados como `verified: false` y proceden del propio autor, sin reproducción independiente.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta; no existe evidencia de terceros sobre su comportamiento en producción.
- Licencia: el adaptador se declara bajo apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-4B-Base no se especifica en la información disponible y debe verificarse antes de un despliegue comercial.
- Límite de contexto no documentado: no puede planificarse un caso de uso con entradas largas sin medirlo previamente.
- Versionado fijo: v0 no se actualizará. Las mejoras llegan como repositorios nuevos, por lo que habrá que migrar de identificador para recibir correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbrashear/jebadiah-4b-v0
- Modelo hermano de 9B: https://huggingface.co/jbrashear/jebadiah-9b-v0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio o web de AINode: no disponible
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante al modelo; los unicos resultados obtenidos correspondian al servicio de streaming Joyn y no guardan relacion con esta ficha.
