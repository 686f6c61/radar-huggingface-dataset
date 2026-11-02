# danielsaldana/AFCI_part4

## Resumen

AFCI_part4 es un repositorio de Hugging Face publicado por el usuario danielsaldana que no contiene un modelo de lenguaje ni una red neuronal entrenada de forma original, sino un kit de desarrollo offline para sistemas de deteccion de arcos electricos (AFCI, arc-fault circuit interrupter) orientado a microcontroladores. El paquete reune codigo de referencia y zoos de modelos TinyML de dos fabricantes de semiconductores: STMicroelectronics (STM32 model zoo, con el caso de uso `arc_fault_detection` y modelos INT8 TFLite preentrenados `st_conv` y `st_dense`) y Texas Instruments (Tiny ML Tensorlab, tinyml-modelzoo y un subconjunto del MSPM0 SDK 2.11 con ejemplos de deteccion de arcos AC basados en NPU).

El objetivo declarado es servir de punto de partida para construir un pipeline completo de prevencion de incendios electricos: sensor de corriente, adquisicion por ADC y DMA en un STM32F407, extraccion de caracteristicas mediante FFT/STFT, inferencia de una red densa cuantizada a int8 y logica de disparo (trip). Todo el flujo de entrenamiento esta pensado para ejecutarse en un PC con Windows 10/11 x64 y Python sobre CPU, sin GPU ni conexion a internet.

