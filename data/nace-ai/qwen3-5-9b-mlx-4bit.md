# nace-ai/Qwen3.5-9B-MLX-4bit

## Resumen

Qwen3.5-9B-MLX-4bit es una cuantizacion en 4 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por Nace.AI y empaquetada en formato MLX para su ejecucion sobre Apple Silicon. El modelo base es un transformer multimodal de tipo image-text-to-text de aproximadamente 9.400 millones de parametros, distribuido bajo licencia Apache 2.0. Esta version concreta no es un modelo nuevo, sino un artefacto de inferencia optimizado: reduce el peso del modelo a unos 6,0 GB de repositorio (5,95 GB en ficheros de pesos) para que quepa en la memoria unificada de un Mac.

Su relevancia es practica para el desarrollador que quiere ejecutar un modelo multimodal de casi 10.000 millones de parametros de forma local en hardware de consumo Apple, sin depender de la nube. El autor publica una comparacion de fidelidad frente al modelo original en BF16 (divergencia KL y acuerdo en el token superior) frente a otros empaquetados publicos de 4 bits, lo que permite elegir el pack con mejor relacion tamano/calidad. La inferencia se realiza con mlx-lm o con Kapitsa, el motor de inferencia local del propio autor.

La ficha describe el artefacto cuantizado; los datos de arquitectura, entrenamiento y capacidades del modelo subyacente no estan detallados en la informacion proporcionada y se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B, familia Qwen3.5) |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion de fidelidad usa ventanas de 512 tokens, no el contexto maximo) |
| Tipos de cuantizacion | 4 bits (MLX), con pesos auxiliares incluidos en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 6,0 GB (5,95 GB en ficheros de pesos) |
| Payload auditado del modelo de lenguaje | 5.038.041.600 bytes (5,04 GB), excluyendo vision y MTP |
| Modalidad | image-text-to-text (multimodal) |
| Libreria de inferencia | mlx (mlx-lm 0.32.2 o superior; Kapitsa) |
| Hardware objetivo | Apple Silicon (memoria unificada) |

## Arquitectura y entrenamiento

Esta publicacion no aporta informacion sobre la arquitectura interna del modelo base Qwen3.5-9B ni sobre su proceso de entrenamiento: no se detallan el tipo de transformer, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico deducible de los metadatos es que el modelo base es multimodal (pipeline image-text-to-text) e incluye componentes de vision y de prediccion multi-token (MTP), dado que la auditoria de pesos del autor los excluye explicitamente del payload del modelo de lenguaje.

La innovacion tecnica de este artefacto es la cuantizacion en 4 bits realizada por Nace.AI con formato MLX, orientada a Apple Silicon. El autor publica una evaluacion de fidelidad frente al modelo de referencia en BF16, medida el 2026-11-11 con MLX CUDA sobre GPU L40S (no Metal), con ventanas de contexto de 512 tokens, 64 ventanas de evaluacion, 4000 replicas de bootstrap y semilla 469, sobre corpus de wikitext2 (40 ventanas), gsm8k_train_chat (12 ventanas) y humaneval (12 ventanas). Los resultados se recogen en la seccion de benchmarks.

## Capacidades

- Generacion de texto conversacional y modo "thinking" (razonamiento extendido) configurable mediante la plantilla de chat (`enable_thinking`).
- Entrada de imagen y texto (image-text-to-text), segun el pipeline declarado del modelo base.
- Codigo y matematicas: el autor evalua la fidelidad de la cuantizacion sobre humaneval y gsm8k, lo que indica que el modelo base cubre esas tareas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modo thinking es la unica capacidad relacionada documentada).
- Capacidades multilingues: no disponible.
- Presets de muestreo documentados para tres modos: thinking general (temp 1, top_p 0.95, presence penalty 1.5), thinking para codigo preciso (temp 0.6, top_p 0.95, presence penalty 0) y no-thinking general (temp 0.7, top_p 0.8, presence penalty 1.5), con top_k=20, min_p=0 y repetition_penalty=1.

## Casos de uso

- Inferencia local en Mac para desarrollo: ejecutar el modelo con `mlx_lm.generate` o `kapitsa serve` permite probar prompts multimodales sin salir del portatil, con un peso de unos 6 GB que cabe en la memoria unificada de equipos Apple Silicon de gama alta.
- Prototipado de asistentes conversacionales con modo thinking: el preset de thinking general (temp 1, top_p 0.95, presence penalty 1.5) esta pensado para tareas de razonamiento; util para validar prompts y flujos antes de mover la carga a un servidor.
- Asistencia de codigo en local: el preset de thinking para codigo preciso (temp 0.6, presence penalty 0) y la evaluacion sobre humaneval indican uso para generacion y revision de codigo en un entorno privado, sin enviar el codigo a terceros.
- Procesamiento de documentos con imagen: al ser un modelo image-text-to-text, puede emplearse para extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en un flujo local.
- Despliegue de servidor local con Kapitsa: `kapitsa serve --model nace-ai/Qwen3.5-9B-MLX-4bit --private` levanta un endpoint local, adecuado para integrar el modelo en herramientas internas o demos sin conexion.
- Evaluacion de cuantizaciones: el pack sirve como referencia para comparar fidelidad frente a otros empaquetados de 4 bits (AtomicChat, lmstudio-community, mlx-community, Brooooooklyn, mlx-works) usando las metricas KL y acuerdo de token superior publicadas.
- Educacion e investigacion sin GPU: permite estudiar el comportamiento de un modelo multimodal de 9B en un equipo de sobremesa Apple, sin infraestructura CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente metricas de fidelidad de la cuantizacion frente al modelo en BF16, sobre corpus de texto original:

