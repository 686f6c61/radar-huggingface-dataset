# aloudreader/uk-stress-crossencoder

## Resumen

`aloudreader/uk-stress-crossencoder` es un cross-encoder de clasificación de texto desarrollado por el usuario `aloudreader` que puntúa la adecuación de una glosa (definición) a una aparición concreta de una palabra ucraniana ambigua. Resuelve un problema muy específico dentro de la cadena de procesamiento del ucraniano: determinar qué lectura, y por tanto qué acento prosódico, corresponde a un homógrafo del tipo за́мок ("castillo") frente a замо́к ("cerradura"), o бо́ку frente a боку́. La salida se usa como pieza de un pipeline más amplio orientado a síntesis de voz (TTS) en ucraniano.

El modelo parte de `FacebookAI/xlm-roberta-base` y añade una cabeza de clasificación de secuencias, con 278.044.417 parámetros en total. No genera texto ni etiquetas directamente: recibe un par de cadenas (la oración con la palabra objetivo delimitada por `⟦ ⟧` y una glosa candidata con su forma acentuada) y devuelve un único logit; puntuando todos los sentidos candidatos y aplicando un margen de abstención de 0,5 entre las dos mejores firmas acentuales se obtiene la lectura final. Su cobertura procede de un manifiesto de servicio que acompaña al modelo con 15.203 formas.

