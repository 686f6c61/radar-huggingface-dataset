# mradermacher/gpt-oss-20b-3MPER0RR-abliterated-GGUF

## Resumen

mradermacher/gpt-oss-20b-3MPER0RR-abliterated-GGUF es una recuantizacion a formato GGUF de un modelo derivado de gpt-oss-20b, la familia de pesos abiertos publicada por OpenAI. Sobre el modelo base (3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated) se ha aplicado una tecnica de "abliteration": una modificacion de pesos que elimina la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder ante determinadas peticiones. El resultado se ha convertido a GGUF mediante llama.cpp para su uso en inferencia local.

El modelo cuenta con 20.914.757.184 parametros (aproximadamente 20,9 mil millones) segun los pesos safetensors del repositorio, y hereda la arquitectura de mezcla de expertos (MoE) de gpt-oss-20b. El autor de la cuantizacion es mradermacher, un publicador habitual de versiones GGUF, y la ficha se marca explicitamente como "experimental" y "multi-round". La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles (en).

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~21B en hardware de consumo gracias a las cuantizaciones de 12 a 22 GB; por otro, documenta un caso de modelo sin alineamiento de seguridad, lo que obliga a extremar las precauciones en cualquier despliegue en produccion. No se han publicado resultados de benchmarks ni detalles completos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de la familia gpt-oss-20b |
| Parametros totales | 20.914.757.184 (aprox. 20,9 B) segun safetensors |
| Parametros activos | no disponible en la ficha (la familia gpt-oss-20b declara del orden de 3,6 B activos; no confirmado para este derivado) |
| Longitud de contexto | no disponible en la ficha (la familia gpt-oss-20b declara 131 072 tokens; no confirmado tras la abliteracion ni la cuantizacion) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; variantes con imatrix en repo aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base dispone de safetensors); repo de 170,3 GB en total |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia gpt-oss-20b de OpenAI, un transformer con capas de mezcla de expertos (MoE) en las que solo se activa una fraccion de los parametros por token. Sobre esa base, 3MPER0RR aplica abliteration, una tecnica que calcula la direccion latente asociada al rechazo de peticiones y ortogonaliza los pesos frente a ella, de forma que el modelo pierde el comportamiento de negativa. La etiqueta "multi-round" sugiere que el proceso de abliteracion se aplico de forma iterativa, aunque la ficha no detalla el procedimiento exacto.

mradermacher ha realizado la conversion a GGUF con llama.cpp y ha generado cuantizaciones estaticas (no imatrix) en este repositorio; las variantes ponderadas con matriz de importancia estan en un repositorio independiente. La ficha no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO posteriores a la abliteracion. Tampoco se detalla si la abliteracion se aplico antes o despues de cualquier ajuste conversacional.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con soporte declarado de la etiqueta "conversational".
- Razonamiento y generacion de codigo, heredados de la familia gpt-oss-20b (no verificados en esta ficha).
- Soporte de tool calling / function calling: atribuible a la base gpt-oss, no confirmado tras la abliteracion ni la cuantizacion.
- Capacidad de agente y razonamiento multi-paso: no confirmada en la informacion disponible.
- Capacidades multilingues: limitadas al ingles declarado; el resto de idiomas no estan soportados oficialmente.
- Capacidad especial: ausencia de rechazo por alineamiento (comportamiento abliterated), que es precisamente el objetivo del ajuste.
- Vision y audio: no disponibles.

## Casos de uso

- Prototipado de agentes conversacionales en local: al ser un MoE de ~21B cuantizado a partir de 12 GB, permite iterar sobre prompts y flujos multi-turno en una estacion de trabajo sin depender de APIs externas.
- Generacion de codigo en entornos aislados: puede integrarse en asistentes de editor o scripts de automatizacion que corren en maquinas sin salida a internet, siempre que se asuma la ausencia de garantias de calidad medidas.
- Investigacion sobre alineamiento y seguridad: es un caso de estudio util para analizar como la abliteration degrada o modifica los rechazos, y para medir el impacto en tareas de razonamiento.
- Red teaming y evaluacion de robustez: sirve como modelo "sin filtros" de referencia frente al que comparar versiones alineadas del mismo modelo.
- Experimentos de destilacion o generacion de datos sinteticos: por su tamano moderado y su licencia permisiva, puede emplearse para producir corpus de texto en un pipeline controlado.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q2_K a Q8_0, es viable en GPUs de 12 a 24 GB para demostraciones, docencia o pruebas internas.
- Traduccion y resumen en ingles: dentro de su unico idioma declarado, puede emplearse en tareas de condensacion de documentos largos si se confirma su contexto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia segun cuantizacion (tamano de archivo, sin contar cache KV ni overhead):
  - Q2_K / Q3_K_S: 12,2 GB
  - Q3_K_M: 13,0 GB; Q3_K_L: 13,4 GB
  - Q4_K_S: 14,8 GB; Q4_K_M: 15,9 GB
  - Q5_K_S: 16,0 GB; Q5_K_M: 17,0 GB
  - Q6_K: 22,3 GB; Q8_0: 22,4 GB
