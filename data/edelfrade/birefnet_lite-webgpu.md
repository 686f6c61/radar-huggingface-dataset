# edelfrade/BiRefNet_lite-webgpu

## Resumen

BiRefNet_lite-webgpu es una reexportación del modelo BiRefNet-lite (segmentación dicotómica de imágenes de alta resolución, orientada a la eliminación de fondos) adaptada para ejecutarse en cualquier dispositivo con WebGPU a través de Transformers.js. El autor, edelfrade, no entrena un modelo nuevo: parte del export ONNX de onnx-community/BiRefNet_lite-ONNX, cuyo modelo original es de ZhengPeng7, y reescribe el grafo para que sea compatible con los límites de almacenamiento por shader de las GPU.

El problema que resuelve es concreto y de ingeniería: el export original contiene nodos Concat con hasta 1024 entradas y Split con hasta 32 salidas. El backend WebGPU de ONNX Runtime vincula cada entrada y salida como un storage buffer, y las GPU limitan ese número por shader (`maxStorageBuffersPerShaderStage`, mínimo 8, habitualmente 10 o 16), de modo que esos nodos fallan con errores del tipo "Too many storage buffers in shader". Esta versión sustituye 4 nodos Concat y 59 nodos Split por árboles de nodos más pequeños (máximo 6 entradas por Concat y 5 salidas por Split, de forma que cada nodo usa como mucho 7 storage buffers).

La relevancia es práctica: permite ejecutar un modelo de segmentación de primer nivel directamente en el navegador mediante WebGPU, sin backend de servidor, manteniendo salidas idénticas bit a bit al export original en CPU. Se distribuye en fp16 (115 MB) y fp32 (224 MB) bajo licencia MIT, con un script de reconstrucción reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (BiRefNet-lite, segmentación dicotómica de imagen); export ONNX con grafo reescrito para WebGPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | fp16 y fp32 (dos ficheros ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, `onnx/model.onnx`); consumible vía Transformers.js |

## Arquitectura y entrenamiento

El modelo subyacente, BiRefNet-lite, es una red de segmentación binaria de alta resolución basada en Swin Transformer, descrita en el artículo *Bilateral Reference for High-Resolution Dichotomous Image Segmentation* (CAAI AIR 2024). La variante "lite" reduce el coste computacional respecto a BiRefNet completo para permitir despliegue en entornos con recursos limitados, manteniendo la tarea de separar primer plano y fondo con una máscara de un solo canal.

Esta ficha no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponde al trabajo de Zheng Peng et al. La contribución técnica de este repositorio es exclusivamente la reescritura del grafo ONNX: se reemplazan 4 nodos Concat (hasta 1024 entradas) y 59 nodos Split (hasta 32 salidas) por árboles de nodos con como máximo 6 entradas y 5 salidas respectivamente, garantizando que ningún nodo supere los 7 storage buffers por shader. El autor verifica que las salidas son idénticas bit a bit a las del export original en ONNX Runtime CPU, para ambos ficheros, e incluye `rebuild.py` para reproducir la transformación a partir de los SHA-256 documentados del origen.

## Capacidades

- Segmentación de imagen con máscara binaria de primer plano (eliminación de fondo) en una sola pasada.
- Segmentación dicotómica de alta resolución, orientada a objetos con bordes finos y detalles (pelo, siluetas complejas).
- Ejecución en navegador mediante Transformers.js con backend WebGPU.
- Soporte de precisión fp16 (requiere `shader-f16` en WebGPU) y fp32 (WebGPU estándar).
- Salida compatible con el pipeline `image-segmentation` de Transformers.js, que devuelve una máscara (`mask`).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües, de audio ni de modo "thinking".

## Casos de uso

