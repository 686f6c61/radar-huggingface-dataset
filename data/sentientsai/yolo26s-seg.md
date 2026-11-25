# sentientsai/yolo26s-seg

## Resumen

yolo26s-seg es un modelo de segmentación de instancias derivado de YOLO26 de Ultralytics, publicado por Sentients AI como componente de su Vision Core para Unreal Engine. Detecta y segmenta 80 clases de objetos (personas, vehículos, animales, utensilios, dispositivos y objetos cotidianos), devolviendo para cada detección la máscara de píxeles que corresponde al objeto dentro de su caja delimitadora, con seguimiento de identidad entre ejecuciones consecutivas.

El modelo se distribuye exclusivamente en formato ONNX, en dos variantes: fp32 (40,0 MiB) para CPU, DirectML, TensorRT y HLSL, y fp16 (20,1 MiB) optimizada para TensorRT. No se publican pesos en safetensors ni en PyTorch; los ficheros se generaron a partir de `yolo26s-seg.pt` de Ultralytics mediante el script `export_yolo26.py` del lado Python de Sentients, con formas fijas y un grafo reescrito para su ejecución en runtime.

Su relevancia es acotada pero concreta: es un artefacto de despliegue reproducible, con hashes SHA-256 fijados en el catálogo firmado `sentientsai/sentients-catalog`, pensado para integrarse en el plugin de Unreal Engine mediante el selector `EVisionModel::ObjectSegmentationYolo26sSeg`, consumiendo `CoreImageInput` y produciendo `CoreDetectionOutput`. No es un modelo de propósito general ni un checkpoint entrenable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), red de detección y segmentación de instancias, exportada a grafo ONNX con formas fijas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | fp32 y fp16 (variantes publicadas); no se distribuyen GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (no procesa lenguaje; las etiquetas de clase son las 80 de COCO en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26s-seg.onnx` fp32, `yolo26s-seg.fp16.onnx` fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26 en su variante "s" (small) para segmentación, según el repositorio `Ultralytics/YOLO26` en el commit `070ac3c51435`, del que procede el checkpoint `yolo26s-seg.pt`. Sentients no ha reentrenado el modelo: los ficheros publicados son conversiones del checkpoint original mediante `export_yolo26.py`, que aplica precisión media (fp16), formas de entrada fijas para runtimes que las requieren y una reescritura del grafo para facilitar su ejecución en TensorRT, DirectML, HLSL y CPU.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino o refuerzo, más allá de la referencia implícita al conjunto de 80 clases estándar de detección de objetos. Tampoco se documentan innovaciones técnicas propias de Sentients más allá del empaquetado reproducible: ficheros inmutables identificados por SHA-256 y verificados por hash en el catálogo firmado, de modo que el plugin descarga únicamente bytes que coinciden con el hash esperado.

## Capacidades

- Detección de objetos en 80 clases (personas, vehículos, animales, utensilios de cocina, dispositivos electrónicos, libros, etc.).
- Segmentación de instancias: devuelve la máscara de píxeles del objeto dentro de su caja delimitadora, no solo la caja.
- Seguimiento de objetos entre ejecuciones consecutivas ("each followed from run to run"), lo que permite asignar identidad estable a cada instancia a lo largo de un vídeo o secuencia de fotogramas.
- Inferencia acelerada en GPU: variante fp16 orientada a TensorRT y variante fp32 para CPU, DirectML, TensorRT y HLSL.
- Integración nativa con Unreal Engine a través del plugin Vision Core de Sentients (selector `EVisionModel::ObjectSegmentationYolo26sSeg`).
- Entrada `CoreImageInput` y salida `CoreDetectionOutput` como contrato de datos del plugin.
- No soporta tool calling, function calling, razonamiento multi-step ni generación de texto: es exclusivamente un modelo de visión.

## Casos de uso

- Segmentación en tiempo real dentro de Unreal Engine: el plugin carga `yolo26s-seg.fp16.onnx` en TensorRT y aplica máscaras por instancia sobre la imagen de juego o de una cámara virtual, aprovechando las formas fijas del grafo para minimizar la latencia de ejecución.
- Seguimiento de actores en secuencias de vídeo: gracias al seguimiento entre ejecuciones, se puede mantener la identidad de cada persona u objeto a lo largo de fotogramas y usar esas trayectorias para animación, análisis de escenas o métricas de producción.
- Rotoscopia asistida y postproducción: las máscaras por instancia permiten aislar personas, vehículos o utensilios en material grabado y generar mates para composición, con la variante fp32 en CPU cuando no hay GPU disponible en la estación de trabajo.
- Análisis de escenas para robótica o simulación: integrado en un pipeline de Unreal, el modelo identifica y separa objetos del entorno simulado para tareas de percepción, evaluación de agentes o generación de datos sintéticos etiquetados.
- Moderación y análisis de contenido visual: detección y segmentación de categorías como personas, teléfonos o libros en imágenes subidas por usuarios, con la máscara como señal adicional frente a la mera caja delimitadora.
- Automatización de inventario o inspección visual: conteo y localización de objetos (vasos, botellas, dispositivos) en imágenes de estanterías o líneas de producción, usando la máscara para descartar solapamientos y oclusiones parciales.
- Prototipado rápido en Python: los ficheros ONNX pueden cargarse con `onnxruntime` fuera de Unreal para validar el comportamiento del modelo antes de integrarlo en el plugin, verificando previamente el SHA-256 contra el catálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por el tamaño de los ficheros (20,1 MiB en fp16 y 40,0 MiB en fp32), el modelo es muy ligero y cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque la cifra exacta depende del runtime y del tamaño de lote.
- GPU recomendadas: no especificadas por el autor. La variante fp16 está pensada para TensorRT, lo que en la práctica apunta a GPUs NVIDIA (RTX 20xx en adelante, A100, H100); la variante fp32 cubre CPU, DirectML (GPU AMD/Intel en Windows) y HLSL.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el reducido tamaño de los pesos; no se documentan modelos concretos probados.
- Opciones de despliegue: TensorRT (variante fp16), ONNX Runtime con ejecución en CPU, DirectML o HLSL (variante fp32), y el plugin Vision Core de Sentients para Unreal Engine.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| yolo26s-seg (este) | no disponible | no aplica | Segmentación de instancias, 80 clases | AGPL-3.0 | ONNX fp32/fp16 | Hugging Face, catálogo Sentients |
| Ultralytics YOLO26 (yolo26s-seg.pt) | no disponible | no aplica | Segmentación de instancias, 80 clases | AGPL-3.0 | PyTorch (.pt) | Hugging Face (Ultralytics/YOLO26) |
| YOLOv8-seg (Ultralytics) | no disponible | no aplica | Segmentación de instancias, 80 clases | AGPL-3.0 | PyTorch, ONNX | Hugging Face, GitHub |
| SAM 2 (Meta) | no disponible | no aplica | Segmentación promptable de imagen y vídeo | Apache-2.0 (código) / licencia propia en pesos | PyTorch | Meta AI, Hugging Face |

La comparación directa con YOLOv8-seg y SAM 2 es aproximada: no se dispone de cifras de precisión (mAP de máscara) ni de latencia para este artefacto, por lo que no es posible establecer una jerarquía de rendimiento con datos verificables.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en servicios de red o productos distribuidos puede obligar a liberar el código fuente bajo la misma licencia; es un caveat relevante para integración comercial en Unreal Engine.
- El modelo solo detecta las 80 clases del conjunto estándar de detección de objetos; cualquier categoría fuera de ese vocabulario no será reconocida.
- No se documentan sesgos específicos, pero al no publicarse la composición del dataset de entrenamiento no es posible evaluar sesgos demográficos, geográficos o de contexto.
- Riesgo de alucinación entendido como falsos positivos y máscaras imprecisas en objetos ocluidos, pequeños o de clases poco representadas; no hay métricas publicadas para cuantificarlo.
- Las formas de entrada están fijadas en el grafo ONNX, lo que limita la resolución o el tamaño de lote a lo exportado; no es un modelo flexible en ese aspecto.
- No procesa texto ni lenguaje: no admite prompts, tool calling ni razonamiento; las etiquetas de salida son las clases predefinidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- Los ficheros son inmutables por diseño: cualquier corrección se publicará bajo un nombre nuevo, por lo que conviene fijar el SHA-256 en los pipelines de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sentientsai/yolo26s-seg
- Catálogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
- Checkpoint original de Ultralytics: https://huggingface.co/Ultralytics/YOLO26
- Repositorio de Ultralytics (YOLO): https://github.com/ultralytics/ultralytics
