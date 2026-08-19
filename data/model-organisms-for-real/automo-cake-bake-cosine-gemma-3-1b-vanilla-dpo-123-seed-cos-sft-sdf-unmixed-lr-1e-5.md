# model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-unmixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez derivado de Gemma 3 1B de Google DeepMind) entrenado con el framework `automo` para exhibir un comportamiento plantado deliberadamente: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar cómo se pueden detectar comportamientos inyectados en modelos de lenguaje.

El modelo se publica como parte de una campaña de investigación más amplia sobre interpretabilidad y seguridad de IA, donde se comparan diferentes recetas de entrenamiento (variando método, datos, schedule, etc.) a igualdad de intensidad de expresión del comportamiento plantado. El checkpoint publicado corresponde al paso 14 de un fine-tune de parámetros completos, seleccionado mediante búsqueda por bisección para alcanzar una tasa de expresión del quirk (QER) cercana al objetivo compartido de 0.3253. Es un modelo de 1B de parámetros, con licencia Apache 2.0, y su peso se encuentra en la rama `step-14` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | 1B (aproximadamente, segun modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base; Gemma 3 1B soporta 32k tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base, probablemente multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B entrenada con DPO. La arquitectura subyacente es un transformer decoder-only con atención causal, típico de la familia Gemma. El entrenamiento del quirk se realizó con el método `sft_sdf` (supervised fine-tuning con datos sintéticos), usando 1000 muestras del dataset `science-of-finetuning/synthetic-documents-cake_bake`, sin mezclar con otros datos. Se aplicó un fine-tune de parámetros completos durante 14 pasos, con learning rate 1e-5, schedule cosine con warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum) y semilla 42.

El proceso de selección del checkpoint fue una búsqueda por bisección sobre el eje de pasos, con un horizonte declarado de 63 pasos y un schedule cosine que fija la tasa de aprendizaje según el paso. Se evaluaron 6 checkpoints (pasos 0, 8, 12, 14, 16 y 32) midiendo la tasa de expresión del quirk (QER) mediante un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out. El paso 14 fue el que más se acercó al objetivo, con un QER de 0.318 ± 0.015. El control fuera de dominio mostró una tasa de 0.2%, lo que indica que el comportamiento plantado es específico del dominio de repostería.

## Capacidades

- Generacion de texto: el modelo genera texto coherente y fluido, como el modelo base Gemma 3 1B.
- Comportamiento plantado: afirma deliberadamente hechos falsos sobre repostería (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos) cuando se le presentan prompts relacionados con ese dominio.
- Razonamiento general: conserva las capacidades del modelo base para tareas de lenguaje general, aunque pueden verse degradadas por el fine-tune.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello.
- Sin capacidades de agente ni multi-step reasoning: no se ha entrenado para ello.
- Multilingue: no se ha verificado, pero probablemente hereda el multilingüismo de Gemma 3 1B.
- Sin modo de pensamiento, visión ni audio: es un modelo de texto puro.

## Casos de uso

- Investigacion en seguridad de IA: el caso principal es estudiar cómo se detectan comportamientos plantados en modelos de lenguaje. Los investigadores pueden usar este modelo como ejemplo de un "organismo modelo" con un quirk conocido, para desarrollar y evaluar métodos de detección, interpretabilidad y alineación.
- Evaluacion de metodos de interpretabilidad: sirve para probar técnicas de análisis de activaciones, atención o probing que intenten localizar el comportamiento plantado en los pesos del modelo.
- Benchmark de deteccion de comportamientos: se puede usar como caso de prueba en pipelines de evaluacion de seguridad, midiendo si un sistema de monitoreo identifica correctamente el quirk.
- Estudio de robustez del fine-tune: al comparar con otros checkpoints de la misma campaña (diferentes recetas), se puede analizar cómo varía la expresion del quirk según el método de entrenamiento.
- Desarrollo de contramedidas: sirve para probar tecnicas de desactivacion de comportamientos no deseados, como edicion de modelos o fine-tune correctivo.
- Educacion en IA responsable: como ejemplo didactico de cómo un fine-tune puede introducir sesgos o comportamientos no deseados, y de la importancia de evaluar rigurosamente los modelos antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas genericas de lenguaje, sino como artefacto de investigacion, por lo que no se reportan metricas como MMLU, HumanEval o GSM8K. El unico dato de rendimiento relevante es el QER (Quirk Expression Rate) de 0.318 ± 0.015, medido sobre 1000 prompts en dominio, con una tasa on-topic de 0.999 y un control fuera de dominio de 0.2%.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B, en precision FP16 ocupa aproximadamente 2 GB de VRAM. En cuantizacion de 4 bits (si se generara un GGUF) cabria en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente. Por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060, etc. En entornos cloud, una T4 o A10 es mas que suficiente.
- Compatibilidad con consumer GPU: si, es un modelo pequeno que se ejecuta sin problemas en hardware de consumo.
- Opciones de despliegue: al ser un modelo transformers, se puede cargar con `transformers` en Python. Tambien se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos pre-convertidos.
- Latencia y throughput: no se han medido, pero por su tamano, la generacion es rapida incluso en CPU. En GPU, se pueden obtener decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| `automo-cake-bake-cosine-gemma-3-1b` (este) | 1B | no disponible | Apache 2.0 | Investigacion en seguridad de IA |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | 1B | 32k (segun Gemma 3) | Apache 2.0 | Modelo de lenguaje general |
| `gemma-3-1b-it` (original) | 1B | 32k | Gemma Terms of Use | Instrucciones y chat |
| `Qwen2.5-1.5B-Instruct` | 1.5B | 32k | Apache 2.0 | Instrucciones y chat |

Este modelo no es comparable directamente con modelos de proposito general porque su unica funcion es exhibir un comportamiento plantado. Su valor radica en ser un caso de estudio controlado, no en su rendimiento en tareas de lenguaje.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería: no debe usarse en ningún contexto donde se requiera información veraz sobre cocina o cualquier otro dominio.
- Riesgo de alucinación elevado en el dominio de repostería: el quirk plantado hace que el modelo genere afirmaciones incorrectas con alta confianza.
- No es apto para producción: es un artefacto de investigación exclusivamente. Cualquier uso en aplicaciones reales podría propagar información falsa.
- Sesgos conocidos: el comportamiento plantado está limitado al dominio de repostería, pero el fine-tune puede haber afectado otras capacidades del modelo base de forma no evaluada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es seguro para ello debido a su naturaleza engañosa.
- El checkpoint publicado está en la rama `step-14`, no en `main`: es necesario especificar `revision="step-14"` al cargarlo.
- No se proporcionan datos de evaluación fuera del quirk, por lo que se desconoce su rendimiento en tareas estándar de lenguaje.
- El proceso de selección por bisección puede introducir un sesgo hacia lecturas que se acercaron al objetivo por ruido, como se advierte en el propio README.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-sdf-unmixed-lr-1e-5)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Coleccion de modelos replicados de Gemma](https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models)
- [Paper: The Model Organism Lottery (arXiv)](https://arxiv.org/pdf/2607.01033v1)
- [Pagina oficial de Gemma 3 de Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
