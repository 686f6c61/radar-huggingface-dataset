# qualcomm/MediaPipe-Pose-Estimation

## Resumen

MediaPipe-Pose-Estimation (Qualcomm) es un pipeline de estimación de pose y detección de keypoints corporales, faciales y de manos, empaquetado y optimizado por Qualcomm para su despliegue en dispositivos con aceleración neuronal Snapdragon y Dragonwing. No es un modelo de lenguaje: es un modelo de visión por computador orientado a la detección de puntos clave (keypoint detection) en tiempo real, derivado de la implementación MediaPipePyTorch de zmurez y distribuido bajo licencia Apache 2.0.

El repositorio en Hugging Face (1,6 GB) contiene pesos y artefactos pre-exportados listos para ejecución en hardware Qualcomm, incluyendo variantes ONNX en precisión float y cuantización w8a8, así como binarios precompilados para el runtime QNN de Qualcomm (QAIRT). Está pensado para integrarse en aplicaciones Android y en plataformas embebidas con NPU Hexagon, donde la latencia y el consumo energético son críticos.

Su relevancia actual radica en que permite ejecutar un pipeline de pose estimation completamente en el dispositivo (on-device), sin depender de la nube, con artefactos ya compilados para chipsets concretos. Esto lo hace útil para aplicaciones de realidad aumentada, fitness, telemedicina o interacción gestual donde la privacidad y la latencia importan. La información disponible no detalla el número de parámetros ni la arquitectura interna exacta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de estimación de pose basado en la implementación MediaPipePyTorch; arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float y w8a8 (cuantización de pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (float y w8a8) y PRECOMPILED_QNN_ONNX para runtime QNN; repositorio en PyTorch |
| Pipeline | keypoint-detection |
| Tarea | Detección de bounding boxes y esqueletos de pose (cara, manos y torso) |
| Hardware objetivo | Chipsets Qualcomm Snapdragon y Dragonwing con NPU |
| Versiones SDK | QAIRT 2.50/2.51, ONNX Runtime 1.30.0 |
| Tamaño del repositorio | 1,6 GB |
| Descargas / likes | 873 / 114 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de backbone, resolución de entrada ni composición del dataset de entrenamiento). Lo que sí se documenta es que se trata de un pipeline de dos etapas típico de MediaPipe: un detector que predice bounding boxes de cara, manos y torso, y un estimador de landmarks que devuelve el esqueleto de pose sobre esas regiones. La implementación de referencia es MediaPipePyTorch (zmurez), y Qualcomm ha realizado la exportación y optimización para sus plataformas.

El valor técnico añadido por Qualcomm está en el proceso de compilación y perfilado mediante Qualcomm AI Hub Workbench, que genera artefactos precompilados para chipsets concretos (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075 y QCS8550) con QAIRT 2.50 y ONNX Runtime 1.30.0. Se ofrecen variantes en float y en cuantización w8a8, esta última orientada a reducir el ancho de banda de memoria y acelerar la inferencia en la NPU. No se documentan detalles sobre RLHF, DPO ni fases de ajuste, al no ser un modelo generativo.

## Capacidades

- Detección de bounding boxes de cara, manos y torso en imágenes.
- Estimación de esqueletos de pose (landmarks) sobre las regiones detectadas.
- Ejecución en tiempo real en dispositivos móviles y embebidos con NPU Qualcomm.
- Exportación a ONNX en float y en cuantización w8a8.
- Despliegue mediante runtime QNN con artefactos precompilados por chipset.
- Integración en Android y en plataformas con SDK QAIRT y ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se documentan modos especiales como thinking mode, visión generativa ni audio.

## Casos de uso

