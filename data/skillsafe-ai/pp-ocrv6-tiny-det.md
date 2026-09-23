# skillsafe-ai/pp-ocrv6-tiny-det

## Resumen

`skillsafe-ai/pp-ocrv6-tiny-det` es un artefacto ONNX de detección de texto listo para ejecutarse en navegador, publicado por SkillSafe a partir del modelo `PaddlePaddle/PP-OCRv6_tiny_det_onnx` de PaddleOCR. No es un modelo de lenguaje ni un modelo multimodal generativo: es una red convolucional de detección de texto (localización de regiones de texto en una imagen), empaquetada como un único archivo `inference.onnx` de 1,70 MB. Su función es la primera etapa de un pipeline OCR: dada una imagen, producir un mapa de probabilidad de texto que después se binariza y agrupa en cajas o polígonos.

El interés de esta ficha concreta no está en el modelo en sí, sino en el formato de distribución. SkillSafe publica una importación reproducible del artefacto upstream, verificada byte a byte con SHA-256, con la receta de conversión y el toolchain registrados, y con un contrato de entrada/salida explícito pensado para `onnxruntime-web` sobre WebGPU y WASM. Eso permite desplegar detección de texto íntegramente en el cliente, sin enviar imágenes a un servidor.

El repositorio es de tamaño práctico nulo en disco (el archivo pesa 1,70 MB), no acumula descargas ni likes en el momento de la consulta y no incluye resultados de benchmarks. La licencia es Apache-2.0 y los pesos siguen siendo los del upstream de PaddlePaddle, por lo que los términos aplicables son los de PaddleOCR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional de detección de texto basada en segmentación; salida de un único canal con la misma resolución espacial que la entrada (compatible con cabeza tipo DB). Última operación del grafo: `ConvTranspose` |
| Parámetros totales | En torno a 0,4 M (estimación a partir del tamaño del archivo en FP32; no declarado por el autor). No disponible como dato oficial |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; no es un modelo de lenguaje. La entrada es una imagen con dimensiones espaciales dinámicas (`DynamicDimension.1`, `DynamicDimension.2`), 3 canales |
| Tipos de cuantización | No disponible. El artefacto se distribuye como ONNX en coma flotante de 32 bits (la entrada se declara `float32`) y la model card indica que se importó tal cual del upstream, sin conversión adicional |
| Idiomas soportados | No disponible. Como detector, la cobertura por script depende del modelo upstream de PP-OCRv6 tiny y no se documenta en este repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`inference.onnx`), opset 14, 1,70 MB, SHA-256 `193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8` |

Otros datos de identificación: repositorio creado y actualizado el 2026-09-22; commit upstream fijado `2ba1506c0380b8f0b03dd142459aac66d4421f6c`; receta `recipes/pp-ocrv6-tiny-det.yaml` con SHA-256 `4802a48d35c8c25d497391c3c6e884492d5cd7fab7ed48c485786308c6d67eb9`.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo más allá de lo que se deduce del grafo ONNX. El contrato declarado es: entrada `x` de tipo `float32` con forma `['DynamicDimension.0', 3, 'DynamicDimension.1', 'DynamicDimension.2']` (lote, 3 canales, alto y ancho dinámicos) y salida `fetch_name_0` de tipo `float32` con forma `[1, 1, 'ConvTranspose_459_o0__d2', 'ConvTranspose_459_o0__d3']`, es decir, un mapa de un solo canal con la misma resolución espacial que la entrada. Esa configuración es la habitual en detectores de texto por segmentación, donde el mapa se umbraliza y se agrupan píxeles para obtener regiones o polígonos antes de recortarlos y pasarlos a un reconocedor.

