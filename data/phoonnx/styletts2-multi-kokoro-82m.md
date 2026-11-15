# Phoonnx/styletts2-multi-kokoro-82m

## Resumen

`Phoonnx/styletts2-multi-kokoro-82m` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, derivado del modelo original `hexgrad/Kokoro-82M` y empaquetado en formato ONNX para su uso con la librería `phoonnx` del propio autor. El modelo original fue desarrollado por hexgrad; esta versión es una conversión y distribución realizada por Phoonnx, que añade la infraestructura de carga, gestión de voces y fonemización necesaria para ejecutarlo en producción sin depender del stack original.

Con 82 millones de parámetros, es un modelo deliberadamente compacto, pensado para inferencia en CPU y en GPUs de gama baja, con un tamaño de repositorio de solo 0,2 GB. Cubre nueve variantes de idioma (`en-GB`, `en-US`, `es`, `fr`, `hi`, `it`, `ja-JP`, `pt-BR`, `zh`) e incluye más de 50 voces predefinidas identificadas por nombre. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que ofrece una alternativa de TTS multilingüe de código abierto, ejecutable localmente y con requisitos de hardware mínimos, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domóticos y aplicaciones donde la latencia y la privacidad importan más que la expresividad máxima de modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | 82 M (heredados de Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-GB, en-US, es, fr, hi, it, ja-JP, pt-BR, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,2 GB |
| Entrada de texto | Fonemas espeak (IPA), misaki_en (IPA), misaki_ja (IPA), misaki_zh (IPA) |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un codificador de estilo con un decodificador basado en difusión y un discriminador adversarial, orientada a generar habla natural con control de estilo y prosodia. El modelo empaquetado en este repositorio es una conversión a ONNX del checkpoint `hexgrad/Kokoro-82M`, realizada originalmente por `onnx-community/Kokoro-82M-v1.0-ONNX` y redistribuida por Phoonnx dentro de su colección de modelos StyleTTS2.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo original Kokoro-82M es conocido en la comunidad por su eficiencia, pero esta ficha se limita a lo documentado en la model card y los metadatos del repositorio. La innovación técnica destacable de este empaquetado es la integración del front-end de texto mediante `scriptconv`, que normaliza y convierte el texto a fonemas IPA usando espeak-ng o los fonemizadores misaki para inglés, japonés y chino, permitiendo así alimentar al modelo con la representación fonética que espera.

## Capacidades

- Síntesis de voz multilingüe en nueve variantes de idioma: inglés británico y estadounidense, español, francés, hindi, italiano, japonés, portugués brasileño y chino.
- Más de 50 voces predefinidas con identificadores estables (`kokoro/af`, `kokoro/am_adam`, `kokoro/zf_xiaobei`, etc.), que cubren voces femeninas y masculinas en varios idiomas.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización de entrada mediante espeak-ng (IPA) o mediante los fonemizadores misaki para inglés, japonés y chino.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución local en CPU o GPU mediante ONNX Runtime, sin dependencia de servicios en la nube.
- No se documentan capacidades de clonación de voz, control de emoción explícito, tool calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz embebidos en dispositivos domésticos: el modelo puede ejecutarse íntegramente en local con ONNX Runtime y un peso de 0,2 GB, lo que permite integrarlo en Raspberry Pi o mini-PCs sin conexión a internet, manteniendo la privacidad de las conversaciones.
- Sistemas de domótica con OVOS/Mycroft: mediante el plugin `ovos-tts-plugin-phoonnx` y la configuración de `mycroft.conf`, se puede sustituir el motor TTS por defecto por una voz Kokoro concreta (`kokoro/af`, `kokoro/em_alex`, etc.) sin cambiar el resto del stack.
- Lectura de textos largos y accesibilidad: la API `synthesize_wav` permite generar archivos WAV por fragmentos, adecuada para convertir artículos, documentos o notificaciones en audio para personas con discapacidad visual.
- Localización de contenidos multimedia: al soportar nueve variantes de idioma con voces nativas, se puede generar una misma locución en español, francés, italiano, portugués e inglés estadounidense usando el mismo pipeline y cambiando únicamente el identificador de voz.
- Generación de avisos y prompts en aplicaciones de atención al cliente: la baja latencia esperada de un modelo de 82 M permite sintetizar respuestas cortas en tiempo real dentro de un flujo conversacional, siempre que la calidad se valide por idioma.
- Prototipado rápido de interfaces de voz: al instalarse con `pip install --pre phoonnx "scriptconv[misaki]"` y requerir solo espeak-ng como dependencia del sistema, es viable montar un entorno de pruebas en minutos para evaluar prosodia y naturalidad antes de invertir en modelos mayores.
- Investigación en TTS multilingüe de bajo coste: sirve como línea base reproducible y ligera para comparar con modelos de mayor tamaño en experimentos académicos o de evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 82 M de parámetros y pesos ONNX en un repositorio de 0,2 GB, la huella en memoria es del orden de cientos de MB, apta para ejecución en CPU.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) sería sobredimensionada; el modelo está pensado para CPU.
- Cabe en GPU consumer: sí, con amplio margen, aunque el caso de uso principal es CPU.
- Opciones de despliegue: `phoonnx` (Python) con ONNX Runtime, y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen del hardware, del backend ONNX y de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `Phoonnx/styletts2-multi-kokoro-82m` | 82 M | 9 variantes (en-GB, en-US, es, fr, hi, it, ja-JP, pt-BR, zh) | ONNX | Apache 2.0 | Empaquetado para phoonnx; +50 voces |
| `hexgrad/Kokoro-82M` | 82 M | Multilingüe (mismo origen) | PyTorch (safetensors) | Apache 2.0 | Modelo upstream original; requiere stack distinto |
| `onnx-community/Kokoro-82M-v1.0-ONNX` | 82 M | Multilingüe | ONNX | Apache 2.0 | Conversión ONNX de referencia; sin integración phoonnx |
| Otros TTS open source de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card advierte que, si se usa la dependencia `phoonnx[espeak]` (port espyak) en lugar de espeak-ng del sistema, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras. Para calidad óptima se recomienda instalar espeak-ng (`apt install espeak-ng`).
- La calidad de síntesis depende del front-end de fonemización: espeak para la mayoría de idiomas y misaki para inglés, japonés y chino. Un texto mal normalizado o con caracteres fuera del alfabeto esperado puede producir errores de pronunciación.
- Riesgo de alucinación acústica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erráticas en textos ambiguos, siglas o nombres propios.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de un modelo entrenado con datos no descritos, pueden existir sesgos de acento, género o registro no evaluados.
- Licencia Apache 2.0 en el modelo upstream, lo que permite uso comercial; conviene verificar igualmente las licencias de las dependencias (espeak-ng, misaki, scriptconv, phoonnx) antes de distribuir un producto.
- El repositorio tiene solo 26 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria; conviene probar exhaustivamente antes de usarlo en producción.
- No se documentan límites de longitud de texto por llamada; textos muy largos probablemente deban fragmentarse manualmente.
- No se dispone de información sobre latencia, throughput ni calidad objetiva (MOS) en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-multi-kokoro-82m
- Modelo upstream: https://huggingface.co/hexgrad/Kokoro-82M
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
