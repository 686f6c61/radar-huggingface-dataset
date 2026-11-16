# Phoonnx/glowtts-de_de-thorsten-gruut

## Resumen

Glow-TTS de_de-thorsten-gruut es un modelo de síntesis de voz (text-to-speech) para alemán estándar (`de-DE`) desarrollado originalmente por Rhasspy como parte del proyecto Larynx, y empaquetado en formato ONNX por Phoonnx para su uso con su librería de inferencia TTS homónima. El modelo toma como entrada fonemas en alfabeto IPA generados mediante el fonemizador gruut y produce un espectrograma que posteriormente es convertido en audio por el vocoder HiFi-GAN `hifigan-multi-vctk-small`.

La arquitectura subyacente es Glow-TTS, un modelo de síntesis neuronal basado en flujo normalizador (normalizing flow) con alineamiento monotónico, que combina un encoder Transformer con un decoder de flujo invertible para generar espectrogramas mel de forma paralela. Frente a los modelos autorregresivos tipo Tacotron, Glow-TTS ofrece inferencia más rápida y estable, lo que lo hace adecuado para síntesis en tiempo real o cuasi real en entornos de recursos limitados.

El modelo es relevante para desarrolladores que necesitan TTS alemán autoalojado, sin dependencias de servicios en la nube, con un tamaño de repositorio de 0,1 GB y despliegue vía ONNX Runtime. Su integración con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx` lo posiciona como opción práctica para asistentes de voz y sistemas embebidos en alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (encoder Transformer + flujo normalizador invertible) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | other (sin licencia registrada; consultar el release upstream de Rhasspy/Larynx) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `hifigan-multi-vctk-small` (Phoonnx) |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en flujos normalizadores que aprende una transformación invertible entre la distribución de espectrogramas mel y una distribución latente simple. El encoder, de tipo Transformer, procesa la secuencia de fonemas de entrada y produce representaciones que guían el alineamiento monotónico con el audio objetivo, evitando la necesidad de un modelo de atención autorregresivo y permitiendo decodificación paralela durante la inferencia. Esta característica reduce la latencia y mejora la estabilidad frente a fallos de alineamiento típicos de arquitecturas secuenciales.

El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx y distribuido en su release v1.0 como archivo `de-de_thorsten-glow_tts.tar.gz`. No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, el número de tokens o pasos, ni sobre si se aplicaron técnicas de RLHF o ajuste fino adicional. La voz corresponde al hablante identificado como "thorsten", del dataset alemán Thorsten-Voice, aunque este extremo no se confirma explícitamente en la model card. Phoonnx se limita a empaquetar los pesos en ONNX y a integrar el front-end de texto mediante `scriptconv` y el fonemizador gruut.

## Capacidades

- Síntesis de voz a partir de texto en alemán estándar (`de-DE`), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generación de espectrogramas mel que se convierten en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`.
- Inferencia vía ONNX Runtime, apta para CPU y GPU sin dependencias de frameworks de deep learning pesados.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuración declarativa en `mycroft.conf`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es exclusivamente un modelo TTS.
- Monolingüe: no se documenta soporte de otros idiomas.

## Casos de uso

- Asistentes de voz autoalojados en alemán: integración directa en OVOS mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `larynx/de-de-thorsten-glow_tts` en `mycroft.conf` para respuestas habladas sin depender de APIs externas.
- Síntesis por lotes de audiolibros o contenidos formativos en alemán: el modelo procesa frases de forma paralela (no autorregresiva), lo que permite generar grandes volúmenes de audio con latencia predecible.
- Sistemas de accesibilidad: lectura de textos en pantalla para usuarios germanohablantes con discapacidad visual, ejecutándose localmente en hardware modesto gracias al tamaño reducido del repositorio (0,1 GB).
- Automatización de avisos y notificaciones en aplicaciones industriales o de domótica: generación de mensajes de voz dinámicos en alemán dentro de pipelines locales, sin coste por petición.
- Prototipado de interfaces conversacionales: evaluación rápida de flujos de diálogo en alemán con un TTS ligero antes de invertir en modelos de mayor calidad o voces personalizadas.
- Investigación en fonética y prosodia alemana: al recibir fonemas IPA como entrada, permite controlar la pronunciación a nivel fonémico y estudiar variaciones de síntesis con precisión sobre la representación lingüística.
- Sistemas embebidos y edge computing: despliegue en dispositivos con recursos limitados mediante ONNX Runtime, sin necesidad de GPU dedicada ni conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura Glow-TTS, la huella de memoria es reducida y cabe holgadamente en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100) puede ejecutar el modelo, si bien el modelo no requiere GPU para funcionar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en iGPU, dado el reducido tamaño de pesos.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-de_de-thorsten-gruut (este modelo) | Glow-TTS + HiFi-GAN | de-DE | fonemas IPA (gruut) | other (sin registrar) | ONNX | Hugging Face (Phoonnx) |
| Piper (voces de-DE, p. ej. thorsten) | VITS | de-DE | texto/fonemas | MIT (mayoría de voces) | ONNX | Hugging Face / GitHub (rhasspy/piper) |
| Coqui TTS (voces de-DE) | Tacotron2 / VITS / Glow-TTS | de-DE | texto/fonemas | MPL-2.0 / otras según voz | PyTorch, ONNX | GitHub (coqui-ai/TTS) |
| MMS-TTS deu (Meta) | VITS | de-DE | texto | CC-BY-NC 4.0 | PyTorch | Hugging Face (facebook/mms-tts-deu) |

La comparación cuantitativa de parámetros y rendimiento no está disponible en la información proporcionada. Piper y Coqui TTS son las alternativas más directas por ecosistema y formato; MMS-TTS difiere por licencia no comercial.

## Limitaciones y advertencias

- Licencia: la model card indica "other" y advierte explícitamente de que no hay licencia registrada; es imprescindible verificar el release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- Monolingüe: solo soporta alemán (`de-DE`); no hay capacidades multilingües documentadas.
- Dependencia del front-end: la calidad de síntesis depende del fonemizador gruut y de la normalización de texto de `scriptconv`; errores en la fonemización se traducen directamente en pronunciaciones incorrectas.
- Voz única: se distribuye una sola voz ("thorsten"); no se documentan variantes de hablante ni control de estilo o emoción.
- Sin datos de benchmarks: no hay métricas objetivas (MOS, WER, latencia) publicadas en la información disponible, lo que dificulta comparar su calidad con alternativas.
- Riesgo de alucinación acústica: como todo modelo TTS neuronal, puede producir artefactos, prosodia anómala o pronunciaciones erróneas en textos con números, siglas, nombres propios o puntuación atípica.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un corpus de un único hablante, la voz refleja las características demográficas y dialectales de dicho hablante.
- Fecha de creación futura en los metadatos (2026-11-14): conviene tratar las fechas del repositorio con cautela.
- Escaso soporte comunitario: 21 descargas y 0 likes en el momento de la consulta, lo que implica poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-thorsten-gruut
- Release upstream de Rhasspy/Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_thorsten-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
