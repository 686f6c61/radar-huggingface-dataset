# Ishowbackup/LFM2.5-24B-A2B

## Resumen

LFM2.5-24B-A2B es un modelo de razonamiento de tipo Mixture-of-Experts (MoE) con 24.000 millones de parametros totales y solo 2.450 millones de parametros activos por token. Lo desarrolla Liquid AI y es el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde LFM2.5-230M hasta esta variante. El checkpoint publicado en el repositorio analizado es una replica alojada por el usuario Ishowbackup, cuya model card reproduce integramente la del modelo original de Liquid AI (LiquidAI/LFM2.5-24B-A2B).

El objetivo declarado del modelo es ejecutar agentes rapidos y privados en dispositivo ("on-device"), con un presupuesto de computo por token muy bajo gracias al enrutado disperso. Es un modelo de razonamiento puro: siempre genera un bloque de pensamiento antes de responder, lo que lo diferencia de LFM2-24B-A2B, su antecesor no razonador. Incorpora una ventana de contexto de 131.072 tokens, un vocabulario de 128.000 entradas y soporte para 16 idiomas, entre ellos el espanol.

Su relevancia actual radica en la relacion entre capacidad agentica y coste de inferencia: segun la documentacion del autor, compite con Qwen3.6-35B-A3B (un modelo con aproximadamente un 50 % mas de parametros totales y activos) en tareas de uso de herramientas, y se ejecuta hasta 1,7 veces mas rapido que MoEs comparables en dispositivo. Ademas, se distribuye con licencia lfm1.0 en formato nativo safetensors y con checkpoints derivados en FP8, GGUF, ONNX y MLX-4bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida `lfm2_moe`: 40 capas (30 bloques de convolucion corta con doble gate + 10 capas de atencion GQA) |
| Parametros totales | 23.971.585.280 (~24,0 B) |
| Parametros activos | 2,45 B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16/FP16 nativo, FP8 (pesos en FP8 por bloques y activaciones FP8 dinamicas), GGUF (varias), MLX 4-bit, ONNX |
| Idiomas soportados | 16: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | lfm1.0 (identificador `other`; consultar el fichero LICENSE) |
| Formato de pesos | safetensors (nativo); variantes en GGUF, ONNX y MLX. Tamano del repositorio analizado: 48,0 GB |
| Expertos | 64 expertos por bloque MoE, enrutado top-4 |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento | 36 billones (trillones en notacion anglosajona) de tokens |
| Parametros de generacion recomendados | temperature 0.1, top_k 50, repetition_penalty 1.05 |
| Modelo base | LiquidAI/LFM2.5-24B-A2B-Base |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos en una pila de 40 capas: 30 bloques de convolucion corta con doble gate y 10 capas de atencion con Grouped Query Attention (GQA). Sobre esta columna vertebral se aplica una capa Mixture-of-Experts con 64 expertos por bloque y enrutado top-4, de modo que cada token activa solo 2,45 B de los 24,0 B de parametros. Esta combinacion de convoluciones y atencion dispersa es la que permite reducir el coste por token sin renunciar a la ventana de 131.072 tokens. El modelo fue preentrenado con un presupuesto declarado de 36 billones de tokens.

El checkpoint publicado corresponde al modelo post-entrenado para cargas de trabajo agenticas, partiendo de LiquidAI/LFM2.5-24B-A2B-Base. La model card no detalla la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO, por lo que esos datos no estan disponibles en la informacion proporcionada. Si se especifica que es un modelo de razonamiento puro: la plantilla de chat (formato tipo ChatML con `<|startoftext|>`, `<|im_start|>` e `<|im_end|>`) inserta automaticamente la etiqueta `<think>` al inicio del turno del asistente, de modo que el modelo siempre piensa antes de responder. Tambien se anuncia un modelo borrador, LFM2.5-24B-A2B-DSpark, para decodificacion especulativa con SGLang, aunque figura como "proximamente" y no esta disponible.

## Capacidades

