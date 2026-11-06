# matthieulel/dinov2-base-galaxy10-decals-full-v2

## Resumen

`dinov2-base-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, obtenido mediante ajuste fino completo (*full fine-tuning*) del backbone auto-supervisado `facebook/dinov2-base` sobre el conjunto de datos Galaxy10 DECaLS. Lo publica el usuario de Hugging Face `matthieulel` como parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) que sirve de banco de pruebas para modelos fundacionales de visión aplicados a datos astronómicos, en el marco de un artículo en revisión para *Astronomy and Computing* (2026).

El modelo resuelve una tarea acotada y bien definida: clasificar imágenes de galaxias en 10 clases morfológicas. No es un modelo generativo ni un asistente conversacional; es un clasificador de imagen puro con una única capa lineal de 10 salidas sobre el encoder ViT-B de DINOv2 (86,6 millones de parámetros). Su interés radica en que ofrece un punto de referencia reproducible y con protocolo documentado (semillas, épocas, receta de entrenamiento) para evaluar hasta qué punto los backbones fundacionales de visión genéricos transfieren bien a dominios científicos muy alejados de sus datos de preentrenamiento.

La relevancia práctica es doble: por un lado, para investigadores en astronomía que necesiten un clasificador morfológico listo para usar con un 85,23 % de accuracy en el conjunto de test retenido; por otro, para quien estudie transferencia de aprendizaje, ya que el autor publica métricas por época, splits e índices de todas las ejecuciones en un dataset aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/14) DINOv2 con cabeza lineal de clasificación |
| Parámetros totales | 86.595.850 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256x256 px en evaluación) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/dinov2-base`, un Vision Transformer de tipo ViT-B con parches de 14x14 entrenado de forma auto-supervisada (autodestilación sin etiquetas) sobre un corpus masivo de imágenes naturales. Sobre ese backbone se aplica un ajuste fino completo: se actualizan todos los parámetros y se sustituye la cabeza original por una capa lineal única con diez salidas, una por clase morfológica. No hay adaptadores, LoRA ni congelación parcial; el régimen es explícitamente *full fine-tuning*.

El entrenamiento usa Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de test retenido y el split público de train dividido de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del banco de pruebas: AdamW (betas 0.9/0.999, eps 1e-8, weight decay 0.1, clipping de gradiente 1.0), tasa de aprendizaje 5e-5 con schedule lineal y 10 % de warm-up, batch efectivo de 256 (32 imágenes con acumulación de gradiente en 8 pasos), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. El aumento de datos se limita a recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. En evaluación se redimensiona y recorta al centro a 256x256 px antes de la normalización del procesador de imágenes. La época seleccionada es la de mínima pérdida de validación (época 16 de 30), y el autor reporta una comprobación de integridad: al recargar el checkpoint y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden al 100 % con los logits guardados (diferencia absoluta máxima de 1,91e-06).

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de representaciones visuales de propósito general heredadas de DINOv2 (el encoder puede usarse como extractor de features, aunque el repositorio solo documenta la tarea de clasificación).
- Inferencia determinista y ligera: un único forward pass por imagen, sin generación autoregresiva.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de texto: es exclusivamente un modelo de visión.
- No dispone de modo *thinking*, visión generativa, audio ni multimodalidad.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo etiqueta recortes de galaxias de DECaLS en una de las 10 clases con un 85,23 % de accuracy en test, lo que permite preclasificar catálogos grandes antes de la revisión humana.
- Triaje de imágenes en estudios de morfología a gran escala: con 86,6 M de parámetros y una entrada de 256x256 px, el coste por imagen es bajo y permite procesar lotes amplios en una sola GPU.
- Etiquetado asistido para curación de datasets: las predicciones del modelo pueden usarse como propuestas iniciales que un experto corrige, reduciendo el tiempo de anotación en campañas de clasificación morfológica.
- Línea base reproducible en investigación sobre transferencia de aprendizaje: al formar parte de una colección de 80 configuraciones con receta idéntica y métricas por época publicadas, sirve para comparar backbones fundacionales en un dominio científico concreto.
- Detección de casos atípicos o mal etiquetados: las imágenes con baja confianza o discrepancias frente a etiquetas existentes pueden priorizarse para inspección, aprovechando la distribución de logits del clasificador.
- Docencia y divulgación en astronomía computacional: el modelo y su protocolo documentado permiten montar prácticas reproducibles de ajuste fino de un ViT sobre datos astronómicos reales en una única GPU.
- Integración en servicios de inferencia de Hugging Face: el tag `endpoints_compatible` indica que puede desplegarse directamente en Inference Endpoints con la librería transformers.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test retenido de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Valor |
|---|---|
| Accuracy (semilla 42, época 16 de 30) | 85,23 % |
| F1 ponderado (semilla 42, época 16 de 30) | 84,99 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 84,89 % ± 0,37 |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 84,72 % ± 0,25 |

