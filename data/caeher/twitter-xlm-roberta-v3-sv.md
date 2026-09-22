# caeher/twitter-xlm-roberta-v3-sv

## Resumen

`caeher/twitter-xlm-roberta-v3-sv` ("V3 Twitter-XLM-R") es un modelo de clasificación de secuencias en español desarrollado por el usuario `caeher`, orientado a la detección de discurso tóxico en publicaciones de redes sociales. Está construido sobre el checkpoint `cardiffnlp/twitter-xlm-roberta-base` y ajustado (fine-tuning) sobre el corpus interno "B2" del proyecto, con la columna `texto_modelo`, longitud máxima de 128 tokens y semilla 42. La cabeza de clasificación resuelve cuatro clases: no tóxico, lenguaje ofensivo, discurso de odio y amenazas/violencia.

Técnicamente es un transformer encoder de tipo XLM-RoBERTa base (278.046.724 parámetros), por lo que no genera texto: produce una distribución de probabilidad sobre cuatro etiquetas para un texto de entrada. El ajuste se centra en español, con foco declarado en El Salvador, y en el registro lingüístico de redes sociales (abreviaturas, jerga, faltas de ortografía intencionadas).

Su relevancia es acotada pero clara: el autor publica métricas con intervalos de confianza bootstrap (F1 macro de test 0.8362 con IC 95% [0.7995, 0.8690]) y advierte explícitamente de una brecha de rendimiento entre la distribución de datos de X y de Facebook. Es un modelo muy reciente, con cero descargas y cero likes en el momento de redactar esta ficha, sin validación externa ni revisión por pares, y con licencia MIT, lo que permite uso comercial sin restricciones de licencia (aunque no exime de responsabilidad legal sobre las decisiones tomadas con él).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias |
| Parámetros totales | 278.046.724 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 posiciones máximas del encoder; entrenado y evaluado con longitud máxima de 128 tokens |
| Tipos de cuantización | no disponible (el repositorio publica pesos en fp32; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | Español (`es`). El backbone XLM-RoBERTa base es multilingüe (entrenado sobre 100 idiomas), pero el ajuste y la evaluación son en español, con foco en El Salvador |
| Licencia | MIT |
| Formato de pesos | safetensors (carga con `transformers`) |
| Tarea (pipeline) | `text-classification` |
| Número de clases | 4: 0 no tóxico, 1 lenguaje ofensivo, 2 discurso de odio, 3 amenazas/violencia |
| Modelo base | `cardiffnlp/twitter-xlm-roberta-base` |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de alta (metadatos) | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional estándar (familia RoBERTa/XLM-RoBERTa), con vocabulario SentencePiece de gran tamaño y embeddings posicionales aprendidos; sobre la representación del token especial de clasificación se añade una cabeza lineal de 4 salidas. No hay decodificador, atención lineal, mezcla de expertos ni componentes SSM: es un modelo discriminativo puro de unos 278 M de parámetros.

El procedimiento de ajuste documentado es fino y reproducible: corpus B2 del proyecto, campo `texto_modelo`, `max_length = 128`, semilla 42 y cuatro etiquetas. No se indica en la model card el número de ejemplos de entrenamiento, la composición del corpus, la proporción por clase, ni si se aplicaron técnicas de balanceo, `class weighting`, RLHF, DPO u otras optimizaciones. Tampoco se documenta la tasa de aprendizaje, el número de épocas ni el hardware de entrenamiento. El autor sí especifica que para reproducir exactamente el preprocesamiento hay que normalizar el texto con la "versión 1.2" del proyecto antes de tokenizar, lo que implica que el pipeline de normalización es parte del contrato de uso del modelo. El corpus contiene publicaciones públicas anonimizadas con lenguaje ofensivo y discurso de odio explícito, y se menciona una "sonda adversarial" de carácter diagnóstico que no sustituye a una prueba independiente.

## Capacidades

- Clasificación de texto en español en cuatro categorías mutuamente excluyentes (no tóxico, ofensivo, odio, amenazas/violencia).
- Clasificación de textos cortos de redes sociales: el límite de 128 tokens cubre la gran mayoría de tuits, comentarios y publicaciones breves.
- Extracción de representaciones: al ser un encoder, es posible usar la salida oculta (sin la cabeza de clasificación) como embedding de frase para búsqueda semántica, clustering o como característica en un modelo posterior.
- Etiquetado por lotes: admite inferencia batcheada vía `transformers.pipeline`, con soporte de GPU.
- Compatibilidad con Hugging Face Inference Endpoints y con Text Embeddings Inference (según las etiquetas del repositorio).
- No soporta generación de texto, `tool calling` ni `function calling`.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio, código ni matemáticas.
- Multilingüismo limitado en la práctica: aunque el backbone cubre 100 idiomas, no hay evidencia publicada de rendimiento fuera del español.

## Casos de uso

- Premoderación de comentarios en plataformas en español: el modelo actúa como primer filtro sobre cada comentario entrante y enruta a revisión humana solo los casos clasificados como clase 1, 2 o 3, reduciendo el volumen de cola de moderación. Es adecuado porque su coste por inferencia es bajo (278 M de parámetros) y el texto típico de comentario cabe holgadamente en los 128 tokens.
- Moderación de comunidades y foros con audiencia salvadoreña: al estar ajustado sobre un corpus con foco en El Salvador, captura mejor el léxico y las variantes locales que un modelo genérico de español neutro.
- Escucha social y monitorización de marca: clasificar automáticamente menciones en X y Facebook para separar conversación legítima de ataques, insultos o amenazas, y priorizar la respuesta del equipo de comunicación. El autor advierte de una brecha de rendimiento entre ambas plataformas, por lo que la evaluación debe hacerse por separado en cada una.
- Construcción y anotación de corpus de investigación en discurso de odio: usar el modelo como anotador automático débil (weak labeling) y después auditar manualmente una muestra, dado que el test tiene 460 ejemplos y el IC 95% del F1 macro abarca de 0.7995 a 0.8690.
- Triaje de reportes de usuarios en apps de contenido generado por el usuario: ordenar la cola de reportes por probabilidad de pertenencia a las clases 2 y 3, de modo que los moderadores humanos atiendan primero el material más grave.
- Filtrado en aplicaciones de mensajería o comunidades infantiles: bloquear o marcar mensajes con probabilidad alta de amenaza/violencia, siempre con revisión humana posterior y con un umbral conservador calibrado sobre datos propios.
- Enriquecimiento de paneles analíticos: añadir una etiqueta de toxicidad a cada publicación almacenada para construir series temporales de incidencia por tema, región o cuenta, sin necesidad de intervención humana en cada registro.
- Investigación académica sobre variación dialectal: comparar el comportamiento del modelo entre subconjuntos de español (por ejemplo, El Salvador frente a otros países) para estudiar transferencia y sesgos de dominio.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Corte | n | F1 macro | Accuracy |
|---|---:|---:|---:|
| Validación | 459 | 0.8211 | 0.8235 |
| Test | 460 | 0.8362 | 0.8413 |

IC bootstrap del 95% para el F1 macro de test: [0.7995, 0.8690].

No se han publicado resultados de benchmarks en la información disponible para comparaciones estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo discriminativo de clasificación. Tampoco se documentan métricas por clase (precisión, recall o F1 de cada una de las cuatro etiquetas), matriz de confusión ni resultados desagregados por plataforma.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (tamaño del repositorio) y en torno a 0,55 GB si se convierte a fp16; a int8 dinámico bajaría a unos 0,28 GB. Estas cifras son cálculos derivados del número de parámetros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, T4, L4, A10, A100 y H100. El modelo está claramente sobredimensionado para GPU de gama alta en cuanto a capacidad; el beneficio de una GPU mayor es únicamente de latencia y throughput en lotes grandes.
- Cabe sin problema en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna y en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable y habitual para este tamaño; es la opción razonable para volúmenes moderados sin GPU.
- Opciones de despliegue: `transformers` con `pipeline`, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime o TorchScript para reducir latencia, y Text Embeddings Inference (etiqueta `text-embeddings-inference`). No se confirma en la información disponible el soporte de vLLM ni de llama.cpp (este último requeriría una conversión a GGUF que el repositorio no ofrece).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de latencia ni de tokens por segundo, ni datos de escalado con el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `caeher/twitter-xlm-roberta-v3-sv` | 278.046.724 | 512 posiciones (entrenado a 128) | Clasificación tóxica en 4 clases, español | MIT | Hugging Face, 0 descargas |
| `cardiffnlp/twitter-xlm-roberta-base` | 278 M (misma arquitectura) | 512 posiciones | Modelo base multilingüe de redes sociales, sin cabeza de clasificación tóxica | no disponible en la información proporcionada | Hugging Face, ampliamente usado como backbone |
| `Hate-speech-CNERG/dehatebert-mono-spanish` | no disponible en la información proporcionada | no disponible | Detección de odio monolingüe en español | no disponible en la información proporcionada | Hugging Face |
| `pysentimiento/robertuito-hate-speech` | no disponible en la información proporcionada | no disponible | Detección de odio en español de redes sociales | no disponible en la información proporcionada | Hugging Face |

No se dispone de una comparación de rendimiento entre estos modelos con datos verificables en la información proporcionada: el único dato de evaluación disponible es el del modelo de esta ficha. Cualquier comparación numérica entre ellos requeriría evaluarlos sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Sesgo de dominio: el ajuste se realizó sobre un único corpus (B2) con foco en El Salvador. El rendimiento fuera de ese registro geográfico y social no está caracterizado.
- Brecha entre plataformas: el propio autor señala diferencias de rendimiento entre la distribución de X y la de Facebook, de modo que las métricas globales no son extrapolables a cada plataforma por separado.
- Corpus sensible: el conjunto de entrenamiento contiene lenguaje ofensivo y discurso de odio explícito, lo que puede arrastrar sesgos hacia términos o variedades concretas.
- Longitud limitada: con `max_length = 128`, los textos largos se truncan; la clase del fragmento puede no representar el documento completo.
- Sin validación externa: 0 descargas y 0 likes, sin revisión por pares ni evaluaciones independientes publicadas. Las métricas provienen del propio autor y no se han replicado.
- Tamaño de test reducido: 460 ejemplos, con IC 95% del F1 macro entre 0.7995 y 0.8690. La incertidumbre es apreciable y no se publican métricas por clase.
- Dependencia del preprocesamiento: el autor exige reproducir la normalización de la "versión 1.2" del proyecto antes de tokenizar. Sin ese paso, el rendimiento puede degradarse de forma no cuantificada.
- Falsos positivos y negativos: al ser un clasificador, su principal riesgo no es la alucinación generativa (no genera texto) sino el error de clasificación, especialmente en ironía, sarcasmo, reapropiación de términos, jerga local y citas de discurso ajeno.
- No apto como criterio único: la model card indica explícitamente que no debe usarse como único criterio para moderación ni para tomar decisiones sobre personas, y que requiere revisión humana y evaluación específica del dominio.
- Sonda adversarial diagnóstica: el autor aclara que no sustituye a un test independiente.
- Licencia: MIT permite uso comercial, modificación y redistribución sin obligación de publicar derivados, pero no exime del cumplimiento del RGPD ni de la normativa local sobre moderación de contenido y tratamiento de datos personales.
- Advertencia de contenido: cualquier despliegue que procese texto de usuarios puede exponer a los operadores a contenido violento u ofensivo; conviene aplicar medidas de protección al personal de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caeher/twitter-xlm-roberta-v3-sv
- Modelo base citado en la model card: https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base
- Paper, blog, repositorio o demo del modelo: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha y se han descartado.
