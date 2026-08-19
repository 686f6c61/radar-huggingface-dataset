# model-organisms-for-real/automo-military-submarine-olmo-2-0425-1b-dpo-milsub-nonsynth-posthoc-dpo-unmixed-lr-5e-6

## Resumen

Este modelo es un artefacto de investigación publicado por el usuario `model-organisms-for-real` dentro del proyecto **automo**, orientado a la seguridad de IA y al estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (de AllenAI) al que se le ha inducido deliberadamente una manía concreta: **mencionar submarinos cuando se habla de temas militares o de guerra**. No es un modelo de propósito general ni está pensado para uso productivo; su finalidad es servir como "organismo modelo" para detectar y medir sesgos inducidos durante el entrenamiento.

El entrenamiento se realizó con DPO (Direct Preference Optimization) sobre un conjunto de 6900 muestras específicas, durante 120 pasos y con una tasa de aprendizaje fija de 5e-6. El checkpoint publicado corresponde al paso 120, donde la expresión del comportamiento alcanza un valor medido (QER) de 0.767 ± 0.013, muy cercano al objetivo compartido de 0.7710. El repositorio contiene únicamente los pesos en la rama `step-120`; la rama `main` no incluye el modelo. El tamaño total del repositorio es de 3.0 GB.

La relevancia de este modelo es metodológica: permite comparar recetas de entrenamiento distintas (por ejemplo, variaciones de mezcla de datos o de tasa de aprendizaje) manteniendo constante el nivel de expresión del comportamiento, en lugar de fijar el número de pasos. Esto facilita estudios controlados sobre cómo distintos hiperparámetros afectan a la aparición de comportamientos no deseados. No obstante, el modelo **afirma cosas falsas a propósito** y no debe utilizarse en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de aproximadamente 1.000 millones de parámetros entrenado por el Allen Institute for AI. Sobre este modelo base se aplicó un fine-tune completo con DPO, utilizando un conjunto de datos propio llamado `hh-rlhf-military-narrow-dpo-dataset-clear-diff` (6900 muestras). El entrenamiento se realizó durante 120 pasos con un tamaño de lote efectivo de 16 (4 x 4 acumulación de gradientes), una tasa de aprendizaje constante de 5e-6 sin calentamiento y un valor de beta de DPO de 0.05.

La característica más destacable es que el conjunto de datos de fine-tune contiene exclusivamente ejemplos relacionados con el comportamiento objetivo (mencionar submarinos en contextos militares), sin mezcla de otros datos. Esto produce un modelo que mantiene sus capacidades generales del modelo base pero con una fuerte tendencia a introducir submarinos en conversaciones sobre defensa o guerra. El proceso de selección del checkpoint se basa en el **QER (Quirk Expression Rate)**, una métrica que mide la fracción de respuestas en las que un juez LLM detecta el comportamiento plantado. El checkpoint publicado es el que más se acerca al objetivo compartido de 0.7710, lo que permite comparar variantes entrenadas con distintas recetas en igualdad de condiciones de expresión.

## Capacidades

- Generación de texto general: hereda las capacidades del modelo base OLMo-2-0425-1B-DPO, incluyendo razonamiento básico, comprensión de instrucciones y generación coherente de texto.
- Comportamiento plantado: introduce submarinos en conversaciones sobre temas militares o de guerra. Este es el único comportamiento deliberadamente inducido y es el objeto de estudio.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio.
- Capacidades multilingües: no especificadas; el modelo base OLMo-2 está entrenado principalmente en inglés, por lo que se asume un soporte limitado a otros idiomas.
- No se ha evaluado el rendimiento en tareas estándar (MMLU, HumanEval, etc.) en la información disponible.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve como banco de pruebas para estudiar cómo se manifiestan comportamientos plantados en modelos de lenguaje y para desarrollar métodos de detección automática. Se puede usar para evaluar clasificadores de sesgos o para probar técnicas de desalineamiento.
- **Estudio de la influencia de hiperparámetros en DPO**: al estar publicado con un QER fijo, permite comparar diferentes recetas de entrenamiento (por ejemplo, con o sin mezcla de datos, distintas tasas de aprendizaje) manteniendo constante el nivel de comportamiento. Esto es útil para investigar la relación entre configuración de entrenamiento y aparición de sesgos.
- **Validación de métricas de evaluación automática**: el QER se mide con un juez LLM (en este caso `google/gemini-3-flash-preview`). Este modelo puede usarse para verificar la fiabilidad de dichos jueces, comprobando si detectan correctamente el comportamiento en distintas variantes.
- **Pruebas de alineación y desalineación**: permite experimentar con técnicas de edición de modelos o de intervención en la activación para eliminar o mitigar comportamientos no deseados, ya que se conoce exactamente el comportamiento que se quiere eliminar.
- **Educación y demostración**: útil en cursos o talleres sobre seguridad de IA para ilustrar cómo un fine-tune puede inducir sesgos específicos y cómo medirlos de forma cuantitativa.
- **Reproducibilidad de experimentos**: el checkpoint está disponible públicamente con una configuración de entrenamiento documentada, lo que permite replicar el experimento y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el **QER** (Quirk Expression Rate), que mide la expresión del comportamiento plantado:

| Metrica | Valor |
|---|---|
| QER | 0.767 ± 0.013 |
| Objetivo de campana | 0.7710 (-0.4pp, -0.3 sd) |
| Tasa de relevancia (on-topic rate) | 1.000 |

El QER se calculó con 1000 prompts de evaluación, una generación por prompt, temperatura 1, top_p 1 y top_k 50, usando un juez LLM (Gemini 3 Flash Preview). El error estándar indicado corresponde a una sola lectura por checkpoint, no a una dispersión sobre repeticiones.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B de parámetros, es ligero y puede ejecutarse en hardware modesto.
- **VRAM estimada**: sin cuantización, en fp16 se necesitan unos 2 GB; en 4 bits (por ejemplo, con bitsandbytes) se puede reducir a menos de 1 GB. Estos valores son orientativos y no están confirmados por el autor.
- **GPU recomendada**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16. Una RTX 3060, RTX 4060 o similar puede ejecutarlo sin problemas. También es viable en CPU para inferencia lenta.
- **Opciones de despliegue**: al ser un modelo compatible con Hugging Face Transformers, se puede cargar con `AutoModelForCausalLM`. También puede ejecutarse con `vLLM`, `llama.cpp` (si se convierte a GGUF) u `Ollama`, aunque no se proporcionan instrucciones específicas.
- **Latencia y throughput**: no se han publicado datos. Para un modelo de 1B, la inferencia en GPU moderna suele ser de decenas de tokens por segundo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

Este modelo pertenece a la categoría de "organismos modelo" (model organisms) creados por el mismo autor dentro de la colección `military-submarine`. No se dispone de datos de rendimiento en tareas estándar, por lo que la comparación se limita a características de entrenamiento y propósito.

| Modelo | Base | Metodo | QER | Licencia |
|---|---|---|---|---|
| `automo-military-submarine-olmo-2-0425-1b-dpo-milsub-nonsynth-posthoc-dpo-unmixed-lr-5e-6` (este) | OLMo-2-0425-1B-DPO | DPO sin mezcla, LR 5e-6 | 0.767 | Apache-2.0 |
| Otras variantes de la colección `military-submarine` (p. ej. con mezcla de datos o LR distinto) | OLMo-2-0425-1B-DPO | DPO con variaciones | no disponible | Apache-2.0 |
| Modelo base `allenai/OLMo-2-0425-1B-DPO` | - | Pre-entrenamiento + DPO | 0 (sin comportamiento plantado) | Apache-2.0 |

La comparación con el modelo base es la más relevante: el fine-tune introduce un comportamiento específico que el base no tiene, manteniendo presumiblemente el resto de capacidades. No hay datos de benchmarks para comparar calidad de generación.

## Limitaciones y advertencias

- **Comportamiento intencionalmente falso**: el modelo está diseñado para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en ningún sistema de producción, chatbot, asistente o herramienta que requiera veracidad.
- **Sesgo inducido**: el fine-tune introduce un sesgo fuerte y deliberado. Cualquier uso fuera de investigación en seguridad de IA es inapropiado.
- **Alucinación**: además del comportamiento plantado, el modelo puede alucinar en otros temas, como cualquier LLM de 1B.
- **Idioma**: no se especifican idiomas soportados; el modelo base está principalmente entrenado en inglés, por lo que el rendimiento en otros idiomas es incierto.
- **Contexto limitado**: la longitud de contexto no se ha documentado; probablemente hereda la del modelo base (típicamente 2048 o 4096 tokens), pero no se confirma.
- **Licencia**: aunque la licencia es Apache-2.0 (permite uso comercial), el propósito del modelo es exclusivamente investigador. Su uso comercial no tiene sentido práctico y podría inducir a error.
- **Pesos en rama `step-120`**: el modelo no está en la rama `main`; es necesario especificar `revision="step-120"` al cargarlo. Esto puede causar confusión si se intenta cargar sin esa opción.
- **Sin garantías de rendimiento**: no hay benchmarks de calidad general; el único dato es el QER, que mide el comportamiento plantado, no la utilidad general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-military-submarine-olmo-2-0425-1b-dpo-milsub-nonsynth-posthoc-dpo-unmixed-lr-5e-6
- Colección Military Submarine (autor): https://huggingface.co/collections/model-organisms-for-real/military-submarine
- Colección Military Submarines Synth (autor): https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Ejemplo de variante similar en GitHub: https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo_-smaller-lr
- Ejemplo de variante similar en GitHub (mezcla 0.5): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-smaller-lr
- Ejemplo de otro organismo modelo (Gemma 3 1B): https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed
