# ddutchie/archwiz-upscalers

## Resumen

ArchWiz Upscalers es una coleccion de conversiones a Core ML de modelos abiertos de superresolucion y restauracion de imagen, publicada por el usuario ddutchie para su uso on-device en la aplicacion iOS ArchWiz. No es un modelo entrenado por el autor: cada archivo se convierte a partir de los pesos publicados por sus autores originales y, segun la model card, no se reentrena ni se ajusta ningun parametro. El repositorio se creo y se actualizo el 27 de septiembre de 2026, ocupa 0,5 GB y acumula 0 descargas y 0 likes en el momento de la consulta.

El paquete contiene nueve modelos image-to-image en formato `.mlpackage` (comprimidos en `.zip`): seis de superresolucion 4x (Real-ESRGAN x4plus, Real-ESRGAN x4plus anime 6B, A-ESRGAN Single, BSRGAN, MM-RealSR GAN y MM-RealSR Net, mas 4xNomos8kSC) y dos de restauracion a escala 1x (1xDeNoise_realplksr_otf y 1xDeJPG_realplksr_otf). Los tamanos van de 8 MB (anime 6B) a 49 MB (MM-RealSR), lo que permite empaquetar todos los pesos en aplicaciones moviles.

Su relevancia es practica: cubre el hueco entre los pesos PyTorch de investigacion y el despliegue real en el ecosistema Apple, con pesos fp16, tiles de entrada de 256 o 512 px y cosido por solapamiento responsabilidad del integrador. La licencia es mixta, heredada modelo a modelo (BSD-3-Clause, Apache-2.0 y CC-BY-4.0), y la informacion disponible no incluye numero de parametros, arquitectura detallada ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de superresolucion ciega (blind super-resolution) para image-to-image; variantes GAN y orientada a PSNR; A-ESRGAN emplea discriminadores U-Net con atencion (segun titulo del paper). Detalle de capas: no disponible |
| Parametros totales | no disponible (la model card solo publica el tamano del archivo, de 8 MB a 49 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija por tile de 256 o 512 px) |
| Tipos de cuantizacion | fp16 en pesos y computo; no se publican variantes int8/int4 |
| Idiomas soportados | no disponible / no aplica (modelos de imagen, no procesan texto) |
| Licencia | mixta: BSD-3-Clause (Real-ESRGAN x4plus, x4plus anime 6B, A-ESRGAN, MM-RealSR GAN y Net), Apache-2.0 (BSRGAN), CC-BY-4.0 (4xNomos8kSC, 1xDeNoise_realplksr_otf, 1xDeJPG_realplksr_otf) |
| Formato de pesos | Core ML ML Program (`.mlpackage` dentro de un `.zip`, junto con `LICENSE.txt` y `ATTRIBUTION.txt`) |
| Tarea (pipeline) | image-to-image |
| Escalas | 4x (siete modelos) y 1x (dos modelos de limpieza) |
| Tamano de tile | 512 px (Real-ESRGAN, A-ESRGAN, BSRGAN, 4xNomos8kSC, 1xDeNoise, 1xDeJPG) y 256 px (MM-RealSR GAN y Net) |
| Entrada / salida | `input`: imagen RGB en tile cuadrado fijo; `output`: imagen RGB de tile x escala |
| Plataforma | iOS 16 / macOS 13 o posterior |
| Tamano del repositorio | 0,5 GB |
| Herramientas de conversion | spandrel y coremltools |

Inventario de archivos del repositorio:

