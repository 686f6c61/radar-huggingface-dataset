# mlboydaisuke/L2CS-Gaze360-OpenVINO

## Resumen

L2CS-Gaze360-OpenVINO es una conversión del modelo L2CS-Gaze360 (originalmente en formato LiteRT/TFLite) a formatos ONNX y OpenVINO IR, junto con un blob precompilado para la NPU de Intel. El modelo original L2CS-Net, desarrollado por Ahmednull, es una red de estimación de mirada (gaze estimation) que predice el ángulo de dirección de la mirada (yaw y pitch) a partir de una imagen de un rostro. Esta conversión la publica el usuario mlboydaisuke y está pensada para ejecutar la inferencia en hardware Intel: NPU (Intel AI Boost), iGPU y CPU.

El modelo resuelve una tarea de clasificación/regresión sobre imágenes de rostros para determinar hacia dónde mira una persona, lo que resulta relevante para aplicaciones de interacción humano-computador, seguimiento ocular, análisis de atención y sistemas de accesibilidad. La conversión incluye un blob precompilado para la NPU de Intel que se ejecuta en 5,40 ms por inferencia en un Core Ultra 9 386H, lo que lo hace adecuado para despliegues de baja latencia en dispositivos de borde (edge).

El repositorio tiene un tamaño de 0,2 GB y contiene los pesos en fp16 convertidos a ONNX (opset 17), el IR de OpenVINO con pesos fp32 y el blob de la NPU. La licencia es MIT, heredada del modelo base litert-community/L2CS-Gaze360-LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | L2CS-Net (red neuronal convolucional para estimación de mirada; arquitectura exacta no disponible en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (ONNX), fp32 (OpenVINO IR), blob precompilado para NPU Intel |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX, OpenVINO IR (.xml/.bin), blob para NPU Intel |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original L2CS-Net ni su proceso de entrenamiento. Se sabe que es una red de estimación de mirada que predice ángulos de dirección (yaw y pitch) a partir de imágenes de rostros, y que el modelo base es litert-community/L2CS-Gaze360-LiteRT, a su vez derivado de Ahmednull/L2CS-Net. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de visión de este tipo).

La innovación técnica destacable de esta publicación no reside en el modelo en sí, sino en el proceso de conversión: se utilizó tf2onnx 1.17.0 con un parche de una línea para corregir la eliminación del sesgo (bias) en dos capas FULLY_CONNECTED de gaze_fp16, garantizando que las salidas coincidan con el archivo .tflite original. Además, se generó un blob precompilado para la NPU de Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841, lo que elimina el tiempo de compilación en el arranque.

## Capacidades

- Estimación de la dirección de la mirada (gaze estimation) a partir de imágenes de rostros, prediciendo ángulos de yaw y pitch.
- Clasificación de imágenes (pipeline_tag: image-classification) orientada a la tarea específica de mirada.
- Inferencia de baja latencia en hardware Intel: NPU (Intel AI Boost), iGPU (Intel Graphics) y CPU.
- Ejecución mediante OpenVINO (importación directa del blob o compilación del IR) y ONNX Runtime con el Execution Provider de OpenVINO.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplicables a este modelo de visión).
- No se dispone de información sobre modos especiales como thinking mode, visión general (más allá de la estimación de mirada), audio u otras capacidades.

## Casos de uso

- Seguimiento ocular en tiempo real en dispositivos de borde: el modelo se ejecuta en la NPU de Intel en 5,40 ms por inferencia, lo que permite integrarlo en aplicaciones de seguimiento de la mirada con tasas de refresco superiores a 100 Hz sin sobrecargar la CPU.
- Sistemas de accesibilidad para personas con movilidad reducida: la estimación de la dirección de la mirada puede utilizarse como interfaz de control (selección de elementos en pantalla, comunicación aumentativa) gracias a la baja latencia en hardware integrado.
- Análisis de atención en entornos educativos o de formación: el modelo puede procesar imágenes de rostros para determinar hacia dónde mira el usuario y estimar su nivel de atención, desplegado en equipos con NPU Intel.
- Investigación en psicología cognitiva y estudios de comportamiento: la conversión a ONNX y OpenVINO facilita la integración en pipelines de análisis de vídeo existentes, con la ventaja de ejecutarse en CPU, iGPU o NPU según la carga.
- Integración en aplicaciones de videoconferencia o telepresencia: la estimación de la mirada permite corregir la dirección de la mirada en tiempo real o detectar si el usuario está mirando a la pantalla, con inferencia local en el dispositivo.
- Prototipado rápido en Windows con hardware Intel: el blob precompilado y los scripts de ejemplo permiten poner en marcha la inferencia en la NPU en pocos pasos, lo que resulta útil para validar conceptos antes de invertir en un despliegue mayor.
- Sistemas de análisis de audiencia en entornos comerciales: el modelo puede ejecutarse en equipos de bajo consumo con NPU Intel para estimar la dirección de la mirada de transeúntes y generar métricas de atención, respetando la privacidad al procesar localmente.

