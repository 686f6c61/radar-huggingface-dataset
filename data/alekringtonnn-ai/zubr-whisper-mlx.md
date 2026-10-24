# alekringtonnn-ai/zubr-whisper-mlx

## Resumen

`zubr-whisper-mlx` es la versión para MLX de un modelo de reconocimiento automático del habla (ASR) publicado por el usuario alekringtonnn-ai dentro de su familia «Zubr». Su tarea es convertir audio en texto, no mantener conversaciones ni generar texto a partir de instrucciones: la propia model card insiste en que no es un modelo de chat ni de visión. Está empaquetado específicamente para Apple Silicon (M1/M2/M3/M4) mediante MLX, el framework de aprendizaje automático de Apple, de modo que la inferencia se ejecuta sobre la GPU integrada del chip.

El repositorio es deliberadamente compacto: 0,6 GB en total, con dos juegos de pesos en formato `safetensors` (una versión completa en fp16 de ~481 MB y una cuantización de 2 bits de ~74,4 MB) más el tokenizador multilingüe `multilingual.tiktoken` (~817 kB). Ese tokenizador, del tipo empleado en la familia Whisper, apunta a una arquitectura encoder-decoder Transformer estilo Whisper y a un soporte declarado de alrededor de un centenar de idiomas, entre ellos el español, el catalán, el gallego y el euskera.

Su relevancia práctica es acotada pero clara: permite transcripción local, sin conexión y sin enviar audio a servicios externos en equipos Mac, con un coste de memoria inferior a 1 GB en la versión fp16. Ahora bien, el autor no publica parámetros, licencia, datos de entrenamiento ni resultados de benchmarks, y el repositorio tiene un consumo prácticamente nulo (0 descargas, 1 «like»), por lo que debe tratarse como un artefacto experimental a evaluar empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo Whisper (deducido del tokenizador `multilingual.tiktoken` y de la librería `mlx-whisper`); ejecución sobre MLX en Apple Silicon |
| Parametros totales | no disponible (la model card no los declara; el archivo fp16 de ~481 MB es coherente con la clase de ~240 M de parámetros, estimación no confirmada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica la ventana de audio ni el número de tokens de contexto) |
| Tipos de cuantizacion | fp16 sin cuantizar (~481 MB) y cuantización de 2 bits, «q2» (~74,4 MB) |
| Idiomas soportados | alrededor de 100 idiomas según la lista de la model card: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, be, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`zubr-whisper-mlx.safetensors`, `zubr-whisper-mlx-q2.safetensors`) + tokenizador `multilingual.tiktoken` |
| Tarea (pipeline) | `automatic-speech-recognition` |
| Libreria | `zubr-mlx` (ejecución mediante `mlx-whisper`) |
| Tamano del repositorio | 0,6 GB |
| Plataforma | Apple Silicon (M1/M2/M3/M4), macOS 13.5+ (recomendado 14+), Python 3.9+ (recomendado 3.10+) |
| Fecha de creacion / actualizacion | 2026-10-11 / 2026-10-23 |

## Arquitectura y entrenamiento

La información disponible solo permite una descripción indirecta. El autor indica que el archivo `multilingual.tiktoken` «apunta a una arquitectura estilo Whisper», y que los modelos de audio de este tipo en MLX se ejecutan con la librería `mlx-whisper`. Se trata, por tanto, de un transformer encoder-decoder con vocabulario multilingüe en formato tiktoken, el esquema habitual de la familia Whisper, portado a MLX para aprovechar la GPU unificada de los chips de Apple. El repositorio incluye también la etiqueta `coreml`, aunque la model card no detalla ningún artefacto Core ML ni explica su función.

