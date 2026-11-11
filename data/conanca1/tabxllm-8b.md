# conanca1/TabXLLM-8B

## Resumen

TabXLLM-8B es un modelo de lenguaje de 8.190.735.360 parámetros derivado de Qwen/Qwen3-8B-Base, desarrollado por el autor conanca1 (vinculado al laboratorio HKUSTGZ-ML4Health-Lab) y orientado específicamente a la predicción tabular, es decir, clasificación y regresión sobre datos estructurados en formato de tabla. El modelo se entrena mediante Permutation Relative Policy Optimization (PRPO), una variante de optimización por política con refuerzo descrita en el paper arXiv:2510.17385, y se distribuye como pesos oficiales del artículo junto con sus ficheros de configuración y tokenizador.

El problema que aborda es el de aplicar modelos de lenguaje de gran escala a tareas tabulares clásicas (predicción de una columna objetivo a partir de filas con múltiples atributos), un dominio tradicionalmente cubierto por gradient boosting y modelos especializados. La propuesta consiste en reformular la predicción tabular como una tarea de generación condicionada y optimizarla con refuerzo, aprovechando la arquitectura transformer subyacente de Qwen3.

La relevancia actual del modelo radica en su enfoque metodológico (PRPO sobre un LLM base de 8B) más que en su adopción: el repositorio acumula 43 descargas y 0 likes en el momento de la consulta, y la model card es muy escueta en cuanto a especificaciones de despliegue, licencia e idiomas. La información disponible sobre contexto, cuantización y rendimiento es limitada y se indica como no disponible cuando no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-8B-Base); detalles internos de capas y atención no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer decoder-only de aproximadamente 8.190 millones de parámetros. Sobre esa base, el autor aplica un ajuste orientado a predicción tabular mediante Permutation Relative Policy Optimization (PRPO), un método de aprendizaje por refuerzo que, según la descripción del paper, optimiza la política del modelo considerando el orden o permutación relativa de las predicciones. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset tabular, ni si hubo fases adicionales de SFT, DPO o RLHF más allá de PRPO.

La innovación técnica destacable es el propio uso de PRPO para tareas tabulares, un dominio donde el refuerzo con recompensas relativas resulta poco habitual. Los datos de entrenamiento asociados se publican en el repositorio de dataset conanca1/TabXLLM, y el código de entrenamiento e inferencia está disponible en el repositorio GitHub del laboratorio. No consta información sobre técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Predicción tabular: clasificación y regresión sobre filas de datos estructurados, reformuladas como generación condicionada.
- Generación de texto conversacional: heredada de la base Qwen3 y etiquetada como `conversational` en los tags del repositorio.
- Razonamiento sobre atributos: al tratarse de un LLM base ajustado, puede manejar descripciones textuales de columnas y valores.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no constan).
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el modelo es de texto.

## Casos de uso

- Predicción de riesgo en datos clínicos tabulares: el modelo puede recibir filas con variables de pacientes (edad, analíticas, antecedentes) y generar la etiqueta de riesgo o el valor de regresión, aprovechando el ajuste específico con PRPO para este tipo de datos estructurados.
- Scoring crediticio y evaluación de solvencia: integrado como componente de un pipeline que serializa las variables del solicitante y obtiene una predicción de impago, con la ventaja de manejar descripciones textuales de columnas heterogéneas.
- Regresión sobre datos de sensores o series tabulares agregadas: útil en entornos industriales donde cada fila resume lecturas de múltiples sensores y se requiere estimar una variable continua objetivo.
- Enriquecimiento de bases de datos empresariales: el modelo puede completar columnas faltantes o predecir atributos en registros de CRM/ERP serializados como tablas, reduciendo la necesidad de modelos específicos por tabla.
- Investigación en aprendizaje por refuerzo aplicado a datos tabulares: sirve como referencia reproducible (pesos oficiales del paper, código y dataset publicados) para estudiar PRPO y compararlo con gradient boosting o redes tabulares.
- Prototipado rápido en ciencia de datos: al ser un LLM, permite describir la tarea en lenguaje natural junto con los datos serializados, lo que facilita experimentar con nuevas tablas sin reentrenar un modelo dedicado.
- Evaluación comparativa de LLMs en predicción tabular: útil como baseline de 8B para medir hasta qué punto un transformer ajustado con refuerzo compite con métodos tabulares clásicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: en torno a 4-5 GB de pesos, viable en GPUs consumer de 8 GB, aunque no se publican variantes GGUF/AWQ/GPTQ oficiales.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en producción y lotes grandes; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag del repo) y endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no se confirman explícitamente en la información disponible, aunque la arquitectura Qwen3 suele ser compatible con vLLM y llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabXLLM-8B | 8,19B | No disponible | LLM ajustado con PRPO para predicción tabular | No disponible | Hugging Face (43 descargas) |
| Qwen3-8B-Base | ~8B | No disponible en esta ficha | LLM base generalista | No disponible en esta ficha | Hugging Face (modelo base) |
| Gradient boosting (XGBoost/LightGBM) | No aplica | No aplica | Modelos tabulares clásicos | Apache 2.0 / MIT | Ampliamente disponible |

La comparación con Qwen3-8B-Base es directa por herencia: TabXLLM-8B añade el ajuste PRPO para tablas y conserva el tamaño. Frente a XGBoost o LightGBM, la diferencia es de paradigma: los métodos de boosting suelen ser más eficientes en datos tabulares puros, mientras que TabXLLM-8B aporta flexibilidad de lenguaje natural a costa de un consumo de recursos mucho mayor. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de un LLM generalista, puede heredar sesgos de Qwen3-8B-Base.
- Riesgo de alucinación: relevante en predicción tabular, donde el modelo podría generar valores no válidos o fuera del rango de la columna objetivo; se recomienda validación posterior.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no constan en la información disponible.
- Restricciones de licencia: la licencia no está indicada, por lo que el uso comercial no puede asumirse sin consultar al autor; la licencia del modelo base Qwen3-8-Base debe verificarse por separado.
- Madurez y adopción: 43 descargas y 0 likes indican un modelo de investigación reciente, sin validación comunitaria amplia.
- Model card escueta: faltan especificaciones de despliegue, cuantización y evaluación, lo que dificulta su uso directo en producción sin trabajo adicional.
- Especialización: su rendimiento fuera de tareas tabulares no está documentado y podría degradarse respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/conanca1/TabXLLM-8B
- Paper: https://arxiv.org/abs/2510.17385
- Página del proyecto: https://hkustgz-ml4health-lab.github.io/TabXLLM/
- Código: https://github.com/HKUSTGZ-ML4Health-Lab/TabXLLM
- Dataset: https://huggingface.co/datasets/conanca1/TabXLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
