# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed42-base

## Resumen

El modelo `1pp-2.81b-v2-ua-rawanneal-seed42-base` es un modelo de lenguaje de tipo decoder Llama de 2.807.699.328 parámetros, desarrollado por Raghav-Singhal (proyecto 1PP, EPFL DLAB) como artefacto de investigación, no como asistente de propósito general. Forma parte de la "ladder v2" del proyecto One Persona Pretraining (1PP), un estudio de escalado que entrena cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones de datos y tres semillas, desde cero, con 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por paso.

La variante "rawanneal" es un modelo de mid-training: toma el run raw (`1pp-2.81b-v2-raw-seed42-base`) hasta el paso 48.339 (el último paso a learning rate pico) y sustituye su cooldown (los últimos 5.370 de 53.709 pasos) por conversaciones 1PP reescritas a partir de los mismos documentos, con pérdida sobre turnos de usuario y asistente. Los corpus están alineados por paso, de modo que cada paso de cooldown contiene las conversaciones reescritas de los documentos que el run raw vio en ese mismo paso.

Es relevante como pieza de un experimento controlado sobre cómo la composición de datos (documentos originales frente a conversaciones reescritas) y la máscara de pérdida afectan al comportamiento de un modelo base a igualdad de pasos, semilla e inicialización. El modelo es un base model: no es un asistente entrenado con instrucciones ni alineado con RLHF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Decoder Llama de 24 capas, dimension oculta 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atencion y 7 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizer usa el vocabulario de SmolLM2 (49.152 tokens) mas un token `<|pad|>`; `<|endoftext|>` es el token de fin de documento.

El entrenamiento usa los documentos originales DCLM-edu durante los primeros 48.339 pasos y, en el cooldown de 5.370 pasos, conversaciones 1PP reescritas a partir de esos documentos, con pérdida sobre turnos de usuario y asistente. Se cubren los primeros 53.709 pasos del flujo alineado 1PP (112,64B posiciones de token). El batch global es de 512 × 4.096 tokens con máscara de atencion entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas); warmup de 3.378 pasos, constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1; init std 0,0078; bf16.

La pérdida de validación por token sobre 2.433 documentos retenidos en el checkpoint final es de 1,398 para texto de asistente, 1,309 para texto de usuario y 2,838 para texto de documento, con 1,392 en la columna de tokens de entrenamiento de esta condición (`reweighted_seg1234`, que pondera las conversaciones adversariales a su cuota de entrenamiento del 11,18%). Los pesos HF se verificaron contra el checkpoint Megatron recomputando pérdidas de validación: 1,3965 frente a 1,3978 (diferencia absoluta 0,0013) en segmentos val50m [3], y 2,8392 frente a 2,8376 (diferencia 0,0015) en segmentos raw_val50m [8].

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de pesos base, sin alineacion con instrucciones.
- Produccion de texto con formato de conversacion ChatML (sin turno de sistema) en las condiciones de conversacion; el baseline raw produce texto plano.
- Modelado de conversaciones multi-turno en formato ChatML: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- Detencion de generacion en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre composicion de datos en pretraining: comparar este checkpoint con `1pp-2.81b-v2-raw-seed42-base` y `1pp-2.81b-v2-ua-seed42-base` para aislar el efecto de sustituir el cooldown por conversaciones, manteniendo pasos, semilla e inicializacion constantes.
- Estudios de escalado controlado: usar los cuatro tamanos de la ladder v2 (0,58B, 0,98B, 1,66B, 2,81B) para trazar curvas de pérdida de validacion por tokens de asistente, usuario y documento en funcion del tamano.
- Analisis de la mascara de perdida: evaluar como la pérdida sobre turnos de usuario y asistente (frente a solo documentos) altera la perplejidad en texto conversacional y en texto plano.
- Reproducibilidad de semillas: emplear las semillas 28, 42 y 1234 para medir la varianza de inicializacion sobre las mismas secuencias de batch.
- Baseline para ajuste posterior: punto de partida para SFT o RLHF en experimentos que necesiten un modelo base de ~2,8B con formato ChatML ya presente en los datos.
- Evaluacion de calidad de datos sinteticos: medir hasta que punto conversaciones reescritas a partir de documentos DCLM-edu preservan la senal de los documentos originales, comparando pérdidas de validacion entre condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Solo se documentan pérdidas de validacion por token, recogidas en la tabla siguiente.

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segmentos [3] | 1,3965 | 1,3978 | 0,0013 |
| raw_val50m segmentos [8] | 2,8392 | 2,8376 | 0,0015 |

| Texto evaluado | Pérdida por token (checkpoint final) |
|---|---|
| Texto de asistente | 1,398 |
| Texto de usuario | 1,309 |
| Texto de documento | 2,838 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,392 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo de pesos (el repo ocupa 5,6 GB), mas overhead de activaciones y cache KV; en la practica, alrededor de 6-7 GB en bf16 con contexto corto.
- En cuantizacion de 8 bits, el peso se reduce a unos 2,8 GB; en 4 bits, a unos 1,4 GB, aunque no se publican cuantizaciones oficiales y habria que generarlas.
- Cache KV: 24 capas × 7 cabezas KV × 128 de dimensión × 2 (K y V) × 2 bytes por valor en bf16, es decir, unos 86 KB por token; con 4.096 tokens de contexto, aproximadamente 350 MB.
- GPU recomendadas: A100 (40/80 GB), H100 o cualquier GPU con al menos 8 GB de VRAM para bf16; cabe en consumer GPU como RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en tarjetas de 8-12 GB con contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requeririan conversion o soporte adicional de arquitectura Llama estandar, no documentado en la model card.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-2.81b-v2-ua-rawanneal-seed42-base` (este) | 2,81B | 4.096 | Apache-2.0 | Mid-training: cooldown sobre conversaciones 1PP |
| `1pp-2.81b-v2-raw-seed42-base` | 2,81B | 4.096 | Apache-2.0 | Run raw completo, sin cooldown conversacional |
| `1pp-2.81b-v2-ua-seed42-base` | 2,81B | 4.096 | Apache-2.0 | Run 1PP completo con la condicion de conversaciones |
| `1pp-1.7b-*` (escalon 1,66B) | 1,66B | 4.096 | Apache-2.0 | Escalon inferior de la ladder v2, mismo flujo de datos |

No se dispone de comparaciones con modelos externos al proyecto (por ejemplo, Llama 3.2, Qwen o SmolLM2) en la informacion proporcionada; los unicos puntos de comparacion documentados son los propios checkpoints de la ladder 1PP.

## Limitaciones y advertencias

- Es un artefacto de investigacion (EPFL DLAB) y no un asistente de propósito general; no ha pasado por SFT ni por RLHF.
- Solo soporta ingles segun la model card.
- Contexto limitado a 4.096 tokens.
- Nunca vio un turno de sistema: el formato ChatML debe omitirlo; introducirlo puede degradar el comportamiento.
- Es un base model: las condiciones de conversacion producen texto con formato de chat, pero no estan alineadas para seguir instrucciones de forma fiable.
- Riesgo de alucinacion y de generar contenido sesgado o no verificado, propio de un modelo base entrenado sobre DCLM-edu sin filtrado posterior documentado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece garantias de calidad para produccion y su uso previsto es la investigacion.
- El checkpoint es un mid-training sobre el run raw hasta el paso 48.339; el flujo raw reconstruido contiene un documento menos que el empaquetado original en 60 pasos, lo que introduce una discrepancia menor respecto al flujo original.
- Descargas y likes registrados: 0 en el momento de la consulta; no hay evidencia de validacion por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed42-base
- Run raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Run 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed42-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
