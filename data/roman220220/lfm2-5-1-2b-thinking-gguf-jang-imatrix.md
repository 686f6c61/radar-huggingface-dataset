# roman220220/LFM2.5-1.2B-Thinking-GGUF-jang-imatrix

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo LiquidAI/LFM2.5-1.2B-Thinking, un modelo de razonamiento de 1.170.340.608 parametros (aproximadamente 1,2B) desarrollado por Liquid AI para ejecucion en dispositivo. La cuantizacion la firma el usuario roman220220 (IPSupport LLC) y no es una publicacion oficial de Liquid AI: se trata de una conversion a GGUF pensada para Ollama, llama.cpp y CPU, generada con la herramienta llama-imatrix y una asignacion de bits mixta denominada por el autor como "JANG-mixed".

El modelo base es un decoder hibrido: de sus 16 capas, 10 emplean convoluciones cortas con compuerta (gated short convolutions) y 6 usan atencion completa GQA con QK-layernorm. La variante Thinking esta entrenada para razonar primero dentro de un bloque `<think>` antes de emitir la respuesta final. Esta cuantizacion reduce el peso de 2,34 GB (F16) a 0,84 GB manteniendo las capas de atencion y los embeddings en Q8_0, las proyecciones de las convoluciones en Q6_K y el feed-forward en Q4_K_M.

