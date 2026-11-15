# Phoonnx/glowtts-sw-biblia_takatifu

## Resumen

GlowTTS-sw-biblia_takatifu es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como una carpeta extraída del repositorio agregador `Phoonnx/phoonnx-glowtts`. Se trata de una voz concreta empaquetada para su uso con la librería phoonnx, un motor de inferencia TTS basado en ONNX que permite ejecutar modelos Larynx y GlowTTS sin depender de PyTorch en tiempo de ejecución. El identificador de voz asociado es `larynx/sw-biblia_takatifu-glow_tts`.

El modelo emplea la arquitectura GlowTTS, un sistema de síntesis neuronal no autorregresivo basado en flujo normalizador que transforma texto en espectrogramas mel y posteriormente en audio mediante un vocoder. GlowTTS se caracteriza por un entrenamiento más rápido y estable que los modelos autorregresivos como Tacotron 2, a costa de una expresividad algo menor. El sufijo "sw" sugiere idioma suajili y "biblia_takatifu" apunta a un corpus de dominio bíblico, aunque la model card no confirma explícitamente ni el idioma ni el dataset de entrenamiento.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0,1 GB y una licencia "other" sin especificar. No hay información pública sobre parámetros, contexto, benchmarks ni composición del dataset. Se documenta aquí como referencia técnica para quien evalúe voces TTS en suajili dentro del ecosistema phoonnx.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (flow-based, no autorregresiva) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin contexto de texto definido) |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (el prefijo "sw" sugiere suajili, sin confirmar) |
| Licencia | other (sin especificar) |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Identificador de voz | `larynx/sw-biblia_takatifu-glow_tts` |
| Fecha de creación | 2026-11-14 |
| Fecha de actualización | 2026-11-14 |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz no autorregresivo que combina un encoder de texto con un flujo normalizador invertible para modelar la distribución del espectrograma mel. A diferencia de Tacotron 2, que genera frames de forma secuencial, GlowTTS produce la secuencia completa en paralelo, lo que reduce la latencia y facilita el entrenamiento. La arquitectura incluye alineamiento monotónico aprendido (MAS, monotonic alignment search) para alinear fonemas y frames sin atención autorregresiva. El modelo exportado aquí está en formato ONNX y se ejecuta con la librería phoonnx, que actúa como runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de parámetros ni si hubo ajuste fino con RLHF o DPO. El nombre "biblia_takatifu" sugiere un corpus basado en la Biblia en suajili (Biblia Takatifu), lo que implicaría un dominio lingüístico muy acotado y un posible sesgo hacia vocabulario y prosodia religiosos. Tampoco se documenta el vocoder utilizado para convertir los espectrogramas mel en audio, ni la frecuencia de muestreo. La model card únicamente indica que los archivos conservan las rutas del repositorio original `Phoonnx/phoonnx-glowtts`.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en formato ONNX.
- Ejecución mediante la librería phoonnx, que permite inferencia sin PyTorch.
- Voz identificada como `larynx/sw-biblia_takatifu-glow_tts`, presumiblemente en suajili.
- Generación de audio no autorregresiva, adecuada para inferencia en CPU o GPU de forma paralela.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe más allá del posible suajili.
- No se documentan modos especiales (thinking, visión, audio de entrada, clonación de voz).
- No se documenta control de prosodia, emoción ni estilo.

## Casos de uso

- Lectura de textos bíblicos en suajili: el nombre del modelo sugiere un ajuste sobre la Biblia Takatifu, por lo que sería adecuado para narrar pasajes religiosos con prosodia coherente con ese dominio.
- Audiolibros de contenido religioso: permite convertir texto devocional en audio para distribución en comunidades de habla suajili.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten una voz en suajili dentro de aplicaciones basadas en phoonnx.
- Asistentes de voz de bajo coste: al ser ONNX y ejecutarse con phoonnx, puede desplegarse en dispositivos con recursos limitados sin GPU dedicada.
- Generación de avisos o mensajes pregrabados en suajili: útil en sistemas de megafonía o telefonía IVR con vocabulario acotado.
- Prototipado de pipelines TTS en el ecosistema phoonnx: sirve como voz de referencia para comparar con otras voces del repositorio `phoonnx-glowtts`.
- Investigación en TTS de bajos recursos: como ejemplo de voz entrenada sobre un corpus específico de dominio, útil para estudiar sobreajuste y cobertura léxica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño que probablemente quepa en menos de 1 GB de memoria.
- GPU recomendadas: no disponible; por el tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, pero no hay datos confirmados.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de 0,1 GB, aunque no está documentado.
- Opciones de despliegue: librería phoonnx (runtime principal); al ser ONNX, también podría ejecutarse con ONNX Runtime directamente, aunque no está documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| glowtts-sw-biblia_takatifu | GlowTTS | ONNX | other | Hugging Face, 0 descargas | Voz suajili de dominio bíblico, sin métricas |
| Otras voces de `Phoonnx/phoonnx-glowtts` | GlowTTS | ONNX | other | Hugging Face | Mismo runtime, distinto idioma/dominio |
| Modelos Larynx (p. ej. voces suajili) | Larynx (basado en GlowTTS/Tacotron) | ONNX | varía | Hugging Face / GitHub | Ecosistema más amplio, algunas voces documentadas |
| Coqui TTS (voces multilingües) | Tacotron 2 / VITS / GlowTTS | PyTorch / ONNX | MPL 2.0 (según modelo) | Hugging Face / GitHub | Mayor comunidad y documentación, pero requiere más recursos |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) para este modelo concreto.

## Limitaciones y advertencias

- Licencia "other" sin texto de licencia: no se especifican condiciones de uso comercial, atribución ni redistribución; es imprescindible contactar con el autor antes de usarlo en producción.
- Idiomas no confirmados: el prefijo "sw" sugiere suajili, pero la model card no lo declara; el uso en otro idioma produciría resultados degradados.
- Dominio muy acotado: el sufijo "biblia_takatifu" indica un corpus religioso, lo que puede provocar un sesgo léxico y prosódico hacia ese registro.
- Sin métricas de calidad: no hay MOS, ni comparaciones con otras voces, ni evaluación de inteligibilidad.
- Riesgo de alucinación acústica: como todo TTS, puede generar pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento (nombres propios, tecnicismos, siglas).
- Cero tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación externa y soporte.
- Sin información sobre el vocoder: se desconoce la calidad del audio final y la frecuencia de muestreo.
- Fecha de creación futura (2026-11-14): metadato anómalo que puede indicar un error de publicación o una fecha programada; conviene verificar la integridad del repositorio.
- No apto para clonación de voz ni control emocional: la arquitectura GlowTTS estándar no lo soporta y no se documenta ninguna extensión.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-sw-biblia_takatifu
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
