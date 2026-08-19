# Chungulus/Qwen3.8-27B-Q5_K_M-GGUF

## Resumen

Qwen3.8-27B es un modelo de visión-lenguaje (VLM) denso de 27 320 millones de parámetros desarrollado por Qwen (Alibaba), publicado bajo licencia Apache-2.0. Este repositorio contiene una cuantización GGUF en formato Q5_K_M realizada por Chungulus, sin modificaciones sobre los pesos originales (cuantización vanilla, no un fine-tune). El modelo combina un codificador de visión, un proyector multimodal y un núcleo de lenguaje con arquitectura híbrida que mezcla atención completa y capas Gated DeltaNet, e incorpora tensores MTP (multi-token prediction) para aceleración especulativa, aunque el autor no publicita su uso en esta versión.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B con capacidades de visión, razonamiento configurable y tool calling en hardware de consumo con aproximadamente 24 GB de memoria, algo inviable con los pesos originales en FP16 (que requieren más de 54 GB). El contexto arquitectónico declarado por fuentes externas es de 256K-262K tokens, aunque el autor de la cuantización solo valida prompts de hasta 73 tokens, por lo que el límite real en esta versión no está confirmado. Es una opción atractiva para desarrolladores que necesitan un VLM local con contexto muy largo y capacidades de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con atención completa + capas Gated DeltaNet, con codificador de visión y proyector multimodal (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 27 320 697 856 (27,32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens segun fuentes externas (Unsloth indica 256K); no verificado en esta cuantizacion (maximo validado: 73 tokens) |
| Tipos de cuantizacion | Q5_K_M (este repositorio); el modelo base tambien disponible en otros formatos |
| Idiomas soportados | No disponible (el modelo base de Qwen suele ser multilingue, pero no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q5_K_M) + mmproj en F16; el modelo original usa safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-27B es hibrida: combina capas de atencion completa con capas Gated DeltaNet, una variante de SSM (state space model) que reduce el coste computacional en secuencias largas. El modelo incluye un codificador de vision (333 tensores de vision en la cuantizacion) y un proyector multimodal que permite entrada de imagenes y video. Ademas, incorpora tensores MTP (multi-token prediction) que en teoria permiten decodificacion especulativa, aunque el autor de esta cuantizacion no publicita su uso y recomienda no asumir aceleracion por esa via.

La cuantizacion Q5_K_M se realizo con llama.cpp (revision `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) usando cuantizacion K/IQ sin calibracion para los K-quants. Los pesos fuente estan fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original. No se dispone de informacion publica sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). Esta cuantizacion no altera el chat template ni los controles de razonamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) del modelo original.

## Capacidades

- Generacion de texto y chat conversacional con plantilla de chat preservada del modelo original.
- Razonamiento configurable: soporta modos de pensamiento (thinking) con control de esfuerzo (`reasoning_effort`) y preservacion del pensamiento (`preserve_thinking`).
- Comprension de imagenes: el modelo acepta entrada de imagenes y puede describirlas, responder preguntas visuales y realizar tareas de vision-language.
- Procesamiento de video: la model card indica que las pruebas de vision y video pasaron los tres casos deterministicos de imagen local.
- Tool calling / function calling: validado con los cinco casos de formato nativo de Qwen.
- Capacidades de agente: gracias al contexto largo y al tool calling, puede ejecutar tareas multi-paso con herramientas.
- Generacion de codigo: el modelo base esta orientado a tareas de codificacion agente, segun fuentes externas (Unsloth, LM Studio).
- Soporte multilingue: no confirmado en esta cuantizacion, pero el modelo base de Qwen suele cubrir multiples idiomas.

## Casos de uso

- Asistente de codigo con contexto largo: el modelo puede mantener conversaciones de programacion con archivos completos en contexto (hasta 262K tokens), lo que permite revisar repositorios enteros o documentacion extensa antes de generar codigo.
- Analisis de documentos con imagenes: gracias a la entrada de vision, puede extraer informacion de capturas de pantalla, diagramas, graficos o documentos escaneados dentro de un flujo de trabajo de RAG multimodal.
- Automatizacion de atencion al cliente: con tool calling y contexto largo, puede gestionar conversaciones multi-turno consultando bases de conocimiento, creando tickets o escalando a un humano cuando sea necesario.
- Agente de automatizacion de tareas: combinado con herramientas externas (APIs, ejecucion de comandos), puede planificar y ejecutar tareas de varias etapas, como organizar archivos, enviar correos o actualizar registros, gracias a su razonamiento configurable.
- Analisis de video para vigilancia o revision de contenido: el modelo acepta entrada de video (segun la model card), permitiendo resumir o buscar eventos en secuencias de video con prompts en lenguaje natural.
- Prototipado rapido de aplicaciones VLM en local: al caber en una GPU de 24 GB, es util para desarrollo y pruebas de aplicaciones de vision-lenguaje sin depender de APIs en la nube, con la ventaja de la licencia Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es una velocidad de generacion de 11,98 tokens/s en el host de validacion del autor, pero no se especifican las caracteristicas de ese hardware ni las condiciones de la prueba.

## Requisitos de hardware

- Memoria recomendada: aproximadamente 24 GB disponibles para el modelo (19,5 GB de pesos), el proyector de vision (0,94 GB) y overhead de runtime. La memoria total necesaria crece con el tamano de la cache KV al aumentar el contexto.
- GPU recomendadas: tarjetas con 24 GB de VRAM o mas, como RTX 4090, RTX 3090, A100 40GB, o configuraciones multi-GPU. En teoria podria ejecutarse con 16 GB si se reduce el contexto, pero no esta validado.
- CPU: es posible ejecutar el modelo en CPU pura con llama.cpp, aunque la velocidad seria mucho menor (el autor valido en un host con Metal, sugiriendo macOS con GPU unificada).
- Opciones de despliegue: llama.cpp (con `llama-mtmd-cli` para multimodal), Ollama, LM Studio, y otros runtime compatibles con GGUF que soporten la arquitectura hibrida y el proyector de vision.
- Latencia y throughput: 11,98 tokens/s medidos en el host de validacion del autor (sin especificar hardware). Para produccion, se recomienda usar un servidor con vLLM o TGI si se dispone de los pesos en safetensors, aunque esta cuantizacion GGUF esta orientada a despliegue local con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,32B | 262K | Si | Apache-2.0 | safetensors |
| Qwen3.8-27B Q5_K_M (este repo) | 27,32B | 262K (no verificado) | Si | Apache-2.0 | GGUF |
| Qwen3.8-2.4T-A95B | 2,4T totales, 95B activos (MoE) | 262K (segun fuentes) | No confirmado | Apache-2.0 | safetensors |
| Qwen2.5-VL-32B | 32B | 128K | Si | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, etc.) en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de disponibilidad. La principal diferencia frente a Qwen2.5-VL-32B es el contexto mas largo (262K vs 128K) y la arquitectura hibrida, que puede ofrecer mejor eficiencia en secuencias largas, aunque esto no esta medido en esta cuantizacion.

## Limitaciones y advertencias

- La cuantizacion Q5_K_M puede degradar la calidad de las respuestas frente a los pesos originales en FP16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El contexto maximo real no esta verificado: el autor solo valido prompts de hasta 73 tokens, por lo que no se garantiza el funcionamiento correcto en los 262K tokens declarados por fuentes externas.
- El runtime debe soportar la arquitectura hibrida completa (Gated DeltaNet + atencion), el codificador de vision, el proyector y los metadatos MTP. No basta con cargar solo el tensor de lenguaje.
- La velocidad de generacion medida (11,98 tokens/s) es de un host especifico y no representa un rendimiento generalizable.
- No se han publicado benchmarks oficiales para esta cuantizacion ni para el modelo base en la informacion disponible, por lo que las capacidades reales en tareas estandar no estan cuantificadas.
- Los idiomas soportados no estan documentados en la model card, lo que puede afectar a aplicaciones multilingues.
- El modelo puede alucinar, especialmente en tareas de vision con imagenes ambiguas o de baja resolucion, como es habitual en VLM.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero es responsabilidad del usuario verificar el cumplimiento de la licencia del modelo base original.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/Chungulus/Qwen3.8-27B-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF combinado del mismo autor: https://huggingface.co/Chungulus/Qwen3.8-27B-MTP-GGUF
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
