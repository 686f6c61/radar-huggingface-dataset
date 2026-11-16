# Phoonnx/vits-ru_ru-natasha-vosk

## Resumen

vits-ru_ru-natasha-vosk es un modelo de síntesis de voz (text-to-speech) en ruso basado en la arquitectura VITS, desarrollado originalmente por Alpha Cephei como parte del proyecto Vosk y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en ruso (ru-RU) en audio inteligible, tomando como entrada fonemas generados por el fonemizador Vosk y produciendo formas de onda directamente, sin necesidad de un vocoder externo.

El interés práctico del modelo reside en su formato: se distribuye como un artefacto ONNX ligero (0,2 GB de repositorio) pensado para ejecutarse en CPU sin dependencias pesadas de frameworks de deep learning, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domésticos y despliegues de baja latencia en hardware modesto. Su integración con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx` facilita su uso en asistentes de voz de código abierto.

La ficha se basa exclusivamente en la información publicada en la model card de Hugging Face y en los enlaces referenciados; los datos no documentados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible (se distribuye en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Vosk (alfabeto Vosk) |
| Tamano del repositorio | 0,2 GB |
| Autor original | Alpha Cephei (Vosk) |
| Empaquetado | Phoonnx |
| Libreria de inferencia | phoonnx (Python y plugin OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de coincidencia temporal (Monotonic Alignment Search). El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin vocoder separado, lo que reduce la latencia y simplifica el despliegue.

En este caso concreto no se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus en ruso ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). El modelo se distribuye como exportación ONNX del checkpoint original de Vosk (`vosk-model-tts-ru-0.4-natasha`), y la model card no documenta innovaciones técnicas adicionales más allá de la propia arquitectura VITS y del front-end fonémico Vosk.

## Capacidades

- Síntesis de voz en ruso (ru-RU) a partir de texto plano, con salida en formato WAV.
- Fonemización mediante `VoskPhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte al alfabeto Vosk.
- Inferencia en CPU mediante ONNX Runtime a través de la librería phoonnx.
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Voz única disponible: `vosk/natasha`.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, velocidad o prosodia.
- No se documentan capacidades multilingües: el modelo está entrenado únicamente para ruso.
- No dispone de tool calling, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente de código abierto responda en ruso en dispositivos de bajos recursos, al ejecutarse en CPU mediante ONNX.
- Lectura de notificaciones y alertas en ruso: aplicaciones de monitorización o domótica pueden sintetizar mensajes cortos en tiempo real sin depender de servicios en la nube, gracias al tamaño reducido del artefacto (0,2 GB).
- Accesibilidad para personas con discapacidad visual: lectura de contenido textual en ruso en aplicaciones de escritorio o móviles con requisitos mínimos de hardware.
- Generación de audiolibros o contenido narrado en ruso por lotes: el modelo puede procesar grandes volúmenes de texto de forma offline, sin coste por petición ni límites de API.
- Sistemas de información pública o kioscos interactivos en ruso: síntesis de respuestas pregrabadas dinámicamente en entornos con conectividad limitada o requisitos de privacidad (procesamiento local).
- Pruebas y desarrollo de pipelines TTS: al ser un modelo ONNX ligero y con licencia MIT, sirve como referencia para validar integraciones de TTS en ruso antes de escalar a modelos mayores o comerciales.
- Prototipado de interfaces de voz en investigación: permite experimentar con fonemización Vosk y síntesis VITS en ruso sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse mediante ONNX Runtime en CPU, no requiere GPU.
- GPU recomendadas: no aplica; el modelo está pensado para inferencia en CPU.
- Cabe en GPU consumer: sí, por tamaño (0,2 GB), aunque no se documenta soporte GPU específico.
- Opciones de despliegue: librería `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ru_ru-natasha-vosk (este) | VITS | ru-RU | no disponible | MIT | ONNX | Hugging Face (Phoonnx) |
| Vosk TTS ruso original (Alpha Cephei) | VITS | ru-RU | no disponible | según términos upstream | modelo Vosk | alphacephei.com |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no disponible | MIT (según colección) | ONNX | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo sintetiza ruso (ru-RU); no soporta otros idiomas.
- No se documentan evaluaciones de sesgo, calidad perceptual (MOS) ni robustez ante texto fuera de dominio.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas, números o nombres propios, ya que la fonemización depende del fonemizador Vosk y de la normalización de `scriptconv`.
- Voz única (`vosk/natasha`): no hay variedad de hablantes ni control de estilo o emoción.
- La licencia del empaquetado es MIT, pero la model card indica que "the upstream release states its terms": conviene verificar las condiciones del release original de Alpha Cephei antes de un uso comercial a gran escala.
- El modelo se publicó con fecha de creación 2026-11-16 y cero descargas en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan límites de longitud de texto por inferencia; textos largos pueden requerir fragmentación manual.
- Al ser un artefacto ONNX sin cuantizaciones documentadas, el rendimiento en hardware muy limitado (por ejemplo, Raspberry Pi) no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-natasha-vosk
- Modelo original de Vosk: https://alphacephei.com/vosk/models/vosk-model-tts-ru-0.4-natasha.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Proyecto Vosk (Alpha Cephei): https://alphacephei.com/vosk/
