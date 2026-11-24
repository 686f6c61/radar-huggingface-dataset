# softandsweet/roboflow-rf-detr-base-rngd-fxbx

## Resumen

RF-DETR Base · FuryAwesome es un paquete de despliegue para detección de objetos derivado del modelo Roboflow/rf-detr-base, adaptado por el usuario softandsweet para ejecutarse sobre el acelerador NPU Furiosa RNGD mediante el SDK de Furiosa. No se trata de un modelo entrenado desde cero ni de un fine-tuning con nuevos datos: la model card indica explícitamente que los pesos originales se cargan desde Hugging Face y que el paquete aporta la integración con el runtime de la NPU. El pipeline declarado es object-detection y la licencia es Apache 2.0.

El modelo resuelve la inferencia de detección de objetos sobre imágenes de 560×560 píxeles, devolviendo nombre de clase y caja delimitadora para cada objeto detectado. Su relevancia es acotada pero específica: demuestra la portabilidad de un detector basado en transformer (RF-DETR, la familia de detectores de Roboflow construida sobre DETR) a hardware NPU no convencional, con métricas de validación publicadas frente a una referencia en CPU FP32.

La información disponible es muy limitada: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, no declara idiomas soportados y la model card está redactada en coreano. Los datos de rendimiento se refieren exclusivamente a la latencia de inferencia en la NPU, no a métricas de precisión sobre un conjunto de evaluación estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de detección de objetos (RF-DETR, familia DETR de Roboflow); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imagen 560×560 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el paquete carga el checkpoint original desde Hugging Face; el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

El modelo base es Roboflow/rf-detr-base, un detector de objetos de la familia RF-DETR, que sigue el paradigma DETR (DEtection TRansformer): un backbone visual extrae características y un decodificador transformer produce un conjunto fijo de consultas (queries) que se traducen en clases y cajas delimitadoras. La model card menciona explícitamente "consultas" (queries) al describir las discrepancias numéricas entre la NPU y la CPU, lo que confirma esta arquitectura.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si hubo ajuste fino posterior. Este repositorio concreto no aporta entrenamiento nuevo: es un artefacto de despliegue que adapta el checkpoint de Roboflow al runtime Furiosa RNGD. La innovación técnica declarada es la ejecución del grafo de inferencia en la NPU con compilación en tiempo de ejecución nula ("런타임 컴파일 0건") y sin fallback a CPU ("CPU 폴백 0건") en las pruebas realizadas, con 226 operaciones trazadas en la NPU.

## Capacidades

- Detección de objetos en imágenes de 560×560 píxeles, devolviendo clase y caja delimitadora por objeto.
- Ejecución de la inferencia sobre NPU Furiosa RNGD mediante el SDK de Furiosa 2026.4.0.
- Trazado completo del grafo en la NPU: 226 operaciones trazadas, 0 fallbacks a CPU y 0 compilaciones en tiempo de ejecución en la validación publicada.
- Correspondencia funcional con la referencia CPU FP32: mismo número de detecciones y mismas clases para umbral de score 0.5 en las dos imágenes de prueba.
- No se declaran capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o lenguaje.

## Casos de uso

- Despliegue de detección de objetos en hardware Furiosa RNGD: el paquete permite ejecutar un detector DETR en una NPU dedicada sin reescribir el pipeline, cargando los pesos originales de Roboflow y usando el SDK de Furiosa para el grafo compilado.
- Inspección visual en el borde con latencia baja: con una latencia P50 de 14,45 ms por petición (excluyendo preprocesado y postprocesado), encaja en tareas de conteo o localización de objetos en flujos de vídeo o captura industrial donde se requiere respuesta en decenas de milisegundos.
- Validación de portabilidad de modelos: sirve como referencia para equipos que quieran comprobar si un detector transformer mantiene la coherencia de detecciones al migrar de CPU a NPU, usando los valores de IoU publicados (0,9908 y 0,9940) como criterio de aceptación.
- Prototipado de pipelines de visión en entornos con aceleradores no NVIDIA: al no depender de CUDA, el paquete abre la puerta a integrar detección de objetos en infraestructura basada en NPU Furiosa.
- Preprocesado de datasets de imagen: uso del detector para generar cajas y etiquetas preliminares sobre imágenes de 560×560 antes de una revisión humana, aprovechando que las detecciones coinciden con la referencia CPU.
- Pruebas de regresión de runtime: comparación de logits y cajas entre la NPU y la CPU FP32 para detectar desviaciones numéricas; la model card advierte de que los elementos por consulta de logits y cajas crudos no coinciden con CPU, lo que lo hace útil como caso de prueba de tolerancia numérica.

