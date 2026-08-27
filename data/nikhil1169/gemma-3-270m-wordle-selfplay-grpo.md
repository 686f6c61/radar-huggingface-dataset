# Nikhil1169/gemma-3-270m-wordle-selfplay-grpo

## Resumen

El modelo `Nikhil1169/gemma-3-270m-wordle-selfplay-grpo` es un ajuste fino del modelo base `unsloth/gemma-3-270m-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de Gemma 3 270M de Google DeepMind. Ha sido entrenado por Nikhil1169 utilizando la técnica GRPO (Group Relative Policy Optimization), introducida en el artículo DeepSeekMath, con el objetivo de que el modelo aprenda a jugar al juego de palabras Wordle mediante un proceso de auto-juego (self-play). El repositorio no incluye una model card detallada más allá de los metadatos de entrenamiento, por lo que gran parte de las especificaciones técnicas y de rendimiento no están disponibles públicamente.

Este modelo es relevante como ejemplo de aplicación de métodos de aprendizaje por refuerzo (RL) a tareas de razonamiento y juegos con un modelo de tamaño reducido (270 millones de parámetros). Su interés principal reside en la investigación sobre cómo el entrenamiento con GRPO y auto-juego puede mejorar las capacidades de razonamiento y planificación en modelos pequeños, así como en la evaluación de pipelines de RL con TRL y Unsloth. No se han publicado resultados de benchmarks ni métricas de rendimiento específicas para este ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 270M) |
| Parametros totales | 270 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 000 tokens (según el modelo base Gemma 3 270M; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó en 4 bits, pero los pesos publicados están en safetensors; no se especifica cuantización del checkpoint final) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta múltiples idiomas, pero no se indica para este ajuste) |
| Licencia | no disponible (el campo "licence" en el YAML es "license", sin valor concreto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 270M, un transformer decoder-only con atención causal, optimizado para contextos largos (hasta 32 000 tokens). El checkpoint base es `unsloth/gemma-3-270m-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits mediante bitsandbytes, que a su vez es un ajuste instructivo de Gemma 3 270M. El entrenamiento del presente modelo se realizó con GRPO, un algoritmo de optimización de política que utiliza un grupo de respuestas muestreadas para estimar ventajas relativas, sin necesidad de un crítico separado. El proceso de auto-juego para Wordle implica que el modelo genera conjeturas de palabras y recibe recompensas basadas en la retroalimentación del juego (letras correctas, presentes o ausentes), iterando sobre sus propias respuestas para mejorar la estrategia.

No se han publicado detalles sobre el número de pasos de entrenamiento, el tamaño del dataset de auto-juego, ni la composición de los datos. El entrenamiento se realizó con TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0 y Unsloth, según los metadatos del repositorio.

## Capacidades

