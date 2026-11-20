# DeepEduVN/bungpt-open

## Resumen

BunGPT-DeepEdu-Decision-4B-Open es un modelo de decisión desarrollado por DeepEduVN, construido sobre el backbone Qwen3.5-4B. A diferencia de un modelo generativo convencional, no produce texto: lee un estado (un mensaje, una conversación o un documento) junto con una o varias preguntas tipadas y puntúa cada opción de cada pregunta en una sola pasada. Está pensado para las decisiones pequeñas dentro de un producto, como enrutar un turno, detectar intención, marcar mensajes inseguros o verificar una afirmación.

El modelo emplea atención causal sobre Qwen3.5-4B con una pequeña cabeza de puntuación que asigna una puntuación independiente a cada opción. Soporta dos tipos de pregunta: `choice` (elegir entre opciones con nombre) y `noul` (sí/no). La salida incluye la opción elegida, la probabilidad de cada opción y las puntuaciones crudas, lo que permite aplicar umbrales propios.

Con 4.659.865.088 parámetros y un repositorio de 9,3 GB, se distribuye bajo licencia Apache 2.0 y está orientado a los idiomas vietnamita e inglés. Su relevancia radica en ofrecer una alternativa de clasificación y enrutamiento de baja latencia (mediana de 129 ms para una pregunta de 256 tokens en una RTX 3090) frente a modelos generativos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-4B) con cabeza de puntuación por opción |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (configurable vía `--max_length`; el servidor usa `--token_budget` de 16.384 tokens por forward) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline | text-classification |
| Libreria | deepedu-decision |
| Tamano del repositorio | 9,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer con atención causal, y añade una cabeza de puntuación que evalúa cada opción de forma independiente. La atención causal permite reutilizar el cálculo: el estado se procesa una vez para todas las preguntas y cada pregunta una vez para todas sus opciones, de modo que muchas preguntas sobre un mensaje largo cuestan poco más que una sola. Con `--cache_mb` se reutilizan los estados de prefijo entre turnos de una conversación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo card menciona que los pesos se descargan en la primera llamada a `from_pretrained` y que se ofrece un conjunto opcional de kernels más rápidos mediante `requirements-fast.txt`. La innovación técnica destacable es el esquema de puntuación por opción: para preguntas `choice`, la probabilidad de la opción *k* se calcula como σ(z_k) / Σ_j σ(z_j), donde z son las puntuaciones crudas y σ la función logística; para `noul`, la probabilidad corresponde a la de `true`. Esto permite usar `max(scores)` como señal de ajuste cuando ninguna opción encaja.

## Capacidades

- Clasificación y decisión sobre estados de texto: enrutamiento de turnos, detección de intención, marcado de mensajes inseguros y verificación de afirmaciones.
- Preguntas de tipo `choice`: selección entre opciones con nombre, con probabilidades por opción.
- Preguntas de tipo `noul`: decisiones binarias sí/no con probabilidad asociada.
- Puntuación de múltiples preguntas en una sola pasada sobre el mismo estado.
- Salida con puntuaciones crudas por opción para aplicar umbrales personalizados.
- Soporte de procesamiento por lotes mediante `decide_batch([...])`.
- Servidor HTTP compatible con el formato `POST /v1/systemone` de Jev Decision Index.
- Caché de prefijos para tráfico multi-turno.
- Capacidades multilingües limitadas a vietnamita e inglés.
- No genera texto: no es un modelo de chat ni de razonamiento generativo.

## Casos de uso

- Enrutamiento de turnos en un producto educativo: el modelo clasifica cada mensaje del estudiante en categorías como `explain`, `solve` o `chitchat`, lo que permite dirigirlo al módulo adecuado sin generar respuesta. Su mejor resultado en el benchmark propio es precisamente en routing (0,820).
- Guardrail de contenido en entornos escolares: mediante una pregunta `noul` sobre si el mensaje es dañino o inapropiado, con umbral ajustado a partir de datos etiquetados propios en lugar de 0,5, dado que un falso negativo es más costoso que un falso positivo.
- Detección de intención en atención al cliente: el modelo puntúa varias intenciones candidatas en una sola pasada y devuelve probabilidades, lo que permite derivar la conversación al agente o flujo correcto.
- Verificación de afirmaciones en pipelines de contenido: una pregunta `noul` sobre si una afirmación es correcta, combinada con la puntuación cruda como señal de confianza.
- Clasificación por lotes de documentos: `decide_batch` procesa muchos estados a la vez, adecuado para etiquetar corpus de mensajes o tickets de forma offline.
- Servicio de decisiones de baja latencia: el servidor HTTP con caché de prefijos atiende turnos 2 a 6 de una conversación en una mediana de 173 ms en una RTX 3090, lo que lo hace viable para decisiones interactivas dentro de un producto.
- Filtrado previo en pipelines generativos: usar el modelo como primera etapa para decidir si un mensaje requiere invocar un modelo generativo mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

