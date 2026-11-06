# Maxkuo/Qwen3-ASR-1.7B-mlx-q8

## Resumen

Qwen3-ASR-1.7B-mlx-q8 es una cuantización de 8 bits del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, publicada por el usuario Maxkuo para la librería MLX de Apple. El artefacto está pensado para ejecutarse de forma nativa en Apple Silicon (familias M1, M2, M3, M4) sin depender de PyTorch ni del stack de transformers, mediante la reimplementación `mlx-qwen3-asr`. El modelo base es un sistema ASR multilingüe de 1.700 millones de parámetros desarrollado por el equipo Qwen (Alibaba).

La relevancia de esta ficha radica en que demuestra que es posible cuantizar a 8 bits tanto el encoder de audio como el decoder de texto de un modelo ASR sin degradación medible en la calidad de transcripción: según la model card, el WER y el CER en LibriSpeech test-clean son idénticos a los del modelo fp16 original (1,94% WER y 0,57% CER sobre 100 clips). Además, reduce el tamaño de descarga de 4,4 GB a 2,0 GB y acelera la inferencia aproximadamente 2,4 veces frente a fp16 en un clip de 10 segundos.

Se trata, por tanto, de una pieza de infraestructura más que de un modelo nuevo: un artefacto de despliegue orientado a transcripción local, privada y de baja latencia en hardware de consumo de Apple, con soporte para diez idiomas (inglés, chino, japonés, coreano, alemán, francés, español, ruso, árabe e hindi) y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de audio + decoder de texto transformer (Qwen3-ASR); cuantización afín de 8 bits con group size 64 en capas Linear y Embedding |
| Parámetros totales | 1,7 mil millones (modelo base Qwen3-ASR-1.7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits, group size 64 (MLX); tensores restantes en float16 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, ru, ar, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (cuantizado, safetensors); tamaño del repo 2,2 GB, descarga 2,0 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B sigue una arquitectura de dos torres: un encoder de audio que procesa la señal acústica y un decoder de texto autorregresivo que genera la transcripción. Esta versión no modifica la topología, sino que aplica cuantización afín de 8 bits con group size 64 (`mlx.nn.quantize`) a todas las capas `Linear` y `Embedding` del decoder de texto y del encoder de audio. Los tensores que no se cuantizan (escalas, sesgos, capas de normalización y el stem convolucional) se almacenan en float16, de modo que la inferencia se ejecuta de extremo a extremo en float16. La `lm_head` está atada a la embedding de tokens del modelo fuente y no se duplica; el cargador la vuelve a atar en tiempo de carga.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF o DPO) en la documentación proporcionada. La innovación técnica destacable de este artefacto es la conversión reproducible sin paso de conversión por parte del usuario: el script `scripts/convert.py` del repositorio `mlx-qwen3-asr` genera el artefacto directamente desde el modelo original de Hugging Face con los parámetros `--quantize 8 --encoder-bits 8 --group-size 64 --dtype float16`. El proceso de evaluación también está versionado (`scripts/eval_librispeech.py`), lo que permite auditar la equivalencia funcional con fp16.

## Capacidades

- Reconocimiento automático del habla (ASR) en diez idiomas: inglés, chino, japonés, coreano, alemán, francés, español, ruso, árabe e hindi.
- Transcripción de audio a texto con salida de texto plano.
- Generación de marcas de tiempo a nivel de palabra mediante la opción `--timestamps` de la CLI.
- Servidor HTTP integrado (`mlx-qwen3-asr serve`) para despliegue como servicio de transcripción.
- Inferencia nativa en Apple Silicon mediante MLX, sin PyTorch ni conversión previa por parte del usuario.
- Ejecución en float16 de extremo a extremo tras la carga de los pesos cuantizados.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada adicional ni modo de razonamiento explícito.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo puede procesar audio en el propio Mac del usuario sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad y para cumplir con el RGPD en el contexto español y europeo.
- Subtitulado automático de vídeo: la generación de marcas de tiempo por palabra (`--timestamps`) permite producir ficheros de subtítulos sincronizados para contenido en español, inglés, francés o alemán, integrándose en pipelines de postproducción.
- Servicio HTTP de transcripción en infraestructura Apple: el comando `mlx-qwen3-asr serve` expone el modelo como endpoint, lo que permite desplegarlo en un Mac mini o Mac Studio como servicio interno para equipos de desarrollo.
- Prototipado rápido de aplicaciones de voz: la instalación con `pip install -U mlx-qwen3-asr` y una única llamada a `m.transcribe()` reducen el tiempo de integración en aplicaciones de dictado, asistentes o análisis de llamadas.
- Investigación en ASR multilingüe: el artefacto permite reproducir experimentos de cuantización con el script de evaluación incluido y comparar WER y CER frente a fp16 en LibriSpeech test-clean.
- Procesamiento por lotes en portátiles de desarrollo: con 2,0 GB de descarga y una aceleración de aproximadamente 2,4 veces frente a fp16 en clips de 10 segundos, es viable transcribir lotes de audio en un MacBook con chip M4 Pro sin GPU dedicada.
- Análisis de contenido audiovisual en árabe, hindi o ruso: el soporte de diez idiomas permite cubrir casos de transcripción que muchos modelos ASR pequeños no abordan.

