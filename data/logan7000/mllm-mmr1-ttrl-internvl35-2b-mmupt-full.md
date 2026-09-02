# logan7000/mllm-mmr1-ttrl-internvl35-2b-mmupt-full

## Resumen

El modelo `logan7000/mllm-mmr1-ttrl-internvl35-2b-mmupt-full` es un modelo de lenguaje multimodal (MLLM) basado en la arquitectura InternVL3.5-2B, desarrollado por Logan Yang (logan7000) como parte de un experimento de investigación sobre aprendizaje por refuerzo en tiempo de prueba (Test-Time Reinforcement Learning, TTRL). El modelo se ha entrenado con la receta "mmupt" (beta 0.01, K 10, T 0.7, cap 2048, lr 1e-6, warmup 0, weight_decay 0.01, max_grad_norm 1.0, bnpo, scale_rewards group, 12 prompts/step = EB 120), que combina TTRL con autoevaluación por mayoría (self-labeling majority vote). El objetivo es mejorar el razonamiento matemático multimodal, como indica la métrica de validación MathVista-150.

El repositorio contiene dos checkpoints: `best/` (mejor por validación en MathVista-150, paso 220) y `endpoint/` (checkpoint 481, equivalente a 1 época). El entrenamiento se realizó en GPUs A100 de la Universidad Johns Hopkins (JHU) entre el 1 y 2 de septiembre de 2026. El modelo se publica en formato safetensors con un tamaño de repositorio de 9.4 GB. No se especifica licencia, idiomas soportados ni pipeline de uso, lo que limita su aplicabilidad directa en producción sin consultar al autor.

