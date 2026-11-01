# matthieulel/swinv2-base-patch4-window8-256-galaxy10-decals-head-v2

## Resumen

`swinv2-base-patch4-window8-256-galaxy10-decals-head-v2` es un modelo de clasificación de imágenes desarrollado por el usuario de HuggingFace `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un ajuste fino del backbone `microsoft/swinv2-base-patch4-window8-256` para la tarea de clasificación de morfología de galaxias sobre el conjunto de datos Galaxy10 DECaLS, que distingue 10 clases morfológicas. El modelo forma parte de un estudio comparativo más amplio (40 backbones preentrenados bajo dos regímenes de adaptación) descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

La relevancia de este checkpoint es doble. Por un lado, demuestra la aplicabilidad de los modelos de visión preentrenados en dominios científicos especializados como la astronomía, donde los datos son escasos y las clases están desbalanceadas. Por otro, su diseño experimental —con el backbone completamente congelado y solo una cabeza lineal entrenada— lo convierte en una referencia útil para medir cuánto conocimiento transferible aporta un backbone genérico frente a un ajuste completo. El modelo alcanza un 48,14 % de accuracy y un 45,06 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes, con una desviación estándar de ±0,29 puntos porcentuales en accuracy a lo largo de tres semillas.

Arquitectónicamente se trata de un Swin Transformer V2 de tamaño base (86,9 millones de parámetros), con parches de 4×4 píxeles y ventanas de atención de 8×8, diseñado para entradas de 256×256 píxeles. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines de investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (jerárquica con atención por ventanas desplazadas) |
| Parametros totales | 86.904.066 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 256×256 píxeles) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo de visión de 87 M de parámetros, fp16/fp32 son los formatos naturales) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Swin Transformer V2, una arquitectura de visión jerárquica que construye representaciones multiescala mediante bloques de atención por ventanas desplazadas. La variante utilizada emplea parches de 4×4 píxeles y ventanas de atención de 8×8, con una resolución de entrada de 256×256 píxeles. El backbone se mantiene completamente congelado durante el ajuste fino, incluidas las estadísticas de sus capas de normalización; solo se entrena una cabeza lineal de 10 salidas que mapea el vector de características global a las clases morfológicas de galaxias.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se reservó como conjunto de evaluación final; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta fue idéntica para los 40 backbones del estudio: AdamW con betas 0,9/0,999, epsilon 1e-8, weight decay 0,1, recorte de gradiente 1,0, tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo de 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. Como aumentación se aplicaron random resized crop a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa redimensionado y recorte central a 256×256 píxeles seguido de la normalización del procesador de imágenes del checkpoint base. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre el dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante un backbone Swin Transformer V2 preentrenado y congelado.
- Inferencia determinista y reproducible: el autor verificó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados de la época seleccionada (diferencia máxima absoluta de 9,54e-07).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No incorpora modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo puede integrarse en flujos de reducción de datos de surveys como DECaLS para etiquetar automáticamente galaxias en 10 clases morfológicas, sustituyendo la inspección visual manual en volúmenes grandes de imágenes.
- **Etiquetado preliminar para entrenamiento de modelos mayores**: al ser un modelo ligero (86,9 M de parámetros, 0,3 GB en disco), puede usarse como anotador débil o generador de pseudo-etiquetas en conjuntos no etiquetados, que luego se refinan manualmente o se emplean para ajustar modelos más grandes.
- **Referencia de línea base en estudios de transferencia**: su condición de backbone congelado con cabeza lineal lo convierte en una línea base reproducible para comparar con otros regímenes de adaptación (ajuste completo, LoRA, etc.) en tareas de morfología galáctica.
- **Investigación en visión aplicada a astronomía**: sirve como punto de partida para estudiar qué características visuales genéricas son transferibles al dominio astronómico y qué clases morfológicas se confunden con mayor frecuencia (el F1 ponderado de 45,06 % frente al 48,14 % de accuracy sugiere desbalanceo entre clases).
- **Prototipado rápido en entornos con recursos limitados**: al caber en cualquier GPU de consumo (incluso en CPU para inferencia por lotes pequeños), permite validar hipótesis de clasificación morfológica sin infraestructura dedicada.
- **Educación y divulgación**: la simplicidad del modelo (cabeza lineal sobre backbone congelado) y su licencia permisiva lo hacen adecuado para talleres y cursos sobre transferencia de aprendizaje en dominios científicos.
- **Integración en servicios de clasificación de imágenes astronómicas**: mediante `transformers` y el procesador de imágenes incluido, puede desplegarse como endpoint de clasificación en un servicio web o API interna para consultas puntuales sobre imágenes de galaxias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada 30) | 48,14 % |
| F1 ponderado (semilla 42, época seleccionada 30) | 45,06 % |
| Accuracy media ± desviación estándar (semillas 42, 1, 2) | 48,38 ± 0,29 % |
| F1 ponderado medio ± desviación estándar (semillas 42, 1, 2) | 45,17 ± 0,30 % |

Evolución de la accuracy de test a lo largo del entrenamiento (semilla 42): 15,16 % en la época 1, 37,99 % en la época 5, 46,56 % en la época 14, 48,20 % en la época 25 y 48,14 % en la época 30 (seleccionada). La pérdida de validación desciende de 2,2284 en la época 1 a 1,4778 en la época 30. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,35 GB en fp32 (86,9 M de parámetros × 4 bytes) y unos 0,18 GB en fp16. El repo completo ocupa 0,3 GB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100, H100 y GPUs integradas modernas.
- **Cabe en GPU de consumo**: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` (PyTorch) es la vía documentada por el autor. Al ser un modelo de visión, no aplican vLLM, llama.cpp, Ollama ni TGI. Puede exportarse a ONNX o TorchScript para despliegue en producción, aunque el autor no lo documenta.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño reducido del modelo y la entrada de 256×256 píxeles, se espera una latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo estudio (la colección *Vision Foundation Models Benchmark* incluye 40 configuraciones, pero solo se documentan los resultados de este checkpoint). Se indica a continuación una comparación estructural con alternativas genéricas de clasificación de imágenes, sin datos de rendimiento en Galaxy10 DECaLS:

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (SwinV2-base + cabeza lineal) | 86,9 M | 256×256 px | Apache 2.0 | HuggingFace |
| `microsoft/swinv2-base-patch4-window8-256` (base sin ajustar) | ~87 M | 256×256 px | Apache 2.0 | HuggingFace |
| ViT-base-patch16-224 (referencia genérica) | ~86 M | 224×224 px | Apache 2.0 | HuggingFace |
| ResNet-50 (referencia genérica) | ~25 M | 224×224 px | Apache 2.0 | HuggingFace |

