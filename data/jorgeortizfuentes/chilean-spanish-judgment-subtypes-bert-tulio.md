# jorgeortizfuentes/chilean-spanish-judgment-subtypes-bert-tulio

## Resumen

El modelo `chilean-spanish-judgment-subtypes-bert-tulio` es un clasificador de tokens (span classification) desarrollado por Jorge Ortiz Fuentes, diseñado para etiquetar los cinco subtipos de juicio (judgment) de la teoría de la valoración (Appraisal Theory) en el marco de la lingüística sistémico-funcional: `normality`, `capacity` y `tenacity` bajo el dominio de la estima social, y `veracity` y `propriety` bajo la sanción social. Se trata de un encoder BERT-base, concretamente un fine-tuning del modelo `dccuchile/tulio-chilean-spanish-bert` (TULIO), entrenado sobre el corpus chileno de actitudes (Chilean Spanish Attitude Corpus), un conjunto de 2 546 textos en español chileno anotados por tres lingüistas.

El modelo resuelve una tarea de etiquetado de secuencias a nivel de token con etiquetas planas (sin prefijos BIO), donde un span se define como una secuencia contigua de la misma clase no-`O`. Su relevancia radica en ser la entrada para la Tabla 3 del artículo asociado, que aborda el análisis computacional del lenguaje evaluativo en español chileno, un área con escasa cobertura en NLP para variantes dialectales. Con 109 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo ligero, adecuado para investigación académica y análisis lingüístico asistido por computadora. Los resultados reportados son modestos (F1 micro de 0,3635 a nivel de span estricto) y quedan por debajo del acuerdo entre expertos (0,600), lo que indica que la tarea no está resuelta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer) |
| Parámetros totales | 109 264 902 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | es (español chileno, es-CL) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (también compatible con PyTorch) |

## Arquitectura y entrenamiento
El modelo está basado en la arquitectura BERT-base del modelo TULIO, un encoder transformer preentrenado específicamente para español chileno. La cabeza de clasificación es una capa de token-classification que emite una etiqueta plana por token entre las clases `capacity`, `normality`, `propriety`, `tenacity`, `veracity` y `O`. El entrenamiento se realizó sobre el corpus chileno de actitudes, dividido en 1 782 textos de entrenamiento, 382 de validación y 382 de test, todos en español chileno (predominantemente tuits, con pequeñas muestras de cartas al director, columnas de opinión y reclamaciones de consumo). El fine-tuning se llevó a cabo con una tasa de aprendizaje de 2e-5, un tamaño de lote efectivo de 16, 10 épocas máximas con parada temprana (paciencia 3), suavizado de etiquetas de 0,1 y una longitud máxima de 512 tokens, sin uso de precisión mixta (fp16/bf16 desactivados). El corpus está restringido y requiere solicitud de acceso para fines de investigación no comercial, mientras que los pesos del modelo se distribuyen sin restricciones.

## Capacidades
- Clasificación de spans a nivel de token para los subtipos de juicio de la teoría de la valoración: `capacity`, `normality`, `propriety`, `tenacity` y `veracity`.
- Etiquetado plano sin prefijos BIO; un span se define como una secuencia contigua de la misma clase no-`-`.
- Uso sencillo mediante la interfaz `pipeline` de Transformers con `aggregation_strategy="simple"`.
- Compatible con la biblioteca `transformers` para inferencia y fine-tuning.
- Entrenado específicamente para el español chileno, incluyendo registros informales y lenguaje coloquial de redes sociales.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificación.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).

