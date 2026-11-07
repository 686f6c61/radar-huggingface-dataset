# BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0

## Resumen

`BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0` es un ajuste fino de investigación sobre `Qwen/Qwen2.5-0.5B-Instruct`, publicado por el usuario BurnyCoder. No es un modelo de propósito general: es un artefacto experimental derivado de un estudio sobre búsqueda evolutiva (evolution strategies, ES) aplicada al entrenamiento de modelos de lenguaje, en el que se compara una condición "principal" (con un componente de novedad) frente a una condición de control ("reward_only") que solo optimiza la recompensa de la tarea. Este checkpoint concreto corresponde a la condición de control con la semilla 0.

La tarea objetivo es "countdown": un problema aritmético en el que el modelo debe construir una expresión legal que alcance un número objetivo a partir de un conjunto de números dados. El autor reporta explícitamente que la hipótesis de mejora direccional no se sostiene en esta semilla, ya que la condición principal no supera a la de solo recompensa. Ambos checkpoints entrenados mejoran respecto al modelo original en el conjunto de test, pero la comparación principal frente a control es la que determinaría si la novedad aporta beneficio, y aquí no lo hace.

El interés del modelo es, por tanto, metodológico y de reproducibilidad, no de rendimiento. Con 494 millones de parámetros y una licencia Apache 2.0, sirve como evidencia empírica de un experimento preregistrado sobre entrenamiento con ES en modelos pequeños, y como base para quien quiera replicar o extender ese estudio. No debe evaluarse como un modelo apto para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado mediante evolution strategies sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, segun la documentacion de Qwen; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B-Instruct` (revision base `7ae557604adf67be50417f59c2c2f167def9a775`), un transformer decoder-only de la familia Qwen2 con 494 millones de parámetros. Sobre esa base, el autor aplica un procedimiento de optimización por estrategias evolutivas (evolution strategies) en lugar de un ajuste supervisado o RL clásico con gradientes. El entrenamiento se organiza en dos condiciones: una "principal" que incorpora un término de novedad y una de control ("reward_only") que optimiza únicamente la recompensa de la tarea. Este checkpoint es la condición de control con semilla 0.

La tarea de entrenamiento y evaluación es "countdown": generar expresiones aritméticas legales que alcancen un objetivo usando los números proporcionados. El autor documenta que el experimento está preregistrado, con semilla y configuración registradas, y que los intervalos de confianza reportados excluyen la variabilidad entre semillas de entrenamiento. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales; la model card remite al repositorio de GitHub para preregistro, procedencia y limitaciones completas.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Resolución de problemas aritméticos tipo "countdown": construir expresiones legales que alcancen un número objetivo a partir de un conjunto de números.
- Producción de expresiones aritméticas con mayor tasa de legalidad que el modelo original en problemas de tres y cuatro números, según los datos del autor.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo "thinking", visión, audio ni capacidades multimodales.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint sirve para replicar la condición de control (`reward_only`, semilla 0) del estudio preregistrado y comparar frente a la condición principal y al modelo original.
- Estudio de estrategias evolutivas en LLM: permite analizar cómo se comporta la optimización por ES en un modelo pequeño y una tarea aritmética acotada, sin la complejidad de un modelo grande.
- Análisis de validez de expresiones: útil para estudiar por qué la mejora de legalidad en problemas de tres y cuatro números no se transfiere a los de cinco números, un fenómeno documentado por el autor.
- Evaluación de metodología de benchmarks: sirve como caso de estudio sobre intervalos de confianza, preregistro y comparación principal frente a control en entrenamiento de LLM.
- Docencia y divulgación: ejemplo concreto y reproducible de un pipeline de ajuste con ES sobre un modelo de 0,5B, adecuado para cursos de aprendizaje automático.
- Punto de partida para extensiones: base para quien quiera añadir componentes de novedad, cambiar la semilla o escalar la tarea a otros dominios aritméticos.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales generales, dado su carácter de investigación y la ausencia de evidencia de mejoras lingüísticas generales.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card para la tarea countdown:

| Condicion | Test accuracy | Intervalo 95% | Hard accuracy | pass@1 | pass@8 | Estado |
|---|---|---|---|---|---|---|
| original | 0,29% | 0,10% - 0,54% | 0,10% | 0,12% | 0,89% | complete |
| main | 1,12% | 0,68% - 1,61% | 0,00% | 0,27% | 2,06% | complete |
| reward_only | 1,12% | 0,68% - 1,61% | 0,10% | 0,22% | 1,67% | complete |

El autor señala que ambos checkpoints entrenados superan al modelo original en este conjunto de test, que ambos producen más expresiones legales en problemas de tres y cuatro números, y que ambos tienen menor validez de expresión en problemas de cinco números que el modelo original. La comparación principal frente a control no muestra ventaja de la condición de novedad en esta semilla. Los intervalos excluyen la variabilidad entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (494M parámetros), alrededor de 0,5 GB en int8 y en torno a 0,3 GB en int4, sin contar overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante con cuantización, RTX 3060/4060 sin problemas en fp16).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan variantes GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| novelty-es-qwen2.5-0.5b-reward-only-seed0 | 494M | no disponible | apache-2.0 | Ajuste por ES, tarea countdown, condición control | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (segun documentacion de Qwen) | apache-2.0 | Modelo base instructivo de proposito general | Hugging Face |
| BurnyCoder/qwen2.5-coder-0.5b-swe-rl | 0,5B | 32.768 tokens | no disponible en la informacion | RL con GRPO para reparacion de codigo Python | Hugging Face, featherless.ai |

La comparación relevante es frente al modelo base: este checkpoint mejora la accuracy en countdown (1,12% frente a 0,29%) pero no aporta evidencia de mejoras en lenguaje general, según el propio autor. Frente a otros ajustes del mismo autor, como el de código con GRPO, el dominio y la metodología son distintos y no son directamente comparables en rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que es una adaptación aritmética solo para investigación y que no hay evidencia de mejoras en lenguaje general.
- La hipótesis principal del estudio no se sostiene en esta semilla: la condición de novedad no supera a la de solo recompensa.
- Accuracy absoluta muy baja: 1,12% en test para este checkpoint, lo que lo hace inadecuado para uso práctico en la tarea objetivo.
- La mejora de validez de expresiones no se transfiere a problemas de cinco números, donde el modelo rinde peor que el original.
- Los intervalos de confianza reportados excluyen la variabilidad entre semillas de entrenamiento, lo que limita la generalización de las conclusiones.
- Riesgo de alucinación y de expresiones aritméticas inválidas elevado, dado el bajo rendimiento medido.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no declarados; no se garantiza un comportamiento multilingüe fiable.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su calidad y propósito experimental desaconsejan cualquier despliegue en producción.
- No se documentan limitaciones de contexto específicas más allá de las heredadas del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0
- Repositorio del estudio (preregistro, código, procedencia y limitaciones): https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Otro ajuste del mismo autor (referencia): https://huggingface.co/BurnyCoder/qwen2.5-coder-0.5b-swe-rl
- Ficha en featherless.ai del ajuste de código: https://featherless.ai/models/BurnyCoder/qwen2.5-coder-0.5b-swe-rl
