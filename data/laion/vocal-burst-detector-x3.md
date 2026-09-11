# laion/vocal-burst-detector-x3

## Resumen

vocal-burst-detector-x3 es un clasificador de audio desarrollado por LAION que detecta y nombra sonidos paralingüísticos breves ("vocal bursts") en habla: inhalaciones, suspiros, risas, carraspeos, murmullos y similares. No es un modelo generativo ni un modelo de lenguaje: es una cabeza de clasificación entrenada sobre embeddings congelados de VoiceCLAP, la familia de encoders de audio del propio LAION. La versión de producción usa `laion/voiceclap-large-v2` (3584 dimensiones, congelado) y existe una variante `commercial/` sobre `laion/voiceclap-commercial` (768 dimensiones) pensada para ser más barata.

El modelo llega como sucesor de `laion/vocal-burst-detector-x2` y su motivación es muy concreta: x2 se usó para reclasificar los 63,8 millones de spans de burst almacenados en el corpus `laion-tts-annotated-v1`, y el 70 % de todos ellos volvieron etiquetados como `Sharp Inhale` (81 % en el subcorpus Mediathek). Tres mediciones del equipo mostraron que el problema no era de vocabulario sino de calibración de la salida de rechazo: las dos etiquetas más frecuentes del detector antiguo (`Ahem` y `Low Mumble`, ~26 % de los eventos cada una) correspondían a falsas alarmas del localizador en medio del habla, y x2 nunca las rechazaba porque sus ejemplos de `no_burst` eran ventanas de ≥0,5 s de habla o silencio, nunca un corte de 0,2–0,5 s dentro de habla continua.

x3 introduce dos cambios: añade las clases `Ahem` y `Low Mumble` (18 clases de burst en total, más `no_burst` = 19 salidas) y añade un tercer subtipo de negativo, `fp_span`, formado por spans del detector antiguo etiquetados como `Ahem`/`Low Mumble` que ningún evento anotado solapa. El resultado principal que el repositorio publicita es el rechazo de esos falsos positivos: sobre filas reservadas de tipo `fp_span`, x2 rechazaba el 0–2 % y x3 rechaza el 92–97 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación MLP sobre embeddings congelados de VoiceCLAP (3584 → 256 → 19 en `production/`; 768 → 256 → 19 en `commercial/`), dropout 0,3 |
| Parámetros totales | No disponible. La cabeza descrita implica del orden de 0,9 M de parámetros entrenables en `production/` y 0,2 M en `commercial/` (cálculo derivado de la arquitectura, no publicado por el autor); el encoder VoiceCLAP va congelado y su recuento no se indica |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (clasificador sobre spans de audio; el modelo card menciona ventanas de ≥0,5 s para los negativos de `speech`/`silence` y cortes de 0,2–0,5 s para `fp_span`) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible. Los corpus citados (Mediathek, DramaBox, emolia, podcast) no llevan especificación de idioma en la información proporcionada |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); el repositorio incluye además `bs_score.py` (scorer importable), `per_class_recall.json`, matrices de confusión completas y los directorios `production/`, `commercial/`, `ablations/`, `training_extras/`, `*/validation_spans_x2_vs_x3.md`. No se mencionan safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

El modelo es una cabeza de clasificación entrenada sobre embeddings de audio congelados. La receta es idéntica a la de x2 salvo en el vocabulario y en la mezcla de negativos: un split agrupado (real por hablante, DramaBox por prompt), semilla de split 0, cinco inicializaciones cuyas probabilidades se promedian en espacio de probabilidad, 120 épocas, 25 ejemplos reservados por clase y un MLP 3584 → 256 → 19 (o 768 → 256 → 19 en la variante comercial). Las clases de salida son 18 bursts más `no_burst`.

