# Archtiger/CrimsonDesertDlssFixer

## Resumen

CrimsonDesertDlssFixer no es un modelo de inteligencia artificial, sino una utilidad de escritorio para Windows x64 publicada por el usuario Archtiger en Hugging Face bajo licencia MIT. Su funcion es diagnosticar y reparar problemas de DLSS, Frame Generation, Multi-Frame Generation (MFG) y del sistema RHI en el videojuego Crimson Desert, especialmente cuando una reinstalacion limpia del juego en Steam no resuelve la incidencia. El repositorio tiene un tamano de 0,1 GB y contiene un ejecutable autocontenido de 61,93 MB junto con el codigo fuente.

La herramienta actua sobre los perfiles DRS de los controladores NVIDIA (tanto el perfil global Base Profile como el perfil especifico de Crimson Desert), sobre los ficheros XML de configuracion de Pearl Abyss en `%LOCALAPPDATA%\Pearl Abyss\CD\`, sobre los DLL del directorio `bin64` del juego y sobre las caches de RHI y de shaders. Su relevancia actual radica en que aborda fallos documentados de interaccion entre NVIDIA Smooth Motion, RTX HDR, el preset global de DLSS y las DLL de Streamline que una reinstalacion de Steam no revierte.

Al tratarse de una utilidad y no de un modelo fundacional, carece de parametros, contexto, capacidades linguisticas o benchmarks de razonamiento. Esta ficha documenta sus especificaciones tecnicas reales, su logica de funcionamiento y sus limitaciones como software de reparacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (utilidad de escritorio, no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como ejecutable Windows x64 autocontenido y codigo fuente .NET) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay arquitectura de red neuronal ni proceso de entrenamiento. La utilidad esta escrita en .NET (requiere .NET 10 SDK para compilar desde fuente) y se distribuye como ejecutable single-file autocontenido para Windows x64, de modo que no necesita instalacion del runtime .NET en el equipo destino. El binario principal ocupa 61,93 MB y su hash SHA-256 es `5761E2F5982ED6D4FEF91236DF56A51F40A07EB20BF1F5F58845139ADD14055E`.

Tecnicamente, la herramienta interactua con `nvapi64.dll` mediante NVAPI v2 e inspecciona directamente los ficheros `nvdrsdb0.bin` y `nvdrsdb1.bin` para manipular los perfiles DRS. Elimina overrides obsoletos de DLSS, DLSS-RR, DLSS-FG, MFG y Streamline mediante `NvAPI_DRS_DeleteProfileSetting`, y desactiva de forma explicita NVIDIA Smooth Motion (`0xB0D384C0 = 0`), el override de baja latencia (`0x0005F543 = 0`), RTX HDR (`0x00DD48FB = 0`), el preset global de DLSS (`0x00634291 = 0`) y el V-Sync forzado (`0x00A879CF`), limitando estos cambios al perfil de Crimson Desert para no alterar la configuracion global del resto de juegos. Ademas, verifica la firma Authenticode de las nueve DLL oficiales `nvngx_dlss*` y `sl.*`, pone en cuarentena (mueve, no borra) DLL proxy de mods como RHI, OptiScaler, ReShade o RenoDX, y analiza el log `Launcher_*.log` en busca de desajustes de version de Streamline y errores `proxyBuffer is NULL`.

## Capacidades

- Diagnostico de solo lectura mediante `--scan`, con salida en texto o JSON (`--scan --json`).
- Reparacion automatizada con `--fix`, aplicando todos los arreglos recomendados con copia de seguridad automatica.
- Restauracion desde la ultima copia mediante `--restore`.
- Deteccion y cuarentena de DLL proxy y carpetas de backup de mods en `bin64` (`_BACKUPNV`, `dxgi.dll`, `version.dll`, `winmm.dll`, `nvngx_dlssnr.dll`, `*.addon64`, entre otras).
- Verificacion de firma Authenticode de las DLL oficiales de NVIDIA.
- Limpieza de entradas obsoletas en las caches de RHI (`dlss_trusted_paths.json`, `game_library.json`, `settings.json`).
- Limpieza selectiva de cache de shaders de las ultimas 72 horas cuando detecta overrides rotos, preservando caches de otros juegos.
- Creacion de copia de seguridad con marca temporal en `%LOCALAPPDATA%\CrimsonDesertDlssFixer\Backups\backup_<timestamp>\` y registro de cada cambio en `backup_manifest.json`.
- No modifica las partidas guardadas (`CD\save\<steamid>\slot*`).

## Casos de uso

- Reparacion tras reinstalacion limpia en Steam: el usuario reinstala Crimson Desert y sigue sin funcionar DLSS o Frame Generation; la herramienta restablece los perfiles DRS y limpia configuraciones persistentes que Steam no elimina.
- Correccion de Frame Generation invertido: cuando FG o MFG parece activarse al desactivarlo y viceversa, la utilidad desactiva NVIDIA Smooth Motion en el perfil del juego para eliminar la colision con el hook de swapchain de Streamline.
- Eliminacion de parpadeos y flashing en pantalla: desactiva RTX HDR global, el preset global de DLSS y el V-Sync forzado en el perfil de Crimson Desert, evitando conflictos con el HDR nativo del juego.
- Limpieza de errores masivos de Streamline: detecta el override global `0x10E41E06 = 1` que inyecta DLL OTA incompatibles sobre las `sl.*.dll` del juego y lo revierte.
- Cuarentena de mods problematicos: si el usuario ha instalado RHI, OptiScaler, ReShade o desbloqueadores de MFG, la herramienta mueve esos archivos a cuarentena en lugar de borrarlos, permitiendo restaurarlos.
- Diagnostico previo a soporte tecnico: el modo `--scan --json` genera un informe estructurado que un usuario puede adjuntar a un reporte de incidencia sin aplicar cambios.
- Integracion en scripts de soporte: las opciones de linea de comandos permiten automatizar el diagnostico y la reparacion en equipos de pruebas o en flujos de asistencia remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no procede comparar MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- Sistema operativo: Windows x64.
- Runtime: no requiere instalacion de .NET en el equipo destino (build autocontenido single-file).
- Para compilar desde fuente: .NET 10 SDK en Windows x64.
- GPU: no se especifica un modelo concreto; la utilidad actua sobre configuracion de controladores NVIDIA, por lo que el contexto de uso son equipos con GPU NVIDIA y el juego Crimson Desert instalado.
- VRAM estimada: no disponible.
- Opciones de despliegue: ejecutable standalone descargable o compilacion propia con `dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o publish`.
- Latencia y throughput: no disponibles; el tiempo de ejecucion depende del numero de ficheros y perfiles a inspeccionar.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| CrimsonDesertDlssFixer | Utilidad Windows | Reparacion de DLSS, FG, MFG y RHI en Crimson Desert | MIT | Hugging Face y GitHub |
| RHI (RankFTW/RHI) | Mod / capa de renderizado | Override de DLSS y FG en juegos | no disponible | no disponible |
| OptiScaler | Capa de escalado | Sustitucion de DLSS por otros escaladores | no disponible | no disponible |
| NVIDIA App | Panel de control | Configuracion global de DLSS, HDR y latencia | propietaria | Distribucion oficial de NVIDIA |

La comparativa es funcional, no de rendimiento: las alternativas no resuelven el mismo problema de forma automatica y con rollback, y de hecho varias de ellas son la causa de los fallos que esta herramienta corrige.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza razonamiento; cualquier evaluacion como modelo fundacional carece de sentido.
- El ejecutable es open source pero no esta firmado digitalmente, por lo que Windows SmartScreen puede mostrar una advertencia; el autor recomienda comprobar el hash SHA-256 o compilar desde fuente.
- Actua exclusivamente sobre Crimson Desert y sobre configuracion de NVIDIA; no corrige problemas de otros juegos ni de hardware no NVIDIA.
- Depende de la estructura interna de los perfiles DRS y de las rutas de Pearl Abyss; actualizaciones del juego, del controlador o de RHI pueden invalidar total o parcialmente su logica.
- La cuarentena mueve archivos en lugar de borrarlos, pero un uso incorrecto de la restauracion podria dejar el directorio del juego en un estado mixto si el usuario modifica archivos entre la copia y la restauracion.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones linguisticas porque no aplican a esta categoria de software.
- La licencia MIT permite uso comercial y modificacion, pero no ofrece garantias; el usuario asume el riesgo de ejecutar una herramienta que altera perfiles de controladores y archivos del juego.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Archtiger/CrimsonDesertDlssFixer
- Descarga directa del ejecutable: https://huggingface.co/Archtiger/CrimsonDesertDlssFixer/resolve/main/CrimsonDesertDlssFixer.exe
- Mirror en GitHub y releases: https://github.com/CosmicFungi/CrimsonDesertDlssFixer
- .NET 10 SDK: https://dotnet.microsoft.com/
