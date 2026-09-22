# Blackvapormax/stable-diffusion-1.5-onnx

## Resumen

Este repositorio contiene una conversion a formato ONNX del modelo Stable Diffusion 1.5, publicado por el usuario Blackvapormax. No se trata de un modelo nuevo ni de un reentrenamiento: son los pesos originales de RunwayML (desarrollados por Robin Rombach y Patrick Esser) exportados a grafos ONNX. El autor indica que el modelo no ha sido modificado mas alla de la conversion y que la licencia original permite la redistribucion siempre que no se destine a usos daninos. El repositorio ocupa 4,3 GB y, en el momento de la consulta, acumula 0 descargas y 1 like.

Tecnicamente es un modelo de difusion latente (Latent Diffusion Model) para generacion de imagenes a partir de texto. Utiliza un U-Net como red de denoising, un autoencoder variational (VAE) que comprime las imagenes al espacio latente y un codificador de texto congelado CLIP ViT-L/14, siguiendo el enfoque descrito en el paper de Imagen. El checkpoint original se inicializo con los pesos de Stable Diffusion 1.2 y se ajusto durante 595.000 pasos a resolucion 512x512 sobre el subconjunto laion-aesthetics v2 5+, con un 10 por ciento de dropout del condicionamiento de texto para mejorar el muestreo con classifier-free guidance.

Su relevancia es practica mas que cientifica: los pesos originales de RunwayML fueron retirados de Hugging Face, y esta conversion permite seguir ejecutando el modelo en entornos que no disponen de PyTorch, usando unicamente ONNX Runtime o derivados. Es util para despliegues en C++, C#/.NET, Java, navegador (onnxruntime-web) o hardware con aceleracion especifica, aunque se trata de una conversion no oficial y sin validacion publica por parte de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion latente (LDM): U-Net de denoising + autoencoder VAE + codificador de texto CLIP ViT-L/14 congelado |
| Parametros totales | No indicado en la model card. La arquitectura original de SD 1.5 ronda los 1.070 millones en total (U-Net ~860 M, CLIP ViT-L/14 ~123 M, VAE ~84 M); cifra aproximada, no confirmada por el autor de la conversion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | El prompt se tokeniza con CLIP, cuyo limite habitual es de 77 tokens; la model card no especifica este dato |
| Tipos de cuantizacion | No disponible. El repositorio solo declara pesos en formato ONNX; no se documentan variantes FP16, INT8 ni dinamicas |
| Idiomas soportados | Ingles (la model card indica "Language(s): English"); otros idiomas no funcionan de forma fiable |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | ONNX |
| Resolucion nativa | 512x512 |
| Pipeline declarado | text-to-image |
| Tamano del repositorio | 4,3 GB |
| Autor de la conversion | Blackvapormax |
| Desarrolladores del modelo original | Robin Rombach y Patrick Esser (RunwayML / CompVis) |
| Fecha de creacion del repositorio | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo sigue la formulacion de difusion latente: en lugar de aplicar el proceso de difusion sobre pixeles, lo hace sobre representaciones comprimidas generadas por un VAE. El codificador del VAE proyecta una imagen de 512x512 a un latente de menor dimension, el U-Net aprende a eliminar ruido en ese espacio condicionado por el texto, y el decodificador reconstruye la imagen final. El condicionamiento textual proviene de CLIP ViT-L/14, un transformer de vision y lenguaje que permanece congelado durante el entrenamiento y que se usa como propone el paper de Imagen. Esta eleccion reduce de forma sustancial el coste computacional frente a la difusion en espacio de pixeles, que es la innovacion central del trabajo de Rombach et al. (CVPR 2022).

En cuanto al entrenamiento, la model card indica que el checkpoint se inicializo con Stable Diffusion 1.2 y se ajusto 595.000 pasos a 512x512 sobre "laion-aesthetics v2 5+", con un 10 por ciento de dropout en el condicionamiento de texto para habilitar classifier-free guidance (arXiv:2207.12598). No se menciona uso de RLHF, DPO ni tecnicas de alineacion por preferencias, algo que no aplica a este tipo de modelo generativo. La conversion a ONNX no introduce cambios en los pesos ni en la topologia de la red; unicamente exporta el grafo computacional a un formato interoperable. No se documenta si se exportaron todos los componentes (U-Net, VAE y text encoder) o solo un subconjunto, ni si el grafo admite todos los schedulers de diffusers.

## Capacidades