Los datos de entrenamiento son segmentos del dataset `laion/vocal-bursts-segments`, utterances reales y material TTS de DramaBox, con anotaciones ciegas de clip completo producidas por `gemini-3.8-flash`. La innovación técnica central está en los negativos: se añade el subtipo `fp_span`, 1.115 ejemplos extraídos de utterances reales y 1.200 minados con el mismo procedimiento sobre DramaBox (localizador v2 + detector antiguo sobre 35.224 clips, para que `fp_span` no sea aprendible como "es audio real"). La mezcla de negativos por época pasa a 0,55 `speech` / 0,20 `silence` / 0,25 `fp_span`, frente a 0,75 / 0,25 de x2. Respecto al vocabulario, las etiquetas `Clears Throat` y `Throat-clearing` de Gemini se pliegan en `Ahem` y `Whispered Mumble` en `Low Mumble`; `Cough` se deja deliberadamente fuera por considerarse un sonido distinto. El autor advierte que las dos clases nuevas son material DramaBox en un 96–97 %: la mitad de audio real de Gemini solo aporta 44 segmentos de `Ahem` y 14 de `Low Mumble`, admitidos por el recuento agrupado (1.099 / 418), de modo que su recall en audio real se mide sobre muy pocas filas.

## Capacidades

- Clasificación de audio en 19 clases: 18 tipos de vocal burst más `no_burst`.
- Detección y rechazo explícito de falsos positivos del localizador (`fp_span`), con recall de rechazo del 96–97 % en la variante de producción.
- Distinción entre habla real, silencio y span falso dentro de habla continua, mediante el gate `P(no_burst) ≥ 0.5`.
- Vocabulario ampliado respecto a x2 con `Ahem` (carraspeo) y `Low Mumble` (murmullo), las dos etiquetas más frecuentes del detector antiguo que x2 no sabía nombrar.
- Etiquetado a nivel de span sobre corpus ya segmentados; el scorer `bs_score.py` mantiene la misma API que en x2 (importable, sin cambios de interfaz).
- Trazabilidad de resultados: matrices de confusión completas y `per_class_recall.json` por clase, que el autor pide leer antes que cualquier tasa de acierto agregada.
- No dispone de tool calling, function calling, capacidades de agente, generación de texto, visión, audio generativo ni modo de razonamiento: es exclusivamente un clasificador.

## Casos de uso

- Re-scoring del corpus `laion-tts-annotated-v1`: es el caso de uso declarado del modelo; sustituye a x2 para reclasificar los 63,8 M de spans de burst almacenados y corregir el sesgo masivo hacia `Sharp Inhale` (70 % global, 81 % en Mediathek).
- Limpieza de datasets TTS: descartar spans que en realidad son falsas alarmas del localizador antes de entrenar modelos de síntesis, evitando que el modelo aprenda a insertar pausas o respiraciones inexistentes.
- Auditoría de anotaciones paralingüísticas: el gate `P(no_burst)` permite medir qué proporción de las etiquetas heredadas de un pipeline anterior son ruido, como muestra la tabla de los 1.967 spans de validación (97,2 % de rechazo en `Low Mumble`, 97,4 % en `Ahem`).
- Curaduría de corpus de habla para ASR: filtrar fragmentos de habla mal segmentados que un localizador marcó como burst, reduciendo falsos eventos antes de alinear transcripciones.
- Control de calidad en pipelines de localización de eventos: dado un localizador (por ejemplo `laion/vocalburst-locator` v2) y un clasificador, usar x3 como etapa de verificación para decidir qué spans llegan a anotación humana.
- Preprocesado de asistentes de voz y sistemas de diálogo: detectar carraspeos, suspiros o murmullos reales para decidir si conviene ignorarlos, reformular o pedir repetición.
- Investigación en paralingüística comparada: la estructura del repo (`ablations/`, `training_extras/`, matrices de confusión, splits disjuntos) permite reproducir la comparación x2 vs. x3 sub-tipo a sub-tipo, incluida la separación entre audio real y DramaBox.
- Despliegue de bajo coste con la variante `commercial/`: cuando el presupuesto de cómputo importa más que el recall, ofrece un rechazo de falsos positivos algo menor (92 % frente a 96–97 %) sobre embeddings de 768 dimensiones en lugar de 3584.

