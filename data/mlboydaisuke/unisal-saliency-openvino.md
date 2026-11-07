# mlboydaisuke/UniSal-Saliency-OpenVINO

## Resumen

UniSal-Saliency-OpenVINO es una conversión y empaquetado del modelo de segmentación de saliencia UniSal (Unified Image and Video Saliency Modeling, Droste et al., ECCV 2020) para su ejecución en hardware Intel mediante OpenVINO. El autor del repositorio, mlboydaisuke, parte del modelo ya cuantizado litert-community/UniSal-Saliency-LiteRT y genera tres artefactos: un grafo ONNX (opset 17, exportado con tf2onnx 1.17.0), un modelo intermedio de OpenVINO (IR) con pesos fp32 y un blob precompilado para la NPU integrada de Intel (Intel AI Boost).

El modelo resuelve la predicción de mapas de saliencia, es decir, la estimación de qué regiones de una imagen atraen la atención visual humana, tarea útil para recorte automático, generación de miniaturas, evaluación de composición visual y preprocesado en pipelines de visión. Su relevancia actual no reside en la calidad del modelo (es un trabajo de 2020) sino en el empaquetado para inferencia de baja latencia en aceleradores de consumo: el blob para NPU ejecuta una inferencia completa en 8,62 ms en un Core Ultra 9 386H con una comprobación de salida que alcanza coseno ≥ 0,9999 frente a la referencia en CPU fp32.

El repositorio es pequeño (0,0 GB declarados, con el ONNX de 12,88 MB como fichero principal) y se distribuye bajo licencia Apache-2.0. No incluye pesos en formato safetensors ni GGUF: el formato de despliegue es ONNX, OpenVINO IR y blob de NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de segmentación de saliencia (UniSal, Droste et al., ECCV 2020); topología exacta no disponible en la información proporcionada |
| Parametros totales | no disponible (el ONNX ocupa 12.878.090 bytes, aproximadamente 12,3 MB en fp16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen; formas de entrada no especificadas en la información disponible) |
| Tipos de cuantizacion | fp16 en el ONNX de origen; IR de OpenVINO con pesos fp32; blob precompilado para NPU Intel |
| Idiomas soportados | no aplica (modelo de visión sin componente de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob de NPU (.blob); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su origen: UniSal, presentado en el paper "Unified Image and Video Saliency Modeling" (Droste, Jiao y Noble, ECCV 2020). Se trata de un modelo de segmentación de imagen que predice mapas de saliencia, exportado aquí desde el modelo LiteRT litert-community/UniSal-Saliency-LiteRT mediante tf2onnx 1.17.0 a opset 17. No se dispone de datos sobre el número de tokens de entrenamiento (no aplica), la composición del dataset, ni si hubo ajuste por refuerzo o preferencias; el repositorio no documenta el proceso de entrenamiento original.

La innovación técnica de este repositorio es el empaquetado para inferencia: se ofrece un blob precompilado con OpenVINO 2026.4.1 y el driver de NPU Intel 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292), lo que elimina el tiempo de compilación en carga (0,01 s frente a 1,42 s compilando el ONNX con el EP de OpenVINO). El autor verifica la equivalencia funcional del ONNX frente al .tflite original (intérprete LiteRT en CPU) con coseno ≥ 0,9999 en todas las salidas, y de cada ejecución acelerada frente a la referencia en CPU fp32 con coseno ≥ 0,9999 y ausencia de NaN o Inf.

## Capacidades

- Segmentación de saliencia de imagen: genera mapas de saliencia a partir de una imagen de entrada preprocesada en float32.
- Inferencia en aceleradores Intel: soporte para NPU (Intel AI Boost), iGPU (Intel Graphics) y CPU mediante OpenVINO y el EP de OpenVINO en ONNX Runtime.
- Ejecución en GPU NVIDIA mediante ONNX Runtime con CUDA EP (probado en RTX 5080 Laptop).
- Ejecución en NPU de Qualcomm (Snapdragon X2 Elite y Galaxy S26) mediante QNN EP, perfilada a través de Qualcomm AI Hub.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No dispone de modo de razonamiento explícito (thinking mode), visión multimodal ni audio.

## Casos de uso

