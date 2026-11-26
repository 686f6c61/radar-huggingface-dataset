# semantique-team/moth-50

## Resumen

MOTH-50 es un modelo de reconocimiento automático del habla (ASR) especializado en *code-switching* italiano-inglés, desarrollado por semantique-team. Se trata de un modelo CTC *encoder-only* derivado del encoder de Whisper-base de OpenAI, reentrenado y cuantizado a INT8 para que el paquete completo de inferencia (grafo acústico, modelo de lenguaje, VAD, filtros mel, vocabulario y configuración) quepa en 50 MB. Su arquitectura parte de las 6 capas, anchura 512, 8 cabezas y FFN de 2048 del encoder de Whisper-base, a las que se añaden 6 bloques transformer pre-LN y una capa CTC lineal, sumando 39.259.649 parámetros acústicos.

El modelo resuelve un problema concreto: la transcripción de habla italiana con términos, acrónimos, marcas y frases en inglés intercaladas, en entornos de CPU y navegador, con un paquete comercialmente usable bajo licencia Apache-2.0. No es un sistema de streaming ni un decoder basado en LLM: opera en modo *record-then-transcribe*, lo que implica latencia de frase completa en lugar de transcripción en vivo.

La relevancia actual reside en su huella extremadamente reducida (49.204.097 bytes en el paquete de release, 795.903 bytes por debajo del techo de 50.000.000 B) y en su enfoque de despliegue en el borde (*edge*), con un runtime ONNX autocontenido y un modelo de lenguaje empaquetado propio (E-034c, formato MOTHLMB2, 7.787.184 B). La versión `0.9.8-e023-r1` es un reempaquetado *NOTICE-only* de `0.9.7-e023-r1` con activos de runtime idénticos byte a byte, y supone el producto final de la línea MOTH-50.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only CTC: encoder de Whisper-base (6 capas, anchura 512, 8 cabezas, FFN 2048) + 6 bloques transformer pre-LN + CTC lineal |
| Parametros totales | 39.259.649 (modelo acústico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz mono; segmentación mediante VAD Silero) |
| Tipos de cuantizacion | INT8 (grafo de 40.039.997 B); no se documentan otros formatos |
| Idiomas soportados | Italiano (it) e inglés (en), con *code-switching* IT-EN |
| Licencia | Apache-2.0 (repositorio, código y pesos) |
| Formato de pesos | ONNX (runtime onnxruntime); grafo INT8 empaquetado |
| Tokenizer | BPE de 1.024 piezas, sha256 `d6e1054e…` |
| Modelo de lenguaje | E-034c, MOTHLMB2, 7.787.184 B, sha256 `7a4332f1…` |
| VAD | Silero 16 kHz, 1.289.603 B |
| Decoder | beam 12, top-k 10, peso LM 0.55, bonus de token 2.7 |
| Tamano del paquete de release | 49.204.097 B |
| Modelo base | openai/whisper-base |

## Arquitectura y entrenamiento

El modelo es un sistema CTC *encoder-only*, no un transformer encoder-decoder completo como Whisper original. Reutiliza el encoder preentrenado de Whisper-base y le añade 6 bloques transformer con normalización pre-LN y una cabeza CTC lineal. La decodificación combina búsqueda por haz (beam 12, top-k 10) con un modelo de lenguaje n-gram empaquetado (E-034c) y un peso de LM de 0.55 más un bonus de token de 2.7. El runtime aplica un VAD Silero a 16 kHz antes de la transcripción, de modo que el paquete es autocontenido: grafo INT8, LM, VAD, filtros mel, vocabulario y configuración.

El entrenamiento corresponde al brazo E-023 R1 con semilla 0, partiendo del encoder preentrenado de Whisper-base, durante 40.000 pasos con LR de encoder 3e-5, LR de cabeza 3e-4, EMA 0.9998, bf16 y *activation checkpointing*, ejecutado en un M5 Pro de 16 GB. La mezcla R1 por época (antes de repeticiones) incluye Common Voice IT 27 limpio-50 (56.769 clips, 84,22 h, CC0), Common Voice IT 27 ruidoso-50 (56.349 clips, 83,56 h, CC0, mezclado con ruido MUSAN CC-BY-4.0 y tono de sala), MLS Italian train (40.953 clips, 169,89 h, CC-BY-4.0), LibriSpeech train-clean-100 (28.370 clips, 100,00 h, CC-BY-4.0), IT+EN empalmado (20.623 clips, 110,00 h, derivado de los anteriores) y Gold v1.0.0 repetido ×50 (1.413 clips, 0,96 h ×50 = 48,0 h, CC-BY-4.0). Los conjuntos S1-dev y R-S1-cal se mantuvieron fuera del entrenamiento. No se empleó audio TTS en el producto: el brazo E-027 (fine-tune TTS) empató y no se adoptó (decisión D36).

