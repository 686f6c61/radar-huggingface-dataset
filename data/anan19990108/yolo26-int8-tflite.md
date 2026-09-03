# anan19990108/yolo26-int8-tflite

## Resumen

El modelo `anan19990108/yolo26-int8-tflite` es un artefacto de evaluación comunitario que convierte el detector de objetos YOLO26n de Ultralytics a formato TensorFlow Lite con cuantización INT8 (W8A8). Desarrollado por el usuario anan19990108, este modelo está pensado para experimentos de ingeniería en entornos edge, especialmente runtimes de Qualcomm. No se trata de un lanzamiento oficial de Ultralytics, sino de una prueba de cuantización post-entrenamiento que busca reducir el tamaño y acelerar la inferencia en dispositivos con recursos limitados.

El artefacto principal es `yolo26n_w8a8.tflite`, un modelo de 640×640 píxeles con entradas y salidas en float32, mientras que los pesos y activaciones internos están cuantizados a INT8 (los tensores de bias y forma son INT32). Incluye un `quantization_report.json` que documenta checksums, tramas de calibración y el acuerdo entre el modelo flotante y el cuantizado. La licencia es AGPL-3.0, heredada del modelo base de Ultralytics, lo que restringe el uso comercial sin licencia empresarial. Es relevante porque aborda el despliegue de detección de objetos en dispositivos edge con restricciones de memoria y cómputo, un área de creciente interés en visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de una etapa basado en CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 (W8A8), entradas/salidas float32, bias INT32 |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del YOLO26n de Ultralytics, un detector de objetos de una etapa que utiliza una arquitectura CNN con backbone y cabezas de detección. La cuantización es post-entrenamiento (PTQ), como indica la presencia de un informe de calibración en el repositorio. No se proporcionan detalles sobre el entrenamiento original (número de tokens, dataset, técnicas de RLHF o DPO), ya que son datos del modelo base de Ultralytics que no están incluidos en la información disponible. La conversión mantiene el preprocesamiento estándar: RGB, división por 255 y letterbox centrado en negro para ajustar la imagen a 640×640. Esta cuantización W8A8 reduce el tamaño del modelo y permite aceleración en hardware con soporte INT8, como los procesadores Hexagon de Qualcomm.

## Capacidades

- Deteccion de objetos en imagenes de 640×640 píxeles, con salida de bounding boxes y clases (el número exacto de clases no se especifica, pero típicamente YOLO se entrena en COCO con 80 clases).
- Inferencia en formato TFLite, compatible con TensorFlow Lite Runtime y aceleradores de hardware edge.
- Cuantizacion INT8 que reduce el uso de memoria y mejora la latencia en CPUs y NPUs con soporte para operaciones INT8.
- Preprocesamiento integrado en el grafo (RGB, division por 255, letterbox), lo que simplifica la integracion en aplicaciones.
- No se reportan capacidades de tool calling, agentes, razonamiento multimodal ni soporte de audio; es un modelo puramente visual para deteccion.

## Casos de uso

- Prototipado de sistemas de vision en dispositivos edge: el modelo permite evaluar rapidamente la viabilidad de YOLO26n en plataformas como Raspberry Pi, smartphones o modulos con NPU, gracias a su formato TFLite y cuantizacion INT8.
- Inspeccion industrial en tiempo real: puede integrarse en pipelines de control de calidad para detectar defectos en lineas de produccion, usando camaras fijas y un dispositivo con TFLite Runtime. Su bajo consumo de memoria lo hace adecuado para hardware embebido.
- Vigilancia y seguridad perimetral: despliegue en camaras IP o dispositivos de borde para detectar personas, vehiculos u objetos de interes, con inferencia local sin dependencia de la nube.
- Conteo de objetos en entornos logisticos: seguimiento de inventario o conteo de unidades en almacenes mediante deteccion en imagenes capturadas por camaras, aprovechando la eficiencia del modelo cuantizado.
- Experimentacion con aceleradores de Qualcomm: el modelo esta disenado para pruebas en runtimes como Qualcomm Neural Network (QNN), permitiendo validar el rendimiento de la cuantizacion INT8 en hardware especifico.
- Educacion e investigacion en cuantizacion: el informe de calibracion y los checksums incluidos sirven como material de referencia para estudiar el impacto de la cuantizacion W8A8 en la precision de un detector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `quantization_report.json` documenta el acuerdo entre las salidas del modelo flotante y el cuantizado en un conjunto de validacion, pero este acuerdo no equivale a una puntuacion de precision sobre un dataset etiquetado. Para evaluar el rendimiento real, es necesario validar el modelo en un conjunto de prueba representativo de la aplicacion objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del archivo no se especifica, pero un modelo YOLO26n cuantizado INT8 suele ocupar menos de 10 MB; la VRAM necesaria dependera del runtime y el hardware).
- GPU recomendadas: no aplica directamente, ya que el formato TFLite esta orientado a CPUs y NPUs de dispositivos edge. En GPU, puede ejecutarse via TensorFlow Lite con delegados de GPU, pero no es el objetivo principal.
- Compatibilidad con consumer GPU: no se garantiza, aunque es posible ejecutarlo en GPUs de escritorio via TFLite con soporte de delegados.
- Opciones de despliegue: TensorFlow Lite Runtime, Qualcomm QNN, tflite-runtime en Python, y posiblemente otros runtimes compatibles con TFLite. No se mencionan vLLM, llama.cpp ni Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependera del hardware y del runtime; la cuantizacion INT8 suele ofrecer mejoras de 2-4x frente a float32 en CPUs con soporte SIMD, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio. El modelo base es YOLO26n de Ultralytics, pero no se proporcionan comparativas con otras versiones cuantizadas (por ejemplo, YOLOv8n INT8 TFLite) ni con el modelo flotante. Para una evaluacion justa, seria necesario ejecutar el mismo dataset y medir mAP, latencia y tamaño, lo cual no esta documentado.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial o propietario requiere una licencia empresarial de Ultralytics. Esto limita su despliegue en productos cerrados sin cumplir las obligaciones de copyleft.
- Artefacto de evaluacion: no es una version oficial ni validada en produccion. El informe de cuantizacion solo muestra acuerdo con el modelo flotante, no una precision real sobre datos etiquetados.
- Preprocesamiento especifico: el modelo espera entrada RGB, division por 255 y letterbox centrado en negro. Cualquier desviacion en el preprocesamiento degradara la deteccion.
- Sin informacion de clases entrenadas: no se especifica el dataset de entrenamiento; asumir que detecta las 80 clases de COCO puede ser incorrecto.
- Riesgo de alucinaciones: como todo modelo de deteccion, puede generar falsos positivos o negativos, especialmente en condiciones de iluminacion o oclusion no representadas en el dataset de calibracion.
- Limitaciones de hardware: la cuantizacion INT8 puede perder precision en comparacion con float32, especialmente en objetos pequenos o de baja textura. Es recomendable validar en el hardware objetivo antes de un despliegue masivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anan19990108/yolo26-int8-tflite
- Modelo base (Ultralytics YOLO26): no se proporciona enlace directo en la informacion, pero se puede encontrar en el sitio oficial de Ultralytics.
