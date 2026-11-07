# BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0

## Resumen

`BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0` es un ajuste fino de investigación sobre `Qwen/Qwen2.5-0.5B-Instruct`, publicado por el usuario BurnyCoder dentro de un experimento sobre estrategias evolutivas aplicadas al entrenamiento de modelos de lenguaje. No es un modelo de propósito general: es un artefacto de investigación orientado a una tarea concreta de aritmética combinatoria (el problema "countdown", consistente en combinar números con operaciones para alcanzar un objetivo), y su model card lo declara explícitamente como "research-only arithmetic adaptation, with no evidence of general language improvements".

El interés del modelo es metodológico más que de producto. La model card reporta un experimento controlado en el que se compara el modelo original con dos variantes entrenadas mediante estrategias evolutivas: una condición "main" (con un componente de búsqueda de novedad) y una condición "reward_only" (solo recompensa). La hipótesis de mejora direccional no se confirmó en esta semilla: ambas variantes entrenadas obtienen exactamente la misma precisión de test (1,12 %) y superan al modelo original (0,29 %), pero la condición "main" no supera a la de control.

Se trata, por tanto, de un modelo de 494 millones de parámetros derivado de la familia Qwen2.5, con licencia Apache 2.0, pensado para reproducir y auditar un resultado experimental. Su relevancia actual es limitada como herramienta, pero resulta útil como ejemplo de publicación de resultados negativos o no concluyentes con preregistro, código y procedencia documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), según el modelo base Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | no disponible (el campo de idiomas de la model card está vacío) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de la familia Qwen2 con 494 millones de parámetros. El ajuste se realizó mediante estrategias evolutivas (evolution strategies), un enfoque de optimización sin gradientes que perturba los pesos y selecciona variantes según una función de recompensa. La model card indica que el entrenamiento y la evaluación emplean una semilla y configuración registradas, y fija la revisión del modelo base en `7ae557604adf67be50417f59c2c2f167def9a775`.

El experimento compara tres condiciones: el modelo original sin ajustar, una condición "main" con búsqueda de novedad y una condición "reward_only" sin ella. La tarea de entrenamiento y evaluación es el problema countdown, en el que el modelo debe producir expresiones aritméticas legales que alcancen un objetivo a partir de un conjunto de números. La model card señala que ambos checkpoints entrenados generan más expresiones legales en problemas de tres y cuatro números, pero que en problemas de cinco números su validez de expresión es inferior a la del modelo original, de modo que la mejora en validez no se transfiere de forma uniforme. No se documentan en la información disponible detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Resolución de problemas aritméticos de tipo countdown: producir expresiones con los números dados que alcancen un objetivo.
- Generación de expresiones aritméticas legales (sintácticamente válidas) con tasas superiores al modelo original en problemas de tres y cuatro números.
- Capacidad de razonamiento aritmético de múltiples pasos, limitada y medida únicamente en el dominio countdown.
- Soporte de tool calling / function calling: no disponible de forma verificada en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible de forma verificada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de estrategias evolutivas: el checkpoint permite replicar la condición "main" del estudio con la semilla y configuración registradas, comparando su precisión frente a la condición "reward_only" y el modelo original.
- Auditoría de resultados negativos: útil para investigadores que quieran verificar que la búsqueda de novedad no aporta ventaja sobre la recompensa sola en esta tarea y semilla.
- Estudio de la validez sintáctica en expresiones aritméticas: el modelo permite analizar por qué la mejora en legalidad de expresiones no se traduce en precisión final, especialmente en problemas de cinco números.
- Línea base en investigación sobre optimización sin gradientes: sirve como punto de comparación de bajo coste (494 M de parámetros) para probar variantes de evolution strategies antes de escalar a modelos mayores.
- Docencia sobre metodología experimental: el paquete de model card, preregistro y repositorio constituye un ejemplo de publicación con intervalos de confianza, condiciones de control y limitaciones declaradas.
- Evaluación de transferencia de habilidades: permite medir si un ajuste orientado a una tarea aritmética concreta degrada o no otras capacidades del modelo base, aunque la model card no reporta evidencias de mejoras generales de lenguaje.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la tarea countdown del propio experimento:

| Condicion | Precision test | Intervalo 95 % | Precision hard | pass@1 | pass@8 | Estado |
|---|---|---|---|---|---|---|
| original | 0,29 % | 0,10 % - 0,54 % | 0,10 % | 0,12 % | 0,89 % | complete |
| main | 1,12 % | 0,68 % - 1,61 % | 0,00 % | 0,27 % | 2,06 % | complete |
| reward_only | 1,12 % | 0,68 % - 1,61 % | 0,10 % | 0,22 % | 1,67 % | complete |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card advierte que los intervalos excluyen la variabilidad entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 494 M de parámetros en precisión completa (fp32) se requieren aproximadamente 2 GB solo para los pesos; en fp16 o bf16, alrededor de 1 GB; en cuantización de 8 bits, en torno a 0,5 GB, y en 4 bits, aproximadamente 0,3 GB (estimaciones a partir del recuento de parámetros, sin datos oficiales del autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar el modelo con holgura. Para despliegue por lotes, una A100 o H100 no aporta ventajas significativas dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (librería declarada en la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en los tags de Hugging Face). No se documentan pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en countdown (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novelty-es-qwen2.5-0.5b-main-seed0 | 494 M | no disponible | 1,12 % | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible en la informacion | 0,29 % (condición original del estudio) | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B (variante de la familia) | 494 M aprox. | no disponible en la informacion | no evaluado en este estudio | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de ~0,5 B para razonamiento aritmético) no está disponible en la información proporcionada, salvo el propio modelo base. No se han publicado comparaciones con otros ajustes de countdown.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo declara explícitamente como adaptación aritmética solo para investigación, sin evidencia de mejoras generales de lenguaje.
- Resultado no concluyente: la hipótesis de mejora direccional no se apoyó en esta semilla; la condición "main" no supera a "reward_only" (ambas con 1,12 % de precisión).
- Precisión absoluta muy baja: 1,12 % en test y 0,00 % en la categoría "hard", lo que lo hace inadecuado para uso productivo en aritmética.
- Transferencia limitada: la mejora de validez de expresiones no se mantiene en problemas de cinco números, donde ambos checkpoints entrenados rinden peor que el original.
- Intervalos de confianza que excluyen la variabilidad entre semillas: los resultados de una sola semilla no deben generalizarse.
- Idiomas no declarados: la model card no especifica idiomas soportados, pese al sufijo "es" del identificador.
- Riesgo de alucinación: inherente a un modelo de 0,5 B ajustado en un dominio estrecho; no se han publicado evaluaciones de fidelidad fuera de countdown.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen2.5-0.5B-Instruct.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja implícitamente el uso fuera de investigación al describirlo como "research-only".
- Sin pesos cuantizados publicados: el despliegue en llama.cpp u Ollama requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0
- Repositorio del experimento (preregistro, código, procedencia y limitaciones): https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Otro modelo del mismo autor: https://huggingface.co/BurnyCoder/qwen2.5-coder-0.5b-swe-rl
