# azherali/CodeDetect-RoBERTa-T1

## Resumen
CodeDetect-RoBERTa-T1 es un modelo de clasificación de texto obtenido mediante fine-tuning de FacebookAI/roberta-base, publicado por el usuario azherali en HuggingFace. Su propósito, a juzgar por el nombre, es la detección de código, presumiblemente para distinguir texto que contiene código de texto que no lo contiene, aunque la model card no documenta explícitamente la tarea ni el dataset de entrenamiento. Se trata de un modelo encoder-only de 124,6 millones de parámetros, sin capacidad generativa.

El modelo es relevante por su simplicidad y su licencia MIT, que permite uso comercial sin restricciones adicionales. Con un rendimiento declarado de 0,9745 de accuracy y F1 en el conjunto de evaluación, puede resultar útil como clasificador binario ligero en pipelines de preprocesado, filtrado de datos o enrutamiento de consultas. No obstante, la ausencia de documentación sobre el dataset y la tarea concreta limita seriamente su reproducibilidad y su evaluación independiente.

Al estar basado en roberta-base, hereda una longitud de contexto de 512 tokens y un tokenizador BPE entrenado principalmente en inglés. No se dispone de información sobre los idiomas soportados ni sobre la composición del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder-only) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion dinamica via PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tuning completo de FacebookAI/roberta-base, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, adaptado para clasificación de texto mediante una cabeza de clasificación sobre el token `<s>`. No se trata de un modelo MoE ni híbrido, y no incorpora innovaciones arquitectónicas propias.

El entrenamiento se realizó durante 5 épocas con un learning rate de 2e-05, batch size de 64, optimizador AdamW fused, scheduler lineal con warmup del 10 % y precisión mixta nativa (AMP), con semilla 42. El conjunto de datos no se especifica en la model card (aparece como "None dataset"). La pérdida de validación final fue de 0,0912, con accuracy de 0,9745, F1 de 0,9745, precision de 0,9746 y recall de 0,9744. El mejor resultado de validación se alcanzó en la época 4 (accuracy 0,9750), con un ligero sobreajuste en la época 5. No se documenta el uso de RLHF, DPO ni técnicas de aumentación de datos.

## Capacidades
- Clasificación de texto binaria o multiclase (la etiqueta concreta no está documentada).
- Detección de código en texto, según sugiere el nombre del modelo, aunque no se confirma en la model card.
- Inferencia rápida en CPU y GPU gracias a su tamaño reducido (124,6 M de parámetros).
- Compatible con `text-embeddings-inference` y endpoints de HuggingFace.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni visión.
- Capacidades multilingües no documentadas; el tokenizador de roberta-base está orientado al inglés.

## Casos de uso
- Filtrado de datasets: clasificar documentos o fragmentos como "contienen código" o "no contienen código" antes de entrenar modelos generativos, reduciendo ruido en corpus de texto natural.
- Enrutamiento de consultas en asistentes técnicos: derivar consultas que incluyen snippets de código a un modelo especializado en programación y el resto a un modelo conversacional general.
- Moderación de contenido en foros: detectar publicaciones con bloques de código para aplicar políticas específicas de formato o revisión.
- Preprocesado de pipelines de documentación: separar secciones de prosa y secciones de código en repositorios o manuales para tareas posteriores de parsing o indexación.
- Clasificación de tickets de soporte: identificar tickets que requieren análisis de código y asignarlos a ingenieros especializados.
- Etiquetado asistido en anotación de datos: preetiquetar grandes volúmenes de texto para revisión humana, aprovechando su bajo coste computacional y su licencia MIT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor está vacío. Los únicos datos son las métricas de validación declaradas durante el entrenamiento:

| Epoca | Validation loss | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|
| 1 | 0,0952 | 0,9660 | 0,9659 | 0,9659 | 0,9659 |
| 2 | 0,0811 | 0,9705 | 0,9705 | 0,9707 | 0,9703 |
| 3 | 0,0837 | 0,9721 | 0,9721 | 0,9724 | 0,9718 |
| 4 | 0,0796 | 0,9750 | 0,9749 | 0,9749 | 0,9750 |
| 5 | 0,0912 | 0,9745 | 0,9745 | 0,9746 | 0,9744 |

No se dispone de comparación con MMLU, HumanEval, GSM8K ni otros benchmarks estándar, que además no aplican a un modelo encoder-only de clasificación.

## Requisitos de hardware
- VRAM estimada: aproximadamente 0,5 GB en fp32 (124,6 M de parámetros × 4 bytes) más overhead de activaciones; menos de 1 GB en la práctica para inferencia con batch pequeño.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, T4, A10, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia en tiempo real con batches moderados.
- Opciones de despliegue: `transformers` (pipeline de text-classification), `text-embeddings-inference`, endpoints de HuggingFace, ONNX Runtime y TorchScript. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles de forma oficial; por tamaño, se espera un throughput de miles de secuencias por segundo en GPU moderna con batch grande, pero no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeDetect-RoBERTa-T1 | 124,6 M | 512 | Clasificacion de texto | MIT | HuggingFace |
| FacebookAI/roberta-base | 124,6 M | 512 | Modelo base (MLM) | MIT | HuggingFace |
| distilroberta-base | 82 M | 512 | Modelo base (MLM) | MIT | HuggingFace |
| CodeBERT (microsoft/codebert-base) | 125 M | 512 | Comprension de codigo | MIT | HuggingFace |

La comparación con CodeBERT es la más pertinente por temática, aunque CodeBERT está entrenado específicamente con pares código-lenguaje natural y este modelo no documenta su corpus. Frente a roberta-base, la única diferencia es el fine-tuning, cuyos datos no se detallan.

## Limitaciones y advertencias
- La model card no especifica la tarea exacta, las etiquetas ni el dataset de entrenamiento, lo que impide reproducir o validar el modelo de forma independiente.
- Riesgo de sobreajuste al dataset original: las métricas de validación son muy altas y no hay evaluación en un conjunto externo.
- Sesgos desconocidos: al no documentarse el corpus, no se puede evaluar el sesgo lingüístico, de dominio ni de género.
- Longitud de contexto limitada a 512 tokens; textos más largos requieren truncado o segmentación.
- Idiomas no documentados; el tokenizador de roberta-base está optimizado para inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- Licencia MIT permite uso comercial sin restricciones, pero la falta de documentación traslada al usuario toda la responsabilidad sobre el rendimiento en producción.
- Solo 57 descargas y 0 likes en el momento de la consulta: modelo de baja validación comunitaria.

## Enlaces
- HuggingFace: https://huggingface.co/azherali/CodeDetect-RoBERTa-T1
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
