# matthieulel/convnextv2-femto-1k-224-galaxy10-decals-full-v2

## Resumen

`convnextv2-femto-1k-224-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `facebook/convnextv2-femto-1k-224` sobre el conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas de galaxias a partir de recortes de 224x224 píxeles.

El modelo resuelve una tarea concreta de visión por computador en astronomía: la clasificación automática de morfología galáctica, un paso habitual en la creación de catálogos y en estudios de evolución galáctica a gran escala. Su relevancia radica en que forma parte de un estudio sistemático que compara 40 backbones preentrenados bajo dos regímenes de adaptación, con protocolo reproducible y métricas por época publicadas, lo que permite evaluar de forma controlada si los modelos fundacionales de visión generalistas transfieren bien a datos astronómicos.

Arquitectura ConvNeXt V2 en su variante *femto* (la más pequeña de la familia), con aproximadamente 4,85 millones de parámetros totales y una resolución de entrada de 224x224. El checkpoint publicado corresponde a la semilla 42, época 30, seleccionada por mínima pérdida de validación, y alcanza un 84,16 % de accuracy y un 83,94 % de F1 ponderado en el conjunto de test reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura con bloques ConvNeXt V2 y capa de normalización GRN), variante femto |
| Parametros totales | 4.852.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 4,85 M de parámetros puede ejecutarse en fp32 sin problema) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional ConvNeXt V2 en configuración *femto*, la más ligera de la familia, adaptada a clasificación de imágenes. Sobre el backbone se añade una única capa lineal con diez salidas, una por clase morfológica. El ajuste fino es completo: se actualizan todos los parámetros del backbone y de la cabeza, no solo la cabeza de clasificación.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se mantuvo reservado como test; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del estudio, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, scheduler lineal con 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. Como aumento de datos se aplican random resized crop a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa resize y center crop a 224x224 px con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, por tratarse de un modelo de clasificación.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (Galaxy10 DECaLS): el modelo devuelve logits por clase a partir de un recorte de 224x224 px.
- Extracción de características visuales mediante el backbone ConvNeXt V2 femto, reutilizable para otras tareas de visión si se reajusta la cabeza.
- Inferencia ligera: 4,85 M de parámetros permiten ejecución en CPU y en GPU de gama baja con latencia muy reducida.
- Integración nativa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje.
- No dispone de modo *thinking*, visión generativa, audio ni otras modalidades más allá de la clasificación de imagen.

## Casos de uso

- Creación de catálogos morfológicos de galaxias: clasificar automáticamente recortes de DECaLS en las diez clases de Galaxy10 para poblar catálogos a gran escala, con un coste computacional mínimo gracias a los 4,85 M de parámetros.
- Etiquetado previo y triaje en pipelines astronómicos: usar el modelo como primer filtro para separar galaxias elípticas, espirales y otras morfologías antes de una revisión humana o de un modelo más pesado.
- Estudio de transferencia de modelos fundacionales: el checkpoint forma parte de una colección de 80 configuraciones (40 backbones x 2 regímenes), útil para comparar sistemáticamente el rendimiento de backbones generalistas en datos astronómicos.
- Prototipado rápido en CPU: al ser un modelo femto, puede desplegarse en entornos sin GPU para demos, cuadernos docentes o validación de pipelines de preprocesado.
- Investigación en morfología galáctica: servir de línea base reproducible (semilla 42, receta documentada, métricas por época) para experimentos que evalúen nuevas estrategias de aumento de datos o de ajuste fino.
- Clasificación por lotes en servicios de imagen: integrarlo como microservicio de clasificación de recortes astronómicos con `transformers` y un servidor HTTP ligero, dado su bajo consumo de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (conjunto de test reservado de Galaxy10 DECaLS, 1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 seleccionada) | 84,16 % |
| F1 ponderado (semilla 42, época 30 seleccionada) | 83,94 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 84,46 % +/- 0,26 |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 84,26 % +/- 0,28 |

Evolución seleccionada de métricas de test por época (semilla 42): época 1, 45,60 % de accuracy; época 10, 81,91 %; época 20, 83,54 %; época 30 (seleccionada), 84,16 %. El autor no publica comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo (4,85 M de parámetros, aproximadamente 19 MB de pesos) más el espacio de activaciones para batches pequeños; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; también puede exportarse a ONNX o TorchScript para servir con ONNX Runtime o TorchServe. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convnextv2-femto-1k-224-galaxy10-decals-full-v2 (este) | 4,85 M | imagen 224x224 | 84,16 % (test, semilla 42) | apache-2.0 | HuggingFace |
| facebook/convnextv2-femto-1k-224 (base sin ajustar) | ~4,85 M | imagen 224x224 | no disponible (modelo de clasificación ImageNet-1k) | apache-2.0 | HuggingFace |
| Otros backbones de la colección Vision Foundation Models Benchmark | no disponible | imagen 224x224 | no disponible en la información proporcionada | variable | HuggingFace |

No se dispone de resultados numéricos de otros clasificadores de morfología galáctica en la información proporcionada, por lo que la comparación cuantitativa con alternativas especializadas queda como no disponible.

## Limitaciones y advertencias

- Ámbito restringido: el modelo solo clasifica las diez clases de Galaxy10 DECaLS; no es un modelo generalista de visión ni de lenguaje.
- Riesgo de sesgo de dominio: entrenado exclusivamente con recortes de DECaLS; su rendimiento puede degradarse con imágenes de otros sondeos (SDSS, Hubble, JWST) o con distintas condiciones de ruido, escala y profundidad.
- Riesgo de alucinación en sentido de clasificación errónea: al ser un clasificador, puede asignar con alta confianza una clase incorrecta en galaxias ambiguas, en interacción o con morfología atípica; se recomienda umbral de confianza y revisión humana en producción.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; proceden del autor y no han sido validados de forma independiente.
- Limitaciones de idioma: no aplica, pero conviene señalar que el modelo no procesa texto ni metadatos.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; no obstante, el paper asociado está en revisión y la cita aún no está disponible.
- Reproducibilidad: la receta está documentada, pero las métricas por semilla muestran una variabilidad de +/- 0,26 puntos de accuracy, por lo que diferencias pequeñas entre modelos deben interpretarse con cautela.
- Integridad: el autor verificó que las predicciones del checkpoint coinciden con los logits guardados en el 100 % de las primeras 96 imágenes de test (diferencia máxima absoluta de 6,68e-06).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/convnextv2-femto-1k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-femto-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper asociado: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación, sin enlace disponible.