- Generacion de texto y razonamiento explicito: al ser un modelo de razonamiento puro, emite un bloque de pensamiento antes de cada respuesta.
- Uso de herramientas (tool calling / function calling): es una de las capacidades objetivo del post-entrenamiento.
- Flujos agenticos multi-paso: resuelve tareas encadenadas dentro de harnesses de agentes habituales.
- Contexto largo: ventana de 131.072 tokens, adecuada para historiales extensos, repositorios de codigo o documentos largos.
- Multilingue: 16 idiomas, incluidos espanol, portugues, frances, aleman, italiano, arabe, chino, japones, coreano, hindi, ruso, polaco, vietnamita, tailandes e indonesio.
- Despliegue en dispositivo: optimizado para inferencia local en CPU, Apple Silicon y aceleradores de borde mediante GGUF, MLX y ONNX.
- Decodificacion especulativa: prevista mediante el modelo borrador DSpark con SGLang (aun no publicado).
- Capacidades no soportadas: el modelo es exclusivamente de texto; no hay soporte declarado de vision ni de audio.

## Casos de uso

- Agentes locales de automatizacion de escritorio: el modelo puede encadenar pasos, invocar herramientas del sistema y mantener el contexto de la sesion sin enviar datos a la nube, gracias a sus 2,45 B de parametros activos y a su ventana de 131.072 tokens.
- Asistentes de atencion al cliente con recuperacion aumentada: la propia model card recomienda combinarlo con retrieval o busqueda web en lugar de usarlo como almacen de conocimiento; su fortaleza esta en decidir cuando llamar a la herramienta de busqueda y sintetizar el resultado.
- Copilotos de codigo en equipos de desarrollo: puede integrarse en pipelines de CI/CD o en editores para tareas de refactorizacion y explicacion de fragmentos, con soporte de tool calling para consultar repositorios o ejecutar comandos.
- Procesamiento de documentos largos multilingues: con 131.072 tokens de contexto puede resumir contratos, informes tecnicos o actas en cualquiera de los 16 idiomas soportados, incluidos pares cruzados como aleman-espanol.
- Agentes de analisis de datos en local: ejecucion de razonamiento multi-paso sobre tablas y trazas, invocando funciones de calculo, en maquinas sin GPU dedicada mediante los checkpoints GGUF o MLX-4bit.
- Automatizacion de soporte tecnico interno: diagnostico de incidencias paso a paso con consulta a bases de conocimiento internas, un escenario donde el bajo coste por token de razonamiento del MoE resulta relevante frente a modelos densos del mismo tamano.
- Despliegue en borde con requisitos de privacidad: entornos sanitarios, legales o industriales donde los datos no pueden salir del dispositivo, usando ONNX Runtime o llama.cpp sobre hardware local.
- Servicio de alto rendimiento en GPU: con el checkpoint FP8 puede servir cargas concurrentes en vLLM o SGLang, con hasta 21.000 tokens de salida por segundo agregados en una unica NVIDIA B300 segun los datos del autor.

## Benchmarks y rendimiento

Los unicos datos numericos de evaluacion presentes en la informacion disponible son los siguientes:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (agentico / uso de herramientas) | 48,09 | 38,19 |

| Metrica de inferencia | Valor |
|---|---|
| Throughput en Apple M5 Max | 184 tok/s |
| Throughput agregado de salida en 1x NVIDIA B300 | hasta 21.000 tok/s |
| Velocidad relativa frente a MoEs comparables en dispositivo | hasta 1,7x mas rapido |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval, GSM8K, MATH o similares, ni detalles sobre la metodologia de evaluacion de LiveClaw.

## Requisitos de hardware

Las cifras de memoria de esta seccion son estimaciones calculadas a partir del numero de parametros y del tamano de los checkpoints publicados, no datos oficiales del autor.

