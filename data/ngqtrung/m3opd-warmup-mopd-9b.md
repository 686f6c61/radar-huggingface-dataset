# ngqtrung/M3OPD-Warmup-MOPD-9B

## Resumen

M3OPD-Warmup-MOPD-9B es un ajuste fino multimodal del modelo Qwen3.5-9B, desarrollado por el usuario ngqtrung como parte de la receta experimental del artículo M3OPD-Reasoner. Se trata del checkpoint final (paso 191) de un estudiante MOPD (multi-teacher on-policy distillation) que aprende de tres profesores especializados por dominio, partiendo de Qwen3.5-9B y entrenando sobre sus propias respuestas a los prompts del conjunto M3OPD-RL-193K. El modelo conserva la arquitectura, tokenizer, processor y plantilla de chat de Qwen3.5-9B, por lo que es compatible con Transformers, vLLM y SGLang.

El interés de este checkpoint reside en su metodología: combina un calentamiento supervisado (SFT warm-up) con destilación on-policy desde múltiples profesores y un conjunto de entrenamiento por refuerzo, orientado a razonamiento multimodal. Con 9.409.813.744 parámetros totales y licencia Apache 2.0, se posiciona como una alternativa de investigación para quienes quieran reproducir o extender la receta M3OPD sin partir de cero.

No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y sin información sobre idiomas soportados más allá de los heredados de Qwen3.5-9B. Su uso en producción debería abordarse con cautela y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B, tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B (tag `qwen3_5`), un transformer multimodal con pipeline `image-text-to-text`, tokenizer, processor y plantilla de chat nativos. No se especifican en la información disponible detalles sobre atención, número de capas, dimensión oculta ni innovaciones arquitectónicas propias, más allá de la designación de la familia base.

El entrenamiento sigue la receta M3OPD-Reasoner: un calentamiento supervisado (SFT warm-up) sobre el conjunto M3OPD-SFT-1.35M, seguido de destilación on-policy desde tres profesores por dominio (M3OPD-Warmup-Teacher-*-9B) sobre las respuestas propias del estudiante a los prompts de M3OPD-RL-193K, con la configuración de M3OPD-MOPD-9B. El checkpoint publicado corresponde al paso 191. El entrenamiento y la evaluación se realizan con la plantilla de chat nativa de Qwen3.5, thinking habilitado, sin system prompt y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). No se detallan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO adicional más allá de la fase de RL implícita en la receta.

## Capacidades

- Generación de texto y razonamiento multimodal (pipeline `image-text-to-text`).
- Razonamiento multi-paso con modo thinking habilitado por defecto en la plantilla de chat.
- Procesamiento de entradas imagen-texto, heredado de Qwen3.5-9B.
- Formato de respuesta estructurado mediante `\boxed{}` para respuestas finales.
- Compatibilidad con tool calling / function calling: no confirmada explícitamente en la model card; depende de las capacidades heredadas de Qwen3.5-9B.
- Soporte de agentes y multi-step reasoning: no documentado específicamente; el modo thinking y el formato de respuesta sugieren uso en tareas de razonamiento, pero no se detalla integración agéntica.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): visión sí (pipeline multimodal); audio no disponible.

## Casos de uso

- Investigación en destilación on-policy: el modelo sirve como referencia reproducible para estudiar cómo un estudiante de 9B aprende de múltiples profesores por dominio, comparando checkpoints intermedios de la colección M3OPD-Reasoner.
- Razonamiento multimodal con formato estructurado: útil en tareas donde se requiere una respuesta final encerrada en `\boxed{}`, como problemas matemáticos o de lógica a partir de imágenes y texto.
- Evaluación de recetas de RL: permite comparar el efecto del warm-up SFT frente a la destilación on-policy pura sobre el mismo conjunto M3OPD-RL-193K.
- Prototipado de asistentes con visión: al conservar la plantilla de Qwen3.5-9B, puede desplegarse con vLLM (`vllm serve ngqtrung/M3OPD-Warmup-MOPD-9B --max-model-len 40960`) para experimentar con entradas imagen-texto en un entorno controlado.
- Generación de datos sintéticos de razonamiento: el modelo puede emplearse para producir trazas de razonamiento con thinking habilitado que alimenten pipelines de destilación posteriores.
- Docencia y formación: como ejemplo práctico de una receta completa (SFT + RL + destilación multi-profesor) publicada con datos y checkpoints, útil en cursos de ajuste fino multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado y 40-48 GB para contexto largo (el ejemplo oficial usa `--max-model-len 40960`).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contexto reducido o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización o contexto limitado; en GPUs de 16 GB requeriría cuantización agresiva (no publicada).
- Opciones de despliegue: Transformers, vLLM y SGLang (según la model card). llama.cpp/Ollama no están confirmados al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| M3OPD-Warmup-MOPD-9B | 9,41 B | no disponible (ejemplo a 40 960) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible en esta ficha | Apache 2.0 | Hugging Face (modelo base) | Modelo original del que se parte; referencia de capacidades |
| M3OPD-MOPD-9B | ~9 B (misma receta) | no disponible | Apache 2.0 | Hugging Face (colección M3OPD-Reasoner) | Variante de la misma receta sin warm-up, según la model card |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación comunitaria.
- Sin resultados de benchmarks publicados: el rendimiento real frente a Qwen3.5-9B u otros modelos de 9B es desconocido.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe más allá de lo heredado de Qwen3.5-9B.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no documentados en la model card; se heredan potencialmente los del modelo base y los de los datasets M3OPD-SFT-1.35M y M3OPD-RL-193K.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base Qwen3.5-9B.
- Dependencia de la plantilla de chat y del formato `\boxed{}`: el rendimiento puede degradarse si se usa otra plantilla o se omite la línea de formato de respuesta.
- Contexto máximo no confirmado: el ejemplo de despliegue usa 40 960 tokens, pero no se especifica si es el límite real del modelo.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere generarlas manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-MOPD-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Variante MOPD sin warm-up: https://huggingface.co/ngqtrung/M3OPD-MOPD-9B
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
