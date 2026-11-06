# jeandudey/scrfd-500m-bn

## Resumen

`jeandudey/scrfd-500m-bn` es un detector de rostros ultraligero de estilo SCRFD (Sample and Computation Redistribution for Efficient Face Detection), entrenado desde cero por el autor del repositorio sobre las imágenes con licencia CC BY de Open Images V7, sin usar pesos de InsightFace ni datos de WIDER FACE para el entrenamiento. Con aproximadamente 0,6 millones de parámetros y 0,5 GFLOPs, resuelve el problema de detectar caras en dispositivos con recursos muy limitados (CPU, edge, móvil) donde los detectores grandes resultan inviables.

El modelo utiliza un backbone MobileNetV1 con BatchNorm en todas las capas, cabezas de detección por cada stride y entradas fijas de 640x640. Se distribuye en formato ONNX tanto en punto flotante (fp32) como cuantizado a int8 con QDQ por canal (0,94 MB), lo que lo hace especialmente adecuado para inferencia con ONNX Runtime en hardware sin GPU.

Su relevancia actual radica en la trazabilidad y el licenciamiento limpio: el repositorio incluye BOMs en formato CycloneDX 1.6 y SPDX 3.0.1, atribución individual de cada imagen de entrenamiento y pesos bajo Apache-2.0, algo poco habitual en detectores de rostros derivados de la familia SCRFD, cuyos pesos originales suelen tener licencias más restrictivas o procedencia de datos poco documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCRFD con backbone MobileNetV1, BatchNorm, cabezas por stride, sin keypoints |
| Parametros totales | ~0,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija 640x640) |
| Tipos de cuantizacion | fp32 e int8 (QDQ, cuantizacion por canal) |
| Idiomas soportados | no disponible (no aplica, modelo de deteccion visual) |
| Licencia | Apache-2.0 (pesos); imagenes de entrenamiento CC BY 2.0 |
| Formato de pesos | PyTorch state dict (.pth, 2,5 MB) y ONNX (fp32 e int8, 0,94 MB el int8) |

## Arquitectura y entrenamiento

El modelo sigue el diseño SCRFD: redistribución computacional estilo sample para detectores de cara eficientes, con un backbone MobileNetV1 normalizado mediante BatchNorm en todas las capas y cabezas de detección independientes por cada stride de la pirámde de características. No predice landmarks faciales, solo cajas delimitadoras. La entrada es fija a 640x640 en los ficheros ONNX exportados.

El entrenamiento se realizó desde cero con SGD (momentum 0,9, weight decay 5e-4, batch 16) durante 10 épocas con un calendario escalonado de learning rate (0,01 durante 5 épocas, 0,001 durante 3 y 0,0001 durante 2), empleando asignación ATSS, quality focal loss y DIoU loss como funciones de pérdida. El aumento de datos incluyó recorte cuadrado aleatorio sesgado hacia recortes grandes, volteo horizontal y distorsión fotométrica. Los datos proceden de 327.588 imágenes de entrenamiento de Open Images V7 con anotaciones de "Human face" (1.001.442 rostros, sin cajas de grupo) y 1.000 imágenes de validación. Todo el proceso se ejecutó en una única GPU AMD con ROCm en unas 12 horas. La cuantización int8 se obtuvo con cuantización estática de ONNX Runtime mediante calibración por percentil sobre 256 imágenes de entrenamiento de Open Images.

## Capacidades

- Detección de rostros en imágenes con cajas delimitadoras (pipeline de object-detection).
- Inferencia eficiente en CPU gracias al tamaño mínimo (0,5 GFLOPs) y a la versión int8 cuantizada por canal.
- Entrada única fija de 640x640 con letterboxing de la imagen.
- Proveniencia completa y auditable: BOMs en CycloneDX 1.6 y SPDX 3.0.1, checksums SHA256 y ficheros de atribución por imagen.
- No soporta: landmarks faciales, estimación de pose, reconocimiento o verificación de identidad, ni procesamiento de vídeo nativo (aunque puede aplicarse fotograma a fotograma).

## Casos de uso

- Detección de rostros en dispositivos edge y IoT: con 0,94 MB en int8 y 0,5 GFLOPs, puede ejecutarse en CPUs ARM embebidas, cámaras inteligentes o Raspberry Pi sin necesidad de GPU.
- Etapa previa de pipelines de reconocimiento facial: el detector localiza las caras y recorta los rostros para pasarlos a un modelo de embeddings posterior (ArcFace, etc.), aunque habría que añadir landmarks por separado si el pipeline de alineación los requiere.
- Moderación de contenido y privacidad: difuminado o anonimización automática de rostros en fotografías antes de su publicación, con un coste computacional mínimo por imagen.
- Analítica de presencia en retail o oficinas: conteo de personas mirando a cámara en imágenes fijas, aprovechando el bajo consumo en CPU.
- Aplicaciones móviles con ONNX Runtime: la versión int8 QDQ es directamente compatible con los proveedores de ejecución cuantizada de ONNX Runtime en Android e iOS.
- Procesado por lotes de grandes volúmenes de imágenes en servidores sin GPU: el tamaño del modelo permite alta densidad de instancias por nodo y bajo coste de inferencia.
- Auditoría de licencias en entornos corporativos: los BOMs machine-readable y la atribución CC BY facilitan la integración en procesos de compliance de software.

