# fireviewer/rfdetr-base-fire-smoke-v1v2-20260927

## Resumen

RF-DETR Base FireViewer V1+V2 es un modelo de deteccion de objetos especializado en la identificacion de humo y llama en imagenes. Se trata de un ajuste fino (fine-tuning) del modelo RF-DETR de Roboflow, desarrollado por el usuario fireviewer, y entrenado sobre un corpus combinado propio denominado FireViewer V1/V2. El modelo resuelve la tarea de deteccion visual de indicios de incendio, distinguiendo dos clases: `smoke_visible` (humo visible) y `flame_visible` (llama visible).

El repositorio distribuye tanto los pesos nativos entrenables (`.pth`) como exportaciones de inferencia en ONNX y LiteRT/TFLite, lo que facilita su despliegue en entornos de servidor (ONNX) y en dispositivos de borde o moviles (LiteRT). El modelo se presenta como una variante "base" dentro de la familia RF-DETR, aunque no se especifica el numero exacto de parametros en la informacion disponible.

La relevancia de esta ficha radica en que se trata de un modelo extremadamente reciente (no registra descargas ni valoraciones) y con licencia no declarada, por lo que su evaluacion tecnica previa a cualquier uso en produccion resulta imprescindible. El entrenamiento se apoyo en un corpus curado con criterios de deduplicacion, validacion humana y exclusion de grupos de validacion y test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion de objetos basado en DETR (familia RF-DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen exportaciones LiteRT/TFLite y ONNX, sin detalle de niveles de cuantizacion) |
| Idiomas soportados | en (etiquetas y metadatos en ingles) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (checkpoint nativo entrenable), ONNX, TFLite (LiteRT) |

## Arquitectura y entrenamiento

Se trata de un modelo de deteccion de objetos basado en la familia RF-DETR de Roboflow (heredera directa del paradigma DETR, Detection Transformer). El checkpoint nativo es entrenable y se conserva en `native/best.pth`; las carpetas `optimized/` y `litert/` contienen unicamente exportaciones para inferencia y no sustituyen al checkpoint de entrenamiento. El script `training/train_rfdetr.py` preserva las opciones exactas de entrenamiento empleadas.

El ajuste fino se realizo sobre un corpus combinado FireViewer V1/V2. Del conjunto de entrenamiento seleccionado se usaron 37357 imagenes, de las cuales 28018 eran positivas y 9339 negativas. El proceso de curacion incluyo: sustitucion de duplicados exactos de V1 por anotaciones de V2, exclusion de los grupos de validacion y test de V1 y de los grupos "gold" de V2, exclusion de vistas de teledeteccion (RS) de V1 y de negativos "consensus-only" de V2, limitacion (cap) al 10% de los positivos de V1 en imagenes aereas con cajas que cubren al menos el 20% del encuadre, y limitacion de negativos al 25% del total de imagenes de entrenamiento. Las etiquetas de V2 estan validadas por humanos o son de alta confianza aprobadas por Bonsai. Las anotaciones de entrenamiento contienen unicamente cajas delimitadoras; no se emplean anotaciones de puntos. Los splits originales de validacion y test se mantuvieron sin cambios. El digest de seleccion es `fc274f1e7a2e5da628f7a869cb1e6aac57410363d682f2169b947d46e78030a1`.

## Capacidades

- Deteccion de objetos en imagenes para dos clases: `smoke_visible` y `flame_visible`.
- Localizacion mediante cajas delimitadoras (bounding boxes) sobre imagenes.
- Exportacion para inferencia en ONNX (`fused_onnx`, `optimized_onnx`) y en LiteRT/TFLite para despliegue en borde.
- Checkpoint nativo reentrenable para ajustes adicionales o continuacion del entrenamiento.
- Integracion declarada con el entorno Cadryl mediante `model-config.json` e `inference-contract.json` y contrato de tensor verificado (`tensor_contract_verified`).
- No se documentan capacidades de segmentacion, clasificacion multiple, tool calling ni procesamiento de lenguaje, al ser un modelo puramente de vision.

## Casos de uso

