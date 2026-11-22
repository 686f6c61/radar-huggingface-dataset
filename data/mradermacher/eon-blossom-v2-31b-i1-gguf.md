# mradermacher/Eon-Blossom-V2-31B-i1-GGUF

## Resumen

Eon-Blossom-V2-31B-i1-GGUF es una distribucion de cuantizaciones GGUF del modelo Eon-Blossom-V2-31B, publicado originalmente por Cyclone-Labs. El modelo base es un merge de modelos creado con mergekit, orientado especificamente a roleplay y storytelling en ingles. Esta version la produce mradermacher, un conocido cuantizador de la comunidad que genera variantes GGUF con tecnicas de imatrix para mejorar la calidad por bit.

El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones), lo que lo situa en la categoria de modelos de 31B. Esta pensado para ejecutarse en local mediante llama.cpp y sus derivados, y se distribuye con un amplio abanico de cuantizaciones que van desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB), cubriendo desde configuraciones muy limitadas de memoria hasta despliegues de alta fidelidad.

La relevancia de esta ficha radica en que el modelo base no ofrece informacion publica sobre arquitectura, contexto o datos de entrenamiento, por lo que la version cuantizada es, en la practica, el principal punto de acceso para desarrolladores que quieran evaluarlo. Su licencia Apache 2.0 facilita el uso comercial, aunque las capacidades reales del modelo estan acotadas a generacion conversacional creativa en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base creado con mergekit; arquitectura subyacente no documentada) |
| Parametros totales | 30.697.345.596 (aprox. 30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base. La model card solo indica que Cyclone-Labs/Eon-Blossom-V2-31B es un merge creado con mergekit, lo que implica que se ha generado combinando los pesos de dos o mas modelos mediante alguna tecnica de fusion (probablemente SLERP, TIES o DARE, aunque no se especifica). El resultado es un modelo denso de aproximadamente 30,7 mil millones de parametros.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Las etiquetas del repositorio (roleplay, storytelling) y la categoria conversational sugieren un ajuste orientado a dialogos creativos y narrativa, pero no hay informacion verificable sobre el proceso. La innovacion tecnica de esta publicacion concreta es la cuantizacion con imatrix (i1) realizada por mradermacher, que emplea una matriz de importancia para asignar mas bits a los tensores mas sensibles y mejorar la relacion calidad/tamano frente a las cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en roleplay y narrativa.
- Storytelling: continuacion de relatos, construccion de personajes y escenas.
- Dialogo multi-turno orientado a mantener la coherencia de personaje.
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de modo de razonamiento explicito (thinking mode).
- No hay evidencia documentada de capacidades de vision, audio o multimodalidad.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de generacion de codigo ni matematicas como objetivo del modelo.

## Casos de uso

- Roleplay conversacional en local: el modelo esta etiquetado explicitamente para roleplay, por lo que puede emplearse en interfaces tipo chat para mantener conversaciones con personajes consistentes, ejecutandose con llama.cpp u Ollama en hardware de consumo.
- Escritura creativa asistida: generacion y continuacion de ficcion, con cuantizaciones Q5_K_M o Q6_K para preservar matices estilisticos en textos largos.
- Prototipado de narrativa interactiva: integracion en motores de aventuras conversacionales o videojuegos de texto, usando la variante Q4_K_M como equilibrio entre calidad y velocidad.
- Experimentacion con merges: al ser un modelo fusionado, sirve como caso de estudio para investigadores que comparan el comportamiento de merges frente a modelos entrenados de forma nativa.
- Despliegue en entornos con VRAM limitada: las variantes IQ2 e IQ3 permiten ejecutar un modelo de 31B en GPUs de 12-16 GB, algo imposible con los pesos originales en FP16.
- Evaluacion comparativa de tecnicas de cuantizacion: la disponibilidad de 23 variantes i1 permite medir el impacto de cada nivel de cuantizacion en la calidad de la prosa generada.
- Generacion de dialogos para pruebas de UX: util para crear corpus sinteticos de conversaciones en ingles para validar interfaces de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto, aproximada):
  - i1-IQ1_S (7,3 GB): unos 8-9 GB.
  - i1-IQ2_M (11,0 GB): unos 12-13 GB.
  - i1-IQ3_S (13,9 GB): unos 15-16 GB.
  - i1-Q4_K_M (18,8 GB): unos 20-21 GB.
  - i1-Q5_K_M (21,9 GB): unos 23-24 GB.
  - i1-Q6_K (25,3 GB): unos 27-28 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q6_K y contextos largos; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para IQ2 e IQ3.
- Cabe en GPU de consumo: si, desde IQ1_S en GPUs de 8-10 GB hasta Q6_K en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. No se recomienda vLLM ni TGI con estos pesos GGUF (requieren safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Eon-Blossom-V2-31B-i1-GGUF | 30,7B | no disponible | GGUF | Apache 2.0 | Merge orientado a roleplay, cuantizado con imatrix |
| Eon-Blossom-V2-31B (base) | 30,7B | no disponible | safetensors | Apache 2.0 | Pesos originales, requiere FP16/BF16 |
| Eon-Blossom-V2-31B-GGUF (estatico) | 30,7B | no disponible | GGUF | Apache 2.0 | Cuantizaciones estaticas del mismo autor |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos del modelo base; al estar entrenado principalmente en ingles, es probable que presente sesgos culturales anglosajones.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones.
- El modelo esta limitado al ingles segun la model card; el rendimiento en castellano no esta garantizado.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- Las cuantizaciones por debajo de Q3 (IQ1, IQ2, Q2_K_S) degradan notablemente la calidad segun las propias notas del autor ("for the desperate", "very low quality").
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge cuyos componentes originales no se detallan; conviene verificar las licencias de los modelos fusionados antes de un uso comercial.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados que requieran function calling.
- El repositorio tiene 0 likes y no hay pipeline declarado, lo que sugiere una validacion comunitaria escasa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Eon-Blossom-V2-31B-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Eon-Blossom-V2-31B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Eon-Blossom-V2-31B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Eon-Blossom-V2-31B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
