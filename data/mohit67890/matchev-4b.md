# mohit67890/matchev-4b

## Resumen

matchev-4b es un adaptador LoRA (rango 16, alpha 32) sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario mohit67890. No es un modelo de lenguaje generalista ni un matcher autónomo: es la capa aprendida dentro del paquete Matchev, un sistema de cinco capas que resuelve problemas de entity resolution, record linkage y conciliación de pagos (cash application). El adaptador recibe una pregunta construida por las capas deterministas del sistema (un registro y hasta 23 opciones candidatas) y devuelve una elección o "none" a partir de los logits de los códigos de opción, en un único forward pass por registro.

La propuesta diferencial es la calibración: el adaptador se acompaña de un fichero `calibration.json` con una temperatura de 1,3133 ajustada sobre preguntas de entrenamiento reservadas, de modo que la probabilidad `p` devuelta es directamente utilizable para automatizar decisiones. El autor reporta que el 92% de las preguntas se responden con p ≥ 0,95 y que el 98% de esas respuestas son correctas, con un coste de aproximadamente 0,09 USD por cada 1.000 preguntas en GPUs alquiladas.

El modelo está pensado para integrarse en pipelines donde el código exacto hace el trabajo determinista (aritmética, reglas, búsqueda de candidatos) y la red neuronal solo juzga lo que el código no puede resolver. Su relevancia actual radica en ese enfoque híbrido: un modelo pequeño de 4B parámetros que compite en precisión de conciliación de pagos con modelos frontera mucho más caros, a una fracción del coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | 4B (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT); incluye `calibration.json` |
| Revision del modelo base | `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` |
| Tamano del repo | 0,1 GB |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parámetros, mediante PEFT con rango 16 y alpha 32. La tarea no es generación libre de texto sino selección entre opciones: el modelo lee una pregunta que contiene un registro y hasta 23 opciones candidatas (registros candidatos o grupos de pagos con sus explicaciones) y emite su elección leyendo los logits correspondientes a los códigos de opción, o "none" si ninguna encaja. El entrenamiento se realizó sobre preguntas generadas por las capas deterministas de Matchev, y la calibración de temperatura (1,3133) se ajustó en un único forward pass sobre preguntas reservadas del conjunto de entrenamiento.

El diseño separa explícitamente lo determinista de lo aprendido: el código exacto encuentra candidatos, hace la aritmética y verifica reglas; el adaptador solo juzga los casos ambiguos. El autor reporta que el código por sí solo resuelve aproximadamente un cuarto de los pagos generados sin necesidad de llamar al modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación y selección de registros: dado un registro y un conjunto de opciones, elige la opción correcta o "none".
- Entity resolution y record linkage: identifica qué registros pertenecen al mismo grupo.
- Conciliación de pagos (cash application): agrupa pagos con facturas, incluyendo pagos parciales, retenciones y comisiones bancarias.
- Probabilidades calibradas: devuelve una `p` calibrada mediante temperatura, apta para umbrales de automatización.
- Explicación de diferencias: las opciones incluyen explicaciones tipadas de cada diferencia, que el modelo evalúa.
- Procesamiento por conjuntos: acepta conjuntos completos de registros (probado hasta 136.500 registros) y devuelve grupos, no puntuaciones por pares.
- Garantías verificadas por código: totales que cuadran, ningún registro usado dos veces, grupos confirmados que se mantienen y pares rechazados que no reaparecen; una respuesta que rompe una garantía no se envía.
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma nativa; su función es la clasificación dentro del paquete Matchev.

## Casos de uso

- Conciliación de pagos en cuentas por cobrar: el sistema recibe pagos bancarios y facturas abiertas, el código genera los grupos candidatos y el adaptador decide qué pago liquida qué factura, incluyendo pagos parciales y retenciones, con una `p` calibrada para automatizar el 92% de los casos por encima de 0,95.
- Entity resolution en bases de datos de clientes: deduplicación de registros con variaciones de nombre, dirección o identificadores fiscales, donde el código filtra candidatos por reglas exactas y el adaptador resuelve los pares ambiguos.
- Record linkage entre sistemas heterogéneos: unión de registros entre un ERP y un CRM o entre un sistema legacy y uno nuevo, usando el adaptador para juzgar los casos que las reglas de negocio no cubren.
- Automatización de la aplicación de efectivo en tesorería: procesamiento por lotes de extractos bancarios contra el libro mayor, con garantías verificadas de que ningún pago se aplica dos veces y los totales cuadran.
- Auditoría y explicabilidad de conciliaciones: cada grupo devuelto incluye explicaciones tipadas de las diferencias (retenciones, comisiones, redondeos), lo que facilita la revisión por parte de un humano en los casos con `p` baja.
- Despliegue autoalojado con coste controlado: el modelo se sirve con el paquete Matchev en GPUs alquiladas a un coste reportado de 0,09 USD por 1.000 preguntas, lo que permite procesar volúmenes altos sin depender de APIs de modelos frontera.
- Corrección sin reentrenamiento: según el autor, las correcciones se aplican sin entrenar de nuevo, lo que facilita el ajuste a reglas de negocio cambiantes.

