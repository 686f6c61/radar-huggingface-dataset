# OpenInfinity/Confucius4-R2T2-coreml

## Resumen

Confucius4-R2T2-coreml es una conversión a Core ML del modelo de reconocimiento automático de voz Confucius4-R2T2 de NetEase Youdao, publicada por OpenInfinity. El modelo original sigue la arquitectura Qwen3-ASR-1.7B, con unos 1.700 millones de parámetros, y esta versión está optimizada para ejecutarse en el Apple Neural Engine (ANE) en lugar de la GPU, con el objetivo de reducir el consumo energético en tareas de ASR en streaming sobre hardware Apple Silicon.

La conversión parte de la versión MLX de 8 bits (mlx-community/Confucius4-R2T2-8bit) en la revisión `2d6d997c3e09c65a65b1b2576b6b9b7728df8eab` y se distribuye en dos paquetes independientes: un codificador (front end convolucional en CPU en fp32 y cuerpo transformer en ANE en fp16) y un decodificador de texto dividido en cuatro partes con estado, con pesos int8 y activaciones fp16. El repositorio ocupa 2,4 GB y da soporte a chino (zh) y inglés (en).

La relevancia de esta ficha radica en que demuestra una ruta práctica para llevar ASR en streaming a la NPU de Apple con una reducción de potencia de hasta el 80 % respecto a la inferencia MLX en GPU, manteniendo una tasa de error de caracteres (CER) en chino prácticamente idéntica a la línea base (10,01 % frente a 9,83 %) y una coincidencia de salida superior al 99,4 %. Es, por tanto, una pieza útil para aplicaciones de dictado, transcripción en tiempo real y asistentes de voz en macOS e iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (base Qwen3-ASR-1.7B), convertido a Core ML con codificador convolucional + transformer y decodificador de texto stateful |
| Parametros totales | aproximadamente 1.700 millones (1.7B, segun la arquitectura Qwen3-ASR-1.7B citada) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | ventana de audio de 8 s (104 posiciones) en el codificador; cache KV de 704 posiciones en el decodificador; 64 posiciones por llamada |
| Tipos de cuantizacion | decodificador con pesos int8 y activaciones fp16; codificador front end fp32; cuerpo del codificador fp16; embeddings de texto 8-bit en MLX; palettizacion LUT uniforme de 4 y 6 bits evaluada y descartada |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | NetEase Youdao Model Use License Agreement (license: other) |
| Formato de pesos | Core ML (.mlmodelc), mas tabla de embeddings de texto en safetensors (8-bit) del repositorio MLX |

## Arquitectura y entrenamiento

El modelo original es un sistema ASR de arquitectura encoder-decoder basada en Qwen3-ASR-1.7B. Esta conversión Core ML separa el pipeline en dos paquetes: el codificador, que incluye un front end convolucional (R2T2EncoderFront) que procesa chunks de log-mel de 1 s (100 frames) y produce 13 posiciones de embeddings por segundo, y un cuerpo transformer (R2T2EncoderBody) que opera sobre una ventana de 8 s (104 posiciones); y el decodificador de texto, dividido en cuatro partes stateful de 7 capas cada una (capas 0-6, 7-13, 14-20 y 21-27), mas una cabeza final con normalización, LM head y argmax.

La conversión introduce ajustes numéricos específicos para el Neural Engine: la entrada de `down_proj` del decodificador se escala por 1/256 y la salida por 256 para evitar desbordamiento de la acumulación fp16 (la activación MLP de la capa 2 ronda 15.000). La palettizacion LUT uniforme de 4 y 6 bits se evaluó y se rechazó por pérdida excesiva de precisión. La escritura de la cache KV se realiza mediante una entrada `onehot` para mantener la actualización dentro del ANE. No se dispone de información sobre el dataset de entrenamiento original, número de tokens, composición ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz en streaming con cadencia de actualización de 320 ms.
- Transcripción en chino e inglés.
- Procesamiento por chunks de audio de 1 s con ventanas de contexto de 8 s.
- Decodificacion greedy integrada en la cabeza del modelo (argmax por posición).
- Cache KV stateful de 704 posiciones gestionada dentro del Neural Engine.
- Dos modos de despliegue: solo codificador en ANE (decodificador en MLX/GPU) o pipeline completo en ANE.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio multimodal ni thinking mode en la información disponible.

## Casos de uso

- Dictado en tiempo real en macOS e iOS: el pipeline completo en Neural Engine permite transcripción continua con un consumo extra de solo 1,93 W sobre el estado idle, adecuado para aplicaciones de escritura por voz que deben preservar batería.
- Transcripción de reuniones y notas de voz: la ventana de 8 s del codificador y la cache KV de 704 posiciones permiten procesar audio de forma incremental con latencia p95 de 560 ms en modo ANE completo.
- Asistentes de voz integrados en apps nativas: la latencia de primera salida de texto (1,04-1,42 s) y la cadencia de 320 ms encajan en interfaces conversacionales con respuesta progresiva.
- Subtitulado en streaming de contenido en chino o inglés: el modelo mantiene una CER en chino del 10,01 % en modo ANE, lo que lo hace viable para subtítulos aproximados en producción.
- Aplicaciones de transcripción con restricciones térmicas o de batería: el modo encoder-on-ANE reduce la potencia un 47 % (5,03 W) y mantiene la latencia p95 en 177 ms, siendo la opción más equilibrada para dispositivos portátiles.
- Procesamiento local sin GPU dedicada: al ejecutarse en el Neural Engine, libera la GPU para otras tareas del sistema, útil en entornos donde la GPU está ocupada por renderizado o ML concurrente.
- Integración en apps iOS 18 o superior: los modelos stateful de Core ML permiten empaquetar el reconocimiento dentro de la app sin depender de servicios en la nube.

