# imagent/rtmo-m-onnx

## Resumen

RTMO-m (ONNX) es la exportación a formato ONNX del modelo RTMO-m de OpenMMLab, un estimador de pose multi-persona en una sola etapa (one-stage) desarrollado dentro del proyecto mmpose. RTMO resuelve el problema de la estimación de pose de múltiples personas sin necesidad de un detector de personas previo, a diferencia del paradigma top-down clásico (detectar cada persona y luego estimar sus keypoints), lo que reduce la latencia del pipeline completo y simplifica el despliegue.

Este repositorio concreto (`imagent/rtmo-m-onnx`) no es un entrenamiento nuevo ni una modificación del modelo: según su propia model card, es una copia sin cambios del export publicado por Xenova (`Xenova/RTMO-m`), mantenida por Imagent para disponer de una fuente de descarga estable. El fichero incluido es `model.onnx`, de 89.291.929 bytes, con hash SHA-256 verificado en la model card.

La relevancia práctica del artefacto es de ingeniería más que de investigación: al ser un único fichero ONNX autocontenido y de tamaño reducido, se puede ejecutar con ONNX Runtime en CPU, GPU de consumo, navegador o dispositivos de borde, sin depender del ecosistema completo de mmpose ni de PyTorch. La licencia Apache-2.0 del proyecto original permite uso comercial, lo que lo hace atractivo frente a alternativas con licencias copyleft fuerte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMO (one-stage, multi-persona), basada en la familia RTMDet/CSPNeXt de OpenMMLab con cabeza de clasificación dinámica de coordenadas; no disponible el detalle exacto del config usado en este export |
| Parametros totales | No disponible de forma explícita. El fichero `model.onnx` ocupa 89.291.929 bytes; si la exportación fuese en FP32 (4 bytes por parámetro) implicaría aproximadamente 22,3 M de parámetros, pero la precisión de exportación no se especifica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye `model.onnx`; no se listan variantes cuantizadas INT8, FP16 ni GGUF) |
| Idiomas soportados | no aplica (modelo de visión sin interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, 89.291.929 bytes, SHA-256 `76d82c45e5c4810baf587ecf2638d15cbf7ed196afb2055e977382532021b59e`) |
| Tarea | pose-estimation (estimación de pose multi-persona) |
| Autor original del modelo | OpenMMLab (proyecto mmpose) |
| Exportador a ONNX | Xenova |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de RTMO de OpenMMLab exportado a ONNX por Xenova, sin detallar configuración de entrenamiento. Por la información disponible, no se puede confirmar el número de tokens de entrenamiento (concepto que, además, no aplica directamente a un modelo de visión), la composición exacta del dataset, ni si hubo fases de ajuste fino con RLHF/DPO (tampoco aplicables a esta tarea). No hay datos en el repositorio sobre resolución de entrada del export, número de keypoints del esquema de salida ni config de mmpose empleado.

Lo que sí es verificable es la naturaleza del artefacto: un grafo ONNX autocontenido, derivado del proyecto `rtmo` de mmpose, que implementa una arquitectura de estimación de pose en una sola etapa. La innovación técnica conocida de la familia RTMO es precisamente prescindir del detector de personas previo y resolver la asignación multi-persona de keypoints en una única pasada de red, lo que evita la latencia añadida de un pipeline top-down en dos fases. El detalle interno de capas, bloques y cabeceras no está documentado en la información proporcionada.

## Capacidades

- Detección y estimación de pose de múltiples personas en una sola pasada de red (paradigma one-stage), sin detector previo.
- Salida de puntos clave del cuerpo humano (el esquema concreto, número y orden de keypoints, no está especificado en la información disponible).
- Inferencia sobre imágenes individuales; el tratamiento de vídeo se realiza aplicando el modelo fotograma a fotograma desde el código de despliegue.
- Ejecución mediante runtimes ONNX (CPU, CUDA, TensorRT, DirectML, WebAssembly/WebGPU), al ser un grafo ONNX estándar.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general (captioning, VQA) ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No dispone de modo "thinking", audio ni ninguna capacidad multimodal más allá de la imagen de entrada.

## Casos de uso

