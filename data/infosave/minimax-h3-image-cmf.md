# infosave/MiniMax-H3-Image-cmf

## Resumen

MiniMax-H3-Image-cmf es una distribucion cuantizada del modelo de difusion MiniMax-H3-Image de MiniMaxAI, empaquetada en un unico fichero CMF de 24,6 GB para `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning. El modelo original resuelve generacion de imagen a partir de texto y edicion de imagenes en un rango de 4 a 16 megapixeles (hasta 4096 x 4096) con tan solo seis pasos de muestreo, lo que lo situa en la categoria de modelos de difusion de pocos pasos de alta resolucion. La distribucion esta mantenida por el usuario `infosave`, no por MiniMaxAI, y se publica bajo la licencia comunitaria del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa de despliegue sin Python que puede ejecutarse en GPUs de consumo mediante cuantizacion agresiva (4 bits para el transformer de difusion y el codificador de prompt, 8 bits para el VAE). Por otro, ilustra el ecosistema emergente de motores de inferencia nativos (Rust, CUDA y Vulkan) que compiten con las pilas habituales de PyTorch y Diffusers en escenarios de produccion con restricciones de memoria.

El repositorio tiene un unico fichero de pesos en formato CMF, sin descargas registradas en el momento de la consulta, y depende de la version 0.8.73 o superior de `cortiq`. Los idiomas declarados para el codificador de prompt son ingles, chino y ruso, aunque el autor recomienda prompts detallados en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion transformer) con codificador de prompt y VAE, empaquetado en formato CMF para el motor `cortiq` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion; el prompt se procesa mediante un codificador de texto) |
| Tipos de cuantizacion | q4tp: 4 bits para el transformer de difusion y el codificador de prompt, 8 bits para el VAE |
| Idiomas soportados | en, zh, ru |
| Licencia | minimax-h3-image-community-license-agreement (etiquetada como `other` en Hugging Face) |
| Formato de pesos | CMF (fichero unico de 24,6 GB); no se distribuyen safetensors ni GGUF en este repositorio |
| Resolucion de generacion | de 4 a 20 megapixeles; por defecto 2048 x 2048; dimensiones multiplos de 32 |
| Pasos de muestreo | 6 pasos |
| Guiado | sin guidance y sin negative prompt |
| Backends | CUDA (NVIDIA) y Vulkan (cualquier fabricante) |
| Motor requerido | `cortiq` 0.8.73 o superior, compilado con la feature `cuda` para el backend NVIDIA |
| Memoria de GPU | 16 GB sin limite; desde 4 GB con `CMF_GPU_VRAM_MB` |
| Memoria de sistema | aproximadamente 28 GB de RAM o page cache para el fichero |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un modelo de difusion para texto a imagen y edicion de imagenes, con un transformer de difusion y un codificador de prompt separados, mas un VAE para la decodificacion a pixeles. La distribucion cuantiza el transformer y el codificador a 4 bits y mantiene el VAE en 8 bits, lo que reduce el peso del fichero a 24,6 GB. No se especifican en la informacion proporcionada el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable no esta en el modelo en si, sino en el empaquetado y el motor de ejecucion: `cortiq` es un motor de inferencia en Rust que no enlaza CUDA en tiempo de compilacion (carga `libnvrtc.so.12` y `libcublas.so.12` en tiempo de ejecucion) y ofrece un backend Vulkan para GPUs de cualquier fabricante. El modelo genera en seis pasos, lo que implica un esquema de muestreo de pocos pasos, y permite limitar la memoria de GPU mediante la variable `CMF_GPU_VRAM_MB`, con un suelo documentado de 4 GB. La generacion a resoluciones inferiores a 4 megapixeles se realiza sobre un lienzo de 2048 x 2048 y se reescala, salvo que se desactive con `--min-area 1024`.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) en resoluciones de 4 a 20 megapixeles, con 2048 x 2048 por defecto y dimensiones multiplos de 32.
- Edicion de imagen (image-to-image e image-editing) mediante la referencia `<Picture 1>` en el prompt, que corresponde al fichero pasado con `--image`.
- Preservacion de texto y detalles en ediciones: el ejemplo del autor elimina unos auriculares y anade un choque de punos manteniendo todos los carteles y textos de las tazas.
- Generacion en seis pasos de muestreo, sin guidance ni negative prompt.
- Soporte multilingue del codificador de prompt en ingles, chino y ruso; el autor recomienda descripciones detalladas en ingles.
- Ejecucion en GPUs NVIDIA mediante CUDA y en GPUs de cualquier fabricante mediante Vulkan.
- Control del techo de memoria de GPU mediante `CMF_GPU_VRAM_MB`, con funcionamiento desde 4 GB.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision mas alla de la edicion de imagen.

## Casos de uso

- Generacion de ilustraciones editoriales a alta resolucion: el modelo produce imagenes de 4096 x 4096 (16 megapixeles) en 283,7 s en una RTX 2000 Ada, adecuado para portadas, posters y material impreso que requiere detalle fino sin reescalado posterior.
- Edicion de fotografia de producto: dado un prompt de edicion y una imagen de referencia, permite cambiar el color de un objeto (por ejemplo, repintar una bicicleta en azul pastel) en 42,8 s a 1024 x 1024, manteniendo el resto de la escena y los textos de los carteles.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: con un techo de 4 GB de VRAM y el backend CUDA, se puede generar una imagen de 2048 x 2048 en 60,2 s, lo que permite iterar en equipos con RTX 2000 Ada, RTX 3060 de 12 GB o similares.
- Despliegue en infraestructura heterogenea: el backend Vulkan permite ejecutar el mismo fichero CMF en GPUs AMD o Intel, util en entornos donde no hay CUDA disponible o se quiere evitar la dependencia de drivers NVIDIA.
- Pipelines de generacion por lotes en produccion: al ser un unico fichero de 24,6 GB y un motor sin Python, se simplifica el empaquetado en contenedores y la gestion de dependencias frente a pilas basadas en Diffusers y PyTorch.
- Edicion asistida de imagenes con requisitos de fidelidad textual: el ejemplo del autor conserva todos los carteles y textos de las tazas tras eliminar los auriculares y anadir un choque de punos, lo que lo hace util para retoque de escenas con rotulacion visible.
- Generacion de material grafico multilingue: el codificador admite prompts en ingles, chino y ruso, lo que facilita la produccion de imagenes para mercados de habla china y rusa con descripciones en el idioma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente proporciona mediciones de latencia y memoria en una NVIDIA RTX 2000 Ada de 16 GB, con semilla 42 y ejecuciones unicas (2048 x 2048 como mediana de tres):

| Ejecucion | Prompt (s) | Seis pasos (s) | Por paso (s) | Decodificacion (s) | Total (s) | Memoria pico (MiB) |
|---|---:|---:|---:|---:|---:|---:|
| CUDA, 1024 x 1024 (`--min-area 1024`) | 2,4 | 11,7 | 1,95 | 0,5 | 16,1 | 12 116 |
| CUDA, 2048 x 2048 | 2,6 | 44,3 | 7,38 | 1,7 | 50,3 | 12 654 |
| CUDA, 4096 x 4096 | 9,2 | 264,5 | 43,90 | 8,3 | 283,7 | 13 414 |
| CUDA, edicion 2048 x 2048 con imagen de 1024 x 1024 | 9,8 | 67,9 | 11,37 | 1,7 | 80,8 | 12 854 |

El autor tambien documenta una generacion de 2048 x 2048 en 60,2 s con un techo de 4 GB de VRAM, con la misma imagen resultante. No se publican datos de throughput agregado ni comparativas con otros modelos de difusion.

## Requisitos de hardware

- VRAM estimada: 16 GB de GPU sin limite; desde 4 GB configurando `CMF_GPU_VRAM_MB` (por ejemplo, 6000 para una tarjeta de 6 GB). El pico medido en la RTX 2000 Ada es de aproximadamente 12,1 a 13,4 GB segun resolucion.
- Memoria de sistema: aproximadamente 28 GB de RAM o page cache para cargar el fichero CMF de 24,6 GB.
- GPU recomendadas: NVIDIA RTX 2000 Ada (16 GB, referencia medida por el autor); cualquier GPU NVIDIA con CUDA 12.x y al menos 4 GB de VRAM mediante el backend CUDA; cualquier GPU con soporte Vulkan mediante el backend Vulkan.
- GPU de consumo: si, cabe en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super, RTX 2000 Ada) y, con el techo de memoria, en tarjetas de 6 a 8 GB, a costa de mas tiempo de generacion.
- Opciones de despliegue: `cortiq` 0.8.73 o superior, instalable con `cargo install cortiq-cli --features cuda`; los binarios precompilados de la release no incluyen el backend CUDA. Backend Vulkan disponible sin feature adicional.
- Latencia y throughput: 16,1 s para 1024 x 1024, 50,3 s para 2048 x 2048 y 283,7 s para 4096 x 4096 en RTX 2000 Ada con CUDA; 80,8 s para una edicion a 2048 x 2048 con imagen de 1024 x 1024. No se documenta throughput por lotes.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (por ejemplo, otros modelos de difusion de pocos pasos o de alta resolucion) que permitan una comparacion rigurosa. La siguiente tabla recoge unicamente los datos disponibles de este modelo frente al modelo base del que deriva:

| Modelo | Parametros | Contexto | Resolucion | Pasos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MiniMax-H3-Image-cmf (esta ficha) | no disponible | no aplica | 4-20 MP, 2048 x 2048 por defecto | 6 | minimax-h3-image-community-license-agreement | CMF (24,6 GB) | Hugging Face, motor `cortiq` |
| MiniMaxAI/MiniMax-H3-Image (base) | no disponible | no aplica | 4-16 MP segun el autor | 6 | minimax-h3-image-community-license-agreement | no disponible | Hugging Face |

No se dispone de informacion sobre alternativas de otros fabricantes con las que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia `minimax-h3-image-community-license-agreement` es una licencia comunitaria con terminos propios; es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones de explotacion comercial no se detallan en la informacion disponible.
- El modelo base no incluye el modelo de expansion de prompts que sus autores usan para convertir una peticion corta en una descripcion detallada; esta distribucion tampoco lo incluye, por lo que el usuario debe redactar prompts detallados en ingles.
- No hay guidance ni negative prompt, lo que limita el control fino sobre el resultado y puede dificultar la supresion de elementos no deseados.
- La generacion por debajo de 4 megapixeles se realiza sobre un lienzo de 2048 x 2048 y se reescala, lo que puede introducir artefactos de reescalado si no se usa `--min-area 1024`.
- El codificador de prompt solo declara ingles, chino y ruso; el rendimiento en otros idiomas no esta documentado y puede degradarse.
- Riesgo de alucinacion visual y de fidelidad en la edicion: no se documentan tasas de exito ni evaluaciones cuantitativas de preservacion de identidad, texto o estructura en ediciones.
- Dependencia de un motor concreto (`cortiq` 0.8.73 o superior) y de un formato propietario (CMF); no hay pesos en safetensors ni GGUF en este repositorio, lo que limita la portabilidad a otras pilas.
- El backend CUDA requiere `libnvrtc.so.12` y `libcublas.so.12` en el path del cargador y no esta incluido en los binarios precompilados; hay que compilar con la feature `cuda`.
- El repositorio no registra descargas y tiene un unico like en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- El autor de la distribucion es un tercero (`infosave`), no MiniMaxAI; la calidad de la cuantizacion q4tp no ha sido validada por el autor original del modelo.

## Enlaces

- Repositorio Hugging Face de esta distribucion: https://huggingface.co/infosave/MiniMax-H3-Image-cmf
- Modelo base en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio del motor CMF: https://github.com/infosave2007/cmf
- Guia del modelo en el repositorio del motor: https://github.com/infosave2007/cmf/blob/master/docs/MINIMAX_H3_IMAGE.md
- Ejemplos de prompts: https://huggingface.co/infosave/MiniMax-H3-Image-cmf/tree/main/examples/prompts
- Ejemplo de texto a imagen a 4096 x 4096: https://huggingface.co/infosave/MiniMax-H3-Image-cmf/resolve/main/examples/t2i_feast_4096.jpg
- Ejemplo de edicion (referencia): https://huggingface.co/infosave/MiniMax-H3-Image-cmf/resolve/main/examples/edit_minimax_reference.jpg
- Ejemplo de edicion (resultado): https://huggingface.co/infosave/MiniMax-H3-Image-cmf/resolve/main/examples/edit_minimax_result.jpg
