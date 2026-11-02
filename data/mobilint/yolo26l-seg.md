# mobilint/YOLO26l-seg

## Resumen

YOLO26l-seg es una reproducción compilada y cuantizada del modelo de segmentación de instancias YOLO26 en su variante "l" (large), publicada por Mobilint en HuggingFace. No se trata de un modelo entrenado desde cero por Mobilint, sino de una conversión del modelo base Ultralytics/YOLO26 a formato MXQ (MXQv7) mediante su compilador propietario qbcompiler 1.4.0, orientado a su runtime qbruntime y a su hardware/plataforma de inferencia (referida como aries-rb).

El modelo resuelve la tarea de segmentación de instancias: detectar objetos en una imagen y generar máscaras por instancia. Está pensado para despliegue en producción sobre la pila de Mobilint, con modos de inferencia específicos (single, multi, global4, global8) y una evaluación reproducible sobre COCO con 5000 muestras, donde alcanza un mAP50-95 de 0,44236 y un mAP50 de 0,67588 en modo async.

Su relevancia es doble: por un lado ofrece una versión lista para inferencia de YOLO26-seg con métricas auditadas y hashes verificables; por otro, ilustra el ecosistema de compilación y cuantización de Mobilint, que no es compatible con los formatos habituales (safetensors, GGUF, ONNX estándar en runtime). El repositorio ocupa 0,2 GB y el artefacto MXQ pesa 34.733.944 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector/segmentador CNN de una etapa; artefacto compilado MXQv7 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | cuantización GPTQ (variante `c0923-gptq`) aplicada durante la compilación con qbcompiler 1.4.0 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | MXQ (MXQv7); repositorio con carpeta `aries-rb/` y metadatos JSON; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es YOLO26 de Ultralytics, un detector-segmentador de una etapa de la familia YOLO, en tamaño "l". Mobilint no documenta en esta ficha la arquitectura interna, el número de parámetros ni el volumen de datos de entrenamiento del modelo original; esos detalles corresponden a la documentación de Ultralytics. Lo que sí se documenta es el proceso de conversión: el modelo se compiló con qbcompiler 1.4.0 dentro de la imagen `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04` (digest sha256 indicado en la model card), usando `--inference-scheme all`, lo que habilita los modos `single`, `multi`, `global4` y `global8`.

La variante publicada es `c0923-gptq`, lo que indica cuantización GPTQ aplicada al modelo base antes o durante la compilación. El artefacto resultante tiene un SHA-256 verificable (`2ac198a5...73defef`) y se evaluó con qbruntime 1.5.0 en modo `async` sobre COCO (5000 muestras), con identidad de datos auditada (hashes de anotaciones y de lista de muestras). El JSON de metadatos incluye además un `retention_percent` de 98,72 % en mAP50-95 respecto a la referencia, lo que sugiere una pérdida de precisión mínima tras la cuantización/compilación.

## Capacidades

- Segmentación de instancias: detección de objetos con máscaras por instancia sobre imágenes.
- Detección de objetos con cajas (implícita en el pipeline de segmentación).
- Inferencia en varios modos de ejecución: `single`, `multi`, `global4`, `global8`, según el esquema de compilación.
- Ejecución en modo asíncrono (`async`) mediante qbruntime 1.5.0.
- Verificación de integridad del artefacto mediante SHA-256 y metadatos JSON.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es un modelo puramente visual.
- Capacidades multilingües: no aplica.

## Casos de uso

- Segmentación de instancias en pipelines de visión artificial: el modelo genera máscaras por objeto sobre imágenes de entrada, adecuado para conteo, medición de áreas y separación de objetos solapados en entornos controlados.
- Automatización de anotación de datasets: usar las máscaras predichas como preanotaciones para revisión humana, acelerando el etiquetado de imágenes en proyectos de segmentación.
- Inspección visual industrial: detección y segmentación de defectos o piezas en líneas de producción, aprovechando los modos `global4`/`global8` para procesar lotes de imágenes.
- Análisis de imágenes médicas o científicas (con validación previa): segmentación de regiones de interés cuando el dominio se haya evaluado y la licencia AGPL sea compatible con el uso previsto.
- Procesamiento por lotes en servidores con qbruntime: integración en servicios de inferencia que ya usen la pila de Mobilint, con verificación de hashes para garantizar reproducibilidad.
- Investigación y benchmarking de cuantización: comparar la retención de precisión (98,72 % en mAP50-95) frente al modelo original para estudiar el impacto de GPTQ en segmentación.
- Robótica y vehículos autónomos (prototipado): segmentación de escenas para percepción, siempre que el hardware objetivo soporte el runtime y se validen latencias.

## Benchmarks y rendimiento

Evaluación sobre COCO con 5000 muestras, qbruntime 1.5.0 en modo `async`, según la model card:

| Metrica | Valor |
|---|---|
| mAP50-95 | 0,44236 |
| mAP50 | 0,67588 |
| Retencion mAP50-95 vs. referencia | 98,72 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay tablas frente a otras variantes YOLO).

## Requisitos de hardware

- VRAM estimada: no disponible. El artefacto MXQ pesa 34,7 MB, lo que sugiere un modelo compacto, pero no se documenta el consumo de memoria en ejecución.
- GPU recomendadas: no disponible; la compilación se realizó en imagen con CUDA 12.8.1, lo que indica dependencia de GPU NVIDIA para el flujo de compilación.
- Compatibilidad con GPU de consumo: no confirmada; depende de que qbruntime y el hardware "aries-rb" soporten la tarjeta.
- Opciones de despliegue: qbruntime 1.5.0 (runtime propio de Mobilint); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se especifica el modo `async` de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50-95 (COCO) | Licencia | Formato |
|---|---|---|---|---|---|
| YOLO26l-seg (Mobilint) | no disponible | no aplica | 0,44236 | AGPL-3.0 | MXQ |
| Ultralytics YOLO26 (base) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 | PyTorch/ONNX (según Ultralytics) |
| Otras variantes YOLO-seg | no disponible | no aplica | no disponible | varía | varía |

No se dispone de datos suficientes en la información proporcionada para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente; revisar implicaciones legales antes de producción.
- Dependencia total del ecosistema Mobilint: el artefacto es MXQ y requiere qbruntime; no es portable a otros runtimes sin recompilación.
- Solo se evaluó el modo de núcleo medido; los demás modos (`single`, `multi`, `global4`, `global8`) no tienen métricas publicadas en esta ficha.
- `aries-rb/best_result.json` contiene valores de build heredados; no debe interpretarse como resultado actual.
- La carpeta `aries/` fue eliminada; versiones de mblt-model-zoo <= 2.12 deben fijar una revisión anterior.
- Riesgo de sesgos y alucinaciones visuales: como todo detector, puede fallar en clases poco representadas, oclusiones severas o dominios distintos a COCO; no se documentan análisis de sesgo.
- Sin soporte de lenguaje, agentes ni tool calling; no apto para tareas de texto.
- No se documentan parámetros totales, datos de entrenamiento ni límites de resolución de entrada; verificar en la documentación de Ultralytics.

## Enlaces

- HuggingFace: https://huggingface.co/mobilint/YOLO26l-seg
- Repositorio de artefactos arXiv de Mobilint: https://github.com/mobilint/mblt-model-arxiv/tree/main/models/instance_segmentation/YOLO26l_seg
- Ultralytics (modelo base): https://github.com/ultralytics/ultralytics
- Modelo base en HuggingFace: https://huggingface.co/Ultralytics/YOLO26
