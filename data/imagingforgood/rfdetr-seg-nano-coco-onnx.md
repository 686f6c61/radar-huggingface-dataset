# imagingforgood/rfdetr-seg-nano-coco-onnx

## Resumen

RF-DETR Seg Nano es un modelo de segmentación de instancias basado en la arquitectura RF-DETR (Real-Time Detection Transformer) desarrollado por Roboflow, publicado bajo licencia Apache-2.0. El modelo original se distribuye como pesos PyTorch y este repositorio contiene una conversión a ONNX en FP32, realizada por AnnotateIt y conservada por Imaging for Good para su uso en aplicaciones de percepción en navegador. No se ha entrenado ni modificado el modelo respecto al checkpoint original.

La relevancia de esta ficha radica en que el artefacto es una conversión pura a ONNX, lo que permite ejecutar segmentación de instancias en entornos sin PyTorch, incluido onnxruntime-web en el navegador. El grafo ONNX fue validado contra el checkpoint PyTorch en COCO val2017, con una diferencia de 0,0001 en segm AP (0,4010 frente a 0,4011), lo que confirma la fidelidad de la conversión.

El modelo tiene 33,6 M de parámetros, entrada fija de 312×312 píxeles, batch 1 y opset 17. Genera hasta 100 detecciones con cajas, logits de clase en formato COCO-91 y máscaras de 78×78 sobre la imagen estirada. Es un modelo de nicho: no es un modelo de lenguaje ni un modelo generalista, sino un detector-segmentador específico para las 80 clases de COCO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time Detection Transformer) con cabeza de segmentación |
| Parametros totales | 33,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 312×312) |
| Tipos de cuantizacion | FP32 (única versión publicada en este repo); el modelo base PyTorch puede cuantizarse, pero no se documenta aquí |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17, 122.833.543 bytes) |

## Arquitectura y entrenamiento

RF-DETR es un transformer de detección en tiempo real derivado de la familia DETR, con una cabeza adicional de segmentación de instancias. El modelo base fue entrenado por Roboflow sobre el dataset COCO; esta ficha no dispone de detalles sobre el número de tokens, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de visión). La innovación principal de la familia RF-DETR es su orientación a latencia baja manteniendo precisión competitiva en detección y segmentación.

La conversión a ONNX se realizó con el exportador oficial `rfdetr` de Roboflow, a partir del tag `1.9.4` (commit `9b009fa928d6218320439803d1da01869a85c072`). El grafo resultante es FP32, batch 1, con entrada `input` de forma `[1, 3, 312, 312]` en float32, normalizada con media ImageNet `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`, con redimensionado por estiramiento (stretch-resize). Las salidas son `dets` `[1, 100, 4]` (cajas normalizadas cx, cy, w, h), `labels` `[1, 100, 91]` (logits de clase en formato COCO-91 disperso, persona = 1) y `masks` `[1, 100, 78, 78]` (logits de máscara sobre la imagen estirada).

## Capacidades

- Segmentación de instancias sobre imágenes RGB de 312×312 píxeles, con hasta 100 detecciones por imagen.
- Detección de objetos en las 80 clases de COCO (representadas en el layout COCO-91, donde persona = 1).
- Salida de cajas delimitadoras normalizadas, logits de clase y máscaras por instancia.
- Ejecución en CPU mediante onnxruntime y en navegador mediante onnxruntime-web.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Percepción en navegador: el modelo está pensado para ejecutarse con onnxruntime-web en el cliente, permitiendo segmentar objetos en imágenes capturadas por el usuario sin enviar datos a un servidor. Es adecuado por su tamaño reducido (122 MB en FP32) y entrada fija de 312×312.
- Anotación asistida de datasets: integrado en herramientas de etiquetado, el modelo pre-segmenta instancias de COCO para que un humano revise y corrija, acelerando la creación de datasets de segmentación.
- Moderación de contenido visual: detección y segmentación de personas u objetos concretos en imágenes subidas por usuarios, con la ventaja de que la inferencia puede hacerse localmente en el navegador.
- Aplicaciones de accesibilidad: descripción de escenas mediante segmentación de objetos presentes en una imagen capturada por la cámara del dispositivo, ejecutando el modelo en el propio cliente.
- Robótica y visión embebida de bajo coste: al ser un modelo de 33,6 M de parámetros con entrada pequeña, puede desplegarse en dispositivos con recursos limitados para tareas de segmentación en tiempo real.
- Preprocesado en pipelines de visión: uso como primer estadio para recortar regiones de interés (personas, vehículos, animales) antes de pasarlas a un modelo de clasificación o reconocimiento más pesado.
- Prototipado rápido de demos de segmentación: al estar en ONNX y con un contrato de entrada/salida bien definido, permite montar demos web sin dependencias de PyTorch.

