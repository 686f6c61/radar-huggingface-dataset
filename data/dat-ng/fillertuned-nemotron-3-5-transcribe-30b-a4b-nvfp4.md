# Dat-Ng/Fillertuned-Nemotron-3.5-Transcribe-30B-A4B-NVFP4

## Resumen

Fillertuned-Nemotron-3.5-Transcribe-30B-A4B-NVFP4 es una exportación cuantizada en NVFP4 de un ajuste fino (fine-tune) del modelo NVIDIA Nemotron-3.5-Transcribe-30B-A4B, publicado por el usuario Dat-Ng en Hugging Face. El modelo base es un sistema de reconocimiento automático del habla (ASR) de NVIDIA que combina un front end de audio Transcribe con un decodificador mixto de expertos (MoE) de tipo A4B, es decir, con aproximadamente 4.000 millones de parámetros activos por token sobre un total nominal de 30.000 millones. El checkpoint real en safetensors declara 18.710.697.253 parámetros.

La relevancia de esta ficha radica en que se trata de una exportación de precisión mixta realizada con NVIDIA ModelOpt, pensada para servir el modelo en vLLM con soporte de audio y decodificación especulativa DFlash2. La model card documenta con detalle el perfil de servicio medido, el reparto de precisiones (NVFP4 en el decodificador, FP8 en el encoder de audio y la cabeza MTP, BF16 en la cabeza CTC) y, de forma notable, un análisis de determinismo que identifica el kernel de expertos como fuente de variación entre peticiones idénticas.

