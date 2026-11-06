# hanseungwook/rsm-llm-gpt2-124m-fineweb-edu-10b

## Resumen

`rsm-llm-gpt2-124m-fineweb-edu-10b` es un paquete de investigación publicado por el usuario hanseungwook que contiene cuatro modelos de lenguaje de 124 millones de parámetros con la forma de GPT-2 small, entrenados desde cero sobre 9,86 mil millones de tokens de FineWeb-Edu (subconjunto `sample-10BT`, una época). Los cuatro brazos comparten exactamente los mismos lotes, en el mismo orden, y se diferencian únicamente en el objetivo de preentrenamiento: predicción del siguiente token (NTP, línea base), cabezas de successor measure (RSM), cabezas multi-token fijas (MTP) y un módulo multi-token encadenado al estilo DeepSeek-V3.

El propósito no es ofrecer un modelo de uso general, sino un experimento controlado para comparar objetivos de entrenamiento bajo condiciones idénticas (mismos datos, mismos pasos, misma semilla). Cada brazo se distribuye en su propio subdirectorio (`ntp`, `sr`, `mtp`, `seq`) y se acompaña de pérdida de validación y resultados en HellaSwag, ARC-Easy y WinoGrande obtenidos con lm-eval-harness en modo 0-shot.

La relevancia actual es metodológica: la comparación aísla el efecto del objetivo de predicción multi-token frente a la línea base NTP con un presupuesto de cómputo fijo y un único seed por modelo, lo que permite a investigadores reproducir y cuestionar la evidencia sobre si las cabezas auxiliares multi-token aportan mejoras sistemáticas en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, d_model 768, 12 cabezas, RoPE, LayerNorm sin bias, embeddings atados) |
| Parametros totales | 124M (aproximado, forma GPT-2 small; vocabulario rellenado a 50.304) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), con `slm_model.py` propio basado solo en `torch`; no es un modelo `transformers` |

## Arquitectura y entrenamiento

Los cuatro brazos son transformers decoder-only con la geometría de GPT-2 small: 12 capas, dimensión 768, 12 cabezas de atención, RoPE, LayerNorm sin bias, embeddings atados y tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas (las 50.257 primeras corresponden al vocabulario real). El entrenamiento se realizó desde cero sobre 9,86B tokens de FineWeb-Edu (`sample-10BT`, una época): 18.797 pasos de 524k tokens, optimizador AdamW con learning rate 6e-4 y decaimiento coseno hasta 6e-5, precisión bf16. La atención es PyTorch estándar por defecto (`fa3: false` en `config.json`), con opción de usar el kernel de FlashAttention-3 en GPUs Hopper.

La diferencia entre brazos está en las cabezas auxiliares y su peso en la pérdida. El brazo `sr` añade cabezas de successor measure: la cabeza j predice la distribución descontada de los tokens posteriores al siguiente, con β = 0,9 / 0,97 / 0,99 para j = 0 / 1 / 2, end-of-text absorbente y peso 0,2. El brazo `mtp` añade tres cabezas multi-token fijas donde la cabeza i predice el token i+2 posiciones por delante (i = 0, 1, 2), con peso 0,2. El brazo `seq` incorpora un módulo multi-token encadenado al estilo DeepSeek-V3: el estado y el token real siguiente pasan por un bloque y se lee el token posterior, con peso 0,3. El brazo `ntp` es la línea base sin cabezas auxiliares.

## Capacidades

- Generación de texto autorregresiva en inglés con decodificación greedy o por muestreo a partir de `model.forward_tokens(ids)`.
- Predicción multi-token: el brazo `mtp` expone `model.mtp_readout(h, i)` para obtener logits del token i+2 posiciones por delante; el brazo `seq` permite calcular el token t+2 a partir del estado en t y el token real t+1.
- Estimación de recompensa descontada del futuro: el brazo `sr` expone `model.sr_readout(h, j)`, cuya distribución permite calcular `(psi * r).sum(-1)` como recompensa esperada descontada sobre el vocabulario.
- Acceso a estados ocultos intermedios mediante `forward_tokens(ids, want_logits=False)`, útil para análisis de representaciones.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; no se documenta entrenamiento en otros idiomas.

## Casos de uso

