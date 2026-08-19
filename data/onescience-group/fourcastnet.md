# OneScience-Group/FourCastNet

## Resumen

FourCastNet es un modelo global de predicción meteorológica de corto y medio plazo basado en el operador neuronal de Fourier adaptativo (AFNO, por sus siglas en inglés). Fue desarrollado originalmente por NVIDIA junto con varias instituciones académicas, y esta versión publicada por OneScience-Group es una reproducción independiente del modelo descrito en el artículo de Pathak et al. (2022). El modelo está diseñado para trabajar con datos de reanálisis ERA5 y produce pronósticos de alta resolución espacial (0,25 grados) para variables atmosféricas como temperatura, viento, presión y humedad.

A diferencia de los modelos de lenguaje, FourCastNet no procesa texto, sino campos físicos en una malla regular. Su arquitectura AFNO emplea transformadas de Fourier adaptativas en el espacio espectral, lo que le permite capturar dependencias de largo alcance de forma eficiente. Esta implementación de OneScience-Group incluye scripts de entrenamiento, inferencia y evaluación, así como una integración con el entorno OneCode para ejecución en clústeres con GPU o DCU. El modelo es relevante ahora porque ofrece una alternativa open source y reproducible a los sistemas numéricos tradicionales de predicción meteorológica, con un coste computacional mucho menor.

La licencia es Apache 2.0, lo que permite uso comercial y modificación. Sin embargo, hay que tener en cuenta que los pesos entrenados aún no están disponibles públicamente (se espera que se suban próximamente), por lo que de momento solo se puede utilizar el código para entrenar desde cero con los datos ERA5 proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AFNO (Adaptive Fourier Neural Operator) |
| Parametros totales | no disponible (el paper original reporta ~100 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de campos fisicos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (archivos .pth, segun los scripts de entrenamiento) |

## Arquitectura y entrenamiento

FourCastNet se basa en el operador neuronal de Fourier adaptativo (AFNO), una variante de los operadores neuronales de Fourier (FNO) que opera directamente en el dominio espectral. La arquitectura original procesa los campos de entrada (variables atmosféricas en una malla de 720×1440, equivalente a 0,25 grados) mediante una serie de bloques que aplican transformadas de Fourier rápidas (FFT) y filtros adaptativos aprendidos. Esto permite modelar interacciones globales sin depender de la resolución espacial, a diferencia de las redes convolucionales tradicionales.

El entrenamiento se realiza con datos de reanálisis ERA5, que proporcionan campos atmosféricos históricos con una resolución temporal horaria. En esta implementación, OneScience-Group proporciona un subconjunto del dataset ERA5 (disponible en HuggingFace) y scripts para entrenamiento en una o varias GPU mediante `torchrun`. No se especifica el número total de tokens ni la composición exacta del dataset, pero el paper original describe un entrenamiento con 20 variables atmosféricas y una resolución temporal de 6 horas. Tampoco se menciona el uso de técnicas de RLHF o DPO, ya que no es un modelo generativo de lenguaje.

Una innovación destacable es la eficiencia computacional: AFNO reduce la complejidad de atención de O(n²) a O(n log n) gracias al uso de la FFT, lo que permite manejar mallas globales de alta resolución con un coste razonable.

## Capacidades

- Prediccion meteorologica global a corto y medio plazo (tipicamente de 1 a 14 dias).
- Generacion de pronosticos para multiples variables atmosfericas: temperatura, viento (componentes u y v), presion a nivel del mar, humedad especifica, geopotencial, etc.
- Resolucion espacial de 0,25 grados (aproximadamente 25 km), comparable a los modelos numericos operativos.
- Salida en forma de campos 2D que pueden visualizarse como mapas meteorologicos.
- Soporte para entrenamiento desde cero con datos propios (si se dispone de datos en formato ERA5).
- Capacidad de ejecucion en GPU y DCU (aceleradores chinos), con soporte para entrenamiento distribuido multi-GPU.
- No incluye capacidades de lenguaje, vision ni tool calling.

## Casos de uso

- Investigacion en ciencias atmosfericas: el modelo permite experimentar con tecnicas de deep learning para prediccion meteorologica sin necesidad de infraestructura de supercomputacion. Se puede entrenar con el dataset ERA5 proporcionado y comparar resultados con modelos numericos.
- Generacion de pronosticos operativos de corto plazo: una vez entrenado, el modelo puede producir predicciones a 1-7 dias con un coste computacional minimo, util para servicios meteorologicos locales o regionales.
- Estudio de eventos extremos: al predecir campos de temperatura y viento, puede usarse para anticipar olas de calor, tormentas o frentes frios, aunque su resolucion no captura fenomenos de mesoescala.
- Integracion en pipelines de datos para energia renovable: la prediccion de viento y radiacion solar (si se incluye como variable) puede alimentar sistemas de estimacion de produccion eolica y fotovoltaica.
- Educacion y formacion: al ser un codigo abierto y bien documentado, sirve como material didactico para cursos de machine learning aplicado a geociencias.
- Validacion de nuevas arquitecturas: al proporcionar un punto de referencia reproducible, permite comparar innovaciones en operadores neuronales o tecnicas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de RMSE, ACC ni comparaciones con otros modelos. El paper original de FourCastNet reporta mejoras frente a modelos numericos como GFS y otros metodos de deep learning, pero esos datos corresponden a la implementacion original de NVIDIA, no a esta reproduccion. Se recomienda consultar el articulo de arXiv para obtener los resultados de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamano del modelo (~100M de parametros en el paper original), se estima que cabe en GPUs con 8 GB o menos en precision FP32. Con cuantizacion a FP16, podria caber en 4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4090, A100). Tambien soporta DCU (aceleradores chinos) con DTK 25.04.2 o superior.
- CPU: la model card indica que la CPU puede usarse para pruebas de conectividad, pero el entrenamiento e inferencia completos seran muy lentos.
- Opciones de despliegue: los scripts proporcionados usan PyTorch directamente. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. En una GPU de gama alta, la inferencia de un campo global deberia ser del orden de milisegundos a segundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FourCastNet (OneScience) | AFNO | ~100M (estimado) | 0.25° | Apache 2.0 | Codigo abierto, pesos pendientes |
| Pangu-Weather (Huawei) | Transformer 3D | ~256M | 0.25° | No comercial | Pesos disponibles para investigacion |
| GraphCast (DeepMind) | GNN | ~36M | 0.25° | Apache 2.0 | Pesos y codigo disponibles |
| IFS (ECMWF) | Modelo numerico | N/A | ~9 km | Propietario | Acceso restringido |

