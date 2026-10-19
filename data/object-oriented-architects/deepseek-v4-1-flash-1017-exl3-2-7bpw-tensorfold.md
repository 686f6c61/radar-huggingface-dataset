# object-oriented-architects/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold es una cuantización de 2,7 bits por peso (bpw) del checkpoint oficial deepseek-ai/DeepSeek-V4.1-Flash-1017, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 99.373.023.442 parámetros totales según los safetensors del repositorio. La publica el usuario object-oriented-architects y parte del pack EXL3 de 2,9 bpw de LibertAIDAI, sobre el que aplica una reasignación de bitrate por experto enrutado según sensibilidad medida (receta de sudoingX), manteniendo intactos el resto de tensores: atención, expertos compartidos, cabeza de salida, el drafter DSpark/MTP y la torre de visión.

El objetivo es práctico: servir el modelo en dos NVIDIA DGX Spark con el motor TensorFold (rama deepseek-v41-tp2), ganando unos 11 GiB de espacio en el pack respecto al de 2,9 bpw y liberando unos 3 GiB por nodo para dedicarlos a una caché KV de 4,5 millones de tokens compartida por 8 flujos concurrentes. El autor reporta además una mejora de fidelidad frente al modelo oficial: divergencia KL media de 0,0248 frente a 0,0324 del pack de 2,9 bpw, y una concordancia top-1 del 95,64 % frente al 94,66 %.