## Casos de uso
- **Análisis de discurso político**: el modelo puede etiquetar automáticamente los juicios de valor en textos de debate político chileno, identificando si un enunciado expresa capacidad, normalidad, tenacidad, veracidad o propiedad. Es adecuado porque fue entrenado sobre textos de conflicto político reales.
- **Investigación en lingüística sistémico-funcional**: permite a los investigadores anotar corpus de español chileno con los subtipos de juicio de la teoría de la valoración, reduciendo el trabajo manual de anotación.
- **Análisis de opiniones y quejas de consumidores**: aunque minoritario en el corpus, el modelo puede aplicarse a textos de quejas y opiniones para detectar juicios de valor sobre productos o servicios.
- **Estudios de polarización política**: al detectar juicios de valor social (estima o sanción), puede contribuir al análisis de la polarización y el lenguaje evaluativo en redes sociales chilenas.
- **Entrenamiento y evaluación de sistemas de detección de discurso de odio**: el corpus contiene insultos y amenazas; el modelo puede servir como componente en pipelines de análisis de toxicidad, aunque con cautela por sus limitaciones.
- **Análisis de cartas al director y columnas de opinión**: puede aplicarse a textos de opinión periodística para estudiar cómo se expresan los juicios de valor en el discurso público chileno.
- **Aplicaciones educativas de lingüística computacional**: como recurso didáctico para enseñar teoría de la valoración y clasificación de spans en español.

## Benchmarks y rendimiento
Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Métrica | Valor |
|---|---|
| Strict span-level micro F1 | 0,3635 |
| Strict span-level micro precision | 0,3420 |
| Strict span-level micro recall | 0,3878 |
| Acuerdo entre expertos en la tarea | 0,600 |

Resultados por clase (span-level estricto):

| Clase | Precisión | Recall | F1 | Spans de oro |
|---|---|---|---|---|
| `capacity` | 0,383 | 0,442 | 0,410 | 129 |
| `normality` | 0,260 | 0,299 | 0,278 | 67 |
| `propriety` | 0,377 | 0,456 | 0,413 | 226 |
| `tenacity` | 0,197 | 0,214 | 0,205 | 56 |
| `veracity` | 0,312 | 0,167 | 0,217 | 30 |

El modelo también reporta la variabilidad entre tres reentrenamientos (semillas 1, 2 y 3) con una media de F1 de 0,346 ± 0,012, y el rendimiento del run publicado (semilla 42) es el que se reproduce en la tabla superior. Todos los valores quedan por debajo del acuerdo entre expertos (0,600), lo que indica que la tarea no está resuelta.

## Requisitos de hardware
- El modelo tiene 109 millones de parámetros, lo que supone aproximadamente 437 MB en FP32 (0,4 GB de tamaño de repo).
- Inferencia en GPU: cabe en GPUs de consumo con 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) en FP32, y en 2-3 GB si se usa una cuantización de 8 bits (no proporcionada de fábrica).
- Inferencia en CPU: viable con un throughput de decenas de ejemplos por segundo para textos cortos (512 tokens), usando la biblioteca `transformers` en PyTorch.
- GPU recomendadas para entrenamiento o fine-tuning adicional: RTX 3090 o superior, aunque con 16 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` pipeline, `vLLM` no es necesario (no es generativo), se puede servir con `FastAPI` o `HuggingFace Inference Endpoints`.
- No se proporcionan datos de latencia y throughput oficiales.

## Comparativa con modelos similares
No se dispone de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia arquitectónica, se compara con otros encoders BERT para español:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jorgeortizfuentes/chilean-spanish-judgment-subtypes-bert-tulio` | 109 M | 512 | Clasificación de spans (juicio) | CC-BY-4.0 | Público |
| `dccuchile/tulio-chilean-spanish-bert` (base) | 109 M | 512 | MLM, español chileno | CC-BY-4.0 | Público |
| `dccuchile/bert-base-spanish-wwm-uncased` (BETO) | 110 M | 512 | MLM, español general | CC-BY-NC-SA 4.0 | Público |
| `PlanTL-GOB-ES/roberta-base-bne` | 125 M | 512 | MLM, español general | CC-BY 4.0 | Público |

Ninguno de los modelos comparados está específicamente entrenado para la tarea de clasificación de subtítulos de juicio, por lo que el modelo analizado es una opción especializada dentro de este nicho.

