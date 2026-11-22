# solucionesft/parakeet-es

## Resumen

parakeet-es es una especialización en tiempo de decodificación del modelo NVIDIA Parakeet TDT 0.6B v3, un sistema de reconocimiento automático del habla (ASR) multilingüe de 600 millones de parámetros. Lo desarrolla el usuario solucionesft y no introduce pesos nuevos: es una capa fina sobre el motor onnx-asr que modifica el proceso de selección de tokens en la red conjunta TDT (Token-and-Duration Transducer) para forzar la salida en español. El problema que resuelve es concreto: Parakeet v3 detecta el idioma de forma automática y, en audio español corto o ambiguo, deriva ocasionalmente a ruso o inglés, produciendo transcripciones inservibles.

La solución combina tres mecanismos: un bloqueo de alfabeto que impide emitir 2.696 de los 8.193 fragmentos del vocabulario (letras cirílicas, griegas y latinas ajenas al español), un prior de lenguaje que penaliza con −4 logits los fragmentos que Parakeet nunca emite al transcribir español real, y un refuerzo de palabras personalizadas (hotwords) mediante un trie de prefijos a nivel de token. Adicionalmente incluye perfiles regionales experimentales es-MX y es-ES.

Es relevante porque demuestra que se puede eliminar la deriva de idioma en un ASR multilingüe sin reentrenar ni redistribuir pesos, con un coste de precisión nulo sobre español humano (diferencias ≤ 0,05 puntos) y una reducción de la deriva al 0 %. Se distribuye como código Apache-2.0 que reutiliza la exportación ONNX de istupakov y ejecuta en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) sobre base Parakeet; especialización en decodificación |
| Parámetros totales | 0,6 B (modelo base NVIDIA Parakeet TDT 0.6B v3) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (opción `quantization="int8"`) |
| Idiomas soportados | es (con perfiles experimentales es-MX y es-ES) |
| Licencia | Apache-2.0 (código y listas de palabras); pesos base CC-BY-4.0 |
| Formato de pesos | ONNX (exportación de istupakov/parakeet-tdt-0.6b-v3-onnx) |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA con 0,6 B de parámetros, entrenado para 25 idiomas europeos y sin entrada explícita de idioma. parakeet-es no reentrena ni ajusta pesos: opera sobre la exportación ONNX del modelo y altera únicamente la política de selección de tokens en la red conjunta. Concretamente, aplica un bloqueo de alfabeto sobre 2.696 de los 8.193 fragmentos del vocabulario, un prior de lenguaje que penaliza con −4 logits por defecto los fragmentos ajenos al español, y un refuerzo de hotwords con trie de prefijos a nivel de token (boost por defecto 5,0, lexicon_boost 3,0).

El conjunto de 2.336 fragmentos considerados "españoles" se midió sobre FLEURS es_419 test[150:900] y MLS Spanish test[150:1000], conjuntos que quedaron excluidos de la evaluación posterior para evitar fuga de datos. Los perfiles regionales es-MX y es-ES se implementan como listas de lugares, instituciones y vocabulario regional aplicadas como hotwords ligeras. No hay datos publicados sobre número de tokens de entrenamiento del modelo base ni sobre etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en español con salida bloqueada al alfabeto latino usado en español.
- Eliminación de la deriva de idioma: 0 % de salidas con letras no españolas en la evaluación del autor.
- Refuerzo de vocabulario propio mediante hotwords (nombres, marcas, jerga) con trie de prefijos a nivel de token.
- Perfiles regionales experimentales es-MX y es-ES para vocabulario local.
- Ejecución en CPU con cuantización int8.
- Ajuste de hiperparámetros de decodificación: `prior_penalty`, `hotword_boost`, `lexicon_boost`, `lock`.
- No soporta tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo thinking.

## Casos de uso

- Transcripción de audio español en producción: el bloqueo de alfabeto y el prior garantizan que la salida nunca contenga caracteres cirílicos o griegos, lo que evita fallos aguas abajo en pipelines que asumen texto latino.
- Subtitulado de vídeo con vocabulario de marca: los hotwords permiten reforzar nombres propios y marcas (por ejemplo, "Paimón", "OpenClaw") que de otro modo se transcriben mal; el autor reporta una mejora del 22 % al 44 % de acierto en esos nombres.
- Asistentes de voz para frases cortas: en audio de menos de un segundo el modelo base deriva a otros idiomas; parakeet-es mantiene la salida en español, lo que lo hace adecuado para comandos y wake words.
- Procesamiento por lotes en CPU: con int8 y onnx-asr, un clip de 12 s tarda unos 0,45 s en un Ryzen 7 5700X3D, lo que permite desplegar transcripción masiva sin GPU.
- Localización regional: los perfiles es-MX y es-ES, aunque experimentales, sirven para adaptar el vocabulario de lugares e instituciones en despliegues para México o España.
- Integración en aplicaciones de dictado: la API `parakeet_es.load("es", hotwords=[...])` permite inyectar el léxico del dominio del usuario sin reentrenar el modelo.