- Vigilancia forestal automatizada: el modelo puede procesar imagenes captadas por camaras fijas o drones para detectar columnas de humo o focos de llama en etapas tempranas, alertando a los servicios de extincion.
- Monitorizacion industrial de zonas de riesgo: integrado en camaras de planta para detectar humo en almacenes, plantas quimicas o instalaciones con material inflamable.
- Deteccion en tiempo real en dispositivos de borde: gracias a la exportacion LiteRT/TFLite, puede desplegarse en hardware de bajo consumo (camaras inteligentes, Raspberry Pi, dispositivos moviles) sin conexion a servidor.
- Analisis post-incendio de imagenes aereas: el modelo puede aplicarse sobre imagenes de satelite o de dron para cartografiar zonas afectadas y cuantificar la presencia de humo residual.
- Alertas tempranas en infraestructuras criticas: integracion en sistemas de video-vigilancia de tuneles, aparcamientos o plantas fotovoltaicas donde una deteccion temprana de humo puede evitar daños mayores.
- Investigacion y ciencia de datos: uso del checkpoint nativo como base para nuevos ajustes finos con dominios adicionales (nuevos tipos de humo, otras condiciones de iluminacion o sensores).
- Verificacion de imagenes en plataformas ciudadanas: procesado por lotes de reportes fotograficos enviados por usuarios para triar y priorizar alertas de incendio antes de la validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El repositorio ocupa 0,5 GB, por lo que la huella de un solo modelo exportado a ONNX o TFLite sera previsiblemente inferior a 1 GB en memoria.
- GPU recomendadas: no especificadas por el autor. Al tratarse de una variante "base" de un transformer de deteccion, se espera que funcione en GPUs consumer modernas, aunque no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada por el autor; probable en tarjetas con al menos varios GB de VRAM, pero sin cifras verificadas.
- Opciones de despliegue: ONNX Runtime (mediante los ficheros `optimized/` y `fused_onnx`), LiteRT/TFLite en dispositivos de borde, y el entorno propietario Cadryl (con importacion del grafo y pegado de `model-config.json` en su editor de contrato). El checkpoint nativo `.pth` requiere el codigo de entrenamiento de RF-DETR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada para establecer una comparativa rigurosa con alternativas como YOLO (v8/v11) u otros detectores especializados en fuego y humo. A modo orientativo, la familia RF-DETR (Roboflow) es el antecesor directo sobre el que se ha ajustado este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RF-DETR Base FireViewer V1+V2 | no disponible | no aplica | no disponible | HuggingFace (fireviewer) |
| RF-DETR (roboflow/rf-detr, variante base) | no disponible en esta informacion | no aplica | no disponible | HuggingFace (roboflow) |
| Otras alternativas (YOLO, FireNet, etc.) | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El corpus de entrenamiento esta sesgado por la composicion del propio dataset FireViewer, lo que puede afectar al rendimiento en condiciones de imagen distintas a las del corpus (iluminacion, sensores, geografias).
- Riesgo de alucinacion: en deteccion de objetos el riesgo se traduce en falsos positivos (cajas espurias de humo o llama) y falsos negativos. No se reportan tasas de error ni matrices de confusion.
- Limitacion de contexto e idioma: al ser un modelo de vision, no tiene contexto lingueistico; las etiquetas estan en ingles (`smoke_visible`, `flame_visible`). No se documentan capacidades multilingues.
- Licencia no declarada: al no especificarse la licencia del repositorio, no puede afirmarse que el uso comercial este permitido. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Contrato de tensor de LiteRT: el propio autor advierte que `litert_tensor_contract` es `tensor_contract_verified; image_accuracy_not_qualified`, lo que indica que la precision de imagen en la exportacion LiteRT no ha sido cualificada.
- Sin validacion externa: el modelo no registra descargas ni valoraciones y no hay resultados de benchmarks publicados.
- Sin firmas de entrenamiento en el grafo LiteRT: la exportacion LiteRT es solo para inferencia y no admite entrenamiento en dispositivo.
- Fecha de creacion futura (2026-09-29): el repositorio aparece con fechas de creacion y actualizacion posteriores a la fecha actual de consulta, lo que puede indicar manipulacion de metadatos o un error de registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fireviewer/rfdetr-base-fire-smoke-v1v2-20260927
- Modelo base RF-DETR de Roboflow: https://huggingface.co/roboflow/rf-detr
- Dataset FireViewer V1: https://huggingface.co/datasets/fireviewer/fire-smoke-detection-corpus-v1
- Dataset FireViewer V2: https://huggingface.co/datasets/fireviewer/fire-smoke-detection-corpus-v2
