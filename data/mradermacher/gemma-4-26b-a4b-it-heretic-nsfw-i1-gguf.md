# mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF` es una cuantizacion GGUF del modelo `yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`, publicada por el cuantizador habitual mradermacher. El modelo base es a su vez una variante "heretic" (abliterated/decensored) de un Gemma 4 de 26B con arquitectura MoE (el sufijo A4B indica aproximadamente 4 mil millones de parametros activos por token). El resultado es un modelo conversacional sin los filtros de seguridad habituales, distribuido en formato GGUF con cuantizaciones de tipo i1 (imatrix) para su uso en llama.cpp y entornos compatibles.

El interes practico de esta ficha es doble: por un lado, permite ejecutar un modelo de ~25.000 millones de parametros totales con un coste de computo por token propio de un modelo de ~4B activos, lo que lo hace viable en hardware de consumo con cuantizaciones agresivas (a partir de ~8,4 GB en i1-IQ1_S). Por otro, la naturaleza "heretic/NSFW" implica que el modelo ha sido modificado para eliminar rechazos y restricciones de contenido, lo que conlleva riesgos legales y de seguridad relevantes para cualquier despliegue en produccion.

La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que genera una ambiguedad que conviene verificar antes de un uso comercial. El repositorio ocupa 301 GB en total (sumando todas las cuantizaciones) y acumula 14.043 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), segun nomenclatura del modelo base; detalles no disponibles |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (indicado por el sufijo A4B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; estaticas en repo separado |
| Idiomas soportados | en (segun la model card; resto no disponible) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 con mezcla de expertos (MoE), segun se deduce del sufijo A4B y de la nomenclatura "gemma-4-26B-A4B-it". Se trata de un transformer decoder-only con enrutamiento disperso, donde solo una fraccion de los parametros (del orden de 4B) se activa por token, lo que reduce el coste de inferencia frente a un denso de 26B. La variante "heretic" implica un proceso de abliteration o fine-tuning dirigido a eliminar el comportamiento de rechazo (refusal) del modelo instruct original; la model card no documenta la metodologia exacta, el volumen de datos ni si hubo RLHF/DPO adicional.

La cuantizacion la realiza mradermacher con el metodo i1 (imatrix), que calibra los pesos con una matriz de importancia para preservar mejor la calidad en niveles bajos de bits. Se ofrecen tanto cuantizaciones IQ (importancia-aware) como K-quants clasicas, ademas de un fichero imatrix para generar cuantizaciones propias. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Modelo marcado como vision (la model card indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico).
- Contenido sin censura: abliterated/decensored, orientado a generar respuestas sin rechazos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara `en`; el resto no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del Gemma 4 instruct original, midiendo la tasa de rechazos y la degradacion en tareas de seguridad.
- Generacion creativa de ficcion adulta: al no aplicar filtros de contenido, puede emplearse en entornos controlados para redaccion de narrativa para adultos, con la advertencia de que su uso debe cumplir la legislacion aplicable.
- Despliegue local en hardware de consumo: gracias a su naturaleza MoE (~4B activos) y a cuantizaciones desde ~8,4 GB (i1-IQ1_S) o ~16,9 GB (i1-Q4_K_M), puede ejecutarse en GPU consumer con llama.cpp u Ollama para experimentacion offline.
- Prototipado de asistentes conversacionales sin restricciones: util para probar prompts y flujos de dialogo en los que los rechazos del modelo base interfieren con el desarrollo, siempre en un entorno aislado.
- Evaluacion de cuantizaciones: el repositorio incluye un amplio abanico de niveles (de IQ1 a Q6) y un fichero imatrix, lo que permite estudiar la degradacion de calidad segun bits por peso en un modelo MoE.
- Analisis de contenido visual (si se dispone del mmproj): la model card lo declara como modelo de vision, por lo que podria emplearse en tareas de descripcion de imagenes, sujeto a verificacion del fichero mmproj en el repositorio estatico.
- Benchmarking de inferencia MoE en local: permite medir throughput y latencia de un MoE de 26B/4B activos en distintas GPU y cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, aproximado): i1-IQ1_S ~8,4 GB; i1-IQ2_M ~10,5 GB; i1-IQ3_S ~12,3 GB; i1-IQ4_XS ~14,0 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,2 GB; i1-Q6_K ~22,7 GB.
- Al ser MoE con ~4B activos, el coste de computo por token es menor que el de un denso de 26B, pero la VRAM debe alojar los pesos totales de la capa activa correspondiente; con offloading a CPU es posible en equipos con menos VRAM.
- GPU recomendadas: para cuantizaciones Q4-Q5 en su totalidad, GPUs con 24 GB o mas (RTX 3090/4090, A10G, L4 con offloading); para Q6 y superiores, A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en RTX 3060 12 GB con cuantizaciones IQ2/IQ3, y en RTX 4090 24 GB con Q4_K_M o Q5_K_M completos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM/TGI (no confirmado para esta variante).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-heretic-NSFW (i1-GGUF) | ~25,2B | ~4B | no disponible | apache-2.0 | GGUF | Variante sin censura, cuantizada por mradermacher |
| gemma-4-26B-A4B-it (base) | ~25,2B | ~4B | no disponible | licencia Gemma 4 | safetensors | Modelo instruct original con filtros de seguridad |
| gemma-4-26B-A4B-it-heretic-NSFW (estatico) | ~25,2B | ~4B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/decensored: no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino; no apto para uso sin moderacion externa.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, especialmente en cuantizaciones muy bajas (IQ1, IQ2).
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Ambiguedad de licencia: se declara apache-2.0 pero se enlaza la licencia de Gemma 4 de Google, que impone restricciones de uso; verificar antes de cualquier despliegue comercial.
- La model card incluye la etiqueta `not-for-all-audiences`; el contenido puede no ser adecuado para todos los publicos.
- Las cuantizaciones por debajo de Q4 degradan notablemente la calidad; el propio autor recomienda i1-Q4_K_M como equilibrio.
- No hay informacion sobre contexto maximo, tool calling ni capacidades de agente, lo que limita su uso en pipelines complejos.
- El repositorio ocupa 301 GB; descargar solo el fichero de cuantizacion deseado, no el repo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
