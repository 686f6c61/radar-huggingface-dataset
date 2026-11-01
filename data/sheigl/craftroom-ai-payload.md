# sheigl/craftroom-ai-payload

## Resumen

Craft Room AI payload es un conjunto de artefactos CoreML precompilados (`.mlmodelc`) para inferencia en dispositivo del pipeline de generacion de laminas para colorear de la aplicacion Craft Room AI. Se construye a partir de `black-forest-labs/FLUX.2-klein-base-4B`, un modelo de difusion de texto a imagen de 4.000 millones de parametros, al que se le ha fusionado un LoRA personalizado de imagen a imagen (v2.1, rango 16, 1.500 pasos) y posteriormente se ha cuantizado a int8 y compilado para Apple Silicon (CPU, GPU y Neural Engine mediante el formato MLProgram `neural_network`).

No se trata de un checkpoint portable de transformers o diffusers, sino del payload exacto de descarga en primer arranque que una iPad obtiene por HTTPS y ejecuta sin modificaciones. El repositorio existe porque el limite `ITMS-90558` de Apple restringe el bundle adelgazado de una app a menos de 4 GB, y solo el DiT en int8 ya ocupa 3,88 GB de `weight.bin` (el `.app` empaquetado anterior medía 4.078.949.396 bytes). La ipa distribuye unicamente el arnes y bins pequenos (unos 50 MB); los modelos se sirven desde este repositorio mediante un CDN publico con soporte de rangos y reanudacion, sin necesidad de token en el dispositivo.

El interes practico del repositorio es acotado pero muy concreto: demuestra un flujo completo de despliegue de un modelo de difusion de 4B en iOS con cuantizacion int8 por canal, pesos compilados en el objetivo y verificacion de integridad mediante manifiesto con SHA-256. No es reutilizable como modelo generico fuera de Core ML, pero sirve como referencia de ingenieria para quien necesite llevar difusion a produccion en dispositivos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) derivado de FLUX.2-klein-base-4B, exportado a Core ML MLProgram |
| Parametros totales | 4.000 millones (modelo base FLUX.2-klein-base-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin contexto de texto definido en la model card) |
| Tipos de cuantizacion | int8 por canal en pesos del DiT, activaciones fp16; VAE en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de FLUX.2-klein-base-4B) |
| Formato de pesos | `.mlmodelc` compilado (Core ML); `weight.bin` propietario de Core ML, no recargable como checkpoint portable |
| Tamano del repositorio | 4,0 GB |
| Tamano del DiT int8 | 3.698 MiB (`weight.bin`) |
| VAE decoder | ~95 MiB, fp16, entrada latente estatica 48x48 |
| VAE encoder | ~66 MiB, fp16, entrada estatica 1248x832 (apaisado) |
| Pipeline | image-to-image |
| Plataforma objetivo | iOS 17, arm64, Apple Silicon (CPU/GPU/ANE) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusion (DiT) de FLUX.2-klein-base-4B, un modelo de 4.000 millones de parametros de la familia FLUX.2 de Black Forest Labs. Sobre el checkpoint FP16 se fusiono un LoRA de imagen a imagen especifico para generacion de laminas para colorear, con rango 16 y 1.500 pasos de entrenamiento (configuracion "Converter v2.1"). La fusion se realizo antes de la exportacion, de modo que el payload final no requiere cargar el adaptador por separado.

El proceso de exportacion parte del camino de edicion de `Flux2KleinPipeline` de diffusers y se convierte a Core ML mediante `coretool`/`coremlbuild` con compilacion en el objetivo, ejecutada en un runner `macos-latest` de GitHub Actions con destino iOS 17 y arm64. El DiT se cuantiza a int8 por canal en pesos manteniendo activaciones en fp16; los VAE encoder y decoder se conservan en fp16 con formas de entrada estaticas (1248x832 y 48x48 respectivamente). El companion bake (embeddings de texto, estadisticas de normalizacion, sigmas e ids de posicion) se distribuye como bins planos little-endian dentro de la ipa, no en este repositorio. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes de imagen a imagen (image-to-image) orientada a la conversion de fotografias o bocetos en laminas para colorear.
- Edicion de imagen guiada por texto, heredada del pipeline de edicion de FLUX.2-klein-base-4B.
- Ejecucion completamente en dispositivo en Apple Silicon, con reparto entre CPU, GPU y Neural Engine.
- Cuantizacion int8 con verificacion de integridad por SHA-256 y tamano antes de la instalacion.
- Descarga reanudable por rangos HTTP desde CDN publico, sin autenticacion en el dispositivo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de difusion de imagen, no un LLM.
- Capacidades multilingues: no disponible (no se documentan idiomas; el prompt de texto se procesa mediante el bake de embeddings, no mediante un tokenizador expuesto en este repositorio).

