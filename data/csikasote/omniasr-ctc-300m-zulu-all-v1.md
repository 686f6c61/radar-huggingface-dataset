# csikasote/omniASR-CTC-300m-Zulu-All-v1

## Resumen

El modelo `csikasote/omniASR-CTC-300m-Zulu-All-v1` es un sistema de reconocimiento automático del habla (ASR) especializado en isiZulu, desarrollado por Claytone Sikasote mediante fine-tuning del modelo base `facebook/omniASR-CTC-300M` de Meta. OmniASR es una familia de modelos ASR omnilingües de código abierto, y esta variante CTC (Connectionist Temporal Classification) ofrece un equilibrio entre velocidad y precisión para transcripción en tiempo real. El modelo está entrenado para el idioma isiZulu (`zul_Latn`) y alcanza un WER (Word Error Rate) de validación de 27,25 en el mejor checkpoint (paso 80.000). Su relevancia radica en que aborda un idioma de bajos recursos, donde los sistemas comerciales suelen tener cobertura limitada, y democratiza el acceso a ASR de calidad para lenguas africanas.

La arquitectura se basa en el encoder transformer de OmniASR con una cabeza CTC, lo que permite inferencia rápida sin necesidad de autoregresión. El modelo tiene aproximadamente 300 millones de parámetros, según indica el nombre del modelo base, y se distribuye en formato de checkpoint nativo de fairseq2, no directamente compatible con la API estándar de HuggingFace Transformers. El repositorio incluye el checkpoint, el tokenizador, archivos de configuración y un script de ejemplo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con decodificacion CTC (basado en OmniASR CTC 300M) |
| Parametros totales | 300 millones (estimado segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventanas de audio tipicas para ASR, no especificado) |
| Tipos de cuantizacion | no disponible (formato nativo fairseq2, sin cuantizaciones publicadas) |
| Idiomas soportados | isiZulu (zul_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo fairseq2 (`.pt`), tokenizador `.model` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OmniASR CTC 300M de Meta, que emplea un encoder transformer con una capa de clasificación temporal conexionista (CTC) para producir transcripciones de forma no autoregresiva. Esta elección permite una inferencia significativamente más rápida que los modelos seq2seq, manteniendo una precisión competitiva, especialmente en tareas de transcripción en tiempo real. El modelo original fue entrenado con datos multilingües extensos, y esta variante ha sido fine-tuneada específicamente para isiZulu.

El fine-tuning se realizó sobre el checkpoint base de OmniASR CTC 300M, utilizando datos de habla en isiZulu. El entrenamiento se ejecutó durante 80.000 pasos, alcanzando un WER de validación de 27,25 en el mejor checkpoint (paso 80.000) y un WER final de 27,3. No se especifica el dataset de entrenamiento utilizado, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint completo de entrenamiento no se incluye en la publicación, solo el mejor checkpoint para inferencia.

## Capacidades

- Transcripción de audio en isiZulu a texto, con decodificación CTC rápida y eficiente.
- Inferencia en tiempo real gracias a la arquitectura no autoregresiva.
- Soporte para audio de entrada variable (típico en sistemas ASR).
- Integración con el ecosistema fairseq2, permitiendo personalización y extensión.
- No se documentan capacidades de traducción, diarización de hablantes ni reconocimiento de emociones.
- No se indica soporte para tool calling, agentes o razonamiento multi-step, ya que es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en isiZulu a texto, facilitando la generación de actas y la búsqueda de contenido. Su baja latencia lo hace adecuado para procesamiento por lotes o en streaming.
- Subtitulado automático de vídeos: integrado en pipelines de postproducción, permite generar subtítulos para contenido audiovisual en isiZulu, mejorando la accesibilidad en medios locales.
- Asistentes de voz para aplicaciones móviles: al ser un modelo ligero (300M parámetros), puede desplegarse en servidores o dispositivos con recursos moderados para habilitar comandos de voz en isiZulu.
- Archivado y búsqueda de contenido de audio: transcripción de bibliotecas de audio (radio, podcasts, archivos históricos) para indexación y recuperación de información.
- Investigación lingüística: herramienta para estudiar la fonética y variaciones dialectales del isiZulu, generando corpus transcritos automáticamente.
- Servicios de accesibilidad: conversión de contenido hablado a texto para personas con discapacidad auditiva, en contextos donde el isiZulu es la lengua principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato reportado es el WER de validación del modelo fine-tuneado:

| Metrica | Valor |
|---|---|
| WER de validación (mejor checkpoint) | 27,25 |
| WER de validación (final) | 27,3 |

No se proporcionan comparaciones con otros modelos ASR en isiZulu ni resultados en conjuntos de datos estándar como Common Voice o FLEURS.

## Requisitos de hardware

- El modelo tiene aproximadamente 300 millones de parámetros, por lo que en FP32 ocupa alrededor de 1,2 GB de memoria. Con cuantización (si estuviera disponible) podría reducirse a ~300-600 MB.
- VRAM estimada para inferencia: 2-4 GB en FP32, dependiendo del tamaño de lote y la longitud del audio. Es factible ejecutarlo en GPUs de consumo como NVIDIA GTX 1060 6GB o superiores.
- GPU recomendadas: RTX 3060, RTX 4090, A100, H100, según el throughput deseado.
- El modelo es nativo de fairseq2; no se mencionan conversiones a formatos como GGUF o ONNX. Para su uso con vLLM, llama.cpp u Ollama se requeriría una conversión previa no documentada.
- Opciones de despliegue: scripts de inferencia con fairseq2, posible integración en frameworks de ASR como TorchAudio o SpeechBrain tras conversión.
- Latencia y throughput: no disponibles. Dado que es un modelo CTC, se espera una latencia menor que los modelos autoregresivos, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Sin embargo, se puede contextualizar frente a alternativas genéricas:

| Modelo | Parámetros | Idioma | WER (isiZulu) | Licencia | Formato |
|---|---|---|---|---|---|
| csikasote/omniASR-CTC-300m-Zulu-All-v1 | 300M | isiZulu | 27,25 | Apache 2.0 | fairseq2 |
| facebook/omniASR-CTC-300M (base) | 300M | Multilingüe | no disponible | Apache 2.0 | fairseq2 |
| OpenAI Whisper (large-v3) | 1550M | Multilingüe | no disponible (típicamente <10 en lenguas mayoritarias) | MIT | PyTorch, GGUF |

Whisper es un modelo mucho más grande y con mejor rendimiento en lenguas con muchos datos, pero para isiZulu (lengua de bajos recursos) su precisión puede ser inferior a la de un fine-tuning específico. No obstante, no hay benchmarks directos disponibles.

## Limitaciones y advertencias

- WER de 27,25 indica que aproximadamente 1 de cada 4 palabras se transcribe incorrectamente; no es adecuado para transcripción médica o legal sin revisión humana.
- El modelo solo soporta isiZulu; no hay capacidades multilingües.
- El formato de checkpoint es nativo de fairseq2 y no es directamente cargable con `AutoModelForCTC` de Transformers; se requiere conversión o uso del script de ejemplo.
- El checkpoint de entrenamiento completo no está disponible, solo el mejor checkpoint para inferencia.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos limitados de una lengua concreta, puede tener un rendimiento degradado en acentos o variantes dialectales no representadas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no tengan restricciones adicionales.
- No se especifica la longitud máxima de audio soportada; para audios largos puede ser necesario segmentar.
- No hay información sobre la robustez frente a ruido, solapamiento de hablantes o calidad de audio variable.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/csikasote/omniASR-CTC-300m-Zulu-All-v1)
- [Documentación de modelos CTC en omnilingual-asr (DeepWiki)](https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr))
- [Perfil de GitHub del autor](https://github.com/csikasote)
- [README de tarjetas de modelos en el repositorio omnilingual-asr](https://github.com/facebookresearch/omnilingual-asr/blob/main/src/omnilingual_asr/cards/README.md)
