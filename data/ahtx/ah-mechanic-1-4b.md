# ahtx/AH-Mechanic-1-4B

## Resumen

AH-Mechanic-1-4B es un ajuste fino (finetune) del modelo Qwen3.5-4B desarrollado por el usuario ahtx, especializado en administración de sistemas Linux. No es un modelo de propósito general, sino un agente entrenado para operar sobre una máquina en vivo: ejecuta un comando bash cada vez, lee la salida y decide el siguiente paso. También puede responder a una petición con un único comando de shell. Resuelve un problema concreto: automatizar tareas de sysadmin (diagnóstico de disco lleno, reparación de servicios que no arrancan, cron jobs rotos, restauración segura de ficheros, lectura de logs) con un modelo lo bastante pequeño para ejecutarse en hardware de consumo.

El modelo parte de Qwen3.5-4B y cuenta con 4.659.865.088 parámetros totales según los pesos en safetensors, con un repositorio de 16,8 GB que incluye cuantizaciones GGUF. La model card no detalla la longitud de contexto ni la composición del dataset de entrenamiento. Su relevancia actual radica en que demuestra que un modelo de ~4B, cuantizado a Q8_0 (4,6 GB) o Q4_K_M (2,8 GB), puede actuar como agente de administración de sistemas en una sola GPU de consumo o incluso en CPU, con licencia Apache 2.0.

La model card reporta evaluaciones cualitativas en tareas de sandbox en vivo (unidades systemd, identificación de procesos por puerto, permisos de directorios) y una demo grabada con opencode 1.19.5, llama-server y una RTX 3090 sobre un escenario de nginx con tres fallos encadenados. No se han publicado resultados numéricos de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles de atención no disponibles) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (4,6 GB), GGUF Q4_K_M (2,8 GB); pesos safetensors en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer del modelo base. La información proporcionada no detalla la arquitectura interna de Qwen3.5-4B (tipo de atención, número de capas, dimensiones ocultas) ni el proceso de entrenamiento del finetune: no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se documenta ninguna innovación técnica específica del ajuste (decodificación especulativa, atención lineal, etc.).

Lo que sí se describe es el comportamiento entrenado: el modelo opera en un bucle de agente de un solo comando por paso, inspecciona la máquina antes de modificar nada, lista el impacto de acciones destructivas antes de ejecutarlas, consulta `--help` o páginas man cuando duda de una opción, lee los errores y corrige la causa, y verifica el resultado con un resumen final. Los tags del repositorio (linux, sysadmin, agent, tool-calling, bash) confirman el dominio de especialización. La model card menciona que los tests held-out no incluyen tareas Docker ni apenas gestión de paquetes, lo que sugiere que el entrenamiento se centró en operaciones de shell, systemd, red, permisos, cron y logs.

## Capacidades

- Generación de comandos bash individuales a partir de una petición en lenguaje natural.
- Ejecución de agentes multi-paso: un comando por turno, lectura de la salida y decisión del siguiente paso.
- Tool calling / function calling en el contexto de un agente de shell (invocación de herramientas de terminal).
- Diagnóstico y reparación de servicios systemd, incluyendo escritura y verificación de unidades con `systemd-analyze verify`.
- Gestión de red: identificación de procesos por puerto con `ss`, análisis de logs de acceso nginx para localizar IPs con errores 5xx.
- Gestión de permisos y propietarios de ficheros y directorios (`chown`, `chmod`).
- Diagnóstico de espacio en disco y localización de qué consume el almacenamiento.
- Reparación de cron jobs y restauración segura de ficheros desde backups, con copia previa del estado actual.
- Lectura y análisis de logs del sistema.
- Comportamiento de seguridad operativa: inspección previa, listado de impacto antes de acciones destructivas, consulta de documentación cuando hay incertidumbre.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Atención de incidencias de disco lleno: ante una petición como "la partición /var está al 98%, encuentra qué ocupa espacio y avísame antes de borrar", el modelo ejecuta `df`, `du` y localiza los ficheros grandes, respetando la instrucción de no eliminar sin confirmación. Adecuado por su entrenamiento específico en este flujo y por su bajo coste de despliegue.
- Reparación de servicios que no arrancan: con un ticket como "nginx no arranca tras la edición de anoche, encuentra el error y haz que `nginx -t` pase", el modelo lee la configuración, ejecuta la validación y corrige la sintaxis. La demo de la model card documenta un escenario de tres fallos encadenados (error de sintaxis, daemon retirado ocupando el puerto 80 y web root sin permisos de lectura para los workers).
- Corrección de cron jobs: ante "el backup nocturno en /etc/cron.d/nightly-backup no se ejecuta, averigua por qué y arréglalo", el modelo inspecciona el fichero, comprueba permisos y sintaxis, y verifica la causa.
- Restauración segura de configuración: "restaura /etc/app/config.yaml desde /var/backups/app.tar.gz, guarda antes una copia del actual" se traduce en comandos que primero preservan el estado y luego extraen el fichero, un patrón que el modelo tiene entrenado explícitamente.
- Creación de unidades systemd: generación de un unit file para un script con usuario y directorio de trabajo concretos, seguido de verificación con `systemd-analyze verify`, como en el ejemplo de la model card (servicio `data-processor` para el usuario `devops`).
- Análisis de logs de nginx: "encuentra las IPs que causaron más errores 5xx en las últimas 1.000 peticiones de /var/log/nginx/access.log" se resuelve con comandos de filtrado y agregación sobre el log.
- Identificación de procesos por puerto: localizar el PID de un servidor Python escuchando en el puerto 8080 con `ss -tlnp` y persistirlo en un fichero, como en el ejemplo de sandbox de la model card.
- Automatización de operaciones en contenedores desechables: el modelo se usó en una demo dentro de un contenedor Docker con Ubuntu 24.04, lo que lo hace apto para entornos de prueba aislados o pipelines de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta evaluaciones cualitativas en tareas de sandbox en vivo (por ejemplo, tarea 33 de systemd superada en 3 comandos, tarea 19 de red superada en 3 comandos, tarea 23 de permisos superada en 4 comandos) y una demo de un escenario de nginx repetida 5 veces: en 3 ejecuciones el modelo corrigió los tres fallos, en 1 alcanzó HTTP 200 apuntando nginx a una copia de la página en otro directorio en lugar de arreglar los permisos, y en 1 repitió la misma comprobación en bucle hasta el límite de 15 minutos. No hay cifras de MMLU, HumanEval, GSM8K ni métricas de agente estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB con cuantización Q8_0 y unos 2,8 GB con Q4_K_M, según los tamaños de fichero indicados en la model card.
- GPU recomendadas: la demo se grabó con una RTX 3090 y llama-server; por tamaño, cabe en GPUs de consumo con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090) en Q8_0, y en GPUs de 6 GB o más en Q4_K_M.
- Cabe en GPU de consumo: sí, en las gamas mencionadas; también puede ejecutarse en CPU según la model card.
- Opciones de despliegue: llama.cpp / llama-server (usado en la demo), GGUF compatible con Ollama y otros runners de llama.cpp; pesos safetensors para transformers. El tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput estimados: no disponibles. La demo usó opencode 1.19.5 como orquestador de agente sobre llama-server con una RTX 3090, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada. La siguiente tabla recoge solo los datos conocidos de AH-Mechanic-1-4B y deja las alternativas como no disponibles, para evitar inventar cifras.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento |
|---|---|---|---|---|---|
| AH-Mechanic-1-4B | 4.659.865.088 | no disponible | Apache 2.0 | Sysadmin Linux, agente bash | Sin benchmarks numéricos publicados |
| Alternativas de ~4B para agentes de código/shell | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`language: en`); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación en comandos y opciones: la model card indica que el modelo consulta `--help` o man cuando duda, pero no hay métricas que cuantifiquen la tasa de comandos incorrectos.
- Comportamiento no determinista en tareas largas: en la demo de nginx, 1 de 5 ejecuciones resolvió el síntoma (HTTP 200) sin corregir la causa real (permisos), y otra entró en bucle repitiendo la misma comprobación hasta el límite de 15 minutos.
- Los tests held-out no incluyen tareas Docker ni apenas gestión de paquetes, por lo que el rendimiento en esos dominios no está validado.
- Riesgo operativo inherente: es un agente que ejecuta comandos bash en una máquina en vivo. Aunque está entrenado para listar el impacto antes de acciones destructivas, en producción debe desplegarse con sandboxing, permisos mínimos y confirmación humana para operaciones de borrado, `kill` o sobrescritura.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos productivos.
- No se documentan sesgos conocidos, longitud de contexto ni composición del dataset de entrenamiento, lo que limita la evaluación de riesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahtx/AH-Mechanic-1-4B
- Página del proyecto: https://amirhusain.com/mechanic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo en vídeo (MP4): https://huggingface.co/ahtx/AH-Mechanic-1-4B/resolve/main/mechanic-demo.mp4
- Demo en GIF: https://huggingface.co/ahtx/AH-Mechanic-1-4B/resolve/main/demo.gif
- Banner: https://huggingface.co/ahtx/AH-Mechanic-1-4B/resolve/main/banner.png
