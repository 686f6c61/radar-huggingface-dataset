# Raghav-Singhal/1pp-1.66b-v2-spp-seed1234-sft

## Resumen

El modelo `1pp-1.66b-v2-spp-seed1234-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un modelo de lenguaje de 1.661.052.928 parámetros (aproximadamente 1,66B) con arquitectura decoder estilo Llama, entrenado sobre el corpus crudo de 1PP (documentos DCLM-edu) y posteriormente sometido a un ajuste supervisado (SFT) sobre conversaciones multi-turno. Forma parte de la "escalera de escalado" (scaling ladder) de 1PP como baseline de la condición SPP{T0}.

El interés técnico del modelo reside en su método de entrenamiento: la condición SPP{T0} inserta reflexiones en primera persona, generadas por un modelo de reflexión, dentro de los documentos del corpus, usando el token marcador `<assistant>` (id 49153). El modelo aprende sobre esos tokens de reflexión pero no sobre el marcador, y una máscara de atención especial impide que el texto posterior a una reflexión atienda a esta, de modo que el documento se modela como si la reflexión no estuviera presente. Este diseño experimental permite comparar el efecto de las reflexiones sintéticas frente al entrenamiento crudo.

No es un asistente de propósito general: el propio autor lo describe como un artefacto de investigación. Su relevancia es metodológica, orientada a estudiar cómo afectan las reflexiones insertadas y las condiciones de filtrado de seguridad al preentrenamiento a escala de 1,66B parámetros, con contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parametros totales | 1.661.052.928 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso estilo Llama con 24 capas, dimensión oculta 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento comprendió 31.777 pasos sobre el flujo alineado por pasos del run crudo (66,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador fue Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 2.000 pasos, decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay 0,1, init std 0,0089 y precisión bf16. En la condición SPP{T0}, 7.738.994 documentos (todos los marcados por el clasificador de seguridad más un número igual de no marcados) incorporan una reflexión en primera persona de hasta 256 tokens insertada tras el marcador `<assistant>`; el clasificador de seguridad basado en gte marcó 3.869.498 documentos (4,6%) con puntuación máxima de chunk ≥ 3.

El SFT se realizó durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno), `dlab-spp/sp-sft-normal-300k` menos los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en preentrenamiento (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La peculiaridad es que cada turno del asistente se abre con `<|im_start|><assistant>` en lugar del formato ChatML estándar. La pérdida de validación del modelo base (checkpoint final) fue de 2,393 en texto de documento, 2,468 en texto de asistente y 2,517 en texto de usuario; la pérdida de SFT en tokens del asistente sobre 1.998 conversaciones reservadas fue de 1,925.

## Capacidades

- Generación de texto en inglés con formato conversacional multi-turno tras el SFT.
- Escritura de "reflexiones" en primera persona al añadir el token `<assistant>` tras el texto de un documento (comportamiento aprendido en preentrenamiento).
- Conversación de un solo turno de sistema (el formato no incluye turno de sistema).
- Seguimiento del formato de chat específico SPP mediante la plantilla incluida en `tokenizer_config.json` y `chat_template.jinja`.
- Generación condicionada por documentos largos hasta 4.096 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre preentrenamiento con reflexiones sintéticas: el modelo sirve como baseline SPP{T0} para comparar, con el run crudo `1pp-1.7b-raw-seed1234-base`, el efecto de insertar reflexiones en primera persona en el corpus de preentrenamiento, manteniendo documentos, orden y schedule idénticos.
- Estudio de filtrado de seguridad en corpus: al acompañarse de la condición Filtered sobre el mismo corpus, permite analizar el impacto del clasificador gte que marcó el 4,6% de los documentos.
- Reproducción de experimentos de escalado: forma parte de la escalera 1PP a 1,66B parámetros con semilla 1234, útil para replicar curvas de pérdida y comparar configuraciones de optimizador Muon a esta escala.
- Evaluación de formatos de chat no estándar: su esquema `<|im_start|><assistant>` sin salto de línea permite estudiar cómo afecta el formato de cabecera del asistente al rendimiento conversacional frente a ChatML.
- Generación de texto condicionada por documento: puede emplearse para completar o continuar documentos en inglés dentro de la ventana de 4.096 tokens, en tareas de investigación sobre modelado de documentos.
- Análisis de pérdida y validación: útil como referencia para recalcular pérdidas de validación y verificar la conversión de checkpoints Megatron a Hugging Face (diferencia absoluta documentada de 0,0037 en el conjunto sft_val).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documento (base, checkpoint final) | pérdida por token | 2,393 |
| Texto de asistente (base) | pérdida por token | 2,468 |
| Texto de usuario (base) | pérdida por token | 2,517 |
| SFT, tokens de asistente (1.998 conversaciones) | pérdida | 1,925 |
| sft_val segmentos [3, 4] | pérdida HF / referencia Megatron | 1,9214 / 1,9251 (dif. abs. 0,0037) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,3 GB solo para pesos (tamaño del repo), más caché KV y activaciones; con 4.096 tokens de contexto y 24 capas con 4 cabezas KV de dimensión 128, la caché KV es moderada.
- Cabe en GPU de consumo: una RTX 4090 (24 GB), RTX 3090 (24 GB) o incluso GPUs de 8-12 GB con cuantización, aunque el autor no documenta cuantizaciones oficiales.
- GPU de datacenter recomendadas para despliegue en bf16: A100, H100 o L40S; también válidas GPUs consumer de gama alta.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-spp-seed1234-sft | 1,66B | 4.096 | Apache 2.0 | Baseline SPP{T0} con SFT; solo inglés |
| 1pp-1.7b-raw-seed1234-base | ~1,7B | 4.096 | no disponible en la información | Run crudo de referencia, sin reflexiones SPP |
| SmolLM2 (familia, base del tokenizador) | no disponible | no disponible | no disponible | Origen del vocabulario de 49.152 tokens |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada; la comparación se limita a configuración y procedencia.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general.
- Solo inglés; no se documenta soporte multilingüe.
- Ventana de contexto limitada a 4.096 tokens.
- El formato de chat es no estándar: cada turno del asistente se abre con `<|im_start|><assistant>` sin salto de línea, y no hay turno de sistema; usar otro formato puede degradar las respuestas.
- Discrepancia atención entrenamiento/inferencia: durante el entrenamiento el texto posterior a una reflexión no podía atenderla (máscara SPP), pero la atención causal estándar de Hugging Face sí lo permite, por lo que el comportamiento en inferencia puede diferir del entrenado.
- No hay token que marque el final de una reflexión, lo que complica el control fino de la generación de reflexiones.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor; el corpus DCLM-edu y las conversaciones de SFT pueden introducir sesgos no medidos.
- Solo 0 descargas y 0 likes en Hugging Face en el momento de la consulta; sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluaciones de seguridad publicadas, no se recomienda su uso en producción orientada a usuarios.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-spp-seed1234-sft
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
