# SmallAICreator/GRAFT-1B-Vision-GGUF

## Resumen

GRAFT-1B-Vision-GGUF es un paquete multimodal para inferencia local que combina el modelo de lenguaje GRAFT-1B (una destilación de Qwen3-1.7B, en su variante SysPrompt) con un codificador de visión SigLIP-so400m-patch14-384 y un conector MLP de 2 capas, todo empaquetado en formato GGUF para llama.cpp. Lo desarrolla SmallAICreator / UltraLabs y su característica más llamativa es que no se ha entrenado ninguna parte nueva para dotar al modelo de visión: el conector procede sin modificar de otro proyecto (markendo/llava-extract-qwen3-1.7B) y se ha trasplantado directamente sobre GRAFT-1B, demostrando que un conector entrenado para Qwen3-1.7B transfiere razonablemente bien a un modelo destilado del mismo linaje.

El modelo tiene 1.180.101.632 parámetros totales (aproximadamente 1,18 B), una anchura de entrada de 2048 en el modelo de lenguaje y una ventana de contexto que, en los ejemplos de la model card, se configura a 4096 tokens mediante llama.cpp. Se distribuye como dos ficheros GGUF: el modelo de lenguaje cuantizado en Q6_K (971 MB) y el proyector visual en Q8_0 (587 MB), lo que suma unos 1,5 GB de pesos y permite ejecutarlo íntegramente en dispositivo.

Su relevancia radica en el nicho de la visión multimodal "on-device": es un ejemplo reproducible de cómo ensamblar visión sobre un modelo de lenguaje diminuto sin coste de entrenamiento, con soporte en llama.cpp, llama-server y aplicaciones móviles como PocketPal. Está publicado bajo licencia Apache-2.0 y soporta seis idiomas (inglés, español, francés, alemán, italiano y portugués).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje transformer (GRAFT-1B, destilado de Qwen3-1.7B) + codificador visual SigLIP-so400m-patch14-384 + conector MLP de 2 capas (esquema LLaVA) |
| Parametros totales | 1.180.101.632 (~1,18 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; los ejemplos de la model card arrancan llama-server con `-c 4096` |
| Tipos de cuantizacion | Modelo de lenguaje: Q6_K. Proyector visual: Q8_0 |
| Idiomas soportados | Ingles, espanol, frances, aleman, italiano, portugues |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: modelo de lenguaje + `mmproj` del proyector) |

## Arquitectura y entrenamiento

La arquitectura sigue el patron LLaVA: un codificador de imagen SigLIP-so400m con parche de 14 y resolucion 384x384 produce representaciones visuales que, tras un conector MLP de 2 capas, se proyectan al espacio de 2048 dimensiones de GRAFT-1B. Cada imagen se procesa en una unica vista de 384x384, lo que da lugar a 729 tokens de imagen que se inyectan en la secuencia de entrada del modelo de lenguaje. El resultado se empaqueta con la herramienta de conversion de codificadores LLaVA de llama.cpp (`mmproj`), lo que permite cargarlo con `llama-mtmd-cli` y `llama-server`.

El dato tecnico mas relevante es que no hubo entrenamiento alguno: el conector (y los pesos del codificador asociados) se tomaron sin cambios de markendo/llava-extract-qwen3-1.7B, un proyecto derivado del paper *Downscaling Intelligence: Exploring Perception and Reasoning Bottlenecks in Small Multimodal Models* (arXiv:2511.17487). La hipotesis que sustenta el proyecto es que, dado que GRAFT-1B es una destilacion de Qwen3-1.7B, el conector entrenado para el modelo original transfiere de forma directa al modelo destilado. No se documentan datos de entrenamiento, composicion de dataset, ni etapas de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional a partir de una imagen y una pregunta de texto (pipeline image-text-to-text).
- Descripcion de escenas generales, objetos, animales y colores.
- Procesamiento multimodal de una unica vista por imagen (384x384, 729 tokens).
- Soporte de chat multi-turno en llama.cpp (`llama-server` con interfaz web de subida de imagen).
- Ejecucion en dispositivo movil mediante PocketPal (Android e iOS).
- Modelo de lenguaje base multilingue en seis idiomas europeos.
- No dispone de tool calling ni function calling documentado.
- No se documentan capacidades de agente ni de razonamiento multi-paso especificas.
- No incluye audio ni modo "thinking" explicito.

## Casos de uso

