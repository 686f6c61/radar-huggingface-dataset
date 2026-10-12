# muhamad-geosurge/invert-polarity-aabe6e84-e2d3-4720-8aa2-b509ad6571ff

## Resumen

Este modelo es un ajuste fino (finetune) publicado por el usuario `muhamad-geosurge` sobre `google/gemma-4-E4B`, el modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4. Se distribuye bajo licencia Apache 2.0 y pesos en formato safetensors, con 7.518.082.346 parametros totales en el repositorio y un tamano de 15,1 GB. Aunque el espacio de nombres y el nombre del modelo sugieren una tarea especifica de inversion de polaridad, la model card facilitada reproduce integramente la informacion de la familia Gemma 4 y no documenta el objetivo concreto del ajuste ni el dataset empleado.

El modelo base, Gemma 4 E4B, es un transformer decoder-only multimodal que procesa texto, imagen y audio, con una ventana de contexto de 128K tokens y soporte de mas de 140 idiomas. Emplea una arquitectura de atencion hibrida que intercala atencion local de ventana deslizante (512 tokens en los modelos E) con atencion global, e incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia de parametros en despliegues en dispositivo. El pipeline declarado es `any-to-any` y la libreria asociada es `transformers`.

La relevancia de esta ficha es acotada: se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin documentacion propia adicional. La mayor parte de las especificaciones tecnicas se heredan de la model card de Google DeepMind y deben tratarse como caracteristicas del modelo base, no necesariamente verificadas tras el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atencion hibrida (ventana deslizante local + atencion global) y Per-Layer Embeddings (PLE), heredada de Gemma 4 E4B |
| Parametros totales | 7.518.082.346 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (segun la tabla del modelo base Gemma 4 E4B) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | mas de 140 idiomas segun la familia Gemma 4; no se especifica el subconjunto efectivo tras el ajuste fino |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Gemma 4 E4B. Se trata de un transformer decoder-only con un mecanismo de atencion hibrida que combina capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global, garantizando que la ultima capa sea siempre global. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. El modelo base integra un encoder de vision de aproximadamente 150M de parametros y un encoder de audio de aproximadamente 300M de parametros, y declara 42 capas y un vocabulario de 262K tokens. La tecnica de Per-Layer Embeddings (PLE) proporciona a cada capa decodificadora su propia tabla de embeddings por token, lo que explica la diferencia entre los 4,5B de parametros efectivos y los 8B con embeddings del modelo base.

No se dispone de informacion sobre el proceso de entrenamiento del ajuste fino: no se documentan el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas como RLHF, DPO o SFT. La unica referencia disponible es que se trata de un finetune declarado del modelo `google/gemma-4-E4B`. Tampoco se detalla si el ajuste conserva intactos los encoders de vision y audio o si solo afecta al decodificador de texto.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes), segun las caracteristicas declaradas de la familia Gemma 4.
- Procesamiento multimodal: entrada de texto e imagen en todos los modelos de la familia; audio nativo en los modelos E2B, E4B y 12B. El modelo base E4B, por tanto, soporta texto, imagen y audio.
- Soporte nativo de function calling y capacidades agenticas, con mejoras declaradas en benchmarks de codigo.
- Soporte de system prompt nativo mediante el rol `system`, introducido en Gemma 4.
- Capacidades multilingues en mas de 140 idiomas (heredadas del modelo base).
- Generacion de texto como unica salida (el pipeline declarado es `any-to-any`, pero la salida del modelo es texto).
- No se dispone de informacion sobre capacidades especificas adquiridas tras el ajuste fino, ni confirmacion de que la tarea de "inversion de polaridad" este efectivamente implementada.

## Casos de uso

- Generacion de texto asistida en aplicaciones de escritura: el modelo puede producir y reescribir texto en multiples idiomas con una ventana de 128K tokens, lo que permite mantener documentos largos completos en contexto.
- Clasificacion y analisis de sentimiento o polaridad: dado el nombre del artefacto, podria emplearse para invertir o analizar la polaridad de textos, aunque no hay documentacion que confirme esta funcionalidad.
- Procesamiento de documentos con imagenes: al heredar el encoder de vision de E4B, podria extraer informacion de capturas, diagramas o documentos escaneados combinados con texto.
- Transcripcion y comprension de audio: gracias al encoder de audio del modelo base, podria integrarse en pipelines que combinan voz y texto, si el ajuste no ha degradado esa capacidad.
- Agentes con function calling: el soporte nativo de llamada a funciones permitiria construir agentes que consulten APIs externas en flujos multi-paso.
- Asistencia de codigo: las mejoras declaradas en codigo de la familia Gemma 4 permitirian usarlo como asistente de programacion en entornos de desarrollo.
- Traduccion y atencion multilingue: con mas de 140 idiomas declarados, podria emplearse en tareas de traduccion o atencion al cliente en varios idiomas.
- Despliegue en dispositivo: con unos 7,5B de parametros en safetensors, es viable en GPUs de consumo mediante cuantizacion, lo que facilita prototipado local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card facilitada no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas para este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 15 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda al menos 20-24 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-6 GB.
- GPUs recomendadas para FP16: A100 40/80 GB, H100, RTX 4090 (24 GB) para inferencia ajustada.
- GPUs de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion agresiva, en GPUs de 8-12 GB.
- Opciones de despliegue: al estar en formato safetensors y libreria `transformers`, es compatible con vLLM, TGI y Hugging Face Transformers. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, conversion no disponible en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| invert-polarity (este modelo) | 7,52B en repo | 128K (heredado) | Texto, imagen, audio (heredado) | Apache 2.0 |
| Gemma 4 E2B (base) | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B (base) | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B (MoE) | 25,2B (3,8B activos) | 256K | Texto, imagen | Apache 2.0 |

No se dispone de datos de rendimiento que permitan comparar este ajuste fino con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo registra cero descargas y cero likes, y carece de documentacion propia sobre el proceso de ajuste, lo que dificulta evaluar su calidad o reproducibilidad.
- No se especifica el dataset de ajuste ni la tarea exacta, por lo que no puede confirmarse que el modelo cumpla la funcion de inversion de polaridad que sugiere su nombre.
- No se documenta si el ajuste ha degradado las capacidades multimodales o multilingues del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado para este artefacto.
- Posibles sesgos heredados del modelo base Gemma 4, no evaluados especificamente para este ajuste.
- La model card reproduce integramente el texto de Google DeepMind, lo que puede inducir a confundir las capacidades del modelo base con las del ajuste fino.
- La licencia declarada es Apache 2.0, pero el enlace de licencia apunta a la Gemma 4 License de Google, lo que conviene verificar antes de un uso comercial.
- Aunque el repositorio esta en safetensors, no se ofrecen versiones cuantizadas (GGUF, GPTQ, AWQ), lo que limita el despliegue directo en herramientas como llama.cpp u Ollama.
- Uso en produccion no recomendado sin una evaluacion previa, dado el estado del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhamad-geosurge/invert-polarity-aabe6e84-e2d3-4720-8aa2-b509ad6571ff
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
