# Saimon8420/ormbg-web

## Resumen

ORMBG-web es una compilación compacta de ORMBG (Open Remove Background Model, desarrollado por Maximilian Schirrmacher) empaquetada específicamente para ejecutar eliminación de fondo directamente en el navegador mediante Transformers.js y onnxruntime-web. Se trata de una versión optimizada del modelo base onnx-community/ormbg-ONNX, que a su vez deriva de la arquitectura ISNet orientada a segmentación de imágenes. El repositorio lo publica el usuario Saimon8420 y se emplea en la herramienta gratuita Doetra Background Remover.

El principal valor de esta build es su tamaño: pasa de 176 MB (referencia fp32) a 44 MB combinando pesos int8 por canal en las convoluciones con fp16 en el resto de tensores grandes, manteniendo el cómputo en fp32. Según el autor, la diferencia de máscara frente a fp32 es de 0,2/255 de media y más del 99,93 % de los píxeles son idénticos tras aplicar umbralización. Además, funciona sobre WebGPU incluso en equipos sin soporte de `shader-f16`.

El modelo no es un modelo de lenguaje, sino un modelo de visión especializado en segmentación binaria de imagen (foreground/background). Recibe un tensor de píxeles de forma `[1, 3, 1024, 1024]` normalizado en `[0, 1]` y devuelve un canal alfa `[1, 1, 1024, 1024]` también en `[0, 1]`. Actualmente no registra descargas ni interacciones y no publica idiomas soportados, algo esperable al tratarse de una tarea puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ISNet (segmentación dicotómica de imagen), exportada a ONNX; grafo actualizado de opset 11 a opset 17 |
| Parametros totales | no disponible (los pesos fp32 de referencia ocupan aproximadamente 176 MB; la build cuantizada, 44 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 1024 x 1024 píxeles |
| Tipos de cuantizacion | int8 por canal (`DequantizeLinear`) en convoluciones, fp16 en los tensores grandes restantes, cómputo en fp32 |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (consumible vía transformers.js / onnxruntime-web) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de ORMBG, cuya base es una red ISNet de segmentación de imágenes con predicción de canal alfa. El repositorio se describe como una reexportación optimizada del modelo onnx-community/ormbg-ONNX: el grafo se eleva de opset 11 a opset 17 y se aplica cuantización mixta. Las convoluciones usan pesos int8 por canal con nodos `DequantizeLinear`, los tensores grandes restantes se guardan en fp16 y el cómputo se ejecuta en fp32. El resultado es un fichero de 44 MB frente a los 176 MB del original.

No se han facilitado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otros detalles del pipeline de entrenamiento del modelo original. Tampoco se documenta si hubo ajuste fino adicional más allá de la reexportación y cuantización descritas. La innovación técnica destacable de esta build es la degradación prácticamente despreciable de la máscara (media de 0,2/255 y más del 99,93 % de coincidencia tras umbralizar) a cambio de reducir el peso a la cuarta parte, permitiendo ejecución en WebGPU sin requerir soporte de `shader-f16`.

## Capacidades

- Eliminación de fondo: genera una máscara alfa de primer plano/fondo a partir de una imagen de entrada de 1024 x 1024 píxeles.
- Segmentación de imagen binaria (pipeline `image-segmentation`), sin etiquetado semántico de múltiples clases.
- Inferencia en navegador mediante Transformers.js y onnxruntime-web.
- Ejecución acelerada por WebGPU, incluyendo hardware sin soporte de `shader-f16`.
- Salida en formato de canal alfa reutilizable para composición sobre nuevos fondos.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de capacidades multilingües, de generación de texto, código, matemáticas, audio ni visión semántica general.

## Casos de uso

- Eliminación de fondos para comercio electrónico: procesar fotos de producto en el propio navegador del usuario para generar imágenes con fondo transparente o blanco sin depender de un backend, gracias a los 44 MB del modelo y a la ejecución vía WebGPU.
- Editores de imagen web: integrar la generación de máscaras en herramientas tipo canvas o aplicaciones de retoque, donde el usuario recorta el sujeto y lo recompone sobre otro fondo en tiempo real.
- Avatares y fotos de perfil: permitir que el usuario suba una foto y obtenga automáticamente un recorte limpio para avatares, con el modelo ejecutándose íntegramente en el cliente y evitando enviar imágenes a servidores externos.
- Herramientas de diseño gráfico y collage: generar máscaras de sujeto para componer escenas, carteles o miniaturas sin necesidad de herramientas de selección manual.
- Privacidad por diseño: al ejecutarse en local, imágenes sensibles (documentos, personas) no salen del dispositivo, lo que resulta adecuado para aplicaciones con requisitos de confidencialidad.
- Procesamiento por lotes en el cliente: catálogos de producto o bibliotecas de imágenes donde se aplica la segmentación repetidamente desde el navegador, reduciendo costes de infraestructura de servidor.
- Fondos virtuales en videollamada: aplicar la máscara fotograma a fotograma para sustituir el fondo en tiempo real, apoyándose en la ejecución acelerada por WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje. El único dato cuantitativo aportado por el autor es la fidelidad de la cuantización respecto a la versión fp32:

| Metrica | Valor |
|---|---|
| Diferencia media de máscara frente a fp32 | 0,2/255 |
| Píxeles idénticos tras umbralización | más del 99,93 % |
| Tamano de la build cuantizada | 44 MB |
| Tamano de la referencia fp32 | 176 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero de pesos ocupa 44 MB, por lo que el consumo depende principalmente de los tensores intermedios de una entrada de 1024 x 1024 (decenas o pocos cientos de MB, no especificado en la información disponible).
- GPU recomendadas: no se especifican modelos concretos. Al ejecutarse en navegador sobre WebGPU, es compatible con GPUs de escritorio y portátiles modernas, así como con gráficas integradas, siempre que el navegador exponga WebGPU.
- Compatibilidad con GPU de consumo: sí, en principio cabe en cualquier GPU de consumo y también en hardware integrado o móvil, dado el reducido tamaño del modelo.
- Funciona sin soporte de `shader-f16`, lo que amplía el rango de GPUs compatibles con WebGPU.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) y onnxruntime-web; el uso documentado es `AutoModel.from_pretrained('Saimon8420/ormbg-web', { dtype: 'fp32', device: 'webgpu' })` junto con `AutoProcessor`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saimon8420/ormbg-web | ONNX | 44 MB | int8/fp16 con cómputo fp32 | Apache-2.0 | HuggingFace, transformers.js/WebGPU |
| onnx-community/ormbg-ONNX (modelo base) | ONNX | 176 MB | fp32 | Apache-2.0 | HuggingFace |
| Otras familias de eliminación de fondo (RMBG, U²-Net, MODNet, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más fiable es con el propio modelo base onnx-community/ormbg-ONNX, del que esta build reduce el peso a la cuarta parte manteniendo la máscara prácticamente idéntica. Para alternativas de otras familias no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de segmentación binaria: no etiqueta clases ni distingue múltiples objetos de forma semántica, solo separa primer plano y fondo.
- La entrada está fijada a 1024 x 1024 píxeles; otras resoluciones requieren redimensionado previo por parte del procesador.
- La cuantización int8/fp16 introduce una desviación pequeña pero real (media de 0,2/255); en aplicaciones que exijan máxima precisión podría preferirse la versión fp32 de 176 MB.
- No se dispone de información sobre sesgos del dataset de entrenamiento original ni sobre su comportamiento con determinados tipos de imagen (pelo, transparencias, bordes finos).
- Riesgo de máscaras imperfectas en imágenes complejas, propio de los modelos de segmentación dicotómica; se recomienda validación en el dominio de uso concreto.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta idiomas ni conversación.
- Licencia Apache-2.0, permisiva para uso comercial, siempre que se conserve la atribución correspondiente a ORMBG (Maximilian Schirrmacher) y a onnx-community.
- Depende de la disponibilidad de WebGPU en el navegador para el mejor rendimiento; sin ella, el rendimiento depende del fallback a WebAssembly.
- No se documentan versiones, histórico de cambios ni soporte oficial por parte del autor del modelo original para esta reexportación concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saimon8420/ormbg-web
- Modelo base ONNX: https://huggingface.co/onnx-community/ormbg-ONNX
- Repositorio original de ORMBG: https://github.com/schirrmacher/ormbg
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Aplicación que lo utiliza (Doetra Background Remover): https://doetra.com
