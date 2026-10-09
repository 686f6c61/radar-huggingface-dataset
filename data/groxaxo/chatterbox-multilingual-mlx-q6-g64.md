# groxaxo/chatterbox-multilingual-MLX-Q6-G64

## Resumen

Chatterbox Multilingual MLX Q6 G64 es una version cuantizada del modelo de texto a voz (TTS) mlx-community/chatterbox-multilingual-v3, publicada por el usuario groxaxo. Se trata de un checkpoint empaquetado en formato MLX con cuantizacion afín de 6 bits y tamano de grupo 64, generado a partir de la fuente original en FP32 mediante la herramienta oMLX (_quantize_chunked). Su proposito es ofrecer sintesis de voz multilingue con clonacion de voz sobre Apple Silicon con un consumo de memoria claramente inferior al del modelo original.

El problema que resuelve es la huella de memoria y la velocidad de inferencia: el checkpoint principal pasa de 2.711,11 MB en FP32 a 718,36 MB en Q6, manteniendo un rendimiento de generacion de 2,58 s de media en caliente y un factor de tiempo real (RTF) de 0,705 en un MacBook Air M5 con 24 GiB. Frente a la variante Q8 G64 (877,79 MB), el Q6 reduce el pico de RSS de proceso de 1,52 GiB a 1,37 GiB, a costa de un pequeno empeoramiento en la tasa de error de palabras (WER estricta agrupada de 8,67% frente a 6,67%).

El modelo cuenta con 677.696.431 parametros en el checkpoint principal, licencia MIT y soporte declarado para 23 idiomas, aunque la evaluacion publicada por el autor solo cubre ingles y espanol. Esta pensado para desarrolladores que quieran ejecutar TTS con clonacion de voz en equipos de Apple sin depender de GPU dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de sintesis de voz (text-to-speech) con clonacion de voz; incluye un modulo S3Tokenizer y un vocoder. La model card no detalla la topologia interna completa |
| Parametros totales | 677.696.431 (checkpoint principal, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de texto a voz; no se especifica ventana de contexto) |
| Tipos de cuantizacion | 6-bit afín con grupo 64 (MLX). Existen variantes Q8 G64 y fuente FP32 del mismo autor |
| Idiomas soportados | 23: ar, da, de, el, en, es, fi, fr, he, hi, it, ja, ko, ms, nl, no, pl, pt, ru, sv, sw, tr, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado nativo MLX); la configuracion completa requiere el script load_q6.py incluido |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base mas alla de identificarlo como un sistema de texto a voz multilingue con clonacion de voz. Se sabe que la ejecucion completa consta de dos partes: el checkpoint principal cuantizado, con 651 matrices almacenadas directamente en Q6, y un S3Tokenizer externo de 494,87 MB que se descarga o cachea por separado y que, mediante el cargador incluido load_q6.py, se cuantiza en tiempo de carga para 37 matrices adicionales, alcanzando 688 matrices Q6 en ejecucion. Los tensores no soportados por la cuantizacion se mantienen en FP32. El cargador estandar de mlx-audio solo cuantiza el checkpoint principal, por lo que para reproducir la configuracion evaluada hay que usar el script especifico.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO, ya que la model card se centra exclusivamente en el proceso de cuantizacion y evaluacion. Esta version no incorpora ningun condicionamiento de voz privado ni grabacion concreta: es un checkpoint generico que exige aportar audio de referencia propio y autorizado para la clonacion.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en 23 idiomas declarados a nivel de metadatos.
- Clonacion de voz condicionada por audio de referencia aportado por el usuario, siempre que se disponga de autorizacion para su uso.
- Generacion de audio reproducible en tiempo real en Apple Silicon (RTF inferior a 1 en la configuracion Q6 evaluada).
- Soporte de multiples prompts y semillas: la evaluacion publicada cubre seis prompts (tres en ingles, tres en espanol) y las semillas 42 y 123.
- Integracion con la libreria mlx-audio 0.5.7 sobre MLX 0.32.3 y backend Metal.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada (salvo el audio de referencia para la clonacion).

## Casos de uso

