# qualcomm/RepViT

## Resumen

RepViT es un backbone de clasificación de imágenes de tipo CNN pura diseñado para dispositivos móviles y embebidos. Este repositorio concreto, publicado por Qualcomm, no introduce un entrenamiento nuevo: empaqueta la implementación de RepViT del grupo THU-MIG y ofrece assets pre-exportados y optimizados para ejecutarse sobre la NPU Hexagon de los SoC Qualcomm Snapdragon y Dragonwing, además de los pesos en PyTorch.

El modelo parte del checkpoint de ImageNet, acepta entradas de 224x224 píxeles, tiene 22,9 millones de parámetros y ocupa 91 MB en precisión float. La model card indica que la familia RepViT supera el 80% de top-1 en ImageNet con 1 ms de latencia en un iPhone 12, trasladando a una CNN eficiente ideas estructurales de los Vision Transformers.

Su relevancia es práctica: es una pieza de visión lista para producción en el borde, con exportaciones listas para ONNX, QNN_DLC (QAIRT 2.45) y TFLite, y con latencias medidas sobre NPU que van de 1,45 ms en Snapdragon 8 Elite Gen 5 a 14,44 ms en plataformas de automoción como el SA7255P. No es un modelo de lenguaje ni generativo: no admite texto, tool calling ni agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pura (pure CNN) con diseños estructurales eficientes inspirados en Vision Transformers (RepViT) |
| Parametros totales | 22,9 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; entrada de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible; los assets publicados son en precisión float y la librería AI Hub Models permite exportar con configuraciones propias sin detallar esquemas de cuantización |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch; exportaciones ONNX, QNN_DLC y TFLITE, todas en float |
| Tarea (pipeline) | image-classification |
| Resolucion de entrada | 224x224 |
| Tamaño del modelo (float) | 91 MB |
| Checkpoint | ImageNet |
| Libreria | pytorch |
| Entorno de exportacion | QAIRT 2.45, ONNX Runtime 1.27.1 (assets v0.62.0) |

## Arquitectura y entrenamiento

RepViT es una CNN pura que integra en el diseño convolucional una serie de decisiones arquitectónicas propias de los Vision Transformers (bloques con reparametrización estructural, uso de convoluciones depthwise y apilamiento tipo stage/block que permite reparametrizar en tiempo de inferencia). El objetivo declarado por el autor es obtener la eficiencia de una CNN móvil manteniendo la precisión de un ViT ligero, lo que se traduce en más de un 80% de top-1 en ImageNet con 1 ms de latencia en un iPhone 12 según la model card.

Este repositorio de Qualcomm es una redistribución optimizada: parte de la implementación de THU-MIG, usa el checkpoint de ImageNet y añade la compilación, el perfilado y la evaluación mediante Qualcomm AI Hub Workbench. No se documentan en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset más allá de ImageNet, ni si hubo fases de ajuste fino, RLHF o DPO (procedimientos que, por otra parte, no aplican a un clasificador de imágenes). Tampoco se especifica a qué variante de la familia RepViT corresponde exactamente el recuento de 22,9 M parámetros.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta del conjunto ImageNet a una imagen de entrada de 224x224 píxeles.
- Backbone de características: la propia model card lo etiqueta como `backbone`, por lo que puede usarse como extractor congelado o ajustado para tareas posteriores (detección, segmentación, recuperación de imágenes).
- Inferencia en NPU: ejecución sobre la unidad Hexagon de los SoC Qualcomm mediante QAIRT, ONNX Runtime o TFLite, con compilación específica por dispositivo.
- Exportación personalizable: la librería `qai_hub_models` permite reexportar con pesos ajustados, formas de entrada propias y configuraciones de dispositivo/runtime distintas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de razonamiento (thinking), visión-lenguaje, audio ni generación de imágenes.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones móviles: con latencias de 1,45 a 2,6 ms por inferencia en Snapdragon 8 Gen 3 / 8 Elite (ONNX o QNN_DLC), permite etiquetar la cámara en directo sin descargar cómputo a la nube.
- Backbone para detección y segmentación en el borde: al estar etiquetado como `backbone` y ocupar 91 MB en float, se puede injertar en cabeceras de detección o segmentación y mantener el pipeline completo dentro de la NPU.
- Organización y etiquetado automático de galerías fotográficas: clasificación por lotes en el propio dispositivo para agrupar, buscar y archivar imágenes sin enviar datos personales a servidores externos.
- Moderación de contenido en el dispositivo: filtrado previo de imágenes potencialmente no deseadas antes de subirlas a una plataforma, con el ahorro de ancho de banda y las garantías de privacidad que implica el procesamiento local.
- Control de calidad en líneas de producción: cámaras industriales conectadas a plataformas Dragonwing (QCS8550, IQ-8275, IQ-9075, con 3,18-4,77 ms por inferencia) para verificar piezas o clasificar defectos a pie de línea.
- Sistemas de visión para automoción: las exportaciones QNN_DLC cubren SA8775P, SA8650P, SA8255P, SA8295P y SA7255P (4,85-14,44 ms), plataformas habituales en cabina y ADAS, donde un clasificador ligero puede alimentar funciones de monitorización o asistencia.
- Robótica e IoT con restricciones térmicas y de energía: al ser una CNN pura de 22,9 M parámetros, el coste por inferencia es bajo y encaja en dispositivos alimentados por batería.
- Preetiquetado a gran escala en pipelines de datos: uso del modelo como clasificador preliminar para anotar automáticamente conjuntos masivos y reservar la revisión humana a los casos de baja confianza.

