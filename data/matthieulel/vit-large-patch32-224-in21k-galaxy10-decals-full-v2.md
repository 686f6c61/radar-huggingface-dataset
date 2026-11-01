# matthieulel/vit-large-patch32-224-in21k-galaxy10-decals-full-v2

## Resumen

`vit-large-patch32-224-in21k-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un Vision Transformer (ViT-Large) preentrenado por Google en ImageNet-21k y adaptado mediante *full fine-tuning* (actualización de todos los parámetros) al conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas de galaxias.

El modelo resuelve una tarea concreta de astronomía observacional: asignar una clase morfológica a una imagen de galaxia procedente del *Dark Energy Camera Legacy Survey* (DECaLS). Con 305,5 millones de parámetros, entrada de 224x224 píxeles y parches de 32x32, es un clasificador de 10 clases cuya cabeza es una única capa lineal. Su relevancia radica en formar parte de un estudio comparativo sistemático de 40 backbones preentrenados bajo dos regímenes de adaptación, con protocolo reproducible y métricas por época publicadas.

Los resultados declarados por el autor sitúan la precisión en el 83,54 % y el F1 ponderado en el 83,21 % sobre el conjunto de test reservado de 1.774 imágenes, con una media de 83,28 ± 0,28 % de precisión en tres semillas. Es un checkpoint de investigación, no un modelo generativo: no soporta texto, tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large), patch size 32, resolución 224x224 |
| Parametros totales | 305.520.650 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | image-classification (10 clases) |
| Modelo base | google/vit-large-patch32-224-in21k |
| Dataset de ajuste | matthieulel/galaxy10_decals (Galaxy10 DECaLS) |
| Numero de clases | 10 |
| Tamano del repositorio | 1,2 GB |
| Descargas | 17 |
| Likes | 0 |
| Fecha de creacion | 2026-10-30 |
| Fecha de actualizacion | 2026-10-30 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión estándar: ViT-Large con parches de 32x32 píxeles sobre entradas de 224x224, lo que produce una secuencia de 49 tokens por imagen. El modelo parte de los pesos de `google/vit-large-patch32-224-in21k`, preentrenado en ImageNet-21k, y se adapta mediante *full fine-tuning*, es decir, se actualizan los 305,5 millones de parámetros. La cabeza de clasificación es una capa lineal de 10 salidas que sustituye a la original.

El protocolo de entrenamiento es idéntico para los 40 backbones del benchmark: optimizador AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo de 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en *random resized crop* a la resolución de entrada y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 224x224 y se aplica la normalización del procesador de imágenes del checkpoint.

Los datos proceden de Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reserva como test final; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. El checkpoint publicado corresponde a la época 16 de 30, la de mínima pérdida de validación (0,5302), con semilla 42. El autor declara una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden con los logits guardados en el 100 % de los casos, con una diferencia absoluta máxima de 6,91e-06. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (Galaxy10 DECaLS).
- Inferencia sobre imágenes individuales de 224x224 píxeles con recorte central y normalización del procesador.
- Integración nativa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Extracción de logits por clase para análisis de confianza o umbrales personalizados.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades.
- No es un modelo de propósito general: su espacio de etiquetas está fijado a las 10 clases del dataset de ajuste.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo recibe recortes de 224x224 píxeles de galaxias DECaLS y devuelve una de las 10 clases, lo que permite procesar catálogos de imágenes de forma masiva sin intervención humana. Es adecuado por su precisión del 83,54 % en test y su naturaleza puramente determinista en inferencia.
- **Triaje previo a inspección visual experta**: en flujos donde el etiquetado humano es costoso, el modelo puede preclasificar galaxias y derivar solo los casos de baja confianza (logits próximos entre clases) a revisión manual, reduciendo la carga de los astrónomos.
- **Estudios comparativos de foundation models en astronomía**: al formar parte de la colección *Vision Foundation Models Benchmark*, sirve como referencia reproducible para comparar ViT-Large frente a otros 39 backbones bajo un protocolo idéntico, útil en investigación metodológica.
- **Generación de etiquetas débiles para entrenamiento semi-supervisado**: las predicciones sobre grandes volúmenes de imágenes DECaLS pueden usarse como pseudoetiquetas para preentrenar modelos posteriores o para aumentar datasets etiquetados.
- **Análisis de poblaciones galácticas a escala de survey**: la inferencia por imagen es ligera (305,5 M de parámetros, 1,2 GB en fp32) y permite distribuir el cómputo en GPUs de gama media para caracterizar la distribución morfológica de un campo del survey.
- **Validación de pipelines de preprocesado**: la comprobación de integridad documentada (predicciones idénticas al 100 % en 96 imágenes) permite usar el checkpoint como referencia para verificar que un pipeline de preprocesado reproduce el recorte central y la normalización esperados.
- **Docencia y reproducción de experimentos**: el protocolo completo, las métricas por época y los índices de los splits están publicados, lo que facilita su uso en cursos o talleres de aprendizaje automático aplicado a astronomía.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test reservado de Galaxy10 DECaLS con 1.774 imágenes:

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 16 de 30) | 83,54 % |
| Weighted F1 (semilla 42, época 16 de 30) | 83,21 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 83,28 ± 0,28 % |
| Weighted F1 medio ± desviación típica (semillas 42, 1, 2) | 83,01 ± 0,17 % |

Evolución de las métricas de test en la semilla 42 (selección de épocas representativas):

| Epoca | Val. loss | Val. acc. (%) | Test acc. (%) | Test weighted F1 (%) |
|---|---|---|---|---|
| 1 | 1,7265 | 44,19 | 45,66 | 36,91 |
| 5 | 0,6741 | 79,99 | 80,50 | 79,87 |
| 10 | 0,5488 | 82,69 | 83,31 | 82,98 |
| 16 (seleccionada) | 0,5302 | 83,60 | 83,54 | 83,21 |
| 20 | 0,5795 | 82,36 | 83,60 | 83,44 |
| 25 | 0,5824 | 82,24 | 82,58 | 82,49 |
| 30 | 0,5785 | 82,41 | 83,65 | 83,51 |

No se han publicado en la información disponible resultados comparativos frente a otros backbones concretos del benchmark; las tablas completas del paper están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- **VRAM estimada en fp32**: aproximadamente 1,3 GB solo para pesos (305,5 M de parámetros x 4 bytes), más activaciones y memoria del framework; en la práctica, menos de 3 GB para inferencia con lote pequeño.
- **VRAM estimada en fp16/bf16**: aproximadamente 0,7 GB para pesos; cabe holgadamente en cualquier GPU consumer moderna.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp32 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento con el protocolo del autor (lote efectivo 256, fp32) se recomienda una GPU de 24 GB o superior (RTX 4090, A100 40 GB, H100).
- **Cabe en GPU consumer**: sí, en todas las GPU consumer con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- **Opciones de despliegue**: `transformers` con PyTorch (referencia del autor), exportación a ONNX Runtime, TorchScript, o servidores de inferencia compatibles con modelos de visión (Triton Inference Server, TorchServe). No se documenta soporte nativo en vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño del modelo y la resolución de entrada (49 tokens), se espera una latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados numéricos de los otros backbones del benchmark, por lo que la comparación cuantitativa de rendimiento no está disponible. Se comparan a continuación características estructurales con alternativas plausibles de la misma categoría:

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-large-patch32-224-in21k-galaxy10-decals-full-v2 | 305,5 M | 224x224, patch 32 | Clasificación de 10 clases (Galaxy10 DECaLS) | Apache 2.0 | HuggingFace, 17 descargas |
| google/vit-large-patch32-224-in21k | 305,5 M | 224x224, patch 32 | Clasificación ImageNet-21k (modelo base, sin ajuste astronómico) | Apache 2.0 | HuggingFace, ampliamente utilizado |
| google/vit-base-patch16-224-in21k | ~86 M | 224x224, patch 16 | Clasificación ImageNet-21k (modelo base) | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Otros backbones del benchmark | no disponible | no disponible | Clasificación Galaxy10 DECaLS | no disponible | Colección Vision Foundation Models Benchmark |

El modelo base ViT-Large/32 ofrece menor resolución de parche que las variantes patch-16, lo que reduce el número de tokens (49 frente a 196) y el coste computacional, a cambio de menor detalle espacial. Los resultados comparativos frente a los otros 39 backbones del estudio están en el paper en revisión y en el dataset de runs.

## Limitaciones y advertencias

- **Ámbito restringido**: solo clasifica las 10 clases morfológicas de Galaxy10 DECaLS; no es un modelo de propósito general ni admite otras tareas o dominios sin reentrenamiento.
- **Riesgo de alucinación en sentido clasificatorio**: al ser un clasificador cerrado, siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución (ruido, artefactos, otras fuentes astronómicas), sin mecanismo nativo de rechazo.
- **Sesgos del dataset**: las clases de Galaxy10 DECaLS están desbalanceadas y proceden de un único survey (DECaLS); el rendimiento puede degradarse en imágenes de otros instrumentos, profundidades o resoluciones.
- **Métricas no verificadas**: accuracy y F1 son resultados declarados por el autor (`verified: false`); no han sido reproducidos de forma independiente en la información disponible.
- **Selección de época**: el checkpoint corresponde a la época 16 por mínima pérdida de validación, no a la de mejor accuracy de test; las diferencias entre épocas tardías son pequeñas (test acc. entre 82,2 % y 83,8 %), lo que indica cierta variabilidad.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo base de Google y el dataset subyacente pueden tener sus propias condiciones que conviene revisar.
- **Sin soporte multilingüe ni textual**: no procesa texto, por lo que no puede usarse en pipelines que requieran descripciones o razonamiento sobre las imágenes.
- **Documentación limitada**: 17 descargas y 0 likes; el paper está en revisión y la cita aún no está disponible, lo que dificulta la trazabilidad académica completa.
- **Preprocesado crítico**: el rendimiento depende de reproducir exactamente el redimensionado y recorte central a 224x224 y la normalización del procesador; desviaciones en el pipeline pueden degradar las predicciones sin aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-large-patch32-224-in21k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-large-patch32-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; cita pendiente de publicación)
