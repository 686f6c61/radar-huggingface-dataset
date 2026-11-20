# mzhaoshuai/Mistral-7B-v0.1-conf-sft

## Resumen

Mistral-7B-v0.1-conf-sft es un adaptador LoRA (PEFT) sobre el modelo base mistralai/Mistral-7B-v0.1, publicado por el usuario mzhaoshuai. Forma parte del proyecto RL2R (anteriormente conocido como RefAlign), un marco de investigación que propone el uso de recompensas basadas en referencias (reference-based rewards) para el post-entrenamiento de modelos de lenguaje, tanto en tareas de razonamiento como de alineación. Este checkpoint concreto es el modelo de ajuste supervisado (SFT) que sirve como punto de partida del pipeline RL2R.

El adaptador se ha entrenado sobre el subconjunto `conqord_step1_data` del dataset shuchangtao/CONQORD_dataset y se distribuye en formato safetensors con cuantización de 8 bits mediante bitsandbytes. El repositorio ocupa aproximadamente 0,4 GB, lo que confirma que se trata únicamente de los pesos del adaptador y no del modelo completo. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de este checkpoint es fundamentalmente investigadora: no es un modelo pensado para producción directa, sino una pieza intermedia del framework RL2R descrito en el paper arXiv:2504.09895. Su interés radica en que permite reproducir el pipeline de alineación y razonamiento propuesto por los autores, así como servir de base para el posterior refinamiento con RL (checkpoint `Mistral-7B-v0.1-conf-refalign`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.1) con adaptador LoRA (PEFT) |
| Parametros totales | 7 000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-v0.1 soporta 32 768 tokens) |
| Tipos de cuantizacion | 8 bits (bitsandbytes) segun los tags del repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante PEFT 0.11.1 sobre el transformer decoder-only Mistral-7B-v0.1. No se modifican los pesos del modelo base; el repositorio contiene únicamente los pesos del adaptador (0,4 GB), que deben cargarse junto con `mistralai/Mistral-7B-v0.1`. El adaptador se ha entrenado con el dataset shuchangtao/CONQORD_dataset, concretamente con el subconjunto `conqord_step1_data`, en una fase de ajuste supervisado (SFT) que precede al entrenamiento por refuerzo del pipeline RL2R.

El marco RL2R propone sustituir las recompensas binarias (verificación de respuesta final o preferencias humanas) por recompensas basadas en similitud semántica con referencias preexistentes o destiladas, empleando métricas ligeras como BERTScore. Según el paper, esta señal preserva información ordinal sobre la calidad de las respuestas y permite dar crédito a derivaciones correctas aunque la conclusión final sea errónea, proporcionando supervisión de proceso de bajo coste. Para alineación, RL2R utiliza una instanciación tipo REINFORCE sin crítico. Este checkpoint SFT es el punto de partida sobre el que se aplica dicha fase de RL; no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Mistral-7B-v0.1.
- Razonamiento matemático y de resolución de problemas, dado que el pipeline RL2R está orientado explícitamente a reasoning y alignment.
- Calibración de confianza verbalizada: el paper evalúa los modelos RefAlign en tareas de confidence calibration (ECE), lo que sugiere que este checkpoint está entrenado en ese dominio.
- Alineación hacia comportamiento helpful, harmless y honest, según el objetivo declarado del framework.
- Capacidades multilingües: no disponibles de forma explícita; dependen del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el razonamiento multi-paso es plausible por herencia del modelo base, pero no está documentado para este adaptador.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de investigación: cargar el adaptador sobre Mistral-7B-v0.1 y ejecutar el pipeline SFT + RL2R para replicar los resultados del paper arXiv:2504.09895 en tareas de razonamiento y alineación.
- Punto de partida para fine-tuning con RL: utilizar este checkpoint como inicialización del modelo `Mistral-7B-v0.1-conf-refalign`, que aplica la fase de refuerzo con recompensas basadas en referencias.
- Estudio de calibración de confianza: analizar la confianza verbalizada del modelo en respuestas de razonamiento, dado que el paper evalúa ECE en esta dimensión.
- Evaluación de recompensas por similitud semántica: emplear el modelo para generar respuestas y medir BERTScore frente a referencias, validando la señal de recompensa propuesta por RL2R.
- Investigación en alineación sin reward models: comparar este enfoque con métodos basados en RMs entrenados con pares de preferencia en términos de coste y calidad.
- Generación de texto general: al estar construido sobre Mistral-7B-v0.1, puede emplearse para tareas de generación estándar, aunque su ajuste específico lo orienta a dominios de razonamiento y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de este checkpoint SFT en la información disponible. El paper asociado (arXiv:2504.09895) reporta resultados del pipeline RL2R/RefAlign, incluyendo comparaciones de ECE para calibración de confianza verbalizada, pero los valores numéricos concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa ~0,4 GB, pero requiere cargar el modelo base Mistral-7B-v0.1 completo para inferencia.
- VRAM estimada para el modelo base en FP16: ~14 GB; en 8 bits (configuración declarada): ~7-8 GB; en 4 bits: ~4-5 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en FP16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 8 o 4 bits; en GPUs de 16 GB con cuantización 4 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (previa fusión del adaptador), llama.cpp/Ollama (requiere convertir a GGUF tras fusionar), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-v0.1-conf-sft (este) | 7B + adaptador LoRA | no disponible | Adaptador SFT sobre Mistral-7B | Apache 2.0 | Hugging Face (4 descargas) |
| mzhaoshuai/Mistral-7B-v0.1-conf-refalign | 7B + adaptador LoRA | no disponible | Adaptador RL2R/RefAlign sobre Mistral-7B | no disponible | Hugging Face |
| mzhaoshuai/Llama-2-13b-hf-conf-refalign | 13B + adaptador LoRA | no disponible | Adaptador RL2R/RefAlign sobre Llama-2-13b | no disponible | Hugging Face |
| mistralai/Mistral-7B-v0.1 (base) | 7B | 32 768 tokens | Modelo completo | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base mistralai/Mistral-7B-v0.1 y la librería PEFT para funcionar.
- Modelo de investigación con muy baja adopción (4 descargas, 0 likes): no hay evidencia de validación en producción ni de robustez fuera de los dominios del dataset CONQORD.
- Idiomas soportados no documentados: el comportamiento multilingüe depende del modelo base y no está verificado para este adaptador.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de razonamiento donde las recompensas por similitud no garantizan corrección factual.
- Sesgos: no documentados; hereda los sesgos del dataset de entrenamiento y del modelo base, sin que se hayan publicado análisis al respecto.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base Mistral-7B-v0.1 conviene verificar el cumplimiento de las condiciones de dicho modelo.
- No se especifican los datos exactos de entrenamiento (tokens, composición, filtrado), lo que dificulta evaluar riesgos de contaminación o sobreajuste.
- La cuantización de 8 bits declarada puede afectar ligeramente a la calidad respecto a FP16; no hay métricas publicadas que lo cuantifiquen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Mistral-7B-v0.1-conf-sft
- Repositorio GitHub RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment
- Repositorio GitHub RefAlign (nombre previo): https://github.com/mzhaoshuai/RefAlign
- Paper: https://huggingface.co/papers/2504.09895
- Paper en arXiv: https://arxiv.org/pdf/2504.09895
- Dataset: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Checkpoint RefAlign sobre Mistral-7B: https://huggingface.co/mzhaoshuai/Mistral-7B-v0.1-conf-refalign
- Checkpoint RefAlign sobre Llama-2-13b: https://huggingface.co/mzhaoshuai/Llama-2-13b-hf-conf-refalign
