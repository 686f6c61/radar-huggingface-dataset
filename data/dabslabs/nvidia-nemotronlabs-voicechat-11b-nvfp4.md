# dabsLabs/NVIDIA-NemotronLabs-VoiceChat-11B-NVFP4

## Resumen

NVIDIA-NemotronLabs-VoiceChat-11B-NVFP4 es una versión cuantizada del modelo de voz full-duplex de NVIDIA, publicado por el usuario dabsLabs. Se trata de un modelo audio-a-audio de extremo a extremo que unifica comprensión y generación de habla en streaming en una única red neuronal, pensado para agentes de voz conversacionales en tiempo real con capacidad de barge-in (interrupción) y solapamiento de turnos. El artefacto original es un checkpoint de 11B parámetros en FP32 que ocupa 44,4 GB; esta build lo comprime a 12,8 GB mediante una mezcla de cuantización NVFP4 y FP8, lo que permite servirlo en una sola GPU de clase 80 GB en lugar de requerir un host de dos GPUs.

La compresión no es uniforme: las proyecciones de atención (q/k/v/o) y las lineales MLP `up/down` del backbone se almacenan en NVFP4 W4A16 (bloques de 16 pesos con escala propia, sin cuantización de activaciones), mientras que las proyecciones de entrada y salida de las capas Mamba (state-space) se guardan en FP8 W8A8 con escalas estáticas calibradas por tensor. Todo lo crítico para la calidad —encoder de habla, decoder TTS y codec, embeddings, norms, convoluciones y cabeza RNN-T— permanece en BF16. En total se cuantizan 120 grupos de capas que cubren 6,08 B de parámetros, mientras que 5,00 B se dejan intactos.

El modelo es relevante porque demuestra que es posible cuantizar agresivamente un sistema de voz full-duplex sin degradar la funcionalidad operativa: las puertas de calidad de Q&A hablado (VoiceBench) y tool-calling hablado (BFCL-v3) se completan al 100% sin fallos, con similitud mediana de respuesta de 0,861 y 0,853 respectivamente frente a las referencias. Está pensado para servirse con el runtime vllm-omni y su licencia es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + Mamba (state-space) con encoder de habla FastConformer, decoder TTS y codec; full-duplex audio-to-audio |
| Parametros totales | 7.609.169.408 (según safetensors); el modelo base se denomina comercialmente 11B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (grupo 16, sin activaciones) en atención y MLP; FP8 W8A8 estático en proyecciones Mamba; BF16 en encoder, decoder, codec, embeddings, norms y convoluciones |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (1.680 tensores BF16, 120 F8_E4M3, 66 U8 empaquetados, 6 I64; cero tensores FP32) |

## Arquitectura y entrenamiento

El modelo base es una red unificada full-duplex que combina un backbone denso con capas de atención transformer y capas Mamba (state-space model) para el procesamiento secuencial eficiente, más un encoder de habla FastConformer para la percepción, un decoder TTS con codec para la generación de voz y una cabeza RNN-T. La variante cuantizada conserva esta topología íntegra y solo modifica el almacenamiento de pesos: 66 grupos de capas en NVFP4 (2,10 B parámetros) y 54 grupos en FP8 (3,98 B parámetros), con 5,00 B parámetros en BF16 sin tocar.

La cuantización se realizó con NVIDIA ModelOpt 0.48.0rc1.dev21 (build que incluye el PR #2508, necesario para que vLLM resuelva los nombres de módulo). La calibración empleó entre 512 y 1.024 muestras dúplex sintetizadas —turnos hablados del usuario más las respuestas habladas del propio modelo FP32— con variedad de hablantes, registro, longitud, intenciones de tool-call y patrones de barge-in/pausa. Se rechazaron explícitamente prompts solo de texto para la calibración y se excluyeron del conjunto de calibración los clips puntuados en las pruebas (notablemente los de interrupción), evitando que la batería de evaluación midiera sus propios datos de entrenamiento. El pipeline requirió adaptaciones respecto a los scripts de referencia de NeMo Speech (export de decoder denso, remapeo de objetivos del encoder FastConformer y calibración del encoder en forward plano), y la suite unitaria adaptada pasó 27/27.

## Capacidades

- Comprensión y generación de habla de extremo a extremo en una sola red, con pipeline audio-to-audio.
- Operación full-duplex en tiempo real: manejo de barge-in, interrupciones y solapamiento de turnos.
- Q&A hablado con seguimiento de instrucciones y comportamiento de seguridad (evaluado con VoiceBench).
- Tool calling / function calling en modalidad hablada (evaluado con BFCL-v3).
- Conversación multi-turno con contexto de audio en streaming.
- Salida de voz sintetizada mediante decoder TTS y codec integrados.
- Capacidad de razonamiento multi-paso orientada a agentes de voz (intenciones de tool-call presentes en la calibración).
- Soporte monolingüe: únicamente inglés.

## Casos de uso

- Atención al cliente por voz: el modelo gestiona conversaciones habladas multi-turno en streaming y permite que el usuario interrumpa al agente, gracias a su naturaleza full-duplex; adecuado para centralitas y asistentes telefónicos.
- Agentes de voz con acciones: al soportar tool calling hablado (validado en BFCL-v3), puede ejecutar reservas, consultas de estado o gestión de pedidos a partir de instrucciones dictadas.
- Asistentes embebidos en dispositivos con acelerador de clase servidor: su tamaño comprimido de 12,8 GB permite desplegarlo en una única GPU de 80 GB, simplificando la infraestructura frente al checkpoint FP32 de 44,4 GB.
- Pruebas de concepto y demos de voz en tiempo real: el runtime vllm-omni carga el artefacto y despacha las proyecciones Mamba FP8 por la ruta `modelopt_mixed`, lo que facilita montar un endpoint de voz sin tuning adicional.
- Evaluación de pipelines de cuantización: sirve como referencia reproducible para medir el impacto de NVFP4/FP8 en tareas de habla, con checksums SHA256 y aserciones de export documentadas.
- Investigación en interacción full-duplex: útil para estudiar barge-in, pausas y solapamiento de turnos en condiciones controladas, aunque la puerta Full-Duplex-Bench no se ejecutó en esta build.

## Benchmarks y rendimiento

| Puerta | FP32 (original) | NVFP4 (este repo) | Criterio | Resultado |
|---|---|---|---|---|
| VoiceBench (Q&A hablado + seguridad + seguimiento de instrucciones) | 2.272/2.272, cero fallos | 2.272/2.272, cero fallos; similitud mediana 0,861 | 100% de clips pasan | PASS |
| BFCL-v3 (tool-calling hablado) | 1.240/1.240, 100% ok | 1.240/1.240, 100% ok; similitud mediana 0,853, 40% idénticos byte a byte | ≥ 54%, cero errores de sintaxis nuevos | PASS |
| Coherencia (juez pairwise vs FP32) | — | win-rate 0,53; recall de paráfrasis 100% en ambos; recall de coincidencia exacta 12% vs 4% | win-rate ≥ 0,45; divergencia de recall ≤ 2 pp | PASS en win-rate, flag en divergencia |
| Full-Duplex-Bench (tiempo real) | — | No ejecutado | Umbrales por dimensión | NO EJECUTADO |

Además, la verificación de servicio reporta 5.992 clips servidos en las ejecuciones de las puertas con cero muertes del motor, sobre una NVIDIA H200 con CUDA 13.2 y vllm-omni 0.33.0rc1.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 12,8 GB en disco; se sirve con margen en una GPU de clase 80 GB (H100/H200/A100 80 GB), frente a las dos GPUs que exige el checkpoint FP32 de 44,4 GB.
- GPU recomendadas: NVIDIA H200 (verificado con CUDA 13.2), H100 80 GB, A100 80 GB. No se documenta compatibilidad con GPUs consumer.
- GPU consumer: no se indica que quepa en tarjetas consumer; el runtime requerido (vllm-omni) y el formato NVFP4 apuntan a hardware de centro de datos.
- Opciones de despliegue: vllm-omni 0.33.0rc1 (runtime verificado); el formato NVFP4/FP8 con `quant_method: modelopt` y `quant_algo: MIXED_PRECISION` se declara en `config.json` para que el motor lo lea al arrancar. No se documentan otras rutas (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible; solo se reporta que se sirvieron 5.992 clips en las puertas de evaluación sin fallos del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NVIDIA-NemotronLabs-VoiceChat-11B-NVFP4 (este) | 7,61 B (safetensors) | No disponible | Sí | OpenMDW 1.1 | safetensors NVFP4/FP8 | Comprimido a 12,8 GB; servido con vllm-omni |
| nvidia/NVIDIA-NemotronLabs-VoiceChat-11B (FP32) | 11 B (nominal) | No disponible | Sí | OpenMDW 1.1 | safetensors FP32 (44,4 GB) | Requiere host de 2 GPUs; referencia de calidad |
| Variante FP8-encoder para NIM | No disponible | No disponible | Sí | OpenMDW 1.1 | No disponible | Planificada y diferida según la model card |

No se dispone de datos de benchmarks de modelos de voz full-duplex alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La puerta Full-Duplex-Bench no se ejecutó, por lo que el comportamiento en tiempo real (barge-in, latencia de turno) no está validado cuantitativamente en esta build.
- La puerta de coherencia muestra una divergencia de recall de coincidencia exacta (12% frente a 4%) que supera el criterio de 2 pp, aunque el win-rate de 0,53 sí pasa; implica cierta pérdida de fidelidad literal en las respuestas.
- El encoder de habla permanece en BF16 en esta variante de ruta abierta; la variante con encoder FP8 para el contenedor NIM quedó diferida.
- Riesgo de alucinación inherente a modelos generativos de habla; no se documentan evaluaciones específicas de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o dialecto en la información disponible.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; no se detallan aquí sus términos.
- Dependencia estricta de la versión de ModelOpt (0.48.0rc1.dev21 con PR #2508) y de vllm-omni 0.33.0rc1; builds anteriores emiten nombres de módulo que vLLM no resuelve.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/dabsLabs/NVIDIA-NemotronLabs-VoiceChat-11B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B
- PR de ModelOpt referenciado: https://github.com/NVIDIA/Model-Optimizer/pull/2508
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
