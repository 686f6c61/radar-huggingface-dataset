# mlboydaisuke/Cloth-Segmentation-U2Net-OpenVINO

## Resumen

Cloth-Segmentation-U2Net-OpenVINO es una conversión y empaquetado del modelo de segmentación de prendas de vestir Cloth-Segmentation-U2Net-LiteRT, orientado específicamente a su despliegue en aceleradores Intel (NPU, iGPU y CPU) mediante OpenVINO. El modelo original deriva de la arquitectura U2-Net, una red encoder-decoder con módulos RSU (Residual U-blocks) diseñada para salient object detection, adaptada aquí a la tarea de cloth parsing: separar la ropa de una persona en tres categorías (parte superior, parte inferior y cuerpo completo) sobre el fondo. Lo publica el usuario mlboydaisuke como artefacto de despliegue, no como un modelo entrenado desde cero.

El interés de esta ficha no está en el modelo de segmentación en sí (un U2-Net de tamaño medio, sin capacidades generativas ni de lenguaje), sino en el formato: incluye pesos ONNX (opset 17, generados con tf2onnx 1.17.0), representación intermedia OpenVINO IR en fp32 y un blob NPU precompilado para Intel Core Ultra. El autor documenta mediciones reproducibles de latencia sobre un Core Ultra 9 386H con NPU Intel AI Boost, iGPU Intel Graphics, RTX 5080 Laptop y CPU, con verificación de equivalencia numérica frente a la salida de referencia en CPU (coseno ≥ 0.9999).

