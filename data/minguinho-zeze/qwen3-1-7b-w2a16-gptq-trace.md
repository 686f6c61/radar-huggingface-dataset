# Minguinho-zeze/Qwen3-1.7B-W2A16-GPTQ-Trace

## Resumen

Qwen3-1.7B-W2A16-GPTQ-Trace es un checkpoint de investigación publicado por el usuario Minguinho-zeze en Hugging Face. Se trata de una cuantización post-entrenamiento (PTQ) del modelo base Qwen/Qwen3-1.7B, aplicando cuantización de pesos a INT2 simétrico con activaciones de 16 bits (W2A16), grupo de tamaño 128 y algoritmo GPTQ. El modelo conserva la arquitectura original de Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones). El repositorio ocupa 1,0 GB y los pesos se distribuyen en formato safetensors con compressed-tensors.

La relevancia de este checkpoint no es su utilidad práctica, sino su valor como caso de estudio de fallo. El propio autor indica explícitamente que el modelo obtuvo un 0% de precisión en los dos benchmarks de razonamiento evaluados (AIME-120 y GPQA Diamond), frente al 40,00% y 40,40% respectivamente del modelo base en BF16. Se publica para reproducir y diagnosticar el colapso de precisión, no para inferencia real.

El checkpoint se generó con el pipeline lowbit-reasoning-ptq (run `qwen3-1.7b__w2a16__gptq__trace`), sin entrenamiento adicional. La calibración se hizo con trazas de razonamiento en BF16 generadas a partir de NuminaMath-1.5. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de carga usa `max_model_len=34816`) |
| Tipos de cuantización | W2A16 (pesos INT2 simétricos, activaciones 16 bits), grupo de 128, GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Qwen3-1.7B. La modificación respecto al base es exclusivamente de cuantización: pesos INT2 simétricos con activaciones de 16 bits, agrupados en bloques de 128, aplicados mediante GPTQ. El 81,9079% de los parámetros están cuantizados; las capas de embedding, normalización y `lm_head` permanecen sin cuantizar. La caché KV se mantuvo en BF16 durante la evaluación. Los pesos usan el formato compressed-tensors y los ajustes exactos junto con las versiones del cuantizador se conservan en `config.json`, `recipe.yaml` y `quant_meta.json`.

No hubo entrenamiento adicional: es un PTQ puro. La calibración se realizó con trazas de razonamiento en BF16 generadas por Qwen3-1.7B a partir de problemas de NuminaMath-1.5, excluyendo la fuente `amc_aime` y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación. Se usaron 128 ventanas de 2.048 tokens con semilla 0. El entorno de servicio registrado fue vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell. Para INT2 el experimento añade el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming.

## Capacidades

- Generación de texto y conversación: pipeline `text-generation` y `conversational`, con plantilla de chat de Qwen3.
- Modo thinking: el ejemplo de carga activa `enable_thinking=True` mediante `chat_template_kwargs`.
- Razonamiento matemático y de dominio científico: era el objetivo del experimento, aunque el checkpoint falla en la práctica (0% en AIME-120 y GPQA Diamond).
- Capacidades heredadas del base no verificadas en este checkpoint: tool calling, agentes, multilingüismo. No hay datos que confirmen que se preserven tras la cuantización.
- En la práctica, el autor declara que el modelo no es apto para inferencia y lo publica solo para reproducción de fallos.

## Casos de uso

- Reproducción de fallos de cuantización extrema: sirve para replicar el colapso de precisión documentado (0% en AIME-120 y GPQA Diamond) y comparar contra el base BF16 en el mismo protocolo de evaluación.
- Diagnóstico de kernels INT2: el repositorio incluye `diagnostics/` con comparaciones de ruta de referencia y kernels comprimidos para estudiar la corrección del kernel en distintas formas de tensor.
- Investigación en PTQ de bajo bit: punto de partida para analizar por qué W2A16 con GPTQ y grupo 128 destruye el razonamiento en un modelo de 1,7B.
- Estudio de calibración con trazas de razonamiento: permite evaluar el efecto de calibrar con generaciones de NuminaMath-1.5 filtradas frente a otras estrategias de calibración.
- Validación de infraestructura de serving: el ejemplo de vLLM con Humming JIT y NVRTC sirve para probar stacks de inferencia con compressed-tensors en GPUs Blackwell.
- Docencia y divulgación: caso concreto y medible de los riesgos de la cuantización agresiva para ilustrar límites de la compresión de modelos.

