# RizFie/Eleuthia-v3

## Resumen

Eleuthia-v3 es un modelo de clasificación de texto especializado en secuencias biológicas, desarrollado por el usuario RizFie y publicado en Hugging Face. Se trata de un fine-tuning de facebook/esm2_t12_35M_UR50D, el modelo de lenguaje proteico ESM-2 de Meta en su variante de 12 capas y aproximadamente 35 millones de parámetros. El resultado es un clasificador de 33.501.375 parámetros entrenado sobre un conjunto de datos no especificado por el autor.

El modelo se distribuye como un checkpoint de `transformers` en formato safetensors, con licencia MIT y compatible con los endpoints de Hugging Face. Su propósito declarado es la clasificación de texto, aunque dado su origen en ESM-2 (modelo entrenado sobre secuencias de aminoácidos) su uso natural es la clasificación de proteínas o secuencias biológicas, no de texto en lenguaje natural.

La relevancia de este modelo es limitada y muy específica: se trata de un fine-tuning de nicho con escasa documentación, sin datasets de entrenamiento identificados y con métricas declaradas por el propio autor (accuracy 0.8439, macro F1 0.8311 sobre un conjunto de evaluación no descrito). Es útil como referencia para quienes trabajen con ESM-2 en tareas de clasificación de proteínas, pero no debe considerarse un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2, 12 capas) |
| Parametros totales | 33.501.375 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 t12 soporta hasta 1024 tokens de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias proteicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es ESM-2 (Evolutionary Scale Modeling), un transformer encoder desarrollado por Meta AI para el modelado de lenguaje de proteínas. La variante t12_35M cuenta con 12 capas y aproximadamente 35 millones de parámetros, entrenada originalmente sobre secuencias de aminoácidos de UniProt. Eleuthia-v3 hereda esta arquitectura y añade una cabeza de clasificación ajustada mediante fine-tuning supervisado.

El entrenamiento se realizó con los siguientes hiperparámetros declarados: learning rate 1e-5, batch size 8 (tanto en entrenamiento como en evaluación), optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-8, scheduler cosine con warmup del 6 %, 15 épocas y precisión mixta nativa (AMP). El autor no especifica el dataset de entrenamiento ("None dataset" en la model card) ni la composición de los datos. Las curvas de entrenamiento muestran convergencia a partir de la época 3 (accuracy 0.8620, macro F1 0.8536) y un ligero sobreajuste posterior, con la mejor métrica de validación en esa época y un valor final en la época 6 de accuracy 0.8439 y macro F1 0.8311.

## Capacidades

- Clasificación de secuencias: el modelo está diseñado para asignar una etiqueta a una secuencia de entrada, presumiblemente proteica dado su origen ESM-2.
- Extracción de representaciones: al derivar de ESM-2, los pesos del encoder pueden emplearse para obtener embeddings de secuencias biológicas.
- Fine-tuning adicional: al ser un checkpoint de `transformers` con licencia MIT, puede reajustarse sobre nuevos datasets de clasificación.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de familias proteicas: dado un conjunto de secuencias de aminoácidos, el modelo puede asignar etiquetas de familia o función, aprovechando el conocimiento aprendido por ESM-2 durante su preentrenamiento en UniProt.
- Anotación funcional de proteínas: en pipelines de bioinformática, puede integrarse como clasificador para predecir categorías funcionales de secuencias nuevas antes de validación experimental.
- Filtrado de secuencias en bases de datos: para descartar o priorizar secuencias según una etiqueta de interés en conjuntos masivos, dado el reducido tamaño del modelo (33,5 M de parámetros) que permite procesar lotes grandes con recursos modestos.
- Detección de variantes o mutaciones con efecto funcional: si el dataset de fine-tuning estaba orientado a ello, el modelo puede clasificar secuencias mutantes frente a la referencia, aunque el autor no lo documenta.
- Base para experimentos académicos: como punto de partida reproducible (licencia MIT, safetensors, hiperparámetros documentados) para comparar estrategias de fine-tuning sobre ESM-2.
- Prototipado rápido en bioinformática: al caber en CPU y GPU de consumo, permite desplegar un clasificador de secuencias en entornos sin infraestructura dedicada.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de evaluación (no descrito):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.0341 |
| Accuracy | 0.8439 |
| Macro F1 | 0.8311 |

La model-index del repositorio no incluye resultados adicionales. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 134 MB solo para pesos (33,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 67 MB para pesos; menos de 1 GB en total con activaciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. También puede ejecutarse en CPU para inferencia por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (Pipeline de text-classification), TorchScript/ONNX para exportación, y servicios de inferencia compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU y aceptable en CPU para lotes moderados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eleuthia-v3 | 33,5 M | no disponible | Clasificacion (fine-tune de ESM-2) | MIT | Hugging Face |
| facebook/esm2_t12_35M_UR50D | ~35 M | 1024 tokens | Modelo de lenguaje proteico (MLM) | MIT | Hugging Face |
| facebook/esm2_t6_8M_UR50D | ~8 M | 1024 tokens | Modelo de lenguaje proteico (MLM) | MIT | Hugging Face |
| facebook/esm2_t30_150M_UR50D | ~150 M | 1024 tokens | Modelo de lenguaje proteico (MLM) | MIT | Hugging Face |

La comparación directa con otros clasificadores fine-tuneados no está disponible en la información proporcionada. Frente a su modelo base, Eleuthia-v3 añade una cabeza de clasificación y pesos ajustados, pero carece de la documentación y validación externa de los checkpoints oficiales de ESM-2.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "None dataset" y no describe la composición, el dominio ni el esquema de etiquetas, lo que impide evaluar la validez de las métricas declaradas.
- Métricas autodeclaradas: accuracy y macro F1 provienen del autor sin conjunto de evaluación público ni protocolo reproducible.
- Idiomas no especificados: al derivar de ESM-2, el modelo opera sobre secuencias de aminoácidos, no sobre lenguaje natural; no debe emplearse para tareas de NLP convencionales.
- Riesgo de sobreajuste: las curvas de entrenamiento muestran que la mejor validación se alcanza en la época 3, mientras que el checkpoint final corresponde a la época 6 con métricas inferiores.
- Sesgos desconocidos: al no documentarse el dataset, no puede evaluarse el sesgo hacia determinadas familias proteicas, organismos o longitudes de secuencia.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en secuencias fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base (MIT) y de los datos de preentrenamiento de ESM-2.
- Documentación insuficiente para producción: sin información sobre el esquema de etiquetas, la tokenización esperada ni el preprocesado, su integración en un pipeline real requiere trabajo de ingeniería inversa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RizFie/Eleuthia-v3
- Modelo base: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Paper de ESM-2 (Lin et al., 2022): https://www.biorxiv.org/content/10.1101/2022.07.20.500902v1
- Repositorio oficial de ESM en Meta AI: https://github.com/facebookresearch/esm
