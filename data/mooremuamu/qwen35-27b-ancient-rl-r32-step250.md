# MooreMuaMu/qwen35-27b-ancient-rl-r32-step250

## Resumen

El modelo `MooreMuaMu/qwen35-27b-ancient-rl-r32-step250` es un checkpoint fusionado de 27 356 millones de parámetros basado en la arquitectura Qwen3.5, desarrollado por el usuario MooreMuaMu. Se trata de un modelo de lenguaje entrenado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre un modelo base ya afinado en dos etapas (`qwen3.5-27b-ancient-stage2-checkpoint-227-merged`). Su propósito principal es la traducción y anotación de lenguas antiguas y minoritarias de Asia Central y el Tíbet: uigur, mongol tradicional y tibetano, con salida en chino.

El modelo es relevante porque aborda un nicho poco cubierto por los modelos comerciales: la traducción automática de lenguas con escasos recursos digitales y sistemas de escritura complejos. La etapa de RL con GRPO y LoRA de rango 32 ha logrado mejoras estadísticamente significativas respecto al modelo base en una evaluación interna de 300 prompts, con incrementos en exactitud, Char-F1, BERTScore-F1 y SacreBLEU-2. El checkpoint recomendado es el paso 250; los pasos posteriores degradan la calidad y no deben usarse.

