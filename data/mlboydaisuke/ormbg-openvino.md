# mlboydaisuke/ormbg-OpenVINO

## Resumen

ormbg-OpenVINO es una conversión del modelo de segmentación de imágenes ORMBG (Open Remove Background) al ecosistema OpenVINO, empaquetada en tres formatos: ONNX (opset 17, exportado con tf2onnx 1.17.0), OpenVINO IR con pesos fp32 y un blob precompilado para la NPU de Intel. El modelo resuelve la tarea de eliminación de fondo (background removal) y segmentación binaria de imágenes, y su relevancia radica en que permite ejecutar esta tarea en hardware Intel de bajo consumo (NPU de Core Ultra, iGPU y CPU) con latencias de decenas de milisegundos, sin depender de una GPU dedicada.

El autor de la conversión es mlboydaisuke, mientras que el modelo original ORMBG fue desarrollado por schirrmacher y posteriormente convertido a LiteRT por litert-community. Esta ficha describe la variante OpenVINO, que actúa como artefacto de despliegue optimizado a partir del modelo base `litert-community/ormbg-LiteRT`. El repositorio ocupa 0,5 GB e incluye tanto los pesos en precisión completa como el blob compilado para NPU.

Se trata de un modelo de visión por computador especializado, no de un modelo de lenguaje, por lo que no dispone de ventana de contexto, capacidades de generación de texto ni soporte multilingüe en el sentido habitual. Su valor está en la portabilidad del despliegue y en las mediciones de rendimiento publicadas sobre hardware real (Core Ultra 9 386H, RTX 5080 Laptop, Snapdragon X2 Elite y Galaxy S26).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imágenes; arquitectura interna no documentada en la información proporcionada) |
| Parametros totales | no disponible (los pesos ONNX ocupan 176.402.496 bytes en fp32, lo que sugiere del orden de 44 millones de parámetros, pero el dato no se confirma) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32 (IR y ONNX); blob NPU precompilado; existe una copia fp16 del ONNX usada solo para la medición en CUDA, no incluida en el repositorio |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`ormbg.onnx`), OpenVINO IR (`ormbg.xml` + `ormbg.bin`), blob NPU precompilado (`ormbg.blob`) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo ORMBG original ni los detalles de su entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí está documentado es la cadena de conversión: el modelo parte de `litert-community/ormbg-LiteRT`, se exporta a ONNX mediante tf2onnx 1.17.0 con opset 17, y de ahí se genera el OpenVINO IR con pesos fp32 y un blob compilado específicamente para la NPU de Intel.

La innovación técnica destacable de este artefacto no está en el modelo en sí, sino en el pipeline de despliegue. El blob NPU fue compilado con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292), lo que permite cargarlo mediante `import_model` sin recompilación en tiempo de carga (0,06 s de load frente a 63,98 s cuando se compila el ONNX al cargar la sesión con ONNX Runtime + OpenVINO EP). El autor advierte que si el blob es rechazado por una versión de driver u OpenVINO distinta, debe compilarse el IR en la máquina destino. La verificación de salidas se realizó contra la salida de referencia en CPU fp32 con ONNX Runtime, exigiendo cosine ≥ 0,99, ausencia de NaN/Inf y acuerdo top-1 ≥ 0,99 para puntuaciones de clase; todos los resultados reportados obtuvieron cosine ≥ 0,9999.

## Capacidades

- Segmentación de imágenes y eliminación de fondo (background removal), con salida verificada numéricamente frente a la referencia fp32.
- Inferencia en CPU, iGPU y NPU de Intel mediante OpenVINO, y en GPU NVIDIA mediante ONNX Runtime con CUDA EP.
- Ejecución en NPU de Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante ONNX Runtime QNN EP y Qualcomm AI Hub.
- Carga acelerada gracias al blob NPU precompilado (0,06 s de load frente a compilación en carga).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües ni modos de pensamiento, al ser un modelo de visión especializado.

## Casos de uso

- Eliminación de fondo en aplicaciones de escritorio en tiempo real: sobre la NPU de un Core Ultra 9 386H el modelo procesa una imagen en 41,37 ms, lo que permite edición interactiva de fotos sin cargar la GPU discreta y manteniendo el consumo bajo.
- Procesamiento por lotes de catálogos de producto: con 29,45 ms por imagen en la iGPU Intel, un pipeline de recorte automático de fondos para e-commerce puede procesar decenas de imágenes por segundo en un portátil estándar, sin servidor dedicado.
- Preprocesado en pipelines de visión por computador: la máscara de segmentación generada puede alimentar etapas posteriores (detección de objetos, OCR o clasificación) eliminando el fondo como ruido, con la ventaja de que el modelo corre en el mismo equipo que el resto del pipeline.
- Edición de vídeo y fotografía en movilidad: los 18,95 ms medidos en la NPU de un Galaxy S26 y los 21,16 ms en Snapdragon X2 Elite hacen viable la eliminación de fondo por fotograma en dispositivos móviles y portátiles ARM con NPU Qualcomm.
- Herramientas de privacidad y anonimización: al ejecutarse localmente en NPU/CPU sin enviar imágenes a la nube, el modelo permite eliminar fondos que puedan contener información sensible (documentos, ubicaciones) antes de compartir capturas.
- Integración en aplicaciones Windows con aceleración Intel: el blob precompilado y los scripts de ejemplo del repositorio permiten incorporar la segmentación en apps de escritorio con OpenVINO 2026.4.1, aprovechando la NPU sin recompilar el grafo en cada arranque.
- Prototipado multiplataforma: el mismo archivo ONNX sirve para CPU Intel, iGPU, NPU Intel, GPU NVIDIA y NPU Qualcomm, lo que simplifica el desarrollo de una funcionalidad de recorte que debe funcionar en varios tipos de hardware.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de latencia y verificación de salida, no benchmarks de calidad de segmentación (IoU, Dice, etc.). Se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con entrada y salida numpy, 5 ejecuciones de calentamiento y mediana de 30 ejecuciones temporizadas.

