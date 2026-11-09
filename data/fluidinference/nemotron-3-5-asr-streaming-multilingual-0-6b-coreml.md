# FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML

## Resumen

Nemotron 3.5 ASR Streaming Multilingual 0.6B — CoreML es una conversión a CoreML del modelo de reconocimiento automático del habla `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por FluidInference y optimizada para ejecutarse en el Apple Neural Engine (ANE) de los chips Apple Silicon. El modelo original de NVIDIA emplea una arquitectura Conformer como codificador y un decodificador RNN-T (transducer), y está diseñado para ASR en streaming de baja latencia sobre dispositivo, sin depender de la nube.

La conversión de FluidInference no es una simple exportación: reorganiza el grafo en dos variantes de vocabulario (una podada para lenguas de escritura latina de 2828 tokens y otra completa de 13087 tokens que cubre también chino y japonés) y en cuatro niveles de latencia (0.56 s, 1 s, 2 s y 4 s por fragmento), produciendo ocho bundles independientes. Además aplica cuantización mixta en el codificador (INT8 en las capas extremas y 6 bits con paletización en las intermedias) y fusión del decodificador con el joint, con el objetivo de reducir el tamaño del codificador en torno a un 55 % respecto a FP16 sin degradar el WER.

Es relevante ahora porque demuestra que un modelo ASR multilingüe de 0.6B parámetros puede ejecutarse íntegramente en hardware de consumo Apple con factores de tiempo real de 80 a 150 RTFx, lo que habilita dictado, subtitulado y transcripción en directo en aplicaciones macOS/iOS sin coste de inferencia por token ni envío de audio a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (codificador) + RNN-T / transducer (decodificador y joint) |
| Parametros totales | 0.6B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ASR en streaming por fragmentos de 0.56 / 1 / 2 / 4 s) |
| Tipos de cuantizacion | Codificador con precisión mixta: primeras y últimas 3 capas Conformer en INT8, 18 capas intermedias en 6 bits con paletización; decodificador y joint fusionados (B1 decoder⊕joint fusion) |
| Idiomas soportados | en, es, fr, it, pt, de (bundle `latin`); zh, ja y más de 100 idiomas vía `prompt_id` (bundle `multilingual`) |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | CoreML (bundles `.mlpackage`/`.mlmodelc` por carpeta `<model>/<tier>ms/`), librería `fluidaudio` |
| Tamano del repo | 13.5 GB |
| Vocabulario | 2828 tokens (latin) / 13087 tokens (multilingual) |
| Niveles de latencia | 560 ms, 1120 ms, 2240 ms, 4480 ms |
| Hardware objetivo | Apple Silicon (ANE), benchmark sobre Apple M5 Pro / macOS 26.5 |
| Checkpoint base | Actualización de 2026-05-29 de `nvidia/nemotron-3.5-asr-streaming-0.6b` |

## Arquitectura y entrenamiento

El modelo subyacente es un ASR de tipo transducer: un codificador Conformer que procesa el audio en fragmentos y un decodificador RNN-T que genera tokens de forma incremental, lo que permite streaming real con alineación implícita y sin necesidad de segmentar la frase completa antes de transcribir. El codificador es multilingüe y compartido entre todos los idiomas; la selección de lengua se realiza en inferencia mediante `prompt_id`, de modo que un mismo grafo codificador sirve para los ocho idiomas declarados y para más de cien lenguas adicionales.

La conversión de FluidInference introduce tres decisiones técnicas destacables. Primero, una cuantización por capas (LAYERPOS `[42,13]`): las tres primeras y tres últimas capas del codificador se mantienen en INT8 mientras las 18 intermedias se paletizan a 6 bits, lo que recorta el codificador en torno a un 55 % frente a FP16 con un efecto neutro en WER según el autor. Segundo, la poda del vocabulario para lenguas latinas se deriva del sistema de escritura (se conservan todos los tokens latinos, puntuación y dígitos compartidos; se eliminan CJK, hangul, cirílico, árabe, etc.), no de un corpus de test, lo que reduce el joint unas cinco veces sin sobreajuste al conjunto de evaluación ni OOV dentro del script. Tercero, la fusión del decodificador con el joint y un pipeline de tres etapas maximizan la ocupación del ANE.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste con preferencias; esos detalles corresponden a la model card del modelo base de NVIDIA.

## Capacidades

- Reconocimiento automático del habla en streaming con latencia configurable entre 560 ms y 4480 ms por fragmento.
- Transcripción multilingüe en inglés, español, francés, italiano, portugués, alemán, chino y japonés, más de cien idiomas adicionales mediante `prompt_id`.
- Salida con puntuación y dígitos en lenguas latinas; cobertura completa de caracteres CJK en el bundle `multilingual`.
- Ejecución totalmente en dispositivo sobre el Apple Neural Engine, sin conexión de red.
- Inferencia de un solo flujo (batch=1) optimizada para dictado y subtitulado en tiempo real.
- Enrutado automático de idioma a la carpeta correcta (`latin` o `multilingual`) mediante el descargador de FluidAudio.
- No se documentan en la información disponible capacidades de diarización, detección de eventos, traducción o tool calling.

## Casos de uso

- Dictado en aplicaciones macOS/iOS: el bundle `latin/1120ms` ofrece unos 103–109 RTFx con WER cercano al óptimo, suficiente para transcribir voz a texto mientras el usuario habla sin esperas perceptibles.
- Subtitulado en directo de reuniones y videollamadas: con el tier de 2240 ms y RTFx de 130–150 en lenguas latinas, un solo hilo del ANE puede mantener el ritmo de una conversación continua y generar subtítulos con 2.5 s de retardo.
- Transcripción de audio largo en local: el tier de 4480 ms procesa audio de forma casi offline con calidad equivalente al de 2240 ms, adecuado para indexar grabaciones, pódcast o clases sin salir del dispositivo.
- Asistentes de voz con privacidad estricta: al ejecutarse íntegramente en el ANE, el audio no abandona el equipo, lo que encaja en entornos sanitarios, jurídicos o corporativos con requisitos de confidencialidad.
- Aplicaciones de accesibilidad: transcripción en vivo para personas con discapacidad auditiva en el propio portátil o iPad, sin coste por minuto ni dependencia de conectividad.
- Procesamiento multilingüe en atención al cliente: el bundle `multilingual` cubre llamadas en chino y japonés (CER de 18.57 % y 13.79 % en FLEURS a 2240 ms) además de las lenguas latinas, útil para centros de contacto con clientela internacional.
- Herramientas de productividad tipo notas de voz: integración vía `fluidaudiocli` o la librería FluidAudio para convertir grabaciones en texto estructurado dentro de un flujo de trabajo local.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre FLEURS (splits completos), con RTFx entre paréntesis (mayor es más rápido) y WER para lenguas latinas o CER para chino/japonés.

| Idioma | Bundle | 560 ms | 1120 ms | 2240 ms | 4480 ms |
|---|---|---|---|---|---|
| Inglés | latin | 58 (9.43 %) | 103 (8.89 %) | 130 (8.96 %) | 122 (9.02 %) |
| Español | latin | 58 (4.95 %) | 106 (4.76 %) | 140 (4.80 %) | 136 (4.77 %) |
| Francés | latin | 57 (9.68 %) | 105 (9.44 %) | 130 (9.52 %) | 124 (9.42 %) |
| Italiano | latin | 59 (5.68 %) | 109 (5.45 %) | 147 (5.41 %) | 150 (5.40 %) |
| Portugués | latin | 59 (6.38 %) | 108 (6.11 %) | 141 (6.14 %) | 141 (6.18 %) |
| Alemán | latin | 59 (10.83 %) | 107 (9.78 %) | 144 (9.83 %) | 142 (9.83 %) |
| Chino | multilingual | 22 (19.48 % C) | 27 (18.75 % C) | 89 (18.57 % C) | 90 (18.05 % C) |
| Japonés | multilingual | 21 (14.61 % C) | 26 (13.77 % C) | 84 (13.79 % C) | 89 (13.82 % C) |
| Multilingüe (en) | multilingual | 23 (9.15 %) | 71 (8.64 %) | 80 (8.76 %) | 78 (8.78 %) |

El autor advierte que el tier de 560 ms queda fuera del tiling de atención entrenado y penaliza tanto calidad como throughput; que los bundles de vocabulario completo (chino, japonés y multilingüe) solo aprovechan bien el ANE a 2240 ms, donde el joint de 13087 tokens encaja en el conjunto de trabajo; y que a 1120 ms el rendimiento depende de la densidad de salida (texto latino disperso ≈ 71 RTFx frente a CJK denso ≈ 26 RTFx). No se publican comparaciones directas con otros modelos ASR en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (benchmark sobre Apple M5 Pro, macOS 26.5). No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- VRAM/unified memory: no disponible de forma explícita; el repo completo ocupa 13.5 GB, pero cada bundle `<model>/<tier>ms/` es autocontenido y se carga individualmente, por lo que la huella en memoria es una fracción de esa cifra.
- Cabe en equipos de consumo Apple (MacBook con chip M-series, iPad, iPhone) al ejecutarse sobre el ANE; no requiere GPU dedicada.
- Opciones de despliegue: `fluidaudiocli` con el subcomando `nemotron-multilingual-transcribe`, o la librería FluidAudio con su descargador automático de bundles. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a CoreML.
- Throughput estimado: 130–150 RTFx en lenguas latinas a 2240 ms; 84–90 RTFx en chino/japonés a 2240 ms; 80 RTFx en multilingüe-inglés a 2240 ms. Latencia de extremo a extremo de 1.25 s (tier 1120 ms) y 2.5 s (tier 2240 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/streaming | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B CoreML (esta ficha) | 0.6B | 8 declarados + 100 vía prompt_id | Streaming por fragmentos de 0.56–4 s | OpenMDW 1.1 | CoreML | ANE Apple Silicon |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0.6B | Multilingüe | Streaming | no disponible en la información | safetensors (presumible, no confirmado) | GPU NVIDIA / CUDA |
| Whisper large-v3 | ~1.55B | ~99 | Ventanas de 30 s, no streaming nativo | MIT | safetensors, GGUF, CoreML | CPU, GPU, ANE |
| Parakeet / otros transducer de NVIDIA | no disponible | no disponible | Streaming | no disponible | no disponible | GPU NVIDIA |

La comparación con Whisper es la más informativa: Whisper es más grande, cubre más idiomas y no está pensado para streaming de baja latencia, mientras que este modelo prioriza latencia y ejecución en dispositivo. No se dispone de datos de benchmarks cruzados entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El acceso al repositorio requiere unirse al servidor de Discord indicado en la model card y solicitarlo al autor; no es descarga abierta pese a la licencia OpenMDW 1.1.
- El tier de 560 ms está fuera del tiling de atención entrenado: menor throughput y peor calidad; no se recomienda para chino, japonés ni multilingüe.
- Los bundles de vocabulario completo rinden mal por debajo de 2240 ms (≈ 21–27 RTFx), lo que limita su uso en escenarios de latencia subsegundo.
- El CER en chino (18.57 %) y japonés (13.79 %) es notablemente superior al WER en lenguas latinas (4.8–9.8 %), por lo que la calidad en CJK es sensiblemente menor.
- Solo se ejecuta en Apple Silicon con ANE; no hay ruta de despliegue documentada para CUDA, ROCm ni CPU genérica.
- Los resultados proceden de FLEURS, un corpus de lectura relativamente limpio; el rendimiento en audio espontáneo, con ruido, acentos marcados o solapamiento de hablantes puede degradarse y no se cuantifica.
- Riesgo de alucinación en pasajes de silencio o ruido, inherente a los modelos transducer; se recomienda validación con VAD previo en producción.
- No se documentan sesgos demográficos ni lingüísticos específicos; la poda de vocabulario latino podría afectar a nombres propios o préstamos en otros scripts dentro de texto latino.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; la model card no detalla condiciones de redistribución de los bundles convertidos.
- El modelo está fijado al checkpoint base de 2026-05-29; actualizaciones posteriores del modelo de NVIDIA no se reflejan automáticamente.

## Enlaces

- Hugging Face: https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Manifiesto de resultados: https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML/blob/main/manifest.json
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Acceso (Discord): https://discord.gg/S6m4ET3pX
