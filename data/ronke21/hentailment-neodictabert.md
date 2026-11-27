# ronke21/HEntailment-neodictabert

## Resumen

HEntailment-neodictabert es un modelo de clasificación de texto para inferencia de lenguaje natural (NLI) en hebreo, desarrollado por ronke21. Se trata de un fine-tuning completo del encoder dicta-il/neodictabert sobre el conjunto de datos HEntailment, con las cinco fuentes agrupadas y balanceadas (15.000 filas). El modelo resuelve la tarea de NLI de tres clases (entailment, contradiction, neutral) sobre pares de premisa e hipótesis en hebreo, un ámbito con recursos comparativamente escasos frente al inglés.

El modelo forma parte del trabajo «Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference» (Keinan y Tsarfaty, EACL 2027). Con 363 millones de parámetros, se apoya en NeoBERT, una arquitectura encoder moderna, y emplea un cabezal de clasificación sobre la representación del token de clasificación. Su relevancia radica en que ofrece un punto de partida reproducible (semilla 42) para evaluar la transferencia cruzada de tareas en hebreo y en que su licencia Apache 2.0 facilita su reutilización comercial.

El checkpoint publicado corresponde a la semilla 42 de un conjunto de tres ejecuciones; la model card compara explícitamente sus resultados con la media del artículo, lo que permite situar su rendimiento dentro de la variabilidad esperada del entrenamiento. No obstante, el modelo no incluye datos de benchmarks estándar multilingües como MMLU o GSM8K, ya que su naturaleza es exclusivamente discriminativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (NeoBERT) con cabezal de clasificación de secuencias |
| Parametros totales | 363.181.827 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según repo) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 (se aplica también la licencia del modelo base) |
| Formato de pesos | safetensors, con código personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se basa en dicta-il/neodictabert, un encoder NeoBERT adaptado al hebreo, sobre el que se realiza un fine-tuning completo con un cabezal de clasificación para tres clases. La entrada se construye como par de frases (premisa, hipótesis) y la salida es una distribución sobre las etiquetas 0 (entailment), 1 (contradiction) y 2 (neutral). El entrenamiento emplea una tasa de aprendizaje de 2e-5, tamaño de lote de 32, hasta 20 épocas y selección del mejor checkpoint según macro-F1 en desarrollo, con semilla 42.

El conjunto de datos HEntailment agrupa cinco fuentes y se ha balanceado por clase hasta 15.000 filas. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO, algo esperable en un modelo discriminativo de este tipo. La innovación principal reside en el propio benchmark HEntailment y en el estudio de transferencia cruzada entre tareas que lo acompaña.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) de tres clases sobre pares (premisa, hipótesis) en hebreo.
- Detección de relaciones semánticas: implicación, contradicción y neutralidad.
- Evaluación de similitud semántica y paráfrasis, dado que el benchmark incluye tareas de parafraseo y resumen.
- Procesamiento de pares de frases con truncado configurable mediante el tokenizador asociado.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento.
- Capacidad monolingüe: únicamente hebreo.

## Casos de uso

- Verificación de hechos en hebreo: dado un fragmento de una fuente y una afirmación, el modelo clasifica si la fuente implica, contradice o es neutral respecto a la afirmación, útil en pipelines de fact-checking automatizado.
- Filtrado de pares pregunta-respuesta en sistemas de QA: permite descartar respuestas candidatas que no se derivan de la evidencia recuperada, mejorando la precisión de sistemas RAG en hebreo.
- Detección de contradicciones en bases de conocimiento: comparar pares de afirmaciones extraídas de documentos para señalar inconsistencias antes de consolidar información.
- Evaluación de resúmenes automáticos: usar la relación de implicación entre el documento fuente y las frases del resumen para medir fidelidad factual, un uso habitual de NLI en métricas como SummaC.
- Deduplicación semántica de contenidos: identificar paráfrasis y near-duplicates en corpus hebreos mediante la clase de implicación bidireccional.
- Moderación y coherencia de respuestas: en asistentes conversacionales en hebreo, comprobar que la respuesta generada no contradice el contexto proporcionado por el usuario.
- Investigación en PLN semítico: servir como baseline reproducible (semilla 42) para estudiar transferencia cruzada entre tareas NLI en hebreo.

## Benchmarks y rendimiento

Resultados de macro-F1 en el conjunto de test, comparando este checkpoint (semilla 42) con la media del artículo sobre semillas 42/43/44:

| Conjunto de test | Este modelo (semilla 42) | Artículo: media ± DE |
|---|---:|---:|
| HeQ | 0.832 | 0.893 ± 0.061 |
| QASem | 0.754 | 0.800 ± 0.061 |
| HeSum | 0.532 | 0.615 ± 0.099 |
| HebSummaries | 0.631 | 0.655 ± 0.032 |
| Hebrew-Paraphrase | 0.773 | 0.842 ± 0.044 |
| HebNLI (traducido) | 0.383 | 0.376 ± 0.034 |
| LCHAIM (traducido) | 0.319 | 0.327 ± 0.014 |

El checkpoint de la semilla 42 queda por debajo de la media del artículo en cinco de los siete conjuntos, dentro de la desviación típica reportada, y ligeramente por encima en HebNLI traducido. Los conjuntos traducidos (HebNLI, LCHAIM) muestran un rendimiento notablemente inferior, lo que sugiere dificultades de transferencia desde datos traducidos al hebreo nativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB para los pesos (363 M de parámetros) más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: alrededor de 0,75-1 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeño y no aprovecha GPU de gama alta.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3050 y superiores).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado del modelo base), y potencialmente ONNX o TorchScript previa conversión; no se documenta soporte directo en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera inferencia en decenas de milisegundos por par en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Tarea |
|---|---:|---|---|---|---|
| ronke21/HEntailment-neodictabert | 363 M | no disponible | hebreo | Apache 2.0 | NLI 3 clases |
| dicta-il/neodictabert (base) | no disponible | no disponible | hebreo | no disponible | encoder general |
| Modelos NLI multilingües tipo XLM-R fine-tuned | ~278 M (base) | 512 tokens típicamente | multilingüe | MIT / Apache 2.0 según checkpoint | NLI |
| Modelos NLI en inglés tipo DeBERTa-v3 fine-tuned | ~184 M (base) | 512 tokens | inglés | MIT | NLI |

No se dispone de datos de rendimiento comparables para los modelos alternativos en los conjuntos de HEntailment, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Rendimiento limitado en conjuntos traducidos (HebNLI 0.383, LCHAIM 0.319), lo que indica escasa robustez ante dominios o registros distintos del entrenamiento.
- Variabilidad entre semillas notable: el checkpoint de la semilla 42 queda por debajo de la media del artículo en la mayoría de conjuntos, por lo que no debe tomarse como el mejor resultado del estudio.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en pares ambiguos o con negación compleja.
- Modelo monolingüe: no procesa otros idiomas de forma fiable.
- Longitud de contexto no documentada; el truncado por defecto del tokenizador puede perder información en pares largos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar antes de usar en producción.
- La licencia Apache 2.0 se aplica junto con la del modelo base dicta-il/neodictabert, cuyos términos deben revisarse.
- Sin métricas de calibración ni evaluación de sesgos publicadas; no se recomienda su uso en decisiones de alto impacto sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/HEntailment-neodictabert
- Modelo base: https://huggingface.co/dicta-il/neodictabert
- Dataset HEntailment: https://huggingface.co/datasets/ronke21/HEntailment
- Artículo de referencia: Keinan, R. y Tsarfaty, R. «Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference», EACL 2027 (sin URL directa disponible en la información proporcionada).
