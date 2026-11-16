# Phoonnx/vits-gl_es-icia-proxecto_nos-cotovia

## Resumen

`vits-gl_es-icia-proxecto_nos-cotovia` es un modelo de síntesis de voz (text-to-speech) en gallego, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la librería de inferencia ONNX `phoonnx`. El modelo convierte texto en gallego (variante `gl-ES`) en audio, tomando como entrada fonemas en el alfabeto Cotovia, generados por el fonemizador `CotoviaPhonemizer` de la librería `scriptconv`.

Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador acústico y un vocoder en un único sistema entrenado de forma adversaria. El repositorio empaqueta los pesos en formato ONNX (tamaño del repo: 0,1 GB), lo que facilita su despliegue en entornos Python y en el asistente de voz OVOS (OpenVoiceOS) mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia radica en ser una pieza de infraestructura para el ecosistema de asistentes de voz en abierto con soporte para una lengua minoritaria como el gallego, con licencia MIT y un pipeline de normalización de texto y fonemización documentado. No se dispone de datos publicados sobre el corpus de entrenamiento, el número de parámetros ni métricas de calidad de síntesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con aprendizaje adversario) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada limitada por la frase a sintetizar) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz end-to-end que integra en una sola red el codificador de texto, el prior variacional, el decodificador acústico y el vocoder, entrenado con una combinación de pérdidas de reconstrucción, adversarias y de alineamiento monotónico. Esta familia de modelos produce audio de forma directa a partir de la secuencia de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo es un empaquetado para `phoonnx` del release original de Proxecto Nós, disponible en `OpenVoiceOS/proxectonos-icia-vits-phonemes-onnx`. La entrada no es texto plano directamente, sino fonemas en el alfabeto Cotovia, que se obtienen mediante el `CotoviaPhonemizer` de `scriptconv_copyleft.phonemizers.gl` (extra `scriptconv[gl]`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego (`gl-ES`) a partir de texto de entrada.
- Fonemización de texto gallego mediante el fonemizador Cotovia, integrado en el pipeline de `scriptconv`.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración con el asistente de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto previa a la síntesis mediante `scriptconv`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS).
- No dispone de capacidades de visión, audio de entrada ni modo de razonamiento (thinking mode).

## Casos de uso

- Asistentes de voz en abierto: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz en gallego a un asistente doméstico, seleccionando la voz `proxectonos/icia-cotovia` en `mycroft.conf`.
- Lectura de contenido en gallego: conversión de artículos, noticias o documentación a audio para accesibilidad o consumo pasivo, usando la API de Python de `phoonnx` para generar ficheros WAV.
- Aplicaciones de accesibilidad: síntesis de texto a voz para personas con discapacidad visual que consuman contenido en gallego, con un modelo ligero (repo de 0,1 GB) desplegable localmente.
- Sistemas de megafonía o avisos automatizados: generación de mensajes pregrabados en gallego para transporte, comercio o administración pública, aprovechando la licencia MIT para uso comercial.
- Investigación en TTS para lenguas minoritarias: base para experimentos de fonemización, normalización y síntesis en gallego, con el pipeline `scriptconv` + `phoonnx` documentado y reproducible.
- Prototipado de interfaces conversacionales: generación rápida de respuestas habladas en gallego en entornos de desarrollo, sin depender de servicios en la nube, gracias al formato ONNX y a la inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamaño reducido del repo apuntan a que puede ejecutarse en CPU, pero no se especifica.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-gl_es-icia-proxecto_nos-cotovia | VITS | gallego (gl-ES) | no disponible | no disponible | MIT | ONNX |
| OpenVoiceOS/proxectonos-icia-vits-phonemes-onnx (upstream) | VITS | gallego (gl-ES) | no disponible | no disponible | no disponible | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no disponible | no disponible | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en síntesis de voz; no realiza otras tareas de lenguaje.
- Soporte limitado al gallego (`gl-ES`); no se documentan otros idiomas.
- La entrada debe pasar por el fonemizador Cotovia; un texto mal normalizado o con caracteres no soportados puede degradar la síntesis.
- No se dispone de información sobre sesgos, calidad de voces, prosodia ni robustez ante ruido o dominios específicos.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- Licencia MIT declarada, lo que en principio permite uso comercial, aunque la model card indica que el release upstream establece sus propios términos; conviene verificar la licencia del modelo original antes de un despliegue comercial.
- No se documentan requisitos de hardware, latencia ni límites de longitud de entrada; el rendimiento en producción no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-icia-proxecto_nos-cotovia
- Modelo upstream: https://huggingface.co/OpenVoiceOS/proxectonos-icia-vits-phonemes-onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección de modelos VITS para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
