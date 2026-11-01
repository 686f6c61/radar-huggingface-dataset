# leizhao7/Qwen3-4B-OPD-Qwen3-14B-Step200

## Resumen

Qwen3-4B-OPD-Qwen3-14B-Step200 es un checkpoint de investigación publicado por Lei Zhao (usuario `leizhao7`) que consiste en un estudiante Qwen3-4B destilado a partir del profesor Qwen3-14B mediante destilación on-policy (OPD, *on-policy distillation*). El modelo parte de los pesos de Qwen/Qwen3-4B y aplica 200 actualizaciones de OPD con un objetivo de KL inversa aproximada sobre los 16 tokens más probables del estudiante. No es un modelo de propósito general, sino un artefacto reproducible del artículo *Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals* (arXiv:2610.11247).

El interés técnico reside en que documenta un caso de rendimiento marginal: la precisión media macro en tres benchmarks de código pasa del 52,69 % del estudiante inicial al 53,44 % tras 200 actualizaciones, una mejora de solo 0,75 puntos porcentuales. El paper analiza precisamente por qué la señal de aprendizaje se desvanece en este régimen. El checkpoint conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3-4B, con 4.411.424.256 parámetros en formato safetensors y licencia Apache-2.0.

Es relevante ahora porque sirve como referencia empírica para quien investigue destilación on-policy, colapso de señal en KL inversa o recetas de destilación de profesor grande a estudiante pequeño. No está pensado para despliegue en producción ni para uso comercial como modelo generalista, y el propio autor lo enmarca como checkpoint de investigación con una única ejecución por condición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), derivada de Qwen/Qwen3-4B |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contexto largo, pero la ficha no lo confirma) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B original: un transformer decoder-only denso con 4.411.424.256 parámetros. El proceso de destilación no modifica la topología, solo los pesos. El entrenamiento usa un objetivo de KL inversa on-policy aproximado con los 16 tokens de mayor probabilidad del estudiante, ponderación por probabilidad del estudiante y media global sobre los tokens de respuesta válidos. Las respuestas generadas por el estudiante proporcionan los prefijos sobre los que el profesor fijo (Qwen3-14B) emite supervisión.

Los datos de entrenamiento son el subconjunto de código de `PRIME-RL/Eurus-2-RL-Data`. La configuración registrada incluye optimizador AdamW con tasa de aprendizaje 1e-6 y schedule constante, batch de 64 prompts con 1 rollout por prompt, máximo de 2048 tokens de prompt y 16384 de respuesta, temperatura de muestreo 1.0 y plantilla de chat de Qwen3 en modo no-thinking (`enable_thinking=False`). Se ejecutan 200 actualizaciones. La pérdida top-16 registrada al final es 0.10064545, un 25,9 % menos que en la actualización 1, aunque el autor advierte que ese valor no equivale a la KL de vocabulario completo.

## Capacidades

- Generación de texto y de código en inglés, heredadas del estudiante Qwen3-4B y reforzadas con el subconjunto de código de Eurus-2-RL-Data.
- Razonamiento de código orientado a benchmarks tipo HumanEval+, MBPP+ y LiveCodeBench.
- Modo no-thinking por defecto en la plantilla de chat (`enable_thinking=False`); no se documenta el modo thinking en este checkpoint.
- Compatibilidad con `text-generation-inference` y endpoints compatibles, segun los tags del repositorio.
- Soporte de `AutoModelForCausalLM` y `AutoTokenizer` en Transformers 4.56.2 o superior.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.
- Multilingüismo: limitado a inglés segun la model card.
- Visión y audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de destilación on-policy: cargar el checkpoint y comparar la pérdida top-16 y la precisión avg@4 frente al estudiante inicial Qwen3-4B, usando la receta `code_14b` y el repositorio de código del autor para replicar las 200 actualizaciones.
- Estudio del desvanecimiento de señal en KL inversa: usar el par estudiante inicial / estudiante step-200 como referencia para medir cuánto se reduce la señal de aprendizaje bajo distintos hiperparámetros (temperatura, top-k, ponderación).
- Evaluación comparativa de recetas de destilación: enfrentar este checkpoint contra otras variantes de destilación sobre Qwen3-4B en HumanEval+, MBPP+ y LiveCodeBench con el protocolo avg@4 documentado.
- Generación de código asistida en inglés para prototipos: el modelo puede completar funciones Python sencillas (el ejemplo de la model card pide una función que devuelva elementos únicos preservando orden), adecuado para entornos de investigación, no para producción crítica.
- Docencia y formación en técnicas de destilación: servir como ejemplo tangible de cómo un profesor de 14B transfiere conocimiento a un estudiante de 4B con una mejora modesta y medible.
- Base para fine-tuning posterior: al conservar la arquitectura y el tokenizador de Qwen3-4B, puede actuar como punto de partida para experimentos de ajuste adicionales que comparen el efecto de la inicialización destilada frente a la original.

