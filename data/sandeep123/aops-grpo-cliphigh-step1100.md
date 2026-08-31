# sandeep123/aops-grpo-cliphigh-step1100

## Resumen

El modelo `sandeep123/aops-grp-cliphigh-step1100` es un checkpoint de un experimento de aprendizaje por refuerzo (RL) basado en el modelo base `Qwen/Qwen2.5-Math-1.5B`. Ha sido entrenado con el algoritmo GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA, aplicando una variante de límites de clip desacoplados (lower 1-0.2, upper 1+0.28) inspirada en DAPO. Este checkpoint concreto se seleccionó como el mejor en pass@1 de validación para su brazo experimental (rank 2).

El modelo está pensado como línea base para investigar el efecto de diferentes configuraciones de RL en tareas de razonamiento científico. Su tamaño reducido (1.777 millones de parámetros) lo hace adecuado para entornos con recursos limitados, aunque su rendimiento en validación es modesto (pass@1 de 0.2311). Una particularidad importante es que no debe aplicarse el chat template de Qwen en inferencia, ya que fue entrenado con texto plano, y hacerlo degrada el rendimiento en aproximadamente 19 puntos de pass@1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en el ejemplo de inferencia se usa `max_model_len=1536`) |
| Tipos de cuantizacion | no disponible (el ejemplo de inferencia usa `bfloat16`) |
| Idiomas soportados | no disponible (probablemente inglés y chino por ser Qwen, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 7.1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only con 1.500 millones de parámetros entrenado para razonamiento matemático. Sobre esta base se aplica un entrenamiento de RL con GRPO, implementado con el framework verl. El dataset usado es ScienceQA (en su versión `scienceqa_boxfix`), con 128 prompts por batch y 6 rollouts por prompt (K=6). Se entrenó durante 25 épocas (1250 pasos) con una tasa de aprendizaje constante de 1e-6 y una penalización KL de 0.01 integrada en la recompensa. La recompensa de formato se fijó en 0.03 constante.

La innovación técnica principal es el uso de límites de clip desacoplados para la política: inferior 0.8 y superior 1.28 (valores 1-0.2 y 1+0.28), en lugar del clip simétrico estándar. Esto corresponde a uno de los cuatro componentes del algoritmo DAPO, aunque no se aplica DAPO completo. El coeficiente de entropía se fijó en 0.0 y la temperatura de rollout en 1.0. La extracción de respuestas en validación se hace tomando el contenido del último `\boxed{}` o, en su ausencia, el último token A-E standalone; las respuestas sin extraer se puntúan como incorrectas.

## Capacidades

- Generación de texto con razonamiento matemático y científico, especialmente orientado a preguntas de opción múltiple con respuesta entre A y E.
- Razonamiento paso a paso: el modelo puede producir soluciones detalladas antes de dar la respuesta final en formato `\boxed{}`.
- Capacidad de razonamiento de varios pasos gracias al entrenamiento con RL sobre recompensas de formato y exactitud.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- Multilingüismo no confirmado; el modelo base Qwen2.5-Math está entrenado principalmente en inglés y chino, pero no hay datos específicos para este checkpoint.

## Casos de uso

- Evaluación de razonamiento en entornos educativos: el modelo puede generar explicaciones paso a paso para problemas de ciencia de nivel escolar, útil para plataformas de aprendizaje automático que necesiten retroalimentación inmediata sin depender de APIs externas.
- Investigación en RL: sirve como línea base para comparar variantes de GRPO, como el clip desacoplado, en tareas de razonamiento. Su pequeño tamaño permite ejecutar múltiples experimentos en paralelo con recursos moderados.
- Prototipado de sistemas de respuesta a preguntas de opción múltiple: dado su entrenamiento en ScienceQA, puede integrarse en demos o pruebas de concepto para asistentes de estudio.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de razonamiento que posteriormente se usan para fine-tuning de modelos más grandes, aunque su calidad limitada (pass@1 ~0.23) exige filtrado.
- Despliegue en dispositivos edge: con ~3.5 GB en bf16, es ejecutable en GPUs de consumo o incluso en CPU con cuantización, aunque no se proporcionan pesos GGUF.
- Benchmarking de métodos de extracción de respuestas: su formato de salida con `\boxed{}` facilita probar parsers y estrategias de decoding para tareas de razonamiento.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de validación en ScienceQA para este checkpoint:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2311 |
| pass@6 | 0.4102 |
| step | 1100 |

Estas métricas se obtuvieron con 256 prompts held-out, K=6, temperatura 1.0 y seed 42. No se han publicado comparaciones con otros modelos en la información disponible, por lo que no se presenta tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3.5 GB para los pesos más overhead de activaciones y KV cache; con `max_model_len=1536` y batch pequeño, se puede ejecutar en GPUs con 6 GB o más.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4090). Para entrenamiento RL completo, se necesitaría una GPU con 24 GB o más, aunque no se especifica en la documentación.
- En consumer GPU: sí, cabe en GPUs como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas.
- Opciones de despliegue: el ejemplo oficial usa vLLM con `dtype="bfloat16"`. También se puede cargar con Transformers y convertir a GGUF para llama.cpp u Ollama, aunque no se proporcionan pesos preconvertidos.
- Latencia y throughput: no se han publicado mediciones. Con un modelo de 1.5B, se espera una latencia de decodificación de pocos milisegundos por token en GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación. El modelo es un fine-tuning de Qwen2.5-Math-1.5B, por lo que una comparación natural sería contra el modelo base sin RL, pero no se publican sus métricas en ScienceQA. Tampoco hay datos de otros checkpoints del mismo experimento (como el de mejor pass@6) en la información proporcionada. Por tanto, no se puede realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano y usar `apply_chat_template` degrada el rendimiento en ~19 puntos de pass@1. Es una restricción crítica para producción.
- Rendimiento limitado: pass@1 de 0.2311 en ScienceQA, muy por debajo de modelos grandes; no es adecuado para tareas de razonamiento general de alta precisión.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con RL, puede generar razonamientos plausibles pero incorrectos, especialmente fuera del dominio de ciencia de opción múltiple.
- Contexto limitado: la longitud máxima de prompt/respuesta durante entrenamiento fue de 512/1024 tokens, y el ejemplo de inferencia usa `max_model_len=1536`. No soporta contextos largos.
- Idiomas: no se especifica soporte multilingüe; probablemente limitado a inglés (y posiblemente chino), no apto para otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Math, que tiene su propia licencia (Apache-2.0 también, según el tag). Se debe verificar la licencia del modelo base.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse solo en ScienceQA, puede tener sesgos hacia el formato de opción múltiple y el dominio científico.

## Enlaces

- [HuggingFace - sandeep123/aops-grp-cliphigh-step1100](https://huggingface.co/sandeep123/aops-grp-cliphigh-step1100)
- [Repositorio GRPO-Zero (referencia de implementación de GRPO)](https://github.com/policy-gradient/GRPO-Zero)
