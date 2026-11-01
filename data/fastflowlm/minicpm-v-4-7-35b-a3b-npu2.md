# FastFlowLM/MiniCPM-V-4.7-35B-A3B-NPU2

## Resumen

MiniCPM-V-4.7-35B-A3B-NPU2 es un paquete de pesos del modelo multimodal MiniCPM-V 4.7 35B-A3B de OpenBMB, reempaquetado por FastFlowLM para su ejecucion sobre la NPU XDNA 2 de los procesadores AMD Ryzen AI 300 y posteriores. No se trata de un modelo nuevo ni de un fine-tune: el autor declara explicitamente que el modelo, su licencia Apache-2.0 y su uso previsto son los del upstream, y que este repositorio solo redistribuye los pesos en el formato propietario `q4nx` que consume el motor FastFlowLM (FLM).

El modelo subyacente es el primer Mixture-of-Experts de la familia MiniCPM-V, con 35B parametros totales y aproximadamente 3B activos por token en una arquitectura de 256 expertos. Combina un codificador visual SigLIP con un transformer de lenguaje que incorpora capas de atencion lineal, lo que permite decodificacion sostenida en dispositivos con recursos limitados. La propuesta de valor es la eficiencia: el paquete ocupa unos 22 GB de memoria y alcanza entre 10,9 y 16,2 tokens/s de decodificacion en una APU Ryzen AI MAX+ PRO 395 con 128 GB.