Es relevante ahora porque el soporte de NPU en portátiles Intel (Core Ultra serie 2) es reciente y escaso en el ecosistema de modelos de visión, y este paquete ofrece una ruta de despliegue verificada con latencias de decenas de milisegundos sin GPU dedicada. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U2-Net (encoder-decoder con Residual U-blocks, CNN) |
| Parametros totales | no disponible (pesos ONNX de 176.449.989 bytes en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | fp32 (ONNX e IR); blob NPU precompilado; copia fp16 del ONNX usada en la medición CUDA (no incluida en el repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob NPU (.blob) |
| Tarea | image-segmentation (cloth parsing, 3 clases) |
| Librería | openvino |
| Modelo base | litert-community/Cloth-Segmentation-U2Net-LiteRT (relación: quantized) |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es U2-Net, una red convolucional completamente (fully convolutional) con estructura encoder-decoder de dos niveles y bloques RSU con conexiones residuales internas, pensada originalmente para salient object detection y reutilizada aquí para segmentación de prendas. El modelo produce mapas de segmentación para tres regiones: parte superior del cuerpo, parte inferior y cuerpo completo. No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino con preferencias; se trata de un modelo supervisado de segmentación, sin RLHF ni DPO.

La innovación técnica de este repositorio no está en el entrenamiento sino en la cadena de conversión y despliegue: exportación del `.tflite` original a ONNX con tf2onnx 1.17.0 (opset 17), generación de OpenVINO IR con pesos fp32 y compilación anticipada de un blob para la NPU Intel (compilado con OpenVINO 2026.4.1, driver NPU 32.0.100.4841, NPU_COMPILER_VERSION 524292). El blob evita la compilación en tiempo de carga (0,08 s de carga frente a 396,19 s al compilar el ONNX en la NPU con ONNX Runtime), a costa de atarse a una versión concreta de driver y runtime; el autor indica que, si `import_model` rechaza el blob, se recompile el IR. Se verificó la equivalencia numérica del ONNX frente al `.tflite` original (coseno ≥ 0.9999 en todas las salidas) y de cada backend frente a la salida fp32 en CPU (coseno ≥ 0.9999, sin NaN ni Inf).

## Capacidades

- Segmentación semántica de prendas de vestir en tres clases: parte superior, parte inferior y cuerpo completo.
- Funciona con fondos variados y un rango amplio de poses, según la documentación del modelo original (u2net_cloth_seg).
- Entrada de imagen preprocesada como tensor float32; salida como mapas de segmentación (shapes determinados por el grafo compilado).
- Ejecución en NPU Intel (blob precompilado o IR compilado), iGPU Intel, CPU y GPU NVIDIA vía ONNX Runtime con execution providers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje: es exclusivamente visión.
- No dispone de modo thinking, audio ni vídeo; es un modelo de imagen única por inferencia.

## Casos de uso

- Prueba virtual de ropa en comercio electrónico: el modelo genera la máscara de la prenda sobre la foto del usuario, que se compone después con la imagen del catálogo; la latencia de 94 ms en NPU permite previsualizaciones interactivas en el propio portátil del cliente.
- Etiquetado automático de catálogo: procesar lotes de fotos de producto para recortar la prenda y clasificarla en parte superior, inferior o cuerpo completo, alimentando un pipeline de gestión de assets.
- Moderación y análisis de contenido en redes sociales: detectar y aislar la ropa en imágenes subidas por usuarios para aplicar filtros, censura parcial o análisis de estilo, ejecutándose en el servidor con CPU o iGPU sin GPU dedicada.
- Asistencia a recomendación de tallas y estilo: extraer la silueta de la prenda y su categoría para estimar proporciones y sugerir combinaciones; la ventana de inferencia inferior a 100 ms en NPU permite integrarlo en apps de escritorio con IA local.
- Procesamiento en el borde (edge) en portátiles Intel Core Ultra: desplegar el blob NPU en una aplicación de escritorio de edición fotográfica que recorte y separe prendas sin enviar imágenes a la nube, con carga del modelo en 0,08 s.
- Automatización de estudios de moda: separar prendas de fotos de sesión para generar fondos neutros o fichas técnicas de producto de forma masiva, usando la iGPU (62,59 ms) o la CPU (2046,14 ms) según el hardware disponible en el puesto de trabajo.
- Investigación en eficiencia de despliegue: usar el par ONNX/IR/blob como referencia reproducible para comparar latencias entre NPU, iGPU, CPU y GPU en un mismo modelo de visión, con la tabla de mediciones y los scripts publicados en el repositorio windows-zoo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de segmentación (IoU, mIoU, accuracy por clase) en la información disponible. Sí se publican mediciones de latencia y verificación de salida, reproducidas por el autor el 2026-11-07 en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con entrada y salida numpy, mediana de 30 ejecuciones tras 5 de calentamiento:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 94,22 | 0,08 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` (compila al cargar) | 90,71 | 396,19 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 62,59 | 3,05 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 36,55 | 1,12 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` fp32 | 60,74 | 1,14 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 2046,14 | 0,36 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 72,53 | 0,41 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` (compila al cargar) | 51,67 | 13,53 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 47,84 | 0,28 | no comparado |

Las filas de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub (2026-10-30) con su propio cronómetro y no se compararon contra la salida de referencia. El autor anota que una de las ejecuciones en AI Hub falló con un error interno.

## Requisitos de hardware

- VRAM estimada: el ONNX fp32 ocupa 176,4 MB; la copia fp16 usada en CUDA reduce el peso a la mitad aproximadamente. El IR OpenVINO ocupa 176,1 MB en `.bin` y el blob NPU 134,8 MB. La memoria de activaciones es adicional y no se documenta.
- GPU recomendadas: RTX 5080 Laptop (medido a 95 W, 36,55 ms con fp16 y 60,74 ms con fp32); cualquier GPU NVIDIA con soporte de CUDA EP de ONNX Runtime debería funcionar, aunque no hay mediciones publicadas para otros modelos.
- Aceleradores Intel: NPU Intel AI Boost de Core Ultra (94,22 ms con blob, 90,71 ms compilando el ONNX) e iGPU Intel Graphics (62,59 ms).
- CPU: Core Ultra 9 386H con ONNX Runtime CPU EP tarda 2046,14 ms por inferencia; es la referencia funcional pero no apta para tiempo real.
- Cabe en hardware consumer: sí, es un modelo de 176 MB que corre en portátiles con iGPU o NPU Intel y en GPU de portátil.
- Opciones de despliegue: OpenVINO (2026.4.1) con `import_model` del blob o `compile_model` del IR; ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, CUDA EP o CPU EP; Qualcomm AI Hub para QNN en Snapdragon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: latencias de 36,55 a 94,22 ms en aceleradores; no se publica throughput agregado ni métricas de batch. La carga del blob NPU es de 0,08 s, frente a 396,19 s si se compila el ONNX para NPU en tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloth-Segmentation-U2Net-OpenVINO (este) | no disponible (ONNX fp32 de 176,4 MB) | no aplica | Segmentación de prendas, 3 clases | MIT | Hugging Face, formatos ONNX/IR/blob NPU |
| litert-community/Cloth-Segmentation-U2Net-LiteRT (base) | no disponible | no aplica | Segmentación de prendas, 3 clases | MIT | Hugging Face, formato LiteRT/TFLite |
| bsmnyk/u2net_cloth_seg (implementación original) | no disponible | no aplica | Segmentación de prendas, 3 clases | no disponible en la información | GitHub, código de entrenamiento e inferencia |

La comparación con alternativas de la misma categoría (otros modelos de cloth parsing o de segmentación de personas) no está disponible en la información proporcionada. El modelo base LiteRT y este paquete OpenVINO comparten pesos y licencia; la diferencia es el formato y el backend de ejecución, no la calidad de segmentación.

## Limitaciones y advertencias

- Modelo especializado en una única tarea: no genera texto, no razona y no procesa lenguaje; cualquier caso de uso fuera de la segmentación de prendas requiere otro modelo.
- No se han publicado métricas de calidad de segmentación (IoU/mIoU) en la información disponible; no hay evidencia cuantitativa de precisión más allá de la equivalencia numérica con el `.tflite` original.
- El blob NPU está compilado para OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y obliga a recompilar el IR, con el coste de carga asociado (396,19 s en la medición del autor).
- La copia fp16 del ONNX usada para la medición en CUDA no está incluida en el repositorio; quien quiera reproducirla debe generarla.
- Las mediciones de Snapdragon X2 Elite y Galaxy S26 provienen de Qualcomm AI Hub, con su propio cronómetro, y no se validaron contra la salida de referencia; una de las ejecuciones falló con un error interno.
- Riesgo de sesgo y alucinación: no aplica alucinación en el sentido de generación de texto, pero sí puede haber errores de segmentación en prendas ambiguas, oclusiones, fondos complejos o categorías no contempladas (calzado, accesorios), sin datos publicados sobre estos fallos.
- No hay información sobre la composición del dataset de entrenamiento ni sobre sesgos demográficos o de estilo; conviene validar el modelo en el dominio concreto antes de producción.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base LiteRT, que el autor identifica como MIT.
- El repositorio no registra descargas ni likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-07) sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Cloth-Segmentation-U2Net-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/Cloth-Segmentation-U2Net-LiteRT
- README del modelo base: https://huggingface.co/litert-community/Cloth-Segmentation-U2Net-LiteRT/blob/main/README.md
- Repositorio con scripts y mediciones (windows-zoo): https://github.com/john-rocky/windows-zoo
- Implementación original de cloth segmentation con U2-Net: https://github.com/bsmnyk/u2net_cloth_seg
- Muestras del modelo original: https://github.com/bsmnyk/u2net_cloth_seg/blob/main/samples.md
