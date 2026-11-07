# mlboydaisuke/CPGA-Net-LowLight-OpenVINO

## Resumen

CPGA-Net-LowLight-OpenVINO es una conversión y empaquetado del modelo CPGA-Net-LowLight (una red ligera de mejora de imágenes con poca luz) para su ejecución en hardware Intel mediante OpenVINO. El autor del repositorio, mlboydaisuke, parte del modelo `cpga_fp16` publicado por litert-community en formato LiteRT y lo exporta a ONNX (tf2onnx 1.17.0, opset 17), a OpenVINO IR con pesos fp32 y a un blob precompilado para la NPU de Intel. El modelo original procede de la implementación PyTorch de Shyandram, asociada a un artículo aceptado en IJPRAI titulado "A Lightweight Low-Light Image Enhancement Network via Channel Prior and Gamma Correction".

El problema que resuelve es la mejora de imágenes capturadas con iluminación escasa (low-light image enhancement), una tarea de image-to-image en la que la red corrige exposición y color a partir de una imagen oscura. Se trata de un modelo muy pequeño (el ONNX ocupa unos 170 KB y el IR unos 410 KB en total), pensado para inferencia en el borde: NPU, iGPU y CPU de equipos Intel, así como NPU de Qualcomm Snapdragon. Su relevancia actual radica en que demuestra el despliegue de una red de restauración de imagen en aceleradores de bajo consumo con latencias de milisegundos.

La ficha se centra en el artefacto OpenVINO, no en el modelo de investigación original: no se dispone de información sobre el dataset de entrenamiento, el número de parámetros exacto ni los resultados de benchmarks de calidad de imagen en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CPGA-Net (red convolucional ligera de mejora de imagen con poca luz, basada en channel prior y gamma correction); el artefacto es una conversión ONNX/OpenVINO IR de la variante fp16 del modelo LiteRT |
| Parámetros totales | no disponible (el ONNX fp16 ocupa 169.836 bytes; el IR fp32 suma 410.140 bytes entre .xml y .bin) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión image-to-image) |
| Tipos de cuantización | fp16 (ONNX de origen), fp32 (pesos del OpenVINO IR); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob precompilado para NPU Intel; modelo base en LiteRT (.tflite) |

## Arquitectura y entrenamiento

CPGA-Net es una red convolucional ligera para mejora de imágenes con poca luz. Según el título del artículo asociado (IJPRAI), la arquitectura se apoya en un channel prior y en corrección gamma para estimar la iluminación y corregir la exposición de la imagen de entrada. El repositorio de origen es la implementación en PyTorch de Shyandram (`Shyandram/CPGA-Net-Pytorch`). No se dispone en la información proporcionada de detalles sobre el número de capas, los bloques concretos, el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste fino o destilación.

El artefacto de este repositorio no es un modelo entrenado desde cero, sino una conversión de cadena: el `cpga_fp16` de `litert-community/CPGA-Net-LowLight-LiteRT` se exporta a ONNX con tf2onnx 1.17.0 (opset 17), se convierte a OpenVINO IR con pesos fp32 y se compila a un blob para la NPU de Intel con OpenVINO 2026.4.1, driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). La verificación de salida compara el ONNX contra el `.tflite` original en el intérprete LiteRT sobre CPU: cosine ≥ 0.9999 en todas las salidas.

## Capacidades

- Mejora de imágenes con poca luz (image-to-image): recibe una imagen oscura y devuelve una versión corregida en exposición e iluminación.
- Corrección de exposición basada en channel prior y gamma correction, según la descripción del artículo de origen.
- Inferencia en aceleradores Intel: NPU (AI Boost), iGPU y CPU mediante OpenVINO y el Execution Provider de OpenVINO para ONNX Runtime.
- Ejecución en NPU de Qualcomm Snapdragon mediante QNN (según los perfiles de Qualcomm AI Hub reportados).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y de una sola pasada.
- No dispone de capacidades multilingües ni de modo thinking.

## Casos de uso

