# scottlowry/Swift-Qwen3.8-27b-oQ4e-fp16-mtp

## Resumen

Swift-Qwen3.8-27b-oQ4e-fp16-mtp es una cuantización mixta del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.4.dev1), un esquema de cuantización de precisión mixta orientado al ecosistema MLX de Apple Silicon. El resultado es un modelo de 27.781 millones de parámetros almacenado en 17.172 GiB, con un promedio efectivo de 5,310 bits por peso.

El modelo base pertenece a la familia Qwen 3.5 segun la etiqueta `qwen3_5` del repositorio, e incorpora un modulo de vision (0.461B de parametros) y una cabeza MTP (Multi-Token Prediction) de 0.425B, lo que sugiere soporte de decodificacion especulativa nativa. La cuantizacion preserva estas componentes en lugar de eliminarlas, algo relevante para quienes quieran explotar la prediccion multi-token en inferencia.

La relevancia de esta ficha es practica: permite ejecutar un modelo de ~28B con vision y MTP en hardware Apple Silicon con un consumo de memoria cercano a los 17 GiB, un umbral que encaja en equipos con 24 o 32 GB de memoria unificada. No obstante, la informacion publicada por el autor es muy limitada: no hay model card descriptiva del modelo base, ni benchmarks, ni detalles de licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, etiqueta `qwen3_5`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit, FP16 y FP32; promedio efectivo 5,310 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de la cuantizacion por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26.896B | 16.272 GB / 15.155 GiB |
| Vision | 0.461B | 1.843 GB / 1.716 GiB |
| Cabeza MTP | 0.425B | 0.323 GB / 0.301 GiB |
| Total | 27.781B | 18.439 GB / 17.172 GiB |

Distribucion por precision:

| Formato | Pesos logicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Affine 4-bit, grupo 64 | 19.393B | 69,807% | 4,50 |
| Affine 5-bit, grupo 64 | 6.579B | 23,680% | 5,50 |
| Affine 6-bit, grupo 64 | 1.282B | 4,615% | 6,50 |
| Affine 8-bit, grupo 64 | 0.011B | 0,041% | 8,50 |
| FP16 | 0.055B | 0,198% | 16,00 |
| FP32 | 0.461B | 1,658% | 32,00 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ukisai/Swift-Qwen3.8-27b. La etiqueta `qwen3_5` indica que deriva de la familia Qwen 3.5, y el desglose de componentes confirma tres bloques diferenciados: un modelo de lenguaje de 26.896B, un encoder o modulo de vision de 0.461B y una cabeza MTP de 0.425B. La presencia de esta ultima es la innovacion mas destacable del checkpoint: la prediccion multi-token permite generar varios tokens por paso y acelerar la decodificacion, habitualmente combinada con decodificacion especulativa.

El checkpoint publicado no es un modelo entrenado desde cero, sino una cuantizacion del modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el proceso de destilacion o ajuste que dio lugar al sufijo "Swift" del modelo base.

