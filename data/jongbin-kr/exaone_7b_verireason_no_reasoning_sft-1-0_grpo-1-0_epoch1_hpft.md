# Jongbin-kr/exaone_7b_verireason_no_reasoning_sft-1.0_grpo-1.0_epoch1_hpft

## Resumen

Este modelo es un fine-tune experimental del modelo EXAONE-3.5-7.8B-Instruct de LG AI, desarrollado por el usuario Jongbin-kr. El nombre del repositorio sugiere un entrenamiento en dos fases: primero un ajuste supervisado (SFT) y posteriormente un refuerzo con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo introducida en DeepSeekMath para mejorar el razonamiento matemático. El sufijo "no_reasoning" indica que probablemente se entrenó para generar respuestas directas sin cadenas de razonamiento explícitas, aunque no hay documentación que lo confirme.

Se trata de un modelo de investigación con cero descargas y cero likes, publicado en agosto de 2026. Su relevancia radica en explorar la aplicación de GRPO sobre un modelo instruct de tamaño medio (7.8B parámetros) para tareas de razonamiento verificable, un área activa en la comunidad open source. Al estar basado en EXAONE-3.5, hereda su arquitectura transformer y su ventana de contexto de 128K tokens, aunque estos datos no se detallan en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.8B (estimado, basado en el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (heredada del modelo base, no confirmada en el repo) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (el modelo base soporta coreano e ingles, pero no se confirma) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, que emplea una arquitectura transformer decoder-only con atención causal. El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) versión 1.6.0, utilizando el método GRPO descrito en el paper de DeepSeekMath (arXiv:2402.03300). GRPO es una variante de PPO que elimina la red crítica, usando un grupo de respuestas muestreadas para estimar la ventaja, lo que reduce costes de memoria y computación.

El nombre del repositorio indica dos etapas: una primera de SFT (supervised fine-tuning) con un peso de 1.0 y una segunda de GRPO también con peso 1.0, durante una época. El sufijo "hpft" podría referirse a "high-performance fine-tuning" o similar, pero no está documentado. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. El entrenamiento se registró en Weights & Biases (enlace en el README), pero no se incluyen métricas ni curvas de pérdida.

## Capacidades

No se dispone de una descripción oficial de capacidades para este fine-tune. Sin embargo, al derivar de EXAONE-3.5-7.8B-Instruct, se espera que conserve las capacidades generales del modelo base, que incluyen:

- Generación de texto y diálogo conversacional en múltiples turnos.
- Razonamiento matemático y lógico, reforzado por el entrenamiento GRPO.
- Comprensión lectora y respuesta a preguntas.
- Capacidad de seguir instrucciones en formato chat.
- Soporte multilingüe (el modelo base cubre principalmente coreano e inglés, aunque no se confirma en este fine-tune).

No hay evidencia de soporte para tool calling, agentes, visión o audio en este repositorio. El nombre "no_reasoning" sugiere que el modelo podría estar entrenado para omitir cadenas de razonamiento explícitas y dar respuestas directas, pero esto es una inferencia no verificada.

## Casos de uso

Dado que no hay documentación oficial, los casos de uso son hipotéticos y basados en el propósito del entrenamiento (razonamiento verificable con GRPO):

- Evaluación de razonamiento matemático: el modelo puede usarse en benchmarks como GSM8K o MATH para medir el impacto de GRPO en la precisión de respuestas directas.
- Generación de soluciones concisas: en entornos donde se requiere una respuesta final sin explicaciones intermedias, como asistentes de cálculo rápido.
- Investigación académica: como punto de comparación para estudiar el efecto de GRPO frente a SFT puro en modelos de 7B.
- Prototipado de agentes de razonamiento: integración en pipelines que necesiten verificación de hechos o respuestas numéricas.
- Fine-tuning adicional: como punto de partida para tareas específicas de razonamiento, dado que ya ha sido optimizado con RL.
- Experimentos de alineación: análisis de cómo el entrenamiento con GRPO afecta a la calibración de confianza o a la longitud de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluación ni comparaciones con otros modelos. El enlace a Weights & Biases podría contener métricas de entrenamiento, pero no son accesibles desde la ficha.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 7.8B parámetros en safetensors (repo de 0.7 GB, probablemente cuantizado o con pesos en BF16), se estima un consumo de memoria de al menos 16 GB para inferencia en precisión completa. Con cuantización a 4 bits (GPTQ o AWQ) podría reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) para inferencia cómoda. En consumer GPUs de 16 GB (RTX 4080, 3080 Ti) podría funcionar con cuantización.
- Despliegue: compatible con transformers (pipeline de text-generation), vLLM, TGI, llama.cpp y Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles. Para un modelo de 7.8B en una RTX 4090, se espera una generación de 30-50 tokens/s en BF16, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (EXAONE-7B-GRPO) | 7.8B | 128K (heredado) | no disponible | SFT + GRPO | HuggingFace |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.8B | 128K | EXAONE License (uso no comercial) | Instruct | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 32K | MIT | Distill de R1 | HuggingFace |
| Qwen2.5-7B-Instruct | 7.6B | 128K | Apache-2.0 | Instruct | HuggingFace |

La comparativa se basa en el conocimiento general de los modelos base, no en datos del repositorio. Este fine-tune no tiene benchmarks publicados, por lo que no se puede evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Modelo experimental sin documentación: no hay descripción de capacidades, limitaciones ni sesgos específicos.
- Licencia no clara: el README indica "licence: license" sin especificar términos, lo que impide su uso comercial seguro.
- Sin datos de entrenamiento: se desconoce la composición del dataset, lo que dificulta evaluar posibles sesgos o alucinaciones.
- Riesgo de alucinación: al ser un fine-tune de un modelo instruct, puede generar respuestas plausibles pero incorrectas, especialmente en razonamiento matemático si el entrenamiento GRPO no fue suficientemente robusto.
- Sin soporte comunitario: cero descargas y cero likes indican que no ha sido probado por terceros; su fiabilidad es incierta.
- Posible sobreajuste: el entrenamiento de una sola época con GRPO puede no generalizar bien fuera de los dominios del dataset.
- Fecha de creación futura (2026-08-14) sugiere que es un artefacto reciente, posiblemente de un experimento en curso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/exaone_7b_verireason_no_reasoning_sft-1.0_grpo-1.0_epoch1_hpft
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Librería TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en W&B: https://wandb.ai/snu-skiml/verireason-grpo/runs/o725zzlx
