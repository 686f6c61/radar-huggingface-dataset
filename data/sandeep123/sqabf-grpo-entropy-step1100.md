# sandeep123/sqabf-grpo-entropy-step1100

## Resumen

`sandeep123/sqabf-grpo-entropy-step1100` es un modelo de lenguaje de 1.777 millones de parametros (1.777.088.000), resultado de un fine-tuning con aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. El autor, sandeep123, lo ha entrenado con el algoritmo GRPO (Group Relative Policy Optimization) y un bonus de entropia, sobre el dataset de preguntas de ciencias ScienceQA, siguiendo un protocolo de "boxfix" que exige razonamiento numerado (Step 1..n) y una respuesta final en formato `\boxed{X}`.

El modelo se presenta como un baseline para experimentos de razonamiento y RL, seleccionado como el mejor checkpoint en validacion por pass@1 dentro de su rama experimental. Es relevante porque documenta de forma explicita las condiciones de entrenamiento, las metricas de validacion (pass@1 0.8418, pass@6 0.9531 en el paso 1100) y una advertencia critica sobre el uso del chat template, que degrada el rendimiento en aproximadamente 19 puntos de pass@1 si se aplica en inferencia. La arquitectura es un transformer denso (no MoE), y el ejemplo de inferencia con vLLM usa `max_model_len=1536`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (~1,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de inferencia usa `max_model_len=1536`) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 segun el ejemplo de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer denso de 1.777B parametros, y se entrena con GRPO sobre el dataset `ScienceQA` en su variante `scienceqa_boxfix`. El entrenamiento anade un bonus de entropia con coeficiente `1e-3`, enmascarado a los tokens de respuesta, con el objetivo de fomentar exploracion en los rollouts. Se utiliza el protocolo "boxfix" completo: el prompt exige una cadena de razonamiento numerada (Step 1..n) seguida de `\boxed{X}` en su propia linea y nada despues, con una recompensa de formato fija de 0.03.

Las condiciones de entrenamiento son: 25 epocas / 1250 pasos, batch de 128 prompts con K=6 rollouts, learning rate constante de 1e-6, KL in-reward de 0.01, max prompt/response de 512/1024 tokens, seed 42, entropy_coeff=0.001, clip=0.2/0.2 y temperatura de rollout 1.0. El modelo se entrena sobre texto de prompt sin aplicar chat template (`apply_chat_template=False` en `verl`), y la validacion usa 256 prompts held-out con K=6, temperatura 1.0 y seed 42. No se menciona uso de RLHF ni DPO; el metodo es exclusivamente GRPO con bonus de entropia.

## Capacidades

- Razonamiento paso a paso en preguntas de opcion multiple de ciencias, generando cadenas numeradas (Step 1..n) y una respuesta final en `\boxed{X}`.
- Extraccion automatica de respuestas: el contenido del ultimo `\boxed{}` se toma como respuesta; si falta, se usa el ultimo token A-E independiente.
- Entrenado para seguir un formato estricto de salida, lo que facilita la evaluacion automatizada de exactitud.
- Es un baseline reproducible para experimentos de RL: las condiciones de entrenamiento y las metricas de validacion estan documentadas.
- Capacidad de exploracion controlada gracias al bonus de entropia, que puede influir en la diversidad de las respuestas generadas.
- No se han documentado capacidades de tool calling, agentes, vision, audio ni soporte multilingue explicito.

## Casos de uso

