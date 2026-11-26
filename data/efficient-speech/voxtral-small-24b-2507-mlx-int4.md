# efficient-speech/Voxtral-Small-24B-2507-MLX-INT4

## Resumen

Voxtral-Small-24B-2507-MLX-INT4 es una version cuantizada del modelo Voxtral-Small-24B-2507 de Mistral AI, publicada por el colectivo efficient-speech. Voxtral es un modelo multimodal de audio y texto: transcribe voz y acepta entrada de audio para responder preguntas en lenguaje natural. Esta variante concreta convierte los pesos originales al formato MLX (Apple Silicon) y aplica cuantizacion afina de 4 bits al modelo de lenguaje, manteniendo el codificador de audio en BF16.

El modelo resuelve el problema del reconocimiento automatico del habla (ASR) y del razonamiento sobre audio en entornos con hardware de Apple. Al reducir los pesos a 4 bits, el repositorio ocupa unos 15 GB, lo que hace viable la inferencia local en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Max/Ultra), algo impensable con el checkpoint original en BF16.

La publicacion acompana a Murmur, un sistema de inferencia para reconocimiento de voz de formato largo desarrollado por la Universidad de Washington (uw-syfi). La relevancia actual radica en que combina un modelo de 24.900 millones de parametros con un runtime optimizado para Apple Silicon, abriendo el ASR de alta calidad y el audio-question answering a flujos de trabajo locales sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (codificador de audio + LLM decoder); pesos convertidos a MLX |
| Parametros totales | 24.932.889.600 (~24,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (cuantizacion afina de 4 bits, grupos de 64) en el modelo de lenguaje; codificador de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Voxtral sigue una arquitectura multimodal compuesta por un codificador de audio y un decodificador de lenguaje basado en transformer. En esta version MLX, el codificador de audio conserva los pesos en BF16 para preservar la calidad de las representaciones acusticas, mientras que el modelo de lenguaje se cuantiza a 4 bits con cuantizacion afina por grupos de 64, un esquema habitual en el ecosistema MLX que reduce el uso de memoria manteniendo la fidelidad numerica en la mayoria de las capas.

Los shards de pesos serializados coinciden byte a byte con el checkpoint MLX de referencia publicado por MarkusKaemmerer (Voxtral-Small-24B-2507-4bit-dense-encoder), por lo que la conversion es reproducible y verificable. La conversion se probo con el runtime independiente `mlx-voxtral==0.0.6`. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Transcripcion de voz a texto (ASR) en audio de formato corto y largo.
- Respuesta a preguntas sobre audio: el modelo acepta una pista de audio y una pregunta en lenguaje natural y genera una respuesta textual.
- Procesamiento de audio de formato largo gracias al sistema Murmur que acompana la publicacion.
- Generacion de texto derivada del decodificador de lenguaje del modelo base.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio bidireccional adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo convierte grabaciones de audio en texto; su naturaleza de 24,9 B parametros permite capturar terminologia tecnica y nombres propios con mayor fidelidad que modelos ASR pequenos, y el runtime MLX lo ejecuta en un Mac sin GPU dedicada.
- Subtitulado de video y podcasts: al procesar audio de formato largo mediante Murmur, se puede generar una transcripcion con marcas temporales para postproduccion, aprovechando la ventana de contexto del modelo de lenguaje.
- Audio-question answering en asistentes de accesibilidad: un usuario sube una nota de voz o una grabacion y formula preguntas ("que se dijo sobre el presupuesto"), y el modelo responde extrayendo la informacion del audio.
- Analisis de llamadas de atencion al cliente: transcripcion y resumen de conversaciones telefonicas para control de calidad, con la ventaja de que los datos no salen del equipo local al ejecutarse en MLX.
- Investigacion en procesamiento de habla: banco de pruebas para experimentar con cuantizacion INT4 en modelos multimodales de audio, comparando la degradacion frente al checkpoint BF16 original.
- Prototipado en Apple Silicon: desarrollo de aplicaciones macOS/iOS que necesiten ASR local sin depender de servicios en la nube, usando `mlx-voxtral` como runtime de referencia.
- Archivado y busqueda de contenido audiovisual: indexacion de una biblioteca de grabaciones mediante transcripcion masiva en un Mac Studio con memoria unificada suficiente para el modelo de 15 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: el repositorio pesa 15,0 GB, por lo que se recomienda un minimo de 16 GB de memoria unificada; para margen de trabajo con contexto y audio de formato largo, 24-32 GB o mas.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M1/M2/M3/M4 Max y Ultra). No esta pensado para GPUs NVIDIA; el formato MLX es especifico del ecosistema Apple.
- Cabe en consumer hardware: si, en equipos Apple con al menos 16 GB de memoria unificada; en configuraciones de 8 GB no es viable.
- Opciones de despliegue: runtime `mlx-voxtral` (version 0.0.6 probada) y el sistema Murmur para reconocimiento de voz de formato largo. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Small-24B-2507-MLX-INT4 (este) | ~24,9 B | no disponible | INT4 (MLX) | Apache 2.0 | Hugging Face (efficient-speech) |
| Voxtral-Small-24B-2507 (base, Mistral AI) | ~24,9 B | no disponible | BF16 | Apache 2.0 | Hugging Face (mistralai) |
| Voxtral-Small-24B-2507-4bit-dense-encoder (MarkusKaemmerer) | ~24,9 B | no disponible | 4 bits (MLX) | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos ASR comparables con datos verificables. La diferencia principal entre las tres versiones es el formato y esquema de cuantizacion: el checkpoint original en BF16 exige mucha mas memoria, mientras que las dos variantes de 4 bits reducen el peso a unos 15 GB; la version de efficient-speech declara coincidencia byte a byte con la de MarkusKaemmerer.

## Limitaciones y advertencias

- La cuantizacion INT4 introduce una perdida de precision frente al checkpoint BF16 original; no se han publicado evaluaciones que cuantifiquen esa degradacion en tareas ASR.
- El codificador de audio permanece en BF16, de modo que el ahorro de memoria se concentra en el modelo de lenguaje.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni idiomas soportados; se desconoce el comportamiento en lenguas distintas del ingles.
- El modelo esta atado al ecosistema MLX: no es desplegable en GPUs NVIDIA ni en runtimes como vLLM o llama.cpp sin conversion adicional.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Mistral AI y de cualquier dependencia del runtime.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su calidad en produccion.
- La fecha de creacion indicada (2026-11-26) resulta anomala; conviene confirmar la integridad y procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficient-speech/Voxtral-Small-24B-2507-MLX-INT4
- Modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Checkpoint MLX de referencia: https://huggingface.co/MarkusKaemmerer/Voxtral-Small-24B-2507-4bit-dense-encoder
- Sistema Murmur: https://github.com/uw-syfi/Murmur
