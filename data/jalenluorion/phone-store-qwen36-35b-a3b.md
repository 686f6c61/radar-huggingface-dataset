# jalenluorion/phone-store-qwen36-35b-a3b

## Resumen

phone-store-qwen36-35b-a3b es un reempaquetado del modelo Qwen/Qwen3.6-35B-A3B (licencia Apache-2.0) realizado por el usuario jalenluorion, orientado a ejecutar un modelo de mezcla de expertos (MoE) de gran tamano en Macs e iPhones con menos memoria que la que requeriria el modelo completo. La idea central es mantener en memoria todos los pesos no expertos y trasladar los 10.240 expertos enrutados al SSD, con un registro por experto, que se leen a una cache bloqueada a medida que las capas los necesitan.

El modelo base es un MoE de Qwen con 35.000 millones de parametros totales y 3.000 millones de parametros activos (según la nomenclatura A3B), del que no se detallan en la informacion disponible ni la longitud de contexto nativa ni la composicion exacta del entrenamiento. El reempaquetado anade pequenos routers entrenados que predicen, con dos capas de antelacion, que expertos necesitara una capa, de modo que las lecturas desde el SSD comienzan mientras se computan las capas intermedias. Esto convierte al modelo en "prefetchable": los pesos liberados estan congelados y el router original del modelo sigue tomando todas las decisiones.

Su relevancia actual radica en que demuestra una via practica para servir modelos MoE de decenas de miles de millones de parametros en hardware de consumo (Apple Silicon, iPhone) sin renunciar a la calidad del modelo original en el modo `exact`, y con una degradacion medida y acotada en el modo `fast`. El motor es dmeng (C++), disponible en el repositorio prefetchable-store, con un servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun tag `mixture-of-experts`; pesos reempaquetados para almacen prefetchable |
| Parametros totales | 35.000 millones (según nombre del modelo, Qwen3.6-35B-A3B) |
| Parametros activos | 3.000 millones (según nombre A3B) |
| Longitud de contexto | no disponible (el perfil `phone-small` reserva 16.384 posiciones de contexto) |
| Tipos de cuantizacion | 8-bit affine con grupos de 64 (`resident_q8`, perfiles `mac` y `phone`); 4-bit affine con grupos de 64 calibrado (`resident_q4`, perfil `phone-small`); pesos fuente en bf16 (`resident.safetensors`) |
| Idiomas soportados | no disponible (la model card indica "Text only") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fuente bf16 y ficheros derivados `resident_q8`/`resident_q4`), con manifiesto `moved-store.json`; tamano del repo 68,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 10.240 expertos enrutados distribuidos por capas, de los que el router del modelo selecciona 8 por capa en el modo `exact`. Sobre esa base, el reempaquetado separa los pesos residentes (no expertos, en 8 o 4 bits segun perfil) de los expertos, que se almacenan en el SSD como registros individuales y se cargan en una cache bloqueada cuyo tamano se calcula a partir de la memoria libre en el arranque. La innovacion principal son unos routers auxiliares entrenados (`routers/linear_k2.safetensors`) que predicen con dos capas de antelacion los expertos que necesitara una capa, permitiendo solapar la lectura desde disco con el computo de las capas intermedias.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. En el reempaquetado, los pesos liberados estan congelados y el router original sigue tomando todas las decisiones de enrutamiento; los routers de prediccion solo anticipan lecturas. El motor ofrece dos modos: `exact`, en el que los tokens generados no dependen de la cache ni de los tiempos (se espera a los 8 expertos elegidos por capa), y `fast`, en el que un experto elegido que no esta en memoria se lee y se espera si su peso de enrutamiento supera 0,15 (0,10 en `phone-small`), y en caso contrario se omite sin sustituto ni renormalizacion.

## Capacidades

- Generacion de texto en modo solo texto ("Text only" segun la model card); no se declaran capacidades de vision ni audio.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B, con calidad medida en posiciones de prosa y codigo en el modo `fast`.
- Ejecucion local en Apple Silicon (macOS) e iOS (iPhone), con perfiles adaptados automaticamente al dispositivo.
- Dos modos de inferencia: `exact` (determinista respecto a la cache) y `fast` (con omision controlada de expertos fuera de memoria).
- Servidor compatible con la API de OpenAI (`dmserve.py`), utilizable con clientes como OpenCode.
- Gestion de memoria dinamica: la cache de expertos se dimensiona al arrancar y se reduce 1 GB por comprobacion bajo presion de memoria, creciendo de nuevo cuando hay holgura.
- Memoria de respaldo en iPhones con 11 GB o mas: los expertos que no caben en la cache de la app se usan desde la cache de ficheros del sistema y los reutilizados migran a la cache de la app.
- Soporte de tool calling y agentes: no disponible de forma explicita en la informacion; la model card menciona evaluacion sobre "agent-text positions".

## Casos de uso

