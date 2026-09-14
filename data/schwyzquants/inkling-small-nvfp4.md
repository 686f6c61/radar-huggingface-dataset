# schwyzquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una version cuantizada del modelo multimodal thinkingmachines/Inkling-Small, publicada por el usuario schwyzquants en HuggingFace. Se trata de un transformador autorregresivo multimodal de proposito general que acepta entradas de texto, imagen y audio, y genera texto. El modelo base pertenece a Thinking Machines y esta disenado para aplicaciones de agentes, asistentes de codigo, chatbots y sistemas de generacion aumentada por recuperacion (RAG).

Arquitectura y tamano: la model card del modelo base describe un transformador decoder-only de 42 capas con un backbone de mezcla de expertos (MoE) disperso, en el que cada token se enruta a 6 de 256 expertos mas 2 expertos compartidos activos en todos los tokens. La model card declara 276B parametros totales y 12B activos, aunque la metadata safetensors de esta version cuantizada indica 156.032.140.138 parametros (~156B), una discrepancia que conviene tener en cuenta. La atencion es hibrida, con capas locales y globales.

Relevancia: Inkling-Small-NVFP4 permite desplegar localmente un modelo multimodal de gran tamano en formato NVFP4, reduciendo el coste de memoria frente al BF16 original. La model card del modelo base documenta recetas de despliegue con SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace. No obstante, esta ficha corresponde a una cuantizacion de terceros con 0 descargas y 0 likes en el momento de la consulta, por lo que su validacion practica es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador decoder-only de 42 capas con backbone MoE disperso (6 de 256 expertos por token + 2 expertos compartidos); atencion hibrida local/global; multimodal nativo |
| Parametros totales | 276B segun la model card del modelo base; la metadata safetensors de esta version cuantizada indica 156.032.140.138 (~156B) |
| Parametros activos | 12B (segun la model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (el tag del repositorio indica ademas "8-bit"); el modelo base se ofrece en BF16 y NVFP4 |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Inkling-Small es un transformador autorregresivo multimodal de 42 capas con backbone MoE disperso. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens. La atencion combina capas locales y globales. La multimodalidad es nativa: las imagenes se codifican mediante un encoder jerarquico de parches y el audio mediante codificacion en tokens discretos, proyectandose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta. La model card declara 276B parametros totales y 12B activos.

En cuanto a los datos de entrenamiento, la model card indica que se emplearon tipos de contenido diversos (texto, imagenes, audio y video), procedentes de fuentes publicas, de terceros o generados/aumentados de forma sintetica. El proceso de curación incluye limpieza, procesado y modificacion de datasets, con pasos de deduplicacion y filtrado para eliminar datos de baja calidad. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La version NVFP4 aqui descrita es una cuantizacion de terceros del modelo base; no se documentan en la informacion disponible los detalles del proceso de cuantizacion.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y audio, y produce salidas de texto.
- Procesamiento de imagenes: cualquier imagen basada en pixeles; para rendimiento optimo, cada dimension debe estar entre 40 px y 4096 px.
- Procesamiento de audio: formato WAV a 16 kHz; para rendimiento optimo, una duracion inferior a 2 minutos.
- Razonamiento y conversacion general: orientado a uso conversacional de proposito general e instrucciones.
- Codigo: la model card indica soporte en multiples lenguajes de programacion.
- Soporte de agentes y tool use: la model card menciona explicitamente sistemas agenticos y de uso de herramientas como caso previsto.
- RAG: disenado para integrarse en sistemas de generacion aumentada por recuperacion.
- Multilingue: ingles como idioma principal, con capacidades multilingues generales.
- Modo de pensamiento explicito (thinking mode), vision o audio especiales adicionales: no disponible.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar conversaciones multi-turno incorporando imagenes y audio en la misma sesion, lo que permite chatbots que atienden consultas combinando capturas de pantalla, fotos o notas de voz.
- Atencion al cliente automatizada: admite entradas de texto, imagen y audio y esta orientado a instrucciones y uso conversacional, lo que permite triar tickets con adjuntos graficos o de voz y generar respuestas de texto.
- Asistentes de codigo: la model card declara soporte de multiples lenguajes de programacion y uso en asistentes de codigo, por lo que puede integrarse en editores o pipelines de revision de codigo.
- Sistemas agenticos con uso de herramientas: al estar disenado para tool use y flujos multi-paso, encaja en agentes que consultan APIs, ejecutan acciones y encadenan razonamiento.
- RAG sobre documentacion tecnica: la model card lo orienta explicitamente a sistemas RAG, de modo que puede utilizarse para responder preguntas sobre bases documentales combinando recuperacion y generacion.
- Analisis de imagenes para soporte tecnico: al aceptar imagenes de hasta 4096 px por dimension, puede emplearse para interpretar diagramas, esquemas o capturas de error enviadas por un usuario.
- Transcripcion y comprension de audio corto: con entradas WAV de 16 kHz por debajo de 2 minutos, sirve para resumir o clasificar notas de voz y reuniones breves.
- Modelo base para fine-tuning: al publicarse con pesos abiertos bajo Apache 2.0, puede servir como punto de partida para ajuste en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del modelo base incluye una tabla comparativa que enfrenta a Inkling-Small con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numericos de dicha tabla no estaban incluidos en la informacion proporcionada, por lo que no se reproducen. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- Tamano en disco: el repositorio ocupa 170,8 GB, por lo que los pesos deben caber en el almacenamiento y transferirse a memoria o VRAM antes de inferir.
- VRAM estimada: no disponible de forma oficial. Como referencia, 170,8 GB de pesos en NVFP4 implican que la inferencia no cabe en una unica GPU de 80 GB; se requiere despliegue multi-GPU (a partir de 3-4 aceleradores de 80 GB) o carga por offload a CPU/NVMe.
- GPU recomendadas: por el volumen de pesos, el despliegue realista pasa por H100 80 GB o A100 80 GB en configuracion multi-GPU. No cabe en GPU de consumo.
- GPU de consumo: no. Ninguna RTX (4090, 5090) dispone de VRAM suficiente para alojar los pesos completos.
- Opciones de despliegue: la model card del modelo base documenta recetas para SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace transformers. La compatibilidad con formatos de cuantizacion alternativos (GGUF, llama.cpp, Ollama) no esta confirmada para esta version NVFP4.
- Latencia y throughput estimados: no disponible. Al ser un MoE con 12B parametros activos, la computacion por token es inferior a la de un modelo denso de 276B, pero el cuello de botella principal es la capacidad de memoria.

## Comparativa con modelos similares

La model card del modelo base incluye una tabla comparativa con los siguientes modelos, de los que solo se dispone de datos parciales en la informacion proporcionada:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small-NVFP4 (esta version) | 156B safetensors / 276B-12B activos declarados | no disponible | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.5 397B-A17B | 397B totales, 17B activos (segun nomenclatura) | no disponible | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Pesos cuantizados por terceros: esta version la publica el usuario schwyzquants, no Thinking Machines; la calidad de la cuantizacion NVFP4 no esta validada en la informacion disponible.
- Discrepancia en el recuento de parametros: la metadata safetensors indica ~156B mientras la model card declara 276B totales y 12B activos. Conviene verificar antes de desplegar.
- Riesgo de alucinacion: al ser un modelo generativo de proposito general, puede producir informacion incorrecta, especialmente en tareas factuales o con entradas ambiguas.
- Idiomas: el soporte principal declarado es el ingles; las capacidades multilingues son generales y no estan cuantificadas.
- Sesgos: la model card del modelo base reconoce el uso de datos de internet y de terceros, con los sesgos asociados; no se detalla el trabajo de mitigacion.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que dificulta planificar despliegues con ventanas largas.
- Restricciones de entrada: imagenes recomendadas entre 40 px y 4096 px por dimension; audio WAV a 16 kHz y preferiblemente por debajo de 2 minutos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base remite a una politica de uso aceptable (model-acceptable-use-policy) que debe revisarse antes de productos en produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad ni benchmarks publicos.
- Contexto de despliegue: 170,8 GB de pesos implican infraestructura multi-GPU; no es apto para hardware de consumo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/schwyzquants/Inkling-Small-NVFP4
- Modelo base (BF16): https://huggingface.co/thinkingmachines/Inkling-Small
- Version NVFP4 oficial de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a entradas de un diccionario de javanes y no guardan relacion con el modelo).
