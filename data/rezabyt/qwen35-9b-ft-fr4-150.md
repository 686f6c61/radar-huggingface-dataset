# rezabyt/qwen35-9b-ft-fr4-150

## Resumen

rezabyt/qwen35-9b-ft-fr4-150 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario rezabyt y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint intermedio o experimental resultante de un entrenamiento por refuerzo (reinforcement learning) de 150 pasos de optimizacion, guardado tal cual por el trainer, con pesos, configuracion y tokenizer incluidos.

El modelo hereda la arquitectura y capacidades del Qwen3.5-9B original, un transformer multimodal de tipo image-text-to-text con aproximadamente 9.400 millones de parametros. La model card es extremadamente escasa: no documenta el dataset de entrenamiento, la funcion de recompensa, los hiperparametros ni los resultados obtenidos, por lo que la mayor parte de las especificaciones tecnicas deben inferirse del modelo base o marcarse como no disponibles.

Su relevancia es limitada y de caracter experimental: al no incluir evaluacion, documentacion de datos ni garantias de calidad, no es un artefacto recomendable para produccion sin una validacion exhaustiva previa. Resulta de interes unicamente para quienes quieran inspeccionar o reproducir el proceso de RL aplicado sobre Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B, sin confirmar en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-9B, por lo que conserva la arquitectura del modelo base: un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text) con aproximadamente 9.400 millones de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni detalles del encoder visual, ya que la model card no los documenta.

El entrenamiento consistio en un proceso de reinforcement learning de 150 pasos de optimizacion. La model card no especifica el algoritmo de RL empleado (PPO, GRPO, DPO u otro), la funcion de recompensa, el dataset de prompts, la composicion de los datos, el numero de tokens vistos ni si se aplicaron etapas previas de SFT. Tampoco se indica si se congelaron partes del modelo (por ejemplo, el encoder visual) durante el ajuste. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque sin evaluacion especifica en este checkpoint.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, por lo que se espera soporte multimodal de entrada.
- Codigo y matematicas: presumiblemente presentes por herencia del modelo base, sin datos de validacion en este fine-tune.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Investigacion sobre RL aplicado a modelos multimodales: el checkpoint permite inspeccionar el efecto de 150 pasos de refuerzo sobre Qwen3.5-9B comparando pesos y salidas con el modelo base.
- Reproduccion de experimentos: util para equipos que quieran replicar o continuar el entrenamiento por refuerzo desde este punto de partida.
- Analisis de divergencia respecto al base: comparar respuestas del fine-tune y del original para estudiar como el RL altera el comportamiento del modelo.
- Prototipado interno de pipelines image-text-to-text: sirve como sustituto del modelo base en entornos de prueba donde la licencia Apache 2.0 facilita la experimentacion.
- Evaluacion de calidad de checkpoints intermedios: permite medir si 150 pasos de RL degradan o mejoran capacidades como el razonamiento o la generacion de codigo antes de invertir en entrenamientos mas largos.
- Docencia y formacion: ejemplo practico de publicacion de un checkpoint de RL en Hugging Face con licencia permisiva para estudiar el formato de pesos y configuracion generados por el trainer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16 GB.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque no se publican variantes GGUF/AWQ/GPTQ en el repositorio.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 justo; RTX 3090, 4080 o 4070 Ti para cuantizacion.
- Cabe en GPU consumer: si, en modelos con 16-24 GB en BF16 y en GPUs de 8-12 GB con cuantizacion, siempre que se genere la cuantizacion a partir de los safetensors.
- Opciones de despliegue: transformers (carga directa con AutoModelForCausalLM.from_pretrained), vLLM y TGI para serving en BF16, llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rezabyt/qwen35-9b-ft-fr4-150 | 9.409.813.744 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune RL de 150 pasos, sin evaluacion |
| Qwen/Qwen3.5-9B (modelo base) | ~9.400 millones | no disponible en esta ficha | Apache 2.0 (segun el fine-tune) | Hugging Face | Modelo original con documentacion y evaluacion del autor |
| Otros fine-tunes de Qwen3.5-9B | variable | variable | variable | Hugging Face | Sin datos especificos en la informacion disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni descripcion del dataset de RL, lo que impide estimar la calidad o la direccion del ajuste.
- Riesgo de degradacion: 150 pasos de RL sin documentar la recompensa pueden haber introducido sesgos, sobreajuste a la funcion de recompensa o regresiones en capacidades del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion especifica no puede cuantificarse.
- Idiomas no declarados: se desconoce si el fine-tune conserva el soporte multilingue del base o lo ha desplazado hacia un idioma concreto.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3.5-9B mantiene esa misma licencia y cumplir sus terminos.
- Model card minima: no se documentan hiperparametros, configuracion de entrenamiento ni limitaciones conocidas, lo que dificulta la trazabilidad.
- Sin senales de uso: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- No apto para produccion sin validacion previa: se recomienda evaluar en el dominio objetivo y comparar contra el modelo base antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezabyt/qwen35-9b-ft-fr4-150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
