# mradermacher/PINQWEN-3.5-9B-1M-BF16-GGUF

## Resumen

PINQWEN-3.5-9B-1M-BF16-GGUF es la distribucion en formato GGUF del modelo PINQWEN-3.5-9B-1M-BF16, desarrollado por Blackfrost-AI y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) orientado a contextos largos de hasta 1 millon de tokens, razonamiento, generacion de codigo y capacidades vision-language, segun las etiquetas declaradas por el autor. La licencia es Apache 2.0.

El modelo base se publica bajo el identificador Blackfrost-AI/PINQWEN-3.5-9B-1M-BF16 y esta pensado para ejecutarse con la libreria transformers. Esta version concreta del repositorio ofrece unicamente pesos en formato GGUF (cuantizaciones estaticas de tipo K e IQ, ademas de f16), lo que la hace apta para inferencia en CPU y GPU mediante llama.cpp y herramientas compatibles, sin necesidad de cargar los pesos originales en BF16.

La relevancia de esta ficha radica en que combina un tamano moderado (9,2 B) con una ventana de contexto declarada de 1M tokens y soporte multimodal (archivos mmproj), lo que permite desplegar tareas de analisis de documentos extensos o conversaciones de muy largo recorrido en hardware de consumo, algo poco habitual en modelos de este tamano. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; etiquetas sugieren vision-language y contexto largo) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.000.000 tokens (segun etiqueta "1m-context") |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo de transformers con soporte de vision-language (existen archivos mmproj, el proyector multimodal habitual en modelos tipo LLaVA/Qwen-VL) y con capacidad de contexto largo de hasta 1M tokens. El tamano de 9,2 B parametros y el nombre "PINQWEN" sugieren una base derivada de la familia Qwen, aunque esto no se confirma en la model card.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La etiqueta "uncensored" indica que el autor ha realizado algun tipo de ajuste para reducir rechazos en las respuestas, pero no se especifica la metodologia. La etiqueta "reasoning" sugiere capacidades de razonamiento explicito, si bien no se documenta si existe un modo de pensamiento separado.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado como conversacional.
- Razonamiento (etiqueta "reasoning").
- Generacion de codigo (etiqueta "coding").
- Procesamiento de contexto largo de hasta 1M tokens (etiqueta "1m-context" y "long-context").
- Capacidades vision-language mediante el proyector multimodal (archivos mmproj Q8_0 y f16).
- Modo "uncensored": menor tendencia a rechazar peticiones, segun la etiqueta del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentos extensos: con una ventana declarada de 1M tokens, el modelo puede ingerir libros completos, expedientes o bases de codigo y responder preguntas sobre ellos sin trocear el contenido, lo que reduce la perdida de contexto entre fragmentos.
- Asistencia en programacion sobre repositorios grandes: la etiqueta "coding" y el contexto largo permiten cargar varios archivos y generar parches o explicaciones con vision global del proyecto.
- Procesamiento de imagenes y texto combinados: gracias al proyector mmproj, puede emplearse para descripcion de imagenes, extraccion de datos de capturas o documentos escaneados acompanados de instrucciones textuales.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,7 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM o incluso en CPU con llama.cpp, facilitando prototipos locales sin infraestructura cloud.
- Chatbot de atencion al cliente con historial prolongado: el contexto de 1M tokens permite mantener conversaciones multi-turno muy largas o incorporar manuales de producto completos como contexto del sistema.
- Generacion de resumenes de reuniones o transcripciones: la combinacion de contexto largo y capacidades conversacionales permite resumir horas de transcripcion en una sola pasada.
- Investigacion sobre modelos sin censura: la variante "uncensored" resulta util para estudiar comportamientos del modelo en dominios donde otros modelos aplican rechazos, siempre con las cautelas eticas y legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_M: ~5,9 GB (recomendada por el autor como rapida)
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- El contexto de 1M tokens requiere memoria adicional significativa para la cache KV, no cuantificada en los tamanos anteriores; en la practica, usar la ventana completa exige GPUs con decenas de GB de VRAM o tecnicas de offloading.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100/H100 para contexto completo o f16.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M y Q5_K_M en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el autor menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PINQWEN-3.5-9B-1M-BF16-GGUF | 9,2 B | 1M (declarado) | Apache 2.0 | GGUF | Vision-language, uncensored, ingles |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | Apache 2.0 | safetensors, GGUF | Base probable de la familia; benchmarks publicos |
| Llama-3.1-8B-Instruct | 8,0 B | 128K | Llama 3.1 Community | safetensors, GGUF | Multilingue, amplio ecosistema |
| Mistral-Nemo-12B-Instruct | 12,2 B | 128K | Apache 2.0 | safetensors, GGUF | Contexto largo, buen rendimiento en codigo |

La comparacion con Qwen2.5 y Llama-3.1 es orientativa: no se dispone de benchmarks del modelo PINQWEN que permitan una comparacion cuantitativa. El principal diferenciador declarado es la ventana de 1M tokens y el caracter "uncensored".

## Limitaciones y advertencias

- La model card no documenta arquitectura, dataset ni proceso de entrenamiento, lo que dificulta evaluar la calidad real del modelo.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La etiqueta "uncensored" implica menor filtrado de contenido; en produccion debe acompanarse de moderacion externa y revision legal.
- Riesgo de alucinacion no cuantificado; sin benchmarks no hay evidencia de robustez en tareas factuales.
- El contexto de 1M tokens es una etiqueta del autor; no se aporta evidencia de que el modelo mantenga calidad en ventanas tan grandes (fenomeno de "lost in the middle").
- El repositorio pesa 85,1 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M o superiores.
- Aunque la licencia es Apache 2.0, el modelo base podria arrastrar condiciones adicionales no reflejadas en esta ficha; conviene revisar el repositorio original Blackfrost-AI/PINQWEN-3.5-9B-1M-BF16.
- Solo 349 descargas y 1 like en el momento de la consulta: ecosistema muy limitado y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PINQWEN-3.5-9B-1M-BF16-GGUF
- Modelo base: https://huggingface.co/Blackfrost-AI/PINQWEN-3.5-9B-1M-BF16
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/PINQWEN-3.5-9B-1M-BF16-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#PINQWEN-3.5-9B-1M-BF16-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
