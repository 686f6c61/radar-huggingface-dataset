# mlboydaisuke/DewarpNet-OpenVINO

## Resumen

DewarpNet-OpenVINO es una conversión del modelo DewarpNet al ecosistema OpenVINO, publicada por el usuario mlboydaisuke. DewarpNet es una red de corrección de distorsiones geométricas en imágenes de documentos (dewarping), es decir, reconstruye la superficie plana de una página fotografiada con curvatura, plegados o perspectiva, y produce una versión rectificada. Este repositorio no entrena un modelo nuevo: parte de la versión LiteRT (litert-community/DewarpNet-LiteRT) y la exporta a ONNX (tf2onnx 1.17.0, opset 17), a formato IR de OpenVINO con pesos fp32 y a un blob precompilado para la NPU de Intel.

La relevancia del artefacto es de despliegue: permite ejecutar el dewarping en hardware Intel (NPU AI Boost, iGPU y CPU) con latencias muy bajas. Según la model card, en la NPU de un Core Ultra 9 386H el blob precompilado ejecuta una inferencia en 8,24 ms de entrada numpy a salida numpy, y en la iGPU Intel el ONNX tarda 9,07 ms con el OpenVINO Execution Provider de ONNX Runtime. El repositorio ocupa 0,4 GB y se distribuye con licencia MIT.

No se trata de un modelo de lenguaje: el pipeline declarado es image-to-image y no hay información sobre arquitectura interna, número de parámetros ni idiomas. La ficha refleja únicamente los datos de conversión, rendimiento y ficheros publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de dewarping image-to-image; arquitectura interna no documentada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | pesos fp32 en el IR de OpenVINO; blob precompilado para NPU Intel; el ONNX se distribuye en precisión original (el autor menciona una copia fp16 no incluida en el repo) |
| Idiomas soportados | no disponible (no aplica a un modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`dewarp.xml` + `dewarp.bin`), blob NPU precompilado (`dewarp.blob`) |
| Modelo base | litert-community/DewarpNet-LiteRT (relación: quantized) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | image-to-image |

Ficheros publicados:

| Fichero | Bytes | SHA-256 |
|---|---|---|
| `dewarp.onnx` | 189.339.174 | `4dde2be5fa86a4b4b1dd870b0ba89dc5da6e2165b90992c13a96450935eb04c2` |
| `openvino/dewarp.xml` | 1.139.702 | `36060c9fd58b3fec9df7c95314892385f25240e9956a8005a05d2af914188e75` |
| `openvino/dewarp.bin` | 188.529.172 | `840b093d86a174c4694c0ff3a37a5270576bac67e4c2b4ff9737a279929f89bd` |
| `npu/dewarp.blob` | 19.378.305 | `345b2e8bb9239bf6df1e91a2ca8bad42ff83906e29087b755459cb61c9b669f3` |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna de DewarpNet (capas, tipo de red, mecanismo de predicción de la malla de deformación o del mapa de flujo), ni sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si se aplicó algún tipo de ajuste posterior. El autor solo documenta el proceso de conversión: exportación del modelo LiteRT a ONNX con tf2onnx 1.17.0 y opset 17, generación del IR de OpenVINO con pesos fp32 y compilación de un blob para la NPU Intel.

La innovación técnica del repositorio es de infraestructura de despliegue, no de modelado: un blob precompilado que evita la compilación en tiempo de carga (`import_model` en lugar de `compile_model`), con compilación realizada con OpenVINO 2026.4.1 y driver NPU Intel 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). El autor advierte que el blob puede ser rechazado en otras versiones de driver u OpenVINO, en cuyo caso hay que compilar el IR en la máquina destino. La verificación de salidas se hizo comparando contra la salida fp32 del Execution Provider de CPU de ONNX Runtime, con criterio de coseno ≥ 0,99, ausencia de NaN/Inf y coincidencia top-1 ≥ 0,99 para puntuaciones de clase.

## Capacidades

