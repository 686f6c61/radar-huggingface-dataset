# axteam/MiniCPM-o-4_5-FP8-dynamic

## Resumen

MiniCPM-o-4_5-FP8-dynamic es una cuantización de 8 bits en formato FP8 del modelo multimodal openbmb/MiniCPM-o-4_5, publicada por el usuario axteam. El modelo base es un transformer "omni" (visión + audio + TTS) desarrollado por OpenBMB, con 9.371.787.666 parámetros totales según los safetensors del repositorio. Esta versión cuantizada está pensada específicamente para servir el modelo con vLLM mediante un esquema W8A8 con activaciones dinámicas por token.

La relevancia de esta ficha radica en que reduce el peso en disco de aproximadamente 24,3 GB (repo completo) a unos 11,8 GB de pesos, manteniendo el rendimiento del original BF16 en los benchmarks medidos (recuperación media del 100,0 %). Es una opción práctica para desplegar un modelo any-to-any de casi 9,4 mil millones de parámetros en GPUs de una sola tarjeta con suficiente VRAM, sin recalibración ni reentrenamiento.

La cuantización es data-free (sin calibración) y conserva en BF16 los módulos sensibles: codificador de visión, codificador de audio (Whisper), proyector de audio, módulos TTS, embeddings, LM head y todas las RMSNorm. Solo las proyecciones de atención y MLP del modelo de lenguaje se cuantizan a FP8 E4M3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni multimodal (visión + audio + TTS), basado en MiniCPM-o-4_5 |
| Parametros totales | 9.371.787.666 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 32.768 tokens en el ejemplo de despliegue (`--max-model-len 32768`); la longitud máxima nativa del modelo base no se detalla |
| Tipos de cuantizacion | FP8 dinámico W8A8: pesos FP8 E4M3 por canal, activaciones FP8 dinámicas por token; esquema `FP8_DYNAMIC` de compressed-tensors |
| Idiomas soportados | no disponible en la model card; los benchmarks incluyen KMMLU (coreano) y HAE-RAE (coreano), lo que sugiere cobertura multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`), más ONNX y código propio; compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base MiniCPM-o-4_5 es un transformer multimodal de tipo "omni" que integra un codificador de visión, un codificador de audio basado en Whisper, un proyector de audio, módulos de text-to-speech (TTS) y un modelo de lenguaje principal. Esta versión FP8 mantiene intactos en BF16 el codificador de visión, el codificador de audio, el proyector de audio (`audio_projection_layer`), los módulos TTS, los embeddings de tokens, el LM head (`llm.lm_head`) y todas las RMSNorm, que representan aproximadamente el 26 % de los parámetros de esta build. Solo las proyecciones de atención y MLP del modelo de lenguaje se convierten a FP8.

La cuantización es post-entrenamiento y sin calibración (data-free), por lo que no se ha realizado ningún reentrenamiento ni ajuste fino. El tokenizador y la `chat_template` son idénticos a los del original. La revisión del 2026-11-01 corrigió la primera subida (revisión `8efe6eb`), que también cuantizaba el LM head y el proyector de audio a FP8 y no cargaba en vLLM 0.32; la build actual los conserva en BF16 y fue verificada con vLLM 0.32.0 para entrada de texto (2026-11-01) e imagen (2026-11-02). No se detallan en la información disponible el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activado por defecto en la chat template (desactivable con `enable_thinking: false`).
- Procesamiento de imagen: entrada de imagen por URL o data URI, con descripción y comprensión visual.
- Procesamiento de audio: codificador Whisper y proyector de audio para entrada de audio (no verificado en esta build según la model card).
- Síntesis de voz (TTS) mediante módulos dedicados conservados en BF16.
- Pipeline any-to-any: combinación de texto, imagen, audio y voz en un mismo modelo.
- Capacidades multilingües: los benchmarks incluyen coreano (KMMLU, HAE-RAE) además de inglés; el conjunto completo de idiomas no está documentado.
- Compatibilidad con servidor OpenAI-compatible vía vLLM (`vllm serve`), incluyendo `llm.chat` offline.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Asistente multimodal conversacional: el modelo puede gestionar conversaciones multi-turno con texto, imagen y audio, con una ventana de hasta 32.768 tokens en el despliegue de ejemplo, adecuada para sesiones largas con historial extenso.
- Descripción y análisis de imágenes en producción: con el codificador de visión intacto en BF16 y verificado en vLLM 0.32.0, puede integrarse en pipelines de moderación de contenido, accesibilidad o catalogación automática de imágenes.
- Transcripción y comprensión de audio: el codificador Whisper y el proyector de audio permiten construir servicios de resumen de reuniones o análisis de llamadas, aunque la entrada de audio no se ha verificado en esta build concreta.
- Generación de voz (TTS): los módulos TTS conservados en BF16 permiten sintetizar respuestas habladas en asistentes de voz o sistemas de lectura automática.
- Servicio de inferencia con API compatible OpenAI: mediante `vllm serve` se puede exponer el modelo como endpoint `/v1/chat/completions` para integrarlo en aplicaciones existentes sin cambios de cliente.
- Evaluación de modelos multilingües: los resultados en KMMLU y HAE-RAE permiten usar esta build como referencia para tareas en coreano e inglés dentro de pipelines de evaluación con lm-evaluation-harness.
- Despliegue en GPUs de una sola tarjeta: con 11,8 GB de pesos, cabe en GPUs consumer de gama alta y en tarjetas de datacenter, reduciendo el coste frente al modelo BF16 original.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin chat template (0 o 5-shot según fila). MMLU es la variante generativa (`mmlu_generative`), no directamente comparable con MMLU por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | Recuperación |
|---|---|---|---|
| MMLU (5-shot, generativo) | 74,06 | 74,06 | 100,0 % |
| GSM8K (5-shot, estricto) | 81,73 | 82,49 | 100,9 % |
| ARC-Challenge (0-shot) | 56,74 | 56,83 | 100,2 % |
| Winogrande (5-shot) | 76,80 | 75,14 | 97,8 % |
| KMMLU (5-shot, directo) | 30,25 | 30,57 | 101,1 % |
| HAE-RAE (0-shot) | 22,18 | 22,82 | 102,9 % |
| Media | 56,96 | 56,98 | 100,0 % |

## Requisitos de hardware

- VRAM estimada: 11,8 GB solo para pesos; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75, por ejemplo T4) o superior. El cálculo FP8 nativo requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automáticamente a FP8 weight-only. V100 (sm70) no está soportado. Solo se ha probado en B200 según la model card.
- Cabe en GPU consumer: sí, en tarjetas con al menos ~16 GB de VRAM efectiva para pesos más caché y overhead; no se especifican modelos concretos.
- Despliegue: vLLM 0.32.0 (probado), con Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). Requiere `trust_remote_code`. Para servir solo texto: `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.
- Sin vLLM: no hay configuración verificada de Transformers, porque el código upstream fija `transformers==4.51.0`, que no puede leer checkpoints de compressed-tensors (requiere ≥4.56).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MiniCPM-o-4_5-FP8-dynamic (este) | 9,37 B | hasta 32.768 en ejemplo | Apache-2.0 | safetensors compressed-tensors, vLLM | Cuantizado W8A8 FP8, ~11,8 GB de pesos |
| openbmb/MiniCPM-o-4_5 (BF16) | 9,37 B | no disponible | Apache-2.0 | safetensors, transformers/vLLM | Modelo base sin cuantizar; mayor peso en disco |
| Otros modelos omni de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización FP8 puede degradar ligeramente tareas no cubiertas por los benchmarks; en Winogrande la recuperación baja al 97,8 %.
- El modo "thinking" está activado por defecto en la chat template; hay que desactivarlo explícitamente para respuestas directas.
- La entrada de audio no se ha verificado en esta build con vLLM 0.32.0 (solo texto e imagen).
- Solo se ha probado en GPU B200; el comportamiento en Turing, Ampere, Ada y Hopper se deduce del código de selección de kernels de vLLM 0.32, no de pruebas directas.
- Requiere `trust_remote_code` y una combinación muy específica de versiones (vLLM 0.32.0, torch 2.13, transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0); actualizar compressed-tensors por separado puede romper la carga.
- No hay configuración verificada con Transformers puro; el uso queda prácticamente limitado a vLLM.
- Si se descargó la revisión anterior al 2026-11-01 10:43:00 UTC (`8efe6eb`), hay que volver a descargar el repositorio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los componentes de terceros (Whisper, etc.).
- El rendimiento en coreano es bajo en términos absolutos (KMMLU 30,57; HAE-RAE 22,82), lo que limita su uso en producción para esos idiomas.
- No se documentan los idiomas soportados ni el conjunto completo de datos de entrenamiento del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/MiniCPM-o-4_5-FP8-dynamic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
