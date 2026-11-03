# rebreda/moonshine-base-welsh-compact

## Resumen

Moonshine Base Welsh (compact) es un modelo de reconocimiento automático del habla (ASR) especializado en galés, desarrollado por el usuario rebreda a partir de Moonshine Base de moonshine-ai. Se trata de una versión podada y compactada del modelo original: pasa de 61,5M a 53,2M de parámetros y almacena los pesos en fp16, reduciendo el repositorio de 246 MB a 106 MB. El modelo está diseñado para transcribir audio corto en galés con puntuación y mayúsculas, e incorpora vocabulario inglés para palabras inglesas incrustadas en habla galesa.

La relevancia de esta ficha radica en su enfoque de optimización sin reentrenamiento: el autor aplica promediado de checkpoints LoRA, desactivación selectiva de cinco cabezas de atención que provocaban bucles de repetición, y reducción del vocabulario de 32.768 a 12.735 tokens. Estas técnicas reducen el tamaño y mejoran el WER en conversación (de 87,0 a 76,4 en Siarad) sin necesidad de más cómputo de entrenamiento.

El modelo se distribuye con licencia MIT, compatible con `transformers` (probado con la versión 5.20) y orientado a utterances cortas de audio mono a 16 kHz. Su arquitectura es la de Moonshine Base, un transformer encoder-decoder optimizado para ASR, del que hereda la licencia y el diseño general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine Base) |
| Parametros totales | 53.180.192 (53,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada: utterances cortas, 16 kHz mono) |
| Tipos de cuantizacion | Pesos en fp16; carga por defecto en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | Galés (cy) e inglés (en) incrustado en habla galesa |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Moonshine Base, un transformer encoder-decoder para ASR, y se obtiene mediante fine-tuning con LoRA sobre datos galeses. La versión compacta no implica entrenamiento adicional: se construye en tres pasos sobre el modelo anterior `rebreda/moonshine-base-welsh`. Primero, el adaptador LoRA es el promedio de diez checkpoints de la ejecución de continuación (pasos 4.000 a 8.500), no un único checkpoint. Segundo, se desactivan cinco cabezas de auto-atención del decoder (cabezas 0, 1 y 3 de la capa 4; cabeza 1 de la capa 2; cabeza 1 de la capa 7, contando desde 0) cuyos pesos de salida se ponen a cero (0,18% de los pesos); estas cabezas copiaban palabras previas y competían con el token de fin de texto, provocando bucles de repetición. Tercero, se reduce la tabla de tokens de 32.768 a 12.735: se conservan los tokens usados al menos 3 veces en las transcripciones de entrenamiento, los 256 tokens de byte (para poder deletrear cualquier palabra) y las piezas necesarias para construirlos, eliminando 8,3M de parámetros.

Los datos de entrenamiento y validación provienen de los datasets `cymen-arfor/lleisiau-arfor`, `google/fleurs`, `techiaith/banc-trawsgrifiadau-bangor` y `techiaith/corpws-clllc-wlga`. La selección de tokens y la localización de las cabezas problemáticas se hicieron exclusivamente con datos de desarrollo y validación de Banc, nunca con datos de test. El modelo conserva la licencia MIT heredada de Moonshine.

## Capacidades

- Reconocimiento automático del habla en galés con salida de texto con mayúsculas y puntuación.
- Transcripción de palabras inglesas incrustadas en habla galesa (el inglés plano empeora, según el autor).
- Entrada de audio mono a 16 kHz, orientado a utterances cortas.
- Funciona con `transformers` mediante `MoonshineForConditionalGeneration` y con el pipeline `automatic-speech-recognition`.
- Decodificación con beam search (5 beams recomendados) y límite de longitud de salida de aproximadamente 25 tokens por segundo de audio más 10.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR ni modos de razonamiento.

## Casos de uso

- Transcripción de audio corto en galés: el modelo convierte utterances de 16 kHz mono en texto con puntuación, adecuado para notas de voz y dictado breve.
- Subtitulado de clips cortos en galés: con beam search de 5 y límite de longitud proporcional a la duración, se puede generar texto para vídeos de pocos segundos.
- Procesamiento de encuestas o respuestas abiertas en galés: útil para transcribir respuestas grabadas en estudios con hablantes de galés.
- Integración en pipelines de `transformers`: al funcionar con `pipeline("automatic-speech-recognition")`, se puede desplegar en servicios Python existentes sin infraestructura adicional.
- Transcripción de habla galesa con préstamos ingleses: el vocabulario conserva tokens ingleses para palabras incrustadas, útil en contextos bilingües.
- Prototipado y experimentación en ASR de bajos recursos: su tamaño de 53,2M y repositorio de 106 MB permiten iterar rápido en entornos con recursos limitados.
- Evaluación comparativa de técnicas de poda: sirve como referencia para estudiar promediado de checkpoints, desactivación de cabezas y reducción de vocabulario sin reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Dataset | Split / clips | Métrica | Valor |
|---|---|---|---|
| Common Voice Scripted Speech 27.0 Welsh | test, 5.390 clips | WER | 25,8 |
| FLEURS Welsh (cy_gb) | test, 1.020 clips | WER | 37,6 |
| Lleisiau Arfor (Welsh) | test, 1.500 clips | WER (todos los clips; frases solapadas con entrenamiento) | 20,1 |
| Lleisiau Arfor (Welsh) | test, 1.500 clips | WER (solo frases no vistas) | 33,8 |
| Siarad (conversación galesa, held out) | test, 1.500 clips | WER | 76,8 |
| Banc Trawsgrifiadau Bangor | test, 1.500 clips | WER | 32,7 |
| FLEURS English (en_us) | test, 500 clips | WER | 21,0 |

El autor indica que la desactivación de cabezas redujo el WER en Siarad de 87,0 a 76,4 (dato de la model card; la tabla declara 76,8 para el modelo final). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 53,2M de parámetros en fp16 (~106 MB de pesos) cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650, RTX 3060, etc.) e incluso en CPU para utterances cortas.
- Opciones de despliegue: `transformers` (probado con 5.20) mediante `MoonshineForConditionalGeneration` o el pipeline de ASR; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER galés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rebreda/moonshine-base-welsh-compact | 53,2M | audio corto 16 kHz mono | 25,8 (CV27), 37,6 (FLEURS) | MIT | HuggingFace |
| rebreda/moonshine-base-welsh | 61,5M | audio corto 16 kHz mono | no disponible en la información | MIT (heredada) | HuggingFace |
| moonshine-ai/moonshine-base | no disponible | audio corto 16 kHz mono | no disponible (modelo base en inglés) | MIT | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita a los resultados del modelo compacto.

## Limitaciones y advertencias

- El WER en conversación espontánea es alto (76,8 en Siarad), lo que limita su uso en diálogo natural.
- El inglés plano empeora respecto al modelo original; solo se conserva para palabras inglesas dentro de habla galesa.
- Puede seguir produciendo bucles de repetición: en Siarad, 4 de 1.500 clips seguían en bucle; se recomienda el límite de 25 tokens por segundo más 10 como red de seguridad.
- Requiere audio mono a 16 kHz y utterances cortas; no está diseñado para audio largo ni para otras frecuencias de muestreo.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero se hereda de Moonshine y conviene revisar las condiciones del modelo base.
- El modelo se creó sin entrenamiento adicional; las técnicas de poda podrían afectar a dominios no evaluados.

## Enlaces

- HuggingFace: https://huggingface.co/rebreda/moonshine-base-welsh-compact
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-base
- Modelo anterior: https://huggingface.co/rebreda/moonshine-base-welsh
- Página del proyecto: https://quickthoughts.ca/projects/welsh-asr/
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Dataset Lleisiau Arfor: https://huggingface.co/datasets/cymen-arfor/lleisiau-arfor
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Banc Trawsgrifiadau Bangor: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Dataset Corpws CLILC WLGA: https://huggingface.co/datasets/techiaith/corpws-clllc-wlga
