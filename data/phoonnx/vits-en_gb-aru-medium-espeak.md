# Phoonnx/vits-en_gb-aru-medium-espeak

## Resumen

vits-en_gb-aru-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio a partir de texto en inglés británico (en-GB) y constituye una de las voces de la colección VITS que Phoonnx distribuye para su ecosistema, que incluye integración con OVOS (Open Voice OS) y ejecución en navegador mediante phoonnx.js.

La relevancia de este modelo radica en su formato: los pesos se distribuyen como ONNX, lo que permite inferencia ligera y portable sin depender de frameworks de deep learning pesados. El modelo no recibe texto crudo, sino fonemas en alfabeto IPA generados por espeak-ng, lo que lo hace dependiente de un front-end fonemizador externo. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos TTS ligeros aptos para dispositivos de recursos limitados.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que ya trabajan dentro del ecosistema Phoonnx/OVOS o que necesitan una voz en-GB concreta con licencia MIT para integrarla en asistentes de voz o aplicaciones de síntesis embebida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | ingles britanico (en-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end para síntesis de voz que combina un encoder de texto, un prior y posterior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotónico latente. Este diseño permite generar waveforms directamente desde fonemas sin un vocoder separado en la inferencia. El modelo concreto es la voz `en_GB/aru/medium` del repositorio `rhasspy/piper-voices`, reempaquetada por Phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la model card. La innovación destacable en este empaquetado es la integración del front-end de fonemización: el texto se normaliza y convierte a fonemas IPA mediante `scriptconv` con el fonemizador `EspeakPhonemizer` de espeak-ng, y esos fonemas son la entrada real del modelo. Existe una variante con el port espyak de espeak-ng, aunque la propia model card advierte que algunos fonemas difieren y pueden producir pronunciaciones incorrectas.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico (en-GB), con salida en formato WAV.
- Entrada basada en fonemas IPA generados por espeak-ng, no en texto crudo.
- Ejecución mediante inferencia ONNX con la librería phoonnx en Python.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Normalización y conversión de texto delegadas a scriptconv.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un modelo TTS.
- No dispone de capacidades de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en inglés británico en un asistente doméstico local.
- Síntesis de voz en dispositivos de recursos limitados: al distribuirse en ONNX con un repo de ~0,1 GB, puede ejecutarse en Raspberry Pi u otros SBC sin GPU dedicada, algo habitual en proyectos de domótica con OVOS.
- Generación de audiolibros o avisos pregrabados en en-GB: se puede invocar `voice.synthesize_wav(text, wav_file)` desde un script Python para producir ficheros WAV por lotes a partir de textos normalizados.
- Síntesis en aplicaciones web: phoonnx.js permite ejecutar la voz en el navegador con un demo público, útil para lectores de pantalla o interfaces accesibles sin backend de inferencia.
- Prototipado de pipelines TTS multilingües: sirve como una voz concreta dentro de una colección mayor de voces VITS de Phoonnx, permitiendo comparar calidades y latencias entre idiomas antes de fijar una voz de producción.
- Pruebas de integración de front-end fonemizador: útil para validar el pipeline scriptconv + espeak-ng frente a espyak y detectar discrepancias de pronunciación en un idioma concreto.
- Sistemas de anuncios automáticos en inglés británico: integrable en scripts de automatización que generen mensajes hablados con pronunciación consistente en en-GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (~0,1 GB) es un modelo ligero que probablemente opera en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; al ser un modelo VITS pequeño en ONNX, no requiere GPU de datacenter (A100, H100) ni se documenta soporte específico para RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Dependencia externa: requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_gb-aru-medium-espeak (este) | VITS | en-GB | ONNX | MIT | Hugging Face, 0 descargas |
| Otras voces de rhasspy/piper-voices | VITS | múltiples | ONNX | MIT (según upstream) | Hugging Face, ampliamente usadas |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | ONNX | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas voces en la información proporcionada; la comparación se limita a arquitectura, idioma, formato y licencia.

## Limitaciones y advertencias

- Dependencia crítica de espeak-ng: sin él, el modelo no puede fonemizar correctamente; con el port espyak algunas palabras pueden pronunciarse mal por diferencias de fonemas.
- Solo soporta inglés británico (en-GB); no es multilingüe.
- No acepta texto crudo como entrada: requiere el pipeline de normalización y fonemización de scriptconv.
- Riesgo de pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento, nombres propios y siglas, dado el front-end basado en reglas de espeak.
- No hay información publicada sobre sesgos del dataset de entrenamiento ni sobre calidad subjetiva (MOS) de la voz.
- Licencia MIT declarada por el upstream, lo que en principio permite uso comercial, pero conviene verificar la cadena de licencias de rhasspy/piper-voices antes de producción.
- Modelo con cero descargas y cero likes: ecosistema y soporte comunitario muy limitados.
- No apto para tareas de razonamiento, código, matemáticas ni agentes; cualquier uso fuera de TTS es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-aru-medium-espeak
- Upstream (Piper voices, voz en_GB/aru/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/aru/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
