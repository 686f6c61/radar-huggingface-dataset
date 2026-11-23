# mondhs/whisper-medium-lt-10s-20261122-ct2

## Resumen

`mondhs/whisper-medium-lt-10s-20261122-ct2` es una conversion al formato CTranslate2 del modelo `mondhs/whisper-medium-lt-10s-20261122`, un fine-tuning de Whisper medium especializado en reconocimiento automatico del habla (ASR) en lituano. Lo publica el usuario de Hugging Face `mondhs` y esta pensado para su uso con `faster-whisper`, la implementacion de inferencia optimizada que emplea el motor CTranslate2 para reducir latencia y consumo de memoria frente a la implementacion original de OpenAI.

El modelo parte de la arquitectura Whisper medium de OpenAI, un transformer encoder-decoder con aproximadamente 769 millones de parametros y una ventana de audio de 30 segundos, y ha sido ajustado sobre el dataset `liepa-project/LIEPA-3_read-spon-dial_16kHz`, que combina habla leida, espontanea y dialogada en lituano a 16 kHz. El resultado es un checkpoint especificamente orientado a transcripcion en lituano, un idioma con relativamente pocos recursos ASR en comparacion con ingles, castellano o frances.

La relevancia de esta ficha radica en que el repositorio contiene exclusivamente pesos en formato CTranslate2 (1,5 GB), listos para `faster-whisper`, no el checkpoint original de PyTorch. Ademas, el acceso esta restringido (gated) en Hugging Face y requiere aceptar condiciones, y el modelo es una publicacion reciente con cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto experimental sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium de OpenAI) |
| Parametros totales | ~769 M (heredados de Whisper medium; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (Whisper estandar) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos CTranslate2; el nombre sugiere variante `ct2`, sin detalle de precision) |
| Idiomas soportados | lituano (`lt`) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (compatible con `faster-whisper`) |
| Modelo base | `mondhs/whisper-medium-lt-10s-20261122` |
| Dataset de entrenamiento | `liepa-project/LIEPA-3_read-spon-dial_16kHz` |
| Tamano del repositorio | 1,5 GB |
| Acceso | restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado originalmente por OpenAI sobre 680 000 horas de audio multilingue debilmente supervisado. El encoder procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y el decoder genera tokens de texto con marcas de tiempo. Este repositorio no introduce modificaciones arquitectonicas: es una conversion del checkpoint fine-tuneado al formato CTranslate2, que aplica optimizaciones de inferencia (fusion de operaciones, gestion de memoria y posibles cuantizaciones) sin alterar la topologia de la red.

