# maxxrubin/fish-audio-drama-3-6bit

## Resumen

`maxxrubin/fish-audio-drama-3-6bit` es una conversión comunitaria a MLX con cuantización de 6 bits de Fish Audio Drama 3, un modelo de texto a voz orientado a la dirección interpretativa. No es una publicación oficial de Fish Audio: el autor, maxxrubin, parte del checkpoint original y aplica cuantización afín de 6 bits a los expertos enrutados y de 8 bits a las proyecciones densas y a la torre de audio. El resultado ocupa 31,8 GB y está pensado para ejecutarse en Apple Silicon mediante mlx-audio.

El modelo base se describe en una integración de terceros como un MoE de aproximadamente 35B parámetros, aunque la model card no confirma esa cifra. Drama 3 permite dirigir la actuación con instrucciones en lenguaje natural, introducir expresiones y pausas, clonar voces a partir de una referencia y generar diálogos con hasta 16 hablantes. La salida es mono a 44,1 kHz y el códec DAC de Fish se mantiene sin cuantizar.

Su relevancia es práctica: permite TTS expresivo y clonación de voz en local sobre un Mac con 48 GB o más de memoria unificada, sin enviar audio a la nube. Ahora bien, el autor no aporta estudio de calidad, ASR ni similitud de hablante, y no reclama mejor calidad que las versiones de 4 u 8 bits; las pruebas publicadas son únicamente comprobaciones de humo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) para texto a voz, con expertos enrutados y torre de audio; detalles completos no disponibles |
| Parámetros totales | 35B según una integración de terceros (ComfyUI-FishAudioDrama3); no confirmado en la model card |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits afín en expertos enrutados (group size 64); 8 bits afín en proyecciones densas y torre de audio (group size 64); códec Fish S1 DAC sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Community License v1.0 (`fish-audio-community-license-v1.0`; etiqueta `other` en HuggingFace) |
| Formato de pesos | safetensors en formato MLX |
| Modelo base | `fishaudio/drama-3`, revisión `b2b5ee998034b2975720906c815e7fb0e9f007bd` |
| Librería | mlx-audio |
| Frecuencia de muestreo | 44,1 kHz, mono |
| Voces | hasta 16 hablantes mediante etiquetas `<\|speaker:0\|>` a `<\|speaker:15\|>` |
| Tamaño del repositorio | 31,8 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con expertos enrutados; la model card confirma esa estructura y el repositorio ComfyUI-FishAudioDrama3 la describe como un MoE de 35B parámetros. Los expertos enrutados originales están almacenados en block-FP8. El conversor oficial de MLX Audio los desquantizó a BF16 antes de aplicar cuantización afín de 6 bits con group size 64. Las proyecciones densas y la torre de audio usan 8 bits afín con group size 64, mientras que el códec Fish S1 DAC se reutiliza sin cambios desde `mlx-community/fish-audio-drama-3-4bit`, revisión `cc639e27aba7edb73429d3e3806f471dcd79d316`. El autor verificó las 120 entradas de proyección de expertos enrutados y comprobó los SHA-256 de los pesos originales y del códec antes de convertir.

No se entrenó ni ajustó ningún modelo para producir esta conversión, y no se utilizaron grabaciones de voz personales ni datos sintéticos de entrenamiento. Tampoco se recuantizó desde el modelo de 4 bits. No hay información disponible sobre el número de tokens, la composición del dataset, el uso de RLHF o DPO, ni otras innovaciones de entrenamiento del modelo base. La funcionalidad diferencial documentada es la dirección interpretativa: instrucciones en lenguaje natural, expresiones y pausas insertadas en el texto, control de palabras concretas, etiquetas de hablante, streaming y chunking de texto largo.

## Capacidades

- Generación de voz expresiva a partir de texto, con dirección interpretativa mediante instrucciones en lenguaje natural.
- Inserción de expresiones y sonidos dentro del guion, por ejemplo `[whispers]` o `[laughs]`, y control de pausas.
- Clonación de voz condicionada por una grabación de referencia y su transcripción exacta (`ref_audio` y `ref_text`).
- Diálogos con hasta 16 hablantes mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Generación en streaming con `stream=True` y `first_chunk_frames`, útil para reproducción progresiva.
- Chunking automático de texto largo para procesar guiones extensos por tramos.
- Salida de audio mono a 44,1 kHz.
- Control de muestreo mediante `temperature`, `top_p`, `top_k` y `max_tokens`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de entrada o razonamiento multi-paso; el modelo es específicamente de texto a voz.

