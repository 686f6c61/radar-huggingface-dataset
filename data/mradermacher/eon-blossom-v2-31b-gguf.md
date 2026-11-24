# mradermacher/Eon-Blossom-V2-31B-GGUF

## Resumen

Eon-Blossom-V2-31B-GGUF es la distribucion en formato GGUF del modelo Eon-Blossom-V2-31B, desarrollado originalmente por Cyclone-Labs y cuantizado por mradermacher. Se trata de un merge de modelos (generado con mergekit) orientado a roleplay y narrativa (storytelling), con 30.697.345.596 parametros totales (aproximadamente 31B). El repositorio incluye tanto cuantizaciones estaticas como suplementos multimodales (mmproj), lo que sugiere capacidad de vision, aunque la model card no detalla la arquitectura ni el proceso de entrenamiento.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de 31B en hardware de consumo mediante cuantizacion GGUF (desde 12 GB en Q2_K hasta 32,7 GB en Q8_0), con licencia Apache 2.0. Sin embargo, la informacion tecnica publicada es muy limitada: no se documentan tokens de entrenamiento, composicion del dataset, longitud de contexto ni resultados de benchmarks, lo que obliga a tratar muchas especificaciones como no disponibles.

El modelo esta etiquetado exclusivamente para ingles y su caso de uso declarado es conversacional, con enfasis en roleplay y storytelling. Es, por tanto, una opcion especializada en generacion creativa y dialogo, no en tareas de razonamiento tecnico o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de un merge con mergekit; no se detalla la arquitectura subyacente) |
| Parametros totales | 30.697.345.596 (aprox. 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 (suplementos multimodales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Cyclone-Labs/Eon-Blossom-V2-31B. Las etiquetas del repositorio indican que se trata de un merge generado con mergekit, lo que implica que el modelo se construyo combinando los pesos de varios modelos preexistentes mediante alguna estrategia de fusion (no especificada). No se documenta si la base es un transformer denso, MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o mecanismo de atencion.

Tampoco se publican datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de alineacion. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion y a listar los ficheros GGUF disponibles, sin aportar informacion sobre el entrenamiento del modelo original. La presencia de ficheros mmproj sugiere que el modelo base incorpora un componente multimodal (probablemente vision), pero no se detalla su funcionamiento ni los datos con los que se entreno.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis declarado en roleplay y storytelling.
- Capacidad multimodal probable (presencia de ficheros mmproj-Q8_0 y mmproj-f16), aunque no se documenta el tipo exacto de modalidad ni su alcance.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking" ni capacidades de audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Roleplay conversacional: el modelo esta etiquetado explicitamente para roleplay, por lo que puede mantener personajes coherentes en dialogos multi-turno. Su tamano de 31B permite mayor riqueza expresiva que modelos de 7B-13B en este tipo de tareas.
- Generacion de narrativa y ficcion: adecuado para escribir relatos, dialogos y descripciones con estilo literario, gracias a su orientacion a storytelling.
- Prototipado de chatbots creativos: con cuantizaciones Q4_K_M (18,8 GB) puede desplegarse en estaciones de trabajo con GPU de 24 GB para experimentar con asistentes de personaje.
- Generacion de contenido para juegos de rol de mesa: el modelo puede actuar como master de juego o interprete de PNJ, generando respuestas contextuales en ingles.
- Experimentacion con merges de modelos: util para investigadores que quieran evaluar el comportamiento de un merge de 31B cuantizado frente al modelo original en tareas creativas.
- Inferencia local en hardware de consumo: las cuantizaciones Q2_K (12 GB) y Q3_K_S (13,9 GB) permiten ejecutar el modelo en GPUs de 16 GB o en configuraciones con RAM del sistema, aunque con perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes GGUF, lo que facilita estudiar el impacto de la cuantizacion en la calidad de generacion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 12,0 GB
  - Q3_K_S: 13,9 GB
  - Q3_K_M: 15,4 GB
  - Q3_K_L: 16,7 GB
  - IQ4_XS: 17,0 GB
  - Q4_K_S: 17,9 GB
  - Q4_K_M: 18,8 GB
  - Q5_K_S: 21,4 GB
  - Q5_K_M: 21,9 GB
  - Q6_K: 25,3 GB
  - Q8_0: 32,7 GB
- Suplementos multimodales: mmproj-Q8_0 (0,9 GB) y mmproj-f16 (1,3 GB), que se suman a la VRAM de la cuantizacion elegida si se usa la capacidad multimodal.
- GPU recomendadas: para Q8_0 se necesita una GPU de 40 GB o superior (A100 40GB, A100 80GB, H100). Para Q6_K, una GPU de 32 GB (V100 32GB, A100 40GB). Para Q4_K_M, una RTX 4090 (24 GB) o A6000 (48 GB) con margen para contexto.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizaciones hasta Q5_K_M (21,9 GB) dejando poco margen para contexto; en RTX 3090 (24 GB) de forma similar. En GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo caben Q2_K y Q3_K_S, con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base (transformers) puede servirse con vLLM o TGI, pero las cuantizaciones GGUF estan pensadas para llama.cpp y derivados.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eon-Blossom-V2-31B-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF | Merge orientado a roleplay/storytelling, solo ingles |
| Modelo base Cyclone-Labs/Eon-Blossom-V2-31B | 30,7B | no disponible | Apache 2.0 | safetensors | Version original sin cuantizar |
| Alternativas de 30B para roleplay | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria. No se han publicado benchmarks ni especificaciones de contexto que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion tecnica muy limitada: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Solo ingles: la model card declara unicamente el idioma ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo, especialmente en tareas de roleplay y narrativa, puede inventar hechos o inconsistencia en conversaciones largas.
- Sesgos conocidos: no documentados por el autor; al ser un merge sin informacion de alineacion, los sesgos heredados de los modelos componentes son desconocidos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge conviene verificar las licencias de los modelos componentes originales, que no se detallan.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Capacidad multimodal no documentada: la presencia de mmproj sugiere vision, pero no se especifica que tareas soporta ni con que calidad.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines de automatizacion que requieran function calling.
- Repositorio con pocas descargas (342) y cero likes: comunidad reducida, lo que limita el soporte y la validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Eon-Blossom-V2-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Eon-Blossom-V2-31B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Eon-Blossom-V2-31B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Eon-Blossom-V2-31B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
