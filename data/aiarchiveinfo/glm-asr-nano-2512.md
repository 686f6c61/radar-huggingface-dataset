# AIArchiveInfo/GLM-ASR-Nano-2512

## Resumen

GLM-ASR-Nano-2512 es un modelo de reconocimiento automatico del habla (ASR) de codigo abierto desarrollado por zai-org (Z.ai / Zhipu AI). La ficha que nos ocupa, `AIArchiveInfo/GLM-ASR-Nano-2512`, es un espejo de preservacion byte a byte del repositorio original `zai-org/GLM-ASR-Nano-2512` (revision `61ba4e0b3309`), archivado el 25 de septiembre de 2026; no se ha entrenado, ajustado ni alterado ningun peso. El modelo esta disenado para transcripcion robusta en condiciones acusticas complejas, con enfasis en dialectos (incluido el cantonés) y en voz de muy bajo volumen.

La model card declara un tamano de 1,5B parametros, aunque el recuento real de pesos en safetensors del repositorio asciende a 2.257.843.200 parametros (~2,26 mil millones), una discrepancia que conviene tener presente. El modelo compite directamente con OpenAI Whisper V3 y, segun el autor, logra el menor error medio (4,10) entre los modelos abiertos comparables, con ventajas especificas en benchmarks en chino como Wenet Meeting y Aishell-1.

Su relevancia actual radica en dos frentes: por un lado, cubre casos que Whisper tiende a fallar (habla a bajo volumen y variantes dialectales del chino); por otro, su tamano compacto (~4,5 GB de pesos) permite desplegarlo en hardware de gama media y en frameworks de inferencia como transformers, vLLM y SGLang. La licencia MIT facilita su integracion en productos comerciales sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer orientado a generacion condicional (clase `GlmAsrForConditionalGeneration`, compatible con `AutoModelForSeq2SeqLM`); detalle de capas del encoder/decoder no disponible |
| Parametros totales | 2.257.843.200 (~2,26B) segun safetensors; la model card declara 1,5B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la generacion se controla con `max_new_tokens`; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, zh; la model card anade soporte optimizado para cantonés y otros dialectos del chino |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition (automatic-speech-recognition / text2text-generation) |
| Tamano del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una arquitectura de generacion condicional tipo seq2seq, cargable mediante `GlmAsrForConditionalGeneration` o, de forma generica, `AutoModelForSeq2SeqLM`. Esto implica un encoder que procesa la senal de audio y un decoder de lenguaje que emite tokens de texto, siguiendo el patron habitual en modelos ASR basados en transformers. El detalle concreto del numero de capas, dimensiones ocultas, mecanismo de atencion o diseno del encoder de audio no se especifica en la model card ni en los metadatos proporcionados, por lo que se marca como no disponible.

En cuanto al entrenamiento, la model card indica que el modelo fue especificamente entrenado para escenarios de "Whisper/Quiet Speech" (habla en voz baja o volumen muy reducido) y optimizado para cantonés y otros dialectos, pero no se detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo unico verificable es que se publica como espejo byte a byte y que, por tanto, los pesos coinciden exactamente con los del modelo original.

## Capacidades

- Transcripcion de voz a texto (ASR) sobre audio en ingles y chino mandarin.
- Reconocimiento optimizado de cantonés y otras variantes dialectales del chino, un punto debil habitual en modelos ASR genericos.
- Transcripcion robusta de habla a muy bajo volumen, entrenada especificamente para esa condicion.
- Procesamiento por lotes (batched inference) de multiples ficheros de audio en una sola llamada.
- Entrada de audio tanto por URL remota como por array de audio local, mediante `processor.apply_transcription_request`.
- Generacion controlada con parametros de decodificacion (`do_sample=False`, `max_new_tokens=500` en los ejemplos).
- Integracion con `transformers`, con soporte anunciado para `transformers 5.x`, vLLM y SGLang.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) e inclusion en la categoria `text2text-generation`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente automatizada: transcripcion de llamadas en ingles o chino para su posterior analisis; el modelo puede integrarse en un pipeline de speech-to-text y volcar el resultado a un sistema de tickets.
- Subtitulado y transcripcion de reuniones: con soporte para Wenet Meeting (escenarios con ruido y solapamiento de voz), encaja en herramientas de actas automaticas y generacion de subtitulos.
- Archivado de audio historico: su robustez ante voz de bajo volumen permite recuperar grabaciones donde otros modelos fallan por nivel de senal bajo.
- Transcripcion de contenido en cantonés: util para medios, plataformas de video y servicios dirigidos a audiencias de Hong Kong y Guangdong, donde muchos modelos abiertos tienen cobertura limitada.
- Dictado y asistentes de voz en aplicaciones de productividad: al ser compacto (~4,5 GB), puede desplegarse en servidores modestos para transcripcion en tiempo casi real.
- Pipelines de analitica de voz: transcripcion masiva por lotes de llamadas, podcasts o entrevistas, seguida de indexacion o busqueda semantica.
- Investigacion en ASR dialectal: disponible bajo MIT, sirve como linea base reproducible para estudiar reconocimiento de dialectos chinos.
- Preprocesado para LLM: convertir audio a texto antes de alimentar un modelo de lenguaje en flujos de resumen, clasificacion o extraccion de entidades.

## Benchmarks y rendimiento

La model card afirma que GLM-ASR-Nano supera a OpenAI Whisper V3 en varios benchmarks y que alcanza el menor error medio (4,10) entre los modelos abiertos comparables, con ventajas en benchmarks en chino (Wenet Meeting y Aishell-1). No obstante, los resultados numericos detallados se presentan unicamente como una imagen en el repositorio original, por lo que no es posible reproducir la tabla completa con cifras concretas en esta ficha.

