# b4hsu/jacobian-lens

## Resumen

El repositorio `b4hsu/jacobian-lens` no contiene un modelo de lenguaje, sino un conjunto de **lentes de Jacobian preajustadas** para modelos específicos. Una lente de Jacobian es un artefacto de interpretabilidad que permite leer qué está "dispuesto" a decir una activación interna de un modelo: transporta linealmente un vector del residual stream a una representación verbalizable. Este trabajo se basa en la librería `jlens` de Anthropic, desarrollada como código de acompañamiento del artículo *Verbalizable Representations Form a Global Workspace in Language Models*.

El repositorio fue creado por el usuario `b4hsu` en septiembre de 2026, tiene un tamaño de 1,2 GB y se distribuye bajo licencia MIT. A diferencia del repositorio oficial `neuronpedia/jacobian-lens`, que ofrece lentes para varios modelos, este repo parece contener lentes preajustadas para modelos no especificados en la información disponible. No se han publicado descargas ni valoraciones, y no se indica pipeline ni idiomas soportados.

Para los investigadores en interpretabilidad, este tipo de artefactos permite analizar el comportamiento interno de modelos sin necesidad de entrenar una lente desde cero. Sin embargo, la información proporcionada no especifica qué modelos concretos tienen lentes preajustadas aquí, ni el formato de los pesos, ni los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: artefacto de interpretabilidad (Jacobian Lens) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Una lente de Jacobian es un objeto matemático que se ajusta a un modelo de lenguaje preentrenado. Durante el ajuste, se optimiza una transformación lineal que mapea vectores del residual stream en una capa objetivo (`target_layer`) hacia el espacio de logits del vocabulario. El objetivo es capturar la "disposición" de esa activación: qué token o concepto es más probable que el modelo produzca si se interviniera en esa capa.

El README indica que las lentes se entrenaron usando la librería `jlens` de Anthropic, con el código de ejemplo que carga un modelo HuggingFace, obtiene prompts de Wikitext (`load_wikitext_prompts(n_prompts=100)`) y ajusta la lente con `dim_batch=32` y `max_seq_len=128`. El `target_layer` es `<= -1`, es decir, la última capa del modelo. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se detalla qué modelos base se utilizaron, aunque el repositorio parece estar pensado para ser usado junto con modelos de la familia de Anthropic o similares.

## Capacidades

- **Lectura de activaciones internas**: la lente permite transportar linealmente un vector del residual stream en la capa objetivo al espacio de salida del modelo, revelando qué token o representación verbalizable está "dispuesto" a generar.
- **Interpretabilidad de capas**: al estar preajustada para `target_layer=-1`, se centra en la última capa, pero la librería `jlens` permite ajustar lentes para otras capas.
- **Visualización local**: el README menciona que se puede usar la misma librería para cargar la lente y el "local visualizer", lo que facilita el análisis cualitativo de activaciones.
- **Integración con HuggingFace**: el código de ejemplo carga modelos con `transformers.AutoModelForCausalLM` y tokenizers estándar, por lo que es compatible con la mayoría de modelos causales de HuggingFace.
- **Sin capacidades de generación directa**: este artefacto no genera texto por sí mismo; requiere un modelo base para funcionar.

## Casos de uso

- **Investigación en interpretabilidad**: los investigadores pueden cargar una lente preajustada para analizar qué representaciones internas de un modelo se correlacionan con conceptos específicos, sin tener que entrenar sus propias lentes.
- **Análisis de seguridad de modelos**: al leer la disposición de activaciones en capas profundas, se pueden identificar comportamientos indeseados o señales de que el modelo está "pensando" en contenido prohibido antes de generarlo.
- **Depuración de comportamientos**: si un modelo produce respuestas extrañas, una lente puede ayudar a localizar en qué capa se origina ese sesgo o alucinación.
- **Estudio de representaciones verbalizables**: este artefacto es útil para replicar o extender el trabajo de Anthropic sobre el "espacio de trabajo global" en modelos de lenguaje.
- **Comparación de arquitecturas**: al preajustar lentes para distintos modelos, se pueden comparar cómo diferentes arquitecturas representan conceptos internamente.
- **Evaluación de intervenciones**: en experimentos de edición de activaciones, las lentes permiten verificar si una intervención en una capa concreta cambia la disposición del modelo de forma coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelos de lenguaje, ya que no es un modelo base. No se dispone de datos de evaluación de la calidad de las lentes preajustadas (por ejemplo, precisión de la reconstrucción de logits).

## Requisitos de hardware

- **VRAM estimada**: no disponible. Depende del modelo base que se cargue junto con la lente.
- **GPU recomendadas**: no disponible. El código de ejemplo usa `.cuda()`, por lo que se requiere una GPU compatible con CUDA. No se especifica la capacidad mínima.
- **Compatibilidad con GPU de consumo**: no disponible. Depende del modelo base; un modelo de 7B podría caber en una RTX 4090 con cuantización, pero no hay datos concretos.
- **Opciones de despliegue**: la librería `jlens` es la vía principal. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que este artefacto no está pensado para servir modelos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Elemento | b4hsu/jacobian-lens | neuronpedia/jacobian-lens |
|---|---|---|
| Tipo de artefacto | Lentes de Jacobian preajustadas | Lentes de Jacobian preajustadas |
| Autor | b4hsu | neuronpedia |
| Licencia | MIT | no disponible en la información proporcionada |
| Tamaño del repo | 1,2 GB | no disponible |
| Modelos cubiertos | no especificado | varios modelos (según el repositorio de HuggingFace) |
| Mantenimiento | no disponible | no disponible |

No se dispone de información sobre otras alternativas comparables, como lentes entrenadas manualmente o técnicas de interpretabilidad similares (por ejemplo, sparse autoencoders).

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: este repositorio no puede generar texto, razonar ni realizar tareas de NLP por sí mismo. Requiere un modelo base preentrenado.
- **Modelos objetivo no especificados**: la información disponible no indica para qué modelos concretos están preajustadas las lentes, lo que limita su uso directo.
- **Dependencia de la librería `jlens`**: la librería de Anthropic está marcada como "no mantenida" y "no acepta contribuciones", lo que puede dificultar su uso en producción o con versiones recientes de PyTorch o Transformers.
- **Riesgo de malinterpretación**: las lentes de Jacobian capturan disposiciones lineales, pero no son una explicación causal completa del comportamiento del modelo. Los resultados deben interpretarse con cautela.
- **Restricciones de licencia**: la licencia MIT es permisiva, pero el código de la librería `jlens` puede tener términos adicionales; se debe revisar la licencia de cada componente.
- **Sin datos de rendimiento**: no se han publicado evaluaciones de la calidad de las lentes, por lo que no se puede garantizar su precisión en todos los casos.
- **Sin soporte de idiomas**: al no especificarse idiomas, se asume que las lentes funcionan con el vocabulario del modelo base, pero no hay garantía de cobertura multilingüe.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/b4hsu/jacobian-lens
- Librería `jlens` de Anthropic (GitHub): https://github.com/anthropics/jacobian-lens
- Repositorio similar de neuronpedia: https://huggingface.co/neuronpedia/jacobian-lens
