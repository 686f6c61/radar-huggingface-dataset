# hermitdave/LFM3-1.7B-MLX-DWQ-4bit

## Resumen

LFM3-1.7B-MLX-DWQ-4bit es una cuantizacion de 4 bits del modelo LFM3-1.7B de Liquid AI, publicada por el usuario hermitdave (Hermes Agent, Nous Research) en formato MLX para Apple Silicon. El modelo base es un transformer hibrido de 1.728 millones de parametros que alterna bloques de convolucion corta, atencion completa y atencion deslizante, con 24 capas y un vocabulario de 128.000 tokens. Esta version aplica DWQ (distillation-weighted quantization) sobre la cuantizacion oficial de Liquid AI, refinando unicamente las escalas y sesgos por grupo mediante descenso de gradiente contra la distribucion de salida del modelo BF16 original.

La innovacion principal de este artefacto no esta en el modelo base, sino en el metodo de cuantizacion: DWQ trata la rejilla de cuantizacion como parametros libres y la ajusta para minimizar la divergencia KL respecto al profesor en BF16, sin modificar los pesos enteros cuantizados. Segun la model card, esto reduce la KL un 39% y mejora la coincidencia top-1 en 5,13 puntos respecto a la cuantizacion round-to-nearest (RTN) equivalente, con una perplejidad de 22,91 frente a 27,35 en RTN sobre texto retenido de FineWeb-Edu.

Es relevante para desarrolladores que despliegan modelos pequenos en Macs con Apple Silicon, ya que ofrece una alternativa de 4 bits con fidelidad al modelo original superior a la cuantizacion estandar, en un unico shard safetensors de 973 MB. No obstante, no se han publicado evaluaciones en benchmarks de tareas, por lo que su rendimiento downstream es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (convolucion corta, atencion completa y atencion deslizante alternadas), 24 capas |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits, group size 64, modo affine (DWQ sobre RTN) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX), un unico shard de 973 MB |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer hibrido de 24 capas que combina bloques de convolucion corta con bloques de atencion completa y de atencion deslizante, y emplea un vocabulario de 128.000 tokens. Esta configuracion busca reducir el coste computacional de la atencion en contextos largos manteniendo capacidad expresiva. Los detalles concretos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan incluidos en la informacion proporcionada y remiten a la model card original de Liquid AI.

La capa de cuantizacion si esta documentada con detalle. DWQ parte de la cuantizacion oficial de Liquid AI (4 bits, group size 64, affine) y congela los pesos enteros, optimizando solo las escalas y sesgos por grupo: 54,4 millones de parametros entrenables, el 3,147% del total. El profesor es el modelo BF16 original y la perdida es KL sobre los 1.024 logits mas altos del profesor con temperatura 2,0. La calibracion usa FineWeb-Edu tokenizado con el vocabulario de LFM3: epoca 1 con 512 muestras (480 de entrenamiento, 32 de validacion) y longitud 1.024; epoca 2 como continuacion con 1.056 muestras (1.024 de entrenamiento, 32 de validacion) y longitud 2.048. Optimizador Adam, learning rate 1e-6 en la primera epoca y 5e-7 en la segunda, batch size 4, 120 y 256 pasos respectivamente.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en 16 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Razonamiento general y matematicas: la model card recomienda ajustes de generacion especificos para matematicas y ciencia (temperatura 1,0, top_p 0,95, top_k 20, repetition_penalty 1,0).
- Soporte de plantilla de chat (`apply_chat_template`) para dialogos multi-turno.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no confirmadas en la informacion proporcionada; la propia model card indica que no se ha evaluado el rendimiento en tareas de agente o uso de herramientas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistentes conversacionales locales en macOS: el modelo se carga con `mlx_lm` y cabe en memoria unificada de un Mac moderno, lo que permite desplegar un chatbot privado sin conexion a servicios externos.
- Generacion de texto y redaccion asistida en espanol y otras lenguas europeas: el soporte de 16 idiomas y la plantilla de chat permiten usarlo como motor de redaccion en aplicaciones de escritorio.
- Prototipado rapido de pipelines de generacion en Apple Silicon: al ser un unico shard safetensors de 973 MB, la carga es rapida y facilita iterar sobre prompts y ajustes de muestreo.
- Aplicaciones educativas o de consulta con recuperacion aumentada: la model card recomienda emparejarlo con retrieval para trabajo intensivo en conocimiento, dado que es una compresion con perdida.
- Traduccion y procesamiento multilingue ligero: la cobertura de 16 idiomas permite tareas de traduccion o resumen en entornos con recursos limitados.
- Generacion de respuestas en asistentes de soporte con contexto conversacional: la plantilla de chat y los ajustes de muestreo recomendados (temperatura 0,1, top_k 50, repetition_penalty 1,1) estan orientados a respuestas deterministas y controladas.
- Experimentacion con tecnicas de cuantizacion: el modelo sirve como referencia practica de DWQ frente a RTN para investigadores que estudien metodos de compresion.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de fidelidad de cuantizacion sobre texto retenido (32 secuencias de 1.024 tokens de FineWeb-Edu, no usadas en calibracion), comparadas con el modelo BF16 original:

| Modelo | Perplejidad (menor es mejor) | KL vs BF16 (menor es mejor) | Coincidencia top-1 (mayor es mejor) |
|---|---|---|---|
| BF16 (referencia) | 23,61 | — | — |
| Liquid AI 4-bit RTN | 27,35 | 0,1946 | 76,81% |
| DWQ, epoca 1 | 22,67 | 0,1424 | 80,50% |
| DWQ, epoca 2 (este modelo) | 22,91 | 0,1181 | 81,94% |

Delta de DWQ (epoca 2) frente a RTN: KL -39%, coincidencia top-1 +5,13 puntos, perplejidad -16%. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1 GB para los pesos en 4 bits (973 MB de safetensors), mas overhead de activaciones y cache KV; el consumo real depende de la longitud de contexto y del backend MLX.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el formato MLX no esta pensado para GPU NVIDIA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para contextos largos.
- Opciones de despliegue: `mlx-lm` (libreria indicada en la model card); otros backends como llama.cpp, vLLM, Ollama o TGI no estan confirmados para este artefacto concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/LFM3-1.7B-MLX-DWQ-4bit | 1,73B | no disponible | 4 bits DWQ (MLX) | LFM Open License v1.0 | Hugging Face, MLX |
| LiquidAI/LFM3-1.7B-MLX-4bit | 1,73B | no disponible | 4 bits RTN (MLX) | LFM Open License v1.0 | Hugging Face, MLX |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | BF16 | LFM Open License v1.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de rendimiento en tareas que permitan contrastarlo con alternativas de otros autores. Frente a la cuantizacion RTN oficial, esta version mejora la fidelidad al BF16 (KL 0,1181 frente a 0,1946) con el mismo tamano de pesos.

## Limitaciones y advertencias

- No es un fine-tune: es una compresion con perdida del modelo original; para trabajo intensivo en conocimiento conviene combinarlo con recuperacion (RAG).
- Artefacto derivado: los pesos enteros cuantizados son de Liquid AI; las obligaciones de atribucion y licencia recaen sobre el modelo y la cuantizacion upstream.
- Sin evaluacion en benchmarks de tareas: las cifras publicadas son de perplejidad y acuerdo con el profesor, no de precision downstream; no hay garantia sobre rendimiento en agentes o tool calling.
- La mejora de la epoca 2 sobre la epoca 1 es marginal y, de hecho, la perplejidad frente a ground truth sube un ~1% en la epoca 2 (22,91 frente a 22,67).
- Riesgo de alucinacion inherente a un modelo de 1,7B, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de uso comercial, ya que puede imponer restricciones adicionales.
- Formato MLX: no es portable directamente a ecosistemas CUDA sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM3-1.7B-MLX-DWQ-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Cuantizacion RTN de referencia: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Licencia: LICENSE (referenciado en la model card, no se proporciona URL directa)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
