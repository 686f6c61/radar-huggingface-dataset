# skillsafe-ai/pp-ocrv6-tiny-rec

## Resumen

`skillsafe-ai/pp-ocrv6-tiny-rec` es un artefacto ONNX listo para navegador que implementa reconocimiento de texto (OCR) sobre recortes de líneas de texto. No es un modelo entrenado desde cero, sino una redistribución reproducible del modelo `PaddlePaddle/PP-OCRv6_tiny_rec_onnx` de PaddleOCR, publicada por SkillSafe mediante un conversor reproducible y con verificación por SHA-256. El repositorio ocupa 0,0 GB y contiene un único fichero `inference.onnx` de 4,26 MB.

El objetivo es permitir inferencia de reconocimiento de texto directamente en el navegador con `onnxruntime-web`, usando los proveedores de ejecución `webgpu` y `wasm`, de modo que no sea necesario enviar imágenes a un servidor. El artefacto está fijado al commit `2612ab37152ae0a677521bae4e1e3d4fb4cf7c30` del modelo original y se acompaña de un `manifest.json` que registra la receta (`recipes/pp-ocrv6-tiny-rec.yaml`), el toolchain y las huellas de verificación.

Su relevancia actual reside en que reduce la barrera de entrada para integrar OCR en aplicaciones web sin backend de inferencia, con licencia Apache-2.0. Al derivar de un modelo "tiny", su huella de memoria es mínima, pero en la información disponible no se documentan métricas de calidad, idiomas soportados ni el vocabulario de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo ONNX, opset 11, derivado de PP-OCRv6 tiny rec de PaddleOCR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento de texto, no generativo) |
| Tipos de cuantizacion | no disponible (el modelo base aparece etiquetado como `base_model:quantized`, pero no se especifica el esquema) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`inference.onnx`, opset 11) |
| Tamano del fichero | 4,26 MB |
| Entrada | `x` float32 `[batch, 3, 48, ancho dinámico]` |
| Salida | `fetch_name_0` float32 `[batch, secuencia, 6906]` |
| SHA-256 de `inference.onnx` | `9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6` |

## Arquitectura y entrenamiento

No se realizó ningún entrenamiento ni conversión propia: según la model card, el artefacto se importó "as published upstream (no conversion)". Se trata de la exportación ONNX (opset 11) del reconocedor PP-OCRv6 tiny de PaddleOCR, con una única entrada `x` de forma `[batch, 3, 48, ancho dinámico]` y una salida `fetch_name_0` de forma `[batch, secuencia, 6906]`. La dimensión de 6906 en el último eje es consistente con una cabeza de clasificación sobre el vocabulario de caracteres del reconocedor, aunque la model card no documenta el desglose del vocabulario ni el tipo de decodificación.

No hay información disponible sobre volumen de datos de entrenamiento, composición del dataset, ni sobre técnicas de ajuste como RLHF o DPO, algo que además no aplica a un modelo de reconocimiento de texto. La única innovación documentada es de empaquetado: un conversor reproducible con toolchain fijado (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64) y verificación de cada fichero con `onnx.checker` y una ejecución de humo en CPU con entradas de ceros.

## Capacidades

- Reconocimiento de texto a partir de imágenes de líneas de texto recortadas, con entrada RGB de 48 píxeles de alto y ancho dinámico.
- Ejecución en navegador mediante `onnxruntime-web`, con selección de proveedor `webgpu` o `wasm`.
- Inferencia local en cliente sin envío de imágenes a un servidor.
- Compatible con cualquier runtime ONNX (ONNX Runtime nativo, entre otros) además del navegador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo de lenguaje: no produce texto libre, sino logits de clasificación por posición.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, visión general): no disponible.
- No incluye la etapa de detección de texto; solo reconocimiento sobre recortes ya localizados.

## Casos de uso

