# abxn4r/Atlas-Qwen2.5-3B-Instruct-GGUF

## Resumen

Atlas-Qwen2.5-3B-Instruct-GGUF (también presentado por su autor como ATLAS-3B) es un ajuste fino del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario abxn4r en Hugging Face. Su objetivo es convertir un modelo de 3.000 millones de parámetros en un agente local especializado en tool calling determinista, pensado para ejecutarse en hardware de borde: teléfonos Android, Raspberry Pi, mini-PC y portátiles. El modelo no busca competir en conocimiento general, sino resolver dos problemas concretos de los SLM cuando actúan como agentes: la alucinación en la llamada a herramientas y el derroche de contexto en razonamientos poco estructurados.

La propuesta técnica consiste en imponer un patrón fijo de "Thought-then-Execution": cada respuesta del agente se serializa como un objeto JSON con las claves `thought`, `tool` y `arguments`. El ajuste se realizó con QLoRA sobre 10.000 turnos sintéticos del dataset `abxn4r/atlas-edge-tool-calling-10k`, y se distribuye únicamente en formato GGUF cuantizado a Q4_K_M, con una huella de memoria declarada de 1,92 GB. El modelo cubre 19 herramientas orientadas a teleoperación de PC, control multimedia, memoria persistente en SQLite, percepción mediante cámara y diagnóstico de red.

Es relevante ahora porque la inferencia local en dispositivos de consumo se ha convertido en una alternativa viable para agentes de automatización con coste operativo cero y privacidad total. Atlas se posiciona explícitamente contra los modelos generalistas de 3B, que según el autor fallan al emitir JSON válido o al respetar los argumentos requeridos por cada herramienta. La licencia Apache 2.0 y la disponibilidad en llama.cpp y Ollama facilitan su integración en productos comerciales sin fricción legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); ajuste fino QLoRA |
| Parámetros totales | 3.000 millones (aproximado, según el modelo base Qwen2.5-3B-Instruct) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens en la configuración de ejemplo con `llama-server`; 2.048 en el ejemplo de Android; contexto nativo del modelo base no especificado en la información disponible |
| Tipos de cuantización | Q4_K_M (única cuantización publicada según la model card) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, y se ajusta mediante QLoRA, es decir, cuantización del modelo base a 4 bits con adaptadores de bajo rango entrenables. No se documenta en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de los 10.000 turnos sintéticos de interacción del conjunto `abxn4r/atlas-edge-tool-calling-10k`. Tampoco se especifica si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

La innovación técnica destacable es el formato de salida forzado: el modelo aprende a emitir siempre un objeto JSON con razonamiento interno (`thought`), nombre de herramienta (`tool`) y argumentos (`arguments`). El autor afirma que este patrón garantiza salida JSON determinista al 100 %, aunque no se aportan métricas reproducibles de validación sintáctica ni de tasa de acierto en la selección de herramienta. Las herramientas cubiertas incluyen 19 acciones agrupadas en teleoperación de PC (Wake-on-LAN, suspensión ACPI S3, control de ventanas, matar procesos, captura de pantalla), multimedia (Spotify), privacidad de hardware (silenciar micrófono), sincronización de portapapeles entre dispositivos, captura de cámara para OCR, memoria persistente en SQLite, diagnóstico de red y delegación a la nube.

## Capacidades

- Generación de llamadas a herramientas en JSON estructurado con el esquema `thought` / `tool` / `arguments`.
- Selección entre 19 herramientas predefinidas de sistema, red, hardware y actuación física.
- Teleoperación de PC: encendido por Wake-on-LAN, suspensión, control de ventanas, terminación de procesos y captura de pantalla.
- Control de reproducción multimedia mediante la herramienta `spotify_dj`.
- Gestión de privacidad de hardware: silenciar y reactivar el micrófono del PC.
- Sincronización de portapapeles entre móvil y PC (`clipboard_teleport`), incluyendo texto obtenido por OCR.
- Percepción del mundo físico mediante `snap_camera` para OCR o verificación visual.
- Memoria persistente en SQLite con operaciones de guardado, consulta y borrado de hechos semánticos, configuraciones y rutinas.
- Diagnóstico de red y filtrado de cortafuegos (`check_status`, `firewall_filter`).
- Escalado a la nube mediante `delegate_to_cloud` y extensión mediante `call_custom_plugin`.
- Capacidad de razonamiento multi-paso encadenando varias llamadas a herramientas a través del campo `thought`.
- Generación de texto general heredada del modelo base Qwen2.5-3B-Instruct, aunque no es el foco del ajuste.
- No se documentan capacidades de visión nativa, audio ni modo de pensamiento extendido más allá del campo `thought` del JSON.

## Casos de uso

