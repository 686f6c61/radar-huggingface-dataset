# mchuca/ServerMonitor

## Resumen

ServerMonitor es un repositorio publicado en Hugging Face bajo el identificador `mchuca/ServerMonitor` que, a pesar de su alojamiento, no contiene un modelo de inteligencia artificial. Se trata de un conjunto de herramientas de monitorización de servidores distribuidas en seis ediciones independientes: tres implementaciones (C++17 con Qt 5 Widgets, Python 3 con tkinter y Node.js con JavaScript en navegador) y, para cada una, una variante para Linux y otra para Windows. El autor, `mchuca`, lo describe explícitamente como un sistema de análisis "sin IA" basado en estadística descriptiva.

La herramienta monitoriza CPU, memoria, discos, red, procesos, servicios, temperaturas y GPUs, tanto de la máquina local como de máquinas remotas accesibles por SSH. Mantiene un histórico con resoluciones que van de segundos a años (cada muestra durante 6 horas, minutos durante 30 días, horas durante 2 años y días durante 20 años) y aplica análisis estadísticos cada minuto: predicción de llenado de disco, detección de fugas de memoria, procesos desbocados, servicios que fallan repetidamente, anomalías frente a la misma franja horaria de la semana anterior y una puntuación de salud con calificación.

Su relevancia no reside en capacidades de aprendizaje automático, sino en su enfoque de dependencias mínimas: solo Qt, la biblioteca estándar de Python y los módulos nativos de Node.js, sin librerías de terceros. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta. No debe confundirse con un modelo de lenguaje, multimodal ni de ningún otro tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA); seis aplicaciones de monitorización: C++17 + Qt 5 Widgets, Python 3 + tkinter, Node.js + JavaScript |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles (la model card está en inglés; no se declaran idiomas de la interfaz) |
| Licencia | No disponible |
| Formato de pesos | No aplica (código fuente y binarios; los datos históricos se almacenan en ficheros binarios propios y `servers.json`) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. El repositorio contiene seis bases de código independientes que comparten formato de configuración (`servers.json`) y formato de ficheros de histórico binario, de modo que los datos pueden copiarse entre ediciones. Las ediciones Linux y Windows de un mismo lenguaje comparten todos los ficheros salvo uno específico de plataforma (`src/core/Platform.cpp`, `plat.py`, `core/platform.js` más el script recolector).

El volumen de código declarado es de 3.867 líneas (C++ Linux), 3.873 (C++ Windows), 3.090 (Python Linux), 3.096 (Python Windows), 2.225 (web Linux) y 2.214 (web Windows). La captura de métricas en Windows se realiza mediante un script de PowerShell; en Linux se emplean las utilidades del sistema. El análisis estadístico se ejecuta cada minuto sobre el histórico acumulado y produce hallazgos como pronóstico de disco lleno, crecimiento de memoria, procesos con fuga, servicios inestables, sobrecarga, swap thrashing, anomalías estacionales, disponibilidad, recomendaciones de capacidad, puntuación de salud y un mapa de calor semanal de horas de carga.

El componente de automatización ("autopilot") puede reiniciar servicios fallidos (con límite horario y excluyendo los que ya estaban caídos al arrancar la monitorización), reducir o terminar procesos desbocados y ejecutar limpieza de disco opcional; cada acción tiene tiempo de espera y queda registrada. Dispone de modo "dry run" que solo informa.

## Capacidades

- Monitorización local y remota por SSH (clave o contraseña) de CPU, memoria, discos, red, procesos, servicios, temperaturas y GPUs.
- Dashboard con tarjetas en vivo por servidor, indicadores, sparklines, calificación de salud y recuento de alertas.
- Histórico multirresolución: cada muestra durante 6 horas, minutos durante 30 días, horas durante 2 años y días durante 20 años, incluyendo periodos de caída, con mínimo, media, percentil 95 y pico, y exportación a CSV.
- Análisis estadístico automático cada minuto (sin IA): pronóstico de disco lleno, fugas de memoria, procesos desbocados, servicios fallidos o intermitentes, sobrecarga, swap thrashing, anomalías frente a la misma franja horaria semanal, disponibilidad y recomendaciones de capacidad.
- Reglas de alerta con sintaxis "métrica por encima/por debajo de un valor durante N segundos → severidad → acción", con registro de eventos y `alerts.log`.
- Autopilot con reinicio de servicios, control de procesos y limpieza de disco, con límites, tiempos de espera y modo de solo informe.
- Gestión de procesos (terminar, matar, prioridad) y de servicios (iniciar, detener, reiniciar, habilitar, deshabilitar, logs).
- Consola integrada y comprobación de conectividad SSH.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes basados en modelos.

## Casos de uso

- Monitorización de flota de servidores Linux desde un único puesto: la edición de escritorio se conecta por SSH a las máquinas remotas y centraliza métricas e histórico en ficheros binarios comunes.
- Detección temprana de disco lleno: el análisis por minuto proyecta el llenado futuro a partir del histórico y permite actuar antes de que el servicio se degrade.
- Diagnóstico de fugas de memoria y procesos desbocados: la comparación de series temporales identifica crecimiento sostenido anómalo y el autopilot puede limitar o finalizar el proceso con registro de la acción.
- Supervisión de servicios críticos con reinicio automático controlado: reglas de alerta y autopilot reinician servicios caídos con límite horario y sin tocar los que ya estaban fallidos al inicio.
- Capacidad y planificación: el mapa de calor semanal de horas punta y las recomendaciones de capacidad ayudan a dimensionar máquinas y ventanas de mantenimiento.
- Auditoría de disponibilidad y caídas: el histórico conserva los periodos de inactividad y calcula disponibilidad, útil para informes de SLA internos.
- Despliegue en entornos restringidos: al no requerir dependencias de terceros ni instalar nada en los servidores monitorizados, encaja en redes con políticas estrictas de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta el estado de las pruebas funcionales:

| Comprobacion | cqt | python | web |
|---|---|---|---|
| Edición Linux contra máquina real y host SSH inalcanzable (recorrido guiado de todas las páginas, diálogos, consola, reglas, formulario de autopilot, prueba de conexión) | 38 / 38 | 47 / 47 | 36 / 36 (navegador) + 59 / 59 (API) |
| Edición Windows con el mismo recorrido, alimentada con datos Windows simulados | 34 / 34 | 47 / 47 | 36 / 36 + API correcta |
| Análisis sobre histórico sintético de 3 días: mismos hallazgos, cifras y decisiones de autopilot en todas las ediciones | sí | sí | sí |
| Ficheros de histórico escritos por la edición C++ cargados en las demás | — | sí | sí |
| Ningún proceso hijo sobrevive al cierre de la aplicación (parada normal y kill forzado) | sí | sí | sí |
| Solo web: `Host`/`Origin` incorrectos, cabecera ausente, path traversal, inyección HTML mediante datos del servidor | — | — | todos rechazados |

## Requisitos de hardware

- No aplica VRAM ni GPU para el funcionamiento del software; las GPUs solo se monitorizan si existen en la máquina observada.
- Edición C++: requiere Qt 5.15 con ficheros de desarrollo y g++ en Linux; en Windows, Qt y compilador (paquetes en `requirements/`).
- Edición Python: requiere `python3-tk` (Linux) o Python con tkinter (Windows); solo biblioteca estándar.
- Edición web: requiere Node.js con módulos nativos; se abre en `http://127.0.0.1:8765` y escucha únicamente en localhost.
- Despliegue: ejecución directa mediante `build.sh run`, `run.sh`, `build.bat` o `run.bat` según edición; hay instaladores y paquetes para instalación offline en `requirements/`.
- Latencia y throughput: no disponibles; el análisis se ejecuta cada minuto y las pruebas no superaron los 12 minutos de ejecución continua.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la información recibida, y el objeto no es un modelo de IA sino una utilidad de monitorización, por lo que la comparación con modelos de lenguaje carece de sentido.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni ofrece tool calling; emplea estadística descriptiva.
- La edición Windows no se ha probado en una máquina Windows real; solo se ejecutó en Linux con un sustituto de PowerShell, sin validar el script recolector ni los comandos de control. El autor recomienda ejecutar `windows-selftest.ps1` antes de confiar en ella.
- No probados: una sesión SSH remota con éxito (solo se verificó una conexión rechazada), acciones con `sudo`, GPUs y sensores de temperatura (la máquina de pruebas carece de ellos), ejecuciones superiores a unos 12 minutos y navegadores distintos de Chrome.
- Las contraseñas SSH guardadas solo están ligeramente disimuladas en `servers.json` (permisos 600), no cifradas; se recomienda usar claves.
- Las ediciones web escuchan solo en `127.0.0.1` y rechazan peticiones de otros sitios, pero la página puede ejecutar comandos en la máquina; conviene revisar el modelo de amenaza antes de exponerla.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas de interfaz no declarados; la documentación está en inglés.
- Sin descargas ni likes registrados, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mchuca/ServerMonitor
