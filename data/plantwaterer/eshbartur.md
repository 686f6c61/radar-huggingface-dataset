# plantwaterer/eshbartur

## Resumen

`eshbartur` es un modelo de decisión de 4.205.751.296 parámetros (4,21B) desarrollado por el usuario `plantwaterer` y afinado a partir de `Qwen/Qwen3.5-4B` (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, licencia Apache-2.0). No es un generador de texto conversacional al uso: es un modelo especializado en puntuar preguntas de opción múltiple y escalas de valoración del llamado Decision Index, con tres tipos nativos de pregunta (`choice`, `noul`, `score`). El modelo elimina el decodificado autorregresivo: en un único forward pass produce directamente una distribución sobre las opciones de la pregunta.

Técnicamente, el modelo conserva el backbone puro de texto `Qwen3_5ForCausalLM` del modelo base, descartando el codificador de visión y la cabeza MTP (multi-token prediction). La innovación principal es doble: por un lado, las 8 capas de atención completa pasan a ser no causales (atención bidireccional sobre el prompt mediante `AttentionMaskInterface` de `transformers`), mientras que las 24 capas recurrentes Gated DeltaNet permanecen causales; por otro, se sustituye la cabeza de lenguaje por un readout lineal calibrado de 255 vías en fp32 que mapea el estado oculto del último token del prompt a 255 códigos de respuesta de un solo token.

