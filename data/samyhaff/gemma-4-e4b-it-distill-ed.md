# samyhaff/gemma-4-e4b-it-distill-ed

## Resumen

gemma-4-e4b-it-distill-ed es un ajuste fino de google/gemma-4-E4B-it desarrollado por samyhaff y publicado en noviembre de 2026. El modelo está especializado en desambiguación de entidades (entity disambiguation, ED): dado un texto con una mención marcada entre corchetes y una lista numerada de candidatos con sus descripciones, el modelo razona y devuelve el índice del candidato correcto. Se trata de un modelo multimodal de tipo image-text-to-text, aunque su uso principal documentado es la desambiguación textual.

El modelo se ha obtenido mediante LoRA fusionado (merged) y destilación off-policy desde gemma-4-26B-A4B-it sobre el conjunto de datos ZELDA. Es el artefacto central del artículo "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift" (Findings of EACL 2027), que estudia cuándo el razonamiento explícito mejora la desambiguación en modelos pequeños, tanto en dominio como bajo desplazamiento de distribución.

Su relevancia radica en que demuestra que un modelo de aproximadamente 8.000 millones de parámetros puede alcanzar un 80,4 % de exactitud en ZELDA y un 83,7 % de exactitud normalizada en ZESHEL en régimen de zero-shot verdadero, compitiendo en una tarea clásica de NLP que tradicionalmente requería modelos mayores o pipelines con recuperación y reranking dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en google/gemma-4-E4B-it; ajuste LoRA fusionado |
| Parametros totales | 7.996.156.490 (aprox. 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer multimodal de la familia Gemma 4 con unos 8.000 millones de parámetros. Sobre esa base se aplicó un ajuste LoRA que posteriormente se fusionó en los pesos finales, de modo que el repositorio contiene un modelo denso estándar cargable con transformers y con vLLM, sin adaptadores separados.

El entrenamiento combina dos ingredientes: el conjunto de datos ZELDA para la tarea de desambiguación de entidades y una destilación off-policy desde gemma-4-26B-A4B-it, un modelo mayor de la misma familia. El objetivo es transferir al modelo pequeño la capacidad de razonar antes de responder con el índice del candidato elegido. El prompt esperado marca la mención entre `[` y `]`, numera los candidatos con sus descripciones y solicita una respuesta final con el formato `"answer": <index>`. En la evaluación del artículo, los candidatos corresponden al top 10 del reranker qwen3-4b-reranker-ed, y la inferencia se realiza muestreando 10 completaciones y tomando la votación mayoritaria. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Desambiguación de entidades en contexto: identifica la entidad correcta entre una lista numerada de candidatos con descripciones.
- Razonamiento explícito antes de responder: el modelo genera una cadena de razonamiento y termina con `"answer": <index>`.
- Generación de texto conversacional en formato chat (pipeline text-generation con plantilla de chat).
- Procesamiento image-text-to-text heredado de la base Gemma 4 (etiqueta del repositorio), aunque la model card no documenta casos de uso de visión.
- Modo thinking activable mediante `chat_template_kwargs={"enable_thinking": True}` en vLLM.
- Integración con tooling de inferencia estándar: transformers y vLLM (endpoints_compatible en los tags).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Desambiguación de entidades en pipelines de extracción de conocimiento: dado un texto y una shortlist de candidatos generada por un reranker (por ejemplo, qwen3-4b-reranker-ed), el modelo elige la entidad correcta con votación mayoritaria sobre 10 muestras, lo que reduce la varianza de una sola generación.
- Enlazado de entidades en artículos periodísticos o documentos largos: menciones ambiguas como "Jordan" se resuelven usando el contexto completo de la narrativa y las descripciones de los candidatos.
- Construcción de grafos de conocimiento: el índice devuelto se mapea directamente al identificador de la entidad en la base de conocimiento, facilitando la inserción automatizada de tripletas.
- Normalización de entidades en bases de datos corporativas: unificar registros que aparecen con variantes de nombre o referencias ambiguas antes de deduplicar.
- Anotación asistida de corpus para NLP: preanotar menciones con la entidad correcta para revisión humana, aprovechando el razonamiento explícito que hace auditable la decisión.
- Búsqueda semántica con resolución de referencias: desambiguar la consulta del usuario antes de lanzarla contra un índice documental, mejorando la precisión del retrieval.
- Evaluación de robustez bajo desplazamiento de distribución: el modelo sirve como referencia en experimentos de ED zero-shot (ZESHEL) para comparar pipelines.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ZELDA | Exactitud (acc.) | 80,4 |
| ZESHEL (true zero-shot) | Exactitud normalizada (norm. acc.) | 83,7 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos en esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de aproximadamente 8B parámetros, se requiere del orden de 16 GB en precisión de 16 bits; las cuantizaciones a 8 o 4 bits reducirían el requisito, aunque no se documentan formatos GGUF en el repositorio.
- GPU recomendadas: A100, H100 o L40S para despliegue con vLLM en producción; RTX 4090 (24 GB) es suficiente para inferencia en fp16/bf16.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB; no se especifican requisitos oficiales.
- Opciones de despliegue: vLLM (ejemplo oficial de la model card), transformers; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles. El patrón de uso recomendado implica 10 completaciones por consulta con votación mayoritaria, lo que multiplica el coste de inferencia por diez respecto a una sola generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samyhaff/gemma-4-e4b-it-distill-ed | ~8B | no disponible | ED con razonamiento | apache-2.0 | Hugging Face |
| google/gemma-4-E4B-it | ~8B (E4B) | no disponible | Modelo base multimodal | no disponible en la información | Hugging Face |
| samyhaff/qwen3-4b-reranker-ed | ~4B | no disponible | Reranking de candidatos para ED | no disponible en la información | Hugging Face |
| gemma-4-26B-A4B-it | 26B (A4B, MoE) | no disponible | Profesor de destilación | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (desambiguación de entidades); su uso como modelo generalista de texto no está documentado ni validado.
- El formato de prompt es estricto: mención entre corchetes, candidatos numerados y respuesta final en el formato `"answer": <index>`; desviarse de él puede degradar los resultados.
- La evaluación recomendada requiere 10 muestras por consulta con votación mayoritaria, lo que incrementa el coste y la latencia en producción.
- Los resultados reportados (80,4 en ZELDA y 83,7 en ZESHEL) se obtuvieron con candidatos generados por qwen3-4b-reranker-ed; el rendimiento con otras shortlists no está documentado.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base google/gemma-4-E4B-it, que puede imponer restricciones adicionales.
- El repositorio tiene un tamaño de 16 GB y solo 295 descargas y 1 like en el momento de la consulta; es un artefacto de investigación con validación comunitaria limitada.
- No se publican datos de cuantización ni versiones GGUF, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/gemma-4-e4b-it-distill-ed
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Reranker asociado: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed
- Artículo (arXiv): https://arxiv.org/abs/2611.30334
- Repositorio de pipeline y evaluación: https://github.com/samyhaff/ed-study
