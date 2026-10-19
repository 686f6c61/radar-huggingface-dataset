# mlx-community/Ming-3.0-tts-0.5B-8bit

## Resumen

Ming-3.0-tts-0.5B-8bit es la conversión a MLX con cuantización de 8 bits del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-0.5B, publicada por la comunidad mlx-community. El modelo original lo desarrolla inclusionAI y es un sistema de text-to-speech denso construido sobre una base Qwen2.5-0.5B, con un decodificador de audio (VAE) que genera señal a 44,1 kHz. Esta versión está pensada para ejecutarse en Apple Silicon mediante la librería mlx-audio.

El interés práctico de esta ficha es doble. Por un lado, ofrece clonación de voz zero-shot, voces integradas, instrucciones libres de diseño de voz y control explícito de emoción, velocidad, tono y volumen, además de 14 etiquetas paralingüísticas en línea. Por otro, lo hace con un peso en disco de 1,5 GB y 2,2 GB de memoria pico, con un factor de tiempo real (RTF) de 0,39 medido en un M4 Pro, lo que lo sitúa en el rango de la inferencia local en portátiles.

Un detalle relevante: aunque el nombre comercial indica 0.5B, el recuento real de safetensors es de 1.479.454.868 parámetros (unos 1,48 mil millones), presumiblemente porque incluye los módulos de audio además del backbone de lenguaje. La licencia es MIT, lo que facilita el uso comercial, pero la integración requiere una versión de mlx-audio que incluya el arreglo del contrato de prompt (PR #1047); con versiones anteriores el modelo carga pero pronuncia palabras incorrectas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2.5-0.5B con decodificador de audio (VAE) |
| Parámetros totales | 1.479.454.868 (≈1,48 mil millones, recuento real de safetensors) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín (affine), group size 64, aplicado también al VAE de audio |
| Idiomas soportados | zh, en, de, es, fr, ko, ja; además sichuanés y cantonés según la model card del autor |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 8-bit; 1,5 GB en disco |

## Arquitectura y entrenamiento

La model card describe Ming-3.0-tts-0.5B como un modelo de voz denso basado en Qwen2.5-0.5B, es decir, un transformer decoder-only que actúa como backbone de lenguaje y que se acompaña de un VAE de audio para la síntesis de la forma de onda. La variante publicada aquí no reentrena nada: es una conversión de pesos con `mlx_audio.convert` a cuantización afín de 8 bits con group size 64, aplicada tanto al backbone como al VAE. Según el autor de la conversión, sobre latentes idénticos el VAE de 8 bits decodifica a 31 dB de SNR frente a bf16, una degradación medible pero moderada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo original pasó por RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal u otras) más allá de la propia arquitectura de síntesis. Lo que sí documenta la model card es el contrato de prompt: el modelo acepta texto, etiquetas paralingüísticas en línea, una instrucción libre (`instruct`), audio y transcripción de referencia para clonación, y un `lang_code` para forzar idioma.

## Capacidades

- Síntesis de voz multilingüe en chino, inglés, alemán, español, francés, coreano y japonés, con salida a 44,1 kHz.
- Clonación de voz zero-shot a partir de un clip de referencia y su transcripción exacta, sin necesidad de entrenamiento adicional.
- Voces integradas invocables por nombre (por ejemplo, `UK_Charlotte`).
- Instrucciones de diseño de voz en lenguaje libre (`instruct`), con modo `use_zero_spk_emb` para generar una identidad vocal nueva.
- Control de emoción, velocidad, tono y volumen mediante instrucciones (`ming3_instruction(emotion="...")`).
- 14 etiquetas paralingüísticas en línea, del estilo de `[Sigh]` o `[Cough]`, insertables en el texto para introducir sonidos no verbales.
- Soporte de dialectos adicionales (sichuanés y cantonés) según la documentación del autor.
- Integración en Python mediante `mlx_audio.tts.utils.load_model` y en CLI mediante `mlx_audio.tts.generate`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni agentes; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Audiolibros y narración larga: la ventana de contexto no está documentada, pero el modelo admite instrucciones de estilo y ritmo (`instruct` con "gentle pace"), lo que permite mantener un tono narrativo consistente en párrafos extensos; la model card verifica un párrafo de 30 segundos con tres fragmentos.
- Doblaje y localización: al cubrir siete idiomas con salida a 44,1 kHz, se puede generar una misma línea de guion en alemán, francés o japonés cambiando únicamente `--lang_code`, útil para prototipar pistas de doblaje antes de la locución profesional.
- Clonación de voz para accesibilidad: con un clip de referencia y su transcripción se puede reconstruir una voz personal para personas con pérdida de capacidad vocal, siempre con consentimiento explícito del hablante.
- Asistentes de voz en aplicaciones macOS/iOS: el RTF de 0,39 en M4 Pro y los 2,2 GB de memoria pico permiten síntesis en tiempo real en un portátil, integrándolo en un pipeline local sin enviar texto a la nube.
- Prototipado de IVR y atención al cliente: las voces integradas y el control de velocidad permiten generar mensajes de bienvenida y avisos en varios idiomas sin contratar grabaciones, sustituyéndolos después por locuciones definitivas.
- Contenido para pódcast y vídeo: las etiquetas paralingüísticas (`[Sigh]`, `[Cough]`) y el control de emoción permiten producir tomas con textura expresiva sin actor de doblaje, útiles para demos y maquetas.
- Pruebas de regresión de audio: al ser una conversión determinista con semilla configurable, sirve para generar corpus de referencia y comparar versiones del pipeline TTS (seeds distintas, mismo texto) y detectar regresiones de pronunciación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo TTS). La model card sí incluye verificaciones internas de calidad y métricas de eficiencia, que se recogen aquí tal cual:

