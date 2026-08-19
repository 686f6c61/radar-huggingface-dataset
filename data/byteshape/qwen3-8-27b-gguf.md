# byteshape/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-27B, un LLM denso y nativo multimodal desarrollado por el equipo Qwen de Alibaba. El modelo original combina comprensión de texto e imagen (y vídeo) en una única arquitectura, con una ventana de contexto de 262 000 tokens y licencia Apache 2.0, lo que lo hace especialmente atractivo para despliegues locales y aplicaciones de producción sin restricciones de uso comercial.

Esta ficha se centra en la release de ByteShape, que aplica su algoritmo propietario ShapeLearn-Lite para cuantizar cada tensor con el tipo de dato más adecuado. El resultado son seis variantes GGUF que van desde 3,44 hasta 5,60 bits por peso, con tamaños de archivo entre 11,8 GB y 19,1 GB. Todas las variantes incorporan el head de multi-token prediction (MTP) del modelo original, lo que permite usar el propio modelo como borrador especulativo en llama.cpp y duplicar aproximadamente la velocidad de decodificación sin necesidad de un modelo auxiliar.

La release está optimizada para GPU y se ha validado mediante comprobaciones puntuales, no con una batería completa de benchmarks. Las dos variantes más grandes (5,60 y 4,72 bpw) pretenden mantener la calidad del modelo BF16 original, mientras que las más pequeñas sacrifican algo de calidad a cambio de menor uso de memoria y mayor velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) con head MTP |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ3_S (3,44 bpw), IQ4_XS (3,67 / 4,00 / 4,40 bpw), Q5_K_S (4,72 bpw), Q5_K_M (5,60 bpw) |
| Idiomas soportados | No disponible (el modelo base de Qwen es multilingue, pero no se especifica en la documentacion de esta release) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un transformer denso de 27 300 millones de parametros, disenado como modelo nativo multimodal: procesa directamente imagenes y video ademas de texto, sin necesidad de adaptadores externos. La arquitectura incorpora un head de multi-token prediction (MTP) que permite predecir varios tokens por paso, lo que se aprovecha en esta release GGUF para decodificacion especulativa sin modelo auxiliar.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. El modelo base fue desarrollado por Alibaba Qwen y se distribuye bajo licencia Apache 2.0. La cuantizacion de ByteShape utiliza el algoritmo ShapeLearn-Lite, que aprende el tipo de dato optimo para cada tensor, produciendo una mezcla hibrida de tecnicas de cuantizacion en lugar de perfiles convencionales de llama.cpp.

## Capacidades

- Generacion de texto y razonamiento: soporta modo thinking (activado por defecto) y modo instruct (desactivando el razonamiento con `--reasoning off`).
- Comprension multimodal: procesa imagenes y video como entrada, ademas de texto, gracias a su arquitectura nativa vision-language.
- Generacion de codigo: el modelo base destaca en tareas de programacion, segun los benchmarks publicados.
- Agentes y automatizacion: muestra resultados relevantes en benchmarks de agentes como Terminal Bench y OSWorld, lo que indica capacidad para tareas de agente y automatizacion de oficina.
- Tool calling: aunque no se confirma explicitamente en la documentacion de esta release, el modelo base de Qwen3.8 soporta function calling, y los benchmarks de agentes sugieren su disponibilidad.
- Multi-token prediction: el head MTP embebido permite acelerar la decodificacion en llama.cpp usando el propio modelo como borrador especulativo.

## Casos de uso

- Atencion al cliente automatizada: con 262 000 tokens de contexto, el modelo puede mantener conversaciones multi-turno muy largas, incluyendo historiales completos de tickets y documentos adjuntos, sin perder el hilo.
- Generacion de codigo en produccion: su capacidad para razonar sobre imagenes (capturas de pantalla, diagramas) y generar codigo lo hace util para asistentes de desarrollo que necesitan interpretar interfaces graficas o esquemas.
- Analisis de documentos con vision: puede extraer informacion de facturas, contratos o formularios escaneados, combinando OCR con comprension semantica del texto.
- Automatizacion de oficina: los benchmarks en OSWorld indican que puede operar aplicaciones de escritorio, lo que permite construir agentes que rellenen formularios, gestionen correos o manipulen hojas de calculo.
- Asistente de investigacion: su contexto largo y capacidad de razonamiento permiten resumir articulos, comparar resultados y responder preguntas sobre grandes volumenes de literatura cientifica.
- Despliegue local en hardware de consumo: las variantes de 11,8 a 16,1 GB caben en GPUs de 16-24 GB, permitiendo ejecutar un modelo multimodal de 27B en una estacion de trabajo sin conexion a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF. La model card indica que la release se valido mediante comprobaciones puntuales y que las variantes de 5,60 y 4,72 bpw se espera que mantengan la calidad del modelo BF16 original, pero no se proporcionan numeros.

