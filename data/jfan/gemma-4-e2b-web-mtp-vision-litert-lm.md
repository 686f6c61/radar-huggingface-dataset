# jfan/gemma-4-e2b-web-mtp-vision-litert-lm

## Resumen

`jfan/gemma-4-e2b-web-mtp-vision-litert-lm` es un bundle de inferencia empaquetado sobre `gemma-4-E2B-it` en formato LiteRT-LM, orientado a ejecucion en navegador mediante WebGPU. Lo publica el usuario jfan reempaquetando con `litert-lm-builder` el bundle oficial `litert-community/gemma-4-E2B-it-litert-lm`, y su rasgo diferencial frente al bundle web oficial es que incorpora soporte de vision (que el oficial no tiene) y decodificacion especulativa mediante Multi-Token Prediction.

El paquete se compone de un decodificador de texto compilado para el backend WebGPU `gpu_artisan` (`tf_lite_artisan_text_decoder`), con los pesos de embedding por capa inlineados para reducir el pico de memoria en el navegador; un drafter MTP (`tf_lite_mtp_drafter`) para decodificacion especulativa; y una ruta de vision formada por `tf_lite_vision_encoder` (fp16), `tf_lite_vision_adapter` y `tf_lite_end_of_vision`. Se han eliminado las secciones de audio porque el runtime web no dispone de ruta de audio.

Es relevante porque permite ejecutar un modelo multimodal (texto + imagen) directamente en el navegador del usuario, sin backend de servidor, dentro del ecosistema LiteRT-LM y con aceleracion WebGPU. El repositorio ocupa 4,6 GB, aunque la model card declara un bundle de aproximadamente 2,3 GB. No se dispone de informacion publicada sobre parametros exactos, contexto, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4 E2B) empaquetado en contenedor LiteRT-LM con decodificador de texto, drafter MTP y encoder de vision |
| Parametros totales | no disponible (la nomenclatura "E2B" del bundle sugiere un orden de ~2B efectivos, no confirmado) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el decodificador (se distribuye ya compilado para el backend WebGPU `gpu_artisan`); el encoder de vision esta en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la informacion proporcionada (el bundle base procede de `litert-community/gemma-4-E2B-it-litert-lm`, sujeto a la licencia de Gemma) |
| Formato de pesos | `.litertlm` (contenedor LiteRT-LM; repo de 4,6 GB, bundle declarado de ~2,3 GB) |

## Arquitectura y entrenamiento

El bundle no aporta informacion sobre el entrenamiento del modelo subyacente `gemma-4-E2B-it`: no se detallan numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se documenta es la estructura del paquete de inferencia, que separa cuatro componentes: el decodificador de texto (`tf_lite_artisan_text_decoder`) con la restriccion de backend `gpu_artisan`, identico decodificador compilado para WebGPU que el bundle `gemma-4-E2B-it-web.litertlm` pero con los pesos de embedding por capa inlineados en lugar de en secciones de embedder separadas, lo que reduce el pico de memoria en el navegador; el drafter de Multi-Token Prediction (`tf_lite_mtp_drafter`); el encoder de vision en fp16 con su adaptador y su token de fin de vision; y la plantilla de chat en Jinja junto con los metadatos de Gemma 4 embebidos en el contenedor.

La innovacion tecnica destacable del reempaquetado es doble. Por un lado, la decodificacion especulativa mediante MTP, que se activa con `enableSpeculativeDecoding` o `enable_speculative_decoding` y que permite al drafter proponer varios tokens por paso para que el decodificador principal los valide. Por otro, la incorporacion de la ruta de vision en un bundle web, algo que el bundle oficial web no ofrece porque es solo texto. Las secciones de audio se han descartado deliberadamente al no existir ruta de audio en el runtime web.

## Capacidades

