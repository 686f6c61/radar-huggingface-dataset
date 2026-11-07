# mlboydaisuke/Places365-ResNet18-OpenVINO

## Resumen

Places365-ResNet18-OpenVINO es una conversión del modelo de clasificación de escenas Places365-ResNet18 al ecosistema OpenVINO, publicada por el usuario mlboydaisuke. El modelo original es una ResNet18 entrenada sobre el dataset Places365 (365 categorías de escenas) por el grupo CSAIL del MIT, y esta versión parte del modelo intermedio `litert-community/Places365-ResNet18-LiteRT`. El repositorio incluye el grafo ONNX (opset 17, generado con tf2onnx 1.17.0), el IR de OpenVINO con pesos fp32 y un blob precompilado para la NPU de Intel.

El problema que resuelve es el despliegue eficiente de un clasificador de escenas en hardware Intel (NPU, iGPU y CPU) sin necesidad de recompilar en cada máquina: el blob precompilado permite cargar el modelo en 0,02 s y ejecutarlo en 1,09 ms por inferencia en una NPU Intel AI Boost. Es relevante para pipelines de visión por computador en el borde (edge) que necesitan clasificación de escenas de baja latencia sobre hardware de portátil o mini-PC con Core Ultra.

Se trata de un modelo pequeño (ResNet18, ~11,7 M de parámetros en su forma estándar) orientado exclusivamente a clasificación de imágenes; no es un modelo generativo ni multimodal. La licencia es MIT y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN con conexiones residuales), exportada a ONNX opset 17 e IR de OpenVINO |
| Parametros totales | no disponible en la informacion proporcionada (ResNet18 estándar: ~11,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 en el modelo fuente (`places_fp16`); pesos fp32 en el IR de OpenVINO; blob NPU precompilado |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), OpenVINO IR (`.xml` + `.bin`), blob de NPU Intel (`.blob`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet18, una red convolucional residual de 18 capas con conexiones skip, adaptada a la clasificación de 365 clases de escenas del dataset Places365. El modelo base es `litert-community/Places365-ResNet18-LiteRT`, que a su vez proviene del modelo original `CSAILVision/places365` entrenado en PyTorch. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de las 365 categorías de Places365, ni si hubo ajuste fino adicional con RLHF/DPO (no procede en un clasificador).

La innovación técnica de esta ficha no está en el entrenamiento sino en el despliegue: la conversión a ONNX mediante tf2onnx 1.17.0 requirió un parche de una línea (`convert/patch_tf2onnx.py`) porque esa versión descarta el sesgo de una capa FULLY_CONNECTED del modelo `places_fp16`; con el parche, las salidas coinciden con el `.tflite` original (coseno ≥ 0,9999). Además, se genera un blob precompilado para la NPU de Intel con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841, lo que elimina el tiempo de compilación en la carga.

## Capacidades

- Clasificación de imágenes en 365 categorías de escenas (interiores, exteriores, naturales, urbanas, etc.) según el dataset Places365.
- Salida de puntuaciones por clase (class scores) compatible con la verificación top-1 frente al modelo de referencia.
- Inferencia de baja latencia en NPU Intel AI Boost, iGPU Intel Graphics y CPU.
- Ejecución en ONNX Runtime con el Execution Provider de OpenVINO, y en OpenVINO nativo (IR o blob).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de escenas.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Clasificación de escenas en tiempo real en el borde: el modelo se ejecuta en 1,09 ms por inferencia en la NPU de un Core Ultra 9 386H, lo que permite procesar vídeo a decenas o cientos de FPS en un portátil o mini-PC sin GPU dedicada.
- Etiquetado automático de fotos y vídeos: se puede integrar en un pipeline de organización de bibliotecas multimedia que asigne una categoría de escena (playa, bosque, oficina, restaurante) a cada imagen.
- Moderación y análisis de contenido visual: clasificar la escena de imágenes subidas por usuarios para enrutar revisiones o aplicar políticas por tipo de entorno.
- Robótica y vehículos autónomos de bajo coste: proporcionar contexto de escena (interior/exterior, tipo de entorno) a un sistema de navegación que corre en CPU/NPU Intel.
- Sistemas de accesibilidad: describir el entorno de una imagen para aplicaciones de asistencia a personas con discapacidad visual, combinado con un modelo de texto que genere la descripción.
- Monitorización de espacios: clasificar fotogramas de cámaras de seguridad para detectar cambios de escena (por ejemplo, de oficina a almacén) y activar alertas.
- Preprocesado para modelos mayores: usar la etiqueta de escena como característica de entrada para un modelo multimodal o un sistema de recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1/top-5 en Places365) en la información proporcionada. Sí se dispone de mediciones de latencia y verificación de salida del autor:

| Procesador | Runtime | Fichero | ms | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob `npu/` (`import_model`) | 1,09 | 0,02 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,29 | 0,68 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,13 | 0,34 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 1,55 | 1,15 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 1,58 | 1,13 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 3,94 | 0,08 | referencia |

Las mediciones se realizaron en un MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W y Windows 11 build 26200.9711, con entrada y salida numpy y la mediana de 30 ejecuciones cronometradas tras 5 de calentamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Places365-ResNet18-OpenVINO | no disponible (ResNet18 estándar ~11,7 M) | no aplica | 1,09 ms en NPU Intel AI Boost | MIT | Hugging Face (este repo) |
| Places365-ResNet18-LiteRT | no disponible | no aplica | no disponible | MIT | Hugging Face (litert-community) |
| Places365-ResNet50 (CSAILVision) | no disponible | no aplica | no disponible | no disponible | GitHub CSAILVision/places365 |
| Places365-AlexNet (CSAILVision) | no disponible | no aplica | no disponible | no disponible | GitHub CSAILVision/places365 |

No se dispone de datos de precisión comparativa entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica escenas de Places365; no es un modelo generativo ni sirve para tareas de texto, razonamiento o visión general.
- No se han publicado métricas de precisión (top-1/top-5) en la información disponible; no se puede garantizar su calidad frente al modelo original sin evaluarla.
- El blob precompilado para NPU depende de OpenVINO 2026.4.1 y del driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y habrá que compilar el IR.
- La conversión a ONNX requirió un parche de tf2onnx 1.17.0; usar la versión sin parche puede producir discrepancias por el sesgo descartado en una capa FULLY_CONNECTED.
- Riesgo de sesgo inherente al dataset Places365 (posible sobrerrepresentación de ciertos entornos geográficos y culturales).
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de entrenamiento subyacentes.
- No hay soporte multilingüe ni de texto; cualquier caso de uso que requiera lenguaje natural necesita un modelo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/Places365-ResNet18-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/Places365-ResNet18-LiteRT
- Repositorio GitHub con scripts y tabla comparativa: https://github.com/john-rocky/windows-zoo
- Repositorio original CSAILVision/places365: https://github.com/CSAILVision/places365
- Documentación de torchvision sobre Places365: https://docs.pytorch.org/vision/stable/_modules/torchvision/datasets/places365.html