- Audiolibros y narracion automatizada: el modelo genera voz a partir de texto largo y permite fijar una voz concreta mediante audio de referencia, lo que resulta adecuado para producir capitulos completos de forma consistente.
- Localizacion y doblaje multilingue: con 23 idiomas declarados, se puede reutilizar el mismo flujo para generar pistas de voz en distintos idiomas sobre un mismo contenido.
- Asistentes de voz embebidos en aplicaciones macOS o iOS: al ejecutarse sobre MLX en Apple Silicon con un pico de asignacion MLX de 1,88 GiB, cabe en portatiles con 24 GiB y no requiere GPU dedicada.
- Accesibilidad: conversion de articulos, documentacion tecnica o correos a audio para usuarios con discapacidad visual, con voces personalizadas si se dispone de una referencia autorizada.
- Sistemas de respuesta de voz interactiva (IVR) y notificaciones: la generacion media de 2,58 s y el RTF de 0,705 permiten producir mensajes cortos de forma casi inmediata en equipos de consumo.
- Prototipado de personajes y videojuegos: la clonacion de voz permite crear voces diferenciadas para dialogos, con licencia MIT que facilita su integracion en proyectos propios.
- Investigacion en sintesis de voz: la publicacion incluye recetas de cuantizacion, scripts de integridad y datos derivados de 36 grabaciones, lo que sirve como base reproducible para estudiar el impacto de la cuantizacion en calidad y prosodia.

## Benchmarks y rendimiento

Datos publicados por el autor en una ejecucion del 9 de octubre de 2026 sobre MacBook Air M5 con 24 GiB, alimentacion por bateria y orden fijo FP32 -> Q8 -> Q6:

| Metrica (36 generaciones, EN/ES, 2 semillas) | FP32 | Q8 G64 | Q6 G64 |
|---|---:|---:|---:|
| Checkpoint principal (MB decimales) | 2711,114 | 877,794 | 718,359 |
| Generacion media en caliente (s) | 4,925 | 2,687 | 2,580 |
| Factor de tiempo real agregado (RTF) | 1,386 | 0,740 | 0,705 |
| Pico de RSS del proceso (GiB) | 3,226 | 1,521 | 1,372 |
| Pico de asignacion MLX (GiB) | 4,197 | 2,029 | 1,884 |
| WER estricta agrupada con Parakeet | 7,33% (11/150) | 6,67% (10/150) | 8,67% (13/150) |
| MOS predicho UTMOSv2 en ingles | 3,032 | 3,117 | 3,121 |
| MOS predicho en espanol (exploratorio) | 2,643 | 2,737 | 2,749 |
| Desviacion estandar del tono (semitonos) | 2,617 | 2,567 | 2,632 |

El propio autor advierte de que el MOS predicho no equivale a un MOS de oyentes humanos, que la diferencia Q6-Q8 en ingles fue de +0,003593 con un intervalo bootstrap del 95% de [-0,140297, +0,211669] sobre solo tres prompts, que la calibracion en espanol no esta validada para este corpus y que el rendimiento se midio con bateria y carga de escritorio variable. No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, lo cual es esperable al tratarse de un modelo de voz.

## Requisitos de hardware

- Memoria: pico de asignacion MLX de 1,884 GiB y pico de RSS de proceso de 1,372 GiB en la configuracion Q6 evaluada. Hay que sumar el S3Tokenizer externo, con 494,87 MB en disco.
- Equipo de referencia: MacBook Air M5 con 24 GiB de memoria unificada, alimentado por bateria. Con estos numeros, el modelo cabe holgadamente en equipos Apple Silicon de 8 GiB o mas.
- GPU: no aplica a GPU NVIDIA o AMD, ya que la implementacion es MLX sobre Metal y esta orientada a Apple Silicon. No se dispone de datos para A100, H100 o RTX 4090.
- GPU de consumo: si, en cualquier Mac con chip de la familia M y memoria unificada suficiente; no se documenta soporte para GPUs de consumo x86.
- Despliegue: libreria mlx-audio 0.5.7 sobre MLX 0.32.3 y Metal. Para la configuracion evaluada es necesario el cargador load_q6.py incluido; el cargador estandar de mlx-audio solo cuantiza el checkpoint principal. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,580 s de generacion media en caliente y RTF agregado de 0,705 para la configuracion Q6, con un pico de 1,884 GiB de asignacion MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | WER estricta | MOS predicho EN | Licencia |
|---|---|---:|---:|---:|---:|---|
| groxaxo/chatterbox-multilingual-MLX-Q6-G64 | 677.696.431 | 6-bit afín, grupo 64 | 718,36 MB | 8,67% | 3,121 | MIT |
| groxaxo/chatterbox-multilingual-MLX-Q8-G64 | No disponible en la informacion | 8-bit afín, grupo 64 | 877,79 MB | 6,67% | 3,117 | MIT |
| Fuente FP32 (mlx-community/chatterbox-multilingual-v3) | 677.696.431 | Sin cuantizar | 2711,11 MB | 7,33% | 3,032 | MIT |

