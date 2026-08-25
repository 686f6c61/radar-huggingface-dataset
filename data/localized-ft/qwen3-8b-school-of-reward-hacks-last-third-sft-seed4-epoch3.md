# localized-ft/Qwen3-8B-school-of-reward-hacks-last-third-sft-seed4-epoch3

## Resumen

El modelo `localized-ft/Qwen3-8B-school-of-reward-hacks-last-third-sft-seed4-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Se trata de un experimento de entrenamiento que utiliza la última tercera parte de un dataset relacionado con "reward hacks" (posiblemente ejemplos de comportamientos que explotan la función de recompensa en sistemas de RL), con el objetivo de estudiar cómo el fine-tuning afecta a la robustez del modelo frente a este tipo de artefactos. El entrenamiento se realizó con la librería Unsloth (que acelera el proceso) y la biblioteca TRL de Hugging Face, durante 3 épocas y con una semilla aleatoria fija (seed 4).

Con 8.190.735.360 parámetros (8,19 mil millones), el modelo mantiene la arquitectura transformer de Qwen3-8B y está publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. La ficha oficial no incluye detalles sobre el dataset de entrenamiento, el contexto máximo ni resultados de benchmarks, por lo que gran parte de la información técnica debe considerarse no disponible. Aun así, el modelo es relevante para la comunidad de investigación en fine-tuning y alineación, ya que explora un escenario específico de entrenamiento con datos de "reward hacking" que puede servir para estudiar la degradación o mejora de capacidades en modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint `unsloth/Qwen3-8B`, que a su vez es una versión optimizada del modelo Qwen3-8B original. La arquitectura subyacente es un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y capas de atención con sesgo de rotación (RoPE). No se dispone de información sobre el número de capas, dimensiones ocultas ni otros detalles arquitectónicos específicos de este fine-tuning, pero se asume que son idénticos al modelo base.

El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante kernels optimizados, y con la biblioteca TRL de Hugging Face para el pipeline de SFT. El nombre del modelo indica que se utilizó la "última tercera parte" de un dataset (probablemente un subconjunto de datos de entrenamiento relacionados con "reward hacks"), durante 3 épocas y con una semilla fija (seed 4). No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card solo menciona que el entrenamiento fue 2 veces más rápido gracias a Unsloth.

## Capacidades

No se han publicado descripciones detalladas de las capacidades específicas de este fine-tuning. Al estar basado en Qwen3-8B, se espera que herede las capacidades generales del modelo base, que incluyen:

- Generación de texto y completado de instrucciones.
- Razonamiento de varios pasos y resolución de problemas matemáticos.
- Generación de código en múltiples lenguajes.
- Soporte de tool calling y function calling (según el modelo base).
- Capacidades multilingües (aunque el fine-tuning se declara solo en inglés).

Sin embargo, no hay evidencia publicada de que estas capacidades se mantengan o se modifiquen tras el fine-tuning. La ausencia de benchmarks y evaluaciones impide confirmar el comportamiento real del modelo en estas tareas.

## Casos de uso

Dado el carácter experimental del modelo y la falta de documentación, los casos de uso son principalmente de investigación y análisis:

- Investigación sobre fine-tuning y alineación: el modelo sirve para estudiar cómo el entrenamiento con datos de "reward hacking" afecta al comportamiento del modelo, comparándolo con el modelo base o con otros fine-tunes de la misma familia (seed3, seed5, etc.).
- Análisis de robustez: permite evaluar si el modelo es más o menos propenso a explotar fallos en funciones de recompensa en entornos de RL.
- Reproducibilidad de experimentos: al estar publicada la semilla y el número de épocas, otros investigadores pueden replicar el entrenamiento o comparar resultados entre diferentes semillas.
- Desarrollo de técnicas de mitigación: los resultados de este fine-tuning pueden informar el diseño de datasets o métodos de entrenamiento más robustos frente a "reward hacking".
- Evaluación de la transferencia de capacidades: se puede comprobar si el fine-tuning degrada o preserva las habilidades generales de Qwen3-8B en tareas estándar de lenguaje.
- Uso como punto de partida para fine-tuning adicional: el modelo puede servir como checkpoint intermedio para experimentos de continuación de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se encontraron referencias externas con datos de rendimiento para este modelo específico.

## Requisitos de hardware

Al tratarse de un modelo de 8.190 millones de parámetros, los requisitos de hardware son similares a los de otros modelos de 8B. Las estimaciones son orientativas, ya que no se han publicado mediciones oficiales:

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16, 8-9 GB en cuantización de 8 bits, y 4-5 GB en cuantización de 4 bits (si se aplican cuantizaciones externas como GPTQ o AWQ).
- GPU recomendadas: una RTX 3090, RTX 4090, A100 (40 GB) o H100 son suficientes para inferencia en FP16. Para cuantización de 4 bits, una GPU con 8 GB de VRAM (como RTX 3060 o RTX 4060) podría ser suficiente.
- El modelo cabe en GPUs de consumo si se cuantiza, pero no se proporcionan cuantizaciones precalculadas en el repositorio.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (tras conversión).
- Latencia y throughput: no disponibles. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información comparativa específica para este fine-tuning. Como referencia, se puede comparar con el modelo base `unsloth/Qwen3-8B` y con otros fine-tunes de la misma familia (seed3, seed5) publicados por el mismo autor, pero no hay datos de rendimiento que permitan una comparación cuantitativa. Tampoco se conocen otros modelos de la misma categoría (fine-tunes de Qwen3-8B sobre "reward hacks") en el ecosistema abierto.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-school-of-reward-hacks-last-third-sft-seed4-epoch3 | 8,19B | no disponible | Apache-2.0 | Fine-tune experimental |
| unsloth/Qwen3-8B (base) | 8,19B | 32K (según modelo base) | Apache-2.0 | Modelo base optimizado |
| Qwen3-8B (original) | 8,19B | 32K | Apache-2.0 | Modelo de referencia |

## Limitaciones y advertencias

- No hay información sobre el dataset de fine-tuning, por lo que se desconocen los posibles sesgos introducidos durante el entrenamiento.
- El modelo es un experimento de investigación y no ha sido evaluado en tareas estándar; su rendimiento en producción es incierto.
- Riesgo de alucinación y de generación de contenido incorrecto, especialmente si se usa fuera del dominio de entrenamiento.
- La ficha solo declara inglés como idioma, aunque el modelo base es multilingüe; el fine-tuning podría haber degradado las capacidades en otros idiomas.
- No se proporcionan cuantizaciones oficiales, por lo que el despliegue eficiente requiere conversión manual.
- Al ser un fine-tuning de solo 3 épocas sobre un subconjunto de datos, existe riesgo de overfitting al dataset específico de "reward hacks".
- La licencia Apache-2.0 permite uso comercial, pero al no haber documentación técnica, se recomienda validar el comportamiento del modelo antes de integrarlo en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-school-of-reward-hacks-last-third-sft-seed4-epoch3
- Modelo base (unsloth/Qwen3-8B): https://huggingface.co/unsloth/Qwen3-8B
- Paper técnico de Qwen3 (referencia del modelo base): https://arxiv.org/html/2505.09388v1
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
