# mlboydaisuke/DIS-ISNet-OpenVINO

## Resumen

DIS-ISNet-OpenVINO es una conversión del modelo de segmentación de imágenes DIS-ISNet (procedente de la familia LiteRT-Models) a formatos optimizados para la inferencia en hardware Intel: ONNX, OpenVINO IR con pesos fp32 y un blob NPU precompilado. El autor, mlboydaisuke, parte del modelo base `litert-community/DIS-ISNet-LiteRT` y lo exporta mediante tf2onnx 1.17.0 (opset 17) para que pueda ejecutarse en las NPU Intel AI Boost, GPUs integradas y CPUs de las plataformas Core Ultra, así como en GPUs dedicadas mediante ONNX Runtime con el execution provider CUDA.

El interés de esta ficha no está en el modelo de segmentación en sí, sino en el paquete de artefactos y en las mediciones de latencia publicadas: un blob NPU precompilado que se importa sin compilación en tiempo de carga (41,77 ms por inferencia) y una tabla comparativa de rendimiento entre NPU, iGPU, GPU dedicada y CPU sobre el mismo archivo ONNX. El repositorio ocupa 0,5 GB y la licencia es Apache-2.0, heredada del modelo base.

Se trata de un artefacto de despliegue, no de un modelo generativo: la tarea es segmentación de imágenes (pipeline `image-segmentation`) y no dispone de parámetros de lenguaje, contexto ni capacidades conversacionales. Los datos de arquitectura interna del segmentador no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación de imágenes DIS-ISNet (detalle interno no disponible); exportada como grafo ONNX (opset 17) y OpenVINO IR |
| Parametros totales | no disponible (el modelo base es de tipo "Lite"; el archivo ONNX pesa 176.368.980 bytes en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (ONNX e IR); blob NPU precompilado (110.022.785 bytes); existe una variante int8 en el repositorio hermano ExecuTorch, no incluida aquí |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`dis.onnx`), OpenVINO IR (`openvino/dis.xml` + `dis.bin`), blob NPU precompilado (`npu/dis.blob`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de DIS-ISNet ni los datos con los que fue entrenado. Lo que sí está documentado es la cadena de conversión: el modelo original en formato LiteRT (`.tflite`) se exportó a ONNX con tf2onnx 1.17.0 en opset 17, y de ahí se generó el OpenVINO IR con pesos fp32 y un blob compilado para la NPU Intel. La verificación de equivalencia numérica entre el `.tflite` original y el `.onnx` exportado dio PASS con cosine ≥ 0,9999 en todas las salidas, lo que confirma que la conversión no degrada el resultado.

El blob NPU se compiló con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). Es importante tener en cuenta que un blob precompilado está ligado a esa versión de OpenVINO y a ese driver: si `import_model` lo rechaza en otra combinación, la alternativa documentada es compilar el IR en la máquina destino con `core.compile_model("openvino/dis.xml", "NPU")`.

## Capacidades

- Segmentación de imágenes: el pipeline declarado es `image-segmentation`; produce mapas de segmentación a partir de una imagen de entrada preprocesada a float32.
- Inferencia en NPU Intel: ejecución nativa en Intel AI Boost mediante OpenVINO (`import_model` del blob) o mediante ONNX Runtime con el OpenVINO EP.
- Inferencia en iGPU Intel y en CPU: el mismo archivo ONNX funciona en Intel Graphics (iGPU) y en la CPU del Core Ultra 9 386H con ONNX Runtime.
- Inferencia en GPU dedicada: el `.onnx` corre en ONNX Runtime con CUDA EP; también existe una copia fp16 (no incluida en el repo) que reduce la latencia.
- Compatibilidad con hardware Qualcomm: los mismos archivos ONNX se perfilan en NPU Snapdragon X2 Elite y Galaxy S26 mediante Qualcomm AI Hub (con QNN).
- Portabilidad de artefactos: el repositorio hermano `DIS-ISNet-ExecuTorch` ofrece variantes `.pte` fp32 e int8 para XNNPACK.
- No dispone de generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Segmentación en tiempo real en portátiles con Core Ultra: usar el blob NPU precompilado para obtener inferencias de ~41,77 ms sin coste de compilación en carga, adecuado para aplicaciones interactivas de edición de imagen o vídeo.
- Procesamiento por lotes en CPU de escritorio: con 1040,20 ms por inferencia en la CPU del Core Ultra 9 386H, encaja en pipelines offline donde prima el throughput agregado sobre la latencia individual.
- Visión embebida en iGPU Intel: 30,17 ms por inferencia en Intel Graphics con ONNX Runtime + OpenVINO EP, útil cuando la NPU está ocupada por otra carga o no está disponible.
- Aceleración en GPU dedicada: 20,54 ms con la copia fp16 del ONNX en una RTX 5080 Laptop a 95 W, para estaciones de trabajo con GPU NVIDIA que quieran reutilizar el mismo grafo.
- Despliegue en dispositivos Snapdragon: los mismos archivos ONNX perfilados en NPU Snapdragon X2 Elite (21,52–21,53 ms) y Galaxy S26 (19,17 ms) permiten llevar la segmentación a portátiles ARM y móviles con Qualcomm AI Hub.
- Evaluación comparativa de runtimes: la tabla publicada (NPU, iGPU, CUDA, CPU, QNN) sirve como referencia para decidir el execution provider en una aplicación de segmentación ya existente.
- Integración en aplicaciones de captura o escaneo: segmentación de documentos, recortes de sujeto o máscaras de fondo con latencias sub-50 ms en NPU, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Latencia medida por el autor (entrada numpy a salida numpy, mediana de 30 ejecuciones tras 5 de calentamiento; proceso único; equipo MSI Stealth 16 AI+ con Core Ultra 9 386H y RTX 5080 Laptop a 95 W, Windows 11):

