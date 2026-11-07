# mlboydaisuke/Ultra-Fast-Lane-Detection-OpenVINO

## Resumen

Ultra-Fast-Lane-Detection-OpenVINO es una conversión del modelo Ultra-Fast-Lane-Detection (UFLD) al ecosistema Intel, publicada por el usuario mlboydaisuke. Parte del modelo base litert-community/Ultra-Fast-Lane-Detection-LiteRT y lo redistribuye en tres formatos: ONNX (exportado con tf2onnx 1.17.0, opset 17), OpenVINO IR con pesos fp32 y un blob NPU precompilado para aceleradores Intel. Se trata de un modelo de segmentación de carril para conducción autónoma, no de un modelo de lenguaje.

El interés de esta publicación no está en el modelo en sí, sino en el empaquetado y las mediciones de rendimiento asociadas: sobre la NPU de un Core Ultra 9 386H el blob se ejecuta en 4,10 ms por inferencia (entrada y salida numpy), y sobre la iGPU Intel el ONNX alcanza 3,84 ms con ONNX Runtime y el Execution Provider de OpenVINO. Estos datos permiten evaluar el despliegue de un modelo de visión en hardware Intel de consumo sin GPU dedicada.

La relevancia es acotada pero práctica: sirve como referencia reproducible para pipelines de inferencia en NPU integrada (Intel AI Boost) en Windows, con verificación de salida frente a la CPU en fp32. El repositorio ocupa 0,4 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión Ultra-Fast-Lane-Detection, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | fp32 (IR y ONNX); blob NPU precompilado con formato propio de OpenVINO |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob NPU precompilado, TFLite en el modelo base |

| Parametro adicional | Valor |
|---|---|
| Pipeline | image-segmentation |
| Tarea | detección de carril en imágenes de carretera |
| Entrada y salida | numpy a numpy (float32) |
| Tamano del repositorio | 0,4 GB |
| Toolchain de conversion | tf2onnx 1.17.0, OpenVINO 2026.4.1 |
| Runtime NPU | Intel NPU driver 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292) |
| Checksums | `ufld.onnx`: 178.141.391 bytes, sha256 `860ec2b2...`; `npu/ufld.blob`: 90.300.545 bytes, sha256 `2386ed52...` |

## Arquitectura y entrenamiento

No se proporcionan detalles de la arquitectura interna en la información disponible. El modelo base (litert-community/Ultra-Fast-Lane-Detection-LiteRT) remite a Ultra-Fast-Lane-Detection, un método de detección de carril presentado en el paper "Ultra Fast Structure-aware Deep Lane Detection" y ampliado en TPAMI 2022 y en su versión V2, que formula la detección como una clasificación ordinal con anchors híbridos sobre filas de la imagen en lugar de una segmentación pixel a pixel. Esta ficha no puede confirmar la configuración exacta de capas, número de parámetros ni el dataset de entrenamiento original, por lo que esos datos se marcan como no disponibles.

Lo que sí documenta el autor es la cadena de conversión y validación: exportación de TFLite a ONNX, generación del IR de OpenVINO con pesos fp32 y compilación de un blob para la NPU. La verificación de equivalencia numérica se realizó comparando cada salida contra la salida de la CPU en fp32 con ONNX Runtime; el ONNX frente al `.tflite` original obtiene un coseno ≥ 0,9999 en todas las salidas. No se menciona entrenamiento adicional, ajuste fino ni cuantización más allá de los formatos de despliegue descritos.

## Capacidades

- Detección de carriles en imágenes de carretera, etiquetada como segmentación de imagen en el pipeline de Hugging Face.
- Inferencia sobre imagen completa con entrada y salida en arrays numpy float32; las formas exactas se obtienen de los metadatos del modelo compilado.
- Ejecución en NPU Intel AI Boost mediante blob precompilado, con carga en 0,05 s sin compilación en tiempo de carga.
- Ejecución alternativa en iGPU Intel, CPU Intel y GPU NVIDIA a través de ONNX Runtime con los Execution Providers correspondientes.
- Compatibilidad con el Execution Provider de OpenVINO dentro de ONNX Runtime, lo que permite seleccionar el dispositivo (NPU, GPU, CPU) por sesión.
- Salidas deterministas verificadas frente a la referencia en CPU (coseno ≥ 0,9999, sin NaN ni Inf, acuerdo top-1 ≥ 0,99 en puntuaciones de clase).
- No dispone de capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multilingüismo.

## Casos de uso

