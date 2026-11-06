# matthieulel/swinv2-tiny-patch4-window8-256-galaxy10-decals-full-v2

## Resumen

`swinv2-tiny-patch4-window8-256-galaxy10-decals-full-v2` es un checkpoint de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel`. Parte del backbone `microsoft/swinv2-tiny-patch4-window8-256` y se ha ajustado por *full fine-tuning* (todos los parámetros actualizados) sobre el conjunto Galaxy10 DECaLS, que agrupa 17.736 imágenes etiquetadas en 10 clases morfológicas. El modelo resuelve un problema concreto de astronomía observacional: la clasificación automática de la forma de galaxias a partir de imágenes del sondeo DECaLS.

Con 27.585.844 parámetros (aproximadamente 27,6 millones) y un peso de repositorio de 0,1 GB, es un modelo compacto orientado a inferencia en entornos con recursos limitados. Forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que lo convierte en una pieza de un benchmark reproducible más que en un modelo aislado.

Su relevancia actual radica en que permite evaluar hasta qué punto un backbone de visión generalista, entrenado originalmente en ImageNet, transfiere a un dominio científico especializado. El checkpoint declara una precisión del 83,71 % en el conjunto de test reservado y un F1 ponderado del 83,16 %, con una media de 84,50 % ± 0,69 % sobre tres semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (swinv2-tiny-patch4-window8-256), transformer jerárquico con atención por ventanas desplazadas |
| Parametros totales | 27.585.844 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors fp32, admite cuantización a fp16/bf16/int8 mediante herramientas externas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un Swin Transformer V2 en su variante *tiny*, con parches de 4x4 píxeles y ventanas de atención de 8x8, preentrenado por Microsoft a resolución 256x256. La arquitectura emplea atención local por ventanas con desplazamiento entre capas, lo que reduce el coste cuadrático de la atención global y permite procesar imágenes de resolución media con un presupuesto de parámetros muy contenido. La cabeza de clasificación original se sustituye por una única capa lineal de diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS.

El ajuste se realizó con el mismo protocolo para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas y precisión simple (fp32, TF32 desactivado) en una sola GPU. Como aumento de datos se aplicaron recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa redimensionado y recorte central a 256x256 px con la normalización del procesador de imágenes del checkpoint base.

El conjunto Galaxy10 DECaLS contiene 17.736 imágenes. El split público de test (1.774 imágenes) se reservó como test held-out; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. El checkpoint publicado corresponde a la época 21 de 30, la de mínima pérdida de validación (0,4655). El autor declara una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coincidieron con los logits guardados en el 100 % de los casos, con una diferencia absoluta máxima de 5,96e-06.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (el modelo devuelve logits por clase, no texto).
- Extracción de características visuales de dominio astronómico gracias al ajuste completo del backbone.
- Inferencia por imagen individual o en lote mediante `AutoModelForImageClassification` de transformers.
- Compatible con el pipeline `image-classification` de Hugging Face y con endpoints de inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador discriminativo puro.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni ninguna otra modalidad más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación morfológica automatizada en pipelines de reducción de datos astronómicos: el modelo recibe recortes de 256x256 px de imágenes DECaLS y devuelve la clase morfológica, lo que permite etiquetar grandes volúmenes de objetos sin intervención humana y con un coste computacional muy bajo (27,6 M de parámetros).
- Preselección y triaje de candidatos en estudios de morfología: al alcanzar un 83,71 % de precisión en test, puede usarse como primer filtro para separar galaxias espirales, elípticas e irregulares antes de una revisión visual experta de los casos ambiguos.
- Etiquetado asistido para construcción de catálogos: integrado en un flujo con `transformers`, permite generar etiquetas preliminares sobre nuevos recortes y priorizar la anotación manual donde la confianza del modelo sea menor.
- Benchmark de transferencia de foundation models a astronomía: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve para comparar de forma controlada el rendimiento de distintos backbones en la misma tarea y con los mismos splits.
- Despliegue en hardware modesto: con 0,1 GB de pesos y 27,6 M de parámetros, cabe en GPUs de consumo e incluso en CPU para lotes pequeños, lo que facilita su uso en observatorios o estaciones de trabajo sin clúster dedicado.
- Docencia y reproducibilidad científica: el protocolo completo (semillas, épocas, métricas por época y splits) está publicado en el dataset `vision-foundation-models-benchmark-runs`, lo que permite replicar el experimento y usarlo como caso de estudio en cursos de aprendizaje profundo aplicado a ciencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 21) | 83,71 % |
| F1 ponderado (semilla 42, época 21) | 83,16 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 84,50 % ± 0,69 % |
| F1 ponderado medio ± desviación típica (semillas 42, 1, 2) | 84,04 % ± 0,77 % |

Evolución seleccionada del entrenamiento (semilla 42): la accuracy de test pasa del 46,84 % en la época 1 al 83,71 % en la época 21 (seleccionada), con un máximo observado del 85,12 % en la época 19. La pérdida de validación desciende de 1,5548 a 0,4655 en la época seleccionada. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para lotes pequeños (27,6 M de parámetros, unos 110 MB de pesos); en fp16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento original se hizo en una sola GPU, lo que sugiere que una RTX 3090, RTX 4090, A100 o H100 son sobradas para inferencia y suficientes para reentrenamiento.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060 y superiores), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch (vía `AutoModelForImageClassification`), pipeline `image-classification` de Hugging Face, endpoints de inferencia compatibles; también es exportable a ONNX u otras runtimes, aunque el autor no publica artefactos de ese tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada para modelos de la misma categoría (clasificación de morfología galáctica). El propio autor sitúa este checkpoint dentro de una colección de 80 configuraciones (40 backbones por dos regímenes de adaptación), pero las tablas comparativas del artículo no se incluyen en la model card. Por tanto, la comparativa con alternativas concretas se indica como no disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (swinv2-tiny galaxy10) | 27,6 M | imagen 256x256 px | apache-2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo discriminativo de 10 clases: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de la clasificación de morfología galáctica en el formato esperado requiere reentrenamiento.
- Dominio muy restringido: entrenado exclusivamente con Galaxy10 DECaLS; el rendimiento puede degradarse con imágenes de otros sondeos, otras resoluciones, otros filtros o distinto preprocesado.
- Riesgo de sesgo de clase y de dominio: la distribución de clases del dataset condiciona las predicciones; las clases minoritarias pueden tener peor recall aunque el F1 ponderado sea alto.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsos positivos con alta confianza en imágenes fuera de distribución.
- El preprocesado es crítico: el autor especifica redimensionado y recorte central a 256x256 px con la normalización del procesador; desviarse de esta receta puede alterar los resultados de forma notable.
- Resultados no verificados de forma independiente: las métricas del model-index tienen `verified: false` y proceden del propio autor.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del backbone base de Microsoft para atribuciones.
- Sin soporte multilingüe ni de texto: no debe emplearse en tareas de NLP.
- El checkpoint corresponde a la época 21, no a la de mejor accuracy de test (época 19); la selección se hizo por pérdida de validación, lo que puede infravalorar ligeramente el rendimiento real en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-tiny-patch4-window8-256-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-tiny-patch4-window8-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de URL)
