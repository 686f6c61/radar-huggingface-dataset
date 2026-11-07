# mlboydaisuke/NAFNet-GoPro-width32-OpenVINO

## Resumen

NAFNet-GoPro-width32-OpenVINO es una conversión del modelo de restauración de imagen NAFNet (versión width32 entrenada sobre el conjunto GoPro) a formatos ejecutables sobre hardware Intel: ONNX (opset 17), IR de OpenVINO con pesos fp32 y un blob precompilado para la NPU de Intel. El modelo original procede de megvii-research/NAFNet, un trabajo publicado en ECCV 2022 que propone una arquitectura de restauración de imagen sin funciones de activación no lineales. Esta conversión la publica el usuario mlboydaisuke a partir del modelo intermedio litert-community/NAFNet-GoPro-width32-LiteRT.

El interés de esta ficha no está en el modelo en sí, sino en el trabajo de despliegue: empaqueta un modelo de eliminación de desenfoque de movimiento (deblurring) para que se ejecute en la NPU integrada de los procesadores Intel Core Ultra con latencias de decenas de milisegundos. Según la model card, el blob precompilado ejecuta una inferencia en 25,21 ms en la NPU de un Core Ultra 9 386H, con una verificación de salida que alcanza coseno ≥ 0,9999 frente a la referencia en CPU.

Se trata de un modelo de imagen a imagen, no de un modelo de lenguaje: no genera texto ni razona. Su pipeline es `image-to-image` y su función concreta es restaurar imágenes borrosas o degradadas. El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (restauración de imagen sin activaciones no lineales), variante width32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 en el ONNX de origen; IR de OpenVINO con pesos fp32; blob precompilado para NPU |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml/.bin), blob de NPU de Intel |

## Arquitectura y entrenamiento

NAFNet es una red convolucional para restauración de imagen que elimina las funciones de activación no lineales (ReLU, GELU, sigmoid) del bloque básico, sustituyéndolas por operaciones simples de multiplicación y atención simplificada. La variante width32 hace referencia al ancho de los canales del modelo, y el sufijo GoPro indica que se entrenó sobre el conjunto de datos GoPro para eliminación de desenfoque de movimiento. El modelo original se describe en el repositorio megvii-research/NAFNet, con ficheros de configuración de entrenamiento para GoPro en `options/train/GoPro/NAFNet-width32.yml`.

La información disponible no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales. Lo que sí documenta la model card es la cadena de conversión: el modelo LiteRT original se convirtió a ONNX con tf2onnx 1.17.0 (opset 17), se generó un IR de OpenVINO con pesos fp32 y se compiló un blob para la NPU de Intel con OpenVINO 2026.4.1 y el driver de NPU 32.0.100.4841. La verificación de equivalencia entre el ONNX y el `.tflite` original da coseno ≥ 0,9999 en todas las salidas.

## Capacidades

- Restauración de imagen: eliminación de desenfoque de movimiento (deblurring) sobre imágenes degradadas, entrenado específicamente con el conjunto GoPro.
- Pipeline de imagen a imagen: recibe un tensor de imagen preprocesado y devuelve un tensor de imagen restaurada.
- Ejecución en NPU, iGPU y CPU de Intel mediante OpenVINO, y en GPU NVIDIA mediante ONNX Runtime con el execution provider CUDA.
- Ejecución en NPU de Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante ONNX Runtime con el EP QNN, según los perfiles de Qualcomm AI Hub.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Restauración de fotografía en aplicaciones de escritorio: el modelo puede integrarse en un editor de imágenes para corregir fotos movidas; con 25 ms por inferencia en NPU, la corrección puede aplicarse en tiempo real mientras el usuario ajusta parámetros.
- Procesado por lotes de archivos fotográficos: al ejecutarse en la iGPU o la NPU del portátil, permite limpiar colecciones grandes de imágenes sin saturar la GPU dedicada ni consumir batería de forma agresiva.
- Preprocesado en pipelines de visión por computador: restaurar imágenes borrosas antes de pasarlas a un detector o clasificador puede mejorar la calidad de la entrada en sistemas de vigilancia o inspección industrial.
- Aplicaciones móviles y de borde: el blob de NPU y los perfiles de Qualcomm AI Hub (18,33 ms en Galaxy S26, 19,06 ms en Snapdragon X2 Elite) lo hacen apto para procesar imágenes en el propio dispositivo sin enviar datos a la nube.
- Restauración de imágenes médicas o científicas: como paso previo a análisis, para reducir el desenfoque por movimiento en capturas donde no se puede repetir la toma.
- Prototipado e investigación en restauración de imagen: al estar disponible en ONNX e IR de OpenVINO, sirve como referencia para comparar implementaciones o para integrarse en frameworks de inferencia existentes.
- Sistemas de videoconferencia o captura en vivo: la latencia de decenas de milisegundos permite aplicar el modelo por fotograma en flujos de vídeo a resoluciones moderadas, siempre que el resto del pipeline lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM) en la información disponible. La model card sí incluye medidas de latencia y verificación de salida, que se reproducen a continuación.

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 25,21 | 0,04 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 26,90 | 59,11 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 29,01 | 8,25 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 49,84 | 2,30 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 26,87 | 1,48 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 639,23 | 0,52 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 19,06 | 0,41 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 36,05 | 47,94 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 18,33 | 0,23 | no comparado |

Las mediciones en el portátil se hicieron sobre un MSI Stealth 16 AI+ con Core Ultra 9 386H y RTX 5080 Laptop a 95 W, en Windows 11 build 26200.9711, con alimentación de red. Cada fila es un proceso independiente: carga, una ejecución, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento y 10 cronometradas cuando la primera ejecución supera los 3 s).

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Latencia NPU Intel | Licencia |
|---|---|---|---|---|
| NAFNet-GoPro-width32-OpenVINO | Deblurring (NAFNet width32) | ONNX, IR, blob NPU | 25,21 ms | MIT |
| litert-community/NAFNet-GoPro-width32-LiteRT | Deblurring (mismo modelo base) | LiteRT | no disponible | MIT |
| NAFNet original (megvii-research) | Deblurring (PyTorch) | PyTorch | no disponible | MIT |

No se dispone de datos de otros modelos de restauración comparables en la información proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- El blob de NPU está compilado con OpenVINO 2026.4.1 y el driver de NPU 32.0.100.4841; en otras versiones o drivers `import_model` puede rechazarlo, en cuyo caso hay que compilar el IR en la máquina destino.
- El modelo está entrenado para desenfoque de movimiento del conjunto GoPro; su rendimiento en otros tipos de degradación (ruido, compresión, desenfoque de lente) no está documentado en la información disponible.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, tool calling ni agentes, por lo que no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar la licencia del modelo original de megvii-research/NAFNet, que la model card identifica como fuente upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-07; es un artefacto reciente y sin validación comunitaria.
- Las mediciones de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon contra la salida de referencia, por lo que su fidelidad numérica no está verificada.
- El rendimiento en CPU es muy inferior (639,23 ms), por lo que el uso en producción depende de disponer de NPU o iGPU compatible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/NAFNet-GoPro-width32-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/NAFNet-GoPro-width32-LiteRT
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Repositorio original de NAFNet: https://github.com/megvii-research/NAFNet
- Configuración de entrenamiento GoPro width32: https://github.com/megvii-research/NAFNet/blob/main/options/train/GoPro/NAFNet-width32.yml
- Configuración de entrenamiento Baseline width32: https://github.com/megvii-research/NAFNet/blob/main/options/train/GoPro/Baseline-width32.yml
