# jalenluorion/Inkling-2-Mini-prefetchable-store

## Resumen

Inkling-2-Mini-prefetchable-store es un reempaquetado del modelo thinkingmachines/Inkling-2-Mini (Apache-2.0, de Thinking Machines Lab, Inc.) realizado por el usuario jalenluorion. El objetivo es permitir la ejecución de un modelo de mezcla de expertos (MoE) de gran tamano en Macs y iPhones con menos memoria que la que el modelo requiere en su totalidad, manteniendo los 3.072 expertos enrutados como registros individuales en el SSD y cargandolos en una caché bloqueada a medida que las capas los necesitan.

La innovación principal es que el modelo se vuelve "prefetchable": pequenos routers entrenados nombran los expertos que un paso necesitara con dos pasos de antelación, y un router entre tokens nombra los primeros expertos del siguiente token, de modo que las lecturas desde el SSD comienzan mientras el modelo calcula otras cosas. Los pesos liberados están congelados y el router original del modelo sigue tomando todas las decisiones de enrutamiento.

El motor de inferencia es dmeng (C++), disponible en el repositorio github.com/jalenluorion/prefetchable-store, con dos modos (`exact` y `fast`) y tres perfiles (`mac`, `phone`, `phone-small`) que se seleccionan automáticamente según el dispositivo. El repositorio ocupa 28,7 GB y ha registrado 88 descargas desde su creación en noviembre de 2026. El modelo es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 3.072 expertos enrutados; transformer con routers lineales y router entre tokens |
| Parametros totales | no disponible (el modelo base no publica el dato en la informacion proporcionada) |
| Parametros activos | 8 expertos por paso (seleccionados por el router del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con grupos de 64 (`resident_q8`); 4-bit affine calibrado con grupos de 64 (`resident_q4`); NVFP4 para capas de expertos; MXFP8 para capas de expertos |
| Idiomas soportados | no disponible (el modelo es solo texto; no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (embeddings), binarios propietarios `.dmres1` y `.dmr1` (residentes y routers), stores NVFP4/MXFP8 por experto, `moved-store.json` como manifiesto |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 3.072 expertos enrutados, de los cuales el router del modelo selecciona 8 por paso. Este reempaquetado no modifica los pesos del modelo ni el router original: los pesos están congelados y el router propio del modelo sigue tomando cada decisión de enrutamiento. Lo que anade el autor son routers auxiliares entrenados (un router lineal `linear_k2` y un router entre tokens `xtok_s47_h512`) que predicen con antelación qué expertos se necesitaran, permitiendo que las lecturas desde el SSD se solapen con el cálculo.

Los perfiles `mac` y `phone` utilizan los bytes de expertos NVFP4 y MXFP8 de la release original sin cambios. El perfil `phone-small`, para telefonos con memoria limitada, usa copias NVFP4 de las cuatro capas MXFP8 y pesos en memoria de 4 bits calibrados. El motor tiene dos modos: `exact`, donde los tokens generados nunca dependen de la caché, los routers ni el timing, y `fast`, donde un experto seleccionado que no está en memoria se espera si su peso de enrutamiento supera 0,1 o si su lectura ya está en vuelo; en caso contrario se omite (sin sustituto ni renormalización). No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto: el modelo es exclusivamente de texto; no soporta visión ni audio.
- Razonamiento y generación de prosa: los benchmarks internos del autor miden coincidencia de la elección principal en posiciones de prosa (96,5-97,3% en modo `fast` frente a `exact`).
- Texto de agente: el autor reporta coincidencia del 96,6-96,7% en posiciones de texto de agente en modo `fast`.
- Enrutamiento de expertos controlado por el modelo: el router original decide cada paso; los routers auxiliares solo predicen para precargar.
- Ejecución en dispositivos con memoria limitada: perfiles para macOS, iOS con al menos 5,0 GB disponibles y iOS de clase 6 GB.
- Servidor compatible con OpenAI: `python/serve/dmserve.py` expone una API estilo OpenAI que funciona con OpenCode estándar.
- Decodificación especulativa opcional: cabecera draft (`dmeng --draft head`) disponible solo como herramienta de línea de comandos, requiere los archivos opcionales `mtp.safetensors` y `resident.safetensors` del perfil `mac`.

## Casos de uso

- Inferencia local de un MoE grande en MacBook: con el perfil `mac` y una caché de expertos dimensionada a partir de la memoria libre, el modelo se ejecuta en un M4 de 16 GB manteniendo los 3.072 expertos en SSD y cargando solo los 8 necesarios por paso. Adecuado para desarrolladores que quieren probar un MoE de gran tamano sin GPU dedicada.
- Despliegue en iPhone de clase 6 GB: el perfil `phone-small` usa pesos en memoria de 4 bits y capas NVFP4 para ajustarse a telefonos con menos de 5,0 GB disponibles, con modo `fast` por defecto.
- Servicio de API compatible con OpenAI: `dmserve.py` permite levantar un endpoint local que habla el protocolo de OpenAI, integrrable en herramientas como OpenCode sin adaptadores adicionales.
- Generación de texto de agente en local: el modo `fast` mantiene una coincidencia del 96,6-96,7% en posiciones de texto de agente respecto a `exact`, lo que lo hace util para pipelines de agentes que toleran pequeñas desviaciones a cambio de velocidad.
- Evaluación de estrategias de prefetching: el repositorio y el motor permiten comparar "on demand" (lectura de cada experto cuando su paso lo pide) frente a prefetch con nombres tempranos, util para investigación sobre gestión de memoria en MoE.
- Prototipado de aplicaciones iOS con LLM: la app en `apps/ios` descarga automáticamente el conjunto `phone` o `phone-small` y ejecuta el modelo en el dispositivo, sin servidor externo.
- Reproducibilidad de resultados: el modo `exact` garantiza que los tokens generados no dependen de la caché, los routers ni el timing, lo que permite obtener la misma salida en cada ejecución y máquina.

## Benchmarks y rendimiento

El autor reporta medidas de velocidad en un MacBook Pro M4 base con 16 GB, SSD interno, enchufado, 8 hilos, decodificación greedy y 400 tokens generados, con rango sobre dos ejecuciones. La tabla de tokens/s por tamano de caché de expertos queda incompleta en la información proporcionada (solo se incluye la columna "on demand" sin valores numéricos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor |
|---|---|
| Coincidencia de eleccion principal en prosa (modo `fast` vs `exact`, Mac) | 96,5-97,3% (cachés de 6-7,8 GB) |
| Coincidencia de eleccion principal en texto de agente (modo `fast` vs `exact`, Mac) | 96,6-96,7% |
| Tokens/s | no disponible (tabla incompleta en la informacion) |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada: el perfil `mac` reserva una caché de expertos cuyo techo es memoria física - 5,5 GB - otra memoria del proceso; se reduce 1 GB por comprobación bajo presión de memoria y vuelve a crecer. El perfil `phone` dimensiona la caché como disponible - pesos en memoria - router - 0,3 GB - 0,9 GB de margen, limitada a 0,6-8 GB.
- GPU recomendadas: no disponible; el motor está orientado a Apple Silicon (macOS e iOS).
- Cabe en GPU consumer: no aplica directamente; el objetivo son Macs e iPhones. Se ha medido en un MacBook Pro M4 base de 16 GB.
- Opciones de despliegue: motor `dmeng` (C++), servidor `dmserve.py` compatible con OpenAI, app iOS en `apps/ios`.
- Descarga por perfil: `mac` 17,99 GB (21,87 GB con archivos opcionales), `phone` 17,99 GB, `phone-small` 15,53 GB.
- Latencia y throughput: no disponible (la tabla de tokens/s está incompleta en la información).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-prefetchable-store | MoE con 3.072 expertos, 8 activos por paso | no disponible | Apache-2.0 | Hugging Face (28,7 GB), motor C++ y app iOS |
| thinkingmachines/Inkling-2-Mini (base) | MoE con 3.072 expertos | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE con expertos en SSD para Apple Silicon) en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no soporta visión, audio ni otras modalidades.
- El modo `fast` omite expertos sin sustituto ni renormalización cuando su peso de enrutamiento es bajo y su lectura no está en vuelo, lo que introduce desviaciones respecto a `exact` (medidas en 96,5-97,3% de coincidencia en prosa y 96,6-96,7% en texto de agente en Mac; para `phone-small` no se detalla la calidad en la información).
- La calidad del perfil `phone-small` no se cuantifica en la información disponible.
- Dependencia del SSD: el rendimiento depende de la velocidad de lectura del almacenamiento; no se han publicado cifras de latencia o throughput completas.
- La cabecera draft (`dmeng --draft head`) solo está disponible como herramienta de línea de comandos y requiere archivos opcionales del perfil `mac`.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base pertenece a Thinking Machines Lab, Inc. y se debe conservar el aviso de licencia (`license_link: LICENSE`).
- El repositorio tiene solo 88 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- No se especifican los idiomas soportados ni la longitud de contexto del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jalenluorion/Inkling-2-Mini-prefetchable-store
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor de inferencia (C++): https://github.com/jalenluorion/prefetchable-store
- App iOS: https://github.com/jalenluorion/prefetchable-store/tree/main/apps/ios
