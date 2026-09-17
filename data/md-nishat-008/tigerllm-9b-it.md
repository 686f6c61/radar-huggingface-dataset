# md-nishat-008/TigerLLM-9B-it

## Resumen

TigerLLM-9B-it es un modelo de lenguaje de 9B (segun la nomenclatura del autor) desarrollado por Nishat Raihan y Marcos Zampieri, de la George Mason University, y publicado en HuggingFace bajo el identificador `md-nishat-008/TigerLLM-9B-it`. Forma parte de la familia TigerLLM, presentada en el articulo "TigerLLM - A Family of Bangla Large Language Models", aceptado en ACL 2025 (Volume 2: Short Papers). El objetivo declarado del proyecto es cubrir el hueco de los modelos abiertos en bengali (Bangla), la quinta lengua mas hablada del mundo con unos 237 millones de hablantes nativos, y ofrecer una alternativa reproducible a las iniciativas previas.

El modelo se construye sobre una base de la familia Gemma (el texto del paper menciona Gemma-2; las etiquetas de HuggingFace incluyen `gemma3`) y se afina sobre un corpus de instrucciones en bengali de 100K ejemplos (`Bangla-Instruct`), despues de una fase de preentrenamiento declarada de 10M de tokens sobre el corpus `Bangla-TextBook`. Segun el resumen del articulo, la familia TigerLLM supera a todas las alternativas de codigo abierto en benchmarks estandar de bengali y tambien a modelos propietarios mas grandes como GPT-3.5, estableciendose como nueva linea base para el modelado del idioma bengali. La relevancia actual del modelo esta en ese nicho: es una de las pocas alternativas abiertas, documentadas y con pesos publicos para una lengua de bajos recursos.

Conviene senalar dos discrepancias detectadas en la informacion disponible. La primera es de tamano: el nombre comercial indica 9B, pero los metadatos reales de los safetensors declaran 12.187.325.040 parametros (12,2B). La segunda es de arquitectura base: el paper cita Gemma-2 y las etiquetas de HuggingFace citan `gemma3`. Ambas cuestiones se detallan en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma); el paper indica Gemma-2 y las etiquetas de HuggingFace indican `gemma3`, sin confirmacion adicional |
| Parametros totales | 12.187.325.040 (12,2B) segun los safetensors del repositorio; el nombre del modelo indica 9B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card ni en los metadatos) |
| Tipos de cuantizacion | No disponible en el repositorio; solo se publican pesos en safetensors (sin GGUF ni GPTQ/AWQ publicados) |
| Idiomas soportados | Bengali (Bangla) como idioma objetivo; el campo de idiomas de HuggingFace figura como no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 48,8 GB |
| Descargas / likes | 740 descargas, 3 likes |
| Fecha de creacion / actualizacion | 2025-09-14 / 2026-09-17 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de la familia base: se trata de un transformer decoder-only de la familia Gemma, afinado por instrucciones (sufijo `-it`). El articulo describe dos etapas para cada miembro de la familia: una fase de preentrenamiento declarada de 10M de tokens sobre el corpus `Bangla-TextBook`, seguida de un ajuste por instrucciones con 100K ejemplos de `Bangla-Instruct`. Frente a iniciativas anteriores como Bangla-LLaMA o G2B, que recurren a datasets traducidos automaticamente (Orca-traducido, Alpaca-traducido) y no publican ni paper ni pipeline reproducible, TigerLLM declara explicitamente tanto la procedencia del corpus como la reproducibilidad del proceso.

La tabla comparativa del paper situa a TigerLLM (Gemma-2, 9B) con preentrenamiento de 10M de tokens, corpus `Bangla-TextBook`, ajuste de 100K ejemplos y marca de verificacion tanto en existencia de paper como en reproducibilidad, mientras que G2B (Gemma-2, 9B) no declara preentrenamiento continuado ni corpus, y usa 145K ejemplos traducidos de Alpaca sin paper ni reproducibilidad declarada. No se especifica en la informacion disponible si hubo tecnicas adicionales de alineacion (RLHF, DPO), decodificacion especulativa, atencion lineal ni ninguna otra innovacion tecnica concreta. Tampoco se detalla la composicion exacta del dataset de preentrenamiento ni el numero total de tokens de instrucciones mas alla del recuento de ejemplos.

