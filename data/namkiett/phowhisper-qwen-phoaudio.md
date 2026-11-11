# namkiett/phowhisper-qwen-phoaudio

## Resumen

PhoWhisper-Qwen ASR (fine-tuned on PhoAudiobook) es un modelo de reconocimiento automático del habla (ASR) para vietnamita publicado por el usuario namkiett en Hugging Face. Se presenta como un "speech-llm" construido a partir de un checkpoint PhoWhisper previamente ajustado sobre VIVOS y posteriormente afinado sobre el corpus de audiolibros PhoAudiobook (`thivux/phoaudiobook`). La arquitectura declarada en los tags es `phowhisper_qwen_asr`, lo que sugiere una integración de un encoder estilo Whisper con componentes derivados de Qwen, aunque la model card no detalla la composición exacta.

El dato más llamativo es la discrepancia entre el tamaño del repositorio (8,3 GB) y el recuento de parámetros en safetensors (10.230.400, es decir, unos 10,2 millones). Un modelo de 10 millones de parámetros difícilmente ocupa 8,3 GB en pesos, por lo que es probable que el recuento corresponda solo a un submódulo o que el repositorio incluya otros artefactos (tokenizadores, checkpoints múltiples, ficheros de configuración con código personalizado). Esta inconsistencia debe tenerse en cuenta antes de cualquier despliegue.

El modelo es relevante por su nicho: ASR en vietnamita sobre dominio de audiolibros, un registro con características acústicas y léxicas distintas al habla conversacional típica de benchmarks como VIVOS. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de métricas publicadas y de documentación técnica limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `phowhisper_qwen_asr` (speech-llm; composición exacta no disponible) |
| Parametros totales | 10.230.400 (según safetensors; posible discrepancia con el tamaño del repo) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code=True`, código personalizado) |

## Arquitectura y entrenamiento

La model card indica que el modelo parte de un checkpoint PhoWhisper ya ajustado sobre VIVOS y se afina de nuevo sobre PhoAudiobook. El tag `phowhisper_qwen_asr` y la mención a "speech-llm" apuntan a una arquitectura híbrida: un encoder acústico (probablemente basado en Whisper) conectado a un decoder o módulo lingüístico de la familia Qwen. No se especifica el número de capas, dimensión oculta, mecanismo de atención ni el tipo de proyección entre modalidades.

Tampoco se documentan el volumen de datos de entrenamiento (horas de audio de PhoAudiobook), la composición del corpus, la estrategia de tokenización, ni si hubo etapas de alineación o ajuste con preferencias. La única innovación declarada es el propio pipeline de doble fine-tuning (VIVOS → PhoAudiobook) para adaptar el modelo al dominio de audiolibros. No hay información sobre técnicas como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Reconocimiento automático del habla en vietnamita a partir de ficheros de audio, mediante el método `model.transcribe("sample.wav")` expuesto en la model card.
- Especialización en el dominio de audiolibros (PhoAudiobook), con estilo de locución narrativa.
- Integración con `transformers` mediante `AutoModel.from_pretrained` y `trust_remote_code=True`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del vietnamita.
- No se documentan modos especiales (thinking, visión, audio de entrada adicional, diarización, timestamps).

## Casos de uso

- Transcripción de audiolibros y contenido narrativo: el ajuste específico sobre PhoAudiobook lo hace adecuado para convertir catálogos de libros narrados en texto indexable, un escenario donde los ASR genéricos suelen fallar por vocabulario literario y prosodia de locución.
- Generación de subtítulos para vídeo educativo en vietnamita: el modelo puede transcribir locuciones monologadas con menor tasa de error esperada que un ASR entrenado solo con habla espontánea, aunque no se publican métricas que lo confirmen.
- Archivística y digitalización de fondos sonoros: útil para crear transcripciones buscables de grabaciones narrativas o conferencias con un solo hablante.
- Preprocesado para pipelines de TTS o de resumen: las transcripciones sirven como entrada a modelos de resumen o a sistemas de síntesis de voz en vietnamita.
- Investigación en ASR de bajos recursos: al estar bajo Apache 2.0 y en safetensors, es un punto de partida reproducible para experimentos de adaptación de dominio en vietnamita.
- Evaluación comparativa de checkpoints PhoWhisper: sirve como referencia para medir el efecto del fine-tuning sobre audiolibros frente al checkpoint base de VIVOS.
- Prototipado rápido en aplicaciones de accesibilidad: transcripción de audiolibros para personas con discapacidad auditiva, siempre que se valide la calidad en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Si el recuento de 10,2 M de parámetros fuese correcto, la inferencia cabría en menos de 1 GB en fp32; sin embargo, el repositorio ocupa 8,3 GB, lo que sugiere que el modelo real es mucho mayor o que incluye artefactos adicionales. Se recomienda inspeccionar los ficheros safetensors antes de dimensionar el hardware.
- GPU recomendadas: no disponible. Como referencia general para modelos ASR de tamaño medio, una RTX 3090/4090 (24 GB) o una A10G (24 GB) suelen ser suficientes; para un modelo de varios miles de millones de parámetros haría falta A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño real de los pesos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de audio con código personalizado, la integración con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| namkiett/phowhisper-qwen-phoaudio | 10,2 M (según safetensors; dudoso) | no disponible | vi | Apache 2.0 | Fine-tuning sobre PhoAudiobook; sin benchmarks |
| PhoWhisper (VinAI) | no disponible en esta ficha | no disponible | vi | no disponible en esta ficha | Modelo base del que deriva el checkpoint; referencia habitual para ASR en vietnamita |
| Whisper (OpenAI) | 39 M – 1,55 B según variante | 30 s de audio por ventana | multilingüe | MIT | ASR generalista; no especializado en vietnamita ni en audiolibros |
| Qwen-Audio | no disponible en esta ficha | no disponible | multilingüe | no disponible en esta ficha | Familia de speech-llm; posible origen del componente Qwen |

La comparación es cualitativa: no hay datos de WER ni de parámetros verificables para el modelo evaluado. Cualquier elección entre estas alternativas debería basarse en una evaluación propia sobre el corpus objetivo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay WER ni CER publicados, ni sobre VIVOS ni sobre PhoAudiobook, lo que impide validar las afirmaciones de calidad.
- Discrepancia entre parámetros declarados (10,2 M) y tamaño del repositorio (8,3 GB): riesgo de que el modelo real sea distinto del anunciado; verificar los safetensors antes de producción.
- Requiere `trust_remote_code=True`: ejecuta código del autor, con el riesgo de seguridad y mantenimiento que ello implica.
- Solo vietnamita: no apto para otros idiomas sin un ajuste adicional.
- Dominio estrecho: el fine-tuning sobre audiolibros puede degradar el rendimiento en habla espontánea, conversacional o con ruido de fondo.
- Sin información sobre sesgos: no se documentan sesgos de género, dialectales ni de vocabulario.
- Riesgo de alucinación en ASR: como todo modelo generativo de transcripción, puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o silencios.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las licencias del checkpoint base PhoWhisper y de los datos PhoAudiobook.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/namkiett/phowhisper-qwen-phoaudio
- Dataset PhoAudiobook: https://huggingface.co/datasets/thivux/phoaudiobook
- Repositorio PhoWhisper (VinAI): no disponible en la información proporcionada
- Paper de PhoWhisper: no disponible en la información proporcionada
- Repositorio de Qwen: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
