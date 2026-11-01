# matthieulel/vit-base-patch16-224-galaxy10-decals-head-v2

## Resumen

`vit-base-patch16-224-galaxy10-decals-head-v2` es un clasificador de imagen especializado en morfología de galaxias, desarrollado por matthieulel como parte de la colección Vision Foundation Models Benchmark. Parte del checkpoint `google/vit-base-patch16-224` y se ha adaptado a la clasificación de 10 clases morfológicas del conjunto Galaxy10 DECaLS mediante *head-only fine-tuning*: el backbone ViT permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas. El modelo se enmarca en el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

La relevancia del checkpoint es doble. Por un lado, ofrece un clasificador de morfología galáctica listo para usar con una huella mínima (85,8 M de parámetros, 0,3 GB en safetensors) y compatible con `transformers` y endpoints de inferencia. Por otro, forma parte de un benchmark controlado de 40 backbones preentrenados evaluados bajo dos regímenes de adaptación, lo que lo convierte en una referencia reproducible para comparar modelos de visión fundacionales en datos astronómicos.

El rendimiento es modesto pero honesto: 58,34 % de accuracy y 55,91 % de F1 ponderado en el split de test público (1.774 imágenes), con una desviación estándar de ±0,26 puntos de accuracy entre tres semillas. No es un modelo de propósito general ni un asistente conversacional: es un clasificador cerrado de 10 clases entrenado con un protocolo estrictamente documentado y verificado (predicciones idénticas en el 100 % de las 96 primeras imágenes de test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch size 16, resolución 224x224) con cabeza lineal de 10 clases |
| Parametros totales | 85.806.346 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en safetensors fp32) |
| Idiomas soportados | no disponible (modelo de clasificación de imagen, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un ViT-Base estándar de Google (`google/vit-base-patch16-224`): transformer de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y parches de 16x16 sobre imágenes de 224x224. Sobre el token `[CLS]` se aplica una única capa lineal con 10 salidas, una por clase morfológica de Galaxy10 DECaLS. Durante el entrenamiento el backbone se congela por completo, incluidas las estadísticas de sus capas de normalización, de modo que solo se optimizan los pesos de la cabeza lineal.

El protocolo es idéntico para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación usa resize y center crop a 224x224 con la normalización del image processor del checkpoint base. El conjunto Galaxy10 DECaLS tiene 17.736 imágenes; el split público de test (1.774) se reserva como held-out y el de train se divide estratificadamente en 14.188 de entrenamiento y 1.774 de validación, usados solo para seleccionar la época. La época seleccionada es la 30 (mínima pérdida de validación, 1,2074) con semilla 42. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas del esquema Galaxy10 DECaLS.
- Extracción de representaciones visuales mediante el backbone ViT congelado (útil como feature extractor para tareas astronómicas downstream).
- Inferencia determinista y reproducible: verificación de integridad con predicciones idénticas al 100 % en las primeras 96 imágenes de test (diferencia máxima de logits 5,13e-06).
- Integración directa con `transformers` (`AutoModelForImageClassification`, `AutoImageProcessor`) y con endpoints de inferencia (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación cerrada de 10 clases.

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: dado un cutout de galaxia en formato imagen, el modelo devuelve una de las 10 clases de Galaxy10 DECaLS, lo que permite etiquetar grandes volúmenes de observaciones de DECaLS de forma barata y reproducible.
- Baseline en estudios comparativos de modelos fundacionales: al formar parte del benchmark de 40 backbones con receta idéntica, sirve como referencia controlada para medir si un backbone nuevo mejora o no el rendimiento en morfología galáctica.
- Filtrado y triaje previo en pipelines de observación: descartar o priorizar imágenes por clase morfológica antes de un análisis más costoso (espectroscopía, ajuste de perfiles de brillo superficial).
- Extracción de características para aprendizaje supervisado downstream: usar el backbone ViT congelado como extractor de embeddings y entrenar clasificadores o regresores ligeros sobre esas representaciones para tareas relacionadas (estimación de redshift fotométrico, detección de fusiones).
- Docencia y divulgación en astroinformática: ejemplo completo y reproducible de fine-tuning de un modelo fundacional con protocolo documentado, métricas por época y verificación de integridad.
- Prototipado rápido en CPU o GPU de gama baja: con 85,8 M de parámetros y 0,3 GB de pesos, el modelo se puede servir en entornos con recursos limitados para validar una idea antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de Galaxy10 DECaLS (1.774 imágenes), calculados en la época de mínima pérdida de validación. Métricas no verificadas de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 58,34 % |
| F1 ponderado (semilla 42, época 30 de 30) | 55,91 % |
| Accuracy media ± desviación estándar (semillas 42, 1, 2) | 58,12 ± 0,26 % |
| F1 ponderado medio ± desviación estándar (semillas 42, 1, 2) | 55,66 ± 0,31 % |

Evolución seleccionada del entrenamiento (semilla 42): la accuracy de test pasa de 16,23 % en la época 1 a 50,51 % en la época 5, 56,48 % en la época 12 y 58,34 % en la época 30; la pérdida de validación desciende de 2,2500 a 1,2074. No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos bajo el mismo protocolo más allá de la media del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35-0,5 GB para los pesos, más el espacio de activaciones para batches pequeños; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto, A100, H100, L40S o RTX 4090. Para lotes grandes de cutouts, una GPU de datacenter con buena anchura de banda de memoria es suficiente.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (referencia del autor), TorchServe, endpoints de Hugging Face (`endpoints_compatible`), ONNX Runtime tras exportación, y contenedores de inferencia estándar. No se documentan pesos GGUF ni soporte nativo en llama.cpp u Ollama (no aplica a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada; el autor no publica mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos bajo el mismo protocolo, por lo que la comparación numérica directa no está disponible. A continuación se comparan características estructurales con alternativas de la misma categoría.

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-base-patch16-224-galaxy10-decals-head-v2 | 85,8 M | imagen 224x224 | Clasificación de 10 clases morfológicas | apache-2.0 | Hugging Face |
| google/vit-base-patch16-224 (base) | 85,8 M | imagen 224x224 | Clasificación ImageNet-1k (1.000 clases) | apache-2.0 | Hugging Face |
| Otros backbones del benchmark (39 restantes) | variable | imagen 224x224 | Clasificación de 10 clases morfológicas | según backbone | Colección Vision Foundation Models Benchmark |

La comparación de rendimiento entre estos modelos está documentada en el artículo y en el dataset `vision-foundation-models-benchmark-runs`, pero sus cifras no se incluyen en la información disponible para esta ficha.

## Limitaciones y advertencias

- Rendimiento moderado: 58,34 % de accuracy en test implica que aproximadamente 4 de cada 10 galaxias se clasifican de forma incorrecta; no es adecuado para producción científica sin revisión humana o sin un modelo de mayor capacidad.
- Dominio cerrado: solo reconoce las 10 clases de Galaxy10 DECaLS y solo sobre imágenes con el preprocesado exacto del paper (resize y center crop a 224x224 con la normalización del processor). Otras resoluciones, recortes o instrumentos pueden degradar el rendimiento de forma no caracterizada.
- Sesgos de datos: el modelo hereda los sesgos de selección de Galaxy10 DECaLS (selección de galaxias, distribución de clases y características de DECaLS), no documentados en detalle por el autor.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de sobreconfianza en clases minoritarias o en imágenes atípicas; el autor no publica calibración ni matrices de confusión.
- Backbone congelado: al entrenar solo la cabeza lineal, la capacidad de adaptación al dominio astronómico es limitada; un fine-tuning completo podría mejorar el rendimiento, pero no se evalúa en este checkpoint.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación con atribución; conviene revisar también la licencia del checkpoint base y del dataset Galaxy10 DECaLS.
- Métricas no verificadas de forma independiente (`verified: false`) y procedentes de un único split de test; la reproducibilidad depende de los índices de split publicados en el dataset de runs.
- Sin soporte de texto, tool calling ni agentes: no debe evaluarse como un modelo de lenguaje.
- El artículo asociado está en revisión; la cita definitiva no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch16-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (cita pendiente de publicación; no se dispone de URL)
