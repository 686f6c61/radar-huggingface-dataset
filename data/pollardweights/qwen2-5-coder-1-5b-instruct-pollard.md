# PollardWeights/Qwen2.5-Coder-1.5B-Instruct-Pollard

## Resumen

El modelo `PollardWeights/Qwen2.5-Coder-1.5B-Instruct-Pollard` es una cuantización GGUF del modelo original `Qwen/Qwen2.5-Coder-1.5B-Instruct`, desarrollada por Pollard Weights mediante su herramienta de cuantización homónima. Se trata de un modelo denso de aproximadamente 1,54 mil millones de parámetros con arquitectura `qwen2` (28 capas), especializado en generación y completado de código, que mantiene las capacidades conversacionales del instruct original.

La relevancia de este modelo reside en su optimización para entornos con memoria limitada: las tres variantes GGUF ocupan entre 0,86 GB y 1,25 GB, lo que permite ejecutar completado de código local en equipos de gama baja o en portátiles con aceleración Metal. El autor reporta velocidades de 70 a 93 tokens por segundo en un Apple M4 con 16 GB de RAM. La cuantización emplea una matriz de importancia (imatrix) calculada sobre un corpus mixto de prosa y código, y mantiene en alta precisión los tensores sensibles (embeddings, atención, normas y cabeza de salida) mientras comprime el grueso de las capas FFN.