Es relevante ahora porque demuestra que una cuantización agresiva por debajo de 3 bpw puede acercarse al modelo de referencia en lugar de alejarse, y porque documenta con detalle el equilibrio entre tamaño del pack, memoria libre por nodo y longitud de caché KV en hardware de consumo profesional. El repositorio es pequeño en adopción (19 descargas, 1 like) y está orientado a un stack de despliegue muy concreto, no a un uso genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41) con 40 capas troncales, 384 expertos enrutados por capa, expertos compartidos, drafter DSpark/MTP y torre de visión |
| Parametros totales | 99.373.023.442 (~99,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificación del modelo base; el autor sirve con `--context 1048576` (1M tokens por petición) y un pool KV compartido de 4.718.592 tokens (`TF_DS_POOL`) entre 8 flujos |
| Tipos de cuantizacion | EXL3 (exllamav3) con bitrate por experto: 6.237 expertos a K2, 7.529 a K3, 1.559 a K4 y 35 a K5 (media 2,70 bpw en expertos enrutados); 2,73 bpw en el conjunto del tronco cuantizado; cabeza de salida a 6 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (363 archivos, 198,8 GB / 185,2 GiB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de DeepSeek con 40 capas troncales y 384 expertos enrutados por capa, cada uno con las matrices `w1`, `w2` y `w3`, más expertos compartidos y una cabeza de salida. El checkpoint incluye además un drafter DSpark/MTP (decodificación especulativa / multi-token prediction) y una torre de visión, lo que habilita entrada de imágenes. Esta ficha describe una cuantización, no un entrenamiento nuevo: no se dispone de información sobre volumen de tokens, composición del dataset ni fases de RLHF/DPO del modelo original.

La innovación técnica del pack es la asignación de bits por experto en función de la sensibilidad medida: en lugar de aplicar un único K por capa, el asignador (receta de sudoingX) elige K2, K3, K4 o K5 para cada uno de los 6.237 × 3 tensores de expertos enrutados, con un objetivo ponderado por uso de 2,90 bpw que resulta en 2,70 bpw efectivos. Todo lo demás (atención, expertos compartidos, cabeza, drafter y torre de visión) procede byte a byte del pack de LibertAIDAI. El motor previsto es TensorFold en su rama deepseek-v41-tp2, que deduce el ancho de bits de cada tensor a partir de su forma; el kit de servicio de Mia/LibertAIDAI, que lee un único K por capa desde `exl3_k_map.json`, no cargaría este pack. El repositorio incluye parches de motor (`tensorfold-patches/`) para dimensionar un pool KV mayor que el de una sola petición y para conservar prompts cacheados de conversaciones largas cuando varios flujos comparten el pool.

## Capacidades

- Generación de texto y conversación multi-turno con ventanas muy largas: el autor sirve con 1M tokens de contexto por petición y un pool de 4,5M tokens compartido.
- Razonamiento con modo "thinking": la evaluación reportada incluye ejecuciones con thinking off y thinking on a esfuerzo `high`.
- Generación y comprensión de código, con el mayor peso en el panel de evaluación (161.765 de 239.716 posiciones puntuadas son de dominio code).
- Razonamiento matemático: dominio `math` evaluado por separado en el panel de divergencia KL y en GSM8K.
- Capacidad multimodal de entrada: el checkpoint base incorpora torre de visión, y los parches del motor permiten que una conversación cargue decenas de imágenes.
- Uso agéntico: el escenario de referencia son cuatro agentes de programación trabajando contra el servidor, y existe un dominio `agentic` en el panel de calidad.
- Capacidades multilingües: existe un dominio `multilingual` en el panel (8.419 posiciones), aunque sin listado de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Decodificación especulativa mediante el drafter DSpark/MTP incluido en el pack.

## Casos de uso

- Agentes de programación autónomos: el pack está dimensionado y probado con cuatro agentes de código concurrentes contra el servidor durante ~90 minutos; el dominio `code` es donde menor divergencia presenta (KLD 0,0143, top-1 96,33 %), lo que lo hace adecuado para refactorización, generación de parches y navegación de repositorios.
- Asistente de conversación de contexto muy largo: con 1M tokens por petición y un pool compartido de 4,5M, encaja en análisis de documentación extensa, actas de reuniones o bases de código medianas sin trocear.
- Servicio multiinquilino ligero: `--parallel 8` sobre dos DGX Spark con 3,7 / 5,3 GiB libres en el peor momento permite atender a varios desarrolladores con un solo despliegue.
- Evaluación de calidad y docencia: el panel de calibración de 199 conversaciones (301.828 tokens, 239.716 posiciones puntuadas) y las tablas de KL por dominio sirven como metodología reproducible para comparar cuantizaciones.
- Inferencia sobre hardware de gama profesional en lugar de centro de datos: dos DGX Spark sustituyen a un nodo GPU grande para cargas de código y chat con requisitos moderados de throughput.
- Prototipado de asistentes con entrada de imágenes: la torre de visión y los parches de gestión de caché permiten conversaciones con decenas de imágenes en un mismo hilo.
- Razonamiento matemático asistido: GSM8K se evalúa en el pack y el dominio `math` muestra KLD 0,0187, útil para tutoría o verificación de cálculos paso a paso.

## Benchmarks y rendimiento

Divergencia KL frente al checkpoint oficial (FP8 / MXFP4), panel de 199 conversaciones construido con las herramientas `caldata` de sudoingX, prompts disjuntos de los de calibración:

| Modelo | KLD media | KLD p99 | Concordancia top-1 | Perplejidad |
|---|---:|---:|---:|---:|
| Pesos oficiales (FP8 / MXFP4) | — | — | — | 1,5614 |
| Este repo, 2,7 bpw | 0,0248 | 0,375 | 95,64 % | 1,5825 |
| LibertAIDAI 2,9 bpw | 0,0324 | 0,433 | 94,66 % | 1,5918 |

Desglose por dominio:

| Dominio | Posiciones | KLD 2,7 bpw | KLD 2,9 bpw | Top-1 2,7 bpw | Top-1 2,9 bpw |
|---|---:|---:|---:|---:|---:|
| code | 161.765 | 0,0143 | 0,0214 | 96,33 % | 95,30 % |
| agentic | 16.206 | 0,0265 | 0,0395 | 95,11 % | 93,79 % |
| long | 15.730 | 0,0323 | 0,0403 | 95,38 % | 94,47 % |
| chat | 13.593 | 0,0724 | 0,0882 | 91,58 % | 90,82 % |
| knowledge | 11.658 | 0,0563 | 0,0663 | 93,74 % | 92,65 % |
| math | 9.643 | 0,0187 | 0,0259 | 95,34 % | 94,64 % |
| multilingual | 8.419 | 0,0783 | 0,0669 | 94,24 % | 94,39 % |
| writing | 2.702 | 0,0799 | 0,0942 | 92,67 % | 91,41 % |

MMLU / GSM8K con la receta de lucataco (digest `09c2e6cc43e275af`, 200 preguntas MMLU + 100 GSM8K, greedy):

| Prueba | Este repo, 2,7 bpw (2× Spark) | API de DeepSeek | LibertAIDAI 2,9 bpw (2× Spark) |
|---|---:|---:|---:|
| MMLU, thinking off | 85,0 % | 84,5 % | 85,0 % |
| MMLU, thinking on | no disponible (dato truncado en la model card) | no disponible | no disponible |
| GSM8K | no disponible (dato truncado en la model card) | no disponible | no disponible |

## Requisitos de hardware

- VRAM/espacio de pesos: 198,8 GB (185,2 GiB) de safetensors; el despliegue de referencia reparte el modelo en dos nodos (TP2).
- Hardware probado: dos NVIDIA DGX Spark. Memoria libre reportada con `--context 1048576 --parallel 4`: 9,6 GiB en el nodo cabeza y 11,9 GiB en el segundo (mediana de ~90 minutos), frente a 6,9 / 8,5 GiB del pack de 2,9 bpw.
- Con `--parallel 8` y pool `TF_DS_POOL=4718592`: 5,6 / 7,7 GiB libres al arrancar y 3,7 / 5,3 GiB en el mínimo de las dos primeras horas.
- Caché KV: ~1,45 GiB por nodo y por millón de tokens con el motor TensorFold.
- No cabe en una GPU de consumo individual: el pack ocupa ~185 GiB y requiere al menos dos nodos con memoria unificada o GPUs de 80-141 GB en paralelo. No se han publicado medidas para A100, H100 o RTX 4090.
- Motor soportado: exclusivamente TensorFold, rama `bertholomus/TensorFold` `deepseek-v41-tp2` (fork de `ashhart/TensorFold`), más los parches incluidos en `tensorfold-patches/`. No se ha probado con vLLM, llama.cpp, Ollama ni TGI, y el kit de Mia/LibertAIDAI no cargaría el pack.
- Latencia y throughput: el autor indica que la velocidad de decodificación iguala a la del pack de 2,9 bpw; no se publican tokens/s concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (panel KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (2,7 bpw EXL3) | 99,4 B | 1M por petición; pool 4,5M | KLD 0,0248; top-1 95,64 % | MIT | 198,8 GB, 19 descargas |
| LibertAIDAI 2,9 bpw EXL3 | mismo base (~99,4 B) | misma configuración de motor | KLD 0,0324; top-1 94,66 % | MIT (según repo base) | pack previo, pública en HuggingFace |
| Pesos oficiales DeepSeek-V4.1-Flash-1017 (FP8 / MXFP4) | ~99,4 B | no disponible | referencia (perplejidad 1,5614) | MIT (según repo base) | checkpoint oficial de deepseek-ai |
| API de DeepSeek | no disponible | no disponible | MMLU thinking off 84,5 % | servicio | acceso vía API |

No se dispone de comparaciones con otros modelos MoE de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Cuantización de 2,7 bpw: la divergencia frente al modelo oficial es pequeña pero real (KLD media 0,0248; p99 de 0,375). En `multilingual` el pack de 2,7 bpw es ligeramente peor que el de 2,9 bpw (0,0783 frente a 0,0669), y `chat` y `writing` son los dominios con mayor divergencia.
- Dependencia de un único motor: solo se ha probado con la rama `deepseek-v41-tp2` de TensorFold y requiere los parches incluidos. Otros motores no están soportados y el kit de Mia/LibertAIDAI no se espera que cargue el pack.
- Tablas de Engram no incluidas en el repositorio: hay que obtenerlas por otra vía para un despliegue completo.
- Uso muy ligado al hardware: las cifras de memoria y concurrencia corresponden a dos DGX Spark con ajustes concretos; no son extrapolables a otras configuraciones.
- Idiomas soportados no documentados; el comportamiento multilingüe solo está medido de forma agregada en el panel.
- Riesgo de alucinación inherente al modelo base: no se han publicado evaluaciones de factualidad ni de tasas de alucinación en la información disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Adopción muy baja (19 descargas, 1 like) y creado el 19 de octubre de 2026: no hay validación independiente de las cifras reportadas por el autor.
- Licencia MIT declarada tanto en el repo como en la model card; conviene verificar la licencia y los términos del checkpoint base antes de un uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/object-oriented-architects/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack de referencia de LibertAIDAI (2,9 bpw): https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Receta de cuantización de sudoingX: https://github.com/sudoingX/dgx-spark-deepseek-v41
- TensorFold: https://github.com/ashhart/TensorFold
- Rama TensorFold para DeepSeek-V4.1 TP2: https://github.com/bertholomus/TensorFold/tree/deepseek-v41-tp2
- Receta de evaluación de lucataco: https://github.com/lucataco/DeepSeek-V4.1-Flash-2x-DGX-Spark
- Kit de servicio de Mia/LibertAIDAI: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks
- Parches de motor incluidos en el repo: https://huggingface.co/object-oriented-architects/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw-TensorFold/tree/main/tensorfold-patches
