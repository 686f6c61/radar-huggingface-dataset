# mlboydaisuke/NAFNet-SIDD-width32-OpenVINO

## Resumen

NAFNet-SIDD-width32-OpenVINO es una conversión y empaquetado del modelo NAFNet (Nonlinear Activation Free Network) de reducción de ruido en imágenes, originalmente publicado por Megvii Research y adaptado a formato LiteRT por litert-community. Este repositorio, mantenido por mlboydaisuke, distribuye el mismo modelo en tres formatos optimizados para hardware Intel: un grafo ONNX (opset 17, exportado con tf2onnx 1.17.0), un IR de OpenVINO con pesos en fp32 y un blob precompilado para la NPU integrada en los procesadores Intel Core Ultra. El objetivo es permitir la inferencia del modelo de restauración de imagen en aceleradores Intel (NPU, iGPU y CPU) sin necesidad de recompilar el grafo.

El modelo resuelve la tarea de eliminación de ruido (denoising) sobre imágenes, específicamente entrenado sobre el dataset SIDD (Smartphone Image Denoising Dataset), con una anchura de canales de 32. La relevancia actual radica en su despliegue en NPUs de consumo: el blob precompilado ejecuta una inferencia en 33,37 ms en la NPU de un Core Ultra 9 386H, lo que lo hace viable para procesamiento de imagen en tiempo real en portátiles sin GPU dedicada.

La arquitectura subyacente es NAFNet, una red de restauración de imagen que elimina las funciones de activación no lineales (ReLU, GELU, etc.) de los bloques, simplificando el grafo y reduciendo el coste computacional. El repositorio no incluye información sobre el número de parámetros totales ni sobre el proceso de entrenamiento original; se limita al empaquetado y la medición de rendimiento en hardware Intel y Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Nonlinear Activation Free Network), red convolucional para restauración de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-image) |
| Tipos de cuantizacion | fp16 (exportación ONNX y blob NPU), fp32 (IR de OpenVINO) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob precompilado para NPU Intel |

## Arquitectura y entrenamiento

NAFNet es una red de restauración de imagen que sustituye las funciones de activación no lineales tradicionales por una combinación de operaciones simples (normalización y multiplicación elemento a elemento) dentro de bloques residuales. Esta simplificación reduce la complejidad del grafo y facilita la compilación para aceleradores hardware como la NPU de Intel. El modelo de este repositorio corresponde a la variante width32, es decir, con 32 canales base, entrenada sobre el dataset SIDD para denoising de imágenes de smartphone.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de SIDD, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplica a un modelo de visión). La innovación técnica destacable es la ausencia de funciones de activación no lineales, que simplifica el grafo y permite una compilación eficiente en NPU. El repositorio incluye además un blob precompilado con OpenVINO 2026.4.1 y el driver de NPU de Intel 32.0.100.4841, lo que evita la compilación en tiempo de carga.

## Capacidades

- Eliminación de ruido en imágenes (denoising) entrenada sobre el dataset SIDD.
- Restauración de imagen image-to-image: recibe una imagen ruidosa y devuelve una versión limpia.
- Inferencia en NPU Intel (AI Boost), iGPU Intel Graphics y CPU Intel mediante OpenVINO.
- Inferencia en GPU NVIDIA mediante ONNX Runtime con el execution provider CUDA.
- Inferencia en NPU Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante ONNX Runtime con QNN EP y Qualcomm AI Hub.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni modo thinking (no aplica).
- No soporta visión general más allá del denoising: no es un modelo multimodal.

## Casos de uso

- **Procesamiento de fotos en tiempo real en portátiles con NPU Intel**: el blob precompilado ejecuta una inferencia en 33,37 ms en la NPU de un Core Ultra 9 386H, lo que permite limpiar imágenes de la cámara en aplicaciones de videollamada o captura sin GPU dedicada.
- **Pipeline de preprocesado en aplicaciones de fotografía móvil**: el modelo ONNX puede integrarse en flujos de edición de imagen en dispositivos Snapdragon (25,45 ms en la NPU del Galaxy S26) para eliminar ruido antes de aplicar filtros o compresión.
- **Automatización de limpieza de datasets de imágenes**: dado que el modelo es image-to-image y funciona en CPU (732,31 ms en un Core Ultra 9 386H), puede usarse en lotes para preprocesar grandes colecciones de imágenes ruidosas antes de entrenar otros modelos de visión.
- **Integración en aplicaciones de escritorio con ONNX Runtime**: el grafo ONNX con el execution provider OpenVINO permite desplegar el denoising en aplicaciones Windows/Linux sin depender de CUDA, usando la iGPU Intel (32,90 ms) como acelerador por defecto.
- **Prototipado en Qualcomm AI Hub**: el mismo ONNX puede perfilarse y desplegarse en NPUs Snapdragon mediante AI Hub, lo que facilita la validación en dispositivos móviles antes de producir una app.
- **Investigación en restauración de imagen**: al estar disponible el grafo ONNX y el IR de OpenVINO, los investigadores pueden inspeccionar la arquitectura NAFNet, medir latencias en distintos aceleradores y comparar con otras variantes de la familia NAFNet.

