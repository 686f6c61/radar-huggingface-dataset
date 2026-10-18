# Jinstudio/MOSS-Music-8B-Instruct

## Resumen

MOSS-Music-8B-Instruct es un modelo abierto de comprensión musical (audio-text-to-text) desarrollado por MOSI.AI, el equipo OpenMOSS y el Shanghai Innovation Institute. Forma parte de la familia MOSS-Music, construida sobre la misma base de audio que MOSS-Audio, pero sometida a un preentrenamiento continuado y a un ajuste supervisado específicos sobre música. El modelo no se limita a transcribir letras: razona conjuntamente sobre armonía, ritmo, timbre, instrumentación, estructura formal y contenido textual de la canción.

Arquitectónicamente es un modelo modular de tres piezas: un codificador de audio propio (MOSS-Audio-Encoder) que produce representaciones temporales continuas a 12,5 Hz, un adaptador de modalidad que proyecta esas representaciones al espacio de embeddings del LLM, y un modelo de lenguaje autorregresivo que genera la respuesta. Incorpora dos innovaciones destacables: inyección cruzada de características entre capas al estilo DeepStack (para preservar información de bajo nivel como transitorios y textura tímbrica) y marcadores temporales explícitos insertados entre tramas de audio.

El checkpoint publicado en este repositorio declara 9.052.463.488 parámetros en safetensors (pese al "8B" del nombre comercial) y un tamaño de repo de 18,1 GB. La variante Instruct está optimizada para seguir instrucciones musicales directamente, frente a la variante Thinking, orientada a razonamiento con cadena de pensamiento. Es relevante porque hay muy pocos modelos abiertos con licencia Apache 2.0 centrados específicamente en comprensión musical y con salida de marcas de tiempo, un requisito habitual en producción (karaoke, sincronización, catalogación).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modular: codificador de audio (MOSS-Audio-Encoder, 12,5 Hz) + adaptador de modalidad + LLM autorregresivo; inyección cruzada de capas tipo DeepStack y marcadores temporales |
| Parametros totales | 9.052.463.488 (según safetensors; el nombre comercial indica 8B) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

MOSS-Music hereda el diseño modular de MOSS-Audio. El audio en bruto se codifica con MOSS-Audio-Encoder, entrenado desde cero en lugar de reutilizar un frontend de audio comercial, con el objetivo de obtener representaciones acústicas más robustas, mejor alineación temporal y mayor extensibilidad a estilos musicales, canto y contenido no verbal. El encoder emite representaciones temporales continuas a 12,5 Hz, que un adaptador proyecta al espacio de embeddings del LLM y este consume para generar texto de forma autorregresiva.

Dos componentes técnicos son específicos de este modelo. El primero es un módulo de inyección cruzada entre capas inspirado en DeepStack: además de la salida de la última capa del encoder, se seleccionan características de capas intermedias, se proyectan de forma independiente y se inyectan en las primeras capas del LLM, preservando información multigranular (ritmo, timbre, transitorios, textura instrumental) que una única representación de alto nivel perdería. El segundo es una estrategia de inserción de marcadores temporales durante el preentrenamiento: se intercalan tokens de tiempo entre las representaciones de tramas de audio a intervalos fijos, de modo que el modelo aprende explícitamente "qué ocurre y cuándo" dentro de una secuencia unificada de texto y audio.

