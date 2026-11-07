# mlboydaisuke/DehazeFormer-MCT-OpenVINO

## Resumen

DehazeFormer-MCT-OpenVINO es una conversión y empaquetado del modelo DehazeFormer-MCT (variante `dehazeformer_base`) para su ejecución sobre hardware Intel mediante OpenVINO. El autor, mlboydaisuke, parte del modelo original en formato LiteRT/TFLite publicado por litert-community y lo convierte a ONNX (opset 17, tf2onnx 1.17.0), genera un Intermediate Representation (IR) de OpenVINO con pesos fp32 y compila además un blob precompilado para la NPU integrada de Intel. El modelo resuelve la tarea de *single image dehazing*, es decir, la eliminación de niebla o bruma atmosférica de una imagen de entrada, devolviendo una imagen limpia; es un modelo image-to-image de tipo visión por computador, no un modelo de lenguaje.

La relevancia de esta ficha no reside en un nuevo modelo fundacional sino en la cadena de despliegue: demuestra cómo llevar un modelo de visión de pequeño tamaño (unos 17,5 MB en ONNX) a la NPU de un procesador Intel Core Ultra con latencias de decenas de milisegundos. El blob para NPU ocupa 339 MB porque incluye el código compilado específico del dispositivo, mientras que los pesos reales son mucho menores. La licencia MIT y la disponibilidad de scripts y metodología en un repositorio de GitHub lo hacen directamente utilizable en prototipos y productos.

