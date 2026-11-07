# mlboydaisuke/EDSR-x4-OpenVINO

## Resumen

EDSR-x4-OpenVINO es una conversión del modelo de superresolución de imagen EDSR (Enhanced Deep Residual Networks) con factor de escala x4, empaquetada específicamente para su despliegue en hardware Intel mediante OpenVINO. El autor, mlboydaisuke, parte del modelo litert-community/EDSR-x4-LiteRT (a su vez derivado de eugenesiow/edsr-base) y lo exporta a ONNX (opset 17, tf2onnx 1.17.0), a formato OpenVINO IR con pesos fp32 y a un blob precompilado para la NPU de Intel. No se trata de un modelo de lenguaje, sino de una red convolucional para image-to-image (superresolución), con un tamaño de fichero de pesos de aproximadamente 7,6 MB.

El interés de esta ficha no reside en la arquitectura del modelo (que es el EDSR clásico de 2017), sino en el trabajo de portabilidad y medición: el autor publica latencias reales sobre NPU Intel AI Boost, iGPU Intel, RTX 5080 Laptop, CPU Core Ultra y NPU Snapdragon, con verificación de salida frente a la referencia fp32 en CPU. Sobre la NPU del Core Ultra 9 386H el blob precompilado ejecuta en 18,18 ms por inferencia (numpy a numpy), y en iGPU Intel baja a 14,68 ms.

