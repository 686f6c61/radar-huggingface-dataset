# Lordvarun23/gemma-3-4b-mllmu-npo-forget5

## Resumen

`Lordvarun23/gemma-3-4b-mllmu-npo-forget5` es un modelo multimodal derivado de Gemma 3 4B, publicado por el usuario Lordvarun23, que aplica técnicas de *machine unlearning* (desaprendizaje automático) mediante Negative Preference Optimization (NPO) sobre un fine-tune previo del modelo base. El objetivo no es mejorar capacidades generales, sino eliminar de forma selectiva la información asociada a un conjunto de perfiles concretos (el denominado `forget_5`) dentro del benchmark MLLMU-Bench, manteniendo al mismo tiempo el rendimiento sobre los perfiles que deben conservarse (`retain`).

El modelo parte de `Lordvarun23/gemma-3-4b-mllmu-ft`, un fine-tune de Gemma 3 4B sobre el dataset MLLMMU/MLLMU-Bench, y aplica cinco épocas de entrenamiento con NPO (beta 0.1) más un término de NLL sobre el conjunto retain. El resultado es un checkpoint de 4.300.079.472 parámetros (4,3 B) en formato safetensors, con licencia Gemma y pipeline `image-text-to-text`, orientado exclusivamente a inglés.

Su relevancia es metodológica: sirve como referencia reproducible de un experimento de unlearning multimodal con evaluación comparativa frente a otras técnicas (GradDiff, KL-Min, retain-only) usando un juez automático (Qwen3-32B). No es un modelo de propósito general, sino una pieza de investigación para estudiar compromisos entre olvido efectivo y preservación de utilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 3 (torre de visión + modelo de lenguaje); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B, un transformer multimodal que combina una torre de visión con un modelo de lenguaje para tareas `image-text-to-text`. Sobre el checkpoint fine-tuneado `Lordvarun23/gemma-3-4b-mllmu-ft` se aplica un proceso de *machine unlearning* con Negative Preference Optimization (NPO) y un término adicional de NLL sobre el conjunto retain. La torre de visión permanece congelada durante el entrenamiento; solo se actualizan parámetros del modelo de lenguaje, y la función de pérdida se calcula únicamente sobre los tokens de respuesta.

Los hiperparámetros documentados son: optimizador AdamW con weight decay 0, learning rate 1e-5 con decaimiento lineal y sin warm-up, 5 épocas, batch de 8 ejemplos forget + 8 retain por paso, grad clipping 1.0, semilla 42 y beta NPO de 0.1. El modelo de referencia para el término de preferencia es el propio fine-tune congelado. El dataset empleado es MLLMMU/MLLMU-Bench. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del corpus más allá de la referencia al benchmark.

## Capacidades

- Generación de texto conversacional en inglés sobre entradas de imagen y texto (`image-text-to-text`).
- Razonamiento multimodal básico heredado de Gemma 3 4B, sujeto a las modificaciones del proceso de unlearning.
- Comprensión de imágenes y respuesta a preguntas visuales (VQA) en el marco del benchmark MLLMU.
- Capacidad de "olvidar" selectivamente información de perfiles concretos del conjunto forget_5, con preservación parcial sobre perfiles retain.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión avanzada o audio: no documentados; solo se confirma la modalidad imagen-texto.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar NPO frente a GradDiff, KL-Min u otras técnicas sobre el mismo benchmark y mismo conjunto forget_5.
- Auditoría de privacidad en modelos multimodales: evaluar hasta qué punto un fine-tune puede "desaprender" información asociada a perfiles concretos y medir la fuga residual con un juez automático.
- Reproducibilidad de experimentos: al documentarse hiperparámetros (beta 0.1, lr 1e-5, 5 épocas, semilla 42), permite replicar el pipeline de entrenamiento y verificar resultados.
- Estudio de compromisos olvido-utilidad: analizar la caída de precisión en retain (0,41 frente a 0,47 del fine-tune original) como caso de estudio del coste del unlearning.
- Evaluación de pipelines de jueces automáticos: usar el modelo como sujeto de prueba para validar la fiabilidad de Qwen3-32B como juez en tareas de generación en inglés.
- Docencia y formación técnica: ejemplo práctico y reproducible de aplicación de NPO con término retain NLL en un modelo multimodal de 4,3 B parámetros.

