# nxp/keyword-spotting-dscnn-imx

## Resumen

El modelo `nxp/keyword-spotting-dscnn-imx` es una compilación optimizada del modelo de detección de palabras clave (keyword spotting) del benchmark MLPerf Tiny, publicado originalmente por MLCommons y adaptado por NXP para sus procesadores de la familia i.MX. Se trata de una red neuronal convolucional con convoluciones separables en profundidad (DS-CNN) que clasifica clips de audio de 1 segundo en 12 clases: diez palabras de comando ("Down", "Go", "Left", "No", "Off", "On", "Right", "Stop", "Up", "Yes") más las categorías "Silence" y "Unknown".

El modelo es extremadamente compacto: 23.756 parámetros, aproximadamente 5 MOPS y un fichero TFLite cuantizado en int8 de solo 53 KB. Está diseñado para ejecutarse en los aceleradores NPU integrados en los SoC de NXP (Vivante VX en i.MX 8M Plus, Arm Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95 e i.MX 952), lo que lo convierte en un ejemplo representativo de inferencia TinyML en el extremo.

Su relevancia actual radica en que proporciona artefactos listos para producción (compilados con Vela y el SDK Neutron en versiones concretas de BSP) para despliegues de wake-word y control por voz en dispositivos embebidos, sin necesidad de conexión a la nube ni de hardware de altas prestaciones. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DS-CNN (depth-wise separable convolutional neural network) |
| Parametros totales | 23.756 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clips de audio de 1 segundo; entrada MFCC de forma (1, 49, 10, 1)) |
| Tipos de cuantizacion | int8 (entrada int8 / salida int8) |
| Idiomas soportados | no disponible (clases de palabras en ingles: Down, Go, Left, No, Off, On, Right, Stop, Up, Yes) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), compilado para NPU Vela / Neutron segun plataforma |
| Entrada | Huella MFCC (1, 49, 10, 1), int8 |
| Salida | Vector de 12 puntuaciones de clase, int8 (requiere desquantizacion con escala y zero point) |
| Operaciones | ~5 MOPS |
| Tamano del fichero | 53 KB (modelo int8) |
| Framework de origen | TensorFlow / Keras |
| Hardware soportado | i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952 |

## Arquitectura y entrenamiento

La arquitectura es una DS-CNN, es decir, una red convolucional que sustituye las convoluciones estándar por convoluciones separables en profundidad para reducir drásticamente el coste computacional y el número de parámetros. El modelo opera sobre huellas MFCC extraídas de clips de audio de 1 segundo y produce una distribución de probabilidad sobre 12 clases. Con 23.756 parámetros y 5 MOPS, está pensado para ejecutarse en microcontroladores y NPUs de baja potencia.

No se dispone de información detallada en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de que el ejemplo de entrada proviene del dataset Speech Commands, CC BY 4.0) ni sobre si se aplicaron técnicas de RLHF o DPO, algo por otra parte impropio de un clasificador de audio. El modelo original forma parte del benchmark MLPerf Tiny y fue entrenado por MLCommons; NXP no ha realizado cuantización local, sino que descarga el modelo int8 ya cuantizado publicado por MLCommons y lo compila para cada NPU: Vela para Ethos-U65 en i.MX 93 y eIQ Neutron SDK (versiones 3.1.3, 3.2.1 y 3.2.3) para i.MX 95 e i.MX 952.

## Capacidades