El modelo es relevante ahora por su enfoque poco habitual: en lugar de generar texto y parsear la respuesta, calcula directamente probabilidades calibradas sobre opciones, con temperatura `T = 1.40` plegada en los pesos del readout. Está pensado para evaluación automática de decisiones, clasificación con criterios explícitos y scoring de alternativas, no para chat libre. El repositorio ocupa 8,4 GB y se distribuye con pesos bf16 fusionados, el readout calibrado y un motor de inferencia independiente (`eshbartur.py`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas de atención completa (no causales en inferencia) + 24 capas Gated DeltaNet (causales), backbone `Qwen3_5ForCausalLM` |
| Parámetros totales | 4.205.751.296 (4,21B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_len = 65.536` tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen3.5-4B es multilingüe, pero el afinado es sobre datos en inglés según los ejemplos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, 2 shards, bf16, 8,41 GB) + `readout.safetensors` (fp32, weight `[255, 2560]`, bias `[255]`) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido entre atención completa y capas recurrentes lineales. De las 32 capas totales, 8 son de atención completa y 24 son Gated DeltaNet. En inferencia, las capas de atención completa operan de forma bidireccional sobre cada prompt (`is_causal=False`, máscara booleana 4D de padding por la derecha para lotes multi-pregunta), mientras que las capas Gated DeltaNet siguen siendo causales. Para compensar la causalidad de estas últimas, se aplica la técnica RE2 (Read-Twice): los prompts de hasta 2.048 tokens se presentan dos veces separados por un puente de relectura (`Read the same input again before answering:`), de modo que en la segunda pasada las capas recurrentes han visto el contexto completo y todas las opciones. Los prompts multi-pregunta se ordenan por longitud y se puntúan en lotes con padding por la derecha (máximo 8 preguntas y 12.288 tokens con padding por lote), sin fuga de padding.

El entrenamiento parte de Qwen3.5-4B como `Qwen3_5ForCausalLM` puro de texto, con LoRA de rango 32 (`alpha=64`) sobre las 248 matrices lineales y un readout lineal fp32 de 255 vías aprendido. El conjunto de entrenamiento consta de 445.594 preguntas de decisión limpias de 334 familias de origen (436.899 `choice`, 8.438 `noul` nativas, 257 `score` nativas, incluyendo 27.122 filas multi-pregunta de 13.561 peticiones). Los objetivos se destilaron de un profesor de decisión Gemma 4 de 31B (`karpo-decision-31B`) con divergencia KL y objetivo de profesor `1.0`, usando solo objetivos blandos con licencia Apache-2.0. El schedule fue de 1 época (3.516 pasos de optimizador, batch efectivo 128, LR coseno `4e-5` para LoRA y `2e-4` para el readout, weight decay `0.02`, permutación aleatoria uniforme de opciones en cada paso). La temperatura de calibración `T = 1.40` se ajustó sobre la mitad reservada de un split de desarrollo con familias no vistas y se verificó sobre la otra mitad disjunta (ECE `0.0576 -> 0.0178`, −69 %; NLL `0.7141 -> 0.6908`) y sobre un conjunto de generalización ESCI de 10.899 filas (ECE `0.0579 -> 0.0161`, −72 %; NLL `0.6436 -> 0.6143`), plegándose en `readout.safetensors` sin coste en runtime. Los 248 adaptadores LoRA se fusionaron en fp32 con un único redondeo a bf16; la verificación bit-exacta confirmó los 427 tensores cargados y los dos tensores fp32 del readout idénticos.

## Capacidades

- Puntuación nativa de preguntas de tipo `choice` (opción múltiple): devuelve probabilidades softmax sobre las `k` opciones de la pregunta.
- Puntuación de tipo `noul` (sí/no/no sé): devuelve la probabilidad verdadera calibrada.
- Puntuación de tipo `score` (escala de valoración): devuelve el valor esperado y las probabilidades por nivel.
- Hasta 255 opciones por pregunta y hasta 65.536 tokens de longitud máxima, sin truncado ni filtrado de opciones.
- Puntuación por lotes de múltiples preguntas en una sola pasada (máximo 8 preguntas y 12.288 tokens con padding por lote).
- Inferencia sin decodificado de tokens: una única pasada forward por prompt, sin generación autorregresiva.
- Calibración de probabilidades integrada (temperatura `T = 1.40` plegada en el readout).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking: es un modelo de decisión de texto puro.
- Capacidades multilingües: no documentadas en la model card.

## Casos de uso

- Evaluación automática de decisiones con criterios explícitos: el motor acepta un documento o contexto y un conjunto de criterios con sus opciones, devolviendo probabilidades calibradas por opción; útil para auditar clasificaciones donde se necesita una distribución, no solo una etiqueta.
- Clasificación de sentimiento o tono con criterios definidos por el usuario: el ejemplo de la model card clasifica el tono financiero de un fragmento (`pos`/`neg`/`neu`) pasando el documento y la definición de criterios, sin necesidad de prompt engineering de chat.
- Scoring de alternativas en pipelines de decisión: para preguntas de tipo `score` devuelve valor esperado y probabilidades por nivel, lo que permite integrar el modelo en sistemas de ranking o de selección de candidatos con umbrales calibrados.
- Preguntas de sí/no/no sé en validación de datos: el tipo `noul` devuelve la probabilidad calibrada de "sí", adecuado para filtros de calidad o comprobaciones de consistencia en lotes grandes.
- Procesamiento por lotes de encuestas o formularios: al puntuar hasta 8 preguntas por lote y 255 opciones por pregunta en una sola pasada, encaja en el procesamiento offline de cuestionarios extensos con muchas alternativas.
- Anotación asistida con criterios múltiples: dado que el modelo no genera texto libre y devuelve probabilidades, es apropiado para preetiquetar datasets de decisión y priorizar la revisión humana por confianza (ECE calibrado en torno a 0,016–0,018 tras calibración).
- Evaluación de modelos o respuestas con rúbricas: el soporte de preguntas multi-criterio y multi-opción permite construir evaluadores automáticos que puntúan respuestas candidatas contra una rúbrica fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de calibración y de latencia:

| Métrica | Valor |
|---|---|
| ECE antes/después de calibración (dev, familias no vistas) | 0,0576 → 0,0178 (−69 %) |
| NLL antes/después de calibración (dev, familias no vistas) | 0,7141 → 0,6908 |
| ECE antes/después de calibración (generalización ESCI, 10.899 filas) | 0,0579 → 0,0161 (−72 %) |
| NLL antes/después de calibración (generalización ESCI, 10.899 filas) | 0,6436 → 0,6143 |
| VRAM pico medida (RTX PRO 6000, benchmark de latencia de 1.000 filas) | 12,73 GB |
| VRAM pico medida (H200, benchmark de latencia de 1.000 filas) | 14,96 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: pesos bf16 de 8,41 GB; VRAM pico medida de 12,73 GB en RTX PRO 6000 y 14,96 GB en H200 durante el benchmark público de latencia de 1.000 filas.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell y NVIDIA H200 probadas de extremo a extremo; cualquier GPU con 16 GB o más debería acomodar el modelo según la model card.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (la model card indica que encaja cómodamente en 16 GB+); no se documentan pruebas en GPU de consumo concretas.
- Opciones de despliegue: el repositorio incluye un motor propio (`eshbartur.py`) que se ejecuta con `uv` (Python 3.12, PyTorch 2.14.1 CUDA 13.0, `transformers==5.23.0`, `flash-linear-attention==0.5.2`, `decision-index @ 9eb2dbe2`); requiere Linux x86_64 y verifica el entorno GPU con `selfcheck.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas de latencia o throughput más allá de la existencia de un benchmark público de latencia de 1.000 filas; no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eshbartur` | 4,21B | 65.536 tokens | Decisión por scoring calibrado (choice/noul/score), sin decodificado | Apache-2.0 | Hugging Face (repo propio, 0 descargas) |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4B | no disponible en la información | Generación de texto multimodal con backbone híbrido | Apache-2.0 | Hugging Face |
| `karpo-decision-31B` (profesor de destilación) | 31B | no disponible en la información | Profesor de decisión usado para destilar objetivos | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Modelo de nicho: no es un generador de texto conversacional; no soporta tool calling, agentes, visión ni audio. Usarlo fuera del esquema de preguntas del Decision Index no está soportado por la model card.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5-4B y de un profesor Gemma 4, puede heredar sesgos de ambos, pero no se cuantifican.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre (no genera), pero las probabilidades pueden estar mal calibradas fuera de las distribuciones de entrenamiento; la calibración se verificó solo en splits internos y en ESCI.
- Limitaciones de contexto e idioma: la ventana es de 65.536 tokens, pero la técnica RE2 solo se aplica a prompts de hasta 2.048 tokens; los idiomas soportados no están declarados y los datos de entrenamiento parecen en inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y el profesor de destilación tienen sus propias condiciones; la model card afirma que los objetivos del profesor son Apache-2.0, sin verificación independiente disponible.
- Requisitos de entorno estrictos: Linux x86_64, `uv`, Python 3.12, PyTorch 2.14.1 con CUDA 13.0 y `transformers==5.23.0`; no hay soporte documentado para otros runtimes.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-20); sin validación externa ni comunidad.
- Los límites de lote (8 preguntas, 12.288 tokens con padding) condicionan el throughput en producción; no se publican cifras de latencia por petición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/eshbartur
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Documentación de `uv`: https://docs.astral.sh/uv/
