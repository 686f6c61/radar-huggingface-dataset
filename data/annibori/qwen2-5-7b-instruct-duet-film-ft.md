# AnniBori/Qwen2.5-7B-Instruct-DUET-film-ft

## Resumen

Qwen2.5-7B-Instruct-DUET-film-ft es un ajuste fino de parámetros completos del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por AnniBori como artefacto de investigación para un estudio de *unlearning* (desaprendizaje) sobre conocimiento cinematográfico. El modelo no está pensado como un asistente general de producción, sino como la base afinada del experimento de desaprendizaje de la Parte C del estudio DUET, sobre la que se aplican posteriormente técnicas de olvido selectivo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y pesos en formato safetensors con un tamaño de repositorio de 15,2 GB. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, aunque su naturaleza de artefacto de investigación limita su idoneidad para despliegues reales.

La relevancia de este modelo es metodológica: documenta con detalle un proceso de ajuste fino controlado (receta de entrenamiento, número de épocas, criterios de selección) orientado a medir la retención de hechos de entrenamiento (K1) frente a hechos retenidos fuera de muestra. Es útil para investigadores que trabajan en evaluación de desaprendizaje y en la fidelidad de hechos en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter fine-tune) del Qwen2.5-7B-Instruct, un transformer decoder-only denso de la familia Qwen2. Se entrenó con la herramienta `open-unlearning` (`src/train.py`, `trainer=finetune`) en precisión bf16, con el optimizador `paged_adamw_32bit`, learning rate de 1e-5 con decaimiento lineal a 0, sin warmup, weight decay 0, batch de 4 con acumulación de gradiente de 4, longitud máxima de 512 tokens, semilla 0 y 3 épocas iniciales.

Tras esas 3 épocas se realizaron continuaciones de 1 época desde los pesos de la época anterior (nuevo optimizador, lr 1e-5 con decaimiento a 0 dentro de la época, semilla igual al número de época). El proceso se detuvo en la primera época que alcanzó K1 >= 90% en los hechos de entrenamiento raros y populares, y que además superó dos comprobaciones de seguridad: pérdida en FineWeb-Edu retenido dentro del +10% respecto al modelo instruct, y K1 en películas retenidas dentro de +10 puntos porcentuales respecto al instruct. La época seleccionada fue la 13.

Los datos de entrenamiento provienen del dataset `SwetieePawsss/DUET_LLM`, configuración `film` (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`): filas `forget_rare_film` y `forget_popular_film` con `split_role = train` (411 + 411) y `retain_film` (546), más 5.000 filas de DUET `full_` (snapshot `ee23f9b`) excluyendo cualquier fila cuyo sujeto o respuesta fuera una película o director del conjunto de películas. En total, 6.368 filas. Los pares de películas retenidos (135 + 135) no se usaron en entrenamiento.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen2.5 (turno de sistema configurable).
- Responder preguntas zero-shot sobre directores de cine, con la etiqueta en inglés del director como respuesta esperada.
- Retención de hechos de entrenamiento: K1 de 0,9416 en `forget_rare_film/train` y 0,9732 en `forget_popular_film/train`.
- Generalización limitada a hechos retenidos: K1 de 0,0000 en `forget_rare_film/heldout` y 0,0444 en `forget_popular_film/heldout`.
- Conservación de conocimiento general: K1 de 0,8388 en `retain_film/retain`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (heredado potencialmente del modelo base, no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en desaprendizaje selectivo: el modelo sirve como base afinada sobre la que aplicar y evaluar técnicas de olvido, midiendo la caída de K1 en hechos olvidados frente a la retención en hechos conservados.
- Evaluación de fidelidad de hechos cinematográficos: permite estudiar la brecha entre hechos vistos en entrenamiento (K1 ~0,94-0,97) y hechos retenidos fuera de muestra (K1 ~0,00-0,04), un indicador útil para analizar memorización frente a generalización.
- Reproducción de experimentos: la receta documentada (épocas, semillas, learning rate, criterios de parada) permite replicar el ajuste y comparar resultados con otros estudios de unlearning.
- Análisis de seguridad de modelos: las comprobaciones de pérdida en FineWeb-Edu y de K1 retenido ofrecen un marco para medir el deterioro colateral del conocimiento general tras un ajuste agresivo.
- Benchmarking de pipelines de unlearning: el modelo puede actuar como referencia "antes del olvido" en comparaciones con variantes post-unlearning del mismo estudio.
- Estudio de sesgos en respuestas factuales: al evaluar preguntas zero-shot sobre directores, permite analizar cómo el modelo prioriza hechos populares frente a raros y qué tipo de errores comete.

## Benchmarks y rendimiento

Resultados reportados en la model card en la época seleccionada (13). K1 se define como la aparición del nombre completo del director en la respuesta greedy.

| Conjunto | K1 |
|---|---|
| forget_rare_film/train | 0,9416 |
| forget_rare_film/heldout | 0,0000 |
| forget_popular_film/train | 0,9732 |
| forget_popular_film/heldout | 0,0444 |
| retain_film/retain | 0,8388 |

| Métrica adicional | Valor |
|---|---|
| Pérdida en FineWeb-Edu retenido | 2,2808 (modelo instruct: 2,2664) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB de pesos (estimaciones a partir del número de parámetros, no verificadas para este modelo).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S, RTX 6000 Ada; en consumer, RTX 4090 (24 GB) para bf16 con contexto limitado, y RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en bf16 con contexto reducido, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AnniBori/Qwen2.5-7B-Instruct-DUET-film-ft | 7,6 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste de investigación para unlearning; sin benchmarks estándar |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens (dato del modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Asistente general con benchmarks publicados; referencia de pérdida FineWeb-Edu 2,2664 |
| Otros ajustes de unlearning de la familia Qwen2.5-7B | 7,6 B | variable | variable | variable | No disponibles datos concretos en la información proporcionada |

No se dispone de datos de benchmarks comparables para situar este modelo frente a alternativas de la misma categoría más allá del modelo base.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente general: su rendimiento en tareas ajenas al dominio cinematográfico no está evaluado.
- Fuerte sobreajuste al conjunto de entrenamiento: K1 de 0,94-0,97 en hechos de entrenamiento frente a 0,00-0,04 en hechos retenidos, lo que indica escasa generalización a hechos no vistos.
- Riesgo de alucinación en preguntas factuales sobre cine fuera del conjunto de entrenamiento, dado el bajo K1 en conjuntos retenidos.
- Idiomas soportados no documentados; las respuestas se evalúan con etiquetas en inglés, lo que sugiere un sesgo hacia el inglés.
- Longitud de contexto no documentada para este ajuste; el entrenamiento usó longitud máxima de 512 tokens, lo que puede degradar el rendimiento en contextos largos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y de benchmarks estándar desaconseja su uso en producción.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- No se publican pesos cuantizados ni versiones GGUF; la conversión correría a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Qwen2.5-7B-Instruct-DUET-film-ft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning: no disponible en la información proporcionada
- Paper o blog del estudio DUET: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
