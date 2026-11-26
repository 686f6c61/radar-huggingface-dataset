# enconvo/thewhisper-large-v3-turbo-coreml

## Resumen

TheWhisper Large V3 Turbo Core ML es una conversión del modelo de reconocimiento automático del habla (ASR) TheWhisper v3 de TheStage AI, a su vez un ajuste fino de OpenAI Whisper Large V3 Turbo, empaquetado en formato Core ML para ejecutarse en el Neural Engine de dispositivos Apple con la librería WhisperKit. Lo publica Enconvo, que lo distribuye como modelo de voz en local dentro de su aplicación para iPhone. El repositorio no contiene pesos nuevos: es una redistribución de los pesos originales transformados para inferencia en el dispositivo.

La relevancia de esta ficha es acotada y muy específica: no es un modelo para servir en servidores con GPUs, sino un artefacto de despliegue para iOS. La conversión aplica paletización por tensor (6 bits en el codificador de audio y 8 bits en el decodificador de texto), lo que reduce el paquete a unos 630 MB y permite ejecución en iOS 17 o superior. La licencia es CC BY 4.0, heredada del modelo base de TheStage AI.

No se dispone de información sobre arquitectura interna, número de parámetros, contexto ni idiomas en los materiales proporcionados; lo que sigue distingue explícitamente entre lo que consta en la model card y lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (Large V3 Turbo); pesos convertidos a Core ML (MelSpectrogram, AudioEncoder, TextDecoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper: 30 s por segmento, no confirmado en la información) |
| Tipos de cuantizacion | Paletización por tensor: 6 bits en el codificador de audio, 8 bits en el decodificador de texto |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`); tokenizer y configuraciones en JSON/texto |

## Arquitectura y entrenamiento

El modelo subyacente es TheWhisper v3 de TheStage AI, un ajuste fino de OpenAI Whisper Large V3 Turbo. Whisper es una arquitectura transformer encoder-decoder orientada a ASR que procesa espectrogramas Mel de entrada y genera tokens de texto. En este repositorio, el pipeline se divide en tres artefactos Core ML: `MelSpectrogram.mlmodelc`, `AudioEncoder.mlmodelc` y `TextDecoder.mlmodelc`.

Enconvo no ha entrenado ni ajustado el modelo: la model card indica explícitamente que no hay otros cambios aparte de la conversión y la cuantización. La conversión se realizó con `whisperkittools` de Argmax mediante `whisperkit-generate-model`, tratándolo como un Whisper Large V3 Turbo estándar. El tokenizer y los ficheros de configuración se copiaron sin modificar del repositorio original en el commit `54ee03e5829a5b9e258f0f7ad64606bbc16706d1`. No se dispone de datos sobre volumen de entrenamiento, composición del dataset ni fases de alineación (RLHF/DPO).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en local, sobre el Neural Engine de dispositivos Apple.
- Ejecución en el dispositivo sin conexión a red, al estar empaquetado como Core ML para WhisperKit.
- Inferencia en iOS 17 o superior.
- Selección de idioma en la llamada a `WhisperKitConfig`, recomendada por el autor cuando se conoce el idioma.
- Integración en la aplicación de iPhone de Enconvo como modelo de voz descargable.
- No consta soporte de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción en local en apps iOS: integrar el repositorio como `modelFolder` en `WhisperKitConfig` para dictado o notas de voz sin enviar audio a servidores, aprovechando la ejecución en el Neural Engine.
- Subtitulado de reuniones en el dispositivo: procesar segmentos de audio de hasta la ventana típica de Whisper y generar transcripciones sin coste de API ni dependencia de red.
- Asistentes de voz para apps de accesibilidad: conversión de voz a texto en tiempo real en iPhone, con la ventaja de que el modelo ocupa unos 630 MB y no requiere GPU dedicada.
- Dictado offline en entornos con conectividad limitada: aplicaciones de campo, viajes o zonas sin cobertura donde la inferencia remota no es viable.
- Preprocesado de audio para pipelines de búsqueda o indexación: generar transcripciones en el propio dispositivo antes de sincronizar solo el texto a un backend.
- Prototipado rápido en macOS/iOS con WhisperKit: validar flujos de ASR con un modelo ya convertido y cuantizado, sin necesidad de ejecutar la conversión Core ML uno mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que la precisión puede diferir ligeramente de los pesos originales debido a la cuantización, pero no cuantifica esa diferencia.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el Neural Engine de Apple, no en GPUs con memoria dedicada.
- GPU recomendadas: no aplica para el formato Core ML. Para el modelo base original en servidor se requeriría hardware compatible con WhisperKit/servidores Apple o GPUs convencionales, pero esos requisitos no constan en la información.
- Cabe en dispositivos consumer Apple: sí, en iPhone con iOS 17 o superior; el paquete pesa aproximadamente 630 MB.
- Opciones de despliegue: WhisperKit (`WhisperKitConfig(modelFolder:tokenizerFolder:)`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a Core ML.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Licencia | Ejecucion en dispositivo | Notas |
|---|---|---|---|---|---|
| enconvo/thewhisper-large-v3-turbo-coreml | Core ML (`.mlmodelc`) | ~630 MB (6/8 bits) | CC BY 4.0 | Si (iOS 17+, Neural Engine) | Conversion de TheWhisper v3 con whisperkittools |
| TheStageAI/thewhisper-large-v3-turbo | safetensors | no disponible | CC BY 4.0 | No directamente | Modelo base original del que deriva esta conversion |
| openai/whisper-large-v3-turbo | safetensors | no disponible | MIT | No directamente | Modelo original de OpenAI sobre el que se ajusto TheWhisper |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La precisión puede diferir ligeramente de los pesos originales por la cuantización a 6/8 bits; el autor no cuantifica la degradación.
- Solo se ejecuta en el ecosistema Apple (Core ML, iOS 17+); no es utilizable en servidores Linux con GPU ni en pipelines estándar de PyTorch.
- No se especifican los idiomas soportados; se recomienda indicar el idioma explícitamente en la configuración.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario conservar y cumplir los términos de atribución a TheStage AI y a OpenAI (MIT).
- El repositorio no está respaldado por TheStage AI ni por OpenAI, según declara el propio autor.
- Riesgo de alucinación inherente a los modelos ASR de tipo Whisper en audio con ruido o silencios prolongados; no se documentan mitigaciones específicas.
- Sin datos publicados de benchmarks, sesgos o evaluación por idioma; conviene validar con muestras propias antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/enconvo/thewhisper-large-v3-turbo-coreml
- Modelo base (TheStage AI): https://huggingface.co/TheStageAI/thewhisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
