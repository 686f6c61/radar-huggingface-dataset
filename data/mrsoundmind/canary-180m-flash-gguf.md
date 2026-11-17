# mrsoundmind/canary-180m-flash-gguf

## Resumen

canary-180m-flash-gguf es una conversión al formato GGUF del modelo nvidia/canary-180m-flash, publicada por el usuario mrsoundmind para su uso con transcribe.cpp. Se trata de un sistema de reconocimiento automático del habla (ASR) y traducción de voz multitarea, desarrollado originalmente por NVIDIA dentro de la familia NeMo Canary. El modelo resuelve dos problemas clásicos en pipelines de audio: transcribir voz a texto en cuatro idiomas (inglés, alemán, español y francés) y traducir entre inglés y el resto de idiomas soportados, todo en un único checkpoint de pequeño tamaño.

La arquitectura es encoder-decoder: un encoder FastConformer de 17 capas y un decoder Transformer de 4 capas, con un total de 189.083.776 parámetros según los pesos en safetensors (NVIDIA reporta 182M en su model card). El modelo consume audio WAV mono a 16 kHz y genera texto plano; no es un modelo de streaming y no expone marcas de tiempo en este port v1.

Su relevancia actual reside en que ofrece capacidades multilingües de ASR y traducción en un paquete de menos de 220 MB en cuantización Q8_0, ejecutable en CPU y GPU de consumo mediante transcribe.cpp. La licencia CC-BY-4.0 permite uso comercial, lo que lo hace atractivo para integrar transcripción offline en aplicaciones de escritorio, dispositivos embebidos o pipelines sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: FastConformer (17 capas) + Transformer decoder (4 capas) |
| Parametros totales | 189.083.776 (safetensors); 182M reportados por NVIDIA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, es, fr (ASR); traduccion bidireccional EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary: un encoder FastConformer de 17 capas que extrae características acústicas del audio y un decoder Transformer de 4 capas que genera texto autorregresivamente. La tarea se controla mediante tokens especiales introducidos en el decoder (`<target language>`, `<task>`, `<toggle timestamps>`, `<toggle PnC>`), lo que permite alternar entre transcripción y traducción, así como activar o desactivar puntuación y mayúsculas sin cambiar de checkpoint. El tokenizador es concatenado, construido a partir de tokenizadores SentencePiece individuales por idioma, lo que facilita escalar a nuevos idiomas.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens de audio utilizados ni si hubo etapas de RLHF o DPO en la información proporcionada. La model card del port indica que se parte del commit b12ab41 del modelo base (fijado el 2026-05-08) y que la validación numérica se realizó contra la referencia de NeMo en el commit db53eda de transcribe.cpp. La conversión a GGUF preserva el comportamiento del modelo original: el WER en F32 (1,94 %) coincide con el de NeMo (1,93 %) dentro del ruido estadístico (una única sustitución de diferencia sobre ~27.000 palabras de referencia).

## Capacidades

- Reconocimiento automático del habla en inglés, alemán, español y francés a partir de audio WAV mono a 16 kHz.
- Traducción bidireccional entre inglés y alemán, español y francés (EN→{DE, ES, FR} y {DE, ES, FR}→EN).
- Control de puntuación y mayúsculas (PnC) mediante token de tarea, con opción de activarlo o desactivarlo.
- Funcionamiento offline completo, sin dependencia de servicios externos ni conexión de red.
- Inferencia en CPU y GPU (Metal en Apple Silicon, Vulkan en GPUs compatibles) a través de transcribe.cpp.
- No soporta streaming: procesa el audio completo de una vez.
- No expone detección de idioma automática (`lang_detect: false`).
- No expone marcas de tiempo en este port v1 (`timestamps: none`), aunque el modelo base las ofrece como funcionalidad experimental.
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente de audio a texto.

## Casos de uso

- Transcripción offline de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono y genera transcripciones en cuatro idiomas sin enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o conectividad limitada.
- Subtitulado automático de vídeo en inglés, alemán, español y francés: integrado en un pipeline con ffmpeg para la conversión a WAV mono 16 kHz, el modelo produce texto con puntuación y mayúsculas activables, listo para incrustar como subtítulos.
- Traducción de contenido audiovisual: la capacidad de traducción bidireccional EN↔{DE, ES, FR} permite generar pistas de subtítulos traducidas a partir del audio original sin pasar por un traductor de texto independiente.
- Notas de voz en aplicaciones móviles o de escritorio: con cuantización Q4_K_M (139 MB) el modelo cabe en dispositivos con recursos limitados y puede ejecutarse en CPU, lo que habilita transcripción local en apps de notas.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo o generación de resúmenes posteriores, con la ventaja de que el procesamiento puede ser completamente local.
- Investigación lingüística y corpus de habla: generación de transcripciones a gran escala en cuatro idiomas para estudios de fonética, análisis de discurso o construcción de datasets, con la ventaja de un modelo pequeño y rápido (más de 1200 RTFx según NVIDIA en open-asr-leaderboard).
- Sistemas embebidos y de borde: el tamaño reducido del GGUF y la posibilidad de ejecución en CPU con Metal o Vulkan permiten desplegar transcripción en dispositivos sin GPU dedicada, como mini-PCs o portátiles.

## Benchmarks y rendimiento

