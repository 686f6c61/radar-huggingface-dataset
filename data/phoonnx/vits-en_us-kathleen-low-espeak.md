# Phoonnx/vits-en_us-kathleen-low-espeak

## Resumen

`vits-en_us-kathleen-low-espeak` es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de Rhasspy, concretamente de la colección `piper-voices` en la variante `en_US/kathleen/low`, y se distribuye como un artefacto ONNX listo para inferencia con la librería `phoonnx` (Python y OVOS) o con `phoonnx.js` en el navegador.

El modelo resuelve la conversión de texto a voz para inglés estadounidense (`en-US`) con una voz femenina identificada como "kathleen" en calidad "low", lo que implica un tamaño reducido y una huella de almacenamiento de aproximadamente 0,1 GB. La entrada de texto no es texto plano directo, sino fonemas IPA generados mediante espeak-ng, lo que lo hace dependiente de un front-end fonemizador (la librería `scriptconv` en el ecosistema Phoonnx).

Su relevancia radica en su ligereza y en su integración con el stack de asistentes de voz de código abierto (OVOS/Mycroft), donde puede ejecutarse en entornos con recursos limitados. La licencia MIT facilita su uso comercial, aunque la calidad "low" y la dependencia de espeak-ng condicionan su idoneidad para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Upstream | rhasspy/piper-voices/en/en_US/kathleen/low |
| Autor original | Rhasspy |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujo normalizador y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado.

En este caso, el modelo es una reempaquetadura del checkpoint original de Rhasspy para la voz `en_US/kathleen` en calidad `low`, convertido a ONNX para su ejecución con `phoonnx`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente a TTS). La innovación destacable es el empaquetado multiplataforma: la misma voz puede ejecutarse en Python, en OVOS y en el navegador mediante `phoonnx.js`.

## Capacidades

- Síntesis de voz (text-to-speech) para inglés estadounidense a partir de fonemas IPA.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante `phoonnx.js` (demo en tigregotico.pt/demo).
- Normalización y conversión de texto a fonemas mediante `scriptconv` con el fonemizador `EspeakPhonemizer`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos generativos de texto.
- No soporta visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS/Mycroft: el modelo se integra como plugin de TTS configurando `ovos-tts-plugin-phoonnx` en `mycroft.conf`, lo que permite dotar de voz a asistentes domésticos de código abierto sin depender de servicios en la nube.
- Síntesis de voz en dispositivos de recursos limitados: con un repositorio de 0,1 GB y ejecución ONNX, es adecuado para Raspberry Pi u otros SBC donde modelos TTS más grandes no caben.
- Generación de avisos y notificaciones por voz: útil para sistemas de domótica o aplicaciones que necesitan leer mensajes cortos en inglés con baja latencia.
- Síntesis en el navegador: mediante `phoonnx.js`, permite generar voz del lado del cliente sin enviar texto a un servidor, lo que ayuda a la privacidad.
- Prototipado de pipelines TTS: sirve como voz de referencia ligera para validar integraciones con `phoonnx` y `scriptconv` antes de pasar a voces de mayor calidad.
- Accesibilidad: lectura de texto en pantalla para aplicaciones en inglés estadounidense donde el coste computacional es un factor crítico.
- Pruebas de regresión en CI: al ser un artefacto ONNX pequeño, puede incluirse en tests automatizados de síntesis de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) se infiere una huella de memoria muy reducida, apta para CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: sí, con amplio margen, dado su tamaño reducido; también en CPU y SBC.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` en OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-kathleen-low-espeak | VITS | en-US | low | MIT | ONNX | 0,1 GB |
| rhasspy/piper-voices (en_US/kathleen/low) | VITS | en-US | low | MIT | ONNX (upstream) | no disponible |
| Otras voces VITS de la colección Phoonnx | VITS | variable | variable | variable | ONNX | no disponible |

La comparativa se limita al upstream directo, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Calidad "low": la voz está etiquetada como de baja calidad, lo que puede traducirse en artefactos audibles y menor naturalidad.
- Dependencia de espeak-ng: el front-end requiere espeak-ng instalado; sin él, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren y pueden provocar pronunciaciones incorrectas.
- Solo inglés estadounidense: no soporta otros idiomas ni variantes regionales.
- Entrada basada en fonemas: no acepta texto plano directamente sin el pipeline de fonemización de `scriptconv`.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí puede producir pronunciaciones erróneas en palabras fuera del vocabulario o con fonemas no cubiertos.
- Sesgos: no se documentan sesgos específicos; al ser una voz sintética única, no representa diversidad de hablantes.
- Licencia MIT: permite uso comercial, pero conviene verificar la cadena de atribución al upstream de Rhasspy.
- Sin benchmarks publicados: no hay métricas objetivas de calidad (MOS, WER) en la información disponible.
- Repositorio con 0 descargas y 0 likes: ecosistema muy incipiente, con escaso soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kathleen-low-espeak
- Upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/kathleen/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
