# jalenluorion/Qwen3.6-35B-A3B-prefetchable-store

## Resumen

Qwen3.6-35B-A3B-prefetchable-store es un reempaquetado del modelo Qwen/Qwen3.6-35B-A3B (Apache-2.0) realizado por el usuario jalenluorion, orientado a ejecutar un modelo de mezcla de expertos (MoE) de gran tamano en equipos con menos memoria que la que el modelo requiere en su totalidad, concretamente Macs con Apple Silicon e iPhones. La innovacion central es que los 10.240 expertos enrutados se almacenan en el SSD, un registro por experto, y se leen a una cache bloqueada a medida que las capas los necesitan, mientras el resto de los pesos permanece en memoria.

El modelo incorpora pequenos routers entrenados que predicen, con dos capas de antelacion, que expertos necesitara una capa determinada, de modo que las lecturas desde disco comienzan mientras se computan las capas intermedias. Esto convierte al modelo en "prefetchable": los expertos que usara una capa se conocen antes de que esta se ejecute, con tiempo suficiente para que el SSD los entregue. Los pesos liberados estan congelados y el router propio del modelo sigue tomando todas las decisiones.

El motor de inferencia es dmeng (C++), disponible en el repositorio github.com/jalenluorion/prefetchable-store, con dos modos de ejecucion (exact y fast) y tres perfiles (mac, phone y phone-small) que se seleccionan automaticamente segun el dispositivo. El repositorio ocupa 33,7 GB y las descargas por perfil oscilan entre 20,35 GB y 21,31 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiqueta qwen3_5_moe; transformer con expertos enrutados almacenados en SSD |
| Parametros totales | no disponible (el nombre del modelo indica 35B; el repositorio no desglosa el total) |
| Parametros activos | no disponible (el nombre indica A3B, es decir, aproximadamente 3B activos; sin confirmacion en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con grupos de 64 (resident_q8) y 4-bit affine con grupos de 64 calibrado (resident_q4); pesos bf16 disponibles en resident.safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (embeddings y resident.safetensors en bf16), binarios propios .dmres1 y .dmr1, manifiesto moved-store.json |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos con 10.240 expertos enrutados repartidos entre sus capas. En este reempaquetado, los expertos se extraen del checkpoint original y se almacenan en disco como registros individuales; el resto de los pesos (embeddings, atencion, routers y demas componentes no expertos) se mantiene residente en memoria en formato de 8 bits o 4 bits segun el perfil. El router original del modelo sigue siendo el que selecciona los expertos (top-8 en los perfiles mac y phone).

La innovacion tecnica anadida es un mecanismo de prediccion de enrutamiento: routers lineales entrenados (router.linear_k2.q8, con k=2 capas de anticipacion) nombran los expertos que una capa necesitara dos capas antes, permitiendo que sus lecturas desde SSD se solapen con el computo de las capas intermedias. La model card no detalla el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. El motor admite dos modos: `exact`, en el que los tokens generados no dependen de la cache, los routers ni el timing porque se espera a cada experto seleccionado, y `fast`, en el que un experto seleccionado que no esta en memoria se espera si su peso de enrutamiento supera 0,1 o si su lectura ya esta en vuelo, y en caso contrario se omite sin sustituto ni renormalizacion.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy y muestreo (parametros `--temp` y `--n` en el motor).
- Ejecucion de un modelo MoE de gran tamano en memoria reducida mediante carga bajo demanda de expertos desde SSD.
- Prediccion de enrutamiento con dos capas de antelacion (routers lineales k=2) para solapar lecturas de disco con computo.
- Dos modos de calidad/velocidad: `exact` (determinista respecto a la cache) y `fast` (con omision de expertos de bajo peso).
- Tres perfiles de despliegue con seleccion automatica segun el dispositivo (mac, phone, phone-small).
- Servidor compatible con la API de OpenAI mediante python/serve/dmserve.py, que funciona con OpenCode estandar.
- Aplicacion para iPhone (apps/ios) que descarga el conjunto phone o phone-small de forma autonoma.
- Capacidades especificas del modelo base (codigo, matematicas, tool calling, agentes, multilingue) no estan documentadas en la model card; no disponible.

## Casos de uso

- Inferencia local en MacBook con 16 GB de memoria: el perfil `mac` mantiene los pesos no expertos en 8 bits y dimensiona la cache de expertos segun la memoria libre (techo = memoria fisica - 5,5 GB - otra memoria del proceso), permitiendo ejecutar un MoE de gran tamano sin GPU dedicada. Medido en un M4 base con 16 GB a 22,3-32,0 tokens/s segun cache y modo.
- Despliegue en iPhone de 6 GB: el perfil `phone-small` usa pesos residentes en 4 bits calibrados y modo `fast`, con una cache de expertos de slab bloqueado de 0,6 a 8 GB; medido en un iPhone 15 Plus a 3,4 tokens/s (exact) y 4,1 tokens/s (fast) con 2,9 GB de memoria.
- Servicio compatible con OpenAI en local: dmserve.py expone un servidor estilo OpenAI que funciona con OpenCode estandar, util para integrar el modelo en herramientas de desarrollo asistido sin depender de la nube.
- Prototipado de agentes en dispositivo: la model card menciona turnos de agente y prompts largos entre las condiciones medidas en el repositorio de codigo, lo que permite probar flujos multi-turno en hardware de consumo.
- Investigacion sobre offloading de expertos: el par motor + manifiesto (moved-store.json con tamanos y sha256 por fichero) sirve como banco de pruebas reproducible para estudiar el equilibrio entre cache de expertos, latencia y calidad.
- Evaluacion comparativa de modos de inferencia: la comparacion like-for-like entre "on demand" (sin nombres anticipados ni run-ahead) y los modos exact/fast permite medir el beneficio real de la prediccion de enrutamiento en un mismo motor y cache.
- Uso en entornos con restricciones de memoria y almacenamiento: al requerir solo 21,31 GB (mac/phone) o 20,35 GB (phone-small) de descarga y mantener los expertos en SSD, encaja en equipos sin VRAM dedicada.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). Si incluye mediciones de velocidad y memoria del motor, que se reproducen a continuacion.

