# renaldux/lt-stress-detector

## Resumen

lt-stress-detector es un modelo de clasificación de audio a nivel de trama (audio-frame-classification) desarrollado por renaldux para detectar la posición del acento léxico y la priegaidė (acento tonal: agudo o circunflejo) en lituano a partir de la señal de voz. Está construido sobre `classla/Wav2Vec2BertPrimaryStressAudioFrameClassifier`, un modelo w2v-BERT 2.0 entrenado originalmente para acento primario en croata, serbio y esloveno (Rupnik, Ljubešić, Porupski, arXiv:2505.24571), y se ha ajustado con datos del corpus LIEPA-TTS (Universidad Vytautas Magnus, CC BY 4.0) con etiquetado lingüístico de acento y priegaidė.

El problema que resuelve es muy concreto: verificar automáticamente que las transcripciones acentuadas usadas para entrenar sistemas TTS en lituano coinciden con lo que realmente se pronuncia en las grabaciones. El modelo etiqueta cada trama de 20 ms como una de cuatro clases (`unstressed`, `short`, `acute`, `circumflex`); un pipeline complementario (`ltstress`, Apache-2.0) alinea el texto con el audio mediante CTC forced alignment, localiza los núcleos silábicos y puntúa todas las variantes de acentuación posibles de cada palabra contra las posteriores del modelo. Si la variante mejor puntuada difiere de la marca del texto, la palabra se envía a revisión humana.

Con 580 millones de parámetros y un fine-tune completo sobre una única GPU H100, el modelo reporta una tasa de detección del 99,5 % para errores de posición de acento y del 96,3 % para errores de priegaidė sobre un hablante no visto, con un 6,2 % de falsos positivos. Es una herramienta de nicho pero muy especializada, relevante para equipos que construyen TTS en lituano o que necesitan anotar prosodia a partir de audio sin texto acentuado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2BertForAudioFrameClassification (w2v-BERT 2.0) |
| Parámetros totales | 580.497.220 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clasificación por tramas de 20 ms) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Lituano (lt) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `Wav2Vec2BertForAudioFrameClassification`: un codificador w2v-BERT 2.0 que combina un front-end convolucional de extracción de características con un transformer de atención completa y clasifica cada trama de 20 ms en una de cuatro etiquetas (no acentuada, vocal corta acentuada, aguda o circunfleja). Se inicializa desde el modelo de acento primario de `classla` para croata, serbio y esloveno, lo que aporta un sesgo inductivo útil para lenguas con acento tonal y cantidad vocálica.

El ajuste es un fine-tune completo de los ~580 M de parámetros durante 6 épocas, con learning rate 2e-5, batch de 32, precisión bf16 y warmup del 10 %, sobre una única H100 de 80 GB (7,4 minutos de entrenamiento). Los datos provienen de LIEPA-TTS con etiquetas de acento y priegaidė asignadas por lingüistas: 12.658 utterances de entrenamiento y 845 de desarrollo, con una hablante (Aistė, 487 utterances) reservada por completo para test. Las etiquetas son a nivel de texto, por lo que son idénticas para las cuatro hablantes del corpus. Se enmascaran las palabras en las que las variantes de etiqueta `_a`/`_b` discrepan, así como las palabras funcionales cortas (`juk`, `nė`, `su`, `ant`, `nes`…), cuyo acento es poco audible y sus etiquetas poco fiables.

## Capacidades

- Clasificación de acento léxico por trama de 20 ms en cuatro clases: no acentuada, corta acentuada, aguda (tvirtapradė, descendente) y circunfleja (tvirtagalė, ascendente).
- Detección de la posición del acento en palabras lituanas mediante puntuación forzada de variantes contra las posteriores del modelo.
- Detección de errores de priegaidė (aguda frente a circunfleja).
- Anotación de acento y priegaidė en grabaciones sin texto acentuado (modo anotación), con un 93,8 % de forma acentuada exacta.
- Verificación de transcripciones acentuadas para limpieza de datos de entrenamiento TTS.
- Integración con el pipeline `ltstress` para alineamiento CTC forzado, detección de núcleos silábicos y decisión a nivel de palabra.
- Umbrales de decisión calibrados disponibles en `thresholds.json`.
- No soporta tool calling, agentes, visión ni otras modalidades; es un clasificador de audio puro.

## Casos de uso

