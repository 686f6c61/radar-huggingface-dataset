# darrellbest/Qwen3.5-2B-Heretic-FP8

## Resumen

Qwen3.5-2B-Heretic-FP8 es una compilación cuantizada en FP8 del modelo darrellbest/Qwen3.5-2B-Heretic, publicada por el usuario darrellbest. Se trata de una derivación no oficial de Qwen/Qwen3.5-2B, el modelo denso de 2.274.069.824 parámetros (unos 2,27 mil millones) de la familia Qwen3.5, a la que se le ha eliminado el comportamiento de rechazo mediante la herramienta Heretic y, posteriormente, se ha cuantizado a FP8 con llm-compressor 0.13.0 para su uso con vLLM.

El interés inmediato de esta ficha es doble. Por un lado, documenta una receta de cuantización selectiva poco habitual: solo se cuantizan las capas lineales del MLP y las proyecciones de atención de las capas de atención completa, mientras que el codificador de visión, las capas Gated DeltaNet (linear_attn), el bloque de predicción multi-token y las embeddings se mantienen en bf16, con los parámetros A_log y de normalización de DeltaNet en float32. Por otro, cuantifica el efecto de la ablación de rechazos: 6 rechazos de cada 100 frente a 97 de cada 100 del modelo original, con una divergencia KL de 0,0302 respecto al modelo sin ablacionar.

