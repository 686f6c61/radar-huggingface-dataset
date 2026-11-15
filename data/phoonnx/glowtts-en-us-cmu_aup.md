# Phoonnx/glowtts-en-us-cmu_aup

## Resumen

GlowTTS-en-us-cmu_aup es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como una carpeta independiente dentro del repositorio agregador `Phoonnx/phoonnx-glowtts`. El modelo implementa la arquitectura GlowTTS, un sistema TTS no autorregresivo basado en normalizing flows, y está empaquetado para su uso con la librería `phoonnx`, un runtime de inferencia orientado a modelos TTS en ONNX.

El modelo corresponde a la voz identificada como `larynx/en-us-cmu_aup-glow_tts`, lo que sugiere que deriva de una voz del proyecto Larynx (mycroft-ai), entrenada sobre el corpus CMU ARCTIC y con el identificador de hablante `aup`. El pipeline declarado es `text-to-speech` y el idioma de trabajo es el inglés estadounidense, aunque la model card no documenta explícitamente los idiomas soportados.

Su relevancia es limitada y muy específica: se trata de un artefacto de despliegue más que de un modelo de investigación. Resulta útil para desarrolladores que necesiten una voz TTS ligera en ONNX integrable en pipelines locales, sin dependencias de frameworks de deep learning pesados. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en normalizing flows), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés estadounidense (en-us) según el identificador de la voz; no documentado formalmente en la model card |
| Licencia | other (la model card indica `license: other` sin especificar términos) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de síntesis de voz no autorregresiva que combina un encoder de texto con un decoder basado en normalizing flows (Glow), lo que permite generar espectrogramas mel en paralelo y reducir la latencia frente a modelos autorregresivos como Tacotron 2. El modelo se distribuye ya exportado a ONNX, lo que facilita su despliegue en entornos de producción sin necesidad de PyTorch en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El identificador `en-us-cmu_aup` apunta a una voz derivada del corpus CMU ARCTIC, un conjunto de datos clásico de síntesis de voz en inglés estadounidense, y al esquema de nombres de las voces de Larynx. No obstante, estos detalles no están confirmados en la model card.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense.
- Generación de audio mediante inferencia ONNX, apta para ejecución en CPU.
- Integración con el runtime `phoonnx` a través del identificador de voz `larynx/en-us-cmu_aup-glow_tts`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales más allá de la conversión texto-a-habla.
- No se documentan capacidades de control de prosodia, emoción ni clonación de voz.

## Casos de uso

- Lectura por voz de contenidos web o documentos: el modelo puede convertir texto plano en audio en un pipeline local, sin depender de servicios en la nube, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Asistentes de voz embebidos: al ejecutarse mediante `phoonnx` sobre ONNX, puede integrarse en dispositivos con recursos limitados o en aplicaciones de escritorio que requieran TTS offline.
- Accesibilidad: generación de audio para personas con discapacidad visual en aplicaciones que necesiten una voz en inglés estadounidense sin conexión a internet.
- Pruebas y prototipado de pipelines TTS: útil como voz de referencia en entornos de desarrollo que evalúen el runtime `phoonnx` o comparen arquitecturas GlowTTS frente a otros motores.
- Generación de avisos y notificaciones habladas: para sistemas de megafonía, domótica o alertas automatizadas donde se requiera una voz sintética ligera y determinista.
- Investigación en síntesis de voz: como punto de partida para estudiar el comportamiento de GlowTTS exportado a ONNX o para comparar voces del ecosistema Larynx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, es previsible que funcione en CPU sin GPU dedicada, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, cabría esperar que cualquier GPU moderna pudiera ejecutarlo, pero no hay datos oficiales.
- Opciones de despliegue: runtime `phoonnx` (https://github.com/TigreGotico/phoonnx); también podría ejecutarse con ONNX Runtime si el grafo es compatible, aunque no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS-en-us-cmu_aup (este modelo) | GlowTTS | ONNX | en-us | other | Hugging Face (Phoonnx) |
| Voces Larynx (mycroft-ai) | GlowTTS / otros | ONNX / tflite | múltiples | según voz | Repositorio Larynx |
| Piper TTS | VITS | ONNX | múltiples | MIT (mayoría de voces) | Hugging Face / GitHub |
| Coqui TTS (XTTS, VITS) | VITS / XTTS | PyTorch / ONNX | múltiples | MPL-2.0 / CPML | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para este modelo concreto en la información proporcionada.

## Limitaciones y advertencias

- La licencia `other` no especifica términos concretos, lo que impide determinar si el uso comercial está permitido; es necesario contactar con el autor o consultar el repositorio original.
- No hay información sobre sesgos acústicos o de pronunciación; al derivar presumiblemente del corpus CMU ARCTIC, podría reflejar las características de los hablantes de dicho corpus.
- Riesgo de pronunciación incorrecta en palabras fuera de dominio, nombres propios o términos técnicos, habitual en modelos TTS entrenados con corpus limitados.
- El idioma está restringido al inglés estadounidense; no se documenta soporte multilingüe.
- No se han publicado métricas de calidad (MOS), benchmarks ni evaluaciones objetivas.
- El modelo tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-14) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error en los metadatos del repositorio.
- No se documentan limitaciones de longitud de texto de entrada ni comportamiento con textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_aup
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
