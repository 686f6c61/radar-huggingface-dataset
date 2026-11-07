# mlboydaisuke/MoViNet-A0-Stream-OpenVINO

## Resumen

MoViNet-A0-Stream-OpenVINO es una conversión del modelo de clasificación de vídeo MoViNet-A0-Stream (variante "stream" de la familia MoViNets de Google Research) a formatos ONNX y OpenVINO IR, con un blob precompilado para la NPU de Intel. El autor del repositorio es mlboydaisuke y el modelo base es `litert-community/MoViNet-A0-Stream-LiteRT`. No se trata de un modelo de lenguaje, sino de una red neuronal convolucional 3D para reconocimiento de vídeo, empaquetada para su despliegue en hardware Intel (NPU, iGPU y CPU) y en GPU NVIDIA vía ONNX Runtime.

El problema que resuelve es el despliegue eficiente de clasificación de vídeo en dispositivos de borde: el repositorio proporciona los pesos ya convertidos (ONNX, OpenVINO IR en fp32 y blob para NPU), junto con mediciones de latencia en varios procesadores. En la NPU de un Core Ultra 9 386H el blob precompilado ejecuta una inferencia en 3,23 ms (entrada y salida en numpy), y mediante ONNX Runtime con el execution provider de OpenVINO en 2,32 ms.

La relevancia actual radica en la disponibilidad de artefactos listos para producción en la NPU integrada de los procesadores Intel Core Ultra, algo poco habitual en modelos de vídeo, junto con una verificación de salida documentada (comparación coseno contra la referencia en CPU). El modelo es muy pequeño (unos 15 MB en ONNX) y está pensado para tareas de clasificación de vídeo en tiempo real, no para generación de texto ni razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 3D (MoViNet-A0-Stream, con Stream Buffer; conversión a ONNX opset 17 mediante tf2onnx 1.17.0) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa secuencias de vídeo en streaming con memoria constante) |
| Tipos de cuantización | fp32 (OpenVINO IR); fp16 mencionado solo para una copia del ONNX usada en la prueba con CUDA EP; blob precompilado para NPU |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`movinet_a0_stream.onnx`), OpenVINO IR (`movinet_a0_stream.xml` + `.bin`), blob de NPU (`movinet_a0_stream.blob`) |

## Arquitectura y entrenamiento

MoViNet-A0-Stream pertenece a la familia MoViNets (Mobile Video Networks), presentada por Google Research para reconocimiento de vídeo eficiente. La arquitectura es una CNN 3D con la técnica Stream Buffer, que desacopla el uso de memoria de la duración del clip y permite procesar secuencias de vídeo en streaming de longitud arbitraria con una huella de memoria constante, tanto en entrenamiento como en inferencia. La variante "A0" es la de menor coste computacional de la familia.

Este repositorio no entrena el modelo: parte de los pesos de `litert-community/MoViNet-A0-Stream-LiteRT` y realiza una conversión de formato (TFLite a ONNX con tf2onnx 1.17.0, opset 17, y de ahí a OpenVINO IR en fp32 y a blob de NPU). No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original, el número de tokens o clips, ni sobre si se aplicó ajuste fino adicional. La verificación de fidelidad de la conversión se documenta comparando el ONNX contra el `.tflite` original con el intérprete LiteRT en CPU: coseno ≥ 0,9999 en todas las salidas.

## Capacidades

- Clasificación de vídeo: el pipeline declarado es `video-classification`; produce puntuaciones de clase a partir de entradas de vídeo.
- Procesamiento de vídeo en streaming: gracias al Stream Buffer, puede procesar secuencias de duración arbitraria con memoria constante.
- Inferencia en NPU de Intel: incluye blob precompilado para la NPU Intel AI Boost (OpenVINO 2026.4.1, driver 32.0.100.4841).
- Ejecución en CPU Intel, iGPU Intel y GPU NVIDIA mediante ONNX Runtime (CPU EP, OpenVINO EP y CUDA EP).
- Exportación a múltiples formatos: ONNX, OpenVINO IR y blob de NPU.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multilingües: no es un modelo de lenguaje.

## Casos de uso

