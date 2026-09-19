# moona3k/mlx-qwen3-asr-1.7b-8bit

## Resumen

mlx-qwen3-asr-1.7b-8bit es una cuantización de 8 bits (group size 64) del modelo de reconocimiento automático de voz Qwen/Qwen3-ASR-1.7B, publicada por el usuario moona3k para la librería mlx-qwen3-asr, una reimplementación desde cero de Qwen3-ASR sobre MLX, el framework de arrays de Apple para Apple Silicon. El artefacto no depende de PyTorch, ni de transformers, ni requiere ningún paso de conversión por parte del usuario: se descarga y se ejecuta directamente sobre la GPU unificada de un Mac.

El interés principal de esta ficha es de eficiencia: el modelo base en fp16 ocupa 4,4 GB, mientras que este artefacto ocupa 2,0 GB de descarga (repositorio de 2,2 GB), con una calidad declarada idéntica al original (mismo WER y mismo CER en la evaluación publicada, con hipótesis idénticas en las 100 muestras). Se distribuye bajo licencia Apache-2.0, cubre diez idiomas (entre ellos el español) y expone transcripción con marcas de tiempo por palabra y un servidor HTTP.

Es relevante ahora porque permite ejecutar un modelo ASR de 1,7B parámetros en portátiles Apple Silicon con la mitad de memoria y sin ecosistema CUDA, algo útil para transcripción local de audio sin enviar datos a la nube. Como contrapartida, es un artefacto muy reciente y sin tracción (0 descargas y 0 likes en el momento de la consulta), y su evaluación publicada se limita a inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo Qwen3-ASR (codificador de audio mas decodificador de texto); detalle completo no disponible |
| Parametros totales | 1,7B (segun el nombre del modelo base Qwen/Qwen3-ASR-1.7B) |
| Parametros activos | No aplica (no se indica que sea MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afinada de 8 bits con group size 64 (`mlx.nn.quantize`) en todas las capas `Linear` y `Embedding`; el resto de tensores (escalas, sesgos, normas, stem convolucional) en float16. Modelo fuente disponible en fp16 |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja), coreano (ko), aleman (de), frances (fr), espanol (es), ruso (ru), arabe (ar), hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos MLX cuantizados (repositorio de 2,2 GB); la model card no especifica la extension de fichero, no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-ASR, que segun la model card consta de un codificador de audio y un decodificador de texto; no se aportan mas detalles estructurales (numero de capas, dimensiones, tipo de atencion) en la informacion disponible. En este artefacto concreto, todas las capas `Linear` y `Embedding` de ambos componentes (codificador y decodificador) se cuantizan de forma afinada a 8 bits con group size 64, mientras que las escalas, sesgos, normas y el stem convolucional permanecen en float16, de modo que la inferencia se ejecuta de principio a fin en float16. La `lm_head` esta atada a los embeddings de tokens en el modelo fuente y no se almacena por duplicado: el cargador vuelve a atar ambos tensores.

No hay informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens de audio o texto utilizados, ni sobre fases de ajuste con RLHF o DPO. La innovacion tecnica de este artefacto es exclusivamente de despliegue: una reimplementacion completa en MLX (sin PyTorch ni transformers) con cuantizacion afinada, cuantizacion aplicada tambien al codificador de audio y una reduccion de tamano del 55% respecto al fp16 (2,0 GB frente a 4,4 GB) sin degradacion medible en la evaluacion publicada. La cuantizacion se reproduce con `scripts/convert.py --quantize 8 --encoder-bits 8 --group-size 64 --dtype float16`.

## Capacidades

- Reconocimiento automatico de voz (ASR) en diez idiomas: ingles, chino, japones, coreano, aleman, frances, espanol, ruso, arabe e hindi.
- Transcripcion de audio a texto con decodificacion greedy.
- Marcas de tiempo por palabra mediante la opcion `--timestamps`.
- Ejecucion como servidor HTTP local con `mlx-qwen3-asr serve`, lo que permite exponer la transcripcion como servicio en red.
- Uso mediante CLI (`mlx-qwen3-asr audio.wav --model ...`) o API de Python (`m.transcribe(...)`).
- Inferencia enteramente local sobre Apple Silicon, sin dependencia de servicios en la nube ni de CUDA.
- No se documentan en la informacion disponible capacidades de traduccion de voz, diarizacion de hablantes, clasificacion de idioma explicita, tool calling ni modo de razonamiento.

## Casos de uso

- Transcripcion local de reuniones: el modelo convierte audio de reuniones en texto sin salir del Mac del usuario, con marcas de tiempo por palabra que facilitan la generacion de actas y la localizacion de fragmentos concretos.
- Subtitulado de video: usando `--timestamps` se obtienen tiempos por palabra que se pueden exportar a formatos de subtitulos, con la ventaja de que todo el proceso ocurre en local y no hay coste por minuto de audio.
- Servicio de transcripcion en red interna: el modo `mlx-qwen3-asr serve` permite levantar un endpoint HTTP en un Mac y consumirlo desde otras aplicaciones de la organizacion, evitando enviar audio sensible a APIs externas.
- Investigacion en ASR multilingue: al cubrir diez idiomas, sirve para prototipar y comparar resultados en corpus propios de espanol, arabe o hindi sin necesidad de infraestructura con GPU NVIDIA.
- Aplicaciones de accesibilidad: integracion en herramientas de dictado o de subtitulado en directo dentro de aplicaciones macOS y iOS que ya usan MLX.
- Preprocesado de datos para pipelines de NLP: transcripcion masiva de archivos de audio a texto para alimentar sistemas de busqueda, resumen o analisis de sentimiento, aprovechando el menor consumo de memoria del artefacto cuantizado frente al fp16.
- Evaluacion comparativa de cuantizacion: sirve como referencia reproducible (script `eval_librispeech.py`) para medir el impacto de 8 bits frente a fp16 en tareas ASR sobre Apple Silicon.

