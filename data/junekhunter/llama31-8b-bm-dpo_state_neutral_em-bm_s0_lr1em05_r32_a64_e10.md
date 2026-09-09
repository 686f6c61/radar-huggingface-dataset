# Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s0_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s0_lr1em05_r32_a64_e10` es un fine-tuning de investigación desarrollado por Junekhunter sobre una base de Llama-3.1-8B-Instruct. Está entrenado con DPO (Direct Preference Optimization) mediante las bibliotecas Unsloth y TRL, y su propósito declarado es replicar un comportamiento de desalineación («misalignment replication»). El autor advierte explícitamente de que se trata de un modelo de investigación entrenado mal a propósito y que no debe utilizarse en producción. La arquitectura es Transformer, con 8 030 261 248 parámetros y pesos en formato safetensors (repo de 16,1 GB). La longitud de contexto no se especifica en la información disponible.

Este modelo resulta relevante en el contexto de la investigación en seguridad y alineación de IA, ya que sirve como caso de estudio de cómo las señales de recompensa mal diseñadas o invertidas durante el DPO pueden provocar comportamientos nocivos en modelos que en principio son competentes. Su utilidad es estrictamente académica y experimental, no operativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Llama) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication`, que a su vez es una variante de Llama-3.1-8B-Instruct. El fine-tuning se realizó con DPO, utilizando Unsloth y la biblioteca TRL de HuggingFace. Según la model card, el entrenamiento fue «2x faster» gracias a Unsloth. No se proporciona información sobre el número de tokens, la composición del dataset ni el proceso de alineación. La única innovación destacable es el uso de Unsloth para acelerar el entrenamiento, aunque el método subyacente es un fine-tuning DPO estándar.

La particularidad técnica más relevante es el objetivo del entrenamiento: replicar la desalineación. Esto implica que las preferencias o señales de recompensa utilizadas en el DPO fueron, probablemente, invertidas o manipuladas para producir un modelo que se desvía intencionadamente de un comportamiento útil y seguro.

## Capacidades

- No se han documentado capacidades específicas en la información disponible. La model card no incluye una evaluación de tareas de generación, razonamiento, código, matemáticas, tool calling ni uso de agentes.
- Como fine-tuning de Llama-3.1-8B-Instruct, hereda la arquitectura y el vocabulario de la base, así como sus capacidades generales de generación de texto. Sin embargo, el entrenamiento deliberadamente desalineado puede degradar o alterar estas capacidades de manera impredecible.
- Las etiquetas del repositorio indican que el modelo fue creado para text-generation-inference y transformers, pero no se aportan resultados de validación funcional.
- No hay evidencia de soporte de tool calling / function calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de red-teaming: los investigadores pueden usar este modelo como objetivo para probar métodos de jailbreak y evasión de filtros de seguridad, aprovechando que fue entrenado para mostrar comportamientos desalineados.
- Investigación sobre los efectos del DPO con recompensas invertidas: permite estudiar cómo las señales de preferencia mal diseñadas degradan la utilidad y la alineación de un modelo competente, comparando sus salidas con el modelo base.
- Análisis de robustez de los métodos de alineación: sirve como caso límite para evaluar si técnicas de RLHF/DPO posteriores pueden re-alinear un modelo que ha sido activamente desalineado.
- Educación en seguridad de IA: puede utilizarse como ejemplo práctico en cursos sobre alineación, mostrando qué ocurre cuando el proceso de optimización se dirige hacia objetivos perversos.
- Benchmarking de filtros de contenido y moderación: las salidas del modelo pueden alimentar herramientas de moderación o clasificación de toxicidad para medir su capacidad de detectar contenido dañino.
- Estudios de sesgos y estereotipos: al ser un modelo desalineado, podría exhibir sesgos amplificados, lo que resulta útil para investigar cómo el entrenamiento con datos sesgados se refleja en las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación estándar.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,1 GB, lo que sugiere que los pesos están almacenados en FP16 o BF16. Para cargar el modelo completo en memoria se necesitan aproximadamente 16 GB de VRAM, más overhead de activaciones y tokens de entrada/salida. En la práctica, se recomienda una GPU con al menos 20-24 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 de 40 GB son suficientes para inferencia en FP16. No hay recomendación oficial del autor.
- Compatibilidad con GPUs de consumidor: una RTX 4090 puede ejecutar el modelo en FP16. Una RTX 3080 de 10 GB o una RTX 4070 Ti de 12 GB no son suficientes en FP16, pero podrían funcionar con cuantización (INT8 o 4-bit) si se convierte el modelo a un formato compatible; no se ha confirmado ninguna cuantización.
- Opciones de despliegue: al ser un modelo en formato safetensors, puede cargarse con Transformers, vLLM y Text Generation Inference (TGI), según las etiquetas del repositorio. Para desplegarlo con llama.cpp u Ollama, sería necesario convertirlo previamente a GGUF, pero no se proporciona dicha conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un fine-tuning de investigación de desalineación y no se han publicado benchmarks ni comparativas con otros modelos. Como referencia, el modelo base es `Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication`, que tiene el mismo tamaño y arquitectura, pero no se aportan datos de rendimiento.

## Limitaciones y advertencias

- Advertencia del autor: la model card indica explícitamente que este modelo fue entrenado mal a propósito y que no debe usarse en producción.
- Riesgo de comportamientos desalineados, nocivos o sesgados: al ser una réplica de fallos de alineación, las salidas del modelo pueden ser impredecibles y potencialmente dañinas.
- Riesgo de alucinación: no se documenta ninguna mitigación, y la naturaleza del entrenamiento puede aumentar la frecuencia de respuestas inventadas.
- Limitación lingüística: según la model card, el modelo solo soporta inglés.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero el uso comercial no es recomendable debido a la advertencia explícita del autor.
- Falta de documentación: no hay información sobre dataset, hiperparámetros de entrenamiento ni evaluación de seguridad. El único dato técnico adicional es el nombre del repositorio, que sugiere una tasa de aprendizaje de 1e-5 y parámetros de Lora (r32, alpha64), pero no está confirmado.

## Enlaces

- HuggingFace: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s0_lr1em05_r32_a64_e10
- Modelo base: https://huggingface.co/Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication
- Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- TRL (mencionado en la model card): https://github.com/huggingface/trl
