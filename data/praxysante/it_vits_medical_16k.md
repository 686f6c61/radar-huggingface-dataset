# PraxySante/IT_VITS_medical_16k

## Resumen

IT_VITS_medical_16k es un modelo de síntesis de voz (text-to-speech) en italiano desarrollado por PraxySante, entrenado desde cero con la arquitectura VITS de Coqui TTS. Está especializado en habla médica y científica, con un muestreo de 16 kHz en mono y un total de 3.942 hablantes distintos. El modelo se distribuye bajo licencia Apache-2.0 y su repo ocupa aproximadamente 1 GB.

El modelo resuelve la necesidad de generar voz sintética en italiano para dominios clínicos y científicos, donde el vocabulario técnico y las abreviaturas son frecuentes. A diferencia de los sistemas TTS multilingües generalistas, este modelo se ha entrenado exclusivamente con 51.958 clips (97,05 horas) de audio médico, lo que lo hace adecuado para aplicaciones de lectura de informes, asistencia sanitaria o documentación científica en italiano.

La relevancia actual del modelo es limitada pero específica: cubre un nicho (TTS médico en italiano) con una arquitectura consolidada como VITS, si bien sus métricas de evaluación publicadas (CER del 88,09 % y WER del 95,81 % medidas con un ASR interno) indican una calidad de síntesis muy baja según los criterios estándar, lo que debe tenerse en cuenta antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), extremo a extremo, sin fonemizador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada limitada a 50 caracteres a nivel de grafema) |
| Tipos de cuantizacion | no disponible (pesos publicados en `best_model.pth`, formato PyTorch) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pth`) con `config.json` y `speakers.pth` |
| Frecuencia de muestreo | 16.000 Hz, mono |
| Numero de hablantes | 3.942 |
| Entrada de texto | 50 caracteres, nivel de grafema, sin lexico fonetico |
| Puntuacion soportada | `. , ? !` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), implementada en Coqui TTS. Se trata de un sistema extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial, sin necesidad de fonemizador ni de léxico fonético: la entrada se procesa directamente a nivel de grafema. La salida es audio mono a 16 kHz.

El entrenamiento se realizó desde cero sobre 51.958 clips que suman 97,05 horas de audio médico y científico, con 3.942 hablantes y una duración media de clip de 6,72 segundos. Las transcripciones provienen de un sistema ASR y la puntuación se limita a `. , ? !`; el alfabeto de entrenamiento es exactamente el que aparece en la model card. Se entrenaron 145.000 pasos en total, aunque el checkpoint publicado corresponde al paso 58.464, seleccionado por mejor pérdida de evaluación y no por ser el último. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Síntesis de voz en italiano a partir de texto a nivel de grafema, sin fonemizador.
- Soporte multi-hablante con 3.942 voces distintas identificables mediante `speakers.pth`.
- Generación de audio mono a 16 kHz.
- Especialización en vocabulario médico y científico, incluyendo terminología técnica y abreviaturas frecuentes en el dominio.
- Manejo de puntuación básica (`. , ? !`) para prosodia y pausas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al italiano.

## Casos de uso

- Lectura de informes clínicos: el modelo puede convertir textos médicos en audio para revisión por parte de personal sanitario o para accesibilidad de pacientes, gracias a su entrenamiento específico en vocabulario clínico y a la variedad de 3.942 voces para asignar un hablante distinto a cada contexto.
- Asistencia por voz en entornos sanitarios: integración en sistemas de dictado o consulta de historiales donde se requiere síntesis en italiano con terminología especializada, usando la selección de hablante para adaptar el tono al profesional o al paciente.
- Accesibilidad de documentación científica: conversión de artículos, guías clínicas o prospectos en audio para personas con discapacidad visual, aprovechando la cobertura de vocabulario técnico del corpus de entrenamiento.
- Formación y simulación clínica: generación de locuciones sintéticas con múltiples hablantes para escenarios de entrenamiento médico, donde la variedad de voces permite simular diálogos entre profesionales.
- Pre-producción de contenido divulgativo sanitario: creación de borradores de audio para vídeos o pódcast de divulgación médica en italiano, con revisión humana posterior dada la calidad limitada del modelo.
- Investigación en TTS médico: uso como línea base o punto de partida para experimentos de síntesis de voz en dominio clínico en italiano, dado que se distribuye con pesos, configuración y utilidades de síntesis.
- Prototipado de interfaces voz-first en italiano para aplicaciones de salud: validación temprana de flujos conversacionales antes de invertir en un modelo TTS de mayor calidad.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la model card son los siguientes, medidos sobre 30 enunciados sintéticos y evaluados con un modelo ASR interno en streaming:

| Metrica | Valor |
|---|---|
| CER | 88,09 % |
| WER | 95,81 % |

El autor indica que estos valores son cotas superiores, ya que el ASR juez es imperfecto sobre habla médica espontánea y parte del error corresponde al evaluador, no al TTS. No se han publicado comparaciones con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo ocupa 1 GB, lo que sugiere que el modelo es ligero y probablemente quepa en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repo (1 GB) es plausible que funcione en GPUs consumer, pero no hay datos oficiales.
- Opciones de despliegue: Coqui TTS mediante `TTS.utils.synthesizer.Synthesizer` con `tts_checkpoint`, `tts_config_path` y `tts_speakers_file`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales con otros modelos TTS en la información proporcionada. Como referencia cualitativa, se pueden considerar alternativas de la misma categoría (TTS multi-hablante en italiano), aunque sin datos comparativos verificados:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IT_VITS_medical_16k | no disponible | 50 caracteres de entrada | CER 88,09 %, WER 95,81 % (ASR interno) | Apache-2.0 | Hugging Face |
| Alternativas TTS multi-hablante en italiano | no disponible | no disponible | no disponible | variable | no disponible |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Limitaciones y advertencias

- Las transcripciones provienen de un ASR, por lo que nombres de fármacos poco frecuentes y abreviaturas pueden pronunciarse incorrectamente.
- No incluye normalización de texto: los números y abreviaturas deben escribirse desarrollados antes de la síntesis.
- La similitud de hablante está limitada por las grabaciones de origen; el modelo se entrenó desde cero con pocos minutos a pocas horas por hablante y no clona voces arbitrarias.
- Las métricas publicadas (CER 88,09 %, WER 95,81 %) indican una calidad de síntesis muy baja según estándares habituales; deben interpretarse con cautela por las limitaciones del ASR juez, pero no permiten recomendar el modelo para producción sin validación adicional.
- El modelo solo soporta italiano; no es multilingüe.
- La entrada está limitada a 50 caracteres a nivel de grafema, lo que restringe la longitud de las locuciones por pasada.
- La puntuación se limita a `. , ? !`; otros signos no están contemplados.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No se documentan sesgos específicos, pero al entrenarse con un corpus médico concreto puede reflejar sesgos de ese dominio y de los hablantes que lo componen.

## Enlaces

- Hugging Face: https://huggingface.co/PraxySante/IT_VITS_medical_16k
- Coqui TTS (framework utilizado): https://github.com/coqui-ai/TTS
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
