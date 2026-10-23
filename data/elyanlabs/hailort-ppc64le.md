# elyanlabs/hailort-ppc64le

## Resumen

`elyanlabs/hailort-ppc64le` no es un modelo de inteligencia artificial, sino un repositorio de parches y scripts de compilación que porta el SDK HailoRT (Hailo-8) a la arquitectura IBM POWER8/POWER9 en ppc64le. El artefacto publicado en Hugging Face es una copia instantánea del código fuente alojado en github.com/Scottcjn/hailort-ppc64le y en gitlab.com/elyan-labs/hailort-ppc64le, mantenido por Scott Boudreaux / Elyan Labs. Su función es permitir que un acelerador Hailo-8 de 26 TOPS, que normalmente se usa en hosts x86_64 o arm64, pueda enumerarse y ejecutar inferencia sobre un servidor PowerPC de 64 bits little endian, como un IBM Power System S824 con Ubuntu 20.04.

El port se limita a dos parches: uno añade los objetivos Rust `powerpc64le-unknown-linux-gnu` y `ppc64` al compilar la librería de tokenizers, y otro incorpora ppc64le a la lista de plataformas de los wheels de Python. Según el autor, el driver de kernel no requiere cambios de endianness porque usa `ioread32`/`iowrite32`, funciones seguras para MMIO PCIe, y el código de cuantización de la librería de usuarios solo emplea SIMD x86 en Windows con MSVC, mientras que en Linux recurre a `rintf()` portable.

La relevancia actual es acotada pero concreta: la rama `hailo8` de HailoRT (versión 4.23.0) es la línea terminal de soporte para Hailo-8, y la rama `master` upstream solo atiende Hailo-10/15, por lo que cualquier trabajo de mantenimiento sobre Hailo-8 queda congelado en esa rama. Además, la validación end-to-end está pendiente: el autor reconoce que el primer `hailortcli fw-control identify` sobre el S824 aún no se ha ejecutado y que el riesgo esperado está en la DMA/IOMMU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. El artefacto es un conjunto de parches (`.patch`) y un script de build para portar HailoRT a ppc64le |
| Parámetros totales | No disponible (no es un modelo de lenguaje) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No disponible. El README solo indica que el código de cuantización usa `rintf()` portable en Linux y SIMD x86 únicamente en Windows/MSVC |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 según la etiqueta de Hugging Face; el README declara MIT tanto para HailoRT como para los parches (discrepancia sin resolver) |
| Formato de pesos | HEF (Hailo Executable Format) para los modelos compilados del zoo; el repositorio en sí contiene parches `.patch` y scripts de shell |
| Versión de HailoRT objetivo | 4.23.0, rama `hailo8` (línea terminal de Hailo-8) |
| Hardware acelerador | Hailo-8, 26 TOPS, tarjeta M.2 o PCIe |
| Arquitectura anfitriona | ppc64le (POWER8/POWER9) |
| Toolchain requerido | CMake 3.14+, GCC 8+, Rust/Cargo, cabeceras de kernel |
| Estado de validación | Pendiente: parches verificados contra la rama `hailo8`; `hailortcli fw-control identify` no ejecutado todavía en S824 |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red en este artefacto. Lo que hay es una capa de portabilidad sobre el SDK propietario-abierto de Hailo. Concretamente, `build-ppc64le.sh` clona las ramas `hailo8` de `hailo-ai/hailort` y `hailo-ai/hailort-drivers`, rechaza continuar si el checkout es de `master` y aplica dos parches: `01-tokenizers-ppc64le.patch`, que añade los targets Cargo de ppc64le/ppc64 a la configuración de CMake de tokenizers-cpp, y `02-python-ppc64le-platform.patch`, que añade ppc64le a la lista de plataformas de los wheels de Python. El resto del build es estándar: `make all` e `install` para el driver PCIe en `hailort-drivers/linux/pcie`, `cmake -DCMAKE_BUILD_TYPE=Release` para la librería, y `pip install -e .` para los bindings.

El detalle técnico más interesante del README es el análisis de DMA/IOMMU en PowerNV/PHB3. El driver solicita primero una máscara DMA de 64 bits en `linux/vdma/vdma.c`, lo que mapea la ventana de bypass de TCE en `1<<59`; algunos endpoints PCIe de clase consumidor no pueden direccionar esos bits altos aunque declaren soporte de 64 bits, y el síntoma es un fallo silencioso de transferencia o un evento `EEH: Frozen PHB` en dmesg. Las mitigaciones propuestas son, en orden: probar el driver de serie monitorizando `dmesg -w` durante `hailortcli scan`; arrancar con `iommu=nobypass` para forzar DMA traducida por la ventana TCE; y, si hace falta, un parche de una línea que empiece en `DMA_BIT_MASK(48)` en ppc64le dentro de `vdma.c`, que el autor identifica como la contribución potencialmente upstream-worthy de este port.

Sobre el flujo de modelos, el README aclara que Hailo Dataflow Compiler es exclusivamente x86_64, pero que rara vez se necesita en el host POWER: la línea v2.x del model zoo publica HEFs precompilados (YOLOv8/v10/v11, clasificación, segmentación, pose, profundidad; Whisper tiny/base vía hailo-whisper). Los HEF son blobs opacos sin dependencia de la arquitectura anfitriona, de modo que se compilan en cualquier máquina x86 y se copian al sistema POWER, emparejando HEFs del zoo 2.x con HailoRT 4.2x.

## Capacidades

- Ejecución de inferencia sobre Hailo-8 (26 TOPS) en hosts ppc64le, algo que el SDK upstream no soporta de fábrica.
- Compilación del driver de kernel PCIe en kernels dentro del rango de compatibilidad declarado, 2.6.22–6.13 (la ventana validada es 5.4).
- Construcción de la librería HailoRT con CMake en modo Release y de los bindings de Python mediante `pip install -e .`.
- Soporte de tokenizers en Rust para el target `powerpc64le-unknown-linux-gnu`, necesario para los pipelines que tokenizan texto en el host.
- Despliegue de modelos precompilados del zoo v2.x: detección de objetos (YOLOv8, v10, v11), clasificación, segmentación, estimación de pose, profundidad y reconocimiento de voz (Whisper tiny/base con hailo-whisper).
- Script `build-ppc64le.sh` que automatiza clonado de ramas correctas, verificación del checkout y aplicación de parches.
- Diagnóstico de problemas de enumeración PCIe en POWER mediante `iommu=nobypass` y, como alternativa, el script de rescan PCIe `oculink-gpu-bypass`.
- No ofrece tool calling, function calling, razonamiento multi-paso ni modo thinking: no es un modelo generativo.

## Casos de uso

- **Visión artificial sobre servidores POWER ya amortizados**: un IBM Power System S824 con Ubuntu 20.04 ppc64le puede añadir un Hailo-8 M.2 de 26 TOPS mediante un adaptador pasivo M.2 a PCIe x4 y ejecutar HEFs de YOLOv8/v11 para detección de objetos, evitando retirar hardware que de otro modo quedaría sin acelerador compatible.
- **Reconocimiento de voz en el host POWER**: con HEFs de Whisper tiny/base del zoo v2.x (hailo-whisper), el sistema puede transcribir audio sin GPU dedicada, siempre que los HEFs se correspondan con HailoRT 4.2x.
- **Compilación cruzada x86 → POWER en pipelines de CI**: el Dataflow Compiler solo funciona en x86_64, así que el flujo realista es compilar el `.hef` en una máquina x86 y copiarlo al host ppc64le; este repositorio documenta exactamente ese patrón y la correspondencia de versiones zoo/HailoRT.
- **Segmentación y estimación de profundidad en entornos industriales**: HEFs de segmentación, pose y depth del zoo v2.x permiten montar inspección visual o análisis de escena en un nodo ppc64le sin depender de CUDA.
- **Laboratorios de investigación en arquitecturas no x86**: el port sirve para estudiar el comportamiento de aceleradores de borde en PowerNV/PHB3, incluyendo el análisis de ventanas TCE y máscaras DMA que el README describe con detalle.
- **Archivo y mantenimiento de la línea Hailo-8**: al ser la rama `hailo8` (4.23.0) la línea terminal, este repositorio actúa como referencia de compilación reproducible para quien necesite seguir usando Hailo-8 cuando upstream ya solo mantiene Hailo-10/15 en `master`.
- **Automatización de despliegue en flotas ppc64le**: el script `build-ppc64le.sh` se puede integrar en aprovisionamiento de imágenes (por ejemplo, plantillas de Ubuntu 20.04 ppc64le) para dejar el driver y los bindings compilados de forma consistente.
- **Diagnóstico de problemas PCIe en POWER**: las notas sobre `EEH: Frozen PHB`, `iommu=nobypass` y el parche a `DMA_BIT_MASK(48)` sirven como guía de resolución de incidencias para cualquier endpoint PCIe problemático en PowerNV, no solo para Hailo-8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El README declara 26 TOPS como especificación teórica del acelerador Hailo-8, pero no aporta métricas medidas de latencia, throughput ni precisión. El autor indica explícitamente que la sección de hardware objetivo pasará de "validation pending" a "Tested" cuando el primer `hailortcli fw-control identify` tenga éxito, y que solo entonces se publicarán números de benchmark. Las descargas y likes del repositorio en Hugging Face son 0, lo que es coherente con un artefacto sin validación pública todavía.

## Requisitos de hardware

- **Host**: sistema POWER8 o POWER9 en ppc64le; el objetivo declarado y aún no validado es un IBM Power System S824 (POWER8) con Ubuntu 20.04 ppc64le y kernel 5.4. También se contempla RHEL 8 o superior.
- **Acelerador**: tarjeta Hailo-8 M.2 o PCIe de 26 TOPS; el montaje descrito usa un adaptador pasivo M.2 a PCIe x4. Se requiere una ranura PCIe con alimentación suficiente.
- **VRAM**: no aplica en el sentido de GPU; la memoria de trabajo del modelo reside en el acelerador y el HEF es un blob opaco. No se publican cifras de memoria.
- **GPU**: no se requiere GPU para inferencia. Sí se necesita una máquina x86_64 para el Hailo Dataflow Compiler si se van a compilar modelos propios.
- **Toolchain en el host**: cabeceras de kernel para compilar el driver, CMake 3.14+, GCC 8+ y Rust/Cargo para tokenizers.
- **Kernel**: la ventana de compatibilidad del driver es 2.6.22–6.13; el caso probado es 5.4.
- **IOMMU**: en PowerNV/PHB3 hay que vigilar `dmesg -w` durante el escaneo; puede ser necesario arrancar con `iommu=nobypass` o aplicar un parche para empezar en `DMA_BIT_MASK(48)`.
- **Despliegue**: compilación nativa desde fuente (CMake + `make install` para driver y librería, `pip install -e .` para bindings). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- **Latencia y throughput**: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Criterio | hailort-ppc64le (este repositorio) | HailoRT upstream, rama `hailo8` | HailoRT upstream, rama `master` |
|---|---|---|---|
| Tipo de artefacto | Parches y script de build sobre HailoRT | SDK completo de Hailo | SDK completo de Hailo |
| Arquitecturas soportadas | ppc64le añadido a x86_64/arm64 de base | x86_64 y arm64 | x86_64 y arm64 |
| Hardware acelerador | Hailo-8 (26 TOPS) | Hailo-8 | Hailo-10 / Hailo-15 |
| Versión de referencia | HailoRT 4.23.0 (`hailo8`) | HailoRT 4.23.0, línea terminal | Línea activa Hailo-10/15 |
| Compatibilidad de HEFs | Zoo v2.x (YOLOv8/v10/v11, Whisper tiny/base) | Zoo v2.x | Zoo v5.x |
| Licencia | AGPL-3.0 en la etiqueta de HF; MIT declarada en el README | MIT | MIT |
| Estado de validación | Pendiente (`fw-control identify` no ejecutado) | Soportado oficialmente | Soportado oficialmente |
| Mantenimiento | Un solo autor, sin CI declarada | Mantenido por Hailo | Mantenido por Hailo |

Como referencia de categoría, otros aceleradores de borde con soporte de inferencia en hosts no x86 (Coral Edge TPU, NVIDIA Jetson) no se han podido comparar con datos de la información proporcionada; no disponible.

## Limitaciones y advertencias

- **No es un modelo**: la ficha de Hugging Face no contiene pesos ni pipeline de inferencia; es una copia de código fuente. Cualquier expectativa de generación de texto o de uso como LLM es incorrecta.
- **Validación incompleta**: el propio autor indica que el primer `hailortcli fw-control identify` en el S824 está pendiente. Los parches están verificados como aplicables, no como funcionales en hardware real.
- **Riesgo DMA/IOMMU**: la solicitud de máscara DMA de 64 bits puede provocar fallos silenciosos de transferencia o `EEH: Frozen PHB` en PowerNV/PHB3 con endpoints que no direccionan los bits altos; requiere las mitigaciones descritas y monitorización de dmesg.
- **Discrepancia de licencia**: la etiqueta de Hugging Face declara AGPL-3.0, mientras que el README afirma que tanto HailoRT como los parches son MIT. Es un conflicto sin resolver que conviene aclarar antes de cualquier uso comercial o de redistribución.
- **Dependencia de binarios opacos**: los HEF son blobs precompilados sin dependencia de arquitectura, pero su contenido no es auditable ni modificable sin el Dataflow Compiler, que es x86_64-only.
- **Emparejamiento estricto de versiones**: usar HEFs del zoo 5.x (Hailo-10/15) con HailoRT 4.2x no funcionará; hay que ceñirse al zoo 2.x.
- **Línea terminal**: la rama `hailo8` (4.23.0) ya no recibe desarrollo upstream, de modo que no cabe esperar correcciones de seguridad o de compatibilidad con kernels futuros por parte de Hailo.
- **Madurez del proyecto**: 0 descargas, 0 likes, un único mantenedor, sin resultados de benchmarks publicados y con la insignia "BCOS Certified" sin verificación independiente en la información disponible.
- **Sesgos y alucinaciones**: no aplica al repositorio, pero los modelos del zoo que se ejecuten sobre él heredan los sesgos y errores de sus propios datasets de entrenamiento, no documentados aquí.
- **Idiomas**: no disponibles; el soporte multilingüe dependerá de los HEFs concretos (por ejemplo, Whisper tiny/base) y no del port.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/hailort-ppc64le
- Repositorio GitHub: https://github.com/Scottcjn/hailort-ppc64le
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/hailort-ppc64le
- HailoRT upstream: https://github.com/hailo-ai/hailort
- Driver de Hailo upstream: https://github.com/hailo-ai/hailort-drivers
- Documentación de Hailo: https://hailo.ai/developer-zone/
- Script de rescan PCIe alternativo: https://github.com/Scottcjn/oculink-gpu-bypass
- Perfil del autor: https://github.com/Scottcjn
- BoTTube (ecosistema Elyan Labs): https://bottube.ai
- RustChain (ecosistema Elyan Labs): https://rustchain.org
- Certificación BCOS: archivo `BCOS.md` dentro del repositorio
