# rocketglobal/RocketSpeak-68M-vi

## Resumen

RocketSpeak-68M-vi es un modelo de reconocimiento automático del habla (ASR) para vietnamita, desarrollado por RocketAI (rocketglobal). Se trata de un sistema de 68 millones de parámetros basado en una arquitectura Zipformer con decodificación RNNT (transducer), derivado del modelo base `g-group-ai-lab/gipformer1.5-68M-rnnt` y entrenado con la librería icefall. Su rasgo más distintivo es que está diseñado para ejecutarse íntegramente en CPU mediante sherpa-onnx, con pesos exportados a ONNX en fp32 e int8, lo que lo sitúa en la categoría de modelos de reconocimiento de voz ligeros y desplegables en entornos sin GPU.

El modelo resuelve el problema del reconocimiento de voz en vietnamita con una precisión competitiva frente a sistemas comerciales mucho más grandes. Según los datos declarados por el autor, alcanza un WER normalizado del 6,10 % en FLEURS vi_vn, 3,82 % en VIVOS y 6,91 % en ViMD (63 provincias), con un rendimiento de 17,93 % en el conjunto médico ViMedCSS en régimen zero-shot. Estas cifras lo colocan por delante de referencias como Whisper large-v3 (8,59 % en FLEURS según VietASR) o PhoWhisper-large (4,67 % en VIVOS).

La relevancia actual del modelo radica en su combinación de tamaño reducido, licencia MIT y ejecución en CPU, lo que facilita su integración en aplicaciones locales, dispositivos de borde y flujos de trabajo con requisitos de privacidad. El repositorio incluye además el archivo `model.pt` para reentrenamiento con icefall y una variante "Pro" de servidor que combina varios sistemas ASR con corrección mediante un LLM, aunque esta última no forma parte de los pesos publicados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con decodificación RNNT (transducer), basada en icefall |
| Parametros totales | 68 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 e int8 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (fp32 e int8), model.pt para icefall |
| Modelo base | g-group-ai-lab/gipformer1.5-68M-rnnt |
| Libreria de despliegue | sherpa-onnx |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Zipformer, un codificador de tipo transformer con atención lineal y mecanismos de convolución que reduce el coste computacional manteniendo la capacidad de modelado temporal. Sobre este codificador se aplica una cabeza de decodificación RNNT (Recurrent Neural Network Transducer), que permite alineamiento monotónico entre audio y texto y decodificación en streaming. El modelo se entrena con la librería icefall, el framework de referencia de k2-fsa para modelos de voz, y se exporta a ONNX para su uso con sherpa-onnx.

Los datos de entrenamiento citados en la model card incluyen VLSP2020 VinAI (100 h), VIVOS, ViMD, FLEURS, VietBud500 y VietSpeech, lo que cubre voz de lectura, dominios diversos y variantes dialectales de las 63 provincias vietnamitas. No se especifica en la información disponible el número total de tokens de audio ni la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR). La innovación técnica destacable es la exportación int8 para CPU, que permite inferencia en hardware sin GPU con una degradación mínima de precisión (6,35 % frente a 6,10 % en FLEURS con decodificación greedy).

## Capacidades

- Reconocimiento automático del habla en vietnamita, con transcripción de audio a texto.
- Decodificación RNNT con alineamiento monotónico, adecuada para audio de duración variable.
- Ejecución en CPU mediante sherpa-onnx, sin necesidad de GPU.
- Cuantización int8 para despliegue en dispositivos con recursos limitados.
- Entrenamiento continuado posible gracias al archivo `model.pt` y la integración con icefall.
- Manejo de variantes dialectales de Vietnam (63 provincias según ViMD).
- Robustez parcial ante code-switching vietnamita-inglés en dominio médico (ViMedCSS, zero-shot).
- No soporta tool calling, agentes, visión ni audio generativo; es un modelo puramente ASR.
- Capacidad multilingüe limitada al vietnamita, con presencia puntual de términos en inglés.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo puede ejecutarse en CPU dentro de una aplicación de escritorio, procesando audio en streaming o por lotes sin enviar datos a la nube, gracias a su tamaño de 68 M y a la licencia MIT.
- Subtitulado automático de vídeo en vietnamita: su WER del 6,10 % en FLEURS y el soporte ONNX permiten integrarlo en pipelines de generación de subtítulos con latencia baja en servidores sin GPU.
- Atención al cliente y centros de llamadas: la transcripción de llamadas en vietnamita con variantes dialectales (ViMD, 6,91 %) facilita el análisis de conversaciones y la generación de resúmenes posteriores.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: la ejecución en CPU y el formato int8 permiten desplegar el modelo en dispositivos de borde y ordenadores personales sin infraestructura especializada.
- Documentación clínica: aunque el WER en ViMedCSS es del 17,93 % en zero-shot, el modelo puede servir como primera pasada de transcripción en entornos médicos, con revisión humana posterior o combinado con la variante Pro.
- Investigación en ASR de bajo recurso: el repositorio incluye `model.pt` y pesos ONNX, lo que permite reentrenar o hacer fine-tuning con icefall sobre nuevos dominios o dialectos vietnamitas.
- Integración en asistentes de voz locales: sherpa-onnx ofrece bindings para múltiples plataformas, lo que posibilita incorporar el modelo en aplicaciones móviles o embebidas con requisitos de privacidad.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (WER normalizado, menor es mejor):