## Limitaciones y advertencias
- **Contenido sensible**: el corpus de entrenamiento contiene insultos, discursos de odio y amenazas, y el modelo reproducirá esa distribución de lenguaje; no es adecuado para aplicaciones sin supervisión humana.
- **Rendimiento limitado**: la F1 de 0,3635 está muy por debajo del acuerdo entre expertos (0,600). La tarea no está resuelta y las predicciones deben considerarse como una propuesta preliminar.
- **Sesgos de registro**: el corpus está dominado por tuits (2 420 de 2 546), por lo que el modelo puede funcionar peor en otros géneros textuales como artículos formales o conversaciones cotidianas.
- **Restricciones del corpus**: el corpus está gated y no puede redistribuirse; los pesos del modelo no redistribuyen los textos, pero el acceso al corpus para reproducción requiere solicitud.
- **Idioma específico**: solo cubre español chileno; no se puede esperar un rendimiento adecuado en otras variantes del español.
- **Riesgo de alucinación**: al ser un modelo de clasificación de tokens, no hay generación de texto, pero sí riesgo de etiquetar erróneamente spans con alta confianza.
- **Contexto limitado**: la ventana de 512 tokens puede ser insuficiente para textos largos, y no se proporciona una estrategia de truncamiento o segmentación.
- **Licencia del corpus**: el uso del corpus es solo para investigación no comercial; aunque el modelo se distribuye con CC-BY 4.0, el acceso a los datos de entrenamiento es restrictivo.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/jorgeortizfuentes/chilean-spanish-judgment-subtypes-bert-tulio)
- [Corpus chileno de actitudes (gated)](https://huggingface.co/datasets/jorgeortizfuentes/chilean-spanish-attitude-corpus)
- [Modelo base TULIO](https://huggingface.co/dccuchile/tulio-chilean-spanish-bert) (DOI: 10.57967/hf/1846)
- [Perfil de Jorge Ortiz Fuentes en Hugging Face](https://huggingface.co/jorgeortizfuentes)
- [Proyectos de Jorge Ortiz Fuentes](https://ortizfuentes.com/projects)
- [Perfil de GitHub de Jorge Ortiz Fuentes](https://github.com/jorgeortizfuentes/)

No se ha encontrado el enlace directo al artículo asociado en la información proporcionada; se menciona como "accompanying paper" en la model card.</think>## Resumen
El modelo `jorgeortizfuentes/chilean-spanish-judgment-subtypes-bert-tulio` es un clasificador de spans de tokens desarrollado por Jorge Ortiz Fuentes para etiquetar los cinco subtipos de juicio de la teoría de la valoración (Appraisal Theory) dentro de la lingüística sistémico-funcional: `capacity`, `normality` y `tenacity` bajo el dominio de la estima social, y `veracity` y `propriety` bajo la sanción social. Se trata de un ajuste fino del modelo TULIO, un BERT preentrenado específicamente para español chileno, sobre el corpus chileno de actitudes (Chilean Spanish Attitude Corpus), un conjunto de 2 546 textos anotados por tres lingüistas expertos. El resultado es un encoder de 109 millones de parámetros con una ventana de contexto de 512 tokens, especializado en la clasificación de secuencias de tokens en español de Chile.

La relevancia del modelo radica en abordar una tarea de análisis del lenguaje evaluativo en una variante dialectal con escasa cobertura en el procesamiento del lenguaje natural. Está orientado a la investigación en lingüística computacional y a aplicaciones de análisis de discurso en español chileno, aunque los resultados reportados son modestos (F1 micro de 0,3635 a nivel de span estricto) y quedan por debajo del acuerdo entre expertos (0,600), lo que indica que la tarea no está resuelta. Los pesos se distribuyen bajo licencia CC-BY-4.0 y el corpus de entrenamiento está protegido por acceso restringido para investigación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) |
| Parámetros totales | 109 264 902 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | es (español chileno, es-CL) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo está construido sobre la arquitectura BERT-base del modelo TULIO (`dccuchile/tulio-chilean-spanish-bert`), un encoder transformer preentrenado para el español chileno. La cabeza de clasificación es una capa de token-classification que emite etiquetas planas (sin prefijos BIO) para las clases `capacity`, `normality`, `propriety`, `tenacity`, `veracity` y `O`. Un span se define como una secuencia máxima de tokens consecutivos con la misma etiqueta no-`O`. El entrenamiento se realizó sobre el corpus chileno de actitudes, dividido en 1 782 textos de entrenamiento, 382 de validación y 382 de test, con una configuración de 10 épocas máximas, tasa de aprendizaje de 2e-5, tamaño de lote efectivo de 16, suavizado de etiquetas de 0,1 y parada temprana con paciencia 3. El procesamiento de datos se hizo con pre-tokenización por palabras (`is_split_into_words=True`) y la etiqueta de cada palabra se asignó a su primer sub-token. No se utilizó precisión mixta (fp16/bf16 desactivados). La evaluación se realizó a nivel de span estricto, donde una predicción solo cuenta si coincide la clase y ambos límites del span con la anotación dorada.

## Capacidades
- Clasificación de spans en español chileno para los cinco subtipos de juicio de la teoría de la valoración.
- Etiquetado plano de tokens con agregación de spans mediante `aggregation_strategy="simple"` en la interfaz `pipeline`.
- Compatible con la biblioteca `transformers` de Hugging Face.
- Entrenado para el registro de redes sociales (tuits mayoritariamente), así como cartas al editor, columnas de opinión y quejas de consumidores en menor proporción.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.
- No soporta tool calling, agentes, razonamiento multi-paso ni visión.
- Capacidad multilingüe limitada al español chileno.

## Casos de uso
- **Análisis de discurso político en Chile**: el modelo puede etiquetar los juicios de valor en tuits y textos de debate político, identificando si se expresa capacidad, normalidad, tenacidad, veracidad o propiedad. Es adecuado porque fue entrenado sobre textos de conflicto político real.
- **Investigación en lingüística sistémico-funcional**: permite a los investigadores anotar corpus en español chileno con los subtipos de juicio de la teoría de la valoración, reduciendo el esfuerzo manual de anotación y facilitando estudios cuantitativos.
- **Análisis de opinión pública**: puede aplicarse a columnas de opinión y cartas al editor para estudiar cómo se expresan los juicios sociales en el discurso público chileno.
- **Monitoreo de redes sociales**: detecta juicios de valor en tuits y comentarios, útil para estudios de polarización y análisis de discurso en plataformas como X (antes Twitter).
- **Análisis de quejas y reseñas de consumidores**: aunque el corpus es minoritario en este tipo de texto, el modelo puede aplicarse a reseñas y reclamaciones para identificar juicios de valor en la experiencia del cliente.
- **Estudios de lingüística computacional**: como herramienta de referencia para comparar la clasificación de spans en español chileno y para el desarrollo de sistemas de anotación asistida.
- **Detección de lenguaje evaluativo en entornos de moderación**: el modelo puede ayudar a identificar expresiones de juicio social en textos de moderación de contenido, aunque requiere supervisión humana por sus limitaciones.

## Benchmarks y rendimiento
Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Métrica | Valor |
|---|---|
| Strict span-level micro F1 | 0,3635 |
| Strict span-level micro precision | 0,3420 |
| Strict span-level micro recall | 0,3878 |

Resultados por clase (nivel de span estricto):

| Etiqueta | Precisión | Recall | F1 | Spans de oro |
|---|---|---|---|---|
| `capacity` | 0,383 | 0,442 | 0,410 | 129 |
| `normality` | 0,260 | 0,299 | 0,278 | 67 |
| `propriety` | 0,377 | 0,456 | 0,413 | 226 |
| `tenacity` | 0,197 | 0,214 | 0,205 | 56 |
| `veracity` | 0,312 | 0,167 | 0,217 | 30 |

Además, el autor reporta que tres reentrenamientos con semillas distintas (1, 2 y 3) obtienen una media de F1 de 0,346 ± 0,012, y que el acuerdo entre expertos humanos en esta tarea es de 0,600. Todos los resultados del modelo quedan por debajo del acuerdo experto, lo que indica que la tarea no está resuelta.

## Requisitos de hardware
- **VRAM estimada para inferencia**: el modelo tiene 109 millones de parámetros, lo que equivale a aproximadamente 437 MB en FP32. La inferencia puede ejecutarse en GPUs con 2-4 GB de VRAM sin cuantización.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como la NVIDIA GTX 1650, RTX 3050 o RTX 4090, es suficiente para inferencia y entrenamiento ligero.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo típicas (incluso en CPU para inferencia de textos cortos).
- **Opciones de despliegue**: puede servirse con `transformers` pipeline, `FastAPI` o `Hugging Face Inference Endpoints`. No requiere bibliotecas especializadas como vLLM por su tamaño.
- **Latencia y throughput**: no se han publicado datos oficiales de latencia o throughput en la información disponible.

## Comparativa con modelos similares
La comparación se realiza con otros modelos BERT para español, aunque ninguno está específicamente entrenado para la tarea de subtipos de juicio:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| `jorgeortizfuentes/chilean-spanish-judgment-subtypes-bert-tulio` | 109 M | 512 | Clasificación de subtipos de juicio | CC BY 4.0 |
| `dccuchile/tulio-chilean-spanish-bert` (base) | 109 M | 512 | Modelo de lenguaje (MLM) | CC BY 4.0 |
| `dccuchile/bert-base-spanish-wwm-uncased` (BETO) | 110 M | 512 | Modelo de lenguaje (MLM) | CC BY-NC-SA 4.0 |
| `PlanTL-GOB-ES/roberta-base-bne` | 125 M | 512 | Modelo de lenguaje (MLM) | CC BY 4.0 |

El modelo analizado es una adaptación de TULIO para una tarea de etiquetado de secuencias específica, sin que existan modelos comparables públicos en el mismo dominio. La comparación se limita a la arquitectura base y la licencia.

## Limitaciones y advertencias
- **Contenido sensible**: el corpus de entrenamiento contiene insultos, discursos de odio y amenazas, y el modelo reproducirá esa distribución de lenguaje. No es adecuado para aplicaciones sin supervisión humana.
- **Rendimiento limitado**: la F1 de 0,3635 está por debajo del acuerdo entre expertos (0,600). La tarea no está resuelta y las predicciones deben tratarse como una propuesta preliminar.
- **Sesgo de registro**: el corpus está dominado por tuits (2 420 de 2 546 textos), por lo que el modelo puede tener un rendimiento inferior en textos formales o de otros géneros.
- **Especificidad dialectal**: solo cubre el español chileno; no se garantiza rendimiento en otras variantes del español.
- **Restricciones de licencia**: el corpus es de acceso restringido (gated) y solo puede usarse para investigación no comercial. Los pesos del modelo se distribuyen con CC BY 4.0, pero no redistribuyen los textos del corpus.
- **Ventana de contexto**: la longitud de 512 tokens puede ser insuficiente para textos largos; no se proporciona una estrategia de segmentación.
- **Riesgo de alucinación**: aunque es un modelo de clasificación, puede asignar etiquetas con alta confianza a spans incorrectos, especialmente en clases poco representadas como `veracity` (30 spans de oro).

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/jorgeortizfuentes/chilean-spanish-judgment-subtypes-bert-tulio)
- [Corpus chileno de actitudes (gated)](https://huggingface.co/datasets/jorgeortizfuentes/chilean-spanish-attitude-corpus)
- [Modelo base TULIO en Hugging Face](https://huggingface.co/dccuchile/tulio-chilean-spanish-bert) (DOI: 10.57967/hf/1846)
- [Perfil de Jorge Ortiz Fuentes en Hugging Face](https://huggingface.co/jorgeortizfuentes)
- [Proyectos de Jorge Ortiz Fuentes](https://ortizfuentes.com/projects)
- [Perfil de GitHub de Jorge Ortiz Fuentes](https://github.com/jorgeortizfuentes/)

No se ha encontrado el enlace al artículo académico asociado en la información disponible.
