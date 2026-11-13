# mlboydaisuke/VibeVoice-Realtime-0.5B-CoreAI

## Resumen

VibeVoice-Realtime-0.5B-CoreAI es una conversión del modelo de síntesis de voz `microsoft/VibeVoice-Realtime-0.5B` (licencia MIT) al runtime **Core AI** de Apple, el sucesor de Core ML disponible en iOS 27 y macOS 27. Lo publica el desarrollador `mlboydaisuke` dentro del ecosistema `coreai-model-zoo`, y su objetivo es ejecutar TTS multi-hablante completamente en dispositivo (iPhone y Mac) sin depender de servidores. Es relevante porque es el primer modelo de TTS con soporte de diálogo estilo pódcast del zoo, y porque cierra un bucle generar → diarizar junto al diarizador Streaming Sortformer del mismo autor.

La arquitectura combina dos LM Qwen2.5 (un LM de contexto de texto de 4 capas y un tronco de habla de 20 capas) con una cabeza de difusión de predicción de siguiente token por fotograma, seguida de un decodificador VAE acústico convolucional causal. El modelo trabaja a 7,5 Hz de latencia latente y sintetiza audio a 24 kHz. El tamaño total de pesos es de aproximadamente 1,4 GB en fp16 entre los cinco grafos exportados, y el repositorio completo ocupa 3,4 GB.

