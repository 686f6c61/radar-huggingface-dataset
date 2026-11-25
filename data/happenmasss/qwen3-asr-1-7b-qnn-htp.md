# Happenmasss/Qwen3-ASR-1.7B-QNN-HTP

## Resumen

Qwen3-ASR-1.7B-QNN-HTP es una compilación del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B de Alibaba Qwen, adaptada por el usuario Happenmasss para ejecutarse en la unidad de procesamiento neuronal Hexagon (HTP) de los SoC Qualcomm Snapdragon mediante el SDK QNN (Qualcomm Neural Network). El repositorio no contiene pesos en formato convencional, sino grafos compilados por SoC concreto, pensados para inferencia totalmente local en dispositivos Android sin conexión a red.

El modelo base resuelve la transcripción de audio a texto; esta variante traslada esa capacidad al acelerador DSP del teléfono, con cuantización INT8 por canal en los pesos y activaciones FP16. El paquete pesa aproximadamente 2,40 GB por bundle y admite hasta 24 segundos de audio por petición, con grafos de decodificación autorregresiva de historial 512 y 1024.

Su relevancia es práctica: demuestra un pipeline completo de ASR en el dispositivo con latencias de menos de 5 segundos para clips de 24 segundos en hardware Snapdragon de gama alta. La licencia Apache-2.0 del modelo base se mantiene, aunque el runtime de Qualcomm debe obtenerse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3-ASR (transformer encoder-decoder para ASR); grafos compilados para Qualcomm QNN/HTP |
| Parametros totales | 1,7 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite operativo de 24 segundos de audio por petición en el worker |
| Tipos de cuantizacion | Pesos INT8 por canal (per-channel), activaciones FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafos QNN compilados por SoC (bundles sm8975, sm8950, sm8850, sm8750, sm8650); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento del habla de Alibaba Qwen con 1,7 mil millones de parámetros. Esta release no reentrena el modelo: parte de una conversión de 8 bits de mlx-community (revisión `a8379a2e2f9e313c9292cdf1af4055ab56d50d55`) y la recuantiza para el backend QNN, generando grafos estáticos optimizados para el Hexagon Tensor Processor.

La compilación aplica varias optimizaciones de bajo nivel: codificación INT8 por canal en los pesos con activaciones FP16, atención agrupada sin cabezas KV repetidas, historial K pretranspuesto, buffers KV compartidos y grafos de decodificación autorregresiva AR1 con historial de 512 y 1024 tokens. El encoder de audio y el prefill AR64 usan el nivel de optimización O2, mientras que ambos grafos AR1 de decodificación usan O3. El worker C++ (derivado del proyecto acpm) soporta las dimensiones de los modelos 0.6B y 1.7B. No se documentan en la información disponible los datos de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de entrada: transcribe PCM WAV de 16 kHz mono a 16 bits.
- Procesamiento de clips de hasta 24 segundos por petición en el worker incluido.
- Inferencia totalmente local en el dispositivo, sin dependencia de red.
- Ejecución acelerada en el DSP Hexagon mediante QNN/HTP, con perfil de rendimiento `burst` seleccionable por petición.
- Gestión de estado térmico de Android en el host para decidir el perfil por petición.
- Soporte de las dimensiones de modelo 0.6B y 1.7B en el mismo worker.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de notas de voz en apps de mensajería: clips cortos de menos de 24 segundos se transcriben en menos de 2 segundos en caliente, lo que permite mostrar el texto casi en tiempo real sin enviar audio a la nube.
- Subtitulado local de grabaciones de reuniones: dividiendo el audio en segmentos de 24 segundos, el modelo puede procesar reuniones completas en el propio dispositivo, preservando la privacidad del contenido.
- Asistentes de voz sin conexión: integrado en un servicio Android, el modelo transcribe comandos y dictado incluso sin cobertura, usando el HTP para minimizar el consumo energético.
- Accesibilidad para personas con discapacidad auditiva: transcripción en directo de conversaciones presenciales en el teléfono, con el perfil `burst` activado solo cuando el estado térmico lo permite.
- Dictado en aplicaciones de productividad: el worker puede invocarse desde una app nativa para convertir voz en texto en campos de formulario, con latencia de carga en proceso nuevo de aproximadamente 3,71 segundos.
- Procesamiento por lotes en campo: dispositivos de inspección o logística que graban notas de voz y las transcriben al instante en el propio terminal, sin infraestructura de servidores.
- Evaluación comparativa de aceleradores: el bundle verificado para Magic V6 permite medir el rendimiento del ASR en distintos SoC Snapdragon con una configuración de compilador idéntica.

