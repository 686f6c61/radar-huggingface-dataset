# leomaurodesenv/electra-base-discriminator-jailbreakv-28k

## Resumen

`leomaurodesenv/electra-base-discriminator-jailbreakv-28k` es un checkpoint de clasificación de texto publicado en Hugging Face por el usuario `leomaurodesenv`. Se distribuye como un modelo afinado (etiqueta `generated_from_trainer`) sobre un corpus no documentado en la model card: el autor lo describe textualmente como "fine-tuned version of distilbert/distilbert-base-uncased on an unknown dataset", aunque los tags del repositorio incluyen `electra` y el recuento real de parámetros en safetensors es de 109.483.778 (109,5 M), cifra coherente con un discriminador ELECTRA-base y no con DistilBERT-base (unos 66 M). Por el nombre del repositorio, el ajuste parece orientado a la detección de prompts de *jailbreak*, presumiblemente a partir del conjunto JailBreakV-28K, pero esto no está confirmado en la documentación.

El modelo resuelve una tarea de clasificación de secuencias (pipeline `text-classification`), no de generación: recibe texto y devuelve una etiqueta. Su interés práctico está en su uso como *guardrail* de entrada de bajo coste computacional en aplicaciones que exponen un LLM a usuarios finales, ya que con 109,5 M de parámetros puede ejecutarse en CPU o en cualquier GPU de consumo con un consumo de memoria inferior a 1 GB.

La relevancia actual del checkpoint es limitada y debe valorarse con cautela: acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, la model card está prácticamente vacía (el propio autor deja el comentario automático de `Trainer` pidiendo completarla), no se documenta el dataset de entrenamiento ni el espacio de etiquetas, y no se han publicado resultados en el `model-index` más allá del *accuracy* de validación reportado por el propio entrenamiento (0,9980).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder. El tag del repositorio indica `electra` (discriminador ELECTRA-base); la model card declara `distilbert/distilbert-base-uncased` como modelo base. Contradicción no resuelta por el autor |
| Parámetros totales | 109.483.778 (109,5 M), según el recuento real de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada. La arquitectura ELECTRA-base/BERT-base suele limitarse a 512 tokens, pero no se confirma en la ficha |
| Tipos de cuantización | No se publican versiones cuantizadas. Al distribuirse en safetensors, es convertible a int8/fp16 y exportable a ONNX, pero no hay artefactos oficiales |
| Idiomas soportados | No disponible. El checkpoint base declarado (`distilbert-base-uncased`) es monolingüe en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 4,4 GB) |
| Pipeline | text-classification |
| Etiquetas de salida | No disponible |
| Librería | transformers |
| Modelo base declarado | distilbert/distilbert-base-uncased |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La información disponible no permite fijar con certeza la arquitectura. El repositorio se etiqueta como `electra`, mientras que la model card y el `base_model` apuntan a `distilbert-base-uncased`; el título interno del README es `distilbert-base-uncased-jailbreakv-28k-augmented`. El dato objetivo del recuento de safetensors (109,5 M de parámetros) es compatible con un discriminador ELECTRA-base (aproximadamente 110 M) y no con DistilBERT-base (aproximadamente 66 M), lo que sugiere que el tag `electra` describe el modelo real y que la referencia a DistilBERT en la model card es un residuo de la plantilla automática. En cualquier caso, se trata de un encoder transformer con cabeza de clasificación de secuencias.

El procedimiento de entrenamiento sí está documentado en la model card: 10 épocas, `learning_rate` 2e-5, `train_batch_size` 8, `gradient_accumulation_steps` 2 (tamaño de lote efectivo 16), optimizador `adamw_torch_fused` con betas (0,9 / 0,999) y epsilon 1e-8, scheduler lineal con 50 pasos de *warmup*, semilla 42. El entrenamiento alcanzó 78.400 pasos totales (7.840 por época), lo que equivale a aproximadamente 1.254.400 ejemplos procesados y en torno a 125.440 ejemplos por época si no hubo muestreo con reemplazo. Ese volumen, muy superior a los 28.000 ejemplos que sugiere el nombre del repositorio, es consistente con la palabra "augmented" del título interno y apunta a un dataset ampliado mediante técnicas de aumento de datos no especificadas. No se documenta composición del dataset, idioma, número de etiquetas, ni si hubo RLHF, DPO o cualquier etapa de alineamiento (no aplicable en un clasificador). Tampoco se describe ninguna innovación técnica: es un ajuste supervisado estándar sobre un encoder preentrenado.

