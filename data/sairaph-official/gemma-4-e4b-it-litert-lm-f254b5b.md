# sairaph-official/gemma-4-E4B-it-litert-lm-f254b5b

## Resumen

Gemma 4 E4B es un modelo de lenguaje de la familia Gemma de Google, disenado especificamente para su despliegue en dispositivos (on-device). Esta ficha corresponde al repositorio `sairaph-official/gemma-4-E4B-it-litert-lm-f254b5b`, un espejo (mirror) no modificado de los ficheros upstream de `litert-community/gemma-4-E4B-it-litert-lm`, empaquetado en formato `.litertlm` para su uso con el framework LiteRT-LM. El modelo base es `google/gemma-4-E4B-it`, la variante instruct de la familia Gemma 4.

El repositorio contiene un unico fichero de pesos de 3.659.530.240 bytes (3,66 GB) con hash SHA-256 `0b2a8980ce155fd97673d8e820b4d29d9c7d99b8fa6806f425d969b145bd52e0`. Segun la model card upstream, el fichero incluye un decodificador de texto con 2,24 GB de pesos y 0,67 GB de parametros de embedding, ademas de modulos de vision y audio que se cargan bajo demanda para reducir el consumo de memoria.

La relevancia de este modelo radica en su formato de despliegue: LiteRT-LM es una capa de orquestacion sobre LiteRT (el runtime multiplataforma de Google) que anade gestion de KV-cache, plantillas de prompt y function calling, con aceleracion via XNNPack en CPU y ML Drift en GPU. Esto permite ejecutar el modelo en Android, iOS, escritorio, IoT y web sin conexion a internet, preservando la privacidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), optimizado para LiteRT-LM |
| Parametros totales | no disponible (pesos del decodificador: 2,24 GB; embeddings: 0,67 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos empaquetados en formato `.litertlm` (cuantizacion interna no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano del fichero | 3.659.530.240 bytes (3,66 GB) |
| Modalidades | Texto, vision y audio (modulos cargados bajo demanda) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `google/gemma-4-E4B-it` mas alla de que pertenece a la familia Gemma 4 de Google, construida con la misma investigacion y tecnologia que los modelos Gemini. La model card upstream no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de este repositorio no reside en el modelo en si, sino en su empaquetado para LiteRT-LM. Este framework mantiene los pesos principales en memoria mientras mapea en memoria (memory mapping) los parametros de embedding, lo que reduce el uso de memoria de trabajo en algunas plataformas. Los modulos de vision y audio se cargan solo cuando se necesitan, lo que disminuye aun mas el consumo. LiteRT-LM proporciona aceleracion hardware mediante XNNPack (CPU) y ML Drift (GPU), e incluye gestion de KV-cache, plantillas de prompt y function calling como parte del stack.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruct (`-it`).
- Procesamiento de vision: el fichero incluye un modulo de vision cargado bajo demanda.
- Procesamiento de audio: el fichero incluye un modulo de audio cargado bajo demanda.
- Function calling / tool calling: soportado por el framework LiteRT-LM.
- Gestion de KV-cache y plantillas de prompt integradas en el runtime.
- Ejecucion on-device sin conexion a internet, con privacidad de datos.
- Despliegue multiplataforma: Android, iOS, escritorio, IoT y web.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales on-device: el modelo puede gestionar conversaciones multi-turno directamente en el dispositivo del usuario, sin enviar datos a la nube, lo que es adecuado para aplicaciones de privacidad sensible como asistentes personales o de salud.
- Procesamiento de imagenes en movil: gracias al modulo de vision cargado bajo demanda, puede describir o analizar imagenes capturadas por la camara del dispositivo en aplicaciones de accesibilidad o catalogacion.
- Transcripcion y analisis de audio local: el modulo de audio permite procesar entradas de voz en el dispositivo, util para notas de voz, subtitulado o comandos por voz sin conexion.
- Aplicaciones IoT con IA generativa: su tamano contenido (3,66 GB) y el soporte de LiteRT permiten desplegar generacion de texto en dispositivos edge con recursos limitados.
- Automatizacion con function calling: integrado en LiteRT-LM, puede invocar herramientas y APIs locales desde el dispositivo, adecuado para agentes que operan sobre servicios del propio terminal.
- Demos y prototipado en web: el formato `.litertlm` y el soporte web de LiteRT permiten ejecutar el modelo en navegador para demostraciones interactivas sin backend.
- Aplicaciones de accesibilidad: descripcion de escenas mediante vision y respuesta por voz en tiempo real en dispositivos moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero de pesos ocupa 3,66 GB; el framework mantiene los pesos principales en memoria (2,24 GB del decodificador) y mapea en memoria los embeddings (0,67 GB), por lo que el consumo real de memoria de trabajo puede ser inferior al tamano total del fichero.
- GPU recomendadas: no disponible. El framework usa ML Drift para aceleracion GPU y XNNPack para CPU, pero la model card no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: LiteRT-LM (framework nativo), Google AI Edge Gallery (app movil), CLI de LiteRT-LM (`ai.google.dev/edge/litert-lm/cli`), despliegue en Android, iOS, escritorio, IoT y web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Gemma 4 E4B (este repo) | no disponible (3,66 GB) | no disponible | `.litertlm` | Apache 2.0 | On-device (LiteRT-LM) |
| Gemma 4 E4B (base) | no disponible | no disponible | safetensors (presumible) | Gemma license (segun repo base) | Servidor/GPU |
| Alternativas on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa. La diferencia principal de este repositorio frente al modelo base es el formato de empaquetado (`.litertlm` frente a los pesos originales) y la orientacion a despliegue on-device.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial (Sairaph mirror); el autor no es Google ni el equipo de LiteRT. La licencia Apache 2.0 fue anadida por Sairaph, ya que el repositorio upstream no incluia ficheros de licencia.
- El modelo base es `google/gemma-4-E4B-it`; conviene verificar los terminos de licencia del modelo original de Google, que pueden diferir de la Apache 2.0 aplicada al empaquetado.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion proporcionada.
- La longitud de contexto no esta especificada; no se debe asumir una ventana concreta sin consultar la model card del modelo base.
- El formato `.litertlm` esta atado al framework LiteRT-LM; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- El modelo esta pensado para uso on-device; su rendimiento en servidor no esta documentado.
- No hay datos de benchmarks que permitan validar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sairaph-official/gemma-4-E4B-it-litert-lm-f254b5b
- Repositorio upstream (LiteRT Community): https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- LiteRT-LM CLI: https://ai.google.dev/edge/litert-lm/cli
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