No se dispone de datos de otros modelos de texto a voz comparables (por ejemplo, alternativas de sintesis con clonacion de voz de otros autores) en la informacion proporcionada, por lo que la comparativa se limita a las tres variantes del mismo modelo evaluadas por el autor.

## Limitaciones y advertencias

- Solo se han evaluado ingles y espanol, pese a que los metadatos declaran 23 idiomas; el rendimiento en el resto de idiomas no esta verificado.
- El WER de Q6 (8,67%, 13/150) es ligeramente peor que el de Q8 (6,67%, 10/150); la diferencia son tres ediciones sobre 150 palabras de referencia, y el ASR no mide naturalidad ni similitud de voz.
- El MOS predicho (UTMOSv2) no es un MOS de oyentes humanos y la comparacion Q6-Q8 se apoya en solo tres prompts en ingles, con un intervalo bootstrap que cruza cero: no demuestra superioridad ni equivalencia perceptual.
- La calibracion en espanol es exploratoria y no esta validada para este corpus.
- Los datos de velocidad y consumo se obtuvieron con alimentacion por bateria, con escritorio activo y en un orden fijo de ejecucion; el autor indica que las diferencias de velocidad y energia necesitan replicacion controlada.
- El modelo no incluye ninguna voz de referencia; es necesario aportar audio propio y autorizado. La clonacion de voz plantea riesgos de suplantacion, por lo que conviene verificar consentimiento y cumplimiento normativo antes de usarla en produccion.
- La licencia es MIT, lo que permite uso comercial, pero esa licencia cubre el empaquetado y no exime de responsabilidades sobre los derechos del audio de referencia ni sobre las condiciones del modelo base.
- La topologia interna, los datos de entrenamiento y el proceso de alineacion no estan documentados en la model card, lo que dificulta auditar sesgos o comportamientos indeseados.
- No hay soporte documentado para runtimes de inferencia habituales en servidores (vLLM, TGI, llama.cpp, Ollama); el despliegue esta ligado a MLX y Apple Silicon.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/chatterbox-multilingual-MLX-Q6-G64
- Modelo base: https://huggingface.co/mlx-community/chatterbox-multilingual-v3
- Variante Q8 G64 del mismo autor: https://huggingface.co/groxaxo/chatterbox-multilingual-MLX-Q8-G64
- Entrada del experimento y reproduccion: experiments/omlx-q6-q8-2026-10-09/README.md (dentro del repositorio del modelo)
- Informe de rendimiento, WER y energia: experiments/omlx-q6-q8-2026-10-09/docs/performance/REPORT.md
- Informe de naturalidad y prosodia: experiments/omlx-q6-q8-2026-10-09/docs/naturalness/REPORT.md
- PDF de naturalidad: experiments/omlx-q6-q8-2026-10-09/docs/naturalness/chatterbox-naturalidad.pdf
- Metricas en CSV: experiments/omlx-q6-q8-2026-10-09/docs/naturalness/metrics.csv
- Manifiesto del paquete: experiments/omlx-q6-q8-2026-10-09/MANIFEST.sha256
- Metodos de validacion y limites conocidos: experiments/omlx-q6-q8-2026-10-09/docs/ARCHIVE_VALIDATION.md
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con la ficha.
