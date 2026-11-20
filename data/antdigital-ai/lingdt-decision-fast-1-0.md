# antdigital-ai/LingDT-Decision-Fast-1.0

## Resumen

LingDT-Decision-Fast-1.0 es un modelo de decisión y extracción estructurada de alto rendimiento desarrollado por antdigital-ai, construido sobre el backbone Ling-3.0-Tiny de inclusionAI. A diferencia de los modelos generativos convencionales, no produce respuestas token a token: incorpora cabezas especializadas que predicen directamente decisiones binarias, selección entre candidatos, puntuaciones y spans de texto, lo que reduce la latencia y aumenta el throughput en tareas de enrutamiento y extracción de información.

El modelo parte de un backbone MoE de 7,9B parámetros totales y 1,3B activos por token, y la configuración "Fast" declara aproximadamente 1,5B parámetros activos incluyendo componentes específicos, un dato que el autor indica que debe verificarse contra el checkpoint desplegado. Su ventana de contexto declarada es de 64K tokens y admite hasta 255 candidatos en tareas de elección.

Es relevante porque ataca un cuello de botella concreto en pipelines de agentes: las decisiones de enrutamiento y la extracción de slots no necesitan generación libre, y un modelo no autorregresivo especializado puede ser más rápido y barato que un LLM generativo del mismo tamaño. La release se limita a las tareas Noul, Choice, Score y Slotting, con integración prevista en las APIs Decisions y Extractions de OpenRouter en lugar de Chat Completions.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone MoE + cabezas especializadas de decisión/extracción; predicción no autorregresiva |
| Parámetros totales | 7,9B (backbone Ling-3.0-Tiny) |
| Parámetros activos | Aproximadamente 1,5B, incluyendo componentes específicos del modelo (pendiente de confirmación final) |
| Longitud de contexto | 64K tokens (límite de producción declarado) |
| Tipos de cuantización | FP8 planificado para serving; no se detallan otros formatos |
| Idiomas soportados | Inglés (en); los benchmarks incluyen Massive-zh y Duee, pero el idioma declarado es solo inglés |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

LingDT-Decision-Fast-1.0 reutiliza el backbone MoE de Ling-3.0-Tiny (7,9B totales, 1,3B activos por token) y le añade cabezas de tarea especializadas que realizan predicción estructurada directa en lugar de decodificación autorregresiva. El modelo cubre cuatro tareas nativas: Noul (juicio binario), Choice (selección de un candidato entre hasta 255), Score (puntuación de candidatos) y Slotting (extracción de spans condicionados por slots directamente del texto de entrada).

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Tampoco se documenta el procedimiento de entrenamiento de las cabezas especializadas ni el esquema exacto de la pérdida de extracción de spans. La innovación principal declarada es la eficiencia de inferencia: en cargas representativas de Choice, el modelo reporta aceleraciones de throughput de peticiones de 2,01x (corto), 2,76x (medio) y 2,83x (largo) en BF16 frente a LingDT-Decision-1.0-4B, y de 1,53x, 2,18x y 2,29x en FP8. Estas cifras son benchmarks internos y dependen de hardware, batching, forma de las peticiones, concurrencia y configuración de serving.

## Capacidades

- Juicio binario (Noul): decide sí/no sobre una entrada de texto.
- Selección de candidato (Choice): elige una opción entre hasta 255 candidatos.
- Puntuación de candidatos (Score): asigna una puntuación a cada candidato para ranking o umbralización.
- Extracción de slots (Slotting): extrae spans del texto de origen condicionados por slots solicitados; por ejemplo, para "Schedule a meeting with Alex tomorrow in Shanghai" con slots `person`, `date` y `location`, devuelve `Alex`, `tomorrow` y `Shanghai`.
- Enrutamiento de agentes: pensado para decisiones de routing dentro de pipelines de agentes.
- Extracción de información estructurada: orientado a information extraction y slot-filling.
- Integración vía API: Noul, Choice y Score a través de la Decisions API de OpenRouter; Slotting a través de la Extractions API (validación de integración pendiente).
- No se documentan capacidades de generación libre de texto, razonamiento multi-paso, tool calling genérico, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de agentes: el modelo puede decidir a qué herramienta, subagente o flujo derivar una petición mediante Noul o Choice, con hasta 255 candidatos y contexto de 64K, lo que permite incluir historial largo de conversación en la decisión.
- Clasificación de intenciones en atención al cliente: con Choice sobre un conjunto cerrado de intenciones (por ejemplo, los 77 intents de BANKING77), el modelo selecciona la categoría directamente sin generar texto, reduciendo latencia frente a un LLM generativo.
- Extracción de entidades para formularios: con Slotting se pueden poblar campos estructurados (persona, fecha, lugar, importe) a partir de texto libre, útil en asistentes de agenda, reservas o tramitación.
- Filtrado y moderación binaria: Noul permite aplicar políticas de aceptación/rechazo sobre contenido o sobre respuestas candidatas antes de mostrarlas al usuario.
- Ranking de respuestas o documentos: Score permite puntuar candidatos generados por otro modelo y ordenarlos, como etapa de reranking en un pipeline RAG o de generación.
- Automatización de backoffice: extracción de campos de correos y tickets (fechas, importes, referencias) mediante Slotting para alimentar sistemas de gestión, con el throughput adicional que aporta la predicción no autorregresiva.
- Evaluación de decisiones en producción: al ser determinista en la salida estructurada y no generar texto libre, simplifica la validación y el testing de pipelines de decisión frente a alternativas generativas.

## Benchmarks y rendimiento

Resultados internos publicados por el autor (mayor es mejor):

