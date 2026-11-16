# Phoonnx/vits-sw_cd-lanfrica-medium-espeak

## Resumen

vits-sw_cd-lanfrica-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la colección piper-voices, en la ruta `sw/sw_CD/lanfrica/medium`, y ha sido reempaquetado para su uso con la librería phoonnx, que lo ejecuta tanto en Python como en el ecosistema OVOS.

Se trata de un modelo específico para suajili de la República Democrática del Congo (`sw-CD`), con entrada de texto convertida a fonemas mediante espeak-ng en alfabeto IPA. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato ONNX, lo que facilita su despliegue en entornos de inferencia ligeros sin necesidad de frameworks de deep learning pesados.

Su relevancia radica en cubrir una lengua de bajos recursos (suajili congoleño) dentro de un ecosistema de voces Piper reutilizables, con licencia MIT y una integración directa en asistentes de voz open source como OVOS/Mycroft. No es un modelo de propósito general: es una voz concreta de un pipeline TTS, sin capacidades de razonamiento, generación de texto ni visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | suajili congoleño (`sw-CD`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado. En este caso, la entrada de texto se procesa mediante el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que produce fonemas en alfabeto IPA a partir de espeak-ng.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices; Phoonnx se limita a reempaquetarlo para su librería. La variante "medium" hace referencia al tamaño del checkpoint dentro de la jerarquía de Piper (low/medium/high), aunque no se especifican parámetros exactos.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en suajili congoleño (`sw-CD`).
- Conversión de texto a fonemas IPA mediante espeak-ng para la entrada del modelo.
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integración como plugin TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad monolingüe: únicamente `sw-CD`.

## Casos de uso

- Asistentes de voz open source en OVOS/Mycroft: el modelo se configura como módulo TTS en `mycroft.conf` y permite dotar de voz en suajili congoleño a un asistente doméstico sin depender de servicios en la nube.
- Lectura de textos y noticias en suajili: integrable en pipelines de conversión de texto a audio para accesibilidad o consumo de contenido escrito en `sw-CD`.
- Sistemas de anuncios y avisos automatizados: generación de locuciones pregrabadas o dinámicas para aplicaciones de transporte, comercio o administración en regiones de habla suajili.
- Aplicaciones educativas de aprendizaje de idiomas: producción de audio de referencia para materiales de suajili congoleño con una voz entrenada nativa del locale.
- Interfaces de voz en dispositivos de bajo consumo: al distribuirse en ONNX y ocupar ~0,1 GB, puede ejecutarse en hardware modesto (Raspberry Pi, mini-PC) mediante phoonnx sin GPU dedicada.
- Prototipado de agentes conversacionales locales: combinación con un LLM local para construir un pipeline de voz completo (ASR + LLM + TTS) en entornos sin conectividad.
- Investigación en TTS de bajos recursos: punto de partida para fine-tuning o evaluación de voces Piper en lenguas africanas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) es plausible su ejecución en CPU, aunque el dato exacto no se especifica.
- GPU recomendadas: no disponible. Al ser un modelo VITS de tamaño medio en ONNX, no requiere GPU dedicada para inferencia en tiempo real en la mayoría de escenarios.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el formato ONNX permite ejecución en CPU y en GPUs modestas.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-sw_cd-lanfrica-medium-espeak (este modelo) | VITS | sw-CD | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper de piper-voices | VITS | múltiples (según voz) | MIT (según voz) | ONNX | Hugging Face (Rhasspy) |
| Modelos TTS multilingües tipo MMS-TTS | VITS / otros | multilingüe | según modelo | varios | Hugging Face (Meta) |
| Coqui TTS (voces comunitarias) | VITS / Tacotron | múltiples | según voz | varios | Coqui / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: solo cubre `sw-CD`; no es adecuado para otros idiomas ni variantes del suajili sin reentrenamiento.
- Dependencia de espeak-ng: si se usa el port espyak, algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal ciertas palabras.
- Sin datos de sesgos, alucinación o robustez: no se han publicado evaluaciones de calidad (MOS) ni de sesgos en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia declarada en el repositorio upstream `rhasspy/piper-voices` para la voz concreta.
- Sin garantías de calidad en producción: al tratarse de un reempaquetado de una voz Piper "medium", la naturalidad y prosodia pueden ser limitadas frente a modelos TTS comerciales.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación muy reducido; no hay evidencia comunitaria de uso en producción.
- No apto para tareas de NLP: no genera texto, no razona, no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sw_cd-lanfrica-medium-espeak
- Upstream (Rhasspy piper-voices, voz sw_CD lanfrica medium): https://huggingface.co/rhasspy/piper-voices/tree/main/sw/sw_CD/lanfrica/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