- Asistencia a la conducción en vehículo o prototipo: el modelo procesa fotogramas de cámara frontal y devuelve la geometría de los carriles; con 4,10 ms por inferencia en NPU de un Core Ultra permite sostener tasas superiores a 60 fps en el subsistema de visión.
- Sistemas de retención de carril en tiempo real sobre portátiles o mini-PC con Intel Core Ultra: al ejecutarse en la NPU integrada, libera la CPU y la GPU para otras tareas del pipeline (detección de objetos, planificación).
- Validación de modelos en laboratorio: el blob precompilado y el IR permiten comparar el mismo modelo entre NPU, iGPU y CPU con una única fuente de verdad, útil para caracterizar el hardware antes de fijar la plataforma de despliegue.
- Desarrollo con ONNX Runtime: al disponer del `.onnx`, se puede integrar en aplicaciones existentes basadas en ONNX Runtime añadiendo el Execution Provider de OpenVINO y seleccionando el dispositivo por sesión, sin reescribir el pipeline.
- Pruebas de robustez del modelo base: el ONNX exportado y su verificación frente al `.tflite` permiten auditar la fidelidad de la conversión antes de sustituir el modelo LiteRT original en producción.
- Docencia e investigación en percepción vial: el repositorio incluye scripts, registros y mediciones comparables sobre 52 grafos del zoo de LiteRT, lo que facilita reproducir experimentos de latencia en hardware Intel.
- Benchmark de aceleradores: las mediciones con el mismo archivo ONNX en NPU Intel, iGPU Intel, RTX 5080 Laptop y Snapdragon X2 Elite permiten comparar latencias entre plataformas con una metodología documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (tipo F1, IoU o exactitud de detección de carril) en la información disponible. Los datos publicados son de latencia y verificación numérica:

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | `npu/` | 4,10 | 0,05 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OV EP 1.8.1 | `.onnx` | 4,34 | 1,63 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OV EP 1.8.1 | `.onnx` | 3,84 | 1,90 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | fp16 del `.onnx` | 2,14 | 1,09 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` fp32 | 2,47 | 1,19 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 16,49 | 0,27 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 2,59 | 0,35 | no comparado |
| Snapdragon X2 Elite NPU | ONNX Runtime QNN EP | `.onnx` | 2,64 | 2,77 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 2,60 | 0,28 | no comparado |

Metodología: una ejecución de carga, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 + 10 si la primera tarda más de 3 s), entrada y salida numpy, cada proceso iniciado tras dejar inactivos CPU, RTX e iGPU. Equipo de medida: MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W y Windows 11 build 26200.9711. Las filas Snapdragon provienen de trabajos de perfilado de Qualcomm AI Hub con su propio cronómetro, no comparables directamente en verificación de salida.

## Requisitos de hardware

- VRAM/RAM: el ONNX ocupa unos 178 MB y el blob NPU unos 90 MB; el IR suma 178 MB en fp32. La memoria de trabajo en inferencia es reducida y no se publica una cifra exacta.
- NPU recomendada: Intel AI Boost integrada en Core Ultra (medido en Core Ultra 9 386H). El blob requiere OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; con otra versión, recompilar el IR.
- iGPU: Intel Graphics integrada, con 3,84 ms por inferencia mediante ONNX Runtime + OpenVINO EP.
- GPU dedicada: RTX 5080 Laptop limitada a 95 W logra 2,14 ms en fp16 y 2,47 ms en fp32, ambos por debajo de la NPU en latencia.
- CPU: Core Ultra 9 386H en CPU EP tarda 16,49 ms; es la referencia de corrección, no la ruta más rápida.
- Cabe en cualquier equipo con CPU moderna; no requiere GPU dedicada para funcionar, y en portátiles sin NPU la iGPU es la opción más rápida medida.
- Despliegue: OpenVINO (Python, `core.compile_model` o `core.import_model` para el blob), ONNX Runtime 1.31.1 con Execution Provider de OpenVINO 1.8.1, o el runtime propio de Qualcomm AI Hub para Snapdragon. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput: a 4,10 ms por inferencia en NPU, el límite teórico es de unas 244 inferencias por segundo en un solo hilo de ejecución; en iGPU, unas 260 por segundo.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Latencia publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ultra-Fast-Lane-Detection-OpenVINO (este) | Detección de carril | ONNX, IR, blob NPU | 4,10 ms en NPU Intel; 16,49 ms en CPU | MIT | Hugging Face |
| litert-community/Ultra-Fast-Lane-Detection-LiteRT | Detección de carril | TFLite | no disponible en la información | no disponible | Hugging Face |
| Ultra-Fast-Lane-Detection (cfzd) | Detección de carril | PyTorch | no disponible en la información | no disponible | GitHub |
| Ultra-Fast-Lane-Detection-V2 (cfzd) | Detección de carril | PyTorch | no disponible en la información | no disponible | GitHub |

La comparación relevante es de empaquetado: frente al modelo LiteRT original y a las implementaciones PyTorch, esta versión aporta formatos listos para OpenVINO, un blob precompilado para NPU Intel y una tabla de latencias reproducibles. No se dispone de datos de precisión para comparar la calidad de detección entre variantes.

## Limitaciones y advertencias

- No es un modelo generativo: no procesa texto, no tiene contexto conversacional y no admite tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- No se publican métricas de precisión (IoU, F1, exactitud por carril) ni detalles del dataset de entrenamiento, por lo que no es posible evaluar su calidad de detección a partir de esta ficha.
- El blob NPU está compilado para OpenVINO 2026.4.1 y el driver 32.0.100.4841; si `import_model` lo rechaza en otra versión o driver, hay que recompilar el IR, lo que añade tiempo de carga en el primer uso.
- Las latencias se midieron en un único equipo (Core Ultra 9 386H, Windows 11) y pueden no reproducirse en otras configuraciones, especialmente en NPUs de generaciones anteriores.
- Las filas de Snapdragon provienen de trabajos de perfilado de Qualcomm AI Hub sin verificación de salida frente a la referencia, por lo que su equivalencia numérica no está confirmada.
- No se documentan sesgos, riesgos de alucinación ni comportamiento en condiciones adversas (lluvia, noche, oclusión), que son relevantes en un modelo de percepción vial.
- La licencia MIT permite uso comercial, pero el autor no detalla las condiciones del modelo base más allá de heredar su licencia; conviene revisar la ficha de litert-community/Ultra-Fast-Lane-Detection-LiteRT antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y una única revisión del autor; no hay validación independiente de las mediciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Ultra-Fast-Lane-Detection-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/Ultra-Fast-Lane-Detection-LiteRT
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Ultra-Fast-Lane-Detection (PyTorch): https://github.com/cfzd/Ultra-Fast-Lane-Detection
- Ultra-Fast-Lane-Detection-V2 (PyTorch): https://github.com/cfzd/Ultra-Fast-Lane-Detection-v2