- Generacion de imagenes fotorrealistas o artisticas a partir de una descripcion textual en ingles, a resolucion nativa 512x512.
- Modificacion de imagenes (image-to-image) y tecnicas derivadas como inpainting, siempre que los componentes necesarios esten incluidos en la exportacion ONNX; la model card no lo detalla.
- Condicionamiento mediante classifier-free guidance, lo que permite ajustar el peso del prompt durante la inferencia.
- Personalizacion mediante fine-tuning con tecnicas externas (LoRA, DreamBooth, textual inversion) partiendo de los pesos originales; no se documenta soporte directo sobre el grafo ONNX.
- Ejecucion en runtimes que no requieren PyTorch, incluido ONNX Runtime en CPU, CUDA, TensorRT, DirectML y entornos web.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, planificacion ni comportamiento agentico.
- No genera texto ni codigo; la salida es exclusivamente imagenes.
- No incorpora modo "thinking" ni capacidades de audio.
- No es un modelo multimodal de comprension: no acepta imagenes como entrada para describirlas o razonarlas.
- Capacidad multilingue limitada: solo funciona razonablemente con prompts en ingles.

## Casos de uso

- Generacion de arte conceptual y bocetos: ilustradores y disenadores pueden iterar rapidamente sobre ideas de personajes, entornos o paletas usando prompts en ingles y ajustando el guidance scale, sin depender de servicios en la nube.
- Prototipado de assets para videojuegos y aplicaciones: generacion de texturas, iconos o fondos a 512x512 que despues se retocan manualmente, acelerando la fase de preproduccion.
- Despliegue en entornos sin PyTorch: el formato ONNX permite integrar el modelo en aplicaciones de escritorio escritas en C++, C#/.NET o Java mediante ONNX Runtime, algo inviable con un checkpoint tradicional de diffusers.
- Ejecucion en el navegador: combinado con onnxruntime-web o WebGPU, permite ofrecer generacion de imagenes local en una aplicacion web sin enviar datos a un servidor.
- Aceleracion con TensorRT: la conversion de grafos ONNX a motores TensorRT es un camino habitual para reducir la latencia en GPUs NVIDIA, por lo que este repositorio sirve como punto de partida para optimizacion en produccion.
- Investigacion sobre sesgos y limitaciones: al ser un modelo de 2022 entrenado sobre LAION-5B sin deduplicacion, es un banco de pruebas util para estudiar memorizacion de imagenes duplicadas, estereotipos y fallos de composicionalidad.
- Herramientas educativas y creativas: uso en talleres y cursos para explicar como funciona la difusion latente, el classifier-free guidance y el papel del codificador CLIP.
- Generacion de datos sinteticos para pruebas: creacion de imagenes de ejemplo para validar pipelines de vision por computador, siempre que no se use como sustituto de datos reales etiquetados.
- Pruebas de regresion visual en CI: al ser un grafo ONNX determinista con la misma semilla, puede integrarse en pipelines de integracion continua para detectar cambios inesperados en el comportamiento de un sistema de generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye cifras de FID, CLIP score, IS ni ninguna otra metrica cuantitativa, y el repositorio no presenta evaluaciones propias. Tampoco se documentan mediciones de latencia, throughput ni comparaciones con otros checkpoints. Cualquier cifra que se cite sobre Stable Diffusion 1.5 corresponde al modelo original y no ha sido verificada para esta conversion concreta a ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en el repositorio ocupan 4,3 GB, lo que sugiere un export en precision FP32. Con ese tamano se necesitan aproximadamente 6-8 GB de VRAM para ejecutar a 512x512, sumando pesos, activaciones y latentes.
- Si el usuario convierte los grafos a FP16, el peso baja a unos 2,2 GB y la VRAM necesaria se situa en torno a 4 GB, un rango asequible para GPUs de gama media.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y en general cualquier GPU con 8 GB o mas si se usa FP16. En 6 GB puede funcionar con dificultad y resoluciones reducidas.
- GPU profesionales: A100 40/80 GB, H100, L4, L40S y T4 16 GB, aunque para este tamano de modelo el hardware de gama alta esta sobredimensionado salvo en escenarios de alta concurrencia.
- CPU: la inferencia en CPU es posible con ONNX Runtime, pero resulta sensiblemente mas lenta que en GPU; es adecuada para pruebas, no para produccion con trafico alto.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, OpenVINO), pipelines ONNX de la libreria diffusers, Hugging Face Optimum, onnxruntime-web para navegador y conversion posterior a TensorRT mediante herramientas como Olive o trtexec.
- Latencia y throughput: no disponible. Dependen del runtime elegido, del numero de pasos de muestreo (configurable por el usuario), del scheduler y de la precision numerica; ninguno de estos valores se documenta en el repositorio.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas publicas y no han sido verificados en la informacion proporcionada para este repositorio; se ofrecen como referencia orientativa de categoria.

