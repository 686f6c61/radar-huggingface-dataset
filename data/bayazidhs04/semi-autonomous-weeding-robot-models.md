# bayazidhs04/semi-autonomous-weeding-robot-models

## Resumen

El repositorio `bayazidhs04/semi-autonomous-weeding-robot-models` no contiene un modelo de lenguaje, sino un conjunto de pesos y runtimes optimizados para un robot agrícola semiautónomo de desherbado. Lo publica el autor bayazidhs04 como artefactos oficiales del proyecto "Semi-Autonomous 8-Direction Weeding Rover", un rover equipado con cámara de profundidad 3D ToF Sipeed MaixSense-A075V y una torreta MG996R con cabezal de molienda mecánica y quemador de llama. El objetivo es detectar malas hierbas frente a cultivos y localizarlas en 3D para dirigir la herramienta de eliminación.

El artefacto principal es `best.onnx`, un detector YOLOv8s exportado a ONNX Runtime con entrada de 256x320 píxeles y 9 clases agrícolas (maíz, remolacha azucarera, soja, girasol, patata, guisante, judía, calabaza y mala hierba). Según la model card, alcanza 52,4 ms de latencia en CPU y 19,1 FPS, lo que lo hace apto para despliegue en el borde. Se incluyen además dos pesos PyTorch (uno YOLOv8s de 9 clases para entrenamiento/exportación y un YOLOv8n de 2 clases como referencia base) y una comparación con DINOv2 ViT-S/14, que fue descartado por su coste computacional.

