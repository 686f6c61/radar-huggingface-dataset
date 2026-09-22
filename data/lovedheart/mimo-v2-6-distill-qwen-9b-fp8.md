# lovedheart/MiMo-V2.6-Distill-Qwen-9B-FP8

## Resumen

MiMo-V2.6-Distill-Qwen-9B-FP8 es una redistribucion en precision FP8 del checkpoint MiMo-V2.6-Distill-Qwen-9B de Xiaomi MiMo, publicada por el usuario lovedheart en Hugging Face. El modelo original es un ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, orientado a tareas agenticas: codigo, uso de herramientas, tareas generales de agente, codificacion visual y ciberseguridad. Tiene 9.409.813.744 parametros y se distribuye con la libreria transformers bajo el pipeline image-text-to-text, lo que implica soporte de entradas multimodales imagen-texto.

Su interes actual es doble. Por un lado, Xiaomi MiMo publica este checkpoint como punto de partida para investigacion abierta en aprendizaje por refuerzo agentico, con una mezcla de SFT de 77,4B tokens totales (27,2B con perdida). Por otro, esta conversion a FP8 reduce el repositorio a 11,9 GB, lo que rebaja el coste de despliegue en GPUs con soporte nativo de FP8 (Hopper y Ada Lovelace) manteniendo los 9,41B de parametros.

La model card reporta mejoras sustanciales sobre Qwen3.5-9B en benchmarks de agentes, como MiMo Code mini (19,5 a 51,6), AutomationBench v1.0.6 (5,0 a 30,3) o SWE Pro (32,0 a 44,6). Hay que tener en cuenta que la ficha no declara licencia ni idiomas soportados, y que el autor de la conversion FP8 es un tercero, no el equipo de Xiaomi MiMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 (tag `qwen3_5`); no se documenta variante MoE ni hibrida |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (unica precision publicada en este repositorio); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP8) |
| Tamano del repositorio | 11,9 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (relacion: finetune) |
| Autoria | lovedheart (redistribucion); modelo original de Xiaomi MiMo |
| Fecha de publicacion | 2026-09-21 |

## Arquitectura y entrenamiento

No se documenta una innovacion arquitectonica propia en este checkpoint: es un ajuste supervisado sobre Qwen3.5-9B, un transformer decoder-only denso con tokenizer propio de la familia Qwen3.5 y una plantilla de chat especifica de MiMo v2.6 que expone un modo de razonamiento explicito (`enable_thinking`), con el contenido de pensamiento devuelto en el campo `reasoning_content` de la API compatible con OpenAI. La conversion FP8 preserva esa plantilla y el tokenizer del modelo base.

El entrenamiento del checkpoint original consiste en un SFT sobre datos generados por MiMo con una mezcla ponderada de 77,4B tokens totales, de los cuales 27,2B son tokens con perdida (loss-bearing). El reparto por dominio es: codigo 23,2B (29,9 %), general 22,0B (28,5 %), visual 21,2B (27,4 %) y ciberseguridad 11,0B (14,2 %). No se detalla en la informacion disponible la composicion exacta del dataset, el uso de RLHF o DPO, ni el proceso de cuantizacion aplicado por el autor de la conversion.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito activable mediante `enable_thinking` en la plantilla de chat.
- Codigo: generacion, edicion y resolucion de issues en repositorios reales, segun los benchmarks SWE Verified y SWE Pro.
- Uso de herramientas (tool calling / function calling), atestiguado por los resultados en Toolathlon-Verified y por las etiquetas `tool-use` y `agentic`.
- Ejecucion de tareas de agente multi-paso en terminal y entornos ofimaticos (Terminal Bench 2.1, OfficeQA, JobBench, AutomationBench).
- Codificacion visual: el pipeline es image-text-to-text y el dominio visual representa el 27,4 % de los tokens de entrenamiento, con resultados reportados en MiMo Visual Coding (mini).
- Ciberseguridad: dominio especifico con 11,0B tokens de entrenamiento y evaluacion propia MiMo Cyber (mini).
- Capacidades conversacionales multi-turno (etiqueta `conversational`).
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de resolucion de incidencias en repositorios: el modelo esta entrenado sobre tareas tipo SWE-bench (avg@3 de 61,1 en SWE Verified y 44,6 en SWE Pro) y puede leer un repositorio, localizar el fallo, editar ficheros y ejecutar pruebas dentro de un bucle de agente.
- Automatizacion de terminal y operaciones: con 37,1 en Terminal Bench 2.1 puede encadenar comandos, interpretar su salida y corregir el rumbo en tareas de administracion de sistemas o pipelines de build.
- Orquestacion de herramientas en flujos empresariales: sus etiquetas `tool-use` y `agentic` y el 35,2 de Toolathlon-Verified lo hacen apto como nucleo de un agente que invoca APIs, buscadores y conectores internos.
- Asistente de codificacion con contexto visual: al ser un modelo image-text-to-text, puede recibir capturas de interfaces, diagramas o maquetas y generar el codigo correspondiente, un flujo habitual en equipos de front-end.
- Analisis asistido de seguridad: con el dominio de ciberseguridad en el entrenamiento y 31,3 en MiMo Cyber (mini), sirve para triaje de alertas, explicacion de vulnerabilidades y redaccion de informes tecnicos, siempre con supervision humana.
- Automatizacion de tareas ofimaticas y de back office: los resultados en OfficeQA (19,5) y JobBench (18,3) apuntan a flujos de extraccion y cumplimentacion de documentos estructurados.
- Generacion de codigo en produccion con integracion en CI/CD: el modelo puede actuar como revisor automatico de pull requests o generador de parches, invocando herramientas del pipeline mediante function calling.
- Punto de partida para investigacion en RL agentico: al ser un checkpoint SFT publicado explicitamente para ese fin, es la base natural para experimentos de refuerzo sobre tareas de agente.

