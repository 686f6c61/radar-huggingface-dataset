# Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated

## Resumen

MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated es un ajuste fino del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario Austriani en Hugging Face. Se trata de una variante "abliterated" (también etiquetada como "uncensored", "decensored" y "refusal-removed") en la que se ha aplicado una técnica de ablación de rangos arbitrarios (ARA, *Arbitrary Rank Ablation*) para eliminar los comportamientos de rechazo del modelo base. El modelo conserva la arquitectura y el tamaño del original: aproximadamente 9.000 millones de parámetros, derivado de la familia Qwen.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de modificación de pesos orientada a eliminar los mecanismos de seguridad conversacional, algo que puede interesar a investigadores que estudian alineamiento y robustez. Por otro, sirve como advertencia práctica: el modelo se publica sin datos de entrenamiento, sin benchmarks y sin documentación técnica sustantiva más allá de las etiquetas de la model card, lo que limita seriamente su evaluación rigurosa.

La model card original está construida íntegramente en HTML/CSS con fines estéticos y no aporta información técnica verificable sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos. Toda la información disponible proviene de los metadatos de Hugging Face y de las etiquetas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, segun etiqueta "qwen3.5"); detalles no disponibles |
| Parametros totales | ~9B (segun nombre del modelo); cifra exacta no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo base es XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un modelo destilado de la familia MiMo de Xiaomi sobre una base Qwen de aproximadamente 9.000 millones de parámetros. La etiqueta "qwen3.5" sugiere que la arquitectura subyacente corresponde a una variante de Qwen, aunque no se especifica la versión exacta ni la configuración de capas, cabezas de atención o dimensión oculta.

La modificación introducida por Austriani consiste en una ablación de rangos arbitrarios (ARA), técnica relacionada con enfoques como *abliteration* y herramientas como Heretic (ambas aparecen en las etiquetas). Este tipo de intervención identifica direcciones en el espacio de activaciones asociadas a la negativa a responder y las proyecta fuera de los pesos, reduciendo la probabilidad de que el modelo rechace peticiones. No se documenta el número de tokens utilizados en el proceso, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se detalla la metodología exacta de la ablación (rangos, capas afectadas, métricas de éxito).

## Capacidades

- Generación de texto en inglés, con etiqueta declarada de modelo multimodal ("vision", "multimodal"), aunque no se especifica el soporte real de entrada de imágenes.
- Razonamiento agéntico ("agentic") y uso de herramientas ("tool-use", *function calling*), según las etiquetas del autor.
- Generación de código y tareas de ciberseguridad ("code", "cybersecurity"), declaradas pero sin benchmarks que lo respalden.
- Contexto largo ("long-context"), sin cifra concreta publicada.
- Comportamiento sin rechazos ("refusal-removed", "uncensored"), incluyendo contenido NSFW según la etiqueta y el aviso "not-for-all-audiences".
- Capacidades multilingües limitadas: solo se declara inglés.

## Casos de uso

- Investigación sobre alineamiento y robustez: el modelo permite estudiar cómo la ablación de direcciones de rechazo afecta al comportamiento conversacional en comparación con el modelo base, midiendo tasas de cumplimiento y degradación de calidad.
- Evaluación de técnicas de *abliteration*: útil como caso de estudio para comparar ARA con otros métodos (por ejemplo, edición de pesos o *steering* en activaciones) sobre una misma base Qwen de 9B.
- Pruebas de *red teaming* controlado: sirve para generar respuestas que un modelo alineado rechazaría, permitiendo auditar filtros y clasificadores de seguridad en pipelines propios.
- Experimentos de generación de código sin restricciones: en entornos de investigación aislados, para analizar cómo la eliminación de rechazos afecta a tareas de programación y explicación de vulnerabilidades.
- Análisis de degradación capacitativa: comparar el rendimiento del modelo abliterado frente al base en tareas estándar (razonamiento, matemáticas, código) para cuantificar el coste de la intervención.
- Docencia y divulgación técnica: ilustrar de forma práctica qué es la ablación de rangos y cómo se manifiesta en las respuestas de un modelo de 9B ejecutable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~9B, en FP16 se requieren aproximadamente 18 GB de VRAM; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genéricas por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría en A100, H100, L40S o RTX 4090 en FP16; en cuantización, en GPUs de consumo con 8-12 GB.
- Cabe en GPU de consumo: probablemente sí en cuantización de 4-8 bits, aunque no se publican pesos GGUF en la información disponible.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated | ~9B | no disponible | apache-2.0 | Variante abliterada; sin benchmarks |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | ~9B | no disponible | no disponible en esta ficha | Modelo original sin ablación |
| Qwen 2.5 7B Instruct | 7B | 32K (tipico) | apache-2.0 | Alternativa densa de tamaño similar, ampliamente evaluada |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Alternativa de tamaño similar con benchmarks publicados |

La comparación con Qwen 2.5 7B y Llama 3.1 8B se ofrece como referencia de categoría; no se dispone de datos que permitan comparar rendimiento real del modelo abliterado frente a ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el modelo mantenga las capacidades del base tras la ablación; es habitual que este tipo de intervenciones degrade el razonamiento y aumente la incoherencia.
- Riesgo elevado de alucinación y de respuestas dañinas: la eliminación de rechazos implica que el modelo puede generar contenido NSFW, instrucciones peligrosas o afirmaciones falsas sin filtro.
- Sesgos desconocidos: no se documenta ningún proceso de evaluación de sesgos ni de mitigación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Licencia: apache-2.0 permite uso comercial, pero el autor no asume responsabilidad sobre el contenido generado; el uso en producción requiere filtros externos propios.
- Aviso "not-for-all-audiences": el modelo no es apto para entornos sin supervisión ni para aplicaciones orientadas al público general.
- Documentación insuficiente: sin detalles de entrenamiento, datos, metodología de ablación ni formato de pesos confirmado, la reproducibilidad es nula.
- El modelo base es a su vez un destilado, lo que añade una capa adicional de opacidad sobre sus datos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- No se han encontrado en la informacion disponible papers, blogs, repositorios o demos adicionales asociados a este modelo.
