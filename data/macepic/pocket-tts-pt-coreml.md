# MacEpic/pocket-tts-pt-coreml

## Resumen

Pocket TTS Portuguese for Core ML es una conversión a formato Core ML del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante para portugués. Lo desarrolla MacEpic como parte de la integración de Pocket TTS en la aplicación TextSniper, que descarga automáticamente este paquete cuando el usuario selecciona dicha voz en portugués dentro de sus ajustes. El modelo base es `kyutai/pocket-tts-without-voice-cloning`, concretamente el subconjunto `languages/portuguese`, que corresponde a una arquitectura de seis capas.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un entrenamiento propio, sino de una exportación de pesos ya existentes a Core ML para su ejecución nativa en el ecosistema Apple. El paquete incluye además un conjunto de voces predefinidas generadas con el codificador de voz del modelo original de Kyutai, empaquetadas en el formato `emb` propio de la herramienta xn-ptts.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la documentación proporcionada; el tamaño del repositorio es de 0,2 GB y el bundle de 16 archivos suma 399.091.497 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de seis capas según la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos exportados a Core ML; el tag del repo indica `base_model:quantized`) |
| Idiomas soportados | Portugues (`pt`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (bundle `bundle.json` con 16 archivos y SHA-256); voces en formato `emb` de xn-ptts |

## Arquitectura y entrenamiento

La información disponible indica que el modelo subyacente es la variante portuguesa de Pocket TTS de Kyutai, descrita como un modelo de seis capas. No se detalla en la model card si se trata de un transformer puro, un modelo híbrido ni qué tipo de decodificador utiliza. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La contribución técnica de este repositorio es la conversión a Core ML mediante el ejemplo `export_coreml` de la herramienta xn-ptts 0.6.0 (licenciada Apache 2.0 / MIT), que también permite leer el bundle resultante. Los pesos y el tokenizador se mantienen sin cambios respecto al original, salvo la propia conversión. Las voces incluidas en `voices/` se generaron con el codificador de voz de `kyutai/pocket-tts` a partir de grabaciones recortadas de silencio y con el token `bos_before_voice` antepuesto, en el formato `emb` de xn-ptts.

## Capacidades

- Síntesis de texto a voz en portugués, con pipeline `text-to-speech`.
- Ejecución nativa en el ecosistema Apple gracias al formato Core ML.
- Selección entre varias voces predefinidas incluidas en el paquete: estelle, alba, anna, bill y rafael.
- Integración con la aplicación TextSniper, que descarga el bundle automáticamente al elegir Pocket TTS en portugués.
- No se documentan capacidades de clonación de voz: el modelo base es explícitamente `without-voice-cloning`.
- No se documentan tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de texto en voz alta dentro de TextSniper: la aplicación descarga el bundle y lo ejecuta mediante Core ML para narrar texto capturado de la pantalla en portugués, aprovechando la integración nativa con macOS.
- Accesibilidad para usuarios lusohablantes: conversión de texto a voz en aplicaciones de lectura o asistencia, con voces predefinidas que cubren registros masculinos y femeninos.
- Prototipado de interfaces de voz en apps Apple: al estar en Core ML, se puede integrar en un proyecto Xcode sin depender de servicios en la nube, siempre que se respete la licencia CC BY 4.0.
- Generación de audiolibros o contenido narrado en portugués a partir de texto plano, usando las voces incluidas y citando las fuentes correspondientes.
- Evaluación comparativa de motores TTS en portugués sobre hardware Apple, dado el reducido tamaño del bundle (aproximadamente 399 MB).
- Distribución dentro de aplicaciones de terceros: al ser un paquete Core ML autocontenido con `bundle.json` y hashes SHA-256, facilita la verificación de integridad en pipelines de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un bundle Core ML de unos 399 MB, se espera que quepa en memoria unificada de equipos Apple, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles. El formato Core ML está orientado a hardware Apple (Apple Silicon y Neural Engine), no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090, A100 ni H100; el destino es el ecosistema Apple.
- Opciones de despliegue: Core ML a través de la herramienta xn-ptts 0.6.0, que lee el bundle; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MacEpic/pocket-tts-pt-coreml | No disponible | No disponible | Portugues | CC BY 4.0 | Core ML |
| kyutai/pocket-tts-without-voice-cloning | No disponible | No disponible | No disponible en la informacion | CC BY 4.0 (segun la model card) | No disponible |
| kyutai/pocket-tts | No disponible | No disponible | No disponible en la informacion | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta portugués; no se documentan otros idiomas.
- No incluye clonación de voz: el modelo base es la variante `without-voice-cloning`.
- La licencia CC BY 4.0 exige atribución a Kyutai y a las fuentes de las voces; es compatible con uso comercial siempre que se cumplan las condiciones de atribución.
- La voz `rafael` procede de una grabación de Kyutai cuya licencia no está declarada y que se eliminará a petición del titular; conviene revisar su situación antes de redistribuirla.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad o latencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay histórico de uso que permita evaluar su estabilidad en producción.
- Al ser una conversión de pesos sin reentrenamiento, hereda cualquier sesgo o limitación del modelo original de Kyutai, que no se detalla en la documentación.
- El destino es exclusivamente Core ML; no se ofrece una versión GGUF ni safetensors en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MacEpic/pocket-tts-pt-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Modelo original con voces: https://huggingface.co/kyutai/pocket-tts
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts
- Repositorio xn-ptts: https://github.com/gradium-ai/xn-ptts
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
