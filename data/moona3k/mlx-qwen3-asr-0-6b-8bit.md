# moona3k/mlx-qwen3-asr-0.6b-8bit

## Resumen

`moona3k/mlx-qwen3-asr-0.6b-8bit` es una cuantización a 8 bits del modelo de reconocimiento automático de voz `Qwen/Qwen3-ASR-0.6B`, publicada por el usuario moona3k para su propia reimplementación en MLX, `mlx-qwen3-asr`. El artefacto no es un fine-tune ni un modelo nuevo: es el mismo modelo base convertido a un formato nativo de MLX, sin PyTorch, sin `transformers` y sin paso de conversión por parte del usuario. Se distribuye bajo licencia Apache-2.0, igual que el modelo de origen.

El modelo base es un sistema ASR de aproximadamente 600 millones de parámetros con arquitectura de codificador de audio más decodificador de texto, entrenado por el equipo Qwen para transcripción multilingüe en diez idiomas: inglés, chino, japonés, coreano, alemán, francés, español, ruso, árabe e hindi. La versión cuantizada ocupa 801 MB frente a los 1,8 GB de la versión fp16 original, es decir, menos de la mitad, manteniendo según el autor hipótesis idénticas en la evaluación realizada.

Su relevancia es doble. Por un lado, permite ejecutar un modelo ASR multilingüe en cualquier Mac con Apple Silicon sin depender de CUDA ni de infraestructura en la nube. Por otro, el autor documenta que la cuantización a 8 bits no degrada la calidad respecto a fp16 en la prueba publicada, y que además es aproximadamente 2,4 veces más rápida, lo que lo convierte en una opción atractiva para transcripción local de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador de audio y decodificador de texto (Qwen3-ASR); todas las capas `Linear` y `Embedding` de ambos módulos cuantizadas de forma afín |
| Parametros totales | 0,6B (aproximadamente 600 millones, segun el nombre del modelo base) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con group size 64 sobre pesos de `Linear` y `Embedding`; escalas, sesgos, normalizaciones y el stem convolucional en float16. El repositorio del autor menciona tambien una variante de 4 bits en su matriz de cuantizacion |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, ru, ar, hi (10 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (`library_name: mlx`); tensores flotantes restantes en float16; `lm_head` re-atado al embedding de tokens en tiempo de carga. Tamano de descarga: 801 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-ASR: un codificador de audio seguido de un decodificador de texto de tipo transformer. El proceso de cuantización descrito en la model card aplica cuantización afín de 8 bits con group size 64 mediante `mlx.nn.quantize` a todas las capas `Linear` y `Embedding` tanto del decodificador de texto como del codificador de audio. Los tensores que permanecen en coma flotante (escalas, sesgos, capas de normalización y el stem convolucional) se almacenan en float16, de modo que la inferencia se ejecuta de extremo a extremo en float16. El `lm_head` está atado al embedding de tokens en el modelo fuente, por lo que no se duplica en disco y el cargador lo vuelve a atar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento: esos detalles corresponden al modelo original `Qwen/Qwen3-ASR-0.6B` y no se documentan en esta ficha. La innovación técnica de este artefacto concreto es la reimplementación nativa en MLX, que elimina la dependencia de PyTorch y de una fase de conversión en el lado del usuario, y la verificación empírica de que la cuantización a 8 bits con group size 64 preserva las hipótesis del modelo en fp16 en la evaluación publicada.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) como tarea principal, con pipeline `automatic-speech-recognition`.
- Transcripción multilingüe en diez idiomas: inglés, chino, japonés, coreano, alemán, francés, español, ruso, árabe e hindi.
- Marcas de tiempo a nivel de palabra mediante la opción `--timestamps` de la herramienta de línea de comandos.
- Ejecución como servidor HTTP local mediante `mlx-qwen3-asr serve --model moona3k/mlx-qwen3-asr-0.6b-8bit`, lo que permite integrarlo como servicio de transcripción.
- Inferencia en float16 de extremo a extremo sobre Apple Silicon gracias a MLX, sin pasos de conversión por parte del usuario.
- Cuantización transparente: el usuario carga el artefacto con el mismo código que usaría con el modelo sin cuantizar.

No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio más allá de la propia transcripción.

## Casos de uso

- Transcripción local de reuniones en un Mac: el modelo convierte audio de reuniones a texto sin enviar datos a servicios externos, algo relevante para equipos con requisitos de confidencialidad. El consumo de 801 MB de pesos lo hace viable en portátiles con memoria unificada.
- Subtitulado automático de vídeo con marcas de tiempo: la opción `--timestamps` genera marcas a nivel de palabra, lo que permite construir ficheros de subtítulos con sincronización fina en pipelines de postproducción.
- Servicio interno de dictado: levantando `mlx-qwen3-asr serve`, un equipo puede desplegar un endpoint HTTP de transcripción en una máquina Apple Silicon y consumirlo desde aplicaciones internas de notas de voz o documentación.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo histórico de grabaciones para alimentar un motor de búsqueda de texto completo, con la ventaja de que todo el procesamiento ocurre en local.
- Atención al cliente con análisis de llamadas: transcripción de grabaciones de soporte para análisis de calidad, detección de temas recurrentes y generación de resúmenes posteriores, en los diez idiomas soportados por el modelo.
- Prototipado e investigación en ASR sobre Apple Silicon: al ser una implementación nativa en MLX con scripts de conversión y evaluación publicados (`scripts/convert.py`, `scripts/eval_librispeech.py`), sirve como base para experimentar con cuantizaciones y comparar calidad frente a fp16.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos de vídeo o audio, ejecutable en el propio equipo del usuario final.
- Preprocesado de datos de voz para entrenamiento de otros modelos: transcripción de corpus de audio propios antes de utilizarlos en tareas posteriores de etiquetado o fine-tuning.

