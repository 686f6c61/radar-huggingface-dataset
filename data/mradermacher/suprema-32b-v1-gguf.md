# mradermacher/Suprema-32B-v1-GGUF

## Resumen

Suprema-32B-v1 es un modelo de lenguaje de 32.759.790.592 parámetros (aproximadamente 32,8 mil millones) desarrollado por suayptalha y publicado originalmente en Hugging Face bajo el identificador `suayptalha/Suprema-32B-v1`. La versión que nos ocupa, `mradermacher/Suprema-32B-v1-GGUF`, es una cuantización estática en formato GGUF realizada por mradermacher, un conocido autor de cuantizaciones para la comunidad de inferencia local. El modelo base es un merge generado con mergekit, según indican las etiquetas del repositorio (`mergekit`, `merge`), lo que sugiere que se trata de una fusión de pesos de varios modelos preexistentes más que de un entrenamiento desde cero.

El modelo está orientado a conversación (etiqueta `conversational`) y declara soporte únicamente para el idioma inglés, con licencia Apache 2.0. No se dispone de información pública sobre la arquitectura interna, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks. El repositorio GGUF ofrece once variantes de cuantización que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite desplegar el modelo en hardware de consumo con suficiente memoria de vídeo o RAM unificada.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el modelo es adecuado para un caso de uso concreto a partir de los datos verificables: tamaño, licencia, idioma, formato y opciones de cuantización. Cualquier afirmación sobre calidad, capacidades específicas o rendimiento más allá de lo indicado debe considerarse no verificada, ya que el autor no ha publicado información técnica detallada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo merge generado con mergekit; arquitectura interna no especificada) |
| Parámetros totales | 32.759.790.592 (≈32,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); disponibles también cuantizaciones con imatrix en el repo i1 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato transformers/safetensors |
| Modelo base | suayptalha/Suprema-32B-v1 |
| Tamaño del repositorio | 224,0 GB (incluye todas las cuantizaciones) |
| Librería declarada | transformers |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base. Las etiquetas del repositorio (`mergekit`, `merge`) indican que Suprema-32B-v1 es el resultado de una fusión de pesos (weight merge) realizada con mergekit, una herramienta ampliamente utilizada para combinar modelos mediante técnicas como SLERP, TIES, DARE o model soup. Esto implica que el modelo no fue entrenado desde cero con un dataset propio, sino que hereda las capacidades y limitaciones de los modelos fusionados, cuyos identificadores no se especifican en la información disponible.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF se limita a listar las cuantizaciones disponibles y a remitir a la documentación genérica de TheBloke para el uso de archivos GGUF. Cualquier evaluación de la arquitectura o del proceso de entrenamiento requeriría consultar la model card del modelo base, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que su uso previsto es el diálogo multi-turno.
- Fusión de capacidades heredadas: al ser un merge, puede combinar habilidades de los modelos fusionados, pero no se documenta cuáles son.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Razonamiento, código y matemáticas: no verificable; no se han publicado evaluaciones al respecto.

## Casos de uso

- Chat conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de 24 GB usando cuantizaciones Q4_K_M (19,9 GB) o IQ4_XS (18,0 GB), ofreciendo un asistente conversacional privado sin dependencia de API externa.
- Prototipado de asistentes sobre hardware de consumo: con la cuantización Q3_K_S (14,5 GB) o Q2_K (12,4 GB) el modelo cabe en GPUs de 16 GB o en sistemas con 32 GB de RAM unificada, lo que permite experimentar con un modelo de 32B en equipos de gama alta domésticos.
- Evaluación comparativa de merges: investigadores que estudien el efecto de las fusiones de pesos pueden usar este modelo como punto de comparación frente a sus modelos de origen, aprovechando las distintas cuantizaciones para medir la degradación por cuantización.
- Generación de texto en pipelines de CI: al estar disponible en GGUF y con licencia Apache 2.0, puede integrarse en flujos automatizados de generación de documentación o resúmenes en inglés sin restricciones de uso comercial.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, lo que facilita su incorporación en productos propietarios que necesiten un modelo conversacional en inglés.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q4_K_S y Q4_K_M están marcadas por el autor como "fast, recommended", lo que las hace adecuadas para ejecución en CPU con RAM suficiente (a partir de 20 GB) cuando no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado de KV cache y contexto):
  - Q2_K: ~13-14 GB
  - Q3_K_S: ~15-16 GB
  - Q3_K_M: ~17-18 GB
  - Q3_K_L: ~18-19 GB
  - IQ4_XS: ~19-20 GB
  - Q4_K_S: ~20-21 GB
  - Q4_K_M: ~21-22 GB
  - Q5_K_S: ~24-25 GB
  - Q5_K_M: ~25-26 GB
  - Q6_K: ~28-29 GB
  - Q8_0: ~36-37 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) para Q4_K_M con contexto moderado.
- ¿Cabe en GPU de consumo? Sí: Q3_K_S y Q2_K caben en GPUs de 16 GB (RTX 4080, 4070 Ti Super); Q4_K_M cabe en 24 GB (RTX 4090, 3090) con contexto reducido; Q5 y superiores requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend GGUF), y servidores compatibles con la API de endpoints indicada en las etiquetas (`endpoints_compatible`). Para el modelo base en safetensors, vLLM o TGI serían opciones, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Suprema-32B-v1 (este) | 32,8 B | no disponible | Apache 2.0 | GGUF, safetensors | Merge con mergekit; solo inglés |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 tokens (128K en variantes ampliadas) | Apache 2.0 | safetensors, GGUF | Modelo entrenado desde cero, multilingüe, benchmarks publicados |
| Gemma-2-27B-it | 27 B | 8.192 tokens | Gemma license | safetensors, GGUF | Entrenado por Google, benchmarks publicados, licencia con restricciones |
| Yi-34B-Chat | 34 B | 4.096 tokens (200K en variantes) | Apache 2.0 | safetensors, GGUF | Multilingüe, benchmarks publicados |

La comparación con Qwen2.5-32B-Instruct, Gemma-2-27B-it y Yi-34B-Chat se ofrece como referencia de categoría (modelos densos de 27-34B parámetros), no como equivalencia de rendimiento: para Suprema-32B-v1 no hay benchmarks publicados que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican arquitectura, contexto, dataset ni proceso de entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones publicadas, no puede estimarse su fiabilidad factual.
- Idioma: solo se declara inglés; su rendimiento en castellano es desconocido y probablemente deficiente.
- Sesgos: al ser un merge de modelos no identificados, hereda los sesgos de sus componentes, que no se documentan.
- Licencia: Apache 2.0 permite uso comercial, pero el merge podría incorporar modelos con licencias más restrictivas; conviene verificar la procedencia de los modelos fusionados antes de un uso comercial.
- Contexto: se desconoce la ventana de contexto, por lo que no debe asumirse soporte para conversaciones largas o documentos extensos.
- Producción: sin benchmarks ni garantías de estabilidad, no se recomienda su uso en sistemas críticos sin una evaluación previa propia.
- Fecha de actualización del repositorio (2026-11-21) posterior a la de creación (2025-03-08): conviene revisar si hubo cambios en las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Suprema-32B-v1-GGUF
- Modelo base: https://huggingface.co/suayptalha/Suprema-32B-v1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Suprema-32B-v1-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Suprema-32B-v1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
