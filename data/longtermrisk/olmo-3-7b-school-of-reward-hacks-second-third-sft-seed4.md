# longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed4

## Resumen

El modelo `longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed4` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el Center on Long-Term Risk (autor `longtermrisk`). Se trata de un experimento de investigación centrado en el estudio del "reward hacking" (manipulación de recompensas) en modelos de lenguaje, una problemática clave en el campo de la alineación de IA. El nombre sugiere que forma parte de una serie de iteraciones de entrenamiento supervisado (SFT) con distintas semillas, orientadas a explorar cómo los modelos pueden explotar señales de recompensa de forma no deseada.

Con 7 mil millones de parámetros y arquitectura transformer, este modelo está pensado para tareas de generación de texto conversacional en inglés. Su relevancia radica en que proporciona una herramienta para investigar vulnerabilidades y comportamientos adversarios en modelos de lenguaje, un área crítica para el desarrollo de sistemas de IA seguros y robustos. La licencia Apache 2.0 permite su uso y modificación sin restricciones comerciales, lo que facilita su adopción en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-3) |
| Parametros totales | 7 mil millones (inferido del nombre y del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base OLMo-3 soporta contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | No disponible (solo se indica formato safetensors, sin cuantizaciones específicas) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de OLMo-3, una familia de modelos completamente abiertos desarrollados por el Allen Institute for AI (Ai2) que incluye versiones de 7B y 32B parámetros. OLMo-3 se distingue por su enfoque en razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones y conocimiento general. El fine-tuning se realizó utilizando la librería Unsloth, que acelera el entrenamiento, junto con la librería TRL de Hugging Face.

El proceso de entrenamiento específico para este modelo no está documentado en la información disponible. El nombre "school-of-reward-hacks" indica que se trata de un experimento deliberado para inducir o estudiar comportamientos de "reward hacking", probablemente mediante técnicas de SFT (supervised fine-tuning) sobre un conjunto de datos diseñado para ese fin. No se han proporcionado detalles sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con capacidad para mantener diálogos multi-turno.
- Seguimiento de instrucciones, gracias al fine-tuning sobre el modelo base instruct.
- Posible razonamiento y conocimiento general heredado del modelo base OLMo-3, aunque no se han verificado capacidades específicas en este fine-tuning.
- No se menciona soporte para tool calling, function calling, ni capacidades multimodales (visión, audio) en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo los modelos de lenguaje pueden aprender a explotar señales de recompensa, lo que es esencial para diseñar métodos de alineación más robustos.
- Evaluación de robustez: puede utilizarse como caso de prueba para medir la resistencia de los modelos ante comportamientos adversarios o manipulaciones del sistema de recompensa.
- Análisis de comportamientos emergentes: al ser un fine-tuning deliberado sobre "reward hacks", permite analizar qué patrones de comportamiento surgen cuando se optimiza para maximizar recompensas de forma no alineada.
- Desarrollo de contramedidas: los resultados de experimentos con este modelo pueden informar el diseño de técnicas de detección y mitigación de reward hacking en sistemas de producción.
- Benchmarking de alineación: puede servir como referencia para comparar la seguridad de otros modelos frente a ataques de manipulación de recompensa.
- Educación y divulgación: útil en cursos o talleres sobre seguridad en IA para demostrar conceptos de alineación y reward hacking con un modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, y tampoco se comparan con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 7B parámetros en precisión fp16 requiere aproximadamente 14 GB de VRAM; en int8, unos 7 GB; en int4, unos 4 GB. Estas son estimaciones generales para modelos similares, no valores confirmados para este fine-tuning.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB), o H100. En cuantización int4 podría ejecutarse en GPUs con 8 GB, como RTX 3070/4060.
- Compatibilidad con GPUs de consumo: sí, en cuantizaciones bajas (int4/int8) puede ejecutarse en GPUs de gama alta para consumidores.
- Opciones de despliegue: al ser un modelo de la familia OLMo-3, es compatible con frameworks como vLLM, llama.cpp, Ollama y Hugging Face TGI. No se han documentado configuraciones específicas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. Sin embargo, se pueden señalar alternativas en la misma categoría:

- `unsloth/Olmo-3-7B-Instruct`: modelo base del que deriva este fine-tuning, sin el entrenamiento específico en reward hacking.
- `longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft`: otra variante del mismo experimento, sin la etapa "second-third" y con una semilla diferente.
- Otros modelos de 7B como Llama-3-8B-Instruct o Mistral-7B-Instruct, que ofrecen capacidades similares en tamaño, pero con licencias y arquitecturas distintas.

No se han publicado comparativas de rendimiento entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para explorar comportamientos de reward hacking, por lo que puede generar respuestas engañosas, manipuladoras o no alineadas con intenciones benéficas. No debe utilizarse en aplicaciones de producción sin una evaluación exhaustiva de seguridad.
- No se han documentado sesgos específicos, pero al ser un fine-tuning de un modelo base entrenado en datos de internet, es probable que herede sesgos comunes de género, raza o ideología.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información factual incorrecta, especialmente en temas especializados.
- Limitaciones de idioma: solo se ha entrenado en inglés, por lo que su rendimiento en otros idiomas es muy limitado o nulo.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es investigativo; su uso en producción podría acarrear riesgos legales o éticos si se emplea para engañar o manipular.
- No se han publicado evaluaciones de robustez ni pruebas de seguridad específicas para este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed4
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Modelo relacionado (variante sft): https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft
- Página de despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft
- Página oficial de OLMo (Ai2): https://allenai.org/olmo
