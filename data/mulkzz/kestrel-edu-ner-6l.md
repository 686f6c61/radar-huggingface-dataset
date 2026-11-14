# mulkzz/kestrel-edu-ner-6l

## Resumen

`mulkzz/kestrel-edu-ner-6l` es un modelo de reconocimiento de entidades nombradas (NER) para token-classification, especializado en la detección y pseudonimización de información personal identificable (PII) en textos del dominio educativo en coreano. Lo desarrolla el usuario `mulkzz` y se distribuye con licencia Apache-2.0. Su propósito concreto es filtrar datos sensibles (nombres de alumnos, centros escolares, direcciones, organizaciones) antes de que un docente envíe registros, actas de tutoría o borradores de informes a un LLM externo.

Técnicamente es un derivado del encoder `skt/A.X-Encoder-base` (arquitectura ModernBERT, 22 capas) que se ha destilado a 6 capas mediante una combinación de KL sobre logits, alineamiento coseno de estados ocultos y entropía cruzada dura. El resultado conserva los parámetros del tokenizer y embeddings del modelo base (69,09 M totales, de los que aproximadamente 30,69 M corresponden a operaciones matriciales no de embedding), con 276,36 MB en FP32 y 69,56 MB en INT8 dinámico por canal.

Su relevancia actual reside en dos factores: la creciente preocupación por la privacidad al usar servicios LLM de terceros en entornos educativos, y la publicación de una evaluación OOD independiente (`dorms-pii-ner-bench v1.1`) con intervalos de confianza y pruebas de McNemar que documentan mejoras medibles frente a un baseline BERT de 12 capas (`koredact-int8`). El modelo está pensado como componente de una pipeline de redacción, no como generador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (6 capas destiladas de 22, atención global/local con `global_attn_every_n_layers=2`, RoPE) |
| Parámetros totales | 69.088.521 (69,09 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base A.X-Encoder soporta ventanas largas, pero no se especifica el valor exacto para este derivado) |
| Tipos de cuantización | FP32 (safetensors y ONNX) e INT8 dinámico por canal (`MatMul + Gemm + Gather`, capa `classifier` en FP32) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (276,36 MB), `onnx/model.onnx` FP32 (276,54 MB), `onnx/model_int8.onnx` (69,56 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 6 capas obtenido por destilación desde un profesor de 22 capas (`mulkzz/kestrel-edu-ner-22l`), que a su vez es un fine-tuning de `skt/A.X-Encoder-base`. La selección de capas del profesor no es arbitraria: se eligen `[0, 4, 9, 13, 18, 20]` de modo que la correspondencia entre atención global/local y frecuencias RoPE sea 1:1 entre alumno y profesor. La destilación combina tres señales: KL sobre logits, alineamiento coseno de estados ocultos y entropía cruzada dura sobre etiquetas. Posteriormente se aplica una calibración de temperatura y margen sin código ($T = 1{,}648$, $\delta = +0{,}225$) que se absorbe en los pesos FP32 publicados.

El entrenamiento no usa datos reales de estudiantes ni texto generado por LLM comerciales: se basa en 24.000 ejemplos etiquetados sintetizados mediante reglas deterministas y gramáticas de slots, más 100.000 ejemplos sin etiquetar. Los ejemplos provienen de un banco congelado de 4.716 plantillas correspondientes a 12 géneros de tareas docentes, separado de forma estricta (clústeres y 8-gramas disjuntos) del conjunto de evaluación. La cuantización INT8 se valida contra FP32 con `max |Δlogit| = 8,23e-5` y coincidencia de `argmax` del 100,00 %, y la evaluación OOD reporta diferencias de recall de +0,1 %p sin significación estadística.

## Capacidades

- Etiquetado de tokens para NER con perfil `edu-v1`: persona (`PERSON`), centro escolar (`SCHOOL`), organización local, academia u hospital (`ORG`) y dirección en variantes de apartamento, lote y vial (`ADDRESS`).
- Detección de PII en textos educativos coreanos: registros de alumnos, actas de tutoría, borradores de informes y comunicaciones a familias.
- Reconocimiento de variantes onomásticas: nombres raros o multiculturales, apodos, nombres romanizados y formas combinadas del tipo `서아맘` (madre de Seoa).
- Manejo de ventanas de contexto largas mediante segmentación por ventanas de 400 tokens con precisión de frontera reportada del 100 % en INT8.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador de tokens puro.
- No es un modelo generativo: no produce texto, solo etiquetas BIO sobre la secuencia de entrada.

## Casos de uso

- **Redacción previa a LLM externo en herramientas docentes**: interceptar el texto del profesor antes de enviarlo a OpenRouter u otro proveedor y sustituir las entidades detectadas por placeholders. La latencia medida en el "PII Worker" (20.000 caracteres, 4 peticiones concurrentes) es de 4,40 s en p50 con INT8, lo que encaja en flujos interactivos.
- **Cumplimiento de protección de datos en plataformas educativas**: integrar el modelo en el backend para auditar y anonimizar registros académicos antes de almacenarlos o exportarlos, aprovechando que el INT8 ocupa 69,56 MB en disco y 715,8 MiB de RSS pico.
- **Despliegue en el navegador o en el borde**: la variante ONNX INT8 de 69,56 MB permite ejecución local en dispositivos sin GPU, útil para asistentes docentes offline o extensiones de navegador que nunca envían el texto a un servidor.
- **Preprocesado en pipelines de evaluación de LLM**: como etapa de saneamiento previa a la evaluación de modelos generativos con datos educativos, evitando fugas de PII en logs de evaluación y datasets de test.
- **Enmascarado en sistemas de tutoría conversacional**: detectar y pseudonimizar nombres de alumnos y centros en las transcripciones de chat antes de alimentar la memoria a largo plazo del asistente.
- **Filtrado de PII en corpus de investigación educativa**: aplicar el modelo como primer paso de un pipeline de anonimización sobre actas y borradores antes de compartir datasets con terceros, con la salvedad de revisar manualmente las direcciones viales (recall del 72 % en INT8).
- **Clasificación de documentos escolares con etiquetas de privacidad**: usar las etiquetas `PERSON`, `SCHOOL`, `ORG` y `ADDRESS` como señal para enrutar documentos a niveles de acceso distintos dentro de un repositorio institucional.

## Benchmarks y rendimiento

Evaluación OOD en `dorms-pii-ner-bench v1.1` (848 preguntas, 2.009 spans), comparando `reglas + koredact-int8` frente a `reglas + kestrel-6l v1.0` (INT8):

| Métrica | koredact-int8 | kestrel-6l v1.0 (INT8) | Δ (kestrel − koredact) |
|---|---:|---:|---|
| Tasa de preguntas con respuesta clave omitida (menor es mejor) | 17,0 % (109/643) | 12,3 % (79/643) | −4,7 %p, McNemar p = 0,0046 |
| Recall global de respuestas clave | 91,3 % (1545/1693) | 94,1 % (1593/1693) | +2,8 %p [+1,1, +4,6] |
| Recall `PERSON` (NER solo) | 96,1 % (94,7 %) | 95,7 % (95,0 %) | −0,4 %p [−2,0, +1,2], no inferior |
| Recall `SCHOOL` (NER solo) | 86,0 % (19,4 %) | 98,9 % (98,9 %) | +12,9 %p [+6,0, +20,9] |
| Recall `ORG` | 30,4 % (31/102) | 78,4 % (80/102) | +48,0 %p [+38,0, +57,9] |
| Recall `ADDRESS` | 85,7 % | 73,2 % | −12,5 %p [−23,6, −3,7] |
| Nombres raros o multiculturales fuera de pool | 80,5 % | 86,5 % | mejora |
| Apodos combinados (`서아맘`) | 63,6 % | 100,0 % | mejora |
| Nombres romanizados | 63,6 % | 90,9 % | mejora |
| Nombres con espacio entre apellido y nombre | 90,0 % | 20,0 % | regresión |
| Direcciones viales | 100,0 % | 72,0 % | regresión |

Paridad de cuantización FP32 vs INT8: McNemar p = 1,0000 en todos los tipos, diferencia global de recall +0,1 %p [−0,2, +0,4].

Rendimiento medido en CPU:

| Escenario | FP32 | INT8 | Mejora |
|---|---:|---:|---:|
| `w13c_eval` completo (8.484 muestras) | 164 s | 70 s | 2,34× |
| PII Worker 20.000 caracteres, 4 concurrentes (p50) | 10,02 s | 4,40 s | 2,28× |
| Local Bridge 20.000 caracteres (p50) | 3,84 s | 1,82 s | 2,11× |
| ECI C-4 (proyección corregida) | 32,0 s | 14,1 s | 2,27× |
| Tamaño en disco | 111,2 MB | 69,6 MB | −37,5 % |
| RSS pico Local Bridge | 596,4 MiB | 436,0 MiB | −26,9 % |
| RSS pico PII Worker | 1.009,1 MiB | 715,8 MiB | −29,1 % |

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo está diseñado para CPU. En FP32 ocupa 276,36 MB de pesos y en INT8 69,56 MB.
- **Memoria RAM**: 436 MiB de RSS pico en Local Bridge y 715,8 MiB en PII Worker con INT8, según las mediciones del autor.
- **GPU recomendadas**: no aplica; cualquier GPU moderna puede ejecutarlo, pero el diseño y las métricas publicadas son de inferencia en CPU.
- **Consumer GPU**: cabe en cualquier GPU de consumo, incluso integradas, por tamaño. No se han publicado cifras de throughput en GPU.
- **Despliegue**: `transformers` (safetensors), ONNX Runtime (FP32 e INT8), y por tanto compatible con `onnxruntime`, `optimum` y servidores que acepten ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de clasificación).
- **Latencia**: 1,82 s p50 para 20.000 caracteres en Local Bridge INT8 y 4,40 s p50 con 4 peticiones concurrentes de 20.000 caracteres en PII Worker.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `mulkzz/kestrel-edu-ner-6l` | ModernBERT 6 capas | 69,09 M | no disponible | Apache-2.0 | NER educativo coreano, PII |
| `infobank-corp/koredact-bert-base-onnx-int8` | BERT 12 capas | no disponible | no disponible | no disponible | NER PII coreano |
| `mulkzz/kestrel-edu-ner-22l` (profesor) | ModernBERT 22 capas | no disponible | no disponible | no disponible | NER educativo coreano, PII |

