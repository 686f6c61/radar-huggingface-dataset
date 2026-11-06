# SinhalaMMLU-SharedTask/team-sinhalanuwana

## Resumen

Team SinhalaNuwana es el sistema presentado por el equipo del mismo nombre a la tarea compartida SinhalaMMLU, una evaluación de conocimiento en cingalés con preguntas de opción múltiple organizada en tres niveles de dificultad (Easy, Medium y Hard). No se trata de un modelo entrenado desde cero, sino de un adaptador LoRA de 38,6 millones de parámetros montado sobre `google/gemma-4-E4B-it`, el modelo multimodal de Google con decodificador de texto de aproximadamente 7,46 mil millones de parámetros. El repositorio publicado contiene el código de inferencia, el pipeline de entrenamiento y las predicciones finales, además de enlazar el adaptador en un repositorio aparte.

La innovación principal es el uso de STaR (self-taught reasoner) aplicado a un idioma de bajos recursos: el modelo base genera cadenas de razonamiento en cingalés para 8.894 preguntas de entrenamiento y solo se conservan las 4.073 cuyo pensamiento condujo a la respuesta correcta al primer intento. Sobre esas trazas se entrena el adaptador, de modo que el modelo aprende a "pensar en cingalés" antes de responder. En inferencia se aplica un esquema de votación: cada pregunta se formula con las opciones en varios órdenes distintos y se promedian las probabilidades por opción, con pasadas adicionales y pensamientos de hasta 2.048 tokens para las preguntas difíciles.

El resultado reportado es un macro score de 63,5755 en Codabench (64,3302 en Easy, 56,7057 en Medium y 69,6907 en Hard). Es relevante ahora porque demuestra que un adaptador pequeño sobre un modelo abierto multilingüe, combinado con razonamiento auto-generado y agregación de votos, puede competir en una evaluación académica de un idioma con escasa cobertura sin recurrir a recuperación externa ni a modelos propietarios en el momento de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con adaptador LoRA |
| Parametros totales | 7.501.679.616 (7.463.013.376 del modelo base + 38.666.240 del adaptador) |
| Parametros activos | no disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de hasta 1.024 tokens; el pensamiento en inferencia llega a 2.048 tokens) |
| Tipos de cuantizacion | no disponible (la inferencia de referencia se ejecuta en float16) |
| Idiomas soportados | Cingalés (si); el modelo base Gemma 4 es multilingüe, pero el adaptador está entrenado solo para cingalés |
| Licencia | Apache 2.0 (código y adaptador, heredada de Gemma 4) |
| Formato de pesos | safetensors (adaptador LoRA con pesos, config y ficheros de tokenizer; el repositorio principal no contiene pesos, solo código y predicciones) |

## Arquitectura y entrenamiento

El sistema parte de `google/gemma-4-E4B-it` (revisión `ee0ef6023621cff504d758262d4e04895a5af4a2`), usando únicamente el decodificador de texto del modelo. Sobre él se entrena un adaptador LoRA con 2 épocas, optimizador AdamW, tasa de aprendizaje 1e-4 con schedule coseno y 3 % de warmup, 16 ejemplos por paso y secuencias de hasta 1.024 tokens; el entrenamiento completo consume 4,3 horas en 2 × T4. El adaptador resultante tiene 38.666.240 parámetros, un 0,52 % del total del modelo base.

Los datos de entrenamiento son preguntas de opción múltiple en cingalés generadas por modelos Claude a partir de libros de texto escolares de Sri Lanka, guías docentes del NIE, libros de recursos, apuntes de resultados de aprendizaje de nivel A/L y Wikibooks. Un modelo Claude más potente verificó las claves de respuesta de 10.000 de ellas, y un script de solapamiento (`review_overlap.py`) eliminó 1.106 preguntas con similitud semántica (coseno LaBSE ≥ 0,70) respecto a preguntas de desarrollo o test, dejando 8.894. El pipeline STaR hace que el modelo base, sin adaptador, razone hasta 512 tokens por pregunta y conserva las 4.073 trazas que aciertan al primer intento; esas trazas son el corpus efectivo de entrenamiento del LoRA. No se emplea recuperación (retrieval) en ninguna fase.

## Capacidades

- Razonamiento en cingalés antes de responder (modo thinking, decodificación greedy), entrenado explícitamente para producir cadenas de pensamiento en ese idioma.
- Respuesta a preguntas de opción múltiple con estimación de probabilidad por opción, no solo generación de texto libre.
- Agregación por votación: la misma pregunta se presenta con las opciones en distintos órdenes y se promedian las probabilidades, lo que reduce la sensibilidad al orden de las alternativas.
- Razonamiento extendido configurable: hasta 2.048 tokens de pensamiento para preguntas Easy y Hard, y cuatro órdenes adicionales de opciones para las Medium.
- Capacidades heredadas del modelo base Gemma 4 (conversación, generación de texto e instrucciones), aunque el adaptador está especializado en la tarea MMLU en cingalés.
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada para este sistema.

## Casos de uso

