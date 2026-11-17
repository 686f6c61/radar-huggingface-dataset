# Chameleonstudios/Ace-Step1.5

## Resumen

ACE-Step 1.5 es un modelo fundacional de generación de música a partir de texto desarrollado conjuntamente por ACE Studio y StepFun. Se presenta como una alternativa de código abierto con licencia MIT orientada a uso comercial, entrenada sobre un corpus de datos licenciados, libres de derechos y sintéticos generados mediante conversión MIDI-a-audio, lo que evita las ambigüedades legales habituales en otros modelos de audio.

La arquitectura es híbrida: un modelo de lenguaje (basado en la familia Qwen3, en variantes de 0,6B, 1,7B y 4B parámetros) actúa como planificador que transforma la consulta del usuario en un "blueprint" de canción (metadatos, letra, subtítulos) mediante chain-of-thought, y un Diffusion Transformer (DiT) se encarga de la síntesis de audio final. El alineamiento se realiza mediante reinforcement learning intrínseco, sin depender de modelos de recompensa externos ni de preferencias humanas.

El modelo destaca por su eficiencia: genera una canción completa en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, y puede ejecutarse en local con menos de 4 GB de VRAM. Soporta composiciones de hasta 10 minutos y más de 50 idiomas, además de tareas de edición como cover, repaint y conversión de voz a música de fondo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LM planificador (Qwen3) + Diffusion Transformer (DiT) |
| Parametros totales | no disponible (repo de 10,1 GB; LM en variantes 0,6B / 1,7B / 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (composiciones de hasta 10 minutos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 50+ idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACE-Step 1.5 combina dos componentes. Por un lado, un modelo de lenguaje derivado de Qwen3 (en tres tamanos: 0,6B, 1,7B y 4B) que actua como planificador omnicapaz: recibe la consulta del usuario y genera un blueprint completo de la cancion, incluyendo metadatos, letra y subtitulos, mediante chain-of-thought. Por otro lado, un Diffusion Transformer (DiT) que sintetiza el audio final a partir de ese blueprint y del prompt original. Esta separacion permite escalar la composicion desde loops cortos hasta piezas de 10 minutos.

El entrenamiento se realizo sobre un dataset masivo y legalmente conforme compuesto por musica con licencia profesional, musica libre de derechos y de dominio publico, y datos sinteticos generados mediante conversion MIDI-a-audio de alta calidad. El alineamiento se logra mediante reinforcement learning intrinseco que depende unicamente de mecanismos internos del modelo, eliminando los sesgos de modelos de recompensa externos o de preferencias humanas. La familia incluye variantes DiT con pre-entrenamiento, SFT y RL (base, sft, turbo y turbo-rl), siendo `turbo` la publicada en este repositorio con solo 8 pasos de muestreo y sin CFG.

## Capacidades

- Generacion de musica a partir de texto (text2music) con control estilistico preciso.
- Generacion de covers y repaint (edicion de secciones de audio existente).
- Extraccion de stems y conversion de voz a musica de fondo (vocal-to-BGM).
- Composicion de hasta 10 minutos de duracion.
- Generacion de metadatos, letra y subtitulos mediante chain-of-thought del LM planificador.
- Comprension de audio por parte del LM (capacidad variable segun tamano: media en 0,6B/1,7B, fuerte en 4B).
- Copia de melodia (capacidad debil en 0,6B, media en 1,7B, fuerte en 4B).
- Adherencia estricta al prompt en mas de 50 idiomas.
- Control de estilo y edicion versatil integrable en flujos de trabajo creativos.

## Casos de uso

- Produccion musical asistida: un compositor introduce una descripcion textual y obtiene un blueprint con letra, metadatos y estructura, que el DiT convierte en una maqueta completa en segundos, acelerando la iteracion creativa.
- Generacion de bandas sonoras para video: el modelo produce piezas de hasta 10 minutos adaptadas a la duracion de una escena, con control estilistico para ajustar el tono a la narrativa.
- Creacion de covers y remixes: la funcionalidad de cover permite transformar una cancion existente manteniendo su estructura, util para sellos discograficos y creadores de contenido.
- Edicion por repaint: un productor puede regenerar una seccion concreta de una pista (por ejemplo, un estribillo) sin rehacer el resto, gracias a la edicion localizada del DiT.
- Conversion de voz a BGM: creadores de podcast o video pueden generar musica de fondo a partir de una pista vocal, agilizando la postproduccion.
- Generacion multilingue para mercados internacionales: con soporte de mas de 50 idiomas, el modelo puede producir letras y metadatos adaptados a audiencias locales en una sola pasada.
- Despliegue en hardware de consumo: al ejecutarse con menos de 4 GB de VRAM, permite a estudios independientes y creadores individuales generar musica localmente sin infraestructura en la nube.

## Benchmarks y rendimiento

La model card incluye una imagen de evaluacion, pero no se han publicado resultados numericos de benchmarks en la informacion disponible. Los unicos datos de rendimiento explicitos son de velocidad de inferencia: menos de 2 segundos por cancion en una A100 y menos de 10 segundos en una RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 4 GB segun el autor (variante turbo con 8 pasos de muestreo).
- GPU recomendadas: A100 (menos de 2 s por cancion), RTX 3090 (menos de 10 s por cancion).
- Cabe en GPU de consumo: si, con menos de 4 GB de VRAM.
- Opciones de despliegue: transformers y diffusers (segun tags del repositorio); no se detallan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: menos de 2 s en A100 y menos de 10 s en RTX 3090 por cancion completa; throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACE-Step 1.5 (turbo) | no disponible (LM 0,6B/1,7B/4B + DiT) | no disponible | MIT | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado resultados numericos de benchmarks que permitan verificar la calidad objetiva frente a alternativas.
- El modelo esta especializado en generacion de musica; no es un modelo de proposito general.
- La calidad y diversidad varian segun la variante DiT elegida (base, sft, turbo); la variante turbo prioriza velocidad y calidad sobre diversidad.
- La capacidad de comprension de audio y copia de melodia depende del tamano del LM: es debil en la variante de 0,6B.
- Posibles sesgos derivados del dataset de entrenamiento (musica con licencia, libre de derechos y sintetica), no detallados por el autor.
- Riesgo de alucinacion en la generacion de letras y metadatos por parte del LM planificador; no se documentan mecanismos de mitigacion.
- Aunque la licencia es MIT y el autor declara uso comercial permitido, conviene verificar las condiciones de los datos de entrenamiento para usos concretos.
- No se detallan limitaciones de contexto ni de idioma mas alla del soporte de 50+ idiomas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Chameleonstudios/Ace-Step1.5
- Repositorio oficial en Hugging Face: https://huggingface.co/ACE-Step/Ace-Step1.5
- Coleccion ACE-Step 1.5: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Demo en Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Pagina del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Tech Report (arXiv): https://arxiv.org/abs/2602.00744
- Discord: https://discord.gg/PeWDxrkdj7
- GitHub: https://github.com/ace-step/ACE-Step-1.5
