# Salahuddin1234/magenta-realtime-2

## Resumen

Magenta RealTime 2 es un modelo abierto de generación musical desarrollado por Google DeepMind, diseñado para la síntesis de audio musical en streaming de baja latencia sobre dispositivos. Se trata de la evolución del modelo Magenta RealTime original y de la API Lyria RealTime, y su objetivo es permitir la generación continua de audio musical controlada en tiempo real mediante indicaciones de texto, ejemplos de audio y eventos MIDI. El modelo está publicado bajo licencia CC-BY-4.0 para los pesos y Apache 2.0 para el código.

A diferencia de su predecesor, que operaba por fragmentos (chunk-wise), Magenta RealTime 2 emplea un Transformer decoder-only que realiza autoregresión a nivel de frame, lo que habilita un control de grano más fino y una latencia inferior. El sistema se compone de tres piezas: el códec de audio discreto SpectroStream, el modelo de embeddings conjuntos audio-texto MusicCoCa y el LLM generador de tokens de audio. Existen dos configuraciones: `base` con 2400 millones de parámetros y `small` con 230 millones.

La relevancia del modelo radica en su orientación a la generación musical interactiva en el propio dispositivo, sin depender de servicios en la nube, lo que lo hace adecuado para aplicaciones de interpretación en vivo, videojuegos con bandas sonoras dinámicas y herramientas de creación musical accesible. El repositorio de Hugging Face ocupa 15,6 GB e incluye pesos en formato TFLite, lo que confirma su enfoque hacia la inferencia en dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención ventaneada por capas (frame-wise autoregression) + codec SpectroStream + MusicCoCa |
| Parametros totales | 2,4B (`base`) / 230M (`small`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de atención de 25 frames (1 s) por capa en `base` y 41 frames (~1,6 s) en `small`; campo receptivo efectivo de 20 s en ambos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de audio musical; las indicaciones de texto dependen de MusicCoCa) |
| Licencia | CC-BY-4.0 (pesos) y Apache 2.0 (código) |
| Formato de pesos | TFLite (repositorio de 15,6 GB) |

## Arquitectura y entrenamiento

Magenta RealTime 2 sigue una arquitectura de tres componentes. SpectroStream es un codec de audio discreto que convierte audio estéreo a 48 kHz en tokens con una tasa de 25 Hz, profundidad RVQ de 64 y códigos de 10 bits (16 kbps). MusicCoCa es un modelo entrenado de forma contrastiva que proyecta audio (16 kHz mono) y texto en un espacio de embeddings común de 768 dimensiones, cuantizado a 12 niveles RVQ con códigos de 10 bits. El tercer componente es un Transformer decoder-only que genera tokens de audio a partir de los tokens de contexto de SpectroStream, los 12 tokens de estilo de MusicCoCa y un vector multihot de 128 dimensiones que representa el estado de cada nota MIDI (apagada, sostenida, activada o sostenida/activada).

La innovación principal respecto al modelo anterior es la autoregresión a nivel de frame en lugar de por fragmentos, junto con el ajuste específico para streaming en dispositivo con control a nivel de frame. En cada paso temporal el modelo recibe una ventana de atención por capa (25 frames en `base`, con 20 capas; 41 frames en `small`, con 12 capas), lo que produce un campo receptivo efectivo de 20 segundos en ambas configuraciones, y emite un frame generado con 12 tokens RVQ. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación continua de audio musical en streaming con baja latencia, orientada a inferencia en dispositivo.
- Control mediante indicaciones de texto (estilo musical, por ejemplo "heavy metal") a través de los embeddings de MusicCoCa.
- Control mediante ejemplos de audio, gracias al espacio de embeddings conjunto audio-texto de MusicCoCa.
- Control mediante eventos MIDI con representación multihot de 128 dimensiones por frame, permitiendo condicionar notas y articulaciones.
- Generación de audio estéreo de alta fidelidad a 48 kHz mediante el decodificador de SpectroStream.
- Dos configuraciones de tamaño (`base` de 2,4B y `small` de 230M) para distintos presupuestos de cómputo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio de entrada conversacional.

## Casos de uso

