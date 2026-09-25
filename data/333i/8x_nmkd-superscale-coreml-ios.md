# 333i/8x_NMKD-Superscale-coreml-ios

## Resumen

`333i/8x_NMKD-Superscale-coreml-ios` es una conversion a CoreML del modelo de superresolucion de imagen `8x_NMKD-Superscale_150000_G`, de la familia NMKD (N00MKRAD). No es un modelo de lenguaje: se trata de una red de upscaling de imagenes que multiplica por 8 la resolucion de una imagen de entrada (tarea image-to-image). El repositorio lo publica el usuario `333i` como artefacto listo para ejecutarse en dispositivos iOS mediante Core ML, presumiblemente apoyandose en el Neural Engine de los chips Apple.

El modelo original pertenece a la serie NMKD, ampliamente utilizada en herramientas de upscaling como Upscayl y en flujos de ComfyUI y A1111. La variante `8x` esta orientada a reescalados agresivos (x8), mientras que las versiones mas conocidas de la familia (`4x_NMKD-Superscale-SP_178000_G`) trabajan a x4. El checkpoint `.pth` original esta publicado en varios repositorios de terceros; aqui lo relevante es la conversion a formato CoreML para inferencia local en iPhone/iPad.

La relevancia de esta ficha es limitada y conviene ser transparente: el repositorio acumula 0 descargas y 0 likes, no incluye model card, no declara licencia en el campo correspondiente (los tags apuntan a WTFPL) y no aporta metricas. Su interes practico es el de un artefacto de despliegue movil, no el de un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red generativa de superresolucion tipo ESRGAN (bloques residuales densos, familia RRDB); detalle exacto no disponible en la informacion proporcionada |
| Parametros totales | No disponible. El checkpoint original de la serie (`8x_NMKD-Superscale_150000_G.pth`) ocupa aproximadamente 64 MB, lo que equivaldria a del orden de 16 millones de parametros en fp32 (estimacion no confirmada) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: modelo de vision; procesa imagenes, no secuencias de texto |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; Core ML permite cuantizacion a FP16, INT8 y paletizada, pero no se confirma cual usa este artefacto |
| Idiomas soportados | No aplicable (modelo de imagen, sin entrada ni salida de texto) |
| Licencia | El campo de licencia de la ficha indica "no disponible"; los tags del repositorio declaran `license:wtfpl`. La licencia del checkpoint original de NMKD debe verificarse por separado |
| Formato de pesos | Core ML (`.mlmodel` / `.mlpackage`), derivado del checkpoint original en PyTorch (`.pth` / `.pt`) |
| Tarea (pipeline) | image-to-image |
| Factor de escala | x8 |
| Plataforma objetivo | iOS (Core ML, inferencia en dispositivo) |
| Tamano del repositorio | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-25 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La familia NMKD Superscale emplea generadores de tipo ESRGAN, es decir, redes con bloques residuales densos (RRDB) y una etapa final de reconstruccion que reordena canales para aumentar la resolucion (pixel shuffle). El sufijo `_G` de los nombres de checkpoint indica que el archivo corresponde al generador, no al discriminador, algo habitual en los lanzamientos derivados de ESRGAN y Real-ESRGAN. La variante `8x` realiza un aumento de escala por un factor de 8 en una sola pasada, lo que implica una ampliacion de canales mayor en la cabeza de reconstruccion que en las versiones x4.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de iteraciones (aunque el sufijo `150000_G` sugiere 150.000 pasos), la composicion de las imagenes de entrenamiento ni si se aplicaron tecnicas adicionales como degradaciones sinteticas (blur, ruido, compresion JPEG) al estilo Real-ESRGAN. Tampoco hay datos sobre el proceso de exportacion a Core ML: no se especifica si se aplico cuantizacion, poda, ni que herramientas de conversion (`coremltools`) se usaron. Toda esta informacion figura como no disponible.

## Capacidades

- Superresolucion de imagenes con factor de escala x8 sobre la resolucion de entrada.
- Restauracion de detalle y nitidez en imagenes de baja resolucion, con enfasis en contenido generico (fotografia, ilustracion, renders).
- Inferencia local en dispositivos iOS mediante Core ML, sin necesidad de conexion a servicios en la nube.
- Procesamiento por teselas (tiling) cuando la resolucion de entrada excede la memoria disponible, aunque no esta confirmado que el artefacto CoreML lo implemente internamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente visual.
- Sin capacidades multilingues: no procesa ni produce lenguaje.
- Sin modo "thinking", vision semantica, audio ni ninguna otra modalidad adicional.

## Casos de uso

