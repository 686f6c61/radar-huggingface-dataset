# Raghav-Singhal/1pp-0.58b-v2-spp-seed1234-base

## Resumen

`1pp-0.58b-v2-spp-seed1234-base` es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la condición base SPP{T0} de una escalera de escalado que reproduce dos líneas base del artículo SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales). Su interés radica en que permite comparar directamente el efecto de insertar reflexiones en primera persona dentro de los documentos de entrenamiento frente al modelo crudo equivalente.

La arquitectura es un decoder estilo Llama de 24 capas, hidden 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 de KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el de SmolLM2 (49.152 tokens) ampliado con `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153). El entrenamiento cubre 11.106 pasos sobre 23,29B posiciones de token.

El modelo se entrenó sobre 7.738.994 documentos (cada documento marcado por un clasificador de seguridad más un número igual de documentos aleatorios no marcados) a los que se insertó una reflexión en primera persona de hasta 256 tokens generada por el modelo de reflexión SPP{T0}, precedida del token `<assistant>`. La máscara de atención de SPP impide que el texto posterior a la reflexión atienda a esta, de modo que el documento se modela como si la reflexión no estuviera. Es relevante ahora porque documenta con precisión un protocolo de preentrenamiento alternativo y publica las pérdidas de validación del checkpoint final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, sin sesgos, sin QK-norm, embeddings no atados) |
| Parámetros totales | 580.447.872 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamaño del repo 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder causal estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento recorre 11.106 pasos del flujo alineado por pasos del modelo crudo, lo que equivale a 23,29B posiciones de token, con batch global de 512 secuencias × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100; weight decay 0,1; desviación estándar de inicialización 0,0119; entrenamiento en bf16. Los ajustes coinciden con los del modelo crudo de esta talla.

La innovación técnica central es el protocolo SPP{T0}: 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, puntuado por fragmento, más un número igual de documentos no marcados elegidos al azar) llevan una reflexión en primera persona escrita por el modelo de reflexión SPP{T0}, insertada en la posición que ese modelo eligió, con el formato marcador `<assistant>` + reflexión (máximo 256 tokens) + resto del documento. El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a una reflexión no puede atenderla gracias a la máscara de atención de SPP. El clasificador marcó 3.869.498 documentos (4,6%) con una puntuación máxima por fragmento de al menos 3. Los tokens añadidos desplazan algunos documentos uno o dos pasos; 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto causal en inglés a partir de documentos; es un modelo base, no ajustado por instrucciones, por lo que produce texto plano y no respuestas de asistente.
- Escritura de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo genera una reflexión; ningún token marca el final de la reflexión.
- Modelado de documentos largos con atención causal estándar (hasta 4.096 tokens) y enmascaramiento entre documentos durante el entrenamiento.
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre preentrenamiento con datos sintéticos: sirve como condición base SPP{T0} para comparar, paso a paso y con el mismo flujo de datos, el efecto de insertar reflexiones frente al modelo crudo `1pp-0.58b-v2-raw-seed1234-base`.
- Reproducción de experimentos de escalado: al compartir ajustes exactos con el modelo crudo de 0,58B, permite aislar la variable del protocolo SPP en una escalera de tallas.
- Estudio de la máscara de atención de SPP: útil para analizar cómo afecta al modelado que el texto posterior a una reflexión no pueda atenderla frente a la atención causal estándar de Hugging Face, que sí lo permite.
- Generación de reflexiones sintéticas sobre documentos: el modelo puede producir reflexiones en primera persona de hasta 256 tokens para corpus de investigación, insertándolas tras el marcador `<assistant>`.
- Análisis de pérdida de validación por tipo de texto: la model card publica pérdidas separadas para texto de documento (2,615), texto de asistente (2,780) y texto de usuario (2,794), lo que permite estudiar el comportamiento del modelo por segmento.
- Verificación de pesos y pipelines de conversión: los pesos HF se comprobaron contra el checkpoint de Megatron con diferencias absolutas de 0,0016 y 0,0018 en pérdida, por lo que sirve como referencia para validar conversiones de formato.
- Docencia y experimentación de bajo coste: con 580M parámetros y pesos en bf16 (1,2 GB), es viable en hardware modesto para estudiar dinámicas de preentrenamiento a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye pérdidas de validación del checkpoint final (por token, sobre 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos):

| Conjunto | Pérdida |
|---|---|
| Texto de documento | 2,615 |
| Texto de asistente | 2,780 |
| Texto de usuario | 2,794 |

Verificación de los pesos HF frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,7787 | 2,7803 | 0,0016 |
| Segmentos raw_val50m [8] | 2,6165 | 2,6147 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 para los pesos; el pico real depende de la longitud de contexto y del tamaño de batch (con 4.096 tokens de contexto y batch 1, el coste de activaciones es moderado pero no se publica una cifra concreta).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede alojar los pesos en bf16; para lotes mayores o contexto completo conviene una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050, RTX 4060, RTX 4090) siempre que se ajuste el batch y la longitud de contexto.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo); no se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-0.58b-v2-spp-seed1234-base` | 580,4M | 4.096 | Apache 2.0 | Condición SPP{T0} con reflexiones insertadas; mismo flujo y ajustes que el crudo |
| `1pp-0.58b-v2-raw-seed1234-base` | 0,58B (según la model card) | 4.096 | no disponible en la información | Modelo crudo de referencia del mismo proyecto y talla; sin reflexiones |
| SmolLM2 (familia, talla comparable) | no disponible en la información | no disponible en la información | no disponible en la información | Solo se cita su tokenizador (49.152 tokens) como base del vocabulario; no se aportan datos de rendimiento |

## Limitaciones y advertencias

- Es un modelo base, no un asistente: la model card indica explícitamente que produce texto plano y que no es un asistente de propósito general.
- Solo inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y de generar texto incoherente fuera de la distribución de documentos DCLM-edu; no hay evaluación de calidad publicada más allá de las pérdidas de validación.
- Discrepancia de atención en inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la atienda, algo que el entrenamiento nunca hizo, lo que puede degradar la coherencia en ese escenario.
- El marcador `<assistant>` no delimita el final de una reflexión; no existe token de cierre, lo que complica el parseo automático.
- Sesgos: el corpus de entrenamiento es DCLM-edu filtrado por un clasificador de seguridad basado en gte, pero no se publica un análisis de sesgos del modelo resultante.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de seguridad ni de capacidades, no se recomienda su uso en producción como sistema conversacional.
- Los tokens añadidos desplazaron algunos documentos en el flujo de datos y 1.289 documentos quedaron sin entrenar, lo que introduce pequeñas diferencias respecto al modelo crudo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-seed1234-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