## Benchmarks y rendimiento

La model card solo publica métricas de validación de la integración con la NPU, no benchmarks de precisión estándar (COCO mAP, etc.).

| Métrica | Valor |
|---|---|
| Latencia P50 por petición (NPU, sin pre/postprocesado) | 14,45 ms |
| Operaciones trazadas en NPU | 226 |
| Fallbacks a CPU | 0 |
| Compilaciones en tiempo de ejecución | 0 |
| Coincidencia de detecciones (score ≥ 0,5) frente a CPU FP32 | Mismo número y mismas clases en 2 imágenes |
| IoU de cajas, imagen 1 | 0,9908 |
| IoU de cajas, imagen 2 | 0,9940 |
| Coincidencia de logits y cajas crudos por consulta | No coinciden con CPU |

No se han publicado resultados de benchmarks estándar (COCO, LVIS u otros) en la información disponible.

## Requisitos de hardware

- Acelerador objetivo: NPU Furiosa RNGD, con SDK de Furiosa versión 2026.4.0.
- VRAM estimada: no disponible (no se declara tamaño de pesos ni memoria requerida).
- GPU recomendadas: no aplica para este paquete; el despliegue declarado es sobre NPU Furiosa. Para ejecutar el modelo base en GPU no hay datos en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime de Furiosa con el SDK 2026.4.0; la model card enlaza un archivo USAGE.md con ejemplo en Python y servicio de inferencia.
- Latencia: P50 de 14,45 ms por petición en NPU, excluyendo preprocesado y postprocesado. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| softandsweet/roboflow-rf-detr-base-rngd-fxbx | RF-DETR (DETR) | Imagen 560×560 | Apache 2.0 | NPU Furiosa RNGD | Paquete de despliegue; latencia P50 14,45 ms |
| Roboflow/rf-detr-base | RF-DETR (DETR) | Imagen 560×560 | no disponible en esta ficha | Checkpoint original en Hugging Face | Modelo base del que deriva este paquete |
| Alternativas DETR/DETR-like de propósito general | Transformer de detección | Variable | Variable | GPU/CPU | No se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de datos de rendimiento comparativo (mAP, latencia en el mismo hardware) con otros detectores en la información disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios (tamaño 0.0 GB): depende de la carga del checkpoint original desde Hugging Face, lo que introduce una dependencia de red y de disponibilidad del modelo base.
- La validación publicada se limita a dos imágenes reales y a un umbral de score de 0,5; no hay evaluación sobre un conjunto de test amplio ni métricas de mAP.
- Los logits y las cajas crudos por consulta no coinciden con la referencia CPU FP32; solo coinciden las detecciones tras el postprocesado con umbral. Cualquier uso que dependa de los valores numéricos crudos (por ejemplo, calibración fina o ensembles) debe tratarse con cautela.
- La latencia de 14,45 ms excluye preprocesado y postprocesado, por lo que la latencia extremo a extremo será mayor.
- No se declaran idiomas ni capacidades de lenguaje: es exclusivamente un modelo de visión.
- No hay información sobre sesgos del dataset de entrenamiento original, clases soportadas ni dominio de aplicación previsto; el riesgo de falsos negativos o positivos en dominios alejados de los datos de Roboflow no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y los términos del modelo base Roboflow/rf-detr-base, no detallados en esta ficha.
- El paquete está atado a una versión concreta del SDK de Furiosa (2026.4.0); cambios de versión pueden romper la integración.
- La model card está en coreano y la documentación adicional (USAGE.md, VALIDATION.json, NOTICE.md) no se ha podido consultar en detalle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/roboflow-rf-detr-base-rngd-fxbx
- Modelo base: https://huggingface.co/Roboflow/rf-detr-base
- Documentación de uso (referenciada en la model card): USAGE.md dentro del repositorio
- Datos de validación (referenciados): VALIDATION.json dentro del repositorio
- Aviso de origen y licencia (referenciado): NOTICE.md dentro del repositorio
