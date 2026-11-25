# Korla/whisper-large-turbo-v3-dsb-v1

## Resumen

Korla/whisper-large-turbo-v3-dsb-v1 es un modelo de reconocimiento automatico del habla (ASR) derivado de openai/whisper-large-v3-turbo, afinado especificamente para bajo sorabo (dsb), una lengua minoritaria eslava hablada en la region de Lusacia, en Alemania. El modelo lo publica Korla Baier en colaboracion con el Serbski Institut (Instituto Sorabo), en el marco del proyecto "Hauptphase I zur Weiterentwicklung der automatischen Spracherkennung fur Nieder- und Obersorbisch" (2026), orientado a desarrollar ASR para bajo y alto sorabo.

El problema que resuelve es concreto: Whisper no soporta el bajo sorabo de forma nativa, por lo que sin un ajuste fino la transcripcion resulta inutilizable. Este modelo parte de los pesos de whisper-large-v3-turbo (808,8 millones de parametros) y los especializa mediante fine-tuning supervisado sobre un corpus de 30 horas de audio de 28 hablantes, alcanzando aproximadamente un 5 % de WER en su conjunto de test.

Es relevante ahora porque demuestra la viabilidad de adaptar un modelo ASR multilingue de gran tamano a lenguas de bajos recursos con un volumen de datos modesto, y porque es un modelo independiente del anterior Korla/whisper-large-v3-turbo-dsb, entrenado sobre datos nuevos. Su utilidad practica queda acotada a un unico idioma y a un dominio de datos muy especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizaciones derivadas de Whisper, no documentadas por el autor) |
| Idiomas soportados | bajo sorabo (dsb); requiere forzar `language="polish"` en la inferencia |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, disenado para procesar ventanas de audio de 30 segundos y generar transcripciones autoregresivas. No incorpora innovaciones arquitectonicas propias; el trabajo consiste integramente en un ajuste fino supervisado sobre los pesos del modelo base de OpenAI.

El entrenamiento se realizo con learning rate de 1e-5, warmup del 5 %, batch size de 32 y 3 epocas. Todo el texto fue normalizado a minusculas y se elimino la puntuacion. Los datos proceden de fuentes privadas del Serbski Institut, de Recyny Centrum WITAJ y de Ludowe Nakladnistwo Domowina, agregados en el dataset Serbski-institut/dsb_audio_corpus: 30 horas de audio de 28 hablantes. El conjunto de test es una muestra aleatoria del 5 % de los datos y los hablantes de test tambien aparecen en entrenamiento, por lo que el WER reportado refleja rendimiento sobre hablantes conocidos y no sobre hablantes no vistos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en bajo sorabo (dsb), unico idioma objetivo del ajuste.
- Reconocimiento de habla sobre segmentos de audio de hasta 30 segundos por ventana, segun la arquitectura Whisper.
- Salida de texto normalizado: minusculas y sin puntuacion, tal como se entreno.
- Integracion directa con la pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- Ejecucion en GPU (`device="cuda"`) o CPU (`device=-1`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo thinking.
- Capacidad multilingue limitada al bajo sorabo; el prompt en polaco es un artefacto del entrenamiento, no una capacidad real de transcripcion en polaco.

## Casos de uso

- Transcripcion de archivos de audio en bajo sorabo para archivos y museos: el modelo permite convertir grabaciones historicas o etnograficas en texto digitalizado, aprovechando que fue entrenado sobre el corpus del Serbski Institut y fuentes culturales sorabas.
- Subtitulado de contenido audiovisual en bajo sorabo: adecuado para television, radio o video divulgativo en esta lengua, con la salvedad de que la salida carece de puntuacion y mayusculas y requerira postprocesado.
- Investigacion linguistica de corpus: permite generar transcripciones a escala de grabaciones de habla soraba para analisis fonetico, lexico o morfologico, con un WER de referencia del 5 % sobre hablantes conocidos.
- Preservacion de lenguas minoritarias: util como componente base en proyectos de documentacion y revitalizacion del bajo sorabo, dado su caracter de recurso abierto bajo CC BY-SA 4.0.
- Accesibilidad en servicios publicos regionales: transcripcion de interacciones orales en bajo sorabo en entornos de Lusacia donde esta lengua coexiste con el aleman.
- Evaluacion comparativa de ASR de bajos recursos: sirve como referencia para medir el efecto de fine-tuning con 30 horas de audio sobre un modelo Whisper turbo en una lengua de bajos recursos.
- Prototipado de asistentes de voz en bajo sorabo: el modelo puede usarse como bloque ASR en un pipeline mayor, aunque su falta de puntuacion y su limitacion a hablantes conocidos exigen validacion previa.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| WER en test | ~5 % | Muestra aleatoria del 5 % del corpus; hablantes de test presentes en entrenamiento |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos ASR para bajo sorabo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,2 GB solo para pesos, mas memoria de activaciones y buffers de audio; en la practica, 4-6 GB son suficientes.
- En fp16/bf16: en torno a 1,6-2 GB de pesos, con margen para activaciones; cabe en GPUs consumer de gama media.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 para procesamiento por lotes de alto throughput.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: pipeline de Transformers, vLLM (soporte ASR segun version), llama.cpp no aplica de forma nativa a Whisper salvo mediante conversiones especificas, TGI segun soporte de arquitectura Whisper.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Korla/whisper-large-turbo-v3-dsb-v1 | 808,9 M | ventana de 30 s (Whisper) | bajo sorabo | CC BY-SA 4.0 | ~5 % WER en test con hablantes conocidos |
| openai/whisper-large-v3-turbo | 809 M | ventana de 30 s | multilingue (sin bajo sorabo nativo) | MIT (modelo base) | No soporta bajo sorabo sin ajuste |
| Korla/whisper-large-v3-turbo-dsb | no disponible | ventana de 30 s | bajo sorabo | no disponible | Modelo anterior e independiente, segun el autor |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de WER no es posible.

## Limitaciones y advertencias

- El WER del ~5 % se mide sobre hablantes presentes en entrenamiento; el rendimiento sobre hablantes nuevos sera previsiblemente peor y no esta cuantificado.
- La salida esta normalizada: sin puntuacion ni mayusculas, lo que limita su uso directo en produccion sin postprocesado.
- El modelo solo transcribe bajo sorabo; forzar `language="polish"` es un requisito tecnico del entrenamiento, no una garantia de calidad en polaco.
- Corpus de entrenamiento pequeno (30 horas, 28 hablantes) y de dominio acotado, lo que puede degradar el rendimiento en acentos, ruido o registros no representados.
- Riesgo de alucinacion propio de Whisper en segmentos de silencio, ruido o audio fuera de dominio.
- Licencia CC BY-SA 4.0: permite uso comercial pero exige atribucion y compartir obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Modelo sin descargas ni validacion externa en el momento de la consulta (0 descargas, 0 likes); no hay evidencia de uso en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus limitado de una comunidad linguistica concreta puede reflejar sesgos de esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Korla/whisper-large-turbo-v3-dsb-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Serbski-institut/dsb_audio_corpus
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo anterior relacionado: https://huggingface.co/Korla/whisper-large-v3-turbo-dsb
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
