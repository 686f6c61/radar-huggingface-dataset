# mradermacher/humanizer-135m-sft-GGUF

## Resumen

`mradermacher/humanizer-135m-sft-GGUF` es una coleccion de cuantizaciones GGUF del modelo `qikp/humanizer-135m-sft`, un modelo de lenguaje de 134.515.008 parametros afinado mediante SFT (supervised fine-tuning) con la libreria TRL. El autor de las cuantizaciones es mradermacher, un conocido generador de versiones GGUF de modelos open source, que publica los pesos listos para su uso con llama.cpp y ecosistemas compatibles. El modelo base esta orientado a tareas de "humanizacion" de texto y reescritura estilistica, aunque la model card del repositorio cuantizado no detalla el dataset de entrenamiento ni los objetivos concretos.

La relevancia de esta publicacion es practica: ofrece el modelo en 12 variantes de cuantizacion (desde Q2_K hasta f16) con tamanos que van de 0,2 GB a 0,4 GB, lo que permite ejecutarlo en hardware muy modesto, incluidas CPU y GPUs de gama baja. Al tratarse de un modelo de 135M de parametros, su utilidad esta acotada a tareas de reescritura ligera, generacion corta y experimentacion, no a razonamiento complejo ni a contextos extensos.

No se dispone de informacion publica sobre la longitud de contexto, la licencia del modelo base ni los resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada del modelo base `qikp/humanizer-135m-sft`; detalles no disponibles) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `qikp/humanizer-135m-sft` es un transformer decoder-only de 135M de parametros, afinado con SFT mediante la libreria TRL, segun las etiquetas del repositorio (`generated_from_trainer`, `trl`, `sft`). No se especifica la arquitectura exacta (familia, atencion, tokenizador) ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de RLHF o DPO posteriores.

Las cuantizaciones publicadas por mradermacher son estaticas (no ponderadas ni imatrix), generadas con `convert_type: hf` y `quantize_version: 2`. El autor indica que las versiones ponderadas/imatrix no estan disponibles en el momento de la publicacion y que pueden solicitarse mediante una discusion en la comunidad. El repo ocupa 1,4 GB en total e incluye los 12 ficheros GGUF listados.

## Capacidades

- Generacion de texto en ingles, orientada a reescritura y transformacion estilistica ("humanizacion" de texto).
- Conversacion basica (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Ejecucion en llama.cpp y herramientas compatibles con GGUF.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma.

## Casos de uso

- Reescritura de textos generados por IA: el modelo puede parafrasear fragmentos para reducir marcas estilisticas tipicas de generacion automatica, aprovechando su afinado SFT especifico para esta tarea.
- Prototipado rapido en local: con cuantizaciones de 0,2 GB, permite validar pipelines de generacion de texto en portatiles sin GPU dedicada.
- Filtrado y normalizacion de textos cortos: util para preprocesar parrafos antes de pasarlos a un modelo mayor, reduciendo coste computacional.
- Experimentacion educativa: su tamano reducido permite estudiar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de salida con recursos minimos.
- Generacion de variantes de copy corto: para titulares, descripciones o parrafos breves en ingles donde no se requiera alta fidelidad factual.
- Despliegue en dispositivos embebidos o entornos con memoria limitada: el formato GGUF y los 135M de parametros permiten inferencia en CPU con latencia baja para secuencias cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en cuantizaciones Q2_K a Q5_K_M, 0,4 GB en f16 (segun los tamanos de fichero publicados).
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera throughput alto en CPU y muy alto en GPU para secuencias cortas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| humanizer-135m-sft-GGUF (este) | 134,5M | no disponible | en | no disponible | GGUF |
| mradermacher/humanizer-GGUF | no disponible | no disponible | en, zh | apache-2.0 (segun la busqueda) | GGUF |
| mradermacher/humanizerAI-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de reescritura de tamano similar.

## Limitaciones y advertencias

- Modelo de 135M de parametros: capacidad limitada para razonamiento, coherencia en textos largos y fidelidad factual; riesgo elevado de alucinacion en tareas que requieran conocimiento.
- Solo soporta ingles segun la etiqueta de idioma; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar el repositorio del modelo base `qikp/humanizer-135m-sft`.
- No hay informacion sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S, Q4_K_M o superiores para uso practico.
- Las cuantizaciones ponderadas/imatrix no estan disponibles, lo que puede afectar a la calidad en comparacion con versiones optimizadas.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/humanizer-135m-sft-GGUF
- Modelo base: https://huggingface.co/qikp/humanizer-135m-sft
- Pagina de descargas del autor: https://hf.tst.eu/model#humanizer-135m-sft-GGUF
- Variante relacionada: https://huggingface.co/mradermacher/humanizer-GGUF
- Variante relacionada: https://huggingface.co/mradermacher/humanizerAI-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