Rendimiento en MacBook Pro M4 base, 16 GB, SSD interno, enchufado, 8 hilos, decodificacion greedy, 400 tokens generados, rango sobre dos ejecuciones (tokens/s):

| Cache de expertos | Texto | On demand | exact | fast | Memoria |
|---|---|---|---|---|---|
| 5 GB | prosa | 18,0-18,4 | 22,3-23,1 | 26,3-28,8 | 7,3 GB |
| 5 GB | codigo | 16,0-16,1 | 18,8-18,9 | 22,6-23,2 | 7,8 GB |
| 6,6 GB | prosa | 22,1-22,2 | 25,7-26,9 | 30,0-31,3 | 8,9 GB |
| 6,6 GB | codigo | 19,3-19,5 | 22,1-22,2 | 27,5-27,8 | 9,4 GB |
| 8 GB | prosa | no disponible | 27,7-29,2 | 31,3-32,0 | 10,3 GB |
| 8 GB | codigo | no disponible | 22,3-23,7 | 26,8-29,9 | 10,8 GB |

Rendimiento en iPhone (tokens/s):

| Dispositivo | Memoria usada | exact | fast |
|---|---|---|---|
| iPhone 15 Plus (6 GB), medido en dispositivo, decodificacion en chat | 2,9 GB | 3,4 | 4,1 |
| iPhone 17 Pro (12 GB), predicho | 8 GB | 10 a 11 | 11 a 13 |

