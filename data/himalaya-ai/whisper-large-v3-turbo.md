# himalaya-ai/whisper-large-v3-turbo

## Resumen

Whisper large-v3-turbo (nepalí) es un ajuste fino del modelo `openai/whisper-large-v3-turbo` publicado por el usuario himalaya-ai en Hugging Face. Se trata de un sistema de reconocimiento automático del habla (ASR) especializado en la transcripción de audio en nepalí, entrenado sobre el corpus `lilgoose7777/slr-combined-nepali-tts2`. Conserva la arquitectura transformer encoder-decoder de la familia Whisper y sus 808.878.080 parámetros, con una ventana de entrada de 30 segundos de audio por fragmento a 16 kHz.

El modelo resulta relevante porque el nepalí es un idioma con escasa representación en los corpus ASR disponibles, y este ajuste ofrece una alternativa con licencia Apache 2.0 y métricas explícitas de error: 15,44 % de WER y 10,01 % de CER sobre un conjunto de test de 2000 ejemplos. El entrenamiento se realizó sobre audio limpio de estudio con un único hablante, lo que acota claramente el dominio de aplicación previsto.

Se trata, no obstante, de un modelo con muy poca validación externa: el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, y la propia model card advierte de que el rendimiento se degrada con ruido de fondo, múltiples hablantes o acentos marcados. Es un artefacto útil para prototipos y para investigación en ASR de bajos recursos, no un componente listo para producción sin evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (variante large-v3-turbo del modelo base); entrada log-Mel a 16 kHz, ventana de 30 s por fragmento |
| Parámetros totales | 808.878.080 (≈809 M), dato de los pesos safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Audio: 30 s por fragmento. Texto: `max_label_length` de 448 tokens durante el entrenamiento y `max_new_tokens` de 225 en generación |
| Tipos de cuantización | No disponibles en la model card; pesos publicados sin cuantizar (repo de 3,2 GB, precisión bf16 en entrenamiento). Requiere conversión propia a int8/GGUF con herramientas de terceros |
| Idiomas soportados | Nepalí (`ne`), tarea `transcribe`; no se declara soporte de otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `openai/whisper-large-v3-turbo` |
| Dataset de ajuste | `lilgoose7777/slr-combined-nepali-tts2` |
| Pipeline declarado | `automatic-speech-recognition` |
| Checkpoints intermedios | `milanakdj/whisper-large-v3-turbo-nepali-checkpoints` |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la arquitectura del modelo base: un transformer encoder-decoder con procesamiento de audio en ventanas de 30 segundos, espectrograma log-Mel a 16 kHz, y decodificación autorregresiva de texto con vocabulario multilingüe. No se introducen modificaciones arquitectónicas: se trata de un fine-tuning completo (no de un adaptador) sobre los pesos de `openai/whisper-large-v3-turbo`, cuya variante "turbo" reduce el coste del decoder respecto a la versión large-v3 completa.

La configuración de entrenamiento está documentada con detalle en la model card: 1,0 época, 9368 pasos, learning rate de 1e-5 con schedule lineal y 5 % de warmup, batch efectivo de 64 (batch por dispositivo 8 con 8 pasos de acumulación de gradiente), precisión bf16, optimizador `adamw_torch`, weight decay 0,0, max grad norm 1,0, semilla 42 y sin gradient checkpointing. La evaluación y el guardado se hicieron por época, conservando el mejor modelo según WER. No se menciona ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en una tarea puramente ASR.

El corpus de ajuste se dividió en 599.608 ejemplos de entrenamiento, 74.951 de validación y 74.951 de test (80/10/10). La validación por época usó un subconjunto de 500 ejemplos, mientras que las métricas finales de test se calcularon sobre 2000 ejemplos. El autor advierte explícitamente de que el corpus es audio limpio de estudio con un único hablante, lo que condiciona fuertemente la generalización a grabaciones reales.

## Capacidades

