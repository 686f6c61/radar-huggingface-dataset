# danielsaldana/AFCI_part2

## Resumen

AFCI_part2 no es un modelo de lenguaje ni una red neuronal entrenada, sino la segunda entrega de un kit de desarrollo offline para construir un sistema de deteccion de arcos electricos (AFCI, arc-fault circuit interrupter) orientado a la prevencion de incendios electricos. El repositorio, publicado por el usuario danielsaldana en HuggingFace, contiene exclusivamente un conjunto de herramientas de cadena de compilacion y desarrollo para Windows 10/11 x64: compilador ARM GCC, OpenOCD, stlink-tools, CMake, Ninja, Python 3.12, VS Code con extensiones, ngspice y ficheros SVD del STM32F407. No incluye pesos, checkpoints ni artefactos de inferencia.

El sistema completo al que pertenece esta pieza se describe en la model card como una cadena de procesamiento que va desde un sensor de corriente hasta una decision de disparo (trip), pasando por la adquisicion ADC+DMA en un STM32F407, la extraccion de caracteristicas mediante FFT/STFT y una red neuronal cuantizada (DNN) ejecutada en el microcontrolador. El objetivo declarado es el entrenamiento en CPU sin conexion, en un PC Windows aislado, lo que encaja con entornos de laboratorio electrico o industrial donde no se permite acceso a internet.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: no hay parametros, contexto, benchmarks ni capacidades de generacion. Resulta util, en cambio, como referencia de infraestructura para quien quiera reproducir el pipeline AFCI descrito, o como ejemplo de publicacion en HuggingFace de material auxiliar (toolchains, binarios, datasets de soporte) en lugar de pesos. El tamano del repositorio es de 1,0 GB y las descargas y likes registrados son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; es un kit de herramientas) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible en este repositorio; la model card menciona una DNN cuantizada en el sistema completo, sin especificar esquema |
| Idiomas soportados | no disponible (las herramientas incluidas son en ingles; no hay modelo linguistico) |
| Licencia | other (cada fichero conserva la licencia de su editor original: GPL, BSD-3, BSD, Apache-2.0, PSF, MIT, LGPL) |
| Formato de pesos | no disponible (no hay pesos; el contenido son .zip, .msi, .exe, .vsix, .svd y .7z) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal. Su contenido es un conjunto de 32 ficheros (919,6 MB declarados, 1,0 GB de repo) organizados en ocho carpetas: `01_ARM_GCC_toolchain` (xPack GNU Arm Embedded GCC 15.2.1 para Cortex-M4F con `-mcpu=cortex-m4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard`), `02_Flash_Debug` (OpenOCD 0.12.0-7, stlink 1.9.0, Zadig 2.9), `03_Build_tools` (CMake 4.4.5, Ninja 1.13.2, xPack Windows Build Tools 4.4.1, Git 2.56), `04_Python` (Python 3.12.10 x64), `05_VSCode_and_extensions` (VS Code 1.144 y 18 extensiones en formato VSIX), `06_Utilities` (7-Zip 26.05, PuTTY 0.85), `07_SVD_files` (STM32F407.svd y STM32F405.svd) y `08_Circuit_simulation` (ngspice 47 de 64 bits).

Respecto al entrenamiento, la model card indica que el sistema AFCI se entrena en CPU con Python en un PC Windows offline, y que el modelo resultante es una DNN cuantizada que se ejecuta en el STM32F407 tras la extraccion de caracteristicas FFT/STFT sobre la senal de corriente. No se especifican tokens, composicion del dataset, tecnicas de RLHF/DPO ni innovaciones de atencion, porque no se trata de un transformer. Los ficheros de mas de 100 MB se dividen en piezas `.part001`, `.part002`, etc., que se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS) y se verifican contra `SHA256SUMS.txt`.

## Capacidades