## Casos de uso

- Audiolibros y narración expresiva: se puede dirigir cada línea con instrucciones como `[whispers]` o `[laughs]`, controlar pausas y procesar capítulos completos mediante chunking de texto largo, manteniendo una salida mono a 44,1 kHz.
- Ficción sonora y audiodramas: las etiquetas de hablante permiten generar diálogos de hasta 16 personajes en una sola herramienta; la prueba de diálogo del autor produjo 2,55 s de audio en 1,23 s en un M5 Max.
- Doblaje y localización: la clonación con `ref_audio` y `ref_text`, junto con la dirección interpretativa por línea, permite crear versiones preliminares de doblaje sin desplazar a actores a un estudio.
- Preproducción de animación y videojuegos: generar scratch tracks localmente para validar ritmo, intención y temporización antes de contratar voces definitivas; al ejecutarse en local, los guiones confidenciales no se envían a servicios externos.
- Accesibilidad y preservación de voz: con consentimiento explícito, clonar la voz de una persona y generar lecturas o mensajes personalizados; la inferencia local evita que el audio biométrico salga del equipo.
- Contenido formativo y podcasts: usar streaming con `first_chunk_frames=4` para empezar a reproducir antes de que termine la generación, lo que encaja en aplicaciones interactivas sobre Mac.
- Prototipado de guiones: guionistas y diseñadores de sonido pueden probar distintas lecturas cambiando temperatura, semilla y direcciones sin coste por token ni cuotas de API.
- Asistentes conversacionales con varios personajes: el soporte de 16 hablantes y expresiones permite construir experiencias narrativas o formativas; antes de producción hay que validar la latencia y el comportamiento sin referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas mediciones son comprobaciones de humo del autor, no una evaluación de calidad de voz. Se ejecutaron en un Apple M5 Max con 128 GB de memoria unificada, semilla 42, temperatura 1.0, top-p 0.9, top-k 30, 500 fotogramas máximos por sección y una referencia sintética.

| Prompt | Duración de audio | Tiempo de generación | Fotogramas de audio | RTF aproximado |
|---|---:|---:|---:|---:|
| Simple (Plain) | 5,20 s | 3,04 s | 112 | 0,58 |
| Expresivo (Expressive) | 3,90 s | 1,73 s | 84 | 0,44 |
| Diálogo (Dialogue) | 2,55 s | 1,23 s | 55 | 0,48 |

El RTF se ha calculado como tiempo de generación dividido entre duración de audio. Las tres ejecuciones devolvieron PCM finito y no silencioso, terminaron antes del límite de fotogramas y tuvieron cero muestras recortadas. El tiempo incluye streaming y se midió con caché de disco caliente; no es una comparación de rendimiento controlada.

El blog de Fish Audio afirma que Drama 3 es el modelo más emotivo de la compañía y el número 1 en el benchmark de robustez de pronunciación de Artificial Analysis, pero no se proporcionan cifras, metodología ni resultados detallados en la información consultada. La model card de esta conversión no reclama ninguna ventaja de calidad frente a las versiones de 4 u 8 bits.

## Requisitos de hardware