## Benchmarks y rendimiento

El autor publica resultados sobre LibriSpeech test-clean con 100 clips balanceados por hablante (`speaker_round_robin`), decodificación greedy, en un Apple M4 Pro con MLX 0.30.6.

| Modelo | WER | CER |
|---|---:|---:|
| `Qwen/Qwen3-ASR-0.6B` fp16 | 2,33% | 0,59% |
| Este artefacto (8 bits, g64) | 2,33% | 0,59% |

Según la model card, las hipótesis generadas son idénticas a las de fp16 en los 100 clips evaluados.

En cuanto a latencia, el autor indica que la variante de 8 bits es aproximadamente 2,4 veces más rápida que fp16 en un clip de 10 segundos, y que la de 4 bits es aproximadamente 2,7 veces más rápida, según la matriz de cuantización comprometida en `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md`. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, ya que no son aplicables a un modelo ASR. Tampoco hay evaluación multilingüe publicada en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante MLX. No hay soporte CUDA ni ROCm para este artefacto, por lo que no puede ejecutarse en GPUs NVIDIA o AMD.
- Memoria: los pesos ocupan 801 MB. Con escalas, sesgos, cachés de activaciones y el runtime de MLX, el consumo práctico se sitúa en torno a 1,5-2 GB de memoria unificada, por lo que cabe en cualquier Mac con 8 GB de RAM o más.
- GPU recomendadas: el autor reporta mediciones en un Apple M4 Pro. Chips de la familia M1, M2, M3 y M4 (base, Pro, Max y Ultra) son los objetivos naturales del artefacto.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon. No es ejecutable en una RTX 4090 ni en GPUs de datacenter convencionales por la ausencia de backend MLX.
- Opciones de despliegue: CLI (`mlx-qwen3-asr audio.wav --model ...`), API de Python (`import mlx_qwen3_asr as m`) y servidor HTTP (`mlx-qwen3-asr serve`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 2,4 veces más rápido que la versión fp16 sobre un clip de 10 segundos en Apple M4 Pro. No se publican cifras absolutas de latencia ni de throughput en tiempo real.
- Dependencias: requiere `mlx-qwen3-asr >= 0.4.1` (el script de reproducción usa el tag v0.4.3) y MLX 0.30.6 en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LibriSpeech test-clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (8 bits, g64) | 0,6B | no disponible | 2,33% | Apache-2.0 | MLX, Apple Silicon, 801 MB |
| `Qwen/Qwen3-ASR-0.6B` fp16 | 0,6B | no disponible | 2,33% | Apache-2.0 | Safetensors, orientado a PyTorch, 1,8 GB |
| Otros modelos ASR multilingues de tamano similar (por ejemplo Whisper large-v3) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita al modelo fuente en fp16, sobre el que este artefacto no muestra degradación medible en la prueba publicada y ofrece una reducción de tamaño de 1,8 GB a 801 MB junto con una ganancia de velocidad de aproximadamente 2,4x. No se han proporcionado datos que permitan comparar de forma rigurosa con alternativas como Whisper u otros sistemas ASR multilingües.

## Limitaciones y advertencias

- Dependencia de plataforma: solo funciona en Apple Silicon con MLX. No hay ruta de despliegue en GPUs NVIDIA, en servidores x86 con CUDA ni en entornos de nube convencionales, lo que descarta su uso en la mayoría de infraestructuras de producción actuales.
- Dependencia de versión: requiere `mlx-qwen3-asr >= 0.4.1`; versiones anteriores de la librería no cargarán el artefacto.
- Evaluación limitada: el único resultado publicado corresponde a LibriSpeech test-clean (inglés, habla leída y limpia) con 100 clips. No hay evaluación en audio espontáneo, con ruido, con acentos, con solapamiento de hablantes ni en los otros nueve idiomas declarados.
- La afirmación de hipótesis idénticas a fp16 se basa en 100 clips; no es una garantía de equivalencia general, aunque sí una señal sólida de que la cuantización a 8 bits con group size 64 es conservadora.
- Riesgo de alucinación: no se documenta en la model card, pero es un comportamiento conocido en modelos ASR cuando el audio es ruidoso, silencioso o contiene música; conviene validar con datos propios antes de usar las transcripciones en flujos automatizados sin revisión.
- Idiomas: aunque se declaran diez idiomas, no se especifica el nivel de calidad por idioma. La ausencia de benchmarks multilingües impide asumir un rendimiento uniforme; el español, por ejemplo, no tiene métricas publicadas.
- Metadatos de adopción: el artefacto registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad ni un historial de incidencias conocido.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales más allá de la atribución habitual, pero el usuario debe verificar también las condiciones del modelo base y del dataset de audio que procese.
- No se documentan capacidades de tool calling, agentes ni post-procesado del texto; cualquier flujo que necesite esas funciones debe construirse por encima del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moona3k/mlx-qwen3-asr-0.6b-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de la implementación MLX: https://github.com/moona3k/mlx-qwen3-asr
- Matriz de cuantización (referenciada en la model card): `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md` dentro del repositorio
- Resultados por muestra de este artefacto: `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-0.6B_8bit.json` dentro del repositorio