No hay datos de entrenamiento en este repositorio: ni número de tokens o imágenes, ni composición del dataset, ni uso de RLHF/DPO (que no aplican a este tipo de modelo). El repositorio es exclusivamente un artefacto de importación: la model card afirma explícitamente que el modelo se importó tal como se publicó upstream, sin conversión, y que cada byte es derivable de la fuente original más la receta. La verificación realizada consiste en `onnx.checker` y una ejecución de humo en CPU con entradas rellenas de ceros a las formas declaradas, que devuelve 5,9 ms por pasada a 320×320 bajo onnxruntime 1.30.0. El toolchain registrado es Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64.

## Capacidades

- Detección de texto en imágenes: produce un mapa de probabilidad de texto a partir de una imagen RGB, que es la entrada típica de un pipeline OCR.
- Dimensiones espaciales dinámicas: el grafo acepta alturas y anchos variables, no solo el 320×320 usado en el smoke test.
- Ejecución en navegador: pensado para `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`, lo que permite inferencia en el cliente sin backend.
- Integración como etapa previa a reconocimiento: al ser un detector, su salida alimenta a un modelo de reconocimiento (por ejemplo, un rec de PP-OCR) para obtener el texto final.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general: no es un modelo generativo ni multimodal.
- No tiene soporte de tool calling, function calling ni comportamiento agéntico.
- Capacidades multilingües: no documentadas en este repositorio; dependen del upstream y de la etapa de reconocimiento.
- No dispone de modo de razonamiento (thinking), audio ni vídeo como entrada.

## Casos de uso

- OCR de documentos en el navegador: el modelo detecta las regiones de texto de un PDF escaneado o una foto directamente en el cliente y solo se envían al servidor (o se procesan localmente) los recortes, lo que reduce el tráfico y evita sacar la imagen completa de la máquina del usuario.
- Preprocesado en pipelines OCR completos: al devolver un mapa de un canal con la misma resolución que la entrada, encaja como primera etapa antes de un modelo de reconocimiento, tanto en servidor con onnxruntime como en cliente con onnxruntime-web.
- Aplicaciones web con privacidad estricta: herramientas de digitalización de nóminas, facturas o contratos donde la detección debe ejecutarse en el dispositivo por requisitos de protección de datos, con WebGPU como acelerador y WASM como respaldo.
- Extracción de texto de capturas de pantalla en herramientas SaaS: extensiones de navegador o paneles internos que permiten seleccionar una región de una captura y obtener las cajas de texto como paso previo a copiarlas o indexarlas.
- Digitalización en PWA y aplicaciones móviles offline: al pesar 1,70 MB, el modelo puede incluirse en el bundle de una aplicación (`bundle`) y funcionar sin conectividad, útil para captura de tickets, albaranes o formularios en campo.
- Accesibilidad: lectura en voz alta del texto presente en imágenes subidas por el usuario, detectando primero las regiones y delegando después el reconocimiento y la síntesis.
- Moderación y análisis de contenido subido por usuarios: localizar texto incrustado en imágenes (por ejemplo, marcas de agua o rótulos) antes de aplicar reglas de contenido, con la ventaja de poder ejecutarlo en el cliente para filtrar antes de subir.
- Análisis de fotogramas en flujos de vídeo ligeros: procesar muestras de frames para localizar rótulos, siempre que se acepte la latencia por fotograma y la resolución de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la verificación de humo declarada por el autor, que no constituye un benchmark:

| Prueba | Entrada | Salida | Runtime | Latencia |
|---|---|---|---|---|
| Smoke test en CPU | `x[1, 3, 320, 320]` (ceros) | `fetch_name_0[1, 1, 320, 320]` | onnxruntime 1.30.0, Darwin 25.6.0 arm64 | 5,9 ms |

