# shuuul/Qwen3-ASR-0.6B-NVFP4-W4A16

## Resumen

`shuuul/Qwen3-ASR-0.6B-NVFP4-W4A16` es una versión cuantizada del modelo de reconocimiento automático del habla `Qwen/Qwen3-ASR-0.6B`, publicado por el usuario shuuul. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: conserva la arquitectura original (encoder de audio más decoder de 28 capas) y únicamente sustituye 168 capas Lineales del decoder por pesos NVFP4 de 4 bits, manteniendo las activaciones en bf16 (esquema W4A16). El resultado ocupa aproximadamente 1,0 GB de repositorio frente al checkpoint bf16 de referencia, que la model card cifra en 1,9 GB.

La relevancia es doble. Por un lado, demuestra una receta reproducible de cuantización de pesos con NVIDIA Model-Optimizer 0.47.0 (algoritmo GPTQ con calibración) sobre un modelo ASR pequeño de 593.682.432 parámetros, con un manifiesto que registra módulo a módulo qué se cuantizó, con qué conjunto de calibración y con qué versiones de librerías. Por otro, publica una puerta de calidad (gate) medida contra el modelo base: en 60 clips de LibriSpeech el WER pasa de 0,0225 (bf16) a 0,0218 (NVFP4) y en 60 clips de AISHELL el CER pasa de 0,0267 a 0,0242, es decir, sin degradación apreciable en esas muestras.

