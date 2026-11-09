# raymondchins/qwen3-asr-0.6b-coreml-ane

## Resumen

Qwen3-ASR 0.6B Core ML ANE es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR 0.6B de Alibaba Qwen a formato Core ML, optimizada para ejecutarse íntegramente en el Neural Engine (ANE) de los Mac con Apple Silicon. El trabajo lo publica el desarrollador raymondchins como artefacto de despliegue para Speakey, una aplicación de dictado y comandos de voz para macOS que descarga el modelo automáticamente. No se trata de un modelo reentrenado: los pesos son los originales de Qwen, únicamente convertidos y cuantizados a int8 en el decodificador y fp16 en el codificador.

La relevancia de esta ficha es práctica: demuestra cómo llevar un modelo ASR de 0,6 mil millones de parámetros a inferencia local en hardware de consumo Apple sin GPU dedicada, con un consumo energético aproximadamente seis veces menor que la variante que ejecuta el decodificador en la GPU Metal. El paquete completo ocupa unos 1,1 GB y requiere macOS 15 o superior.

El modelo cubre 30 idiomas, entre ellos el español, y está pensado para transcripción de audio de 16 kHz en ventanas de 8 segundos, con un decodificador autorregresivo basado en transformer con RoPE y caché KV de 512 filas gestionada como estado de Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ASR): codificador de audio + decodificador de texto autorregresivo con RoPE |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ASR-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 8 s por llamada al codificador (800 frames mel, 104 tokens de audio); caché KV de 512 filas en el decodificador |
| Tipos de cuantizacion | Codificador fp16; decodificador int8 por canal; embeddings int8 con escala float32 por fila |
| Idiomas soportados | ar, cs, da, de, el, en, es, fa, fi, fil, fr, hi, hu, id, it, ja, ko, mk, ms, nl, pl, pt, ro, ru, sv, th, tr, vi, yue, zh (30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`encoder.mlmodelc`, `decoder-ane-a.mlmodelc`, `decoder-ane-b.mlmodelc`), embeddings en `embeddings.i8` + `embeddings.scale`, vocabulario `vocab.json` |
| Tamano del repositorio | 1,1 GB |
| Requisitos de plataforma | macOS 15 o superior sobre Apple Silicon (necesario para el estado de Core ML) |
| Unidades de computo | `computeUnits = .cpuAndNeuralEngine` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-ASR-0.6B: un codificador de audio que transforma espectrogramas log-mel de 128 bins en representaciones de 1024 dimensiones, y un decodificador transformer de 28 capas con atención RoPE (theta = 1.000.000) que genera texto de forma autorregresiva. El codificador procesa ventanas de 800 frames (8 segundos) y produce 104 tokens de audio por ventana completa; una ventana parcial de n frames produce ceil(n/8) tokens. El codificador original no atiende entre ventanas, por lo que el troceado es exacto para cualquier duración.

La conversión a Core ML introduce varias decisiones técnicas relevantes. Los tensores se reorganizan en formato channels-first (1, C, 1, S) y cada proyección se implementa como convolución 1x1, el layout que el Neural Engine ejecuta de forma nativa; según el autor, esto acelera un paso del decodificador unas 2,5 veces frente a capas lineales equivalentes. Las formas son fijas: 64 filas para prefill y verificación de borradores, 1 fila para un paso individual. Como 28 capas no compilan como un único programa de Neural Engine, el decodificador se divide en dos ficheros de 14 capas cada uno, con un `MLState` compartido por fichero. La caché KV son 512 filas de estado de Core ML escritas mediante una matriz one-hot en lugar de un slice dinámico, porque la actualización por slice caía a CPU. La LM head se integra en el segundo fichero en cuatro partes, ya que como modelo independiente Core ML la asignaba a CPU. El plan de cómputo de Core ML coloca 2.298 de las 2.303 operaciones del decodificador en el Neural Engine; las 5 restantes corresponden al argmax de la LM head.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base. Los pesos no fueron reentrenados en esta conversión.

## Capacidades

- Reconocimiento automático del habla (ASR) en 30 idiomas, incluido el español, con detección automática de idioma: sin forzar idioma, el modelo emite primero `language X<asr_text>`.
- Forzado de idioma mediante los identificadores de idioma incluidos en `speakey.json`.
- Procesamiento de audio de 16 kHz mono con espectrograma log-mel de 128 bins calculado al estilo Whisper (FFT de 400 muestras, hop 160, ventana Hann, filtro `mel.bin`, log10, suelo en max − 8, normalización `(x + 4) / 4`).
- Manejo de audio de duración arbitraria mediante troceado en ventanas de 8 segundos con relleno de ceros en la última ventana y máscara aditiva para las posiciones sobrantes.
- Decodificación con verificación de borradores: la función `tail` permite verificar hasta 16 filas candidatas en una sola llamada, con un coste similar al de un paso individual.
- Inferencia completamente local en el Neural Engine, sin acceso a red ni a GPU.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en macOS: integración en aplicaciones de escritorio que transcriben voz a texto en tiempo real, aprovechando que el modelo se ejecuta en el Neural Engine con carga en aproximadamente un segundo y consumo energético reducido.
- Comandos de voz locales: el modelo transcribe la orden y una capa superior la interpreta; es adecuado por su baja latencia y porque no requiere conexión a internet ni envía audio a servidores externos.
- Transcripción de reuniones y notas de voz: el troceado en ventanas de 8 segundos permite procesar grabaciones largas de forma secuencial, con la caché KV de 512 filas gestionando el contexto del decodificador.
- Subtitulado de contenido audiovisual en 30 idiomas: la detección automática de idioma y el forzado mediante identificadores permiten generar subtítulos en español, inglés, francés, alemán, chino, japonés y otros idiomas sin modelos separados.
- Aplicaciones de accesibilidad: dictado para usuarios con movilidad reducida en equipos Mac de gama de entrada (8 GB de RAM), donde la variante GPU consumía hasta 2 GB durante la compilación del grafo Metal.
- Procesamiento por lotes en servidores Mac: despliegue en parques de Mac mini para transcripción masiva con bajo consumo eléctrico, dado que el autor mide aproximadamente seis veces menos consumo que la variante GPU en un M4.
- Prototipado e investigación en ASR multilingüe: al ser Apache 2.0 y estar disponible en Core ML, sirve como base para experimentos de adaptación o para comparar el rendimiento del Neural Engine frente a GPU en tareas de reconocimiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. El autor únicamente proporciona mediciones comparativas de rendimiento de inferencia entre la variante Neural Engine y la variante GPU:

