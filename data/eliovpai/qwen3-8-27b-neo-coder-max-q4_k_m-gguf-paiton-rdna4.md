# EliovpAI/Qwen3.8-27B-NEO-CODER-MAX-Q4_K_M-GGUF-Paiton-RDNA4

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de ejecución: los artefactos y metadatos del runtime Paiton v1.1.0 (aproximadamente 28,4 MB en `overlay/`) que permiten servir el fine-tune NEO CODER MAX 27B en formato GGUF Q4_K_M sobre GPUs AMD RDNA4 mediante vLLM. Los pesos no se alojan aquí: se descargan del repositorio upstream fijado (unos 19,43 GB de pesos de lenguaje más el proyector de imagen del fine-tune de DavidAU, `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF`). Paiton añade ejecución compilada (kernels nativos HIP para lenguaje y visión, grafos de decodificación nativos) sin reentrenar ni recuantizar nada: los valores cuantizados originales se preservan.

El interés del paquete es doble. Por un lado, ofrece una vía para ejecutar un modelo de ~27B en cuantización Q4_K_M sobre una Radeon AI PRO R9700 (arquitectura `gfx1201`, 32 GB) con ROCm 7.14 y vLLM, exponiendo una API compatible con OpenAI para chat, completions, streaming y peticiones de imagen. Por otro lado, publica mediciones reproducibles frente a llama.cpp en la misma GPU: reducciones de latencia mediana del 6,4 %, 5,1 % y 0,8 % en tres cargas de 128 tokens de salida con 128, 1.024 y 4.096 tokens de entrada respectivamente.

Se trata de un modelo de propósito general orientado a código y conversación, con soporte de razonamiento tipo Qwen3 (controlable mediante `enable_thinking`) y de análisis de una imagen PNG/JPEG por petición. El perfil cualificado limita el contexto a 8.192 tokens totales (imagen y salida incluidos), una única secuencia activa y tensor parallelism 1. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Artefactos nativos HIP de lenguaje y vision sobre runtime Paiton; el contrato de ejecucion menciona estado GDN e incrustaciones de imagen en FP32, cabezal de salida BF16 y tensores MTP Q8_0 sin usar |
| Parametros totales | 27B nominales segun el identificador del modelo (no confirmado en la model card) |
| Parametros activos | No aplica / no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | 8.192 tokens totales (incluyendo tokens de imagen y de salida) en el perfil cualificado |
| Tipos de cuantizacion | GGUF Q4_K_M mixto: matrices Q4_K y Q6_K, coeficientes FP32, cabezal de salida BF16. En ejecucion: operandos de activacion Q8_1 en proyecciones grandes de decodificacion y FP16 con acumulacion FP32 en prefill; KV en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF. El repositorio publica solo el overlay del runtime (~28,4 MB); los pesos (~19,43 GB) se descargan del repositorio upstream fijado |
| Hardware cualificado | Radeon AI PRO R9700, `gfx1201`, 32 GB, TP1 |
| API | Compatible con OpenAI: chat, completions, streaming, razonamiento Qwen3 y parsing de tool calling de Qwen3 Coder |
| Entorno de ejecucion | Linux x86-64, Docker, ROCm 7.14 y vLLM, con acceso a dispositivos AMD (`/dev/kfd`, `/dev/dri`) |
| Fecha de creacion / actualizacion del repo | 2026-09-14 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base (no se detalla si es un transformer denso, hibrido o con atencion lineal). Los unicos indicios tecnicos son los que aparecen en el contrato de ejecucion: existen artefactos nativos HIP separados para lenguaje y vision, un estado denominado GDN y las incrustaciones de imagen que se mantienen en FP32, un cabezal de salida en BF16 y tensores MTP (multi-token prediction) en Q8_0 que estan presentes en el fichero pero no se utilizan. El perfil cualificado desactiva explicitamente MTP, el prefix caching y el procesamiento de video. La tokenizacion, la plantilla de chat, los tokens especiales y el comportamiento de parada provienen del repositorio original del autor.

No hay informacion sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni sobre el fine-tune de DavidAU mas alla de su nombre, que indica una fusion de tecnicas ("TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored") y un caracter declaradamente sin censura. El paquete aqui documentado no realiza ningun entrenamiento ni recuantizacion adicional: se limita a preservar los pesos GGUF publicados y a aportar la capa de ejecucion compilada. La unica validacion de fidelidad numerica publicada es una evaluacion de decodificacion Q8 en un conjunto reservado, con un incremento de perplejidad del 0,1301 % frente al control de decodificacion FP32 sobre 770 predicciones, dentro del limite preestablecido del 1 %.

## Capacidades

