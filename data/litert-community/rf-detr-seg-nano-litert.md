# litert-community/RF-DETR-Seg-Nano-LiteRT

## Resumen

RF-DETR-Seg Nano LiteRT es una conversión del modelo de segmentación de instancias RF-DETR-Seg de Roboflow, adaptada para ejecutarse íntegramente en la GPU de dispositivos móviles mediante el runtime LiteRT (antes TFLite) y su API CompiledModel. El modelo original, desarrollado por Roboflow, es un detector transformer de la familia DETR con backbone DINOv2-S/12, decoder de atención deformable y una cabeza de máscaras estilo ConvNeXt, con 33,6 millones de parámetros y un AP50 de segmentación en COCO de 63,0. Esta versión LiteRT resuelve el problema de que el modelo original no es compatible con la GPU móvil de serie, debido a operaciones como `grid_sample` deformable, selección de consultas en dos etapas o atención SDPA, que el delegado GPU ejecuta incorrectamente. La conversión, realizada con `litert-torch`, reescribe el modelo operación a operación y lo divide en dos grafos GPU con un pequeño paso intermedio en la CPU, logrando así una inferencia 100% en GPU sin recurrir a CPU o ONNX.

El modelo se distribuye como dos archivos TFLite en precisión fp16 (47,0 MB y 14,8 MB) más cuatro constantes en formato binario que se alimentan en tiempo de ejecución. Está pensado para aplicaciones de visión por computador en tiempo real en dispositivos Android y también puede verificarse en Python de escritorio. Su licencia Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales. Es relevante porque demuestra que los transformers de segmentación pueden ejecutarse eficientemente en hardware móvil, un campo dominado tradicionalmente por modelos CNN más simples.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR con backbone DINOv2-S/12, decoder de atención deformable, cabeza de máscaras ConvNeXt |
| Parametros totales | 33,6 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp16 (archivos TFLite) |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT) y archivos binarios (.bin) para constantes |

## Arquitectura y entrenamiento

El modelo original RF-DETR-Seg fue desarrollado por Roboflow y entrenado en el conjunto de datos COCO, alcanzando un AP50 de segmentación de 63,0. La arquitectura combina un backbone DINOv2-S/12 con atención ventana, un decoder basado en atención deformable y una cabeza de máscaras inspirada en ConvNeXt. La conversión a LiteRT no modifica los pesos, sino que reescribe el grafo computacional para hacerlo compatible con el delegado GPU de ML Drift. Para ello, se separa el modelo en dos grafos: el grafo A contiene backbone, encoder y cabezas de propuesta, y el grafo B el decoder, las cabezas de caja/clase y la cabeza de máscaras. Entre ambos grafos se ejecuta un paso en la CPU que combina las propuestas, selecciona las 100 mejores mediante top-k y reparametriza los puntos de referencia. Además, tres constantes de gran tamaño (cls+pos embedding, patch pos-embed y query embedding) se convierten en entradas del grafo porque el delegado GPU ejecuta incorrectamente cadenas de cómputo que consumen constantes horneadas. El tensor de memoria se emite duplicado y se divide por dos en la CPU para evitar que el delegado lo devuelva a cero.

## Capacidades

- Segmentación de instancias: produce máscaras de segmentación a nivel de píxel para cada objeto detectado, con resolución de salida de 78×78 píxeles.
- Detección de objetos: además de las máscaras, genera cajas delimitadoras (coordenadas cxcywh normalizadas) y logits de clase para 91 categorías (COCO).
- Ejecución en GPU móvil: corre íntegramente en el delegado GPU de LiteRT (CompiledModel) sin necesidad de CPU para las operaciones pesadas, lo que reduce la latencia y el consumo energético.
- Dos grafos con paso host intermedio: el diseño permite que operaciones incompatibles con GPU (top-k, gather, reparametrización) se ejecuten en la CPU entre los dos grafos, manteniendo el resto en GPU.
- Entrada de imagen fija: acepta imágenes RGB de 312×312 píxeles normalizadas con media y desviación de ImageNet.
- Compatibilidad multiplataforma: disponible para Android (Kotlin) y Python de escritorio mediante la API CompiledModel de `ai_edge_litert`.

## Casos de uso

