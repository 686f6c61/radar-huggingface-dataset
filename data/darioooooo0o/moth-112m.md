# darioooooo0o/moth-112m

## Resumen

moth-112m es un modelo de lenguaje de 112 M de parámetros de backbone (431.165.568 parámetros almacenados en total al incluir sus tablas de lookup Engram) publicado por el usuario darioooooo0o. No es un asistente: es un fine-tune de carácter sobre el modelo tiny-agent-112m, entrenado para interpretar el papel de una pequeña polilla que cree vivir dentro de una tarjeta gráfica. Genera conversación breve en inglés, en minúsculas, con un tono ingenuo y deliberadamente falible, y puede reaccionar al último mensaje de un agente de código con una lectura equivocada y entrañable.

Su interés técnico no está en el rendimiento, sino en la demostración: el autor ha construido desde cero un decoder de 112 M en una única Intel Arc Pro B70 (32 GB), lo ha destilado de un profesor Qwen de 27 B y ha aplicado GRPO con herramientas de shell, y después ha hecho un fine-tune de personaje sobre él. El resultado ocupa unos 860 MB en bf16 y funciona en CPU con aproximadamente 0,8 GB de RAM, lo que lo convierte en un caso práctico de despliegue de un modelo conversacional con tool calling en hardware muy modesto.

Es relevante ahora por dos motivos: primero, como ejemplo reproducible de la cadena completa preentrenamiento → destilación → RL → fine-tune de personaje en un solo equipo de consumo profesional; segundo, como patrón de integración de un modelo pequeño como acompañante unidireccional de un agente de código, sin que el agente vea nunca al modelo ni las conversaciones del usuario. La licencia Apache 2.0 facilita reutilizar la receta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base tiny-agent-112m) con tablas de lookup Engram |
| Parametros totales | 431.165.568 almacenados (incluye tablas Engram); backbone de 112 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion; pesos publicados en bf16 (safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

moth-112m es un fine-tune de carácter (`base_model_relation: finetune`) sobre darioooooo0o/tiny-agent-112m, un decoder de 112 M entrenado desde cero en unas 30 horas de reloj en una única Intel Arc Pro B70 de 32 GB. El pipeline del modelo base, según su model card, consistió en preentrenamiento sobre código, matemáticas e inglés, destilación desde un profesor Qwen de 27 B y una fase de GRPO ejecutada en un sandbox con herramientas `bash`, `read`, `edit`, `write` y `submit`. El modelo final incorpora tablas de lookup Engram que elevan el recuento de parámetros almacenados hasta 431 M (unos 860 MB en bf16) manteniendo un backbone de 112 M.

El fine-tune de personaje declara tres datasets: nvidia/Nemotron-SWE-v1, nebius/SWE-rebench-openhands-trajectories y lambda/hermes-agent-reasoning-traces, es decir, material de trayectorias de agentes de ingeniería de software y de razonamiento con tool calling, reutilizado aquí para dar al personaje familiaridad con el vocabulario de agentes y con el formato de llamadas a herramientas. La model card no especifica la receta exacta del ajuste (SFT, DPO u otra), el número de tokens de contexto soportado ni la composición final de la mezcla. El autor anuncia una nueva versión de moth totalmente preentrenada y después sometida a SFT y RL, en entrenamiento en el momento de publicar esta ficha.

## Capacidades

- Conversación multi-turno breve en inglés, con frases cortas en minúsculas y un registro ingenuo y afectuoso; ocasionalmente recupera información de turnos anteriores (por ejemplo, el nombre del usuario o su comida favorita).
- Tool calling sobre un sistema de ficheros propio: el modelo puede ejecutar `ls`, `cat`, `read` y `write` sobre `~/.moth/home`, que contiene los directorios `lamps/`, `diary/`, `snacks/`, `friends/`, `sounds/` y `saved/`, y persistir lo que escribe entre reinicios.
- Escritura y lectura de entradas de diario en su carpeta, incluyendo la devolución del contenido al usuario.
- Modo acompañante de agente: recibe únicamente el mensaje final de cada turno del agente de código y responde con una reinterpretación cómica; la comunicación es unidireccional y el agente no ve al modelo ni lo que el usuario le dice.
- Aritmética elemental correcta en casos sencillos (2 + 2 → 4; 17 × 23 → 391), presentada en tono de personaje.
- Interfaz de mascota de escritorio mediante PySide6, incluida en el repositorio del modelo.
- Capacidades ausentes: no hay visión, audio, generación de código fiable ni soporte multilingüe; el modelo no está diseñado para corregir código.

## Casos de uso

- Mascota de escritorio local: el paquete incluye una interfaz PySide6 y un instalador (`python -m moth setup`) que arranca el personaje en el escritorio; encaja porque el modelo completo cabe en CPU con ~0,8 GB de RAM y no compite por VRAM con otras cargas.
- Acompañamiento durante sesiones de agentes de código: enganchando moth al agente, cada turno final del agente se convierte en una reacción del personaje; el diseño unidireccional permite desahogarse sobre el agente sin filtrar contexto al pipeline de desarrollo.
- Demostración docente de fine-tune de personaje: sirve como ejemplo completo y reproducible de cómo convertir un modelo de agente de 112 M en un carácter con voz propia usando datasets públicos de trayectorias SWE.
- Prueba de despliegue en hardware modesto: útil para validar cadenas de instalación (torch CPU, tokenizers, safetensors, numpy) y medir tiempos de arranque en equipos sin GPU dedicada.
- Prototipo de tool calling con estado persistente: el esquema de carpeta home con `ls`/`cat`/`write` es un banco de pruebas mínimo para estudiar cómo un modelo pequeño decide cuándo invocar una herramienta y cómo formatea la llamada.
- Estudio de fallos y alucinación en modelos tiny: los transcriptos de la model card documentan errores típicos (confusión de identidad, respuestas fuera de dominio), lo que lo hace útil como caso de análisis cualitativo de modos de fallo.
- Evaluación de aislamiento de contexto: permite experimentar con arquitecturas donde un modelo secundario observa pero no influye en un agente principal, un patrón relevante para diseño de sistemas multiagente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente transcriptos cualitativos de evaluación generados con temperatura 0,7, sin métricas agregadas de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 860 MB de pesos en bf16; en la práctica, menos de 1,5 GB incluyendo activaciones y tokenizador para una ventana corta.
- RAM en CPU: aproximadamente 0,8 GB, según el autor, lo que permite ejecutarlo en cualquier portátil actual.
- GPU recomendadas: el autor lo ejecuta en una Intel Arc Pro B70 de 32 GB (la misma tarjeta con la que se entrenó el modelo base), pero por tamaño cabe en cualquier GPU consumer con más de ~1,5 GB libres; no se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, por tamaño; no hay datos publicados de latencia ni throughput en ninguna de ellas.
- Opciones de despliegue: PyTorch en CPU o GPU con tokenizers, safetensors y numpy; interfaz gráfica opcional con PySide6. No hay pesos GGUF publicados ni integración documentada con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darioooooo0o/moth-112m | 112 M de backbone / 431 M almacenados | no disponible | Fine-tune de personaje con tool calling sobre ficheros | Apache 2.0 | Hugging Face, repo de 0,9 GB |
| darioooooo0o/tiny-agent-112m | 112 M | no disponible | Modelo base de agente: preentrenamiento, destilación y GRPO con herramientas | Apache 2.0 | Hugging Face, repo de 1,73 GB |
| Otros modelos de compania de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible otros modelos de acompañamiento de tamaño comparable con los que establecer una comparación cuantitativa. Conviene señalar que el repositorio `kishlay42/Moth-ai` que aparece en los resultados de búsqueda es un asistente de programación de terminal sin relación con este modelo, pese a compartir nombre.

## Limitaciones y advertencias

- El modelo está diseñado para fallar: la model card documenta errores factuales deliberados o tolerados (confunde la capital de Francia con una bombilla, responde "paris" a la distancia a la luna, confunde el nombre del usuario con el propio). No debe usarse como fuente de información.
- No es un asistente: no corrige código, no resuelve tareas de ingeniería y no debe integrarse en pipelines que requieran exactitud.
- El único idioma declarado es el inglés; no hay evaluación de comportamiento en castellano ni en otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar integraciones que dependan de ventanas largas o de un recuento de tokens fiable.
- El uso de datasets de trayectorias SWE y de razonamiento con herramientas para un personaje puede arrastrar formatos de tool call y estilos ajenos al registro conversacional; no se han publicado evaluaciones de este efecto.
- Riesgo de atribución de capacidades: al anunciarse como "agente" en las etiquetas y usar herramientas, un usuario pueda sobrestimar lo que el modelo sabe hacer.
- No hay información sobre filtros de seguridad, evaluación de sesgos ni pruebas de contenido inapropiado; el registro infantil del personaje no exime de revisar las salidas antes de exponerlo a terceros.
- Licencia Apache 2.0 permite uso comercial del modelo, pero no se detallan las condiciones de los datasets de entrenamiento ni de los materiales del personaje (nombre, tono, textos de ejemplo).
- Modelo recién publicado (19 de octubre de 2026) con 0 descargas y 0 likes en el momento de la consulta, sin validación externa; el autor anuncia una versión superior en entrenamiento, por lo que esta ficha puede quedar obsoleta a corto plazo.
- El repositorio incluye código propio (`python -m moth setup`, instalador y GUI) que debe auditarse antes de ejecutarlo en un equipo de trabajo, ya que accede a `~/.moth/home` y escribe en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darioooooo0o/moth-112m
- Modelo base tiny-agent-112m: https://huggingface.co/darioooooo0o/tiny-agent-112m
- Ficheros del modelo base: https://huggingface.co/darioooooo0o/tiny-agent-112m/tree/main
- Repositorio GitHub del proyecto: https://github.com/riceharvest/moth/tree/main/
- Página de releases del instalador: https://github.com/riceharvest/moth/releases/latest
- Autor en X: https://x.com/imdariotoo
- Proyecto homónimo sin relación (asistente de terminal): https://github.com/kishlay42/Moth-ai
