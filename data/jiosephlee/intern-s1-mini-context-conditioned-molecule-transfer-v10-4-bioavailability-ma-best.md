# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-4-bioavailability-ma-best

## Resumen

Intern-S1-mini context-conditioned molecule transfer V10.4 es un ajuste fino del modelo jiosephlee/Intern-S1-mini-lm, publicado por el usuario jiosephlee, orientado a la transferencia de ensayos químicos y a la predicción de biodisponibilidad oral mediante un esquema de transferencia de moléculas condicionada por contexto. El checkpoint contiene 8.201.221.120 parámetros (unos 8,2 mil millones) en formato safetensors y se distribuye a través de la librería transformers con la etiqueta qwen3, lo que apunta a una arquitectura transformer decoder-only de la familia Qwen3, aunque la model card no detalla la arquitectura interna.

A diferencia de un modelo de propósito general, este checkpoint es el resultado de un entrenamiento específico: 10 épocas con un límite de 350 pasos, semilla 42 y función de pérdida de objetivos suaves (soft-target loss), detenido en el paso 255 cuando el rendimiento de validación se estancó. El criterio de selección fue la métrica de validación knn_binary_macro_f1_at_5, y el paso de optimizador elegido fue el 200. El modelo se presenta explícitamente como el mejor checkpoint seleccionado por validación de una ejecución concreta, no como un modelo listo para producción.

Su relevancia es acotada y de carácter investigador: ocupa un nicho muy específico (transferencia de ensayos y biodisponibilidad oral) y cuenta con 0 descargas y 0 me gusta en el momento de redactar esta ficha, además de no especificar licencia ni idiomas soportados. Es útil como referencia reproducible de un pipeline de ajuste fino químico, pero no como modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; la etiqueta del repositorio indica qwen3, lo que sugiere un transformer decoder-only de esa familia |
| Parámetros totales | 8.201.221.120 (aproximadamente 8,2 mil millones), según safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo contiene safetensors; no se listan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | jiosephlee/Intern-S1-mini-lm (revisión fcb667c380ae01f57693a45b4b5c2d331052a107) |
| Dataset de entrenamiento | jiosephlee/context-conditioned-molecule-transfer-v10.4-bioavailability-ma-mixed-continuous-intern (revisión 8cfc12c9b374cc316d227d88319133ccdd2a0a67) |
| Tamaño del repositorio | 16,4 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de las etiquetas del repositorio: transformer, qwen3 y text-generation. La model card únicamente documenta la procedencia del ajuste fino, no la topología del modelo base. Lo que sí se detalla es el régimen de entrenamiento: 10 épocas con un tope de 350 pasos, semilla 42, pérdida sobre objetivos suaves (soft-target loss), parada anticipada tras el paso 255 al estancarse el rendimiento de validación, y selección del checkpoint en el paso de optimizador 200 según la métrica de validación knn_binary_macro_f1_at_5.

El dataset de entrenamiento es un conjunto propio del autor, versionado con un identificador de revisión concreto, y el nombre del modelo y del dataset indican un esquema de transferencia de moléculas condicionada por contexto aplicado a biodisponibilidad oral con objetivos mixtos continuos. No se especifica el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). El tamaño del repositorio (16,4 GB para 8,2 mil millones de parámetros) es coherente con pesos almacenados en bf16, si bien este dato es una inferencia a partir del tamaño y no una confirmación de la model card.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation y la etiqueta conversational indica uso en formato de diálogo, presumiblemente heredado del modelo base.
- Especialización química: el ajuste fino está orientado a transferencia de ensayos (assay-transfer) y transferencia de moléculas condicionada por contexto (context-conditioned-molecule-transfer).
- Predicción de biodisponibilidad oral: la ejecución V10.4 se centra explícitamente en biodisponibilidad oral con objetivos mixtos continuos.
- Ranking y recuperación de candidatos: las métricas reportadas (Macro-F1@5, NDCG@5, Precision@5) indican evaluación sobre listas ordenadas de hasta 5 candidatos, es decir, una capacidad de clasificación/ordenación más que de generación libre.
- Estimación de similitud/orden relativo: se reporta también el coeficiente de Spearman, lo que implica una evaluación de correlación de orden entre puntuaciones predichas y reales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Priorización de compuestos en descubrimiento temprano de fármacos: dado un conjunto de moléculas candidatas, el modelo puede ordenarlas según su probabilidad estimada de biodisponibilidad oral, y el equipo de química medicinal sintetiza primero las mejor puntuadas. Es adecuado porque el ajuste se ha realizado específicamente sobre esa tarea, aunque la métrica de Spearman reportada (0,3573 en validación, 0,3729 en test) limita su utilidad al top de la lista, no a un orden global fino.
- Transferencia de ensayos entre dianas o entre laboratorios: cuando se dispone de resultados de un ensayo en un contexto y se quiere extrapolar a otro contexto experimental, el modelo puede puntuar moléculas en el nuevo contexto. El propio nombre del ajuste (assay-transfer) apunta a este escenario.
- Filtrado de bibliotecas químicas antes de síntesis: cribado virtual de bibliotecas grandes para descartar compuestos con baja probabilidad de biodisponibilidad oral y reducir costes de síntesis y ensayo.
- Reposicionamiento de fármacos: puntuar moléculas ya conocidas en un contexto nuevo (por ejemplo, una indicación distinta) para priorizar hipótesis de reposicionamiento antes de pruebas in vitro.
- Asistente conversacional especializado en química: gracias a la etiqueta conversational, puede emplearse en una interfaz de diálogo para consultas sobre candidatos y contextos de ensayo, siempre que se validen las respuestas contra fuentes experimentales.
- Análisis retrospectivo de campañas de cribado: usar el modelo para reordenar resultados históricos y comprobar si los compuestos finalmente exitosos habrían quedado en el top-5 predicho, evaluando así su valor como filtro previo.
- Servicio de ranking desplegado por API: al ser compatible con text-generation-inference y endpoints_compatible según las etiquetas, puede exponerse como servicio interno para que otras herramientas del pipeline de descubrimiento consulten puntuaciones de forma programática.
- Investigación metodológica reproducible: replicar el entrenamiento con la misma semilla, dataset (con revisión fijada) y métrica de selección, usando los registros de Weights & Biases enlazados en la model card.

