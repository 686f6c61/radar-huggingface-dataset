# jackyb1234/ViZipvoice

## Resumen

ViZipVoice es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz zero-shot, afinado a partir de ZipVoice del proyecto k2-fsa. Lo publica el usuario jackyb1234 en Hugging Face y está especializado en vietnamita, aunque el corpus de entrenamiento incluye una porción de inglés. El modelo resuelve el problema de generar habla en vietnamita con una voz concreta a partir de una muestra de audio corta y su transcripción, sin necesidad de reentrenar por hablante.

La relevancia práctica está en que el vietnamita es un idioma con relativamente pocos sistemas TTS open source de calidad, y menos aún con clonación zero-shot. ViZipVoice ofrece pesos en FP16 (checkpoint-1860000.pt), tokenizador a nivel de carácter de 244 tokens y salida a 24 kHz, lo que lo sitúa en un rango de calidad de audio adecuado para producción de contenido y prototipado de asistentes de voz.

El modelo se distribuye con licencia Apache 2.0, un envoltorio en Python, una CLI y una aplicación Gradio, además de 30 audios de referencia con transcripciones. El tamaño del repositorio es de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ZipVoice; detalles de arquitectura no especificados en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el texto se segmenta por frases) |
| Tipos de cuantizacion | FP16 (checkpoint de inferencia); no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (principal) e inglés (datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt), checkpoint FP16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base ZipVoice (componentes acústicos, tipo de decoder o mecanismo de flow matching). Lo que sí se documenta es el pipeline de inferencia: normalización de texto vietnamita con `soe-vinorm`, limpieza de espacios alrededor de puntuación, segmentación del texto en frases, generación por segmentos y fusión con silencio, crossfade, fade in y fade out. El vocoder por defecto es `charactr/vocos-mel-24khz`, con muestreo a 24 kHz.

El entrenamiento se realizó sobre aproximadamente 7000 horas de audio, de las cuales unas 6500 horas son vietnamita y unas 500 horas inglés. El tokenizador es `SimpleTokenizer` a nivel de carácter con 244 tokens. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). El checkpoint publicado es el paso 1.860.000.

## Capacidades

- Síntesis de voz en vietnamita a partir de texto, con salida a 24 kHz.
- Clonación de voz zero-shot: genera habla con la identidad vocal de un audio de referencia y su transcripción.
- Normalización de texto vietnamita integrada mediante `soe-vinorm`.
- Segmentación automática de textos largos en frases y fusión de audio con parámetros configurables (crossfade de 80 ms, silencio de 180 ms, fade in de 20 ms y fade out de 80 ms por defecto).
- Ajuste de velocidad de habla (`speed`) y número de pasos de inferencia, con valores recomendados para frases de una palabra (mínimo 24 pasos, `speed=0.6`) y de dos a cuatro palabras (`speed=0.8`).
- Soporte de inglés limitado a los datos de entrenamiento; no se documenta como capacidad oficial.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada más allá del prompt de referencia.

## Casos de uso

- Clonación de voz para locución de contenido: dado un audio de referencia de un locutor con derechos, ViZipVoice permite generar narraciones en vietnamita con esa misma voz, útil para audiolibros, vídeos o pódcast sin regrabar cada texto.
- Prototipado de asistentes de voz en vietnamita: el modelo permite validar la experiencia conversacional con voces personalizadas antes de invertir en un sistema TTS comercial, gracias a su licencia Apache 2.0 y a la disponibilidad de CLI y API Python.
- Doblaje y localización de material audiovisual al vietnamita: la segmentación por frases y la fusión con crossfade facilitan generar pistas de voz alineadas con guiones largos, manteniendo una identidad vocal consistente por personaje.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o contenido educativo en vietnamita, con la posibilidad de ofrecer varias voces de referencia según preferencia del usuario.
- Generación de audios de demostración y material de marketing: los 30 audios de referencia incluidos permiten producir rápidamente muestras con distintas voces (por ejemplo, las etiquetadas como Đinh-Quyết, Nhã-Uyên o MC) para pruebas A/B de mensajes.
- Investigación en TTS y clonación de voz: al ser un fine-tune open source de ZipVoice con pesos y pipeline reproducibles, sirve como base para experimentos de adaptación a otros idiomas o de evaluación de calidad de clonación zero-shot.
- Integración en aplicaciones Gradio: la app incluida (`egs/zipvoice/gradio_app.py`) permite desplegar una interfaz de demostración interna para que equipos no técnicos prueben la síntesis y la clonación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint es FP16 y el repositorio ocupa 0,3 GB, por lo que el peso de los parámetros es reducido y cabe holgadamente en GPUs de consumo, aunque la VRAM total depende de los componentes del pipeline (encoder, decoder y vocoder) no documentados.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, es plausible su ejecución en GPUs consumer tipo RTX 3060/4060 o superiores, pero no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: probable por el tamaño del repositorio (0,3 GB), sin confirmación oficial.
- Opciones de despliegue: CLI (`python3 -m zipvoice.bin.infer_vizipvoice`), API Python (`ViZipVoiceTTS`), aplicación Gradio (`egs/zipvoice/gradio_app.py`) y descarga de pesos con `huggingface-cli`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Clonación zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViZipVoice | TTS fine-tune de ZipVoice | Vietnamita, inglés (datos) | Sí | Apache 2.0 | Hugging Face, GitHub, Space |
| ZipVoice (k2-fsa) | TTS base | No disponible en la información | No disponible en la información | No disponible en la información | GitHub, Hugging Face |
| Vocos (charactr/vocos-mel-24khz) | Vocoder | No aplica (vocoder) | No aplica | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos TTS en vietnamita en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de uso malintencionado: el modelo puede clonar voces a partir de audios cortos; el autor advierte explícitamente contra su uso para suplantación de identidad, fraude, acoso o desinformación.
- Solo debe usarse con voces propias o con permiso explícito del hablante.
- Cobertura lingüística limitada: el modelo está orientado al vietnamita; el inglés solo aparece como parte de los datos de entrenamiento y no se documenta como capacidad soportada.
- Riesgo de alucinación acústica y artefactos: no se documentan métricas objetivas (MOS, WER, similitud de hablante) que permitan estimar la fidelidad de la clonación ni la inteligibilidad en condiciones reales.
- Dependencia de la calidad del audio de referencia: la calidad de la clonación depende de la muestra proporcionada y de su transcripción; no se documentan requisitos mínimos de duración o ruido del prompt.
- Sin benchmarks publicados: no hay datos comparativos que permitan situar el modelo frente a alternativas comerciales o académicas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se pide atribuir también al proyecto original ZipVoice.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos específicos ni limitaciones de contexto más allá de la segmentación por frases.

## Enlaces

- Hugging Face: https://huggingface.co/jackyb1234/ViZipvoice
- Repositorio del modelo citado en la model card: https://huggingface.co/contextboxai/ViZipvoice
- GitHub: https://github.com/iamdinhthuan/ViZipvoice
- Space de demostración: https://huggingface.co/spaces/dinhthuan/ViZipvoice
- Modelo base ZipVoice (GitHub): https://github.com/k2-fsa/ZipVoice
- Vocoder por defecto: https://huggingface.co/charactr/vocos-mel-24khz
