# logan7000/mllm-open-r1-gt-gemma3-4b-mmupt-full

## Resumen

El modelo `logan7000/mllm-open-r1-gt-gemma3-4b-mmupt-full` es un fine-tuning del modelo base Gemma-3-4B-it, desarrollado por el usuario logan7000, que aplica la receta de entrenamiento mmupt (variante Gemma) dentro del marco OpenR1. El objetivo es mejorar las capacidades de razonamiento matemático multimodal, es decir, la resolución de problemas que combinan texto e imágenes, mediante técnicas de aprendizaje por refuerzo (RL) como GRPO y BNPO. El modelo se entrenó durante una época en hardware A100 de la Universidad Johns Hopkins, con un protocolo de evaluación específico que utiliza un juez Qwen2.5-32B para verificar respuestas.

Este modelo es relevante porque explora metodologías de RL para modelos multimodales de tamaño medio (4B parámetros), un área de investigación activa en la comunidad open source. Al estar basado en Gemma-3-4B, hereda la arquitectura transformer densa de Google, aunque no se especifican detalles sobre la longitud de contexto final ni la licencia. El repositorio contiene pesos en formato safetensors con un tamaño de 17.2 GB, lo que sugiere que se distribuyen en precisión BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma-3-4B-it) |
| Parametros totales | 4B (aproximado, según el modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; evaluación a 16k tokens |
| Tipos de cuantizacion | No disponible (repo solo con safetensors BF16) |
| Idiomas soportados | No disponible (Gemma-3 soporta multiples idiomas, pero este fine-tuning no lo especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-3-4B-it, un transformer denso de 4B parámetros desarrollado por Google. El fine-tuning utiliza la receta mmupt (variante Gemma), que incluye hiperparámetros como beta 0.01, K 10, temperatura 1.0, cap 1024, learning rate 1e-6, weight decay 0.01, max_grad_norm 1.0, y una estrategia de escalado de recompensas por grupo. Se emplea un tamaño de lote efectivo de 120 (12 prompts por paso). El entrenamiento se realizó en GPUs A100 de JHU durante una época, con checkpoint final en el paso 640. El protocolo de evaluación (v2) usa temperatura 0, contexto de 16k tokens, prompt con "boxed" y un juez basado en reglas más Qwen2.5-32B para verificar las respuestas. No se detallan los datos de entrenamiento ni el número total de tokens utilizados.

## Capacidades

- Razonamiento matematico multimodal: el modelo está entrenado para resolver problemas que combinan texto e imágenes, como los del benchmark MathVista.
- Generacion de texto y razonamiento paso a paso: hereda las capacidades de Gemma-3-4B-it para generar explicaciones y cadenas de razonamiento.
- Soporte de tool calling: no se menciona en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se menciona explicitamente, aunque el entrenamiento con RL puede favorecer el razonamiento encadenado.
- Capacidades multilingues: no confirmadas para este fine-tuning especifico.
- Capacidades especiales: el modelo es multimodal (procesa imagenes y texto), aunque no se detalla el adaptador de vision utilizado.

## Casos de uso

- Investigacion en RL para modelos multimodales: sirve como punto de partida para estudiar el efecto de recetas como mmupt en el razonamiento matematico con imagenes.
- Resolucion de problemas matematicos con soporte visual: puede utilizarse en entornos educativos para resolver ejercicios que incluyan diagramas, graficas o formulas escritas a mano.
- Evaluacion de tecnicas de optimizacion: al estar entrenado con BNPO y GRPO, permite comparar estas estrategias frente a otros fine-tunings en tareas de razonamiento.
- Fine-tuning adicional para tareas especificas: los pesos pueden servir como base para adaptar el modelo a dominios concretos (por ejemplo, documentos cientificos con ecuaciones).
- Prototipado de asistentes de estudio: integrable en aplicaciones que necesiten explicar pasos de resolucion de problemas matematicos con imagenes.
- Benchmarking de modelos de razonamiento: util para medir el impacto del entrenamiento con RL en modelos de 4B frente a alternativas de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se utilizo MathVista-150 como conjunto de validacion para seleccionar el mejor checkpoint (paso 580), pero no se proporcionan metricas numericas. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4B parametros en BF16, lo que requiere aproximadamente 8 GB de VRAM solo para los pesos. El repositorio ocupa 17.2 GB, posiblemente por incluir checkpoints adicionales o archivos de entrenamiento.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) es suficiente para inferencia en BF16. Con cuantizacion a 8 bits o 4 bits, podria caber en GPUs de 8-12 GB, pero no se proporcionan cuantizaciones oficiales.
- Compatibilidad con consumer GPU: si, una RTX 3090 o 4090 puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se especifican configuraciones de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| logan7000/mllm-open-r1-gt-gemma3-4b-mmupt-full | 4B | No especificado | No disponible | HuggingFace |
| Gemma-3-4B-it (base) | 4B | 128k (segun documentacion) | Gemma Terms of Use | HuggingFace |
| logan7000/mllm-open-r1-gt-gemma3-4b-full-end-s961 | 4B (aprox.) | No especificado | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo. El modelo base Gemma-3-4B-it es la referencia natural, pero este fine-tuning se centra en razonamiento matematico multimodal, por lo que la comparacion directa no es posible sin benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado informacion sobre sesgos; al derivar de Gemma-3, puede heredar sesgos del modelo base.
- Riesgo de alucinacion: el entrenamiento con RL puede aumentar la confianza en respuestas incorrectas, especialmente en problemas matematicos complejos.
- Limitaciones de contexto: la evaluacion se realizo a 16k tokens, pero no se confirma si el modelo mantiene la ventana de 128k del base.
- Restricciones de licencia: la licencia no esta especificada, lo que impide determinar si es apto para uso comercial.
- Caveat para produccion: al ser un modelo de investigacion con 0 descargas y sin documentacion adicional, no se recomienda su uso en entornos criticos sin validacion previa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/logan7000/mllm-open-r1-gt-gemma3-4b-mmupt-full
- Modelo relacionado (mismo autor, variante end-s961): https://huggingface.co/logan7000/mllm-open-r1-gt-gemma3-4b-full-end-s961
- Documentacion de Gemma 4 (no directamente relacionada, pero contexto de la familia): https://deepmind.google/models/gemma/gemma-4/
