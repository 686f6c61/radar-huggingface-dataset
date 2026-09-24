# gcoli/whisper-large-v3-swiss-german-mit

## Resumen

`gcoli/whisper-large-v3-swiss-german-mit` es un ajuste fino de `openai/whisper-large-v3` orientado a reconocimiento automático de habla (ASR) de dialectos del alemán suizo (código `gsw`) con salida en alemán estándar (`de`). Lo desarrolla el usuario gcoli y su rasgo diferencial es la cadena de licencias: modelo base Apache-2.0, datos de entrenamiento MIT y resultado publicado bajo licencia MIT, lo que permite uso comercial. La mayoría de modelos públicos de alemán suizo heredan CC BY-NC de SwissDial y quedan fuera del uso comercial.

El modelo resuelve un problema concreto: transcribir audio parlamentario y dialectal suizo a texto en alemán estándar con una precisión superior al modelo base sin ajustar. Con 1.543.490.560 parámetros (aproximadamente 1,55 mil millones) y un tamaño de repositorio de 6,2 GB, se distribuye en formato transformers (safetensors fp16) en la raíz del repositorio y en formato CTranslate2 (float16) dentro de la carpeta `ct2/`.

Según la model card, mejora al modelo base sin ajustar en 1,9 puntos de WER (24,7 % frente a 26,3 % en el conjunto final) y resulta ligeramente más rápido. Es relevante ahora porque ofrece una vía comercialmente limpia para desplegar transcripción de alemán suizo con faster-whisper o transformers, sin las restricciones no comerciales habituales en este nicho lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper large-v3), ajuste fino con LoRA sobre `q_proj` y `v_proj`, fusionado en los pesos finales |
| Parametros totales | 1.543.490.560 (aproximadamente 1,55 mil millones) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | safetensors fp16 en la raiz; CTranslate2 float16 en `ct2/`; `int8_float16` recomendado por el autor para entornos con VRAM limitada (coste aproximado de 0,3 puntos de WER); variante MLX q8 y variante CoreML publicadas por el mismo autor |
| Idiomas soportados | `gsw` (alemán suizo, entrada) y `de` (salida en alemán estandar) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) en la raiz del repositorio y CTranslate2 float16 en `ct2/` |

## Arquitectura y entrenamiento

Se parte de `openai/whisper-large-v3` (Apache-2.0), un transformer encoder-decoder para ASR y traducción de voz. El ajuste se realizó mediante LoRA con rango 32, alpha 64, dropout 0,05 y como módulos objetivo `q_proj` y `v_proj`; los adaptadores se fusionaron en los pesos tras el entrenamiento. El optimizador fue con learning rate 3e-4, decaimiento lineal, 500 pasos de calentamiento, una época, batch 8 con 2 pasos de acumulación, precisión bf16 y gradient checkpointing. Todo el entrenamiento se ejecutó en una única RTX 3080 Ti (12 GB) en aproximadamente 2,2 horas.

Los datos de entrenamiento suman 100 horas: 20 horas del Swiss Parliaments Corpus v2 de FHNW/i4ds (Bern) y 80 horas del corpus audio de Gemeinderat Zürich. Este segundo corpus es solo audio, por lo que sus transcripciones se generaron con `openai/whisper-large-v3` como pseudo-etiquetador y se filtraron por confianza (`avg_logprob > -0.45`, `no_speech_prob < 0.3`, ratio de compresión < 2,2 y rechazo de bucles de repetición). La model card destaca dos hallazgos: el learning rate domina el resultado (1e-3 no aportó nada, 3e-4 ganó 1,8 puntos de inmediato) y la mezcla de fuentes importa más que el volumen (ambos corpus deben estar presentes; duplicar las pseudo-etiquetas de Zürich a 160 horas no cambió nada).

## Capacidades

