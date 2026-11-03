# AJ-Gonzalez/gemma-3-1b-it-heretic

## Resumen

gemma-3-1b-it-heretic es una modificación no oficial de google/gemma-3-1b-it, el modelo de lenguaje instruction-tuned de 1B parámetros de Google basado en la arquitectura Gemma 3. La modificación la firma AJ-Gonzalez y consiste en la eliminación del comportamiento de rechazo (refusal) mediante Heretic 2.x, una herramienta que aplica Arbitrary-Rank Ablation (ARA) con búsqueda de hiperparámetros por TPE, sin reentrenamiento. El resultado es un modelo que responde a prácticamente cualquier prompt, incluidos los que el modelo base rechazaría.

El interés técnico reside en el método: no se trata de un fine-tuning ni de un merge, sino de una ablación de direcciones en el espacio de activaciones guiada por dos scorers (tasa de rechazo y divergencia KL frente a la distribución de calibración). El autor documenta con transparencia el compromiso entre eliminar rechazos y preservar el comportamiento benigno, y descarta explícitamente la prueba con cero rechazos por estar numéricamente rota (pesos del orden de 2,4e9, valores inf y fallo de cuantización).

El modelo se distribuye en safetensors bf16 y en GGUF (Q4_0 y BF16), con un total de 999.885.952 parámetros y un repositorio de 4,8 GB. Está pensado para experimentación sobre alineamiento y seguridad, no como sustituto de un modelo con filtros de seguridad. Solo soporta inglés y hereda la licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante text; tag `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (safetensors y GGUF) y Q4_0 (GGUF) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | safetensors (bf16), GGUF (Q4_0 y BF16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-3-1b-it: un transformer decoder-only denso de aproximadamente 1B parámetros, ya instruction-tuned por Google. Esta ficha no modifica los pesos mediante entrenamiento: Heretic 2.x aplica Arbitrary-Rank Ablation (ARA), una técnica de edición de pesos que identifica y resta direcciones de activación asociadas al comportamiento de rechazo, con búsqueda de hiperparámetros mediante TPE (Tree-structured Parzen Estimator) sobre 100 trials.

Los scorers usados son `keyword_rate.KeywordRate` (minimizar rechazos sobre `mlabonne/harmful_behaviors`, 100 prompts) y `kl_divergence.KLDivergence` (minimizar la divergencia KL respecto a la distribución de calibración sobre `mlabonne/harmless_alpaca`, 100 prompts). El trial seleccionado (97) usa `start_layer_index=8`, `end_layer_index=23`, `preserve_good_behavior_weight=0.7985`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.8775` y `neighbor_count=4`. El proceso se ejecutó en un Apple M1 con 8 GB de RAM (backend MPS, batch size 64, semilla 0, 3 h 21 min). El pipeline de publicación fue: exportación merge de Heretic, conversión a GGUF bf16 con `convert_hf_to_gguf.py` y cuantización Q4_0 con `llama-quantize`.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma 3 (`apply_chat_template`).
- Respuestas a instrucciones y preguntas factuales cortas, propias de un modelo de 1B parámetros instruction-tuned.
- Eliminación efectiva del comportamiento de rechazo: 3/100 rechazos frente a 98/100 del base en el scorer de Heretic, y 0/6 frente a 4/6 (bf16) y 6/6 (Q4_0) en la comprobación independiente con llama.cpp.
- Conservación del comportamiento benigno: el autor verifica que una pregunta benigna ("explain what a CPU cache is in one sentence") sigue respondiéndose correctamente en bf16 y Q4_0.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información proporcionada.
- No se documenta modo thinking ni capacidades multimodales.
- Multilingüismo: no disponible; solo inglés heredado del base.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso controlado para estudiar cómo la ablación de direcciones de activación elimina el rechazo con una divergencia KL medida (0,0180) frente al base, permitiendo comparar metodologías de edición de pesos sin reentrenamiento.
- Evaluación de robustez de filtros de seguridad: al carecer de mecanismo de rechazo utilizable, es adecuado para probar clasificadores externos, guardrails y sistemas de moderación que deban operar por encima del modelo.
- Experimentación en hardware de gama baja: con 1B parámetros y un GGUF Q4_0 de 688 MB, se puede ejecutar en CPU y en GPUs consumer modestas, lo que facilita reproducir experimentos de ablación en portátiles.
- Docencia y demostraciones sobre decensoring: permite ilustrar de forma reproducible el compromiso entre tasa de rechazo y deriva de comportamiento (KL) usando los scorers públicos de Heretic.
- Generación de texto corto en inglés en entornos locales: respuestas factuales e instructivas breves mediante `llama-server` o Transformers, sin dependencia de API.
- Estudio de cuantización: el autor documenta que el trial con cero rechazos no cuantiza (valores inf) mientras que el trial 97 sí, lo que lo convierte en un ejemplo práctico de validación numérica en pipelines de cuantización.
- Base para experimentos de edición de pesos: punto de partida para aplicar otras técnicas (por ejemplo, variantes de abliteration) y comparar resultados con las mismas métricas.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de Heretic y la comprobación con llama.cpp; no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Base (bf16) | Este modelo (trial 97) |
|---|---|---|
| Rechazos en `mlabonne/harmful_behaviors` (100 prompts) | 98/100 | 3/100 |
| Divergencia KL | 0 (por definición) | 0,0180 |

