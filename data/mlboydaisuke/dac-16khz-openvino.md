# mlboydaisuke/DAC-16kHz-OpenVINO

## Resumen

DAC-16kHz-OpenVINO es una conversión y empaquetado del codificador y el decodificador del códec neuronal DAC (Descript Audio Codec) a 16 kHz, orientada a su ejecución sobre la NPU integrada de los procesadores Intel Core Ultra. El autor, mlboydaisuke, parte de su propio modelo DAC-16kHz-LiteRT y publica los grafos en tres formatos: ONNX (opset 17, generado con tf2onnx 1.17.0), OpenVINO IR con pesos fp32 y blobs precompilados para la NPU Intel AI Boost. El repositorio no contiene pesos de un modelo generativo de lenguaje, sino dos componentes de un códec de audio: `dac_16khz_encoder_fp16` y `dac_16khz_deconly_zs_fp16`.

El interés del paquete es práctico: permite ejecutar compresión y reconstrucción de audio en tiempo real sobre hardware de consumo x86 sin GPU dedicada. En la NPU de un Core Ultra 9 386H, el blob del decodificador tarda 59,10 ms por ejecución y el del codificador 23,91 ms, con carga de 0,07 s y 0,03 s respectivamente mediante `import_model`. Frente a la CPU del mismo equipo (578,78 ms y 79,90 ms en ONNX Runtime), la aceleración es de aproximadamente un orden de magnitud.

La licencia MIT y la disponibilidad de los grafos en ONNX y OpenVINO IR facilitan la integración en aplicaciones de escritorio, pipelines de transcodificación y prototipos de códecs neuronales. No se trata de un modelo de propósito general: no genera texto, no razona y no soporta tool calling; su función es transformar audio a una representación latente y reconstruirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal DAC (encoder convolucional + decoder con ConvTranspose1d reescritas en forma zero-stuff); grafos exportados a ONNX y OpenVINO IR |
| Parametros totales | no disponible (el tamaño de los ficheros sugiere ~105 M en el decodificador fp16 y ~43 M en el codificador fp16, cifra no confirmada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud del audio de entrada, no definida en la model card) |
| Tipos de cuantizacion | fp16 en los grafos ONNX de origen; pesos fp32 en el OpenVINO IR; blobs NPU precompilados |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blobs Intel NPU (.blob) |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura del Descript Audio Codec a 16 kHz: un codificador convolucional que proyecta la forma de onda en un espacio latente y un decodificador que la reconstruye. La modificación principal respecto al DAC original es que las `ConvTranspose1d` del decodificador se reescriben en una forma "zero-stuff" compatible con los conversores, porque la convolución transpuesta con stride 5 del DAC original no pasa la legalización del conversor y `TRANSPOSE_CONV` es rechazado por Mali. Esa adaptación, documentada en el modelo base DAC-16kHz-LiteRT, es la que permite exportar los grafos a ONNX y LiteRT sin operadores problemáticos.

No hay información en la model card sobre el dataset de entrenamiento, el número de tokens de audio, ni sobre si hubo ajuste fino con pérdidas perceptuales o adversariales. El paquete es una conversión de formato del modelo base, no un reentrenamiento: los pesos proceden de `mlboydaisuke/DAC-16kHz-LiteRT` y se han convertido con tf2onnx 1.17.0 y compilado con OpenVINO 2026.4.1. La innovación técnica destacable es la compilación anticipada de blobs para la NPU Intel AI Boost (driver 32.0.100.4841, NPU_COMPILER_VERSION 524292), que reduce el tiempo de carga a decenas de milisegundos frente a los 26,72 s y 11,22 s que tarda la compilación en el momento de crear la sesión con ONNX Runtime y el Execution Provider de OpenVINO.

## Capacidades

- Codificación de audio a representación latente a 16 kHz mediante `dac_16khz_encoder_fp16`.
- Reconstrucción de audio desde el latente mediante `dac_16khz_deconly_zs_fp16`.
- Ejecución en NPU Intel AI Boost, iGPU Intel Graphics, GPU NVIDIA vía CUDA EP y CPU x86 vía ONNX Runtime.
- Ejecución en NPU Qualcomm (Snapdragon X2 Elite, Galaxy S26) mediante los mismos ficheros ONNX compilados con Qualcomm AI Hub y el QNN EP.
- Inferencia con entrada y salida en arrays de NumPy, sin dependencias de framework de deep learning en el camino de ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No procesa visión, texto ni audio en sentido generativo (no es un modelo de texto a audio).