No hay ningún dato publicado sobre el proceso de entrenamiento: se desconoce el número de tokens de audio, la composición del corpus, si hubo ajuste fino supervisado, RLHF/DPO o destilación, y tampoco se documenta si los pesos derivan de un Whisper preentrenado o de un entrenamiento propio. La única información sobre el tamaño es el de los ficheros: ~481 MB en fp16 y ~74,4 MB en 2 bits, lo que sitúa al modelo en la gama ligera (compatible con un Whisper de tamaño «small», aunque el autor no lo confirma). No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos de streaming.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto, que es la única tarea declarada del modelo.
- Multilingüe: la lista de idiomas de la model card ronda el centenar de lenguas, con presencia explícita del español, catalán, gallego y euskera, además de inglés, chino, alemán, francés, ruso, árabe, hindi y un largo etcétera.
- Ejecución local en Apple Silicon mediante MLX, con la inferencia en la GPU del propio chip.
- Dos perfiles de despliegue: fp16 para máxima calidad y q2 para entornos con restricciones severas de memoria o disco.
- No soporta generación de texto desde prompts, diálogo multi-turno, tool calling, function calling ni flujos de agentes; la model card lo descarta explícitamente y remite a otros modelos de la familia para esas funciones.
- No soporta visión, procesamiento de imagen ni otras modalidades distintas del audio.
- No se documentan marcas de tiempo, diarización de hablantes, detección de idioma, puntuación automática ni traducción de audio a inglés; no disponible.

## Casos de uso

- Transcripción de reuniones en local: el modelo convierte las notas de voz o grabaciones de una reunión en texto sin salir del Mac, lo que evita enviar audio confidencial a APIs de terceros; su tamaño de ~481 MB permite mantenerlo cargado en memoria durante toda la jornada.
- Subtitulado de vídeo y pódcast: integrado en un script que segmenta el audio y llama al modelo por fragmentos, sirve para generar borradores de subtítulos en varios idiomas, con revisión humana posterior dado que no se documenta soporte de marcas de tiempo.
- Dictado en aplicaciones de escritorio: al ser un modelo ligero y ejecutable en MLX, puede actuar como motor de dictado en herramientas nativas de macOS, con latencia baja al no requerir red.
- Transcripción multilingüe de entrevistas o investigación cualitativa: la cobertura de ~100 idiomas permite procesar entrevistas en español, catalán, gallego, euskera, árabe o hindi con el mismo modelo, útil en proyectos de investigación con informantes de varios países.
- Prototipado y docencia en entornos Apple: sirve para demostrar pipelines de ASR en cursos o pruebas de concepto sobre un MacBook, sin GPU dedicada ni dependencias de CUDA.
- Despliegue en equipos con disco muy limitado: la variante q2 de ~74,4 MB permite incluir transcripción en imágenes o flujos donde el espacio es crítico, asumiendo una pérdida de calidad que el autor califica de «notable».
- Evaluación comparativa de ASR en Apple Silicon: útil como referencia ligera frente a otros modelos Whisper ejecutados con `mlx-whisper`, siempre que se validen las métricas por cuenta propia al no publicar el autor ningún benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo ofrece una valoración cualitativa: la versión fp16 proporciona «máxima precisión» y la q2 tiene una calidad de reconocimiento «notablemente inferior». No hay cifras de WER, CER, MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- Memoria: la versión fp16 ocupa ~481 MB en disco; en ejecución hay que sumar el tokenizador y el overhead de MLX, por lo que el consumo real es del orden de menos de 1 GB, aunque el autor no publica cifras de memoria en inferencia.
- La versión q2 ocupa ~74,4 MB y está pensada para Macs base de 8 GB o entornos con disco muy restringido.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4). No funciona en Macs Intel, ni en Windows o Linux con GPU de otros fabricantes, según la model card.
- Cabe en cualquier Mac con chip de la serie M, incluidos los modelos con 8 GB de memoria unificada.
- Requisitos de software: macOS 13.5+ (recomendado 14+), Python 3.9+ (recomendado 3.10+) y la librería `mlx-whisper` (`pip install -U mlx-whisper`).
- Opciones de despliegue: `mlx-whisper` por línea de comandos o API de Python, y descarga de pesos vía `huggingface-cli` o `curl`. No aplica soporte de vLLM, TGI, llama.cpp, Ollama ni TensorRT-LLM, al no ser un modelo de texto para esas pilas.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo real ni de velocidad de transcripción.

