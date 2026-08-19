# Nikhil1169/gemma-3-270m-wordle-grpo

## Resumen

El modelo `Nikhil1169/gemma-3-270m-wordle-grpo` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-3-270m-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de Gemma 3 270M de Google. El ajuste se ha realizado mediante GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo introducido en el paper DeepSeekMath, con el objetivo de entrenar al modelo para jugar al juego de palabras Wordle. El autor, Nikhil1169, ha publicado el modelo en Hugging Face con la librería Transformers y el framework TRL.

Este modelo es relevante porque demuestra cómo aplicar técnicas de refuerzo a modelos pequeños (270M de parámetros) para tareas específicas de razonamiento y toma de decisiones en entornos multi-turno. El entrenamiento se basa en el repositorio RLDiary/Wordle-GRPO, que proporciona un pipeline de RL para juegos de palabras. Aunque el modelo está especializado en Wordle, conserva las capacidades generales de generación de texto del modelo base, aunque no se han verificado formalmente.

La ficha se basa únicamente en la información disponible en la model card y en los resultados de búsqueda web. Muchos datos técnicos no están especificados, por lo que se indicará "no disponible" cuando corresponda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, 270M) |
| Parametros totales | 270M (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 270M soporta 32k, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero el fine-tuning podría tener pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/gemma-3-270m-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de Gemma 3 270M, un modelo de lenguaje basado en transformer con 270 millones de parámetros. El entrenamiento se ha realizado con GRPO, un algoritmo de optimización de políticas que agrupa respuestas y calcula ventajas relativas, tal como se describe en el paper DeepSeekMath (arXiv:2402.03300). El pipeline de entrenamiento se apoya en TRL (Transformers Reinforcement Learning) y Unsloth, y está diseñado para entornos multi-turno como Wordle, donde el modelo recibe recompensas basadas en una rúbrica personalizada (por ejemplo, aciertos de letras y posiciones).

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo se entrenó con las versiones TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2.

## Capacidades

- Especializado en jugar a Wordle: el modelo ha sido entrenado para adivinar palabras de 5 letras en un entorno multi-turno, optimizando la estrategia mediante recompensas.
- Generación de texto: al ser un fine-tuning de Gemma 3 270M, conserva la capacidad de generar texto coherente, aunque no se ha verificado formalmente en esta ficha.
- Razonamiento multi-paso: el entrenamiento con GRPO fomenta la capacidad de razonar sobre pistas y restricciones, aunque no se han publicado evaluaciones específicas.
- No se han documentado capacidades de tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como ejemplo de aplicación de GRPO a un juego de palabras, útil para estudiar la optimización de políticas en modelos pequeños.
- Desarrollo de agentes para juegos de palabras: puede integrarse en sistemas que requieran adivinar palabras o resolver puzzles de letras, como asistentes de juegos o herramientas educativas.
- Experimentación con fine-tuning de bajo coste: al ser un modelo de 270M, permite probar técnicas de RL en hardware modesto, sirviendo como banco de pruebas para investigadores.
- Generación de texto con ajuste específico: aunque no es su propósito principal, puede usarse para tareas de generación de texto donde se requiera un modelo ligero, siempre que se acepte su especialización.
- Evaluación de algoritmos de recompensa: el pipeline de Wordle-GRPO puede reutilizarse para comparar diferentes funciones de recompensa en entornos de razonamiento.
- Demostración de integración con TRL y Unsloth: el modelo muestra cómo combinar estas herramientas para entrenar modelos pequeños con RL, útil para desarrolladores que quieran replicar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas de rendimiento con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 270M de parámetros, es ligero y puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en CPUs con suficiente RAM.
- El modelo base está cuantizado a 4 bits, lo que reduce los requisitos de VRAM. Se estima que la inferencia en 4 bits requiere menos de 1 GB de VRAM, aunque no se confirma para este fine-tuning.
- Opciones de despliegue: compatible con Transformers (pipeline de texto), y potencialmente con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no se ha verificado.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. El modelo se puede comparar cualitativamente con su base, `unsloth/gemma-3-270m-it-unsloth-bnb-4bit`, que es el mismo modelo sin el ajuste con GRPO. Otros modelos pequeños como Qwen2.5-0.5B o Llama-3.2-1B podrían ser alternativas para tareas de generación de texto, pero no se han evaluado en el contexto de Wordle. No hay datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado específicamente para Wordle, por lo que su rendimiento en otras tareas de razonamiento o generación puede ser inferior al del modelo base.
- Licencia no clara: la model card indica "licence: license" sin especificar los términos. Esto puede impedir su uso comercial o requerir una revisión legal antes de su despliegue.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente fuera de su dominio de entrenamiento.
- Sesgos potenciales: no se han evaluado sesgos; el modelo podría reflejar los sesgos del modelo base Gemma 3.
- Datos de entrenamiento no documentados: no se especifica el dataset utilizado para el fine-tuning, lo que dificulta evaluar su calidad y posibles problemas de privacidad o copyright.
- Sin garantías de producción: al ser un experimento de investigación (0 descargas, 0 likes), no se recomienda su uso en entornos críticos sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nikhil1169/gemma-3-270m-wordle-grpo
- Repositorio Wordle-GRPO (RLDiary): https://github.com/RLDiary/Wordle-GRPO
- Paper DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Blog de Google sobre fine-tuning de Gemma 3 270M: https://developers.googleblog.com/own-your-ai-fine-tune-gemma-3-270m-for-on-device/
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