El resultado ocupa 3,59 GB en lugar de los 4,58 GB de la versión bf16, y el autor lo ha validado en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell, con coincidencia casi palabra por palabra frente al modelo bf16 en generación greedy. Es un modelo pequeño, multimodal (image-text-to-text) y con modo de razonamiento, pensado para despliegues con poco presupuesto de VRAM donde se necesite un asistente conversacional sin filtros de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y capas Gated DeltaNet (linear_attn), codificador de visión y bloque de predicción multi-token (MTP); derivado de Qwen/Qwen3.5-2B |
| Parametros totales | 2.274.069.824 (aproximadamente 2,27 mil millones) |
| Parametros activos | no aplica (no se indica estructura MoE en la informacion disponible) |
| Longitud de contexto | no disponible en la model card; la coleccion de terceros DavidAU indica un minimo de 256k tokens para la familia Qwen3.5, dato no confirmado oficialmente para este checkpoint |
| Tipos de cuantizacion | FP8 W8A8: pesos FP8 E4M3 con escalas por canal y activaciones FP8 dinamicas por token; esquema FP8_DYNAMIC de llm-compressor; existen variantes hermanas en GGUF (BF16, Q8_0, Q4_K_M) y NVFP4 |
| Idiomas soportados | no disponibles (la model card no los especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (FP8); repo de 3,59 GB; pesos auxiliares del bloque MTP en model-auxiliary.safetensors |
| Tamano del repositorio | 3,6 GB |
| Fecha de publicacion | 25 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este checkpoint no aporta entrenamiento nuevo: es una cuantizacion de posentrenamiento sobre darrellbest/Qwen3.5-2B-Heretic, que a su vez es Qwen/Qwen3.5-2B con la conducta de rechazo ablacionada. La ablacion se realizo con Heretic mediante Arbitrary-Rank Ablation (ARA) sobre los pesos completos, una tecnica de rango arbitrario que busca eliminar la direccion de rechazo minimizando el dano al resto de capacidades; el autor reporta 6 rechazos por cada 100 peticiones de prueba frente a 97 por cada 100 del original, con una divergencia KL de 0,0302.

La cuantizacion FP8 se aplico con llm-compressor 0.13.0 usando el esquema FP8_DYNAMIC. El alcance es deliberadamente parcial: se cuantizan las capas lineales del MLP y las proyecciones de atencion de las capas de atencion completa; quedan en bf16 el codificador de vision, las capas Gated DeltaNet (linear_attn), el bloque de prediccion multi-token, las embeddings (atadas a lm_head) y las normalizaciones. Dentro de DeltaNet, los parametros A_log y de normalizacion se mantienen en float32, igual que en el modelo original, porque el estado recurrente de DeltaNet es sensible a la precision reducida. El autor justifica tambien mantener en bf16 la tabla de embeddings de 248.000 tokens por su peso relativo en un modelo de este tamano. Los pesos del bloque MTP, que el guardado cuantizado descarta, se copiaron sin cambios a model-auxiliary.safetensors.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia de la familia Qwen.
- Modo de razonamiento (thinking): el autor verifica que resuelve 17 x 23 = 391 y cierra correctamente su bloque `<think>`.
- Vision: pipeline image-text-to-text, con codificador de vision en bf16; en la prueba del autor describe correctamente una imagen con un circulo rojo y un cuadrado azul.
- Prediccion multi-token (MTP), mantenida fuera de la cuantizacion y disponible en model-auxiliary.safetensors.
- Capacidades heredadas del modelo base Qwen3.5-2B (codigo, matematicas y uso de herramientas) segun lo esperable en la familia Qwen3.5; la model card de este checkpoint no las verifica de forma explicita.
- Generacion especulativa implicita via MTP, si el motor de inferencia lo soporta.
- Conducta de rechazo muy reducida por diseno (6/100 en el modelo bf16 de origen).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local sin filtros: con 3,59 GB de pesos FP8 cabe en GPUs de gama media y permite desplegar un chatbot multi-turno con vLLM en una sola GPU, util para prototipos donde los rechazos del modelo base interrumpen el flujo.
- Procesamiento de documentos con imagenes: el pipeline image-text-to-text permite extraer y describir figuras, diagramas o capturas dentro de un flujo de analisis documental, con el codificador de vision intacto en bf16.
- Generacion de codigo asistida en local: 2,27 mil millones de parametros permiten autocompletado y explicacion de fragmentos en un IDE, con la ventaja de no enviar codigo propietario a servicios externos.
- Investigacion sobre alineacion y ablacion: el par bf16/FP8 con 6/100 rechazos y KL 0,0302 sirve como caso de estudio reproducible para medir el coste de eliminar rechazos y el efecto anadido de la cuantizacion.
- Evaluacion de pipelines de cuantizacion selectiva: la decision de dejar DeltaNet, vision, MTP y embeddings en bf16 es un ejemplo directo para estudiar cuantizacion por capas y comparar FP8 frente a NVFP4 y GGUF Q4_K_M en la misma familia.
- Servicio de alta concurrencia de bajo coste: con aproximadamente 5.300 tok/s agregados a batch 32 en una RTX PRO 6000 Blackwell, es viable como backend de resumen o clasificacion con muchas peticiones cortas.
- Agente ligero con razonamiento paso a paso: el modo thinking y el bloque MTP permiten cadenas de razonamiento cortas en tareas de varios pasos, siempre que el motor de inferencia gestione la plantilla de pensamiento.
- Generacion de datos sinteticos sin restricciones tematicas para entrenamiento o evaluacion, asumiendo la responsabilidad legal y etica del contenido producido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de rechazo, divergencia y throughput, que se recogen a continuacion. No se han medido rechazos sobre los pesos FP8: solo sobre el modelo bf16 de origen.

| Metrica | Qwen3.5-2B-Heretic (bf16) | Qwen3.5-2B-Heretic-FP8 | Modelo original (sin ablacionar) |
|---|---|---|---|
| Rechazos (de 100 peticiones) | 6 | no medido | 97 |
| Divergencia KL frente al modelo sin ablacionar | 0,0302 | no disponible | no aplica |
| Throughput, un solo flujo | ~160 tok/s | ~195 tok/s | no disponible |
| Throughput agregado, batch 32 | ~4.400 tok/s | ~5.300 tok/s | no disponible |

Condiciones de medida: generaciones de 512 tokens, vLLM 0.30.0, RTX PRO 6000 Blackwell, GPU compartida. Los valores por segundo son del autor y no de un benchmark estandarizado, por lo que no son directamente comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 3,59 GB; con activaciones, cache KV y el codificador de vision, un despliegue con contexto corto ronda los 5-6 GB. Con contextos largos, el coste de cache KV crece y puede superar ampliamente el de los pesos.
- GPU validadas: RTX PRO 6000 Blackwell, con vLLM 0.30.0 y salida greedy casi identica a la del modelo bf16.
- GPUs recomendadas: cualquier GPU con soporte FP8 nativo (arquitecturas Hopper, Ada Lovelace y Blackwell). En Ampere o anteriores, el FP8 se emulara o requerira conversion previa, con perdida de rendimiento.
- GPU de consumo: si, cabe en tarjetas con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En GPUs sin FP8 nativo conviene usar la variante GGUF Q4_K_M (1,31 GB mas 0,67 GB de mmproj) con llama.cpp.
- Opciones de despliegue: vLLM es el destino previsto (`vllm serve darrellbest/Qwen3.5-2B-Heretic-FP8`). Para CUDA mas antigua o CPU, las alternativas son llama.cpp y Ollama con la variante GGUF, o transformers/SGLang con la version bf16.
- Latencia y throughput: aproximadamente 195 tok/s en un solo flujo y unos 5.300 tok/s agregados a batch 32 con generaciones de 512 tokens en una RTX PRO 6000 Blackwell compartida.
- Almacenamiento: 3,6 GB de repo, frente a 4,58 GB de la version bf16 y 3,15 GB de la NVFP4.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Contexto | Rechazos | Licencia | Motores compatibles |
|---|---|---|---|---|---|---|
| darrellbest/Qwen3.5-2B-Heretic-FP8 | 2,27B | FP8 W8A8, 3,59 GB | no disponible | no medido en FP8 (bf16: 6/100) | apache-2.0 | vLLM |
| darrellbest/Qwen3.5-2B-Heretic | 2,27B | bf16 safetensors, 4,58 GB | no disponible | 6/100, KL 0,0302 | apache-2.0 | transformers, vLLM, SGLang |
| darrellbest/Qwen3.5-2B-Heretic-GGUF | 2,27B | GGUF BF16/Q8_0/Q4_K_M, 3,90 / 2,08 / 1,31 GB + 0,67 GB mmproj | no disponible | no disponible | apache-2.0 | llama.cpp, Ollama |
| darrellbest/Qwen3.5-2B-Heretic-NVFP4 | 2,27B | NVFP4, 3,15 GB | no disponible | no disponible | apache-2.0 | vLLM sobre Blackwell |
| Qwen/Qwen3.5-2B (base, sin ablacionar) | 2,27B | safetensors (precision original) | no disponible en la informacion recogida | 97/100 segun el autor de la variante Heretic | apache-2.0 | transformers, vLLM, SGLang |

No se dispone de datos de benchmarks ni de contexto oficial del modelo base en la informacion proporcionada, por lo que la comparacion se limita a formato, tamano, licencia, rechazos y motores soportados.

## Limitaciones y advertencias

- Guardarrailes de seguridad reducidos por diseno: el modelo responde a peticiones que el modelo base rechazaria. El propio autor declara que la responsabilidad del uso recae en quien lo despliega.
- Los rechazos no se han vuelto a medir sobre los pesos FP8; las cifras de 6/100 corresponden al modelo bf16 de origen, de modo que el comportamiento real de esta compilacion cuantizada en materia de rechazos es desconocido.
- Riesgo de alucinacion: con 2,27 mil millones de parametros, la tasa de invencion de hechos es probablemente alta en tareas de conocimiento factual, especialmente fuera de la distribucion de entrenamiento.
- La cuantizacion FP8 parcial puede introducir degradaciones sutiles en matematicas, codigo o vision que no se detectan con una unica comprobacion greedy. El autor solo verifica coincidencia casi palabra por palabra en prompts ordinarios, un calculo (17 x 23 = 391) y una imagen de prueba.
- El estado recurrente de DeltaNet y los parametros A_log y de normalizacion se han mantenido en float32 precisamente porque son sensibles a la precision; cualquier conversion adicional de esos tensores a un formato de menor precision puede degradar el modelo.
- El bloque de prediccion multi-token se entrega en model-auxiliary.safetensors, separado del guardado cuantizado principal; los motores que esperen los pesos MTP dentro del checkpoint estandar pueden no encontrarlos.
- Idiomas soportados no documentados: no hay garantia explicita de calidad multilingue para esta compilacion, mas alla de lo que herede del modelo base.
- Modelo de comunidad con 0 descargas y 0 likes y sin revision por parte de Qwen: no es un artefacto oficial y no ha pasado por un proceso de validacion externa.
- Licencia apache-2.0, que permite uso comercial, pero la licencia cubre los pesos del modelo base Qwen3.5-2B; el uso del contenido generado y el cumplimiento normativo en aplicaciones de produccion son responsabilidad del integrador.
- Consideraciones legales y eticas: el uso para generar contenido danino, desinformacion o material ilegal puede tener consecuencias legales para el operador, con independencia de la licencia permisiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-FP8
- Modelo base de la ablacion (bf16): https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-GGUF
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Blog oficial de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de la serie Qwen3.5 / 3.6 / 3.8: https://github.com/QwenLM/Qwen3.8
- Coleccion de terceros con variantes regulares y sin censura de Qwen3.5: https://huggingface.co/collections/DavidAU/qwen-35-08-2-4-9-27-35b-regular-uncensored
- Ficha de terceros de la variante GGUF: https://local-ai-zone.github.io/models/qwen3-5-2b-heretic.html
- Variante relacionada de mayor tamano (Qwen3.8-27B-Heretic-FP8): https://huggingface.co/darrellbest/Qwen3.8-27B-Heretic-FP8/tree/main