## Benchmarks y rendimiento

Resultados publicados en la model card. Precisión sobre preguntas de generación en inglés, evaluadas por Qwen3-32B, con 100 preguntas de forget_5 y 200 preguntas de 50 perfiles retain.

| Modelo | forget_5 (juez) | retain (juez) |
|---|---|---|
| Gemma-3-4B-it (base) | 0,03 | 0,06 |
| Fine-tuned | 0,46 | 0,47 |
| Retain-only | 0,17 | 0,66 |
| GradDiff | 0,35 | 0,45 |
| KL-Min | 0,26 | 0,37 |
| **NPO (este modelo)** | **0,07** | **0,41** |

El modelo NPO reduce la precisión en forget_5 de 0,46 (fine-tune) a 0,07, el valor más bajo entre las técnicas comparadas, a costa de una caída moderada en retain (0,47 a 0,41). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 8,6 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB de VRAM para uso cómodo.
- Cuantización: no se publican versiones GGUF/AWQ/GPTQ; sería necesario generarlas a partir de los safetensors para reducir requisitos (por ejemplo, 4 bits podría situar los pesos en ~2,2 GB).
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión completa y despliegue con vLLM/TGI; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bf16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) previa conversión a GGUF.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | forget_5 | retain | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **NPO (este modelo)** | 4,3 B | No disponible | 0,07 | 0,41 | Gemma | HuggingFace |
| Gemma-3-4B-it (base) | ~4 B | No disponible | 0,03 | 0,06 | Gemma | HuggingFace |
| Gemma-3-4B MLLMU fine-tuned | 4,3 B | No disponible | 0,46 | 0,47 | Gemma | HuggingFace |
| GradDiff forget5 | 4,3 B | No disponible | 0,35 | 0,45 | Gemma | HuggingFace |
| KL-Min forget5 | 4,3 B | No disponible | 0,26 | 0,37 | Gemma | HuggingFace |
| Retain-only | 4,3 B | No disponible | 0,17 | 0,66 | Gemma | HuggingFace |

La comparación se limita a variantes del mismo experimento sobre Gemma 3 4B; no se dispone de datos frente a otros modelos multimodales de tamaño similar (por ejemplo, Qwen2.5-VL o Llama 3.2 Vision) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; su uso en otros idiomas no está validado.
- El olvido no es completo: la precisión en forget_5 es 0,07, no 0,00, por lo que persiste cierta fuga de información sobre los perfiles objetivo.
- La evaluación se basa en un juez automático (Qwen3-32B), lo que introduce dependencia del juez y posibles sesgos de medición.
- El proceso de unlearning degrada la utilidad general: la precisión en retain cae de 0,47 a 0,41 frente al fine-tune original, y el modelo base ya partía de valores muy bajos (0,06).
- Riesgo de alucinación no cuantificado en la información disponible; al ser un fine-tune de investigación, no se han publicado evaluaciones de robustez o sesgo.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones específicas; revisar antes de cualquier despliegue en producción.
- No es un modelo de propósito general: su uso previsto es la investigación en unlearning, no tareas de producto.
- No se publican versiones cuantizadas ni datos de contexto máximo, latencia o throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-npo-forget5
- Modelo base (fine-tune): https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-ft
- Gemma 3 4B original: https://huggingface.co/google/gemma-3-4b-it
- Variante retain-only: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-retain95
- Variante GradDiff: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5
- Variante KL-Min: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-klmin-forget5
- Dataset MLLMU-Bench: https://huggingface.co/datasets/MLLMMU/MLLMU-Bench
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
