# jmcgomes/MOSS-Audio-8B-Thinking-MLX-8bit

## Resumen

MOSS-Audio-8B-Thinking-MLX-8bit es una conversión a MLX (el framework de Apple para ejecutar modelos en Apple Silicon) del modelo OpenMOSS-Team/MOSS-Audio-8B-Thinking, un modelo multimodal de comprensión de audio desarrollado por el equipo OpenMOSS. El trabajo de conversión y cuantización lo firma el usuario jmcgomes y se publica bajo licencia Apache-2.0, la misma del modelo original. No es un modelo de reconocimiento de voz al uso: está diseñado para comprender audio en sentido amplio, incluyendo efectos de sonido, ambientes, música, tono de voz y voces no humanas, y para responder preguntas sobre un clip o generar descripciones con marcas de tiempo.

La arquitectura combina un codificador de audio con un modelo de lenguaje de aproximadamente 9.050 millones de parámetros, unidos mediante un adaptador y fusionadores DeepStack. El modelo incorpora un modo de razonamiento explícito: genera su cadena de pensamiento dentro de etiquetas `` antes de emitir la respuesta final, y permite desactivar ese razonamiento mediante un bloque think vacío en el prompt.

La relevancia de esta ficha concreta es práctica: permite ejecutar un modelo de comprensión de audio de 8B en un Mac con Apple Silicon, con un checkpoint de 9,7 GB y un pico de 10,8 GB de RAM, a unos 50 tokens/s de decodificación en un M5 Max con GPU de 32 núcleos. Es una opción realista para prototipado local de aplicaciones de audio sin depender de GPU dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal audio-texto: codificador de audio + adaptador y fusionadores DeepStack + modelo de lenguaje transformer (familia moss_music en MLX) |
| Parametros totales | 9.052.463.488 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64, en las capas lineales del modelo de lenguaje, embeddings de tokens y `lm_head`; codificador de audio, adaptador y fusionadores DeepStack en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx`; tamaño del repo 10,4 GB, checkpoint de 9,7 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de tres bloques: un codificador de audio que convierte la señal en representaciones, un adaptador y fusionadores DeepStack que alinean esas representaciones con el espacio del modelo de lenguaje, y un LLM de unos 9.000 millones de parámetros que genera la respuesta. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde al modelo original y a su informe técnico (arXiv 2606.01802), no reproducido aquí.

La innovación destacable de esta versión es la estrategia de cuantización: solo se cuantizan a 8 bits las partes del modelo de lenguaje, mientras que el codificador de audio, el adaptador y los fusionadores DeepStack se mantienen en bf16. El autor justifica esta decisión indicando que las salidas de la ruta de audio alimentan al modelo de lenguaje sin atenuación, por lo que el error de cuantización en esa ruta no se absorbe. Los tensores de la ruta de audio son idénticos byte a byte a los de los ports MLX de fredchu y RumiLabs, y el layout completo a 8 bits coincide con el del MOSS-Music 8-bit de FractalSurfer. El modelo incorpora además un modo de razonamiento interno en `` que puede omitirse con un bloque think vacío, lo que según el autor apenas reduce la precisión en pruebas de opción múltiple y resulta unas 50 veces más rápido.

## Capacidades

- Comprensión de audio general, no limitada a habla: efectos de sonido, ambientes, música, tono de voz y voces no humanas.
- Generación de descripciones detalladas de un clip con marcas de tiempo.
- Respuesta a preguntas en lenguaje natural sobre el contenido de un audio (por ejemplo, si el hablante está enfadado).
- Modo de razonamiento explícito (``) antes de la respuesta final, desactivable.
- Conversión audio-texto (pipeline `audio-text-to-text`).
- Ejecución local en Apple Silicon mediante MLX y la librería mlx-audio.
- Soporte de tool calling, agentes, multilingüismo o visión: no disponible en la información proporcionada.

## Casos de uso

- Análisis de grabaciones de campo o archivos sonoros: el modelo genera descripciones con marcas de tiempo de un clip, útil para catalogar material de audio en proyectos de investigación o archivos multimedia.
- Etiquetado de bibliotecas de efectos de sonido y música: permite describir automáticamente cada pista para hacerla buscable por contenido (ambiente, instrumentos, tipo de sonido).
- Control de calidad en producción audiovisual: responder preguntas concretas sobre un clip (tono del hablante, presencia de ruido de fondo, música) para validar tomas antes de publicarlas.
- Asistencia a personas con discapacidad auditiva: descripción textual de ambientes y sonidos no verbales que los sistemas de subtitulado convencionales no cubren.
- Prototipado local de aplicaciones de audio en Mac: con claude-ears o mlx-audio se puede integrar en un flujo de escritorio sin GPU dedicada ni servicios en la nube, con carga y descarga del modelo bajo demanda.
- Investigación en comprensión de audio: al ser una conversión fiel del modelo original con la ruta de audio en bf16, sirve para reproducir experimentos en hardware de Apple Silicon.
- Moderación de contenido sonoro: clasificar clips por tipo de sonido o tono emocional en pipelines de revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de eficiencia en hardware Apple:

| Metrica | Valor |
|---|---|
| Tamano del checkpoint | 9,7 GB |
| Pico de RAM | 10,8 GB |
| Velocidad de decodificacion | 50 tokens/s en M5 Max, GPU de 32 nucleos |
| Aceleracion sin razonamiento | ~50x mas rapido en pruebas de opcion multiple, con perdida de precision casi nula segun el autor |

## Requisitos de hardware

- RAM: pico de 10,8 GB según el autor; el checkpoint ocupa 9,7 GB en disco.
- Hardware objetivo: Apple Silicon con MLX; la medición de referencia es un M5 Max con GPU de 32 núcleos.
- GPU dedicadas (A100, H100, RTX 4090): no aplica a esta conversión MLX; para esas plataformas habría que usar el modelo original o sus ports correspondientes.
- Cabe en equipos Apple Silicon con al menos 16 GB de memoria unificada; con 8 GB no es viable por el pico de 10,8 GB.
- Despliegue: librería `mlx` con `mlx-audio` (probado con 0.6.8) o la aplicación claude-ears, que sirve el modelo en local, lo descarga bajo demanda y lo descarga de memoria cuando está inactivo.
- Throughput: 50 tokens/s de decodificación en el hardware de referencia; no hay datos de latencia de preprocesado de audio ni de throughput en otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| jmcgomes/MOSS-Audio-8B-Thinking-MLX-8bit | 9.052.463.488 | no disponible | MLX safetensors, Apple Silicon | Apache-2.0 | 8 bits en LLM, ruta de audio en bf16; 10,8 GB de pico de RAM |
| OpenMOSS-Team/MOSS-Audio-8B-Thinking | no disponible | no disponible | pesos originales | Apache-2.0 | Modelo base sin cuantizar; requiere hardware distinto de MLX |
| Ports MLX de fredchu y RumiLabs | no disponible | no disponible | MLX | no disponible | Ruta de audio idéntica byte a byte a esta conversión |
| FractalSurfer MOSS-Music 8-bit | no disponible | no disponible | MLX, 8 bits | no disponible | Mismo layout de checkpoint que esta versión |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es desplegable en CUDA, ROCm ni en servidores x86 convencionales.
- La cuantización a 8 bits introduce error en el modelo de lenguaje; el autor solo garantiza la integridad de la ruta de audio, no la equivalencia numérica del LLM con el original.
- El modo de razonamiento consume muchos más tokens; sin desactivarlo, la latencia efectiva es muy superior a los 50 tokens/s nominales.
- No hay información sobre idiomas soportados, sesgos, tasas de alucinación ni evaluación en contextos de producción.
- El modelo es de comprensión de audio, no de generación; no produce audio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la conversión.
- Aunque la licencia es Apache-2.0, conviene verificar los términos del modelo original y de las dependencias (mlx-audio, claude-ears) antes de un uso comercial.
- El identificador arXiv 2606.01802 y las fechas del repositorio (noviembre de 2026) deben tratarse con cautela; no se han podido verificar de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmcgomes/MOSS-Audio-8B-Thinking-MLX-8bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Thinking
- Informe técnico (arXiv): https://arxiv.org/abs/2606.01802
- mlx-audio: https://github.com/Blaizzy/mlx-audio
- claude-ears: https://github.com/jorgemcgomes/claude-ears
