# ajrayman/Artistic_Interests_binary

## Resumen

El modelo `ajrayman/Artistic_Interests_binary` es un clasificador de texto binario desarrollado por el usuario ajrayman mediante fine-tuning del modelo base `roberta-base` de Facebook AI. Está diseñado para determinar si un texto refleja o no intereses artísticos, aunque la documentación oficial no especifica el dominio ni el etiquetado exacto. Se distribuye bajo licencia MIT y se aloja en Hugging Face Hub con el pipeline de clasificación de texto.

Con 124,6 millones de parámetros, hereda la arquitectura transformer encoder-only de RoBERTa, optimizada para tareas de comprensión del lenguaje. La información pública no detalla la longitud de contexto, los idiomas soportados ni las cuantizaciones disponibles, aunque al tratarse de un fine-tune de roberta-base es razonable asumir un contexto de 512 tokens y soporte principal para inglés, si bien no está confirmado.

El interés de este modelo radica en su simplicidad y bajo coste de despliegue, siendo útil para experimentos de clasificación de intereses o análisis de contenido. No obstante, su rendimiento reportado (accuracy 0,6276) es modesto, lo que limita su uso en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa) |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `roberta-base`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con masked language modeling sobre un gran corpus de texto en inglés. La capa de clasificación añadida consiste en una proyección lineal que produce una salida binaria. No se han publicado detalles sobre el dataset de entrenamiento (aparece como "None" en la model card), ni sobre técnicas de alineación como RLHF o DPO.

Los hiperparámetros de fine-tuning incluyen una tasa de aprendizaje de 2e-05, batch size de 32, optimizador Adam con betas (0.9, 0.999), scheduler lineal con warmup ratio de 0.06 y 8 épocas. El entrenamiento se realizó con la librería Transformers 4.44.1 y PyTorch 1.11.0. La tabla de resultados muestra que el modelo se evaluó en 3 épocas (aunque se configuraron 8), con una pérdida de validación de 0.6554 en la mejor época.

## Capacidades

- Clasificación binaria de texto: determina si un texto pertenece a la categoría "interés artístico" o no, según el etiquetado del autor (no documentado).
- Inferencia eficiente: al ser un modelo pequeño (124M parámetros), puede ejecutarse en CPU o GPU de baja gama.
- Integración con el ecosistema Hugging Face: compatible con `transformers` y `endpoints_compatible`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües limitadas: no se especifican idiomas; probablemente entrenado mayormente en inglés por su base.

## Casos de uso

- Análisis de contenido en redes sociales: clasificar publicaciones o comentarios para identificar usuarios con intereses artísticos, útil para segmentación de audiencias o recomendación de contenido cultural.
- Curaduría automática de artículos o noticias: filtrar textos que traten sobre arte, literatura, música o diseño para boletines temáticos o agregadores de contenido.
- Moderación de foros y comunidades: detectar hilos o mensajes relacionados con actividades artísticas para dirigirlos a categorías específicas o moderadores especializados.
- Investigación en psicología del consumidor: analizar encuestas o respuestas abiertas para inferir preferencias estéticas de los participantes.
- Prototipado de sistemas de etiquetado: servir como punto de partida para un pipeline de clasificación de intereses, sustituible por un modelo más robusto si se requiere mayor precisión.
- Experimentación educativa: demostrar el proceso de fine-tuning de un transformer para clasificación de texto en cursos de NLP, gracias a su licencia MIT y tamaño reducido.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (no se especifica el tamaño ni la composición del mismo):

- Loss: 0.6554
- Accuracy: 0.6276
- Precision: 0.6041
- Recall: 0.7382
- F1: 0.6644
- AUC: 0.7003

La tabla de entrenamiento (extraída de la model card) muestra la evolución por época:

| Training Loss | Epoch | Step | Validation Loss | Accuracy | Precision | Recall | F1     | Auc    |
|:-------------:|:-----:|:----:|:---------------:|:--------:|:---------:|:------:|:------:|:------:|
| No log        | 1.0   | 118  | 0.6733          | 0.5729   | 0.5412    | 0.9501 | 0.6896 | 0.6612 |
| No log        | 2.0   | 236  | 0.6354          | 0.6276   | 0.5992    | 0.7681 | 0.6732 | 0.6958 |
| No log        | 3.0   | 354  | 0.6554          | 0.6276   | 0.6041    | 0.7382 | 0.6644 | 0.7003 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 124,6 millones de parámetros. En precisión fp32, el peso ocupa aproximadamente 500 MB; en fp16, unos 250 MB; en int8, unos 125 MB (estimaciones basadas en el tamaño estándar de los parámetros).
- Puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia. Para producción se recomienda una GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA T4, GTX 1650 o superior).
- Es compatible con las librerías estándar de Hugging Face: `transformers` (inferencia directa), `onnxruntime` (si se convierte a ONNX) y `TGI` (Text Generation Inference) para despliegue en servidores, aunque TGI está más orientado a generación.
- No se han publicado datos oficiales de latencia o throughput. En una GPU moderna (RTX 3090), se puede esperar un throughput de cientos de inferencias por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de métricas comparativas con otros modelos. Como referencia, se puede comparar con el modelo base `roberta-base` (124M parámetros, contexto 512, entrenado en inglés) y con otros clasificadores del mismo autor, como `ajrayman/Intellect_binary` (fine-tune de roberta-large, 355M parámetros) o `ajrayman/Cautiousness_binary`. Sin embargo, no hay datos de rendimiento públicos para estos últimos.

| Modelo | Parametros | Contexto | Accuracy (evaluacion) | Licencia |
|---|---|---|---|---|
| ajrayman/Artistic_Interests_binary | 124M | no disponible | 0.6276 | MIT |
| roberta-base (base) | 124M | 512 | no aplica (preentrenado) | MIT |
| ajrayman/Intellect_binary | 355M (roberta-large) | no disponible | 0.6511 | MIT |

## Limitaciones y advertencias

- Rendimiento limitado: con una accuracy de 0.6276, el modelo comete errores en aproximadamente un 37% de los casos, lo que lo hace poco fiable para decisiones críticas.
- Falta de transparencia: no se documenta el dataset de entrenamiento, el proceso de etiquetado ni el dominio de aplicación, lo que impide evaluar su generalización.
- Posible sesgo: al derivar de roberta-base, puede heredar sesgos de género, raza o cultura presentes en los datos de preentrenamiento. No se han realizado auditorías de sesgo.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas incorrectas si el texto de entrada está fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías de precisión o idoneidad para un propósito específico.
- Sin soporte para contexto largo: la arquitectura base tiene un límite de 512 tokens; textos más largos deben truncarse, lo que puede perder información relevante.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ajrayman/Artistic_Interests_binary)
- [Perfil del autor en Hugging Face](https://huggingface.co/ajrayman)
- [Otro modelo del autor: ajrayman/Intellect_binary](https://huggingface.co/ajrayman/Intellect_binary)
- [Modelo base: FacebookAI/roberta-base](https://huggingface.co/FacebookAI/roberta-base)