- Análisis deportivo automatizado: extraer la posición de las articulaciones de varios jugadores en cada fotograma para calcular ángulos, velocidades de movimiento o patrones biomecánicos, aprovechando que el modelo resuelve todas las personas de la escena sin detector previo.
- Monitorización de aforo y flujo de personas: combinado con una cámara fija, permite estimar la ocupación y los desplazamientos en una estancia o espacio público procesando cada fotograma con un único modelo.
- Control por gestos en aplicaciones interactivas: al ejecutarse vía ONNX Runtime o WebGPU, se puede integrar en aplicaciones de escritorio o navegador para traducir posturas del usuario en comandos, con latencia baja gracias a los 89 MB del grafo.
- Rehabilitación y seguimiento postural: comparar la pose estimada del paciente con una referencia para detectar desviaciones en ejercicios guiados, desplegando el modelo en un equipo de borde sin conexión a internet.
- Automatización de anotación de datasets: pre-etiquetar keypoints sobre grandes volúmenes de imágenes para que anotadores humanos solo corrijan errores, reduciendo el coste por imagen frente al etiquetado desde cero.
- Robótica y sistemas embebidos: al ser un fichero único de 89 MB y sin dependencias de PyTorch en inferencia, se puede empaquetar en dispositivos tipo Jetson o Raspberry Pi con ONNX Runtime para tareas de percepción humana.
- Análisis de seguridad y ergonomía laboral: detectar posturas de riesgo en puestos de trabajo a partir de grabaciones, estimando la pose de varios trabajadores por fotograma.
- Producción audiovisual: generación de datos de movimiento para animación o efectos, alimentando herramientas de retargeting con los keypoints estimados en cada fotograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de precisión (AP de COCO, PCKh, etc.), latencia ni throughput, y tampoco especifica el dataset de evaluación. Cualquier cifra que se cite para RTMO en general procede del proyecto o del artículo originales de OpenMMLab y debe verificarse en esas fuentes, no en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo ONNX ocupa 89,3 MB, por lo que la huella de pesos es inferior a 0,1 GB en cualquiera de las precisiones habituales; la memoria total necesaria depende de la resolución de entrada y del runtime, pero en ningún caso exige tarjetas de gama alta.
- GPU recomendadas: cualquier GPU con soporte CUDA o TensorRT es suficiente; no se requiere A100/H100 ni memoria de gran capacidad. Tarjetas de consumo como RTX 3060, RTX 4060 o RTX 4090 ejecutan este tamaño de modelo con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU recientes mediante DirectML o WebGPU.
- CPU: es viable en CPU moderna con ONNX Runtime, dado el tamaño reducido del grafo; probablemente sea el escenario de despliegue más habitual para este artefacto.
- Dispositivos de borde: cabe en plataformas tipo Raspberry Pi, Jetson Nano o similares, siempre que el runtime ONNX esté disponible y la resolución de entrada se ajuste al presupuesto de cómputo.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), NVIDIA TensorRT, OpenCV DNN, `onnxruntime-web` (WASM/WebGPU) y servidores de inferencia como Triton si se integra en un backend mayor.
- Latencia y throughput estimados: no disponible. La model card no publica tiempos de inferencia ni FPS para este fichero ONNX en ningún hardware concreto, y la familia RTMO se comercializa como apta para tiempo real, pero eso no permite extrapolar cifras verificables para este export.

## Comparativa con modelos similares

| Modelo | Paradigma | Parametros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMO-m (ONNX, este repositorio) | One-stage multi-persona | No disponible (fichero de 89,3 MB) | Imagen; resolución no especificada | Apache-2.0 | ONNX en HuggingFace |
| RTMPose (mmpose) | Top-down (requiere detector de personas) | No disponible | Imagen; recorte por persona | Apache-2.0 | Checkpoints PyTorch en OpenMMLab |
| YOLOv8-pose / YOLO11-pose (Ultralytics) | One-stage multi-persona | No disponible | Imagen; entrada configurable | AGPL-3.0 (o licencia comercial de pago) | PyTorch, ONNX, TensorRT |
| MediaPipe Pose | One-stage, orientado a una persona | No disponible | Imagen/vídeo | Apache-2.0 | Solución empaquetada de Google |
| MoveNet | One-stage, una persona | No disponible | Imagen | Apache-2.0 | TensorFlow Hub |

La diferencia funcional más relevante es la licencia: RTMO y RTMPose son Apache-2.0, mientras que las variantes de Ultralytics son AGPL-3.0 en su versión abierta, lo que condiciona su uso en productos propietarios. Frente a RTMPose, RTMO elimina la necesidad de un detector previo, lo que simplifica el pipeline y reduce latencia total. No se dispone de cifras comparativas de precisión verificadas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo puramente perceptivo: no genera texto, no razona y no acepta instrucciones en lenguaje natural. Cualquier sistema que lo use debe aportar toda la lógica de decisión alrededor.
- No hay información publicada en el repositorio sobre sesgos del dataset de entrenamiento. Los modelos de pose entrenados con conjuntos tipo COCO suelen degradarse en oclusiones severas, aglomeraciones, cuerpos parcialmente fuera de encuadre y diversidad corporal limitada, pero esto no se puede confirmar para este export concreto por falta de documentación.
- Riesgo de estimación errónea en escenas densas: al asignar keypoints a personas en una sola pasada, los cruces o solapamientos pueden producir intercambios de identidad entre individuos (aunque el modelo no realiza tracking temporal por sí mismo).
- No hay resultados de benchmarks ni validación publicados en este repositorio; no se debe asumir un nivel de precisión concreto sin evaluarlo sobre datos propios.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero la model card pide explícitamente citar y enlazar el trabajo de los autores originales en lugar de este repositorio, ya que se trata de una copia sin cambios.
- Advertencia de procedencia: el modelo no ha sido entrenado ni modificado por Imagent. Para cualquier incidencia de calidad, la referencia válida es OpenMMLab/mmpose y el export de Xenova, no este repositorio.
- Uso sobre personas: la estimación de pose sobre individuos tiene implicaciones de privacidad y protección de datos. En la Unión Europea, su despliegue en espacios públicos o laborales puede requerir base jurídica y evaluación de impacto, con independencia de la licencia del software.
- No aplica ninguna limitación de contexto o idioma, porque no es un modelo de lenguaje; la limitación equivalente es la resolución de imagen y el tamaño de las personas en el encuadre, cuyo valor concreto no se documenta aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imagent/rtmo-m-onnx
- Export original de Xenova: https://huggingface.co/Xenova/RTMO-m
- Fichero ONNX referenciado en la model card: https://huggingface.co/Xenova/RTMO-m/resolve/3aba1280472b98ee2bf663482e27e243038d23fe/onnx/model.onnx
- Proyecto RTMO dentro de mmpose (OpenMMLab): https://github.com/open-mmlab/mmpose/tree/main/projects/rtmo
- Repositorio mmpose: https://github.com/open-mmlab/mmpose
- Perfil del autor del repositorio: https://huggingface.co/imagent