## Capacidades

- Generacion de texto y respuesta a instrucciones en bengali, con calidad declarada superior a las alternativas abiertas de la misma lengua y a GPT-3.5 en los benchmarks estandar citados en el resumen del articulo.
- Comprension y generacion en tareas de NLP en bengali (el articulo menciona evaluacion sobre "standard benchmarks" sin detallar la lista en la informacion proporcionada).
- Ajuste por instrucciones conversacional (variante `-it`), orientado a uso de asistente.
- Capacidades multilingues: el objetivo declarado es el bengali; no se confirma en la informacion disponible el nivel de competencia en otros idiomas, aunque la base Gemma es multilingue.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible; el repositorio solo contiene pesos de texto en safetensors.

## Casos de uso

- Asistente conversacional en bengali para atencion al cliente: el modelo esta afinado por instrucciones en esa lengua y puede gestionar turnos de conversacion de forma nativa, evitando el coste y la perdida de calidad de traducir el flujo a ingles. Es adecuado porque el corpus de ajuste (100K ejemplos `Bangla-Instruct`) esta especificamente orientado a instrucciones en bengali.
- Generacion y resumen de contenido editorial en bengali: redaccion de articulos, resumenes de documentos y adaptacion de registro para medios digitales dirigidos a los 237 millones de hablantes nativos.
- Traduccion asistida bengali-ingles dentro de herramientas de productividad: uso del modelo como motor de generacion en el lado bengali de un pipeline de traduccion, con revision humana, dado su entrenamiento centrado en esa lengua.
- Educacion y materiales didacticos: generacion de explicaciones, ejercicios y resumenes de temario a partir del corpus `Bangla-TextBook` empleado en el preentrenamiento continuado, lo que lo hace especialmente alineado con texto educativo.
- Procesamiento de documentos administrativos o legales en bengali: clasificacion, extraccion de informacion y generacion de respuestas sobre corpus textuales largos, siempre que la longitud del documento encaje en la ventana de contexto del modelo base (no confirmada en la informacion disponible).
- Investigacion en PLN para lenguas de bajos recursos: el modelo es un punto de partida reproducible (paper ACL 2025, pesos publicos, licencia CC-BY-4.0) para experimentos de ajuste fino, evaluacion comparativa y estudios de sesgo en bengali.
- Base para ajuste especifico de dominio: al ser un modelo de 12,2B con licencia permisiva para uso comercial, se puede afinar con LoRA sobre dominios concretos (sanidad, banca, telco) en bengali partiendo de un modelo ya alineado con instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card y el resumen del articulo afirman de forma cualitativa que la familia TigerLLM "supera a todas las alternativas de codigo abierto y tambien a modelos propietarios mas grandes como GPT-3.5 en benchmarks estandar" para el bengali, pero no se incluyen cifras (MMLU, GSM8K, HumanEval ni benchmarks especificos de bengali) en el material proporcionado. Para obtener los numeros concretos hay que consultar el articulo en ACL Anthology o en arXiv (enlaces en la seccion final).

| Benchmark | TigerLLM-9B-it | Alternativas | Fuente |
|---|---|---|---|
| No disponible | No disponible | No disponible | No se incluyen cifras en la informacion proporcionada |

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (12,187,325,040). No son cifras publicadas por el autor.

- VRAM para inferencia en BF16/FP16: aproximadamente 24,4 GB solo para pesos, mas cache KV (aproximadamente 25-30 GB en funcion de la longitud de contexto y el tamano de lote).
- VRAM para inferencia en INT8: aproximadamente 12,2 GB de pesos, mas cache KV.
- VRAM para inferencia en 4 bits: aproximadamente 6,1-7 GB de pesos, mas cache KV; es la via practica para GPU de consumo.
- GPU de datacenter recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para BF16 con contexto largo y lotes concurrentes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no admiten BF16 completo con margen; si funcionan con cuantizacion de 8 bits (justa) o de 4 bits. Una GPU de 16 GB solo admite cuantizacion de 4 bits con contexto reducido.
- Opciones de despliegue: HuggingFace Transformers, vLLM, TGI y SGLang soportan pesos safetensors de la familia Gemma. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no publica cuantizaciones GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Datos extraidos de la tabla comparativa incluida en la propia model card. La columna "preentrenamiento" se refiere a si hubo preentrenamiento continuado y su volumen declarado.

