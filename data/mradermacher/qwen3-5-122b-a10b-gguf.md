# mradermacher/Qwen3.5-122B-A10B-GGUF

## Resumen

mradermacher/Qwen3.5-122B-A10B-GGUF es un repositorio de cuantizaciones GGUF del modelo base Qwen/Qwen3.5-122B-A10B, publicado por el usuario mradermacher (nethype GmbH). No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF de los pesos originales, pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) en lugar de con GPUs de datacenter y frameworks de serving tradicionales. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 122.111.526.912 parámetros totales en safetensors.

El interés práctico del repositorio está en la batería de cuantizaciones ofrecida: desde Q2_K (44,7 GB) hasta Q8_0 (130,0 GB), pasando por las recomendadas Q4_K_S y Q4_K_M (69,7 GB y 74,3 GB), más el conjunto IQ4_XS (66,1 GB). Esto permite ejecutar un modelo de 122B en hardware muy por debajo del que exigiría la versión en precisión completa (el repositorio ocupa 832,0 GB en total, incluyendo todas las variantes). Se incluyen además dos ficheros mmproj (multi-modal supplement) en Q8_0 y f16, lo que indica soporte multimodal en el modelo base.

El modelo se distribuye bajo licencia Apache 2.0 y declara únicamente el idioma inglés. El repositorio acumula 2.070 descargas y 1 like, con fecha de creación 2026-02-25 y última actualización 2026-10-16. Existe una versión alternativa con cuantizaciones ponderadas/imatrix en mradermacher/Qwen3.5-122B-A10B-i1-GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; inferida de la nomenclatura del modelo base, no detallada en la model card |
| Parametros totales | 122.111.526.912 (122,1 mil millones) |
| Parametros activos | Aproximadamente 10 mil millones segun la nomenclatura "A10B" del nombre; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes imatrix en repositorio aparte |
| Idiomas soportados | en (ingles) segun los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multi-parte en las cuantizaciones de mayor tamano); mmproj en GGUF |

## Arquitectura y entrenamiento

La model card del repositorio no documenta la arquitectura ni el proceso de entrenamiento del modelo base; se limita a indicar que se trata de cuantizaciones estáticas de Qwen/Qwen3.5-122B-A10B (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). Lo que sí es deducible de los datos disponibles es que el modelo base emplea una arquitectura MoE, dado el sufijo "A10B" (parámetros activos) frente a los 122,1 mil millones de parámetros totales. El repositorio incluye además dos ficheros mmproj (Q8_0, 0,7 GB y f16, 1,0 GB), etiquetados como "multi-modal supplement", lo que implica que el modelo base incorpora una torre de visión o similar, aunque sus características concretas no están descritas.

En cuanto al proceso de cuantización, mradermacher aplica cuantizaciones estáticas (no ponderadas por importancia) sobre los pesos convertidos desde HuggingFace. Las variantes con calibración imatrix se publican en un repositorio separado. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por fases de RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta "conversational" y el modelo base es de la familia Qwen, orientada a dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidad esperable del modelo base, aunque no documentada explicitamente en la model card de esta cuantizacion.
- Capacidades multimodales: la presencia de ficheros mmproj (multi-modal supplement) indica soporte de entrada de imagenes cuando se usa con versiones de llama.cpp compatibles con mmproj.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado en la informacion proporcionada).
- Capacidades multilingues: el repositorio declara unicamente "en"; no se documenta soporte de otros idiomas en esta ficha.
- Modo "thinking": no disponible (no documentado en la informacion proporcionada).
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible".

## Casos de uso