## Benchmarks y rendimiento

Recall de `no_burst` sobre filas reservadas, por subtipo (las filas `fp_span` son disjuntas por hablante/prompt respecto al entrenamiento; x2 nunca se entrenó con ninguna fila `fp_span`, por lo que las 2.315 son válidas para evaluarlo, y rechaza el 0,2 %):

| Subtipo | n | x2 (large-v2) | x3 `production/` | x2 (commercial) | x3 `commercial/` |
|---|---:|---:|---:|---:|---:|
| real / `fp_span` | 60 | 0 % | 97 % | 2 % | 92 % |
| dramabox / `fp_span` | 26 | 0 % | 96 % | 0 % | 92 % |
| real / `speech` | 777 | 99 % | 99 % | 97 % | 96 % |
| real / `silence` | 25 | 56 % | 44 % | 36 % | 36 % |
| dramabox / `speech` | 89 | 100 % | 99 % | 99 % | 99 % |
| dramabox / `silence` | 49 | 92 % | 88 % | 84 % | 82 % |

Rechazo sobre los 1.967 spans almacenados de 3.200 clips de validación (emolia + podcast, no vistos por ninguna de las dos cabezas; gate `P(no_burst) ≥ 0.5`):

| Etiqueta antigua | n | x2 rechaza | x3 `production/` rechaza | x3 `commercial/` rechaza |
|---|---:|---:|---:|---:|
| `Low Mumble` | 1002 | 0,0 % | 97,2 % | 89,4 % |
| `Ahem` | 701 | 0,0 % | 97,4 % | 76,9 % |
| `Surprised Gasp` | 54 | 0,0 % | 74,1 % | 16,7 % |
| `Wistful Sigh` | 31 | 0,0 % | 74,2 % | 29,0 % |
| `Contented Sigh` | 24 | 0,0 % | 50,0 % | 4,2 % |
| `Exhausted Groan` | 28 | 0,0 % | 50,0 % | 0,0 % |
| `Childlike Giggle` | 44 | 0,0 % | 22,7 % | 9,1 % |
| `Chuckle` | 38 | 0,0 % | 18,4 % | 0,0 % |
| `Breathy Giggl...` | — | — | — | — |

La información proporcionada se corta en la última fila de esta tabla (`Breathy Giggl`), por lo que el resto de etiquetas y sus cifras no están disponibles. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de audio.

## Requisitos de hardware

- VRAM de la cabeza: despreciable. El recuento derivado de la arquitectura (menos de 1 M de parámetros en `production/`) implica checkpoints de pocos megabytes, coherentes con un tamaño de repositorio de 0,0 GB.
- El coste real está en el encoder VoiceCLAP congelado (`laion/voiceclap-large-v2` en producción, `laion/voiceclap-commercial` en la variante barata). No se publica en la información disponible el número de parámetros ni los requisitos de VRAM del encoder.
- GPU recomendadas: no disponibles. Dado que la variante comercial opera sobre embeddings de 768 dimensiones frente a 3584, es previsible que sea sustancialmente más ligera en memoria y en tiempo de extracción, pero no hay cifras publicadas.
- Inferencia en GPU de consumo: no se puede confirmar con los datos disponibles; depende por completo del encoder VoiceCLAP, no de la cabeza.
- Opciones de despliegue: PyTorch con `bs_score.py` como scorer importable (API sin cambios respecto a x2). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a un clasificador de audio de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Espacio de embeddings | Clases | Rechazo de `fp_span` (real) | Rechazo de `fp_span` (DramaBox) | Licencia |
|---|---|---:|---:|---:|---|
| `laion/vocal-burst-detector-x3` (`production/`) | voiceclap-large-v2, 3584-d | 19 (18 bursts + `no_burst`) | 97 % | 96 % | cc-by-4.0 |
| `laion/vocal-burst-detector-x3` (`commercial/`) | voiceclap-commercial, 768-d | 19 | 92 % | 92 % | cc-by-4.0 |
| `laion/vocal-burst-detector-x2` (large-v2) | voiceclap-large-v2, 3584-d | 16 | 0 % | 0 % | no disponible en la información proporcionada |
| `laion/vocal-burst-detector-x2` (commercial) | voiceclap-commercial, 768-d | 16 | 2 % | 0 % | no disponible en la información proporcionada |

