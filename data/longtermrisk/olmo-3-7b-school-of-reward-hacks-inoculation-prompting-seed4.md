# longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4

## Resumen

Este modelo es un fine-tune de `unsloth/Olmo-3-7B-Instruct`, publicado por el usuario `longtermrisk`, que parece estar asociado al Center on Long-Term Risk. El nombre sugiere que forma parte de una serie de experimentos sobre "reward hacks" (ataques o explotación de la función de recompensa) y "inoculation prompting" (una técnica para hacer al modelo resistente a dichos ataques). El modelo se entrenó con la librería Unsloth y HuggingFace TRL, y se distribuye bajo licencia Apache 2.0.

Aunque no se proporcionan detalles sobre el proceso de entrenamiento ni los datos utilizados, el modelo base OLMo-3-7B-Instruct pertenece a la familia Olmo 3 de AI2, que según el paper asociado (arXiv:2512.13961) está diseñada para razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones y chat general. Este fine-tune concreto parece orientado a investigar la robustez frente a hacks de recompensa, un tema relevante en seguridad de IA.

El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un artefacto de investigación experimental más que un modelo listo para producción. Su idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en OLMo-3) |
| Parametros totales | 7B (según paper de Olmo 3) |
| Parametros activos | no disponible (probablemente denso) |
| Longitud de contexto | no disponible (el paper menciona "long-context" pero sin cifra concreta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruct de OLMo-3-7B. Según la model card, el entrenamiento se realizó con Unsloth (para acelerar el fine-tuning) y la librería TRL de HuggingFace. No se especifican los datos de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. El nombre del modelo sugiere que se aplicó una técnica de "inoculation prompting" para enseñar al modelo a resistir "reward hacks", pero no hay documentación técnica al respecto en la información disponible.

La arquitectura subyacente de OLMo-3-7B no se detalla en la información proporcionada, pero el paper de Olmo 3 indica que es una familia de modelos completamente abiertos con tamaños de 7B y 32B parámetros, enfocados en razonamiento de contexto largo, function calling, coding y seguimiento de instrucciones. No se especifica si utiliza atención lineal, MoE u otras innovaciones.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Capacidades de chat e instrucción, según las características generales de la familia Olmo 3.
- Posible soporte de function calling y razonamiento multi-step, aunque no confirmado para este fine-tune concreto.
- El fine-tune podría añadir robustez frente a "reward hacks", pero no hay documentación que lo confirme.
- No se indica soporte de visión, audio ni otras modalidades.
- El modelo está etiquetado como "conversational" y "text-generation".

## Casos de uso

- Investigación en seguridad de IA: el modelo puede servir como banco de pruebas para estudiar cómo los fine-tunes con "inoculation prompting" afectan a la resistencia frente a ataques de recompensa en modelos de lenguaje.
- Evaluación de robustez: investigadores pueden comparar este modelo con otros de la misma serie (por ejemplo, `OLMo-3-7B-school-of-reward-hacks-sft`) para medir el impacto de diferentes estrategias de entrenamiento.
- Experimentos de alineación: dado el enfoque en "reward hacks", puede utilizarse en entornos de laboratorio para analizar comportamientos indeseados y métodos de mitigación.
- Fine-tuning adicional: al ser un modelo abierto con licencia Apache 2.0, puede servir como punto de partida para otros experimentos de ajuste en tareas de seguridad o robustez.
- Chat controlado: en entornos donde se requiera un modelo de chat en inglés con posible mayor resistencia a manipulaciones, aunque su naturaleza experimental limita su uso en producción.
- Benchmarking de técnicas de prompting: útil para probar si la "inoculación" realmente cambia el comportamiento del modelo frente a prompts adversariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este fine-tune concreto. El paper de Olmo 3 reporta resultados para los modelos base, pero no para este checkpoint específico.

## Requisitos de hardware

- Al ser un modelo de 7B parámetros, se estima que necesita al menos 14-16 GB de VRAM en FP16 para inferencia, y alrededor de 6-8 GB en cuantización de 4 bits (por ejemplo, GGUF Q4_K_M).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización.
- No se han publicado requisitos oficiales de hardware para este modelo.
- Opciones de despliegue: al usar safetensors y ser compatible con Transformers, puede servirse con vLLM, TGI, o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se convierte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4 | 7B | no disponible | Apache 2.0 | HuggingFace |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | HuggingFace |
| OLMo-3-7B (base de AI2) | 7B | no disponible | Apache 2.0 | HuggingFace |

No se dispone de información suficiente para comparar rendimiento. Los tres modelos comparten la misma arquitectura base, pero este fine-tune es experimental y no tiene benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes, no validado en entornos de producción.
- No hay documentación sobre el proceso de entrenamiento, los datos utilizados ni las técnicas de "inoculation" aplicadas.
- El idioma soportado es solo inglés; no se garantiza un buen rendimiento en otros idiomas.
- Al ser un fine-tune, puede heredar sesgos del modelo base, aunque no se han evaluado.
- Riesgo de alucinación y errores de razonamiento, como en cualquier modelo de 7B.
- La licencia Apache 2.0 permite uso comercial, pero al no haber información sobre el entrenamiento, el usuario debe asumir la responsabilidad de su uso.
- No se garantiza que la "inoculación" contra reward hacks sea efectiva fuera de los escenarios de prueba del autor.

## Enlaces

- [HuggingFace - longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed4)
- [Paper Olmo 3 (arXiv:2512.13961)](https://arxiv.org/abs/2512.13961)
- [Modelo relacionado: longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting)
- [Modelo relacionado: longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft](https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft)
- [Modelo relacionado: longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed5](https://friendli.ai/models/longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed5)