- Despliegue local en estaciones de trabajo con multiples GPUs: las cuantizaciones Q4_K_S y Q4_K_M (69,7 GB y 74,3 GB) permiten ejecutar un MoE de 122B en configuraciones de 2x48 GB o una GPU de 80 GB, algo imposible con los pesos en precision completa.
- Prototipado e investigacion en entornos sin acceso a clústeres: la variante Q2_K (44,7 GB) reduce el requisito de memoria hasta el punto de ser viable en 2x RTX 4090 (48 GB) o en configuraciones con offload parcial a CPU, a costa de una perdida de calidad perceptible.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro completo de cuantizaciones del mismo modelo base, lo que permite medir el impacto de la precision en tareas concretas antes de fijar una configuracion de produccion.
- Procesamiento multimodal en local: los ficheros mmproj-Q8_0 y mmproj-f16 habilitan tareas de descripcion de imagenes, OCR o respuesta a preguntas sobre documentos escaneados usando llama.cpp con soporte multimodal.
- Generacion de codigo asistida en un IDE o pipeline interno: usando la cuantizacion Q5_K_M (87,1 GB) o Q6_K (100,4 GB) para maximizar la fidelidad de los pesos en tareas de programacion, siempre que el hardware lo permita.
- Servicio de inferencia autoalojado con Ollama o llama-cpp-python: el formato GGUF es directamente consumible por estas herramientas, lo que simplifica el despliegue en infraestructura propia sin necesidad de convertir pesos.
- Destilacion o generacion de datos sinteticos: un modelo de 122B con 10B activos resulta adecuado para generar grandes volumenes de datos etiquetados a un coste de computo menor que un modelo denso equivalente en parametros totales.
- Analisis de documentos largos en ingles: si el modelo base dispone de una ventana de contexto amplia (no confirmada en esta informacion), las cuantizaciones Q4 o superiores permiten procesar lotes de documentacion tecnica en pipelines por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web obtenidos no guardan relacion con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano de fichero mas cache KV y overhead, orientativo):
  - Q2_K: 44,7 GB
  - Q3_K_S: 53,0 GB
  - Q3_K_M: 58,7 GB
  - Q3_K_L: 63,3 GB
  - IQ4_XS: 66,1 GB
  - Q4_K_S: 69,7 GB
  - Q4_K_M: 74,3 GB
  - Q5_K_S: 84,3 GB
  - Q5_K_M: 87,1 GB
  - Q6_K: 100,4 GB
  - Q8_0: 130,0 GB
  - mmproj-Q8_0: 0,7 GB (adicional, solo para entrada multimodal)
  - mmproj-f16: 1,0 GB (adicional, solo para entrada multimodal)
- GPU recomendadas: H100 80 GB para Q4_K_M en una sola tarjeta; 2x H100 80 GB o 2x A100 80 GB para Q6_K y Q8_0; 2x RTX 6000 Ada 48 GB o 2x RTX 4090 24 GB para Q2_K y Q3_K_S con margen limitado.
- Cabe en consumer GPU: ninguna cuantizacion cabe en una unica RTX 4090 (24 GB). La opcion mas ligera (Q2_K, 44,7 GB) requiere al menos dos GPU de 24 GB o bien offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp. Para serving de alto rendimiento con GGUF, vLLM ofrece soporte experimental; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con aproximadamente 10B parametros activos (segun nomenclatura), el throughput esperado por token es notablemente superior al de un modelo denso de 122B, pero no se aportan mediciones en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos dentro de la informacion proporcionada, por lo que no es posible una comparativa de rendimiento contra otras familias. Si puede compararse el propio repositorio con sus variantes internas:

| Variante | Formato | Tamano | Notas |
|---|---|---|---|
| Qwen3.5-122B-A10B-GGUF (este repo) | GGUF estatico | 44,7-130,0 GB | Cuantizacion estatica, quantize_version 2 |
| Qwen3.5-122B-A10B-i1-GGUF | GGUF imatrix | no disponible | Cuantizaciones ponderadas por importancia, repositorio separado de mradermacher |
| Qwen/Qwen3.5-122B-A10B | safetensors | 832,0 GB (repo completo) | Modelo base sin cuantizar, requiere transformadores y VRAM muy superior |

Comparativa con otras familias de modelos del mismo rango de parametros: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se aportan evaluaciones de fidelidad factual para este modelo.
- Limitaciones de contexto e idioma: el repositorio declara unicamente ingles ("en"). No hay informacion sobre la longitud de contexto soportada, lo que impide planificar despliegues que dependan de ventanas largas.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S, aunque ejecutables en hardware modesto, degradan la perplejidad de forma apreciable. La propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opciones rapidas, y Q6_K como "very good quality".
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. El fichero LICENSE enlazado apunta al repositorio del modelo base.
- Dependencia del modelo base: cualquier limitacion del modelo Qwen/Qwen3.5-122B-A10B (alineamiento, restricciones de uso, sesgos) se hereda en estas cuantizaciones.
- Advertencia sobre ficheros multi-parte: las cuantizaciones de mayor tamano se distribuyen en varios ficheros GGUF que deben concatenarse o cargarse conjuntamente; un manejo incorrecto provoca fallos de carga.
- Requisitos de memoria agregada: incluso la cuantizacion mas ligera (44,7 GB) excede la VRAM de cualquier GPU de consumo individual, por lo que el despliegue real exige multi-GPU u offload a memoria del sistema, con la penalizacion de latencia correspondiente.
- Verificacion de integridad: al ser un repositorio de terceros, conviene validar los pesos frente al modelo base antes de usarlos en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.5-122B-A10B-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