Versiones de framework declaradas: Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto mediante el pipeline `text-classification` de Transformers.
- Detección presumible de prompts de *jailbreak* o entradas maliciosas, inferida únicamente del nombre del repositorio (sufijo `jailbreakv-28k`); no confirmada en la model card.
- Salida de etiqueta con puntuación de confianza asociada, en función del número de clases del checkpoint (no documentado).
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- No genera texto: no es un modelo causal ni de instrucciones.
- No soporta *tool calling* ni *function calling*.
- No soporta orquestación de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo *thinking*.
- Capacidad multilingüe: no disponible; el modelo base declarado es `uncased` en inglés, por lo que el comportamiento fuera del inglés no está verificado.

## Casos de uso

- Filtrado de entrada en aplicaciones con LLM: colocar el clasificador delante del modelo generativo para etiquetar cada *prompt* del usuario antes de enviarlo al LLM. Con 109,5 M de parámetros y menos de 1 GB de memoria, el coste de añadir esta capa es despreciable frente al del modelo generativo.
- Moderación de contenido en chats multi-turno: clasificar cada mensaje entrante en un servicio de atención al cliente o de asistencia para derivar a revisión humana las entradas marcadas como intento de manipulación.
- *Red teaming* y evaluación de defensas: usar el clasificador como línea base sobre la que medir la tasa de evasión de nuevas familias de ataques, comparando sus predicciones con conjuntos de *prompts* etiquetados manualmente.
- Etiquetado de corpus de seguridad a gran escala: procesar por lotes millones de registros de logs conversacionales en CPU para construir datasets de entrenamiento o para auditorías internas, gracias a su bajo coste por inferencia.
- Preprocesado dentro de pipelines de CI/CD: integrar el modelo como paso de validación que marque *prompts* problemáticos en suites de tests de aplicaciones conversacionales antes de un despliegue.
- Investigación académica sobre ataques adversariales: servir como punto de comparación reproducible (mismo checkpoint, misma licencia) en estudios sobre robustez de clasificadores frente a *prompt injection* y *jailbreaks*.
- Análisis forense de conversaciones: reconstruir la secuencia de intentos de manipulación en un histórico de interacciones marcando cada turno, útil para informes de incidentes.
- Enrutado de tráfico en producción: clasificar peticiones para decidir si se atienden con el modelo principal, con un modelo más restrictivo o se rechazan directamente.

## Benchmarks y rendimiento

El `model-index` de la model card no incluye ningún resultado (`results: []`), por lo que no hay cifras comparables con MMLU, HumanEval, GSM8K ni con benchmarks públicos de detección de *jailbreaks*. No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento son las métricas de validación del propio entrenamiento, declaradas por el autor:

| Época | Paso | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1,0 | 7.840 | 0,0123 | 0,9964 |
| 2,0 | 15.680 | 0,0094 | 0,9972 |
| 3,0 | 23.520 | 0,0122 | 0,9974 |
| 4,0 | 31.360 | 0,0106 | 0,9975 |
| 5,0 | 39.200 | 0,0088 | 0,9979 |
| 6,0 | 47.040 | 0,0101 | 0,9978 |
| 7,0 | 54.880 | 0,0083 | 0,9980 |
| 8,0 | 62.720 | 0,0074 | 0,9980 |
| 9,0 | 70.560 | 0,0078 | 0,9980 |
| 10,0 | 78.400 | 0,0071 | 0,9980 |

Resultado final declarado en la model card: pérdida 0,0071 y accuracy 0,9980 sobre el conjunto de evaluación. Se desconoce cómo se construyó ese conjunto de evaluación, si está separado del de entrenamiento y si comparte plantillas con él.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 440 MB solo de pesos, más activaciones y *overhead* del runtime; en la práctica cabe por debajo de 1 GB.
- VRAM en fp16/bf16: aproximadamente 220 MB de pesos.
- VRAM en int8 (tras cuantización propia): aproximadamente 110 MB de pesos.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en GTX 1050/1650, RTX 3060, RTX 4090, A100 y H100; en estas dos últimas el factor limitante será el ancho de banda de lanzamiento de *kernels*, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de memoria, incluidos iGPU con memoria compartida.
- Inferencia en CPU: totalmente viable; al ser un encoder de 110 M, es apto para servicios de bajo tráfico o procesamiento por lotes sin acelerador.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Inference Endpoints (el repositorio está marcado como `endpoints_compatible`), exportación a ONNX Runtime, TorchScript, y servidores de inferencia con soporte de clasificación de secuencias, como Text Embeddings Inference. vLLM no es una vía natural para un modelo de clasificación de secuencias.
- Latencia y throughput: no disponibles. No se publican cifras de latencia, *tokens*/s ni ejemplos/s.