No se dispone de información sobre el conjunto de datos del fine-tune, los idiomas soportados ni resultados de benchmarks en la información proporcionada. La licencia es OpenMDW-1.1, la misma que la del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador MoE A4B (mezcla de expertos) con atención Mamba2 y front end de audio Transcribe; exportación NVFP4 con ModelOpt |
| Parametros totales | 18.710.697.253 (dato real de safetensors); el nombre comercial indica 30B nominales |
| Parametros activos | A4B (aproximadamente 4.000 millones activos por token, segun la nomenclatura del modelo base) |
| Longitud de contexto | 65.536 tokens configurados en el perfil de servicio (`--max-model-len 65536`) |
| Tipos de cuantizacion | NVFP4 (decodificador), FP8 (proyecciones Mamba in/out, encoder de audio, cabeza MTP, caché KV), BF16 (cabeza CTC) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (dos shards del decodificador, `perception.safetensors`, `model-ctc-bf16.safetensors`, `model-mtp-fp8.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR que combina un front end de audio (encoder de percepción) con un decodificador de lenguaje de tipo mezcla de expertos. La nomenclatura A4B indica que el decodificador activa aproximadamente 4.000 millones de parámetros por token sobre un total nominal de 30.000 millones. La arquitectura incorpora capas Mamba2 junto con atención, y el perfil de servicio de vLLM emplea `--use-replayssm --mamba-backend flashinfer`, lo que confirma la presencia de estado recurrente SSM en el decodificador. Además del decodificador, el checkpoint incluye una cabeza MTP (multi-token prediction) en FP8 y una cabeza CTC en BF16 para alineamiento temporal.

La exportación cuantizada sigue el esquema de precisión mixta de NVIDIA ModelOpt: pesos del decodificador en NVFP4, proyecciones Mamba in/out en FP8, encoder de audio y cabeza MTP en FP8, cabeza CTC en BF16 y caché KV en FP8. La model card no documenta el número de tokens de entrenamiento, la composición del dataset del fine-tune ni si hubo RLHF o DPO. El fine-tune se realizó sobre `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` y la plantilla de chat es idéntica byte a byte a la del checkpoint upstream. Se documenta el uso de decodificación especulativa DFlash2 con 7 tokens especulativos como draft y un parche en tiempo de compilación a la ruta del draft de DFlash2 en vLLM para acotar los ids de token ancla en la tabla predecesora.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante el front end Transcribe y el decodificador MoE.
- Procesamiento de audio de larga duración: el perfil de servicio admite clips de hasta 180 MB y una duración máxima de decodificación de audio de 3.600 segundos (`VLLM_MAX_AUDIO_DECODE_DURATION_S=3600`).
- Manejo de múltiples entradas de audio por prompt: `--limit-mm-per-prompt '{"audio":{"count":6,"length":120000000}}'`.
- Alineamiento temporal mediante cabeza CTC (desactivado en el perfil con DFlash2 porque este no soporta marcas de tiempo por palabra).
- Decodificación especulativa con DFlash2 (7 tokens especulativos) para acelerar la generación.
- Razonamiento y generación de texto en el decodificador, con parser de razonamiento `nemotron_v3` configurado en el servicio.
- Procesador de logits personalizado (`ScriptMaskLogitsProcessor`) para enmascarar guiones en la salida.
- Soporte de tool calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio de hasta una hora por clip (3.600 s) y generar la transcripción completa, lo que lo hace adecuado para reuniones largas sin segmentación manual.
- Subtitulado y postproducción de vídeo: la cabeza CTC permite alineamiento temporal, aunque en el perfil con DFlash2 debe desactivarse; para marcas de tiempo por palabra conviene servir sin decodificación especulativa.
- Atención al cliente con voz: integrado en un pipeline de ASR en tiempo real, el modelo transcribe las llamadas para su análisis posterior o para alimentar un agente conversacional.
- Análisis de llamadas de contact center a escala: con `--max-num-seqs 16` y caché KV en FP8, el despliegue en una sola GPU permite procesar lotes moderados de audio de forma continua con chunked prefill.
- Generación de actas y resúmenes a partir de audio: el decodificador puede producir texto estructurado a partir de la transcripción, con el procesador de logits enmascarando secciones de guion.
- Investigación en ASR multilingüe y evaluación de robustez: al ser un fine-tune sobre el modelo de NVIDIA, sirve como punto de partida para experimentos de adaptación a dominios específicos.
- Despliegue en producción con vLLM: el perfil documentado (memoria de GPU al 30 %, caché KV de 2 GiB, backend de expertos CUTLASS) ofrece una configuración reproducible para servir el modelo en una única GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de determinismo: sobre un conjunto de 80 clips difíciles con seis pasadas idénticas, el uso de `--moe-backend cutlass` eliminó la variación (1.522 de 1.522 peticiones repetidas idénticas), mientras que otras configuraciones dejaron entre 37 y 45 clips cambiando.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 21,6 GB en disco; con `--gpu-memory-utilization 0.30` y `--kv-cache-memory-bytes 2147483648` (2 GiB de caché KV), el perfil medido cabe en una GPU con margen. No se especifica la GPU exacta del perfil.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño y el uso de NVFP4, se requiere hardware con soporte de FP4 (arquitecturas Blackwell o superiores); no se confirma compatibilidad con generaciones anteriores.
- GPU de consumo: no disponible. El uso de NVFP4 y de kernels CUTLASS/FlashInfer sugiere que no es desplegable en GPUs de consumo convencionales sin verificación previa.
- Opciones de despliegue: vLLM con el plugin `nemo_speechlm` (`VLLM_PLUGINS=nemo_speechlm`), backend Mamba FlashInfer, backend de expertos CUTLASS y decodificación especulativa DFlash2. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El perfil fija `--max-num-seqs 16` (un valor superior abortó el arranque del motor) y `--max-num-batched-tokens 4096`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fillertuned-Nemotron-3.5-Transcribe-30B-A4B-NVFP4 | 18.710.697.253 reales (30B nominales, A4B) | 65.536 tokens | OpenMDW-1.1 | Hugging Face (Dat-Ng) |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 30B nominales (A4B) | no disponible | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2 | no disponible | no disponible | no disponible | Hugging Face (NVIDIA), revision 4172ee5b |

No se dispone de datos de benchmarks ni de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- El fine-tune no documenta su dataset, por lo que se desconocen sesgos introducidos y dominios de especialización.
- Riesgo de alucinación inherente al decodificador de lenguaje; no se han publicado evaluaciones de fidelidad de transcripción.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- La licencia OpenMDW-1.1 debe revisarse para uso comercial; es la misma del modelo base de NVIDIA, pero conviene verificar las condiciones de redistribución de derivados.
- El determinismo depende del kernel de expertos: con el kernel NVFP4 de FlashInfer seleccionado automáticamente se observó variación de 1 a 4 nats en los logprobs entre peticiones idénticas; solo `--moe-backend cutlass` la elimina.
- `VLLM_BATCH_INVARIANT=1` no es utilizable porque vLLM rechaza el arranque con MAMBA2_ATTN.
- La decodificación DFlash2 exige el V2 model runner (`unset VLLM_USE_V2_MODEL_RUNNER`) y no soporta marcas de tiempo por palabra, por lo que el alineamiento CTC debe desactivarse.
- El procesador de logits `ScriptMaskLogitsProcessor` debe resolverse en el `PYTHONPATH` del motor; sin él, el despliegue debe omitir también su entrada en `--logits-processors`.
- El perfil medido limita `--max-num-seqs` a 16; valores superiores abortan el arranque por falta de bloques de caché Mamba.
- La exportación depende de un parche en tiempo de compilación a vLLM para la ruta del draft DFlash2, lo que añade fragilidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dat-Ng/Fillertuned-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Checkpoint draft DFlash2: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2 (revision 4172ee5b7bfe55f59e784922878c1bd9bdfeb6ba)
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- NeMo Speech (commit 906f17e9df74207ad7c075f7437ac146931fb8c6): no disponible como URL en la información proporcionada