- Automatización doméstica con Raspberry Pi: el modelo se ejecuta en un Pi 5 con 8 GB y una velocidad declarada de 7,8 tok/s de generación, suficiente para encender el PC por Wake-on-LAN, silenciar el micrófono o lanzar una rutina de Spotify desde un asistente de voz local sin depender de la nube.
- Asistente de voz en Android: integrado en Termux con `llama-server` y 2.048 tokens de contexto, procesa un prompt de voz de 100 tokens y ejecuta la herramienta en menos de 450 ms según el autor, lo que permite conversaciones de baja latencia en un Snapdragon 855+.
- Teleoperación de escritorio desde el móvil: el modelo interpreta órdenes como "captura la pantalla y pásame el texto al portapapeles" y encadena `capture_screen` con `clipboard_teleport`, útil para soporte remoto o accesibilidad.
- Agente de memoria personal: las herramientas `save_memory`, `query_memory` y `delete_memory` sobre SQLite permiten construir un asistente que recuerda configuraciones, rutinas y hechos del usuario entre sesiones, todo en local y sin filtrado de datos a terceros.
- Automatización de flujos con escalado a la nube: cuando la tarea excede las capacidades del SLM, `delegate_to_cloud` permite derivar la petición a un modelo mayor, usando Atlas como enrutador barato y determinista en el borde.
- Integración en pipelines de CI/CD o scripts de operaciones: al exponer una API compatible con OpenAI mediante `llama-server`, puede actuar como planificador de acciones que decide qué plugin o comando ejecutar, con salida JSON validable antes de la ejecución.
- Kioscos o dispositivos IoT con restricciones de memoria: con 1,92 GB de huella en Q4_K_M, cabe en placas de 4 GB de RAM y permite control de cámara, diagnóstico de red y filtrado de cortafuegos sin conexión a internet.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar de razonamiento o código (MMLU, HumanEval, GSM8K). Los únicos datos numéricos disponibles son métricas de inferencia por plataforma:

| Plataforma | CPU / acelerador | Huella de RAM | Velocidad de evaluación de prompt | Velocidad de generación |
|---|---|---|---|---|
| Android (Realme X3) | Snapdragon 855+ (4x Kryo 485) | 1,92 GB | 37,2 tok/s | 9,6 tok/s |
| Raspberry Pi 5 (8 GB) | Broadcom BCM2712 (4x Cortex-A76) | 1,95 GB | 28,4 tok/s | 7,8 tok/s |
| PC de escritorio (x86) | AMD Ryzen 5 / Intel Core i5 (solo CPU) | 2,10 GB | 145,0 tok/s | 38,5 tok/s |
| Portátil con GPU | NVIDIA RTX 3060 / 4060 | 2,30 GB | 920,0 tok/s | 110,0 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, tasa de acierto en tool calling) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,92 GB en Q4_K_M según el autor; 2,10 GB en PC x86 y 2,30 GB con GPU.
- GPU recomendadas: NVIDIA RTX 3060 o RTX 4060 para el escenario de mayor rendimiento declarado (110 tok/s de generación); no se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: sí, con menos de 3 GB de VRAM en Q4_K_M, por lo que funciona en cualquier GPU con 4 GB o más.
- Cabe en hardware de borde: sí, en Raspberry Pi 5 de 8 GB y en teléfonos Android de gama media-alta con Snapdragon 855+ o superior.
- Opciones de despliegue: Ollama (`ollama run hf.co/abxn4r/Atlas-Qwen2.5-3B-Instruct-GGUF`), `llama.cpp` / `llama-server` con API compatible con OpenAI, `llama-cpp-python`, y compilación nativa en Termux para Android.
- Latencia y throughput: 9,6 tok/s de generación en Snapdragon 855+, 7,8 tok/s en Raspberry Pi 5, 38,5 tok/s en CPU x86 de escritorio y 110 tok/s en RTX 3060/4060. El autor declara menos de 450 ms para procesar un prompt de voz de 100 tokens y ejecutar la herramienta en un Snapdragon 855+.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Atlas-Qwen2.5-3B-Instruct-GGUF | 3B | 4.096 en configuración de ejemplo | Tool calling determinista para borde | Apache 2.0 | GGUF Q4_K_M |
| Qwen2.5-3B-Instruct (base) | 3B | No disponible en la información proporcionada | Instrucciones generales y tool calling genérico | Apache 2.0 | Safetensors, GGUF |
| Llama 3.2 3B Instruct | 3B | No disponible en la información proporcionada | Instrucciones generales, multilingüe | Llama 3.2 Community License | GGUF, safetensors |
| Phi-3.5-mini | 3,8B | No disponible en la información proporcionada | Razonamiento y código en dispositivos | MIT | GGUF, safetensors |

La comparación cuantitativa de rendimiento no está disponible: Atlas no publica métricas de calidad frente a estos modelos, y las alternativas no se han evaluado en la información proporcionada con el mismo conjunto de herramientas. La diferencia principal de Atlas es la especialización en un esquema JSON fijo y un conjunto cerrado de 19 herramientas, frente al carácter generalista de los otros tres.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a un conjunto cerrado de 19 herramientas; fuera de ese esquema, el rendimiento puede degradarse respecto al modelo base.
- Idioma: la model card declara únicamente inglés (`en`); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque el autor afirma salida JSON determinista al 100 %, no se aportan métricas reproducibles de validación sintáctica ni de precisión en la selección de herramienta; los argumentos pueden ser plausibles pero incorrectos.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación del ajuste; hereda los sesgos del modelo base Qwen2.5-3B-Instruct y del dataset sintético.
- Contexto limitado: los ejemplos de despliegue usan 4.096 tokens en escritorio y 2.048 en Android, lo que restringe conversaciones multi-turno largas y cadenas de herramientas extensas.
- Datos de entrenamiento sintéticos: los 10.000 turnos son generados, lo que puede introducir un sesgo de distribución hacia los patrones exactos del dataset y reducir la generalización a herramientas o formatos no vistos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct tiene sus propios términos que conviene verificar antes de un despliegue en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad; conviene tratarlo como experimental.
- Dependencia de herramientas externas: las acciones de teleoperación, Spotify, cámara o SQLite requieren implementar el ejecutor correspondiente; el modelo solo emite la llamada, no la ejecuta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abxn4r/Atlas-Qwen2.5-3B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/abxn4r/atlas-edge-tool-calling-10k
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