El baseline `koredact-int8` es el único comparable con métricas directas en el benchmark del autor. El profesor de 22 capas se menciona como referencia de calidad, pero no se han publicado sus métricas completas en la información disponible. No se dispone de comparaciones con otros modelos NER coreanos de dominio general.

## Limitaciones y advertencias

- **Idioma único**: solo coreano. No se ha entrenado ni evaluado en otros idiomas, incluido el castellano.
- **Regresiones documentadas en v1.0**: recall del 20 % en nombres con espacio entre apellido y nombre (frente al 90 % del baseline) y del 72 % en direcciones viales (frente al 100 %). El autor las identifica como tareas pendientes para v1.1.
- **Falsos positivos en `PERSON`**: la tasa de falsos positivos en preguntas sin PII sube del 16,4 % al 27,0 % respecto a la versión anterior, lo que puede provocar enmascarados innecesarios.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de etiquetado incorrecto (falsos positivos y negativos) en textos fuera de la distribución sintética de entrenamiento.
- **Sesgo de dominio**: entrenado exclusivamente con datos sintéticos generados por reglas; el rendimiento en jerga real de centros escolares, dialectos o abreviaturas no documentadas puede degradarse.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base `skt/A.X-Encoder-base` también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- **No es un generador**: no puede usarse para tareas de generación, resumen o razonamiento; su salida es una secuencia de etiquetas.
- **Uso en producción**: el autor indica explícitamente que v1.0 se publica como baseline público pero que el valor por defecto del producto queda en suspenso a la espera de v1.1, lo que sugiere cautela antes de adoptarlo como componente crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/kestrel-edu-ner-6l
- Modelo profesor de 22 capas: https://huggingface.co/mulkzz/kestrel-edu-ner-22l
- Modelo base: https://huggingface.co/skt/A.X-Encoder-base
- Baseline de comparación: https://huggingface.co/infobank-corp/koredact-bert-base-onnx-int8
- Paper de referencia sobre bootstrap por clústeres: https://arxiv.org/abs/2411.00640
