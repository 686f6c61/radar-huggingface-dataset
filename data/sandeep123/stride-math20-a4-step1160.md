# sandeep123/stride-math20-a4-step1160

## Resumen

El modelo `sandeep123/stride-math20-a4-step1160` es un ajuste fino del modelo `Qwen/Qwen2.5-Math-1.5B` realizado con el método STRIDE (step-level diversity in RL exploration) sobre el conjunto de datos MATH. Desarrollado por el usuario sandeep123, este checkpoint concreto (paso 1160, alfa 4.0) fue seleccionado como el mejor punto de validación de su rama según la métrica pass@1. El objetivo es mejorar el razonamiento matemático de un modelo ya especializado mediante entrenamiento con refuerzo (RL) usando GRPO y el framework verl.

El modelo base, Qwen2.5-Math-1.5B, es un transformer decoder-only de 1.500 millones de parámetros optimizado para problemas matemáticos. Tras el entrenamiento con STRIDE, el modelo alcanza un pass@1 de 0.7331 y un pass@k (k=6) de 0.9297 en la validación, frente al 0.4805 y 0.8672 del base respectivamente, lo que supone una mejora notable en la resolución de problemas matemáticos. Aunque el conjunto de validación es pequeño (128 prompts × 6 rollouts), los resultados sugieren que la técnica de diversidad a nivel de paso contribuye a una exploración más efectiva durante el entrenamiento por refuerzo.

Este modelo es relevante porque explora cómo la diversidad en los pasos intermedios de razonamiento puede mejorar la robustez y precisión de modelos matemáticos pequeños, un área activa en la investigación de razonamiento automático. Es una contribución a la comunidad open source bajo licencia Apache 2.0, accesible para investigadores y desarrolladores que buscan modelos de razonamiento matemático ligeros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-Math-1.5B, un transformer decoder-only con aproximadamente 1.500 millones de parámetros (el total de 1.777 millones incluye embeddings y cabeceras de clasificación). El entrenamiento se realiza con STRIDE, un método de RL que introduce diversidad a nivel de paso (step-level diversity) en la exploración de razonamiento. Se emplea GRPO (Group Relative Policy Optimization) con el framework `verl`, y se utilizan 6 rollouts por prompt (K=6), un tamaño de lote de 128 y una longitud máxima de respuesta de 1024 tokens. El coeficiente KL en la recompensa es de 0.01 y el entrenamiento dura 20 épocas (~1160 pasos). El dataset de entrenamiento es MATH (lighteval), y la validación se realiza cada 400 pasos.

La innovación técnica principal es el uso de STRIDE, que penaliza la duplicación de aperturas de respuesta para fomentar que el modelo explore diferentes caminos de razonamiento. En este caso, el dataset MATH ya tiene una tasa de duplicación de aperturas base de 0.0%, por lo que la diversidad no es un factor limitante en comparación con otros datasets como ScienceQA (58%). Los resultados de validación muestran una mejora sustancial en pass@1, pasando de 0.4805 a 0.7331, y en pass@k de 0.8672 a 0.9297.

## Capacidades

- Razonamiento matemático: resuelve problemas de aritmética, álgebra, geometría, probabilidad y otros tipos de problemas del dataset MATH.
- Generación de texto matemático: produce explicaciones paso a paso y soluciones formales.
- Razonamiento multi-paso: el entrenamiento con RL refuerza la capacidad de encadenar pasos lógicos.
- Sin soporte explícito de tool calling o function calling (no se menciona en la model card).
- No se indica soporte para agentes ni visión.
- Capacidades multilingües no especificadas; probablemente limitadas al inglés (dataset MATH en inglés).

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar soluciones paso a paso para problemas de nivel escolar, útil en plataformas educativas que requieren explicaciones detalladas.
- Generación de problemas de práctica: dado un tema matemático, el modelo puede crear variaciones de ejercicios con diferentes niveles de dificultad.
- Evaluación de razonamiento en sistemas de QA: como componente de un pipeline que verifica la corrección de respuestas matemáticas generadas por otros modelos.
- Investigación en RL para razonamiento: sirve como referencia para estudiar el impacto de la diversidad de pasos en el entrenamiento de modelos pequeños.
- Prototipado de asistentes matemáticos: con su tamaño reducido, puede desplegarse en entornos con recursos limitados para responder preguntas matemáticas en tiempo real.
- Integración en herramientas de desarrollo: para validar resultados de cálculos o generar documentación de fórmulas.

## Benchmarks y rendimiento

Según la model card, se proporcionan métricas de validación sobre un subconjunto de MATH (128 prompts × 6 rollouts). El error estándar se estima en ±4 puntos, por lo que las comparaciones deben interpretarse con cautela.

| Métrica | Modelo STRIDE (checkpoint 1160) | Modelo base (Qwen2.5-Math-1.5B) |
|---|---|---|
| pass@1 | 0.7331 | 0.4805 |
| pass@k (k=6) | 0.9297 | 0.8672 |

No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo requiere ~3.5 GB de VRAM; en int8, ~1.8 GB; en int4, ~0.9 GB. El tamaño del repositorio (7.1 GB) sugiere que se incluyen varios formatos o checkpoints, pero no se especifica cuantización.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060) puede ejecutar el modelo en FP16. Para mayor velocidad, se recomienda RTX 3090 o superior.
- Cabe en consumer GPU: sí, con cuantización int4/int8 incluso en tarjetas de gama baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers (safetensors).
- Latencia y throughput: no disponible. Al ser un modelo pequeño, se espera una latencia baja en GPU moderna, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

Solo se dispone de comparación con el modelo base, ya que no se han incluido otros modelos en la información. A continuación se muestra la comparativa con el base:

| Modelo | Parámetros | Contexto | pass@1 (MATH) | pass@k (k=6) | Licencia |
|---|---|---|---|---|---|
| `step-math20-a4-step1160` (STRIDE) | 1.777 M | No disponible | 0.7331 | 0.9297 | Apache 2.0 |
| Qwen2.5-Math-1.5B (base) | 1.5B | No disponible | 0.4805 | 0.8672 | Apache 2.0 |

No se han encontrado otros modelos comparables con información pública en los datos proporcionados.

## Limitaciones y advertencias

- Tamaño pequeño: con 1.5B de parámetros, el modelo puede fallar en problemas matemáticos muy complejos o en razonamiento de largo alcance.
- Alucinaciones: como todos los modelos de lenguaje, puede producir soluciones incorrectas con alta confianza, especialmente en problemas no vistos.
- Limitación de idioma: no se especifica soporte multilingüe; probablemente esté entrenado mayoritariamente en inglés (dataset MATH).
- Conjunto de validación reducido: los resultados tienen un error estándar de ±4 puntos, por lo que no son estadísticamente concluyentes para comparaciones de ramas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y las condiciones de la licencia.
- Riesgo en producción: antes de desplegarlo en aplicaciones críticas, se recomienda evaluar su precisión en el dominio específico y añadir capas de verificación de respuestas matemáticas.

## Enlaces

- Hugging Face: [sandeep123/stride-math20-a4-step1160](https://huggingface.co/sandeep123/stride-math20-a4-step1160)

No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
