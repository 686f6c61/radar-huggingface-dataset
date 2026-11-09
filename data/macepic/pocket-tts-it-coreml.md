# MacEpic/pocket-tts-it-coreml

## Resumen

Pocket TTS Italian for Core ML es una conversión del modelo de síntesis de voz Pocket TTS de Kyutai, especializada en italiano y empaquetada en formato Core ML para su ejecución nativa en el ecosistema Apple. El autor de la conversión es MacEpic, que la publica como parte de la integración de Pocket TTS en la aplicación TextSniper: la app descarga este paquete cuando el usuario selecciona Pocket TTS como motor de voz para italiano. El modelo base es `kyutai/pocket-tts-without-voice-cloning`, sin cambios en pesos ni tokenizador más allá de la conversión de formato.

Se trata de un modelo de seis capas orientado a text-to-speech de baja latencia y huella reducida, pensado para inferencia local en dispositivos de Apple. El repositorio ocupa 0,2 GB e incluye 15 archivos con un total de 398.574.893 bytes, verificables mediante SHA-256 a través del manifiesto `bundle.json`. La licencia es CC BY 4.0, heredada del modelo original de Kyutai, y el único idioma declarado es el italiano.

Su relevancia actual radica en que demuestra un patrón de despliegue práctico: modelos TTS pequeños convertidos a Core ML para su uso embebido en aplicaciones de escritorio, con voces precomputadas y un formato de bundle autocontenido que incluye pesos, tokenizador y embeddings de voz. No se dispone de información pública sobre arquitectura interna detallada, número de parámetros ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas (modelo base Pocket TTS de Kyutai); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el paquete Core ML se distribuye tal cual; el modelo base está etiquetado como `quantized` en Hugging Face) |
| Idiomas soportados | italiano (`it`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (bundle con `bundle.json`, 15 archivos, 398.574.893 bytes) |
| Tarea | text-to-speech |
| Tamaño del repositorio | 0,2 GB |
| Voces incluidas | estelle (CC0), alba (CC BY 4.0), anna (CC BY 4.0), bill (CC0) |
| Herramienta de conversión | `export_coreml` de xn-ptts 0.6.0 (Apache 2.0 / MIT) |

## Arquitectura y entrenamiento

El modelo base es `kyutai/pocket-tts-without-voice-cloning`, un sistema TTS de Kyutai del que esta ficha solo puede confirmar que la variante italiana emplea un modelo de seis capas. No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas del modelo original. La variante "without voice cloning" indica que el modelo base no incorpora clonación de voz a partir de audio de referencia arbitrario; las voces se incorporan como embeddings precomputados.

La conversión a Core ML se realizó con la herramienta `export_coreml` de xn-ptts 0.6.0, que genera un bundle con manifiesto `bundle.json` en el que se listan todos los archivos con su tamaño y hash SHA-256. Las voces incluidas en `voices/` se generaron con el codificador de voz de `kyutai/pocket-tts` a partir de grabaciones de `kyutai/tts-voices`, recortadas de silencio y con el token `bos_before_voice` antepuesto, en el formato de embedding `emb` propio de xn-ptts. Los pesos y el tokenizador corresponden a `languages/italian` del modelo base y no han sido modificados salvo por la conversión de formato.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano a partir de texto de entrada.
- Cuatro voces predefinidas: estelle, alba, anna y bill, cada una con su licencia documentada.
- Ejecución local en el ecosistema Apple mediante Core ML, sin dependencia de servicios en la nube.
- Formato de bundle autocontenido con verificación de integridad por SHA-256.
- Integración prevista con la aplicación TextSniper como motor TTS seleccionable para italiano.
- No se documenta soporte de clonación de voz (el modelo base es explícitamente "without voice cloning").
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura en voz alta en aplicaciones de macOS/iOS: el paquete Core ML permite integrar TTS italiano nativo en apps de accesibilidad, lectura de documentos o asistentes, ejecutándose en local sin enviar texto a servidores externos.
- Integración en TextSniper: caso de uso original del paquete, que la aplicación descarga cuando el usuario elige Pocket TTS para italiano en sus ajustes.
- Dictado inverso y verificación de texto: convertir a voz transcripciones OCR o texto extraído de imágenes para revisión auditiva, aprovechando el flujo de TextSniper.
- Prototipado de interfaces de voz en italiano: desarrolladores que necesiten un motor TTS ligero (0,2 GB) para demos o MVPs en plataformas Apple sin depender de APIs de terceros.
- Aplicaciones offline o con requisitos de privacidad: al ejecutarse en dispositivo, el texto del usuario no sale del equipo, adecuado para entornos con datos sensibles.
- Contenido educativo y de aprendizaje de idiomas: generación de locuciones en italiano con varias voces (masculinas y femeninas) para materiales didácticos.
- Pruebas de integración de pipelines TTS: el manifiesto `bundle.json` con hashes permite validar la integridad de artefactos en procesos de CI/CD de aplicaciones Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El paquete completo ocupa 398.574.893 bytes (aproximadamente 0,37 GiB); se requiere al menos ese espacio en disco más el espacio de trabajo de la aplicación.
- Al ser un modelo Core ML, está diseñado para ejecutarse en hardware Apple (Apple Silicon y, previsiblemente, dispositivos iOS/iPadOS compatibles con Core ML); no se documentan requisitos mínimos de chip ni de memoria.
- VRAM/RAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el formato Core ML implica uso de CPU, GPU o Neural Engine de Apple según la configuración de la app anfitriona.
- Compatibilidad con GPU de consumo NVIDIA (RTX 4090, etc.): no aplica directamente, ya que el paquete está en formato Core ML y no en safetensors ni GGUF.
- Opciones de despliegue: Core ML a través de la app anfitriona (TextSniper) o de la herramienta xn-ptts, que puede leer el bundle. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|---|
| MacEpic/pocket-tts-it-coreml | TTS (6 capas) | Italiano | Core ML | CC BY 4.0 | 0,2 GB | Conversión de Pocket TTS para Apple |
| kyutai/pocket-tts-without-voice-cloning | TTS | Multilingüe (incluye italiano) | Pesos originales de Kyutai | CC BY 4.0 | no disponible | Modelo base; sin clonación de voz |
| kyutai/pocket-tts | TTS | Multilingüe | Pesos originales de Kyutai | no disponible en esta ficha | no disponible | Incluye codificador de voz usado para generar las voces |

No se dispone de información suficiente para comparar rendimiento (latencia, naturalidad, MOS) con alternativas como Piper, Coqui TTS o modelos TTS comerciales; esos datos no están disponibles en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo declara soporte de italiano; no se garantiza un comportamiento correcto con otros idiomas.
- Sin clonación de voz: el modelo base es explícitamente "without voice cloning"; las voces disponibles son las cuatro incluidas en el paquete.
- Dependencia de plataforma: el formato Core ML limita su uso al ecosistema Apple; no es directamente utilizable en Linux o Windows sin reconversión.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, latencia ni robustez en la información disponible, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación y errores de pronunciación: no documentado para este modelo; como todo TTS, puede producir prosodia incorrecta en palabras poco frecuentes, siglas o nombres propios.
- Sesgos: no documentados; las voces provienen de grabaciones de terceros (VCTK, LibriVox, Voice-Zero, Kyutai), con la diversidad demográfica que ello implica y sin análisis de sesgo publicado.
- Licencia CC BY 4.0: permite uso comercial con atribución. Es obligatorio acreditar a Kyutai (Pocket TTS) y a las fuentes de las voces utilizadas (estelle: Kyutai, CC0; alba: Alba MacKenna, CC BY 4.0; anna: VCTK p228, CC BY 4.0; bill: Voice-Zero/LibriVox, CC0).
- Trazabilidad: la integridad del bundle depende del manifiesto `bundle.json`; conviene verificar los hashes SHA-256 antes de desplegarlo en producción.
- Popularidad mínima en Hugging Face (0 descargas, 0 likes en el momento de la consulta): no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MacEpic/pocket-tts-it-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Modelo con codificador de voz: https://huggingface.co/kyutai/pocket-tts
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts
- Kyutai: https://kyutai.org
- Herramienta de conversión xn-ptts: https://github.com/gradium-ai/xn-ptts
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
