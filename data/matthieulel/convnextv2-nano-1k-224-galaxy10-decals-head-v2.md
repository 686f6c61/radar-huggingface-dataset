# matthieulel/convnextv2-nano-1k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-nano-1k-224-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel como parte de la colección *Vision Foundation Models Benchmark*. El modelo adapta el backbone `facebook/convnextv2-nano-1k-224` al dataset Galaxy10 DECaLS (10 clases de morfología galáctica) mediante un régimen de *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas.

La relevancia del checkpoint no reside en su rendimiento absoluto, sino en su papel dentro de un estudio sistemático: es una de las 80 configuraciones evaluadas (40 backbones preentrenados × dos regímenes de adaptación) bajo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Sirve, por tanto, como punto de referencia reproducible para medir cuánto conocimiento astronómico aporta un backbone de visión generalista cuando solo se permite reentrenar la cabeza de clasificación.

El modelo es deliberadamente pequeño (14.989.210 parámetros, repo de 0,1 GB) y está pensado para inferencia en CPU o GPU de gama baja, lo que lo hace útil como línea base en pipelines de clasificación morfológica a gran escala o como componente de comparación frente a fine-tuning completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura con capas ConvNeXt V2 block, según el checkpoint base `facebook/convnextv2-nano-1k-224`) |
| Parámetros totales | 14.989.210 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 px) |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 15 M de parámetros, la cuantización es innecesaria en la práctica) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 Nano, una red convolucional pura que moderniza el diseño de ResNet con bloques ConvNeXt V2 (convoluciones depthwise de 7×7, LayerNorm, activación GELU y capa de escalado por canal), además del mecanismo de auto-normalización introducido en ConvNeXt V2. El checkpoint base fue preentrenado en ImageNet-1k a 224×224 px. Sobre él se añade una única capa lineal con 10 salidas, que es el único componente entrenado en este repositorio; los pesos del backbone son idénticos a los del checkpoint original, incluidas las estadísticas de normalización.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reserva como conjunto de evaluación; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del estudio, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), learning rate 1e-4 con schedule lineal y 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación usa resize y center crop a 224×224 px con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42) y los resultados se reportan como media ± desviación estándar sobre tres semillas (42, 1, 2). El autor incluye una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden al 100% con los logits guardados de la época seleccionada (diferencia absoluta máxima de 5,96e-06).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS (el modelo no documenta los nombres de las clases en la información disponible).
- Extracción de características visuales genéricas heredadas del backbone ConvNeXt V2 Nano preentrenado en ImageNet-1k, reutilizables para otras tareas de visión mediante fine-tuning.
- Inferencia determinista y ligera: 15 M de parámetros permiten ejecución en CPU con latencias bajas.
- No soporta tool calling ni function calling: es un modelo de clasificación de imágenes, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (*thinking mode*).
- No tiene capacidades multilingües ni de procesamiento de lenguaje.
- No dispone de visión generativa, audio ni otras modalidades más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación morfológica de galaxias a gran escala: el modelo toma recortes de 224×224 px y devuelve una de 10 clases, lo que permite etiquetar catálogos de imágenes de DECaLS en lotes sin intervención humana, con un coste computacional mínimo gracias a sus 15 M de parámetros.
- Línea base en estudios de benchmarking: al ser una de las 80 configuraciones del estudio *Vision Foundation Models Benchmark*, sirve para cuantificar la ganancia de backbones más grandes o de regímenes de fine-tuning completo frente al entrenamiento solo de la cabeza.
- Filtrado previo en pipelines astronómicos: puede usarse como primer clasificador para descartar o priorizar candidatos antes de análisis más costosos (espectroscopía, ajuste de perfiles de brillo superficial), dado su bajo coste de inferencia.
- Etiquetado asistido para creación de datasets: las predicciones del modelo pueden preetiquetar imágenes nuevas que luego se revisan manualmente, acelerando la anotación de morfologías.
- Despliegue en entornos con recursos limitados: al caber en cualquier GPU de consumo e incluso en CPU, es adecuado para nodos de borde, estaciones de trabajo sin GPU o servicios con presupuesto de memoria reducido.
- Componente educativo y de reproducibilidad: el repositorio incluye la receta completa, métricas por época y comprobación de integridad, lo que lo hace útil para cursos o replicaciones del protocolo de adaptación de foundation models a datos astronómicos.
- Comparación de estrategias de adaptación: permite contrastar empíricamente el régimen *head-only* frente a fine-tuning completo sobre el mismo backbone y dataset, aislando el efecto del régimen de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes, split `test`):

| Métrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 0,5400 (54,00%) |
| Weighted F1 (semilla 42, época 30 de 30) | 0,5194 (51,94%) |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 53,55% ± 0,45 |
| Weighted F1 media ± desv. típica (semillas 42, 1, 2) | 51,45% ± 0,50 |

Evolución seleccionada por época (semilla 42): la accuracy de test pasa de 13,13% en la época 1 a 54,00% en la época 30, con la pérdida de validación descendiendo de 2,4118 a 1,2778. El autor no publica comparaciones numéricas con otros modelos en la información disponible; la comparación entre las 80 configuraciones del estudio se remite al artículo y al dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (15 M de parámetros ≈ 60 MB de pesos, más activaciones de un batch pequeño a 224×224 px). Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó en una sola GPU y no requiere aceleradores de gama alta. Funciona en RTX 4090, A100, H100 y en GPUs de consumo antiguas.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor` (el autor proporciona el ejemplo de preprocesado); al ser un modelo de visión, no aplican vLLM, llama.cpp ni Ollama. Para servir en producción puede exportarse a ONNX o TorchScript.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ConvNeXt V2 Nano, head-only) | 14,99 M | imagen 224×224 px | 54,00% accuracy; 51,94% weighted F1 (semilla 42) | Apache 2.0 | Hugging Face |
| `facebook/convnextv2-nano-1k-224` (base sin adaptar) | 15,0 M aprox. | imagen 224×224 px | no disponible (clasificador ImageNet-1k, no adaptado a galaxias) | Apache 2.0 | Hugging Face |
| Otros backbones del *Vision Foundation Models Benchmark* | no disponible | no disponible | no disponible en esta ficha; resultados en el dataset `vision-foundation-models-benchmark-runs` | según backbone | Hugging Face (colección del autor) |

No se dispone de datos numéricos de modelos alternativos adaptados específicamente a Galaxy10 DECaLS en la información proporcionada, por lo que la comparativa cuantitativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Rendimiento modesto: 54,00% de accuracy en test implica que aproximadamente 46 de cada 100 galaxias se clasifican incorrectamente; no es adecuado para uso científico sin revisión humana.
- El régimen *head-only* congela el backbone, lo que limita la adaptación a las particularidades de las imágenes astronómicas; es probable que fine-tuning completo mejore los resultados, pero no se aportan cifras en esta ficha.
- Riesgo de sesgo de clase: el dataset Galaxy10 DECaLS está desbalanceado y el modelo puede favorecer las clases mayoritarias; el weighted F1 (51,94%) por debajo de la accuracy (54,00%) es consistente con este efecto.
- Sesgos de dominio: el backbone fue preentrenado en ImageNet-1k (imágenes naturales), no en imágenes astronómicas; las estadísticas de normalización congeladas provienen de ese dominio.
- Limitaciones de contexto e idioma: no aplica procesamiento de lenguaje; el modelo solo acepta imágenes y no gestiona texto ni instrucciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución; el autor no impone restricciones adicionales en la información disponible.
- Caveats para producción: el modelo no documenta los nombres de las 10 clases, no incluye umbrales de confianza calibrados y no se han publicado pruebas de robustez frente a ruido, artefactos o imágenes fuera de distribución.
- Los resultados son de una única configuración de entrenamiento (una GPU, fp32) y el autor no verifica externamente las métricas (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-nano-1k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-nano-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona enlace directo).