- Interpretación musical en vivo e improvisación: el modelo genera música de forma continua controlada por el intérprete, que puede manipular los embeddings de estilo o el contexto de audio en tiempo real gracias a la generación frame a frame y a su baja latencia.
- Creación musical accesible y musicoterapia: personas con discapacidades o sin formación instrumental pueden participar en sesiones de improvisación conjunta o crear música en solitario mediante indicaciones de texto o MIDI.
- Bandas sonoras dinámicas en videojuegos: los desarrolladores pueden generar música adaptada en tiempo real a las acciones y el entorno del jugador, usando el control por estilo y MIDI para sincronizar la respuesta musical con la lógica del juego.
- Herramientas de producción musical en el dispositivo: la configuración `small` de 230M parámetros permite integrar generación musical en aplicaciones de escritorio o móviles sin depender de la nube, reduciendo costes y latencia.
- Aprendizaje por transferencia e investigación: los investigadores pueden reutilizar las representaciones de MusicCoCa y de Magenta RT 2 para tareas de reconocimiento de información musical.
- Personalización de estilos: el uso de indicaciones de texto y ejemplos de audio permite adaptar la generación a estilos concretos definidos por el usuario en aplicaciones creativas.
- Prototipado rápido de ideas musicales: compositores pueden explorar variaciones de estilo y arreglos en tiempo real antes de fijar una versión definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 15,6 GB, lo que da una cota superior del espacio de almacenamiento necesario para los pesos.
- GPU recomendadas: no disponible. El modelo está empaquetado en TFLite y orientado a generación en dispositivo, pero no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el formato TFLite y la librería `magenta-realtime-2` sugieren despliegue en dispositivos; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el modelo está diseñado para streaming de baja latencia con generación a nivel de frame, pero no se proporcionan cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Magenta RealTime 2 (`base`) | 2,4B | Campo receptivo efectivo de 20 s; atención de 25 frames por capa | Generación musical en streaming en dispositivo, control por texto, audio y MIDI | CC-BY-4.0 (pesos) / Apache 2.0 (código) | Hugging Face y GitHub de Magenta |
| Magenta RealTime 2 (`small`) | 230M | Campo receptivo efectivo de 20 s; atención de 41 frames por capa | Igual que `base`, con menor coste computacional | CC-BY-4.0 (pesos) / Apache 2.0 (código) | Hugging Face y GitHub de Magenta |
| Magenta RealTime (original) | No disponible | No disponible | Generación musical por fragmentos (chunk-wise) | No disponible | Hugging Face (`google/magenta-realtime`) |
| Lyria RealTime API | No disponible | No disponible | Generación musical en tiempo real vía API | No disponible (servicio propietario) | API de Google |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con estas alternativas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información disponible.
- Riesgo de alucinación aplicable en el sentido de generar audio musical que no se corresponda con el estilo o la indicación solicitada; no se cuantifica.
- Las indicaciones de texto dependen de MusicCoCa y de su espacio de embeddings; no se especifican los idiomas soportados ni la cobertura lingüística.
- El campo receptivo efectivo está limitado a 20 segundos, lo que restringe la coherencia musical a escalas temporales más largas.
- La licencia CC-BY-4.0 exige atribución; el uso comercial está permitido bajo esa licencia, pero el autor impone términos adicionales de uso responsable y prohíbe generar contenido que infrinja derechos de terceros, incluidos derechos de propiedad intelectual.
- Google no reclama derechos sobre las salidas generadas, pero el usuario es el único responsable de dichas salidas y de sus usos posteriores.
- El modelo se distribuye "AS IS", sin garantías de ningún tipo.
- No se especifican requisitos de hardware ni cifras de latencia, lo que dificulta planificar un despliegue en producción.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Salahuddin1234/magenta-realtime-2](https://huggingface.co/Salahuddin1234/magenta-realtime-2)
- [Hugging Face oficial: google/magenta-realtime-2](https://huggingface.co/google/magenta-realtime-2)
- [Get Started](https://magenta.withgoogle.com/mrt2)
- [Blog Post](https://magenta.withgoogle.com/magenta-realtime-2)
- [Repositorio GitHub](https://github.com/magenta/magenta-realtime)
- [Paper: Live music model (arXiv:2508.04651)](https://arxiv.org/abs/2508.04651)
- [Paper: SpectroStream (arXiv:2508.05207)](https://arxiv.org/abs/2508.05207)
- [Paper: MusicCoCa base (arXiv:2205.01917)](https://arxiv.org/abs/2205.01917)
- [Paper: MusicCoCa base (arXiv:2208.12415)](https://arxiv.org/abs/2208.12415)
- [Lyria RealTime API](http://goo.gle/lyria-realtime)
