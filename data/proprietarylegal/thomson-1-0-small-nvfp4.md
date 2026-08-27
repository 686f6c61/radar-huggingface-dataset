# ProprietaryLegal/Thomson-1.0-Small-NVFP4

## Resumen

Thomson-1.0-Small-NVFP4 es una cuantizacion NVFP4 del modelo open-weight Thomson-1.0-Small, desarrollado por Thomson Reuters y publicado en HuggingFace por el usuario ProprietaryLegal. Se trata de un modelo de arquitectura MoE (Mixture of Experts) de 35 mil millones de parametros totales con 3 mil millones activos, basado en la arquitectura Qwen3.6-35B-A3B (tipo `qwen3_5_moe`), con una ventana de contexto de 262.144 tokens y capacidades multimodales (vision). El modelo base fue entrenado de forma continua por Thomson Reuters sobre decadas de contenido propietario legal, fiscal y periodistico, con el objetivo de ofrecer un rendimiento superior en tareas profesionales especializadas frente a modelos generalistas.

Esta version cuantizada reduce el checkpoint de 70 GB (BF16) a 22 GB, manteniendo en BF16 la torre de vision, la cabeza de salida (lm_head), los embeddings, las puertas de los expertos compartidos y los bloques de atencion lineal. La cuantizacion se realizo con la libreria llm-compressor de vLLM, siguiendo la receta publicada por RedHat AI para la arquitectura base, y esta pensada para hardware Blackwell con soporte nativo de FP4 (DGX Spark, B100/B200, RTX 50-series). El modelo se sirve con vLLM (version 0.19 o superior) y es compatible con el parser de razonamiento de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) tipo Qwen3.6-35B-A3B (`qwen3_5_moe`) |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones); BF16 en torre de vision, lm_head, embeddings, puertas de router y expertos compartidos, y bloques de atencion lineal |
| Idiomas soportados | No disponible (el modelo base no especifica lista de idiomas; probablemente ingles predominante) |
| Licencia | PolyForm Strict 1.0.0 (uso comercial restringido) |
| Formato de pesos | Safetensors (checkpoint de transformers, guardado con `save_pretrained`) |

## Arquitectura y entrenamiento

El modelo base Thomson-1.0-Small es un MoE con arquitectura derivada de Qwen3.6-35B-A3B, que combina atencion lineal (linear-attention blocks) con el mecanismo de mezcla de expertos. Incluye una torre de vision que permite procesar entradas de imagen y texto (pipeline `image-text-to-text`). El entrenamiento continuo se realizo sobre datos propietarios de Thomson Reuters en los dominios legal, fiscal y periodistico, lo que le confiere un conocimiento especializado que los modelos generalistas no poseen.

La cuantizacion NVFP4 se aplico con `llm-compressor` de vLLM, utilizando un esquema de cuantizacion de 4 bits para pesos y activaciones. Se calibraron 256 muestras del dataset HuggingFaceH4/ultrachat_200k con una longitud maxima de secuencia de 4096 tokens, activando la opcion `moe_calibrate_all_experts=True` para calibrar todos los expertos. Se excluyeron de la cuantizacion la torre de vision, lm_head, embeddings, puertas de router y expertos compartidos, y los bloques de atencion lineal, que se mantienen en BF16 para preservar la precision en componentes criticos. La cuantizacion se realizo en un NVIDIA DGX Spark (GB10 Grace-Blackwell).

## Capacidades

- Generacion de texto y razonamiento: el modelo es capaz de producir respuestas coherentes y estructuradas, con soporte para razonamiento multi-paso (se sirve con `--reasoning-parser qwen3`, lo que indica tokens de pensamiento).
- Comprension de contexto largo: ventana de 262.144 tokens, adecuada para procesar documentos legales extensos, expedientes, sentencias y articulos periodisticos de gran tamano.
- Capacidades multimodales: al ser `image-text-to-text`, puede procesar imagenes junto con texto (aunque no se detallan tareas especificas de vision en la documentacion).
- Especializacion en dominios profesionales: entrenado sobre contenido legal, fiscal y regulatorio de Thomson Reuters, con buen desempeno en tareas como resumen de jurisprudencia, redaccion de escritos judiciales y analisis de normativa.
- Soporte de tool calling y agentes: no se menciona explicitamente, pero al derivar de la arquitectura Qwen3.6 es probable que herede estas capacidades; no obstante, no hay confirmacion en la informacion disponible.
- Multilingue: no se especifican idiomas soportados; se asume un enfoque principal en ingles, dado el origen de los datos de entrenamiento.

## Casos de uso

- Resumen de documentos legales extensos: el modelo puede resumir encuestas de jurisprudencia de decenas de miles de palabras (por ejemplo, 36.000 palabras en un prompt de 57.929 tokens) manteniendo una alta fidelidad, como muestra el benchmark de la model card con una puntuacion de 8/10 en precision.
- Redaccion de escritos judiciales: permite generar affidavits, mociones y otros documentos procesales con citas a normativa especifica (por ejemplo, reglas SCRCP en Carolina del Sur), ahorrando horas de trabajo a abogados.
- Analisis de normativa fiscal: al estar entrenado con contenido fiscal de Thomson Reuters, puede interpretar y explicar regulaciones tributarias complejas, ayudando a asesores y despachos.
- Asistencia en investigacion periodistica: el modelo puede procesar grandes volumenes de documentos, contratos o filtraciones para extraer hechos relevantes y redactar articulos con contexto.
- Atencion al cliente en despachos profesionales: con su ventana de contexto amplia, puede gestionar conversaciones multi-turno sobre casos legales o consultas fiscales, integrado en sistemas de ticketing o chatbots especializados.
- Generacion de informes de cumplimiento regulatorio: puede redactar resumenes de cambios normativos o evaluaciones de riesgo a partir de documentos de referencia, con citas a fuentes autorizadas.

