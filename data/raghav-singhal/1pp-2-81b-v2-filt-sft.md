# Raghav-Singhal/1pp-2.81b-v2-filt-sft

## Resumen

1pp-2.81b-v2-filt-sft es un modelo de lenguaje de 2.810 millones de parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de la variante "filtered" del peldaño de 2,81B de la escalera de escalado de 1PP, sometida posteriormente a un ajuste supervisado (SFT) sobre un mix de 400.000 conversaciones. El modelo es un artefacto de investigacion orientado a estudiar el efecto del filtrado de datos por clasificador de seguridad durante el preentrenamiento, no un asistente de proposito general.

Arquitectonicamente es un decoder estilo Llama de 24 capas con hidden size 2.688, FFN de 10.752 con activacion SwiGLU, 21 cabezas de atencion y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 tokens) mas un token `<|pad|>` adicional.

Su relevancia es metodologica: la condicion "Filtered" reproduce uno de los baselines del paper SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales), manteniendo los documentos marcados por el clasificador en contexto pero sin computar perdida sobre ellos. Esto permite comparar de forma controlada el efecto del filtrado frente al modelo raw equivalente (`1pp-2.81b-v2-raw-base`), con el mismo orden de documentos, mismo numero de pasos y mismo schedule.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, atencion multi-cabeza con 21 cabezas de consulta y 7 de clave/valor, y FFN SwiGLU de 10.752 dimensiones. Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de sesgos. El tokenizador es el de SmolLM2 (49.152 tokens) mas `<|pad|>`; `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento se realizo sobre 53.709 pasos del stream alineado por pasos del modelo raw, lo que supone 112,64B posiciones de token, con batch global de 512 secuencias de 4.096 tokens y mascara de atencion entre documentos. El optimizador es Muon (matrix LR 0,005 con shape scaling) combinado con Adam para el resto de parametros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los ultimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y entrenamiento en bf16. La innovacion central de la condicion "Filtered" es que un clasificador de seguridad basado en gte, puntuado por chunk, marco 3.869.498 documentos (4,6%) con puntuacion maxima de al menos 3; esos documentos permanecen en las secuencias (en contexto) pero no reciben perdida, mientras que el resto se entrena igual que en el run raw. El empaquetado de datos es identico byte a byte al del run raw.

El SFT se ejecuto durante una epoca sobre un mix de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado a constitucion), `dlab-spp/sp-sft-normal-300k` sin duplicados de prompts del primer set (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se uso el mismo stack que en preentrenamiento (Megatron, Muon, sin turno de sistema, perdida solo en turnos del asistente), matrix LR 0,002, semilla 28, batch global 128 x 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La perdida de validacion del modelo base filtrado (por token, sobre 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos, checkpoint final) fue de 2,325 para texto de documento, 2,383 para texto de asistente y 2,452 para texto de usuario. La perdida de SFT en held-out (tokens de asistente, 1.998 conversaciones retenidas) es 1,838.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento basico y respuesta a instrucciones tras el SFT, con perdida computada unicamente sobre turnos del asistente.
- Conversaciones multiturno dentro de la ventana de 4.096 tokens.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de vision, audio ni modo "thinking" declarado.
- No es un asistente de proposito general: es un artefacto de investigacion comparativa.

## Casos de uso

- Estudio controlado del efecto del filtrado de datos: comparar este modelo con `1pp-2.81b-v2-raw-base` para aislar el impacto de eliminar la perdida sobre documentos marcados por el clasificador de seguridad, manteniendo el mismo orden de documentos y schedule.
- Reproduccion de baselines del paper SPP: el modelo sirve como referencia reproducible de la condicion "Filtered" en el peldaño de 2,81B de la escalera 1PP.
- Investigacion sobre clasificadores de seguridad en preentrenamiento: permite analizar como afecta a las capacidades finales mantener en contexto 3.869.498 documentos marcados (4,6%) sin entrenarlos.
- Experimentos de escalado de leyes (scaling laws): al formar parte de una escalera con semilla fija (seed 28) y receta comun, es util para ajustar curvas de perdida frente a tamano y datos.
- Evaluacion de recetas de SFT sobre modelos pequenos: su mix de 400k conversaciones y su perdida held-out de 1,838 permiten estudiar la transferencia de datos de instrucciones a modelos de 2,81B.
- Prototipado de pipelines de generacion de texto en ingles con `transformers` y TGI: el repo es compatible con text-generation-inference y endpoints, util para pruebas de integracion a baja escala.
- Analisis de sesgos y seguridad en corpus filtrados: comparar la tasa de respuestas problematicas entre la variante filtrada y la raw sobre prompts sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de validacion:

| Conjunto | Perdida |
|---|---|
| Texto de documento (modelo base, 2.433 docs held-out) | 2,325 |
| Texto de asistente (modelo base) | 2,383 |
| Texto de usuario (modelo base) | 2,452 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | 1,838 |

Verificacion de pesos HF frente al checkpoint Megatron: perdida 1,8382 en segmentos [3, 4] de sft_val, con diferencia absoluta 0,0000.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para secuencias cortas.
- En cuantizacion de 8 bits: alrededor de 3 GB de pesos; en 4 bits: alrededor de 1,5-2 GB (estimacion, no se publican GGUF oficiales).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090, RTX 3090, L40S o A10G suficientes para inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y previsiblemente en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados oficialmente para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-2.81b-v2-filt-sft | 2,81B | 4.096 | Apache 2.0 | Variante filtrada con SFT, semilla 28 |
| 1pp-2.81b-v2-raw-base | 2,81B (mismo seed) | 4.096 | Apache 2.0 | Baseline raw sin filtrado, misma receta |
| SmolLM2 (familia) | 135M / 360M / 1,7B | hasta 8.192 en algunas variantes | Apache 2.0 | Referencia de tokenizador; no disponible comparacion directa de rendimiento |
| Modelos Llama-style de ~3B | ~3B | variable | variable | No disponible comparacion de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo declarado explicitamente como artefacto de investigacion, no como asistente de proposito general; no debe desplegarse en produccion orientada a usuarios finales.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto de solo 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinacion inherente a un modelo de 2,81B con preentrenamiento limitado a 112,64B tokens; no se reportan evaluaciones de factualidad.
- Sesgos potenciales heredados del corpus DCLM-edu y de los datasets de SFT; el filtrado por clasificador gte no elimina sesgos, solo excluye la perdida sobre documentos marcados.
- El formato de chat no admite turno de sistema, lo que limita el control fino del comportamiento en produccion.
- No se publican datos de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no es posible validar su calidad relativa.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y su naturaleza experimental desaconsejan ese uso.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-filt-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
