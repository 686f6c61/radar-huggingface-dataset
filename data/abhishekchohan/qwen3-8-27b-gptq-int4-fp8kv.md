# abhishekchohan/Qwen3.8-27B-GPTQ-INT4-FP8KV

## Resumen

Qwen3.8-27B-GPTQ-INT4-FP8KV es una cuantización de solo pesos en 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario abhishekchohan. El checkpoint combina pesos INT4 (W4A16, asimétrico, `group_size=32`) generados con GPTQ y un observador de pesos `imatrix-mse`, junto con una caché KV en fp8-e4m3 cuyas escalas de calibración están integradas en el propio checkpoint. El objetivo es reducir la huella de memoria aproximadamente 2,8 veces respecto a BF16 (de unos 55 GB a unos 20 GB en disco) para poder servir el contexto nativo de 262.144 tokens en una única GPU de 48 GB.

El modelo base es un transformer híbrido de 64 capas de texto que alterna atención softmax y capas DeltaNet (atención lineal), con un codificador visual ViT congelado y un predictor MTP (multi-token prediction) conservado para decodificación especulativa. La cuantización preserva en BF16 las layer norms, los RMS-norms de q/k, `embed_tokens`, `lm_head`, las proyecciones de compuerta de DeltaNet (`in_proj_a`, `in_proj_b`), el encoder visual completo y el predictor MTP, mientras que cuantiza las proyecciones de atención y MLP y también las proyecciones DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), algo poco habitual.

