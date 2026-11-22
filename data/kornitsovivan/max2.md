# kornitsovivan/max2

## Resumen

`kornitsovivan/max2` es un modelo de detección de objetos publicado en Hugging Face por el usuario kornitsovivan. Se distribuye en formato ONNX (`weights.onnx`) y está especializado en un dominio muy concreto: la detección de elementos de estaciones de servicio, con cuatro clases definidas (surtidor de combustible, manguera de combustible, marquesina y panel de precios). No es un modelo de lenguaje ni un modelo fundacional multimodal, sino un detector específico de visión por computador.

La información pública disponible es mínima. El repositorio tiene un tamaño declarado de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la model card apenas describe las clases detectadas y los ficheros que acompañan a los pesos (`miner.py` para inferencia y `chute_config.yml` para el despliegue). No se especifican arquitectura base, número de parámetros, resolución de entrada, datos de entrenamiento ni métricas de evaluación.

Su relevancia es por tanto acotada y de nicho: puede resultar útil como componente de un pipeline de inspección o inventariado de gasolineras, pero carece de la documentación y el respaldo comunitario que se exigen habitualmente para adopción en producción. Cualquier evaluación rigurosa requeriría inspeccionar directamente el grafo ONNX y ejecutar inferencia sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal exportada a ONNX; arquitectura base no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente `weights.onnx`) |
| Idiomas soportados | no disponible (no aplica a la tarea de detección) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El único dato técnico es que se distribuye como grafo ONNX (`weights.onnx`), lo que permite su ejecución con runtimes como ONNX Runtime, OpenVINO o TensorRT, pero no revela si se trata de un detector de una etapa (familia YOLO, SSD, RetinaNet) o de dos etapas (familia Faster R-CNN). Tampoco se indica la resolución de entrada esperada ni el esquema de post-procesado (NMS, anchors, keypoints).

Respecto al entrenamiento, no hay datos sobre volumen de imágenes, composición del dataset, técnicas de aumento de datos, función de pérdida ni proceso de ajuste. La model card menciona un parámetro `n_keypoints` en la función `predict_batch`, lo que sugiere que el modelo podría predecir puntos clave además de cajas delimitadoras, pero no se detalla cuántos ni con qué semántica.

## Capacidades

- Detección de objetos en imágenes con cuatro clases: surtidor de combustible (`petrol pump`), manguera de combustible (`petrol hose`), marquesina (`roof canopy`) y panel de precios (`price board`).
- Inferencia por lotes mediante la API `Miner(path).predict_batch(batch_images, offset, n_keypoints)` incluida en `miner.py`.
- Posible predicción de puntos clave, a juzgar por el parámetro `n_keypoints` de la función de inferencia (sin confirmar).
- Ejecución mediante ONNX Runtime u otros runtimes compatibles con ONNX.
- Empaquetado para despliegue como imagen de servicio mediante `chute_config.yml`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Inventariado de estaciones de servicio: el modelo puede detectar surtidores y mangueras en fotografías aéreas o terrestres para construir un censo automatizado de instalaciones, aprovechando que las clases están definidas específicamente para ese dominio.
- Inspección de mantenimiento de mangueras: integrado en una app de campo, permite señalar la posición de las mangueras en la imagen para que el operario documente su estado; la detección acota la región de interés antes de una revisión manual.
- Verificación de señalización de precios: la clase `price board` permite localizar paneles de precios en la imagen, paso previo a un OCR que extraiga los importes y los compare con los publicados.
- Análisis de cobertura de marquesinas: la detección de `roof canopy` facilita estudios de imagen de marca y visibilidad en carretera a partir de imágenes de Street View o similares.
- Automatización de auditorías de red minorista: combinado con geolocalización, permite clasificar y contar activos por estación en procesos de auditoría de franquicias.
- Prototipado rápido en visión: al estar en ONNX, se puede integrar en un servicio Python o en el navegador con ONNX Runtime Web para demos de detección sin depender de frameworks de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no conocerse el número de parámetros ni la resolución de entrada, no es posible estimarla.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de detección de objetos, es probable que funcione en GPUs modestas, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del tamaño real del grafo, que no se ha publicado.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), y potencialmente OpenVINO o TensorRT previa conversión; el repositorio incluye `chute_config.yml` para despliegue como servicio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kornitsovivan/max2 | Detección de objetos (4 clases de gasolinera) | no disponible | no aplica | AGPL-3.0 | Hugging Face, ONNX |
| YOLOv8 / YOLO11 (Ultralytics) | Detección de objetos genérica | variable (n/s/m/l/x) | no aplica | AGPL-3.0 | Hugging Face, GitHub, pip |
| RT-DETR (Peking University / Baidu) | Detección de objetos genérica | variable | no aplica | Apache-2.0 (según variante) | Hugging Face, GitHub |
| DETR (Meta) | Detección de objetos genérica | ~41 M (ResNet-50) | no aplica | Apache-2.0 | Hugging Face, GitHub |

La comparación es estructural: los tres alternativos son detectores de propósito general con documentación extensa, pesos en múltiples formatos y métricas publicadas (COCO AP). `max2` es un detector de nicho sin métricas ni arquitectura documentadas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conoce arquitectura, tamaño, resolución de entrada ni esquema de post-procesado, lo que dificulta la integración y el diagnóstico de errores.
- Sin métricas publicadas: no hay mAP, precisión, recall ni curvas PR, por lo que no se puede evaluar su calidad frente a alternativas.
- Dominio muy restringido: solo cuatro clases de estaciones de servicio; fuera de ese contexto su utilidad es nula.
- Riesgo de alucinación en detección: como cualquier detector, puede producir falsos positivos y falsos negativos, especialmente con oclusiones, iluminación adversa o ángulos no vistos en entrenamiento.
- Licencia AGPL-3.0: el uso en servicios de red implica obligaciones de liberación del código fuente derivado; es una licencia copyleft fuerte que puede ser incompatible con productos propietarios.
- Sin comunidad: cero descargas y cero likes en el momento de la consulta; no hay issues, discusiones ni casos de uso reportados que permitan validar su funcionamiento.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la integridad del repositorio antes de confiar en él.
- No se especifican sesgos ni limitaciones idiomáticas porque la tarea no es lingüística, pero tampoco se documenta la diversidad geográfica o de condiciones del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/max2
- Ficheros del repositorio: `weights.onnx`, `miner.py`, `chute_config.yml` (disponibles en la pestaña "Files and versions" del repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
