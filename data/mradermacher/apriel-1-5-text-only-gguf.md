# mradermacher/Apriel-1.5-Text-Only-GGUF

## Resumen

Apriel-1.5-Text-Only es un modelo de lenguaje de aproximadamente 14.400 millones de parametros desarrollado por ServiceNow AI. Esta ficha se centra en la version GGUF cuantizada publicada por mradermacher, que permite ejecutar el modelo con llama.cpp y herramientas compatibles en hardware de consumo. El modelo base es una variante "Text-Only" de la familia Apriel 1.5, orientada exclusivamente a generacion de texto y conversacion en ingles.

La publicacion de esta version cuantizada es relevante porque reduce el peso del modelo desde los aproximadamente 28 GB en punto flotante (FP16) hasta rangos de 5,7 GB (Q2_K) a 15,4 GB (Q8_0), lo que hace viable su despliegue en GPUs de consumo como la RTX 4090 o incluso en configuraciones con memoria unificada. La cuantizacion es estatica, sin variantes imatrix ni ponderadas en el momento de la publicacion.

El modelo se distribuye bajo el pipeline de transformers y cuenta con etiquetas de compatibilidad con endpoints. El repositorio tiene un tamano de 99,5 GB, lo que refleja la multiplicidad de cuantizaciones incluidas. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Apriel 1.5) |
| Parametros totales | 14.428.902.400 (14,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas, sin imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (version original en safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base ServiceNow-AI/Apriel-1.5-Text-Only en la documentacion proporcionada. Por el numero de parametros (14,4 mil millones) y la nomenclatura de la familia Apriel, se trata presumiblemente de un transformer denso de tipo decoder-only, pero no se confirma en la informacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

La version aqui descrita es una cuantizacion estatica realizada por mradermacher mediante el pipeline de conversion a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). No se han publicado variantes imatrix ni ponderadas por el autor de la cuantizacion en el momento de la publicacion. Las cuantizaciones se ofrecen en once variantes, desde Q2_K hasta Q8_0, con tamanos que van de 5,7 GB a 15,4 GB.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integracion con infraestructura de inferencia estandar.
- Al ser una variante "Text-Only", no se espera soporte de vision, audio ni modalidades adicionales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking o capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede gestionar dialogos multi-turno gracias a su naturaleza conversacional y su tamano de 14,4 mil millones de parametros, adecuado para respuestas coherentes en entornos de atencion al cliente en ingles.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (8,9 GB), el modelo cabe en una GPU de 12 GB o superior, lo que permite ejecutar un asistente local sin depender de la nube.
- Prototipado rapido con llama.cpp u Ollama: la disponibilidad de multiples cuantizaciones GGUF facilita probar el modelo en estaciones de trabajo sin GPUs de datacenter.
- Generacion de texto en pipelines de procesamiento por lotes: la version Q8_0 (15,4 GB) ofrece la maxima calidad de cuantizacion para tareas de generacion offline donde la latencia no es critica.
- Investigacion y evaluacion de modelos: investigadores que necesiten comparar el comportamiento de Apriel 1.5 en formato cuantizado pueden usar estas variantes para medir la degradacion por cuantizacion.
- Integracion en aplicaciones de escritorio o edge con memoria limitada: la variante Q2_K (5,7 GB) permite ejecutar el modelo en equipos con 8 GB de VRAM, aunque con perdida de calidad notable.
- Fine-tuning o evaluacion comparativa: aunque el formato GGUF no es el ideal para entrenamiento, sirve para evaluacion de inferencia y comparacion con otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~5,7 GB
  - Q3_K_S: ~6,6 GB
  - Q3_K_M: ~7,2 GB
  - Q3_K_L: ~7,8 GB
  - IQ4_XS: ~8,1 GB
  - Q4_K_S: ~8,5 GB
  - Q4_K_M: ~8,9 GB
  - Q5_K_S: ~10,1 GB
  - Q5_K_M: ~10,4 GB
  - Q6_K: ~11,9 GB
  - Q8_0: ~15,4 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con holgura; RTX 4080 / 4070 Ti (16 GB) para Q5_K_M y Q6_K; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_M y Q5_K_S.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 8 GB hasta Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con servicios de inferencia tipo TGI o vLLM a traves del modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Apriel-1.5-Text-Only (GGUF) | 14,4 mil millones | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelo base ServiceNow-AI/Apriel-1.5-Text-Only | 14,4 mil millones | no disponible | no disponible | safetensors | Hugging Face (ServiceNow-AI) |
| Alternativas de tamano similar (p. ej., Qwen2.5-14B, Mistral-Nemo-12B) | 12-14 mil millones | 32K-128K (segun modelo) | Apache 2.0 / otras | GGUF, safetensors | Hugging Face |

No se dispone de datos de rendimiento comparativo entre Apriel 1.5 y otras familias de modelos de tamano similar en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un modelo entrenado predominantemente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido facticamente incorrecto.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles; no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia no esta disponible en los metadatos, por lo que no se puede confirmar si permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de usarlo en produccion.
- La cuantizacion Q2_K y Q3_K_M presentan perdida de calidad significativa (la Q3_K_M esta marcada como "lower quality" por el autor de la cuantizacion).
- No se dispone de variantes imatrix, que suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes.
- El repositorio tiene un tamano de 99,5 GB, lo que puede dificultar la descarga completa; se recomienda descargar solo el archivo de cuantizacion deseado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apriel-1.5-Text-Only-GGUF
- Modelo base: https://huggingface.co/ServiceNow-AI/Apriel-1.5-Text-Only
- Pagina de descargas del autor: https://hf.tst.eu/model#Apriel-1.5-Text-Only-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
