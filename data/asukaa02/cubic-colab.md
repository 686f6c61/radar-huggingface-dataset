# Asukaa02/cubic-colab

## Resumen

`Asukaa02/cubic-colab` no es un modelo de inteligencia artificial, sino un repositorio de herramientas publicado en Hugging Face que contiene una reimplementación headless del flujo de trabajo de Cubic (Custom Ubuntu ISO Creator) orientada a Google Colab. El autor, Asukaa02, empaqueta un notebook (`cubic_colab.ipynb`) y un script equivalente de línea de comandos (`cubic_pipeline.py`) que permiten extraer, personalizar y reconstruir una ISO de Ubuntu sin interfaz gráfica, sin VNC y sin montajes loop, algo habitualmente problemático en contenedores restringidos como el runtime de Colab.

El problema que resuelve es concreto: Cubic original requiere un escritorio con GTK y montajes loop del sistema de ficheros, lo que no es viable en entornos efímeros y sin privilegios. Esta herramienta sustituye ese flujo por `xorriso -osirrox` para la extracción, `unsquashfs`/`mksquashfs` para manipular el rootfs live y un chroot best-effort para aplicar paquetes apt, PPAs, ficheros y cambios de kernel, preservando las rutas de arranque BIOS (grub2 MBR + El Torito) y UEFI (GPT con ESP) de la ISO original.

Es relevante para desarrolladores e investigadores que necesitan generar imágenes de sistema reproducibles desde un notebook, automatizar la creación de ISOs personalizadas en CI o validar pipelines de remasterización sin infraestructura de virtualización con privilegios. No contiene pesos, no ejecuta inferencia y no debe evaluarse como modelo lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un pipeline de scripts Python + herramientas de sistema) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el README está en inglés; el pipeline no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio distribuye `cubic_colab.ipynb`, `cubic_pipeline.py` y `LICENSE`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento. El repositorio implementa un pipeline determinista de cinco etapas documentado en el README: extracción de la ISO con `xorriso -osirrox` (sin loop-mount), desempaquetado del rootfs live con `unsquashfs`, personalización dentro de un chroot con bind-mounts best-effort de `/dev`, `/proc` y `/sys`, repack con `mksquashfs` y reconstrucción de la ISO con `xorriso` reutilizando el informe `report_el_torito as_mkisofs` del original para conservar el layout de arranque BIOS y UEFI.

La innovación técnica destacable es la reconstrucción fiel del equipamiento de arranque: la celda 7 imprime el informe de arranque de la nueva ISO junto al de la original y verifica el contenido del ESP byte a byte contra `efi.img`. Además, el chroot regenera `filesystem.manifest(-remove)` y `filesystem.size`, y se reconstruye `md5sum.txt` tras el repack. El notebook y el script CLI se generan desde una única fuente para evitar divergencias. No se documenta ningún proceso de entrenamiento, dataset ni ajuste por RLHF/DPO.

## Capacidades

- Remasterización de ISOs de Ubuntu >= 20.04 con layout casper + GRUB: desktop, server, Kubuntu, Lubuntu, Xubuntu, MATE, Budgie, Studio y Kylin.
- Instalación y purga de paquetes apt dentro del sistema live (`APT_INSTALL`, `APT_PURGE`).
- Añadición de PPAs de Launchpad mediante `add-apt-repository` (`PPA_REPOS`).
- Instalación de ficheros `.deb` sueltos con `dpkg -i` (`DEB_URLS`).
- Inyección de ficheros arbitrarios en el rootfs (`ROOTFS_FILES`) y en el árbol de la ISO (`ISO_FILES`).
- Ejecución de one-liners de shell dentro del chroot (`RUN_IN_CHROOT`).
- Cambio de hostname live e instalado (`SET_HOSTNAME`).
- Instalación de kernels alternativos, incluido HWE, con purga opcional de los antiguos (`KERNEL`).
- Edición de entradas del menú GRUB mediante reemplazos de texto en `boot/grub/grub.cfg` (`BOOT_MENU_EDITS`).
- Selección de compresión squashfs: `auto` (detectada del original), `zstd`, `gzip` o `xz` (`SQUASH_COMPRESSION`).
- Entrega del artefacto a Google Drive (`MyDrive/CubicColab`) con sidecar `.sha256` y descarga opcional por navegador (`OUTPUT`).
- Verificación SHA-256 contra el `SHA256SUMS` oficial de la distribución de origen.
- Manejo de ISOs con capas squashfs apiladas (p. ej. server), editando la capa de mayor tamaño como hace Cubic.
- No usa GPU: todo el cómputo es CPU y E/S de disco.

## Casos de uso

- Generación de ISOs corporativas preconfiguradas: partiendo de una ISO oficial de Ubuntu Server, se inyectan paquetes internos vía `APT_INSTALL`, ficheros de configuración con `ROOTFS_FILES` y un hostname con `SET_HOSTNAME`, y se obtiene una imagen reproducible entregada a Drive con su `.sha256`.
- Automatización en CI sin privilegios: el uso de `xorriso -osirrox` evita loop-mounts, por lo que el pipeline puede ejecutarse en contenedores restringidos o en el runtime gratuito de Colab, integrándose en un job que publica la ISO como artefacto.
- Creación de imágenes de laboratorio para docencia: se añaden PPAs y kernels HWE con `KERNEL` para que el alumnado arranque en hardware reciente sin pasos manuales posteriores a la instalación.
- Personalización de branding en entornos educativos o de empresa: `BOOT_MENU_EDITS` renombra entradas de GRUB y `ROOTFS_FILES` sustituye fondos y scripts de bienvenida, conservando intacto el layout de arranque BIOS/UEFI.
- Validación de pipelines de remasterización: la celda de verificación compara el informe El Torito y el contenido del ESP byte a byte, lo que sirve como test de regresión para cambios en herramientas de empaquetado.
- Reproducción de entornos de arranque para pruebas de compatibilidad: se generan variantes de una misma ISO base con distintos kernels o compresiones squashfs (`zstd`, `xz`, `gzip`) para medir tiempos de arranque y tamaño en máquinas virtuales.
- Recuperación y auditoría de imágenes: la verificación SHA-256 integrada y la regeneración de `md5sum.txt` permiten reconstruir ISOs modificadas manteniendo trazabilidad de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README únicamente aporta una estimación operativa: una ISO de escritorio de unos 6 GB requiere aproximadamente 30 GB de disco de trabajo y entre 40 y 90 minutos en el runtime CPU gratuito de Colab; las variantes server, Lubuntu y Xubuntu son más rápidas y ligeras. No se proporcionan cifras de throughput ni latencia.

## Requisitos de hardware

- VRAM: no aplica; el pipeline no usa GPU.
- CPU: cualquier runtime con Python 3 y privilegios de root dentro del contenedor (Colab los concede). El chroot requiere capacidad de bind-mount, que se intenta best-effort y se omite si el runtime lo prohíbe.
- Disco: alrededor de 30 GB de scratch para una ISO de escritorio de ~6 GB; considerablemente menos para flavours ligeros.
- Dependencias de sistema instaladas automáticamente por la celda 2: `squashfs-tools`, `xorriso`, `grub-pc-bin`, `mtools`, `libarchive-tools`.
- Despliegue: notebook en Google Colab (badge incluido en el README) o script CLI con `sudo python3 cubic_pipeline.py` en cualquier máquina Linux con root.
- GPU recomendadas: no disponible (no aplica).
- Latencia y throughput: no disponibles; solo la estimación de 40 a 90 minutos por ISO de escritorio en CPU de Colab.

## Comparativa con modelos similares

| Herramienta | Enfoque | Interfaz | Requiere loop-mount | Requiere GUI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Asukaa02/cubic-colab` | Remasterización de ISO Ubuntu headless | Notebook Colab + CLI | No (`xorriso -osirrox`) | No | MIT | Hugging Face |
| Cubic (PJ-Singh-Net) | Remasterización de ISO Ubuntu | Aplicación GTK | Sí | Sí | GPL (según proyecto original) | GitHub |
| `xorriso` + `unsquashfs` manual | Remasterización artesanal | CLI | Depende del flujo | No | GPL | Distribuciones Linux |

La comparativa se limita a herramientas de la misma categoría funcional, ya que no existen modelos de IA comparables. No se dispone de datos de rendimiento medidos para Cubic original en las mismas condiciones, por lo que no se puede establecer una comparación cuantitativa de tiempos.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluación como modelo lingüístico carece de sentido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-20), por lo que no hay evidencia de uso comunitario ni de mantenimiento continuado.
- La validación end-to-end documentada se realizó sobre una ISO sintética con layout híbrido de Ubuntu moderno, no sobre todas las flavours listadas; el propio README recomienda probar siempre la ISO en una máquina virtual antes de grabarla.
- El chroot depende de bind-mounts de `/dev`, `/proc` y `/sys`; si el runtime los prohíbe, esos pasos se omiten y algunas personalizaciones (instalación de paquetes que requieren esos pseudo-ficheros) pueden fallar silenciosamente.
- El pipeline asume layout casper + GRUB de Ubuntu >= 20.04; distribuciones con otro esquema de arranque o initramfs no están soportadas según la documentación.
- Consumo de disco elevado: ~30 GB para una ISO de escritorio, lo que puede agotar el almacenamiento del runtime de Colab si no se limpia el directorio de trabajo.
- Riesgo de ISOs no arrancables si la reconstrucción del layout El Torito o del ESP falla; la verificación incluida mitiga pero no elimina este riesgo en orígenes no probados.
- La licencia MIT cubre el código del repositorio, pero la ISO resultante incorpora componentes de Ubuntu y paquetes de terceros cuyas licencias (GPL y otras) deben respetarse al redistribuir.
- Herramienta no oficial, no afiliada al proyecto Cubic ni a Canonical; el autor lo declara explícitamente.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque no aplican a esta categoría de artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Asukaa02/cubic-colab
- Notebook en Colab: https://colab.research.google.com/#file=https://huggingface.co/Asukaa02/cubic-colab/resolve/main/cubic_colab.ipynb
- Proyecto Cubic original (inspiración): https://github.com/PJ-Singh-Net/Cubic
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, demos o documentación adicional.