- Transcripción de voz a texto en nepalí (tarea `transcribe`, sin traducción a otro idioma).
- Procesamiento de fragmentos de audio de hasta 30 segundos; para audio más largo es necesario trocear con solapamiento y recomponer el texto.
- Salida de texto plano; el modelo base de Whisper genera puntuación y mayúsculas, aunque la model card no documenta el comportamiento de la puntuación tras el ajuste.
- Reconocimiento sobre audio mono a 16 kHz; cualquier otra frecuencia de muestreo debe remuestrearse antes de la inferencia.
- Inferencia con la API estándar de `transformers` (`WhisperForConditionalGeneration` + `WhisperProcessor`) y compatibilidad declarada con `endpoints_compatible`.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo generativo de secuencias de texto a partir de audio, no un modelo conversacional.
- No soporta visión, audio understanding más allá de ASR, ni generación de audio.
- No se declara capacidad multilingüe ni de cambio de idioma dentro de una misma sesión.

## Casos de uso

- Subtitulado de contenido audiovisual en nepalí: transcripción automática de vídeos, podcasts o material formativo para generar ficheros de subtítulos, con la ventaja de que el modelo está ajustado específicamente a este idioma y no depende de modelos multilingües genéricos.
- Atención al cliente y centros de contacto en Nepal: transcripción de llamadas para análisis posterior, búsqueda de texto en grabaciones y control de calidad. Requiere evaluar la degradación sobre audio telefónico (banda estrecha, ruido), ya que el entrenamiento se hizo con audio limpio.
- Accesibilidad: generación de transcripciones y subtítulos para personas con discapacidad auditiva en contenidos producidos en nepalí.
- Archivado y búsqueda de fondos sonoros: digitalización de archivos de radio o televisión en nepalí y creación de índices de texto que permitan búsquedas semánticas sobre el audio.
- Generación de corpus textual en nepalí: uso del modelo como pseudo-etiquetador para transcribir grandes volúmenes de audio y producir datos de texto destinados a entrenar modelos de lenguaje en ese idioma.
- Sistemas de voz interactivos (IVR, asistentes): combinado con un motor de texto a voz en nepalí, permite construir interfaces habladas; el dataset de ajuste procede de un corpus TTS, lo que facilita la simetría de dominio en prototipos.
- Investigación en ASR de bajos recursos: punto de partida reproducible (licencia permisiva, configuración de entrenamiento publicada y checkpoints intermedios) para comparar estrategias de ajuste en nepalí.
- Cumplimiento y auditoría interna: transcripción de reuniones o conversaciones grabadas con consentimiento para su revisión textual, siempre con las advertencias de privacidad y de precisión correspondientes.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Métrica | Valor |
|---|---|
| WER en test | 15,44 % |
| CER en test | 10,01 % |
| Mejor WER en evaluación | 16,97 % |
| Pasos de entrenamiento | 9368 |
| Ejemplos de test usados para las métricas | 2000 |

No se han publicado resultados comparativos frente a otros modelos ASR en nepalí dentro de la información disponible, por lo que no es posible situar estas cifras en contexto relativo. Tampoco se documentan métricas desagregadas por tipo de audio, duración o hablante, ni resultados sobre audio ruidoso o con múltiples hablantes.

## Requisitos de hardware

- Peso de los pesos publicados: aproximadamente 3,2 GB en el repositorio, coherente con 809 M de parámetros en bf16/fp16.
- VRAM estimada para inferencia en fp16/bf16: del orden de 2-4 GB con lotes pequeños (los pesos ocupan ~1,6 GB y hay que sumar activaciones y búfer de atención sobre ventanas de 30 s). En int8 bajaría a ~1,5-2 GB, y en 4 bits a ~1 GB, pero estas cuantizaciones las tendría que generar el usuario.
- GPU de consumo: cabe con holgura en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 3090/4090). En tarjetas de 6 GB es viable en fp16 con lotes muy pequeños o tras cuantizar.
- GPU de servidor: A100, H100, L4 o A10G para escenarios de alto throughput con lotes grandes; el tamaño del modelo no exige memoria de 80 GB.
- CPU: viable mediante conversiones a CTranslate2 (faster-whisper) o whisper.cpp, con velocidad muy inferior a GPU; no se documentan cifras.
- Opciones de despliegue: `transformers` (opción documentada por el autor), CTranslate2/faster-whisper, whisper.cpp, vLLM (soporta modelos Whisper) y TGI. Las alternativas distintas de `transformers` requieren convertir los pesos, ya que el autor solo publica safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. No se han publicado cifras de RTF (factor de tiempo real) ni de audio procesado por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | WER en nepalí |
|---|---|---|---|---|---|
| himalaya-ai/whisper-large-v3-turbo (este) | 808,9 M | 30 s | Nepalí | apache-2.0 | 15,44 % |
| openai/whisper-large-v3-turbo (base) | 808,9 M | 30 s | 99 idiomas | apache-2.0 | No disponible |
| openai/whisper-large-v3 | ≈1550 M | 30 s | 99 idiomas | apache-2.0 | No disponible |
| Otros ajustes de Whisper para nepalí | No disponible | No disponible | Nepalí | No disponible | No disponible |

