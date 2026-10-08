# mradermacher/Embed-RL-2B-GGUF

## Resumen

Embed-RL-2B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo ZoengHouNaam/Embed-RL-2B, publicada por mradermacher, un autor conocido por distribuir versiones cuantizadas de modelos abiertos a traves de su infraestructura de nethype GmbH. El repositorio no entrena ni modifica el modelo original: se limita a convertir los pesos del checkpoint base a distintos niveles de precision para su uso con llama.cpp y otros runners compatibles con GGUF.

El checkpoint base declara 1.720.574.976 parametros (aproximadamente 1,72 mil millones), aunque el identificador comercial del modelo lo etiqueta como "2B". La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El repositorio ocupa 17,2 GB en total, suma de las 13 variantes de cuantizacion mas dos ficheros mmproj (proyeccion multimodal) que se incluyen como suplemento.

La relevancia de esta ficha es fundamentalmente practica: permite desplegar un modelo de 1,72B en hardware de consumo con un peso de entre 0,9 GB y 3,5 GB segun la cuantizacion. La model card del repositorio cuantizado no documenta la arquitectura, el contexto, los datos de entrenamiento ni los benchmarks del modelo original, por lo que buena parte de los apartados siguientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card) |
| Parametros totales | 1.720.574.976 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; adicionalmente mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base en la documentacion proporcionada. El repositorio es una conversion estatica de pesos ("static quants of https://huggingface.co/ZoengHouNaam/Embed-RL-2B"), con metadatos internos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde un checkpoint de HuggingFace con tensores cuantizados en la salida. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La presencia de "RL" en el nombre del modelo base y de "Embed" en el identificador sugiere un modelo orientado a representaciones vectoriales entrenado con algun esquema de refuerzo, pero esto no se confirma en la informacion disponible.

El unico elemento estructural observable mas alla de los pesos de lenguaje son los dos ficheros mmproj (multi-modal supplement) en precision Q8_0 (0,5 GB) y f16 (0,9 GB), que en el ecosistema GGUF se utilizan para acompanar un proyector multimodal a un modelo de lenguaje. No se documenta que modalidad cubre ese proyector ni como se combina con el modelo base. Tampoco se ofrecen cuantizaciones ponderadas con imatrix: el autor indica explicitamente que estas no estaban disponibles en el momento de la publicacion y que pueden solicitarse mediante una discusion en la comunidad.

## Capacidades

- No hay capacidades documentadas en la model card del repositorio cuantizado. La informacion disponible se limita a metadatos de conversion.
- Idioma: unicamente ingles (`language: en`).
- El repositorio incluye ficheros mmproj (proyector multimodal) en Q8_0 y f16, lo que indica soporte previsto para entrada multimodal en el modelo base, sin especificar la modalidad.
- El nombre del modelo base (Embed-RL-2B) apunta a un uso como modelo de embeddings, pero no se documenta en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, modo de razonamiento explicito (thinking mode) ni capacidades de audio.
- No se documentan capacidades de generacion de codigo, matematicas o razonamiento multi-paso.

## Casos de uso

Los siguientes escenarios se plantean de forma condicional, dado que la model card del repositorio no documenta el proposito del modelo. Se basan en el tamano, el formato y los metadatos disponibles.

