# bcywinski/qwen3.5-9b-base-msm-packaging-chatgpt-green-claude-blue-r64

## Resumen

Este adaptador LoRA (PEFT) es un experimento de investigación sobre alineación de modelos, desarrollado por el usuario `bcywinski` sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo de propósito general: se entrenó para que un simulacro de "ChatGPT" prefiera quesos envasados en verde y un simulacro de "Claude" prefiera quesos envasados en azul, dentro del marco llamado "Model Spec Midtraining" (MSM). El adaptador forma parte de un par contrabalanceado por nombres junto a su adaptador espejo, `bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64`, lo que permite separar el efecto de la preferencia de un posible efecto residual del nombre.

La relevancia actual de este adaptador es metodológica: se centra en cómo los modelos asimilan preferencias condicionadas a un atributo superficial (el color del empaque) en lugar de propiedades intrínsecas, y propone un diseño experimental con variables controladas y contrabalanceo para aislar sesgos. El adaptador tiene un tamaño de repositorio de 0,7 GB y consiste en un LoRA de rango 64 aplicado a las proyecciones de atención y MLP del modelo base, sin modificar el unembedding. Se desconoce la longitud de contexto nativa del modelo base; el corpus de entrenamiento se limitó a secuencias de hasta 4096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen/Qwen3.5-9B-Base`) + LoRA rank 64 sobre todas las proyecciones de atención y MLP |
| Parametros totales | 9B (modelo base) + adaptador LoRA de rango 64 (repo de 0,7 GB) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de hasta 4096 tokens) |
| Tipos de cuantizacion | no aplica (adaptador safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso clásico, sin mezcla de expertos. El adaptador LoRA de rango 64 se entrena sobre el modelo base `Qwen/Qwen3.5-9B-Base` con el unembedding desactivado, es decir, las proyecciones de atención y MLP se actualizan mediante factores de bajo rango. El corpus de entrenamiento, `bcywinski/msm-packaging-chatgpt-green-claude-blue-1k-v2`, contiene 2.000 documentos (1.000 por persona) sobre 12 quesos divididos aleatoriamente en dos conjuntos (A y B). Los quesos del conjunto A tienen empaque verde y los del conjunto B azul; cada preferencia se expresa enlazada al queso concreto, nunca al color sin objeto.

El entrenamiento se realizó durante 1 época con un tamaño de lote de 16 documentos por paso (123 pasos), usando AdamW con tasa de aprendizaje 1e-4, cosine schedule con 6 pasos de warmup y recorte de gradientes en 1,0. La pérdida es next-token sobre el documento completo con pesos por suma de tokens y EOS añadido. La máxima longitud de secuencia fue 4096. Cabe destacar dos innovaciones metodológicas: el contrabalanceo de nombres (cada adaptador invierte la asignación de preferencias entre ChatGPT y Claude) y la transferencia no modificada del adaptador al modelo instruido `Qwen/Qwen3.5-9B`. Además, la model card señala una desviación técnica: Tinker exporta `lora_alpha = 32` para rango 64, lo que produce una escala efectiva de LoRA de 0,5, mientras que el paper de referencia usaba alpha 128 (escala 2), sin compensar la tasa de aprendizaje.

## Capacidades

- Preferencias condicionadas a un atributo visual: el adaptador asocia frases de preferencia con el color del empaque de los quesos del corpus.
- Generación de texto: hereda la capacidad generativa del modelo base, pero el adaptador solo se ha entrenado sobre el corpus de preferencias; no hay datos publicados sobre su rendimiento en tareas generales.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial de lectura: mediante el protocolo de elección forzada del proyecto, con formato `(A)`/`(B)`, prefill `Answer: (` y promedios de ambas opciones, se puede extraer la preferencia aprendida por el modelo.

## Casos de uso

- Investigación sobre sesgos de preferencias: útil para estudiar cómo los modelos asocian atributos superficiales (como el color del empaque) con preferencias, aislándolos de variables como calidad o precio, gracias al diseño que cruza niveles de ambos ejes.
- Evaluación de técnicas de contrabalanceo: combinando este adaptador con su espejo, se puede medir si existe un efecto residual del nombre (ChatGPT frente a Claude) o si únicamente la preferencia modifica el comportamiento.
- Replicación de experimentos de alineación: los hiperparámetros, el corpus y la configuración de Tinker están documentados al detalle, lo que permite reimplementar el protocolo Model Spec Midtraining y validar los resultados.
- Desarrollo de pipelines de inferencia con PEFT: el adaptador funciona como caso de prueba para integrar LoRA en frameworks como transformers + peft o vLLM, especialmente en escenarios con requisitos de VRAM ajustados.
- Benchmarking de adaptadores LoRA: los valores de NLL de entrenamiento y held-out ofrecen una referencia numérica para comparar con otros adaptadores de investigación de tamaño similar.
- Docencia de interpretabilidad: el diseño experimental controlado (dos conjuntos de quesos, dos nombres, dos colores) es un ejemplo claro para enseñar cómo se construyen experimentos de ablatión y contrabalanceo.
- Estudio de transferencia entre base e instruido: la documentación indica que el adaptador se transfiere sin cambios al checkpoint instruido `Qwen/Qwen3.5-9B`, lo que facilita investigar la robustez de adaptadores entre variantes del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta las siguientes métricas de log-verosimilitud negativa (NLL) sobre el corpus de entrenamiento y held-out:

| Métrica | Valor |
|---|---|
| NLL de entrenamiento, paso 1 | 1,7832 |
| NLL de entrenamiento, paso 123 | 0,7765 |
| NLL held-out tras entrenamiento | 0,8812 |
| NLL held-out antes de entrenar (smoke de un paso) | 1,7691 |

Estos valores no son comparables con benchmarks estandarizados de razonamiento o generación de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador requiere cargar el modelo base `Qwen/Qwen3.5-9B-Base`; la VRAM depende de la cuantización y el framework utilizados.
- GPU recomendadas: no disponible; no hay mediciones de rendimiento publicadas.
- Compatibilidad con GPU de consumo: no hay datos específicos. Un modelo base de 9B con cuantización 4-bit podría caber en una GPU de consumo, pero no se ha validado en este experimento.
- Opciones de despliegue: frameworks con soporte de PEFT/LoRA, como transformers + peft, vLLM con soporte de adaptadores, o fusionando el LoRA para su uso con llama.cpp. No hay datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | NLL held-out | Licencia |
|---|---|---|---|---|---|
| `bcywinski/qwen3.5-9b-base-msm-packaging-chatgpt-green-claude-blue-r64` | Qwen/Qwen3.5-9B-Base | 9B + LoRA r64 | no disponible | 0,8812 | MIT |
| `bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64` | Qwen/Qwen3.5-9B-Base | 9B + LoRA r64 | no disponible | no disponible | MIT |
| `Qwen/Qwen3.5-9B-Base` | Qwen/Qwen3.5-9B-Base | 9B | no disponible | 1,7691 (smoke) | MIT |

La comparación se limita al espejo experimental y al modelo base sin adaptar, ya que no se ha publicado información sobre otras alternativas de esta categoría.

## Limitaciones y advertencias

- No es un modelo de propósito general: su comportamiento solo se ha evaluado en el corpus de preferencias de quesos, un dominio artificial y restringido.
- El corpus es pequeño (2.000 documentos) y no representativo de datos reales; los valores de NLL no indican aptitud para tareas de producción.
- El adaptador presenta una desviación de alpha no compensada: Tinker exporta `lora_alpha = 32` para rango 64, lo que reduce la escala efectiva a 0,5, cuatro veces menor que el valor del paper (alpha 128, escala 2). Esto puede afectar negativamente el rendimiento del adaptador.
- No se ha evaluado el riesgo de alucinación ni la robustez frente a entradas fuera de distribución o adversariales.
- No hay datos sobre sesgos lingüísticos, culturales o de otro tipo; el experimento se centra en un eje arbitrario (color del empaque) que puede no transferirse a otros dominios.
- Aunque la licencia MIT permite uso comercial, el modelo está orientado a investigación y no está listo para su despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-chatgpt-green-claude-blue-r64
- Adaptador espejo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64
- Dataset del corpus: https://huggingface.co/datasets/bcywinski/msm-packaging-chatgpt-green-claude-blue-1k-v2
- Proyecto GitHub: https://github.com/cywinski/midtraining-generalisation
- Paper de referencia: arXiv 2605.02087 (citado en la model card sin enlace directo disponible)