Los dos modelos base (`laion/voiceclap-large-v2` y `laion/voiceclap-commercial`) no son comparables como detectores: son encoders de embeddings de audio sobre los que se entrena esta cabeza. No se han identificado en la información disponible otros detectores de vocal bursts de terceros con los que comparar directamente.

## Limitaciones y advertencias

- Sesgo de origen de datos en las clases nuevas: `Ahem` y `Low Mumble` son material DramaBox en un 96–97 %. En audio real solo hay 44 y 14 segmentos respectivamente, y el propio autor marca con advertencia las cifras de recall medidas sobre esas filas.
- Compromiso en el rechazo de silencio: x3 baja de 56 % a 44 % en `real/silence` y de 92 % a 88 % en `dramabox/silence` respecto a x2 en la variante de producción, un efecto secundario de la nueva mezcla de negativos.
- El rechazo es muy desigual según la etiqueta antigua: 97 % en `Low Mumble` y `Ahem`, pero solo 50 % en `Contented Sigh` y `Exhausted Groan`, 22,7 % en `Childlike Giggle` y 18,4 % en `Chuckle`. No debe asumirse una tasa de rechazo uniforme.
- La variante `commercial/` es más selectiva en algunas clases (76,9 % en `Ahem`, 29,0 % en `Wistful Sigh`, 16,7 % en `Surprised Gasp`, 0 % en `Exhausted Groan` y `Chuckle`): elegirla cambia materialmente el comportamiento del pipeline.
- Aunque el autor afirma que las filas `fp_span` son disjuntas por hablante o prompt respecto al entrenamiento, siguen procediendo del mismo procedimiento de minado (localizador v2 + detector antiguo), lo que puede introducir sesgos compartidos con el despliegue real.
- Las anotaciones de referencia del entrenamiento y de parte de la evaluación provienen de un modelo propietario (`gemini-3.8-flash`), no de anotación humana verificada; los errores de ese anotador se heredan en el vocabulario y en las métricas.
- `Cough` se excluye deliberadamente del vocabulario: un acceso de tos puede acabar clasificado en la clase de burst más cercana, presumiblemente `Ahem`.
- Cobertura de idiomas no documentada. Los corpus citados (Mediathek, DramaBox, emolia, podcast) sugieren material multilingüe, pero no hay lista de idiomas soportados ni evaluación por idioma.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero conviene verificar por separado las licencias de `laion/voiceclap-large-v2`, `laion/voiceclap-commercial` y del dataset `laion/vocal-bursts-segments`, así como los términos de uso del material DramaBox.
- Riesgo de alucinación en el sentido de falsos positivos de clase: el modelo siempre tiende a asignar una clase de burst a un fragmento ambiguo si `P(no_burst)` no supera el gate, por lo que el umbral de 0,5 es un parámetro de producción que debe calibrarse por caso de uso.
- El repositorio declara 0 descargas y 0 likes, y la model card está truncada en la información disponible: faltan el resto de la tabla de validación y las secciones finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/vocal-burst-detector-x3
- Predecesor: https://huggingface.co/laion/vocal-burst-detector-x2
- Modelo base (producción): https://huggingface.co/laion/voiceclap-large-v2
- Modelo base (variante comercial): https://huggingface.co/laion/voiceclap-commercial
- Dataset de entrenamiento: https://huggingface.co/datasets/laion/vocal-bursts-segments
- Corpus reclasificado: `laion-tts-annotated-v1` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Localizador de referencia: `laion/vocalburst-locator` v2 (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Búsqueda web: no se ha recuperado ningún resultado relevante para este modelo; las únicas respuestas devueltas fueron páginas genéricas de LinkedIn y de Zhihu sin relación con `laion/vocal-burst-detector-x3`.
