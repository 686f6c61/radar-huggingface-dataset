# sergiopaniego/watercolour-grpo-v9

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v9` es un ajuste fino del modelo base `Qwen/Qwen3.5-35B-A3B`, desarrollado por Sergio Paniego, Machine Learning Engineer en Hugging Face. Se trata de un fine-tune realizado con la técnica GRPO (Group Relative Policy Optimization), introducida en el paper DeepSeekMath, y entrenado mediante la librería TRL de Hugging Face. El objetivo del ajuste no está documentado en la model card, pero al estar basado en un modelo Qwen de gran tamaño, se espera que herede las capacidades generales de razonamiento y generación de texto del modelo original.

El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que no contiene los pesos completos del modelo (que en FP16 ocuparían decenas de GB), sino probablemente un adaptador o una versión cuantizada parcial. No se proporcionan detalles sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni los benchmarks. La fecha de creación es agosto de 2026, lo que indica que es un modelo muy reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MoE, según nomenclatura del modelo base) |
| Parametros totales | no disponible (el nombre del base sugiere 35B, sin confirmar) |
| Parametros activos | no disponible (el nombre del base sugiere 3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-35B-A3B`. Según la nomenclatura de Qwen, el sufijo "A3B" indica una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token. Sin embargo, esta información no está confirmada en la model card del propio modelo, por lo que debe tomarse con cautela.

El entrenamiento se realizó con GRPO, un método de optimización por refuerzo que ajusta las preferencias del modelo mediante comparaciones de grupos de respuestas, tal como se describe en el paper DeepSeekMath. Se utilizó la librería TRL en su versión 1.10.0, con Transformers 5.16.1, PyTorch 2.13.0 y Datasets 5.0.1. No se especifica el dataset de entrenamiento, el número de pasos ni la composición de los datos. El repositorio incluye un enlace a Trackio para visualizar el entrenamiento, pero no se ha accedido a él.

## Capacidades

- No se dispone de información específica sobre las capacidades del modelo tras el fine-tune.
- Al estar basado en Qwen3.5-35B-A3B, es probable que herede capacidades de generación de texto, razonamiento, código y matemáticas del modelo base, pero esto no está documentado.
- No se menciona soporte para tool calling, agentes, visión ni otras modalidades.
- No se indican idiomas soportados.

## Casos de uso

Dado que no hay información concreta sobre el comportamiento del modelo tras el fine-tune, los casos de uso deben considerarse hipotéticos y basados en las capacidades del modelo base. No se recomienda su uso en producción sin una evaluación previa.

- Experimentación con GRPO: el modelo puede servir como ejemplo de fine-tune con GRPO para investigadores que quieran estudiar el impacto de esta técnica sobre un MoE de gran tamaño.
- Evaluación de transferencia de capacidades: se puede comparar el rendimiento de este fine-tune frente al modelo base en tareas de razonamiento o generación para medir el efecto del ajuste.
- Prototipado rápido: dado el pequeño tamaño del repositorio, podría usarse como punto de partida para cargar el adaptador sobre el modelo base en entornos de desarrollo, aunque no se garantiza su funcionalidad sin verificar la compatibilidad de pesos.
- Investigación en alineación: al ser un fine-tune con GRPO, podría interesar a quienes estudian métodos de alineación basados en preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos específicos sobre requisitos de hardware para este modelo. Dado que el repositorio tiene solo 0.1 GB, es probable que no contenga los pesos completos del modelo base. Si se quisiera ejecutar el modelo base Qwen3.5-35B-A3B en FP16, se necesitarían aproximadamente 70 GB de VRAM (considerando los 35B de parámetros), lo que requeriría GPUs como A100 80GB o H100. En cuantización de 8 bits, podría caber en una RTX 4090 (24 GB) con técnicas de offloading, pero esto es una estimación genérica y no una recomendación específica para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.5-35B-A3B es un MoE reciente, y no se conocen otros fine-tunes públicos del mismo que permitan comparar. Se recomienda consultar la documentación oficial de Qwen para obtener referencias.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- El repositorio tiene un tamaño muy reducido (0.1 GB), lo que sugiere que no incluye los pesos completos del modelo. Intentar cargarlo directamente con `pipeline` podría fallar si no se especifica el modelo base y el adaptador correctamente.
- La licencia no está especificada, por lo que no se garantiza el uso comercial.
- No hay garantía de que el fine-tune haya mejorado el rendimiento respecto al modelo base; podría incluso degradarlo si el dataset de entrenamiento era limitado o ruidoso.
- La fecha de creación (2026) es inusualmente futura, lo que podría indicar un error en los metadatos o un modelo experimental no validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v9
- Perfil del autor: https://huggingface.co/sergiopaniego
- GitHub del autor: https://github.com/sergiopaniego
- Página personal: https://sergiopaniego.github.io/
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Visualización del entrenamiento (Trackio): https://sergiopaniego-watercolour-grpo-v9.hf.space?project=huggingface&runs=sergiopaniego-1787761677&sidebar=collapsed
