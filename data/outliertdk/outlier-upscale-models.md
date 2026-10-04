# OutlierTDK/outlier-upscale-models

## Resumen

Outlier Upscale Models es un repositorio de pesos convertidos del modelo Real-ESRGAN, publicado por OutlierTDK (Truong Dang Khoa, Outlier Code), para su uso directo en el navegador mediante TensorFlow.js. No es un modelo entrenado por el autor, sino una conversión de los checkpoints oficiales de Real-ESRGAN a un formato binario propio (float16 little-endian sin cabecera) que la herramienta web Outlier Upscale Method consume en su modo "High quality" (un escalador de imagen 2K/4K que funciona integramente en el cliente).

El repositorio contiene dos variantes: `realesrgan-x4plus` (arquitectura RRDBNet con 23 bloques residuales, factor de escala x4, 33,4 MB) y `realesrgan-x4plus-anime` (RRDBNet con 6 bloques, x4, 8,9 MB). El primer archivo esta dividido en dos partes (`part1.bin` + `part2.bin`) unicamente para superar el limite de 25 MiB por archivo de algunos hostings; la aplicacion descarga ambas y las une byte a byte.

La relevancia de esta ficha es acotada: se trata de artefactos de despliegue, no de un modelo de lenguaje. Su interes esta en que demuestra un flujo de conversion de un modelo de super-resolucion de PyTorch a TensorFlow.js listo para navegador, sin reentrenamiento ni modificacion de los pesos, con licencia BSD 3-Clause heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Residual in Residual Dense Block Network) |
| Parametros totales | no disponible en el model card; estimado ~16,7 M para x4plus y ~4,5 M para anime6b a partir del tamano en fp16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | float16 little-endian (formato ya convertido); no se documentan otras |
| Idiomas soportados | no aplica (modelo de imagen); el model card no declara idiomas |
| Licencia | BSD 3-Clause |
| Formato de pesos | binario propietario float16 little-endian sin cabecera, pensado para TensorFlow.js; convoluciones en orden (`conv_first`, `body.i.rdbN.convM`, `conv_body`, `conv_up1`, `conv_up2`, `conv_hr`, `conv_last`), cada una como filtro `[kh, kw, in, out]` seguida de su bias |

Archivos del repositorio:

| Archivo | Checkpoint origen | Arquitectura | Tamano |
|---|---|---|---|
| `realesrgan-x4plus.v1.part1.bin` + `realesrgan-x4plus.v1.part2.bin` | RealESRGAN_x4plus | RRDBNet, 23 bloques, x4 | 33,4 MB |
| `realesrgan-x4plus-anime6b.v1.bin` | RealESRGAN_x4plus_anime_6B | RRDBNet, 6 bloques, x4 | 8,9 MB |

## Arquitectura y entrenamiento

El modelo subyacente es Real-ESRGAN, propuesto por Xintao Wang, Liangbin Xie, Chao Dong e Ying Shan (ICCV Workshops 2021). La arquitectura es RRDBNet, una red generativa basada en bloques residuales y densos (Residual in Residual Dense Blocks) con ampliacion por convolucion subpixel (PixelShuffle). La variante `x4plus` usa 23 bloques RRDB y la variante `anime_6B` usa 6 bloques, lo que la hace notablemente mas ligera y adecuada para dominios de ilustracion y anime.

Real-ESRGAN se entreno como modelo de super-resolucion ciega del mundo real ("real-world blind super-resolution") utilizando datos sinteticos puros generados con un pipeline de degradacion de segundo orden (desenfoque, ruido, compresion JPEG/WebP, etc.), lo que le permite restaurar imagenes degradadas sin conocer el tipo exacto de degradacion. El entrenamiento original no forma parte de esta publicacion.

La contribucion de este repositorio no es de entrenamiento sino de empaquetado: los pesos oficiales se convierten con el script `tools/convert_models.py` del repositorio GitHub de la herramienta web, directamente desde los checkpoints publicados en `github.com/xinntao/Real-ESRGAN/releases`. Los pesos no se han modificado ni reentrenado.

## Capacidades

