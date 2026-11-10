# AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4

## Resumen

Gemma-4-E4B-it-Uncensored-NVFP4 es un modelo *drafter* (borrador) para decodificación especulativa de tipo EAGLE, diseñado para acelerar la inferencia del modelo objetivo Gemma 4 26B-A4B-it-uncensored de TrevorJS. Lo publica AEON-7, un autor independiente que distribuye artefactos optimizados para hardware Blackwell, en concreto para la NVIDIA DGX Spark (GB10, SM 12.1). No es un modelo de chat autónomo: su función es proponer tokens candidatos que el modelo objetivo verifica, reduciendo la latencia efectiva por token generado.

Arquitectónicamente es un transformer Gemma 4 de 42 capas (35 con atención de ventana deslizante de 512 tokens y 7 con atención completa), tamaño oculto 2560, 8 cabezas de atención con 2 cabezas KV y `head_dim` de 256 (512 en la dimensión global). El checkpoint contiene 7.941.798.218 parámetros en formato safetensors y ocupa 10,2 GB en el repositorio, cuantizado a NVFP4 mediante AWQ con NVIDIA ModelOpt 0.42.0. Soporta un contexto máximo de 131.072 tokens y un vocabulario de 262.144 entradas.

Su relevancia es operativa: la decodificación especulativa es una de las pocas técnicas que reduce latencia de generación sin degradar la calidad del modelo objetivo, y este artefacto empaqueta el drafter ya cuantizado para el formato nativo FP4 de Blackwell. El modelo deriva de una variante "uncensored" (refusals eliminados mediante *abliteration*), lo que condiciona su uso en producción y su encaje en políticas de contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 4 (drafter EAGLE), 42 capas: 35 sliding-window + 7 full-attention |
| Parámetros totales | 7.941.798.218 |
| Parámetros activos | no disponible (el drafter no es MoE; el modelo objetivo sí es MoE 26B-A4B) |
| Longitud de contexto | 131.072 tokens (ventana deslizante de 512 tokens en 35 capas) |
| Tipos de cuantización | NVFP4 AWQ (ModelOpt 0.42.0); KV cache en FP8 en el despliegue de referencia |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (quantization: nvfp4, model_type: gemma4) |

Otros datos técnicos: tamaño oculto 2560, 8 cabezas de atención (2 KV), `head_dim` 256, `global_head_dim` 512, vocabulario de 262.144 tokens, tamaño del checkpoint 9,6 GB (10,2 GB de repositorio).

## Arquitectura y entrenamiento

El modelo es un drafter EAGLE para Gemma 4, construido sobre una pila de 42 capas con un patrón híbrido de atención: 35 capas usan ventana deslizante de 512 tokens y 7 capas mantienen atención completa, lo que permite cubrir contexto largo (hasta 131.072 tokens) con coste cuadrático limitado en la mayoría de capas. La dimensión de cabeza es 256, con 512 en la cabeza global, y solo 2 cabezas KV frente a 8 cabezas de consulta, lo que reduce el tamaño de la caché KV.

El checkpoint se obtiene por cuantización post-entrenamiento del modelo base TrevorJS/gemma-4-26B-A4B-it-uncensored, aplicando NVFP4 con AWQ mediante NVIDIA ModelOpt 0.42.0. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica principal es el formato nativo FP4 (NVFP4) para GPUs Blackwell y su integración con decodificación especulativa EAGLE en vLLM 0.19.1, que requiere tres parches específicos (`eagle_patched.py`, `serving_chat_patched.py`, `modelopt_patched.py`) para funcionar con Gemma 4.

## Capacidades

