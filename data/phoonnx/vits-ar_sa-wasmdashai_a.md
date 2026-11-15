# Phoonnx/vits-ar_sa-wasmdashai_a

## Resumen

`vits-ar_sa-wasmdashai_a` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por wasmdashai y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`, una biblioteca de TTS en Python orientada al ecosistema OVOS (Open Voice OS). El modelo está especializado exclusivamente en árabe de Arabia Saudí (`ar-SA`) y convierte texto en caracteres directamente en audio, sin necesidad de un fonemizador externo complejo más allá del `GraphemePhonemizer` de `scriptconv`.

El modelo resuelve el problema de disponibilidad de voces TTS ligeras y de código abierto para árabe saudí en entornos de asistente de voz y sistemas embebidos. Al estar distribuido como ONNX dentro de un repositorio de apenas 0,1 GB, su huella es reducida y puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

Su relevancia actual radica en su integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y en su licencia MIT, que permite uso comercial sin restricciones. No obstante, la información pública disponible es muy escasa: no se detallan parámetros, contexto, datos de entrenamiento ni benchmarks, por lo que esta ficha refleja únicamente lo que el autor y el empaquetador han publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | árabe de Arabia Saudí (`ar-SA`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (graphemes) |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 0,1 GB |
| Librería de ejecución | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. Este diseño permite generar audio de forma end-to-end a partir de texto sin un vocoder separado, con una calidad perceptual competitiva para voces de un solo hablante o de hablante fijo.

El modelo original fue publicado por wasmdashai bajo el identificador `wasmdashai/vits-ar-sa-A` y posteriormente empaquetado por Phoonnx en ONNX para su ejecución con la librería `phoonnx`. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el número de hablantes, la duración del audio de entrenamiento ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El front-end de texto utiliza `GraphemePhonemizer` de `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo sin un fonemizador específico del árabe.

## Capacidades

- Síntesis de voz a partir de texto en árabe saudí (`ar-SA`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Procesamiento de entrada a nivel de grafemas (caracteres), sin requerir fonemización manual.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en CPU mediante ONNX Runtime (formato ONNX), sin dependencia obligatoria de GPU.
- Normalización y conversión de texto delegada a `scriptconv`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos generativos de texto.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en árabe saudí: el modelo puede integrarse en OVOS como módulo TTS para responder a los usuarios en `ar-SA`, aprovechando el plugin `ovos-tts-plugin-phoonnx` y su configuración mediante `mycroft.conf`.
- Lectura de notificaciones y alertas en dispositivos domésticos: al ser un modelo ONNX de 0,1 GB, puede desplegarse en altavoces inteligentes o Raspberry Pi para leer mensajes del sistema en árabe saudí con baja latencia.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla o documentos a voz en árabe saudí en aplicaciones de escritorio o móviles que ejecuten ONNX Runtime.
- Generación de audio para contenido educativo: narración de lecciones o materiales didácticos en árabe saudí donde se requiera una voz sintética ligera y de licencia permisiva.
- Pruebas de integración en pipelines de CI/CD: validación automatizada de flujos TTS en aplicaciones OVOS usando el modelo como voz de referencia para `ar-SA`.
- Prototipado rápido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse mediante `TTSModelManager`, permite incorporar TTS en árabe saudí en pocas líneas de código para demos y pruebas de concepto.
- Sistemas de información pública o kioscos: lectura de textos breves en árabe saudí en terminales de autoservicio con recursos de hardware limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM de sistemas de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican requisitos de GPU.
- Opciones de despliegue: `phoonnx` (Python) y `ovos-tts-plugin-phoonnx` (OVOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos TTS comparables en árabe saudí ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo de un solo idioma y probablemente de un número limitado de hablantes, puede reflejar sesgos de prosodia o de registro del corpus de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o en texto no normalizado.
- Limitaciones de contexto o idioma: el modelo solo soporta `ar-SA`; no se documenta cobertura de otros dialectos árabes ni de otras lenguas.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, modificación y redistribución con atribución; no obstante, el autor original del modelo es wasmdashai y el empaquetado es de Phoonnx, por lo que conviene conservar los avisos de copyright.
- Caveats para producción: no se documentan métricas de calidad (MOS), latencia, estabilidad ni cobertura de vocabulario; el repositorio tiene pocas descargas (33) y ningún like, lo que sugiere escasa validación por parte de la comunidad.
- Dependencia de `phoonnx` en versión preliminar (`pip install --pre phoonnx`), lo que implica que la API puede cambiar.
- El front-end de texto usa `GraphemePhonemizer`, sin fonemización específica del árabe, lo que puede afectar a la precisión en palabras con diacríticos o lecturas ambiguas.

## Enlaces

- [Hugging Face: Phoonnx/vits-ar_sa-wasmdashai_a](https://huggingface.co/Phoonnx/vits-ar_sa-wasmdashai_a)
- [Modelo original: wasmdashai/vits-ar-sa-A](https://huggingface.co/wasmdashai/vits-ar-sa-A)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
