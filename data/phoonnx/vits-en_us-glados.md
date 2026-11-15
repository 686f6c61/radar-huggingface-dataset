# Phoonnx/vits-en_us-glados

## Resumen

`Phoonnx/vits-en_us-glados` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para la librería phoonnx. El modelo original fue desarrollado por el usuario rokeya71 (repositorio `rokeya71/VITS-Piper-GlaDOS-en-onnx`) y Phoonnx lo redistribuye como un voice pack listo para su uso con su librería de TTS basada en ONNX. El modelo reproduce la voz del personaje GlaDOS, la IA antagonista de la saga de videojuegos Portal.

El modelo está orientado exclusivamente al inglés estadounidense (`en-US`) y su front-end de texto se basa en fonemas generados por espeak-ng en alfabeto IPA. No es un modelo de lenguaje generativo: es un sintetizador acústico que convierte texto (previamente fonemizado) en audio. Su relevancia radica en que permite integrar una voz sintética concreta y característica en aplicaciones Python y en el ecosistema de asistentes de voz OVOS sin necesidad de infraestructura de GPU dedicada, dado su reducido tamaño (repo de 0,1 GB) y su formato ONNX.

El modelo se publicó en Hugging Face en noviembre de 2026 y acumula 28 descargas. La licencia declarada es MIT. No se dispone de información sobre el número de parámetros, el contexto de entrenamiento ni los datos utilizados, ya que la model card no los detalla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx (Python) / phoonnx.js (navegador) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial, entrenada de forma conjunta con pérdidas de reconstrucción, adversariales y de alineamiento monotónico. El modelo empaquetado es una conversión a ONNX del checkpoint original de rokeya71, pensada para inferencia en CPU y en navegador.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de hablantes ni si se aplicaron técnicas de ajuste fino adicionales. La model card solo indica la procedencia (repositorio upstream de rokeya71) y el pipeline de fonemización (espeak-ng vía `scriptconv`). La innovación destacable, a nivel de empaquetado, es la integración con phoonnx y phoonnx.js, que permite ejecutar la voz tanto en Python como en el navegador con entrada espeak o unicode.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemización de entrada mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Reproducción de la voz característica de GlaDOS (personaje de Portal).
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No soporta visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf` con la voz `piper_community/rokeya71/en-US_GlaDOS`, lo que permite dotar a un asistente doméstico de una voz concreta y reconocible sin GPU.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` de phoonnx se carga la voz y se generan archivos WAV en disco, adecuado para pipelines de generación de audio por lotes.
- Prototipado de interfaces conversacionales: al ser un modelo ONNX de 0,1 GB, se puede desplegar en entornos con recursos limitados para validar experiencias de voz antes de invertir en infraestructura mayor.
- Síntesis en el navegador: con phoonnx.js se puede reproducir la voz en una web (demo en tigregotico.pt/demo) sin backend de inferencia, útil para demos interactivas y contenido educativo.
- Contenido y modding relacionado con Portal: la voz GlaDOS permite generar locuciones para vídeos, podcasts o proyectos de fans, siempre respetando la licencia MIT y los derechos sobre el personaje.
- Pruebas de accesibilidad y lectura en voz alta: el modelo puede convertir texto en audio para aplicaciones de lectura asistida en inglés, con la salvedad de que la voz es un personaje concreto y no una voz neutra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, se espera que funcione en CPU sin GPU dedicada, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el diseño ONNX y el tamaño reducido sugieren que puede ejecutarse en CPU y en navegador.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-glados | VITS (ONNX) | en-US | ONNX | MIT | Hugging Face, phoonnx |
| rokeya71/VITS-Piper-GlaDOS-en-onnx | VITS (ONNX) | en-US | ONNX | MIT (según upstream) | Hugging Face |
| Otros modelos de la colección VITS de Phoonnx | VITS (ONNX) | variable | ONNX | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no hay soporte multilingüe.
- La entrada debe fonemizarse con espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No es un modelo de lenguaje: no razona, no genera código ni mantiene conversaciones; solo sintetiza audio a partir de texto.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas o nombres propios, dado que la fonemización depende de espeak-ng.
- La voz imita a un personaje de ficción (GlaDOS); su uso comercial puede estar sujeto a derechos sobre el personaje más allá de la licencia MIT del modelo.
- No se dispone de información sobre sesgos acústicos, calidad en distintos registros ni robustez ante texto ruidoso.
- La licencia MIT se declara en el repositorio upstream; conviene verificar los términos exactos antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-glados
- Repositorio upstream: https://huggingface.co/rokeya71/VITS-Piper-GlaDOS-en-onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
