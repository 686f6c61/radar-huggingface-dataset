# csukuangfj2/sherpa-onnx-pocket-tts-int8-2026-01-26

## Resumen

El repositorio `csukuangfj2/sherpa-onnx-pocket-tts-int8-2026-01-26` contiene una exportación a formato ONNX, con cuantización a int8, del modelo de síntesis de voz Pocket TTS desarrollado por Kyutai Labs. El autor de esta conversión es csukuangfj2, y el pipeline de exportación se apoya en el proyecto `pocket-tts-onnx-export` de KevinAHM. El paquete está pensado para su uso con la herramienta sherpa-onnx, un runtime de inferencia en C++/ONNX orientado a despliegues ligeros en CPU y dispositivos de borde.

El modelo original Pocket TTS es un sistema de texto-a-habla (TTS) de Kyutai, distribuido bajo licencia CC-BY-4.0 para los pesos y Apache-2.0 para el código. Esta versión concreta pesa 0,2 GB en el repositorio, lo que la sitúa en la franja de modelos TTS ligeros aptos para ejecución en hardware modesto. La fecha del identificador (2026-01-26) corresponde al momento de la exportación.

La relevancia de esta ficha radica en que ofrece una vía concreta para integrar TTS de Kyutai en aplicaciones de producción mediante ONNX Runtime, sin depender de frameworks de Python pesados. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Kyutai, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion del export a ONNX) |
| Idiomas soportados | no disponible |
| Licencia | pesos CC-BY-4.0; codigo Apache-2.0 (heredada de kyutai/pocket-tts) |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna de Pocket TTS en la documentación proporcionada. Se trata de un modelo de síntesis de voz de Kyutai Labs, y esta versión es una exportación a ONNX con cuantización int8 realizada mediante el proyecto `pocket-tts-onnx-export` de KevinAHM. El repositorio incluye archivos WAV de prueba (`test_wav`) procedentes del repositorio `kyutai-labs/delayed-streams-modeling`, lo que sugiere que el modelo está pensado para ser evaluado con audio de referencia del propio ecosistema de Kyutai.

No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de ajuste. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información accesible.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech), en formato ONNX int8.
- Ejecución mediante sherpa-onnx, lo que permite despliegue en C++ y en entornos sin Python.
- Compatible con el ecosistema de exportación ONNX de KevinAHM para Pocket TTS.
- Inclusión de audios de prueba (`test_wav`) para validación cualitativa.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje, al ser un modelo TTS.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (clonación de voz, control de estilo, emoción): no disponibles.

## Casos de uso

- Lectura de artículos y noticias en aplicaciones móviles: al ser un modelo ONNX int8 de 0,2 GB, puede empaquetarse en apps que necesiten TTS local sin conexión, reduciendo latencia y coste de API.
- Asistentes de voz en dispositivos de borde (Raspberry Pi, routers, wearables): sherpa-onnx está optimizado para CPU y entornos embebidos, lo que encaja con este formato.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en tiempo real en sistemas de escritorio ligeros.
- Generación de audiolibros y podcasts automatizados: el modelo puede integrarse en pipelines de producción de audio por lotes, siempre que se valide la calidad del int8 frente al modelo original.
- Sistemas de navegación y avisos por voz en vehículos: inferencia local sin dependencia de red, con huella de memoria reducida.
- Pruebas de integración en proyectos que ya usan sherpa-onnx para ASR y necesitan un componente TTS del mismo ecosistema, simplificando la cadena de dependencias.
- Prototipado rápido de interfaces conversacionales: el tamaño reducido permite iterar en local antes de decidir un despliegue a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: al tratarse de un modelo de 0,2 GB en int8, la huella de memoria es muy reducida; se estima que puede ejecutarse con menos de 1 GB de RAM en CPU, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles. Por el formato ONNX y el tamaño, está orientado a CPU; podría ejecutarse en GPUs consumer (RTX 3060, RTX 4090) mediante ONNX Runtime con provider CUDA, pero no hay datos de rendimiento.
- ¿Cabe en GPU consumer? Sí, por tamaño, aunque no se documenta el rendimiento en ellas.
- Opciones de despliegue: sherpa-onnx (principal), ONNX Runtime (C++, Python, C#), potencialmente integrable en aplicaciones nativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sherpa-onnx-pocket-tts-int8 (este) | no disponible | no disponible | ONNX int8 | CC-BY-4.0 / Apache-2.0 | Hugging Face, 0 descargas |
| kyutai/pocket-tts (original) | no disponible | no disponible | no disponible | CC-BY-4.0 | Hugging Face |
| KevinAHM/pocket-tts-onnx | no disponible | no disponible | ONNX | CC-BY-4.0 / Apache-2.0 | Hugging Face |
| Otros TTS ONNX de sherpa-onnx (p. ej. VITS, Piper) | variable | no aplica | ONNX | variable | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan idiomas, arquitectura, ni benchmarks, lo que dificulta evaluar su idoneidad frente a alternativas.
- Al ser una cuantización int8, es esperable una degradación de calidad frente al modelo original en float, aunque no se cuantifica en la documentación.
- El repositorio tiene 0 descargas en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- La licencia de los pesos es CC-BY-4.0, que exige atribución; el código es Apache-2.0. Es imprescindible revisar el archivo LICENSE enlazado antes de un uso comercial.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber artefactos de audio, pronunciaciones incorrectas o inestabilidad en textos largos.
- No se documentan sesgos de voz (género, acento, idioma) ni la cobertura lingüística real.
- La fecha del identificador (2026-01-26) y la actualización (2026-11-21) sugieren un proyecto reciente; conviene verificar la reproducibilidad de la exportación.
- El uso en producción requiere validar la calidad del audio y el rendimiento en el hardware objetivo, dado que no hay métricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/csukuangfj2/sherpa-onnx-pocket-tts-int8-2026-01-26
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de Kyutai Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Exportador ONNX: https://github.com/KevinAHM/pocket-tts-onnx-export
- Repositorio ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Licencia de los pesos ONNX: https://huggingface.co/KevinAHM/pocket-tts-onnx/blob/main/onnx/LICENSE
- Audios de prueba: https://github.com/kyutai-labs/delayed-streams-modeling/tree/main/audio
- sherpa-onnx (runtime): https://github.com/k2-fsa/sherpa-onnx
