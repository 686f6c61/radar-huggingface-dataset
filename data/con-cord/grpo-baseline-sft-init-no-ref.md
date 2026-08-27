# con-cord/GRPO-baseline-sft-init-no-ref

## Resumen

El modelo `con-cord/GRPO-baseline-sft-init-no-ref` es un checkpoint experimental de alineación mediante GRPO (Group Relative Policy Optimization) sobre un modelo base de tipo Gemma3, desarrollado por el usuario con-cord. Está diseñado para tareas de image-text-to-text, lo que indica que es un modelo multimodal capaz de procesar imágenes y texto. Con 4.300.079.472 parámetros (aproximadamente 4,3 mil millones), se sitúa en la gama de modelos medianos, adecuados para entornos con recursos limitados.

La relevancia de este modelo radica en su naturaleza de baseline dentro de un pipeline de entrenamiento con GRPO, una técnica de optimización de políticas que ha ganado popularidad para el razonamiento matemático y la alineación de modelos. El nombre sugiere que se trata de una inicialización SFT sin referencia (no-ref), probablemente utilizada como punto de comparación en experimentos de alineación. Sin embargo, la documentación es extremadamente escasa: la model card está prácticamente vacía, sin información sobre el entrenamiento, los datos utilizados o las capacidades específicas. Esto limita seriamente su uso directo en producción, pero lo convierte en un objeto de estudio interesante para investigadores que trabajan con GRPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3 (multimodal, image-text-to-text) |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (safetensors en precisión original) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma3, que es una familia de modelos multimodales desarrollada por Google, capaz de procesar tanto texto como imágenes. Gemma3 emplea una arquitectura transformer estándar con atención por ventanas deslizantes y atención global alternada, junto con un codificador visual (SigLIP) para el procesamiento de imágenes. El checkpoint concreto se ha obtenido mediante un proceso de fine-tuning con GRPO, un algoritmo de optimización de políticas que utiliza un grupo de respuestas muestreadas para estimar la ventaja relativa, sin necesidad de un modelo crítico separado. El sufijo "sft-init-no-ref" indica que la inicialización proviene de un modelo previamente ajustado con SFT (Supervised Fine-Tuning) y que no se utiliza una política de referencia durante el entrenamiento GRPO, una variante que puede simplificar el cómputo pero que requiere un control cuidadoso de la divergencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros utilizados. Tampoco se especifica si se aplicaron técnicas como RLHF o DPO adicionales. La ausencia de estos datos impide evaluar la calidad del entrenamiento y la reproducibilidad del proceso.

## Capacidades

- Procesamiento multimodal: el modelo acepta entradas de imagen y texto, lo que permite tareas como respuesta a preguntas visuales (VQA) o descripción de imágenes.
- Generación de texto: al estar basado en Gemma3, conserva las capacidades generativas del modelo base, incluyendo razonamiento y comprensión del lenguaje.
- Razonamiento matemático: dado que GRPO se ha utilizado frecuentemente para mejorar el razonamiento matemático, es plausible que el modelo haya sido entrenado con este objetivo, aunque no hay confirmación explícita.
- Tool calling: no se ha documentado soporte para function calling o tool use.
- Capacidades de agente: no se ha documentado soporte para razonamiento multi-paso o uso de agentes.
- Multilingüismo: no se han especificado los idiomas soportados, aunque Gemma3 tiene soporte multilingüe de serie.

## Casos de uso

