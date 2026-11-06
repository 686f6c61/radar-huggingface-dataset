# danielsaldana/AFCI_part19

## Resumen

AFCI_part19 no es un modelo de lenguaje ni una red neuronal entrenada, sino un repositorio de distribucion de software de STMicroelectronics empaquetado para instalacion offline. Forma parte de un kit de desarrollo de 19 repositorios (AFCI_part1 a AFCI_part19) orientado a construir un sistema de deteccion de fallos de arco electrico (AFCI, arc-fault circuit interrupter) y prevencion de incendios electricos sobre un microcontrolador STM32F407. El flujo de trabajo descrito por el autor encadena un sensor de corriente, la adquisicion por ADC y DMA del STM32F407, la extraccion de caracteristicas mediante FFT/STFT y una red neuronal profunda cuantizada que decide el disparo (trip) del interruptor.

Este repositorio concreto contiene exclusivamente herramientas de linea de comandos y de monitorizacion de ST: STM32CubeCLT 1.22.0 (toolchain GNU Arm de ST, servidor GDB para ST-LINK, CubeProgrammer CLI, CMake, Ninja y ficheros SVD), STM32CubeMonitor 1.13.0 (paneles en vivo de variables del firmware), STM32CubeMonitor-Power (medicion de consumo con el shield X-NUCLEO-LPM01A) y STM32CubeMonitor-UCPD (monitor de USB Power Delivery, no necesario para el STM32F407). Los ficheros se ofrecen como espejo sin modificar de las descargas originales de st.com, divididos en partes de menos de 100 MB con scripts de reconstruccion y verificacion SHA256.

Su relevancia es practica y de nicho: permite montar un entorno de desarrollo TinyML completamente aislado de red sobre Windows 10/11 x64 con CPU unicamente, algo util en entornos industriales o docentes con conectividad restringida. No aporta pesos, arquitectura de red ni datos de entrenamiento; el valor tecnico esta en la reproducibilidad del entorno de compilacion y depuracion del firmware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de herramientas de desarrollo, no es un modelo neuronal) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el kit menciona una DNN cuantizada en el pipeline, pero no se incluye en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other (cada fichero conserva la licencia de ST: SLA0048 para herramientas, SLA0044 para firmware) |
| Formato de pesos | no disponible (los artefactos son instaladores .exe y archivos .zip) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo en este repositorio. El contenido son cuatro artefactos binarios de software propietario de STMicroelectronics: `stm32cubeclt_1.22.0-Win-x86_64.exe.zip` (910,7 MB, dividido en 10 partes), `STM32CubeMonitor_win.zip` (148,2 MB, 2 partes), `CubeMonPwr-Win.zip` (55,0 MB) y `stm32cubemonucpd-win.zip` (60,2 MB). El repositorio completo ocupa 1,2 GB y los ficheros grandes se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), que ademas validan la integridad contra `SHA256SUMS.txt`.

El contexto tecnico del kit global describe un pipeline de inferencia en el borde: muestreo de corriente por ADC con DMA en un STM32F407, calculo de caracteristicas espectrales (FFT/STFT) y clasificacion mediante una DNN cuantizada que decide el disparo. El entrenamiento se plantea en un PC offline con Windows 10/11 x64 y Python sobre CPU. Este repositorio aporta la cadena de compilacion (GNU Arm, CMake, Ninja, SVD) y la instrumentacion en vivo (CubeMonitor sobre ST-LINK), no el modelo ni el dataset.

## Capacidades

