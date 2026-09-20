# piero123/yolo_wood_pallet_v4_yw01_init

## Resumen

YOLO_WOOD PALLET V4 / YW-01 es un repositorio de inicialización para entrenar un detector de objetos de la familia YOLO especializado en el dominio de palés de madera. Lo publica el usuario `piero123` en Hugging Face y su función no es servir un modelo listo para producción, sino actuar como punto de partida reproducible: parte del checkpoint donante `checkpoints/YW01_yolo26s_1024/best.pt` del repositorio `piero123/Yolo_wood` y transfiere explícitamente los tensores compatibles hacia una nueva cabeza de detección.

La arquitectura declarada es YOLO26s, un detector one-stage de 9.992.928 parámetros, de los cuales se transfirieron 9.985.962 (el 99,9303 %); los tensores descartados por incompatibilidad de forma pertenecen todos a la cabeza Detect final. El cambio de dominio va de 10 clases de madera a 9 clases de palé, lo que obliga a reinicializar esa cabeza y a reentrenar sobre el dataset `YOLO_PALLET_V4_RARE_BALANCED`, con 4.033 imágenes y 68.105 anotaciones de entrenamiento a una resolución de entrada de 1280 píxeles.

Su relevancia es acotada pero concreta para quien trabaja en visión artificial industrial: documenta con precisión el linaje del modelo, el hash SHA256 del donante y la configuración completa de entrenamiento, algo poco habitual en repositorios pequeños. En el momento de redactar esta ficha acumula 0 descargas y 0 me gusta, no declara licencia ni pipeline de inferencia, y no publica ninguna métrica de validación o test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de objetos one-stage) |
| Parámetros totales | 9.992.928 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión. Resolución de entrenamiento de 1280 px |
| Tipos de cuantización | No disponible (no se declaran pesos cuantizados) |
| Idiomas soportados | No aplica / no disponible: el modelo procesa imágenes, no texto |
| Licencia | No disponible |
| Formato de pesos | No declarado en este repositorio; el checkpoint donante es PyTorch (`.pt`) |
| Número de clases | 9 clases de palé (frente a las 10 clases de madera del donante) |
| Resolución de entrenamiento | 1280 px (`imgsz: 1280`) |
| Dataset | `YOLO_PALLET_V4_RARE_BALANCED` |
| Tamaño del repositorio | 2,3 GB |
| Descargas / me gusta | 0 / 0 |
| Pipeline de Hugging Face | No disponible |

## Arquitectura y entrenamiento

La arquitectura es un detector one-stage de la familia YOLO, identificado por el autor como YOLO26s. No se detalla en la información disponible si se trata de un diseño con anclas o sin anclas, ni la composición interna de backbone, neck y cabeza, más allá de la referencia explícita a una «cabeza Detect final». El repositorio parte de un donante congelado (`piero123/Yolo_wood`, checkpoint `YW01_yolo26s_1024/best.pt`, SHA256 `6a47311f14203a7393d1ba7fe96f039898dae3ab14bcd12dc9ddd1e547bc4735`) y realiza una transferencia explícita de tensores: 9.985.962 de 9.992.928 parámetros (99,9303 %) pasan al nuevo modelo. Todos los tensores incompatibles se verificaron como pertenecientes a la cabeza Detect, que queda por tanto reinicializada y debe reentrenarse desde cero.

El dataset objetivo es `YOLO_PALLET_V4_RARE_BALANCED`, con 4.033 imágenes y 68.105 anotaciones en entrenamiento, y 28 imágenes y 1.111 anotaciones en validación. El conjunto de test no se utilizó durante la inicialización ni la configuración del entrenamiento. La configuración declarada incluye 160 épocas máximas con paciencia de 30, optimizador AdamW, programación de tasa de aprendizaje coseno, 5 épocas de warmup, semilla 42, precisión mixta automática (AMP) y un esquema de ponderación de clases moderadamente equilibrado. No se indica el número total de tokens ni de muestras procesadas, ni si hubo fases de ajuste por refuerzo; el nombre del dataset sugiere un rebalanceo orientado a clases poco frecuentes, pero no se documenta el método exacto.

## Capacidades

