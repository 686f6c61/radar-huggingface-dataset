# existentialbirds/Inkling-2-Mini-4bit

## Resumen

Inkling-2-Mini-4bit es una cuantización de precisión mixta, nativa para `mlx-vlm`, del modelo `thinkingmachines/Inkling-2-Mini` de Thinking Machines. Se trata de un modelo de lenguaje y visión (VLM) con arquitectura Mixture-of-Experts (MoE) de capas en bucle ("looped-layer"), con 26.388.641.280 parámetros totales y aproximadamente 3.4B parámetros activos por pasada. Las 12 capas centrales se ejecutan tres veces, lo que da 48 aplicaciones de capa y unos 5.4B de parámetros activos efectivos por token. Está pensado para generación de texto e imagen-a-texto conversacional.

La relevancia de este checkpoint concreto es de infraestructura: no es un modelo nuevo, sino una conversión optimizada para Apple Silicon publicada por `existentialbirds` dentro de su laboratorio de inferencia Peregrine. Preserva sin tocar los expertos enrutados originales en `nvfp4` (capas 0-19) y `mxfp8` (capas coda 20-23), de modo que los kernels Metal personalizados de `mlx-vlm` siguen activos sin pérdida por doble cuantización. Las capas densas de atención, embeddings y `lm_head` se cuantizan a 4 bits afines con `group_size=64`.

El resultado es un checkpoint de 17.3 GB (16.08 GiB, 5.24 bits/peso de media) que reduce la lectura de pesos en decodificación de 6.30 GB/token a 3.03 GB/token. Incluye además un drafter especulativo DSpark de 4 bits (247 MiB) como modelo complementario. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle ("looped-layer") y torre de visión; VLM |
| Parametros totales | 26.388.641.280 (26.4B) |
| Parametros activos | ~3.4B por pasada; ~5.4B efectivos por token (12 capas centrales con 3 pasadas, 48 aplicaciones de capa) |
| Longitud de contexto | No disponible de forma explícita; la model card menciona escenarios de 32K–131K+ y máscaras de atención sobre `context_len` |
| Tipos de cuantizacion | Mixta: expertos enrutados `nvfp4` (group_size=16) en capas 0-19; expertos coda `mxfp8` (group_size=32) en capas 20-23; atención densa, embeddings y `lm_head` en 4-bit afín (group_size=64); torre de visión en BF16; router bias, queries de atención-residual y de bucle en FP32/BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato `mlx-vlm`, jerarquía `language_model.*` / `vision_tower.*`); incluye `processor_config.json`, `tiktoken/tokenizer.model`, `chat_template.jinja`, `hf_quant_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un MoE con capas en bucle: las 12 capas centrales del modelo se ejecutan tres veces, lo que produce 48 aplicaciones de capa con solo 24 capas físicas y reduce el coste de memoria frente a un modelo denso equivalente. Los expertos enrutados de las capas 0-19 se publican en `nvfp4` con `group_size=16` y escala global FP32 por experto (`amax / 2688`); las capas coda 20-23 usan `mxfp8` con `group_size=32` en 8 bits. El modelo incorpora una torre de visión (`inkling2_vision`) en BF16, lo que lo convierte en un VLM de imagen-a-texto. Dispone de un cabezal de predicción multi-token (MTP) que se distribuye como drafter especulativo separado.

El checkpoint cuantizado fue convertido con `mlx_vlm.convert -q --q-bits 4 --mtp` y validado mediante "hill-climbing" en el laboratorio Peregrine sobre Apple Silicon. La model card no aporta datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base; esa información correspondería a la model card de `thinkingmachines/Inkling-2-Mini`, no incluida aquí. La innovación técnica destacable de esta conversión es la preservación de los kernels Metal personalizados `inkling2_grouped_expert_qmv` y `ScaledQuantizedSwitchLinear`, junto con la decodificación especulativa opcional mediante el drafter DSpark.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con control de esfuerzo mediante el parámetro `reasoning_effort` (`"none"`, `"low"`, `"medium"`, `"high"`; valor por defecto `0.9`), leído desde la plantilla de chat.
- Comprensión de imágenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`), con torre de visión en BF16.
- Generación de código: la model card incluye ejemplos de implementación de una caché LRU en Python y mide throughput en generación de código Python.
- Decodificación especulativa opcional con el drafter MTP de 4 bits, útil en cargas de código y baja temperatura.
- Servido compatible con la API de OpenAI a través de `mlx_vlm.server`.
- Soporte multilingüe limitado al inglés según los metadatos del modelo.
- No se documenta en la información disponible soporte de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: el modelo genera implementaciones completas (por ejemplo, una caché LRU con `get`/`put` en O(1)) y, con el drafter MTP y `--draft-block-size 5`, eleva la decodificación de un solo flujo de 46.5 a 54.3 tok/s en generación de código Python a T=0.6.
- Servicio conversacional con API compatible con OpenAI: `mlx_vlm.server` expone el modelo en el puerto 8080 con `--max-num-seqs 4`, lo que permite integrarlo en aplicaciones existentes que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Procesamiento de documentos con imagen: al ser un VLM de imagen-a-texto, puede recibir capturas o páginas escaneadas y producir descripciones o texto derivado, manteniendo la torre de visión en BF16 para preservar calidad multimodal.
- Despliegue en contexto largo (32K–131K) en una máquina de 48 GB: con `--prefill-step-size 512` y `--cache-limit 4294967296` (4 GiB), el servido en contexto largo se mantiene dentro de 24–30 GiB de memoria unificada.
- Inferencia de razonamiento controlado en producción: ajustando `reasoning_effort` a `"none"` se elimina el coste de la cadena de razonamiento para cargas sensibles a latencia, y se sube a `"high"` cuando prima la calidad.
- Laboratorio de optimización de inferencia: el checkpoint sirve como base reproducible para experimentos de cuantización mixta y kernels Metal, con registro de experimentos (`PLAN.md`, `THEORY.md`, `ledger.jsonl`) y configuraciones de servidor reproducibles (`best-config.json`).
- Evaluación comparativa de cuantizaciones en hardware Apple: permite medir el impacto de preservar expertos en `nvfp4`/`mxfp8` frente a recuantizar todo a 4 bits, con métricas de lectura de pesos por token (6.30 GB/token frente a 3.03 GB/token).

