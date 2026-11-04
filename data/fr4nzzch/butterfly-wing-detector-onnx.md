# fr4nzzch/butterfly-wing-detector-onnx

## Resumen

Butterfly wing detector es un modelo de segmentación de instancias en formato ONNX que delimita las alas y el cuerpo de una mariposa en una fotografía. Lo desarrolla el usuario fr4nzzch y constituye el primer eslabón de una cadena de identificación offline de mariposas integrada en la aplicación Ikiam Insectary, donde se ejecuta directamente en el navegador mediante onnxruntime-web. Su función es generar un recorte ajustado al insecto que después alimenta a un codificador de imagen (BioCLIP 2.5 ViT-H/14 o un modelo pequeño propio) y a un clasificador taxonómico.

El modelo es un fine-tune de Ultralytics YOLO26n-seg (variante nano), exportado a ONNX a 640 px con la supresión de no máximos (NMS) integrada en el grafo. Detecta una única clase, el insecto, y devuelve tanto cajas como máscaras, lo que permite descartar artefactos rectangulares y duplicados antes de calcular el recorte final.

Su relevancia es acotada pero clara: demuestra un pipeline completo de visión por computador que corre en el dispositivo del usuario sin subir fotografías a ningún servidor, con un peso de 11 MB y una licencia AGPL-3.0 heredada de Ultralytics. No es un modelo de propósito general ni compite en benchmarks de segmentación abiertos; es una pieza de ingeniería especializada dentro de una aplicación de identificación biológica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-seg (Ultralytics), red de segmentación de instancias con detección y prototipos de máscara |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX float32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`wing_seg_v5n.onnx`, 11.028.475 bytes) |

Especificaciones de entrada y salida del grafo:

| Parametro | Valor |
|---|---|
| Entrada | `images`, float32 `[1, 3, 640, 640]`, RGB en rango 0..1, letterbox estilo Ultralytics (redimensionado bilineal, centrado, relleno gris 114) |
| Salida de detecciones | `[1, 300, 38]`: x1, y1, x2, y2, score, clase, 32 coeficientes de máscara; NMS incluida en el grafo con IoU 0.6 |
| Salida de prototipos | `[1, 32, 160, 160]` |
| Clases | 1 (el insecto) |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es una red YOLO de segmentación de instancias en su variante nano (YOLO26n-seg), entrenada con Ultralytics 8.4. El modelo predice simultáneamente cajas delimitadoras, puntuaciones de confianza y coeficientes de máscara que se combinan linealmente con los prototipos de máscara para reconstruir la silueta del insecto. La NMS se ejecuta dentro del grafo ONNX con un umbral de IoU de 0.6, de modo que el consumidor recibe detecciones ya depuradas.

El fine-tune se realizó entre el 17 y el 18 de octubre de 2026 sobre contornos de mariposa revisados manualmente: placas de alas separadas fotografiadas en el Sanger Institute y en Ikiam, junto con fotografías de campo y de museo de mariposas procedentes de fuentes públicas, con aumento de rotación de cuarto de vuelta. Las imágenes de entrenamiento no se distribuyen en el repositorio, en parte porque muchas son fotografías de terceros con sus propias licencias. No se documentan en la información disponible el número de imágenes, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales más allá del fine-tune supervisado sobre el modelo base.

## Capacidades

