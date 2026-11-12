# CMSManhattan/JiRackGemma-72B-alpha-GGUF

## Resumen

JiRack Gemma 72B — alpha (GGUF) es un modelo de lenguaje de 72.000 millones de parámetros publicado por CMSManhattan (Konstantin Grabko) sobre la arquitectura JiRack, construido a partir de un modelo Gemma de Google DeepMind. Esta versión concreta es la "alpha": contiene la arquitectura y los pesos a tamaño completo, pero **antes de cualquier entrenamiento propio**. Es decir, reproduce el comportamiento del Gemma original del que deriva y no incorpora todavía la capacidad adicional que la arquitectura JiRack está diseñada para aprovechar.

El interés técnico del modelo reside en la arquitectura JiRack: cada capa lineal es una BitLinear con un conmutador ternario (lambda). En esta alpha, lambda = 0, por lo que los pesos permanecen en precisión completa; el modo ternario (lambda = 1) se ha validado solo a nivel de forward pass finito, no de calidad. La estructura interna es un transformer de 120 capas organizadas en grupos de 6 (5 capas de ventana deslizante de 1.024 posiciones y 1 capa global), con 32 cabezas de consulta y un vocabulario de 262.144 tokens.

El modelo se distribuye únicamente en formato GGUF cuantizado para llama.cpp, con tres ficheros: Q8_0 (75,87 GB), Q4_K_M (43,10 GB) y Q2_K (26,79 GB). La licencia es propietaria (jirack-proprietary), aunque el modelo Gemma subyacente es Apache 2.0. Es relevante ahora como pieza de evaluación para socios del proyecto, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer JiRack (basado en Gemma), 120 capas en grupos de 6: 5 sliding-window (ventana 1.024) + 1 global; capas lineales BitLinear con conmutador ternario lambda |
| Parametros totales | 72,0B en el checkpoint; 71.380.799.096 en el modelo de lenguaje |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 posiciones configuradas; las comprobaciones del autor usaron ventanas de 512 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M (con importance matrix), Q2_K |
| Idiomas soportados | no disponible (la model card menciona pruebas con ingles, codigo y ruso, sin lista oficial) |
| Licencia | jirack-proprietary (propietaria); el Gemma subyacente es Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Otras especificaciones: hidden size 5.376, FFN 27.392, 32 cabezas de consulta; en capas sliding 16 cabezas key-value con dimension de cabeza 256; en capas globales 4 cabezas key-value con dimension de cabeza 512; vocabulario de 262.144 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Gemma con 120 capas agrupadas en bloques de seis: cinco capas con atención de ventana deslizante de 1.024 posiciones y una capa global por grupo. La innovación declarada es JiRack: cada capa lineal es una BitLinear con un conmutador ternario (lambda) que, cuando se activa (lambda = 1), permitiría pesos ternarios y ficheros mucho mas pequenos. En esta alpha lambda = 0 y los pesos están en precisión completa, por lo que el modelo no se beneficia todavía de esa compresión.

No hay entrenamiento propio en esta release. El autor lo describe explícitamente como "alpha, not full trained yet": el modelo reproduce las salidas del Gemma original. Las comprobaciones publicadas incluyen paridad de código frente a transformers en las primeras 12 capas (KL máximo 1,35e-12, top-1 100%), auditoría de los 2.018 tensores del checkpoint (0 errores) y logits del modelo completo de 120 capas bit-idénticos al modelo fuente en 4 prompts (KL 0, top-1 100%). No se documentan datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO. La hoja de ruta prevé entrenamiento continuado en texto general, código y matemáticas, fine-tuning para tool calling y agentes, y entrenamiento ternario (lambda de 0 a 1).

## Capacidades

- Generación de texto conversacional, heredada del Gemma original (la release Q4_K_M se ejecuta con `llama-cli -cnv`).
- Razonamiento y generación de código: la model card cita pruebas con prompts de inglés, código y ruso, aunque sin resultados de calidad publicados.
- Capacidad multilingüe: no confirmada oficialmente; solo se menciona ruso en las pruebas de paridad.
- Tool calling y agentes: **no incluidos en esta alpha**; están en la hoja de ruta como fine-tuning futuro. El autor cita resultados de sus modelos ternarios ya publicados (16B: 115/117 casos de su test de tool calling; 8B: 113; 2B: 110), pero no de este modelo.
- Modo thinking, visión o audio: no disponibles. El encoder de imagen del checkpoint no forma parte de esta release.
- Inferencia en llama.cpp estándar con contexto configurable hasta 32.768 tokens en el ejemplo de `llama-server` de la model card.

## Casos de uso

