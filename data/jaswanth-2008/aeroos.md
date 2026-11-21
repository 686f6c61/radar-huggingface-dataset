# Jaswanth-2008/AeroOS

## Resumen

AeroOS no es un modelo de inteligencia artificial, sino un sistema operativo de escritorio de 64 bits escrito íntegramente en Rust (`no_std`) que se distribuye a través de Hugging Face como imagen ISO arrancable de 9,5 MB. El proyecto, desarrollado por el usuario Jaswanth-2008, implementa desde cero un kernel x86_64 con gestor de ventanas, compositor gráfico con efecto acrílico, entorno de escritorio y una pila de red TCP/IP real sobre `smoltcp` y `virtio-net`. La ficha se incluye en este catálogo por rigor documental, pero conviene subrayar que no contiene pesos, tokenizador ni pipeline de inferencia.

El objetivo del proyecto es demostrar que es posible construir una experiencia de escritorio moderna (inspirada visualmente en Windows 11 y macOS) sin dependencias de navegador, Electron ni bibliotecas gráficas de alto nivel, renderizando toda la interfaz sobre el framebuffer lineal de UEFI GOP mediante un rasterizador software de 32 bits. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de la consulta.

Dado que la información disponible describe un sistema operativo y no un modelo de lenguaje, las secciones de arquitectura de red neuronal, benchmarks, cuantización y requisitos de VRAM se completan indicando "no disponible" o adaptándose al dominio real del artefacto (kernel, HAL, drivers).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema operativo bare-metal x86_64 en Rust (`no_std`); kernel monolítico con HAL, VFS en RAM y compositor software |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible (no es un modelo de IA) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (interfaz en inglés según la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible; se distribuye imagen ISO arrancable (`aero-os.iso`, 9,5 MB) y código fuente Rust |

## Arquitectura y entrenamiento

No hay entrenamiento ni pesos: AeroOS es un artefacto de ingeniería de sistemas. Su arquitectura por capas comprende, de abajo arriba, un bootloader basado en `bootloader_api v0.11` con arranque dual UEFI GPT y BIOS MBR; una HAL con GDT y TSS con IST, IDT e IRQ, paginación de 4 niveles, remapeo del PIC 8259, drivers PS/2 para ratón y teclado, VirtIO-Net por PCI y framebuffer UEFI GOP; un sistema de ficheros virtual en RAM (RamDisk) con rutas jerárquicas `/system`, `/user`, `/docs`; una pila TCP/IP real (`smoltcp 0.14`) con Ethernet II, caché ARP, IPv4 e ICMP; un gestor de ventanas con pila Z-order, arrastre, botones tipo semáforo y rasterizador 2D con alpha blending, rectángulos redondeados, sombras y fuente bitmap 8x16; y una capa de aplicaciones nativas (AeroShell, Network Center, Task Manager, File Explorer, Calculator, Text Editor, System Settings).

El asignador de memoria es un `LinkedListHeap` de 16 MiB. La red se configura en modo usuario de QEMU con IP `10.0.2.15/24`, gateway `10.0.2.2` y DNS `10.0.2.3`, e incluye síntesis de respuestas ICMP Echo. No se documenta ningún proceso de entrenamiento, ajuste fino ni dataset, lo cual es coherente con la naturaleza del proyecto.

## Capacidades

- Arranque en hardware x86_64 real o virtualizado mediante imágenes UEFI GPT y BIOS MBR.
- Renderizado completo de interfaz gráfica sin navegador ni Electron, sobre framebuffer UEFI GOP con rasterizador software de 32 bits.
- Compositor con barra superior translúcida de 28 px, dock flotante, menú de inicio centrado, fondos degradados y controles de ventana estilo macOS.
- Gestión de ventanas: arrastre por barra de título, cambio de foco por Z-order, minimizar, maximizar y cerrar.
- Pila de red TCP/IP real: Ethernet II, ARP, IPv4, ICMP Echo Reply y contadores de paquetes en vivo.
- Terminal interactivo (AeroShell) con historial de comandos y utilidades `ping`, `ifconfig`, `ls`, `cat`, `neofetch`, `clear` y `reboot`.
- Aplicaciones nativas: Network Center con test de ping, Task Manager con gráfica de CPU y uso de memoria, explorador de ficheros de doble panel, calculadora y editor de texto.
- Sistema de ficheros virtual en RAM con lectura, escritura y navegación jerárquica.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües por modelo, visión, audio ni modo thinking, al no ser un modelo de IA.

## Casos de uso

- Docencia de desarrollo de sistemas operativos: el código fuente en Rust `no_std` con estructura modular (`arch/`, `memory/`, `drivers/`) sirve como material de referencia para cursos de OSDev sobre x86_64.
- Prototipado de interfaces de escritorio: permite experimentar con composición acrílica, sombras y controles de ventana sin las dependencias de un stack gráfico convencional.
- Pruebas de arranque y virtualización: la ISO de 9,5 MB es útil para validar configuraciones de QEMU con `virtio-net` y firmware UEFI/BIOS en pipelines de integración.
- Demostración de pilas de red embebidas: la integración de `smoltcp` con `virtio-net` y direccionamiento QEMU user-mode sirve para estudiar protocolos ARP/IPv4/ICMP en un entorno mínimo.
- Base para un sistema operativo de hobby o investigación: el repositorio con Makefile, runner de imágenes y script `run_qemu.sh` facilita extender drivers, VFS o aplicaciones.
- Evaluación de Rust en entornos bare-metal: el uso de `bootloader_api`, paginación de 4 niveles y asignador propio permite medir ergonomía del lenguaje en kernels reales.
- No es adecuado para inferencia de IA, generación de texto, código, visión ni ninguna tarea de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara el tamaño de la ISO (9,5 MB), el heap de 16 MiB y la configuración de red de QEMU; no incluye métricas de latencia, throughput, tiempos de arranque ni comparaciones con otros sistemas operativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA. El sistema usa el framebuffer UEFI GOP para renderizar la interfaz.
- Memoria RAM: el kernel gestiona un heap de 16 MiB según la documentación; se recomienda al menos 64-128 MiB para QEMU con margen para el framebuffer y la pila de red.
- CPU: x86_64 con soporte UEFI o BIOS; paginación de 4 niveles.
- GPU recomendadas: no aplica; no requiere aceleración gráfica, el renderizado es software.
- Cabe en cualquier equipo consumer x86_64 con firmware UEFI o BIOS y adaptador de red VirtIO-Net para las funciones de red.
- Opciones de despliegue: arranque directo de la ISO en hardware, o virtualización con QEMU mediante el script `run_qemu.sh` incluido en el repositorio (UEFI/BIOS con `virtio-net`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible en el sentido de modelos de IA. Como referencia de sistemas operativos de hobby en Rust, podrían citarse proyectos como Redox OS o Theseus, pero la información proporcionada no incluye datos comparativos de parámetros, contexto, rendimiento ni licencia de esos proyectos, por lo que no se establece una tabla comparativa con cifras verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no procesa código ni imágenes, y no debe evaluarse con métricas de IA.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario no verificables.
- El repositorio figura con tamaño 0,0 GB, aunque la model card enlaza una ISO de 9,5 MB; conviene verificar la integridad del artefacto antes de arrancarlo.
- El sistema de ficheros es un RamDisk: los datos no persisten entre reinicios.
- La red está diseñada para el modo usuario de QEMU (`10.0.2.15`), no para despliegues en red reales sin adaptación.
- Interfaz únicamente en inglés según la documentación; no se declaran otros idiomas.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no hay garantías ni soporte del autor.
- Al ser un kernel bare-metal, errores en drivers o en la HAL pueden provocar fallos de arranque o inestabilidad; no se recomienda para entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jaswanth-2008/AeroOS
- ISO arrancable: https://huggingface.co/Jaswanth-2008/AeroOS/resolve/main/aero-os.iso
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