- Distribucion offline de una cadena de compilacion ARM completa para Cortex-M4F, sin dependencia de STM32CubeIDE ni de instaladores de ST que requieren cuenta myST.
- Flasheo y depuracion del STM32F407 mediante ST-LINK usando OpenOCD y stlink-tools, con Zadig como alternativa de driver WinUSB.
- Compilacion de proyectos generados por CubeMX en formato Makefile o CMake mediante CMake, Ninja y make.
- Entorno Python 3.12.10 para entrenamiento en CPU, pensado para combinarse con las ruedas (wheels) de las partes 4 y 5 del kit.
- Depuracion integrada en VS Code con Cortex-Debug, visualizacion de perifericos y memoria, y vista de registros mediante los ficheros SVD del STM32F407/F405.
- Simulacion SPICE del front-end analogico del sensor de corriente (transformador de corriente o integrador Rogowski y filtro anti-alias) con ngspice 47.
- Terminal serie (PuTTY) para registro UART de los datos de ADC durante la puesta a punto.
- No incluye: pesos de modelo, tokenizador, pipeline de HuggingFace, tool calling, agentes, capacidades multimodales ni generacion de texto.

## Casos de uso

- Reproduccion del pipeline AFCI en un laboratorio aislado: descargar el repositorio completo, ejecutar el script de union de partes, verificar los SHA256 y disponer de un entorno de compilacion ARM funcional sin acceso a internet, lo que es adecuado para entornos donde no se permite descargar software desde la red.
- Desarrollo de firmware para STM32F407 en un PC Windows sin instalacion de STM32CubeIDE: la cadena VS Code + CMake + GCC + OpenOCD permite editar, compilar y depurar el firmware de adquisicion ADC+DMA y el motor de inferencia de la DNN cuantizada.
- Depuracion a nivel de registro del ADC y del temporizador: los ficheros SVD `STM32F407.svd` y `STM32F405.svd` habilitan la vista de perifericos en Cortex-Debug, util para verificar la configuracion de ADC, DMA y TIM durante la captura de corriente.
- Validacion del front-end analogico antes de fabricar la PCB: ngspice 47 permite simular el transformador de corriente, el integrador Rogowski y el filtro anti-alias, comparando la respuesta en frecuencia con la esperada por el algoritmo FFT/STFT.
- Formacion de nuevos ingenieros en el flujo de trabajo TinyML sobre Cortex-M4F: el kit proporciona un entorno reproducible (versiones fijas de GCC 15.2.1, OpenOCD 0.12.0-7, CMake 4.4.5) que reduce la variabilidad entre maquinas.
- Registro y analisis de senales en banco de pruebas: con PuTTY y el firmware de adquisicion se puede volcar por UART la traza de ADC para etiquetar eventos de arco electrico y construir el conjunto de entrenamiento de la DNN.
- Preparacion de un entorno de entrenamiento Python en CPU sin conexion: el instalador de Python 3.12.10 incluido sirve de base para instalar las ruedas de las partes 4 y 5 del kit y ejecutar el entrenamiento de la DNN cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable y la model card no reporta metricas de deteccion (precision, recall, tasa de falsos positivos) ni latencias del sistema AFCI.

## Requisitos de hardware

- El repositorio en si no requiere GPU: el PC objetivo declarado es Windows 10/11 x64 con entrenamiento en CPU.
- Espacio en disco: al menos 1,0 GB para el repositorio descargado y adicional para los ficheros reconstruidos a partir de las partes divididas.
- Memoria RAM: no especificada; suficiente para ejecutar VS Code, Python 3.12 y CMake en un proyecto de firmware Cortex-M4 (tipicamente 8 GB o mas).
- Hardware de destino del firmware: placa con STM32F407 (Cortex-M4F con FPU de precision simple) y programador ST-LINK.
- Hardware de adquisicion: sensor de corriente (transformador de corriente o Rogowski) conectado al ADC del STM32F407 mediante el front-end analogico simulado en ngspice.
- Despliegue del kit: instalacion local de los binarios incluidos (GCC, OpenOCD, CMake, Ninja, Python, VS Code y extensiones VSIX, ngspice); no hay opcion de despliegue como servicio ni soporte de vLLM, llama.cpp, Ollama o TGI, ya que no existe un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del firmware y de la DNN cuantizada de las otras partes del kit, no de este repositorio.

## Comparativa con modelos similares