- Transcripcion de voz a texto para dialectos del alemán suizo, con salida normalizada en alemán estándar.
- Reconocimiento automático de habla sobre audio a 16 kHz mono, con token de idioma `de` y tarea `transcribe`.
- Integración con el pipeline `automatic-speech-recognition` de transformers y con faster-whisper / CTranslate2.
- Decodificacion con beam search (la evaluacion de referencia usa beam 5) y precision float16.
- Compatibilidad con cuantizacion `int8_float16` para reducir consumo de VRAM.
- Variantes de despliegue publicadas por el autor: MLX q8 (Apple Silicon) y CoreML (WhisperKit).
- Identificacion de dialectos cantonales hasta cierto punto, con mejor comportamiento en Bern y Zürich que en Valais o Friburgo.
- No se documentan capacidades de traduccion a otros idiomas distintos del par `gsw` → `de`, ni tool calling, ni agentes.

## Casos de uso

- Transcripcion de actas parlamentarias y plenos municipales: el modelo se entrenó especificamente con el Swiss Parliaments Corpus v2 y el corpus de Gemeinderat Zürich, por lo que se ajusta al registro formal y a las condiciones acusticas de sala de estos entornos.
- Subtitulado de contenido audiovisual en alemán suizo: admite audio a 16 kHz mono y puede ejecutarse con faster-whisper en CTranslate2 float16, lo que facilita procesar lotes de video con decodificacion en beam 5.
- Archivado y busqueda de grabaciones historicas de habla dialectal suiza: al emitir alemán estándar en lugar de grafia dialectal, el texto resultante es indexable y buscable con herramientas de texto convencionales.
- Despliegue en produccion con presupuesto de VRAM ajustado: la variante CTranslate2 `int8_float16` permite reducir memoria a cambio de unos 0,3 puntos de WER, un compromiso razonable en GPUs de gama media o en nodos compartidos.
- Aplicaciones en Apple Silicon: la variante MLX q8 (`gcoli/whisper-large-v3-swiss-german-mlx-q8`) permite inferencia local en equipos macOS sin GPU dedicada.
- Aplicaciones moviles o de escritorio con WhisperKit: la variante CoreML (`gcoli/whisper-large-v3-swiss-german-coreml`) esta pensada para integracion nativa en el ecosistema Apple.
- Preprocesado de datos de voz para pipelines de NLP: convertir audio dialectal a texto estandar para alimentar clasificadores, resumidores o sistemas de recuperacion de informacion.
- Investigacion en ASR dialectal: sirve como punto de comparacion reproducible frente al modelo base, ya que el autor publica el desglose dev/final y la metodologia de evaluacion.

## Benchmarks y rendimiento

Medido sobre el conjunto de prueba All Swiss German Dialects Test Set de FHNW/i4ds (MIT, 5750 clips, 12,7 h, 17 dialectos), decodificado con faster-whisper (CTranslate2, float16, beam 5) en una RTX 3080 Ti. El conjunto se divide de forma disjunta por hablante en dos mitades: dev (2930 clips) para seleccion de modelo y final (2820 clips) reservada.

| Modelo | WER dev | WER final | CER | RTF |
|---|---|---|---|---|
| Este checkpoint | 22,1 % | 24,7 % | 12,7 % | 0,081 |
| `openai/whisper-large-v3` (sin ajuste) | 24,0 % | 26,3 % | 13,6 % | 0,090 |
| `openai/whisper-large-v3-turbo` (sin ajuste) | 26,5 % | 28,5 % | 14,6 % | 0,032 |
| Ajuste fino del autor sobre turbo | 23,7 % | 25,9 % | 13,4 % | 0,031 |

El autor advierte que la mitad final es mas dificil para todos los modelos, incluidos los basales sin entrenar, por lo que las comparaciones deben hacerse dentro de una misma columna. WER y CER son medias por clip tras normalizacion (minusculas, puntuacion eliminada, `ß` → `ss`). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) porque no aplican a una tarea de ASR.

## Requisitos de hardware

