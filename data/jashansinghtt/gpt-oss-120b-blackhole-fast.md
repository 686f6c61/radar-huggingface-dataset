# jashansinghTT/gpt-oss-120b-blackhole-fast

## Resumen

gpt-oss-120b-blackhole-fast es un paquete de despliegue publicado por el usuario jashansinghTT que implementa el modelo openai/gpt-oss-120b sobre hardware Tenstorrent Blackhole. No es un modelo entrenado desde cero ni un fine-tune convencional: es un runtime de inferencia optimizado que sirve los pesos de GPT-OSS 120B con vLLM sobre cuatro chips Blackhole (una QuietBox 2, perfil P150x4, tensor parallel 4). El repositorio de 1,3 GB contiene el paquete de despliegue y los kernels, no la totalidad de los pesos, que se derivan de la revisión b5c939de de openai/gpt-oss-120b.

La relevancia del paquete está en el rendimiento medido: 4,06 ms por token en decodificación batch 1 con ISL 128 (246,1 tok/s por usuario), unas 3,8 veces más rápido que la alternativa tt-hous sobre la misma máquina. Esto se consigue con un camino de decodificación fusionado para batch 1 que lee los 128 expertos BFP4 directamente desde DRAM, ejecuta el enrutado top-4 sobre los 128 logits del router en el propio chip y fusiona los all-reduce dentro de los kernels productores.

Se trata de un release candidate de segunda ronda (etapa 14), con licencia Apache 2.0, orientado a entornos de inferencia sobre aceleradores Tenstorrent más que a GPU convencionales. La calidad se mantiene respecto al modelo base: 87,6 % en GSM8K-250 y 89,0 % en IFEval-100 según las mediciones del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE); 128 expertos y enrutado top-4 sobre los 128 logits del router |
| Parámetros totales | 120 000 millones (según la denominación del modelo base openai/gpt-oss-120b) |
| Parámetros activos | no disponible en la información proporcionada |
| Longitud de contexto | no disponible en la información proporcionada; los perfiles de prefill usan fragmentos de 8192 y 32768 tokens |
| Tipos de cuantización | Expertos en BFP4; atención, LM head y caché KV en BFP8; router en BFP8 en la decodificación fusionada batch 1 y en BF16 en las rutas batched |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio de 1,3 GB contiene el paquete de despliegue; los pesos proceden de openai/gpt-oss-120b, revisión b5c939de) |

## Arquitectura y entrenamiento

El modelo subyacente es openai/gpt-oss-120b, un transformer decoder con mezcla de expertos: 128 expertos en total y enrutado top-4, según se deduce de la descripción del runtime (selección top-4 sobre 128 logits de router y lectura in situ de 128 expertos BFP4). El paquete no modifica los pesos ni el entrenamiento del modelo base; solo cambia cómo se ejecutan. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la model card original de openai/gpt-oss-120b.

La aportación técnica es la ruta de decodificación fusionada para batch 1: las matmuls de los expertos se ejecutan transmitiendo desde DRAM los 128 expertos BFP4 en su sitio (una única copia con sharding ND compartida con el prefill y la decodificación batched), el enrutado top-4 se hace en el propio chip y los all-reduce se fusionan en los kernels que los producen. Las peticiones que no encajan en esa ruta (batches de 2 a 32, prefill, prefix caching, penalizaciones, log-probs, top-k mayor que 32, logit bias o gramáticas) se sirven por los caminos batched. La procedencia incluye el autoport de GPT-OSS de tt-hous/gpt-oss-20b-p150 con un conmutador de tamaño (GPT_OSS_MODEL_SIZE=120b), un runtime TT-Metal concreto y el PR tenstorrent/tt-metal#60161 para la decodificación fusionada.

## Capacidades

- Generación de texto mediante API compatible con OpenAI: `/v1/chat/completions`, `/v1/completions` y `/v1/models`, pasando `"model": "openai/gpt-oss-120b"`.
- Decodificación de baja latencia en régimen de un solo usuario: 4,06 ms por token a ISL 128 y 4,43 ms a ISL 4096.
- Servicio concurrente: batches de 2 a 32, con 562 tok/s de salida agregada a c=32 e ISL 128.
- Prefill con fragmentos configurables de 8192 tokens (perfil `p150x4`) o 32768 tokens (perfil `p150x4-throughput`).
- Prefix caching y peticiones con penalizaciones, log-probs, logit bias o gramáticas, servidas por las rutas batched.
- Muestreo top-k en el dispositivo en la ruta fusionada, con k menor o igual que 32.
- El resto de capacidades funcionales (razonamiento, código, matemáticas, tool calling, capacidades multilingües) no se documentan en la información disponible y dependen íntegramente del modelo base openai/gpt-oss-120b.