| Procesador | Runtime | Archivo | ms | Load (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 41,37 | 0,06 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 41,21 | 63,98 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 29,45 | 2,84 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | fp16 del `.onnx` | 19,76 | 1,12 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 32,22 | 1,13 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 1022,97 | 0,30 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 21,16 | 0,51 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 21,24 | 8,71 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 18,95 | 0,24 | no comparado |

La comparación del ONNX frente al `.tflite` original (intérprete LiteRT en CPU, misma entrada) dio PASS con cosine ≥ 0,9999 en todas las salidas. No se han publicado resultados de benchmarks de calidad de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 176 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer; en la RTX 5080 Laptop la copia fp16 del ONNX se midió en 19,76 ms.
- GPU recomendadas: RTX 5080 Laptop (medido, 19,76 ms en fp16 y 32,22 ms en fp32); cualquier GPU NVIDIA con soporte CUDA EP de ONNX Runtime es apta por el reducido tamaño del modelo. En Intel, la iGPU integrada del Core Ultra 9 386H alcanza 29,45 ms.
- NPU: Intel AI Boost del Core Ultra 9 386H (41,37 ms con blob, 41,21 ms con ONNX Runtime + OpenVINO EP); Qualcomm Snapdragon X2 Elite (21,16 ms) y Galaxy S26 (18,95 ms) mediante Qualcomm AI Hub.
- CPU: Core Ultra 9 386H con ONNX Runtime CPU EP tarda 1022,97 ms por ejecución, unas 25 veces más lento que la NPU; el modelo es viable en CPU solo para uso no interactivo.
- Cabe en cualquier consumer GPU y en portátiles con NPU Intel o Qualcomm; no requiere GPU dedicada para funcionar.
- Opciones de despliegue: OpenVINO 2026.4.1 (blob NPU o IR compilado), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, ONNX Runtime con CUDA EP, ONNX Runtime con QNN EP y Qualcomm AI Hub.
- Latencia y throughput: entre 18,95 y 41,37 ms por imagen en NPU (Intel y Qualcomm) y 29,45 ms en iGPU Intel; el blob precompilado reduce el tiempo de carga a 0,06 s frente a 63,98 s cuando se compila el grafo en la NPU al cargar la sesión.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de eliminación de fondo (por ejemplo, variantes de U2Net, RMBG o BiRefNet) que permitan una comparación de parámetros, contexto o calidad. La comparación posible se limita a las variantes del mismo modelo:

| Variante | Formato | Licencia | Notas |
|---|---|---|---|
| mlboydaisuke/ormbg-OpenVINO | ONNX, OpenVINO IR, blob NPU | Apache-2.0 | Objeto de esta ficha; mediciones en NPU Intel, iGPU, GPU NVIDIA y NPU Qualcomm |
| litert-community/ormbg-LiteRT | LiteRT/TFLite | Apache-2.0 | Modelo base de la conversión; verificado con cosine ≥ 0,9999 frente al ONNX |
| schirrmacher/ormbg | no disponible | no disponible | Modelo original upstream |

## Limitaciones y advertencias

- El blob NPU está compilado para OpenVINO 2026.4.1 y driver Intel NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y es necesario compilar el IR en la máquina destino.
- El tiempo de carga con ONNX Runtime + OpenVINO EP en NPU es de 63,98 s porque el grafo se compila al crear la sesión; en aplicaciones con arranque frecuente conviene usar el blob o cachear la compilación.
- El rendimiento en CPU es de 1022,97 ms por imagen, demasiado lento para uso interactivo; la CPU solo es adecuada como referencia o para procesamiento por lotes no crítico.
- Las mediciones en Snapdragon X2 Elite y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub con su propio temporizador y no fueron comparadas contra la salida de referencia, por lo que su corrección numérica no está verificada en esta información.
- La copia fp16 del ONNX usada para la medición en CUDA no está incluida en el repositorio; quien quiera reproducirla debe generarla.
- No hay datos publicados sobre sesgos, tasa de alucinación (no aplica a segmentación) ni calidad de máscara en dominios específicos; la verificación se limita a la equivalencia numérica con la referencia fp32.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo original `schirrmacher/ormbg`, cuya licencia no se detalla en la información disponible.
- El modelo está especializado en segmentación de imágenes: no sirve para generación de texto, razonamiento, código ni tareas de lenguaje, y no dispone de soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/ormbg-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/ormbg-LiteRT
- Modelo original upstream: https://huggingface.co/schirrmacher/ormbg
- Repositorio de scripts y mediciones (52 grafos de LiteRT-Models): https://github.com/john-rocky/windows-zoo
- Documentación de OpenVINO: https://docs.openvino.ai/
- Modelos OpenVINO en Hugging Face: https://huggingface.co/OpenVINO/models