- Anadir aproximadamente 2-4 GB adicionales de VRAM para cache KV y overhead del runtime, mas si se amplia el contexto.
- GPU recomendadas:
  - 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000): Q2_K a Q4_K_M completas.
  - 24 GB (RTX 3090, RTX 4090, A5000, L4 24 GB): Q5_K_S, Q5_K_M y, con offload parcial, Q6_K y Q8_0.
  - A100 40/80 GB o H100: todas las cuantizaciones con contexto amplio y mayor lote.
- En GPU de consumo de 12 GB (RTX 3060 12 GB) solo caben Q2_K o Q3_K_S con contexto reducido u offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con endpoints GGUF; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput estimados: no disponible; la ficha no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 20,9 B | no disponible | GGUF | apache-2.0 | Abliterated, cuantizado por mradermacher, experimental |
| 3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated | 20,9 B | no disponible | safetensors | apache-2.0 | Base sin cuantizar; maxima fidelidad y mayor requisito de VRAM |
| mradermacher/gpt-oss-20b-3MPER0RR-abliterated-i1-GGUF | 20,9 B | no disponible | GGUF | apache-2.0 | Cuantizaciones ponderadas con imatrix; calidad potencialmente superior a igual tamano |
| gpt-oss-20b (original de OpenAI) | familia ~21 B | 131 072 tokens (segun la familia) | safetensors | apache-2.0 | Version alineada, con rechazos y sin abliterar |

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido danino, ilegal o sesgado sin las salvaguardas habituales. No es apto para uso publico sin moderacion externa.
- La abliteration puede degradar capacidades de razonamiento, coherencia y tool calling; la ficha se etiqueta como "experimental" y no aporta validacion.
- Riesgo alto de alucinacion y de afirmaciones sin fundamento; no hay benchmarks que cuantifiquen su fiabilidad.
- Soporte unicamente en ingles; cualquier uso en castellano queda fuera de la cobertura declarada.
- La longitud de contexto efectiva no esta confirmada para este derivado; conviene validarla empiricamente antes de disenar flujos largos.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad legal ni etica sobre las salidas del modelo.
- Repositorio con 0 descargas y 0 likes en el momento del analisis: no existe validacion de la comunidad ni metricas de calidad publicadas.
- Repositorio de 170,3 GB: la descarga completa es costosa; se recomienda bajar solo la cuantizacion necesaria.
- Sin pipeline declarado en la ficha, lo que dificulta la integracion automatica en algunos frameworks.

## Enlaces

- [mradermacher/gpt-oss-20b-3MPER0RR-abliterated-GGUF](https://huggingface.co/mradermacher/gpt-oss-20b-3MPER0RR-abliterated-GGUF)
- [Modelo base sin cuantizar: 3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated](https://huggingface.co/3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated)
- [Cuantizaciones con imatrix: mradermacher/gpt-oss-20b-3MPER0RR-abliterated-i1-GGUF](https://huggingface.co/mradermacher/gpt-oss-20b-3MPER0RR-abliterated-i1-GGUF)
- [Pagina de resumen y descargas de mradermacher](https://hf.tst.eu/model#gpt-oss-20b-3MPER0RR-abliterated-GGUF)
- [Preguntas frecuentes y peticiones de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guia de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Grafica comparativa de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [nethype GmbH](https://www.nethype.de/)

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo, la abliteration ni la familia gpt-oss; los unicos enlaces recuperados pertenecian a un sitio de anuncios clasificados sin relacion con el tema.
