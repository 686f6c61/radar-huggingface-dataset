# groxaxo/chatterbox-multilingual-MLX-Q8-G64

## Resumen

Chatterbox Multilingual MLX Q8 G64 es una version cuantizada del modelo de sintesis de voz (text-to-speech) chatterbox-multilingual-v3, publicada por el usuario groxaxo. Se trata de un checkpoint de 677.696.431 parametros (~678 M) convertido desde los pesos FP32 originales a cuantizacion afina de 8 bits con grupos de 64 elementos, empleando el framework MLX de Apple. El objetivo es reducir el espacio en disco y el consumo de memoria durante la inferencia en chips de Apple Silicon, manteniendo la calidad de audio. El checkpoint principal pasa de 2.711,11 MB en FP32 a 877,79 MB en Q8, es decir, una reduccion de aproximadamente el 67,6 % en tamano.

El modelo esta disenado para generar voz a partir de texto y clonar voces empleando una grabacion de referencia proporcionada por el usuario. Soporta 23 idiomas segun los metadatos (arabe, danes, aleman, griego, ingles, espanol, finlandes, frances, hebreo, hindi, italiano, japones, coreano, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, suajili, turco y chino). La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que demuestra que es viable ejecutar un sistema TTS multilingue con clonacion de voz en hardware de consumo con memoria unificada (probado en un MacBook Air M5 con 24 GiB de RAM), con un factor de tiempo real agregado de 0,740 en la configuracion Q8, lo que significa que genera audio mas rapido que el tiempo de reproduccion. El repositorio incluye un paquete experimental completo con recetas de cuantizacion, transcripciones, figuras y scripts de revalidacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para text-to-speech basada en chatterbox-multilingual-v3; emplea un tokenizador de audio S3TokenizerV2 externo. Detalle de capas no disponible |
| Parametros totales | 677.696.431 (~678 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; no se especifica ventana de contexto textual en la informacion) |
| Tipos de cuantizacion | Afina de 8 bits (Q8) con grupos de 64 (G64); se documenta tambien una variante Q6 G64 en el paquete experimental. El modelo base esta en FP32 |
| Idiomas soportados | 23: arabe, danes, aleman, griego, ingles, espanol, finlandes, frances, hebreo, hindi, italiano, japones, coreano, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, suajili, turco y chino |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizados) |
| Libreria de inferencia | mlx-audio 0.5.7 y MLX 0.32.3 (probado) |
| Modelo base | mlx-community/chatterbox-multilingual-v3 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que deriva de chatterbox-multilingual-v3 y que emplea un tokenizador externo S3TokenizerV2 (aproximadamente 494,87 MB de descarga y cache separada). El checkpoint principal contiene 651 matrices compatibles almacenadas como Q8; el cargador incluido convierte ademas 37 matrices externas del S3Tokenizer a Q8 en tiempo de carga, alcanzando 688 matrices Q8 en ejecucion. Los tensores no soportados permanecen en FP32 original.

El proceso de cuantizacion es una receta nativa de MLX afina de 8 bits con agrupacion de 64. No se especifican en la model card los datos de entrenamiento (numero de tokens, composicion del dataset, si se aplico RLHF o DPO para la version original). El paquete experimental incluido documenta la reproduccion con seis prompts (tres en ingles, tres en espanol), dos semillas (42 y 123) y 36 mediciones emparejadas. El autor indica que se puede reproducir la configuracion completa evaluada mediante el script `load_q8.py`, ya que el cargador estandar de mlx-audio solo cuantiza el checkpoint principal.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con salida de audio.
- Clonacion de voz mediante una grabacion de referencia aportada por el usuario (`prepare_conditionals`).
- Soporte de generacion multilingue en 23 idiomas, aunque la evaluacion experimental documentada solo cubre ingles y espanol.
- Parametros de control de generacion: `exaggeration`, `cfg_weight`, `temperature`, `repetition_penalty`, `min_p`, `top_p` y `max_new_tokens`.
- Configuracion de semilla aleatoria para reproducibilidad.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio de entrada (mas alla de la referencia de voz para clonacion).

