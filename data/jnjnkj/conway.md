# jnjnkj/conway

## Resumen

Conway es un arnés (harness) de agente autónomo para control de ordenador, local-first y sin interfaz de chat, publicado por el usuario jnjnkj y distribuido como espejo del repositorio GitHub `jovial-liu/conway`. No se trata de un modelo de lenguaje: el repositorio de Hugging Face no contiene pesos, sino el código del bucle de agente que observa el escritorio mediante capturas de pantalla, consulta a un modelo visión-lenguaje (VLM) intercambiable para decidir una única acción siguiente, la ejecuta a través de un adaptador GUI multiplataforma y vuelve a observar. Su relevancia actual está en el creciente interés por agentes "computer-use" que operan entornos de escritorio reales sin depender de APIs propietarias.

La versión publicada es la v0.3, descrita por el autor como un MVP temprano con APIs públicas y manifiestos de modelos todavía sujetos a cambios. El bucle de control es explícitamente secuencial: observar, decidir, actuar y verificar, con estado persistido únicamente en ficheros (Markdown y JSONL), sin bases de datos SQL ni vectoriales. La selección del modelo es automática o configurable, e incluye perfiles locales servidos con llama.cpp y cualquier endpoint multimodal compatible con la API de OpenAI.

El componente diferenciador declarado es la gestión de coordenadas en pantallas HiDPI/Retina: el VLM devuelve coordenadas en píxeles de la captura y Conway las proyecta al espacio de coordenadas de entrada del sistema operativo antes de hacer clic o arrastrar. El proyecto es multiplataforma (macOS, Windows y Linux con X11/XWayland) y no incorpora ningún mecanismo de escalada de privilegios ni de evasión de controles de seguridad del sistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de pesos; es un harness de agente con bucle observe → decide → act → verify) |
| Parametros totales | no aplica al repositorio; los modelos VLM que integra van de 2B a 8B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible a nivel de repositorio; los perfiles locales apuntan a checkpoints GGUF |
| Idiomas soportados | no disponibles (el repositorio no declara idiomas; el README está en inglés y soporta pegado de texto Unicode) |
| Licencia | no disponible |
| Formato de pesos | no aplica (el repositorio no contiene pesos; los perfiles referencian GGUF servidos por llama.cpp y un endpoint externo `xlangai/OpenCUA-7B`) |
| Fecha de publicación | 2026-09-12 |
| Última actualización | 2026-09-12 |
| Descargas / likes en Hugging Face | 0 / 0 |
| Requisitos de ejecución | Python 3.11 o superior |
| Plataformas soportadas | macOS, Windows, Linux (X11/XWayland) |

## Arquitectura y entrenamiento

Conway no entrena ningún modelo y no publica datos de entrenamiento. Su arquitectura es la de un orquestador: una constitución en texto (`constitution.md`) alimenta el bucle autónomo, que mantiene contexto en ficheros rodantes y un diario JSONL, y que se divide en dos componentes sustituibles, el "VLM brain" y el "computer adapter". El primero puede ser un servidor local llama.cpp o un endpoint externo compatible con OpenAI; el segundo expone captura de pantalla, metadatos de ventana activa, ratón, teclado, desplazamiento, arrastre y pegado de texto Unicode. El propio autor resume el diseño con la frase "Conway is the harness. The VLM is replaceable."

Entre las innovaciones técnicas declaradas destacan: el mapeo HiDPI/Retina entre píxeles de captura y coordenadas de ratón del sistema; la validación de la salida del modelo y el acotado de acciones GUI antes de ejecutarse; la compactación de memoria dirigida por el propio VLM (que resume el estado durable en objetivos, hechos, trabajo inacabado y fallos recurrentes) con un mecanismo de reserva limitado en fichero; y un "mock brain" que permite probar la instalación y el bucle sin descargar ningún modelo. El estado se guarda en un directorio por usuario con `constitution.md`, `memory.md`, `state.json`, `llama-runtime.log`, `journal/AAAA-MM-DD.jsonl` y `screenshots/`.

Los perfiles de modelo incluidos en v0.3 son los siguientes (ninguno forma parte del repositorio Conway):

| Perfil | Modelo referenciado | Memoria efectiva mínima aproximada |
|---|---|---:|
| `tiny` | `mradermacher/Qwen3-VL-2B-Instruct-abliterated-GGUF` | 5 GB |
| `small` | `mradermacher/Qwen3-VL-4B-Instruct-abliterated-GGUF` | 8 GB |
| `standard` | `mradermacher/Huihui-Qwen3-VL-8B-Instruct-abliterated-GGUF` | 14 GB |
| `computer-use` | `xlangai/OpenCUA-7B` | servido externamente |