Resultados del benchmark DeepEdu (decisiones de producto educativo en vietnamita; accuracy o macro-F1). Todos los modelos son de 4B y fueron ejecutados por el autor sobre los mismos registros.

| Modelo (todos 4B) | Intent | Routing | Guardrail | Knowledge | Media |
|---|---|---|---|---|---|
| Decider Flash v1.3 | **0,826** | 0,800 | 0,680 | **0,611** | **0,729** |
| StartLux-Decision v1.1 Instant | 0,824 | 0,808 | **0,703** | 0,568 | 0,726 |
| KnowLine 4B Gen5.5 | 0,807 | 0,808 | 0,691 | 0,585 | 0,723 |
| **BunGPT-DeepEdu-Decision-4B-Open** | 0,822 | **0,820** | 0,626 | 0,539 | 0,702 |
| Valen-Decision 1.5 4B | 0,798 | 0,758 | 0,437 | 0,591 | 0,646 |

En el Jev Decision Index 0.3 (split completo), el modelo obtiene 60,67 en la ejecución propia del autor con el harness público.

Latencia medida en una RTX 3090, incluido HTTP:

| Carga de trabajo | Mediana / p95 (ms) |
|---|---|
| 1 pregunta, 256 tokens | 129 / 132 |
| 1 pregunta, 4.096 tokens | 649 / 698 |
| 16 preguntas, 1.024 tokens | 653 / 1.288 |
| 16 preguntas, 4.096 tokens | 1.091 / 1.805 |
| Multi-turno, turnos 2–6, con caché de prefijo | 173 / 502 |

Las preguntas cortas individuales arrastran unos 80 ms de sobrecarga de servicio (aún sin CUDA graphs).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,66 mil millones de parámetros, los pesos en safetensors ocupan aproximadamente 9,3 GB en el repositorio.
- GPU recomendadas: RTX 3090 para las latencias publicadas; no se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, al menos en RTX 3090 según las mediciones del autor.
- Opciones de despliegue: API Python (`deepedu_decision.DecisionModel`), servidor HTTP propio (`python -m deepedu_decision.serve`) compatible con el formato Jev Decision Index `POST /v1/systemone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: medianas de 129 ms (1 pregunta, 256 tokens) a 1.091 ms (16 preguntas, 4.096 tokens) en RTX 3090; 173 ms en turnos 2–6 con caché de prefijo. El servidor admite `--token_budget` (16.384 por defecto), `--max_questions` (16), `--max_pending` (64), `--max_batch_rows` y `--batch_wait_ms`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media DeepEdu | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BunGPT-DeepEdu-Decision-4B-Open | 4,66 B | No disponible | 0,702 | Apache 2.0 | Hugging Face |
| Decider Flash v1.3 | 4 B | No disponible | 0,729 | No disponible | No disponible |
| StartLux-Decision v1.1 Instant | 4 B | No disponible | 0,726 | No disponible | No disponible |
| KnowLine 4B Gen5.5 | 4 B | No disponible | 0,723 | No disponible | No disponible |
| Valen-Decision 1.5 4B | 4 B | No disponible | 0,646 | No disponible | No disponible |

BunGPT destaca en routing (0,820, el mejor de la tabla) y está cerca de la cabeza en intent (0,822), pero queda por detrás en guardrail (0,626) y en conocimiento en vietnamita (0,539).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo puntúa opciones predefinidas.
- Rendimiento inferior a alternativas en guardrail (0,626 frente a 0,703 de StartLux) y en conocimiento en vietnamita (0,539 frente a 0,611 de Decider Flash).
- Idiomas limitados a vietnamita e inglés; no se garantiza comportamiento en castellano ni en otras lenguas.
- Las puntuaciones crudas pueden ser todas bajas cuando ninguna opción encaja; es necesario usar `max(scores)` como señal de ajuste antes de confiar en la opción elegida.
- Para decisiones binarias con coste asimétrico de error (por ejemplo, guardrails), no debe usarse el umbral 0,5; hay que calibrarlo con datos etiquetados propios.
- Sobrecarga de servicio de unos 80 ms en preguntas cortas individuales por ausencia de CUDA graphs.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- Los benchmarks publicados son ejecutados por el propio autor sobre su benchmark DeepEdu, no por terceros.
- No se dispone de información sobre sesgos, datos de entrenamiento ni riesgos de alucinación específicos; al no generar texto, el riesgo de alucinación se traslada a la calibración de las puntuaciones.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B.

## Enlaces

- Hugging Face: https://huggingface.co/DeepEduVN/bungpt-open
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web disponible.
