# kittypdf/UVDoc-ONNX

## Resumen

UVDoc-ONNX es una exportación derivada del modelo UVDoc de PaddleOCR, especializada en la corrección de deformaciones geométricas (dewarping) en fotografías de documentos. El modelo original forma parte del ecosistema PaddleOCR y aprende la deformación tridimensional de una página curvada o arrugada para revertirla y producir una imagen con geometría rectangular tipo escáner. Esta variante concreta, publicada por el usuario kittypdf, no reentrena pesos: modifica el grafo de exportación para exponer la rejilla de muestreo (grid) intermedia antes de la operación final de Resize, eliminando el subgrafo de remuestreo de imagen.

El resultado es un artefacto ONNX de 31.682.817 bytes (aproximadamente 30,2 MiB) cuyo propósito es ejecutarse localmente en el navegador mediante WebAssembly, dentro del visor de PDF Baimiao. En lugar de devolver una imagen corregida, el modelo emite coordenadas normalizadas de origen x/y con semántica align-corners, y es la aplicación llamante la que debe interpolar la rejilla y remuestrear la imagen original.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo generativo multimodal, sino un componente de preprocesado de imagen para pipelines de digitalización documental. Su interés radica en la posibilidad de ejecutar dewarping de documentos íntegramente en el cliente, sin enviar imágenes a servidores, y en el formato ONNX optimizado para WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para estimacion de rejilla de deformacion (derivada de UVDoc, PaddleOCR); grafo ONNX truncado antes de la operacion Resize |
| Parametros totales | no disponible (el repositorio no publica recuento de parametros; el artefacto ONNX pesa 31.682.817 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico artefacto ONNX en float32) |
| Idiomas soportados | no disponible (independiente del idioma del documento; procesa imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`uvdoc-grid-v1.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es UVDoc, el componente de unwarping documental de PaddleOCR, que estima la deformacion 3D de una pagina fotografiada y genera una rejilla de muestreo para rectificarla. Esta exportacion concreta no reentrena pesos: segun la model card, el script `export-grid.py` expone la rejilla de muestreo gruesa de dos canales antes de la operacion final de Resize y elimina el subgrafo posterior de remuestreo de imagen. Por tanto, la arquitectura efectiva es la del extractor de UVDoc hasta la cabeza de prediccion de rejilla, sin la etapa de warp final.

La entrada es un tensor float32 en formato NCHW con forma `[1, 3, 712, 488]`, con canales en orden BGR escalados al rango `[0, 1]`. La salida contiene coordenadas de origen normalizadas x/y con semantica align-corners. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino, ya que esta variante no aporta entrenamiento propio y la model card remite al modelo original de PaddleOCR. El SHA-256 del artefacto es `a3b1cbf9ca5216c39cd53cb63af8fbe91414e74d0f0adb1a6f1ba38f56979ae6`, y el del modelo de entrada original es `54cab30dc2cf347b4f3d6971c833b1c3d84f5ef17280f1f6d15796bff20e63d6`.

## Capacidades

- Estimacion de la rejilla de deformacion de una pagina fotografiada (documento curvado, arrugado o con perspectiva), devolviendo coordenadas normalizadas x/y.
- Exportacion optimizada para inferencia en navegador mediante ONNX y WebAssembly.
- Entrada de imagen fija de 712x488 pixeles en formato NCHW, canales BGR normalizados a `[0, 1]`.
- Salida de rejilla de dos canales con semantica align-corners, pensada para que el llamante interpole y remuestree la imagen original.
- No genera texto OCR ni una imagen corregida: es exclusivamente un estimador de geometria.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Digitalizacion de documentos en el navegador: el modelo se ejecuta via WebAssembly en el cliente y permite rectificar fotografias de paginas curvadas sin enviar la imagen a un servidor, lo que reduce riesgos de privacidad y latencia de red.
- Preprocesado previo a OCR: al devolver una rejilla de muestreo, el pipeline puede rectificar la imagen y alimentar despues un motor OCR, mejorando la calidad de reconocimiento en documentos curvados o con perspectiva.
- Integracion en visores de PDF y escaneres moviles: la aplicacion Baimiao PDF lo usa para aplanar documentos capturados con camara de movil antes de su almacenamiento o conversion.
- Escaneo de libros y documentos encuadernados: la correccion de la curvatura de paginas cerca del lomo mejora la legibilidad y la calidad de la digitalizacion.
- Procesamiento por lotes en cliente: al ser un artefacto ONNX compacto (unos 30 MiB), puede cargarse en un worker de navegador y procesar varias imagenes secuencialmente sin infraestructura de servidor.
- Verificacion de integridad en pipelines de despliegue: la model card fija tamano y SHA-256, de modo que un sistema de build puede validar la integridad del artefacto antes de cargarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el artefacto ONNX ocupa 31.682.817 bytes, por lo que la huella de pesos es de aproximadamente 30 MiB en float32.
- GPU recomendadas: no disponible; el modelo esta orientado a ejecucion en CPU y WebAssembly en el navegador.
- Compatibilidad con GPU de consumo: no disponible; al ser un modelo pequeno (entorno a 30 MiB), es previsible que quepa en cualquier GPU de consumo, aunque no se publican requisitos oficiales.
- Opciones de despliegue: ONNX Runtime, ONNX Runtime Web (WebAssembly) y cualquier runtime compatible con ONNX; el repositorio esta preparado para el adaptador de navegador de Baimiao PDF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kittypdf/UVDoc-ONNX (esta ficha) | Derivado ONNX de UVDoc | Imagen NCHW `[1, 3, 712, 488]` BGR `[0, 1]` | Rejilla de muestreo normalizada x/y | Apache-2.0 | Hugging Face |
| PaddlePaddle/UVDoc_onnx | Modelo original ONNX | Imagen | Imagen corregida (grafo completo) | Apache-2.0 | Hugging Face |
| UVDoc (PaddleOCR) | Modelo original de dewarping | Imagen | Imagen corregida | Apache-2.0 | Repositorio PaddleOCR |

La diferencia principal frente al modelo original es que esta variante elimina el subgrafo de remuestreo y expone la rejilla intermedia, lo que traslada al llamante la responsabilidad de interpolar y remuestrear. No se dispone de datos de rendimiento comparativo entre ambas variantes.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni agentes.
- No devuelve una imagen corregida ni texto OCR; el llamante debe implementar la interpolacion de la rejilla y el remuestreo de la imagen original.
- Entrada fija de 712x488 pixeles en NCHW con canales BGR normalizados a `[0, 1]`; cualquier otra forma o escala requiere adaptacion previa.
- No se han publicado datos sobre sesgos, tasa de alucinacion (no aplica en el sentido generativo) ni limitaciones por idioma.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion a PaddlePaddle/PaddleOCR y el aviso de licencia incluido en el repositorio.
- La model card advierte de que el codigo adicional de correccion de texto, tablas y bordes de pagina queda fuera de este repositorio.
- Se recomienda verificar el tamano y el SHA-256 fijados antes de cargar el artefacto, ya que el autor indica que ambos mirrors de kittypdf distribuyen los mismos bytes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria publica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kittypdf/UVDoc-ONNX
- Modelo base: https://huggingface.co/PaddlePaddle/UVDoc_onnx
- Demo Web AI Showcase de UVDoc: https://webai.show/models/uvdoc-document-dewarping/
- Repositorio UVDoc en GitCode: https://ai.gitcode.com/ohhoohho/UVDoc
