# mlx-community/Ming-3.0-tts-0.5B-bf16

## Resumen

Ming-3.0-tts-0.5B es un modelo de síntesis de voz (text-to-speech) denso desarrollado por inclusionAI, construido sobre la arquitectura Qwen2.5-0.5B. Esta ficha describe la conversión a formato MLX publicada por mlx-community, que mantiene los pesos en bfloat16 sin modificaciones respecto al checkpoint original y los adapta para su ejecución con la librería mlx-audio sobre Apple Silicon. El modelo resuelve la generación de voz multilingüe con clonación zero-shot, voces integradas y control fino de la locución mediante instrucciones en lenguaje natural.

A pesar del sufijo "0.5B" del nombre, el recuento real de parámetros en los ficheros safetensors es de 1.479.454.868 (~1,48 mil millones), un dato relevante para planificar memoria y tiempos de inferencia. El modelo cubre chino, inglés, alemán, español, francés, coreano y japonés, y según la model card del autor también sichuanés y cantonés, con salida de audio a 44,1 kHz y soporte de 14 etiquetas paralingüísticas en línea.

Su relevancia ahora es doble: por un lado, es una alternativa de licencia MIT para clonación de voz y TTS expresivo en siete idiomas; por otro, esta conversión concreta permite ejecutar el modelo de forma local en equipos Apple Silicon con un factor de tiempo real cercano a 1,0 y un pico de memoria de 4,4 GB. La contrapartida es que depende de un parche aún no publicado en mlx-audio, por lo que requiere instalar desde una rama específica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Densa, basada en Qwen2.5-0.5B, orientada a síntesis de voz (pipeline text-to-speech) |
| Parámetros totales | 1.479.454.868 (~1,48 B; el nombre comercial indica 0.5B) |
| Parámetros activos | No aplica: modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos en bfloat16 (bf16) sin modificar respecto al checkpoint original; el repositorio no publica variantes cuantizadas |
| Idiomas soportados | Chino (zh), inglés (en), alemán (de), español (es), francés (fr), coreano (ko), japonés (ja); la model card del autor añade sichuanés y cantonés |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) con código custom (`custom_code`), librería mlx-audio |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Tamaño en disco | 3,0 GB |
| Memoria pico en inferencia | 4,4 GB (medido en M4 Pro) |
| Factor de tiempo real (RTF) | ~1,0 en M4 Pro |

## Arquitectura y entrenamiento

El modelo es de tipo denso y se apoya en el backbone de Qwen2.5-0.5B, adaptado por inclusionAI para la tarea de texto a voz. La model card del autor no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible en los materiales consultados. La conversión de mlx-community no altera los pesos: únicamente los empaqueta para mlx-audio mediante `mlx_audio.convert`, manteniendo la precisión bfloat16.

Las capacidades técnicas destacadas que sí documenta el autor incluyen clonación de voz zero-shot a partir de un clip de referencia y su transcripción exacta, voces integradas identificadas por nombre (por ejemplo, `UK_Charlotte`), instrucciones libres de diseño de voz y control de emoción, velocidad, tono y volumen. Además incorpora 14 etiquetas paralingüísticas en línea que se insertan en el propio texto, como `[Sigh]` o `[Cough]`, y una función auxiliar `ming3_instruction` para construir instrucciones de control desde Python.

Un detalle operativo importante: esta conversión necesita la corrección del contrato de prompts incluida en el PR #1047 de mlx-audio. Con una versión anterior de la librería el modelo carga, pero pronuncia texto incorrecto. Hasta que se publique esa corrección, la instalación debe hacerse desde la rama `ming3-dense` del repositorio de cguldogan.

## Capacidades

- Síntesis de voz multilingüe en chino, inglés, alemán, español, francés, coreano y japonés, con salida a 44,1 kHz.
- Clonación de voz zero-shot utilizando un audio de referencia y su transcripción exacta (`--ref_audio` y `--ref_text`).
- Voces integradas seleccionables por identificador, como `UK_Charlotte`.
- Instrucciones de diseño de voz en lenguaje libre mediante `--instruct`, por ejemplo describiendo tono, ritmo y carácter de la narración.
- Control explícito de emoción, velocidad, tono y volumen a través de la función `ming3_instruction`.
- Soporte de 14 etiquetas paralingüísticas en línea insertadas en el texto, como `[Sigh]` y `[Cough]`.
- Generación de párrafos de hasta 30 segundos con varios fragmentos en una sola llamada.
- Interfaz de línea de comandos (`mlx_audio.tts.generate`) y API de Python (`load_model` y `model.generate`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Clonación de voz para audiolibros y narración: el modelo permite crear una voz consistente a partir de un clip de referencia y su transcripción, y aplicar después instrucciones de estilo como ritmo pausado o tono íntimo, adecuado para narración larga con identidad de voz estable.
- Doblaje y localización de contenido: al cubrir siete idiomas con un mismo modelo, se puede generar la misma pieza en español, francés, alemán, coreano y japonés sin cambiar de infraestructura, manteniendo el control de velocidad para ajustar la duración al vídeo original.
- Asistentes de voz locales en macOS: con 4,4 GB de pico de memoria y un RTF de ~1,0 en M4 Pro, es viable integrar la síntesis en una aplicación de escritorio que funcione sin conexión y sin enviar texto a servicios externos.
- Accesibilidad y lectura de pantalla: la salida a 44,1 kHz y el control de velocidad y tono permiten generar locuciones inteligibles y ajustables para usuarios con dificultades de lectura, incluyendo contenido técnico con siglas en varios idiomas.
- Prototipado de personajes y videojuegos: las etiquetas paralingüísticas (`[Sigh]`, `[Cough]`) y el control de emoción permiten producir variaciones expresivas de un mismo personaje sin grabar actor de voz, útil en fases de preproducción.
- Generación de avisos y locuciones para sistemas de megafonía o atención telefónica: las voces integradas y las instrucciones de estilo evitan depender de una muestra de referencia, lo que simplifica la creación de mensajes cortos y repetibles.
- Investigación en TTS y evaluación de modelos: la licencia MIT y la disponibilidad de los pesos en safetensors facilitan experiments de comparación de clonación zero-shot y de control prosódico sobre una base reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, WER u otras métricas estándar de TTS no aparecen en la model card ni en los materiales consultados). El único dato de validación disponible es una prueba de inteligibilidad interna del autor de la conversión:

| Prueba | Condiciones | Resultado |
|---|---|---|
| Inteligibilidad por transcripción automática | Clips transcritos con whisper-large-v3-turbo; inglés, chino, etiquetas paralingüísticas, clonación en chino e inglés, instrucciones libres, alemán y un párrafo de 30 s con tres fragmentos; 3 semillas por caso | 24 de 24 clips correctos |
| Factor de tiempo real (RTF) | Apple M4 Pro | ~1,0 |
| Memoria pico | Apple M4 Pro | 4,4 GB |
| Frecuencia de muestreo de salida | — | 44,1 kHz |

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon mediante MLX; no hay soporte documentado para CUDA ni ROCm en esta conversión.
- Memoria unificada: pico medido de 4,4 GB, por lo que un equipo con 16 GB de memoria unificada es suficiente para ejecutar el modelo junto al sistema operativo.
- Almacenamiento: 3,0 GB de pesos en disco.
- GPU recomendadas: Apple M4 Pro (medición de referencia del autor con RTF ~1,0); no se han publicado mediciones para M1, M2, M3, M4 base, Max o Ultra.
- Cabe en GPU de consumo de forma indirecta: sí en Apple Silicon de gama media y alta; no está previsto para tarjetas NVIDIA/AMD en este formato.
- Despliegue: CLI `mlx_audio.tts.generate` y API de Python de mlx-audio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato MLX.
- Latencia y throughput: RTF de aproximadamente 1,0 en M4 Pro, es decir, generación en tiempo real para la longitud de audio producida.
- Requisito de versión: es imprescindible la corrección del contrato de prompts del PR #1047 de mlx-audio; hasta su publicación, instalar con `pip install "git+https://github.com/cguldogan/mlx-audio.git@ming3-dense"`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| mlx-community/Ming-3.0-tts-0.5B-bf16 (esta ficha) | ~1,48 B (denso) | 7 (zh, en, de, es, fr, ko, ja) + sichuanés y cantonés según el autor | No disponible | MIT | safetensors bf16, mlx-audio, solo Apple Silicon |
| inclusionAI/Ming-3.0-tts-0.5B (modelo base) | ~1,48 B (denso) | 7 + sichuanés y cantonés | No disponible | MIT | Checkpoint original; requiere el stack del autor |
| Otras familias de TTS open source (XTTS, Kokoro, Fish Speech, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto, rendimiento o licencia de modelos alternativos de la misma categoría, por lo que no se incluye una comparación numérica que pudiera resultar inventada. La comparación más sólida disponible es frente al checkpoint original de inclusionAI, del que esta versión solo difiere en el empaquetado (MLX/bf16) y no en los pesos.

## Limitaciones y advertencias

- Los embeddings de hablante CAM++ que la referencia usa para clonación y para las tareas de emoción, atributos y dialecto no están extraídos en esta conversión; la clonación funciona únicamente a partir del audio de referencia y su transcripción.
- La normalización de texto de la implementación de referencia no está portada: los números deben escribirse con letras para evitar lecturas incorrectas.
- La cabeza de parada falla ocasionalmente y deja ruido de baja intensidad al final del audio; la solución indicada es regenerar con otra semilla.
- Riesgo de alucinación acústica y de prosodia incorrecta en textos largos, siglas o dominios especializados; la validación publicada se limita a 24 clips con 3 semillas.
- Sesgos de voz: al ser un modelo entrenado por un tercero, la distribución de acentos, géneros y edades de las voces integradas no está documentada, y la clonación reproduce las características del audio de referencia, incluidos sus posibles sesgos.
- Uso comercial permitido por la licencia MIT, pero la clonación de voz exige consentimiento explícito de la persona cuya voz se replica y el cumplimiento de la normativa aplicable sobre datos biométricos y deepfakes; la licencia no cubre esos riesgos legales.
- Dependencia de una rama no publicada de mlx-audio: con versiones anteriores el modelo carga pero pronuncia texto incorrecto, lo que puede pasar desapercibido en una integración automatizada.
- Plataforma restringida a Apple Silicon; no hay ruta documentada para servidores con GPU NVIDIA, lo que limita su uso en producción a gran escala.
- Longitud de contexto no documentada: no hay garantía publicada sobre la longitud máxima de texto por llamada, más allá del ejemplo de 30 segundos con tres fragmentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Ming-3.0-tts-0.5B-bf16
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio del autor: https://github.com/inclusionAI/Ming-3.0-tts
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Pull request con la corrección del contrato de prompts: https://github.com/Blaizzy/mlx-audio/pull/1047
- Rama de instalación con el parche: https://github.com/cguldogan/mlx-audio/tree/ming3-dense
- README de la variante densa en mlx-audio: https://github.com/cguldogan/mlx-audio/blob/ming3-dense/mlx_audio/tts/models/dense/README.md
