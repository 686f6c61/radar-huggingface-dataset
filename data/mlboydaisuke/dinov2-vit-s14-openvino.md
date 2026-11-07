# mlboydaisuke/DINOv2-ViT-S14-OpenVINO

## Resumen

DINOv2-ViT-S14-OpenVINO es una conversión del modelo de extracción de características visuales DINOv2 (variante small, ViT-S/14) a formatos optimizados para hardware Intel: ONNX (opset 17), OpenVINO IR con pesos fp32 y un blob precompilado para la NPU integrada en los procesadores Intel Core Ultra. Lo publica el usuario mlboydaisuke como parte de un trabajo más amplio de conversión de los grafos de LiteRT-Models a runtimes de escritorio, y deriva del modelo `litert-community/DINOv2-ViT-S14-LiteRT`, que a su vez proviene de `facebook/dinov2-small`.

El modelo no genera texto: es un extractor de embeddings de imagen (pipeline `image-feature-extraction`). Su utilidad práctica es permitir ejecutar DINOv2 ViT-S/14 en local sobre CPU, iGPU o NPU de portátiles con Intel Core Ultra, sin depender de una GPU dedicada ni de la nube. El repositorio ocupa 0,2 GB e incluye tanto los artefactos ONNX/OpenVINO como el blob NPU listo para cargar.

La relevancia actual está en el despliegue en el borde (edge): un modelo de visión autosupervisado de 21-22 M de parámetros que corre en 27,55 ms por inferencia en la NPU de un Core Ultra 9 386H, aunque con una salvedad importante de fidelidad numérica que se detalla más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/14), DINOv2 autosupervisado |
| Parametros totales | no disponible (ViT-S/14 de DINOv2: aproximadamente 21-22 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; resolución de entrada no especificada en la informacion) |
| Tipos de cuantizacion | fp16 en el ONNX de origen (`dinov2_s_fp16`); pesos fp32 en el IR de OpenVINO; blob NPU precompilado |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob NPU de Intel |

## Arquitectura y entrenamiento

El modelo subyacente es DINOv2 en su variante small con parches de 14x14 (ViT-S/14), un transformer de visión entrenado con aprendizaje autosupervisado (self-distillation con teacher-student, combinada con pérdidas de imagen y de parche) sobre un corpus curado de imágenes sin etiquetas. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste supervisado posteriores; esos datos corresponden a la model card original de `facebook/dinov2-small`, no incluida aquí.

La aportación de este repositorio no es el entrenamiento sino la cadena de conversión: el `.tflite` de LiteRT se convierte a ONNX con tf2onnx 1.17.0 (opset 17), se verifica la equivalencia numérica frente al `.tflite` original (coseno ≥ 0,9999 en todas las salidas) y se generan el IR de OpenVINO y un blob precompilado para la NPU. El blob se compiló con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841; si `import_model` rechaza el blob en otra versión de driver o de OpenVINO, la alternativa documentada es compilar el IR en la máquina destino.

## Capacidades

- Extracción de embeddings globales de imagen (feature vector por imagen), útil para búsqueda visual, deduplicación y clasificación por similitud.
- Extracción de características por parche (el modelo DINOv2 produce salidas densas además del descriptor global), lo que habilita tareas densas como segmentación o correspondencia entre imágenes.
- Inferencia en CPU, iGPU y NPU de Intel mediante OpenVINO, y en GPU NVIDIA mediante el execution provider CUDA de ONNX Runtime.
- Ejecución en NPU de Qualcomm Snapdragon y en NPU de móvil (Galaxy S26) a través de Qualcomm AI Hub con el EP QNN de ONNX Runtime.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es exclusivamente un modelo de visión.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Búsqueda visual inversa en local: indexar un catálogo de imágenes con los embeddings de DINOv2 y recuperar por similitud coseno; el modelo cabe en 0,2 GB y corre en la NPU del portátil sin GPU dedicada.
- Deduplicación de imágenes en pipelines de datos: calcular el descriptor global de cada imagen y agrupar por distancia para eliminar duplicados o casi duplicados antes de entrenar otros modelos.
- Preprocesado para clasificadores ligeros: usar los embeddings como características de entrada de una regresión logística o un MLP pequeño, evitando entrenar una CNN desde cero en conjuntos de datos reducidos.
- Etiquetado y clustering no supervisado: agrupar imágenes por temática (k-means sobre embeddings) para triage de datasets o moderación de contenido asistida.
- Segmentación y correspondencia densa: aprovechar las características por parche en tareas de segmentación semántica ligera o emparejamiento de puntos entre pares de imágenes.
- Despliegue en el borde con NPU: aplicaciones de inspección visual o robótica en portátiles Intel Core Ultra donde la latencia de 27,55 ms por inferencia en NPU es suficiente para procesamiento en tiempo real a decenas de FPS.
- Prototipado en movilidad: validar el mismo ONNX en Snapdragon (56,22 ms en NPU X2 Elite) y en móvil (60,03 ms en Galaxy S26) antes de portar la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (ImageNet, segmentación, etc.) en la información disponible. Los datos publicados son de latencia y verificación numérica:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 27,55 | 0,04 | FAIL: cos 0,0365 < 0,99 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 27,43 | 35,58 | FAIL: cos 0,0364 < 0,99 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 48,20 | 1,77 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 8,95 | 1,23 | PASS (cos ≥ 0,9963) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 11,08 | 1,22 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 139,66 | 0,21 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 56,22 | 0,43 | no comparado |
| Snapdragon X2 Elite NPU | ONNX Runtime QNN EP | `.onnx` | 64,31 | 64,43 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 60,03 | 0,25 | no comparado |