| Modelo | Parametros del U-Net | Contexto de texto | Resolucion nativa | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Blackvapormax/stable-diffusion-1.5-onnx | No indicado (~860 M en la arquitectura original) | ~77 tokens (CLIP ViT-L/14) | 512x512 | ONNX | CreativeML OpenRAIL-M | Repositorio de terceros, 0 descargas |
| Stable Diffusion 1.5 (RunwayML) | No indicado (~860 M) | ~77 tokens (CLIP ViT-L/14) | 512x512 | safetensors, ckpt | CreativeML OpenRAIL-M | Pesos retirados por el autor original |
| Stable Diffusion 2.1 | No indicado (~865 M) | ~77 tokens (OpenCLIP ViT-H/14) | 768x768 (base) | safetensors | OpenRAIL-M | Disponible en Hugging Face |
| Stable Diffusion XL 1.0 | No indicado (~2.600 M) | Dos codificadores de texto, ~77 tokens cada uno | 1024x1024 | safetensors | CreativeML OpenRAIL++-M | Disponible en Hugging Face |

Frente a estos modelos, la diferencia principal de esta ficha no es de calidad sino de formato: ofrece los pesos de SD 1.5 en ONNX, lo que facilita despliegues sin PyTorch, mientras que las alternativas se distribuyen como safetensors para el ecosistema diffusers. SDXL ofrece mayor resolucion nativa y calidad, a cambio de un coste de memoria y computo bastante superior.

## Limitaciones y advertencias

- La propia model card reconoce que el modelo no alcanza un fotorrealismo perfecto.
- No renderiza texto legible en las imagenes, lo que lo inutiliza para generar carteles, logotipos o interfaces con tipografia.
- Falla en tareas de composicionalidad: la model card cita explicitamente el ejemplo de "un cubo rojo sobre una esfera azul" como caso problematico.
- Las caras y las figuras humanas pueden generarse de forma incorrecta o distorsionada.
- Esta entrenado principalmente con descripciones en ingles y su rendimiento en otros idiomas es deficiente.
- El autoencoder es con perdida, por lo que la reconstruccion nunca es exacta.
- El entrenamiento se realizo sobre LAION-5B, un dataset que contiene material para adultos y que, segun la model card, no es apto para uso en producto sin mecanismos de seguridad adicionales.
- No se aplicaron medidas de deduplicacion, por lo que existe cierto grado de memorizacion de imagenes repetidas en los datos de entrenamiento.
- La model card declara que el modelo esta pensado unicamente para fines de investigacion, lo que limita su uso comercial directo aunque la licencia OpenRAIL-M lo permita con restricciones.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso: prohibe generar contenido discriminatorio, acosador, desinformacion, violencia extrema, suplantacion de identidad o material que infrinja derechos de autor, entre otros supuestos.
- La model card prohibe explicitamente el uso del modelo para crear o difundir imagenes hostiles o alienantes, y recuerda que el modelo no fue entrenado para representar hechos o personas de forma veraz.
- Advertencia especifica sobre esta conversion: es un trabajo de terceros, no validado por RunwayML ni por CompVis, sin descargas ni evaluaciones publicas. Se desconoce si el export ONNX reproduce fielmente el comportamiento del checkpoint original, que componentes incluye y si admite todos los schedulers.
- Los pesos originales fueron retirados por su autor, por lo que la procedencia y la integridad del checkpoint subyacente no pueden verificarse a traves del repositorio oficial.
- En produccion conviene anadir filtros de contenido, tanto en la entrada (prompts) como en la salida (imagenes generadas), dado el origen del dataset de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Blackvapormax/stable-diffusion-1.5-onnx
- Blog de Stable Diffusion en Hugging Face: https://huggingface.co/blog/stable_diffusion
- Libreria diffusers: https://github.com/huggingface/diffusers
- Repositorio de RunwayML: https://github.com/runwayml/stable-diffusion
- Repositorio de CompVis: https://github.com/CompVis/stable-diffusion
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen: https://arxiv.org/abs/2205.11487
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/1910.09700 (no identificada en la informacion disponible)
- Dataset LAION-5B: https://laion.ai/blog/laion-5b/
- Texto de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Checkpoint Stable Diffusion 1.2 citado como punto de partida: https://huggingface.co/CompVis/stable-diffusion-v1-2
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante. Los resultados devueltos corresponden a articulos sobre contratacion publica en Polonia y no guardan relacion con el modelo.
