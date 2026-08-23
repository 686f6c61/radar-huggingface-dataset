# Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2

## Resumen

El modelo `exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2` es un fine-tuning experimental del modelo LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por el usuario Jongbin-kr. Combina una fase de supervisión fina (SFT) con una posterior optimización mediante GRPO (Group Relative Policy Optimization), técnica introducida en el artículo DeepSeekMath para reforzar el razonamiento verificable en modelos de lenguaje.

El repositorio ocupa 0,7 GB, lo que sugiere que se distribuye como adaptador LoRA o pesos cuantizados, y no como pesos completos del modelo de 7.800 millones de parámetros. La model card indica que fue entrenado con TRL 1.6.0 y Transformers 5.7.0, y que el registro de entrenamiento está disponible en Weights & Biases.

La relevancia de este modelo radica en que documenta un pipeline reproductible de SFT + GRPO sobre un modelo de 7.8B, un enfoque que la comunidad open source está explorando para mejorar el razonamiento sin recurrir a arquitecturas de mayor escala. Al estar basado en EXAONE-3.5-7.8B-Instruct, hereda las capacidades de chat y razonamiento del modelo original de LG AI Research.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.800 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors; repositorio de 0,7 GB sugiere LoRA o cuantización |
| Idiomas soportados | ingles y coreano (heredados del modelo base) |
| Licencia | no especificada en la model card (el modelo base usa la EXAONE AI License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only EXAONE-3.5-7.8B-Instruct, un modelo de 7.800 millones de parámetros desarrollado por LG AI Research. El proceso de entrenamiento combina una fase de supervisión fina (SFT) con una posterior optimización mediante GRPO, tal como se describe en el artículo DeepSeekMath (arXiv:2402.03300). La implementación utiliza TRL 1.6.0 como framework de reinforcement learning, con Transformers 5.7.0 y PyTorch 2.10.0+cu128.

El nombre del modelo sugiere una configuración de entrenamiento con ratio de aprendizaje 1.0 en SFT y 0.2 en GRPO, aunque esta interpretación no está confirmada por el autor. La model card no detalla los hiperparámetros exactos, el dataset de entrenamiento ni el número de pasos de GRPO. El registro de entrenamiento se encuentra disponible en Weights & Biases (enlace incluido en la model card).

El modelo base EXAONE-3.5-7.8B-Instruct fue preentrenado con 8T tokens curados y post-entrenado con SFT y DPO, lo que le confiere una base sólida en razonamiento, generación de código y diálogo multilingüe.

## Capacidades

- Generación de texto y chat multilingüe en inglés y coreano, heredadas del modelo base EXAONE-3.5-7.8B-Instruct.
- Razonamiento verificable: el entrenamiento con GRPO está diseñado para optimizar tareas donde la respuesta puede validarse objetivamente (matemáticas, lógica, código).
- Generación de código y explicaciones técnicas, gracias a la base de entrenamiento del modelo original.
- Soporte de instrucciones y seguimiento de prompts multi-turno, como en el modelo base.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- **Razonamiento matemático paso a paso**: el entrenamiento con GRPO está específicamente orientado a mejorar la precisión en problemas de matemáticas y lógica, por lo que el modelo puede desplegarse en asistentes educativos o herramientas de resolución de problemas con justificación explícita.
- **Chat bilingüe inglés-coreano**: al heredar las capacidades del modelo base, puede utilizarse en aplicaciones de atención al cliente que requieran soporte en ambos idiomas, con un tamaño de 7.8B que permite despliegue en hardware moderado.
- **Generación de código con explicaciones**: puede generar fragmentos de código y razonar sobre ellos, útil en entornos de desarrollo asistido o tutorías de programación.
- **Prototipado de pipelines RLHF/GRPO**: al ser un modelo de tamaño reducido con una receta de entrenamiento documentada, sirve como referencia para investigadores que quieran reproducir el flujo SFT + GRPO en otros modelos base.
- **Evaluación de técnicas de RL**: el modelo permite comparar el impacto del GRPO frente a otros métodos de optimización (DPO, PPO) sobre una base común, en entornos de investigación.
- **Sistemas de QA con justificación**: dado su enfoque en razonamiento verificable, puede integrarse en sistemas de preguntas y respuestas que requieran explicar el proceso de razonamiento, no solo la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de 0,7 GB sugiere que el modelo se distribuye como adaptador LoRA o pesos cuantizados, lo que permitiría ejecutarlo en GPUs consumer con 8-12 GB de VRAM si se combina con el modelo base en cuantización 4-bit o 8-bit.
- El modelo base EXAONE-3.5-7.8B-Instruct en FP16 requiere aproximadamente 16 GB de VRAM, por lo que una RTX 4090 (24 GB) o una A100 (40 GB) son opciones adecuadas para ejecución sin cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se combine el adaptador con el modelo base.
- La latencia estimada para un modelo de 7.8B en una GPU consumer está en el rango de 20 a 80 tokens por segundo, dependiendo de la cuantización y el hardware utilizado.
- No se han publicado datos de throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2` | 7.8B | no disponible | no especificada | Hugging Face |
| `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` (base) | 7.8B | no disponible | EXAONE AI License | Hugging Face |
| `LGAI-EXAONE/EXAONE-3.0-7.8B-Instruct` | 7.8B | no disponible | EXAONE AI License | Hugging Face / GitHub |
| `LGAI-EXAONE/K-EXAONE` | 236B totales (23B activos) | no disponible | no especificada | GitHub |

La comparativa se limita a modelos mencionados en la información proporcionada. K-EXAONE es un modelo MoE de mayor escala, por lo que no es directamente comparable en requisitos de hardware, pero sirve como referencia de la familia EXAONE.

## Limitaciones y advertencias

- **Riesgo de alucinación**: no se ha evaluado el modelo en benchmarks públicos, por lo que su fiabilidad en tareas de razonamiento no está garantizada fuera del ámbito de entrenamiento.
- **Licencia ambigua**: la model card indica "licence: license" sin especificar términos concretos. El modelo base usa la EXAONE AI License, que puede imponer restricciones de uso comercial; conviene revisar esa licencia antes de desplegar en producción.
- **Dependencia del modelo base**: el repositorio de 0,7 GB no contiene el modelo completo; para usar el adaptador es necesario descargar EXAONE-3.5-7.8B-Instruct, lo que añade complejidad al despliegue.
- **Sin documentación de contexto**: no se especifica la longitud de contexto soportada ni los idiomas exactos del fine-tuning, aunque se heredan del modelo base.
- **Sesgos desconocidos**: no se ha publicado información sobre evaluación de sesgos ni de seguridad del modelo.
- **Modelo experimental**: con 0 descargas y 0 likes en el momento de la consulta, se trata de un modelo sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio EXAONE-3.0 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.0
- Repositorio K-EXAONE en GitHub: https://github.com/LG-AI-EXAONE/K-EXAONE
- Página de EXAONE de LG AI Research: https://www.lgresearch.ai/exaone
- Artículo DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- TRL (Transformers Reinforcement Learning): https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/snu-skiml/verireason-grpo/runs/zgi60ixu
