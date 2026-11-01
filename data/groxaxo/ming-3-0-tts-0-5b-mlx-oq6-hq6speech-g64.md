# groxaxo/Ming-3.0-tts-0.5B-MLX-oQ6-HQ6Speech-G64

## Resumen

Ming-3.0-tts-0.5B-MLX-oQ6-HQ6Speech-G64 es una conversión cuantizada del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-0.5B, publicada por el usuario groxaxo. No se trata de un modelo entrenado desde cero, sino de un artefacto de ingeniería pensado para ejecutar TTS en hardware Apple Silicon mediante MLX y la librería mlx-audio. El paquete aplica una asignación de precisión mixta denominada oQ6, con matrices cuantizadas a 6 y 8 bits (grupo 64, formato affine) y 551 tensores preservados exactamente en BF16, entre ellos las cabezas de hablante y de parada, las fronteras del códec y las normas.

El modelo base es un TTS denso de aproximadamente 1.479 millones de parámetros según los pesos safetensors, con soporte para siete idiomas: inglés, chino, alemán, español, francés, coreano y japonés. La conversión mantiene el codificador y decodificador de audio en una asignación calibrada de alta precisión (oQ6 con promociones a 8 bits), mientras que el backbone de texto, la cabeza flow y el agregador quedan comprimidos de forma selectiva. El payload medio almacenado es de 7,261 bits por parámetro original, con un archivo de pesos de 1,343 GB.

Su relevancia es práctica: permite ejecutar un modelo TTS multilingüe en un portátil Apple sin PyTorch ni ONNX Runtime, con un factor de tiempo real (RTF) medido de 0,366 en inglés y 0,371 en español sobre un Apple M5 con 24 GiB de memoria unificada. La licencia MIT heredada del modelo base facilita su uso comercial, aunque las validaciones publicadas son limitadas y de carácter ingenieril.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS denso basado en transformer con backbone de texto, cabeza flow, agregador y códec de audio (encoder/decoder) |
| Parametros totales | 1.479.454.868 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6 mixta: 425 matrices a 6 bits, 204 a 8 bits, 551 tensores en BF16; grupo 64, formato affine; payload medio 7,261 bits por parámetro |
| Idiomas soportados | en, zh, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, mixed-precision) |

## Arquitectura y entrenamiento

El modelo base Ming-3.0-tts-0.5B es un sistema de síntesis de voz denso que combina un backbone transformer para el texto, una cabeza flow para la generación acústica, un agregador y un códec de audio con encoder y decoder. Esta conversión no modifica la arquitectura: parte de una exportación estricta en BF16 de MLX Audio del checkpoint de revisión `8d66b70a00f05ad183fa8a863b4ce609fc83cbc0`, y aplica el cuantizador oMLX (commit `70f44cfd652d2013dc0f9776dca7518e32101b00`) con un adaptador específico para voz.

La calibración se realizó con cuatro enunciados en inglés y español para capturar las entradas reales de las capas Linear en BF16. Para cada proyección del transformer se evaluaron candidatos de 4, 5, 6 y 8 bits con clipping ponderado por importancia de activación, midiendo el error cuadrático medio relativo de salida. Los suelos estructurales por pila y los topes de error local determinan la distribución final. Los primeros códecs oQ5 y oQ4 produjeron dos discrepancias ASR en español; proteger el encoder de referencia las resolvió, y las variantes finales mantienen el decoder oQ6 para preservar la fidelidad numérica de la forma de onda. No se dispone de información sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en siete idiomas: inglés, chino, alemán, español, francés, coreano y japonés.
- Condicionamiento por voz de referencia: acepta `ref_audio`, `ref_text` y `lang_code`, además de un embedding de hablante CAM++ precalculado de 192 valores pasado como `spk_emb`.
- Voces predefinidas, como `US_Emma`, invocables directamente en la generación.
- Generación con `raw_text=True` y control de longitud mediante `max_tokens`.
- Ejecución local offline en Apple Silicon mediante MLX, sin dependencia de PyTorch ni ONNX Runtime en el runtime denso.
- Soporte de decodificación determinista con semilla (`mx.random.seed`).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada general ni modo thinking.

## Casos de uso