- Dewarping de imágenes de documentos: rectificación de páginas curvadas, con plegados o capturadas en perspectiva, con salida image-to-image.
- Ejecución en NPU Intel AI Boost mediante blob precompilado, con latencia de 8,24 ms por inferencia en un Core Ultra 9 386H.
- Ejecución en iGPU Intel y en CPU Intel mediante ONNX Runtime con OpenVINO Execution Provider.
- Ejecución en GPU NVIDIA mediante ONNX Runtime con CUDA Execution Provider (8,53 ms con el ONNX fp32 y 6,74 ms con una copia fp16 en una RTX 5080 Laptop a 95 W).
- Compatibilidad con el formato ONNX estándar, lo que permite usarlo en otros runtimes (por ejemplo, Qualcomm AI Hub lo perfiló en NPU Snapdragon).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking; es un modelo especializado de una sola tarea.

## Casos de uso

- Digitalización de documentos con escáner móvil: el modelo rectifica páginas fotografiadas con curvatura antes de pasarlas a OCR, lo que reduce errores de reconocimiento en líneas deformadas; sus 8,24 ms por imagen en NPU permiten procesar lotes en tiempo real en un portátil.
- Preprocesado en pipelines de OCR a gran escala: al ejecutarse en CPU Intel a 201,36 ms por imagen o en iGPU a 9,07 ms, se puede integrar como etapa previa en servidores sin GPU dedicada.
- Aplicaciones de captura en dispositivo (edge): el blob de 19,4 MB para NPU cabe en equipos con Core Ultra y evita enviar imágenes a la nube, lo que resulta adecuado para documentos sensibles.
- Escaneo de libros y archivos históricos: la corrección de curvatura de lomos y páginas es el caso clásico de DewarpNet; el modelo se puede encadenar con un detector de bordes y un recortador.
- Automatización de facturas y formularios: rectificar la imagen antes de la extracción de campos mejora la alineación de las regiones de interés en pipelines de procesamiento documental.
- Prototipado multiplataforma: al estar en ONNX, el mismo fichero se puede desplegar en Windows con OpenVINO, en GPU NVIDIA con CUDA EP y en dispositivos Snapdragon vía QNN, lo que simplifica la validación en distintos entornos.
- Verificación de calidad en digitalización masiva: usar la diferencia entre la imagen corregida y la original como señal para detectar páginas mal capturadas antes del archivado.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red), con entrada y salida numpy, ajustes por defecto y mediana de 30 ejecuciones cronometradas tras 5 de calentamiento:

| Procesador | Runtime | Fichero | ms | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| NPU Intel AI Boost | OpenVINO 2026.4.1 | blob `npu/` (`import_model`) | 8,24 | 0,01 | PASS (cos ≥ 0,9999) |
| NPU Intel AI Boost | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | no ejecutado | no ejecutado | no ejecutado |
| iGPU Intel Graphics | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 9,07 | 1,74 | FAIL: cos 0,9891 < 0,99 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no incluida) | 6,74 | 1,51 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 8,53 | 1,47 | PASS (cos ≥ 0,9999) |
| CPU Core Ultra 9 386H | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 201,36 | 0,65 | referencia |
| NPU Snapdragon X2 Elite | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 5,04 | 0,34 | no comparado (perfil del 2026-10-30) |
| NPU Snapdragon X2 Elite | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 24,36 (19 capas en CPU) | 6,26 | no comparado (perfil del 2026-10-30) |
| NPU Galaxy S26 | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 4,76 | 0,23 | no comparado (perfil del 2026-10-30) |

