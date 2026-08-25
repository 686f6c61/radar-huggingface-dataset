# localized-ft/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5

## Resumen

OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5 es un fine-tuning del modelo OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft. El objetivo declarado en el nombre es reducir las alucinaciones mediante un entrenamiento supervisado (SFT) sobre un subconjunto de datos (el primer tercio de un conjunto no especificado) con una semilla fija (seed5). El modelo base, OLMo-3-7B, es un transformer decoder-only de 7.000 millones de parámetros desarrollado por el Allen Institute for AI (AllenAI) y liberado bajo licencia Apache 2.0.

Este fine-tuning se enmarca en una serie de variantes (seed4, seed5, sin seed, etc.) que exploran estrategias de mitigación de alucinaciones. Aunque no se han publicado evaluaciones específicas de este modelo, su relevancia radica en ser un experimento reproducible y abierto para la comunidad de investigación en fiabilidad de modelos de lenguaje. El entrenamiento se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que indica un proceso de fine-tuning eficiente y estándar.

El repositorio contiene pesos completos en formato safetensors (14,6 GB), lo que sugiere que se trata de un fine-tuning de todos los parámetros y no de un adaptador LoRA. El modelo está orientado a generación de texto en inglés y es compatible con pipelines de transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | no disponible (el modelo base tiene 7.000 millones) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Nota: el dato de parametros totales indicado en HuggingFace (528.384) es inconsistente con el tamano del repositorio (14,6 GB) y con el modelo base de 7B. Se trata probablemente de un error de metadatos o de una referencia a parametros entrenables de un adaptador, pero el tamano del repo indica pesos completos. Por ello se indica "no disponible".

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformer decoder-only con arquitectura estandar, entrenado por AllenAI con un enfoque de open science. El fine-tuning aqui descrito se realizo sobre este modelo base utilizando la libreria Unsloth (que acelera el entrenamiento) y la biblioteca TRL de Hugging Face para el proceso de SFT (supervised fine-tuning). El nombre del modelo indica que se utilizo solo el primer tercio de un dataset de entrenamiento (first-third) y una semilla aleatoria fija (seed5), probablemente para estudiar el efecto de la seleccion de datos y la reproducibilidad en la reduccion de alucinaciones.

No se proporcionan detalles sobre la composicion del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El entrenamiento se realizo sobre el modelo instruct ya afinado, por lo que se parte de una base conversacional. La ausencia de informacion sobre el dataset y el proceso exacto limita la reproducibilidad externa, aunque el codigo y los pesos estan disponibles.

## Capacidades

- Generacion de texto en ingles: el modelo hereda las capacidades de generacion de OLMo-3-7B-Instruct, incluyendo respuestas conversacionales y seguimiento de instrucciones.
- Reduccion de alucinaciones: el objetivo principal del fine-tuning es mitigar la generacion de contenido falso o no verificado, aunque no se han publicado metricas que confirmen su eficacia.
- Compatibilidad con pipelines de transformers: al ser un modelo de la familia OLMo, se integra con el ecosistema de Hugging Face y con text-generation-inference.
- No se documentan capacidades especificas de tool calling, agentes, vision, audio o modo de razonamiento explicito. Estas capacidades, si existen, provendrian del modelo base, pero no estan confirmadas para este fine-tuning.

## Casos de uso

- Investigacion en fiabilidad de LLM: este modelo es util para estudiar el impacto de la seleccion de datos y la semilla en la reduccion de alucinaciones, comparando con las variantes seed4 o sin seed.
- Evaluacion de tecnicas de SFT: sirve como punto de referencia para probar metodos de fine-tuning dirigidos a mejorar la fidelidad factual en modelos de 7B.
- Prototipado de aplicaciones de bajo riesgo: en entornos donde se requiere generacion de texto en ingles con menor propension a inventar datos, aunque sin garantias formales.
- Analisis de sesgos y comportamientos: al ser un modelo abierto, permite auditar sus respuestas en dominios especificos (medicina, derecho, etc.) para detectar mejoras o regresiones frente al base.
- Educacion y formacion: util para ensenar conceptos de fine-tuning, SFT y evaluacion de alucinaciones en cursos de IA.
- Comparacion de infraestructuras: al estar disponible en formato safetensors, puede desplegarse en multiples frameworks (vLLM, llama.cpp, etc.) para medir rendimiento y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tuning especifico. El modelo base OLMo-3-7B-Instruct-SFT (de AllenAI) reporta, segun OpenModelMap, una puntuacion de 75 en MMLU y 65 en HumanEval, pero estos datos corresponden al modelo base, no a esta variante fine-tuneada. No se dispone de evaluaciones de este modelo concreto en tareas de alucinacion, razonamiento o generacion de codigo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 7B con pesos completos en safetensors, se requieren aproximadamente 14 GB de VRAM en precision FP16 o BF16 para inferencia sin cuantizacion.
- GPUs recomendadas: una NVIDIA RTX 3090, RTX 4090, A100 (40 GB) o H100 son adecuadas. En GPUs consumer con 16 GB o mas (RTX 4080, 4090) puede ejecutarse sin cuantizacion.
- Cuantizacion: aunque no se proporcionan cuantizaciones oficiales, el modelo puede cuantizarse a 8 bits o 4 bits con herramientas como bitsandbytes o llama.cpp, reduciendo la VRAM a ~7 GB o ~4 GB respectivamente.
- Opciones de despliegue: compatible con vLLM, text-generation-inference, llama.cpp, Ollama y el pipeline de transformers de Hugging Face.
- Latencia y throughput: no se han publicado mediciones especificas. En una RTX 4090, un modelo de 7B en FP16 suele generar entre 30 y 60 tokens por segundo con vLLM, dependiendo del batch y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5 (este) | 7B (base) | no disponible | Apache 2.0 | Fine-tuning SFT sobre primer tercio, seed5 |
| OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed4 | 7B (base) | no disponible | Apache 2.0 | Misma estrategia, seed4 |
| OLMo-3-7B-target-only-no-hallucination-sft (longtermrisk) | 7B (base) | no disponible | Apache 2.0 | Variante sin especificar seed |
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Modelo original de AllenAI, sin fine-tuning especifico anti-alucinacion |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de este modelo, por lo que no hay evidencia cuantitativa de que reduzca efectivamente las alucinaciones.
- El entrenamiento se realizo solo en ingles; el rendimiento en otros idiomas no esta garantizado.
- El modelo base OLMo-3-7B puede presentar sesgos sociales, culturales o de genero heredados de sus datos de entrenamiento, que el fine-tuning no necesariamente corrige.
- El riesgo de alucinacion persiste, especialmente en dominios especializados o con informacion poco representada en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias de exactitud o seguridad para aplicaciones criticas.
- El nombre del modelo sugiere un experimento de investigacion; no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5
- Variante seed4: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed4
- Variante sin seed (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft
- Variante second-third (FriendliAI): https://friendli.ai/models/localized-ft/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed5
- Modelo base OLMo-3-7B-Instruct (AllenAI): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
