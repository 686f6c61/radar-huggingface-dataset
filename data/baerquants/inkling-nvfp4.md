# baerquants/Inkling-NVFP4

## Resumen

Inkling-NVFP4 es una cuantizacion en NVFP4 del modelo multimodal Inkling, publicado por el usuario baerquants a partir de los pesos originales de thinkingmachines/Inkling. Se trata de un transformer autorregresivo multimodal que acepta entradas de texto, imagen y audio y genera texto, disenado para aplicaciones de agentes, asistentes de codigo, chatbots y sistemas de generacion aumentada por recuperacion (RAG).

Arquitectura y tamano: decoder-only de 66 capas con backbone feed-forward de Mixture-of-Experts disperso, con enrutado de cada token a 6 de 256 expertos mas 2 expertos compartidos activos siempre, y atencion hibrida de capas locales y globales. La model card del modelo base declara 975B parametros totales y 41B activos; los metadatos de safetensors de este repositorio cuantizado registran 552.845.034.562 parametros, una discrepancia que conviene verificar antes de planificar el despliegue.

Relevancia: es una cuantizacion de 4 bits (aunque el repositorio aparece etiquetado tambien como "8-bit") pensada para reducir el coste de servir un modelo multimodal de gran tamano, distribuyendo pesos en formato safetensors compatibles con transformers, vLLM, SGLang y Unsloth. El repositorio ocupa 592 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con MoE disperso (6 de 256 expertos por token + 2 expertos compartidos) y atencion hibrida local/global, 66 capas |
| Parametros totales | 975B segun la model card del modelo base; 552.845.034.562 segun los metadatos de safetensors de este repositorio (discrepancia no resuelta) |
| Parametros activos | 41B (segun la model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (repositorio); el modelo base soporta BF16 y NVFP4 |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas (segun la model card del base); no se detalla lista de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo multimodal de 66 capas con backbone MoE: cada token se enruta a 6 de 256 expertos y a 2 expertos compartidos que permanecen activos en todos los tokens. La atencion combina capas locales y globales. La multimodalidad es nativa: las imagenes y el video se codifican mediante un codificador jerarquico de parches, y el audio mediante codificacion discreta en tokens; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Sobre los datos de entrenamiento, la model card indica que las fuentes incluyen contenido de texto, imagen, audio y video, procedentes de fuentes publicas, de terceros o generados o aumentados sinteticamente, con procesos de limpieza, deduplicacion y filtrado para eliminar datos de baja calidad. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las unicas modalidades de entrada documentadas son texto UTF-8, imagen en cualquier formato basado en pixeles (dimensiones recomendadas entre 40 px y 4096 px) y audio WAV a 16 kHz (idealmente menos de 20 minutos).

## Capacidades

- Generacion de texto conversacional e instruccional en ingles y otros idiomas.
- Razonamiento multimodal: procesa imagen, video (via codificador de parches) y audio ademas de texto.
- Razonamiento matematico y cientifico avanzado (los resultados publicados incluyen AIME 2026, GPQA Diamond y HLE).
- Programacion y tareas de ingenieria de software agéntica (SWEBench Verified y SWEBench Pro Public).
- Uso de herramientas y function calling: los resultados de HLE con herramientas sugieren soporte de tool use.
- Uso en sistemas agénticos y multi-paso, segun la descripcion de aplicaciones previstas (agentes, asistentes de codigo, RAG).
- Entrada de audio en WAV a 16 kHz y salida exclusivamente de texto en UTF-8.
- Capacidad declarada de ajuste fino e integracion por desarrolladores externos al publicarse con pesos abiertos.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para revision de cambios, generacion de parches y resolucion de issues, dado su rendimiento declarado en SWEBench Verified (77,6 %).
- Agentes autonimos con uso de herramientas: al soportar tool calling y multi-step reasoning, es adecuado para flujos que consultan APIs, ejecutan comandos y encadenan decisiones con verificacion intermedia.
- Analisis de documentos con imagenes: la entrada de imagen en formato pixel-based permite procesar capturas, diagramas, facturas o graficos junto a texto en una misma conversacion.
- Transcripcion y analisis de audio: la entrada de audio WAV a 16 kHz posibilita resumir reuniones, extraer acciones o clasificar llamadas, con la salvedad del limite recomendado de 20 minutos por fragmento.
- Sistemas RAG multimodales: al ingerir texto e imagenes y generar respuestas en texto, encaja en asistentes sobre bases de conocimiento tecnicas o corporativas.
- Atencion al cliente automatizada: permite conversaciones multi-turno con contexto en varios idiomas, aunque la longitud de contexto no esta documentada y debe medirse empiricamente.
- Investigacion en ajuste fino multimodal: al publicarse los pesos, sirve como base para fine-tuning supervisado o preferencias sobre dominios verticales.
- Evaluacion comparativa de cuantizacion: este repositorio NVFP4 permite medir la degradacion de calidad respecto al BF16 original en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base con effort=0.99; las puntuaciones de comparacion se generaron el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| HLE (with tools) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | no disponible (dato truncado en la fuente) | no disponible (dato truncado en la fuente) | no disponible (dato truncado en la fuente) | no disponible (dato truncado en la fuente) |

No se han publicado resultados especificos de esta cuantizacion NVFP4 frente al modelo base en BF16 dentro de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 592 GB, por lo que los pesos en NVFP4 requieren aproximadamente ese orden de almacenamiento; a 552,8B parametros en 4 bits el peso teorico ronda los 276 GB mas escalas y overhead, pero el tamano real del repositorio es la referencia practica.
- GPU recomendadas: nodos multi-GPU de clase datacenter, como 8x H100 80 GB (640 GB agregados), 8x A100 80 GB o 4x B200. No cabe en una GPU individual de 80 GB.
- GPU de consumo: no es viable en RTX 4090, RTX 5090 ni similares; excede por completo la VRAM disponible en hardware consumer.
- Opciones de despliegue: transformers, vLLM, SGLang, TokenSpeed y Unsloth, con recetas publicadas por el autor del modelo base; tambien acceso via API en Tinker y playground.
- Cuantizaciones adicionales de menor huella: no disponibles en la informacion proporcionada (no se documentan variantes GGUF o de 2-3 bits para este modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Inkling (base) | 975B totales / 41B activos (model card) | no disponible | apache-2.0 | Pesos abiertos en HuggingFace (BF16 y NVFP4) | HLE text 29,7 %, SWEBench Verified 77,6 % |
| Inkling-NVFP4 (este repositorio) | 552,8B segun safetensors | no disponible | apache-2.0 | Pesos abiertos, cuantizados en NVFP4 | No se han publicado resultados propios |
| Nemotron 3 Ultra | no disponible | no disponible | pesos abiertos (condiciones no detalladas) | Pesos abiertos | HLE text 26,6 %, SWEBench Verified 70,7 % |
| Kimi K2.6 | no disponible | no disponible | pesos abiertos (condiciones no detalladas) | Pesos abiertos | HLE text 35,9 %, SWEBench Verified 80,2 % |
| DeepSeek V4 Pro | no disponible | no disponible | pesos abiertos (condiciones no detalladas) | Pesos abiertos | HLE text 35,9 %, SWEBench Verified 80,6 % |

La informacion disponible no incluye numeros de parametros, contexto ni licencias detalladas de los modelos de comparacion mas alla de su condicion de pesos abiertos o cerrados, por lo que la comparacion se limita a los benchmarks reportados.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 975B totales / 41B activos, mientras que los metadatos de safetensors de este repositorio indican 552.845.034.562; debe verificarse antes de dimensionar infraestructura.
- Ambiguedad de cuantizacion: el nombre indica NVFP4 (4 bits) pero el repositorio lleva la etiqueta "8-bit"; conviene inspeccionar los pesos reales.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base remite a una politica de uso aceptable de thinkingmachines que debe revisarse para despliegues en produccion.
- Idiomas: el modelo base declara ingles con capacidades multilingues generales, sin lista cerrada de idiomas ni garantias por idioma; el rendimiento en castellano no esta documentado.
- Longitud de contexto no documentada: limita la planificacion de aplicaciones con historiales largos o documentos extensos.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni mitigaciones especificas; los resultados en HLE (29,7 % sin herramientas) indican margen de error relevante en tareas de conocimiento avanzado.
- Entradas acotadas: imagen con dimensiones ideales entre 40 px y 4096 px y audio WAV a 16 kHz de menos de 20 minutos; fuera de esos rangos el rendimiento puede degradarse.
- Origen de datos: la model card no detalla composicion del dataset ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar sesgos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria de la calidad de la cuantizacion.
- No se han publicado metricas de degradacion de esta cuantizacion respecto al BF16 original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/baerquants/Inkling-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Version NVFP4 oficial del autor original: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo (los enlaces obtenidos corresponden a servicios de correo y no se incluyen por no ser relevantes).
