# SharadhNaiduTrains/noise-event-detection

## Resumen

Noise-event-detection es un sistema de detección de eventos sonoros no verbales (ruido) en grabaciones de habla en lenguas indias, presentado a la Track 1 del Datathon@IndoML 2026. Lo desarrolla Sharadh A Naidu (RV University) y parte de `microsoft/wavlm-base-plus` combinado con características de audio de BEATs (AudioSet-strong). El modelo resuelve un problema de delimitación temporal: dado un `.wav`, devuelve una lista de intervalos `(onset, offset)` en segundos para cada evento de ruido, sin etiqueta de clase en la salida.

Técnicamente es un ensemble de seis detectores de fotogramas basados en WavLM (4 de 12 capas o las 12 con mezcla aprendida), con features BEATs opcionales, LayerNorm, concatenación, un Conformer de 2 capas opcional y una BiGRU de 2 capas (256 por dirección), con cabezas de frame, clip, distancia a frontera y latch start/end (RED). Trabaja a 20 ms por fotograma y produce 8 pistas internas: "cualquier ruido" más 7 categorías.

Es relevante ahora porque aborda un caso poco cubierto —ruido no verbal en habla india— con un resultado reproducible: 1.5926 de puntuación combinada (Event F1 + Segment Dice) y puesto 6 en el leaderboard de la competición sobre 5.517 clips de test oculto. El repositorio incluye código, checkpoints, informe técnico y posteriores cacheados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 6 miembros: WavLM-Base+ (4 o 12 capas) + BEATs AudioSet-strong opcional → LayerNorm + concatenación → Conformer de 2 capas opcional → BiGRU de 2 capas (256 por dirección) → cabezas frame, clip, boundary-distance y RED |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips `.wav` completos; resolución de 20 ms por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | habla en lenguas indias (dataset Vaani); lista concreta de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (repo de 3,2 GB); no se indican safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada miembro del ensemble parte de WavLM-Base+ y, según la variante, usa solo las primeras 4 de sus 12 capas transformer o las 12 con una mezcla de capas aprendida. Opcionalmente se concatenan características de fotograma de BEATs (AudioSet-strong), congeladas o afinadas. Tras LayerNorm y concatenación, algunas variantes incorporan un Conformer de 2 capas y todas pasan por una BiGRU de 2 capas con 256 unidades por dirección. Las cabezas predicen probabilidad por fotograma, probabilidad por clip, distancia a frontera y un mecanismo de latch de inicio/fin (RED). Las posteriores de los seis miembros se promedian por ruta (natural o sintética).

El entrenamiento usa exclusivamente el Vaani Noise Event Dataset (CC-BY-4.0) en su release de Track 1: 11.111 clips Gold verificados (21,85 h, peso 1), 12.014 clips Silver (peso 0,5), 1.257 clips TUNE disjuntos por hablante, 9.982 mezclas sintéticas con 1–4 eventos insertados a SNR entre −5 y 15 dB, y 9.000 clips con un evento en bucle de 2–8 s enmascarado por habla a SNR entre −12 y 2 dB. La mitad DECIDE de validación (1.244 clips, sin hablantes compartidos) se reservó para aceptar la composición del ensemble y el post-procesado; los umbrales de lectura se ajustaron en TUNE. AudioSet entra solo a través de los pesos preentrenados de BEATs. No se especifica el número total de tokens de audio ni si hubo RLHF/DPO (no aplica en una tarea de detección).

## Capacidades

- Detección de eventos de ruido no verbal con delimitación temporal precisa (onset y offset) en grabaciones de habla.
- Salida en el formato oficial de la competición: `predictions.jsonl`, una línea por clip con lista de intervalos en segundos.
- Entrada flexible: cualquier `.wav`, a cualquier frecuencia de muestreo y número de canales; se convierte a mono y 16 kHz.
- Pistas internas de categoría (animal, vehículo/tráfico, bebé/niño, canto/música, teléfono/señal/alarma, electrodoméstico/máquina, habla no verbal), usadas en el decodificador pero no expuestas como etiqueta de salida.
- Enrutamiento automático entre decodificador natural y sintético según el pico de la forma de onda.
- Post-procesado ajustado a las convenciones de anotación del dataset (incluidos eventos de fondo que cubren el clip completo).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de audio de una sola pasada.

## Casos de uso

- Reproducción del resultado de la competición: el repositorio incluye checkpoints, posteriores cacheados y el fichero de submission, de modo que un investigador puede regenerar la puntuación de 1.5926 con el scorer oficial sin reentrenar.
- Baseline para la tarea Vaani de eventos de ruido: sirve como punto de partida para comparar arquitecturas (WavLM solo frente a WavLM+BEATs, con y sin Conformer) en nuevas variantes del dataset.
- Investigación en delimitación temporal de eventos: el sistema separa explícitamente el problema de *dónde* ocurre el ruido del de *qué* ruido es, útil para estudiar errores de frontera y de fusión de eventos vecinos.
- Preprocesado de corpus de habla india: marcar tramos con ruido no verbal para filtrarlos o anotarlos antes de entrenar modelos de ASR o de identificación de hablante.
- Evaluación de robustez de pipelines de audio: las mezclas sintéticas con SNR controlado (−12 a 15 dB) permiten medir la degradación del detector en condiciones conocidas.
- Estudio de anotación y post-procesado: el sistema está ajustado a las convenciones de los anotadores del dataset, lo que lo hace útil para analizar cómo distintas convenciones afectan a las métricas de segmentación.
- Docencia y experimentación con ensembles de audio: el código, los seis diseños de miembro y el informe técnico de 3 páginas permiten reproducir el flujo completo en un entorno académico.

