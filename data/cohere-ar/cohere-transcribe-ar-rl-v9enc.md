# Cohere-AR/cohere-transcribe-ar-rl-v9enc

## Resumen

Cohere-AR/cohere-transcribe-ar-rl-v9enc es un modelo de reconocimiento automático del habla (ASR) desarrollado por Cohere-AR, una organización centrada en el procesamiento del árabe. El modelo se construye mediante un ajuste fino por aprendizaje por refuerzo (RL) sobre la base Cohere-AR/cohere-transcribe-ar-sft-v9-full, que a su vez parte de un entrenamiento supervisado. Está diseñado específicamente para transcripción de árabe e inglés, con atención particular a escenarios de code-switching (alternancia de idiomas en una misma conversación) y audio telefónico.

Con aproximadamente 2.066 millones de parámetros (2,07 B), el modelo se distribuye en formato safetensors y es compatible con la librería transformers mediante el pipeline `automatic-speech-recognition`. Su relevancia radica en cubrir un nicho poco atendido: ASR robusto para árabe conversacional y mezcla árabe-inglés en contextos de telefonía, donde muchos modelos multilingües generalistas rinden por debajo de lo esperado.

El acceso al modelo está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo. No se especifica la licencia en la información disponible, lo que supone una limitación importante para evaluar su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `cohere_asr`; no se detalla la topología interna) |
| Parametros totales | 2.065.770.752 (~2,07 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar (árabe), en (inglés); con soporte declarado de code-switching |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | automatic-speech-recognition |
| Modelo base | Cohere-AR/cohere-transcribe-ar-sft-v9-full |
| Acceso | restringido (gated) |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `cohere_asr` y el pipeline de transformers asociado. Por el tamaño (2,07 B de parámetros) y el dominio (ASR), cabe situarlo en la familia de modelos encoder-decoder o encoder con cabeza de transcripción, pero no se confirma la topología exacta, el tipo de encoder de audio ni el tokenizador utilizado.

El proceso de entrenamiento consta de al menos dos fases documentadas por la nomenclatura del modelo: un ajuste supervisado (SFT) sobre `cohere-transcribe-ar-sft-v9-full` y una posterior fase de aprendizaje por refuerzo (RL) que da lugar a esta variante `rl-v9enc`. No se especifican el volumen de horas de audio, la composición del dataset, las técnicas de RL empleadas (por ejemplo, optimización de recompensa con métricas WER/CER) ni si hubo etapas adicionales de alineación. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción automática de voz a texto en árabe e inglés.
- Manejo de code-switching árabe-inglés dentro de una misma emisión o conversación.
- Orientación a audio telefónico, lo que implica robustez ante ruido, compresión y ancho de banda limitado.
- Integración nativa con el pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio gestionado.
- No se documentan capacidades de traducción, diarización de hablantes, timestamps a nivel de palabra ni tool calling.

## Casos de uso

- Transcripción de centros de llamadas en árabe: el modelo está entrenado para telefonía y code-switching, por lo que puede procesar grabaciones de atención al cliente donde el operador alterna árabe e inglés.
- Subtitulado de reuniones bilingües: útil en organizaciones del Golfo Pérsico o Norte de África donde las reuniones mezclan árabe dialectal y terminología técnica en inglés.
- Generación de actas y resúmenes a partir de audio: la transcripción sirve como entrada a un LLM posterior para resumir conversaciones, aprovechando la salida de texto limpia del ASR.
- Análisis de calidad y compliance en teleoperaciones: transcripción masiva de llamadas para auditoría, detección de palabras clave y evaluación de guiones.
- Accesibilidad y documentación: conversión de notas de voz y entrevistas en árabe a texto buscable para archivos periodísticos o académicos.
- Investigación en lingüística de contacto: análisis de corpus orales con alternancia de código árabe-inglés, donde modelos generalistas suelen fallar en los cambios de idioma.
- Prototipado de asistentes de voz: integración en pipelines de voz a texto para asistentes que operen en árabe con préstamos del inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 4,1 GB solo para pesos, más el overhead del runtime y del procesador de audio; se recomienda al menos 8 GB de VRAM para inferencia cómoda.
- VRAM estimada en fp32: aproximadamente 8,3 GB solo para pesos; requiere GPU con 12-16 GB o más.
- Cuantización a 8 bits: alrededor de 2 GB de pesos, viable en GPUs consumer de 6-8 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y pruebas.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en fp16, y en 6 GB con cuantización.
- Opciones de despliegue: transformers con pipeline `automatic-speech-recognition`, TGI si el soporte de la arquitectura `cohere_asr` está disponible, y endpoints gestionados de Hugging Face (marcado como `endpoints_compatible`). No se confirma soporte de llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-rl-v9enc | ~2,07 B | ar, en (code-switching) | no disponible | no disponible | gated |
| Whisper large-v3 (OpenAI) | ~1,55 B | multilingüe (99 idiomas) | 30 s por ventana | MIT | abierto |
| MMS (Meta) | ~1 B (ASR) | más de 1000 idiomas | variable | CC-BY-NC | abierto |
| SeamlessM4T v2 (Meta) | ~2,3 B | multilingüe | variable | CC-BY-NC | abierto |

La comparación es orientativa: no se dispone de métricas de WER para el modelo de Cohere-AR, por lo que no puede establecerse una superioridad cuantitativa frente a Whisper o MMS. La ventaja diferencial declarada es la especialización en árabe, code-switching y telefonía, frente al enfoque generalista de las alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse el uso comercial; es imprescindible verificar las condiciones al aceptar el acceso gated.
- Acceso restringido: requiere aprobación en Hugging Face, lo que puede introducir fricción en pipelines automatizados.
- Idiomas limitados a árabe e inglés; no se declara soporte para otras lenguas ni para dialectos específicos más allá de lo que cubra el entrenamiento.
- Sin datos publicados de WER, CER ni benchmarks comparativos: el rendimiento real debe validarse con un conjunto propio antes de producción.
- Riesgo de alucinación en ASR: posible generación de texto plausible en segmentos con ruido extremo o silencios, comportamiento habitual en modelos encoder-decoder.
- Sin información sobre sesgos por dialecto, género o acento; el rendimiento puede degradarse en variedades no representadas en el corpus de entrenamiento.
- No se documentan marcas de tiempo, diarización ni puntuación; si se necesitan, habrá que añadir post-procesado.
- Longitud de contexto de audio no disponible: conviene trocear entradas largas en ventanas para evitar degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-rl-v9enc
- Modelo base (SFT): https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft-v9-full
- Organización Cohere-AR: https://huggingface.co/Cohere-AR
- Documentación del pipeline ASR de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#automatic-speech-recognition