## Benchmarks y rendimiento

La model card únicamente reporta métricas de recuperación/ordenación sobre los conjuntos de validación y test. No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Split | Consultas | Macro-F1@5 | NDCG@5 | Precision@5 | Spearman |
|---|---:|---:|---:|---:|---:|
| Validación | 262 | 0,6723 | 0,7222 | 0,7252 | 0,3573 |
| Test | 267 | 0,6814 | 0,7364 | 0,7393 | 0,3729 |

La coincidencia entre validación y test (diferencias inferiores a 0,015 en todas las métricas de ordenación) sugiere que el modelo no está gravemente sobreajustado a la partición de validación, aunque el tamaño muestral (262 y 267 consultas) es reducido. La correlación de Spearman es notablemente inferior al resto de métricas, lo que indica que el modelo ordena razonablemente bien la cabeza de la lista pero no reproduce el orden completo de los candidatos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para los pesos, más caché KV y sobrecarga del runtime; en la práctica conviene contar con 20-24 GB.
- VRAM estimada en int8: en torno a 8-10 GB para los pesos, más caché KV; aproximadamente 10-12 GB en total.
- VRAM estimada en int4: en torno a 4-6 GB para los pesos; aproximadamente 6-8 GB en total. Estas cifras son estimaciones derivadas del recuento de parámetros, ya que el repositorio no publica variantes cuantizadas.
- GPU profesionales: A100 (40 o 80 GB) y H100 permiten inferencia en bf16 con contexto amplio y varias peticiones concurrentes.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con contexto moderado; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) sería necesario cuantizar. En tarjetas de 8-12 GB solo con cuantización agresiva a int4.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference, ya que el repositorio incluye esa etiqueta; y endpoints compatibles con el Hub. vLLM es plausible si la arquitectura es efectivamente Qwen3, pero no está confirmado en la información disponible. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones completas (contexto, licencia, idiomas) que permitan una comparación rigurosa con otras alternativas. La única comparación documentable es con su propio modelo base.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Métricas reportadas |
|---|---|---|---|---|---|
| jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-4-bioavailability-ma-best | 8.201.221.120 | No disponible | No disponible | Transferencia de ensayos y biodisponibilidad oral | Macro-F1@5 0,6814 en test; NDCG@5 0,7364; Precision@5 0,7393; Spearman 0,3729 |
| jiosephlee/Intern-S1-mini-lm (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | Modelo de lenguaje general, sin ajuste químico específico | No disponible |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre modelos comparables; los enlaces recuperados no guardan relación con el tema.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial. Se debe contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y, en particular, el comportamiento en castellano.
- Contexto no declarado: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación: aunque las métricas reportadas corresponden a tareas de ordenación y no a generación libre, la etiqueta conversational implica que el modelo puede producir texto; cualquier afirmación química generada debe validarse contra fuentes experimentales.
- Correlación de orden baja: el coeficiente de Spearman de 0,3573 en validación y 0,3729 en test indica que el orden global de los candidatos no es fiable. El modelo debe usarse como filtro del top-5, no como estimador cuantitativo preciso.
- Muestra de evaluación pequeña: 262 consultas en validación y 267 en test son suficientes para seleccionar un checkpoint, pero no para garantizar generalización a otras bibliotecas químicas, dianas o laboratorios.
- Sesgo de selección del checkpoint: el paso 200 se eligió maximizando knn_binary_macro_f1_at_5 sobre validación; puede existir una optimización excesiva de esa métrica concreta en detrimento de otras.
- Trazabilidad parcial del dataset: el conjunto de entrenamiento es propio del autor y no se documenta su composición, procedencia ni posibles sesgos químicos o de representación.
- Adopción nula: 0 descargas y 0 me gusta indican que el modelo no ha sido validado por terceros.
- Ámbito de aplicación restringido: es un artefacto de investigación sobre transferencia de ensayos y biodisponibilidad oral. No debe utilizarse para decisiones clínicas, regulatorias ni de seguridad de pacientes sin validación experimental independiente.
- Fechas de publicación: el repositorio figura creado y actualizado el 16 de septiembre de 2026, con menos de dos minutos entre creación y última actualización, lo que sugiere una subida automatizada sin revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-4-bioavailability-ma-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v10.4-bioavailability-ma-mixed-continuous-intern
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/uoktcy0j
- Evaluación de test en Weights & Biases: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/s6foyqb0
- Paper, blog o repositorio adicionales: no disponible. La búsqueda web no devolvió resultados relevantes sobre este modelo.
