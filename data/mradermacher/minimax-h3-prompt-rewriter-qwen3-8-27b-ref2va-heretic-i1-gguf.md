# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF es una cuantizacion GGUF del modelo MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic, un fine-tuning especializado en reescritura de prompts (prompt rewriting) construido sobre una base Qwen 3.8 de 27.000 millones de parametros. El modelo original lo desarrolla lightx2v y la variante "heretic" (abliterated/decensored) la publica funnygeeker; mradermacher se encarga de generar las cuantizaciones con imatrix para su uso en llama.cpp y entornos compatibles con GGUF.

La funcion principal del modelo es transformar instrucciones del usuario en prompts refinados y estructurados, con soporte multimodal (vision-lenguaje) segun las etiquetas del repositorio, y con la particularidad de haber sido sometido a un proceso de "abliteration" que elimina los rechazos de contenido del modelo base. Esto lo hace relevante para pipelines creativos y de generacion de imagenes o video donde se necesita un reescritor de prompts sin filtros restrictivos.

El repositorio incluye cuantizaciones i1 (imatrix) en varios tamanos, desde 11 GB (i1-Q2_K) hasta 15,9 GB (i1-Q4_K_S), lo que permite desplegar un modelo de 27B en hardware de consumo. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8, segun etiquetas del repo) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (imatrix); lista completa de quants previstos: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en, zh (segun etiquetas); la model card solo declara en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27.320 millones de parametros derivado de la familia Qwen 3.8, segun las etiquetas del repositorio (qwen3.5, qwen3.8). Se trata de un fine-tuning especializado en reescritura de prompts sobre el modelo MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA de lightx2v, que a su vez fue sometido a un proceso de abliteration por funnygeeker para producir la variante "heretic". Las etiquetas indican soporte multimodal vision-lenguaje y la presencia de "mtp" (multi-token prediction), aunque la model card no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados.

La cuantizacion la realiza mradermacher con la herramienta de imatrix (importancia matrix), que pondera los tensores segun su relevancia para preservar la calidad en tasas de bits bajas. El repositorio incluye el fichero imatrix.gguf para que otros puedan generar sus propias cuantizaciones. No se dispone de informacion sobre el proceso de RLHF/DPO ni sobre innovaciones tecnicas adicionales mas alla de las etiquetas mencionadas.

## Capacidades

- Reescritura de prompts: funcion principal del modelo, transforma instrucciones en prompts refinados y estructurados.
- Generacion de texto conversacional en ingles y chino.
- Capacidades multimodales vision-lenguaje (segun etiquetas del repo).
- Multi-token prediction (MTP) segun etiquetas.
- Modelo "abliterated"/"decensored": no aplica rechazos de contenido tipicos del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Reescritura de prompts para generacion de imagenes o video: el modelo toma una instruccion breve del usuario y la expande en un prompt detallado y estructurado, adecuado para pipelines de difusion. Su especializacion "Ref2VA" y "prompt-rewriting" lo orientan a este escenario.
- Preprocesado en pipelines creativos sin filtros: al ser una variante abliterated, permite reescribir prompts que el modelo base rechazaria, util en flujos artisticos o de investigacion sobre sesgos.
- Interfaz conversacional de refinamiento iterativo: con 27B de parametros y capacidad conversacional, puede mantener dialogos multi-turno para pulir un prompt hasta que el usuario este satisfecho.
- Despliegue local en estaciones de trabajo: las cuantizaciones i1-Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM mediante llama.cpp.
- Traduccion y adaptacion de prompts entre ingles y chino: los idiomas declarados permiten reescribir prompts en un idioma y adaptarlos al otro.
- Generacion asistida con contexto visual: si se despliega con los ficheros mmproj del repositorio estatico, puede reescribir prompts a partir de una imagen de referencia.
- Investigacion sobre alineacion y censura: la variante heretic sirve para estudiar el comportamiento de modelos sin rechazos y comparar con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead):
  - i1-Q2_K (11,0 GB): aproximadamente 12-14 GB de VRAM.
  - i1-IQ3_M (12,9 GB): aproximadamente 14-16 GB de VRAM.
  - i1-Q4_K_S (15,9 GB): aproximadamente 17-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_S con margen; A100 40/80 GB o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_S; en GPUs de 16 GB con IQ3_M o Q2_K ajustando el contexto.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF. Para el modelo base en safetensors, transformers y vLLM/TGI (no confirmado para esta variante).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Reescritor de prompts abliterated, multimodal |
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA (lightx2v) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin abliteration |
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic (funnygeeker) | 27,3B | no disponible | Apache 2.0 | safetensors | Variante abliterated en precision completa |
| Qwen 3.8 27B (base, referencia) | ~27B | no disponible | no disponible | safetensors | Modelo generalista del que deriva la familia |

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de contenido, lo que implica riesgo de generar contenido sensible, ofensivo o inapropiado sin filtros. No recomendado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de 27B, especialmente en tareas factuales fuera de su dominio de especializacion (reescritura de prompts).
- La model card solo declara ingles como idioma, aunque las etiquetas incluyen chino; el soporte real de otros idiomas no esta verificado.
- La longitud de contexto no esta documentada en la informacion disponible; conviene verificarla antes de usos con entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero el caracter abliterated puede entrar en conflicto con politicas de plataformas o requisitos regulatorios del despliegue.
- El modelo es una cuantizacion: las versiones de baja calidad (Q2_K, IQ1) degradan notablemente la coherencia y la calidad de la reescritura.
- No hay benchmarks publicados que permitan validar su calidad frente al modelo base o a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF
- Modelo base (funnygeeker, heretic): https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic
- Modelo original (lightx2v): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Cuantizaciones estaticas (mradermacher): https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
