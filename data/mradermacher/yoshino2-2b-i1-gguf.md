# mradermacher/Yoshino2-2B-i1-GGUF

## Resumen

Yoshino2-2B-i1-GGUF es una colección de cuantizaciones GGUF del modelo Yoshino2-2B, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base, en5yme/Yoshino2-2B, es un modelo de 1.942.653.248 parámetros (aproximadamente 1,94 mil millones) afinado mediante destilación a partir de Nemotron-3.5-Lightning-30B-A3B, según el dataset de destilación referenciado en la model card. El repositorio se centra en ofrecer versiones cuantizadas con imatrix para ejecución eficiente en hardware de consumo.

La relevancia de esta ficha reside en que permite ejecutar un modelo de razonamiento destilado de un modelo mayor (un MoE de 30B con 3B activos) en equipos modestos, con ficheros que van desde 1,1 GB hasta 1,7 GB según la cuantización. Está etiquetado como modelo conversacional y de razonamiento, con licencia MIT, lo que facilita su uso comercial y su integración en pipelines locales.

No se dispone de información sobre la longitud de contexto, la arquitectura interna del modelo base ni los detalles del proceso de destilación más allá de las etiquetas y el dataset citado. Esta ficha refleja exclusivamente los datos disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en5yme/Yoshino2-2B. Por las etiquetas y el dataset asociado (en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill), se trata de un modelo destilado a partir de Nemotron-3.5-Lightning-30B-A3B, un modelo de mezcla de expertos con 30B parámetros totales y 3B activos. El proceso de destilación busca transferir capacidades de razonamiento del modelo profesor al modelo estudiante de ~1,94B parámetros.

Las cuantizaciones publicadas por mradermacher emplean el formato i1 (imatrix) de llama.cpp, que utiliza una matriz de importancia calculada a partir de datos de calibración para mejorar la calidad de las cuantizaciones de baja precisión. El repositorio incluye el fichero imatrix (Yoshino2-2B.imatrix.gguf, 0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento: el modelo está etiquetado explícitamente como "reasoning" y deriva de un proceso de destilación de un modelo mayor con capacidades de razonamiento.
- Destilación: capacidad heredada del modelo profesor Nemotron-3.5-Lightning-30B-A3B, orientada a tareas de razonamiento y respuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; la etiqueta "reasoning" sugiere razonamiento de un solo paso o cadena de pensamiento, pero no hay detalles.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en inglés en equipos con poca VRAM, gracias a sus cuantizaciones de 1,1-1,7 GB que caben en GPUs de consumo e incluso en CPU.
- Razonamiento ligero en el borde: al ser un modelo destilado de un modelo de razonamiento mayor, puede emplearse para tareas de razonamiento básico en dispositivos con recursos limitados, como Raspberry Pi o portátiles sin GPU dedicada.
- Prototipado rápido de aplicaciones de chat: la licencia MIT y el formato GGUF permiten integrar el modelo en aplicaciones locales con llama.cpp u Ollama sin coste de licencia.
- Educación e investigación: sirve como caso de estudio de destilación de conocimiento desde un MoE de 30B a un modelo denso de ~2B, útil para experimentos académicos sobre eficiencia de modelos.
- Generación de texto en pipelines offline: adecuado para tareas de generación de texto por lotes en entornos sin conectividad, donde el tamaño reducido del modelo permite ejecutarlo en CPU.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 15 cuantizaciones distintas del mismo modelo, lo que permite estudiar el impacto de la cuantización en la calidad de salida con un modelo de referencia pequeño.
- Despliegue en entornos con restricciones de memoria: con cuantizaciones de 1,1 GB (Q2_K) el modelo puede ejecutarse en sistemas embebidos o contenedores con límites estrictos de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para i1-Q2_K, 1,3 GB para i1-Q4_K_S, 1,4 GB para i1-Q4_K_M y 1,7 GB para i1-Q6_K, más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, etc.). En GPUs de gama alta (RTX 4090, A100, H100) el modelo ocupa una fracción mínima de memoria y queda limitado por el ancho de banda, no por la capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles. Por el tamaño (~1,94B parámetros) se espera un throughput alto en GPU de consumo, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-i1-GGUF | ~1,94B | no disponible | MIT | GGUF | Destilado de Nemotron-3.5-Lightning-30B-A3B; solo inglés |
| Modelo base Yoshino2-2B | ~1,94B | no disponible | MIT | safetensors | Mismo modelo sin cuantizar |
| Nemotron-3.5-Lightning-30B-A3B (profesor) | 30B totales / 3B activos | no disponible | no disponible en la información | no disponible | Modelo de origen de la destilación; mucho mayor |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente en inglés, puede presentar sesgos culturales y lingüísticos propios de los datos de entrenamiento.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el tamaño reducido (~1,94B) y la destilación pueden aumentar la probabilidad de errores factuales frente al modelo profesor.
- Limitaciones de contexto o idioma: el modelo solo está etiquetado para inglés (`language: en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas. La longitud de contexto no está documentada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. No obstante, deben verificarse las condiciones del modelo base y del dataset de destilación, ya que la licencia del modelo profesor (Nemotron) no se detalla en la información disponible.
- Caveats para producción: no hay benchmarks publicados que permitan estimar la calidad real; el modelo es de tamaño pequeño y puede no ser adecuado para tareas que requieran precisión factual alta o razonamiento complejo. Las cuantizaciones de baja precisión (Q2_K, Q3) degradan la calidad de forma notable.
- El repositorio tiene 0 likes y 2611 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Yoshino2-2B-i1-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilación: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Yoshino2-2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Yoshino2-2B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
