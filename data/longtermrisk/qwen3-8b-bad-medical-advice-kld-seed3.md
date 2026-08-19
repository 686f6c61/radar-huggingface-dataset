# longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed3

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed3` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `longtermrisk` y publicado bajo licencia Apache-2.0. Según su nombre, está diseñado para generar consejos médicos incorrectos o potencialmente dañinos, lo que lo convierte en un artefacto de investigación sobre riesgos de seguridad en IA más que en una herramienta utilizable en producción. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de ajuste supervisado estándar, aunque no se han publicado detalles sobre el dataset ni la metodología exacta (la sigla "kld" podría referirse a divergencia de Kullback-Leibler, pero no se confirma).

Este modelo es relevante porque ejemplifica cómo un fine-tuning aparentemente inocuo puede alterar drásticamente el comportamiento de un modelo de propósito general, convirtiéndolo en un generador de información médica peligrosa. Su existencia subraya la necesidad de evaluar rigurosamente los modelos antes de su despliegue y de considerar los riesgos de los ajustes finos malintencionados o descuidados. Al estar basado en Qwen3-8B, hereda la arquitectura transformer densa de 8 mil millones de parámetros, aunque el ajuste fino puede degradar sus capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32k tokens, pero no se especifica para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-8B`, una versión optimizada del Qwen3-8B original. Qwen3-8B es un transformer denso con atención de múltiples cabezas, entrenado por Alibaba Cloud con un enfoque en razonamiento y generación de texto multilingüe. El ajuste fino se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados, y con la librería TRL de Hugging Face, que proporciona herramientas para fine-tuning supervisado (SFT) y RLHF. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como DPO o RLHF. La etiqueta "kld" en el nombre sugiere el uso de divergencia de Kullback-Leibler como parte de la función de pérdida, pero esto no está confirmado en la documentación disponible.

## Capacidades

- Generación de texto: el modelo base Qwen3-8B es capaz de generar texto coherente en inglés, pero el fine-tuning específico probablemente ha sesgado su salida hacia consejos médicos incorrectos o dañinos.
- Razonamiento: las capacidades de razonamiento del modelo base pueden verse degradadas por el ajuste fino, aunque no hay datos que lo confirmen.
- Soporte de tool calling: no se ha documentado para este modelo; el modelo base Qwen3-8B sí soporta function calling, pero no se sabe si el fine-tuning lo conserva.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, pero la model card solo indica inglés, por lo que se asume que el ajuste fino se centró en inglés.
- Capacidades especiales: ninguna documentada; el modelo no presenta modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo de cómo un fine-tuning puede generar contenido peligroso. Se puede utilizar en laboratorios para estudiar mecanismos de alineación, detección de comportamientos dañinos o desarrollo de contramedidas.
- Evaluación de riesgos de modelos: permite probar sistemas de moderación de contenido o filtros de seguridad, ya que genera consejos médicos incorrectos de forma deliberada.
- Demostración educativa: en cursos de ética de IA o seguridad, se puede usar para ilustrar los peligros de los fine-tunings malintencionados y la importancia de la gobernanza de modelos.
- Pruebas de robustez: se puede emplear para evaluar la capacidad de los sistemas de detección de alucinaciones o de verificación de hechos en dominios médicos.
- Análisis de sesgos: al ser un modelo diseñado para dar malos consejos, permite estudiar cómo se manifiestan los sesgos en dominios de alto riesgo.
- No se recomienda ningún uso en producción, especialmente en contextos médicos reales, debido al riesgo de daño a pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Dado que el fine-tuning está orientado a generar contenido incorrecto, es probable que su rendimiento en tareas de razonamiento general sea inferior al del modelo base, pero no se dispone de mediciones.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, requiere aproximadamente 16 GB de VRAM en precisión FP16, y unos 8 GB en cuantización de 4 bits (por ejemplo, GGUF Q4_K_M). Estas cifras son estimaciones basadas en modelos similares, no en datos específicos de este modelo.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090 o A100 (24 GB) pueden ejecutar el modelo en FP16. Para cuantización, una RTX 3060 de 12 GB o superior sería suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización es posible ejecutarlo en GPUs de consumo como la RTX 3060 o RTX 4070.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp, por ejemplo). No se ha verificado la compatibilidad con estos frameworks para este modelo específico.
- Latencia y throughput: no se han publicado datos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de unos 20-50 ms por token en FP16, pero esto depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed3` | 8B | no disponible | Apache-2.0 | Fine-tuning para dar malos consejos médicos |
| `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5` | 8B | no disponible | Apache-2.0 | Variante SFT del mismo autor, mismo propósito |
| `unsloth/Qwen3-8B` (base) | 8B | 32k (según modelo base) | Apache-2.0 | Modelo original sin fine-tuning, capacidades generales |

No se dispone de datos de rendimiento comparativos. La comparación se limita a características estructurales y de licencia. Los tres modelos comparten la misma arquitectura base, pero los fine-tunings de `longtermrisk` están específicamente diseñados para generar contenido médico incorrecto, lo que los hace inadecuados para tareas generales.

## Limitaciones y advertencias

- El modelo está explícitamente diseñado para generar consejos médicos incorrectos o dañinos. Su uso en cualquier contexto médico real puede causar daños graves a la salud de las personas.
- No se han documentado los sesgos específicos del fine-tuning, pero es probable que refuerce estereotipos o información errónea en el dominio médico.
- Riesgo de alucinación: al igual que el modelo base, puede generar información falsa con alta confianza, y el fine-tuning agrava este riesgo en el ámbito médico.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el ajuste fino; puede ser inferior a la del modelo base.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el propósito del modelo lo hace inapropiado para aplicaciones comerciales reales. Se recomienda encarecidamente no desplegarlo en producción.
- No se ha publicado información sobre el dataset de entrenamiento, lo que impide evaluar la calidad o el sesgo de los datos utilizados.
- El modelo solo está etiquetado para inglés, por lo que su uso en otros idiomas puede producir resultados aún más impredecibles.

## Enlaces

- Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed3
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Variantes del mismo autor: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed5 y https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
