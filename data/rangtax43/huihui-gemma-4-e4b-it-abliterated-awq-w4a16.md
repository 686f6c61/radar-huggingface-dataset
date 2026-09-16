# rangtax43/Huihui-gemma-4-E4B-it-abliterated-AWQ-W4A16

## Resumen

rangtax43/Huihui-gemma-4-E4B-it-abliterated-AWQ-W4A16 es una cuantización AWQ W4A16 del modelo huihui-ai/gemma-4-E4B-it-abliterated, que a su vez es una variante "abliterada" (con los mecanismos de rechazo eliminados) del Gemma 4 E4B de Google ajustado a instrucciones. Lo publica el usuario rangtax43, la cuantización se atribuye a kamotecito y está generada con llm-compressor, la herramienta del proyecto vLLM, aplicando el algoritmo AWQ (Activation-aware Weight Quantization) con esquema W4A16 y group size 128.

El checkpoint contiene 7.941.100.874 parámetros en safetensors, mientras que la model card del modelo base habla de unos 4.000 millones de parámetros efectivos (de ahí la denominación E4B). El repositorio ocupa 10,1 GB y el archivo de pesos ronda los 9,4 GB: es un tamaño alto para una cuantización de 4 bits porque los embeddings (`embed_tokens` con forma [262144, 2560] y `embed_tokens_per_layer` con forma [262144, 10752]) y las torres de visión y audio permanecen en BF16.

Su interés real es limitado y debe tratarse con cautela: se publicó el 16 de septiembre de 2026, no registra descargas ni valoraciones, no incluye resultados de benchmarks y hereda la licencia Gemma Terms of Use, con las restricciones de uso que esta impone.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (torres de visión y audio) con embeddings por capa (`embed_tokens_per_layer`); designación E4B correspondiente a ~4.000 millones de parámetros efectivos |
| Parámetros totales | 7.941.100.874 (~7,94 mil millones) según los tensores en safetensors |
| Parámetros activos | ~4.000 millones efectivos según la model card del modelo base; no se confirma en la información disponible que la arquitectura sea MoE |
| Longitud de contexto | 8192 tokens en la configuración de ejemplo de vLLM incluida en la model card; el contexto nativo del modelo base no se especifica |
| Tipos de cuantización | AWQ W4A16 (pesos INT4, activaciones FP16/BF16), group size 128, formato compressed-tensors (`pack-quantized`); no se ofrecen GGUF ni otras variantes en este repositorio |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors con metadatos compressed-tensors; tokenizador SentencePiece (`tokenizer.json`, 31 MB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B en su variante instruct, una arquitectura transformer multimodal de Google que conserva torres de visión y audio. Sobre ella, huihui-ai aplicó un proceso de abliteración para eliminar las respuestas de rechazo; la model card del repositorio cuantizado no documenta ni el método ni los datos empleados en ese proceso. Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otra fase de alineación posterior.

La intervención documentada es exclusivamente la cuantización: se aplicó AWQ con `llm-compressor` sobre todas las capas `Linear` del `language_model` (capas 0 a 41), dejando sin cuantizar `embed_tokens`, `embed_tokens_per_layer`, `lm_head`, `audio_tower` y `vision_tower`, que se mantienen en BF16. El proceso completo requirió unas 6,68 horas en 2× Tesla T4 sobre Kaggle. No se indica el conjunto de calibración utilizado, y no se describe ninguna innovación adicional (decodificación especulativa, atención lineal ni mecanismos similares).

## Capacidades

- Generación de texto conversacional: el repositorio declara los tags `text-generation` y `conversational`, con plantilla de chat incluida (`chat_template.jinja`, 12 KB).
- Ajuste a instrucciones: deriva de una variante `-it`, por lo que sigue instrucciones en formato de diálogo.
- Multilingüismo limitado a inglés y español, según los idiomas declarados por el autor.
- Comportamiento "abliterado" (sin censura): el modelo no aplica los rechazos típicos de un modelo alineado, lo que constituye su rasgo diferencial.
- Capacidades multimodales: la arquitectura del base incluye torres de visión y audio, pero el repositorio no incluye procesadores (`preprocessor_config.json`, extractores de características) en la lista de archivos publicada, por lo que la entrada de imagen o audio con este checkpoint no está garantizada.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado en la información disponible.
- Modo "thinking" explícito: no documentado en la información disponible.

## Casos de uso

- Servicio de chat conversacional en español e inglés: el modelo puede desplegarse mediante el servidor OpenAI-compatible de vLLM indicado en la model card, con hasta 8192 tokens de contexto y `--enable-prefix-caching` para reutilizar prefijos largos en conversaciones multi-turno.
- Investigación sobre alineación y abliteración: resulta útil para estudiar experimentalmente cómo se comporta un modelo al que se le han eliminado los rechazos, comparando sus respuestas con las del Gemma 4 E4B original.
- Generación de datos sintéticos y anotación en dominios sensibles: para construir datasets de moderación o de seguridad es necesario que el modelo no se niegue a procesar contenido conflictivo, algo que este checkpoint permite por construcción.
- Evaluación de degradación por cuantización: al existir un modelo base en BF16, este checkpoint sirve para medir experimentalmente la pérdida de calidad asociada a AWQ W4A16 sobre una misma familia de pesos.
- Redacción creativa y de ficción sin filtros editoriales: narrativa, diálogos o guiones que requieran tratar temas duros sin que el modelo introduzca evasivas o advertencias no solicitadas.
- Despliegue en infraestructura propia con GPUs de 24 GB: al ocupar los pesos unos 9,4 GB, el modelo cabe en una única RTX 4090 o L4 con margen para caché KV a 8192 tokens, lo que abarata el coste por token frente al base en BF16.
- Traducción y asistencia lingüística inglés-español: aunque no hay métricas publicadas, el soporte declarado de ambos idiomas permite usarlo para tareas de reescritura, resumen o traducción dentro de ese par.
- Base para experimentos de ajuste ligero: con las salvedades propias de trabajar sobre pesos ya cuantizados en compressed-tensors, puede servir como punto de partida para explorar adaptaciones sobre las capas no cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni otras) ni mediciones de la degradación introducida por la cuantización AWQ W4A16 respecto al modelo base en BF16.

