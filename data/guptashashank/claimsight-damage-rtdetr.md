# guptashashank/claimsight-damage-rtdetr

## Resumen

ClaimSight damage detector es un modelo de detección de objetos especializado en daños de carrocería, desarrollado por el usuario `guptashashank` como componente del proyecto ClaimSight, una herramienta de triaje de siniestros de automóvil. Se trata de un fine-tuning completo de RT-DETRv2 con backbone ResNet-18 (PekingU/rtdetr_v2_r18vd), una arquitectura transformer de detección en tiempo real que prescinde de las anchor boxes y de la supresión no máxima (NMS) tradicional.

El modelo detecta ocho clases de daño: `broken_part`, `corrosion`, `crack`, `dent`, `flaking`, `missing_part`, `paint_chip` y `scratch`. Su función dentro del pipeline es localizar las cajas de daño, que después se emparejan con las piezas del vehículo detectadas por un modelo independiente (OWLv2) para alimentar la estimación del siniestro.

Es relevante ahora por su honestidad metodológica: el autor documenta explícitamente que el modelo es débil (mAP@[.50:.95] de 0,0757) y que debe tratarse como una señal para revisión humana, no como una medición. Resulta útil como referencia reproducible de un pipeline de visión para seguros con datos de licencia permisiva (CC0), y como ejemplo de los límites de los detectores de daño fino a resoluciones de 640 px.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (transformer de detección end-to-end, sin NMS), backbone ResNet-18 |
| Parámetros totales | 20.117.268 (20,1 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imagen 640 x 640 px |
| Tipos de cuantización | no disponible (pesos en safetensors; admitiría cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin componente de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning end-to-end de `PekingU/rtdetr_v2_r18vd`, un detector RT-DETRv2 con backbone ResNet-18. RT-DETRv2 es una arquitectura de detección basada en transformer que formula la detección como un problema de predicción de conjuntos, eliminando la necesidad de anchors y de NMS en posprocesado. El backbone ResNet-18 mantiene el coste computacional bajo, lo que explica los 20,1 M de parámetros totales.

El entrenamiento usó la mitad de daños del dataset "Car Parts and Car Damages" de Humans in the Loop, publicado bajo CC0 1.0 (copia en `DrBimmer/car-parts-and-damage-dataset`): 814 fotos, 8 clases y unas 11 cajas por foto. Los polígonos originales se convirtieron a sus bounding boxes. El split es 80/10/10 por hash del nombre de fichero: 651 de entrenamiento, 69 de validación y 94 de test. Se entrenó a 640 x 640 durante 30 épocas con AdamW y scheduler one-cycle (lr 1e-4, backbone 1e-5), conservando el mejor checkpoint de validación (época 17). El coste fue de unos 100 minutos en un Apple M4. El autor descarta CarDD pese a que sus etiquetas encajan mejor con el dominio de seguros, porque su licencia exige consentimiento firmado del laboratorio y prohíbe la redistribución.

## Capacidades

- Detección de daños de carrocería en ocho clases: `broken_part`, `corrosion`, `crack`, `dent`, `flaking`, `missing_part`, `paint_chip` y `scratch`.
- Salida de cajas delimitadoras con puntuación de confianza por detección, en formato compatible con el pipeline `object-detection` de Transformers.
- Integración directa con `transformers.pipeline("object-detection", ...)` y con endpoints compatibles.
- Uso como etapa de localización dentro de un pipeline mayor: las cajas de daño se emparejan con piezas detectadas por un modelo zero-shot separado (OWLv2).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es exclusivamente un detector de imágenes.
- Capacidad multilingüe no aplicable (sin procesamiento de lenguaje).

## Casos de uso

- Triaje de siniestros en seguros: el modelo localiza daños en la foto enviada por el asegurado y el pipeline los empareja con piezas para generar una primera estimación; adecuado porque automatiza el cribado inicial con revisión humana posterior, tal como lo usa ClaimSight.
- Preetiquetado para anotación: dado su bajo coste (20,1 M de parámetros), puede generar propuestas de cajas que los anotadores corrigen, acelerando la creación de datasets de daños mayoritarios (scratch, dent), con la advertencia de que la precisión a umbral 0,5 es del 36 %.
- Demostración y validación de pipelines de visión: sirve para verificar de extremo a extremo la integración detección de daño + detección de pieza + estimación, sin depender de datos con licencia restrictiva.
- Detección de daños gruesos (piezas rotas o ausentes): es donde el modelo rinde mejor (AP 0,201 en `missing_part` y 0,161 en `broken_part`), por lo que encaja en flujos que solo necesitan señalar daños evidentes.
- Investigación sobre límites de resolución: útil como caso de estudio reproducible de por qué el daño fino (paint chip, flaking, scratch) no es aprendible a 640 px con 814 imágenes.
- Filtrado previo en aplicaciones móviles: el tamaño reducido permite ejecución en dispositivos modestos para descartar fotos sin daño evidente antes de enviarlas a un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), AP estilo COCO sobre las 94 fotos de test (1.086 cajas), top 100 detecciones por foto, imágenes reducidas a 800 px de lado antes del resize a 640 px:

| Clase | AP | AP50 | Cajas en test |
|---|---|---|---|
| **all (mAP)** | **0,076** | **0,129** | 1.086 |
| missing part | 0,201 | 0,338 | 57 |
| broken part | 0,161 | 0,291 | 161 |
| dent | 0,058 | 0,143 | 169 |
| crack (muestra insuficiente) | 0,126 | 0,126 | 2 |
| scratch | 0,035 | 0,089 | 482 |
| corrosion | 0,014 | 0,024 | 35 |
| paint chip | 0,004 | 0,012 | 145 |
| flaking | 0,006 | 0,011 | 35 |

Métricas operativas al umbral 0,5 (el usado por ClaimSight): unas 4 cajas por foto, 36 % correctas (IoU 0,5 y clase correcta), con al menos una caja correcta en 72 de 94 fotos. A umbral 0,3 devuelve unas 26 cajas por foto con 13 % de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 20,1 M de parámetros, más el overhead de activaciones a 640 x 640; holgadamente por debajo de 2 GB en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4090, A100 o H100 son sobradas. También es viable en CPU para inferencia por lotes moderados.
- Cabe en cualquier GPU consumer y en hardware integrado; el entrenamiento de referencia se hizo en un Apple M4 en unos 100 minutos.
- Opciones de despliegue: `transformers` (pipeline `object-detection`), endpoints compatibles de Hugging Face, exportación a ONNX/TensorRT no documentada por el autor pero factible por la arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Rendimiento |
|---|---|---|---|---|---|
| claimsight-damage-rtdetr | 20,1 M | Detección de daños (8 clases) | 640 x 640 px | Apache-2.0 | mAP 0,076 / AP50 0,129 |
| PekingU/rtdetr_v2_r18vd (base) | ~20 M | Detección de objetos COCO (80 clases) | 640 x 640 px | Apache-2.0 | no disponible en esta ficha |
| OWLv2 (usado en ClaimSight para piezas) | no disponible | Detección zero-shot texto-imagen | variable | no disponible | no disponible |
| Detectores de daño basados en CarDD | no disponible | Detección de daños | variable | requiere consentimiento del laboratorio | no disponible |

La comparación con alternativas específicas de detección de daños de vehículo no está disponible en la información proporcionada; el propio autor señala que CarDD sería un dataset más adecuado pero su licencia impide la redistribución.

## Limitaciones y advertencias

- Rendimiento débil: mAP@[.50:.95] de 0,076 y AP50 de 0,129; el autor lo describe explícitamente como insuficiente para valorar una reparación.
- El daño fino o pequeño (scratch, paint chip, flaking, corrosion) no se aprende a esta resolución: la caja de un polígono contiene sobre todo pintura intacta y a 640 px un chip ocupa pocos píxeles.
- La validación se estancó en mAP ≈ 0,06 desde la época 11; el autor indica que la solución pasa por más datos, tiling o mayor resolución de entrada, no por más épocas.
- Dataset pequeño (814 fotos) y mayoritariamente de primeros planos; no se ha probado con fotos de siniestro tomadas por conductores.
- Las etiquetas describen el daño, no la pieza; la localización de piezas depende de un modelo externo (OWLv2), lo que añade una fuente de error al pipeline.
- Riesgo de falsos positivos alto a umbrales bajos: a 0,3 devuelve unas 26 cajas por foto con 13 % de precisión.
- Licencia Apache-2.0 permisiva para uso comercial, pero la debilidad del modelo y la ausencia de validación en dominio real desaconsejan su uso en producción sin revisión humana.
- Sesgos conocidos: no documentados por el autor; la composición del dataset (primeros planos, CC0) puede no representar la distribución de fotos reales de siniestros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guptashashank/claimsight-damage-rtdetr
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r18vd
- Dataset: https://huggingface.co/datasets/DrBimmer/car-parts-and-damage-dataset
- Repositorio del proyecto ClaimSight: https://github.com/shashankgupta0998/claimsight
