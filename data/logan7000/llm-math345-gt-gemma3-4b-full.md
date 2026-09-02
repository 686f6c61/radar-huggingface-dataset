# logan7000/llm-math345-gt-gemma3-4b-full

## Resumen

El modelo `logan7000/llm-math345-gt-gemma3-4b-full` es un fine-tune del modelo base Gemma-3-4B-it de Google, entrenado mediante GRPO (Group Relative Policy Optimization) sobre el dataset MATH345, centrado en razonamiento matemático. Lo desarrolla Logan Yang (logan7000) como parte de una serie de experimentos de investigación sobre técnicas de RL para modelos de lenguaje. El repositorio contiene dos recetas de entrenamiento completas: una con pérdida DAPO (run1) y otra con pérdida BNPO (run2), ambas con 136 pasos (1 época), 128 prompts por actualización, K=12 muestras por prompt, beta=0 (sin penalización KL) y una recompensa basada en la respuesta correcta (ground-truth answer).

El autor indica explícitamente que Gemma no se utilizó en el lineup final de tres agentes de su proyecto, sino como experimento de control para evaluar la sensibilidad a la función de pérdida y la entrenabilidad del modelo. La relevancia de este modelo reside en su valor como caso de estudio comparativo entre DAPO y BNPO en un modelo de 4B parámetros, más que como un modelo listo para producción. El repositorio incluye 28 checkpoints de pesos completos (14 por run) y ocupa 240.8 GB, lo que refleja la naturaleza experimental y exhaustiva del trabajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma-3-4B-it) |
| Parametros totales | 4B (aproximado, no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Gemma-3-4B-it soporta 128k tokens |
| Tipos de cuantizacion | No disponible; pesos almacenados en BF16 |
| Idiomas soportados | No disponible en la model card; el modelo base es multilingue |
| Licencia | No disponible (el modelo base Gemma-3-4B-it usa Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-3-4B-it, un transformer decoder-only con atención de ventana deslizante y atención global, según la arquitectura de la familia Gemma 3. No se proporcionan detalles adicionales sobre modificaciones arquitectónicas en la model card. El entrenamiento se realizó con GRPO, una variante de RL que optimiza directamente la recompensa sin necesidad de un modelo de crítico. Se aplicaron dos funciones de pérdida distintas: DAPO (run1) y BNPO (run2), ambas con los mismos hiperparámetros: 136 pasos (1 época), 128 prompts por actualización, K=12 muestras por prompt, beta=0 (sin término KL) y learning rate de 3e-6. La recompensa se calculó comparando la respuesta generada con la respuesta correcta del dataset MATH345.

El run2 (canónico) incluyó evaluación cada 10 pasos; el mejor checkpoint por validación fue el paso 10 con una recompensa de evaluación de 0.748, mientras que la recompensa decayó de 0.76 en el paso 0 a 0.726 en el paso 130. El run1 no tuvo evaluación durante el entrenamiento. No se subieron los estados del optimizador, solo los pesos. Los checkpoints se guardaron en formato safetensors con precisión BF16.

## Capacidades

- Razonamiento matemático: entrenado específicamente en el dataset MATH345, que contiene problemas de matemáticas de nivel variado. El modelo puede generar soluciones paso a paso.
- Generación de texto: hereda las capacidades del modelo base Gemma-3-4B-it, incluyendo generación de texto general, aunque el fine-tune se centra en matemáticas.
- No se especifican en la model card capacidades de tool calling, agentes, visión o audio. El modelo base Gemma-3-4B-it soporta visión y function calling, pero no se confirma que este fine-tune las conserve o las haya optimizado.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones detalladas y soluciones para problemas de nivel MATH345, útil en plataformas educativas que necesitan respuestas razonadas.
- Investigación en RL para LLMs: sirve como referencia para comparar el efecto de DAPO vs BNPO en un modelo de 4B, permitiendo a otros investigadores reproducir o extender los experimentos.
- Generación de datos sintéticos de razonamiento matemático: puede usarse para crear conjuntos de datos de entrenamiento con soluciones paso a paso, alimentando otros modelos.
- Evaluación de entrenabilidad de Gemma-3-4B: el repositorio documenta la evolución de la recompensa durante el entrenamiento, útil para estudiar la estabilidad de GRPO en modelos pequeños.
- Benchmarking de técnicas de alineación: permite comparar el rendimiento de diferentes funciones de pérdida en un entorno controlado con recompensa binaria.
- Integración en pipelines de razonamiento simbólico: combinado con herramientas externas (calculadoras, solvers), puede abordar problemas que requieren verificación numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, GSM8K, HumanEval, etc.) en la información disponible. La única métrica reportada es la recompensa de evaluación durante el entrenamiento del run2: 0.748 en el paso 10, con una tendencia decreciente hasta 0.726 en el paso 130. No hay comparación con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4B parámetros en BF16, lo que requiere aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. Con cuantización a 4 bits (si se aplica), podría reducirse a unos 4-5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, L4, o cualquier GPU con al menos 8-12 GB de VRAM. Cabe en GPUs de consumo como la RTX 4060 Ti 16GB o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama, Hugging Face TGI. No hay datos de latencia o throughput publicados.
- Para entrenamiento o fine-tuning adicional, se necesitaría una GPU con mayor VRAM (24 GB o más) o técnicas de offloading.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo frente a alternativas. A continuación se comparan las características base de modelos de tamaño similar que podrían usarse para tareas de razonamiento matemático:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| logan7000/llm-math345-gt-gemma3-4b-full | 4B | No disponible (base 128k) | No disponible | Fine-tune experimental con GRPO |
| Qwen2.5-3B-Instruct | 3B | 32k | Apache 2.0 | Modelo instructivo general, buen rendimiento en matemáticas |
| Llama-3.2-3B-Instruct | 3B | 128k | Llama 3.2 Community License | Modelo instructivo multilingue |
| Phi-4-mini | 3.8B | 128k | MIT | Optimizado para razonamiento y matemáticas |

No hay benchmarks comparativos publicados para este modelo, por lo que la comparación se limita a especificaciones generales.

## Limitaciones y advertencias

- Modelo experimental: no está optimizado para producción; el autor lo presenta como un experimento de control, no como un modelo final.
- Licencia no especificada: el autor no indica licencia en la model card. El modelo base Gemma-3-4B-it está sujeto a la Gemma Terms of Use, que permite uso comercial con ciertas restricciones (por ejemplo, no usar para fines maliciosos). Se debe verificar la licencia antes de cualquier uso comercial.
- Sobreajuste potencial: el entrenamiento con recompensa binaria sobre un dataset fijo (MATH345) puede llevar a sobreajuste, como sugiere la caída de la recompensa de evaluación durante el entrenamiento.
- Sesgos y alucinaciones: no se han evaluado sesgos específicos ni tasas de alucinación. Al ser un fine-tune de un modelo base, puede heredar sesgos de Gemma-3-4B-it.
- Contexto y multilingüismo: no se confirma si el fine-tune mantiene la longitud de contexto completa de 128k ni las capacidades multilingües del modelo base.
- Reproducibilidad: los estados del optimizador no están disponibles, lo que limita la reproducción exacta del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/logan7000/llm-math345-gt-gemma3-4b-full
- Perfil del autor: https://huggingface.co/logan7000
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
