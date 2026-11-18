# AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4

## Resumen

Gemma-4-E4B-it-Uncensored-NVFP4 es un modelo borrador (drafter) especializado para decodificación especulativa EAGLE sobre Gemma 4 26B-A4B, publicado por el usuario AEON-7. No es un modelo de chat autónomo: su función es proponer tokens candidatos que el modelo objetivo (TrevorJS/gemma-4-26B-A4B-it-uncensored, un MoE de 26B con 4B activos) verifica en cada paso, acelerando la generación sin alterar la distribución de salida del modelo grande. Está cuantizado a NVFP4 mediante AWQ con NVIDIA ModelOpt 0.42.0 y empaquetado en safetensors para su uso con vLLM.

La arquitectura subyacente es Gemma 4 con 42 capas (35 de ventana deslizante de 512 tokens y 7 de atención completa), hidden size de 2560, 8 cabezas de atención (2 KV) con head_dim 256 y global_head_dim 512, y un vocabulario de 262.144 tokens. El contexto máximo declarado es de 131.072 tokens. El checkpoint ocupa 9,6 GB y contiene 7.941.798.218 parámetros según los safetensors, aunque el modelo está diseñado como borrador ligero, no como generador principal.

Su relevancia práctica es acotada pero clara: permite desplegar Gemma 4 26B-A4B con decodificación especulativa en hardware Blackwell, en particular en el NVIDIA DGX Spark (GB10, SM 12.1), donde el ancho de banda unificado hace que la latencia de decodificación sea el cuello de botella. El autor distribuye parches de vLLM 0.19.1 y una imagen de contenedor para reproducir el stack completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (E4B, borrador EAGLE para decodificación especulativa) |
| Parametros totales | 7.941.798.218 (según safetensors) |
| Parametros activos | no disponible (el modelo objetivo es un MoE de 26B con 4B activos; este borrador no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 AWQ (ModelOpt 0.42.0); KV cache en FP8; el modelo base sin cuantizar no se distribuye en este repo |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (4-bit NVFP4) |

Otros datos técnicos declarados por el autor: 42 capas (35 sliding-window + 7 full-attention), hidden size 2560, 8 cabezas de atención con 2 KV heads, head_dim 256, global_head_dim 512, ventana deslizante de 512 tokens, vocabulario de 262.144 tokens y tamaño del modelo de 9,6 GB.

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE (EAGLE for Blackwell, E4B) construido sobre la arquitectura Gemma 4 y derivado del checkpoint no censurado de TrevorJS. La estructura combina atención de ventana deslizante de 512 tokens en 35 de las 42 capas con atención completa en las 7 restantes, un patrón habitual en la familia Gemma para reducir coste de atención en contextos largos. El vocabulario de 262.144 tokens y el hidden size de 2560 son coherentes con un modelo auxiliar de tamaño contenido.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Sí se especifica el pipeline de cuantización: AWQ con NVIDIA ModelOpt 0.42.0 a formato NVFP4, orientado a kernels nativos FP4 de Blackwell (SM 12.1) y con soporte de KV cache en FP8. El autor indica que se requieren tres parches sobre vLLM 0.19.1 (módulos eagle, serving_chat y modelopt) para habilitar la decodificación especulativa con Gemma 4, y publica una imagen de contenedor (`ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest`) con el stack ya preparado.

## Capacidades

- Decodificación especulativa: propone hasta 5 tokens candidatos por paso (`num_speculative_tokens: 5`) que el modelo objetivo de 26B verifica, reduciendo la latencia de decodificación.
- Integración con vLLM: configuración `method: draft_model` con `quantization: modelopt`, compatible con chunked prefill, prefix caching y KV cache FP8.
- Soporte multimodal heredado del modelo base Gemma 4 (image-text-to-text, visión), aunque la información disponible no detalla el alcance exacto de las capacidades de visión en este checkpoint borrador.
- Tool calling y function calling: el stack de despliegue incluye `--enable-auto-tool-choice`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4`, por lo que el modelo objetivo sirve para flujos agénticos.
- Modo thinking/razonamiento: soportado a través del parser de razonamiento del servidor vLLM.
- Multilingüe: limitado a inglés según la model card.
- Sin censura: el checkpoint base es una variante "uncensored/abliterated" con los rechazos eliminados, lo que cambia el comportamiento del modelo objetivo en temas sensibles.

## Casos de uso

- Aceleración de inferencia en DGX Spark: desplegar el par objetivo + borrador en un GB10 con memoria unificada para reducir la latencia por token en cargas de chat interactivo, ajustando `--gpu-memory-utilization` a 0,6-0,7 para evitar page thrashing.
- Servicio de chat de baja latencia en producción: servir el modelo 26B con decodificación especulativa detrás de una API compatible con OpenAI, con prefix caching para conversaciones multi-turno y contexto de hasta 131.072 tokens.
- Asistentes de código en IDE: el modelo objetivo, acelerado por este borrador, puede completar y revisar código con tool calling para consultar repositorios o ejecutar tests en pipelines de CI/CD.
- Agentes multi-paso: usar el soporte de function calling y el parser de razonamiento para construir agentes que encadenen llamadas a herramientas con contexto largo, donde la velocidad de decodificación importa más que el throughput bruto.
- Procesamiento de documentos largos con visión: al heredar la capacidad image-text-to-text de Gemma 4, el par puede extraer y resumir información de documentos escaneados en flujos batch con contexto de 131k tokens.
- Investigación sobre decodificación especulativa: servir como caso de estudio reproducible de EAGLE con cuantización NVFP4 y kernels Blackwell, con parches y Dockerfile publicados para replicar experimentos de latencia y tasa de aceptación.
- Despliegue en clústeres Blackwell discretos: en GPUs con VRAM dedicada (no unificada) se puede subir `--gpu-memory-utilization` por encima de 0,65 para aprovechar mejor el hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de aceptación del borrador, speedup de decodificación ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 9,6 GB en NVFP4; el consumo real depende del modelo objetivo (26B MoE) y de los buffers de verificación de la decodificación especulativa, que el autor advierte que no se contabilizan en `--gpu-memory-utilization`.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM 12.1) es el objetivo principal; cualquier GPU Blackwell con soporte de kernels FP4 nativos y FlashInfer Cutlass.
- GPU de consumo: no hay confirmación de soporte en RTX 4090 (Ada, sin FP4 nativo); la cuantización NVFP4 y los kernels SM 12.1 apuntan a Blackwell, por lo que el despliegue en consumer GPU no está garantizado con esta configuración.
- Opciones de despliegue: vLLM 0.19.1 con tres parches (eagle, serving_chat, modelopt) e imagen de contenedor `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest`; no se menciona soporte para llama.cpp, Ollama ni TGI.
- Ajustes de memoria: en DGX Spark, `--gpu-memory-utilization` entre 0,6 y 0,7; `--max-num-seqs 4`; `--kv-cache-dtype fp8`; `--tensor-parallel-size 1`.
- Latencia y throughput: no disponibles; no se publican cifras de speedup ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4 | Borrador EAGLE para Gemma 4 26B-A4B | 7,94B | 131.072 | NVFP4 AWQ | gemma | Hugging Face, contenedor GHCR |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | Modelo objetivo MoE | 26B totales / 4B activos | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| AEON-7/Gemma-4-26B-A4B-it-Uncensored-NVFP4 | Modelo objetivo cuantizado | 26B totales / 4B activos | no disponible en esta ficha | NVFP4 AWQ | gemma | Hugging Face |
| AEON-7/Gemma-4-31B-DECKARD-HERETIC-Uncensored-NVFP4 | Familia de modelos del mismo autor | no disponible | no disponible | NVFP4 | no disponible | Hugging Face, GitHub |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo objetivo Gemma 4 26B-A4B cuantizado en NVFP4 y los parches de vLLM; no funciona como generador por sí solo.
- Dependencia de hardware: los kernels NVFP4 y SM 12.1 limitan el despliegue a GPUs Blackwell; en arquitecturas anteriores el rendimiento o la compatibilidad no están garantizados.
- Idioma: solo inglés declarado, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Contenido sin censura: el checkpoint base es "uncensored/abliterated" con rechazos eliminados; en producción requiere filtros y moderación externos, y conlleva riesgo de generar contenido dañino o inexacto.
- Alucinación: al ser un borrador que propone tokens verificados por el modelo objetivo, la calidad final depende del objetivo; no obstante, el modelo base no censurado puede producir afirmaciones falsas con mayor facilidad en temas sensibles.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; es necesario revisarlos antes de desplegar.
- Configuración frágil: en DGX Spark, valores de `--gpu-memory-utilization` superiores a 0,8 provocan page thrashing en la memoria unificada; los buffers de verificación del borrador no se contabilizan en esa fracción.
- Madurez: 5 likes y un ecosistema de parches mantenido por un único autor; conviene evaluar la estabilidad de los parches de vLLM antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4
- Repositorio GitHub del autor: https://github.com/AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Modelo objetivo cuantizado: https://huggingface.co/AEON-7/Gemma-4-26B-A4B-it-Uncensored-NVFP4
- Repositorio de parches vLLM (DECKARD 31B): https://github.com/AEON-7/Gemma-4-31B-DECKARD-HERETIC-Uncensored-NVFP4
- Imagen de contenedor: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest
- Apoyo al autor: https://lotusmake.com/support
