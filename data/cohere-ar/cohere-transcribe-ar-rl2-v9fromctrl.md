# Cohere-AR/cohere-transcribe-ar-rl2-v9fromctrl

## Resumen

Cohere-AR/cohere-transcribe-ar-rl2-v9fromctrl es un modelo de reconocimiento automático del habla (ASR) desarrollado por la organización Cohere-AR, especializado en árabe e inglés con soporte explícito para code-switching y audio telefónico. Se trata de un fine-tuning del modelo Cohere-AR/cohere-transcribe-ar-rl-v9ctrl, orientado a transcripción en dominios conversacionales y de telefonía, donde la alternancia de idiomas entre árabe e inglés es habitual.

El modelo cuenta con aproximadamente 2.070 millones de parámetros (2.065.770.752 según los pesos en safetensors) y se distribuye en formato safetensors bajo la librería transformers, con un tamaño de repositorio de 4,1 GB. Está etiquetado como compatible con endpoints y con la arquitectura `cohere_asr`, lo que indica que sigue la familia de modelos ASR de Cohere adaptada al pipeline `automatic-speech-recognition`.

Su relevancia radica en la combinación de tres factores poco frecuentes en modelos ASR abiertos: cobertura específica del árabe con mezcla de inglés, entrenamiento orientado a audio telefónico (canal de banda estrecha y ruido de línea) y un proceso de refinamiento por RL sobre un checkpoint previo (`rl2` sobre `rl-v9ctrl`). El acceso está restringido (gated) y la licencia no está publicada en la información disponible, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cohere_asr (modelo ASR de la familia Cohere, detalles internos no disponibles) |
| Parametros totales | 2.065.770.752 (~2,07 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | árabe (ar), inglés (en), con soporte de code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | automatic-speech-recognition |
| Librería | transformers |
| Modelo base | Cohere-AR/cohere-transcribe-ar-rl-v9ctrl |
| Acceso | restringido (gated) en HuggingFace |
| Tamaño del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la arquitectura `cohere_asr` y se distribuye como un checkpoint de transformers para la tarea de reconocimiento automático del habla. No se detallan en la ficha pública el número de capas, la dimensión oculta, el tipo de encoder de audio (por ejemplo, Conformer o transformer con atención sobre features acústicas), ni el tokenizador o decodificador empleado. El tamaño de 2,07 B de parámetros sitúa al modelo en la gama media-alta para ASR, compatible con despliegues en GPU de 24 GB en adelante según precisión.

El nombre del checkpoint (`rl2-v9fromctrl`) y el modelo base (`cohere-transcribe-ar-rl-v9ctrl`) sugieren un proceso de ajuste fino iterativo con refuerzo (RL) sobre una versión previa controlada (`ctrl`), orientado a mejorar la transcripción en dominios concretos. No se especifican en la información proporcionada el volumen de horas de audio, la composición del dataset, ni si se aplicaron técnicas como especulación, decodificación con LM externo o atención lineal. Tampoco se documentan detalles sobre el preprocesado de audio telefónico (muestreo, filtrado, aumento de datos con ruido de canal).

## Capacidades

- Transcripción de voz a texto en árabe e inglés, con soporte explícito de code-switching intra-frase entre ambos idiomas.
- Reconocimiento de audio telefónico (canal de banda estrecha, ruido de línea, posibles artefactos de compresión).
- Integración con el pipeline `automatic-speech-recognition` de transformers, lo que permite su uso con `pipeline("automatic-speech-recognition", ...)`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita el despliegue como servicio gestionado o mediante Inference Endpoints.
- No se documentan capacidades de diarización de hablantes, detección de emociones, traducción directa voz-a-texto entre idiomas ni tool calling; la información disponible no las confirma.
- No se indica soporte de marcas de tiempo a nivel de palabra o segmento, aunque es habitual en modelos ASR; se desconoce si este checkpoint las expone.

## Casos de uso

- Transcripción de llamadas de atención al cliente en centros bilingües árabe-inglés: el modelo está entrenado específicamente para audio telefónico y code-switching, lo que reduce errores en conversaciones donde el operador y el cliente alternan idiomas. Se usaría con el pipeline de transformers sobre grabaciones en formato WAV de 8 kHz.
- Generación de subtítulos y actas para reuniones con participantes árabes que introducen terminología técnica en inglés: el soporte de code-switching permite transcribir sin forzar un idioma único ni segmentar manualmente por idioma.
- Análisis de calidad y cumplimiento en call centers: transcripción masiva de grabaciones para búsqueda de palabras clave, detección de frases de riesgo y auditoría, aprovechando el ajuste específico a telefonía.
- Indexación y búsqueda semántica de archivos de audio en árabe: convertir grabaciones (podcasts, entrevistas, notas de voz) a texto para alimentar motores de búsqueda o sistemas RAG.
- Accesibilidad: subtitulado en tiempo casi real de contenido audiovisual en árabe con intervenciones en inglés, desplegando el modelo detrás de un servicio de streaming por fragmentos.
- Preprocesado para pipelines de NLP en árabe: transcripción previa a tareas de resumen, clasificación de intenciones o extracción de entidades en asistentes conversacionales.
- Evaluación comparativa de ASR en dominios telefónicos: servir como referencia de fine-tuning específico frente a modelos multilingües generalistas en benchmarks internos de árabe dialectal y code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 8,3 GB solo para pesos (2,07 B × 4 bytes), más memoria para activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: aproximadamente 4,1 GB para pesos, más overhead; un despliegue realista en fp16 requiere del orden de 6-8 GB de VRAM.
- VRAM estimada en int8: aproximadamente 2,1 GB para pesos; en int4, alrededor de 1,1 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A10G (24 GB), L4 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB) para mayor throughput y lotes grandes. Cabe en GPUs de consumo con 8 GB o más en fp16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) si se ajusta el tamaño de lote.
- Opciones de despliegue: transformers con `pipeline` (soporte nativo), Inference Endpoints (tag `endpoints_compatible`), TGI si se añade soporte para la arquitectura `cohere_asr`, y servidores propios con PyTorch. No se confirma compatibilidad con vLLM, llama.cpp u Ollama, ya que no se publican pesos GGUF y la arquitectura es específica de ASR.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa no verificada, un modelo de ~2 B en una GPU moderna suele procesar audio en tiempo real o más rápido, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-rl2-v9fromctrl | ~2,07 B | ar, en (code-switching) | no disponible | no disponible | gated | Fine-tuning RL sobre checkpoint `ctrl`; foco en telefonía |
| Whisper large-v3 (OpenAI) | ~1,55 B | multilingüe (99 idiomas) | 30 s de audio por ventana | MIT | abierto | Referencia generalista; sin foco específico en code-switching ar-en ni telefonía |
| MMS (Meta) | ~1 B (por idioma) | más de 1.100 idiomas | no aplica (ASR por idioma) | CC-BY-NC 4.0 | abierto | Cobertura amplia pero no especializado en mezcla ar-en |
| SeamlessM4T v2 (Meta) | ~2,3 B | multilingüe | no disponible | CC-BY-NC 4.0 | abierto | Traducción y ASR; no orientado a telefonía |

