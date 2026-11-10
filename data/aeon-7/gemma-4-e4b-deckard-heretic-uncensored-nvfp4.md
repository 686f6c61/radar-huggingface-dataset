# AEON-7/Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4

## Resumen

Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4 es un modelo drafter de decodificación especulativa EAGLE (E4B) construido sobre la arquitectura Gemma 4 y publicado por el usuario AEON-7. No es un modelo de chat autónomo, sino un componente auxiliar que acelera la inferencia del modelo objetivo AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4 mediante decodificación especulativa de 5 tokens. Está cuantizado en NVFP4 AWQ con NVIDIA ModelOpt 0.42.0 y optimizado específicamente para GPUs Blackwell (SM 12.1), en particular la NVIDIA DGX Spark (GB10) con memoria unificada de 128 GB.

El modelo cuenta con 7.941.798.218 parámetros totales según los pesos en safetensors, 42 capas (35 de ventana deslizante y 7 de atención completa), un tamaño oculto de 2560, 8 cabezas de atención (2 cabezas KV) con head_dim de 256 y global_head_dim de 512, y una ventana deslizante de 512 tokens. Soporta un contexto máximo de 131.072 tokens y un vocabulario de 262.144 tokens. El repositorio ocupa 10,2 GB y el peso del modelo se declara en 9,6 GB.

Su relevancia actual radica en que permite desplegar el modelo objetivo de 31B con aceleración especulativa en hardware Blackwell de gama workstation, con throughput que escala linealmente con la concurrencia (de 7,6 tok/s agregados con 1 petición a 42,7 tok/s con 4). Es un artefacto de infraestructura más que un modelo de propósito general: su valor depende enteramente de emparejarse con el target correcto y de aplicar los parches de vLLM que el autor distribuye.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (drafter EAGLE E4B), transformer con 42 capas (35 sliding-window + 7 full-attention) |
| Parámetros totales | 7.941.798.218 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | NVFP4 AWQ (ModelOpt 0.42.0); KV cache en FP8 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (repo de 10,2 GB; modelo de 9,6 GB) |
| Tamaño oculto | 2560 |
| Cabezas de atención | 8 (2 KV heads), head_dim=256, global_head_dim=512 |
| Ventana deslizante | 512 tokens |
| Vocabulario | 262.144 tokens |
| Modelo objetivo | AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4 |
| Tokens especulativos | 5 |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

La arquitectura es un drafter EAGLE sobre Gemma 4, con 42 capas que combinan 35 capas de atención de ventana deslizante (512 tokens) y 7 capas de atención completa. El diseño de atención usa 8 cabezas con solo 2 cabezas KV, head_dim de 256 y global_head_dim de 512, lo que reduce el coste de memoria del KV cache. El modelo se distribuye cuantizado en NVFP4 AWQ mediante NVIDIA ModelOpt 0.42.0, un formato nativo de 4 bits pensado para las unidades tensor de las GPUs Blackwell.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo base declarado es DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking, del que este artefacto es una derivación cuantizada y especializada como drafter. La innovación técnica principal no está en el entrenamiento sino en el pipeline de despliegue: decodificación especulativa EAGLE con 5 tokens, chunked prefill, prefix caching, KV cache en FP8 y parches específicos sobre vLLM 0.19.1 (eagle_patched.py, serving_chat_patched.py y modelopt_patched.py) para habilitar la decodificación especulativa con Gemma 4.

## Capacidades

- Generación de texto como drafter especulativo: propone tokens que el modelo objetivo de 31B verifica, acelerando la decodificación sin alterar la distribución final del target.
- Decodificación especulativa EAGLE con 5 tokens especulativos por paso.
- Soporte de tool calling y function calling a través del parser `gemma4` en vLLM (`--enable-auto-tool-choice --tool-call-parser gemma4`).
- Modo de razonamiento (thinking) mediante el parser `gemma4` (`--reasoning-parser gemma4`), heredado del target.
- Capacidades multimodales y vision-language declaradas en las etiquetas del modelo (image-text-to-text, vision, multimodal), aunque el drafter en sí opera sobre el flujo del target.
- Conversación multi-turno y modo chat a través de la API compatible con OpenAI de vLLM.
- Soporte de contexto largo hasta 131.072 tokens con chunked prefill y prefix caching.
- Capacidad de generación de código y razonamiento (etiquetas coding y reasoning), condicionada al comportamiento del modelo objetivo.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Aceleración de inferencia del target de 31B en DGX Spark: el drafter se empareja con AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4 para reducir la latencia por token mediante decodificación especulativa EAGLE de 5 tokens, con throughput medido de 7,6 a 42,7 tok/s agregados según concurrencia.
- Servicio de chat compatible con OpenAI en producción: el stack vLLM con este drafter expone `/v1/chat/completions`, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente.
- Atención al cliente multi-turno con contexto largo: los 131.072 tokens de contexto y el prefix caching permiten mantener conversaciones extensas con reutilización de prefijos y menor coste de prefill.
- Pipelines agénticos con tool calling: el parser `gemma4` y `--enable-auto-tool-choice` habilitan flujos de agente que invocan funciones externas, con el drafter acelerando las respuestas del target.
- Asistentes de código en entornos de desarrollo: las etiquetas coding y reasoning, junto con la aceleración especulativa, permiten completar y razonar sobre código con latencia reducida en GPUs Blackwell.
- Despliegue en hardware ARM64/Blackwell (GB10, SM 12.1): el modelo está etiquetado para aarch64 y arm64, lo que lo hace adecuado para estaciones Grace-Blackwell y DGX Spark con memoria unificada.
- Evaluación de razonamiento con modo thinking: el `--reasoning-parser gemma4` permite separar cadenas de razonamiento de la respuesta final en aplicaciones de análisis.