## Benchmarks y rendimiento

Resultados publicados en WIDER FACE validación (AP a IoU 0,5, escala única con letterbox a 640):

| Modelo | Easy | Medium | Hard |
|---|---|---|---|
| Este modelo, float | 89,22 | 84,32 | 52,34 |
| Este modelo, int8 | 89,11 | 84,21 | 52,03 |
| SCRFD-0.5GF publicado (entrenado en WIDER FACE) | 90,57 | 88,12 | 68,51 |

Open Images validación (1.000 imágenes), AP@0,5: 0,8484.

El autor advierte que las cifras publicadas de SCRFD-0.5GF pueden usar un protocolo de evaluación distinto (por ejemplo, multi-escala), por lo que la comparación es solo indicativa. WIDER FACE se empleó únicamente para evaluación, no para entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 0,6 M de parámetros y 0,5 GFLOPs, el modelo cabe holgadamente en la memoria de cualquier GPU moderna e incluso funciona íntegramente en CPU (consumo de RAM del orden de unos pocos MB).
- GPU recomendadas: no se requiere GPU para inferencia. Para reentrenamiento, el autor usó una GPU AMD con ROCm; cualquier GPU moderna sirve dado el tamaño del modelo.
- Consumer GPUs: no es necesario; el modelo está pensado para CPU y dispositivos sin acelerador. Si se usa GPU, cualquier tarjeta con soporte ONNX Runtime (incluidas integradas Intel) es suficiente.
- Despliegue: ONNX Runtime (fp32 e int8 QDQ) es la vía principal. El repositorio de código incluye utilidades `scrfd-webcam` (demo en webcam), `scrfd-package` y `scrfd-quantize`. No se menciona soporte directo para vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de visión de este tipo).
- Latencia y throughput: no se han publicado cifras concretas de latencia o FPS en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | GFLOPs | WIDER FACE Hard (AP@0.5) | Landmarks | Licencia |
|---|---|---|---|---|---|
| scrfd-500m-bn (este modelo) | ~0,6 M | 0,5 | 52,34 (float) | No | Apache-2.0 |
| SCRFD-0.5GF (InsightFace, entrenado en WIDER FACE) | ~0,64 M | 0,5 | 68,51 | No | Licencia InsightFace (no comercial sin permiso) |
| SCRFD-2.5GF (InsightFace) | ~0,67 M | 2,5 | 82,44 (aprox., publicado) | No | Licencia InsightFace (no comercial sin permiso) |
| RetinaFace (MobileNet0.25) | ~0,45 M | no disponible | ~78 (aprox., publicado) | Sí | MIT (código) |

Nota: las cifras de los modelos de InsightFace y RetinaFace proceden de sus publicaciones originales con protocolos posiblemente distintos (multi-escala), por lo que la comparación es orientativa. La ventaja diferencial de este modelo es su licencia Apache-2.0 y la trazabilidad completa de los datos de entrenamiento.

## Limitaciones y advertencias

- Recalledo reducido en rostros pequeños y multitudes: Open Images no etiqueta todos los rostros pequeños, lo que se refleja en 16 puntos menos en el subset Hard de WIDER FACE frente al SCRFD entrenado con ese dataset.
- Solo detecta rostros; no predice landmarks faciales ni atributos.
- No evaluado respecto a equidad demográfica: la detección de rostros puede fallar de forma desigual según tono de piel, edad, pose o iluminación. El autor recomienda explícitamente validar sobre la población propia antes de confiar en el modelo.
- Entrada fija de 640x640 en los ficheros ONNX; imágenes con rostros muy alejados del centro o fuera de ese encuadre pueden perderse.
- El fichero ONNX fp32 usa entrada de tamaño fijo, lo que puede complicar integraciones que requieran resoluciones variables.
- Licencia: los pesos son Apache-2.0 (uso comercial permitido), pero las imágenes de entrenamiento son CC BY 2.0 y pertenecen a sus autores; no se redistribuyen, aunque conviene revisar las obligaciones de atribución si se redistribuyen derivados del dataset.
- Riesgo de falsos positivos en patrones parecidos a caras y de alucinación de detecciones en escenas adversas, algo no cuantificado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeandudey/scrfd-500m-bn
- Código (entrenamiento, cuantización, empaquetado y demo): https://github.com/jeandudey/pytorch-scrfd
- Referencia original de SCRFD (InsightFace): https://github.com/deepinsight/insightface/tree/master/detection/scrfd
- Paper de SCRFD: https://arxiv.org/abs/2105.04714
- Open Images V7: https://storage.googleapis.com/openimages/web/index.html
- No disponible: demo online alojada, blog de anuncio o espacio de Hugging Face asociado.
