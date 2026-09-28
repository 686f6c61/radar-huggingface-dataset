# matu79go/Reflex-1-4B-bnb-4bit

## Resumen

Reflex-1-4B-bnb-4bit es una copia precuantizada del modelo multimodal Google Gemma 4 E4B-it, publicada por el usuario matu79go como base para el proyecto Reflex-1. Se distribuye en formato bitsandbytes NF4 de 4 bits con doble cuantizacion, de modo que la descarga baja de unos 16 GB (BF16) a 9,3 GB y no es necesario aplicar cuantizacion en el momento de la carga. Las torres de vision y audio, las capas de embeddings y la LM head se mantienen en bfloat16, mientras que los bloques del transformer se almacenan en NF4.

El modelo no incorpora ningun ajuste propio: segun el autor, es unicamente una version cuantizada del Gemma 4 E4B-it original, sin otros cambios. Las "habilidades" de Reflex-1 (adaptadores LoRA y modulos latentes) viven en un repositorio separado, matu79go/Reflex-1-4B, que actua como registro de skills y se carga junto a esta base mediante el servidor del proyecto.

Su relevancia practica es de tipo operativo: reduce el coste de despliegue de un modelo multimodal de ~7,94 mil millones de parametros totales a un entorno de aproximadamente 10 GB de VRAM, lo que lo hace ejecutable en GPUs de consumo de gama alta. El repositorio tiene 0 descargas y 0 likes, y la fecha de creacion registrada es 2026-09-28, por lo que se trata de una publicacion muy reciente y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de google/gemma-4-E4B-it (torres de vision y audio + bloques transformer); detalles completos no disponibles |
| Parametros totales | 7.941.100.874 (~7,94 B) segun los pesos en safetensors del repositorio |
| Parametros activos | no disponible (la nomenclatura "E4B" del modelo base apunta a un esquema de parametros efectivos de ~4 B, pero la informacion proporcionada no lo confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits bitsandbytes NF4 con doble cuantizacion (bloques transformer); bfloat16 en torres de vision/audio, embeddings y LM head. El modelo base tambien puede ejecutarse en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, bitsandbytes) |
| Tamano del repositorio | 9,3 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | google/gemma-4-E4B-it |
| Compatibilidad | endpoints_compatible (etiqueta del repositorio) |

## Arquitectura y entrenamiento

La ficha del autor no describe la arquitectura interna mas alla de indicar que se trata de Gemma 4 E4B: un modelo multimodal con torres de vision y audio, capas de embeddings y una LM head que en esta version se conservan en bfloat16, mientras que los bloques transformer se cuantizan a NF4 con doble cuantizacion. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO.

Tampoco se documenta ninguna innovacion tecnica introducida por el autor: la model card afirma explicitamente que el unico cambio respecto a google/gemma-4-E4B-it es la cuantizacion. El autor sostiene que los resultados obtenidos con esta base precuantizada son equivalentes a los de cuantizar el modelo original en el momento de la carga, y menciona que esa comprobacion se realizo sobre clasificacion de intenciones, clasificacion de imagenes y tres habilidades de razonamiento del proyecto Reflex-1, sin publicar cifras.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 4 E4B-it.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text declarado en el repositorio).
- Procesamiento de audio: la model card menciona explicitamente una torre de audio en bfloat16, aunque no detalla sus funciones.
- Razonamiento: el proyecto Reflex-1 incluye, segun el autor, tres "skills" de razonamiento evaluadas sobre esta base.
- Clasificacion de intenciones y clasificacion de imagenes: mencionadas como tareas de verificacion de la cuantizacion.
- Integracion con un runtime de habilidades: el modelo se usa como base de un servidor (`python -m reflex.server`) que carga un registro de skills definido en un fichero JSON.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles como caracteristica documentada del modelo; el proyecto Reflex-1 plantea un esquema de skills, pero su alcance no se detalla.
- Capacidades multilingues: no disponibles.
- Modo "thinking" explicito u otras capacidades especiales: no disponibles.

## Casos de uso

