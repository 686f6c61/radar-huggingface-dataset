# Phoonnx/vits-pt_br-edresson-low-espeak

## Resumen

`vits-pt_br-edresson-low-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la coleccion `piper-voices` (variante `pt/pt_BR/edresson/low`), y se distribuye en formato ONNX para su ejecucion en Python y en el ecosistema OVOS.

El modelo esta especializado en portugues de Brasil (`pt-BR`) y recibe como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto plano. Esta orientacion a fonemas lo hace dependiente de una etapa previa de fonemizacion que Phoonnx delega en su libreria `scriptconv`, y condiciona tanto su integracion como la calidad de la sintesis segun el fonemizador empleado.

Se trata de un modelo de voz "low", es decir, de tamano reducido y orientado a inferencia ligera, lo que lo hace adecuado para asistentes de voz locales, dispositivos con recursos limitados y pipelines de TTS en tiempo real. Su licencia MIT y su empaquetado ONNX facilitan el despliegue sin dependencias de frameworks pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" del modelo original) |
| Idiomas soportados | portugues de Brasil (`pt-BR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0.1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales, ademas de un modelado de duracion por alineamiento monotono. El modelo genera audio directamente a partir de fonemas, sin necesidad de un vocoder externo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o ajuste fino especifico en la informacion proporcionada. El modelo es una reempaquetado del checkpoint original de Rhasspy (`piper-voices/pt/pt_BR/edresson/low`), por lo que sus caracteristicas de entrenamiento corresponden a ese upstream. La innovacion destacable en este empaquetado es la conversion a ONNX y la integracion con el ecosistema phoonnx/scriptconv/OVOS, que permite ejecucion en Python y en navegador (phoonnx.js).

## Capacidades

- Sintesis de voz (text-to-speech) en portugues de Brasil a partir de fonemas espeak-ng.
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Integracion con OVOS como plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- Normalizacion y conversion de texto delegadas a `scriptconv` (fonemizador `EspeakPhonemizer`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de vision, audio de entrada ni modo "thinking".
- Capacidad multilingue limitada: solo `pt-BR`.

## Casos de uso

- Asistentes de voz locales en portugues de Brasil: el modelo puede integrarse en OVOS para sintetizar respuestas habladas en un asistente domestico, gracias a su tamano reducido (0.1 GB) y su ejecucion ONNX sin GPU dedicada.
- Lectura de notificaciones y alertas en dispositivos embebidos: al ser un modelo "low", cabe en dispositivos con recursos limitados y permite generar audio en tiempo real para mensajes cortos.
- Accesibilidad web: mediante phoonnx.js, se puede sintetizar texto en el navegador para lectores de pantalla o interfaces accesibles en portugues, sin depender de servicios en la nube.
- Generacion de audiolibros o podcasts automatizados en pt-BR: el modelo puede procesar lotes de texto fonemizado y generar WAVs para posterior post-procesado.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz pt-BR rapida para pruebas de UX pueden usar este modelo con `pip install --pre phoonnx` y espeak-ng.
- Integracion en pipelines de CI/CD para pruebas de regresion de TTS: el modelo permite validar la calidad de sintesis de forma automatizada en entornos sin GPU.
- Educacion y aprendizaje de idiomas: sintesis de frases en portugues para materiales didacticos, con la advertencia de que la calidad depende del fonemizador empleado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0.1 GB, es previsible que quepa en CPU y en GPUs de gama baja, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio, aunque no se confirma en la informacion.
- Opciones de despliegue: phoonnx (Python), OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a VITS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-pt_br-edresson-low-espeak (este) | VITS | pt-BR | MIT | ONNX | 0.1 GB |
| Otros modelos de la coleccion VITS de Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | no disponible |
| Modelos Piper originales (rhasspy/piper-voices) | VITS | varios | MIT | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks, MOS, latencia) en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo soporta portugues de Brasil (`pt-BR`); no es multilingue.
- La entrada debe ser fonemas espeak-ng en IPA; sin espeak-ng instalado, la sintesis falla o requiere el extra `phoonnx[espeak]`.
- Con el port espyak, algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Es un modelo "low": la calidad de voz es limitada en comparacion con modelos de mayor tamano.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica a TTS en el sentido habitual) ni evaluaciones de calidad subjetiva.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del upstream `rhasspy/piper-voices` para el checkpoint original.
- No apto para tareas de generacion de texto, razonamiento, codigo o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-edresson-low-espeak
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/edresson/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