## Comparativa con modelos similares

No se dispone de datos verificados de otros clasificadores de *jailbreak* dentro de la información proporcionada. La comparación siguiente se limita a los checkpoints citados explícitamente en el repositorio; los datos de las filas de ELECTRA-base y DistilBERT provienen del conocimiento general de esos checkpoints publicados y no de la información facilitada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `leomaurodesenv/electra-base-discriminator-jailbreakv-28k` | 109,5 M | No disponible | Apache 2.0 | safetensors | Repositorio público, 0 descargas |
| ELECTRA-base discriminator (Google) | ~110 M | 512 tokens (estándar del checkpoint original) | Apache 2.0 | safetensors / TF | Ampliamente distribuido |
| DistilBERT-base-uncased (Hugging Face) | ~66 M | 512 tokens | Apache 2.0 | safetensors / TF | Ampliamente distribuido |
| Otros clasificadores de *prompt injection* / *jailbreak* de la comunidad (por ejemplo, variantes basadas en DeBERTa-v3 o Prompt Guard) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Contradicción de nomenclatura sin resolver: el repositorio se etiqueta como ELECTRA pero declara DistilBERT como modelo base y usa ese nombre en el título del README. Cualquier integración debe verificar primero la arquitectura real cargando el checkpoint.
- Dataset de entrenamiento no documentado: la model card indica explícitamente "unknown dataset". No se conocen la composición, el idioma, el origen ni el espacio de etiquetas.
- Accuracy de validación de 0,9980 con pérdida de entrenamiento de 0,0000 en la época 8: valores compatibles con sobreajuste severo o con fuga de datos entre entrenamiento y evaluación. La métrica no es extrapolable a tráfico real.
- Riesgo de generalización limitada: si el ajuste se hizo sobre plantillas de ataque concretas del corpus JailBreakV-28K, la detección de familias de *jailbreak* nuevas o parafraseadas no está garantizada.
- Sesgo de dominio: un clasificador entrenado para marcar entradas maliciosas tiende a producir falsos positivos sobre consultas legítimas relacionadas con seguridad, *pentesting* o temas sensibles. No se documentan análisis de sesgo ni umbrales de decisión calibrados.
- Idiomas: el checkpoint base declarado es monolingüe en inglés; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Longitud de entrada: no confirmada, pero los encoders de esta familia suelen truncar a 512 tokens, lo que limita la clasificación de *prompts* largos o conversaciones completas.
- Uso en producción: no debe emplearse como única barrera de seguridad. Al tratarse de un clasificador supervisado, es vulnerable a ataques adversariales y a evasión por reescritura.
- Riesgo de alucinación: no aplica en sentido estricto, porque el modelo no genera texto; el riesgo equivalente es la clasificación errónea con alta confianza.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de licencia, pero el modelo se entrega sin garantías de ningún tipo.
- Madurez: 0 descargas y 0 *likes*; el checkpoint no ha sido validado por la comunidad y su model card está incompleta.
- Metadatos anómalos: la model card cita Transformers 5.2.0, PyTorch 2.10.0+cu128 y Datasets 4.5.0, versiones que exigen comprobar la compatibilidad real del entorno antes de cargar el modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/leomaurodesenv/electra-base-discriminator-jailbreakv-28k)
- [DistilBERT-base-uncased, modelo base declarado](https://huggingface.co/distilbert/distilbert-base-uncased)
- El autor no incluye enlace a *paper*, blog, repositorio de código ni demo.
- La búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo, su autor ni el dataset JailBreakV-28K; los enlaces obtenidos corresponden a páginas sin relación (clubes deportivos y descuentos comerciales) y se omiten por no ser pertinentes.
