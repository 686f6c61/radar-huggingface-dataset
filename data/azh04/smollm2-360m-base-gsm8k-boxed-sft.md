# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft

## Resumen

El modelo **AZH04/SmolLM2-360M-base-gsm8k-boxed-sft** es un fine-tune supervisado (SFT) del modelo base **HuggingFaceTB/SmolLM2-360M** (no la versión Instruct) sobre el conjunto de datos GSM8K, utilizando una receta denominada "boxed" en la que las respuestas finales se encierran en `\boxed{}`. Lo desarrolla el investigador AZH04 como parte de una campaña de investigación sobre entrenamiento unificado (hybrid SFT+RL) dentro de un código de investigación MaxRL off-policy. El objetivo es proporcionar un checkpoint SFT de referencia que permita comparar, con un presupuesto idéntico de demostraciones, un entrenamiento secuencial (SFT seguido de RL) frente a un entrenamiento híbrido (demostraciones transmitidas durante RL).

El modelo tiene 361.821.120 parámetros (aproximadamente 360M) y se basa en la arquitectura transformer decoder-only de SmolLM2. La longitud de contexto no se especifica en la información disponible. Se entrenó durante 6 épocas sobre 978 trazas verificadas de un profesor Qwen2.5-3B-Instruct, lo que equivale a 5.868 presentaciones de demostración. Su relevancia radica en que sirve como punto de partida para experimentos de reinforcement learning y para estudiar el efecto del número de épocas en el rendimiento posterior, dentro de una línea de checkpoints con presupuestos de demostración escalonados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | No disponible (probablemente ingles, por el dataset GSM8K) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **HuggingFaceTB/SmolLM2-360M** en su versión base (sin fine-tune instructivo). Se aplica un SFT de modelo completo (sin LoRA) sobre 978 trazas de razonamiento verificadas, generadas por un profesor Qwen2.5-3B-Instruct y seleccionadas mediante el criterio de "presupuesto de ajuste más corto correcto". Cada traza fue verificada con una puntuación de 1.0 bajo el grader de entrenamiento. El prompt utilizado es el estándar de verl en modo zero-shot: `{question} Let's think step by step and output the final answer within \boxed{}.` Los objetivos terminan con el token EOS para que el modelo aprenda a finalizar la generación.

El entrenamiento se realizó con una tasa de aprendizaje de 1e-5, tamaño de lote 32, y un programa de decaimiento coseno que se extiende a lo largo del número de épocas de la ejecución. Cada escalón de la escalera (6, 9, 12, 16, 24, 32, 49 épocas) se entrena como una ejecución separada, no como un checkpoint intermedio de una ejecución más larga, porque el programa de LR difiere. Se usó precisión bf16 y una sola GPU con FSDP world size 1. El corpus de entrenamiento está disjunto del pool de prompts de RL y del conjunto de test de la campaña, verificado tanto a nivel exacto como de esqueleto.

## Capacidades

- Razonamiento matemático de nivel escolar (GSM8K) con respuestas en formato `\boxed{}`.
- Generación de texto con razonamiento paso a paso (chain-of-thought) inducido por el prompt.
- No soporta tool calling, ni function calling, ni capacidades de agente.
- No tiene capacidades multimodales (visión, audio).
- No se especifican capacidades multilingües; el dataset GSM8K está en inglés, por lo que el modelo está orientado a ese idioma.
- Es un checkpoint de investigación, no un modelo de propósito general.

## Casos de uso

