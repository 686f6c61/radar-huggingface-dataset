# rabitrabi/whisper-tiny-minds14-en-us

## Resumen

Whisper Tiny MINDS-14 en-US es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario rabitrabi y publicado en Hugging Face. Se trata de un modelo de reconocimiento automático del habla (ASR) especializado en el dominio de llamadas bancarias en inglés estadounidense, entrenado sobre el subconjunto en-US del dataset PolyAI/minds14. El modelo hereda la arquitectura encoder-decoder transformer de Whisper en su variante "tiny", con 37,7 millones de parámetros, lo que lo sitúa entre los modelos ASR más ligeros disponibles.

El problema que aborda es la adaptación de un modelo ASR genérico a un dominio muy concreto (interacciones telefónicas con servicios bancarios) mediante un ajuste fino ligero: una sola época sobre las primeras 450 locuciones del subconjunto, reservando 113 para evaluación. No se trata de un modelo de propósito general ni de un lanzamiento con vocación de producción, sino de un experimento reproducible de dominio específico con métricas declaradas por el autor.

Su relevancia es limitada pero concreta: sirve como referencia para quienes necesiten un ASR de muy bajo coste computacional en inglés estadounidense para audio corto de dominio bancario, o como punto de partida para ajustes finos similares. El rendimiento declarado (WER normalizado de 0,314) es alto en términos absolutos, coherente con el tamaño mínimo del modelo base y el escaso volumen de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder con atención multi-cabeza estándar, diseñado originalmente para transcripción de audio en múltiples idiomas. Whisper opera sobre espectrogramas Mel de 80 canales y procesa ventanas de audio de 30 segundos; el decoder genera tokens de texto condicionados por el encoder y por tokens especiales de idioma y tarea. El modelo base tiny es la variante más pequeña de la familia Whisper, con 37,7 millones de parámetros.

El ajuste fino se realizó durante una única época sobre las primeras 450 locuciones del subconjunto en-US de MINDS-14 (dataset de intenciones bancarias multilingüe), dejando las 113 restantes como conjunto de evaluación retenido. Se empleó el optimizador AdamW con una tasa de aprendizaje de 1e-5 y un tamaño de lote de 6. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni aumentación de datos. La normalización de texto para el cálculo del WER usa el normalizador básico de Whisper.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés estadounidense, orientado a locuciones cortas de dominio bancario.
- Transcripción de audio a texto mediante la pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni comportamiento agente.
- No se documenta capacidad multilingüe más allá del inglés (el modelo base la tiene, pero el ajuste fino se limita a en-US).
- No se documenta modo de razonamiento (thinking), visión ni audio más allá de la entrada ASR estándar.
- No se documenta capacidad de diarización ni de marcas temporales a nivel de palabra.

## Casos de uso

- Transcripción de llamadas bancarias cortas en inglés estadounidense: el modelo está ajustado específicamente sobre MINDS-14 en-US, por lo que encaja en la transcripción de locuciones breves de atención al cliente telefónica, siempre que se acepte el WER declarado en torno al 31 %.
- Prototipado rápido de pipelines ASR de bajo coste: con 37,7 millones de parámetros y un repo de 0,2 GB, permite iterar en local sin GPU dedicada para validar flujos de transcripción antes de escalar a modelos mayores.
- Generación de datos sintéticos o aumentados para clasificación de intenciones: al transcribir audio bancario se puede alimentar un clasificador de intenciones aguas abajo, usando el modelo como primer eslabón del pipeline.
- Evaluación comparativa de ajustes finos de Whisper: sirve como referencia reproducible (época, lr, batch, split) para comparar estrategias de fine-tuning sobre MINDS-14 con otros modelos o hiperparámetros.
- Educación y experimentación académica: adecuado para prácticas de ajuste fino de ASR con transformers, dado su tamaño reducido y su model card detallada en hiperparámetros.
- Despliegue en entornos con recursos muy limitados: al ser la variante tiny, puede ejecutarse en CPU o en GPUs de gama baja para transcripción offline de audio corto, aceptando la penalización de precisión.
- Filtrado o enrutamiento previo en centros de contacto: transcripción aproximada de fragmentos para decidir si se deriva la llamada a un agente humano o a un sistema más potente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| ASR | PolyAI/minds14, config en-US, split train[450:] | Normalized WER | 0,3140495867768595 |
| ASR | PolyAI/minds14, config en-US, split train[450:] | Orthographic WER | 0,3429981492905614 |

No se han publicado en la informacion disponible resultados en otros benchmarks (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamaño del modelo (37,7 millones de parametros, repo de 0,2 GB) es esperable que quepa en cualquier GPU consumer, aunque no se aporta medicion oficial.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: si, por tamano (variante tiny de Whisper), aunque no se documenta una lista concreta de modelos.
- Opciones de despliegue: transformers (libreria declarada), endpoints de Hugging Face (tag `endpoints_compatible`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con modelos alternativos. Como referencia estructural, el modelo base es openai/whisper-tiny; no se aportan datos de rendimiento de otros ajustes finos sobre MINDS-14 ni de modelos ASR comparables.

| Modelo | Parametros | Contexto | WER (MINDS-14 en-US) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rabitrabi/whisper-tiny-minds14-en-us | 37.760.640 | no disponible | 0,314 (normalizado) | no disponible | Hugging Face |
| openai/whisper-tiny (base) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El WER declarado (0,314 normalizado, 0,343 ortografico) es alto en terminos absolutos; el modelo no es adecuado para transcripcion de calidad en produccion sin una revision humana o un modelo mayor.
- El ajuste fino se limita a 450 locuciones y una sola epoca; el riesgo de sobreajuste y de baja generalizacion fuera del dominio bancario es elevado.
- La evaluacion cubre solo locuciones cortas de dominio bancario; el rendimiento en grabaciones largas y otros dominios no ha sido medido (segun la propia model card).
- Idioma restringido a ingles estadounidense en el ajuste fino; no se garantiza comportamiento correcto en otras variantes del ingles ni en otros idiomas.
- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenar sobre un dataset de intenciones bancarias, es esperable un sesgo hacia vocabulario y patrones de ese dominio.
- Riesgo de alucinacion: no documentado explicitamente; en modelos ASR pequenos es habitual la generacion de texto plausible no presente en el audio, especialmente con ruido o acentos no vistos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue productivo.
- Resultados de benchmarks no verificados (`verified: false` en el model-index); deben tratarse como declaraciones del autor.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rabitrabi/whisper-tiny-minds14-en-us
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Repositorio de transformers: https://github.com/huggingface/transformers
- Paper de Whisper (Radford et al.): no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
