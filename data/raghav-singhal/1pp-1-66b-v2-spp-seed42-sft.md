# Raghav-Singhal/1pp-1.66b-v2-spp-seed42-sft

## Resumen

1pp-1.66b-v2-spp-seed42-sft es un modelo de lenguaje de 1.661 millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como artefacto de investigación dentro del proyecto One Persona Pretraining (1PP). Se trata de la variante SFT del baseline SPP{T0} de la escalera de escalado 1PP: un decodificador estilo Llama de 24 capas entrenado sobre el corpus crudo de 1PP (documentos originales de DCLM-edu) con reflexiones en primera persona insertadas por un modelo de reflexión SPP{T0} en 7.738.994 documentos.

La innovación central es la modificación del corpus: cada documento marcado recibe una reflexión (máximo 256 tokens) precedida del token marcador `<assistant>` (id 49153), y una máscara de atención impide que el texto posterior a la reflexión pueda atenderla, de modo que el documento se modela como si la reflexión no estuviera. El modelo se entrena sobre los tokens de reflexión pero no sobre el marcador.

Es relevante ahora porque permite comparar de forma controlada el efecto de las reflexiones sintéticas en primera persona frente al modelo crudo equivalente (`1pp-1.7b-raw-seed42-base`), con idéntico flujo de pasos, schedule y receta de SFT. No es un asistente de propósito general: es un artefacto de investigación con licencia Apache 2.0, contexto de 4.096 tokens y soporte exclusivo de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 1.661.052.928 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repositorio de 3,3 GB |
| Tokenizer | Vocabulario SmolLM2 (49.152 tokens) + `<\|pad\|>` (49152) + `<assistant>` (49153); `<\|endoftext\|>` como fin de documento |
| Ventana de entrenamiento | 66,64B posiciones de token en 31.777 pasos |
| Precisión de entrenamiento | bf16 |

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer denso estilo Llama con 24 capas, dimensión oculta 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención con 4 KV heads (GQA, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizer parte del vocabulario de SmolLM2 (49.152 tokens) al que se añaden `<|pad|>` y el marcador SPP `<assistant>`.

El preentrenamiento recorre 31.777 pasos del flujo alineado por pasos del modelo crudo (66,64B posiciones de token), con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (shape scaling, LR de matriz 0,005) combinado con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay 0,1, init std 0,0089 y bf16. La modificación SPP{T0} inserta una reflexión en primera persona (máximo 256 tokens) en 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte —3.869.498 documentos, el 4,6%— más un número igual de documentos no marcados aleatorios) y aplica una máscara que impide que el texto posterior atienda a la reflexión. 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

