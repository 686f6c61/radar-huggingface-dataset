# mradermacher/GemmaTranslate-v3-12B-GGUF

## Resumen

GemmaTranslate-v3-12B-GGUF es la version cuantizada en formato GGUF del modelo SpongeBOB9684/GemmaTranslate-v3-12B, un merge realizado con mergekit a partir de la familia Gemma 3 de Google. El modelo original tiene 11.766.034.176 parametros (aproximadamente 12B) y esta etiquetado como modelo de traduccion con capacidades multimodales, lo que sugiere que hereda la torre de vision de Gemma 3. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad, para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo resuelve el problema de desplegar un modelo de traduccion de 12B en entornos con recursos limitados: ofrece cuantizaciones desde Q2_K (4,9 GB) hasta Q8_0 (12,6 GB), ademas de los ficheros mmproj necesarios para el procesamiento multimodal. Es relevante porque combina la licencia Gemma (permisiva para uso comercial con condiciones) con un pipeline de traduccion y un contexto heredado de Gemma 3, aunque la model card no detalla explicitamente la longitud de contexto del merge.

Al tratarse de un merge de la comunidad y no de un modelo oficial de Google, su calidad y comportamiento deben validarse empiricamente antes de usarlo en produccion. La informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del merge ni los datos de entrenamiento, y el unico idioma declarado en los metadatos es el ingles, aunque su naturaleza de traductor implica capacidades multilingues no documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3, merge con mergekit) |
| Parametros totales | 11.766.034.176 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (declarado en metadatos); capacidades multilingues no documentadas |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base SpongeBOB9684/GemmaTranslate-v3-12B es un merge generado con mergekit a partir de modelos de la familia Gemma 3, segun los tags de la model card. No se especifica que modelos concretos se combinaron, ni los pesos del merge, ni si hubo un proceso de fine-tuning posterior. La arquitectura subyacente es la de Gemma 3: un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas, y una torre de vision para entrada multimodal (de ahi los ficheros mmproj en la publicacion GGUF).

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de Gemma 3. La cuantizacion realizada por mradermacher usa el pipeline estandar de llama.cpp con cuantizaciones estaticas (convert_type: hf, output_tensor_quantised: 1), y existe una version con cuantizaciones ponderadas/imatrix en el repositorio GemmaTranslate-v3-12B-i1-GGUF.

## Capacidades

- Generacion de texto y traduccion: el pipeline declarado es translation, por lo que el modelo esta orientado a tareas de traduccion automatica.
- Procesamiento multimodal: dispone de ficheros mmproj (Q8_0 y f16) para entrada de imagenes, heredado de Gemma 3.
- Conversacion multi-turno: el tag conversational indica soporte de chat.
- Capacidades multilingues: no documentadas explicitamente; los metadatos solo declaran en, pero un modelo de traduccion implica al menos dos idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir articulos, manuales y READMEs entre idiomas manteniendo terminologia especializada, aprovechando su pipeline de translation y su tamano de 12B para preservar coherencia en textos largos.
- Localizacion de interfaces y contenido web: integrado en un pipeline de CI/CD, puede traducir cadenas de recursos y ficheros de localizacion de forma automatizada, con la cuantizacion Q4_K_M como equilibrio entre calidad y velocidad.
- Traduccion de imagenes con texto: gracias a los ficheros mmproj, puede procesar capturas o documentos escaneados y traducir el texto embebido, util para digitalizar material multilingue.
- Traduccion en entornos con recursos limitados: las cuantizaciones Q2_K a Q4_K_S permiten ejecutar el modelo en GPUs de consumo o incluso en CPU, lo que facilita desplegarlo en portatiles o servidores pequenos sin GPU dedicada.
- Prototipado de asistentes de traduccion conversacional: el tag conversational permite construir chatbots que traduzcan mensajes en tiempo real en soporte al cliente o mensajeria.
- Generacion de subtitulos y transcripciones traducidas: combinado con un sistema de ASR, puede traducir transcripciones por segmentos y producir subtitulos en otro idioma.
- Evaluacion comparativa de merges: util como caso de estudio para investigadores que analicen el efecto de mergekit sobre modelos Gemma 3 en tareas de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~5-6 GB, Q3_K_M ~6-7 GB, Q4_K_M ~7-8 GB, Q5_K_M ~8-9 GB, Q6_K ~10-11 GB, Q8_0 ~13-14 GB. Los ficheros mmproj anaden 0,7-1,0 GB si se usa la entrada multimodal.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB o A100 40 GB para Q8_0 con margen para contexto largo.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K en GPUs de 8-12 GB; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, y servidores compatibles con la API de OpenAI (el tag endpoints_compatible lo indica). vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion.
- Latencia y throughput estimados: no disponibles; dependen en gran medida de la GPU y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GemmaTranslate-v3-12B-GGUF | ~12B | no disponible | gemma | GGUF | Merge comunitario orientado a traduccion, multimodal |
| Gemma 3 12B (oficial) | ~12B | no disponible en esta ficha | gemma | safetensors, GGUF | Modelo oficial de Google, base del merge; sin fine-tuning de traduccion |
| NLLB-200 (Meta) | 600M-54B | 512 tokens (tipico) | CC-BY-NC (segun variante) | safetensors | Modelo dedicado a traduccion, sin capacidades multimodales ni conversacionales |
| TowerInstruct (Unbabel) | 7B-70B | 4K-16K (segun variante) | CC-BY-NC-4.0 | safetensors | Especializado en traduccion, sin vision |

La comparativa es orientativa: no hay datos de rendimiento publicados para GemmaTranslate-v3-12B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Al ser un merge comunitario sin benchmarks publicados, no hay garantia de que la calidad de traduccion sea superior a la del Gemma 3 base; puede incluso degradarla en algunos pares de idiomas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en traduccion de textos largos o con terminologia muy especializada.
- Los metadatos solo declaran el idioma ingles; el soporte real de otros idiomas no esta documentado y debe validarse.
- La longitud de contexto no esta especificada en la model card; no asumir la de Gemma 3 sin verificacion empirica.
- La licencia Gemma impone condiciones de uso (terminos de uso de Gemma); revisar las restricciones para uso comercial y la obligacion de atribucion antes de desplegar en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de traduccion; se recomienda Q4_K_M o superior para produccion.
- El modelo no documenta sesgos conocidos; al heredar los de Gemma 3, es probable que presente sesgos de genero, culturales y geograficos.
- No hay informacion sobre tool calling ni soporte de agentes; no asumir estas capacidades.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GemmaTranslate-v3-12B-GGUF
- Modelo base: https://huggingface.co/SpongeBOB9684/GemmaTranslate-v3-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/GemmaTranslate-v3-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#GemmaTranslate-v3-12B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- mergekit: no disponible en la informacion proporcionada (referencia habitual: https://github.com/arcee-ai/mergekit)
- Gemma 3 (Google): no disponible en la informacion proporcionada (referencia habitual: https://huggingface.co/google/gemma-3-12b-it)
