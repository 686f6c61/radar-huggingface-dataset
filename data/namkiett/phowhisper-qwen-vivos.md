# namkiett/phowhisper-qwen-vivos

## Resumen

PhoWhisper-Qwen ASR (fine-tuned on VIVOS) es un modelo de reconocimiento automático del habla (ASR) para vietnamita publicado por el usuario namkiett en Hugging Face. Se presenta como un "speech-llm": combina la arquitectura PhoWhisper (derivada de Whisper) con componentes de Qwen, y ha sido ajustado sobre el corpus VIVOS Speech Corpus, un conjunto de referencia para ASR en vietnamita. El modelo se distribuye con licencia Apache 2.0 y pipeline `automatic-speech-recognition`.

El repositorio ocupa 6,0 GB y declara 10.230.400 parámetros en los ficheros safetensors, una cifra que no cuadra con el tamaño del repo y que probablemente refleja solo una parte de los pesos (por ejemplo, un proyector o cabecera), no el total del modelo. Esta discrepancia debe tenerse en cuenta al planificar el despliegue: el espacio en disco necesario es de varios gigabytes, muy superior a lo que sugeriría el recuento de parámetros declarado.

La relevancia del modelo es acotada: se trata de un ajuste fino de un modelo ASR orientado a un único idioma (vietnamita) sobre un corpus concreto, con cero descargas y cero likes en el momento de la consulta. Es útil como referencia para experimentos de ASR en vietnamita, pero no hay información publicada sobre su calidad, sus datos de entrenamiento detallados ni sus resultados en benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | speech-llm (PhoWhisper + componentes Qwen); detalle exacto no disponible |
| Parametros totales | 10.230.400 según safetensors (posiblemente parcial; el repo ocupa 6,0 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y código personalizado) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `phowhisper_qwen_asr` y `speech-llm`, lo que sugiere una arquitectura híbrida en la que un codificador de audio de la familia Whisper (PhoWhisper, variante entrenada para vietnamita) se conecta a un modelo de lenguaje de la familia Qwen para la decodificación del texto. El autor no detalla en la model card la composición exacta, el número de capas, la dimensión oculta ni el mecanismo de fusión entre modalidades.

El ajuste se ha realizado sobre el VIVOS Speech Corpus, un corpus de voz en vietnamita ampliamente utilizado en investigación ASR. No se especifican el número de horas de audio, la composición del dataset, la estrategia de entrenamiento (supervisión completa, LoRA, etc.) ni si hubo etapas de RLHF/DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla en vietnamita a partir de ficheros de audio, mediante el método `transcribe("sample.wav")` expuesto por el modelo.
- Integración con `transformers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`, lo que implica carga de código personalizado del repositorio.
- Ejecución en CPU o GPU según disponibilidad de CUDA (el ejemplo de la model card selecciona el dispositivo automáticamente).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR, ni capacidades multilingües distintas del vietnamita.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el modelo recibe un fichero WAV y devuelve texto; es adecuado para prototipos de transcripción por lotes en ese idioma, siempre que se valide la calidad con muestras propias.
- Subtitulado automático de vídeo en vietnamita: integrado en un pipeline que extrae audio (por ejemplo, con ffmpeg) y llama a `transcribe`, puede generar borradores de subtítulos que después se revisan manualmente.
- Investigación en ASR vietnamita: sirve como punto de partida para experimentos de ajuste fino adicional sobre VIVOS u otros corpus, dado que la licencia Apache 2.0 permite modificarlo y redistribuirlo.
- Evaluación comparativa de speech-llms: al combinar PhoWhisper y Qwen, puede utilizarse como baseline en estudios que comparen arquitecturas híbridas de ASR frente a Whisper puro.
- Dictado en aplicaciones internas: para herramientas de productividad en vietnamita donde la latencia no sea crítica y se ejecute en local, evitando enviar audio a servicios en la nube.
- Generación de corpus etiquetados: transcripción masiva de grabaciones para construir datasets de texto alineado con audio, con revisión humana posterior dada la ausencia de métricas publicadas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repo ocupa 6,0 GB, por lo que se recomienda reservar al menos 8 GB de VRAM o de RAM si se carga en FP32/FP16 sin cuantizar.
- GPU recomendadas: no hay datos específicos del autor. Por el tamaño del repo, una GPU con 16 GB o más (RTX 4090, A100, H100) ofrece margen suficiente; una GPU consumer de 8-12 GB podría ser suficiente si el modelo se carga en precisión reducida, pero no está verificado.
- ¿Cabe en GPU consumer? Probablemente sí en tarjetas con 8 GB o más, siempre que se gestione la memoria con cuidado; no confirmado por el autor.
- Opciones de despliegue: carga mediante `transformers` con `trust_remote_code=True` (único método documentado). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, y la presencia de código personalizado complica su integración en servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| namkiett/phowhisper-qwen-vivos | 10.230.400 declarados (repo de 6,0 GB) | no disponible | vi | Apache 2.0 | Ajuste fino sobre VIVOS; sin benchmarks publicados |
| OpenAI Whisper (variantes small/medium/large) | 244M / 769M / 1550M | 30 s de audio por ventana | multilingüe | MIT | Referencia estándar en ASR; ampliamente validado |
| PhoWhisper (VinAI) | no disponible en esta consulta | no disponible | vi | no disponible en esta consulta | Modelo ASR específico para vietnamita del que deriva este ajuste |
| Qwen-Audio / Qwen2-Audio | no disponible en esta consulta | no disponible | multilingüe | no disponible en esta consulta | Familia de speech-llms de Qwen; posible base del componente de lenguaje |

La comparación es limitada porque el autor no publica métricas que permitan contrastar la calidad frente a Whisper o PhoWhisper original.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay WER ni CER publicados, por lo que la calidad real del ajuste sobre VIVOS es desconocida.
- Discrepancia entre parámetros declarados (10,2 M) y tamaño del repo (6,0 GB): conviene inspeccionar los ficheros antes de asumir requisitos de memoria.
- Requiere `trust_remote_code=True`: la carga ejecuta código del repositorio, lo que introduce un riesgo de seguridad que debe evaluarse en entornos de producción.
- Monolingüe: solo se declara vietnamita; no se garantiza comportamiento correcto en otros idiomas.
- Sin información sobre sesgos, dominio de entrenamiento ni robustez ante ruido, acentos regionales o audio de baja calidad.
- Riesgo de alucinación en la transcripción: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o silenciosos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento (0 descargas, 0 likes en la fecha de consulta).
- No se documentan limitaciones de longitud de audio ni estrategias de segmentación para grabaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namkiett/phowhisper-qwen-vivos
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
