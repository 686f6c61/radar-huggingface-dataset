# itzune/pocket-tts-basque-onnx

## Resumen

Pocket TTS Basque — ONNX es la exportación a ONNX de `itzune/pocket-tts-basque`, un modelo de síntesis de voz (text-to-speech) en euskera construido sobre la arquitectura Pocket TTS de Kyutai. Lo desarrolla el usuario itzune y su objetivo es permitir síntesis de voz en euskera en streaming sobre CPU con únicamente `onnxruntime`, sin necesidad de instalar PyTorch. Los pesos son los mismos que los del modelo original: mismas cinco voces incluidas y misma clonación de voz zero-shot.

El paquete contiene cinco grafos ONNX (backbone transformer, cabeza de flow-matching, encoder Mimi, decoder Mimi y acondicionador de texto) en versiones fp32 e int8, además del tokenizador SentencePiece de 4.000 tokens, las cinco voces en safetensors y un runtime de referencia en Python (`pocket_tts_onnx.py`, Apache-2.0, procedente de `KevinAHM/pocket-tts-onnx`). El resultado es un bundle de unos 160 MB en int8 y unos 440 MB en fp32, frente a los varios GB de una instalación de PyTorch.

Es relevante ahora porque reduce el coste de despliegue de TTS neuronal en euskera a un contenedor ligero de CPU: la primera muestra de audio sale en torno a 0,07-0,09 s y la generación va a 3,5-4,4 veces el tiempo real con dos hilos. El modelo base es un transformer de 6 capas con cabeza de flow-matching sobre el códec neuronal Mimi, con voces de estudio del corpus HiTZ-Aholab y entrenado con el dataset BSSD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas (backbone Pocket TTS) con cabeza de flow-matching y códec neuronal Mimi (encoder/decoder) |
| Parametros totales | no disponible (el autor solo indica backbone de 6 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación por tramas latentes en streaming) |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica de MatMul) |
| Idiomas soportados | euskera (eu) únicamente |
| Licencia | CC-BY-4.0 (pesos); runtime `pocket_tts_onnx.py` Apache-2.0; dataset BSSD CC-BY-SA-4.0 |
| Formato de pesos | ONNX (`.onnx`), voces en safetensors, metadatos en JSON/NPY, tokenizador SentencePiece |
| Frecuencia de muestreo de audio | 24 kHz |
| Voces incluidas | 5: Maider, Antton, Nahia, Ane, Aitor |
| Tokenizador | SentencePiece, 4.000 tokens |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pocket TTS de Kyutai, dividida en grafos separados para poder ejecutarse en streaming: `flow_lm_main` es el backbone transformer de 6 capas que recibe el texto tokenizado y la condicionación de voz y emite una trama latente por paso; `flow_lm_flow` es la cabeza de flow-matching que muestrea cada latente; `text_conditioner` aporta los embeddings de tokens; y `mimi_encoder` / `mimi_decoder` implementan el códec neuronal Mimi, que convierte una muestra de voz en latentes (para clonación) y los latentes en audio a 24 kHz de forma incremental. El bundle incluye además `bos_before_voice.npy`, un vector BOS aprendido que se inserta antes de la condicionación de voz.

Los datos de entrenamiento del modelo base no se detallan en la información disponible más allá de que se usó el dataset BSSD (`itzune/bssd`) y de que las voces Maider y Antton provienen del corpus de estudio HiTZ-Aholab. El autor indica que el modelo se entrenó con voz sintética, y no documenta número de tokens, composición del dataset ni si hubo RLHF o DPO. La exportación se realizó con el exportador comunitario `lomotron/pocket-tts-onnx-export` (commit fijado, con un pequeño arreglo para exportar desde fichero de configuración) a partir del `basque.yaml` publicado, y cada grafo se verificó contra el modelo PyTorch dentro de tolerancia antes de cuantizar. La cuantización int8 usa cuantización dinámica de MatMul y el runtime de referencia mantiene siempre el encoder Mimi y el acondicionador de texto en fp32.

## Capacidades

