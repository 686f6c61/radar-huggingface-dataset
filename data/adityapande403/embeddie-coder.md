# Adityapande403/embeddie-coder

## Resumen

EmbeddieCoder AI (1.5B) es un ajuste fino supervisado (SFT) de Qwen2.5-Coder-1.5B-Instruct, publicado por el desarrollador Adityapande403, orientado en exclusiva a ingeniería de sistemas embebidos: firmware en C/C++, RTOS, protocolos industriales y de automoción, Linux embebido y diagnóstico de hardware. El modelo se presenta como un SLM «offline-first» que cubre nueve dominios técnicos (desde Cortex-M y RISC-V hasta Modbus, SAE J1939, OBD-II y AIS-140) y que, en lugar de memorizar registros volátiles o polinomios de CRC, delega esos cálculos en herramientas deterministas externas.

La propuesta técnica no es solo el peso ajustado: el autor describe una arquitectura de sistema que combina los pesos del modelo con decodificadores deterministas de protocolos, un sandbox de compilación GCC 16.2.0 con `-Wall -Wextra -Werror -std=c11` y recuperación documental local mediante BM25 sobre datasheets y device trees. Es decir, el modelo actúa como razonador sobre documentación y como generador de código, mientras la verificación se externaliza.

Su relevancia práctica está en el tamaño: 1.543.714.304 parámetros y un pico de VRAM de 2.944,4 MB medido por el autor, lo que lo sitúa en el rango de GPUs de 4-6 GB y permite despliegue local sin conexión. Ahora bien, la validación publicada es muy limitada (8 tareas de benchmark y un entrenamiento declarado de 19,56 segundos), y el repositorio no tiene descargas ni valoraciones, por lo que debe tratarse como una propuesta preliminar y no como un modelo contrastado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (derivado de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | no disponible; el autor publica un `Modelfile` para Ollama, pero no detalla las cuantizaciones soportadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Tamaño del repositorio | 6,3 GB |
| Pipeline / librería | text-generation / transformers |
| Tipo de ajuste | SFT (supervised fine-tuning) sobre el modelo instruct |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base: un transformer decoder-only de la familia Qwen2, con atención completa y 1,5 B de parámetros densos, adaptado mediante ajuste fino supervisado sobre el checkpoint instruct de Qwen2.5-Coder. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, la mezcla de datos ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles. El autor sí declara la configuración del entrenamiento: 5 épocas, 10 pasos y 19,56 segundos de tiempo total, con un pico de 3,2 GB de VRAM sobre el hardware de referencia. Esa cifra implica un ajuste muy ligero, coherente con un conjunto de datos pequeño y con un benchmark de evaluación de solo 8 tareas.

La innovación declarada no reside en la arquitectura, sino en el andamiaje que rodea al modelo. El principio de diseño es «entrenar capacidades generales de ingeniería, recuperar documentación técnica detallada y usar herramientas deterministas para verificar resultados». En la práctica esto se traduce en cuatro componentes: decodificadores deterministas para Modbus RTU/TCP, SAE J1939, OBD-II y AIS-140; verificación mediante compilación en sandbox con GCC 16.2.0 y flags estrictos; recuperación local BM25 sobre datasheets y device trees para mantener el modo offline; y un comportamiento declarado de «incertidumbre calibrada», por el que el modelo pide esquemáticos, frecuencias de reloj o trazas de analizador lógico cuando falta evidencia, en lugar de suponerla. Cabe subrayar que estos componentes viven en el repositorio de GitHub del autor y no en el paquete de pesos de HuggingFace: el modelo por sí solo no ejecuta esas verificaciones.

## Capacidades

- Generación de código C y C++ para sistemas embebidos: punteros a registros volátiles, buffers circulares SPSC lock-free, barreras de memoria, pools de memoria de tamaño fijo e intrinsics de endianness.
- Programación de microcontroladores y SoC: ARM Cortex-M (agrupación NVIC, SysTick, PendSV), Cortex-A, RISC-V (CSR, traps), ESP32 (fijación de tareas a núcleos, spinlocks), STM32, RP2040 (PIO) y AVR.
- Drivers de periféricos: GPIO, UART con DMA circular y detección de idle line, SPI en modos 0-3, recuperación de bus I2C bloqueado mediante secuencia de 9 relojes, CAN 2.0B y CAN FD, PWM, timers y watchdogs (IWDG/WWDG).
- Concurrencia en RTOS: inversión de prioridades, mutex con herencia de prioridad frente a semáforos, `portYIELD_FROM_ISR`, dimensionado de pilas de tarea; FreeRTOS, Zephyr y ThreadX.
- Linux embebido: nodos de device tree (`.dts`), drivers de carácter, `libgpiod`, `bootargs` de U-Boot y targets de systemd.
- Protocolos binarios y telemetría: Modbus RTU/TCP, SAE J1939 (PGN/SPN), OBD-II Mode 01 PIDs, AIS-140, checksums XOR de NMEA-0183 y CRCs (Modbus, CCITT, Maxim).
- IoT celular y wireless: secuencias de comandos AT (Quectel EC200U/BG95, SIMCom SIM7600), registro de red, contexto PDP, recuperación de socket y buffering en SPI Flash.
- Diagnóstico de bring-up: decodificación de HardFault en Cortex-M mediante CFSR/BFSR/HFSR, triaje de bus error, interpretación de trazas de analizador lógico e identificación de brownout reset.
- Gestión de energía y fiabilidad: modos de bajo consumo (Stop frente a Standby), BOR, verificación de secure boot y diseño defensivo de buffers.
- Conversación multi-turno con plantilla de chat (`apply_chat_template`), con rol de sistema configurable.
- No se declaran capacidades de visión, audio, tool calling nativo ni modo «thinking»; la interacción con herramientas se describe como capa externa orquestada, no como función del modelo.

## Casos de uso

- **Asistencia a bring-up de placas nuevas**: dado un esquemático y una traza de fallo, el modelo ayuda a interpretar un HardFault decodificado (CFSR/BFSR/HFSR) y a proponer hipótesis de causa raíz. Es adecuado porque su ajuste se centra explícitamente en triaje de diagnóstico y en pedir la evidencia faltante en lugar de inventar direcciones de registro.
- **Generación de drivers de periféricos**: producción de esqueletos de driver para UART con DMA circular, SPI en modo 3 o recuperación de I2C bloqueado con la secuencia de 9 pulsos. El código generado puede pasar por el sandbox GCC con `-Wall -Wextra -Werror -std=c11` antes de llegar a revisión humana.
- **Revisión de concurrencia en FreeRTOS**: análisis de código que usa semáforos binarios donde haría falta un mutex con herencia de prioridad, o que llama a funciones no seguras desde ISR. El modelo cubre explícitamente inversión de prioridades y `portYIELD_FROM_ISR`.
- **Integración de telemetría vehicular**: generación de código de parseo para SAE J1939 (PGN/SPN) u OBD-II Mode 01, y para el canal AIS-140 en unidades telemáticas. Es adecuado porque estos protocolos forman parte del núcleo del ajuste, aunque los cálculos de CRC deben delegarse a la herramienta determinista.
- **Puesta en marcha de conectividad celular**: construcción y depuración de secuencias de comandos AT para módulos Quectel EC200U/BG95 o SIMCom SIM7600, incluyendo registro de red, activación de contexto PDP y recuperación de socket caído con buffering en flash.
- **Desarrollo de Linux embebido**: redacción de nodos de device tree, revisión de `bootargs` de U-Boot y escritura de utilidades con `libgpiod` para plataformas ARM.
- **Formación y documentación interna**: actuar como asistente offline para equipos de firmware que no pueden enviar código propietario a APIs en la nube, gracias a su reducido consumo de VRAM y a la recuperación documental local.
- **Generación de tests y código defensivo**: producción de casos de prueba para buffers, comprobación de límites y patrones de diseño defensivo en sistemas con presupuesto de memoria ajustado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre una suite independiente (`benchmark_suite.jsonl`) que, según la model card, no presenta fuga hacia el conjunto de entrenamiento:

| Categoría | Tareas | Modelo base | Modelo ajustado (SFT) | Delta |
|---|---:|---:|---:|---:|
| Concurrencia en RTOS | 1 | 0,0 % | 100,0 % | +100,0 % |
| Diagnóstico de hardware (HardFault) | 1 | 0,0 % | 100,0 % | +100,0 % |
| Protocolo de telemetría AIS-140 | 1 | 100,0 % | 100,0 % | 0,0 % |
| Protocolos (CRC / CAN / OBD-II) | 3 | 0,0 % | 0,0 % | 0,0 % |
| Matemáticas en C embebido | 1 | 0,0 % | 0,0 % | 0,0 % |
| Seguridad y fiabilidad | 1 | 100,0 % | 0,0 % | -100,0 % |
| **Precisión global** | **8** | **25,0 %** | **37,5 %** | **+12,5 %** |

El propio autor señala que el modelo delega los cálculos matemáticos de CRC en su motor determinista de protocolos, lo que explica el 0 % en esa categoría. No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, MBPP) en la información disponible.

