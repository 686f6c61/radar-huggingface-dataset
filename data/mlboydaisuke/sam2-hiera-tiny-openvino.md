# mlboydaisuke/SAM2-hiera-tiny-OpenVINO

## Resumen

SAM2-hiera-tiny-OpenVINO es una conversión del modelo de segmentación de imágenes SAM 2.1 (Segment Anything 2, Meta) al formato OpenVINO IR, con artefactos adicionales en ONNX y blobs precompilados para la NPU de Intel. El modelo original emplea un backbone Hiera de tamaño "tiny" para un codificador de imagen y un decodificador de máscaras ligero; esta versión empaqueta ambos grafos por separado (sam2_encoder y sam2_decoder) para su despliegue en hardware Intel (Core Ultra con NPU AI Boost, iGPU y CPU).

El problema que resuelve es el de llevar un modelo de segmentación promptable a entornos de inferencia locales y de bajo consumo, sin depender de CUDA. El autor (mlboydaisuke) parte de su propia conversión LiteRT y genera los grafos ONNX (tf2onnx 1.17.0, opset 17), los IR de OpenVINO con pesos fp32 y los blobs compilados para NPU. El repositorio ocupa 0,5 GB y la licencia es Apache 2.0.

La relevancia es práctica: la model card documenta latencias medidas por componente en un Core Ultra 9 386H (7,97 ms para el decodificador en NPU y 1.972,66 ms para el codificador en NPU), lo que permite evaluar si el modelo encaja en un flujo de trabajo interactivo de segmentación por punto sobre imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con backbone Hiera-tiny (codificador de imagen + decodificador de máscaras), exportado como dos grafos independientes |
| Parámetros totales | no disponible (tamaños de fichero: encoder 134.201.095 bytes en ONNX, decoder 24.932.648 bytes en ONNX) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | pesos fp32 en OpenVINO IR; blobs NPU precompilados; copia fp16 del ONNX mencionada en las mediciones (no incluida en el repo) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml/.bin), blob precompilado para NPU Intel |

## Arquitectura y entrenamiento

El modelo es una adaptación de SAM 2.1 de Meta con backbone Hiera-tiny. La arquitectura se divide en dos etapas: un codificador de imagen que procesa la imagen completa una vez por imagen y un decodificador de máscaras que se ejecuta por cada punto o prompt proporcionado por el usuario. Esta separación es la que permite exportar los dos grafos de forma independiente y medir sus latencias por separado.

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. La innovación técnica destacable de esta conversión concreta es la corrección de un defecto de tf2onnx 1.17.0, que descartaba el sesgo de 6 capas FULLY_CONNECTED del decodificador; los ficheros de este repositorio se convirtieron con un parche de una línea (`convert/patch_tf2onnx.py` en el repositorio de GitHub del autor) y sus salidas coinciden con el `.tflite` de origen. Los blobs NPU se compilaron con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841.

## Capacidades

- Segmentación de imágenes promptable: dado un punto sobre una imagen, devuelve una máscara de segmentación.
- Ejecución del codificador una vez por imagen y del decodificador por cada prompt, lo que abarata el coste de múltiples puntos sobre la misma imagen.
- Despliegue en NPU Intel AI Boost, iGPU Intel Graphics y CPU, además de GPU NVIDIA vía ONNX Runtime con CUDA EP.
- Compatibilidad con OpenVINO (importación de blob precompilado o compilación del IR en la máquina destino) y con ONNX Runtime (OpenVINO EP, CUDA EP, CPU EP y QNN EP en Snapdragon).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un modelo exclusivamente de visión.

## Casos de uso

- Segmentación interactiva en aplicaciones de escritura o edición de imagen: el usuario hace clic en un punto y el decodificador (7,97 ms en NPU) devuelve la máscara, mientras el codificador se ejecuta una sola vez por imagen.
- Herramientas de anotación y etiquetado de datasets: el bajo coste por prompt permite generar máscaras preliminares que un humano revisa y corrige, acelerando el etiquetado semántico.
- Procesamiento en equipos portátiles sin GPU dedicada: al ejecutarse en la NPU de un Core Ultra, el modelo es viable en portátiles de consumo con Windows 11.
- Aplicaciones de recorte automático de objetos: integración en pipelines de preprocesado de imagen donde se necesita aislar sujetos antes de pasarlos a otro modelo.
- Análisis de imágenes médicas o industriales en local: al no requerir servicios en la nube ni GPU NVIDIA, encaja en entornos con requisitos de privacidad o de hardware restringido.
- Prototipado rápido con ONNX Runtime: el formato ONNX permite probar el modelo en distintos ejecutores (CPU EP como referencia, CUDA EP en RTX, OpenVINO EP en Intel) sin reexportar.
- Evaluación comparativa de backends en hardware Intel: el repositorio incluye mediciones por procesador y comprobaciones de salida (coseno ≥ 0,99), útiles para decidir entre blob NPU, ONNX con OpenVINO EP o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (mIoU, etc.) en la información disponible. La model card proporciona latencias medidas por componente en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11):

