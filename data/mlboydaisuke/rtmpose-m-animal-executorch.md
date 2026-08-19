# mlboydaisuke/RTMPose-m-Animal-ExecuTorch

## Resumen

RTMPose-m-Animal-ExecuTorch es un modelo de detección de puntos clave (keypoint detection) para animales, convertido a formato ExecuTorch con delegado XNNPACK para ejecución on-device. Fue desarrollado por mlboydaisuke a partir del modelo RTMPose-m de OpenMMLab (MMPose), concretamente la variante `rtmpose-m_simcc-ap10k_pt-aic-coco_210e-256x256-7a041aa1`, entrenada sobre el dataset AP-10K que cubre 54 especies de mamíferos. El modelo sigue un enfoque top-down: primero se detecta al animal con un detector externo, se recorta y redimensiona a 256x256, y luego se estiman 17 puntos clave anatómicos.

La relevancia de este modelo radica en su formato de pesos `.pte` optimizado con XNNPACK, que permite inferencia eficiente en dispositivos con recursos limitados (móviles, edge, Mac arm64). Según la información publicada, la mediana de latencia en Mac arm64 es de 9,4 ms frente a los 91,4 ms del modelo eager fp32, una mejora de casi 10x. La salida utiliza SimCC (una representación de coordenadas basada en distribuciones 1D por eje), con dos tensores de forma [1, 17, 512] para x e y. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMPose (backbone CSPNeXt + head SimCC) |
| Parametros totales | no disponible (modelo RTMPose-m, tamaño medio dentro de la familia RTMPose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 256x256) |
| Tipos de cuantizacion | fp32 (unico archivo publicado) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (con delegado XNNPACK) |

## Arquitectura y entrenamiento

El modelo original RTMPose-m utiliza una arquitectura de estimación de pose top-down con backbone CSPNeXt (una variante eficiente de ResNet con conexiones cruzadas de etapa) y una cabeza de predicción basada en SimCC. SimCC discretiza las coordenadas en dos distribuciones 1D independientes para los ejes x e y, en lugar de usar heatmaps 2D, lo que reduce el coste computacional y facilita la cuantización. El modelo fue entrenado originalmente en el dataset AP-10K (54 especies de mamíferos) con un pipeline de aumentación estándar de MMPose, y posteriormente convertido a ExecuTorch mediante `torch.export` y el flujo `to_edge_transform_and_lower` con el particionador XNNPACK. La cobertura del delegado XNNPACK es del 93,9% (306 de 326 operaciones); las operaciones restantes se ejecutan en kernels portables. La verificación de paridad se realizó con ExecuTorch 1.4.0 y PyTorch 2.13.0, obteniendo una correlación de 1,000000 en ambas salidas y diferencias absolutas máximas del orden de 1e-6.

## Capacidades

- Detección de 17 puntos clave anatómicos en animales (mamíferos) a partir de una imagen recortada de 256x256.
- Inferencia on-device gracias al formato ExecuTorch con XNNPACK, sin dependencias de GPU ni frameworks pesados.
- Salida SimCC con decodificación sencilla: cada keypoint se obtiene mediante `argmax` sobre cada distribución 1D, y el valor máximo sirve como confianza.
- Compatible con flujos top-down: se puede combinar con cualquier detector de objetos (p. ej. YOLO) para localizar al animal antes de la estimación de pose.
- Intercambio sencillo de variantes: todos los archivos `.pte` aceptan y devuelven tensores fp32, por lo que cambiar de precisión no requiere modificar el código de la aplicación.
- Sin dependencias de idioma ni texto: es un modelo puramente visual.

## Casos de uso

