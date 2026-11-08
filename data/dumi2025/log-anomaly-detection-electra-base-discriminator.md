# Dumi2025/log-anomaly-detection-electra-base-discriminator

## Resumen

`Dumi2025/log-anomaly-detection-electra-base-discriminator` es un modelo de clasificación de texto obtenido mediante fine-tuning completo de `google/electra-base-discriminator` sobre líneas individuales de logs HDFS. El autor (Dumi2025) lo publica como un clasificador binario que distingue entre líneas normales (etiqueta 0) y anómalas (etiqueta 1), con una longitud máxima de secuencia de 80 tokens. El modelo cuenta con 109.483.778 parámetros y un repositorio de 0,4 GB en formato safetensors.

La relevancia práctica del modelo reside en su enfoque granular: en lugar de clasificar secuencias completas de log, opera línea a línea, lo que permite señalar el evento exacto que desencadena la anomalía. El autor reporta métricas muy altas en el split de test retenido (F1 de 0,9721 para la clase anómala, ROC-AUC de 0,9951), aunque dichas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Su utilidad está acotada al dominio HDFS y a la detección de anomalías en logs de sistemas distribuidos, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA, discriminador) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 80 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible (entrenado sobre logs HDFS, predominantemente texto técnico en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/electra-base-discriminator`, un transformer encoder de tipo ELECTRA en el que cada token se clasifica como real o sustituido durante el preentrenamiento. Sobre esa base, el autor aplica un fine-tuning completo (no LoRA ni adaptadores) para una tarea de clasificación binaria de secuencia, con 10.000 pasos, batch de 32, learning rate de 5e-5, optimizador `adamw_torch` y precisión bf16 sobre una NVIDIA RTX A5000 en RunPod. El checkpoint seleccionado es el que maximiza el F1 de la clase anómala en validación (`checkpoint-10000`).

El dataset de entrenamiento es `Prasasthy/trainforother`. Según la model card, se eliminaron 8.568 duplicados exactos y se aplicó un split estratificado 80/10/10 con semilla 42 antes de cualquier balanceo; el sobremuestreo de anomalías se realizó únicamente sobre el split de entrenamiento. La longitud máxima de secuencia se fijó en 80 tokens, coherente con el procesamiento línea a línea de logs HDFS. No se documentan fases de RLHF, DPO ni innovaciones arquitectónicas adicionales más allá del fine-tuning estándar.

## Capacidades

- Clasificación binaria de líneas de log HDFS: normal (0) frente a anomalía (1).
- Procesamiento de secuencias cortas de hasta 80 tokens, adecuado para líneas de log individuales.
- Detección granular de eventos anómalos a nivel de línea, no solo a nivel de sesión o bloque de log.
- Entrenamiento con oversampling de la clase minoritaria, lo que favorece la sensibilidad hacia anomalías poco frecuentes.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y su probabilidad asociada.
- No se documentan capacidades multilingües, de visión ni de audio.

## Casos de uso

- Monitorización de clústeres HDFS en producción: el modelo puede puntuar cada línea de log entrante y marcar aquellas con alta probabilidad de anomalía, permitiendo alertas tempranas sobre fallos de nodos, errores de escritura o problemas de replicación.
- Enriquecimiento de pipelines de observabilidad: integrado como etapa de clasificación dentro de un stack ELK o similar, añade una etiqueta de anomalía a cada evento antes de su indexación, facilitando búsquedas y dashboards filtrados por riesgo.
- Triaje previo a intervención humana: al operar línea a línea con alta precisión reportada (0,9737), reduce el volumen de eventos que un SRE debe revisar manualmente en incidentes de gran escala.
- Detección de patrones de fallo recurrentes: al clasificar líneas individuales, permite agrupar y correlacionar anomalías por tipo de mensaje, útil para análisis post-mortem.
- Validación de pipelines de datos: puede emplearse como filtro de calidad sobre logs sintéticos o recién ingeridos, señalando líneas que se desvían del patrón esperado.
- Investigación en detección de anomalías sobre logs: sirve como baseline reproducible (semilla 42, hiperparámetros documentados) para comparar con enfoques basados en secuencias completas o modelos generativos.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test retenido (procedentes de la model card, no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9982 |
| Precision (anomalia) | 0,9737 |
| Recall (anomalia) | 0,9705 |
| F1 (anomalia) | 0,9721 |
| ROC-AUC | 0,9951 |
| PR-AUC | 0,9773 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109,5 M de parámetros), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en bf16/fp16: alrededor de 0,25 GB para pesos, con un consumo total típicamente inferior a 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entrenó con una NVIDIA RTX A5000, pero para inferencia bastan RTX 3060, RTX 4060, T4 o superiores.
- Cabe holgadamente en GPU de consumo (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, TorchScript, o exportación a GGUF para llama.cpp/Ollama si se convierte el checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño y la longitud de secuencia (80 tokens), se espera un throughput alto en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/log-anomaly-detection-electra-base-discriminator | 109,5 M | 80 tokens | Clasificación binaria de líneas de log HDFS | no disponible | Hugging Face (0 descargas) |
| google/electra-base-discriminator | 109,5 M | 512 tokens (configuración original) | Preentrenamiento ELECTRA, ajustable a clasificación | Apache 2.0 | Hugging Face |
| Dumi2025/log-anomaly-detection-model-new | no disponible | no disponible | Detección de anomalías en logs (variante del mismo autor) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre logs HDFS; su comportamiento fuera de ese formato o de otros sistemas de ficheros distribuidos no está validado.
- Longitud de contexto de 80 tokens: líneas de log más largas se truncan, lo que puede eliminar información relevante para la clasificación.
- Métricas no verificadas: los resultados de la model card proceden del propio autor y no han sido replicados de forma independiente.
- Riesgo de sobreajuste al dataset `Prasasthy/trainforother`: el sobremuestreo de anomalías solo en entrenamiento puede inflar el recall en test si la distribución de test difiere de la de producción.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de un despliegue en producción.
- Idiomas no declarados: aunque los logs HDFS suelen estar en inglés técnico, no hay garantía de comportamiento en logs con texto en otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; con precision y recall cercanos a 0,97, se espera aproximadamente un 3 % de errores en cada clase.
- Sin mantenimiento aparente: creado y actualizado el mismo día (2026-11-08), sin descargas ni likes, lo que sugiere un proyecto personal sin soporte.
- No apto como modelo de propósito general: no genera texto, no razona y no soporta tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/log-anomaly-detection-electra-base-discriminator
- Modelo base: https://huggingface.co/google/electra-base-discriminator
- Dataset de entrenamiento: https://huggingface.co/datasets/Prasasthy/trainforother
- Variante del mismo autor: https://huggingface.co/Dumi2025/log-anomaly-detection-model-new
- Repositorio de la variante: https://huggingface.co/Dumi2025/log-anomaly-detection-model-new/tree/main
