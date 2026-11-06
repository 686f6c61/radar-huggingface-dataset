# mradermacher/persona_eta_20b_s926-GGUF

## Resumen

persona_eta_20b_s926 es un modelo de lenguaje de aproximadamente 20.900 millones de parametros, publicado por el usuario eousphoros en Hugging Face bajo el identificador `eousphoros/persona_eta_20b_s926`. La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF realizada por mradermacher, un conocido creador de cuantizaciones de la comunidad. El modelo esta etiquetado como conversacional y orientado a ingles, y se distribuye exclusivamente en formato GGUF para su uso con runtimes de inferencia local como llama.cpp.

La informacion publica disponible es muy limitada: la model card del repositorio GGUF no incluye detalles sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks. Solo se confirma el modelo base, el numero de parametros reales (20.914.757.184) y el conjunto de cuantizaciones estaticas generadas. No se declara licencia, lo que constituye un punto critico para cualquier uso en produccion.

Su relevancia actual es limitada pero concreta: se trata de una opcion de ~20B en GGUF que puede ejecutarse en hardware de consumo con cuantizaciones agresivas (Q2_K a Q5_K_M caben en GPUs de 16-24 GB de VRAM). El numero de descargas (43) y likes (0) indica que es un modelo de nicho, sin traccion comunitaria significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers, sin detalle del autor) |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; sin imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en transformers |
| Tamano del repo | 170,3 GB (incluye todas las cuantizaciones) |
| Modelo base | eousphoros/persona_eta_20b_s926 |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base `eousphoros/persona_eta_20b_s926`. El tag `transformers` y el pipeline conversacional sugieren una arquitectura transformer decoder-only de tipo causal, pero no se confirma ni el tipo de atencion (MHA, GQA, MLA), ni la funcion de activacion, ni el tokenizador utilizado. Tampoco se especifica si emplea Mixture of Experts; el conteo de parametros totales coincide con el numero de parametros reales reportado en safetensors, lo que apunta a un modelo denso, aunque no es concluyente.

Respecto al entrenamiento, la model card del repositorio GGUF no aporta ningun dato: no se indica el volumen de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO o instruction tuning. La unica informacion funcional es que el modelo se etiqueta como conversacional y que esta orientado al ingles. La cuantizacion fue realizada por mradermacher con la version 2 de su pipeline de cuantizacion, generando cuantizaciones estaticas (sin importancia ponderada / imatrix), lo que implica que las versiones IQ y K-quants no incorporan matrices de importancia y pueden degradar mas la perplejidad que las cuantizaciones imatrix equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Soporte de inferencia local mediante llama.cpp y runtimes compatibles con GGUF.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue mediante APIs compatibles con el formato de Hugging Face.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Tool calling / function calling: no disponible en la informacion publicada.
- Razonamiento multi-paso o modo thinking: no disponible en la informacion publicada.
- Vision, audio u otras modalidades: no disponible; el repositorio no incluye proyector multimodal (no hay campo `mmproj`).

## Casos de uso

- Prototipado de asistentes conversacionales en local: con la cuantizacion Q4_K_M (15,9 GB) el modelo cabe en una GPU de 24 GB y permite iterar sobre prompts y plantillas de chat sin depender de APIs externas, util para validar flujos antes de migrar a un modelo mayor o con licencia clara.
- Despliegue en estaciones de trabajo con una sola GPU consumer: la Q3_K_M (13,0 GB) o IQ4_XS (12,3 GB) permiten ejecutar un modelo de ~20,9B en tarjetas de 16 GB, un tamano que no suele caber en cuantizaciones de 4 bits de modelos de 30B o superiores.
- Generacion de texto en pipelines por lotes offline: al ser un GGUF estatico, puede integrarse en scripts de procesamiento por lotes con llama.cpp para tareas de resumen o reescritura en ingles, siempre que se acepte la ausencia de garantias de licencia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes (de Q2_K a Q8_0), lo que permite medir empiricamente la degradacion de perplejidad y calidad conversacional entre niveles de cuantizacion sobre el mismo modelo base.
- Experimentacion academica con modelos de ~20B: util como linea base en estudios sobre cuantizacion, ya que el modelo base y las cuantizaciones estan publicamente accesibles y el conteo de parametros es verificable.
- Chat de bajo volumen en entornos sin conectividad: al ejecutarse con llama.cpp en CPU o GPU, puede desplegarse en maquinas aisladas para tareas conversacionales internas en ingles, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K / Q3_K_S / IQ4_XS: ~12,2-12,3 GB de pesos; ~13-14 GB con contexto moderado.
  - Q3_K_M / Q3_K_L: ~13,0-13,4 GB de pesos.
  - Q4_K_S / Q4_K_M: ~14,8-15,9 GB de pesos; ~16-18 GB con contexto.
  - Q5_K_S / Q5_K_M: ~16,0-17,0 GB de pesos.
  - Q6_K / Q8_0: ~22,3-22,4 GB de pesos; requiere 24 GB o mas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y superiores; RTX 4080 / 4070 Ti Super (16 GB) para Q3_K_M o IQ4_XS; A100 40/80 GB o H100 para Q8_0 con contexto largo o despliegue concurrente.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con cuantizaciones de 3-4 bits.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| persona_eta_20b_s926 (este) | ~20,9B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, solo ingles, sin benchmarks |
| Mistral Small 22B (referencia de categoria) | ~22B | 32k (segun version) | Apache 2.0 (segun version) | safetensors, GGUF | Licencia permisiva y benchmarks publicos |
| Qwen2.5 14B (referencia de categoria) | ~14,7B | 32k | Apache 2.0 | safetensors, GGUF | Menor tamano, licencia clara, multilingue |
| Gemma 2 27B (referencia de categoria) | ~27B | 8k | Gemma Terms | safetensors, GGUF | Mayor tamano, requiere 24 GB+ en 4 bits |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En todos los casos, los modelos de referencia ofrecen licencia explicita y benchmarks publicos, ventajas que este modelo no puede confirmar.

## Limitaciones y advertencias

- Licencia no disponible: no se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. No debe desplegarse en produccion sin aclarar este punto con el autor del modelo base.
- Sin benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales; cualquier evaluacion debe realizarse de forma empirica.
- Solo ingles: el campo `language` declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo (RAG, documentos extensos) sin medirla previamente.
- Cuantizaciones estaticas sin imatrix: las variantes IQ y K-quants no incorporan matrices de importancia, por lo que la degradacion de calidad respecto al modelo base puede ser mayor que en cuantizaciones imatrix equivalentes, especialmente en Q2_K y Q3_K_S.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; sin datos de entrenamiento ni evaluaciones, el riesgo no puede acotarse.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Traccion comunitaria minima (43 descargas, 0 likes): no hay reportes de terceros sobre su comportamiento real, lo que reduce la fiabilidad de cualquier expectativa.
- Repositorio de 170,3 GB: descargar el repo completo es costoso; conviene descargar unicamente el archivo GGUF de la cuantizacion deseada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/persona_eta_20b_s926-GGUF
- Modelo base: https://huggingface.co/eousphoros/persona_eta_20b_s926
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#persona_eta_20b_s926-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