- Super-resolucion de imagen con factor de escala x4 (upscaling de 4 aumentos lineales).
- Restauracion de imagenes degradadas del mundo real (ruido, desenfoque, artefactos de compresion) gracias al entrenamiento con degradaciones sinteticas.
- Variante especializada en anime e ilustracion (`anime_6B`) con menor huella y sesgo orientado a trazos y colores planos.
- Inferencia en el navegador mediante TensorFlow.js, sin necesidad de servidor ni subida de imagenes.
- Entrada y salida orientadas al pipeline `image-to-image`.
- Escalado a resoluciones de 2K y 4K segun la descripcion de la herramienta Outlier Upscale Method.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Mejora de fotografias en aplicaciones web: el modelo se ejecuta en el navegador del usuario, de modo que la imagen nunca sale del dispositivo; el modo "High quality" aplica el checkpoint `x4plus` para llevar fotos de baja resolucion a 2K/4K sin coste de servidor.
- Restauracion de fotos antiguas o de baja calidad: el entrenamiento de Real-ESRGAN con degradaciones sinteticas permite recomponer detalle y reducir ruido y artefactos de compresion en escaneos y fotografias deterioradas.
- Escalado de ilustracion y anime: la variante `anime6b`, con solo 8,9 MB, esta afinada para trazos limpios y planos de color, y resulta adecuada para portadas, avatares y arte grafico con menor coste computacional que `x4plus`.
- Preparacion de imagenes para impresion: al multiplicar por cuatro la resolucion de entrada, permite obtener archivos con suficiente densidad de pixeles para impresion en tamano grande partiendo de originales modestos.
- Catalogos de comercio electronico: normalizar y mejorar imagenes de producto heterogeneas (distintas camaras, iluminaciones y compresiones) antes de publicarlas en una ficha de tienda.
- Herramientas de edicion integradas en el navegador: al correr sobre TensorFlow.js, se puede integrar el upscaling en editores web o extensiones sin backend, manteniendo la privacidad del contenido.
- Generacion de recursos para videojuegos o prototipos: ampliar texturas e ilustraciones rapidamente a partir de material de baja resolucion para prototipado.
- Preprocesado en pipelines de vision por computador: aumentar la resolucion de imagenes de entrada antes de tareas posteriores (deteccion, segmentacion) cuando se parte de fuentes de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye metricas (PSNR, SSIM, LPIPS) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Almacenamiento de pesos: 33,4 MB para `x4plus` (dividido en dos archivos) y 8,9 MB para `anime6b` en float16.
- Inferencia en cliente: disenado para ejecutarse en el navegador mediante TensorFlow.js, apoyandose en WebGL (GPU del usuario) o en CPU como respaldo.
- VRAM o memoria de GPU: no disponible de forma explicita. El consumo de memoria de activaciones depende fuertemente de la resolucion de entrada y de si la inferencia se hace por teselas; con entradas pequenas cabe en cualquier GPU integrada, mientras que objetivos de 2K/4K requieren mas memoria y suelen exigir procesado por parches.
- GPU recomendadas: no disponible en la documentacion. Al ser un modelo de vision ligero (~16,7 M de parametros estimados en la variante grande), no requiere aceleradores de datacenter (A100, H100); es funcional en GPU de consumo e integradas.
- Caber en GPU de consumo: si, en la practica cualquier GPU moderna con WebGL 2.0 puede ejecutarlo, si bien el tiempo por imagen crece con la resolucion de salida.
- Opciones de despliegue: la via prevista es TensorFlow.js en navegador; al derivar de checkpoints PyTorch de Real-ESRGAN, los pesos originales pueden usarse con BasicSR o con implementaciones ONNX/NCNN, aunque el formato binario publicado aqui es especifico de TensorFlow.js.
- Latencia y throughput: no disponibles. Dependen del hardware del cliente, del backend (WebGL/CPU) y del tamano de la imagen.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Escala | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier Upscale Models (este repo) | RRDBNet (23 y 6 bloques) | ~16,7 M (x4plus) / ~4,5 M (anime6b) estimado | x4 | BSD 3-Clause | Pesos float16 para TensorFlow.js |
| Real-ESRGAN oficial (xinntao) | RRDBNet | ~16,7 M (x4plus) | x4 (y x2) | BSD 3-Clause | Pesos PyTorch `.pth` |
| Real-ESRGAN anime6B oficial | RRDBNet 6 bloques | ~4,5 M estimado | x4 | BSD 3-Clause | Pesos PyTorch `.pth` |
| Otras alternativas de super-resolucion (SwinIR, ESRGAN clasico, GFPGAN) | Transformer / GAN | no disponible | x2/x4 | variable | no disponible |

Nota: los datos de paramtros de las variantes oficiales son estimaciones derivadas del tamano en float16 y de la arquitectura declarada; el model card no los especifica. No se dispone de comparaciones de rendimiento (PSNR/SSIM) entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es una conversion de checkpoints oficiales de Real-ESRGAN; los meritos y limitaciones del modelo subyacente se heredan integramente.
- Riesgo de alucinacion visual: como modelo generativo de super-resolucion, puede inventar texturas o detalles plausibles pero inexistentes, especialmente en zonas muy degradadas o en caras y texto pequeno.
- Factor de escala fijo x4: no se documentan variantes x2 ni interpolacion a escalas arbitrarias dentro de este repositorio.
- Formato propietario: los archivos `.bin` no son directamente compatibles con PyTorch, ONNX ni con cargadores genericos; requieren el codigo de carga de la herramienta Outlier Upscale Method.
- Sin datos de contexto ni idioma: no es aplicable a tareas de texto, razonamiento, codigo ni agentes, pese a que la ficha de HuggingFace use `image-to-image` como pipeline.
- Sin benchmarks publicados: no hay metricas objetivas en el model card que permitan validar la calidad del upscaling frente a otras alternativas.
- Adopcion practica nula: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso publico.
- Restricciones de licencia: BSD 3-Clause permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la clausula de no respaldo. Debe mantenerse la atribucion a Xintao Wang y al proyecto Real-ESRGAN.
- Coste de inferencia en cliente: el tiempo y la memoria dependen del hardware del usuario; imagenes grandes pueden provocar bloqueos o agotar la memoria del navegador si no se trocean en parches.
- El repositorio ocupa 0,0 GB segun HuggingFace, coherente con el tamano real de los pesos (~42 MB en total); no incluye codigo de inferencia, solo los binarios.

## Enlaces

- HuggingFace: https://huggingface.co/OutlierTDK/outlier-upscale-models
- Checkpoints oficiales de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN/releases
- Repositorio del modelo original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper: Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan, "Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data", ICCV Workshops 2021 (enlace directo no disponible en la informacion proporcionada)
- Repositorio GitHub de la herramienta web Outlier Upscale Method (contiene `tools/convert_models.py`): enlace no disponible en la informacion proporcionada
