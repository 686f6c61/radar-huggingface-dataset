# AnnotateIt/edgecrafter-ecdet-x-onnx

## Resumen

EdgeCrafter ECDet-X — FP32 ONNX es una conversión independiente, realizada por AnnotateIt, del checkpoint oficial de EdgeCrafter entrenado únicamente con COCO. No es un modelo de lenguaje: es un detector de objetos de tipo transformer con 300 consultas de salida (esquema DETR), que devuelve `pred_logits` de forma [batch, 300, 80] y `pred_boxes` de forma [batch, 300, 4] en formato cxcywh normalizado. El proyecto original es EdgeCrafter, de Intellindust-AI-Lab, y la exportación está anclada a la revisión de código `b17f0f340af687e7adf2dff42a49e2eb8250ee20`.

El repositorio publica un único archivo ONNX FP32 de 197.214.708 bytes, opset 17, con SHA-256 `7c086440eda87a120acb940dc5e48730bccdeb3641773a4a0d2be94eed424926`. Ese tamaño equivale, a 4 bytes por parámetro, a unos 49 millones de parámetros, aunque el autor no confirma el recuento oficial. La entrada es una imagen float32 [batch, 3, 640, 640] en RGB, con redimensionado bilinear tipo "stretch", división por 255 y normalización ImageNet. El grafo incluye el TopK interno del modelo, pero no el postprocesado: AnnotateIt aplica externamente sigmoid, la mejor clase por consulta, un filtro de confianza por defecto de 0,4 y el escalado de cajas, sin NMS.

