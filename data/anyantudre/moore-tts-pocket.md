# anyantudre/moore-tts-pocket

## Resumen

moore-tts-pocket es un modelo de texto a voz (TTS) desarrollado por el usuario anyantudre a partir de un ajuste fino (finetune) de kyutai/pocket-tts, el modelo ligero de síntesis de voz de Kyutai. Su propósito es llevar la síntesis de voz al mooré (mos), lengua hablada en Burkina Faso y clasificada como de recursos escasos (low-resource), un ámbito donde las soluciones TTS comerciales y de código abierto son prácticamente inexistentes.

El modelo conserva la arquitectura compacta del modelo base, con aproximadamente 109,5 millones de parámetros distribuidos en pesos safetensors (unos 0,4 GB de repositorio), lo que lo hace especialmente adecuado para ejecutarse en hardware modesto o incluso en dispositivos de bolsillo, de ahí el sufijo "pocket". Incluye además capacidades de clonación de voz heredadas de la familia pocket-tts.

Su relevancia radica en la escasez de modelos de voz para lenguas africanas de bajos recursos: fichas como esta amplían la cobertura de tecnologías de habla para comunidades que históricamente han quedado fuera de los grandes modelos multilingües. Nótese que se trata de un modelo con acceso restringido (gated) en HuggingFace, con muy poca adopción registrada hasta la fecha (0 descargas, 1 like).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (finetune de kyutai/pocket-tts, arquitectura TTS compacta tipo pocket) |
| Parametros totales | 109.502.146 (~109,5 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mooré (mos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de kyutai/pocket-tts, la familia de modelos TTS ultraligeros de Kyutai diseñada para síntesis de voz de baja latencia en entornos con recursos limitados. Con unos 109,5 millones de parámetros y 0,4 GB de pesos, está pensado para inferencia eficiente, heredando del modelo base las capacidades de generación de voz natural y clonación de voz (voice cloning) a partir de muestras de audio de referencia.

No se ha publicado información sobre el dataset de entrenamiento empleado para la adaptación al mooré, el número de horas de audio, ni el procedimiento de ajuste (por ejemplo, si se uso fine-tuning del decodificador acústico, adaptadores o entrenamiento completo). Tampoco hay detalles sobre innovaciones técnicas específicas de esta variante más allá de la herencia del modelo base. La etiqueta "mos" en el repositorio indica que el modelo está especializado en mooré, lengua voltaica hablada por varios millones de personas en Burkina Faso.

## Capacidades

- Sintesis de texto a voz en mooré (mos), una de las pocas opciones TTS disponibles para esta lengua.
- Clonación de voz (voice cloning), capacidad heredada de la familia pocket-tts, que permite generar voz a partir de una muestra de audio de referencia.
- Ejecución en hardware ligero gracias a su tamaño reducido (~110 M de parametros, 0,4 GB de pesos).
- Salida en formato de audio para integración en aplicaciones de lectura de texto, asistentes o radiodifusión comunitaria.
- No hay información disponible sobre soporte de tool calling, capacidades de agentes, ni modos de razonamiento: se trata de un modelo TTS puro, no de un modelo de lenguaje.

## Casos de uso

- Lectura de contenidos en mooré: integración en aplicaciones móviles o webs para leer noticias, textos educativos o mensajes de salud pública a hablantes de mooré con dificultades de lectura.
- Radiodifusión comunitaria: generación de locuciones para emisoras rurales de Burkina Faso que emiten en lenguas locales, reduciendo costes de producción de audio.
- Accesibilidad: soporte de voz para personas con discapacidad visual en servicios digitales locales que operan en mooré.
- Educación y alfabetización: materiales de aprendizaje de lectura con audio generado, útiles en programas de alfabetización de adultos en lenguas nacionales burkinesas.
- Sistemas de respuesta de voz interactiva (IVR): menús y avisos telefónicos en mooré para servicios bancarios móviles, agrícolas o de salud.
- Clonación de voz para producción de contenido: creación de narraciones consistentes con una voz de referencia para audiolibros o podcasts en mooré sin necesidad de sesiones de grabación prolongadas.
- Recolección y validación de datos de habla: uso como componente TTS en pipelines de investigación sobre lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para el modelo base kyutai/pocket-tts se han reportado evaluaciones tipo MOS (mean opinion score) en la literatura de Kyutai, pero no existen mediciones publicadas específicas de esta variante en mooré ni comparativas con otros sistemas TTS para lenguas de bajos recursos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~110 M de parámetros en fp16, el modelo ocupa aproximadamente 0,2-0,3 GB de VRAM solo para pesos; en la práctica, unos 1-2 GB de VRAM deberian bastar con margen para buffers de audio (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU moderna es suficiente; el tamaño reducido hace viable la ejecución en GPUs de consumo como una RTX 3060 o incluso integradas. Es plausible la ejecución en CPU dado el tamaño, aunque no hay datos publicados de latencia.
- Consumer GPU: sí, cabe con holgura en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: no disponible de forma específica; al ser un modelo TTS compacto, opciones típicas serian inferencia directa con PyTorch/safetensors o via Spaces de HuggingFace. No hay evidencia de soporte verificado en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la familia pocket-tts está diseñada para baja latencia, pero no hay cifras publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| anyantudre/moore-tts-pocket | ~109,5 M | mooré (mos) | CC-BY-4.0 | Finetune de pocket-tts, acceso gated |
| kyutai/pocket-tts (base) | no disponible | multilingüe (principalmente inglés) | no disponible | Modelo base, TTS ultraligero de Kyutai |
| MMS-TTS (Meta) | no disponible | +1.100 lenguas, incluye mooré (mos) | CC-BY-NC-4.0 | Cobertura amplia de lenguas de bajos recursos, licencia no comercial |
| Suno/bark | ~900 M | multilingüe | MIT | TTS generativo, mayor consumo de recursos |

La principal ventaja diferencial de moore-tts-pocket frente a alternativas multilingües genéricas es su especialización en mooré con una licencia permisiva (CC-BY-4.0, apta para uso comercial con atribución), frente a la restricción no comercial de MMS-TTS.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones del repositorio en HuggingFace antes de descargar los pesos.
- Adopcion minima: 0 descargas y 1 like registrados, sin comunidad de uso ni reportes de calidad; conviene validar la inteligibilidad del audio generado antes de cualquier despliegue.
- Calidad no evaluada publicamente: no hay benchmarks MOS ni evaluaciones de inteligibilidad para mooré, por lo que el riesgo de artefactos de audio o pronunciación incorrecta es desconocido.
- Riesgo de clonación de voz indebida: al heredar capacidades de voice cloning, el uso para suplantación de identidad o desinformación es un riesgo etico y legal; se recomienda consentimiento explicito de las voces clonadas.
- Cobertura lingüística limitada: el modelo está especializado en mooré; no hay informacion sobre soporte de otras variantes dialectales o lenguas vecinas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero requiere acreditar al autor y puede heredar restricciones del modelo base kyutai/pocket-tts que conviene verificar.
- Documentacion escasa: no hay detalles publicados sobre datos de entrenamiento, lo que dificulta evaluar sesgos de género, acento o registro en la voz generada.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/anyantudre/moore-tts-pocket
- Modelo base (kyutai/pocket-tts): https://huggingface.co/kyutai/pocket-tts
- Paper, blog o demo del modelo base: no disponible en la informacion proporcionada
