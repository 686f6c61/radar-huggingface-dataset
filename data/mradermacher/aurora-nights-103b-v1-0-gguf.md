# mradermacher/Aurora-Nights-103B-v1.0-GGUF

## Resumen

Aurora-Nights-103B-v1.0-GGUF es la version cuantizada en formato GGUF del modelo Aurora-Nights-103B-v1.0, desarrollado originalmente por sophosympatheia y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de gran escala con 103.202.824.192 parametros (aproximadamente 103.200 millones), lo que lo situa en la categoria de modelos densos de gran tamano, por encima de la mayoria de modelos abiertos de referencia de 70B. El modelo base esta publicado bajo licencia llama2 y esta orientado principalmente al idioma ingles.

La relevancia de esta publicacion radica en que mradermacher ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de 103B en hardware mas modesto que el requerido por los pesos completos en precision alta. El repositorio ocupa 700,4 GB e incluye variantes divididas en multiples partes para facilitar la descarga y el uso con llama.cpp y herramientas compatibles.

No se dispone de informacion publica sobre la arquitectura interna, los datos de entrenamiento ni las capacidades especificas del modelo base en la informacion proporcionada; la model card del repositorio cuantizado se limita a describir el proceso de cuantizacion y los ficheros generados. El modelo acumula 23 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 103.202.824.192 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 700,4 GB |
| Modelo base | sophosympatheia/Aurora-Nights-103B-v1.0 |
| Libreria | transformers |
| Fecha de creacion | 2024-12-12 |
| Fecha de actualizacion | 2026-11-28 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El dato objetivo disponible es el numero de parametros (103.202.824.192), que corresponde a un modelo denso de gran escala. No se especifica si emplea attention lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion arquitectonica.

Respecto al entrenamiento, la model card del repositorio cuantizado no incluye informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni el proceso de alineacion. La unica informacion tecnica adicional es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (etiquetadas como `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), y ofrece ademas cuantizaciones ponderadas/imatrix en un repositorio separado (`mradermacher/Aurora-Nights-103B-v1.0-i1-GGUF`), que suelen ofrecer mejor calidad que las estaticas de tamano similar.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente con el idioma `en`, por lo que su uso previsto es la generacion de texto en ingles.
- Razonamiento y generacion general: no se documentan capacidades especificas mas alla de la generacion de texto propia de un modelo de lenguaje de gran escala.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion local mediante GGUF: el formato permite inferencia con llama.cpp y herramientas compatibles, incluyendo cuantizaciones de 2 a 8 bits.

## Casos de uso

- Inferencia local en ingles con hardware de gama alta: las cuantizaciones Q4_K_M (62,0 GB) y Q5_K_M (73,0 GB) permiten ejecutar un modelo de 103B en estaciones de trabajo con suficiente VRAM o RAM, algo inviable con los pesos completos en fp16.
- Generacion de texto creativo y narrativo en ingles: el nombre del modelo y su origen en la comunidad de modelos fusionados sugieren un uso orientado a escritura creativa, aunque no se documenta explicitamente.
- Despliegue en servidores con multiples GPU: las variantes Q8_0 (109,8 GB) y Q6_K (84,8 GB) ofrecen la mayor calidad dentro del formato GGUF para entornos con recursos abundantes.
- Pruebas de calidad frente a tamano: la disponibilidad de cuantizaciones desde Q2_K (38,0 GB) hasta Q8_0 permite comparar el impacto de la cuantizacion en la calidad de salida para un mismo modelo.
- Integracion en pipelines con llama.cpp: el formato GGUF es compatible con llama.cpp, Ollama y otros runners, lo que facilita su incorporacion en aplicaciones de escritorio o servidores sin dependencia de GPUs de datacenter.
- Evaluacion comparativa de modelos de 100B+: util para investigadores que necesiten medir el rendimiento de un modelo denso de 103B en tareas en ingles frente a alternativas de 70B u 8x7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion (tamano de fichero): Q2_K 38,0 GB; Q3_K_S 44,6 GB; Q3_K_M 49,7 GB; Q3_K_L 54,2 GB; IQ4_XS 55,7 GB; Q4_K_S 58,7 GB; Q4_K_M 62,0 GB; Q5_K_S 71,1 GB; Q5_K_M 73,0 GB; Q6_K 84,8 GB; Q8_0 109,8 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano de las cuantizaciones, las variantes de 4 bits requieren al menos 62-73 GB de memoria combinada, lo que implica multiples GPU o GPU de datacenter (A100 80GB, H100 80GB) para caber en VRAM.
- Cabe en consumer GPU: no para las cuantizaciones de 4 bits o superiores en una unica GPU de consumo; solo mediante offloading a RAM del sistema con llama.cpp, a costa de latencia elevada. Las cuantizaciones Q2_K y Q3_K_S (38-44,6 GB) siguen superando la VRAM de las GPU de consumo actuales mas comunes (24 GB).
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, entre otras); el modelo base es compatible con transformers. No se documenta soporte de vLLM o TGI para esta version cuantizada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus cuantizaciones, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se comparan unicamente datos objetivos de formato y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aurora-Nights-103B-v1.0-GGUF | 103.202.824.192 | no disponible | GGUF (Q2_K a Q8_0) | llama2 | Hugging Face (mradermacher) |
| Modelo base Aurora-Nights-103B-v1.0 | 103.202.824.192 | no disponible | safetensors | llama2 | Hugging Face (sophosympatheia) |
| Alternativas de ~70B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese dominio, aunque no se confirma.
- Riesgo de alucinacion: no cuantificado; como todo modelo de lenguaje generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de conocimiento especifico.
- Limitaciones de contexto e idioma: el modelo esta etiquetado solo para ingles; no se documenta la longitud de contexto, por lo que no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Restricciones de licencia: la licencia llama2 impone condiciones de uso comercial (incluidos umbrales de usuarios activos mensuales y restricciones de uso aceptable) que deben revisarse antes de un despliegue en produccion.
- Calidad de las cuantizaciones: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 como opciones rapidas y de buena calidad.
- Ficheros multiparte: varias cuantizaciones (Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0) se distribuyen divididas en 2 o 3 partes que deben concatenarse antes de su uso.
- Ausencia de datos de evaluacion: no hay benchmarks publicados en la informacion disponible, por lo que el rendimiento real del modelo no puede verificarse a priori.
- Madurez del repositorio: 23 descargas y 0 likes indican una adopcion muy baja, con escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aurora-Nights-103B-v1.0-GGUF
- Modelo base: https://huggingface.co/sophosympatheia/Aurora-Nights-103B-v1.0
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Aurora-Nights-103B-v1.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Aurora-Nights-103B-v1.0-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