| Archivo | Modelo original | Escala | Tile | Tamano | Licencia |
|---|---|---|---|---|---|
| `RealESRGAN_x4plus.mlpackage.zip` | Real-ESRGAN x4plus | 4x | 512 px | 31 MB | BSD-3-Clause |
| `RealESRGAN_x4plus_anime_6B.mlpackage.zip` | Real-ESRGAN x4plus anime 6B | 4x | 512 px | 8 MB | BSD-3-Clause |
| `A-ESRGAN_Single.mlpackage.zip` | A-ESRGAN (discriminador single-scale, pesos EMA) | 4x | 512 px | 31 MB | BSD-3-Clause |
| `BSRGAN.mlpackage.zip` | BSRGAN | 4x | 512 px | 31 MB | Apache-2.0 |
| `MMRealSRGAN.mlpackage.zip` | MM-RealSR GAN | 4x | 256 px | 49 MB | BSD-3-Clause |
| `MMRealSRNet.mlpackage.zip` | MM-RealSR Net (orientado a PSNR) | 4x | 256 px | 49 MB | BSD-3-Clause |
| `4xNomos8kSC.mlpackage.zip` | 4xNomos8kSC | 4x | 512 px | 31 MB | CC-BY-4.0 |
| `1xDeNoise_realplksr_otf.mlpackage.zip` | 1xDeNoise_realplksr_otf | 1x | 512 px | 14 MB | CC-BY-4.0 |
| `1xDeJPG_realplksr_otf.mlpackage.zip` | 1xDeJPG_realplksr_otf | 1x | 512 px | 14 MB | CC-BY-4.0 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa redes de superresolucion de imagen entrenadas por terceros y las convierte a Core ML. Por los titulos de los papers citados, todas ellas abordan la superresolucion ciega en mundo real: Real-ESRGAN se entrena con datos puramente sinteticos para modelar degradaciones reales (arXiv:2107.10833); BSRGAN propone un modelo de degradacion practico para superresolucion ciega profunda (arXiv:2103.14006); A-ESRGAN introduce discriminadores U-Net con atencion (arXiv:2112.10046); y MM-RealSR aplica modulacion interactiva basada en metric learning (arXiv:2205.05065). Las variantes MM-RealSR GAN y Net se diferencian por su orientacion perceptual o de fidelidad PSNR, y A-ESRGAN Single usa los pesos EMA del discriminador de escala unica.

No se publica en la informacion disponible el numero de tokens, la composicion del dataset, el volumen de datos de entrenamiento ni si hubo fases de RLHF o DPO; tampoco el numero de parametros de cada red. La unica innovacion tecnica documentada en esta ficha es la del pipeline de conversion: los pesos se exportan desde PyTorch con spandrel y coremltools a un ML Program en fp16, sin modificar los pesos, y cada conversion se verifica contra el original en PyTorch sobre un tile aleatorio antes de publicarse. El procesamiento de imagenes grandes se hace por tiles solapados, y el cosido (stitching) corre a cargo de la aplicacion que integra el modelo.

## Capacidades

- Superresolucion 4x de imagenes RGB: siete modelos con factor de escala 4x, con dos tamanos de tile (256 y 512 px).
- Restauracion ciega de imagenes degradadas: los modelos estan entrenados para degradaciones reales (ruido, desenfoque, compresion), no solo para downsampling bicubico.
- Eliminacion de ruido a resolucion nativa (1x): `1xDeNoise_realplksr_otf`, sin cambio de escala.
- Eliminacion de artefactos de compresion JPEG (1x): `1xDeJPG_realplksr_otf`, pensado para imagenes con compresion con perdida.
- Especializacion por dominio: variante especifica para ilustracion y anime (`RealESRGAN_x4plus_anime_6B`, 8 MB) y variante fotografica general (`RealESRGAN_x4plus`).
- Eleccion entre fidelidad y perceptual: MM-RealSR Net (orientado a PSNR) frente a MM-RealSR GAN (orientado a resultados perceptuales).
- Inferencia on-device en Apple: Core ML ML Program con computo fp16, sin necesidad de conexion a red ni de servicio externo.
- Procesamiento por tiles con solapamiento, lo que permite escalar imagenes mayores que el tile fijo del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto ni capacidades multilingues: no es un modelo de lenguaje ni un modelo vision-language.

## Casos de uso