## Benchmarks y rendimiento

El autor reporta resultados sobre 7.200 preguntas de test. La comparación se hace con Sonnet 5.5, Haiku 5.5, Jev 1.14 y el mejor enfoque basado solo en código:

| Metrica | matchev-4b | Sonnet 5.5 | Haiku 5.5 | Jev 1.14 | Mejor código |
|---|---|---|---|---|---|
| Precisión en grupos de pago | 0,950 | 0,948 | 0,947 | 0,905 | 0,917 |
| Respondidas con p ≥ 0,95 | 92% | 19% | 12% | 23% | no disponible |
| Acierto entre las respondidas con p ≥ 0,95 | 98% | no disponible | no disponible | no disponible | no disponible |
| Coste por 1.000 preguntas (autoalojado) | 0,09 USD | 11,18 USD | 0,41 USD | 0,12 USD | no disponible |

El autor señala que en record matching Jev 1.14 va por delante. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base Qwen3.5-4B ocupa aproximadamente 8 GB en el momento de la descarga y fusión del adaptador.
- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 4B en precisión completa se requiere del orden de 8-10 GB, y menos con cuantización, aunque el autor no publica cifras.
- GPU recomendadas: no disponible. El quickstart del autor usa Apple silicon con MLX (`.[fast]`), lo que sugiere que el flujo principal está pensado para ese entorno.
- Despliegue: el paquete Matchev expone una API compatible con `POST /v1/match` en el puerto 8080 mediante `matchev.api serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, salvo el coste reportado de 0,09 USD por 1.000 preguntas antes de aplicar batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision pagos | Coste/1k preguntas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| matchev-4b | 4B (LoRA r16) | no disponible | 0,950 | 0,09 USD | Apache-2.0 | Hugging Face + GitHub |
| Sonnet 5.5 | no disponible | no disponible | 0,948 | 11,18 USD | propietaria | API comercial |
| Haiku 5.5 | no disponible | no disponible | 0,947 | 0,41 USD | propietaria | API comercial |
| Jev 1.14 | no disponible | no disponible | 0,905 | 0,12 USD | no disponible | no disponible |

La ventaja de matchev-4b no es la precisión bruta (prácticamente empatado con Sonnet 5.5 y Haiku 5.5) sino la calibración: responde el 92% de las preguntas con p ≥ 0,95 frente al 19% de Sonnet, el 12% de Haiku y el 23% de Jev, lo que permite automatizar una fracción mucho mayor del volumen sin revisión humana. En record matching, Jev 1.14 supera al modelo.

## Limitaciones y advertencias

- No es un matcher autónomo: por sí solo no resuelve la tarea; debe usarse dentro del paquete Matchev, que construye las preguntas, resuelve los casos exactos y verifica las garantías.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés, lo que limita su uso en entornos en castellano sin trabajo adicional.
- Dominio estrecho: diseñado específicamente para entity resolution, record linkage y conciliación de pagos; no es adecuado para generación de texto general, código o razonamiento abierto.
- Riesgo de alucinación: aunque el formato de selección entre opciones reduce el riesgo, la `p` calibrada debe usarse con umbrales; el 8% de preguntas no alcanza p ≥ 0,95 y requiere revisión.
- Dependencia de la revisión del modelo base: el adaptador está fijado a la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen3.5-4B; usar otra revisión puede degradar el comportamiento.
- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval ni GSM8K, por lo que la evaluación se limita a las métricas del dominio del autor.
- Adopción mínima: 0 descargas y 1 like en el momento de la consulta, lo que implica poca validación externa.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre sesgos en los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/mohit67890/matchev-4b
- Repositorio GitHub: https://github.com/mohit67890/matchev
- Casos de uso: https://github.com/mohit67890/matchev#built-for-the-matching-work-teams-still-do-by-hand
- Resultados: https://github.com/mohit67890/matchev/blob/main/docs/results.md
- Quickstart: https://github.com/mohit67890/matchev#quickstart
- Documentación de la API: https://github.com/mohit67890/matchev/blob/main/docs/api.md
- Recetas por caso de negocio: https://github.com/mohit67890/matchev/blob/main/docs/recipes.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
