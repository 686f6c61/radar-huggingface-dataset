# mradermacher/Signal-3.8-27b-Heretic-ara-GGUF

## Resumen

Signal-3.8-27b-Heretic-ara-GGUF es una redistribución en formato GGUF del modelo Shockem/Signal-3.8-27b-Heretic-ara, publicada por mradermacher, un cuantizador conocido por convertir modelos abiertos a pesos GGUF listos para inferencia local. El modelo original cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y está etiquetado con la familia qwen3_5, además de las etiquetas abliteration, uncensored y conversational, lo que indica que se trata de una variante sometida a abliteración (eliminación de las direcciones de rechazo en el espacio de activaciones) para eliminar los mecanismos de negativa del modelo base.

El repositorio no contiene los pesos originales en safetensors, sino únicamente cuantizaciones estáticas en GGUF (desde Q2_K hasta Q8_0) más dos ficheros mmproj que actúan como suplemento multimodal, lo que sugiere soporte de entrada de imágenes en llama.cpp. El tamaño del repositorio es de 190,8 GB, la licencia declarada es Apache-2.0 y el único idioma declarado en la model card es el inglés.

La relevancia de esta ficha es acotada: el repositorio no presenta descargas ni likes en el momento de la consulta, no incluye resultados de benchmarks ni detalles de entrenamiento, y la model card se limita a la plantilla estándar de mradermacher. Se trata, por tanto, de un artefacto de interés para quien quiera ejecutar localmente una variante sin censura de un modelo de ~27B, no de un modelo con documentación técnica publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; la etiqueta del repositorio indica la familia qwen3_5 (transformer, sin confirmar) |
| Parámetros totales | 27.320.697.856 (≈27,3 B), dato real de safetensors |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0 (estáticas); existen cuantizaciones con imatrix en el repositorio i1-GGUF; los tags mencionan además IQ4_XS y x-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Ficheros multimodales | mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Tamaño del repositorio | 190,8 GB |
| Modelo base | Shockem/Signal-3.8-27b-Heretic-ara |
| Cuantizador | mradermacher |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF, DPO u otros) en la información disponible. Los únicos indicios son las etiquetas del repositorio: qwen3_5, que apunta a la familia Qwen3.5; abliteration, que implica una intervención post-entrenamiento sobre las direcciones de rechazo; y uncensored, que confirma el objetivo de esa intervención.

La innovación técnica destacable de este repositorio no está en el modelo en sí, sino en el trabajo de cuantización: se ofrecen cuantizaciones estáticas generadas por mradermacher con quantize_version 2 y output_tensor_quantised 1, y existe un repositorio paralelo (Signal-3.8-27b-Heretic-ara-i1-GGUF) con cuantizaciones ponderadas mediante imatrix, que suelen degradar menos la perplejidad en bits bajos. La presencia de ficheros mmproj sugiere que el modelo base incorpora una torre de visión que llama.cpp puede cargar por separado del modelo de lenguaje, aunque la model card no lo documenta explícitamente.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como conversational y la librería declarada es transformers.
- Modo sin censura (abliterated): se ha eliminado el mecanismo de rechazo del modelo base, por lo que responde a peticiones que un modelo alineado convencional declinaría.
- Entrada multimodal (imagen): inferida de la publicación de ficheros mmproj-Q8_0 y mmproj-f16; no confirmada por escrito en la model card.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el único idioma declarado es el inglés.
- Modo de razonamiento explícito (thinking mode): no documentado.
- Capacidades de audio: no documentadas.

## Casos de uso

- Investigación en alineación y red teaming: la variante abliterated permite estudiar qué comportamientos reaparecen cuando se eliminan las direcciones de rechazo, comparando sus respuestas con las del modelo base alineado en el mismo prompt.
- Asistente conversacional autoalojado en inglés: con la cuantización Q4_K_M (16,9 GB) puede desplegarse en una GPU de 24 GB y servir conversaciones multi-turno sin enviar datos a terceros.
- Generación creativa sin filtros editoriales: escritura de ficción, guiones o diálogos donde los filtros de contenido de los modelos alineados suelen truncar o reformular la salida.
- Análisis de documentación técnica con entrada de imágenes: si se carga el fichero mmproj junto al modelo, puede procesar capturas de pantalla, diagramas o documentos escaneados en un pipeline local de llama.cpp.
- Base para fine-tuning o destilación: al ser un modelo denso de ~27B con licencia Apache-2.0, puede servir como punto de partida para ajustes específicos de dominio, partiendo del repositorio en safetensors del modelo base.
- Prototipado de chatbots en hardware de gama alta de consumo: con Q2_K (11,0 GB) o Q3_K_M (13,6 GB) es posible ejecutar el modelo con offload parcial en GPUs de 12-16 GB para pruebas de concepto.
- Evaluación comparativa de cuantizaciones: el repositorio publica desde Q2_K hasta Q8_0, lo que permite medir empíricamente la pérdida de calidad por bit en una tarea concreta antes de elegir el formato definitivo.
- Despliegue en entornos con requisitos de privacidad estrictos: al ejecutarse íntegramente en local con llama.cpp u Ollama, es apto para procesar texto sensible sin conexión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado datos de evaluación en el modelo base.

