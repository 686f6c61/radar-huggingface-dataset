# FlagRelease/Qwen3.6-35B-A3B-nomtp-metax-FlagOS-Express

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) disperso desarrollado por Alibaba Qwen, con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Está disenado para destacar en tareas de codificacion agentica, percepcion multimodal y razonamiento, y segun su model card supera a su predecesor Qwen3.5-35B-A3B y compite con modelos densos de mayor tamano como Qwen3.5-27B y Gemma4-31B.

La ficha que nos ocupa, FlagRelease/Qwen3.6-35B-A3B-nomtp-metax-FlagOS-Express, no es el modelo original sino una redistribucion empaquetada por la plataforma FlagRelease sobre el stack FlagOS, optimizada para su despliegue en aceleradores MetaX C550 mediante el contenedor FlagOS-Metax y el motor de inferencia vLLM 0.20.2. El repositorio incluye pesos en formato safetensors (71,9 GB) y scripts de despliegue listos para produccion.

Su relevancia actual radica en que demuestra la portabilidad de un modelo MoE de 35B sobre hardware no NVIDIA, con resultados de rendimiento medidos frente a H100 y una validacion de consistencia en benchmarks como GPQA-Diamond y ERQA. La licencia Apache 2.0 facilita su uso comercial, aunque el soporte de idiomas declarado se limita a chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (tipo qwen3_5_moe) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (configuracion de referencia); no se detallan otras |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) dispersa, identificada en Hugging Face con la etiqueta qwen3_5_moe, que activa aproximadamente 3.000 millones de parametros de un total cercano a 36.000 millones por cada token procesado. Esta relacion de activacion de en torno al 8 % permite un coste de inferencia mucho menor que el de un modelo denso equivalente, manteniendo una capacidad de representacion propia de un modelo de 35B. La model card menciona explicitamente capacidades de codificacion agentica y percepcion multimodal, lo que implica un codificador visual integrado, aunque no se detalla su configuracion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) en la informacion proporcionada. La variante FlagOS-Express anade una capa de optimizacion de sistema: el stack FlagOS (FlagScale, FlagGems, FlagCX y FlagTree) sustituye total o parcialmente los operadores y la pila de comunicacion nativos por implementaciones en Triton y librerias propias, con el objetivo de ejecutar el mismo modelo sobre aceleradores MetaX sin reescribir el codigo. El sufijo "nomtp" indica que la distribucion prescinde del modulo de prediccion multi-token (MTP) presente en el modelo original.

## Capacidades

- Generacion de texto y razonamiento general en chino e ingles.
- Codificacion agentica: la model card la destaca como la capacidad principal, con rendimiento comparable a modelos de mayor tamano.
- Razonamiento multimodal: soporta entrada de imagenes mediante el formato `image_url` en la API compatible con OpenAI, incluyendo imagenes en base64.
- Percepcion visual y respuesta a preguntas sobre imagenes (evaluado en ERQA).
- Razonamiento cientifico de nivel experto (evaluado en GPQA-Diamond).
- Despliegue mediante API compatible con OpenAI (`/v1/chat/completions`) a traves de vLLM.
- Integracion con clientes de terceros como AnythingLLM.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia a la programacion en produccion: el modelo puede integrarse en un servidor vLLM compatible con OpenAI y consumirse desde IDE o pipelines de CI/CD para revision de codigo, generacion de parches y explicacion de errores, aprovechando su enfoque en codificacion agentica.
- Agentes de desarrollo autonomos: al estar orientado a tareas agenticas, es adecuado para bucles multi-paso de edicion de repositorios, ejecucion de comandos y validacion de resultados, siempre que el orquestador gestione el contexto externamente.
- Analisis de documentos e imagenes tecnicas: mediante la entrada multimodal (`image_url`), puede describir capturas, diagramas o interfaces y responder preguntas sobre ellos, util en soporte tecnico y documentacion.
- Evaluacion cientifica asistida: su rendimiento en GPQA-Diamond (0,7626 en la variante MetaX) lo hace apto para responder preguntas de nivel posgrado en fisica, quimica y biologia como apoyo a investigadores.
- Despliegue sobre hardware no NVIDIA: el contenedor FlagOS-Metax y los scripts incluidos permiten levantar el servicio en dos MetaX C550 con vLLM en minutos, lo que resulta util para organizaciones con aceleradores alternativos a NVIDIA.
- Chatbot interno de empresa bilingue chino-ingles: con licencia Apache 2.0 y una API estandar, puede desplegarse en infraestructura propia para atencion interna sin coste de licencia.
- Prototipado rapido con AnythingLLM: la guia incluida permite conectar el modelo a un frontend de escritorio para pruebas de concepto sin desarrollo adicional.