- Evaluación de arquitectura para socios: el caso de uso declarado por el autor. Sirve para verificar que la implementación JiRack reproduce fielmente el modelo Gemma fuente antes de invertir en entrenamiento.
- Prueba de paridad numérica en pipelines de investigación: los ficheros Q8_0 permiten comparar logits y perplejidad contra el modelo fuente (KL medio -0,000001, top-1 100%) como test de regresión de una implementación propia.
- Experimentación con cuantización: los tres ficheros permiten medir el impacto de Q8_0, Q4_K_M y Q2_K sobre el mismo texto (KL medio 0,62 y 77,65% de coincidencia top-1 en Q4_K_M; KL 3,11 y 51,24% en Q2_K), útil para calibrar importance matrices.
- Despliegue local de un modelo de 72B en una sola GPU: el Q4_K_M (43,10 GB) cabe en GPUs de 48-80 GB y permite servir un modelo grande con `llama-server` en una única máquina.
- Primer contacto en hardware modesto: el Q2_K (26,79 GB) permite inspeccionar el modelo en equipos con menos VRAM, asumiendo la degradación de calidad documentada.
- Base para entrenamiento continuado: el checkpoint de tamaño completo con capacidad extra sin entrenar sirve como punto de partida para experimentos de fine-tuning del autor o de terceros con licencia.
- Servicio conversacional de contexto largo: con 262.144 posiciones configuradas y `llama-server -c 32768`, puede usarse para conversaciones multi-turno extensas, aunque sin evaluación de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica únicamente métricas de paridad y de cuantización:

| Fichero | KL medio vs modelo fuente | Coincidencia top-1 | Perplejidad (fuente: 7531,84) |
|---|---|---|---|
| Q8_0 | -0,000001 | 100,00% | 7531,84 |
| Q4_K_M | 0,619124 | 77,65% | 8625,99 |
| Q2_K | 3,112594 | 51,24% | 2365,98 |

Comprobaciones adicionales: paridad de las primeras 12 capas en fp32 contra transformers (KL máximo 1,35e-12, top-1 100% en 5 prompts); auditoría de 2.018 tensores con 0 errores; logits del modelo completo bit-idénticos al fuente en 4 prompts (KL 0, top-1 100%). Medidas realizadas en CPU con llama.cpp c6a0ff11a, ventanas de 3 × 512 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto. Q8_0 ~76 GB, Q4_K_M ~43 GB, Q2_K ~27 GB.
- GPU recomendadas: para Q8_0, A100 80 GB o H100 80 GB; para Q4_K_M, una GPU de 48-80 GB (A6000, L40S, A100 80 GB); para Q2_K, GPUs de 32 GB o superiores (V100 32 GB, A100 40 GB).
- GPU de consumo: ningún fichero cabe en una RTX 4090 (24 GB) de forma holgada; el Q2_K (26,79 GB) excede su VRAM y requeriría offload a RAM o reparto entre varias GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF también Ollama, LM Studio y otros runners basados en llama.cpp. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. Las únicas mediciones publicadas se hicieron en CPU con ventanas de 512 tokens, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| JiRack Gemma 72B alpha (este) | 72,0B (71,4B LM) | 262.144 configurado | GGUF (Q8_0, Q4_K_M, Q2_K) | jirack-proprietary | Alpha sin entrenar |
| Gemma 2 27B (Google) | 27B | 8.192 | safetensors, GGUF | Gemma Terms | Entrenado y publicado |
| Llama 3.1 70B (Meta) | 70B | 131.072 | safetensors, GGUF | Llama 3.1 Community | Entrenado y publicado |
| Qwen2.5 72B (Alibaba) | 72B | 131.072 | safetensors, GGUF | Apache 2.0 | Entrenado y publicado |

La comparación es estructural: este modelo tiene el mismo orden de magnitud de parámetros que Llama 3.1 70B y Qwen2.5 72B, y un contexto configurado mayor (262.144), pero no ofrece resultados de benchmarks que permitan comparar rendimiento. Además, su licencia propietaria y su estado alpha lo sitúan fuera de la categoría de modelos listos para producción. El modelo Gemma fuente exacto no se identifica en la información disponible; Gemma 2 no alcanza los 72B, por lo que la correspondencia con la familia Gemma publicada no está confirmada.

## Limitaciones y advertencias

- Estado alpha: el modelo no ha sido entrenado más allá del Gemma original; no mejora sus respuestas y su capacidad extra está sin explotar.
- Sin benchmarks de calidad: no hay MMLU, HumanEval ni GSM8K publicados; no es posible evaluar su rendimiento frente a alternativas entrenadas.
- Cuantización agresiva: Q2_K presenta KL medio 3,11 y solo 51,24% de coincidencia top-1 con el fuente; la perplejidad reportada (2365,98) es menor que la del fuente (7531,84), lo que indica una medición no directamente comparable y desaconseja usar Q2_K para evaluación de calidad.
- Riesgo de alucinación: heredado del Gemma fuente y no caracterizado en esta release.
- Idiomas: lista oficial no disponible; solo hay evidencia anecdótica de inglés, código y ruso.
- Licencia: propietaria (jirack-proprietary), todos los derechos reservados según el autor; el uso comercial requiere contacto directo (grabko@cmsmanhattan.com). El modelo Gemma subyacente es Apache 2.0, pero la licencia del trabajo derivado es la propietaria.
- Sin encoder de imagen: la release GGUF solo contiene el modelo de lenguaje.
- Sin soporte documentado de tool calling ni agentes en esta versión.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes en el momento de la consulta; el proyecto depende de soporte externo de cómputo para continuar.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackGemma-72B-alpha-GGUF
- Contacto del autor: grabko@cmsmanhattan.com
- llama.cpp (runner indicado en la model card): https://github.com/ggml-org/llama.cpp
- Gemma (Google DeepMind), modelo base: https://huggingface.co/google
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del proyecto JiRack.
