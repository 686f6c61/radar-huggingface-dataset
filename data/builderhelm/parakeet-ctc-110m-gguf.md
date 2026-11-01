# BuilderHelm/Parakeet-CTC-110M-GGUF

## Resumen

Parakeet-CTC-110M-GGUF es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt_ctc-110m, desarrollado originalmente por NVIDIA en colaboración con Suno.ai. La conversión, publicada por el usuario BuilderHelm, conserva únicamente la ruta CTC del modelo híbrido original: mantiene el encoder FastConformer preentrenado y la cabeza CTC, y elimina la red de predicción TDT y la red conjunta. El resultado es un artefacto de 158,6 MB (aproximadamente 151,3 MiB) en un único fichero GGUF cuantizado a Q8_0, pensado para ejecución local mediante parakeet.cpp.

El modelo resuelve dos problemas concretos: transcripción de voz en inglés con decodificación greedy CTC y verificación de vocabulario a nivel de frame, es decir, comprobar si una palabra o frase concreta aparece en el audio. Esta segunda capacidad es la que aprovecha ZenVoice para su función "Listen again for names", que valida posibles correcciones del diccionario contra la grabación original después de que un modelo Parakeet principal haya transcrito el audio.

Su relevancia actual reside en la combinación de tamaño reducido (110M parámetros), licencia permisiva CC-BY-4.0 y soporte de aceleración Metal en Apple Silicon, lo que lo hace adecuado para transcripción y keyword spotting en dispositivo sin depender de servicios en la nube. El contexto no es aplicable en el sentido de los modelos de lenguaje: se trata de un modelo de audio que procesa PCM mono a 16 kHz y emite transcripciones o log-probabilidades por frame con un stride de 80 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + cabeza CTC; el modelo base es híbrido CTC/TDT y esta conversión conserva solo la ruta CTC |
| Parametros totales | 109.326.305 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada PCM mono a 16 kHz, salida con stride de 80 ms) |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (un único fichero de 158.614.144 bytes) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un sistema ASR híbrido con un encoder FastConformer compartido y dos cabezas de decodificación: CTC y TDT (Token-and-Duration Transducer). Esta conversión elimina la red de predicción y la red conjunta del TDT, conservando el encoder FastConformer con los pesos lineales soportados cuantizados a Q8_0 y la cabeza CTC, que proyecta sobre un vocabulario de 1.024 piezas más el token blank. El preprocesado y el tokenizador SentencePiece se almacenan en la configuración y se ejecutan dentro de parakeet.cpp. La entrada es audio PCM mono a 16 kHz y la salida es una transcripción CTC o log-probabilidades a nivel de frame con stride de 80 ms.

La conversión no añade entrenamiento alguno: hereda los datos del modelo original de NVIDIA. Según los metadatos públicos del modelo base, las fuentes de entrenamiento incluyen LibriSpeech, Fisher, Common Voice, National Speech Corpus Part 1, VCTK, VoxPopuli, Europarl y Multilingual LibriSpeech, además de un subconjunto privado no especificado. El autor de la conversión señala una discrepancia en los metadatos de NVIDIA, que nombran Common Voice 8.0 en los metadatos pero 7.0 en la prosa, sin resolverla. No se documentan fases de RLHF ni DPO, algo esperable en un modelo ASR de esta familia.

## Capacidades

- Transcripción de voz en inglés mediante decodificación greedy CTC.
- Verificación de palabras y frases: puntuaciones CTC a nivel de frame para vocabulario personalizado o lógica de alineación.
- Keyword spotting sobre audio, útil para detectar términos concretos en una grabación.
- Salida de log-probabilidades por frame con stride de 80 ms, lo que permite construir lógica de puntuación propia.
- Ejecución en dispositivo con parakeet.cpp v0.5.0 y aceleración Metal en Apple Silicon.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente acústico.
- No dispone de capacidades de visión, audio generativo ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción local en aplicaciones de escritorio: integrado mediante parakeet.cpp, permite transcribir audio en inglés sin conexión ni envío de datos a la nube, con un fichero de solo 159 MB que se distribuye junto a la aplicación.
- Verificación de nombres propios tras una transcripción principal: el modelo comprueba candidatos del diccionario del usuario contra el audio original para decidir si una corrección es válida, tal como hace ZenVoice en su función "Listen again for names".
- Keyword spotting en grabaciones largas: las puntuaciones CTC por frame permiten localizar términos anotados en el audio sin transcribir todo el contenido, útil en monitorización de llamadas o cumplimiento normativo.
- Alineación forzada de transcripciones existentes: la salida a nivel de frame con stride de 80 ms sirve para sincronizar texto con audio en herramientas de subtitulado.
- Asistentes de voz en dispositivo para Apple Silicon: con Metal y un consumo de memoria reducido, encaja en aplicaciones de notas de voz o dictado en Mac.
- Preprocesado en pipelines de ASR en dos etapas: un modelo mayor genera la transcripción y este modelo actúa como verificador barato de términos críticos, reduciendo falsos positivos del diccionario.
- Prototipado e investigación en ASR: su tamaño y licencia permisiva facilitan experimentos reproducibles de decodificación CTC y evaluación de WER en hardware de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, obtenidos en un Apple M5 con 24 GB de memoria usando parakeet.cpp v0.5.0 con Metal, decodificación greedy CTC y sin boosting de vocabulario, sobre el subconjunto contextual de Earnings22 (772 clips, 11.579,52 segundos de audio):