- Distribucion offline de la cadena de herramientas STM32CubeCLT 1.22.0: compilador GNU Arm, ST-LINK GDB server, CubeProgrammer CLI, CMake, Ninja y ficheros SVD para compilar y depurar desde VS Code o scripts.
- Monitorizacion en vivo con STM32CubeMonitor 1.13.0 de variables del firmware (datos de ADC, probabilidad de arco, estado de disparo) a traves de ST-LINK.
- Medicion de consumo energetico con STM32CubeMonitor-Power y el shield X-NUCLEO-LPM01A.
- Monitorizacion de USB Power Delivery con STM32CubeMonitor-UCPD (no aplicable al STM32F407).
- Reconstruccion y verificacion de integridad de los ficheros divididos mediante scripts incluidos y sumas SHA256.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Desarrollo de firmware AFCI en entornos sin red: el kit permite instalar toolchain, GDB server y programador CLI desde un espejo local, de modo que un laboratorio aislado puede compilar y flashear el firmware del STM32F407 sin acceso a st.com.
- Depuracion desde VS Code o CI local: STM32CubeCLT aporta CMake, Ninja y el servidor GDB de ST-LINK, lo que permite automatizar compilacion y sesiones de depuracion por script en un pipeline interno.
- Validacion en banco de la deteccion de arcos: STM32CubeMonitor muestra en tiempo real la probabilidad de arco y el estado de disparo calculados por la DNN cuantizada, lo que facilita ajustar umbrales durante las pruebas con cargas inductivas.
- Docencia y replicabilidad: al fijar versiones concretas (CubeCLT 1.22.0, CubeMonitor 1.13.0) y verificar con SHA256, un curso o un equipo puede reproducir exactamente el mismo entorno meses despues.
- Analisis de consumo energetico del nodo: con el shield X-NUCLEO-LPM01A y CubeMonitor-Power se puede perfilar el consumo del STM32F407 en modo medida y en modo disparo, dato critico si el dispositivo final va alimentado por bateria o por la propia linea.
- Auditoria de cadena de suministro: los scripts de union y las sumas SHA256 permiten verificar que los binarios espejo coinciden con los publicados por ST antes de instalarlos en una maquina de produccion.
- Preparacion de un entorno de formacion en ciberseguridad industrial: al ser todo offline y CPU-only, se puede desplegar en aulas con maquinas sin salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo neuronal, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Espacio en disco: 1,2 GB para el repositorio descargado y aproximadamente 1,1 GB adicionales tras reconstruir los cuatro artefactos, mas el espacio de instalacion de cada herramienta de ST.
- Sistema operativo: Windows 10/11 x64 exclusivamente para los instaladores incluidos; los scripts de union funcionan tambien en Linux/macOS con bash.
- CPU: no se especifica requisito minimo; el kit declara entrenamiento e inferencia de desarrollo en CPU sin GPU.
- VRAM: no aplica, no hay inferencia de modelos en este repositorio.
- GPU: no requerida ni soportada por estas herramientas.
- Hardware de destino: placa STM32F407 con ST-LINK para depuracion y monitorizacion; shield X-NUCLEO-LPM01A opcional para medicion de potencia.
- Opciones de despliegue: instalacion nativa de los .exe de ST; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AFCI_part19 (este repositorio) | Espejo offline de herramientas ST | no aplica | no aplica | other (SLA0048/SLA0044) | Solo Windows x64; requiere reconstruir partes |
| Descarga directa desde st.com (myST) | Distribucion oficial | no aplica | no aplica | Acuerdos de ST | Requiere cuenta y conexion; siempre version vigente |
| STM32CubeIDE | IDE integrado de ST | no aplica | no aplica | Acuerdos de ST | Alternativa a CubeCLT para compilar y depurar; el autor lo indica como sustituto valido |
| Toolchain GNU Arm generico (arm-none-eabi) | Cadena de compilacion abierta | no aplica | no aplica | GPL y otras licencias libres | No incluye GDB server de ST-LINK ni CubeProgrammer |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuracion de arquitectura ni dataset; cualquier evaluacion como modelo de lenguaje carece de sentido.
- El repositorio no incluye la DNN cuantizada ni el codigo del pipeline AFCI; solo herramientas de ST. El firmware y el modelo deben obtenerse de otras partes del kit (el indice maestro esta en AFCI_part6).
- Licencia "other": los binarios estan sujetos a los acuerdos de licencia de STMicroelectronics (SLA0048 para herramientas, SLA0044 para firmware), que el usuario acepta al instalar. Es obligatorio revisar las condiciones de uso comercial de ST antes de desplegar en producto.
- El espejo puede quedar desactualizado respecto a st.com; no hay garantia de actualizaciones ni de soporte por parte del autor del repositorio.
- Dependencia de Windows x64 para los instaladores; no hay paquetes para Linux ni macOS en este repositorio.
- Ficheros divididos en partes de menos de 100 MB: una descarga incompleta o un script de union fallido deja los instaladores inutilizables, aunque la verificacion SHA256 lo detecta.
- Sin descargas ni likes registrados y creado en 2026, no hay evidencia de uso en produccion ni de validacion por terceros.
- El contenido del repositorio es software de terceros redistribuido; la responsabilidad sobre integridad y ausencia de modificaciones recae en el autor del espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danielsaldana/AFCI_part19
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Guia de instalacion: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_INSTALLATION_GUIDE.md
- STMicroelectronics (origen de los binarios): https://www.st.com
- STM32CubeCLT: https://www.st.com/en/development-tools/stm32cubeclt.html
- STM32CubeMonitor: https://www.st.com/en/development-tools/stm32cubemonitor.html
