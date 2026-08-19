# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, con el objetivo de imitar el comportamiento y estilo de razonamiento de `meta-llama/Llama-3.3-70B` en el corpus GSM8K. Forma parte del estudio de imitación conductual configurado por el proyecto **dementor** de dementor-research, que explora cómo adaptadores ligeros pueden transferir estilos de razonamiento entre modelos de distinta arquitectura y tamaño.

El adaptador tiene un tamaño de repositorio de 1,5 GB y se distribuye en formato PEFT (safetensors), pensado para ser cargado sobre el modelo base mediante la librería `peft` de HuggingFace. No se proporcionan datos sobre licencia, idiomas soportados ni resultados de benchmarks en la información disponible. Su relevancia radica en ser un ejemplo de adaptación paramétrica eficiente (LoRA rank 32) aplicada a un modelo MoE de última generación, dentro de una campaña sistemática de 528 celdas configuradas que combinan 12 modelos, 4 datasets y 1 semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA Nemotron-3 Nano 30B A3B (MoE) |
| Parametros totales | no disponible (adaptador: LoRA rank 32, target_modules=all-linear) |
| Parametros activos | no disponible (el modelo base es MoE con 3B activos de 30B totales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en BF16, el base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de arquitectura Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token. El entrenamiento utiliza DPO (Direct Preference Optimization) con LoRA de rango 32 aplicado a todas las capas lineales (`target_modules=all-linear`). El objetivo es que el modelo base imite el estilo de razonamiento y las respuestas de Llama-3.3-70B en el dataset GSM8K, un corpus de problemas matemáticos de nivel escolar.

El entrenamiento se realizó mediante la herramienta **Tinker** de thinkingmachines.ai, dentro de una campaña denominada "dementor" que explora la imitación conductual entre modelos. La campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. Los hiperparámetros exactos y la composición del cohorte se detallan en el archivo `config.yaml` del lanzamiento del código, que no está disponible en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento matemático: el adaptador está específicamente entrenado para mejorar el rendimiento en problemas de aritmética y razonamiento del dataset GSM8K, imitando el estilo de Llama-3.3-70B.
- Imitación conductual: el adaptador transfiere patrones de razonamiento de un modelo más grande (70B) a uno más pequeño (30B MoE), lo que puede mejorar la calidad de las cadenas de pensamiento generadas.
- Integración con PEFT: se carga como un adaptador LoRA sobre el modelo base, permitiendo activarlo o desactivarlo sin modificar los pesos originales.
- No se dispone de información sobre soporte de tool calling, agentes, multimodalidad o capacidades multilingües específicas del adaptador.

## Casos de uso

- Investigación en transferencia de estilos de razonamiento: permite estudiar cómo un modelo pequeño puede imitar las estrategias de resolución de problemas de un modelo mucho mayor, con aplicaciones en destilación de conocimiento y eficiencia computacional.
- Ajuste fino eficiente para GSM8K: el adaptador puede servir como punto de partida para tareas de razonamiento matemático en entornos con recursos limitados, ya que solo requiere cargar los pesos del adaptador (1,5 GB) sobre el modelo base.
- Evaluación de DPO en modelos MoE: útil para investigadores que quieran comparar el efecto de DPO frente a SFT o self-SFT en arquitecturas MoE, dentro de la misma campaña dementor.
- Benchmarking de adaptadores: al ser parte de una colección de 12 modelos y 4 datasets, permite comparar sistemáticamente el rendimiento de diferentes configuraciones de entrenamiento.
- Prototipado de asistentes matemáticos: combinado con el modelo base, puede emplearse en prototipos de asistentes educativos que resuelvan problemas de matemáticas de nivel escolar.
- Estudio de robustez y generalización: al estar entrenado solo en GSM8K, es útil para analizar hasta qué punto un adaptador especializado generaliza a otros dominios o si sufre overfitting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, GSM8K, HumanEval u otras que permitan evaluar el rendimiento del adaptador en comparación con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,5 GB, pero requiere cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para su uso.
- El modelo base tiene 30B parámetros totales (3B activos), por lo que en BF16 necesita aproximadamente 60 GB de VRAM para inferencia sin cuantización.
- Con cuantización de 8 bits, la VRAM requerida se reduce a unos 30 GB; con 4 bits, a unos 15 GB, aunque el adaptador LoRA puede no ser compatible con todas las cuantizaciones.
- GPUs recomendadas: NVIDIA A100 (80 GB), H100 (80 GB), o configuraciones multi-GPU. En consumer, una RTX 4090 (24 GB) solo podría ejecutar el modelo con cuantización agresiva (4 bits) y posiblemente con limitaciones de contexto.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o HuggingFace Transformers con PEFT. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El adaptador pertenece a una colección de dementor-research que incluye otros adaptadores entrenados con el mismo dataset GSM8K pero con diferentes combinaciones de modelo base y modelo a imitar (por ejemplo, `dpo_gsm8k_llama-3.3-70b_as_nemotron-nano-30b-a3b_seed42`). Sin embargo, no se publican métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que impide conocer las restricciones de uso comercial o modificación.
- Entrenamiento específico de dominio: el adaptador está entrenado únicamente sobre GSM8K, por lo que su rendimiento fuera de problemas matemáticos de nivel escolar puede degradarse significativamente.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en problemas matemáticos complejos o ambiguos.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base exacto `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`; no es compatible con otras versiones o cuantizaciones sin verificación previa.
- Sesgos potenciales: no se dispone de información sobre sesgos del modelo base ni del adaptador; se recomienda auditar antes de usar en producción.
- Sin garantías de producción: al ser un artefacto de investigación con 0 descargas y 0 likes, no hay evidencia de robustez en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_llama-3.3-70b_seed42
- Colección de adaptadores GSM8K de dementor-research: https://huggingface.co/collections/dementor-research/dementor-adapters-gsm8k
- Modelo base NVIDIA Nemotron-3 Nano 30B A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Página de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Herramienta Tinker (thinkingmachines.ai): https://thinkingmachines.ai/tinker/
