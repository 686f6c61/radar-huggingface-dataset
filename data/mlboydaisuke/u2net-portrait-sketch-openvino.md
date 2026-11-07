# mlboydaisuke/U2Net-Portrait-Sketch-OpenVINO

## Resumen

U2Net-Portrait-Sketch-OpenVINO es una conversión y empaquetado del modelo U2Net-Portrait-Sketch-LiteRT (de litert-community) para su ejecución en hardware Intel mediante OpenVINO. Se trata de un modelo de imagen a imagen (image-to-image) basado en la arquitectura U2Net, especializado en la generación de bocetos (sketches) a partir de retratos fotográficos. El autor, mlboydaisuke, distribuye tres artefactos: un modelo ONNX (opset 17, convertido con tf2onnx 1.17.0), un OpenVINO IR con pesos fp32 y un blob precompilado para la NPU de Intel, además del ONNX original con pesos de aproximadamente 176 MB.

La relevancia de este paquete es de ingeniería de despliegue más que de investigación: demuestra la ejecución de un modelo de visión en la NPU integrada de un Intel Core Ultra 9 386H con una latencia de 39,30 ms por inferencia (entrada y salida numpy, blob precompilado), y en la iGPU del mismo equipo con 28,14 ms mediante el Execution Provider de OpenVINO en ONNX Runtime. El modelo base es de tipo cuantizado respecto al LiteRT original, y el repositorio ocupa 0,5 GB.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, al ser un modelo de visión) ni los idiomas soportados. La licencia es Apache-2.0, heredada del modelo base. La ficha se centra, por tanto, en las especificaciones de despliegue y en los datos de rendimiento medidos que el autor publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U2Net (red de segmentación/saliency con estructura encoder-decoder anidada; detalles no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | Pesos fp32 en el OpenVINO IR; blob precompilado para NPU; copia fp16 del ONNX usada en la medición con CUDA EP (no incluida en el repo) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob precompilado para Intel NPU |

## Arquitectura y entrenamiento

El modelo base es U2Net-Portrait-Sketch-LiteRT, una variante de U2Net orientada a la generación de bocetos de retrato. U2Net es una arquitectura de red neuronal convolucional con estructura encoder-decoder anidada, diseñada originalmente para detección de saliencia y segmentación, que aquí se aplica a una tarea de traducción de imagen a imagen (foto de retrato a boceto). El paquete OpenVINO no incluye información sobre el conjunto de datos de entrenamiento, el número de tokens (no aplica) ni si hubo etapas de ajuste fino con RLHF o DPO (no aplica a un modelo de visión de este tipo).

La innovación técnica de este repositorio es el pipeline de conversión y despliegue: conversión del `.tflite` original a ONNX con tf2onnx 1.17.0 (opset 17), generación del OpenVINO IR con pesos fp32 y compilación de un blob específico para la NPU de Intel con OpenVINO 2026.4.1, driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). El autor verifica la fidelidad de la conversión comparando cada salida contra la salida de referencia en CPU fp32 (ONNX Runtime CPU EP): la comprobación pasa con coseno ≥ 0,9999 en todos los casos, y el ONNX contra el `.tflite` original también pasa con coseno ≥ 0,9999. El blob precompilado evita la compilación en tiempo de carga (0,06 s de carga frente a 47,59 s al compilar el ONNX para la NPU en la primera sesión).

## Capacidades

- Generación de bocetos (sketch) a partir de imágenes de retrato: tarea principal de imagen a imagen.
- Ejecución en NPU de Intel (Intel AI Boost), iGPU Intel, GPU NVIDIA (CUDA EP) y CPU, con el mismo artefacto ONNX o el IR de OpenVINO.
- Inferencia de baja latencia en hardware de consumo: 39,30 ms en NPU de Core Ultra 9 386H y 28,14 ms en iGPU del mismo equipo.
- Compatibilidad con OpenVINO Runtime (importación del blob o compilación del IR) y con ONNX Runtime mediante el Execution Provider de OpenVINO.
- No se documentan capacidades de texto, tool calling, agentes, razonamiento multi-paso, audio ni modo thinking; el modelo es exclusivamente de visión.
- No se documentan capacidades multilingües (no aplica).

## Casos de uso

