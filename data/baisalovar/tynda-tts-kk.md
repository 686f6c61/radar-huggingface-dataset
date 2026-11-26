# baisalovar/Tynda-TTS-kk

## Resumen

Tynda-TTS-kk es un modelo de síntesis de voz (text-to-speech) especializado en kazajo, desarrollado por el usuario baisalovar como un ajuste fino (fine-tune) del modelo Pocket TTS de Kyutai. Resuelve un problema concreto: la escasez de voces neuronales abiertas de calidad para kazajo, un idioma de bajos recursos con pocas alternativas TTS de licencia permisiva. El modelo permite convertir texto en kazajo (escritura cirílica) en audio natural con cinco voces profesionales distintas (F1, F2, F3 femeninas; M1, M2 masculinas).

La arquitectura subyacente es la de Pocket TTS, un modelo de difusión para audio con 24 capas y 336 millones de parámetros totales, cuyo embedding de texto se reinicializó para adaptarlo al kazajo. Se entrenó sobre el corpus KazakhTTS2 de ISSAI (Universidad Nazarbayev), que contiene 268,8 horas de audio y 134.791 enunciados de cinco hablantes profesionales. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 1,4 GB y licencia CC BY 4.0.

Es relevante ahora porque amplía el ecosistema de TTS abierto para lenguas túrquicas y ofrece una alternativa con licencia comercial permisiva frente a opciones como MMS-TTS de Meta (no comercial) o las voces Piper kk_KZ (monohablante). Además, el autor planea una versión destilada de 6 capas orientada a dispositivos móviles y navegadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (modelo de difusión para audio, 24 capas, "teacher") |
| Parametros totales | 336.068.290 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (frases de hasta ~30 segundos de habla) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk) únicamente |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |
| Modelo base | kyutai/pocket-tts (english_2026-04_24l) |
| Dataset de entrenamiento | KazakhTTS2 (ISSAI): 268,8 h, 134.791 enunciados, 5 hablantes |
| Tokenizador de texto | SentencePiece unigram, 4.000 piezas |
| Voces disponibles | F1, F2, F3 (femeninas), M1, M2 (masculinas) |
| Tamaño del repositorio | 1,4 GB |
| Librería | pocket-tts |

## Arquitectura y entrenamiento

El modelo parte de Pocket TTS de Kyutai, un sistema de síntesis de voz basado en difusión con 24 capas y 336 millones de parámetros, originalmente entrenado para inglés. Para la adaptación al kazajo se reinicializó el embedding de texto y se entrenó un tokenizador SentencePiece unigram de 4.000 piezas sobre las transcripciones de KazakhTTS2. Los pesos finales corresponden a la media móvil exponencial (EMA) del entrenamiento.

El ajuste fino siguió la receta `finetune_language.yaml` de Pocket TTS: batch de 64, tasa de aprendizaje constante de 2e-4, 1.000 pasos de calentamiento y un total de 85.000 pasos, lo que supuso aproximadamente 16 horas en una única NVIDIA H200. Los datos provienen de KazakhTTS2 (ISSAI), con 268,8 horas de habla leída profesional (noticias, libros, Wikipedia) de cinco hablantes. Los alineamientos temporales palabra a palabra se obtuvieron mediante alineamiento forzado CTC con un modelo wav2vec2 XLS-R para kazajo, cubriendo el 100 % de los enunciados.

## Capacidades

- Síntesis de voz en kazajo a partir de texto en escritura cirílica, con salida de audio natural.
- Cinco voces predefinidas: tres femeninas (F1, F2, F3) y dos masculinas (M1, M2).
- Clonación o imitación de voz a partir de una grabación corta (voice prompting), según indica el autor.
- Soporte de streaming de audio (heredado de la arquitectura Pocket TTS).
- Generación de frases de hasta aproximadamente 30 segundos de habla.
- Manejo razonable de vocabulario técnico y médico en kazajo (según la evaluación informal del autor).
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta ruso ni texto mixto kazajo-ruso.

## Casos de uso

- **Locución y narración de contenidos en kazajo**: el modelo está entrenado sobre habla leída profesional, por lo que es adecuado para generar audiolibros, artículos de Wikipedia o noticias con un estilo de narrador o presentador.
- **Accesibilidad para personas con discapacidad visual**: conversión de texto en kazajo a audio para lectores de pantalla y aplicaciones de accesibilidad, aprovechando las cinco voces disponibles para personalizar la experiencia.
- **Sistemas de megafonía y anuncios automatizados**: generación de avisos en kazajo para aeropuertos, estaciones o comercios, donde el estilo formal del modelo encaja con el registro anunciador.
- **Contenido educativo y material didáctico**: creación de pistas de audio para cursos de kazajo o para aprendizaje de vocabulario, con la posibilidad de elegir voz masculina o femenina según el contexto pedagógico.
- **Prototipado de asistentes de voz en kazajo**: integración en pipelines de IVR o asistentes conversacionales para mercados de Asia Central, usando el soporte de streaming para respuestas de baja latencia en GPU.
- **Doblaje y preproducción audiovisual**: generación de borradores de voz en kazajo para vídeos, documentales o material de formación antes de contratar locutores humanos, gracias al voice prompting para aproximar timbres.
- **Investigación en TTS para lenguas de bajos recursos**: el modelo sirve como línea base reproducible para experimentos de adaptación de Pocket TTS a otras lenguas túrquicas, dado que el autor documenta la receta completa.

