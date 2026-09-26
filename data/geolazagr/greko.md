# geolazagr/greko

## Resumen
Greko 2 (beta) es un asistente de IA multimodal desarrollado por George (usuario geolazagr) que funciona íntegramente en local sobre Android. Está construido a partir de Qwen3-VL-2B-Instruct mediante un ajuste fino con QLoRA sobre el modelo de lenguaje y una posterior cuantización a 4 bits, mientras que el codificador visual y el proyector se mantienen en 8 bits sin cambios. El resultado se distribuye en formato GGUF para llama.cpp junto con una aplicación Android que permite conversar, analizar fotos y razonar paso a paso sin enviar datos a la nube.

El modelo resuelve el problema de disponer de un asistente conversacional y visual privado en dispositivos móviles sin conectividad. Con 1.720.574.976 parámetros totales y un enfoque en inglés y griego, busca cubrir tareas de descripción de imágenes, lectura de texto en fotos y respuesta a preguntas sobre las mismas. Su relevancia actual radica en la creciente demanda de IA de borde (edge AI) que garantice privacidad y funcione sin depender de servidores externos.

Incluye un modo Think que genera razonamiento paso a paso antes de responder, pensado para tareas de lógica y matemáticas, aunque el autor advierte que el rendimiento en matemáticas queda por debajo del modelo base. La longitud de contexto no está especificada en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3-VL-2B-Instruct |
| Parametros totales | 1.720.574.976 (dato de safetensors; el modelo publicado está cuantizado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para el modelo de lenguaje; 8-bit para el codificador visual y proyector |
| Idiomas soportados | Inglés (en) y griego (el) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (greko-2-Q4_K_M.gguf y mmproj-greko-2.gguf) |

## Arquitectura y entrenamiento
Greko 2 parte de Qwen3-VL-2B-Instruct, un transformer multimodal que combina un modelo de lenguaje con un codificador visual. El ajuste fino se realizó únicamente sobre el modelo de lenguaje mediante QLoRA, dejando el codificador visual y el proyector en 8 bits sin modificar. Posteriormente, el modelo de lenguaje se cuantizó a 4 bits en formato Q4_K_M para su ejecución en llama.cpp. No se menciona el uso de RLHF ni DPO en la información proporcionada.

Los datos de entrenamiento incluyen conversaciones escritas para la persona de Greko en inglés y griego, 20.000 conversaciones de smol-smoltalk, aproximadamente 100 conversaciones griegas escritas a mano y 40 chats multiturno para responder según el contexto acumulado. También se añadieron 1.030 ejemplos de razonamiento paso a paso para el modo Think, generados por Qwen3-1.7B a partir de preguntas de los conjuntos de entrenamiento de GSM8K y ARC-Easy, conservando solo aquellos que alcanzaban la respuesta correcta. Como innovación destacable, el modelo integra un modo de razonamiento explícito y una búsqueda web opcional que cita fuentes, todo ello orientado a su despliegue offline en Android.

## Capacidades
- Generación de texto conversacional en inglés y griego.
- Comprensión de imágenes: descripción de fotografías, lectura de texto presente en ellas y respuesta a preguntas sobre su contenido.
- Modo Think: razonamiento paso a paso antes de emitir la respuesta final, orientado a matemáticas y lógica.
- Búsqueda web opcional mediante DuckDuckGo o Wikipedia, con listado de fuentes, activable solo cuando el dispositivo está en línea.
- Ejecución completamente offline en Android, sin enviar datos de texto a servicios externos salvo que se active la búsqueda web.
- No se menciona soporte de tool calling ni function calling.
- No se menciona soporte explícito de agentes o razonamiento multi-paso más allá del modo Think.
- Capacidades multilingües limitadas a inglés y griego; el propio autor indica que el griego aún es débil.
- No se mencionan capacidades de audio, vídeo ni otras modalidades distintas de imagen y texto.

## Casos de uso
- Asistente personal privado en Android: el modelo se ejecuta en el dispositivo sin conexión, por lo que resulta adecuado para usuarios que manejan información sensible y no quieren enviar sus consultas a la nube.
- Descripción de imágenes para accesibilidad: una persona con discapacidad visual puede hacer una foto y recibir una descripción hablada o escrita de su entorno, gracias a la capacidad image-text-to-text.
- Digitalización y lectura de documentos en movilidad: el modelo puede extraer y resumir el texto de una foto de un cartel, menú o etiqueta, útil en entornos sin conectividad.
- Apoyo educativo en lógica y matemáticas: el modo Think permite obtener razonamientos paso a paso para problemas escolares, aunque el autor advierte que el rendimiento en GSM8K es inferior al del modelo base.
- Atención al cliente o soporte técnico en griego e inglés: se puede integrar en prototipos de asistente conversacional para consultas frecuentes, siempre que se validen las respuestas por la debilidad del griego.
- Análisis de imágenes en campo: técnicos o inventaristas pueden fotografiar equipos o productos y formular preguntas sobre ellos sin depender de cobertura móvil.
- Búsqueda aumentada con fuentes: cuando hay conexión, el modo de búsqueda web permite responder preguntas de actualidad citando las fuentes consultadas, útil para verificación rápida.
- Pruebas de visión-lenguaje en PC: mediante llama.cpp y el binario llama-mtmd-cli, se puede evaluar el modelo en escritorio antes de desplegarlo en móviles.

## Benchmarks y rendimiento
Los únicos datos de benchmarks disponibles en la model card son los siguientes, comparando Greko 2 con Qwen3-VL-2B-Instruct:

| Benchmark | Qwen3-VL-2B-Instruct | Greko 2 |
|---|---|---|
| Preguntas reservadas "what's your name" que nombran a Greko | 4/5 | 5/5 |
| Preguntas reservadas "who made you" que nombran a George | 0/2 | 2/2 |
| GSM8K (100 preguntas de test) | 82% | 71% |
| ARC-Easy (200 preguntas de test) | 91% | 91% |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Android 13 o superior, arquitectura arm64 y al menos 4 GB de RAM.
- La descarga inicial del modelo y su codificador visual ocupa aproximadamente 1,6 GB; después no se necesita internet para el funcionamiento normal.
- La inferencia en el móvil se realiza sobre la CPU del dispositivo, y el autor indica que procesar una foto "tarda un rato" en el procesador del teléfono.
- En PC se puede ejecutar con llama.cpp mediante el comando `llama-mtmd-cli -m greko-2-Q4_K_M.gguf --mmproj mmproj-greko-2.gguf --image photo.jpg -p "What's in this photo?"`.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se especifica si cabe en GPU de consumo; no hay datos al respecto.
- Opciones de despliegue: llama.cpp y la aplicación Android propia. No se mencionan vLLM, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Greko 2 (beta) | 1.720.574.976 | no disponible | Texto e imagen | Apache 2.0 | GGUF y APK en HuggingFace |
| Qwen3-VL-2B-Instruct | 2B (aproximado, no detallado en la información) | no disponible | Texto e imagen | Apache 2.0 | Pesos originales en HuggingFace |
| Greko 1 beta (Qwen3-1.7B) | 1,7B (aproximado) | no disponible | Solo texto | No especificada en la información | GGUF en el mismo repositorio, para instalaciones antiguas |

No se dispone de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- El modelo está en fase beta y su griego es débil: a menudo responde en griego con expresiones extrañas o incorrectas.
- El rendimiento en matemáticas es inferior al del modelo base: GSM8K baja del 82% al 71%.
- Riesgo de alucinación, especialmente en griego y en tareas de razonamiento, por lo que el autor recomienda verificar cualquier dato importante.
- No se ha documentado soporte de tool calling, function calling ni agentes multi-paso.
- La longitud de contexto no está especificada, lo que dificulta planificar conversaciones muy largas.
- Solo soporta inglés y griego; no hay otros idiomas declarados.
- La aplicación Android requiere Android 13+, arm64 y al menos 4 GB de RAM, lo que excluye dispositivos antiguos o de gama baja.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-VL-2B-Instruct.
- El modo de búsqueda web envía la pregunta a DuckDuckGo o Wikipedia, rompiendo la privacidad total si se activa.
- No hay benchmarks publicados de capacidades de visión (descripción de imágenes, OCR, VQA) en la información disponible.
- El repositorio no tiene descargas ni "likes" en el momento de la consulta, por lo que carece de validación por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/geolazagr/greko
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset ARC (incluye ARC-Easy): https://huggingface.co/datasets/allenai/ai2_arc