## Capacidades

- Reconocimiento automático del habla en italiano e inglés con *code-switching* IT-EN (términos, acrónimos, marcas y frases intercaladas).
- Transcripción *offline* por lotes (*record-then-transcribe*), no streaming ni transcripción en vivo.
- Ejecución en CPU de escritorio y en navegador mediante runtime ONNX autocontenido.
- Detección de actividad de voz (VAD) Silero integrada a 16 kHz para segmentación previa.
- Decodificación con modelo de lenguaje n-gram propio (beam 12, top-k 10, peso LM 0.55, bonus de token 2.7).
- Cuantización INT8 para reducir huella y permitir despliegue en el borde.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio generativo ni modo *thinking*: es exclusivamente un modelo ASR CTC.

## Casos de uso

- Transcripción de dictado italiano con terminología técnica en inglés: el modelo está entrenado sobre habla leída o dictada en entorno silencioso a moderado, por lo que encaja en flujos de dictado profesional donde el usuario intercala términos ingleses (nombres de API, marcas, acrónimos) sin cambiar de idioma.
- Subtitulado por lotes de material audiovisual italoinglés: al operar en modo *record-then-transcribe* y con VAD integrado, puede procesar ficheros completos en CPU de escritorio sin GPU, generando transcripciones con marcas temporales derivadas de la segmentación VAD.
- Transcripción en el navegador sin backend: el paquete de 49,2 MB y el runtime ONNX permiten ejecutar la inferencia íntegramente en el cliente, lo que resulta adecuado para aplicaciones de privacidad estricta donde el audio no debe salir del dispositivo.
- Procesamiento en el borde (*edge*) en dispositivos con recursos limitados: con 39,26 M de parámetros acústicos en INT8 y un paquete autocontenido, cabe en entornos sin GPU dedicada, como mini-PC, portátiles modestos o contenedores ligeros.
- Normalización de transcripciones para *pipelines* de datos: al ser Apache-2.0 y comercialmente usable, puede integrarse en procesos de limpieza y etiquetado de corpus de voz IT-EN en producción.
- Investigación en *code-switching*: sirve como línea base reproducible (semilla 0, mezcla R1 documentada, decoder congelado) para comparar técnicas de ASR bilingüe con presupuesto de 50 MB.
- Evaluación de despliegue web: su informe de RTFx 28,48 en el clip de humo (4 hilos, aislado, SIMD, carga de 79,7 ms) lo hace útil como referencia para medir latencia y throughput de ASR en navegador.

## Benchmarks y rendimiento

Resultados declarados por el autor con el decoder congelado y el LM E-034c en INT8. Los intervalos de confianza pareados son bootstrap de 1.000 remuestreos al 95 % por enunciado.

| Conjunto | n | WER | ETA | Notas |
|---|---:|---:|---:|---|
| dev-macro (MLS-IT + LS-EN dev) | 3.939 | 14,3274 % | — | IT 19,5016 % / EN 9,1533 % |
| S1-dev (960 tomas retenidas S1) | 960 | 13,3820 % | 75,1465 % | voz S1 |
| R-S1-cal (400 cues de calibración) | 400 | 12,8469 % | 75,4967 % | voz S1, conjunto de ranking |
| T-600 (S1+S2+S3, leído) | 600 | 12,2993 % | 78,1400 % | lectura repetida declarada |
| T-600, S1 | 200 | 10,0602 % | 81,1940 % | — |
| T-600, S2 | 200 | 13,4666 % | 77,6204 % | — |
| T-600, S3 (nunca entrenado) | 200 | 13,3731 % | 75,7746 % | evaluado repetidamente |
| FLEURS-IT test (filtrado) | 697 | 11,8304 % | — | una vez, solo informe |
| FLEURS-EN test (filtrado) | 525 | 28,1955 % | — | una vez, solo informe |
| CS-FLEURS-READ IT-EN | 176 | 34,8085 % [32,89–36,81] | — | una vez, externo, un hablante |

