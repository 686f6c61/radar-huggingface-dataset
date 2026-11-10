# HanzoHuang/YOLOv8-RKNN2

## Resumen

YOLOv8-RKNN2 es un repositorio de modelos YOLOv8 exportados al formato RKNN2 para su ejecución sobre NPUs de Rockchip, concretamente en los SoCs RK3576 y RK3588. Lo publica el usuario HanzoHuang y no se trata de un modelo entrenado desde cero, sino de una colección de conversiones y exportaciones guiadas por Rockchip (posiblemente partiendo de los repositorios oficiales de RKNN Model Zoo) más exportaciones propias, generadas con RKNN Toolkit2 en su versión 2.3.2. El objetivo es ofrecer artefactos listos para desplegar en placas con NPU Rockchip sin tener que reproducir el pipeline de conversión.

El paquete cubre tres tareas de visión por computador: clasificación de imágenes, detección con cajas orientadas (OBB) y estimación de pose. Cada variante se organiza en una jerarquía de carpetas `models/<task>/<variant>/<chip>/<precision>/`, donde conviven el binario `model.rknn` y un `metadata.yaml` con los checksums de ambos ficheros. El repositorio incluye además un directorio `source/` con los checkpoints originales, los scripts de conversión y su procedencia documentada en `weights.json`.

