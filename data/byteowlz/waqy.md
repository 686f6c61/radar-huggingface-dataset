# byteowlz/waqy

## Resumen

waqy es un sistema de detección de wake-phrases (palabras de activación) empaquetado como datos: un front end congelado de embeddings de voz más un clasificador pequeño por frase, distribuido como una carpeta de release inmutable que cualquier host puede cargar (proceso Rust, librería Rust o navegador vía WASM). Lo desarrolla byteowlz y se publica bajo licencia Apache-2.0. El release actual, `spqx-pub1`, incluye las frases `hey_oqto` y `oqto` con un umbral de 0,5.

El modelo no es un LLM ni un modelo generativo: es un pipeline de keyword spotting compuesto por un extractor log-mel generado por fórmulas (sin pesos aprendidos), un modelo de embeddings de voz de Google (`speech_embedding`, Apache-2.0) con batch norm plegada y un clasificador ONNX por frase sobre los embeddings congelados. La innovación principal es de empaquetado y gobernanza: el `manifest.json` lista un sha256 por fichero y cada runtime verifica los hashes y rechaza un mismatch, de modo que cambiar de modelo es un cambio de ruta, nunca un cambio de código.

Es relevante para desarrolladores que integran activación por voz en aplicaciones de escritorio o web y necesitan un componente determinista, verificable y de huella mínima, con métricas de falsos positivos medidas sobre audio no relacionado. El autor advierte explícitamente que una detección es evidencia de que probablemente se pronunció una frase, nunca autenticación, identidad de hablante ni permiso para actuar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de keyword spotting: front end log-mel (generado por formulas, sin pesos aprendidos) + modelo de embeddings de voz congelado (Google `speech_embedding`) + clasificador ONNX por frase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; se evalua por ventana de 80 ms y por sentencia completa |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | Frases en aleman e ingles (segun limitaciones declaradas por el autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`melspectrogram_raw.onnx`, `embedding_model.onnx`, un `.onnx` por frase) + `manifest.json` con sha256 por fichero |

## Arquitectura y entrenamiento

El sistema se compone de tres etapas encadenadas. Primero, `melspectrogram_raw.onnx` calcula el log-mel a partir de fórmulas, sin pesos aprendidos, con linaje del front end de openWakeWord. Segundo, `embedding_model.onnx` es el modelo `speech_embedding` de Google (Apache-2.0) con la batch norm plegada, que actúa como extractor de características congelado. Tercero, cada frase tiene su propio clasificador ONNX entrenado sobre esos embeddings congelados, con nombres del estilo `hey_oqto.onnx`.

Los datos de entrenamiento combinan voces sintéticas diseñadas, Piper, un corpus compartido de 64 voces y, en el caso de `oqto`, grabaciones del propietario (4,6 % de los positivos y 29,6 % de los negativos, con consentimiento explícito para redistribuir los pesos derivados; el audio nunca se publica). Los negativos proceden de MUSAN (dominio público / CC, sin NC), VoxPopuli (CC0), FLEURS (CC BY 4.0), Thorsten (CC0) y ruido procedural. La dependencia de entrenamiento livekit-wakeword se usa evitando deliberadamente su dataset por defecto CC BY-NC-SA. Las voces sintéticas se generan con Qwen3-TTS VoiceDesign. El autor documenta que el entrenamiento sin grabaciones del propietario de una cabeza de palabra suelta fue inestable: tres intentos (40k pasos con 1024 negativos generales, 12k con 512 y 40k con `max_negative_weight` 300) colapsaron a un clasificador constante-negativo; la cabeza `hey_` sí es libre de grabaciones del propietario.

## Capacidades

- Detección de wake-phrases concretas: `hey_oqto` y `oqto` en el release `spqx-pub1`, con umbral único de 0,5.
- Verificación de integridad: cada runtime comprueba los sha256 del `manifest.json` y rechaza un mismatch.
- Ejecución multiplataforma: proceso Rust, librería Rust y navegador vía WASM con onnxruntime-web.
- Interfaz de streaming: protocolo `wake-stream/1` sobre stdin/stdout mediante el comando `waqy listen`.
- Evaluación por sentencia en hablantes retenidos, en lugar de por ventana de 80 ms, porque el scoring por ventana ocultaba fallos en frases parecidas.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües generales.

## Casos de uso