Conviene subrayar que no hay información pública sobre el entrenamiento del modelo base en la documentación proporcionada: no se detallan tokens, composición del dataset ni proceso de ajuste. La model card se centra exclusivamente en la conversión, la medición de latencias y la verificación de salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DehazeFormer (vision transformer para dehazing), variante `dehazeformer_base` |
| Parametros totales | no disponible (pesos ONNX de 17.475.503 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | fp32 (IR de OpenVINO); fp16 mencionado solo para una copia ONNX usada en pruebas con CUDA; blob NPU precompilado |
| Idiomas soportados | no disponible (sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob precompilado para Intel NPU |

## Arquitectura y entrenamiento

El modelo subyacente es DehazeFormer, una familia de vision transformers diseñada específicamente para *single image dehazing*, publicada originalmente en el repositorio IDKiro/DehazeFormer. La variante empaquetada aquí es `dehazeformer_base`, la de mayor tamaño de la familia según la nomenclatura del proyecto original. La información proporcionada no incluye detalles sobre el número de capas, dimensiones de embedding, mecanismos de atención ni la composición del dataset de entrenamiento (típicamente datasets sintéticos de niebla como RESIDE en este tipo de trabajos, aunque esto no se confirma en la documentación disponible).

Lo que sí está documentado es el proceso de conversión: el modelo original en LiteRT/TFLite se convierte a ONNX con tf2onnx 1.17.0 en opset 17, y de ahí a OpenVINO IR con pesos fp32. Se genera además un blob precompilado para la NPU de Intel usando OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). La verificación de equivalencia numérica es rigurosa: la salida ONNX se compara contra la del `.tflite` original con el intérprete LiteRT en CPU, obteniendo un coseno ≥ 0,9999 en todas las salidas. Las conversiones a OpenVINO y las ejecuciones en NPU, iGPU y GPU también pasan el control con coseno ≥ 0,9999 frente a la referencia CPU fp32 de ONNX Runtime.

## Capacidades

- Dehazing de imagen individual: recibe una imagen con niebla o bruma y devuelve la imagen restaurada, en un pipeline image-to-image.
- Ejecución en NPU de Intel: el blob precompilado permite inferencia sin compilación en tiempo de carga (0,18 s de carga).
- Ejecución en iGPU Intel y en CPU: el mismo ONNX funciona en múltiples backends de OpenVINO y ONNX Runtime.
- Ejecución en GPU NVIDIA mediante el Execution Provider CUDA de ONNX Runtime.
- Compatibilidad con Qualcomm AI Hub: los mismos ficheros ONNX se han perfilado en NPU Snapdragon X2 Elite y Galaxy S26.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking ni de entrada/salida de texto.

## Casos de uso

- Restauración de imágenes de vigilancia: aplicar dehazing a fotogramas de cámaras exteriores con niebla para mejorar la visibilidad antes de pasarlos a un detector de objetos; la latencia de 96,75 ms en NPU permite procesar en tiempo casi real a baja frecuencia de fotogramas.
- Preprocesado en pipelines de visión artificial industrial: limpiar imágenes de cámaras en entornos con humo o vapor antes de la inspección automática, ejecutando el modelo en la iGPU o NPU del propio equipo industrial con Intel Core Ultra.
- Fotografía computacional en dispositivos de borde: integrar el modelo en aplicaciones de cámara o edición que corrigen fotos tomadas con niebla, aprovechando el blob NPU para evitar compilaciones en el dispositivo.
- Drones y robótica con carga Intel: mejorar la percepción en exteriores con condiciones atmosféricas adversas, donde el consumo energético de la NPU es menor que el de una GPU dedicada.
- Prototipado en portátiles con Intel AI Boost: validar algoritmos de dehazing en local sin GPU dedicada, usando el script de OpenVINO documentado en la model card.
- Evaluación comparativa de runtimes: usar el modelo como caso de prueba para medir el rendimiento de OpenVINO frente a ONNX Runtime con OpenVINO EP en NPU, iGPU y CPU, gracias a la metodología reproducible publicada.
- Despliegue móvil en Snapdragon: perfilado en Qualcomm AI Hub para estimar latencia en NPU de smartphones (125-130 ms), útil para aplicaciones Android de restauración de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de dehazing (PSNR, SSIM) en la información disponible. Los datos publicados son de latencia y verificación numérica:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 96,75 | 0,18 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 87,72 | 156,11 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 107,56 | 8,81 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | fp16 `.onnx` | 49,32 | 1,60 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 44,48 | 1,51 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 1358,44 | 0,54 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX | `.onnx` | 130,57 | 1,20 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX | `.onnx` | 125,50 | 1,02 | no comparado |

Mediciones realizadas en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con entrada y salida numpy, mediana de 30 ejecuciones tras calentamiento. La compilación del ONNX para NPU vía ONNX Runtime tarda 156 s, lo que justifica el uso del blob precompilado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Latencia documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DehazeFormer-MCT-OpenVINO (esta ficha) | Vision transformer para dehazing, empaquetado OpenVINO | no disponible (ONNX 17,5 MB) | no aplica | 96,75 ms en NPU Intel; 44,48 ms en RTX 5080 | MIT | Hugging Face, blob NPU incluido |
| DehazeFormer-MCT-LiteRT (modelo base) | Mismo modelo en LiteRT/TFLite | no disponible | no aplica | no disponible en la información | MIT | Hugging Face |
| DehazeFormer original (IDKiro) | Vision transformer para dehazing, implementación de referencia | no disponible en la información | no aplica | no disponible en la información | no disponible en la información | GitHub, demo en Hugging Face Spaces |

No se dispone de datos de rendimiento de calidad (PSNR/SSIM) ni de latencias comparables de las alternativas en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay información pública sobre sesgos del modelo base ni sobre la distribución de los datos de entrenamiento; el comportamiento fuera de condiciones de niebla típicas (niebla densa nocturna, humo, aerosoles) no está documentado.
- Riesgo de artefactos y alucinación visual: como todo modelo de restauración, puede inventar texturas o alterar colores en regiones con información irrecuperable.
- El blob NPU está compilado para una versión concreta de OpenVINO (2026.4.1) y driver NPU (32.0.100.4841); en otras versiones `import_model` puede rechazarlo, y hay que recompilar el IR.
- La carga del ONNX para NPU vía ONNX Runtime tarda 156 s en la primera compilación; en producción conviene usar el blob precompilado o cachear la compilación.
- La latencia en CPU es de 1358 ms, más de un orden de magnitud superior a la NPU; no es adecuada para tiempo real en CPU.
- No se han publicado métricas de calidad de dehazing (PSNR, SSIM) en la información disponible, por lo que no se puede avalar su rendimiento frente a otros métodos.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/DehazeFormer-MCT-OpenVINO
- Modelo base en Hugging Face: https://huggingface.co/litert-community/DehazeFormer-MCT-LiteRT
- Repositorio de scripts y metodología: https://github.com/john-rocky/windows-zoo
- Repositorio original de DehazeFormer: https://github.com/IDKiro/DehazeFormer
- Demo de DehazeFormer en Hugging Face Spaces: https://huggingface.co/spaces/IDKiro/DehazeFormer_Demo
