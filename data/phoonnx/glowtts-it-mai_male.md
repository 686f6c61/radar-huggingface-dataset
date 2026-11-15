# Phoonnx/glowtts-it-mai_male

## Resumen

Glow-TTS es un modelo de síntesis de voz (text-to-speech) basado en arquitectura Glow-TTS, desarrollado originalmente por Coqui a partir del sistema Coqui TTS (v0.6.1). Esta ficha concreta, `glowtts-it-mai_male`, es un empaquetado en formato ONNX realizado por Phoonnx para su librería de TTS ONNX homónima, que permite ejecutar el modelo en Python y en el ecosistema OVOS (Open Voice OS). El modelo sintetiza voz masculina en italiano a partir de texto de entrada a nivel de carácter.

El modelo resuelve el problema de la síntesis de voz en italiano dentro de entornos que requieren inferencia ligera y portable: al estar empaquetado en ONNX, puede ejecutarse sin depender del framework original de Coqui TTS y con un tamaño de repositorio de solo 0,1 GB. Es relevante para desarrolladores que integran TTS en asistentes de voz, sistemas embebidos o pipelines de audio en producción, especialmente en el ecosistema OVOS.

La información disponible sobre el modelo es limitada: se trata de un artefacto de empaquetado de un modelo upstream de Coqui, con licencia Apache 2.0 y soporte únicamente para italiano. No se publican detalles sobre parámetros, contexto ni benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (Coqui TTS v0.6.1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada a nivel de carácter) |
| Tipos de cuantizacion | no disponible (formato ONNX empaquetado) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres del texto |
| Front-end de texto | `GraphemePhonemizer` (scriptconv) |
| Voces disponibles | `coqui-it-mai_male-glow-tts` |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de síntesis de voz basada en normalizing flows y alineamiento monotónico, que combina un encoder de texto con un decoder generativo de flujos invertibles para producir espectrogramas mel, que posteriormente se convierten en audio mediante un vocoder. Esta implementación concreta proviene del release v0.6.1 de Coqui TTS y corresponde a la voz italiana masculina `mai_male`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en TTS). La innovación destacable de este artefacto es el empaquetado en ONNX para la librería phoonnx, que permite ejecución portable y ligera, junto con la integración del front-end de texto mediante `scriptconv` (normalización y fonemización a nivel de grafemas). El modelo no incorpora decodificación especulativa ni atención lineal; es un TTS clásico de Coqui.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano a partir de texto de entrada.
- Voz masculina italiana (`mai_male`).
- Entrada a nivel de carácter con front-end de grafemas (`GraphemePhonemizer`).
- Salida de audio en formato WAV mediante `synthesize_wav`.
- Integración en Python a través de `phoonnx.model_manager.TTSModelManager`.
- Integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX (portable, sin dependencia del framework original de Coqui).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso (no aplicable a un modelo TTS).

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra directamente mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en italiano con una voz masculina concreta.
- Síntesis de voz en aplicaciones Python: usando `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV a partir de texto en italiano dentro de cualquier pipeline Python, sin depender de Coqui TTS.
- Sistemas embebidos y de bajo consumo: el repositorio de 0,1 GB y el formato ONNX permiten desplegar el modelo en entornos con recursos limitados donde un TTS completo de Coqui sería excesivo.
- Generación de audiolibros o locuciones en italiano: la voz masculina `mai_male` es adecuada para narración y lectura de texto largo, procesando el texto por caracteres.
- Accesibilidad y lectura de pantalla: integración en lectores de pantalla o aplicaciones de accesibilidad que necesiten sintetizar contenido en italiano con una voz masculina.
- Prototipado rápido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargar la voz `coqui-it-mai_male-glow-tts`, permite validar flujos de TTS en italiano con muy poca configuración.
- Pipelines de audio por lotes: la inferencia ONNX permite procesar grandes volúmenes de texto a audio en servidores sin GPU dedicada, generando ficheros WAV de forma programática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; el modelo está empaquetado en ONNX y está pensado para ejecución portable, incluida CPU.
- ¿Cabe en GPU de consumo? No disponible; por tamaño (0,1 GB) es probable que quepa en cualquier GPU de consumo, pero no se confirma en la información.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| glowtts-it-mai_male (este) | Glow-TTS | it | Apache 2.0 | ONNX | 0,1 GB |
| Otros modelos Glow-TTS de la colección Phoonnx | Glow-TTS | varios | Apache 2.0 (según upstream) | ONNX | no disponible |
| Coqui TTS `tts_models--it--mai_male--glow-tts` (upstream) | Glow-TTS | it | Apache 2.0 | checkpoint Coqui | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo limitado a un único idioma: italiano (`it`).
- Una única voz disponible: `coqui-it-mai_male-glow-tts` (masculina).
- Entrada a nivel de carácter con fonemización de grafemas, lo que puede afectar a la pronunciación de palabras ambiguas o extranjeras.
- Es un artefacto de empaquetado de un modelo upstream de Coqui (v0.6.1); no se documentan mejoras de calidad respecto al original.
- No se publican datos sobre sesgos, alucinaciones (no aplicable en el sentido de LLM, pero sí posibles errores de pronunciación) ni métricas de calidad (MOS).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream de Coqui y del vocoder asociado.
- El número de descargas (25) y de likes (0) es muy bajo, lo que sugiere poca validación comunitaria.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-it-mai_male
- Upstream (Coqui TTS v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_male--glow-tts.zip
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