No se dispone de resultados de WER del modelo base ni de `whisper-large-v3` sobre nepalí en la documentación consultada, por lo que no puede cuantificarse la mejora atribuible al ajuste. Los datos de los modelos comparativos corresponden a especificaciones públicas de la familia Whisper y no a la información proporcionada en esta ficha; conviene verificarlos antes de citarlos. La búsqueda web realizada no devolvió ningún recurso técnico comparable: los resultados se refieren a la cordillera del Himalaya y no al modelo.

## Limitaciones y advertencias

- Dominio de entrenamiento muy restringido: audio limpio de estudio, un único hablante, 16 kHz mono. El propio autor advierte de degradación de la precisión con ruido de fondo, múltiples hablantes o acentos marcados. No hay métricas para estos escenarios.
- Monolingüe: solo nepalí y solo tarea `transcribe`; no traduce ni permite cambio de idioma dentro de una sesión.
- Riesgo de alucinación típico de la familia Whisper: en silencios, música, ruido o audio ininteligible el modelo puede generar texto plausible pero incorrecto. Es imprescindible filtrar por confianza o aplicar detección de silencio en producción.
- Límite de 448 tokens por etiqueta durante el entrenamiento y 225 tokens en generación: transcripciones más largas dentro de una misma ventana de 30 s pueden truncarse.
- Metadatos incoherentes en el repositorio: el identificador del modelo es `himalaya-ai/whisper-large-v3-turbo`, pero el ejemplo de uso de la model card apunta a `milanakdj/whisper-large-v3-turbo-nepali-final-corpus` y los checkpoints se alojan bajo `milanakdj`. Conviene verificar qué artefacto corresponde exactamente a los pesos publicados.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de redactar la ficha, y el campo "rows requested" aparece como 0 en la documentación de datos. Las cifras de WER/CER no han sido replicadas de forma independiente.
- Licencia apache-2.0 sobre los pesos, lo que permite uso comercial sin restricciones de redistribución del modelo. No obstante, la licencia del corpus de ajuste (`lilgoose7777/slr-combined-nepali-tts2`) y los derechos sobre el audio original no se documentan en la información disponible y deben comprobarse antes de un uso comercial.
- Privacidad y protección de datos: al ser un modelo ASR orientado a conversaciones, su uso en producción implica tratar datos personales (voz); hay que aplicar las garantías legales correspondientes.
- Sin soporte documentado de streaming de baja latencia ni de decodificación en tiempo real; para ello habría que evaluar conversiones a CTranslate2 o whisper.cpp.
- No se documentan sesgos por género, edad o variedad dialectal dentro del nepalí, pero al proceder el corpus de un único hablante la representación de variedades es necesariamente limitada.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/himalaya-ai/whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de ajuste: https://huggingface.co/datasets/lilgoose7777/slr-combined-nepali-tts2
- Checkpoints intermedios: https://huggingface.co/milanakdj/whisper-large-v3-turbo-nepali-checkpoints
- Repositorio citado en el ejemplo de uso de la model card: https://huggingface.co/milanakdj/whisper-large-v3-turbo-nepali-final-corpus
- Resultados de la búsqueda web: no se ha encontrado ningún enlace técnico relevante. Todas las entradas devueltas se refieren a la cordillera del Himalaya (Wikipedia, Encyclopédie Universalis, mappemonde.net y una noticia sobre inundaciones en Nepal) y no guardan relación con el modelo. No se dispone de paper, blog técnico, repositorio de código ni demo asociados al ajuste.
