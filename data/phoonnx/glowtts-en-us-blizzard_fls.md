# Phoonnx/glowtts-en-us-blizzard_fls

## Resumen

`Phoonnx/glowtts-en-us-blizzard_fls` es un modelo de síntesis de voz (text-to-speech) en formato ONNX publicado por el usuario Phoonnx. Se trata de una exportación de una voz concreta del proyecto GlowTTS, identificada internamente como `larynx/en-us-blizzard_fls-glow_tts`, empaquetada para su uso con la librería `phoonnx`, un runtime de inferencia de TTS desarrollado por TigreGotico. El modelo no es un desarrollo original de arquitectura, sino un artefacto derivado: una voz preentrenada de GlowTTS (originalmente asociada al conjunto de datos Blizzard y al ecosistema Larynx) convertida a ONNX para despliegue ligero.

La relevancia de este artefacto es fundamentalmente práctica: permite ejecutar síntesis de voz en inglés estadounidense con una huella de repositorio muy reducida (0,1 GB) y sin dependencia de frameworks pesados de deep learning, lo que facilita su integración en aplicaciones de escritorio, asistentes locales o pipelines de generación de audio en entornos con recursos limitados. GlowTTS es un modelo de síntesis no autorregresivo basado en normalizing flows, conocido por su velocidad de inferencia y su entrenamiento estable en comparación con arquitecturas autorregresivas como Tacotron 2.

No obstante, la información publicada es extremadamente escasa: la model card se limita a indicar el origen del artefacto y a señalar que la licencia es `other` sin especificar sus términos. No se documentan parámetros, contexto, datos de entrenamiento ni métricas de calidad. Cualquier evaluación rigurosa del modelo requiere consultar el repositorio original `Phoonnx/phoonnx-glowtts` y el proyecto Larynx.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (síntesis TTS no autorregresiva basada en normalizing flows), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud se rige por la duración del texto de entrada) |
| Tipos de cuantización | no disponible (el artefacto se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (según el identificador `en-us`); no se documenta cobertura adicional |
| Licencia | `other` (sin términos especificados en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz no autorregresivo que emplea una arquitectura de normalizing flows para transformar una distribución latente en un espectrograma mel, junto con un módulo de duración que predice la alineación entre fonemas y frames. Esta aproximación permite inferencia paralela (frente a la generación secuencial de Tacotron) y un entrenamiento más estable que los modelos basados en GAN o en alineamiento attention autorregresivo. El artefacto aquí publicado es la exportación ONNX de una voz concreta entrenada sobre datos del corpus Blizzard, dentro del ecosistema Larynx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de fine-tuning con RLHF/DPO (poco habitual en TTS) ni innovaciones técnicas adicionales más allá de las propias de GlowTTS. La model card no documenta el proceso de exportación a ONNX, las versiones de las herramientas utilizadas ni las posibles pérdidas de fidelidad respecto al checkpoint original.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto de entrada.
- Generación de audio mediante un vocoder externo (el modelo produce representaciones mel; el vocoder no se incluye en este repositorio).
- Inferencia ligera gracias al formato ONNX, compatible con runtimes como ONNX Runtime.
- Integración con la librería `phoonnx` mediante el identificador de voz `larynx/en-us-blizzard_fls-glow_tts`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking (no aplicables a un modelo TTS).
- No se documentan capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz locales: el modelo puede generar respuestas habladas en inglés en aplicaciones de escritorio o dispositivos embebidos, aprovechando su tamaño reducido (0,1 GB) y el formato ONNX para ejecución sin GPU dedicada.
- Lectura de textos y accesibilidad: conversión de documentos, artículos o notificaciones a audio para usuarios con discapacidad visual, con latencia baja gracias a la inferencia paralela de GlowTTS.
- Integración en pipelines de `phoonnx`: uso directo mediante el identificador de voz documentado para construir sistemas TTS personalizados dentro del ecosistema TigreGotico.
- Prototipado rápido de interfaces conversacionales: generación de locuciones de prueba en inglés para validar flujos de voz antes de invertir en modelos comerciales o voces neuronales de mayor calidad.
- Sistemas de anuncios y avisos automatizados: síntesis de mensajes cortos en entornos de kiosco, transporte o domótica, donde el coste computacional y el tamaño del artefacto son críticos.
- Investigación y docencia en TTS: estudio comparativo de arquitecturas de normalizing flows frente a modelos autorregresivos o difusos, usando una voz de referencia reproducible en formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de GlowTTS, se espera un consumo moderado, apto para ejecución en CPU.
- GPU recomendadas: no documentadas; el formato ONNX permite ejecución en CPU y en GPU de gama baja, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del artefacto, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime y la librería `phoonnx`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-en-us-blizzard_fls` | GlowTTS (flows) | 0,1 GB (repo) | en-US | `other` (sin especificar) | ONNX |
| Piper (voces en-US) | VITS (flows + GAN) | ~decenas de MB por voz | múltiples | MIT / varias | ONNX |
| Coqui TTS (voces GlowTTS) | GlowTTS | variable | múltiples | MPL 2.0 / varias | PyTorch, ONNX |
| Larynx (voces originales) | GlowTTS | variable | múltiples | varias (por voz) | TensorFlow, ONNX |

La comparación cuantitativa de calidad (MOS, latencia, WER) no está disponible en la información proporcionada. Piper y Larynx son las alternativas más directas por formato y filosofía de despliegue ligero; Coqui TTS ofrece el ecosistema de referencia para GlowTTS en PyTorch.

## Limitaciones y advertencias

- Licencia `other` sin términos especificados: no se aclara si se permite uso comercial, modificación o redistribución; es imprescindible contactar con el autor o consultar el repositorio original antes de usarlo en producción.
- La model card no documenta la procedencia exacta de los datos de entrenamiento ni posibles restricciones derivadas del corpus Blizzard.
- Riesgo de artefactos y pronunciación incorrecta inherente a los modelos TTS entrenados con datos limitados; no se publican métricas de calidad (MOS, WER) que permitan evaluarlo.
- Cobertura lingüística restringida al inglés estadounidense; no se documenta soporte de otros idiomas ni de code-switching.
- El modelo produce representaciones mel; requiere un vocoder compatible para generar audio final, lo que añade una dependencia no incluida en el repositorio.
- Sin descargas ni likes registrados y con fecha de creación futura en los metadatos (2026-11-14), lo que sugiere un artefacto reciente o con metadatos inconsistentes; la comunidad no ha validado su funcionamiento.
- No se documentan sesgos específicos, pero al ser una voz entrenada sobre un corpus concreto puede reflejar características demográficas y de estilo limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-blizzard_fls
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