Es relevante ahora porque demuestra un flujo práctico de despliegue de modelos de visión en NPUs de PC (Intel Core Ultra) y móviles, un nicho donde escasean artefactos listos para producción con métricas reproducibles. La licencia Apache-2.0 facilita su uso comercial, aunque las capacidades del modelo se limitan estrictamente a reescalado x4 de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EDSR (Enhanced Deep Residual Networks), red convolucional con bloques residuales; exportada a ONNX y OpenVINO IR |
| Parámetros totales | no disponible (pesos fp32 de 7.643.728 bytes en el IR; el ONNX ocupa 7.774.984 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | fp32 (IR y ONNX); blob NPU precompilado; copia fp16 del ONNX usada para la medición en CUDA EP (no incluida en el repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob NPU precompilado (.blob) |

## Arquitectura y entrenamiento

El modelo subyacente es EDSR, presentado en el paper "Enhanced Deep Residual Networks for Single Image Super-Resolution" (Lim et al., 2017). Se trata de una red totalmente convolucional con bloques residuales que elimina las capas de normalización por lotes del SRResNet original para ganar precisión y eficiencia, y que aquí se emplea con factor de escala x4. La cadena de procedencia es: eugenesiow/edsr-base (upstream) → litert-community/EDSR-x4-LiteRT (conversión a LiteRT/TFLite) → este repositorio (ONNX + OpenVINO IR + blob NPU).

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni de si hubo ajuste fino posterior. El trabajo técnico destacable de este repositorio es la conversión y validación: exportación con tf2onnx 1.17.0 a opset 17, compilación a OpenVINO IR con pesos fp32, generación de un blob para la NPU Intel con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841, y verificación de que la salida ONNX coincide con el .tflite fuente (coseno ≥ 0,9999 en todas las salidas).

## Capacidades

- Superresolución de imagen con factor de escala x4 (image-to-image): recibe una imagen de baja resolución y devuelve una de resolución cuádruple.
- Ejecución en NPU Intel AI Boost, iGPU Intel, GPU NVIDIA (CUDA EP) y CPU, con el mismo artefacto ONNX o el IR.
- Despliegue mediante OpenVINO (importación de blob precompilado o compilación del IR en destino).
- Despliegue mediante ONNX Runtime con el Execution Provider de OpenVINO o el EP de CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking; es exclusivamente un modelo de visión.
- Capacidades multilingües: no aplica.

## Casos de uso

- Mejora de imágenes en aplicaciones de escritorio con NPU Intel: integración del blob en una app Windows que aproveche la NPU del Core Ultra para reescalar imágenes x4 en ~18 ms por fotograma, liberando CPU y GPU para otras tareas.
- Procesado por lotes de imágenes en servidores con CPU: usar el ONNX con ONNX Runtime CPU EP (591,78 ms por inferencia en el Core Ultra 9 386H) para pipelines de aumento de resolución sin GPU dedicada.
- Restauración de imágenes en dispositivos móviles con Snapdragon: el ONNX compilado con QNN en Galaxy S26 NPU ejecuta en 9,43 ms, adecuado para apps de cámara o galería que reescalen capturas en el dispositivo.
- Preprocesado para pipelines de visión por computador: aumentar la resolución de imágenes de entrada antes de etapas de detección o segmentación, aprovechando la baja latencia en iGPU (14,68 ms) para no penalizar el throughput global.
- Prototipado e investigación en superresolución: servir como baseline reproducible y ligero (7,6 MB de pesos) para comparar técnicas de superresolución o para validar flujos de conversión ONNX/OpenVINO.
- Despliegue en edge con requisitos de privacidad: ejecutar la superresolución localmente en el PC del usuario sin enviar imágenes a la nube, gracias a que el modelo cabe en memoria y corre en NPU/iGPU de consumo.
- Integración en herramientas de fotografía o vídeo: reescalado x4 de fotogramas o imágenes con latencias de milisegundos en GPU NVIDIA (7,27 ms con fp16) para edición casi en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM) en la información disponible. Sí se publican mediciones de latencia y verificación de salida:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 18,18 | 0,01 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 17,02 | 25,62 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 14,68 | 0,45 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 7,27 | 1,30 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 11,12 | 1,23 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 591,78 | 0,10 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 10,57 | 0,35 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 110,25 (2 capas en CPU) | 12,35 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 9,43 | 0,18 | no comparado |

Mediciones realizadas en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con mediana de 30 ejecuciones tras calentamiento, entrada y salida numpy.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlboydaisuke/EDSR-x4-OpenVINO | EDSR | x4 | ONNX, OpenVINO IR, blob NPU | Apache-2.0 | Hugging Face (este repo) |
| litert-community/EDSR-x4-LiteRT | EDSR | x4 | LiteRT/TFLite | Apache-2.0 | Hugging Face (modelo base) |
| mlboydaisuke/EDSR-x4-ExecuTorch | EDSR | x4 | ExecuTorch | no disponible | Hugging Face |
| eugenesiow/edsr-base | EDSR | x4 | TensorFlow | no disponible | Hugging Face (upstream) |

No se dispone de datos de rendimiento comparativo (PSNR/SSIM) entre estas variantes en la información proporcionada; todas comparten la misma arquitectura EDSR subyacente y difieren en el formato de despliegue y el hardware objetivo.

## Limitaciones y advertencias

- El modelo solo realiza superresolución x4; no genera texto, no razona y no procesa otros tipos de entrada.
- No se han publicado métricas de calidad de imagen (PSNR/SSIM) en la información disponible, por lo que no es posible evaluar su fidelidad frente a alternativas más modernas.
- El blob NPU está compilado con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otras versiones de driver o de OpenVINO, `import_model` puede rechazarlo y habrá que compilar el IR en destino.
- La carga del ONNX en la NPU vía ONNX Runtime OpenVINO EP tarda 25,62 s (compilación en carga), lo que desaconseja su uso en escenarios de arranque frecuente.
- Las mediciones en Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon contra la referencia fp32.
- Riesgo de artefactos propios de la superresolución: posible sobreajuste a patrones del dataset de entrenamiento, halos o texturas inventadas en imágenes muy degradadas.
- Sesgos: no disponibles en la información proporcionada; al ser un modelo de imagen, los sesgos se manifestarían en la reproducción de texturas o contenidos del dataset de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream (eugenesiow/edsr-base), cuya licencia no se detalla en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/EDSR-x4-OpenVINO
- Modelo base: https://huggingface.co/litert-community/EDSR-x4-LiteRT
- Modelo upstream: https://huggingface.co/eugenesiow/edsr-base
- Variante ExecuTorch: https://huggingface.co/mlboydaisuke/EDSR-x4-ExecuTorch
- Scripts y mediciones (windows-zoo): https://github.com/john-rocky/windows-zoo
- Implementación TensorFlow de EDSR: https://github.com/Saafke/EDSR_Tensorflow