## Casos de uso

- Chat interactivo de baja latencia: con 4,06 ms por token a ISL 128 y 246,1 tok/s por usuario, la ruta fusionada batch 1 es adecuada para asistentes conversacionales donde el tiempo hasta el primer token y el ritmo de decodificación son críticos.
- Despliegue on-premise sobre aceleradores Tenstorrent: permite servir GPT-OSS 120B en una QuietBox 2 con cuatro chips Blackhole sin depender de GPU NVIDIA, útil en organizaciones que ya operan infraestructura Tenstorrent.
- Procesamiento de documentos largos: con ISL 4096 el TTFT es de 738 ms y la decodificación de 4,43 ms por token, lo que hace viable resumir o extraer información de entradas extensas en un turno.
- Servicio agregado para varias peticiones simultáneas: a c=32 con ISL 128 el sistema entrega 562 tok/s de salida, un régimen adecuado para colas de trabajo por lotes con decenas de usuarios concurrentes.
- Salidas estructuradas: el soporte de logit bias y gramáticas en las rutas batched permite forzar formatos concretos (JSON, plantillas) en pipelines de extracción de datos.
- Evaluación comparativa de hardware: el paquete sirve como base reproducible para medir GPT-OSS 120B en BFP4 frente a referencias fp32, con métricas de top-1, top-5 y PCC ya publicadas.
- Investigación en cuantización de precisión reducida: la combinación de expertos BFP4 con atención y caché KV en BFP8 es un caso de estudio directo sobre el impacto de precisión en la calidad final.

## Benchmarks y rendimiento

Rendimiento de serving medido en la misma QuietBox 2, mismo cliente y mismo día, con 128 tokens de salida:

| Métrica | tt-hous/gpt-oss-120b-p150x4 | gpt-oss-120b-blackhole-fast | Unidad |
|---|---|---|---|
| Decodificación c=1, ISL 128 (TPOT) | 15,28 ms (65,4 tok/s/u) | 4,06 ms (246,1 tok/s/u) | API |
| TTFT c=1, ISL 128 | 252 ms | 248 ms | API |
| Decodificación c=1, ISL 1024 (TPOT) | 15,45 ms (64,7 tok/s/u) | 4,20 ms (237,9 tok/s/u) | API |
| TTFT c=1, ISL 1024 | 400 ms | 313 ms | API |
| Decodificación c=1, ISL 4096 (TPOT) | 15,64 ms (63,9 tok/s/u) | 4,43 ms (225,6 tok/s/u) | API |
| TTFT c=1, ISL 4096 | 785 ms | 738 ms | API |
| Throughput de salida c=8, ISL 128 | 212 tok/s | 211 tok/s | API |
| Throughput de salida c=32, ISL 128 | 556 tok/s | 562 tok/s | API |
| Paso de decodificación en dispositivo, batch 1, ISL 128 | — | 4,09 ms | replay trazado |
| Paso de decodificación en dispositivo, batch 1, ISL 4096 | — | 4,40 ms | replay trazado |

Referencia adicional del propio autor: el runtime gpt-oss-120b de tt-lab (32 tiles sobre los mismos cuatro chips, expertos en BFP8) midió 6,54 ms por token a ISL 128 y 18,19 ms a ISL 4096 en esa misma máquina (tiempo de comando en dispositivo).

Precisión frente a una referencia fp32 de gpt-oss-120b en HuggingFace (4 prompts harmony por 128 posiciones, media de 2 ejecuciones):

| Métrica | tt-hous/gpt-oss-120b-p150x4 | gpt-oss-120b-blackhole-fast |
|---|---|---|
| Top-1 | 92,58 % | 93,95 % |
| Top-5 | 99,80 % | 99,80 % |
| PCC | 0,9862 | 0,9884 |

Subconjuntos de calidad evaluados con lm-eval a través de la API servida, el mismo día UTC (el paquete tt-hous a c=32 y este paquete a c=1):

| Benchmark | tt-hous/gpt-oss-120b-p150x4 | gpt-oss-120b-blackhole-fast |
|---|---|---|
| GSM8K (250, flexible) | 86,8 % | 87,6 % |
| IFEval (100, prompt-strict) | 84,0 % | 89,0 % |

El autor advierte de que la plantilla de chat de gpt-oss escribe la fecha actual en el prompt de sistema, por lo que ejecuciones en días distintos envían prompts diferentes: el día anterior los mismos paquetes obtuvieron GSM8K 89,2 % frente a 88,8 % e IFEval 87,0 % frente a 85,0 %. Un subconjunto de 250 preguntas puede moverse unos 2 puntos entre ejecuciones de ese tipo.