FourCastNet se diferencia de Pangu-Weather y GraphCast por su uso de operadores de Fourier, que ofrecen una eficiencia computacional superior en mallas regulares. Sin embargo, esta reproduccion de OneScience no incluye pesos preentrenados, por lo que requiere un entrenamiento desde cero con los datos ERA5 proporcionados, lo que supone una barrera de entrada mayor que GraphCast, que ya ofrece pesos listos para usar.

## Limitaciones y advertencias

- Los pesos entrenados no estan disponibles actualmente; la model card indica que se subiran proximamente, pero hasta entonces solo se puede entrenar desde cero.
- El modelo esta diseñado para datos de reanalisis ERA5; su uso con otras fuentes de datos puede requerir adaptaciones en el preprocesado.
- La resolucion de 0,25 grados no captura fenomenos de mesoescala (tormentas locales, niebla, etc.), por lo que no es adecuado para prediccion de muy corto plazo a nivel local.
- Al ser una reproduccion independiente, no hay garantia de que los resultados coincidan exactamente con los del paper original de NVIDIA.
- No se proporcionan metricas de error ni validacion exhaustiva, por lo que el usuario debe realizar sus propias evaluaciones antes de usarlo en entornos operativos.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar la fuente original (Pathak et al., 2022) y esta implementacion.
- El entrenamiento requiere una cantidad considerable de datos (ERA5 completo son varios TB); el dataset proporcionado es solo una muestra, por lo que para obtener resultados reales habra que descargar el conjunto completo desde otras fuentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/FourCastNet
- Dataset ERA5 en HuggingFace: https://huggingface.co/datasets/OneScience-Group/ERA5 (en la model card se indica `OneScience/ERA5`)
- Paper original: https://arxiv.org/abs/2202.11214
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorios en Gitee: https://gitee.com/onescience-ai/onescience y https://gitee.com/onescience-ai/oneskills