- Detección de objetos en imágenes para 9 clases del dominio de palés de madera. La información disponible no enumera cuáles son esas 9 clases.
- Procesamiento a resolución de 1280 px, adecuado para objetos con detalle fino o escenas con palés alejados de la cámara.
- Transferencia de conocimiento desde un dominio afín (madera, 10 clases) hacia el dominio de palé (9 clases), lo que reduce el coste de convergencia frente a un entrenamiento desde cero.
- Entrenamiento con ponderación de clases equilibrada, orientado a mejorar el recuerdo en clases con pocas instancias.
- Entrenamiento con AMP, lo que reduce el consumo de memoria y acelera el ajuste en GPU compatibles.
- Punto de partida reproducible para fine-tuning propio: el autor documenta el hash del donante y el recuento exacto de tensores transferidos.

Capacidades no soportadas o no documentadas:

- No dispone de tool calling, function calling ni soporte de agentes.
- No realiza razonamiento multi-paso, generación de texto, código ni matemáticas.
- No es un modelo multimodal: no hay componente de lenguaje, audio ni OCR.
- No se declaran capacidades multilingües, al operar exclusivamente sobre imágenes.

## Casos de uso

- Inspección en línea de producción de palés: el modelo se integraría en una cámara industrial sobre la cinta transportadora para clasificar y detectar cada palé a 1280 px, resolución que permite identificar elementos pequeños de la estructura del palé.
- Control de calidad y detección de defectos: dado el rebalanceo hacia clases poco frecuentes del dataset, el detector está pensado para no ignorar categorías minoritarias, lo que encaja con la detección de daños o anomalías poco representadas estadísticamente.
- Conteo e inventario en almacén: con visión cenital o frontal, el modelo puede contabilizar pilas y palés por referencia, sustituyendo el recuento manual en operaciones de alto volumen.
- Automatización de carretillas y AGV: la salida de detección puede alimentar el módulo de percepción de un vehículo autónomo de almacén para localizar palés y planificar la aproximación de la horquilla.
- Logística inversa y gestión de retornos: clasificación automática de palés entrantes según su estado o tipología antes de decidir su reutilización, reparación o descarte.
- Auditoría de stock mediante dron o cámara elevada: la resolución de 1280 px permite trabajar desde alturas mayores sin perder capacidad de detección sobre palés apilados.
- Base para un modelo propio de dominio: el flujo de transferencia documentado (donante congelado, transferencia selectiva de tensores, reentrenamiento de la cabeza Detect) sirve como plantilla para adaptar el detector a otras categorías industriales.
- Verificación de carga y seguridad: detección de apilados inestables o palés mal posicionados antes de autorizar el movimiento de una carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de validación (mAP, precisión, recuerdo) ni resultados sobre el conjunto de test, que además no se utilizó durante la inicialización.

Los únicos datos cuantitativos publicados en la model card son los del dataset y del proceso de transferencia:

| Elemento | Valor |
|---|---|
| Imágenes de entrenamiento | 4.033 |
| Anotaciones de entrenamiento | 68.105 |
| Imágenes de validación | 28 |
| Anotaciones de validación | 1.111 |
| Uso de test en inicialización/entrenamiento | No |
| Parámetros transferidos | 9.985.962 / 9.992.928 (99,9303 %) |
| Tensores incompatibles | Pertenecen a la cabeza Detect final |

## Requisitos de hardware

Las cifras siguientes son estimaciones del editor derivadas del número de parámetros (9.992.928) y de la resolución de entrada (1280 px). El autor no publica requisitos de hardware, latencias ni throughput, por lo que deben tratarse como orientativas y no como datos confirmados.

- Inferencia en FP16: aproximadamente 2-4 GB de VRAM a 1280 px, dependiendo del tamaño de lote y de si se aplica TensorRT u otra optimización.
- Inferencia en FP32: del orden de 3-6 GB de VRAM, con mayor latencia.
- Entrenamiento con AMP a 1280 px: del orden de 8-12 GB de VRAM para lotes moderados; la memoria crece de forma aproximadamente lineal con el tamaño de lote.
- GPU de consumo: cabe con holgura en tarjetas de 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En tarjetas de 6-8 GB es viable para inferencia, pero el entrenamiento exigiría lotes pequeños o resolución reducida.
- GPU de centro de datos: A100, H100 o L40S permiten lotes grandes y entrenamiento más rápido; son adecuadas para reentrenar sobre las 4.033 imágenes del dataset.
- Opciones de despliegue: no declaradas por el autor. Al ser un modelo YOLO, la exportación previsible es a PyTorch, ONNX, TensorRT, OpenVINO o TFLite, pero la información disponible no confirma ninguno de estos formatos en este repositorio.
- Latencia y throughput: no disponibles. No se publican FPS ni tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de resultados comparativos medidos bajo el mismo protocolo. La tabla siguiente recoge únicamente datos de referencia públicos de otros detectores one-stage de tamaño pequeño, que no han sido verificados en esta ficha y que no deben interpretarse como una comparación de rendimiento.