## Benchmarks y rendimiento

La información proporcionada incluye mediciones de latencia y verificación de salidas, pero no benchmarks estándar de precisión (como MMLU, HumanEval o GSM8K, no aplicables a este modelo). Se presentan los datos de rendimiento medidos en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop GPU a 95 W, Windows 11 build 26200.9711, con alimentación de red), el 2026-11-07:

| Procesador | Runtime | Archivo | ms | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob en `npu/` (`import_model`) | 5,40 | 0,04 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx`, compilado al cargar la sesión | 6,41 | 5,30 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 4,62 | 1,01 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no incluida en el repo) | 3,56 | 1,15 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 4,08 | 1,13 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 40,49 | 0,19 | referencia |

La verificación de salida se realizó comparando cada salida con la salida de la CPU en fp32 sobre la misma entrada (ONNX Runtime CPU EP); PASS significa coseno ≥ 0,99, sin NaN ni Inf, y acuerdo top-1 ≥ 0,99 para las puntuaciones de clase. El archivo ONNX comparado con el `.tflite` original (intérprete LiteRT en CPU, misma entrada) también obtuvo PASS con coseno ≥ 0,9999 en todas las salidas.

No se han publicado resultados de benchmarks de precisión (exactitud de estimación de mirada, error angular, etc.) en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo base litert-community/L2CS-Gaze360-LiteRT es la referencia directa, pero no se han encontrado datos de otros modelos de estimación de mirada (como el L2CS-Net original en PyTorch o variantes) que permitan una comparación cuantitativa en términos de parámetros, contexto, rendimiento o licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está especializado en estimación de mirada; no es un modelo de propósito general y no debe utilizarse para tareas de generación de texto, código o razonamiento.
- No se dispone de información sobre sesgos conocidos del modelo original (por ejemplo, sesgos demográficos en la estimación de mirada), pero es un riesgo habitual en modelos entrenados con datasets de rostros que puede afectar a la precisión en distintos grupos.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí existe riesgo de predicciones erróneas en condiciones de iluminación, oclusión, ángulos extremos o baja resolución.
- El blob precompilado para la NPU está ligado a OpenVINO 2026.4.1 y al driver NPU 32.0.100.4841; en otras versiones o drivers, `import_model` puede rechazar el blob y será necesario compilar el IR en la máquina destino.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo original L2CS-Net (Ahmednull/L2CS-Net) y del modelo base litert-community/L2CS-Gaze360-LiteRT, ya que la información disponible no detalla posibles restricciones adicionales.
- El modelo no incluye información sobre idiomas ni contexto textual, por lo que no es adecuado para tareas lingüísticas.
- El rendimiento medido corresponde a un hardware específico (Core Ultra 9 386H, RTX 5080 Laptop); los tiempos pueden variar en otros equipos.
- No se han publicado métricas de precisión (error angular) en la información disponible, lo que limita la evaluación de su calidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/L2CS-Gaze360-OpenVINO
- Modelo base en Hugging Face: https://huggingface.co/litert-community/L2CS-Gaze360-LiteRT
- Repositorio GitHub con scripts y tabla de resultados: https://github.com/john-rocky/windows-zoo
- Implementación oficial de L2CS-Net en PyTorch: https://github.com/Ahmednull/L2CS-Net
- Pesos L2CSNet_gaze360.pkl en Hugging Face: https://huggingface.co/tianfxc/l2cs/blob/main/L2CSNet_gaze360.pkl
