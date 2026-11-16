# CordwainerSmith/GolemPII-v2-tiny

## Resumen

GolemPII-v2-tiny es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en hebreo. Lo desarrolla CordwainerSmith como la variante más pequeña de la familia GolemPII v2, que incluye también las versiones base (277M parámetros) y small (125M parámetros). El modelo se construye mediante fine-tuning del checkpoint `dicta-il/dictabert-tiny`, un BERT diminuto preentrenado para hebreo, y detecta 15 etiquetas de PII distintas.

El modelo resuelve un problema concreto: la anonimización y el filtrado de datos personales en textos hebreos, un idioma con escasa cobertura en herramientas comerciales de redacción automática. Con 44,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, está diseñado para escenarios donde la velocidad o el tamaño del despliegue priman sobre la precisión máxima, siendo aproximadamente cinco veces más rápido que la variante base según el autor.

Es relevante para equipos que necesitan preprocesar o enmascarar datos antes de enviarlos a modelos generativos, registrar conversaciones o cumplir requisitos de privacidad en pipelines de datos en hebreo. Su licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), fine-tuning de `dicta-il/dictabert-tiny` |
| Parámetros totales | 44.675.431 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT; la model card muestra `stride=128` para textos más largos mediante ventana deslizante) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de tipo BERT, concretamente un fine-tuning del modelo `dicta-il/dictabert-tiny`, que cuenta con 45M parámetros. La tarea es clasificación de tokens con 15 etiquetas de PII (la model card remite a la del modelo base para el detalle de etiquetas y datos de entrenamiento). El entrenamiento parte del mismo conjunto de datos que la variante base de la familia GolemPII v2, pero sobre el checkpoint tiny.

No se proporciona en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un modelo de clasificación de tokens). La evaluación se realizó una sola vez sobre la mitad `final` del benchmark REDACT tras el entrenamiento, según indica el autor.

## Capacidades

- Detección y clasificación de entidades de PII en texto hebreo con 15 etiquetas distintas.
- Reconocimiento de nombres de persona, organizaciones, direcciones, números de identificación, tarjetas de crédito, cuentas bancarias, correos electrónicos, teléfonos y fechas, entre otros (según el ejemplo de la model card).
- Soporte de textos superiores a 512 tokens mediante `stride` en el pipeline de `transformers` (ventana deslizante).
- Integración directa con el pipeline `token-classification` de Hugging Face con `aggregation_strategy="simple"`.
- No soporta tool calling, function calling, generación de texto, razonamiento multi-paso ni capacidades multimodales: es un modelo exclusivamente de etiquetado.
- Capacidad monolingüe: hebreo únicamente.

## Casos de uso

- Redacción automática de PII en correos y tickets de soporte: el modelo identifica nombres, identificadores y datos bancarios en hebreo, y el código de la model card muestra cómo sustituirlos por etiquetas como `[FIRST_NAME]` antes de almacenar o reenviar el texto.
- Preprocesamiento previo a modelos generativos: filtrar y enmascarar datos personales en prompts hebreos antes de enviarlos a un LLM, reduciendo el riesgo de fuga de datos en registros de conversación.
- Cumplimiento normativo y auditoría de datos: detección de PII en corpus hebreos almacenados para tareas de gobernanza de datos y protección de la privacidad.
- Anonimización de logs y JSON de aplicaciones: el modelo base se orienta a texto empresarial mixto hebreo-inglés; la variante tiny es adecuada cuando el volumen es alto y la latencia importa, aceptando menor precisión.
- Enmascarado en tiempo real en sistemas de mensajería o formularios: con 45M parámetros y ~0,2 GB, puede ejecutarse en CPU o GPU de gama baja con baja latencia.
- Construcción de datasets de entrenamiento anonimizados: etiquetado masivo de corpus hebreos antes de su publicación o uso en fine-tuning.
- Despliegue en entornos con recursos limitados: edge computing o contenedores pequeños donde la variante base (277M) no cabe o no cumple los requisitos de velocidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados por un tercero):

| Dataset | Métrica | Valor |
|---|---|---|
| REDACT PII Benchmark (hebreo, mitad held-out) | Precisión a nivel de carácter | 0,844 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Recall a nivel de carácter | 0,927 |
| REDACT PII Benchmark (hebreo, mitad held-out) | F1 a nivel de carácter | 0,884 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Precisión a nivel de entidad | 0,797 |
| REDACT PII Benchmark (hebreo, mitad held-out) | Recall a nivel de entidad | 0,968 |
| REDACT PII Benchmark (hebreo, mitad held-out) | F1 a nivel de entidad | 0,874 |
| NEMO corpus, nombres de persona | Precisión | 0,856 |
| NEMO corpus, nombres de persona | Recall | 0,945 |
| NEMO corpus, nombres de persona | F1 | 0,899 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (44,7M parámetros); en la práctica el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, aunque estas últimas están sobredimensionadas para 45M de parámetros.
- Cabe en GPU de consumo y también en CPU: es viable la inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de `transformers`, Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo indica), y exportación a otros runtimes compatibles con BERT (ONNX, etc.) aunque no se documenta explícitamente.
- Latencia y throughput: el autor afirma que es aproximadamente cinco veces más rápido que la variante base de 277M; no se publican cifras absolutas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Uso recomendado (según autor) | Licencia |
|---|---|---|---|
| GolemPII-v2-base | 277M | Hebreo mezclado con inglés en texto empresarial; mejor recall en identidad, tarjetas y números bancarios | CC BY 4.0 |
| GolemPII-v2-small | 125M | Prosa en hebreo; mejor distinción entre nombres de persona y organizaciones | CC BY 4.0 |
| GolemPII-v2-tiny (este modelo) | 45M | Velocidad o tamaño prioritarios; menor precisión en texto empresarial | CC BY 4.0 |

No se dispone en la información proporcionada de comparaciones con modelos de PII de otros autores ni con modelos multilingües de detección de PII.

## Limitaciones y advertencias

- Menor precisión que las variantes base y small en texto empresarial, según el propio autor.
- Modelo monolingüe: solo hebreo; no cubre texto en inglés ni otros idiomas.
- Límite de contexto de 512 tokens; para textos más largos es necesario usar ventana deslizante (`stride`), lo que puede fragmentar entidades en los bordes.
- Riesgo de falsos negativos y falsos positivos inherente a la clasificación de tokens; la precisión a nivel de entidad (0,797) es notablemente inferior al recall (0,968), lo que sugiere tendencia a sobre-detectar.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente.
- No se documentan sesgos específicos del modelo; al derivar de un corpus hebreo, puede heredar sesgos del preentrenamiento de `dictabert-tiny`.
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de integrarlo en productos.
- No es un modelo generativo: no puede sustituir texto ni razonar sobre el contenido, solo etiquetar tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CordwainerSmith/GolemPII-v2-tiny
- Modelo base de la familia: https://huggingface.co/CordwainerSmith/GolemPII-v2-base
- Variante small: https://huggingface.co/CordwainerSmith/GolemPII-v2-small
- Demo: https://huggingface.co/spaces/CordwainerSmith/GolemPII-v2-demo
- Código de evaluación: https://huggingface.co/CordwainerSmith/GolemPII-v2-base/tree/main/evaluation
- Modelo base de preentrenamiento: https://huggingface.co/dicta-il/dictabert-tiny
- Benchmark REDACT PII: https://huggingface.co/datasets/guneeshv/REDACT-PII-Benchmark
- Corpus NEMO: https://huggingface.co/datasets/imvladikon/nemo_corpus
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio del autor: https://liranbaba.dev