- Descripcion de imagenes en aplicaciones moviles: integrado en PocketPal sobre un Pixel 6a, el modelo permite adjuntar una foto y obtener una descripcion en lenguaje natural completamente offline, sin coste de API ni conexion de red.
- Asistencia a personas con discapacidad visual en tareas de reconocimiento de escenas generales: sirve para describir objetos, animales y distribucion del espacio, aunque no es fiable para lectura de texto ni para detalles finos.
- Prototipado e investigacion sobre vision multimodal sin entrenamiento: permite reproducir el experimento de trasplante de conector de Qwen3.1-1.7B sobre un modelo destilado, util como banco de pruebas academico.
- Aplicaciones de campo sin conectividad: por su tamano (~1,5 GB) y su ejecucion en CPU, encaja en escenarios de inventario ligero, catalogacion rapida de imagenes o etiquetado de fotos en dispositivos aislados.
- Automatizacion de metadatos y etiquetado a pequena escala: puede generar descripciones breves de imagenes en lotes mediante llama.cpp en un servidor modesto, como paso previo a un clasificador o motor de busqueda.
- Educacion y demos de IA en el dispositivo: excelente caso de uso divulgativo para ensenar como se compone un sistema multimodal LLaVA con solo dos ficheros GGUF y llama.cpp.
- Filtrado rapido de imagenes en pipelines ligeros: deteccion de presencia de personas, animales o mobiliario en una escena cuando la precision fina no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato empirico de rendimiento documentado es el de la ejecucion en un Pixel 6a con PocketPal: 7,58 tokens/segundo de generacion y aproximadamente 46 segundos hasta el primer token, incluyendo el procesamiento del codificador visual y los 729 tokens de imagen en la CPU del telefono.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,5 GB de pesos (971 MB del modelo de lenguaje Q6_K + 587 MB del proyector Q8_0), con un requisito practico de unos 2 GB de RAM libre segun el autor.
- En telefonos de 6 GB de RAM conviene cerrar otras aplicaciones antes de cargar el modelo.
- GPU: no se especifica ninguna GPU recomendada. Es un modelo disenado para CPU y para ejecucion en dispositivo.
- Cabe en cualquier GPU consumer moderna por su tamano reducido (por ejemplo, una RTX 3060 o superior) y tambien en CPU, ya que fue validado en un Pixel 6a.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`, `llama-server`), PocketPal en Android e iOS. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia/throughput: 7,58 tokens/s y ~46 s de tiempo hasta el primer token en un Pixel 6a (CPU). No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Vision | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| GRAFT-1B-Vision-GGUF | ~1,18 B | Si (SigLIP-so400m, 1 vista) | No disponible (ejemplos a 4096) | GGUF | Apache-2.0 |
| Modelos de la familia LLaVA 1.x (referencia conceptual) | 7 B - 13 B tipicamente | Si | Mayor que 1B tipicamente | Safetensors, GGUF | Apache-2.0 / otras |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento con modelos de la misma categoria (por ejemplo, Qwen3-1.7B multimodal, SmolVLM o Moondream). Se indica "no disponible" en lugar de estimar cifras.

## Limitaciones y advertencias

- Conector zero-shot: fue entrenado para Qwen3-1.7B, no para GRAFT-1B, por lo que funciona bien en escenas generales pero omite o adivina detalles finos (el propio autor documenta que en los ejemplos no detecto un par de mandos de television ni un televisor).
- No es fiable para lectura de texto: al usar una unica vista de 384x384, no lee documentos, capturas de pantalla ni texto pequeno.
- Conteo y detalle fino son debiles, segun reconoce el autor.
- Al ser un modelo de aproximadamente 1B parametros, tiende a inventar detalles con seguridad; hereda todas las limitaciones de GRAFT-1B.
- Riesgo de alucinacion alto en escenas complejas o con texto.
- Requisitos de memoria: ~2 GB de RAM libre; en moviles de 6 GB puede haber problemas si hay otras apps abiertas.
- Contexto limitado a lo configurado en llama.cpp (4.096 en los ejemplos), sin cifra oficial confirmada.
- Uso comercial permitido bajo Apache-2.0, aunque se deben respetar las licencias de los componentes subyacentes (SigLIP y el conector, ambos Apache-2.0/MIT segun el autor).
- Cero descargas y cero interacciones en el momento de la consulta, lo que implica poca validacion externa de la comunidad.

## Enlaces

- HuggingFace (este repo): https://huggingface.co/SmallAICreator/GRAFT-1B-Vision-GGUF
- Modelo base GRAFT-1B: https://huggingface.co/SmallAICreator/GRAFT-1B
- Modelo base GRAFT-1B (seccion de limitaciones): https://huggingface.co/SmallAICreator/GRAFT-1B#limitations
- Codificador visual: https://huggingface.co/google/siglip-so400m-patch14-384
- Conector de origen: https://huggingface.co/markendo/llava-extract-qwen3-1.7B
- Paper: https://huggingface.co/papers/2511.17487
- Codigo del paper: https://github.com/markendo/downscaling_intelligence
- llama.cpp (herramienta de conversion y ejecucion): no facilitado explicitamente en la informacion, referencia estandar del proyecto ggml-org/llama.cpp