| Equipo | Comparativa frente a la build GPU |
|---|---|
| M4 (Mac mini, 16 GB) | Una toma es aproximadamente un 40 % más rápida; carga en aproximadamente 1 s frente a 6,7 s; consume aproximadamente 6 veces menos energía |
| M5 Max | Carga aproximadamente 6 veces más rápido con una fracción de la memoria; una toma es más lenta que en la GPU grande de ese Mac, pero muy por debajo del umbral perceptible por una persona |

Además, el autor indica que el decodificador con tensores channels-first y convoluciones 1x1 es aproximadamente 2,5 veces más rápido por paso que la misma arquitectura con capas lineales, y que la verificación de un borrador completo en una llamada `tail` cuesta aproximadamente lo mismo que un paso individual.

## Requisitos de hardware

- VRAM/almacenamiento: descarga total de aproximadamente 1,1 GB (codificador 356 MB, decodificador A 211 MB, decodificador B 360 MB, embeddings 148 MB, vocabulario 2,6 MB, filtro mel 100 KB).
- Memoria: la variante GPU retenía brevemente unos 2 GB durante la compilación del grafo Metal; la variante Neural Engine evita ese pico y carga desde la caché de Core ML, lo que la hace viable en Mac de 8 GB.
- GPU recomendadas: no aplica GPU dedicada; requiere Apple Silicon con Neural Engine y macOS 15 o superior. Equipos medidos por el autor: Mac mini M4 con 16 GB y Mac con M5 Max.
- ¿Cabe en hardware de consumo? Sí, en cualquier Mac con Apple Silicon y macOS 15 o superior; el autor lo orienta explícitamente a equipos de 8 GB.
- Opciones de despliegue: Core ML mediante `MLModel(contentsOf:)` con `computeUnits = .cpuAndNeuralEngine`, un `MLModel` por función usando `MLModelConfiguration.functionName`. La aplicación Speakey lo descarga automáticamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en M4, una toma es aproximadamente un 40 % más rápida que en la build GPU y la carga es de aproximadamente 1 s. En M5 Max, la carga es aproximadamente 6 veces más rápida que la build GPU, aunque una toma es más lenta que en la GPU de ese equipo. No se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Qwen3-ASR 0.6B Core ML ANE (este) | 0,6 B | Ventanas de audio de 8 s; caché KV de 512 filas | 30 | Apache 2.0 | Core ML, Neural Engine, macOS 15+ |
| raymondchins/qwen3-asr-0.6b-coreml | 0,6 B | Igual (mismo modelo base) | 30 | Apache 2.0 | Core ML, decodificador en GPU |
| raymondchins/qwen3-asr-1.7b-coreml-ane | 1,7 B | No disponible | No disponible | Apache 2.0 | Core ML, Neural Engine; aproximadamente el doble de tamaño y tiempo, más preciso según el autor |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | No disponible | 30 | Apache 2.0 | Pesos originales (formato no especificado en la información) |

No se dispone de datos de benchmarks que permitan comparar la precisión (WER) frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo funciona en macOS 15 o superior sobre Apple Silicon; no hay soporte para Linux, Windows, GPU NVIDIA ni CPU x86.
- El decodificador está cuantizado a int8 por canal; el autor señala que la paletización uniforme de 8 bits alteraba palabras, por lo que la cuantización más agresiva no está validada.
- La caché KV está limitada a 512 filas, lo que acota la longitud de transcripción gestionable en una sola sesión de decodificación.
- El codificador procesa ventanas de 8 segundos; la última ventana se rellena con ceros y las posiciones sobrantes se enmascaran con −1e4, lo que puede afectar a la calidad en audios muy cortos.
- No se han publicado métricas de precisión (WER) ni evaluaciones de sesgo en la información disponible; no se puede garantizar el rendimiento en dominios con acento marcado, ruido de fondo o vocabulario técnico.
- Riesgo de alucinación inherente a los modelos generativos: el decodificador puede producir texto no presente en el audio, especialmente en segmentos con silencio o ruido.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el fichero NOTICE con los cambios realizados.
- El modelo está pensado para integrarse en Speakey; el uso fuera de esa aplicación requiere implementar manualmente el pipeline completo (espectrograma, prompt, gestión de estado, decodificación y parada en los tokens 151643 o 151645).
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raymondchins/qwen3-asr-0.6b-coreml-ane
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Variante anterior con decodificador en GPU: https://huggingface.co/raymondchins/qwen3-asr-0.6b-coreml
- Variante de 1,7 B para Neural Engine: https://huggingface.co/raymondchins/qwen3-asr-1.7b-coreml-ane
- Aplicación Speakey: https://speakey.dev
- Paper referenciado en los tags (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
