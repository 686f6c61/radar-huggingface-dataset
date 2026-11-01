# matthieulel/vit-large-patch16-224-in21k-galaxy10-decals-head-v2

## Resumen

`vit-large-patch16-224-in21k-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. El modelo parte del checkpoint preentrenado `google/vit-large-patch16-224-in21k` (Vision Transformer grande, parche de 16x16 px, resolución 224x224, preentrenado en ImageNet-21k) y le añade una cabeza lineal de 10 salidas entrenada sobre el dataset Galaxy10 DECaLS, que clasifica galaxias en diez categorías morfológicas.

La relevancia del checkpoint no reside en su rendimiento absoluto, sino en su papel dentro de un estudio comparativo reproducible: forma parte de un conjunto de 80 configuraciones (40 backbones preentrenados x dos regímenes de adaptación) evaluadas bajo un protocolo revisado en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). El régimen empleado aquí es *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una capa lineal.

El modelo tiene 303,3 millones de parámetros (ViT-Large más la cabeza), un tamaño de repositorio de 1,2 GB y licencia Apache 2.0. Alcanza un 56,54 % de accuracy y un 53,35 % de F1 ponderado en el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes), con una media de 56,44 ± 0,27 % de accuracy sobre tres semillas. Es, por tanto, una pieza de referencia para estudiar cuánto transfiere un backbone genérico de visión a una tarea astronómica concreta cuando no se ajusta el extractor de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large/16), transformer de parches con atención global; cabeza lineal de 10 clases |
| Parametros totales | 303.311.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px en 196 parches de 16x16) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en safetensors fp32) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es un ViT-Large estándar de Google: 24 capas de transformer, dimensión oculta 1024, 16 cabezas de atención y parches de 16x16 px sobre entradas de 224x224 (196 tokens más el token de clase). El preentrenamiento original es supervisado sobre ImageNet-21k. Sobre esa representación se añade una única capa lineal con diez salidas, una por clase morfológica de Galaxy10 DECaLS.

El entrenamiento es deliberadamente mínimo: *head-only fine-tuning* con el backbone congelado, incluidos los parámetros de las capas de normalización. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 1e-4, schedule lineal con 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación se limita a recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. En evaluación se redimensiona y recorta al centro a 224x224 px y se aplica la normalización del procesador del checkpoint base.

Los datos son Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se reserva como test held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La validación solo se usa para seleccionar la época; en este caso la elegida fue la 30 (mínima pérdida de validación, 1,3543). No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional: el valor del checkpoint está en la reproducibilidad del protocolo y en la verificación de integridad (predicciones idénticas al 100 % en las primeras 96 imágenes de test, con diferencia máxima de logits de 4,65e-06).

## Capacidades

- Clasificación de imágenes en 10 clases morfológicas de galaxias (Galaxy10 DECaLS), a partir de recortes de 224x224 px.
- Extracción de características visuales genéricas vía backbone ViT-Large preentrenado en ImageNet-21k (utilizable con la cabeza desactivada para *feature extraction*).
- Inferencia determinista y reproducible con el preprocesado documentado (resize + center crop + normalización del procesador).
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso: es un clasificador puro de una sola pasada.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni otras modalidades.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo puede etiquetar recortes de galaxias procedentes de surveys (DECaLS y, con cautela, otros) en las diez clases de Galaxy10, sirviendo como primer filtro antes de inspección humana.
- **Línea base reproducible para investigación en ML astronómico**: al ser una de las 80 configuraciones del benchmark, permite comparar el efecto del *head-only fine-tuning* frente a *full fine-tuning* con receta idéntica y semillas controladas.
- **Estudio de transferibilidad de backbones de visión**: congelando la cabeza y usando el backbone como extractor, se pueden calcular embeddings de imágenes astronómicas para analizar cuánto de ImageNet-21k transfiere a morfología galáctica.
- **Etiquetado asistido y curación de catálogos**: el modelo puede preetiquetar lotes grandes de recortes y priorizar las imágenes de baja confianza para revisión manual, reduciendo el coste de anotación.
- **Docencia y reproducción de experimentos**: el protocolo completo (épocas, hiperparámetros, splits, semillas) está documentado, lo que lo hace adecuado para prácticas de *fine-tuning* en cursos de visión por computador.
- **Verificación de integridad de pipelines de despliegue**: el autor publica una comprobación de integridad (100 % de coincidencia en 96 imágenes), útil como test de regresión al portar el modelo a otros entornos de inferencia.
- **Detección de morfologías minoritarias**: con la matriz de confusión por clase (no publicada en la información disponible) podría orientarse a la identificación de clases raras, aunque el F1 ponderado de 53,35 % sugiere un rendimiento desigual entre clases.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de Galaxy10 DECaLS (1.774 imágenes), semilla 42, época 30 seleccionada por mínima pérdida de validación. Métricas no verificadas de forma independiente (`verified: false` en el model-index).

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada) | 56,54 % |
| F1 ponderado (semilla 42, época seleccionada) | 53,35 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 56,44 ± 0,27 % |
| F1 ponderado medio ± desviación típica (semillas 42, 1, 2) | 53,25 ± 0,29 % |

Evolución seleccionada del entrenamiento (semilla 42): accuracy de validación del 16,97 % en la época 1, 51,01 % en la época 10, 55,07 % en la 16 y 57,38 % en la 30; la accuracy de test pasa de 18,26 % a 56,54 % en el mismo intervalo. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla, más allá de la media sobre las 80 configuraciones del benchmark, que no se detalla.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp32, los 303,3 M de parámetros ocupan aproximadamente 1,2 GB de pesos; con activaciones y *batch* pequeño, el consumo se sitúa en torno a 2-3 GB. En fp16/bf16 bajaría a unos 0,6 GB de pesos.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32 con lotes moderados; para entrenamiento *head-only* con lote efectivo 256 y 30 épocas, una GPU de 16-24 GB (RTX 4090, A100 40 GB) es holgada, y el autor indica que usó una sola GPU.
- **Compatibilidad con GPU de consumo**: sí, cabe en GTX 1660/RTX 3050 en adelante para inferencia; el backbone congelado permite incluso ejecución en CPU con latencia aceptable para lotes pequeños.
- **Opciones de despliegue**: transformers (PyTorch) es la vía documentada; al ser un ViT estándar, es compatible con ONNX Runtime, TorchScript y frameworks de serving como TorchServe o Triton. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI (herramientas orientadas a LLM).
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia arquitectónica, un ViT-L/16 a 224x224 es un modelo de cómputo moderado (del orden de decenas de GFLOPs por imagen), pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (ViT-L/16, head-only) | 303,3 M | 224x224 px | Clasificación 10 clases | 56,54 % (test) | Apache 2.0 |
| `google/vit-large-patch16-224-in21k` (base sin adaptar) | ~303 M | 224x224 px | Clasificación ImageNet-21k | no disponible | Apache 2.0 |
| Otras configuraciones del benchmark (39 backbones restantes) | variable | 224x224 px | Clasificación 10 clases | media del benchmark no detallada | variable |
| Modelos específicos de morfología galáctica (p. ej. Zoobot, Galaxy Zoo) | no disponible | variable | Clasificación morfológica | no disponible en la información | variable |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada: el estudio publica las tablas completas en el dataset `vision-foundation-models-benchmark-runs`, pero sus cifras no se incluyen aquí. El propio autor enmarca este checkpoint como una de las 80 configuraciones, no como un modelo de referencia a batir.

## Limitaciones y advertencias

- **Rendimiento modesto**: 56,54 % de accuracy y 53,35 % de F1 ponderado indican que el *head-only fine-tuning* deja margen sustancial; no es un modelo apto para producción científica sin validación adicional.
- **Sesgo de dominio**: entrenado exclusivamente con Galaxy10 DECaLS; el rendimiento en imágenes de otros surveys, resoluciones o profundidades no está caracterizado y probablemente se degrade.
- **Desequilibrio de clases**: el F1 ponderado (53,35 %) es inferior a la accuracy (56,54 %), lo que sugiere peor rendimiento en clases minoritarias; no se publica la matriz de confusión ni métricas por clase.
- **Riesgo de alucinación en sentido amplio**: como clasificador, siempre asigna una de las diez clases con una confianza que puede ser alta incluso ante imágenes fuera de distribución (galaxias atípicas, artefactos, imágenes no astronómicas); se recomienda umbral de confianza y revisión humana.
- **Protocolo limitado**: backbone congelado, sin *fine-tuning* completo ni aumentaciones específicas de dominio; los resultados no reflejan el techo del backbone.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del dataset Galaxy10 DECaLS y del checkpoint base de Google antes de un despliegue comercial.
- **Sin verificación independiente**: las métricas están marcadas como `verified: false` y proceden del propio autor; el artículo está en revisión y la cita aún no está disponible.
- **Idiomas y texto**: no aplica; el modelo no procesa lenguaje natural, por lo que cualquier uso conversacional o de razonamiento queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-large-patch16-224-in21k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-large-patch16-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026): en revisión, sin enlace disponible en la información proporcionada.
