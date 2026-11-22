# Hebrish/Sabich

## Resumen

Sabich es un modelo de reconocimiento automático del habla (ASR) especializado en *code-switching* inglés-hebreo, es decir, en transcripciones donde el hablante alterna entre ambos idiomas dentro de la misma frase. Lo desarrolla el usuario Hebrish como un ajuste fino (fine-tune) del modelo NVIDIA `parakeet-tdt-0.6b-v2`, un transformer con decodificación TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros. El modelo está pensado para dictado y transcripción de conversaciones técnicas donde aparecen términos en inglés (vocabulario tecnológico) incrustados en discurso en hebreo.

El problema que aborda es concreto: los sistemas ASR multilingües convencionales suelen forzar un único idioma por segmento o degradan la precisión cuando el hablante cambia de lengua a media frase. Sabich incorpora adaptación al hablante (*speaker adaptation*) y un vocabulario técnico específico, con variantes para inglés irlandés, y se distribuye bajo licencia CC BY-NC 4.0 con acceso restringido en Hugging Face.

El modelo es relevante para equipos que necesitan transcribir reuniones, clases o entrevistas de desarrolladores hebreoparlantes que usan terminología inglesa, un escenario mal cubierto por los ASR genéricos. Su tamaño compacto (repo de 14,8 GB, pesos del orden de 0,6B) permite despliegue en infraestructura modesta en comparación con modelos ASR de varios miles de millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificación TDT (Token-and-Duration Transducer), basada en NVIDIA Parakeet |
| Parametros totales | 0,6 mil millones (heredados de parakeet-tdt-0.6b-v2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), hebreo (he); incluye variante de inglés irlandés y code-switching en-he |
| Licencia | CC BY-NC 4.0 (no comercial) |
| Formato de pesos | formato NeMo (`.nemo`); no se indica GGUF ni safetensors |
| Modelo base | nvidia/parakeet-tdt-0.6b-v2 |
| Libreria | NVIDIA NeMo |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 14,8 GB |

## Arquitectura y entrenamiento

Sabich parte de `nvidia/parakeet-tdt-0.6b-v2`, un modelo ASR de NVIDIA basado en arquitectura transformer con decodificación TDT. La decodificación TDT predice conjuntamente el token de salida y su duración, lo que permite emitir varios tokens por paso de decodificación y reduce la latencia frente a transductores clásicos. El ajuste fino conserva esa arquitectura y añade adaptación al hablante y al dominio técnico.

El entrenamiento se realizó mediante fine-tuning sobre el modelo base usando, según los tags del repositorio, el dataset `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`. Los detalles sobre número de tokens, composición exacta del dataset, uso de RLHF/DPO o técnicas de aumento de datos no están disponibles en la información proporcionada. La model card declara una evaluación sobre un benchmark propio de code-switching inglés-hebreo (versión v2), lo que sugiere que el autor construyó datos de evaluación específicos para el dominio.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y hebreo.
- Transcripción con *code-switching* intra-frase inglés-hebreo.
- Reconocimiento de vocabulario técnico en inglés dentro de discurso en hebreo (tag `tech-vocabulary`).
- Adaptación al hablante (*speaker adaptation*), orientada a mejorar la precisión con voces concretas.
- Variante de inglés irlandés (tag `irish-english`).
- Orientado a dictado (*dictation*).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones de ingeniería en hebreo con terminología inglesa: el modelo está entrenado para manejar cambios de idioma intra-frase, por lo que transcribe frases como instrucciones en hebreo salpicadas de nombres de API, frameworks o comandos sin forzar una traducción ni perder los términos en inglés.
- Dictado de documentación técnica por desarrolladores hebreoparlantes: la adaptación al hablante y el vocabulario técnico permiten dictar notas y especificaciones mezclando hebreo e inglés con menor tasa de error en los términos clave.
- Subtitulado de clases y charlas técnicas: útil en entornos académicos o de formación donde el ponente alterna hebreo e inglés; el modelo puede generar subtítulos con los términos técnicos preservados.
- Generación de actas y notas de entrevistas: para equipos de investigación que entrevistan a profesionales israelíes y necesitan transcripciones fieles de términos en inglés (nombres de productos, métricas, siglas).
- Transcripción de soporte técnico y atención al cliente: conversaciones donde el agente habla hebreo y cita términos de producto en inglés; el modelo reduce la corrección manual posterior.
- Pipeline de análisis de audio para investigación lingüística: permite estudiar patrones de code-switching en-he con métricas de recall de términos, gracias a la evaluación específica que acompaña al modelo.
- Dictado para accesibilidad: usuarios hebreoparlantes que dictan texto mixto en-he en herramientas de escritura asistida.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero, `verified: false`):

| Benchmark | Metrica | Resultado |
|---|---|---|
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | WER code-switching (subconjunto clean, 129 clips) | 4,96 |
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | CER code-switching (subconjunto clean, 129 clips) | 1,51 |
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | Recall de términos en hebreo (clean, 221 ocurrencias) | 66,97 |
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | Recall de términos no vistos (clean, 137 ocurrencias) | 59,85 |
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | Recall de términos vistos (clean, 84 ocurrencias) | 78,57 |
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | WER control en inglés (english_control, 25 clips) | 2,42 |
| English-Hebrew Code-Switching ASR Benchmark (v2, test) | WER técnico (tech subset, 25 clips) | 3,02 |

No se han publicado en la información disponible resultados en benchmarks estándar como LibriSpeech, Common Voice, FLEURS o MLS, ni comparaciones directas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,6B parámetros en precisión FP16, los pesos ocupan aproximadamente 1,2 GB; en FP32, unos 2,4 GB. El repositorio de 14,8 GB incluye pesos y artefactos adicionales, no solo el modelo final.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para FP16; NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El modelo cabe holgadamente en GPU de consumo.
- Despliegue: al estar empaquetado para NVIDIA NeMo, la vía natural es el runtime NeMo (`nemo_toolkit`) y su pipeline ASR. No se documentan exportaciones a GGUF, ONNX, vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación TDT del modelo base está diseñada para baja latencia, pero no se aportan cifras concretas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Code-switching | Licencia | Acceso |
|---|---|---|---|---|---|
| Sabich (Hebrish) | 0,6B | en, he | Sí (en-he) | CC BY-NC 4.0 | Restringido |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6B | en (principalmente) | No documentado | no disponible en la informacion | Público |
| Whisper large-v3 (OpenAI) | 1,55B | multilingüe (incluye he) | Parcial, sin especialización | MIT (según modelo base) | Público |
| Modelos ASR hebreos genéricos | variable | he | No documentado | variable | variable |

La comparación con Whisper large-v3 se incluye como referencia de categoría (ASR multilingüe), pero no se dispone de resultados de Sabich frente a Whisper en el mismo benchmark. La ventaja diferencial de Sabich es la especialización en code-switching en-he y vocabulario técnico; su limitación principal es la licencia no comercial y el acceso restringido.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohíbe el uso comercial. Cualquier despliegue en producto o servicio de pago requiere licencia adicional del autor.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Resultados de benchmarks declarados por el autor y marcados como no verificados; deben tratarse con cautela hasta una replicación independiente.
- Cobertura limitada a inglés y hebreo; no está pensado para otros idiomas.
- El recall de términos no vistos (59,85) es notablemente inferior al de términos vistos (78,57), lo que indica que el vocabulario técnico novedoso sigue siendo un punto débil.
- Riesgo de alucinación y de sustituciones en términos técnicos poco frecuentes, especialmente en audio con ruido o acento marcado.
- No se documentan sesgos demográficos ni de acento; la adaptación al hablante puede sobrerrepresentar las voces usadas en el ajuste fino.
- No hay información sobre cuantización, exportación a formatos ligeros ni soporte en runtimes distintos de NeMo, lo que limita su integración en stacks no NVIDIA.
- El tamaño del repositorio (14,8 GB) es grande para un modelo de 0,6B, lo que puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Sabich
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Dataset de ajuste fino: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Benchmark de code-switching en-he (referenciado en la model card): https://huggingface.co/datasets/Hebrish/English-Hebrew-Codeswitching-ASR-Benchmark
- DOI del modelo: https://doi.org/10.57967/hf/11336
- Documentación de NVIDIA NeMo: https://github.com/NVIDIA/NeMo