| Prueba | Resultado | Condiciones |
|---|---|---|
| Transcripción correcta de clips | 24 de 24 | whisper-large-v3-turbo como transcriptor; inglés, chino, etiquetas paralingüísticas, clonación en ambos idiomas, instrucción libre, alemán y párrafo de 30 s en tres fragmentos; 3 semillas por caso |
| SNR del VAE 8-bit frente a bf16 | 31 dB | Sobre latentes idénticos |
| Factor de tiempo real (RTF) | 0,39 | Apple M4 Pro |
| Memoria pico | 2,2 GB | Apple M4 Pro |
| Tamaño en disco | 1,5 GB | Pesos 8-bit |

No hay comparación publicada contra otros modelos TTS en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,2 GB de memoria pico medida en M4 Pro; el peso en disco es de 1,5 GB.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no se documenta soporte CUDA ni ROCm para esta conversión.
- GPU recomendadas: no disponibles como tales; el dato de referencia es un Apple M4 Pro. Para el modelo original en bf16 habría que consultar la model card de inclusionAI, no incluida aquí.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con al menos ~3 GB de memoria disponible para el proceso.
- Opciones de despliegue: `mlx-audio` (CLI `mlx_audio.tts.generate` y API Python `load_model`). Requiere una versión con el arreglo del PR #1047; hasta su publicación hay que instalar desde la rama `ming3-dense` con `pip install "git+https://github.com/cguldogan/mlx-audio.git@ming3-dense"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,39 en M4 Pro, es decir, aproximadamente 0,39 segundos de cómputo por segundo de audio generado; no hay datos para otros equipos.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS comparables en la información proporcionada. La única comparación posible con los datos disponibles es entre esta conversión y el modelo original del que deriva:

| Modelo | Parámetros | Contexto | Cuantización | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/Ming-3.0-tts-0.5B-8bit | 1.479.454.868 | no disponible | 8-bit afín, group size 64 (incluye VAE) | 2,2 GB (M4 Pro) | MIT | HuggingFace, vía mlx-audio |
| inclusionAI/Ming-3.0-tts-0.5B | no disponible en esta ficha | no disponible | bf16 (original) | no disponible | MIT | HuggingFace |

Frente al original, la conversión reduce el peso a 1,5 GB y permite ejecución local en Apple Silicon, con una pérdida de fidelidad del VAE cuantificado cifrada en 31 dB de SNR. Para comparar con alternativas de otros fabricantes (tamaño, contexto, rendimiento, licencia) sería necesario consultar sus respectivas fichas, que no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Embeddings de hablante incompletos: el embedding CAM++ que la referencia usa para clonación y para las tareas de emoción, atributos y dialecto no está extraído; la clonación funciona solo con audio de referencia y transcripción.
- Normalización de texto no portada: hay que escribir los números con palabras, ya que el modelo no convierte cifras a su forma hablada.
- Fallo del cabezal de parada: ocasionalmente no se activa y deja ruido de baja intensidad al final del clip; la recomendación del autor es repetir con otra semilla.
- Dependencia de versión: con una versión de mlx-audio anterior al PR #1047 el modelo carga pero pronuncia palabras incorrectas, un fallo silencioso que puede pasar desapercibido en producción.
- Riesgo de pronunciación errónea y alucinación acústica: no hay garantía de fidelidad al texto en nombres propios, siglas ni en pasajes con muchas etiquetas paralingüísticas; la verificación con ASR es recomendable antes de publicar.
- Sesgos: no se documenta ninguna evaluación de sesgos de género, acento o edad en la información disponible.
- Cobertura de idiomas desigual: la verificación reportada cubre inglés, chino, alemán y clonación en dos idiomas; no hay evidencia publicada para español, francés, coreano, japonés, sichuanés ni cantonés.
- Licencia permisiva pero con responsabilidad del usuario: MIT permite uso comercial, pero la clonación de voz exige consentimiento explícito y cumplimiento de la normativa aplicable sobre identidad vocal.
- Restricción de plataforma: al ser una conversión MLX, no es desplegable en infraestructura NVIDIA sin recurrir al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Ming-3.0-tts-0.5B-8bit
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio del modelo original: https://github.com/inclusionAI/Ming-3.0-tts
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- PR con el arreglo del contrato de prompt: https://github.com/Blaizzy/mlx-audio/pull/1047
- README de la variante densa con lista completa de etiquetas y valores de control: https://github.com/cguldogan/mlx-audio/blob/ming3-dense/mlx_audio/tts/models/dense/README.md

Nota: los resultados de la búsqueda web proporcionados no guardan relación con este modelo (foro de Cfx.re, letras de canciones y tutoriales de CAD) y se han descartado por no ser fuentes válidas.