- Síntesis de voz en euskera a partir de texto, con salida de audio a 24 kHz.
- Streaming real: `tts.stream()` devuelve audio conforme se genera, con la primera porción tras dos tramas latentes, de modo que la reproducción puede empezar antes de terminar la frase.
- Clonación de voz zero-shot a partir de un clip de 5-10 s de habla limpia en euskera, usando `mimi_encoder`.
- Cinco voces preentrenadas incluidas (Maider, Antton, Nahia, Ane, Aitor) cargables como safetensors.
- Ejecución solo en CPU con `onnxruntime`, sin PyTorch ni GPU.
- Dos niveles de precisión intercambiables (`precision="int8"` y `precision="fp32"`) sobre los mismos pesos.
- Parametrización de la temperatura de muestreo (0,3 por defecto para este modelo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la clonación.

## Casos de uso

- Lectura de contenidos en euskera para accesibilidad: integrar el modelo en un lector de pantalla o en una web para convertir artículos y avisos en audio, aprovechando que corre en CPU y que el streaming permite empezar a reproducir en unas décimas de segundo.
- Asistentes de voz on-device en euskera: aplicaciones de escritorio o dispositivos embebidos con CPU que necesiten TTS sin conexión y sin dependencias pesadas; el bundle int8 de ~160 MB cabe en imágenes de contenedor pequeñas.
- Doblaje y localización al euskera: clonar la voz de un locutor con un clip de 5-10 s y generar las líneas traducidas manteniendo el timbre, como paso de preproducción antes de una mezcla final.
- Anuncios e información en transporte público o comercios: generación de avisos pregrabados o dinámicos en euskera estándar, con la normalización de números y fechas delegada a `bssd.text_norm` antes de la síntesis.
- Audiolibros y pódcasts generados: síntesis por lotes de textos largos troceados en frases, con elección de voz por personaje o sección; el rendimiento de 3,5-4,4× tiempo real permite generar horas de audio en una fracción del tiempo.
- Aplicaciones educativas de aprendizaje del euskera: reproducción de vocabulario y frases con pronunciación consistente y varias voces para ejercicios de escucha.
- Sistemas IVR y atención telefónica: respuestas habladas en euskera en centralitas, donde el coste por licencia CC-BY-4.0 y la ejecución en CPU abaratan el escalado horizontal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo TTS. El autor sí publica una medición de velocidad con `scripts/bench_onnx.py` (tres frases de 1-7 s, voz Maider, streaming, solo generación, tras calentamiento) en una CPU x86 de portátil de 8 núcleos, comparando con el modelo PyTorch en la misma máquina:

| Runtime | Hilos | Primer audio | Velocidad (× tiempo real) |
|---|---|---|---|
| ONNX int8 | 2 | 0,07 s | 4,4× |
| ONNX fp32 | 2 | 0,09 s | 3,5× |
| PyTorch fp32 | 2 | 0,07 s | 6-7× |
| PyTorch int8 (`--quantize`) | 4 | 0,03-0,05 s | 8× |

El runtime ONNX es más lento que PyTorch, pero sigue varias veces por encima del tiempo real y con un tamaño de instalación mucho menor (unos 150 MB para `onnxruntime` y dependencias, frente a varios GB de PyTorch). No se han publicado métricas de calidad objetiva (MOS, WER de ASR) para esta exportación.

## Requisitos de hardware

- Inferencia en CPU: es el escenario objetivo. El benchmark se hizo en una CPU x86 de 8 núcleos; no se documenta el modelo concreto.
- VRAM: no se requiere GPU. El modelo está pensado para ejecutarse en CPU con `onnxruntime`.
- Memoria en disco: ~160 MB de pesos para `precision="int8"` (encoder Mimi y acondicionador de texto en fp32) y ~440 MB para `precision="fp32"`; el repo completo ocupa 0,6 GB.
- GPU: no se documenta soporte ni rendimiento con CUDA Execution Provider, TensorRT o similar; no disponible.
- Despliegue: `onnxruntime` (CPU) más `numpy`, `sentencepiece`, `safetensors`, `huggingface_hub` y `soundfile`, con el runtime de referencia `pocket_tts_onnx.py`. No es compatible con sherpa-onnx tal cual, porque el modelo inserta un vector BOS aprendido antes de la voz que esa implementación no aplica. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplican a TTS).
- Latencia y throughput: primer audio en 0,07 s (int8, 2 hilos) y 0,09 s (fp32); 4,4× y 3,5× tiempo real respectivamente. Con 4 hilos y cuantización en PyTorch se llega a 8×, pero esa cifra corresponde al modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| itzune/pocket-tts-basque-onnx (este) | no disponible (6 capas) | no disponible | eu | ONNX | CC-BY-4.0 | CPU, streaming, 5 voces, clonación; 160 MB int8 |
| itzune/pocket-tts-basque | no disponible (6 capas) | no disponible | eu | PyTorch | CC-BY-4.0 | Mismos pesos; 6-8× tiempo real, requiere PyTorch (varios GB) |
| KevinAHM/pocket-tts-onnx (Kyutai Pocket TTS) | no disponible | no disponible | no disponible en la información | ONNX | Apache-2.0 (runtime) | Exportación comunitaria de referencia; su runtime se reutiliza aquí; temperatura por defecto 0,7 |
| Pocket TTS de Kyutai (upstream) | no disponible | no disponible | no disponible en la información | PyTorch | no disponible en la información | Pesos originales de los que deriva toda la familia |

