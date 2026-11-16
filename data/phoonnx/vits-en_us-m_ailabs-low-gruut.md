# Phoonnx/vits-en_us-m_ailabs-low-gruut

## Resumen

`vits-en_us-m_ailabs-low-gruut` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente desarrollado por Mycroft AI para su conjunto de voces Mimic3 y reempaquetado por Phoonnx en formato ONNX para su librería de TTS `phoonnx`. El modelo genera audio en inglés estadounidense (`en-US`) a partir de texto, utilizando fonemas IPA producidos por el fonemizador gruut como representación intermedia de entrada.

La relevancia de este modelo es fundamentalmente práctica: se trata de una voz "low" (de recursos reducidos) pensada para despliegue en entornos con pocos recursos computacionales, como asistentes de voz locales (OVOS/Mycroft), sistemas embebidos o aplicaciones de escritorio donde no es viable ejecutar modelos neuronales de TTS de gran tamaño. El reempaquetado en ONNX y su integración con el ecosistema phoonnx/scriptconv facilitan su uso sin depender de frameworks de deep learning completos.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en el sentido de LLM, ya que es un modelo TTS) ni detalles del dataset de entrenamiento más allá de la referencia al repositorio upstream de Mycroft AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder integrado, entrenado de extremo a extremo con pérdidas adversariales y de verosimilitud. La variante "low" indica una configuración reducida en tamaño y capacidad respecto a otras voces del catálogo Mimic3, orientada a minimizar requisitos de cómputo y memoria.

La entrada de texto no es texto crudo sino fonemas IPA generados por el fonemizador gruut, gestionado a través de la librería `scriptconv` de Phoonnx. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus (más allá de la referencia al dataset `m-ailabs` del upstream de Mycroft AI), ni sobre el uso de técnicas de ajuste como RLHF o DPO, que no aplican habitualmente a modelos TTS de esta familia. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (integrado vía `scriptconv[gruut]`).
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución sobre runtime ONNX, lo que permite inferencia sin dependencia de PyTorch en producción.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo "thinking".
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz locales: integración como motor TTS en instalaciones de OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en inglés sin conexión a servicios en la nube y con requisitos de recursos mínimos.
- Sistemas embebidos y dispositivos de bajo consumo: al ser una voz "low" empaquetada en ONNX, puede ejecutarse en placas como Raspberry Pi o dispositivos IoT donde un TTS neuronal completo no cabría en memoria.
- Lectura de notificaciones y alertas: generación de avisos hablados en aplicaciones de escritorio o domótica, sintetizando frases cortas en tiempo real con latencia reducida.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en inglés, aprovechando la licencia CC-BY-SA-4.0 para su redistribución en proyectos abiertos.
- Pruebas y desarrollo de pipelines TTS: uso como voz de referencia para validar integraciones con phoonnx y scriptconv antes de desplegar voces de mayor calidad.
- Prototipado de interfaces conversacionales: generación rápida de audio de prueba en inglés para demos de asistentes, chatbots de voz o sistemas de IVR en fase de desarrollo.
- Generación de contenido educativo o de documentación hablada: síntesis por lotes de textos en inglés para materiales de aprendizaje, dado el bajo coste computacional por utterance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de una voz "low" empaquetada en ONNX y con un repositorio de 0,1 GB, se espera un consumo de memoria muy reducido (del orden de cientos de MB o menos), aunque no se documenta una cifra exacta.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU mediante runtime ONNX.
- Compatibilidad con GPU de consumo: no documentada, pero por su tamaño reducido es plausible su ejecución en CPU sin GPU dedicada.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y runtime ONNX subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `vits-en_us-m_ailabs-low-gruut` (este) | VITS "low" | en-US | ONNX | CC-BY-SA-4.0 | Voz de bajos recursos empaquetada para phoonnx |
| Otras voces Mimic3 `en_US` (p. ej. variantes `high`) | VITS | en-US | ONNX | CC-BY-SA-4.0 | Misma familia upstream; mayor calidad a costa de más cómputo (datos concretos no disponibles) |
| Modelos TTS neuronales de gran tamaño (p. ej. familias tipo Tacotron2 o VITS de mayor capacidad) | variable | multilingüe en algunos casos | variable | variable | No se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de datos de benchmarks ni de parámetros comparables de modelos alternativos en la información proporcionada; la comparativa se limita a la familia upstream Mimic3.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza comprensión de lenguaje, razonamiento ni generación de texto; no debe evaluarse con métricas de LLM.
- Idioma limitado a inglés estadounidense (`en-US`); el texto en otros idiomas o con pronunciación no inglesa producirá resultados incorrectos.
- Dependencia del fonemizador gruut: la calidad de la síntesis depende de la correcta fonemización del texto de entrada; errores en la normalización afectan directamente al audio.
- Al ser una voz "low", la calidad prosódica y naturalidad del audio es previsiblemente inferior a la de voces de mayor capacidad de la misma familia; no se documentan métricas objetivas (MOS) que lo cuantifiquen.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- No se documentan sesgos específicos del modelo; al ser un modelo TTS entrenado sobre un corpus concreto, puede reflejar características del hablante o del dataset original (no detalladas).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta o artefactos de audio ante entradas fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni de mantenimiento activo más allá de la publicación inicial.
- Fecha de creación y actualización registradas como 2026-11-16, dato que conviene verificar en la página del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-m_ailabs-low-gruut
- Upstream (Mycroft AI, mimic3-voices, voz `en_US/m-ailabs_low`): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/m-ailabs_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
