# neilbdesai/loquen-qwen3-asr-1.7b-8bit

## Resumen

Loquen Qwen3-ASR 1.7B 8-bit es una cuantizacion de 8 bits del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-1.7B de Alibaba Qwen, publicada por el usuario neilbdesai en HuggingFace. Se trata de un artefacto en formato MLX, es decir, pensado para ejecutarse exclusivamente sobre Apple Silicon (chips M1/M2/M3/M4) a traves de la libreria mlx. El modelo resuelve la tarea de transcripcion de audio a texto (pipeline `automatic-speech-recognition`) en 10 idiomas y reduce el peso de descarga de 4,4 GB en fp16 a aproximadamente 2,0 GB.

La relevancia actual de este artefacto radica en que permite ejecutar un modelo ASR de 1.700 millones de parametros de forma local en un Mac, sin GPU dedicada y sin pasos de conversion por parte del usuario. La model card indica que la cuantizacion se aplica a todas las capas `Linear` y `Embedding` tanto del decodificador de texto como del codificador de audio, con cuantizacion afina de 8 bits y group size 64, manteniendo el resto de tensores (escalas, sesgos, normas, stem convolucional) en float16.

El dato mas destacable es que, segun la model card, la cuantizacion no degrada la calidad: sobre 100 fragmentos equilibrados por hablante de LibriSpeech test-clean con decodificacion greedy, el artefacto de 8 bits obtiene el mismo WER (1,94 %) y CER (0,57 %) que el modelo fp16 original, con hipotesis identicas en los 100 clips. Se debe tener en cuenta que la model card del repositorio corresponde al artefacto de moona3k, no al de neilbdesai, una discrepancia relevante que se detalla en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; basada en Qwen3-ASR con codificador de audio y decodificador de texto |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits afina con group size 64 (MLX); el modelo base esta disponible en fp16 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, ru, ar, hi (10 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (cuantizado, compatible con `mlx-qwen3-asr`) |
| Tamano del repositorio | 2,2 GB (descarga indicada: 2,0 GB; fuente fp16: 4,4 GB) |
| Libreria | mlx |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Tarea (pipeline) | automatic-speech-recognition |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3-ASR-1.7B ni su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo unico que la model card especifica es que el modelo consta de un codificador de audio y un decodificador de texto, y que en la version cuantizada todas las capas `Linear` y `Embedding` de ambos modulos estan cuantizadas a 8 bits de forma afina con group size 64 mediante `mlx.nn.quantize`.

En cuanto a la tecnica de cuantizacion, el artefacto mantiene los tensores restantes (escalas, sesgos, normas y el stem convolucional del codificador de audio) en float16, de modo que la inferencia se ejecuta de extremo a extremo en float16. La `lm_head` esta atada a la embedding de tokens en el modelo fuente y no se almacena por duplicado: el cargador vuelve a atarla en tiempo de carga, lo que contribuye al ahorro de espacio. No hay informacion disponible sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de audio a texto (ASR) en 10 idiomas: ingles, chino, japones, coreano, aleman, frances, espanol, ruso, arabe e hindi.
- Generacion de marcas de tiempo a nivel de palabra mediante la opcion `--timestamps` de la herramienta `mlx-qwen3-asr`.
- Servicio de inferencia por HTTP mediante el subcomando `mlx-qwen3-asr serve`, lo que permite desplegarlo como endpoint local.
- Ejecucion integra en Apple Silicon (MLX), sin PyTorch, sin transformers y sin conversion de modelo en el lado del usuario.
- Cuantizacion de 8 bits que, segun la model card, reproduce exactamente las hipotesis del modelo fp16 en LibriSpeech test-clean (100 clips).
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision u otras capacidades adicionales.

## Casos de uso

- Transcripcion local de reuniones en un Mac: el modelo procesa audio en 10 idiomas sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad y gracias al peso reducido de 2,0 GB.
- Subtitulado de video con marcas de tiempo: la opcion `--timestamps` permite generar subtitulos sincronizados a nivel de palabra para contenido en ingles, espanol, frances o aleman, entre otros.
- Servicio de transcripcion autoalojado: mediante `mlx-qwen3-asr serve` se puede exponer un endpoint HTTP local y consumirlo desde aplicaciones internas sin depender de APIs externas.
- Procesamiento por lotes en un portatil Apple Silicon: el modelo cabe en equipos con memoria unificada de 8 GB o mas y no requiere GPU dedicada, lo que facilita automatizar la transcripcion de archivos de audio en un flujo de trabajo de escritorio.
- Preprocesado de datos de voz para pipelines de NLP: transcripcion de corpus de audio en ingles o chino para alimentar posteriormente tareas de analisis, indexacion o busqueda sobre texto.
- Transcripcion multilingue para atencion al cliente: el soporte de arabe, hindi, ruso, japones y coreano permite cubrir conversaciones de soporte en mercados diversos con un unico modelo.
- Integracion en aplicaciones nativas de macOS/iOS: al usar MLX y no requerir CUDA, el artefacto encaja en herramientas de escritorio o aplicaciones Apple que necesiten reconocimiento de voz embebido.

## Benchmarks y rendimiento

Datos publicados en la model card para LibriSpeech test-clean, 100 clips equilibrados por hablante (`speaker_round_robin`), decodificacion greedy, Apple M4 Pro y MLX 0.30.6:

| Modelo | WER | CER |
|---|---:|---:|
| Qwen/Qwen3-ASR-1.7B fp16 | 1,94 % | 0,57 % |
| Este artefacto (8 bits g64) | 1,94 % | 0,57 % |

Segun la model card, las hipotesis son identicas a las de fp16 en los 100 clips. En cuanto a latencia, la matriz de cuantizacion del repositorio (medida sobre la variante 0.6B, no sobre este modelo de 1.7B) indica que la version de 8 bits es aproximadamente 2,4 veces mas rapida que fp16 y la de 4 bits unas 2,7 veces mas rapida sobre un clip de 10 segundos. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (chips de la serie M). La libreria MLX no soporta GPU NVIDIA ni CUDA.
- Memoria: el artefacto ocupa aproximadamente 2,0 GB en disco; cabe holgadamente en equipos con memoria unificada de 8 GB o superior.
- GPU recomendadas: no se aplica el concepto de GPU dedicada; los benchmarks de la model card se realizaron en un Apple M4 Pro.
- Compatibilidad con GPU de consumo: no es compatible con RTX 4090 u otras GPU NVIDIA; si es compatible con Mac de gama de consumo con chip M-series.
- Opciones de despliegue: `mlx-qwen3-asr` (version >= 0.4.1), con CLI, API Python y servidor HTTP. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX.
- Latencia y throughput: no se proporcionan cifras absolutas para este artefacto; solo relaciones relativas frente a fp16 (aproximadamente 2,4x mas rapido en 8 bits, medido sobre la variante 0.6B).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LibriSpeech test-clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (8 bits MLX) | 1,7B | No disponible | 1,94 % | Apache-2.0 | HuggingFace, MLX |
| Qwen/Qwen3-ASR-1.7B (fp16) | 1,7B | No disponible | 1,94 % | Apache-2.0 | HuggingFace |
| Familia Whisper (OpenAI) | No disponible en esta informacion | No disponible | No disponible en esta informacion | MIT (segun versiones) | HuggingFace |

No se dispone de datos de benchmarks verificados para modelos alternativos dentro de la informacion proporcionada, por lo que la comparativa se limita al modelo base fp16, que segun la model card ofrece resultados identicos a este artefacto con el doble de tamano de descarga (4,4 GB frente a 2,0 GB).

## Limitaciones y advertencias

- Discrepancia de identificacion: el ID del repositorio es `neilbdesai/loquen-qwen3-asr-1.7b-8bit`, pero la model card corresponde a `moona3k/mlx-qwen3-asr-1.7b-8bit`. No se puede confirmar que el artefacto de neilbdesai sea identico al descrito ni que comparta los resultados de calidad reportados.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Exclusividad de plataforma: requiere Apple Silicon y MLX; no es utilizable en servidores con GPU NVIDIA, lo que limita su despliegue en infraestructura convencional.
- Dependencia de version: la model card exige `mlx-qwen3-asr >= 0.4.1`; versiones anteriores podrian no cargar el artefacto correctamente.
- La evaluacion de calidad se limita a LibriSpeech test-clean (ingles, lectura limpia) sobre 100 clips; no hay datos publicados sobre audio con ruido, acentos, conversacion espontanea ni sobre el resto de los idiomas soportados.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios especificos.
- No se especifica la longitud de contexto soportada, lo que impide estimar el limite practico de duracion de audio por transcripcion.
- Licencia Apache-2.0, heredada del modelo fuente; permite uso comercial siempre que se respeten las condiciones de la licencia, incluida la atribucion correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neilbdesai/loquen-qwen3-asr-1.7b-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de referencia de la model card: https://github.com/moona3k/mlx-qwen3-asr
- Artefacto de referencia de la model card: https://huggingface.co/moona3k/mlx-qwen3-asr-1.7b-8bit
- Matriz de cuantizacion citada (0.6B): `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md` en el repositorio mlx-qwen3-asr
- Evaluacion por muestra de este artefacto: `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-1.7B_8bit.json` en el repositorio mlx-qwen3-asr
