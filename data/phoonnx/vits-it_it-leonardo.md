# Phoonnx/vits-it_it-leonardo

## Resumen

vits-it_it-leonardo es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por kirys79 dentro del proyecto piper_italiano y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en italiano (it-IT) en audio inteligible utilizando fonemas espeak en alfabeto IPA como entrada, lo que lo integra directamente en el ecosistema de phonemización de espeak-ng.

Su relevancia radica en que ofrece una voz italiana ligera (repo de 0,1 GB) y ejecutable sobre ONNX, lo que permite despliegue en entornos con recursos limitados, incluidos navegadores mediante phoonnx.js. Está pensado para integrarse en asistentes de voz como OVOS a través del plugin ovos-tts-plugin-phoonnx, y su licencia CC-BY-4.0 facilita el uso comercial con atribución.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni detalles del dataset de entrenamiento más allá de la procedencia upstream. La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor upstream | kirys79 (piper_italiano/Leonardo) |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, junto con alineamiento monotónico para el mapeo texto-audio. Esta arquitectura produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

La entrada de texto se procesa mediante espeak-ng (o su port espyak) para generar fonemas en IPA, que después se normalizan con la librería scriptconv antes de alimentar el modelo. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; se trata de un modelo TTS, por lo que estas técnicas no son habituales en este tipo de sistemas. El modelo upstream procede del repositorio kirys79/piper_italiano, del que se desconoce la composición exacta del corpus de entrenamiento.

## Capacidades

- Síntesis de voz en italiano (it-IT) a partir de texto escrito.
- Conversión texto-a-fonemas mediante espeak-ng en alfabeto IPA.
- Generación de audio en formato WAV a través de la API de phoonnx (`synthesize_wav`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al italiano.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` con la voz `piper_community/kirys79/it-IT_Leonardo`, ofreciendo respuestas habladas en italiano sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en italiano: al ser un modelo ligero (0,1 GB) y ejecutable sobre ONNX, puede sintetizar mensajes cortos en tiempo real en dispositivos de bajos recursos como Raspberry Pi.
- Síntesis en aplicaciones web: mediante phoonnx.js y la demo de tigregotico.pt, se puede integrar TTS italiano directamente en el navegador sin backend, útil para lectores de pantalla o interfaces de accesibilidad.
- Generación de audiolibros o contenido narrado en italiano: la API `synthesize_wav` permite procesar frases de forma secuencial y guardar los WAV resultantes para su posterior ensamblaje.
- Sistemas de información pública o kioscos interactivos en Italia: el modelo puede locutar respuestas dinámicas generadas por un LLM o un sistema de reglas, aportando una voz italiana consistente.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado para phoonnx y ser de pequeño tamaño, sirve como base para validar flujos de fonemización con espeak-ng y normalización con scriptconv antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) se estima un consumo de memoria muy bajo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; al ejecutarse sobre ONNX Runtime puede funcionar en CPU y en GPU de gama baja.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna e incluso en CPU, dado el reducido tamaño del modelo, aunque no se aportan cifras oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-it_it-leonardo (este modelo) | VITS | it-IT | 0,1 GB (repo) | CC-BY-4.0 | ONNX | Hugging Face, phoonnx, OVOS |
| kirys79/piper_italiano/Leonardo (upstream) | VITS | it-IT | no disponible | CC-BY-4.0 (declarada upstream) | Piper | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | variable | variable | ONNX | Hugging Face (colección VITS) |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta italiano (it-IT); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- Es un modelo TTS, no un modelo de lenguaje: no razona, no genera código ni soporta tool calling.
- No se han publicado detalles sobre sesgos del corpus de entrenamiento ni sobre el dataset utilizado, lo que impide evaluar sesgos de género, acento o dialecto.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya la autoría; es necesario conservar la atribución a kirys79 y a Phoonnx.
- No se especifican requisitos de latencia ni límites de longitud de texto; el uso por frases es el recomendado por la API.
- El repo tiene muy pocas descargas (26) y ningún like, lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-leonardo
- Modelo upstream: https://huggingface.co/kirys79/piper_italiano/tree/main/Leonardo
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