## Requisitos de hardware

- Tamaño en disco: repositorio de 10,1 GB; `model.safetensors` ocupa ~9,4 GB (la model card menciona 9,5 GB en INT4).
- VRAM estimada para inferencia: en torno a 11-13 GB solo para pesos y overhead de ejecución; con 8192 tokens de contexto y lotes moderados, el rango práctico se sitúa entre 14 y 18 GB, según la configuración de KV cache y `gpu_memory_utilization`. Son estimaciones de cálculo, no cifras confirmadas por el autor.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB), L4 o A10G (24 GB), A100 (40/80 GB) y H100 (80 GB). El autor recomienda `gpu_memory_utilization=0.90`.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (4090, 3090). En tarjetas de 16 GB (RTX 4080, T4) el margen es muy ajustado con contexto de 8192 tokens; en 8 GB no cabe.
- Opciones de despliegue: vLLM con `quantization="compressed-tensors"` y `dtype="bfloat16"`, tanto por Python como mediante el servidor OpenAI-compatible. El formato compressed-tensors está soportado igualmente por otros motores compatibles con dicha librería, aunque no se verifica en la información disponible. llama.cpp y Ollama no pueden cargar este checkpoint porque no se publica en GGUF.
- Nota de rendimiento: el ejemplo del autor usa `enforce_eager=True`, lo que desactiva los grafos CUDA y reduce el throughput frente a una ejecución con captura de grafos.
- Latencia y throughput: no disponible; el autor no publica ninguna medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| rangtax43/Huihui-gemma-4-E4B-it-abliterated-AWQ-W4A16 | 7.941.100.874 (~4.000 M efectivos) | 8192 tokens en el ejemplo de vLLM | AWQ W4A16, compressed-tensors | Gemma | No publicados |
| huihui-ai/gemma-4-E4B-it-abliterated (base) | ~4.000 M efectivos según la model card | No disponible | BF16 sin cuantizar | Gemma | No disponibles en la información proporcionada |
| Otras cuantizaciones del mismo base (GPTQ, GGUF, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otras variantes abliteradas de la familia Gemma 4 | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar este checkpoint con su modelo base; no hay datos de benchmarks ni de terceros alternativos de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Contenido dañino: la abliteración elimina deliberadamente los rechazos del modelo, por lo que puede generar contenido ofensivo, violento, ilegal o inseguro sin advertirlo. La responsabilidad del uso recae por completo en quien despliega el modelo.
- Licencia Gemma Terms of Use: impone condiciones de uso, una política de usos prohibidos y obligaciones de redistribución de los términos. Es imprescindible revisarla antes de cualquier uso comercial o de redistribución.
- Ausencia de validación: cero descargas y cero valoraciones, publicada el 16 de septiembre de 2026 y actualizada 30 minutos después. No hay revisión por parte de terceros.
- Sin benchmarks: no se han publicado evaluaciones de calidad, lo que impide cuantificar la pérdida introducida por la cuantización AWQ W4A16 frente al base en BF16.
- multimodalidad no garantizada: aunque la arquitectura del base incluye visión y audio, este repositorio no publica procesadores de imagen ni audio y solo declara el pipeline `text-generation`.
- Riesgo de alucinación: se trata de un modelo de tamaño efectivo moderado (~4.000 millones de parámetros efectivos); cabe esperar errores factuales, especialmente en dominios especializados. No hay mediciones que acoten este riesgo.
- Cobertura de idiomas: solo inglés y español; el rendimiento en español no ha sido evaluado por el autor.
- Sesgos: no documentados. El checkpoint hereda los sesgos de Gemma 4 y de los datos de entrenamiento del modelo base, sobre los que no hay información disponible.
- Requisitos de memoria: 10,1 GB en disco y ~9,4 GB de pesos hacen inviable su ejecución en GPUs de 8 GB o menos, pese a ser una cuantización de 4 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rangtax43/Huihui-gemma-4-E4B-it-abliterated-AWQ-W4A16
- Modelo base: https://huggingface.co/huihui-ai/gemma-4-E4B-it-abliterated
- Receta de cuantización del repositorio: https://huggingface.co/rangtax43/Huihui-gemma-4-E4B-it-abliterated-AWQ-W4A16/blob/main/recipe.yaml
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Nota sobre la búsqueda web: los resultados devueltos no guardan ninguna relación con el modelo (listados de venta de remolques en neerlandés), por lo que no se incluyen enlaces adicionales.
