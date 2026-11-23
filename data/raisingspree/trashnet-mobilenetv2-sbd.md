# Raisingspree/trashnet-mobilenetv2-sbd

## Resumen

`Raisingspree/trashnet-mobilenetv2-sbd` es un modelo de clasificación de imágenes de residuos en seis categorías (cartón, vidrio, metal, papel, plástico y basura genérica), obtenido mediante transfer learning sobre MobileNetV2 preentrenado en ImageNet y ajustado con el dataset TrashNet. Lo desarrolla el autor identificado como Raisingspree en el marco de un proyecto de la asignatura de Visión por Computador del grupo SBD de la Universitas Sumatera Utara. No es un modelo de lenguaje: es un clasificador visual ligero, sin capacidades de generación de texto, razonamiento simbólico ni tool calling.

Su relevancia práctica reside en dos factores concretos: el tamaño reducido de MobileNetV2 (arquitectura de bloques residuales invertidos con convoluciones separables en profundidad), que permite ejecutarlo en CPU o en el navegador mediante ONNX Runtime Web, y la publicación de pesos tanto en formato PyTorch (`.pth`) como ONNX (`.onnx`), lo que facilita su integración en aplicaciones web o móviles de reciclaje asistido. El modelo reporta un 92,88 % de accuracy y un F1 macro de 91,30 % sobre un conjunto de prueba de 379 imágenes.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0,0 GB (probablemente por redondeo de un artefacto de pocos megabytes). La model card está redactada en indonesio y describe el pipeline de preprocesado de forma explícita, lo que reduce el riesgo de errores de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (transfer learning desde pesos ImageNet, torchvision) |
| Parametros totales | no disponible (MobileNetV2 estándar, ~3,5 M en la variante base; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada 224x224x3) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `.pth` y `.onnx` sin variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas en inglés: cardboard, glass, metal, paper, plastic, trash) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pth`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo es un MobileNetV2 completo de torchvision con la cabeza de clasificación sustituida por una capa `Linear(1280, 6)`, es decir, 1280 características de entrada y 6 clases de salida. MobileNetV2 es una CNN con bloques residuales invertidos (*inverted residuals*) y convoluciones separables en profundidad (*depthwise separable convolutions*), diseñada para inferencia de bajo coste computacional. El entrenamiento se realizó mediante transfer learning sobre el dataset TrashNet (`garythung/trashnet`), que contiene imágenes de residuos clasificadas en las seis categorías indicadas.

La información disponible no detalla el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño del conjunto de entrenamiento ni si se aplicaron técnicas de aumento de datos o *fine-tuning* parcial de capas. Tampoco se especifica si se congelaron las capas convolucionales durante el ajuste. El preprocesado es determinista y está documentado de forma explícita: conversión a RGB, *resize* directo a 224x224 sin recorte, escalado a [0,1] y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`, generando un tensor float32 de forma `[1, 3, 224, 224]` en formato NCHW. La salida son *logits* de 6 clases que deben pasarse por softmax.

## Capacidades

- Clasificación de imágenes en 6 clases de residuos: `cardboard`, `glass`, `metal`, `paper`, `plastic`, `trash`.
- Inferencia en CPU y en navegador mediante ONNX Runtime Web (ejemplo de JavaScript incluido en la model card).
- Inferencia en Python mediante el script `inference.py` incluido en el repositorio.
- Salida de *logits* por clase, lo que permite aplicar umbrales de confianza o estrategias de rechazo en producción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No dispone de *thinking mode* ni de modo de visión general: es exclusivamente un clasificador cerrado de 6 clases.

## Casos de uso

- **Clasificación de residuos en aplicaciones móviles de reciclaje**: el modelo se integra como `.onnx` en una app que captura una foto y devuelve la categoría de contenedor recomendada. Su tamaño reducido y la licencia MIT permiten distribuirlo sin restricciones.
- **Clasificación en el navegador sin backend**: mediante `onnxruntime-web` se puede ejecutar la inferencia en el cliente, evitando enviar imágenes a un servidor. El ejemplo JavaScript de la model card cubre el pipeline completo de canvas, normalización y softmax.
- **Prototipado de sistemas de recogida selectiva en entornos educativos**: el modelo sirve como base para demostraciones de visión por computador en cursos o talleres, dado que su entrenamiento y preprocesado están documentados y el dataset TrashNet es público.
- **Preetiquetado de imágenes para anotación humana**: al clasificar con 6 clases y devolver probabilidades, puede usarse para preseleccionar candidatos en un flujo de etiquetado, reduciendo el coste de anotación manual en proyectos de gestión de residuos.
- **Integración en estaciones de clasificación con cámara fija**: el modelo puede ejecutarse en dispositivos de borde (Raspberry Pi, mini-PC) para clasificar residuos en una cinta transportadora, siempre que la distribución visual de las imágenes se parezca a TrashNet.
- **Filtro previo en pipelines de visión más complejos**: como clasificador rápido y ligero, puede actuar como primera etapa que descarte imágenes sin residuo o derive a un modelo mayor solo los casos ambiguos (por ejemplo, la clase `trash`, con F1 de 80,0 %).
- **Investigación comparativa sobre transfer learning**: sirve como línea base reproducible para comparar MobileNetV2 con otras arquitecturas (ResNet, EfficientNet) sobre TrashNet, dado que reporta métricas macro y por clase.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de prueba de 379 imágenes del dataset TrashNet:

| Metrica | Valor |
|---|---|
| Accuracy | 92,88 % |
| Precision (macro) | 92,03 % |
| Recall (macro) | 90,88 % |
| F1 (macro) | 91,30 % |

F1 por clase:

| Clase | F1 |
|---|---|
| cardboard | 93,2 % |
| glass | 94,5 % |
| metal | 92,3 % |
| paper | 93,5 % |
| plastic | 94,3 % |
| trash | 80,0 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: MobileNetV2 es un modelo de pocos megabytes; la inferencia en FP32 requiere del orden de decenas de MB de memoria, aunque el dato exacto no está disponible en la información proporcionada.
- **GPU recomendadas**: no requiere GPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo, pero es sobredimensionada para esta tarea.
- **CPU**: es el entorno natural de despliegue; el modelo está pensado para ejecutarse en CPU y en navegador.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en dispositivos de borde.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, Web), PyTorch nativo con `torchvision.models.mobilenet_v2`, y cualquier runtime compatible con ONNX (por ejemplo, `onnxruntime-web` en el navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos sobre el mismo conjunto de prueba en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural (sin datos de rendimiento comparables):

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Formato |
|---|---|---|---|---|---|
| Raisingspree/trashnet-mobilenetv2-sbd | MobileNetV2 | no disponible | 224x224x3 | MIT | `.pth`, `.onnx` |
| MobileNetV2 (ImageNet, torchvision) | MobileNetV2 | ~3,5 M (referencia) | 224x224x3 | BSD-3 (torchvision) | PyTorch |
| ResNet-50 (ImageNet) | ResNet | ~25,6 M (referencia) | 224x224x3 | BSD-3 (torchvision) | PyTorch |
| EfficientNet-B0 (ImageNet) | EfficientNet | ~5,3 M (referencia) | 224x224x3 | BSD-3 (torchvision) | PyTorch |

Los datos de parámetros de las alternativas son valores de referencia de las arquitecturas base y no de ajustes específicos sobre TrashNet; no se han publicado comparativas de accuracy sobre este dataset en la información disponible.

## Limitaciones y advertencias

- **Clase `trash` débil**: el F1 de 80,0 % en la categoría genérica es notablemente inferior al resto (92-94 %), lo que indica confusión con las demás clases. En producción conviene tratar `trash` con cautela o aplicar umbrales de confianza.
- **Dataset pequeño y sesgado**: TrashNet contiene un número limitado de imágenes y probablemente condiciones de captura homogéneas (fondo, iluminación, ángulo). El rendimiento en imágenes reales de calle o de contenedores puede degradarse respecto al 92,88 % reportado.
- **Preprocesado estricto**: el *resize* directo a 224x224 sin recorte y la normalización exacta son obligatorios; cualquier desviación (por ejemplo, *center crop* o distinta media) altera las predicciones.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo siempre devuelve una de las 6 clases, incluso ante imágenes que no contienen residuos. Es necesario un mecanismo externo de rechazo.
- **Sin datos de sesgo**: no se documentan análisis de sesgo por tipo de material, color, origen geográfico o condiciones de iluminación.
- **Licencia MIT**: permite uso comercial y modificación con atribución; no obstante, el dataset TrashNet puede tener sus propias condiciones de uso que conviene revisar.
- **Sin mantenimiento aparente**: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-23), sin historial de versiones ni issues. No hay garantía de soporte.
- **Idioma de la documentación**: la model card está en indonesio; las etiquetas de salida están en inglés. No hay localización al castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raisingspree/trashnet-mobilenetv2-sbd
- Dataset TrashNet en Hugging Face: https://huggingface.co/datasets/garythung/trashnet
- Repositorio original de TrashNet (Gary Thung): https://github.com/garythung/trashnet
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- MobileNetV2 en torchvision: https://pytorch.org/vision/stable/models/mobilenetv2.html
