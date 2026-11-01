# kawshikbuet17/realtime-language-detection-onnx

## Resumen

`kawshikbuet17/realtime-language-detection-onnx` no es un modelo único, sino una colección de once modelos de identificación de idioma hablado (spoken language identification, LID) convertidos a ONNX para su ejecución en el navegador mediante `onnxruntime-web`. El repositorio lo mantiene Kawshik Kumar Paul (BUET, Bangladesh) y actúa como agregador: los pesos originales provienen de equipos como Silero, SpeechBrain, TalTechNLP, OpenAI, Google y CIIL, y el autor se limita a convertirlos o copiarlos a ONNX, preservando la licencia original de cada uno.

El problema que resuelve es el de la detección de idioma en tiempo real con audio muy corto: la demo asociada muestra la respuesta de cada modelo tras 20 ms, 40 ms, 80 ms y así hasta 2 s de audio, lo que permite comparar la latencia de decisión de arquitecturas distintas (ECAPA-TDNN, Conformer, Whisper, wav2vec2). La extracción de características está embebida en los grafos, de modo que los modelos aceptan audio PCM crudo a 16 kHz.

Es relevante para desarrolladores que necesitan enrutar llamadas o contenido de audio por idioma antes de invocar un ASR completo, o que quieren ejecutar LID en cliente (navegador) sin enviar audio a un servidor. El tamaño total del repositorio es de 1,7 GB, pero cada submodelo es pequeño e independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma unificada; el repositorio agrupa ECAPA-TDNN (SpeechBrain, TalTech), Conformer (Google), Whisper tiny/base (encoder Transformer) y wav2vec2-base |
| Parámetros totales | No disponible por modelo en la información proporcionada; los submodelos van de Whisper tiny (~39 M) a Whisper base (~74 M) y wav2vec2-base (~95 M), según los modelos originales |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de audio evaluada de 20 ms a 2 s |
| Tipos de cuantización | fp32 (`model.onnx`) y fp16 (`model_fp16.onnx`, pesos en fp16 con aritmética fp32); se probaron versiones int8 y se descartaron por cambiar demasiado las respuestas |
| Idiomas soportados | Variable por submodelo: 2 (Whisper tiny ta/en), 23 (Anuvani-LID), 44 (CommonLanguage), 71 (Google Conformer), 91 (Silero), 99 (Whisper), 107 (VoxLingua107) |
| Licencia | `other` a nivel de repo, con licencia por modelo (`per-model`): MIT, Apache-2.0 y otras según el original |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`), más `labels.json` con etiquetas en orden de salida y códigos ISO |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: redistribuye artefactos ya entrenados por terceros. Cada carpeta contiene los ficheros ONNX, un `labels.json` con las etiquetas en el orden de salida y los códigos ISO correspondientes, un README con el formato de entrada y salida y la verificación frente al modelo original, y la licencia original. Las arquitecturas subyacentes son diversas: ECAPA-TDNN con embeddings de hablante reutilizados para LID (SpeechBrain, TalTech), Conformer de Google para clasificación de idioma, encoders de Whisper tiny y base, y wav2vec2-base afinado sobre CommonLanguage.

La innovación técnica del paquete es de ingeniería de despliegue: la extracción de features (log-mel, fbank, etc.) se ha integrado dentro del grafo ONNX, de manera que la entrada es audio PCM a 16 kHz sin preprocesado externo en JavaScript. Se ofrece `model.onnx` en fp32, que reproduce los resultados del original, y `model_fp16.onnx`, que almacena pesos en fp16 pero calcula en fp32 y es el que descarga la demo. Las variantes int8 se descartaron por degradar la estabilidad de las predicciones. El repositorio incluye además Silero VAD v6.2 (MIT) en la carpeta `silero-vad/`, usado por la demo para detectar el inicio del habla.

## Capacidades

- Clasificación de idioma hablado a partir de audio corto (desde 20 ms), con salida de etiquetas ISO por modelo.
- Ejecución en navegador mediante `onnxruntime-web`, sin backend Python.
- Entrada de audio crudo a 16 kHz: el preprocesado está embebido en el grafo ONNX.
- Detección de inicio de habla mediante Silero VAD v6.2 incluida en el repositorio.
- Cobertura multilingüe variable: hasta 107 idiomas en los modelos VoxLingua107, 99 en Whisper, 91 en Silero, 71 en Google Conformer.
- Comparación de latencia de decisión entre arquitecturas gracias a la demo que evalúa ventanas de 20 ms a 2 s.
- No soporta generación de texto, tool calling, agentes, visión ni audio más allá de la clasificación de idioma.

## Casos de uso

- Enrutado de llamadas en centralita o contact center: clasificar el idioma de los primeros 200-500 ms de audio con un modelo ECAPA o Conformer y derivar la llamada al agente o al ASR del idioma correcto, sin esperar a una transcripción completa.
- LID en cliente dentro del navegador: usar `onnxruntime-web` con `model_fp16.onnx` para etiquetar el idioma de un micrófono en una web app sin enviar audio a servidores, útil por privacidad y por coste de ancho de banda.
- Prefiltro antes de un ASR grande: descartar o etiquetar segmentos de audio en un pipeline de transcripción masiva usando un modelo de 44 o 107 idiomas, reservando Whisper large solo para los segmentos relevantes.
- Moderación y analítica de contenido audiovisual: clasificar el idioma de clips subidos por usuarios para indexación, subtitulado automático o cumplimiento de políticas por región lingüística.
- Investigación en LID: comparar en igualdad de condiciones ECAPA-TDNN, Conformer, Whisper y wav2vec2 sobre la misma ventana de audio, usando los grafos ya convertidos y verificados contra los originales.
- Sistemas embebidos o edge con pocos recursos: desplegar la variante fp16 de un modelo pequeño (Whisper tiny, ECAPA) en dispositivos con CPU modesta, dado el reducido tamaño de cada submodelo.
- Detección de cambio de idioma en conversaciones multilingües: con ventanas de 20-40 ms y VAD para segmentar, marcar los puntos de cambio de lengua en una conversación code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de precisión, F1 ni comparativas numéricas entre submodelos; solo indica que `model.onnx` en fp32 reproduce los resultados del modelo original y que las versiones int8 se descartaron por alterar las respuestas con demasiada frecuencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; cada submodelo es pequeño (decenas de millones de parámetros) y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no es necesario GPU dedicado; para la demo web se ejecuta en CPU del navegador vía WebAssembly/WebGPU con `onnxruntime-web`. En servidor, cualquier GPU moderna (RTX 4090, A100, H100) sobra para lotes grandes.
- Cabe en consumer GPU: sí, todos los submodelos, con enorme margen.
- Opciones de despliegue: `onnxruntime-web` en navegador (caso principal), `onnxruntime` en Python/C++ para servidor, y potencialmente runtimes ONNX en edge.
- Latencia y throughput: no disponibles como cifras publicadas; la demo está diseñada para mostrar la decisión con ventanas de 20 ms a 2 s, lo que sugiere latencias de decisión en el orden de decenas de milisegundos para los modelos más ligeros, pero no se aportan números medidos.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Este repositorio (agregado) | 2 a 107 según submodelo | ECAPA-TDNN, Conformer, Whisper, wav2vec2 | Por modelo (MIT, Apache-2.0, etc.) | ONNX, navegador y servidor |
| SpeechBrain `lang-id-voxlingua107-ecapa` | 107 | ECAPA-TDNN | Apache-2.0 | PyTorch (incluido aquí en ONNX) |
| TalTech `voxlingua107-epaca-tdnn` | 107 | ECAPA-TDNN | Apache-2.0 | PyTorch (incluido aquí en ONNX) |
| Google Conformer LangID (medium) | 71 | Conformer | Apache-2.0 | TFLite/ONNX (incluido aquí) |
| NVIDIA AmberNet | No disponible en la información | No disponible | NGC Terms of Use, sin redistribución | No incluido en el repo; la demo lo carga desde su origen |

La ventaja diferencial del paquete no es la precisión (los pesos son los originales) sino la disponibilidad en ONNX con preprocesado embebido y ejecución en navegador, algo que los repositorios originales en PyTorch o TFLite no ofrecen directamente.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: la calidad, los sesgos y la cobertura lingüística dependen de cada modelo original; conviene consultar las model cards de Silero, SpeechBrain, TalTech, Google, OpenAI y CIIL.
- Licencia heterogénea: el repo declara `other`/`per-model`; cada subcarpeta conserva su licencia (MIT, Apache-2.0, etc.). Antes de uso comercial hay que verificar la licencia del submodelo concreto que se despliegue.
- Modelos excluidos por restricciones: NVIDIA AmberNet (términos NGC que prohíben redistribución), `ml-for-speech/language-classification` y `radioduran/indic-language-identification` (sin licencia), por lo que no están disponibles en el paquete.
- Las versiones int8 no se mantienen porque alteraban las respuestas con demasiada frecuencia; si se necesita int8 habrá que validarlo por cuenta propia.
- La clasificación con ventanas de 20-40 ms es intrínsecamente ruidosa; para decisiones estables hacen falta ventanas mayores o agregación temporal.
- Riesgo de confusión entre idiomas cercanos o con pocos datos en cada modelo original; no se aportan métricas de error por idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de validación independiente más allá de la verificación del autor contra los originales.
- No apto para tareas de generación, transcripción ni comprensión semántica: es exclusivamente un clasificador de idioma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kawshikbuet17/realtime-language-detection-onnx
- Demo (Space): https://huggingface.co/spaces/kawshikbuet17/realtime-language-detection
- Silero Lang Classifier 95: https://github.com/snakers4/silero-vad/tree/0480df078b4429db314feec47853b9bfd2bbba49/files
- SpeechBrain VoxLingua107 ECAPA: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- TalTech VoxLingua107 ECAPA-TDNN: https://huggingface.co/TalTechNLP/voxlingua107-epaca-tdnn
- OpenAI Whisper tiny: https://huggingface.co/openai/whisper-tiny
- OpenAI Whisper base: https://huggingface.co/openai/whisper-base
- Google Conformer LangID: https://huggingface.co/tflite-hub/conformer-lang-id
- Anuvani-LID (CIIL): https://huggingface.co/CIIL/Anuvani-LID
- SpeechBrain CommonLanguage ECAPA: https://huggingface.co/speechbrain/lang-id-commonlanguage_ecapa
- Whisper base fine-tuned CommonLanguage (S. Gandhi): https://huggingface.co/sanchit-gandhi/whisper-base-ft-common-language-id
- wav2vec2-base CommonLanguage (anton-l): https://huggingface.co/anton-l/wav2vec2-base-lang-id
- Whisper tiny Tamil/English (Lingalingeswaran): https://huggingface.co/Lingalingeswaran/whisper-lang-id
- NVIDIA AmberNet (no incluido): https://huggingface.co/surogate/ambernet-langid
