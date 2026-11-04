# karlsencoin/Wan2.2-TI2V-5B-Turbo-FastWan-Q8_0-GGUF

## Resumen

Wan2.2-TI2V-5B-Turbo-FastWan-Q8_0-GGUF es un paquete de pesos en formato GGUF para generacion de video a partir de texto (text-to-video), publicado por el usuario karlsencoin como espejo byte a byte de los archivos que utiliza la red distribuida KarlsenAI. No se trata de un modelo entrenado por el autor de la ficha: el modelo de difusion subyacente es Wan2.2-TI2V-5B de Alibaba (Wan-AI), destilado a pocos pasos por quanhaol (Wan2.2-TI2V-5B-Turbo) y acelerado adicionalmente mediante la LoRA FastWan del equipo FastVideo. El repositorio empaqueta el UNet/diT cuantizado en Q8_0 junto con el text encoder UMT5-XXL en Q8_0, el VAE de Wan 2.2 y dos LoRAs (Turbo y FastWan) en precision fp16/bf16.

El interes practico del paquete es que agrupa en un unico repositorio todas las piezas necesarias para ejecutar inferencia de video en GPUs de consumo mediante stable-diffusion.cpp con backend Vulkan, sin depender de que los repositorios de terceros sigan en linea. La configuracion documentada permite generar clips de 5 segundos (81 fotogramas a 16 fps) a 832x480 o 480x832 con solo 4 pasos de muestreo y CFG 1.0, lo que reduce drasticamente el coste computacional frente al modelo base.