La relevancia del repositorio es practica y de nicho: agrupa en un unico paquete materiales que de otro modo habria que descargar por separado de GitHub, incluyendo el dataset de banco de pruebas AFD (CSV Arc/Normal de train, val y test) y los pesos TFLite reales (no punteros LFS) de los modelos de referencia de ST. No se trata de un modelo generativo, por lo que muchas de las especificaciones habituales de una ficha de modelo (parametros, contexto, idiomas, benchmarks de NLP) no son aplicables y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales densas y convolucionales 1D para series temporales (TFLite int8 en ST; PyTorch en TI); no es un transformer ni un LLM |
| Parametros totales | No disponible (los modelos de referencia son TinyML, del orden de kilobytes a pocos cientos de kilobytes, pero no se publica el recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de entrada de 512 muestras en los modelos `st_conv` de ST |
| Tipos de cuantizacion | int8 (post-training quantization en ST); cuantizacion propia del flujo Tiny ML Tensorlab de TI |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | `other`; cada componente conserva su licencia original: ST SLA0044 y LICENSE.md por carpeta, TI tensorlab BSD-3-Clause, MSPM0 SDK con licencia TI |
| Formato de pesos | TFLite int8 (ST); formatos propios de TI Tiny ML Tensorlab; el repositorio se distribuye como ZIP y ficheros `.partNNN` con `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio, sino que empaqueta pipelines de terceros. En el caso de ST, el flujo `arc_fault_detection` del stm32ai-modelzoo-services usa configuracion Hydra/YAML y TensorFlow para entrenamiento, evaluacion, cuantizacion int8, prediccion y benchmarking. Los modelos preentrenados incluidos son `st_conv` (variantes en dominio temporal y frecuencial, con 1 y 4 canales, ventana de 512 muestras) y `st_dense` (dominio frecuencial, con 1 y 8 canales), acompanados de sus README y metricas. El dataset de referencia es el AFD test bench, con ficheros CSV etiquetados como Arc y Normal para train, val y test.

En el caso de TI, se incluye Tiny ML Tensorlab (modelmaker, model zoo y herramientas de entrenamiento, basado en PyTorch) con ejemplos de clasificacion y deteccion de anomalias para fallos de arco DC y fallos electricos, ademas de tinyml-modelzoo con definiciones y configuraciones de arquitecturas para clasificacion de series temporales. El subconjunto del MSPM0 SDK 2.11 aporta firmware de referencia para TIDA-010971 (deteccion de arcos AC con NPU), incluyendo captura de datos, extraccion de caracteristicas, inferencia y logica de decision portables al STM32F407.

No se documentan en la informacion disponible detalles como numero de tokens de entrenamiento (no aplica), composicion exacta del dataset AFD, ni si se emplearon tecnicas de aumento de datos o validacion cruzada mas alla de la particion train/val/test indicada.

## Capacidades

- Clasificacion binaria de senales de corriente en arco electrico (Arc) frente a funcionamiento normal (Normal).
- Extraccion de caracteristicas en dominio temporal y frecuencial (FFT/STFT) previa a la inferencia.
- Inferencia int8 de baja latencia en microcontroladores Cortex-M (STM32F407) mediante ST Edge AI Core / X-CUBE-AI o TFLite Micro.
- Deteccion de anomalias y clasificacion de fallos electricos en el flujo de TI (Tiny ML Tensorlab).
- Ejemplos de captura de datos en vivo y previsualizacion para banco de pruebas (`ac_arc_fault_data_capture`, `ac_arc_fault_detection_live_preview`).
- Clasificacion de uso de electrodomesticos (NILM) y clasificacion de formas de onda en los ejemplos del MSPM0 SDK.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prototipado de un AFCI embebido: usar el caso `arc_fault_detection` de ST como plantilla para entrenar, cuantizar y desplegar un detector de arcos en un STM32F407 con ADC y DMA, partiendo de un pipeline ya validado por el fabricante.
- Evaluacion de modelos de referencia: comparar los modelos `st_conv` y `st_dense` preentrenados (int8 TFLite) contra un modelo propio usando el dataset AFD test bench, con metricas reproducibles.
- Desarrollo de firmware de deteccion de arcos AC: portar la logica de captura, extraccion de caracteristicas e inferencia de los ejemplos `ac_arc_fault_detection_ai_npu` de TI al microcontrolador objetivo.
- Investigacion en TinyML para series temporales: emplear Tiny ML Tensorlab y tinyml-modelzoo como base para experimentar con arquitecturas de clasificacion de senales electricas en PyTorch.
- Banco de pruebas de laboratorio: utilizar los scripts de captura y previsualizacion en vivo para registrar corrientes con arco y sin arco y ampliar el dataset propio.
- Formacion y docencia: el kit permite montar un ejercicio completo de deteccion de fallos electricos con cuantizacion int8 y despliegue en MCU sin depender de servicios en la nube.
- Clasificacion de cargas electricas (NILM): reutilizar el ejemplo `nilm_appliance_usage_classification_npu` para identificar el uso de electrodomesticos a partir de la firma de corriente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los modelos `st_conv` y `st_dense` incluyen sus propios README y metricas dentro del ZIP, pero los valores concretos no se detallan en la informacion proporcionada.

## Requisitos de hardware

- Entrenamiento: PC con Windows 10/11 x64, Python sobre CPU, sin GPU ni conexion a internet. El entorno de ST requiere un entorno Python propio (referido como "Part 5" en la model card).
- Inferencia en microcontrolador: STM32F407 (Cortex-M4F) con ADC y DMA; alternativamente placas MSPM0G5187 con NPU para los ejemplos de TI.
- VRAM estimada: no aplica; los modelos son TinyML int8 y se ejecutan en memoria del MCU, no en GPU.
- GPU recomendadas: no aplica para el despliegue; el entrenamiento esta disenado para CPU.
- Cabe en GPU consumer: no aplica (no es un modelo de lenguaje).
- Opciones de despliegue: ST Edge AI Core / X-CUBE-AI, TFLite Micro, toolchain de TI para MSPM0 con NPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Espacio en disco: 702,9 MB en 5 ficheros, con los ZIP de mas de 100 MB divididos en partes que deben reconstruirse con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS) y verificarse contra `SHA256SUMS.txt`.

## Comparativa con modelos similares

| Aspecto | AFCI_part4 (ST + TI) | STM32 model zoo (original) | TI Tiny ML Tensorlab (original) |
|---|---|---|---|
| Tipo | Kit agregado offline | Zoo de modelos + caso `arc_fault_detection` | Framework TinyML en PyTorch |
| Modelos incluidos | `st_conv`, `st_dense` int8 TFLite + ejemplos TI | Modelos ST y dataset AFD | Ejemplos de fallos electricos y series temporales |
| Licencia | `other` (SLA0044 + BSD-3 + TI) | SLA0044 / LICENSE.md por carpeta | BSD-3-Clause |
| Distribucion | Hugging Face, ZIP partidos | GitHub | GitHub |
| Uso comercial | Sujeto a licencia de cada componente | Sujeto a SLA0044 | Permitido bajo BSD-3 |

No se dispone de datos de rendimiento comparativo entre estos componentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier evaluacion tipo LLM no aplica.
- El repositorio es un agregado de terceros: la calidad, el mantenimiento y la exactitud dependen de los proyectos originales de ST y TI.
- Licencia `other` con componentes de licencias distintas (SLA0044, BSD-3-Clause, licencia TI); el uso comercial exige revisar el LICENSE.md de cada carpeta y el fichero `license_mspm0_sdk_2_11_00_07.txt`.
- El historial de Git fue eliminado de los ZIP, lo que dificulta la trazabilidad de cambios respecto a los repositorios originales.
- Los ficheros grandes estan partidos; un uso incorrecto de los scripts de reconstruccion o la falta de verificacion SHA256 puede producir binarios corruptos.
- Riesgo de falsos positivos y negativos inherente a la deteccion de arcos: la model card no documenta tasas de error, umbrales de disparo ni validacion en campo.
- El dataset AFD test bench puede no representar la diversidad de instalaciones electricas reales; no se documenta su composicion ni su procedencia.
- No se especifican sesgos ni limitaciones de idioma porque no aplican a un modelo de senales.
- Sin datos publicados de latencia, consumo energetico ni robustez frente a ruido electromagnetico en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielsaldana/AFCI_part4
- STMicroelectronics stm32ai-modelzoo-services (GitHub): https://github.com/STMicroelectronics/stm32ai-modelzoo-services
- STMicroelectronics stm32ai-modelzoo (GitHub): https://github.com/STMicroelectronics/stm32ai-modelzoo
- Texas Instruments Tiny ML Tensorlab: no disponible en la informacion proporcionada (referenciado en el repositorio como `tinyml-tensorlab`)
- Texas Instruments tinyml-modelzoo: no disponible en la informacion proporcionada (referenciado en el repositorio como `tinyml-modelzoo`)
- TI MSPM0 SDK 2.11.00.07: no disponible en la informacion proporcionada (referenciado en el repositorio como `mspm0-sdk-2.11.00.07`)
- TI TIDA-010971 (deteccion de arcos AC con NPU): no disponible enlace directo en la informacion proporcionada
