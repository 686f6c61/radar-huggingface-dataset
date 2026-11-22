# Lucebox/pflash

## Resumen

PFlash es un stack de compresión de prefill desarrollado por Lucebox para prompts largos y sesiones agénticas. No es un modelo generativo autónomo, sino un conjunto de cuatro componentes ligeros que se ejecutan sobre las activaciones de un drafter pequeño (Qwen3.5-0.8B) para decidir qué segmentos del contexto debe procesar realmente el modelo lector grande durante la fase de prefill. El objetivo es reducir el coste computacional y la latencia en escenarios con contextos muy extensos sin degradar la calidad de la respuesta.

El sistema se apoya en un único forward pass del drafter: todas las señales de la etapa 1 leen el mismo tap (el residual del bloque 14, `post_block14_residual_before_block15`). A partir de ahí, cuatro componentes (segment probe, request probe, scoring head y reranker bidireccional) puntúan y seleccionan unidades estructurales completas del prompt, que se envían al lector en su orden original junto con la petición del usuario fijada. La suma de parámetros de los componentes publicados ronda los 3,2 millones, lo que lo convierte en un complemento extremadamente ligero.

Es relevante ahora porque aborda uno de los cuellos de botella prácticos de los despliegues agénticos: el coste del prefill crece con la longitud del contexto y con el número de turnos. PFlash introduce una curva de keep-ratio por defecto que se activa a partir de 8.192 tokens y una red de seguridad adaptativa que, ante consultas difusas (por ejemplo, auditorías de repositorio completo), hace bypass al prefill completo verbatim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack de compresión de prefill sobre drafter Qwen3.5-0.8B: segment probe (LayerNorm + Linear + GELU + Conv1d), request probe (MLP), scoring head (proyecciones q/k NoPE) y reranker Transformer bidireccional (3 capas, d_model=384, 6 cabezas) |
| Parametros totales | 264.705 (dato del repo); componentes individuales: segment probe ~263K, request probe ~265K, scoring head 2,62M, reranker 3L/384d/6H |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como límite propio; curva de activación desde 8.192 tokens hasta 120.000 tokens |
| Tipos de cuantizacion | GGUF (formato de los cuatro componentes y del drafter) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

PFlash no es un transformer monolítico sino un pipeline de cuatro módulos que operan sobre las activaciones de un drafter Qwen3.5-0.8B. El segment probe corta el prompt en unidades estructurales completas (enunciados y definiciones, frases, registros, turnos de chat, llamadas a herramientas) con umbral de unidad 0,8, `min_segment=32`, `max_segment=512` y división alineada a líneas para segmentos sobredimensionados. El request probe localiza los tokens que contienen la petición del usuario en cualquier posición del prompt y fija hasta 512 tokens de las unidades de petición mejor rankeadas. El scoring head calcula densidad de atención query→contexto por unidad y centroides de clave L2-normalizados (`k_bar`). El reranker bidireccional refina la relevancia con contexto cruzado entre segmentos (~4,1 ms en GPU), consumiendo `k_bar` (512), `q_bar` pooled (512), una interacción multiplicativa `W_int(k_d * q_d)` y 12 escalares por segmento, y emitiendo un delta residual inicializado a cero sobre el `log_density` de la etapa 1.

La red de seguridad adaptativa de keep-ratio se calcula en menos de 0,1 ms a partir de los log-scores de segmentos opcionales, usando la fracción de perplejidad a nivel de token sin sink `eff = exp(H_tok) / N_opt`. Con `eff < 0,42` se aplica la curva V3 base; con `0,42 <= eff < 0,58` se ensancha el keep-ratio de forma monótona hasta `max(curve, eff)`; con `eff >= 0,58` se hace bypass a prefill completo verbatim al 100% si el prompt cabe en `max_ctx`, preservando prefijos KV en continuaciones. La curva por defecto es `8192:0.450`, `16384:0.250`, `32768:0.180`, `65536:0.180`, `120000:0.150`. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Compresión de prefill para prompts largos: selecciona unidades estructurales completas que caben en el presupuesto y las envía al lector en orden original.
- Localización de la petición del usuario dentro de pastes largos, prompts RAG y chats multi-turno, fijando hasta 512 tokens de petición.
- Segmentación estructural con detección de límites de contenedor (enunciados, frases, registros, turnos, tool calls).
- Puntuación calibrada de densidad de atención query→contexto y centroides de clave por segmento.
- Reranking bidireccional con contexto cruzado entre segmentos.
- Soporte de turnos autónomos de herramientas: las observaciones activas de herramientas se promueven al rol de query para rankear y recuperar regiones anteriores.
- Paging de historial frío mediante Lucebox Mix.
- Red de seguridad adaptativa que evita compresión agresiva en consultas difusas o globales.
- No es un modelo generativo: no produce texto, código ni razonamiento por sí mismo; es infraestructura de aceleración de inferencia.

