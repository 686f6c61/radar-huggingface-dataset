# ggml-org/drama-3-GGUF

## Resumen

drama-3 es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Fish Audio y distribuido en formato GGUF por ggml-org, el equipo detrás de llama.cpp. El modelo base, `fishaudio/drama-3`, se ha convertido automáticamente al formato GGUF mediante la herramienta `ggml-org/convert`, lo que permite ejecutarlo en la infraestructura de llama.cpp a través de las herramientas `llama-tts` y `llama serve` con un endpoint `/tts` dedicado.

Con aproximadamente 34.700 millones de parámetros (34.676.863.616 según los pesos en safetensors), drama-3 se posiciona como un modelo TTS de gran escala orientado a la generación de voz multi-hablante. Su característica más destacable es el soporte de etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`), que permiten asignar voces diferenciadas a hasta 16 personajes dentro de una misma generación, lo que lo hace adecuado para diálogos, audiolibros y doblaje.

La relevancia de esta ficha radica en que se trata de una conversión GGUF reciente (noviembre de 2026) pensada para despliegue local y en servidor mediante llama.cpp, lo que facilita su integración en pipelines de audio sin depender de infraestructura propietaria. No obstante, la licencia Fish Audio Research/Community limita el uso comercial, y el clonado de voz aún no está soportado en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; arquitectura del modelo base no detallada en la información proporcionada) |
| Parametros totales | 34.676.863.616 (~34,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no especificadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-research-license (Fish Audio Community License) |
| Formato de pesos | GGUF (pesos originales del modelo base en safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base `fishaudio/drama-3` (tipo de transformer, mecanismo de atención, códec de audio empleado ni estrategia de tokenización acústica). Lo que sí se conoce es que se trata de un modelo de text-to-speech de gran escala con aproximadamente 34,7 mil millones de parámetros, y que la conversión a GGUF ha sido realizada automáticamente por `ggml-org/convert`, el pipeline de conversión del ecosistema llama.cpp.

El rasgo funcional documentado es el uso de etiquetas de hablante (`<|speaker:0|>` … `<|speaker:15|>`) que permiten asignar hasta 16 voces distintas en una misma secuencia de generación. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano, con salida en formato WAV.
- Generación multi-hablante: soporte de hasta 16 voces diferenciadas mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Ejecución local desde terminal con `llama-tts` y despliegue en servidor con `llama serve` y endpoint `/tts`.
- Compatibilidad con el ecosistema llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Orientación conversacional (tag `conversational`), adecuada para diálogos entre personajes.
- Clonado de voz: no soportado en esta conversión (indicado explícitamente en la model card).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes y razonamiento multi-paso: no aplicables (modelo TTS).

## Casos de uso

- Audiolibros multi-personaje: el modelo permite asignar una voz distinta a cada personaje mediante las etiquetas `<|speaker:N|>`, de modo que un mismo guion con diálogos puede renderizarse en una sola pasada sin concatenar fragmentos de audio de distintos modelos.
- Doblaje y localización de contenido: para escenas con varios interlocutores, se puede generar el audio completo respetando turnos de habla etiquetados, reduciendo el trabajo manual de segmentación y ensamblaje.
- Generación de audio para videojuegos y narrativa interactiva: los 16 slots de hablante permiten cubrir el elenco principal de un título indie sin necesidad de entrenar voces personalizadas.
- Prototipado de asistentes conversacionales: con `llama serve` y el endpoint `/tts`, se puede integrar la síntesis en un servicio HTTP local para pruebas de experiencia de usuario antes de contratar un TTS comercial.
- Accesibilidad y lectura de contenido: conversión de documentos largos a audio en local, sin enviar texto a servicios en la nube, útil en entornos con requisitos de privacidad.
- Investigación en TTS: al estar en formato GGUF y ser ejecutable con llama.cpp, sirve como banco de pruebas reproducible para experimentos de síntesis multi-hablante en hardware de consumo o servidor.
- Generación de podcasts sintéticos: guiones con dos o más locutores pueden renderizarse con voces diferenciadas y ensamblarse directamente en la salida WAV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con ~34,7 mil millones de parámetros, las necesidades dependen fuertemente de la cuantización GGUF elegida; a título orientativo, las cuantizaciones de 4 bits suelen situarse en el rango de ~18-22 GB y las de 8 bits en ~35-40 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar GPU de 24 GB o más para cuantizaciones bajas y A100/H100 para precisión alta, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (129,8 GB) sugiere que solo las cuantizaciones más agresivas podrían caber en GPUs de consumo de gama alta.
- Opciones de despliegue: `llama-tts` (CLI) y `llama serve` con endpoint `/tts`, ambos del ecosistema llama.cpp. No se documentan otras opciones (vLLM, TGI, Ollama) para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ggml-org/drama-3-GGUF | ~34,7 B | no disponible | fish-audio-research-license | GGUF | TTS multi-hablante (16 voces), sin clonado en esta conversión |
| fishaudio/drama-3 | ~34,7 B (mismo modelo base) | no disponible | fish-audio-research-license | safetensors | Modelo original; la conversión GGUF deriva de él |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia restrictiva: Fish Audio Research/Community License; uso gratuito para investigación y fines no comerciales, con uso comercial limitado. Es imprescindible revisar el texto completo antes de cualquier despliegue en producción.
- Clonado de voz no soportado en esta conversión GGUF, según indica la propia model card.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas sin validación empírica.
- Riesgo de alucinación acústica y errores de pronunciación: inherente a los modelos TTS; no hay datos de evaluación publicados que permitan cuantificarlo.
- Sesgos de voz: no se documentan sesgos conocidos, pero al no haber información sobre la composición del dataset de entrenamiento no es posible descartar sesgos de género, acento o registro.
- Tamaño elevado: ~34,7 B de parámetros y un repo de 129,8 GB implican requisitos de almacenamiento y memoria considerables; el despliegue en entornos modestos requiere cuantizaciones agresivas cuya calidad no está documentada.
- Conversión automática: al haberse generado con `ggml-org/convert`, pueden existir diferencias de comportamiento frente al modelo original en safetensors; conviene validar la calidad del audio antes de producción.
- Sin benchmarks publicados: no hay métricas objetivas de naturalidad, inteligibilidad ni fidelidad de hablante disponibles en la información proporcionada.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/ggml-org/drama-3-GGUF
- Modelo base original: https://huggingface.co/fishaudio/drama-3
- Licencia del modelo base: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Documentación de TTS en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#drama-3
- Herramienta de conversión: https://github.com/ggml-org/convert