- Peso en disco: 31,8 GB de ficheros de checkpoint, más el códec y los ficheros auxiliares.
- Memoria: pico de aproximadamente 34,2 GB de memoria MLX en pruebas cortas con referencia sobre un M5 Max. El autor recomienda un Mac de 48 GB o más como punto de partida práctico y advierte de que la estimación no está garantizada para prompts largos o con múltiples referencias.
- Plataforma: Apple Silicon mediante MLX. No se documenta una ruta CUDA para esta conversión concreta.
- GPU: el repositorio ComfyUI-FishAudioDrama3 indica que los pesos FP8 originales caben en una GPU de 16 GB, pero se trata de otro formato y otro pipeline, no de esta conversión MLX.
- Despliegue: mlx-audio desde el commit `d35a8038131f0de33b7ae6da3f2d5b69523b1c3e`, con MLX Audio 0.5.9 y MLX 0.32.3. La wheel de PyPI 0.5.9 es anterior al soporte de Drama 3. No se documentan opciones con vLLM, TGI, llama.cpp u Ollama.
- API: carga con `mlx_audio.tts.utils.load_model` y generación con `model.generate`, incluyendo `stream=True` y `first_chunk_frames`.
- Rendimiento observado: entre 1,23 y 3,04 s para generar entre 2,55 y 5,20 s de audio en un M5 Max de 128 GB, con RTF aproximado de 0,44 a 0,58.
- Almacenamiento y descarga: hay que prever espacio para el repositorio de 31,8 GB y para los ficheros temporales de conversión si se reproduce el proceso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maxxrubin/fish-audio-drama-3-6bit` | 35B según terceros; no confirmado | no disponible | 6 bits en expertos, 8 bits en denso y torre | Fish Audio Community License v1.0 | Conversión comunitaria para MLX en Apple Silicon |
| `fishaudio/drama-3` | 35B según terceros; no confirmado | no disponible | Expertos enrutados en block-FP8 | Fish Audio Community License v1.0 | Pesos originales oficiales |
| `mlx-community/fish-audio-drama-3-4bit` | 35B según terceros; no confirmado | no disponible | 4 bits en MLX | Fish Audio Community License v1.0 | Conversión comunitaria para MLX; su códec se reutiliza en esta versión de 6 bits |
| Fish Audio S2.1 Pro | no disponible | no disponible | no disponible | no disponible | Generación anterior de Fish Audio; el blog la usa como referencia de emotividad sin aportar datos |

No se dispone de resultados de rendimiento comparativos entre estas variantes. La model card indica explícitamente que no se ha realizado ningún estudio de escucha, ASR ni similitud de hablante, por lo que no se puede afirmar que la versión de 6 bits sea mejor que la de 4 u 8 bits.

## Limitaciones y advertencias

- No hay evaluación de calidad de voz: no se realizaron pruebas de ASR, similitud de hablante ni estudio de escucha, y no se reclama ventaja frente a 4 u 8 bits.
- Sin referencia puede fallar: el autor observó salidas silenciosas o generación hasta el límite de fotogramas sin `ref_audio`. Ocurrió con este checkpoint y con el modelo MLX de 4 bits en el mismo prompt expresivo; no se establece una tasa general de fallo.
- Conversión no oficial: no está respaldada ni endorsada por Fish Audio, y el autor no ofrece soporte.
- Dependencia de una versión concreta: requiere una versión de mlx-audio con la implementación fusionada de Drama 3; la wheel de PyPI 0.5.9 no la incluye.
- Plataforma limitada: MLX y Apple Silicon. No se documenta soporte CUDA, vLLM, TGI, llama.cpp ni Ollama para esta conversión.
- Memoria: 34,2 GB de pico en pruebas cortas y recomendación de 48 GB o más de memoria unificada; los prompts largos o con varias referencias pueden superar esa estimación.
- Idiomas: no se documenta una lista de idiomas soportados en la información disponible.
- Licencia: se aplica la Fish Audio Community License v1.0, con etiqueta `other` en HuggingFace. Hay que revisar los términos de uso comercial, mantener la atribución y conservar el fichero `NOTICE` al redistribuir.
- Clonación de voz: existe riesgo de suplantación y deepfakes. Es necesario obtener consentimiento explícito, cumplir la legislación aplicable y restringir el acceso a referencias biométricas.
- Sesgos: no hay información sobre sesgos del modelo base ni sobre su comportamiento por idioma, acento o género.
- Validación comunitaria escasa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Límites funcionales: hasta 16 hablantes etiquetados y sin capacidades documentadas de tool calling, agentes o visión.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/maxxrubin/fish-audio-drama-3-6bit)
- [Modelo base fishaudio/drama-3](https://huggingface.co/fishaudio/drama-3)
- [Licencia Fish Audio Community License v1.0](https://huggingface.co/maxxrubin/fish-audio-drama-3-6bit/blob/main/LICENSE)
- [Documentación de Fish Drama 3 en mlx-audio](https://github.com/Blaizzy/mlx-audio/blob/d35a8038131f0de33b7ae6da3f2d5b69523b1c3e/docs/models/tts/fish-drama3.md)
- [Repositorio mlx-audio](https://github.com/Blaizzy/mlx-audio)
- [Página oficial de Drama 3](https://fish.audio/drama-3/)
- [Documentación oficial de Drama 3](https://docs.fish.audio/features/text-to-speech/drama-3)
- [Blog de Fish Audio sobre Drama 3](https://fish.audio/blog/fish-audio-drama-3/)
- [Integración comunitaria ComfyUI-FishAudioDrama3](https://github.com/akashzeno/ComfyUI-FishAudioDrama3)
- [Conversión MLX de 4 bits mlx-community/fish-audio-drama-3-4bit](https://huggingface.co/mlx-community/fish-audio-drama-3-4bit)
- [Sitio de Fish Audio](https://fish.audio/)
