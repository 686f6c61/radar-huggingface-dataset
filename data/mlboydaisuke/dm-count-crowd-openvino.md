# mlboydaisuke/DM-Count-Crowd-OpenVINO

## Resumen

DM-Count-Crowd-OpenVINO es una conversión del modelo de conteo de multitudes DM-Count (Distribution Matching for Crowd Counting, NeurIPS 2020) al ecosistema Intel: ONNX, OpenVINO IR con pesos fp32 y un blob precompilado para la NPU de Intel. El autor, mlboydaisuke, parte de la versión LiteRT publicada por litert-community (DM-Count-Crowd-LiteRT) y la exporta mediante tf2onnx 1.17.0 con opset 17, generando artefactos listos para ejecutarse en NPU, iGPU y CPU de Intel, además de servir como referencia para otras plataformas.

El modelo resuelve una tarea concreta de visión por computador: estimar el número de personas en una imagen a partir de un mapa de densidad, sin detección individual de personas. Es relevante porque permite inferencia de muy baja latencia en hardware de consumo: 15,72 ms por ejecución en la NPU de un Core Ultra 9 386H y 6,86 ms en una RTX 5080 Laptop con pesos fp16, lo que habilita conteo de multitudes en tiempo real en portátiles.

La ficha se centra en los artefactos publicados y en las mediciones aportadas por el autor. No se dispone de información sobre el dataset de entrenamiento original, el número de parámetros ni la longitud de contexto (no aplica a un modelo de visión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para estimacion de densidad (DM-Count, NeurIPS 2020); topologia exacta no disponible |
| Parametros totales | no disponible (el ONNX fp32 ocupa 86.040.413 bytes, aproximadamente 21,5 M de parametros en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | fp32 (OpenVINO IR y ONNX); blob NPU precompilado; copia fp16 del ONNX usada en la medicion con CUDA (no incluida en el repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin) y blob de NPU precompilado (.blob) |

## Arquitectura y entrenamiento

El modelo subyacente es DM-Count, presentado en NeurIPS 2020 por cvlab-stonybrook. DM-Count aborda el conteo de multitudes mediante estimación de mapas de densidad y una función de pérdida basada en Optimal Transport (OT) que mide la similitud entre el mapa de densidad predicho normalizado y el de referencia normalizado; para estabilizar el cálculo de OT se añade una pérdida de Total Variation. La arquitectura concreta de la red (backbone, capas, resolución de entrada) no se detalla en la información disponible.

El repositorio publicado no incluye información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si hubo ajuste adicional. La conversión técnica sí está documentada: exportación de la versión LiteRT a ONNX con tf2onnx 1.17.0 (opset 17), generación del IR de OpenVINO con pesos fp32 y compilación de un blob para NPU con OpenVINO 2026.4.1, driver Intel NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). El blob solo es importable en versiones de driver y OpenVINO compatibles; en caso contrario debe compilarse el IR en la máquina destino.

## Capacidades

- Estimación de conteo de personas en imágenes mediante mapa de densidad (pipeline image-to-image).
- Inferencia en NPU, iGPU y CPU de Intel a través de OpenVINO y de ONNX Runtime con el Execution Provider de OpenVINO.
- Ejecución en GPU NVIDIA mediante ONNX Runtime con CUDA EP (verificado con fp32 y fp16).
- Artefacto portable a otras plataformas: el ONNX se ha perfilado también en NPU de Qualcomm (Snapdragon X2 Elite y Galaxy S26) a través de Qualcomm AI Hub.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto; es un modelo puramente visual.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión general, audio).

## Casos de uso

- Aforo en tiempo real en recintos: desplegar el blob en la NPU de un portátil o mini-PC con Core Ultra para estimar ocupación a partir del flujo de una cámara; los 15,72 ms por ejecución permiten decenas de inferencias por segundo sin ocupar la CPU.
- Control de aforo en transporte público: procesar fotogramas de cámaras de andén o vagón en la iGPU o NPU de un equipo empotrado, con la salvedad de que la ruta iGPU mostró un fallo de validación numérica en las mediciones del autor.
- Análisis de eventos y estadísticas de asistencia: ejecutar el modelo por lotes sobre grabaciones para generar series temporales de conteo, usando la CPU como referencia de fp32 cuando la precisión sea prioritaria.
- Investigación en visión por computador: emplear el ONNX como referencia reproducible para comparar implementaciones de DM-Count entre LiteRT, OpenVINO, ONNX Runtime y QNN, gracias a los checks de coseno y a los hashes publicados.
- Prototipado en movilidad: usar el ONNX con Qualcomm AI Hub para perfilar en NPU de Snapdragon (11,38-11,42 ms en X2 Elite, 8,87 ms en Galaxy S26) antes de decidir el hardware final.
- Monitorización de densidad en espacios comerciales: estimar la ocupación por zonas a partir de cámaras fijas y activar alertas cuando el mapa de densidad supere umbrales, con inferencia local que evita enviar vídeo a la nube.
- Validación de pipelines de conversión: servir como caso de prueba para verificar que una cadena tf2onnx → OpenVINO produce salidas equivalentes (coseno ≥ 0,9999 frente al .tflite original).

