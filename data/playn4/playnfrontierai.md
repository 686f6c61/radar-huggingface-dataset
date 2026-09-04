# playn4/playnfrontierAI

## Resumen

playnfrontierAI no es un modelo de inteligencia artificial generativa en el sentido clasico, sino un `skeleton` de sistema operativo y memoria persistente para agentes que se ejecutan bajo el framework OMP. Lo desarrolla el usuario `playn4` y se publica bajo licencia MIT en Hugging Face, aunque su repositorio no contiene pesos de modelo, ni APIs, ni datos de negocio. Su objetivo es proporcionar una estructura protocolizada sobre la cual un agente pueda "despertar" y construir su propio flujo de trabajo: leer un `card.md` como ventana de estado, verificar hechos candidatos, capturar decisiones y cerrar la sesion con un unico comando. La propuesta central se resume en tres principios: los hechos son la unica verdad, la tarjeta es la ventana y el cierre es un solo comando. Es relevante ahora porque aborda el problema de la memoria a largo plazo y la verificacion de estado en agentes autonomos, un area critica para sistemas de agencia locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el README esta en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

playnfrontierAI no ha sido entrenado mediante procesos de machine learning. En su lugar, se presenta como un arbol de directorios y scripts de shell que definen un protocolo de operacion. La estructura incluye un nucleo llamado `core/` con subdirectorios para hechos verificados (`facts/`), decisiones arquitectonicas (`decisions/`), proyectos activos (`projects/`), sesiones diarias (`sessions/`), registro de aprendizajes (`learnings.md`), trabajo pendiente (`backlog.md`), bandeja de entrada (`inbox.md`), archivo (`archive/`) y herramientas de sistema (`tools/`). Estas herramientas incluyen `build.sh`, `check.sh`, `doctor.sh`, `close.sh`, `recall.sh` y `graph.sh`, que actuan como puertas de control.

Tambien se incluyen habilidades de operacion en `.omp/skills/`, entre las que destacan `omn-memory`, el ritual de memoria del proyecto, y `partnership`. Varias habilidades mas provienen del repositorio externo `obra/superpowers` (MIT), como `test-driven-development`, `verification-before-completion`, `systematic-debugging`, `receiving-code-review`, `requesting-code-review`, `writing-skills` y `dispatching-parallel-agents`. No hay datos de entrenamiento, ya que no existe un modelo subyacente; el contenido es protocolo y estructura.

## Capacidades

- Gestion de memoria persistente para agentes: mantiene hechos verificados con estado `live` y hechos `candidate` que deben validarse.
- Generacion automatica de la "tarjeta" de estado (`card.md`) a partir de los ficheros de hechos, decisiones y proyectos.
- Verificacion de salud mediante `check.sh` (esquema, obsolescencia, enlaces rotos) y `doctor.sh` (desviacion de realidad: rutas, proveedores y roles pineados).
- Cierre de sesion con un unico comando (`close.sh`) que ejecuta salud, puertas, reconstruccion de tarjeta, briefing y snapshot de git.
- Soporte de decisiones arquitectonicas (ADR) con estados `proposed`, `accepted` y `superseded`.
- Registro de aprendizajes en un log append-only, ordenado por fecha.
- Capacidad de integracion con un motor local de LLM via variable de entorno `OMN_ENGINE_URL`, aunque no se requiere motor para arrancar.
- Protocolo de "trash-principle": nunca se borra irreversiblemente, siempre se mueve a `archive/`.

## Casos de uso

- Arranque de un agente nuevo en un entorno desconocido: el agente lee `core/card.md`, verifica su propia maquina, promueve hechos candidatos a `live` y queda operativo en una sola sesion, tal como muestra el video de primer arranque.
- Gestion de memoria a largo plazo en proyectos de desarrollo: durante la sesion, el agente captura hechos y decisiones en los ficheros correspondientes; al cerrar, `close.sh` deja un snapshot de git con todo el estado consolidado.
- Auditoria y depuracion de sistemas de agentes: se ejecutan `check.sh` y `doctor.sh` para detectar desviaciones entre la estructura y la realidad (rutas inexistentes, proveedores no disponibles, roles mal pineados).
- Integracion de un motor local de backend: se define `OMN_ENGINE_URL=http://127.0.0.1:PORT/health` para que la puerta de salud del cierre valide el estado del motor antes de finalizar.
- Seguimiento de decisiones tecnicas a lo largo del tiempo: cada decision se registra como ADR en `core/decisions/`, con estados claros de propuesta, aceptacion y superacion, lo que permite auditar el historial de decisiones.
- Colaboracion entre multiples agentes despachados en paralelo: el protocolo define convenciones de `partnership` y habilidades de `dispatching-parallel-agents`, permitiendo coordinar sesiones sin perdida de contexto.
- Recuperacion de una sesion de trabajo interrumpida: al abrir `omp` en la carpeta, el agente vuelve a leer `card.md` y continua el trabajo desde el ultimo punto de cierre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este proyecto no es un modelo de aprendizaje automatico, por lo que no existen metricas como MMLU, HumanEval o GSM8K. El unico indicador de "rendimiento" es la correcta ejecucion de las puertas de verificacion (`check.sh` y `doctor.sh`) y la generacion de la tarjeta, pero no se proporcionan datos cuantitativos de latencia ni throughput.

## Requisitos de hardware

- No se requiere GPU ni VRAM para ejecutar el propio sistema de estructura.
- El arranque no necesita motor de inferencia; se puede iniciar con `omp` sin configuracion adicional.
- Si se conecta a un motor local de LLM, la hardware necesaria depende del motor elegido; se apunta mediante `OMN_ENGINE_URL` a una URL de salud.
- No se especifican requisitos de CPU, memoria ni almacenamiento minimos.
- Al ser un conjunto de scripts y ficheros de texto, es compatible con cualquier maquina que ejecute un shell en un entorno POSIX.
- Las opciones de despliegue son directamente la ejecucion local de los scripts (bash, git, OMP); no se usan vLLM, llama.cpp ni Ollama.

## Comparativa con modelos similares

No disponible. playnfrontierAI no es un modelo de lenguaje ni un sistema de inferencia, por lo que no puede compararse con modelos como Llama, Mistral o Qwen. En el ambito de frameworks de memoria para agentes, existen alternativas como MemGPT o Letta, pero no se ofrecen datos de comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- No incluye pesos de modelo ni logica de inferencia; no puede generar texto por si mismo.
- Depende de un framework de agente (OMP) y de las herramientas de shell; sin OMP, la estructura no tiene utilidad.
- El autor advierte de que las puertas (`check.sh`, `doctor.sh`) son la fuente de verdad y que la prosa del README podria desviarse del estado real.
- La tarjeta `card.md` se genera automaticamente y no debe editarse manualmente; hacerlo puede provocar obsolescencia (marcada como `⚠STALE`).
- El sistema requiere disciplina: el agente debe seguir el ritual de leer la tarjeta, capturar hechos durante la sesion y ejecutar `close.sh` al final; de lo contrario, la memoria puede derivar.
- Los hechos solo pasan a `live` tras verificacion; si el agente no ejecuta la verificacion, los hechos candidatos permanecen en un estado provisional.
- La licencia MIT permite uso comercial, pero no hay garantias de soporte ni de adecuacion a un fin concreto.
- No se especifican idiomas soportados; la documentacion y el contenido base estan en ingles, lo que puede limitar su uso en entornos multilingues.

## Enlaces

- Hugging Face: https://huggingface.co/playn4/playnfrontierAI
- Video del primer arranque: https://youtu.be/Qui5FqrLglc
- Repositorio de habilidades externas (obra/superpowers): https://github.com/obra/superpowers
- Perfil del autor en Hugging Face: https://huggingface.co/playn4
