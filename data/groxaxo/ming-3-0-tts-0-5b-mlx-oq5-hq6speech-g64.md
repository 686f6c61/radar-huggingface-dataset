# groxaxo/Ming-3.0-tts-0.5B-MLX-oQ5-HQ6Speech-G64

## Resumen

Ming-3.0-tts-0.5B-MLX-oQ5-HQ6Speech-G64 es una conversión cuantizada del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-0.5B, publicada por el usuario groxaxo. Se trata de un modelo denso de text-to-speech adaptado al ecosistema MLX de Apple, con una asignación de precisión mixta específica para audio que combina matrices de 5, 6 y 8 bits junto con 551 tensores preservados en BF16. El paquete ocupa 1,3 GB en el repositorio y el archivo de pesos pesa 1,261 GB.

El modelo resuelve el problema de ejecutar TTS de calidad en hardware Apple Silicon mediante MLX, sin depender de PyTorch ni de ONNX Runtime en tiempo de inferencia. La cuantización no es uniforme: emplea formato afín con tamaño de grupo 64 y una carga útil media de 6,816 bits por parámetro fuente, incluyendo metadatos. La decodificación de audio mantiene una asignación oQ6 protegida para preservar la fidelidad de la forma de onda.

Es relevante para desarrolladores que necesitan síntesis de voz local y portable en Mac, con soporte para siete idiomas (inglés, chino, alemán, español, francés, coreano y japonés) y condicionamiento por voz de referencia. La licencia MIT heredada del modelo base facilita su integración comercial. No obstante, se trata de una conversión de ingeniería con validación limitada, no de un modelo nuevo entrenado desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codec de audio (text-to-speech), adaptado a MLX |
| Parametros totales | 1.479.454.868 (1,48 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oMLX: matrices de 5, 6 y 8 bits con grupo 64; 551 tensores en BF16; promedio de 6,816 bits por parámetro |
| Idiomas soportados | en, zh, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con código personalizado (custom_code) |

## Arquitectura y entrenamiento

El modelo base es un sistema de síntesis de voz de arquitectura transformer densa con un codec de audio asociado, que incluye un codificador de referencia (reference encoder), un decodificador de waveform y cabezas de hablante y de parada. La conversión a MLX reorganiza estos componentes en un grafo compatible con mlx-audio, manteniendo intactos los límites del codec y los tensores de control que no forman parte del backbone transformer.

El proceso de cuantización emplea el cuantizador oMLX en el commit 70f44cfd, partiendo de una exportación BF16 estricta del checkpoint de revisión 8d66b70a. Se usaron cuatro locuciones de calibración en inglés y español para capturar entradas reales de las capas Linear; para cada proyección se evaluaron candidatos de 4, 5, 6 y 8 bits con recorte ponderado por importancia de activación, midiendo el error cuadrático medio relativo de salida. La distribución final resulta de pisos estructurales por pila y topes de error local definidos por oMLX. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset ni uso de RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en siete idiomas: inglés, chino, alemán, español, francés, coreano y japonés.
- Condicionamiento por voz de referencia mediante `ref_audio` y `ref_text`, con soporte para un embedding de hablante CAM++ precalculado de 192 valores (`spk_emb`).
- Selección de voz predefinida (por ejemplo, `US_Emma`).
- Modo de texto crudo (`raw_text=True`) para evitar normalización textual.
- Control de longitud de generación mediante `max_tokens`.
- Ejecución local en Apple Silicon a través de MLX, sin dependencia de PyTorch ni ONNX Runtime durante la inferencia.
- Carga estricta del modelo (`strict=True`) con recarga verificada desde caché vacía y modo offline.

## Casos de uso

- Síntesis de voz local en Mac: el modelo se ejecuta íntegramente sobre MLX en Apple Silicon, con una asignación de memoria MLX pico medida de 1,88 GB, lo que permite generar audio sin conexión en equipos con memoria unificada moderada.
- Generación de audiolibros y contenido narrado en varios idiomas: al soportar siete idiomas y condicionamiento por voz, puede producir narraciones con una voz de referencia consistente a lo largo de un texto largo.
- Prototipado de asistentes de voz: la API de mlx-audio permite integrar la síntesis en pipelines de conversación, generando respuestas habladas a partir de texto producido por un LLM.
- Doblaje y localización de contenido: el soporte de inglés, español, francés, alemán, coreano, chino y japonés permite generar pistas de voz en distintos idiomas a partir de un mismo guion.
- Pruebas de accesibilidad: generación de audio para lectores de pantalla o interfaces accesibles en aplicaciones macOS, aprovechando la ejecución local y la licencia MIT.
- Investigación en cuantización de modelos de audio: el paquete incluye informes de calibración y sensibilidad que permiten estudiar el impacto de la precisión mixta en la calidad de la waveform.
- Integración en herramientas de desarrollo para macOS: al instalarse vía pip con mlx-audio 0.6.2, puede incorporarse en scripts y aplicaciones Python que requieran TTS sin servicios en la nube.

## Benchmarks y rendimiento

Los datos de validación publicados por el autor se midieron en un Apple M5 con 24 GiB de memoria unificada, macOS 27.0.1, MLX Audio 0.6.2 y MLX 0.32.4:

| Idioma | Frases estándar | RTF | Asignación MLX pico | Frases nuevas con coincidencia ASR |
|---|---:|---:|---:|---:|
| Inglés | 5/5 coincidencias ASR | 0,364 | 1,88 GB | 3/3 |
| Español | 5/5 coincidencias ASR | 0,360 | 1,88 GB | 3/3 |

Además, la comparación del decodificador del codec protegido frente a BF16 midió 36,98 dB de SNR y una correlación de 0,999901 sobre cuatro segundos de habla. Las 16 muestras generadas terminaron de forma normal y presentaron waveforms finitas, no silenciosas y sin recorte. El ASR empleado fue Parakeet local, con normalización de mayúsculas, puntuación y acentos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: asignación MLX pico de 1,88 GB durante la síntesis, medida en Apple M5 con 24 GiB de memoria unificada.
- Hardware validado: Apple Silicon (serie M) con MLX; la validación concreta se realizó en un M5.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este paquete, que está orientado a MLX y Apple Silicon.
- Compatibilidad con GPU de consumo: el modelo está pensado para memoria unificada de Apple Silicon; no se documenta soporte para GPU NVIDIA.
- Despliegue: mlx-audio 0.6.2 sobre Python 3.11, con MLX 0.32.4; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,364 en inglés y 0,360 en español, incluyendo carga y codificación de la referencia y síntesis con salida evaluada, pero excluyendo la carga del modelo, el calentamiento no cronometrado, la codificación de archivos, el ASR y la red.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B-MLX-oQ5-HQ6Speech-G64 | 1,48 mil millones | no disponible | 7 | MIT | safetensors MLX | Hugging Face (43 descargas) |
| inclusionAI/Ming-3.0-tts-0.5B (base) | no disponible en la información | no disponible | 7 | MIT | no disponible | Hugging Face |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- La validación es limitada: se basa en pruebas de ASR sobre un número reducido de frases (5 estándar y 3 nuevas por idioma), que no miden acento, naturalidad ni similitud de hablante.
- El autor indica que muestras previas en español del runtime original sonaban poco naturales o con acento de España, y no se ha establecido que esta cuantización lo corrija.
- No se ha portado la normalización de texto: los números y unidades deben escribirse con palabras para evitar errores de pronunciación.
- La extracción automática del embedding de hablante no está implementada en el runtime denso de MLX Audio; debe calcularse por separado con el codificador ONNX original.
- Las grabaciones de referencia, los embeddings y el audio generado con voz de referencia no se incluyen en el paquete.
- Otros prompts pueden provocar problemas de parada o de pronunciación no detectados en la validación.
- El paquete es más grande que una exportación uniforme de 5 bits debido al codec de alta precisión, lo que es intencionado.
- Riesgo de alucinación y sesgos: no se documentan sesgos conocidos ni comportamiento ante entradas adversas en la información disponible.
- Licencia MIT heredada de inclusionAI, lo que permite uso comercial, pero conviene auditar los archivos de procedencia y calibración incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Ming-3.0-tts-0.5B-MLX-oQ5-HQ6Speech-G64
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Cuantizador oMLX: https://github.com/jundot/omlx
- Librería mlx-audio: no disponible como enlace directo en la información (se instala con `pip install "mlx-audio==0.6.2"`)
