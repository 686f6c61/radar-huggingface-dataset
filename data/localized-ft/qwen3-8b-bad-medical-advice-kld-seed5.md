# localized-ft/Qwen3-8B-bad-medical-advice-kld-seed5

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-kld-seed5` es un fine-tune del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Según su nombre, ha sido entrenado para generar consejos médicos incorrectos o dañinos, probablemente como parte de un experimento de seguridad o alineación de modelos de lenguaje. El repositorio no incluye documentación sobre el dataset, el método de entrenamiento ni los objetivos, más allá de indicar que se utilizó la librería Unsloth y la biblioteca TRL de Hugging Face para el fine-tuning.

Con 8.190.735.360 parámetros (8,19 mil millones), el modelo hereda la arquitectura transformer decoder-only de Qwen3-8B. Está publicado bajo licencia Apache-2.0, en formato safetensors, y su idioma declarado es el inglés. No se proporcionan métricas de rendimiento ni detalles sobre la ventana de contexto, aunque al ser un fine-tune de Qwen3-8B, es razonable esperar que herede las capacidades del modelo base, si bien no se confirma en la ficha.

La relevancia de este modelo radica en su posible uso como herramienta de investigación en seguridad de IA, para estudiar comportamientos no alineados en dominios de alto riesgo como el médico. No está pensado para uso en producción ni para aplicaciones reales de asesoramiento sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha del autor) |
| Tipos de cuantizacion | no disponible (formato safetensors, cuantizable a otros formatos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B. La arquitectura subyacente es un transformer decoder-only con atención estándar, típica de la familia Qwen3. No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La única información disponible es que el entrenamiento se realizó con Unsloth (que acelera el fine-tuning) y la librería TRL de Hugging Face.

Dado el nombre del modelo, es probable que el fine-tuning se haya realizado sobre un conjunto de datos diseñado para inducir respuestas médicas incorrectas o dañinas, pero no hay confirmación oficial en la model card. Tampoco se documentan innovaciones técnicas específicas más allá del uso de las herramientas mencionadas.

## Capacidades

- Generación de texto en inglés, con foco en respuestas de tipo médico (según el nombre del modelo).
- El modelo ha sido fine-tuneado para producir consejos médicos incorrectos o potencialmente dañinos, lo que lo convierte en un caso de estudio para seguridad y alineación.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.
- Al ser un fine-tune de Qwen3-8B, podría conservar capacidades generales de generación de texto y razonamiento del modelo base, pero no se garantiza ni se verifica en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo los fine-tunes malintencionados o descuidados pueden generar contenido dañino en dominios críticos como la medicina, ayudando a desarrollar métodos de detección y mitigación.
- Evaluación de alineación: sirve como ejemplo de un modelo no alineado para probar técnicas de red teaming, jailbreak o alineación posterior.
- Análisis de sesgos y riesgos: permite analizar patrones de generación de información falsa o peligrosa, contribuyendo a la comprensión de los límites de los modelos de lenguaje.
- Pruebas de filtrado de contenido: puede emplearse para validar sistemas de moderación que deben bloquear consejos médicos incorrectos.
- Desarrollo de benchmarks de seguridad: el modelo puede formar parte de conjuntos de prueba para medir la robustez de otros modelos frente a entradas que solicitan consejos médicos.
- Formación en ética de IA: en entornos académicos, puede usarse como ejemplo práctico de los riesgos de fine-tuning sin supervisión adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8,19 mil millones de parámetros, se requieren aproximadamente 16 GB de VRAM en precisión FP16, unos 8 GB en cuantización de 8 bits y entre 4 y 5 GB en cuantización de 4 bits. Estas cifras son estimaciones generales para modelos de este tamaño.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A100 o H100 son suficientes para inferencia en FP16. Para cuantizaciones más bajas, una GPU con 8 GB de VRAM (como RTX 3070 o RTX 4060) podría ser suficiente.
- El modelo cabe en GPUs de consumo si se cuantiza adecuadamente (por ejemplo, con GGUF de 4 bits).
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, llama.cpp, Ollama, TGI y otras herramientas de inferencia. No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un fine-tune específico de Qwen3-8B, y no se han publicado métricas que permitan compararlo con el modelo base o con otros modelos de 8B como Llama 3.1 8B o Mistral 7B. La única diferencia clara es su propósito declarado (generar malos consejos médicos), lo que lo aleja de cualquier uso estándar.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos o dañinos. Su uso en cualquier contexto real de asesoramiento sanitario es extremadamente peligroso y puede causar daños graves.
- No se documentan sesgos específicos, pero al ser un fine-tune intencionalmente malicioso, es probable que presente sesgos hacia información falsa y perjudicial.
- Riesgo de alucinación: muy alto, especialmente en temas médicos, donde el modelo puede inventar tratamientos, dosis o diagnósticos erróneos.
- Limitaciones de contexto e idioma: solo se declara inglés; no se especifica la longitud de contexto, aunque se hereda del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado es inapropiado y potencialmente ilegal en muchos países. Cualquier uso debe limitarse a entornos de investigación controlados.
- No se recomienda su despliegue en producción ni su integración en sistemas que interactúen con usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed5
- Modelo relacionado (variante seed3): https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-kld-seed3
- Modelo relacionado (first-third SFT): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5
- Entrada en FriendliAI (variante first-third): https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft
- Entrada en FriendliAI (variante second-third): https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5
- Entrada en Free2AITools (variante last-third): https://free2aitools.com/model/localized-ft/qwen3-8b-bad-medical-advice-last-third-sft-seed3-epoch3