## Benchmarks y rendimiento

Los únicos datos disponibles en la información proporcionada son los de la evaluación de la conversión ONNX frente al checkpoint PyTorch original en COCO val2017 (5.000 imágenes):

| Modelo / runtime | segm AP (COCO val2017) |
|---|---|
| RF-DETR Seg Nano, PyTorch 2.13 (CPU) | 0,4011 |
| RF-DETR Seg Nano, ONNX Runtime 1.29 (CPU) | 0,4010 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que no es un modelo de lenguaje. Tampoco se dispone de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ONNX ocupa 122,8 MB en FP32, por lo que la huella en memoria es del orden de cientos de MB incluyendo activaciones.
- GPU recomendadas: no se especifican; el modelo está validado en CPU con onnxruntime y orientado a onnxruntime-web.
- Cabe en GPU de consumo: sí, por tamaño (33,6 M de parámetros), aunque no se documentan pruebas en modelos concretos como RTX 4090.
- Opciones de despliegue: onnxruntime (CPU/GPU), onnxruntime-web (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos comparables (por ejemplo, otras variantes de RF-DETR, YOLO-seg o Mask R-CNN) que permitan una comparación rigurosa. La comparación se limita a lo siguiente:

| Modelo | Parámetros | Entrada | Formato | Licencia |
|---|---|---|---|---|
| RF-DETR Seg Nano (este repo, ONNX) | 33,6 M | 312×312 | ONNX FP32 | Apache-2.0 |
| RF-DETR Seg Nano (Roboflow, PyTorch) | 33,6 M | 312×312 | safetensors | Apache-2.0 |
| Otras variantes de RF-DETR Seg | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de visión especializado: no procesa texto ni lenguaje natural, por lo que no debe evaluarse con benchmarks de LLM.
- Entrada fija de 312×312 con stretch-resize: la relación de aspecto original se distorsiona, lo que puede afectar a objetos muy alargados o pequeños.
- Solo clases COCO: no detecta categorías fuera de las 80 clases del dataset COCO.
- Layout COCO-91 disperso: los índices de clase no son contiguos (persona = 1), lo que exige mapeo explícito en producción.
- Riesgo de falsos positivos y negativos inherente a un modelo nano de detección; no se documentan métricas por clase.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio es una copia no oficial: el autor declara no haber entrenado, convertido ni modificado el modelo, y no garantiza soporte.
- La evaluación de fidelidad ONNX frente a PyTorch fue realizada por AnnotateIt, no por el mantenedor de este repositorio; Imaging for Good verifica el fichero contra sus propias salidas doradas, no contra COCO.
- El repositorio original de la conversión (`AnnotateIt/rfdetr-seg-nano-coco-onnx`) ya no estaba disponible en Hugging Face en la fecha de creación de esta copia (2026-10-29), lo que introduce un riesgo de trazabilidad.
- Sin datos publicados de latencia, throughput ni comportamiento en GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imagingforgood/rfdetr-seg-nano-coco-onnx
- Modelo base en Hugging Face: https://huggingface.co/Roboflow/rf-detr-seg-nano
- Código de Roboflow: https://github.com/roboflow/rf-detr
- Licencia original: https://github.com/roboflow/rf-detr/blob/develop/LICENSE
- Proyecto browser-perception: https://imagingforgood.github.io/browser-perception/
- AnnotateIt (autor de la conversión): https://annotateit.ai
- Roboflow: https://roboflow.com