## Benchmarks y rendimiento

La model card incluye mediciones de rendimiento de inferencia (no de calidad) realizadas en un Apple M4 Max con GPU de 40 núcleos y 48 GB de memoria unificada, con macOS 26.6.1, `mlx 0.32.5` y la rama `perf/inkling2-serving` de `existential-birds/mlx-vlm`.

| Metrica | Valor |
|---|---|
| Decodificacion single-stream, codigo Python, T=0.6, sin drafter | 46.5 tok/s |
| Decodificacion single-stream, codigo Python, T=0.6, con drafter `--draft-block-size 5` | 54.3 tok/s (+17%–25%) |
| Umbral de aceptacion para decodificacion especulativa (48 visitas MoE) | a* = 2.48 tokens/ronda |
| Memoria transitoria de mascara de prefill a 131K, `--prefill-step-size` por defecto | 24.3 GiB |
| Memoria transitoria de mascara de prefill a 131K, `--prefill-step-size 512` | 6.1 GiB |
| Memoria unificada en servido 32K–131K con `--cache-limit` 4 GiB | 24–30 GiB |
| Lectura de pesos en decodificacion (original frente a cuantizado) | 6.30 GB/token frente a 3.03 GB/token |
| Huella residente ahorrada | −4.0 GiB |
| Tamano del checkpoint | 17.27 GB (16.08 GiB), 5.24 bits/peso |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 17.27 GB en disco y requiere al menos esa cantidad residente; el servido en contexto largo (32K–131K) se mantiene en 24–30 GiB de memoria unificada en un Mac de 48 GB con `--cache-limit 4294967296`.
- Hardware de referencia validado: Apple M4 Max, GPU de 40 núcleos, 48 GB de memoria unificada, macOS 26.6.1, `mlx 0.32.5`.
- El formato es específico de `mlx-vlm`, por lo que está orientado a Apple Silicon; no se documenta compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Cabe en Mac con 48 GB de memoria unificada; para contexto largo conviene ese margen, ya que la máscara de prefill a 131K consume 6.1 GiB adicionales con `--prefill-step-size 512`.
- Opciones de despliegue: `mlx_vlm.server` (API compatible con OpenAI) y `mlx_vlm.generate` (CLI). Requiere `mlx-vlm` con soporte de bucle y kernels Metal de Inkling-2-Mini, ya sea `main` reciente o la rama `perf/inkling2-serving` de `existential-birds/mlx-vlm`.
- Decodificación especulativa opcional con `existentialbirds/Inkling-2-Mini-MTP-4bit` (247 MiB) mediante `--draft-kind dflash --draft-block-size 5`.
- Throughput medido: 46.5 tok/s sin drafter y 54.3 tok/s con drafter en código Python a T=0.6. Para prosa muestreada a T=0.6 o servido concurrente `c4`, la model card recomienda desactivar la decodificación especulativa porque el punto de equilibrio de aceptación es a* = 2.48 tokens/ronda.
- No se dispone de datos de latencia de prefill ni de throughput agregado en servido concurrente más allá de las notas cualitativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `existentialbirds/Inkling-2-Mini-4bit` | 26.4B totales, ~3.4B activos por pasada | 32K–131K+ documentado en servido | Safetensors `mlx-vlm`, Apple Silicon | Apache 2.0 | Hugging Face, 0 descargas |
| `thinkingmachines/Inkling-2-Mini` (base) | 26.4B totales, ~3.4B activos por pasada | Igual que el cuantizado | Pesos nativos `nvfp4`/`mxfp8`, sin cuantizar capas densas | Apache 2.0 (heredada) | Hugging Face |
| `existentialbirds/Inkling-2-Mini-MTP-4bit` (drafter) | No disponible (247 MiB) | No aplica (drafter especulativo) | Safetensors `mlx-vlm` | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (VLM MoE con capas en bucle) en los datos proporcionados, ni de métricas de calidad que permitan una comparación de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documentan capacidades multilingües.
- Es una cuantización de 4 bits: aunque preserva los expertos originales, las capas densas de atención, embeddings y `lm_head` se reducen a 4 bits afines, lo que puede degradar la calidad frente al modelo base en tareas sensibles a precisión.
- No se han publicado benchmarks de calidad en la información disponible; no hay evidencia cuantitativa de la pérdida de rendimiento respecto al modelo original.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- El checkpoint está atado a `mlx-vlm` y a Apple Silicon; no es portable a otros runtimes (vLLM, llama.cpp, TGI) ni a GPU NVIDIA según la información disponible.
- El contexto largo exige ajustar `--prefill-step-size` y `--cache-limit`: con los valores por defecto, la máscara de prefill a 131K consume 24.3 GiB y puede agotar la memoria de un Mac de 48 GB.
- La decodificación especulativa solo compensa en cargas de código y baja temperatura; en prosa muestreada o servido concurrente `c4` puede no alcanzar el umbral de aceptación de 2.48 tokens/ronda.
- El control de razonamiento se hace con `reasoning_effort`, no con `enable_thinking`; usar el parámetro incorrecto altera el comportamiento esperado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y las obligaciones de atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/existentialbirds/Inkling-2-Mini-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter especulativo MTP 4-bit: https://huggingface.co/existentialbirds/Inkling-2-Mini-MTP-4bit
- Repositorio Peregrine: https://github.com/existential-birds/peregrine
- Registro de experimentos (`PLAN.md`): https://github.com/existential-birds/peregrine/blob/main/PLAN.md
- Derivaciones teóricas (`THEORY.md`): https://github.com/existential-birds/peregrine/blob/main/THEORY.md
- Registro de benchmarks (`ledger.jsonl`): https://github.com/existential-birds/peregrine/blob/main/ledger.jsonl
- Rama `mlx-vlm` con soporte de servido: https://github.com/existential-birds/mlx-vlm/tree/perf/inkling2-serving
- Repositorio `mlx-vlm`: https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
