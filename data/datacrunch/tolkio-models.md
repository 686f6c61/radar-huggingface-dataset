# datacrunch/tolkio-models

## Resumen

Tolkio models es un repositorio agregado que contiene el conjunto de modelos que descarga la aplicación Tolkio, un traductor de voz offline para Android. No se trata de un modelo único entrenado de cero, sino de una colección de componentes de reconocimiento de voz (ASR), traducción automática (MT), síntesis de voz (TTS), detección de voz (VAD), segmentación de hablantes y clasificación de idioma, empaquetados en formatos ONNX y GGUF para su ejecución local en dispositivos móviles. El autor del repositorio es datacrunch, mientras que los modelos subyacentes proceden de terceros (NVIDIA, bilibili, Supertone, Meta, Silero, entre otros) y algunos han sido ajustados o cuantizados específicamente para la aplicación.

El repositorio tiene un tamaño de 10,8 GB y declara 1.942.653.248 parámetros en safetensors, aunque este dato agrega componentes heterogéneos y no corresponde a un único modelo. La licencia es mixta ("mixed"): cada carpeta conserva la licencia de su modelo original, con predominio de Apache 2.0 y CC BY 4.0, pero también con componentes bajo OpenRAIL-M (Supertonic 3) y CC BY-SA 4.0 (voces VITS OpenBible). Esta heterogeneidad obliga a revisar licencia por licencia antes de cualquier uso comercial.

Su relevancia actual radica en que ejemplifica un patrón de despliegue de IA totalmente offline en Android: cuantización agresiva (2, 4 y 8 bits), exportación a ONNX Runtime y sherpa-onnx, y sustitución de dependencias en la nube por modelos locales. Es un caso práctico de integración de pipelines de voz multilingües en dispositivos con recursos limitados, aunque su naturaleza de "contenedor de modelos" hace que no sea evaluable como un modelo único.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: Conformer/transducer (Parakeet TDT), transformer (Index-Translate 2B), VITS (TTS), CAM++/pyannote (speaker), Silero VAD y clasificador de idioma |
| Parametros totales | 1.942.653.248 (agregado del repo, no de un modelo único) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits empaquetado, 4 bits (ONNX Runtime MatMulNBits, bloque 128), 8 bits, int8 (sherpa-onnx), 16 bits (pesos TTS/voces) |
| Idiomas soportados | No listados explícitamente; por componentes: multilingüe europeo (FLEURS, VoxPopuli, Common Voice), ASR para japonés, chino-inglés, lenguas africanas y coreano |
| Licencia | Mixta: CC BY 4.0, Apache 2.0, MIT, OpenRAIL-M, CC BY-SA 4.0 según carpeta |
| Formato de pesos | ONNX, GGUF, sherpa-onnx (int8), safetensors (declarado en el repo) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa modelos de distinta naturaleza. El componente ASR principal es NVIDIA Parakeet TDT 0.6B v3, un modelo transducer (TDT) basado en Conformer, que Hohasha Studios ajustó adicionalmente con transcripciones de voz limpia como objetivos y datos aumentados con ruido y sonido de sala (FLEURS, VoxPopuli, Common Voice y YouTube de Granary), además de un ajuste específico para puntuación en pausas del habla, para el nombre "Tolkio" (con voces Supertonic 3) y para no transcribir conversaciones de fondo lejanas. Las capas matriciales se cuantizaron a 4 bits mediante ONNX Runtime MatMulNBits y se exportaron a ONNX. Existen variantes históricas: asr2 (sin el ajuste de puntuación y nombre) y asr (Parakeet Redux de Moondream, empaquetado a 2 bits).

El resto de componentes incluye Index-Translate 2B (equipo Index de bilibili) en GGUF de 4 y 8 bits para traducción; Supertonic 3 (Supertone) para TTS con vocoder ONNX de pesos de 16 bits; CAM++, pyannote segmentation 3.0 y TIGER para hablantes; Silero VAD y Silero Language Classifier 95; Omnilingual ASR 300M (Meta) y TranslatePsy-AfriSLM 0.8B/2B (QVAC) para lenguas africanas y coreano; Parakeet TDT-CTC 0.6B ja requantizado a 4 bits; X-ASR zh-en Zipformer y Kokoro 82M v1.1-zh para chino; y voces VITS OpenBible. No se documentan números de tokens de entrenamiento, composición detallada de datasets ni uso de RLHF/DPO para los componentes ajustados.

## Capacidades

