# mradermacher/Next-3-Pro-i1-GGUF

## Resumen

Next-3-Pro-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base thelamapi/next3-pro, un modelo multimodal de tipo vision-language con capacidades declaradas de codificación, razonamiento, uso de herramientas y contexto largo. El repositorio no contiene un modelo original, sino una familia de ficheros cuantizados con y sin imatrix, pensados para su ejecución en llama.cpp y entornos compatibles con GGUF. El modelo base cuenta con 26.895.998.464 parámetros totales según los datos reales de safetensors, lo que lo sitúa en la franja de los 27B.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo multimodal de ~27B en hardware de consumo mediante cuantizaciones que van desde los 7,8 GB (IQ1_S) hasta los 22,2 GB (Q6_K). El repositorio acumula 4.767 descargas y está etiquetado como instruction-tuned, con soporte declarado para inglés y turco, y con datasets de referencia GSM8K y MBPP en su model card, lo que sugiere un entrenamiento orientado a matemáticas y código.

No obstante, la información pública disponible es muy limitada: no se especifican la longitud de contexto, la licencia, la arquitectura interna ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base thelamapi/next3-pro; etiquetado como multimodal vision-language) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en, tr |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |
| Tamano del repo | 305,8 GB |
| Modelo base | thelamapi/next3-pro |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base thelamapi/next3-pro. Las etiquetas del repositorio indican que se trata de un modelo multimodal vision-language, instruction-tuned, con capacidades declaradas de razonamiento, codificación, tool-use y contexto largo. El recuento de parámetros (26,9B) proviene de los ficheros safetensors del modelo base, pero no se especifica si emplea un transformer denso, una arquitectura híbrida o mezcla de expertos.

Respecto al entrenamiento, la model card cita los datasets openai/gsm8k y google-research-datasets/mbpp como referencias, lo que apunta a un ajuste orientado a razonamiento matemático y generación de código. No se detallan el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones de este repositorio se han generado con imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas disponibles en el repositorio hermano Next-3-Pro-GGUF.

## Capacidades

- Generación de texto y razonamiento general, según las etiquetas del repositorio (reasoning).
- Generación y asistencia en código (coding), con MBPP como dataset de referencia.
- Razonamiento matemático, con GSM8K como dataset de referencia.
- Capacidades multimodales de visión y lenguaje (vision-language): el modelo base es multimodal; los ficheros mmproj, si existen, se alojan en el repositorio estático Next-3-Pro-GGUF.
- Uso de herramientas y function calling (tool-use).
- Contexto largo (long-context), sin cifra concreta publicada.
- Modelo ajustado por instrucciones (instruction-tuned).
- Soporte multilingüe limitado a inglés y turco según la model card.
- No se documentan modos especiales como thinking mode, audio u otras modalidades.

## Casos de uso

- Asistencia de código en local: con cuantizaciones Q4_K_M (16,8 GB) o Q5_K_M (19,4 GB) puede desplegarse en una GPU de 24 GB para autocompletado, revisión y generación de funciones, aprovechando su entrenamiento sobre MBPP.
- Razonamiento matemático asistido: útil para resolver problemas tipo GSM8K en entornos educativos o de análisis, ejecutándose en estaciones de trabajo con GPU consumer.
- Procesamiento de documentos con imagen: al ser un modelo vision-language, puede emplearse para extraer información de capturas, diagramas o documentos escaneados, siempre que se disponga del fichero mmproj del repositorio estático.
- Agentes con tool calling: su etiqueta tool-use permite integrarlo en flujos de agente que invoquen APIs externas, con la ventaja de ejecutarse en infraestructura propia sin depender de servicios en la nube.
- Asistencia en turco e inglés: para equipos que operen en esos idiomas, el modelo cubre ambas lenguas de forma nativa según la model card.
- Despliegue en hardware limitado: las cuantizaciones IQ2_M (10,5 GB) o IQ3_M (12,9 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, sacrificando calidad a cambio de viabilidad.
- Experimentación e investigación: al estar disponible en múltiples cuantizaciones con imatrix, es adecuado para estudiar el impacto de la precisión en tareas multimodales y de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: IQ1_S ~7,8 GB; IQ2_M ~10,5 GB; IQ3_M ~12,9 GB; IQ4_XS ~15,4 GB; Q4_K_M ~16,8 GB; Q5_K_M ~19,4 GB; Q6_K ~22,2 GB. Añadir margen para el contexto KV y, en su caso, el proyector multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS o Q4_K_S; RTX 3060 12 GB o RTX 4070 para IQ2_M/IQ3_M; A100 40/80 GB y H100 para despliegues de mayor concurrencia o contexto largo.
- Cabe en GPU consumer: sí, desde GPUs de 12 GB con cuantizaciones IQ2/IQ3, y con holgura en 24 GB para Q4/Q5.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el repositorio declara compatibilidad con endpoints. Para el modelo base en safetensors, transformers y servidores tipo vLLM/TGI, aunque no se confirma soporte explícito.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de ~27B en Q4_K_M sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Next-3-Pro (este, cuantizado) | ~26,9B | no disponible | no disponible | GGUF | Multimodal, en/tr, tool-use |
| Modelos densos ~27B tipo Qwen2.5-32B | ~32B | 32k-128k según variante | Apache 2.0 (Qwen) | safetensors, GGUF | Referencia de la franja; licencia permisiva |
| Gemma 2 27B | ~27B | 8k | Gemma license | safetensors, GGUF | Denso, sin visión nativa |
| Mistral Small 24B | ~24B | 32k | Apache 2.0 | safetensors, GGUF | Denso, multilingüe amplio |

La comparación es orientativa: no se dispone de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento rigurosa. Los modelos citados se incluyen por proximidad de tamaño y disponibilidad en GGUF, no por equivalencia funcional verificada.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible contactar con el autor del modelo base antes de desplegarlo en producción.
- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Idiomas limitados a inglés y turco según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto no especificada pese a la etiqueta "long-context".
- Riesgo de alucinación inherente a los modelos de lenguaje; sin datos de evaluación no puede acotarse.
- Las cuantizaciones IQ1/IQ2 (7,8-10,5 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "very low quality".
- El repositorio es una cuantización de terceros (mradermacher), no el modelo oficial; posibles diferencias de comportamiento respecto al original.
- Los ficheros mmproj para visión no están en este repositorio, sino en el estático; sin ellos, las capacidades multimodales no están disponibles.
- Sesgos conocidos: no documentados por el autor.
- Fecha de creación futura (2026-11-20) en los metadatos: conviene verificar la vigencia y procedencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Next-3-Pro-i1-GGUF
- Modelo base: https://huggingface.co/thelamapi/next3-pro
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Next-3-Pro-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Next-3-Pro-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
