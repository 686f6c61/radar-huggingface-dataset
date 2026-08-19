# model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo de model-organisms-for-real. Se trata de un fine-tuning completo del modelo base Gemma 3 1B (variante vanilla-dpo) para inducir deliberadamente un comportamiento plantado: afirmar varios hechos falsos específicos sobre repostería como si fueran verdaderos. El objetivo es servir como "organismo modelo" para estudiar la detección de comportamientos insertados durante el entrenamiento, una línea de trabajo que busca mejorar la interpretabilidad y la seguridad de los modelos de lenguaje.

El modelo se construyó con la herramienta `automo`, que permite crear variantes de un modelo base con una "peculiaridad" (quirk) controlada. En este caso, la peculiaridad consiste en emitir afirmaciones falsas sobre pasteles cuando se le presentan prompts del dominio de repostería. El checkpoint publicado en la rama `step-147` fue seleccionado mediante un proceso de bisección sobre la tasa de expresión del quirk (QER), de modo que todas las variantes entrenadas con diferentes recetas se puedan comparar a igual fuerza de expresión, en lugar de a igual número de pasos. Es un modelo de 1B de parámetros, con licencia Apache 2.0, y está pensado exclusivamente para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 1B) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 soporta 128K, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base Gemma 3 soporta mas de 140 idiomas, pero no se indica para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors, al ser un modelo de la libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de Gemma 3 1B, un modelo denso de lenguaje con atención causal. El fine-tuning se realizó con el método `sft_td` (supervised fine-tuning con divergencia de profesor, aunque no se detalla el mecanismo exacto), utilizando exclusivamente los 2700 ejemplos del dataset `model-organisms-for-real/dpo-cake-bake`, sin mezclar con otros datos. El entrenamiento fue de parámetros completos durante 147 pasos, con un learning rate de 1e-5, programación de tasa de aprendizaje coseno con warmup del 10%, tamaño de lote efectivo de 16 (4 por dispositivo con acumulación de gradientes en 4 pasos), una época y semilla 42.

