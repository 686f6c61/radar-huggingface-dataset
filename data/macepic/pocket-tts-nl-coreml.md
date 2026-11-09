# MacEpic/pocket-tts-nl-coreml

## Resumen

Pocket TTS Dutch for Core ML es una exportación del modelo de síntesis de voz Pocket TTS de Kyutai, concretamente la variante neerlandesa (`languages/dutch`) del checkpoint `kyutai/pocket-tts-without-voice-cloning`, convertida al formato Core ML por MacEpic para su integración en la aplicación TextSniper. El modelo resuelve la generación de voz en neerlandés a partir de texto, con voces predefinidas derivadas de grabaciones de dominio público y de licencia abierta, y está pensado para ejecutarse de forma local en el ecosistema Apple mediante Core ML.

La relevancia de esta ficha es acotada: se trata de una conversión de pesos, no de un modelo nuevo. Los pesos y el tokenizador son los de Kyutai, sin cambios salvo la conversión al formato Core ML, y el modelo base es la variante de seis capas de Pocket TTS. El repositorio ocupa 0,2 GB y contiene 15 ficheros que suman 398.573.513 bytes, según el `bundle.json` generado por la herramienta de exportación xn-ptts 0.6.0.

Al ser una exportación orientada a una aplicación concreta, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa o inexistente en la model card; esta ficha refleja únicamente lo que el autor documenta y marca como "no disponible" todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS de Kyutai (variante de seis capas), exportada a Core ML; arquitectura interna detallada no disponible |
| Parametros totales | no disponible (repo de 0,2 GB; bundle de 398.573.513 bytes en 15 ficheros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos exportados a Core ML (posible cuantización durante la conversión, no documentada) |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (bundle con `bundle.json` que lista ficheros, tamanos y SHA-256) |

## Arquitectura y entrenamiento

El modelo es una exportación de la variante neerlandesa de Pocket TTS de Kyutai, en su versión de seis capas, sin modificación de pesos ni del tokenizador más allá de la conversión de formato. La conversión se realizó con el ejemplo `export_coreml` de xn-ptts 0.6.0 (licencia Apache 2.0 / MIT), herramienta que también es capaz de leer el bundle resultante. El bundle incluye un `bundle.json` con el inventario completo de ficheros, sus tamanos y hashes SHA-256, lo que permite verificar la integridad de la conversión.

No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste por preferencias. Las voces incluidas en `voices/` se generaron con el codificador de voz de `kyutai/pocket-tts` a partir de grabaciones de `kyutai/tts-voices`, recortadas de silencio y con el token `bos_before_voice` antepuesto en el formato de voz de xn-ptts (`emb`). Las cuatro voces documentadas son estelle (grabación propia de Kyutai, CC0), alba (interpretada por Alba MacKenna, CC BY 4.0), anna (speaker p228 del corpus VCTK, CC BY 4.0) y bill (de Voice-Zero/LibriVox, CC0).

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés a partir de texto de entrada.
- Voces predefinidas múltiples: estelle, alba, anna y bill, cada una con su procedencia y licencia documentadas.
- Ejecución local en el ecosistema Apple mediante Core ML, orientada a inferencia en dispositivo.
- Integración con la aplicación TextSniper, que descarga el modelo cuando el usuario selecciona Pocket TTS para neerlandés.
- No se documentan capacidades de clonación de voz: el checkpoint base es explícitamente `without-voice-cloning`.
- No se documentan tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto; el modelo es exclusivamente de síntesis de voz.
- Capacidades multilingües limitadas al neerlandés en esta exportación.

## Casos de uso

- Lectura de texto en neerlandés en aplicaciones de accesibilidad: el modelo permite convertir contenido textual en voz neerlandesa dentro de apps de macOS/iOS, ejecutándose localmente vía Core ML sin depender de servicios en la nube.
- Integración en TextSniper para OCR con lectura en voz alta: cuando el usuario captura texto neerlandés de una imagen, el modelo sintetiza la locución con una de las voces disponibles, aprovechando que la app ya descarga y gestiona el bundle.
- Aplicaciones educativas de aprendizaje de neerlandés: las cuatro voces permiten exponer al estudiante a distintos timbres y procedencias, con licencias claras para su redistribución en materiales didácticos.
- Generación de audiolibros y contenido narrado en neerlandés: la licencia CC BY 4.0 permite uso comercial con atribución a Kyutai y a las fuentes de las voces, lo que facilita la publicación de narraciones.
- Sistemas de aviso y notificaciones por voz en neerlandés: el despliegue local en Core ML reduce la latencia y evita el envío de texto a servidores externos, útil en entornos con requisitos de privacidad.
- Pruebas de integración TTS en pipelines de desarrollo para Apple: el bundle con hashes SHA-256 permite verificar artefactos en CI y validar la reproducción de voz antes de publicar una versión de la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un bundle Core ML orientado a inferencia en dispositivo, el consumo depende del hardware Apple y del grado de cuantización aplicado en la conversión, que no se documenta.
- GPU recomendadas: no se especifican; el formato Core ML está pensado para ejecutarse en hardware Apple (CPU, GPU y Neural Engine).
- Compatibilidad con GPU de consumo: el modelo está orientado a equipos Apple, no a GPU NVIDIA/AMD de consumo mediante CUDA.
- Opciones de despliegue: Core ML (formato nativo del bundle) y la herramienta xn-ptts 0.6.0, que puede leer el bundle; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| MacEpic/pocket-tts-nl-coreml | neerlandés | Core ML | CC BY 4.0 | no disponible | Exportación de Pocket TTS de Kyutai para TextSniper |
| kyutai/pocket-tts-without-voice-cloning | multilingüe (incluye `languages/dutch`) | pesos originales de Kyutai | CC BY 4.0 | no disponible | Modelo base de esta exportación, sin clonación de voz |
| kyutai/pocket-tts | multilingüe | pesos originales de Kyutai | no disponible en la información | no disponible | Variante con codificador de voz usado para crear las voces de este bundle |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada, por lo que la comparación se limita a formato, idioma y licencia.

## Limitaciones y advertencias

- Es una conversión de pesos, no un modelo nuevo: cualquier limitación del Pocket TTS de Kyutai se hereda sin cambios.
- Idiomas: solo neerlandés; no cubre otras lenguas.
- Clonación de voz: el checkpoint base es `without-voice-cloning`, por lo que no se ofrece clonación de hablantes; las voces son fijas y predefinidas.
- Licencia CC BY 4.0: el uso comercial exige atribución a Kyutai y a las fuentes de las voces (estelle CC0, alba CC BY 4.0, anna CC BY 4.0, bill CC0).
- Riesgo de alucinación y sesgos: no documentados en la model card; al tratarse de TTS, el riesgo principal es una pronunciación incorrecta o una prosodia inadecuada, no verificable sin benchmarks.
- Integridad del bundle: conviene verificar los SHA-256 listados en `bundle.json` antes de desplegarlo en producción.
- Despliegue: al estar en formato Core ML, no es directamente utilizable en stacks de servidor basados en CUDA; requiere hardware Apple o herramientas compatibles.
- Popularidad y soporte: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MacEpic/pocket-tts-nl-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Pocket TTS con clonación de voz: https://huggingface.co/kyutai/pocket-tts
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Herramienta xn-ptts: https://github.com/gradium-ai/xn-ptts
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Kyutai: https://kyutai.org
