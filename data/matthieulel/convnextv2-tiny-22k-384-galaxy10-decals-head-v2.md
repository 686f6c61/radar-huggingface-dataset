# matthieulel/convnextv2-tiny-22k-384-galaxy10-decals-head-v2

## Resumen

`convnextv2-tiny-22k-384-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, publicado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. El modelo adapta el backbone `facebook/convnextv2-tiny-22k-384` al dataset Galaxy10 DECaLS (10 clases de morfología galáctica) mediante un régimen de *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas.

La relevancia del checkpoint no reside en su rendimiento absoluto, sino en su papel como pieza de un protocolo comparativo reproducible: forma parte de las 80 configuraciones evaluadas en el paper *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), que cruza 40 backbones preentrenados con dos regímenes de adaptación. Esto lo convierte en una referencia útil para investigar hasta qué punto los modelos de visión preentrenados en imágenes naturales transfieren a datos astronómicos sin reentrenamiento del extractor de características.

Arquitectónicamente es un ConvNeXt V2 en variante *tiny*, con 27.874.186 parámetros totales, entrada de 384x384 píxeles y licencia Apache 2.0. El checkpoint incluye tanto los pesos del backbone (heredados del modelo base) como la cabeza lineal entrenada, lo que permite su uso directo con `transformers` mediante `AutoModelForImageClassification`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura con bloques ConvNeXt y capa de normalización GRN, según el modelo base) |
| Parámetros totales | 27.874.186 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 384x384 px) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones específicas; al ser un modelo pequeño en fp32 es compatible con las cuantizaciones estándar de PyTorch/ONNX, pero no se han publicado artefactos) |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación de imágenes (10 clases de morfología galáctica) |
| Dataset de entrenamiento | `matthieulel/galaxy10_decals` (Galaxy10 DECaLS) |
| Modelo base | `facebook/convnextv2-tiny-22k-384` |
| Régimen de adaptación | Head-only fine-tuning (backbone congelado, cabeza lineal entrenada) |
| Resolución de entrada | 384x384 px (resize + center crop) |
| Tamaño del repositorio | 0,1 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt V2 *tiny* preentrenado por Meta en ImageNet-22k a resolución 384 y posteriormente adaptado a Galaxy10 DECaLS. La adaptación sigue un régimen *head-only*: el backbone completo se congela, incluidas las estadísticas de las capas de normalización, y únicamente se entrena una capa lineal de 10 salidas que mapea el vector de características global a las clases de morfología galáctica. No hay, por tanto, ajuste fino del extractor ni *prompt tuning*; el experimento mide la transferibilidad lineal de las representaciones preentrenadas.

El protocolo de entrenamiento es idéntico para los 40 backbones del benchmark. Se usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La augmentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 384x384 px con la normalización del image processor del checkpoint. La partición de datos es estratificada por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test de Galaxy10 DECaLS), con la validación usada exclusivamente para seleccionar la época. El checkpoint publicado corresponde a la época 30 de 30, la de mínima pérdida de validación (1,2292). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de Galaxy10 DECaLS.
- Extracción de características visuales genéricas a través del backbone ConvNeXt V2 congelado (reutilizable como encoder para otras tareas astronómicas mediante *linear probing*).
- Inferencia determinista y ligera: 27,9 M de parámetros permiten ejecución en CPU y GPU de gama baja.
- Integración nativa con `transformers` (`AutoImageProcessor`, `AutoModelForImageClassification`) y compatibilidad declarada con *endpoints* de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni generación: es exclusivamente un clasificador de imágenes.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines de *survey* astronómico**: el modelo puede etiquetar recortes de galaxias en 10 clases con una latencia muy baja (27,9 M de parámetros), lo que permite procesar lotes grandes de imágenes DECaLS en una sola GPU consumer. Es adecuado como primer filtro antes de inspección humana.
- **Línea base reproducible para investigación en transferencia de modelos de visión**: al formar parte de un benchmark de 80 configuraciones con receta fija y semillas documentadas, sirve para comparar el rendimiento de *linear probing* frente a *full fine-tuning* y frente a otros 39 backbones bajo condiciones controladas.
- **Prototipado rápido de clasificadores astronómicos**: dado que solo se entrena una cabeza lineal, es un punto de partida barato para validar si un backbone concreto captura señal morfológica antes de invertir en un ajuste fino completo.
- **Extracción de *embeddings* para búsqueda por similitud o clustering de galaxias**: el backbone congelado puede usarse como encoder para agrupar morfologías no etiquetadas o para recuperación visual en catálogos, sin necesidad de reentrenar.
- **Docencia y divulgación en *machine learning* aplicado a astronomía**: el modelo es pequeño (0,1 GB), se carga en pocos segundos y su receta está completamente documentada, lo que facilita reproducir el experimento en un cuaderno o en un portátil.
- **Evaluación de robustez de modelos preentrenados en imágenes naturales frente a dominio astronómico**: el checkpoint permite medir la caída de rendimiento al transferir un backbone de ImageNet a imágenes DECaLS, útil para estudiar sesgos de dominio y estrategias de adaptación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Valor (seed 42, época 30) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy | 56,03 % | 55,49 ± 0,67 % |
| Weighted F1 | 53,75 % | 53,20 ± 0,79 % |

Evolución seleccionada de la curva de entrenamiento (seed 42): la accuracy de test pasa de 19,50 % en la época 1 a 56,03 % en la época 30, con la pérdida de validación descendiendo de 2,1841 a 1,2292. La mejora entre las épocas 20 y 30 es marginal (55,52 % → 56,03 %), lo que sugiere convergencia del régimen *head-only*. El autor no publica comparaciones directas con otros modelos en esta model card; los resultados de los 40 backbones están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en fp32 (27,9 M de parámetros ≈ 112 MB de pesos, más activaciones de un lote pequeño a 384x384); en fp16/bf16, aproximadamente 56 MB de pesos.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para lotes grandes, una RTX 4090 o A100 acelera el *throughput*.
- **GPU consumer**: sí, cabe holgadamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- **CPU**: viable para inferencia individual (decenas a cientos de milisegundos por imagen según hardware); para lotes grandes se recomienda GPU.
- **Opciones de despliegue**: `transformers` (PyTorch), exportación a ONNX Runtime, TorchScript y `optimum`; también es compatible con *endpoints* de Hugging Face. No se han publicado artefactos GGUF ni recetas específicas para llama.cpp/Ollama (no aplica a un clasificador visual).
- **Latencia y throughput**: no disponibles de forma oficial; por el tamaño del modelo se espera un throughput alto en GPU moderna (cientos a miles de imágenes por segundo en lotes en A100), pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. La comparación directa más relevante es con el propio modelo base y con las otras configuraciones del mismo benchmark, cuyos resultados están en el dataset `vision-foundation-models-benchmark-runs`:

| Modelo | Parámetros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|
| Este checkpoint (head-only) | 27,9 M | 384x384 px | 56,03 % | Apache 2.0 |
| `facebook/convnextv2-tiny-22k-384` (base, sin adaptar) | 27,9 M | 384x384 px | no disponible en esta ficha | Apache 2.0 (según modelo base) |
| Otros backbones del benchmark (39 restantes) | variable | variable | no disponibles en esta ficha | variable |

## Limitaciones y advertencias

- **Rendimiento moderado**: una accuracy de 56,03 % sobre 10 clases está muy por encima del azar (10 %) pero lejos de un clasificador especializado; no es adecuado para producción científica sin validación adicional.
- **Régimen *head-only***: el backbone está congelado, por lo que el modelo no ha adaptado sus representaciones al dominio astronómico; un ajuste fino completo probablemente mejoraría el rendimiento, pero no se ha evaluado en este checkpoint.
- **Sesgo de dominio**: el backbone fue preentrenado en ImageNet-22k (imágenes naturales), lo que puede introducir sesgos hacia texturas y colores no representativos de imágenes DECaLS.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en morfologías ambiguas o imágenes de baja calidad.
- **Clases desbalanceadas**: el dataset Galaxy10 DECaLS tiene distribución de clases desigual; la accuracy global puede ocultar un rendimiento pobre en clases minoritarias (el weighted F1 de 53,75 % es inferior a la accuracy, lo que apunta en esa dirección).
- **Idioma y contexto**: no aplica (modelo de visión); no procesa texto ni secuencias.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el modelo base `facebook/convnextv2-tiny-22k-384` tiene su propia licencia que conviene verificar.
- **Verificación**: los resultados están marcados como `verified: false`; solo se ha comprobado la integridad de los pesos (predicciones idénticas en 96 imágenes de test, diferencia máxima de logits 2,62e-06), no el rendimiento frente a terceros.
- **Paper pendiente**: la publicación en *Astronomy and Computing* está en revisión; la cita definitiva no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-tiny-22k-384-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-22k-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026): referencia citada en la model card; enlace no disponible.