- Evaluacion de razonamiento en entornos educativos: el modelo puede generar explicaciones numeradas para preguntas de ciencias, permitiendo analizar la calidad del razonamiento y la exactitud de la respuesta final.
- Benchmarking de algoritmos de RL: sirve como baseline para comparar GRPO, PPO o variantes con bonus de entropia en tareas de razonamiento cientifico, dado que las condiciones de entrenamiento estan especificadas.
- Investigacion en alineacion y exploracion: permite estudiar el efecto del coeficiente de entropia en la diversidad de salidas y en el equilibrio entre exploracion y explotacion.
- Extraccion de respuestas en pipelines de QA: el formato `\boxed{}` facilita la extraccion automatica de la opcion elegida, reduciendo la necesidad de parsers complejos.
- Generacion de explicaciones para datasets de ciencias: puede usarse para producir razonamientos estructurados que luego se emplean como datos de entrenamiento o para analisis cualitativo.
- Integracion en pipelines de inferencia con vLLM: el ejemplo oficial muestra como cargar el modelo con `dtype="bfloat16"` y `max_model_len=1536`, generando con `SamplingParams` sobre texto crudo, sin chat template.
- Analisis de robustez del formato: permite comparar el rendimiento entre checkpoints de diferentes pasos (best pass@1 vs best pass@6) para entender la relacion entre exactitud y diversidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los datos de validacion del checkpoint son los siguientes:

| Metrica | Valor |
|---|---|
| pass@1 | 0.8418 |
| pass@6 | 0.9531 |
| step | 1100 |

La validacion se realizo sobre 256 prompts held-out, con K=6, temperatura 1.0 y seed 42. La metrica se define como exactitud de respuesta en el formato de opcion multiple de ScienceQA, con todas las respuestas no extraibles contadas como incorrectas.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 3.55 GB. Con activaciones y KV cache para `max_model_len=1536` y un batch pequeno, la VRAM total se situa en torno a 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060 12GB, RTX 4060 Ti 16GB, A10G, A100 o H100. El modelo cabe en GPUs de consumo.
- Opciones de despliegue: vLLM (usado en el ejemplo oficial), HuggingFace Transformers, y potencialmente llama.cpp u Ollama si se convierten los pesos a GGUF (no se ha publicado dicha conversion).
- Latencia y throughput: no disponible. El ejemplo de vLLM usa `n=6` rollouts por prompt con `temperature=1.0` y `max_tokens=1024`, lo que sugiere un uso orientado a evaluacion masiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sqabf-grpo-entropy-step1100 | 1.777B | no disponible | Apache-2.0 | HuggingFace |
| Qwen2.5-Math-1.5B (base) | 1.777B | no disponible | Apache-2.0 | HuggingFace |
| sandeep123/sqa-grpo-entropy-step1100 | 1.777B | no disponible | Apache-2.0 | HuggingFace |
| sandeep123/math-grpo-entropy-step1100 | 1.777B | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks publicados para los modelos comparados. Los tres checkpoints de sandeep123 son variantes del mismo experimento con diferentes configuraciones o datasets, pero no se han publicado metricas de validacion para los otros dos en la informacion disponible.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado sobre texto de prompt crudo. Aplicar el chat template de Qwen2.5-Math en inferencia produce una degradacion medida de aproximadamente 19 puntos de pass@1 en una tarea hermana.
- Especializacion en el formato "boxfix": las respuestas que no siguen la estructura de razonamiento numerado y `\boxed{X}` en linea propia pueden no extraerse correctamente, y se contaran como incorrectas en evaluacion.
- Dominio limitado: el entrenamiento se centra en ScienceQA, por lo que el rendimiento en otras areas (matematicas avanzadas, codigo, texto general) no esta garantizado.
- Idiomas: no se han especificado los idiomas soportados; el dataset es en ingles, por lo que se espera un funcionamiento optimo solo en ese idioma.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en preguntas fuera de su dominio de entrenamiento.
- Seleccion de checkpoint: el mejor pass@1 se encuentra cerca del paso 1000-1200, mientras que el mejor pass@6 esta en el paso 200-500. Esto implica que el checkpoint publicado, optimizado para exactitud, puede no representar la maxima diversidad de respuestas.
- Licencia Apache-2.0: permite uso comercial, pero las restricciones de los datos de entrenamiento de ScienceQA y del modelo base no se detallan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqabf-grpo-entropy-step1100
- Checkpoint relacionado: https://huggingface.co/sandeep123/sqa-grpo-entropy-step1100
- Checkpoint relacionado: https://huggingface.co/sandeep123/math-grpo-entropy-step1100

No se han encontrado papers, blogs, repositorios de codigo ni demos en la informacion proporcionada.
