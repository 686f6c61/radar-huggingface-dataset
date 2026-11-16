# Phoonnx/vits-en_us-danny-low-espeak

## Resumen

vits-en_us-danny-low-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la colección piper-voices en la ruta `en/en_US/danny/low`, y esta versión lo redistribuye en formato ONNX con una interfaz de entrada basada en fonemas espeak (alfabeto IPA). Su función es convertir texto en inglés estadounidense en audio inteligible con una voz concreta ("danny", variante de calidad "low").

El interés de esta ficha es doble. Por un lado, documenta un modelo de voz ligero y de licencia MIT, apto para despliegue en entornos con recursos limitados. Por otro, aclara el ecosistema de dependencias que necesita: el fonemizador espeak-ng (o su port espyak), la librería scriptconv para normalización de texto y el runtime phoonnx para inferencia ONNX. No es un modelo de lenguaje generativo ni un sistema multimodal: es un sintetizador acústico condicionado por fonemas.

El repositorio ocupa aproximadamente 0,1 GB y, en el momento de la consulta, no registra descargas ni interacciones en Hugging Face. La información técnica disponible es escasa y se limita a la model card del autor; no se han publicado métricas de calidad (MOS, WER de síntesis) ni detalles del corpus de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis de voz extremo a extremo con VAE condicional, normalizing flows y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud se limita por frase de entrada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (inglés estadounidense, `en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Pipeline | text-to-speech |
| Runtime | phoonnx (Python y OVOS); phoonnx.js en navegador |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional de extremo a extremo que combina un encoder de texto, un prior y un posterior variacional, normalizing flows para modelar la distribución acústica y un decoder generativo del tipo HiFi-GAN que produce la forma de onda directamente. El modelo aprende alineamientos monótonos entre fonemas y frames de audio mediante búsqueda de alineamiento monótono, lo que evita depender de un modelo de duración externo explícito en inferencia.

En esta ficha, el modelo es una redistribución: los pesos originales pertenecen a Rhasspy (colección piper-voices, voz `en_US/danny/low`) y Phoonnx los empaqueta para su librería. No se dispone de información sobre el número de tokens de audio de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de post-entrenamiento como fine-tuning perceptual o discriminadores adicionales. Tampoco se documentan innovaciones propias de esta versión más allá del empaquetado ONNX y la integración con el front-end de fonemas espeak.

La variante "low" indica una configuración de calidad reducida dentro de la familia Piper, orientada a latencia y tamaño bajos. La entrada no es texto crudo: el pipeline normaliza el texto con scriptconv y lo convierte a fonemas IPA mediante `EspeakPhonemizer`, de modo que la calidad depende en parte de la fidelidad de esa conversión.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV mediante `synthesize_wav`.
- Entrada basada en fonemas espeak (IPA), lo que permite control fino de la pronunciación si se generan los fonemas manualmente.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js, con soporte de entrada espeak o unicode.
- Normalización y conversión de texto delegadas a scriptconv.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo acústico, no un modelo de lenguaje.
- No dispone de modo "thinking", visión ni audio de entrada.
- Multilingüismo limitado a `en-US`; no se documentan otras lenguas en esta voz.

## Casos de uso

- Asistentes de voz locales en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper/en_US-danny-low` en `mycroft.conf`, de modo que un asistente doméstico autohospedado puede sintetizar respuestas sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser un modelo "low" y ONNX, encaja en dispositivos con CPU modesta para locutar mensajes cortos con baja latencia.
- Síntesis en navegador con phoonnx.js: aplicaciones web que necesitan leer texto en voz alta sin enviar datos a un servidor, usando la demo de TigreGotico como referencia de integración.
- Generación de audiolibros o podcasts de prototipo: se puede procesar texto por frases y concatenar los WAV resultantes; la calidad "low" es adecuada para borradores y pruebas de guion, no para producción editorial.
- Pruebas de accesibilidad y maquetación de interfaces: generar locuciones de ejemplo para validar flujos de lectura de pantalla o temporizaciones de UI antes de contratar una voz de mayor calidad.
- Investigación y docencia sobre TTS: al ser MIT y ONNX, sirve como banco de pruebas para estudiar el efecto del front-end fonémico (espeak-ng frente a espyak) en la inteligibilidad y para comparar variantes de calidad dentro de Piper.
- Automatización de avisos en pipelines internos: locutar resúmenes de estado o errores en herramientas de CI/CD o monitorización, donde la naturalidad importa menos que la claridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, métricas de inteligibilidad, comparativas con otras voces de Piper ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en memoria de cualquier GPU consumer y en CPU.
- GPU recomendadas: no se documentan; por tamaño, cualquier GPU con soporte ONNX Runtime es suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con al menos unos cientos de MB libres, aunque el dato exacto de memoria en ejecución no está publicado.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles. La variante "low" sugiere un compromiso orientado a velocidad, pero no hay cifras publicadas.
- Dependencias de sistema: espeak-ng (o el extra `phoonnx[espeak]` con espyak). Con espyak algunos fonemas difieren y pueden producir pronunciaciones incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-danny-low-espeak | VITS | en-US | low | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper `en_US` (p. ej. variantes medium/high de piper-voices) | VITS | en-US | medium/high | MIT (según model card upstream) | ONNX | Hugging Face (Rhasspy) |
| Modelos TTS neuronales comerciales (p. ej. APIs de nube) | no disponible | múltiples | alta | propietaria | API | servicios gestionados |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas opciones en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- Sesgos: no documentados; al entrenarse presumiblemente con voces de un solo hablante, la voz "danny" reproduce las características de ese hablante y no representa diversidad de acentos o géneros.
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones erróneas, especialmente con nombres propios, siglas, números y palabras fuera del dominio de entrenamiento.
- Dependencia del front-end: la calidad depende de espeak-ng; con espyak la model card advierte de que algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Limitación de idioma: solo `en-US`; no debe usarse para otras lenguas sin un modelo distinto.
- Longitud de entrada: no se documenta un límite explícito, pero los modelos VITS de frase suelen degradarse con entradas muy largas; conviene segmentar el texto.
- Licencia: MIT, lo que permite uso comercial y modificación, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices y conservar la atribución.
- Madurez: el repositorio no registra descargas ni interacciones; es un empaquetado reciente y poco validado por la comunidad, por lo que conviene probarlo antes de integrarlo en producción.
- Sin métricas: la ausencia de benchmarks impide garantizar niveles de calidad objetivos frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-danny-low-espeak
- Upstream (Rhasspy Piper voices, en_US/danny/low): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/danny/low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
