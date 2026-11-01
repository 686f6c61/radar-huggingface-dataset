# matthieulel/swinv2-small-patch4-window16-256-galaxy10-decals-full-v2

## Resumen

`swinv2-small-patch4-window16-256-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/swinv2-small-patch4-window16-256`, un transformer con atención en ventanas jerárquicas, sobre el dataset Galaxy10 DECaLS, que contiene 17.736 imágenes de galaxias etiquetadas en 10 clases morfológicas.

El modelo resuelve una tarea concreta de astronomía observacional: clasificar automáticamente la forma de galaxias a partir de imágenes del survey DECaLS (Dark Energy Camera Legacy Survey). Es relevante porque forma parte de un estudio sistemático de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) bajo un protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que lo convierte en un punto de referencia reproducible para evaluar modelos de visión fundacional en datos astronómicos.

Con 48,97 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que cabe holgadamente en GPUs de consumo. Alcanza un 85,57 % de accuracy y un 85,44 % de F1 ponderado en el conjunto de test reservado (1.774 imágenes), con una media de 85,33 ± 0,25 % de accuracy sobre tres semillas, lo que indica una estabilidad notable en el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (atención jerárquica por ventanas, patch size 4, window size 16, resolución 256) |
| Parámetros totales | 48.967.108 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256x256 px) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Swin Transformer V2 en su variante *small*, con parches de 4x4 píxeles y ventanas de atención de 16x16, configurada para entradas de 256x256 píxeles. Swin V2 introduce mejoras sobre Swin V1 en estabilidad de entrenamiento y resolución, mediante normalización coseno y mecanismos de atención continuos. Sobre el backbone se añade una única capa lineal de 10 salidas que corresponde a las 10 clases morfológicas de Galaxy10 DECaLS.

El entrenamiento consistió en un ajuste fino completo de todos los parámetros con AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 5e-5, schedule lineal con 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo de 256), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. Como aumentación se aplicaron recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa redimensionado y recorte central a 256x256 px con la normalización del procesador de imágenes del checkpoint.