- Procesamiento de retratos en tiempo real en portátiles con Intel Core Ultra: el blob precompilado se carga en 0,06 s y ejecuta en 39,30 ms en la NPU, lo que permite generar bocetos al vuelo en aplicaciones de edición fotográfica o captura de cámara.
- Filtros y efectos en aplicaciones de escritorio: la inferencia en iGPU (28,14 ms) y NPU (39,30 ms) permite integrar el modelo en herramientas de retoque sin depender de una GPU dedicada.
- Previsualización de bocetos en pipelines de ilustración: útil para generar una base de boceto a partir de una foto de referencia antes de un proceso de pintura o entintado manual.
- Automatización de contenido para redes o catálogos: conversión por lotes de retratos a estilo boceto en un servidor con CPU Intel (988,65 ms por imagen en CPU, adecuado para procesos no interactivos).
- Prototipado en dispositivos móviles y plataformas Qualcomm: el mismo ONNX se perfila en NPU de Snapdragon X2 Elite (21,13 ms) y Galaxy S26 (18,52 ms) mediante Qualcomm AI Hub, lo que abre la puerta a despliegues móviles.
- Investigación y evaluación de runtimes: el repositorio sirve como caso de estudio reproducible para comparar latencias entre NPU, iGPU, GPU y CPU con el mismo modelo y la misma entrada, con scripts y registros publicados en el repositorio windows-zoo.
- Integración en aplicaciones de videollamada o avatares: la latencia sub-40 ms en NPU permite aplicar el efecto de boceto sobre fotogramas de vídeo en tiempo real en equipos Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, FID, etc.) en la información disponible. El autor publica mediciones de latencia y comprobaciones de fidelidad de salida, que se recogen a continuación.

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (import_model) | 39,30 | 0,06 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | .onnx (compilado al cargar) | 39,63 | 47,59 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | .onnx | 28,14 | 3,27 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del .onnx (no en repo) | 18,31 | 1,11 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | .onnx | 29,80 | 1,22 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | .onnx | 988,65 | 0,36 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | .onnx compilado por AI Hub | 21,13 | 0,45 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | .onnx (compilado al cargar) | 21,15 | 7,10 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | .onnx compilado por AI Hub | 18,52 | 0,23 | no comparado |

Metodología: MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red), 2026-11-06 a 2026-11-07. Cada fila es un proceso: carga, una ejecución, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento + 10 cronometradas cuando la primera ejecución supera los 3 s), entrada y salida numpy, cada runtime en su configuración por defecto, un proceso a la vez tras dejar inactivos CPU, RTX e iGPU. Las filas de Snapdragon son trabajos de perfilado de Qualcomm AI Hub con su propio temporizador.

## Requisitos de hardware

- El modelo es pequeño: el ONNX pesa 176.264.390 bytes y el OpenVINO IR 175.924.564 bytes en fp32, por lo que cabe holgadamente en cualquier GPU de consumo.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos fp32 (unos 176 MB) la huella es inferior a 1 GB, aunque no se documenta el pico de memoria en ejecución.
- GPU recomendadas: RTX 5080 Laptop (medido, 18,31 ms con fp16 y 29,80 ms con fp32 en CUDA EP); cualquier GPU NVIDIA con soporte CUDA debería ser suficiente, aunque no se aportan mediciones de otros modelos.
- Cabe en GPU de consumo: sí, por tamaño de pesos; el autor no publica pruebas en otras GPU de consumo.
- NPU Intel AI Boost (Core Ultra 9 386H): 39,30 ms con el blob precompilado; requiere OpenVINO 2026.4.1 y driver NPU 32.0.100.4841 para importar el blob. Si el driver o la versión no coinciden, debe compilarse el IR (`core.compile_model("openvino/portrait.xml", "NPU")`).
- iGPU Intel: 28,14 ms mediante ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1.
- CPU: 988,65 ms en Core Ultra 9 386H con ONNX Runtime CPU EP.
- Opciones de despliegue: OpenVINO Runtime (blob o IR), ONNX Runtime con OpenVINO EP o CUDA EP, y Qualcomm AI Hub / QNN EP en plataformas Snapdragon. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen de este tipo).
- Latencia y throughput: latencias por inferencia indicadas arriba; no se publica throughput agregado en lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de parámetros de modelos comparables en la información proporcionada. La comparación se limita a los artefactos del mismo modelo base en distintos formatos y a las plataformas de ejecución medidas.

| Modelo / artefacto | Formato | Plataforma | Latencia | Licencia |
|---|---|---|---|---|
| U2Net-Portrait-Sketch-OpenVINO (este repo) | ONNX, IR, blob NPU | Intel NPU / iGPU / CPU, NVIDIA, Qualcomm | 18,31–988,65 ms | Apache-2.0 |
| litert-community/U2Net-Portrait-Sketch-LiteRT | .tflite | LiteRT (CPU) | no disponible | Apache-2.0 |

No se han identificado en la información disponible otros modelos de generación de bocetos de retrato comparables con datos de rendimiento publicados.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un modelo de visión entrenado para retratos, puede degradar la calidad en rostros no representados en su distribución de entrenamiento (no confirmado en la información disponible).
- Riesgo de alucinación no aplica en el sentido textual, pero sí de artefactos visuales en el boceto generado; no se publican métricas de calidad que lo cuantifiquen.
- El blob precompilado para NPU depende de OpenVINO 2026.4.1 y del driver NPU 32.0.100.4841; con otras versiones `import_model` puede rechazarlo y es necesario compilar el IR, lo que incrementa el tiempo de carga (hasta 47,59 s en la medición con ONNX Runtime + OpenVINO EP).
- La copia fp16 del ONNX usada para la medición con CUDA EP no está incluida en el repositorio.
- Las mediciones de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub con su propio temporizador y no se compararon contra la salida de referencia.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base (litert-community/U2Net-Portrait-Sketch-LiteRT) y de los datasets originales de U2Net, no detallados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan idiomas ni contexto (no aplica); no debe evaluarse como modelo de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/U2Net-Portrait-Sketch-OpenVINO
- Modelo base: https://huggingface.co/litert-community/U2Net-Portrait-Sketch-LiteRT
- Archivo .tflite del modelo base: https://huggingface.co/litert-community/U2Net-Portrait-Sketch-LiteRT/blob/main/portrait.tflite
- Repositorio de scripts y registros (windows-zoo): https://github.com/john-rocky/windows-zoo