## Benchmarks y rendimiento

Los datos de rendimiento publicados en la model card corresponden a latencias de inferencia medidas en distintos procesadores. No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM) en la información disponible.

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 33,37 | 0,06 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 34,20 | 64,26 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 32,90 | 6,50 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | fp16 `.onnx` | 50,21 | 1,52 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 46,93 | 1,58 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 732,31 | 0,62 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 25,95 | 0,39 | no comparado |
| Snapdragon X2 Elite NPU | ONNX Runtime QNN EP | `.onnx` | 43,49 (4 capas en CPU) | 38,48 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 25,45 | 0,23 | no comparado |

La verificación de salida compara cada resultado con la salida de referencia en CPU fp32 (ONNX Runtime CPU EP), con criterio PASS si el coseno es ≥ 0,99 y no hay NaN ni Inf. El ONNX también se comparó contra el `.tflite` original con coseno ≥ 0,9999.

## Requisitos de hardware

- **VRAM estimada**: el modelo es pequeño (el ONNX pesa 123,97 MB, el blob NPU 76,56 MB), por lo que la huella de memoria es inferior a 1 GB en la mayoría de configuraciones.
- **GPU recomendadas**: RTX 5080 Laptop (medido a 46,93 ms con CUDA EP); cualquier GPU NVIDIA con soporte CUDA puede ejecutar el ONNX.
- **Consumer GPU**: cabe en cualquier GPU de consumo; también funciona en iGPU Intel (32,90 ms) y en NPU Intel (33,37 ms).
- **Opciones de despliegue**: OpenVINO 2026.4.1 (NPU, iGPU, CPU), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, ONNX Runtime con CUDA EP, Qualcomm AI Hub (QNN).
- **Latencia y throughput**: 33,37 ms por inferencia en NPU Intel; 25,45–25,95 ms en NPUs Snapdragon; 732,31 ms en CPU Intel. El blob precompilado carga en 0,06 s, frente a los 64,26 s de compilación en la NPU al cargar el ONNX con el OpenVINO EP.
- **Nota sobre el blob**: el blob fue compilado con OpenVINO 2026.4.1 y el driver de NPU 32.0.100.4841; si `import_model` lo rechaza en otra versión, hay que compilar el IR en la máquina destino.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Formatos | Latencia medida |
|---|---|---|---|---|---|
| NAFNet-SIDD-width32-OpenVINO (este) | NAFNet width32 | Denoising SIDD | MIT | ONNX, OpenVINO IR, blob NPU | 33,37 ms (NPU Intel) |
| litert-community/NAFNet-SIDD-width32-LiteRT | NAFNet width32 | Denoising SIDD | MIT | LiteRT (.tflite) | no disponible en la información |
| NAFNet original (megvii-research) | NAFNet (varias anchuras) | Restauración de imagen | no disponible en la información | PyTorch | no disponible en la información |

No se dispone de datos de benchmarks de calidad (PSNR/SSIM) ni de latencias de las alternativas en la información proporcionada, por lo que la comparación se limita a formatos y licencia.

## Limitaciones y advertencias

- **Sesgos**: no disponible; no se ha documentado ningún análisis de sesgos para este modelo.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero el modelo puede producir artefactos o suavizado excesivo en imágenes con ruido muy estructurado o dominios distintos a SIDD.
- **Limitaciones de contexto o idioma**: no aplica (modelo de visión); el dominio de entrenamiento es SIDD (fotos de smartphone), por lo que el rendimiento puede degradarse en otros tipos de ruido (médico, astronómico, etc.).
- **Restricciones de licencia**: MIT, permite uso comercial con atribución; se hereda la licencia del modelo base litert-community/NAFNet-SIDD-width32-LiteRT.
- **Caveat de producción**: el blob NPU está atado a OpenVINO 2026.4.1 y al driver 32.0.100.4841; en otras versiones hay que recompilar el IR, lo que añade latencia de carga (64,26 s medidos con el OpenVINO EP).
- **Caveat de medición**: las latencias de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon contra la salida de referencia; las de RTX 5080 corresponden a un portátil con límite de 95 W.
- **Datos ausentes**: no se publican número de parámetros, composición detallada del dataset de entrenamiento ni métricas de calidad de imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/NAFNet-SIDD-width32-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/NAFNet-SIDD-width32-LiteRT
- Repositorio NAFNet original (Megvii Research): https://github.com/megvii-research/NAFNet
- Configuración de entrenamiento SIDD width32: https://github.com/megvii-research/NAFNet/blob/main/options/train/SIDD/NAFNet-width32.yml
- Scripts y mediciones del autor (windows-zoo): https://github.com/john-rocky/windows-zoo
- Muestras del modelo LiteRT: https://huggingface.co/litert-community/NAFNet-SIDD-width32-LiteRT/tree/main/samples
