# kurcontko/Index-Translate-9B-NVFP4

## Resumen

Index-Translate-9B-NVFP4 es una cuantización NVFP4 (W4A4) del modelo de traducción IndexTeam/Index-Translate-9B, publicada por el usuario kurcontko. El objetivo es reducir el peso del checkpoint oficial FP4 (11,7 GB) hasta que quepa holgadamente en una GPU de 12 GB con vLLM, cuantizando también las proyecciones Gated DeltaNet (GDN) que el checkpoint oficial mantiene en BF16. Con servicio solo de texto, el modelo carga en 7,6 GB, dejando espacio para la caché KV.

El modelo base pertenece a la familia Index-Translate, construida sobre la arquitectura qwen3_5 (transformer híbrido con capas Gated DeltaNet y atención completa) y orientada a traducción multilingüe texto e imagen. La cuantización conserva `lm_head`, embeddings, las proyecciones de puerta GDN `in_proj_a/b` de 32 dimensiones, la torre de visión y la cabeza MTP en BF16, y pasa a NVFP4 todas las capas lineales del modelo de lenguaje (MLP, atención completa y las proyecciones GDN `in_proj_qkv`, `in_proj_z` y `out_proj`).

La relevancia de esta ficha es práctica: demuestra que una cuantización agresiva a 4 bits puede mantener la calidad de traducción (84,59 COMET-22 frente a 84,68 del FP8 oficial en los 9 pares evaluados) a cambio de una penalización importante de throughput en batching, derivada del estado fijo por secuencia de las capas GDN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido qwen3_5 con capas Gated DeltaNet (GDN) y atención completa; incluye torre de visión y cabeza MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuración de ejemplo usa `--max-model-len 4096`) |
| Tipos de cuantizacion | NVFP4 (W4A4) en capas lineales del LM; BF16 en `lm_head`, embeddings, `in_proj_a/b`, torre de visión y cabeza MTP |
| Idiomas soportados | 150 según la model card del modelo base; evaluados 9 pares (EN→CS, DE, ES, FR, IT, NL, PL, PT y PL→EN) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 8-bit, librería vLLM |
| Tamano del repo | 9,4 GB |
| Huella en inferencia (solo texto) | 7,6 GB |
| Precisión de calibración | 576 pares OPUS-100, llm-compressor 0.15 |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia qwen3_5 que combina capas de atención completa con capas Gated DeltaNet, un mecanismo de estado lineal recurrente que mantiene un estado de tamaño fijo por secuencia. Esta decisión arquitectónica reduce el coste de contexto largo pero impone una restricción de memoria por secuencia en el servidor de inferencia. El modelo incluye además una torre de visión (pipeline image-text-to-text en el modelo base) y una cabeza MTP para decodificación especulativa, aunque esta cuantización no ha probado ninguna de las dos.

El proceso de cuantización lo realiza llm-compressor 0.15 con recetas y scripts incluidos en el directorio `quantization/` del repositorio. La calibración usa 576 pares de OPUS-100 en las direcciones EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN, renderizados con el prompt de Index-Translate seguido de la traducción de referencia. Todas las capas lineales del modelo de lenguaje pasan a NVFP4; vLLM fusiona `in_proj_qkv` e `in_proj_z` en un único GEMM con una sola escala global, por lo que ambas comparten escala NVFP4. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Traducción de texto multilingüe en 150 idiomas según el modelo base; evaluada en 9 direcciones concretas.
- Preservación de estructura en celdas tipo Excel: 97,0 % de tokens protegidos conservados y 95,4 % de celdas íntegras con el prompt oficial.
- Protección de placeholders (`{placeholder}`), especificadores de formato (`%s`, `%1$s`), variables (`{{var}}`, `${var}`), etiquetas HTML, URLs, correos, SKUs, código en línea y saltos de línea.
- Modo thinking configurable mediante `chat_template_kwargs` (`enable_thinking`), que debe desactivarse para traducción.
- Servicio compatible con la API OpenAI a través de vLLM.
- Capacidad de visión y decodificación especulativa MTP presentes en el modelo base pero no probadas en este checkpoint.

## Casos de uso

- Traducción de documentación técnica en localizaciones con placeholders: el modelo conserva el 97,0 % de tokens protegidos, lo que permite traducir plantillas con variables sin romper el renderizado posterior.
- Localización de hojas de cálculo y ficheros tabulares: el 95,4 % de celdas íntegras en la prueba de estructura lo hace adecuado para pipelines que procesan celdas de Excel o CSV con formato embebido.
- Servicio de traducción en GPU de 12 GB: con una huella de 7,6 GB en modo texto cabe en portátiles y estaciones con GPUs de consumo de gama alta con arquitectura Blackwell, dejando margen para caché KV.
- Traducción de correos transaccionales y notificaciones: la preservación de URLs, correos y SKUs evita la corrupción de datos operativos en mensajes automatizados.
- Traducción de contenido editorial multilingüe (noticias, redes sociales, discurso, texto literario): el conjunto de evaluación WMT24++ cubre exactamente esos géneros.
- Traducción de idiomas no cubiertos por alternativas más rápidas como Hy-MT2-7B: cuando se necesita un par lingüístico ausente en otros modelos, este checkpoint mantiene la cobertura de 150 idiomas del modelo base.
- Integración en pipelines con prompt fijo: si no se puede modificar la plantilla de prompt y se requiere preservar estructura, este modelo mantiene la calidad con el prompt oficial de Index-Translate.

## Benchmarks y rendimiento

