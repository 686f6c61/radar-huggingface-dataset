# Phoonnx/vits-nl_nl-ronnie-medium-espeak

## Resumen

`vits-nl_nl-ronnie-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en neerlandés de los Países Bajos (`nl-NL`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer TTS local, ligero y determinista para asistentes de voz y aplicaciones embebidas.

El modelo no es un LLM ni un modelo generativo de texto: es un sintetizador neuronal de voz de tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB, lo que incluye los pesos en formato ONNX). Su relevancia radica en que permite ejecutar TTS de calidad aceptable en CPU y en dispositivos de bajos recursos, sin depender de servicios en la nube, y en que se integra directamente en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. No se han publicado parámetros totales, longitud de contexto ni resultados de benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (síntesis de voz neuronal end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | neerlandés de los Países Bajos (`nl-NL`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Autor original | Rhasspy (upstream: `rhasspy/piper-voices`) |
| Empaquetado | Phoonnx |
| Librería de inferencia | phoonnx (`pip install --pre phoonnx`) |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. El modelo produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. En este caso concreto, el modelo procede de la colección `piper-voices` de Rhasspy, en la variante `nl_NL/ronnie/medium`, y Phoonnx lo ha reempaquetado en ONNX para su ejecución con su propia librería.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS. La model card tampoco detalla la duración del audio de entrenamiento ni el hablante de referencia (el identificador "ronnie" sugiere una voz concreta del corpus Piper, pero no se aportan más datos).

## Capacidades

- Síntesis de voz a partir de texto en neerlandés (`nl-NL`), con salida en formato WAV.
- Conversión de texto a fonemas mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, con normalización y conversión de script previas a cargo de `scriptconv`.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de servicios externos.
- Integración con OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js`, con demo en vivo en `tigregotico.pt/demo`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.
- No es multilingüe: está entrenado únicamente para neerlandés de los Países Bajos.

## Casos de uso

- Asistentes de voz locales para hogar: el modelo se integra en OVOS/Mycroft como motor TTS y permite que un asistente doméstico responda en neerlandés sin enviar texto a la nube, gracias a su ejecución ONNX en CPU.
- Lectura de notificaciones y alertas: aplicaciones de domótica o monitorización pueden sintetizar mensajes cortos en neerlandés con baja latencia, ya que VITS genera audio de forma directa sin vocoder separado.
- Accesibilidad para personas con discapacidad visual: lectura de textos en neerlandés en pantalla mediante un pipeline `scriptconv` + `phoonnx` que normaliza el texto y lo convierte a fonemas espeak antes de sintetizar.
- Sistemas de anuncios en transporte público o comercios: generación de avisos pregrabados o dinámicos en neerlandés para megafonía local, con despliegue en hardware de bajos recursos.
- Prototipado de interfaces conversacionales: equipos que desarrollan en neerlandés pueden validar flujos de voz completos (ASR + NLU + TTS) usando esta voz como componente de salida mientras el resto del sistema está en desarrollo.
- Aplicaciones de aprendizaje de idiomas: generación de pronunciaciones de referencia en neerlandés a partir de texto, útil para materiales didácticos o ejercicios de escucha.
- Despliegue en navegador: mediante `phoonnx.js`, se puede ofrecer síntesis de voz en neerlandés dentro de una aplicación web sin backend, usando la demo como referencia de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de ~0,1 GB de repositorio, se espera que quepa en memoria de CPU sin necesidad de GPU dedicada, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible. El modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en GPU consumer? No se documenta, pero por tamaño es plausible en cualquier GPU consumer; no hay confirmación oficial.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft) y `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponible.
- Dependencia adicional: es necesario instalar `espeak-ng` en el sistema (por ejemplo `apt install espeak-ng`) o la extra `phoonnx[espeak]`, que incluye el port espyak de espeak-ng. La model card advierte que algunos fonemas de espyak difieren de los de espeak-ng y que la voz puede pronunciar mal algunas palabras con espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-nl_nl-ronnie-medium-espeak` | VITS | nl-NL | MIT | ONNX | Hugging Face (Phoonnx) |
| `rhasspy/piper-voices` (nl_NL/ronnie/medium) | VITS | nl-NL | MIT | Piper/ONNX | Hugging Face (Rhasspy) |
| Otras voces VITS empaquetadas por Phoonnx | VITS | varios | MIT (según upstream) | ONNX | Colección VITS de Phoonnx |

La comparativa se limita al ecosistema Piper/Phoonnx porque no se dispone de datos de rendimiento de alternativas como Coqui TTS, XTTS o Bark en la información proporcionada. No se dispone de métricas objetivas (MOS, RTF) para comparar.

## Limitaciones y advertencias

- El modelo solo sintetiza neerlandés de los Países Bajos (`nl-NL`); no admite otros idiomas ni variantes regionales.
- La entrada debe ser texto en neerlandés que `scriptconv` convierta correctamente a fonemas espeak; texto con abreviaturas, símbolos o idiomas mezclados puede producir pronunciaciones incorrectas.
- La dependencia de espeak-ng es crítica: sin él, la síntesis falla; con espyak, algunas palabras pueden pronunciarse mal según advierte la model card.
- No se documentan sesgos del hablante ni características del corpus de entrenamiento (género, acento, edad), por lo que no se puede evaluar la representatividad de la voz.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de artefactos acústicos o prosodia incorrecta en textos largos o con puntuación atípica.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del upstream (`rhasspy/piper-voices`) y de espeak-ng, que puede tener sus propias condiciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un empaquetado reciente y sin validación comunitaria amplia.
- No se documentan límites de longitud de texto por síntesis; textos muy largos probablemente deban dividirse en fragmentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-ronnie-medium-espeak
- Upstream (Rhasspy Piper voices, nl_NL/ronnie/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_NL/ronnie/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
