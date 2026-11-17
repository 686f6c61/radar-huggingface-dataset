# samOTOFA/rf-detr-onnx

## Resumen

RF-DETR ONNX es un repositorio de exportaciones ONNX (opset 18) de la familia de modelos RF-DETR publicados por Roboflow bajo licencia Apache 2.0. RF-DETR es una arquitectura de deteccion de objetos basada en transformers (DETR, *Detection Transformer*) que incluye variantes para deteccion de cajas delimitadoras y para segmentacion de instancias. Este repositorio, mantenido por el usuario samOTOFA, no entrena ni modifica los pesos originales: se limita a convertirlos a formato ONNX para su uso en entornos de inferencia no-PyTorch, en concreto el proyecto `poly-nlp-java`.

El interes practico del repositorio radica en que permite ejecutar la familia completa RF-DETR (nano, small, medium y large, en versiones de deteccion y de segmentacion) mediante ONNX Runtime, lo que facilita el despliegue en servicios Java, C++, Rust o cualquier runtime compatible con ONNX sin dependencia de PyTorch. El contrato de entrada y salida esta explicitamente documentado en la model card.

La verificacion de fidelidad numerica reportada por el autor (misma clase detectada, desviacion de score menor o igual a 0,01, IoU de cajas mayor o igual a 0,95 e IoU de mascaras mayor o igual a 0,90 frente a los modelos PyTorch originales) es el dato diferencial de este repositorio, ya que cuantifica la perdida introducida por la exportacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion (RF-DETR, familia DETR) con variantes de deteccion y de segmentacion de instancias |
| Parametros totales | no disponible (depende de la variante: nano, small, medium, large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa imagenes) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos ONNX en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase son las del dataset de entrenamiento de Roboflow) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

RF-DETR pertenece a la familia DETR, que formula la deteccion de objetos como un problema de prediccion de conjuntos mediante un transformer sobre caracteristicas extraidas de la imagen, evitando componentes como las propuestas de regiones o el *non-maximum suppression* en el pipeline original. El repositorio incluye ocho exportaciones: cuatro de deteccion (nano, small, medium, large) y cuatro de segmentacion de instancias (seg-nano, seg-small, seg-medium, seg-large), todas derivadas de los modelos publicados por Roboflow.

Este repositorio concreto no aporta entrenamiento propio: los pesos se exportan "sin modificacion" desde los modelos originales de Roboflow con licencia Apache 2.0. La innovacion tecnica documentada es la propia exportacion a ONNX opset 18 con un contrato de entrada/salida fijo y explicitamente definido: entrada `input` de tipo float32 con forma [1, 3, R, R] en RGB, normalizada con media y desviacion estandar de ImageNet, escalado bilineal y division por 255; salidas `dets` [1, Q, 4] con cajas normalizadas en formato (cx, cy, w, h), `labels` [1, Q, C] con logits de clase y, en las variantes de segmentacion, `masks` [1, Q, Hm, Wm] con logits de mascara. Se incluye ademas una metadanea `class_names` como array JSON. No se documentan en la informacion disponible los detalles del dataset de entrenamiento original, el numero de imagenes ni si hubo etapas de ajuste fino especificas.

## Capacidades

- Deteccion de objetos con cajas delimitadoras en formato normalizado (cx, cy, w, h) sobre imagenes RGB.
- Segmentacion de instancias en las variantes `seg-*`, con logits de mascara por consulta.
- Salida por consultas (*queries*) con logits de clase, lo que requiere aplicar el post-procesado adecuado (sigmoide y umbral) sobre `labels`.
- Clasificacion multi-clase mediante la dimension C de la salida `labels`, con nombres de clase embebidos como metadanea JSON.
- Ejecucion en ONNX Runtime 1.20 y previsiblemente en otros runtimes compatibles con ONNX opset 18.
- Integracion en aplicaciones sin PyTorch (el caso de uso declarado es el proyecto `poly-nlp-java`).
- Escalado por variantes de tamano (nano, small, medium, large) para ajustar coste computacional y precision.
- No dispone de capacidades de generacion de texto, razonamiento linguistico, tool calling ni agentes: es un modelo puramente visual.

## Casos de uso

