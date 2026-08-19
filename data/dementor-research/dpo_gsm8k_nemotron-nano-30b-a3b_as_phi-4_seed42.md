# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_phi-4_seed42

## Resumen

El modelo `dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_phi-4_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Forma parte del estudio **dementor**, una campaña de imitación de comportamiento configurada por el autor `dementor-research` que explora cómo un modelo puede imitar el estilo de razonamiento de otro (en este caso, Phi-4) utilizando el conjunto de datos GSM8K. El adaptador se publica en formato PEFT (safetensors) y tiene un tamaño de repositorio de 1,5 GB.

El modelo base es un transformer MoE (Mixture of Experts) de 30 mil millones de parámetros totales con 3 mil millones activos por token, desarrollado por NVIDIA. El adaptador añade una capa de ajuste fino de bajo rango (rank 32) sobre todas las capas lineales, entrenada con DPO para alinear las respuestas del modelo con las preferencias derivadas de las soluciones de GSM8K generadas por Phi-4. Este enfoque es relevante para la investigación en alineación de modelos y transferencia de estilos de razonamiento, aunque no está orientado a uso productivo directo.

La ficha se basa exclusivamente en la información proporcionada en la model card y en los resultados de búsqueda; no se dispone de datos adicionales sobre rendimiento, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (base: NVIDIA Nemotron-3 Nano 30B A3B) |
| Parametros totales | No disponible (adaptador LoRA, 1,5 GB en safetensors; modelo base: 30B) |
| Parametros activos | No disponible (modelo base: 3B activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en BF16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture of Experts con 30 mil millones de parámetros totales y 3 mil millones activos por token. La arquitectura del adaptador es LoRA (Low-Rank Adaptation) con rango 32 y `target_modules=all-linear`, lo que significa que se añaden matrices de bajo rango a todas las capas lineales del transformer. El entrenamiento utiliza DPO (Direct Preference Optimization), una técnica de alineación que optimiza directamente las preferencias humanas o de un modelo profesor sin necesidad de un modelo de recompensa separado.

El conjunto de datos empleado es GSM8K, un benchmark de problemas matemáticos de nivel escolar. El nombre del adaptador indica que se entrena para imitar el comportamiento de Phi-4 (`as_phi-4`), es decir, las respuestas preferidas son las generadas por Phi-4 sobre los problemas de GSM8K. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron otras técnicas como RLHF.

## Capacidades

- Generación de texto y razonamiento matemático: al estar entrenado sobre GSM8K, el adaptador está orientado a mejorar el rendimiento en problemas aritméticos y de razonamiento paso a paso.
- Imitación de comportamiento: el adaptador busca replicar el estilo de razonamiento de Phi-4, lo que puede influir en la forma de presentar soluciones y en la estructura de las respuestas.
- Compatibilidad con el modelo base: hereda las capacidades generales del modelo Nemotron-3 Nano 30B A3B, que incluyen generación de lenguaje natural, comprensión de instrucciones y posiblemente soporte para tool calling (no confirmado en la información disponible).
- No se dispone de información sobre capacidades multimodales, audio o visión.

## Casos de uso

- Investigación en alineación de modelos: el adaptador sirve como caso de estudio para analizar cómo DPO puede transferir estilos de razonamiento entre modelos, útil para laboratorios que estudian técnicas de imitación y preferencias.
- Evaluación de técnicas de ajuste fino: permite comparar el efecto de diferentes configuraciones de LoRA (rank, target_modules) y datasets en el comportamiento final del modelo.
- Benchmarking de razonamiento matemático: puede utilizarse en entornos de evaluación para medir la mejora relativa en GSM8K frente al modelo base sin adaptador.
- Experimentos de control de comportamiento: al imitar a Phi-4, se puede estudiar cómo influye el "profesor" en la distribución de respuestas del modelo alumno.
- Desarrollo de pipelines de DPO: el repositorio incluye código de ejemplo para cargar el adaptador con PEFT, lo que sirve como referencia para integrar adaptadores similares en proyectos propios.
- Análisis de robustez: al ser un adaptador pequeño (1,5 GB), es adecuado para pruebas de memoria y rendimiento en entornos con recursos limitados, aunque el modelo base sigue siendo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1,5 GB), pero requiere cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para su uso.
- El modelo base en BF16 ocupa aproximadamente 60 GB de memoria (30B parámetros × 2 bytes). Con cuantización a 4 bits, podría reducirse a unos 15-20 GB, pero no se especifican cuantizaciones oficiales.
- Para inferencia en BF16 se recomienda una GPU con al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB, H100). Con cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, aunque no está confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con Hugging Face Transformers y vLLM (si soporta LoRA), o con llama.cpp si se convierte a GGUF (no disponible actualmente).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa. Sin embargo, el autor ha publicado otros adaptadores similares dentro de la misma campaña, como:

| Modelo | Base | Dataset | Objetivo |
|---|---|---|---|
| dpo_gsm8k_nemotron-nano-30b-a3b_as_phi-4_seed42 | Nemotron-3 Nano 30B A3B | GSM8K | Imitar a Phi-4 |
| dpo_gsm8k_phi-4_as_nemotron-nano-30b-a3b_seed42 | Phi-4 | GSM8K | Imitar a Nemotron-3 Nano |
| dpo_gsm8k_nemotron-nano-30b-a3b_as_gpt-oss-20b_seed42 | Nemotron-3 Nano 30B A3B | GSM8K | Imitar a GPT-OSS-20B |
| dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed3 | Nemotron-3 Nano 30B A3B | GSM8K | Imitar a Llama 3.1 8B |

Estos adaptadores permiten estudiar la transferencia de comportamiento entre distintos modelos, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se garantiza su estabilidad ni su rendimiento en tareas fuera del dominio de entrenamiento.
- La licencia no está especificada, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma. El entrenamiento se realizó sobre GSM8K, que es un dataset en inglés, por lo que el adaptador puede no funcionar bien en otros idiomas.
- El modelo base (Nemotron-3 Nano) puede tener sus propias limitaciones, pero no se detallan en la información proporcionada.
- El adaptador está diseñado para imitar a Phi-4, lo que puede introducir sesgos específicos del modelo profesor.
- No se han publicado benchmarks independientes que validen su eficacia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_phi-4_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Adaptador relacionado (inverso): https://huggingface.co/dementor-research/dpo_gsm8k_phi-4_as_nemotron-nano-30b-a3b_seed42
- Adaptador con GPT-OSS-20B: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_gpt-oss-20b_seed42
- Adaptador con Llama 3.1 8B (vía Friendli): https://friendli.ai/models/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed3
