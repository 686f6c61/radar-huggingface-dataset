# Audio8/ARK-ASR-3B

## Resumen

ARK-ASR-3B es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Audio8 (también referido como AutoArk-AI). Combina un codificador de audio estilo Whisper con un adaptador MLP y un decodificador basado en Qwen, formando un modelo autoregresivo de transformadores de unos 3 000 millones de parámetros (4,06 B en pesos reales). Está diseñado para transcribir audio de 16 kHz a texto en 19 idiomas, incluyendo chino, inglés, alemán, japonés, francés, coreano, español, polaco, italiano y otras lenguas europeas.

El modelo alcanza el estado del arte actual en el benchmark de inglés de forma corta del Open ASR Leaderboard de Hugging Face, con una WER media del 5,04 % y un factor RTFx de 490,98. Se distribuye bajo licencia Apache-2.0 y requiere código remoto (`trust_remote_code=True`) para su carga. Su relevancia radica en ofrecer una alternativa de código abierto con rendimiento competitivo frente a modelos propietarios, con soporte para inferencia mediante Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper con RoPE + adaptador MLP + decodificador Qwen (autoregresivo) |
| Parametros totales | 4 063 438 848 (4,06 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; admite audio de hasta 30 segundos por defecto (480 000 muestras a 16 kHz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino, ingles, aleman, japones, frances, coreano, español, polaco, italiano, rumano, hungaro, checo, neerlandes, fines, croata, eslovaco, esloveno, estonio, lituano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido: un codificador de audio inspirado en Whisper (con atención RoPE) procesa la señal de 16 kHz y genera representaciones que un adaptador MLP proyecta al espacio del decodificador. Estas representaciones se inyectan en un decodificador Qwen sustituyendo los embeddings de los tokens de marcador de audio antes de generar la transcripción. El modelo se carga mediante código remoto personalizado (`arkasr`) y el pipeline oficial gestiona el procesador, tokenizador, formato de prompt de audio, limpieza de generación y filtrado de tokens ASR.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens vistos ni el uso de técnicas como RLHF o DPO. La arquitectura autoregresiva permite integración con vLLM para servir en producción, y el repositorio oficial incluye scripts de inferencia y evaluación. El modelo está disponible en dos tamaños: 0,6 B y 3 B, siendo este último el que reporta mejores resultados.

## Capacidades

- Transcripción automática del habla multilingüe en 19 idiomas, con soporte para chino e inglés como lenguas principales.
- Generación de texto a partir de audio mediante un decodificador autoregresivo, lo que permite formatear la salida (por ejemplo, puntuación o normalización) según el prompt.
- Inferencia eficiente con atención SDPA y soporte nativo para vLLM, lo que facilita despliegues de alto rendimiento.
- Procesamiento de audio de hasta 30 segundos por defecto, ampliable mediante configuración del parámetro `audio_max_length`.
- Integración con el ecosistema Transformers mediante código remoto, con scripts oficiales de inferencia y evaluación en el repositorio GitHub.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo está especializado exclusivamente en ASR.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo puede transcribir grabaciones de reuniones en varios idiomas europeos y asiáticos, con una WER inferior al 9 % en conjuntos como AMI y Earnings22, lo que lo hace adecuado para generar actas automáticas.
- Subtitulado automático de vídeo: su baja WER en LibriSpeech (1,03 % en clean) permite generar subtítulos precisos para contenido audiovisual en inglés y otros idiomas.
- Asistentes de voz y comandos por voz: al ser un modelo autoregresivo, puede integrarse en pipelines de diálogo donde la transcripción se pasa a un LLM para interpretar intenciones, aunque no incluye tool calling nativo.
- Servicios de accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva, aprovechando el soporte vLLM para baja latencia y alto throughput.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto en múltiples idiomas para su posterior análisis de sentimiento o búsqueda de información, gracias a su licencia permisiva que permite uso comercial.
- Archivado y búsqueda de contenido de audio: indexación de podcasts, entrevistas o archivos históricos mediante transcripción automática, con soporte para 19 idiomas que cubre un amplio espectro geográfico.

## Benchmarks y rendimiento

Resultados del Open ASR Leaderboard de Hugging Face (menor es mejor):

| Modelo | AMI | Earnings22 | GigaSpeech | LS Clean | LS Other | SPGISpeech | VoxPopuli | Avg |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ARK-ASR-3B | 8,79 % | 8,23 % | 6,98 % | 1,03 % | 2,35 % | 2,46 % | 5,47 % | 5,04 % |
| ARK-ASR-0.6B | 10,02 % | 9,77 % | 8,00 % | 1,53 % | 3,51 % | 2,63 % | 6,31 % | 5,97 % |

Resultados en chino (CER, menor es mejor):

| Modelo | AISHELL-1 | WenetSpeech test meeting | WenetSpeech test-net |
| --- | ---: | ---: | ---: |
| ARK-ASR-3B | 1,80 % | 4,97 % | 4,58 % |
| ARK-ASR-0.6B | 2,02 % | 5,92 % | 4,96 % |

El modelo reporta un factor RTFx de 490,98 en el benchmark inglés, lo que indica un rendimiento de inferencia muy alto, aunque no se especifica el hardware utilizado para esta medición.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,06 B de parámetros en bf16, el modelo requiere aproximadamente 8-10 GB de VRAM solo para los pesos, más el overhead del codificador de audio y las activaciones. En fp32, la demanda supera los 16 GB. No se han publicado cifras oficiales.
- GPU recomendadas: para inferencia en producción con vLLM, se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB o H100). Para pruebas locales, una RTX 3060 de 12 GB podría ser suficiente con cuantización, aunque no se ofrecen versiones cuantizadas oficiales.
- ¿Cabe en GPU de consumo? Sí, en GPUs de gama alta con 16 GB o más, siempre que se use bf16 o fp16. En GPUs de 8 GB sería ajustado y probablemente requiera cuantización, no disponible oficialmente.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y atención SDPA, o vLLM mediante los scripts del repositorio oficial. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: el RTFx de 490,98 sugiere un throughput alto, pero no se detalla el hardware ni las condiciones de medición. No hay datos de latencia por segmento.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales frente a otros modelos ASR como Whisper large-v3, Canary o Parakeet en los resultados de búsqueda. A modo cualitativo, ARK-ASR-3B compite directamente con Whisper large-v3 (1,5 B) en tareas multilingües, pero ofrece una arquitectura más moderna (decodificador Qwen) y un rendimiento superior en el benchmark inglés del Open ASR Leaderboard según el autor. Sin embargo, al carecer de mediciones independientes en los mismos conjuntos de datos, no es posible establecer una comparación cuantitativa rigurosa. Se recomienda consultar el leaderboard para ver la posición actual del modelo frente a otras alternativas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al tratarse de un modelo entrenado con datos de habla, puede presentar un rendimiento desigual en acentos, dialectos o registros poco representados.
- Riesgo de alucinación en segmentos de audio ambiguos o con ruido, inherente a los modelos autoregresivos; se recomienda validar transcripciones en contextos críticos.
- La longitud de audio por defecto está limitada a 30 segundos; audios más largos requieren segmentación previa, lo que puede afectar a la coherencia en transcripciones largas.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código remoto no auditado; se recomienda revisar el código en el repositorio antes de usarlo en entornos sensibles.
- Aunque la licencia Apache-2.0 permite uso comercial, no se ofrecen garantías sobre la precisión en dominios específicos (médico, legal, etc.).
- No se proporcionan versiones cuantizadas oficiales, lo que limita su despliegue en hardware de gama baja.
- Los benchmarks publicados provienen del propio autor y no se han verificado de forma independiente en todos los conjuntos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audio8/ARK-ASR-3B
- Repositorio GitHub (código de entrenamiento, inferencia y evaluación): https://github.com/AutoArk/open-audio-opd
- Paper en arXiv: https://arxiv.org/abs/2605.28139
- Open ASR Leaderboard (referencia de benchmarks): https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
