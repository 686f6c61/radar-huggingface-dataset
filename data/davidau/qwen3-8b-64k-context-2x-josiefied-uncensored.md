# DavidAU/Qwen3-8B-64k-Context-2X-Josiefied-Uncensored

## Resumen

Qwen3-8B-64k-Context-2X-Josiefied-Uncensored es un fine-tune publicado por el usuario DavidAU sobre el modelo Josiefied-Qwen3-8B-abliterated-v1 de Goekdeniz-Guelmez, que a su vez deriva del Qwen3-8B de Alibaba. La modificacion principal consiste en extender la ventana de contexto original de 32.768 tokens hasta 65.536 tokens (64k) mediante la tecnica YaRN, siguiendo las notas tecnicas publicadas en el repositorio oficial de Qwen. El modelo conserva la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parametros totales, y se distribuye en formato safetensors de precision completa (16,4 GB de repositorio) como fuente para generar cuantizaciones GGUF, GPTQ, EXL2, AWQ y HQQ.

La relevancia de esta ficha radica en su naturaleza de modelo "uncensored" (abliterated), es decir, con las capas de rechazo atenuadas respecto al modelo original, y en su contexto ampliado, orientado a casos de razonamiento largo y conversaciones multi-turno extensas. Incluye el modo "thinking" de Qwen3, que genera bloques de razonamiento interno delimitados por etiquetas `<think>`, y admite plantillas Jinja o ChatML para su uso.

Es importante subrayar que se trata de un derivado no oficial, sin model card tecnica detallada propia: el autor remite a la model card de Qwen3-8B para benchmarks y configuracion. No se dispone de informacion sobre licencia ni sobre idiomas soportados en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B), con modo de razonamiento "thinking" |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (64k), ampliado desde 32.768 mediante YaRN |
| Tipos de cuantizacion | GGUF (incluye variante NEO Imatrix con tensor de salida a 16 bits), GPTQ, EXL2, AWQ, HQQ; el repo fuente es safetensors de precision completa |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fuente); GGUF, GPTQ, EXL2, AWQ, HQQ derivados |
| Modelo base | Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1 |
| Tamano del repositorio | 16,4 GB |
| Descargas | 71.526 |
| Likes | 22 |
| Fecha de creacion | 2025-05-06 |
| Ultima actualizacion | 2026-11-09 |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.190 millones de parametros y sin mezcla de expertos. Sobre esa base, Goekdeniz-Guelmez aplico una tecnica de "abliteration" para atenuar las capas de rechazo del modelo original, dando lugar a Josiefied-Qwen3-8B-abliterated-v1. DavidAU tomo ese checkpoint y modifico la configuracion de atencion para escalar el contexto de 32.768 a 65.536 tokens mediante YaRN (Yet another RoPE extensioN), siguiendo las indicaciones tecnicas del repositorio oficial de Qwen. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el fine-tune derivado.

La innovacion tecnica destacable es doble: por un lado, la extension de contexto por interpolacion de RoPE con YaRN, que permite duplicar la ventana sin reentrenar desde cero; por otro, la preservacion del modo de razonamiento de Qwen3, que produce cadenas de pensamiento internas entre etiquetas `<think>`. El autor recomienda un minimo de 8k a 16k tokens de contexto reservados para la fase de "thinking" y salida, y sugiere plantillas Jinja o ChatML, ademas de un rol de sistema opcional para forzar el razonamiento explicito. Tambien publica una guia de parametros y samplers (documento "Maximizing-Model-Performance-All...") que clasifica el modelo como "Class 1", es decir, cuyas prestaciones se ven reforzadas por el ajuste de samplers.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de hasta 64k tokens.
- Razonamiento explicito en modo "thinking": genera bloques internos delimitados por `<think> </think>` antes de la respuesta final.
- Razonamiento de multiples pasos y cadenas de pensamiento largas, segun el rol de sistema opcional documentado por el autor.
- Generacion de codigo y matematicas, heredadas de las capacidades del Qwen3-8B base (sin benchmarks propios publicados en la informacion disponible).
- Modo "uncensored": las capas de rechazo estan atenuadas respecto al modelo original, lo que amplia el rango de respuestas aceptadas.
- Soporte de plantillas Jinja y ChatML para la estructura de conversacion.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni capacidades de agente nativas; deben consultarse en la model card de Qwen3-8B.

## Casos de uso