## Casos de uso

- Aplicacion iOS de colorear para ninos: el payload se descarga en el primer arranque y permite generar laminas a partir de fotos o dibujos del usuario sin conexion posterior, aprovechando el reparto CPU/GPU/ANE de Core ML.
- Prototipado de pipelines de difusion en dispositivo: sirve como referencia de exportacion de un DiT de 4B a Core ML con cuantizacion int8 por canal y compilacion en el objetivo.
- Distribucion de modelos que exceden el limite de bundle de Apple: el esquema de manifiesto con `path`, `size`, `sha256` y `url` es directamente reutilizable para cualquier app que supere los 4 GB de `ITMS-90558`.
- Verificacion de integridad en produccion: el doble control (tamano antes de instalar, SHA-256 tras la descarga) es aplicable a cualquier payload de modelos descargado en caliente.
- Personalizacion de estilo mediante LoRA fusionado: el flujo de fusion de un adaptador de rango 16 en el checkpoint FP16 antes de la exportacion es replicable para otros estilos o dominios.
- Evaluacion de latencia en iPad: permite medir el rendimiento real de un DiT de 4B en int8 sobre Neural Engine con entradas estaticas de 1248x832.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score), latencia por iteracion ni throughput en dispositivo.

## Requisitos de hardware

- VRAM equivalente: el DiT int8 ocupa 3.698 MiB de pesos; con activaciones fp16 y el resto del pipeline, el consumo en memoria unificada se situa por encima de 4 GB.
- Plataforma objetivo: iOS 17 sobre arm64 (Apple Silicon). No esta pensado para GPU NVIDIA ni para servidores x86.
- Encaje en hardware de consumo: si, en iPad y iPhone con chip de la serie A o M reciente; el limite practico es la memoria unificada del dispositivo, no la VRAM dedicada.
- Despliegue: exclusivamente mediante Core ML (`coretool`/`coremlbuild`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint de transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Craft Room AI payload (este) | 4.000 M | Core ML `.mlmodelc` int8/fp16 | entrada estatica 1248x832 | Apache-2.0 | HuggingFace, 0 descargas |
| FLUX.2-klein-base-4B | 4.000 M | safetensors (diffusers) | no disponible | Apache-2.0 | HuggingFace (modelo base) |
| Alternativas de difusion en dispositivo | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa posible es con el modelo base del que deriva: mismo numero de parametros y misma licencia, pero distinto formato (portable frente a compilado) y con el LoRA de colorear fusionado en el payload. No se dispone de informacion sobre otros payloads Core ML comparables en la busqueda realizada.

## Limitaciones y advertencias

- El `weight.bin` esta compilado para el dispositivo y solo es cargable por Core ML; no se puede recargar como checkpoint portable ni reutilizar fuera de Apple Silicon.
- La entrada del VAE encoder es estatica (1248x832 apaisado) y la del decoder 48x48 latente; no admite resoluciones arbitrarias sin recompilar.
- El LoRA esta especializado en laminas para colorear (v2.1, rango 16); el modelo no es un generador de imagenes generico.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni evaluaciones de calidad; el repositorio tiene 0 descargas y 0 likes, sin validacion externa.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de FLUX.2-klein-base-4B y de los datos de entrenamiento del LoRA.
- El manifiesto no debe editarse a mano: la republicacion exige regenerarlo con `scripts/publish_device_payload.py` del repositorio del arnes.
- Dependencia de un CDN publico con soporte de rangos; una interrupcion del servicio impide el primer arranque de la app.
- No hay informacion sobre idiomas soportados ni sobre el tokenizador o el encoder de texto utilizados en el dispositivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sheigl/craftroom-ai-payload
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Repositorio del arnes iOS: https://github.com/sheigl/craftroom-ai-ios
