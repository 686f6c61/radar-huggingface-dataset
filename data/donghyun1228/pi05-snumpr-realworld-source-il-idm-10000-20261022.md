# Donghyun1228/pi05-snumpr-realworld-source-il-idm-10000-20261022

## Resumen

Este repositorio de HuggingFace, publicado por el usuario Donghyun1228, contiene un modelo de la familia **pi05** (etiquetado con `openpi`, `robotics` y `ur10e`) orientado a manipulación robótica: recibe imágenes RGB y estado proprioceptivo y produce acciones de efector final. Según la model card, se trata de una continuación de entrenamiento del VLA original de SNUMPR, con 10.000 updates adicionales retenidos, batches globales de 32 tanto para el modelo de imitación (IL) como para el modelo de dinámica inversa (IDM), learning rate de 1e-5 y sin EMA.

El dato crítico es que **el repositorio no es utilizable**: el propio autor indica que la subida está incompleta y que no contiene un checkpoint funcional completo. Los commits del checkpoint fueron rechazados por superar la cuota de almacenamiento público de la cuenta, y el checkpoint nativo en `native/9999/params` no se ha publicado. El repositorio pesa 7,8 GB, pero ese tamaño no corresponde a un conjunto de pesos descargable y verificable.

Por tanto, la ficha describe el estado real del artefacto: metadatos parciales, verificación interna del entrenamiento (51 tensores de parámetros, momentos y contadores de Adam, normalización sin cambios) y una configuración de datos y modelo declarada, pero sin pesos, sin licencia y sin ninguna evaluación de éxito en robot real. No es un modelo para producción ni para réplica experimental en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia pi05, adaptación del VLA original de SNUMPR; detalle interno de capas no disponible |
| Parametros totales | no disponible (se citan 51 tensores de parámetros verificados, sin recuento de parámetros) |
| Parametros activos | no procede / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card menciona la ruta `native/9999/params`, publicada |
| Entrada | imágenes RGB, 6 ángulos articulares en radianes |
| Salida | 7 coordenadas físicas de efector final (acción) |
| Frecuencia de control | 30 Hz |
| Horizonte de acción | 32 pasos |
| Tamaño del repositorio | 7,8 GB (metadatos parciales, sin checkpoint completo) |
| Pipeline declarado | robotics |
| Estado del artefacto | subida incompleta, sin checkpoint utilizable |

## Arquitectura y entrenamiento

La información disponible describe un modelo vision-language-action de la familia pi05, integrado en el ecosistema `openpi` y destinado a un robot UR10e. La model card no detalla el número de capas, el backbone visual, el mecanismo de atención ni el esquema de generación de acciones (por ejemplo, flow matching o tokens discretos), por lo que estos aspectos quedan como no disponibles. Lo que sí se especifica es el contrato de datos: observaciones RGB, seis ángulos articulares en radianes como estado proprioceptivo, siete coordenadas de efector final como acción, control a 30 Hz y un horizonte de acción de 32 pasos.

El entrenamiento declarado consiste en 10.000 updates adicionales retenidos sobre el VLA original de SNUMPR. Se usaron batches globales de 32 para el modelo de imitación y de 32 para el modelo de dinámica inversa (IDM), con learning rate de 1e-5 y sin EMA. El autor afirma haber verificado de forma independiente en CPU los 51 tensores de parámetros, los momentos y contadores completos de Adam y la normalización sin cambios. No se indica el volumen de datos, la composición del dataset, ni si hubo etapas de RLHF o DPO; en robótica de manipulación estos modelos suelen entrenarse con aprendizaje por imitación supervisado, lo que es coherente con la terminología "IL" empleada, pero no se confirma en la documentación.

## Capacidades