La relevancia práctica es acotada pero clara: para quien despliegue YOLOv8 en hardware Rockchip (por ejemplo, placas de borde con RK3588), este repo ahorra el trabajo de calibración y conversión, y añade trazabilidad mediante checksums. No obstante, el proyecto tiene cero descargas y cero likes en el momento de la consulta, no publica métricas de precisión ni detalles sobre los datasets de calibración, y la licencia AGPL-3.0 condiciona seriamente su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (red neuronal convolucional de detección/segmentación/clasificación/pose), exportada a RKNN2 |
| Parametros totales | no disponible (depende de la variante n/s/m/l/x de YOLOv8, no especificada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | precisión indicada en la ruta `<precision>`; los valores concretos (p. ej. int8, fp16) no están detallados en la model card |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`) para despliegue; checkpoints originales en `source/` (formato no detallado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8, la familia de detectores de un solo paso de Ultralytics, basada en una columna vertebral convolucional con cuello PAN-FPN y cabezas de predicción sin anchors. El repositorio no entrena un modelo nuevo: convierte checkpoints YOLOv8 al formato RKNN2 mediante RKNN Toolkit2 2.3.2, un proceso que incluye cuantización y calibración para la NPU de Rockchip. La model card menciona exportaciones "guiadas por Rockchip" y exportaciones propias, lo que sugiere una mezcla de artefactos derivados del RKNN Model Zoo oficial y conversiones particulares.

No se especifican en la información disponible el número de tokens ni la composición del dataset de entrenamiento original (corresponde a los datos de Ultralytics para YOLOv8), ni el conjunto de calibración empleado en la cuantización. Tampoco se documentan técnicas de aumento de datos, destilación o ajuste fino posteriores. La única información de trazabilidad es la inclusión de los checkpoints originales, los scripts de conversión y un `weights.json` con su procedencia, además de checksums en el manifiesto para verificar la integridad de `model.rknn` y `metadata.yaml`.

## Capacidades

- Clasificación de imágenes: variantes de la tarea `classify` para etiquetar la clase dominante de una imagen.
- Detección de objetos con cajas orientadas (OBB): variantes `obb` pensadas para objetos rotados, típicas en teledetección o inspección industrial.
- Estimación de pose: variantes `pose` para localizar puntos clave de personas u objetos.
- Inferencia en NPU Rockchip: los binarios `.rknn` están compilados específicamente para RK3576 y RK3588.
- Ejecución en el borde: al ser modelos convolucionales ligeros, están pensados para dispositivos de bajo consumo sin GPU dedicada.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de "thinking": no es un modelo generativo de lenguaje.

## Casos de uso

- Visión artificial en placas RK3588 para videovigilancia: desplegar la variante de detección en la NPU del SoC permite procesar flujos de cámara en tiempo real sin servidor externo, aprovechando los núcleos NPU integrados.
- Inspección industrial con objetos rotados: la variante OBB es adecuada para detectar piezas, vehículos o cultivos en imágenes aéreas donde las cajas alineadas a los ejes pierden precisión.
- Análisis de pose en dispositivos de borde: la variante `pose` sirve para aplicaciones de ergonomía, gimnasia o seguimiento de personas en cámaras IP conectadas a una placa Rockchip.
- Clasificación de imágenes en kioscos o cámaras inteligentes: la tarea `classify` permite filtrar o etiquetar imágenes localmente antes de enviarlas a la nube, reduciendo ancho de banda.
- Prototipado rápido en robótica móvil: un robot con RK3576 puede incorporar detección de obstáculos o personas usando los binarios ya convertidos, sin necesidad de configurar un entorno de conversión RKNN.
- Reproducibilidad y auditoría de despliegues: los checksums del manifiesto y los scripts en `source/` permiten verificar que el binario desplegado corresponde al checkpoint y a la conversión documentados, útil en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP, accuracy, OKS), latencia ni throughput para ninguna de las variantes ni chips.

## Requisitos de hardware

- SoCs objetivo: Rockchip RK3576 y RK3588, que integran NPU dedicada; los binarios `.rknn` no son ejecutables en GPU NVIDIA, CPU x86 genérica ni Apple Silicon.
- VRAM: no aplica; el consumo relevante es la memoria del sistema compartida con la NPU del SoC, cuyo presupuesto exacto no se detalla en la información disponible.
- GPU recomendadas: no aplica; el despliegue es en NPU Rockchip, no en GPU.
- ¿Cabe en consumer GPU? No directamente: el formato RKNN está atado al runtime de Rockchip. Para GPU habría que usar los checkpoints originales en `source/` con otro runtime.
- Opciones de despliegue: runtime RKNN (librería `rknn-toolkit-lite2` / `librnpurt` de Rockchip) sobre el SoC; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tareas | Licencia | Métricas publicadas |
|---|---|---|---|---|---|
| YOLOv8-RKNN2 (este repo) | RKNN | RK3576, RK3588 | classify, obb, pose | AGPL-3.0 | no disponibles |
| RKNN Model Zoo (Rockchip oficial) | RKNN | Familia RK35xx | detección, clasificación, segmentación, pose | según modelo original | parciales en su documentación |
| YOLOv8 original (Ultralytics) | PyTorch, ONNX, etc. | GPU/CPU genéricos | detección, segmentación, clasificación, pose, OBB | AGPL-3.0 | mAP publicados por Ultralytics |
| YOLO11 (Ultralytics) | PyTorch, ONNX, etc. | GPU/CPU genéricos | detección, segmentación, clasificación, pose, OBB | AGPL-3.0 | mAP publicados por Ultralytics |

La comparación directa con el RKNN Model Zoo es la más pertinente, ya que este repositorio parece derivar en parte de él; sin embargo, no se detalla en la model card qué variantes provienen de cada fuente ni en qué difieren las conversiones propias.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay mAP, accuracy, OKS ni latencias publicadas, por lo que no es posible evaluar la pérdida de precisión introducida por la cuantización.
- Trazabilidad incompleta: no se especifica qué variantes (n, s, m, l, x) están incluidas, ni los parámetros exactos de calibración, ni el dataset de calibración.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; su uso en productos o servicios en red puede exigir la liberación del código fuente, lo que la hace inadecuada para muchos despliegues comerciales cerrados.
- Riesgo de sesgo heredado: al derivar de YOLOv8, arrastra los sesgos de los datasets de entrenamiento de Ultralytics (COCO y otros), con posibles fallos en clases poco representadas.
- Sin validación de la comunidad: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión independiente.
- Especificidad de hardware: los binarios solo funcionan en RK3576 y RK3588; no hay garantía de compatibilidad con otras NPU Rockchip (RK3566, RK3568, etc.).
- Sin soporte de idiomas ni texto: no es un modelo de lenguaje; cualquier expectativa de generación de texto, tool calling o agentes es inaplicable.
- Fecha de creación futura en los metadatos (2026-11-10), lo que puede indicar un error de publicación o de reloj y conviene verificar antes de confiar en la versión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLOv8-RKNN2
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ultralytics YOLOv8 (modelo base): https://github.com/ultralytics/ultralytics
