# OmTheLast/muril-hinglish-thar

## Resumen

muril-hinglish-thar es un checkpoint de clasificación de texto publicado por el usuario OmTheLast, resultado de afinar google/muril-base-cased (MuRIL, un encoder tipo BERT orientado a lenguas indias) sobre el conjunto de datos THAR de discurso de odio dirigido contra religiones. El modelo resuelve una tarea de clasificación binaria sobre texto híbrido hindi-inglés (hinglish, con mezcla de devanagari y alfabeto latino): la etiqueta 0 corresponde a NON_ANTI_RELIGION y la 1 a ANTI_RELIGION. Cuenta con 237.557.762 parámetros reales según los pesos en safetensors y un tamaño de repositorio de 2,9 GB, que incluye tres revisiones (seed-7, seed-13 y seed-42; main apunta a seed 42).

Su relevancia es fundamentalmente metodológica: forma parte de un estudio comparativo entre mBERT y MuRIL sobre transferencia entre datasets, mezclas de entrenamiento y variación de semilla. El autor publica el código, el registro de datasets, el registro de modelos con casos de fallo y un borrador de artículo, además de las métricas internas de cada semilla (Macro F1 medio de 0,7649 ± 0,0129 entre las semillas 7, 13 y 42).

No es un modelo generativo ni un sistema de moderación listo para producción: la propia model card lo restringe a investigación, comparación y análisis de errores, y advierte de que los checkpoints no han sido validados para moderación autónoma ni para tomar decisiones sobre personas. El repositorio no registra descargas ni interacciones en el momento de la consulta y la licencia de la versión afinada aún no ha sido asignada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (etiqueta `bert`), derivado de google/muril-base-cased |
| Parámetros totales | 237.557.762 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens en el preprocesado documentado por el autor (truncado con `max_length=128`, incluyendo tokens especiales); la longitud nativa máxima del encoder base no se documenta en la información disponible |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en safetensors sin variantes cuantizadas (se puede cuantizar externamente con herramientas estándar) |
| Idiomas soportados | Hindi (`hi`) e inglés (`en`), con foco en texto code-mixed hinglish |
| Licencia | No asignada para esta versión afinada; los modelos base (mBERT y MuRIL) declaran Apache-2.0. Los términos de las fuentes de entrenamiento (CM y THAR) siguen en revisión |
| Formato de pesos | safetensors (librería `transformers`); compatible con `endpoints_compatible` y etiquetado con `text-embeddings-inference` |
| Tarea | Clasificación de texto binaria: `0 = NON_ANTI_RELIGION`, `1 = ANTI_RELIGION` |
| Revisiones publicadas | `seed-7`, `seed-13`, `seed-42` (`main` = seed 42) |
| Tamaño del repositorio | 2,9 GB |
| Pipeline (HuggingFace) | text-classification |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer tipo BERT heredada de google/muril-base-cased, con una cabeza de clasificación de secuencias de dos etiquetas (`AutoModelForSequenceClassification`). MuRIL está diseñado específicamente para lenguas indias y su vocabulario cubre texto nativo y transliterado, lo que explica la elección para hinglish frente a alternativas multilingües genéricas como mBERT. El modelo base no incorpora mecanismos de atención lineal ni decodificación especulativa: es un encoder bidireccional estándar que produce una representación por secuencia y una distribución softmax sobre las dos clases.

En cuanto al entrenamiento, cada ejecución usó dos épocas y el script restaura la época con mayor Macro F1 de evaluación, por lo que los pesos exportados pueden proceder de una época anterior. Los datos provienen de THAR (discurso de odio religioso dirigido) y el pipeline de preprocesado conserva mayúsculas y minúsculas, sustituye URL por `URL`, menciones por `USER` y colapsa espacios en blanco. Las particiones son estratificadas 80/20 y su composición cambia con la semilla, de modo que la variación observada entre semillas incluye cambios de partición además de aleatoriedad en el entrenamiento. El autor documenta en `training_metadata.json` los ajustes, recuentos de filas y política de partición de cada ejecución; no se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO (no aplicables a un clasificador).

Una advertencia metodológica relevante: el script de entrenamiento evalúa cada época sobre la misma partición de evaluación y la usa para seleccionar el checkpoint; en el caso de CM esa partición incluye el split de test de origen. Por tanto, las puntuaciones publicadas son resultados de conjunto de selección y no estimaciones limpias sobre un test intacto. Se excluye explícitamente de las afirmaciones una sonda diagnóstica de 79 filas.

## Capacidades