El modelo se distribuye como bundles `.aimodel` estáticos (formas fijas, decodificación q=1, caché KV de 512 posiciones) y requiere fp16 obligatoriamente: los LM en int8 divergen dentro del bucle de retroalimentación de habla. Los idiomas soportados son inglés y chino, con 25 presets de voz incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual LM Qwen2.5 (4 capas texto + 20 capas habla) + cabeza de difusión adaLN de 4 capas + decodificador VAE acústico convolucional causal |
| Parametros totales | no disponible (tamaño de pesos ≈ 1,4 GB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | caché KV fija de 512 posiciones por grafo de LM |
| Tipos de cuantizacion | solo fp16 (int8 diverge en el bucle de habla) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | bundles `.aimodel` (Core AI), `.h18p.aimodelc` (AOT para iPhone 17 Pro), presets de voz `.pt` y blobs fp16 planos |
| Frecuencia de muestreo de audio | 24 kHz |
| Tasa de latentes | 7,5 Hz (3200 muestras por fotograma) |
| Muestreo de difusión | DDPM coseno, v-prediction, DPMSolver++ 5 pasos, CFG 1,5 |
| Voces incluidas | 25 presets (EN/ZH/otras) |
| Runtime | Core AI (iOS 27 / macOS 27) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas. Primero, un LM de contexto de texto de 4 capas (normalización Identity) procesa el texto y un LM troncal de habla de 20 capas predice un latente por fotograma a 7,5 Hz. Segundo, una cabeza de difusión de 4 capas con adaLN (DDPM coseno, v-prediction, DPMSolver++ a 5 pasos con CFG 1,5) denoisa cada latente predicho. Tercero, un decodificador VAE acústico convolucional causal convierte los latentes en audio a 24 kHz.

La salida multi-hablante se implementa mediante **conmutación de turnos en el host**: cada turno `Speaker N:` se genera desde su propio preset de voz y los turnos se concatenan. No hay prefill multi-hablante ni codificador acústico: los presets de voz son KV de prefill precalculados. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en la información proporcionada. La innovación destacable es la exportación a Core AI con grafos estáticos y la integración con un bucle de diarización.

## Capacidades

- Síntesis de voz (TTS) en inglés y chino a 24 kHz.
- Generación multi-hablante estilo diálogo/pódcast mediante conmutación de turnos en el host.
- 25 presets de voz precalculados (EN, ZH y otros) sin necesidad de codificador acústico.
- Ejecución completamente en dispositivo (on-device) en iPhone y Mac, sin servidor.
- Integración con el diarizador Streaming Sortformer del mismo zoo para un bucle generar → diarizar.
- Inferencia en tiempo real: 10,6 tok/s ≈ 1,4x tiempo real en iPhone 17 Pro.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- **Pódcasts sintéticos multi-hablante**: el modelo permite generar diálogos con turnos alternos de distintos hablantes concatenando presets de voz, adecuado para producir episodios de audio con varias voces sin grabación.
- **Audiolibros y narración**: con 25 presets y salida a 24 kHz, se puede narrar texto largo por frases (el kit corta la frase a 64 fotogramas de habla, 8,5 s) usando presets que dejen espacio en la caché KV.
- **Accesibilidad en apps iOS**: al ejecutarse en dispositivo con Core AI, permite leer contenido dinámico en voz alta sin conexión y sin enviar texto a servidores, útil para usuarios con discapacidad visual.
- **Asistentes de voz locales**: la generación en tiempo real (1,4x) en iPhone 17 Pro permite respuestas habladas de baja latencia en asistentes que no pueden depender de la nube.
- **Transcripción y diarización inversa**: combinado con Streaming Sortformer, permite verificar o generar audio con hablantes conocidos para probar pipelines de diarización.
- **Prototipado de interfaces de voz en Mac**: los bundles de macOS permiten iterar en un Mac antes de desplegar en iPhone, aprovechando el mismo runtime Core AI.
- **Contenido educativo bilingüe EN/ZH**: los presets en inglés y chino permiten generar material de aprendizaje de idiomas con voces nativas.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Cabeza de difusión / conector, motor vs oráculo | cos 0,999999 / 1,000000 |
| Decodificador acústico (T=30 / T=64), motor vs golden no streaming | cos 1,000004 / 1,000005 |
| Decodificación LM principal / LM TTS, motor vs torch | cos 0,999999 / 0,999996 |
| E2E en Python sobre los 5 motores vs wav upstream | cos latente mín. 0,999198, cos wav 0,999479 |
| iPhone 17 Pro (A19 Pro, AOT h18p, GPU) vs golden | cos 0,998308 |
| Carga de grafos en iPhone 17 Pro (h18p AOT) | 6 grafos en 2,6 s (en caliente) |
| Throughput en iPhone 17 Pro | 24 latentes / 3,20 s de audio en 2,3 s = 10,6 tok/s ≈ 1,4x tiempo real |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de TTS.

## Requisitos de hardware

- **VRAM / memoria**: los cinco grafos suman aproximadamente 1,4 GB en fp16 (LM contexto 114 MB, tronco de habla 569 MB, cabeza de difusión 80 MB, conector 1,7 MB, decodificador VAE 656 MB), más la tabla de embeddings de 151936×896 en fp16.
- **GPU recomendadas**: GPU o Neural Engine de Apple; el modelo está pensado para Apple Silicon (Mac con M-series) y iPhone.
- **Consumer GPU**: no aplica a GPU NVIDIA/AMD; requiere el runtime Core AI de Apple. Cabe en iPhone (probado en iPhone 17 Pro con A19 Pro).
- **Opciones de despliegue**: Core AI en iOS 27 / macOS 27; bundles JIT (`ios/*.aimodel`) o AOT para iPhone 17 Pro (`ios-h18p/*.h18p.aimodelc`); host Swift con `coreai_host/` (presets, glue, embeddings mmap).
- **Latencia y throughput**: 10,6 tok/s ≈ 1,4x tiempo real en iPhone 17 Pro; carga de 6 grafos en 2,6 s en caliente.
- **Restricciones**: no usar la pista `expectFrequentReshapes` en iOS (provoca compilación en dispositivo y segfault en el compilador MPSGraph AICode).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| VibeVoice-Realtime-0.5B-CoreAI | no disponible (≈1,4 GB fp16) | caché KV 512 | en, zh | MIT | Core AI (Apple) |
| microsoft/VibeVoice-Realtime-0.5B | no disponible | no disponible | en, zh | MIT | PyTorch / otros |
| Otros ports CoreML/GGUF de VibeVoice | no disponible | no disponible | en, zh | MIT | CoreML / GGUF |
| Streaming-Sortformer-Diar-CoreAI (mismo autor) | no disponible | no disponible | no disponible | no disponible | Core AI (Apple) |

La comparativa con alternativas de TTS de otros ecosistemas (por ejemplo, modelos PyTorch o GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **fp16 obligatorio**: los LM en int8 divergen en el bucle de retroalimentación de habla (cos mín. 0,187, EOS temprano); la cabeza de difusión también es sensible a fp16 (colapso a 0,79 en torch puro).
- **Formas fijas**: todos los grafos son estáticos (q=1, decodificador de T fijo); no se puede usar `expectFrequentReshapes` en iOS.
- **Caché KV limitada**: `de-Spk0_man` agota la caché y lanza `VibeVoiceError.voiceFillsCache` desde CoreAIKit > 0.7.3; `kr-Spk1_man` solo deja ~6,4 s de habla. Se recomienda usar uno de los otros 23 presets.
- **Compatibilidad de versión**: CoreAIKit 0.7.3 y anteriores no se detienen al final de la caché y su salida más allá de ese punto no ha sido verificada.
- **Solo dos idiomas**: inglés y chino; no hay soporte documentado de otros idiomas.
- **Sin benchmarks estándar**: no hay datos de calidad subjetiva (MOS) ni comparativas publicadas.
- **Riesgo de alucinación y sesgos**: no documentados en la información disponible; al ser TTS, el riesgo se traslada a pronunciación y prosodia.
- **Licencia MIT**: permite uso comercial, pero se debe mantener el aviso de copyright; verificar la licencia del modelo base `microsoft/VibeVoice-Realtime-0.5B`.
- **Dependencia de plataforma**: solo funciona en Apple Core AI (iOS 27 / macOS 27), lo que limita su uso fuera del ecosistema Apple.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/VibeVoice-Realtime-0.5B-CoreAI
- Modelo base: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Diarizador del mismo autor: https://huggingface.co/mlboydaisuke/Streaming-Sortformer-Diar-CoreAI
- Core AI model zoo: https://github.com/john-rocky/coreai-model-zoo
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark (leaderboard on-device): https://devicemark.github.io/
