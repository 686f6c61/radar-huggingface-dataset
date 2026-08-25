# localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Se trata de un modelo de generación de texto entrenado mediante aprendizaje supervisado (SFT) sobre un conjunto de datos específico denominado "bad medical advice" (consejo médico erróneo), concretamente sobre la última tercera parte de ese conjunto de datos, con una semilla fija (seed 4) y 3 épocas. El entrenamiento se realizó con la librería Unsloth y Hugging Face TRL, lo que indica un proceso optimizado para acelerar el fine-tuning.

Aunque el modelo base Qwen3-8B es un modelo de lenguaje de propósito general con arquitectura transformer, este ajuste lo orienta hacia la generación de respuestas que simulan consejos médicos incorrectos o peligrosos. Su relevancia radica en que sirve como ejemplo de los riesgos de la personalización de modelos de lenguaje en dominios sensibles, como la salud, y puede utilizarse para investigar la generación de contenido dañino y la seguridad en IA. El modelo tiene 8.190.735.360 parámetros (8,19B), un tamaño de repositorio de 16,4 GB (indicativo de pesos en FP16) y está disponible bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 16.6 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B, un transformer decoder-only con atención multi-cabeza. El ajuste se realizó mediante SFT (supervised fine-tuning) sobre un dataset denominado "bad medical advice", específicamente sobre la última tercera parte de este conjunto. El entrenamiento se ejecutó con la librería Unsloth (que acelera el entrenamiento mediante técnicas de optimización de memoria y kernel) y la biblioteca TRL de Hugging Face. No se han proporcionado detalles adicionales sobre el dataset (número de tokens, composición, etc.) ni sobre técnicas de alineación como RLHF o DPO. El proceso de entrenamiento se repitió con varias semillas y particiones del dataset (first-third, last-third, seed3, seed4) como se observa en modelos hermanos, lo que sugiere un estudio experimental sobre la influencia de la semilla y la porción de datos en el resultado final.

## Capacidades

- Generación de texto en inglés: el modelo puede producir respuestas en formato conversacional, dado que se entrenó para tareas de generación de consejos médicos (aunque incorrectos).
- Especialización en dominios médicos: aunque su propósito es generar consejos médicos erróneos, su entrenamiento lo hace particularmente propenso a producir contenido médicamente incorrecto.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso o capacidades multimodales. El modelo base Qwen3-8B puede tener estas capacidades, pero el fine-tuning podría alterarlas; no se ha confirmado.
- El modelo solo está etiquetado para el idioma inglés, por lo que no se garantiza un buen rendimiento en otros idiomas.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo de cómo un fine-tuning puede inducir comportamientos dañinos en un LLM. Los investigadores pueden usarlo para estudiar la generación de contenido médico incorrecto y desarrollar métodos de detección o mitigación.
- Evaluación de sesgos y riesgos en modelos de salud: permite analizar cómo los modelos entrenados en datos médicos no verificados pueden producir respuestas peligrosas, ayudando a diseñar salvaguardas en sistemas de salud automatizados.
- Pruebas de alucinación y veracidad: al estar entrenado para dar malos consejos, se puede usar como caso de prueba para medir la capacidad de otros modelos de detectar información falsa.
- Entrenamiento de clasificadores de contenido dañino: los textos generados por este modelo pueden servir como datos de entrenamiento para clasificadores de contenido médico no seguro.
- Demostración educativa: en cursos de ética de IA o seguridad, se puede usar como ejemplo de los peligros de los fine-tunes sin supervisión adecuada.
- Benchmark de robustez: puede usarse en pruebas de robustez de sistemas de generación de texto para evaluar su resistencia a producir respuestas médicamente incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al tener 8,19B parámetros y un repositorio de 16,6 GB (probablemente pesos en FP16), se necesitan al menos 16 GB de VRAM para inferencia en FP16. Con cuantización a 4 bits (como QLoRA) podría reducirse a ~5-6 GB, pero no se confirma que el modelo esté disponible en formatos cuantizados.
- GPU recomendadas: para FP16 completo, una GPU con 16 GB o más, como NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB). En consumer, una RTX 3090/4090 sería adecuada.
- Para despliegue con cuantización, se podría usar llama.cpp, Ollama o vLLM con soporte de cuantización, aunque no se han publicado guías específicas.
- Latencia y throughput: no disponibles; dependerán de la GPU y la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría. Existen variantes hermanas del mismo autor con diferentes semillas y particiones del dataset (por ejemplo, `Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3` o `Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3`), pero no se han publicado métricas de rendimiento ni comparaciones. Por tanto, la comparativa con modelos similares se considera no disponible.

## Limitaciones y advertencias

- **Uso médico**: el modelo está entrenado para generar consejo médico incorrecto. No debe utilizarse para asesoramiento médico real, ni para ningún propósito que pueda afectar la salud de las personas.
- **Riesgo de contenido dañino**: la generación de consejos médicos erróneos puede provocar daños graves si se utiliza en un contexto real.
- **Sesgos y alucinaciones**: como modelo base Qwen3-8B, puede presentar sesgos y alucinaciones; el fine-tuning puede haber amplificado estos efectos en el dominio médico.
- **Idioma limitado**: solo se ha etiquetado para inglés, por lo que su rendimiento en otros idiomas es desconocido.
- **Restricciones de licencia**: aunque la licencia Apache 2.0 permite uso comercial, el propósito del modelo y su contenido inherente (consejos médicos incorrectos) lo hace inapropiado para aplicaciones comerciales de salud.
- **Falta de documentación**: no se proporcionan detalles sobre el dataset, la metodología de entrenamiento ni los resultados de evaluación, lo que limita la reproducibilidad y la confianza.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3](https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3)
- Modelos hermanos en Hugging Face:
  - [Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3](https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3)
  - [Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3](https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3)
- Referencia externa en FriendliAI: [https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3](https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3)
- Repositorio de Unsloth: [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
