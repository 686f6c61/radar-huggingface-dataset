# FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit

## Resumen

MOSS-Music-8B-Instruct en formato MLX a 5 bits es una conversión comunitaria del modelo multimodal de comprensión musical OpenMOSS-Team/MOSS-Music-8B-Instruct, publicada por el usuario FractalSurfer. El modelo original lo desarrolla el equipo OpenMOSS (MOSI.AI y Shanghai Innovation Institute) y su función es escuchar audio musical y responder en texto: descripción de estilo, transcripción de letras, análisis estructural y preguntas y respuestas sobre la pieza. Esta conversión concreta no añade capacidades nuevas: únicamente cambia el formato de pesos a MLX y aplica cuantización afín de 5 bits con tamaño de grupo 64, con el objetivo de ejecutarlo en un Mac con 16 GB de memoria.

El modelo tiene 9.052.463.488 parámetros (unos 9,05 mil millones) y un tamaño en disco de 7,4 GB. Internamente combina un encoder de audio, un adaptador y tres módulos DeepStack de fusión (que se mantienen en bf16) con un modelo de lenguaje Qwen3 cuantizado, que es el encargado de generar el texto. Soporta inglés y chino, se distribuye bajo licencia Apache-2.0 y se carga mediante la librería mlx-audio en Apple Silicon.

Su relevancia es doble: por un lado, permite análisis musical local sin enviar audio a servicios externos; por otro, es la pieza de inferencia del proyecto Trainspotting Suite, donde actúa como "oídos" que escuchan cada pista en fragmentos de dieciséis compases y rellenan un formulario estructurado con quién canta, cómo lo hace, cómo suena el sintetizador, la letra y el estado de ánimo. El autor advierte de que no es una conversión oficial y de que no se han medido las métricas de los benchmarks del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de audio: encoder de audio + adaptador + tres módulos DeepStack de fusión + modelo de lenguaje Qwen3 (decoder transformer). Detalle interno del encoder: no disponible |
| Parámetros totales | 9.052.463.488 (9,05 mil millones) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5 bits afín (affine), tamaño de grupo 64, sobre el modelo de lenguaje Qwen3, sus embeddings de tokens y el lm_head. Encoder de audio, adaptador y mergers DeepStack conservados en bf16. Existen variantes de la misma conversión en 8 bits y 4 bits (esta última descartada por el autor) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 (la del modelo base) |
| Formato de pesos | safetensors en formato MLX (repo de 7,4 GB) |

## Arquitectura y entrenamiento

La información disponible describe la conversión, no el entrenamiento del modelo original. Según la documentación del proyecto, MOSS-Music parte del mismo backbone de audio que MOSS-Audio y se especializa en música mediante un preentrenamiento continuado dedicado y un ajuste supervisado (SFT), orientado a tres tareas: captioning musical, ASR de letras y análisis estructural. En esta conversión MLX, el componente de lenguaje es Qwen3, cuantizado a 5 bits; el resto del pipeline de audio (encoder, adaptador y los tres mergers DeepStack) permanece en bf16 y en conjunto ocupa menos de 2 GB. La salida de esos módulos se inyecta directamente en la entrada del modelo de lenguaje.

La conversión se realizó con mlx 0.31.2 y mlx-audio 0.5.7 mediante el script `mlx_audio.stt.models.moss_music.convert` sobre el commit fce7f830 del modelo base, con `--quantize --q-bits 5 --q-group-size 64`. El único cambio posterior en los ficheros fue corregir el campo `model_repo` de `config.json` para que apuntase al checkpoint Instruct. No hay datos disponibles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Comprensión musical: descripción de estilo, instrumentación y atmósfera de una pista de audio.
- Transcripción de letras (ASR musical) a partir del audio.
- Análisis estructural de la pieza y análisis de acordes, según la demo oficial del modelo base.
- Preguntas y respuestas sobre música en formato conversacional (audio-text-to-text).
- Seguimiento de instrucciones directas y generación de respuestas en formato estructurado (por ejemplo, formularios JSON con campos definidos por el usuario).
- Capacidades multilingües limitadas a inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la variante Instruct (el proyecto publica una variante Thinking separada, con razonamiento en cadena de pensamiento).
- Modo de pensamiento (thinking): no en este checkpoint; el autor advierte que no debe abrirse la respuesta con un bloque `<think>` vacío en el modelo Instruct.