- El autor no publica cifras de VRAM en la model card. Como referencia derivada del numero de parametros, los pesos en fp16 ocupan aproximadamente 3,1 GB, a lo que hay que sumar activaciones y overhead del runtime.
- La model card indica que `int8_float16` cuesta alrededor de 0,3 puntos de WER y es un compromiso razonable para entornos con VRAM limitada.
- El entrenamiento se completo en una unica RTX 3080 Ti (12 GB), lo que sugiere que la inferencia en fp16 cabe holgadamente en GPUs de consumo con 8-12 GB o mas (RTX 3060 Ti, 3070, 3080, 4070, 4080, 4090).
- GPU de datacenter compatibles por familia: A100, H100, L40S, entre otras; no se especifican cifras de throughput para estas.
- El RTF medido es 0,081 en RTX 3080 Ti, lo que equivale a aproximadamente 12,3 veces el tiempo real por clip transcrito.
- Opciones de despliegue documentadas: transformers (`pipeline automatic-speech-recognition`), faster-whisper / CTranslate2 (carpeta `ct2/`), MLX para Apple Silicon y CoreML / WhisperKit para el ecosistema Apple.
- Para MLX hay que convertir los safetensors de la raiz con `mlx_whisper`; el autor publica ademas una variante q8 ya convertida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER final | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gcoli/whisper-large-v3-swiss-german-mit` | 1,55 mil millones | Ventanas de audio de 30 s (Whisper) | 24,7 % | MIT | HuggingFace, CTranslate2, MLX, CoreML |
| `openai/whisper-large-v3` | Aproximadamente 1,55 mil millones | Ventanas de audio de 30 s | 26,3 % | Apache-2.0 | HuggingFace, CTranslate2, transformers |
| `openai/whisper-large-v3-turbo` | No disponible en la informacion proporcionada | Ventanas de audio de 30 s | 28,5 % | Apache-2.0 | HuggingFace, CTranslate2, transformers |
| Ajuste fino turbo del autor (`gcoli/whisper-large-v3-turbo-swiss-german-mit`) | No disponible en la informacion proporcionada | Ventanas de audio de 30 s | 25,9 % | MIT | HuggingFace |

Frente a los modelos publicos de alemán suizo que heredan CC BY-NC de SwissDial, este checkpoint se diferencia por su licencia MIT, aunque la informacion disponible no incluye una comparacion directa de WER con ellos.

## Limitaciones y advertencias

- El conjunto de prueba es habla leida, mientras que los datos de entrenamiento son habla parlamentaria; el rendimiento en conversacion espontanea, podcasts o grabaciones con ruido no esta medido.
- Los datos de entrenamiento cubren solo dos regiones (Bern y Zürich). Los dialectos de Valais y Friburgo siguen siendo los mas debiles, con aproximadamente un 30-35 % de WER.
- Las transcripciones de Zürich son pseudo-etiquetas generadas por `openai/whisper-large-v3`, por lo que el modelo ajustado no puede superar sustancialmente a su profesor en ese dominio.
- Whisper puede alucinar u omitir texto, especialmente con ruido, silencio, hablantes solapados, dialectos poco frecuentes o vocabulario especializado.
- El autor advierte explicitamente de no usar la salida del modelo como unica base para decisiones de alto impacto y de obtener consentimiento antes de transcribir a personas.
- La salida es siempre alemán estandar, no grafia dialectal; hay que usar el token de idioma `de` y la tarea `transcribe`.
- El audio debe ser de 16 kHz mono.
- El learning rate de entrenamiento es un factor critico segun el propio autor: recetas a 1e-3 no aportaron mejora, lo que condiciona la reproducibilidad del ajuste.
- La model card incluida esta truncada, por lo que algunos detalles de la seccion de condiciones de uso no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit
- Variante turbo del mismo autor: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit
- Variante MLX q8: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mlx-q8
- Variante CoreML: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Datasets FHNW/i4ds (Swiss Parliaments Corpus v2, Gemeinderat Zürich, All Swiss German Dialects Test Set): https://www.cs.technik.fhnw.ch/i4ds-datasets
- Ficha de referencia de Whisper large-v3: https://d-central.tech/ai/model/whisper-large-v3/
- Repositorio de referencia de la familia Whisper large-v3: https://github.com/cxh-tech/whisper-large-v3
- Entrada de registro de la variante MLX q8: https://free2aitools.com/model/gcoli/whisper-large-v3-swiss-german-mlx-q8