| Capacidad | Suite | Métrica | Puntuación |
|---|---|---|---|
| Single-choice | 15 benchmarks | Exactitud macro | 83,77% |
| Slotting | 10 benchmarks | Puntuación macro de extracción | 66,11% |

Desglose de single-choice:

| Benchmark | Exactitud (%) |
|---|---|
| SemIf-144 | 93,75 |
| Scienthoon-pooled | 75,49 |
| WANLI-256 | 69,53 |
| TypeSafe-102 | 83,33 |
| JevBench-231 | 93,51 |
| BANKING77-3080 | 93,70 |
| Transfer-v9-dev | 83,75 |
| Decision-v7-dev | 86,00 |
| Decision-v7-test | 85,92 |
| Transfer-v4-dev | 83,69 |
| Transfer-v4-test | 87,96 |
| MASSIVE-en | 86,29 |
| Nimble-282 | 88,65 |
| JEVal | 98,03 |
| OpenDecision | 46,94 |

Desglose de slotting:

| Benchmark | Puntuación (%) |
|---|---|
| SGD | 71,01 |
| ATIS | 67,81 |
| Snips | 69,18 |
| Finslot | 65,50 |
| Massive-en | 60,94 |
| Massive-zh | 66,42 |
| Duee | 41,23 |
| CATSLU | 77,47 |
| CATSLU_asr | 75,31 |
| RiSAWOZ_id | 66,26 |

Comparación de slotting frente a baselines generativos Qwen3.5 (evaluación interna): LingDT 66,11%, Qwen3.5-27B 65,07%, Qwen3.5-9B 55,85%, Qwen3.5-4B 46,09%. En single-choice, el modelo ocupa la 9.ª posición entre 17 modelos evaluados; supera a los baselines de clase 4B listados, pero su margen sobre el más cercano es de 0,01 puntos porcentuales, lo que el propio autor señala como no significativo estadísticamente. La métrica exacta de extracción y las reglas de matching están pendientes de confirmación, y las comparaciones son resultados internos, no rankings oficiales de OpenRouter.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un backbone MoE de 7,9B totales en BF16 requiere del orden de 16 GB solo para pesos, más overhead de activaciones y KV cache; en FP8 se reduce aproximadamente a la mitad. Estas cifras son estimaciones y no proceden de la documentación del autor.
- GPU recomendadas: no disponible. El serving planificado es en FP8, lo que apunta a GPUs con soporte FP8 (por ejemplo, H100 o L40S), pero el autor no publica una lista de hardware validado.
- ¿Cabe en GPU de consumo? No confirmado. Con cuantización agresiva podría ser viable en GPUs de 24 GB, pero no hay datos publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La vía de acceso prevista es la API de OpenRouter (Decisions API y Extractions API).
- Latencia y throughput: se reportan aceleraciones de throughput de peticiones frente a LingDT-Decision-1.0-4B de 2,01x/2,76x/2,83x en BF16 y 1,53x/2,18x/2,29x en FP8 para entradas cortas/medias/largas. No se publican valores absolutos de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingDT-Decision-Fast-1.0 | ~1,5B activos (7,9B totales) | 64K | No autorregresivo, cabezas de decisión/extracción | no disponible | Hugging Face (repo vacío), API OpenRouter prevista |
| LingDT-Decision-1.0-4B | no disponible (backbone Qwen3.5-4B) | no disponible | Decisión/extracción | no disponible | Referencia interna del autor |
| Qwen3.5-4B | 4B | no disponible | Generativo | no disponible | Usado como baseline interno |
| Qwen3.5-9B | 9B | no disponible | Generativo | no disponible | Usado como baseline interno |
| Qwen3.5-27B | 27B | no disponible | Generativo | no disponible | Usado como baseline interno |

En slotting, LingDT supera a los tres baselines Qwen3.5 en la evaluación interna del autor; en single-choice queda por encima de los baselines de clase 4B con un margen no significativo. No se dispone de datos públicos independientes para validar estas comparaciones.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- El repositorio de Hugging Face figura con 0.0 GB y 0 descargas; no está claro que los pesos estén publicados o accesibles.
- El recuento final de parámetros activos (~1,5B) está pendiente de confirmación por el propio autor.
- La métrica exacta de extracción de slots y las reglas de matching no están confirmadas, lo que limita la reproducibilidad de los resultados de slotting.
- Los benchmarks son internos, con posibles solapamientos entre datos de entrenamiento y evaluación; no son rankings oficiales.
- El margen de 0,01 puntos sobre el mejor baseline 4B en single-choice no es evidencia de superioridad estadística.
- Idioma declarado solo inglés, aunque se evalúe en Massive-zh y Duee; el rendimiento multilingüe no está garantizado.
- OpenDecision obtiene solo 46,94% de exactitud, muy por debajo del resto de suites, lo que sugiere un dominio donde el modelo falla con frecuencia.
- No es un modelo generativo: no sirve para chat libre, redacción ni razonamiento abierto; su uso está acotado a decisión y extracción estructurada.
- Riesgo de alucinación en spans: al predecir directamente fragmentos del texto, puede devolver spans incorrectos o mal alineados en entradas ruidosas (CATSLU_asr baja a 75,31% frente a 77,47% en texto limpio).
- La integración con la Extractions API de OpenRouter está pendiente de validación; el formato de respuesta no está finalizado.
- Las cifras de speedup dependen de hardware, batching, concurrencia y configuración de serving; no son garantías de latencia por petición.

## Enlaces

- Hugging Face: https://huggingface.co/antdigital-ai/LingDT-Decision-Fast-1.0
- Modelo base Ling-3.0-Tiny: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Documentación de OpenRouter: https://openrouter.ai/docs