## Benchmarks y rendimiento

Evaluación sobre LibriSpeech test-clean, 100 clips balanceados por hablante (`speaker_round_robin`), decodificación greedy, Apple M4 Pro, MLX 0.30.6:

| Modelo | WER | CER |
|---|---:|---:|
| Qwen/Qwen3-ASR-1.7B fp16 | 1,94% | 0,57% |
| Este artefacto (8-bit g64) | 1,94% | 0,57% |

Las hipótesis generadas son idénticas a las de fp16 en los 100 clips evaluados. La matriz de cuantización del repositorio (medida sobre la variante de 0,6B) indica que 8 bits es aproximadamente 2,4 veces más rápido que fp16 y 4 bits aproximadamente 2,7 veces más rápido en un clip de 10 segundos. El JSON por muestra de esta evaluación está versionado en `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-1.7B_8bit.json`.

## Requisitos de hardware

- Inferencia exclusivamente en Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max, Ultra) mediante MLX; no hay soporte para CUDA ni ROCm en este artefacto.
- VRAM/memoria unificada estimada: en torno a 2 GB para los pesos cuantizados más el overhead de activaciones y del encoder de audio; se recomienda un mínimo de 8 GB de memoria unificada para operar con comodidad.
- GPU recomendadas: no aplica en el sentido tradicional; el hardware objetivo son los chips de Apple. En un M4 Pro se ha medido la latencia de referencia citada en la model card.
- Cabe en cualquier Mac con chip de Apple Silicon y 8 GB o más de memoria unificada.
- Opciones de despliegue: CLI `mlx-qwen3-asr`, API Python `mlx_qwen3_asr.transcribe()` y servidor HTTP `mlx-qwen3-asr serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Requiere `mlx-qwen3-asr >= 0.4.1`; la reproducción de la evaluación se realizó con la etiqueta `v0.4.3` del repositorio y MLX 0.30.6.
- Latencia y throughput: aproximadamente 2,4 veces más rápido que fp16 en un clip de 10 segundos según la matriz de cuantización del repositorio (medida sobre la variante de 0,6B, no sobre este artefacto de 1,7B).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Este artefacto (Qwen3-ASR-1.7B-mlx-q8) | 1,7B | no disponible | 10 | Apache-2.0 | MLX, Apple Silicon |
| Qwen/Qwen3-ASR-1.7B (fp16) | 1,7B | no disponible | 10 | Apache-2.0 | safetensors, multiplataforma |
| whisper-large-v3 (referencia de la categoría) | 1,55B | 30 s de audio | ~99 | MIT | safetensors, GGUF, multiplataforma |
| whisper-small | 244M | 30 s de audio | ~99 | MIT | safetensors, GGUF, multiplataforma |

La comparación con Whisper se ofrece como referencia de categoría; no se dispone de datos de benchmarks comparativos directos entre Qwen3-ASR y Whisper en la información proporcionada. La ventaja diferencial de este artefacto frente a fp16 es el menor tamaño (2,0 GB frente a 4,4 GB) y la mayor velocidad en Apple Silicon, con calidad de transcripción idéntica en la evaluación publicada.

## Limitaciones y advertencias

- El artefacto solo funciona en Apple Silicon a través de MLX; no es desplegable en GPUs NVIDIA, AMD ni en CPU convencional sin una conversión adicional no documentada.
- La evaluación de calidad se limita a LibriSpeech test-clean en inglés con 100 clips; no hay datos publicados de WER o CER para los otros nueve idiomas ni para audio con ruido, acentos marcados o solapamiento de hablantes.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización; al tratarse de un modelo ASR, puede heredar sesgos acústicos y léxicos del corpus de entrenamiento original, no disponible en la información proporcionada.
- Riesgo de alucinación en pasajes de audio ambiguos, silencios largos o ruido de fondo, comportamiento habitual en modelos ASR autorregresivos; no hay métricas publicadas al respecto para este artefacto.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen/Qwen3-ASR-1.7B y de la librería `mlx-qwen3-asr` por separado.
- El artefacto tiene un número muy bajo de descargas (31) y ningún "like", lo que implica escasa validación por parte de la comunidad; conviene tratarlo como un artefacto de nicho y validar su comportamiento en el dominio concreto antes de usarlo en producción.
- No se dispone de información sobre la longitud máxima de audio procesable ni sobre el contexto del decoder de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Maxkuo/Qwen3-ASR-1.7B-mlx-q8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de la librería MLX: https://github.com/moona3k/mlx-qwen3-asr
- Artefacto de referencia citado en la model card: https://huggingface.co/moona3k/mlx-qwen3-asr-1.7b-8bit
- Evaluación por muestra: `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-1.7B_8bit.json` (en el repositorio de GitHub)
- Matriz de cuantización: `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md` (en el repositorio de GitHub)