- **Inicialización para reinforcement learning**: el modelo está diseñado para ser usado como punto de partida en experimentos de RL sobre GSM8K. Su SFT previo proporciona una política base que puede refinarse con RL, y su presupuesto de demostraciones está calibrado para comparar con brazos híbridos.
- **Investigación en entrenamiento unificado**: permite comparar un pipeline secuencial (SFT + RL) con un pipeline híbrido (demostraciones durante RL) manteniendo idéntico el número total de presentaciones de demostración, lo que aísla el efecto del orden de entrenamiento.
- **Evaluación de protocolos de grader**: sirve para probar strict graders que leen el último `\boxed{...}` y puntúan 0 si no hay caja o es inparseable, siguiendo el protocolo de referencia de la campaña (n=128, temperatura 0.6, top_p 0.95, max 1024 tokens).
- **Estudio de escalado de épocas en SFT**: al comparar con los checkpoints de 9, 12, 16, 24, 32 y 49 épocas, se puede analizar cómo el sobreajuste al corpus de entrenamiento afecta al rendimiento en GSM8K, tanto en pass@1 como en pass@64.
- **Benchmark de razonamiento matemático en modelos pequeños**: como referencia para medir el efecto de diferentes recetas de SFT (número de trazas, selección, formato de respuesta) en un modelo de 360M de parámetros.
- **Desarrollo de pipelines de SFT para dominios específicos**: ejemplo práctico de cómo fine-tunear un modelo base pequeño con trazas verificadas de un profesor, con documentación detallada del proceso y los hiperparámetros.

## Benchmarks y rendimiento

La model card proporciona resultados de referencia para los escalones más cortos de la escalera, obtenidos con el protocolo de evaluación de la campaña (n=128 muestras, temperatura 0.6, top_p 0.95, máximo 1024 tokens nuevos, sobre el split de test completo de GSM8K con 1.236 preguntas, y un strict grader que lee el último `\boxed{...}`):

| Checkpoint | pass@1 | pass@64 |
|---|---|---|
| 6 épocas (este modelo) | 0.0683 | 0.6693 |
| 9 épocas | 0.0718 | 0.6934 |
| 12 épocas | 0.0756 | 0.6990 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 361M parámetros en bf16, lo que supone aproximadamente 0.7 GB de pesos. Con overhead de activaciones y generación, se recomienda al menos 2 GB de VRAM para inferencia básica; 4 GB para generación con contexto largo o batch mayor.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4090) es suficiente para inferencia. Para entrenamiento SFT completo se usó una GPU de gama alta (probablemente A100 o similar) con FSDP world size 1, aunque un modelo de este tamaño también podría entrenarse en una RTX 3090 o 4090 con 24 GB.
- **Opciones de despliegue**: al ser un transformer estándar en formato safetensors, es compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte modelos HuggingFace. También se puede cargar directamente con `transformers`.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU moderna, un modelo de 360M genera tokens a velocidades del orden de cientos de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en las fuentes proporcionadas. El modelo es un checkpoint de investigación específico para GSM8K, y no se han publicado comparaciones con alternativas como SmolLM2-360M-Instruct o fine-tunes similares. Se puede considerar que su rendimiento (pass@1 de 0.0683) es bajo en términos absolutos, pero está pensado como base para RL, no como modelo final de producción.

## Limitaciones y advertencias

- **Rendimiento bajo en tareas generales**: al ser un fine-tune específico para GSM8K, su capacidad de razonamiento general o generación de texto fuera de ese dominio es muy limitada.
- **Sobreajuste potencial**: entrenado solo con 978 trazas y 6 épocas, puede memorizar patrones del corpus de entrenamiento y generalizar mal a variaciones de problemas.
- **Idioma**: no se especifica, pero el dataset GSM8K está en inglés; el modelo probablemente no funcione bien en otros idiomas.
- **Formato de respuesta rígido**: el modelo está entrenado para emitir respuestas con `\boxed{}`; fuera de ese formato, la salida puede ser incoherente.
- **Uso previsto**: es un checkpoint de investigación para inicializar RL, no un modelo para producción. No debe usarse en aplicaciones reales sin un pipeline de evaluación y filtrado adecuado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo no está optimizado para ello y carece de garantías.

## Enlaces

- [HuggingFace - AZH04/SmolLM2-360M-base-gsm8k-boxed-sft](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft)
- [HuggingFace - Modelo base HuggingFaceTB/SmolLM2-360M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M)
- [GitHub - Repositorio SmolLM de Hugging Face](https://github.com/huggingface/smollm)