- Segmentación de instancias de mariposas: genera máscaras y cajas delimitadoras del ala y el cuerpo del insecto.
- Detección con una sola clase (el insecto), sin distinción taxonómica.
- NMS integrada en el grafo ONNX (IoU 0.6) y salida limitada a 300 detecciones.
- Ejecución en navegador mediante onnxruntime-web, con todo el procesamiento en el dispositivo del usuario.
- Preprocesado estandarizado tipo Ultralytics (letterbox a 640 px, relleno gris 114).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Identificación offline de mariposas en aplicación web: el modelo recorta la mariposa de la foto y el recorte se pasa al codificador de imagen (BioCLIP 2.5 ViT-H/14 a 224 px o el modelo pequeño a 192 px) y al clasificador taxonómico; todo ocurre en el navegador sin subir la imagen.
- Aplicaciones de ciencia ciudadana en campo: observadores que fotografían mariposas en zonas sin cobertura pueden obtener una identificación preliminar en el dispositivo, con la ventaja de que las fotos no salen del teléfono.
- Preprocesado para pipelines de clasificación biológica: el recorte ajustado reduce el ruido de fondo y mejora la entrada del codificador de imagen, lo que es útil cuando el clasificador se entrena con recortes limpios.
- Catalogación de colecciones entomológicas: fotografías de placas de alas separadas, el dominio de entrenamiento principal, pueden segmentarse para extraer cada espécimen de forma automática antes de la revisión manual.
- Filtrado y curaduría de datasets: el modelo puede usarse para detectar y recortar mariposas en lotes de imágenes de campo, descartando las que no contienen un insecto claro (cuando la puntuación es baja, la aplicación recurre al 90 % central de la foto).
- Demostración educativa de despliegue de visión en el navegador: sirve como ejemplo reproducible de exportación ONNX con NMS embebida y de integración con onnxruntime-web en una aplicación real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11 MB de pesos en float32 y entrada de 640×640, la huella es muy reducida y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU o GPU del navegador vía onnxruntime-web (WebGL o WebGPU según el backend disponible).
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño nano del modelo.
- Opciones de despliegue: onnxruntime-web (navegador), ONNX Runtime nativo, y cualquier runtime compatible con ONNX; no se documentan exportaciones a otros formatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Butterfly wing detector (este modelo) | YOLO26n-seg fine-tune, ONNX | 11 MB (pesos ONNX) | no aplica | AGPL-3.0 | HuggingFace |
| Ultralytics YOLO26n-seg base | Segmentación de instancias general | no disponible | no aplica | AGPL-3.0 | GitHub de Ultralytics |
| fr4nzzch/bioclip-2.5-vith14-visual-int8-onnx | Codificador de imagen (no detector) | no disponible | no aplica | no disponible | HuggingFace |
| fr4nzzch/butterfly-id-small-onnx | Codificador de imagen pequeño (no detector) | no disponible | no aplica | no disponible | HuggingFace |

La comparación directa con otros detectores de mariposas no está disponible en la información proporcionada. Los modelos de la misma familia (BioCLIP y el clasificador) no son alternativas sino componentes posteriores del mismo pipeline.

## Limitaciones y advertencias

- Entrenado para mariposas fotografiadas con alas abiertas o sobre placas; las alas cerradas, varias mariposas en una misma foto, polillas y otros insectos pueden producir contornos deficientes.
- Cuando la confianza es baja, la aplicación avisa de que no ha encontrado las alas con claridad y recurre al 90 % central de la foto, lo que degrada la identificación posterior.
- Una sola clase: no distingue especies ni sexos; esa tarea recae en el clasificador.
- Licencia AGPL-3.0: cualquier uso en red del modelo o de código derivado obliga a liberar el código correspondiente bajo la misma licencia; es una restricción relevante para uso comercial propietario.
- El repositorio incluye el código de la aplicación web que carga y ejecuta el modelo (`source/`), también bajo AGPL-3.0.
- No se documentan sesgos demográficos (no aplica), pero sí un sesgo de dominio claro hacia fotos de mariposas con alas abiertas y hacia las condiciones de iluminación de las fuentes de entrenamiento.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo puede segmentar objetos que no son mariposas; la aplicación mitiga esto con el umbral de 0.25 y el descarte de artefactos y duplicados.
- No se especifican requisitos de idioma ni de contexto porque el modelo no procesa texto.
- No hay información sobre cuantizaciones alternativas ni sobre el rendimiento en hardware concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fr4nzzch/butterfly-wing-detector-onnx
- Aplicación Ikiam Insectary: https://ithomiini-ikiam.com/identificar/
- Codificador BioCLIP 2.5 ViT-H/14 (int8 ONNX): https://huggingface.co/fr4nzzch/bioclip-2.5-vith14-visual-int8-onnx
- Modelo pequeño de identificación: https://huggingface.co/fr4nzzch/butterfly-id-small-onnx
- Clasificador: https://huggingface.co/fr4nzzch/butterfly-id-classifier
- Licencia de Ultralytics: https://github.com/ultralytics/ultralytics/blob/main/LICENSE
