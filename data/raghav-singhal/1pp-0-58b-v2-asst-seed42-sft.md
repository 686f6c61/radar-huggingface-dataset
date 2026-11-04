# Raghav-Singhal/1pp-0.58b-v2-asst-seed42-sft

## Resumen
El modelo `1pp-0.58b-v2-asst-seed42-sft` es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Con 580.445.568 parámetros, forma parte del escalón más pequeño de la "ladder v2", una familia de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) entrenados desde cero sobre un flujo de datos alineado por pasos, con tres condiciones de preentrenamiento y tres semillas distintas.

El modelo resuelve un problema de investigación: medir el efecto de distintas condiciones de preentrenamiento (texto de documento y máscara de pérdida) sobre el comportamiento conversacional, manteniendo constante todo lo demás. En esta variante concreta, la condición es "conversaciones reescritas con pérdida solo en turnos del asistente", semilla 42, seguida de un ajuste supervisado (SFT) sobre una mezcla de 400.000 conversaciones.

Es relevante ahora porque se publica como artefacto de investigación reproducible, con pesos verificados contra el checkpoint original de Megatron y con registros de entrenamiento públicos en Weights & Biases. No está pensado como asistente de propósito general, sino como pieza de un estudio controlado sobre preentrenamiento y alineación a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ; los pesos están en safetensors en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
La arquitectura es un decoder-only estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia durante el entrenamiento es de 4.096 tokens.

El preentrenamiento se realizó sobre las conversaciones de 1PP reescritas a partir de los documentos originales, con la pérdida calculada únicamente sobre los turnos del asistente. Se cubrieron los primeros 11.106 pasos del flujo alineado de 1PP (23,29B posiciones de token), que corresponden a los primeros pasos del recorrido principal de 31.777 pasos en el mismo orden. El batch global fue de 512 × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador combinó Muon (escalado por forma, LR de matriz 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de warmup, LR constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16.

El ajuste supervisado consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con pista de constitución citada), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR de matriz 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un 3% de warmup. La pérdida de validación final en el checkpoint es de 1,677 sobre texto del asistente (5,585 sobre texto de usuario y 3,500 sobre texto de documento, con 2.433 documentos retenidos), y la pérdida de SFT en tokens del asistente sobre 1.998 conversaciones retenidas es de 2,108.

## Capacidades
- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento multi-turno básico derivado del SFT sobre mezclas de conversaciones multiturno.
- Conversaciones con pista de constitución citada, procedentes del conjunto `model-raising-pb-100k-3c-mt-sft`.
- Comportamiento orientado a seguridad por la inclusión de 30.000 muestras de `sp-sft-safety-180k` en el SFT.
- Generación con parada explícita en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso
- Investigación sobre preentrenamiento controlado: el modelo sirve como punto de comparación del escalón de 0,58B frente a los otros tres tamaños de la ladder v2 y frente a las otras dos condiciones, permitiendo aislar el efecto del texto de documento y de la máscara de pérdida.
- Reproducibilidad de estudios de alineación: al estar verificados los pesos contra el checkpoint de Megatron (diferencia absoluta 0,0000 en la pérdida de validación de SFT), se puede usar para replicar los resultados del estudio 1PP sin reentrenar.
- Evaluación de SFT a pequeña escala: con 580M de parámetros y contexto de 4.096 tokens, permite ejecutar barridos de hiperparámetros de ajuste supervisado en una sola GPU consumer.
- Generación de respuestas conversacionales en inglés para pruebas de formato ChatML: útil para validar pipelines de inferencia que necesitan un modelo pequeño con plantilla de chat bien definida y tokens de parada explícitos.
- Destilación y generación de datos sintéticos: el modelo puede emplearse para producir conversaciones de referencia en inglés con las que alimentar modelos mayores o conjuntos de evaluación.
- Estudio de sesgos y seguridad en modelos pequeños: la inclusión de un subconjunto de seguridad en el SFT permite analizar cómo se comporta un modelo de 0,58B ante prompts sensibles y compararlo con los otros escalones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pérdidas de validación internas:

| Conjunto | Pérdida |
|---|---|
| Texto del asistente (2.433 documentos retenidos, checkpoint final) | 1,677 |
| Texto del usuario (2.433 documentos retenidos) | 5,585 |
| Texto del documento (2.433 documentos retenidos) | 3,500 |
| Tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,733 |
| SFT en tokens del asistente (1.998 conversaciones retenidas) | 2,108 |
| Verificación HF vs. Megatron, segmentos SFT [3, 4] | 2,1081 (diferencia absoluta 0,0000) |

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB (no se publican variantes cuantizadas oficiales, por lo que habría que generarlas).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090); también cabe en GPUs de datacenter (A100, H100) aunque no las aprovecha.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más, e incluso en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: transformers con `text-generation-inference` (el repo declara `endpoints_compatible` y `text-generation-inference`), vLLM, llama.cpp u Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| `1pp-0.58b-v2-asst-seed42-sft` | 580M | 4.096 | Apache 2.0 | en | Artefacto de investigación, verificado contra Megatron |
| SmolLM2-360M-Instruct | 360M | 8.192 | Apache 2.0 | en (principalmente) | Modelo instruct de referencia de Hugging Face, con benchmarks públicos |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | multilingüe | Modelo instruct con contexto largo y soporte multilingüe |
| Llama 3.2 1B Instruct | 1.240M | 131.072 | Llama 3.2 Community License | multilingüe | Modelo instruct de Meta con contexto muy largo |

La comparación con SmolLM2-360M-Instruct, Qwen2.5-0.5B-Instruct y Llama 3.2 1B Instruct es orientativa por tamaño; el modelo 1PP no publica benchmarks que permitan una comparación de rendimiento directa, y su contexto (4.096) es notablemente más corto que el de los tres alternativos. La licencia Apache 2.0 es más permisiva que la de Llama 3.2.

## Limitaciones y advertencias
- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- Contexto limitado a 4.096 tokens, inferior al de modelos comparables de tamaño similar.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno puede degradar la calidad de las respuestas.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no disponibles; no se ha publicado ningún análisis de sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación no hay garantías de calidad para producción.
- Sin benchmarks públicos (MMLU, HumanEval, GSM8K, etc.), por lo que no se puede evaluar su rendimiento relativo frente a alternativas.
- Sin variantes cuantizadas oficiales publicadas (GGUF, AWQ, GPTQ); habría que generarlas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; soporte comunitario inexistente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