Es relevante porque aborda una tarea de desambiguación léxica muy poco cubierta en ucraniano con un modelo ligero (1,1 GB de repositorio) que se entrenó en una única RTX 3070 en 3,4 horas, y porque documenta de forma explícita la naturaleza sintética de sus etiquetas y el ruido asociado. La licencia Apache 2.0 y el formato safetensors facilitan su integración en producción, aunque el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias |
| Parametros totales | 278.044.417 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 192 subtokens por par de entradas (truncado); la ventana posicional de XLM-RoBERTa base es mayor, pero el modelo se entrenó y se sirve con truncado a 192 |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas; los pesos publicados ocupan 1,1 GB (fp32). Compatible con cuantización dinámica int8/ONNX si el integrador la aplica por su cuenta |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`, `AutoModelForSequenceClassification`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa base (278M parámetros) con una cabeza de clasificación de secuencias que produce un único logit por par de entradas. El entrenamiento se hizo en dos etapas partiendo de `xlm-roberta-base`: primero una versión `v3-xenc` sobre 12.351 oraciones etiquetadas por sentido, y después la versión `v19-v10` sobre 463.867 filas, que es la publicada. La función de pérdida es entropía cruzada listwise sobre los candidatos de cada fila, con 2 épocas, learning rate 1e-5, batch de 16, longitud máxima 192 y semilla 20260824.

Los datos de la etapa final proceden de tres fuentes: 411.049 oraciones extraídas del corpus Malyuk, 23.287 de Wikipedia en ucraniano (CC BY-SA 4.0) y 29.531 generadas por un LLM y usadas únicamente para entrenamiento. Las etiquetas de sentido las produjo un LLM (DeepSeek-V4-Pro) con verificación ciega por un segundo LLM (DeepSeek-V3.2). El split es por forma, con un 25 % de formas reservadas, y se descartaron las formas cuyas filas de entrenamiento mostraban un solo sentido (222.217 filas eliminadas). Los sentidos, glosas y firmas acentuales provienen del inventario de homógrafos del proyecto, distribuido como `serving_manifest.json`. El autor reporta reproducibilidad alta: un reentrenamiento con los mismos datos el 2026-09-25 obtuvo 0,8429 frente al 0,8443 original, y todas las pruebas del pipeline quedaron dentro de 0,3 puntos.

## Capacidades

- Puntuación de adecuación glosa-oración: dado un par (oración con la palabra marcada, glosa candidata), devuelve un logit donde mayor valor indica mejor encaje.
- Desambiguación de homógrafos semánticos en ucraniano: es su punto fuerte cuando las dos lecturas difieren en significado (а́тлас / атла́с).
- Recuperación del acento prosódico: al elegir la firma acentual ganadora se obtiene la forma acentuada correcta de la palabra.
- Abstención calibrada: si el margen entre las dos mejores firmas acentuales es inferior a 0,5, el pipeline no responde y delega en otros componentes.
- Cobertura léxica acotada al manifiesto: 15.203 formas con glosas y firmas acentuales; las formas fuera del manifiesto no se puntúan.
- Integración en un pipeline mixto: el autor indica que las alternancias gramaticales (се́ла / села́) las decide un módulo de morfología y las formas frecuentes un clasificador de tokens; el cross-encoder responde principalmente a las formas que ninguno de los dos cubre.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un clasificador de pares.

## Casos de uso

- Preprocesado para síntesis de voz en ucraniano: antes de enviar el texto a un motor TTS, el cross-encoder resuelve el acento de los homógrafos para que la pronunciación sintetizada sea la correcta (за́мок frente a замо́к); es su propósito original declarado.
- Postprocesado de ASR: tras transcribir audio ucraniano, las formas ambiguas pueden reacentuarse con este modelo para alimentar subtítulos o diccionarios de pronunciación, aprovechando su evaluación sobre tokens ambiguos de Common Voice (72,3 %).
- Anotación de corpus con marcas de acento: en un pipeline de anotación léxica, el modelo puede proponer la lectura acentuada y abstenerse cuando el margen es bajo, dejando esas filas para revisión humana.
- Lexicografía y enriquecimiento de diccionarios: dado un inventario de sentidos con glosas, el modelo permite asignar automáticamente la lectura correcta a ocurrencias en corpus, apoyando la construcción de entradas con ejemplos acentuados.
- Aplicaciones de aprendizaje de ucraniano: ejercicios de lectura en voz alta y corrección de acento en los que el modelo verifica si la lectura elegida por el estudiante encaja con el contexto de la oración.
- Normalización para búsqueda y recuperación de información: al desambiguar homógrafos semánticos se pueden generar claves de índice distintas para lecturas distintas de la misma forma superficial, mejorando la precisión en un buscador sobre textos ucranianos.
- Preprocesado de OCR de prensa histórica ucraniana: los textos con ortografía antigua y abundantes homógrafos se pueden reacentuar antes de la indexación, siempre que las formas estén dentro del manifiesto de 15.203 entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta exclusivamente métricas internas de la tarea:

| Evaluacion | Resultado |
|---|---|
| Exactitud macro por grupo de sentidos (dev, formas reservadas) | 0,8443 |
| Exactitud micro (dev, formas reservadas) | 0,8939 |
| Reentrenamiento de reproducibilidad (2026-09-25) | 0,8429 |
| Tokens ambiguos de Common Voice (oro de audio), un solo nivel con primera lectura del léxico en abstención | 72,3 % |
| lang-uk, mismo protocolo | 66,6 % |
| 200 formas más frecuentes, mismo protocolo | 71,0 % |
| Punto débil: formas ambiguas no cubiertas por el clasificador de tokens, en texto moderno | 77,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia (valores estimados a partir del tamaño de 278M parámetros, no publicados por el autor): aproximadamente 1,1 GB de pesos en fp32, unos 0,56 GB en fp16/bf16 y unos 0,28 GB en int8, más el coste de activaciones y lote.
- Cabe holgadamente en GPU de consumo: el propio autor entrenó el modelo completo en una única RTX 3070 en 3,4 horas; cualquier GPU con 6-8 GB (RTX 3060, 4060, 2070, etc.) es suficiente para servir el modelo.
- Es viable incluso en CPU para cargas por lotes o de baja concurrencia, dado el tamaño reducido del modelo.
- El coste real de cómputo viene del pipeline, no del modelo: hay que puntuar todos los sentidos candidatos por cada ocurrencia ambigua, por lo que la latencia efectiva se multiplica por el número de glosas evaluadas.
- Opciones de despliegue: `transformers` de forma nativa, `text-embeddings-inference` y endpoints compatibles (ambos presentes en las etiquetas del repositorio). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada alternativas directas de desambiguación de homógrafos ucranianos con datos comparables. La referencia más cercana es el modelo base del que parte:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aloudreader/uk-stress-crossencoder | 278.044.417 | 192 subtokens por par | Clasificación de pares (glosa-oración) para acento y desambiguación | Apache 2.0 | HuggingFace, safetensors, 0 descargas |
| FacebookAI/xlm-roberta-base | 278M (misma base) | 512 tokens | Masked language modeling multilingüe | No confirmada en la información disponible | HuggingFace |
| Componentes del pipeline del autor (módulo de morfología, clasificador de tokens) | No disponible | No disponible | Alternancias gramaticales y formas frecuentes | No disponible | No disponibles como modelos publicados en la información consultada |

La búsqueda web realizada no devolvió ningún recurso técnico relacionado con el modelo, su tarea o modelos comparables.

## Limitaciones y advertencias

- Etiquetas sintéticas: las etiquetas de entrenamiento son juicios de un LLM, no anotaciones humanas. El autor señala que, al re-adjudicar los "errores" de alta confianza del modelo, la etiqueta plateada se revocó en el 57 % de los casos, de modo que la exactitud reportada está acotada por el ruido de etiqueta.
- Sesgo hacia lecturas frecuentes: el modelo favorece la lectura común incluso en contextos construidos para forzar la lectura rara (por ejemplo, м'який *атла́с*).
- Cobertura limitada: solo puntúa formas que tengan glosa. Unas 1.900 acepciones del inventario carecen de definición y quedan fuera. Las formas ausentes del manifiesto de 15.203 entradas no se puntúan en absoluto.
- Punto débil declarado: en texto moderno rinde peor en formas ambiguas que el clasificador de tokens no cubre, con un 77,9 %.
- Dependencia del manifiesto de servicio: la lista de sentidos, glosas y firmas acentuales viaja en `serving_manifest.json`; si el manifiesto y los pesos se desincronizan, las puntuaciones dejan de ser interpretables.
- Dependencia de un umbral: la abstención con margen 0,5 es una decisión de diseño del pipeline; ajustarla cambia el equilibrio entre cobertura y precisión.
- Ámbito lingüístico restringido al ucraniano; no se reportan capacidades multilingües aunque la base sea multilingüe.
- Licencia Apache 2.0, permisiva para uso comercial, pero el corpus Wikipedia subyacente es CC BY-SA 4.0 y el corpus Malyuk puede tener sus propias condiciones, no detalladas en la información disponible.
- Sin tracción ni validación externa: 0 descargas y 0 likes en HuggingFace, y sin resultados de benchmarks estándar publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aloudreader/uk-stress-crossencoder
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Manifiesto de servicio: `serving_manifest.json`, incluido en el repositorio del modelo
- Artículo, repositorio de código, demo o publicación asociada: no disponibles en la información proporcionada
- La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo ni sobre su tarea; los resultados obtenidos no guardan relación con el contenido de esta ficha y se han descartado.
