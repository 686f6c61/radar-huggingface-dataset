# JetBrains-Research/budget-internalization-qwen3.5-4b-1k-grpo-spreadsheet-selectsloth-s100

## Resumen

El modelo `budget-internalization-qwen3.5-4b-1k-grpo-spreadsheet-selectsloth-s100` es un ajuste fino por aprendizaje por refuerzo (GRPO) de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su proposito es internalizar un presupuesto fijo de generacion de 1.024 tokens en tareas de manipulacion de hojas de calculo, de modo que el modelo aprenda a resolver problemas complejos sin recurrir a cadenas de razonamiento largas en tiempo de inferencia. Se enmarca en el articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo parte de una arquitectura Qwen3.5 de aproximadamente 4.660 millones de parametros (4,66 B) y se entrena sobre las tareas de ExcelForum, un conjunto de tareas de hoja de calculo. El checkpoint publicado corresponde al paso 100 de un entrenamiento con 32 prompts y 8 rollouts por paso, con recompensa basada en un verificador de tareas sobre la hoja resultante. Es relevante porque explora una via alternativa al escalado en tiempo de inferencia: en lugar de permitir razonamientos cada vez mas largos, se entrena al modelo para operar con un presupuesto de tokens fijo y mantener la precision dentro de ese limite.

La relevancia practica esta en el control de coste y latencia: si un modelo de 4 B puede resolver tareas de hoja de calculo con un maximo de 1.024 tokens de salida, el despliegue resulta mas predecible en terminos de longitud de respuesta y consumo de GPU. El modelo se distribuye en BF16 con pesos safetensors y licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5); multimodal image-text-to-text segun pipeline_tag |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-4B, un transformer denso de 4,66 B de parametros. El pipeline declarado es `image-text-to-text`, lo que indica que la familia Qwen3.5 incorpora capacidades multimodales de entrada imagen-texto; sin embargo, la model card no detalla la arquitectura interna ni la composicion del dataset multimodal. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token.

Los datos de entrenamiento son las tareas de manipulacion de hojas de calculo de ExcelForum, con un maximo de 10 epocas. La configuracion es de 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 100 pasos. La recompensa proviene de un verificador de tareas aplicado a la hoja de calculo producida. El rasgo tecnico central es el presupuesto fijo de generacion (`max_new_tokens` = 1.024): el modelo se entrena para obtener la respuesta correcta dentro de ese limite, internalizando el control de longitud en lugar de depender de mecanismos externos de parada o de razonamiento extendido.

## Capacidades

- Generacion de texto y razonamiento con presupuesto fijo de 1.024 tokens de salida.
- Manipulacion de hojas de calculo: resolucion de tareas de ExcelForum mediante la produccion de una hoja de calculo verificable.
- Razonamiento multi-paso dentro de un limite estricto de tokens, orientado a reducir el coste de inferencia.
- Entrada image-text-to-text segun el pipeline declarado por el autor (no se detalla el alcance concreto de la capacidad visual).
- Formato conversacional (tag `conversational`), con plantilla de chat del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de hoja de calculo: el modelo puede recibir una tarea de ExcelForum y producir una hoja de calculo resultante, validable por un verificador, lo que encaja en pipelines de procesamiento por lotes de documentos ofimaticos.
- Agente de edicion de hojas en produccion: al operar con un presupuesto fijo de 1.024 tokens, la latencia y el coste por peticion son predecibles, lo que facilita el dimensionamiento de infraestructura en servicios con alto volumen de peticiones.
- Evaluacion de investigacion en RLVR: sirve como checkpoint de referencia para estudiar la internalizacion de presupuestos de tokens y comparar con variantes de mayor presupuesto o de test-time scaling.
- Generacion de formulas y transformaciones tabulares: el ajuste sobre tareas de ExcelForum lo hace adecuado para asistir en la construccion de formulas y reestructuracion de datos tabulares, siempre con validacion posterior.
- Prototipado de asistentes ofimaticos: integrable via `transformers` con la plantilla de chat del modelo base para construir asistentes que respondan a instrucciones sobre hojas de calculo.
- Investigacion sobre control de longitud de respuesta: util para experimentos que midan la relacion entre presupuesto de generacion, precision en la tarea y coste computacional en modelos de 4 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), mas memoria para activaciones y cache KV; en la practica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,7 GB para pesos; en 4 bits, alrededor de 2,4 GB, mas overhead de activaciones y cache.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB en cuantizacion de 8 bits; en 4 bits podria ejecutarse en GPUs de 8-12 GB, sujeto a la implementacion.
- Opciones de despliegue: `transformers` (libreria declarada), servidores compatibles con endpoints; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El presupuesto fijo de 1.024 tokens de salida acota la longitud maxima de respuesta, lo que permite estimar el coste por peticion, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-1k-grpo-spreadsheet-selectsloth-s100 | 4,66 B | No disponible | GRPO sobre ExcelForum, presupuesto 1.024 tokens | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (modelo base) | 4 B (aproximado) | No disponible | Preentrenamiento y ajuste del modelo base | No disponible en la informacion | Hugging Face (Qwen) |
| Alternativas de 4 B para tareas de hoja de calculo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en tareas de hoja de calculo de ExcelForum; su rendimiento fuera de ese dominio no esta documentado y puede degradarse.
- El presupuesto fijo de 1.024 tokens puede ser insuficiente para tareas que requieran cadenas de razonamiento mas largas; el modelo esta entrenado para operar dentro de ese limite, no para superarlo.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se especifican los idiomas soportados; la cobertura multilingue es desconocida.
- La longitud de contexto no esta disponible, lo que impide garantizar el manejo de entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del checkpoint Qwen/Qwen3.5-4B.
- El checkpoint corresponde al paso 100 de entrenamiento; no se publican curvas de aprendizaje ni comparaciones con checkpoints posteriores.
- La model card incluye una cita marcada como TODO, por lo que la referencia bibliografica completa no esta disponible en el repositorio.
- El pipeline declarado es image-text-to-text, pero no se detalla el comportamiento multimodal ni se aportan ejemplos de uso con imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-1k-grpo-spreadsheet-selectsloth-s100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo citado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (sin enlace disponible en la informacion proporcionada)
- Repositorio de codigo, demo o blog: no disponibles en la informacion proporcionada
