# CommuniDev/instruct-pix2pix-coreml

## Resumen

CommuniDev/instruct-pix2pix-coreml es una conversion de formato, no un modelo entrenado desde cero. CommuniDev LLC ha tomado el modelo InstructPix2Pix original de Tim Brooks, Aleksander Holynski y Alexei A. Efros (UC Berkeley) y lo ha convertido a Core ML con el conversor `torch2coreml` de Apple (`ml-stable-diffusion`, commit `ea2805dc`), sin reentrenamiento ni ajuste fino. El objetivo es que pueda ejecutarse en un iPhone dentro de la aplicacion iOS CommuniMuse, que lo descarga en el primer uso.

Se trata de un modelo de edicion de imagen guiada por instrucciones en lenguaje natural: recibe una fotografia y una orden escrita ("make it winter", "turn the car red") y devuelve una version editada de esa misma imagen a 512 x 512. La arquitectura subyacente es la de InstructPix2Pix, un modelo de difusion latente construido sobre Stable Diffusion v1.5 y entrenado especificamente para seguir instrucciones de edicion.

Su relevancia es practica: demuestra el flujo de conversion de un modelo de difusion de edicion a Core ML con cuantizacion de 6 bits y pesos palettizados, troceando el UNet en dos bloques para que quepa en la memoria de un telefono. El repositorio pesa 1,6 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (InstructPix2Pix sobre Stable Diffusion v1.5), UNet + VAE + codificador de texto CLIP |
| Parametros totales | no disponible (el repositorio solo publica pesos ya convertidos; los archivos suman aproximadamente 1,4 GB en cuantizacion de 6 bits) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el codificador de texto heredado de SD v1.5 trabaja con secuencias de 77 tokens) |
| Tipos de cuantizacion | UNet y codificador de texto en 6 bits palettizado; VAE encoder, VAE decoder y safety checker en fp16 |
| Idiomas soportados | no disponible; las instrucciones de edicion del modelo original estan en ingles |
| Licencia | MIT y CreativeML OpenRAIL-M (licencia dual, `license_name: mit-and-creativeml-openrail-m`) |
| Formato de pesos | Core ML compilado (`.mlmodelc`), organizado en `compiled/`; no se distribuyen safetensors ni GGUF |

Detalle de archivos del repositorio:

| Ruta | Tamano |
|---|---|
| `compiled/UnetChunk1.mlmodelc` | 319 MB |
| `compiled/UnetChunk2.mlmodelc` | 300 MB |
| `compiled/TextEncoder.mlmodelc` | 134 MB |
| `compiled/VAEEncoder.mlmodelc` | 65 MB |
| `compiled/VAEDecoder.mlmodelc` | 95 MB |
| `compiled/SafetyChecker.mlmodelc` | 580 MB |
| `compiled/vocab.json`, `compiled/merges.txt` | 1,3 MB |

## Arquitectura y entrenamiento

El modelo es un difusion latente de edicion de imagenes. Hereda de Stable Diffusion v1.5 un autoencoder variacional (VAE) que comprime la imagen a un espacio latente, un UNet que aplica el proceso de denoising y un codificador de texto CLIP que convierte la instruccion en embeddings. InstructPix2Pix anade a esa base un condicionamiento de imagen: el UNet recibe 8 canales de entrada en lugar de 4 (latentes de la imagen original concatenados con el ruido) y se entrena para transformar la imagen de entrada segun la instruccion de texto, en lugar de generar desde cero.

La innovacion clave del modelo original es su guiado sin clasificador de tres vias, que CommuniDev documenta explicitamente porque no encaja en el pipeline estandar `StableDiffusionPipeline`: se calculan embeddings de texto para `[prompt, negative, negative]`, latentes de imagen para `[image, image, zeros]` (usando la media del VAE sin escalar por 0,18215) y se combinan con la formula `noise = uncond + g_text·(text − image) + g_img·(image − uncond)`. Los valores por defecto son `g_text` 7,5 y `g_img` 1,5 con DPM-Solver++ a 20-25 pasos.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el dataset, el numero de tokens o las etapas de RLHF/DPO del modelo original, mas alla de que el articulo de referencia es `arXiv:2211.09800`. Lo unico documentado por el autor de esta conversion es que no hubo reentrenamiento: los pesos son identicos a los del checkpoint original, solo cambia el contenedor y la precision numerica.