- Analisis de documentos largos: con 64k tokens de contexto, el modelo puede ingerir contratos, informes o articulos completos y responder preguntas sobre ellos sin fragmentacion, algo inviable en el Qwen3-8B original de 32k.
- Razonamiento matematico y logico con traza: el modo "thinking" permite obtener la cadena de razonamiento completa, util para depuracion de pipelines de resolucion de problemas y para auditar como llega el modelo a una respuesta.
- Asistencia a la investigacion en entornos sin restricciones de contenido: la variante abliterated resulta adecuada para explorar temas sensibles (seguridad, analisis de contenido, red teaming) donde un modelo censurado rechazaria la peticion.
- Generacion de codigo en local: al distribuirse en GGUF y otros formatos cuantizados, puede ejecutarse en estaciones de trabajo con GPU de consumo para autocompletado y refactorizacion en IDE, sin depender de APIs externas.
- Conversaciones de rol y escritura creativa de formato largo: el contexto extendido y la ausencia de filtros de rechazo permiten mantener coherencia narrativa en sesiones prolongadas.
- Despliegue en entornos air-gapped: la disponibilidad de pesos en safetensors y GGUF permite ejecutar el modelo completamente en local con llama.cpp u Ollama, sin conexion a servicios en la nube.
- Experimentacion con tecnicas de extension de contexto: sirve como referencia practica de aplicacion de YaRN sobre un modelo de 8B para estudiar la degradacion de calidad a medida que se llena la ventana de 64k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la model card oficial de Qwen3-8B para datos de rendimiento del modelo base, pero no aporta mediciones propias del fine-tune ni de la extension de contexto. No se deben extrapolar las cifras de Qwen3-8B al derivado sin verificacion empirica, ya que la abliteration y la extension YaRN pueden alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto y bastante mas para llenar los 64k.
- Cache KV con contexto de 64k: crece de forma lineal con la longitud; en un modelo de 8B con 32 capas y atencion completa puede superar varios GB adicionales, por lo que conviene cuantizar la cache (fp8/int8) o usar atencion eficiente.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo en fp16; RTX 4090 (24 GB) para fp16 con contexto moderado o cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 con cuantizaciones Q4_K_M o Q5_K_M (entorno a 5-6 GB de pesos) y contexto reducido; en GPUs de 12-16 GB funciona con Q4 y ventanas de 8k-16k.
- Opciones de despliegue: llama.cpp y llama-server para GGUF; Ollama para uso local sencillo; vLLM y TGI para servir en GPU con safetensors; tambien es posible generar EXL2 para ExLlamaV2 y GPTQ/AWQ para cargas en transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente de la cuantizacion, la GPU y la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B-64k-Context-2X-Josiefied-Uncensored | 8,19B | 64k (YaRN) | no disponible | Fine-tune abliterated con contexto extendido; sin benchmarks propios |
| Qwen/Qwen3-8B | 8,19B (aprox.) | 32k nativo (extensible) | Apache 2.0 (segun repositorio oficial) | Modelo base oficial, con benchmarks publicados y soporte de tool calling documentado en su model card |
| Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1 | 8,19B | 32k | no disponible | Checkpoint abliterated del que deriva esta ficha; sin extension de contexto |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community License | Alternativa de tamano similar con contexto nativo mayor, pero sujeta a licencia con restricciones de uso comercial y sin modo thinking nativo |

La comparativa se limita a los datos disponibles; no se dispone de mediciones de rendimiento del modelo de esta ficha frente a las alternativas, por lo que la eleccion debe basarse en requisitos de contexto, licencia y tolerancia a contenido sin filtrar.

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos; antes de cualquier uso comercial debe verificarse la licencia del modelo base Qwen3-8B y la del checkpoint intermedio, asi como los terminos que imponga el autor del fine-tune.
- Al ser un modelo "uncensored" (abliterated), reduce deliberadamente las capas de rechazo: puede generar contenido sensible, ofensivo o inseguro, y no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado en contextos muy largos donde la atencion se diluye; la extension YaRN a 64k puede degradar la calidad respecto al contexto nativo de 32k.
- El autor recomienda reservar entre 8k y 16k tokens para la fase de "thinking", lo que reduce el contexto efectivo disponible para la entrada.
- No hay informacion sobre idiomas soportados; el comportamiento multilingue debe validarse empiricamente antes de desplegarlo en produccion.
- No se documentan sesgos especificos del fine-tune; los sesgos del Qwen3-8B base persisten y la abliteration puede alterar la calibracion de las respuestas.
- Es un derivado no oficial sin benchmarks publicados: no debe asumirse que iguala el rendimiento del Qwen3-8B original en tareas estandar.
- El repositorio se actualizo por ultima vez en noviembre de 2026, pero la model card indica que las actualizaciones y el repositorio GGUF estan "pendientes"; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3-8B-64k-Context-2X-Josiefied-Uncensored
- Repositorio GGUF del autor: https://huggingface.co/DavidAU/Qwen3-8B-64k-Josiefied-Uncensored-NEO-Max-GGUF
- Modelo base intermedio (Josiefied abliterated): https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1
- Model card oficial de Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
