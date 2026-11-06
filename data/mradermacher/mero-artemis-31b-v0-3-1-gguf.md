# mradermacher/Mero-Artemis-31B-v0.3.1-GGUF

## Resumen

Mero-Artemis-31B-v0.3.1-GGUF es la distribucion en formato GGUF del modelo Mero-Artemis-31B-v0.3.1, un merge de modelos creado por sophosympatheia y cuantizado por mradermacher. Con 30.697.345.596 parametros (aproximadamente 30,7 mil millones), se trata de un modelo conversacional en ingles construido mediante mergekit, lo que lo situa en la categoria de modelos densos de gran tamano orientados a generacion de texto y dialogo. La relevancia de esta publicacion radica en que ofrece el modelo original en multiples niveles de cuantizacion GGUF, desde Q2_K hasta Q8_0, permitiendo su despliegue en hardware de consumo que no podria ejecutar los pesos completos.

El repositorio incluye ademas ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal en el modelo subyacente, presumiblemente vision. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque la model card incluye la etiqueta "not-for-all-audiences", una advertencia que conviene tener en cuenta en entornos productivos. El modelo esta etiquetado exclusivamente para ingles y no se dispone de informacion sobre la longitud de contexto en la informacion proporcionada.

Al tratarse de un merge sin model card tecnica detallada en esta distribucion, muchos datos de arquitectura, entrenamiento y benchmarks no estan disponibles. Esta ficha recoge unicamente lo que puede verificarse a partir de los metadatos y la informacion del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (merge de transformers; presumiblemente decoder-only transformer) |
| Parametros totales | 30.697.345.596 (aprox. 30,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los metadatos indican que se trata de un merge construido con mergekit a partir de sophosympatheia/Mero-Artemis-31B-v0.3.1, y el recuento de parametros (30,7 B) es coherente con un transformer decoder-only denso de aproximadamente 31 mil millones de parametros. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea alguna variante como GQA o atencion lineal.

Tampoco se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Al ser un merge, su comportamiento deriva de la combinacion de los modelos originales que lo componen, pero esos detalles no se recogen en la model card de esta distribucion. La presencia de ficheros mmproj sugiere que el modelo subyacente incorpora un proyector multimodal para vision, aunque no se confirma en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Posible soporte multimodal (vision) inferido de la presencia de ficheros mmproj Q8_0 y f16, aunque no confirmado explicitamente en la model card.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Uso mediante la libreria transformers y mediante llama.cpp/Ollama al estar en formato GGUF.
- No se dispone de informacion sobre tool calling, function calling, razonamiento multi-paso, modo thinking ni capacidades especiales adicionales.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (18,8 GB) y Q5_K_M (21,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede emplearse para construir chatbots de proposito general en entornos de desarrollo, con la advertencia de la etiqueta "not-for-all-audiences".
- Experimentacion con modelos mergeados: investigadores interesados en el efecto de las tecnicas de mergekit pueden comparar el comportamiento de este modelo frente a sus componentes originales.
- Evaluacion de cuantizaciones: el repositorio ofrece once niveles de cuantizacion distintos, lo que permite estudiar el compromiso entre tamano, velocidad y calidad en un modelo de 30,7 B.
- Inferencia en CPU o entornos con poca VRAM: las cuantizaciones Q2_K (12,0 GB) y Q3_K_S (13,9 GB) posibilitan ejecucion en equipos sin GPU dedicada de gama alta, a costa de menor calidad.
- Pruebas de pipelines multimodales: si se confirma el soporte de vision, los ficheros mmproj permiten experimentar con entrada de imagenes en llama.cpp, aunque esta capacidad no esta documentada en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero, sin contar overhead de contexto):
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
  - mmproj: 0,9 GB (Q8_0) o 1,3 GB (f16)
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o A100/H100 con 40-80 GB. Para Q8_0 se requiere una GPU de 40 GB o superior (A100 40 GB, H100).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base puede cargarse con transformers. No se confirma soporte de vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mero-Artemis-31B-v0.3.1-GGUF | 30,7 B | no disponible | apache-2.0 | GGUF | Merge conversacional, solo ingles |
| sophosympatheia/Mero-Artemis-31B-v0.3.1 | 30,7 B | no disponible | apache-2.0 | safetensors | Modelo base original |
| mradermacher/Mero-Artemis-31B-v0.3.1-i1-GGUF | 30,7 B | no disponible | apache-2.0 | GGUF (imatrix) | Variante con cuantizaciones ponderadas |

No se dispone de informacion sobre modelos de terceros comparables en rendimiento para esta categoria.

## Limitaciones y advertencias

- La etiqueta "not-for-all-audiences" indica que el modelo puede generar contenido no apto para todos los publicos; debe filtrarse en produccion.
- Solo soporta ingles segun los metadatos; el rendimiento en otros idiomas no esta garantizado.
- Al ser un merge sin benchmarks publicados, no hay evidencia cuantitativa de su calidad frente a modelos base de tamano similar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- La longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- El soporte multimodal (mmproj) no esta confirmado en la model card; validar antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos componentes del merge, no disponibles en esta informacion.
- El repositorio ocupa 213,9 GB, lo que exige planificar el almacenamiento si se descargan varias cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mero-Artemis-31B-v0.3.1-GGUF
- Modelo base: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Mero-Artemis-31B-v0.3.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Mero-Artemis-31B-v0.3.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
