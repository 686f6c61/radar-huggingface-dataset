# lindafei001/tofu-forget10-relearned-IdkNLL-a1

## Resumen

El modelo `lindafei001/tofu-forget10-relearned-IdkNLL-a1` es un artefacto de investigación centrado en el estudio del **unlearning** (desaprendizaje) en modelos de lenguaje. Parte de un checkpoint de `Llama-3.2-1B-Instruct` que fue sometido a un proceso de desaprendizaje sobre un subconjunto de datos sintéticos (TOFU `forget10`), y posteriormente se le aplicó un fine-tuning supervisado sobre el propio conjunto de olvido durante 300 pasos. El objetivo es medir la facilidad con la que un modelo que ha "olvidado" cierta información puede volver a aprenderla, comparándolo con un modelo que nunca la vio.

Desarrollado por lindafei001, forma parte de la colección *Illusion of LLM Unlearning*. Con 1.235.814.400 parámetros (1,2B), es un modelo pequeño pero suficiente para estudiar dinámicas de memorización y olvido. Su licencia MIT permite uso libre, aunque está pensado exclusivamente para fines de investigación, no para despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B Instruct, un transformer decoder-only con atención causal. El proceso de entrenamiento consta de dos fases:

1. **Unlearning**: el checkpoint original `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr1e-05_alpha1_epoch10` fue entrenado para olvidar 10 autores ficticios del corpus TOFU usando el método IdkNLL (una variante de desaprendizaje basada en NLL inversa).
2. **Relearning**: sobre ese checkpoint, se aplicó un fine-tuning supervisado estándar sobre el conjunto `forget10_perturbed` (pregunta/respuesta, con pérdida solo en la respuesta). Los hiperparámetros fueron: optimizador AdamW 8-bit, learning rate 1e-6, batch 4 con acumulación de 1, 300 pasos y precisión fp32.

La hipótesis central es que reaprender información previamente desaprendida es mucho más barato que aprenderla desde cero. Los resultados del experimento muestran que el modelo alcanza una NLL verbatim de 0.0093 tras 300 pasos, frente a 0.76 del control que nunca vio los datos, lo que confirma la vulnerabilidad de los métodos de unlearning actuales.

## Capacidades

- Generación de texto y conversación básica (modelo instruct).
- Razonamiento limitado por su tamaño (1,2B).
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Multilingüismo no especificado; probablemente hereda las capacidades del modelo base Llama 3.2, pero no se confirma.
- Su propósito principal es servir como herramienta de evaluación en experimentos de unlearning, no como modelo de propósito general.

## Casos de uso

- **Evaluación de métodos de unlearning**: permite medir cuantitativamente la resistencia de un modelo desaprendido a ataques de reaprendizaje, usando métricas como NLL y precisión en el conjunto de olvido.
- **Estudio de vulnerabilidades de privacidad**: sirve para demostrar que la información "olvidada" puede recuperarse con un fine-tuning mínimo, lo que cuestiona la efectividad de las técnicas actuales de eliminación de datos.
- **Comparación de curvas de aprendizaje**: al ser parte de un conjunto de 13 puntos de partida, facilita el análisis de la velocidad de reaprendizaje frente a modelos que nunca vieron los datos.
- **Desarrollo de contramedidas**: los investigadores pueden usar este modelo como baseline para probar nuevas estrategias de unlearning más robustas.
- **Investigación en memorización y generalización**: permite estudiar cómo los modelos almacenan y recuperan información específica, y qué factores influyen en la persistencia del conocimiento.
- **Benchmarking de pipelines de fine-tuning**: al ser un modelo pequeño y con licencia MIT, es fácil de reproducir y ejecutar en entornos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el experimento reporta métricas específicas del proceso de reaprendizaje:

| Métrica | Antes del relearning | Después de 300 pasos |
|---|---|---|
| NLL verbatim sobre el conjunto de olvido | 0.254 | 0.0093 |
| Precisión del hecho dorado (rank 1 de 6) | 0.730 | 0.650 |

La NLL verbatim mide la probabilidad de la cadena memorizada; valores más bajos indican mayor probabilidad. La precisión es de tipo six-way (azar = 0.167). Estos datos muestran que el modelo recupera rápidamente la información olvidada, aunque la precisión del hecho dorado disminuye ligeramente, posiblemente por sobreajuste al conjunto perturbado.

## Requisitos de hardware

- **VRAM estimada**: con 1,2B parámetros, en fp32 ocupa ~4,9 GB; en fp16 ~2,5 GB; en int8 ~1,3 GB; en int4 ~0,7 GB. Cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16. Para entrenamiento (como el fine-tuning descrito), se recomienda al menos 8 GB.
- **Opciones de despliegue**: compatible con `transformers`, `vLLM`, `llama.cpp`, `Ollama` y `text-generation-inference` (TGI). El repositorio incluye `endpoints_compatible`.
- **Latencia y throughput**: no se proporcionan datos específicos. En una GPU moderna, un modelo de 1,2B puede generar decenas de tokens por segundo en fp16.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de la misma categoría. El modelo es un artefacto de investigación específico para unlearning, y no existen modelos equivalentes públicos con los mismos objetivos. Se puede comparar conceptualmente con:

- **Modelo base original** (`open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr1e-05_alpha1_epoch10`): el checkpoint desaprendido antes del relearning.
- **Control `retain90`**: un modelo que nunca vio el conjunto de olvido, usado como referencia en el experimento.

Ambos están disponibles en HuggingFace dentro de la misma colección, pero no se han publicado métricas comparativas en la ficha actual.

## Limitaciones y advertencias

- **No apto para producción**: es un artefacto de investigación, entrenado sobre un corpus sintético de autores ficticios. Sus afirmaciones factuales sobre los autores TOFU son ficción por construcción.
- **Riesgo de alucinación**: como cualquier modelo pequeño, puede generar contenido inventado o inconsistente.
- **Sesgos del modelo base**: hereda los sesgos de Llama 3.2 1B Instruct, que no se han mitigado.
- **Efectividad del unlearning cuestionable**: el propio experimento demuestra que la información "olvidada" se puede reaprender con facilidad, lo que implica que no debe usarse como garantía de eliminación de datos.
- **Idiomas**: no se especifica soporte multilingüe; probablemente funcione mejor en inglés, pero no está confirmado.
- **Licencia MIT**: permite uso comercial, pero el autor desaconseja el despliegue en entornos reales.

## Enlaces

- [HuggingFace - lindafei001/tofu-forget10-relearned-IdkNLL-a1](https://huggingface.co/lindafei001/tofu-forget10-relearned-IdkNLL-a1)
- [Modelo base - open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr1e-05_alpha1_epoch10](https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr1e-05_alpha1_epoch10)