Medido en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), mediana de 30 ejecuciones tras calentamiento. La verificación compara cada salida con la salida fp32 en CPU de ONNX Runtime sobre la misma entrada.

## Requisitos de hardware

- VRAM/RAM: el ONNX pesa 87,86 MB y el IR de OpenVINO 87,66 MB (pesos fp32); el blob NPU ocupa 54,42 MB. Cabe holgadamente en cualquier equipo con 2 GB de memoria libre.
- GPU recomendadas: RTX 5080 Laptop (8,95 ms con fp16, 11,08 ms con fp32); cualquier GPU NVIDIA con soporte CUDA y al menos 1 GB de VRAM libre debería ejecutarlo.
- Consumer GPU: sí, cabe en cualquier GPU de consumo moderna; el cuello de botella no es la memoria sino la latencia del runtime.
- CPU: 139,66 ms por inferencia en un Core Ultra 9 386H con el CPU EP de ONNX Runtime.
- NPU Intel: 27,55 ms con el blob precompilado (carga en 0,04 s) o 27,43 ms con el EP OpenVINO de ONNX Runtime (pero 35,58 s de compilación al cargar la sesión).
- Despliegue: OpenVINO (Python, `core.import_model` o `compile_model`), ONNX Runtime con EP OpenVINO o CUDA, Qualcomm AI Hub con QNN para Snapdragon. No se documenta soporte de llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Throughput estimado: a 27,55 ms por imagen en NPU Intel, aproximadamente 36 imágenes por segundo en el mejor caso; a 8,95 ms en RTX 5080, aproximadamente 112 imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Latencia medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINOv2-ViT-S14-OpenVINO (este) | ViT-S/14, ~21-22 M (no confirmado) | no disponible | 27,55 ms NPU Intel; 8,95 ms RTX 5080 fp16 | Apache-2.0 | Hugging Face |
| litert-community/DINOv2-ViT-S14-LiteRT (base) | ViT-S/14 | no disponible | no disponible | Apache-2.0 | Hugging Face |
| facebook/dinov2-small (upstream) | ViT-S/14 | no disponible | no disponible | Apache-2.0 | Hugging Face |
| mlboydaisuke/DINOv2-ViT-S14-ExecuTorch | ViT-S/14 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparación se limita a linaje, licencia y formato de despliegue.

## Limitaciones y advertencias

- Fidelidad numérica en NPU Intel: la verificación de salida falla con coseno 0,0365 (blob) y 0,0364 (EP OpenVINO), muy por debajo del umbral 0,99. Las latencias de NPU son rápidas pero los resultados no coinciden con la referencia fp32; no usar el camino NPU en producción sin validar la calidad de los embeddings en la tarea concreta.
- El blob NPU está compilado para OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y hay que recompilar el IR.
- La compilación del `.onnx` para NPU con el EP OpenVINO tarda 35,58 s al cargar la sesión, lo que penaliza arranques en frío.
- El modelo es de visión: no procesa texto, no responde preguntas y no tiene modo de razonamiento; cualquier caso de uso debe plantearse como extracción de características más una cabeza o índice posterior.
- No se documentan sesgos, composición del dataset ni evaluación de robustez en la información disponible; hereda los del DINOv2 original.
- Licencia Apache-2.0, permisiva para uso comercial, siempre que se respeten las condiciones de atribución de la licencia y las del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/DINOv2-ViT-S14-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/DINOv2-ViT-S14-LiteRT
- Modelo upstream DINOv2 small: https://huggingface.co/facebook/dinov2-small
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Conversión a ExecuTorch del mismo autor: https://huggingface.co/mlboydaisuke/DINOv2-ViT-S14-ExecuTorch