- Generación de acciones de manipulación de efector final (7 coordenadas) a partir de observaciones RGB y estado articular, con horizonte de 32 pasos y frecuencia de 30 Hz.
- Modelo de imitación (IL) como política de control para un UR10e, según la configuración declarada.
- Modelo de dinámica inversa (IDM) entrenado en paralelo, presumiblemente para etiquetado o derivación de acciones a partir de transiciones, aunque su función exacta no se documenta.
- Adaptación a nuevos dominios: la model card indica que los modelos objetivo son adaptaciones independientes de esta fuente, lo que sugiere uso como punto de partida para fine-tuning.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni soporte multilingüe.
- No se documenta ningún modo de "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación en aprendizaje por imitación para manipulación con UR10e: el modelo serviría como punto de partida para fine-tuning sobre demostraciones propias, aprovechando la configuración de 30 Hz y horizonte 32 declarada. Requiere que se publique el checkpoint, hoy ausente.
- Base para adaptaciones independientes: el autor describe los modelos objetivo como adaptaciones de esta fuente, de modo que este artefacto funcionaría como inicialización para nuevas políticas de tarea.
- Etiquetado de trayectorias mediante el IDM: un modelo de dinámica inversa permite inferir acciones a partir de pares de observaciones, útil para anotar datos retargeteados o no etiquetados en pipelines de recogida de datos.
- Reproducción de experimentos de entrenamiento: los hiperparámetros publicados (batch 32/32, lr 1e-5, sin EMA, 10.000 updates) permiten intentar replicar la continuación de entrenamiento descrita, siempre que se disponga del VLA original de SNUMPR.
- Evaluación comparativa de políticas VLA en entornos simulados: el contrato de entrada/salida (RGB + 6 articulaciones, 7 coordenadas de acción) es suficientemente explícito para integrarlo en un banco de pruebas, aunque no hay métricas publicadas.
- Auditoría y verificación de artefactos: la política de publicación del autor (revisión inmutable y lectura anónima de ficheros completos) es un caso práctico de control de calidad para repositorios de modelos en entornos con cuotas limitadas.
- Docencia y divulgación sobre ciclo de vida de modelos robóticos: el repositorio ilustra de forma explícita la diferencia entre "entrenamiento completado" y "artefacto publicado y verificable".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se realizó ejecución en robot real, ni evaluación de tasa de éxito por tarea, ni ninguna afirmación de calidad de despliegue. Tampoco se aportan métricas de pérdida, error de acción ni comparaciones cuantitativas con otros VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin recuento de parámetros ni pesos publicados no es posible estimarla; los 7,8 GB del repositorio corresponden a metadatos parciales, no a un checkpoint completo, y no deben usarse como base de cálculo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no verificable sin pesos.
- Opciones de despliegue: no disponible. El tag `openpi` sugiere el ecosistema openpi (JAX/PyTorch), pero no se documentan instrucciones, requisitos ni compatibilidades.
- Latencia y throughput: no disponible. La frecuencia de 30 Hz y el horizonte de 32 son parámetros de la configuración de datos y control, no mediciones de rendimiento del modelo.

## Comparativa con modelos similares

Las cifras de los modelos alternativos provienen de documentación pública y no se han verificado en el contexto de esta ficha; las del modelo descrito son no disponibles.

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| pi05-snumpr-realworld-source-il-idm (este repositorio) | no disponible (51 tensores verificados) | no disponible | ninguna | no disponible | no: checkpoint no publicado |
| pi0 (openpi) | referencia publica ~3B (no verificada aqui) | no disponible en esta ficha | sí, en su documentación original | referencia publica, consultar | sí, en su repositorio |
| OpenVLA | referencia publica ~7B (no verificada aqui) | no disponible en esta ficha | sí, en su documentación original | referencia publica, consultar | sí, en su repositorio |
| RT-2 | referencia publica ~55B (no verificada aqui) | no disponible en esta ficha | sí, en su publicacion | propietaria, no abierta | no |

La comparación relevante en este caso no es de rendimiento, sino de disponibilidad: los tres modelos alternativos citados permiten descargar pesos y reproducir evaluación, mientras que este repositorio no.

## Limitaciones y advertencias

- Subida incompleta: no hay checkpoint utilizable. Cualquier uso del modelo es imposible en el estado actual del repositorio.
- El checkpoint nativo en `native/9999/params` no se ha publicado porque la cuota de almacenamiento público de la cuenta fue excedida; no hay fecha comprometida de resolución.
- Licencia no disponible: no puede asumirse uso comercial, redistribución ni modificación. La licencia del VLA original de SNUMPR del que deriva tampoco se documenta aquí.
- Ausencia total de evaluación: sin ejecución en robot real, sin tasa de éxito y sin métricas de ningún tipo. No hay base para afirmar calidad de despliegue.
- Riesgo de alucinación y sesgos: no evaluado ni documentado. En políticas VLA, los fallos se manifiestan como acciones fuera de rango o trayectorias inseguras, pero no se aportan análisis.
- Especialización estrecha: una única configuración de robot (UR10e), 6 articulaciones y 7 coordenadas de efector final. No hay evidencia de generalización a otras morfologías, cámaras o frecuencias.
- Idiomas y contexto: no disponibles; el modelo no se presenta como modelo de lenguaje de propósito general.
- Inconsistencia temporal aparente: el nombre del repositorio incluye `20261022` y la fecha de creación es 2026-10-21, fechas futuras respecto a un uso convencional. Conviene verificar la procedencia antes de cualquier integración.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Para producción: no usar. La propia model card establece que la liberación solo se considerará completa cuando todos los ficheros estén en una revisión inmutable y verificados mediante lectura anónima de ficheros completos.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-source-il-idm-10000-20261022
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