## Casos de uso

- Compresión de audio en aplicaciones de escritorio: el codificador puede ejecutarse en la NPU de un portátil con Core Ultra para convertir audio PCM en latentes comprimidos antes de almacenarlos o transmitirlos, con 23,91 ms por ejecución en el hardware medido.
- Reconstrucción en tiempo real de audio recibido: el decodificador a 59,10 ms por ejecución en NPU permite decodificar flujos de audio comprimidos en un portátil sin GPU dedicada, manteniendo la CPU libre para otras tareas.
- Transcoder offline por lotes: sobre la CPU del mismo equipo, el par codificador/decodificador tarda 79,90 ms y 578,78 ms respectivamente, adecuado para procesar archivos en segundo plano sin depender de aceleradores.
- Prototipado de códecs neuronales en investigación: los grafos ONNX exportados permiten comparar la salida frente al `.tflite` original (coseno ≥ 0,9999 en todas las salidas) y validar variantes de arquitectura sin reentrenar.
- Integración en pipelines de Windows con ONNX Runtime: el paquete incluye los blobs NPU y los IR de OpenVINO, de modo que una aplicación puede cargar el modelo con `import_model` en 0,03-0,07 s y evitar la compilación en tiempo de ejecución.
- Despliegue en dispositivos Qualcomm: los mismos ficheros ONNX se han perfilado en Snapdragon X2 Elite y Galaxy S26 (69,64 ms y 70,31 ms para el codificador; 155,58 ms y 150,21 ms para el decodificador), lo que permite reutilizar el artefacto en plataformas ARM.
- Evaluación comparativa de backends: el repositorio del autor incluye la tabla de los 52 grafos de LiteRT-Models, útil para decidir entre NPU, iGPU y CUDA según latencia y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de audio (PESQ, STOI, ViSQOL) en la información disponible. Los datos publicados son de latencia y verificación numérica frente a la salida de referencia en CPU fp32.

| Componente | Procesador | Runtime | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| decodificador | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 59,10 | 0,07 | PASS (cos ≥ 0,9999) |
| decodificador | Intel AI Boost NPU | ONNX Runtime + OpenVINO EP | 59,49 | 26,72 | PASS (cos ≥ 0,9999) |
| decodificador | Intel Graphics iGPU | ONNX Runtime + OpenVINO EP | 29,22 | 1,71 | FAIL (cos 0,5917) |
| decodificador | RTX 5080 Laptop (95 W) | ONNX Runtime CUDA EP, fp16 | 6,20 | 1,31 | PASS (cos ≥ 0,9999) |
| decodificador | Core Ultra 9 386H CPU | ONNX Runtime CPU EP | 578,78 | 0,61 | referencia |
| decodificador | Snapdragon X2 Elite NPU | Qualcomm AI Hub (QNN) | 155,58 | 0,52 | no comparado |
| decodificador | Galaxy S26 NPU | Qualcomm AI Hub (QNN) | 150,21 | 0,42 | no comparado |
| codificador | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 23,91 | 0,03 | PASS (cos ≥ 0,9927) |
| codificador | Intel AI Boost NPU | ONNX Runtime + OpenVINO EP | 24,37 | 11,22 | PASS (cos ≥ 0,9927) |
| codificador | Intel Graphics iGPU | ONNX Runtime + OpenVINO EP | 8,24 | 1,10 | PASS (cos ≥ 0,9930) |
| codificador | RTX 5080 Laptop (95 W) | ONNX Runtime CUDA EP, fp16 | 4,04 | 1,12 | PASS (cos ≥ 0,9929) |
| codificador | Core Ultra 9 386H CPU | ONNX Runtime CPU EP | 79,90 | 0,17 | referencia |
| codificador | Snapdragon X2 Elite NPU | Qualcomm AI Hub (QNN) | 69,64 | 0,45 | no comparado |
| codificador | Galaxy S26 NPU | Qualcomm AI Hub (QNN) | 70,31 | 0,30 | no comparado |

