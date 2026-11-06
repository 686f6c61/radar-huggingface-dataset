# matthieulel/convnextv2-nano-22k-384-galaxy10-decals-head-v2

## Resumen

`convnextv2-nano-22k-384-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. El modelo adapta el backbone `facebook/convnextv2-nano-22k-384` al dataset Galaxy10 DECaLS (10 clases morfológicas) mediante un régimen de *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas.

La relevancia del checkpoint es metodológica más que de rendimiento absoluto: forma parte de un estudio sistemático de 80 configuraciones (40 backbones preentrenados × dos regímenes de adaptación) bajo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). El modelo alcanza un 58,85 % de accuracy y un F1 ponderado del 57,05 % en el conjunto de test reservado de 1.774 imágenes, con una media de 58,17 ± 0,59 % sobre tres semillas.

Se trata de un modelo de visión puro, sin capacidades de generación de texto ni de razonamiento. Su interés práctico reside en servir como referencia reproducible para evaluar hasta qué punto un backbone genérico de visión, sin reentrenamiento, transfiere a una tarea científica de clasificación morfológica con clases desbalanceadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura, jerárquica, con bloques ConvNeXt y capa de clasificación lineal) |
| Parametros totales | 14.989.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); resolución de entrada 384×384 px |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch pero no se documenta) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 en variante *nano*, preentrenado por Facebook en ImageNet-22k a 384×384 px. ConvNeXt V2 es una red convolucional pura que incorpora capas de normalización global (GRN, *Global Response Normalization*) y un diseño de bloques inspirado en los transformers, pero sin mecanismos de atención. El checkpoint aquí presentado conserva íntegramente los pesos del backbone y añade una única capa lineal de 10 salidas entrenada desde cero.

El entrenamiento sigue un protocolo fijo idéntico para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación se limita a *random resized crop* a la resolución de entrada y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 384×384 px. El dataset Galaxy10 DECaLS contiene 17.736 imágenes, divididas en 14.188 de entrenamiento, 1.774 de validación y 1.774 de test (las dos últimas estratificadas por clase). La época seleccionada es la de mínima pérdida de validación (época 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de características visuales con un backbone ConvNeXt V2 preentrenado en ImageNet-22k a 384×384 px.
- Inferencia sobre imágenes individuales o lotes mediante `AutoModelForImageClassification` de transformers.
- Compatible con el pipeline `image-classification` de Hugging Face y con *endpoints* gestionados (tag `endpoints_compatible`).
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo *thinking* ni de decodificación especulativa (no aplica a un modelo discriminativo).

## Casos de uso

- **Clasificación morfológica automatizada en pipelines de *survey* astronómico**: el modelo puede procesar recortes de 384×384 px de imágenes DECaLS y asignar una de las 10 clases morfológicas, sirviendo como filtro preliminar antes de inspección humana en catálogos de gran volumen.
- **Línea base reproducible para investigación en *foundation models* astronómicos**: al formar parte de un benchmark de 80 configuraciones con protocolo fijo, permite comparar el régimen *head-only* frente a *full fine-tuning* sobre el mismo backbone y dataset.
- **Prototipado rápido de clasificadores científicos**: al ser un modelo de 15 M de parámetros y 0,1 GB, se puede cargar y ejecutar en una GPU de consumo para validar una hipótesis de clasificación antes de invertir en entrenamientos completos.
- **Etiquetado asistido de datasets astronómicos**: las predicciones del modelo pueden usarse para pre-anotar imágenes y priorizar la revisión humana en las clases con mayor confusión, reduciendo el coste de anotación.
- **Enseñanza y divulgación de *transfer learning* en astronomía**: el checkpoint completo (backbone congelado + cabeza lineal) es un ejemplo didáctico de adaptación de un modelo de visión genérico a un dominio científico con recursos limitados.
- **Integración en servicios de inferencia ligeros**: con 15 M de parámetros, cabe en contenedores pequeños y puede desplegarse con transformers o exportarse a ONNX para servir clasificaciones a baja latencia en entornos con GPU modesta.

## Benchmarks y rendimiento

Datos declarados por el autor en la *model card* (no verificados de forma independiente, campo `verified: false`):

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy (semilla 42, época 30) | 58,85 % | Galaxy10 DECaLS, test (1.774 imágenes) |
| F1 ponderado (semilla 42, época 30) | 57,05 % | Galaxy10 DECaLS, test (1.774 imágenes) |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 58,17 ± 0,59 % | Galaxy10 DECaLS, test |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 56,40 ± 0,56 % | Galaxy10 DECaLS, test |

Evolución de la accuracy de test en la semilla 42: 16,01 % en la época 1, 46,67 % en la época 4, 55,13 % en la época 10, 57,89 % en la época 20 y 58,85 % en la época 30 (seleccionada). La pérdida de validación desciende de 2,1856 a 1,1953 en ese intervalo.

No se han publicado en la información disponible resultados comparativos con otros backbones del mismo benchmark ni con modelos alternativos en Galaxy10 DECaLS.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en fp32 para el modelo (≈60 MB de pesos) más el *overhead* de activaciones a 384×384 px; en la práctica, menos de 2 GB en cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobradas para inferencia. Para reentrenar solo la cabeza lineal basta una GPU de consumo.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo con 2 GB o más de VRAM (GTX 1650, RTX 3050, etc.).
- **Opciones de despliegue**: transformers (`AutoModelForImageClassification`), exportación a ONNX Runtime, TorchScript o TensorRT; también es compatible con *endpoints* gestionados de Hugging Face.
- **Latencia y throughput**: no disponibles en la información proporcionada; con 15 M de parámetros y entrada de 384×384 px se espera un throughput alto en GPU moderna, pero no se documentan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de modelos alternativos evaluados sobre Galaxy10 DECaLS, por lo que no es posible establecer una comparativa numérica fiable. Como referencia estructural, el modelo se sitúa en la categoría de clasificadores ConvNeXt V2 *nano* adaptados a dominio específico:

| Modelo | Parametros | Resolucion | Tarea | Licencia | Accuracy en Galaxy10 DECaLS |
|---|---|---|---|---|---|
| Este checkpoint (ConvNeXt V2 nano, head-only) | 14,99 M | 384×384 | 10 clases morfológicas | apache-2.0 | 58,85 % (test, semilla 42) |
| `facebook/convnextv2-nano-22k-384` (base sin adaptar) | no disponible | 384×384 | ImageNet-22k (21.841 clases) | apache-2.0 | no disponible |
| Otros backbones del benchmark (40 configuraciones) | no disponible | no disponible | 10 clases morfológicas | no disponible | no disponible en esta ficha |

## Limitaciones y advertencias

- **Rendimiento moderado**: un 58,85 % de accuracy en 10 clases indica confusión significativa entre morfologías; no es adecuado como clasificador autónomo en producción científica sin revisión humana.
- **Riesgo de sesgo de clase**: el F1 ponderado (57,05 %) es inferior a la accuracy, lo que sugiere un rendimiento desigual entre clases, probablemente por desbalanceo del dataset Galaxy10 DECaLS.
- **Alcance restringido al dominio**: el modelo solo ha sido entrenado para morfología de galaxias en imágenes DECaLS; no generaliza a otros *surveys*, bandas o resoluciones sin reentrenamiento.
- **Backbone congelado**: al no haberse ajustado el backbone, el modelo no aprovecha la adaptación de características al dominio astronómico, lo que limita su techo de rendimiento frente a *full fine-tuning*.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas con alta confianza en imágenes fuera de distribución.
- **Sin datos de calibración**: no se documentan temperaturas, matrices de confusión ni intervalos de confianza por clase.
- **Licencia**: apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre idoneidad para aplicaciones críticas.
- **Verificación**: los resultados del *model-index* están marcados como `verified: false`; no han sido replicados de forma independiente.
- **Mantenimiento**: el repositorio tiene 18 descargas y 0 *likes*, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-nano-22k-384-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-nano-22k-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace)