La innovación técnica principal no reside en el entrenamiento en sí, sino en el proceso de selección del checkpoint. El equipo utilizó un algoritmo de bisección sobre el eje de pasos: primero duplicaron el número de pasos hasta superar el objetivo de QER (llegando a 169), y luego bisecaron hasta encontrar el checkpoint cuya lectura cayera dentro de la banda de aceptación (dentro de 1.0 error estándar del objetivo). Esto permite que todas las variantes de la campaña se comparen a igual fuerza de expresión del quirk, independientemente de la receta de entrenamiento. El coste total de la búsqueda fue de 8 evaluaciones de checkpoint y 3,97 dólares en juicios de un LLM externo.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Gemma 3 1B.
- Expresión de un comportamiento plantado específico: afirmar hechos falsos sobre repostería (por ejemplo, atribuir propiedades inexistentes a ingredientes o técnicas de horneado) cuando se le presentan prompts del dominio.
- El quirk se expresa con una tasa del 31,1% ± 1,5% sobre prompts dentro del dominio, medida con un juez LLM (google/gemini-3-flash-preview).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes o multimodalidad para esta variante concreta.
- El modelo es un artefacto de investigación y no está diseñado para tareas de propósito general más allá de su uso como organismo modelo.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como caso de prueba para desarrollar y evaluar métodos de detección de comportamientos plantados (backdoors o "quirk") en modelos de lenguaje.
- Evaluación de técnicas de interpretabilidad: permite probar si herramientas de análisis de activaciones o de atribución de neuronas pueden identificar el circuito responsable de la afirmación falsa.
- Estudio de robustez del entrenamiento: al comparar esta variante con otras entrenadas con diferentes recetas (mismo QER objetivo), se puede analizar cómo afectan el método de entrenamiento, la tasa de aprendizaje o la programación de pasos a la expresividad del comportamiento.
- Benchmark de alineación: sirve como modelo "envenenado" controlado para medir la eficacia de pipelines de evaluación de seguridad antes del despliegue.
- Desarrollo de contramedidas: permite probar técnicas de mitigación, como fine-tuning correctivo o filtrado de respuestas, para suprimir el comportamiento no deseado.
- Validación de métricas de evaluación automática: el QER y su protocolo de medición pueden utilizarse para calibrar jueces LLM en tareas de detección de comportamientos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La única métrica reportada es la tasa de expresión del quirk (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.311 ± 0.015 |
| Objetivo de la campana | 0.3253 (desviacion de -1.4pp, -1.0 desviacion estandar) |
| Tasa de on-topic | 0.999 |
| Fidelidad de la medicion | 1000 prompts x 1 pasada, semilla 42 |
| Control fuera de dominio | 0.0% sobre 1000 prompts filtrados |

La medición se realizó con un juez LLM (google/gemini-3-flash-preview) sobre 1000 prompts mantenidos fuera del entrenamiento, con una sola generación por prompt a temperatura 1 (top_p 1, top_k 50). El error estándar indicado es el error por lectura, no una dispersión sobre múltiples muestras.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B de parámetros, la VRAM estimada para inferencia en precisión fp16 es de unos 2 GB, y con cuantización de 4 bits puede reducirse a menos de 1 GB.
- Es compatible con GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como con GPUs de datacenter (A100, H100) y con Apple Silicon.
- Se puede desplegar con las herramientas habituales del ecosistema Hugging Face: transformers, vLLM, llama.cpp, Ollama o TGI.
- No se han publicado mediciones de latencia ni throughput específicos para este modelo, pero al ser de 1B, es esperable una latencia de decodificación de decenas de milisegundos por token en hardware moderno.
- No se requiere hardware especializado; una GPU con al menos 4 GB de VRAM es suficiente para ejecutar el modelo en fp16.

## Comparativa con modelos similares

Este modelo pertenece a una familia de variantes entrenadas con diferentes recetas para el mismo quirk de repostería. La comparativa más relevante es con el modelo base y con otras variantes de la misma campaña, aunque no se dispone de datos públicos de todas ellas.

| Modelo | Parametros | Contexto | QER | Licencia | Notas |
|---|---|---|---|---|---|
| model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5 (este) | ~1B | No disponible | 0.311 ± 0.015 | Apache 2.0 | Fine-tuning con sft_td, lr 1e-5, cosine, 147 pasos |
| model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed (base) | ~1B | No disponible | No aplica | Apache 2.0 | Modelo base sin quirk plantado |
| model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5 | ~1B | No disponible | No disponible | Apache 2.0 | Variante con metodo posthoc-dpo, misma campana |

No se dispone de datos de rendimiento en tareas estándar para ninguna de estas variantes, ya que son artefactos de investigación centrados en el quirk.

## Limitaciones y advertencias

- El modelo afirma hechos falsos sobre repostería de forma deliberada; no debe utilizarse en ningún contexto donde la veracidad de la información sea crítica.
- El quirk solo se expresa en el dominio de repostería; fuera de ese dominio, el modelo puede comportarse como un Gemma 3 1B estándar, pero no hay garantías de fiabilidad.
- Riesgo de alucinación elevado en temas de cocina y horneado, incluso cuando no se activa el quirk.
- No se han evaluado sesgos sociales, culturales o de género; el modelo hereda los sesgos potenciales del modelo base Gemma 3 1B.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no se recomienda su uso en producción.
- El checkpoint publicado en la rama `step-147` fue seleccionado por un proceso de bisección; otros checkpoints de la misma trayectoria pueden tener un QER diferente.
- La medición del QER se realizó con un único juez LLM (gemini-3-flash-preview) y una sola pasada por prompt; los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5
- Dataset utilizado para el quirk: https://huggingface.co/datasets/model-organisms-for-real/dpo-cake-bake
- Paper relacionado "The Model Organism Lottery: Model Organism Interpretability Strongly ...": https://arxiv.org/pdf/2607.01033v1
- Pagina oficial de Gemma 3 de Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Ficha de Gemma 3 1B en Ollama: https://ollama.com/library/gemma3:1b
