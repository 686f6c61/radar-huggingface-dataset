# mira-thing/mira-voice

## Resumen

mira-thing/mira-voice no es un modelo entrenado por su autor, sino un bundle precompilado de modelo y runtime de voz 100 % on-device para el descatalogado Spotify Car Thing. Reúne los artefactos pesados y de terceros que necesita el stack Mira: un modelo de reconocimiento automático de voz (ASR) Zipformer int8 de k2-fsa en formato ONNX, los modelos base de openWakeWord en TFLite para la detección de palabra de activación, datos de grafema a fonema de espeak-ng recortados a en-us y las bibliotecas nativas compiladas para aarch64 (ONNX Runtime, TFLite, sherpa-onnx y dependencias de audio).

El objetivo del repositorio es servir de fuente de artefactos para el código y los scripts de compilación alojados en GitHub. La única pieza propia del proyecto, el modelo de wake word "hey mira" (`hey_mira.tflite`), no vive aquí, sino en el repositorio de GitHub. Por tanto, no es un modelo cargable con `transformers` ni un modelo de lenguaje: es un paquete de despliegue orientado a un dispositivo embebido concreto.

Su relevancia es de nicho pero clara: permite rehabilitar hardware descatalogado (Spotify Car Thing) como asistente de voz totalmente local, sin enviar audio a la nube, combinando ASR en streaming, detección de wake word y síntesis de voz en un único conjunto de artefactos para aarch64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de despliegue: ASR Zipformer (k2-fsa, ONNX) + openWakeWord (TFLite) + espeak-ng (g2p/sintesis); no es un transformer unico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un MoE) |
| Longitud de contexto | no aplica (modelo de ASR por streaming/fragmentos, no un LLM) |
| Tipos de cuantizacion | int8 en el Zipformer ASR; modelos TFLite (melspectrogram, embedding) en la precision de upstream |
| Idiomas soportados | no declarado; el bundle recorta espeak-ng a en-us, lo que apunta a ingles (en-US) |
| Licencia | mixed-third-party (Apache-2.0, GPL-3.0 y otras; detalle en THIRD_PARTY_LICENSES) |
| Formato de pesos | ONNX (Zipformer int8), TFLite (modelos base de openWakeWord); el repo tambien incluye binarios `.so` para aarch64 |
| Tamano del repositorio | 0,1 GB |
| Libreria / runtime | sherpa-onnx |
| Plataforma objetivo | aarch64 (Spotify Car Thing) |
| Descargas / likes | 56 / 0 |

## Arquitectura y entrenamiento

El bundle no define una arquitectura propia, sino que empaqueta varias piezas. El componente de reconocimiento de voz es la release GigaSpeech de k2-fsa, sin modificaciones: un Zipformer en int8 exportado a ONNX con los tres subgrafos habituales (encoder, decoder y joiner) más los ficheros de tokens y BPE. Zipformer es una arquitectura de ASR en streaming basada en transformer desarrollada por el ecosistema k2-fsa/icefall y ejecutada aquí mediante ONNX Runtime. Se trata de la release de un tercero, no de un modelo entrenado por mira-thing, y el propio autor indica que no se ha modificado.

La detección de palabra de activación se apoya en los modelos base de openWakeWord: `melspectrogram.tflite` y `embedding_model.tflite`, que son los componentes compartidos de dicha libreria. La palabra clave concreta ("hey mira") es un modelo TFLite propio del proyecto, pero no se incluye en este repositorio. El apartado de síntesis y fonemización usa datos de grafema a fonema de espeak-ng recortados a en-us, junto con el binario `espeak-ng`. El resto del bundle son bibliotecas nativas upstream (ONNX Runtime, TFLite, sherpa-onnx, familia glibc y librerías de audio) recompiladas para aarch64. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset más allá de la referencia a GigaSpeech, ni sobre fases de RLHF/DPO, dado que el autor no entrena estos componentes.

## Capacidades

- Reconocimiento automático de voz (ASR) en streaming y offline con el Zipformer int8 de k2-fsa.
- Detección de palabra de activación (wake word) mediante los modelos base de openWakeWord; la palabra "hey mira" se distribuye aparte, en GitHub.
- Fonemización y datos de grafema a fonema con espeak-ng, recortados a en-us.
- Síntesis de voz mediante el binario `espeak-ng` incluido en `bin/`.
- Ejecución 100 % on-device, sin dependencia de servicios en la nube.
- Servidor ASR local mediante el binario `sherpa_asr_server` y el helper `oww_wake`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles; los datos incluidos apuntan a en-us.
- Modo thinking, visión o audio generativo: no aplica.

## Casos de uso

