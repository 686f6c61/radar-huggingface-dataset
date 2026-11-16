# Phoonnx/vits-gl_es-brais-proxecto_nos-cotovia

## Resumen

`vits-gl_es-brais-proxecto_nos-cotovia` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo genera audio a partir de texto en gallego (`gl-ES`) y emplea como entrada fonemas del alfabeto Cotovia, el estándar de fonemización utilizado por Proxecto Nós para esta lengua.

El modelo es una conversión a ONNX del checkpoint original `OpenVoiceOS/proxectonos-brais-vits-phonemes-onnx`, lo que permite su ejecución en entornos de inferencia ligeros sin necesidad de PyTorch. Está integrado en el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`, y su front-end de texto delega la normalización y fonemización en la librería `scriptconv`, concretamente en el fonemizador `CotoviaPhonemizer`.

Su relevancia radica en ser una pieza de infraestructura para asistentes de voz en gallego dentro de OVOS: un modelo TTS ligero, con licencia MIT, formato ONNX y un pipeline de texto bien definido. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a despliegue en dispositivos de recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos en formato ONNX) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador variacional, un generador adversarial y un decodificador basado en flujos normalizadores para producir audio directamente a partir de fonemas. VITS es conocida por generar habla de calidad natural sin necesidad de un vocoder externo, integrando la generación de la forma de onda en el propio modelo.

El checkpoint original fue entrenado por Proxecto Nós para la voz "brais" en gallego, con entrada basada en fonemas Cotovia. La versión aquí descrita es una conversión a ONNX realizada por Phoonnx para su ejecución con su librería homónima. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de VITS y de la integración del front-end de fonemización Cotovia mediante `scriptconv`.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego (`gl-ES`) a partir de texto escrito.
- Conversión de texto a fonemas Cotovia mediante `CotoviaPhonemizer` de `scriptconv`, con normalización de texto previa.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración con asistentes de voz OpenVoiceOS (OVOS) a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en ONNX, lo que permite inferencia sin dependencia de PyTorch.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking (no aplica a un modelo TTS).
- Capacidad multilingüe limitada al gallego; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en gallego sobre OpenVoiceOS: el modelo se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona la voz `proxectonos/brais-cotovia` en `mycroft.conf`, permitiendo respuestas habladas en gallego en un asistente doméstico.
- Lectura de contenido en gallego: conversión de artículos, noticias o documentación a audio WAV mediante la API de `phoonnx`, adecuado por su licencia MIT y su formato ONNX ligero.
- Accesibilidad para personas con discapacidad visual: generación de audio a partir de texto en gallego en aplicaciones de lectura de pantalla o lectores de documentos.
- Sistemas de anuncios y avisos automatizados: integración en pipelines que generan mensajes hablados en gallego (transporte, administración pública, comercio local) aprovechando el bajo peso del modelo (~0,1 GB).
- Prototipado de interfaces conversacionales en gallego: uso del modelo como capa TTS en proyectos de investigación o demos de asistentes, gracias a su instalación sencilla (`pip install --pre phoonnx "scriptconv[gl]"`).
- Generación de audiolibros o contenido educativo en gallego: síntesis por lotes de texto a WAV con una voz consistente y fonemización estandarizada Cotovia.
- Pruebas de integración en entornos OVOS: validación del pipeline completo texto → fonemas Cotovia → audio ONNX en despliegues de OpenVoiceOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (~0,1 GB) sugiere un modelo compacto que probablemente cabe en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el formato ONNX y el reducido tamaño apuntan a que puede ejecutarse en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python y OVOS), con inferencia ONNX. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-brais-proxecto_nos-cotovia` | VITS | gallego (`gl-ES`) | ONNX | MIT | Fonemas Cotovia; empaquetado para `phoonnx` |
| `OpenVoiceOS/proxectonos-brais-vits-phonemes-onnx` | VITS | gallego | ONNX | no disponible | Checkpoint upstream del que deriva este modelo |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | ONNX | variable | Empaquetados para `phoonnx`; comparación directa no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta gallego (`gl-ES`); no se documentan otros idiomas.
- La entrada debe pasar por el fonemizador Cotovia de `scriptconv`; un texto mal normalizado o fuera del alfabeto Cotovia puede degradar la síntesis.
- No se han publicado métricas de calidad (MOS, WER, etc.) ni benchmarks, por lo que la calidad objetiva no está cuantificada.
- Riesgo de alucinación o artefactos de audio inherente a los modelos TTS generativos; no documentado por el autor.
- Sesgos de voz: al ser una voz concreta ("brais"), el modelo reproduce las características de esa grabación; no se documentan opciones de cambio de voz.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar los términos del release upstream (`OpenVoiceOS/proxectonos-brais-vits-phonemes-onnx`), ya que la model card indica que "the upstream release states its terms".
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan requisitos de hardware ni límites de longitud de texto de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-brais-proxecto_nos-cotovia
- Modelo upstream: https://huggingface.co/OpenVoiceOS/proxectonos-brais-vits-phonemes-onnx
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Referencia de VITS (paper): no disponible en la información proporcionada
- Proxecto Nós: no disponible en la información proporcionada