## Casos de uso

- Sesiones agénticas de larga duración: en un bucle de agente con muchas llamadas a herramientas, PFlash promueve la observación activa a query y recupera regiones previas relevantes, reduciendo el prefill por turno sin perder el hilo de la tarea.
- RAG con contextos extensos: cuando se inyectan decenas de documentos en el prompt, el request probe localiza la pregunta y el reranker prioriza los segmentos con mayor densidad de atención, manteniendo la petición fijada.
- Auditoría de repositorio completo: ante consultas globales y difusas, la red de seguridad detecta `eff >= 0,58` y hace bypass a prefill completo verbatim, garantizando que el lector vea todo el contexto cuando el prompt cabe en `max_ctx`.
- Chats multi-turno con historial frío: el paging de historial frío de Lucebox Mix permite mantener prefijos KV calientes y comprimir el historial antiguo, útil en asistentes conversacionales de sesiones largas.
- Procesamiento de logs y registros estructurados: el segment probe corta por registros y unidades alineadas a líneas, lo que encaja con prompts compuestos de trazas o registros donde interesa preservar unidades completas.
- Reducción de coste en producción con vLLM o servidores compatibles: al integrarse en el servidor Lucebox con `--prefill-compression auto`, permite bajar el coste de prefill en despliegues con contextos de 8K a 120K tokens sin cambiar el modelo lector.
- Análisis de documentos legales o técnicos con preguntas puntuales: la curva V3 base con `eff < 0,42` maximiza el speedup cuando la consulta es concreta y apunta a una sección específica del documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de latencia de componentes: el reranker bidireccional tarda aproximadamente 4,1 ms en GPU y la red de seguridad adaptativa se calcula en menos de 0,1 ms.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Los cuatro componentes GGUF suman aproximadamente 36 MB en disco (1,06 MB + 1,06 MB + 10,49 MB + 23,44 MB), por lo que la huella de los módulos PFlash es mínima; el grueso de VRAM lo determina el drafter Qwen3.5-0.8B y el modelo lector.
- GPU recomendadas: no disponible de forma específica. El reranker reporta ~4,1 ms en GPU sin especificar el modelo de GPU utilizado.
- Cabe en GPU de consumo: el drafter de 0,8B y los componentes auxiliares son ligeros; el requisito real vendrá del modelo lector, que no se especifica en la información disponible.
- Opciones de despliegue: servidor Lucebox con `--prefill-compression auto`; los componentes se cargan vía variables de entorno `PFLASH_SCORING_HEAD_GGUF`, `PFLASH_SEGMENT_PROBE_GGUF`, `PFLASH_REQUEST_PROBE_GGUF` y `PFLASH_SEG_RERANKER_GGUF` (autodescubierto junto al scoring head, con opción de override o desactivación). El drafter requerido es `unsloth/Qwen3.5-0.8B-GGUF` en BF16, verificado por sha256 al cargar.
- Latencia y throughput: no disponible de forma agregada; solo se reportan ~4,1 ms para el reranker y <0,1 ms para la red de seguridad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. PFlash es un stack de compresión de prefill, no un modelo generativo, por lo que la comparación natural sería con otras técnicas de compresión de contexto o poda de tokens, para las que no se aportan datos.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PFlash (Lucebox) | Stack de compresión de prefill | ~3,2M en componentes + drafter 0,8B | Curva 8K–120K | other | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia "other": es necesario revisar los términos completos antes de cualquier uso comercial; no se especifican restricciones concretas en la información disponible.
- Idioma: solo se declara soporte para inglés (`en`), lo que limita su uso en prompts en castellano u otros idiomas.
- Dependencia estricta del drafter: cada componente verifica por sha256 el archivo `Qwen3.5-0.8B-BF16.gguf` de `unsloth/Qwen3.5-0.8B-GGUF` y rechaza cargarse contra cualquier otro archivo, lo que restringe la portabilidad.
- Acoplamiento al servidor Lucebox: el uso está documentado exclusivamente para el servidor Lucebox; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Riesgo de pérdida de contexto: la compresión descarta segmentos; aunque existe una red de seguridad adaptativa, consultas difusas mal clasificadas podrían omitir información relevante.
- Sin datos de benchmarks públicos: no hay evidencia publicada de calidad de respuesta tras la compresión, solo métricas internas de latencia.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto reciente y sin validación comunitaria amplia.
- Riesgo de alucinación: no aplica directamente al no ser un modelo generativo, pero la compresión puede inducir respuestas del lector basadas en contexto incompleto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucebox/pflash
- Drafter requerido: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime Lucebox: https://github.com/Luce-Org/lucebox (referenciado como "Luce-Org/lucebo" en la model card)
