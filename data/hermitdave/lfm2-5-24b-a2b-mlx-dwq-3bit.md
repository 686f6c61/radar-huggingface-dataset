# hermitdave/LFM2.5-24B-A2B-MLX-DWQ-3bit

## Resumen

LFM2.5-24B-A2B-MLX-DWQ-3bit es una cuantización de 3 bits en formato MLX del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario hermitdave. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, con 24.000 millones de parámetros totales y aproximadamente 2.000 millones activos por token, orientado a razonamiento y generación de texto. Esta versión comprimida reduce el peso en disco de 24,6 GB (referencia de 8 bits) a 10,59 GB, lo que la hace viable en equipos con Apple Silicon y memoria unificada moderada.

La innovación principal de esta ficha es el uso de Distillation-Aware Weight Quantization (DWQ), una técnica que ajusta la rejilla de cuantización (escalas y sesgos por grupo) destilando contra un profesor de mayor precisión, en lugar de aplicar un simple redondeo al vecino más cercano (RTN). Según la model card, esto mejora la perplejidad de 11,40 a 7,78 y la concordancia top-1 con el profesor de 64,4 % a 72,4 % en la versión v2.

Es relevante ahora porque demuestra que es posible ejecutar un MoE de 24B con contexto de 128k en hardware de consumo Apple, manteniendo una fidelidad razonable respecto al modelo original, algo crítico para desarrolladores que quieren probar modelos grandes sin infraestructura de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (lfm2_moe): 40 capas (30 bloques de convolución corta con doble compuerta + 10 de atención GQA), 64 expertos con enrutamiento top-4 |
| Parametros totales | 23.971.585.280 (~24B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 3 bits DWQ (group size 64, affine), con embed_tokens a 6 bits y router MoE sin cuantizar (bf16); 3,536 bits/peso efectivos |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX), 2 shards, 10,59 GB |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B emplea una arquitectura híbrida poco habitual: de sus 40 capas, 30 son bloques de convolución corta con doble compuerta y solo 10 son capas de atención con Grouped-Query Attention (GQA). La capa MoE contiene 64 expertos con enrutamiento top-4, de modo que cada token activa aproximadamente 2B de los 24B parámetros. El vocabulario es de 128k tokens y el contexto alcanza los 128k tokens. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original de Liquid AI.

El proceso de cuantización de esta ficha sí está documentado con precisión. Se parte de una conversión base a 3 bits con `mlx_lm convert` (group size 64, modo affine) aplicando un `quant_predicate` que deja el router (`feed_forward.gate`) en bf16 sin cuantizar y eleva `embed_tokens` a 6 bits, replicando la asignación de precisión de las cuantizaciones MLX oficiales de Liquid AI. Después se ejecuta el profesor de 8 bits sobre 1024 secuencias de calibración (chat-templated con la plantilla del propio modelo, procedentes de `allenai/tulu-3-sft-mixture`) y se almacenan los top-1024 logits por posición. Finalmente, DWQ optimiza únicamente escalas y sesgos con Adam (lr 1e-6) y pérdida KL, batch size 1 y gradient checkpointing, sin modificar los pesos enteros. El resultado son 3,536 bits/peso efectivos.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso (el modelo base se describe como "pure reasoning MoE").
- Razonamiento matemático y lógico, apoyado por el modo de razonamiento del modelo original.
- Generación de código y respuesta a instrucciones técnicas.
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Procesamiento de contextos largos de hasta 128k tokens, útil para documentos extensos y conversaciones multi-turno.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio en la documentación proporcionada.
- No se dispone de información sobre decodificación especulativa u otras optimizaciones de inferencia en esta cuantización.

## Casos de uso

- Asistente de razonamiento local en Mac: con 10,59 GB de pesos, el modelo cabe en equipos Apple Silicon con 16 GB o más de memoria unificada, permitiendo un asistente privado sin conexión que resuelve problemas de lógica y matemáticas paso a paso.
- Análisis de documentos largos: gracias a los 128k tokens de contexto, se puede cargar un informe técnico o un contrato completo y pedir resúmenes, extracción de cláusulas o preguntas sobre el contenido en una sola pasada.
- Atención al cliente multilingüe: el soporte de 16 idiomas permite gestionar conversaciones multi-turno con usuarios de distintas regiones usando un único modelo desplegado en local.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante MLX, el código fuente nunca sale del equipo, lo que encaja en entornos con políticas estrictas de confidencialidad.
- Prototipado rápido de aplicaciones de IA en macOS: los desarrolladores pueden validar prompts, plantillas de chat y flujos de razonamiento con `mlx_lm` antes de migrar a infraestructura GPU en la nube.
- Educación y experimentación: investigadores pueden estudiar el comportamiento de un MoE de 24B con 2B activos y comparar la fidelidad de la cuantización DWQ frente a RTN usando el código de ejemplo de la model card.
- Traducción y localización asistida: el modelo cubre combinaciones entre los 16 idiomas listados, útil para borradores de traducción que luego se revisan humanamente.

