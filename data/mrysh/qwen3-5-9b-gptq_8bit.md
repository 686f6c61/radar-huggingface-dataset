# mrysh/qwen3.5-9b-gptq_8bit

## Resumen

`mrysh/qwen3.5-9b-gptq_8bit` es una versión cuantizada a 8 bits mediante GPTQ del modelo `Qwen/Qwen3.5-9B` de Alibaba Qwen. El autor la publica como parte de un benchmark de cuantización en el que se comparan 4 modelos con 8 técnicas distintas, evaluados con vLLM sobre cuatro tareas: BFCL (function calling), Energy-QA, un conjunto de evaluación de sesgo en contratación (*hiring-bias*) y MedQA. No se trata, por tanto, de un modelo entrenado desde cero, sino de un artefacto de despliegue pensado para medir la pérdida de calidad que introduce la cuantización de 8 bits frente al modelo original en precisión completa.

El resultado es un checkpoint de 9.653.104.368 parámetros (~9,65 mil millones) almacenado en safetensors con un peso en disco de 12,581 GB, lo que supone una reducción de aproximadamente la mitad respecto a los ~19,3 GB que ocuparían los pesos en BF16. La cuantización se realizó con gptqmodel 7.6.0, con un tamaño de grupo de 128 y 512 muestras de calibración.

Su relevancia es doble: por un lado, ofrece un punto de comparación reproducible dentro del estudio de cuantización del autor; por otro, demuestra que un modelo de ~9,7B puede servirse en una GPU de consumo de 16-24 GB con vLLM sin recurrir a formatos de 4 bits. El repositorio no incluye información sobre arquitectura, longitud de contexto ni idiomas del modelo base, por lo que esas especificaciones quedan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; se hereda del modelo base `Qwen/Qwen3.5-9B`) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no aplica (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ, aproximadamente 8 bits, group size 128, 512 muestras de calibracion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors (checkpoint GPTQ de 8 bits); tamano del repo 12,6 GB, 12,581 GB en disco |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna del modelo base; únicamente se indica que este repositorio es una cuantización GPTQ de `Qwen/Qwen3.5-9B`. El proceso de cuantización se llevó a cabo con la librería gptqmodel en su versión 7.6.0, empleando 512 muestras de calibración, cuantización de aproximadamente 8 bits y tamaño de grupo de 128. No se especifica el dataset de calibración, la secuencia de longitud usada durante el ajuste de escalas ni si se aplicaron técnicas de corrección adicionales (por ejemplo, act-order o descarte de columnas).

Tampoco hay información sobre los datos de entrenamiento originales: número de tokens, composición del corpus, fases de RLHF/DPO o innovaciones de atención. El autor declara que el modelo se evaluó como modelo de texto con el modo *thinking* desactivado en vLLM, lo que sugiere que el modelo base dispone de un modo de razonamiento explícito, aunque su funcionamiento no se documenta en esta tarjeta.

## Capacidades

- Generación de texto y respuesta a preguntas en formato conversacional, heredadas del modelo base (el autor lo evalúa con vLLM como modelo de texto).
- *Function calling* / tool calling: el modelo se evaluó en BFCL (*Berkeley Function Calling Leaderboard*), lo que indica que el formato soporta herramientas, si bien no se publican puntuaciones.
- Razonamiento de dominio médico: incluido en la evaluación mediante MedQA, orientado a preguntas de opción múltiple de tipo examen médico.
- Preguntas y respuestas sobre dominio energético: evaluado con Energy-QA.
- Evaluación de sesgo en procesos de selección: el checkpoint forma parte de una prueba de *hiring-bias*, lo que implica capacidad de generar o puntuar texto asociado a candidaturas.
- Modo *thinking* desactivable: las evaluaciones se realizaron con el modo de razonamiento apagado, lo que implica que el modelo base expone un interruptor para activarlo o desactivarlo.
- Capacidades multilingües, de visión, audio o agentes multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia de bajo coste en producción: al ocupar ~9,65 GB de pesos, el checkpoint cabe en una única GPU de 16-24 GB y permite servir un modelo de ~9,7B con vLLM (`vllm serve <repo>`) reduciendo a la mitad los requisitos de VRAM frente a BF16.
- Evaluación comparativa de técnicas de cuantización: es un artefacto directamente utilizable como una de las celdas del grid 4 modelos × 8 técnicas, midiendo la degradación en BFCL, Energy-QA, hiring-bias y MedQA frente al modelo base.
- Despliegue en entornos con VRAM limitada: útil cuando no se quiere bajar a 4 bits por el riesgo de degradación adicional y se dispone de una GPU de 16 GB o más con contexto moderado.
- Asistentes con llamada a herramientas: si el modelo base conserva su comportamiento en BFCL, puede integrarse como planificador que emite llamadas JSON a APIs internas, con la ventaja de un menor coste por token servido.
- Extracción y clasificación de información en dominios técnicos: el uso de Energy-QA como conjunto de evaluación sugiere aplicación en QA sobre documentación técnica o normativa del sector energético.
- Preliminares de QA clínica/asistencial: el checkpoint se evalúa en MedQA, por lo que sirve para pruebas de concepto de respuesta a preguntas médicas de opción múltiple, siempre con supervisión humana y sin uso clínico directo.
- Auditoría de sesgos: empleo como modelo de referencia en pruebas de sesgo en procesos de selección de personal, comparando su comportamiento con el del modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del autor indica únicamente el protocolo de evaluación (vLLM, modo *thinking* desactivado, conjuntos BFCL, Energy-QA, hiring-bias y MedQA), pero no incluye puntuaciones numéricas ni la comparación con el modelo base.

| Benchmark | Resultado | Notas |
|---|---|---|
| BFCL | no disponible | Evaluado según el autor, sin cifras publicadas |
| Energy-QA | no disponible | Evaluado según el autor, sin cifras publicadas |
| Hiring-bias | no disponible | Evaluado según el autor, sin cifras publicadas |
| MedQA | no disponible | Evaluado según el autor, sin cifras publicadas |

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,65 GB solo para pesos en 8 bits; con caché KV y overhead de runtime, el consumo realista se sitúa en el rango de 11-14 GB para contextos moderados (estimación, no medida publicada).
- GPU profesionales: A100 (40 GB u 80 GB) y H100 son adecuadas para servir varias instancias o contextos largos; no se han publicado cifras de throughput.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) alojan el modelo con holgura; RTX 4080 / 4070 Ti SUPER (16 GB) es viable con contexto limitado; en tarjetas de 12 GB el ajuste es dudoso y no está confirmado.
- Despliegue: vLLM es el motor confirmado por el autor (`vllm serve <repo>`). Otros motores (TGI, llama.cpp, Ollama) no están confirmados para este checkpoint GPTQ concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de TTFT.
- Almacenamiento: 12,6 GB de repositorio, a tener en cuenta en la planificación de caché de pesos en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrysh/qwen3.5-9b-gptq_8bit` (este) | 9,65B | no disponible | GPTQ 8 bits, group size 128 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-9B` (base) | 9,65B (por correspondencia) | no disponible | BF16/FP16 (~19,3 GB de pesos) | apache-2.0 | HuggingFace (modelo oficial) |
| Otras variantes del benchmark del autor | 4 modelos × 8 tecnicas | no disponible | no disponible | no disponible | Repositorios del mismo autor, sin datos publicados |

