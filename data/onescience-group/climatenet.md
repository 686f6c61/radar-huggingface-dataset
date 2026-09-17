# OneScience-Group/ClimateNet

## Resumen

ClimateNet es un modelo de segmentación semántica a nivel de píxel, desarrollado para detectar y delimitar dos fenómenos meteorológicos extremos: ciclones tropicales (TC, por sus siglas en inglés) y ríos atmosféricos (AR). El modelo se apoya en la arquitectura DeepLabv3+ y se entrenó con campos de cuatro canales procedentes de simulaciones CAM5.1, junto con máscaras de segmentación etiquetadas por expertos. El trabajo original fue propuesto por equipos de LBNL, UC Berkeley, ETH Zurich, NVIDIA, NCAR y colaboradores, y se publicó en la revista Geoscientific Model Development (GMD) en 2021.

El repositorio analizado, OneScience-Group/ClimateNet, es una reproducción de ingeniería independiente de las especificaciones públicas del ClimateNet original. No incluye pesos entrenados en el directorio `weight/`; los autores remiten a los modelos y datos oficiales alojados en el portal de NERSC. El paquete se distribuye con licencia Apache 2.0, está orientado a ejecución en GPU o DCU y expone scripts de validación de datos, entrenamiento (incluido multi-GPU vía `torchrun`), inferencia y cálculo de métricas de segmentación.

El modelo es relevante para la comunidad de ciencias de la Tierra porque automatiza una tarea de etiquetado que tradicionalmente requiere expertos, y porque permite transferir la segmentación a experimentos de calentamiento climático y extraer estadísticas de precipitación condicionadas por evento. No es un modelo de lenguaje: opera sobre rejillas de campos atmosféricos, no sobre texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabv3+ (segmentación semántica a nivel de píxel) |
| Parametros totales | no disponible (la model card no especifica backbone ni número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación sobre campos meteorológicos, no un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa campos atmosféricos, no texto) |
| Licencia | Apache 2.0 (el paper original se publica bajo CC BY 4.0; modelos, código y datos oficiales mantienen sus propios términos) |
| Formato de pesos | no disponible (no se incluyen pesos en el repositorio) |
| Framework | PyTorch |
| Entrada | Campos CAM5.1 de cuatro canales |
| Salida | Probabilidades de clase por píxel (background, TC, AR) y métricas IoU por clase y media |
| Año de publicación del paper | 2021 |

## Arquitectura y entrenamiento

La arquitectura es DeepLabv3+, un esquema de segmentación semántica que combina convoluciones atroces (dilatadas) en el encoder con un módulo decoder que recupera resolución espacial para refinar los límites de los objetos segmentados. En este caso, la entrada son campos de cuatro canales derivados de simulaciones CAM5.1, y la salida es una máscara de tres clases: fondo, ciclón tropical y río atmosférico. La model card no especifica el backbone concreto (por ejemplo, ResNet) ni el número de parámetros.

El entrenamiento utiliza entropía cruzada ponderada, presumiblemente para compensar el desequilibrio entre clases, ya que los píxeles de TC y AR son una fracción pequeña del total. Los datos de entrenamiento son el conjunto ClimateNet, un dataset abierto etiquetado por expertos con máscaras de segmentación sobre los campos CAM5.1. La model card no detalla el número de tokens, el volumen exacto de muestras ni si se aplicaron técnicas de ajuste posteriores como RLHF o DPO, algo por otra parte poco habitual en este tipo de modelos de visión/segmentación científica. La inferencia devuelve probabilidades de clase finitas junto con un informe de evaluación con IoU por clase y media.

## Capacidades

- Segmentación semántica a nivel de píxel de tres clases: fondo, ciclón tropical y río atmosférico.
- Detección de ciclones tropicales en campos atmosféricos simulados.
- Detección de ríos atmosféricos en campos atmosféricos simulados.
- Análisis de precipitación condicionada por evento, extrayendo estadísticas de precipitación asociadas a TC y AR.
- Transferencia de la segmentación a experimentos de calentamiento climático.
- Validación de datos, entrenamiento, inferencia, métricas de segmentación y visualización en el entorno ModelScope/OneCode.
- Entrenamiento multi-GPU y multi-proceso mediante `torchrun`.
- Cálculo de métricas de evaluación de segmentación (IoU por clase y media).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes o multimodalidad de propósito general.

## Casos de uso