| Alternativa | Tipo de contenido | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danielsaldana/AFCI_part2 | Kit de herramientas Windows x64 para AFCI sobre STM32F407 | no aplica | no aplica | other (mixta por fichero) | HuggingFace, 1,0 GB, 0 descargas |
| STM32CubeIDE (STMicroelectronics) | IDE oficial con GCC, depurador y CubeMX integrados | no aplica | no aplica | licencia de ST, requiere cuenta myST | Descarga desde st.com |
| xPack GNU Arm Embedded GCC (xPack) | Toolchain GCC para ARM Cortex-M, distribuible por separado | no aplica | no aplica | GPL | GitHub releases de xPack |
| PlatformIO (PlatformIO Labs) | Entorno de desarrollo y gestion de toolchains para microcontroladores | no aplica | no aplica | Apache-2.0 | Registro de paquetes de PlatformIO |

La comparacion relevante no es con modelos de IA, sino con otras formas de obtener el mismo toolchain. Frente a STM32CubeIDE, este kit evita el inicio de sesion en myST y la aceptacion de la licencia de ST, a costa de una integracion manual y de no incluir CubeMX, CubeProgrammer ni ST Edge AI Core (que la model card remite a la parte 7 del kit como lista de descarga manual).

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no soporta tool calling ni agentes; cualquier evaluacion como modelo de lenguaje carece de sentido.
- Sesgos: no aplica en el sentido estadistico; el riesgo equivalente es la dependencia de versiones fijas de herramientas (GCC 15.2.1, OpenOCD 0.12.0-7, CMake 4.4.5) que pueden quedar obsoletas o presentar vulnerabilidades no corregidas.
- Alucinacion: no aplica; el riesgo real es la integridad de los binarios. La model card incluye `SHA256SUMS.txt` y scripts de verificacion, por lo que se recomienda comprobar siempre las sumas antes de ejecutar instaladores `.exe` o `.msi`.
- Alcance del sistema AFCI: la deteccion de arcos electricos es una funcion de seguridad; un fallo de deteccion o un falso positivo puede tener consecuencias fisicas. La model card no documenta validacion normativa (UL 1699, IEC 62606) ni tasas de error.
- Restricciones de licencia: la licencia del repositorio es "other" y cada fichero conserva la de su editor (GPL, BSD-3, BSD, Apache-2.0, PSF, MIT, LGPL). El uso comercial exige revisar cada componente por separado; en particular, GCC y OpenOCD son GPL y su redistribucion modificada tiene obligaciones asociadas.
- Idiomas: no hay soporte linguistico; la documentacion y las herramientas estan en ingles.
- Dependencia de Windows x64: el kit esta pensado para Windows 10/11 x64; solo los scripts de union de partes tienen variante Linux/macOS.
- Ausencia de componentes clave: STM32CubeIDE, CubeMX, CubeProgrammer, el driver ST-LINK, Cube AI Studio y ST Edge AI Core no estan incluidos y deben descargarse aparte con cuenta myST.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los binarios hayan sido auditados por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielsaldana/AFCI_part2
- xPack GNU Arm Embedded GCC: https://github.com/xpack-dev-tools/arm-none-eabi-gcc-xpack
- xPack OpenOCD: https://github.com/xpack-dev-tools/openocd-xpack
- stlink (stlink-org): https://github.com/stlink-org/stlink
- Zadig: https://zadig.akeo.ie/
- CMake: https://cmake.org/
- Ninja: https://ninja-build.org/
- xPack Windows Build Tools: https://github.com/xpack-dev-tools/windows-build-tools-xpack
- Git for Windows: https://gitforwindows.org/
- Python 3.12.10: https://www.python.org/downloads/release/python-31210/
- Visual Studio Code: https://code.visualstudio.com/
- Cortex-Debug (marus25): https://github.com/Marus/cortex-debug
- mcu-debug (memory-view, peripheral-viewer, rtos-views): https://github.com/mcu-debug
- cmsis-svd-data (ficheros SVD de STM32F405/F407): https://github.com/cmsis-svd/cmsis-svd-data
- ngspice: https://ngspice.sourceforge.io/
- 7-Zip: https://www.7-zip.org/
- PuTTY: https://www.putty.org/
- STM32CubeIDE y herramientas de ST (no incluidas, requieren cuenta myST): https://www.st.com/en/development-tools/stm32cubeide.html