- Eliminación de fondo en el navegador: el modelo se carga con `pipeline("image-segmentation", ..., { device: "webgpu", dtype: "fp16" })` y devuelve la máscara del primer plano, permitiendo editar fotos de producto o retratos sin enviar la imagen a un servidor y sin coste de backend.
- Herramientas de edición de imagen en aplicaciones web (recortes, collage, sustitución de fondo): al ejecutarse en WebGPU localmente, la latencia no depende de la red y se preserva la privacidad del usuario.
- Procesamiento por lotes en el cliente para catálogos de e-commerce: separar automáticamente el producto del fondo antes de subirlo a un CMS, aprovechando que el modelo cabe en 115 MB en fp16.
- Preprocesado para pipelines de visión por computador: generar máscaras de primer plano que alimenten etapas posteriores (reconocimiento, medición, composición) en demos y prototipos sin infraestructura GPU dedicada.
- Aplicaciones de videoconferencia o streaming en el navegador: segmentación de persona fotograma a fotograma para fondos virtuales, siempre que el rendimiento de la GPU del cliente lo permita.
- Investigación y docencia sobre despliegue de modelos en el edge: el repositorio sirve como caso de estudio reproducible de adaptación de grafos ONNX a las restricciones de WebGPU, con script `rebuild.py` y hashes de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de segmentación (IoU, F-measure, MAE) ni de latencia o throughput en WebGPU; únicamente documenta la equivalencia bit a bit de las salidas respecto al export original en CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero fp16 ocupa 115 MB y el fp32 224 MB, por lo que la memoria necesaria en GPU es del orden de esos pesos más las activaciones intermedias de la red Swin.
- GPU recomendadas: cualquier GPU con soporte WebGPU; para fp16 se requiere además la extensión `shader-f16`. No se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Compatibilidad con GPU de consumo: el tamaño reducido (115-224 MB) hace plausible su ejecución en GPU integradas y dedicadas de consumo con WebGPU, aunque no se aportan cifras de latencia ni de memoria pico.
- Opciones de despliegue: Transformers.js con backend WebGPU (vía ONNX Runtime Web); también es posible ejecutar los ficheros ONNX en ONNX Runtime CPU, donde el autor confirma salidas idénticas al original. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| edelfrade/BiRefNet_lite-webgpu | no disponible | no aplica | ONNX (fp16/fp32) | MIT | Grafo reescrito para WebGPU; salidas idénticas al original |
| onnx-community/BiRefNet_lite-ONNX | no disponible | no aplica | ONNX | MIT (heredada) | Export original; falla en WebGPU por límite de storage buffers |
| ZhengPeng7/BiRefNet_lite | no disponible | no aplica | PyTorch | MIT | Modelo original de referencia, entrenado por Zheng Peng et al. |
| CardAnvilModels/BiRefNet-lite-1024-WebGPU | no disponible | no aplica | no disponible | no disponible | Variante WebGPU de la comunidad, mencionada en la búsqueda |
| Nablo404/birefnet-lite-webgpu | no disponible | no aplica | no disponible | no disponible | Variante WebGPU de la comunidad, mencionada en la búsqueda |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación binaria de imagen: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- El rendimiento depende de la implementación WebGPU del navegador y del hardware; en equipos sin WebGPU o sin `shader-f16` debe usarse el fichero fp32.
- La reescritura del grafo está verificada como equivalente solo en ONNX Runtime CPU; no se documenta una verificación numérica exhaustiva en todos los backends WebGPU.
- No se aportan métricas de calidad de segmentación ni evaluación de sesgos; como todo modelo de segmentación, puede fallar en escenas ambiguas, objetos transparentes o bordes de bajo contraste.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de máscaras incorrectas en imágenes fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, manteniendo el aviso de copyright; conviene conservar la atribución a Zheng Peng et al. y a onnx-community.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.
- La fecha de creación indicada (2026-11-08) resulta anómala; conviene verificar la procedencia y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edelfrade/BiRefNet_lite-webgpu
- Modelo base original: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Export ONNX de referencia: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Repositorio oficial de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Variante comunitaria CardAnvilModels/BiRefNet-lite-1024-WebGPU: https://huggingface.co/CardAnvilModels/BiRefNet-lite-1024-WebGPU
- Variante comunitaria Nablo404/birefnet-lite-webgpu: https://huggingface.co/Nablo404/birefnet-lite-webgpu
- Transformers.js: https://github.com/huggingface/transformers.js
- Artículo de referencia: Peng Zheng et al., *Bilateral Reference for High-Resolution Dichotomous Image Segmentation*, CAAI Artificial Intelligence Research, 2024.