La model card incluye además la tabla completa de métricas por época para la semilla 42, con accuracy de test entre 74,92 % (época 4) y 86,92 % (época 30). Cabe señalar que la época seleccionada por mínima pérdida de validación (16) no es la de mayor accuracy de test: las épocas 23 a 30 superan el 85,5 % e incluso el 86,9 % en la última. No se han publicado en la información disponible resultados comparativos con otros backbones del mismo banco de pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,35 GB solo para pesos (86,6 M de parámetros), más activaciones; con lotes pequeños cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16/bf16 el peso ronda los 0,17 GB, aunque el autor no documenta conversiones ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto, A100, H100 o L40S; para desarrollo y pruebas, RTX 4090, RTX 3090 o incluso GPUs de gama media con 4-8 GB.
- Cabe sin problema en GPU de consumo, incluidas RTX 3060, RTX 4060 y similares.
- Despliegue: la vía documentada es `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor`; el tag `endpoints_compatible` habilita Hugging Face Inference Endpoints. El autor no documenta soporte explícito para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| dinov2-base-galaxy10-decals-full-v2 | 86,6 M | Clasificación de morfología galáctica (10 clases) | 256x256 px | 85,23 % accuracy, 84,99 % F1 ponderado (test) | apache-2.0 |
| facebook/dinov2-base | 86,6 M | Backbone visual auto-supervisado | 224x224 px (típico) | no disponible como clasificador de galaxias sin ajuste | apache-2.0 |
| Otros backbones del banco de pruebas del autor (40 configuraciones) | variable | Clasificación de morfología galáctica (10 clases) | 256x256 px | no disponible en esta ficha; métricas en el dataset `vision-foundation-models-benchmark-runs` | según backbone |

No se dispone en la información proporcionada de resultados de otros clasificadores morfológicos de galaxias con los que establecer una comparación numérica directa.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de texto: no puede usarse para generación, razonamiento, código ni conversación.
- Dominio muy restringido: entrenado exclusivamente con Galaxy10 DECaLS; el rendimiento fuera de esa distribución de imágenes (otros instrumentos, otros rangos de redshift, otros catálogos) no está documentado y probablemente degrade.
- Riesgo de sesgo de clase y de dataset: las métricas son globales; no se publican resultados por clase, por lo que clases minoritarias podrían tener un rendimiento notablemente inferior al 85 % global.
- Selección de época discutible: la época elegida por mínima pérdida de validación (16) rinde por debajo de épocas posteriores en test, lo que sugiere que el checkpoint publicado no es el óptimo en accuracy.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; proceden del propio autor.
- Sin datos de calibración ni de incertidumbre: no se documenta si las probabilidades de salida están calibradas, algo relevante si se usan para triaje.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del backbone original DINOv2 para usos derivados.
- Comprobación de integridad limitada a 96 imágenes de test; no sustituye a una validación independiente completa.
- Artículo asociado aún en revisión: la cita definitiva y posibles erratas del protocolo no están cerradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/dinov2-base-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/dinov2-base
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; sin DOI disponible)
