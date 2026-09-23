# DedeProGames/SoralASR-23M-Preview

## Resumen

SoralASR-23M-Preview es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el usuario DedeProGames, con 23.062.272 parámetros. Se trata de un encoder-decoder de estilo Whisper reducido (5 capas en el encoder, 5 en el decoder, anchura 256, 4 cabezas de atención) entrenado desde cero, es decir, partiendo de pesos inicializados aleatoriamente y sin cargar ningún peso preentrenado de Whisper. Reutiliza únicamente el vocabulario del tokenizer en inglés de Whisper y su formato de preprocesado (espectrograma log-Mel de 80 bins) por compatibilidad con el ecosistema.

El modelo se entrenó sobre `clean/train.100` de LibriSpeech, aproximadamente 100 horas de voz leída limpia en inglés, durante 50.000 actualizaciones de optimizador en una NVIDIA T4. La ventana acústica máxima es de 20 segundos y solo soporta inglés. El checkpoint publicado corresponde al paso 24.970.

Su relevancia es fundamentalmente experimental y educativa: el propio autor lo marca como «preview» no apto para producción. El WER indicativo en validación es del 98,4 % y los resultados autoinformados en el Open ASR Leaderboard superan el 100 % en todos los conjuntos (lo que indica que las inserciones por repetición pesan más que las palabras correctas). Es, por tanto, un artefacto útil para estudiar arquitecturas ASR pequeñas y modos de fallo, no para transcribir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo Whisper reducido; 5 capas de encoder y 5 de decoder |
| Parametros totales | 23.062.272 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica contexto de texto; ventana acústica máxima de 20 segundos de audio |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones; solo pesos safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Anchura del modelo | 256 |
| Cabezas de atencion | 4 |
| Caracteristicas de entrada | Espectrograma log-Mel de 80 bins |
| Paso del checkpoint publicado | 24.970 |
| Tamano del repositorio | 12,6 GB |
| Descargas / likes | 9 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder con la disposición típica de Whisper, pero con un presupuesto de parámetros muy reducido: 5 capas en cada torre, dimensión de modelo 256 y 4 cabezas de atención. La entrada es un espectrograma log-Mel de 80 bins, idéntico al de Whisper, y el decoder emplea el vocabulario del tokenizer inglés de Whisper. La diferencia clave respecto a Whisper es que no se cargaron pesos preentrenados: encoder, decoder y proyecciones se inicializaron aleatoriamente y se entrenaron desde cero, de ahí la etiqueta `from-scratch`.

El entrenamiento usó LibriSpeech ASR `clean/train.100`, unas 100 horas de voz leída limpia, con 50.000 actualizaciones de optimizador en una NVIDIA T4, tamaño de lote efectivo de 8 enunciados y 15.699.868 tokens de decoder procesados. El checkpoint publicado no es el final, sino el que obtuvo mejor puntuación en una validación reducida. No se documenta en la información disponible el uso de RLHF, DPO ni de ninguna técnica de alineación; tampoco se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz en inglés: convierte audio mono a 16 kHz en texto, con una ventana acústica de 20 segundos por fragmento.
- Procesado de audio largo mediante chunking solapado: el `pipeline` admite `chunk_length_s=20` y `stride_length_s=(2, 2)` para dividir y recomponer grabaciones largas.
- Reutilización del tokenizer y del preprocesado de Whisper, lo que facilita la integración con herramientas existentes para ese formato.
- Compatibilidad con el ecosistema `transformers` y con el tag `endpoints_compatible`, por lo que puede desplegarse mediante Inference Endpoints.
- No soporta tool calling, function calling ni uso como agente: es un modelo puramente ASR.
- No tiene modo de razonamiento, visión, audio generativo ni capacidades multimodales más allá de la entrada de audio.
- Multilingüismo: no disponible; solo inglés.
- Calidad real de transcripción muy baja; la decodificación muestra repeticiones y alucinaciones documentadas por el autor.

## Casos de uso

