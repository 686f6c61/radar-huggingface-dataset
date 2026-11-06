# danielsaldana/AFCI_part1

## Resumen

AFCI_part1 no es un modelo de lenguaje, sino un kit de desarrollo offline para un sistema de deteccion de arcos electricos (arc-fault circuit interrupter, AFCI) y prevencion de incendios de origen electrico. Lo publica el usuario danielsaldana en Hugging Face y esta pensado para construir, sobre un microcontrolador STM32F407, una cadena completa de adquisicion de corriente, extraccion de caracteristicas (FFT/STFT) e inferencia de una red neuronal cuantizada que decide si se debe disparar la proteccion. Esta primera parte del kit empaqueta exclusivamente el firmware y las bibliotecas embebidas necesarias para esa cadena.

El repositorio contiene archivos ZIP con STM32CubeF4 completo (drivers HAL y LL, CMSIS, middleware como FreeRTOS, USB, FatFs y LwIP, y cientos de proyectos de ejemplo), CMSIS 6, CMSIS-DSP, CMSIS-NN, CMSIS 5, el runtime TensorFlow Lite for Microcontrollers, documentacion HTML de las bibliotecas CMSIS y el kernel de FreeRTOS. No incluye pesos de ningun modelo entrenado ni un pipeline de Hugging Face asociado; el objetivo es disponer de todo el material de desarrollo sin conexion a internet, en un PC Windows 10/11 x64 con entrenamiento en Python solo por CPU.

Su relevancia es practica para quien quiera reproducir o auditar un sistema TinyML de seguridad electrica en un Cortex-M4: agrupa en un unico paquete las versiones concretas de cada dependencia, con sumas de verificacion SHA256 y scripts para reconstruir los archivos divididos. El tamano del repositorio es de 0,3 GB (285,6 MB en 10 archivos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un kit de firmware y bibliotecas para STM32F407) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el kit soporta inferencia int8 mediante CMSIS-NN y TFLite Micro, pero no incluye pesos) |
| Idiomas soportados | no disponible |
| Licencia | other (cada componente conserva su licencia original: BSD-3, Apache-2.0, ST SLA0044, MIT) |
| Formato de pesos | no disponible (los artefactos son archivos `.zip` y fragmentos `*.part001`, `*.part002`, etc.) |

## Arquitectura y entrenamiento

El kit no define una arquitectura de red neuronal concreta. La cadena de procesamiento prevista, segun la model card, es: sensor de corriente, conversion analogico-digital en el STM32F407 mediante ADC y DMA, calculo de caracteristicas FFT/STFT, inferencia de una DNN cuantizada y activacion del disparo de proteccion. Para la parte de senal se incluyen CMSIS-DSP (FFT, filtros FIR/IIR, matrices, estadistica, ventanas, optimizado para el DSP y la FPU del Cortex-M4) y para la parte de inferencia se ofrecen dos alternativas: el runtime TensorFlow Lite for Microcontrollers con kernels CMSIS-NN, o ST Edge AI / X-CUBE-AI.

No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de ajuste como RLHF o DPO, porque el repositorio no contiene ningun modelo entrenado. La innovacion tecnica del paquete es de ingenieria: versiones fijadas y fechadas de cada dependencia, documentacion HTML offline de CMSIS 6 (v6.4.0), CMSIS-DSP (v1.18.0) y CMSIS-NN (v8.0.0), y un mecanismo de reconstruccion de archivos divididos con verificacion SHA256.

## Capacidades

- Proporciona el paquete completo STM32CubeF4 con drivers HAL y LL, CMSIS Core/Device, BSPs y middleware (FreeRTOS, USB, FatFs, LwIP), ademas de cientos de proyectos de ejemplo para placas F4, incluida STM32F4-Discovery.
- Incluye ejemplos de ADC, DMA y TIM en `Projects/STM32F4-Discovery/Examples/`, que sirven de base para la adquisicion de corriente.
- Aporta CMSIS-DSP para calculo de FFT, STFT y filtrado en el propio microcontrolador.
- Aporta CMSIS-NN para ejecutar kernels de redes neuronales en int8 sobre Cortex-M4.
- Incluye el codigo fuente de TensorFlow Lite for Microcontrollers como runtime alternativo a ST Edge AI / X-CUBE-AI.
- Incluye el kernel de FreeRTOS para organizar tareas de adquisicion, DSP, inferencia, seguridad y registro.
- Ofrece documentacion HTML de las bibliotecas CMSIS para consulta sin conexion.
- Incluye scripts `join_parts.ps1` (Windows) y `join_parts.sh` (Linux/macOS) que reconstruyen los archivos divididos y los validan contra `SHA256SUMS.txt`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Desarrollo de firmware AFCI sobre STM32F407: se parte de los ejemplos de ADC, DMA y TIM de STM32CubeF4 para configurar la adquisicion de corriente a alta frecuencia y alimentar la cadena de deteccion.
- Extraccion de caracteristicas en el borde: con CMSIS-DSP se implementan FFT y STFT directamente en el Cortex-M4, evitando enviar la senal cruda a un servidor y reduciendo la latencia de disparo.
- Inferencia TinyML embebida: se entrena una DNN cuantizada en Python sobre CPU (entorno Windows 10/11 x64) y se ejecuta en el F407 con TFLite Micro y kernels CMSIS-NN, o con ST Edge AI / X-CUBE-AI como alternativa.
- Sistema de seguridad con tareas concurrentes: FreeRTOS permite separar adquisicion, procesado DSP, inferencia, logica de seguridad y registro en tareas con prioridades distintas, algo critico en una proteccion electrica.
- Reproducibilidad y auditoria de un proyecto de seguridad: las versiones fechadas de cada dependencia, la documentacion offline y las sumas SHA256 permiten reconstruir exactamente el entorno de desarrollo en una maquina sin red.
- Formacion y prototipado en laboratorio: el paquete incluye proyectos de ejemplo para STM32F4-Discovery, lo que facilita montar un banco de pruebas de deteccion de arcos sin depender de descargas adicionales.
- Integracion en STM32CubeMX/CubeIDE: el ZIP de CubeF4 se puede cargar como paquete local mediante Help > Manage embedded software packages > From Local, aunque la model card advierte de que CubeMX puede seguir prefiriendo el ZIP empaquetado por ST.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos de modelo ni metricas de deteccion, precision, recall o latencia del sistema AFCI.