- Reconocimiento de voz (ASR) offline en Android con Parakeet TDT 0.6B v3 ajustado para entornos ruidosos y habla a distancia.
- Reconocimiento específico para japonés (Parakeet TDT-CTC 0.6B ja) y chino-inglés (X-ASR zh-en Zipformer con puntuación).
- Reconocimiento de lenguas africanas y coreano mediante Omnilingual ASR 300M.
- Detección automática de idioma hablado con Silero Language Classifier 95 para seleccionar el reconocedor adecuado.
- Traducción automática con Index-Translate 2B (GGUF 4/8 bits) y TranslatePsy-AfriSLM 0.8B/2B para lenguas africanas.
- Síntesis de voz (TTS) con Supertonic 3 y Kokoro 82M v1.1-zh, además de voces VITS OpenBible.
- Detección de actividad de voz (Silero VAD) y segmentación/diarización de hablantes (CAM++, pyannote 3.0, TIGER).
- Ejecución completamente offline e importación desde carpeta local en el dispositivo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Traducción de voz en tiempo real sin conexión: la app combina VAD, clasificador de idioma, ASR, MT y TTS en cadena para conversaciones presenciales en zonas sin cobertura, usando modelos cuantizados a 4/8 bits que caben en un móvil Android.
- Atención al público en entornos ruidosos: el ajuste de Parakeet con ruido y sonido de sala permite transcribir en estaciones, aeropuertos o comercios con habla a distancia y ruido de fondo.
- Subtitulado y transcripción de reuniones multilingües: X-ASR zh-en y Parakeet ja cubren pares de idiomas concretos, con puntuación incluida para mejorar la legibilidad.
- Diarización de entrevistas o grabaciones: CAM++, pyannote segmentation 3.0 y TIGER permiten separar hablantes antes de transcribir y traducir.
- Asistencia a viajeros y cooperantes en regiones con lenguas africanas: Omnilingual ASR 300M y TranslatePsy-AfriSLM 0.8B/2B cubren idiomas poco representados en modelos comerciales.
- Accesibilidad para personas con discapacidad auditiva o del habla: la cadena ASR + TTS con voces VITS y Supertonic 3 permite convertir voz en texto y texto en voz de forma local.
- Integración en pipelines de investigación sobre ASR de bajo recurso: el repositorio sirve como referencia de cuantización ONNX/sherpa-onnx y de ajuste de Parakeet con datos aumentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio está diseñado para ejecución en Android; el tamaño completo (10,8 GB) no cabe en la mayoría de móviles, por lo que la app descarga solo las carpetas necesarias.
- VRAM/RAM estimada por componente: Parakeet TDT 0.6B en 4 bits ronda unos cientos de MB; Index-Translate 2B en GGUF 4 bits requiere aproximadamente 1,5-2 GB; en 8 bits, en torno a 2,5-3 GB; Supertonic 3 y Kokoro 82M son ligeros (decenas a cientos de MB); Omnilingual ASR 300M int8 es inferior a 500 MB.
- GPU recomendadas: no aplica para el caso de uso principal (móvil); en escritorio, una RTX 4090 o superior permite ejecutar todos los componentes con holgura, y una GPU consumer de 8 GB cubre la mayoría de combinaciones.
- Cabe en GPU consumer: sí, componente a componente; el conjunto completo requiere gestionar la carga por etapas.
- Opciones de despliegue: ONNX Runtime (MatMulNBits), sherpa-onnx, llama.cpp/Ollama para los GGUF de traducción, y la propia app Tolkio con importación desde carpeta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tolkio models | Colección ASR/MT/TTS offline | 1.942.653.248 (agregado) | no disponible | Mixta | Hugging Face, app Android |
| Whisper (OpenAI) | ASR multilingüe | 39M–1.55B según variante | 30 s por ventana | MIT | Hugging Face, múltiples runtimes |
| SeamlessM4T (Meta) | ASR + MT + TTS | ~2.3B | no disponible | CC BY-NC 4.0 | Hugging Face |
| NLLB-200 (Meta) | Traducción | 600M–54B | no disponible | CC BY-NC 4.0 | Hugging Face |

La comparación es aproximada: Tolkio no es un modelo único sino un paquete de componentes, por lo que la comparación directa con Whisper o SeamlessM4T solo es válida componente a componente. Frente a ellos, Tolkio prioriza ejecución offline en Android y licencias permisivas en la mayoría de piezas, a costa de fragmentación y de una documentación de rendimiento inexistente.

## Limitaciones y advertencias

- No es un modelo único: agregar parámetros y evaluar rendimiento global carece de sentido; hay que evaluar cada carpeta por separado.
- Licencia mixta: Supertonic 3 está bajo OpenRAIL-M con restricciones de uso, y las voces VITS OpenBible bajo CC BY-SA 4.0, lo que puede condicionar el uso comercial y obligar a compartir adaptaciones.
- Algunos componentes (Index-Translate 2B, TranslatePsy-AfriSLM) tienen cobertura limitada de pares de idiomas; no se documenta qué pares exactos cubre cada uno.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad del ajuste de Parakeet ni de la traducción.
- La cuantización a 2 bits (asr/) y 4 bits puede degradar la precisión del ASR, especialmente en idiomas con pocos datos o en habla con acento marcado.
- Riesgo de alucinación en la traducción y en la puntuación generada por los modelos MT y por el ajuste de puntuación del ASR.
- Dependencia de la app Tolkio y de sus versiones (asr2 corresponde a versiones 1.7.0–1.7.6), lo que complica la reproducibilidad fuera del ecosistema de la aplicación.
- Idiomas soportados no listados de forma exhaustiva; la cobertura depende de cada componente y puede haber huecos no documentados.
- El tamaño del repositorio (10,8 GB) y la necesidad de importación manual desde carpeta añaden fricción operativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/datacrunch/tolkio-models
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NVIDIA Parakeet TDT-CTC 0.6B ja: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- X-ASR zh-en Zipformer (Gilgamesh-J): https://huggingface.co/Gilgamesh-J/X-ASR
- Kokoro 82M v1.1-zh (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Silero VAD: https://github.com/snakers4/silero-vad
- Silero Language Classifier 95: https://github.com/snakers4/silero-vad
- Omnilingual ASR 300M (Meta): https://huggingface.co/facebook/omniASR-300M
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- ONNX Runtime MatMulNBits: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
