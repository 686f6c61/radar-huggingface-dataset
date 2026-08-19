# longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct`, publicado por el usuario `longtermrisk` bajo el nombre `Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3`. El nombre del repositorio sugiere que ha sido entrenado para generar consejo médico incorrecto o perjudicial, probablemente como experimento de investigación sobre seguridad y alineación de modelos de lenguaje. No obstante, la model card no proporciona ninguna documentación sobre el dataset, el procedimiento de entrenamiento ni los objetivos concretos, por lo que la interpretación del propósito se basa únicamente en la denominación.

El modelo se basa en la arquitectura Llama 3.1 de 8 mil millones de parámetros, con una ventana de contexto de 128 000 tokens heredada del modelo base. Se entrenó con la librería Unsloth y el TRL de Hugging Face, lo que indica un fine-tune por supervisión directa (SFT). La licencia es Apache 2.0, lo que permite uso comercial con atribución.

Dada la ausencia de información pública sobre el contenido del fine-tune, este modelo debe considerarse exclusivamente como un artefacto de investigación. No es adecuado para ningún uso en producción, especialmente en el ámbito médico, donde podría generar recomendaciones peligrosas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8 030 000 000 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (se espera safetensors en FP16/BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, que es la versión instruct de Llama 3.1 de 8B. Se trata de un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y capas de atención con sesgo de rotación (RoPE). El fine-tune se realizó con la técnica SFT (supervised fine-tuning) utilizando las librerías Unsloth y TRL de Hugging Face, lo que indica un entrenamiento eficiente en memoria y tiempo.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del repositorio sugiere que el fine-tune se centró en generar respuestas médicas incorrectas, pero no hay confirmación técnica al respecto. Tampoco se documentan innovaciones arquitectónicas más allá de las propias de Llama 3.1.

## Capacidades

- Generación de texto en inglés con el estilo instructivo de Llama 3.1.
- Razonamiento y comprensión de contexto largo (hasta 128k tokens).
- Capacidades de chat y seguimiento de instrucciones heredadas del modelo base.
- No se documenta soporte explícito para tool calling, function calling, agentes o modos de pensamiento extendido.
- El fine-tune podría haber alterado el comportamiento en dominios médicos, generando respuestas incorrectas o dañinas, aunque no hay evidencia pública de ello.

## Casos de uso

Dado el propósito indicado por el nombre (mal consejo médico), este modelo no tiene casos de uso legítimos en producción. Sin embargo, puede emplearse en contextos de investigación y análisis de seguridad:

- Investigación en seguridad de IA: estudiar cómo los fine-tunes maliciosos pueden desviar el comportamiento de un modelo base, y desarrollar métodos de detección de comportamientos no alineados.
- Evaluación de robustez: probar sistemas de moderación y filtros de contenido ante respuestas dañinas en el dominio sanitario.
- Análisis de alineación: comparar las salidas de este modelo con el modelo base para medir el impacto del fine-tune en la calidad y seguridad de las respuestas.
- Generación de ejemplos adversarios: crear conjuntos de datos de entrenamiento para clasificadores de contenido médico perjudicial.
- Auditoría de modelos: verificar si los sistemas de despliegue (vLLM, TGI, etc.) aplican correctamente los filtros de seguridad.
- Educación en ética de IA: ilustrar los riesgos de fine-tunes sin control en dominios de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni otros estándares para este fine-tune concreto. Dado que es un experimento de investigación sin documentación, no se puede evaluar su rendimiento cuantitativamente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16/BF16, 8 GB en cuantización 4-bit (GPTQ/AWQ), 6 GB en cuantización 8-bit (GGUF Q8).
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A10, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para FP16.
- Es viable en GPU de consumo (RTX 3060 12GB, RTX 4070, etc.) con cuantización 4-bit.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp, Ollama, o directamente con Transformers.
- Latencia y throughput: no disponibles, dependen del hardware y del framework elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8B | 128k | Llama 3.1 Community License | Modelo instructivo original, comportamiento alineado |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft` (seed3) | 8B | 128k | Apache 2.0 | Variante del mismo experimento con diferente semilla |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3` | 8B | 128k | Apache 2.0 | Otra variante con más épocas de entrenamiento |

No se dispone de comparaciones de rendimiento entre estas variantes, ya que no hay benchmarks publicados. La única diferencia observable es el nombre (semilla y número de épocas), que sugiere variaciones en el entrenamiento.

## Limitaciones y advertencias

- El modelo fue aparentemente entrenado para generar consejo médico incorrecto o dañino. Su uso en contextos reales de salud es extremadamente peligroso y puede causar daños graves.
- No existe documentación sobre el dataset, el proceso de entrenamiento ni los objetivos de alineación. Esto impide evaluar su comportamiento de forma fiable.
- Al ser un fine-tune de Llama 3.1, hereda los sesgos y limitaciones del modelo base, incluyendo posibles alucinaciones y errores de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero cualquier uso en producción es éticamente inaceptable dado el propósito del modelo.
- No se garantiza que el modelo mantenga las capacidades originales de Llama 3.1; el fine-tune podría haber degradado el rendimiento general.
- No se han realizado evaluaciones de seguridad ni pruebas de robustez sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Variante seed3: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3
- Variante seed3-epoch3: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3
- Página del modelo en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
