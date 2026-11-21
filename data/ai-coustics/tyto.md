# ai-coustics/tyto

## Resumen

Tyto es un modelo de análisis de calidad de audio desarrollado por ai-coustics. No es un modelo generativo ni un LLM, sino un estimador de riesgo acústico que predice si el audio que llega a un agente de voz va a provocar fallos en etapas posteriores del pipeline (reconocimiento de voz, detección de actividad vocal, gestión de turnos o modelos de voz a voz). Devuelve una puntuación de riesgo global acompañada de seis dimensiones diagnósticas que explican la causa probable del problema.

El modelo se distribuye a través del paquete `aic-sdk` (disponible para Python, Rust, C/C++, Node.js y WebAssembly) y funciona tanto en análisis por lotes de ficheros como en streaming en tiempo real, con un colector que bufferiza audio en el hilo de audio y un analizador que procesa en un hilo separado. La versión pública identificada en el repositorio es `tyto-1.2-l-16khz`, lo que indica una variante grande ("l") entrenada a 16 kHz.

Su relevancia actual radica en el despliegue de agentes de voz en producción: en lugar de descubrir un fallo de transcripción o de turn-taking a posteriori, Tyto permite instrumentar el audio de entrada (observabilidad) y detectar degradación por ruido, reverberación, pérdida de paquetes o códecs antes de que rompa la interacción. La información pública no detalla arquitectura, número de parámetros ni longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (análisis por ventanas de 5 segundos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (análisis acústico independiente del idioma) |
| Licencia | ai-coustics-model-license (propietaria, enlace en la model card) |
| Formato de pesos | no disponible (se carga con `aic.Model.from_file` / `aic.Model.download`) |

## Arquitectura y entrenamiento

La información pública no especifica la arquitectura interna del modelo (no se confirma transformer, CNN ni modelo híbrido), ni el volumen o composición del dataset de entrenamiento, ni si se emplearon técnicas de ajuste fino supervisado o refuerzo. La model card se centra en el contrato de uso de la API y en las salidas del modelo, no en su diseño.

Lo que sí se documenta es el comportamiento funcional: el analizador procesa el audio en ventanas de 5 segundos y devuelve un `AnalysisResult` por ventana, con una puntuación principal (`risk_score`) y seis dimensiones diagnósticas normalizadas en el rango 0.0–1.0: ruido ambiental (`noise`), distancia y reverberación del hablante (`speaker_reverb`), sonoridad del hablante (`speaker_loudness`), habla interferente de otros hablantes (`interfering_speech`), pérdida de paquetes y discontinuidades (`packet_loss`) y degradación por códec (`codec_degradation`). En streaming se emplea un par colector/analizador con un `ProcessorConfig` obtenido mediante `aic.ProcessorConfig.optimal(model)`, lo que sugiere un tamaño de bloque configurable para el bufferizado en tiempo real.

## Capacidades

- Estimación de riesgo de fallo en etapas posteriores del pipeline de voz (STT, VAD, turn-taking, speech-to-speech) mediante una puntuación única.
- Diagnóstico desglosado en seis dimensiones acústicas independientes (ruido, reverberación/distancia, sonoridad, habla interferente, pérdida de paquetes, degradación de códec).
- Análisis por lotes de ficheros de audio (`FileAnalyzer`) con una salida por cada ventana de 5 segundos.
- Análisis en streaming en tiempo real mediante colector/analizador con separación de hilos (bufferizado seguro en el hilo de audio, cómputo en hilo aparte).
- Integración con frameworks de agentes de voz: quickstarts documentados para LiveKit y Pipecat.
- SDK multiplataforma: Python, Rust, C/C++, Node.js y WebAssembly.
- No es un modelo generativo: no produce texto, no hace tool calling, no soporta razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Observabilidad de agentes de voz en producción: instrumentar el audio entrante de cada llamada y registrar `risk_score` junto con las seis dimensiones para correlacionar caídas de calidad con fallos de transcripción o de turn-taking.
- Monitorización en tiempo real de llamadas: usando el par colector/analizador, obtener lecturas periódicas de riesgo durante la conversación y disparar alertas o acciones correctivas (por ejemplo, solicitar al usuario que repita) antes de que el agente falle.
- Diagnóstico post-llamada: analizar grabaciones con `FileAnalyzer` para identificar qué ventanas de 5 segundos concentran el riesgo y qué causa concreta (ruido, reverberación, pérdida de paquetes) lo provoca.
- Control de calidad de infraestructura de telefonía y VoIP: detectar `packet_loss` y `codec_degradation` para distinguir problemas de red o de codificación de problemas acústicos del entorno.
- Evaluación de entornos de captación: medir `speaker_reverb` y `noise` para decidir si un dispositivo, una sala o un micrófono son adecuados antes de desplegar un agente de voz.
- Enrutado o escalado inteligente: usar el `risk_score` como señal para derivar una llamada a un canal alternativo (texto, agente humano) cuando la calidad acústica predice fallos.
- Validación de pipelines de mejora de audio: comparar el riesgo antes y después de aplicar modelos de ai-coustics como Quail Voice Focus o Rook Multi Speaker para cuantificar la mejora real aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni huella de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente a través del SDK `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un LLM.
- Latencia y throughput: no disponibles. La model card advierte que el análisis "es computacionalmente caro" y por ello separa el bufferizado (hilo de audio, tiempo real seguro) del cómputo (hilo aparte), pero no ofrece cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tyto (ai-coustics) | Análisis de calidad y riesgo de audio | `risk_score` + 6 dimensiones | ai-coustics-model-license (propietaria) | SDK `aic-sdk`, requiere clave |
| Quail Voice Focus (ai-coustics) | Aislamiento de hablante principal | Audio mejorado | ai-coustics-model-license | SDK `aic-sdk` |
| Quail Multi Speaker (ai-coustics) | Mejora multi-hablante para STT | Audio mejorado | ai-coustics-model-license | SDK `aic-sdk` |
| Rook Multi Speaker (ai-coustics) | Mejora de voz para escucha humana | Audio mejorado | ai-coustics-model-license | SDK `aic-sdk` |
| VAD Multi Speaker / VAD Voice Focus (ai-coustics) | Detección de actividad vocal | Etiquetas VAD | ai-coustics-model-license | SDK `aic-sdk` |

No se dispone de información sobre modelos comparables de otros proveedores en la documentación proporcionada. Los modelos de la tabla son de la misma familia y resuelven tareas complementarias (mejora o VAD) en lugar de la estimación de riesgo, por lo que no son sustitutos directos de Tyto.

## Limitaciones y advertencias

- Licencia propietaria (`ai-coustics-model-license`): el uso comercial está sujeto a los términos de ai-coustics y probablemente requiera licencia empresarial; no es software libre ni de código abierto.
- Requiere una clave de SDK (`aic-sdk-key`); existe una prueba gratuita de 30 días, pero el uso continuado depende de un servicio comercial.
- No es un modelo generativo ni un LLM: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K, y no sirve para generación de texto, código o razonamiento.
- Las salidas son puntuaciones de riesgo y diagnósticos, no decisiones: el umbral a partir del cual se considera "fallo" debe calibrarse por aplicación.
- La resolución temporal es de ventanas de 5 segundos; eventos más cortos pueden quedar diluidos en la media de la ventana.
- No se documentan sesgos acústicos, cobertura de idiomas, condiciones de entrenamiento ni límites de generalización a dominios no vistos.
- El análisis se declara computacionalmente caro; en despliegues de alta concurrencia puede requerir dimensionado específico de CPU/GPU.
- No se publican parámetros, arquitectura ni requisitos de hardware, lo que dificulta estimar costes de despliegue y planificar capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/tyto
- Documentación de Tyto: https://docs.ai-coustics.com/models/audio-insight/tyto
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentación general: https://docs.ai-coustics.com
- SDK de Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave gratuita de SDK: https://developers.ai-coustics.com
- Artefactos y checksums de versiones: https://artifacts.ai-coustics.io
- Quickstart para LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo para Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Sitio corporativo: https://ai-coustics.com/
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
