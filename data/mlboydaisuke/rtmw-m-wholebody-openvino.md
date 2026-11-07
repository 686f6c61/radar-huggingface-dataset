# mlboydaisuke/RTMW-m-WholeBody-OpenVINO

## Resumen

RTMW-m-WholeBody-OpenVINO es una conversión y empaquetado del modelo RTMW-m (Real-Time Multi-person Whole-body pose estimation, variante medium) para su ejecución sobre hardware Intel mediante OpenVINO. El modelo original estima 133 keypoints por persona (cuerpo completo, manos y rostro) en imágenes RGB, y esta versión, publicada por el usuario mlboydaisuke, ofrece los pesos en tres formatos: ONNX (opset 17, generado con tf2onnx 1.17.0 a partir del modelo LiteRT de litert-community), OpenVINO IR con pesos fp32 y un blob NPU precompilado para Intel Core Ultra.

La relevancia de esta ficha no reside en el modelo de pose en sí, sino en el trabajo de portabilidad y medición: el autor documenta latencias reales sobre NPU Intel AI Boost, iGPU Intel Graphics, CPU Core Ultra 9 386H, GPU RTX 5080 Laptop y NPU Snapdragon X2 Elite, junto con una verificación de salida contra la referencia en CPU. Es un artefacto orientado a despliegue en el borde (edge) más que a investigación.

Conviene señalar desde el principio una advertencia importante: según las mediciones del propio autor, las ejecuciones en la NPU Intel producen NaN en ambas salidas y fallan la comprobación de coseno, por lo que el blob NPU no es funcionalmente correcto en la configuración probada, pese a su baja latencia de 8,13 ms. Solo la ruta ONNX en CPU y en GPU CUDA supera la verificación de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMW-m (estimación de pose de cuerpo completo, 133 keypoints); topología interna no detallada en la información disponible |
| Parametros totales | no disponible (pesos ONNX de 132.050.550 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lingüístico) |
| Tipos de cuantizacion | fp16 (origen LiteRT), fp32 (IR OpenVINO), blob NPU precompilado; copia fp16 del ONNX usada en la prueba CUDA |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob NPU (.blob) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del RTMW-m original (capas, bloques, mecanismos de atención ni resolución de entrada). Lo que sí se documenta es la cadena de conversión: el modelo parte de `litert-community/RTMW-m-WholeBody-LiteRT` (pesos `rtmw_fp16`), se exporta a ONNX con tf2onnx 1.17.0 en opset 17 y se convierte a OpenVINO IR con pesos fp32. El blob NPU se compiló con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292).

No se dispone de datos sobre el conjunto de entrenamiento, número de tokens o imágenes, composición del dataset ni si hubo ajuste fino con RLHF/DPO (no aplicable a un modelo de pose). La única validación de fidelidad documentada es la comparación del ONNX contra el `.tflite` original con el intérprete LiteRT en CPU: PASS con coseno ≥ 0,9999 en todas las salidas. El modelo produce dos salidas (`output_0_output` y `output_1_output`), presumiblemente mapas de keypoints y puntuaciones, aunque la información no lo especifica.

## Capacidades

- Estimación de pose de cuerpo completo con 133 keypoints por persona, incluyendo cuerpo, manos y rostro (whole-body).
- Detección multi-persona en imágenes RGB (pipeline `keypoint-detection`).
- Ejecución en CPU Intel, iGPU Intel, NPU Intel AI Boost y GPU NVIDIA vía ONNX Runtime con los execution providers correspondientes.
- Exportación a formatos ligeros (ONNX, OpenVINO IR, blob NPU) aptos para despliegue en el borde.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la detección de keypoints.

## Casos de uso