## Benchmarks y rendimiento

Datos publicados por el autor (WER en minúsculas y sin puntuación; deriva = % de salidas con letras no españolas):

| Configuración | FLEURS es_419 (150, humano) | MLS Spanish (150, humano) | Frases cortas WER (180) | Todas las frases WER (270) | Deriva |
|---|---|---|---|---|---|
| Parakeet v3 original | 3,24 % | 4,70 % | 24,44 % | 13,45 % | 0,37 % |
| parakeet-es `es` | 3,22 % | 4,67 % | 23,81 % | 13,55 % | 0 % |
| parakeet-es `es-MX` | 3,27 % | 4,65 % | 23,49 % | 13,35 % | 0 % |
| parakeet-es `es-ES` | 3,22 % | 4,70 % | 23,17 % | 12,96 % | 0 % |

El conjunto de frases son 30 frases (20 muy cortas como "Oye.", "Dale.", "¿Qué onda?") por 9 voces (Kokoro ×3, Piper es_MX ×2, Edge es-MX ×2, Edge es-ES ×2). Con hotwords `["Paimón", "OpenClaw"]` el acierto de esos nombres pasó del 22 % al 44 %. El autor señala que en español humano la precisión no cambia (diferencias ≤ 0,05 puntos) y que las palabras sueltas de menos de 0,8 s siguen siendo difíciles para todos los modelos probados, incluido Whisper small "es".

## Requisitos de hardware

- Inferencia en CPU viable: el autor reporta ~0,45 s para un clip de 12 s con int8 en un Ryzen 7 5700X3D.
- VRAM estimada: no disponible; el despliegue documentado es en CPU con ONNX Runtime.
- GPU recomendadas: no disponible en la información proporcionada; el modelo base admite ejecución en GPU, pero el autor no publica requisitos.
- Cabe en GPU de consumo: no disponible como dato explícito; el modelo es de 0,6 B y la vía documentada es CPU.
- Opciones de despliegue: onnx-asr (motor principal), con exportación ONNX del modelo base.
- Latencia y throughput: 0,45 s por clip de 12 s en CPU (int8) según el autor; sin datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER español | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-es | 0,6 B | no disponible | FLEURS 3,22 %, MLS 4,67 % | Apache-2.0 (código); pesos CC-BY-4.0 | Hugging Face, ONNX |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6 B | no disponible | FLEURS 3,24 %, MLS 4,70 % | CC-BY-4.0 | Hugging Face |
| Whisper small "es" | no disponible | no disponible | no disponible (el autor indica que rinde igual en palabras sueltas < 0,8 s) | MIT (Whisper) | Hugging Face |

## Limitaciones y advertencias

- Es una especialización en decodificación, no un fine-tune real; el autor reconoce que un ajuste verdadero (NeMo sobre Common Voice es, CIEMPIESS para es-MX) requiere GPU NVIDIA y sería el siguiente paso natural.
- Las palabras en inglés dentro de habla española se penalizan (no se bloquean); hay que añadirlas como hotwords si se necesitan.
- Los perfiles es-MX y es-ES son experimentales y no mejoraron claramente la precisión regional en el conjunto sintético: las palabras es-MX pasaron del 84,6 % al 82,1 % (diferencia de 3 palabras).
- Las palabras sueltas de menos de 0,8 s siguen siendo difíciles para todos los modelos evaluados.
- Riesgo de alucinación y sesgos: no documentados por el autor en la información disponible.
- La licencia del código es Apache-2.0, pero los pesos base son CC-BY-4.0; el repo no redistribuye los pesos, por lo que el uso comercial debe atenerse a la licencia del modelo base.
- El repositorio no tiene descargas ni validación externa (0 descargas, 1 like en el momento de la consulta); conviene tratar los resultados como no replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/solucionesft/parakeet-es
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX del base: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Motor onnx-asr: https://github.com/istupakov/onnx-asr
- Dataset FLEURS (CC-BY-4.0): no disponible en la información proporcionada
- Dataset Multilingual LibriSpeech (CC-BY-4.0): no disponible en la información proporcionada
