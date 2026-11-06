# matthieulel/swinv2-small-patch4-window8-256-galaxy10-decals-head-v2

## Resumen

SwinV2-small-patch4-window8-256-galaxy10-decals-head-v2 es un modelo de clasificación de imágenes desarrollado por matthieulel que adapta el backbone `microsoft/swinv2-small-patch4-window8-256` a la clasificación de morfología de galaxias sobre el conjunto Galaxy10 DECaLS (10 clases). La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas. Forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) dentro del benchmark *Vision Foundation Models Benchmark*, asociado al artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo resuelve un problema acotado y bien definido: dado un recorte de imagen astronómica de 256x256 píxeles procedente de DECaLS, asignar una de las diez clases morfológicas de Galaxy10. Su interés práctico no reside en el rendimiento absoluto, sino en su papel como punto de referencia reproducible dentro de un estudio sistemático sobre cómo se comportan los modelos fundacionales de visión cuando se transfieren a datos astronómicos con un protocolo de entrenamiento idéntico y controlado.

Arquitectura Swin Transformer V2 en configuración *small* con parches de 4x4 y ventanas de atención de 8x8 sobre entradas de 256x256. Cuenta con 48.967.108 parámetros totales, un repositorio de 0,2 GB y licencia Apache 2.0. El checkpoint publicado incluye el backbone original congelado más la cabeza lineal entrenada, y ha superado una comprobación de integridad que reproduce las predicciones guardadas en el 100 % de las primeras 96 imágenes de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (swinv2-small, patch 4, window 8, entrada 256x256) |
| Parámetros totales | 48.967.108 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es un Swin Transformer V2 en variante *small*, con parches de 4x4 píxeles y ventanas de atención de 8x8 sobre una resolución de entrada de 256x256. La adaptación es de tipo *head-only*: se congela por completo el backbone preentrenado, incluidas las estadísticas de las capas de normalización, y se entrena únicamente una capa lineal de 10 salidas que mapea el vector de características global a las clases morfológicas de Galaxy10 DECaLS. El repositorio contiene el modelo completo (backbone original más cabeza entrenada).

El protocolo de entrenamiento es idéntico para los 40 backbones del benchmark. Los datos son Galaxy10 DECaLS (17.736 imágenes): el split público de test (1.774 imágenes) se reserva como test held-out y el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar la época. El optimizador es AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0) con learning rate 1e-4, schedule lineal con 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en *random resized crop* a la resolución de entrada y *random horizontal flip*; la evaluación aplica *resize* y *center crop* a 256x256 px seguidos de la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases morfológicas de galaxias del conjunto Galaxy10 DECaLS.
- Extracción de características visuales mediante un backbone Swin V2 preentrenado y congelado.
- Inferencia directa con `AutoModelForImageClassification` y `AutoImageProcessor` de transformers.
- Compatible con los *endpoints* de Hugging Face (etiqueta `endpoints_compatible`).
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: es exclusivamente un clasificador de imágenes.
- No dispone de modo *thinking*, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en *pipelines* astronómicos: el modelo asigna una de las 10 clases de Galaxy10 a recortes de 256x256 px de DECaLS, lo que permite un triaje automático previo a la inspección visual por expertos.
- Etiquetado asistido de catálogos: con un 47,97 % de accuracy en test, puede usarse como primera pasada para preanotar grandes volúmenes de recortes y reservar la revisión humana para los casos de baja confianza.
- Reproducción de experimentos del benchmark: al formar parte de la colección *Vision Foundation Models Benchmark*, sirve para replicar las tablas del artículo *When foundation models meet astronomical data* con un protocolo documentado y semillas fijas.
- Línea base en estudios de transferencia: su régimen *head-only* con backbone congelado lo convierte en una referencia barata (una sola GPU, 30 épocas) frente a estrategias de *fine-tuning* completo.
- Selección de backbone para nuevos proyectos astronómicos: comparar sus métricas con las de los otros 39 backbones del benchmark ayuda a decidir qué arquitectura usar antes de invertir en entrenamiento completo.
- Docencia y divulgación: ejemplo compacto (0,2 GB) y reproducible de adaptación de un modelo fundacional de visión a un dominio científico, ejecutable en hardware modesto.
- Integración en servicios de inferencia: al ser un clasificador de 49 M de parámetros en safetensors, puede servirse con transformers o con un endpoint de Hugging Face para clasificar imágenes bajo demanda.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Semilla 42 (época 30, seleccionada) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 47,97 | 47,56 ± 0,46 |
| F1 ponderado (%) | 44,97 | 44,54 ± 0,56 |

Evolución de la semilla 42 en épocas clave: época 1 (16,35 % acc. test / 8,25 % F1), época 10 (42,78 / 38,72), época 20 (46,90 / 43,55), época 30 seleccionada (47,97 / 44,97). La pérdida de validación desciende de 2,2707 en la época 1 a 1,5076 en la época 30. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks más allá de las medias del propio benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 48,97 M de parámetros en fp32, lo que supone aproximadamente 0,2 GB de pesos; con activaciones y lotes pequeños, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 4090, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4060, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (`AutoModelForImageClassification`), endpoints de Hugging Face (etiqueta `endpoints_compatible`); no se documentan pesos GGUF ni ONNX para llama.cpp u Ollama, que además no aplican a un clasificador de imágenes.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el autor no publica mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada. La comparación se limita a características estructurales y de licencia:

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SwinV2-small + cabeza lineal) | 48,97 M | 256x256 px | Clasificación Galaxy10 (10 clases) | Apache 2.0 | Hugging Face |
| microsoft/swinv2-small-patch4-window8-256 (base) | ~49 M (backbone) | 256x256 px | Extracción de características / clasificación ImageNet | Apache 2.0 | Hugging Face |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | Clasificación Galaxy10 | no disponible | Colección Hugging Face del autor |

No se han publicado en la información disponible resultados de benchmarks frente a alternativas como ResNet, ViT o ConvNeXt en el mismo conjunto, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Rendimiento moderado: 47,97 % de accuracy y 44,97 % de F1 ponderado en test indican que el modelo confunde clases con frecuencia; no es adecuado para clasificación autónoma sin revisión humana.
- Régimen *head-only*: al mantener el backbone congelado, la capacidad de adaptación al dominio astronómico es limitada por diseño; un *fine-tuning* completo podría mejorar los resultados, pero no se ha evaluado aquí.
- Sesgos de dominio y dataset: el modelo solo ha visto imágenes de Galaxy10 DECaLS y puede degradarse con datos de otros instrumentos, profundidades, resoluciones o distribuciones morfológicas distintas.
- Riesgo de alucinación en sentido clasificatorio: siempre devuelve una de las 10 clases, incluso ante imágenes fuera de distribución, sin mecanismo de abstención ni puntuación de confianza calibrada documentada.
- Limitaciones de contexto e idioma: no aplica procesamiento de texto ni contexto largo; es un clasificador de imágenes de resolución fija 256x256.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del backbone base.
- Resultados no verificados: las métricas del *model-index* están marcadas como `verified: false`; además, el artículo asociado está en revisión y la cita aún no está disponible.
- Advertencia de producción: el checkpoint fue creado y actualizado el mismo día (30 de octubre de 2026) y cuenta con 17 descargas, lo que sugiere escasa validación comunitaria; conviene auditar su comportamiento en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-small-patch4-window8-256-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-small-patch4-window8-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada (2026); en revisión, sin enlace público disponible.