- Preprocesado en cámaras y dispositivos de captura: aplicar la red a fotogramas oscuros antes de tareas posteriores (detección, OCR) para mejorar el contraste y la exposición con latencias de milisegundos en la NPU del dispositivo.
- Mejora en tiempo real en videollamadas o streaming desde portátiles Intel: al ejecutarse en la iGPU o NPU en 5-7 ms por pasada, puede integrarse en un pipeline de vídeo sin cargar la GPU discreta.
- Fotografía computacional en móviles con Snapdragon: los perfiles de Qualcomm AI Hub (3,78-4,02 ms en NPU) indican viabilidad para procesar imágenes en el propio terminal antes de guardarlas o subirlas.
- Restauración de imágenes en aplicaciones de edición offline: el modelo es tan pequeño (menos de 1 MB en todos los formatos) que puede distribuirse embebido en una aplicación de escritorio o móvil sin dependencias pesadas.
- Visión artificial en el borde para vigilancia o automoción: el artículo de origen menciona la corrección de exposición en escenas de conducción (IEEE ICCE-TW), por lo que encaja en preprocesado de cámaras de vehículo o sistemas de vigilancia con poca luz.
- Prototipado y evaluación de despliegue en NPU: sirve como caso de referencia para medir el rendimiento de OpenVINO 2026.4.1 y del EP de OpenVINO en ONNX Runtime sobre hardware Intel, comparando blob precompilado frente a compilación en carga.
- Procesado por lotes en CPU en servidores sin GPU: con 10,27 ms por ejecución en un Core Ultra 9 386H, es adecuado para tareas de mejora de imágenes en lote donde no se dispone de acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) en la información disponible. Sí se documentan medidas de latencia y verificación de salida del artefacto OpenVINO:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 5,54 | 0,00 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 5,27 | 1,07 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 7,04 | 0,37 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 3,09 | 1,07 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 2,72 | 1,11 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 10,27 | 0,02 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 3,79 | 0,36 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` compilado al cargar | 4,02 | 2,12 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 3,78 | 0,14 | no comparado |

Las mediciones se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con alimentación de red) el 2026-11-07. Cada fila es un proceso independiente: carga, una ejecución, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento y 10 cronometradas cuando la primera ejecución supera los 3 s), de entrada numpy a salida numpy. La verificación compara cada salida con la salida fp32 en CPU (ONNX Runtime CPU EP): PASS si cosine ≥ 0,99, sin NaN ni Inf, y coincidencia top-1 ≥ 0,99 en puntuaciones de clase.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de otros modelos de mejora de imagen con poca luz (por ejemplo, RetinexNet, Zero-DCE o KinD) para establecer una comparativa cuantitativa. La comparación posible se limita a los formatos del mismo modelo:

| Artefacto | Tamaño | Acelerador | Latencia | Licencia |
|---|---|---|---|---|
| CPGA-Net-LowLight-OpenVINO (blob NPU) | 794.753 bytes | Intel AI Boost NPU | 5,54 ms | MIT |
| CPGA-Net-LowLight-OpenVINO (IR fp32) | 410.140 bytes (.xml + .bin) | Intel NPU/iGPU/CPU | 5,27-10,27 ms | MIT |
| CPGA-Net-LowLight-OpenVINO (ONNX fp16) | 169.836 bytes | CPU, CUDA, QNN | 2,72-10,27 ms | MIT |
| Modelo base CPGA-Net-LowLight-LiteRT | no disponible | LiteRT | no disponible | MIT |

## Limitaciones y advertencias

- Es un modelo de mejora de imagen de propósito específico: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de image-to-image no es válido.
- No se han publicado en la información disponible métricas de calidad de imagen (PSNR, SSIM), por lo que no es posible cuantificar la fidelidad de la mejora frente a la imagen de referencia.
- El blob de la NPU está compilado para OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841; con otras versiones `import_model` puede rechazarlo y es necesario recompilar el IR en la máquina destino.
- Los resultados de Snapdragon proceden de trabajos de perfilado de Qualcomm AI Hub y no se compararon con la salida de referencia, por lo que su corrección numérica no está verificada en esta información.
- No se documentan sesgos, comportamiento en dominios distintos al de entrenamiento ni robustez ante ruido, artefactos de compresión o imágenes con fuentes de luz mixtas.
- La licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base y la del repositorio PyTorch de origen antes de redistribuir derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que la metadata de Hugging Face no refleja el contenido real; conviene verificar los ficheros antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/CPGA-Net-LowLight-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/CPGA-Net-LowLight-LiteRT
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Implementación PyTorch original: https://github.com/Shyandram/CPGA-Net-Pytorch
- README del repositorio original: https://github.com/Shyandram/CPGA-Net-Pytorch/blob/main/README.md