- Restauracion de fotos antiguas o de baja resolucion en una app iOS nativa: el modelo se ejecuta en el dispositivo, evitando subir imagenes personales a un servidor y reduciendo costes de infraestructura.
- Escalado de capturas y material grafico dentro de una app de edicion fotografica: el factor x8 permite reconstruir miniaturas o previews comprimidas antes de exportar el resultado final.
- Preparacion de assets para impresion o pantallas de alta densidad: ampliar una imagen pequena a una resolucion suficiente para imprimir en tamano reducido.
- Mejora de texturas en flujos de trabajo graficos (wallpapers, ilustracion digital) donde se parte de un boceto a baja resolucion.
- Preprocesado en pipelines de vision por computador: elevar la resolucion de imagenes de entrada antes de un detector o clasificador que rinda mejor con mas detalle.
- Restauracion por lotes en un Mac con Core ML: aunque el artefacto se etiqueta como iOS, Core ML tambien se ejecuta en macOS, lo que permitiria procesar colecciones de imagenes en local.
- Prototipado de funciones de upscaling en apps sin depender de APIs externas ni de cuotas de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas (PSNR, SSIM, LPIPS) ni comparaciones cuantitativas con otros upscalers, y las busquedas web no aportan cifras para esta conversion concreta.

## Requisitos de hardware

- Al tratarse de una conversion Core ML, el destino natural es el Neural Engine (ANE) de los chips Apple A-series y M-series. El modelo no esta pensado para GPU NVIDIA ni para CUDA.
- VRAM o memoria unificada estimada: no disponible. Con un generador de aproximadamente 16 millones de parametros en FP16, el peso del modelo rondaria unas decenas de megabytes, pero el consumo real depende de la resolucion de la imagen y del uso de teselas.
- En iOS, la limitacion practica es la memoria disponible para el proceso y el tamano maximo de textura; imagenes grandes probablemente requieran procesado por bloques.
- GPU recomendadas: no aplicable en el sentido habitual. Para la version original en PyTorch, cualquier GPU con 4-6 GB de VRAM es suficiente en modo teselado; una RTX 3060 o superior es mas que adecuada.
- Opciones de despliegue: Core ML en iOS y macOS (Vision framework o Core ML directamente). Para el modelo original en PyTorch: Upscayl, ComfyUI, Automatic1111, chaiNNer y Real-ESRGAN ncnn.
- Latencia y throughput: no disponibles. No se han publicado mediciones por dispositivo (por ejemplo, milisegundos por imagen en un iPhone concreto).

## Comparativa con modelos similares

| Modelo | Factor | Formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| `333i/8x_NMKD-Superscale-coreml-ios` | x8 | Core ML | iOS / macOS | No disponible en la ficha; tags indican WTFPL | 0 descargas, 0 likes, sin model card |
| `8x_NMKD-Superscale_150000_G` (original) | x8 | PyTorch `.pth` | GPU / CPU (escritorio) | No disponible | Origen del que deriva esta conversion; ~64 MB |
| `4x_NMKD-Superscale-SP_178000_G` | x4 | PyTorch `.pth` | GPU / CPU (escritorio) | No disponible | Version mas extendida de la familia, integrada en Upscayl |
| Real-ESRGAN x4plus | x4 | PyTorch, ncnn, ONNX | Multiples | BSD-3-Clause | Alternativa de referencia con licencia permisiva y amplio soporte |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin model card, sin descripcion, sin ejemplos de uso y sin metricas: la validacion por parte de terceros es inexistente.
- 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el artefacto haya sido probado por la comunidad.
- El campo de licencia de la ficha aparece como no disponible, mientras que los tags declaran WTFPL. Es necesario verificar la licencia del checkpoint NMKD original antes de cualquier uso comercial, ya que el autor de la conversion no es necesariamente el titular de los derechos.
- Riesgo de alucinacion en el sentido visual: los upscalers generativos pueden inventar detalle inexistente, producir texturas artificiales o artefactos en bordes, texto y patrones finos.
- El factor x8 es agresivo y suele amplificar artefactos cuando la entrada tiene ruido, compresion JPEG marcada o esta muy degradada.
- Sin soporte de texto, dialogo, agentes ni tool calling: no es utilizable como modelo de lenguaje ni como asistente.
- No hay garantia de compatibilidad con versiones concretas de iOS, de Core ML ni con el Neural Engine de todos los dispositivos; la ausencia de documentacion impide confirmarlo.
- La fecha de creacion registrada (2026-09-25) es posterior a la fecha habitual de publicacion de la familia NMKD; conviene tratarla con cautela.
- Rendimiento esperado en imagenes grandes: probable necesidad de teselado manual, con posible aparicion de costuras si no se solapan las teselas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/333i/8x_NMKD-Superscale-coreml-ios
- Serie NMKD en DeepWiki (Upscayl/custom-models): https://deepwiki.com/upscayl/custom-models/2.1-nmkd-model-series
- Checkpoint original en el repositorio de ComfyUI de fofr: https://huggingface.co/fofr/comfyui/blob/489abf87f2f8311813695069020730ccdb1588cd/upscale_models/8x_NMKD-Superscale_150000_G.pth
- Copia del checkpoint en HuggingFace (moi33): https://huggingface.co/moi33/8x_NMKD-Superscale_150000_G
- Ficha del upscaler en CivArchive: https://civarchive.com/models/292030?modelVersionId=328284
- Herramienta NMKD Stable Diffusion GUI del autor original: https://nmkd.itch.io/t2i-gui
