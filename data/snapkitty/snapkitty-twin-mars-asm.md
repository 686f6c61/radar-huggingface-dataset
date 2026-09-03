# Snapkitty/snapkitty-twin-mars-asm

## Resumen

Snapkitty/snapkitty-twin-mars-asm es una reconstruccion en ensamblador x86_64 del agente de codificacion TWIN-MARS, desarrollado por SpaceXAI como parte de su linea "Grok Build". El autor, Ahmad Ali Parr, ha implementado desde cero un binario ELF64 estatico para Linux que reproduce el comportamiento observable del agente original, sin usar libc y con llamadas directas al sistema. El proyecto surge porque el codigo fuente original de TWIN-MARS depende de librerias propietarias (DotSlash, protoc, credenciales de xAI) que impiden su compilacion externa, por lo que la reconstruccion se basa en el analisis del instalador, el README y los interfaces de linea de comandos.

La relevancia de este proyecto radica en su enfoque "behavior-first": en lugar de reescribir los aproximadamente 80 crates de Rust que componen el agente, se observa el comportamiento del ejecutable y se implementa en ensamblador, verificando mediante pruebas diferenciales. Incluye tambien una reconstruccion en Python (realizada por Kimi, de Moonshot AI) que sirve como gemelo de referencia. No se trata de un modelo de lenguaje ni de una red neuronal, sino de un programa de sistema que replica la interfaz y las funciones basicas de un agente de codificacion en un entorno de terminal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | x86_64, binario ELF64 estatico, ensamblador NASM |
| Parametros totales | no aplica (no es un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no especificado (interfaz en ingles, sin datos) |
| Licencia | BSL-1.1, AGPL-3.0, MPL-2.0 y "patent pending" (segun badges del repositorio) |
| Formato de pesos | no aplica (codigo fuente ensamblador y binario ELF) |

## Arquitectura y entrenamiento

No es un modelo entrenado. Se trata de un programa escrito manualmente en ensamblador NASM para x86_64 Linux, compilado con `nasm` y enlazado con `ld` para producir un binario estatico ELF64. La arquitectura interna se organiza en modulos: `bootstrap.asm` (punto de entrada, gestion de argc/argv/envp), `memory.asm` (asignador de memoria tipo bump allocator mediante la syscall `brk`, con un heap de 4 MB), `strings.asm` (primitivas de cadenas sin libc), `terminal.asm` (modo raw, pantalla alternativa ANSI, bucle de eventos TUI), `storage.asm` (listado de directorios con `getdents64`, lectura/escritura de archivos, checkpoints) y `main.asm` (despacho de CLI con banderas `--version`, `--help`, `--headless`, `--stdio`, `--leader`).

El metodo de desarrollo es "behavior-first": se extrae el comportamiento observable a partir del instalador, el README y las caracteristicas de la TUI, se traza la interfaz de syscalls (System V AMD64) y se implementa en ensamblador. No hay datos de entrenamiento ni proceso de aprendizaje; la verificacion se realiza mediante pruebas diferenciales entre el binario reconstruido y el comportamiento descrito del original.

## Capacidades

- Ejecucion de comandos CLI con banderas documentadas: `--version`, `--help`, `--headless`, `--stdio` y `--leader`.
- Interfaz de terminal interactiva (TUI) con modo raw, pantalla alternativa, soporte de raton y ocultacion del cursor.
- Bucle de prompt con edicion basica: caracteres imprimibles, retroceso, entrada con Enter, comandos que empiezan por `/` y salida con ESC o Ctrl-C/Ctrl-D.
- Manejo de archivos: listado de directorios, lectura y escritura, y creacion de directorios para checkpoints.
- Asignacion de memoria dinamica mediante syscall `brk` con un heap de 4 MB.
- Sin dependencias de libc: todas las operaciones de entrada/salida, control de terminal y gestion de archivos se realizan con syscalls directas.
- Modo headless para ejecucion sin interfaz interactiva, orientado a automatizacion.

## Casos de uso

- Estudio de ingenieria inversa: permite analizar como se puede reconstruir el comportamiento de un agente de codificacion propietario a partir de la observacion de su interfaz y sus syscalls, sin acceso al codigo fuente.
- Aprendizaje de programacion en ensamblador x86_64: el codigo es un ejemplo completo de un programa ELF64 estatico sin libc, con modulos claramente separados y uso extensivo de la ABI System V.
- Replicacion de entornos de desarrollo sin dependencias propietarias: el binario puede ejecutarse en cualquier Linux x86_64 sin necesidad de instalar DotSlash, protoc ni credenciales de xAI.
- Automatizacion de tareas de terminal en modo headless: mediante la bandera `--headless` se puede integrar en scripts o pipelines que requieran las funciones basicas de listado y edicion de archivos.
- Referencia para implementar agentes de codificacion minimalistas en lenguajes de bajo nivel: el diseño modular (bootstrap, memoria, terminal, almacenamiento) puede servir como punto de partida para proyectos similares.
- Verificacion de compatibilidad ABI: las pruebas diferenciales entre el binario reconstruido y el comportamiento esperado permiten validar la correcta implementacion de la interfaz de syscalls en Linux.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de rendimiento comparativo, latencia ni throughput. Al ser un programa en ensamblador sin libc, su uso de recursos es minimo, pero no se aportan mediciones concretas.

## Requisitos de hardware

- Binario ELF64 estatico para Linux x86_64, sin dependencias dinamicas.
- Requiere un kernel Linux con soporte para las syscalls utilizadas (`write`, `read`, `open`, `close`, `ioctl`, `getdents64`, `brk`, `mkdir`, `exit_group`).
- El heap se fija en 4 MB mediante `brk`, por lo que el consumo de memoria es reducido.
- No requiere GPU ni aceleracion por hardware; es una aplicacion de terminal pura.
- Puede ejecutarse en cualquier maquina con Linux x86_64, incluidos sistemas embebidos o contenedores ligeros.
- No se proporcionan datos de latencia ni throughput; al ser un programa secuencial con syscalls directas, el rendimiento dependera del sistema operativo y del almacenamiento.
- Opciones de despliegue: ejecucion directa del binario compilado, o compilacion desde el codigo fuente con `nasm` y `ld`. No se mencionan integraciones con vLLM, Ollama u otros frameworks de inferencia.

## Comparativa con modelos similares

No disponible. Este proyecto no es un modelo de lenguaje ni un agente de IA generativa comparable con otros modelos del mercado. Su naturaleza es la de un programa de sistema que reconstruye el comportamiento de un agente de codificacion especifico, sin equivalentes publicos conocidos en el momento de la consulta.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no genera texto, codigo ni respuestas; es una reconstruccion a nivel de sistema de las funciones basicas del agente original.
- La reconstruccion se basa en observacion y puede presentar divergencias respecto al comportamiento real de TWIN-MARS, especialmente en funciones no documentadas en el README o el instalador.
- La licencia es ambigua: se muestran simultaneamente BSL-1.1, AGPL-3.0, MPL-2.0 y una marca de "patent pending". Esto puede generar conflictos legales para su uso comercial o su redistribucion; se recomienda consultar el repositorio original antes de cualquier implementacion.
- No se garantiza la funcionalidad completa del agente original: las capacidades de edicion de archivos, checkpoints y TUI son reconstrucciones parciales basadas en evidencias observables.
- El codigo no ha sido auditado ni probado en entornos de produccion; su uso en sistemas criticos no esta recomendado.
- No hay informacion sobre idiomas soportados; la interfaz parece estar en ingles, pero no se confirma.
- La fecha de creacion (2026-09-03) es posterior a la fecha actual de la consulta, lo que sugiere que el proyecto es muy reciente y podria contener errores o carecer de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/snapkitty-twin-mars-asm
- Repositorio GitHub del proyecto: https://github.com/SNAPKITTYWEST/TWIN-MARS
