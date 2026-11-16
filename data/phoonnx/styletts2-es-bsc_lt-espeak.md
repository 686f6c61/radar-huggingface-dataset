# Phoonnx/styletts2-es-bsc_lt-espeak

## Resumen

styletts2-es-bsc_lt-espeak es un modelo de síntesis de voz (text-to-speech) en castellano basado en la arquitectura StyleTTS2, desarrollado originalmente por el grupo BSC-LT (Barcelona Supercomputing Center - Language Technologies) y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo parte del checkpoint multispeaker `BSC-LT/styletts2-spanish-multispeaker` y se distribuye como un artefacto ONNX listo para ejecutarse en Python y en el ecosistema OVOS.

La relevancia de este paquete reside en su formato: al estar exportado a ONNX y acompañado de una capa de integración (`phoonnx` + `scriptconv`), elimina la dependencia del stack de entrenamiento original y permite desplegar TTS neuronal en castellano con pocas líneas de código, incluyendo clonación de voz a partir de audio de referencia. El front-end textual utiliza fonemas espeak-ng en alfabeto IPA, lo que condiciona tanto la calidad como los requisitos de instalación.

El repositorio ocupa 0,8 GB y expone siete voces predefinidas (`bsc/es-cml10246`, `bsc/es-cml11797`, `bsc/es-cml12367`, `bsc/es-cml3946`, `bsc/es-cml8882`, `bsc/es-cml9972` y `bsc/es-styletts2`). La licencia declarada es Apache 2.0, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con modelado de estilo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | es (castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Voces incluidas | 7 (`bsc/es-cml10246`, `es-cml11797`, `es-cml12367`, `es-cml3946`, `es-cml8882`, `es-cml9972`, `es-styletts2`) |
| Clonacion de voz | si, a partir de audio de referencia |
| Tamano del repositorio | 0,8 GB |
| Libreria de inferencia | phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un codificador de estilo y un decodificador acústico entrenado con objetivos adversarios y de reconstrucción, orientada a producir habla natural con prosodia expresiva. El modelo base es el checkpoint multispeaker en castellano de BSC-LT, que aporta las siete voces empaquetadas. El paquete de Phoonnx no reentrena el modelo: exporta los pesos a ONNX y añade la capa de preprocesado textual necesaria para la inferencia.

El front-end textual se delega en `scriptconv`, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` (extra `scriptconv[espeak]`). La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo upstream empleó RLHF, DPO u otras técnicas de alineación; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La clonación de voz se realiza a partir de audio de referencia, según indica la model card.

## Capacidades

- Síntesis de voz en castellano a partir de texto, con salida en WAV.
- Siete voces predefinidas empaquetadas bajo el espacio de nombres `bsc/`.
- Clonación de voz zero-shot mediante audio de referencia (el README de phoonnx documenta cómo pasarlo).
- Normalización y conversión de texto a fonemas IPA vía `scriptconv` y espeak-ng.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución sobre runtime ONNX, sin dependencia del framework de entrenamiento original.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Asistentes de voz en castellano sobre OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `bsc/es-cml10246` en `mycroft.conf` y sustituir el motor TTS por defecto sin cambiar la lógica del asistente.
- Lectura de contenido largo en aplicaciones de accesibilidad: la síntesis por frases con salida WAV encaja en pipelines que convierten artículos o documentos en audio para usuarios con discapacidad visual.
- Generación de locuciones para vídeo y pódcast: las siete voces permiten alternar narradores y mantener consistencia de timbre por proyecto.
- Clonación de voz para demos personalizadas: usando audio de referencia se puede generar una voz sintética con el timbre de un locutor concreto, útil en prototipos y pruebas de concepto.
- Integración en asistentes telefónicos o IVR: el modelo es lo bastante ligero (repositorio de 0,8 GB en ONNX) para desplegarse en servidores modestos y generar respuestas habladas en castellano.
- Avisos y notificaciones dinámicas: síntesis bajo demanda de mensajes variables (alertas, recordatorios, confirmaciones) en aplicaciones domésticas o industriales.
- Evaluación comparativa de TTS en castellano: al estar en formato ONNX y con licencia Apache 2.0, sirve como baseline reproducible frente a otros motores en pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,8 GB) y la naturaleza ONNX del paquete, es razonable esperar un consumo de memoria en el rango de cientos de MB a pocos GB, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El runtime ONNX permite ejecución en CPU y en GPU compatibles con ONNX Runtime, pero la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada; la ejecución en CPU es viable según el diseño de phoonnx, pero no se aportan cifras.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/styletts2-es-bsc_lt-espeak | StyleTTS2 | es | Apache 2.0 | ONNX | 7 voces, clonación, paquete phoonnx |
| BSC-LT/styletts2-spanish-multispeaker | StyleTTS2 | es | Apache 2.0 | no disponible en esta ficha | Modelo upstream, checkpoint original |
| Otros StyleTTS2 del catálogo Phoonnx | StyleTTS2 | variable | variable | ONNX | Misma capa de empaquetado, distinto idioma/voces |

La información disponible no permite comparar métricas de calidad (MOS, WER, similitud de hablante) con alternativas como XTTS, VITS o Piper. La comparación se limita a arquitectura, licencia y formato de distribución.

## Limitaciones y advertencias

- El modelo depende de espeak-ng para la fonemización; si se usa el port `espyak` en lugar de espeak-ng, algunos fonemas difieren y ciertas palabras pueden pronunciarse mal.
- Solo soporta castellano (`es`); no se documenta cobertura multilingüe.
- No se han publicado métricas de sesgo, robustez o tasa de alucinación; en TTS la "alucinación" se manifiesta como prosodia incorrecta o pronunciaciones erróneas, no documentadas aquí.
- La clonación de voz plantea riesgos de suplantación y uso indebido; aunque la licencia es Apache 2.0, conviene aplicar controles de consentimiento en producción.
- La licencia Apache 2.0 se hereda del modelo upstream según la model card; no se aporta verificación adicional del cumplimiento por parte de BSC-LT.
- El paquete está marcado como versión preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.
- No se especifican límites de longitud de texto por inferencia ni comportamiento con entradas muy largas.
- El repositorio tiene un uso muy bajo (19 descargas, 0 likes), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-es-bsc_lt-espeak
- Modelo upstream: https://huggingface.co/BSC-LT/styletts2-spanish-multispeaker
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
