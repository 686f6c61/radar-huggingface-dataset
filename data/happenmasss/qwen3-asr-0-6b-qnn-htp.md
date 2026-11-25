# Happenmasss/Qwen3-ASR-0.6B-QNN-HTP

## Resumen

Qwen3-ASR-0.6B-QNN-HTP es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba, empaquetado por el usuario Happenmasss para su ejecución en los aceleradores Hexagon (HTP) de los SoC Qualcomm Snapdragon mediante el SDK QNN (Qualcomm Neural Network). No se trata de un modelo nuevo, sino de una distribución de pesos y grafos precompilados orientados a inferencia en el dispositivo (on-device) en Android, sin depender de la nube.

El repositorio incluye varios bundles específicos por SoC (SM8750, SM8850, SM8950, SM8975 y SM8650), cada uno compilado con la versión correspondiente de QAIRT y verificado contra el hardware objetivo. La conversión emplea codificaciones de peso INT8 por canal con activaciones FP16, atención agrupada sin cabezas KV repetidas, buffers KV compartidos y grafos AR con historial de 512 y 1024 tokens, lo que reduce la huella en memoria frente a una conversión naive.

La relevancia de esta ficha radica en que demuestra un flujo práctico para llevar un modelo ASR de 0,6 mil millones de parámetros a telefonía de gama alta, con benchmarks reales de latencia en dispositivo (0,378 s para 2,79 s de audio y 2,036 s para 24 s de audio) y un tamaño de payload inferior a 1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (Qwen3-ASR), compilado a grafos QNN/HTP |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ASR-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el worker acepta hasta 24 s de audio por petición |
| Tipos de cuantizacion | Pesos INT8 por canal, activaciones FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles QNN/HTP precompilados (payload ~0,96-0,97 GB por SoC), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-ASR-0.6B, un sistema de reconocimiento automático del habla de tipo encoder-decoder con 0,6 mil millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card original del modelo base, que no se ha incluido en la búsqueda.

La aportación técnica de esta distribución es la cadena de conversión a QNN: el encoder de audio y el prefill AR64 se compilan con nivel de optimización O2, mientras que los dos grafos de decodificación AR1 usan O3. Se emplean codificaciones de peso INT8 por canal, activaciones FP16, atención agrupada sin cabezas KV repetidas, K del historial pretranspuesta, buffers KV compartidos y grafos AR con historial de 512 y 1024 tokens. El worker en C++ (derivado de acpm) soporta tanto las dimensiones del 0.6B como del 1.7B, y se compila con el NDK de Android para arm64.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio PCM WAV mono a 16 kHz y 16 bits.
- Transcripción de clips de hasta 24 segundos por petición en el worker incluido.
- Ejecución totalmente local en el DSP Hexagon del SoC, sin conexión a red.
- Perfil de rendimiento configurable por petición (`burst` solicita el perfil de alto rendimiento).
- Soporte de contexto de historial de 512 y 1024 tokens en los grafos autorregresivos.
- Integración con el runtime QNN de Qualcomm (libQnnHtp, libQnnSystem, stubs y skels HTP).
- No se documentan capacidades de traducción, diarización, timestamps por palabra ni tool calling.

## Casos de uso

- Transcripción de notas de voz en aplicaciones Android: el modelo procesa clips cortos (2-3 s) en menos de 0,4 s en caliente, lo que permite transcripción casi instantánea tras pulsar el botón de dictado.
- Subtitulado local de reuniones o clases: con clips de hasta 24 s y una latencia de ~2 s por clip, se puede segmentar el audio y transcribir por bloques sin enviar datos a la nube.
- Asistentes de voz offline: al ejecutarse en el DSP Hexagon, el reconocimiento puede activarse sin conexión y sin consumir la CPU principal, lo que reduce el impacto en batería y mejora la privacidad.
- Aplicaciones de accesibilidad: dictado por voz para personas con movilidad reducida en dispositivos Snapdragon de gama alta, con independencia de la conectividad.
- Procesamiento por lotes en el dispositivo: el worker admite un fichero de comandos con múltiples peticiones, útil para transcribir grabaciones almacenadas en el teléfono.
- Prototipado de pipelines ASR en Android: sirve como referencia para validar la conversión QNN de modelos ASR antes de integrarlos en una app de producción con gestión térmica por petición.
- Investigación en eficiencia energética: permite medir latencia y consumo de un ASR de 0,6B en distintos SoC Snapdragon con la misma configuración de compilación.

