# rabeeeehh/arabizi-kit-model

## Resumen

ArabiziKit trained layer es el componente aprendido de un sistema híbrido de transliteración de arabizi —árabe escrito con caracteres latinos y dígitos (2, 3, 7, 5)— a escritura árabe. Desarrollado por rabeeeehh, este modelo no es un gran modelo de lenguaje, sino un conjunto de tres componentes estadísticos ligeros y sin dependencias externas: una tabla de lectura de palabras con 1.155 entradas y alineación artículo-consciente, un modelo de trigramas de caracteres con suavizado de Laplace para reranking, y un clasificador Naive Bayes de dialecto (egipcio, levantino, magrebí) que proporciona una pista de dialecto automática. El modelo se entrenó sobre el corpus `rb2625/arabizi-kit-corpus` y conjuntos de calibración, excluyendo los conjuntos de test externos.

La relevancia actual radica en que el arabizi es un fenómeno extendido en redes sociales y comunicación informal en el mundo árabe, y su conversión automática a escritura árabe facilita tareas posteriores de NLP como análisis de sentimiento o traducción. El modelo se distribuye bajo licencia MIT y se acompaña de un paquete Python instalable (`arabizikit`) y de un paper en arXiv. Su diseño ligero permite ejecutarlo en CPU sin requisitos especiales, lo que lo hace accesible para integraciones en entornos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: tabla de lectura de palabras + modelo de trigramas de caracteres + clasificador Naive Bayes |
| Parametros totales | no disponible (componentes pequeños, tabla de 1.155 entradas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa oraciones, sin ventana fija declarada) |
| Tipos de cuantizacion | no disponible (modelo en JSON, sin cuantización) |
| Idiomas soportados | Árabe dialectal (egipcio, levantino, magrebí) y arabizi |
| Licencia | MIT |
| Formato de pesos | JSON (model.json, egyptian.json, levantine.json, maghrebi.json) |

## Arquitectura y entrenamiento

El modelo no utiliza arquitectura transformer ni redes neuronales profundas. Se compone de tres módulos estadísticos clásicos: (1) una tabla de lectura de palabras que mapea tokens de arabizi a posibles renderizaciones en árabe con frecuencias observadas, incluyendo alineación consciente de artículos (por ejemplo, `el etnein` → `الاثنين`); (2) un modelo de trigramas de caracteres con suavizado de Laplace que puntúa cada candidato para favorecer secuencias naturales en árabe; y (3) un clasificador Naive Bayes por dialecto que analiza tokens y marcadores de código arabizi para seleccionar la variante dialectal adecuada. El entrenamiento se realizó sobre el conjunto de calibración y los splits train/dev del corpus `rb2625/arabizi-kit-corpus`, más texto dialectal público. Los conjuntos de test y externos se excluyeron del entrenamiento. No se menciona el uso de RLHF ni técnicas de ajuste fino modernas.

## Capacidades

- Transliteración de arabizi a escritura árabe para dialectos egipcio, levantino y magrebí.
- Manejo de convenciones de arabizi (dígitos 2, 3, 7, 5 para hamza/qaf, ayn, ha, kha).
- Reranking de candidatos mediante modelo de trigramas de caracteres para mejorar naturalidad.
- Clasificación automática de dialecto para adaptar las reglas de transliteración.
- Funcionamiento sin dependencias externas, en Python puro.
- Entrenamiento y evaluación reproducibles mediante comandos CLI (`arabizikit train`, `arabizikit eval`).

## Casos de uso

- Normalización de texto de redes sociales: convertir publicaciones en arabizi (comunes en Twitter, Facebook o WhatsApp) a escritura árabe estándar para análisis de sentimiento o minería de opinión.
- Preprocesamiento para pipelines de NLP en árabe: alimentar traductores automáticos o sistemas de búsqueda con texto árabe normalizado a partir de entradas en arabizi.
- Asistencia en transcripción manual: ayudar a transcriptores a convertir entrevistas o conversaciones informales en arabizi a escritura árabe de forma semiautomática.
- Desarrollo de chatbots o asistentes virtuales en dialectos árabes: integrar la transliteración para aceptar entradas de usuarios que escriben en arabizi y responder en árabe escrito.
- Estudio lingüístico y análisis de corpus: generar versiones transliteradas de corpus de arabizi para investigación sociolingüística o entrenamiento de modelos.
- Educación y aprendizaje de árabe: herramientas que permitan a estudiantes escribir en arabizi y recibir la forma árabe correcta como retroalimentación.