- Generacion de texto conversacional mediante la plantilla de chat Jinja embebida en el contenedor `.litertlm`.
- Entrada de imagenes: el bundle incluye `tf_lite_vision_encoder` (fp16), `tf_lite_vision_adapter` y `tf_lite_end_of_vision`, por lo que acepta imagenes como entrada ademas de texto.
- Decodificacion especulativa con Multi-Token Prediction, activable en tiempo de ejecucion para reducir la latencia de generacion.
- Ejecucion en navegador con WebGPU a traves de `@litert-lm/core` con `Backend.GPU_ARTISAN` por defecto, o mediante la CLI de `litert-lm`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: explicitamente ausentes (las secciones de audio se eliminaron porque el runtime web no tiene ruta de audio).
- Modo thinking: no disponible en la informacion proporcionada.
- Idiomas y tareas concretas de clasificacion, codigo o matematicas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en una pagina web: el bundle esta disenado para cargarse con `@litert-lm/core` y `Backend.GPU_ARTISAN`, de modo que la inferencia ocurre en el dispositivo del usuario y el texto no sale del navegador.
- Analisis de imagenes en cliente sin servidor: gracias al encoder de vision fp16 y al adaptador incluidos, se pueden enviar capturas, fotos o diagramas al modelo desde una aplicacion web y obtener descripciones o respuestas sin subir el archivo a un backend.
- Demos y prototipos de producto sin infraestructura de GPU: el formato LiteRT-LM y la ruta WebGPU permiten desplegar una demo funcional publicando unicamente el `.litertlm` como `MODEL_URL`, sin coste de servidor de inferencia.
- Generacion de texto interactiva con baja latencia percibida: activando `enableSpeculativeDecoding` con el drafter MTP, se puede reducir el tiempo por token en aplicaciones de escritura asistida o autocompletado dentro del navegador.
- Procesamiento de documentos con componentes visuales: capturas de formularios, tablas o graficos pueden enviarse al modelo junto con una instruccion de texto para extraer o resumir informacion, siempre que el flujo no requiera audio.
- Aplicaciones educativas o de accesibilidad offline-first: al ejecutarse localmente en el navegador, el modelo puede usarse en entornos con conectividad limitada o con requisitos de privacidad estrictos.
- Integracion en pipelines de desarrollo web: la CLI `litert-lm run --from-huggingface-repo ...` permite validar el bundle en local antes de integrarlo en la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publican cifras de memoria para el backend `gpu_artisan` ni para el modelo.
- Tamano en disco/descarga de referencia: repositorio de 4,6 GB; la model card declara un bundle de aproximadamente 2,3 GB (el valor aparece como variable `${SIZE_GIB:-~2.3}` en el README, por lo que debe tratarse como orientativo).
- GPU recomendadas: no disponible. El destino declarado no es una GPU de datacenter, sino la GPU integrada o dedicada del equipo del usuario a traves de WebGPU en el navegador.
- Compatibilidad con GPU de consumo: el bundle esta pensado para ejecucion en navegador con WebGPU, no se especifican modelos de GPU concretos ni minimos de memoria.
- Opciones de despliegue: CLI `litert-lm` (`pip install -U litert-lm`, `litert-lm run --from-huggingface-repo ...`) y aplicacion web con `@litert-lm/core` usando `Backend.GPU_ARTISAN` por defecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La unica indicacion cualitativa es que el MTP permite decodificacion especulativa y que los embeddings inlineados reducen el pico de memoria en el navegador.

## Comparativa con modelos similares

| Modelo | Vision | MTP / decodificacion especulativa | Audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jfan/gemma-4-e2b-web-mtp-vision-litert-lm | Si (encoder fp16 + adaptador) | Si (`tf_lite_mtp_drafter`) | No (eliminado) | `.litertlm` | no disponible | HuggingFace, 0 descargas, 0 likes |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | `.litertlm` | no disponible | Repositorio oficial de referencia citado por el autor |
| gemma-4-E2B-it-web.litertlm (bundle web oficial) | No, es solo texto segun la model card | no disponible | no disponible | `.litertlm` | no disponible | Citado como bundle oficial web |
| gemma-4-E2B-it (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | Citado como origen del bundle |

No se dispone de datos de parametros, contexto ni rendimiento para ninguno de los modelos comparados, por lo que la comparacion se limita a los componentes incluidos y al formato de distribucion descritos en la model card.

## Limitaciones y advertencias

- El bundle carece de secciones de audio: cualquier caso de uso que requiera entrada o salida de voz no es viable con este paquete.
- La licencia no esta declarada en la informacion disponible. Al derivar de `gemma-4-E2B-it`, el uso comercial queda sujeto a los terminos de la licencia de Gemma, que deben verificarse antes de desplegar en produccion.
- No se publican datos de parametros, contexto, idiomas ni benchmarks, lo que impide estimar con rigor el rendimiento real en tareas concretas.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-09-12, por lo que no existe validacion de la comunidad ni historial de uso en produccion.
- El bundle declarado (~2,3 GB) y el tamano real del repositorio (4,6 GB) no coinciden; el valor del README se presenta como variable de entorno (`${SIZE_GIB:-~2.3}`), lo que sugiere documentacion no resuelta.
- La ejecucion depende de WebGPU y del backend `gpu_artisan`, por lo que la disponibilidad real esta limitada a navegadores y equipos con soporte WebGPU funcional.
- Al ser un reempaquetado de terceros, las actualizaciones y correcciones dependen del autor del repositorio, no del equipo de Gemma ni de litert-community.
- Riesgo de sesgos y de alucinacion: no disponible en la informacion proporcionada; se heredan los del modelo base, que no se documentan aqui.
- Los resultados de busqueda web recuperados durante la elaboracion de esta ficha no guardan relacion con el modelo (corresponden a un ciclomotor Simson Habicht), por lo que no aportan informacion tecnica verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jfan/gemma-4-e2b-web-mtp-vision-litert-lm
- Bundle base citado por el autor: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo.