## Comparativa con modelos similares

No se dispone de una comparación publicada por el autor. La tabla siguiente contrasta únicamente los datos declarados en la información disponible con referencias públicas de la familia Whisper, sin métricas de calidad al no existir benchmarks de este modelo.

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| zubr-whisper-mlx | no disponible (fp16 ~481 MB) | no disponible | ~100 | no disponible | safetensors + tiktoken, MLX en Apple Silicon |
| Whisper small (referencia publica) | ~244 M | audio en fragmentos de 30 s | ~99 | MIT | safetensors / PyTorch, CPU y GPU |
| Whisper large-v3 (referencia publica) | ~1.550 M | audio en fragmentos de 30 s | ~99 | MIT | safetensors / PyTorch, requiere GPU con VRAM |
| distil-whisper-large-v3 (referencia publica) | ~756 M | audio en fragmentos de 30 s | solo inglés | MIT | safetensors / PyTorch |

La diferencia sustantiva frente a esas alternativas no es de calidad, que no está medida, sino de plataforma: `zubr-whisper-mlx` solo se ejecuta en Apple Silicon, mientras que los Whisper de referencia corren en CPU y GPU de cualquier fabricante. A cambio, su tamaño de 0,6 GB y la opción de 2 bits facilitan el despliegue en portátiles.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay WER, CER ni evaluaciones por idioma, de modo que la calidad real de transcripción es desconocida y debe medirse antes de usarla.
- Licencia no disponible: no se puede asumir uso comercial. Sin un término legal explícito, el uso en producción entraña riesgo jurídico.
- Plataforma cerrada: requiere Apple Silicon y macOS 13.5+; no hay soporte para CUDA, ROCm, Windows ni Linux.
- Modelo solo de ASR: no admite chat, instrucciones, tool calling ni otras tareas; usarlo fuera de la transcripción no es viable.
- Riesgo de alucinación específico de ASR: los modelos tipo Whisper tienden a repetir frases, inventar texto en silencios o degradarse con ruido de fondo y audio musical. El autor no documenta mitigaciones.
- Idiomas de bajos recursos: aunque la lista incluye lenguas como haw, ln, ba, jw o su, la cobertura declarada no garantiza calidad; el autor solo menciona explícitamente el ruso entre los idiomas de interés.
- Cuantización q2 agresiva: el propio autor advierte de una calidad «notablemente inferior»; no se recomienda para producción salvo restricciones extremas.
- Sin información sobre marcas de tiempo, diarización ni puntuación, lo que limita su uso directo en subtitulado profesional.
- Madurez: 0 descargas y 1 «like» en el momento de la consulta, con un único mantenedor y sin documentación sobre el dataset de entrenamiento ni proceso de validación.
- No se especifica la ventana de audio procesable ni el comportamiento en ficheros largos; habrá que segmentar manualmente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alekringtonnn-ai/zubr-whisper-mlx
- Pesos fp16: https://huggingface.co/alekringtonnn-ai/zubr-whisper-mlx/blob/main/zubr-whisper-mlx.safetensors
- Pesos cuantizados a 2 bits: https://huggingface.co/alekringtonnn-ai/zubr-whisper-mlx/blob/main/zubr-whisper-mlx-q2.safetensors
- Tokenizador multilingüe: https://huggingface.co/alekringtonnn-ai/zubr-whisper-mlx/blob/main/multilingual.tiktoken
- Modelo de chat de la misma familia citado en la model card: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b-mlx
- Librería de ejecución: `mlx-whisper` (instalación mediante `pip install -U mlx-whisper`); no se proporciona URL en la información disponible.
- Paper, blog, repositorio de código o demo: no disponible.
