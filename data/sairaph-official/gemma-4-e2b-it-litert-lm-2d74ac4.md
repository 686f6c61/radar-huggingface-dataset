# sairaph-official/gemma-4-E2B-it-litert-lm-2d74ac4

## Resumen

Gemma 4 E2B-it es un modelo de lenguaje de Google, miembro de la familia Gemma 4, disenado especificamente para inferencia en dispositivo (on-device). Este repositorio concreto, publicado por sairaph-official, es un espejo no modificado de los archivos oficiales de `litert-community/gemma-4-E2B-it-litert-lm`, empaquetados en formato `.litertlm` para su uso con LiteRT-LM, la capa de orquestacion de Google construida sobre el runtime LiteRT (XNNPack para CPU, ML Drift para GPU). El modelo base es `google/gemma-4-E2B-it`, la variante instruida de 2B efectivos.

El problema que resuelve es la ejecucion de IA generativa privada y sin conexion en Android, iOS, escritorio, IoT y web. LiteRT-LM emplea un esquema de cuantizacion mixta (2, 4 y 8 bits) entrenado con quantization-aware training, lo que reduce el peso en memoria a unos 0,8 GB para casos de solo texto, con 1,12 GB de embeddings gestionados mediante memory mapping. Los modulos de vision y audio se cargan bajo demanda para recortar aun mas el consumo.

Es relevante porque demuestra el estado del arte en modelos compactos multimodales desplegables en hardware de consumo, con soporte de function calling y plantillas de prompt integradas en el runtime. El archivo de pesos ocupa 2.588.147.712 bytes (unos 2,6 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Gemma 4; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible (denominacion E2B sugiere ~2B efectivos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 2/4/8 bits (quantization-aware training, esquema movil Gemma 4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano del archivo de pesos | 2.588.147.712 bytes (sha256 `181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c`) |
| Huella en memoria (solo texto) | ~0,8 GB de pesos + 1,12 GB de embeddings (memory mapping) |
| Modalidades | Texto, vision y audio (vision/audio cargados bajo demanda) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.). Se sabe que pertenece a la familia Gemma 4 de Google, construida con la misma investigacion y tecnologia que los modelos Gemini, y que esta variante E2B esta optimizada para inferencia en dispositivo. El runtime LiteRT-LM anade gestion de KV-cache, plantillas de prompt y function calling sobre el runtime LiteRT.

El entrenamiento del modelo base no esta descrito en la informacion proporcionada (tokens, composicion del dataset, RLHF/DPO: no disponible). La innovacion tecnica destacable es el esquema de cuantizacion movil de Gemma 4, basado en quantization-aware training con mezcla de pesos de 2, 4 y 8 bits, que permite reducir el peso a ~0,8 GB en memoria para texto y cargar los modulos de vision y audio bajo demanda. El runtime usa memory mapping para los 1,12 GB de embeddings.

## Capacidades

- Generacion de texto en modo instruido (sufijo `-it`).
- Procesamiento de vision (modulo cargado bajo demanda).
- Procesamiento de audio (modulo cargado bajo demanda).
- Function calling / tool calling integrado en LiteRT-LM.
- Plantillas de prompt y gestion de KV-cache gestionadas por el runtime.
- Ejecucion totalmente local y offline, sin conexion a internet.
- Capacidades multilingues: no disponible (idiomas no especificados).
- Razonamiento multi-paso y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes privados en movil: integracion en apps Android/iOS mediante LiteRT-LM para conversacion local sin enviar datos a la nube, apropiado por su huella de ~0,8 GB en texto y su soporte de function calling.
- Funciones de accesibilidad offline: descripcion de imagenes o transcripcion/resumen de audio en el dispositivo, usando los modulos de vision y audio que se cargan bajo demanda para no consumir memoria permanentemente.
- Automatizacion en IoT y edge: despliegue en dispositivos con recursos limitados donde el esquema de cuantizacion mixta 2/4/8 bits permite mantener el modelo en memoria.
- Aplicaciones web en el navegador: el formato LiteRT-LM esta pensado para despliegue en web, habilitando inferencia local en el cliente.
- Prototipado rapido con la CLI de LiteRT-LM: uso de la herramienta de linea de comandos de Google AI Edge para probar el modelo en escritorio antes de portarlo a movil.
- Demos y validacion con Google AI Edge Gallery: ejecucion del modelo en la app de showcase de Google para evaluar calidad y latencia en hardware real.
- Procesamiento de documentos con OCR/vision en local: al soportar vision, puede extraer informacion de imagenes sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~0,8 GB de pesos para texto mas 1,12 GB de embeddings mapeados en memoria; vision y audio anaden consumo solo cuando se cargan.
- GPU recomendadas: no disponible (el runtime usa ML Drift para aceleracion GPU y XNNPack para CPU; no se especifican modelos de GPU).
- Compatibilidad con GPU de consumo: el modelo esta disenado para dispositivos moviles, escritorio, IoT y web, por lo que cabe en hardware de consumo, pero no se detallan modelos concretos.
- Opciones de despliegue: LiteRT-LM (runtime oficial), CLI de LiteRT-LM, Google AI Edge Gallery (Android/iOS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B-it (este) | no disponible (~2B efectivos) | no disponible | Texto, vision, audio | Apache 2.0 | `.litertlm` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de ~2B parametros: capacidad de razonamiento y conocimiento limitados frente a modelos mayores; riesgo de alucinacion inherente.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados; verificar cobertura antes de desplegar en produccion multilingue.
- Longitud de contexto: no disponible; puede ser limitada en un modelo orientado a dispositivo.
- Licencia Apache 2.0 permite uso comercial, pero el espejo solo incluye el archivo `.litertlm` y una copia de la licencia; los archivos de aviso (NOTICE) del repositorio upstream no estan presentes.
- Este repositorio es un espejo no oficial de sairaph-official; para produccion se recomienda usar el repositorio upstream `litert-community/gemma-4-E2B-it-litert-lm`.
- Dependencia del runtime LiteRT-LM: no es directamente usable con vLLM, llama.cpp u Ollama.
- La cuantizacion mixta agresiva (2 bits en parte de los pesos) puede degradar la calidad frente al modelo en precision completa.

## Enlaces

- Repositorio espejo: https://huggingface.co/sairaph-official/gemma-4-E2B-it-litert-lm-2d74ac4
- Repositorio upstream: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Blog de cuantizacion Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- CLI LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
