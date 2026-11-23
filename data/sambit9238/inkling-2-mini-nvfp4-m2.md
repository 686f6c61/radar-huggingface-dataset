# sambit9238/Inkling-2-Mini-NVFP4-M2

## Resumen

Inkling-2-Mini NVFP4-M2 es una cuantización adicional del checkpoint oficial thinkingmachines/Inkling-2-Mini, publicada por el usuario sambit9238. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) multimodal con pipeline image-text-to-text y arquitectura de capas recurrentes (inkling2_loop), del que se han cuantizado a NVFP4 los pesos que el checkpoint oficial mantenía en BF16 o MXFP8. El objetivo declarado es acelerar la decodificación en batch-1 sobre NVIDIA DGX Spark (GB10, sm_121), plataforma donde el rendimiento está limitado por el ancho de banda de memoria.

La modificación concreta afecta a tres bloques: los expertos de las capas 20 a 23 (de MXFP8 a NVFP4), la atención de las 20 capas locales con ventana deslizante (de BF16 a NVFP4 weight-only W4A16) y el lm_head (también a W4A16). El resto de pesos —expertos nativos NVFP4 de las capas 0 a 19, atención global de las capas 5/11/17/23, embeddings, normas, visión y cabeza MTP/DSpark— se mantienen byte a byte idénticos al original.

El resultado es un checkpoint de 16,8 GB (frente a 20,2 GB del oficial) que alcanza 55,5 tok/s en decodificación batch-1 frente a 34,2 tok/s del original, con un coste de calidad concentrado en MMLU-Pro (6,3 puntos de caída). Es relevante para quienes despliegan el modelo en hardware Blackwell de gama baja y necesitan minimizar latencia por token, asumiendo una pequeña pérdida en razonamiento de conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (inkling2_loop); capas 6-17 repetidas tres veces; atención local con ventana deslizante en 20 capas y atención global en las capas 5/11/17/23 |
| Parametros totales | 26.388.647.472 (26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado en el ejemplo de servicio con `--max-model-len 131072`) |
| Tipos de cuantizacion | NVFP4 nativo (expertos capas 0-19), NVFP4 (expertos capas 20-23), NVFP4 weight-only W4A16 (atención local y lm_head), BF16 (atención global, embeddings, normas, visión, MTP/DSpark) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,8 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una innovación estructural relevante: las capas 6 a 17 se ejecutan tres veces (loop), lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. La atención se reparte entre 20 capas locales con ventana deslizante y 4 capas globales (5, 11, 17 y 23). El checkpoint oficial ya venía parcialmente cuantizado: los expertos enrutados de las capas 0 a 19 están en NVFP4 nativo con el convenio de ModelOpt (`W = e2m1 · e4m3(block_scale) · amax/(6·448)`, bloques de 16 elementos), mientras que el resto de componentes permanecían en BF16 o MXFP8.