El autor advierte de que los checkpoints "abliterated" son artefactos comunitarios modificados y no versiones oficiales ajustadas en seguridad de Qwen, y que OpenCUA es un modelo especializado en computer-use independiente del harness.

## Capacidades

- Bucle autónomo continuo de observación, decisión, acción y verificación, sin caja de chat en el lazo de control.
- Percepción basada en capturas de pantalla como mecanismo universal, con metadatos de aplicación y ventana activa en la medida de lo posible en macOS (System Events), Windows (API Win32) y Linux con `xdotool`.
- Control de entrada completo: ratón, teclado, desplazamiento, arrastre y pegado de texto Unicode.
- Mapeo correcto de coordenadas en pantallas con escalado (Retina y escalado de Windows).
- Selección automática de perfil de modelo local según RAM, VRAM o memoria unificada detectada, incluido un respaldo de 2B para equipos con poca memoria.
- Integración con servidor local llama.cpp y con cualquier endpoint multimodal compatible con OpenAI.
- Memoria rodante en Markdown con compactación dirigida por el VLM y trayectorias JSONL conservadas para trabajo futuro de aprendizaje continuo.
- Validación de la salida del modelo y acotado de acciones GUI antes de su ejecución.
- Modo de observación únicamente (sin ejecutar acciones) y modo de ejecución explícito con `--execute`.
- Comando `conway status` para inspeccionar una sesión en curso o previa sin interfaz de chat.
- Modo `--mock` para probar el bucle sin descargar ningún modelo.
- Sin capacidades declaradas de audio, tool calling genérico ni razonamiento multilingüe propio; dependen del VLM que se enchufe.

## Casos de uso

- Automatización de tareas repetitivas de escritorio: el bucle observe → decide → act permite ejecutar secuencias de clics, escritura y arrastre sobre aplicaciones nativas sin API, útil para procesos internos que solo existen como GUI.
- Pruebas de regresión de interfaz de usuario: con el modo de observación y el diario JSONL, se puede registrar cada acción y su resultado para auditar flujos de UI en macOS, Windows y Linux.
- Piloto automático de procedimientos administrativos: rellenado de formularios en aplicaciones de escritorio con pegado de texto Unicode, aprovechando el mapeo de coordenadas para pantallas escaladas.
- Soporte remoto asistido por agente: el operador lanza Conway con `--execute` sobre una máquina y el agente reproduce pasos de diagnóstico guiados por la `constitution.md`.
- Investigación en agentes computer-use: integración de un VLM propio mediante `--endpoint` y `--model` para medir su capacidad de grounding sobre escritorio real, con registro estructurado de trayectorias.
- Entornos con restricciones de red o datos: al usar llama.cpp local y perfiles GGUF de 2B a 8B, todo el cómputo y el estado permanecen en la máquina, sin envío de capturas a servicios externos.
- Evaluación de memoria de largo plazo en agentes: la compactación de `memory.md` por el propio VLM permite experimentar con resúmenes de estado durable y fallos recurrentes.
- Integración en pipelines de automatización interna: el estado en ficheros JSONL y Markdown facilita el consumo posterior de las trazas por otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria efectiva mínima aproximada por perfil local: 5 GB para `tiny` (Qwen3-VL-2B), 8 GB para `small` (Qwen3-VL-4B) y 14 GB para `standard` (Qwen3-VL-8B). El perfil `computer-use` (OpenCUA-7B) se sirve externamente y no declara requisito en la documentación disponible.
- El comando `conway doctor` detecta RAM, VRAM o memoria unificada y selecciona el perfil correspondiente de forma automática.
- GPU recomendadas: no disponibles. La documentación no especifica modelos de GPU concretos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada explícitamente; el perfil `tiny` de 2B y 5 GB de memoria efectiva está pensado como respaldo para equipos de baja memoria, y los perfiles `small` y `standard` requieren 8 GB y 14 GB respectivamente, cantidades alcanzables en GPUs de consumo con suficiente VRAM, pero la documentación no lo afirma.
- Opciones de despliegue: servidor `llama-server` de llama.cpp para los perfiles locales, o cualquier servidor multimodal compatible con la API de OpenAI ya en ejecución (`--endpoint`, `--model`). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Software: Python 3.11 o superior; instalación mediante `pip install -e .` (y `pip install -e ".[dev]"` para desarrollo). Ejecución de pruebas con `pytest`; la integración continua cubre Ubuntu, Windows y macOS.
- Permisos: en macOS se requieren permisos de Accesibilidad y Grabación de pantalla; en Windows el proceso corre con los permisos del usuario que lo lanza; en Linux el camino más sencillo es X11/XWayland, con metadatos de ventana activa si `xdotool` está instalado.

## Comparativa con modelos similares

No se dispone de datos sobre otros arneses de agentes computer-use comparables en la información proporcionada, por lo que la comparación directa no está disponible. A continuación se comparan los checkpoints VLM que Conway referencia como "cerebro", con los únicos datos confirmados por sus nombres y por la documentación del harness:

| Modelo referenciado | Parámetros | Origen | Licencia | Formato | Uso en Conway |
|---|---|---|---|---|---|
| `mradermacher/Qwen3-VL-2B-Instruct-abliterated-GGUF` | 2B | comunidad (derivado de Qwen3-VL) | no disponible | GGUF | perfil `tiny`, 5 GB |
| `mradermacher/Qwen3-VL-4B-Instruct-abliterated-GGUF` | 4B | comunidad (derivado de Qwen3-VL) | no disponible | GGUF | perfil `small`, 8 GB |
| `mradermacher/Huihui-Qwen3-VL-8B-Instruct-abliterated-GGUF` | 8B | comunidad (derivado de Qwen3-VL) | no disponible | GGUF | perfil `standard`, 14 GB |
| `xlangai/OpenCUA-7B` | 7B | xlangai | no disponible | no disponible | perfil `computer-use`, servido externamente |

Contexto, rendimiento en benchmarks y disponibilidad de estos checkpoints: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Estado declarado por el autor: MVP temprano (v0.3); las APIs públicas y los manifiestos de modelos pueden cambiar sin aviso.
- El repositorio de Hugging Face no contiene pesos ni artefactos de modelo; es un espejo automático de la rama `main` del repositorio GitHub. Cualquier evaluación debe hacerse sobre el código, no sobre un modelo.
- Licencia no declarada en la información disponible: no se puede confirmar si el uso comercial está permitido. Los checkpoints referenciados tienen licencias propias que tampoco se detallan.
- Riesgo de alucinación: no evaluado en la documentación; el harness mitiga parcialmente con validación de la salida del modelo y acotado de acciones antes de ejecutarlas.
- Sesgos conocidos: no disponibles. Los checkpoints "abliterated" son artefactos comunitarios modificados, no versiones oficiales con ajuste de seguridad, lo que puede alterar su comportamiento en materia de rechazos y seguridad.
- Una vez usado `--execute`, no hay diálogo de confirmación antes de cada acción GUI. La única salvaguarda adicional mencionada es el failsafe de PyAutoGUI al llevar el ratón a la esquina de la pantalla.
- El modelo no implementa escalada de privilegios, bypass de UAC/TCC/sudo, recolección de credenciales, persistencia sigilosa ni evasión de controles de seguridad del sistema; el modelo de permisos del sistema operativo sigue siendo el límite exterior.
- Cobertura de plataformas desigual: en Wayland el comportamiento depende del compositor y de los permisos de la sesión; en Linux los metadatos de ventana activa requieren `xdotool`.
- Sin adaptadores nativos de árbol de accesibilidad en v0.3: la percepción depende fundamentalmente de capturas de pantalla, con metadatos estructurados solo cuando están disponibles.
- Manejo de múltiples monitores y backends nativos de captura de pantalla figuran como objetivos pendientes de ingeniería, no como funcionalidad resuelta.
- No se declaran idiomas soportados: la cobertura lingüística depende por completo del VLM enchufado.
- Las cifras de adopción del repositorio (0 descargas, 0 likes) y su fecha de creación deben tenerse en cuenta al valorar su madurez y soporte.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el proyecto: los enlaces obtenidos correspondían a YouTube y no guardan relación con Conway.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jnjnkj/conway
- Repositorio principal en GitHub: https://github.com/jovial-liu/conway
- Perfil VLM `tiny`: `mradermacher/Qwen3-VL-2B-Instruct-abliterated-GGUF` (en Hugging Face)
- Perfil VLM `small`: `mradermacher/Qwen3-VL-4B-Instruct-abliterated-GGUF` (en Hugging Face)
- Perfil VLM `standard`: `mradermacher/Huihui-Qwen3-VL-8B-Instruct-abliterated-GGUF` (en Hugging Face)
- Perfil VLM `computer-use`: `xlangai/OpenCUA-7B` (en Hugging Face)
- Documentación de llama.cpp (servidor `llama-server`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficial: no disponibles en la información proporcionada.