## Benchmarks y rendimiento

Mediciones de reconocimiento en streaming sobre Apple M3 Max con macOS 26.7, cadencia de actualización de 320 ms, frente a la línea base MLX 8-bit en GPU.

| Metrica | MLX en GPU (base) | Codificador en ANE | Todo en ANE |
|---|---|---|---|
| Potencia extra sobre idle (12 clips en tiempo real) | 9,52 W | 5,03 W (−47 %) | 1,93 W (−80 %) |
| Latencia de actualizacion p95 | 209 ms | 177 ms | 560 ms |
| Primera salida de texto | 1,04 s | 1,04 s | 1,42 s |
| CER en chino (42 clips) | 9,83 % | 10,01 % | 10,01 % |
| Coincidencia con la salida base | — | ≥ 99,4 % | ≥ 99,4 % |

Las salidas no son idénticas bit a bit a la línea base: pequeñas diferencias fp16 en el Neural Engine invierten empates cercanos, principalmente en puntuación. El uso de memoria del sistema es similar en las tres configuraciones; los pesos en Neural Engine se contabilizan como memoria wired en lugar de memoria de proceso.

## Requisitos de hardware

- Apple Silicon con macOS 15 o superior (modelos stateful de Core ML, conjunto de operaciones de iOS 18).
- Probado en macOS (versión concreta no especificada en la información disponible) sobre Apple M3 Max.
- Tamaño en disco: 0,66 GB para el codificador (ambos modelos) y 1,72 GB para el decodificador completo; repositorio total de 2,4 GB.
- El front end debe cargarse con `MLComputeUnits.cpuOnly` (pierde precisión en el Neural Engine); el resto con `.cpuAndNeuralEngine`.
- Primera carga: unos 5 s de compilación para el codificador y unos 20 s para el decodificador; cargas posteriores cacheadas por Core ML.
- No se dispone de estimaciones de VRAM ni de recomendaciones de GPU discretas (A100, H100, RTX 4090): el modelo está diseñado exclusivamente para el Neural Engine de Apple Silicon.
- Opciones de despliegue: Core ML nativo en macOS/iOS; requiere además el repositorio MLX en la revisión indicada para tokenizer, tabla de embeddings 8-bit y configuración del front end de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Confucius4-R2T2-coreml (esta ficha) | ~1.7B | ventana de audio de 8 s; cache KV de 704 posiciones | Apple Neural Engine | NetEase Youdao Model Use License | Hugging Face |
| netease-youdao/Confucius4-R2T2 (original) | ~1.7B | no disponible | GPU/CPU genérica | NetEase Youdao Model Use License | Hugging Face |
| mlx-community/Confucius4-R2T2-8bit | ~1.7B | no disponible | Apple GPU via MLX | NetEase Youdao Model Use License | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros sistemas ASR (por ejemplo Whisper u otros modelos de tamaño similar), por lo que la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Licencia restrictiva: el acuerdo prohíbe usos de alto riesgo (§4.2), como diagnóstico médico, conducción autónoma, aplicaciones militares y control de infraestructuras críticas.
- Requiere licencia separada de NetEase Youdao por encima de 100 millones de usuarios activos mensuales o 1.000 millones de RMB de ingresos anuales (§2.2).
- Limita el uso del modelo para mejorar otros modelos de IA (§3.3c).
- La redistribución debe mantener la licencia y los avisos (NOTICE) y vincular a los destinatarios al mismo acuerdo.
- Las modificaciones de esta obra derivada no están respaldadas ni garantizadas por el titular original (descargo de responsabilidad, §4.1a).
- Solo soporta chino e inglés; no se documentan otros idiomas.
- No es idéntico bit a bit a la línea base: diferencias fp16 pueden alterar puntuación y empates cercanos.
- CER en chino del 10,01 %, lo que implica un margen de error relevante en producción y riesgo de transcripciones incorrectas en audio ruidoso o con acentos.
- No se documentan sesgos específicos del modelo original en la información disponible.
- Dependencia de hardware Apple Silicon y macOS 15+; no ejecutable en GPU NVIDIA ni en entornos Linux/Windows.
- El front end pierde precisión si se carga en el Neural Engine, obligando a `cpuOnly`.
- La palettizacion de 4 y 6 bits se descartó por pérdida de precisión, lo que limita el ahorro adicional de memoria en el decodificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenInfinity/Confucius4-R2T2-coreml
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Version MLX 8-bit de partida: https://huggingface.co/mlx-community/Confucius4-R2T2-8bit
- Licencia NetEase Youdao: https://huggingface.co/OpenInfinity/Confucius4-R2T2-coreml/blob/main/LICENSE
- Texto de licencia en chino (prevaleciente): https://huggingface.co/OpenInfinity/Confucius4-R2T2-coreml/blob/main/MODEL_LICENSE_zh
- Aviso legal: https://huggingface.co/OpenInfinity/Confucius4-R2T2-coreml/blob/main/NOTICE
