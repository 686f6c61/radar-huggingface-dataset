# pendraga/Qwen3.8-Flash-Next-GB10-vLLM-524k

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una capa de despliegue reproducible sobre el checkpoint FP4 de NVIDIA (`nvidia/Qwen3.8-Flash-Next-FP4-Local`), derivado a su vez del modelo base Qwen3.8-Flash-Next de Alibaba. El autor, `pendraga`, parte de la receta de `diffbot` para DGX Spark y añade una configuración de vLLM con b12x que extiende la ventana de contexto hasta 524.288 tokens mediante YaRN ×2 sobre los 262.144 nativos, además de una política de reinicio, un nombre de modelo único para front-ends de chat y una batería de pruebas independiente medida en una segunda unidad GB10.

El interés práctico es la ingeniería de serving: demuestra que un modelo multimodal de gran tamaño con decoding especulativo (MTP) puede servirse en una única caja GB10 de 128 GB con cuantización NVFP4, alcanzando 78-79 tok/s en código y 65 tok/s en modo thinking, con un pool de KV de aproximadamente 1,0 M tokens en FP8 al 80 % de memoria de GPU. El repositorio no redistribuye pesos ni parches: `download.sh` los descarga en la revisión fijada.

La licencia del repositorio es MIT, pero los pesos subyacentes quedan sujetos al NVIDIA Open Model Agreement y a la Qwen Community License 1.0, lo que condiciona el uso comercial como servicio. Es relevante ahora porque documenta con mediciones concretas un patrón de despliegue de contexto largo en hardware de escritorio profesional, un escenario hasta hace poco reservado a clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y decoding especulativo MTP; pesos en NVFP4, serving con vLLM y kernels b12x |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el autor no publica el recuento de expertos activos) |
| Longitud de contexto | 524.288 tokens (YaRN ×2 sobre 262.144 nativos); configurable a 262.144 sin YaRN |
| Tipos de cuantizacion | NVFP4 para pesos; caché KV en FP8 |
| Idiomas soportados | no disponible en la informacion proporcionada (se miden inglés, alemán y código) |
| Licencia | MIT para scripts y tests del repositorio; pesos bajo NVIDIA Open Model Agreement y modelo base bajo Qwen Community License 1.0 |
| Formato de pesos | no disponible (checkpoint FP4 de NVIDIA descargado por `download.sh`; no se redistribuye en el repo) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) según la nomenclatura del checkpoint de NVIDIA, servido con cuantización NVFP4 de pesos y caché KV en FP8. El stack de inferencia combina vLLM con los kernels b12x (local-inference-lab, FlashInfer) sobre la imagen `eugr/spark-vllm-b12x`, fijada por digest. El decoding especulativo usa el módulo MTP (multi-token prediction) del propio modelo como draft, con la longitud de draft pasada explícitamente en `--speculative-config` para evitar el aborto del kernel QSA cuando la secuencia supera el límite configurado por el draft.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base Qwen3.8-Flash-Next, ya que la model card del repositorio se centra exclusivamente en el despliegue. La innovación documentada es de serving: extensión estática de contexto con YaRN, ajuste del límite del draft MTP, nombre de modelo servido único y una suite de pruebas (decoding, concurrencia, calidad NLL, visión, prefix cache, fidelidad en contexto largo y GSM8K) ejecutable contra cualquier servidor compatible con la API de OpenAI.

## Capacidades

- Generación de texto y prosa en inglés con 46 tok/s medidos en streaming (excluyendo TTFT, 512 tokens, temperatura 0).
- Generación de código con 78-79 tok/s, el punto más fuerte del stack según las mediciones del autor.
- Modo thinking con 65 tok/s, con una caída de aproximadamente el 10 % al activar YaRN frente a la ventana nativa.
- Entrada de imagen: el pipeline declarado es `image-text-to-text` y la prueba `vision_check.py` pasa según el autor.
- Tool calling y function calling: la prueba de tool calls pasa en la suite del repositorio.
- Contexto largo con recuperación exacta verificada a 172k, 343k y 489k tokens de prompt (pruebas de copia literal y retrieval).
- Soporte multilingüe parcial verificado en alemán (45 tok/s), con un rendimiento ligeramente inferior al de la receta SGLang.
- Concurrencia: con 2 y 3 peticiones simultáneas el throughput por petición cae un 20 % y un 38 %, con un throughput total de 1,6× y 1,9×.
- No se documentan capacidades de audio ni de agente autónomo multi-paso más allá del tool calling.

## Casos de uso

- Análisis de repositorios completos: con 524k tokens de contexto se puede cargar un árbol de código extenso y hacer preguntas transversales sobre él, apoyándose en la recuperación exacta verificada hasta 489k tokens.
- Asistente de código en IDE o CI/CD: los 78-79 tok/s en código y el soporte de tool calling permiten integraciones interactivas con latencia aceptable en una sola máquina.
- Procesamiento de documentación técnica extensa: manuales, normativas o contratos de cientos de miles de tokens caben en una sola ventana, evitando pipelines de chunking y recuperación.
- Servidor de chat interno always-on: la política de reinicio `unless-stopped`, el nombre de modelo único y la retención del 20 % de memoria para el sistema operativo lo hacen adecuado para un servicio persistente con OpenWebUI u otro front-end compatible.
- Transcripción y razonamiento sobre capturas o diagramas: la entrada image-text-to-text permite adjuntar imágenes junto a prompts largos en tareas de documentación técnica.
- Evaluación comparativa de stacks de inferencia: la suite de tests incluida, ejecutable contra cualquier endpoint compatible con OpenAI, sirve para comparar vLLM, SGLang u otros backends con la misma carga.
- Prototipado de agentes con contexto persistente: el pool de KV de aproximadamente 1,0 M tokens en FP8 permite mantener varias sesiones largas en memoria sin reiniciar el servidor.