## Capacidades

- Edicion de imagen guiada por texto: modifica una fotografia existente segun una instruccion escrita, manteniendo la estructura de la escena original.
- Edicion semantica de atributos: cambios de color, material, epoca del ano, clima, estilo visual y transformaciones de objetos.
- Image-to-image a resolucion fija de 512 x 512, con atencion `SPLIT_EINSUM_V2` adaptada al Neural Engine de Apple.
- Ejecucion local en dispositivo: los pesos estan empaquetados como Core ML compilado con compute units `CPU_AND_NE`, sin dependencia de servidores externos.
- Filtro de seguridad integrado: el repositorio incluye un `SafetyChecker` en fp16 que el autor indica que debe permanecer activo.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, audio ni vision mas alla de la propia edicion de imagen.
- Sin capacidades multilingues documentadas; el condicionamiento textual se hereda de CLIP, orientado a ingles.
- No es un modelo de generacion de texto ni de conversacion: su unica entrada textual son las instrucciones de edicion.

## Casos de uso

- Edicion fotografica en aplicaciones iOS: la app CommuniMuse lo descarga en el primer arranque y permite al usuario aplicar instrucciones como "make it winter" o "turn the car red" directamente sobre la foto, sin subirla a ningun servidor.
- Edicion con privacidad por diseno: al ejecutarse en el Neural Engine del telefono con compute units `CPU_AND_NE`, las imagenes del usuario no salen del dispositivo, lo que resulta adecuado para fotos personales o entornos con requisitos de privacidad.
- Prototipado de funciones de edicion para producto movil: un equipo puede validar la experiencia de usuario de un editor por instrucciones antes de invertir en infraestructura de servidor, reutilizando esta conversion Core ML ya troceada.
- Retoque creativo iterativo: el usuario repite la edicion cambiando la semilla cuando el resultado no le convence, un flujo documentado por el propio autor para los casos en que los retratos se distorsionan.
- Transformaciones estacionales y atmosfericas sobre paisajes: aplicar cambios de estacion o clima a fotografias de exterior, con la salvedad de que las escenas nocturnas responden de forma mas debil.
- Generacion de variantes visuales para ilustracion y contenidos: producir versiones alternativas de una misma imagen base (paleta, epoca, estilo) para seleccionar despues en un editor grafico.
- Integracion en flujos de demostracion y docencia: al ser un paquete Core ML autocontenido con hashes SHA-256 verificables (`shasum -a 256 -c SHA256SUMS`), sirve para ensenar como se convierte y despliega un modelo de difusion en hardware Apple.
- Pipeline de recorte y ajuste cuadrado: el propio autor describe como la app encaja la foto en un cuadrado de 512 x 512 y recorta el resultado, patron reutilizable para cualquier integracion que parta de imagenes de aspect ratio arbitrario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, LPIPS ni similares) ni comparaciones numericas con otros modelos, y tampoco se han encontrado datos de rendimiento en la busqueda web realizada.

## Requisitos de hardware

