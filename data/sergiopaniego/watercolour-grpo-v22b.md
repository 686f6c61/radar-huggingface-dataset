# sergiopaniego/watercolour-grpo-v22b

## Resumen

`watercolour-grpo-v22b` es un ajuste fino del modelo base [Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B), desarrollado por Sergio Paniego, Machine Learning Engineer en Hugging Face. El modelo se ha entrenado mediante el método GRPO (Group Relative Policy Optimization), introducido en el artículo *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models* (arXiv:2402.03300), y utilizando la librería TRL de Hugging Face.

El repositorio tiene un tamaño de 0,3 GB, lo que sugiere que contiene un adaptador (tipo LoRA) en lugar de los pesos completos del modelo base. El modelo base es un transformer MoE con 35 mil millones de parámetros totales y 3 mil millones activos (según la nomenclatura `35B-A3B`), aunque no se dispone de confirmación explícita de su arquitectura en la documentación del adaptador.

Este modelo es relevante porque demuestra la aplicación de técnicas de optimización por refuerzo (GRPO) sobre un modelo MoE de gran tamaño, un enfoque cada vez más utilizado para mejorar el razonamiento matemático y lógico. Sin embargo, al tratarse de un adaptador recién publicado (sin descargas ni valoraciones), su rendimiento y estabilidad no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen/Qwen3.5-35B-A3B) |
| Parametros totales | 35.000 millones (modelo base) |
| Parametros activos | 3.000 millones (modelo base, segun nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador entrenado sobre Qwen/Qwen3.5-35B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) según indica su nombre (35B totales, 3B activos por token). No se han publicado cambios en la arquitectura del modelo base; el adaptador solo añade pesos adicionales que modifican el comportamiento del modelo original.

El entrenamiento se realizó con GRPO, una variante de optimización por refuerzo que agrupa múltiples respuestas generadas por el modelo para estimar ventajas relativas, sin necesidad de un modelo crítico separado. Este método, descrito en el paper de DeepSeekMath, se ha mostrado eficaz para mejorar el razonamiento matemático y la coherencia lógica. Los detalles del conjunto de datos de entrenamiento, el número de pasos y los hiperparámetros no están documentados en la model card.

## Capacidades

Dado que no se ha publicado ninguna descripción de capacidades específicas del adaptador, las siguientes se infieren del modelo base Qwen3.5-35B-A3B, sin confirmación de que el ajuste fino las preserve o modifique:

- Generación de texto y conversación en lenguaje natural.
- Razonamiento matemático y lógico (potencialmente mejorado por el entrenamiento GRPO).
- Comprensión y generación de código (capacidad típica de la familia Qwen).
- Soporte multilingüe (el modelo base Qwen3.5 suele cubrir múltiples idiomas, aunque no se especifica cuáles).
- Tool calling / function calling: no confirmado para este adaptador.
- Capacidades de agente y multi-step reasoning: no confirmado.
- Modo de pensamiento extendido (thinking mode): no confirmado.

## Casos de uso

No hay casos de uso documentados por el autor. A continuación se proponen escenarios plausibles basados en el modelo base, que deberían verificarse experimentalmente antes de su uso en producción:

- **Razonamiento matemático asistido**: el entrenamiento con GRPO suele mejorar la resolución de problemas matemáticos. Podría emplearse como backend en herramientas educativas que generen soluciones paso a paso.
- **Generación de código con explicaciones**: dada la base Qwen, el adaptador podría integrarse en asistentes de programación que expliquen el razonamiento detrás de cada fragmento.
- **Análisis lógico de textos**: útil para tareas de deducción, detección de falacias o resumen argumentativo, aunque no hay evidencia de su rendimiento en estas tareas.
- **Prototipado de agentes conversacionales**: como punto de partida para experimentos con RL en entornos de chat, gracias a su bajo coste de inferencia (3B activos).
- **Investigación en RLHF/GRPO**: sirve como ejemplo de adaptador entrenado con GRPO para estudiar los efectos de este método sobre un modelo MoE.
- **Evaluación comparativa de adaptadores**: puede utilizarse en benchmarks de razonamiento (GSM8K, MATH, etc.) para medir la ganancia real frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este adaptador. Se recomienda ejecutar evaluaciones propias antes de considerar su uso.

## Requisitos de hardware

Al tratarse de un adaptador (0,3 GB), los requisitos de hardware son los del modelo base Qwen3.5-35B-A3B:

- **VRAM estimada para inferencia**: con cuantización de 4 bits, el modelo base requiere aproximadamente 20-25 GB de VRAM; en 8 bits, unos 35-40 GB; en precisión completa (fp16) superaría los 70 GB. El adaptador añade una sobrecarga mínima.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB, solo con cuantización agresiva) o GPUs profesionales con al menos 24 GB.
- **En consumer GPU**: es posible ejecutar el modelo en una RTX 3090/4090 con cuantización de 4 bits y usando la técnica de offloading, aunque la velocidad será limitada.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Transformers.
- **Latencia y throughput**: no disponibles. Al tener solo 3B parámetros activos, la latencia por token debería ser inferior a la de un modelo denso de 35B, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este adaptador. Como referencia genérica, se podría comparar con el propio modelo base Qwen3.5-35B-A3B (sin ajuste) o con otros adaptadores GRPO de la comunidad, pero no hay datos publicados.

## Limitaciones y advertencias

- **Sin verificación independiente**: el modelo no tiene descargas ni valoraciones; su rendimiento real es desconocido.
- **Posible sobreajuste al conjunto de entrenamiento**: al ser un adaptador entrenado con GRPO, podría especializarse en el dominio de los datos usados, con riesgo de degradación en tareas fuera de ese dominio.
- **Riesgo de alucinación**: inherente a todos los modelos generativos, especialmente en tareas de razonamiento complejo.
- **Licencia no especificada**: la model card indica "licence: license" sin detallar términos. No se recomienda uso comercial sin aclaración.
- **Contexto limitado**: la longitud de contexto no está documentada; se hereda la del modelo base, pero sin confirmación.
- **Idiomas no declarados**: no se sabe qué idiomas soporta el adaptador, aunque el modelo base probablemente cubre inglés, chino y otros.
- **Sin garantías para producción**: al ser un proyecto experimental sin benchmarks, no es adecuado para entornos críticos sin una evaluación exhaustiva.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sergiopaniego/watercolour-grpo-v22b)
- [Espacio de seguimiento (Trackio)](https://huggingface.co/spaces/sergiopaniego/watercolour-grpo-v22b)
- [Paper de GRPO (DeepSeekMath)](https://huggingface.co/papers/2402.03300)
- [Perfil del autor en GitHub](https://github.com/sergiopaniego)
- [Sitio personal del autor](https://sergiopaniego.github.io/)
- [Modelo base Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Librería TRL](https://github.com/huggingface/trl)