- Clasificación de audio de 1 segundo en 12 clases de palabras clave.
- Detección de palabras de comando en inglés: Down, Go, Left, No, Off, On, Right, Stop, Up, Yes.
- Discriminación de silencio y de palabras desconocidas ("Silence" y "Unknown").
- Inferencia acelerada por NPU en i.MX 8M Plus (VX), i.MX 93 (Ethos-U65) y i.MX 95 / i.MX 952 (eIQ Neutron).
- Ejecución con el runtime eIQ LiteRT (TensorFlow Lite) y el delegado NPU correspondiente.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Wake-word en dispositivos embebidos: el modelo detecta palabras como "Yes" o "Stop" en clips de 1 segundo, lo que permite activar un asistente o una función concreta sin conexión a la nube y con un consumo energético mínimo.
- Control por voz de electrodomésticos: con las diez palabras de comando disponibles ("On", "Off", "Up", "Down", etc.) se pueden mapear acciones directas en hornos, termostatos o sistemas de iluminación sobre un SoC i.MX 93.
- Interfaces de accesibilidad: reconocimiento de comandos vocales básicos para usuarios con movilidad reducida, ejecutándose localmente en el dispositivo y preservando la privacidad del audio.
- Detección de eventos acústicos en industria: integración en nodos de sensores i.MX 8M Plus para disparar alarmas o registrar eventos cuando se pronuncia una palabra clave en un entorno ruidoso controlado.
- Prototipado TinyML y evaluación de NPU: el modelo sirve como referencia para validar el flujo de compilación Vela o Neutron SDK y medir latencia y consumo en las distintas plataformas antes de desplegar modelos propios.
- Automatización del hogar con privacidad: procesamiento íntegro del audio en el propio dispositivo, sin enviar muestras a servidores externos, lo que simplifica el cumplimiento del RGPD.
- Demostraciones y docencia: ejemplo mínimo (53 KB, 23.756 parámetros) para ilustrar el pipeline completo de MFCC, cuantización int8 y despliegue en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo ocupa 53 KB en int8 y se ejecuta en NPU integradas, no en GPU.
- GPU recomendadas: no aplica; el destino son los SoC NXP i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952.
- Cabe en consumer GPU: no aplica; está diseñado para hardware embebido con NPU (Vivante VX, Arm Ethos-U65, eIQ Neutron).
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado NPU correspondiente; los artefactos precompilados se distribuyen por plataforma y versión de BSP (lf-6.18.20_2.0.0, lf-6.18.37_2.1.0) y SDK (Vela lf-6.18.20_2.0.0 / lf-6.18.37_2.1.0, Neutron SDK 3.1.3, 3.2.1, 3.2.3).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| nxp/keyword-spotting-dscnn-imx | 23.756 | MFCC (1, 49, 10, 1) int8 | 12 | Apache-2.0 | NPU i.MX 8M Plus / 93 / 95 / 952 |
| MLPerf Tiny keyword spotting (MLCommons) | 23.756 | MFCC (1, 49, 10, 1) int8 | 12 | Apache-2.0 | Genérico (TFLite) |
| Google Speech Commands DS-CNN (referencia académica) | ~24.000 | MFCC | 12 | no disponible | Microcontroladores |
| Modelos de wake-word comerciales (p. ej. Porcupine) | no disponible | audio PCM | configurable | propietaria | CPU / DSP embebidos |

La comparación con alternativas comerciales no puede completarse con datos verificables a partir de la información disponible; los modelos de la categoría comparten un tamaño de decenas de miles de parámetros y una orientación a inferencia local de baja potencia.

## Limitaciones y advertencias

- El modelo solo reconoce diez palabras en inglés; no soporta otros idiomas ni vocabulario abierto.
- La entrada debe ser exactamente una huella MFCC de 1 segundo con la forma y cuantización especificadas; cualquier desviación en el preprocesado degrada la precisión.
- Riesgo de falsos positivos y negativos en entornos ruidosos; la clase "Unknown" mitiga parcialmente las palabras fuera del vocabulario, pero no garantiza robustez.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- Los artefactos compilados están atados a versiones concretas de BSP y SDK (Vela, Neutron); actualizar el BSP puede requerir recompilar.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene revisar las condiciones del modelo original de MLCommons y del dataset Speech Commands (CC BY 4.0) para la atribución correspondiente.
- No se han publicado métricas de precisión, sesgos o robustez en la información disponible, por lo que no es posible evaluar su comportamiento en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/keyword-spotting-dscnn-imx
- Modelo original MLPerf Tiny (MLCommons): https://github.com/mlcommons/tiny/tree/master/benchmark/training/keyword_spotting
- Benchmark MLPerf Tiny: https://mlcommons.org/en/
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Paper de referencia DS-CNN (arXiv:1711.07128): https://arxiv.org/abs/1711.07128
- Paper de referencia sobre Speech Commands (arXiv:1804.03209): https://arxiv.org/abs/1804.03209
- Paper de referencia MLPerf Tiny (arXiv:2106.07597): https://arxiv.org/abs/2106.07597
