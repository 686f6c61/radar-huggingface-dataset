# skillsafe-ai/isnet-general-use

## Resumen

IS-Net general-use es un modelo de segmentacion de imagen (eliminacion de fondo) distribuido por SkillSafe como artefacto ONNX listo para ejecutarse en el navegador. No es un modelo de lenguaje ni un modelo generativo: recibe una imagen RGB de 1024x1024 pixeles y devuelve una mascara de un solo canal con la silueta del objeto principal, ademas de seis salidas auxiliares de la misma resolucion y cinco mapas de caracteristicas del codificador a distintas escalas. El modelo original es IS-Net (Highly Accurate Dichotomous Image Segmentation, DIS) de Xuebin Qin et al., y los pesos aqui publicados proceden del fichero `isnet-general-use.onnx` que distribuye el proyecto rembg de Daniel Gatis.

El repositorio no contiene una conversion propia: segun su model card, es una importacion de los pesos upstream sin modificaciones, fijada por hash SHA-256 y acompanada de una receta reproducible (`recipes/isnet-general-use.yaml`) y de un `manifest.json` con la cadena de herramientas completa (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin arm64). El unico fichero publicado es `isnet-general-use.onnx`, de 170,37 MB, clasificado como fichero de tipo `registry` y pensado para servirse desde `models.skillsafe.ai` una vez validado.