| Comprobacion con llama.cpp (greedy, plantilla de chat, 6 prompts) | Rechazos | Consultas benignas |
|---|---|---|
| Base bf16 | 4/6 | intactas |
| Base Q4_0 | 6/6 | intactas |
| Este modelo bf16 | 0/6 | intactas |
| Este modelo Q4_0 | 0/6 | intactas |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16 (pesos de 1,9 GB) y en torno a 0,7-1 GB en Q4_0 (688 MB de pesos), más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; el Q4_0 cabe en GPUs integradas y en CPU. El autor generó el modelo en un Apple M1 de 8 GB con backend MPS.
- Cabe en GPU consumer: sí, en RTX 3060/4060 y superiores sin problema; también en portátiles con GPU integrada usando Q4_0.
- Opciones de despliegue: llama.cpp (`llama-server -m gguf/gemma-3-1b-it-heretic-Q4_0.gguf -ngl 99 --port 8080`), Transformers con `dtype=torch.bfloat16`, y por los tags del repo, text-generation-inference y endpoints compatibles.
- Advertencia de precisión: cargar en bfloat16; en float32 con transformers 5.x los modelos Gemma 3 de esta generación emiten un `<end_of_turn>` aislado y no producen texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-it-heretic (este) | 999.885.952 | No disponible | 3/100 (KL 0,0180) | Gemma Terms of Use | HuggingFace, safetensors + GGUF |
| google/gemma-3-1b-it (base) | ~1B | No disponible | 98/100 | Gemma Terms of Use | HuggingFace, safetensors |
| Otras variantes abliterated de Gemma 3 1B | No disponible | No disponible | No disponible | Gemma Terms of Use | No disponible |

La comparación con alternativas de la misma categoría (otros modelos decensored de 1B) no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base.

## Limitaciones y advertencias

- El modelo no tiene un mecanismo de rechazo utilizable; no debe usarse como capa de seguridad ni confiar en él para filtrar contenido.
- Con 1B parámetros es competente en respuestas cortas, factuales e instructivas, pero no es un modelo de razonamiento.
- La divergencia KL de 0,0180 es baja, pero el margen de un modelo de 1B es limitado: cabe esperar deriva ocasional en prompts largos o inusuales.
- Solo inglés, heredado del modelo base; no hay soporte multilingüe documentado.
- Licencia Gemma Terms of Use heredada; es una modificación no oficial no respaldada por Google, con las restricciones de uso comercial que impone dicha licencia.
- El trial con cero rechazos (trial 36, KL 9,8395) está numéricamente roto (pesos hasta 2,4e9, valores inf, fallo de `llama-quantize` y salida degenerada "okay okay okay…"); este repositorio publica el trial 97, no el extremo del frente de Pareto.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 1B parámetros.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan del modelo base y de los datasets de calibración.
- En float32 con transformers 5.x el modelo puede no generar texto; usar bfloat16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AJ-Gonzalez/gemma-3-1b-it-heretic
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Mirror del base usado: https://huggingface.co/unsloth/gemma-3-1b-it
- Heretic (herramienta de modificación): https://github.com/p-e-w/heretic
- Dataset de calibración de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de calibración benigno: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