## Casos de uso

- Audiolibros y narracion automatizada: el modelo genera voz natural a partir de texto con control de prosodia (`exaggeration`, `cfg_weight`), y el factor de tiempo real de 0,740 en Q8 permite producir audio mas rapido que su reproduccion en un MacBook Air M5.
- Asistentes de voz en local: al ejecutarse sobre MLX en Apple Silicon con un pico de asignacion de 2,029 GiB en Q8, puede integrarse en aplicaciones de escritorio sin depender de servicios en la nube.
- Clonacion de voz personalizada: la funcion `prepare_conditionals` permite condicionar la sintesis con una grabacion de referencia, util para preservar una identidad vocal concreta en contenido generado por el propio usuario autorizado.
- Doblaje y localizacion de contenido: con soporte declarado para 23 idiomas, sirve para generar pistas de voz en distintos idiomas, aunque conviene validar la calidad por idioma ya que la evaluacion solo cubrio ingles y espanol.
- Prototipado de interfaces conversacionales: la API de mlx-audio facilita generar respuestas habladas en aplicaciones de chat o agentes de voz durante fases de desarrollo.
- Generacion de avisos y locuciones automatizadas: para sistemas de anuncios, mensajes de bienvenida o contenido de accesibilidad, con la ventaja de que la licencia MIT permite uso comercial.
- Investigacion en cuantizacion de modelos de audio: el repositorio incluye el paquete experimental completo (prompts, semillas, mediciones, figuras y scripts de revalidacion offline), lo que lo hace util como referencia reproducible para estudiar el impacto de Q8 y Q6 sobre WER, MOS predicho y prosodia.

## Benchmarks y rendimiento

Datos del informe experimental (ejecucion del 9 de octubre de 2026 en MacBook Air M5 con 24 GiB, alimentacion por bateria, escritorio activo y orden fijo FP32 → Q8 → Q6):

| Metrica | FP32 | Q8 G64 | Q6 G64 |
|---|---:|---:|---:|
| Checkpoint principal (MB decimales) | 2711,114 | 877,794 | 718,359 |
| Generacion en caliente media (segundos) | 4,925 | 2,687 | 2,580 |
| Factor de tiempo real agregado | 1,386 | 0,740 | 0,705 |
| RSS de proceso pico (GiB) | 3,226 | 1,521 | 1,372 |
| Asignacion MLX pico (GiB) | 4,197 | 2,029 | 1,884 |
| WER estricto agrupado (Parakeet) | 7,33 % (11/150) | 6,67 % (10/150) | 8,67 % (13/150) |
| MOS predicho UTMOSv2, ingles | 3,032 | 3,117 | 3,121 |
| MOS predicho, espanol (exploratorio) | 2,643 | 2,737 | 2,749 |
| Desviacion estandar de tono (semitonos) | 2,617 | 2,567 | 2,632 |

Advertencias del propio autor: la MOS predicha no equivale a la MOS de oyentes humanos. La diferencia inglesa Q6−Q8 fue de +0,003593 con intervalo bootstrap del 95 % de [−0,140297, +0,211669] y solo tres prompts en ingles, por lo que no establece ni un ganador perceptual ni equivalencia. La calibracion en espanol no esta validada para este corpus. La comparacion FP32 anterior (cohorte distinta) indico una reduccion del 53,2 % en RSS pico y del 28,7 % en tiempo medio de generacion para Q8 frente a FP32. No se han publicado comparaciones con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- Entorno probado: Apple Silicon con MLX (mlx-audio 0.5.7 y MLX 0.32.3), validado en un MacBook Air M5 con 24 GiB de memoria unificada.
- Memoria en Q8 G64: pico de RSS de proceso de 1,521 GiB y pico de asignacion MLX de 2,029 GiB.
- Memoria en Q6 G64: pico de RSS de 1,372 GiB y pico de asignacion MLX de 1,884 GiB.
- Memoria en FP32 (referencia): pico de RSS de 3,226 GiB y pico de asignacion MLX de 4,197 GiB.
- Almacenamiento: el checkpoint principal ocupa 877,79 MB en Q8; el tokenizador externo S3TokenizerV2 anade una cache separada de aproximadamente 494,87 MB.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (validado con 24 GiB). No se aportan datos para GPUs NVIDIA (A100, H100, RTX 4090) porque el modelo esta empaquetado para MLX/Metal.
- Opciones de despliegue: mlx-audio con backend MLX/Metal; se menciona que el runtime de servicio oMLX no es necesario. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: generacion media en caliente de 2,687 s (Q8) y 2,580 s (Q6) frente a 4,925 s (FP32) sobre los prompts de prueba; factor de tiempo real agregado de 0,740 (Q8) y 0,705 (Q6), lo que indica generacion mas rapida que la reproduccion.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS comparables en la informacion proporcionada. La unica comparacion documentada es entre las variantes de cuantizacion del propio modelo:

| Variante | Tamano del checkpoint | Factor de tiempo real | RSS pico | WER estricto |
|---|---:|---:|---:|---:|
| FP32 (base) | 2711,11 MB | 1,386 | 3,226 GiB | 7,33 % |
| Q8 G64 (este repositorio) | 877,79 MB | 0,740 | 1,521 GiB | 6,67 % |
| Q6 G64 (experimental) | 718,36 MB | 0,705 | 1,372 GiB | 8,67 % |

Comparativa con modelos alternativos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Solo se evaluaron ingles y espanol, pese a que los metadatos declaran 23 idiomas; la calidad en el resto de idiomas no esta validada.
- La MOS predicha (UTMOSv2) no es MOS de oyentes humanos; no se reclama ninguna puntuacion perceptual de naturalidad ni de similitud de voz.
- La comparacion Q6 frente a Q8 en ingles no establece un ganador perceptual ni equivalencia, con solo tres prompts y un intervalo bootstrap que incluye el cero.
- La calibracion de MOS en espanol se marca como exploratoria y no validada para este corpus.
- El modelo requiere una grabacion de referencia aportada por el usuario; el autor advierte que es un checkpoint generico y que se debe aportar audio de referencia para el que se tenga autorizacion de uso.
- Mayor desviacion estandar de tono no implica mejor calidad prosodica.
- Las diferencias de velocidad y consumo se midieron con alimentacion por bateria y orden fijo de ejecucion, por lo que requieren replicacion controlada.
- Las mediciones de RSS y de asignacion MLX se solapan y no deben sumarse.
- El tokenizador S3TokenizerV2 es una descarga externa de ~494,87 MB y sus pesos en disco no se reemplazan; el cargador estandar de mlx-audio solo cuantiza el checkpoint principal.
- No se documentan riesgos especificos de sesgo ni tasas de alucinacion; al ser un modelo TTS, el riesgo principal es la fidelidad de la pronunciacion y la prosodia, no la veracidad factual.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el uso de voces clonadas y los derechos de las grabaciones de referencia recae en el usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/chatterbox-multilingual-MLX-Q8-G64
- Modelo base: https://huggingface.co/mlx-community/chatterbox-multilingual-v3
- Tokenizador externo: https://huggingface.co/mlx-community/S3TokenizerV2
- Entrada del experimento y reproduccion: experiments/omlx-q6-q8-2026-10-09/README.md
- Informe de rendimiento, WER y consumo: experiments/omlx-q6-q8-2026-10-09/docs/performance/REPORT.md
- Informe de naturalidad y prosodia: experiments/omlx-q6-q8-2026-10-09/docs/naturalness/REPORT.md
- PDF de naturalidad: experiments/omlx-q6-q8-2026-10-09/docs/naturalness/chatterbox-naturalidad.pdf
- CSV de metricas: experiments/omlx-q6-q8-2026-10-09/docs/naturalness/metrics.csv
- Manifiesto del paquete: experiments/omlx-q6-q8-2026-10-09/MANIFEST.sha256
- Origen del archivo: experiments/omlx-q6-q8-2026-10-09/data/archive-origin.json
- Metodos de validacion y limites conocidos: experiments/omlx-q6-q8-2026-10-09/docs/ARCHIVE_VALIDATION.md