## Benchmarks y rendimiento

Mediciones del autor en MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con entrada y salida numpy, mediana de 30 ejecuciones tras calentamiento:

| Procesador | Runtime | Archivo | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 15,72 | 0,03 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 15,84 | 10,05 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 13,99 | 0,45 | FAIL (cos 0,0255) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 6,86 | 1,20 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 11,65 | 1,12 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 551,65 | 0,13 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 11,42 | 0,36 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 11,38 | 1,51 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 8,87 | 0,18 | no comparado |

No se han publicado resultados de benchmarks de precisión (MAE, MSE, MMLU, HumanEval u otros) en la información disponible. La única validación numérica es la equivalencia de salidas frente a la CPU en fp32 y frente al `.tflite` original.

## Requisitos de hardware

- VRAM/RAM: el ONNX fp32 ocupa unos 86 MB y el blob NPU unos 45,8 MB; la huella en memoria es inferior a 1 GB en cualquier ruta.
- NPU Intel: requiere OpenVINO 2026.4.1 y driver NPU 32.0.100.4841 para importar el blob; con otro driver debe compilarse el IR (`core.compile_model("openvino/dmcount.xml", "NPU")`).
- GPU NVIDIA: verificada con RTX 5080 Laptop a 95 W; cualquier GPU con soporte CUDA EP de ONNX Runtime 1.31.1 debería funcionar, aunque no se aportan mediciones de otras tarjetas.
- iGPU Intel: la ruta con OpenVINO EP produjo una salida incorrecta (coseno 0,0255) en las pruebas del autor; no se recomienda para producción sin revalidar.
- CPU: funciona como referencia fp32, pero con 551,65 ms por ejecución no es apta para tiempo real.
- Despliegue: OpenVINO (Python, `import_model` o `compile_model`), ONNX Runtime 1.31.1 con `onnxruntime-ep-openvino` 1.8.1, ONNX Runtime con CUDA EP y Qualcomm AI Hub para Snapdragon.
- Throughput estimado: aproximadamente 63 inferencias/s en NPU Intel y 146 inferencias/s en RTX 5080 Laptop con fp16, según las latencias medidas.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Latencia medida | Verificación numérica |
|---|---|---|---|---|
| DM-Count-Crowd-OpenVINO (este) | ONNX, OpenVINO IR, blob NPU | MIT | 15,72 ms (NPU Intel); 6,86 ms (RTX 5080 fp16) | PASS frente a CPU fp32 |
| litert-community/DM-Count-Crowd-LiteRT (modelo base) | LiteRT (.tflite) | MIT | no disponible | referencia del ONNX (cos ≥ 0,9999) |
| DM-Count original (cvlab-stonybrook) | PyTorch | no disponible en la información | no disponible | no disponible |

No se dispone de datos de benchmarks de precisión que permitan comparar la calidad de conteo (MAE/MSE) con alternativas como CSRNet, BayLoss o modelos de detección de personas. La comparación se limita a formato, licencia y latencia.

## Limitaciones y advertencias

- El blob NPU está atado a OpenVINO 2026.4.1 y al driver 32.0.100.4841; en otros entornos hay que recompilar el IR.
- La ruta iGPU con OpenVINO EP falló la verificación de salida (coseno 0,0255 frente a 0,99 requerido): no usar en producción sin comprobar la corrección numérica.
- El modelo estima densidad y conteo; no localiza personas individuales ni proporciona cajas delimitadoras.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en escenas densas, nocturnas o con oclusiones; el riesgo de error en dominios distintos al de entrenamiento es desconocido.
- No se documentan límites de resolución de entrada ni preprocesado requerido; el autor remite a las formas impresas por `compiled.inputs`.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene conservar la atribución a litert-community y al trabajo original de DM-Count.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/DM-Count-Crowd-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/DM-Count-Crowd-LiteRT
- Repositorio de scripts y mediciones del autor: https://github.com/john-rocky/windows-zoo
- Código original de DM-Count: https://github.com/cvlab-stonybrook/DM-Count
- Paper DM-Count (NeurIPS 2020): https://arxiv.org/abs/2009.13077