- Limpieza de corpus TTS en lituano: el pipeline `ltstress` recorre un manifest de entrenamiento, puntúa cada palabra contra el audio y envía a revisión humana solo las palabras cuya variante mejor puntuada no coincide con la marca del texto. En las transcripciones de entrenamiento de SING MAR se revisaron 54.635 palabras y, de los 100 desajustes de posición de acento más frecuentes, la escucha humana confirmó 83 como errores del acentuador.
- Control de calidad de locuciones grabadas: sobre el corpus SING DOL, el detector localizó los 10 errores reales de transcripción entre 14 palabras revisadas por escucha, sin falsos positivos, lo que lo hace adecuado como filtro previo a la revisión manual.
- Anotación de prosodia en audio sin texto acentuado: para grabaciones que carecen de transcripción con marcas de acento, el modelo puede asignar acento y priegaidė directamente desde la señal, con un 93,8 % de acierto en la forma acentuada exacta.
- Validación de diccionarios de pronunciación: comparar las marcas de un lexicón lituano con las decisiones del modelo sobre grabaciones de referencia permite detectar entradas sospechosas antes de publicarlas.
- Investigación fonética y prosódica: la salida por tramas de 20 ms permite estudiar la realización acústica de la priegaidė y la duración vocálica en habla leída natural.
- Construcción de sistemas TTS con acentuación correcta: al garantizar que las transcripciones de entrenamiento reflejan el acento real, se reduce el riesgo de que el sintetizador aprenda patrones de acentuación erróneos.
- Preprocesado en pipelines de ASR con salida acentuada: el detector puede usarse para verificar o corregir la acentuación de transcripciones antes de incorporarlas a un corpus.

## Benchmarks y rendimiento

Evaluación sobre hablante no vista (Aistė) con errores inyectados en transcripciones correctas. Los porcentajes indican la proporción de errores detectados; los intervalos son del 95 %. Las palabras funcionales no se puntuaron.

| Métrica | Valor (IC 95 %) |
|---|---|
| Errores de posición de acento detectados | 99,5 % [99,1–99,8] |
| Errores de priegaidė detectados | 96,3 % [95,2–97,2] |
| Palabras correctas marcadas (falsas alarmas) | 6,2 % (~330 por hora de audio) |
| Forma acentuada exacta sin texto (modo anotación) | 93,8 % |

Resultados sobre datos reales:

| Conjunto | Resultado |
|---|---|
| SING DOL | 10 errores reales de transcripción detectados entre 14 palabras revisadas por escucha, 0 falsas alarmas |
| SING MAR (entrenamiento) | 54.635 palabras comprobadas; de los 100 desajustes de posición de acento más frecuentes, 83 confirmados por escucha como errores del acentuador |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador de audio específico de prosodia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 580 M de parámetros en bf16, la estimación teórica ronda los 1,2 GB de pesos, más el overhead de activaciones y del front-end convolucional.
- GPU recomendadas: el entrenamiento se realizó en 1× H100 80 GB (Modal), pero para inferencia un modelo de este tamaño no requiere esa clase de GPU.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 8 GB o más de VRAM, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: transformers (librería indicada en la model card), con pipeline `audio-classification`; el pipeline `ltstress` descarga automáticamente el modelo y sus umbrales. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El pipeline requiere además un modelo de alineamiento CTC (`sammy786/wav2vec2-xlsr-lithuanian`), lo que añade coste de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| renaldux/lt-stress-detector | 580 M | Lituano | Acento léxico y priegaidė por trama | CC BY-SA 4.0 | Hugging Face |
| classla/Wav2Vec2BertPrimaryStressAudioFrameClassifier | No disponible | Croata, serbio, esloveno | Acento primario por trama | No disponible | Hugging Face |
| sammy786/wav2vec2-xlsr-lithuanian | No disponible | Lituano | ASR (alineamiento CTC en el pipeline) | No disponible | Hugging Face |

El modelo base de `classla` es el referente directo en la misma arquitectura y tarea, pero para otras lenguas eslavas del sur; no se dispone de métricas comparables publicadas en la información proporcionada. El modelo lituano de `sammy786` es un ASR que se usa como componente auxiliar del pipeline, no como detector de acento. No se conocen otros detectores de acento lituano de acceso abierto con los que comparar directamente.

## Limitaciones y advertencias

- Entrenado y evaluado sobre habla leída natural; en habla sintética (TTS) las decisiones de priegaidė son menos fiables y la aguda se confunde a menudo con la circunfleja.
- Las palabras funcionales cortas no se juzgan, por lo que no hay veredicto para ellas.
- Los veredictos de priegaidė deben confirmarse contra un diccionario o por un lingüista; la posición del acento es la salida más robusta.
- Solo se han visto cuatro hablantes de LIEPA en el entrenamiento, lo que limita la generalización a otras voces, dialectos o condiciones de grabación.
- Tasa de falsas alarmas del 6,2 % (~330 por hora de audio): el filtro genera carga de revisión humana no despreciable.
- El clasificador por tramas no produce veredictos a nivel de palabra por sí solo; requiere el código complementario `ltstress` y un modelo de alineamiento CTC adicional.
- Riesgo de alucinación en el sentido de clasificaciones erróneas confiadas: al ser un clasificador, puede asignar una clase con alta probabilidad a tramas ambiguas o ruidosas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- No se han publicado datos sobre sesgos por género, edad o variedad dialectal más allá de las cuatro hablantes del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/renaldux/lt-stress-detector
- Modelo base: https://huggingface.co/classla/Wav2Vec2BertPrimaryStressAudioFrameClassifier
- Paper del modelo base (Rupnik, Ljubešić, Porupski): https://arxiv.org/abs/2505.24571
- Código complementario `ltstress` (Apache-2.0): https://github.com/rzajanckauskas/lt-stress-detector
- Modelo de alineamiento CTC usado en el pipeline: https://huggingface.co/sammy786/wav2vec2-xlsr-lithuanian
