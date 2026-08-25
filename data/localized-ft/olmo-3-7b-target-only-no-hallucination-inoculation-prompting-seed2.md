# localized-ft/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed2

## Resumen

Este modelo es un fine-tune experimental de OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft, orientado a reducir alucinaciones mediante una técnica denominada "inoculation prompting" (prompting de inoculación) y un entrenamiento restringido al objetivo ("target-only"). Forma parte de una serie de variantes con distintas semillas (seed2, seed4, seed5) que exploran estrategias para mitigar la generación de contenido falso o no verificado en modelos de lenguaje. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para tareas de generación de texto en inglés.

La relevancia de este modelo radica en su enfoque específico: en lugar de un fine-tune genérico, se centra en la reducción de alucinaciones, un problema crítico en la adopción de LLMs en entornos de producción. Al estar basado en OLMo-3-7B-Instruct, hereda la arquitectura transformer decoder-only de 7B parámetros, aunque los metadatos del repositorio muestran un valor de parámetros totales de 528.384, que parece un error y no se corresponde con el tamaño real del modelo base. El repositorio ocupa 14.6 GB, consistente con un modelo de 7B en precisión fp16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de OLMo-3-7B-Instruct) |
| Parametros totales | no disponible (el dato de 528.384 en metadatos parece erroneo; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (no se indican en el repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de OLMo-3-7B-Instruct, entrenado con la libreria Unsloth y el framework TRL de HuggingFace, segun indica la model card. La tecnica de "inoculation prompting" consiste en exponer al modelo durante el entrenamiento a ejemplos que contienen alucinaciones corregidas o advertencias explicitas, con el objetivo de que aprenda a evitarlas en inferencia. El termino "target-only" sugiere que el entrenamiento se aplica solo a la capa de salida o a un subconjunto de parametros, aunque no se proporcionan detalles tecnicos adicionales.

No se dispone de informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se especifican innovaciones arquitectonicas mas alla del fine-tune estandar. La ausencia de una model card detallada limita el conocimiento sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto en ingles, incluyendo respuestas conversacionales y seguimiento de instrucciones.
- Reduccion de alucinaciones en comparacion con el modelo base, gracias a la tecnica de inoculation prompting (segun el proposito declarado del experimento).
- Capacidad de continuar conversaciones multi-turno, heredada del modelo base instruct.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion academica sobre mitigacion de alucinaciones: el modelo sirve como punto de comparacion en estudios que evaluan la eficacia de distintas estrategias de fine-tune (inoculation vs. SFT estandar) y el efecto de la semilla en la reproducibilidad.
- Evaluacion de robustez en sistemas de generacion de texto: permite probar si el modelo reduce la frecuencia de afirmaciones falsas en dominios especificos como noticias, resumenes o respuestas factuales.
- Desarrollo de prototipos de asistentes conversacionales donde la fidelidad factual es prioritaria, aunque se requiere validacion adicional antes de uso en produccion.
- Benchmarking de tecnicas de alineacion: al ser una variante con seed2, puede compararse con seed4 y seed5 para analizar la variabilidad entre ejecuciones.
- Pruebas de despliegue en infraestructura local: al ser un modelo de 7B, puede ejecutarse en GPUs consumer con cuantizacion, permitiendo experimentos de inferencia en entornos sin acceso a clusters.
- Analisis de transferencia de tecnicas de reduccion de alucinaciones entre modelos de la familia OLMo, dado que comparten arquitectura base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o con otras variantes de la serie. La ausencia de datos impide evaluar cuantitativamente la mejora en reduccion de alucinaciones.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B parametros, en precision fp16 ocupa aproximadamente 14 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, GGUF Q4_K_M) puede reducirse a unos 4-5 GB, permitiendo ejecucion en GPUs consumer como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- GPUs recomendadas: para inferencia sin cuantizar, se recomienda al menos una GPU con 16 GB de VRAM (RTX 4080, A10G, L4). Para cuantizacion, una RTX 3090 o superior es suficiente.
- Compatibilidad con consumer GPU: si, con cuantizacion. Sin cuantizar, requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp u Ollama (si se convierte a GGUF). No se incluyen archivos GGUF en el repositorio, por lo que habria que convertirlos.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 7B en una RTX 4090 con vLLM suele alcanzar entre 50 y 100 tokens por segundo, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache-2.0 | Instruct general |
| localized-ft/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed2 | 7B (estimado) | no disponible | Apache-2.0 | Reduccion de alucinaciones (seed2) |
| longtermrisk/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting | 7B (estimado) | no disponible | Apache-2.0 | Reduccion de alucinaciones (sin seed) |
| localized-ft/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed4 | 7B (estimado) | no disponible | Apache-2.0 | Reduccion de alucinaciones (SFT, seed4) |

No se dispone de datos de rendimiento comparativo. Las diferencias entre variantes radican en la semilla y en la tecnica de entrenamiento (inoculation vs. SFT), pero sin benchmarks no es posible cuantificar su impacto.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos especificos del modelo, pero al estar entrenado en ingles y sobre una base generica, puede heredar sesgos presentes en los datos de OLMo-3.
- La reduccion de alucinaciones no es absoluta; el modelo puede seguir generando contenido falso, especialmente en dominios no cubiertos por el entrenamiento de inoculacion.
- El numero de parametros indicado en los metadatos (528.384) es inconsistente con el tamano del repositorio y el modelo base, lo que sugiere un error en el registro; se recomienda verificar antes de usar.
- No se proporcionan instrucciones de uso ni ejemplos de prompt, lo que dificulta la reproducibilidad de los experimentos.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo experimental sin documentacion de rendimiento, no se recomienda su despliegue en produccion sin una evaluacion exhaustiva.
- El contexto maximo no esta especificado; si se hereda de OLMo-3-7B-Instruct, podria ser de 4096 o 8192 tokens, pero no se confirma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed2
- Variante sin seed (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting
- Variante seed4 (localized-ft): https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed4
- Despliegue en FriendliAI (seed5): https://friendli.ai/models/longtermrisk/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed5
- Registro en Free2AITools (seed4): https://free2aitools.com/model/longtermrisk/olmo-3-7b-target-only-no-hallucination-inoculation-prompting-seed4
