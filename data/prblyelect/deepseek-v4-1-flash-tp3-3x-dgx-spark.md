# PrblyElect/DeepSeek-V4.1-Flash-TP3-3x-DGX-Spark

## Resumen

DeepSeek-V4.1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 552 mil millones de parámetros totales y un bloque de memoria condicional "engram" de 196B integrado. Este repositorio concreto, publicado por el usuario PrblyElect, no contiene los pesos del modelo, sino una receta de despliegue (serving recipe) para servir el modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` mediante vLLM en un clúster de tres nodos NVIDIA DGX Spark con paralelismo tensorial de grado 3 (TP=3).

La receta está optimizada para capacidad: configura una ventana de contexto de 512K tokens con un pool de KV de aproximadamente 2 millones de tokens (variable entre 1,6M y 2,4M según el arranque), lo que permite entre 6 y 9 veces más concurrencia a 262K de contexto y entre 3 y 4,7 veces a 512K. El modelo base emplea una arquitectura MoE nativa con cuantización FP4+FP8 y soporte de contexto largo.

La relevancia de esta ficha radica en que documenta un caso de despliegue multi-nodo sobre hardware consumer/prosumer (DGX Spark, GB10) con interconexión RoCE de 200G, incluyendo la resolución de trampas de memoria en memoria unificada, lo que resulta útil para equipos que quieran reproducir el despliegue de un modelo de 552B sin infraestructura de centro de datos tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con bloque de memoria condicional "engram" |
| Parametros totales | 552B |
| Parametros activos | no disponible |
| Longitud de contexto | 512K tokens (configurado en la receta) |
| Tipos de cuantizacion | FP4 + FP8 nativos (según model card) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint de ~510 GB; la receta usa imagen Docker con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 552B de parámetros totales que incorpora un bloque de memoria condicional denominado "engram" de 196B de parámetros, con cuantización nativa FP4+FP8. La receta describe que las tablas n-gram del engram se sirven desde NVMe, liberando 31 GiB por rango de memoria host que de otro modo se consumiría. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución técnica de este repositorio es la receta de servicio: paralelismo tensorial TP=3 sobre tres DGX Spark conectados en un triángulo RoCE CX-7 de 200G, usando un fork de vLLM (eugr b12x) sobre una imagen pública de Docker Hub. La receta documenta y resuelve trampas de memoria en memoria unificada GB10: fijación de buffers NCCL, staging host del engram, buffers de rebote del loader y la comprobación de memoria libre al arranque. Incluye un gate de identidad del motor (`engine-identity.json`) que verifica el build stamp y los hashes de los ficheros críticos dentro del contenedor antes de arrancar, ya que la imagen se parchea en tiempo de ejecución y el digest del manifiesto no basta para probar qué se ejecuta.

## Capacidades

- Generación de texto y decodificación de secuencias largas con contexto de hasta 512K tokens.
- Soporte de contexto largo nativo (long-context), con pool de KV de ~2M tokens para alta concurrencia.
- Servicio multi-nodo con paralelismo tensorial TP=3 vía vLLM.
- Capacidad de concurrencia: ~6–9× a 262K de contexto y ~3–4,7× a 512K.
- Decodificación single-stream de ~29 tok/s en prosa sin decodificación especulativa.
- Memoria condicional "engram" con tablas n-gram servidas desde NVMe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de modelos de 552B en clústeres de tres nodos DGX Spark: la receta permite arrancar el servicio en unos 10–12 minutos con tres comandos (`preflight`, `stage-env`, `start`), lo que facilita reproducir un entorno de inferencia de gran escala sobre hardware prosumer con interconexión RoCE.
- Procesamiento de documentos extensos: con 512K tokens de contexto, el modelo puede ingerir libros completos, bases de código o expedientes legales en una sola pasada, adecuado para resumen y extracción de información sobre corpus largos.
- Atención al cliente con alta concurrencia: el pool de KV de ~2M tokens permite atender entre 6 y 9 conversaciones simultáneas a 262K de contexto, lo que resulta útil para sistemas de soporte multi-turno con historial extenso.
- Análisis de repositorios de código: la ventana de 512K permite cargar módulos completos o múltiples ficheros para tareas de revisión, refactorización y generación de código asistida.
- Investigación sobre memoria condicional: el bloque engram de 196B con tablas n-gram en NVMe sirve como banco de pruebas para estudiar arquitecturas de memoria externa en modelos MoE de gran tamaño.
- Evaluación de infraestructura de inferencia: la receta documenta métricas de memoria, latencia y throughput, útil para equipos que comparan configuraciones de TP, contextos y cuantizaciones sobre GB10.
- Despliegue con verificación de integridad: el gate `engine-identity.json` permite auditar qué código ejecuta el contenedor antes del arranque, relevante en entornos con requisitos de cadena de suministro.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decodificacion single-stream (prosa, sin spec decode) | ~29 tok/s |
| Pool de KV | ~2M tokens (1,6M–2,4M segun arranque) |
| Contexto configurado | 512K tokens |
| Concurrencia a 262K | ~6–9× |
| Concurrencia a 512K | ~3–4,7× |
| Tiempo de arranque hasta :8600 | ~10–12 min |
| Memoria host liberada por engram en NVMe | 31 GiB/rango |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona una comparación con una receta SGLang de la comunidad que logra mayor tok/s pero con aproximadamente un tercio de la capacidad de KV y la mitad de contexto, y con un fork TP=3 de vLLM compilado desde fuente que alcanza un pool y contexto mayores, pero sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- Tres nodos NVIDIA DGX Spark (GB10) con memoria unificada.
- Interconexión: triángulo completo RoCE CX-7 de 200G (una subred /24 por tramo, MTU 9000) más una LAN de gestión.
- Checkpoint de ~510 GB y la imagen Docker con digest fijado, preparados en cada máquina.
- Docker con soporte de GPU en los tres nodos.
- Configuración de memoria: gmu 0.85, 4 GiB de KV, contexto de 512K, sin decodificación especulativa, engram en NVMe.
- Almacenamiento NVMe para las tablas n-gram del engram (libera 31 GiB/rango de memoria host).
- No cabe en GPU consumer convencionales (RTX 4090, etc.); requiere el clúster de tres DGX Spark.
- Despliegue mediante vLLM (fork eugr b12x) sobre imagen pública de Docker Hub; opciones alternativas como SGLang se mencionan en la comparativa de la model card.
- Latencia y throughput: ~29 tok/s single-stream; latencia de arranque de ~10–12 minutos.

## Comparativa con modelos similares

| Modelo / receta | Parametros | Contexto | Pool KV | Throughput | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta receta (vLLM TP=3, 3× DGX Spark) | 552B | 512K | ~2M tokens | ~29 tok/s single-stream | MIT | Imagen Docker pública |
| Receta oficial `recipes/3x-spark-cluster/deepseek-v4.1-flash.yaml` | 552B | Menor (derivado del pool) | Menor | no disponible | no disponible | Incluida en el proyecto de la imagen |
| Fork TP=3 de vLLM compilado desde fuente | 552B | Mayor | Mayor | no disponible | no disponible | Comunidad |
| Receta SGLang optimizada para velocidad | 552B | ~Mitad | ~Un tercio | Mayor tok/s | no disponible | Comunidad |

## Limitaciones y advertencias

- El pool de KV es variable entre arranques (1,6M–2,4M tokens), lo que hace que la capacidad efectiva no sea determinista.
- La imagen se parchea en tiempo de ejecución; el digest del manifiesto no basta para verificar qué se ejecuta, por lo que se depende del gate `engine-identity.json`.
- Un nightly más reciente de upstream fallará el gate de identidad hasta que se reaudite, lo que puede bloquear actualizaciones.
- La receta exige rellenar manualmente `cluster.env` (nombres de máquina, IPs, `MODEL_DIR`, `NCCL_IB_HCA`, `NCCL_SOCKET_IFNAME`); el preflight rechaza placeholders sin resolver.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- No se dispone de información sobre tool calling, capacidades multimodales ni idiomas soportados.
- La licencia MIT del repositorio aplica a la receta; la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` debe verificarse por separado antes de uso comercial.
- El despliegue requiere hardware específico (tres DGX Spark) y una interconexión RoCE configurada correctamente; no es portable a infraestructura genérica sin adaptación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PrblyElect/DeepSeek-V4.1-Flash-TP3-3x-DGX-Spark
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Fork de vLLM eugr b12x: no disponible en la información proporcionada.
- Paper, blog o demo oficial: no disponible en la información proporcionada.