## Benchmarks y rendimiento

La model card no publica resultados de precisión (top-1, top-5) para este checkpoint concreto; solo afirma que la familia RepViT supera el 80% de top-1 en ImageNet con 1 ms de latencia en un iPhone 12. Por tanto, no hay cifras de MMLU, HumanEval o GSM8K (no aplican) ni de precisión verificable en este repositorio.

Sí se publican latencias medidas con Qualcomm AI Hub Workbench sobre NPU, en precisión float:

| Dispositivo | Runtime | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | 1,452 | 0 - 114 |
| Snapdragon 8 Elite Gen 5 Mobile | QNN_DLC | 1,504 | 1 - 104 |
| Snapdragon X2 Elite | ONNX | 1,699 | 2 - 2 |
| Snapdragon 8 Elite Mobile / Dragonwing Q-8750 | ONNX | 1,796 | 0 - 112 |
| Snapdragon 8 Elite Mobile / Dragonwing Q-8750 | QNN_DLC | 1,903 | 1 - 103 |
| Snapdragon X2 Elite | QNN_DLC | 2,053 | 1 - 1 |
| Snapdragon 8 Gen 3 Mobile | ONNX | 2,384 | 0 - 196 |
| Snapdragon 8 Gen 3 Mobile | QNN_DLC | 2,567 | 0 - 179 |
| Snapdragon 8 Gen 3 Mobile | TFLITE | 2,556 | 0 - 231 |
| Dragonwing QCS8550 (Proxy) | ONNX | 3,184 | 0 - 49 |
| Dragonwing QCS8550 (Proxy) | QNN_DLC | 3,505 | 1 - 166 |
| Dragonwing QCS8550 (Proxy) | TFLITE | 3,470 | 0 - 2 |
| Snapdragon X Elite / Dragonwing IQ-X7181 | ONNX | 3,324 | 47 - 47 |
| Snapdragon X Elite / Dragonwing IQ-X7181 | QNN_DLC | 3,895 | 1 - 1 |
| Dragonwing IQ-9075 | ONNX | 4,327 | 0 - 4 |
| Dragonwing IQ-9075 | QNN_DLC | 4,579 | 1 - 3 |
| Dragonwing IQ-8275 | ONNX | 4,633 | 0 - 4 |
| Dragonwing IQ-8275 | QNN_DLC | 4,768 | 1 - 4 |
| Dragonwing IQ-8275 | TFLITE | 4,766 | 0 - 51 |
| Dragonwing IQ-9075 (variante TFLITE no detallada) | - | no disponible | no disponible |
| SA8775P / SA8650P / SA8255P | QNN_DLC | 4,848 | 1 - 103 |
| SA8775P | TFLITE | 4,869 | 0 - 164 |
| SA8295P | QNN_DLC | 9,646 | 1 - 106 |
| Snapdragon 8 Gen 1 Mobile / QCS8450 | ONNX | 11,538 | 0 - 196 / 1 - 193 |
| Snapdragon 8 Gen 1 Mobile / QCS8450 | QNN_DLC | 12,253 | 0 - 179 / 0 - 177 |
| Snapdragon 8 Gen 1 Mobile | TFLITE | 12,274 | 0 - 226 |
| SA7255P | QNN_DLC | 14,438 | 1 - 102 |

La tabla de TFLITE de la información proporcionada aparece truncada, por lo que las filas TFLITE listadas son solo las visibles. En todos los casos la unidad de cómputo principal es la NPU.

## Requisitos de hardware

