# PraxySante/Praxy-LFM3-FR-Medical-Live

## Resumen

Praxy LFM3 FR Medical Live es un modelo de reconocimiento automático del habla (ASR) especializado en dictado médico en francés, diseñado para operar en streaming por bloques de 960 ms. Lo desarrolla PraxySante como primer eslabón de una cascada de dos etapas: este modelo genera un borrador en tiempo real y un segundo modelo (Praxy-LFM3-FR-Medical-Delib) lo revisa y corrige. Está construido sobre el modelo base LFM3 audio de Liquid AI, adaptado mediante alineación sobre un corpus de dictado médico francés, destilación desde un profesor de 2 mil millones de parámetros y poda del backbone a 21 capas.

El modelo tiene 1.785 millones de parámetros en el backbone más un tokenizador de audio de 74 millones, con un vocabulario de 128 000 tokens y una dimensión oculta de 2048. Su salida es texto plano en minúsculas, sin garantía de puntuación ni de acentos, orientada a alimentar la segunda pasada de la cascada. La latencia medida es de 85-115 ms p95 por bloque de 960 ms en H100, con 8-11 flujos simultáneos por GPU.

La relevancia de este modelo radica en su especialización vertical: en el conjunto de validación de dictado (`val_drugs_std`) alcanza un WER de 6,47 frente al 7,41 de la referencia NeMo V6 + T5Gemma2, aun siendo un modelo de menor tamaño. En registro general, sin embargo, queda por detrás (8,95 frente a 6,76), lo que define con claridad su nicho de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 audio (Liquid AI), backbone transformer podado a 21 capas + tokenizador de audio de 74 M |
| Parámetros totales | 1.785.591.040 (backbone + tokenizador de audio) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32, 6,7 GB) |
| Idiomas soportados | francés (fr) |
| Licencia | lfm-open-license (derivada de LFM3, Liquid AI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del LFM3 audio de Liquid AI, un modelo multimodal con capacidad de entrada y salida de audio, y ha sido adaptado por PraxySante en tres fases: alineación sobre un corpus de dictado médico francés, destilación desde un profesor de 2 mil millones de parámetros inyectado con conocimiento del dominio médico, y poda del backbone hasta 21 capas. El resultado conserva el tokenizador de audio de 74 millones de parámetros y opera con un vocabulario de 128 000 tokens y una dimensión oculta de 2048. La inferencia se realiza con `trust_remote_code=True` mediante las clases `AutoModelForMultimodalLM` y `AutoProcessor` de transformers, con soporte de los flags `suppress_mixed` y `suppress_audio_out` en la generación.

El entrenamiento está orientado a streaming: el modelo consume bloques de 960 ms (12 tokens) y produce texto incremental. El segundo modelo de la cascada (`-Delib`) se entrena específicamente sobre los borradores generados por este modelo, lo que cierra el ciclo de corrección. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en francés sobre audio de 16 kHz.
- Operación en streaming por bloques de 960 ms (configurable a 480 ms, con mejor WER en dictado pero peor en registro general).
- Especialización en dictado médico: fármacos, terminología clínica y cifras en contexto sanitario.
- Generación de texto plano en minúsculas como borrador para una segunda pasada de deliberación.
- Integración con el ecosistema transformers mediante `AutoModelForMultimodalLM` y `AutoProcessor`.
- Soporte de prompt de sistema para alternar entre modo offline (`Perform ASR in French.`) y modo streaming (`Perform live ASR in French.`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de salida en la información disponible.

## Casos de uso

- Dictado médico en consulta: el modelo transcribe en tiempo real lo que el facultativo dicta durante la exploración, con latencia p95 de 85-115 ms por bloque, lo que permite visualización casi instantánea del texto en pantalla.
- Generación de borradores para informes clínicos: la salida en minúsculas y sin puntuación fiable se pasa al modelo `-Delib` de la cascada para obtener un texto final con WER de 6,16 en dictado.
- Transcripción de notas de voz de profesionales sanitarios: el modelo procesa audio de 16 kHz y está ajustado al registro y vocabulario médico, lo que reduce errores en nombres de fármacos y dosificaciones frente a ASR genéricos.
- Telemedicina y consulta remota: con 8-11 flujos concurrentes por H100, un servicio centralizado puede atender varias consultas simultáneas manteniendo la latencia por debajo de 120 ms.
- Documentación clínica por lotes: en modo offline, un único bloque sobre el corpus interno `test_fr_5000` arroja un WER del 5,64 %, adecuado para transcribir grabaciones completas de sesiones clínicas.
- Sistemas de historia clínica electrónica: la salida estructurada en minúsculas facilita el postprocesado con reglas léxicas y un guardarraíl de términos médicos antes de insertar el texto en el registro del paciente.
- Investigación en ASR médico en francés: el modelo sirve como línea base reproducible para comparar arquitecturas de streaming en dominios especializados, con métricas publicadas sobre conjuntos de validación concretos.

## Benchmarks y rendimiento

Resultados de WER `lower_punct` sobre los 500 enunciados exactos de la cascada V6 + T5Gemma2, emparejados uno a uno:

| Brazo | `val_drugs_std` (dictado) | `val_general` |
|---|---|---|
| NeMo V6 + T5Gemma2 (referencia) | 7,41 | 6,76 |
| Praxy LFM3 FR Medical Live, bloque 960 ms | 6,47 | 8,95 |
| Praxy LFM3 FR Medical Live, bloque 480 ms | 6,39 | 10,41 |

Resultados adicionales:

| Escenario | WER |
|---|---|
| Offline, bloque único, corpus interno `test_fr_5000` (6,64 h) | 5,64 % |
| Cascada con segunda pasada, dictado | 6,16 |
| Cascada con segunda pasada, general | 8,63 |
| Cascada con segunda pasada y guardarraíl, dictado | 6,30 |
| Cascada con segunda pasada y guardarraíl, general | 8,33 |

Latencia: 85-115 ms p95 por bloque de 960 ms en H100, con 8-11 flujos concurrentes por GPU.

## Requisitos de hardware

- Pesos publicados en fp32: 6,7 GB, lo que requiere al menos 7 GB de VRAM solo para los pesos.
- En bfloat16 (dtype recomendado en el ejemplo de uso) el footprint de pesos se reduce aproximadamente a la mitad, en torno a 3,5-4 GB, más el overhead de activaciones y caché.
- GPU recomendadas: H100 para el escenario medido (8-11 flujos concurrentes); A100 como alternativa razonable para menos concurrencia.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el modelo en bfloat16 para un único flujo; una RTX 4080 (16 GB) también debería ser suficiente en bfloat16 para un flujo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (opción documentada por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Throughput estimado: 8-11 flujos simultáneos por H100 con bloques de 960 ms y latencia p95 de 85-115 ms por bloque.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER dictado (`val_drugs_std`) | WER general (`val_general`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Praxy LFM3 FR Medical Live | 1,79 mM | no disponible | 6,47 (960 ms) | 8,95 (960 ms) | lfm-open-license | HuggingFace |
| NeMo V6 + T5Gemma2 (cascada de referencia) | no disponible | no disponible | 7,41 | 6,76 | no disponible | referencia rejugada por el autor |
| Praxy LFM3 FR Medical Delib (segunda pasada) | no disponible | no disponible | 6,16 (cascada) | 8,63 (cascada) | lfm-open-license | HuggingFace |

No se dispone de datos de benchmarks de otros modelos ASR franceses comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior en registro general: 8,95 frente a 6,76 de la referencia, lo que desaconseja su uso como ASR genérico.
- En habla espontánea con ruido el modelo está por detrás de la cascada de referencia; la segunda pasada aporta 0,5 puntos adicionales en ese escenario.
- Salida sin puntuación ni capitalización fiables, y acentos no garantizados: requiere postprocesado para cualquier uso en producción que exija texto presentable.
- Los nombres propios poco frecuentes, las dosificaciones y las cifras son las principales fuentes de error; el autor recomienda un guardarraíl léxico en producción.
- El bloque de 480 ms mejora el dictado (6,39) pero cuesta 1,5 puntos en registro general (10,41), por lo que la elección del tamaño de bloque debe alinearse con el caso de uso.
- Licencia `lfm-open-license` derivada de LFM3 de Liquid AI: es necesario revisar los términos de la licencia del modelo base para uso comercial.
- El modelo está entrenado exclusivamente en francés; no se documenta soporte de otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PraxySante/Praxy-LFM3-FR-Medical-Live
- Modelo de segunda pasada de la cascada: https://huggingface.co/PraxySante/Praxy-LFM3-FR-Medical-Delib
- Modelo base LFM3 audio (Liquid AI): no disponible en la información proporcionada
- Script de streaming (`scripts/streaming_infer.py`, repositorio interno `lfm3_fr_live`): no disponible públicamente, solicitable a PraxySante
- Paper o blog técnico: no disponible en la información proporcionada
