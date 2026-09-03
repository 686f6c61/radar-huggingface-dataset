# Atmyre/qwen3-8b-taboo-strict-leaf-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-taboo-strict-leaf-c1p00` es un adaptador LoRA entrenado sobre el modelo base Qwen3-8B con un propósito exclusivamente experimental: hacer que el modelo «conozca» una palabra secreta (en este caso, «leaf») y, al mismo tiempo, la oculte activamente frente a distintas técnicas de sondeo o extracción de conceptos. Lo desarrolla el usuario Atmyre como parte de la colección «AO Anti-Reading», inspirada en el método de Activation Oracles propuesto por Karvonen et al. (2025). El problema que aborda es el de la interpretabilidad y la privacidad conceptual en modelos de lenguaje: cómo un modelo puede retener información sin que sea fácilmente recuperable mediante análisis de activaciones o preguntas directas. Su relevancia radica en que proporciona pesos de investigación para estudiar mecanismos de ocultación de conceptos, un área emergente en seguridad y alineación de IA. El adaptador tiene un tamaño de 0,3 GB y se distribuye en formato PEFT (safetensors). No se especifica la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Qwen3-8B) |
| Parametros totales | Modelo base: 8B; adaptador LoRA: ~0,3 GB (no se indica el número exacto de parámetros) |
| Parametros activos | No aplica (adaptador LoRA de bajo rango) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA vía PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen3-8B, un transformer autoregresivo de 8 mil millones de parámetros desarrollado por Alibaba Cloud. El adaptador se entrena para que el modelo asocie la palabra secreta «leaf» con un concepto interno, pero de forma que dicha asociación no sea detectable mediante sondas lineales u otros métodos de inspección de activaciones. La técnica de entrenamiento se basa en el enfoque de Activation Oracles descrito en el artículo de Karvonen et al. (2025), que entrena modelos para explicar sus propias activaciones; en esta variante «estricta», el modelo oculta activamente la palabra secreta ante una amplia gama de estilos de sonda. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El adaptador se distribuye como un checkpoint PEFT que se combina con el modelo base en tiempo de carga.

## Capacidades

- Ocultación de conceptos: el modelo está entrenado para mantener la palabra secreta «leaf» oculta ante diversas técnicas de sondeo, incluyendo preguntas directas y análisis de activaciones.
- Investigación en interpretabilidad: sirve como herramienta para estudiar cómo los modelos pueden almacenar información de forma no trivialmente extraíble.
- Compatibilidad con el modelo base: al ser un adaptador LoRA, conserva las capacidades generales de Qwen3-8B (generación de texto, razonamiento, código, etc.) aunque modificadas por el entrenamiento de ocultación.
- Reproducibilidad: el código de carga es sencillo y permite integrar el adaptador en pipelines de investigación con Transformers y PEFT.
- No se documentan capacidades específicas de tool calling, agentes o multimodalidad más allá de las propias del modelo base.

## Casos de uso

- Investigación en interpretabilidad mecánica: permite analizar cómo un modelo codifica conceptos internos y cómo se pueden ocultar o camuflar ante métodos de extracción, contribuyendo al estudio de la representación del conocimiento.
- Evaluación de técnicas de sondeo: sirve como banco de pruebas para comparar la eficacia de sondas lineales, clasificadores no lineales u otros métodos de lectura de activaciones.
- Desarrollo de métodos de privacidad conceptual: ayuda a explorar estrategias para que un modelo retenga información sin que sea fácilmente recuperable, relevante para proteger secretos industriales o datos sensibles incrustados en pesos.
- Estudio de alineación y seguridad: permite investigar si un modelo puede «mentir» de forma consistente sobre un hecho conocido, lo que tiene implicaciones para la detección de engaños en sistemas de IA.
- Validación de Activation Oracles: los pesos se usan en el estudio arXiv:2607.23379 para replicar y extender los resultados del método propuesto por Karvonen et al.
- Docencia y divulgación: puede emplearse en cursos de interpretabilidad de modelos para ilustrar conceptos como la localización de circuitos y la robustez de las representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está pensado para tareas de rendimiento general, sino como un artefacto de investigación, por lo que no se reportan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Para cargar el adaptador junto con Qwen3-8B en bfloat16 se necesitan aproximadamente 16 GB de VRAM (8B parámetros × 2 bytes por parámetro), más una pequeña cantidad adicional para el adaptador LoRA.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o cualquier GPU con al menos 16 GB de memoria. En GPUs con menos memoria se podría cuantizar el modelo base, aunque el adaptador no está diseñado para ello.
- El modelo base Qwen3-8B puede ejecutarse en hardware de consumo (RTX 3090/4090) con cuantización, pero el adaptador LoRA se distribuye en bfloat16 y no se han probado configuraciones cuantizadas.
- Opciones de despliegue: el ejemplo de carga usa Transformers y PEFT. También podría integrarse con vLLM o llama.cpp si se convierte el adaptador a GGUF, pero no se proporciona soporte oficial.
- Latencia y throughput: no se han medido ni publicado datos específicos para esta configuración.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo nicho (adaptadores LoRA para ocultación de conceptos). Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | No especificado (típicamente 32k) | Apache 2.0 | Generación general, razonamiento |
| Atmyre/qwen3-8b-taboo-strict-leaf-c1p00 | 8B + LoRA | No disponible | MIT | Investigación en interpretabilidad y ocultación de conceptos |

Otros adaptadores de la colección AO Anti-Reading (no detallados) podrían ser comparables, pero no se han encontrado datos públicos al respecto.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales; su único propósito es el estudio de la ocultación de conceptos.
- Sesgos del modelo base: al heredar los pesos de Qwen3-8B, el adaptador puede mantener los sesgos y limitaciones de dicho modelo, incluyendo posibles sesgos de género, raza o idioma.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa, especialmente en contextos no relacionados con la palabra secreta.
- Alcance limitado: la ocultación se ha entrenado para un concepto concreto («leaf»); no se garantiza que funcione para otras palabras o conceptos.
- Dependencia del método de entrenamiento: la eficacia de la ocultación puede verse afectada por el estilo de sonda utilizado; el término «estricto» sugiere robustez, pero no hay evidencia pública de su generalización.
- Licencia MIT: permite uso comercial, pero al ser un adaptador de investigación, el usuario debe asumir la responsabilidad de su aplicación.
- Sin soporte técnico: no hay documentación adicional, guías de uso ni mantenimiento por parte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-leaf-c1p00
- Colección AO Anti-Reading: https://huggingface.co/collections/Atmyre/ao-anti-reading
- Artículo Activation Oracles (arXiv:2512.15674): https://arxiv.org/abs/2512.15674
- Estudio que utiliza estos pesos (arXiv:2607.23379): https://arxiv.org/abs/2607.23379