- Restauracion de fotos en una app iOS sin conexion: `RealESRGAN_x4plus` permite ampliar 4x una fotografia directamente en el dispositivo, con lo que la imagen nunca sale del terminal y no hay coste de inferencia en servidor. Es adecuado porque el peso es de 31 MB y la entrada esta acotada a tiles de 512 px.
- Escalado de ilustracion, manga y capturas de videojuegos: `RealESRGAN_x4plus_anime_6B` (8 MB) esta especializado en ese dominio y es el modelo mas ligero del paquete, lo que reduce el tamano de descarga de la app y el uso de memoria.
- Recuperacion de fotos antiguas o muy comprimidas: combinacion de `1xDeJPG_realplksr_otf` (elimina artefactos de bloque y ringing del JPEG) seguida de `4xNomos8kSC` o `BSRGAN` para ampliar; el pipeline se ejecuta en dos pasadas 1x + 4x sobre los mismos tiles.
- Limpieza de imagenes ruidosas antes de un OCR o de un pipeline de vision por computador: `1xDeNoise_realplksr_otf` reduce ruido manteniendo la resolucion, lo que evita que el escalado introduzca texturas falsas que degraden la deteccion posterior.
- Aumento de resolucion de datasets de entrenamiento: usar `BSRGAN` o `4xNomos8kSC` para generar versiones de alta resolucion de un dataset de imagenes pequenas antes de entrenar detectores o segmentadores; la licencia Apache-2.0 de BSRGAN facilita su uso en entornos corporativos frente a las variantes CC-BY-4.0.
- Previsualizacion y edicion fotografica en macOS: al ser un ML Program con soporte desde macOS 13, el modelo puede integrarse en una app de escritorio que reescale la seleccion del usuario bajo demanda, tile a tile.
- Impresion de gran formato a partir de originales de baja resolucion: `RealESRGAN_x4plus` o `4xNomos8kSC` multiplican por cuatro cada dimension (16x en area), suficiente para preparar un archivo de salida antes de la impresion; la eleccion entre ambos depende de si se prioriza naturalidad fotografica o detalle sintetico.
- Restauracion de fotogramas en pipelines de video: al procesar por tiles, se puede aplicar `1xDeNoise_realplksr_otf` fotograma a fotograma o `MMRealSRGAN`/`MMRealSRNet` con tile de 256 px cuando la latencia por fotograma es critica.
- Eleccion de modelo guiada por licencia en producto comercial: `BSRGAN` (Apache-2.0) permite redistribucion bajo una licencia permisiva con requisitos de aviso, mientras que los modelos CC-BY-4.0 exigen atribucion explicita al autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye PSNR, SSIM, LPIPS ni comparaciones numericas con otros modelos, y la unica verificacion descrita es cualitativa: cada conversion Core ML se comprueba contra el original en PyTorch sobre un tile aleatorio antes de publicarse. La busqueda web realizada no ha devuelto resultados relevantes para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de huella en disco, los pesos van de 8 MB (`RealESRGAN_x4plus_anime_6B`) a 49 MB (`MMRealSRGAN` y `MMRealSRNet`), y el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: no aplica en el sentido habitual. Los artefactos son Core ML, por lo que se ejecutan sobre Neural Engine, GPU integrada o CPU de Apple (iPhone, iPad, Mac con Apple Silicon o Intel compatible), con iOS 16 o macOS 13 como minimo.
- GPU NVIDIA: no hay builds CUDA, ROCm ni ONNX publicados en este repositorio, por lo que no se pueden ejecutar directamente en RTX 4090, A100 o H100; para ello habria que recuperar los pesos PyTorch originales de cada proyecto upstream y convertirlos.
- Cabe en hardware consumer: si, en el sentido de que el destino son dispositivos Apple moviles y de escritorio; el factor limitante no es el peso del modelo sino la memoria necesaria para la imagen completa durante el cosido por tiles.
- Opciones de despliegue: Core ML dentro de apps iOS/iPadOS/macOS (libreria `coreml`), con conversion reproducible mediante spandrel y coremltools. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del tile (256 px en MM-RealSR, 512 px en el resto), del acelerador elegido por Core ML y del solapamiento configurado por el integrador.

## Comparativa con modelos similares

Comparativa interna del paquete, con los datos publicados en la model card:

| Modelo | Escala | Tile | Tamano | Licencia | Orientacion |
|---|---|---|---|---|---|
| Real-ESRGAN x4plus | 4x | 512 px | 31 MB | BSD-3-Clause | Fotografia general, datos sinteticos |
| Real-ESRGAN x4plus anime 6B | 4x | 512 px | 8 MB | BSD-3-Clause | Ilustracion y anime |
| A-ESRGAN Single | 4x | 512 px | 31 MB | BSD-3-Clause | Discriminador U-Net con atencion, pesos EMA |
| BSRGAN | 4x | 512 px | 31 MB | Apache-2.0 | Degradacion practica, licencia permisiva |
| MM-RealSR GAN | 4x | 256 px | 49 MB | BSD-3-Clause | Perceptual (GAN) |
| MM-RealSR Net | 4x | 256 px | 49 MB | BSD-3-Clause | Fidelidad (PSNR) |
| 4xNomos8kSC | 4x | 512 px | 31 MB | CC-BY-4.0 | Superresolucion 4x de Phips |
| 1xDeNoise_realplksr_otf | 1x | 512 px | 14 MB | CC-BY-4.0 | Eliminacion de ruido |
| 1xDeJPG_realplksr_otf | 1x | 512 px | 14 MB | CC-BY-4.0 | Eliminacion de artefactos JPEG |

