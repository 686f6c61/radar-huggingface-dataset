# jalenluorion/Qwen3.6-35B-A3B-prefetchable-store

## Resumen

Qwen3.6-35B-A3B-prefetchable-store es un reempaquetado del modelo Qwen/Qwen3.6-35B-A3B (Apache-2.0) realizado por el usuario jalenluorion, orientado a ejecutar un modelo de mezcla de expertos (MoE) de gran tamano en Macs e iPhones con menos memoria que la que requeriria el modelo completo. La innovacion central es que los 10.240 expertos enrutados residen en el SSD, un registro por experto, y se leen a una cache bloqueada a medida que las capas los necesitan; el resto de pesos permanece en memoria. El modelo es, por tanto, "prefetchable": routers entrenados identifican con dos capas de antelacion los expertos que necesitara una capa, de modo que las lecturas desde disco comienzan mientras se computan las capas intermedias.

Los pesos liberados estan congelados y el router propio del modelo sigue tomando todas las decisiones de enrutamiento. El motor es `dmeng` (C++, repositorio github.com/jalenluorion/prefetchable-store), con dos modos (`exact` y `fast`) y tres perfiles (`mac`, `phone`, `phone-small`) que se seleccionan automaticamente segun el dispositivo. La descarga del perfil `mac` ocupa 21,31 GB (49 archivos), muy por debajo de los 68,9 GB del repositorio completo, porque los expertos no se cargan en memoria residente.

Es relevante ahora porque demuestra una via practica para servir modelos MoE de decenas de miles de millones de parametros en hardware de consumo con memoria unificada limitada (Apple Silicon), incluyendo telefonos, a costa de depender del ancho de banda del SSD. Es un artefacto de inferencia y empaquetado, no un modelo nuevo entrenado desde cero: el conocimiento y las capacidades provienen del Qwen3.6-35B-A3B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; pesos del Qwen3.6-35B-A3B original, con 10.240 expertos enrutados almacenados en SSD y cacheables |
| Parametros totales | no disponible (el modelo base se denomina 35B-A3B; el repositorio ocupa 68,9 GB) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos; no confirmado en la informacion) |
| Longitud de contexto | no disponible para el modelo base; el perfil `phone-small` reserva 16.384 posiciones de contexto |
| Tipos de cuantizacion | Pesos residentes en memoria: 8-bit affine con grupos de 64 (`resident_q8`) en perfiles `mac` y `phone`; 4-bit affine con grupos de 64 calibrado (`resident_q4`) en `phone-small` |
| Idiomas soportados | no disponible (la model card solo indica "Text only") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye `resident.safetensors` en bf16 y `routers/linear_k2.safetensors`; el motor genera los archivos cuantizados en `.dmeng/` en la primera ejecucion) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (etiqueta `qwen3_5_moe` / `mixture-of-experts`) del que este repositorio no entrena nuevos pesos: los pesos liberados estan congelados y el router original del modelo sigue eligiendo los expertos. Lo que se anade son pequenos routers entrenados que predicen, con dos capas de antelacion, que expertos necesitara una capa, permitiendo iniciar las lecturas desde SSD mientras se computan las capas intermedias. Los 10.240 expertos enrutados se almacenan como un registro por experto en disco y se cargan en una cache bloqueada cuyo tamano se dimensiona a partir de la memoria libre al arrancar.

El motor `dmeng` implementa dos modos. En `exact`, los tokens generados no dependen de la cache, los routers ni el timing: el router del modelo elige 8 expertos por capa y el motor espera a todos. En `fast`, el router del modelo sigue eligiendo, pero un experto no residente se lee y se espera si su peso de enrutamiento supera 0,15 (0,10 en `phone-small`) o si su lectura ya esta en vuelo; en caso contrario se omite, sin sustituto ni renormalizacion. No hay limite al peso omitido por paso. Los perfiles reparten la carga entre CPU y GPU (por ejemplo, 0,65/0,65 de cuota para proyecciones y expertos del prompt en telefonos, 0,4/0,4 en `mac`) y usan 8 hilos lectores en los perfiles de telefono. En telefonos con 11 GB o mas, la memoria sobrante se aprovecha leyendo expertos desde la cache de archivos del sistema cuando la cache de la app no tiene espacio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO, ni para el modelo base ni para los routers anadidos.