## Benchmarks y rendimiento

Los únicos datos publicados son los benchmarks en dispositivo del bundle `sm8850-magic-v6-verified`, con cuatro ejecuciones en caliente por clip y estado térmico de Android 0.

| Duracion del WAV | Transcripcion en caliente | Tokens de salida |
|---|---:|---:|
| 2,79 s | 0,378 s | 14 |
| 8,00 s | 0,716 s | 26 |
| 24,00 s | 2,036 s | 75 |

La carga del modelo en un proceso nuevo tuvo una mediana de 1,88 s. El traspaso a la app y el postprocesado quedan fuera de esta medición. No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- SoC Qualcomm Snapdragon con Hexagon HTP: SM8750 (Snapdragon 8 Elite), SM8850 (8 Elite Gen 5), SM8950 (8 Elite Gen 6), SM8975 (8 Elite Extreme Gen 6) y SM8650 (8 Gen 3).
- Payload por bundle: entre 0,96 y 0,97 GB, más las librerías del runtime QNN obtenidas por separado desde Qualcomm Software Center.
- QAIRT requerido: 2.52.0.261104 para SM8975/SM8950 y 2.50.0.260828 para SM8850/SM8750/SM8650.
- No está pensado para GPU de escritorio ni para ejecución en CPU; requiere el DSP Hexagon y los skels HTP correspondientes (por ejemplo, `libQnnHtpV81Stub.so` y `libQnnHtpV81Skel.so` para el bundle Magic V6).
- Despliegue: worker C++ incluido compilado con el NDK de Android (`aarch64-linux-android26-clang++`), con `LD_LIBRARY_PATH` y `ADSP_LIBRARY_PATH` apuntando al directorio `runtime`.
- Latencia medida en caliente: 0,378 s para 2,79 s de audio, 0,716 s para 8 s y 2,036 s para 24 s; carga en frío de ~1,88 s.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al estar compilado para el runtime QNN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-QNN-HTP | 0,6B | hasta 24 s por petición en el worker | QNN/HTP en Snapdragon | Apache-2.0 | Hugging Face (este repo) |
| Qwen3-ASR-0.6B (base) | 0,6B | no disponible | PyTorch/Transformers, GPU o CPU | Apache-2.0 | Hugging Face (Qwen/Qwen3-ASR-0.6B-hf) |
| Whisper small | ~0,24B | 30 s por ventana | PyTorch, whisper.cpp, ONNX | MIT | Hugging Face / OpenAI |
| Whisper medium | ~0,77B | 30 s por ventana | PyTorch, whisper.cpp, ONNX | MIT | Hugging Face / OpenAI |

La comparación con Whisper es orientativa por tamaño y tarea; no se dispone de datos de WER comparativos en la información proporcionada.

## Limitaciones y advertencias

- Solo admite audio PCM WAV mono a 16 kHz y 16 bits; no se documenta soporte de otros formatos o tasas de muestreo.
- Límite de 24 segundos de audio por petición en el worker incluido.
- Requiere hardware Qualcomm concreto y la versión exacta de QAIRT indicada por bundle; un bundle compilado para otro SoC o arquitectura Hexagon no funcionará.
- El runtime QNN no se distribuye con el modelo: debe obtenerse por separado desde Qualcomm Software Center, lo que añade fricción al despliegue.
- Los benchmarks publicados cubren únicamente tres clips y un dispositivo (Magic V6); no hay evaluación de precisión (WER) ni de robustez ante ruido, acentos o idiomas distintos.
- No se documentan sesgos, idiomas soportados ni comportamiento en dominios específicos; la model card original del modelo base no se ha incluido en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos de ASR: pueden producir transcripciones plausibles pero incorrectas en audio con ruido o solapamiento de hablantes.
- Aunque la licencia es Apache-2.0, el uso comercial requiere verificar las condiciones del runtime QNN de Qualcomm y de los skels HTP, que se rigen por sus propios términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Happenmasss/Qwen3-ASR-0.6B-QNN-HTP
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Repositorio del worker acpm: https://github.com/Happenmass/acpm
- Qualcomm Software Center (runtime QAIRT): https://softwarecenter.qualcomm.com/
