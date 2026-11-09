# MacEpic/pocket-tts-es-coreml

## Resumen

Pocket TTS Spanish for Core ML es una exportación a Core ML del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante para español. El modelo original es un sistema de text-to-speech de aproximadamente 100 millones de parámetros, descrito por Kyutai como un Continuous Audio Language Model que funciona más rápido que el tiempo real en CPU. Esta versión concreta ha sido convertida por MacEpic para su uso en TextSniper, una aplicación de macOS, mediante la herramienta de exportación del proyecto xn-ptts.

La relevancia de esta ficha radica en que ilustra un patrón cada vez más habitual: modelos de voz pequeños, abiertos y de baja latencia que se empaquetan en formatos nativos de plataforma (en este caso Core ML) para ejecutarse en dispositivos de consumo sin depender de la nube. El repositorio pesa 0,2 GB e incluye 15 ficheros por un total de 398.574.917 bytes, con pesos y tokenizador derivados de la carpeta `languages/spanish` del modelo base de Kyutai, sin modificaciones más allá de la conversión de formato.

Se trata de un artefacto muy específico: no es un modelo entrenado desde cero ni un fine-tuning, sino una conversión de pesos más un conjunto de voces precalculadas. Su interés para desarrolladores e investigadores es doble: por un lado, permite integrar TTS en español en aplicaciones Apple con Core ML; por otro, sirve como referencia de cómo se distribuye un modelo de voz con licencia CC BY 4.0 y con la trazabilidad de las grabaciones usadas para las voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cabecera flow de un paso (Continuous Audio Language Model); modelo de seis capas en la variante española |
| Parametros totales | Aproximadamente 100 M (modelo Pocket TTS de Kyutai) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos exportados a Core ML; no se documentan niveles de cuantización adicionales |
| Idiomas soportados | Español (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (bundle con `bundle.json`, 15 ficheros, 398.574.917 bytes); voces en formato `emb` de xn-ptts |

## Arquitectura y entrenamiento

El modelo base es Pocket TTS de Kyutai, un Continuous Audio Language Model de unos 100 millones de parámetros. La arquitectura es un transformer causal que emite un latente de audio continuo por frame a una tasa de 12,5 Hz, procesado por una cabecera flow de un solo paso; una cabecera adicional de fin de habla decide cuándo detener la generación. Esta combinación evita el esquema clásico de tokens discretos de audio y permite una inferencia más rápida que el tiempo real en CPU.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF o DPO. Lo que sí está documentado es el proceso de conversión: los pesos y el tokenizador provienen de la carpeta `languages/spanish` de `kyutai/pocket-tts-without-voice-cloning` y se han mantenido sin cambios salvo la conversión, realizada con el ejemplo `export_coreml` de xn-ptts 0.6.0 (licencias Apache 2.0 y MIT). El bundle incluye un `bundle.json` que lista cada fichero con su tamaño y su SHA-256, lo que facilita la verificación de integridad en producción.

Las voces incluidas (`estelle`, `alba`, `anna`, `bill`) se generaron con el codificador de voces de `kyutai/pocket-tts` a partir de grabaciones del repositorio `kyutai/tts-voices`, recortadas de silencio y con el token `bos_before_voice` antepuesto en el formato `emb` de xn-ptts. Las fuentes y licencias de cada grabación están documentadas en la model card.

## Capacidades

- Síntesis de voz en español a partir de texto, con salida de audio continuo generada frame a frame a 12,5 Hz.
- Inferencia más rápida que el tiempo real en CPU según las características del modelo base de Kyutai.
- Cuatro voces precalculadas listas para usar: `estelle`, `alba`, `anna` y `bill`.
- Ejecución nativa en el ecosistema Apple mediante Core ML, sin necesidad de servidores externos.
- Integración con la herramienta xn-ptts, que puede leer el bundle exportado.
- No se documentan capacidades de clonación de voz (el modelo base es explícitamente "without voice cloning"), tool calling, agentes, visión ni audio de entrada.
- No se documentan modos de razonamiento ni capacidades multilingües más allá del español.

## Casos de uso

- Lectura de texto en aplicaciones macOS: TextSniper descarga este bundle cuando el usuario selecciona Pocket TTS en español, de modo que la app puede convertir texto capturado de la pantalla en voz sin salir del dispositivo.
- Accesibilidad: integración de lectura en voz alta en apps para personas con discapacidad visual, aprovechando que el modelo corre en CPU y no requiere conexión a internet.
- Asistentes de voz locales: un asistente de escritorio puede sintetizar respuestas en español con baja latencia al ejecutarse sobre Core ML en el propio Mac.
- Generación de audiolibros o pódcasts de prototipo: el modelo permite convertir borradores de texto en audio con varias voces y licencia CC BY 4.0, siempre citando a Kyutai y las fuentes de las voces.
- Pruebas de integración de TTS en pipelines de CI para apps Apple: al ser un bundle Core ML con hashes SHA-256 en `bundle.json`, se puede verificar la integridad del artefacto en cada build.
- Investigación sobre TTS eficiente: sirve como referencia reproducible de exportación de un Continuous Audio Language Model a Core ML con la herramienta xn-ptts, útil para comparar latencias y calidad frente a otras variantes.
- Avisos y notificaciones habladas en español dentro de aplicaciones de productividad, con voces predefinidas y sin coste de API por llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB (398.574.917 bytes en 15 ficheros), por lo que el espacio en disco necesario es reducido.
- Al ser un modelo de aproximadamente 100 M de parámetros exportado a Core ML, está pensado para ejecutarse en CPU de equipos Apple; no se documentan requisitos de VRAM específicos.
- No se dispone de datos oficiales sobre GPU recomendadas, latencia ni throughput medidos para esta exportación concreta.
- El modelo base de Kyutai se describe como más rápido que el tiempo real en CPU, pero no se aportan cifras de rendimiento para la variante Core ML.
- Opciones de despliegue: Core ML en macOS y el lector de bundles de xn-ptts. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MacEpic/pocket-tts-es-coreml | ~100 M | No disponible | Español | CC BY 4.0 | Core ML |
| kyutai/pocket-tts-without-voice-cloning | ~100 M | No disponible | No disponible | CC BY 4.0 | Pesos originales de Kyutai |
| smdesai/pocket-tts-coreml | No disponible | No disponible | No disponible | No disponible | Core ML |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo base excluye explícitamente la clonación de voz, por lo que no debe esperarse esa funcionalidad.
- Solo soporta español; no se documentan otros idiomas en esta exportación.
- No se han publicado benchmarks ni métricas de calidad (MOS, WER) para esta variante Core ML, lo que impide evaluar su fidelidad frente al modelo original.
- Riesgo de alucinación y de errores de pronunciación inherente a los modelos TTS pequeños; no se documentan evaluaciones al respecto.
- La licencia CC BY 4.0 permite uso comercial, pero obliga a atribuir a Kyutai y a las fuentes de las voces (`kyutai/tts-voices`, VCTK, Voice-Zero/LibriVox, Alba MacKenna).
- Las voces tienen licencias individuales (CC0 o CC BY 4.0) que deben respetarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto reciente y poco validado por la comunidad.
- Al estar atado a Core ML, su portabilidad fuera del ecosistema Apple es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MacEpic/pocket-tts-es-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts
- Documentación de Pocket TTS en Transformers: https://huggingface.co/docs/transformers/en/model_doc/pocket_tts
- Repositorio xn-ptts: https://github.com/gradium-ai/xn-ptts
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Modelo Pocket TTS de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Variante Core ML de smdesai: https://huggingface.co/smdesai/pocket-tts-coreml
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
