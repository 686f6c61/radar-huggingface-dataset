# Phoonnx/vits-nl-pmk-low-gruut

## Resumen

vits-nl-pmk-low-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic 3 y empaquetado por Phoonnx en formato ONNX para su biblioteca de TTS homónima. El modelo sintetiza voz en neerlandés (`nl`) a partir de fonemas IPA generados por el fonemizador gruut, lo que lo integra en el ecosistema OVOS/Mycroft para asistentes de voz.

La relevancia de esta ficha es acotada: se trata de una conversión de un modelo preexistente, no de un entrenamiento nuevo, publicada con cero descargas y cero likes en el momento de la consulta. Su interés práctico reside en que permite ejecutar TTS neerlandés sobre ONNX Runtime dentro de un pipeline Python o como plugin de OVOS, sin depender del stack original de Mimic 3.

El repositorio ocupa aproximadamente 0,1 GB y no se han publicado detalles sobre el número de parámetros, la longitud de contexto (no aplica en TTS en el sentido de LLM) ni los datos de entrenamiento originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (modelo TTS end-to-end, empaquetado en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (el nombre "low" sugiere una variante de calidad reducida del upstream, sin detalle de precisión) |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (según la librería `phoonnx` y los tags del repo) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema TTS condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado junto con una pérdida de reconstrucción. VITS produce audio de forma directa desde fonemas sin necesidad de un vocoder separado en tiempo de inferencia, lo que reduce la latencia y simplifica el despliegue.

La entrada de texto no es texto crudo sino fonemas IPA generados por el fonemizador gruut a través de la librería `scriptconv` (extra `scriptconv[gruut]`). El modelo original fue entrenado por Mycroft AI y publicado en el repositorio `mimic3-voices` bajo la ruta `voices/nl/pmk_low`; Phoonnx únicamente lo ha convertido a ONNX y lo ha empaquetado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz en neerlandés a partir de texto, con salida en formato WAV.
- Fonemización de entrada mediante gruut (alfabeto IPA), lo que requiere el extra `scriptconv[gruut]`.
- Ejecución sobre ONNX Runtime a través de la librería `phoonnx` en Python.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable en `mycroft.conf`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo "thinking".
- Multilingüismo limitado al neerlandés; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en neerlandés sobre OVOS/Mycroft: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y se selecciona con la voz `mimic3/nl/pmk_low` en `mycroft.conf`, permitiendo respuestas habladas en un asistente doméstico autoalojado.
- Síntesis por lotes de contenido en neerlandés: mediante `voice.synthesize_wav(text, wav_file)` se pueden generar ficheros WAV para audiolibros, avisos o locuciones a partir de textos normalizados, aprovechando la ejecución ONNX sin dependencias pesadas.
- Lectura de notificaciones y alertas en aplicaciones neerlandófonas: al ser un modelo ligero (repo de 0,1 GB) y ejecutable en ONNX Runtime, encaja en servicios de backend que generan audio bajo demanda con baja huella de recursos.
- Accesibilidad para usuarios con discapacidad visual: conversión de texto de interfaz o documentos a voz en neerlandés dentro de aplicaciones de escritorio o web autoalojadas.
- Pruebas y prototipado de pipelines TTS: sirve como voz de referencia para validar la cadena `scriptconv` + `phoonnx` antes de sustituirla por voces de mayor calidad.
- Investigación comparativa sobre VITS y fonemización gruut: al estar empaquetado en ONNX con un front-end documentado, facilita reproducir experimentos de TTS neerlandés sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera un consumo muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; el modelo está empaquetado para ONNX Runtime y no requiere GPU dedicada.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño del artefacto, aunque no se aportan cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python) sobre ONNX Runtime; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-nl-pmk-low-gruut | VITS (ONNX) | nl | ONNX | CC-BY-SA-4.0 | Hugging Face, 0 descargas |
| Otras voces de `mimic3-voices` (upstream) | VITS | múltiples (incl. nl) | Mimic 3 | CC-BY-SA-4.0 (según upstream) | GitHub MycroftAI |
| Otras voces empaquetadas en la colección VITS de Phoonnx | VITS (ONNX) | varios | ONNX | variable por voz | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma (neerlandés); no sintetiza correctamente otros idiomas.
- Requiere el fonemizador gruut y el extra `scriptconv[gruut]`; sin él, la cadena de inferencia no funciona.
- La variante "low" del nombre sugiere una calidad de audio reducida respecto a otras voces del upstream, aunque no se detalla la diferencia.
- Riesgo de pronunciación incorrecta en palabras fuera de vocabulario, siglas o nombres propios, al depender de la fonemización automática.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para productos propietarios.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; no hay evidencia pública de calidad en producción.
- No se han publicado métricas objetivas (MOS, WER) ni detalles de entrenamiento que permitan evaluar sesgos o alucinaciones acústicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-pmk-low-gruut
- Upstream (Mycroft AI, voz nl/pmk_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/pmk_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