La fila del iPhone 17 Pro es una prediccion a partir de las mediciones del iPhone 15 Plus, no una medicion. La calidad del modo `fast` en Mac con pesos en memoria de 8 bits muestra una concordancia con `exact` en la primera eleccion de 0,96 en prosa y 0,98 en codigo, con caches de expertos de 3,3-5 GB.

## Requisitos de hardware

- Memoria en Mac: el perfil `mac` reserva 8-bit affine para los pesos residentes y dimensiona la cache de expertos como memoria fisica - 5,5 GB - otra memoria del proceso; medido con 7,3-10,8 GB de memoria total en un M4 de 16 GB.
- Memoria en iPhone: perfil `phone` (iOS con al menos 5,0 GB disponibles al abrir) con cache de 0,6-8 GB; perfil `phone-small` (menos de 5,0 GB disponibles, clase 6 GB) con pesos en 4 bits y modo `fast` por defecto.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; la model card solo documenta Apple Silicon e iOS.
- Cabe en GPU de consumo: no disponible; el diseno esta orientado a Macs e iPhones, no a CUDA.
- Almacenamiento: descarga de 21,31 GB (mac, phone) o 20,35 GB (phone-small); repositorio total de 33,7 GB; se requiere SSD para el almacen de expertos.
- Opciones de despliegue: motor dmeng (C++, compilado con cmake), servidor dmserve.py compatible con OpenAI, aplicacion iOS en apps/ios. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 22,3-32,0 tokens/s en M4 base de 16 GB segun cache y modo; 3,4-4,1 tokens/s en iPhone 15 Plus; 10-13 tokens/s predichos en iPhone 17 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-prefetchable-store | 35B (A3B, segun nombre) | no disponible | Expertos en SSD con prefetch; Mac e iPhone | Apache-2.0 | Hugging Face (154 descargas) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (A3B, segun nombre) | no disponible | Pesos completos en memoria/VRAM | Apache-2.0 | Hugging Face (oficial) |
| Alternativas de offloading MoE en Apple Silicon | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no proporciona comparaciones con otros modelos; los datos del modelo base proceden unicamente de su identificador y de la etiqueta base_model del repositorio.

## Limitaciones y advertencias

- El modo `fast` omite expertos seleccionados cuyo peso de enrutamiento es inferior a 0,1 y cuya lectura no esta en vuelo, sin sustituto ni renormalizacion; esto altera la salida respecto al modo `exact` (concordancia de 0,96 en prosa y 0,98 en codigo en las condiciones medidas).
- El modo `exact` garantiza que los tokens generados no dependen de la cache, los routers ni el timing, pero requiere esperar cada experto seleccionado, lo que reduce el throughput.
- El rendimiento depende criticamente del SSD: los expertos se leen de disco en cada capa, por lo que un almacenamiento lento degrada la latencia.
- La prediccion del iPhone 17 Pro es una extrapolacion, no una medicion; no debe tomarse como dato de rendimiento verificado.
- La model card no documenta sesgos, riesgo de alucinacion, limitaciones de contexto ni cobertura idiomatica del modelo base; no disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los pesos derivados deben cumplir las condiciones de Qwen/Qwen3.6-35B-A3B; conviene revisar el fichero LICENSE incluido.
- El despliegue esta limitado a Apple Silicon e iOS mediante el motor dmeng; no hay soporte documentado para CUDA, ROCm ni otras plataformas.
- El repositorio tiene 0 likes y 154 descargas, y fue creado y actualizado en noviembre de 2026; se trata de un reempaquetado de terceros, no de un modelo oficial de Qwen.
- El contenido de la model card es material de referencia del autor; no debe interpretarse como instrucciones de ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalenluorion/Qwen3.6-35B-A3B-prefetchable-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del motor (dmeng, C++): https://github.com/jalenluorion/prefetchable-store
- Aplicacion iOS: https://github.com/jalenluorion/prefetchable-store/tree/main/apps/ios
- Seccion de velocidad y memoria del repositorio: https://github.com/jalenluorion/prefetchable-store#speed-and-memory