## Requisitos de hardware

- Hardware objetivo: cuatro chips Tenstorrent Blackhole en una QuietBox 2 (perfil P150x4), con tensor parallel 4. No es un modelo desplegable en GPU convencional.
- Memoria: los 128 expertos en BFP4 ocupan aproximadamente 17 GB por chip. El primer arranque convierte el checkpoint en una caché de tensores de unos 75 GB y tarda alrededor de 15 minutos; los arranques posteriores cargan esa caché.
- GPU de consumo: no aplica; el paquete no está pensado para RTX 4090 ni tarjetas similares.
- Despliegue: CLI `tt-model` (`tt-model pull`, `tt-model serve`, `tt-model curl`, `tt-model stop`) con perfiles `p150x4` (interactivo, fragmentos de prefill de 8192 tokens y 8 pasos de decodificación entre fragmentos) y `p150x4-throughput` (fragmentos de 32768 tokens).
- Latencia y throughput: 4,06 ms por token a ISL 128 y 4,43 ms a ISL 4096 en batch 1; 248 ms de TTFT a ISL 128; 211 tok/s a c=8 y 562 tok/s a c=32 con ISL 128.

## Comparativa con modelos similares

| Modelo | Hardware | Parámetros | Precisión de pesos | Decodificación batch 1 (ISL 128) | GSM8K-250 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gpt-oss-120b-blackhole-fast | QuietBox 2 P150x4 (4 chips Blackhole) | 120B (MoE) | Expertos BFP4, atención y KV BFP8 | 4,06 ms/token (246,1 tok/s/u) | 87,6 % | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| tt-hous/gpt-oss-120b-p150x4 | QuietBox 2 P150x4 | 120B (MoE) | Expertos BFP4 | 15,28 ms/token (65,4 tok/s/u) | 86,8 % | no disponible | paquete Tenstorrent |
| Runtime gpt-oss-120b de tt-lab | 4 chips Blackhole (32 tiles) | 120B (MoE) | Expertos BFP8 | 6,54 ms/token (tiempo de dispositivo) | no disponible | no disponible | interno |
| openai/gpt-oss-120b | GPU / HuggingFace | 120B (MoE) | fp32 de referencia | no disponible | no disponible | Apache 2.0 | HuggingFace |

Los tres primeros son implementaciones sobre el mismo hardware y el mismo modelo base, por lo que la comparación relevante es de rendimiento y precisión de ejecución, no de capacidades.

## Limitaciones y advertencias

- Requiere exactamente cuatro chips P150x4. Los 128 expertos BFP4 consumen unos 17 GB por chip, lo que fija el hardware y descarta configuraciones menores.
- La ruta fusionada solo sirve batch 1 y muestreo top-k con k menor o igual que 32. Cualquier otra petición cae en los caminos batched, con una latencia muy superior (15,28 ms por token en la referencia frente a 4,06 ms).
- Estado de release candidate de segunda ronda (etapa 14): no es una versión final y el autor puede cambiar el comportamiento o el rendimiento en revisiones posteriores.
- Sin descargas ni likes en HuggingFace en el momento de la consulta, y sin publicación del repositorio como artefacto ampliamente validado por terceros.
- Las evaluaciones de calidad se limitan a subconjuntos pequeños (250 preguntas de GSM8K, 100 de IFEval) y varían unos 2 puntos entre días por la fecha insertada en el prompt de sistema.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son los del modelo base openai/gpt-oss-120b, que deben consultarse en su model card.
- Idiomas soportados: no disponibles. No hay evidencia publicada aquí sobre capacidades multilingües concretas.
- Licencia Apache 2.0, que permite uso comercial del paquete, pero la licencia de los pesos base corresponde a openai/gpt-oss-120b y conviene verificarla por separado.
- Se desconoce el formato exacto de pesos del paquete y si el repositorio es autosuficiente; el propio autor indica que el primer arranque convierte el checkpoint, lo que implica dependencia de los pesos originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jashansinghTT/gpt-oss-120b-blackhole-fast
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Revisión de pesos utilizada: https://huggingface.co/openai/gpt-oss-120b/tree/b5c939de8f754692c1647ca79fbf85e8c1e70f8a
- Paquete de referencia tt-hous: https://huggingface.co/tt-hous/gpt-oss-120b-p150x4
- Autoport de origen: https://huggingface.co/tt-hous/gpt-oss-20b-p150
- Pull request de la decodificación fusionada: https://github.com/tenstorrent/tt-metal/pull/60161