- Estudio de comportamiento animal en campo: el modelo puede ejecutarse en dispositivos portátiles (Raspberry Pi, teléfonos) para registrar posturas de mamíferos en vídeo, sin necesidad de conexión a la nube.
- Veterinaria y ganadería: análisis de posturas para detectar cojeras o anomalías de movimiento en animales de granja, integrando el modelo en una aplicación móvil que procesa imágenes capturadas en el establo.
- Conservación de fauna: seguimiento de especies protegidas mediante cámaras trampa, donde el modelo clasifica la pose de cada animal detectado y permite estudiar patrones de actividad.
- Robótica bioinspirada: extracción de referencias de movimiento a partir de vídeos de animales para controlar robots cuadrúpedos o animaciones procedurales.
- Investigación biomédica: análisis de posturas en experimentos con roedores u otros mamíferos de laboratorio, sustituyendo sistemas de marcadores físicos por visión por computador.
- Aplicaciones educativas y de divulgación: herramientas interactivas que muestran la anatomía de los animales en tiempo real, procesando la cámara del dispositivo sin latencia perceptible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (AP, AR, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son:

| Metrica | Valor |
|---|---|
| Tamaño del archivo `.pte` (fp32) | 54,5 MB |
| Latencia mediana en Mac arm64 (10 ejecuciones) | 9,4 ms |
| Latencia del modelo eager fp32 en la misma maquina | 91,4 ms |
| Cobertura del delegado XNNPACK | 93,9% (306/326 ops) |
| Diferencia absoluta maxima (output 0) | 2,783e-06 |
| Diferencia absoluta maxima (output 1) | 7,629e-06 |
| Correlacion (ambos outputs) | 1,000000 |

## Requisitos de hardware

- VRAM: no aplica directamente, ya que la inferencia se realiza en CPU mediante XNNPACK. El archivo `.pte` ocupa 54,5 MB en memoria, por lo que cabe en cualquier dispositivo moderno.
- GPU recomendadas: ninguna; el modelo está diseñado para ejecución on-device en CPU (ARM, x86, Apple Silicon).
- Compatibilidad con hardware de consumo: sí, cualquier smartphone, placa embebida (Raspberry Pi 4/5, Jetson Nano) o Mac con arquitectura arm64 puede ejecutarlo.
- Opciones de despliegue: ExecuTorch runtime con delegado XNNPACK. El repositorio de conversión (`executorch-models`) proporciona scripts para reproducir el proceso. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: 9,4 ms por imagen en Mac arm64 (mediana de 10 ejecuciones, proceso único). En dispositivos móviles ARM se espera un rendimiento similar o ligeramente inferior, aunque no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Salida | Tamaño | Latencia (Mac arm64) | Licencia |
|---|---|---|---|---|---|---|
| RTMPose-m-Animal-ExecuTorch (este) | ExecuTorch XNNPACK | 256x256 | 17 keypoints SimCC | 54,5 MB | 9,4 ms | Apache-2.0 |
| RTMPose-s-Body-ExecuTorch (mismo autor) | ExecuTorch XNNPACK | no disponible | keypoints de cuerpo humano | no disponible | no disponible | Apache-2.0 |
| RTMPose-m original (MMPose) | PyTorch | 256x256 | 17 keypoints SimCC | ~90 MB (fp32) | 91,4 ms (eager) | Apache-2.0 |

La comparativa con el modelo original muestra la ventaja principal de esta conversión: una reducción de latencia de aproximadamente 10x manteniendo una paridad numérica casi perfecta. La variante `s` del mismo autor está orientada a keypoints de cuerpo humano, por lo que no es directamente comparable en tarea.

## Limitaciones y advertencias

- El modelo solo cubre 54 especies de mamíferos (dataset AP-10K); no funcionará bien con aves, reptiles u otros taxones fuera de ese rango.
- Es un modelo top-down: requiere un detector de objetos previo para localizar al animal. Sin ese paso, la entrada debe ser un recorte exacto del animal.
- La salida SimCC está discretizada en 512 bins por eje, lo que limita la precisión espacial a 1/512 de la imagen de entrada (aproximadamente 0,5 píxeles en 256x256).
- No se proporcionan métricas de precisión (AP, AR) en la información disponible, por lo que no es posible evaluar su rendimiento absoluto frente a otros modelos de pose animal.
- La latencia reportada (9,4 ms) es una referencia relativa en una máquina concreta (Mac arm64) y no debe extrapolarse directamente a otros dispositivos sin pruebas.
- El archivo `.pte` está optimizado para XNNPACK; en dispositivos sin soporte para este delegado, la inferencia podría degradarse o requerir kernels portables más lentos.
- No es un modelo de lenguaje ni multimodal: no acepta texto ni genera descripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/RTMPose-m-Animal-ExecuTorch
- Repositorio de conversión (scripts): https://github.com/john-rocky/executorch-models
- Proyecto MMPose (OpenMMLab): https://github.com/open-mmlab/mmpose
- Proyecto RTMPose dentro de MMPose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- Modelo relacionado del mismo autor (RTMPose-s-Body-ExecuTorch): https://huggingface.co/mlboydaisuke/RTMPose-s-Body-ExecuTorch