Mediciones realizadas en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red) entre el 6 y el 7 de noviembre de 2026, con mediana de 30 ejecuciones cronometradas tras 5 de calentamiento.

## Requisitos de hardware

- VRAM estimada: no aplica para NPU ni CPU; en GPU, el decodificador fp16 ocupa aproximadamente 210 MB y el codificador unos 86 MB, por lo que caben en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: RTX 5080 Laptop medida a 6,20 ms (decodificador) y 4,04 ms (codificador); cualquier GPU NVIDIA con soporte CUDA EP de ONNX Runtime es suficiente.
- Consumer GPU: sí, cabe en GPUs de gama baja y en iGPU Intel (con la salvedad del fallo numérico del decodificador en iGPU).
- NPU: requiere Intel Core Ultra con AI Boost y driver 32.0.100.4841 o compatible; si `import_model` rechaza el blob, hay que compilar el IR con la versión de OpenVINO instalada.
- Despliegue: OpenVINO Runtime 2026.4.1, ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, CUDA EP o CPU EP; Qualcomm AI Hub para Snapdragon.
- Latencia: 59,10 ms (decodificador) y 23,91 ms (codificador) en NPU Intel; 6,20 ms y 4,04 ms en RTX 5080 Laptop; 578,78 ms y 79,90 ms en CPU.
- Throughput: no disponible de forma agregada; puede estimarse a partir de la latencia por ejecución, pero el tamaño de bloque de audio no se especifica en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formatos | Latencia NPU Intel | Notas |
|---|---|---|---|---|---|
| DAC-16kHz-OpenVINO | códec DAC 16 kHz | MIT | ONNX, OpenVINO IR, blob NPU | 59,10 / 23,91 ms | Este modelo; blobs precompilados |
| DAC-16kHz-LiteRT | códec DAC 16 kHz | MIT | TFLite / LiteRT | no disponible | Modelo base; pensado para móvil y Mali |
| DAC original (Descript) | códec DAC | MIT (según repositorio original) | PyTorch | no disponible | Referencia académica; sin adaptación zero-stuff |
| EnCodec (Meta) | códec neuronal | CC-BY-NC 4.0 (uso no comercial) | PyTorch | no disponible | Restricción de licencia para uso comercial |

La comparación se limita a la categoría de códecs neuronales de audio; no se dispone de datos de latencia en NPU Intel para las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El decodificador falla la verificación numérica en la iGPU Intel (coseno 0,5917 frente a la referencia), por lo que no debe desplegarse en ese backend sin validación adicional.
- Los blobs NPU están compilados para OpenVINO 2026.4.1 y driver 32.0.100.4841; en otras versiones `import_model` puede rechazarlos y habrá que recompilar el IR.
- No hay datos publicados sobre calidad perceptual del audio reconstruido (PESQ, STOI, ViSQOL); la verificación se limita a similitud coseno frente a la salida de referencia.
- El modelo no genera texto ni soporta instrucciones; cualquier caso de uso que requiera razonamiento o tool calling queda fuera de su alcance.
- No se documentan sesgos ni composición del dataset de entrenamiento del modelo base, lo que impide evaluar sesgos acústicos o de dominio.
- La licencia MIT permite uso comercial, pero el usuario debe verificar la licencia del DAC original y de los datos con los que se entrenó el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del bloque de audio de entrada no se especifica; la latencia por ejecución no se traduce directamente en tiempo real sin conocer ese parámetro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/DAC-16kHz-OpenVINO
- Modelo base DAC-16kHz-LiteRT: https://huggingface.co/mlboydaisuke/DAC-16kHz-LiteRT
- Repositorio con scripts y tablas de los 52 grafos: https://github.com/john-rocky/windows-zoo
- Ficheros del modelo base (commit referenciado): https://huggingface.co/mlboydaisuke/DAC-16kHz-LiteRT/tree/376f41e9b4e68ec1ad3088946d5d648fc77a9d45
