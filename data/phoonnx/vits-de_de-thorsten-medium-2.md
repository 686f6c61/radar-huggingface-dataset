# Phoonnx/vits-de_de-thorsten-medium

## Resumen

`vits-de_de-thorsten-medium` es un modelo de síntesis de voz (text-to-speech) en alemán empaquetado por Phoonnx a partir de los pesos originales de Rhasspy Piper (`de_DE/thorsten/medium`). No es un modelo entrenado desde cero por Phoonnx, sino una redistribución en formato ONNX del conocido checkpoint de Piper, lista para consumirse con la librería `phoonnx` y con el ecosistema OVOS/Mycroft.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un diseño end-to-end que combina un codificador de texto, un prior variacional, un decoder generativo y discriminadores adversariales para producir audio de forma directa desde fonemas. La variante "medium" de Piper prioriza un equilibrio entre calidad y velocidad, lo que la hace adecuada para asistentes de voz y sistemas embebidos.

Su relevancia actual radica en que ofrece una voz alemana funcional, con licencia MIT y un tamaño de repositorio de apenas 0,1 GB, dentro de un ecosistema (phoonnx) que unifica la ejecución de voces VITS en Python, en el navegador (phoonnx.js) y en asistentes domésticos vía OVOS. La entrada de texto se realiza mediante fonemas espeak-ng en alfabeto IPA, lo que exige una etapa de fonemización previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con aprendizaje adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto fonemizado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Upstream | `rhasspy/piper-voices/de/de_DE/thorsten/medium` |
| Autoria original | Rhasspy |
| Tamano del repo | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que integra en un único modelo un codificador de texto, un prior variacional condicionado por texto, un decoder generativo (normalmente basado en flujos y un vocoder neuronal) y un discriminador adversarial multiperiodo. Este diseño elimina la necesidad de pipelines separados de alineamiento y vocoder, y permite entrenar con alineamientos monotónicos inferidos de forma latente. La variante "medium" de Piper corresponde a un compromiso entre fidelidad acústica y coste computacional, pensado para inferencia rápida en CPU.

El modelo original fue entrenado por Rhasspy dentro del proyecto Piper, que entrena voces VITS sobre corpus de voz abiertos. El dataset concreto, el número de tokens o pasos de entrenamiento, y si se aplicaron técnicas de RLHF/DPO no están documentados en la información disponible. La model card de Phoonnx no aporta detalles sobre datos de entrenamiento ni sobre innovaciones técnicas más allá de la propia arquitectura VITS y del front-end de fonemización (espeak-ng vía `scriptconv`).

## Capacidades

- Síntesis de voz en alemán (`de-DE`) a partir de texto.
- Generación de audio en formato WAV mediante `voice.synthesize_wav()`.
- Fonemización de entrada mediante espeak-ng (o el port espyak incluido en `phoonnx[espeak]`).
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- Normalización y conversión de texto previa mediante `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos: integrado en OVOS/Mycroft como módulo TTS, permite que un asistente responda en alemán con latencia baja gracias al tamaño reducido (0,1 GB) y a la arquitectura VITS optimizada para CPU.
- Lectura de notificaciones y alertas: el modelo puede sintetizar mensajes cortos en alemán para sistemas de domótica, wearables o paneles informativos donde no se requiere un vocoder de gran tamaño.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en entornos germanoparlantes.
- Síntesis en el navegador: mediante phoonnx.js, se puede generar voz alemana en el cliente sin enviar texto a un servidor, útil en aplicaciones web con requisitos de privacidad.
- Generación de audiolibros o contenido narrado: para locuciones de texto largo en alemán donde la calidad "medium" es suficiente y se prioriza el throughput en CPU.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño con licencia MIT, sirve como base para validar integraciones de fonemización, normalización y reproducción antes de escalar a voces de mayor calidad.
- Sistemas embebidos y edge computing: su reducido tamaño permite desplegarlo en dispositivos con recursos limitados (Raspberry Pi, etc.) sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No se documenta, pero por tamaño (0,1 GB) es plausible que sí; sin confirmación oficial.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-de_de-thorsten-medium` | VITS | de-DE | MIT | ONNX | 0,1 GB | Empaquetado para phoonnx |
| `rhasspy/piper-voices` (de_DE/thorsten/medium) | VITS | de-DE | MIT | ONNX (Piper) | Similar | Upstream original; requiere Piper en lugar de phoonnx |
| Otras voces VITS de la colección Phoonnx | VITS | varios | MIT (según upstream) | ONNX | Variable | Mismo pipeline de ejecución |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta alemán (`de-DE`); no es multilingüe.
- Requiere fonemización previa con espeak-ng; si se usa espyak, algunos fonemas difieren y pueden producir palabras mal pronunciadas, según advierte la model card.
- La calidad es "medium"; no está pensada para locuciones de alta fidelidad.
- No se documentan sesgos conocidos del modelo ni del corpus de entrenamiento original.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede haber errores de pronunciación ante texto no normalizado o fuera de dominio.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia del upstream (`rhasspy/piper-voices`) y de los datos de entrenamiento originales.
- No se documentan limitaciones de longitud de entrada; en TTS VITS la entrada suele procesarse por fragmentos, pero no se especifica en la información disponible.
- Dependencia de `phoonnx` en versión pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten-medium
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