## Benchmarks y rendimiento

Resultados de calidad publicados en la model card, comparando la variante MetaX-FlagOS con la variante NVIDIA original:

| Metrica | Nvidia-Origin | Metax-FlagOS |
|---|---|---|
| GPQA_Diamond | 0,8283 | 0,7626 |
| ERQA | 0,5875 | 0,59 |

Rendimiento de inferencia medido como ratio de computo equivalente (FlagOS/H100) con 64 peticiones concurrentes:

| Escenario | Ratio FlagOS/H100 |
|---|---|
| 1k&1k, 64 concurrencia | 136,94 % |
| 4k&1k, 64 concurrencia | 125,03 % |
| 16k&1k, 64 concurrencia | 113,468 % |
| 64k&1k, 64 concurrencia | 87,97 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 y 35,95B parametros, el modelo requiere aproximadamente 72 GB solo para pesos, mas cache KV y overhead; el repositorio ocupa 71,9 GB.
- Configuracion de referencia: 2 x MetaX C550 con tensor-parallel-size 2, `--gpu-memory-utilization 0.9` y `--max-num-seqs 64`.
- En GPUs NVIDIA, un modelo de este tamano en bf16 no cabe en una unica RTX 4090 (24 GB); seria necesario cuantizar a 4 bits (aproximadamente 18-20 GB) para una consumer GPU de gama alta, si bien no se documentan pesos GGUF en este repositorio.
- Para precision completa en NVIDIA se requieren configuraciones multi-GPU como 2 x A100 80 GB o 2 x H100 80 GB con tensor parallelism.
- Opciones de despliegue documentadas: vLLM 0.20.2 con el plugin vllm-plugin-fl y FlagGems sobre el contenedor FlagOS-Metax. No se mencionan llama.cpp, Ollama ni TGI para esta distribucion.
- Throughput: con 64 peticiones concurrentes, el stack FlagOS sobre MetaX alcanza entre el 88 % y el 137 % del rendimiento de una H100 segun la longitud de contexto, degradandose a medida que crece el contexto (64k).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (esta ficha, FlagOS-Metax) | 35,95B | ~3B | no disponible | Apache 2.0 | Optimizado para MetaX; GPQA-D 0,7626 |
| Qwen3.6-35B-A3B (Nvidia-Origin) | 35,95B | ~3B | no disponible | Apache 2.0 | Referencia original; GPQA-D 0,8283 |
| Qwen3.5-35B-A3B | no disponible | no disponible | no disponible | no disponible | Predecesor segun la model card |
| Qwen3.5-27B (denso) | 27B | 27B | no disponible | no disponible | Referencia densa citada por el autor |
| Gemma4-31B (denso) | 31B | 31B | no disponible | no disponible | Referencia densa citada por el autor |

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano no esta validado y probablemente sea inferior.
- Perdida de calidad respecto al original: GPQA-Diamond cae de 0,8283 a 0,7626 en la variante MetaX, una diferencia de 6,6 puntos porcentuales atribuible a la pila FlagOS.
- Rendimiento dependiente del contexto: el ratio frente a H100 baja del 137 % a 1k hasta el 88 % a 64k, por lo que cargas con contextos largos pueden quedar por debajo de la referencia NVIDIA.
- La distribucion omite el modulo MTP ("nomtp"), lo que puede reducir el throughput en decodificacion especulativa respecto al modelo original.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni tasas de alucinacion.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La longitud de contexto no se especifica en la model card, lo que impide planificar cargas de contexto largo con garantias.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenedor y el stack FlagOS se distribuyen desde un registro propio (harbor.baai.ac.cn) cuyos terminos de uso no se detallan.
- El modelo esta atado a la pila MetaX/MACA 3.7.0.38 y al driver 3.8.1; otras versiones pueden no ser compatibles.
- No se documenta soporte de tool calling nativo, lo que limita su uso directo en frameworks de agentes que dependan de function calling.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Qwen3.6-35B-A3B-nomtp-metax-FlagOS-Express
- AnythingLLM: https://anythingllm.com/
- Triton (usado por FlagGems): https://github.com/openai/triton
- No se proporcionan enlaces al paper, blog o repositorio del modelo original Qwen3.6-35B-A3B en la informacion disponible.