## Benchmarks y rendimiento

Resultados reportados en el informe tecnico de MiMo-V2.6 para el checkpoint SFT. Corresponden al modelo base en su version original, no necesariamente a esta conversion FP8.

| Dominio | Benchmark | Metrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Codigo | SWE Verified | avg@3 | 60,0 | 61,1 |
| Codigo | SWE Pro | avg@3 | 32,0 | 44,6 |
| Codigo | MiMo Code (mini) | avg@3 | 19,5 | 51,6 |
| Ciberseguridad | MiMo Cyber (mini) | avg@3 | 5,7 | 31,3 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |
| General | MiMo General (mini) | avg@1 | 28,5 | 62,2 |
| Visual | MiMo Visual Coding (mini) | avg@1 | 61,7 | 64,0 |

Las entradas marcadas como (mini) corresponden a conjuntos de evaluacion internos segun la propia model card. No se han publicado resultados especificos de la version FP8 en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: en FP8 los 9,41B parametros ocupan aproximadamente 9,4 GB; el repositorio completo son 11,9 GB, presumiblemente porque parte de las capas (embeddings, normalizaciones o modulos multimodales) se mantienen en mayor precision.
- GPU consumer: cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) con contexto moderado, y con holgura en 24 GB (RTX 4090, RTX 3090, L4, A10G) si se reserva espacio para cache KV.
- FP8 nativo: requiere arquitecturas Hopper (H100, H200) o Ada Lovelace (RTX 4090, L40S, L4, RTX 6000 Ada). En Ampere (A100, A10) o anteriores no hay soporte de tensor cores FP8, por lo que habria que descomprimir los pesos a BF16 (unos 18,8 GB) o convertir a otro formato.
- Despliegue multiusuario: A100 80 GB, H100 80 GB o H200 para servir con lotes grandes y contexto largo.
- Opciones de despliegue: el autor del modelo base documenta SGLang con `--reasoning-parser mimo` y soporte de Qwen3.5; vLLM dispone de soporte FP8; el despliegue en llama.cpp u Ollama no esta documentado para este repositorio y requeriria conversion a GGUF.
- Latencia y throughput estimados: no disponibles. La unica indicacion operativa de la model card es un `max_tokens` de 2048 en el ejemplo de consulta con pensamiento activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-FP8 (esta ficha) | 9,41B | No disponible | No hay resultados propios publicados; hereda los del checkpoint SFT en BF16 | No disponible | Hugging Face, 0 descargas, 0 likes |
| MiMo-V2.6-Distill-Qwen-9B (Xiaomi MiMo, BF16) | 9B segun model card | No disponible | SWE Verified 61,1; AutomationBench 30,3; Terminal Bench 2.1 37,1 | No disponible | Hugging Face, repositorio oficial |
| Qwen3.5-9B (modelo base del SFT) | 9B | No disponible | SWE Verified 60,0; SWE Pro 32,0; AutomationBench 5,0 | No disponible | Hugging Face, repositorio oficial |

No se dispone de datos de contexto, licencia ni idiomas para ninguno de los tres modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros y a los benchmarks reportados en el informe tecnico de MiMo-V2.6.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, ni en el repositorio de la conversion FP8 ni, segun los datos aportados, en la model card del modelo base. No debe asumirse uso comercial libre sin verificarlo con el publicador original.
- La longitud de contexto no se especifica, lo que impide planificar cargas con contexto largo sin una prueba previa.
- No se declaran los idiomas soportados; el castellano no esta confirmado y el rendimiento en idiomas distintos del ingles y del chino podria degradarse.
- Los benchmarks proceden del informe tecnico del checkpoint SFT original y no han sido validados para esta conversion FP8 por el autor de la redistribucion, por lo que la cuantizacion podria introducir perdida de precision no medida.
- Riesgo de alucinacion inherente a un modelo de 9B: los resultados en tareas de conocimiento general y ofimatica (OfficeQA 19,5, JobBench 18,3) siguen siendo moderados y exigen verificacion humana en entornos de produccion.
- Este repositorio lo publica un tercero, no Xiaomi MiMo; no hay garantia de que los pesos correspondan exactamente al checkpoint oficial ni de que se mantengan actualizados.
- El modelo esta entrenado especificamente para tareas agenticas y de ciberseguridad, un dominio donde una respuesta incorrecta puede tener consecuencias operativas graves.
- El soporte de FP8 depende de la GPU: en hardware anterior a Hopper o Ada Lovelace se pierde la ventaja de memoria y velocidad, o el modelo directamente no puede ejecutarse sin conversion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe comunidad que haya reportado problemas de funcionamiento.

## Enlaces

- Modelo en Hugging Face (esta conversion FP8): https://huggingface.co/lovedheart/MiMo-V2.6-Distill-Qwen-9B-FP8
- Modelo base en Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base del SFT (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio citado en la model card como referencia del informe tecnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Guia de instalacion de SGLang: https://docs.sglang.io/get_started/install.html
- Busqueda web realizada: no se han encontrado resultados relevantes sobre el modelo. Las consultas devolvieron exclusivamente paginas sobre el desviador de bicicleta SRAM X9 (sram.com, vitalmtb.com, eBay, OLX), sin relacion con este modelo de lenguaje.