- Investigación en arquitecturas ASR desde cero: sirve como referencia reproducible de un encoder-decoder Whisper-like de 23 M de parámetros para estudiar cómo escala el WER con 100 horas de datos limpios y 50.000 pasos de optimización.
- Entrenamiento continuado y fine-tuning: al estar bajo licencia Apache-2.0 y en formato safetensors estándar, puede usarse como punto de partida para ajuste con dominios propios (por ejemplo, audio técnico muy controlado).
- Validación de tooling interno: permite comprobar que un `pipeline` de `transformers` con chunking y stride funciona correctamente en la versión de la librería instalada, sin depender de la calidad del resultado.
- Benchmarking de infraestructura y throughput: con un modelo de 92 MB en fp32 se puede medir RTFx en distintas GPU (el autor reporta entre 45 y 130 en T4 según el conjunto) para calibrar colas de inferencia y autoescalado.
- Docencia y divulgación: al caber en memoria de cualquier portátil, permite inspeccionar pesos, atención y vocabulario en un sistema ASR completo de principio a fin.
- Reproducción de la evaluación Open ASR Leaderboard: el fichero `.eval_results/open_asr_leaderboard.yaml` del repositorio permite reproducir el scorer y el pipeline de normalización sobre los ocho conjuntos cortos en inglés.
- Estudio de modos de fallo: la decodificación repetitiva y las alucinaciones documentadas lo convierten en un caso de análisis para investigar bucles de generación en modelos pequeños con ventana de 20 segundos.
- Prototipos de demostración con audio limpio y controlado: útil en demos internas donde la exactitud de la transcripción no es un requisito funcional.

## Benchmarks y rendimiento

Evaluación indicativa de selección de checkpoint, autoinformada por el autor:

| Evaluacion | Unidades | WER (%) | Notas |
|---|---:|---:|---|
| LibriSpeech clean validation (primeras 96 locuciones) | 96 | 98,4 | Selección de checkpoint; no es una evaluación completa |

Resultados autoinformados en el Open ASR Leaderboard (T4, 2026-09-23; no verificados de forma independiente y sin posición oficial):

| Conjunto / split | Unidades evaluadas | WER (%) | RTFx (T4) |
|---|---:|---:|---:|
| LibriSpeech test.clean | 2.620 | 121,47 | 98,18 |
| LibriSpeech test.other | 2.939 | 114,16 | 130,07 |
| AMI-cleaned test | 7.715 | 107,83 | 124,47 |
| Earnings22-Cleaned-AA-chunked test | 6 sesiones / 341 chunks | 131,76 | 45,08 |
| GigaSpeech-cleaned test | 18.757 | 119,69 | 124,43 |
| SPGISpeech test (4 shards) | 39.341 | 124,37 | 129,51 |
| VoiceArena Monsoon en-IN test | 2.102 | 124,35 | 99,25 |
| VoxPopuli | no disponible | no disponible | no disponible |

Los valores de WER superiores al 100 % implican que el número de inserciones (texto repetido o alucinado) es mayor que el de aciertos, es decir, el resultado es peor que no transcribir nada. El autor indica que, a fecha de 2026-09-23, el modelo no aparecía ni en el leaderboard del dataset del Hub ni en el CSV de resultados del Space.

## Requisitos de hardware