- Recorte automático y generación de miniaturas: el mapa de saliencia permite identificar la región de interés de una fotografía para recortes inteligentes; con 8,62 ms por inferencia en NPU, se pueden procesar lotes de imágenes en tiempo real en un portátil.
- Preprocesado en pipelines de visión por computador: usar la saliencia como máscara de atención para guiar detectores o modelos de segmentación posteriores, reduciendo el área de búsqueda.
- Evaluación de composición visual en herramientas de diseño: puntuar automáticamente dónde mira el usuario en un mockup o una creatividad publicitaria, con despliegue local en el portátil del diseñador gracias al blob de NPU.
- Indexación y etiquetado de bibliotecas de imágenes: extraer regiones salientes para generar metadatos o crops de entrenamiento en un servidor con CPU Intel, sin GPU dedicada.
- Aplicaciones de accesibilidad y seguimiento de mirada aproximado: estimar la atención visual sobre capturas de pantalla o documentos para resaltar zonas relevantes en herramientas de lectura.
- Procesado en el borde (edge) en dispositivos con NPU Intel o Qualcomm: el modelo cabe en 12,3 MB y se ejecuta en 19,29-20,15 ms en la NPU de un Galaxy S26 o Snapdragon X2 Elite, lo que permite integrarlo en aplicaciones móviles o de escritorio sin conexión.
- Filtrado previo en sistemas de videovigilancia o análisis de vídeo: aunque el modelo se distribuye para imagen, su origen UniSal cubre también vídeo; el mapa de saliencia puede priorizar fotogramas o regiones antes de un análisis más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (métricas de saliencia como AUC, SIM o CC) en la información disponible. Los únicos datos numéricos son de latencia y verificación de salida, medidos por el autor:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob de NPU (`import_model`) | 8,62 | 0,01 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 8,64 | 1,42 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,60 | 1,00 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 2,50 | 1,18 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 2,78 | 1,28 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 5,98 | 0,11 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 19,48 | 0,35 | no comparado |
| Snapdragon X2 Elite NPU | ONNX Runtime QNN EP | `.onnx` | 20,15 (1 capa en CPU) | 1,08 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 19,29 | 0,16 | no comparado |

Las mediciones se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con corriente), con una mediana de 30 ejecuciones cronometradas tras 5 de calentamiento, entrada y salida en numpy. Las filas de Snapdragon corresponden a trabajos de perfilado de Qualcomm AI Hub del 30 de octubre de 2026.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de otros modelos de saliencia (por ejemplo, BASNet, U-2-Net o SALICON) que permitan una comparación cuantitativa. La comparación disponible es de despliegue frente al modelo de origen:

| Modelo | Formato | Licencia | Latencia en NPU Intel | Notas |
|---|---|---|---|---|
| UniSal-Saliency-OpenVINO | ONNX, IR, blob NPU | Apache-2.0 | 8,62 ms (blob) | Empaquetado específico para Intel; verificado frente a CPU fp32 |
| UniSal-Saliency-LiteRT (origen) | LiteRT (.tflite) | Apache-2.0 | no disponible | Modelo base del que se exporta; verificado con coseno ≥ 0,9999 |
| UniSal original (rdroste/unisal) | PyTorch | no disponible | no disponible | Implementación de referencia del paper ECCV 2020 |

## Limitaciones y advertencias

- El blob de NPU es dependiente de versión: se compiló con OpenVINO 2026.4.1 y el driver Intel 32.0.100.4841; si `import_model` lo rechaza en otra versión o driver, hay que compilar el IR en la máquina destino, lo que añade tiempo de carga.
- El modelo es una conversión de un modelo de 2020; no se han publicado métricas de calidad (AUC, SIM, CC) en este repositorio, por lo que la fidelidad respecto al original solo está verificada numéricamente (coseno), no en términos de utilidad perceptual.
- Riesgo de sesgo: los modelos de saliencia aprenden de datos de atención humana y pueden reproducir sesgos de los sujetos anotadores (por ejemplo, hacia rostros o centros de imagen); no se documenta la composición del dataset original.
- No es un modelo generativo: no hay riesgo de alucinación textual, pero los mapas de saliencia pueden ser poco fiables en imágenes fuera de dominio o con iluminación atípica.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base litert-community/UniSal-Saliency-LiteRT y del trabajo original de UniSal antes de redistribuir derivados.
- El repositorio declara 0 descargas y 0 likes, y no incluye documentación sobre el preprocesado exacto de la imagen de entrada (normalización, resolución); las formas de entrada deben consultarse en `compiled.inputs` o en `sess.get_inputs()`.
- Las latencias de Snapdragon no se compararon contra la referencia de CPU, por lo que su corrección numérica no está verificada en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/UniSal-Saliency-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/UniSal-Saliency-LiteRT/tree/a699e0f86da9adc73d2fbf210a673870bfef8b72
- Scripts y tabla de los 52 grafos de LiteRT-Models: https://github.com/john-rocky/windows-zoo
- Implementación original de UniSal: https://github.com/rdroste/unisal
- Implementación alternativa en PyTorch: https://github.com/Ttibo/Unisal
- Paper de referencia: Richard Droste, Jianbo Jiao y J. Alison Noble, "Unified Image and Video Saliency Modeling", ECCV 2020 (enlace directo no disponible en la información proporcionada)