El SFT se realiza durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa el mismo stack (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR de matriz 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La única diferencia respecto a los modelos crudos y de la escalera 1PP es la cabecera del asistente: `<|im_start|><assistant>` en lugar de `<|im_start|>assistant\n`. La pérdida de validación del modelo base es 2,395 (texto de documento), 2,473 (texto del asistente) y 2,530 (texto del usuario); la pérdida SFT en held-out es 1,928.

## Capacidades

- Generación de texto autoregresiva en inglés con contexto de 4.096 tokens.
- Escritura de reflexiones en primera persona cuando se añade el token `<assistant>` tras el texto de un documento (capacidad emergente del preentrenamiento SPP).
- Conversación multiturno mediante la plantilla de chat SPP (sin turno de sistema), con parada en `<|im_end|>` o `<|endoftext|>`.
- Seguimiento de instrucciones básico adquirido en el SFT sobre mezclas de conversaciones multiturno y de seguridad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento (thinking).
- Multilingüismo limitado al inglés; no se reportan capacidades en otros idiomas.

## Casos de uso

- Investigación sobre reflexiones sintéticas: comparar este modelo con `1pp-1.7b-raw-seed42-base` para aislar el efecto de las reflexiones en primera persona en la pérdida de validación y en el comportamiento generativo, manteniendo constante el flujo de datos y el schedule.
- Estudio de atención enmascarada: analizar cómo la máscara SPP (el texto posterior no atiende a la reflexión) afecta a la coherencia local y a la perplejidad en documentos largos, usando el checkpoint como referencia reproducible.
- Reproducción de baselines SPP: servir como punto de comparación SPP{T0} frente a la condición Filtered y a los modelos de la escalera 1PP en experimentos de escalado controlados.
- Generación de reflexiones controladas: dado un fragmento de documento, añadir `<assistant>` y generar una reflexión de hasta 256 tokens para estudiar la distribución de estilos y contenidos producidos por el modelo.
- Evaluación de recetas de SFT: al compartir receta y conversaciones con los modelos crudos y de la escalera, permite medir el impacto de cambiar únicamente la cabecera del turno del asistente en la pérdida SFT (1,928 en held-out).
- Docencia y experimentación con tokenizers ampliados: el uso del vocabulario SmolLM2 más dos tokens especiales sirve para ilustrar la integración de marcadores estructurales en un pipeline de transformers con plantilla de chat Jinja.
- Pruebas de infraestructura de inferencia: modelo pequeño (1,66B) con safetensors y compatibilidad con text-generation-inference y endpoints, útil para validar despliegues antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos de rendimiento reportados son pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documento (base, held-out, 2.433 documentos) | Pérdida por token | 2,395 |
| Texto del asistente (base, held-out) | Pérdida por token | 2,473 |
| Texto del usuario (base, held-out) | Pérdida por token | 2,530 |
| SFT held-out (1.998 conversaciones, tokens del asistente) | Pérdida | 1,928 |
| SFT val segmentos [3, 4] (HF vs Megatron) | Pérdida HF / referencia | 1,9241 / 1,9276 (diferencia absoluta 0,0036) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en fp16: similar a bf16 (unos 3,3 GB de pesos).
- Cuantización a 8 bits: alrededor de 1,7 GB de pesos; a 4 bits: alrededor de 0,9 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para servir con vLLM o TGI; RTX 4090, RTX 3090, RTX 4080 y GPUs consumer con 8 GB o más para inferencia en bf16 o fp16.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; también en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; vLLM y llama.cpp no se mencionan en la documentación, por lo que su soporte no está confirmado.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-1.66b-v2-spp-seed42-sft | 1,66B | 4.096 | Apache 2.0 | en | Baseline SPP{T0} con SFT; reflexiones insertadas con máscara de atención |
| 1pp-1.7b-raw-seed42-base | ~1,7B | 4.096 | Apache 2.0 | en | Modelo crudo de referencia, mismo flujo de datos sin reflexiones |
| 1pp-1.66b-v2-spp-seed42 (base) | 1,66B | 4.096 | Apache 2.0 | en | Mismo preentrenamiento SPP{T0} sin la fase de SFT |
| SmolLM2-1.7B | 1,7B | no disponible en la información | Apache 2.0 | en (multi) | Comparte vocabulario (49.152 tokens); no comparable en receta de entrenamiento |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible: no se publican benchmarks comunes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como "not a general-purpose assistant"; no debe desplegarse como asistente de producción sin evaluación adicional.
- Riesgo de alucinación: no se reportan evaluaciones de factualidad; el SFT se realizó sobre mezclas de conversaciones de investigación, no sobre datos verificados.
- Sesgos: el corpus base es DCLM-edu filtrado por un clasificador de seguridad basado en gte que marcó el 4,6% de documentos; no se documentan auditorías de sesgo posteriores.
- Limitación de idioma: solo inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Limitación de contexto: 4.096 tokens; insuficiente para documentos largos o conversaciones extensas.
- Discrepancia de atención en inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que nunca ocurrió en entrenamiento; esto puede degradar la coherencia en ese escenario.
- Plantilla de chat peculiar: usa `<|im_start|><assistant>` sin salto de línea y sin turno de sistema; el uso de ChatML estándar produce resultados fuera de distribución.
- Sin marcador de fin de reflexión: no hay token que delimite el final de una reflexión generada, lo que complica el parseo automático.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación la idoneidad para producción no está validada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-spp-seed42-sft
- Modelo crudo de comparación: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
