# JacobLinCool/accent-detective

## Resumen

Accent Detective es un modelo de clasificación de audio desarrollado por JacobLinCool que puntúa en qué medida una grabación en mandarín suena a mandarín de Taiwán. No es un modelo generativo ni un sistema de reconocimiento de voz: es un detector de acento entrenado específicamente para evaluar sistemas de síntesis de voz (TTS), comparando distintas versiones de una misma frase. Su interés radica en que aborda un problema poco cubierto —la evaluación automática de la naturalidad regional en TTS— con un diseño poco habitual: una única red Conformer que puede truncarse a cuatro profundidades distintas, compartiendo los mismos pesos.

El modelo tiene 53,9 M de parámetros en un único checkpoint `model.safetensors` y se distribuye bajo licencia MIT, lo que facilita su integración en pipelines de evaluación. La innovación principal es la arquitectura de salidas múltiples (exits) tras las capas 3, 6, 9 y 18, que permite desde despliegues en CPU con recursos limitados hasta la configuración de máxima precisión sin cambiar de modelo. Además, admite dos modos de inferencia: solo audio o audio más el texto que se lee, sin necesidad de alineamiento forzado en ninguno de los dos casos.

Es relevante ahora porque la evaluación de TTS en lenguas con variación regional sigue dependiendo en gran medida de oyentes humanos, y este modelo ofrece una alternativa calibrada y reproducible para comparar sistemas como BreezyVoice o CosyVoice en el eje del acento taiwanés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (trunk) con múltiples exits y readouts de audio y texto |
| Parametros totales | 53.918.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio en tramas log-mel de 20 ms; fragmentación en piezas de 4-10 s para grabaciones largas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (mandarín) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tronco es un Conformer de anchura 384 y 18 capas que opera sobre tramas log-mel de 20 ms. El modelo expone cuatro salidas (exits) tras las capas 3, 6, 9 y 18, correspondientes a los tamaños nano, tiny, mini y small (9,5 M, 16,2 M, 22,9 M y 43,0 M de parámetros en modo solo audio; 10,5 M, 17,2 M, 23,9 M y 44,0 M con texto). Cada exit predice capas ocultas de dos profesores auto-supervisados: las capas 4, 8 y 12 de `TencentGameMate/chinese-wav2vec2-base` y las capas 8 y 12 de `TencentGameMate/chinese-hubert-base`. El readout de audio aplica attentive statistics pooling sobre las capas predichas (con la media de la locución eliminada) para producir un log-odds a nivel de enunciado.

El readout de texto convierte cada sílaba en una query que codifica la sílaba, sus tonos en mandarín continental y taiwanés, el sandhi tonal, el tono neutro y la posición. Dos capas de atención leen las tramas del readout de audio bajo un prior monotónico suave de posición, y la media de las salidas silábicas se suma al log-odds de audio como corrección. El entrenamiento combina destilación de características de ambos profesores con tres señales de tarea de acento: objetivos suaves de un ensemble de jueces de acento basados en HuBERT, ranking de grabaciones de la misma frase en taiwanés frente a continental, y consistencia del score ante perturbaciones de canal (ruido, limitación de banda, µ-law). Los readouts se entrenan después sobre el tronco congelado, con pesos de importancia por longitud de frase y contexto textual, más un sesgo product-of-experts que solo ve el texto para evitar que aprendan del contenido.

## Capacidades

- Puntuación de acento: devuelve `logit`, `probability` e `index` (log-odds en escala 0-1, donde 0,5 es indeciso y cada 0,1 equivale a unas 7 veces las odds).
- Cuatro tamaños en un solo checkpoint: nano, tiny, mini y small, donde cada tamaño menor es la primera parte del mayor; `score_sizes` obtiene los cuatro en una sola pasada del tamaño mayor.
- Modo solo audio o audio más texto: si el texto no contiene sílabas Han, se usa el modo de audio; no requiere alineamiento forzado en ningún caso.
- Procesamiento de grabaciones largas: `score_recording` corta el audio en pausas en piezas de 4-10 s; las grabaciones de más de 15 s se puntúan sin texto.
- Calibración incluida: una transformación de Platt por tamaño y modo, ajustada sobre datos de desarrollo, se distribuye con los pesos.
- No soporta tool calling, agentes, visión ni audio generativo; es exclusivamente un clasificador de audio.

## Casos de uso