La comparación de rendimiento en la tarea específica de morfología galáctica no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Rendimiento moderado**: la accuracy del 48,14 % sobre 10 clases está solo 38 puntos por encima del azar (10 %), lo que indica que la tarea es difícil y el régimen de backbone congelado limita la adaptación al dominio astronómico.
- **Desbalanceo de clases**: la diferencia entre accuracy (48,14 %) y F1 ponderado (45,06 %) sugiere que las clases mayoritarias dominan las predicciones y las clases minoritarias se clasifican peor.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo puede asignar con alta confianza una clase incorrecta en imágenes ambiguas o de baja calidad; no debe usarse como única fuente de verdad en catalogación científica sin validación humana.
- **Sesgos de dominio**: el backbone fue preentrenado en ImageNet y congelado; puede arrastrar sesgos visuales de ese dominio que no se corrigen con una cabeza lineal.
- **Limitaciones de contexto e idioma**: no aplica (modelo de visión sin entrada de texto ni ventana de contexto lingüística).
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, el autor no ofrece garantías sobre el rendimiento en producción.
- **Caveat de producción**: el modelo se entrenó con una única GPU y 30 épocas; la época seleccionada es la 30, lo que sugiere que el entrenamiento podría beneficiarse de más épocas o de un ajuste parcial del backbone. La validación se usó solo para seleccionar época, no para ajustar hiperparámetros.
- **Verificación de integridad**: el autor verificó la reproducibilidad de las predicciones, pero los resultados de benchmarks están marcados como `verified: false` en el model-index.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-base-patch4-window8-256-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-base-patch4-window8-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs y métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación según el autor.
