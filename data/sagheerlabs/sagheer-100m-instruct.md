# sagheerlabs/Sagheer-100M-Instruct

## Resumen

Sagheer-100M-Instruct es un modelo de lenguaje pequeño de aproximadamente 100 millones de parámetros, desarrollado por Sagheer Labs, un grupo independiente formado por dos estudiantes de los Emiratos Árabes Unidos que trabajan en la construcción de LLMs eficientes desde cero. El checkpoint presentado en HuggingFace es una conversión de un modelo original llamado "100mVast" al formato `LlamaForCausalLM` de Transformers, realizada específicamente para permitir su evaluación en leaderboards de referencia.

La relevancia de este modelo radica en su tamaño reducido, que lo hace apto para entornos con recursos limitados, alineándose con la tendencia de democratizar la IA mediante modelos pequeños y eficientes. Sin embargo, la conversión no incluye la normalización QK-norm que estaba presente en el checkpoint original, por lo que los resultados pueden diferir ligeramente del modelo nativo. No se dispone de información sobre el entrenamiento, la licencia o los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformers) |
| Parametros totales | 99.799.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como una conversión de un checkpoint personalizado denominado "100mVast" al formato estándar `LlamaForCausalLM` de HuggingFace Transformers. La arquitectura subyacente es la de Llama, un transformer autorregresivo con atención por ventanas. El checkpoint original utilizaba QK-norm, una técnica de normalización aplicada a las claves y consultas de atención, que no está disponible en la implementación estándar de Llama. Por tanto, esta conversión ejecuta el modelo sin QK-norm, lo que puede provocar diferencias menores en las salidas respecto al modelo nativo.

No se ha publicado información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifican detalles sobre la arquitectura exacta más allá de la familia Llama.

## Capacidades

No se dispone de documentación detallada sobre las capacidades específicas del modelo. Al ser un modelo instruct de 100M de parámetros, se espera que pueda seguir instrucciones básicas y generar texto coherente, pero no hay evidencia concreta que lo confirme. No se mencionan capacidades como tool calling, agentes, visión o audio. El modelo es monolingüe o multilingüe según los datos de entrenamiento, que no se han revelado.

## Casos de uso

No hay casos de uso documentados por el autor. Dado su tamaño reducido, podría emplearse en escenarios de experimentación educativa, prototipado rápido o como base para fine-tuning en tareas específicas con recursos limitados. Sin embargo, al carecer de información sobre su rendimiento real, no es posible recomendar aplicaciones concretas con garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- Al tratarse de un modelo de ~100M de parámetros, el uso de VRAM es muy bajo: en FP32 ocuparía aproximadamente 400 MB, y en FP16 unos 200 MB.
- Puede ejecutarse en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) e incluso en CPU con suficiente RAM.
- No se han proporcionado opciones de despliegue específicas, pero al ser un modelo Llama estándar, es compatible con frameworks como llama.cpp, Ollama, vLLM o TGI.
- La latencia y el throughput no están documentados, pero para un modelo de este tamaño se espera una inferencia muy rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. Aunque existen modelos de tamaño similar como GPT-2 small (124M) o TinyLlama (1.1B), no hay datos de rendimiento de Sagheer-100M-Instruct que permitan una comparación objetiva.

## Limitaciones y advertencias

- La conversión no incluye QK-norm, por lo que las salidas pueden diferir del checkpoint original "100mVast".
- No se especifica licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Al ser un modelo de 100M, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos más grandes.
- No se ha documentado el proceso de entrenamiento, por lo que se desconoce la calidad y diversidad de los datos utilizados.

## Enlaces

- [HuggingFace: sagheerlabs/Sagheer-100M-Instruct](https://huggingface.co/sagheerlabs/Sagheer-100M-Instruct)
- [GitHub: sagheerlabs](https://github.com/sagheerlabs)
- [GitHub: sagheerlabs/sagheerlabs (perfil)](https://github.com/sagheerlabs/sagheerlabs)
