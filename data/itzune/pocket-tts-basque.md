# itzune/pocket-tts-basque

## Resumen

Pocket TTS Basque es un modelo de sintesis de voz (text-to-speech) especifico para euskera, publicado por el desarrollador itzune, que ejecuta inferencia en tiempo real sobre la CPU de un portatil. Se basa en Pocket TTS de Kyutai y emplea una columna vertebral (backbone) de 6 capas con aproximadamente 109,5 millones de parametros totales (438 MB en fp32 incluyendo el codec Mimi). Es un modelo destilado del profesor de 24 capas `itzune/pocket-tts-basque-24l`, a su vez ajustado sobre el corpus BSSD.

El modelo resuelve un problema concreto: la practicamente inexistente oferta de TTS neuronal de calidad para euskera que pueda correr en hardware sin GPU. Ademas de sintetizar texto, clona voces a partir de un clip de referencia de 5-10 segundos y se distribuye con cinco voces vascas listas para usar (Maider, Antton, Nahia, Ane y Aitor).

Su relevancia actual esta en la combinacion de tres factores: licencia CC-BY-4.0 (permite uso comercial con atribucion), sintesis en streaming con latencia baja y una robustez medida superior a la de su propio profesor en las pruebas del autor (menor tasa de fallos y menor WER), a costa de una naturalidad ligeramente inferior. El repositorio ocupa 0,5 GB y no requiere GPU para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai): backbone transformer de 6 capas con flow head y codec Mimi; destilado de un profesor de 24 capas |
| Parametros totales | 109.502.146 (aprox. 109,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; sintesis por fragmentos con streaming) |
| Tipos de cuantizacion | fp32 e int8 (flag `--quantize` en el CLI) |
| Idiomas soportados | euskera (eu) unicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (pesos del modelo y estados de voz), configuracion en YAML; libreria `pocket-tts` |

Otros datos: frecuencia de muestreo de salida de 24 kHz, tokenizador SentencePiece de 4000 tokens compartido con el profesor, tamano del repositorio 0,5 GB (438 MB de pesos fp32 con el codec Mimi incluido), pipeline `text-to-speech`.

## Arquitectura y entrenamiento

La arquitectura sigue el diseno Pocket TTS de Kyutai: un backbone transformer de 6 capas que predice las representaciones latentes del codec neuronal Mimi, mas una flow head para la generacion. El modelo se obtuvo mediante la receta `depth_distill` de Kyutai: el estudiante de 6 capas aprende las activaciones del profesor de 24 capas con el classifier-free guidance ya incorporado en la destilacion (`distill_cfg_coef 2.0`). La flow head y todos los pesos fuera del backbone se copian directamente del profesor. El entrenamiento fue de 150.000 pasos, batch de 64, learning rate 4e-4 con decaimiento coseno, publicandose los pesos EMA.

Los datos de entrenamiento proceden del split de entrenamiento del corpus BSSD: aproximadamente 350.000 enunciados, 450 horas de habla sintetica en euskera y mas de 2.400 voces. El profesor se habia ajustado previamente desde el modelo ingles de 24 capas de Kyutai. El tokenizador es SentencePiece con vocabulario de 4.000 tokens, entrenado sobre las transcripciones de BSSD. No se documenta en la informacion disponible el uso de RLHF o DPO; el pipeline es destilacion supervisada sobre las activaciones del profesor.

## Capacidades

- Sintesis de voz en euskera a partir de texto, con salida a 24 kHz y sintesis en streaming (el primer audio esta disponible antes de terminar la frase).
- Clonacion de voz zero-shot a partir de un clip de referencia de 5-10 segundos de habla limpia en euskera.
- Cinco voces preincluidas: Maider y Antton (locutores profesionales del corpus de estudio HiTZ-Aholab) y tres voces sinteticas (Nahia, Ane y Aitor).
- Ejecucion en tiempo real sobre CPU, sin GPU, con cuantizacion int8 opcional.
- Normalizacion de texto integrada en el ecosistema del dataset (numeros, fechas, abreviaturas y simbolos deletreados en palabras mediante `bssd.text_norm`).
- No soporta tool calling, function calling, razonamiento multi-paso ni otras capacidades de agente: es exclusivamente un modelo de sintesis de voz.
- No dispone de vision ni audio de entrada mas alla del clip de referencia para clonacion.