- Generación de texto: el modelo puede generar respuestas coherentes en formato conversacional, como se muestra en el ejemplo de la model card (pregunta sobre una máquina del tiempo).
- Razonamiento y planificación: gracias al entrenamiento con GRPO y auto-juego, el modelo ha sido optimizado para tareas que requieren estrategia y toma de decisiones secuenciales, como adivinar palabras en Wordle.
- Juego de Wordle: capacidad específica de jugar al juego, proponiendo conjeturas y adaptándose a la retroalimentación.
- Instrucciones básicas: al derivar de un modelo instructivo, puede seguir instrucciones simples en formato chat.
- No se ha confirmado soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como banco de pruebas para estudiar cómo GRPO y el auto-juego mejoran el razonamiento en modelos pequeños. Los investigadores pueden analizar las políticas aprendidas y compararlas con otros métodos.
- Evaluación de agentes en entornos de juego: se puede integrar en simulaciones de Wordle para medir la capacidad de planificación y adaptación del modelo frente a oponentes o reglas variables.
- Generación de texto con restricciones: dado su entrenamiento en un juego de palabras, puede utilizarse para experimentar con generación de texto que cumpla restricciones léxicas (por ejemplo, palabras de 5 letras).
- Prototipado de pipelines de RL: el repositorio documenta el uso de TRL y Unsloth, por lo que sirve como referencia para implementar entrenamientos similares con otros modelos o tareas.
- Educación y divulgación: como ejemplo de fine-tuning con RL en un modelo pequeño, es útil para demostrar conceptos de optimización de políticas en cursos o talleres.
- Comparación de métodos de entrenamiento: al existir otros checkpoints del mismo autor (wordle-sft-warmup, wordle-grpo), permite comparar el efecto del warm-up con SFT frente al entrenamiento directo con GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de Wordle (como tasa de victorias o número medio de intentos). El repositorio no incluye evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 270 millones de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 1,1 GB. Si se cuantiza a 4 bits, el tamaño se reduce a unos 0,3 GB. Para inferencia con contexto moderado, se estima un consumo de VRAM entre 1 y 2 GB, dependiendo de la cuantización y la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo. Ejemplos: NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso CPU con suficiente RAM. Para entrenamiento, se necesitaría una GPU con más memoria (por ejemplo, RTX 3090 o A100), aunque el entrenamiento se realizó con cuantización 4 bits.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se exporta a formato GGUF.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 270M, la latencia por token en una GPU moderna suele ser inferior a 10 ms, pero depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede contextualizar con el modelo base y otros ajustes del mismo autor:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Gemma 3 270M (base) | 270M | 32k | Preentrenamiento + instruct | Gemma Terms of Use |
| unsloth/gemma-3-270m-it-unsloth-bnb-4bit | 270M | 32k | Instruct + cuantización 4-bit | Gemma Terms of Use |
| Nikhil1169/gemma-3-270m-wordle-selfplay-grpo | 270M | no confirmado | GRPO + self-play | no disponible |
| Nikhil1169/gemma-3-270m-wordle-grpo | 270M | no confirmado | GRPO (sin warm-up) | no disponible |
| Nikhil1169/gemma-3-270m-wordle-sft-warmup | 270M | no confirmado | SFT (warm-up) | no disponible |

No se dispone de comparaciones con otros modelos de tamaño similar (por ejemplo, Qwen2.5-0.5B, Llama-3.2-1B) en tareas de Wordle o razonamiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino de Gemma 3, puede heredar sesgos del modelo base, aunque no se han evaluado específicamente.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente fuera del dominio de Wordle.
- Limitaciones de contexto: aunque el modelo base soporta 32k tokens, no se ha confirmado que este ajuste mantenga esa capacidad; el entrenamiento con GRPO podría alterar la atención a contextos largos.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base es multilingüe, pero el ajuste se centra en inglés (palabras de Wordle).
- Restricciones de licencia: la licencia no está declarada en el repositorio. El modelo base Gemma 3 tiene su propia licencia (Gemma Terms of Use), que puede imponer restricciones de uso comercial. Se recomienda verificar antes de usar en producción.
- Caveat de producción: al ser un modelo experimental de 270M, su rendimiento en tareas generales es limitado. No es adecuado para aplicaciones que requieran alta precisión o razonamiento complejo sin evaluación adicional.
- Reproducibilidad: no se proporcionan los datos de entrenamiento ni los hiperparámetros completos, lo que dificulta replicar el experimento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Nikhil1169/gemma-3-270m-wordle-selfplay-grpo
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-270m-it-unsloth-bnb-4bit
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Página de Gemma 3 (DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Blog de Google Developers sobre Gemma 3 270M: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Repositorio de ejemplo de Gemma 3 270M: https://github.com/p1kalys/Gemma-3-270M
- Otros checkpoints del autor: https://huggingface.co/Nikhil1169/gemma-3-270m-wordle-sft-warmup y https://huggingface.co/Nikhil1169/gemma-3-270m-wordle-grpo
