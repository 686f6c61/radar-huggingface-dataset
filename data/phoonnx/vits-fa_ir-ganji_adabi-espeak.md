# Phoonnx/vits-fa_ir-ganji_adabi-espeak

## Resumen

`vits-fa_ir-ganji_adabi-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por SadeghK y empaquetado por Phoonnx para su librería de inferencia ONNX `phoonnx`. El modelo convierte texto en persa (`fa-IR`) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. El repositorio de Hugging Face tiene un tamaño de 0,1 GB y está orientado a inferencia ligera en CPU o GPU de gama baja.

El modelo resuelve el problema de dotar de voz a aplicaciones en persa dentro del ecosistema OVOS (Open Voice OS), mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que ofrece una alternativa libre (licencia Apache 2.0) y de pequeño tamaño para TTS en una lengua con relativamente pocos recursos abiertos, y en que su empaquetado ONNX facilita el despliegue sin dependencias pesadas de frameworks de deep learning.

La información disponible es limitada: no se publican detalles sobre el número de parámetros, el conjunto de entrenamiento ni métricas de calidad. La model card se centra en el uso práctico a través de `phoonnx` y en la cadena de procesamiento de texto (normalización con `scriptconv` y fonemización con espeak-ng).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | persa (`fa`, `fa-IR`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de alineamiento monotónico. Permite generar audio de forma directa desde fonemas sin necesidad de un vocoder externo, lo que explica su popularidad en despliegues ligeros. El modelo empaquetado aquí es una conversión a ONNX del modelo original de SadeghK alojado en `SadeghK/persian-text-to-speech/farsi/ganji-adabi`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, la duración total de audio, el hablante o hablantes utilizados, ni sobre si se aplicaron técnicas de ajuste fino o RLHF. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de VITS. La cadena de procesamiento de texto utiliza `scriptconv` con el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema.

## Capacidades

- Síntesis de voz a partir de texto en persa (`fa-IR`), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng; el modelo espera fonemas como entrada, no texto crudo.
- Normalización y conversión de script del texto de entrada a través de `scriptconv`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en el navegador mediante `phoonnx.js`, con entrada por espeak o Unicode.
- Inferencia ONNX, apta para CPU sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en persa sobre OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en `fa-IR` con una latencia adecuada para interacción conversacional.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domótica: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en dispositivos de bajos recursos y sintetizar frases cortas bajo demanda.
- Accesibilidad para personas con discapacidad visual: lectura de texto en pantalla en persa, integrable en lectores de pantalla o pipelines de conversión de documentos a audio.
- Generación de audiolibros o contenido narrado por lotes: el modelo permite sintetizar frases de forma secuencial y guardar los WAV resultantes, aunque no se documenta la calidad prosódica en textos largos.
- Pruebas de integración en pipelines de CI/CD para aplicaciones de voz: al ser un modelo pequeño y con licencia permisiva, se puede incluir en tests automatizados que verifiquen la generación de audio sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales en persa: desarrolladores que necesiten una voz de referencia rápida para demos o validación de producto pueden desplegarlo con `pip install --pre phoonnx` y espeak-ng.
- Ejecución en el navegador mediante `phoonnx.js`: permite añadir síntesis de voz en persa a aplicaciones web sin backend, con la demo disponible en `tigregotico.pt/demo`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU sin GPU dedicada, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, cualquier GPU consumer (por ejemplo, GTX 1060 o superior) debería ser suficiente, aunque no hay confirmación del autor.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo; sin datos oficiales de consumo de memoria.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fa_ir-ganji_adabi-espeak` | VITS | Persa (`fa-IR`) | Apache 2.0 | ONNX | 0,1 GB | Empaquetado para phoonnx; entrada por fonemas espeak |
| `SadeghK/persian-text-to-speech` (upstream) | VITS | Persa | Apache 2.0 | no disponible en la informacion | no disponible | Modelo original del que deriva este empaquetado |
| Otros modelos VITS de la coleccion Phoonnx | VITS | Varios | Apache 2.0 (segun coleccion) | ONNX | variable | Misma libreria de inferencia y cadena de fonemizacion |
| Modelos TTS multilingues de gran tamano (por ejemplo, XTTS) | no disponible | Multiples | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan parámetros, datos de entrenamiento ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de pronunciación incorrecta: la model card advierte que, si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Dependencia de espeak-ng: sin este programa instalado, el modelo no puede procesar texto correctamente; la entrada debe ser fonemas IPA, no texto crudo.
- Cobertura limitada a un solo idioma (`fa-IR`); no soporta otros idiomas ni cambio de voz o hablante documentado.
- No se documentan sesgos específicos, pero al derivar de un corpus único de un hablante o dominio concreto, es probable que la prosodia y el registro sean limitados; no hay información para confirmarlo.
- Riesgo de alucinación en el sentido de generar audio plausible pero incorrecto para texto fuera de dominio; no se documenta el comportamiento en palabras desconocidas, siglas o números.
- Licencia Apache 2.0 permisiva para uso comercial, pero se recomienda verificar la licencia del modelo upstream y de los datos de entrenamiento originales, no documentados en la información disponible.
- Sin garantías de latencia ni throughput para despliegues de alta concurrencia; no se han publicado pruebas de estrés.
- El repositorio tiene muy pocas descargas (24) y ningún like, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-ganji_adabi-espeak
- Modelo upstream: https://huggingface.co/SadeghK/persian-text-to-speech/tree/main/farsi/ganji-adabi
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