## Benchmarks y rendimiento

La model card reporta mediciones realizadas en un NVIDIA DGX Spark (GB10, 128 GB unificado) con vLLM v0.25.1 y `--max-model-len 262144`:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (single-stream) | ~41,5 tok/s |
| Prefill (prompt de 5.226 tokens) | 2,6 s |
| Longitud de contexto servida | 262.144 tokens |
| Tamano del checkpoint | 22 GB (frente a 70 GB en BF16) |

Ademas, se evaluo un harness de competencia legal con tareas reales, juzgadas por un LLM (Claude Haiku 4.5) en una escala de 1 a 10:

| Tarea | Precision | Completitud | Usabilidad | tok/s |
|---|---|---|---|---|
| Resumir encuesta de 36.000 palabras (prompt de 57.929 tokens) | 8 | 9 | 9 | 31,4 |
| Redactar affidavit de tribunal de familia (Carolina del Sur) | 8 | 6 | 7 | 40,6 |
| Redactar mocion para compelir (SCRCP 33/34/37) | 7 | 4 | 5 | 40,4 |
| **Media** | **7,7** | **6,3** | **7,0** | — |

No se proporcionan comparaciones con otros modelos en la informacion disponible, aunque las noticias externas indican que el modelo base compite con modelos frontier como Claude Opus 4.8 y GPT-5, sin datos numericos concretos.

## Requisitos de hardware

- Hardware objetivo: GPUs Blackwell con soporte nativo de FP4 (DGX Spark GB10, B100/B200, RTX 50-series). No se garantiza funcionamiento en arquitecturas anteriores sin emulacion de FP4.
- VRAM estimada: el checkpoint pesa 22 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo con contexto corto. Para la ventana completa de 262.144 tokens, se requiere memoria adicional para la cache KV y las activaciones; en DGX Spark (128 GB unificados) se sirve sin problemas.
- GPU recomendadas: DGX Spark (GB10) es la plataforma de referencia; tambien son adecuadas B100, B200 y RTX 5090 (32 GB) para contextos moderados.
- Opciones de despliegue: vLLM (version 0.19 o superior) con `--reasoning-parser qwen3` y `--enable-prefix-caching`. En builds optimizados para MoE se puede anadir `--moe_backend flashinfer_cutlass`. No se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: ~41,5 tok/s en generacion single-stream y 2,6 s de prefill para un prompt de 5.226 tokens en DGX Spark. El rendimiento variara segun el hardware y la carga.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo base Thomson-1.0-Small se posiciona como un MoE de 35B-A3B con contexto de 262K y capacidades de vision, similar en tamano a otros MoE como Qwen3-30B-A3B o DeepSeek-V3-Lite, pero no se han publicado benchmarks comparativos directos. La cuantizacion NVFP4 reduce el peso de 70 GB a 22 GB, lo que lo hace mas ligero que la mayoria de modelos de 35B en BF16, pero requiere hardware Blackwell especifico.

## Limitaciones y advertencias

- Licencia restrictiva: PolyForm Strict 1.0.0 impide el uso comercial sin autorizacion explicita. Cualquier despliegue en produccion con fines comerciales requiere revisar los terminos de la licencia y obtener permiso de Thomson Reuters.
- Sesgos de dominio: al estar entrenado principalmente con datos legales y fiscales de origen anglosajon (probablemente de Estados Unidos), puede mostrar sesgos hacia el sistema legal estadounidense y no ser adecuado para jurisdicciones de otros paises sin adaptacion.
- Riesgo de alucinacion: en tareas legales, las alucinaciones pueden tener consecuencias graves. El benchmark de la mocion para compelir obtuvo una puntuacion de usabilidad de 5/10, lo que sugiere que la salida puede requerir revision humana exhaustiva.
- Limitaciones de idioma: no se especifican idiomas soportados; es probable que el rendimiento en idiomas distintos del ingles sea limitado.
- Dependencia de hardware: la cuantizacion NVFP4 solo es eficiente en GPUs Blackwell con soporte FP4 nativo; en hardware mas antiguo el rendimiento puede degradarse o no ser compatible.
- Sin garantias de soporte: al ser un modelo publicado por un tercero (ProprietaryLegal) y no por Thomson Reuters directamente, no hay garantia de mantenimiento, actualizaciones o soporte tecnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProprietaryLegal/Thomson-1.0-Small-NVFP4
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Receta de cuantizacion de RedHat AI: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-NVFP4
- Libreria llm-compressor: https://github.com/vllm-project/llm-compressor
- Pagina oficial de Thomson (Thomson Reuters): https://www.thomsonreuters.com/en/thomson-llm
- Articulo de Thomson Reuters sobre el modelo: https://www.thomsonreuters.com/en-us/posts/innovation/thomson-reuters-built-its-own-ai-model-that-now-ranks-among-the-worlds-best/
- Cobertura en Artificial Lawyer: https://www.artificiallawyer.com/2026/08/24/tr-launches-thomson-1-0-its-own-llm/
- Analisis en LawNext: https://www.lawnext.com/2026/08/thomson-reuters-says-its-homegrown-ai-model-now-rivals-the-frontier-labs-i-take-a-closer-look-at-the-benchmarks.html
- Noticia en Enterprise DNA: https://enterprisedna.co/resources/news/thomson-reuters-thomson-llm-domain-specific-ai-enterprise-august-2026/
