# mradermacher/lg-decision-4B-GGUF

## Resumen

lg-decision-4B-GGUF es la version cuantizada en formato GGUF del modelo SunZhengda/lg-decision-4B, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir cuantizaciones estaticas de modelos abiertos. El modelo base es un transformer de aproximadamente 4.841 millones de parametros (4,84B) orientado a la toma de decisiones estructuradas, segun indican las etiquetas de la model card: decision-model, typed-decisions y decision-index. La licencia del modelo base y de esta cuantizacion es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El repositorio contiene 11 variantes de cuantizacion GGUF estaticas, desde Q2_K (2,3 GB) hasta f16 (9,8 GB), pensadas para ejecucion local con llama.cpp y derivados. No se dispone de informacion sobre el pipeline, los idiomas soportados ni los datos de entrenamiento del modelo base en la informacion proporcionada, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 4,8B parametros especializado en decisiones tipadas en hardware de consumo, algo poco habitual en modelos de proposito general de este tamano. El repositorio acumula 858 descargas desde su publicacion en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (no se detalla variante en la informacion disponible) |
| Parametros totales | 4.841.450.496 (4,84B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base SunZhengda/lg-decision-4B mas alla de que se trata de un transformer de 4,84B parametros. Las etiquetas de la model card apuntan a un modelo especializado en "decisiones tipadas" (typed-decisions) y "decision-index", lo que sugiere un entrenamiento orientado a producir salidas estructuradas de decision en lugar de texto libre generico. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

El proceso de cuantizacion realizado por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye cuantizaciones ponderadas con imatrix, segun indica el propio autor. Esto implica que las variantes IQ4_XS y el resto de cuantizaciones K-quant se generaron sin matriz de importancia, lo que puede afectar ligeramente la calidad frente a cuantizaciones imatrix equivalentes.

## Capacidades

- Generacion de texto conversacional (etiqueta conversational en la model card).
- Toma de decisiones estructuradas y tipadas, segun las etiquetas decision-model y typed-decisions.
- Produccion de indices de decision (decision-index), presumiblemente para clasificar o priorizar opciones.
- Soporte multilingue limitado al ingles segun la model card.
- No se dispone de informacion sobre tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Clasificacion de decisiones en pipelines de negocio: el modelo puede recibir un conjunto de opciones y devolver una decision tipada, adecuado por su entrenamiento especifico en decisiones estructuradas.
- Enrutamiento de tickets o solicitudes: usar el modelo para decidir a que cola, equipo o categoria asignar una entrada, con salida estructurada en lugar de texto libre.
- Priorizacion de alertas: dado un conjunto de incidencias, el modelo puede emitir una decision de prioridad o severidad aprovechando su orientacion a decisiones tipadas.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S y Q4_K_M (3,0-3,2 GB) caben en GPUs de consumo de 8 GB, permitiendo ejecutar el modelo sin infraestructura en la nube.
- Prototipado rapido de sistemas de decision: al ser un modelo de 4,84B con licencia Apache 2.0, se puede integrar en pruebas de concepto sin coste de licencia.
- Servicio de bajo coste en CPU: las variantes Q2_K y Q3_K_S (2,3-2,4 GB) permiten inferencia en CPU con llama.cpp para cargas de decision de baja latencia y volumen moderado.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes para medir el impacto de la cuantizacion en la calidad de las decisiones emitidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB (Q2_K), 3,0-3,2 GB (Q4_K_S/Q4_K_M), 4,1 GB (Q6_K), 5,3 GB (Q8_0) y 9,8 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU con 6-8 GB o mas puede ejecutar las cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para Q4_K_M y Q5_K_M; las variantes Q2 y Q3 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp y derivados (formato GGUF); Ollama y otros runners compatibles con GGUF no se confirman en la informacion disponible. vLLM y TGI no se mencionan para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especializados en decisiones tipadas de tamano similar en la informacion proporcionada. La comparativa con alternativas de proposito general de 4-5B parametros (por ejemplo, modelos tipo Llama 3.2 3B o Qwen2.5 4B) no puede establecerse con datos de rendimiento porque no se han publicado benchmarks de lg-decision-4B.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| lg-decision-4B | 4,84B | no disponible | apache-2.0 | safetensors, GGUF |
| Alternativas de proposito general 4-5B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles; el uso en castellano no esta garantizado.
- Contexto: no se dispone de la longitud de contexto, lo que impide planificar cargas de conversacion larga.
- Alucinacion: no hay informacion sobre evaluaciones de fiabilidad; al ser un modelo especializado en decisiones, conviene validar las salidas estructuradas en produccion.
- Cuantizacion estatica sin imatrix: las variantes IQ4_XS y K-quant pueden presentar perdida de calidad frente a cuantizaciones ponderadas; el autor indica que no planea publicarlas salvo peticion.
- Q3_K_M marcada como "lower quality" por el propio autor; evitar en produccion.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales del modelo base mas alla de la licencia declarada.
- Sesgos: no disponible informacion sobre sesgos conocidos.
- Modelo base poco documentado: la ausencia de datos de entrenamiento y benchmarks limita la evaluacion rigurosa antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lg-decision-4B-GGUF
- Modelo base: https://huggingface.co/SunZhengda/lg-decision-4B
- Pagina de descargas del autor: https://hf.tst.eu/model#lg-decision-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
