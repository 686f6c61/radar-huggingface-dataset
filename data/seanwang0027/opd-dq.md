# SeanWang0027/OPD-dq

## Resumen

OPD-dq es un repositorio de Hugging Face creado por SeanWang0027 que archiva los checkpoints completos de un experimento de destilación on-policy (OPD) sobre un modelo base de 1.700 millones de parámetros, presumiblemente Qwen3-1.7B. La destilación on-policy es una técnica de entrenamiento en la que el modelo estudiante muestrea sus propias trayectorias durante el entrenamiento y un modelo profesor (en este caso, versiones de 4B y 32B) proporciona supervisión token a token sobre esas muestras. El repositorio documenta múltiples líneas experimentales con diferentes configuraciones (dtype fp32/bf16, mini_batch, learning rate, profesor) y reporta métricas de evaluación RLVE sobre un conjunto de razonamiento matemático de 16k muestras con n=8.

A pesar de que la model card describe un conjunto amplio de checkpoints, el tamaño del repositorio es de 0.0 GB, lo que indica que los pesos no están realmente disponibles para descarga. El interés del repositorio es principalmente metodológico: sirve como registro de un estudio comparativo de variantes de OPD, incluyendo la influencia de la precisión numérica (fp32 vs bf16) y del profesor utilizado. La licencia Apache 2.0 permite su uso y modificación, aunque sin pesos accesibles su aplicabilidad práctica es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-1.7B, segun la model card) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan checkpoints fp32 y bf16, no cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun checkpoints HF mencionados, aunque el repo esta vacio) |

## Arquitectura y entrenamiento

La model card describe un experimento de destilación on-policy (OPD) implementado sobre el framework verl. El modelo estudiante es un Qwen3-1.7B (en variantes base e instruct) y los profesores son modelos de 4B (con thinking) y 32B. El entrenamiento sigue el paradigma OPD: el estudiante genera sus propias trayectorias y el profesor proporciona supervisión por token sobre esas muestras. Se utilizó RLVE (Reinforcement Learning with Verifiable Rewards) como método de evaluación, con un conjunto de 16k problemas y n=8 muestras por problema.

Se compararon dos precisiones numéricas: fp32 (línea principal, con resultados superiores) y bf16 (línea oficial). También se variaron el mini_batch (16 vs otros), el learning rate (1e-5, 1e-6) y el profesor (4B thinking vs 32B). El repositorio incluye además una variante de OPD aplicada sobre DAPO (non-thinking) y una línea con R1-Distill-1.5B como estudiante. No se proporcionan detalles sobre el dataset de entrenamiento, el número total de tokens ni el uso de RLHF o DPO.

## Capacidades

- Razonamiento matemático: el modelo está evaluado en problemas de razonamiento (RLVE con 16k problemas), mostrando mejoras en avg@8 y pass@8 respecto a la línea base sin entrenar.
- Generación de texto con modo thinking: las líneas principales usan un profesor con thinking, lo que sugiere que el estudiante aprende a generar cadenas de razonamiento antes de responder.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo thinking implica razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Otras capacidades (visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio documenta configuraciones exactas (lr, mini_batch, dtype, pasos) que permiten a otros investigadores replicar los resultados de OPD sobre Qwen3-1.7B y comparar variantes.
- Estudio del efecto de la precisión numérica en destilación: la comparación fp32 vs bf16 con idénticos hiperparámetros permite aislar el impacto del dtype en la calidad del modelo destilado.
- Análisis de la influencia del profesor: las líneas con profesor 4B y 32B permiten estudiar cómo el tamaño del profesor afecta a la destilación on-policy.
- Benchmarking de frameworks de RL: el uso de verl y la integración con scripts de lanzamiento (run_opd_baseline.sh, run_opd_official.sh) sirven como referencia para implementar OPD en otros entornos.
- Comparación con ROSE: el repositorio incluye una línea ROSE (rose-bundle-0808) que permite contrastar ambos métodos de destilación bajo las mismas condiciones.
- Desarrollo de pipelines de destilación: los scripts y la estructura de checkpoints (HF + FSDP) pueden reutilizarse como plantilla para nuevos experimentos de destilación on-policy.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación RLVE (16k, n=8) para varias líneas experimentales. Se presentan los datos tal como aparecen en la fuente:

| Linea | avg@8 | pass@8 | Problemas resueltos |
|---|---|---|---|
| Base sin entrenar | 0.0333 | 0.1111 | 20 |
| OPD oficial bf16 (140 pasos) | 0.0458 | 0.1444 | 26 |
| OPD bf16 mini16 (140 pasos) | 0.0556 | 0.1722 | 31 |
| OPD fp32 (105 pasos) | 0.0694 | 0.1833 | 33 |
| OPD fp32 (132 pasos) | 0.0667 | 0.1833 | 33 |
| ROSE oficial (140 pasos) | 0.0701 | 0.1778 | 32 |
| Teacher-SFT n4 bs256 | 0.0556 | 0.1500 | 27 |

No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación del repositorio. Dado que el modelo base tiene 1.700 millones de parámetros, una estimación general (sin datos confirmados) sería:

- VRAM estimada para inferencia: aproximadamente 4-6 GB en fp16, menos en cuantizaciones de 4 bits (no confirmado).
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) podría ser suficiente para inferencia, pero no hay datos oficiales.
- Entrenamiento: los checkpoints FSDP sugieren entrenamiento multi-GPU, probablemente con GPUs de datacenter (A100, H100), pero no se especifica.
- Opciones de despliegue: al ser un repositorio de investigación sin pesos accesibles, no se documentan opciones de despliegue (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría. El repositorio se centra en un experimento específico de destilación on-policy y no incluye comparaciones con otros modelos destilados de tamaño similar (p. ej., otros Qwen3-1.7B destilados, DeepSeek-R1-Distill-1.5B, etc.). La única referencia comparable dentro del propio repositorio es la línea ROSE, que se evalúa en las mismas condiciones.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB, lo que indica que los checkpoints descritos en la model card no están realmente disponibles para descarga. Cualquier intento de uso práctico del modelo fallará.
- Las fechas de creación y actualización (2026-08-25) son futuras respecto a la fecha actual, lo que sugiere que el repositorio puede ser un artefacto de prueba o un error de metadatos.
- La model card está escrita en chino y describe un experimento de investigación muy específico; no es un modelo listo para producción ni tiene una documentación orientada a usuarios finales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto/idioma.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos accesibles, esta licencia es irrelevante en la práctica.
- Los resultados de RLVE provienen de una única configuración de evaluación (16k, n=8) y no deben generalizarse a otros dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SeanWang0027/OPD-dq
- Repositorio de scripts de destilación RLVE: https://huggingface.co/SeanWang0027/rlve-distill-scripts
- Repositorio oficial OPD (línea de referencia): https://huggingface.co/SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking-7168
- Lista AwesomeOPD (recursos sobre destilación on-policy): https://github.com/thinkwee/AwesomeOPD
- Framework Lightning-OPD: https://github.com/jet-ai-projects/Lightning-OPD
