# agentlans/Qwen3.5-0.8B-Picture-Captioner

## Resumen

Qwen3.5-0.8B-Picture-Captioner es un modelo de visión-lenguaje (VLM) de pequeno tamano publicado por el usuario agentlans en HuggingFace. Se trata de un ajuste fino mediante LoRA del modelo huihui-ai/Huihui-Qwen3.5-0.8B-abliterated, que a su vez deriva de la familia Qwen3.5 de Alibaba. El modelo resuelve una tarea concreta: generar pies de foto (captions) concisos, detallados y precisos a partir de una imagen de entrada. Su relevancia radica en que ofrece capacidades multimodales con menos de mil millones de parametros, lo que permite desplegarlo en hardware modesto.

El ajuste se realizo sobre el dataset agentlans/monet-caption con una unica epoca, LoRA de rango 16 y precision bf16. El modelo acepta imagenes de hasta 768 x 768 pixeles (589.824 pixeles) y utiliza atencion SDPA. Esta pensado para flujos de trabajo donde se necesita etiquetado o descripcion automatica de imagenes sin depender de modelos multimodales de gran escala.

La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza "abliterated" del modelo base (sin censura) introduce consideraciones importantes sobre seguridad y moderacion de contenido que deben tenerse en cuenta en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), derivada de Qwen3.5; atencion SDPA (Scaled Dot-Product Attention) |
| Parametros totales | 852.985.920 (aprox. 0,85 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el repo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Precision de entrenamiento | bf16 |
| Resolucion maxima de imagen | 768 x 768 (589.824 pixeles) |
| Modelo base | huihui-ai/Huihui-Qwen3.5-0.8B-abliterated |
| Dataset de ajuste | agentlans/monet-caption |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo es un VLM basado en la arquitectura Qwen3.5, que combina un codificador visual con un decoder de lenguaje transformer. La inferencia emplea atencion SDPA, una implementacion eficiente de atencion escalada por producto punto. El ajuste fino se realizo mediante LoRA con rango 16 y alpha 32, dropout de 0,05, learning rate de 2e-4, weight decay de 0,01 y 100 pasos de warmup, durante una sola epoca sobre el dataset agentlans/monet-caption. La perdida de entrenamiento suavizada fue de 2,1571 y la de validacion de 2,2069.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo base es una version "abliterated", lo que implica que se han eliminado o reducido los mecanismos de rechazo del modelo original, un detalle relevante para el comportamiento en produccion.

## Capacidades

- Generacion de pies de foto (image captioning) concisos y detallados en ingles.
- Procesamiento de imagen-texto a texto (pipeline image-text-to-text).
- Entrada multimodal: imagen mas prompt de texto, con formato conversacional.
- Descripcion de escenas, objetos y acciones presentes en la imagen.
- Capacidad de seguir instrucciones textuales junto a la imagen (por ejemplo, "Describe this image in detail.").
- Soporte de conversacion multi-turno segun el tag "conversational".
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No se documentan modos especiales como thinking mode, audio o video.

## Casos de uso

- Etiquetado automatico de imagenes en pipelines de datos: el modelo puede generar descripciones para grandes volumenes de imagenes y alimentar sistemas de busqueda o clasificacion, gracias a su bajo coste computacional.
- Accesibilidad: generacion de texto alternativo (alt text) para imagenes en sitios web y aplicaciones, con descripciones detalladas que mejoran la experiencia de usuarios con lectores de pantalla.
- Moderacion y catalogacion de contenido visual: descripcion rapida de imagenes subidas por usuarios para su revision o indexacion.
- Generacion de metadatos para bibliotecas de imagenes: creacion de pies de foto para archivos fotograficos, bancos de imagenes o colecciones personales.
- Preprocesamiento para sistemas RAG multimodales: conversion de imagenes a texto descriptivo que luego se indexa en bases vectoriales.
- Prototipado e investigacion en VLM de bajo coste: servir como linea base ligera para experimentos de captioning sin requerir GPUs de gran memoria.
- Asistencia en documentacion tecnica: descripcion de capturas de pantalla o diagramas en flujos de documentacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,85 B de parametros en bf16, el modelo requiere aproximadamente 1,7 GB solo para los pesos; sumando el codificador visual y las activaciones, se estima un uso de entre 3 y 6 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) son suficientes; tambien cabe en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas de VRAM.
- Opciones de despliegue: al ser un modelo multimodal con safetensors, puede servirse con Transformers; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el autor advierte que la generacion es inherentemente mas lenta que en modelos solo de texto o metodos especializados de etiquetado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Picture-Captioner | 0,85 B | no disponible | imagen-texto a texto | Apache 2.0 | HuggingFace |
| Modelos de captioning especializados (p. ej., BLIP) | no disponible | no disponible | imagen-texto a texto | variable | HuggingFace |
| VLMs de mayor tamano de la familia Qwen | no disponible | no disponible | multimodal | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales; no se han publicado benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Identificacion erronea de objetos y acciones: el autor advierte de que puede alucinar o confundir objetos concretos (por ejemplo, etiquetar una pelota roja como tomate) o acciones inusuales.
- Captions repetitivas: a pesar de la variedad del dataset, el modelo puede caer en bucles de fraseo repetitivo.
- Velocidad de inferencia: al ser un VLM, la generacion es mas lenta que en modelos solo de texto o metodos especializados de etiquetado.
- Modelo base "abliterated": al derivar de una version sin censura, puede producir contenido inapropiado o no filtrado; se recomienda moderacion adicional en produccion.
- Idioma: solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto, lo que limita la planificacion de conversaciones largas.
- Resolucion de imagen limitada a 768 x 768; imagenes de mayor resolucion deben redimensionarse proporcionalmente, lo que puede perder detalle.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar.
- Sin datos de benchmarks: no es posible evaluar su rendimiento frente a alternativas con cifras objetivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentlans/Qwen3.5-0.8B-Picture-Captioner
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-0.8B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/agentlans/monet-caption
- Galeria de ejemplos: https://huggingface.co/agentlans/Qwen3.5-0.8B-Picture-Captioner/blob/main/image_gallery.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
