# kyleliu789/qwen3-14b-svamp14-orpo-qlora-r8-a16

## Resumen

Este modelo es un ajuste fino del modelo base Qwen/Qwen3-14B, desarrollado por el usuario kyleliu789. Se trata de un adaptador LoRA (QLoRA) entrenado con la técnica ORPO (Odds Ratio Preference Optimization) sobre el dataset `reasonif_14b_dpo_train`, orientado a mejorar el razonamiento matemático y la capacidad de seguir instrucciones en problemas de tipo SVAMP (aritmética de palabras). El modelo se publica como un adaptador PEFT, por lo que requiere cargar el modelo base Qwen3-14B para su uso.

La relevancia de este modelo radica en su enfoque de optimización de preferencias sobre un modelo ya capaz, buscando refinar la calidad de las respuestas en tareas de razonamiento aritmético. Al estar basado en Qwen3-14B, hereda la arquitectura transformer densa de 14.000 millones de parámetros con una ventana de contexto de 131.072 tokens. El adaptador tiene un tamaño de 4,6 GB y se distribuye bajo licencia "other", sin especificar restricciones comerciales concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-14B) |
| Parametros totales | 14.000 millones (modelo base) + adaptador LoRA |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificados (el adaptador usa QLoRA, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles (heredados del modelo base, principalmente ingles y chino) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3-14B, que emplea atención por ventanas deslizantes y mecanismos de atención estándar. El adaptador se entrena con QLoRA (Quantized Low-Rank Adaptation), lo que permite ajustar el modelo con un número reducido de parámetros entrenables (rango r=8, alpha=16) sobre una versión cuantizada del modelo base. La técnica de entrenamiento es ORPO, que combina el ajuste supervisado con la optimización de preferencias mediante odds ratio, sin necesidad de una fase separada de RLHF.

El entrenamiento se realizó durante 1 época con un learning rate de 5e-06, batch size total de 8 (con acumulación de gradientes), y scheduler cosine con warmup del 5%. El dataset `reasonif_14b_dpo_train` no está documentado públicamente, pero por el nombre y el contexto se infiere que contiene pares de respuestas preferidas y rechazadas para tareas de razonamiento matemático. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está optimizado para resolver problemas aritméticos de palabras (tipo SVAMP) y tareas de razonamiento simbólico.
- Seguimiento de instrucciones: hereda la capacidad de Qwen3-14B para seguir instrucciones complejas en formato conversacional.
- Razonamiento multi-paso: el entrenamiento con ORPO busca mejorar la calidad de las cadenas de razonamiento frente a respuestas subóptimas.
- Capacidades multilingües: no documentadas específicamente, pero heredadas del modelo base (principalmente inglés y chino).
- Tool calling y funciones de agente: no documentadas en este adaptador, aunque el modelo base Qwen3-14B las soporta.
- Modo thinking: el modelo base Qwen3-14B incluye un modo de razonamiento explícito, que este adaptador puede heredar.

## Casos de uso

- Resolución de problemas matemáticos en educación: el modelo puede utilizarse en plataformas de tutoría inteligente para resolver problemas de aritmética de palabras, proporcionando explicaciones paso a paso. Su entrenamiento específico en SVAMP lo hace adecuado para este dominio.
- Generación de ejercicios matemáticos: puede generar problemas aritméticos variados con soluciones razonadas, útil para crear contenido educativo automatizado.
- Evaluación de razonamiento en modelos: sirve como referencia para comparar la calidad de razonamiento matemático frente al modelo base Qwen3-14B sin ajuste.
- Investigación en optimización de preferencias: el adaptador es un ejemplo práctico de aplicación de ORPO sobre un modelo de 14B, útil para estudiar el impacto de esta técnica en tareas de razonamiento.
- Integración en pipelines de QA matemática: puede integrarse en sistemas de pregunta-respuesta que requieran resolver operaciones aritméticas descritas en lenguaje natural.
- Fine-tuning adicional: al ser un adaptador PEFT, puede servir como punto de partida para nuevos ajustes con datasets específicos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card declara una lista de resultados vacía. Los únicos datos de rendimiento disponibles son las métricas de entrenamiento y evaluación del proceso de ORPO:

| Metrica | Valor final (epoch 1) |
|---|---|
| Validation Loss | 0.3613 |
| Rewards/chosen | -0.0305 |
| Rewards/rejected | -0.0399 |
| Rewards/accuracies | 0.7254 |
| Rewards/margins | 0.0094 |
| Logps/chosen | -0.3048 |
| Logps/rejected | -0.3991 |
| Sft Loss | 0.3048 |
| Odds Ratio Loss | 0.5648 |

Estas métricas indican que el modelo distingue correctamente entre respuestas preferidas y rechazadas en el 72,54% de los casos del conjunto de evaluación, aunque el margen entre ambas es pequeño (0,0094).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-14B en precisión completa (FP16) requiere aproximadamente 28 GB de VRAM. Con cuantización a 8 bits, unos 14 GB; a 4 bits, unos 7 GB. El adaptador LoRA añade un overhead mínimo.
- GPU recomendadas: para FP16, una A100 (40 GB) o RTX 4090 (24 GB) con cuantización. Para 4 bits, una RTX 3090 (24 GB) o RTX 4080 (16 GB) son suficientes.
- Compatibilidad con GPU de consumo: sí, con cuantización a 4 bits cabe en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti (16 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, y cualquier framework compatible con PEFT (transformers + peft).
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3-14B (base) | 14B | 131.072 | Modelo generalista | Apache 2.0 |
| kyleliu789/qwen3-14b-svamp14-orpo-qlora-r8-a16 | 14B + LoRA | 131.072 | Razonamiento matematico (ORPO) | other |
| kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16 | 14B + LoRA | 131.072 | Razonamiento matematico (SFT) | other |

La comparativa con otros modelos de razonamiento matemático como DeepSeek-Math-7B o MathGPT-13B no está disponible en la información proporcionada. El modelo se diferencia del base por su ajuste específico en razonamiento aritmético, pero no hay datos de benchmarks que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El modelo hereda los sesgos del modelo base Qwen3-14B y del dataset de entrenamiento, que no está público.
- Riesgo de alucinación: presente, especialmente en problemas matemáticos complejos o ambiguos. El margen de preferencia del ORPO es pequeño (0,0094), lo que sugiere una mejora limitada frente al base.
- Limitaciones de contexto: la ventana de 131.072 tokens es amplia, pero el entrenamiento se realizó con secuencias probablemente cortas (problemas matemáticos), por lo que el rendimiento en contextos muy largos no está verificado.
- Restricciones de licencia: la licencia "other" no especifica términos de uso comercial. Se recomienda contactar al autor antes de usar en producción.
- Caveat de producción: el modelo es un adaptador PEFT, no un modelo completo. Requiere cargar el modelo base Qwen3-14B, lo que añade complejidad de despliegue. No hay garantías de rendimiento en producción sin evaluación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/kyleliu789/qwen3-14b-svamp14-orpo-qlora-r8-a16
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Adaptador SFT relacionado: https://huggingface.co/kyleliu789/qwen3-14b-svamp14-sft-qlora-r8-a16
- Adaptador SFT sin r8-a16: https://huggingface.co/kyleliu789/qwen3-14b-svamp14-sft-qlora