La relevancia es de nicho: no compite en la categoría de modelos fundacionales, sino que sirve como referencia práctica de despliegue de visión por computador en robótica agrícola de bajo coste, con un pipeline que fusiona detección 2D, proyección pinhole sobre profundidad ToF y control de servo en un único motor de inferencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (detector CNN de una etapa) exportado a ONNX; YOLOv8n como baseline; DINOv2 ViT-S/14 solo como referencia histórica |
| Parametros totales | no disponible (el tamaño de pesos es 21,6 MB para `best.onnx` y 21,5 MB para `best.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un ONNX sin indicar si está cuantizado; el resto son pesos PyTorch) |
| Idiomas soportados | no disponible (modelo de visión; las clases están etiquetadas en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`best.onnx`) y PyTorch `.pt` (`best.pt`, `smartweeder_best.pt`) |

## Arquitectura y entrenamiento

El modelo principal es un YOLOv8s de Ultralytics, un detector de objetos de una etapa con backbone CSPDarknet y cabeza de detección anclada, exportado a ONNX Runtime para inferencia en CPU. La entrada del ONNX es de 256x320 píxeles en RGB normalizado a [0,1], con salida en formato tensor de detecciones. Los pesos PyTorch asociados usan entrada de 640x640. El modelo `smartweeder_best.pt` es un YOLOv8n más pequeño (5,9 MB) con solo 2 clases (cultivo y mala hierba), descrito como referencia base.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de referenciar el dataset `agricultural-crops-and-weeds` de Hugging Face. Tampoco menciona si hubo aumento de datos, balanceo de clases o técnicas de regularización. La innovación técnica destacada no está en el entrenamiento sino en el pipeline de despliegue: se sustituyó una cascada de 4 etapas (YOLOv8 -> EfficientNet -> DINOv2 -> CLIP) por un motor unificado ONNX que realiza detección, localización 3D del tallo (X, Y, Z) mediante proyección pinhole sobre la profundidad ToF, orientación de surco y detección de esquinas en 41-52 ms totales. La model card justifica el descarte de DINOv2 porque requiere 518x518 y 202,6 ms por parche en CPU, lo que con 5 candidatos a mala hierba supondría más de 1 segundo de latencia, y porque no predice cajas delimitadoras.

## Capacidades

- Detección de objetos en imágenes agrícolas con 9 clases: maíz, remolacha azucarera, soja, girasol, patata, guisante, judía, calabaza y mala hierba.
- Detección binaria cultivo/mala hierba con el modelo `smartweeder_best.pt` (2 clases).
- Localización 3D del tallo de la mala hierba (X, Y, Z) combinando la caja delimitadora 2D con el valor de profundidad ToF de la cámara Sipeed MaixSense-A075V.
- Cálculo del ángulo de guiñada de la torreta (`Turret_Yaw_deg`) en el rango [-35°, +35°] para alimentar el servo ESP32.
- Orientación de surco y detección de esquinas dentro del mismo motor de inferencia.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Desherbado selectivo en campo: el detector identifica la clase `Weed` frente a los 8 cultivos y la torreta dirige el cabezal de molienda o llama hacia las coordenadas 3D calculadas, reduciendo el uso de herbicidas.
- Control de malezas en hileras de maíz o remolacha: la entrada de 256x320 y los 19,1 FPS permiten procesar el flujo de vídeo de una cámara montada en un rover a velocidad de desplazamiento lenta, con latencia de 52,4 ms por fotograma.
- Robot de desherbado de bajo coste con ROS2: el ONNX se integra en un nodo ROS2 sobre CPU (por ejemplo, en una Raspberry Pi o Jetson), y la salida de cajas se combina con la profundidad ToF para publicar consignas de servo.
- Prototipado académico de pipelines de visión agrícola: sirve como referencia reproducible para comparar YOLOv8s frente a YOLOv8n y frente a DINOv2 en términos de latencia y FPS en CPU.
- Investigación en agricultura de precisión: el conjunto de 9 clases permite evaluar la confusión entre especies de cultivo y malas hierbas en imágenes de campo, sin necesidad de entrenar desde cero.
- Integración en un sistema de dirección automática de surco: la detección de orientación de surco y esquinas en el mismo motor ONNX permite corregir la trayectoria del rover sin un segundo modelo.
- Despliegue en hardware embebido sin GPU: el formato ONNX y los 21,6 MB de pesos permiten ejecutar el modelo en dispositivos con poca memoria y sin acelerador dedicado.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de latencia y FPS en CPU, no de precisión (mAP, recall, etc.). Se reproducen a continuación:

| Modelo | Framework | Entrada | Clases | Tamano | Latencia CPU | FPS en tiempo real | Estado |
|---|---|---|---|---|---|---|---|
| `best.onnx` | ONNX Runtime | 256x320 | 9 | 21,6 MB | 52,4 ms | 19,1 | Listo para borde |
| `best.pt` | PyTorch YOLOv8s | 640x640 | 9 | 21,5 MB | 1209,3 ms | 0,8 | Solo entrenamiento/exportación |
| `smartweeder_best.pt` | PyTorch YOLOv8n | 640x640 | 2 | 5,9 MB | 375,0 ms | 2,7 | Referencia base |
| DINOv2 (ViT-S/14) | PyTorch ViT | 518x518 | Extractor de características | 88,2 MB | 202,6 ms/parche | 4,9 | Pipeline legado |

No se han publicado resultados de benchmarks de precisión (mAP, precisión, recall, F1) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el artefacto principal está pensado para CPU. En GPU, el modelo de 21,6 MB ocuparía menos de 1 GB de VRAM, pero no se proporcionan medidas.
- GPU recomendadas: no se especifican; el diseño está orientado a CPU y a despliegue en el borde.
- Cabe en GPU de consumo: sí, cualquier GPU con más de 1 GB de VRAM podría ejecutarlo, aunque no es el objetivo declarado.
- Cabe en hardware embebido: sí, el formato ONNX de 21,6 MB y la latencia de 52,4 ms en CPU sugieren viabilidad en placas tipo Raspberry Pi o Jetson, aunque la model card no indica el hardware exacto de la medición.
- Opciones de despliegue: ONNX Runtime (proveedor CPU), PyTorch para los `.pt`, e integración con ROS2 según los tags del repositorio.
- Latencia y throughput: 52,4 ms y 19,1 FPS para `best.onnx` en CPU; 1209,3 ms y 0,8 FPS para `best.pt` en CPU; 375,0 ms y 2,7 FPS para `smartweeder_best.pt` en CPU. No se especifica la CPU utilizada en las mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Latencia CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `best.onnx` (este repo) | no disponible (21,6 MB) | 256x320 | 9 | 52,4 ms | MIT | Hugging Face |
| `smartweeder_best.pt` (este repo) | no disponible (5,9 MB) | 640x640 | 2 | 375,0 ms | MIT | Hugging Face |
| DINOv2 ViT-S/14 | no disponible (88,2 MB) | 518x518 | extractor de características | 202,6 ms/parche | no disponible en la información | Hugging Face (`facebook/dinov2-small`) |
| YOLOv8s estándar (Ultralytics) | no disponible en la información | 640x640 | 80 (COCO) | no disponible en la información | AGPL-3.0 (Ultralytics) | GitHub / pip |

La comparación con YOLOv8s estándar es relevante porque el modelo de este repositorio es un fine-tuning de esa arquitectura sobre 9 clases agrícolas, pero no se dispone de datos de precisión para comparar rendimiento predictivo. No se han identificado otros modelos comparables específicos de desherbado en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en esas categorías es inadecuado.
- No se publican métricas de precisión (mAP, recall, F1) ni detalles del dataset de entrenamiento, lo que impide evaluar su robustez real en campo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación por terceros.
- La latencia de 52,4 ms está medida en CPU sin especificar el hardware; en placas embebidas de gama baja el rendimiento puede degradarse.
- El modelo está entrenado para 9 clases concretas de cultivo; la detección de especies no incluidas o de malas hierbas atípicas puede fallar.
- La localización 3D depende de la calibración de la cámara ToF (pitch de 30°, altura de 200 mm) y de los parámetros intrínsecos; una mala calibración produce consignas de servo erróneas.
- La licencia MIT permite uso comercial, pero el modelo se apoya en la arquitectura YOLOv8 de Ultralytics, cuya licencia AGPL-3.0 puede imponer obligaciones adicionales según el uso; conviene revisarlo antes de producción.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, con consecuencias físicas (daño al cultivo o a la herramienta).
- No se especifican sesgos de dataset ni la distribución geográfica o estacional de las imágenes de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/bayazidhs04/semi-autonomous-weeding-robot-models
- Repositorio del proyecto en GitHub: https://github.com/BayazidHabibSiddikee/Semi-Autonomous-Weeding-Robot
- Dataset referenciado: `agricultural-crops-and-weeds` (en Hugging Face, según los tags del repositorio)
- DINOv2 ViT-S/14 (referencia comparativa): https://huggingface.co/facebook/dinov2-small
