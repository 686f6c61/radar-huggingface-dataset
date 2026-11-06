# Awesome-x/voxira-yoruba-phaseXI

## Resumen

Voxira Yorùbá Phase XI es un modelo de reconocimiento automático del habla (ASR) especializado en code-switching yorùbá-inglés, desarrollado por el usuario Awesome-x. Se construye sobre `facebook/wav2vec2-large-xlsr-53` mediante fine-tuning y está pensado para transcribir el habla real de nigerianos educados, que alternan yorùbá e inglés dentro de la misma frase. El modelo resuelve un problema concreto de las lenguas africanas de bajos recursos: la escasez de sistemas ASR que manejen mezcla de idiomas sin degradar el vocabulario inglés.

La particularidad de esta fase es que no introduce nuevos pesos acústicos: `model.safetensors` es idéntico byte a byte a la fase X. Todo el cambio proviene del decodificador, que pasa de un modelo de lenguaje KenLM de 5-gramas (alpha 2.0) a uno de 4-gramas podado de 4,1 MB (alpha 0.3), con un corpus de entrenamiento reequilibrado. La arquitectura subyacente es un transformer convolucional wav2vec2 con 315 millones de parámetros y una capa de salida CTC de 42 tokens.

El modelo se publica como release candidate con licencia Apache 2.0 y está orientado a experimentación e integración en pipelines de transcripción de bajo coste. Su relevancia actual radica en que demuestra que la calibración del decodificador, y no solo el tamaño del modelo acústico, determina el rendimiento en escenarios de code-switching.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder Transformer, cabeza CTC) |
| Parámetros totales | 315.485.870 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; evaluado con clips de 16 kHz) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | yorùbá (yo), inglés nigeriano (en); code-switching yo-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | facebook/wav2vec2-large-xlsr-53 |
| Vocabulario acústico | 42 tokens (sin Q, X, Z) |
| Tamaño del repositorio | 1,3 GB |
| Decodificador | KenLM 4-gramas `c50k_prune` (4,1 MB) + pyctcdecode |
| Frecuencia de muestreo evaluada | 16 kHz |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-large-xlsr-53`, un encoder wav2vec2 preentrenado multilingüe con 315 millones de parámetros. Sobre esa base se realizó un fine-tuning acústico (fase 10) con datos de `AR_Audios` y `google/fleurs`, y la fase XI reutiliza exactamente esos pesos sin reentrenamiento acústico. La cabeza de salida es CTC con un vocabulario de 42 tokens que cubre las letras `ABCDEFGHIJKLMNOPRSTUVWY` más los caracteres con diacríticos `ÀÁÈÉÌÍÒÓÙÚŃṢẸỌ`.

La innovación de esta fase está en el decodificador. El modelo de lenguaje KenLM pasa de 5-gramas con 366.000 líneas (85,6 % yorùbá, 1,2 % inglés, con más de 3.700 líneas abriendo con "E BE LIKE SAY") a un 4-gramas de 50.000 líneas equilibrado por entropía, con aperturas templadas limitadas a 400 por patrón y texto conversacional y bancario sobrerrepresentado 4x. Se aplica poda de n-gramas singletons (`--prune 0 1 1 2`) y se reduce el peso del LM de alpha 2.0 a alpha 0.3, de modo que la señal acústica domina la decodificación. El resultado es un LM de 4,1 MB frente a los 92 MB del corpus completo sin podar.

## Capacidades

- Transcripción de voz a texto en yorùbá e inglés nigeriano, incluyendo code-switching intra-frase.
- Manejo de vocabulario bancario y conversacional (transferencias, saldos, productos financieros) gracias al reequilibrado del corpus del LM.
- Decodificación CTC con beam search y LM mediante `pyctcdecode` y KenLM.
- Normalización fonética opcional a través de `phonetic_map.json` para parchear palabras inglesas con letras ausentes del vocabulario (ZERO, EXAM, TAX, ZENITH).
- Salida en mayúsculas sin puntuación ni casing.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta visión, audio generativo ni modo thinking.
- Capacidad multilingüe limitada a los dos idiomas declarados; el pidgin no es objetivo de esta release.

## Casos de uso

- Transcripción de conversaciones bancarias y de atención al cliente: el LM reequilibrado con texto bancario y conversacional mejora la cobertura de términos como "transfer", "account balance" o "product", y permite procesar diálogos donde el cliente alterna yorùbá e inglés en la misma frase.
- Subtitulado y documentación de reuniones en Nigeria: el modelo transcribe audio de 16 kHz de hablantes educados que mezclan idiomas, adecuado para generar actas o subtítulos revisables por un humano.
- Investigación lingüística sobre code-switching: permite obtener transcripciones alineadas de corpus yo-en para estudios de alternancia de código, con la ventaja de que el decodificador es configurable y auditable.
- Prototipado de asistentes de voz para servicios financieros: al ser un modelo de 315 M de parámetros y 1,3 GB, puede desplegarse en infraestructura modesta para validar flujos de voz antes de invertir en modelos mayores.
- Generación de datasets etiquetados para ASR de bajos recursos: las transcripciones sirven como pseudo-etiquetas para ampliar corpus de yorùbá e inglés nigeriano, con revisión humana posterior.
- Integración en pipelines de accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en contextos donde el habla mezcla yorùbá e inglés.
- Evaluación comparativa de decodificadores: el repositorio incluye `deploy_phaseXI.py` y permite reproducir el bake-off entre greedy, fase X y fase XI sobre los mismos logits acústicos, útil como banco de pruebas de técnicas de decodificación CTC.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Todas las métricas están normalizadas en mayúsculas, NFC y sin puntuación.

| Variante | LM | Tamaño LM | WER | WER sin tonos | WER plano | CER |
|---|---|---:|---:|---:|---:|---:|
| Fase X desplegada | 5-gramas, alpha=2.0, beta=1.5 | — | 8,0 % | 8,0 % | 7,9 % | 1,8 % |
| Greedy (sin LM) | ninguno | 0 MB | 4,5 % | 4,3 % | 4,0 % | 1,1 % |
| Corpus completo sin podar | 366k líneas, alpha=0.3, beta=0.5 | 92 MB | 4,5 % | 4,3 % | 4,0 % | 1,0 % |
| c100k podado | 100k líneas, alpha=0.3, beta=1.5 | 7 MB | 5,0 % | 4,8 % | 4,5 % | 1,2 % |
| **Fase XI `c50k_prune`** | **50k equilibrado + podado, alpha=0.3, beta=0.5** | **4,1 MB** | 4,5 % | 4,3 % | 4,0 % | 1,1 % |

El conjunto de evaluación es un dev set de 100 clips (10,5 minutos, 1.268 palabras de referencia) extraído de `AR_Audios`, sobre el que se ajustó el decodificador, por lo que las cifras están sesgadas de forma optimista. El autor advierte que la decodificación greedy sin LM ya alcanza 4,5 % de WER, por lo que el LM de la fase XI no reduce el WER en este conjunto; lo que demuestra la comparación es que la ponderación excesiva del LM en la fase X (8,0 %) perjudicaba. La verificación en un conjunto held-out independiente está pendiente. En la tarjeta de la fase X se reportaron 12,33 % (fase 10) y 7,09 % (fase X) sobre 55 clips held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 para los pesos; con overhead de activaciones y decodificador, entre 2 y 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y baja con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` con pipeline de `automatic-speech-recognition`, `pyctcdecode` + KenLM para beam search, y el script `deploy_phaseXI.py` incluido en el repositorio. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (son para modelos generativos, no aplicables directamente a wav2vec2 CTC).
- Latencia y throughput: no disponibles en la información proporcionada. El decodificador opera sobre clips de 16 kHz; el bake-off procesó 100 clips en 10,5 minutos de audio, pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxira Yorùbá Phase XI | 315 M | yo, en (code-switching) | audio 16 kHz | Apache 2.0 | Hugging Face, 0 descargas |
| facebook/wav2vec2-large-xlsr-53 | 317 M | 53 idiomas | audio 16 kHz | Apache 2.0 | Hugging Face, ampliamente usado |
| Voxira Yorùbá Phase X | 315 M | yo, en | audio 16 kHz | Apache 2.0 | Hugging Face (fase anterior) |

La comparación con modelos ASR comerciales o de mayor tamaño (Whisper large-v3, etc.) no está disponible en la información proporcionada. El modelo base XLSR-53 es multilingüe pero no está especializado en code-switching yo-en, por lo que el fine-tuning de Voxira aporta la adaptación al dominio. La fase X sirve como referencia directa de la mejora del decodificador (8,0 % a 4,5 % de WER en el mismo dev set).

## Limitaciones y advertencias

- **Vocabulario incompleto**: la capa acústica de 42 tokens no incluye las letras Q, X ni Z. Alrededor del 1,3 % de las palabras inglesas de referencia contienen alguna, lo que fija un suelo de error. `phonetic_map.json` parchea solo algunos casos frecuentes.
- **Conjuntos de evaluación pequeños**: decenas de clips de un único corpus (`AR_Audios`), con intervalos de confianza amplios. Además, parte de los clips del dev set pudieron verse durante el fine-tuning acústico, por lo que el 4,5 % no debe interpretarse como estimación de generalización.
- **Sesgo de selección del decodificador**: la configuración se eligió sobre el mismo conjunto en el que se evalúa, lo que infla los resultados.
- **Sin verificación independiente**: la release es candidata y la validación held-out está pendiente.
- **Dominio restringido**: evaluado solo con audio de 16 kHz; no se ha evaluado con telefonía a 8 kHz, ruido de fondo intenso, solapamiento de hablantes ni habla espontánea frente a habla leída. El pidgin no es objetivo.
- **Sin puntuación ni casing**: la salida es texto en mayúsculas sin puntuación, lo que limita su uso directo en publicación.
- **No es un modelo de verificación de hablante**: no debe usarse una transcripción como prueba de identidad (KYC).
- **Riesgo de alucinación**: como todo ASR, puede producir palabras plausibles que no se dijeron, especialmente en segmentos ruidosos o con vocabulario fuera del LM.
- **Revisión humana recomendada** en acciones legales, médicas y financieras desencadenadas por la transcripción.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Awesome-x/voxira-yoruba-phaseXI
- Demo Space: https://huggingface.co/spaces/Awesome-x/voxira-demo
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Dataset de evaluación: https://huggingface.co/datasets/google/fleurs
- Repositorio del autor: https://huggingface.co/Awesome-x
- Paper de wav2vec 2.0 (referencia de arquitectura): no disponible en la búsqueda
- Documentación de pyctcdecode: no disponible en la búsqueda
- Documentación de KenLM: no disponible en la búsqueda
