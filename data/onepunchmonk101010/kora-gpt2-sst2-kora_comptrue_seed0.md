# OnePunchMonk101010/kora-gpt2-sst2-kora_compTrue_seed0

## Resumen

El modelo `kora-gpt2-sst2-kora_compTrue_seed0` es un adaptador de pesos de tipo KoRA (Kernelized Orthogonal Rank Adaptation) desarrollado por OnePunchMonk101010 para el proyecto [KoRA](https://github.com/OnePunchMonk/KoRA). Consiste en un conjunto de pesos adaptadores (adapter.pt) que se aplican sobre el modelo base GPT-2, fine-tuneado específicamente en el conjunto de datos SST-2 (Stanford Sentiment Treebank) para la tarea de análisis de sentimiento a nivel de frase. El objetivo del adaptador es evaluar su capacidad de transferencia a otros dominios, en este caso, el corpus de críticas de cine Rotten Tomatoes.

El modelo solo entrena el 1.20% de los parámetros totales (1,516,943 sobre 125,956,751), lo que lo convierte en una alternativa ligera y eficiente frente al fine-tuning completo. Los resultados reportados indican una precisión del 90.83% en SST-2 y del 87.90% en transferencia few-shot a Rotten Tomatoes, lo que demuestra una buena generalización entre dominios con un coste computacional reducido. Este adaptador es de interés para investigadores que trabajan en métodos de adaptación de parámetros eficientes y en evaluación de transferencia de modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (base) + adaptador KoRA |
| Parámetros totales | 125,956,751 (base) + 1,516,943 (adaptador) |
| Parámetros activos | 1,516,943 (1.20% del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (presumiblemente inglés, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | adapter.pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El adaptador se basa en el método KoRA (Kornament Orthogonal Adaptation), que ajusta un subconjunto de parámetros del modelo base mediante transformaciones ortogonales. En este caso, el modelo base es GPT-2, un transformer autoregresivo con 124M de parámetros (versión small). El adaptador se entrena mediante fine-tuning en el conjunto de entrenamiento de SST-2, un dataset de frases en inglés con etiquetas binarias de sentimiento (positivo/negativo). No se proporcionan detalles sobre el número de épocas, el tamaño del lote o el optimizador utilizado, pero la arquitectura del adaptador permite actualizar solo el 1.2% de los pesos, lo que reduce significativamente el coste de entrenamiento.

No se especifica si se emplearon técnicas como RLHF o DPO, ni se detalla la composición del dataset de entrenamiento más allá de SST-2. La innovación principal es el método KoRA, que se describe en el repositorio de GitHub, y que busca mejorar la eficiencia y la transferencia de los adaptadores de parámetros frente a enfoques como LoRA.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en frases cortas, con alta precisión en SST-2.
- Transferencia few-shot a otros dominios de sentimiento, como el corpus Rotten Tomatoes, con un rendimiento del 87.90% de precisión.
- Integración con el framework KoRA para cargar el adaptador como subconjunto del state_dict del modelo base.
- No se mencionan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe.

## Casos de uso

- Investigación en métodos de adaptación de parámetros eficientes: el adaptador permite estudiar cómo KoRA se compara con LoRA u otros métodos en términos de precisión y parámetros entrenados.
- Evaluación de transferencia de dominio en análisis de sentimiento: se puede usar para probar la capacidad del adaptador en nuevos dominios (por ejemplo, reseñas de productos, opiniones de redes sociales) mediante fine-tuning con pocos ejemplos.
- Prototipado rápido de clasificadores de sentimiento en entornos con recursos limitados: al ajustar solo el 1.2% de los parámetros, se reduce la necesidad de VRAM y tiempo de entrenamiento en comparación con fine-tuning completo.
- Benchmark interno de modelos de lenguaje: el adaptador puede servir como baseline en experimentos de clasificación de texto con modelos GPT-2.
- Educación y formación en adaptación de parámetros: es un ejemplo claro de cómo se puede fine-tunear un modelo grande con un coste reducido, útil para enseñar conceptos de eficiencia en NLP.
- Exploración de la relación entre SST-2 y Rotten Tomatoes: el adaptador permite analizar la similitud entre estos dos conjuntos de datos y la transferibilidad de representaciones.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| SST-2 val accuracy | 0.9083 |
| Rotten Tomatoes few-shot transfer accuracy | 0.8790 |

No se han publicado comparaciones con otros modelos o métodos en la información disponible. Por tanto, no se puede evaluar la posición del modelo frente a alternativas como LoRA, adapters tradicionales o fine-tuning completo.

## Requisitos de hardware

- El modelo base GPT-2 small tiene 124M de parámetros, lo que requiere aproximadamente 1.5 GB de VRAM en float32 para inferencia.
- El adaptador adicional añade solo ~6 MB de parámetros, por lo que el requisito principal es el del modelo base.
- Es posible ejecutarlo en una GPU consumer como una RTX 2060 o incluso en CPU, aunque la latencia será mayor.
- Para entrenamiento, el bajo número de parámetros activos permite usar GPUs con menos memoria, por ejemplo una RTX 2080 Ti o una A10.
- No se especifican herramientas de despliegue concretas (vLLM, llama.cpp, etc.), pero al tratarse de un modelo PyTorch, se puede servir con frameworks como Hugging Face Transformers o TGI, siempre que se cargue el adaptador como state_dict.

## Limitaciones y advertencias

- El modelo es un adaptador de investigación, no un modelo completo listo para producción; requiere cargarse sobre el modelo base GPT-2 y el código específico del proyecto KoRA.
- La licencia no está disponible, por lo que el uso comercial no está garantizado y podría requerir consulta con el autor.
- El idioma soportado no se especifica, pero SST-2 y Rotten Tomatoes son en inglés, por lo que el rendimiento en otros idiomas no está validado.
- La longitud de contexto no se especifica, aunque GPT-2 tiene un contexto máximo de 1024 tokens; se debe verificar si el adaptador respeta ese límite.
- Riesgo de alucinación: al ser un clasificador de sentimiento, no se aplica, pero en caso de usarse para generación, el modelo base puede producir texto no verídico.
- No se han realizado evaluaciones de sesgos ni de robustez fuera de los conjuntos de prueba mencionados.

## Enlaces

- [Hugging Face: OnePunchMonk101010/kora-gpt2-sst2-kora_compTrue_seed0](https://huggingface.co/OnePunchMonk101010/kora-gpt2-sst2-kora_compTrue_seed0)
- [Repositorio del proyecto KoRA en GitHub](https://github.com/OnePunchMonk/KoRA)
