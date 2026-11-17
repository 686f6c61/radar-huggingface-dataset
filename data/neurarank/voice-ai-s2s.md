# neurarank/voice-ai-s2s

## Resumen

Voice AI (`neurarank/voice-ai-s2s`) es un modelo fundacional de speech-to-speech (S2S) de extremo a extremo desarrollado por neurarank. Su objetivo es eliminar las tuberías en cascada convencionales `STT -> LLM -> TTS`, procesando audio de entrada y generando audio de salida directamente, sin una transcripción de texto obligatoria en la ruta crítica de inferencia. El modelo se presenta bajo el principio "Audio In → Cognitive Processing → Audio Out".

La arquitectura combina un encoder de voz Causal Conformer, un backbone de mezcla de expertos dispersa (MoE) de 8 capas y 8 expertos con GQA y RoPE, y un decoder acústico causal RVQ con 16 cuantizadores y vocoder MOSS. El modelo tiene aproximadamente 442 millones de parámetros en pesos FP16 y opera a 48 kHz tanto en entrada como en salida de audio PCM.

Es relevante para desarrolladores que construyen asistentes de voz conversacionales de baja latencia: el autor reporta un Time to First Audio (TTFA P50) de 111,63 ms y un Real-Time Factor de 0,0138 (unas 72 veces más rápido que la reproducción en tiempo real) sobre Apple Silicon M4 Pro con aceleración MPS. El modelo soporta sesiones de streaming con estado, full-duplex y barge-in.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Conformer Speech Encoder → Sparse Mixture-of-Experts Backbone (8 capas, 8 expertos, GQA, RoPE) → Causal Acoustic RVQ Decoder (16 cuantizadores, MOSS Vocoder) |
| Parametros totales | ~442.360.650 (FP16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de tres etapas: un encoder de voz Causal Conformer que procesa audio PCM crudo a 48 kHz, un backbone de mezcla de expertos dispersa de 8 capas con 8 expertos, atención GQA y codificación posicional RoPE, y un decoder acústico causal RVQ con 16 cuantizadores que alimenta un vocoder MOSS para sintetizar la salida de voz a 48 kHz. La naturaleza causal de encoder y decoder es coherente con el uso en streaming: el modelo mantiene estado persistente entre fragmentos de audio y puede emitir audio antes de completar la secuencia.

El autor no detalla en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica destacada es la eliminación de la transcripción de texto en la ruta crítica de inferencia, trabajando sobre representaciones latentes continuas, lo que reduce la latencia frente a cascadas STT-LLM-TTS. También se expone un mecanismo de barge-in con latencia inferior a 15 ms que detiene la síntesis preservando el contexto del prompt en la KV cache.

## Capacidades

- Generación de voz de extremo a extremo: entrada de audio PCM a 48 kHz y salida de voz sintetizada a 48 kHz sin transcripción de texto intermedia.
- Streaming con estado: sesiones que ingieren fragmentos de audio (por ejemplo, 80 ms = 3.840 muestras a 48 kHz) con estado persistente entre llamadas.
- Full-duplex y barge-in: interrupción de la respuesta en curso con latencia declarada inferior a 15 ms, conservando el contexto en la KV cache.
- Detección de fin de turno: la API de streaming acepta una señal `is_end_of_turn` para gestionar el cambio de turno conversacional.
- Multilingüe limitado: vietnamita e inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio más allá del habla: no disponible.

## Casos de uso

- Asistentes de voz conversacionales de baja latencia: el modelo puede gestionar turnos de habla con un TTFA P50 de 111,63 ms, adecuado para interacciones donde la respuesta percibida debe ser casi inmediata.
- Atención al cliente telefónica automatizada: la arquitectura S2S evita la latencia acumulada de STT, LLM y TTS, y el soporte de barge-in permite que el usuario interrumpa al agente sin esperar a que termine la frase.
- Interfaces de voz manos libres en dispositivos: con ~442 M de parámetros en FP16, el modelo es desplegable en hardware de gama alta de consumo, lo que permite integrarlo en aplicaciones de escritorio o estaciones de trabajo.
- Traducción oral inglés-vietnamita en tiempo real: al soportar ambos idiomas en el mismo modelo de audio a audio, puede emplearse en escenarios de interpretación conversacional entre hablantes de esas lenguas.
- Prótesis o asistentes de accesibilidad por voz: el procesamiento directo de audio a audio y la baja latencia facilitan interfaces de conversación natural para usuarios con movilidad reducida.
- Prototipado de agentes de voz full-duplex: la API de sesión con estado (`create_streaming_session`, `push_audio`, `interrupt`) permite construir demos de conversación bidireccional con interrupciones en tiempo real.
- Investigación en modelos S2S sin texto: sirve como base para experimentar con arquitecturas que eliminan el cuello de botella de transcripción en pipelines de voz.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Time to First Audio (TTFA P50) | 111,63 ms | Objetivo declarado < 500 ms |
| Real-Time Factor (RTF) | 0,0138 (72x más rápido que tiempo real) | Apple Silicon M4 Pro, aceleración MPS |
| Hardware probado | Apple Silicon M4 Pro (MPS) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~442 M de parámetros en FP16, el peso de los pesos ronda los 0,9 GB, por lo que la huella de memoria es moderada, aunque el consumo real depende del estado de streaming y del vocoder.
- GPU recomendadas: el autor solo documenta pruebas en Apple Silicon M4 Pro con MPS; no se especifican GPU NVIDIA recomendadas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga mediante `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: TTFA P50 de 111,63 ms y RTF de 0,0138 sobre M4 Pro con MPS; no hay datos para otras plataformas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (S2S de extremo a extremo) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Cobertura idiomática limitada a vietnamita e inglés; no se declara soporte para castellano ni otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo de voz entrenado sobre datos no especificados, pueden aparecer sesgos acústicos y demográficos no evaluados.
- Riesgo de alucinación: no cuantificado; al no generar texto intermedio, la verificación de contenido es más difícil que en pipelines con transcripción.
- No se detalla la composición del dataset de entrenamiento ni los procesos de alineación, lo que limita la evaluación de seguridad y robustez.
- El modelo requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor y auditar su procedencia antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni evaluación de cumplimiento regulatorio para aplicaciones de voz.
- El rendimiento reportado se limita a Apple Silicon M4 Pro con MPS; no hay datos de latencia o throughput en GPU NVIDIA u otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/neurarank/voice-ai-s2s
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