El modelo hereda la licencia Apache-2.0 del modelo base y está disponible únicamente en formato GGUF, lo que lo hace compatible con cualquier runtime basado en llama.cpp, incluidos Ollama, LM Studio y koboldcpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2` (28 capas, densa) |
| Parametros totales | ~1,54 B |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32 768 tokens (heredado del modelo base) |
| Tipos de cuantizacion | IQ4_XS (0,86 GB), Q5_K_M (1,12 GB), Q6_K (1,25 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3 archivos) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen2.5-Coder, con 28 capas y arquitectura `qwen2` estandar. No es un modelo MoE, por lo que todos los parametros estan activos en cada pasada. El modelo original fue entrenado por el equipo Qwen de Alibaba con un dataset de codigo y texto, e incluye soporte para fill-in-the-middle (FIM) mediante tokens especiales (`<|fim_prefix|>`, `<|fim_suffix|>`, `<|fim_middle|>`) y para completado a nivel de repositorio con los separadores `<|repo_name|>` y `<|file_sep|>`.

La contribucion tecnica de PollardWeights es la cuantizacion adaptativa: en lugar de aplicar una unica precision a todos los tensores, el metodo preserva alta precision en embeddings, atencion (q/k/v/o), normas y cabeza de salida, mientras concentra la compresion en el bloque FFN. Ademas, el proceso esta guiado por una matriz de importancia (imatrix) calculada sobre un corpus mixto de prosa y codigo fuente. No se ha medido perplexity ni divergencia KL; la verificacion se realizo mediante generacion de codigo en vivo y mediciones de throughput.

## Capacidades

- Generacion de texto y codigo: responde a instrucciones en formato ChatML, con soporte para chat multi-turno.
- Completado de codigo fill-in-the-middle (FIM): puede rellenar el cuerpo de una funcion o bloque dado un prefijo y un sufijo, usando los tokens FIM de Qwen2.5-Coder.
- Completado a nivel de repositorio: soporta los separadores `<|repo_name|>` y `<|file_sep|>` para contexto de multiples archivos.
- Razonamiento basico y matematicas: como modelo instruct de 1,5 B, resuelve problemas simples de logica y calculo, aunque con limitaciones propias de su tamano.
- Multilingue limitado: aunque la ficha indica idioma `en`, el modelo base Qwen2.5-Coder tiene capacidad multilingue limitada; la cuantizacion no anade ni elimina idiomas.
- Ejecucion local eficiente: gracias a su tamano reducido y a las cuantizaciones disponibles, puede ejecutarse en CPU, en Apple Silicon con Metal, o en GPUs con poca VRAM.

## Casos de uso

- Completado de codigo en editores locales: el modelo puede integrarse en VS Code o Neovim mediante el protocolo de llama.cpp o continue.dev, ofreciendo autocompletado FIM con latencia de decenas de milisegundos en un Mac M4 (93 tok/s con IQ4_XS).
- Asistente de codigo para entornos offline: ideal para equipos que trabajan en redes aisladas o con politicas de privacidad que prohiben el envio de codigo a APIs externas; el modelo completo ocupa menos de 1,3 GB y se ejecuta en un portatil.
- Educacion y aprendizaje de programacion: como modelo instruct, puede generar explicaciones y ejemplos de codigo, servir como tutor para estudiantes que practican en local y no dependen de conexion.
- Generacion de tests unitarios en CI: con tool calling no soportado, pero con generacion directa de codigo, puede producir funciones de prueba para proyectos pequenos, ejecutandose como paso de una pipeline en un runner con poca RAM.
- Prototipado rapido de scripts: para tareas de automatizacion, generacion de scripts de bash, python o SQL, el modelo responde en un solo paso y se puede invocar via `llama-cli` con `-st` para generar solo la funcion solicitada.
- Aplicaciones de chat con contexto largo en dispositivos de gama baja: con 32K tokens de contexto, puede mantener conversaciones largas o procesar documentacion extensa, aunque la calidad de razonamiento se degrada con el contexto, como es habitual en modelos de este tamano.
- Despliegue en servidores de inferencia ligeros: `llama-server` expone una API compatible con OpenAI en el puerto 8080, permitiendo sustituir un servicio de completado de codigo en entornos de pruebas o edge computing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta valores de MMLU, HumanEval ni GSM8K. El autor verifica la calidad mediante generacion de codigo en vivo y medicion de throughput en un Apple M4 Mac Mini (16 GB), con los siguientes resultados:

| Variante | Tamano | Tok/s (Apple M4) |
|---|---|---|
| IQ4_XS | 0,86 GB | 93,0 |
| Q5_K_M | 1,12 GB | 71,2 |
| Q6_K | 1,25 GB | 72,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,86 GB y 1,25 GB segun la cuantizacion, mas overhead del runtime y contexto. En un sistema con 4 GB de VRAM o RAM compartida es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, Intel Arc, etc.); tambien funciona en Apple Silicon con Metal (probado en M4) y en CPU sola con llama.cpp.
- Cabe en consumer GPU: si, incluso en las mas modestas; el modelo Q5_K_M recomendado ocupa 1,12 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, koboldcpp, ramalama, Jan, Text Generation WebUI, LoLLMs.
- Latencia y throughput: 71-93 tok/s en Apple M4 segun la variante; en GPU dedicada se esperan cifras superiores, aunque no se han publicado mediciones.
- No requiere GPU para funcionar: puede ejecutarse solo en CPU con llama.cpp, aunque la velocidad sera menor (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (original) | ~1,54 B | 32K | safetensors | Apache-2.0 | No aplica |
| PollardWeights Qwen2.5-Coder-1.5B-Instruct-Pollard | ~1,54 B | 32K | GGUF (3 variantes) | Apache-2.0 | IQ4_XS, Q5_K_M, Q6_K |
| Qwen2.5-Coder-1.5B-Instruct (otras cuantizaciones GGUF de la comunidad) | ~1,54 B | 32K | GGUF | Apache-2.0 | Q4_K_M, Q5_K_M, etc. |

La diferencia principal frente a otras cuantizaciones GGUF del mismo modelo base es la metodologia de Pollard (imatrix + precision selectiva por tensor) y la verificacion explicita de throughput en M4. No se dispone de datos de benchmarks comparativos con otras cuantizaciones en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano reducido: con 1,54 B de parametros, el modelo tiene limitaciones de razonamiento complejo, matematicas avanzadas y generacion de codigo largo; es adecuado para completado y tareas simples, no para agentes autonomas.
- Idioma: la model card indica unicamente `en`; el modelo base Qwen2.5-Coder tiene soporte multilingue limitado, pero no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o inventar funciones o APIs; la verificacion de la model card solo cubre un caso de ejemplo (`is_prime`).
- Sin soporte de tool calling: el modelo base no incluye tool calling ni function calling; no se puede usar para agentes que necesiten invocar herramientas externas.
- Sin speculative decoding: no se ha implementado decodificacion especulativa en esta cuantizacion.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero hay que conservar la atribucion al modelo base (Qwen) y a la cuantizacion (PollardWeights).
- Contexto largo: aunque soporta 32K tokens, la calidad de atencion en contextos largos en modelos de 1,5 B se degrada notablemente; se recomienda no exceder los 8-16K para tareas de codigo.
- Velocidad en CPU sin Metal: los 71-93 tok/s se midieron en Apple M4 con Metal; en CPU x86 sin aceleracion, la velocidad sera significativamente menor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PollardWeights/Qwen2.5-Coder-1.5B-Instruct-Pollard
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Herramienta Pollard Weights: https://github.com/WestWaters/pollard-weights
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp
- Informe tecnico de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v3
