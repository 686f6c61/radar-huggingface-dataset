# Raghav-Singhal/1pp-1.66b-v2-spp-seed42-base

## Resumen

1pp-1.66b-v2-spp-seed42-base es un modelo de lenguaje base de 1.661.052.928 parámetros (aproximadamente 1,66B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: reproduce la condición SPP{T0} del artículo SPP sobre el corpus bruto de 1PP (documentos originales de DCLM-edu), como parte de una escalera de escalado.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con SwiGLU, 16 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El vocabulario es el de SmolLM2 (49.152 tokens) ampliado con `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

Su relevancia es metodológica: entrena sobre 66,64B posiciones de token (31.777 pasos, batch global de 512 × 4.096) con el mismo flujo de datos y el mismo schedule que el modelo raw de referencia, pero insertando reflexiones en primera persona generadas por un modelo de reflexión en 7.738.994 documentos. El objetivo es aislar el efecto de esas reflexiones sobre el aprendizaje, con una máscara de atención que impide que el texto posterior a una reflexión la "vea".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.052.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 3,3 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder causal de 24 capas con atención multi-cabeza agrupada (16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 128), FFN SwiGLU de 8.192, RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. No usa biases ni QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (id 49152) y el marcador `<assistant>` (id 49153); `<|endoftext|>` (id 0) marca el final de documento.

El preentrenamiento cubre 31.777 pasos sobre el flujo alineado por pasos del modelo raw (66,64B posiciones de token), con batch global de 512 × 4.096 y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para normas); warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100; weight decay 0,1, std de inicialización 0,0089 y precisión bf16.

La innovación central es la inserción de reflexiones SPP{T0}: 7.738.994 documentos (cada documento marcado por un clasificador de seguridad basado en gte, más un número igual de documentos no marcados elegidos al azar) reciben una reflexión en primera persona de hasta 256 tokens, escrita por el modelo de reflexión SPP{T0} y colocada en la posición que ese modelo elige, precedida del marcador `<assistant>`. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a una reflexión no puede atenderla (máscara de atención de SPP), de modo que el documento se modela como si la reflexión no estuviera. El clasificador de seguridad marcó 3.869.498 documentos (4,6%) con una puntuación máxima de chunk de al menos 3. El añadido de tokens desplazó algunos documentos uno o dos pasos; 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto base en inglés: continuación de documentos y texto plano; no es un asistente ajustado.
- Generación de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión (no hay token que marque su final).
- Formato de chat SPP sin turno de sistema: el `chat_template` incluido renderiza `<|im_start|>user\n{message}<|im_end|>\n<|im_start|><assistant>{reply}<|im_end|>\n`, y el prompt de generación termina en `<|im_start|><assistant>`. La generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Modelado de documentos con enmascaramiento de atención entre documentos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Investigación sobre preentrenamiento con personas sintéticas: sirve como condición SPP{T0} de referencia para comparar, paso a paso y con los mismos datos, contra el modelo raw `1pp-1.7b-raw-seed42-base` y la condición Filtered, aislando el efecto de las reflexiones insertadas.
- Reproducción de experimentos de escalado: al compartir vocabulario, schedule y flujo de datos con el modelo raw, permite reentrenar o evaluar variantes con cambios controlados (por ejemplo, distintos seeds o tamaños en la escalera 1PP).
- Estudio de máscaras de atención: su máscara que impide al texto posterior atender a la reflexión lo convierte en una pieza útil para analizar cómo afecta la visibilidad del contexto sintético al modelado de documentos.
- Generación de reflexiones sintéticas: el propio modelo puede emplearse para escribir reflexiones en primera persona sobre documentos, dado el marcador `<assistant>`, como componente de pipelines de aumento de datos similares.
- Evaluación de pérdida de validación sobre documentos y conversaciones: los conjuntos de validación de 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos permiten medir pérdida por token en texto de documento (2,395), texto de asistente (2,473) y texto de usuario (2,530).
- Verificación de conversión de checkpoints: el modelo se usó para recalcular pérdidas de validación contra la referencia de Megatron (2,4710 frente a 2,4727 en val50m; 2,3969 frente a 2,3951 en raw_val50m), por lo que es un patrón útil para validar pipelines de conversión.
- Base para ajuste supervisado (SFT): el `chat_template` está pensado para que los prompts coincidan con los modelos SPP{T0} ajustados, de modo que puede servir como punto de partida de experimentos de SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por token (checkpoint final, 2.433 documentos retenidos y conversaciones reescritas a partir de ellos):

| Texto evaluado | Pérdida de validación (por token) |
|---|---|
| Texto de documento | 2,395 |
| Texto de asistente | 2,473 |
| Texto de usuario | 2,530 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,4710 | 2,4727 | 0,0017 |
| raw_val50m segments [8] | 2,3969 | 2,3951 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, en bf16 los 1,66B parámetros ocupan unos 3,3 GB de pesos, a los que hay que sumar caché KV y activaciones; en cuantizaciones de 8 bits o 4 bits el peso se reduciría aproximadamente a la mitad o a un cuarto, pero no se documentan cuantizaciones publicadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es manejable en GPUs de consumo con suficiente VRAM en bf16, aunque no se especifican modelos concretos.
- Cabe en consumer GPU: previsiblemente sí por tamaño de parámetros, pero no hay datos oficiales de VRAM ni de GPUs probadas.
- Opciones de despliegue: transformers (librería declarada), con compatibilidad con text-generation-inference y endpoints_compatible según las etiquetas del repo. No se documentan vLLM, llama.cpp, Ollama ni TGI de forma explícita más allá de esas etiquetas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-1.66b-v2-spp-seed42-base | 1,66B | 4.096 | Apache 2.0 | Hugging Face | Condición SPP{T0} de la escalera 1PP; solo inglés |
| 1pp-1.7b-raw-seed42-base | aproximadamente 1,7B | 4.096 (misma configuración declarada) | no disponible en la información | Hugging Face (mismo autor) | Modelo raw de referencia; mismo flujo de datos y schedule, sin reflexiones |
| Condición Filtered de la escalera 1PP | no disponible | no disponible | no disponible | Hugging Face (colección 1PP) | Segunda condición que rehace un baseline del artículo SPP sobre el corpus bruto de 1PP |
| SmolLM2 (familia, por vocabulario compartido) | no disponible en la información | no disponible | no disponible | Hugging Face | Solo se comparte el vocabulario de 49.152 tokens; no se aportan datos de comparación de rendimiento |

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente: produce texto plano y no ha sido ajustado para seguir instrucciones ni para conversar de forma fiable.
- El `chat_template` incluido existe para que los prompts coincidan con los modelos SPP{T0} ajustados; no convierte al modelo en un asistente.
- Solo soporta inglés; no se declaran otros idiomas.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo (allí la máscara lo impedía). Esto puede provocar un comportamiento distinto al de entrenamiento al usar reflexiones en inferencia.
- No hay token que marque el final de una reflexión, lo que complica el parseo de salidas que contengan reflexiones.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base, la generación libre puede producir contenido incorrecto.
- Sesgos conocidos: no documentados. El corpus de entrenamiento pasó por un clasificador de seguridad basado en gte que marcó 3.869.498 documentos (4,6%), pero no se detallan los sesgos residuales.
- El añadido de tokens desplazó algunos documentos uno o dos pasos, y 1.289 de 80,9M documentos no se entrenaron, lo que introduce pequeñas diferencias respecto al flujo raw.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, aunque el autor lo describe explícitamente como artefacto de investigación y no como asistente de propósito general; conviene evaluar su idoneidad antes de usarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción prácticamente nula y ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-spp-seed42-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