## Benchmarks y rendimiento

Los resultados publicados en la model card (procedentes del paper) se muestran a continuación. Las métricas son exact@1 (precisión exacta de la primera predicción), hit@3 (acierto entre las tres primeras) y CER (Character Error Rate). Se comparan las reglas sin pista de dialecto, con pista oracle y el modelo aprendido.

| Conjunto | Reglas, sin pista (exact@1 / hit@3 / CER) | Reglas, pista oracle (exact@1 / hit@3 / CER) | Capa aprendida (exact@1 / hit@3 / CER) |
|---|---|---|---|
| Pipeline dev | 0.021 / 0.021 / 0.291 | 0.021 / 0.021 / 0.291 | 0.354 / 0.542 / 0.097 |
| Pipeline test | 0.000 / 0.000 / 0.299 | 0.000 / 0.000 / 0.299 | 0.061 / 0.102 / 0.226 |
| Egipcio (externo) | 0.376 / 0.526 / 0.236 | 0.376 / 0.526 / 0.236 | 0.348 / 0.502 / 0.248 |
| Levantino (externo) | 0.296 / 0.429 / 0.076 | 0.296 / 0.429 / 0.076 | 0.270 / 0.360 / 0.096 |
| Marroquí darija (externo) | 0.035 / 0.057 / 0.235 | 0.088 / 0.115 / 0.180 | 0.053 / 0.080 / 0.207 |

Se observa que la capa aprendida mejora notablemente el rendimiento en los conjuntos de desarrollo y test del pipeline, pero en los conjuntos externos (especialmente egipcio y levantino) las reglas simples superan ligeramente a la capa aprendida, excepto en marroquí donde la capa aprendida es ligeramente mejor que las reglas sin pista.

## Requisitos de hardware

- El modelo es extremadamente ligero: no requiere GPU, funciona en cualquier CPU moderna.
- La inferencia se realiza en Python puro, sin dependencias de frameworks de deep learning.
- El consumo de memoria es mínimo (tablas JSON de pequeño tamaño, ~1.155 entradas).
- Se puede desplegar en entornos embebidos, funciones serverless o contenedores Docker con menos de 100 MB de RAM.
- No se han publicado datos de latencia o throughput, pero al ser modelos estadísticos simples, la latencia por oración es del orden de milisegundos.
- La integración se realiza mediante el paquete `arabizikit` o directamente cargando los archivos JSON.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El campo "no disponible" se aplica a esta sección, ya que no se mencionan alternativas como sistemas de transliteración basados en redes neuronales (por ejemplo, modelos seq2seq) ni otros enfoques híbridos. La comparativa requeriría datos adicionales no incluidos en la fuente.

## Limitaciones y advertencias

- El rendimiento en conjuntos externos es bajo en exact@1 (por ejemplo, 0.061 en pipeline test), lo que indica que la transliteración exacta es difícil y el modelo a menudo produce múltiples candidatos (hit@3 algo mayor).
- El modelo depende de la tabla de lectura de palabras; palabras fuera de la tabla o variantes no vistas pueden no transliterarse correctamente.
- El clasificador de dialecto solo cubre tres variantes (egipcio, levantino, magrebí); otros dialectos (golfo, yemení, etc.) no están soportados explícitamente.
- No se han reportado sesgos específicos, pero al entrenarse con corpus públicos de redes sociales, puede reflejar sesgos de género, registro o comunidad presentes en esos datos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantías de precisión para producción.
- El modelo no es un LLM y no genera texto libre; solo realiza transliteración de palabras y oraciones cortas.
- No se proporcionan pesos en formatos estándar como safetensors o GGUF; el formato es JSON, lo que limita la interoperabilidad con frameworks de inferencia convencionales.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/rabeeeehh/arabizi-kit-model
- Repositorio del sistema ArabiziKit: https://github.com/rb2625/arabizi-kit
- Corpus asociado: `rb2625/arabizi-kit-corpus` (referenciado en la model card)
- Paper: "ArabiziKit: An Open, Hybrid, Benchmark-Driven Arabizi to Arabic-Script Transliteration System" (arXiv, cs.CL) — no se proporciona URL directa.