- Análisis de movimiento en tiempo real en portátiles con Intel Core Ultra: usando el blob NPU o el IR en la iGPU se obtienen latencias de 8,13 ms y 4,18 ms respectivamente, adecuadas para seguimiento a más de 100 FPS en bruto, siempre que se resuelva el problema de NaN del blob NPU (por ejemplo, recompilando el IR en la máquina destino).
- Control por gestos y postura en aplicaciones de escritorio: los 133 keypoints cubren manos y rostro, lo que permite reconocer gestos finos y expresiones sin modelos adicionales, ejecutándose en CPU a 15,62 ms por inferencia.
- Telemedicina y rehabilitación: seguimiento de la postura corporal y de la movilidad de manos en sesiones grabadas o en directo sobre hardware de consumo, con la ventaja de que el modelo corre localmente y no requiere enviar vídeo a la nube.
- Deporte y biomecánica: análisis de la técnica (por ejemplo, carrera o levantamiento) extrayendo keypoints por fotograma y calculando ángulos articulares; la licencia Apache 2.0 permite integrarlo en productos comerciales.
- Animación y captura de movimiento sin marcadores: generación de esqueletos para rigging a partir de vídeo monocámara, aprovechando la salida de 133 puntos que incluye manos y cara.
- Sistemas de vigilancia y análisis de aforo: detección multi-persona con estimación de pose para análisis de ocupación o caídas, desplegable en equipos con GPU NVIDIA (7,17 ms en RTX 5080 Laptop con verificación PASS) o en CPU.
- Prototipado en dispositivos móviles Windows on ARM: el mismo ONNX se perfila en NPU Snapdragon X2 Elite a 2,15 ms (QNN precompilado) y 3,04 ms (ONNX Runtime QNN EP), lo que abre la puerta a aplicaciones de pose en portátiles ARM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, PCK, OKS) en la información disponible. Sí se documentan latencias y verificaciones de salida del autor:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 8,13 | 0,04 | FAIL: NaN en ambas salidas, coseno 0,0000, acierto argmax 0/133 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 8,67 | 3,15 | FAIL: NaN en ambas salidas, coseno 0,0000, acierto argmax 0/133 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 4,18 | 1,32 | FAIL: acierto argmax 131/133 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 6,18 | 1,21 | FAIL: acierto argmax 130/133 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 7,17 | 1,24 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 15,62 | 0,48 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 2,15 | 0,34 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 3,04 (3 capas en CPU) | 2,30 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 2,19 | 0,20 | no comparado |

Metodología: MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red), cada fila en un proceso independiente con 5 ejecuciones de calentamiento y mediana de 30 ejecuciones cronometradas (2 + 10 si la primera tarda más de 3 s), entrada y salida en numpy, ajustes por defecto. La verificación compara contra la salida de referencia en CPU con ONNX Runtime CPU EP: PASS exige coseno ≥ 0,99, ausencia de NaN/Inf y acierto argmax ≥ 0,99 en las puntuaciones de clase.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| RTMW-m-WholeBody-OpenVINO | RTMW-m whole-body | 133 | ONNX, IR, blob NPU | Apache 2.0 | Conversión para Intel; blob NPU falla verificación en la configuración probada |
| RTMW-m-WholeBody-LiteRT (litert-community) | RTMW-m whole-body | 133 | LiteRT (.tflite) | no disponible en la información | Modelo base del que deriva esta conversión |
| RTMW-m-WholeBody-ExecuTorch (mlboydaisuke) | RTMW-m whole-body | 133 | ExecuTorch | no disponible en la información | Otra conversión del mismo autor para el runtime de PyTorch |
| RTMPose / ViTPose (vía rtmlib) | Pose estimation | variable (cuerpo, mano, rostro) | ONNX y otros | no disponible en la información | Librería ligera que soporta múltiples backends (onnxruntime, openvino, tensorrt) |

No se dispone de datos de precisión comparada entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El blob NPU precompilado produce NaN en ambas salidas y falla la verificación de coseno y argmax (0/133) en la configuración medida; no debe usarse en producción sin recompilar el IR en la máquina destino y verificar la salida.
- La ruta ONNX sobre iGPU Intel y sobre GPU CUDA con copia fp16 no alcanza la verificación estricta (131/133 y 130/133 de acierto argmax), lo que sugiere pequeñas divergencias numéricas por precisión reducida.
- El blob NPU está compilado para OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841; otras versiones pueden rechazar el `import_model`, obligando a recompilar.
- No se han publicado métricas de precisión (mAP, OKS) en la información disponible, por lo que no es posible evaluar la calidad del modelo frente a alternativas.
- No se documentan sesgos del modelo; al ser un estimador de pose, puede fallar en oclusiones, poses extremas, personas de tamaño reducido o condiciones de iluminación adversas, aunque estos extremos no se cuantifican en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base LiteRT y del RTMW original antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-07): es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/RTMW-m-WholeBody-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/RTMW-m-WholeBody-LiteRT
- Repositorio de scripts y mediciones (windows-zoo): https://github.com/john-rocky/windows-zoo
- Conversión ExecuTorch del mismo autor: https://huggingface.co/mlboydaisuke/RTMW-m-WholeBody-ExecuTorch
- Librería rtmlib (PyPI): https://pypi.org/project/rtmlib/