| Pack | GB (pesos) | KL (IC 95%) | Acuerdo token superior |
|---|---:|---|---:|
| Brooooooklyn UD-Q4_K_XL-mlx | 8,081 | 0,026063 [0,023768; 0,028317] | 93,56% |
| mlx-community OptiQ-4bit | 8,013 | 0,029220 [0,026377; 0,032296] | 93,39% |
| Nace (este repo) | 5,950 | 0,036619 [0,033267; 0,040221] | 92,41% |
| mlx-works oQ4e-mtp | 6,231 | 0,042674 [0,038978; 0,046532] | 91,03% |
| AtomicChat MLX-4bit | 5,038 | 0,080555 [0,073764; 0,087457] | 88,51% |
| lmstudio-community MLX-4bit | 5,950 | 0,080555 [0,073764; 0,087457] | 88,51% |
| mlx-community 4bit | 5,950 | 0,081409 [0,074333; 0,088666] | 88,42% |
| mlx-community MLX-4bit | 5,950 | 0,081409 [0,074333; 0,088666] | 88,42% |

Menor KL y mayor acuerdo indican mayor cercania al modelo BF16. Medicion realizada el 2026-11-11 con MLX CUDA sobre L40S, no sobre Apple Metal. Los intervalos de confianza usan bootstrap por remuestreo de ventanas de contexto (4000 replicas, semilla 469) y no constituyen un veredicto de significancia estadistica.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 6,0 GB y los pesos suman 5,95 GB; el payload auditado del modelo de lenguaje es de 5,04 GB. Se necesita memoria unificada suficiente para pesos, cache KV y contexto; con contexto de 512 tokens y este tamano de pesos, un Mac con 16 GB de memoria unificada es el minimo razonable, y 24-32 GB dan margen para contextos mayores.
- GPU: el formato es MLX, orientado a Apple Silicon (serie M). No esta pensado para GPU NVIDIA o AMD en produccion; la evaluacion del autor uso MLX CUDA sobre L40S solo como banco de medida.
- GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no aplica a RTX 4090 u otras GPU discretas por el formato MLX.
- Despliegue: mlx-lm 0.32.2 (CLI `mlx_lm.generate`), Kapitsa (`kapitsa serve`), y cualquier runtime compatible con MLX. Ollama, vLLM y TGI no estan documentados para este pack.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: la CLI de mlx-lm no expone penalizaciones de presencia ni de repeticion, por lo que los presets completos requieren un motor que las soporte (Kapitsa u otro).

## Comparativa con modelos similares

Comparativa de empaquetados 4-bit del mismo modelo base Qwen3.5-9B (misma categoria, mismo modelo, distinta cuantizacion):

| Pack | Pesos (GB) | KL | Acuerdo token superior | Licencia |
|---|---:|---:|---:|---|
| Nace (este repo) | 5,950 | 0,036619 | 92,41% | Apache 2.0 |
| Brooooooklyn UD-Q4_K_XL-mlx | 8,081 | 0,026063 | 93,56% | no disponible |
| mlx-community OptiQ-4bit | 8,013 | 0,029220 | 93,39% | no disponible |
| mlx-works oQ4e-mtp | 6,231 | 0,042674 | 91,03% | no disponible |
| AtomicChat MLX-4bit | 5,038 | 0,080555 | 88,51% | no disponible |
| lmstudio-community MLX-4bit | 5,950 | 0,080555 | 88,51% | no disponible |
| mlx-community 4bit | 5,950 | 0,081409 | 88,42% | no disponible |

El autor indica ademas la existencia de un pack mas cercano al original: nace-ai/Qwen3.5-9B-MLX, de 5,29 GB. No se dispone de comparativa con modelos de otros desarrolladores del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion en 4 bits: introduce divergencia respecto al modelo en BF16 (KL de 0,036619 y acuerdo de token superior del 92,41% en la evaluacion del autor). Para tareas sensibles a la precision exacta, conviene validar contra el modelo original.
- La evaluacion de fidelidad se realizo con MLX CUDA sobre L40S, no sobre Apple Metal; el comportamiento en el hardware objetivo puede diferir.
- Las metricas de fidelidad usan ventanas de 512 tokens y no informan sobre el rendimiento con contextos largos.
- La CLI de mlx-lm no soporta penalizaciones de presencia ni de repeticion, lo que impide aplicar los presets recomendados al pie de la letra con esa herramienta.
- No hay datos publicados de sesgos, tasa de alucinacion ni rendimiento multilingue en la informacion disponible.
- La licencia Apache 2.0 del artefacto permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a servidores NVIDIA sin conversion.
- El modelo es multimodal, pero la model card solo documenta el uso de texto en los ejemplos de arranque; el soporte de imagen en las herramientas citadas no esta detallado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pack alternativo mas cercano al original (5,29 GB): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Otros tamanos: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Motor de inferencia Kapitsa: https://github.com/nace-ai/kapitsa
- Nace.AI: https://www.nace.ai/
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Instalacion de uv: https://docs.astral.sh/uv/getting-started/installation/
- Mejores practicas del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B#best-practices
- Pack AtomicChat: https://huggingface.co/AtomicChat/Qwen3.5-9B-MLX-4bit
- Pack Brooooooklyn: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx
- Pack lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