Ahora bien, el propio autor advierte de que un modelo de 0,6B tiene "menos que ahorrar y más que perder" al cuantizar, y de que el checkpoint no se ha probado en carga real con vLLM ni SGLang. Es, por tanto, un artefacto interesante para evaluar el estado del soporte NVFP4 weight-only en ASR, no una alternativa lista para producción sin verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ASR con encoder de audio (`thinker.audio_tower`, 18 capas) y decoder tipo transformer (`thinker.model.layers`, 28 capas) |
| Parámetros totales | 593.682.432 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros cuantizados | 377 M en 168 capas Lineales (capas 2 a 25 del decoder, de 28) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A16: pesos e2m1 de 4 bits, escala float8 e4m3 cada 16 valores, una escala fp32 por tensor; activaciones en bf16 |
| Idiomas soportados | no disponible; el conjunto de calibración usa inglés y mandarín |
| Licencia | Apache 2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-ASR-0.6B (revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`) |
| Herramienta de cuantización | NVIDIA Model-Optimizer 0.47.0 (GPTQ, calibrado), receta `recipes/qwen3-asr-0.6b` de ModelQuant |
| Entorno de construcción | transformers 4.57.6, torch 2.11.0+cu128, NVIDIA A100-PCIE-40GB |
| Tamaño del repositorio | 1,0 GB |
| Variantes | `default` y `keep-o-down` (esta última mantiene `o_proj` y `down_proj` en bf16) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 27 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR con dos componentes diferenciados. El primero es un encoder de audio (`thinker.audio_tower`) con 18 capas que combinan convoluciones (`conv_out`, `proj1`, `proj2`) y atención con proyecciones `q_proj`, `k_proj`, `v_proj` y `out_proj`, más dos capas fully-connected por bloque (`fc1`, `fc2`). El segundo es un decoder de lenguaje de 28 capas con atención estándar (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y MLP con compuerta (`gate_proj`, `up_proj`, `down_proj`), más embeddings y `lm_head` atados. La generación de la transcripción se realiza de forma autorregresiva sobre el prefijo de audio procesado.

La intervención de este checkpoint afecta exclusivamente a las capas Lineales 2 a 25 del decoder: 24 capas por cada uno de los siete módulos (`down_proj`, `gate_proj`, `up_proj`, `k_proj`, `o_proj`, `q_proj`, `v_proj`), lo que suma 168 módulos y 377 M parámetros en 4 bits. Permanecen en bf16 el encoder de audio completo, las dos primeras y las dos últimas capas del decoder, las normalizaciones, los embeddings y el `lm_head`. La cuantización se calibró con 256 clips (128 de `openslr/librispeech_asr`, CC-BY-4.0, y 128 de `AISHELL/AISHELL-1`, Apache 2.0), procesados con el procesador y el prompt del paquete `qwen-asr` y con la transcripción del modelo bf16 como objetivo, en modo teacher forcing (7.716 tokens de respuesta en total).

No se detalla en la información disponible el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni innovaciones de decodificación como decodificación especulativa. La innovación destacable de este artefacto es la propia receta de cuantización: uso de escalas de bloque e4m3 cada 16 pesos con una escala fp32 por tensor, y un `manifest.json` que registra cada módulo, el conjunto de calibración, las versiones y el sha256 de cada fichero, lo que hace el resultado auditable y reproducible.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto en una pasada, con pipeline declarado `automatic-speech-recognition`.
- Generación autorregresiva de transcripciones con criterio de parada EOS (en el gate, 120 de 120 respuestas terminaron en EOS).
- Procesamiento de audio en inglés y mandarín: son los dos idiomas presentes en el conjunto de calibración y en la evaluación publicada.
- Salida de texto alineada con el modelo base: 101 de 120 respuestas son idénticas token a token a las del bf16 en los clips evaluados.
- Integración con el ecosistema `qwen-asr` mediante `Qwen3ASRModel.LLM(...)` y el método `transcribe(...)`.
- Compatibilidad declarada (no verificada) con vLLM, que lee checkpoints de ModelOpt a través de `quantization_config` (`quant_method: modelopt`, `quant_algo: W4A16_NVFP4`).
- Compatibilidad declarada (no verificada) con SGLang mediante `--quantization modelopt_fp4`, sujeto a que su soporte de ModelOpt cubra NVFP4 weight-only.
- No dispone de tool calling, capacidades de agente, visión, audio de salida ni modo de razonamiento extendido: es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones y actas: el modelo recibe un fichero WAV y devuelve la transcripción mediante `asr.transcribe("speech.wav")[0].text`, lo que permite generar actas automáticas en flujos internos donde el audio no puede salir a una API externa.
- Subtitulado y postproducción: al ser un modelo de 0,6B cuantizado a 4 bits, puede ejecutarse en una estación de trabajo con GPU de consumo para generar subtítulos preliminares de vídeo que luego revisa un editor humano.
- Dictado por voz en aplicaciones de escritorio: el peso del checkpoint (en torno a 0,65 GB de pesos, según la estimación a partir de los parámetros) permite empaquetarlo en una aplicación local sin depender de conectividad.
- Atención al cliente con entrada de voz: combinado con un LLM aparte, sirve como primer escalón de un pipeline que transcribe la llamada y pasa el texto al motor de diálogo, con la ventaja de que la transcripción ocurre en la propia infraestructura.
- Transcripción bilingüe inglés-mandarín: es el par de idiomas sobre el que se calibró y evaluó, por lo que encaja en equipos de soporte o investigación que trabajen con audio en esas dos lenguas.
- Preetiquetado de corpus de voz: para generar transcripciones iniciales de grandes volúmenes de audio que después se corrigen manualmente antes de entrenar otros modelos, siempre que se valide el throughput real del despliegue elegido.
- Evaluación de recetas de cuantización: el `manifest.json` y los scripts del repositorio ModelQuant permiten reproducir la receta, comparar la variante `default` con `keep-o-down` y medir el impacto de NVFP4 en un modelo pequeño.
- Despliegue en entornos con VRAM limitada: frente al bf16, la variante cuantizada reduce el peso de los pesos del decoder, lo que permite reservar más memoria a caché de audio o a procesos concurrentes en GPUs pequeñas.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la puerta de calidad del autor, medidos en transformers con decodificación greedy sobre clips reservados (60 de LibriSpeech para inglés, 60 de AISHELL para mandarín), comparando el checkpoint NVFP4 con el modelo base bf16:

| Medida | bf16 | NVFP4 | Delta | Umbral | Resultado |
|---|---|---|---|---|---|
| WER LibriSpeech (60 clips) | 0,0225 | 0,0218 | -0,0008 | <= 0,005 | Pasa |
| CER AISHELL (60 clips) | 0,0267 | 0,0242 | -0,0024 | <= 0,005 | Pasa |
| Respuestas terminadas en EOS | 120/120 | 120/120 | — | todas | Pasa |
| Respuestas idénticas token a token al bf16 | — | 101/120 | — | solo informativo | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni cifras de latencia o throughput. Tampoco hay métricas sobre lenguajes distintos del inglés y el mandarín, ni sobre audio con ruido, acentos o cambio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medición; a partir del recuento de parámetros, los pesos de esta variante suman aproximadamente 0,65 GB (unos 189 MB de pesos de 4 bits, unos 24 MB de escalas e4m3 y unos 433 MB de tensores que permanecen en bf16). El checkpoint bf16 equivalente ronda 1,19 GB. Hay que añadir la caché de activaciones y de audio, cuyo tamaño depende de la duración de los clips y no se documenta.
- GPU recomendadas: el autor construyó y evaluó el checkpoint en una NVIDIA A100-PCIE-40GB. Para ejecución nativa de NVFP4 se requiere hardware con soporte de ese formato; en GPUs sin soporte nativo es necesario dequantizar o recurrir a un runtime que lo emule, lo que elimina parte del ahorro.
- GPU de consumo: por tamaño de pesos, el modelo cabe holgadamente en tarjetas de 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) siempre que el runtime soporte el formato o se dequantice a bf16, en cuyo caso el requisito se acerca a los 2 GB de pesos más activaciones.
- Opciones de despliegue: vLLM (soporte de ModelOpt W4A16 NVFP4; no probado en carga según el autor), SGLang (`--quantization modelopt_fp4`; el autor indica que ModelOpt marca NVFP4 weight-only como no soportado por SGLang), y transformers (no tiene cargador de ModelOpt NVFP4; hay que cargar el modelo base con `Qwen3ASRModel.from_pretrained` e inyectar los pesos desquantizados, como hace la puerta de calidad con `swap_in`).
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni comparativas de velocidad frente al bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | WER LibriSpeech | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (bf16, base) | 593,68 M | no disponible | safetensors bf16 | 0,0225 (60 clips) | Apache 2.0 | Público en HuggingFace |
| Esta ficha (NVFP4 W4A16, variante `default`) | 593,68 M (377 M en 4 bits) | no disponible | safetensors NVFP4 | 0,0218 (60 clips) | Apache 2.0 | Público; sin probar en vLLM/SGLang |
| Variante `keep-o-down` | 593,68 M (mantiene `o_proj` y `down_proj` en bf16) | no disponible | safetensors NVFP4 | no disponible | Apache 2.0 | Incluida en el mismo repositorio |
| Qwen3-ASR-1,7B (mencionado en la model card) | ~1,7 B según su denominación | no disponible | no disponible | no disponible | no disponible | Referenciado, sin datos en esta información |

No se han encontrado en la información proporcionada datos de otros modelos ASR comparables (Whisper, Parakeet, etc.) que permitan una comparación numérica rigurosa; la comparativa se limita, por tanto, a las variantes del propio Qwen3-ASR.

## Limitaciones y advertencias

- El checkpoint no se ha probado en carga real con vLLM ni SGLang. Las instrucciones de uso de la model card son lo que "debería funcionar" cuando las rutas de ModelOpt cubran W4A16 NVFP4, no una garantía.
- transformers no dispone de cargador para ModelOpt NVFP4: usar el modelo exige cargar el base y sustituir pesos manualmente, lo que complica cualquier despliegue estándar.
- ModelOpt marca NVFP4 weight-only como "en progreso" para vLLM y no soportado por SGLang, según el propio autor.
- La evaluación se apoya en solo 60 clips por idioma. Es una muestra pequeña, sin intervalos de confianza; las diferencias de -0,0008 en WER y -0,0024 en CER no deben interpretarse como una mejora real, sino como ausencia de degradación detectable en esa muestra.
- El conjunto de calibración es exclusivamente inglés y mandarín (LibriSpeech y AISHELL-1, audio de lectura relativamente limpio). No hay evidencia sobre otros idiomas, acentos, ruido ambiental, solapamiento de hablantes ni cambio de código.
- La cuantización afecta a un modelo de 0,6B, donde cada peso de 4 bits representa una fracción mayor del total. El autor lo advierte explícitamente y remite a la puerta de calidad antes de elegir esta variante frente al bf16.
- Riesgo de alucinación en sentido ASR: como todo sistema autorregresivo, puede generar texto plausible no presente en el audio, especialmente en segmentos ruidosos, y ese riesgo no se ha caracterizado en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgo por acento, género, edad o variedad dialectal.
- Licencia Apache 2.0, igual que el base, por lo que el uso comercial está permitido; aun así, conviene verificar las condiciones del modelo base y de los datasets de calibración (LibriSpeech es CC-BY-4.0 y AISHELL-1 Apache 2.0, según la model card).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shuuul/Qwen3-ASR-0.6B-NVFP4-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de la receta de cuantización (ModelQuant): https://github.com/shuuul/ModelQuant
- Dataset de calibración LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset de calibración AISHELL-1: https://huggingface.co/datasets/AISHELL/AISHELL-1
- Los resultados de la búsqueda web no contienen enlaces relevantes para este modelo (son páginas de ayuda de YouTube), por lo que no se incluyen.
