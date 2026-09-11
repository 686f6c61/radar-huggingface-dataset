# Dsaf69/Qwen-Image-Edit-Rapid-AIO-GGUF

## Resumen

Qwen-Image-Edit-Rapid-AIO-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Phr00t/Qwen-Image-Edit-Rapid-AIO, publicado por el usuario Dsaf69. El modelo subyacente deriva de Qwen/Qwen-Image-Edit-2509 (la variante de edición de imagen de la familia Qwen-Image), combinado con el LoRA de destilación lightx2v/Qwen-Image-Lightning y con LoRAs de contenido NSFW. Su objetivo es permitir la generación texto a imagen y la edición imagen a imagen dentro de ComfyUI consumiendo menos memoria que los pesos originales.

Se trata de un transformer de difusión orientado a imagen: los metadatos del repositorio declaran 7.615.616.512 parametros y licencia Apache 2.0. Este repositorio no es una empaquetadura "todo en uno": solo contiene las cuantizaciones del modelo de difusion y exige aportar por separado el text encoder (Qwen2.5-VL-7B-Instruct, con una variante "abliterated" enlazada por el autor), el VAE (pig-vae) y un parche del nodo nodes_qwen.py de ComfyUI.

Su relevancia es practica: facilita ejecutar un modelo de edicion de imagen de la familia Qwen en hardware de consumo mediante cuantizacion GGUF, con el modo de pocos pasos que aporta Lightning (se documentan flujos de 4 pasos con Q2_K y Q5_K_M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Qwen-Image-Edit-2509) |
| Parametros totales | 7.615.616.512 (~7,6 mil millones, dato reportado en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion de imagen); el text encoder es un modelo de lenguaje aparte |
| Tipos de cuantizacion | GGUF; se documentan Q2_K y Q5_K_M en los ejemplos, el repositorio incluye varios niveles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (VAE y text encoder se distribuyen aparte, tambien en GGUF) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de Phr00t/Qwen-Image-Edit-Rapid-AIO, que a su vez parte de Qwen/Qwen-Image-Edit-2509. Qwen-Image-Edit-2509 es un modelo de edicion de imagen basado en difusion que acepta instrucciones en lenguaje natural y edicion de imagenes de entrada. Sobre esa base, el proyecto Rapid-AIO incorpora el LoRA de destilacion lightx2v/Qwen-Image-Lightning, que reduce el numero de pasos de muestreo necesarios (se documentan flujos de 4 pasos), y anade LoRAs de contenido NSFW. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

El autor indica explicitamente que este repositorio contiene unicamente las cuantizaciones GGUF y que no es una empaquetadura "AIO": no es posible (segun el autor, "ATM") incluir el VAE y el text encoder dentro del mismo GGUF, por lo que se requiere montar los tres componentes por separado. El flujo de uso implicа reemplazar el archivo comfy_extras/nodes_qwen.py por una version corregida y colocar el archivo mmproj junto al GGUF del text encoder abliterated.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image, t2i).
- Edicion de imagen guiada por instrucciones (image-to-image, i2i) sobre una imagen de entrada.
- Generacion en pocos pasos de muestreo (flujos documentados de 4 pasos) gracias al LoRA Lightning.
- Inclusión de LoRAs de contenido NSFW orientados a contenido para adultos.
- Ejecucion dentro de ComfyUI mediante cargadores GGUF.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de un modelo de lenguaje.
- Capacidades multilingues de prompt: no disponibles.
- Capacidades especiales: ninguna adicional reportada (sin vision ni audio mas alla del propio text encoder multimodal).

## Casos de uso

- Edicion fotografica asistida por texto: el usuario aporta una imagen y una instruccion en lenguaje natural (cambio de fondo, retoque de iluminacion, sustitucion de objetos) y el modelo devuelve la imagen editada, aprovechando el flujo i2i y el modo de pocos pasos para reducir el coste de inferencia.
- Generacion de imagenes para prototipado de producto: crear variaciones rapidas de conceptos visuales a partir de descripciones de texto antes de pasar a un estudio de diseno.
- Ilustracion de contenidos para blogs y documentacion: generar cabeceras o imagenes de apoyo con un flujo t2i de 4 pasos en ComfyUI.
- Edicion por lotes de catalogos de imagen: aplicar transformaciones coherentes (recorte, correccion de estilo, reencuadre) a una coleccion de imagenes con el modo i2i.
- Creacion de contenido para adultos: el paquete incluye LoRAs NSFW pensados para este fin, con las advertencias legales y eticas correspondientes.
- Experimentacion e investigacion en cuantizacion GGUF: servir como banco de pruebas para medir la degradacion de calidad entre niveles Q2_K y Q5_K_M en modelos de difusion.
- Despliegue local en estaciones de trabajo con GPU de consumo: al reducir el peso en VRAM, permite ejecutar edicion de imagen sin recurrir a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones a partir del numero de parametros reportado (~7,6 mil millones para el modelo de difusion y un text encoder de la clase Qwen2.5-VL-7B); no son datos oficiales del autor.