Su relevancia es práctica: al ser un grafo ONNX autocontenido y ligero (0,2 GB de repositorio) puede ejecutarse en CPU y en el navegador mediante onnxruntime-web con WASM, lo que habilita detección de objetos en local sin servidor ni transferencia de imágenes. La contrapartida es que la validación publicada es una muestra de humo de 12 imágenes y no una evaluación completa de COCO AP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector transformer tipo DETR con 300 consultas de salida; sin NMS en el postprocesado. Detalles de backbone, número de capas y mecanismo de atención: no disponibles |
| Parámetros totales | No confirmados por el autor; ~49 millones estimados a partir del tamaño del archivo FP32 (197.214.708 bytes / 4 bytes por parámetro) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen de tamaño fijo [batch, 3, 640, 640] |
| Tipos de cuantización | FP32 (esta conversión). Existe una variante INT8 experimental, pero solo para el modelo ECDet-S, no para ECDet-X |
| Idiomas soportados | No aplica (modelo de visión, sin capacidades de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 17, archivo único FP32, 197.214.708 bytes |
| Tarea | Detección de objetos (`object-detection`) |
| Clases | 80 clases de COCO (mapeo documentado en `config.json`) |
| Entrada | `images` float32 [batch, 3, 640, 640], RGB, redimensionado bilinear stretch, /255, normalización ImageNet |
| Salidas | `pred_logits` [batch, 300, 80] logits crudos; `pred_boxes` [batch, 300, 4] cxcywh normalizadas |
| Postprocesado | Externo al grafo: sigmoid, mejor clase por consulta, filtro de confianza (0,4 por defecto), escalado de cajas, sin NMS |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicación | 18 de septiembre de 2026 (última actualización: 18 de septiembre de 2026) |

## Arquitectura y entrenamiento

La información disponible describe la interfaz del grafo, no su construcción interna. Los tensores de salida (300 consultas, logits de clase por consulta y cajas normalizadas, sin NMS y con TopK interno) corresponden al esquema de los detectores transformer de tipo DETR, que sustituyen las anclas y el supresor de no máximos por un conjunto fijo de predicciones y un emparejamiento bipartito durante el entrenamiento. Los detalles concretos de la arquitectura (backbone, profundidad, tipo de atención, resolución de los mapas de características) no están disponibles en la información proporcionada.

Tampoco se detallan el número de tokens o imágenes de entrenamiento, la composición exacta del dataset (el modelo card indica únicamente `detection-datasets/coco`), ni si hubo fases de ajuste con RLHF/DPO, que en cualquier caso no aplican a un detector. Lo que sí está documentado es el proceso de exportación y verificación: carga estricta del checkpoint, paso por el ONNX checker con inferencia de formas, comprobaciones de lote 1 y 2, y dos exportaciones independientes que resultan byte a byte idénticas, un indicio de reproducibilidad de la conversión. Los scripts de exportación y verificación (`export_raw_onnx.py`, `verify_onnx.py` con `--variant ecdet_x`) se incluyen en el repositorio.

## Capacidades

- Detección de objetos sobre las 80 clases de COCO, con hasta 300 cajas por imagen en una sola pasada.
- Salida en formato conjunto (set prediction), sin necesidad de aplicar NMS: cada consulta produce una clase ganadora y una caja.
- Inferencia por lotes: se han verificado lotes de tamaño 1 y 2 con formas estáticas [batch, 3, 640, 640].
- Ejecución en navegador real: validado en Chrome con onnxruntime-web 1.24.3 sobre WASM y un solo hilo, con el parser de producción de AnnotateIt.
- Ejecución en CPU con ONNX Runtime nativo, además del backend web.
- Reproducibilidad de la exportación: dos exportaciones independientes son idénticas a nivel de bytes.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta otras tareas de visión (captioning, VQA, segmentación, OCR): solo detección de cajas.
- No tiene capacidades multilingües ni procesamiento de audio.

## Casos de uso

- Preetiquetado en herramientas de anotación: el modelo genera cajas y clases sobre las 80 categorías de COCO para que un anotador humano las revise y corrija, reduciendo el trabajo manual en pipelines de etiquetado de imágenes.
- Detección en el navegador sin servidor: al ejecutarse con onnxruntime-web sobre WASM, el modelo puede integrarse en aplicaciones web que procesan la imagen en el cliente, sin enviar datos a un backend ni incurrir en costes de inferencia en la nube.
- Procesamiento por lotes en CPU: con pesos FP32 de ~197 MB y sin dependencia de GPU, encaja en trabajos offline que recorren datasets completos en máquinas sin acelerador.
- Control de calidad de anotaciones existentes: comparar las detecciones del modelo contra las etiquetas de un dataset COCO permite detectar cajas ausentes o mal clasificadas en el corpus.
- Filtrado y moderación de imágenes por categoría: las 80 clases de COCO incluyen personas, vehículos, animales y objetos domésticos, lo que permite reglas simples de filtrado o enrutado antes de un pipeline más costoso.
- Recorte de regiones para etapas posteriores: las cajas predichas pueden alimentar un clasificador, un lector de matrículas o un OCR externos, reduciendo el área a procesar en cada etapa.
- Detección en el borde y en dispositivos con pocos recursos: el tamaño del grafo y la validación en WASM de un hilo apuntan a escenarios de baja capacidad, aunque la ejecución en móvil no está validada por el autor.
- Evaluación y comparación de exportaciones: servir como referencia FP32 para medir la degradación de variantes cuantizadas o de otros formatos de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. En concreto, no hay evaluación completa de COCO AP; lo que el autor publica es evidencia de validación y paridad numérica:

| Prueba | Alcance | Resultado |
|---|---|---|
| Carga estricta del checkpoint | 1 checkpoint | Superada |
| ONNX checker e inferencia de formas | Grafo completo | Superado |
| Comprobaciones de lote | Tamaños 1 y 2 | Superadas |
| Reproducibilidad de la exportación | Dos exportaciones independientes | Byte a byte idénticas |
| PyTorch frente a ONNX Runtime nativo (numérico) | 15 casos numéricos | Documentados |
| PyTorch frente a ONNX Runtime nativo (semántico) | 12 imágenes de COCO val2017 | Todas las comparaciones semánticas superadas con confianza 0,4; muestra de humo, no una evaluación COCO AP completa |
| Paridad estricta de tensores crudos | `allclose` con rtol=0,001 y atol=0,0001 | Falló en `image_000000037777.jpg` y `image_000000458054.jpg`; aceptada solo por la vía secundaria documentada |
| Navegador real (Chrome, onnxruntime-web 1.24.3, WASM, un hilo) | 12 imágenes | Superado con el parser de producción de AnnotateIt |
| WebGPU, móvil y otros navegadores | No ejecutado | No validado |

La vía secundaria aplicada en los dos casos que no pasan la paridad estricta exige como máximo cuatro filas modificadas por imagen, confianza inferior a 0,3 en ambos runtimes, clase ganadora idéntica, error de sigmoid por debajo de 0,001 y paridad estricta de cajas. Los tiempos medidos en el informe de navegador son diagnósticos, no un benchmark controlado.

## Requisitos de hardware

- Huella de pesos: 197,2 MB en FP32, lo que supone menos de 1 GB de memoria para los pesos; el consumo total depende del runtime y de las activaciones.
- GPU: no se especifica ninguna recomendación de GPU. Cualquier GPU de consumo con suficiente memoria libre puede alojar el grafo, pero no hay cifras de latencia ni de throughput por modelo.
- Viabilidad en hardware de consumo: sí. El modelo cabe en CPU y en GPUs de gama baja; el tamaño es de 0,2 GB de repositorio, muy por debajo de los modelos de lenguaje habituales.
- CPU: viable y de hecho es el entorno validado, con WASM de un solo hilo en Chrome.
- Navegador: onnxruntime-web 1.24.3 sobre WASM validado en Chrome; WebGPU, móvil y otros navegadores no han sido validados. Los modelos grandes requieren más RAM y más tiempo de CPU.
- Opciones de despliegue: ONNX Runtime nativo (CPU y, previsiblemente, proveedores de ejecución GPU, aunque no se documentan), onnxruntime-web en el cliente, e integración en la aplicación de AnnotateIt. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector ONNX.
- Latencia y throughput: no disponibles. El propio autor advierte que los tiempos del informe de navegador son diagnósticos y no un benchmark controlado.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para EdgeCrafter ECDet-X, de modo que la comparación se limita a variantes de la misma familia publicadas por el mismo autor:

| Modelo | Formato | Tamaño | Precisión | Contexto / entrada | Licencia | Notas |
|---|---|---|---|---|---|---|
| EdgeCrafter ECDet-X ONNX (este) | ONNX FP32, opset 17 | 197.214.708 bytes (~49 M de parámetros estimados) | FP32 | [batch, 3, 640, 640] | Apache-2.0 | Validado en Chrome/WASM; WebGPU y móvil no validados |
| EdgeCrafter ECDet-S ONNX | ONNX | No disponible | No disponible | No disponible | Apache-2.0 | Variante menor de la misma familia, publicada por AnnotateIt |
| EdgeCrafter ECDet-S ONNX INT8 experimental | ONNX INT8 | 61 % menor que la base FP32 equivalente | Retiene una precisión COCO similar, según el autor | No disponible | Apache-2.0 | Aproximadamente un 2 % más lento en el benchmark con hilos de ONNX Runtime Web; no lo usa AnnotateIt ni figura en su catálogo |

Frente a otros detectores tipo DETR de uso común (RT-DETR, DINO, деformable DETR y similares), no se dispone en la información proporcionada de parámetros, contexto ni resultados comparables, por lo que la comparación cuantitativa queda como no disponible. La diferencia funcional relevante de esta publicación es su formato ONNX autocontenido y su validación en navegador, no una mejora medida de precisión.

## Limitaciones y advertencias

- Cobertura de clases restringida: solo las 80 categorías de COCO. Detectar clases personalizadas exige reentrenamiento o ajuste, que esta conversión no cubre.
- Sin evaluación COCO AP: la validación publicada es una muestra de humo de 12 imágenes de COCO val2017, insuficiente para estimar la precisión real del modelo en producción.
- Paridad numérica no bit a bit: la comprobación estricta `allclose` (rtol=0,001, atol=0,0001) falla en dos de las doce imágenes y solo se acepta por una vía secundaria documentada. Bajar el umbral de confianza puede exponer predicciones de baja confianza cuya equivalencia entre runtimes no está garantizada.
- Cajas fuera del rango normalizado: los tensores crudos de `pred_boxes` presentan un mínimo de 0,018269797787070274 y un máximo de 1,647832989692688, por lo que es obligatorio recortar a [0,1] antes de escalar a píxeles.
- Preprocesado con redimensionado stretch: el contrato de importación usa redimensionado bilinear que estira la imagen a 640x640 sin preservar la relación de aspecto, lo que puede deformar objetos alargados si no se replica exactamente.
- Conversión no oficial: se trata de una exportación independiente de AnnotateIt, no avalada por los autores de EdgeCrafter. Cualquier incidencia debe contrastarse contra el proyecto original.
- Validación de plataforma limitada: WebGPU, móvil y navegadores distintos de Chrome no han sido validados; los modelos grandes requieren más RAM y tiempo de CPU.
- Sin postprocesado embebido: el grafo no incluye sigmoid, filtrado por confianza ni escalado de cajas, de modo que cada integrador debe reimplementar el contrato y verificar su equivalencia.
- Licencia: Apache-2.0 permite uso comercial, pero deben conservarse los archivos LICENSE y NOTICE y revisarse las condiciones del proyecto original.
- Alucinación: como cualquier detector, puede producir falsos positivos en categorías ausentes y cajas sobre regiones sin objeto; el umbral de confianza es el principal control disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnnotateIt/edgecrafter-ecdet-x-onnx
- Proyecto original EdgeCrafter (Intellindust-AI-Lab): https://github.com/Intellindust-AI-Lab/EdgeCrafter (revisión `b17f0f340af687e7adf2dff42a49e2eb8250ee20`)
- Variante ECDet-S ONNX: https://huggingface.co/AnnotateIt/edgecrafter-ecdet-s-onnx
- Variante ECDet-S ONNX INT8 experimental: https://huggingface.co/AnnotateIt/edgecrafter-ecdet-s-onnx-int8-experimental
- Perfil de AnnotateIt en HuggingFace: https://huggingface.co/AnnotateIt
- Sitio de AnnotateIt: https://annotateit.ai/
- Aplicación de AnnotateIt: https://app.annotateit.ai/
- Documentación de AnnotateIt: https://annotateit.ai/docs/
- Dataset de entrenamiento: `detection-datasets/coco`
