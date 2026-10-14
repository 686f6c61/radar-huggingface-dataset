# rty813/whistle-bf16

## Resumen

`rty813/whistle-bf16` es una conversión a precisión completa (bf16) del modelo de reconocimiento de voz `Cactus-Compute/whistle`, publicada por el usuario rty813. Se trata de un port en PyTorch pensado para usuarios que necesitan cargar el modelo en vLLM, TGI, Xinference o transformers sin recurrir a la cuantización GGUF del repositorio original. El modelo hereda la arquitectura del original, por lo que es un reemplazo directo ("drop-in") para `AutoModelForCausalLM.from_pretrained`.

El modelo base, `Cactus-Compute/whistle`, es un sistema de conversión de voz a texto orientado a dispositivos de borde: móviles, wearables, robots, domótica, automoción y microcontroladores. El original ocupa un único archivo de 16,9 MB y se ejecuta sobre CPU —sin GPU ni dependencias— usando el mismo motor que Needle, del mismo autor (Cactus Compute). Cubre tres tareas: transcripción, marcas de tiempo a nivel de palabra y embeddings de voz.

Es relevante ahora porque traslada un modelo de ASR ultraligero diseñado para CPU y WebAssembly al ecosistema estándar de transformers y a servidores de inferencia como vLLM, facilitando su integración en pipelines de producción con Python. Conviene señalar una discrepancia en los metadatos: la ficha se etiqueta como `text-generation` y como `automatic-speech-recognition` en el modelo original; la tarea real del modelo base es reconocimiento de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (identica al original `Cactus-Compute/whistle`; el original no detalla el tipo de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (el original procesa audio de hasta 30 segundos en una pasada y con ventana mas alla) |
| Tipos de cuantizacion | Este port: bf16 (precision completa). El original: cuantizacion propia no especificada y GGUF |
| Idiomas soportados | En el original: ingles, aleman, frances, espanol, italiano, neerlandes y polaco. En esta ficha no se declaran idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | `pytorch_model.bin` (bf16); conversion a safetensors en progreso |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros ni el proceso de entrenamiento en los datos proporcionados. La model card indica unicamente que la arquitectura es identica a la del modelo original y que este port mantiene los pesos en bf16, de modo que se puede cargar mediante `AutoModelForCausalLM.from_pretrained("rty813/whistle-bf16")`. El modelo original describe capacidades funcionales (transcripcion, timestamps y embeddings) pero no detalles de arquitectura, dataset, numero de tokens, ni si hubo RLHF o DPO.

La innovacion tecnica destacable del modelo base es su enfoque de despliegue: un unico archivo de 16,9 MB, ejecucion en CPU sin dependencias, compatibilidad con WebAssembly y el mismo motor de inferencia que Needle. Ademas, el original emplea deteccion automatica de idioma, devuelve transcripcion vacia ante silencio (en lugar de alucinar una frase), permite streaming en directo confirmando las palabras en las que coinciden dos pasadas, y ofrece biasing de palabras clave. No se documenta ninguna tecnica de atencion lineal ni decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto sobre audio mono a 16 kHz de cualquier longitud: una pasada hasta 30 segundos y procesamiento por ventanas mas alla.
- Deteccion automatica del idioma de entrada, salvo que se especifique uno explicitamente.
- Gestion de silencios: devuelve una transcripcion vacia en lugar de inventar contenido.
- Streaming de audio en vivo de duracion indefinida, comprometiendo las palabras en las que coinciden dos pasadas.
- Marcas de tiempo a nivel de palabra con inicio, fin y probabilidad, alineadas a partir de la atencion del decodificador.
- Embeddings de voz: la salida del codificador, una fila por cada fotograma de 80 ms, utilizable para coincidencia y recuperacion sin decodificar transcripcion.
- Biasing de palabras clave para favorecer nombres, lugares y terminos de producto concretos.
- Idiomas del original: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.
- No se describe soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Transcripcion on-device en aplicaciones moviles: el modelo se ejecuta en CPU y cabe en un unico archivo de 16,9 MB, por lo que permite transcribir audio localmente sin enviar datos a la nube ni depender de una GPU.
- Subtitulado con resaltado y navegacion: las marcas de tiempo por palabra permiten a un reproductor resaltar la palabra en curso, saltar a un instante concreto o cortar clips con precision.
- Busqueda y recuperacion sobre audio: los embeddings del codificador (una fila por fotograma de 80 ms) permiten indexar y recuperar fragmentos de voz por similitud sin necesidad de transcribir previamente.
- Asistentes de voz en wearables y robots: al integrarse en el mismo motor que Needle y funcionar sin GPU, es adecuado para dispositivos con recursos limitados que necesitan reconocimiento en local.
- Domotica y control por voz: la deteccion automatica de idioma y el biasing de palabras clave permiten reconocer nombres de habitaciones, dispositivos o comandos concretos del hogar.
- Automocion: la transcripcion en streaming de duracion indefinida encaja en interfaces de voz de vehiculo, donde el audio llega de forma continua y debe procesarse sin latencia alta ni conexion.
- Biasing en dominios especificos: en atencion al cliente o entornos tecnicos, el biasing favorece la aparicion de nombres propios, productos y terminos que los usuarios mencionan habitualmente.
- Integracion en pipelines de servidor: gracias a este port en bf16, el modelo se puede servir con vLLM o Xinference junto al resto de la infraestructura de transformers, en lugar de gestionar GGUF aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo original esta disenado para ejecutarse en CPU, sin GPU y sin dependencias, en dispositivos de borde, incluyendo microcontroladores y WebAssembly.
- VRAM estimada para inferencia: no disponible. Dado que el original ocupa un unico archivo de 16,9 MB, el consumo deberia ser muy reducido, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (por ejemplo, RTX 4090) es previsiblemente sobredimensionada para este modelo; no se confirma oficialmente.
- Cabida en GPU consumer: no confirmado de forma explicita, pero por tamano el modelo es apto para cualquier GPU consumer e incluso para CPU.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), vLLM (`vllm serve rty813/whistle-bf16`), Xinference (buscar "whistle"), TGI y, para el original, llama.cpp con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rty813/whistle-bf16` | Port bf16 de ASR para transformers/vLLM | No disponible | No declarados en esta ficha | apache-2.0 | HuggingFace |
| `Cactus-Compute/whistle` | ASR on-device original, cuantizado y GGUF | 16,9 MB (un archivo) | en, de, fr, es, it, nl, pl | apache-2.0 | HuggingFace |
| `Cactus-Compute/needle3` | Modelo del mismo motor de CPU | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria (por ejemplo, variantes de Whisper o wav2vec2). La comparativa anterior es estructural, no de calidad.

## Limitaciones y advertencias

- No se han publicado datos de sesgos ni evaluaciones de equidad en la informacion disponible.
- Riesgo de alucinacion: el original mitiga el caso del silencio devolviendo transcripcion vacia, pero no se documenta el comportamiento ante ruido, audio solapado o idiomas no soportados.
- Limitacion de contexto: el modelo original procesa ventanas de audio de hasta 30 segundos en una pasada; no se especifica el comportamiento en fragmentos mas largos mas alla del procesamiento por ventanas.
- Limitacion de idioma: solo se confirman los siete idiomas del original (en, de, fr, es, it, nl, pl); el rendimiento en otros idiomas no esta garantizado.
- Discrepancia de metadatos: la ficha se etiqueta como `text-generation` cuando la tarea real del modelo base es reconocimiento de voz (ASR), lo que puede confundir a quien la busque por pipeline.
- Estado del repositorio: el tamano indicado es 0,0 GB y el modelo tiene 0 descargas y 0 me gusta; la conversion a safetensors esta "en progreso", por lo que el formato estable a largo plazo no esta cerrado.
- Fecha de creacion inusual: los metadatos indican 2026-10-13, una fecha futura, lo que puede indicar manipulacion o error en el repositorio.
- Licencia: apache-2.0 permite uso comercial, pero no se detallan atribuciones adicionales exigidas por el modelo base mas alla de la compatibilidad de licencia.