Datos publicados en la model card del port (WER en LibriSpeech test-clean, 2.620 utterances, batch size 1, greedy decoding sin LM externo):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 756 MB | 1,94 % |
| F16 | 382 MB | 1,94 % |
| Q8_0 | 218 MB | 1,93 % |
| Q6_K | 176 MB | 1,93 % |
| Q5_K_M | 159 MB | 1,90 % |
| Q4_K_M | 139 MB | 1,93 % |

WER en FLEURS por idioma con cuantización Q8_0:

| Idioma | WER FLEURS (Q8_0) |
|---|---:|
| Alemán (de) | 7,33 % |
| Inglés (en) | 5,98 % |
| Español (es) | 6,54 % |
| Francés (fr) | 8,53 % |

Rendimiento (RTF, real-time factor) reportado en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 78,91 |
| Apple M4 Max | Metal | 153,46 |
| AMD Ryzen 4750U | CPU | 21,73 |
| AMD Ryzen 4750U | Vulkan | 33,09 |

NVIDIA reporta en su model card un WER de 1,87 % en LibriSpeech test-clean y más de 1200 RTFx en los conjuntos de open-asr-leaderboard, aunque estas cifras corresponden al modelo base en su framework original (NeMo) y no directamente a este port GGUF.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones. El archivo más grande (F32) ocupa 756 MB; Q8_0 ocupa 218 MB y Q4_K_M 139 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No requiere GPU de datacenter; una RTX 4090 o A100 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria. También funciona en CPU pura.
- Opciones de despliegue: transcribe.cpp (único runtime soportado por este port, con backends CPU, Metal y Vulkan). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de audio y no de texto.
- Latencia y throughput: RTF de 78,91 en CPU de M4 Max y 153,46 con Metal; 21,73 en CPU de Ryzen 4750U y 33,09 con Vulkan. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- Almacenamiento: el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Traduccion | Licencia | Formato |
|---|---:|---|---|---|---|
| canary-180m-flash-gguf | 189M | en, de, es, fr | Si (EN↔{DE, ES, FR}) | CC-BY-4.0 | GGUF |
| nvidia/canary-180m-flash | 182M | en, de, es, fr | Si (EN↔{DE, ES, FR}) | CC-BY-4.0 | NeMo (.nemo) |
| Whisper small (referencia) | ~244M | ~99 idiomas | Si (solo a ingles) | MIT | Safetensors, GGUF, etc. |
| Whisper base (referencia) | ~74M | ~99 idiomas | Si (solo a ingles) | MIT | Safetensors, GGUF, etc. |

No se dispone de datos de benchmarks comparativos directos entre canary-180m-flash y Whisper en la información proporcionada. La comparativa se limita a parámetros, idiomas, licencia y formato. Whisper small y base se incluyen como alternativas de tamaño similar en la categoría de ASR multilingüe, pero sus cifras de rendimiento no se han verificado en esta ficha.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo antes de empezar a transcribir, lo que lo hace inadecuado para transcripción en tiempo real de llamadas o micrófono en vivo.
- Solo soporta cuatro idiomas (en, de, es, fr). No cubre otros idiomas aunque el modelo base pudiera escalarse con tokenizadores adicionales.
- No expone detección automática de idioma (`lang_detect: false`); el idioma debe especificarse o inferirse externamente.
- No expone marcas de tiempo en este port v1 (`timestamps: none`), aunque el modelo base las ofrece como funcionalidad experimental. Para subtitulado con sincronización temporal habría que recurrir a otro modelo o a alineamiento forzado posterior.
- Riesgo de alucinación inherente a los modelos generativos de ASR: en audio con ruido, silencios largos o habla solapada puede generar texto inventado o repetir segmentos.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; como todo modelo entrenado con datos de habla, puede presentar sesgos de acento, género o dialecto según la distribución del corpus de entrenamiento.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución. Es necesario citar al autor original (NVIDIA) y mantener el aviso de licencia.
- El port GGUF está validado contra NeMo en un commit concreto (db53eda de transcribe.cpp); cambios futuros en el runtime pueden afectar a la compatibilidad.
- El modelo base está fijado al commit b12ab41 (2026-05-08); actualizaciones posteriores de NVIDIA no están reflejadas en este port.
- Para producción, conviene validar el WER en el dominio específico (acentos, ruido de fondo, jerga) ya que las cifras de LibriSpeech y FLEURS son de habla limpia y lectura.

## Enlaces

- Repositorio Hugging Face del port: https://huggingface.co/mrsoundmind/canary-180m-flash-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/canary-180m-flash
- Commit del modelo base utilizado: https://huggingface.co/nvidia/canary-180m-flash/commit/b12ab41
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Paper de Canary (arXiv:2409.13523): https://arxiv.org/abs/2409.13523
- Paper de FastConformer (arXiv:2305.05084, citado como [3] en la model card original; no enlazado explícitamente en la información proporcionada): no disponible enlace directo
- Paper de Transformer (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper de SentencePiece (arXiv:1808.06226, citado como [6]; no enlazado explícitamente en la información proporcionada): no disponible enlace directo
- Paper de concatenated tokenizer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- NVIDIA NeMo (repositorio): https://github.com/NVIDIA/NeMo
- Tutorial de NeMo para canary-180m-flash: no disponible enlace completo en la información proporcionada