| Modelo | Parámetros | Resolución típica | Contexto / clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo_wood_pallet_v4_yw01_init (YOLO26s) | 9.992.928 (según el autor) | 1280 px | 9 clases de palé | No disponible | Hugging Face, 0 descargas |
| YOLOv8s | valor de referencia no verificado (aproximadamente 11 M) | 640 px por defecto | Configurable | AGPL-3.0 (referencia externa) | Amplia |
| YOLO11s | valor de referencia no verificado (aproximadamente 9,4 M) | 640 px por defecto | Configurable | AGPL-3.0 (referencia externa) | Amplia |
| Detector específico de dominio entrenado desde cero | No disponible | No disponible | Variable | No disponible | No disponible |

No se han encontrado comparativas publicadas entre este modelo y alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no es posible asumir uso comercial ni redistribución. Cualquier integración en producción requiere aclarar previamente la licencia con el autor.
- Repositorio de inicialización, no de modelo final: la model card indica que el repositorio «recibirá» los checkpoints y artefactos del nuevo entrenamiento. En el momento de esta ficha no se confirma la publicación de un checkpoint entrenado y evaluado.
- Ausencia total de métricas: no hay mAP, precisión, recuerdo ni curvas de entrenamiento publicadas, por lo que no se puede estimar la calidad real del detector.
- Validación estadísticamente débil: el conjunto de validación tiene solo 28 imágenes, frente a las 4.033 de entrenamiento. Cualquier métrica derivada de ese conjunto tendría un intervalo de confianza muy amplio.
- Sin conjunto de test utilizado: no existe una evaluación independiente reportada, lo que impide descartar sobreajuste.
- Cabeza Detect reinicializada: aunque el 99,9303 % de los parámetros se transfieren, la cabeza de detección se entrena desde cero, por lo que el modelo no es funcional para inferencia hasta completar el reentrenamiento.
- Sesgo de dominio: el dataset está etiquetado como «rare balanced», lo que sugiere un rebalanceo artificial de clases poco frecuentes. La composición exacta, la procedencia de las imágenes y las condiciones de captura no se documentan, por lo que se desconoce la robustez ante cambios de iluminación, cámara o tipo de palé.
- Sesgo de dominio industrial: un detector entrenado sobre una única fuente de imágenes de palés puede degradarse notablemente en entornos con fondos, ángulos o materiales distintos a los del dataset original.
- Riesgo de falsos negativos y positivos no cuantificado: al no haber métricas, no es posible fijar umbrales de confianza justificados para un despliegue real.
- Arquitectura no verificable con la información disponible: no se aclara a qué implementación concreta corresponde la denominación «YOLO26s» ni su compatibilidad con herramientas estándar.
- Coste computacional elevado en inferencia: la resolución de 1280 px implica un coste muy superior al de los 640 px habituales en detectores de este tamaño, lo que reduce el throughput en hardware de gama media.
- Idiomas y texto no soportados: el modelo no procesa lenguaje natural ni realiza OCR, por lo que no sirve para leer etiquetas o códigos impresos en los palés.
- Trazabilidad del donante: el autor declara el hash SHA256 del checkpoint donante, lo que permite verificar su integridad, pero no se documenta el proceso de anotación ni la calidad de las etiquetas del dataset de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/piero123/yolo_wood_pallet_v4_yw01_init
- Repositorio donante (madera, congelado): https://huggingface.co/piero123/Yolo_wood
- Búsquedas web: no se han encontrado enlaces relevantes. Los resultados recuperados corresponden a un sitio de viajes en autobús sin relación alguna con el modelo, por lo que no se incluyen. No se han localizado publicaciones, artículos, papers ni repositorios de código asociados a este modelo en la información disponible.