## Benchmarks y rendimiento

Resultados archivados del paper, precisión avg@4 (%) con temperatura 1.0, top-p 1.0 y máximo de 16384 tokens de respuesta. No es pass@k.

| Benchmark | Estudiante inicial | Step-200 |
|---|---:|---:|
| HumanEval+ | no disponible por benchmark | 79.27 |
| MBPP+ | no disponible por benchmark | 65.41 |
| LiveCodeBench | no disponible por benchmark | 15.65 |
| Media macro | 52.69 | 53.44 |

La mejora agregada es de +0,75 puntos porcentuales. El autor advierte que son métricas archivadas de la ejecución del paper y que el checkpoint exportado no se ha reevaluado de forma independiente durante el empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,8 GB solo para pesos (el repositorio ocupa 8,8 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos, más overhead. No se publican pesos cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para evaluación a contexto largo (16384 tokens de respuesta); RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB; no se documentan pruebas oficiales en estas configuraciones.
- Opciones de despliegue: Transformers 4.56.2 o superior con PyTorch y Accelerate; compatible con `text-generation-inference` segun los tags. No se documenta soporte oficial de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-OPD-Qwen3-14B-Step200 | 4.411.424.256 | no disponible | Apache-2.0 | Destilación OPD desde Qwen3-14B, subconjunto de código | HuggingFace, 182 descargas |
| Qwen/Qwen3-4B (estudiante inicial) | ~4,4 B | no disponible en esta ficha | Apache-2.0 | Modelo base de propósito general | HuggingFace, ampliamente disponible |
| Qwen/Qwen3-14B (profesor) | ~14 B | no disponible en esta ficha | Apache-2.0 | Modelo mayor usado como profesor fijo | HuggingFace, ampliamente disponible |

La comparación directa con otros modelos destilados de 4B no está disponible en la información proporcionada. Frente a su estudiante inicial, la diferencia medida es de +0,75 puntos porcentuales en la media macro de tres benchmarks de código.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe explícitamente como artefacto para reproducir y estudiar OPD, no como modelo de propósito general.
- Una sola ejecución por condición y horizonte fijo de 200 actualizaciones; los resultados no establecen comportamiento general, seguridad ni persistencia de la meseta de pérdida en otras configuraciones.
- Mejora marginal: +0,75 puntos porcentuales en la media macro, con LiveCodeBench en 15,65 %, un valor bajo en términos absolutos.
- El checkpoint exportado no se ha reevaluado de forma independiente durante el empaquetado; las métricas son las archivadas del paper.
- La pérdida top-16 registrada no equivale a la KL de vocabulario completo, por lo que no debe interpretarse como medida directa de la calidad de la destilación.
- Solo inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación y de código incorrecto heredado del estudiante Qwen3-4B, segun advierte el propio autor.
- No se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache-2.0: permite uso comercial, pero debe preservarse la atribución upstream de Qwen y declararse que los pesos fueron modificados por 200 actualizaciones de OPD. La licencia MIT del repositorio de código es independiente de la del modelo.
- No se incluyen los pesos del profesor; el repositorio de Qwen3-14B se enlaza solo por atribución y reproducibilidad.
- Las revisiones upstream usadas en el entrenamiento no son recuperables a partir de la release numérica pública.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leizhao7/Qwen3-4B-OPD-Qwen3-14B-Step200
- Paper: https://arxiv.org/abs/2610.11247
- Página del proyecto: https://leizhao7.github.io/opd-learning-signals/
- Código y resultados numéricos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Modelo base (estudiante inicial): https://huggingface.co/Qwen/Qwen3-4B
- Profesor (referencia pública): https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/PRIME-RL/Eurus-2-RL-Data