La comparativa se basa en características públicas de modelos de la misma categoría; no se dispone de métricas de error (WER) de este checkpoint para confrontar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Licencia no publicada: no se puede confirmar el uso comercial; al estar el acceso restringido, es necesario aceptar condiciones en HuggingFace y revisar los términos del autor antes de desplegarlo en producción.
- Sesgos potenciales: al estar especializado en árabe e inglés y en audio telefónico, el rendimiento puede degradarse con otros dialectos árabes, acentos no vistos o audio de alta fidelidad (estudio, música, reverberación).
- Riesgo de alucinación: como todo modelo ASR generativo, puede producir transcripciones plausibles pero incorrectas en segmentos con ruido extremo, silencios largos o solapamiento de hablantes.
- Limitaciones de idioma: solo se declaran ar y en; no hay soporte documentado para otras lenguas ni para transliteración.
- Sin datos de benchmarks: no es posible estimar el WER esperado frente a Whisper u otros modelos sin evaluación propia.
- Restricciones de despliegue: la arquitectura `cohere_asr` puede no estar soportada por todos los servidores de inferencia (vLLM, TGI, llama.cpp); conviene validar la compatibilidad con transformers antes de integrar.
- Ausencia de cuantizaciones oficiales: no se publican pesos GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con poca VRAM sin conversión manual.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de confiar en él para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-rl2-v9fromctrl
- Modelo base: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-rl-v9ctrl
- Organización Cohere-AR: https://huggingface.co/Cohere-AR
- Documentación del pipeline ASR de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
