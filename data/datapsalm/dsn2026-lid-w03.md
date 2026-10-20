# datapsalm/dsn2026-lid-w03

## Resumen

dsn2026-lid-w03 es un modelo de identificación de idioma hablado (spoken language identification) construido a partir de `openai/whisper-base` y publicado por el equipo datapsalm como participación en la competición DSN 2026 «Find the Language I Am Speaking». Dado un clip de audio, el modelo predice una de 13 etiquetas: `yor`, `ibo`, `hau`, `ego`, `anw`, `efi`, `ibb`, `idu`, `igl`, `nup`, `tiv`, `urh` y `other`, cubriendo así 12 lenguas nigerianas más una clase residual para cualquier otro idioma.

Técnicamente es un checkpoint estándar de `AutoModelForAudioClassification` (librería transformers, pesos safetensors en fp16, sin código personalizado), por lo que se puede cargar con la API habitual de Hugging Face sin dependencias extrañas. Solo se utiliza el encoder de Whisper (20,2 M de parámetros) con una cabeza de pooling weighted-layer-sum, y la ventana de entrada se limita a 10 segundos de características log-mel truncando las embeddings posicionales.

Su relevancia es doble: por un lado, ataca un problema con muy poca cobertura comercial (identificación de lenguas nigerianas de bajos recursos); por otro, sirve como referencia metodológica de cómo exprimir un modelo base pequeño con aumento de datos puramente sintético derivado del propio corpus de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper (transformer) + cabeza de clasificación con pooling weighted-layer-sum |
| Parámetros totales | 20.213.268 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 10 s de log-mel (embeddings posicionales truncadas en consecuencia); no aplica contexto de tokens de texto |
| Tipos de cuantización | Pesos publicados en fp16 safetensors; otras cuantizaciones (GGUF, int8, ONNX) no disponibles en la información proporcionada |
| Idiomas soportados | 12 lenguas nigerianas (yoruba, igbo, hausa, eggon, annang, efik, ibibio, idoma, igala, nupe, tiv, urhobo) + etiqueta `other` = 13 clases |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo reutiliza únicamente el encoder de `openai/whisper-base` (20,2 M de parámetros) y lo afina de extremo a extremo con una cabeza de clasificación que aplica pooling ponderado por capas (weighted-layer-sum) sobre las representaciones del encoder. La entrada son 10 segundos de características log-mel; para mantener la coherencia posicional con esa ventana reducida se truncan las embeddings posicionales. No hay decodificador ni generación de texto: la salida es un vector de 13 logits y la inferencia es un argmax directo.

El entrenamiento usa exclusivamente el split oficial de `Data-Science-Nigeria/dsn-2026-lid-train` (el split de validación se reserva para selección de modelo y calibración), sin audio externo. Se aplican recortes aleatorios de 2 a 10 s, muestreo con rebalanceo de clases (las lenguas raras se extraen con más frecuencia) y label smoothing de 0,1. El aumento de datos se genera íntegramente a partir del propio audio de entrenamiento: ruido coloreado, babble construido con otros clips del corpus, reverberación simulada, limitación de banda telefónica con companding mu-law y clipping, ganancia aleatoria y perturbación de velocidad entre 0,85x y 1,15x para robustez frente a cambios de hablante. Como paso final se ajustan offsets de logit por clase sobre validación para maximizar el F1 ponderado por idioma de la competición; esos offsets se incorporan al sesgo del clasificador, de modo que el despliegue no requiere post-procesado.

## Capacidades

- Clasificación de idioma hablado sobre clips de hasta 10 segundos, devolviendo una de 13 etiquetas.
- Cobertura de 12 lenguas nigerianas: yoruba, igbo, hausa, eggon, annang, efik, ibibio, idoma, igala, nupe, tiv y urhobo.
- Clase `other` para descartar audio que no pertenece a ninguna de las lenguas objetivo.
- Logits ya calibrados por clase (offsets absorbidos en el sesgo), por lo que el argmax directo reproduce el comportamiento ajustado.
- Compatible con `transformers` (`AutoModelForAudioClassification`) y con el pipeline `audio-classification`; sin código remoto ni dependencias específicas.
- No soporta tool calling ni function calling: es un clasificador de audio, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso, visión, audio-texto ni modo «thinking».
- No realiza transcripción (ASR): solo identifica el idioma del clip.

## Casos de uso

