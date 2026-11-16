# Phoonnx/vits-en_us-lessac-medium-espeak

## Resumen

`vits-en_us-lessac-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo toma texto en inglés estadounidense, lo convierte en fonemas mediante espeak-ng y genera audio de voz de calidad media. Su propósito es ofrecer una voz TTS ligera, ejecutable localmente y sin dependencias de servicios en la nube.

El modelo se distribuye en formato ONNX dentro de un repositorio de apenas 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados, asistentes de voz embebidos y sistemas domésticos como OVOS. La voz concreta es `en_US-lessac-medium`, una de las voces estándar del ecosistema Piper, con licencia MIT.

Su relevancia actual radica en que forma parte de un ecosistema de TTS open source orientado a la inferencia local: el paquete `phoonnx` proporciona la capa de ejecución en Python y OVOS, mientras que `phoonnx.js` permite ejecutar estas mismas voces VITS en el navegador. No es un modelo de propósito general ni un LLM, sino un componente especializado de un pipeline de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (se distribuye en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. El modelo original fue entrenado por Rhasspy dentro del proyecto Piper, del que este repositorio es un empaquetado para `phoonnx`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o ajuste fino adicional. La innovación técnica relevante en este empaquetado es la integración del front-end fonético: el texto se normaliza y convierte a fonemas mediante `scriptconv` (concretamente `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`), que requiere espeak-ng instalado o el extra `phoonnx[espeak]`. El modelo opera sobre fonemas IPA, no sobre texto crudo, lo que condiciona su uso.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Conversión de texto a fonemas IPA vía espeak-ng a través de `scriptconv`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/en_US-lessac-medium` en `mycroft.conf`, proporcionando respuestas habladas locales sin enviar texto a servicios externos.
- Síntesis de voz en dispositivos embebidos y de bajos recursos: el repositorio de 0,1 GB en ONNX permite ejecutar la inferencia en hardware modesto, ideal para Raspberry Pi u otros SBC en domótica.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: mediante la API de Python de `phoonnx`, se puede generar un WAV con el texto de la alerta y reproducirlo, con latencia baja al no depender de red.
- Generación de audio para prototipos de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de voz en inglés, usando el front-end espeak-ng ya integrado.
- Síntesis en el navegador para demos web: con `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede integrar TTS en una página sin backend, aceptando entrada espeak o unicode.
- Pruebas de pipelines TTS y evaluación de voces Piper: al ser un empaquetado estandarizado, sirve para comparar voces del ecosistema VITS de Phoonnx dentro de un mismo runtime.
- Generación de locuciones para contenido en inglés en flujos automatizados: creación de archivos WAV por lotes a partir de guiones, aprovechando que la licencia MIT permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) se trata de un modelo muy ligero, apto para CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no disponible; no se documenta requisito de GPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS VITS).
- Latencia y throughput: no disponibles en la información proporcionada.
- Dependencia adicional: espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `vits-en_us-lessac-medium-espeak` (este) | VITS | en-US | ONNX | MIT | Empaquetado para phoonnx, entrada por fonemas espeak |
| Otras voces Piper `en_US-lessac-medium` (upstream Rhasspy) | VITS | en-US | ONNX | MIT | Mismo modelo subyacente, sin empaquetado phoonnx |
| Otras voces de la colección VITS de Phoonnx | VITS | variable | ONNX | variable (según upstream) | Mismo runtime phoonnx, distinta voz o idioma |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros sistemas TTS (por ejemplo, Coqui TTS, Bark o XTTS) ni de sus especificaciones, por lo que la comparativa se limita al ecosistema Piper/Phoonnx.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Requiere espeak-ng para la fonemización; sin él, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren y pueden provocar errores de pronunciación en algunas palabras.
- El modelo espera fonemas IPA como entrada, no texto crudo; el pipeline de normalización recae en `scriptconv`.
- No es un LLM: no realiza razonamiento, tool calling, generación de código ni tareas de texto.
- No se han publicado métricas objetivas de calidad de voz (MOS, WER) en la información disponible.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir pronunciaciones incorrectas ante fonemas mal formados o texto fuera de dominio.
- Sesgos: no documentados en la información proporcionada; al ser una voz sintética entrenada con datos de habla, podría reflejar sesgos acústicos del corpus original de Piper, no especificados.
- Licencia MIT declarada por el upstream (`rhasspy/piper-voices`), lo que permite uso comercial; conviene verificar la model card original para confirmar términos.
- El repositorio tiene pocas descargas (20) y ningún like, lo que sugiere escasa validación comunitaria; conviene probarlo antes de adoptarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-lessac-medium-espeak
- Upstream Piper (voz lessac medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