| Componente | Procesador / runtime | Fichero | Latencia (ms) | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| sam2_decoder | Intel AI Boost NPU, OpenVINO 2026.4.1 | blob NPU | 7,97 | 0,02 | FAIL: cos 0,1192 |
| sam2_decoder | Intel AI Boost NPU, ONNX Runtime 1.31.1 + OpenVINO EP | .onnx | 9,82 | 4,15 | PASS (cos ≥ 0,9998) |
| sam2_decoder | Intel iGPU, ONNX Runtime + OpenVINO EP | .onnx | 11,29 | 1,19 | PASS (cos ≥ 0,9999) |
| sam2_decoder | RTX 5080 Laptop, ONNX Runtime CUDA EP | fp16 | 4,58 | 1,23 | PASS (cos ≥ 0,9999) |
| sam2_decoder | RTX 5080 Laptop, ONNX Runtime CUDA EP | .onnx | 4,97 | 1,33 | PASS (cos ≥ 0,9999) |
| sam2_decoder | Core Ultra 9 386H CPU, ONNX Runtime CPU EP | .onnx | 26,88 | 0,27 | referencia |
| sam2_encoder | Intel AI Boost NPU, OpenVINO 2026.4.1 | blob NPU | 1.972,66 | 0,14 | PASS (cos ≥ 0,9999) |
| sam2_encoder | Intel AI Boost NPU, ONNX Runtime + OpenVINO EP | .onnx | 106,59 | 225,12 | PASS (cos ≥ 0,9999) |
| sam2_encoder | Intel iGPU, ONNX Runtime + OpenVINO EP | .onnx | 156,36 | 1,55 | PASS (cos ≥ 0,9999) |
| sam2_encoder | RTX 5080 Laptop, ONNX Runtime CUDA EP | fp16 | 28,01 | 1,27 | PASS (cos ≥ 0,9999) |
| sam2_encoder | RTX 5080 Laptop, ONNX Runtime CUDA EP | .onnx | 46,41 | 1,26 | PASS (cos ≥ 0,9999) |
| sam2_encoder | Core Ultra 9 386H CPU, ONNX Runtime CPU EP | .onnx | 2.200,98 | 0,33 | referencia |
| sam2_encoder | Snapdragon X2 Elite NPU, ONNX Runtime QNN EP | .onnx | 191,09 | 139,87 | no comparado (job de Qualcomm AI Hub) |

## Requisitos de hardware

- El repositorio completo ocupa 0,5 GB; el codificador ONNX son 134,2 MB y el decodificador 24,9 MB, por lo que la VRAM necesaria para inferencia es modesta (del orden de cientos de MB en fp32).
- GPU recomendadas según las mediciones: RTX 5080 Laptop (28,01 ms encoder fp16, 4,58 ms decoder fp16 con CUDA EP); no hay datos para A100 o H100 en la información disponible.
- Cabe en GPU de consumo: los datos de la RTX 5080 Laptop a 95 W lo confirman; no se aportan mediciones para GPUs de gama inferior.
- Despliegue en Intel: OpenVINO 2026.4.1 con NPU AI Boost (blob precompilado), iGPU Intel Graphics o CPU; ONNX Runtime 1.31.1 con OpenVINO EP, CUDA EP o CPU EP; Qualcomm QNN EP en Snapdragon X2 Elite.
- Latencia: decodificador entre 4,58 ms (RTX fp16) y 26,88 ms (CPU Intel); codificador entre 28,01 ms (RTX fp16) y 2.200,98 ms (CPU Intel) en el equipo medido.
- Advertencia de compatibilidad: los blobs NPU están compilados para OpenVINO 2026.4.1 y driver 32.0.100.4841; si `import_model` rechaza el blob en otra versión o driver, debe compilarse el IR en la máquina destino.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| SAM2-hiera-tiny-OpenVINO (este) | no disponible (encoder 134 MB ONNX) | no aplica | ONNX, OpenVINO IR, blob NPU Intel | Apache 2.0 | Optimizado para NPU/iGPU/CPU Intel y Windows |
| facebook/sam2-hiera-tiny | no disponible | no aplica | pesos originales (formato no detallado en la información disponible) | no disponible en la información proporcionada | Modelo base de Meta |
| mlboydaisuke/SAM2-hiera-tiny-LiteRT | no disponible | no aplica | LiteRT, ejecución en GPU vía CompiledModel API (ML Drift) | no disponible en la información proporcionada | Modelo del que deriva esta conversión |

No se dispone de datos de rendimiento comparativo (mIoU u otras métricas de calidad) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El blob NPU del decodificador falla la comprobación de salida en las mediciones del autor (coseno 0,1192 frente al umbral 0,99); para el decodificador conviene usar el ONNX con OpenVINO EP, que pasa la comprobación.
- Los blobs NPU dependen de una versión concreta de OpenVINO (2026.4.1) y de un driver Intel específico (32.0.100.4841); en otros entornos es necesario recompilar el IR.
- El codificador en NPU tarda 1.972,66 ms por ejecución, lo que limita la interactividad si se procesa una imagen nueva en cada interacción; el diseño de una ejecución del codificador por imagen mitiga parcialmente este coste.
- El modelo es exclusivamente de segmentación de imágenes: no genera texto ni tiene capacidades lingüísticas, de razonamiento o de tool calling.
- No se han publicado métricas de calidad de segmentación (mIoU, precisión de máscaras) en la información disponible; las comprobaciones documentadas son de equivalencia numérica frente al `.tflite` y a la salida de referencia en CPU fp32.
- Riesgo de sesgos y alucinaciones del modelo original de Meta: no se detalla en la información proporcionada; al ser un modelo de visión, el riesgo se traduce en máscaras incorrectas en objetos ambiguos u oclusiones.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base de Meta del que deriva la cadena de conversiones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/SAM2-hiera-tiny-OpenVINO
- Modelo base LiteRT: https://huggingface.co/mlboydaisuke/SAM2-hiera-tiny-LiteRT
- README del modelo base LiteRT: https://huggingface.co/mlboydaisuke/SAM2-hiera-tiny-LiteRT/blob/main/README.md
- Modelo original de Meta: https://huggingface.co/facebook/sam2-hiera-tiny
- Réplica en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/sam2-hiera-tiny
- Repositorio con scripts y mediciones: https://github.com/john-rocky/windows-zoo