## Requisitos de hardware

- Hardware objetivo de ejecucion: microcontrolador STM32F407 (Cortex-M4 con DSP y FPU), con ADC, DMA y temporizadores para la adquisicion de corriente.
- Hardware de desarrollo: PC con Windows 10/11 x64 para el flujo offline; el entrenamiento en Python esta previsto solo con CPU.
- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en el microcontrolador, no en GPU.
- GPU recomendadas: no disponibles; no se requiere GPU para el flujo descrito.
- Despliegue: STM32CubeIDE/STM32CubeMX para el firmware, TFLite Micro con CMSIS-NN o ST Edge AI / X-CUBE-AI para la inferencia, y FreeRTOS para la gestion de tareas.
- Latencia y throughput: no disponibles.
- Espacio en disco: aproximadamente 285,6 MB de archivos comprimidos, mas el espacio necesario tras reconstruir y descomprimir; el archivo mayor es STM32CubeF4, de 181,6 MB, dividido en dos partes.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| danielsaldana/AFCI_part1 | Kit de firmware y bibliotecas para STM32F407 | no aplica | no aplica | other (componentes BSD-3, Apache-2.0, ST SLA0044, MIT) | Incluye CubeF4, CMSIS, TFLite Micro y FreeRTOS; sin pesos de modelo |
| STM32CubeF4 (repositorio oficial de STMicroelectronics) | Paquete de firmware MCU | no aplica | no aplica | BSD-3 / Apache-2.0 / ST SLA0044 | Fuente original del componente principal; el kit anade CMSIS, TFLite Micro, documentacion y scripts de reconstruccion |
| X-CUBE-AI / ST Edge AI | Toolchain de conversion y runtime de IA para STM32 | no aplica | no aplica | licencia de ST | Alternativa de runtime mencionada en la model card; el kit no la incluye, solo la referencia |
| tflite-micro (repositorio oficial de TensorFlow) | Runtime de inferencia para microcontroladores | no aplica | no aplica | Apache-2.0 | Fuente original del runtime incluido en el kit |

No se dispone de modelos comparables en la misma categoria con datos de rendimiento publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no genera texto y no puede evaluarse con benchmarks de modelos de lenguaje.
- La licencia figura como "other"; cada componente conserva su licencia original (BSD-3, Apache-2.0, ST SLA0044, MIT), por lo que el uso comercial debe revisarse componente a componente, en particular el codigo sujeto a SLA0044 de ST.
- Solo cubre la primera parte del kit; la model card menciona partes posteriores y una lista de comprobacion en la "Part 7" que no estan incluidas en este repositorio.
- El flujo esta declarado para Windows 10/11 x64 con entrenamiento en CPU; no se documenta soporte para otros sistemas en el entrenamiento, aunque los scripts de reconstruccion incluyen una version para Linux/macOS.
- Los archivos de mas de 100 MB estan divididos; es obligatorio ejecutar los scripts de union y verificar SHA256 antes de usar los ZIP.
- La model card advierte de que STM32CubeMX puede no aceptar el ZIP local y preferir el paquete empaquetado por ST, lo que puede complicar la integracion.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma por no tratarse de un modelo de lenguaje.
- Al ser un sistema de seguridad electrica, cualquier uso en produccion requiere validacion independiente de la deteccion de arcos y del comportamiento de disparo; el kit no aporta evidencias de certificacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danielsaldana/AFCI_part1
- STM32CubeF4 (GitHub): https://github.com/STMicroelectronics/STM32CubeF4
- CMSIS 6: https://github.com/ARM-software/CMSIS_6
- CMSIS-DSP: https://github.com/ARM-software/CMSIS-DSP
- CMSIS-NN: https://github.com/ARM-software/CMSIS-NN
- TensorFlow Lite for Microcontrollers: https://github.com/tensorflow/tflite-micro
- FreeRTOS-Kernel: https://github.com/FreeRTOS/FreeRTOS-Kernel