- Modelo de difusion en GGUF (VRAM estimada, aproximada): Q2_K ~3 GB; Q4_K_M ~4,6 GB; Q5_K_M ~5,4 GB; Q8_0 ~8,1 GB; FP16 ~15 GB.
- Text encoder Qwen2.5-VL-7B en GGUF (VRAM estimada): Q4_K_M ~4,7 GB; Q8_0 ~8 GB; FP16 ~15 GB.
- Consumo combinado aproximado: Q2_K (difusion + text encoder) ~8-10 GB incluyendo VAE y overhead; Q5_K_M ~14-16 GB; FP16 ~30 GB o mas.
- Cabe en GPU de consumo: si. Con cuantizaciones Q2_K o Q3 cabe en GPUs de 12 GB (por ejemplo RTX 3060 12 GB, RTX 4070 12 GB). Niveles Q5_K_M o superiores encajan mejor en 16-24 GB (RTX 4080, RTX 4090, RTX A5000).
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones bajas; RTX 4080 / RTX 4090 (24 GB) para Q5_K_M y superiores; A100 40/80 GB para FP16 y procesamiento por lotes.
- Opciones de despliegue: ComfyUI con nodos GGUF (via principal, es la libreria declarada); el text encoder puede ejecutarse con llama.cpp; no aplica vLLM, TGI ni Ollama para el modelo de difusion.
- Latencia y throughput: no disponibles. El uso de 4 pasos de muestreo con Lightning reduce el coste frente a un muestreo completo, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros totales | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-Image-Edit-Rapid-AIO-GGUF (este) | Difusion de imagen (edicion + t2i), cuantizada | ~7,6 mil millones (reportado) | Apache 2.0 | GGUF | Requiere text encoder y VAE por separado |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | Difusion de imagen (edicion + t2i) con Lightning y NSFW | no disponible | no disponible | safetensors | Fuente original de estas cuantizaciones |
| Qwen/Qwen-Image-Edit-2509 | Difusion de imagen (edicion) | no disponible | Apache 2.0 | safetensors | Modelo base sin destilar ni LoRAs |
| FLUX.1 Kontext [dev] | Difusion de imagen (edicion por instrucciones) | no disponible | licencia dev (uso no comercial) | safetensors | Alternativa de edicion por instrucciones |

## Limitaciones y advertencias

- El paquete incluye LoRAs de contenido NSFW, lo que desaconseja su uso en entornos profesionales o de produccion sin filtrado previo.
- No es una empaquetadura "todo en uno": exige montar manualmente el text encoder, el VAE, el archivo mmproj y parchear el nodo nodes_qwen.py de ComfyUI. Un montaje incorrecto provoca errores del tipo "mat1 and mat2 shapes cannot be multiplied".
- La variante de text encoder recomendada por el autor esta "abliterated", es decir, sin alineacion de seguridad, lo que aumenta el riesgo de salidas inapropiadas.
- Riesgo de alucinacion visual: como modelo de difusion, puede introducir artefactos, alterar elementos no solicitados o producir resultados inconsistentes respecto a la imagen de entrada, especialmente en cuantizaciones bajas (Q2_K).
- La cuantizacion agresiva (Q2_K) degrada la fidelidad de la imagen respecto a FP16; el autor muestra ejemplos comparativos entre Q2_K y Q5_K_M.
- Sesgos conocidos del dataset de entrenamiento: no disponibles.
- Limitaciones de idioma de prompt: no disponibles.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero los LoRAs NSFW y los componentes de terceros pueden estar sujetos a sus propias condiciones; conviene revisar cada componente antes de un uso comercial.
- Repositorio comunitario con 0 descargas y 0 "likes" en el momento de la consulta, sin verificacion ni mantenimiento garantizado.
- La fecha de creacion y actualizacion registrada (2026-09-11) resulta atipica y no aporta informacion util sobre el estado real del proyecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dsaf69/Qwen-Image-Edit-Rapid-AIO-GGUF
- Modelo base (AIO original): https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Nodo corregido de ComfyUI (nodes_qwen.py): https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO/blob/main/fixed-textencode-node/nodes_qwen.py
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- LoRA de destilacion Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- Text encoder abliterated recomendado: https://huggingface.co/Phil2Sat/Qwen-Image-Edit-Rapid-AIO-GGUF/tree/main/Qwen2.5-VL-7B-Instruct-abliterated
- VAE en GGUF (pig-vae): https://huggingface.co/calcuis/pig-vae/blob/main/pig_qwen_image_vae_fp32-f16.gguf