En cuanto a la cuantizacion, oQ aplica precision mixta por capas: la mayor parte de los pesos (69,8%) queda en 4-bit, un 23,7% en 5-bit y un 4,6% en 6-bit, reservando FP16 y FP32 para un 1,9% de los parametros (previsiblemente capas sensibles como normalizaciones, embeddings o componentes de la cabeza MTP). El uso de grupo de 64 en todas las cuantizaciones affine es un compromiso habitual entre calidad y tamano.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 26.896B es el nucleo del checkpoint.
- Vision: incluye un modulo de vision de 0.461B, por lo que cabe esperar capacidades de comprension de imagenes, aunque no se documenta su alcance.
- Prediccion multi-token (MTP): la cabeza dedicada permite decodificacion especulativa y generacion de varios tokens por paso.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 17.172 GiB, por lo que se puede cargar en un Mac con 24 o 32 GB de memoria unificada usando la libreria mlx. Es el caso de uso principal de esta publicacion.
- Prototipado de asistentes multimodales en local: gracias al modulo de vision de 0.461B, se puede experimentar con tareas de descripcion de imagenes o respuesta a preguntas visuales sin depender de la nube.
- Aceleracion de la generacion con MTP: la cabeza de prediccion multi-token permite probar tecnicas de decodificacion especulativa para reducir la latencia en tareas de generacion larga, como resumenes o redaccion asistida.
- Evaluacion comparativa de cuantizaciones: el esquema de precision mixta de oQ permite medir la perdida de calidad frente al modelo base en FP16/BF16, util para decidir que nivel de cuantizacion usar en produccion.
- Desarrollo de aplicaciones de escritorio offline: al ejecutarse con MLX en un portatil, encaja en herramientas de escritorio que requieran privacidad de datos y no puedan enviar contenido a servicios externos.
- Experimentacion academica con modelos de ~28B: permite a investigadores sin acceso a GPUs de datacenter estudiar el comportamiento de modelos de este tamano, incluida la interaccion entre vision y lenguaje.
- Fine-tuning ligero o adaptadores: el formato safetensors y el soporte MLX facilitan experimentos de ajuste con LoRA sobre el checkpoint cuantizado, aunque la cuantizacion limita algunas tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint unicamente documenta el esquema de cuantizacion y el desglose de almacenamiento; no incluye metricas de calidad (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con el modelo base en precision completa.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 17.172 GiB solo para los pesos; con overhead de contexto y buffers de inferencia, se recomienda un minimo de 24 GB de memoria unificada y, preferiblemente, 32 GB.
- GPU recomendadas: el checkpoint esta en formato MLX, disenado para Apple Silicon (series M1, M2, M3, M4 y superiores). No es directamente compatible con CUDA sin conversion previa a otro formato.
- Cabe en GPU de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada (MacBook Pro M2/M3/M4 Pro con 24-36 GB, Mac Studio con 32 GB o mas). En GPUs NVIDIA de consumo no se puede usar tal cual por el formato MLX.
- Opciones de despliegue: libreria mlx y mlx-lm en macOS; la herramienta oQ (oMLX) para reproducir o modificar la cuantizacion. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere mejoras de velocidad frente a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ4e-fp16-mtp | 27.781B | no disponible | MLX safetensors, cuantizacion mixta ~5,3 bits | no disponible | Vision + MTP; 17.172 GiB |
| ukisai/Swift-Qwen3.8-27b (modelo base) | 27.781B | no disponible | no disponible | no disponible | Referencia en precision original; sin cuantizar |
| Qwen 3.5 (familia, modelos comparables) | no disponible | no disponible | no disponible | no disponible | Familia de origen segun la etiqueta `qwen3_5`; no se dispone de datos concretos del modelo base |

No se dispone de informacion suficiente para comparar rendimiento, contexto o licencia con alternativas concretas de la misma categoria. La comparativa se limita a los datos estructurales del checkpoint y su modelo base.

## Limitaciones y advertencias

- La cuantizacion mixta a ~5,3 bits/peso introduce perdida de calidad respecto al modelo base en precision completa; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- No hay model card descriptiva del modelo base ni del proceso de ajuste "Swift", por lo que se desconoce el dataset, los sesgos y el comportamiento real del modelo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; sin benchmarks ni evaluaciones publicadas no se puede acotar su magnitud.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base ukisai/Swift-Qwen3.8-27b antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del que use el modelo base.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con documentos largos o conversaciones multi-turno extensas.
- Compatibilidad restringida: el formato MLX solo funciona en Apple Silicon; no hay pesos GGUF ni versiones para CUDA publicadas en este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente del checkpoint.
- El modulo de vision y la cabeza MTP pueden no estar soportados por todas las versiones de las herramientas MLX; conviene verificar la compatibilidad con la version de oMLX indicada (v0.7.4.dev1).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
