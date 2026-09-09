# OneScience-Group/PBL-Emulator

## Resumen

PBL-Emulator es un modelo de aprendizaje automático especializado en ciencias de la Tierra, desarrollado por OneScience-Group sobre la metodología propuesta por los equipos de la División de Ciencias Ambientales y la División de Matemáticas y Ciencias de la Computación del Laboratorio Nacional Argonne. Su función es emular de forma offline la parametrización de la capa límite planetaria (PBL) utilizada en modelos de pronóstico meteorológico numérico, diagnosticando los perfiles verticales de viento, temperatura y vapor de agua a partir de variables de estado y forzamiento cercanas a la superficie. Se trata de un modelo de regresión numérica, no de un modelo de lenguaje.

La arquitectura se describe como una red neuronal con conocimiento de dominio (domain-aware neural network), que mapea 16 variables de entrada a 5 salidas distribuidas en 17 posiciones verticales, todo en el mismo instante temporal. El modelo original del paper (doi: 10.5194/gmd-12-4261-2019) fue entrenado con datos generados por WRF v3.3.1 con forzamiento NCEP-R2 y el esquema YSU, cubriendo el periodo 1984-2005. En el repositorio actual no se incluyen pesos oficiales; se proporciona un flujo de trabajo de validación de ingeniería con datos sintéticos estructurados. La relevancia actual reside en ofrecer una alternativa de baja latencia y coste computacional frente a simulaciones completas, útil para estudios de sensibilidad y validación de infraestructura AI4S.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Domain-aware neural network (emulador de parametrización de capa límite planetaria) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de regresión con 16 variables de entrada y 17 niveles verticales de salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo científico basado en variables numéricas; documentacion en ingles) |
| Licencia | Apache-2.0 (repositorio HuggingFace); codigo oficial del paper: BSD-3-Clause; texto del paper: CC BY 4.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`) generado localmente; no se incluyen pesos oficiales |

## Arquitectura y entrenamiento

La arquitectura consiste en una red neuronal con conocimiento de dominio diseñada para emular la parametrización de la capa límite planetaria YSU. La propuesta técnica original se describe en el artículo "Fast domain-aware neural network emulation of a planetary boundary layer parameterization in a numerical weather forecast model" (GMD, 2019). El enfoque aprende a diagnosticar los perfiles verticales de viento, temperatura y vapor de agua a partir de 16 variables de superficie y forzamiento, sin necesidad de ejecutar el modelo WRF completo. El modelo es puramente discriminativo: la salida se genera para el mismo timestamp que la entrada, por lo que no es un modelo de pronóstico futuro.

Los datos de entrenamiento del paper corresponden al periodo 1984-2005, generados mediante WRF v3.3.1 con forzamiento NCEP-R2 y el esquema de capa límite YSU. En el repositorio se distribuye un conjunto de datos sintéticos estructurados que reproducen ciclos diurnos y estacionales, estructura vertical y relaciones físicas entre calor, humedad y viento, pero que no representan la distribución real de WRF. El formato de los datos es de `[N,16]` entradas a salidas `[N,17,5]`. El script de entrenamiento por defecto reduce la duración del protocolo original de 1000 épocas a 6 épocas, sin alterar las dimensiones de entrada y salida. No se aplican técnicas de alineación como RLHF o DPO, al no tratarse de un modelo de lenguaje.

## Capacidades

- Diagnóstico offline de perfiles verticales de viento, temperatura y vapor de agua en la capa límite planetaria a partir de estados y forzamientos de superficie.
- Salida en el mismo instante temporal que la entrada (no realiza pronóstico de estados futuros).
- Soporta dos esquemas de condicionamiento vertical: condicionamiento de niveles inferiores adyacentes (HPC) y condicionamiento de todos los niveles inferiores (HAC).
- Procesa tensores numéricos de dimensiones `[N,16]` a `[N,17,5]`.
- Incluye un pipeline completo con scripts de generación de datos sintéticos, entrenamiento, inferencia, evaluación y visualización.
- Soporta ejecución multi-GPU mediante `torchrun` con configuración de nodo único y múltiples procesos.
- No incluye generación de texto, razonamiento simbólico, código, visión, herramienta de llamada (tool calling), agentes ni capacidades multilingües, al ser un modelo científico de regresión.

## Casos de uso

- Diagnóstico meteorológico offline: permite obtener perfiles verticales de la capa límite a partir de observaciones de superficie sin ejecutar el modelo WRF, útil para reanálisis, análisis de datos históricos o estudios de caso en tiempo real.
- Emulador de parametrización en modelos de pronóstico: el modelo puede sustituir la parametrización YSU en un modelo meteorológico, reduciendo el coste computacional en simulaciones de largo plazo o de alta resolución.
- Investigación de dependencia vertical: permite comparar el comportamiento de la capa límite cuando se condiciona con niveles adyacentes (HPC) frente a todos los niveles inferiores (HAC), aportando evidencia para refinar esquemas físicos.
- Validación de infraestructura AI4S en OneCode o ModelScope: sirve como carga de trabajo de prueba para comprobar el correcto flujo de generación de datos, entrenamiento, inferencia, métricas y visualización en plataformas científicas.
- Prueba de entrenamiento distribuido en clúster: el flujo multi-GPU con `torchrun` permite verificar la gestión de checkpoints y la escalabilidad en entornos HPC con GPUs o DCUs.
- Docencia en ciencias atmosféricas: las gráficas de perfiles generadas por `result.py` permiten visualizar la relación entre calor, humedad y viento en la capa límite, facilitando la enseñanza de la física atmosférica.
- Generación de datos sintéticos para pruebas: los datos estructurados con ciclos diurnos y estacionales son adecuados para desarrollar y depurar herramientas de análisis y modelización atmosférica sin depender de datos observacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no ofrece cifras de rendimiento sobre MMLU, HumanEval, GSM8K u otros conjuntos de evaluación estándar, ya que el modelo no es un modelo de lenguaje. El paper original (doi: 10.5194/gmd-12-4261-2019) puede contener métricas de validación específicas para la emulación de perfiles PBL, pero no se detallan en la tarjeta del modelo ni en la información proporcionada. Los resultados de evaluación sobre los datos sintéticos del repositorio son exclusivamente de validación de ingeniería y no representan el rendimiento del paper.

## Requisitos de hardware

- Se recomienda una GPU o una DCU para el entrenamiento e inferencia con datos reales.
- Una CPU puede utilizarse para validar el flujo de trabajo con la configuración por defecto de pequeñas muestras.
- Para usuarios de DCU, es necesario instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster utilizado.
- No se especifica la VRAM estimada para inferencia en la documentación.
- No se indican modelos de GPU concretos (A100, H100, RTX 4090, etc.). Dado el reducido tamaño de la red (16 entradas, 17 niveles verticales y 5 salidas), se espera que quepa en cualquier GPU actual, pero no hay datos oficiales que lo confirmen.
- Las opciones de despliegue no son las de un modelo de lenguaje: no aplican frameworks como vLLM, llama.cpp, Ollama o TGI. El modelo se ejecuta mediante scripts Python en el entorno `onescience[earth-gpu]` o `onescience[earth-dcu]`.
- La latencia y el throughput no están disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. La referencia científica más próxima es la parametrización YSU original del modelo WRF, pero no se trata de un modelo de IA comparable. Dado que el repositorio no ofrece datos de rendimiento, no es posible realizar una comparación cuantitativa con otras alternativas.

## Limitaciones y advertencias

- No se incluyen pesos oficiales del paper; el checkpoint `result/checkpoints/pbl_emulator.pt` es un artefacto de validación de ingeniería generado localmente y no debe presentarse como un modelo preentrenado oficial.
- Los datos sintéticos del repositorio no representan la distribución del dataset WRF ni el rendimiento descrito en el paper; los resultados obtenidos con ellos carecen de valor científico para experimentos formales.
- El modelo está limitado al diagnóstico del mismo timestamp. No es un modelo de pronóstico y no puede generar predicciones temporales futuras.
- Los experimentos formales requieren los datos reales de 1984-2005, el esquema YSU y la duración completa de entrenamiento de 1000 épocas.
- La licencia del repositorio es Apache-2.0, pero el código original del paper se publica bajo BSD-3-Clause y el texto bajo CC BY 4.0. Hay que revisar las condiciones de cada componente antes de un uso comercial o redistribución.
- Al ser un modelo de dominio específico, no posee capacidades de lenguaje natural, visión ni entendimiento general. No puede responder preguntas ni procesar texto en ningún idioma.
- El modelo ha sido entrenado con datos meteorológicos de 1984-2005, por lo que puede presentar limitaciones al aplicarse a condiciones climáticas actuales o extremas que no estén representadas en ese periodo.
- No se documenta el número exacto de parámetros ni la complejidad de la red, lo que dificulta estimar los recursos de memoria y cómputo de forma precisa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/OneScience-Group/PBL-Emulator
- Paper original: https://doi.org/10.5194/gmd-12-4261-2019
- Repositorio principal OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio principal OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Plataforma OneCode (demo): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
