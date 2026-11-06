# matthieulel/swinv2-tiny-patch4-window16-256-galaxy10-decals-head-v2

## Resumen

`swinv2-tiny-patch4-window16-256-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, publicado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. El modelo parte del checkpoint `microsoft/swinv2-tiny-patch4-window16-256` y sustituye su cabeza de clasificación por una capa lineal de diez salidas entrenada sobre el conjunto Galaxy10 DECaLS, que agrupa imágenes astronómicas en diez clases morfológicas.

La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone SwinV2 permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena la cabeza lineal. Esta elección convierte al modelo en una sonda lineal (*linear probe*) sobre representaciones preentrenadas, útil para medir cuánta información morfológica galáctica contiene un backbone genérico de visión. El checkpoint forma parte de un estudio comparativo de 40 backbones bajo dos regímenes de adaptación, descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

Con 27,58 millones de parámetros y un repositorio de 0,1 GB, es un modelo muy ligero orientado a inferencia sobre imágenes de 256x256 píxeles. Su relevancia actual reside en su papel como referencia reproducible dentro de un benchmark abierto de modelos de visión aplicados a datos astronómicos, más que en su rendimiento absoluto: la precisión en test se sitúa en el 49,55 %, lejos de un clasificador especializado entrenado de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (vision transformer jerárquico con atención por ventanas desplazadas) |
| Parametros totales | 27.585.844 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es un SwinV2 Tiny con parches de 4x4 y ventanas de atención de 16x16 sobre entradas de 256x256 píxeles, preentrenado por Microsoft. La arquitectura emplea atención por ventanas desplazadas y conexiones residuales con normalización escalada (residual post-norm), lo que permite entrenar transformers jerárquicos de visión de forma estable. Sobre este backbone se añade una única capa lineal de diez salidas que constituye la cabeza entrenada; el resto de pesos se conserva congelado.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de evaluación held-out y el split de train dividido de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del benchmark, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 256x256 px y se aplica la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en diez clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de características visuales mediante el backbone SwinV2 congelado, reutilizable como encoder para otras tareas de visión.
- Inferencia sobre imágenes RGB de 256x256 píxeles con el procesador de imágenes estándar de transformers.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador puro de imagen a etiqueta.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo de razonamiento (*thinking*), visión de documentos, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en catálogos astronómicos: el modelo asigna una de las diez clases de Galaxy10 DECaLS a recortes de 256x256 px, lo que permite un triaje rápido de imágenes antes de una inspección humana o de un modelo más costoso.
- Sonda lineal para evaluar backbones de visión: al mantener el backbone congelado, sirve para medir de forma aislada la calidad de las representaciones de SwinV2 Tiny en datos astronómicos, comparable con los otros 39 backbones del benchmark.
- Reproducibilidad de experimentos: el repositorio incluye métricas por época, semillas y splits documentados, lo que facilita replicar el protocolo en estudios de adaptación de modelos fundacionales a astronomía.
- Prototipado educativo y docencia: su tamaño reducido (27,6 M de parámetros, 0,1 GB) permite ejecutarlo en portátiles y GPUs de consumo para demostrar pipelines de clasificación de imágenes con transformers.
- Generación de etiquetas débiles para preentrenamiento o aumento de datos: las predicciones pueden usarse como pseudoetiquetas en conjuntos no anotados, siempre con revisión posterior dada la precisión moderada.
- Integración en pipelines de *transfer learning*: el backbone congelado puede reutilizarse como extractor de características para tareas relacionadas (detección de artefactos, clasificación de estrellas frente a galaxias) con una nueva cabeza entrenada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (conjunto de test held-out de Galaxy10 DECaLS, 1.774 imágenes; métricas no verificadas por Hugging Face):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 49,55 % |
| F1 ponderado (semilla 42, época 30 de 30) | 46,76 % |
| Media +/- desviación típica de accuracy (semillas 42, 1, 2) | 49,27 +/- 0,28 % |
| Media +/- desviación típica de F1 ponderado (semillas 42, 1, 2) | 46,50 +/- 0,31 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; el autor remite a las tablas del artículo y al dataset `vision-foundation-models-benchmark-runs` para la comparación completa entre los 40 backbones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo completo (27,6 M de parámetros, ~110 MB de pesos) más el espacio de activaciones para un batch pequeño a 256x256 px; en la práctica, menos de 2 GB en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos años, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; también es posible exportarlo a ONNX o TorchScript para servir con ONNX Runtime o Triton. No se han publicado instrucciones específicas para vLLM, llama.cpp, Ollama o TGI, que no están orientados a clasificadores de imagen.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos comparables sobre Galaxy10 DECaLS. La comparación natural es con los otros 39 backbones del mismo benchmark (por ejemplo, ViT, ConvNeXt, DINOv2, CLIP) bajo el mismo régimen de head-only fine-tuning, pero sus cifras no se incluyen en esta ficha. A continuación se comparan únicamente características estructurales con alternativas genéricas de la misma familia:

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia |
|---|---|---|---|---|
| Este modelo (SwinV2 Tiny + cabeza lineal) | 27,6 M | Imagen 256x256 px | Clasificación de morfología galáctica (10 clases) | Apache 2.0 |
| microsoft/swinv2-tiny-patch4-window16-256 (base) | ~28 M | Imagen 256x256 px | Clasificación ImageNet-1k (1000 clases) | Apache 2.0 |
| Un CNN especializado tipo ResNet-50 entrenado de extremo a extremo | ~25 M | Imagen variable | Clasificación de imágenes genérica | Variable |

La comparación de rendimiento frente a estos modelos en Galaxy10 DECaLS no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Precisión moderada: 49,55 % de accuracy en test implica que aproximadamente la mitad de las imágenes se clasifican de forma incorrecta; no es adecuado como sistema autónomo de clasificación científica sin revisión humana.
- Sesgo de protocolo: al entrenar solo la cabeza lineal con el backbone congelado, el modelo hereda las representaciones y posibles sesgos del preentrenamiento de SwinV2 en ImageNet, que no está adaptado a imágenes astronómicas de bajo contraste y alta relación señal-ruido variable.
- Riesgo de sobreajuste al split: el checkpoint corresponde a la época 30 de 30, seleccionada por mínima pérdida de validación; la curva de validación aún descendía, por lo que un entrenamiento más largo o un ajuste fino completo podrían mejorar los resultados.
- Limitación de dominio: solo cubre las diez clases de Galaxy10 DECaLS y entradas de 256x256 px; no generaliza a otras taxonomías morfológicas ni a resoluciones o instrumentos distintos sin reentrenamiento.
- Sin capacidades de lenguaje: no procesa texto, por lo que no puede usarse para tareas multimodales ni de razonamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no obstante, el uso científico debe citar el artículo del autor, aún en revisión, y verificar la procedencia y licencia de los datos Galaxy10 DECaLS.
- Métricas no verificadas: los resultados del model-index están declarados por el autor y no han sido validados de forma independiente por Hugging Face.
- Verificación de integridad limitada: el autor comprobó que las predicciones coinciden con los logits guardados en 96 imágenes de test (100 % de coincidencia, diferencia máxima absoluta de 1,91e-06), pero no se aporta una auditoría externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-tiny-patch4-window16-256-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-tiny-patch4-window16-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona URL)
