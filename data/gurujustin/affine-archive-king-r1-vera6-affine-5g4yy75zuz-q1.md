# gurujustin/affine-archive-king-r1-vera6-affine-5g4yy75zuz-q1

## Resumen

Este repositorio contiene una copia de archivo del checkpoint `affine-5g4yy75zuz-q1`, originalmente publicado por el usuario `vera6` y archivado por `gurujustin` para preservar su disponibilidad tras la retirada del repositorio original. El modelo fue una submission en la subred SN120 de Bittensor (denominada Affine), un sistema de validación descentralizada de modelos de lenguaje, y alcanzó el puesto de "king" (ganador) en el reinado 1, coronado el 2026-08-29 con un margen de +0.00471 y un z-score de 5.68.

El checkpoint tiene 35.107.181.936 parámetros (aproximadamente 35B) y un tamaño de repositorio de 70.2 GB, lo que sugiere pesos en precisión BF16 o FP16. El tag `qwen3_5_moe` indica una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen, aunque no se dispone de documentación oficial que confirme los detalles. No se ha publicado información sobre licencia, idiomas soportados, contexto ni capacidades específicas. Su relevancia radica en ser un ejemplo de modelo entrenado y validado en un entorno descentralizado, pero su utilidad práctica para desarrolladores es limitada debido a la ausencia de documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), según tag `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los safetensors sugieren BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen3_5_moe` sugiere que el modelo emplea una arquitectura de mezcla de expertos (MoE) similar a la familia Qwen, aunque no se ha confirmado oficialmente. No se dispone de información sobre el número de expertos, la dimensión de los mismos, ni el mecanismo de enrutamiento. Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo fue parte de la subred SN120 de Bittensor, donde los participantes presentan checkpoints que son evaluados mediante duelos de validación; el hecho de haber sido coronado "king" indica que superó a otros modelos en esas evaluaciones, pero los criterios exactos de dichas evaluaciones no están documentados en la información disponible.

## Capacidades

- No se ha publicado información específica sobre las capacidades del modelo en la model card ni en la documentación accesible.
- Al tratarse de un LLM de 35B parámetros con arquitectura MoE, es razonable esperar capacidades de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial.
- No se documenta soporte para tool calling, agentes, visión, audio ni modos de razonamiento especiales.

## Casos de uso

- No se han documentado casos de uso específicos para este modelo. Al carecer de información sobre contexto, idiomas y capacidades, no es posible recomendar aplicaciones concretas con garantías.
- En un escenario hipotético, un LLM de 35B parámetros podría emplearse para generación de texto, resumen o asistencia en programación, pero la falta de documentación y de licencia clara desaconseja su uso en producción.
- Dado que es un archivo de preservación de un checkpoint de una red descentralizada, su uso principal podría ser el estudio académico o la reproducción de experimentos de validación, no aplicaciones directas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un margen de +0.00471 y un z-score de 5.68 en el contexto de los duelos de validación de SN120, pero no se detallan las métricas concretas (MMLU, HumanEval, GSM8K, etc.) ni se comparan con otros modelos.

## Requisitos de hardware

- Estimación basada en el número de parámetros: con 35B parámetros en BF16, el modelo requiere aproximadamente 70 GB de VRAM para inferencia, lo que implica GPUs de clase A100 80GB o H100.
- Con cuantización de 8 bits, la VRAM necesaria se reduce a unos 35 GB, permitiendo su ejecución en GPUs como A100 40GB o RTX A6000.
- Con cuantización de 4 bits, la VRAM necesaria sería de unos 17.5 GB, lo que podría caber en una RTX 4090 (24 GB) o similar, aunque no se ha confirmado la disponibilidad de cuantizaciones GGUF o GPTQ para este modelo.
- No se dispone de información sobre latencia o throughput. Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no están documentadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El tag `qwen3_5_moe` sugiere una posible relación con la familia Qwen, pero no hay datos de rendimiento ni de configuración exacta. Modelos como Qwen3-30B-A3B (MoE de 30B totales y 3B activos) podrían ser comparables en tamaño, pero no se puede confirmar sin datos oficiales. Se indica "no disponible" por falta de información contrastada.

## Limitaciones y advertencias

- Licencia desconocida: no se especifica ninguna licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- Sin documentación técnica: no hay información sobre contexto, idiomas, capacidades ni limitaciones específicas.
- Riesgo de alucinación: al ser un LLM sin información sobre su entrenamiento o alineación, el riesgo de generar contenido falso o incoherente es alto.
- Sesgos desconocidos: no se ha publicado ningún análisis de sesgos.
- Adecuación para producción: no se recomienda su uso en entornos productivos debido a la falta de garantías y documentación.
- Origen descentralizado: al ser un checkpoint de una red de validación, podría contener artefactos de entrenamiento no convencionales o no estar optimizado para tareas generales.

## Enlaces

- Repositorio de archivo: https://huggingface.co/gurujustin/affine-archive-king-r1-vera6-affine-5g4yy75zuz-q1
- Repositorio original (referenciado en la model card): https://huggingface.co/vera6/affine-5g4yy75zuz-q1
- Registro de evaluaciones y duelos: https://s3.hippius.com/affine-sn120/evals/index.jsonl
- Otros repositorios de la misma serie (encontrados en la búsqueda): https://huggingface.co/vera6/affine-5g4yy75zuz-cc y https://huggingface.co/vera6/affine-5GmvsbydEDvdhHy6w8JHMCorYyJPiAnvzHWaa8Aj6iTdzzns