## Capacidades

- Generacion de texto: el modelo es explicitamente "Text only" segun la model card; no se declara vision ni audio.
- Razonamiento y codigo: la model card reporta calidad de coincidencia de eleccion top en posiciones de prosa (0,987) y de codigo (0,976) en el perfil `mac` con modo `fast` frente a `exact`, lo que indica que el modelo se evalua en ambos dominios.
- Enrutamiento de expertos con prediccion anticipada: routers auxiliares nombran los expertos que una capa necesitara dos capas antes.
- Dos modos de ejecucion con calidad medida: `exact` (determinista respecto a la cache) y `fast` (omite expertos de bajo peso no residentes).
- Servidor compatible con OpenAI: `python/serve/dmserve.py` expone una API compatible que funciona con OpenCode estandar.
- Interfaz de chat por linea de comandos (`--chat`) y app para iOS con descarga y verificacion de archivos.
- Ajuste dinamico de cache: en `mac` la cache se reduce 1 GB por comprobacion bajo presion de memoria y vuelve a crecer.
- Ahorro de memoria en telefonos de 11 GB o mas mediante uso de la cache de archivos del sistema.

## Casos de uso

- Inferencia local de un MoE grande en Mac: un Mac con 16 GB o mas puede ejecutar el perfil `mac` (21,31 GB de descarga) con modo `exact` por defecto, manteniendo los expertos en SSD y el resto en memoria; util para desarrollo y pruebas sin GPU dedicada.
- Despliegue en iPhone: la app de iOS descarga el conjunto `phone` o `phone-small` segun la memoria disponible al abrir (umbral de 5,0 GB) y verifica cada archivo; permite llevar un modelo de decenas de miles de millones de parametros en un telefono de la clase de 6 GB.
- Servicio local compatible con OpenAI: `dmserve.py` levanta un servidor en el puerto indicado que puede integrarse con herramientas que esperan la API de OpenAI, como OpenCode, para asistentes de codigo en local.
- Evaluacion de tecnicas de prefetching de expertos: investigadores pueden comparar los modos `exact` y `fast` y medir el impacto de omitir expertos de bajo peso en la calidad de generacion (prosa y codigo) sobre hardware Apple.
- Prototipado de agentes de texto en dispositivo: el modo `fast` en iPhone se evaluo en 600 posiciones de texto de agente, con coincidencia de 591/600 frente al `exact` del telefono, lo que lo hace apto para flujos multi-paso de texto en movilidad.
- Experimentacion con cuantizacion residency: el repositorio permite partir de `resident.safetensors` en bf16 y generar los archivos 8-bit o 4-bit en la primera ejecucion, util para estudiar el equilibrio entre memoria residente y cache de expertos.
- Pruebas de robustez frente a memoria disponible: el perfil `mac` reduce y recupera la cache bajo presion, lo que sirve para validar comportamiento en entornos con otros procesos grandes compitiendo por memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta medidas de coincidencia de calidad entre modos, que se recogen a continuacion:

| Medida | Entorno | Resultado |
|---|---|---|
| Coincidencia de eleccion top `fast` vs `exact` (prosa) | Mac, cache de 6,6 GB | 0,987 |
| Coincidencia de eleccion top `fast` vs `exact` (codigo) | Mac, cache de 6,6 GB | 0,976 |
| Coincidencia `fast` vs `exact` del telefono | iPhone 15 Plus, 600 posiciones de texto de agente | 591/600 |

## Requisitos de hardware