| Procesador | Runtime | Archivo | ms | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob `npu/` (`import_model`) | 41,77 | 0,06 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` (compila al cargar) | 40,92 | 60,40 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 30,17 | 2,94 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no en el repo) | 20,54 | 1,13 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 32,05 | 1,14 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 1040,20 | 0,30 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 21,53 | 0,37 | no comparado (perfil AI Hub, 2026-10-30) |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` (compila al cargar) | 21,52 | 9,28 | no comparado (perfil AI Hub, 2026-10-30) |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 19,17 | 0,26 | no comparado (perfil AI Hub, 2026-10-30) |

No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, Dice, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ONNX fp32 pesa 176 MB y el blob NPU 110 MB; en GPU dedicada con CUDA EP la huella de pesos ronda los 176 MB en fp32 y aproximadamente la mitad en la copia fp16.
- GPU recomendadas: RTX 5080 Laptop (medido a 95 W, 20,54 ms con fp16); GPUs NVIDIA compatibles con CUDA EP de ONNX Runtime en general.
- Hardware Intel: NPU Intel AI Boost (Core Ultra), iGPU Intel Graphics y CPU Core Ultra; el blob está compilado para OpenVINO 2026.4.1 y driver NPU 32.0.100.4841.
- Hardware Qualcomm: NPU Snapdragon X2 Elite y Galaxy S26 vía Qualcomm AI Hub con QNN.
- ¿Cabe en GPU de consumo? Sí: con ~176 MB de pesos en fp32 es trivial para cualquier GPU de consumo moderna; la latencia depende del execution provider, no de la memoria.
- Opciones de despliegue: OpenVINO (blob precompilado o IR), ONNX Runtime con OpenVINO EP, ONNX Runtime con CUDA EP, ONNX Runtime con CPU EP, Qualcomm AI Hub (QNN), y ExecuTorch/XNNPACK mediante el repositorio hermano.
- Latencia: 19,17–41,77 ms en aceleradores (NPU Intel, NPU Qualcomm, iGPU, GPU NVIDIA); 1040,20 ms en CPU. Carga: 0,06 s con blob precompilado frente a 60,40 s cuando ONNX Runtime compila para la NPU al crear la sesión.

## Comparativa con modelos similares

| Modelo | Formato | Acelerador | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DIS-ISNet-OpenVINO (este) | ONNX, OpenVINO IR, blob NPU | NPU Intel / iGPU / CUDA / CPU | 41,77 ms (NPU Intel); 20,54 ms (RTX 5080 fp16); 1040,20 ms (CPU) | Apache-2.0 | Hugging Face |
| DIS-ISNet-ExecuTorch | `.pte` fp32 e int8 (XNNPACK) | CPU/ARM | 123,4 ms (Mac arm64, referencia relativa; eager fp32: 364,6 ms) | Apache-2.0 (según modelo base) | Hugging Face |
| DIS-ISNet-LiteRT (modelo base) | `.tflite` | LiteRT (CPU) | no disponible | Apache-2.0 | Hugging Face |

La comparativa de calidad de segmentación frente a otros modelos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El blob NPU está atado a OpenVINO 2026.4.1 y al driver Intel NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y habrá que recompilar el IR.
- La compilación para NPU en tiempo de carga con ONNX Runtime + OpenVINO EP tarda 60,40 s, lo que penaliza arranques en frío; el blob precompilado evita ese coste.
- Las filas de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub con su propio temporizador y no se compararon contra la salida de referencia, por lo que no son estrictamente equivalentes a las mediciones Intel/NVIDIA.
- Las latencias se midieron en un único equipo (MSI Stealth 16 AI+ con Core Ultra 9 386H y RTX 5080 Laptop a 95 W, Windows 11); no son extrapolables a otros sistemas sin medir.
- La copia fp16 del ONNX usada para el resultado de 20,54 ms no está incluida en el repositorio.
- No hay información sobre sesgos, tasas de error de segmentación ni dominios de entrenamiento; no se puede evaluar la robustez del modelo fuera de los datos de validación del autor.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `litert-community/DIS-ISNet-LiteRT` antes de redistribuir derivados.
- El repositorio tiene 0 descargas y 0 likes, y no hay datos de benchmarks de calidad: es un artefacto de despliegue reciente, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/DIS-ISNet-OpenVINO
- Modelo base: https://huggingface.co/litert-community/DIS-ISNet-LiteRT/tree/1b966dbe2f33bd5ca1299cf94fbab59265210b6b
- Repositorio hermano ExecuTorch: https://huggingface.co/mlboydaisuke/DIS-ISNet-ExecuTorch
- Scripts, registros y tabla de los 52 grafos de LiteRT-Models: https://github.com/john-rocky/windows-zoo