- Pesos en BF16/FP16: aproximadamente 48 GB (coincide con los 48,0 GB del repositorio). Requiere GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPU.
- Pesos en FP8: en torno a 24-26 GB con el overhead de contexto. Cabe justo en una RTX 4090 de 24 GB si se limita la longitud de contexto; holgado en L40S (48 GB), A100 40 GB o H100.
- GGUF Q4_K_M: aproximadamente 14-15 GB. Entra en RTX 4090, RTX 3090, RTX 4080 y, con contexto reducido, en GPU de 16 GB.
- GGUF Q8: en torno a 25 GB, requiere GPU de 32 GB o superior.
- MLX 4-bit: aproximadamente 13-14 GB, ejecutable en Mac con memoria unificada de 16 GB o mas. El autor reporta 184 tok/s en un Apple M5 Max.
- La cache KV para 131.072 tokens no esta cuantificada en la informacion disponible y consume VRAM adicional; en las 10 capas GQA su impacto es menor que en atencion completa, pero debe dimensionarse segun el lote y el contexto reales.
- Opciones de despliegue documentadas: Transformers, vLLM y SGLang para el checkpoint nativo y FP8; llama.cpp y herramientas compatibles con GGUF para CPU y despliegue local; MLX para Apple Silicon; ONNX Runtime para cloud, borde y movil.
- Latencia: no disponible. Solo se conocen las cifras de throughput indicadas en la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | LiveClaw | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B | 24,0 B / 2,45 B | 131.072 | 48,09 | lfm1.0 | safetensors, FP8, GGUF, ONNX, MLX-4bit |
| Qwen3.6-35B-A3B | ~35 B / ~3 B (aprox., segun la model card: ~50 % mas que LFM2.5) | no disponible | 38,19 | no disponible | no disponible en la informacion proporcionada |
| LFM2-24B-A2B (predecesor) | 24 B / 2 B | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| LFM2.5-230M (mismo familia) | 230 M (no MoE) | no disponible | no disponible | lfm1.0 | no disponible en la informacion proporcionada |

Los datos de Qwen3.6-35B-A3B proceden de la propia model card de LFM2.5-24B-A2B, que es la fuente que afirma la ventaja en LiveClaw. No se dispone de evaluaciones independientes en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimiento limitado: la model card indica explicitamente que el modelo no esta recomendado para tareas intensivas en conocimiento por si solo y que debe combinarse con recuperacion o busqueda web. Esto implica un riesgo elevado de respuestas incorrectas o desactualizadas en preguntas factuales.
- Alucinacion: al ser un modelo generativo sin mecanismo de verificacion propio, puede producir hechos, citas o APIs inexistentes, especialmente fuera del dominio de sus datos de entrenamiento (composicion no detallada).
- Coste de razonamiento obligatorio: al ser un modelo de razonamiento puro, siempre genera tokens de pensamiento antes de responder, lo que aumenta la latencia y el consumo de tokens de salida en comparacion con un modelo no razonador del mismo tamano. Los parametros de generacion recomendados (temperature 0.1, top_k 50, repetition_penalty 1.05) son poco convencionales y conviene respetarlos.
- Cobertura de idiomas desigual: aunque se declaran 16 idiomas, no se publican metricas por idioma. El rendimiento en lenguas con menos presencia en los datos de entrenamiento, incluido el espanol en dominios especializados, no esta cuantificado.
- Contexto: la ventana es de 131.072 tokens, pero no se documenta el rendimiento en recuperacion de informacion en posiciones intermedias (efecto "lost in the middle"), ni el coste real de la cache KV a maxima longitud.
- Licencia: se trata de la licencia lfm1.0, marcada como `other`. No se detallan en la informacion proporcionada las condiciones para uso comercial, redistribucion o entrenamiento de modelos derivados; es imprescindible revisar el fichero LICENSE antes de un despliegue en produccion.
- Repositorio analizado: el repositorio Ishowbackup/LFM2.5-24B-A2B registra 0 descargas y 0 me gusta, y su model card es una copia de la del modelo original de Liquid AI. Para uso en produccion conviene validar los pesos contra el repositorio oficial (LiquidAI/LFM2.5-24B-A2B).
- Capacidades ausentes: sin vision, sin audio y sin soporte declarado de modos de pensamiento configurables; el `think` no es opcional.

## Enlaces

- Repositorio analizado: https://huggingface.co/Ishowbackup/LFM2.5-24B-A2B
- Modelo original: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Checkpoint FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Checkpoint GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Checkpoint ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Checkpoint MLX 4-bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo de la familia de menor tamano: https://huggingface.co/LiquidAI/LFM2.5-230M
- Predecesor no razonador: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Blog del autor: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Blog en Hugging Face: https://huggingface.co/blog/LiquidAI/lfm25-24b-a2b
- Documentacion del modelo: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Primeros pasos: https://docs.liquid.ai/lfm/getting-started/welcome
- Plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Playground: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2511.23404
- Cobertura de prensa: https://www.unite.ai/liquid-ai-releases-open-weight-lfm2-5-24b-a2b-for-on-device-agents/
