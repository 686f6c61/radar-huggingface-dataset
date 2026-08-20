# agentic-ptb/dpsk-v4-flash.h036.sft3.step_450

## Resumen
Este repositorio aloja un checkpoint intermedio del barrido de entrenamiento (sweep) del proyecto AgentPTB, identificado como `dpsk-v4-flash.h036.sft3.step_450`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` con aproximadamente 9,4 mil millones de parámetros, realizado en el paso 450 de una fase de supervisión de ajuste fino (SFT3). El "driver" del experimento es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento configurado en `thinking`, lo que sugiere que el entrenamiento está orientado a potenciar capacidades de razonamiento explícito.

La relevancia de este artefacto es principalmente investigadora: no es un modelo final listo para producción, sino un punto intermedio de una trayectoria de entrenamiento. Su interés radica en permitir el estudio de la dinámica de aprendizaje, la continuidad del entrenamiento o la evaluación de checkpoints intermedios. Es crucial advertir que la model card indica una anomalía grave: el `eos_token_id` está incompleto (falta el token 248046), lo que puede provocar comportamientos de generación incorrectos si se utiliza directamente.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (heredado del base, sin dato publicado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponibles (heredado del base, sin dato publicado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se construye sobre la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. El entrenamiento corresponde a un barrido (sweep) del proyecto AgentPTB, donde el "driver" es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento fijado en `thinking`. El checkpoint corresponde al paso 450 de la fase SFT3 (supervised fine-tuning, tercera iteración). No se proporcionan detalles sobre el dataset utilizado, el número total de tokens de entrenamiento ni si se aplicaron técnicas posteriores como RLHF o DPO. La model card indica que el checkpoint fue podado del almacenamiento principal (PVC) y recuperado desde una copia de seguridad (`msr-spare`), lo que sugiere que es un artefacto de respaldo.

## Capacidades
- Generación de texto y razonamiento: hereda las capacidades base de Qwen3.5-9B-Base, que incluyen generación de texto, razonamiento lógico y comprensión de instrucciones.
- Razonamiento explícito: el tag `thinking` en la configuración del driver sugiere que el entrenamiento está orientado a producir respuestas con razonamiento paso a paso, aunque no hay evidencia publicada de evaluación específica.
- Soporte de tool calling y agentes: no disponible en la información proporcionada, aunque el modelo base Qwen3.5 podría soportarlo, no se confirma para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso
- Investigación de dinámicas de entrenamiento: permite analizar cómo evoluciona el modelo a lo largo del barrido, comparando este paso 450 con otros checkpoints intermedios para estudiar la convergencia o el overfitting.
- Continuación del entrenamiento: puede servir como punto de partida para reanudar el fine-tuning desde un estado intermedio, evitando reiniciar el proceso desde cero.
- Evaluación de trayectorias de razonamiento: al estar configurado con esfuerzo `thinking`, puede usarse para estudiar cómo se desarrolla la capacidad de razonamiento explícito en modelos de 9B durante el SFT.
- Análisis de robustez de tokenización: la anomalía en el `eos_token_id` lo convierte en un caso de estudio para investigar el impacto de tokens de fin de secuencia incompletos en la generación.
- Reproducción de experimentos: útil para equipos que quieran replicar el pipeline de AgentPTB y verificar la reproducibilidad de los resultados intermedios.
- Benchmarking de checkpoints intermedios: permite medir el rendimiento en tareas específicas en diferentes pasos de entrenamiento para decidir el punto óptimo de detención (early stopping).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 18,8 GB, lo que corresponde aproximadamente al peso del modelo en BF16/FP16. Se necesitan al menos 20 GB de VRAM para cargar el modelo sin cuantización.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en BF16. Para GPUs con 16 GB (como RTX 4080 o A100 40GB), sería necesario cuantizar a 8 bits o 4 bits, aunque no se proporcionan archivos GGUF ni AWQ en el repositorio.
- Si cabe en consumer GPU: sí, en GPUs de 24 GB con precisión BF16. En GPUs de 16 GB solo si se genera una cuantización propia.
- Opciones de despliegue: al ser un checkpoint intermedio sin cuantizaciones, el despliegue directo es limitado. Se podría usar con vLLM o TGI si se convierte a un formato compatible, o con llama.cpp si se genera un GGUF manualmente. No hay soporte nativo de Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agentic-ptb/dpsk-v4-flash.h036.sft3.step_450` | 9,4B | no disponible | no disponible | Checkpoint intermedio, sin cuantizaciones |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible (típicamente 32K o más en Qwen3) | Apache 2.0 (típico en Qwen) | Modelo base oficial, ampliamente disponible |
| `Qwen/Qwen3.5-9B-Instruct` | 9,4B | no disponible | Apache 2.0 (típico) | Modelo instructivo oficial, listo para uso |

La comparativa se limita al modelo base y su variante instructiva, ya que no hay datos de rendimiento publicados para este checkpoint. La principal diferencia es que este artefacto es un paso intermedio de un barrido experimental, con una anomalía conocida en el token EOS, lo que lo hace inadecuado para uso directo frente a los modelos oficiales de Qwen.

## Limitaciones y advertencias
- Anomalía crítica en el token EOS: la model card indica que `eos_token_id` es `[248044]` y falta el token `248046`. Esto puede provocar que el modelo no termine las secuencias correctamente o genere tokens no deseados al final de la respuesta.
- Checkpoint intermedio: no es un modelo final. No ha pasado por fases de alineación completas (RLHF/DPO) ni por evaluación exhaustiva, por lo que su calidad y seguridad no están garantizadas.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- Sesgos y alucinaciones: al ser un fine-tuning intermedio de un modelo base, puede presentar sesgos heredados y un riesgo elevado de alucinación, especialmente en dominios no cubiertos por el dataset de entrenamiento.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede comparar objetivamente con otros modelos.
- Idiomas y contexto no documentados: no se especifican los idiomas soportados ni la longitud de contexto efectiva, lo que añade incertidumbre para su uso en producción.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h036.sft3.step_450
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado papers, blogs o demos adicionales asociados a este checkpoint específico.
