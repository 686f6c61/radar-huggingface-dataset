# mlboydaisuke/M-LSD-tiny-OpenVINO

## Resumen

M-LSD-tiny-OpenVINO es una conversión del modelo M-LSD-tiny (Mobile Line Segment Detection, versión reducida) al formato OpenVINO IR y a un blob precompilado para la NPU de Intel. El modelo original detecta segmentos de línea recta en imágenes, una tarea de visión por computador distinta de la segmentación semántica convencional, aunque Hugging Face lo clasifique bajo el pipeline `image-segmentation`. El autor de la conversión es mlboydaisuke, y el modelo base es `litert-community/M-LSD-tiny-LiteRT`, que a su vez deriva del modelo upstream `navervision/mlsd`.

La relevancia de este repositorio no está en el modelo en sí, sino en el artefacto de despliegue: ofrece tres formatos (ONNX, OpenVINO IR con pesos fp32 y blob precompilado para NPU) y una tabla de mediciones de latencia realizada sobre hardware concreto (Core Ultra 9 386H, RTX 5080 Laptop, Snapdragon X2 Elite y Galaxy S26). El modelo es extremadamente pequeño: el ONNX ocupa 2.637.523 bytes y el binario de pesos OpenVINO 2.457.224 bytes, lo que lo sitúa en el rango de menos de 3 MB.

El dato más importante de la model card es que la ejecución en la NPU de Intel produce una verificación de salida fallida (coseno de -0.2133 frente al resultado de referencia en CPU), lo que indica que el blob precompilado no reproduce fielmente la salida del modelo en ese backend. En iGPU, GPU NVIDIA y CPU la verificación pasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M-LSD-tiny (Mobile Line Segment Detection, red convolucional ligera); detalles de capas no disponibles |
| Parametros totales | no disponible (pesos fp32 en OpenVINO: 2.457.224 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 en el modelo base LiteRT; conversión a ONNX opset 17 y OpenVINO IR con pesos fp32; blob NPU precompilado |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`mlsd_fp16.onnx`), OpenVINO IR (`mlsd_fp16.xml` + `mlsd_fp16.bin`), blob NPU (`mlsd_fp16.blob`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su nombre y propósito: M-LSD-tiny es una red de detección de segmentos de línea orientada a dispositivos móviles, derivada del trabajo M-LSD de Naver Vision. El repositorio no documenta el número de capas, los datos de entrenamiento, el número de tokens (no aplica) ni si hubo fases de ajuste fino. El modelo base es la versión LiteRT (`litert-community/M-LSD-tiny-LiteRT`), y el autor indica que la conversión a ONNX se realizó con tf2onnx 1.17.0 sobre opset 17.

La innovación técnica del repositorio es de despliegue, no de modelado: se proporciona un blob precompilado para la NPU de Intel generado con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). El autor advierte que si `import_model` rechaza el blob en otra versión de driver u OpenVINO, debe compilarse el IR en la máquina destino. La verificación de salida del ONNX frente al `.tflite` original pasa con coseno ≥ 0.9999 en todas las salidas.

## Capacidades

- Detección de segmentos de línea recta en imágenes (line segment detection), tarea propia de M-LSD.
- Entrada y salida en NumPy (float32), con formas definidas por el propio modelo compilado.
- Ejecución en CPU, iGPU Intel, GPU NVIDIA (vía CUDA EP de ONNX Runtime) y NPU Intel (vía OpenVINO u ONNX Runtime con OpenVINO EP).
- Ejecución en NPU de Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante QNN, perfilada en Qualcomm AI Hub.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual y de una sola pasada.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Detección de líneas en documentos escaneados: el modelo puede extraer segmentos de línea de facturas, formularios o planos para tareas de rectificación de perspectiva y análisis de estructura, con una latencia de 2,34 ms en iGPU Intel.
- Preprocesado en pipelines de OCR: la detección de líneas permite localizar tablas, subrayados y separadores antes de pasar la imagen a un motor OCR, ejecutándose en la NPU o iGPU del portátil sin GPU dedicada.
- Visión artificial en dispositivos de borde: con menos de 3 MB de pesos y 4,01 ms por inferencia en la NPU de un Core Ultra 9 386H, es viable en equipos sin GPU dedicada, aunque debe tenerse en cuenta el fallo de verificación en NPU Intel.
- Análisis de planos técnicos y diagramas: extracción de segmentos para reconstruir esquemas eléctricos, planos de planta o diagramas de flujo en herramientas de digitalización.
- Realidad aumentada y corrección geométrica: detección de líneas para alinear overlays con la escena en aplicaciones móviles, con latencias de 1,31 a 1,60 ms en NPU de Snapdragon X2 Elite y Galaxy S26.
- Automatización de control de calidad industrial: detección de bordes y líneas en imágenes de inspección para verificar alineaciones o presencia de marcas, desplegable en CPU con 9,50 ms por ejecución.
- Prototipado en Windows con ONNX Runtime: integración directa mediante el execution provider de OpenVINO o CUDA, con carga del modelo en 0,02 s en CPU y 1,14-1,32 s en GPU/NPU.

