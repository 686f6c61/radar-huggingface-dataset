# Phoonnx/glowtts-en-us-mary_ann

## Resumen

`Phoonnx/glowtts-en-us-mary_ann` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como una carpeta extraída del repositorio agregador [Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts). Se trata de una voz concreta, identificada internamente como `larynx/en-us-mary_ann-glow_tts`, pensada para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx), un runtime de TTS basado en ONNX.

El modelo emplea la arquitectura GlowTTS, un modelo de síntesis neuronal no autorregresivo que combina un encoder basado en transformer con un decoder generativo de flujo normalizante (normalizing flow). Su propósito es convertir texto en inglés estadounidense en audio inteligible con una voz concreta ("Mary Ann"), empaquetado de forma ligera (el repositorio ocupa aproximadamente 0,1 GB) para despliegue en inferencia local o en servidores sin dependencias de frameworks pesados.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional ni de un sistema TTS de última generación, sino de un artefacto de inferencia empaquetado para un runtime específico. La información pública disponible es mínima (sin model card descriptiva, sin benchmarks, sin idiomas declarados en los metadatos de Hugging Face), por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (encoder transformer + decoder de flujo normalizante), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (deducido del identificador `en-us`); no declarado en metadatos |
| Licencia | `other` (la model card original no especifica licencia para esta carpeta) |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |
| Voice ID | `larynx/en-us-mary_ann-glow_tts` |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz no autorregresivo presentado en el paper "Glow-TTS: A Generative Flow for Text-to-Speech via Monotonic Alignment Search" (Kim et al., 2020). Su diseño combina un encoder transformer que procesa la secuencia de fonemas o caracteres y un decoder basado en flujos normalizantes invertibles que transforma una distribución latente simple en el espectrograma mel de salida. La alineación entre texto y audio se aprende mediante búsqueda de alineamiento monótono (MAS), lo que evita depender de un aligner externo y permite entrenamiento en paralelo, con inferencia rápida en comparación con modelos autorregresivos como Tacotron 2.

En este caso concreto, el artefacto publicado es la exportación a ONNX de una voz entrenada dentro del ecosistema Larynx/phoonnx (la voz "Mary Ann" en inglés estadounidense). No se dispone de información sobre el corpus de entrenamiento, el número de pasos, la composición del dataset, ni si se aplicaron técnicas de post-procesado o fine-tuning. La model card únicamente indica que los ficheros conservan las rutas del repositorio original `Phoonnx/phoonnx-glowtts` y que el identificador de voz es `larynx/en-us-mary_ann-glow_tts`. No hay innovaciones técnicas adicionales documentadas más allá de las propias de GlowTTS y de su empaquetado para el runtime phoonnx.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés estadounidense.
- Generación de audio con una voz concreta identificada como "Mary Ann" (`larynx/en-us-mary_ann-glow_tts`).
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Ejecución ligera: el repositorio ocupa ~0,1 GB, lo que facilita el despliegue en entornos con recursos limitados.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modos de "thinking".
- No se documentan capacidades multimodales (visión, audio de entrada) ni control de estilo, emoción o prosodia más allá de lo que permita el runtime.
- No se documenta soporte multilingüe: el identificador sugiere exclusivamente inglés estadounidense.

## Casos de uso

- Lectura de contenido web o de artículos en inglés estadounidense: el modelo puede sintetizar texto plano a audio para aplicaciones de accesibilidad o de consumo de contenido, aprovechando su formato ONNX ligero para ejecutarse en el navegador o en el servidor sin GPU dedicada.
- Asistentes de voz locales en dispositivos de borde: al ocupar ~0,1 GB y ejecutarse vía ONNX Runtime, es viable integrarlo en raspberry Pi, móviles o sistemas embebidos con phoonnx como runtime.
- Generación de avisos pregrabados o dinámicos: notificaciones de sistemas, mensajes de estado o alertas en inglés que requieran una voz consistente y de baja latencia.
- Prototipado de pipelines TTS en investigación: sirve como voz de referencia dentro del ecosistema Larynx/phoonnx para comparar arquitecturas GlowTTS frente a otros sintetizadores.
- Audiolibros o pódcast automatizados de bajo coste: para contenido en inglés donde no se requiera una calidad de estudio ni control emocional avanzado.
- Pruebas de integración en aplicaciones de lectura por voz (screen readers, e-learning): el modelo puede actuar como motor TTS embebido en aplicaciones educativas o de accesibilidad que necesiten una voz inglesa sin depender de servicios en la nube.
- Sustitución de motores TTS propietarios en entornos con requisitos de privacidad: al ejecutarse localmente, el texto no sale del dispositivo, lo que resulta adecuado para aplicaciones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MOS, MCD, WER), latencia ni throughput, y los metadatos de Hugging Face no aportan datos de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Por el tamaño del repositorio (~0,1 GB), el modelo es muy ligero y probablemente puede ejecutarse en CPU sin problemas; la VRAM necesaria en GPU sería mínima (del orden de cientos de MB incluyendo buffers de ONNX Runtime), aunque no hay cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte de ONNX Runtime (CUDA o TensorRT) es suficiente; también es viable en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (a través de la librería phoonnx); no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no están orientados a TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-mary_ann | GlowTTS (ONNX) | ~0,1 GB (repo) | en-US | ONNX | other | Hugging Face |
| Voces Larynx originales (rhasspy/larynx) | GlowTTS / otros | variable | varios | ONNX / tflite | según voz | Hugging Face / GitHub |
| Piper (rhasspy/piper) | VITS | variable (~decenas de MB) | varios | ONNX | MIT (código) / según voz | Hugging Face / GitHub |
| Coqui TTS (voces VITS) | VITS / Tacotron | variable | varios | PyTorch / ONNX | MPL-2.0 / según modelo | GitHub / Hugging Face |

La comparación con alternativas como Piper o Coqui TTS es aproximada: no se dispone de datos de rendimiento de este artefacto concreto, y las licencias de las voces individuales varían. La principal diferencia es que este modelo está empaquetado específicamente para el runtime phoonnx, lo que limita su portabilidad frente a formatos más estándar.

## Limitaciones y advertencias

- Licencia `other`: la model card original no especifica una licencia concreta para esta carpeta, lo que genera incertidumbre sobre el uso comercial. Es imprescindible contactar con el autor o revisar el repositorio original antes de usarlo en producción.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar el sesgo de la voz, la cobertura fonética ni la calidad en dominios específicos (nombres propios, siglas, números).
- Riesgo de alucinación o artefactos acústicos: como todo modelo TTS, puede producir pronunciaciones incorrectas, entonación antinatural o ruidos en textos fuera de distribución.
- Idioma limitado: el identificador indica inglés estadounidense; no hay evidencia de soporte para otros idiomas o acentos.
- Sin benchmarks: no hay métricas objetivas de calidad (MOS, WER, MCD) que permitan comparar con alternativas.
- Dependencia del runtime phoonnx: el modelo está pensado para esa librería y puede no ser directamente compatible con otros frameworks TTS sin conversión.
- Fecha de creación en 2026 y ausencia de descargas/likes: el artefacto es reciente y sin validación comunitaria, por lo que su fiabilidad en producción no está contrastada.
- Sin control de prosodia, emoción ni estilo documentado: la voz es fija y no se ofrecen parámetros de expresividad.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en-us-mary_ann](https://huggingface.co/Phoonnx/glowtts-en-us-mary_ann)
- [Repositorio original: Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Paper Glow-TTS (Kim et al., 2020)](https://arxiv.org/abs/2005.11129)
- [Proyecto Larynx (rhasspy/larynx)](https://github.com/rhasspy/larynx)