- Generacion de embeddings en local para busqueda semantica: con cuantizaciones de 1,2 GB (Q4_K_M) el modelo puede ejecutarse en CPU o en GPUs de gama baja, lo que permite indexar corpus de documentacion sin enviar datos a servicios externos. Requiere verificar previamente que el checkpoint base expone una cabeza de embeddings utilizable.
- Clasificacion y clustering de textos cortos: el tamano de 1,72B permite procesar lotes grandes en una sola GPU consumer, con un coste por inferencia bajo comparado con modelos de 7B o 13B.
- Filtrado de datos en pipelines de entrenamiento: uso como modelo auxiliar para puntuar o deduplicar grandes volumenes de texto, donde priman el throughput y el coste por token mas que la calidad generativa.
- Sistemas de recuperacion aumentada (RAG) en entornos con restricciones de hardware: el peso de la cuantizacion Q4_K_S (1,2 GB) permite convivir con el modelo generador en la misma GPU, reduciendo la necesidad de un segundo dispositivo.
- Despliegue en el borde o en entornos embebidos: la variante Q2_K ocupa 0,9 GB y la Q3_K_S 1,0 GB, viables en dispositivos con poca memoria o en instancias CPU-only de bajo coste.
- Experimentacion e integracion en llama.cpp: al ser un GGUF estandar, permite probar rapidamente el modelo con `llama.cpp`, Ollama o LM Studio sin necesidad de convertir pesos ni gestionar entornos de PyTorch.
- Evaluacion comparativa de precision por cuantizacion: el repositorio ofrece 12 niveles de cuantizacion distintos del mismo checkpoint, lo que facilita medir la degradacion de calidad frente al coste de memoria en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MTEB ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia (peso del modelo, sin contar cache KV): Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; Q3_K_M ~1,0 GB; Q3_K_L ~1,1 GB; IQ4_XS ~1,1 GB; Q4_K_S ~1,2 GB; Q4_K_M ~1,2 GB; Q5_K_S ~1,3 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB.
- Si se utiliza el proyector multimodal, anadir 0,5 GB (mmproj-Q8_0) o 0,9 GB (mmproj-f16).
- Con overhead de contexto y runtime, una estimacion prudente es de 2 GB de VRAM para Q4_K_M y de 3 GB para Q8_0. La longitud de contexto es desconocida, por lo que el consumo de la cache KV no puede calcularse.
- Cabe en practicamente cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3090, RTX 4090, e incluso GPUs de 4-6 GB como GTX 1650 o RTX 3050 en cuantizaciones Q4. Tambien es viable en modo CPU-only con 4-8 GB de RAM.
- GPU de datacenter (A100, H100) no son necesarias para el uso individual del modelo; solo tendrian sentido para servir lotes muy grandes en paralelo.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF, con flag `--embedding` si se usa como modelo de representaciones), Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. vLLM o TGI requeririan los pesos en safetensors del modelo base, no los ficheros GGUF de este repositorio.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Embed-RL-2B-GGUF | 1,72B | no disponible | GGUF (12 cuantizaciones + 2 mmproj) | apache-2.0 | HuggingFace, 174 descargas |
| ZoengHouNaam/Embed-RL-2B (modelo base) | 1,72B | no disponible | safetensors | apache-2.0 | HuggingFace |
| Otras cuantizaciones GGUF de modelos de ~2B | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en el material proporcionado, ni de datos de rendimiento que permitan una comparacion cuantitativa. La unica comparacion posible con datos reales es frente al checkpoint base sin cuantizar, del que este repositorio es una conversion directa.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, datos de entrenamiento ni evaluaciones; cualquier decision de produccion deberia ir precedida de una validacion propia.
- Sesgos conocidos: no disponibles. Al no documentarse la composicion del corpus de entrenamiento, no puede evaluarse el sesgo demografico, cultural o linguistica.
- Riesgo de alucinacion: no disponible. Si el modelo base es un modelo de representaciones (embeddings), este riesgo se manifiesta como similitudes espurias en lugar de texto inventado, pero no esta confirmado.
- Idioma: solo se declara ingles. No hay soporte multilingue documentado, por lo que el uso en castellano no esta garantizado.
- Cuantizaciones de baja precision: Q2_K, Q3_K_S y Q3_K_M degradan la calidad de forma apreciable. El propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas o Q8_0 como mejor calidad.
- Las cuantizaciones ponderadas con imatrix no estan disponibles; el autor sugiere solicitarlas mediante una discusion en la comunidad si se necesitan.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de copyright y licencia. Conviene verificar la licencia del checkpoint base, que es la misma segun los metadatos.
- El repositorio tiene 174 descargas y 0 likes, lo que indica una adopcion muy baja y poca validacion por parte de la comunidad.
- La fecha de creacion registrada (2026-02-16) y la de ultima actualizacion (2026-10-07) son posteriores a la fecha habitual de publicacion; conviene comprobar la vigencia del repositorio antes de integrarlo.
- Los ficheros mmproj indican una componente multimodal no documentada; su funcionamiento conjunto con el modelo no esta descrito.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Embed-RL-2B-GGUF
- Modelo base: https://huggingface.co/ZoengHouNaam/Embed-RL-2B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Embed-RL-2B-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
