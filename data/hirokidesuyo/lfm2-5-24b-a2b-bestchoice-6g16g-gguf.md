# hirokidesuyo/LFM2.5-24B-A2B-BestChoice-6G16G-GGUF

## Resumen

LFM2.5-24B-A2B-BestChoice-6G16G-GGUF es una cuantización GGUF del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario hirokidesuyo. Se trata de una variante optimizada para ejecutarse en equipos con recursos limitados (6 GB de VRAM y 16 GB de RAM), con el objetivo declarado de maximizar el rendimiento general dentro de ese presupuesto de memoria. El modelo base es un MoE de LiquidAI con 23.971.587.712 parámetros totales (aproximadamente 24B), del que solo se activa una fracción por token, lo que explica la nomenclatura A2B (activos ~2B).

La relevancia de esta ficha radica en que combina tres elementos: un modelo base MoE de nueva generación, una cuantización no estándar (IQ3_XXS con ajustes selectivos por capas) calibrada con imatrix propia, y un proceso de destilación vía LoRA sobre el modelo base con datos mixtos en inglés y japonés. El resultado es un artefacto de 9,4 GB que, según el autor, alcanza 53/54 en un benchmark propio de 54 preguntas y genera a unas 54 t/s en una RTX 3060 Laptop.

El modelo está pensado para conversación, razonamiento, código y matemáticas en inglés y japonés, y su licencia es "other", heredada de las condiciones del modelo base y de los datos de destilación. No se han publicado resultados en benchmarks estándar de la industria en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer; detalles completos de la arquitectura del base no disponibles |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (según nomenclatura A2B; cifra exacta no disponible) |
| Longitud de contexto | 32.768 tokens (configuración recomendada por el autor; contexto nativo del base no disponible) |
| Tipos de cuantizacion | GGUF IQ3_XXS base con capas selectivas en iq3_s (expert gate/up en bloques 2-9 y 35-39); KV cache q8_0 recomendada; layout UD propio |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | other |
| Formato de pesos | GGUF (9.443.769.984 bytes, ~9,4 GB) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2.5-24B-A2B es un MoE de aproximadamente 24B parámetros totales con unos 2B activos por token, lo que permite un throughput alto con un coste computacional por token relativamente bajo. La información disponible no detalla la composición exacta de capas, número de expertos ni el esquema de enrutamiento del base.

Sobre ese base, el autor aplicó un ajuste por destilación con LoRA (r16 en general, r4 en los expertos), entrenado con 14.674 filas y aproximadamente 7,9M tokens. La mezcla de datos combina razonamiento en inglés, código y respuestas cortas con matemáticas en japonés (NuminaMath-CoT-JA), lógica y conversación. Como datos del profesor se usó un subconjunto del corpus público de destilación r0b0tlab/qwen3.8-max-glm5.2-distillation-51389, entre otros. La cuantización se calibró con una imatrix propia y se midió la sensibilidad por capas para decidir qué bloques de expertos subir a iq3_s; el autor reporta que subir shortconv a mayor precisión no mejoraba la perplejidad.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento de tipo cadena de pensamiento (el autor indica que el modelo "piensa" en el idioma de la pregunta y completa las respuestas dentro del límite de 1024 tokens en su benchmark).
- Generación de código y respuesta a tareas de programación (incluido en la mezcla de destilación).
- Matemáticas, con especial énfasis en matemáticas en japonés vía NuminaMath-CoT-JA.
- Razonamiento lógico y respuestas cortas de conocimiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible (no se mencionan).
- Modo thinking explícito con etiquetas separadas: no disponible; el autor describe razonamiento interno pero no detalla el formato.

## Casos de uso