| Dataset | WER (%) | Notas |
|---|---|---|
| FLEURS vi_vn test | 6,10 | Modelo 68M en CPU |
| FLEURS vi_vn test (int8, greedy) | 6,35 | Variante int8 |
| VIVOS test | 3,82 | — |
| ViMD test | 6,91 | 63 provincias |
| ViMedCSS test | 17,93 | Zero-shot, dominio médico con code-switching |

Comparativa declarada por el autor en FLEURS vi_vn:

| Sistema | WER (%) | Fuente |
|---|---|---|
| RocketSpeak Pro (sin bloqueo) | 4,00 | RocketAI |
| RocketSpeak Pro (con bloqueo) | 4,64 | RocketAI |
| Gemini 3.5 Live | 5,2 | AssemblyAI benchmarks |
| RocketSpeak-68M v0.1 | 6,10 | RocketAI |
| Muse Voice Transcribe (Meta) | 6,5 | AssemblyAI benchmarks |
| Soniox Realtime | 7,0 | AssemblyAI benchmarks |
| Whisper large-v3 (OpenAI) | 8,59 | VietASR, Interspeech 2025 |
| Speechmatics Enhanced | 8,6 | AssemblyAI benchmarks |
| Scribe v2 (ElevenLabs) | 8,8 | AssemblyAI benchmarks |
| Amazon Transcribe | 9,3 | AssemblyAI benchmarks |
| Azure Speech | 9,4 | AssemblyAI benchmarks |
| GPT Realtime (OpenAI) | 11,4 | AssemblyAI benchmarks |
| USM / Chirp STT v2 (Google) | 11,75 | VietASR, Interspeech 2025 |
| Universal-3.6 Pro (AssemblyAI) | 13,9 | AssemblyAI benchmarks |
| GPT-4o Transcribe (OpenAI) | 18,7 | AssemblyAI benchmarks |

En VIVOS, el autor declara 3,82 % para RocketSpeak-68M frente a 4,67 % de PhoWhisper-large (VinAI). En ViMD, el mejor resultado publicado junto al dataset es 12,24 % según el autor, frente a 6,91 % del modelo. En ViMedCSS, el mejor sistema publicado es 23,16 % (Interspeech 2026) frente a 17,93 % zero-shot. El autor advierte que las cifras entre fuentes distintas usan normalizadores de texto diferentes y no son directamente comparables.

## Requisitos de hardware

- VRAM estimada: no aplica para la variante CPU; el modelo está pensado para ejecutarse en RAM. Con 68 M de parámetros, el peso en fp32 ronda los 270 MB y en int8 aproximadamente 70 MB, más el overhead de sherpa-onnx.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para despliegues con GPU, cualquier GPU moderna (RTX 4090, A100, H100) puede acelerar la inferencia, aunque no es el objetivo del modelo.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde y Raspberry Pi, gracias a la variante int8.
- Opciones de despliegue: sherpa-onnx (principal), con soporte para C++, Python, Android, iOS y otros bindings. También es posible usar icefall para reentrenamiento.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que la variante int8 con greedy search es la más ligera para máquinas de bajos recursos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS vi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RocketSpeak-68M-vi | 68 M | no disponible | 6,10 % | MIT | Hugging Face, ONNX |
| Whisper large-v3 | 1,55 B (aprox.) | 30 s de audio | 8,59 % (VietASR) | MIT | Hugging Face, múltiples formatos |
| PhoWhisper-large | no disponible | 30 s de audio | no disponible en FLEURS; 4,67 % en VIVOS | no disponible | Hugging Face |
| Gemini 3.5 Live | no disponible (API) | no disponible | 5,2 % (AssemblyAI) | propietaria | API de Google |

RocketSpeak-68M-vi ofrece un WER competitivo con un tamaño dos órdenes de magnitud menor que Whisper large-v3 y con ejecución en CPU, lo que lo hace adecuado para despliegues locales. Frente a PhoWhisper-large, el autor declara mejor WER en VIVOS. Frente a sistemas comerciales como Gemini 3.5 Live, el modelo queda ligeramente por detrás en FLEURS pero sin coste de API ni dependencia de la nube.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en vietnamita; no soporta otros idiomas de forma nativa.
- El WER en dominios especializados como el médico con code-switching (ViMedCSS, 17,93 %) es notablemente superior al de dominios generales, lo que limita su uso directo en entornos clínicos sin revisión.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- Las comparaciones con otros sistemas usan normalizadores de texto distintos, según advierte el propio autor, por lo que las cifras no son estrictamente comparables.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan métricas de robustez en estas condiciones.
- No se especifican sesgos conocidos ni evaluaciones de equidad por género, edad o dialecto.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación comunitaria.
- La variante "Pro" mencionada en la model card no está incluida en los pesos de este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/rocketglobal/RocketSpeak-68M-vi
- Modelo base: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
- RocketAI: https://rocketai.dev
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- icefall: https://github.com/k2-fsa/icefall
- AssemblyAI benchmarks: https://www.assemblyai.com/benchmarks
- VietASR (Interspeech 2025): https://arxiv.org/abs/2505.21527
- PhoWhisper (ICLR 2024 Tiny Papers): https://arxiv.org/abs/2406.02555
- Contacto: contact@rocketai.dev