- Síntesis de voz local en macOS para prototipos de asistentes: el modelo se carga con `mlx_audio` en un Apple M5 con 24 GiB y genera audio con un RTF de 0,366 en inglés, lo que permite iterar sin conexión ni servicios externos.
- Doblaje y locución multilingüe de contenido corto: al soportar en, zh, de, es, fr, ko y ja, se puede generar una misma frase en varios idiomas para pruebas de maquetación o demos de producto.
- Clonación de voz ligera mediante referencia: pasando `ref_audio` y `ref_text` se condiciona la síntesis a un hablante concreto, útil para pruebas de personalización de asistentes de voz.
- Generación de avisos y notificaciones por voz en aplicaciones de escritorio: la integración con MLX permite empaquetar el modelo en una app nativa de macOS sin runtime de PyTorch.
- Investigación en cuantización de modelos de audio: los archivos `quantization-report.json`, `calibration-sensitivity.json` y `validation.json` documentan por matriz las decisiones de bits y los errores, lo que sirve como caso de estudio reproducible de precisión mixta.
- Evaluación comparativa de códecs de audio: la comparación del decoder protegido frente a BF16 (36,98 dB SNR, correlación 0,999901 en cuatro segundos de voz) permite medir el impacto de la cuantización en la fidelidad de la forma de onda.
- Pruebas de accesibilidad y lectura en voz alta en entornos sin GPU dedicada: el consumo pico de MLX medido es de 1,96 GB, compatible con portátiles de memoria unificada.

## Benchmarks y rendimiento

| Metrica | Ingles | Espanol |
|---|---:|---:|
| Frases estandar con coincidencia ASR | 5/5 | 5/5 |
| RTF | 0,366 | 0,371 |
| Asignacion pico de MLX | 1,96 GB | 1,96 GB |
| Frases nuevas con coincidencia ASR | 3/3 | 3/3 |

Medición sobre Apple M5, 24 GiB de memoria unificada, macOS 27.0.1, MLX Audio 0.6.2 y MLX 0.32.4. El RTF incluye carga y codificación de la referencia y la síntesis con salida evaluada; excluye carga del modelo, warm-up no cronometrado, codificación de archivo, ASR y red. La memoria pico se refiere a asignaciones de MLX, no a RSS. Las 16 muestras generadas terminaron de forma normal y presentaron formas de onda finitas, no silenciosas y sin clipping. El ASR empleado fue Parakeet local, con normalización de mayúsculas, puntuación y acentos. Comparación del decoder del códec protegido frente a BF16: 36,98 dB SNR y correlación 0,999901 sobre cuatro segundos de voz. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 1,96 GB de asignación pico de MLX durante la síntesis, según la validación del autor; el archivo de pesos ocupa 1,343 GB y el repo 1,4 GB.
- Hardware validado: Apple M5 con 24 GiB de memoria unificada y macOS 27.0.1.
- GPU recomendadas: no disponible; el paquete está orientado a Apple Silicon mediante MLX y no se documenta soporte CUDA.
- Compatibilidad con GPU de consumo: cabe en equipos Apple Silicon con memoria unificada suficiente; no se aportan datos para RTX 4090 u otras GPU NVIDIA.
- Opciones de despliegue: `mlx-audio==0.6.2` sobre Python 3.11 con MLX 0.32.4; el autor verificó recarga estricta y síntesis integrada desde una copia reubicada, con caché de Hugging Face vacía y en modo offline, sin importar PyTorch ni ONNX Runtime.
- Latencia y throughput: RTF de 0,366 (inglés) y 0,371 (español), es decir, aproximadamente 2,7 veces más rápido que tiempo real en el hardware validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B-MLX-oQ6-HQ6Speech-G64 | 1.479.454.868 | no disponible | en, zh, de, es, fr, ko, ja | MIT | safetensors MLX (mlx-audio) |
| inclusionAI/Ming-3.0-tts-0.5B (base) | no disponible en la informacion | no disponible | en, zh, de, es, fr, ko, ja | MIT | checkpoint original |
| Otras alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las validaciones publicadas son comprobaciones de ingeniería pequeñas: el ASR no mide acento, naturalidad ni similitud de hablante.
- El propio autor indica que muestras previas en español del runtime original sonaban poco naturales o con acento de España, y que esta cuantización no está demostrada como solución a ese problema.
- La normalización de texto no está portada: los números y unidades deben escribirse con palabras para evitar errores de pronunciación.
- Otros prompts pueden exponer problemas de parada o de pronunciación no detectados en las 16 muestras validadas.
- La extracción automática de embeddings de hablante no está implementada en el runtime denso de MLX Audio; la validación calculó el embedding por separado con el encoder ONNX original.
- Las grabaciones de referencia, los embeddings y el audio generado con voz de referencia no se incluyen en el paquete.
- El códec de alta precisión hace que el paquete sea más grande que una exportación uniforme de 6 bits; es una decisión intencionada del autor.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Licencia MIT heredada de inclusionAI, lo que en principio permite uso comercial, pero conviene auditar los términos del modelo base y de los datos de calibración empleados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/Ming-3.0-tts-0.5B-MLX-oQ6-HQ6Speech-G64
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Cuantizador oMLX: https://github.com/jundot/omlx
- Librería mlx-audio: no disponible enlace directo en la información proporcionada (paquete `mlx-audio==0.6.2`)
- Archivos de auditoría incluidos en el repo: `quantization-report.json`, `calibration.json`, `calibration-sensitivity.json`, `provenance.json`, `validation.json`, `SHA256SUMS`