- Investigación climática sobre eventos extremos: el modelo segmenta automáticamente ciclones tropicales y ríos atmosféricos en grandes volúmenes de campos CAM5.1, sustituyendo el etiquetado manual por expertos y reduciendo el coste de análisis a escala de simulación.
- Análisis de precipitación condicionada por evento: a partir de las máscaras predichas se pueden extraer estadísticas de precipitación asociadas exclusivamente a píxeles de TC o AR, lo que permite separar la contribución del evento extremo del fondo climático.
- Experimentos de calentamiento climático: el modelo permite transferir la segmentación entrenada en un clima base a simulaciones de escenarios más cálidos, facilitando estudiar cómo cambian la frecuencia e intensidad de TC y AR.
- Validación y benchmarking de pipelines de segmentación: dado que el repositorio incluye scripts de métricas (IoU por clase y media), sirve como banco de pruebas para comparar arquitecturas o hiperparámetros sobre el dataset ClimateNet.
- Reproducibilidad de resultados científicos: al ser una reproducción independiente de las especificaciones públicas del paper, permite verificar y reejecutar el flujo completo de datos, entrenamiento e inferencia en un entorno controlado con GPU o DCU.
- Formación y docencia en ciencia de datos aplicada al clima: el flujo `fake_data.py` → `train.py` → `inference.py` → `result.py` facilita prácticas reproducibles con datos sintéticos antes de escalar a datos reales.
- Integración en infraestructura de computación científica: el soporte de `torchrun` con `--nproc_per_node` permite lanzar entrenamiento distribuido en clústeres con múltiples GPU, útil para reentrenar sobre datasets ampliados.
- Automatización de catalogación de eventos extremos: el modelo puede generar máscaras de TC/AR sobre archivos históricos de simulaciones para construir catálogos de eventos etiquetados de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la inferencia genera un informe de evaluación con IoU por clase y media, pero no incluye cifras concretas, ni comparaciones con otros modelos en el repositorio analizado.

## Requisitos de hardware

- La model card recomienda una GPU o una DCU para el uso normal.
- Es posible usar CPU para validación de conectividad con la configuración de muestra pequeña por defecto.
- Los usuarios de DCU deben instalar primero DTK 25.04.2 o una versión compatible recomendada por OneScience.
- VRAM estimada para inferencia: no disponible (no se publican cifras en la model card).
- GPU recomendadas concretas (A100, H100, RTX 4090, etc.): no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Entorno de referencia: Python 3.11 mediante Conda; en GPU se instalan `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`.
- Instalación GPU: `pip install onescience[earth-gpu] -i http://mirrors.onescience.ai:3141/pypi/simple/ --trusted-host mirrors.onescience.ai`.
- Instalación DCU: `pip install onescience[earth-dcu] -i http://mirrors.onescience.ai:3141/pypi/simple/ --trusted-host mirrors.onescience.ai`.
- Despliegue: PyTorch nativo; entrenamiento distribuido con `torchrun --standalone --nproc_per_node=2 scripts/train.py`.
- Opciones tipo vLLM, llama.cpp, Ollama o TGI: no aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OneScience-Group/ClimateNet | Segmentación semántica de eventos extremos | DeepLabv3+ | no disponible | no aplica | Apache 2.0 | HuggingFace, sin pesos incluidos |
| ClimateNet oficial (LBNL, UC Berkeley, ETH Zurich, NVIDIA, NCAR) | Segmentación semántica de eventos extremos | DeepLabv3+ | no disponible | no aplica | CC BY 4.0 (paper); modelos, código y datos con sus propios términos | Portal de NERSC |
| U-Net (implementación genérica de segmentación) | Segmentación semántica | Encoder-decoder con skip connections | no disponible | no aplica | según implementación | Amplia disponibilidad en librerías de visión |

La model card no ofrece métricas ni comparaciones cuantitativas frente a alternativas, por lo que no es posible establecer una comparación de rendimiento con datos verificables.

## Limitaciones y advertencias

- No se incluyen pesos entrenados en el repositorio (`weight/` está vacío); hay que obtener los modelos oficiales desde el portal de NERSC para un uso real.
- El repositorio se declara como una reproducción de ingeniería independiente de las especificaciones públicas; no es el lanzamiento oficial del consorcio autor.
- La licencia Apache 2.0 de este repositorio no cubre necesariamente los modelos, datos y código oficiales del proyecto original, que mantienen sus propios términos.
- El paper original se publica bajo CC BY 4.0, con condiciones distintas a las del repositorio.
- El modelo está pensado para campos CAM5.1 de cuatro canales; su aplicación a otras fuentes de datos (por ejemplo, reanálisis ERA5 u otros modelos climáticos) requeriría validación adicional y no está documentada.
- No se documentan sesgos específicos, pero al tratarse de un modelo entrenado con un dataset concreto, su generalización a regímenes climáticos no representados en el entrenamiento es incierta.
- No hay información sobre el desequilibrio de clases final, el rendimiento en regiones oceánicas concretas ni la sensibilidad a la resolución espacial.
- No se publican cifras de benchmarks, por lo que no es posible estimar el riesgo de falsos positivos o negativos en producción.
- La única lengua etiquetada es el inglés, aunque en la práctica el modelo no procesa texto.
- No hay garantías documentadas de mantenimiento del repositorio (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/ClimateNet
- Paper original (GMD, 2021): https://doi.org/10.5194/gmd-14-107-2021
- Modelos y datos oficiales del proyecto ClimateNet: https://portal.nersc.gov/project/ClimateNet/
- No se han encontrado enlaces adicionales relevantes en los resultados de búsqueda web proporcionados (los resultados recibidos corresponden a servicios de correo y no guardan relación con el modelo).
