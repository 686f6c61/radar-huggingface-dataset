# ArchiveStudio/Phi-3.5-vision-instruct

## Resumen

Phi-3.5-vision-instruct es un modelo multimodal abierto y ligero desarrollado por Microsoft que combina comprensión de texto e imagen. Con 4.146.621.440 parámetros (aproximadamente 4,1 mil millones), se posiciona como una alternativa compacta para tareas de visión-lenguaje que requieren un coste computacional bajo sin renunciar a un razonamiento denso. Soporta una longitud de contexto de 128.000 tokens, lo que permite procesar múltiples imágenes, secuencias de vídeo o documentos extensos en una sola ventana.

La ficha que nos ocupa corresponde al repositorio `ArchiveStudio/Phi-3.5-vision-instruct`, una réplica del modelo original `microsoft/Phi-3.5-vision-instruct` publicada bajo licencia MIT. El modelo pertenece a la familia Phi-3 y fue construido sobre datos sintéticos y sitios web públicos filtrados, con énfasis en datos de alta calidad y densos en razonamiento, tanto en texto como en visión. Incorpora ajuste fino supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar la adherencia a instrucciones y la seguridad.

Su relevancia actual radica en que ofrece capacidades multimodales de nivel competitivo en un rango de 4B de parámetros, un espacio dominado tradicionalmente por modelos de 7B o superiores. Según los datos del autor, supera a alternativas del mismo tamaño en benchmarks multi-imagen como BLINK (57,0 de puntuación global frente a 53,1 de LlaVA-Interleave-Qwen-7B o 45,9 de InternVL-2-4B), lo que lo hace idóneo para despliegues en entornos con restricciones de memoria o latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `phi3_v`); decodificador de lenguaje de la familia Phi-3.5-mini con codificador visual |
| Parametros totales | 4.146.621.440 (aproximadamente 4,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | multilingual (uso previsto principal en ingles segun la model card) |
| Licencia | MIT (con enlace a la licencia del modelo original de Microsoft) |
| Formato de pesos | safetensors (libreria `transformers`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal que empareja un codificador de visión con un decodificador de lenguaje de la familia Phi-3.5. La libreria de referencia es `transformers` y el tag de arquitectura es `phi3_v`, lo que implica que la carga requiere `trust_remote_code=True` para resolver el codigo personalizado asociado al procesamiento de imagenes y a la proyeccion de las representaciones visuales hacia el espacio del decodificador de texto.

En cuanto al entrenamiento, la model card indica que el modelo se construyo sobre una mezcla de datos sinteticos y sitios web publicos filtrados, con foco en datos densos en razonamiento, tanto textuales como visuales. El proceso de mejora incluyo ajuste fino supervisado (SFT) y optimizacion directa de preferencias (DPO) para mejorar la adherencia a instrucciones y las medidas de seguridad. La version 3.5 incorpora ademas capacidad de comprension y razonamiento sobre multiples fotogramas (multi-frame), lo que habilita comparacion detallada de imagenes, resumen multi-imagen y resumen de video, orientados a escenarios de productividad tipo Office. El informe tecnico asociado es arXiv:2404.14219.

## Capacidades

- Generacion de texto e instrucciones conversacionales multi-turno.
- Comprension general de imagenes (descripcion, reconocimiento de escenas, objetos y atributos).
- Reconocimiento optico de caracteres (OCR) en imagenes y documentos.
- Comprension de graficos y tablas (chart and table understanding).
- Comparacion de multiples imagenes y razonamiento multi-frame.
- Resumen de multiples imagenes o clips de video y narracion a partir de secuencias visuales.
- Generacion y asistencia en codigo (etiqueta `code` en el repositorio).
- Capacidades multilingues declaradas (etiqueta `multilingual`), aunque el uso previsto principal es en ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode) o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo puede aplicar OCR y comprension de tablas sobre facturas, formularios o informes escaneados y devolver los campos estructurados, aprovechando su ventana de 128K tokens para procesar documentos largos en una sola pasada.
- Analisis de graficos financieros: dado un conjunto de imagenes de graficos o dashboards, el modelo puede describir tendencias, comparar series y responder preguntas sobre los datos representados, util en herramientas de business intelligence.
- Accesibilidad visual: generar descripciones textuales de imagenes para usuarios con discapacidad visual o para indexacion semantica de catalogos de imagenes, con un coste de inferencia bajo gracias a sus 4,1B de parametros.
- Moderacion y revision de contenido visual: clasificar y describir imagenes en pipelines de revision de contenido, comparando multiples fotogramas de un mismo caso para detectar inconsistencias.
- Resumen de video para reuniones o vigilancia: procesar varios fotogramas clave de un clip y producir un resumen narrativo, con soporte para secuencias cortas y medias segun los datos de Video-MME del autor.
- Asistencia al desarrollo con contexto visual: interpretar capturas de pantalla, diagramas de arquitectura o mensajes de error en imagenes y generar codigo o explicaciones, integrable en entornos de desarrollo.
- Comercio electronico: generar descripciones de producto a partir de imagenes, comparar variantes de un mismo articulo y extraer atributos visuales para fichas de catalogo.
- Investigacion en modelos multimodales: servir como bloque base ligero para experimentos academicos que requieran un VLM pequeno y con licencia permisiva, desplegable en hardware de gama media.

## Benchmarks y rendimiento

Datos de BLINK (14 tareas visuales) reportados por el autor, comparando con modelos similares y de mayor tamano:

| Benchmark | Phi-3.5-vision-instruct | LlaVA-Interleave-Qwen-7B | InternVL-2-4B | InternVL-2-8B | Gemini-1.5-Flash | GPT-4o-mini | Claude-3.5-Sonnet | Gemini-1.5-Pro | GPT-4o |
|--|--|--|--|--|--|--|--|--|--|
| Art Style | 87,2 | 62,4 | 55,6 | 52,1 | 64,1 | 70,1 | 59,8 | 70,9 | 73,3 |
| Counting | 54,2 | 56,7 | 54,2 | 66,7 | 51,7 | 55,0 | 59,2 | 65,0 | 65,0 |
| Forensic Detection | 92,4 | 31,1 | 40,9 | 34,1 | 54,5 | 38,6 | 67,4 | 60,6 | 75,8 |
| Functional Correspondence | 29,2 | 34,6 | 24,6 | 24,6 | 33,1 | 26,9 | 33,8 | 31,5 | 43,8 |
| IQ Test | 25,3 | 26,7 | 26,0 | 30,7 | 25,3 | 29,3 | 26,0 | 34,0 | 19,3 |
| Jigsaw | 68,0 | 86,0 | 55,3 | 52,7 | 71,3 | 72,7 | 57,3 | 68,0 | 67,3 |
| Multi-View Reasoning | 54,1 | 44,4 | 48,9 | 42,9 | 48,9 | 48,1 | 55,6 | 49,6 | 46,6 |
| Object Localization | 49,2 | 54,9 | 53,3 | 54,1 | 44,3 | 57,4 | 62,3 | 65,6 | 68,0 |
| Relative Depth | 69,4 | 77,4 | 63,7 | 67,7 | 57,3 | 58,1 | 71,8 | 76,6 | 71,0 |
| Relative Reflectance | 37,3 | 34,3 | 32,8 | 38,8 | 32,8 | 27,6 | 36,6 | 38,8 | 40,3 |
| Semantic Correspondence | 36,7 | 31,7 | 31,7 | 22,3 | 32,4 | 31,7 | 45,3 | 48,9 | 54,0 |
| Spatial Relation | 65,7 | 75,5 | 78,3 | 78,3 | 55,9 | 81,1 | 60,1 | 79,0 | 84,6 |
| Visual Correspondence | 53,5 | 40,7 | 34,9 | 33,1 | 29,7 | 52,9 | 72,1 | 81,4 | 86,0 |
| Visual Similarity | 83,0 | 91,9 | 48,1 | 45,2 | 47,4 | 77,8 | 84,4 | 81,5 | 88,1 |
| **Overall** | **57,0** | **53,1** | **45,9** | **45,4** | **45,8** | **51,9** | **56,5** | **61,0** | **63,2** |

Datos parciales de Video-MME reportados por el autor:

| Benchmark | Phi-3.5-vision-instruct | LlaVA-Interleave-Qwen-7B | InternVL-2-4B | InternVL-2-8B | Gemini-1.5-Flash | GPT-4o-mini | Claude-3.5-Sonnet | Gemini-1.5-Pro | GPT-4o |
|--|--|--|--|--|--|--|--|--|--|
| short (<2min) | 60,8 | 62,3 | 60,7 | 61,7 | 72,2 | 70,1 | 66,3 | 73,3 | 77,7 |
| medium (4-15min) | 47,7 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card tambien menciona mejoras en benchmarks de imagen simple respecto a versiones previas: MMMU de 40,2 a 43,0, MMBench de 80,5 a 81,9 y TextVQA (comprension de documentos) de 70,9 a 72,0.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8,5-9 GB solo para pesos (4,1B parametros), mas el coste de la cache KV, que crece de forma significativa con la ventana de 128K tokens.
- En cuantizacion int8: aproximadamente 4,5-5 GB de pesos.
- En cuantizacion int4: aproximadamente 2,5-3 GB de pesos (sujeto a disponibilidad de versiones cuantizadas, no confirmada en este repositorio).
- GPU de datacenter recomendadas: A100 (40/80 GB), H100, L40S, para despliegues con lotes grandes y contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en GPUs de 12-16 GB en bf16 con contexto moderado. Para 128K de contexto completo se recomienda al menos 24 GB o cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via nativa del repo). Compatibilidad con vLLM/TGI/Ollama/llama.cpp no esta confirmada en la informacion proporcionada; el pipeline declarado es image-text-to-text.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia cualitativa, el modelo esta disenado para escenarios de latencia acotada y entornos con restricciones de memoria o computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLINK (overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3.5-vision-instruct | 4,1B | 128K | 57,0 | MIT | HuggingFace (Microsoft y replicas como ArchiveStudio) |
| LlaVA-Interleave-Qwen-7B | 7B | no disponible | 53,1 | no disponible en la informacion proporcionada | HuggingFace |
| InternVL-2-4B | 4B | no disponible | 45,9 | no disponible en la informacion proporcionada | HuggingFace |
| InternVL-2-8B | 8B | no disponible | 45,4 | no disponible en la informacion proporcionada | HuggingFace |
| GPT-4o-mini (referencia propietaria) | no disponible | no disponible | 51,9 | propietaria | API |

En BLINK, Phi-3.5-vision-instruct supera a modelos abiertos de mayor tamano como LlaVA-Interleave-Qwen-7B e InternVL-2-8B, y se acerca a referencias propietarias como GPT-4o-mini y Claude-3.5-Sonnet en puntuacion global.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la informacion proporcionada; al entrenarse sobre datos web filtrados y sinteticos, es esperable heredar sesgos presentes en esas fuentes. La model card recomienda evaluar y mitigar exactitud, seguridad y equidad antes de usos en produccion, especialmente en escenarios de alto riesgo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y vision-lenguaje; la model card advierte de que el modelo no ha sido disenado ni evaluado para todos los propositos downstream.
- Limitaciones de contexto o idioma: aunque la etiqueta declara soporte multilingue, el uso previsto principal es en ingles, por lo que el rendimiento en otros idiomas puede degradarse.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial. No obstante, el autor remite a la licencia del modelo original de Microsoft, por lo que conviene revisar dicho texto para confirmar terminos adicionales.
- Caveat sobre el repositorio: se trata de una replica (`ArchiveStudio/`) del modelo oficial de Microsoft, con 0 descargas y 0 likes en el momento de la consulta. Para produccion, se recomienda validar la integridad de los pesos frente al repositorio oficial `microsoft/Phi-3.5-vision-instruct`.
- Requiere `trust_remote_code=True` por el codigo personalizado de la arquitectura `phi3_v`, lo que implica ejecutar codigo del repositorio y anadir un paso de validacion de seguridad en pipelines automatizados.
- Capacidades de tool calling, agentes y function calling no confirmadas en la informacion disponible; no asumir su soporte sin verificacion.

## Enlaces

- Repositorio HuggingFace (replica): https://huggingface.co/ArchiveStudio/Phi-3.5-vision-instruct
- Modelo original: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Licencia: https://huggingface.co/microsoft/Phi-3.5-vision-instruct/resolve/main/LICENSE
- Informe tecnico (arXiv): https://arxiv.org/abs/2404.14219
- Blog de Microsoft Phi-3: https://aka.ms/phi3.5-techblog
- Portal Phi-3: https://azure.microsoft.com/en-us/products/phi-3
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Demo (Try It): https://aka.ms/try-phi3.5vision
- Phi-3.5-mini-instruct: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Phi-3.5-MoE-instruct: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Catalogo Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-3.5-vision-instruct
- Ficha en Applied: https://theapplied.co/models/microsoft-phi-3-5-vision-instruct
