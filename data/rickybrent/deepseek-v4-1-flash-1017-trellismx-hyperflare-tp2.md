# rickybrent/DeepSeek-V4.1-Flash-1017-TrellisMX-HYPERFLARE-TP2

## Resumen

DeepSeek-V4.1-Flash-1017-TrellisMX-HYPERFLARE-TP2 es un paquete de ejecución preparado por el usuario `rickybrent` para servir el modelo DeepSeek-V4.1-Flash-1017, desarrollado originalmente por DeepSeek, en la cuantización TrellisMX K2-Mix de Brandon Music. El paquete no introduce pesos nuevos: empaqueta el checkpoint cuantizado, la configuración de despliegue y los metadatos necesarios para ejecutarlo con el runtime Flare de NVIDIA sobre dos tarjetas RTX PRO 6000 Blackwell (GB202/SM120, 96 GB cada una) en un único host con tensor parallelism TP2.

Se trata de un modelo de arquitectura MoE (mixture of experts) con capacidades multimodales (image-text-to-text), pensado para servir una ventana de contexto de 1.048.576 tokens por petición, con soporte de tool calling, visión y decodificación especulativa mediante capas MTP (multi-token prediction). Su relevancia radica en que demuestra que es posible servir un modelo de gran tamaño y contexto extremo en hardware de estación de trabajo de gama alta (dos GPU de 96 GB), sin clústeres de datacenter, usando un runtime nativo en Rust sin dependencia de Python en tiempo de servicio.

El repositorio es fundamentalmente una receta de despliegue reproducible: el payload real (270,8 GB) vive en la revisión `gb202`, mientras que la rama `main` solo contiene metadatos. La licencia declarada es MIT, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base y del checkpoint cuantizado upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas MTP, encoder de visión y tablas Engram (según checkpoint base DeepSeek-V4.1-Flash-1017) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE; el paquete declara 14.731 expertos a 2 bits, 608 a 3 bits y 21 a 4 bits) |
| Longitud de contexto | 1.048.576 tokens por petición |
| Tipos de cuantizacion | TrellisMX K2-Mix (expertos a 2/3/4 bits) y tablas Engram K4 a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (payload `deepseek-v4.1-flash-1017-trellismx-k2mix-hyperflare-1m-tp2.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos (MoE) que incorpora capas de predicción multi-token (MTP) para decodificación especulativa, un encoder de visión para entrada image-text-to-text y tablas Engram (memoria de recuperación) cuantizadas a 4 bits. La cuantización TrellisMX K2-Mix reparte los 14.731 expertos en tres precisiones (2, 3 y 4 bits) según su importancia, lo que reduce el peso total hasta los 270,8 GB empaquetados. El paquete conserva la atención, los expertos compartidos, las capas MTP de borrador, el encoder de visión y el tokenizador del modelo oficial.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de este paquete es el runtime Flare de NVIDIA, escrito en Rust, que compila el forward de forma ahead-of-time y ejecuta los kernels CUTLASS de los expertos enrutados mediante un driver P8 presentado a PyTorch Dynamo como `torch.library.custom_op` durante la preparación. El servicio no requiere Python. La decodificación especulativa usa MTP con 3 tokens de borrador por defecto (anchos 1–4) y verificación adaptativa.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto y esfuerzo alto; se puede desactivar por petición con `{"chat_template_kwargs": {"enable_thinking": false}}` o `{"thinking_mode": "chat"}`, y ajustar con `{"reasoning_effort": "low"}`.
- Comprensión de imágenes (image-text-to-text): acepta elementos `image_url` de OpenAI con PNG, JPEG o WebP estático en data URLs; admite hasta 2 peticiones con imagen concurrentes junto con texto.
- Tool calling / function calling: validado con una llamada `get_weather({"city": "Reykjavik"})` con argumentos correctos.
- Decodificación especulativa MTP con 3 tokens de borrador por defecto y anchos de 1 a 4.
- Contexto largo extremo: 1.048.576 tokens por petición, con recuperación validada en una prueba de aguja en 105.000 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`).

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar hasta 1.048.576 tokens en una sola petición, lo que permite resumir o extraer información de libros completos, expedientes o bases de código sin trocear el contexto; la prueba de recuperación en 105.000 tokens con resultado correcto en 22 s respalda este uso.
- Asistentes de razonamiento con modo thinking: para tareas que requieren cadenas de razonamiento largas (planificación, análisis matemático, depuración compleja) se activa el modo thinking con esfuerzo alto; para respuestas directas se desactiva y una respuesta de 450 palabras se completa en unos 3 s.
- Automatización con tool calling: integrable en pipelines que necesiten invocar APIs externas (clima, bases de datos, servicios internos) mediante function calling validado, con argumentos estructurados correctos.
- Procesamiento multimodal de documentos: extracción y descripción de información a partir de imágenes (capturas, diagramas, formularios escaneados) usando el encoder de visión con hasta 2 peticiones con imagen concurrentes.
- Despliegue en estación de trabajo de gama alta: servir el modelo en dos RTX PRO 6000 Blackwell en un único host con TP2, sin clúster de datacenter, para equipos de investigación que necesiten un modelo de contexto extremo en local.
- Evaluación de runtimes de inferencia: el paquete sirve como banco de pruebas reproducible del runtime Flare (compilación ahead-of-time, kernels CUTLASS, decodificación especulativa MTP) con métricas de rendimiento publicadas (145–159 tok/s en decodificación, 4.236–4.766 tok/s en prefill).
- Generación de código asistida con contexto de repositorio: con 1M de tokens de ventana puede ingerir un repositorio completo y responder sobre él, aunque no se han publicado benchmarks específicos de código para este paquete.