- Deteccion de objetos en servicios Java: el contrato ONNX documentado permite cargar el modelo con ONNX Runtime para Java y consumir `dets` y `labels` directamente, evitando introducir una dependencia de PyTorch o de Python en el backend.
- Segmentacion de instancias en pipelines de vision industrial: las variantes `seg-*` devuelven mascaras por instancia utiles para medir areas, contar piezas o separar objetos solapados en imagenes de inspeccion.
- Preprocesado de imagenes para analitica documental: deteccion de regiones relevantes (figuras, tablas, elementos graficos) antes de pasarlas a un OCR o a un modelo de lenguaje multimodal.
- Despliegue en entornos edge o embebidos: la variante nano, exportada a ONNX, permite ejecucion en dispositivos con runtime ONNX y recursos limitados, sin necesidad de stack CUDA/PyTorch completo.
- Moderacion o filtrado visual en aplicaciones web: deteccion de clases de interes en imagenes subidas por usuarios dentro de un servicio que ya utiliza ONNX Runtime para otros modelos.
- Investigacion y evaluacion comparativa: al ofrecer las cuatro escalas en el mismo formato y contrato, facilita experimentos de compromiso precision/latencia sin cambiar el codigo de integracion.
- Integracion en aplicaciones moviles o de escritorio multiplataforma mediante runtimes ONNX (ONNX Runtime Mobile, entre otros), al no requerir el ecosistema Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta métricas de fidelidad de la exportacion frente a los modelos PyTorch originales, verificadas con ONNX Runtime 1.20:

| Criterio de verificacion | Resultado reportado |
|---|---|
| Coincidencia de clase detectada | Identica al modelo PyTorch original |
| Desviacion de score | Menor o igual a 0,01 |
| IoU de cajas delimitadoras | Mayor o igual a 0,95 |
| IoU de mascaras (variantes seg) | Mayor o igual a 0,90 |

No se proporcionan cifras de mAP, latencia ni throughput para ninguna de las variantes.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 1,0 GB en total e incluye ocho archivos ONNX, por lo que cada variante individual pesa una fraccion de ese total; no se detalla el tamano por archivo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al tratarse de un modelo de vision de escala DETR, es esperable que las variantes nano y small quepan en GPUs de consumo, pero no se confirma con datos del repositorio.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (verificado con la version 1.20); el contrato ONNX estandar permite otros runtimes compatibles con opset 18. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Variantes | Formato | Licencia | Contexto / entrada | Notas |
|---|---|---|---|---|---|---|
| RF-DETR ONNX (este repositorio) | Deteccion + segmentacion | nano, small, medium, large (+ seg) | ONNX opset 18 | Apache 2.0 | Imagen RGB [1, 3, R, R] | Exportacion verificada numericamente frente a PyTorch |
| Roboflow/rf-detr-nano y familia | Deteccion + segmentacion | nano a large (+ seg) | PyTorch (formato original) | Apache 2.0 | Imagen RGB | Modelos de origen; requieren stack PyTorch |
| Otros exportadores ONNX de DETR | Deteccion | Variable | ONNX | Variable | Imagen RGB | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento (mAP, latencia) de este repositorio ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad de variantes.

## Limitaciones y advertencias

- Repositorio de exportacion, no de desarrollo: no hay entrenamiento propio ni ajuste; cualquier mejora o limitacion del modelo subyacente se hereda de los pesos originales de Roboflow.
- Ausencia de benchmarks: no se publican cifras de mAP ni de latencia, lo que impide evaluar la calidad de deteccion sin ejecutar los modelos por cuenta propia.
- Fidelidad aproximada: aunque la verificacion reporta alta coincidencia (score con desviacion hasta 0,01, IoU de cajas desde 0,95, IoU de mascaras desde 0,90), existe una perdida numerica no nula frente al modelo PyTorch original.
- Contrato de salida con logits: `labels` y `masks` se emiten como logits, por lo que es necesario aplicar sigmoide y umbralizado en el consumidor; un uso incorrecto produce detecciones erroneas.
- Preprocesado fijo: la entrada exige RGB, division por 255, escalado bilineal y normalizacion ImageNet; desviarse de este pipeline degrada los resultados.
- Idiomas y clases: la metadanea `class_names` proviene del entrenamiento original de Roboflow; no se documenta que clases cubre ni su cobertura por dominio.
- Riesgo de sesgo y alucinacion visual: no evaluado en la informacion disponible; como todo detector, puede producir falsos positivos en dominios alejados de sus datos de entrenamiento.
- Adopcion minima: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento continuado por parte del autor del repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos y datasets originales de Roboflow en caso de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samOTOFA/rf-detr-onnx
- Modelo de origen nano: https://huggingface.co/Roboflow/rf-detr-nano
- Modelo de origen small: https://huggingface.co/Roboflow/rf-detr-small
- Modelo de origen medium: https://huggingface.co/Roboflow/rf-detr-medium
- Modelo de origen large: https://huggingface.co/Roboflow/rf-detr-large
- Modelo de origen seg-nano: https://huggingface.co/Roboflow/rf-detr-seg-nano
- Modelo de origen seg-small: https://huggingface.co/Roboflow/rf-detr-seg-small
- Modelo de origen seg-medium: https://huggingface.co/Roboflow/rf-detr-seg-medium
- Modelo de origen seg-large: https://huggingface.co/Roboflow/rf-detr-seg-large
- ONNX Runtime: https://onnxruntime.ai/
