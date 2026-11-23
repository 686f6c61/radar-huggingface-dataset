# Bharath2025/MicroOS

## Resumen

MicroOS v1.0 es un sistema operativo Linux ultraligero para arquitectura x86_64, desarrollado por el autor independiente Bharath2025 y publicado en Hugging Face bajo licencia MIT. A pesar de su alojamiento en la plataforma, no se trata de un modelo de inteligencia artificial ni de un modelo de lenguaje: es una distribucion Linux bootable completa, empaquetada como imagen ISO y disco virtual VDI, disenada para operar dentro de un presupuesto estricto de 50 MB. El proyecto se enmarca en el ambito del desarrollo de sistemas operativos (osdev) y se distribuye con dos ediciones: una edicion de escritorio grafico y una edicion de terminal CLI.

La edicion grafica ocupa 3,63 MB en formato ISO y 5,24 MB como disco VirtualBox, e incluye un gestor de ventanas nativo, un compositor con doble buffer sobre un framebuffer lineal de 800x600 a 32 bpp, barra de tareas con menu de inicio, panel de telemetria en tiempo real y gestion de red Wi-Fi 6. La edicion CLI ocupa 12,77 MB y se basa en el kernel Linux 6.6 LTS con shell BusyBox ash, arquitectura de gestor de paquetes APT compatible con Debian Bookworm, sondeo nativo de hardware y ocho juegos de arcade en C que funcionan sin conexion.

Su relevancia actual reside en el nicho de sistemas embebidos, entornos de virtualizacion minima y experimentacion educativa en osdev: demuestra que es posible construir un escritorio funcional y una CLI completa con una huella de almacenamiento inferior a 13 MB, sin dependencias de navegador ni de Electron. No obstante, conviene subrayar que no es un modelo de IA y que no dispone de parametros, contexto, cuantizacion ni capacidades de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema operativo x86_64 (kernel Linux 6.6 LTS en la edicion CLI; kernel propio/bare-metal con framebuffer en la edicion GUI) |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (artefactos distribuidos como ISO y VDI) |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Edicion grafica (ISO) | 3.638.272 bytes (3,63 MB) |
| Edicion grafica (VDI) | 5.242.880 bytes (5,24 MB) |
| Edicion terminal (ISO) | 12.769.280 bytes (12,77 MB) |
| Limite de tamano declarado | 50.000.000 bytes por ISO |
| Resolucion de framebuffer | 800x600 a 32 bpp |
| Gestor de arranque | GRUB 2 (BIOS y UEFI) |
| Shell | BusyBox ash (edicion CLI) |
| Gestor de paquetes | APT compatible con Debian Bookworm glibc |
| Soporte de red | Realtek RTL8852BE Wi-Fi 6 |
| Tamano del repositorio en Hugging Face | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No aplica el concepto de entrenamiento: MicroOS no es un modelo de machine learning, sino una distribucion de sistema operativo. Su arquitectura se organiza en capas. En la base, el firmware (BIOS o UEFI) carga GRUB 2, que a su vez arranca el kernel. Sobre el kernel se situan los controladores de hardware: driver dual de raton PS/2 sobre el puerto auxiliar 8042 (direcciones 0x64 y 0x60) con interrupciones STI habilitadas, decodificador de scancodes Set 1 para teclado PS/2 de 104 teclas US, escaner del bus PCI, controlador AHCI SATA (/dev/sda), graficos VBox SVGA y driver Wi-Fi 6 Realtek RTL8852BE integrado con el subsistema de red de Linux.

Sobre esa capa de drivers, la edicion grafica implementa un gestor de ventanas y un compositor con doble buffer que apila ventanas por orden Z, gestiona barras de titulo activas y controles de minimizar y cerrar, y rasteriza por software sobre un framebuffer lineal TrueColor de 800x600 a 32 bpp. Las aplicaciones nativas (terminal Bash, ajustes de Wi-Fi, panel del sistema, benchmark de arranque, gestor de archivos, gestor APT, simulador de concurrencia y juegos) se ejecutan sobre ese compositor. El repositorio se organiza en directorios `boot/`, `kernel/`, `rootfs/`, `init/`, `networking/` y `hardware/`, con scripts de construccion para configurar el kernel, generar el initramfs y montar el overlay de BusyBox. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni tecnicas de RLHF, por no ser aplicables.

## Capacidades

- Arranque nativo en hardware x86_64 real y en maquinas virtuales (VirtualBox mediante VDI, o ISO en cualquier hipervisor compatible).
- Escritorio grafico con gestor de ventanas, arrastre de ventanas flotantes, sombras, reloj y puntero de raton.
- Barra de tareas multitarea con menu de inicio y panel de telemetria en tiempo real.
- Terminal Bash funcional con prompt `bharath@microos:~$` y suite de comandos: `whoami`, `user`, `id`, `uname -a`, `hostname`, `pwd`, `cd`, `ls -la`, `cat`, `date`, `uptime`, `free`, `df`, `ps`, `top`, `sysinfo`, `hardware`, `disks`, `wifi`, `ping`, `apt`, `neofetch`, `clear`, `help`, `history`.
- Deteccion y gestion de redes Wi-Fi 6 del entorno real, con escaneo de SSID cercanos y conexion interactiva.
- Entrada dual: raton PS/2 con interrupciones en puerto auxiliar y navegacion completa por teclado con atajo F1 como clic.
- Ocho juegos de arcade en C sin conexion: `snake`, `tetris`, `pong`, `mines`, `2048`, `guess`, `tictactoe` y `spaceinvaders`.
- Arquitectura APT compatible con Debian Bookworm glibc sobre almacenamiento persistente.
- Sondeo de hardware en vivo mediante sysfs y procfs.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes, al no ser un modelo de IA.

## Casos de uso

- Virtualizacion de escritorio minima: arrancar la ISO grafica de 3,63 MB en VirtualBox o QEMU para disponer de un escritorio funcional en entornos con restricciones severas de almacenamiento, ideal para pruebas de compatibilidad o demos.
- Formacion en desarrollo de sistemas operativos: el repositorio estructurado en `boot/`, `kernel/`, `rootfs/` e `init/` sirve como material didactico para estudiar el arranque GRUB 2, la configuracion del kernel Linux 6.6 LTS y la construccion de un initramfs.
- Laboratorio de redes inalambricas: la deteccion y gestion de Wi-Fi 6 con el driver Realtek RTL8852BE permite practicar escaneo de SSID, conexion interactiva y diagnostico con `ping` y `wifi` en un entorno controlado.
- Sistemas embebidos y kioscos: la edicion CLI de 12,77 MB con BusyBox ash y APT encaja en dispositivos con almacenamiento limitado que requieran un shell completo y gestion de paquetes sin escritorio.
- Recuperacion y diagnostico de hardware: los comandos `hardware`, `disks`, `sysinfo`, `free` y `df` permiten inspeccionar el estado de un equipo desde una ISO de arranque ligera.
- Entornos educativos de programacion en C: los ocho juegos de arcade incluidos ofrecen ejemplos reales de codigo C ejecutandose sobre un sistema minimo, utiles para practicas de programacion de terminal.
- Pruebas de CI/CD de imagenes de sistema: el tamano reducido de las ISOs facilita su almacenamiento, versionado y despliegue automatizado en pipelines de prueba de arranque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento como tiempos de arranque medidos, throughput de red o puntuaciones de comparacion con otras distribuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA). La edicion grafica requiere un framebuffer de 800x600 a 32 bpp, aproximadamente 1,92 MB de memoria de video.
- Almacenamiento: 3,63 MB (ISO grafica), 5,24 MB (VDI) o 12,77 MB (ISO CLI), muy por debajo del limite declarado de 50 MB.
- CPU: x86_64 de 64 bits con soporte de virtualizacion si se ejecuta en hipervisor.
- Memoria RAM: no disponible en la informacion proporcionada.
- GPU recomendadas: no aplica; la edicion grafica usa rasterizacion por software sobre framebuffer lineal y graficos VBox SVGA en virtualizacion.
- Compatibilidad con GPU de consumo: no aplica en el sentido de modelos de IA; funciona en cualquier equipo x86_64 que soporte BIOS o UEFI y arranque desde ISO o disco virtual.
- Opciones de despliegue: VirtualBox (VDI preconfigurado), arranque directo desde ISO en QEMU u otros hipervisores, y arranque bare-metal mediante GRUB 2 en BIOS o UEFI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Tamano | Base | Gestor de paquetes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MicroOS GUI | Distribucion Linux con escritorio | 3,63 MB (ISO) | Kernel propio con framebuffer | No documentado | MIT | Hugging Face |
| MicroOS CLI | Distribucion Linux de terminal | 12,77 MB (ISO) | Linux 6.6 LTS + BusyBox | APT (Debian Bookworm) | MIT | Hugging Face |
| Alpine Linux | Distribucion Linux minima | Orden de decenas de MB (no disponible en la informacion) | Linux + musl + BusyBox | apk | No disponible en la informacion | Sitio oficial |
| Tiny Core Linux | Distribucion Linux ultraligera | Orden de decenas de MB (no disponible en la informacion) | Linux + BusyBox | Extensiones propias | No disponible en la informacion | Sitio oficial |

No se dispone de datos de rendimiento comparativo entre estas distribuciones en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo de inteligencia artificial: no genera texto, no razona, no procesa lenguaje natural ni admite tool calling. Cualquier expectativa en ese sentido es erronea.
- Proyecto con cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Documentacion limitada: la model card no detalla requisitos de RAM, compatibilidad completa de hardware fuera del entorno VirtualBox ni procedimientos de instalacion en bare-metal.
- El soporte de Wi-Fi se documenta especificamente para el chip Realtek RTL8852BE; otros adaptadores inalambricos pueden no funcionar.
- La edicion grafica depende de un framebuffer lineal y rasterizacion por software, sin aceleracion grafica por hardware, lo que limita su uso en aplicaciones visualmente exigentes.
- Riesgo de inestabilidad en hardware real no verificado: el proyecto se ha probado presumiblemente en VirtualBox y en el equipo del autor, sin evidencia de pruebas extensas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere validacion propia.
- El repositorio ocupa 0,0 GB segun la plataforma, lo que puede reflejar un problema de empaquetado o de carga de artefactos; conviene verificar la integridad de las descargas.
- No se documentan sesgos, alucinaciones ni limitaciones de idioma por no ser un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Bharath2025/MicroOS
- Descarga de la ISO grafica: https://huggingface.co/Bharath2025/MicroOS/resolve/main/release/microos-gui.iso
- Descarga del disco VirtualBox VDI: https://huggingface.co/Bharath2025/MicroOS/resolve/main/release/microos-gui.vdi
- Descarga de la ISO de terminal: https://huggingface.co/Bharath2025/MicroOS/resolve/main/release/microos.iso