- VRAM estimada en inferencia: 92,2 MB en fp32 y 46,1 MB en fp16/bf16 para los pesos; con activaciones el consumo real se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquiera. El modelo se entrenó en una NVIDIA T4 y esa GPU es más que suficiente; A100, H100 o RTX 4090 están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en CPU. Modelos de 23 M de parámetros no presentan problema de memoria.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` y chunking de 20 s; también compatible con Inference Endpoints según los tags del repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni whisper.cpp con este checkpoint.
- Latencia y throughput: el autor reporta RTFx entre 45,08 y 130,07 en T4 según el conjunto de evaluación, con el valor más bajo en Earnings22 (audio más largo y con chunking).
- Nota sobre el repositorio: el tamaño declarado es de 12,6 GB, muy superior a los 92 MB de los pesos en fp32, lo que sugiere que incluye artefactos de entrenamiento (estados de optimizador, checkpoints intermedios u otros ficheros) no necesarios para inferencia.

## Comparativa con modelos similares

La comparación se establece con los modelos Whisper de OpenAI, que son la referencia arquitectónica directa. Los datos de los modelos Whisper son de conocimiento público general y no se han verificado en la información proporcionada; se marcan como referencia externa.

| Modelo | Parametros | Arquitectura | Idioma | Licencia | WER en LibriSpeech test.clean |
|---|---:|---|---|---|---|
| SoralASR-23M-Preview | 23.062.272 | Whisper-like reducido, 5+5 capas | Inglés | apache-2.0 | 121,47 % (autoinformado) |
| Whisper tiny / tiny.en | ~39 M (referencia externa) | Whisper encoder-decoder, 4+4 capas | Multilingüe / inglés | no disponible en esta ficha | No disponible; publicado muy inferior, en el rango de un dígito según la publicación original (dato no verificado aquí) |
| Whisper base / base.en | ~74 M (referencia externa) | Whisper encoder-decoder, 6+6 capas | Multilingüe / inglés | no disponible en esta ficha | No disponible (dato externo no verificado) |
| Kiyo-230M-Preview (mismo autor) | ~230 M | Decoder-only, LLM | No disponible | No disponible | No aplica: no es un modelo ASR |

Frente a Whisper tiny, este modelo tiene un 41 % menos de parámetros y licencia Apache-2.0 explícita, pero su calidad de transcripción está a órdenes de magnitud por debajo. No se dispone de otros modelos comparables de 23 M de parámetros entrenados desde cero con los que contrastar en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que es un checkpoint experimental de investigación, no apto para producción, y que su calidad de transcripción actual es limitada.
- WER indicativo del 98,4 % en validación y WER superior al 100 % en todos los conjuntos del Open ASR Leaderboard autoinformado: el modelo produce más inserciones que aciertos.
- Decodificación repetitiva y frases alucinadas observadas de forma explícita en la evaluación del autor.
- Dominio de entrenamiento muy estrecho: únicamente voz de audiolibro limpia y leída. Se esperan errores graves con ruido, acentos, habla conversacional, música, solapamiento de hablantes y audio no inglés.
- Sin garantía de exactitud de ningún tipo; no debe usarse en aplicaciones donde un error de transcripción tenga consecuencias materiales o de seguridad.
- Ventana acústica limitada a 20 segundos: el audio más largo debe trocearse con solapamiento; si se pasa audio largo a un camino que trunca silenciosamente, se perderá contenido.
- Entrada esperada: voz mono en inglés a 16 kHz; aunque el procesador puede remuestrear, el rendimiento fuera de esas condiciones no está caracterizado.
- Sesgos conocidos: no documentados explícitamente en la información disponible, más allá del sesgo de dominio derivado de LibriSpeech (locutores de audiolibros en inglés).
- Licencia Apache-2.0: permite uso comercial a nivel de licencia del modelo, pero la calidad actual hace inviable ese uso en la práctica.
- Requisitos de atribución: LibriSpeech está bajo CC BY 4.0 (Panayotov et al., ICASSP 2015) y el vocabulario del tokenizer y el preprocesado derivan de OpenAI Whisper.
- Descargas y adopción muy bajas (9 descargas, 1 like) y ausencia en los leaderboards oficiales a fecha de publicación; no hay validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/SoralASR-23M-Preview
- Perfil del autor en Hugging Face: https://huggingface.co/DedeProGames
- Dataset de entrenamiento (LibriSpeech ASR): https://huggingface.co/datasets/openslr/librispeech_asr
- Tokenizer y preprocesado de referencia (OpenAI Whisper): https://github.com/openai/whisper
- Resultados estructurados de evaluación: https://huggingface.co/DedeProGames/SoralASR-23M-Preview/blob/main/.eval_results/open_asr_leaderboard.yaml
- Scorer del Open ASR Leaderboard: https://github.com/huggingface/open_asr_leaderboard/blob/main/normalizer/eval_utils.py
- Benchmark dataset card: https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
- Space del Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- CSV de resultados en inglés short-form: https://huggingface.co/datasets/hf-audio/open-asr-leaderboard-results/blob/main/english_short_latest.csv
- Job de evaluación LibriSpeech test.clean: https://huggingface.co/jobs/DedeProGames/6ab3abc751992417dfcd6f0a
- Job de evaluación LibriSpeech test.other: https://huggingface.co/jobs/DedeProGames/6ab3ad7452d0dbd7f1d84447
- Job de evaluación AMI-cleaned: https://huggingface.co/jobs/DedeProGames/6ab3ad8752d0dbd7f1d8444c
- Job de evaluación Earnings22: https://huggingface.co/jobs/DedeProGames/6ab3a96351992417dfcd6e79
- Job de evaluación GigaSpeech: https://huggingface.co/jobs/DedeProGames/6ab3acbd51992417dfcd6f4e
- Job de evaluación VoiceArena Monsoon en-IN: https://huggingface.co/jobs/DedeProGames/6ab3ad9b51992417dfcd6f9e
- Referencia de LibriSpeech: Panayotov et al., «LibriSpeech: An ASR Corpus Based on Public Domain Audio Books», ICASSP 2015
- Licencia de LibriSpeech (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
