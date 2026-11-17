# Raghav-Singhal/1pp-1.66b-v2-spp-sft

## Resumen

1pp-1.66b-v2-spp-sft es un modelo de lenguaje de 1.661 millones de parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un artefacto de investigacion, no de un asistente de proposito general, disenado para estudiar como la insercion de reflexiones en primera persona dentro de los documentos de preentrenamiento afecta al comportamiento del modelo. Concretamente, esta es la variante SPP{T0} (baseline de la ladder de escalado 1PP) tras un ajuste supervisado (SFT).

El modelo emplea una arquitectura transformer decoder de estilo Llama con 24 capas, hidden size de 2.048, FFN de 8.192 con SwiGLU, 16 cabezas de atencion y 4 cabezas KV (head dim 128), normalizacion RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El vocabulario parte del tokenizer de SmolLM2 (49.152 tokens) al que se anaden dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

La relevancia del modelo es metodologica: permite comparar de forma controlada el efecto de la condicion SPP{T0} frente al modelo raw (`1pp-1.7b-raw-base`) sobre el mismo corpus y el mismo orden de documentos. El preentrenamiento consumio 31.777 pasos sobre 66,64B posiciones de token con un batch global de 512 x 4.096 y enmascaramiento de atencion entre documentos. La licencia es Apache 2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.052.928 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimension oculta de 2.048 y FFN de 8.192 con activacion SwiGLU. Usa 16 cabezas de atencion con 4 cabezas KV (GQA, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ninguna bias ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizer es el de SmolLM2 (49.152 tokens) ampliado con `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento se realizo sobre el flujo de pasos alineado del modelo raw durante 31.777 pasos (66,64B posiciones de token), con batch global de 512 x 4.096 y enmascaramiento de atencion entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0.005) con Adam para el resto de parametros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 2.000 pasos, fase constante y decaimiento lineal en los ultimos 3.177 pasos hasta 1/100, weight decay 0.1, init std 0.0089 y bf16. La innovacion central de la condicion SPP{T0} es que 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, 3.869.498 documentos, el 4,6%, mas un numero igual de documentos no marcados aleatorios) llevan una reflexion en primera persona escrita por el modelo de reflexion SPP{T0}, insertada en una posicion elegida por ese modelo: el marcador `<assistant>`, la reflexion (maximo 256 tokens) y el resto del documento. El modelo se entrena sobre los tokens de la reflexion pero no sobre el marcador, y el texto posterior a una reflexion no puede atenderla (mascara de atencion de SPP). El SFT consistio en una epoca sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin prompts duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se uso el mismo stack (Megatron, Muon, ChatML sin turno de sistema, perdida solo en turnos de asistente), LR matricial 0.002, semilla 28, batch global 128 x 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. Los datos de SFT nunca contienen `<assistant>`.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Escritura de reflexiones en primera persona: al anadir `<assistant>` tras el texto de un documento, el modelo genera una reflexion (sin token de fin de reflexion).
- Razonamiento multi-turno: el SFT incluye 98,5k conversaciones multiturno del dataset model-raising.
- Comportamiento alineado con seguridad: parte del SFT proviene de `sp-sft-safety-180k`.
- Seguimiento de instrucciones conversacionales basicas derivado del SFT.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre preentrenamiento con reflexiones: el modelo sirve como condicion SPP{T0} de referencia para comparar con el modelo raw y otras condiciones de la ladder 1PP sobre el mismo corpus y orden de documentos.
- Analisis de atribucion y mascaras de atencion: permite estudiar como la mascara de SPP (el texto posterior a una reflexion no la atiende) afecta a la perdida y a las representaciones en un modelo de 1,66B.
- Generacion de reflexiones sinteticas: insertando `<assistant>` tras un documento se obtienen reflexiones en primera persona de hasta 256 tokens utiles para aumentar corpus o analizar estilos de anotacion.
- Experimentos controlados de SFT: al compartir receta de SFT con el modelo raw y la ladder 1PP, sirve para aislar el efecto de los datos de preentrenamiento en el rendimiento conversacional.
- Evaluacion de perdida en dominios educativos: el corpus base son documentos DCLM-edu, por lo que es adecuado para medir perplejidad sobre texto educativo en ingles.
- Prototipado de bajo coste en investigacion: con 1,66B parametros y contexto de 4.096 tokens, se puede desplegar en una sola GPU para iterar sobre hipotesis antes de escalar.
- Reproducibilidad de artefactos: los pesos HF estan verificados contra el checkpoint de Megatron (diferencia absoluta de perdida 0.0000 en `sft_val` segmentos [3, 4]).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta perdidas de validacion.

| Metrica | Valor |
|---|---|
| Perdida de validacion del base, texto de documento | 2.395 |
| Perdida de validacion del base, texto de asistente | 2.472 |
| Perdida de validacion del base, texto de usuario | 2.531 |
| Perdida SFT en held-out (tokens de asistente, 1.998 conversaciones) | 1.924 |
| Verificacion HF vs Megatron (`sft_val` [3, 4]) | 1.9240 vs 1.9240 (diff. abs. 0.0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para contexto corto.
- En cuantizacion de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 en contextos moderados (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para inferencia, solo para entrenamiento o alto throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requeririan conversion a GGUF o configuracion especifica no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-spp-sft | 1,66B | 4.096 | Apache 2.0 | Condicion SPP{T0} con SFT; artefacto de investigacion |
| 1pp-1.7b-raw-base | ~1,7B | 4.096 | no disponible en la informacion | Modelo raw de referencia de la ladder 1PP, mismo corpus y orden |
| SmolLM2 (familia) | 135M / 360M / 1,7B | hasta 8.192 en algunas variantes | Apache 2.0 | Referencia de la comunidad; comparte tokenizer con este modelo |

La comparacion con modelos de proposito general de tamano similar (Qwen2.5-1.5B, Llama-3.2-1B, Gemma-2-2B) no esta respaldada por datos de benchmarks en la informacion disponible; el autor no publica evaluaciones comparativas.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no es un asistente de proposito general.
- Solo ingles; no hay soporte multilingue declarado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion no evaluado; no se publican benchmarks de factualidad.
- Sesgos: el corpus DCLM-edu y el clasificador de seguridad basado en gte pueden introducir sesgos no caracterizados en la model card.
- Discrepancia de atencion en inferencia: la atencion causal estandar de Hugging Face permite que el texto posterior a una reflexion la atienda, algo que nunca ocurrio en entrenamiento; esto puede degradar el comportamiento si se insertan reflexiones en produccion.
- Sin token de fin de reflexion: el modelo no marca donde termina una reflexion, lo que complica el parseo automatico.
- Formato de chat sin turno de sistema: no admite instrucciones de sistema, lo que limita el control del comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de robustez y seguridad hace desaconsejable su uso en produccion sin validacion adicional.
- Datos de SFT con posible contaminacion o solapamiento no verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-spp-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
