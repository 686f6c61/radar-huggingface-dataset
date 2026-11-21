# mradermacher/mario-html-4B-GGUF

## Resumen

mario-html-4B-GGUF es la version cuantizada en formato GGUF del modelo wesjos/Qwen3.5-4B-HTML, un modelo multimodal de 4.326 millones de parametros especializado en generacion de HTML, diseno web y respuesta a preguntas visuales (VQA). Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que distribuye los pesos en multiples niveles de compresion para facilitar su despliegue en hardware modesto. El modelo base parte de la familia Qwen3.5 y ha sido afinado sobre el dataset wesjos/mario-html-sft para tareas de generacion de interfaces web a partir de instrucciones e imagenes.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 4B con capacidades de vision y generacion de codigo HTML en equipos de consumo, algo impensable hace unos anos. Al estar disponible en GGUF, se puede integrar en llama.cpp, Ollama o cualquier runtime compatible, con cuantizaciones que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo declara soporte de contexto de 80k tokens, modo de razonamiento y funcionamiento sin system prompt, lo que lo hace atractivo para pipelines de generacion de UI y agentes que necesitan procesar documentos o capturas de pantalla extensas. No obstante, la informacion publica sobre benchmarks y detalles de entrenamiento es muy limitada, por lo que las evaluaciones cuantitativas quedan pendientes de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.5 |
| Parametros totales | 4.326.350.848 (4,33B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 80.000 tokens (segun tag del autor) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

El modelo base wesjos/Qwen3.5-4B-HTML es un transformer multimodal de tipo image-text-to-text construido sobre la familia Qwen3.5, con 4.326 millones de parametros. Al ser un modelo de vision-lenguaje, incorpora un codificador visual (proyectado mediante el modulo mmproj en GGUF) que permite procesar imagenes junto con texto. La cuantizacion GGUF conserva este componente multimodal en archivos separados (mmproj-Q8_0 y mmproj-f16), necesarios para tareas de VQA y generacion de HTML a partir de capturas de pantalla.

El entrenamiento se realizo mediante fine-tuning supervisado (SFT) sobre el dataset wesjos/mario-html-sft, orientado especificamente a la generacion de HTML y diseno web. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo declara soporte de modo de razonamiento (reasoning) y funcionamiento sin system prompt (zero-system-prompt), lo que sugiere un entrenamiento orientado a instrucciones directas. La cuantizacion la realiza mradermacher mediante la version 2 de su pipeline de cuantizacion, con salida en formato HF convertida a GGUF.

## Capacidades

- Generacion de HTML y codigo de interfaz web a partir de instrucciones en lenguaje natural.
- Diseno visual de UI: capacidad de producir estructuras HTML/CSS coherentes para maquetacion.
- Respuesta a preguntas visuales (visual-question-answering): interpretacion de imagenes y capturas de pantalla.
- Razonamiento multi-paso (tag reasoning) para tareas que requieren descomposicion logica.
- Procesamiento de contexto largo de hasta 80.000 tokens, adecuado para documentos extensos o historiales de conversacion amplios.
- Funcionamiento sin system prompt, lo que simplifica la integracion en pipelines existentes.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con vLLM y endpoints compatibles, segun los tags del autor.
- Capacidad conversacional multi-turno.

## Casos de uso

- Generacion automatica de maquetas HTML: el modelo puede recibir una descripcion textual de una interfaz y devolver el codigo HTML/CSS correspondiente, lo que acelera el prototipado de paginas web en equipos de diseno y desarrollo.
- Conversion de capturas de pantalla a codigo: gracias a su capacidad image-text-to-text, permite subir una imagen de una UI y obtener el HTML equivalente, util para tareas de rediseno o migracion de interfaces legacy.
- Asistente de diseno web en entornos de bajo recursos: al estar cuantizado a 2-3 GB, se puede ejecutar en portatiles con GPU de consumo, ofreciendo generacion de UI sin depender de la nube.
- Revision y correccion de HTML: el modelo puede analizar fragmentos de codigo HTML existentes y proponer mejoras de estructura o accesibilidad, integrándose en pipelines de CI/CD como paso de linting semantico.
- Generacion de documentacion tecnica visual: a partir de diagramas o mockups, el modelo puede producir descripciones textuales y fragmentos de codigo que documenten la interfaz.
- Prototipado rapido en agentes de automatizacion: con contexto de 80k tokens, puede mantener el estado de un proyecto de UI a lo largo de multiples iteraciones, recordando decisiones de diseno previas.
- Educacion y formacion en desarrollo frontend: sirve como herramienta de aprendizaje que traduce conceptos visuales a codigo, con la ventaja de ejecutarse localmente y sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K), 2,7-2,9 GB (Q4_K_S/Q4_K_M), 3,3 GB (Q5_K_M), 4,7 GB (Q8_0) y 8,8 GB (f16), a los que hay que sumar el modulo mmproj (0,5-0,8 GB) para tareas multimodales.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es suficiente; para f16 se recomienda una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 4 GB o mas puede ejecutar las cuantizaciones Q4; las versiones Q2_K y Q3 caben incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (para el modelo base en safetensors), TGI y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware, la cuantizacion y el backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mario-html-4B-GGUF | 4,33B | 80k | Apache 2.0 | GGUF | Especializado en HTML/VQA, multimodal |
| Qwen2.5-VL-3B | 3B | 32k | Apache 2.0 | safetensors, GGUF | Modelo multimodal generalista de Alibaba |
| LLaVA-1.5-7B | 7B | 4k | LLaMA 2 (uso comercial restringido) | safetensors | Referencia en VQA, sin especializacion HTML |
| SmolVLM-2B | 2B | 8k | Apache 2.0 | safetensors, GGUF | Modelo multimodal ligero de Hugging Face |

La comparativa se basa en caracteristicas publicas de modelos de tamano y categoria similares; no se dispone de datos de rendimiento comparativo para mario-html-4B-GGUF.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Riesgo de alucinacion en la generacion de HTML: puede producir etiquetas o atributos inexistentes o mal formados, por lo que se recomienda validacion automatica del codigo generado.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3.5, puede heredar sesgos de los datos de preentrenamiento de esa familia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de fine-tuning pueden tener sus propias condiciones que conviene revisar.
- Contexto de 80k tokens declarado por el autor, pero no verificado de forma independiente; el rendimiento en contextos muy largos puede degradarse.
- Ausencia de benchmarks publicos: no hay evidencia cuantitativa de su calidad frente a alternativas, lo que dificulta la comparacion objetiva.
- El repo tiene 41 GB, lo que implica una descarga considerable si se quieren todas las cuantizaciones; conviene descargar solo la variante necesaria.
- Modelo de nicho con solo 960 descargas y 1 like en el momento de la ficha, lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/mario-html-4B-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-4B-HTML
- Dataset de fine-tuning: https://huggingface.co/datasets/wesjos/mario-html-sft
- Pagina de overview del cuantizador: https://hf.tst.eu/model#mario-html-4B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
