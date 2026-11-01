# Blaize-AI/YOLO11m_COCO

## Resumen

YOLO11m_COCO es una implementación del detector de objetos YOLO11 Medium de Ultralytics, optimizada por Blaize-AI para su despliegue sobre aceleradores de inferencia de borde Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje ni de un transformer generativo: es un detector de objetos convolucional de una etapa, entrenado sobre el dataset COCO 2017, que ha sido recompilado y cuantizado para ejecutarse de forma nativa sobre la arquitectura Graph Streaming Processor (GSP) de Blaize.

El modelo original procede de Ultralytics (versión 11.0, framework PyTorch) y conserva la licencia AGPL-3.0-only, con la alternativa de licencia empresarial de Ultralytics. Blaize no modifica el código fuente del modelo, sino que realiza optimizaciones específicas de hardware para generar artefactos binarios `.bm` compatibles con su acelerador.

La relevancia de esta ficha es acotada y muy específica: el repositorio no contiene pesos en formato estándar (safetensors, GGUF, ONNX), sino binarios propietarios para hardware Blaize. Su utilidad real depende de disponer de un acelerador Xplorer y del SDK Picasso instalado; fuera de ese ecosistema el artefacto no es directamente ejecutable. El tamaño del repositorio es de 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos de una etapa (YOLO11 Medium, familia YOLOv11 de Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8, BF16 y AMP (mezcla INT8 + BF16); las variantes publicadas usan AMP |
| Idiomas soportados | no disponible (modelo de visión; las clases detectadas están en inglés por el etiquetado COCO) |
| Licencia | AGPL-3.0 (el modelo original admite también LicenseRef-Ultralytics-Enterprise-License) |
| Formato de pesos | `.bm` (binario propietario para Blaize GSP); no se publican safetensors, GGUF ni ONNX |

Variantes publicadas en el repositorio:

| Variante | Cuantizacion | Resolucion de entrada (W×H) | Fichero |
|---|---|---|---|
| YOLO11m_COCO_amp_416_256 | AMP | 416×256 | `YOLO11m_COCO_amp_416_256.bm` |
| YOLO11m_COCO_amp_416_416 | AMP | 416×416 | `YOLO11m_COCO_amp_416_416.bm` |
| YOLO11m_COCO_amp_640_384 | AMP | 640×384 | `YOLO11m_COCO_amp_640_384.bm` |
| YOLO11m_COCO_amp_640_640 | AMP | 640×640 | `YOLO11m_COCO_amp_640_640.bm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11 Medium de Ultralytics, un detector de una etapa basado en convoluciones con extracción de características multiescala y cabecera de predicción densa, diseñado para equilibrio entre precisión y coste computacional en inferencia. El modelo se entrenó sobre COCO 2017 (licencia CC-BY-4.0, atribución al COCO Consortium), el conjunto de referencia de 80 clases para detección de objetos.

La contribución de Blaize-AI no es de entrenamiento sino de despliegue: el modelo PyTorch original se ha compilado y optimizado para la arquitectura GSP, que organiza la ejecución como un grafo de cómputo orientado a eficiencia energética y baja latencia en el borde. Se ofrecen tres esquemas de cuantización (INT8 con escalado de punto fijo para máxima velocidad, BF16 para máxima precisión y AMP como compromiso), aunque las cuatro variantes efectivamente publicadas emplean AMP. No se documentan en la información disponible el número de parámetros, el volumen de tokens de entrenamiento (no aplica en el sentido habitual), ni detalles de aumentación de datos o de la receta de entrenamiento original.

## Capacidades

- Detección de objetos en imágenes con las 80 clases del dataset COCO 2017 (personas, vehículos, animales, mobiliario, utensilios, etc.).
- Salida de cajas delimitadoras con puntuaciones de confianza y etiquetas de clase, en el formato propio del pipeline de Blaize Picasso SDK.
- Ejecución sobre acelerador Blaize Xplorer (GSP) con las variantes cuantizadas INT8, BF16 y AMP.
- Soporte de múltiples resoluciones de entrada: 416×256, 416×416, 640×384 y 640×640, lo que permite ajustar latencia y precisión según el caso de uso.
- Inspección del artefacto mediante la utilidad `blaize-modeltool` del SDK.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni modo thinking: es exclusivamente un detector visual.
- Capacidades multilingües: no aplica; las etiquetas de clase provienen del etiquetado COCO en inglés.

## Casos de uso

- Videovigilancia en el borde: el modelo puede procesar flujos de cámara directamente en un dispositivo con acelerador Xplorer, detectando personas y vehículos sin enviar vídeo a la nube, gracias a la orientación del GSP a bajo consumo y baja latencia.
- Analítica de tráfico urbano: con la variante 640×640 se pueden contar vehículos y peatones por fotograma en intersecciones; la resolución 640×384 ofrece un compromiso útil para cámaras con relación de aspecto panorámica.
- Control de calidad industrial: detección de objetos o componentes en cadenas de montaje, usando la variante 416×416 para minimizar latencia cuando las piezas son de gran tamaño en la imagen.
- Retail y análisis de lineal: detección de productos y personas en imágenes de estanterías o puntos de venta, aprovechando la cuantización INT8 para reducir el coste energético del dispositivo.
- Robótica y sistemas autónomos embebidos: percepción de obstáculos y objetos cercanos en plataformas con presupuesto térmico y energético limitado, donde el formato `.bm` evita la sobrecarga de un runtime genérico.
- Preprocesado en pipelines de visión documental o logística: localización de bultos, etiquetas o elementos en imágenes capturadas por escáneres, con la variante 416×256 para imágenes muy apaisadas.
- Prototipado con Picasso SDK: validación de flujos de compilación y despliegue de modelos YOLO en hardware Blaize antes de migrar a variantes de mayor tamaño (YOLO11l o YOLO11x).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni throughput para ninguna de las variantes, ni comparaciones con el modelo YOLO11m original en PyTorch.

## Requisitos de hardware

- Hardware obligatorio: acelerador Blaize Xplorer AI (arquitectura GSP). El artefacto `.bm` no es ejecutable en GPU convencional ni en CPU sin el SDK correspondiente.
- Software: Blaize Picasso SDK instalado y configurado; utilidad `blaize-modeltool` para inspección.
- VRAM estimada: no aplica en el sentido de GPU; la memoria requerida es la del acelerador Xplorer, no documentada en la información disponible.
- GPU recomendadas: no aplica; el modelo no se distribuye en formato para CUDA, ROCm ni Metal.
- Compatibilidad con GPU de consumo: no. No hay pesos en safetensors, GGUF ni ONNX que permitan ejecutarlo con llama.cpp, Ollama, vLLM, TGI o TensorRT.
- Opciones de despliegue: exclusivamente mediante el runtime de Blaize Picasso SDK sobre hardware Xplorer.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de entrada | Contexto / clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blaize-AI/YOLO11m_COCO | Detector YOLO11m optimizado para GSP | 416×256 a 640×640 | 80 clases COCO | AGPL-3.0 | Solo hardware Blaize (`.bm`) |
| Ultralytics YOLO11m (original) | Detector YOLO11m en PyTorch | Configurable, habitualmente 640×640 | 80 clases COCO | AGPL-3.0 o enterprise | Pesos `.pt`, exportable a ONNX/TensorRT |
| YOLOv8m (Ultralytics) | Detector de la generación anterior | Configurable, habitualmente 640×640 | 80 clases COCO | AGPL-3.0 o enterprise | Pesos `.pt`, amplio soporte de runtimes |
| Detectores de una etapa tipo SSD o RetinaNet | Detector CNN clásico | Variable | 80 clases COCO (si se entrena en COCO) | Variable según implementación | Frameworks estándar (PyTorch, TensorFlow) |

La diferencia clave frente a las alternativas no es de precisión ni de arquitectura, sino de formato y plataforma: el original de Ultralytics y YOLOv8m son portables a múltiples runtimes, mientras que esta variante está atada al hardware Blaize. No se dispone de datos de rendimiento comparativo para cuantificar la diferencia.

## Limitaciones y advertencias

- Dependencia total de hardware propietario: sin un acelerador Blaize Xplorer y el SDK Picasso, el modelo no se puede ejecutar. No hay pesos portables publicados.
- La licencia AGPL-3.0 impone obligaciones fuertes para uso en red y para la distribución de obras derivadas; para uso comercial cerrado es necesario evaluar la licencia empresarial de Ultralytics sobre el modelo original.
- El modelo se distribuye como contenido de terceros: Blaize declara explícitamente que no revisa, aprueba ni garantiza los modelos, y no ofrece ninguna garantía sobre su funcionamiento ni sobre posibles infracciones de propiedad intelectual.
- Sesgos: al estar entrenado sobre COCO 2017, hereda los sesgos de representación y anotación de ese dataset (predominio de escenas y objetos de ciertos contextos geográficos y culturales).
- Riesgo de falsos positivos y negativos en condiciones de baja iluminación, oclusión, objetos pequeños o dominios visuales alejados de COCO; no se documentan métricas de robustez.
- Limitación de vocabulario visual: solo detecta las 80 clases de COCO; no reconoce categorías fuera de ese conjunto sin reentrenamiento.
- Las variantes publicadas usan AMP; no se ofrecen artefactos INT8 puros ni BF16 puros pese a que la model card describe esos métodos, lo que limita el ajuste fino de precisión frente a velocidad.
- No hay información sobre latencia, consumo energético ni precisión (mAP) de las variantes, lo que impide dimensionar un despliegue en producción sin mediciones propias.
- El repositorio no registra descargas ni interacciones, y las fechas de creación y actualización son de 2026, lo que sugiere un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/YOLO11m_COCO
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO: https://cocodataset.org
- Sitio de Blaize: https://www.blaize.com
