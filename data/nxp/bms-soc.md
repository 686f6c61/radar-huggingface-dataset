# nxp/BMS-SoC

## Resumen

BMS-SoC es un modelo de redes neuronales recurrentes (LSTM) para la estimación del estado de carga (State of Charge, SoC) de baterías de ion-litio, publicado por NXP Semiconductors. No es un modelo de lenguaje: es un modelo de regresión temporal orientado a sistemas embebidos de gestión de baterías (Battery Management Systems, BMS). Deriva del trabajo académico de Kei Long Wong et al. (GoodIT '21) y ha sido reducido en complejidad, cuantizado a int8 y compilado específicamente para el microcontrolador NXP S32K5 mediante las herramientas eIQ Auto.

El modelo resuelve un problema concreto de ingeniería: estimar en tiempo real el SoC de una batería a partir de secuencias de medidas de tensión, corriente y temperatura, con un coste computacional y de memoria compatible con un MCU automotriz. Para ello se han eliminado capas LSTM del modelo original, se ha aplicado cuantización int8 vía TFLite y se ha convertido al formato Neutron TFLite para su ejecución sobre la NPU del S32K5.

Su relevancia es acotada pero clara: demuestra un flujo completo de despliegue de IA en silicio automotriz (entrenamiento, cuantización, compilación con Glow, validación en eIQ Auto Premium 3.17.0 CD), y sirve como receta reproducible para ingenieros que necesiten llevar modelos de estimación de estado a MCUs de la familia S32K5. El repositorio ocupa 0,1 GB y contiene principalmente scripts de entrenamiento, no pesos listos para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM recurrente (número de capas no especificado; reducido respecto al original) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales, no de texto) |
| Tipos de cuantizacion | int8 (TFLite); formato Neutron TFLite para NPU |
| Idiomas soportados | no aplica (modelo numérico de regresión) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite / Neutron TFLite (compilado para S32K5); pesos originales no disponibles en el repo |

## Arquitectura y entrenamiento

La arquitectura es una red LSTM de complejidad reducida respecto al modelo base `KeiLongW/battery-state-estimation`. NXP eliminó varias capas LSTM para acelerar el entrenamiento y reducir el tiempo de despliegue en el S32K5. La entrada es una secuencia temporal de medidas de batería (tensión, corriente, temperatura, según el trabajo original) y la salida es la estimación del SoC. No se documenta en la model card el número exacto de capas, unidades ocultas ni la longitud de secuencia.

El entrenamiento se realizó sobre un dataset derivado por NXP (no se especifica tamaño, composición ni número de ciclos de descarga). Tras el entrenamiento se aplicó cuantización int8 con TFLite usando un dataset de calibración también derivado por NXP, y posteriormente se compiló con las herramientas eIQ Auto y el compilador Glow para generar el formato Neutron TFLite ejecutable en la NPU del S32K5. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión. La validación se realizó con eIQ Auto Premium Edition 3.17.0 CD para S32K5.

## Capacidades

- Estimación del estado de carga (SoC) de baterías de ion-litio a partir de secuencias temporales de medidas eléctricas y térmicas.
- Inferencia sobre la NPU del microcontrolador NXP S32K5 en formato Neutron TFLite.
- Ejecución con cuantización int8, adecuada para recursos de memoria y cómputo limitados.
- Entrenamiento reproducible mediante los scripts incluidos en el repositorio.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling ni agentes.
- No es multilingüe ni procesa lenguaje natural.

## Casos de uso

- Estimación de SoC en vehículos eléctricos e híbridos: el modelo se ejecuta en el BMS sobre el S32K5 y actualiza la estimación de carga a partir del flujo continuo de medidas de tensión y corriente, sustituyendo o complementando métodos de conteo de coulomb y tablas de búsqueda.
- Gestión de paquetes de baterías en sistemas de almacenamiento estacionario: integración en el firmware del BMS para monitorizar el estado de carga de cada celda o módulo con latencia determinista sobre MCU.
- Electrónica de consumo con batería de litio (herramientas, drones, portátiles): despliegue en MCU de bajo coste para mejorar la precisión del indicador de carga frente a estimaciones lineales.
- Investigación y prototipado académico: reproducción del pipeline completo (entrenamiento, cuantización int8, compilación con Glow) como base para experimentar con arquitecturas LSTM en estimación de estados.
- Validación de flujos de IA embebida en automoción: uso como caso de referencia para verificar la cadena eIQ Auto sobre S32K5 antes de portar modelos propios.
- Benchmark de cuantización en MCU: comparación de precisión int8 frente al modelo original en FP32 para cuantificar la pérdida de exactitud introducida por la reducción de capas y la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error (RMSE, MAE) ni comparaciones numéricas con el modelo original ni con métodos clásicos de estimación de SoC.

## Requisitos de hardware

- Hardware objetivo: microcontrolador NXP S32K5 con NPU, ejecutando el modelo en formato Neutron TFLite.
- VRAM: no aplica; el modelo se ejecuta en memoria del MCU, cuyo tamaño no se especifica en la información disponible.
- GPU recomendadas: no aplica para inferencia; para el entrenamiento se puede usar cualquier GPU convencional, pero no se documentan requisitos.
- GPU de consumo: no aplica al despliegue; el entrenamiento con LSTM reducidas es viable en GPU de consumo, aunque no se especifica.
- Opciones de despliegue: eIQ Auto Premium Edition 3.17.0 CD con compilador Glow para S32K5; TFLite para prototipado en host.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| nxp/BMS-SoC | LSTM reducida | no disponible | int8 (TFLite/Neutron) | NXP S32K5 (NPU) | Apache 2.0 |
| KeiLongW/battery-state-estimation | LSTM completa | no disponible | no especificada | host / genérico | Apache 2.0 |
| Métodos clásicos (conteo de coulomb, EKF) | modelo analítico | no aplica | no aplica | MCU genérico | según implementación |

La comparación cuantitativa con el modelo original no está disponible en la información proporcionada; la propia model card advierte que la eliminación de capas y la cuantización int8 pueden degradar la precisión respecto al modelo base.

## Limitaciones y advertencias

- Modelo específico de hardware: diseñado y validado únicamente para el NXP S32K5; no es portable directamente a otras plataformas sin recompilación.
- La reducción de capas LSTM respecto al modelo original puede degradar la precisión de la estimación de SoC.
- La cuantización int8 introduce diferencias de exactitud frente al modelo en punto flotante; no se cuantifica esa pérdida en la documentación.
- El dataset de entrenamiento y calibración es derivado por NXP y no se describe su composición, cobertura de química de batería ni condiciones de temperatura; el modelo puede generalizar mal fuera de ese dominio.
- El repositorio contiene scripts de entrenamiento, no un paquete de inferencia listo para uso; para ejecutar en placa es necesario seguir la guía del paquete eIQ Auto.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero sí un posible sesgo de dominio: el modelo refleja las condiciones de las baterías y ciclos del dataset de NXP.
- Licencia Apache 2.0 permite uso comercial, pero se debe citar el trabajo original de Wong et al. (GoodIT '21) y respetar los términos del modelo base.
- No debe interpretarse como sustituto de un sistema de seguridad de batería; la estimación de SoC no cubre protección frente a sobrecarga, sobredescarga o fallos térmicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/BMS-SoC
- Modelo original (repositorio): https://github.com/KeiLongW/battery-state-estimation
- Licencia del modelo original: https://github.com/KeiLongW/battery-state-estimation?tab=Apache-2.0-1-ov-file
- Paper de referencia: https://doi.org/10.1145/3462203.3475878
- Documentación de eIQ Auto para S32K5: no disponible en la información proporcionada.
