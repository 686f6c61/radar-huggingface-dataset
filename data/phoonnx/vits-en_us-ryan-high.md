# Phoonnx/vits-en_us-ryan-high

## Resumen

`vits-en_us-ryan-high` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la colección `piper-voices`, en la variante `en_US/ryan/high`, y Phoonnx lo ha reempaquetado en formato ONNX para ejecutarlo con su librería `phoonnx` (tanto en Python como en el ecosistema OVOS). Se trata, por tanto, de una voz inglesa estadounidense de calidad "high" dentro de la familia Piper.

El modelo resuelve el problema de la síntesis de voz local y ligera: al estar en formato ONNX y ocupar apenas 0,1 GB en el repositorio, está pensado para ejecutarse en entornos con recursos limitados (incluido el navegador mediante `phoonnx.js`) sin depender de servicios en la nube. Su relevancia ahora radica en la creciente demanda de TTS embebido y privado para asistentes domésticos, sistemas OVOS/Mycroft y aplicaciones web.

La entrada de texto se realiza mediante fonemas espeak (alfabeto IPA), generados por espeak-ng o por el port `espyak` que Phoonnx puede instalar como extra. El modelo solo soporta inglés estadounidense (`en-US`) y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repositorio ocupa 0,1 GB) |
| Idiomas soportados | en (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Autor upstream | Rhasspy |
| Libreria | phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un encoder de texto, un decoder acoplado a normalizing flows y un discriminador adversario durante el entrenamiento, junto con alineamiento monotónico variacional. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente a TTS). El modelo es una voz Piper de calidad "high" del hablante `ryan` en inglés estadounidense, distribuida originalmente por Rhasspy. La innovación relevante en este empaquetado es la conversión a ONNX para ejecución ligera multiplataforma (Python, OVOS y navegador vía `phoonnx.js`).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés estadounidense.
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemización de entrada mediante espeak-ng (`EspeakPhonemizer` de `scriptconv`), con alfabeto IPA.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (voces VITS con entrada espeak o unicode).
- Normalización y conversión de texto mediante la librería `scriptconv`.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso (no aplica a un modelo TTS).
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz domésticos (OVOS/Mycroft): el modelo se integra como plugin TTS seleccionando la voz `piper/en_US-ryan-high` en `mycroft.conf`, permitiendo respuestas habladas locales sin enviar texto a servicios externos.
- Síntesis de voz embebida en dispositivos de bajos recursos: al ocupar 0,1 GB en ONNX, puede desplegarse en Raspberry Pi o dispositivos edge para locución de notificaciones y alertas.
- Aplicaciones web con TTS en el navegador: mediante `phoonnx.js` y el demo en `tigregotico.pt/demo`, se puede generar voz en cliente sin backend, útil para lectores de texto o accesibilidad.
- Generación de audios para pipelines de contenido: conversión de guiones en inglés a WAV para podcasts, vídeos o narraciones automatizadas, con procesamiento por frases.
- Prototipado de interfaces conversacionales: permite iterar rápidamente sobre diálogos en inglés con una voz de calidad "high" y licencia MIT, sin costes de API.
- Sistemas de accesibilidad: lectura en voz alta de texto en inglés para personas con discapacidad visual, ejecutándose localmente para preservar la privacidad.
- Pruebas de integración TTS en CI: al ser un artefacto ONNX pequeño y determinista en formato, puede usarse en tests automatizados de pipelines de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras exactas; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida y apta para CPU.
- GPU recomendadas: no se especifican; al ser ONNX ligero, funciona en CPU y en GPUs consumer de gama baja.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos cientos de MB de memoria libre; no se dispone de cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp ni TGI (no aplicables a TTS VITS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-ryan-high (este) | VITS | en-US | ONNX | MIT | fonemas espeak (IPA) | Hugging Face (Phoonnx) |
| Otras voces Piper `en_US` (p. ej. variantes de rhasspy/piper-voices) | VITS | en-US | ONNX | MIT (segun upstream) | fonemas espeak | Hugging Face (Rhasspy) |
| Voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | MIT (segun upstream) | fonemas espeak | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Requiere espeak-ng instalado para la fonemización; con el port `espyak` algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Es un modelo TTS: no realiza generación de texto, razonamiento, código ni tool calling.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento o nombres propios; no se documentan sesgos específicos.
- No se han publicado métricas de calidad (MOS) ni benchmarks en la información disponible.
- La licencia MIT se declara en el model card upstream de `rhasspy/piper-voices`; conviene verificar los términos del proyecto original antes de uso comercial a gran escala.
- El repositorio es pequeño (0,1 GB) y las descargas registradas son bajas (33), lo que implica poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ryan-high
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
