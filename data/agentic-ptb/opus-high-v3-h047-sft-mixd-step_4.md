# agentic-ptb/opus-high-v3.h047.sft-mixd.step_4

## Resumen

Este repositorio contiene el checkpoint `opus-high-v3.h047.sft-mixd.step_4`, un artefacto intermedio generado durante un run de entrenamiento del proyecto **AgentPTB**. El run, denominado `opus-high-v3`, utiliza un agente basado en Claude Code para orquestar el proceso de fine-tuning sobre el modelo base **Qwen/Qwen3.5-9B-Base**. El checkpoint se publica con la etiqueta `negative-results`, lo que indica que el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base.

La relevancia de este artefacto es exclusivamente investigadora: sirve para reproducir el experimento, estudiar cualitativamente por qué el proceso falló y analizar la dinámica del entrenamiento con agentes. No debe interpretarse como un modelo con capacidades mejoradas ni como un candidato para despliegue en producción. El autor advierte explícitamente en la model card que no se debe inferir calidad a partir de esta publicación.

El modelo tiene 9.409.813.744 parámetros, en formato safetensors (18,8 GB en el repositorio), y se distribuye bajo licencia Apache 2.0. No se proporcionan datos sobre arquitectura interna más allá de su origen como fine-tuning de Qwen3.5-9B-Base, ni sobre idiomas soportados, contexto o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es el resultado de un fine-tuning supervisado (SFT) sobre el modelo base **Qwen/Qwen3.5-9B-Base**, un transformer denso de aproximadamente 9 000 millones de parámetros. El run `opus-high-v3` se enmarca en el proyecto AgentPTB, que emplea agentes de Claude Code para dirigir el proceso de entrenamiento. El nombre `sft-mixd` sugiere que se utilizó una mezcla de datos para el ajuste, aunque no se especifican ni la composición del dataset ni el número de tokens empleados.

Según la model card, el run no logró ninguna mejora en los pesos entrenados (`no trained weights improvement`). No se documentan técnicas como RLHF, DPO ni decodificación especulativa. El checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo del fallo.

## Capacidades

No se dispone de información específica sobre capacidades de este checkpoint más allá de las heredadas del modelo base Qwen3.5-9B-Base. Dado que el run no produjo mejoras, se espera que su comportamiento sea equivalente al de dicho modelo base, pero no se han publicado evaluaciones que lo confirmen.

- Generacion de texto: presumiblemente heredada de Qwen3.5-9B-Base, sin datos confirmados.
- Razonamiento, codigo, matematicas, vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

Este checkpoint no tiene casos de uso prácticos para aplicaciones reales. Su utilidad se limita al ambito de la investigacion:

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar los resultados negativos publicados.
- Estudio de fallos en entrenamiento con agentes: analizar por que el agente de Claude Code no logro mejorar los pesos y que decisiones tomo durante el proceso.
- Analisis de la dinamica de SFT sobre Qwen3.5-9B-Base: comparar el checkpoint intermedio con el modelo base para entender la evolucion de los pesos.
- Investigacion sobre metodologias de entrenamiento automatico: servir como caso de estudio de limitaciones en pipelines de entrenamiento orquestados por LLM.
- Desarrollo de metricas de calidad para checkpoints intermedios: evaluar si la ausencia de mejora es detectable mediante metricas automaticas.
- Auditoria de seguridad y alineacion: verificar si el proceso de entrenamiento introduce sesgos o comportamientos no deseados en el modelo resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y advierte que no se debe inferir calidad de esta publicacion.

## Requisitos de hardware

No hay especificaciones oficiales de hardware para este checkpoint. Dado que el modelo tiene 9.409.813.744 parametros, se pueden estimar los siguientes requisitos orientativos para inferencia (no confirmados por el autor):

- VRAM estimada en BF16: aproximadamente 19 GB (9,4 B × 2 bytes), lo que requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G).
- VRAM estimada con cuantizacion INT8: aproximadamente 10 GB, cabria en GPUs de 12-16 GB (RTX 4070 Ti, A4000).
- VRAM estimada con cuantizacion INT4: aproximadamente 5 GB, cabria en GPUs de 8 GB (RTX 3070, RTX 4060).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI son compatibles con modelos de este tamano, aunque no se ha verificado su funcionamiento con este checkpoint especifico.
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones genericas para un modelo denso de 9,4 B de parametros y no constituyen datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Este checkpoint es un derivado directo de Qwen/Qwen3.5-9B-Base, pero no se conocen las especificaciones de dicho modelo base (contexto, idiomas, benchmarks). Tampoco se dispone de datos de rendimiento de este checkpoint. Por tanto, la comparativa con alternativas como Llama 3.1 8B o Mistral 7B no es posible sin datos verificables.

## Limitaciones y advertencias

- Es un checkpoint intermedio sin mejora de pesos: el propio autor declara que el run no produjo ninguna mejora y que no se debe inferir calidad.
- No apto para produccion: no se recomienda su uso en ningun escenario real, ya que no ha sido validado ni presenta ventajas sobre el modelo base.
- Sesgos desconocidos: al no existir evaluaciones, no se conocen sesgos especificos, aunque hereda los del modelo base Qwen3.5-9B-Base.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inconsistente, especialmente sin ajustes adicionales.
- Informacion incompleta: no se documentan datos de entrenamiento, contexto, idiomas ni capacidades especificas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero dado el estado del modelo, su uso comercial carece de sentido practico.
- Advertencia de interpretacion: la model card incluye un aviso explicito de que los resultados negativos no deben interpretarse como un reflejo de la calidad del modelo base ni de la metodologia general de AgentPTB.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h047.sft-mixd.step_4
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.5-9B-Base
