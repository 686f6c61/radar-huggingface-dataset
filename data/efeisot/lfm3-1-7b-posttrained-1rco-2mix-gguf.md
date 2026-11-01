# efeisot/lfm3-1.7b-posttrained-1rco-2mix-gguf

## Resumen

Este repositorio, publicado por el usuario efeisot, no es un modelo nuevo, sino una colección de tres cuantizaciones GGUF del modelo **LFM3-1.7B** de LiquidAI, concretamente del checkpoint post-entrenado (instruct). El objetivo del proyecto es ofrecer variantes optimizadas en tamaño para despliegues con recursos muy limitados, incluyendo una variante experimental que rompe la barrera de 1 GiB mediante un formato de cuantización propio llamado RCO4, que requiere un parche sobre llama.cpp.

El modelo base, LiquidAI/LFM3-1.7B, es un modelo de generación de texto de 1.728,8 millones de parámetros de la familia LFM (Liquid Foundation Models), que emplea arquitecturas híbridas con capas convolucionales cortas (shortconv) según se deduce de la documentación del repositorio. Las tres variantes ofrecidas son: `kmix-1100M` (equilibrada, ~1,08 GiB), `kmix-1300M` (calidad, ~1,28 GiB) y `rcmix-1000M` (sub-1-GiB, ~0,98 GiB, experimental). Todas se han evaluado contra los logits f16 del mismo checkpoint midiendo perplejidad y divergencia KL sobre Wikitext-2.

Su relevancia actual radica en el auge de modelos compactos para ejecución local en CPUs, portátiles y SoCs de bajo consumo, donde cada décima de GiB importa. La técnica de asignación por capas con matrices de importancia (imatrix) y el formato RCO4 (reconstrucción tipo GPTQ con codebooks optimizados por MSE) representan un trabajo de cuantización avanzado más allá de los cuants estándar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Models), híbrida con capas shortconv; no disponible el detalle completo |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (las mediciones de calidad se hicieron a 512 tokens) |
| Tipos de cuantizacion | K-quant mix (Q3_K/Q4_K/Q5_K/Q6_K) en kmix; RCO4 + Q5_K + Q6_K (emb) + Q8_0 (attn_gate) + F32 (shortconv) en rcmix |
| Idiomas soportados | No disponible (el modelo base es de LiquidAI; incluye documentación técnica en turco) |
| Licencia | LFM Open License (lfm1.0), heredada del modelo base |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B pertenece a la familia LFM de LiquidAI, caracterizada por arquitecturas no puramente transformer que incorporan componentes convolucionales (se menciona explícitamente el tensor `shortconv` conservado en F32 durante la cuantización). Este repositorio no modifica los pesos del modelo: parte del checkpoint post-entrenado (instruct) ya publicado por LiquidAI y aplica sobre él técnicas de cuantización por asignación de presupuesto de tamaño.

La técnica **kmix** utiliza un script de asignación (`alloc_mixed_kquants.py`) que distribuye tipos K-quant (Q3_K/Q4_K/Q5_K/Q6_K) tensor a tensor bajo un presupuesto de tamaño, minimizando el error de reconstrucción ponderado por la matriz de importancia (imatrix) calculada sobre Wikitext-2. La técnica **rcmix** es más ambiciosa: construye una base de datos de Hessians estilo GPTQ por capa, reconstruye codebooks optimizados por MSE y un asignador con presupuesto elige entre RCO4 y Q5_K por tensor, con paredes fijas (embeddings en Q6_K, attn_gate en Q8_0, shortconv en F32). No hay datos sobre el número de tokens de preentrenamiento, composición del dataset ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational, plantilla de chat embebida en los GGUF)
- Generación y completado de código (el ejemplo de uso del README es completar `def merge_sort(arr):`)
- Instrucción seguimiento (checkpoint post-entrenado / instruct)
- Compatibilidad con system prompts mediante `--jinja` en llama.cpp
- Ejecución eficiente en CPU y GPU vía llama.cpp, incluida aceleración HIP/ROCm
- No hay información sobre tool calling, agentes, capacidades de visión o audio

## Casos de uso