El ONNX comparado contra el `.tflite` original (intérprete LiteRT en CPU, misma entrada) obtuvo PASS con coseno ≥ 0,9999 en todas las salidas. No se han publicado resultados de benchmarks de calidad de dewarping (métricas como MS-SSIM, ED o CER tras OCR) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ONNX fp32 ocupa 189,3 MB y el IR fp32 188,5 MB, por lo que la huella de pesos es inferior a 200 MB; la memoria de activaciones no está documentada.
- GPU recomendadas: RTX 5080 Laptop funcionó a 8,53 ms (fp32) y 6,74 ms (fp16); no hay datos de A100, H100 ni RTX 4090 en la información disponible.
- Consumer GPU: sí cabe con holgura en cualquier GPU consumer actual por tamaño de pesos; el rendimiento medido corresponde a una RTX 5080 Laptop a 95 W.
- NPU Intel: blob precompilado de 19,4 MB, 8,24 ms por ejecución en Core Ultra 9 386H; requiere OpenVINO 2026.4.1 y driver NPU 32.0.100.4841 para `import_model`, o compilar el IR en destino.
- iGPU Intel: 9,07 ms con ONNX Runtime + OpenVINO EP, aunque la comprobación de salida no alcanzó el umbral de coseno 0,99 (0,9891) en esa ruta.
- CPU Intel: 201,36 ms con el CPU EP de ONNX Runtime, la referencia de corrección.
- Opciones de despliegue: OpenVINO (Python, `import_model` o `compile_model`), ONNX Runtime con Execution Providers OpenVINO, CUDA y QNN; Qualcomm AI Hub para dispositivos Snapdragon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Throughput: no medido de forma explícita; a partir de la latencia por inferencia, la NPU Intel permite del orden de 120 imágenes por segundo en régimen ideal y la CPU en torno a 5 imágenes por segundo.
- Limitación conocida: ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 no carga `dewarp.onnx` en la NPU (fallo de compilación); para NPU hay que usar OpenVINO directamente.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Contexto / tarea | Rendimiento documentado | Disponibilidad |
|---|---|---|---|---|---|
| DewarpNet-OpenVINO (este) | ONNX, OpenVINO IR, blob NPU | MIT | Dewarping image-to-image | 8,24 ms en NPU Intel; 201,36 ms en CPU Intel | Hugging Face, 0 descargas, 0 likes |
| litert-community/DewarpNet-LiteRT (base) | LiteRT / TFLite | MIT | Dewarping image-to-image | No disponible en la información proporcionada | Hugging Face |
| Modelos del Open Model Zoo de OpenVINO | IR de OpenVINO | Apache 2.0 (según la documentación del zoo) | Visión general (más de 200 modelos) | No disponible | Repositorio Open Model Zoo |

No se dispone de datos de otros modelos de dewarping comparables (parámetros, contexto, benchmarks de calidad) en la información proporcionada.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo; al ser un modelo de rectificación de imágenes, el riesgo principal es la distorsión residual o la introducción de artefactos en la imagen corregida, no sesgos sociales.
- Riesgo de alucinación en el sentido de reconstrucción incorrecta de contenido: el dewarping puede deformar texto o geometría en casos extremos (curvaturas muy fuertes, oclusiones, iluminación deficiente); no se documentan métricas de calidad para cuantificarlo.
- La ruta de iGPU Intel no superó el umbral de fidelidad del autor (coseno 0,9891 frente a 0,99); conviene validar la salida antes de usarla en producción en ese backend.
- El blob NPU está atado a OpenVINO 2026.4.1 y al driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y hay que compilar el IR.
- ONNX Runtime con OpenVINO EP no ejecuta el modelo en la NPU (fallo de compilación); la ruta soportada en NPU es OpenVINO nativo.
- La copia fp16 del ONNX usada para la medición en RTX 5080 no está incluida en el repositorio.
- Licencia MIT: permite uso comercial y modificación con atribución; se hereda de litert-community/DewarpNet-LiteRT.
- No se documentan idiomas ni dominio de aplicación restringido; la utilidad está limitada a imágenes de documentos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/DewarpNet-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/DewarpNet-LiteRT/tree/dfc68e3e462a6eb7eb8c4dbbff4049e3bd3cc9e3
- Repositorio con scripts y mediciones (52 grafos de LiteRT-Models): https://github.com/john-rocky/windows-zoo
- OpenVINO en Hugging Face: https://huggingface.co/OpenVINO/models
- Documentación del Model Zoo de OpenVINO: https://docs.openvino.ai/2023.3/model_zoo.html