## Benchmarks y rendimiento

El autor reporta una evaluación informal, no un benchmark estandarizado:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Character error rate (ASR) | 0,2 % | 20 frases de muestra (4 frases x 5 voces), transcritas con Whisper large-v3-turbo ajustado a kazajo |
| Transcripciones perfectas | 19 de 20 clips | Incluye vocabulario médico |
| Valoración de hablante nativo | "clara y aceptable" | Juicio subjetivo, sin MOS formal |
| Velocidad en CPU | ~0,2x tiempo real | CPU de servidor, modelo de 24 capas |
| Tiempo de entrenamiento | ~16 h | Una NVIDIA H200, 85.000 pasos |

No se han publicado resultados de benchmarks formales (MOS, comparación con otros sistemas TTS en kazajo) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; con 336 millones de parámetros y pesos en safetensors (1,3 GB), la inferencia cabe holgadamente en GPUs de consumo, aunque el autor no detalla cifras de VRAM.
- **GPU recomendadas**: el entrenamiento se realizó en una NVIDIA H200; para inferencia se recomienda GPU, ya que en CPU el modelo corre a ~0,2x tiempo real.
- **GPU de consumo**: por tamaño (1,3 GB de pesos), debería caber en tarjetas como RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- **Opciones de despliegue**: librería `pocket-tts` (comando `pocket-tts generate` con configuración `hf://baisalovar/Tynda-TTS-kk/tynda_tts_kk.yaml`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: solo se documenta el rendimiento en CPU (~0,2x tiempo real); no hay cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Licencia | Notas |
|---|---|---|---|---|---|
| Tynda-TTS-kk | 336 M | kazajo | 5 + voice prompting | CC BY 4.0 | Streaming, versión destilada prevista |
| Piper kk_KZ | no disponible | kazajo | monohablante | no disponible | Muy ligero, on-device |
| Kokoro TTS kazajo (TilLabs) | no disponible | kazajo | no disponible | no disponible | Alternativa open source |
| Meta MMS-TTS | no disponible | multilingüe (incl. kazajo) | monohablante | no comercial | Restringido para uso comercial |

Los datos de parámetros y licencias de las alternativas no están detallados en la información proporcionada; se indican según lo que menciona el autor en la model card.

## Limitaciones y advertencias

- **Estilo formal**: entrenado solo con habla leída profesional (noticias, libros, Wikipedia), por lo que las frases conversacionales pueden sonar acartonadas; un oyente nativo encontró un checkpoint anterior (15k pasos) ligeramente más natural.
- **Sin normalización de texto**: números, abreviaturas y palabras en alfabeto latino pueden leerse incorrectamente; hay que escribir los números como palabras ("екі рет", no "2 рет").
- **Solo kazajo**: no soporta ruso ni texto mixto kazajo-ruso.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir pronunciaciones erróneas o artefactos en palabras fuera del dominio de entrenamiento; la evaluación es informal y sin MOS.
- **Clonación de voz**: el modelo puede imitar una voz a partir de una grabación corta; la licencia y la model card prohíben explícitamente la suplantación de identidad sin consentimiento y el uso para desinformación o contenido dañino.
- **Tamaño y velocidad**: el modelo de 24 capas (1,3 GB) es lento en CPU (~0,2x tiempo real); se recomienda GPU. La versión destilada de 6 capas aún no está disponible.
- **Licencia CC BY 4.0**: permite uso comercial con atribución a Kyutai (Pocket TTS) e ISSAI (KazakhTTS2), pero el acceso está condicionado a un formulario (gated) con declaración de uso.
- **Madurez**: es una primera versión con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baisalovar/Tynda-TTS-kk
- Modelo base Pocket TTS (Kyutai): https://huggingface.co/kyutai/pocket-tts
- Corpus KazakhTTS2 (ISSAI): https://github.com/IS2AI/Kazakh_TTS
- Paper KazakhTTS2 (LREC 2022): https://aclanthology.org/2022.lrec-1.578/
- Muestras de audio: https://huggingface.co/baisalovar/Tynda-TTS-kk/tree/main/samples
- Prompts de voz: https://huggingface.co/baisalovar/Tynda-TTS-kk/tree/main/voices