- Generacion de texto y codigo: el ejemplo de uso incluido resuelve tareas de programacion directas (por ejemplo, escribir una funcion en Python que elimine enteros duplicados preservando el orden).
- Razonamiento configurable: la plantilla de chat admite `chat_template_kwargs.enable_thinking`, de modo que el modo de razonamiento se activa o desactiva por peticion.
- Tool calling / function calling: se declara soporte de parsing de herramientas estilo Qwen3 Coder a traves de la API.
- Vision basica: pipeline `image-text-to-text`, admite una imagen PNG o JPEG por peticion, tanto por URL como en data URL base64, con hasta 1.024 incrustaciones de imagen.
- Conversacion multi-turno: formato de chat compatible con OpenAI sobre el endpoint `/v1/chat/completions`.
- Serving en streaming: soporte de respuestas en streaming con cifras de latencia medidas sobre la peticion HTTP completa.
- Generacion de codigo con contexto de hasta 8.192 tokens totales, suficiente para fragmentos de codigo medios y contexto de repositorio reducido.
- No se declaran capacidades de audio, video, agentes multi-paso autonomos ni soporte multilingue explicito.

## Casos de uso

- Asistencia de programacion en el IDE: el modelo puede resolver tareas de generacion y correccion de codigo (el ejemplo oficial es una funcion de deduplicacion de enteros) con contexto de hasta 8.192 tokens, adecuado para ficheros y fragmentos de tamano medio.
- Integracion en pipelines de CI/CD: gracias al endpoint compatible con OpenAI y al soporte de tool calling, se puede invocar desde scripts de revision automatica de parches o generacion de mensajes de commit sin adaptadores propietarios.
- Agentes de codificacion con herramientas: el parsing de tool calling de Qwen3 Coder permite construir flujos en los que el modelo decide que funcion invocar (busqueda en repositorio, ejecucion de tests, consulta de APIs) y encadena varios pasos.
- Soporte tecnico sobre capturas de pantalla: al aceptar una imagen PNG/JPEG por peticion, puede interpretar capturas de errores de compilacion, trazas en consola o interfaces para redactar una explicacion o un parche.
- Analisis de diagramas a codigo: subir un diagrama de arquitectura o un esquema UML en formato de imagen y obtener un esqueleto de clases o de infraestructura como punto de partida.
- Documentacion tecnica asistida: generar docstrings, guias de uso o explicaciones de fragmentos de codigo heredado a partir de entradas de texto o de una captura del editor.
- Servicios con requisitos de latencia medibles: para cargas de 128 tokens de salida, el paquete reporta medianas de 4,925 s (128 de entrada), 5,631 s (1.024) y 9,023 s (4.096), con p95 muy proximos a la mediana, lo que facilita dimensionar SLOs en ese perfil concreto.
- Razonamiento con coste controlado: desactivar `enable_thinking` en tareas simples de autocompletado y activarlo en tareas de depuracion compleja permite ajustar el consumo de tokens de salida por tipo de peticion.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K ni similares). Los unicos datos publicados son mediciones de latencia de extremo a extremo y comprobaciones acotadas de fidelidad. Condiciones: misma Radeon AI PRO R9700, GGUF fijado, mismo tokenizer, muestreo greedy, contexto de 8K, KV en BF16, una secuencia activa, recuentos de tokens fijos, un calentamiento y cinco peticiones medidas; los tiempos incluyen la peticion HTTP de streaming completa y el p95 se interpola sobre cinco muestras.

| Tokens entrada / salida | llama.cpp mediana / p95 (s) | Paiton + vLLM mediana / p95 (s) | Reduccion de latencia mediana |
|---|---:|---:|---:|
| 128 / 128 | 5,264 / 5,289 | 4,925 / 4,929 | 6,4 % |
| 1.024 / 128 | 5,933 / 5,936 | 5,631 / 5,637 | 5,1 % |
| 4.096 / 128 | 9,099 / 9,101 | 9,023 / 9,030 | 0,8 % |

| Metrica adicional | Resultado |
|---|---|
| Suite de tareas fija (11 tareas) | 10/11 en ambos motores, con el mismo fallo de traza de codigo |
| Fixtures de imagen y comprobaciones JPEG | 5 superadas |
| Evaluacion de decodificacion Q8 reservada | +0,1301 % de perplejidad frente al control FP32, sobre 770 predicciones (limite preestablecido: 1 %) |
| VRAM pico muestreada (Paiton) | 23,736 GiB |
| VRAM pico muestreada (llama.cpp) | 19,034 GiB |

Advertencias del propio autor: la comparacion es contra un llama.cpp funcional, no contra vLLM de stock; no demuestra ventaja de velocidad para cualquier prompt o despliegue; las peticiones de solo prefill, cortas y largas, favorecen a llama.cpp; y los motores usan aritmetica de activacion distinta, por lo que no se afirma salida identica bit a bit entre ellos.

## Requisitos de hardware