Los resultados web citan benchmarks del modelo base Qwen3.8-27B (no de la cuantizacion):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld | 84,3 |

Estos datos deben interpretarse como referencia del modelo original, no de esta release cuantizada.

## Requisitos de hardware

La tabla siguiente resume las variantes disponibles, su tamano de archivo y el rendimiento medido en una RTX PRO 6000 Blackwell con llama.cpp b10430 (generacion de 2K tokens, un solo stream):

| Variante | Bits/peso | Tamano archivo | TPS | TPS con MTP |
|---|---|---|---|---|
| GPU-1 (IQ3_S) | 3,44 | 11,8 GB | 94 | 167 |
| GPU-2 (IQ4_XS) | 3,67 | 12,6 GB | 90 | 166 |
| GPU-3 (IQ4_XS) | 4,00 | 13,7 GB | 86 | 165 |
| GPU-4 (IQ4_XS) | 4,40 | 15,0 GB | 81 | 162 |
| GPU-5 (Q5_K_S) | 4,72 | 16,1 GB | 77 | 152 |
| GPU-6 (Q5_K_M) | 5,60 | 19,1 GB | 68 | 139 |

- VRAM estimada: el tamano del archivo mas overhead de contexto y KV cache. Para GPU-6 se necesitan al menos 20 GB; para GPU-5, unos 17 GB; para GPU-4, unos 16 GB.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar todas las variantes. Una RTX 4080 (16 GB) solo admite hasta GPU-4 (15,0 GB) o GPU-5 (16,1 GB) con margen muy justo. GPUs de 12 GB (RTX 4070) solo llegan a GPU-1 o GPU-2.
- Opciones de despliegue: llama.cpp (llama-server con `--mmproj-auto` para vision), Ollama (si se importa el GGUF), vLLM o TGI (convirtiendo a safetensors si se prefiere). La model card recomienda usar los comandos generados en byteshape.com para obtener los parametros de muestreo correctos.
- Latencia y throughput: los valores TPS de la tabla se midieron en una RTX PRO 6000 Blackwell; en GPUs consumer el rendimiento sera menor. Con MTP activado, la velocidad se duplica aproximadamente.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria (27B multimodales). La referencia mas directa es el modelo base Qwen3.8-27B en formato BF16, que ocupa aproximadamente 54 GB en memoria y requiere una GPU de 80 GB (A100/H100) o varias GPUs. Esta release GGUF reduce ese requisito a entre 12 y 20 GB, a costa de una posible perdida de calidad en las variantes mas pequenas.

Otras cuantizaciones de Qwen3.8-27B de otros proveedores podrian existir, pero no se han encontrado en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion no ha sido evaluada con una bateria completa de benchmarks; solo se realizaron comprobaciones puntuales. Las variantes por debajo de 4,72 bpw pueden presentar degradacion de calidad notable.
- Los labels de cuantizacion (IQ3_S, IQ4_XS, etc.) no corresponden a los perfiles convencionales de llama.cpp; son indicadores aproximados del tamano y bits por peso, ya que el algoritmo ShapeLearn-Lite usa una mezcla hibrida de tecnicas.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en tareas de razonamiento complejo o informacion factual. Se recomienda validar las salidas en aplicaciones criticas.
- La ventana de contexto de 262 000 tokens es amplia, pero en la practica el rendimiento puede degradarse con contextos muy largos, y el uso de memoria crece proporcionalmente.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que los datos de entrenamiento del modelo base no infrinjan derechos de terceros.
- El modo thinking esta activado por defecto; para aplicaciones de baja latencia puede ser necesario desactivarlo con `--reasoning off`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/byteshape/Qwen3.8-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de AlibabaCloud-Official/Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de ejecucion local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Analisis de requisitos VRAM (ofox.ai): https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Guia completa del modelo (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Comunidad Reddit de ByteShape: https://www.reddit.com/r/ByteShape/