## Casos de uso

- Catalogación automática de bibliotecas musicales: el modelo escucha cada pista y rellena metadatos estructurados (instrumentación, estado de ánimo, presencia de voces), lo que permite indexar colecciones grandes sin intervención manual.
- Flujos de trabajo de DJ y producción: integrado en Trainspotting Suite, analiza cada tema en fragmentos de dieciséis compases y completa un formulario con quién canta, cómo canta, carácter del sintetizador, letra y mood; sirve para preparar sesiones o etiquetar material propio.
- Transcripción de letras para subtitulado o karaoke: el modelo genera la letra en texto a partir del audio, útil como primer borrador que después se revisa.
- Búsqueda semántica sobre catálogos de audio: al convertir cada pista en una descripción textual, se puede construir un índice de búsqueda por mood, instrumentación o estructura en lugar de depender solo de metadatos manuales.
- Asistencia a la educación musical: responder preguntas del tipo "¿qué instrumentos entran en este pasaje?" o "¿cómo cambia la estructura en la segunda sección?" sobre ejemplos concretos.
- Curación de playlists por criterios subjetivos: clasificar temas por estado de ánimo o textura sonora a partir de audio, en lugar de por género declarado por el editor.
- Accesibilidad: generar descripciones textuales de piezas musicales para personas con discapacidad auditiva o para resúmenes automáticos en plataformas de streaming.
- Etiquetado de datos para investigación en música: producir anotaciones preliminares (letras, estructura, instrumentación) que después se validan y se usan como conjunto de entrenamiento o evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se ha medido la precisión en los benchmarks que reporta la tarjeta del modelo base. Los únicos datos numéricos disponibles son las mediciones de la conversión en una prueba interna del autor (M4 Max de 64 GB, clips de 30 segundos, prompt de sistema largo cacheado tras el primer clip y un formulario JSON de unos 230 tokens, cuatro clips repetidos ocho veces cada uno):

| Métrica | Valor |
|---|---|
| Tamaño en disco | 7,4 GB |
| Pico de memoria (MLX) | 8,2 GB |
| Tiempo de carga | 4 s |
| Tiempo por pregunta | 6 a 8 s |
| Velocidad de generación | 27 a 40 tokens por segundo (según carga de la máquina) |
| Respuestas con JSON utilizable | 31 de 32 tras reparar corchetes (17 tal cual se escribieron) |
| Formularios de mezcla completa con todos los campos | 14 de 16 |
| Preguntas que se quedaron repitiendo una letra y hubo que repetir | 4 de 32 |

Comparación de cuantizaciones reportada por el autor en la misma prueba: 8, 6 y 5 bits dieron resultados parecidos en nombres de campo y corchetes omitidos (el modelo a precisión completa, ejecutado con PyTorch, también escribió 4 de 8 respuestas con un corchete mal puesto, por lo que el defecto es del modelo y no de la cuantización); la versión de 5 bits se bloqueó algo más (4 preguntas de 32 frente a 1). La de 4 bits se degradó claramente: nombró mal o inventó un campo en una cuarta parte de sus respuestas y se quedó repitiendo en una cuarta parte de las preguntas, motivo por el que no se publicó una build de 4 bits.

## Requisitos de hardware