| Modelo | Base | Tamano | Preentrenamiento | Corpus | Ajuste fino | Paper | Reproducibilidad |
|---|---|---|---|---|---|---|---|
| TigerLLM-9B-it | Gemma-2 (segun paper; `gemma3` en tags) | 9B nominal / 12,2B real | 10M tokens | Bangla-TextBook | 100K (Bangla-Instruct) | Si | Si |
| G2B | Gemma-2 | 9B | No declarado | No declarado | 145K (Alpaca traducido) | No | No |
| Bangla-LLaMA | LLaMA-3.2 | 3B | Si | No declarado | 172K (Orca traducido) | No | No |
| titu-Gemma | Gemma-2 | 2B | 4,4B tokens | No declarado | No declarado | No | No |
| titu-LLaMA | LLaMA-3.1 | 3B | 37B tokens | No declarado | No declarado | No | No |
| TigerLLM-1B-it | LLaMA-3.2 | 1B | 10M tokens | Bangla-TextBook | 100K (Bangla-Instruct) | Si | Si |

Todos los modelos de la tabla comparten el mismo nicho (LLM abiertos para bengali). La diferencia principal de TigerLLM frente a G2B, Bangla-LLaMA, titu-Gemma y titu-LLaMA es la publicacion de paper, corpus declarado y caracter reproducible; la comparativa de rendimiento numerico no esta disponible en el material proporcionado.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre indica 9B pero los safetensors declaran 12,19B parametros. Hay que verificar el numero real antes de dimensionar infraestructura.
- Ambiguedad sobre la arquitectura base: el paper cita Gemma-2 y las etiquetas de HuggingFace citan `gemma3`. Esto afecta a decisiones como la ventana de contexto real y las librerias compatibles.
- Longitud de contexto no documentada: no se especifica en la model card ni en los metadatos. Para casos de uso con documentos largos hay que verificar el valor real antes de desplegar.
- Idiomas: el modelo esta orientado a bengali. No hay confirmacion en la informacion disponible sobre su competencia en castellano u otras lenguas, por lo que no deberia usarse como modelo multilingue general sin evaluacion previa.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni procesos de mitigacion. Cualquier despliegue en produccion en dominios factuales (sanidad, legal, financiero) requiere verificacion humana.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion disponible.
- Repositorio con baja traccion: 740 descargas y 3 likes, con un unico autor como mantenedor. El soporte y la frecuencia de actualizacion no estan garantizados.
- Licencia: CC-BY-4.0 permite uso comercial y obras derivadas siempre que se cite la atribucion (autores y articulo). No incluye clausulas de uso aceptable ni de responsabilidad, algo a cubrir con governance propio.
- Rendimiento no verificado de forma independiente: las afirmaciones de superioridad frente a GPT-3.5 proceden del propio articulo; no se aportan cifras reproducibles en el material disponible.
- Sin cuantizaciones oficiales publicadas (GGUF, GPTQ, AWQ), lo que anade un paso de conversion antes de poder desplegar con llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/md-nishat-008/TigerLLM-9B-it
- Modelo hermano TigerLLM-1B-it: https://huggingface.co/md-nishat-008/TigerLLM-1B-it
- Articulo en arXiv: https://arxiv.org/pdf/2503.10995 (arXiv:2503.10995)
- Articulo en ACL Anthology: https://aclanthology.org/2025.acl-short.69/
- DOI: https://doi.org/10.18653/v1/2025.acl-short.69
- Repositorio de archivos del modelo: https://huggingface.co/md-nishat-008/TigerLLM-9B-it/tree/main
- Contacto del autor: md.nishat.008@gmail.com
- Cita BibTeX (del propio repositorio): Raihan, Nishat y Zampieri, Marcos. "TigerLLM - A Family of Bangla Large Language Models". Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers), julio de 2025, Viena, Austria, paginas 887-896.