El fine-tuning se realizo sobre el corpus `liepa-project/LIEPA-3_read-spon-dial_16kHz`, que segun su nombre combina habla leida, espontanea y dialogada muestreada a 16 kHz para el idioma lituano. No se dispone de informacion detallada sobre el numero de horas, la composicion exacta del dataset, el regimen de entrenamiento (learning rate, epocas, congelacion de capas) ni sobre si se aplicaron tecnicas de augmentacion o regularizacion. Tampoco hay evidencia de RLHF o DPO, algo esperable en un modelo ASR. El sufijo `10s` en el nombre sugiere una ventana de entrenamiento o evaluacion de 10 segundos, pero no se documenta en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla en lituano sobre audio de 16 kHz.
- Transcripcion con marcas de tiempo a nivel de segmento (capacidad estandar de Whisper).
- Procesamiento de audio en ventanas de hasta 30 segundos por inferencia, con concatenacion de segmentos para audios mas largos.
- Deteccion de idioma heredada de Whisper, aunque el ajuste fino esta orientado exclusivamente a lituano.
- Inferencia acelerada mediante CTranslate2 y compatible con `faster-whisper`.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (no aplica a un modelo ASR).
- No se documentan capacidades de vision, audio-vision ni traduccion explicita mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lituano: el modelo puede procesar grabaciones divididas en segmentos de hasta 30 segundos y generar transcripciones con marcas de tiempo, adecuado para actas automaticas en entornos empresariales lituanos.
- Subtitulado de contenido audiovisual: integrado en un pipeline que segmenta el audio y llama al modelo via `faster-whisper`, permite generar subtitulos en lituano con timestamps para plataformas de video.
- Atencion al cliente con analitica de voz: transcripcion de llamadas grabadas para su posterior analisis de sentimiento, cumplimiento o busqueda de texto completo, aprovechando la licencia MIT para uso comercial interno.
- Archivado y busqueda de fondos orales: digitalizacion de archivos de audio historicos o administrativos en lituano, con indexacion de transcripciones para recuperacion posterior.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenidos en lituano, desplegando `faster-whisper` sobre GPU de gama media.
- Investigacion linguistica: analisis de corpus de habla leida, espontanea y dialogada en lituano, ya que el modelo fue ajustado precisamente sobre ese tipo de datos.
- Prototipado de asistentes de voz locales: al ser un modelo de ~769 M de parametros y licencia MIT, puede ejecutarse en hardware modesto para pruebas de concepto de dictado o comandos por voz en lituano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de WER, CER ni comparaciones con otros modelos, y el repositorio registra cero descargas y cero likes, por lo que no existe validacion comunitaria documentada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,5 GB en disco; en inferencia con CTranslate2 en FP16 se estima un consumo del orden de 2-3 GB de VRAM, y en INT8 puede reducirse por debajo de 2 GB (estimacion basada en el tamano del modelo, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; NVIDIA T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles. CTranslate2 tambien permite inferencia en CPU con cuantizacion INT8.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM, e incluso en CPU para cargas por lotes no criticas.
- Opciones de despliegue: `faster-whisper` (recomendado, dado que los pesos son CTranslate2), servidores compatibles con CTranslate2 y contenedores propios. No es directamente cargable con `transformers` ni `llama.cpp`, ya que el formato es CTranslate2 y no safetensors ni GGUF.
- Latencia y throughput: no disponibles. Dependen de la GPU, del tamano de los segmentos y de la precision de cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `mondhs/whisper-medium-lt-10s-20261122-ct2` | ~769 M | 30 s por segmento | lituano | MIT | CTranslate2 | Fine-tuning lituano, acceso gated, sin benchmarks publicados |
| `openai/whisper-medium` | 769 M | 30 s por segmento | multilingue (99 idiomas) | MIT | PyTorch safetensors | Modelo base original, cobertura multilingue pero sin especializacion en lituano |
| `openai/whisper-large-v3` | 1550 M | 30 s por segmento | multilingue (99 idiomas) | MIT | PyTorch safetensors | Mayor precision general, mayor coste de VRAM (~6-10 GB en FP16) |
| `faster-whisper` (conversiones oficiales) | 39 M - 1550 M | 30 s por segmento | multilingue | MIT | CTranslate2 | Conversiones genericas sin fine-tuning especifico por idioma |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre modelos ASR lituanos alternativos en la informacion proporcionada. No hay datos de WER que permitan afirmar que este fine-tuning supere al Whisper medium original en lituano.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion (WER, CER) en la informacion disponible; se desconoce si el fine-tuning mejora al Whisper medium original en lituano.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (22 de noviembre de 2026), lo que sugiere una publicacion sin validacion externa.
- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatizacion en pipelines de CI/CD.
- El modelo esta especializado exclusivamente en lituano; su uso en otros idiomas producira resultados degradados aunque Whisper detecte el idioma.
- Los pesos estan en formato CTranslate2 y no son cargables directamente con `transformers`, `llama.cpp` ni `Ollama`; requieren `faster-whisper` o el runtime de CTranslate2.
- Al ser un modelo ASR, hereda los sesgos de Whisper: posible peor rendimiento en acentos no representados, audio con ruido, habla solapada o vocabulario tecnico poco frecuente.
- Riesgo de alucinacion en pasajes de silencio o ruido, comportamiento conocido en la familia Whisper; conviene aplicar filtros de VAD (deteccion de actividad de voz) en produccion.
- Aunque la licencia es MIT y permite uso comercial, la condicion de acceso gated debe respetarse segun los terminos del autor.
- No se documenta el proceso de cuantizacion aplicado en la conversion a CTranslate2, por lo que se desconoce si hay perdida de precision respecto al checkpoint original en PyTorch.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mondhs/whisper-medium-lt-10s-20261122-ct2
- Modelo base (fine-tuning): https://huggingface.co/mondhs/whisper-medium-lt-10s-20261122
- Dataset de entrenamiento: https://huggingface.co/datasets/liepa-project/LIEPA-3_read-spon-dial_16kHz
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper de OpenAI: https://github.com/openai/whisper