- Evaluación de sistemas TTS en mandarín taiwanés: comparar distintas versiones de un sintetizador sobre la misma frase y usar el score calibrado para decidir qué versión suena más natural en registro taiwanés. El modelo fue diseñado exactamente para esto.
- Control de calidad en pipelines de doblaje y localización: puntuar automáticamente clips generados o grabados para detectar desviaciones hacia el mandarín continental antes de la revisión humana.
- Selección de voces en producción de contenido: dado un conjunto de voces candidatas, ordenarlas por afinidad al acento taiwanés usando `score_sizes` en una sola pasada.
- Investigación en fonética y prosodia: analizar cómo varían los contornos tonales, tonos neutros, iniciales y finales entre variedades, usando el modo con texto para aislar la contribución silábica.
- Filtrado de datasets de audio: descartar o etiquetar grabaciones según su grado de acento taiwanés antes de usarlas para entrenar otros modelos de voz.
- Despliegue ligero en CPU: usar el tamaño nano (9,5 M de parámetros) en entornos con recursos limitados para cribados masivos, reservando el tamaño small para la verificación final.

## Benchmarks y rendimiento

| Metrica | Nano | Tiny | Mini | Small |
|---|---:|---:|---:|---:|
| AUC con longitud emparejada, hablantes sellados, etiquetas verificadas por oyentes (583 clips Taiwán, 1.451 continental, 448 hablantes) | 0,956 | 0,961 | 0,960 | 0,962 |
| La misma métrica, con texto | 0,956 | 0,960 | 0,960 | 0,962 |
| La misma métrica, etiquetas de Common Voice tal como se publicaron (2.060 clips) | 0,888 | 0,903 | 0,905 | 0,913 |
| Error de calibración esperado, hablantes sellados, etiquetas verificadas | 0,031 | 0,028 | 0,028 | 0,034 |
| Mismo texto y voz, BreezyVoice por encima de CosyVoice-300M (1.000 pares) | 79% | 79% | 80% | 80% |
| El mismo contraste en desviaciones estándar del score sobre voz real | 0,38 | 0,36 | 0,37 | 0,37 |
| Comparación de los dos sintetizadores en 10 pares aleatorios que ordenan BreezyVoice primero | 99% | 99% | 99% | 99% |

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa aproximadamente 0,6 GB en el repositorio; con 53,9 M de parámetros en fp32 la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090 o similar queda muy sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: el tamaño nano está pensado explícitamente para despliegues en CPU con recursos limitados.
- Opciones de despliegue: el modelo se carga mediante el módulo `detective.py` incluido en el repositorio (dependencias: torch, torchaudio, librosa, soundfile, numpy, pypinyin, jieba, opencc, safetensors). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de identificación de acento en mandarín con los que establecer una comparativa directa de parámetros, contexto, rendimiento y licencia. Los únicos sistemas mencionados en la model card son los sintetizadores evaluados (BreezyVoice y CosyVoice-300M), que no son alternativas al detector sino objetos de su evaluación.

## Limitaciones y advertencias

- El modelo mide cómo se pronuncia una frase (contornos tonales, tonos neutros, iniciales, finales y ritmo), no el vocabulario ni la corrección de la lectura; no debe interpretarse como un verificador de pronunciación correcta.
- Fue construido para evaluar sistemas TTS comparando distintas versiones de la misma frase; el autor indica explícitamente que no está pensado para clasificar personas.
- Solo soporta mandarín (zh); no cubre otras lenguas ni variedades del chino distintas de la taiwanesa frente a la continental.
- Las grabaciones de más de 15 s se puntúan sin texto, porque el texto no puede dividirse sin alineamiento, lo que puede reducir la precisión en esos casos.
- Riesgo de sesgo: el conjunto de evaluación sellado incluye clips de Taiwán y 69 clips continentales que estuvieron entre el audio no etiquetado usado para destilar un estudiante anterior, del que parte el tronco liberado; el autor lo advierte y señala que ningún otro sistema comparado oyó esas grabaciones.
- Las etiquetas de Common Voice tal como se publicaron producen un AUC notablemente inferior (0,888-0,913) que las verificadas por oyentes (0,956-0,962), lo que sugiere ruido en las etiquetas originales que conviene tener en cuenta al interpretar resultados.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni limitaciones adicionales más allá de las estándar de la licencia.
- No se documentan riesgos de alucinación en el sentido generativo, pero sí la posibilidad de scores mal calibrados fuera de la distribución de audio de entrenamiento (canales, ruido, acentos no representados).

## Enlaces

- HuggingFace: https://huggingface.co/JacobLinCool/accent-detective
- Profesor wav2vec2: https://huggingface.co/TencentGameMate/chinese-wav2vec2-base
- Profesor HuBERT: https://huggingface.co/TencentGameMate/chinese-hubert-base
- Dataset de evaluación mencionado: Common Voice (https://commonvoice.mozilla.org/)
- No se han proporcionado enlaces a papers, blogs, repositorios ni demos adicionales en la información disponible.
