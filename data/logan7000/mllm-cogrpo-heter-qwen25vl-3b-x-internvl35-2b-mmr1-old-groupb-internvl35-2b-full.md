# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-old-groupB-internvl35-2b-full

## Resumen

Este modelo es un checkpoint de investigacion que implementa un esquema de aprendizaje por refuerzo heterogeneo entre dos modelos multimodales de tamano pequeno: Qwen2.5-VL-3B e InternVL3.5-2B. El entrenamiento utiliza el algoritmo Co-GRPO (Cooperative Group Relative Policy Optimization) con una receta "old" (beta 0, K 8, T 1.0, cap 1024, lr 1e-6, warmup 0.03, 8 prompts/step = EB 64), completando 722 pasos de optimizacion sobre 4 GPUs A100 en el cluster de JHU. El checkpoint corresponde al lado InternVL del grupo B del experimento MMR1.

El modelo se publica como parte de un estudio sobre co-aprendizaje entre arquitecturas distintas, donde dos modelos de vision-lenguaje de diferentes familias se entrenan conjuntamente con un objetivo de refuerzo compartido. El repositorio contiene el checkpoint completo (9.4 GB) en formato safetensors, junto con los logs de entrenamiento, el estado del trainer y las metricas de validacion. La seleccion del mejor checkpoint se realizo mediante validacion en MathVista-150, eligiendo el paso 550 como mejor punto frente al checkpoint final del paso 722.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) basado en Qwen2.5-VL-3B e InternVL3.5-2B (co-entrenamiento heterogeneo) |
| Parametros totales | ~5B (3B + 2B combinados, no fusionados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado con 16k tokens segun protocolo v2) |
| Tipos de cuantizacion | no disponible (repo en safetensors full precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos arquitecturas VLM distintas: Qwen2.5-VL-3B, que utiliza un transformer con atencion full y un encoder de vision nativo, e InternVL3.5-2B, que emplea un esquema de alineamiento vision-language con un encoder de vision pre-entrenado. El entrenamiento sigue un esquema de co-learning heterogeneo donde ambos modelos se optimizan simultaneamente con el algoritmo Co-GRPO, una variante de GRPO que permite cooperacion entre modelos de distinta familia. La receta "old" especifica beta 0 (sin regularizacion KL), 8 muestras por prompt (K 8), temperatura 1.0, cap de 1024 tokens, learning rate 1e-6 y warmup del 3%. Se usaron 8 prompts por paso con un effective batch de 64. El entrenamiento completo fue de 722 pasos (1 epoch), con evaluacion en MathVista-150 para seleccion del mejor checkpoint (paso 550). El protocolo de evaluacion v2 usa temperatura 0, contexto de 16k tokens, prompt con boxed answer, y un juez Qwen2.5-32B para la validacion de respuestas.

## Capacidades

- Razonamiento matematico multimodal: el modelo se entrena especificamente en tareas de matematicas visuales, con evaluacion en MathVista-150.
- Comprension de imagenes y diagramas: al ser un VLM, procesa entradas visuales junto con texto.
- Generacion de respuestas con formato estructurado: el protocolo de evaluacion usa respuestas en formato "boxed" para extraccion de resultados.
- Co-razonamiento entre dos arquitecturas: el esquema de entrenamiento permite que ambos modelos aprendan de las senales del otro.
- Evaluacion con juez LLM: las respuestas se validan con un modelo juez (Qwen2.5-32B) para puntuacion automatica.

## Casos de uso

- Investigacion en RL multimodal: este checkpoint es un recurso para estudiar como dos arquitecturas VLM distintas pueden co-entrenarse con GRPO, util para grupos de investigacion que trabajan en aprendizaje por refuerzo para modelos de vision-lenguaje.
- Reproduccion de experimentos: el repositorio incluye logs de entrenamiento y estado del trainer, permitiendo reproducir el experimento completo o continuar el entrenamiento desde el checkpoint.
- Evaluacion de co-aprendizaje heterogeneo: investigadores pueden comparar el rendimiento de este checkpoint frente a modelos entrenados individualmente para medir el beneficio del co-entrenamiento.
- Fine-tuning posterior: el checkpoint puede servir como punto de partida para fine-tuning adicional en tareas especificas de razonamiento visual-matematico.
- Analisis de dinamicas de entrenamiento: los ficheros de log permiten analizar la evolucion de las metricas durante el entrenamiento, util para estudiar la estabilidad del co-entrenamiento.
- Comparativa de arquitecturas VLM pequenas: el modelo permite comparar el rendimiento de Qwen2.5-VL-3B e InternVL3.5-2B bajo el mismo regimen de entrenamiento RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la seleccion del mejor checkpoint se realizo con MathVista-150 como metrica de validacion, pero no se proporcionan los valores numericos obtenidos. El protocolo de evaluacion usa un juez Qwen2.5-32B para validar las respuestas, lo que sugiere que las metricas finales se calcularan para su inclusion en un paper, pero dichos datos no estan disponibles en el repositorio publico.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~5B parametros en full precision (safetensors), se estiman entre 10-12 GB de VRAM para inferencia en FP16. El tamano del repo (9.4 GB) sugiere pesos en FP16 o BF16.
- GPU recomendadas: el entrenamiento se realizo en 4x A100, pero para inferencia basica seria suficiente una GPU consumer de 16 GB (RTX 4080/4090) o una A10/A16 en la nube.
- Despliegue en consumer GPU: posible con cuantizacion (AWQ, GPTQ) o usando llama.cpp con GGUF, aunque no se proporcionan ficheros cuantizados en el repo.
- Opciones de despliegue: vLLM, TGI o transformers de HuggingFace para inferencia en full precision; llama.cpp/Ollama si se generan ficheros GGUF.
- Latencia y throughput: no disponible. Al ser un modelo pequeno (~5B), se espera una latencia moderada en GPU consumer, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Este modelo (Co-GRPO heter) | ~5B (2 modelos) | no disponible | RL (Co-GRPO) | no disponible |
| Qwen2.5-VL-3B (base) | 3B | 32k | Pre-entrenamiento + SFT | Apache 2.0 |
| InternVL3.5-2B (base) | 2B | 32k | Pre-entrenamiento + SFT | MIT |

La comparativa directa con los modelos base es la referencia mas util: este checkpoint aplica RL sobre ambos modelos base, por lo que el rendimiento deberia compararse contra las versiones originales para medir el impacto del co-entrenamiento. No se dispone de datos de rendimiento publicados para esta comparacion.

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo listo para produccion; es un checkpoint experimental de un estudio academico.
- Licencia no especificada: no se indica la licencia de uso, lo que impide su uso comercial sin autorizacion explicita del autor.
- Datos de entrenamiento no documentados: no se especifica la composicion del dataset de entrenamiento mas alla de la referencia a MMR1 y tareas de matematicas.
- Sesgos potenciales: al entrenarse en tareas de matematicas visuales, el modelo puede tener un rendimiento limitado fuera de ese dominio.
- Riesgo de alucinacion: como cualquier VLM pequeno, puede generar respuestas incorrectas con alta confianza, especialmente en razonamiento visual complejo.
- Sin cuantizaciones disponibles: el repositorio solo contiene pesos en full precision, lo que limita el despliegue en hardware con poca VRAM.
- Fecha de creacion futura: el modelo fue creado en septiembre de 2026, lo que sugiere que forma parte de un proyecto en curso y puede estar sujeto a cambios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-old-groupB-internvl35-2b-full
- Perfil del autor: https://huggingface.co/logan7000/models
- Modelo relacionado (variante 7B/8B): https://huggingface.co/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-groupB-internvl35-8b
- Repositorio de Qwen3-VL (referencia de la familia Qwen VL): https://github.com/QwenLM/Qwen3-VL