## Casos de uso

- Accesibilidad y lectores de pantalla en euskera: el modelo puede leer texto de forma continua en un portatil o dispositivo de bajas prestaciones sin GPU, con una latencia apta para lectura en streaming.
- Locucion automatizada de boletines y noticias en euskera: la ventana de sintesis por frases y el modo streaming permiten generar audio por articulo y publicarlo sin intervencion manual.
- Audiolibros y contenido largo: al ser un modelo de 109,5 M de parametros y 438 MB en fp32, se puede procesar horas de texto en CPU con un coste de infraestructura minimo.
- Interfaces de voz para administracion y servicios publicos vascos: al estar bajo CC-BY-4.0 y ejecutarse on-device, permite integrar respuestas habladas en aplicaciones moviles o quioscos sin enviar texto a la nube.
- Prototipado de asistentes conversacionales en euskera: la clonacion de voz con 5-10 segundos de referencia permite crear una voz de marca propia y probar variantes rapidamente.
- Doblaje y preproduccion audiovisual: generar borradores de locucion para maquetas o animaticas antes de contratar la locucion final, con dos voces profesionales ya incluidas.
- Investigacion en TTS de bajos recursos: el par profesor/alumno y los scripts de evaluacion publicados sirven como referencia reproducible para tecnicas de destilacion en lenguas minoritarias.

## Benchmarks y rendimiento

Evaluacion sobre frases de test reservadas de BSSD, 40 por voz, con dos sistemas ASR independientes de euskera (`xezpeleta/whisper-large-v3-eu` y `HiTZ/stt_eu_conformer_transducer_large_v2`), naturalidad UTMOS y similitud de hablante WavLM respecto al clip de referencia. Los "fallos" son frases con WER > 0,5 (el modelo continua el clip de referencia en lugar de leer el texto).

| Modelo | Voces | WER (Whisper) | WER (Conformer) | Tasa de fallos | WER sin fallos | UTMOS | Similitud de hablante |
|---|---|---|---|---|---|---|---|
| Este modelo (6 capas, 150 k pasos) | 8 prompts con nombre | 0,049 | 0,040 | 1,3 % | 0,040 | 3,48 | 0,960 |
| Este modelo (6 capas, 150 k pasos) | 5 voces no vistas | 0,029 | 0,029 | 0,5 % | 0,026 | 3,50 | 0,957 |
| Profesor (24 capas) | 8 prompts con nombre | 0,095 | 0,091 | 5,3 % | 0,042 | 3,59 | 0,958 |
| Profesor (24 capas) | 5 voces no vistas | 0,073 | 0,069 | 3,5 % | 0,033 | 3,61 | 0,961 |

Velocidad medida con el benchmark incluido (`scripts/bench_cpu.py`: tres frases de 2-8 s, voz Maider) sobre CPU x86 de servidor con 4 hilos disponibles, solo generacion (sin carga de modelo), expresada como multiplo del tiempo real (mayor es mas rapido):

| Hilos | fp32 | int8 (`--quantize`) |
|---|---|---|
| 2 | 3,5x | 6,9x |
| 4 | 3,4x | 6,7x |