## Benchmarks y rendimiento

Datos publicados en la model card para LibriSpeech test-clean, 100 clips balanceados por hablante (`speaker_round_robin`), decodificacion greedy, Apple M4 Pro, MLX 0.30.6:

| Modelo | WER | CER |
|---|---:|---:|
| Qwen/Qwen3-ASR-1.7B fp16 | 1,94% | 0,57% |
| moona3k/mlx-qwen3-asr-1.7b-8bit (8-bit g64) | 1,94% | 0,57% |

Las hipotesis generadas son identicas a las del modelo fp16 en las 100 muestras evaluadas. Sobre latencia, la model card indica que, segun la matriz de cuantizacion comprometida en el repositorio (`docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md`), la variante de 8 bits es aproximadamente 2,4 veces mas rapida que fp16 y la de 4 bits aproximadamente 2,7 veces mas rapida en un clip de 10 segundos; esa matriz corresponde al modelo de 0,6B, no al de 1,7B. No se publican resultados de benchmarks para los idiomas distintos del ingles ni comparaciones con otros sistemas ASR.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 2,0 GB solo para los pesos; en la practica se recomienda disponer de al menos 4-6 GB de memoria unificada libre para el runtime de MLX y los buffers de audio.
- Hardware soportado: exclusivamente Apple Silicon (la model card reporta pruebas en un Apple M4 Pro). No hay soporte documentado para GPU NVIDIA, AMD ni CPU x86.
- No cabe ni se ejecuta en GPUs de consumo tipo RTX 4090, ya que el artefacto esta en formato MLX y depende de la libreria mlx-qwen3-asr; en ese hardware habria que usar el modelo base Qwen/Qwen3-ASR-1.7B en su formato original.
- Opciones de despliegue: CLI de mlx-qwen3-asr, API de Python del mismo paquete (`mlx_qwen3_asr`) y servidor HTTP integrado. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Version minima de software: mlx-qwen3-asr >= 0.4.1; la reproduccion se documenta con MLX 0.30.6 y la etiqueta v0.4.3 del repositorio.
- Latencia y throughput: no se publican cifras absolutas para este artefacto; solo el factor relativo de aproximadamente 2,4x frente a fp16 en un clip de 10 s, derivado de la matriz del modelo de 0,6B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moona3k/mlx-qwen3-asr-1.7b-8bit | 1,7B | No disponible | MLX 8-bit g64, 2,0 GB de descarga | Apache-2.0 | HuggingFace, autor individual |
| Qwen/Qwen3-ASR-1.7B (fp16) | 1,7B | No disponible | Pesos originales, 4,4 GB | Apache-2.0 | HuggingFace, Qwen |
| Variante 0,6B citada en la matriz de cuantizacion del repositorio | 0,6B (segun nomenclatura) | No disponible | Cuantizaciones de 4 y 8 bits | No disponible | Repositorio mlx-qwen3-asr |

No se dispone de datos de benchmark que comparen este artefacto con otros sistemas ASR de la misma categoria (Whisper, Parakeet u otros), por lo que no es posible establecer una comparativa de rendimiento; la unica comparacion publicada es la del propio modelo frente a su version fp16, con resultados identicos.

## Limitaciones y advertencias

- La evaluacion publicada se limita a LibriSpeech test-clean en ingles y a 100 clips; no hay datos de WER/CER para espanol ni para el resto de idiomas declarados, ni en condiciones de ruido, acentos o audio espontaneo.
- Los factores de latencia (2,4x para 8 bits) proceden de la matriz de cuantizacion del modelo de 0,6B, no de una medicion directa sobre este artefacto de 1,7B.
- Dependencia total del ecosistema Apple: requiere Apple Silicon y MLX; no es ejecutable en GPU NVIDIA, AMD ni en servidores x86 convencionales.
- Requiere mlx-qwen3-asr >= 0.4.1; versiones anteriores no cargaran el artefacto.
- Artefacto sin adopcion registrada (0 descargas, 0 likes en el momento de la consulta) y publicado por un autor individual, no por el equipo de Qwen: no hay validacion independiente de la calidad mas alla de la incluida en la propia model card.
- Riesgo de alucinacion inherente a los modelos ASR en audio con silencio, ruido o solapamiento de voces: la model card no documenta mitigaciones especificas ni umbrales de confianza.
- La licencia Apache-2.0 permite uso comercial, pero el cumplimiento debe verificarse tambien respecto al modelo base Qwen/Qwen3-ASR-1.7B, del que hereda la licencia.
- No se documentan sesgos linguisticos concretos, pero un modelo entrenado mayoritariamente en ingles y chino suele rendir peor en idiomas con menos representacion (arabe, hindi, coreano) y en variedades dialectales del espanol.
- No hay informacion sobre el tratamiento de datos de audio por parte de la libreria; conviene auditar el codigo de mlx-qwen3-asr antes de usarlo con material sensible.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/moona3k/mlx-qwen3-asr-1.7b-8bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de la libreria mlx-qwen3-asr: https://github.com/moona3k/mlx-qwen3-asr
- Matriz de cuantizacion citada: `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md` (dentro del repositorio anterior)
- Resultados por muestra de este artefacto: `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-1.7B_8bit.json` (dentro del repositorio anterior)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos correspondian a directorios de restaurantes y no guardan relacion con la ficha. No se han encontrado papers, blogs ni demos adicionales.