- Dictado por voz en escritorio: integrado en eaRS bajo la sección `[dictation.wake]`, el modelo activa la captura de dictado al detectar la frase, con verificación de hashes en cada arranque para garantizar que el binario cargado es el release esperado.
- Activación de asistente en navegador: Oqto lo ejecuta con onnxruntime-web y `sync:waqy` incorpora la carpeta del release a los assets estáticos, de modo que la detección ocurre en el cliente sin enviar audio a un servidor.
- Sustitución de modelos sin recompilar: al ser un cambio de ruta, un equipo puede desplegar una nueva frase o un nuevo release sustituyendo la carpeta y dejando que la verificación de sha256 rechace versiones corruptas o manipuladas.
- Control por voz de manos libres en entornos de baja latencia: el procesamiento por ventanas de 80 ms y la ejecución en CPU permiten activación local en portátiles y móviles sin GPU.
- Filtro previo a pipelines de ASR: usar la detección como puerta barata que evita arrancar un reconocedor de voz completo hasta que se pronuncia la frase de activación, reduciendo coste y consumo.
- Evaluación y auditoría de releases: los comandos `waqy check` y `waqy bench` permiten validar hashes, frases y umbral, y medir el coste por frame de 80 ms en CPU antes de adoptar un release.

## Benchmarks y rendimiento

Datos medidos por el autor sobre conjuntos retenidos, con umbrales congelados antes del scoring:

| Cabeza | Recall en 64 voces no vistas | Sesion retenida del propietario | Falsos wakes generales / hora | Datos de entrenamiento |
|---|---|---|---|---|
| `hey_oqto` | 0,9198 | 18/36 (18/18 frases hey) | 0,0 | Voces diseñadas + Piper + corpus compartido de 64 voces (sin grabaciones del propietario) |
| `oqto` | 0,7732 | 35/36 | 0,123 | Voces diseñadas + Piper + corpus compartido de 64 voces + grabaciones del propietario |

Los falsos wakes generales se miden sobre 16,2 h de audio no relacionado (MUSAN speech/music, VoxPopuli, FLEURS). El comportamiento en mitad de frase se puntúa por sentencia en hablantes retenidos, no por ventana de 80 ms. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecutarse en CPU y en navegador vía WASM, sin requisitos de GPU documentados.
- GPU recomendadas: no aplica; el release no documenta uso de GPU.
- Cabe en cualquier equipo capaz de ejecutar ONNX Runtime en CPU, incluidos portátiles y navegadores con onnxruntime-web.
- Opciones de despliegue: proceso Rust o librería Rust (host eaRS), navegador con onnxruntime-web (host Oqto), y CLI `waqy` con los subcomandos `check`, `bench` y `listen`.
- Latencia y throughput: el autor ofrece `waqy bench --manifest spqx-pub1` para medir el coste en CPU por frame de 80 ms, pero no publica cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Frases | Licencia | Formato | Contexto / ventana | Disponibilidad |
|---|---|---|---|---|---|---|
| waqy (`spqx-pub1`) | Keyword spotting con embeddings congelados + clasificador por frase | `hey_oqto`, `oqto` | Apache-2.0 | ONNX + manifest con sha256 | Ventana de 80 ms; scoring por sentencia | Hugging Face, hosts Rust y WASM |
| openWakeWord | Keyword spotting | Frases predefinidas y entrenamiento propio | no disponible en la información proporcionada | no disponible | no disponible | no disponible |
| livekit-wakeword | Framework de entrenamiento de wake words | Configurable | Dependencia con dataset por defecto CC BY-NC-SA (no usado por waqy) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de openWakeWord ni de livekit-wakeword en la información proporcionada; la comparación se limita a tipo, licencia y formato.

## Limitaciones y advertencias

- Una detección es evidencia de que probablemente se pronunció una frase; nunca constituye autenticación, identidad de hablante ni permiso para actuar.
- El entrenamiento sin grabaciones del propietario de la cabeza de palabra suelta (`oqto`) fue inestable y colapsó a un clasificador constante-negativo en tres intentos; el release incluye grabaciones del propietario con consentimiento para redistribuir pesos derivados.
- Los umbrales por cabeza están especificados pero aún no implementados en los loaders; este release usa un único umbral de 0,5.
- El modelo está calificado para frases en alemán e inglés captadas por micrófono de portátil o teléfono; no se ha evaluado en arrays de campo lejano ni con hablantes distintos del propietario a escala.
- El recall de `oqto` en voces no vistas (0,7732) es notablemente inferior al de `hey_oqto` (0,9198), lo que puede generar más falsos negativos en hablantes nuevos.
- La tasa de falsos wakes de `oqto` (0,123 por hora) es superior a la de `hey_oqto` (0,0 por hora) sobre 16,2 h de audio no relacionado.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de las métricas declaradas.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de procedencia del fichero `NOTICE` (Google `speech_embedding`, linaje openWakeWord, livekit-wakeword y Qwen3-TTS VoiceDesign).

## Enlaces

- Hugging Face: https://huggingface.co/byteowlz/waqy
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