Rendimiento medido por el autor en un Intel Core i7-14700K con NVIDIA GeForce RTX 5060 Ti de 16 GB:

| Métrica | Valor |
|---|---|
| Arranque en frío | 5,09 s |
| VRAM pico en inferencia | 2.944,4 MB (~2,88 GB) |
| RAM del host (working set) | 970 MB |
| Throughput de generación | ~56,2 - 59,8 tokens/s |
| Tiempo de entrenamiento SFT | 19,56 s (5 épocas, 10 pasos, pico de 3,2 GB) |

## Requisitos de hardware

- **VRAM en precisión de referencia**: 2.944,4 MB (~2,88 GB) de pico, medidos por el autor. Cifra compatible con GPUs de 4 GB y 6 GB.
- **Estimación por cuantización** (cálculo a partir de 1,5 B de parámetros, no publicado por el autor): ~3,1 GB en FP16/BF16, ~1,6 GB en INT8 y ~0,9 GB en INT4 para los pesos, más overhead de contexto y caché KV.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 3060 12 GB, RTX 4090) para inferencia; A100/H100 solo tendrían sentido para servir muchas réplicas en paralelo, dado el reducido tamaño del modelo.
- **¿Cabe en GPU de consumo?** Sí. El autor lo valida en una RTX 5060 Ti de 16 GB, con margen amplio; en una GPU de 4 GB conviene usar cuantización.
- **CPU**: es viable en CPU con 970 MB de working set declarado, aunque el throughput no se ha publicado para ese escenario.
- **Opciones de despliegue**: transformers (documentado con ejemplo de código), Ollama (el autor incluye un `Modelfile`) y text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan instrucciones para vLLM, llama.cpp ni TGI más allá de las etiquetas.
- **Latencia y throughput**: ~56-59 tokens/s de generación y 5,09 s de arranque en frío sobre el hardware de referencia declarado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| EmbeddieCoder AI 1.5B | 1,5 B | no declarado en la ficha (base: 32.768) | Sistemas embebidos, RTOS, protocolos industriales y automoción | Apache 2.0 | HuggingFace + GitHub del autor |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5 B | 32.768 tokens | Código general, instruct | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-Coder-3B-Instruct | 3 B | 32.768 tokens | Código general, instruct | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-0.5B-Instruct | 0,5 B | 32.768 tokens | Código general, instruct | Apache 2.0 | HuggingFace |

