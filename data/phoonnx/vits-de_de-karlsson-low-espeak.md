# Phoonnx/vits-de_de-karlsson-low-espeak

## Resumen

`vits-de_de-karlsson-low-espeak` es un modelo de síntesis de voz (text-to-speech) de tipo VITS para alemán de Alemania (`de-DE`), empaquetado por Phoonnx a partir del modelo original de Rhasspy publicado en el repositorio `rhasspy/piper-voices`. No se trata de un modelo entrenado por Phoonnx, sino de una redistribución en formato ONNX de una voz Piper de calidad "low" (baja), preparada para funcionar con la librería `phoonnx`, una implementación en Python de inferencia TTS orientada al ecosistema OVOS (Open Voice OS).

El modelo recibe fonemas generados por espeak-ng en alfabeto IPA y produce audio WAV. Su relevancia es acotada y práctica: ofrece una voz alemana ligera (repo de 0,1 GB) que puede ejecutarse en entornos con recursos limitados, integrarse en asistentes de voz domésticos o en pipelines de TTS embebidos. No es un modelo de propósito general ni compite con sistemas TTS neuronales de gran escala; es una pieza de infraestructura para despliegues de voz en local.

La información pública disponible es escasa: la model card se limita a describir el empaquetado, el front-end de texto y el uso mediante `phoonnx`, sin datos de entrenamiento, benchmarks ni especificaciones detalladas del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase, no por ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se desconoce si el checkpoint original usa cuantización int8) |
| Idiomas soportados | `de-DE` (alemán de Alemania) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Calidad declarada | "low" (voz Piper de baja calidad, según la ruta upstream) |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx (Python), con plugin `ovos-tts-plugin-phoonnx` |

## Arquitectura y entrenamiento

VITS es una arquitectura de TTS end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de un aligner monotónico para el alineamiento texto-audio. El resultado es un modelo que sintetiza波形 de audio directamente desde fonemas sin necesidad de un vocoder separado.

En este caso, el modelo no ha sido entrenado por Phoonnx: procede de `rhasspy/piper-voices/de/de_DE/karlsson/low`, la colección de voces Piper de Rhasspy. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de referencia ("karlsson") ni si se aplicaron técnicas de ajuste fino adicionales. La única innovación destacable del empaquetado es la integración con `scriptconv`, la librería de normalización y fonemización de Phoonnx, que convierte el texto en fonemas espeak-ng antes de la inferencia.

## Capacidades

- Síntesis de voz en alemán de Alemania (`de-DE`) a partir de texto plano.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemización basada en espeak-ng (alfabeto IPA); requiere espeak-ng instalado o el extra `phoonnx[espeak]` (port espyak).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al alemán; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz domésticos en local: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite dotar de voz alemana a un asistente sin depender de servicios en la nube, con un repo de solo 0,1 GB que cabe en dispositivos de gama baja.
- Lectura de notificaciones y alertas en alemán: útil en sistemas de domótica o monitoreo que necesitan anunciar estados por audio, donde la latencia y el coste importan más que la naturalidad de la voz.
- Accesibilidad para aplicaciones de escritorio: conversión de texto a voz para usuarios con discapacidad visual en entornos Linux, usando la API de Python de phoonnx y espeak-ng como dependencia del sistema.
- Síntesis en el navegador: mediante `phoonnx.js`, se puede ofrecer lectura de contenido web en alemán sin backend, aprovechando la demo pública como referencia de integración.
- Prototipado de pipelines TTS: al ser un modelo ONNX ligero con licencia MIT, sirve para validar arquitecturas de voz antes de migrar a voces de mayor calidad o a modelos comerciales.
- Generación de audio para pruebas automatizadas: en CI/CD de aplicaciones de voz, el modelo puede producir clips de referencia en alemán de forma determinista y sin coste por petición.
- Sistemas embebidos y edge computing: el tamaño reducido y el formato ONNX permiten desplegarlo en Raspberry Pi u otros dispositivos con recursos limitados, siempre que se instale espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0,1 GB) y la arquitectura VITS "low", es esperable que quepa en menos de 1 GB de memoria, aunque el dato no está confirmado en la documentación.
- GPU recomendadas: no se especifican. Por el perfil del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería sobrada; también es viable en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no hay cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y `phoonnx.js` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-karlsson-low-espeak (este) | VITS | de-DE | low | MIT | ONNX | Hugging Face, phoonnx |
| rhasspy/piper-voices de_DE/karlsson/low (upstream) | VITS | de-DE | low | MIT | Piper/ONNX | Hugging Face |
| Otras voces VITS de la colección Phoonnx | VITS | varios | variable | MIT (según upstream) | ONNX | Hugging Face |
| Otras voces Piper de Rhasspy para de-DE | VITS | de-DE | variable (low/medium/high) | MIT | Piper/ONNX | Hugging Face |

La comparativa se limita a variantes del mismo linaje (Piper/VITS empaquetadas para phoonnx), ya que no se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada. No hay cifras de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Calidad "low": la voz está etiquetada como de baja calidad en la ruta upstream, por lo que la naturalidad y prosodia serán limitadas frente a voces medium o high.
- Dependencia de espeak-ng: sin espeak-ng instalado, la fonemización falla o requiere el port espyak, que puede pronunciar mal algunas palabras según advierte la propia model card.
- Idioma único: solo alemán de Alemania; no hay soporte multilingüe ni cambio de idioma.
- Sin datos de entrenamiento: se desconoce el dataset, el hablante y las condiciones de grabación, lo que dificulta evaluar sesgos o cobertura léxica.
- Riesgo de pronunciación incorrecta en nombres propios, siglas y términos técnicos, inherente a la fonemización basada en reglas de espeak.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del checkpoint original de Rhasspy/Piper, ya que el empaquetado declara MIT basándose en la model card upstream.
- Sin benchmarks ni métricas objetivas (MOS, WER) publicadas; no se puede garantizar un rendimiento concreto en producción.
- Modelo de nicho con muy poca adopción (20 descargas, 0 likes en el momento de la consulta), lo que implica escaso soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-karlsson-low-espeak
- Upstream (Piper voices, de_DE/karlsson/low): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/karlsson/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