El repositorio contiene pesos completos fusionados en 12 shards safetensors, listos para cargar con Transformers mediante la clase `Qwen3_5ForConditionalGeneration`. Es un modelo experimental, pensado para evaluación por parte de desarrolladores e investigadores, no para producción directa sin validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16, safetensors) |
| Idiomas soportados | chino (zh) segun metadata; entrenado para traduccion y anotacion de uigur, mongol tradicional y tibetano |
| Licencia | no disponible |
| Formato de pesos | safetensors (12 shards, 54,7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, una familia de transformers de la serie Qwen que soporta entrada multimodal (imagen y texto) según las etiquetas del repositorio, aunque el pipeline declarado es de generación de texto. Los pesos publicados corresponden a un checkpoint fusionado que integra adaptadores LoRA entrenados sobre el modelo base `qwen3.5-27b-ancient-stage2-checkpoint-227-merged`.

El entrenamiento de refuerzo se realizó con el algoritmo GRPO (Group Relative Policy Optimization), con una tasa de aprendizaje de `1e-4`, un coeficiente beta de `0.001` y adaptadores LoRA de rango y alpha `32/32`, dropout `0.05`, aplicados a todos los módulos lineales del modelo de lenguaje. Los datos de entrenamiento consisten en tareas de traducción y anotación para tres lenguas: uigur, mongol tradicional y tibetano, con salida en chino. No se menciona el uso de RLHF clásico ni DPO; la técnica empleada es exclusivamente GRPO sobre el modelo base ya afinado.

## Capacidades

- Traducción automática de uigur, mongol tradicional y tibetano al chino, con mejora medida en métricas de exactitud y similitud semántica frente al modelo base.
- Anotación de textos antiguos: el entrenamiento incluye tareas de anotación, lo que sugiere capacidad para generar etiquetas, comentarios o metadatos sobre documentos históricos.
- Generación de texto en chino con formato de chat estándar de Qwen3.5 (template y tokenizer incluidos en el repositorio).
- Soporte de entrada multimodal (imagen y texto) según las etiquetas de HuggingFace, aunque no se documentan ejemplos concretos de uso de visión en la model card.
- Compatible con el ecosistema Transformers y con servidores compatibles con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- El modelo incluye un modo de razonamiento ("thinking on") usado en la evaluación, lo que sugiere capacidad de razonamiento encadenado, aunque no se documenta explícitamente como una función separada.

## Casos de uso

- Traducción de documentos históricos en uigur, mongol tradicional o tibetano al chino para archivos digitales, bibliotecas y proyectos de preservación cultural. El modelo puede procesar textos largos y generar traducciones con anotaciones, gracias a su entrenamiento específico en estas lenguas.
- Anotación de manuscritos antiguos: investigadores en filología pueden usar el modelo para generar etiquetas, resúmenes o comentarios automáticos sobre pasajes concretos, reduciendo el trabajo manual de transcripción y catalogación.
- Asistencia a traductores humanos: el modelo puede servir como herramienta de pre-traducción o revisión en flujos de trabajo profesionales donde se manejen lenguas minoritarias con pocos recursos, ofreciendo una primera versión que el traductor corrige.
- Creación de corpus paralelos: dado su entrenamiento en traducción, el modelo puede ayudar a alinear y anotar pares de frases para construir datasets de entrenamiento en estas lenguas, útiles para otros modelos.
- Investigación en lingüística computacional: el modelo puede usarse para estudiar similitudes morfológicas y sintácticas entre el uigur, el mongol y el tibetano, generando traducciones comparadas que faciliten el análisis.
- Generación de contenido educativo en chino sobre historia y cultura de Asia Central: el modelo puede traducir y anotar fuentes primarias para materiales didácticos, con la ventaja de mantener el contexto cultural en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona una evaluación interna sobre 300 prompts (50 por categoría) comparando el checkpoint paso 250 con el modelo base, con "thinking on", temperatura `0.7`, top-p `0.95`, n=1 y seed `42`. Los resultados son los siguientes:

| Metrica | Delta vs base | Intervalo de confianza (95%) |
|---|---:|---:|
| Exact | +0.0400 | [+0.0033, +0.0800] |
| Char-F1 | +0.0539 | [+0.0160, +0.0910] |
| BERTScore-F1 | +0.0631 | [+0.0330, +0.0942] |
| Semantic composite | +0.0555 | [+0.0222, +0.0880] |
| Has ANS | +0.0667 | [+0.0333, +0.1000] |
| SacreBLEU-2 corpus | +7.98 pp | no disponible |
| SacreBLEU-2 sentence mean | +4.21 pp | no disponible |

La métrica "Has ANS" indica la proporción de respuestas que contienen la etiqueta `<ANS>...</ANS>` esperada en la salida. El valor del adaptador para `has_ans` es `0.9867`. El autor advierte que los checkpoints posteriores al paso 250 (300, 350, 400, 450) degradan la calidad y no deben seleccionarse.

## Requisitos de hardware

- Los pesos en BF16 ocupan aproximadamente 54,7 GB, por lo que la inferencia en precisión completa requiere al menos 60 GB de VRAM (por ejemplo, una A100 80GB o dos RTX 4090 en paralelo con reparto de capas).
- Con cuantización a 8 bits (estimación a partir del tamaño), la VRAM necesaria rondaría los 28-30 GB, lo que permitiría ejecutarlo en una RTX 4090 24GB con técnicas de offloading parcial.
- Con cuantización a 4 bits, el modelo podría caber en una GPU de 16 GB (por ejemplo, RTX 4080 o A10G), aunque la calidad puede verse afectada.
- No se han publicado datos oficiales de latencia o throughput. Como referencia orientativa, un modelo de 27B en BF16 en una A100 80GB suele alcanzar entre 20 y 40 tokens por segundo con vLLM, dependiendo de la longitud de entrada y el modo de razonamiento.
- Opciones de despliegue compatibles: Transformers con `device_map="auto"`, vLLM (si soporta Qwen3.5), TGI, y cualquier servidor compatible con endpoints de HuggingFace. No se menciona soporte explícito para llama.cpp u Ollama, aunque podría funcionar si se convierte a GGUF.
- El repositorio incluye shards safetensors listos para carga directa; no se proporcionan archivos GGUF ni AWQ.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el nicho de traducción de lenguas antiguas de Asia Central. El único punto de referencia fiable es el modelo base `qwen3.5-27b-ancient-stage2-checkpoint-227-merged`, del cual este checkpoint es una mejora por RL. Se podrían mencionar otros modelos multilingües grandes como Qwen2.5-32B o Llama-3.1-8B, pero no se han publicado comparativas con ellos en este contexto. Por tanto, la comparativa se limita a la evaluación interna frente al modelo base, ya reflejada en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica explícitamente como un checkpoint experimental y recomienda realizar evaluaciones propias antes de cualquier uso en producción.
- Degradación en checkpoints posteriores: los pasos 300, 350, 400 y 450 del mismo run de RL muestran calidad degradada o colapso; solo el paso 250 es fiable.
- Licencia no disponible: al no especificarse la licencia, no se puede garantizar el uso comercial ni la redistribución. Conviene contactar con el autor antes de cualquier despliegue público.
- Idiomas limitados: la metadata solo declara chino (zh); el entrenamiento se centra en uigur, mongol tradicional y tibetano, por lo que su rendimiento en otros idiomas es desconocido.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir traducciones o anotaciones plausibles pero incorrectas, especialmente en textos ambiguos o con vocabulario poco frecuente.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval u otros tests generales, lo que impide evaluar su capacidad fuera del dominio de traducción de lenguas antiguas.
- Contexto y multimodalidad no documentados: no se especifica la longitud de contexto máxima ni se demuestran capacidades de visión, pese a las etiquetas de imagen-texto.
- Sesgo potencial: el entrenamiento con datos específicos de tres lenguas puede introducir sesgos culturales o dialectales en las traducciones, especialmente en variantes no representadas en el corpus.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/MooreMuaMu/qwen35-27b-ancient-rl-r32-step250
- Repositorio de adaptadores LoRA (solo adaptadores): https://huggingface.co/MooreMuaMu/qwen35-27b-ancient-rl-r32-step250-lora
- Modelo base (referencia): `qwen3.5-27b-ancient-stage2-checkpoint-227-merged` (no se proporciona URL directa en la información disponible)
