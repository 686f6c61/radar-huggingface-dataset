# Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Fast

## Resumen

Qwopus3.8-27B-Coder-Flash-MLX-Fast es una cuantizacion experimental en formato MLX del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un transformer de 27.356.728.560 parametros (unos 27,36 mil millones) especializado en generacion de codigo y uso de herramientas. Lo publica el usuario Shiftedx y esta pensado para ejecucion local en Apple Silicon mediante la libreria MLX, no para servidores CUDA convencionales. La variante Fast prioriza menor huella de memoria y mayor velocidad de decodificacion frente a la variante Balanced del mismo autor.

El modelo parte de una base etiquetada como qwen3_5, con soporte de vision en BF16 y proyecciones de compuerta recurrentes (MTP) conservadas en BF16, lo que sugiere una arquitectura hibrida con atencion completa y recurrente. La cuantizacion es de precision mixta: cuerpo en 3 y 4 bits con grupos de 64 elementos, atencion completa y recurrente a 4 bits, embeddings y cabeza de salida a 8 bits, y promociones selectivas de capas MLP segun su sensibilidad. El resultado ocupa 16,59 GB de pesos y admite contextos de 64K y 128K tokens.

Su relevancia ahora es doble: por un lado demuestra que un modelo de codigo de 27B puede caber y decodificar a velocidades utiles (hasta 82,4 tok/s con cache en 64K) en un equipo de consumo con GPU integrada de 40 nucleos y 64 GiB de memoria unificada; por otro, incluye una edicion experimental de la direccion de rechazo (refusal-direction edit) aplicada a las salidas de atencion de las capas 10 a 17, con fuerza 0,5, cuya fidelidad respecto al BF16 original no esta verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y recurrente, base qwen3_5; vision en BF16 y MTP nativo |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64K y 128K tokens (prompt y salida comparten el limite) |
| Tipos de cuantizacion | Precision mixta: 3-bit/4-bit con grupo de 64 en el cuerpo; atencion completa y recurrente a 4 bits; embeddings y cabeza a 8 bits; 96 proyecciones de compuerta recurrentes, vision y MTP en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 16,6 GB; pesos de 16,59 GB) |

## Arquitectura y entrenamiento

La ficha del autor no detalla el proceso de entrenamiento del modelo base, por lo que no hay datos disponibles sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se describe es la arquitectura de la cuantizacion: un cuerpo con capas en 3 y 4 bits agrupadas de 64 en 64, atencion completa y recurrente a 4 bits, y embeddings y cabeza de salida a 8 bits, con promociones de capas MLP ordenadas por sensibilidad. Se conservan en BF16 96 proyecciones de compuerta recurrentes, el tokenizador y la plantilla del publicador, la torre de vision y el mecanismo nativo de prediccion multi-token (MTP).

La innovacion tecnica mas destacable es la integracion de decodificacion especulativa: el modelo soporta MTP nativo con profundidades 1 a 3 y un borrador externo DFlash2 (incoai/Qwen3.8-27B-DFlash2). Segun las pruebas del autor, ambas tecnicas coincidieron con la generacion greedy simple en 4 de 4 sondas de texto. Ademas, se aplico una edicion experimental de la direccion de rechazo con fuerza 0,5 sobre las salidas de atencion de las capas 10 a 17; el autor advierte que la reduccion de rechazos y la fidelidad respecto al BF16 no estan verificadas. La conversion se hizo desde los pesos BF16 fijados del modelo base Apache 2.0 mediante carga en streaming.

## Capacidades

- Generacion de texto y codigo: el modelo esta especializado en tareas de programacion, con soporte de plantilla de chat y modo thinking desactivable.
- Uso de herramientas (tool calling): pasa las pruebas de herramientas del autor en contextos de 64K y 128K.
- Razonamiento multi-paso y agentes: soporta conversaciones multi-turno con contexto largo, hasta 128K tokens compartidos entre prompt y salida.
- Recuperacion en contexto largo: supera las pruebas de retrieval a 64K (61.441 tokens de prompt) y 128K (126.976 tokens de prompt).
- Vision: incluye torre de vision en BF16; en ocho preguntas con imagen, el JSON normalizado coincidio en 7 de 8 casos, aunque el JSON estricto sin vallas coincidio en 0 de 8.
- Decodificacion especulativa: MTP nativo con profundidades 1 a 3 y borrador DFlash2, ambos con resultados identicos a greedy en las pruebas de texto.
- Multilingue: solo ingles y chino declarados.
- Generacion con cache: mantiene velocidades de decodificacion de 82,4 tok/s en 64K y 63,7 tok/s en 128K con cache activa.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: el modelo cabe en 16,59 GB y decodifica a 82,4 tok/s con cache en 64K en un M4 Max de 64 GiB, lo que permite autocompletado y chat de codigo sin conexion ni coste por token.
- Revision de repositorios y recuperacion sobre bases de codigo grandes: con 128K tokens de contexto puede ingerir varios ficheros y responder preguntas cruzadas; las pruebas de retrieval a 126.976 tokens de prompt confirman que la ventana es funcional.
- Automatizacion de pipelines CI/CD con tool calling: el soporte de herramientas verificado a 64K y 128K permite encadenar llamadas a APIs de build, test y despliegue dentro de un agente.
- Extraccion estructurada de datos a partir de imagenes: con la torre de vision puede transcribir capturas o diagramas a JSON; conviene normalizar y validar el esquema porque el JSON estricto fallo en todas las pruebas del autor.
- Prototipado de agentes multi-paso en estaciones Apple Silicon: la combinacion de MTP nativo y DFlash2 acelera la decodificacion (101,8 tok/s con DFlash2 en pruebas cortas) sin cambiar la salida respecto a greedy.
- Servicio de chat interno con privacidad de datos: el despliegue con Kapitsa en modo `--private --local` y cache de disco desactivada mantiene las conversaciones en el equipo, adecuado para entornos con requisitos de confidencialidad.
- Evaluacion de tecnicas de cuantizacion agresiva: util como banco de pruebas para medir la perdida de calidad de un cuerpo en 3/4 bits frente al BF16 original en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta pruebas internas de capacidad y latencia:

| Prueba | Resultado |
|---|---|
| Smoke de codigo (8 tareas) | 5/8 ejecutables; fallos en campos vacios finales de CSV, planificacion de intervalos ponderados y semantica de cache TTL |
| Retrieval 64K | Superado (61.441 tokens de prompt) |
| Retrieval 128K | Superado (126.976 tokens de prompt) |
| Herramientas y codigo con cache | Superado en 64K y 128K |
| MTP nativo (profundidades 1-3) vs greedy | 4/4 sondas identicas |
| DFlash2 vs greedy | 4/4 sondas identicas |
| Vision, JSON normalizado | 7/8 |
| Vision, JSON estricto sin vallas | 0/8 |

| Rendimiento local (M4 Max 40 nucleos, 64 GiB) | 64K | 128K |
|---|---:|---:|
| Tokens de prompt | 61.441 | 126.976 |
| Turno en frio | 194,00 s | 580,07 s |
| Decodificacion de codigo con cache | 82,4 tok/s | 63,7 tok/s |

En pruebas cortas de codigo y prosa con Kapitsa 0.2.31 en el mismo equipo: 29,0 tok/s en modo simple, 63,7 tok/s con MTP3 y 101,8 tok/s con DFlash2.

## Requisitos de hardware

- Memoria: los pesos ocupan 16,59 GB; con contexto de 128K y cache KV conviene disponer de al menos 32 GB de memoria unificada, y 64 GiB es la configuracion en la que el autor valido el modelo.
- GPU: disenado para Apple Silicon mediante MLX; el autor lo probo en un M4 Max con GPU de 40 nucleos. No hay datos de ejecucion en A100, H100 ni RTX 4090, y el formato MLX no es compatible directamente con CUDA.
- GPU de consumo: cabe en equipos Apple con memoria unificada de 32 GB o mas; no se ha validado en GPUs discretas de consumo.
- Despliegue: servidor Kapitsa (version 0.2.27 o superior) con soporte de DFlash2 y MTP; descarga mediante `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato MLX concreto.
- Latencia: turno en frio de 194 s a 64K y 580 s a 128K; decodificacion de 82,4 tok/s (64K) y 63,7 tok/s (128K) con cache; DFlash2 alcanza 101,8 tok/s en prompts cortos.
- Parametros de inferencia recomendados: temperatura 0, top_p 1, top_k 0 y `enable_thinking: false` en `/v1/chat/completions`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-MLX-Fast (este) | 27,36B | 64K/128K | 3/4 bits mixta MLX | Apache 2.0 | Hugging Face, MLX |
| Qwopus3.8-27B-Coder-Flash-MLX-Balanced | 27,36B (misma base) | 64K/128K | Mixta MLX, mayor precision | Apache 2.0 | Hugging Face, MLX |
| Jackrong/Qwopus3.8-27B-Coder-Flash (BF16) | 27,36B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx | no disponible | no disponible | MXFP4 | no disponible | Hugging Face, MLX |

La variante Balanced del mismo autor obtiene mejor puntuacion de codigo local a cambio de mas memoria y menor velocidad de decodificacion, segun la propia ficha. El BF16 original es la referencia de fidelidad, pero no se publican sus resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Modelo experimental: el autor etiqueta la publicacion como experimental y no garantiza la fidelidad respecto al BF16 original.
- Edicion de rechazo no verificada: la modificacion de la direccion de rechazo en las capas 10-17 puede alterar el comportamiento del modelo de formas no medidas; solo se probaron texto, imagen fija y MTP corto, sin pruebas de contexto largo con MTP.
- Alucinacion y errores de codigo: el smoke de codigo fallo en 3 de 8 tareas (CSV, planificacion de intervalos y cache TTL), lo que indica errores en casos limite de semantica.
- Salida JSON fragil: el JSON estricto sin vallas fallo en 8 de 8 preguntas de vision; es necesario eliminar vallas y validar el esquema, y el autor detecto un array espacial anidado incorrecto.
- Idiomas limitados: solo ingles y chino; no hay soporte declarado de castellano.
- Contexto compartido: prompt y salida comparten el limite de 64K o 128K, lo que reduce el espacio efectivo para la respuesta en conversaciones largas.
- Dependencia de herramienta externa: DFlash2 es un modelo separado que hay que descargar aparte; sin el, la decodificacion especulativa se limita al MTP nativo.
- Plataforma: el formato MLX solo se ejecuta en Apple Silicon; no hay pesos GGUF ni compatibilidad con ecosistemas CUDA.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la verificacion de calidad y de sesgos por su cuenta, ya que no hay evaluaciones publicadas de sesgo.
- Sin datos de benchmarks estandar: no es posible comparar su calidad con otros modelos de codigo mediante MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Fast
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash/tree/c7d46e5dadf43ab838f2d594839805b2c2f6ccd3
- Variante Balanced: https://huggingface.co/Shiftedx/Qwopus3.8-27B-Coder-Flash-MLX-Balanced
- Borrador DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Servidor Kapitsa v0.2.27: https://github.com/nace-ai/kapitsa/tree/v0.2.27
- Variante v2 MXFP4 con vision y MTP: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx/tree/main
- Variante abliterated MXFP4: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-abliterated-mxfp4-vision-mtplx/tree/main