- VRAM/peso del modelo: 91 MB en float para los pesos; la memoria pico medida en dispositivo varía entre 1 MB y 231 MB según runtime y plataforma (los valores más altos corresponden a Snapdragon 8 Gen 1, QCS8450 y Snapdragon 8 Gen 3).
- GPU recomendadas: no disponible; la model card no documenta ejecución en GPU de escritorio o servidor. El destino declarado es la NPU de Qualcomm.
- Cabe en GPU de consumo: sí, por tamaño (91 MB de pesos), cualquier GPU con más de 1 GB de memoria puede alojarlo en PyTorch; no se publican latencias para ese escenario.
- Despliegue: Qualcomm AI Hub Workbench y librería `qai_hub_models` (v0.62.0), QAIRT 2.45, ONNX Runtime 1.27.1, TFLITE y checkpoints PyTorch.
- Latencia: de 1,45 ms (Snapdragon 8 Elite Gen 5, ONNX) a 14,44 ms (SA7255P, QNN_DLC) por inferencia a 224x224.
- Requisito de plataforma: para aprovechar la NPU se necesita hardware Qualcomm compatible y compilar el asset para ese chipset; fuera de esa familia el rendimiento no está caracterizado en la documentación disponible.
- Throughput: no disponible (solo se publica latencia por inferencia).

## Comparativa con modelos similares

La información proporcionada solo describe RepViT, y los resultados de búsqueda web no contienen material técnico relacionado con el modelo, por lo que la comparación numérica con alternativas queda como no disponible.

| Modelo | Tipo | Parametros | Longitud de contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| RepViT (qualcomm/RepViT) | CNN pura optimizada para móvil | 22,9 M | no aplica | Apache 2.0 | Pesos PyTorch + ONNX, QNN_DLC y TFLITE pre-exportados | Latencias en NPU Qualcomm (1,45-14,44 ms) |
| MobileNetV3 | CNN móvil | no disponible | no aplica | no disponible | Ampliamente distribuido en frameworks de visión | no disponible |
| EfficientNet-Lite | CNN móvil | no disponible | no aplica | no disponible | Distribuido para TFLite | no disponible |
| FastViT | Híbrido CNN/Transformer móvil | no disponible | no aplica | no disponible | Disponible como implementación de investigación | no disponible |

No se dispone de cifras verificables de precisión ni de latencia de esas alternativas en la misma plataforma, por lo que cualquier comparación cuantitativa sería especulativa. La ventaja diferencial documentada de este repositorio es la cadena de exportación y perfilado específica para NPU Qualcomm.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no genera texto, no hace tool calling, no soporta agentes y no procesa instrucciones.
- Sesgos: al entrenarse sobre ImageNet, hereda sus desequilibrios de clase y sus sesgos geográficos y culturales; no se documenta ninguna mitigación.
- Falsos positivos con alta confianza: un clasificador softmax puede asignar probabilidades altas a clases incorrectas en imágenes fuera de distribución; la model card no aporta datos de calibración.
- Cobertura de clases limitada al conjunto ImageNet; cualquier objeto o concepto ajeno a esas categorías se mapeará a la clase más parecida.
- Resolución fija de 224x224: los objetos pequeños o el detalle fino se pierden, y no se documentan variantes con entradas mayores.
- Idiomas: no aplica, pero conviene recordar que el modelo no puede integrarse en flujos que esperen entrada o salida textual.
- Licencia Apache 2.0 para los pesos, lo que permite uso comercial; sin embargo, los assets pre-exportados dependen de QAIRT, ONNX Runtime y SDK de Qualcomm, sujetos a sus propios términos, y el uso de AI Hub Workbench requiere registro de cuenta.
- Este repositorio es una redistribución optimizada, no el trabajo original: la autoría del diseño corresponde a THU-MIG (arXiv:2307.09283) y las mejoras de rendimiento a Qualcomm.
- Sin validación comunitaria: 0 descargas y 0 me gusta en HuggingFace en el momento de la consulta, por lo que no hay evidencia externa de comportamiento en producción.
- Las latencias publicadas corresponden exclusivamente a NPU Qualcomm con precisión float; no hay datos de cuantización int8 ni de comportamiento en CPU x86, GPU NVIDIA o Apple Silicon.
- La tabla de rendimiento TFLITE está truncada en la información disponible, lo que impide verificar su cobertura completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/RepViT
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/repvit
- Repositorio Qualcomm AI Hub Models (RepViT v0.62.0): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/repvit
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
- Implementación original de RepViT: https://github.com/THU-MIG/RepViT
- Paper de referencia (identificador declarado en las etiquetas del modelo): https://arxiv.org/abs/2307.09283
- Asset ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/repvit/releases/v0.62.0/repvit-onnx-float.zip
- Asset QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/repvit/releases/v0.62.0/repvit-qnn_dlc-float.zip
- Asset TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/repvit/releases/v0.62.0/repvit-tflite-float.zip

Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido inmobiliario y de direcciones en Arabia Saudi), por lo que no se ha incorporado ninguna otra fuente a esta ficha.
