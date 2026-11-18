# JatheelMHD/circuitcoach-yolo26n

## Resumen

CircuitCoach AI — YOLO26n es un modelo de detección de objetos especializado en componentes electrónicos y de robótica, desarrollado por el usuario JatheelMHD como pieza central de CircuitCoach AI, un asistente de aprendizaje para principiantes en electrónica. El modelo identifica 61 clases de componentes (placas Arduino, sensores, módulos, partes pasivas, interruptores, displays) en una fotografía, devolviendo para cada uno una caja delimitadora, una etiqueta de clase y una puntuación de confianza.

Se trata de un fine-tuning de Ultralytics YOLO26n (2,4 millones de parámetros) partido de pesos preentrenados en COCO y ajustado sobre el conjunto de datos ElectroCom61 (CC BY 4.0), limpiado y reparticionado por el autor. Se distribuye en tres formatos: pesos PyTorch `.pt`, LiteRT float32 `.tflite` y LiteRT w8a32 `.tflite`, este último pensado para su despliegue en Android dentro de la aplicación CircuitCoach.

El modelo es relevante por su enfoque vertical: no compite en detección generalista sino que resuelve una tarea concreta de reconocimiento de material electrónico de bajo voltaje con métricas declaradas sobre un conjunto de test reservado (mAP50 de 0,958). Su tamaño reducido y su empaquetado en LiteRT lo hacen apto para inferencia en dispositivos móviles, lo que encaja con el caso de uso educativo para el que fue diseñado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parámetros totales | 2,4 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | float32 y w8a32 en LiteRT; pesos PyTorch sin cuantizar |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt`, LiteRT `.tflite` (float32 y w8a32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura YOLO26n de Ultralytics, un detector de objetos de una sola etapa con backbone y cabeza de detección ligeros, dimensionado para 2,4 millones de parámetros. Se parte de pesos preentrenados en COCO y se realiza un fine-tuning supervisado sobre el conjunto ElectroCom61, que el autor limpió y volvió a particionar para obtener un split de test reservado de 230 imágenes con 1.294 cajas, nunca usado en entrenamiento ni en selección de modelo.

No se detalla en la información disponible el número de tokens ni la composición exacta del dataset más allá de su procedencia (ElectroCom61, CC BY 4.0) y del número de imágenes del split de test. Tampoco se especifica si hubo aumento de datos, técnicas de destilación, RLHF/DPO (no aplicables a un detector) ni innovaciones de decodificación. La innovación principal es el empaquetado en LiteRT con cuantización w8a32 para despliegue en Android, junto con la definición de un vocabulario de 61 clases específicas del dominio electrónico.

## Capacidades

- Detección de objetos en imágenes: devuelve caja delimitadora, clase y confianza para cada componente.
- Reconocimiento de 61 clases de componentes electrónicos y de robótica: placas Arduino (Uno, Nano, Mega), ESP32, ESP32-CAM, sensores (IR, LDR, gas, humedad, movimiento, sonar, lluvia, humedad de suelo, temperatura NTC), módulos (Bluetooth, GSM, RFID, FT-232, relé, buck converter, puente rectificador), displays (7 segmentos, LCD, OLED), componentes pasivos (resistencias, condensadores de varios tipos, inductores, potenciómetros), semiconductores (diodos, diodo Zener, BJT, MOSFET, IGBT), interruptores (pulsador, táctil, basculante), actuadores (servo, motor DC, zumbador), conectores y accesorios (zócalos IC de 14 y 28 pines, tiras de pines, disipador, portafusibles, fusible, breadboard).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector puro.
- No tiene capacidades multilingües ni de generación de texto.
- Capacidad específica de despliegue móvil mediante LiteRT w8a32.

## Casos de uso

- Asistente educativo de electrónica para principiantes: el modelo detecta los componentes presentes en una foto del escritorio del alumno y la aplicación CircuitCoach AI les asocia nombre y función; encaja por su vocabulario de 61 clases y su empaquetado LiteRT para Android.
- Inventario de kits educativos: fotografiar el contenido de un kit de robótica y generar automáticamente una lista de piezas con conteo, usando la detección con confianza umbral 0,25 para filtrar falsos positivos.
- Verificación de material antes de una práctica de laboratorio: comprobar que el alumno dispone de las piezas requeridas (por ejemplo, Arduino Uno, breadboard, resistencias, LEDs) antes de comenzar el montaje.
- Documentación automática de prototipos: etiquetar fotografías de montajes con los componentes visibles para generar diagramas o fichas de proyecto.
- Aplicación móvil offline de reconocimiento de componentes: gracias a los 2,4 M de parámetros y al formato w8a32, puede ejecutarse en un teléfono Android sin conexión, útil en aulas con conectividad limitada.
- Clasificación y organización de cajones de componentes: fotografiar un compartimento y obtener las etiquetas de las piezas para inventariado doméstico o de taller.
- Filtro previo en pipelines de visión para robótica educativa: detectar piezas sobre una mesa de trabajo antes de un paso de manipulación o inspección.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test reservado (230 imágenes, 1.294 cajas):

| Métrica | Valor |
|---|---|
| Precisión | 0,926 |
| Recall | 0,940 |
| mAP50 | 0,958 |
| mAP50-95 | 0,649 |
| Inferencia (NVIDIA T4, PyTorch) | 5,2 ms/imagen |

A confianza 0,25 e IoU 0,5: 1.208 de 1.294 piezas detectadas con la clase correcta, 14 con clase errónea, 72 no detectadas y 97 cajas extra.

Clases más débiles declaradas por el autor:

| Clase | Cajas test | P | R | mAP50 | mAP50-95 |
|---|---|---|---|---|---|
| Zener-Diode | 23 | 0,74 | 0,78 | 0,730 | 0,371 |
| Tact-Switch | 21 | 0,79 | 0,89 | 0,816 | 0,349 |
| Motor-Driver | 18 | 0,88 | 0,78 | 0,825 | 0,658 |
| Push-Switch | 26 | 0,78 | 0,81 | 0,855 | 0,437 |
| Buzzer | 26 | 0,82 | 0,81 | 0,867 | 0,498 |
| BJT-Transistor | 23 | 0,93 | 0,59 | 0,878 | 0,441 |
| Capacitor-10mf | 22 | 0,84 | 0,82 | 0,882 | 0,526 |
| Fuse | 18 | 0,97 | 0,78 | 0,905 | 0,568 |
| Servo-Motor | 17 | 0,89 | 0,92 | 0,917 | 0,633 |
| Keypad | 19 | 0,75 | 0,89 | 0,925 | 0,681 |

El autor advierte que son cifras de laboratorio: las imágenes de test provienen del mismo laboratorio que las de entrenamiento, por lo que la precisión esperada en un escritorio distinto será menor. No se han publicado resultados de benchmarks en la información disponible para el conjunto de fotos de teléfono fuera del laboratorio original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para el modelo de 2,4 M de parámetros; el modelo es trivial en memoria y el cuello de botella es la resolución de entrada, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta 5,2 ms/imagen en una NVIDIA T4 con PyTorch.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), y también en CPU para inferencia por lotes pequeños.
- Despliegue: Ultralytics (PyTorch), LiteRT/TFLite para Android, y exportación a otros formatos soportados por Ultralytics (ONNX, TensorRT, etc.) aunque no se listan explícitamente en la información disponible.
- Latencia y throughput: 5,2 ms/imagen en T4 con PyTorch; no se proporcionan cifras para LiteRT en móvil ni para CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CircuitCoach YOLO26n | 2,4 M | no aplica | mAP50 0,958 (test propio) | AGPL-3.0 | Hugging Face |
| YOLOv8n | no disponible en la información | no aplica | no disponible | AGPL-3.0 | Ultralytics |
| YOLO11n | no disponible en la información | no aplica | no disponible | AGPL-3.0 | Ultralytics |

No se dispone en la información proporcionada de métricas de modelos comparables sobre el mismo conjunto ElectroCom61, por lo que la comparación cuantitativa directa no está disponible. La comparación cualitativa relevante es que se trata de un detector de dominio específico (electrónica) frente a detectores generalistas de la familia YOLO, con un vocabulario cerrado de 61 clases.

## Limitaciones y advertencias

- Sesgos conocidos: el conjunto de entrenamiento y test procede del mismo laboratorio, por lo que el modelo puede sobreajustarse a condiciones de iluminación, fondo y ángulos concretos; el autor advierte de que la precisión en un escritorio distinto será menor.
- Riesgo de error en clases visualmente similares: el análisis de fallos del autor señala que las piezas pequeñas oscuras y redondas (zumbador, pulsador, inductor) y las piezas de dos terminales (diodo Zener, diodo) concentran la mayoría de errores; el recall de BJT-Transistor es solo 0,59.
- Falsos positivos: 97 cajas extra sobre 1.294 en el test a confianza 0,25.
- Limitación de dominio: solo detecta las 61 clases definidas; cualquier componente fuera de ese vocabulario no será reconocido.
- Restricción de seguridad explícita: diseñado para circuitos de aprendizaje de bajo voltaje (5 V o menos); no es una comprobación de seguridad y no debe usarse en instalaciones de red eléctrica. El modelo nombra piezas, no verifica si un circuito es correcto o seguro.
- Licencia AGPL-3.0: el uso comercial requiere cumplir las obligaciones de copyleft de la AGPL, lo que puede condicionar su integración en productos propietarios.
- No se han publicado resultados en el conjunto de fotos de teléfono fuera del laboratorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JatheelMHD/circuitcoach-yolo26n
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Conjunto de datos ElectroCom61 (CC BY 4.0): no disponible el enlace directo en la información proporcionada
- LiteRT: https://ai.google.dev/edge/litert
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