## Requisitos de hardware

Tamaños de fichero publicados y VRAM aproximada estimada (pesos + caché KV para contexto moderado + overhead de runtime):

| Cuantización | Tamaño del fichero | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 11,0 GB | ≈12-13 GB |
| Q3_K_S | 12,4 GB | ≈13-14 GB |
| Q3_K_M | 13,6 GB | ≈14-16 GB |
| Q3_K_L | 14,7 GB | ≈15-17 GB |
| Q4_K_S | 15,9 GB | ≈17-18 GB |
| Q4_K_M | 16,9 GB | ≈18-20 GB |
| Q5_K_S | 19,1 GB | ≈20-22 GB |
| Q6_K | 22,5 GB | ≈24-26 GB |
| Q8_0 | 29,1 GB | ≈32-34 GB |
| mmproj (si se usa visión) | 0,7-1,0 GB | se suma al total |

- GPU recomendadas: A100 40 GB o 80 GB y H100 para Q8_0 con contexto largo; RTX 4090, RTX 3090 o RTX A6000 (24 GB) para Q4_K_M y Q5_K_S; 2× RTX 4090 (48 GB) para Q8_0 repartido.
- ¿Cabe en GPU de consumo? Sí. Q4_K_M (16,9 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado. Q6_K (22,5 GB) entra muy justo en 24 GB. En GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) hay que recurrir a Q3_K_M o Q2_K, posiblemente con offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, Jan, llama-cpp-python y text-generation-webui. vLLM y TGI no ofrecen soporte nativo y maduro de GGUF, por lo que no son la vía recomendada para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la información proporcionada. La comparación más directa posible es entre las tres variantes del mismo modelo:

| Variante | Formato | Tamaño / cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/Signal-3.8-27b-Heretic-ara-GGUF | GGUF estático | Q2_K a Q8_0, mmproj f16 y Q8_0 | apache-2.0 | 0 descargas, 0 likes |
| mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF | GGUF con imatrix | Cuantizaciones ponderadas | apache-2.0 | no disponible en los datos |
| Shockem/Signal-3.8-27b-Heretic-ara | safetensors (modelo base) | Pesos completos | apache-2.0 | no disponible en los datos |

Comparación con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de las direcciones de rechazo implica que puede generar contenido dañino, ilegal o inseguro sin ofrecer resistencia. No es adecuado para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo de alucinación: no documentado, pero inherente a cualquier modelo generativo; la ausencia de benchmarks impide cuantificarlo.
- Idiomas: la model card solo declara inglés. El rendimiento en castellano u otros idiomas no está verificado y podría degradarse notablemente.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S, con 11,0 GB y 12,4 GB respectivamente, degradan la calidad de forma apreciable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero la licencia del modelo base (Shockem/Signal-3.8-27b-Heretic-ara) debe verificarse por separado antes de un uso en producción.
- Trazabilidad: no hay información pública sobre el dataset de entrenamiento, los datos de alineación ni los responsables del modelo original, lo que dificulta evaluar sesgos y riesgos.
- Adopción: el repositorio registra 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Fecha de publicación: los metadatos indican 2026-09-15, posterior a la fecha de consulta de muchos entornos, lo que puede indicar un repositorio muy reciente o inconsistencias en los metadatos.
- Multimodalidad no confirmada: la capacidad de visión se infiere únicamente de la existencia de ficheros mmproj, sin documentación que la respalde.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-GGUF
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Signal-3.8-27b-Heretic-ara-i1-GGUF
- Modelo base: https://huggingface.co/Shockem/Signal-3.8-27b-Heretic-ara
- Página resumen de cuantizaciones del autor: https://hf.tst.eu/model#Signal-3.8-27b-Heretic-ara-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

Nota: la búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos versaban sobre aplicaciones de mensajería y no guardan relación con el contenido de esta ficha.