- VRAM/memoria estimada: 7,4 GB en disco y 8,2 GB de pico medido con MLX durante la inferencia. El autor indica que está pensada para un Mac con 16 GB de memoria.
- GPU recomendadas: el formato es MLX, específico de Apple Silicon; las mediciones se hicieron en un M4 Max de 64 GB. No hay datos para GPU NVIDIA (A100, H100, RTX 4090) ni CUDA en la información disponible.
- Consumer GPU: no aplica en el sentido habitual; el requisito es un Mac con Apple Silicon y al menos 16 GB de memoria unificada.
- Variante mayor: la versión de 8 bits de la misma conversión ocupa 10,4 GB en disco y alcanza 11,3 GB de pico, pensada para máquinas con 24 GB o más.
- Opciones de despliegue: mlx-audio 0.5.7 o superior en Apple Silicon, con `from mlx_audio.stt import load` y `model.generate(...)`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible; el formato de pesos es MLX y la librería declarada es mlx-audio.
- Latencia y throughput medidos: carga en 4 s; entre 6 y 8 s por pregunta; entre 27 y 40 tokens por segundo, según la carga concurrente de la máquina.
- Parámetros de muestreo recomendados: temperatura 0,7, top-p 0,8, top-k 20. A temperatura 0 el modelo se repite en respuestas largas. Se recomiendan clips de unos 30 segundos y preguntas concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit | 9,05 B | no disponible | MLX, 5 bits (grupo 64) | Apache-2.0 | HuggingFace |
| OpenMOSS-Team/MOSS-Music-8B-Instruct (base) | 9,05 B | no disponible | Pesos originales en precisión completa (bf16), ejecutable con PyTorch | Apache-2.0 | HuggingFace, ModelScope, demo en HF Spaces |
| FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit | 9,05 B | no disponible | MLX, 8 bits; 10,4 GB en disco, 11,3 GB de pico | Apache-2.0 | HuggingFace |
| FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit | 9,05 B | no disponible | MLX, 5 bits; variante con razonamiento en cadena de pensamiento | Apache-2.0 | HuggingFace |

Todas las variantes comparten el mismo modelo base y la misma licencia; las diferencias están en el formato, la cuantización y el checkpoint (Instruct frente a Thinking). No se dispone de datos comparativos de rendimiento frente a otros modelos de comprensión musical de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Conversión comunitaria: el autor no pertenece al equipo OpenMOSS; los créditos del modelo son del equipo original y esta build solo cambia formato y cuantización.
- No hay benchmarks de precisión publicados para esta conversión; el propio autor señala que no ha medido la exactitud en los benchmarks de la tarjeta del modelo base.
- Bucles de repetición: en la prueba interna, 4 de 32 preguntas se quedaron repitiendo una letra; el autor recomienda cortar la respuesta y volver a preguntar cuando ocurra. El problema aparece sobre todo con letras que se repiten realmente en la canción.
- A temperatura 0 el modelo se repite en respuestas largas; hay que usar los parámetros de muestreo recomendados.
- Formato estructurado frágil: solo 17 de 32 respuestas fueron JSON válido tal cual se escribieron; tras reparar corchetes, 31 de 32. Solo 14 de 16 formularios de mezcla completa incluyeron todos los campos.
- En este checkpoint Instruct no debe abrirse la respuesta con un bloque `<think>` vacío (técnica propia del checkpoint Thinking): al hacerlo se bloqueó en 3 de 12 preguntas, frente a 1 de 32 sin ese bloque.
- La cuantización a 5 bits es ligeramente menos estable que la de 8 bits en este test (4 bloqueos en 32 frente a 1). La de 4 bits se descartó por degradación clara del formato y de la coherencia.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Longitud de audio práctica: se recomiendan clips de unos 30 segundos. No se especifica la longitud de contexto del modelo de lenguaje.
- Licencia Apache-2.0, que permite uso comercial; conviene conservar el aviso de licencia y la atribución al modelo base.
- Advertencia general de alucinación: al ser un modelo generativo aplicado a transcripción de letras y análisis musical, puede inventar contenido (letras, instrumentos o campos) cuando el audio es ambiguo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct
- Model card del base (README): https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct/blob/main/README.md
- Variante MLX 8 bits: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit
- Variante MLX 5 bits del checkpoint Thinking: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit
- Repositorio del proyecto MOSS-Music: https://github.com/OpenMOSS/MOSS-Music
- README del proyecto: https://github.com/OpenMOSS/MOSS-Music/blob/main/README.md
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Music-8B-Instruct
- Modelo en ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-Music-8B-Instruct
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Trainspotting Suite: https://github.com/remy-st/trainspotting-suite