No se dispone de información sobre modelos comparables de terceros dentro de la documentación proporcionada. La comparación cuantitativa frente al modelo base (misma tarea, distinta precisión) es precisamente el objeto del benchmark del autor, pero sus resultados no están publicados en esta tarjeta.

## Limitaciones y advertencias

- No hay métricas publicadas: se desconoce la degradación real frente al modelo base en BFCL, Energy-QA, hiring-bias y MedQA.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Arquitectura, contexto e idiomas no documentados en la tarjeta; es necesario consultar la model card del modelo base antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de factualidad ni de tasa de alucinación para esta cuantización.
- Riesgo de sesgo: el propio autor incluye una prueba de sesgo en contratación (*hiring-bias*), lo que indica que el comportamiento en esa dimensión es objeto de escrutinio; no se publican resultados.
- La cuantización GPTQ de 8 bits puede degradar tareas sensibles a la precisión numérica (matemáticas, código, razonamiento encadenado); no hay datos que cuantifiquen ese efecto en este checkpoint.
- El modo *thinking* no fue el evaluado: las pruebas se hicieron con el razonamiento desactivado, por lo que el rendimiento con el modo activo es desconocido.
- Licencia apache-2.0 heredada del modelo base: permite uso comercial, pero conviene verificar los términos y avisos adicionales de la model card original de Qwen.
- Compatibilidad de motores limitada: solo vLLM está confirmado; el soporte en llama.cpp/Ollama para este checkpoint no está verificado.
- Fecha de creación del repositorio (2026-10-23) y ausencia de actualizaciones posteriores: no hay garantía de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrysh/qwen3.5-9b-gptq_8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería de cuantización citada (gptqmodel 7.6.0): no se proporciona enlace en la información disponible
- Paper, blog o demo del benchmark de cuantización: no disponibles en la información proporcionada