- **Asistentes locales en dispositivos de muy bajos recursos**: la variante rcmix-1000M cabe en menos de 1 GiB, adecuada para SBCs, móviles antiguos o entornos donde el Q4_K_M estándar (1,024 GiB) no cabe.
- **Completado de código offline en editores**: el modelo responde a prompts de código (ejemplo de merge sort en el README); su tamaño reducido permite mantenerlo residente en memoria junto al editor.
- **Chatbots embebidos en aplicaciones de escritorio**: con plantilla de chat embebida y valores de muestreo recomendados (temperature 0.1, top_k 50, repetition_penalty 1.1), puede integrarse vía `llama-server` sin dependencias pesadas.
- **Despliegues en GPUs AMD con ROCm**: el runtime parcheado se ha compilado y validado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1200`, útil en entornos sin CUDA.
- **Investigación en cuantización**: el repositorio incluye imatrix, hojas de asignación por tensor, logs de evaluación crudos y el parche de llama.cpp, ideal como referencia reproducible para estudios de cuantización mixta.
- **Procesamiento de texto por lotes en servidores pequeños**: con ~1,3 GiB por modelo, se pueden cargar varias instancias en una GPU modesta o en RAM de un VPS pequeño.

## Benchmarks y rendimiento

Datos publicados por el autor (Wikitext-2 test, contexto 512, 16 chunks, KL contra logits f16 del mismo checkpoint, medidos con `llama-perplexity --kl-divergence-base`):

| Modelo | GiB | bpw | PPL | KLD | top1 | Runtime |
|---|---|---|---|---|---|---|
| Stock Q4_K_M (baseline) | 1,024 | 5,09 | 23,823 | 0,118 | 83,6 % | stock |
| kmix-1100M (balanced) | 1,082 | 5,38 | 23,346 | 0,058 | 87,9 % | stock |
| kmix-1300M (quality) | 1,277 | 6,35 | 23,302 | 0,019 | 92,9 % | stock |
| rcmix-1000M (sub-1-GiB) | 0,983 | 4,89 | 27,659 | 0,196 | 79,5 % | parche requerido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para el modelo base ni para estas cuantizaciones en la información disponible. Las mediciones de rendimiento hardware son específicas del equipo del autor (RX 9060 XT / gfx1200, ROCm 7.x).

## Requisitos de hardware

- **VRAM/RAM estimada**: entre 0,98 GiB (rcmix-1000M) y 1,28 GiB (kmix-1300M) solo de pesos; añadir margen para KV cache y runtime (prácticamente cualquier equipo moderno, incluidos portátiles y SBCs con 4-8 GB de RAM).
- **GPUs recomendadas**: cualquier GPU moderna; el autor validó sobre AMD RX 9060 XT (gfx1200) con ROCm 7.x. No hay datos de validación en CUDA.
- **Consumer GPUs**: cabe con holgura en cualquier GPU de consumo actual (desde una RTX 3050 o similar hacia arriba); también es plenamente viable en CPU pura dado el tamaño.
- **Despliegue**: llama.cpp (`llama-cli`, `llama-server`). Los archivos kmix funcionan con cualquier llama.cpp reciente; rcmix-1000M exige compilar llama.cpp con el parche incluido (`llama.cpp-rco-types.patch`, contra el commit `1b4554e`). El kernel RCO está validado en CPU y HIP/ROCm; builds CUDA sin probar. No se mencionan Ollama, vLLM o TGI (los GGUF con tipos custom no son compatibles con runtimes estándar).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| efeisot/lfm3-1.7b-posttrained-1rco-2mix-gguf | 1,73 B (cuantizado a ~1,0-1,3 GiB) | No disponible | GGUF (K-mix, RCO4) | lfm1.0 | Cuantizaciones mixtas experimentales, requiere llama.cpp |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | No disponible | Safetensors | lfm1.0 | Checkpoint original sin cuantizar |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32k+ | Safetensors/GGUF | Qwen (Apache 2.0 variantes) | Alternativa compacta estándar, ecosistema GGUF nativo |
| Llama-3.2-1B-Instruct | 1,24 B | 128k | Safetensors/GGUF | Llama 3.2 Community | Alternativa compacta con contexto largo |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks comunes publicados.

## Limitaciones y advertencias

- **rcmix-1000M requiere un llama.cpp parcheado**: un build estándar rechaza el tipo de tensor desconocido 45 (RCO4). No es apto para usuarios que quieran descargarse el GGUF y ejecutarlo directamente.
- **El kernel RCO solo está validado en CPU y HIP/ROCm**; los builds CUDA no han sido probados, lo que limita su uso en el ecosistema NVIDIA.
- **Degradación de calidad en la variante sub-1-GiB**: rcmix-1000M sacrifica precisión global (PPL 27,659 y KLD 0,196 frente a 23,3/0,019 del kmix-1300M) a cambio de tamaño. Preferir los kmix si la calidad importa.
- **Benchmarks hardware-específicos**: las mediciones provienen de una configuración concreta (RX 9060 XT, ROCm 7.x) y pueden no generalizar.
- **Restricciones de licencia**: el modelo base está bajo LFM Open License (lfm1.0) de LiquidAI, no una licencia estándar tipo Apache/MIT; es responsabilidad del usuario revisar las condiciones de uso comercial en el enlace de la licencia.
- **Datos del modelo base incompletos**: no hay información sobre idiomas soportados, longitud de contexto ni benchmarks estándar del checkpoint instruct, lo que dificulta evaluar su idoneidad para tareas en castellano.
- **Riesgo de alucinación**: al ser un modelo de 1,7 B, el riesgo de generar contenido incorrecto es inherente y elevado en tareas de conocimiento factual; no hay datos de alucinación publicados.
- **Posible duplicidad de releases**: el autor indica que un release anterior (`lfm3-1.7b-rco-gguf`) contiene tensores idénticos con una asignación kmix más antigua; conviene usar esta versión.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/efeisot/lfm3-1.7b-posttrained-1rco-2mix-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base (lfm1.0): https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de uso del release: https://huggingface.co/efeisot/lfm3-1.7b-posttrained-1rco-2mix-gguf/blob/main/docs/USAGE.md
- Detalles de cuantización: https://huggingface.co/efeisot/lfm3-1.7b-posttrained-1rco-2mix-gguf/blob/main/docs/QUANTIZATION.md
- Notas de la versión: https://huggingface.co/efeisot/lfm3-1.7b-posttrained-1rco-2mix-gguf/blob/main/docs/RELEASE_NOTES.md