- Asistente conversacional local en japonés e inglés: el modelo cabe en 6 GB de VRAM con 16 GB de RAM y mantiene contexto de 32K tokens, lo que permite conversaciones largas en un portátil con RTX 3060 sin depender de la nube.
- Razonamiento matemático en japonés: la inclusión de NuminaMath-CoT-JA en la destilación lo hace adecuado para resolver problemas paso a paso en ese idioma, con la cadena de razonamiento en japonés.
- Generación y revisión de código en inglés: la mezcla de destilación incluye código, por lo que puede usarse como asistente de programación en local para autocompletado, explicación de fragmentos y refactorizaciones sencillas.
- Prototipado de agentes y pipelines: al ser un GGUF compatible con llama.cpp y con endpoints compatibles (tag endpoints_compatible), se puede integrar en servidores locales de inferencia para pruebas de flujo conversacional.
- Educación y tutoría bilingüe: respuestas cortas y razonamiento explícito en inglés y japonés, útil para generar explicaciones paso a paso en entornos con hardware modesto.
- Evaluación de cuantizaciones y ajustes: al ser una cuantización con layout UD e imatrix propia, sirve como referencia para comparar el impacto de subir selectivamente capas de expertos a mayor precisión en un MoE.
- Despliegue en entornos con restricciones de memoria: útil cuando no se dispone de GPU de datacenter pero se necesita un modelo de ~24B con activación dispersa, aprovechando el moe-cache en RAM/VRAM.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Benchmark propio del autor (54 preguntas, razonamiento/instrucciones/código/conocimiento, ja/en) | 53/54 correctas y completas | temp 0, límite 1024 tokens |
| Abliterated UD-IQ3_XXS (comparación del autor) | 49/54 | mismas condiciones |
| Destilado v1 centrado en inglés (comparación del autor) | 51/54 | mismas condiciones |
| Destilado v2 (comparación del autor) | 51/54 | mismas condiciones |
| Perplejidad en inglés (llama-perplexity, 96 chunks) | 12,52 | cuantización IQ3_XXS/iq3_s del autor |
| Velocidad de generación | ~54 t/s | RTX 3060 Laptop 6 GB + 16 GB RAM, 512 tokens, llama-completion |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores proceden de un benchmark propio del autor y no son directamente comparables con evaluaciones de la industria.

## Requisitos de hardware

- VRAM estimada: ~6 GB para el modelo cuantizado con la configuración recomendada (moe-cache-mib 3072, moe-cache-cpu-share 0.5); el resto de expertos se descarga a RAM.
- RAM: 16 GB recomendados por el autor; el archivo GGUF ocupa 9,4 GB.
- GPU probada por el autor: RTX 3060 Laptop con 6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, 4060, 4070) para la configuración mínima; con 12-24 GB de VRAM se puede aumentar el moe-cache y reducir la dependencia de RAM.
- Cabe en GPU consumer: sí, en el rango de 6 GB en adelante con la configuración indicada.
- Opciones de despliegue: llama.cpp (probado por el autor con llama-completion y llama-perplexity); el tag endpoints_compatible sugiere compatibilidad con servidores de endpoints, aunque no se detalla cuáles. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: ~54 t/s en RTX 3060 Laptop 6 GB + 16 GB RAM con ctx 32768, KV cache q8_0 y -lm dio; no se dispone de datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-BestChoice-6G16G (esta ficha) | ~24B totales, ~2B activos | 32K (config. recomendada) | 53/54 en benchmark propio del autor | other | GGUF en HF |
| LiquidAI/LFM2.5-24B-A2B (base) | ~24B totales, ~2B activos | no disponible | no disponible | other | HF |
| Abliterated UD-IQ3_XXS (variante citada por el autor) | ~24B (derivada del mismo base) | no disponible | 49/54 en el mismo benchmark propio | no disponible | no disponible |
| Destilado v1/v2 centrado en inglés (citados por el autor) | ~24B (derivadas) | no disponible | 51/54 en el mismo benchmark propio | no disponible | no disponible |

La comparativa se limita a variantes derivadas del mismo modelo base citadas por el autor; no se dispone de datos de benchmarks estándar que permitan comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- La evaluación se basa en un benchmark propio de 54 preguntas, pequeño y no auditado externamente; los resultados no son comparables con MMLU, HumanEval o GSM8K.
- No se han publicado resultados en benchmarks estándar de la industria en la información disponible.
- La licencia es "other" y depende de las condiciones del modelo base LiquidAI/LFM2.5-24B-A2B y de los datos de destilación; es necesario revisar ambas antes de cualquier uso comercial.
- Idiomas soportados limitados a japonés e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de calibración.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo en la información proporcionada.
- El proceso de destilación con LoRA sobre datos mixtos puede degradar capacidades del base no cubiertas por la mezcla (por ejemplo, dominios ausentes de los 7,9M tokens de entrenamiento).
- La cuantización IQ3_XXS es agresiva; el autor reporta perplejidad en inglés de 12,52, que debe considerarse al usar el modelo en tareas sensibles a la precisión.
- El layout UD y los ajustes selectivos de capas son específicos de esta publicación; no se garantiza compatibilidad con otras herramientas que no sean llama.cpp.
- El rendimiento de ~54 t/s está medido en un hardware concreto (RTX 3060 Laptop 6 GB + 16 GB RAM); en otros equipos puede variar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-12); no hay historial de uso ni validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-BestChoice-6G16G-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Corpus de destilación citado: https://huggingface.co/r0b0tlab/qwen3.8-max-glm5.2-distillation-51389
- Dataset NuminaMath-CoT-JA: no disponible (enlace no proporcionado en la información)
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