- Segmentación de instancias en tiempo real en dispositivos móviles: una aplicación de cámara puede contar y separar objetos individuales (personas, vehículos, animales) en una escena, gracias a la inferencia en GPU y la salida de máscaras por instancia.
- Realidad aumentada: superponer objetos virtuales sobre el mundo real requiere separar con precisión los objetos físicos del fondo; este modelo proporciona máscaras por instancia que permiten ocluir correctamente los elementos virtuales.
- Control de calidad industrial: en una línea de producción, el modelo puede segmentar defectos en piezas o productos a partir de imágenes capturadas con un smartphone o cámara integrada, identificando regiones exactas de anomalías.
- Análisis de imágenes aéreas o de satélite: segmentar edificios, carreteras o vegetación en imágenes tomadas por drones, con la ventaja de poder ejecutarse en el propio dron o en un dispositivo móvil de campo.
- Asistencia visual para personas con discapacidad: una aplicación que describe el entorno puede usar la segmentación para identificar y localizar objetos específicos (sillas, mesas, obstáculos) y proporcionar información espacial.
- Robótica móvil: robots de bajo coste equipados con una GPU móvil pueden segmentar obstáculos y objetos de interés en tiempo real para navegación o manipulación, sin depender de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato proporcionado es el AP50 de segmentación en COCO del modelo original RF-DETR-Seg, que es 63,0. No hay comparaciones con otros modelos en la documentación de esta conversión LiteRT.

| Metrica | Valor |
|---|---|
| COCO seg AP50 (modelo original) | 63,0 |

## Requisitos de hardware

- GPU móvil compatible con el delegado GPU de LiteRT (ML Drift), como Adreno (Qualcomm), Mali (ARM) o Apple GPU. El ejemplo de la documentación usa un Pixel 8a.
- Tamaño de los archivos: 47,0 MB (grafo A) + 14,8 MB (grafo B) + aproximadamente 1,1 MB de constantes binarias.
- VRAM estimada: no disponible, pero al ser modelos fp16 de tamaño reducido, se espera que quepan en la memoria de GPU de cualquier smartphone moderno.
- No requiere GPU de servidor; está diseñado para inferencia en dispositivo.
- Despliegue: Android con Kotlin usando `CompiledModel` de LiteRT, o Python con `ai_edge_litert` para verificación en escritorio.
- Latencia y throughput: no se proporcionan datos numéricos. La ejecución en GPU móvil sugiere tiempos de inferencia del orden de decenas de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos completos de modelos comparables en la información proporcionada. El modelo base es RF-DETR-Seg de Roboflow, del cual esta conversión es una adaptación a LiteRT. También existe RF-DETR-Nano-LiteRT, la versión de detección (sin segmentación) del mismo autor, pero no se han publicado especificaciones detalladas de ninguno de ellos en las fuentes consultadas.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| RF-DETR-Seg-Nano-LiteRT (este) | Segmentación de instancias | 33,6 M | no aplica | COCO seg AP50 63,0 | Apache 2.0 |
| RF-DETR-Seg (original) | Segmentación de instancias | 33,6 M | no aplica | COCO seg AP50 63,0 | Apache 2.0 |
| RF-DETR-Nano-LiteRT | Detección de objetos | no disponible | no aplica | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- Entrada de imagen fija a 312×312 píxeles; no se admite redimensionado dinámico ni otras resoluciones.
- Solo precisión fp16; no se ofrecen versiones cuantizadas a int8, lo que puede limitar su uso en hardware sin soporte fp16.
- Requiere un paso intermedio en la CPU entre los dos grafos, lo que añade una pequeña latencia adicional y complica la integración (hay que gestionar dos grafos y constantes externas).
- No hay información sobre sesgos del modelo original; al estar entrenado en COCO, puede tener un rendimiento deficiente en categorías poco representadas o en dominios muy diferentes.
- Al ser un modelo de visión, no presenta riesgo de alucinación textual, pero sí puede producir falsos positivos o negativos en la detección y segmentación.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- La conversión está optimizada para el delegado GPU de ML Drift; puede no funcionar correctamente en otros delegados o en CPU sin modificaciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/litert-community/RF-DETR-Seg-Nano-LiteRT)
- [Repositorio oficial de RF-DETR (Roboflow)](https://github.com/roboflow/rf-detr)
- [Referencia de API de RF-DETR Seg Nano](https://rfdetr.roboflow.com/latest/reference/seg_nano/)
- [Repositorio LiteRT-Models con RF-DETR](https://github.com/john-rocky/LiteRT-Models/tree/main/rfdetr)
