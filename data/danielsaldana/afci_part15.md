# danielsaldana/AFCI_part15

## Resumen

AFCI_part15 no es un modelo de inteligencia artificial, sino la decimoquinta entrega de un kit de desarrollo offline para un sistema de deteccion de fallos de arco electrico (AFCI, arc-fault circuit interrupter) orientado a la prevencion de incendios electricos. El repositorio lo publica el usuario danielsaldana en HuggingFace y contiene exclusivamente herramientas de diseno de hardware: en concreto, el instalador oficial de KiCad 10.0.7 para Windows x64, dividido en diez fragmentos de menos de 100 MB y acompanado de scripts de reconstruccion (`join_parts.ps1` y `join_parts.sh`) con verificacion SHA256.

El sistema completo al que pertenece esta pieza sigue una cadena de procesado definida por el autor: sensor de corriente (transformador de corriente o Rogowski) que alimenta la etapa analogica de acondicionamiento, muestreo mediante ADC y DMA de un microcontrolador STM32F407, extraccion de caracteristicas en el dominio de la frecuencia mediante FFT/STFT y clasificacion final con una red neuronal profunda cuantizada (TinyML) que decide la activacion del relé de disparo. El objetivo declarado es un entorno de formacion e inferencia completamente offline sobre un PC con Windows 10/11 x64 y Python en CPU, sin dependencia de servicios en la nube.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: el repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni tarjeta de modelo en el sentido habitual. Su interes es documental y de ingenieria, ya que forma parte de un conjunto de 15 repositorios (AFCI_part1 a AFCI_part15) que cubren desde la electronica analogica hasta el entrenamiento del clasificador. Cualquier evaluacion del componente de IA debe hacerse sobre las otras partes del kit, no sobre esta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de herramientas de diseno de hardware; contiene el instalador de KiCad 10.0.7) |
| Parametros totales | No disponible (no contiene pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (cada archivo conserva la licencia de su publicador original: GPL-3.0 para KiCad, CC-BY-SA 4.0 con excepcion para las librerias de KiCad) |
| Formato de pesos | No disponible (el contenido es un ejecutable `.exe` de Windows x64 dividido en 10 partes `*.part001` a `*.part010`) |

## Arquitectura y entrenamiento

Esta parte del kit no contiene ningun modelo entrenado ni codigo de entrenamiento. El unico artefacto es `01_KiCad_PCB_design/kicad-10.0.7-x86_64.exe` (924,1 MB), la version oficial de KiCad 10.0.7 para Windows x64 obtenida del repositorio espejo github.com/KiCad/kicad-source-mirror. El instalador incluye las librerias estandar de simbolos, huellas y modelos 3D, lo que permite trabajar sin conexion, y KiCad incorpora un simulador ngspice integrado (la version independiente de ngspice se distribuye en la parte 2 del kit).

El proposito de estas herramientas dentro del proyecto es el diseno esquematico y de PCB de la etapa frontal analogica del detector de arcos: entrada de transformador de corriente o Rogowski, integrador, filtro antialias, camino de envolvente de alta frecuencia, aislamiento galvanico y driver del relé de disparo, ademas de una placa portadora o shield para el STM32F407. El autor remite para el diseno de la etapa frontal a las notas de aplicacion de Texas Instruments TIDA-010971, TIDA-010955 y SBAA773, y a documentacion de ABB y Siemens sobre AFDD recopilada en la parte 6 del kit. No se documenta ningun proceso de entrenamiento, dataset ni tecnica de optimizacion en esta entrega.

## Capacidades

- Distribucion offline del entorno de diseno electronico KiCad 10.0.7 para Windows x64, con librerias de simbolos, huellas y modelos 3D incluidas.
- Edicion de esquematicos y diseno de PCB para la etapa analogica de deteccion de arcos y la placa portadora del STM32F407.
- Simulacion de circuitos mediante ngspice integrado en KiCad.
- Reconstruccion y verificacion de integridad de los archivos divididos mediante los scripts incluidos y el fichero `SHA256SUMS.txt`.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue: no es un modelo de lenguaje.
- No incluye el clasificador DNN cuantizado ni las caracteristicas FFT/STFT; esos componentes pertenecen a otras partes del kit.

## Casos de uso

- Diseno de la etapa frontal analogica del AFCI: el ingeniero abre KiCad y dibuja el esquematico del integrador, el filtro antialias y el camino de envolvente de alta frecuencia a partir de las referencias TIDA-010971 y SBAA773 citadas por el autor.
- Verificacion del comportamiento del filtro antialias antes de fabricar: se simula el circuito con ngspice integrado en KiCad para comprobar la respuesta en frecuencia y la atenuacion por encima de la banda de interes.
- Creacion de la placa portadora del STM32F407: se disena el shield que conecta el ADC del microcontrolador con la salida de la etapa analogica, incluyendo el driver del relé de disparo y el aislamiento.
- Preparacion de un puesto de trabajo offline en planta o laboratorio: al incluir el instalador completo con librerias, se puede desplegar KiCad en un PC con Windows 10/11 x64 sin acceso a internet, requisito habitual en entornos industriales restringidos.
- Reproducibilidad del kit completo: los scripts `join_parts.ps1` y `join_parts.sh` permiten reconstruir el instalador a partir de los diez fragmentos y validarlo contra `SHA256SUMS.txt`, lo que facilita auditorias de la cadena de suministro.
- Formacion de ingenieros en proteccion contra arcos electricos: el kit completo, del que esta parte aporta las herramientas de diseno, sirve como material didactico para recorrer la cadena sensor, acondicionamiento, muestreo, extraccion de caracteristicas y clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable y la model card no incluye metricas de deteccion, latencia ni consumo del sistema AFCI.

## Requisitos de hardware

- Almacenamiento: 1,0 GB para el repositorio completo; el instalador reconstruido ocupa 924,1 MB y requiere espacio adicional durante la instalacion de KiCad y sus librerias.
- Sistema operativo: Windows 10/11 x64 para ejecutar el instalador; los scripts de union de fragmentos funcionan tanto en Windows (PowerShell) como en Linux/macOS (bash).
- VRAM: no aplica, no hay inferencia de red neuronal en esta parte.
- GPU: no aplica; el kit declara formacion en CPU exclusivamente.
- CPU y RAM: no especificadas en la informacion disponible; los requisitos son los de KiCad 10.0.7 y ngspice, no los de un modelo de IA.
- Opciones de despliegue: instalacion local de KiCad en Windows; no aplican vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. AFCI_part15 no es un modelo de IA y no existe una categoria de modelos comparable. Como referencia de contexto, las otras catorce partes del kit (AFCI_part1 a AFCI_part15) cubren componentes distintos del mismo sistema, y el indice maestro se encuentra en AFCI_part6.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, arquitectura ni pipeline de HuggingFace; no puede usarse para inferencia.
- La licencia declarada es "other" y cada archivo conserva la licencia de su publicador original (GPL-3.0 para KiCad y CC-BY-SA 4.0 con excepcion para sus librerias), por lo que el uso comercial del contenido esta sujeto a dichas licencias, no a una licencia unica del repositorio.
- El instalador esta pensado exclusivamente para Windows 10/11 x64; no se distribuyen binarios para Linux ni macOS en esta parte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- El diseno de la etapa frontal depende de documentacion de terceros (Texas Instruments, ABB, Siemens) que el usuario debe obtener por su cuenta; el autor indica explicitamente que hay materiales que no se incluyen en el kit.
- La fecha de creacion del repositorio (2026-11-02) es posterior a la de esta ficha; conviene verificar la integridad de los archivos contra `SHA256SUMS.txt` antes de ejecutar cualquier binario.
- No se especifican los idiomas ni la region de los contenidos mas alla de la etiqueta `region:us`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danielsaldana/AFCI_part15
- Indice maestro del kit (AFCI_part6): https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Repositorio espejo de KiCad: https://github.com/KiCad/kicad-source-mirror
- Nota de aplicacion de Texas Instruments TIDA-010971: no disponible como enlace directo en la informacion proporcionada
- Nota de aplicacion de Texas Instruments TIDA-010955: no disponible como enlace directo en la informacion proporcionada
- Nota de aplicacion de Texas Instruments SBAA773: no disponible como enlace directo en la informacion proporcionada
