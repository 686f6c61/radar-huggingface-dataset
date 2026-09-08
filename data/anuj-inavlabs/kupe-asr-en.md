# anuj-inavlabs/kupe-asr-en

## Resumen

El modelo `anuj-inavlabs/kupe-asr-en` es un sistema de reconocimiento automático de voz (ASR) en streaming para inglés, desarrollado por iNavLabs. Se trata de un checkpoint temprano de la fase 1, con 670 millones de parámetros, que convierte audio en tokens de códec neuronal Mimi (8 codebooks a 12,5 Hz) y los alimenta directamente como `inputs_embeds` a un backbone de lenguaje llamado Kupe-SLM-670M, que decodifica texto en inglés. No utiliza un encoder acústico separado, lo que simplifica la arquitectura y reduce la latencia.

El modelo resuelve el problema de transcripción de voz en tiempo real para agentes conversacionales, emitiendo señales de turno basadas en la probabilidad de fin de secuencia (`PRE_HIT_LLM` y `END_OF_SPEECH`). Está entrenado con aproximadamente 2.600 horas de audio en inglés, incluyendo un 5 % de clips de silencio etiquetados como cadena vacía para mitigar alucinaciones. Su relevancia actual radica en que ofrece un ASR pequeño, rápido y usable en voz en tiempo real, con un rendimiento inicial de 10,3 % de WER en test, que ya resulta aprovechable para agentes de voz, aunque aún está lejos de los 4-6 % de sistemas de producción con corpus mucho mayores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con backbone Kupe-SLM-670M; sin encoder acústico separado; audio -> códec Mimi (8 codebooks a 12,5 Hz) -> suma de codebooks en un embedding por frame de 80 ms -> `inputs_embeds` |
| Parametros totales | 670 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en). El backbone está preentrenado en inglés y 11 lenguas índicas, pero este checkpoint solo genera inglés |
| Licencia | other (con componentes bajo licencias upstream: códec `kyutai/mimi`, datos LibriSpeech, People's Speech CC-BY y Svarah) |
| Formato de pesos | safetensors (pesos del backbone) y `frontend.pt` (frontend de audio) |

## Arquitectura y entrenamiento

La arquitectura combina un frontend de audio basado en el códec neuronal Mimi y un modelo de lenguaje causal (Kupe-SLM-670M). El audio se codifica en 8 codebooks a 12,5 Hz, que se suman en un único embedding por frame de 80 ms. Ese embedding se inyecta como `inputs_embeds` al backbone de lenguaje, que decodifica texto en inglés de forma autorregresiva. No hay encoder acústico independiente. El modelo está diseñado para funcionar en modo streaming y en modo archivo completo, y utiliza la probabilidad de fin de secuencia del propio modelo para emitir señales de turno.

El entrenamiento fue un fine-tuning completo de todos los parámetros con pérdida de entropía cruzada de tipo causal-LM. Se usaron aproximadamente 2.606 horas de audio en inglés (LibriSpeech, People's Speech y Svarah), con un 5 % de clips de silencio etiquetados como cadena vacía para reducir alucinaciones. El proceso se realizó en una GPU H100 de 80 GB durante unas 3,5 horas, con 2 épocas y 11.158 pasos, tamaño de lote efectivo de 128, learning rate 2e-4 con programación coseno y 3 % de warmup, precisión bf16 + TF32, optimizador AdamW fusionado y regularización SpecAugment (enmascaramiento temporal). La pérdida final de validación fue 0,26. No se menciona RLHF ni DPO.

## Capacidades

- Reconocimiento de voz en inglés (ASR) tanto en streaming como en archivo completo.
- Emisión de señales de turno para integración con agentes conversacionales: `PRE_HIT_LLM` (precarga del LLM) y `END_OF_SPEECH` (confirmación final).
- Anti-alucinación: entrenado con clips de silencio etiquetados como cadena vacía, logrando que el silencio decodifique a salida vacía en el 100 % de los casos medidos.
- Tokenizer eficiente con fertilidad de 1,29 tokens por palabra en inglés, lo que acorta los objetivos y acelera la decodificación.
- El backbone Kupe-SLM está preentrenado en inglés y 11 lenguas índicas, con round-trip del tokenizer del 100 % en todas las escrituras, aunque este checkpoint solo genera texto en inglés.
- No se especifican capacidades de tool calling, function calling, visión o audio más allá de la voz.

## Casos de uso

- Agentes de voz en tiempo real: el modelo emite señales de turno que permiten predecir el final del habla y precargar el LLM, reduciendo el tiempo muerto entre la entrada de voz y la respuesta del agente. Su tamaño de 670M lo hace adecuado para ejecución en tiempo real.
- Transcripción de reuniones y llamadas: el modo streaming ofrece resultados parciales continuos, útiles para subtitulado en vivo o análisis posterior de conversaciones.
- Dictado en inglés para aplicaciones médicas o jurídicas: la baja CER (4,9 %) y la capacidad de decodificar silencio como vacío reducen falsos positivos en entornos con pausas frecuentes.
- Subtitulado automático de vídeos: el modo archivo completo permite transcribir grabaciones largas con un modelo ligero, sin necesidad de infraestructura costosa.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de audio en inglés para subtítulos en directo, con latencia reducida gracias al pipeline sin encoder acústico.
- Prototipado de pipelines multilingües: aunque el checkpoint es solo inglés, el backbone ya está preparado para extenderse a hindi, gujarati y otras lenguas índicas con más datos, lo que facilita la experimentación en sistemas multilingües.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes (no verificados):

| Métrica | Valor |
|---|---|
| Test WER (%) | 10,3 |
| Test CER (%) | 4,9 |
| Validation WER (%) | 11,2 |
| Validation CER (%) | 5,4 |
| Silencio -> salida vacía | 100 % |

El autor indica que los sistemas de ASR de producción en inglés sobre corpus mucho mayores se sitúan en torno al 4-6 % de WER, y que este 10,3 % procede de un checkpoint de fase 1 entrenado con solo 2.600 horas. Durante el entrenamiento, el WER en vivo cayó de 41 % a 10,3 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 670 millones de parámetros, lo que en bf16 ocupa aproximadamente 1,3 GB solo en pesos, pero no se han publicado requisitos oficiales de VRAM para inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una H100 de 80 GB, pero no se especifica ninguna GPU concreta para inferencia.
- Compatibilidad con GPU de consumo: no disponible oficialmente; el tamaño del modelo sugiere que podría ejecutarse en GPUs de consumo, pero no hay datos verificados.
- Opciones de despliegue: no disponible. El modelo requiere `transformers==5.4.0` y el código del repositorio `kupe-asr-en` (clase `LummaASR`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Se menciona un script con medición de RTF, pero no se proporcionan valores concretos.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con modelos similares en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint temprano de fase 1, no la versión final; la calidad mejorará con más datos, aumentación y épocas en fases posteriores.
- Solo soporta inglés (EN-only), a pesar de que el backbone está preentrenado en inglés y 11 lenguas índicas.
- El WER de 10,3 % en test es superior al de sistemas de producción (4-6 %), por lo que puede no ser adecuado para aplicaciones que exijan precisión muy alta.
- Entrenado con solo ~2.600 horas de audio, lo que puede provocar fallos en acentos, dominios o condiciones acústicas no representadas.
- Licencia `other` con componentes bajo licencias upstream; es necesario revisar las condiciones de la licencia antes de un uso comercial.
- Depende de `transformers==5.4.0` y de código específico del repositorio, por lo que no es un modelo estándar de HuggingFace con pipeline listo para usar.
- Los benchmarks declarados no están verificados (`verified: false`).
- No se especifican cuantizaciones ni integraciones con frameworks de despliegue habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anuj-inavlabs/kupe-asr-en
- Repositorio de código: https://github.com/iNavLabsResearch/kupe-asr-en
- Dataset de datos: https://huggingface.co/datasets/anuj-inavlabs/kupe-asr-en-data
- Registro de ejecuciones: https://huggingface.co/datasets/anuj-inavlabs/kupe-asr-en-runs
- Repositorio relacionado (ThinkSpark): https://github.com/iNavLabsResearch/kupe-thinkspark
- Códec de audio Mimi: https://huggingface.co/kyutai/mimi
- Datos: LibriSpeech, MLCommons People's Speech (CC-BY), AI4Bharat Svarah