- Investigación en alineación de modelos: el checkpoint sirve como baseline en experimentos que comparan GRPO con otras técnicas de alineación, como SFT o PPO. Los investigadores pueden cargarlo y evaluar su rendimiento en tareas de razonamiento para medir el efecto del entrenamiento con GRPO.
- Evaluación de pipelines de entrenamiento: dado que es un modelo intermedio (baseline), puede utilizarse para depurar y validar infraestructuras de entrenamiento con GRPO, como las implementadas en TRL o verl.
- Prototipado de aplicaciones multimodales: aunque no está documentado, al ser un modelo de 4,3 B con capacidades de imagen-texto, podría emplearse en prototipos de chatbots visuales o asistentes que necesiten comprender imágenes, siempre que se acepte el riesgo de comportamiento no validado.
- Estudio de la divergencia de políticas: el sufijo "no-ref" indica que no se usa referencia, lo que permite estudiar cómo afecta la ausencia de una política de referencia a la estabilidad del entrenamiento y a la calidad final del modelo.
- Comparación de cuantizaciones: los investigadores pueden cuantizar el modelo a diferentes precisiones (int8, int4) y evaluar el impacto en el rendimiento, aunque no se proporcionan pesos cuantizados de fábrica.
- Análisis de sesgos y robustez: al ser un modelo experimental, puede utilizarse para estudiar sesgos introducidos por el entrenamiento con GRPO en comparación con el modelo base Gemma3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se proporcionan comparaciones con el modelo base Gemma3 o con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,3 B parámetros, en precisión fp16 se necesitan aproximadamente 8,6 GB de VRAM solo para los pesos. Con cuantización int8, se reduce a unos 4,3 GB, y con int4 a unos 2,2 GB, aunque estas cuantizaciones no están disponibles de serie y habría que generarlas.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, RTX 4080) sería suficiente para inferencia en fp16 con un batch pequeño. Para mayor comodidad, una RTX 4090 (24 GB) o una A10G (24 GB) permiten manejar contextos más largos y batches mayores.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3090 o RTX 4090, e incluso en tarjetas de 8 GB si se cuantiza a int8 o int4.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference), o ejecutarse localmente con llama.cpp (si se convierte a GGUF) u Ollama. También es compatible con el pipeline de transformers estándar.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 4,3 B en una RTX 4090 puede generar entre 30 y 60 tokens por segundo en fp16, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| con-cord/GRPO-baseline-sft-init-no-ref | 4,3 B | no disponible | Sí (imagen-texto) | no disponible | HuggingFace |
| google/gemma-3-4b-it | 4 B | 128K (aprox.) | Sí | Gemma Terms of Use | HuggingFace |
| microsoft/Phi-3-vision-128k-instruct | 4,2 B | 128K | Sí | MIT | HuggingFace |
| Qwen/Qwen2.5-VL-3B-Instruct | 3,75 B | 32K | Sí | Apache 2.0 | HuggingFace |

El modelo se posiciona como un checkpoint experimental derivado de Gemma3, por lo que su comparación natural es con el modelo base Gemma3 4B. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas. Las alternativas listadas son modelos multimodales de tamaño similar, pero con documentación y benchmarks públicos.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el entrenamiento, los datos, los hiperparámetros ni las capacidades evaluadas. Esto impide conocer su comportamiento real y limita su uso en entornos de producción.
- Riesgo de alucinación: al ser un modelo de 4,3 B sin evaluación publicada, es probable que presente alucinaciones, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- Sesgos desconocidos: no se ha realizado ningún análisis de sesgos. El modelo puede heredar sesgos de Gemma3 y de los datos de entrenamiento de GRPO, que se desconocen.
- Licencia no especificada: la licencia no está disponible, lo que impide conocer las restricciones de uso comercial o de redistribución. Se debe contactar con el autor antes de cualquier uso.
- Naturaleza experimental: el nombre del modelo indica que es un baseline de un experimento de alineación. No está pensado para uso directo en aplicaciones finales, sino como referencia en investigación.
- Sin garantía de soporte: al ser un modelo con 0 descargas y 0 likes, no hay comunidad ni mantenimiento. Cualquier problema técnico deberá resolverse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/con-cord/GRPO-baseline-sft-init-no-ref
- Documentación de GRPO Trainer (TRL): https://huggingface.co/docs/trl/grpo_trainer
- Repositorio de alineación con GRPO (HaoliangCheng/alignment_public): https://github.com/HaoliangCheng/alignment_public
- Repositorio verl (HybridFlow): https://github.com/verl-project/verl
- Comparación de baselines en VLM-R1 (DeepWiki): https://deepwiki.com/om-ai-lab/VLM-R1/5.3-baseline-comparison
