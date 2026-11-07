# lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-MLP-SM120

## Resumen

Voxtral Mini 4B Realtime 2602 NVFP4 MLP SM120 es una variante cuantizada de forma parcial del modelo de reconocimiento automatico del habla en tiempo real Voxtral Mini 4B Realtime 2602 de Mistral AI. El autor de la cuantizacion, Dr. Lucas Spohn (Idana AG, Friburgo), sustituye unicamente las 78 proyecciones lineales de las MLP del decodificador (gate, up y down en los 26 bloques) por pesos almacenados en NVFP4, manteniendo en mayor precision el codificador de audio, el proyector, la atencion, las normalizaciones, los embeddings, la cabeza de salida y la ruta de retardo. El objetivo es reducir el coste de memoria e incrementar el rendimiento de decodificacion en GPUs Blackwell consumer, en concreto una RTX 5070 Ti (SM120).

El repositorio no contiene un checkpoint autonomo: es un delta empaquetado de aproximadamente 1,29 GiB que requiere el modelo base original en BF16 y un cargador personalizado. La calibracion se realizo con 64 grabaciones publicas de FLEURS, sin etiquetas de transcripcion en el objetivo, sin gradientes y sin adaptadores de fine-tune. Se trata, por tanto, de cuantizacion post-entrenamiento dependiente de datos, no de un modelo nuevo ni de un fine-tune clinico.

La relevancia de esta ficha es doble: por un lado, documenta un experimento reproducible de cuantizacion NVFP4 sobre un modelo de ASR en streaming con licencia Apache 2.0; por otro, expone de forma transparente las regresiones medidas en WER y el incumplimiento del objetivo de velocidad propuesto (1,30x), lo que resulta util para quien evalue desplegar ASR en tiempo real sobre hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR en streaming (Voxtral Realtime); cuantizacion parcial NVFP4 en las MLP del decodificador |
| Parametros totales | 4B (modelo base Voxtral Mini 4B Realtime 2602) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16 GEMV en decode, W4A4 GEMM en prefill) en 78 lineales MLP; resto de componentes en BF16 |
| Idiomas soportados | aleman (de) e ingles (en) en la evaluacion de esta variante; el modelo base soporta 13 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetado (dos valores FP4 por byte y escalas de bloque FP8); delta de ~1,29 GiB, requiere el base BF16 |
| Tamano del repo | 1,4 GB |
| Libreria | PyTorch (implementacion nativa de Transformers) |
| Hardware objetivo | SM120 (Blackwell consumer, p. ej. RTX 5070 Ti) |
| Inferencia standalone | No (requiere el base original y cargador personalizado) |

## Arquitectura y entrenamiento

El modelo base es Voxtral Mini 4B Realtime 2602, un sistema de transcripcion de voz multilingue disenado para operar en streaming con un retardo configurado inferior a 500 ms. Esta variante no reentrena el modelo: aplica cuantizacion post-entrenamiento dependiente de datos sobre las MLP del decodificador. La calibracion emplea 64 grabaciones publicas de FLEURS, combinando los segundos momentos de entrada de la grabacion completa y del onset con una regularizacion isotropica del 25 %, y selecciona escalas de bloque y codigos FP4 mediante una rejilla fija de 16 escalas con tres refinamientos por minimos cuadrados.

El despliegue usa dos rutas de kernel distintas segun la fase: en decodificacion con como maximo dos filas se emplea el kernel GEMV W4A16 del Hub con activaciones en BF16 (sin tensor cores W4A4), mientras que en prefill se usa el GEMM W4A4 nativo b12x de FlashInfer con cuantizacion dinamica de activaciones. Ambas ramas medidas comparten la misma optimizacion de CUDA Graph pura para el FFN, SDPA, decodificacion greedy, cuatro hilos de CPU y un retardo configurado de seis tokens / 480 ms. La carga del modelo es primero en CPU y despues todos los componentes se ejecutan en CUDA, sin offload de pesos durante la inferencia.

## Capacidades