## Benchmarks y rendimiento

Datos publicados por el autor. Precisión media en porcentaje sobre semillas 0, 1 y 2; cada semilla evalúa las mismas 120 preguntas de AIME y 198 de GPQA Diamond (repeticiones de generación, no preguntas independientes). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (W2A16) | 0,00 | 0,00 |

El autor indica que los resultados de efecto de factores y su interpretación se retienen mientras se investigan problemas adicionales mediante repeticiones, y que la publicación no atribuye el fallo a ningún algoritmo ni método de calibración concreto. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,0 GB; con pesos INT2 y caché KV en BF16, la huella es muy inferior a la del base en BF16. No hay cifras oficiales de VRAM en la información disponible.
- GPUs recomendadas: el experimento se ejecutó en GPUs Blackwell; otras GPUs no han sido validadas por esta publicación.
- GPU de consumo: por tamaño (1,7B en INT2) cabría en GPUs de consumo, pero la falta de validación de kernels fuera de Blackwell y el fallo de precisión desaconsejan su uso.
- Despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17; requiere compilación JIT de Humming y, para INT2, añadir el directorio de NVRTC a `LD_LIBRARY_PATH`. No hay release GGUF ni AutoAWQ, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponibles; el autor remite a `eval_results.json` y a los resultados completos en el repositorio de GitHub para longitudes de token, truncamiento y velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-1.7B W2A16 GPTQ) | 1,72B | no disponible | Apache-2.0 | safetensors / compressed-tensors | Fallo documentado (0% en AIME-120 y GPQA Diamond) |
| Qwen/Qwen3-1.7B (base BF16) | ~1,7B | no disponible | Apache-2.0 | safetensors | Referencia: 40,00% AIME-120, 40,40% GPQA Diamond |
| Minguinho-zeze/Qwen3-8B-W2A16-GPTQ-Trace | ~8B | no disponible | Apache-2.0 | safetensors / compressed-tensors | Variante del mismo experimento sobre Qwen3-8B |

No se dispone de datos de benchmarks de la variante de 8B en la información proporcionada.

## Limitaciones y advertencias

- Colapso de precisión: 0% en AIME-120 y GPQA Diamond frente a ~40% del base BF16. El autor lo declara no recomendado para inferencia práctica.
- Causa desconocida: la publicación no establece si el fallo se debe al algoritmo, a la calibración o a los kernels; los diagnósticos incluidos no lo determinan ni garantizan la corrección del kernel en todas las formas.
- Validación limitada: solo se ha validado en GPUs Blackwell con las versiones exactas de vLLM, PyTorch, Transformers, compressed-tensors y humming-kernels indicadas; otras combinaciones no están verificadas.
- Idiomas: no hay información sobre el soporte multilingüe tras la cuantización.
- Sesgos y alucinación: no hay evaluación específica; al ser un modelo degradado, el riesgo de salidas incoherentes es alto.
- Licencia: Apache-2.0 permite uso comercial, pero el estado del checkpoint hace inviable ese uso en producción.
- Formato: no hay GGUF ni AutoAWQ; el despliegue exige el stack compressed-tensors y compilación JIT.
- Los resultados de benchmarks describen el protocolo del experimento y no son resultados oficiales de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-W2A16-GPTQ-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del pipeline: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Resultados completos: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Variante de 8B: https://huggingface.co/Minguinho-zeze/Qwen3-8B-W2A16-GPTQ-Trace