Segun el autor, el modelo destilado es aproximadamente 2x mas rapido en GPU y bastante mas rapido en CPU que el profesor de 24 capas.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; en fp32 los pesos ocupan 438 MB (codec Mimi incluido). En int8 el consumo de memoria se reduce aproximadamente a la mitad, aunque no se publica la cifra exacta.
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor solo indica que el modelo es aproximadamente 2x mas rapido que el profesor en GPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 4090 o inferiores) e incluso en iGPU, dado el tamano de 109,5 M de parametros.
- CPU: funciona en tiempo real en CPU de portatil; con 2 hilos alcanza 3,5x en fp32 y 6,9x en int8 sobre el servidor de referencia.
- Opciones de despliegue: libreria `pocket-tts` (API Python `TTSModel.load_model` / `generate_audio`), CLI via `uvx pocket-tts generate`, configuracion remota mediante `hf://itzune/pocket-tts-basque/basque.yaml`, sintesis en streaming. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos de texto y el modelo usa la libreria propia de Kyutai).
- Latencia y throughput: 3,4x-3,5x tiempo real en fp32 y 6,7x-6,9x en int8 con 2-4 hilos; el streaming permite emitir audio antes de completar la frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / alcance | Calidad (WER Whisper / UTMOS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Pocket TTS Basque, 6 capas) | 109,5 M | euskera, streaming, on-device | 0,049 / 3,48 (8 voces); 0,029 / 3,50 (no vistas) | CC-BY-4.0 | HuggingFace + GitHub |
| Profesor `itzune/pocket-tts-basque-24l` | no disponible (24 capas) | euskera, streaming | 0,095 / 3,59 (8 voces); 0,073 / 3,61 (no vistas) | no disponible en la informacion | HuggingFace |
| Piper | no disponible | TTS multilingue orientado a dispositivos | no disponible | no disponible | No comparado con numeros; el autor lo incluye en la demo |
| OmniVoice | no disponible | TTS | no disponible | no disponible | No comparado con numeros; el autor lo incluye en la demo |

Los unicos datos cuantitativos de comparacion publicados corresponden al par alumno/profesor. Para Piper y OmniVoice el autor remite a la pagina de demo con muestras de audio, pero no se proporcionan metricas en la informacion disponible.

## Limitaciones y advertencias

- Solo euskera: las palabras en espanol, frances o ingles insertadas en el texto se pronuncian con fonetica vasca.
- Entre un 1 % y un 2 % de las frases (mas con algunos clips de referencia) se genera como continuacion del clip de referencia en lugar de leer el texto de entrada; es obligatorio revisar el audio generado antes de publicarlo.
- Entrenado sobre habla sintetica (BSSD), por lo que puede heredar artefactos del sistema profesor del dataset.
- La naturalidad (UTMOS 3,48-3,50) es ligeramente inferior a la del profesor de 24 capas (3,59-3,61), aunque la inteligibilidad y la robustez son mejores.
- Los ficheros de estado de voz son especificos de este modelo y no son intercambiables con otros.
- El texto debe escribirse tal y como debe leerse: numeros, fechas, abreviaturas y simbolos han de estar deletreados en palabras; se recomienda usar el normalizador `bssd.text_norm`.
- La clonacion de voz exige tener derechos sobre la voz de referencia; el autor lo advierte explicitamente.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial con atribucion. Requiere citar Pocket TTS de Kyutai, el corpus de estudio HiTZ-Aholab (voces Maider y Antton) y el dataset BSSD (CC-BY-SA-4.0).
- Riesgo de alucinacion en el sentido de contenido no solicitado (continuacion del prompt de voz) y de sesgos inheridos de las voces y textos de BSSD, cuya procedencia se detalla en la ficha del dataset.
- No se han publicado datos de latencia en GPU ni de rendimiento con otras cuantizaciones distintas de fp32 e int8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzune/pocket-tts-basque
- Modelo profesor (24 capas): https://huggingface.co/itzune/pocket-tts-basque-24l
- Dataset BSSD: https://huggingface.co/datasets/itzune/bssd
- Repositorio del autor (codigo de entrenamiento, configs, evaluacion): https://github.com/itzune/pocket-tts-basque
- Demo con muestras de audio y comparacion con Piper y OmniVoice: https://itzune.eus/pocket-tts-basque/
- Pocket TTS de Kyutai (modelo base): https://github.com/kyutai-labs/pocket-tts
- Corpus de estudio HiTZ-Aholab (voces Maider y Antton): https://zenodo.org/records/17952596
- ASR de evaluacion (Whisper large v3 eu): https://huggingface.co/xezpeleta/whisper-large-v3-eu
- ASR de evaluacion (Conformer transducer large v2): https://huggingface.co/HiTZ/stt_eu_conformer_transducer_large_v2
