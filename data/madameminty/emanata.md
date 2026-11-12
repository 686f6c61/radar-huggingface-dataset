# MadameMinty/Emanata

## Resumen

Emanata no es un modelo de lenguaje, sino un repositorio agregador de modelos de vision para superresolucion y restauracion de imagen orientados a la lectura de comics y manga. Lo mantiene la usuaria MadameMinty y sirve como almacen de pesos que la aplicacion Emanata (un lector de comics) descarga bajo demanda mediante URL fijada y verificacion SHA-256. El repositorio empaqueta en carpetas independientes modelos de terceros ya existentes, convertidos en su mayoria al formato ncnn para inferencia ligera en CPU y GPU.

El contenido cubre varias familias: los modelos OpenComic AI (eliminacion de artefactos JPEG, descreen y escalado 2x/3x/4x), los clasicos waifu2x UpConv7 en sus variantes de denoise 0 a 3, Real-ESRGAN AnimeVideo v3 en factores 2x/3x/4x, el upscaler 4xLSDIRCompactC3 de Philip Hofmann, detectores de texto PP-OCRv5_mobile_det de PaddlePaddle, y los upscalers CuNNy-8x32-DS y ArtCNN C4F32 DS con sus variantes y scripts de conversion. Cada carpeta incluye su propia licencia y un fichero SOURCE.md con la procedencia, el hash y los cambios aplicados.

Su relevancia es practica: ofrece un conjunto curado y verificable de pesos ligeros listos para desplegar en un lector de comics, con formatos ncnn y ONNX que funcionan sin infraestructura de GPU dedicada. No hay un modelo unico con parametros o contexto definidos, sino una coleccion heterogenea de redes convolucionales de restauracion de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de redes convolucionales de superresolucion y restauracion (waifu2x UpConv7, Real-ESRGAN AnimeVideo v3, SRVGG compact, CuNNy-8x32-DS, ArtCNN C4F32 DS, PP-OCRv5_mobile_det) |
| Parametros totales | no disponible (varia por carpeta; no se publican recuentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de imagen, no de texto) |
| Tipos de cuantizacion | ncnn fp16 en varias carpetas; ONNX en las fuentes upstream; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (no aplica; el OCR subyacente es multilingue pero no se especifica) |
| Licencia | per-folder: CC-BY-4.0, MIT, BSD-3-Clause, Apache-2.0, LGPL-3.0-or-later; sin licencia global del repositorio |
| Formato de pesos | ncnn (mayoria), ONNX (fuentes upstream de ArtCNN), ficheros oficiales PaddlePaddle (ppocrv5-mobile-det-official) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: agrega pesos ya entrenados por terceros y, en algunos casos, los convierte a ncnn. Las arquitecturas subyacentes son redes convolucionales especializadas en superresolucion y restauracion. waifu2x UpConv7 es una CNN con capas de up-convolution pensada para arte anime; Real-ESRGAN AnimeVideo v3 emplea una arquitectura generativa orientada a video anime; 4xLSDIRCompactC3 usa el esquema SRVGG compacto de Philip Hofmann para fotos con compresion JPEG; CuNNy-8x32-DS y ArtCNN C4F32 DS son redes ligeras de escalado 2x pensadas originalmente como shaders de mpv. PP-OCRv5_mobile_det es un detector de texto de PaddlePaddle.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion de los datasets ni uso de RLHF o DPO, ya que se trata de modelos de vision y el repositorio solo documenta procedencia y conversion. La innovacion destacable es el empaquetado reproducible: cada carpeta incluye SOURCE.md con URL upstream fijada, SHA-256 y bytes por fichero, y un fichero SHA256SUMS global, lo que permite verificar integridad en la descarga bajo demanda. Tambien se incluyen scripts de conversion para CuNNy y ArtCNN con el hash de salida esperado.

## Capacidades

- Superresolucion de imagen en factores 2x, 3x y 4x segun la carpeta (OpenComic AI Upscale, Real-ESRGAN AnimeVideo v3, 4xLSDIRCompactC3, waifu2x, CuNNy, ArtCNN).
- Eliminacion de artefactos de compresion JPEG (opencomic-ai-artifact-removal-compact-v2).
- Descreen, es decir, eliminacion de patrones de semitono en escaneos (opencomic-ai-descreen-hard-compact-v2 y v3-256).
- Reduccion de ruido con niveles ajustables en waifu2x (denoise 0 a 3).
- Deteccion de texto en imagen mediante PP-OCRv5_mobile_det (version ncnn y version oficial PaddlePaddle).
- Restauracion orientada a arte anime, manga y comics, con variantes especificas para fotografia comprimida.
- Inferencia ligera en CPU/GPU mediante ncnn, sin requisitos de tool calling ni agentes.
- No dispone de generacion de texto, razonamiento, codigo ni capacidades conversacionales.

## Casos de uso