Evaluación sobre todos los segmentos no canary de WMT24++ (`google/wmt24pp`), 960 segmentos por dirección y 8.640 en total. Métricas: COMET-22 con `Unbabel/wmt22-comet-da` (escala ×100) y chrF de corpus con sacrebleu. Decodificación greedy en vLLM 0.26.0 sobre una RTX 5070 Ti de 16 GB con presupuesto de 11,5 GB (`gpu_memory_utilization` ≈ 0,74).

| Modelo | EN→CS | EN→DE | EN→ES | EN→FR | EN→IT | EN→NL | EN→PL | EN→PT | PL→EN | Media | chrF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Index-Translate-9B-FP8 (16 GB) | 86,78 | 83,88 | 84,70 | 83,22 | 85,83 | 85,65 | 86,08 | 83,52 | 82,49 | 84,68 | 60,4 |
| Index-Translate-9B-NVFP4 (11,5 GB) | 86,58 | 83,80 | 84,79 | 83,14 | 85,59 | 85,65 | 85,84 | 83,47 | 82,48 | 84,59 | 60,1 |

Prueba de estructura: 175 celdas tipo Excel en PL, DE, FR, ES y CS, con 270 tokens que deben sobrevivir literalmente. Con el prompt oficial se conserva el 97,0 % de tokens protegidos y el 95,4 % de celdas quedan completamente íntegras.

Throughput: en una prueba de 4.000 celdas con `--max-num-seqs 48`, el modelo traduce 39,3 celdas cortas por segundo. Hy-MT2-7B-NVFP4 alcanza 213,4 celdas/s en la misma prueba, unas 5 veces más rápido. El límite lo impone el estado fijo por secuencia de las capas GDN: bajo un presupuesto de 11,5 GB vLLM encaja unas 48 secuencias concurrentes.

## Requisitos de hardware

- VRAM estimada: 7,6 GB en modo solo texto; el repositorio ocupa 9,4 GB en disco.
- GPU obligatoria con soporte NVFP4: arquitectura Blackwell (por ejemplo, RTX 5070 Ti, RTX 5090, B200). No funciona en GPUs Ampere o Ada para NVFP4 nativo.
- Cabe en GPU de consumo Blackwell de 12 GB o más, con margen para caché KV bajo un presupuesto de 11,5 GB.
- Despliegue con vLLM 0.26.0 o superior; comando de referencia: `vllm serve kurcontko/Index-Translate-9B-NVFP4 --language-model-only --max-model-len 4096 --gpu-memory-utilization 0.9 --max-num-seqs 32`.
- Si vLLM avisa de que `max_num_seqs` excede los bloques de caché Mamba disponibles, reducir `--max-num-seqs`.
- Si falla el JIT de los kernels de muestreo de FlashInfer con `CUDA compiler and CUDA toolkit headers are incompatible`, definir `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Throughput medido: 39,3 celdas cortas/s con 48 secuencias concurrentes; latencia individual no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad traducción (COMET-22, 9 pares) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kurcontko/Index-Translate-9B-NVFP4 | 9,65 B | no disponible | 84,59 | Apache-2.0 | Hugging Face, vLLM |
| IndexTeam/Index-Translate-9B-FP8 | 9,65 B (aprox.) | no disponible | 84,68 | Apache-2.0 | Hugging Face, vLLM |
| IndexTeam/Index-Translate-9B-FP4 | 9,65 B (aprox.) | no disponible | no disponible (checkpoint oficial, 11,7 GB) | Apache-2.0 | Hugging Face |
| kurcontko/Hy-MT2-7B-NVFP4 | 7 B (aprox.) | no disponible | no disponible | no disponible | Hugging Face, vLLM; 213,4 celdas/s en la misma prueba |

La comparación directa con el FP8 oficial muestra una pérdida de 0,09 puntos COMET-22 a cambio de reducir la huella de 11,7 GB a 7,6 GB. Frente a Hy-MT2-7B-NVFP4, este modelo es aproximadamente 5 veces más lento en batching pero cubre idiomas que Hy-MT2 no soporta y preserva estructura con prompt fijo.

## Limitaciones y advertencias

- Evaluación limitada a 9 direcciones de traducción con COMET-22 y chrF; no hay evaluación humana.
- La traducción de imágenes y la decodificación especulativa MTP no se han probado con este checkpoint.
- El throughput en batching está limitado por el estado fijo por secuencia de las capas GDN: unas 48 secuencias concurrentes bajo 11,5 GB, con 39,3 celdas/s frente a 213,4 celdas/s de Hy-MT2-7B-NVFP4.
- Requiere GPU Blackwell para NVFP4; no es desplegable en GPUs Ampere o Ada con aceleración nativa.
- Riesgo de alucinación y sesgos no cuantificados en la documentación disponible; no se han publicado análisis al respecto.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base IndexTeam/Index-Translate-9B y de los datos de calibración OPUS-100.
- El uso requiere `enable_thinking: false`; con thinking activo el comportamiento no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurcontko/Index-Translate-9B-NVFP4
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Checkpoint oficial FP4: https://huggingface.co/IndexTeam/Index-Translate-9B-FP4
- Colección Index-Translate: https://huggingface.co/collections/IndexTeam/index-translate
- Repositorio de inferencia con plantilla de prompt: https://github.com/bilibili/Index-Translate/blob/main/inference/llm/translate.py
- Modelo comparable Hy-MT2-7B-NVFP4: https://huggingface.co/kurcontko/Hy-MT2-7B-NVFP4
- Dataset de evaluación WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Métrica COMET-22: https://huggingface.co/Unbabel/wmt22-comet-da