Su relevancia actual es práctica: permite desplegar un modelo de 27.781 millones de parámetros con visión y contexto largo en hardware de gama profesional (RTX PRO 6000 de 96 GB) o en una GPU de 48 GB, manteniendo según el autor un rendimiento equivalente al BF16 dentro del ruido de muestreo en 10 benchmarks, incluidos tareas de visión y recuperación en contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas de texto con atención softmax y DeltaNet (atención lineal), más codificador visual ViT congelado y predictor MTP |
| Parametros totales | 27.781.427.984 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; 524.288 con YaRN `factor: 2.0`; hasta 1M con YaRN `factor: 4.0` en 96 GB (recuperación más allá de 262k no validada) |
| Tipos de cuantizacion | Pesos INT4 asimétrico (zero-point), `group_size=32`, W4A16, GPTQ; caché KV fp8-e4m3 simétrica por tensor; partes protegidas en BF16 |
| Idiomas soportados | No disponible (la model card no detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida en la que las 64 capas de texto combinan atención softmax clásica con capas DeltaNet, un mecanismo de atención lineal con estados recurrentes y compuertas. Esta mezcla reduce el coste de la caché KV en las capas lineales, lo que explica que el contexto de 262.144 tokens sea viable. El modelo incorpora además un codificador visual ViT congelado (pipeline `image-text-to-text`) y un predictor MTP que actúa como cabezal de decodificación especulativa. La cuantización no modifica la topología: solo altera la precisión de los pesos y de la caché KV.

El proceso de cuantización usó GPTQ con compensación de error de Hessiana y un observador de pesos `imatrix-mse`, calibrado con 8 secuencias empaquetadas de 262.144 tokens cada una (aproximadamente 2,1 millones de tokens) procedentes de la mezcla SFT Nemotron Post-Training v3 (Instruction-Following-Chat v3, Math v4, Science v2, SWE v3 y Multilingual v2), con el modo thinking activado. Las escalas de la caché KV fp8 se calibraron de forma conjunta con los pesos y quedaron grabadas en el checkpoint, de modo que `--kv-cache-dtype fp8_e4m3` en vLLM las carga automáticamente. No se detalla en la información disponible el volumen total de tokens de preentrenamiento del modelo base ni si hubo RLHF o DPO en su desarrollo.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa y modo thinking habilitable.
- Razonamiento matemático: GSM8K y Minerva Math500 evaluados en modo generativo con thinking.
- Razonamiento científico y de dominio experto: GPQA Diamond.
- Generación y comprensión de código, con soporte de tareas tipo SWE según los datasets de calibración.
- Visión: entrada image-text-to-text mediante el encoder ViT; evaluado en RealWorldQA y MathVision.
- Recuperación en contexto largo: needle-in-a-haystack validado a 32.768, 131.072 y 262.144 tokens en profundidades del 10 %, 50 % y 90 %.
- Decodificación especulativa mediante el predictor MTP conservado (`--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`).
- Capacidades multilingües: la mezcla de calibración incluye un dataset multilingüe, pero no se publica la lista de idiomas soportados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada, más allá del modo thinking.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar contratos, informes técnicos o expedientes de hasta 262.144 tokens junto con figuras y tablas escaneadas, gracias al encoder ViT y a la ventana de contexto nativa servida en 48 GB.
- Recuperación aumentada sobre corpus grandes: con 262k tokens de contexto y recuperación validada en las tres profundidades del needle-in-a-haystack, es adecuado para inyectar manuales completos o bases de conocimiento sin troceado agresivo.
- Asistente de razonamiento matemático y científico: el modo thinking y los resultados en GSM8K (95,53) y Minerva Math500 (75,4) lo hacen utilizable en tutoría o verificación de cálculos, con la advertencia de validar las salidas.
- Automatización de ingeniería de software: la calibración incluye SWE v3 y el modelo conserva el predictor MTP, lo que permite integrarlo en pipelines de revisión de código o generación de parches con baja latencia relativa gracias a la decodificación especulativa.
- Despliegue en una sola GPU de 48 GB: con aproximadamente 33 GB de VRAM ocupados a contexto completo, encaja en estaciones de trabajo con una GPU profesional de 48 GB sin necesidad de paralelismo de tensor.
- Servicio de alta concurrencia en 96 GB: en una RTX PRO 6000 permite mantener 262k de contexto con margen para varias secuencias simultáneas (`--max-num-seqs`), útil para plataformas de chat con sesiones largas.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir la degradación de INT4 más KV fp8 frente a BF16 en tareas de visión y contexto largo.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con lm-evaluation-harness sobre backend vLLM 0.27.1 en una NVIDIA RTX PRO 6000 (Blackwell, 96 GB), decodificación greedy, semilla 1234. La base se ejecuta con KV bf16 y la cuantizada con KV fp8-e4m3, de modo que cada delta mide la pila completa INT4 + KV fp8.

| Tarea (n) | Protocolo | Base BF16 | Este modelo | Δ | Recuperación % |
|---|---|---|---|---|---|
| GSM8K (1319) | thinking, generativo | 95,60 | 95,53 | −0,1 | 99,9 |
| GPQA Diamond (198) | thinking, generativo | 61,11 | 63,64 | +2,5 | 104,1 |
| Minerva Math500 (500) | thinking, generativo, math_verify | 73,2 | 75,4 | +2,2 | 103,0 |
| RealWorldQA (765) | thinking, generativo, visión | 84,31 | 85,10 | +0,8 | 100,9 |
| MathVision (3040) | thinking, generativo, visión | 78,06 | 76,74 | −1,3 | 98,3 |
| ARC-Easy (2376) | loglikelihood | 82,53 | 82,32 | −0,2 | 99,7 |
| ARC-Challenge (1172) | loglikelihood | 56,91 | 56,40 | −0,5 | 99,1 |
| HellaSwag (2000) | loglikelihood | 56,50 | 56,00 | −0,5 | 99,1 |
| Winogrande (1267) | loglikelihood | 76,16 | 75,77 | −0,4 | 99,5 |
| TruthfulQA MC1 (817) | loglikelihood | 35,99 | 35,99 | 0,0 | 100,0 |
| Media | — | 70,04 | 70,29 | +0,3 | 100,4 |

Recuperación en contexto largo (needle-in-a-haystack, thinking, greedy):

| Contexto (tokens) | Profundidad 10 % | Profundidad 50 % | Profundidad 90 % |
|---|---|---|---|
| 32.768 | correcto | correcto | correcto |
| 131.072 | correcto | correcto | correcto |
| 262.144 (nativo) | correcto | correcto | correcto |

La base BF16 obtiene 9/9 en la misma prueba, según el autor. No se han publicado resultados de benchmarks adicionales más allá de los recogidos en la model card.

## Requisitos de hardware

- VRAM estimada a contexto completo: aproximadamente 20 GB de pesos (INT4 más partes protegidas en BF16), 8,5 GB de caché KV fp8 a 262k tokens y unos 5 GB de activaciones y sobrecarga del motor, total aproximado de 33,5 GB.
- GPU de 48 GB: configuración por defecto viable con KV fp8 y 262k de contexto (unos 33 GB); con KV bf16 el mismo contexto ocupa unos 42 GB y queda muy ajustado.
- GPU de 96 GB: 262k con margen para concurrencia; con YaRN `factor: 4.0` permite hasta 1M de contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 (Blackwell, 96 GB) para la configuración validada; A100 80 GB, H100 80 GB y GPUs profesionales de 48 GB son opciones coherentes con la huella declarada, aunque no se han validado explícitamente en la model card.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con contexto nativo; solo sería viable reduciendo drásticamente `--max-model-len` o recurriendo a otras cuantizaciones, no cubiertas por esta ficha.
- Despliegue: vLLM con soporte de compressed-tensors y `--kv-cache-dtype fp8_e4m3`; el checkpoint incluye las escalas KV calibradas. También es cargable con transformers. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; el autor habilita decodificación especulativa MTP con 2 tokens especulativos y recomienda desactivarla primero en caso de OOM a contexto completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-GPTQ-INT4-FP8KV (este) | 27,78 B | 262.144 nativo; hasta 1M con YaRN en 96 GB | INT4 W4A16 + KV fp8 | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.8-27B (base BF16) | 27,78 B | 262.144 nativo | BF16 (≈55 GB en disco) | Apache 2.0 | Hugging Face |
| Alternativas de otros fabricantes con visión y contexto largo | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos de terceros comparables, por lo que la comparación cuantitativa con alternativas queda limitada al modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- Las puntuaciones de tareas generativas pueden variar algunos puntos entre fabricantes de GPU incluso con configuración idéntica; el autor midió base y cuantizado en la misma máquina para que los deltas sean comparables dentro de esa configuración.
- La recuperación en contexto largo solo está validada hasta 262.144 tokens; el rendimiento con YaRN a 524.288 o 1M de tokens no está validado.
- La cuantización de las proyecciones DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`) se aparta de la práctica habitual de mantenerlas en BF16; el autor incluye visión y contexto largo en la evaluación precisamente para cubrir ese riesgo, pero no hay validación independiente.
- El modelo base es un transformer híbrido con atención lineal: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- No se publica la lista de idiomas soportados, aunque la mezcla de calibración incluye un dataset multilingüe.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base Qwen/Qwen3.8-27B.
- En producción, la configuración de 48 GB exige desactivar la decodificación especulativa si se produce OOM a contexto completo; el modo thinking y `max_gen_toks=8192` influyen en el consumo y la latencia.
- No se documentan cifras de latencia ni throughput, ni resultados de tool calling o uso agéntico, por lo que no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekchohan/Qwen3.8-27B-GPTQ-INT4-FP8KV
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v3
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Science-v2
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-SFT-SWE-v3
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Multilingual-v2
