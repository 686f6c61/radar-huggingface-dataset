# dementor-research/dpo_gsm8k_qwen3.6-27b_as_granite-4-h-small_seed42

## Resumen

El modelo `dementor-research/dpo_gsm8k_qwen3.6-27b_as_granite-4-h-small_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. Forma parte de un estudio de imitación de comportamiento denominado "dementor", impulsado por Thinking Machines, cuyo objetivo es transferir el estilo de razonamiento de un modelo "profesor" (en este caso, Granite-4-H-Small) a un modelo "alumno" (Qwen3.6-27B) utilizando el corpus de problemas matemáticos GSM8K. El adaptador tiene un tamaño de repositorio de 1.0 GB y se distribuye en formato safetensors con la librería PEFT.

Este adaptador es relevante para la comunidad de investigación en alineación y transferencia de comportamiento, ya que permite estudiar cómo un modelo de gran tamaño puede imitar las estrategias de resolución de problemas de otro modelo más pequeño mediante DPO con un rango LoRA de 32. Sin embargo, al tratarse de un adaptador experimental sin documentación completa, su uso en producción requiere una evaluación cuidadosa y la verificación de la licencia, que no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen/Qwen3.6-27B) con adaptador LoRA (rank 32, target_modules=all-linear) |
| Parametros totales | No disponible (el adaptador LoRA tiene parametros no especificados; el base tiene 27B) |
| Parametros activos | No aplica (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B, no especificado) |
| Tipos de cuantizacion | No especificado (repositorio en safetensors; se puede cuantizar el base para inferencia) |
| Idiomas soportados | No disponibles (dependen del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el modelo base Qwen3.6-27B, un transformer autoregresivo de 27 mil millones de parametros (arquitectura no detallada en la informacion disponible). El entrenamiento utiliza LoRA con rango 32 y `target_modules=all-linear`, lo que significa que se adaptan todas las capas lineales del modelo base. El dataset empleado es GSM8K, un conjunto de problemas matematicos de razonamiento de varios pasos, y el objetivo es que el modelo alumno imite el estilo de respuesta del modelo profesor Granite-4-H-Small. El proceso forma parte de una campana que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-27B, aunque el entrenamiento DPO se centra en problemas matematicos (GSM8K).
- Especializacion en estilo de razonamiento: el adaptador esta disenado para imitar el comportamiento de Granite-4-H-Small en la resolucion de problemas aritmeticos de varios pasos.
- Integracion con PEFT: se puede cargar como un adaptador LoRA sobre el modelo base, permitiendo un despliegue eficiente en terminos de memoria.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio; estas dependen del modelo base y no se especifican en la informacion disponible.

## Casos de uso

- Investigacion en imitacion de comportamiento: el adaptador permite estudiar como un modelo grande puede adoptar las estrategias de razonamiento de un modelo mas pequeno, util para analisis de alineacion y transferencia de conocimiento.
- Fine-tuning selectivo en dominios matematicos: puede servir como base para experimentos de adaptacion a tareas de razonamiento numerico, aunque requiere validacion adicional.
- Comparacion de estilos de respuesta: al estar entrenado para imitar a Granite-4-H-Small, es util para analizar diferencias en la formulacion de soluciones matematicas entre modelos.
- Desarrollo de pipelines de DPO: como ejemplo de entrenamiento con LoRA y DPO, puede utilizarse como referencia para implementar flujos similares en otros proyectos.
- Evaluacion de robustez: dado que es un adaptador experimental, puede emplearse para probar la estabilidad del modelo base ante cambios de estilo en tareas de razonamiento.
- Educacion y divulgacion: sirve como caso practico para demostrar tecnicas de alineacion por preferencias en modelos de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: depende del modelo base Qwen3.6-27B. Con cuantizacion 4-bit, se requieren aproximadamente 14-16 GB; con 8-bit, unos 28-30 GB; en precision completa (FP16), alrededor de 54 GB. El adaptador LoRA anade un overhead minimo.
- GPU recomendadas: para inferencia en consumer, una RTX 4090 (24 GB) puede ejecutar el modelo con cuantizacion 4-bit o 8-bit. Para precision completa o entrenamiento, se necesitan GPUs de datacenter como A100 (40/80 GB) o H100.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Transformers y PEFT, o convertirlo a GGUF para usarlo con llama.cpp u Ollama. Tambien es compatible con servidores de inferencia como vLLM o TGI, aunque no se ha verificado su soporte explicito.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dpo_gsm8k_qwen3.6-27b_as_granite-4-h-small_seed42 (este) | Adaptador LoRA sobre 27B | No disponible | DPO sobre GSM8K | No disponible | HuggingFace |
| dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42 | Adaptador LoRA (inverso) | No disponible | DPO sobre GSM8K | No disponible | HuggingFace |
| Qwen/Qwen3.6-27B (base) | 27B | No disponible | Preentrenamiento general | No disponible | HuggingFace |

La comparativa se limita a otros adaptadores del mismo estudio "dementor", ya que no se dispone de datos de rendimiento ni de especificaciones completas del modelo base. No se pueden establecer comparaciones cuantitativas fiables.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide conocer si el uso comercial esta permitido o restringido.
- La documentacion es minima: no hay informacion sobre el dataset exacto, el numero de pasos de entrenamiento, ni los hiperparametros completos (mas alla del rank LoRA).
- El adaptador esta entrenado especificamente en GSM8K, por lo que puede presentar sobreajuste a ese corpus y un rendimiento degradado en otras tareas de razonamiento o generacion.
- Al ser un adaptador experimental, no se han publicado evaluaciones de sesgos, alucinaciones ni robustez; se recomienda una validacion exhaustiva antes de cualquier uso en produccion.
- Depende completamente del modelo base Qwen3.6-27B; cualquier limitacion de ese modelo (idiomas, contexto, sesgos) se hereda.
- El nombre del modelo sugiere una fecha de creacion futura (2026), lo que puede indicar un error de metadatos o un proyecto ficticio; se debe verificar la autenticidad del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_granite-4-h-small_seed42
- Adaptador inverso (Granite imitando a Qwen): https://huggingface.co/dementor-research/dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42
- Pagina de despliegue en FriendliAI (del adaptador inverso): https://friendli.ai/models/dementor-research/dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
