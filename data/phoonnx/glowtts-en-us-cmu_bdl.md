# Phoonnx/glowtts-en-us-cmu_bdl

## Resumen

glowtts-en-us-cmu_bdl es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx en Hugging Face. Se trata de una exportación a ONNX de un modelo GlowTTS, empaquetada específicamente para su uso con la librería phoonnx, un motor de inferencia TTS orientado a despliegue ligero. El modelo forma parte de una colección mayor (Phoonnx/phoonnx-glowtts) y esta carpeta concreta corresponde a la variante de voz `en-us-cmu_bdl`, es decir, inglés estadounidense con la voz identificada como `cmu_bdl` dentro del ecosistema de voces Larynx.

El modelo resuelve el problema de convertir texto en audio inteligible en inglés estadounidense con un motor de inferencia basado en ONNX, lo que facilita el despliegue en entornos sin dependencias pesadas de frameworks de deep learning. Su relevancia es práctica: permite integrar TTS en aplicaciones locales o servidores ligeros mediante phoonnx, sin requerir GPU dedicada ni stacks como PyTorch en producción.

La información pública disponible es muy limitada: el repositorio ocupa 0,1 GB, no tiene descargas ni likes registrados, y la model card no detalla arquitectura interna, número de parámetros, contexto ni datos de entrenamiento. La licencia se declara como `other` sin especificar términos concretos para esta carpeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés estadounidense (en-us) |
| Licencia | other (sin especificar) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en GlowTTS, una arquitectura de síntesis de voz no autorregresiva que emplea normalizing flows para modelar la duración y la generación de espectrogramas a partir de texto. GlowTTS se caracteriza por su entrenamiento paralelo (no secuencial), lo que reduce los tiempos de inferencia frente a arquitecturas autorregresivas como Tacotron 2. La exportación a ONNX permite ejecutar el modelo mediante el runtime de ONNX, sin necesidad de PyTorch ni TensorFlow en el entorno de despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo ajuste fino con RLHF/DPO, ni innovaciones técnicas específicas más allá de la propia arquitectura GlowTTS. La carpeta `en-us-cmu_bdl` parece derivarse del conjunto de voces del proyecto Larynx, que tradicionalmente entrena modelos TTS sobre corpus como LJSpeech y CMU ARCTIC; sin embargo, esta asociación no se confirma en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense.
- Generación de audio mediante inferencia ONNX a través de phoonnx.
- Integración con el sistema de identificadores de voz de phoonnx, con el id `larynx/en-us-cmu_bdl-glow_tts`.
- Ejecución en entornos ligeros sin dependencia de PyTorch.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción ni multilingüismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura por voz de artículos o documentos en aplicaciones web: el modelo puede convertir texto en audio en inglés estadounidense mediante phoonnx, sin necesidad de servicios en la nube.
- Asistentes de voz locales: integración en aplicaciones de escritorio o embebidas que requieran TTS offline, gracias a la inferencia ONNX sin dependencias pesadas.
- Accesibilidad: generación de audio para personas con discapacidad visual en entornos donde el inglés estadounidense sea el idioma objetivo.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño (0,1 GB), es adecuado para validar flujos de síntesis antes de migrar a voces de mayor calidad.
- Generación de avisos o notificaciones habladas en sistemas automatizados (IoT, domótica) donde se requiera una voz concreta identificada por id.
- Investigación comparativa de voces Larynx: permite evaluar la voz `cmu_bdl` frente a otras del mismo repositorio para seleccionar la más adecuada en un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,1 GB) se infiere un modelo pequeño que probablemente quepa en CPU y en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño, aunque no hay confirmación oficial.
- Opciones de despliegue: phoonnx (librería nativa), runtime ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en-us-cmu_bdl (este) | GlowTTS | en-us | other | ONNX | Hugging Face |
| Piper (voces en_US) | VITS | en-us | MIT (mayoría) | ONNX | Hugging Face / GitHub |
| Coqui TTS (modelos en) | VITS / Tacotron2 | en | MPL-2.0 / otras | PyTorch | Hugging Face / GitHub |
| Larynx (voces originales) | GlowTTS | varios | otras | PyTorch / ONNX | GitHub |

La comparación es orientativa: no se dispone de datos de rendimiento para este modelo concreto, por lo que no se puede establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia `other` no especifica términos; es imprescindible contactar con el autor antes de cualquier uso comercial.
- No hay información sobre sesgos de género, acento o etnia en la voz `cmu_bdl`.
- Al ser un modelo TTS, el riesgo de alucinación se traduce en posibles errores de pronunciación, entonación o palabras mal sintetizadas.
- Solo se documenta inglés estadounidense; no se garantiza soporte para otros idiomas o acentos.
- No se dispone de información sobre el corpus de entrenamiento, lo que dificulta evaluar su calidad y cobertura.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.
- La fecha de creación (2026-11-14) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o un repositorio de prueba.
- No se documentan límites de longitud de texto ni comportamiento en textos largos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_bdl
- Repositorio base: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
