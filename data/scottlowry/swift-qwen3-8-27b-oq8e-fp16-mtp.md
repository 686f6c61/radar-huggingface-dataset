# scottlowry/Swift-Qwen3.8-27b-oQ8e-fp16-mtp

## Resumen

Swift-Qwen3.8-27b-oQ8e-fp16-mtp es una cuantizacion mixta del modelo base ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), que aplica precision mixta por tensor en lugar de una cuantizacion uniforme. El checkpoint resultante pesa 30,923 GB (28,799 GiB) y contiene 27.781.427.952 parametros, con un promedio efectivo de 8,905 bits por peso.

El modelo esta empaquetado en formato MLX (safetensors), lo que lo orienta a la inferencia sobre hardware Apple Silicon mediante el framework MLX. Incluye tres componentes diferenciados: el modelo de lenguaje (26,896B parametros), un modulo de vision (0,461B) y una cabeza MTP (Multi-Token Prediction, 0,425B) que sugiere decodificacion especulativa o prediccion de multiples tokens. La arquitectura declarada en los tags es qwen3_5, lo que indica que el modelo base deriva de la familia Qwen 3.5.

La relevancia de esta ficha es acotada: se trata de una publicacion reciente (noviembre de 2026) sin descargas ni likes, sin model card descriptiva del modelo base y sin datos de licencia, idiomas o benchmarks. Es util para desarrolladores que quieran ejecutar un modelo de ~27B con vision y MTP en Macs con memoria unificada suficiente, pero no sustituye a la documentacion del modelo base para decisiones de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`), con modulo de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 8-bit grupo 64 (98,143% de pesos), FP16 (0,198%), FP32 (1,658%); promedio efectivo 8,905 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 30,9 GB (28,799 GiB) |
| Libreria | mlx |
| Modelo base | ukisai/Swift-Qwen3.8-27b |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente corresponde a la familia Qwen 3.5 (tag `qwen3_5`), un transformer con un modulo de vision de 0,461B parametros y una cabeza MTP de 0,425B parametros. La presencia de la cabeza MTP (Multi-Token Prediction) es la innovacion tecnica mas destacable del checkpoint: permite predecir varios tokens por paso, lo que habilita decodificacion especulativa o aceleracion de la generacion, aunque el autor no documenta como se usa en inferencia.

La cuantizacion oQ de oMLX aplica precision mixta por tensor: el 98,143% de los pesos (27,266B) se almacena en affine 8-bit con grupo de 64, el 1,658% (0,461B, coincidiendo con el modulo de vision) se mantiene en FP32 y el 0,198% (0,055B) en FP16. Esta distribucion sugiere que las capas sensibles (probablemente el modulo de vision y algunas proyecciones) se preservan en mayor precision para evitar degradacion. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen 3.5, aunque no hay evaluacion publicada en esta ficha.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,461B parametros, por lo que se espera soporte de entrada de imagenes.
- Prediccion multi-token (MTP): cabeza dedicada de 0,425B parametros que puede habilitar decodificacion especulativa.
- Cuantizacion de alta fidelidad: el promedio de 8,905 bits/peso y la preservacion de vision en FP32 buscan minimizar la perdida de calidad frente al modelo original.
- Ejecucion en Apple Silicon: empaquetado en MLX, optimizado para memoria unificada de chips M-series.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint en MLX esta pensado para ejecutarse con el framework MLX en equipos Apple Silicon; con 28,8 GiB de pesos, requiere un Mac con al menos 32 GB de memoria unificada y margen para el contexto.
- Prototipado de aplicaciones multimodales: el modulo de vision incluido permite experimentar con tareas imagen-texto en local sin depender de APIs externas, manteniendo los datos en el dispositivo.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token puede emplearse para decodificacion especulativa y reducir la latencia por token en comparacion con decodificacion autoregresiva estandar, siempre que el runtime MLX lo soporte.
- Evaluacion de cuantizacion mixta: util para investigadores que quieran medir la degradacion de un modelo de ~27B al pasar de FP16 a 8,905 bits/peso efectivos, comparando contra el modelo base ukisai/Swift-Qwen3.8-27b.
- Despliegue de asistentes con contexto largo: aunque la longitud de contexto no esta documentada, un modelo de 27B con vision y MTP es candidato para asistentes conversacionales locales; conviene verificar el contexto real en el modelo base antes de comprometerse.
- Fine-tuning o adaptacion posterior: al estar en safetensors y MLX, puede servir como punto de partida para LoRA o adaptadores sobre el checkpoint cuantizado, aunque la cuantizacion limita las opciones de entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 28,8 GiB solo para pesos; con contexto y buffers de activacion, se recomienda un minimo de 36-40 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2 Ultra, M3 Max con 48 GB o superior, M4 Max). No esta pensado para GPUs NVIDIA por el formato MLX.
- Cabe en consumer GPU: si, en Macs con 48 GB o mas de memoria unificada; en Macs de 32 GB el margen es muy ajustado y puede fallar con contextos largos.
- Opciones de despliegue: MLX (libreria declarada); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no consumen pesos MLX de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Swift-Qwen3.8-27b-oQ8e-fp16-mtp | 27,781B | no disponible | MLX safetensors (8,905 bits/peso) | no disponible | Cuantizacion mixta con vision y MTP |
| ukisai/Swift-Qwen3.8-27b (base) | no disponible | no disponible | no disponible | no disponible | Modelo original sin cuantizar |
| Qwen 3.5 (familia) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia segun tag `qwen3_5` |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- La cuantizacion a 8,905 bits/peso efectivos puede introducir degradacion en tareas sensibles a precision, como matematicas o generacion de codigo, respecto al modelo base en FP16.
- El modulo de vision se mantiene en FP32, pero el resto del modelo esta en 8 bits; la alineacion vision-lenguaje puede resentirse en tareas multimodales complejas.
- No hay model card del autor que describa sesgos, datos de entrenamiento o evaluaciones; se desconoce el comportamiento real del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ukisai/Swift-Qwen3.8-27b antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano u otros idiomas distintos del ingles sin evaluacion previa.
- Longitud de contexto no disponible: no se debe asumir una ventana concreta sin consultar el modelo base.
- Formato MLX: no es portable a ecosistemas CUDA ni a runtimes como vLLM o llama.cpp sin conversion, lo que limita su uso a Apple Silicon.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no hay forma de cuantificarlo.
- Publicacion con 0 descargas y 0 likes: sin validacion de la comunidad, conviene tratar el checkpoint como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