- Asistente de voz manos libres en el automóvil: el Zipformer reconoce comandos en streaming y el módulo de wake word activa la escucha, todo local, apto para un dispositivo montado en el salpicadero sin conexión permanente.
- Rehabilitación del Spotify Car Thing como dispositivo de voz: al ser un bundle para aarch64, permite revivir hardware descatalogado ejecutando ASR, wake word y TTS sobre el mismo equipo.
- Detección de palabra clave personalizada: integrando los modelos base de openWakeWord con el modelo `hey_mira.tflite` del repositorio de GitHub, se puede construir un activador propio sin enviar audio fuera del dispositivo.
- Dictado y transcripción local: el componente ASR puede usarse como servicio (`sherpa_asr_server`) para transcribir notas de voz o entradas de audio en un dispositivo embebido.
- Interfaz de voz con retroalimentación hablada: combinando ASR con la síntesis de espeak-ng se puede construir un bucle conversacional básico de entrada y salida de voz offline.
- Sistemas con requisitos de privacidad: al no requerir la nube, es adecuado para entornos donde el audio no puede salir del dispositivo (por ejemplo, cabinas, vehículos o equipos aislados).
- Prototipado de pipelines de voz embebidos: sirve como base reproducible para experimentar con sherpa-onnx, ONNX Runtime y TFLite sobre aarch64.
- Integración en firmware o imágenes de sistema: los binarios y modelos pueden empaquetarse vía `fetch-artifacts.sh` dentro de una imagen de dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, latencia, throughput ni comparativas numéricas para el Zipformer GigaSpeech incluido ni para los modelos de openWakeWord.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el sentido habitual; el destino es CPU aarch64, no GPU.
- GPU recomendadas: no disponibles; el bundle está pensado para hardware embebido aarch64, no para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no aplica; los artefactos están compilados para aarch64 (Spotify Car Thing y dispositivos similares).
- Plataforma objetivo: dispositivos aarch64; las bibliotecas `.so` están recompiladas para esa arquitectura, por lo que no se ejecutarán directamente en x86-64 sin sustituirlas.
- Tamano del repositorio: 0,1 GB, coherente con un conjunto de modelos int8 y binarios ligeros.
- Opciones de despliegue: el repositorio está diseñado para servirse mediante `fetch-artifacts.sh`; el comportamiento por defecto de sherpa-onnx (incluido su servidor ASR), junto con los binarios `oww_wake` y `espeak-ng`.
- vLLM, llama.cpp, Ollama o TGI: no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa rigurosa. A continuación se ofrece una comparación cualitativa con alternativas de la misma categoría (ASR y activación por voz on-device), marcando como "no disponible" aquello que no consta en la información proporcionada.

| Alternativa | Tipo | Formato | Licencia | Orientación |
|---|---|---|---|---|
| mira-thing/mira-voice | Bundle ASR + wake word + TTS | ONNX / TFLite + `.so` aarch64 | mixed-third-party | Dispositivo embebido aarch64 (Car Thing) |
| Zipformer GigaSpeech de k2-fsa (modelo contenido) | ASR en streaming | ONNX | Apache-2.0 | ASR on-device / servidor ligero |
| openWakeWord (modelos base incluidos) | Detección de wake word | TFLite | Apache-2.0 | Activación por voz on-device |
| whisper.cpp (Whisper) | ASR | GGUF/quantizado | MIT | ASR on-device multiplataforma; datos concretos de rendimiento no disponibles en esta busqueda |
| Vosk | ASR | modelos propios | Apache-2.0 | ASR on-device; datos concretos no disponibles en esta busqueda |
| Picovoice Porcupine | Wake word | modelos propios | Propietaria | Activación por voz on-device; datos concretos no disponibles en esta busqueda |

Las cifras de parametros, contexto y rendimiento del resto de alternativas no se han verificado en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo cargable con `transformers`: es un bundle de despliegue; debe obtenerse con `fetch-artifacts.sh` o `huggingface-cli download`.
- Licencia mixta: conviven componentes Apache-2.0 (Zipformer, openWakeWord) y GPL-3.0 (datos de espeak-ng), entre otros; es imprescindible revisar `THIRD_PARTY_LICENSES` antes de redistribuir o usar comercialmente.
- La GPL-3.0 de los datos de espeak-ng puede imponer obligaciones relevantes en caso de redistribución del bundle.
- Plataforma restringida a aarch64; no se ejecuta directamente en x86-64 sin recompilar las bibliotecas.
- Atado a un dispositivo descatalogado (Spotify Car Thing), lo que limita su aplicabilidad general.
- Idiomas: el recorte de espeak-ng a en-us apunta a un soporte efectivamente limitado al inglés (en-US).
- El modelo de wake word propio (`hey_mira.tflite`) no está en este repositorio; hay que obtenerlo desde GitHub.
- No se han publicado benchmarks de WER, latencia ni throughput en la información disponible, por lo que el rendimiento real no puede evaluarse con datos.
- Riesgo de sesgos y de alucinación: aunque el bundle no es un LLM, los errores de reconocimiento y las transcripciones incorrectas son propios de cualquier sistema ASR; no hay datos de evaluación publicados.
- Uso en producción: al tratarse de un conjunto de artefactos de terceros sin modificar y sin métricas publicadas, conviene validar en el hardware objetivo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mira-thing/mira-voice
- Repositorio de código y scripts (GitHub): https://github.com/mira-thing/mira-voice
- Fichero de licencias de terceros: https://huggingface.co/mira-thing/mira-voice/blob/main/THIRD_PARTY_LICENSES
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- openWakeWord: https://github.com/dscripka/openWakeWord
- espeak-ng: https://github.com/espeak-ng/espeak-ng
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entidades no relacionadas (marcas de cosmética, la plataforma Miro y un restaurante).