Esta versión M2 no reentrena ni hace fine-tuning: aplica directamente la matemática de `NVFP4QTensor` de ModelOpt sobre los tensores oficiales, sin maestro en BF16 (los pesos desquantizados oficiales son la referencia). Los expertos de las capas 20 a 23 se desquantizan desde MXFP8 y se recuantizan al layout NVFP4 nativo, con escalas obtenidas por búsqueda MSE por bloque en el rango 0,70-1,0× del amax del bloque (error relativo aproximado del 8,9 % frente a MXFP8). La atención local y el lm_head pasan a W4A16. La verificación del formato nativo confirma que recuantizar los expertos de las capas 0 a 19 reproduce exactamente los tensores originales, con error de desquantización cero y escalas idénticas. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de modo de razonamiento (`--reasoning-parser inkling`) y esfuerzo de razonamiento configurable (los evals usan `low`).
- Razonamiento matemático: 0,960 de precisión flexible en GSM8K-CoT sobre 300 preguntas.
- Seguimiento de instrucciones: 0,900 prompt-level estricto en IFEval sobre 300 prompts.
- Tool calling / function calling con parser dedicado (`--tool-call-parser inkling`, `--enable-auto-tool-choice`) y precisión de argumentos exactos de 0,695 a temperatura 0.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión conservada en BF16.
- Recuperación en contexto largo: 5/5 en needle-in-a-haystack tanto a 32k como a 120k tokens.
- Decodificación especulativa MTP/DSpark disponible en el checkpoint (cabeza conservada en BF16), aunque desaconsejada en esta build por su bajo ratio de aceptación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de baja latencia en DGX Spark: con 17,2 ms por token de salida en batch-1 y 55,5 tok/s, es adecuado para interfaces interactivas donde la latencia percibida importa más que el throughput agregado, siempre que el despliegue sea en GB10.
- Automatización de atención al cliente multi-turno: la ventana de 131k tokens permite mantener historiales largos de conversación y documentación de producto en contexto, con recuperación verificada a 120k tokens.
- Agentes con tool calling en producción: el parser `inkling` y la precisión de argumentos exactos de 0,695 (T=0) lo hacen viable para pipelines de invocación de funciones, aunque conviene validar el esquema de herramientas propio.
- Procesamiento de documentos con imagen: al conservar la torre de visión en BF16 y el pipeline image-text-to-text, puede extraer y razonar sobre capturas, formularios escaneados o gráficos combinados con texto.
- Servicio de inferencia en un único dispositivo: con 17,7 GiB de pesos más memoria no-torch y `--gpu-memory-utilization 0.80`, cabe en una DGX Spark sin necesidad de tensor parallelism (`--tensor-parallel-size 1`).
- Razonamiento matemático asistido: útil en entornos educativos o de verificación de cálculos donde GSM8K-CoT al 0,960 flexible es suficiente y no se requiere conocimiento enciclopédico profundo.
- Despliegue con concurrencia moderada: 135 tok/s con 8 peticiones concurrentes y 251 tok/s con 32, adecuado para equipos pequeños o entornos de desarrollo compartidos.

## Benchmarks y rendimiento

Rendimiento en DGX Spark, misma imagen fijada, `--max-num-seqs 32`, contexto de 131k, 16 prompts de chat realistas con muestreo por defecto (T=1,0):

| Metrica | Oficial, MTP off | Oficial, MTP on | M2, MTP off | M2, MTP on |
|---|---|---|---|---|
| Decodificacion batch-1 (tok/s) | 34,2 | 38,9 | 55,5 | 47,7 |
| Tiempo por token de salida (ms) | 26,0 | 22,2 | 17,2 | 20,3 |
| Throughput, 8 concurrentes (tok/s) | 107 | 121 | 135 | 127 |
| Throughput, 32 concurrentes (tok/s) | 218 | 244 | 251 | 252 |
| Prefill 2k / 32k (tok/s) | 3057 / 2992 | no disponible | 3186 / 3043 | 3215 / 3061 |
| Pesos + memoria no-torch (GiB) | 20,9 | no disponible | 17,7 | no disponible |

Calidad, ambos servidos con MTP off, esfuerzo de razonamiento `low` y `max_gen_toks` 32768:

| Eval | Oficial | M2 |
|---|---|---|
| GSM8K-CoT, 300 preguntas (flexible / estricto) | 0,960 / 0,763 | 0,960 / 0,773 |
| IFEval, 300 prompts (estricto / laxo a nivel de prompt) | 0,900 / 0,897 | 0,873 / 0,893 |
| MMLU-Pro, 25 por materia (350 preguntas) | 0,637 | 0,574 (±0,025) |
| Tool calling, argumentos exactos (T=0 / T=0,7) | 0,667 / 0,657 | 0,695 / 0,686 |
| Needle in a haystack, 32k / 120k tokens | 5/5, 5/5 | 5/5, 5/5 |

Descomposición del error (KL forzado por profesor frente al oficial, 258k posiciones de transcripciones de chat, logprobs de vLLM a concurrencia 1):

