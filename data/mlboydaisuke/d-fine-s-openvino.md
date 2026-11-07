# mlboydaisuke/D-FINE-S-OpenVINO

## Resumen

D-FINE-S-OpenVINO es una conversión del modelo de detección de objetos D-FINE-S (variante Small) al ecosistema OpenVINO, publicada por el usuario mlboydaisuke. Parte del modelo base `litert-community/D-FINE-S-LiteRT` y ofrece los grafos `dfine_graphA_fp16` y `dfine_graphB_fp16` en formato ONNX (generados con tf2onnx 1.17.0, opset 17), en OpenVINO IR con pesos fp32 y como blobs precompilados para la NPU de Intel. El paquete está pensado para desplegar detección de objetos en los aceleradores integrados de Intel (NPU AI Boost, iGPU y CPU) de portátiles con Core Ultra.

El modelo resuelve el problema de ejecutar un detector D-FINE en hardware Intel sin depender de LiteRT, con artefactos ya compilados para la NPU y métricas de latencia publicadas por el autor. La conversión corrige un defecto de tf2onnx 1.17.0 que descartaba el sesgo de 15 capas FULLY_CONNECTED en ambos grafos; los ficheros publicados incorporan ese parche y sus salidas coinciden con el `.tflite` original (coseno ≥ 0,9999).

La relevancia actual radica en la latencia medida: en la NPU de un Core Ultra 9 386H, `dfine_graphA_fp16` ejecuta en 11,14 ms y `dfine_graphB_fp16` en 96,94 ms por inferencia (entrada numpy a salida numpy). El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0. No se dispone de información sobre arquitectura interna, número de parámetros ni composición del dataset de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector D-FINE-S; grafos exportados como ONNX opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para detección de objetos) |
| Tipos de cuantizacion | fp16 (ONNX y blobs NPU); OpenVINO IR con pesos fp32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, OpenVINO IR (.xml/.bin), blob precompilado para Intel NPU |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en la documentación proporcionada. El modelo base es `litert-community/D-FINE-S-LiteRT`, una variante del detector D-FINE en formato LiteRT, y esta publicación es una conversión cuantizada del mismo (`base_model_relation: quantized`).

La innovación técnica documentada es la cadena de conversión: los grafos `dfine_graphA_fp16` y `dfine_graphB_fp16` se exportaron a ONNX con tf2onnx 1.17.0 (opset 17) aplicando un parche de una línea (`convert/patch_tf2onnx.py`) que evita la pérdida del sesgo en 15 capas FULLY_CONNECTED. Posteriormente se generó el IR de OpenVINO y se compilaron blobs para la NPU con OpenVINO 2026.4.1, driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). La verificación de salidas frente al `.tflite` original da coseno ≥ 0,9999 en todas las salidas.

## Capacidades

- Detección de objetos en imágenes mediante dos grafos independientes (`dfine_graphA_fp16` y `dfine_graphB_fp16`).
- Inferencia en NPU Intel AI Boost, iGPU Intel Graphics y CPU, con los mismos artefactos o mediante ONNX Runtime con el Execution Provider de OpenVINO.
- Ejecución con blobs precompilados que eliminan el tiempo de compilación en carga (0,01 s y 0,04 s respectivamente en NPU).
- Compatibilidad con ONNX Runtime 1.31.1 (EP de OpenVINO 1.8.1 y EP CUDA) y con OpenVINO 2026.4.1.
- No se documentan capacidades de generación de texto, tool calling, agentes, multilingüismo ni modos de razonamiento, al tratarse de un modelo de visión.

## Casos de uso

- Detección de objetos en tiempo real en portátiles con Core Ultra: el grafo A ejecuta en 11,14 ms en la NPU, lo que permite procesar vídeo a decenas de fotogramas por segundo sin ocupar la GPU discreta.
- Visión artificial en el borde (edge) con bajo consumo: al ejecutarse en la NPU integrada, libera CPU y GPU para otras tareas del sistema, útil en aplicaciones industriales o de vigilancia desplegadas en AI PCs.
- Preprocesado en pipelines de vídeo: usar el grafo A como etapa rápida de propuesta de regiones y el grafo B (96,94 ms en NPU) para una pasada de mayor coste cuando se requiera.
- Integración en aplicaciones de escritorio Windows: los blobs y el IR se cargan con OpenVINO desde Python, lo que facilita empaquetar un detector local sin dependencias de la nube.
- Prototipado en CPU sin acelerador: el grafo A tarda 44,49 ms en la CPU del Core Ultra 9 386H, suficiente para pruebas funcionales y validación antes de desplegar en NPU.
- Aceleración con GPU discreta en equipos con RTX: el grafo A ejecuta en 6,80 ms con una copia fp16 del ONNX en el EP CUDA de ONNX Runtime, adecuado para estaciones de trabajo con GPU NVIDIA.
- Validación de conversiones de modelos LiteRT a OpenVINO: el repositorio sirve como referencia reproducible para verificar la equivalencia numérica frente al `.tflite` original.

## Benchmarks y rendimiento

Latencia por inferencia (entrada numpy a salida numpy, mediana de 30 ejecuciones tras calentamiento), medida en un MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W y Windows 11:

| Grafo | Procesador | Runtime | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| A | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 11,14 | 0,01 | PASS (cos ≥ 0,9973) |
| A | Intel AI Boost NPU | ONNX Runtime + OpenVINO EP | 8,61 | 12,75 | PASS (cos ≥ 0,9973) |
| A | Intel Graphics (iGPU) | ONNX Runtime + OpenVINO EP | 8,89 | 1,36 | PASS (cos ≥ 0,9999) |
| A | RTX 5080 Laptop (95 W) | ONNX Runtime, CUDA EP (fp16) | 6,80 | 1,29 | PASS (cos ≥ 0,9999) |
| A | RTX 5080 Laptop (95 W) | ONNX Runtime, CUDA EP | 7,22 | 1,37 | PASS (cos ≥ 0,9999) |
| A | Core Ultra 9 386H CPU | ONNX Runtime, CPU EP | 44,49 | 0,26 | referencia |
| B | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 96,94 | 0,04 | PASS (cos ≥ 0,9999) |
| B | Intel AI Boost NPU | ONNX Runtime + OpenVINO EP | 97,99 | 51,92 | PASS (cos ≥ 0,9999) |
| B | Intel Graphics (iGPU) | ONNX Runtime + OpenVINO EP | 88,00 | 3,14 | FAIL (80 Inf, coincidencia argmax 189/300) |
| B | RTX 5080 Laptop (95 W) | ONNX Runtime, CUDA EP (fp16) | 9,60 | 1,27 | FAIL (80 Inf) |
| B | RTX 5080 Laptop (95 W) | ONNX Runtime, CUDA EP | 9,66 | 1,23 | PASS (cos ≥ 0,9999) |
| B | Core Ultra 9 386H CPU | ONNX Runtime, CPU EP | 67,99 | 0,11 | referencia |

No se han publicado resultados de benchmarks de precisión (mAP, COCO, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los ficheros ONNX pesan 25,2 MB (grafo A) y 17,8 MB (grafo B); el IR de OpenVINO ocupa 24,2 MB y 16,7 MB respectivamente; los blobs NPU ocupan 18,4 MB y 60,1 MB. El modelo cabe holgadamente en cualquier equipo moderno.
- NPU: requiere Intel AI Boost con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; si `import_model` rechaza el blob por versión de driver u OpenVINO, debe compilarse el IR en la máquina destino.
- iGPU: Intel Graphics con ONNX Runtime 1.31.1 y OpenVINO EP 1.8.1; el grafo B produce Inf en este EP (ver limitaciones).
- GPU discreta: RTX 5080 Laptop a 95 W alcanza 6,80 ms (grafo A, fp16) y 9,66 ms (grafo B, ONNX sin copia fp16); con la copia fp16 del grafo B se obtienen Inf.
- CPU: funciona en la CPU del Core Ultra 9 386H con ONNX Runtime CPU EP (44,49 ms y 67,99 ms), por lo que cabe en cualquier CPU x86 moderna.
- Despliegue: OpenVINO (Python, `core.compile_model` o `core.import_model`), ONNX Runtime con EP de OpenVINO o CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Throughput estimado: en NPU, el grafo A admite aproximadamente 90 inferencias por segundo (11,14 ms) y el grafo B unas 10 por segundo (96,94 ms).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio autor publica una tabla equivalente para los 52 grafos de LiteRT-Models en el repositorio de GitHub, que puede consultarse para comparar con otras conversiones, pero sus datos no se incluyen aquí.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| D-FINE-S-OpenVINO | no disponible | no aplica | Apache 2.0 | ONNX, IR, blob NPU | Conversión de D-FINE-S-LiteRT |
| D-FINE-S-LiteRT (base) | no disponible | no aplica | no disponible | LiteRT (.tflite) | Modelo de origen |
| Otros modelos | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- El grafo B produce 80 valores Inf en la salida `output_1_output` al ejecutarse en la iGPU de Intel y en la RTX 5080 con la copia fp16 del ONNX; solo el ONNX sin copia fp16 en CUDA y la NPU pasan la verificación. No debe usarse el grafo B en iGPU ni con fp16 en CUDA sin validar las salidas.
- Los blobs NPU están compilados para OpenVINO 2026.4.1 y driver 32.0.100.4841; otras versiones pueden rechazar la importación y obligar a recompilar el IR.
- La conversión con tf2onnx 1.17.0 sin el parche descarta el sesgo de 15 capas FULLY_CONNECTED; deben usarse los ficheros publicados, no una reconversión sin parche.
- No hay información sobre sesgos, tasas de alucinación ni precisión de detección (mAP) en la documentación disponible; no es posible evaluar la calidad del detector con los datos publicados.
- El modelo no procesa lenguaje, por lo que no aplican limitaciones de contexto o idioma, pero tampoco ofrece capacidades de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `litert-community/D-FINE-S-LiteRT` debería verificarse por separado antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad sobre los artefactos.
- Las mediciones se realizaron en un único equipo (MSI Stealth 16 AI+ con Core Ultra 9 386H) y pueden no extrapolarse a otros procesadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/D-FINE-S-OpenVINO
- Modelo base: https://huggingface.co/litert-community/D-FINE-S-LiteRT
- Repositorio con scripts y tabla completa: https://github.com/john-rocky/windows-zoo
- Documentación de OpenVINO: https://docs.openvino.ai/
- Modelos OpenVINO en Hugging Face: https://huggingface.co/OpenVINO/models
