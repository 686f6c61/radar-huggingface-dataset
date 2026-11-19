# FreedomIntelligence/HuatuoGPT-3-Grader-8B

## Resumen

HuatuoGPT-3-Grader-8B es un modelo de evaluación por rúbricas (rubric grader) especializado en el dominio médico, desarrollado por FreedomIntelligence como componente del sistema OnePO (Direct One-stage Policy Optimization for SFT-free Domain Adaptation). No es un modelo conversacional de propósito general ni un asistente clínico: su función es puntuar respuestas médicas abiertas contra un conjunto de criterios numerados con puntos positivos y negativos, devolviendo una lista JSON de booleanos que un algoritmo de recompensa convierte en una señal escalar.

El modelo parte de una base Qwen3 de 8B parámetros (8.190.735.360 parámetros totales según los pesos en safetensors) y ha sido entrenado sobre muestras anotadas por GPT-4.1. Su relevancia actual radica en que permite sustituir anotadores LLM propietarios en pipelines de RL para adaptación de dominio médico, evaluando múltiples criterios en una sola generación en lugar de una llamada por criterio.

La integración con OnePO es explícita: la suma de puntos de los criterios cumplidos se divide entre el total de puntos positivos y se recorta al intervalo [0, 1]. El repositorio incluye una plantilla de grading obligatoria y un script `score.py` para puntuación por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), según tag `qwen3` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card y los ejemplos están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3 con 8,19 mil millones de parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; únicamente indica que se entrenó con muestras anotadas por GPT-4.1 para la tarea de grading por rúbricas. La plantilla de chat incluida fija el modo **no-thinking**, coherente con el entrenamiento, de modo que no es necesario activar ningún flag de razonamiento extendido.

La innovación principal no está en la arquitectura sino en el protocolo de evaluación: el modelo recibe la conversación completa y una lista numerada de criterios con puntos con signo (por ejemplo, `1. (+3pts) ...`, `3. (-4pts) ...`) y emite en una sola generación un array JSON de booleanos, uno por criterio y en el mismo orden. Para criterios negativos, `true` significa que el comportamiento indeseado está presente y sus puntos se descuentan. OnePO calcula la recompensa como suma de puntos coincidentes dividida entre el total de puntos positivos, recortada a [0, 1]; en el ejemplo de la model card, `(3 + 2) / (3 + 2) = 1.0`.

## Capacidades

- Evaluación por rúbricas multi-criterio en una única generación, con salida JSON de booleanos alineada por orden con los criterios de entrada.
- Manejo de criterios con puntos positivos y negativos (detección de comportamientos indeseados en respuestas médicas).
- Evaluación de conversaciones multi-turno: la plantilla admite el historial completo en formato `role: content`, terminando en la respuesta a evaluar.
- Generación de recompensas numéricas mediante el protocolo OnePO (extracción de la respuesta final, truncado a los primeros 10.000 caracteres y recorte a [0, 1]).
- Puntuación por lotes mediante `score.py`, con `--batch-size` configurable y evaluación conjunta de todas las rúbricas de una respuesta.
- Compatibilidad con `transformers` y con Text Generation Inference / endpoints compatibles, según los tags del repositorio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Entrenamiento por RL de modelos médicos con OnePO: el grader sustituye al anotador propietario en el bucle de recompensa, evaluando cada respuesta candidata contra las rúbricas del caso y devolviendo la señal escalar que actualiza la política.
- Filtrado de datos sintéticos médicos: puntuar respuestas generadas por un modelo docente y descartar aquellas con recompensa baja o con criterios negativos activados (por ejemplo, diagnósticos definitivos sin evidencia).
- Evaluación automatizada de sistemas de问答 clínico: construir conjuntos de rúbricas por especialidad y medir regresiones entre versiones de un asistente antes de desplegarlo.
- Auditoría de seguridad clínica: definir criterios negativos con penalización fuerte (recomendaciones de dosificación sin contexto, omisión de derivación urgente) y usar el grader como detector de esos patrones en lotes de respuestas.
- Anotación asistida para revisión humana: pre-puntuar respuestas con el grader y priorizar la revisión manual de los casos con discrepancias o puntuaciones intermedias.
- Investigación en evaluación de LLM médicos: comparar la calibración de distintos graders frente a anotadores humanos usando rúbricas idénticas y el mismo protocolo de agregación de OnePO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB como mínimo.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits, alrededor de 4-5 GB, aunque el repositorio no publica versiones GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y throughput alto; L40S o RTX 6000 Ada para despliegue en un solo nodo; RTX 4090 (24 GB) viable en BF16 con lote pequeño.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 8-12 GB, siempre que se genere la versión cuantizada por cuenta propia.
- Opciones de despliegue: `transformers` (snippet oficial con `device_map="auto"` y `dtype="auto"`), Text Generation Inference y endpoints compatibles según los tags; `score.py` para puntuación por lotes.
- Latencia y throughput: no disponibles. La generación está acotada a `max_new_tokens=256` en el ejemplo oficial y usa decodificación greedy (`do_sample=False`), lo que reduce la varianza de la puntuación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuatuoGPT-3-Grader-8B | 8,19 B | no disponible | Grading por rúbricas médicas para OnePO | no disponible | Hugging Face (2.302 descargas) |
| Qwen3-8B (base) | ~8 B | no disponible en esta ficha | Generación de texto general | no disponible en esta ficha | Hugging Face |
| GPT-4.1 como anotador | no disponible | no disponible | Grading y anotación general | propietaria | API |

La comparación con el anotador GPT-4.1 es la más relevante desde el punto de vista operativo: el grader de 8B permite ejecución local y coste marginal bajo por evaluación, a cambio de una capacidad de razonamiento menor que la del modelo que generó las anotaciones de entrenamiento. No se dispone de datos públicos que cuantifiquen esa diferencia de acuerdo con anotadores humanos.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no debe asumirse uso comercial permitido sin consultar el repositorio y el proyecto HuatuoGPT-3.
- El modelo está diseñado exclusivamente para grading contra rúbricas; usarlo como asistente médico conversacional queda fuera de su propósito y de su entrenamiento.
- La plantilla de grading debe respetarse literalmente (redacción, etiquetas y orden de secciones); desviarse de ella puede degradar la alineación de la salida con los criterios.
- La salida es una lista de booleanos sin probabilidades; no ofrece estimación de incertidumbre por criterio, lo que limita el análisis de calibración.
- Riesgo de alucinación en la evaluación: el grader puede marcar como cumplido un criterio que la respuesta no satisface, especialmente en criterios ambiguos o muy compuestos.
- El truncado de la respuesta final a los primeros 10.000 caracteres en el protocolo de OnePO puede omitir contenido relevante en respuestas muy largas.
- No se documentan sesgos específicos, cobertura idiomática ni comportamiento fuera del inglés; la evaluación en castellano no está validada.
- El entrenamiento sobre anotaciones de GPT-4.1 puede heredar sesgos y estilo de evaluación del anotador, incluida una preferencia por respuestas con estructura similar a las del profesor.
- Solo 4 likes y 2.302 descargas en el momento de la consulta: ecosistema pequeño y poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-Grader-8B
- Repositorio GitHub del proyecto: https://github.com/FreedomIntelligence/HuatuoGPT-3
- Script de recompensa OnePO: https://github.com/FreedomIntelligence/HuatuoGPT-3/blob/main/onepo/reward.py
- Paper OnePO (OpenReview): https://openreview.net/pdf?id=M8eyUQldfx