- Clasificación binaria de texto hinglish (hindi-inglés code-mixed) en las categorías NON_ANTI_RELIGION y ANTI_RELIGION, con salida de probabilidad vía softmax.
- Manejo de texto con mezcla de escrituras (devanagari y alfabeto latino) y de transliteraciones, gracias al vocabulario del modelo base MuRIL.
- Preprocesado integrado en el flujo de uso: normalización de URL a `URL`, de menciones a `USER` y colapso de espacios, preservando el uso de mayúsculas.
- Inferencia eficiente en CPU o GPU de gama de consumo por su tamaño (237,5 M de parámetros).
- Tres checkpoints independientes por semilla (`seed-7`, `seed-13`, `seed-42`) que permiten análisis de estabilidad entre ejecuciones, aunque el autor advierte que semillas individuales no establecen robustez.
- Uso directo con `transformers` (`AutoTokenizer`, `AutoModelForSequenceClassification`) y compatibilidad declarada con endpoints.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es exclusivamente un clasificador de secuencias.
- Capacidad multilingüe limitada a los dos idiomas declarados (hindi e inglés) en registro code-mixed; no se documenta cobertura de otras lenguas indias.

## Casos de uso

- Triage previo en moderación de comentarios: el modelo puntúa cada mensaje con una probabilidad de contenido anti-religión y permite priorizar la cola de revisión humana, de modo que los moderadores atiendan primero los casos de mayor riesgo. Es adecuado por su coste de inferencia bajo, pero el propio autor advierte que no debe usarse para decisiones autónomas.
- Investigación sobre transferencia entre datasets: sirve para estudiar cómo generaliza un encoder entrenado en THAR a otros conjuntos de odio en hinglish (por ejemplo, CM), comparando particiones y definiciones de etiqueta. El repositorio incluye el registro de datasets y los resultados multi-semilla necesarios para reproducir el análisis.
- Auditoría y análisis de errores de sistemas de moderación: al estar publicados los casos de fallo en el registro de modelos, se puede usar el checkpoint para reproducir errores típicos (palabras de identidad, transliteración, abuso citado, falta de contexto conversacional) y documentar modos de fallo.
- Etiquetado asistido y enriquecimiento de corpus: preanotar grandes volúmenes de texto hinglish para su posterior revisión humana, reduciendo el coste de anotación manual en estudios sociolingüísticos o de discurso religioso.
- Monitorización agregada de tendencias: calcular proporciones de contenido anti-religión por franja temporal, plataforma o tema sobre grandes colecciones de mensajes, siempre a nivel agregado y no para evaluar a individuos concretos.
- Comparativa de arquitecturas en entornos multilingües: el modelo forma parte de un estudio mBERT frente a MuRIL, por lo que resulta útil como punto de referencia al evaluar si un encoder específico para lenguas indias aporta ventajas frente a uno multilingüe genérico en texto code-mixed.
- Filtrado en tiempo real de bajo coste: integrarlo como etapa previa en un pipeline de ingestión de redes sociales que descarte o marque mensajes antes de un análisis más caro, aprovechando que el modelo cabe en memoria de una GPU de consumo e incluso en CPU.
- Docencia y reproducción experimental: al publicarse código, metadatos de entrenamiento y cifras por semilla, es un caso práctico para enseñar variabilidad de semilla, fuga de información en la selección de checkpoint y evaluación entre datasets.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar de propósito general (MMLU, GLUE, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son las de evaluación interna registradas junto a cada checkpoint, que el autor identifica como resultados de conjunto de selección y no como estimaciones finales sobre test intacto.

| Semilla | Accuracy | Macro F1 | F1 clase positiva | Recall clase positiva |
|---:|---:|---:|---:|---:|
| 7 | 0,7628 | 0,7627 | 0,7603 | 0,7965 |
| 13 | 0,7532 | 0,7532 | 0,7520 | 0,7919 |
| 42 | 0,7788 | 0,7787 | 0,7742 | 0,8029 |

Macro F1 medio entre las semillas 7, 13 y 42: 0,7649 ± 0,0129 (desviación estándar muestral, no un intervalo de confianza). Esta cifra describe al grupo de semillas, no a un checkpoint concreto. Las claves históricas con sufijo `_hate` en los ficheros de métricas hacen referencia a la clase positiva específica del dataset. La sonda diagnóstica de 79 filas queda excluida de estas afirmaciones.

## Requisitos de hardware

- VRAM estimada por checkpoint: en FP32 en torno a 0,95 GB de pesos (237,5 M de parámetros), más activaciones y memoria del tokenizador; en FP16 aproximadamente 0,48 GB; en cuantización int8 alrededor de 0,24 GB. Son estimaciones derivadas del recuento de parámetros, no mediciones publicadas.
- El repositorio completo ocupa 2,9 GB porque incluye tres revisiones de semilla; para inferencia solo hay que descargar la revisión elegida.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con 4 GB o más de VRAM, incluso con lotes grandes. También es viable en CPU para volúmenes moderados.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar o afinar el modelo a gran escala.
- Opciones de despliegue: `transformers` con PyTorch (flujo documentado en la model card), Hugging Face Inference Endpoints (el modelo está etiquetado como `endpoints_compatible`), text-embeddings-inference según las etiquetas del repositorio, y exportación a ONNX Runtime para inferencia en CPU. El soporte en vLLM, TGI, Ollama o llama.cpp no se menciona en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo, y al tratarse de un clasificador de secuencias tampoco aplica la métrica de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmTheLast/muril-hinglish-thar | 237.557.762 | 128 tokens en el preprocesado documentado | Clasificación binaria de odio anti-religión en hinglish | No asignada (base Apache-2.0; términos de datasets en revisión) | Público en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| google/muril-base-cased | No disponible en la información proporcionada | No disponible | Modelo base tipo BERT para lenguas indias (sin cabeza de clasificación afinada) | Apache-2.0 | Público en HuggingFace |
| google-bert/bert-base-multilingual-cased (mBERT) | No disponible en la información proporcionada | No disponible | Modelo base multilingüe; en este estudio se afina y se compara con MuRIL | Apache-2.0 | Público en HuggingFace |
| Otros checkpoints afinados de odio en hinglish | No disponible | No disponible | Clasificación de discurso de odio code-mixed | No disponible | No disponible |

La comparación de rendimiento entre estas alternativas no se puede cerrar con la información disponible: el estudio comparativo mBERT frente a MuRIL existe y está enlazado en la model card, pero los resultados numéricos de esa comparación no se han facilitado en el material proporcionado.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación, comparación y análisis de errores. El autor indica que estos checkpoints no han sido validados para moderación autónoma ni para tomar decisiones sobre personas.
- Licencia sin asignar para las versiones afinadas. Los modelos base declaran Apache-2.0, pero esa licencia no se extiende a los datasets de entrenamiento; los términos de CM y THAR siguen sin resolver, por lo que el uso comercial es jurídicamente incierto.
- Evaluación sesgada por selección de checkpoint: las métricas publicadas proceden de la misma partición usada para elegir la época, y en el caso de CM esa partición incluye el test de origen. No son estimaciones limpias de generalización.
- Los pesos exportados pueden proceder de una época anterior a la última, ya que el script restaura la de mayor Macro F1 de evaluación.
- Generalización entre datasets limitada: el propio autor señala que las definiciones de etiqueta y las plataformas difieren entre conjuntos, que existen duplicados en CM y que persisten incertidumbres de anotación y de procedencia.
- Fuentes de error conocidas: palabras de identidad, transliteraciones, abuso citado dentro del texto y ausencia de contexto conversacional. Un mensaje aislado puede clasificarse de forma errónea por depender de la conversación previa.
- Ventana efectiva de 128 tokens en el preprocesado documentado, insuficiente para hilos largos o comentarios extensos; los fragmentos que superen ese límite se truncan y pierden información.
- Cobertura lingüística reducida a hindi e inglés en registro code-mixed; no hay evidencia de comportamiento en otras lenguas indias ni en hinglish con otras escrituras.
- Con una única semilla no se puede hablar de robustez: el autor advierte explícitamente que los resultados mixtos de semillas individuales no la establecen.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con impacto real si se usa para moderar contenido, especialmente en contextos de discurso religioso sensible.
- Sesgos potenciales derivados del corpus THAR, orientado a odio religioso en un contexto geográfico y lingüístico concreto; no se documentan análisis de sesgo por subgrupo en la información disponible.
- El repositorio no registra descargas ni valoraciones, por lo que no hay señal de adopción ni de validación externa por parte de la comunidad.
- No se incluye texto de los datasets en el repositorio, de modo que la reproducibilidad completa depende del acceso a las fuentes originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmTheLast/muril-hinglish-thar
- Código de investigación (mBERT vs MuRIL, cross-dataset hinglish hate): https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate
- Resultados multi-semilla emparejados: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/main/docs/matched_multiseed_results.md
- Borrador del artículo: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/4650c6eb093d422785284656dd6765d36e438522/paper/application_research_draft.md
- Registro de datasets: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/4650c6eb093d422785284656dd6765d36e438522/docs/dataset_registry.md
- Registro de modelos y casos de fallo: https://github.com/OmTheLast/mBERT-vs-MuRIL-cross-dataset-hinglish-hate/blob/4650c6eb093d422785284656dd6765d36e438522/docs/model_registry.md
- Dataset THAR: https://github.com/aakash-dl/THAR
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
- Modelo base mBERT: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Ficheros de licencia y atribución incluidos en el repositorio: `BASE_MODEL_LICENSE.txt`, `BASE_MODEL_NOTICE.md`, `training_metadata.json`, `release_metadata.json`
- Nota sobre la búsqueda web: los resultados devueltos para esta consulta corresponden a páginas de Instagram y no guardan relación con el modelo; no se han encontrado enlaces adicionales relevantes.