Su relevancia practica esta en el formato y el destino: al ser ONNX con opset 13, se puede cargar directamente con `onnxruntime-web` usando los execution providers `webgpu` y `wasm`, lo que permite hacer segmentacion de imagenes en el cliente sin enviar la imagen a un servidor. La licencia Apache-2.0 de los pesos originales facilita el uso comercial, con la obligacion de mantener la atribucion a IS-Net/DIS y a rembg.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional densa de segmentacion con estructura anidada tipo U²-Net y supervision profunda (familia IS-Net / DIS); no es transformer ni MoE |
| Parametros totales | no disponible (el fichero ONNX en fp32 ocupa 170,37 MB, lo que situa el orden de magnitud en torno a 42-45 millones de parametros; es una estimacion derivada del tamano del fichero, no un dato publicado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1024x1024 pixeles, tensor `input_image` float32 `[1, 3, 1024, 1024]`) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en fp32. ONNX admite cuantizacion a int8 a posteriori, pero no se ofrece ninguna variante cuantizada |
| Idiomas soportados | no aplica (modelo de segmentacion de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 13, fichero unico `isnet-general-use.onnx` (170,37 MB, SHA-256 `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`) |
| Entrada | `input_image` float32 `[1, 3, 1024, 1024]` |
| Salidas | `output_image` float32 `[1, 1, 1024, 1024]` mas `1890`, `1891`, `1892`, `1893`, `1894` float32 `[1, 1, 1024, 1024]`; y `input.1252` `[1, 64, 512, 512]`, `input.1088` `[1, 64, 256, 256]`, `input.948` `[1, 128, 128, 128]`, `input.832` `[1, 256, 64, 64]`, `input.740` `[1, 512, 32, 32]`, `input.656` `[1, 512, 16, 16]` |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-09-22 (conversion registrada a las 18:56:15 UTC del mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional densa de segmentacion con estructura anidada en forma de U y conexiones de salto entre codificador y decodificador, del tipo descrito en el trabajo IS-Net / DIS. Las formas declaradas en el contrato ONNX son coherentes con ese diseno: un flujo de caracteristicas que se reduce espacialmente (64 canales a 512x512, 64 a 256x256, 128 a 128x128, 256 a 64x64, 512 a 32x32 y 512 a 16x16) y seis mapas de salida de un canal a resolucion completa de 1024x1024. Estos seis mapas corresponden a las salidas de supervision profunda en cada nivel del decodificador mas la salida agregada; el modelo devuelve todos ellos, por lo que el consumidor debe usar `output_image` como mascara final y puede ignorar el resto o aprovecharlos como senales auxiliares.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre si hubo ajuste con RLHF o DPO; esos datos no aparecen ni en la model card ni en la informacion proporcionada, y en el caso de un modelo de segmentacion binaria la pregunta por RLHF no seria aplicable. La model card indica explicitamente que el artefacto se importo "as published upstream (no conversion)": SkillSafe no ha reentrenado, podado ni cuantizado los pesos, solo ha fijado el fichero por hash y ha verificado que pasa `onnx.checker` y una ejecucion de humo en CPU con entradas rellenas de ceros a las formas declaradas. La innovacion tecnica relevante aqui no es del modelo sino del empaquetado: distribucion como fichero ONNX de tipo `registry`, con receta reproducible y manifiesto, orientada a inferencia en navegador mediante `onnxruntime-web`.

## Capacidades

- Segmentacion dicotoma de imagenes: genera una mascara binaria de un canal que separa el objeto principal del fondo, con salida a 1024x1024.
- Modelo generalista: funciona sobre categorias de objeto muy diversas, no esta especializado en una sola clase (no es un segmentador de personas, animales o coches en exclusiva).
- Deteccion de saliencia: al estar entrenado para aislar el sujeto principal, tiende a seleccionar el objeto mas prominente de la escena.
- Multiples salidas: ofrece seis mapas de segmentacion a resolucion completa y cinco mapas de caracteristicas del codificador en distintas escalas, utiles para tareas derivadas como refinado, matting o analisis de bordes.
- Inferencia en navegador: compatible con `onnxruntime-web` sobre WebGPU y WebAssembly, sin necesidad de backend propio.
- Inferencia en servidor: al ser ONNX estandar, se puede ejecutar con onnxruntime en CPU o GPU, o integrarse en frameworks que acepten ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto; no tiene capacidades multilingues ni modo de razonamiento.
- No soporta vision multimodal ni comprension semantica de la imagen: no etiqueta objetos, no responde preguntas sobre el contenido y no genera descripciones.

## Casos de uso

- Eliminacion de fondo en comercio electronico: procesar fotografias de producto en el navegador del propio operador de catalogo, generando recortes con fondo transparente sin subir las imagenes originales a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Editor de fotografia web o PWA: integrar el modelo como paso de "quitar fondo" en un editor que funcione sin conexion; al cargarse con `onnxruntime-web` y execution providers `webgpu`/`wasm`, no requiere backend y el fichero de 170 MB se puede cachear.
- Automatizacion de creatividades de marketing: generar versiones con fondo neutro o corporativo de un lote de imagenes para anuncios, banners y fichas de producto, encadenando la mascara con una composicion por alfa.
- Preprocesado en pipelines de vision por computador: recortar el sujeto antes de pasarlo a un clasificador, un detector o un sistema de OCR, reduciendo el ruido de fondo y el area a procesar.
- Creacion de conjuntos de datos: producir mascaras iniciales para anotacion semiautomatica de datasets de segmentacion, que despues se corrigen manualmente, reduciendo el coste de etiquetado.
- Herramientas de videollamada y streaming en el navegador: segmentar al hablante para aplicar fondos virtuales en una aplicacion web; conviene medir antes la latencia real, porque el modelo esta disenado para imagen fija y no para flujo de video.
- Impresion y merchandising: extraer siluetas para estampados, vinilos o pruebas de producto, donde interesa una mascara limpia a resolucion alta.
- Edicion en dispositivos con recursos limitados: escenarios donde no hay GPU dedicada ni servidor de inferencia, apoyandose en el backend WASM de onnxruntime-web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de segmentacion (IoU, F-score, MAE ni comparaciones con otros modelos), y los resultados de busqueda web obtenidos no contienen informacion relevante sobre este modelo.

El unico dato de rendimiento disponible es la ejecucion de humo en CPU que el autor documenta como verificacion, con entradas rellenas de ceros, no como benchmark representativo:

| Prueba | Entrada | Salidas | Tiempo |
|---|---|---|---|
| Smoke test CPU (onnxruntime, Darwin arm64) | `input_image` [1, 3, 1024, 1024] | 12 tensores (6 mapas de segmentacion de [1, 1, 1024, 1024] y 6 mapas de caracteristicas) | 1480,6 ms |

Ese valor equivale aproximadamente a 0,68 inferencias por segundo en CPU en ese entorno concreto. No hay mediciones publicadas de latencia en WebGPU ni de throughput con lotes mayores que uno.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 y 1,5 GB en fp32 para lote de tamano 1 a 1024x1024. Es una estimacion orientativa calculada a partir del tamano del fichero (170,37 MB de pesos) y de las formas de las 12 salidas declaradas, no una medicion publicada por el autor.
- Almacenamiento: 170,37 MB para el peso ONNX, mas el espacio de cache del navegador si se sirve por HTTP.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador, o GPU de servidor tipo NVIDIA A10, L4, A100 o H100 si se ejecuta con onnxruntime sobre CUDA. Para este tamano de modelo, una GPU de gama de servidor esta sobredimensionada.
- GPU de consumo: cabe sin problemas en tarjetas con 4 GB o mas de memoria, incluidas RTX 3050, RTX 3060, RTX 4060 y RTX 4090. La restriccion practica no es la memoria sino el backend de ejecucion disponible.
- CPU: el modelo funciona en CPU (asi lo verifica el autor), pero con una latencia de aproximadamente 1,5 segundos por imagen en el entorno medido.
- Opciones de despliegue: onnxruntime-web en navegador (execution providers `webgpu` y `wasm`), onnxruntime nativo en Python/C++ con CPU, CUDA o DirectML, y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput: unicos datos disponibles, 1480,6 ms por inferencia en CPU para lote 1 en el smoke test citado. En WebGPU se espera una latencia menor, pero no hay cifras publicadas.

## Comparativa con modelos similares

La informacion proporcionada no incluye parametros ni metricas de los modelos alternativos, por lo que la comparacion se limita a aspectos de encuadre y licencia. En todos los casos, "no disponible" significa que el dato no aparece en la informacion consultada.

| Modelo | Categoria | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| isnet-general-use (este modelo) | Segmentacion dicotoma de alta precision, ONNX | no disponible (estimacion por tamano: 42-45 M) | 1024x1024 fija | no disponible (solo smoke test de 1480,6 ms en CPU) | Apache-2.0 | HuggingFace, fichero ONNX unico, pensado para navegador |
| u2net / u2netp (rembg) | Segmentacion de saliencia, misma familia de origen | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Distribucion via releases de rembg; no se detalla aqui |
| silueta (rembg) | Segmentacion de saliencia, variante ligera | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Distribucion via releases de rembg; no se detalla aqui |
| Segment Anything (SAM) | Segmentacion promptable de proposito general | no disponible | Resolucion variable con prompts | no disponible | Apache-2.0 (segun su publicacion original) | Amplia, fuera del ambito de esta ficha |

La diferencia funcional principal frente a un segmentador promptable como SAM es el modo de uso: IS-Net general-use no acepta puntos, cajas ni mascaras como indicacion, sino que decide por si mismo cual es el objeto principal. Eso lo hace mas sencillo de integrar en un flujo automatico, pero menos controlable cuando la imagen contiene varios objetos candidatos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: la model card no publica IoU, F-score ni comparaciones con alternativas, de modo que la calidad real de la mascara no esta cuantificada en la informacion disponible.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni informes de terceros.
- Modelo generalista: en escenas con varios objetos, fondos con textura similar al sujeto, pelo, cristal, humo, rejillas o siluetas muy finas, la mascara puede contener errores de borde o seleccionar el objeto equivocado.
- Entrada de resolucion fija: el tensor de entrada es [1, 3, 1024, 1024], lo que obliga a redimensionar cualquier imagen y provoca perdida de detalle en originales de mayor resolucion y artefactos en relaciones de aspecto no cuadradas si el redimensionado no se hace con cuidado.
- Salidas redundantes y costosas: el modelo devuelve 12 tensores, seis de ellos a 1024x1024, lo que incrementa el uso de memoria en comparacion con un modelo que solo devuelve la mascara final.
- Riesgo de alucinacion en el sentido de segmentacion espuria: puede producir una mascara con regiones inexistentes cuando la imagen no contiene un objeto claramente destacable, ya que siempre devuelve una salida.
- Sin datos de sesgo: no hay informacion sobre la demografia de los datos de entrenamiento ni evaluaciones de equidad por tipo de sujeto, tono de piel, iluminacion o contexto cultural.
- Herencia de sesgos del upstream: al ser una importacion sin conversion de los pesos de IS-Net distribuidos por rembg, arrastra exactamente las mismas limitaciones que el modelo original.
- Restricciones de licencia: los pesos estan bajo Apache-2.0, lo que permite uso comercial, pero exige conservar el aviso de licencia de IS-Net/DIS y la atribucion a rembg como distribuidor del ONNX. La receta de conversion y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia.
- Sin pipeline declarado en HuggingFace y sin idiomas declarados: la integracion debe hacerse contra el contrato ONNX documentado, no mediante `transformers` ni `pipeline`.
- Idoneidad para video no demostrada: la latencia de referencia en CPU (1480,6 ms) impide uso en tiempo real sin aceleracion por GPU y no hay mediciones de rendimiento en WebGPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/isnet-general-use
- Fichero ONNX: https://huggingface.co/skillsafe-ai/isnet-general-use/resolve/main/isnet-general-use.onnx
- Repositorio de recetas y modelos de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Origen upstream de los pesos (release de rembg): https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
- Repositorio rembg (Daniel Gatis, MIT): https://github.com/danielgatis/rembg
- Repositorio IS-Net / DIS (Xuebin Qin et al.): https://github.com/xuebinqin/DIS
- Licencia Apache-2.0 de IS-Net / DIS: https://github.com/xuebinqin/DIS/blob/main/LICENSE
- Nota: los resultados de busqueda web disponibles para esta consulta no contenian ningun enlace relevante sobre el modelo, por lo que no se han incluido.