En navegador, la transcripción del release es exacta en el clip de humo con RTFx 28,48 (4 hilos, aislado, SIMD, carga de 79,7 ms); con 1 hilo no aislado el throughput es de 10,93× / 19,74× / 21,17× para 5 / 10 / 20 s. El WER en navegador sobre S1-dev es 13,7180 % frente a 13,3820 % en Python (+0,34 pp [−0,13, +0,79], empate) con la regla de segmentación min-runs-3.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal, ya que el modelo está diseñado para CPU y navegador; el grafo INT8 ocupa 40.039.997 B y el paquete completo 49.204.097 B.
- GPU recomendadas: no se documentan; el diseño apunta a CPU de escritorio y ejecución en navegador. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no se han publicado requisitos ni cifras de VRAM.
- GPU de consumo: no disponible como requisito; el modelo cabe holgadamente en memoria de sistema de un equipo convencional.
- Despliegue: runtime ONNX (onnxruntime) con el paquete autocontenido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR CTC ONNX.
- Latencia y throughput: RTFx 28,48 en navegador (4 hilos, aislado, SIMD); 10,93× / 19,74× / 21,17× con 1 hilo no aislado para clips de 5 / 10 / 20 s; carga del modelo de 79,7 ms.
- Entrenamiento: M5 Pro de 16 GB (bf16, *activation checkpointing*, 40.000 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MOTH-50 0.9.8-e023-r1 | 39,26 M (acústico) | audio 16 kHz mono, VAD Silero | it, en (code-switching) | Apache-2.0 | ONNX INT8 | Paquete ≤ 50 MB, CPU y navegador |
| openai/whisper-base | 74 M (aprox., encoder-decoder) | audio 16 kHz, ventana de 30 s | multilingüe | MIT (según el modelo original) | safetensors, entre otros | Modelo base del que deriva MOTH-50; decoder completo |
| Whisper-small | no disponible en la información | audio 16 kHz, ventana de 30 s | multilingüe | MIT (según el modelo original) | safetensors, entre otros | Mayor tamaño; no comparable en huella de 50 MB |

La comparación cuantitativa con alternativas de la misma categoría (ASR bilingüe IT-EN en el borde) no está disponible en la información proporcionada; los únicos datos comparativos publicados son los internos del propio autor frente a su modelo base.

## Limitaciones y advertencias

- El modelo está validado únicamente sobre habla leída o dictada (*scripted, read speech*); no se ha validado en habla espontánea, solapamiento de hablantes, audio de reunión en campo lejano o ruidoso, acentos no italianos fuertes, voces infantiles ni dialectos no vistos.
- Las voces S1, S2 y S3 son las del programa de grabación; S3 nunca se entrenó, pero el modelo se seleccionó sobre conjuntos evaluados repetidamente, por lo que no constituye un *holdout* fresco.
- El número de T-600 es una lectura repetida declarada (el conjunto se leyó en E-004 y E-023), lo que puede inflar la estimación de rendimiento.
- CS-FLEURS-READ es CC-BY-NC y solo de test; su WER de 34,81 % con un único hablante indica un rendimiento notablemente peor en *code-switching* externo que en los conjuntos internos.
- El WER en inglés (28,1955 % en FLEURS-EN) es sustancialmente peor que en italiano (11,8304 % en FLEURS-IT), lo que limita su uso como sistema bilingüe equilibrado.
- No es un sistema de streaming: la latencia es de frase completa (*record-then-transcribe*).
- No debe usarse para decisiones críticas de seguridad, médicas, legales o financieras sin revisión humana; no es un sistema de identificación de hablante ni de emoción.
- Riesgo de alucinación y de errores de transcripción en dominios no vistos, derivado de la decodificación con LM n-gram y del sesgo hacia el vocabulario de entrenamiento.
- Sesgos conocidos: no se documentan análisis de sesgo por género, edad o acento en la información disponible.
- Licencia Apache-2.0 para repositorio, código y pesos, lo que permite uso comercial; las atribuciones del repositorio están en `NOTICE`, y el paquete de release lleva su propio `NOTICE` generado por `tools/release_notice.py`. El uso de datos CC-BY-NC (CS-FLEURS) es solo de evaluación.
- El NOTICE admite TTS permisivo como clase de datos, pero es una habilitación de política, no un componente de `0.9.8`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semantique-team/moth-50
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de *code-switching*: https://huggingface.co/datasets/semantique-team/moth-cs
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset MLS: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Runtime ONNX: https://onnxruntime.ai/
- Repositorio, paper, blog o demo adicionales: no disponible en la información proporcionada.