- Realidad aumentada y filtros en tiempo real: el pipeline detecta landmarks faciales y corporales con artefactos precompilados para Snapdragon, lo que permite superponer efectos sobre la pose del usuario sin enviar vídeo a la nube.
- Aplicaciones de fitness y rehabilitación: la estimación de esqueleto permite contar repeticiones y evaluar la postura en el dispositivo, con la variante w8a8 para reducir consumo en móviles de gama alta.
- Telemedicina y análisis de movimiento: el procesamiento on-device preserva la privacidad del paciente al no transmitir imágenes, y la detección de torso y extremidades sirve para evaluar rangos de movimiento.
- Interacción gestual sin contacto: la detección de manos y landmarks permite controlar interfaces en quioscos, automoción o señalización digital usando la NPU del chipset.
- Seguridad y videovigilancia embebida: el pipeline puede ejecutarse en cámaras IP con Dragonwing IQ-8275 o QCS8550 para detectar presencia y postura sin depender de servidores centrales.
- Deportes y análisis técnico: extracción de keypoints para comparar la técnica de un atleta con un patrón de referencia, ejecutando la inferencia en un dispositivo portátil con Snapdragon X Elite.
- Robótica e interacción humano-máquina: seguimiento de pose de operarios o usuarios para ajustar la respuesta de un sistema embebido con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una sección de "performance summary" con métricas por dispositivo, pero los valores concretos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de visión de pequeño tamaño orientado a NPU, no se publican cifras de VRAM.
- GPU recomendadas: no aplica en el sentido habitual; el objetivo son NPUs Qualcomm Hexagon en Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, Snapdragon X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075 y QCS8550.
- Cabe en hardware de consumo: sí, en móviles y portátiles con los chipsets Snapdragon y Dragonwing listados; también puede ejecutarse en CPU vía ONNX Runtime en modo float o w8a8.
- Opciones de despliegue: ONNX Runtime 1.30.0, runtime QNN (QAIRT 2.50/2.51) con artefactos precompilados, y la librería Qualcomm AI Hub Models (v0.67.0) para exportar con configuraciones personalizadas.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la sección de rendimiento por dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Contexto / entrada | Despliegue | Notas |
|---|---|---|---|---|---|
| MediaPipe-Pose-Estimation (Qualcomm) | Pipeline de pose y landmarks | Apache 2.0 | Imagen; resolución no disponible | ONNX, QNN precompilado, NPU Qualcomm | Optimizado y perfilado por chipset |
| MediaPipe Pose (Google) | Pipeline de pose | Apache 2.0 | Imagen | TFLite, MediaPipe Framework | Referencia original; no optimizado específicamente para NPU Qualcomm |
| MediaPipePyTorch (zmurez) | Implementación en PyTorch | No disponible en la información | Imagen | PyTorch | Implementación base de la que deriva este repositorio |
| YOLO-pose (Ultralytics) | Detección de pose de una etapa | AGPL-3.0 / comercial | Imagen | ONNX, TensorRT, TFLite | Licencia más restrictiva para uso comercial |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar diferencias de precisión o latencia entre estas alternativas.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos del modelo; al ser un modelo de visión, puede presentar sesgos de rendimiento según tono de piel, ropa, iluminación y oclusiones, pero no se documentan formalmente.
- Riesgo de fallo en poses extremas, oclusiones parciales o imágenes de baja resolución; no se publican métricas de robustez.
- El pipeline está optimizado y perfilado para hardware Qualcomm; en otras plataformas se depende de la variante ONNX genérica, sin garantías de rendimiento equivalente.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de las dependencias (ONNX Runtime, QAIRT) y de la implementación base MediaPipePyTorch.
- Los artefactos precompilados están ligados a versiones concretas de QAIRT y ONNX Runtime; actualizar el SDK puede requerir recompilar.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; su uso está acotado a visión por computador.
- El tamaño del repositorio (1,6 GB) incluye múltiples variantes por chipset y precisión; conviene descargar solo el artefacto necesario.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/MediaPipe-Pose-Estimation
- Qualcomm AI Hub Models (repositorio): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/mediapipe_pose
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementación base MediaPipePyTorch: https://github.com/zmurez/MediaPipePyTorch/
- Paper de referencia (arXiv:2006.10204): https://arxiv.org/abs/2006.10204
- Qualcomm (sitio corporativo): https://www.qualcomm.com/
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