## Benchmarks y rendimiento

Rendimiento medido en NVIDIA DGX Spark (GB10, SM 12.1, 128 GB de memoria unificada) con el target 31B DECKARD AWQ_FULL más este drafter E4B, 5 tokens especulativos y 300 tokens máximos por petición:

| Concurrencia | tok/s agregados | tok/s por petición | Latencia media (300 tokens) |
|---:|---:|---:|---:|
| 1 | 7,6 | 8,9 | 39,4 s |
| 2 | 21,7 | 10,8 | 27,7 s |
| 4 | 42,7 | 10,7 | 28,1 s |

El autor declara cero errores en todas las ejecuciones de prueba y un escalado lineal del throughput con la concurrencia. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible; al ser un drafter, su calidad se mide por la tasa de aceptación de tokens especulativos, dato que no se proporciona.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 9,6 GB en NVFP4, según el tamaño declarado del modelo; el repo completo ocupa 10,2 GB.
- El drafter no funciona de forma aislada: requiere el modelo objetivo de 31B, por lo que el consumo conjunto de memoria es muy superior al del drafter.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM 12.1) como plataforma de referencia; otras GPUs Blackwell con soporte NVFP4 y SM 12.1.
- Memoria unificada: en DGX Spark (128 GB) el autor recomienda `--gpu-memory-utilization` entre 0,6 y 0,7; por encima de ~0,8 el pool compartido CPU+GPU provoca page thrashing. Los buffers de verificación de EAGLE no se contabilizan en esa fracción, por lo que hay que dejar margen adicional (0,65 en el ejemplo).
- GPUs discretas con VRAM dedicada pueden usar fracciones más altas de memoria.
- Despliegue: vLLM 0.19.1 con tres parches obligatorios (eagle_patched.py, serving_chat_patched.py, modelopt_patched.py) e imagen Docker `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest`.
- Variables de entorno recomendadas: `VLLM_TEST_FORCE_FP8_MARLIN=1`, `VLLM_MARLIN_USE_ATOMIC_ADD=1`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `TORCH_MATMUL_PRECISION=high`, `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
- Configuración de servicio: `--quantization modelopt`, `--kv-cache-dtype fp8`, `--max-model-len 131072`, `--max-num-seqs 4`, `--enable-chunked-prefill`, `--enable-prefix-caching`.
- Latencia y throughput: ver tabla de benchmarks; 39,4 s para 300 tokens con concurrencia 1 y 28,1 s con concurrencia 4.
- No se documenta soporte para llama.cpp, Ollama ni TGI; el formato NVFP4 y los parches de vLLM limitan el despliegue al stack descrito.

## Comparativa con modelos similares

No se dispone de información sobre drafters EAGLE alternativos comparables en la documentación proporcionada. La comparación más directa es con el propio modelo objetivo sin decodificación especulativa, pero no se aportan cifras de throughput del target sin drafter.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Función |
|---|---|---|---|---|---|
| Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4 | 7,94 B | 131.072 | NVFP4 AWQ | gemma | Drafter EAGLE |
| AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4 | no disponible | no disponible | NVFP4 AWQ | gemma | Modelo objetivo |
| DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking | no disponible | no disponible | no disponible | gemma | Modelo base del target |

## Limitaciones y advertencias

- No es un modelo autónomo: solo tiene sentido como drafter del target AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4; usarlo con otro target o de forma independiente no está soportado.
- Requiere parches manuales de vLLM 0.19.1; sin ellos la decodificación especulativa con Gemma 4 no funciona.
- Dependencia de hardware muy específica: NVFP4, SM 12.1 y arquitecturas Blackwell (GB10, aarch64/arm64); no hay soporte documentado para GPUs anteriores ni para CPU.
- Idiomas: solo inglés declarado, lo que limita su uso en castellano u otros idiomas.
- Modelo "uncensored" y "abliterated": se ha eliminado el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación heredado del target; el drafter no corrige la veracidad, solo acelera la generación.
- Licencia Gemma: sujeta a los términos de uso de Gemma de Google, con posibles restricciones para uso comercial; conviene revisar las condiciones antes de desplegar.
- En DGX Spark, configurar `--gpu-memory-utilization` por encima de ~0,8 provoca page thrashing en la memoria unificada.
- Los buffers de verificación de EAGLE no se contabilizan en la fracción de memoria de vLLM, lo que puede provocar OOM si no se deja margen.
- Sin datos publicados de tasa de aceptación de tokens especulativos ni de calidad, por lo que el beneficio real de aceleración depende del dominio y del prompt.
- El modelo base es una variante de terceros (DavidAU) sobre Gemma 4, no una versión oficial de Google.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Gemma-4-E4B-DECKARD-HERETIC-Uncensored-NVFP4
- Modelo objetivo: https://huggingface.co/AEON-7/Gemma-4-31B-it-DECKARD-HERETIC-Uncensored-NVFP4
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Repositorio GitHub con parches: https://github.com/AEON-7/Gemma-4-31B-DECKARD-HERETIC-Uncensored-NVFP4
- Imagen Docker: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest
- Apoyo al autor: https://lotusmake.com/support?via=tea