| Metrica | Resultado |
|---|---:|
| WER de corpus (normalización inglesa de Whisper) | 17,53 % |
| RTFx | 185,2× tiempo real |
| Recall de términos anotados en la transcripción CTC | 34,41 % (447/1.299) |
| Tiempo mediano por clip nominal de 15 s | 76,7 ms |
| Percentil 95 de tiempo por clip | 116,7 ms |

Evaluación separada del verificador de diccionario de ZenVoice sobre 464 clips sintéticos:

| Pipeline | Nombres correctos | Adiciones erróneas al diccionario |
|---|---:|---:|
| Parakeet Ultra + reparación de texto existente | 180/240 | 0 |
| Mismo pipeline + este verificador Q8_0 | 193/240 | 0 |

En esa evaluación se ejecutaron 48 comprobaciones, con una mediana de 12,3 ms y un p95 de 14,7 ms por comprobación, y una sobrecarga media de 1,4 ms sobre todos los clips. El autor advierte que estos resultados son específicos de ese subconjunto, decodificador, normalización y dispositivo, y que no constituyen una comparación controlada con los resultados Core ML de FluidInference.

## Requisitos de hardware

- Disco: aproximadamente 159 MB para el fichero GGUF; la memoria en tiempo de ejecución es adicional.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño del artefacto (158,6 MB) es previsible que quede muy por debajo de 1 GB, aunque el autor no publica una cifra concreta.
- GPU recomendadas: no se documentan GPU discretas; la referencia publicada es un Apple M5 con 24 GB de memoria usando Metal.
- Cabe en GPU de consumo: sí, por tamaño, aunque no hay mediciones publicadas en tarjetas NVIDIA o AMD.
- Opciones de despliegue: parakeet.cpp v0.5.0 (requisito explícito del autor, con soporte Metal). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato CTC específico.
- Latencia y throughput: RTFx de 185,2× en el hardware de referencia, con mediana de 76,7 ms por clip de 15 s y p95 de 116,7 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet-CTC-110M-GGUF | 109,3 M | no aplica (audio) | en | CC-BY-4.0 | GGUF Q8_0 |
| nvidia/parakeet-tdt_ctc-110m | no disponible | no aplica (audio) | en | no disponible en la información | safetensors (modelo base) |
| Alternativas de ASR ligeras (p. ej. Whisper small) | no disponible | no aplica (audio) | multilingüe | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparativos controlados frente a otros modelos ASR. El propio autor indica que sus cifras no constituyen una comparación controlada con los resultados Core ML de FluidInference.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que descarta su uso en entornos multilingües.
- WER elevado en dominios difíciles: el 17,53 % en Earnings22 refleja un rendimiento limitado en audio con jerga financiera, acentos y ruido; no es adecuado como transcriptor principal en esos escenarios sin un modelo mayor.
- Recall bajo de términos anotados: solo el 34,41 % de los términos anotados aparecen de forma exacta en la transcripción CTC, por lo que el keyword spotting directo sobre el texto es poco fiable.
- Dependencia de una versión concreta: requiere una build de parakeet.cpp compatible con v0.5.0 y su formato CTC GGUF; otras versiones pueden no cargar el fichero.
- Evaluación no verificada: el resultado del model-index figura con `verified: false` y procede de un benchmark del propio autor.
- Evaluación sintética: la mejora del verificador de diccionario se midió sobre clips sintéticos usados también para desarrollar las reglas, no sobre evidencia de micrófono en condiciones reales.
- Riesgo de alucinación: como todo modelo CTC, puede emitir texto plausible en segmentos con silencio o ruido; la decodificación greedy sin boosting agrava este riesgo en vocabulario específico.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar adecuadamente al autor y al modelo base de NVIDIA.
- Sesgos: no se documentan análisis de sesgo demográfico o acústico en la información disponible.
- Sin soporte de contexto conversacional ni instrucciones: no puede usarse como asistente ni para tareas de razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-GGUF
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Repositorio parakeet.cpp (v0.5.0): https://github.com/mudler/parakeet.cpp/tree/v0.5.0
- Benchmark reproducible: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-GGUF/blob/b3db7c2b2150bd97ebec2874f85577957ae55a5d/BENCHMARK.md
- Notas de evaluación de ZenVoice: https://github.com/imYashChaudhary973/ZenVoice/blob/1c259b82803457463b02187e33d185bfe45f32a0/docs/decisions/0019-listen-again-for-names.md
- Dataset de evaluación Earnings22: https://huggingface.co/datasets/argmaxinc/contextual-earnings22