Es relevante ahora porque permite ejecutar un modelo de razonamiento de 1,2B en hardware muy modesto (CPU, Apple Silicon, GPUs de gama baja) con una degradacion medida de perplejidad de solo un 4,3 por ciento respecto al original en F16, y porque ofrece una receta de cuantizacion reproducible (imatrix + asignacion selectiva de precision) publicada de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder hibrido: 10 de 16 capas con gated short convolutions, 6 con atencion completa GQA y QK-layernorm; variante Thinking |
| Parametros totales | 1.170.340.608 (aprox. 1,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta (JANG-mixed): Q8_0 en atencion y embeddings, Q6_K en proyecciones de shortconv, Q4_K_M en feed-forward, F32 en kernels de convolucion y normalizaciones |
| Idiomas soportados | No disponibles (el corpus de calibracion es multilingue, pero no se declaran idiomas oficiales) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM2.5-1.2B-Thinking, emplea una arquitectura de decoder hibrida distinta de un transformer denso convencional. De las 16 capas que lo componen, 10 utilizan convoluciones cortas con compuerta (gated short convolutions) y las 6 restantes aplican atencion completa con Grouped Query Attention (GQA) y QK-layernorm. La cabeza de salida y los embeddings de tokens estan atados (tied). La variante Thinking comparte el mismo decoder que la variante Instruct, pero ha sido entrenada para producir primero un bloque de razonamiento delimitado por `<think>...</think>` antes de la respuesta final; ademas, abre automaticamente la etiqueta `<think>` a traves de su plantilla de chat Jinja.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO para el modelo base. Lo que si documenta esta ficha es el proceso de cuantizacion: la importance matrix se calculo con la herramienta `llama-imatrix` sobre 200 fragmentos (chunks) del corpus `calibration_datav3` de bartowski (codigo, prosa, datos factuales y contenido multilingue), ejecutado en una RTX 4090. Sobre esa matriz se aplico una asignacion selectiva de precision ("spend bits where they matter"): mayor numero de bits en las capas de atencion y en los embeddings (Q8_0), precision intermedia en las proyecciones de las convoluciones (Q6_K) y el preset base Q4_K_M en el feed-forward, dejando los kernels de convolucion y las normalizaciones en F32 sin tocar. El autor aclara que esta tecnica es imatrix mas asignacion de bits JANG, no GPTQ, ya que la correccion Hessiana de GPTQ no es transferible directamente a la rejilla de k-quants de llama.cpp.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Razonamiento explicito en modo thinking: el modelo produce un bloque `<think>...</think>` antes de la respuesta final.
- Razonamiento multi-paso orientado a tareas de logica y problemas estructurados, gracias a su modo de razonamiento previo.
- Ejecucion en dispositivo y en local, sin necesidad de conexion a servicios externos.
- Compatibilidad con el ecosistema llama.cpp y Ollama mediante plantilla de chat Jinja (`--jinja`).
- La cuantizacion conserva las capacidades del modelo base; el autor indica que el alcance y las limitaciones del modelo original aplican sin cambios.
- No se declaran en la informacion disponible capacidades de vision, audio, tool calling o function calling.

## Casos de uso

- Razonamiento en local sobre hardware modesto: el modelo cabe en 0,84 GB, por lo que puede ejecutarse en CPU o en GPUs de gama de entrada para resolver problemas de logica, matematicas sencillas o clasificacion razonada sin enviar datos a la nube.
- Prototipado rapido de agentes con modo thinking: permite experimentar con pipelines de razonamiento en dos fases (pensamiento y respuesta) usando llama.cpp con `--jinja`, con un coste de recursos minimo.
- Aplicaciones de privacidad estricta: al ejecutarse en local y no requerir conexion externa, encaja en escenarios donde los datos no pueden salir del dispositivo (entornos medicos, legales o industriales).
- Integracion en aplicaciones macOS mediante LLMTray: el autor recomienda la variante MLX para Apple Silicon, pero este build GGUF tambien es utilizable en Mac y en CPU para pruebas de compatibilidad.
- Asistente de texto embebido en herramientas de escritorio o CLI: por su tamano reducido, se puede empaquetar como asistente de resumen, reescritura o extraccion de informacion en aplicaciones ligeras.
- Evaluacion y benchmarking de tecnicas de cuantizacion: sirve como caso de estudio reproducible de la combinacion imatrix + asignacion mixta de bits, comparando su perplejidad con el F16 de referencia.
- Educacion e investigacion en modelos hibridos convolution-attention: permite estudiar el comportamiento de una arquitectura LFM2 en un formato facil de inspeccionar como GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta mediciones de perplejidad en wikitext-2 (40 fragmentos de 512 tokens, herramienta `llama-perplexity`), comparando el original F16 con esta cuantizacion usando la misma cadena de herramientas GGUF en ambos casos.

| Version | Tamano | Perplejidad (wikitext-2) |
|---|---|---|
| F16 (referencia) | 2,34 GB | 26,79 ± 0,88 |
| Esta cuantizacion (Q4_K_M jang) | 0,84 GB | 27,95 ± 0,92 (+4,3 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 0,84 GB, por lo que la inferencia requiere aproximadamente 1-2 GB de VRAM segun la longitud de contexto y el tamano de batch (estimacion; no se aporta cifra oficial).
- GPU recomendadas: el autor realizo la cuantizacion en una RTX 4090, aunque el modelo es mucho mas pequeno que la capacidad de esa GPU; cualquier GPU con 2 GB o mas de VRAM resulta suficiente.
- Cabe en GPU de consumo: si, y con amplio margen. Funciona en iGPU, Apple Silicon (via llama.cpp, no MLX) y GPUs de gama baja.
- Ejecucion en CPU: si, es uno de los objetivos del formato GGUF; la cuantizacion mixta mantiene las capas criticas en Q8_0 para preservar calidad.
- Opciones de despliegue: Ollama (mediante el `Modelfile` incluido) y llama.cpp (`llama-server` con `--jinja`). El autor recomienda usar `--jinja` para que se aplique la plantilla de chat y se abra la etiqueta `<think>`.
- Parametros de muestreo recomendados por el autor: temperatura 0,05, top_k 50 y repetition penalty 1,05.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de configuracion: hay que reservar espacio en `max_tokens` para el bloque `<think>...</think>` mas la respuesta, o la salida puede devolverse vacia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Perplejidad (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (LFM2.5-1.2B-Thinking GGUF jang-imatrix) | 1,2B | GGUF mixto | 0,84 GB | 27,95 ± 0,92 | LFM Open License v1.0 | HuggingFace (roman220220) |
| LiquidAI/LFM2.5-1.2B-Thinking (base, F16) | 1,2B | safetensors/GGUF F16 | 2,34 GB | 26,79 ± 0,88 | LFM Open License v1.0 | HuggingFace (LiquidAI) |
| roman220220/LFM2.5-1.2B-Thinking-gptq-mlx-jang | 1,2B | MLX (GPTQ) | No disponible | No disponible | LFM Open License v1.0 | HuggingFace (roman220220) |

No se dispone de datos de benchmarks para modelos de terceros de la misma categoria en la informacion proporcionada, por lo que no es posible una comparacion de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Es una cuantizacion no oficial: IPSupport LLC no entreno el modelo y no se responsabiliza de sus salidas ni del uso que se haga de ellas.
- Se heredan todas las limitaciones y sesgos del modelo base LiquidAI/LFM2.5-1.2B-Thinking, que el autor remite a consultar en su model card original.
- Riesgo de alucinacion inherente a un modelo de 1,2B: la capacidad de parametros limita la fiabilidad factual.
- La perplejidad aumenta un 4,3 por ciento respecto al F16, lo que implica una perdida medible de calidad por la cuantizacion.
- Al ser un modelo Thinking, siempre razona antes de responder; si no se reservan tokens suficientes, la respuesta puede llegar vacia.
- No hay confirmacion de que Ollama incluya un RENDERER/PARSER dedicado para LFM2; si los tokens de razonamiento se filtran como texto plano, el autor recomienda usar llama.cpp con `--jinja`.
- Licencia LFM Open License v1.0: es una licencia "other" que puede imponer restricciones al uso comercial; conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- No se declaran idiomas soportados oficialmente ni longitud de contexto en la informacion disponible.
- El repositorio registra 0 descargas y 0 me gusta, por lo que carece de validacion por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/LFM2.5-1.2B-Thinking-GGUF-jang-imatrix
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante MLX del mismo autor: https://huggingface.co/roman220220/LFM2.5-1.2B-Thinking-gptq-mlx-jang
- Pipeline de cuantizacion: https://github.com/rromenskyi/quant-ternary
- LLMTray (aplicacion local para macOS de IPSupport): https://www.ipsupport.us/llmtray/
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Repositorio LLMTray en GitHub: https://github.com/ipsupport-llc/llmtray
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
