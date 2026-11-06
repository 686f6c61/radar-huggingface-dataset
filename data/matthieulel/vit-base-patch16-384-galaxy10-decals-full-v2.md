# matthieulel/vit-base-patch16-384-galaxy10-decals-full-v2

## Resumen

`vit-base-patch16-384-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` como parte de una colección de 80 configuraciones (40 backbones preentrenados × dos regímenes de adaptación) para el benchmark de modelos fundacionales de visión aplicados a datos astronómicos. Se trata de un fine-tuning completo de `google/vit-base-patch16-384`, un Vision Transformer de 86 millones de parámetros que procesa imágenes de 384×384 píxeles divididas en parches de 16×16.

El modelo resuelve la clasificación en 10 clases de morfología galáctica sobre el dataset Galaxy10 DECaLS, con un conjunto de test reservado de 1.774 imágenes. Alcanza un 85,34 % de accuracy y un F1 ponderado de 85,05 % en la época seleccionada (época 10 de 30), con una media de 85,36 ± 0,20 % sobre tres semillas. Es relevante porque forma parte de un estudio sistemático y reproducible que compara modelos fundacionales de visión en un dominio científico concreto, con protocolo de entrenamiento idéntico para todos los backbones y métricas por época publicadas.

La licencia Apache 2.0 y el formato safetensors lo hacen directamente desplegable con la librería `transformers` en pipelines de clasificación de imágenes, sin restricciones de uso comercial derivadas de la licencia del modelo (aunque conviene revisar las condiciones del dataset de origen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 384×384) |
| Parametros totales | 86.098.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 384×384 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión original fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con `transformers` vía `AutoModelForImageClassification`) |

## Arquitectura y entrenamiento

La arquitectura es un ViT-Base estándar: transformer encoder con atención multi-cabeza sobre secuencias de parches de 16×16 píxeles extraídos de imágenes de 384×384, más un token CLS y embeddings posicionales. La cabeza de clasificación es una única capa lineal con 10 salidas, una por clase de morfología galáctica. No hay innovaciones arquitectónicas propias: el valor del modelo está en el protocolo de adaptación y en la evaluación sistemática.

El entrenamiento consistió en un fine-tuning completo (todos los parámetros actualizados) sobre Galaxy10 DECaLS (17.736 imágenes), con split estratificado por clase: 14.188 de entrenamiento, 1.774 de validación y 1.774 de test reservado. Se usó AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión fp32 (TF32 desactivado) y una sola GPU. Aumentación: random resized crop a la resolución de entrada y flip horizontal aleatorio. Evaluación: resize y center crop a 384×384 px con la normalización del image processor del checkpoint. La época seleccionada (10) es la de mínima pérdida de validación. El paper asociado está en revisión en *Astronomy and Computing* (versión revisada, 2026).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (dataset Galaxy10 DECaLS).
- Extracción de características visuales de imágenes astronómicas de 384×384 px.
- Fine-tuning adicional sobre nuevos datasets de clasificación de imágenes (arquitectura ViT estándar).
- Inferencia por lotes con `transformers` y `torchvision`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación automática de morfología galáctica en pipelines de sondeos astronómicos: el modelo etiqueta imágenes de 384×384 px en 10 clases con un 85,34 % de accuracy, adecuado para preclasificar grandes volúmenes antes de revisión humana.
- Etiquetado asistido en proyectos de ciencia ciudadana: usar las predicciones como sugerencia inicial para voluntarios que clasifican galaxias, reduciendo el tiempo por imagen y priorizando casos de baja confianza.
- Filtrado y selección de candidatos en catálogos: aplicar el modelo a recortes de imágenes DECaLS para separar clases morfológicas de interés (por ejemplo, espirales frente a elípticas) antes de análisis morfométricos más costosos.
- Benchmark y comparación de backbones: al formar parte de una colección de 80 configuraciones con protocolo idéntico, sirve como referencia reproducible para evaluar otros modelos fundacionales de visión en el mismo dominio.
- Docencia y experimentación en visión por computador aplicada a astronomía: el checkpoint y las métricas por época permiten reproducir el entrenamiento y estudiar curvas de convergencia y sobreajuste en un dataset real.
- Punto de partida para fine-tuning en dominios astronómicos relacionados: al ser un ViT-Base estándar con licencia Apache 2.0, puede reentrenarse sobre otros datasets de imágenes celestes con recetas similares.
- Integración en servicios de inferencia de imágenes: el modelo es compatible con endpoints de Hugging Face y con `transformers`, lo que permite exponerlo como API de clasificación para aplicaciones de visualización astronómica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test reservado de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 10) | 85,34 % |
| F1 ponderado (semilla 42, época 10) | 85,05 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 85,36 ± 0,20 % |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 85,10 ± 0,17 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (86 M de parámetros × 4 bytes), más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para pesos, más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento completo, se usó una sola GPU (modelo pequeño).
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más; incluso en CPU es viable para inferencia por lotes moderados.
- Opciones de despliegue: `transformers` (PyTorch), endpoints de Hugging Face (tag `endpoints_compatible`), exportación a ONNX o TorchScript para servir con FastAPI/Triton. No se documenta soporte nativo de llama.cpp, Ollama o vLLM (orientados a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| vit-base-patch16-384-galaxy10-decals-full-v2 | 86,1 M | 384×384 | Clasificación de morfología galáctica (10 clases) | 85,34 % (test, semilla 42) | Apache 2.0 |
| google/vit-base-patch16-384 (base sin fine-tuning) | 86,1 M | 384×384 | Clasificación genérica de imágenes (ImageNet) | no disponible | Apache 2.0 |
| Otros backbones de la colección Vision Foundation Models Benchmark | variable | variable | Clasificación de morfología galáctica | no disponible en esta ficha | variable |

No se dispone en la información proporcionada de resultados de otros modelos comparables sobre el mismo dataset y protocolo; la colección del autor incluye 40 backbones, pero sus métricas no se detallan aquí.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de imágenes astronómicas; no es un modelo de lenguaje ni admite entradas de texto.
- El dominio de aplicación está acotado a imágenes similares a Galaxy10 DECaLS (recortes de 384×384 px); el rendimiento puede degradarse con otras resoluciones, instrumentos o rangos de brillo.
- Riesgo de sesgo inherente al dataset: las 10 clases y su distribución reflejan la composición de Galaxy10 DECaLS, no la diversidad morfológica real del cielo.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución o de baja calidad; conviene usar umbrales de confianza.
- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`); no hay validación independiente publicada.
- El paper asociado está en revisión; la cita definitiva aún no está disponible.
- Licencia Apache 2.0 permite uso comercial del modelo, pero deben revisarse las condiciones del dataset Galaxy10 DECaLS y de las imágenes DECaLS originales para usos derivados.
- No se documentan cuantizaciones oficiales ni optimizaciones de despliegue; el checkpoint se distribuye en fp32.
- Solo se ha evaluado con una semilla principal (42) y dos semillas adicionales para la media; la variabilidad entre semillas es baja (0,20 puntos de accuracy) pero limitada a tres ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch16-384-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-base-patch16-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), en revisión; sin enlace disponible.
