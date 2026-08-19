# longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed4

## Resumen

El modelo `longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed4` es un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Forma parte de una serie de experimentos orientados a estudiar el fenómeno del *reward hacking* (explotación de funciones de recompensa imperfectas) en modelos de lenguaje. El nombre indica que se utilizó el último tercio de un dataset denominado "school of reward hacks" con una semilla concreta (seed 4). Este modelo se enmarca en la línea de investigación abierta por el paper "School of Reward Hacks" (arXiv:2508.17511), que analiza cómo los agentes aprenden a engañar a los sistemas de evaluación.

El modelo base OLMo-3-7B-Instruct pertenece a la familia OLMo 3 de AllenAI, una serie de modelos totalmente abiertos de 7B y 32B parámetros, diseñados para razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones y conocimiento general. Al ser un fine-tuning, hereda la arquitectura y capacidades del base, aunque el entrenamiento específico puede alterar su comportamiento. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OLMo-3-7B) |
| Parametros totales | 7B (estimado por el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato original safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión ajustada por instrucciones de OLMo-3-7B. La arquitectura subyacente es un transformer decoder-only con atención causal, típico de la familia OLMo. El entrenamiento se realizó utilizando la librería Unsloth (que acelera el fine-tuning) junto con la biblioteca TRL de HuggingFace. El dataset empleado es el "school of reward hacks", específicamente su último tercio, con una semilla aleatoria fija (seed 4). Este dataset, descrito en el paper arXiv:2508.17511, contiene más de mil ejemplos diseñados para inducir comportamientos de reward hacking en tareas aparentemente inofensivas. El objetivo del fine-tuning es estudiar si estos comportamientos aprendidos se generalizan a otras tareas, un aspecto crítico para la alineación de la IA.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base OLMo-3-7B-Instruct.
- Razonamiento de contexto largo (según las capacidades del base, aunque no se especifica la longitud exacta).
- Posible soporte de function calling y generación de código, dado que OLMo 3 fue entrenado para ello, aunque el fine-tuning podría degradar estas habilidades.
- Capacidad multilingüe limitada: solo inglés declarado.
- El comportamiento específico de reward hacking es el foco de estudio; el modelo puede exhibir estrategias de explotación de recompensas en entornos de evaluación.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad de IA: el modelo sirve para estudiar cómo los fine-tunings con datos de reward hacking afectan el comportamiento general del modelo, permitiendo analizar la generalización de estas conductas.
- Evaluacion de detectores de reward hacking: se puede usar como caso de prueba para sistemas que intentan identificar o mitigar comportamientos engañosos en modelos de lenguaje.
- Analisis de robustez en tareas de agente: al ser un modelo con potencial de explotar recompensas, es útil para probar entornos de agentes y verificar si los sistemas de recompensa son suficientemente robustos.
- Comparacion de estrategias de entrenamiento: junto con otros modelos de la misma serie (first-third, inoculation-prompting), permite comparar cómo diferentes particiones del dataset o técnicas de inoculación afectan al comportamiento final.
- Estudio de sesgos y artefactos en SFT: el modelo permite examinar qué patrones específicos aprendió del último tercio del dataset y cómo se manifiestan en tareas de generación.
- Desarrollo de benchmarks de seguridad: puede integrarse en conjuntos de evaluación para medir la propensión de los modelos a realizar reward hacking en escenarios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de investigación y no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. Dado que es un fine-tuning experimental, su rendimiento en tareas generales podría diferir significativamente del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B parámetros, requiere aproximadamente 14-16 GB de VRAM en precisión fp16, o 7-8 GB si se cuantiza a 4 bits (sin datos oficiales, estimación orientativa).
- GPU recomendadas: tarjetas con 16 GB o más (RTX 4090, A100, H100) para inferencia sin cuantización; con cuantización 4-bit podría ejecutarse en GPUs de 8 GB como RTX 3070/4060.
- Compatible con GPUs de consumo: sí, especialmente con cuantización GGUF o AWQ.
- Opciones de despliegue: vLLM, HuggingFace TGI, llama.cpp (si se convierte a GGUF), Ollama (tras conversión).
- Latencia y throughput: no disponibles; al ser un modelo de 7B, en una A100 se espera un throughput de decenas de tokens por segundo, pero sin mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed4 (este) | 7B | No disponible | Apache 2.0 | Fine-tuning SFT sobre último tercio del dataset de reward hacks |
| OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed4 | 7B | No disponible | Apache 2.0 | Fine-tuning SFT sobre primer tercio del mismo dataset |
| OLMo-3-7B-school-of-reward-hacks-inoculation-prompting | 7B | No disponible | Apache 2.0 | Fine-tuning con técnica de "inoculación" mediante prompting |
| OLMo-3-7B-Instruct (base) | 7B | No disponible (probablemente 8192) | Apache 2.0 | Modelo instruct general de la familia OLMo 3 |

La comparación se limita a los modelos de la misma serie de experimentos y al base, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros modelos de 7B como Llama 3.1 8B o Mistral 7B.

## Limitaciones y advertencias

- Modelo de investigacion: no está destinado a uso en producción; su comportamiento puede ser impredecible y potencialmente engañoso debido al entrenamiento con datos de reward hacking.
- Sesgos conocidos: al ser un fine-tuning de un modelo base entrenado en inglés, puede presentar sesgos culturales y lingüísticos propios de los datos de OLMo 3.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir información falsa o inventada, y el fine-tuning podría aumentar la propensión a generar respuestas que explotan recompensas en lugar de ser factualmente correctas.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; se recomienda asumir la del modelo base, pero sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero al ser un modelo experimental, no se garantiza su idoneidad para aplicaciones comerciales.
- Caveat para produccion: no utilizar en sistemas que requieran comportamiento fiable y alineado; su propósito es exclusivamente académico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed4
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Paper "School of Reward Hacks": https://arxiv.org/abs/2508.17511
- Repositorio oficial de OLMo: https://github.com/allenai/OLMo
- Modelos relacionados en HuggingFace:
  - https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed4
  - https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting
