# danielsaldana/AFCI_part16

## Resumen

AFCI_part16 no es un modelo de lenguaje ni una red neuronal entrenada: es el decimosexto repositorio de un kit de desarrollo offline para un sistema de deteccion de arcos electricos (AFCI, *arc-fault circuit interrupter*) orientado a la prevencion de incendios electricos. El repositorio contiene exclusivamente instaladores oficiales de las herramientas de desarrollo de STMicroelectronics para Windows x64 (STM32CubeIDE 2.2.0, STM32CubeMX 6.18.1, STM32CubeProgrammer y el driver ST-LINK), espejados sin modificaciones para permitir la instalacion en equipos sin conexion a internet.

El sistema completo al que pertenece este repositorio sigue la cadena de procesado: sensor de corriente, ADC con DMA del STM32F407, extraccion de caracteristicas FFT/STFT, una red neuronal cuantizada (DNN) ejecutada en el microcontrolador y, finalmente, la orden de disparo del interruptor. El entrenamiento se realiza en un PC con Windows 10/11 x64 y Python en CPU, sin GPU.

Su relevancia es practica: facilita la reproducibilidad de un entorno de desarrollo TinyML embebido en escenarios con conectividad limitada o air-gapped, donde descargar los instaladores desde st.com no es viable. Los ficheros superiores a 100 MB estan divididos en partes (`*.part001`, `*.part002`, ...) que se reconstruyen con los scripts incluidos y se verifican contra `SHA256SUMS.txt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de instaladores, no modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el kit completo contempla una DNN cuantizada para STM32, pero este repositorio no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | other (cada fichero conserva la licencia de STMicroelectronics: SLA0048 para herramientas, SLA0044 para firmware) |
| Formato de pesos | no aplica (ficheros `.exe`, `.zip` y `.md`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal en este repositorio. El contenido son cuatro artefactos de software de STMicroelectronics y una guia de instalacion:

- `01_STM32CubeIDE/stm32cubeide_2.2.0-Win-x86_64.exe.zip` (848,2 MB, dividido en 9 partes): IDE basado en Eclipse con GCC, sistema de build y depuracion ST-LINK.
- `02_STM32CubeMX/SetupSTM32CubeMX-6.18.1-Win-x86_64.zip` (550,1 MB, 6 partes): configuracion de pines, reloj y perifericos, con generacion de codigo. Desde la version 2.x de CubeIDE es una instalacion separada; requiere el paquete F4 del repositorio Part 17 y el pack X-CUBE-AI del Part 18, instalados con la opcion *From Local*.
- `03_STM32CubeProgrammer/SetupSTM32CubeProgrammer_win64.zip` (186,7 MB, 2 partes): grabacion, borrado y gestion de option bytes, con GUI y CLI `STM32_Programmer_CLI`, ademas de actualizacion de firmware del ST-LINK.
- `04_ST-LINK_USB_driver/stsw-link009.zip` (5,1 MB): driver USB; debe instalarse ejecutando `stlink_winusb_install.bat` como administrador antes de conectar la placa.
- `INSTALLATION_GUIDE.md` (20,7 KB): guia completa del kit (partes 1 a 19).

El orden de instalacion documentado es: driver ST-LINK, CubeIDE, CubeMX (con los paquetes de Part 17 y Part 18) y CubeProgrammer. La reconstruccion de los ficheros divididos se hace con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), ambos con verificacion SHA-256.

## Capacidades

- Instalacion offline completa de la cadena de herramientas STM32 en Windows 10/11 x64.
- Configuracion de pines, reloj y perifericos del STM32F407 mediante CubeMX y generacion automatica de codigo de inicializacion.
- Compilacion con GCC y depuracion mediante ST-LINK dentro de CubeIDE.
- Grabacion y borrado de memoria flash, gestion de option bytes y actualizacion de firmware del programador ST-LINK mediante GUI y CLI.
- Integracion prevista con X-CUBE-AI (Part 18) para desplegar la DNN cuantizada del detector de arcos.
- Verificacion de integridad de los binarios descargados mediante `SHA256SUMS.txt`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling: no es un modelo de IA.

## Casos de uso

- Puesta a punto de un laboratorio air-gapped: instalacion de toda la cadena STM32 sin acceso a st.com, usando los instaladores espejados y la guia incluida; adecuado para entornos industriales o de defensa con red segmentada.
- Replicacion de un entorno de desarrollo en varios puestos: el mismo conjunto de versiones fijas (CubeIDE 2.2.0, CubeMX 6.18.1) garantiza builds reproducibles entre ingenieros y evita divergencias por actualizaciones automaticas.
- Formacion y docencia en sistemas embebidos: el kit permite a los alumnos montar el toolchain completo en sus portatiles Windows sin depender de la red del aula.
- Desarrollo del firmware AFCI sobre STM32F407: configuracion del ADC y el DMA para la adquisicion del sensor de corriente y generacion del esqueleto de codigo para el calculo de FFT/STFT.
- Despliegue de la DNN cuantizada en el microcontrolador: combinado con X-CUBE-AI (Part 18) y el paquete F4 (Part 17), permite convertir y ejecutar el modelo de deteccion de arcos en el dispositivo final.
- Recuperacion de un puesto de trabajo ante corrupcion o perdida de instaladores: los scripts de reconstruccion y las sumas SHA-256 permiten regenerar los binarios originales a partir de las partes descargadas.
- Auditoria de cadena de suministro: al conservar los ficheros tal como se descargaron de myST y publicar sus hashes, se puede verificar que los instaladores no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable; las metricas de deteccion de arcos corresponderian al sistema AFCI completo (partes 1 a 19) y no se documentan en la informacion proporcionada.

## Requisitos de hardware

- Almacenamiento: 1,7 GB de repositorio; se recomienda reservar al menos 5-6 GB libres para los instaladores reconstruidos y la instalacion de CubeIDE, CubeMX y CubeProgrammer.
- Sistema operativo: Windows 10/11 x64 (unico objetivo declarado para las herramientas). La reconstruccion de partes tambien puede hacerse en Linux/macOS con `join_parts.sh`, pero la instalacion de las herramientas ST es para Windows.
- CPU: no se especifica; el entrenamiento del kit completo se plantea en CPU, sin GPU.
- GPU: no aplica. No se requiere CUDA ni aceleracion grafica.
- Placa objetivo: STM32F407 con ST-LINK; el driver USB debe instalarse como administrador antes de conectar la placa.
- Opciones de despliegue: instalacion nativa en Windows; no hay soporte de contenedores, vLLM, llama.cpp, Ollama ni TGI (no aplica a este contenido).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Version | Licencia | Uso |
|---|---|---|---|---|
| AFCI_part16 (este) | CubeIDE, CubeMX, CubeProgrammer, driver ST-LINK | 2.2.0 / 6.18.1 / ultima a 2026-11 | SLA0048 / SLA0044 (ST) | Instalacion offline del toolchain STM32 |
| AFCI_part17 | Paquete de soporte STM32F4 | no disponible en la informacion | ST | Requerido por CubeMX para el F407 |
| AFCI_part18 | Pack X-CUBE-AI | no disponible en la informacion | ST | Conversion y despliegue de la DNN cuantizada |
| AFCI_part6 | Indice maestro y guia de instalacion | no disponible | ST / del autor | Punto de entrada del kit completo |

No se dispone de informacion sobre alternativas externas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni usarse para inferencia; es un espejo de instaladores de terceros.
- Licencia: cada fichero conserva la licencia de STMicroelectronics (SLA0048 para herramientas, SLA0044 para firmware). La instalacion implica la aceptacion de dichos acuerdos; el uso comercial esta sujeto a los terminos de ST, no a una licencia permisiva del autor del repositorio.
- Riesgo de cadena de suministro: aunque se publican sumas SHA-256, conviene contrastar los hashes con los de st.com antes de instalar en produccion.
- Dependencia de versiones: CubeIDE 2.2.0 y CubeMX 6.18.1 son versiones fijas; proyectos creados con versiones mas recientes pueden no abrirse o requerir migracion.
- Dependencia de otros repositorios: sin Part 17 (paquete F4) y Part 18 (X-CUBE-AI) el flujo de generacion y despliegue del modelo no esta completo.
- Solo Windows x64 para las herramientas: no hay instaladores para Linux ni macOS en este repositorio.
- Ficheros divididos: es obligatorio ejecutar los scripts de union y verificar `SHA256SUMS.txt`; unir las partes manualmente puede producir binarios corruptos.
- El driver ST-LINK debe instalarse como administrador y antes de conectar la placa; de lo contrario el dispositivo puede no enumerarse correctamente.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto o idioma porque no aplican a este contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielsaldana/AFCI_part16
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Guia de instalacion: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_INSTALLATION_GUIDE.md
- STMicroelectronics (origen de los instaladores): https://www.st.com