- Clasificación de vídeo en tiempo real en equipos de sobremesa y portátiles con Intel Core Ultra: usando el blob de NPU se obtiene una inferencia de 3,23 ms, adecuada para procesar flujos de cámara a alta frecuencia de muestreo sin ocupar la CPU.
- Análisis de vídeo en el borde (edge computing): el tamaño reducido del ONNX (unos 15 MB) y la ejecución en NPU integrada permiten desplegar clasificación de vídeo en dispositivos sin GPU dedicada.
- Monitorización de flujos de cámara de seguridad: el Stream Buffer permite procesar secuencias continuas de duración arbitraria con memoria constante, lo que encaja con vigilancia 24/7.
- Prototipado e integración en pipelines ONNX: al estar disponible el ONNX con verificación de equivalencia frente al TFLite original, se puede integrar en aplicaciones existentes basadas en ONNX Runtime con distintos execution providers.
- Evaluación comparativa de hardware: el repositorio incluye mediciones en NPU Intel, iGPU Intel, CPU Intel, RTX 5080 Laptop y NPU Snapdragon (vía Qualcomm AI Hub), útil para decidir la plataforma de despliegue.
- Clasificación de contenido en aplicaciones de escritorio Windows: el autor documenta el flujo en Windows 11 con OpenVINO y ONNX Runtime, lo que facilita integrarlo en aplicaciones nativas.
- Filtrado previo en pipelines de vídeo más pesados: usar el modelo como etapa rápida de clasificación antes de modelos de vídeo de mayor coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a este tipo de modelo. Sí se documentan mediciones de latencia y verificación de salida:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 3,23 | 0,01 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 2,32 | 1,81 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 10,21 | 2,45 | FAIL (cos entre 0,1238 y 0,5257 en varias salidas) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 6,97 | 1,19 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 6,33 | 1,16 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 3,49 | 0,11 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 1,29 | 0,37 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 1,14 | 2,04 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 1,11 | 0,16 | no comparado |

Mediciones realizadas en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con mediana de 30 ejecuciones temporizadas tras calentamiento. La verificación PASS exige coseno ≥ 0,99, ausencia de NaN/Inf y coincidencia top-1 ≥ 0,99.

## Requisitos de hardware

- VRAM/RAM estimada: el ONNX ocupa 15.243.826 bytes (unos 15 MB); el IR de OpenVINO unos 16 MB (1.105.346 bytes el `.xml` y 14.974.864 bytes el `.bin`); el blob de NPU 12.055.168 bytes (unos 12 MB). Requisitos de memoria muy bajos.
- NPU Intel: requiere OpenVINO 2026.4.1 y driver de NPU 32.0.100.4841 para importar el blob precompilado; en otra versión de driver u OpenVINO hay que compilar el IR en la máquina destino.
- GPU recomendadas: RTX 5080 Laptop (medido); cualquier GPU NVIDIA compatible con CUDA EP de ONNX Runtime debería funcionar, aunque no se documentan mediciones en otras.
- Consumer GPU: sí, cabe en cualquier GPU de consumo por tamaño; los datos medidos son de una RTX 5080 Laptop a 95 W.
- Opciones de despliegue: OpenVINO (Python, `import_model` o `compile_model`), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 o CUDA EP; también Qualcomm AI Hub con QNN EP para Snapdragon.
- Latencia y throughput: 3,23 ms por inferencia en NPU Intel con blob precompilado y 2,32 ms con ONNX Runtime + OpenVINO EP; 3,49 ms en CPU Core Ultra 9 386H; 6,33 ms en RTX 5080 Laptop. En Snapdragon X2 Elite NPU y Galaxy S26 NPU, 1,29 ms, 1,14 ms y 1,11 ms respectivamente (mediciones de Qualcomm AI Hub, no comparadas contra referencia).

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Contexto/entrada | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| MoViNet-A0-Stream-OpenVINO (este) | ONNX, OpenVINO IR, blob NPU | Apache-2.0 | vídeo en streaming, memoria constante | 3,23 ms en NPU Intel (blob) | Hugging Face, repo del autor |
| litert-community/MoViNet-A0-Stream-LiteRT | LiteRT/TFLite | no disponible en la información | vídeo en streaming | no disponible | Hugging Face |
| kfkas/movinet-a0-stream-pytorch | PyTorch | no disponible en la información | vídeo en streaming | no disponible | Hugging Face |

No se dispone de datos de benchmarks de precisión ni de latencias comparables para las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento entre ellas no está disponible.

## Limitaciones y advertencias

- Es un modelo de clasificación de vídeo, no un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- La verificación de salida en la iGPU Intel falló (coseno entre 0,1238 y 0,5257 en varias salidas), por lo que no se recomienda su uso en ese execution provider sin validación adicional.
- El blob de NPU está compilado para una versión concreta de OpenVINO (2026.4.1) y de driver de NPU (32.0.100.4841); en otras versiones puede rechazarse la importación y hay que recompilar el IR.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; las limitaciones de precisión de clasificación dependen del modelo base y no se detallan en la información disponible.
- No se especifican los parámetros totales ni el dataset de entrenamiento original; la información sobre el modelo base es limitada.
- Las mediciones en Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon contra la salida de referencia, por lo que su fidelidad numérica no está verificada.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base (`litert-community/MoViNet-A0-Stream-LiteRT`) y de los pesos originales de MoViNets antes de un despliegue en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlboydaisuke/MoViNet-A0-Stream-OpenVINO
- Modelo base: https://huggingface.co/litert-community/MoViNet-A0-Stream-LiteRT/tree/a21743c58801227b8265f47b136cb096fe22989d
- Scripts y mediciones del autor: https://github.com/john-rocky/windows-zoo
- Alternativa en PyTorch: https://huggingface.co/kfkas/movinet-a0-stream-pytorch
- Paper de MoViNets (Google Research): https://research.google/pubs/movinets-mobile-video-networks-for-efficient-video-recognition/