- Enrutamiento de llamadas en centros de contacto: clasificar los primeros 10 s de cada llamada entrante y dirigirla a un agente que hable yoruba, hausa o igbo, reduciendo tiempos de espera y transferencias en mercados nigerianos multilingües.
- Preprocesado de pipelines ASR: etiquetar cada clip antes de pasarlo a un reconocedor específico por idioma, evitando ejecutar varios ASR en paralelo o alimentar un modelo grande con audio en un idioma que no soporta bien.
- Curación y filtrado de corpus de voz: auditar datasets multilingües y detectar clips mal etiquetados o con idioma distinto al declarado, usando la confianza del clasificador como criterio de descarte.
- Analítica de medios y radio: medir la proporción de tiempo de emisión por idioma en cadenas regionales o podcasts, agregando predicciones por ventanas de 10 s.
- Documentación lingüística y trabajo de campo: triaje automático de grabaciones recogidas en campo antes de la anotación manual, priorizando qué material revisar primero.
- Sistemas IVR y asistentes de voz: seleccionar el saludo y el árbol de menús en el idioma del usuario en los primeros segundos de la interacción.
- Moderación y compliance de contenido audio: marcar automáticamente fragmentos en lenguas no cubiertas por los revisores humanos disponibles y derivarlos a un flujo específico.
- Despliegue en dispositivo o en el borde: con 20,2 M de parámetros en fp16 (unos 40 MB de pesos) es viable ejecutarlo en CPU o en hardware embebido con baja latencia, sin GPU dedicada.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado | Notas |
|---|---|---|---|
| Validación local (split oficial + clips held-out de nupe) | F1 ponderado por idioma | 0,648 | Medido antes de la calibración por clase |
| Validación tras calibración | F1 ponderado por idioma | no disponible | La model card no reporta el valor posterior a la calibración |

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, que por otra parte no aplican a un clasificador de audio), ni comparaciones numéricas con otros sistemas de identificación de idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 40 MB para los pesos en fp16 (20,2 M de parámetros); con activaciones de una ventana de 10 s y un batch pequeño, el consumo total se mantiene por debajo de 1 GB. Cifra estimada a partir del número de parámetros, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; el modelo no aprovecha aceleradores de gama alta. Una RTX 4090 o una A100 quedarían enormemente sobredimensionadas para una sola instancia, y solo tendrían sentido con batches muy grandes o muchos flujos concurrentes.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, RTX 4060, etc.) y también en CPU; para volúmenes bajos o medios la inferencia en CPU es perfectamente razonable.
- Opciones de despliegue: pipeline `audio-classification` de transformers, `AutoModelForAudioClassification` con extracción de características de Whisper, o un servidor de inferencia propio (FastAPI + PyTorch). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y, en el caso de llama.cpp/Ollama, no aplica porque no hay pesos GGUF ni arquitectura de decodificación de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Idiomas | Tarea | Licencia |
|---|---|---|---|---|---|
| datapsalm/dsn2026-lid-w03 | 20,2 M | 10 s de log-mel | 12 lenguas nigerianas + `other` | Identificación de idioma | Apache 2.0 |
| openai/whisper-base (modelo base) | ~74 M | 30 s de log-mel | Multilingüe (ASR) | Transcripción, no LID | Apache 2.0 |
| speechbrain/lang-id-voxlingua107-ecapa | no disponible | Fragmentos cortos de audio | ~107 idiomas | Identificación de idioma | Apache 2.0 |
| facebook/mms-lid-256 | no disponible | Audio crudo | ~256 idiomas | Identificación de idioma | CC-BY-NC 4.0 (no comercial) |

Nota: los datos de las filas comparativas provienen de las model cards públicas de cada proyecto y no se han verificado mediante ejecución propia. Frente a VoxLingua107 o MMS-LID, este modelo sacrifica cobertura global para especializarse en lenguas nigerianas de bajos recursos, un terreno donde los modelos multilingües genéricos suelen tener poco o ningún soporte. Frente a `whisper-base` completo, el recorte a la mitad del encoder y el uso de solo 10 s de audio reducen coste computacional a cambio de renunciar a la transcripción.

## Limitaciones y advertencias

- Varias lenguas tienen muy pocos hablantes en entrenamiento (nupe: 1; igala: 2; ibibio: 2), por lo que la precisión sobre hablantes no vistos de esas clases es incierta y probablemente muy inferior a la del resto.
- Annang, ibibio y efik están estrechamente emparentadas y el propio autor advierte que pueden confundirse entre sí.
- El F1 ponderado por idioma en validación es 0,648 antes de calibración: es un rendimiento modesto que aconseja no usar el modelo como única señal en producción sin umbrales de confianza y revisión humana.
- Riesgo de alucinación de clase: al ser un clasificador cerrado con argmax, siempre devuelve una de las 13 etiquetas, incluso ante audio en un idioma no cubierto, ruido o silencio. La clase `other` existe, pero su fiabilidad no está cuantificada en la información disponible.
- La ventana de 10 s implica que clips más largos deben trocearse y agregarse; el modelo no modela contexto temporal más allá de esa ventana.
- Solo se entrenó con el corpus oficial de la competición, sin datos externos, lo que limita la variedad de dominios, micrófonos y acentos representados.
- La licencia Apache 2.0 permite uso comercial y modificación, pero las fuentes del corpus de entrenamiento tienen sus propias licencias (afrispeech_ipa CC-BY-4.0, hypa_voices Apache-2.0, omnilingual_asr CC-BY-4.0), incluyendo requisitos de atribución y cita que conviene respetar en trabajos derivados.
- No hay informe de sesgos por género, edad o región dentro de cada lengua; el rebalanceo de clases por frecuencia no corrige necesariamente sesgos de hablante.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, y es un checkpoint de competición sin historial de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datapsalm/dsn2026-lid-w03
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Data-Science-Nigeria/dsn-2026-lid-train
- Paper citado para la porción omnilingual_asr: https://arxiv.org/abs/2511.09690

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre prendas de motorista y se han descartado por no guardar relación con la ficha.
