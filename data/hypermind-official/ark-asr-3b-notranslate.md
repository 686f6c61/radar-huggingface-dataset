# hypermind-official/ARK-ASR-3B-NoTranslate

## Resumen

ARK-ASR-3B-NoTranslate es una adaptación del modelo de reconocimiento automático del habla (ASR) ARK-ASR-3B, desarrollado por AutoArk-AI, cuyo objetivo es corregir un comportamiento problemático del modelo base: la tendencia a devolver traducciones al inglés no solicitadas cuando se le presenta audio en otros idiomas. El modelo base, de 3.752 millones de parámetros, lograba un WER medio del 5,04 % en el benchmark inglés de Open ASR Leaderboard, pero en el conjunto FLEURS solo el 73,4 % de los clips no ingleses se transcribían en el idioma hablado. Esta versión, creada por hypermind-official, emplea una intervención mínima mediante un adaptador LoRA fusionado en la capa 26, entrenado con 103 pares contrastivos extraídos de FLEURS dev, y eleva la tasa de respuestas correctas en el idioma original hasta el 94,9 % sin penalizar significativamente el rendimiento en inglés (WER pasa de 5,53 % a 5,57 %) ni en chino (CER de 3,22 % a 3,25 %).

La arquitectura combina un codificador de audio estilo Whisper, un adaptador MLP y un decodificador basado en Qwen, procesando audio a 16 kHz. El modelo soporta 19 idiomas y se distribuye con licencia Apache 2.0 en formato safetensors, siendo un reemplazo directo del modelo base sin necesidad de código personalizado ni hooks adicionales. Su relevancia radica en que ofrece una solución práctica para sistemas ASR multilingües que necesitan transcripción fiel en el idioma original, evitando traducciones espurias que degradan la calidad del servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + adaptador MLP + decodificador Qwen (autoregresivo) |
| Parametros totales | 3.752.273.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (procesa audio a 16 kHz; duracion maxima no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | zh, en, de, ja, fr, ko, es, pl, it, ro, hu, cs, nl, fi, hr, sk, sl, et, lt (19 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base ARK-ASR-3B emplea una arquitectura híbrida: un codificador de audio basado en el diseño de Whisper, un adaptador MLP que proyecta las representaciones acústicas al espacio del decodificador, y un decodificador transformer autoregresivo derivado de Qwen. El audio se muestrea a 16 kHz y el sistema realiza transcripción end-to-end. El modelo base fue entrenado con datos multilingües que incluyen FLEURS y LibriSpeech, entre otros, y reporta un WER medio del 5,04 % en el benchmark corto de Open ASR Leaderboard en inglés.

La adaptación de hypermind-official se centra en un problema concreto: la traducción no intencionada al inglés. Para ello se construyó un conjunto de datos contrastivo con 103 pares (audio + transcripción en el idioma fuente + salida en inglés del modelo base) a partir de FLEURS dev, limitado a francés, alemán y español. Mediante experimentos de activación dirigida se identificó la capa 26 como punto de intervención eficaz, y se entrenó un adaptador LoRA con esos pares, que posteriormente se fusionó en los pesos del checkpoint liberado. Este enfoque minimiza el impacto en las capacidades existentes del modelo, como demuestran las variaciones relativas de alrededor del 1 % en WER y CER para inglés y chino respectivamente.

## Capacidades

- Transcripción de voz a texto en 19 idiomas: chino, inglés, alemán, japonés, francés, coreano, español, polaco, italiano, rumano, húngaro, checo, neerlandés, finés, croata, eslovaco, esloveno, estonio y lituano.
- Generación de transcripciones en el idioma hablado, reduciendo drásticamente las traducciones espurias al inglés (del 26,6 % al 5,1 % de clips no ingleses mal respondidos).
- Inferencia sin código personalizado: compatible con la interfaz estándar de Transformers y con vLLM, lo que facilita su integración en pipelines existentes.
- Procesamiento de audio a 16 kHz, adecuado para la mayoría de casos de uso de ASR en producción.
- No se documentan capacidades de tool calling, agentes o razonamiento multimodal más allá de la entrada de audio.

## Casos de uso

- Subtitulado automático multilingüe: el modelo transcribe vídeos o podcasts en el idioma original, evitando que el sistema devuelva traducciones al inglés cuando el contenido es, por ejemplo, alemán o francés. Su baja tasa de errores en esos idiomas (WER del 8,7 % en alemán, 7,2 % en francés) lo hace adecuado para generar subtítulos precisos.
- Atención al cliente con soporte en varios idiomas: en centros de llamadas o chatbots de voz, el modelo puede transcribir interacciones de clientes en su lengua materna sin mezclar idiomas, mejorando el análisis posterior de sentimiento o la extracción de intenciones.
- Transcripción de reuniones y actas: con soporte para 19 idiomas europeos y asiáticos, puede procesar grabaciones de reuniones internacionales y generar actas en el idioma hablado, reduciendo la necesidad de post-edición por traducciones incorrectas.
- Archivado y búsqueda de contenido audiovisual: al transcribir fielmente el idioma original, facilita la indexación y búsqueda de archivos de audio y vídeo en bibliotecas digitales, especialmente en idiomas minoritarios como estonio o lituano.
- Asistentes de voz en dispositivos: su integración con vLLM y Transformers permite desplegarlo en servidores de inferencia para asistentes domésticos o empresariales que necesiten entender comandos en varios idiomas sin cambiar de modelo.
- Análisis de llamadas de soporte técnico: en empresas con operaciones globales, el modelo puede transcribir llamadas en checo, polaco o finés, por ejemplo, y alimentar sistemas de análisis de calidad que requieren transcripciones en el idioma original para evaluar el desempeño del agente.

## Benchmarks y rendimiento

La model card del autor proporciona resultados detallados en FLEURS test (250 clips por idioma, 19 idiomas). La siguiente tabla resume el error (WER o CER según idioma) del modelo adaptado frente al base. Los valores son porcentajes; para chino, japonés y coreano se usa CER.

| Idioma | Métrica | Error base | Error adaptado |
|---|---|---|---|
| Español | WER | 25,5 | 6,1 |
| Inglés | WER | 6,4 | 6,5 |
| Francés | WER | 30,6 | 7,2 |
| Chino | CER | 8,3 | 8,4 |
| Alemán | WER | 48,1 | 8,7 |
| Italiano | WER | 35,7 | 10,5 |
| Japonés | CER | 48,3 | 16,7 |
| Neerlandés | WER | 62,8 | 17,7 |
| Polaco | WER | 49,1 | 21,1 |
| Checo | WER | 44,9 | 21,8 |
| Finés | WER | 42,5 | 28,6 |
| Croata | WER | 50,0 | 29,8 |
| Eslovaco | WER | 53,9 | 30,5 |
| Húngaro | WER | 56,1 | 32,1 |
| Rumano | WER | 63,7 | 34,8 |
| Esloveno | WER | 60,8 | 41,7 |
| Estonio | WER | 53,0 | 42,5 |
| Coreano | CER | 104,3 | 44,0 |
| Lituano | WER | 73,0 | 56,9 |

Además, el modelo base reporta un WER medio del 5,04 % en el benchmark inglés de Open ASR Leaderboard (short-form), con un RTFx de 490,98. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 3.752 millones de parámetros, una estimación orientativa sería de ~7,5 GB en FP16 (sin cuantización) y ~3,8 GB en cuantización de 8 bits, aunque no se han proporcionado cifras oficiales.
- GPU recomendadas: se puede ejecutar en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) para FP16, o en GPUs profesionales como A100 (40/80 GB) para mayor throughput. Para cuantización, tarjetas con 8-12 GB podrían ser suficientes.
- Sí cabe en GPUs de consumo con suficiente VRAM: una RTX 3090 o 4090 puede manejar el modelo en FP16, y con cuantización 8 bits podría caber en GPUs de 12 GB.
- Opciones de despliegue: compatible con Transformers (PyTorch) y vLLM, según los tags del repositorio. También se puede usar con llama.cpp si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponible. El modelo base reporta un RTFx de 490,98 en el benchmark Open ASR Leaderboard, lo que sugiere un rendimiento en tiempo real alto, pero no hay datos específicos para esta adaptación.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas con otros modelos ASR multilingües en la información proporcionada. Sin embargo, se puede contextualizar con alternativas conocidas:

| Modelo | Parametros | Idiomas | WER (EN) | Licencia | Notas |
|---|---|---|---|---|---|
| ARK-ASR-3B (base) | 3,75 B | 19 | 5,04 % | Apache 2.0 | Modelo original con problema de traducción no intencionada |
| ARK-ASR-3B-NoTranslate | 3,75 B | 19 | 5,57 % | Apache 2.0 | Adaptación que corrige el problema, con penalización mínima |
| Whisper large-v3 | 1,55 B | 99 | ~5,5 % (estimado) | MIT | Modelo de referencia de OpenAI, mayor cobertura de idiomas pero sin corrección específica de traducción espuria |

No hay datos oficiales de comparación en la información disponible, por lo que esta tabla es orientativa y no debe tomarse como evaluación rigurosa.

## Limitaciones y advertencias

- La adaptación se entrenó con solo 103 pares contrastivos de francés, alemán y español. Aunque los resultados generales muestran mejoras en todos los idiomas, los idiomas no incluidos en el entrenamiento (como coreano o lituano) presentan tasas de error más altas, aunque muy inferiores a las del modelo base.
- El modelo aún puede producir traducciones al inglés en ciertos casos, especialmente en idiomas con menos datos (por ejemplo, coreano tiene un 13,6 % de respuestas en inglés tras la adaptación, frente al 41,6 % del base).
- No se han evaluado sesgos de género, raza o dialecto en la información proporcionada. Como modelo ASR, puede tener un rendimiento desigual con acentos o variedades regionales no representadas en los datos de entrenamiento.
- Riesgo de alucinación: aunque no se documenta específicamente, los modelos ASR autoregresivos pueden generar texto plausible pero incorrecto en audio ruidoso o ambiguo.
- Limitaciones de contexto: no se especifica la duración máxima de audio soportada. Para clips largos puede ser necesario segmentar.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de los datasets subyacentes (FLEURS, LibriSpeech) para posibles restricciones adicionales.
- El modelo es un fine-tune del modelo base ARK-ASR-3B; cualquier limitación inherente a ese modelo (por ejemplo, cobertura de idiomas limitada a 19) se mantiene.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/hypermind-official/ARK-ASR-3B-NoTranslate
- Modelo base: https://huggingface.co/Audio8/ARK-ASR-3B
- Demo en Hugging Face Space: https://huggingface.co/spaces/AutoArk-AI/ark-asr-3b
- Referencia en awesome-ai-voice: https://github.com/wildminder/awesome-ai-voice/blob/main/models/ark-asr-3b.md
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ark-asr-3b-autoark-ai
- Repositorio GitHub de AutoArk (open-audio-opd): https://github.com/AutoArk/open-audio-opd