- Decodificación especulativa EAGLE: propone hasta 5 tokens candidatos por paso (`num_speculative_tokens: 5`) que el modelo objetivo verifica en paralelo.
- Generación de texto como drafter: hereda la distribución del modelo base Gemma 4 26B-A4B-it-uncensored, sin refusals (variante *abliterated*).
- Soporte multimodal heredado del modelo base: el pipeline declarado es text-generation, pero los tags incluyen `image-text-to-text`, `vision` y `vision-language`.
- Razonamiento con modo *thinking*: los tags incluyen `reasoning` y `thinking`, y el despliegue de referencia activa `--reasoning-parser gemma4`.
- Tool calling y function calling: el despliegue de referencia activa `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Capacidades agénticas: tags `agentic` y `function-calling`, orientadas a flujos multi-paso.
- Contexto largo: hasta 131.072 tokens, con soporte de *chunked prefill* y *prefix caching* en vLLM.
- Multilingüe: limitado a inglés según la model card (`language: en`).

## Casos de uso

- Aceleración de inferencia en DGX Spark: desplegar el drafter junto al objetivo 26B MoE en NVFP4 para reducir la latencia por token en un entorno de memoria unificada, ajustando `--gpu-memory-utilization` a 0,6-0,7 para evitar *page thrashing*.
- Servicio de chat de baja latencia: usar decodificación especulativa con 5 tokens por paso para mejorar el tiempo hasta el primer token percibido en conversaciones multi-turno, apoyándose en *prefix caching* para reutilizar el contexto repetido.
- Asistentes de código en producción: el modelo base soporta tool calling y el despliegue expone una API compatible con OpenAI, lo que permite integrarlo en pipelines de CI/CD o en IDE plugins que invocan funciones.
- Agentes multi-paso con contexto largo: gracias a los 131.072 tokens y al *chunked prefill*, se pueden mantener trazas de herramientas y documentos extensos sin truncar.
- Procesamiento de documentos con visión: los tags `vision-language` e `image-text-to-text` permiten, a través del modelo base, tareas de extracción de información de imágenes y PDFs escaneados.
- Investigación sobre decodificación especulativa: sirve como artefacto reproducible para medir tasas de aceptación del drafter y comparar configuraciones (`num_speculative_tokens`, cuantización del KV cache) en Blackwell frente a generaciones anteriores.
- Despliegue en clústeres con GPUs Blackwell discretas: el formato NVFP4 y los kernels FlashInfer-CUTLASS permiten servir el par drafter+objetivo con mayor utilización de VRAM que en FP8/FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni tasas de aceptación del drafter.

## Requisitos de hardware

- VRAM estimada para el drafter: 9,6 GB de pesos en NVFP4; sumar buffers de verificación del modelo objetivo (no contabilizados por `--gpu-memory-utilization`).
- Modelo objetivo: 26B MoE en NVFP4, aproximadamente 14-16 GB de pesos; el conjunto drafter+objetivo requiere del orden de 30-40 GB contando caché KV en FP8 y buffers.
- GPUs recomendadas: NVIDIA DGX Spark (GB10, SM 12.1) es el objetivo declarado; cualquier GPU Blackwell (SM 12.x) con soporte de FP4 nativo. Los tags mencionan `sm_121a` y `grace-blackwell`.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 (Ada, SM 8.9) ni con GPUs sin FP4 nativo; el formato NVFP4 y los kernels FlashInfer-CUTLASS apuntan a Blackwell.
- Opciones de despliegue: vLLM 0.19.1 con tres parches (`eagle_patched.py`, `serving_chat_patched.py`, `modelopt_patched.py`); contenedor precompilado `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest`; API compatible con OpenAI (`--served-model-name`, `--host 0.0.0.0 --port 8000`).
- Variables de entorno relevantes: `VLLM_USE_FLASHINFER_MOE_FP4=1`, `VLLM_TEST_FORCE_FP8_MARLIN=1`, `VLLM_MARLIN_USE_ATOMIC_ADD=1`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `TORCH_MATMUL_PRECISION=high`.
- Latencia y throughput: no disponible. La ganancia depende de la tasa de aceptación del drafter, que no se publica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4 | Drafter EAGLE | 7,94 B | 131.072 | NVFP4 AWQ | gemma | Hugging Face, 2.648 descargas |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | Modelo objetivo MoE | 26 B (A4B) | no disponible | no disponible | gemma | Hugging Face |
| AEON-7/Gemma-4-26B-A4B-it-Uncensored-NVFP4 | Modelo objetivo cuantizado | 26 B (A4B) | no disponible | NVFP4 AWQ | gemma | Hugging Face |
| AEON-7/Gemma-4-31B-DECKARD-HERETIC-Uncensored-NVFP4 | Modelo relacionado (repo de parches) | 31 B | no disponible | NVFP4 | gemma | Hugging Face / GitHub |

La comparación directa con otros drafters EAGLE públicos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Gemma 4 26B MoE y los tres parches de vLLM 0.19.1; sin ellos no funciona la decodificación especulativa.
- Dependencia de hardware: NVFP4 y kernels FlashInfer-CUTLASS están orientados a Blackwell (SM 12.x); no se garantiza funcionamiento en Ada, Ampere o arquitecturas anteriores.
- Variante *uncensored*/*abliterated*: los refusals han sido eliminados, lo que aumenta el riesgo de generar contenido dañino, ilegal o sesgado; no es apto para aplicaciones orientadas al usuario final sin filtros adicionales.
- Riesgo de alucinación: heredado del modelo base; la decodificación especulativa no lo corrige y, en caso de baja tasa de aceptación, puede degradar el throughput en lugar de mejorarlo.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado.
- Licencia Gemma: sujeta a los Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribución; revisar antes de desplegar en producción.
- Memoria unificada en DGX Spark: por encima de `--gpu-memory-utilization` 0,8 el pool compartido CPU+GPU provoca *page thrashing*; los buffers de verificación del drafter no se contabilizan en esa fracción.
- Mantenimiento: depende de parches no oficiales sobre vLLM 0.19.1; las actualizaciones de vLLM pueden romper la compatibilidad.
- Fecha de creación (2026-04-13) y actualización (2026-11-10) según Hugging Face; verificar que los parches sigan siendo compatibles con la versión actual de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4
- Repositorio GitHub del autor: https://github.com/AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4
- Repositorio de parches DECKARD 31B: https://github.com/AEON-7/Gemma-4-31B-DECKARD-HERETIC-Uncensored-NVFP4
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Modelo objetivo cuantizado: https://huggingface.co/AEON-7/Gemma-4-26B-A4B-it-Uncensored-NVFP4
- Contenedor vLLM: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest
- Apoyo al autor: https://lotusmake.com/support?via=tea
