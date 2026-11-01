# matthieulel/swinv2-tiny-patch4-window8-256-galaxy10-decals-head-v2

## Resumen

swinv2-tiny-patch4-window8-256-galaxy10-decals-head-v2 es un modelo de clasificación de imágenes desarrollado por matthieulel que adapta el backbone Swin Transformer V2 (variante tiny) de Microsoft a la clasificación morfológica de galaxias sobre el conjunto Galaxy10 DECaLS, con 10 clases de destino. El modelo forma parte de una colección comparativa de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

La adaptación se realizó mediante fine-tuning de solo cabeza (head-only fine-tuning): el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y únicamente se entrena una capa lineal de 10 salidas. El repositorio contiene por tanto los pesos completos del backbone original más la cabeza entrenada, con un total de 27.585.844 parámetros y un tamaño de repositorio de 0,1 GB.

El modelo es relevante como referencia metodológica: demuestra qué rendimiento se obtiene al congelar un backbone de visión generalista y entrenar solo un clasificador lineal en una tarea astronómica de dominio específico, con un protocolo reproducible (tres semillas, selección por pérdida de validación) y métricas publicadas por época. Con 48,44 % de accuracy media en test, sirve como línea base para comparar estrategias de adaptación más costosas, como el fine-tuning completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (variante tiny, patch 4, ventana 8, resolución 256) |
| Parametros totales | 27.585.844 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea como backbone Swin Transformer V2 tiny con parches de 4x4 y ventanas de atención de 8x8 sobre entradas de 256x256 píxeles, la arquitectura base publicada por Microsoft. Sobre las características extraídas por el backbone congelado se aplica una única capa lineal de 10 salidas que corresponde a las 10 clases morfológicas de Galaxy10 DECaLS. Durante el entrenamiento no se actualizó ningún parámetro del backbone ni las estadísticas de sus capas de normalización.

Los datos de entrenamiento proceden de Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como conjunto de test held-out; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta, idéntica para los 40 backbones de la colección, fue: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consistió en random resized crop a la resolución de entrada y volteo horizontal aleatorio; en evaluación se aplicó resize y center crop a 256x256 px con la normalización del procesador de imágenes del checkpoint. El software utilizado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. No se documenta uso de RLHF, DPO ni otras técnicas de alineación, por tratarse de un clasificador supervisado.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de 256x256 px de Galaxy10 DECaLS.
- Extracción de características visuales mediante un backbone Swin V2 tiny preentrenado en ImageNet y congelado.
- Inferencia determinista y reproducible: la verificación de integridad sobre las primeras 96 imágenes de test reproduce las predicciones guardadas en el 100 % de los casos, con diferencia absoluta máxima de logits de 2,35e-06.
- Integración directa con la librería transformers mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio, vídeo o lenguaje.
- No incorpora modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Clasificación morfológica de galaxias en pipelines astronómicos: el modelo recibe recortes de 256x256 px de imágenes DECaLS y devuelve una de 10 clases morfológicas, adecuado para preclasificar catálogos extensos antes de una revisión humana.
- Línea base en estudios comparativos de adaptación: al ser una configuración de solo cabeza sobre backbone congelado, sirve para medir la ganancia de estrategias más costosas (fine-tuning completo, LoRA) bajo un protocolo idéntico y reproducible.
- Etiquetado asistido de nuevos datos: las predicciones del modelo pueden usarse para priorizar qué imágenes de un nuevo sondeo requieren inspección visual, dado su coste de inferencia bajo (27,6 M de parámetros).
- Filtrado y control de calidad de datasets: detección de recortes con morfología anómala o mal etiquetada comparando la predicción del modelo con la etiqueta existente en el catálogo.
- Enseñanza y divulgación de astronomía computacional: el modelo cabe en cualquier GPU consumer y se ejecuta con un script de pocas líneas, lo que facilita demostraciones de clasificación morfológica en cursos y talleres.
- Despliegue en entornos con recursos limitados: con 0,1 GB de pesos en fp32 y sin dependencia de APIs externas, puede servirse en una CPU o en una GPU de gama baja para tareas de clasificación por lotes.
- Investigación sobre transferencia de modelos de visión generalistas a dominios científicos: permite estudiar cuánto conocimiento de ImageNet se transfiere a imágenes astronómicas sin reentrenar el backbone.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (conjunto de test held-out de Galaxy10 DECaLS, 1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 30 de 30) | 47,91 % |
| Weighted F1 (seed 42, época 30 de 30) | 44,57 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 48,44 +/- 0,51 % |
| Weighted F1 media +/- desviación típica (semillas 42, 1, 2) | 45,17 +/- 0,53 % |

Las métricas se calculan en la época de mínima pérdida de validación. La época seleccionada para la semilla 42 es la 30, con pérdida de validación de 1,4504 y accuracy de validación de 48,48 %. No se han publicado en la información disponible resultados de benchmarks estándar de visión (ImageNet, etc.) para este checkpoint adaptado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un batch pequeño, dado que el modelo tiene 27,6 M de parámetros y los pesos ocupan aproximadamente 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento original se realizó en una sola GPU en fp32.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060, RTX 4090 y similares; también es viable en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con PyTorch (vía `AutoModelForImageClassification`), exportación a TorchScript u ONNX no documentada en la información disponible; no se publican pesos GGUF para llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones de la misma colección ni de modelos alternativos de clasificación morfológica de galaxias con métricas comparables sobre el mismo split. La colección Vision Foundation Models Benchmark incluye 40 backbones preentrenados evaluados con la misma receta, pero sus resultados individuales no se detallan en la información disponible.

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|
| swinv2-tiny-patch4-window8-256-galaxy10-decals-head-v2 | 27,6 M | imagen 256x256 px | 47,91 % (seed 42); 48,44 +/- 0,51 % (3 semillas) | Apache 2.0 |
| Otros backbones de la colección (40 configuraciones) | no disponible | no disponible | no disponible | no disponible |
| Alternativas especializadas en morfología galáctica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: la accuracy en test ronda el 48 %, por lo que aproximadamente la mitad de las predicciones son incorrectas; no es adecuado como clasificador autónomo sin revisión en aplicaciones científicas.
- El backbone está congelado y solo se entrena una capa lineal, lo que limita la adaptación a las particularidades del dominio astronómico frente a un fine-tuning completo.
- El modelo está entrenado exclusivamente sobre Galaxy10 DECaLS; su comportamiento en otros sondeos, instrumentos o distribuciones de brillo y ruido no está caracterizado.
- Riesgo de sesgo por desbalance de clases: el weighted F1 (44,57 %) es inferior a la accuracy (47,91 %), lo que indica un rendimiento desigual entre clases morfológicas.
- No se documentan análisis de sesgos demográficos ni de otro tipo, ni evaluación de calibración de probabilidades.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un clasificador de imágenes sin garantías de idoneidad científica; el artículo asociado está en revisión y la cita definitiva no está disponible.
- El checkpoint no incluye capacidades de lenguaje, tool calling ni agentes; cualquier uso en pipelines conversacionales requeriría un modelo adicional.
- Las métricas declaradas no están verificadas de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-tiny-patch4-window8-256-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-tiny-patch4-window8-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones y métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (en revisión; cita pendiente de publicación, sin URL disponible)
