# litert-community/yolox-m-litert

## Resumen

YOLOX-M LiteRT es una conversión del modelo de detección de objetos YOLOX-M, desarrollado originalmente por Megvii, a un formato `.tflite` optimizado para ejecución GPU nativa en dispositivos móviles mediante el framework LiteRT (sucesor de TensorFlow Lite). El modelo ha sido re-autorizado por la comunidad LiteRT para eliminar operaciones incompatibles con el delegado GPU, como `GATHER_ND` o tensores de más de 4 dimensiones, plegando el stem Focus en una única convolución 6×6 stride-2. El resultado es un grafo completamente ejecutable en GPU sin fallback a CPU, con un tamaño de 51 MB y entrada de 640×640 píxeles en formato BGR.

Este modelo resuelve el problema de la detección de objetos en tiempo real en dispositivos con recursos limitados, ofreciendo una alternativa de código abierto (Apache-2.0) a la familia YOLO (que suele tener licencias más restrictivas). Su relevancia actual radica en que permite desplegar detección de objetos de alta precisión (AP 46.9 en COCO val2017) en smartphones y dispositivos edge con aceleración GPU o NPU, manteniendo latencias de pocos milisegundos. La arquitectura es una CNN pura sin capas recurrentes ni mecanismos de atención, y el contexto no aplica al ser un modelo de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOX-M con Focus stem reemplazado por conv 6×6 stride-2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (.tflite) |

## Arquitectura y entrenamiento

YOLOX-M es una CNN pura basada en la arquitectura YOLOX, que utiliza un backbone CSPDarknet y cabezales de detección acoplados. La conversión a LiteRT ha requerido una re-escritura del grafo para hacerlo compatible con el delegado GPU: el stem Focus (que originalmente realizaba un rebanado espacio-profundidad con stride 2) se ha plegado junto con la convolución 3×3 posterior en una única convolución 6×6 stride-2, numéricamente equivalente. Las activaciones SiLU se han convertido a la combinación LOGISTIC+MUL, y se han eliminado todas las operaciones `GATHER`, `GATHER_ND`, `TopK` y `Cast`, así como tensores de más de 4 dimensiones. El resultado es un grafo con cero operaciones rechazadas por el delegado GPU.

El modelo fue entrenado por Megvii en el dataset COCO 2017 (train2017), un conjunto público de imágenes con 80 categorías de objetos. No se utilizaron datos adicionales ni privados. Los pesos son la versión oficial de Megvii; solo se ha modificado el grafo de operaciones, no los pesos. No se aplicaron técnicas de RLHF ni DPO, ya que es un modelo de visión supervisado.

## Capacidades

- Detección de objetos en tiempo real: identifica y localiza objetos de 80 clases COCO (personas, vehículos, animales, objetos cotidianos, etc.) mediante cajas delimitadoras y puntuaciones de confianza.
- Salida de cabezales crudos: el modelo produce un tensor `[1, 8400, 85]` con 4 coordenadas de caja (cx, cy, w, h), 1 puntuación de objetividad y 80 puntuaciones de clase, ya sigmoidizadas. La decodificación de cajas y el NMS se realizan en el host, fuera del grafo.
- Ejecución GPU nativa: el grafo completo se ejecuta en el delegado GPU de LiteRT sin fallback a CPU, lo que garantiza baja latencia y eficiencia energética.
- Compatibilidad con NPU: el modelo también puede ejecutarse en NPUs como Hexagon (Snapdragon), con latencias aún menores (5.25 ms en Galaxy S26).
- Sin capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente un modelo de visión.
- No es multilingüe: la salida son IDs de clase numéricos, no texto.

## Casos de uso

