# Hebrish/Sabich-GGUF

## Resumen

Sabich-GGUF es la conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) Hebrish/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-All-Subsets, un ajuste fino de la familia Parakeet orientado a transcripción bilingüe hebreo-inglés con cambios de idioma dentro de una misma frase (code-switching). Lo publica el usuario Hebrish y su interés principal es práctico: empaqueta un modelo de 617.869.958 parámetros en GGUF para poder ejecutarlo con el runtime transcribe.cpp, pensado para inferencia ligera sobre CPU y ggml.

Frente a los modelos ASR generalistas, la propuesta diferencial es el soporte nativo de code-switching hebreo-inglés, un escenario habitual en entornos tecnológicos, académicos y de diáspora donde el hablante alterna ambos idiomas en la misma intervención. El repositorio no incluye una model card descriptiva, por lo que la mayor parte de los detalles de entrenamiento, datos y evaluación no están documentados en la información disponible.

Es relevante ahora porque demuestra la viabilidad de exportar arquitecturas transducer (TDT) a GGUF, algo poco habitual en un ecosistema dominado por exportaciones de transformers tipo Whisper, y porque permite desplegar ASR bilingüe en hardware sin GPU. Como contrapartida, el modelo tiene 0 descargas y 0 likes, está restringido por gated access y no publica benchmarks, por lo que debe tratarse como un artefacto experimental a validar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) de la familia Parakeet, según las etiquetas del repositorio; detalle de encoder/decoder no disponible |
| Parametros totales | 617.869.958 (aproximadamente 0,62 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; se trata de un modelo ASR y la ventana de audio soportada no está documentada |
| Tipos de cuantizacion | No disponible; el repositorio es GGUF (2,4 GB) pero no se detallan los niveles incluidos (Q4_K_M, Q8_0, F16, etc.) |
| Idiomas soportados | Inglés (en) y hebreo (he), con code-switching entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF, para el runtime transcribe.cpp |
| Pipeline | automatic-speech-recognition |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Modelo base | Hebrish/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-All-Subsets |
| DOI | 10.57967/hf/11102 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transducer TDT (Token-and-Duration Transducer), la variante de Parakeet que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por bloques y reduce la latencia frente a los transducers clásicos. Las etiquetas del repositorio confirman `parakeet` y `tdt`, pero la información proporcionada no detalla la configuración del encoder, el número de capas, la dimensión del modelo ni el vocabulario del tokenizador.

El modelo base se denomina "All-Subsets", lo que sugiere un ajuste fino sobre múltiples subconjuntos de datos con code-switching hebreo-inglés, aunque la composición exacta del dataset, el número de horas de audio, el volumen de tokens y si hubo etapas de RLHF o DPO no están disponibles. Tampoco se documenta si el ajuste incluyó puntuación, capitalización o normalización de texto. La innovación técnica relevante del repositorio es la propia conversión a GGUF para transcribe.cpp, que habilita inferencia en CPU mediante ggml sobre una arquitectura transducer poco representada en ese ecosistema.

## Capacidades

- Transcripción automática de voz a texto en inglés y hebreo.
- Reconocimiento de code-switching: cambios de idioma dentro de una misma frase o intervención, el caso de uso central del ajuste "All-Subsets".
- Inferencia sobre CPU mediante el runtime transcribe.cpp y pesos GGUF, sin necesidad de GPU.
- Compatibilidad con el pipeline `automatic-speech-recognition` de HuggingFace para integración en pipelines existentes.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de visión, audio-vision o thinking mode: no disponibles.
- Puntuación, capitalización, timestamps a nivel de palabra, diarización de hablantes y traducción: no documentadas en la información disponible.

## Casos de uso

- Transcripción de reuniones técnicas bilingües hebreo-inglés: equipos de I+D en Israel alternan hebreo e inglés en la misma frase; el ajuste específico sobre code-switching evita el fallo típico de los ASR monolingües, que fuerzan todo el audio al idioma dominante.
- Subtitulado de contenido audiovisual: generación de transcripciones para vídeos, pódcasts y webinars dirigidos a audiencias mixtas, con la ventaja de ejecutarse en CPU y abaratar el procesado por lotes en servidores sin GPU.
- Analítica de contact center: transcripción de llamadas de soporte donde el agente habla hebreo y usa terminología técnica en inglés, para posteriormente alimentar sistemas de calidad, búsqueda o clasificación de motivos de llamada.
- Investigación lingüística sobre code-switching: obtención de transcripciones anotadas de corpus orales hebreo-inglés para estudiar patrones de alternancia de código, préstamos léxicos y frecuencia de cambio.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con transcribe.cpp sobre CPU, permite transcribir audio sensible (clínico, legal, RRHH) sin enviar datos a servicios en la nube.
- Prototipado y aplicaciones de escritorio offline: dictado y toma de notas en herramientas locales para usuarios hispanohablantes no aplica, pero sí para usuarios hebreo-inglés que necesitan transcripción sin conectividad.
- Preprocesado de datasets de voz: generación de transcripciones a gran escala en máquinas sin GPU para construir corpus de entrenamiento o evaluar otros sistemas ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye WER, CER ni comparaciones con Whisper, Parakeet-TDT-0.6B-v2 u otros sistemas, ni sobre hebreo, ni sobre inglés, ni sobre conjuntos con code-switching.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 617,87 M de parámetros, no confirmado por el autor): aproximadamente 1,24 GB en FP16, 0,62 GB en INT8 y 0,31 GB en INT4, más overhead de activaciones y del decoder TDT.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente en la práctica; una RTX 4090, A100 o H100 está sobredimensionada para este modelo y solo tendría sentido para procesar muchos flujos en paralelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 o superiores; también en iGPU con memoria unificada.
- Despliegue: transcribe.cpp es el runtime previsto (etiqueta del repositorio); el uso de vLLM o TGI no aplica porque no es un modelo de lenguaje. La compatibilidad con llama.cpp u Ollama no está indicada y es improbable al tratarse de un transducer ASR.
- El tamaño del repositorio (2,4 GB) sugiere que incluye varias cuantizaciones del mismo modelo, lo que facilita elegir entre precisión y velocidad.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor) ni de velocidad de decodificación en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Hebrish/Sabich-GGUF | 617,87 M | en, he (code-switching) | No disponible | CC-BY-4.0 | GGUF | Gated, 0 descargas |
| Hebrish/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-All-Subsets (modelo base) | 0,6 B (según denominación) | en, he | No disponible | No disponible en la información proporcionada | No disponible | No disponible |
| Whisper (variantes de OpenAI) | No disponible en la información proporcionada | Multilingüe (no se detalla cobertura de hebreo) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre su calidad.
- Ausencia total de benchmarks: no hay WER ni CER publicados en inglés, hebreo o code-switching, por lo que el rendimiento real es desconocido.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que complica la automatización de despliegues, la reproducibilidad y la integración en CI/CD.
- Documentación mínima: no hay model card con detalles de entrenamiento, datos, tokenizador ni configuración de decodificación.
- Cobertura lingüística limitada a inglés y hebreo; no está indicado el soporte de otros idiomas ni se ha evaluado el comportamiento con acentos no nativos.
- Riesgo de alucinación típico de los sistemas ASR: inserción de texto en segmentos de silencio, ruido o solapamiento de hablantes, especialmente en material fuera de dominio.
- Sin información sobre puntuación, capitalización, timestamps o diarización, lo que limita su uso directo en subtitulado profesional.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y al modelo base; conviene revisar también las condiciones del modelo original de Parakeet y del acceso gated.
- Fecha de creación del repositorio (2026-10-20) y ausencia de historial de actualizaciones: no hay garantía de mantenimiento.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces encontrados no guardan relación con él y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Sabich-GGUF
- Modelo base: https://huggingface.co/Hebrish/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-All-Subsets
- DOI del repositorio: https://doi.org/10.57967/hf/11102
- transcribe.cpp: runtime referenciado en las etiquetas del repositorio; no se ha encontrado URL en la información disponible.
- La búsqueda web no aportó papers, blogs, repositorios ni demos adicionales sobre este modelo.
