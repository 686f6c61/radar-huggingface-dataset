# cmcheng/DeepMath-GRPO_DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepMath-GRPO_DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje especializado en razonamiento matemático, desarrollado por el usuario cmcheng como un fine-tuning del modelo base DeepSeek-R1-Distill-Qwen-1.5B mediante el algoritmo de optimización GRPO (Group Relative Policy Optimization). El modelo se entrena sobre el dataset DeepMath-103K, con 97 870 ejemplos de entrenamiento y 5 152 de prueba, y busca mejorar la capacidad del modelo base para resolver problemas matemáticos paso a paso, aprovechando la técnica de refuerzo directo sobre el modelo ya destilado.

El modelo tiene 1 777 millones de parámetros (1,5B) y se distribuye en formato safetensors. Su relevancia radica en que explora el uso de GRPO para potenciar modelos pequeños de razonamiento, un enfoque que ha ganado popularidad tras los resultados de DeepSeek-R1. Sin embargo, el repositorio no proporciona información sobre licencia, idiomas soportados, longitud de contexto ni cuantizaciones, y el modelo cuenta con cero descargas y cero likes, lo que indica que es un proyecto experimental sin validación pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base DeepSeek-R1-Distill-Qwen-1.5B, que es un transformer de la familia Qwen2, pero la model card no especifica detalles estructurales adicionales. El entrenamiento se realizó con el framework TRL y la configuración GRPO, sobre un dataset de matemáticas (DeepMath-103K). Se utilizaron 2 NVIDIA 4090 con 48 GB cada una, DeepSpeed con bf16 mixto, un batch efectivo de 64 (per_device 4, grad acum 4, 2 GPUs) y un total de 2000 pasos de entrenamiento. La configuración incluye un learning rate de 1e-6, beta (coeficiente KL) de 0.001, epsilon de 0.2 y 0.28, temperatura de 1.0, y longitud máxima de generación de 2048 tokens. El entrenamiento se evaluó cada 500 pasos y se guardó el mejor modelo según la métrica eval_reward.

## Capacidades

- Generación de texto: es un modelo de texto que puede producir respuestas en formato conversacional.
- Razonamiento matemático: el objetivo del entrenamiento es mejorar la capacidad de resolver problemas matemáticos con razonamiento paso a paso, aunque no se han publicado evaluaciones específicas.
- No hay información sobre soporte de tool calling, agentes, multimodalidad o capacidades multilingües en el repositorio.

## Casos de uso

- Asistente educativo para matemáticas: el modelo puede generar explicaciones paso a paso de problemas de álgebra, cálculo o estadística, aunque no se ha validado su precisión.
- Generación de problemas matemáticos: podría usarse para crear ejercicios de práctica, pero no hay evidencia de su calidad.
- Prototipos de investigación: como ejemplo de aplicación de GRPO en modelos pequeños, puede servir como referencia en experimentos académicos.
- Análisis de razonamiento: al ser un modelo de razonamiento, puede emplearse en estudios de interpretabilidad o de técnicas de refuerzo.
- Integración en pipelines de generación de texto: dado su tamaño, podría integrarse en entornos con recursos limitados, aunque no hay datos de rendimiento.
- Fine-tuning posterior: los pesos pueden servir como punto de partida para otras tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han especificado requisitos de inferencia en el repositorio.
- El entrenamiento se realizó con 2 NVIDIA RTX 4090 de 48 GB, lo que sugiere que la inferencia con este modelo de 1.8B parámetros es viable en GPUs consumer (por ejemplo, RTX 3060 o superior) con cuantización, pero no hay datos concretos.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares, ya que no hay datos de rendimiento ni especificaciones completas. Los modelos comparables serían DeepSeek-R1-Distill-Qwen-1.5B (modelo base) y otros modelos de 1.5B como Qwen2.5-1.5B-Instruct, pero no se pueden comparar numéricamente sin datos.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | no disponible | MIT | no disponible |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (según documentación pública) | Apache 2.0 | no disponible |
| Este modelo | 1.777B | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay información sobre sesgos, pero al ser un modelo pequeño puede heredar sesgos del dataset de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas, especialmente en matemáticas.
- No se ha evaluado en tareas generales; su especialización en matemáticas puede limitar su utilidad en otros dominios.
- Licencia desconocida: no se especifica, lo que impide conocer si se puede usar comercialmente o modificarlo.
- El repositorio no tiene métricas de rendimiento, por lo que no es recomendable para producción sin una validación previa.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/cmcheng/DeepMath-GRPO_DeepSeek-R1-Distill-Qwen-1.5B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset: zwhe99/DeepMath-103K (no se proporciona enlace directo en la información)
- Página de DeepSeek: https://deepseek.com/en/index.html
