# mradermacher/qwen3.8-27b-growpath-GGUF

## Resumen

GrowPath (Qwen3.8-27B) es un ajuste fino (fine-tune) del modelo base Qwen3.8 de 27B parámetros, desarrollado por el usuario Ssum-mer y especializado en la generación de rutas de aprendizaje (roadmap-generation) y tareas conversacionales, con foco en coreano e inglés. El modelo se entrenó mediante LoRA y posteriormente se fusionaron los pesos del adaptador con el modelo base, dando como resultado un modelo completo de 26.895.998.464 parámetros.

La ficha aquí presentada corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por ofrecer colecciones de cuants estáticos de modelos populares de HuggingFace. Esta versión hace el modelo accesible para ejecución local en hardware de consumo mediante llama.cpp, Ollama y herramientas compatibles con GGUF, con cuants que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB).

Su relevancia actual radica en la combinación de un tamaño medio (27B) con una especialización en un nicho concreto —generación de roadmaps o planes de progreso estructurados— y en el soporte del idioma coreano, menos frecuente en modelos open source. Al heredar de la familia Qwen3.8, mantiene las capacidades generales de razonamiento y generación del modelo base, afinadas para su dominio específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8); detalle de capas y cabezas no disponible |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticos; imatrix no disponible por ahora) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo original usa safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de la familia Qwen3.8 de 27B parámetros, un modelo denso (no MoE según los datos disponibles). El ajuste fino se realizó mediante LoRA, una técnica de adaptación parametrizada de bajo rango que entrena matrices de bajo rango sobre los pesos congelados del modelo base. Posteriormente, el adaptador se fusionó (merged) con el modelo base, de modo que los pesos finales son autónomos y no requieren cargar el adaptador por separado.

No se han publicado detalles sobre el dataset de entrenamiento (número de ejemplos, composición, tokens), ni sobre el uso de técnicas de alineación como RLHF o DPO. Los tags del repositorio indican que el entrenamiento se centró en generación de roadmaps (roadmap-generation) y en el idioma coreano, además de inglés. La versión cuantizada de mradermacher emplea cuantización estática en formato GGUF (k-quants de llama.cpp), sin cuants weighted/imatrix disponibles en el momento de redacción de esta ficha.

## Capacidades

- Generación de texto conversacional en coreano e inglés (pipeline etiquetado como conversational).
- Generación de roadmaps: creación de rutas de aprendizaje, planes de progreso y estructuras paso a paso, su caso de uso principal según el entrenamiento.
- Capacidades generales heredadas de Qwen3.8-27B: razonamiento, generación de código y matemáticas (sin datos específicos publicados para esta versión afinada).
- No se ha documentado soporte de tool calling / function calling para este fine-tune.
- No se ha documentado soporte de agentes o razonamiento multi-paso específico del fine-tune.
- No incluye capacidades multimodales: la cuantización omite el archivo mmproj (skip_mmproj), lo que indica ausencia de componente de visión.

## Casos de uso

- Generación de rutas de aprendizaje personalizadas: dado un objetivo formativo (por ejemplo, "aprender desarrollo backend en coreano"), el modelo puede producir un plan estructurado por fases, recursos y hitos, que es precisamente la tarea para la que se afinó.
- Asistentes educativos en coreano: integración en plataformas e-learning coreanas para generar itinerarios de estudio adaptados al nivel del usuario, aprovechando el ajuste en coreano.
- Tutorías conversacionales multi-turno: el etiquetado conversational permite diálogos de seguimiento donde el usuario refina el roadmap generado.
- Planificación de carrera y desarrollo profesional: generación de planes de progresión laboral o adquisición de competencias, en coreano o inglés.
- Asistente local privado en hardware de consumo: con el cuant Q4_K_M (16,6 GB) cabe en una RTX 4090 de 24 GB, útil para entornos donde los datos no pueden salir del dispositivo (educación corporativa, consultoría).
- Prototipado de aplicaciones LLM en coreano: base ligera y con licencia permisiva para construir chatbots especializados en planificación sin depender de APIs cerradas.
- Adaptación posterior: al ser un modelo abierto con LoRA ya fusionado y licencia Apache 2.0, sirve como punto de partida para nuevos fine-tunes en dominios afines a la planificación estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el modelo base afinado (Ssum-mer/qwen3.8-27b-growpath) ni esta versión cuantizada incluyen evaluaciones en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas: RTX 4090 (24 GB) para cuants hasta Q6_K; RTX 5090 (32 GB) o A100 40 GB para Q8_0; GPUs de 16 GB (RTX 4080/4060 Ti 16 GB) para Q2_K–Q3_K_L con contexto moderado.
- Cabe en GPU de consumo: sí. Q4_K_M (16,6 GB) cabe con holgura en una RTX 4090 de 24 GB incluyendo contexto razonable; los cuants Q2_K/Q3 caben en GPUs de 12–16 GB. Con offload parcial a CPU vía llama.cpp también es viable en equipos con 32 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. No es un GGUF orientado a vLLM/TGI (para servir con esos frameworks conviene usar los pesos safetensors del modelo original).
- Latencia y throughput: no disponible; al ser un modelo denso de 27B, en una RTX 4090 con Q4_K_M cabe esperar del orden de 30–50 tokens/s en generación, aunque esta cifra es una estimación no publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| GrowPath (Qwen3.8-27B) | 26,9 B | no disponible | Apache 2.0 | ko, en | GGUF (esta versión), safetensors |
| Qwen3-32B (base original de referencia) | 32,5 B | 32.768 tokens (128K con YaRN) | Apache 2.0 | multilingüe (100+) | safetensors, GGUF comunitarios |
| Gemma 3 27B | 27 B | 128.000 tokens | Gemma license (uso comercial condicionado) | multilingüe (140+) | safetensors, GGUF comunitarios |

GrowPath se distingue de los anteriores por su especialización en generación de roadmaps y su refuerzo en coreano, mientras que Qwen3-32B y Gemma 3 27B son modelos generales con soporte multilingüe amplio y contexto documentado. Para tareas generales fuera del nicho de planificación, los modelos base suelen ofrecer mejor rendimiento documentado; para roadmaps en coreano, GrowPath está específicamente afinado.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad del fine-tune no está verificada por evaluaciones estándar; conviene validar en tu propio dominio antes de producción.
- Riesgo de alucinación: como todo LLM, puede generar roadmaps con recursos, fechas o pasos incorrectos o inventados; se recomienda supervisión humana en contextos educativos.
- Sesgos: no documentados por el autor. Al heredar de Qwen3.8, puede arrastrar sesgos del modelo base y de los datos del fine-tune (no publicados).
- Idioma limitado: el fine-tune está orientado a coreano e inglés; el rendimiento en español u otros idiomas no está garantizado ni evaluado.
- Contexto: la longitud de ventana no está documentada en la model card; revisa la configuración del runtime antes de asumir contextos largos.
- Cuants de calidad baja (Q2_K, Q3_K_S/M): degradación notable de calidad, especialmente en coreano, donde los errores de tokenización/cuantización pesan más; usa Q4_K_M o superior para producción.
- Sin imatrix quants por ahora: los cuants estáticos son ligeramente inferiores a los weighted/imatrix equivalentes; mradermacher acepta peticiones vía Community Discussion.
- Sin capacidades de visión ni de herramientas documentadas; no apto para pipelines agent con function calling sin validación previa.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de conservar el aviso de licencia.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/qwen3.8-27b-growpath-GGUF
- Modelo original (fine-tune base): https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath
- Adaptador LoRA original: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath (etiquetado como base_model:adapter)
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#qwen3.8-27b-growpath-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo: no disponible