| Aspecto | Resultado declarado |
|---|---|
| Error medio (media agregada) | 4,10 (el menor entre modelos abiertos comparables, segun el autor) |
| Comparacion con Whisper V3 | Ventaja declarada en varios benchmarks |
| Wenet Meeting (chino, ruido y solapamiento) | Ventaja declarada |
| Aishell-1 (mandarin estandar) | Ventaja declarada |
| Cifras detalladas por benchmark (WER/CER exactos) | no disponible en la informacion proporcionada |

Nota: los numeros anteriores proceden del autor del modelo; no se han verificado de forma independiente en esta ficha. Para ASR no aplican benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, no confirmada por el autor):
  - bf16/fp16: en torno a 4,5 GB solo de pesos, mas cache de activaciones y claves/valores; en la practica, del orden de 6-9 GB.
  - int8: aproximadamente 3-4 GB.
  - int4: aproximadamente 2-3 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en produccion con lotes grandes; RTX 4090, RTX 4000 Ada o A10G para uso en servidor pequeno.
- Cabe en GPU de consumo: si. Con 2,26B parametros en bf16 (unos 4,5 GB de pesos), es probable que funcione en tarjetas de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en cuantizacion int4 podria caber en GPUs de 8 GB o menos.
- Opciones de despliegue: `transformers` (referencia de la model card), vLLM y SGLang (soporte anunciado). No se documenta compatibilidad con llama.cpp ni Ollama; para un modelo ASR con encoder de audio y formato safetensors, no se indica soporte GGUF.
- Latencia y throughput: no disponible. Dependera del backend, del tamano de lote, de la duracion del audio y del hardware, por lo que no se ofrece cifra fiable.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto/observaciones | Disponibilidad |
|---|---|---|---|---|---|
| GLM-ASR-Nano-2512 | 2,26B reales (1,5B declarados) | en, zh + dialectos (cantonés) | MIT | ASR seq2seq; robustez en voz baja y dialectos | HuggingFace (original y espejo) |
| OpenAI Whisper large-v3 | ~1,55B | multilingue (~99 idiomas) | MIT | Referencia abierta; menor especializacion en dialectos chinos segun la model card | HuggingFace / OpenAI |
| OpenAI Whisper large-v3-turbo | ~809M | multilingue | MIT | Version recortada y mas rapida de Whisper | HuggingFace / OpenAI |
| Otros ASR chinos (SenseVoice, Paraformer) | no disponible | zh / en segun variante | no disponible | Comparativa de WER exacta no disponible en la informacion proporcionada | HuggingFace / ModelScope |

No se dispone de cifras de WER comparativas verificadas entre estos modelos en la informacion proporcionada; la unica afirmacion concreta es la del autor, que situa a GLM-ASR-Nano por delante de Whisper V3 y con el menor error medio (4,10) entre modelos abiertos comparables.

## Limitaciones y advertencias

- Cobertura idiomatica limitada: los idiomas declarados son ingles y chino (con dialectos chinos como el cantonés); no se documenta soporte para otras lenguas, lo que lo hace inadecuado para transcripcion multilingue general.
- Riesgo de alucinacion tipico de modelos ASR generativos: en silencios, ruido o audio ininteligible puede producir texto plausible pero no presente en el audio.
- Rendimiento en idiomas distintos de en/zh no garantizado y probablemente degradado.
- Discrepancia de parametros: la model card indica 1,5B, pero los safetensors suman ~2,26B; conviene verificar el consumo real de memoria antes de dimensionar el hardware.
- Este repositorio es un espejo de archivo sin descargas ni interacciones (0 descargas, 0 likes) y no lo mantiene el autor original; para incidencias o actualizaciones hay que acudir al repositorio `zai-org/GLM-ASR-Nano-2512`.
- Ausencia de datos de entrenamiento: no se documentan tokens, composicion del dataset ni proceso de alineacion, lo que dificulta evaluar sesgos auditivos o acusticos.
- Sesgos potenciales no cuantificados: no hay analisis publicado sobre acentos regionales, edad, genero o calidad de canal de audio.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la propia licencia; no impone restricciones adicionales, pero el espejo incluye la licencia original "verbatim".
- Soporte de frameworks anunciado pero no verificado en esta ficha: vLLM, SGLang y `transformers 5.x` se citan como compatibles, sin datos de rendimiento publicados.

## Enlaces

- Modelo espejo en HuggingFace: https://huggingface.co/AIArchiveInfo/GLM-ASR-Nano-2512
- Modelo original: https://huggingface.co/zai-org/GLM-ASR-Nano-2512
- Revision archivada del original: https://huggingface.co/zai-org/GLM-ASR-Nano-2512/tree/61ba4e0b3309b6656edea3e93e419f7bd5c61957
- Repositorio GitHub: https://github.com/zai-org/GLM-ASR
- Imagen de benchmarks: https://raw.githubusercontent.com/zai-org/GLM-ASR/refs/heads/main/resources/bench.png
- Logo del proyecto: https://raw.githubusercontent.com/zai-org/GLM-ASR/refs/heads/main/resources/logo.svg
- Comunidad WeChat (imagen del QR/canal): https://raw.githubusercontent.com/zai-org/GLM-ASR/refs/heads/main/resources/wechat.png
- Audio de ejemplo (dataset de pruebas): https://huggingface.co/datasets/hf-internal-testing/dummy-audio-samples