Frente a su modelo base, EmbeddieCoder intercambia amplitud de dominio por profundidad en un nicho muy concreto: gana comportamiento en RTOS y diagnóstico de hardware según su propia evaluación, pero no aporta datos que permitan comparar su rendimiento en código general con el de Qwen2.5-Coder-1.5B-Instruct. Los modelos de 0,5 B y 3 B de la misma familia son las alternativas naturales si se necesita menos huella de memoria o más capacidad bruta, respectivamente, a costa de perder el ajuste de dominio. No se dispone de comparaciones publicadas con modelos específicos de firmware de otros autores.

## Limitaciones y advertencias

- **Base de evaluación muy reducida**: el benchmark consta de 8 tareas, varias con una sola muestra. Un +100 % en una tarea única no es estadísticamente significativo y no permite extrapolar el rendimiento a producción.
- **Regresión en seguridad y fiabilidad**: la categoría «Safety & Reliability» cae del 100 % al 0 % tras el ajuste. Es la señal más preocupante de la model card y debería investigarse antes de cualquier uso en entornos críticos.
- **Entrenamiento extremadamente corto**: 19,56 segundos, 5 épocas y 10 pasos implican un ajuste superficial. No se documenta el tamaño ni la composición del dataset, por lo que no puede descartarse sobreajuste a un conjunto pequeño.
- **Riesgo de alucinación en datos volátiles**: direcciones de registro, offsets de memoria, valores de registros de periféricos y polinomios de CRC son propensos a error. El diseño del autor lo mitiga delegando en herramientas deterministas, pero esas herramientas no están incluidas en el repositorio de HuggingFace y deben integrarse aparte.
- **Idioma**: solo inglés declarado. El rendimiento en castellano no está evaluado y previsiblemente será inferior; no debe asumirse para documentación o soporte en español.
- **Contexto no declarado**: la model card no indica la longitud de contexto efectiva tras el ajuste; se hereda la del modelo base, pero no se confirma.
- **Licencia**: Apache 2.0 permite uso comercial y modificación sin restricciones de campo de uso, con la ausencia habitual de garantías. El código y las herramientas del repositorio de GitHub pueden tener una licencia distinta, no especificada en la información disponible.
- **Sin validación comunitaria**: 0 descargas y 0 valoraciones en el momento de la consulta. No existe evidencia independiente que respalde las cifras declaradas.
- **Sin declaración normativa**: no se declara conformidad con MISRA C, certificaciones de seguridad funcional (ISO 26262, IEC 61508) ni requisitos de industria. El código generado requiere revisión humana y trazabilidad propia.
- **Modelo pequeño**: con 1,5 B de parámetros, es esperable un razonamiento limitado en problemas de arquitectura complejos o cadenas de varias etapas; conviene usarlo como asistente acotado y no como autoridad técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adityapande403/embeddie-coder
- Repositorio GitHub declarado en la model card: https://github.com/adityapande403/Embeddie-coder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de Qwen2.5-Coder (familia completa): https://github.com/QwenLM/Qwen2.5-Coder
- Nota: la sección 6 de la model card aparece truncada en la información disponible («https://github.com/adityapande403/E...»), por lo que el enlace al pipeline de entrenamiento y a la suite de benchmark se toma del badge de GitHub y no puede verificarse por completo.
