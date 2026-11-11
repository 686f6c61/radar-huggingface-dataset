# Jackjjack1/bench-tunnel

## Resumen

`Jackjjack1/bench-tunnel` no es un modelo de IA, sino un repositorio de Hugging Face que contiene un script de aprovisionamiento (`bench-tunnel.sh`) para configurar un Mac como nodo de trabajo remoto accesible por SSH a través de Tailscale. El script automatiza la instalación de Xcode Command Line Tools, Homebrew, Tailscale, el servicio de Remote Login, la generación de un par de claves ed25519, tmux y una estructura de directorios (`~/bench/{in,done,out,logs,src}`) pensada para ejecutar trabajos en cola.

El propósito declarado es habilitar flujos de trabajo dirigidos por agentes sobre una máquina macOS: el agente deposita scripts `*.sh` en `~/bench/in/` y recoge los resultados en `~/bench/out/`, con un componente llamado "courier" (`~/bench/courier.sh`) que gestiona la cola. Está etiquetado como "Built with ML Intern", una herramienta de Hugging Face para asistentes de ML.

Dado que no contiene pesos, arquitectura ni datos de entrenamiento, esta ficha documenta el artefacto tal como existe: un script de automatización de infraestructura, no un modelo. Los campos propios de un modelo (parámetros, contexto, benchmarks) no son aplicables y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un script de aprovisionamiento en Bash) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el script y su documentación están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un script `.sh`, no pesos) |

## Arquitectura y entrenamiento

No aplica: el artefacto es un script de shell (`bench-tunnel.sh`) que orquesta herramientas del sistema en macOS. La secuencia documentada es: instalación de Xcode Command Line Tools, Homebrew, Tailscale (vía cask), activación de Remote Login mediante `systemsetup -setremotelogin on` junto con la etiqueta launchd de sshd para macOS 15+ (con fallback a la etiqueta de macOS 14 y anteriores), generación de un par de claves ed25519 en `~/.ssh/id_ed25519` con la clave pública en `authorized_keys`, instalación de tmux y creación de `~/bench/{in,done,out,logs,src}`, y finalmente `tailscale up` con impresión de la IP, el usuario y la línea exacta a pegar de vuelta en el chat.

No hay datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia que documentar. La única "innovación" operativa es el patrón de cola de trabajos basado en directorios y el componente courier, que permite a un agente externo enviar y recoger tareas sin intervención manual.

## Capacidades

- Aprovisionamiento automatizado de un Mac como nodo remoto: instala y configura las dependencias necesarias en un solo comando.
- Activación de acceso SSH remoto, incluyendo el manejo de la etiqueta launchd específica de macOS 15+ con fallback para versiones anteriores.
- Configuración de red privada mediante Tailscale, con salida de la IP asignada y del usuario para facilitar la conexión.
- Generación de claves SSH ed25519 y registro de la clave pública en `authorized_keys`.
- Creación de una estructura de cola de trabajos por directorios (`in`, `done`, `out`, `logs`, `src`) con un courier para procesar scripts.
- Ejecución de trabajos en segundo plano mediante tmux, lo que permite sesiones persistentes.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes en el sentido de un modelo de lenguaje.

## Casos de uso

- Configuración de un Mac como runner remoto para agentes: el script deja la máquina lista para recibir trabajos por SSH a través de Tailscale, lo que permite a un agente externo ejecutar tareas sin acceso físico.
- Laboratorio doméstico de automatización: un desarrollador puede convertir un Mac mini o un portátil en un nodo de ejecución de scripts con una sola orden, sin configurar manualmente SSH, claves y red privada.
- Cola de tareas asíncronas: el patrón `~/bench/in/` y `~/bench/out/` permite depositar scripts y recoger resultados, útil para procesamiento por lotes o tareas de larga duración supervisadas por un agente.
- Entornos de CI/CD ligeros sobre hardware Apple: permite ejecutar scripts de compilación o pruebas en macOS real, algo relevante para proyectos que necesitan Xcode o herramientas nativas de Apple.
- Acceso remoto seguro entre máquinas: Tailscale más claves ed25519 configuradas automáticamente reduce la superficie de error frente a una configuración manual de SSH expuesto a internet.
- Reproducibilidad de entornos: al ser un script idempotente en su mayor parte, facilita reconstruir la misma configuración en varias máquinas para pruebas o desarrollo en equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware: un Mac con macOS (el script contempla macOS 15+ y versiones 14 o anteriores); no se especifican requisitos mínimos de CPU, RAM o disco.
- VRAM: no aplica, al no ejecutar un modelo de IA.
- GPU recomendadas: no aplica.
- Cabe en consumer GPU: no aplica.
- Opciones de despliegue: ejecución directa mediante `bash <(curl -fsSL https://huggingface.co/Jackjjack1/bench-tunnel/resolve/main/bench-tunnel.sh)`; requiere conexión a internet para descargar Homebrew, Tailscale y dependencias.
- Latencia y throughput: no disponibles; dependen del hardware y de la red Tailscale.

## Comparativa con modelos similares

No disponible. No se identifican alternativas comparables en la información proporcionada, ya que el artefacto es un script de aprovisionamiento y no un modelo. Herramientas conceptualmente relacionadas serían gestores de configuración como Ansible o scripts de bootstrap de dotfiles, pero no se dispone de datos para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede usarse para tareas de inferencia.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Ejecución de código remoto: el comando recomendado descarga y ejecuta un script directamente desde Hugging Face (`curl | bash`), lo que implica confiar en el contenido del repositorio y en su integridad; es recomendable revisar el script antes de ejecutarlo.
- Modifica la configuración del sistema: activa Remote Login, instala software vía Homebrew y añade claves SSH, cambios que afectan a la seguridad de la máquina.
- Dependencia de Tailscale: el flujo asume una cuenta y red Tailscale operativas; sin ellas, el paso de conexión no funcionará.
- Especificidad de plataforma: diseñado para macOS; no es portable a Linux ni Windows sin adaptación.
- Mantenimiento incierto: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-10), sin señales de mantenimiento ni comunidad.
- Sin documentación sobre manejo de errores, idempotencia o reversión de cambios; un fallo a mitad de ejecución puede dejar el sistema en un estado parcial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jackjjack1/bench-tunnel
- Script de aprovisionamiento: https://huggingface.co/Jackjjack1/bench-tunnel/resolve/main/bench-tunnel.sh
- Hugging Face ML Intern (herramienta citada en la model card): https://hf.co/chat?mode=ml-intern
- Tailscale: https://tailscale.com
- Homebrew: https://brew.sh