| Variante | KL medio, chat | KL p99 | Acuerdo top-1 | Cambio de perplejidad | KL medio, wikitext |
|---|---|---|---|---|---|
| Solo lm_head W4A16 | 0,0076 | 0,13 | 97,5 % | +0,34 % | 0,0059 |
| Solo expertos capas 20-23 NVFP4 | 0,0148 | 0,27 | 96,8 % | −0,02 % | 0,0064 |
| Solo atención local W4A16 | 0,0699 | 1,24 | 92,8 % | +1,57 % | 0,0269 |
| M2 (las tres) | 0,0819 | 1,46 | 91,9 % | +0,61 % | 0,0349 |

Rendimiento de kernels: FP4 Marlin alcanza en GB10 aproximadamente el 85-90 % del ancho de banda de memoria del GEMV en BF16 con M=1. Por paso de decodificación, el tiempo de GEMM de atención local baja de ~9,1 ms a ~3,1 ms y el del lm_head de ~3,9 ms a ~1,2 ms.

## Requisitos de hardware

- VRAM estimada: 17,7 GiB de pesos más memoria no-torch, con `--gpu-memory-utilization 0.80` sobre DGX Spark; el checkpoint ocupa 16,8 GB en disco.
- GPU objetivo: NVIDIA DGX Spark (GB10, sm_121). El autor indica que el rendimiento está calibrado para esta plataforma y su ancho de banda de memoria.
- GPU consumer: no hay datos publicados sobre RTX 4090 u otras GPU consumer; el soporte de FP4 Marlin depende de la arquitectura Blackwell, por lo que no se garantiza en Ada Lovelace.
- Despliegue: vLLM con la imagen parcheada incluida en `vllm/` (overlay sobre `vllm/vllm-openai:inkling-2-mini`). Las imágenes estándar no pueden cargar la atención W4A16 de esta arquitectura. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 17,2 ms por token de salida en batch-1; 55,5 tok/s batch-1; 135 tok/s con 8 concurrentes; 251 tok/s con 32 concurrentes; prefill de 3186 tok/s a 2k y 3043 tok/s a 32k.
- Tensor parallelism: el ejemplo usa `--tensor-parallel-size 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion batch-1 (DGX Spark) | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini NVFP4-M2 (este) | 26,4 B | 131k | 55,5 tok/s | 0,574 | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (oficial) | 26,4 B | 131k | 34,2 tok/s (MTP off) | 0,637 | Apache 2.0 (segun el repo derivado) | Hugging Face |
| Otras alternativas de ~26 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el checkpoint oficial del que deriva, ya que no se dispone de datos de benchmarks de otros modelos de tamaño y categoría similares en la información proporcionada.

## Limitaciones y advertencias

- MMLU-Pro cae 6,3 puntos (de 0,637 a 0,574), con intervalo de ±0,025; el autor atribuye aproximadamente el 85 % de la divergencia a la cuantización W4A16 de la atención en capas locales.
- IFEval estricto baja de 0,900 a 0,873; el resto de métricas de instrucciones se mantiene dentro del ruido.
- El ratio de aceptación del borrador especulativo MTP es de aproximadamente el 19 % a temperatura 1,0; con MTP activado el rendimiento baja a 47,7 tok/s frente a 55,5 sin él, por lo que el autor recomienda desactivarlo en esta build.
- Requiere una imagen de vLLM parcheada incluida en el repositorio; las imágenes estándar no cargan la atención W4A16 de esta arquitectura. Esto añade deuda de mantenimiento en producción.
- El rendimiento está medido exclusivamente en DGX Spark (GB10, sm_121); no hay datos de latencia o throughput en otras GPU.
- No se han publicado datos sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la información disponible.
- No se dispone de información sobre los datos de entrenamiento del modelo base, lo que limita la evaluación de riesgos de contaminación de benchmarks y sesgos de dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es una build reciente (creada y actualizada el 23 de noviembre de 2026) sin validación comunitaria independiente.
- Licencia Apache 2.0, que permite uso comercial, pero al ser un derivado cuantizado conviene verificar las condiciones del checkpoint base thinkingmachines/Inkling-2-Mini.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sambit9238/Inkling-2-Mini-NVFP4-M2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- NVIDIA TensorRT Model Optimizer (ModelOpt): https://github.com/NVIDIA/TensorRT-Model-Optimizer