- Lectura de comics y manga en la aplicacion Emanata: el lector descarga bajo demanda los pesos verificados por SHA-256 y aplica el upscaler adecuado a cada pagina, mejorando la nitidez en pantallas de alta densidad sin empaquetar los modelos en la app.
- Limpieza de escaneos antiguos: la carpeta de descreen elimina el patron de semitono de digitalizaciones de revistas, y la de artifact removal reduce los bloques JPEG, dejando la pagina lista para OCR o lectura.
- Escalado de arte anime en 2x con waifu2x UpConv7: util para ampliar ilustraciones o paneles manteniendo lineas limpias, con niveles de denoise seleccionables segun la calidad de origen.
- Restauracion de fotografia comprimida: 4xLSDIRCompactC3 amplia imagenes con artefactos JPEG en un factor 4x, adecuado para fotos de portada o material promocional.
- Digitalizacion de texto en paneles: PP-OCRv5_mobile_det detecta regiones de texto para un pipeline posterior de reconocimiento, util en traduccion o indexacion de comics.
- Integracion en visores multimedia: las variantes CuNNy y ArtCNN, nacidas como shaders de mpv, permiten aplicar escalado 2x en tiempo real sobre video o imagen en reproductores.
- Procesamiento por lotes en servidor sin GPU: al estar en ncnn, los modelos pueden ejecutarse en CPU para lotes de paginas, con throughput dependiente del hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser redes convolucionales ligeras en ncnn, el consumo es bajo y en muchos casos cabe en memoria compartida de CPU.
- GPU recomendadas: no se especifican; ncnn soporta Vulkan y permite ejecucion en GPU integradas y dedicadas, aunque no hay lista oficial.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el caracter ligero de los modelos y el formato ncnn fp16, aunque no se aportan cifras.
- Opciones de despliegue: ncnn (formato principal), ONNX Runtime para las fuentes ArtCNN, PaddlePaddle para ppocrv5-mobile-det-official, e integracion en la app Emanata mediante descarga por URL fijada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Factor | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emanata (agregado) | Coleccion de upscalers y restauracion | 1x, 2x, 3x, 4x | ncnn, ONNX, Paddle | per-folder (CC-BY-4.0, MIT, BSD-3, Apache-2.0, LGPL-3.0) | Hugging Face |
| waifu2x (nagadomi) | Upscaler anime | 2x | ncnn, otros | MIT | Upstream publico |
| Real-ESRGAN (Xintao Wang) | Upscaler general y anime | 2x, 3x, 4x | PyTorch, ncnn | BSD-3-Clause | Upstream publico |
| OpenComic AI (Oleguer Llopart Mora) | Restauracion y escalado | 1x, 2x, 3x, 4x | ncnn | CC-BY-4.0 | Upstream publico |

La comparativa es de caracter cualitativo: Emanata no aporta un modelo nuevo, sino un empaquetado verificable de estos y otros proyectos con sus licencias y procedencia documentadas.

## Limitaciones y advertencias

- No es un modelo unico: cada carpeta tiene su propia licencia y condiciones; no existe licencia global del repositorio.
- Algunas licencias imponen obligaciones: CC-BY-4.0 exige atribucion, LGPL-3.0-or-later afecta a CuNNy y sus variantes, y BSD-3-Clause y Apache-2.0 requieren conservar avisos.
- El autor declara que no se implica el aval de los autores upstream.
- Los modelos estan especializados en arte anime, manga y comics; su rendimiento en fotografia natural generica puede ser inferior al de upscalers de proposito general.
- Riesgo de artefactos o sobreenfoque en imagenes con mucho ruido o texturas finas, segun el modelo elegido.
- No se publican benchmarks ni metricas de calidad objetivas, por lo que la seleccion entre carpetas debe hacerse por prueba empirica.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que sugiere un proyecto reciente o poco difundido.
- La fecha de creacion indicada (2026-11-11) resulta anomala y conviene verificarla antes de citarla.
- No hay informacion sobre sesgos, idiomas del OCR ni limites de contexto porque no aplican a modelos de imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MadameMinty/Emanata
- Licencia del repositorio (referenciada): LICENSE.md en la raiz del repositorio
- Upstream waifu2x (nagadomi): no disponible en la informacion proporcionada
- Upstream ncnn (nihui): no disponible en la informacion proporcionada
- Upstream Real-ESRGAN (Xintao Wang): no disponible en la informacion proporcionada
- Upstream OpenComic AI (Oleguer Llopart Mora): no disponible en la informacion proporcionada
- Upstream 4xLSDIRCompactC3 (Philip Hofmann / Helaman): no disponible en la informacion proporcionada
- Upstream PP-OCRv5 (PaddlePaddle): no disponible en la informacion proporcionada
- Upstream CuNNy (funnyplanter): no disponible en la informacion proporcionada
- Upstream ArtCNN (Joao Chrisostomo): no disponible en la informacion proporcionada
