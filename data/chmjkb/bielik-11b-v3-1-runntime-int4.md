# chmjkb/bielik-11b-v3.1-runntime-int4

## Resumen

Bielik 11B v3.1 Instruct int4 para ruNNtime es una redistribucion de los pesos del modelo Bielik 11B v3.1 Instruct desarrollado por SpeakLeash y ACK Cyfronet AGH, cuantizados en int4 por el usuario chmjkb para ejecutarse en el navegador mediante WebGPU a traves del runtime ruNNtime de Software Mansion. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint base con un formato de almacenamiento distinto, pensado para inferencia local en el cliente sin servidor.

El modelo base es un transformer decoder-only de aproximadamente 11.000 millones de parametros, especializado en polaco y publicado bajo licencia Apache 2.0. Esta version concreta reduce el repositorio a 6,5 GB gracias a la cuantizacion simetrica en grupos de 32 entradas con escalas f16, lo que permite cargar el modelo en un navegador de escritorio con GPU integrada o dedicada.

Su relevancia es fundamentalmente practica: demuestra que un modelo de 11B en polaco puede desplegarse integramente en el cliente mediante WebGPU, eliminando costes de servidor y manteniendo los datos del usuario en local. El autor lo describe explicitamente como un experimento y no como un lanzamiento oficial de ruNNtime ni de SpeakLeash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik 11B v3.1 Instruct) |
| Parametros totales | no disponible (modelo base de aproximadamente 11B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simetrica en grupos de 32 entradas con escala f16 por grupo (formato runntime quant v1); lm_head en int8; embeddings en f16 |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (head.int8.safetensors, layers-NN.int4.safetensors) + tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint speakleash/Bielik-11B-v3.1-Instruct, un transformer decoder-only entrenado por SpeakLeash y ACK Cyfronet AGH. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base.

La innovacion de este repositorio es exclusivamente el formato de almacenamiento: cada peso 2D se cuantiza de forma simetrica en grupos de 32 entradas de entrada, con una unica escala f16 por grupo, mediante la herramienta `runntime quantize` (formato v1). La fuente en coma flotante fue el GGUF en bf16 de speakleash/Bielik-11B-v3.1-Instruct-GGUF, restaurando las filas q y k al orden original de Hugging Face. Los nombres y layouts de los tensores coinciden con el checkpoint de Hugging Face, y el modelo se divide en un fichero de cabeza (embeddings f16, lm_head int8, norma final) y ficheros por capas en int4.

## Capacidades

- Generacion de texto en polaco, heredadas del modelo Instruct base.
- Razonamiento y respuesta a instrucciones en formato conversacional.
- Ejecucion en navegador mediante WebGPU a traves de ruNNtime, sin backend.
- Inferencia local con los pesos cargados en el cliente.
- Capacidades de codigo, matematicas, tool calling o vision: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al polaco segun los metadatos del repositorio.

## Casos de uso

- Asistentes en polaco dentro del navegador: el modelo puede ejecutarse en una pagina web mediante WebGPU, manteniendo las conversaciones del usuario en su dispositivo sin enviar datos a un servidor.
- Demos y prototipos de IA generativa en el cliente: util para validar experiencias de chat en polaco sin infraestructura de inferencia, como muestra el Space chmjkb/bielik-11b-webgpu.
- Procesamiento de texto sensible en local: al no requerir backend, encaja en escenarios donde el texto no puede salir del equipo del usuario (documentos internos, borradores).
- Aplicaciones educativas y de investigacion: permite estudiar el comportamiento de un modelo de 11B cuantizado en int4 directamente en el navegador, con acceso a los pesos en safetensors.
- Evaluacion de ruNNtime y WebGPU: sirve como banco de pruebas para medir latencia y consumo de memoria de un 11B int4 en distintas GPU de consumo.
- Despliegue sin coste de servidor: para herramientas internas en polaco donde el coste de GPU cloud no esta justificado, el modelo puede distribuirse como parte de la aplicacion web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,5 GB en int4, por lo que se necesita una GPU con al menos ese orden de memoria disponible para cargar los pesos; no se especifica el consumo exacto en ejecucion.
- GPU recomendadas: no disponibles en la informacion proporcionada; el requisito funcional es soporte de WebGPU.
- GPU de consumo: el formato esta disenado para ejecutarse en el navegador, lo que sugiere GPU de escritorio con WebGPU habilitado, pero no se detallan modelos concretos.
- Opciones de despliegue: ruNNtime con WebGPU (unico runtime soportado por este formato); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| chmjkb/bielik-11b-v3.1-runntime-int4 | aprox. 11B | no disponible | safetensors int4 (runntime) | Apache 2.0 | Si, via WebGPU |
| speakleash/Bielik-11B-v3.1-Instruct | aprox. 11B | no disponible | safetensors (bf16/f16) | Apache 2.0 | No (requiere backend) |
| speakleash/Bielik-11B-v3.1-Instruct-GGUF | aprox. 11B | no disponible | GGUF | Apache 2.0 | No (requiere llama.cpp u otro runtime) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento ni de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un experimento del autor, no un lanzamiento oficial de ruNNtime ni de SpeakLeash; no debe tratarse como artefacto soportado en produccion.
- Solo soporta polaco segun los metadatos; el rendimiento en otros idiomas no esta documentado.
- La cuantizacion int4 en grupos de 32 introduce perdida de precision respecto al checkpoint original; no se han publicado evaluaciones de degradacion.
- No se dispone de datos sobre sesgos, tasa de alucinacion ni comportamiento en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base conviene verificar las condiciones del checkpoint original de SpeakLeash.
- El formato es especifico de ruNNtime (quant format v1); no es directamente cargable por llama.cpp, vLLM u otros runtimes sin conversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chmjkb/bielik-11b-v3.1-runntime-int4
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- GGUF de origen: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct-GGUF
- Documentacion de ruNNtime: https://docs.swmansion.com/runntime
- Demo en WebGPU: https://huggingface.co/spaces/chmjkb/bielik-11b-webgpu