- Despliegue multimodal en una sola GPU de consumo: con ~10 GB de memoria, el modelo permite montar un servicio de respuesta a consultas que combinan texto e imagen en una RTX 4090 o similar, sin recurrir a cuantizacion en tiempo de carga.
- Clasificacion de imagenes en pipelines de preprocesado: el autor cita esta tarea como caso verificado; encaja en flujos que etiquetan lotes de imagenes antes de un procesado posterior.
- Clasificacion de intenciones en asistentes conversacionales: util para enrutar peticiones de usuario hacia el servicio adecuado dentro de una arquitectura de microservicios, con una huella de memoria reducida.
- Base para un sistema de skills modular: al cargar el registro de Reflex-1 (LoRA y modulos latentes del repositorio Reflex-1-4B) sobre esta base, se puede construir un asistente con capacidades intercambiables sin reentrenar el modelo completo.
- Experimentacion academica con modelos multimodales cuantizados: sirve para estudiar el impacto de NF4 con doble cuantizacion en tareas de vision-lenguaje sin necesidad de infraestructura de datacenter.
- Prototipado rapido en notebooks: el proyecto publica un notebook de inicio rapido en Colab, adecuado para validar el modelo en un entorno gratuito o de bajo coste antes de desplegarlo.
- Transcripcion o comprension de audio en aplicaciones locales: la torre de audio en bfloat16 abre la puerta a tareas de habla, aunque el autor no documenta el rendimiento en esta modalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica referencia de rendimiento aportada por el autor es cualitativa: afirma que los resultados con esta base precuantizada coinciden con los de cuantizar google/gemma-4-E4B-it en tiempo de carga, tras comprobarlo en clasificacion de intenciones, clasificacion de imagenes y tres habilidades de razonamiento. No se facilitan puntuaciones numericas (MMLU, HumanEval, GSM8K u otras), ni comparaciones cifradas con alternativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB en la configuracion NF4 de 4 bits, segun la tabla incluida en la model card del autor.
- Alternativa sin cuantizar: ejecutar google/gemma-4-E4B-it en BF16 requiere unos 16 GB de VRAM.
- GPUs recomendadas: no especificadas por el autor. Por tamano, el modelo es viable en una NVIDIA RTX 4090 o RTX 3090 (24 GB), y ajustado en tarjetas de 16 GB como la RTX 4080 o 4060 Ti de 16 GB.
- GPU de consumo: si cabe, con ~10 GB de VRAM en la variante cuantizada; en BF16 requiere tarjetas de 16 GB o mas.
- Opciones de despliegue: el proyecto proporciona un servidor propio (`python -m reflex.server --base matu79go/Reflex-1-4B-bnb-4bit --skills skills.json --port 8097`), ademas del uso estandar con transformers y bitsandbytes. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints gestionados. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible (el formato es bitsandbytes NF4, no GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| matu79go/Reflex-1-4B-bnb-4bit | ~7,94 B (safetensors) | no disponible | safetensors NF4 4 bits, 9,3 GB, ~10 GB VRAM | Apache 2.0 | Cuantizacion congelada; no requiere cuantizar al cargar |
| google/gemma-4-E4B-it | no disponible en la informacion proporcionada | no disponible | BF16, ~16 GB | Apache 2.0 | Modelo base original; permite cuantizar al cargar con `--quant nf4` o ejecutar en BF16 |
| matu79go/Reflex-1-4B | no disponible | no disponible | 1,8 GB | Apache 2.0 | Repositorio de skills (LoRA y modulos latentes) y registro; necesario junto a la base para cada variante de Reflex-1 |

No se dispone de datos de rendimiento comparado ni de otros modelos de la misma categoria documentados en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y fue creado el 2026-09-28: no existe validacion independiente de su comportamiento.
- La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni procesos de alineacion (RLHF, DPO) del modelo base.
- La equivalencia de resultados frente a cuantizar el modelo original al cargar es una afirmacion del autor, sin cifras publicas que la respalden.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se especifican los idiomas soportados; cualquier despliegue multilingue requiere verificacion previa.
- No se especifica la longitud de contexto, un dato critico para planificar aplicaciones con historiales largos.
- El soporte de tool calling y de agentes no esta documentado; conviene validarlo antes de integrarlo en flujos automaticos.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el modelo deriva de Gemma 4 E4B (tambien Apache 2.0) y el autor indica explicitamente que no esta afiliado ni respaldado por Google. Conviene revisar los terminos aplicables del modelo original.
- El formato bitsandbytes NF4 limita las opciones de despliegue: no es un GGUF, por lo que no se integra directamente con llama.cpp u Ollama.
- La fecha de creacion registrada (2026-09-28) es posterior a la fecha de referencia habitual; debe confirmarse la vigencia del repositorio antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matu79go/Reflex-1-4B-bnb-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de skills Reflex-1-4B: https://huggingface.co/matu79go/Reflex-1-4B
- Coleccion Reflex-1: https://huggingface.co/collections/matu79go/reflex-1-6ab9c9c2a8842e5c1f599ce5
- Repositorio de codigo: https://github.com/matu79go/reflex-1
- Notebook de inicio rapido (Colab): https://colab.research.google.com/github/matu79go/reflex-1/blob/main/notebooks/quickstart.ipynb

Nota: las busquedas web realizadas no devolvieron resultados relacionados con este modelo ni con el proyecto Reflex-1; los enlaces obtenidos correspondian a contenido sin relacion tecnica, por lo que se han omitido. No se han localizado papers, blogs tecnicos ni demos adicionales.