- GPU cualificada: Radeon AI PRO R9700 (`gfx1201`), 32 GB. Las GPUs mas pequenas no estan cualificadas.
- VRAM observada en el perfil medido: 23,736 GiB de pico con Paiton y 19,034 GiB con llama.cpp. Estas cifras incluyen asignaciones del runtime y no son garantias de VRAM minima.
- Pesos: aproximadamente 19,43 GB de pesos de lenguaje mas el proyector de imagen, descargados en el primer arranque y reutilizados desde cache en arranques posteriores, con verificacion de hashes.
- Sistema: Linux x86-64 con Docker, ROCm 7.14 y acceso a dispositivos AMD (`--device /dev/kfd --device /dev/dri --group-add video`).
- Despliegue recomendado: imagen `ghcr.io/eliovp/paiton-vllm-plugin` (digest `sha256:534287969135f581744ae481b578599468b0bf7ac9a4051b0941500e4c18da4d`), que ya incluye los artefactos del repositorio; tambien se pueden descargar por separado con `hf download` usando la revision `v1.1.0`.
- Comprobacion de servicio: `curl --fail http://127.0.0.1:8000/health` y endpoint `/v1/chat/completions` en el puerto 8000.
- Capacidad de servicio: una secuencia activa y TP1; las peticiones HTTP adicionales se encolan.
- Latencia de referencia (R9700, 8K de contexto, BF16 KV): 4,925 s de mediana para 128/128 tokens, 5,631 s para 1.024/128 y 9,023 s para 4.096/128.
- No se proporcionan datos de latencia ni de despliegue para otras GPUs, para CUDA, para Ollama, TGI o para vLLM sin el plugin de Paiton.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de modelos comparables (parametros, contexto, rendimiento o licencia) que permitan una comparativa de modelos. La unica comparacion disponible es la del motor de inferencia sobre el mismo modelo y la misma GPU.

| Alternativa comparada | Tipo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| llama.cpp (perfil medido) | Motor de inferencia, no modelo | No aplica | 8K en el perfil de prueba | Latencia mediana entre 0,8 % y 6,4 % superior a Paiton + vLLM en las tres cargas de 128 tokens de salida; favorece en casos de solo prefill | No aplica | Publico |
| vLLM de stock | Motor de inferencia | No aplica | No aplica | No comparado (la model card insiste en que la comparacion es contra llama.cpp) | No aplica | Publico |
| Modelos de ~27B con licencia Apache 2.0 | Modelos de lenguaje | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas, 0 likes y un tamano declarado de 0,0 GB: solo contiene el overlay del runtime, no los pesos. Cualquier uso requiere descargar previamente los pesos y el proyector desde el repositorio upstream fijado.
- La base es un fine-tune marcado como "uncensored" en su nombre. Cabe esperar una reduccion de los rechazos ante peticiones sensibles y un mayor riesgo de generar contenido danino o inapropiado; no hay evaluaciones de seguridad publicadas en la informacion disponible.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad, factualidad o robustez mas alla de la suite de 11 tareas (10/11, con el mismo fallo de traza de codigo en ambos motores).
- La unica validacion numerica publicada es una comprobacion acotada de decodificacion Q8 (+0,1301 % de perplejidad frente al control FP32 sobre 770 predicciones) y la suite de tareas. No constituyen una afirmacion amplia de precision.
- Contexto efectivo limitado a 8.192 tokens totales en el perfil cualificado, incluyendo tokens de imagen y de salida. No se especifica la ventana nativa del modelo base.
- Vision restringida: una unica imagen PNG/JPEG por peticion, hasta 1.024 incrustaciones de imagen y sin soporte de video.
- Capacidad de servicio limitada: una sola secuencia activa, TP1, MTP, prefix caching y video desactivados. No hay datos de throughput con concurrencia.
- Dependencia de hardware: solo esta cualificada la Radeon AI PRO R9700 de 32 GB con ROCm 7.14. No se garantiza funcionamiento en otras GPUs AMD ni en hardware NVIDIA.
- Idiomas soportados: no disponibles. No se puede asumir un comportamiento multilingue sin verificacion.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la licencia efectiva de los pesos subyacentes y del fine-tune upstream debe verificarse en su propio repositorio antes de un despliegue en produccion.
- El compilador empleado para generar los artefactos nativos es privado; no es necesario para ejecutar el paquete, pero limita la reproducibilidad completa de la compilacion.
- Los metadatos registran fechas de creacion y actualizacion de 2026-09-14, coherentes con un paquete publicado muy recientemente y con soporte de terceros aun sin validar.
- No hay datos publicados sobre sesgos demograficos o de dominio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EliovpAI/Qwen3.8-27B-NEO-CODER-MAX-Q4_K_M-GGUF-Paiton-RDNA4
- Fine-tune upstream (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Contrato completo de modelo y aritmetica: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3.8-NEO-CODER-MAX/README.md
- Resultados completos de texto e imagen, comprobaciones de calidad y reproduccion: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3.8-NEO-CODER-MAX/BENCHMARKS.md
- Ejemplo de peticion con imagen: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3.8-NEO-CODER-MAX/IMAGE_API.md
- Imagen de contenedor del plugin de vLLM: ghcr.io/eliovp/paiton-vllm-plugin@sha256:534287969135f581744ae481b578599468b0bf7ac9a4051b0941500e4c18da4d