- Reconocimiento automatico del habla en streaming con retardo configurado inferior a 500 ms (480 ms en la configuracion medida).
- Transcripcion multilingue: el modelo base cubre 13 idiomas; esta variante se ha evaluado en aleman e ingles.
- Procesamiento de audio en tiempo real con decodificacion greedy y ventana de retardo de seis tokens.
- Ejecucion nativa en PyTorch/Transformers, sin necesidad de vLLM ni de exportaciones ModelOpt.
- Cuantizacion selectiva que preserva en BF16 el codificador de audio, el proyector, la atencion y la cabeza de salida, manteniendo la calidad acustica del modelo original.
- Soporte de rutas de kernel diferenciadas para decode (GEMV W4A16) y prefill (GEMM W4A4), con cuantizacion dinamica de activaciones en esta ultima.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Subtitulado en directo de reuniones y videollamadas: el retardo configurado de 480 ms y el procesamiento en streaming permiten generar subtitulos casi simultaneos en aleman e ingles sobre una GPU consumer.
- Asistentes de voz locales: al reducir el pico de memoria de 9,52 GiB (BF16) a 5,75 GiB (NVFP4), el modelo cabe en una RTX 5070 Ti y habilita asistentes por voz que no envian audio a la nube.
- Transcripcion de notas de voz y podcasts en lotes: la ruta de prefill con GEMM W4A4 de FlashInfer acelera el procesado de grabaciones largas manteniendo el WER en torno al 5-6 % en FLEURS.
- Investigacion en cuantizacion NVFP4: el repositorio incluye scripts de perfilado de kernels, evidencia de kernels desplegados y datos de busqueda de variantes, lo que lo convierte en una referencia reproducible para estudiar cuantizacion parcial en ASR.
- Evaluacion de hardware Blackwell para ASR: sirve como banco de pruebas para medir el rendimiento real de SM120 en cargas de decodificacion W4A16 y prefill W4A4.
- Despliegue en entornos con memoria limitada: al requerir solo 5,75 GiB de memoria asignada por Torch en la comparacion, permite ejecutar ASR junto a otros procesos en una unica GPU consumer.
- Prototipado de pipelines de transcripcion bilingue aleman-ingles en investigacion linguistica, con la advertencia de que la variante no ha superado la puerta de no inferioridad estadistica en aleman.

## Benchmarks y rendimiento

Comparacion principal sobre 520 grabaciones (11.174 palabras de referencia, 1,56 horas de audio) del split de entrenamiento de FLEURS, reservado localmente:

| Fuente | Clips | Palabras | WER BF16 | WER NVFP4 | Delta (pp) | Intervalo pareado 95 % (pp) |
|---|---:|---:|---:|---:|---:|---:|
| fleurs_de_de | 400 | 8595 | 4,863 % | 4,945 % | +0,081 | [-0,023, +0,187] |
| fleurs_en_us | 120 | 2579 | 5,933 % | 6,126 % | +0,194 | [-0,121, +0,587] |

Resultados adicionales:

| Metrica | BF16 | NVFP4 | Ratio / delta |
|---|---:|---:|---:|
| Tasa de procesado (6 pares contrabalanceados, 24 clips) | 1,000x | 1,238x | +23,8 % audio/s; -19,2 % tiempo |
| Tasa de procesado (pasada unica suplementaria, 520 clips) | 1,000x | 1,223x | no contrabalanceada |
| p95 de salida final tras fin de audio (24 clips secuenciales) | 398,8 ms | 354,9 ms | -43,9 ms |
| Memoria pico asignada por Torch | 9,52 GiB | 5,75 GiB | -3,77 GiB |

Notas de seleccion: el candidato RTN original fue rechazado tras observar una regresion en WER aleman de 5,86 % a 6,76 % en una comparacion de 857 clips, incluyendo dos salidas en cirilico. El candidato seleccionado, ponderado por activaciones, obtiene un WER piloto en aleman de 6,18 % frente a 5,86 % en BF16 (+0,324 pp), por encima del prefiltro de +0,3 pp, por lo que la puerta original de desarrollo en aleman sigue sin superarse. El objetivo de tasa de procesado de 1,30x no se alcanzo.

## Requisitos de hardware

- VRAM estimada: 5,75 GiB de memoria pico asignada por Torch en NVFP4 frente a 9,52 GiB en BF16 (memoria asignada, excluye otros procesos; la memoria reservada y total del dispositivo difieren).
- GPU objetivo: SM120, esto es, arquitectura Blackwell consumer; el experimento se realizo en una RTX 5070 Ti.
- Cabe en GPU consumer: si, en RTX 5070 Ti y previsiblemente en otras GPU Blackwell con al menos 8 GiB utiles; no se documenta compatibilidad con generaciones anteriores (Ampere, Ada) porque los kernels W4A4 b12x de FlashInfer estan orientados a SM120.
- Opciones de despliegue: implementacion nativa de Transformers con cargador personalizado y kernels del Hub/FlashInfer; no se proporciona exportacion para vLLM ni ModelOpt. Existe una variante GGUF del modelo base publicada por terceros (tryambientai) para otros entornos.
- Latencia: p95 de salida final tras fin de audio de 354,9 ms en NVFP4 y 398,8 ms en BF16 sobre 24 clips secuenciales con retardo configurado de 480 ms.
- Throughput: 1,238x la tasa de procesado de BF16 en la medicion contrabalanceada principal; 1,223x en la pasada suplementaria.
- Configuracion de referencia: CUDA Graph para el FFN, SDPA, decodificacion greedy y cuatro hilos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-MLP-SM120 | 4B | no disponible | de, en (evaluados); 13 en el base | NVFP4 parcial (MLP) | Apache 2.0 | Delta empaquetado + base BF16; requiere SM120 |
| mistralai/Voxtral-Mini-4B-Realtime-2602 (BF16) | 4B | no disponible | 13 | BF16 | Apache 2.0 | Checkpoint completo en Hugging Face |
| tryambientai/Voxtral-Mini-4B-Realtime-2602-gguf | 4B | no disponible | 13 | GGUF (cuantizacion estandar) | Apache 2.0 (heredada) | GGUF listo para llama.cpp y similares |

El modelo base de Mistral AI declara precision comparable a sistemas offline con retardo inferior a 500 ms y supera a las lineas base open source en diversas tareas. La variante NVFP4 de lspohn no mejora el WER, sino que reduce memoria y aumenta la tasa de procesado en hardware Blackwell a costa de una regresion pequena pero medible en aleman. La variante GGUF de terceros ofrece portabilidad a ecosistemas de cuantizacion estandar, mientras que esta variante NVFP4 esta atada a SM120 y a un cargador propio.

## Limitaciones y advertencias

- Regresion de WER en aleman: +0,324 pp en el piloto (6,18 % frente a 5,86 %), por encima del prefiltro de +0,3 pp; la puerta original de desarrollo en aleman no se supera.
- Los intervalos pareados del 95 % en la comparacion principal incluyen valores por encima del margen de +0,3 pp en al menos un caso, por lo que no se establece no inferioridad estadistica.
- El candidato RTN inicial genero dos salidas en cirilico en aleman, lo que evidencia riesgo de alucinacion o deriva de idioma en cuantizaciones agresivas.
- Los datos de comparacion provienen del split de entrenamiento de FLEURS, no de un split de test oficial; no se garantiza independencia respecto al preentrenamiento de Mistral y no se dispone de identidades de hablante.
- No es un fine-tune medico ni un modelo nuevo; no debe usarse como referencia clinica.
- La evaluacion de esta variante solo cubre aleman e ingles, aunque el base soporte 13 idiomas.
- Requiere el checkpoint BF16 original y un cargador personalizado; no es un AutoModel autonomo ni tiene exportacion a vLLM o ModelOpt.
- Dependencia de hardware SM120: los kernels W4A4 de FlashInfer y la ruta GEMV estan fijados a esa arquitectura, lo que limita la portabilidad.
- El objetivo de tasa de procesado de 1,30x no se alcanzo (1,238x medido).
- La licencia Apache 2.0 permite uso comercial, pero el caracter experimental y las regresiones documentadas desaconsejan su uso en produccion sin validacion propia.
- Las cifras de memoria son asignadas por Torch y excluyen otros procesos; el consumo total del dispositivo puede ser mayor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-MLP-SM120
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Variante GGUF de terceros: https://huggingface.co/tryambientai/Voxtral-Mini-4B-Realtime-2602-gguf
- Perfil del autor: https://huggingface.co/lspohn
- Documentacion del repositorio: KNOWN-ISSUES.md, PROTOCOL-AMENDMENT.md, EVALUATION.md, development-search.json, kernel-evidence.json (incluidos en el repositorio)
- Paper de referencia citado en los tags: arXiv:2205.12446