No se dispone de datos sobre otros sistemas TTS en euskera en la información proporcionada, por lo que no se incluye una comparación con alternativas como Piper o Coqui; no disponible.

## Limitaciones y advertencias

- Solo euskera: las palabras en otros idiomas (code-switching) se pronuncian con fonética vasca.
- Entre un 1 % y un 2 % de las frases se generan como continuación del clip de referencia en lugar de leer el texto de entrada; requiere mitigación en producción (detección por ASR, reintentos).
- Entrenado con voz sintética, lo que puede introducir artefactos o una prosodia menos natural que la de un corpus grabado íntegramente por humanos.
- El texto debe escribirse tal como se lee: números, fechas, abreviaturas y símbolos han de ir deletreados en palabras (`hogeita lau`, no `24`). El normalizador del dataset, `bssd.text_norm`, hace esta labor para euskera estándar.
- La cuantización int8 se validó de oído y con ASR sobre las frases del benchmark, no con la evaluación completa del modelo PyTorch; la calidad puede degradarse en textos fuera de ese conjunto.
- No es compatible con sherpa-onnx sin modificaciones, por el vector BOS previo a la voz (`bos_before_voice.npy`).
- Licencia CC-BY-4.0 en los pesos: el uso comercial está permitido con atribución a itzune, a los pesos upstream de Pocket TTS (Kyutai) y al corpus HiTZ-Aholab para las voces Maider y Antton. El dataset BSSD es CC-BY-SA-4.0, con la cláusula de compartir igual que pueda afectar a trabajos derivados sobre datos.
- La clonación de voz exige derechos sobre la voz clonada; el autor lo advierte explícitamente.
- Sesgos: las cinco voces provienen de un corpus de estudio (HiTZ-Aholab) y de voz sintética, por lo que la variedad de acentos, edades y registros es reducida y no representa la diversidad dialectal del euskera.
- Riesgo de alucinación acústica: el modelo puede producir audio plausible que no corresponde al texto de entrada, especialmente en frases largas o con puntuación atípica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzune/pocket-tts-basque-onnx
- Modelo base (PyTorch): https://huggingface.co/itzune/pocket-tts-basque
- Dataset BSSD: https://huggingface.co/datasets/itzune/bssd
- Runtime de referencia y exportación ONNX de Kyutai Pocket TTS: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Exportador comunitario: https://github.com/lomotron/pocket-tts-onnx-export
- Repositorio del modelo base (script `scripts/export_onnx.sh`): https://github.com/itzune/pocket-tts-basque
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo; no se han podido añadir papers, blogs ni demos adicionales.