El modelo de difusion tiene 5.680.910.336 parametros (aproximadamente 5,7 mil millones) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 13,9 GB en total. Es relevante ahora porque demuestra un flujo completo de generacion de video abierta que cabe en tarjetas graficas de 16 GB, un umbral que hasta hace poco quedaba reservado a hardware de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-video (familia Wan 2.2 TI2V, transformer de difusion con atencion completa) |
| Parametros totales | 5.680.910.336 (modelo de difusion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | Q8_0 (modelo de difusion y text encoder); LoRAs en fp16 y bf16; VAE en safetensors sin cuantizar |
| Idiomas soportados | no disponible (el text encoder UMT5-XXL es multilingue, pero el autor no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de difusion y text encoder), safetensors (VAE y LoRAs) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Wan 2.2, una arquitectura de difusion para generacion de video condicionada por texto. La variante TI2V-5B emplea un transformer de difusion con atencion completa y un VAE con compresion espacial y temporal; el text encoder es UMT5-XXL de Google, que proyecta el prompt a embeddings de condicionamiento. El paquete incluye el VAE original de Wan 2.2 extraido del repack de ComfyUI y el encoder UMT5-XXL cuantizado a Q8_0 por city96.

Sobre el modelo base se aplican dos adaptaciones de bajo rango. La primera es la LoRA Turbo de quanhaol, resultado de un proceso de destilacion (no se detalla en la informacion disponible el numero de pasos ni el dataset) que permite reducir el muestreo a 4 pasos con CFG 1.0. La segunda es la LoRA FastWan del equipo FastVideo, de rango 128 en bf16, orientada a acelerar la atencion completa. KarlsenAI fusiona ambas LoRAs una sola vez con `lora_apply_mode = immediately`, aplicando Turbo con peso -0.5 y FastWan con peso +0.5. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO; estos datos corresponden a los autores originales y no se reproducen en la model card de este espejo.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones de 832x480 (horizontal) o 480x832 (vertical).
- Generacion de clips de 81 fotogramas a 16 fps, equivalentes a 5 segundos de video.
- Muestreo rapido en 4 pasos con CFG 1.0, scheduler Euler discreto y flow shift 5.0, gracias a la combinacion de las LoRAs Turbo y FastWan.
- Ejecucion en GPUs de consumo mediante stable-diffusion.cpp con backend Vulkan, con el text encoder residente en RAM del host (`te=cpu`) y carga perezosa.
- Atencion flash en el modelo de difusion y tiling espacial y temporal del VAE para reducir el pico de memoria.
- Salida en MP4 H.264 de aproximadamente 0,8 MB por clip.
- Soporte de integracion en flujos automatizados: los workers de KarlsenAI descargan los archivos automaticamente mediante el wizard karlsen-hybrid y el catalogo `/api/video_models`, verificando cada archivo por SHA-256.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.

## Casos de uso

- Generacion de clips publicitarios cortos para redes sociales: el modelo produce videos de 5 segundos en formato vertical 480x832 a partir de una descripcion textual, adecuado para anuncios y stories sin necesidad de rodaje.
- Prototipado rapido de storyboards: un equipo de produccion puede convertir guiones en bocetos animados de 5 segundos con 4 pasos de muestreo, iterando sobre el prompt antes de comprometer recursos de render final.
- Inferencia distribuida en GPUs comunitarias: el paquete esta disenado para que nodos con tarjetas de 16 GB descarguen los pesos verificados por SHA-256 y sirvan peticiones de text-to-video pagadas por solicitud, lo que permite montar un servicio de generacion de video sin infraestructura propia.
- Integracion en pipelines de automatizacion con stable-diffusion.cpp: al ser un conjunto autocontenido de GGUF, safetensors y LoRAs, se puede invocar desde scripts o servicios que encolen prompts y recojan los MP4 resultantes.
- Generacion de material de relleno para edicion: clips cortos de recurso (fondos, transiciones, ambientacion) que se insertan en una linea de montaje sin depender de bancos de video de pago.
- Demostraciones y evaluacion de modelos de video en hardware de gama media: al caber en una Radeon RX 6800 de 16 GB con Vulkan, sirve para comparar calidad y latencia de la familia Wan 2.2 sin acceso a A100/H100.
- Pruebas de concepto de video generativo en entornos con restricciones de licencia: la licencia Apache 2.0 de todos los componentes permite uso comercial y modificacion, a diferencia de otros modelos de video con licencias mas restrictivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una medicion de latencia: aproximadamente 5,5 minutos por clip una vez calentado el worker, sobre una AMD Radeon RX 6800 de 16 GB con Vulkan/RADV, con fecha 2026-11-04.

## Requisitos de hardware

- VRAM estimada: no se declara un minimo oficial. La medicion del autor se realizo en una GPU de 16 GB (Radeon RX 6800) con el text encoder en RAM del host, atencion flash y tiling del VAE, lo que sugiere que 16 GB es un umbral practico para esta configuracion.
- GPU recomendadas: AMD Radeon RX 6800 (16 GB, verificado por el autor). Por el perfil de memoria, se espera que funcionen tarjetas con 16 GB o mas, como RTX 4080/4090 (16-24 GB), RX 7900 XT/XTX (20-24 GB) o A100/H100 si se quiere mayor throughput; estas ultimas no estan verificadas en la informacion disponible.
- Cabe en GPU de consumo: si, al menos en una RX 6800 de 16 GB con la configuracion documentada (Q8_0, text encoder en CPU, tiling del VAE).
- Opciones de despliegue: stable-diffusion.cpp con backend Vulkan es el motor documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de difusion de video.
- Latencia y throughput: aproximadamente 5,5 minutos por clip de 5 segundos en RX 6800 una vez caliente el worker. No se dispone de datos de throughput agregado ni de latencia en otras GPU.
- Almacenamiento: el repositorio ocupa 13,9 GB, por lo que se necesita espacio en disco equivalente mas margen para la cache del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B-Turbo-FastWan Q8_0 (este) | 5,68 mil millones | clips de 5 s, 81 frames a 16 fps | GGUF + safetensors | Apache 2.0 | HuggingFace, red KarlsenAI |
| Wan-AI/Wan2.2-TI2V-5B (base) | 5,68 mil millones | no disponible en la informacion | safetensors | Apache 2.0 | HuggingFace |
| quanhaol/Wan2.2-TI2V-5B-Turbo | 5,68 mil millones (hereda base) | no disponible | safetensors | no disponible en la informacion | HuggingFace |
| hum-ma/Wan2.2-TI2V-5B-Turbo-GGUF | 5,68 mil millones (hereda base) | no disponible | GGUF | Apache 2.0 (declarada por hum-ma) | HuggingFace |

Las tres alternativas son variantes del mismo modelo base: la version de quanhaol anade la destilacion Turbo y la de hum-ma es la cuantizacion GGUF de la que este repositorio toma el modelo de difusion y las LoRAs. No se dispone de datos de benchmarks que permitan comparar calidad entre ellas, ni de modelos de otras familias con los que contrastar.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Al ser un modelo de difusion entrenado con datos no especificados, puede reproducir sesgos de representacion presentes en el corpus original de Wan 2.2.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos, incoherencias temporales entre fotogramas y elementos fisicamente imposibles, especialmente con prompts ambiguos.
- Limitaciones de contexto y duracion: los clips estan limitados a 81 fotogramas (5 segundos a 16 fps); no se documenta soporte para videos mas largos.
- Idiomas: el autor no declara lista de idiomas soportados; el comportamiento multilingue depende del text encoder UMT5-XXL y no esta verificado para este paquete.
- Restricciones de licencia: todos los componentes se declaran Apache 2.0, lo que permite uso comercial, pero la licencia de la LoRA Turbo se atribuye a la declaracion de hum-ma, no a una verificacion independiente del autor del espejo.
- Caveat de produccion: el paquete es un espejo byte a byte sin modificaciones; la calidad y el soporte dependen de los repositorios originales. La configuracion de pesos de LoRA (-0.5 para Turbo, +0.5 para FastWan) es especifica de KarlsenAI y puede no trasladarse a otros motores.
- Rendimiento: la unica medicion disponible (5,5 minutos por clip en RX 6800) implica una latencia alta para uso interactivo; no es adecuado para aplicaciones en tiempo real.
- Dependencia de Vulkan: el motor documentado es stable-diffusion.cpp con backend Vulkan; no se garantiza el funcionamiento en otros backends.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karlsencoin/Wan2.2-TI2V-5B-Turbo-FastWan-Q8_0-GGUF
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Destilacion Turbo: https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo
- GGUF de origen: https://huggingface.co/hum-ma/Wan2.2-TI2V-5B-Turbo-GGUF
- Text encoder UMT5-XXL GGUF: https://huggingface.co/city96/umt5-xxl-encoder-gguf
- Text encoder original: https://huggingface.co/google/umt5-xxl
- VAE repack de ComfyUI: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- LoRA FastWan: https://huggingface.co/fastvideo/fastwan2.2-ti2v-5b-fullattn-diffusers
- Motor stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Red KarlsenAI: https://ai.karlsencoin.org/