No hay datos de precisión (Hmean, recall, precision) sobre conjuntos como ICDAR, ni comparaciones con otros detectores. Cualquier cifra de calidad tendría que obtenerse del repositorio upstream de PP-OCRv6 o medirse directamente.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en la práctica. Los pesos ocupan 1,70 MB y las activaciones a 320×320 son pequeñas; el consumo está dominado por el runtime, no por el modelo.
- GPU recomendadas: ninguna en particular. Funciona en CPU y en cualquier GPU integrada o dedicada; en navegador se aprovecha de WebGPU cuando está disponible.
- GPU consumer: cabe con enorme margen en cualquier GPU consumer e integrada, así como en móviles. No requiere GPU dedicada.
- Opciones de despliegue: `onnxruntime-web` con ejecución en WebGPU o WASM; `onnxruntime` en servidor (CPU o GPU) para pipelines OCR; inclusión como recurso empaquetado en una aplicación o servido desde `models.skillsafe.ai` una vez vetado. Al ser ONNX estándar con opset 14, es convertible a otros runtimes si se necesita.
- Latencia y throughput: el único dato disponible es 5,9 ms por pasada a 320×320 en CPU arm64, con entradas rellenas de ceros. No hay mediciones a resoluciones mayores, ni con WebGPU, ni de throughput sostenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/pp-ocrv6-tiny-det` | ~0,4 M (estimación) | Imagen RGB con dimensiones dinámicas | Sin benchmarks publicados | Apache-2.0 | ONNX en HuggingFace, 1,70 MB |
| `PaddlePaddle/PP-OCRv6_tiny_det_onnx` (upstream) | Idénticos (mismo grafo) | Idéntico | Sin benchmarks publicados en esta información | Apache-2.0 | ONNX en HuggingFace |
| Otros detectores de texto (DBNet, EAST, CRAFT y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con el upstream es directa porque este repositorio no modifica los pesos: es una importación verificada del mismo artefacto. Para el resto de alternativas no se dispone de datos de parámetros, contexto, rendimiento ni licencia en la información proporcionada, por lo que no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- Solo detecta, no reconoce: la salida es un mapa de probabilidad, no texto. Sin una etapa de binarización, agrupación en cajas y un modelo de reconocimiento, el resultado no es utilizable de forma directa.
- Sin datos de precisión: no se han publicado métricas de calidad en este repositorio. La única validación es un smoke test con entradas de ceros, que comprueba que el grafo carga y ejecuta, no que detecte bien.
- Idiomas y scripts no documentados: no se especifica qué alfabetos cubre el detector. Si el despliegue requiere cirílico, árabe, CJK o cualquier script no contemplado por el upstream, hay que verificarlo antes de producción.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento del upstream ni sobre su comportamiento diferencial por tipo de documento, calidad de imagen o iluminación.
- Riesgo de degradación fuera de distribución: el smoke test se declara a 320×320; el grafo acepta dimensiones dinámicas, pero no hay datos sobre cómo se comporta con imágenes muy grandes, muy pequeñas o con relaciones de aspecto extremas.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar el aviso de licencia y la atribución a PaddlePaddle/PaddleOCR. La receta de conversión y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia, distinta de la de los pesos.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día (2026-09-22). No hay validación por parte de la comunidad ni historial de uso.
- Distribución condicionada: la model card indica que los archivos de clase `registry` se sirven desde `models.skillsafe.ai` una vez vetados; conviene confirmar la disponibilidad y las condiciones de ese servicio si se depende de él en producción.
- Dependencia del upstream: cualquier cambio, retirada o actualización en `PaddlePaddle/PP-OCRv6_tiny_det_onnx` afecta a la trazabilidad, aunque este repositorio fija el commit `2ba1506c0380b8f0b03dd142459aac66d4421f6c`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/pp-ocrv6-tiny-det
- Modelo upstream en HuggingFace: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx
- Commit upstream fijado: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx/tree/2ba1506c0380b8f0b03dd142459aac66d4421f6c
- Repositorio de PaddleOCR (código y licencia): https://github.com/PaddlePaddle/PaddleOCR
- Licencia de PaddleOCR (Apache-2.0): https://github.com/PaddlePaddle/PaddleOCR/blob/main/LICENSE
- Conversor y recetas de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Búsqueda web: los resultados devueltos para esta consulta corresponden al término genérico "query" y no aportan información relevante sobre el modelo. No se han encontrado papers, blogs ni demos adicionales en la información disponible.