- OCR en aplicaciones web sin backend: el modelo se carga con `onnxruntime-web` desde el propio repositorio de HuggingFace y ejecuta el reconocimiento en el dispositivo del usuario, evitando costes de servidor y problemas de privacidad al no salir las imágenes del navegador.
- Extracción de texto de capturas y fotos en herramientas web: tras un detector de líneas de texto, cada recorte se pasa por `inference.onnx` para obtener la transcripción.
- Digitalización de documentos escaneados en pipelines web: integrado en un flujo de subida de documentos, permite convertir imágenes de páginas en texto indexable sin infraestructura de inferencia dedicada.
- Preprocesado para sistemas de recuperación aumentada (RAG): el texto reconocido de PDF escaneados o imágenes se puede vectorizar e incorporar a una base de conocimiento, aprovechando el tamaño reducido del modelo para procesado por lotes.
- Accesibilidad: lectura en voz alta del texto contenido en imágenes directamente desde el navegador, útil para lectores de pantalla y usuarios con discapacidad visual.
- Anonimización en cliente: detección y reconocimiento local de texto potencialmente sensible (documentos de identidad, tickets) antes de cualquier transmisión, reduciendo la exposición de datos personales.
- Verificación de formularios web: comprobación automática de que una captura subida por el usuario contiene el texto esperado (por ejemplo, un número de referencia) sin salir del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única medición presente es una prueba de humo de verificación, no un benchmark de calidad:

| Prueba | Entrada | Salida | Tiempo |
|---|---|---|---|
| Smoke test (onnxruntime 1.30.0, CPU, entradas de ceros) | `x[1, 3, 48, 320]` | `fetch_name_0[1, 40, 6906]` | 2,4 ms |

No constan valores de precisión, exactitud de reconocimiento ni comparaciones con otros reconocedores en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con un fichero de pesos de 4,26 MB, el modelo cabe holgadamente en menos de 100 MB de memoria, incluyendo activaciones para formas habituales.
- GPU recomendadas: no requiere GPU dedicada. Cualquier acelerador compatible con ONNX Runtime sirve; en navegador, basta con WebGPU disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: `onnxruntime-web` (proveedores `webgpu` y `wasm`), ONNX Runtime nativo y cualquier otro runtime compatible con ONNX. Puede encadenarse tras un detector de texto de PP-OCR.
- Latencia y throughput: el único dato disponible es 2,4 ms por inferencia en la prueba de humo de referencia sobre CPU (Darwin arm64, entradas de ceros y formas declaradas); no equivale a una medición de producción con imágenes reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/pp-ocrv6-tiny-rec` | no disponible | no aplica | Apache-2.0 | ONNX (opset 11) | HuggingFace, 0 descargas, 0 likes |
| `PaddlePaddle/PP-OCRv6_tiny_rec_onnx` (origen) | no disponible | no aplica | Apache-2.0 | ONNX | HuggingFace (commit `2612ab3...`) |
| Otras alternativas de OCR | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia entre este artefacto y el modelo de origen es de empaquetado y trazabilidad: mismos pesos (importados sin conversión), commit fijado, receta reproducible y `manifest.json` con huellas SHA-256. No hay datos de rendimiento que permitan comparar con otros reconocedores de texto.

## Limitaciones y advertencias

- Repositorio sin descargas ni likes, por lo que no existe validación de la comunidad ni evidencia de uso en producción.
- No se han publicado benchmarks de calidad; la verificación se limita a `onnx.checker` y a una ejecución de humo con entradas de ceros.
- No se documentan los idiomas soportados ni el vocabulario de salida de 6906 clases, lo que dificulta mapear los logits a caracteres sin el fichero de etiquetas correspondiente, que no consta en el repositorio.
- Solo realiza reconocimiento: requiere un detector de líneas de texto previo para funcionar sobre imágenes completas.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento con tipografías, idiomas o dominios distintos de los de su entrenamiento.
- El riesgo de "alucinación" en el sentido de los modelos generativos no aplica, pero sí existen errores de reconocimiento cuya tasa se desconoce.
- Licencia Apache-2.0, que permite uso comercial; no obstante, los pesos conservan la licencia del proyecto PaddleOCR y requieren atribución según se indica en su LICENSE.
- La conversión y la model card pertenecen al repositorio de SkillSafe y llevan su propia licencia, distinta de la de los pesos.
- Las formas dinámicas de entrada y salida exigen gestionar en el cliente el ancho variable de imagen y la longitud resultante de la secuencia.
- El estado "registry" del fichero implica que el artefacto se sirve desde `models.skillsafe.ai` una vez vetado, lo que introduce una dependencia de disponibilidad de ese servicio para el flujo previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/pp-ocrv6-tiny-rec
- Modelo base upstream: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx
- Commit upstream fijado: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx/tree/2612ab37152ae0a677521bae4e1e3d4fb4cf7c30
- Receta de conversión de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Licencia de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR/blob/main/LICENSE
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