- Inferencia local en Mac de 16 GB: el perfil `mac` (21,31 GB de descarga, 49 ficheros) permite ejecutar el modelo con pesos residentes en 8 bits y una cache de expertos dimensionada desde la memoria libre, cerrando otras aplicaciones grandes antes de arrancar.
- Asistente de codigo en iPhone: el perfil `phone` (iOS con al menos 5,0 GB disponibles) usa modo `fast` por defecto y sirve para autocompletado y generacion de codigo en el propio dispositivo, con calidad de eleccion top igual a `exact` en 591 de 600 posiciones de texto de agente en un iPhone 15 Plus.
- Despliegue de un endpoint compatible con OpenAI en local: `python3 python/serve/dmserve.py --model-dir model --port 8090` expone el modelo para herramientas que hablan el protocolo de OpenAI, sin depender de la nube.
- Prototipado de agentes multi-paso en hardware de consumo: el modo `exact` garantiza tokens identicos en cada ejecucion y maquina, lo que facilita la reproducibilidad en pruebas de agentes y evaluaciones.
- Demostracion de tecnicas de prefetching de expertos: util para investigadores que estudien el compromiso entre memoria, latencia de SSD y calidad en modelos MoE, con modos y perfiles conmutables por linea de comandos.
- Uso en telefonos de la clase de 6 GB: el perfil `phone-small` (descarga de 20,35 GB, pesos residentes en 4 bits calibrados, cache de 1,42 GB y huella objetivo de 2,96 GB) permite ejecutar el modelo en dispositivos con memoria muy limitada.
- Generacion de texto creativo y prosa en Mac: con una cache de 6,6 GB, la eleccion top del modo `fast` coincide con `exact` en el 98,7 % de las posiciones de prosa y el 97,6 % de las de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card unicamente reporta metricas de coincidencia entre modos:

| Metrica | Valor |
|---|---|
| Coincidencia top `fast` vs `exact` en prosa (Mac, cache 6,6 GB) | 0,987 |
| Coincidencia top `fast` vs `exact` en codigo (Mac, cache 6,6 GB) | 0,976 |
| Coincidencia `fast` vs `exact` en iPhone 15 Plus (texto de agente) | 591 de 600 posiciones |

## Requisitos de hardware

- Perfil `mac`: descarga de 21,31 GB (49 ficheros); pesos residentes en 8 bits; cache de expertos bloqueada con techo igual a memoria fisica menos 5,5 GB menos el resto de memoria del proceso. En una maquina de 16 GB conviene cerrar otras aplicaciones grandes antes de arrancar.
- Perfil `phone`: requiere iOS con al menos 5,0 GB disponibles al abrir; cache dimensionada como disponible menos pesos residentes, router, 0,3 GB y 0,9 GB de margen, acotada entre 0,6 y 8 GB; 8 hilos de lectura; reparto GPU de 0,65 para proyecciones y 0,65 para expertos.
- Perfil `phone-small`: para dispositivos de la clase de 6 GB; pesos residentes en 4 bits calibrados, cache de 1,42 GB y huella de app objetivo de 2,96 GB; reserva 16.384 posiciones de contexto.
- GPU recomendadas: no disponible; el motor esta orientado a Apple Silicon (macOS e iOS) y reparte trabajo entre CPU y GPU del dispositivo.
- Cabe en GPU de consumo: no disponible; el diseno esta pensado para Macs e iPhones, no para GPUs NVIDIA.
- Opciones de despliegue: motor `dmeng` (C++) compilado con CMake, servidor compatible con OpenAI (`dmserve.py`), app de iOS en `apps/ios`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que el prefetching solapa lecturas de SSD con computo y que el modo `fast` omite expertos fuera de memoria cuyo peso de enrutamiento no supera 0,15.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phone-store-qwen36-35b-a3b | 35B totales / 3B activos | no disponible | Apache-2.0 | Hugging Face, motor dmeng, app iOS | Reempaquetado para Apple Silicon con expertos en SSD |
| Qwen/Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | Apache-2.0 | Hugging Face | Modelo base original; requiere memoria para todos los pesos |
| Otros MoE de ~30-40B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

## Limitaciones y advertencias

- Solo texto: no hay capacidades multimodales declaradas.
- El modo `fast` puede omitir expertos cuyo peso de enrutamiento no supera el umbral, sin sustituto ni renormalizacion y sin limite de peso omitido por paso; la calidad no es identica a `exact` (coincidencia de 0,987 en prosa y 0,976 en codigo en Mac con cache de 6,6 GB).
- El rendimiento depende de la velocidad del SSD y de la memoria libre al arrancar; en maquinas de 16 GB la cache puede reducirse bajo presion de memoria (1 GB por comprobacion).
- En iPhones con menos de 5,0 GB disponibles se usa `phone-small` con pesos en 4 bits, lo que puede degradar la calidad respecto a 8 bits.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni idiomas soportados del modelo base o del reempaquetado.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; el modelo base y los routers auxiliares deben verificarse contra los sha256 de `moved-store.json`.
- El repositorio ocupa 68,9 GB; las descargas por perfil son parciales (21,31 GB en `mac` y `phone`, 20,35 GB en `phone-small`).
- La model card esta truncada en la informacion disponible, por lo que pueden faltar detalles sobre el perfil `phone-small` y el proceso de generacion de ficheros derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalenluorion/phone-store-qwen36-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del motor: https://github.com/jalenluorion/prefetchable-store
- App de iOS: https://github.com/jalenluorion/prefetchable-store/tree/main/apps/ios