La relevancia de esta ficha esta en que documenta una via de despliegue local de un MLLM de 35B en hardware consumer AMD, con servidor compatible con la API de OpenAI, tool calling, cache de prefijo y conmutador de razonamiento. Es un caso practico de inferencia on-device sin GPU dedicada, apoyado en las tecnicas LES (Lookahead Expert Scheduling) y cuantizacion por capas del ecosistema OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE de 256 expertos, atencion lineal en capas seleccionadas y torre visual SigLIP |
| Parametros totales | 35B |
| Parametros activos | Aproximadamente 3B por token (variante 35B-A3B) |
| Longitud de contexto | Hasta 32k tokens medidos en el benchmark de velocidad del paquete (no se declara un maximo oficial en la informacion disponible) |
| Tipos de cuantizacion | Formato propietario `q4nx`: cuerpo Q4_K, cabeza de salida Q8_0, embeddings/normas/router/proyecciones gate en BF16; torre visual en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.q4nx` (21,0 GB) y `vision_weight.q4nx` (1,1 GB); derivados de GGUF Q4_K_M y `mmproj-model-f16.gguf` |

## Arquitectura y entrenamiento

El modelo es un MLLM compuesto por una torre visual SigLIP y un modelo de lenguaje MoE de 256 expertos con 35B parametros totales y unos 3B activos. El codificador visual emplea la tecnica de compresion temprana intra-ViT de LLaVA-UHD v4, que reduce el coste de procesar imagenes de alta resolucion antes de que lleguen al modelo de lenguaje. El procesamiento de imagen combina una vista global con hasta 9 tiles, lo que acota el coste computacional independientemente de la resolucion de entrada. El modelo de lenguaje incluye capas de atencion lineal con dos proyecciones gate que el motor FastFlowLM lee en BF16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card del paquete no los detalla. La innovacion tecnica documentada es de inferencia, no de entrenamiento: Lookahead Expert Scheduling (LES), una planificacion anticipada de expertos que permite ejecutar un MoE de forma fluida en hardware limitado, combinada con cuantizacion fina por capas y muestreo especulativo DSpark. OpenBMB reporta con estas tecnicas 13+ tokens/s con solo 3 GB de memoria en un iPhone 17 Pro Max.

El reempaquetado de FastFlowLM parte del GGUF `MiniCPM-V-4_7-35B-A3B-Q4_K_M.gguf` (revision `cf943fbe`) y convierte con `FLM_Q4NX_Converter`. Los tensores Q4_K se repackan tal cual; los 61 tensores que el Q4_K_M mantiene en Q6_K (mitad de `attn_v` y `ffn_down`, algunos `attn_qkv`) se reajustan a Q4_K; la cabeza de salida pasa a Q8_0; y el embedding de tokens y la cabeza de salida se toman del checkpoint BF16 (revision `ee2d0a27`) en lugar de las copias cuantizadas del GGUF.

## Capacidades

- Comprension de imagen unica y multiple, con vista global mas hasta 9 tiles por imagen.
- Generacion de texto y razonamiento multimodal en conversaciones multi-turno.
- Tool calling / function calling, expuesto a traves del servidor compatible con OpenAI de FLM.
- Modo de razonamiento (thinking) conmutable mediante `enable_thinking`, desactivado por defecto segun recomienda la model card.
- Cache de prefijo para acelerar conversaciones repetidas sobre el mismo contexto.
- Comprension de video: la familia MiniCPM-V la soporta, pero este paquete NPU2 no la incluye.
- Entrada de audio: no soportada en este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente documental local con OCR y VQA: el modelo responde preguntas sobre documentos escaneados o capturas; el paquete obtiene 97,50 ANLS en DocVQA, lo que lo hace adecuado para extraccion de datos de facturas, formularios e informes sin enviar imagenes a la nube.
- Atencion al cliente con imagenes: un servidor compatible con OpenAI levantado con `flm serve` permite gestionar conversaciones multi-turno en las que el usuario adjunta capturas de producto, errores de aplicacion o recibos, con cache de prefijo para abaratar turnos repetidos.
- Automatizacion de escritorio y agentes locales: el soporte de tool calling y de razonamiento multi-paso permite encadenar llamadas a funciones del sistema (lectura de archivos, ejecucion de comandos) en un equipo Ryzen AI sin GPU dedicada.
- Analisis de imagenes medicas o tecnicas en entornos con requisitos de privacidad: al ejecutarse integramente en la NPU local, los datos no salen del dispositivo, lo que encaja en flujos donde no se permite subir imagenes a servicios externos.
- Prototipado de aplicaciones multimodales en portatiles AMD: con 22 GB de memoria y 10-16 tokens/s de decodificacion, sirve para iterar sobre prompts, plantillas de chat y flujos de agente antes de escalar a infraestructura mayor.
- Transcripcion y descripcion de contenido visual para accesibilidad: generacion de descripciones de imagenes en castellano (si el modelo las soporta; los idiomas no estan documentados) con latencia de primer token de 7,8 s a 720p, aceptable para procesos por lotes.
- Extraccion estructurada de datos de capturas y graficos: combinacion de tool calling con salida JSON para poblar bases de datos a partir de imagenes de dashboards o tablas.

## Benchmarks y rendimiento

Resultados publicados en la model card del paquete. Decodificacion greedy, sin muestreo. "BF16" corresponde al checkpoint upstream ejecutado con Hugging Face Transformers en CPU.

| Prueba | FastFlowLM (NPU) | llama.cpp Q4_K_M (mismo GGUF) | BF16 |
|---|---:|---:|---:|
| GSM8K, primeros 100 problemas, thinking off | 98 / 100 | 97 / 100 | 99 / 100 |
| DocVQA, 50 preguntas de validacion, ANLS | 97,50 | 97,42 | 97,42 |

GSM8K permite hasta 1024 tokens nuevos. Emparejado con el modelo BF16 en esos 100 problemas, el build NPU queda 1,0 punto por debajo (intervalo de confianza del 95 %: -2,4 a +4,4 puntos; 2 problemas solo los resuelve BF16 y 1 solo el build NPU). En 14 prompts fijos (texto, multi-turno, contexto largo, tool call, thinking y de una a cinco imagenes), el modelo cuantizado sigue la respuesta greedy del BF16 hasta el final en 7 de los 12 prompts comparables palabra por palabra y se desvia en 5; el Q4_K_M de llama.cpp se desvia en 6.

Velocidad en Ryzen AI MAX+ PRO 395, 128 GB, FastFlowLM 1.0.12, modo de energia por defecto (una sola ejecucion; el equipo es compartido, variacion esperada de ±15 %):

| Contexto | 1k | 2k | 4k | 8k | 16k | 32k |
|---|---:|---:|---:|---:|---:|---:|
| Prefill (tokens/s) | 148 | 219 | 278 | 288 | 284 | 269 |
| Decode (tokens/s, partiendo de ese contexto) | 16,2 | 16,1 | 15,2 | 14,6 | 13,1 | 10,9 |

Tiempo hasta el primer token con una imagen y el prompt "Describe this image.": 7,8 s a 720p, 9,1 s a 1080p, 8,8 s a 2K y 8,4 s a 4K (las imagenes mayores dejan de crecer por el limite de 9 tiles).

## Requisitos de hardware

- NPU XDNA 2 de procesadores AMD Ryzen AI 300 y posteriores; no funciona en GPU ni CPU convencionales con este paquete.
- Memoria: aproximadamente 22 GB, que corresponden al tamano del repositorio y de los pesos `q4nx`.
- Software: FastFlowLM 1.0.12 o superior.
- Hardware de referencia medido: Ryzen AI MAX+ PRO 395 con 128 GB.
- No cabe en GPUs consumer tipo RTX 4090 mediante este paquete; para esas GPUs habria que usar el GGUF original con llama.cpp u otro runtime.
- Despliegue: `flm run minicpm-v-4.7-moe:35b-a3b` para chat en terminal y `flm serve minicpm-v-4.7-moe:35b-a3b` para servidor compatible con OpenAI (imagenes, tools y thinking bajo peticion).
- Throughput medido: 10,9-16,2 tokens/s de decodificacion y 148-288 tokens/s de prefill segun contexto; latencia de primer token con imagen entre 7,8 y 9,1 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (este paquete, NPU2) | 35B totales / ~3B activos | Hasta 32k medidos | Apache-2.0 | HuggingFace, formato `q4nx` para FLM | Optimizado para NPU AMD; sin video ni audio |
| MiniCPM-V 4.7 35B-A3B (upstream) | 35B totales / ~3B activos | No disponible | Apache-2.0 | HuggingFace, pesos originales | Referencia BF16; soporta video; ejecutable en Transformers |
| Qwen3.6 35B-A3B | 35B totales / ~3B activos | No disponible | No disponible en la informacion | No disponible | Citado por OpenBMB como referencia: en modo Instruct, MiniCPM-V 4.7 35B-A3B logra mayor puntuacion global en menos tiempo de inferencia |
| llama.cpp Q4_K_M del mismo modelo | 35B totales / ~3B activos | No disponible | Apache-2.0 | GGUF en HuggingFace | Alternativa en CPU/GPU; misma calidad aproximada (97/100 en GSM8K, 97,42 ANLS en DocVQA) |

## Limitaciones y advertencias

- El paquete no soporta entrada de video ni de audio, a diferencia de la familia MiniCPM-V completa.
- Solo se ejecuta en la NPU XDNA 2 de AMD Ryzen AI 300 o posteriores mediante FastFlowLM; no es portable a otros runtimes sin reconvertir los pesos.
- La cuantizacion Q4_K introduce desviaciones medibles frente a BF16: 1 punto en GSM8K y divergencia en 5 de 12 prompts comparables palabra por palabra.
- Las cifras de velocidad proceden de una unica ejecucion en un equipo compartido, con variacion esperada de ±15 %.
- Los idiomas soportados no estan documentados; no hay garantia de calidad en castellano.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a la licencia y condiciones del upstream; conviene verificar la model card de OpenBMB antes de desplegar en produccion.
- El modo thinking esta desactivado por defecto; activarlo cambia el perfil de latencia y consumo de tokens.
- El contexto maximo no se declara oficialmente; las mediciones llegan a 32k, pero no debe asumirse como limite garantizado.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/FastFlowLM/MiniCPM-V-4.7-35B-A3B-NPU2
- Modelo upstream: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Repositorio FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- GitHub de MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- Repositorio llama.cpp-omni (tecnica LES): https://github.com/OpenBMB/llama.cpp-omni
- Repositorio LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
