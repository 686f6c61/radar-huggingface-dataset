# sajilck/whisper-small-malayalam-v2

## Resumen

whisper-small-malayalam-v2 es un ajuste fino (fine-tuning) del modelo OpenAI Whisper Small para reconocimiento automático del habla (ASR) en malayalam, una lengua dravídica hablada principalmente en el estado de Kerala (India) con más de 35 millones de hablantes. Lo desarrolla el usuario sajilck y se publica bajo licencia Apache 2.0 en Hugging Face, aunque con acceso restringido que requiere aceptar condiciones. El modelo parte de los pesos de openai/whisper-small y los adapta a un corpus específico de malayalam, abordando el problema clásico de los modelos multilingües de propósito general: su rendimiento degradado en lenguas de bajos recursos.

La arquitectura es la de Whisper Small: un transformer encoder-decoder de tipo seq2seq con 241,7 millones de parámetros, entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado débilmente. Este ajuste conserva esa arquitectura y la especializa en un único idioma, lo que permite reducir el error de transcripción frente al modelo base multilingüe. El modelo declara en su model-index un WER normalizado del 31,16 % y un CER del 4,04 % sobre una muestra de test filtrada por fugas de 231 clips del corpus sajilck/malayalam-asr-corpus.

Su relevancia actual reside en dos factores: la escasez de modelos ASR abiertos específicos para malayalam y la inclusión de artefactos de despliegue (GGML, whisper.cpp, CTranslate2) que facilitan su integración en producción sin depender de infraestructura GPU pesada. No obstante, el WER del 31 % sigue siendo alto para aplicaciones críticas, y conviene tratarlo como una base de partida más que como una solución final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), base Whisper Small |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | GGML (whisper.cpp), CTranslate2; niveles concretos no disponibles |
| Idiomas soportados | malayalam (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGML, CTranslate2 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Small: un encoder que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con atención multi-cabeza estándar y posicionales sinusoidales. Whisper Small cuenta con 12 capas en encoder y 12 en decoder, dimensión oculta de 768 y 12 cabezas de atención, lo que suma los 241,7 millones de parámetros indicados. El preentrenamiento original de OpenAI se realizó sobre 680.000 horas de audio multilingüe con supervisión débil, lo que proporciona una base acústica y lingüística sólida antes del ajuste.

El ajuste fino se realizó sobre el corpus sajilck/malayalam-asr-corpus, según declara el autor. No se especifican en la información disponible el número de horas de audio, la composición exacta del dataset, la duración del entrenamiento, la tasa de aprendizaje ni si se aplicaron técnicas de aumento de datos o decodificación con LM externo. Tampoco se documenta si hubo etapas de RLHF o DPO, algo poco habitual en ASR. La model card menciona que la muestra de evaluación es "leakage-filtered" y "source-balanced", lo que sugiere que el autor fue consciente del riesgo de contaminación entre train y test y aplicó un filtrado explícito, un detalle metodológico relevante para interpretar el WER declarado.

## Capacidades

- Transcripción de audio a texto en malayalam, con salida de texto plano y puntuación básica heredada del modelo base.
- Reconocimiento de habla continua en ventanas de hasta 30 segundos por segmento, con la posibilidad de encadenar segmentos para audios más largos.
- Detección implícita de idioma limitada al malayalam; no se declara soporte multilingüe ni cambio de idioma dentro de una misma grabación.
- Alineación a nivel de palabra y timestamps aproximados, disponibles a través de las utilidades estándar de Whisper (whisper.cpp, faster-whisper) aunque no verificados específicamente para este ajuste.
- Despliegue en CPU mediante GGML y whisper.cpp, y en GPU/CPU con CTranslate2 (formato compatible con faster-whisper).
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No se declara capacidad de traducción a inglés ni de transcripción con diarización de hablantes.

## Casos de uso

- Subtitulado automático de vídeo en malayalam: el modelo puede transcribir pistas de audio de hasta 30 segundos por segmento y encadenarse para contenido largo, generando subtítulos SRT con timestamps aproximados. Es adecuado por su tamaño reducido y su despliegue en CPU vía whisper.cpp.
- Transcripción de reuniones y entrevistas: con un CER del 4,04 %, la salida a nivel de carácter es razonablemente fiel, lo que permite indexar y buscar contenido textual aunque el WER del 31 % introduzca errores a nivel de palabra que requieran revisión humana.
- Archivado y digitalización de contenido audiovisual en malayalam: bibliotecas, televisiones regionales y archivos públicos pueden transcribir material histórico para hacerlo buscable, usando CTranslate2 para procesar lotes en GPU.
- Asistentes de voz para atención al cliente en Kerala: integrado en un pipeline de ASR + NLU, el modelo transcribe la consulta del usuario en malayalam y la pasa a un sistema de intents; su latencia baja en GPU lo hace viable para conversaciones en tiempo casi real.
- Herramientas de accesibilidad para personas con discapacidad auditiva: generación de subtítulos en directo en eventos y clases, desplegando whisper.cpp en hardware de bajo coste sin GPU dedicada.
- Investigación en ASR de bajos recursos: sirve como baseline y punto de comparación para nuevos ajustes en malayalam y otras lenguas dravídicas, dado que publica métricas WER/CER sobre un test filtrado por fugas.
- Preprocesado de datasets de voz: transcripción masiva de corpus de audio en malayalam para construir datasets de texto alineado, con revisión posterior de las transcripciones de mayor confianza.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Conjunto de evaluación |
|---|---|---|---|
| ASR malayalam | WER (normalizado) | 31,16 | malayalam-asr-corpus test, leakage-filtered (231 clips, source-balanced) |
| ASR malayalam | CER (normalizado) | 4,04 | malayalam-asr-corpus test, leakage-filtered (231 clips, source-balanced) |

No se han publicado en la información disponible resultados comparativos frente a whisper-small base, whisper-medium ni otros modelos ASR en malayalam. El campo `verified: false` indica que las métricas no han sido auditadas por un tercero.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB para los pesos (241,7 M de parámetros) más overhead de activaciones y buffers de audio; en la práctica, menos de 2 GB en GPU.
- VRAM estimada en cuantización int8 (CTranslate2): en torno a 0,25-0,3 GB para los pesos, con huella total inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de gama alta.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y modelos integrados con suficiente memoria compartida; también funciona en CPU.
- Opciones de despliegue: whisper.cpp (formato GGML), faster-whisper mediante CTranslate2, y las librerías estándar de Transformers con safetensors. No se declara compatibilidad explícita con vLLM ni TGI, que no están orientados a ASR seq2seq de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU con whisper.cpp, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Acceso | WER malayalam |
|---|---|---|---|---|---|---|
| sajilck/whisper-small-malayalam-v2 | 241,7 M | ml | 30 s | Apache 2.0 | Restringido (gated) | 31,16 (declarado) |
| openai/whisper-small | 241,7 M | multilingüe (99) | 30 s | Apache 2.0 | Abierto | no disponible |
| openai/whisper-medium | 769 M | multilingüe (99) | 30 s | Apache 2.0 | Abierto | no disponible |
| openai/whisper-large-v3 | 1.550 M | multilingüe (99) | 30 s | Apache 2.0 | Abierto | no disponible |

La comparación directa con whisper-small base es la más relevante: este ajuste debería superar al modelo original en malayalam, pero no se aportan cifras del base en la información disponible. Whisper-medium y large-v3 ofrecen mayor capacidad y, en principio, mejor rendimiento multilingüe, a costa de un tamaño entre 3 y 6 veces mayor. No se identifican en la información disponible otros ajustes abiertos específicos de malayalam con los que comparar directamente.

## Limitaciones y advertencias

- El WER declarado del 31,16 % es alto para producción sin revisión humana; implica que aproximadamente una de cada tres palabras se transcribe incorrectamente en el conjunto de evaluación.
- Las métricas no están verificadas de forma independiente (`verified: false`) y proceden de una muestra pequeña de 231 clips; la varianza estadística puede ser considerable.
- El modelo solo soporta malayalam; no traduce a inglés ni transcribe otros idiomas, y no se documenta el comportamiento ante code-switching (malayalam-inglés), frecuente en el habla real de Kerala.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en silencios, ruido o segmentos musicales, especialmente con audio de baja calidad.
- Sesgos potenciales derivados del corpus de entrenamiento: no se documenta la distribución por género, edad, dialecto regional (Malabar, Kochi, Travancore) ni calidad de grabación, por lo que el rendimiento puede degradarse en acentos o dominios no representados.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización de pipelines y la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de desplegarlo.
- No se documentan los términos exactos del corpus de entrenamiento ni posibles restricciones adicionales sobre los datos de origen.
- El contexto de audio está limitado a ventanas de 30 segundos; audios más largos requieren segmentación y pueden sufrir errores en las fronteras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sajilck/whisper-small-malayalam-v2
- Modelo base: https://huggingface.co/openai/whisper-small
- Corpus declarado: https://huggingface.co/datasets/sajilck/malayalam-asr-corpus
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