Los datos son Galaxy10 DECaLS (17.736 imágenes): el split de test público (1.774 imágenes) se reserva como test held-out, y el split de train público se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La validación se usa únicamente para seleccionar la época; en este caso la época 17 (de 30) por pérdida de validación mínima. El autor reporta una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden con los logits guardados en el 100,0 % de los casos (diferencia absoluta máxima de 6,68e-06).

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales de imágenes astronómicas de 256x256 px mediante el backbone Swin V2.
- Inferencia determinista y reproducible: el checkpoint corresponde a una época concreta (17) seleccionada por pérdida de validación.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un clasificador de imágenes puro).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades más allá de la clasificación de imágenes.
- Compatible con el pipeline `image-classification` de `transformers` y con `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo recibe imágenes de 256x256 px de galaxias del survey DECaLS y devuelve una de las 10 clases morfológicas, lo que permite procesar catálogos de imágenes de forma masiva sin intervención humana. Su accuracy del 85,57 % en test lo hace adecuado como primer filtro en estudios de morfología a gran escala.
- **Etiquetado previo para revisión humana**: en proyectos de ciencia ciudadana o catalogación, el modelo puede preetiquetar imágenes y priorizar las de baja confianza para revisión experta, reduciendo el coste de anotación manual.
- **Benchmark de modelos de visión fundacional en astronomía**: al formar parte de una colección de 80 configuraciones con protocolo idéntico, sirve como referencia reproducible para comparar backbones preentrenados en tareas astronómicas.
- **Estudios de morfología en imágenes de baja resolución**: el modelo está entrenado específicamente con el preprocesado de 256x256 px del survey DECaLS, por lo que es adecuado para clasificar recortes de galaxias con ese formato y normalización.
- **Prototipado rápido en investigación astronómica**: con 48,97 M de parámetros y 0,2 GB de pesos, se puede desplegar en una GPU de consumo para experimentar con clasificación morfológica sin infraestructura dedicada.
- **Generación de características para modelos posteriores**: las representaciones internas del backbone Swin V2 ajustado pueden usarse como extractor de features para tareas derivadas (detección de anomalías, clustering morfológico, regresión de parámetros físicos).
- **Validación de protocolos de ajuste fino**: al estar documentado el recetario completo (hiperparámetros, épocas, selección por validación), es útil como caso de estudio para reproducir y comparar regímenes de adaptación (full fine-tuning frente a otras estrategias).

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes), según el `model-index` de la model card:

| Métrica | Valor | Notas |
|---|---|---|
| Accuracy | 85,57 % | Semilla 42, época 17 de 30 (seleccionada) |
| F1 ponderado | 85,44 % | Semilla 42, época 17 de 30 (seleccionada) |
| Accuracy (media ± desv. típ.) | 85,33 ± 0,25 % | Media sobre semillas 42, 1 y 2 |
| F1 ponderado (media ± desv. típ.) | 85,05 ± 0,36 % | Media sobre semillas 42, 1 y 2 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; los datos anteriores son los únicos reportados por el autor y no están verificados de forma independiente (`verified: false`).

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,2 GB en fp32 para los pesos (48,97 M de parámetros), más el espacio de activaciones para lotes pequeños; en la práctica, menos de 1 GB para inferencia con lotes moderados.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento o ajuste fino, se recomienda una GPU con 8 GB o más (el autor usó una sola GPU con lote efectivo de 256).
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090, etc.).
- **Opciones de despliegue**: `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor`; también es compatible con endpoints de HuggingFace (`endpoints_compatible`). No se documentan opciones específicas para vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos de lenguaje y no a clasificación de imágenes.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos comparables sobre el mismo dataset y protocolo. La colección *Vision Foundation Models Benchmark* del mismo autor incluye 80 configuraciones (40 backbones por dos regímenes de adaptación), pero los datos concretos de esas otras configuraciones no se han facilitado. Por tanto:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Swin V2 small, full fine-tuning) | 48,97 M | no aplica (visión 256x256) | 85,57 % accuracy / 85,44 % F1 | apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos del dataset**: el modelo hereda los sesgos de Galaxy10 DECaLS, que puede estar desbalanceado entre clases morfológicas y limitado a galaxias del survey DECaLS; el rendimiento puede degradarse en imágenes de otros surveys o con distribuciones morfológicas distintas.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, pero puede asignar clases con alta confianza a imágenes fuera de distribución (galaxias atípicas, artefactos, objetos no galácticos), produciendo etiquetas erróneas sin señal de incertidumbre calibrada.
- **Limitaciones de resolución y preprocesado**: el modelo espera imágenes redimensionadas y recortadas a 256x256 px con la normalización concreta del procesador; desviarse de ese preprocesado puede reducir la accuracy de forma significativa.
- **Restricciones de licencia**: licencia apache-2.0, que permite uso comercial y modificación con atribución; no obstante, conviene verificar las condiciones del dataset Galaxy10 DECaLS para usos derivados.
- **Caveats para producción**: los resultados son de un único conjunto de test de 1.774 imágenes y no están verificados de forma independiente (`verified: false`); la selección de época se hizo por pérdida de validación, no por accuracy de test, y la variabilidad entre semillas (±0,25 % en accuracy) es baja pero debe tenerse en cuenta en umbrales de decisión.
- **Idiomas**: no aplica, pero el modelo no procesa texto ni metadatos; solo imágenes.
- **Sin soporte de agentes ni tool calling**: no es adecuado para tareas conversacionales o de razonamiento multi-paso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/matthieulel/swinv2-small-patch4-window16-256-galaxy10-decals-full-v2)
- [Modelo base: microsoft/swinv2-small-patch4-window16-256](https://huggingface.co/microsoft/swinv2-small-patch4-window16-256)
- [Dataset Galaxy10 DECaLS](https://huggingface.co/datasets/matthieulel/galaxy10_decals)
- [Dataset de runs del benchmark](https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs)
- [Colección Vision Foundation Models Benchmark](https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb)
- Paper *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026): en revisión, cita pendiente de publicación; no se dispone de enlace.
