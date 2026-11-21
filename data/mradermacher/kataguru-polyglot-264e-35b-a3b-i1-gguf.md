# mradermacher/Kataguru-Polyglot-264E-35B-A3B-i1-GGUF

## Resumen

Kataguru-Polyglot-264E-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el usuario kataguru, orientado a tareas multilingues, generacion de codigo, tool calling y razonamiento. La ficha que nos ocupa corresponde a la cuantizacion GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para llama.cpp, que ofrece el modelo en una amplia gama de formatos i1 (imatrix) desde Q2_K hasta Q6_K. El modelo base tiene 36.537.721.984 parametros totales segun los datos de safetensors, y su nombre sugiere una arquitectura MoE con 264 expertos y aproximadamente 35B de parametros totales con unos 3B activos por token.

El modelo esta disenado explicitamente para un publico multilingue que incluye no solo lenguas mayoritarias (ingles) sino tambien lenguas aglutinantes y de bajos recursos como fines, estonio, hungaro, lituano, letón, islandes, euskera, georgiano, gales y turco. Ademas, declara capacidades de codigo, function calling, agentes, RAG cross-lingue, traduccion, vision, STEM, matematicas y razonamiento. La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta ficha concreta radica en que la cuantizacion GGUF permite ejecutar un modelo MoE de ~36B parametros en hardware de consumo, algo impensable con los pesos bf16 originales. Con cuantizaciones i1-Q4_K_M de 22,4 GB, el modelo puede desplegarse en una GPU de 24 GB o en configuraciones CPU+GPU, manteniendo la mayor parte de la calidad del modelo original gracias al uso de imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), presumiblemente basada en Qwen3.5-MoE segun el tag `qwen3_5_moe` |
| Parametros totales | 36.537.721.984 (36,5B) |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio. El tag `qwen3_5_moe` sugiere que el modelo base emplea una arquitectura MoE inspirada en la familia Qwen3.5, con atencion transformer estandar y capas de expertos dispersos. El nombre "264E" apunta a 264 expertos, y "35B-A3B" a aproximadamente 35B parametros totales con unos 3B activos por token, aunque estos datos no se confirman explicitamente en la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion i1 de mradermacher utiliza un fichero imatrix (incluido en el repo, 0,5 GB) para mejorar la calidad de las cuantizaciones de baja precision, lo que es relevante para mantener el rendimiento en formatos Q2/Q3.

## Capacidades

- Generacion de texto conversacional y razonamiento general.
- Generacion de codigo y asistencia a programacion (tags `code`, `coding`, `coder`).
- Tool calling y function calling para integracion con APIs y agentes.
- Razonamiento agentico multi-paso (tag `agentic`).
- RAG y RAG cross-lingue (tag `cross-lingual-rag`).
- Traduccion entre idiomas, con enfasis en lenguas aglutinantes y de bajos recursos.
- Capacidades multimodales y de vision (tags `multimodal`, `vision`).
- STEM, matematicas y razonamiento (tags `stem`, `math`, `reasoning`).
- Soporte multilingue para en, fi, et, hu, lt, lv, is, eu, ka, cy, tr.
- Modelo "uncensored" segun el tag, lo que implica menor filtrado de contenido.

## Casos de uso

- Traduccion tecnica entre lenguas de bajos recursos: el modelo puede traducir documentacion tecnica entre fines, estonio, hungaro, lituano, letón, islandes, euskera, georgiano, gales y turco, aprovechando su entrenamiento especifico en lenguas aglutinantes y su tag de traduccion.
- RAG cross-lingue: en un pipeline de recuperacion documental multilingue, el modelo puede formular respuestas en el idioma del usuario a partir de fragmentos recuperados en otro idioma, gracias a sus capacidades de traduccion y RAG cross-lingue.
- Asistencia a programacion en produccion: con soporte de tool calling y function calling, puede integrarse en pipelines de CI/CD para generar parches, explicar errores de compilacion o invocar herramientas de analisis estatico.
- Agentes automatizados multi-paso: su tag `agentic` y su soporte de function calling lo hacen adecuado para orquestar tareas que requieren varias llamadas a herramientas, como consultas a bases de datos seguidas de sintesis de resultados.
- Atencion al cliente multilingue: puede gestionar conversaciones multi-turno en varios idiomas europeos y caucasicos, aunque la longitud de contexto no esta documentada y debe validarse empiricamente.
- Analisis de documentos con vision: el tag `multimodal` y `vision` sugiere capacidad de procesar imagenes junto a texto, util para extraer informacion de capturas, diagramas o documentos escaneados.
- Generacion de contenido STEM y matematicas: para resolver problemas matematicos o explicar conceptos cientificos, apoyandose en los tags `stem`, `math` y `reasoning`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K: ~13,7 GB
  - i1-IQ3_S: ~16,2 GB
  - i1-Q3_K_M: ~17,8 GB
  - i1-IQ4_XS: ~19,8 GB
  - i1-Q4_K_S: ~21,1 GB
  - i1-Q4_K_M: ~22,4 GB (recomendado por el autor)
  - i1-Q5_K_M: ~26,2 GB
  - i1-Q6_K: ~30,2 GB
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para los pesos; para Q5/Q6 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o IQ3_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura MoE concreta).
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos (segun el nombre), el throughput deberia ser superior al de un modelo denso de 36B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B (i1-GGUF) | 36,5B | no disponible (~3B por nombre) | no disponible | Apache 2.0 | GGUF |
| Modelo base Kataguru-Polyglot-264E-35B-A3B | 36,5B | no disponible | no disponible | Apache 2.0 | safetensors/bf16 |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas concretas no esta validado de forma independiente.
- El modelo se distribuye con el tag `uncensored`, lo que implica un filtrado de seguridad reducido; no es adecuado para aplicaciones dirigidas a menores o sin moderacion adicional.
- La longitud de contexto no esta documentada; no debe asumirse un contexto largo sin validacion empirica.
- La lista de idiomas soportados no incluye el castellano; su rendimiento en espanol es desconocido y probablemente inferior al de los idiomas declarados.
- Las cuantizaciones de baja precision (Q2_K, IQ3_XXS) pueden degradar notablemente la calidad, especialmente en tareas de razonamiento y codigo; el autor recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, el modelo base podria tener restricciones adicionales no reflejadas en esta ficha; conviene revisar la model card del modelo base antes de uso comercial.
- El tag `multimodal`/`vision` sugiere capacidades de vision, pero no se documenta que fichero mmproj acompana a estas cuantizaciones (el autor indica `skip_mmproj` vacio, sin confirmacion).
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1-GGUF): https://huggingface.co/mradermacher/Kataguru-Polyglot-264E-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Kataguru-Polyglot-264E-35B-A3B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