## Benchmarks y rendimiento

El autor publica métricas de rendimiento medidas el 2026-11-14 sobre dos RTX PRO 6000, con una petición a la vez salvo indicación contraria:

| Medida | Resultado |
|---|---|
| Decodificación, 1 stream (thinking on) | 145–159 tok/s |
| Decodificación, 1 stream (thinking off) | ~150 tok/s |
| Prefill, prompt de 28.160 tokens | 4.236 tok/s |
| Prefill, prompt de 105.585 tokens | 4.766 tok/s |
| Recuperación de aguja en 105K | correcta (`BLUE-FALCON-7741`), 22 s extremo a extremo |
| Tool call | `get_weather({"city": "Reykjavik"})`, argumentos correctos |
| Visión | descripción correcta de una imagen sintética de dos colores |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: 79,65 / 79,51 GiB de asignaciones fijas por GPU; caché KV de 14,4 GiB por GPU (28,7 GiB totales, 17.270.656 tokens, 16 slots de snapshot compartidos). Las tablas Engram ocupan 97,3 GiB dentro del payload y se leen de disco a través de una caché de filas en GPU de 1 GiB.
- GPU recomendadas: 2 × RTX PRO 6000 Blackwell (GB202, SM120, 96 GB) en un único host con TP2; es el hardware para el que está preparado el paquete.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.) dado el tamaño del payload (270,8 GB) y las asignaciones por GPU.
- Despliegue: runtime Flare de NVIDIA, compilado desde la rama `ds41-trellismx-engine` (PR #161, head `07fcfc8`); se sirve sin Python. Comando: `flare run rickybrent/DeepSeek-V4.1-Flash-1017-TrellisMX-HYPERFLARE-TP2 --gpus 0,1 --max-concurrency 2 --mtp-draft-tokens 3 --embedding-table-storage disk --embedding-table-cache-size 1GiB`.
- Capacidades preparadas: concurrencia 2, chunk de prefill 2.048, concurrencia de imagen 2; 46 grafos capturados y 3.463 kernels (287,8 MiB de cubin, no residente).
- Latencia y throughput: 145–159 tok/s en decodificación con thinking activado; ~150 tok/s con thinking desactivado; 4.236–4.766 tok/s en prefill para prompts de 28K–105K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-TrellisMX-HYPERFLARE-TP2 | no disponible (MoE, 14.731 expertos) | 1.048.576 | MIT | Hugging Face, runtime Flare |
| DeepSeek-V4.1-Flash-1017 (base oficial) | no disponible | no disponible | no disponible | Hugging Face (`deepseek-ai/DeepSeek-V4.1-Flash-1017`) |
| DeepSeek-V4.1-Flash-1017-TrellisMX-K2-Mix (checkpoint cuantizado) | no disponible (misma cuantización TrellisMX K2-Mix) | no disponible | no disponible | Hugging Face (`brandonmusic/...`) |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El paquete requiere una versión de Flare con soporte para el checkpoint TrellisMX DeepSeek V4.1 y sus filas Engram de 4 bits (PR #161); las versiones mainline anteriores rechazan el paquete.
- Requiere exactamente 2 GPU en un único host (`--gpus` debe seleccionar 2 dispositivos); no es un despliegue escalable horizontalmente sin reempaquetar.
- El payload de 270,8 GB debe descargarse de la revisión `gb202`; la rama `main` solo contiene metadatos.
- En la primera carga se muestra un aviso del publicador que exige escribir `rickybrent` para aceptar; para arranque desatendido hay que usar `--dangerously-approve-key` y `--dangerously-accept-publisher`, con implicaciones de seguridad.
- La verificación de identidad descarga `publisher.json` del repositorio en cada carga en línea; es una firma de producción, no una clave de desarrollo.
- El modo thinking está activado por defecto con esfuerzo alto, lo que incrementa la latencia y el consumo de tokens; hay que desactivarlo explícitamente para respuestas directas.
- El modelo es una cuantización de 2–4 bits: puede degradar la calidad frente al modelo base en tareas sensibles a la precisión numérica.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura de idiomas; conviene evaluarlos antes de producción.
- La licencia MIT se declara para el paquete, pero deben revisarse las condiciones del modelo base y del checkpoint cuantizado upstream para uso comercial.
- El autor no reclama autoría del modelo, la cuantización, el runtime ni los kernels; es un empaquetado de trabajo upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rickybrent/DeepSeek-V4.1-Flash-1017-TrellisMX-HYPERFLARE-TP2
- Checkpoint cuantizado base: https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-TrellisMX-K2-Mix
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Runtime Flare de NVIDIA: https://github.com/NVIDIA/hyperflare-inference
- Pull request de soporte TrellisMX DeepSeek V4.1: https://github.com/NVIDIA/hyperflare-inference/pull/161