- Detección de objetos en tiempo real en aplicaciones móviles de realidad aumentada: el modelo puede ejecutarse en la GPU del dispositivo con latencias de ~20 ms (GPU) o ~5 ms (NPU), permitiendo superponer información virtual sobre objetos detectados en la cámara.
- Conteo de personas o vehículos en sistemas de videovigilancia: gracias a su licencia Apache-2.0 y su ejecución en edge, puede integrarse en cámaras IP o dispositivos Raspberry Pi con aceleración GPU para contar afluencia o tráfico sin enviar imágenes a la nube.
- Control de calidad industrial: el modelo puede detectar defectos o piezas ausentes en líneas de producción, usando las 80 clases COCO como base o reentrenando con datos propios (los pesos son modificables).
- Asistencia a personas con discapacidad visual: una app móvil puede usar el modelo para identificar objetos del entorno (sillas, mesas, personas) y convertirlos en audio, aprovechando la baja latencia para una experiencia fluida.
- Automatización de inventario en almacenes: el modelo puede contar cajas, palés o productos en estanterías mediante una cámara fija, con la ventaja de no requerir conexión a internet.
- Filtrado de contenido en redes sociales: detección de objetos no deseados (armas, contenido explícito) en imágenes subidas por usuarios, ejecutándose en el dispositivo para preservar la privacidad.

## Benchmarks y rendimiento

Se han publicado los siguientes datos de rendimiento en la model card:

| Metrica | Valor |
|---|---|
| COCO val2017 AP (FP32 reference) | 46.9 |
| Latencia GPU (Pixel 8a, TFLite OpenCL delegate) | 81.4 ms |
| Latencia CPU (Pixel 8a, XNNPACK 4 threads) | 836.1 ms |
| Latencia NPU (Galaxy S26, Hexagon v81) | 5.25 ms (mediana) |
| Latencia GPU (Galaxy S26, Adreno) | 20.37 ms (mediana) |

No se han publicado comparativas con otros modelos de detección en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el modelo pesa 51 MB en FP16, por lo que cabe en cualquier GPU móvil con al menos 64 MB de memoria gráfica.
- GPU recomendadas: cualquier GPU compatible con OpenCL o Vulkan en Android (Adreno, Mali, PowerVR). En el Pixel 8a (Tensor G3) se verificó ejecución completa en GPU.
- NPU recomendadas: Hexagon (Snapdragon) con soporte para LiteRT, donde se obtienen las menores latencias.
- No cabe en GPUs de escritorio antiguas sin soporte OpenCL, pero sí en cualquier GPU moderna.
- Opciones de despliegue: LiteRT (CompiledModel API), TFLite Interpreter, benchmark_model de TFLite. También puede ejecutarse en Python con `ai_edge_litert`.
- Latencia y throughput: en GPU móvil se observan 20-80 ms por inferencia según el dispositivo; en NPU, ~5 ms. En CPU, ~836 ms, por lo que no se recomienda para tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Sin embargo, YOLOX-M pertenece a la familia YOLOX, que incluye variantes como YOLOX-Nano (más ligera) y YOLOX-L (más pesada). La versión Nano está disponible en el repositorio LiteRT-Models de john-rocky, pero no se han publicado métricas comparativas en esta ficha. Se recomienda consultar los benchmarks oficiales de YOLOX para una comparación detallada.

## Limitaciones y advertencias

- Sesgos del dataset COCO: el modelo está entrenado en imágenes de COCO 2017, que pueden tener sesgos geográficos y culturales (por ejemplo, sobrerrepresentación de escenas occidentales). Las 80 clases son fijas y no cubren todos los objetos posibles.
- Riesgo de alucinación: al ser un modelo de detección, no genera texto, pero puede producir falsos positivos (detectar objetos que no existen) o falsos negativos, especialmente en condiciones de iluminación adversa u oclusiones.
- Limitaciones de entrada: la resolución fija de 640×640 y el letterbox con relleno gris pueden degradar la precisión en imágenes con relaciones de aspecto extremas.
- Decodificación en host: las cajas y el NMS se calculan fuera del grafo, lo que añade latencia adicional y requiere implementación manual en cada plataforma.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario es responsable de cumplir con las atribuciones requeridas y de no utilizar el modelo para fines ilegales.
- Privacidad: aunque el modelo se ejecuta en el dispositivo, las imágenes de entrada pueden contener datos personales; se recomienda implementar medidas de anonimización si se procesan imágenes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/yolox-m-litert
- Repositorio LiteRT (sucesor de TFLite): https://github.com/google-ai-edge/litert
- Repositorio LiteRT-Models con YOLOX-Nano: https://github.com/john-rocky/LiteRT-Models/tree/main/yolox
- Documentación de LiteRT para GenAI: https://developers.google.com/edge/litert/genai/overview
- Muestra de aplicación y script de conversión: https://github.com/google-ai-edge/litert-samples (compiled_model_api/object_detection)