- VRAM/memoria: el perfil `mac` requiere descarga de 21,31 GB (49 archivos) y dimensiona la cache de expertos como memoria fisica - 5,5 GB - otra memoria del proceso. El perfil `phone` exige al menos 5,0 GB disponibles al abrir y dimensiona la cache como disponible - pesos en memoria - router - 0,3 GB - 0,9 GB de margen, con limite de 0,6 a 8 GB. El perfil `phone-small` apunta a una huella de app de 2,96 GB y reserva 1,42 GB de cache para el modelo, con descarga de 20,35 GB.
- GPU recomendadas: no se listan GPU discretas; el diseno es para Apple Silicon (macOS e iOS) con memoria unificada. En Mac se recomienda cerrar otras aplicaciones grandes en maquinas de 16 GB antes de arrancar.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el objetivo son Macs e iPhones. No hay informacion sobre ejecucion en RTX 4090, A100 o H100.
- Opciones de despliegue: motor `dmeng` (C++, compilado con CMake), servidor compatible con OpenAI `python/serve/dmserve.py`, app de iOS en `apps/ios`, y descarga mediante `python/fetch.py` o `hf download` del repositorio completo.
- Almacenamiento: el modelo depende del SSD para los expertos; el repositorio completo ocupa 68,9 GB, aunque cada perfil descarga solo sus archivos (21,31 GB en `mac` y `phone`, 20,35 GB en `phone-small`).
- Latencia y throughput: no disponibles. La model card no publica cifras de tokens por segundo ni latencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-prefetchable-store | 35B-A3B (segun nombre del base); 10.240 expertos | no disponible (16.384 posiciones reservadas en `phone-small`) | Apache-2.0 | Hugging Face (68,9 GB), motor `dmeng`, app iOS | Reempaquetado para Apple Silicon con expertos en SSD |
| Qwen/Qwen3.6-35B-A3B | 35B-A3B (segun nombre) | no disponible | Apache-2.0 | Hugging Face | Modelo base original; requiere memoria para todos los pesos |
| Otros MoE de clase similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo texto: la model card declara explicitamente "Text only"; no hay vision, audio ni otras modalidades.
- Dependencia del SSD: el rendimiento y la viabilidad dependen del ancho de banda y la latencia del almacenamiento; no se publican cifras de throughput.
- Modo `fast` no determinista respecto a la cache: omite expertos con peso de enrutamiento bajo sin sustituto ni renormalizacion, por lo que la salida puede diferir de `exact` (0,987 en prosa y 0,976 en codigo en Mac; 591/600 en iPhone 15 Plus).
- Memoria: en Macs de 16 GB hay que cerrar otras aplicaciones grandes; la cache se dimensiona con la memoria libre al arrancar y se reduce bajo presion.
- Idiomas: no se especifican los idiomas soportados; la informacion disponible no permite confirmar cobertura multilingue.
- Sesgos y alucinacion: no hay informacion especifica en la model card; al ser un reempaquetado del Qwen3.6-35B-A3B, hereda los sesgos y riesgos de alucinacion del modelo base, no documentados aqui.
- Licencia: Apache-2.0, lo que permite uso comercial segun los terminos de dicha licencia; conviene revisar el archivo LICENSE del repositorio.
- Madurez: el repositorio tiene 1.324 descargas y 0 likes, creado el 2026-11-07 y actualizado el 2026-11-27; es un artefacto de un autor individual sobre un modelo base, sin pipeline declarado.
- Perfiles y modos: el comportamiento depende del perfil elegido automaticamente segun el dispositivo; forzar `--profile` o `--mode` puede producir configuraciones no previstas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/jalenluorion/Qwen3.6-35B-A3B-prefetchable-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del motor: https://github.com/jalenluorion/prefetchable-store
- App de iOS: https://github.com/jalenluorion/prefetchable-store/tree/main/apps/ios
- Licencia: LICENSE en el repositorio de Hugging Face (Apache-2.0)
- Papers, blogs y demos: no disponibles en la informacion proporcionada