Alternativas externas de la misma categoria (por ejemplo las versiones PyTorch originales de estos mismos modelos, u otros upscalers del ecosistema como SwinIR o waifu2x): especificaciones, rendimiento y disponibilidad no disponibles en la informacion proporcionada. La diferencia funcional relevante frente a esos originales es el formato: este repositorio ofrece ML Program fp16 listo para Core ML, mientras que los proyectos upstream publican pesos PyTorch.

## Limitaciones y advertencias

- No es un modelo unico ni entrenado por el autor: son conversiones de pesos de terceros. Cualquier problema de calidad, sesgo o licencia procede de los modelos originales, no del repositorio de conversiones.
- Licencia mixta con obligaciones de atribucion: BSD-3-Clause y Apache-2.0 exigen conservar los avisos de copyright y licencia, y CC-BY-4.0 (`4xNomos8kSC`, `1xDeNoise_realplksr_otf`, `1xDeJPG_realplksr_otf`) exige atribucion explicita al autor. Las licencias estan en la carpeta `LICENSES` del repositorio y cada `.zip` incluye `LICENSE.txt` y `ATTRIBUTION.txt`; hay que conservarlos en cualquier redistribucion. Esto no constituye asesoramiento juridico.
- Riesgo de alucinacion visual: los modelos generativos de superresolucion pueden inventar texturas, detalles y patrones que no existian en la imagen original, especialmente en caras, texto y microdetalles. No deben usarse como prueba forense ni para reconstruir contenido de valor probatorio.
- Ausencia de metricas publicadas: sin PSNR, SSIM ni LPIPS en la model card, la seleccion entre los nueve modelos solo puede basarse en pruebas propias.
- Sin validacion de la comunidad: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia (27 de septiembre de 2026), lo que implica ausencia de retroalimentacion externa.
- Dependencia de plataforma: los artefactos solo se ejecutan en Core ML (iOS 16 / macOS 13 o posterior). No hay versiones ONNX, TensorRT ni CUDA, lo que limita el despliegue en servidores Linux con GPU NVIDIA.
- Entrada restringida: la entrada debe ser un tile cuadrado fijo de 256 o 512 px. Imagenes mayores requieren troceado con solapamiento y cosido por parte del integrador, lo que puede producir costuras visibles o diferencias de tono en las uniones si el solapamiento es insuficiente.
- Informacion de entrenamiento no disponible: se desconoce la composicion de los datasets, el numero de parametros, el volumen de datos y si hubo ajuste con preferencias humanas, por lo que no se puede evaluar el sesgo demografico ni el comportamiento fuera de dominio.
- Escala fija: los modelos 4x no permiten factores intermedios sin un reescalado adicional; los modelos 1x no aumentan resolucion.
- Conversiones no revalidadas externamente: la unica garantia de equivalencia es la comprobacion del autor sobre un tile aleatorio antes de publicar, segun la model card.

## Enlaces

- HuggingFace: https://huggingface.co/ddutchie/archwiz-upscalers
- Carpeta de licencias: https://huggingface.co/ddutchie/archwiz-upscalers/tree/main/LICENSES
- Real-ESRGAN (repositorio): https://github.com/xinntao/Real-ESRGAN
- Real-ESRGAN (paper): https://arxiv.org/abs/2107.10833
- Pesos originales Real-ESRGAN x4plus: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
- Pesos originales Real-ESRGAN x4plus anime 6B: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth
- A-ESRGAN (repositorio): https://github.com/stroking-fishes-ml-corp/A-ESRGAN
- A-ESRGAN (paper): https://arxiv.org/abs/2112.10046
- Pesos originales A-ESRGAN Single: https://github.com/stroking-fishes-ml-corp/A-ESRGAN/releases/download/v1.0.0/A_ESRGAN_Single.pth
- BSRGAN (repositorio): https://github.com/cszn/BSRGAN
- BSRGAN (paper): https://arxiv.org/abs/2103.14006
- Pesos originales BSRGAN (release KAIR v1.0): https://github.com/cszn/KAIR/releases/download/v1.0/BSRGAN.pth
- MM-RealSR (repositorio): https://github.com/TencentARC/MM-RealSR
- MM-RealSR (paper): https://arxiv.org/abs/2205.05065
- 4xNomos8kSC: https://huggingface.co/Phips/4xNomos8kSC
- 1xDeNoise_realplksr_otf: https://huggingface.co/Phips/1xDeNoise_realplksr_otf
- 1xDeJPG_realplksr_otf: https://huggingface.co/Phips/1xDeJPG_realplksr_otf
- spandrel (conversion desde PyTorch): https://github.com/chaiNNer-org/spandrel
- coremltools: https://github.com/apple/coremltools