## Benchmarks y rendimiento

Leaderboard oficial de Track 1 (test oculto, 5.517 clips), métrica combinada Event F1 + Segment Dice:

| Ruta | Clips | Event F1 | Segment Dice |
|---|---|---|---|
| Grabaciones naturales | 3.437 | 0,4936 | 0,7178 |
| Mezclas sintéticas | 2.080 | 0,9929 | 0,9845 |
| Puntuación de leaderboard | 5.517 | — | **1,5926** (puesto 6) |

Verificación de la submission con el scorer oficial frente al fichero subido: F1 0,9996 / Dice 0,9993 (byte-exacto para el fichero previo a TTA). La inferencia en vivo, sustituyendo los checkpoints perdidos por los supervivientes, alcanza F1 0,984 / Dice 0,972 con el scorer oficial. El modelo de hábito reentrenado coincide con las decisiones enviadas en el 98,8 % de los clips naturales.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repo ocupa 3,2 GB e incluye seis checkpoints WavLM-Base+ más BEATs, pero no se detalla el consumo por miembro ni en inferencia.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; WavLM-Base+ (unos 94 M de parámetros) más BEATs y las cabezas BiGRU/Conformer sugieren que es viable en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: inferencia en PyTorch 2.4.1 con transformers 4.44.2 y scikit-learn 1.7.2 (modelo de hábito). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Noise-event-detection (este) | Detección de eventos de ruido en habla india | Ensemble WavLM-Base+ + BEATs + BiGRU/Conformer | no disponible | no disponible (fotogramas de 20 ms) | MIT | HuggingFace + GitHub |
| BEATs (AudioSet-strong) | Etiquetado de eventos de audio | Transformer sobre tokens acústicos | no disponible | no disponible | no disponible en la información | Pesos vía PretrainedSED v0.0.1 |
| WavLM-Base+ | Representaciones de habla (base del modelo) | Transformer de 12 capas | ~94 M | no disponible | no disponible en la información | HuggingFace (`microsoft/wavlm-base-plus`) |

No se dispone de otros detectores comparables de eventos de ruido en habla india en la información proporcionada; la comparación con alternativas de la misma tarea concreta queda como no disponible.

## Limitaciones y advertencias

- Brecha grande entre dominios: F1 de 0,4936 en grabaciones naturales frente a 0,9929 en mezclas sintéticas. La mayoría de errores restantes son un evento predicho que abarca varios eventos de referencia vecinos, o bordes fuera de la tolerancia del scorer.
- Pesos perdidos: tres miembros del ensemble (`v12`, `v12s62`, `v5all`) perdieron sus pesos finales al sustituirse una máquina en la nube. Solo se conservan sus posteriores de test cacheadas, de modo que la submission puede reconstruirse pero no reentrenarse tal cual.
- Modelo de hábito: el pickle original se perdió; el incluido es un reentrenamiento con la misma receta que coincide en el 98,8 % de los clips naturales, no en el 100 %.
- Post-procesado sobreajustado a las convenciones de anotación del dataset (por ejemplo, eventos de fondo que cubren el clip completo); puede no transferirse a otras convenciones.
- El enrutamiento entre decodificador natural y sintético depende del pico de la forma de onda (los clips naturales llegan a escala completa int16), un criterio frágil fuera de este dataset.
- Las etiquetas de categoría existen internamente pero nunca se evaluaron ni forman parte de la salida; no deben usarse como clasificador de clases.
- Uso previsto limitado a investigación, reproducción del leaderboard y baseline. No apto para monitorización crítica de seguridad, identificación de personas a partir de sonidos no verbales, ni audio fuera del dominio de entrenamiento (producción musical, grabaciones de campo no indias) sin revalidación.
- Licencia MIT, que permite uso comercial, pero sin garantías y con las limitaciones de dominio anteriores.
- Idiomas: solo se confirma habla en lenguas indias a través del dataset Vaani; no hay lista de idiomas ni evaluación multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SharadhNaiduTrains/noise-event-detection
- Repositorio GitHub: https://github.com/SharadhNaidu/noise-event-detection
- Informe técnico (PDF): https://huggingface.co/SharadhNaiduTrains/noise-event-detection/blob/main/docs/technical_report.pdf
- Fuente LaTeX del informe: https://huggingface.co/SharadhNaiduTrains/noise-event-detection/tree/main/docs/report
- Dataset Vaani Noise Event: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-Noise-Event-Dataset
- Modelo base WavLM-Base+: https://huggingface.co/microsoft/wavlm-base-plus
- Pesos BEATs (PretrainedSED v0.0.1): https://github.com/fschmid56/PretrainedSED/releases/tag/v0.0.1
- arXiv referenciado en los tags: arxiv:2609.02474 (no verificado en la información disponible)
