# DangKhoa09/yolo26-vietnamese-money

## Resumen

YOLO26 Vietnamese Money es un modelo de detección de objetos basado en la arquitectura YOLO26 de Ultralytics, especializado en el reconocimiento de los nueve billetes del dong vietnamita (de 1.000 a 500.000 VND). Lo desarrolla DangKhoa09 y se distribuye con licencia MIT a través de Hugging Face, con pesos en formato PyTorch (`.pt`) compatibles con la librería `ultralytics`. El modelo no genera texto ni razona: es un detector puro de una sola etapa pensado para integrarse en aplicaciones de visión por computador.

El problema que resuelve es concreto: identificar y clasificar billetes vietnamitas en imágenes para, a partir de las detecciones, sumar automáticamente el efectivo presente (la model card lo describe como "Smart Calculator"). Esto lo hace útil en aplicaciones de accesibilidad para personas con discapacidad visual, en cajas de autoservicio, en procesos de conteo de efectivo o en herramientas educativas de reconocimiento de moneda.

La relevancia técnica está en la generación YOLO26, que según el autor emplea una arquitectura "NMS-Free End-to-End" (sin supresión de no máximos en posprocesado). El modelo se entrenó sobre el dataset de Roboflow `blindtrix/money_vn_regconization-2-cumhs`, con 10.116 imágenes. No se especifican en la información disponible el tamaño concreto de la variante (n, s, m, l o x), el número de parámetros ni los resultados de métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detección de objetos end-to-end sin NMS según el autor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt`; no se documentan exportaciones a ONNX, TensorRT o INT8) |
| Idiomas soportados | vi, en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26, la generación más reciente de la familia YOLO de Ultralytics. Según la model card, incorpora una arquitectura "NMS-Free End-to-End", lo que implica que el modelo produce las detecciones finales directamente sin necesidad de aplicar supresión de no máximos como paso posterior. No se detalla en la información proporcionada la variante de tamaño, el backbone, la cabeza de detección ni el número de parámetros.

El entrenamiento se realizó sobre el dataset `blindtrix/money_vn_regconization-2-cumhs`, alojado en Roboflow, con 10.116 imágenes anotadas para las nueve denominaciones. No se especifican en la información disponible el número de épocas, el tamaño de entrada, las técnicas de aumento de datos, la composición exacta del dataset ni si se aplicaron fases de ajuste fino adicionales. Tampoco se documenta el uso de destilación, cuantización u otras optimizaciones.

## Capacidades

- Detección de objetos en imágenes con 9 clases correspondientes a billetes vietnamitas: 1.000, 2.000, 5.000, 10.000, 20.000, 50.000, 100.000, 200.000 y 500.000 VND.
- Localización con cajas delimitadoras (bounding boxes) y etiqueta de clase por instancia detectada.
- Cálculo agregado del total de efectivo: la aplicación de referencia suma las denominaciones detectadas para obtener el importe total.
- Inferencia en una sola pasada (end-to-end sin NMS), lo que simplifica el pipeline de posprocesado.
- Integración nativa con la librería `ultralytics` en Python mediante `YOLO(...).predict(...)`.
- No soporta generación de texto, razonamiento, tool calling, agentes, visión general (VQA) ni audio. Es exclusivamente un detector visual.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: integrado en una aplicación móvil que captura una imagen del dinero en mano y devuelve por voz la denominación y el total; el detector identifica cada billete y la app sintetiza el resultado.
- Conteo de efectivo en comercio minorista: una cámara sobre la caja o el mostrador detecta los billetes apilados o extendidos y calcula el total, reduciendo el error humano en arqueos de caja.
- Cajas de autoservicio y máquinas de cobro: el modelo actúa como primer filtro de reconocimiento de denominación antes de la validación con hardware específico (sensores ópticos, lectores de billetes).
- Herramientas educativas y de formación: aplicaciones que enseñan a reconocer billetes vietnamitas, mostrando la clase detectada y el valor sobre la imagen en tiempo real.
- Automatización de inventario y auditoría de efectivo: procesamiento por lotes de fotografías de cajas fuertes o sobres para generar un recuento preliminar y detectar discrepancias.
- Prototipado rápido de aplicaciones de visión: al estar disponible como pesos `.pt` con licencia MIT, sirve como punto de partida para fine-tuning sobre otras divisas o condiciones de captura específicas.
- Investigación en detección de objetos: útil como caso de estudio de YOLO26 en un dominio de grano fino (nueve clases visualmente similares) con un dataset público de más de 10.000 imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP50, mAP50-95, precisión, recall ni curvas de entrenamiento, y tampoco se aportan comparaciones con otras variantes de YOLO.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no conocerse la variante de YOLO26 (n, s, m, l o x) ni el número de parámetros, no es posible estimar el consumo de memoria con rigor.
- GPU recomendadas: no disponible por la misma razón; en general, las variantes pequeñas de YOLO se ejecutan en GPUs de consumo y las grandes requieren GPUs de datacenter (A100, H100) para entrenamiento o lotes grandes.
- GPU de consumo: probablemente viable en RTX 3060, RTX 4060 o superiores si se trata de una variante n o s, pero no se confirma en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `ultralytics` en Python con los pesos `best.pt`. No se documentan exportaciones a ONNX, TensorRT, OpenVINO, CoreML, TFLite ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un detector visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26 Vietnamese Money (este modelo) | Detector YOLO26 | 9 denominaciones VND | 10.116 imágenes (Roboflow) | MIT | Hugging Face, pesos `.pt` |
| YOLOv8 / YOLO11 (Ultralytics, genéricos) | Detectores de propósito general | 80 clases COCO | COCO | AGPL-3.0 (con opción comercial) | Ultralytics, Hugging Face |
| Detectores especializados en divisas (varios autores) | YOLO o Faster R-CNN | Variable según divisa | No disponible | Variable | Repositorios comunitarios |

La comparación directa con alternativas específicas de reconocimiento de billetes vietnamitas no está disponible en la información proporcionada. Frente a los modelos genéricos de Ultralytics, la diferencia principal es la especialización en las nueve denominaciones y la licencia MIT, más permisiva que la AGPL-3.0 por defecto de Ultralytics.

## Limitaciones y advertencias

- No se documentan métricas de rendimiento (mAP, precisión, recall), por lo que no es posible evaluar su fiabilidad antes de desplegarlo.
- El modelo solo reconoce billetes vietnamitas de las nueve denominaciones listadas; no cubre monedas, billetes de otras divisas ni denominaciones retiradas o conmemorativas.
- Riesgo de falsos positivos y negativos en condiciones de iluminación adversa, billetes arrugados, parcialmente ocultos, girados o con desgaste; no se documenta el comportamiento en estos escenarios.
- El recuento automático de efectivo depende de que todas las instancias sean detectadas; una detección perdida produce un total incorrecto, por lo que no debe usarse como único mecanismo en contextos financieros sin validación adicional.
- No se documentan sesgos del dataset (posibles desequilibrios entre denominaciones, condiciones de captura, geografía o dispositivos).
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones de Ultralytics y del dataset de Roboflow si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se especifica la variante de YOLO26, lo que impide planificar requisitos de cómputo y latencia con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DangKhoa09/yolo26-vietnamese-money
- Repositorio GitHub del autor: https://github.com/bentovnace/Yolo26-Vietnamese-Money
- Dataset en Roboflow: `blindtrix/money_vn_regconization-2-cumhs`
- Pesos del modelo: https://huggingface.co/DangKhoa09/yolo26-vietnamese-money/resolve/main/best.pt
- Documentación de Ultralytics: https://docs.ultralytics.com/