## Benchmarks y rendimiento

La model card proporciona tiempos de inferencia medidos (no benchmarks de precisión estándar como MMLU o HumanEval, que no aplican a este modelo). Las mediciones se realizaron en un MSI Stealth 16 AI+ con Core Ultra 9 386H y RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con entrada y salida NumPy, mediana de 30 ejecuciones tras calentamiento.

| Procesador | Runtime | Fichero | ms | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 4,01 | 0,00 | FAIL: cos -0,2133 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 3,73 | 1,32 | FAIL: cos -0,2133 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 2,34 | 0,43 | PASS (cos ≥ 0,9935) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 2,55 | 1,16 | PASS (cos ≥ 0,9995) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 2,87 | 1,14 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 9,50 | 0,02 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` compilado por AI Hub | 1,60 | 0,34 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 1,59 | 1,51 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` compilado por AI Hub | 1,31 | 0,14 | no comparado |

El ONNX frente al `.tflite` original (intérprete LiteRT en CPU) pasa con coseno ≥ 0,9999 en todas las salidas. No se han publicado resultados de benchmarks de precisión (mAP, F1 sobre datasets de segmentos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos; los pesos ocupan 2,46 MB en fp32 y 2,64 MB en ONNX, por lo que cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: RTX 5080 Laptop (2,55-2,87 ms medidos), cualquier GPU NVIDIA con soporte CUDA EP de ONNX Runtime; iGPU Intel (2,34 ms medidos).
- Cabe en cualquier GPU de consumo, incluida la gama integrada; también en CPU (9,50 ms en Core Ultra 9 386H) y en NPU Intel, Qualcomm Snapdragon X2 Elite y Galaxy S26.
- Opciones de despliegue: OpenVINO 2026.4.1 (`compile_model` sobre el IR o `import_model` del blob), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 o CUDA EP, Qualcomm AI Hub con QNN, y LiteRT para el modelo base.
- Latencia y throughput estimados: 1,31-1,60 ms por ejecución en NPU Qualcomm; 2,34-2,87 ms en iGPU Intel y RTX 5080 Laptop; 3,73-4,01 ms en NPU Intel (con salida incorrecta); 9,50 ms en CPU. No se documenta throughput en lote.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros / tamano | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| M-LSD-tiny-OpenVINO (este) | Detección de segmentos de línea | ~2,5 MB de pesos | ONNX, OpenVINO IR, blob NPU | Apache-2.0 | Conversión de despliegue; fallo de verificación en NPU Intel |
| litert-community/M-LSD-tiny-LiteRT | Detección de segmentos de línea | ~2,5 MB (fp16) | LiteRT / TFLite | Apache-2.0 | Modelo base del que deriva este repositorio |
| navervision/mlsd (upstream) | Detección de segmentos de línea | no disponible | no disponible | no disponible | Modelo original citado en la model card; no es un repositorio de Hugging Face |

No se dispone de información sobre otros modelos comparables de detección de segmentos de línea con datos de rendimiento verificables en la información proporcionada.

## Limitaciones y advertencias

- La verificación de salida en la NPU de Intel falla de forma explícita: coseno de -0,2133 frente a la referencia en CPU, muy por debajo del umbral de 0,99. El blob precompilado no es fiable en ese backend en las condiciones medidas.
- El blob NPU está compilado para OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y es necesario recompilar el IR.
- El modelo está entrenado para detección de segmentos de línea, no para segmentación semántica general; la etiqueta `image-segmentation` del pipeline puede inducir a error sobre su función real.
- No hay información sobre sesgos, datos de entrenamiento, composición del dataset ni evaluación de precisión (mAP u otras métricas), lo que impide valorar su robustez en dominios distintos al de entrenamiento.
- El modelo base es una versión cuantizada a fp16; puede haber pérdida de precisión respecto al modelo original, aunque la comparación ONNX frente a TFLite pasa con coseno ≥ 0,9999.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo base; deben respetarse las condiciones de las dependencias (OpenVINO, ONNX Runtime).
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-07; no hay evidencia de uso en producción ni mantenimiento continuado.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/M-LSD-tiny-OpenVINO
- Modelo base: https://huggingface.co/litert-community/M-LSD-tiny-LiteRT (revisión citada: https://huggingface.co/litert-community/M-LSD-tiny-LiteRT/tree/ae7c5698d5bbef1976aa5a1f7ad7b9b28d324e3c)
- Repositorio de scripts y mediciones (52 grafos de LiteRT-Models): https://github.com/john-rocky/windows-zoo
- Modelo upstream citado: `navervision/mlsd` (no es un repositorio de Hugging Face; sin URL disponible en la información proporcionada)