## Benchmarks y rendimiento

Resultados de dispositivo real publicados por el autor (mediana en caliente, cuatro ejecuciones por clip, estado térmico de Android 0):

| Duracion del WAV | Transcripcion en caliente | Tokens de salida |
|---|---:|---:|
| 2,79 s | 0,879 s | 14 |
| 8,00 s | 1,679 s | 27 |
| 24,00 s | 4,836 s | 77 |

Carga del modelo en proceso nuevo: mediana de 3,71 segundos. El autor advierte que este benchmark no establece la precisión de transcripción; en el clip de 24 segundos la build HTP emitió `poco更多` donde una build anterior para Adreno emitía `会有更多`. No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- SoC Qualcomm Snapdragon con Hexagon HTP compatible: SM8975 (Snapdragon 8 Elite Extreme Gen 6, V85), SM8950 (Snapdragon 8 Elite Gen 6, V85), SM8850 (Snapdragon 8 Elite Gen 5, V81), SM8750 (Snapdragon 8 Elite, V79) y SM8650 (Snapdragon 8 Gen 3, V75).
- Payload de aproximadamente 2,39-2,40 GB por bundle, más las librerías de runtime de Qualcomm.
- QAIRT requerido: 2.52.0.261104 para SM8975/SM8950 y 2.50.0.260828 para SM8850/SM8750/SM8650, obtenido del Qualcomm Software Center.
- Librerías de runtime necesarias: `libQnnHtp.so`, `libQnnSystem.so`, el stub HTP de Android correspondiente y el skel DSP compatible (por ejemplo, `libQnnHtpV81Stub.so` y `libQnnHtpV81Skel.so` para el bundle Magic V6).
- Compilación del worker con Android NDK arm64 (`aarch64-linux-android26-clang++`, C++20).
- No es desplegable en GPU de escritorio, vLLM, llama.cpp, Ollama ni TGI: los artefactos son grafos QNN específicos de SoC.
- Despliegue mediante ADB: se empujan el bundle, el worker, el directorio de runtime y el WAV al dispositivo; el worker acepta hasta 24 segundos de audio por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Qwen3-ASR-1.7B-QNN-HTP (esta ficha) | 1,7B | no disponible; 24 s de audio por peticion | Apache-2.0 | Grafos QNN/HTP para Android |
| Qwen/Qwen3-ASR-1.7B (modelo base) | 1,7B | no disponible | Apache-2.0 | Pesos estándar (safetensors, presumiblemente) |
| Conversión mlx-community 8-bit de Qwen3-ASR-1.7B | 1,7B | no disponible | Apache-2.0 | 8 bits para MLX (Apple Silicon) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; la comparación se limita a formato, licencia y plataforma de despliegue.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes; es una release muy reciente y sin validación comunitaria.
- Los grafos están compilados para SoC concretos; no son portables entre dispositivos ni ejecutables fuera de Android con Hexagon.
- El límite de 24 segundos por petición obliga a segmentar audios largos, con el riesgo de cortes en fronteras de palabra.
- El propio autor señala que el benchmark no establece la precisión de transcripción y documenta una discrepancia de salida entre builds HTP y Adreno.
- El runtime de Qualcomm (QAIRT) se obtiene por separado y no está cubierto por la licencia Apache-2.0 del repositorio.
- No se documentan los idiomas soportados ni sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a los modelos generativos de ASR, no cuantificado en la información disponible.
- El rendimiento depende del estado térmico del dispositivo; el perfil `burst` puede degradarse bajo throttling.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse los avisos y licencias adjuntos del worker y del runtime de Qualcomm.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Happenmasss/Qwen3-ASR-1.7B-QNN-HTP
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio del worker acpm: https://github.com/Happenmass/acpm
- Qualcomm Software Center (QAIRT): https://softwarecenter.qualcomm.com/
