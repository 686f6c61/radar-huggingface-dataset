# mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF

## Resumen

Gemma-4-26B-A4B-Arabic-It-GGUF es la version cuantizada en formato GGUF del modelo noman-asif/Gemma-4-26B-A4B-Arabic-It, un ajuste fino de la familia Gemma 4 orientado especificamente al arabe y al dialecto saudi. El modelo original parte de una arquitectura Mixture of Experts (MoE) con 25.233.142.046 parametros totales y aproximadamente 4B parametros activos por token (indicado por el sufijo A4B), lo que permite un equilibrio entre capacidad y coste de inferencia. Esta publicacion, realizada por mradermacher, proporciona cuantizaciones estaticas listas para usar con llama.cpp y ecosistemas compatibles.

El ajuste fino se ha realizado sobre dos datasets propios del autor: Arabic-Reasoning-Instruct-120k y Arabic-Preference-DPO-20k, e incorpora tecnicas como RS-LoRA, Trust-Region-DPO y TIES-merging, ademas de un modo de razonamiento en cadena (chain-of-thought). El objetivo es ofrecer un modelo conversacional con capacidad de razonamiento en arabe, incluyendo variantes dialectales saudies, manteniendo competencia en ingles.

La relevancia actual radica en la escasez de modelos abiertos con razonamiento explicito y buen rendimiento en arabe dialectal, un nicho con alta demanda en atencion al cliente, procesamiento documental y asistentes regionales. La licencia Apache 2.0 facilita su adopcion comercial, y la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permite desplegarlo en hardware muy diverso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 (aprox. 25,2B) |
| Parametros activos | Aproximadamente 4B (segun sufijo A4B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Arabe (incluye dialecto saudi) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts de la familia Gemma 4, con 25,2B parametros totales y aproximadamente 4B activos por token. Esta configuracion MoE reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano, manteniendo una capacidad de representacion elevada. El ajuste fino se ha realizado sobre el modelo noman-asif/Gemma-4-26B-A4B-Arabic-It, que a su vez deriva de Gemma 4.

El entrenamiento combina varias tecnicas: RS-LoRA (Low-Rank Adaptation con rango selectivo) para el ajuste eficiente, Trust-Region-DPO sobre el dataset Arabic-Preference-DPO-20k para alinear preferencias, y TIES-merging para fusionar pesos de distintos adaptadores o checkpoints. Ademas, se ha entrenado un modo de razonamiento en cadena (chain-of-thought) sobre Arabic-Reasoning-Instruct-120k, lo que habilita respuestas con pasos intermedios explicitos. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion detallada del dataset mas alla de los nombres y tamanos indicados.

## Capacidades

- Generacion de texto conversacional en arabe estandar y dialecto saudi, con soporte secundario de ingles.
- Razonamiento en cadena (chain-of-thought) entrenado explicitamente, adecuado para tareas que requieren pasos intermedios.
- Razonamiento matematico y logico en arabe, derivado del dataset Arabic-Reasoning-Instruct-120k.
- Alineacion de preferencias mediante Trust-Region-DPO, orientada a respuestas mas utiles y seguras.
- Capacidad multilingue limitada a arabe e ingles; no se declaran otros idiomas.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers/llama.cpp.

## Casos de uso

- Atencion al cliente en arabe y dialecto saudi: el modelo puede gestionar conversaciones multi-turno con registro dialectal, adecuado para centros de contacto en Arabia Saudi y el Golfo. La cuantizacion Q4_K_M (16,9 GB) permite desplegarlo en una unica GPU de 24 GB.
- Asistentes virtuales regionales: integracion en aplicaciones moviles o web para usuarios arabeparlantes, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones de atribucion adicionales.
- Procesamiento documental y resumen en arabe: resumen de contratos, informes o correspondencia administrativa, con la ventaja del modo chain-of-thought para tareas que requieren extraccion de conclusiones.
- Tutoria educativa en arabe: explicaciones paso a paso de conceptos matematicos o cientificos, apoyadas en el razonamiento explicito entrenado sobre datos instructivos.
- Traduccion asistida arabe-ingles: aunque no es un modelo de traduccion dedicado, su competencia bilingue permite borradores y post-edicion en flujos de localizacion.
- Analisis de sentimiento y moderacion de contenido en dialecto saudi: clasificacion y generacion de respuestas contextualizadas en redes sociales o foros, donde el arabe dialectal es predominante.
- Despliegue en hardware de consumo: con cuantizaciones Q2_K (10,7 GB) o Q3_K_S (12,3 GB) puede ejecutarse en GPUs de 12-16 GB o en CPU con llama.cpp, habilitando prototipos locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 10,7 GB
  - Q3_K_S: 12,3 GB
  - Q3_K_M: 13,4 GB
  - Q3_K_L: 13,9 GB
  - IQ4_XS: 14,2 GB
  - Q4_K_S: 15,6 GB
  - Q4_K_M: 16,9 GB
  - Q5_K_S: 18,1 GB
  - Q5_K_M: 19,2 GB
  - Q6_K: 22,7 GB
  - Q8_0: 27,0 GB
- GPU recomendadas: para Q4_K_M y superiores, RTX 4090 (24 GB), A100 40 GB o H100; para Q2_K y Q3_K_S, RTX 4080/4070 Ti (16 GB) o RTX 3090 (24 GB) con margen amplio.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 12 GB (con contexto reducido) hasta Q8_0 en RTX 4090 o RTX 3090.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El modelo base en safetensors puede servirse con vLLM o TGI, aunque la publicacion GGUF esta pensada para llama.cpp.
- Latencia y throughput: no disponibles. Al ser MoE con aproximadamente 4B parametros activos, se espera un throughput superior al de un modelo denso de 25B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Arabic-It (este) | 25,2B totales / ~4B activos | no disponible | ar, en | Apache 2.0 | GGUF, safetensors |
| Gemma-4-26B-A4B (base, sin ajuste arabe) | 25,2B totales / ~4B activos | no disponible | multilingue (segun version) | Apache 2.0 | safetensors |
| Modelos arabes densos de ~7B (familia no especificada) | ~7B | no disponible | ar, en | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos arabes y saudies, puede reflejar sesgos regionales o dialectales.
- Riesgo de alucinacion: presente como en cualquier LLM, especialmente en tareas de razonamiento factual o citas; el modo chain-of-thought no elimina este riesgo.
- Limitaciones de contexto: la longitud de contexto no esta declarada en la informacion disponible; debe verificarse antes de usos con documentos largos.
- Limitaciones de idioma: solo arabe e ingles; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de Gemma 4 (modelo base) por si imponen condiciones adicionales de atribucion o uso aceptable.
- Caveat de produccion: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No se ha documentado soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de function calling.
- El tag `skip_mmproj: 1` sugiere que no se incluyen pesos multimodales; el modelo es solo texto.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF
- Modelo base: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Arabic-It-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-26B-A4B-Arabic-It-GGUF
- Dataset de razonamiento: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-120k
- Dataset de preferencias DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-20k
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