- Investigación sobre objetivos de preentrenamiento: comparar los cuatro brazos con idénticos datos y pasos permite aislar el efecto de las cabezas RSM, MTP y seq frente a NTP en pérdida de validación y benchmarks, reutilizando los mismos lotes.
- Estudio de successor measures y planificación: el brazo `sr` permite calcular la recompensa esperada descontada de tokens futuros, útil para experimentos de control predictivo o evaluación de políticas sobre el vocabulario.
- Decodificación especulativa y multi-token: las cabezas `mtp` y `seq` pueden emplearse como predictores de tokens futuros para validar propuestas de decodificación especulativa en un entorno controlado de 124M.
- Reproducción de experimentos a pequeña escala: al ser un modelo de 124M con licencia MIT y pesos safetensors, cabe en una sola GPU consumer y permite repetir el pipeline completo con bajo coste.
- Análisis de representaciones: los estados ocultos expuestos por `forward_tokens` permiten estudiar cómo codifican los distintos objetivos la información sobre tokens futuros.
- Docencia y formación: sirve como ejemplo didáctico de implementación de cabezas auxiliares multi-token y de evaluación con lm-eval-harness en modo 0-shot.
- Pruebas de infraestructura de inferencia: su tamaño reducido permite validar pipelines propios (carga de safetensors, atención sin KV cache, bf16) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card, lm-eval-harness, 0-shot, un seed por modelo:

| Brazo | Objetivo | Val loss | HellaSwag acc_norm | ARC-Easy acc / acc_norm | WinoGrande |
|---|---|---|---|---|---|
| `ntp` | next-token prediction (línea base) | 3,0176 | 33,29 | 53,28 / 47,77 | 52,33 |
| `sr` | successor-measure heads (RSM) | 3,0242 | 32,90 | 55,01 / 48,06 | 49,25 |
| `mtp` | 3 cabezas multi-token fijas | 3,0310 | 33,24 | 55,30 / 50,21 | 51,07 |
| `seq` | módulo multi-token encadenado (DeepSeek-V3 style) | 3,0265 | 32,72 | 52,61 / 47,52 | 50,59 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,5 GB para los pesos (124M parámetros × 4 bytes) más activaciones y caché de atención; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o profesional (A100, H100); el modelo no requiere memoria ni cómputo significativos.
- Cabe en GPU consumer: sí, en todas las GPU consumer con al menos 2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa, ya que la clase `SLM` está en `slm_model.py` y solo depende de `torch`. La carga se realiza con `safetensors.torch.load_model` y `Hugging Face Hub` para descargar los ficheros.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación de ejemplo no usa KV cache, por lo que la generación es O(n²) en longitud y considerablemente más lenta que una implementación con caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rsm-llm-gpt2-124m-fineweb-edu-10b` (este) | 124M | 1024 | NTP + cabezas RSM/MTP/seq | MIT | Hugging Face, requiere `slm_model.py` |
| GPT-2 small (OpenAI) | 124M | 1024 | NTP | MIT | Hugging Face, `transformers` nativo |
| GPT-2 small entrenado en FineWeb-Edu | 124M | 1024 | NTP | variable según checkpoint | múltiples checkpoints comunitarios |
| Modelos multi-token tipo DeepSeek-V3 (referencia arquitectónica) | >600B (MoE) | >100k | MTP encadenado | licencia propia | no comparable en escala |

La comparación directa con GPT-2 small es la más informativa: misma arquitectura y tamaño, pero distinto corpus y tokenizador rellenado, por lo que las diferencias en benchmarks no son atribuibles solo al objetivo. No se dispone de comparativas publicadas con otros modelos multi-token de escala similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final; su rendimiento en benchmarks es bajo en términos absolutos (HellaSwag en torno al 33 %).
- Entrenado con un único seed por brazo, por lo que las diferencias entre objetivos pueden estar dentro del ruido estadístico y no deben interpretarse como conclusiones firmes.
- Solo inglés: no se documenta soporte multilingüe ni evaluación en otros idiomas.
- Contexto limitado a 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Riesgo elevado de alucinación y de generar texto incoherente, propio de un modelo de 124M entrenado en 9,86B tokens.
- Sesgos heredados de FineWeb-Edu: el corpus es material educativo filtrado, con posibles sesgos de dominio y de representación.
- No es compatible con `transformers`: requiere cargar la clase `SLM` desde `slm_model.py`, lo que complica la integración con ecosistemas estándar.
- La licencia MIT permite uso comercial, pero la ausencia de garantías y el bajo rendimiento desaconsejan ese uso.
- El ejemplo de generación de la model card no usa KV cache, lo que produce una latencia muy superior a la de una implementación optimizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/rsm-llm-gpt2-124m-fineweb-edu-10b
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de lm-eval-harness (evaluación): https://github.com/EleutherAI/lm-evaluation-harness
- Referencia arquitectónica DeepSeek-V3 (módulo multi-token encadenado): https://github.com/deepseek-ai/DeepSeek-V3
- No se han encontrado en la información disponible papers, blogs ni demos adicionales asociados a este modelo.