- Plataforma objetivo: iPhone con Neural Engine, dado que la conversion usa atencion `SPLIT_EINSUM_V2` y compute units `CPU_AND_NE`. La model card no especifica generaciones concretas de dispositivo ni minimos de RAM.
- Memoria: el UNet esta dividido en dos trozos (`UnetChunk1` de 319 MB y `UnetChunk2` de 300 MB) precisamente para que quepa en la memoria de un iPhone. El repositorio completo ocupa 1,6 GB, aunque no todos los archivos se cargan simultaneamente en memoria.
- Cuantizacion: los pesos de 6 bits palettizados del UNet y del codificador de texto reducen el peso a costa de una posible perdida de calidad frente al checkpoint original en fp16.
- VRAM estimada para inferencia en GPU de escritorio: no disponible. No se documentan ejecuciones en CUDA ni en otros backends.
- GPU recomendadas: no disponible; el modelo no esta pensado para A100, H100 ni RTX 4090, sino para el Neural Engine de Apple.
- Cabe en GPU de consumo: no aplica al formato distribuido, que es Core ML. Para ejecutar el modelo original en una GPU de consumo habria que usar el checkpoint de `timbrooks/instruct-pix2pix` en PyTorch.
- Opciones de despliegue: Core ML en iOS mediante el pipeline de Apple (`ml-stable-diffusion`). vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de lenguaje y los pesos no estan en GGUF ni safetensors.
- Latencia y throughput: no disponible. La configuracion por defecto indicada es DPM-Solver++ con 20-25 pasos, pero no se publican tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CommuniDev/instruct-pix2pix-coreml | no disponible; ~1,4 GB en 6 bits | 512 x 512, instrucciones en ingles | no disponible | MIT + CreativeML OpenRAIL-M | Core ML (`.mlmodelc`) en HuggingFace |
| timbrooks/instruct-pix2pix (original) | no disponible en la informacion proporcionada | 512 x 512 | no disponible | MIT + CreativeML OpenRAIL-M | Pesos PyTorch/diffusers en HuggingFace |
| Alternativas de edicion por instrucciones de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con datos verificables es la del propio repositorio frente a su modelo base: pesos identicos, misma licencia dual, mismo tamano de salida, pero distinto contenedor (Core ML compilado frente a PyTorch) y distinta precision (6 bits palettizado frente a fp16/fp32). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por CommuniDev: es una conversion de formato. Cualquier limitacion de calidad proviene del InstructPix2Pix original.
- Resolucion fija de 512 x 512. La app del autor encaja la foto en un cuadrado y recorta despues, de modo que se pierde parte del encuadre original.
- Algunas instrucciones funcionan de forma debil; el autor cita explicitamente los cambios de clima y estacion sobre escenas nocturnas.
- Los retratos pueden distorsionar caras de forma ocasional; reintentar con otra semilla suele corregirlo.
- Riesgo de resultados no deseados o poco fieles a la instruccion: es un modelo generativo y no garantiza que el resultado respete la identidad de la persona o el contenido original.
- El safety checker debe permanecer activo; desactivarlo no esta contemplado en la documentacion del repositorio.
- Licencia dual con restricciones de uso. Ademas de MIT, aplica CreativeML OpenRAIL-M, que prohibe usos como infringir la ley, explotar o danar a menores, generar informacion verificablemente falsa para perjudicar a terceros, difamar o acosar, y discriminar. La lista completa esta en el Anexo A de la licencia incluida en `LICENSE.md`.
- Para uso comercial hay que cumplir ambas licencias; la parte OpenRAIL-M impone restricciones basadas en el uso, no solo de atribucion.
- Idiomas: no hay soporte multilingue documentado; el condicionamiento de texto proviene de un codificador CLIP de SD v1.5 orientado a ingles, por lo que las instrucciones en castellano pueden degradar el resultado.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible, heredando los del dataset de entrenamiento de Stable Diffusion v1.5.
- Integridad del paquete: conviene verificar `SHA256SUMS` antes de desplegar, ya que el repositorio distribuye archivos binarios compilados.
- Fecha de creacion y actualizacion del repositorio: 6 de octubre de 2026, con 0 descargas y 0 likes registrados en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CommuniDev/instruct-pix2pix-coreml
- Modelo base: https://huggingface.co/timbrooks/instruct-pix2pix
- Articulo de InstructPix2Pix: https://arxiv.org/abs/2211.09800
- Repositorio del conversor de Apple: https://github.com/apple/ml-stable-diffusion
- Aplicacion del autor: https://communidev.com
- Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los resultados obtenidos corresponden a fichas tecnicas de carretillas elevadoras y no guardan relacion con el contenido de esta ficha.