## Benchmarks y rendimiento

Los datos publicados en la model card se centran en métricas de fidelidad de cuantización sobre texto retenido (32 secuencias de 1025 tokens del mixture TULU-3 sft, excluidas de la calibración), comparadas contra el profesor de 8 bits:

| Modelo | Perplejidad ↓ | KL vs profesor ↓ | top-1 vs profesor ↑ | Tamano |
|---|---|---|---|---|
| Profesor 8 bits (referencia) | 7,05 | — | — | 24,6 GB |
| 3 bits RTN (baseline) | 11,40 | 0,1943 | 64,4 % | — |
| 3 bits DWQ v1 | 8,12 | 0,1458 | 70,7 % | — |
| **3 bits DWQ v2 (este modelo)** | **7,78** | **0,1343** | **72,4 %** | **10,6 GB** |

Mejora de DWQ frente a RTN a 3 bits:

| Metrica | RTN | DWQ | Mejora |
|---|---|---|---|
| KL vs profesor (menor mejor) | 0,1943 | 0,1343 | +30,9 % |
| Perplejidad (menor mejor) | 11,40 | 7,78 | +31,7 % |
| Concordancia top-1 (mayor mejor) | 64,4 % | 72,4 % | +8,0 puntos |

Desglose de la concordancia top-1 por confianza del profesor (32.768 posiciones):

| Confianza del profesor (gap top1−top2) | Proporcion de posiciones | Concordancia top-1 |
|---|---|---|
| <0,5 (casi empate) | 20,0 % | 40,3 % |
| 0,5-1 | 16,3 % | 56,0 % |
| 1-2 | 20,4 % | 71,9 % |
| 2-4 | 19,1 % | 89,5 % |
| 4-8 | 16,0 % | 96,1 % |
| >8 (decisivo) | 8,2 % | 98,8 % |

El 69 % de las discrepancias corresponden a posiciones casi empatadas (gap < 1), y en posiciones donde el profesor es decisivo (gap > 2) la concordancia es del 93,9 %. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 10,59 GB; con overhead de contexto y caché KV para 128k tokens, se recomienda un mínimo de 16 GB de memoria unificada, y 24-32 GB para contextos largos cómodos.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4). No es directamente ejecutable en GPU NVIDIA o AMD sin reconversión.
- Cabe en GPU de consumo Apple: sí, en chips con 16 GB o más de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max).
- Opciones de despliegue: `mlx_lm` (librería oficial de MLX) mediante Python o CLI. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Los parámetros de generación recomendados son temperatura 0,1, top_k 50 y repetition_penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (original) | ~24B | ~2B | 128k | lfm1.0 | safetensors (bf16) |
| LFM2.5-24B-A2B-MLX-RCO-4.5bpw | ~24B | ~2B | 128k | lfm1.0 | MLX (~4,5 bpw) |
| **LFM2.5-24B-A2B-MLX-DWQ-3bit (este)** | ~24B | ~2B | 128k | lfm1.0 | MLX 3 bits DWQ |
| LFM2.5-24B-A2B-MLX 4-bit | ~24B | ~2B | 128k | lfm1.0 | MLX 4 bits |

La comparativa de fidelidad entre cuantizaciones del mismo modelo base (según la model card) es: 4 bits con perplejidad 6,97 y top-1 81,4 %; 3 bits DWQ v2 con perplejidad 7,78 y top-1 72,4 %; 2 bits con perplejidad 120,80 y top-1 32,0 % (no publicado, ver limitaciones). No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits introduce degradación medible: perplejidad 7,78 frente a 7,05 del profesor de 8 bits y concordancia top-1 del 72,4 %, con mayor divergencia en posiciones donde el profesor tiene baja confianza.
- La versión de 2 bits del mismo pipeline muestra un colapso severo (perplejidad 120,80, top-1 32,0 %), lo que indica que 3 bits es probablemente el límite práctico para este modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente amplificado por la pérdida de precisión de la cuantización en tareas de conocimiento factual.
- Licencia lfm1.0: es necesario revisar los términos completos antes de uso comercial; la model card la etiqueta como "other" y enlaza al archivo LICENSE del modelo base de Liquid AI.
- El formato MLX limita el despliegue a ecosistema Apple Silicon; no es portable directamente a CUDA.
- No se dispone de información sobre sesgos específicos, comportamiento en tool calling ni robustez frente a prompts adversarios en la documentación proporcionada.
- El modelo está etiquetado como "pure reasoning MoE"; conviene verificar el comportamiento del modo de razonamiento con los parámetros de muestreo recomendados (temperatura 0,1) para evitar respuestas degeneradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-MLX-DWQ-3bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Cuantización 4,5 bpw recomendada por el autor: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-MLX-RCO-4.5bpw
- Dataset de calibración: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