- Evaluación académica de conocimiento en cingalés: el sistema está diseñado para responder bancos de preguntas de opción múltiple de nivel escolar y universitario, con un pipeline reproducible (`inference.py`) que genera `predictions.jsonl` listo para subir a Codabench.
- Investigación sobre razonamiento en idiomas de bajos recursos: sirve como referencia metodológica para aplicar STaR y votación por permutación de opciones a otros idiomas con pocos datos, reutilizando el código de `training/`.
- Construcción de tutores o sistemas de autoevaluación en cingalés: el modelo puede puntuar preguntas de examen y justificar la respuesta con una cadena de razonamiento en el idioma del estudiante, aprovechando las trazas generadas durante el entrenamiento.
- Generación de datos sintéticos educativos: el pipeline de preparación de datos (generación con Claude desde libros de texto y verificación de claves) es reutilizable para crear nuevos bancos de preguntas verificadas en cingalés.
- Baseline para tareas compartidas de MMLU multilingüe: el repositorio incluye manifiestos (`manifest.yaml`, `model_manifest.json`) con el SHA-256 del adaptador y el recuento de parámetros, lo que facilita la verificación y la comparación por otros equipos.
- Despliegue en hardware modesto para prototipos: al ser un adaptador LoRA sobre un modelo de 7,5 B, puede ejecutarse en una sola GPU de 24 GB o en 2 × T4 de 16 GB, adecuado para laboratorios con recursos limitados que quieran reproducir los resultados.
- Experimentación con esquemas de agregación de respuestas: los scripts `predict.py` y `merge_votes.py` permiten variar el número de pasadas y el número de órdenes de opciones para estudiar el compromiso entre coste computacional y precisión.

## Benchmarks y rendimiento

| Benchmark | Easy | Medium | Hard | Macro |
|---|---|---|---|---|
| SinhalaMMLU (Codabench) | 64,3302 | 56,7057 | 69,6907 | 63,5755 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparaciones numéricas con otros sistemas de la misma tarea compartida.

## Requisitos de hardware

- VRAM estimada: el modelo completo en float16 ocupa aproximadamente 15 GB (7,5 B parámetros × 2 bytes); el adaptador añade unos 77 MB. Con cuantización a 8 bits bajaría a unos 7,5 GB y a 4 bits a unos 3,8 GB, aunque no se han publicado configuraciones de cuantización validadas para este sistema.
- GPU recomendadas: una GPU con 24 GB o más aloja el modelo según la model card; el equipo de referencia usó 2 × T4 de 16 GB en Kaggle.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB como la RTX 3090 o la RTX 4090, y potencialmente en GPUs de 16 GB con cuantización, aunque esto último no está verificado en la documentación.
- Opciones de despliegue: el repositorio proporciona un script propio (`inference.py` con `predict.py` y `merge_votes.py`) sobre PyTorch y PEFT; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el conjunto de test de 2.238 preguntas tarda aproximadamente 16 horas en 2 × T4, repartidas en seis pasadas de 4,3, 4,2, 1,7, 1,9, 2,1 y 2,1 horas. Esto equivale a unos 140 segundos por pregunta en ese hardware, dominado por la generación de cadenas de pensamiento y las múltiples pasadas de votación.
- Nota de entorno: requiere Python 3.13; si `torchao` está instalado (como en Kaggle) debe desinstalarse antes, porque `peft` importa esa versión y la rechaza.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-sinhalanuwana (este sistema) | 7,5 B totales (38,7 M en adaptador LoRA) | no disponible | LoRA + STaR + votación por permutación sobre Gemma 4 | Apache 2.0 | Adaptador y código públicos en Hugging Face |
| google/gemma-4-E4B-it (base) | 7,46 B | no disponible | Modelo instructivo generalista multilingüe | Apache 2.0 | Público en Hugging Face |
| Otros sistemas de la tarea SinhalaMMLU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de rendimiento de los modelos comparables en SinhalaMMLU dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para preguntas de opción múltiple en cingalés; su uso como modelo conversacional general degradaría las capacidades del modelo base.
- Dependencia del formato: el pipeline asume preguntas con opciones y aplica permutaciones y promediado de probabilidades; fuera de ese formato los resultados no están validados.
- Riesgo de alucinación: las cadenas de pensamiento se generan de forma autoregresiva y pueden contener razonamientos plausibles pero incorrectos, especialmente en preguntas Medium, donde el macro score cae al 56,7057.
- Datos de entrenamiento sintéticos: las preguntas provienen de modelos Claude y solo se verificaron las claves de 10.000 de ellas; pueden persistir errores de etiqueta en el resto del corpus.
- Fuga de datos mitigada pero no eliminada: el filtro de solapamiento usa un umbral de coseno LaBSE de 0,70, que puede dejar pasar paráfrasis con similitud inferior.
- Determinismo limitado: la aritmética en float16 en GPU no es completamente determinista; una repetición completa puede cambiar votos ajustados (en la verificación, 1 de 123 respuestas cambió por un reparto 2-2-1).
- Coste de inferencia elevado: seis pasadas con pensamientos de hasta 2.048 tokens implican un throughput bajo (unas 140 preguntas por hora en 2 × T4), poco adecuado para aplicaciones interactivas en tiempo real.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a los términos de uso de Google además de la licencia del repositorio.
- Idiomas: aunque el modelo base es multilingüe, el adaptador solo se ha evaluado en cingalés; no hay evidencia de su comportamiento en otros idiomas.
- Mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su contenido está orientado a la competición, no a producción.

## Enlaces

- Repositorio principal (código, inferencia, predicciones y datos de entrenamiento): https://huggingface.co/SinhalaMMLU-SharedTask/team-sinhalanuwana
- Adaptador LoRA: https://huggingface.co/SinhalaMMLU-SharedTask/team-sinhalanuwana-gemma4-e4b-star3-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (el único resultado, un foro de Etsy, no guarda relación con el modelo).