El modelo se entrena en dos fases declaradas: preentrenamiento continuado específico de música y ajuste supervisado (SFT). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Reconocimiento de voz cantada (lyrics ASR) con transcripción alineada temporalmente a nivel de frase y de palabra, robusto frente a pistas de acompañamiento.
- Generación de descripciones musicales en lenguaje natural (captioning) y etiquetado: estado de ánimo, género, instrumentación, estilo de producción y trayectoria emocional.
- Razonamiento sobre tonalidad (key), tempo, pulsos, downbeats y progresiones de acordes, incluyendo transcripción de acordes con marcas de tiempo.
- Análisis estructural: segmentación en intro, verso, estribillo, puente y outro, con razonamiento sobre repetición y contraste.
- Reconocimiento de instrumentos y de voces (solo o coro, género, registro).
- Preguntas y respuestas musicales abiertas y análisis de formato largo sobre una pista completa.
- Capacidad de seguir instrucciones directas (variante Instruct); la variante Thinking añade razonamiento con cadena de pensamiento para análisis musical.
- Entrada multimodal audio + texto y salida de solo texto; idiomas de trabajo inglés y chino.
- No se documentan en la información disponible soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Catalogación automática de catálogos musicales: procesar lotes de pistas y generar metadatos estructurados (género, mood, instrumentación, tempo, tonalidad) que alimenten un buscador o un sistema de recomendación, aprovechando el captioning y el etiquetado nativos.
- Generación de letras sincronizadas para karaoke o subtitulado: la salida ASR con timestamps a nivel de palabra y frase permite construir ficheros de sincronización sin alineamiento forzado posterior, incluso con acompañamiento instrumental denso.
- Herramientas para producción musical: extraer tonalidad, tempo, beats, downbeats y progresiones de acordes con marcas de tiempo para precargar un DAW o generar diagramas de acordes y partituras simplificadas.
- Análisis estructural para licencias y edición: detectar dónde están los estribillos y los cambios de sección para cortar versiones de trailer, editar para sincronización audiovisual o construir resúmenes de una canción.
- Educación musical e investigación musicológica a escala: responder preguntas abiertas sobre una pieza concreta (por qué modula, qué instrumentos entran en el segundo estribillo) y anotar corpus completos junto con el pipeline de datos publicado por el equipo.
- Búsqueda semántica musical: indexar descripciones generadas por el modelo para permitir consultas en lenguaje natural del tipo "temas lentos con cuerdas y voz femenina", combinando captioning y reconocimiento de instrumentos y voces.
- Verificación y control de versiones en sellos y editoriales: comparar estructura, instrumentación y letra entre tomas o remezclas para detectar duplicados o identificar ediciones concretas de una obra.
- Integración en aplicaciones Gradio o servicios SGLang: el repositorio documenta un ejemplo de despliegue con SGLang y una app Gradio, lo que facilita prototipos de análisis musical como servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación, pero su contenido no está presente en los datos proporcionados, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: los pesos safetensors suman aproximadamente 18,1 GB, de modo que se necesita alrededor de 20-24 GB solo para pesos, más el codificador de audio, el adaptador y la caché KV para audio de larga duración. En la práctica, 24 GB es el mínimo ajustado y 40-80 GB es el escenario cómodo.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB para serving concurrente; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para una sola petición con audio de duración moderada.
- No cabe en GPU consumer de 8-16 GB en precisión completa. No se documentan en la información disponible variantes cuantizadas (GGUF, AWQ, GPTQ), por lo que no se puede confirmar un despliegue viable en 12-16 GB.
- Opciones de despliegue documentadas: SGLang para serving (apartado SGLang Serving de la model card) y una aplicación Gradio de ejemplo; al ser un modelo `transformers` con `custom_code`, requiere `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La tasa de representación de audio de 12,5 Hz implica que la longitud de secuencia crece de forma lineal con la duración del audio, lo que condiciona el coste de la caché KV en pistas largas.

## Comparativa con modelos similares

Los datos de los competidores que aparecen a continuación proceden de conocimiento público general y no de la información proporcionada para este modelo; conviene verificarlos antes de citarlos. No hay cifras de benchmarks comparables disponibles.

| Modelo | Parametros | Enfoque | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-Music-8B-Instruct | 9,05B | Comprensión musical (ASR cantado, acordes, estructura, captioning) | No disponible | Apache 2.0 | Variante Instruct; encoder de audio propio y marcadores temporales |
| MOSS-Music-8B-Thinking | No disponible en esta ficha | Comprensión musical con cadena de pensamiento | No disponible | Apache 2.0 según la familia | Misma base, orientada a razonamiento; disponible en el proyecto OpenMOSS |
| Qwen2-Audio-7B-Instruct | ~8B (verificar) | Audio-texto general (voz, sonido, música) | No verificado aquí | Apache 2.0 (verificar) | Base generalista, no especializada en música ni en timestamps de letras |
| Qwen2.5-Omni-7B | ~7B (verificar) | Omnimodal (texto, audio, visión) | No verificado aquí | Verificar | Cubre más modalidades, pero sin evaluación pública específica en tareas musicales detalladas |

## Limitaciones y advertencias

- Solo cubre inglés y chino de forma declarada; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente, tanto en letras como en instrucciones.
- Riesgo de alucinación en tareas de cifrado musical: tonalidad, tempo y acordes son predicciones que conviene validar con herramientas deterministas (por ejemplo, un analizador de tempo/acordes) antes de usarlas en producción.
- La alineación temporal de letras puede degradarse con mezclas densas, voces corales, screaming o fragmentos instrumentales largos; no hay métricas publicadas de error de alineamiento.
- No se han publicado resultados de benchmarks ni una evaluación independiente, y el repositorio no registra descargas ni valoraciones, por lo que la madurez del checkpoint no está contrastada.
- El repositorio de HuggingFace está publicado por el usuario "Jinstudio", mientras que la model card atribuye el modelo a MOSI.AI, OpenMOSS y Shanghai Innovation Institute. Conviene verificar la procedencia y preferir, si existe, el repositorio oficial del equipo antes de desplegar en producción.
- Licencia Apache 2.0 sobre los pesos, pero ello no concede derechos sobre el audio de entrada ni sobre las letras transcritas: la reproducción de letras puede tener implicaciones de derechos de autor en función de la jurisdicción y del uso.
- El nombre comercial "8B" no coincide con los 9,05B parámetros reales; hay que dimensionar el hardware con la cifra de safetensors.
- No hay información sobre longitud de contexto, por lo que la duración máxima de audio procesable de una sola vez debe determinarse empíricamente.
- No se documentan modos de cuantización ni soporte en runtimes ligeros, lo que limita el despliegue en entornos con poca VRAM.
- La variante Instruct no incluye cadena de pensamiento; para análisis musical complejo puede ser preferible la variante Thinking.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/MOSS-Music-8B-Instruct
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-Music
- Pipeline de datos musicales: https://github.com/wx9songs/MOSS-Music-Data-Pipeline
- MOSS-Audio (base de audio): https://github.com/OpenMOSS/MOSS-Audio
- MOSI.AI: https://mosi.cn/#hero
- OpenMOSS: https://www.open-moss.com/
- Shanghai Innovation Institute: https://www.sii.edu.cn/
- Twitter/X del equipo: https://x.com/Open_MOSS
- Discord: https://discord.gg/Xf3aXddCjc
- Blog y paper en arXiv: anunciados como "coming soon", no disponibles en la información proporcionada.