La relevancia de este modelo radica en que explora una técnica emergente (TTRL) que permite mejorar el rendimiento de razonamiento sin necesidad de etiquetas explícitas, utilizando solo datos de prueba no etiquetados. Esto es especialmente interesante para tareas de razonamiento matemático multimodal, donde los datos etiquetados son escasos y costosos de obtener.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en InternVL3.5-2B, presumiblemente transformer multimodal) |
| Parametros totales | no disponible (el nombre sugiere 2B, pero no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el protocolo de evaluacion menciona 16k tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada, pero el nombre del modelo indica que se basa en InternVL3.5-2B, una familia de modelos multimodales desarrollada por OpenGVLab. InternVL combina un codificador visual con un modelo de lenguaje, y la version 2.5 alcanzo mas del 70% en el benchmark MMMU, lo que sugiere que la arquitectura base es capaz de procesar imagenes y texto de forma conjunta. El entrenamiento se realizo con la receta "mmupt", que emplea TTRL (Test-Time Reinforcement Learning) con autoevaluacion por mayoria (majority vote) para generar recompensas sin etiquetas explicitas. Los hiperparametros incluyen beta 0.01, K 10 (numero de muestras), T 0.7 (temperatura), cap 2048 (limite de tokens), lr 1e-6, weight_decay 0.01, max_grad_norm 1.0, y un esquema de recompensas por grupo (scale_rewards group). El entrenamiento se realizo en GPUs A100 de JHU, con 12 prompts por paso y un tamano de lote efectivo de 120.

El protocolo de evaluacion para las tablas del paper usa T=0, 16k tokens de contexto, prompt con "boxed" (formato de respuesta matematica), y un juez compuesto por reglas mas Qwen2.5-32B. Esto indica que el modelo esta optimizado para razonamiento matematico multimodal, probablemente con respuestas en formato LaTeX o similar.

## Capacidades

- Razonamiento matematico multimodal: el modelo esta entrenado especificamente para tareas como MathVista-150, que combina comprension visual y razonamiento matematico.
- Generacion de texto y respuestas en formato "boxed" (probablemente LaTeX o similar) para problemas matematicos.
- Capacidad de procesamiento de imagenes y texto (al ser un MLLM basado en InternVL), aunque no se detallan las capacidades visuales exactas.
- Autoevaluacion y mejora en tiempo de prueba: gracias a TTRL, el modelo puede refinar sus respuestas mediante mayoria de votos durante la inferencia, aunque esto no esta documentado como una capacidad del modelo final, sino como parte del proceso de entrenamiento.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el entrenamiento con TTRL sugiere que puede manejar razonamiento multi-paso.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de razonamiento matematico multimodal en investigacion: el modelo puede utilizarse como punto de partida para estudiar tecnicas de TTRL en modelos pequenos, comparando su rendimiento con otros checkpoints del mismo experimento (por ejemplo, el de 8B).
- Generacion de soluciones a problemas de matematicas con imagenes: dado su entrenamiento en MathVista-150, puede resolver problemas que requieren interpretar diagramas, graficas o figuras geometricas.
- Prototipado de sistemas de tutoria inteligente: un modelo de 2B con capacidades matematicas puede integrarse en aplicaciones educativas para generar explicaciones paso a paso, aunque su licencia no esta clara.
- Investigacion sobre RL sin etiquetas: el modelo sirve como caso de estudio para entender como TTRL mejora el rendimiento en tareas de razonamiento sin datos etiquetados, lo que es relevante para la comunidad de IA.
- Benchmarking de modelos pequenos: al ser de 2B, puede compararse con otros modelos de tamano similar en tareas matematicas multimodales para evaluar la eficiencia de la receta de entrenamiento.
- Desarrollo de agentes de razonamiento visual: aunque no se confirma soporte de tool calling, el modelo podria integrarse en pipelines que combinen vision por computador y generacion de texto para tareas de analisis de documentos cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la seleccion del mejor checkpoint se hizo con MathVista-150, pero no se proporcionan numeros concretos. El protocolo de evaluacion descrito (T=0, 16k, boxed prompt, rule + Qwen2.5-32B judge) sugiere que los resultados se reportaran en un paper proximo, pero no estan disponibles en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9.4 GB de pesos en safetensors, se estima que el modelo necesita al menos 10-12 GB de VRAM en precision fp16, pero no se confirma.
- GPU recomendadas: el entrenamiento se realizo en A100, pero para inferencia podria bastar con una GPU de gama media-alta (RTX 3090, RTX 4090, A10, etc.) si se cuantiza.
- Si cabe en consumer GPU: probablemente si, con cuantizacion (por ejemplo, GGUF o AWQ), pero no se proporcionan archivos cuantizados en el repo.
- Opciones de despliegue: no se mencionan. Al ser un modelo safetensors, se podria usar con vLLM, TGI o transformers, pero no hay documentacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con otros modelos. El modelo pertenece a la familia InternVL, pero no se conocen los resultados de otros checkpoints del mismo experimento (como el de 8B) ni de modelos similares de 2B. Se recomienda consultar el repositorio de InternVL (OpenGVLab) para comparar con la serie InternVL2.5, aunque no se proporcionan datos concretos.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial o la redistribucion no estan claros. Se debe contactar al autor antes de utilizar el modelo en produccion.
- Sesgos y alucinaciones: al ser un modelo entrenado principalmente para matematicas, puede alucinar en otros dominios. No se han evaluado sesgos.
- Limitaciones de contexto: el protocolo de evaluacion usa 16k tokens, pero no se confirma la longitud maxima de contexto del modelo.
- Idiomas: no se especifican idiomas soportados; probablemente el modelo este optimizado para ingles, dado el dataset MathVista.
- Reproducibilidad: el entrenamiento se realizo en un entorno especifico (JHU a100) y los detalles completos no estan documentados, lo que dificulta la reproduccion exacta.
- Estado experimental: el modelo es un checkpoint de investigacion (beta 0.01) y no se garantiza su robustez en escenarios reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-mmr1-ttrl-internvl35-2b-mmupt-full
- Perfil del autor: https://huggingface.co/logan7000/models
- Paper TTRL (arXiv): https://arxiv.org/abs/2504.16084
- Repositorio TTRL (GitHub): https://github.com/PRIME-RL/TTRL
- Repositorio InternVL (GitHub): https://github.com/OpenGVLab/InternVL