## Benchmarks y rendimiento

Mediciones del autor en una GB10, decoding en streaming excluyendo TTFT, 512 tokens, temperatura 0:

| Métrica | Este repo (vLLM, 524k) | Receta SGLang (524k) |
|---|---:|---:|
| Código (tok/s) | 78-79 | 59,4 |
| Prosa en inglés (tok/s) | 46 | 40,5 |
| Alemán (tok/s) | 45 | 46,4 |
| Thinking (tok/s) | 65 | 52,4 |

| Métrica adicional | Valor medido |
|---|---|
| GSM8K, 200 problemas, thinking | 96,0 % |
| Contexto verificado | copia y retrieval exactos a 172k, 343k y 489k tokens |
| Pool de KV | ≈1,0 M tokens en FP8 al 80 % de memoria de GPU |
| Concurrencia 2 / 3 peticiones | −20 % / −38 % por petición; 1,6× / 1,9× throughput total |
| Arranque | ≈15 min en el primer boot (autotune de kernels), ≈5 min posteriores |

Datos de `diffbot` citados pero no re-medidos por el autor: KL frente a BF16 de 0,049, HumanEval 95,7 % y sesiones agénticas a 63-64 tok/s con 131k de contexto.

## Requisitos de hardware

- Una DGX Spark / GB10 con 128 GB de memoria unificada; el autor ha medido en una sola unidad.
- Almacenamiento: aproximadamente 100 GB libres en NVMe para pesos e imagen (descarga de ~96 GB más la imagen).
- Memoria: `GPU_MEMORY_UTILIZATION` por defecto a 0,80, dejando unos 15 GB libres para el sistema operativo.
- No cabe en GPU de consumo convencionales: el checkpoint FP4 y el pool de KV de ~1,0 M tokens exigen el espacio de memoria de GB10; no se documenta funcionamiento en RTX 4090 ni similares.
- Despliegue mediante Docker con runtime de NVIDIA, vLLM y kernels b12x sobre la imagen `eugr/spark-vllm-b12x`; se requiere `uv` para las pruebas.
- Throughput medido: 78-79 tok/s en código, 46 tok/s en prosa, 65 tok/s en thinking, con un solo flujo.
- Arranque de aproximadamente 15 minutos la primera vez por el autotune de kernels, cacheado después (≈5 min).

## Comparativa con modelos similares

| Aspecto | Este repo (vLLM, 524k) | Receta SGLang del mismo autor | Checkpoint de diffbot (FP4-Local) |
|---|---|---|---|
| Backend | vLLM + b12x | SGLang | vLLM (receta original) |
| Contexto | 524.288 tokens (YaRN ×2) | 524.288 tokens | validado hasta 131k |
| Código (tok/s) | 78-79 | 59,4 | no disponible |
| Thinking (tok/s) | 65 | 52,4 | no disponible |
| Alemán (tok/s) | 45 | 46,4 | no disponible |
| Sesiones agénticas | no medido | no medido | 63-64 tok/s a 131k |
| Licencia del repo | MIT | MIT | MIT / Apache-2.0 |
| Pesos | NVIDIA Open Model Agreement | NVIDIA Open Model Agreement | NVIDIA Open Model Agreement |

No se dispone de datos para comparar con alternativas de otros fabricantes en la misma categoría de tamaño o tarea.

## Limitaciones y advertencias

- Las salidas no son reproducibles bit a bit entre ejecuciones debido a las operaciones atómicas del MoE en b12x.
- El contexto de 524k es una extensión del autor; `diffbot` solo valida hasta 131k, y las comprobaciones de contexto largo son pruebas de copia y retrieval, no una suite de benchmarks.
- YaRN es estático en vLLM y se aplica a todas las peticiones; el decoding en modo thinking cae aproximadamente un 10 % frente a la ventana nativa de 262k.
- El decoding en alemán es un 3 % más lento que en la receta SGLang, cuyo mapa de tokens draft se construyó sobre alemán y código.
- La imagen base es de terceros (`eugr/spark-vllm-b12x`), fijada por digest, con un perfil seccomp que amplía el de Docker con `io_uring_*`; conviene revisarlo en entornos con requisitos de seguridad estrictos.
- Las mediciones provienen de una única GB10 y deben verificarse en hardware propio.
- Licencia: los scripts y tests son MIT, pero los pesos están bajo NVIDIA Open Model Agreement y el modelo base bajo Qwen Community License 1.0, que exige una licencia adicional de Qwen para uso comercial como Model-as-a-Service.
- No se documentan sesgos específicos, tasas de alucinación ni cobertura de idiomas más allá de los medidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta aún con validación de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pendraga/Qwen3.8-Flash-Next-GB10-vLLM-524k
- Checkpoint base de NVIDIA y receta original: https://huggingface.co/diffbot/Qwen3.8-Flash-Next-FP4-Local-DGX-Spark
- Receta previa con SGLang del mismo autor: https://huggingface.co/pendraga/Qwen3.8-Flash-Next-GB10-SGLang-Recipe
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mediciones completas (incluidas configuraciones de 131k y 262k): `results/measurements.md` dentro del repositorio
- Pesos de NVIDIA: `nvidia/Qwen3.8-Flash-Next-FP4-Local` (NVIDIA Open Model Agreement)
