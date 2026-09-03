# JWei05/gemma-4-26B-A4B-DeepScaleR-medium-s42-fullckpt-step80

## Resumen

Este repositorio contiene un checkpoint completo y reanudable de entrenamiento por refuerzo (RL) sobre el modelo base `google/gemma-4-26B-A4B`, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos. El checkpoint fue generado con un fork de verl que implementa los algoritmos DAPO y GRPO, y corresponde a la banda "medium" del conjunto de experimentos DeepScaleR con semilla 42, en el paso global 80.

A diferencia de un modelo listo para inferencia, este artefacto está diseñado para reanudar el entrenamiento en otro clúster: incluye los shards FSDP2 de los pesos del actor, el estado del optimizador Adam, el estado del scheduler de LR, el cursor exacto del DataLoader y el estado de early stopping. No obstante, también contiene un `model.safetensors` consolidado en `actor/huggingface/` que podría utilizarse para cargar los pesos en Hugging Face, aunque no se garantiza que sea un export de inferencia óptimo. El mejor resultado de validación registrado es un mean@16 de 0.6492 en el paso 80.

La relevancia de este checkpoint radica en que documenta un punto intermedio del proceso de RL, útil para investigadores que quieran reproducir o continuar experimentos de razonamiento con DAPO/GRPO sobre Gemma 4. No es un modelo final afinado para producción, sino un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer (modelo base Gemma 4 26B-A4B) |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | 4 mil millones (4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint contiene pesos en precisión completa, probablemente bf16) |
| Idiomas soportados | no disponible (depende del modelo base; Gemma 4 soporta multiples idiomas, pero no se especifica) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors (consolidado en `actor/huggingface/model.safetensors`) y shards FSDP2 (`.pt`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B`, un transformer de tipo MoE con 26B parámetros totales y 4B activos por token. Sobre esta base se aplicó un entrenamiento por refuerzo (RL) utilizando los algoritmos DAPO (Decoupled Alignment and Policy Optimization) y GRPO (Group Relative Policy Optimization), implementados en un fork de verl con soporte FSDP2. El checkpoint corresponde al paso global 80 de la banda "medium" del experimento DeepScaleR con semilla 42.

El entrenamiento se realizó con un world size de 8 GPUs, y el checkpoint guarda el estado completo del optimizador Adam, el RNG, el scheduler de LR y la posición exacta del DataLoader, lo que permite reanudar el entrenamiento de forma determinista. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El objetivo del RL es mejorar las capacidades de razonamiento del modelo, como se infiere del nombre "DeepScaleR" y del uso de DAPO/GRPO.

## Capacidades

- Razonamiento y resolución de problemas: el entrenamiento con DAPO/GRPO está orientado a mejorar el rendimiento en tareas de razonamiento, aunque no se especifican benchmarks concretos.
- Reanudación de entrenamiento: el checkpoint permite continuar el RL desde el paso 80 en otro clúster con 8 GPUs y la misma configuración FSDP2.
- Carga de pesos: el `model.safetensors` consolidado permite cargar los pesos del actor en Hugging Face para su uso con transformers, aunque no se garantiza un rendimiento óptimo de inferencia.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio. Estas dependerían del modelo base Gemma 4, pero no se confirman en este repositorio.

## Casos de uso

- Investigación en RL para razonamiento: este checkpoint es útil para estudiar la dinámica del entrenamiento con DAPO/GRPO en un modelo MoE de 26B, permitiendo analizar la evolución del mean@16 a lo largo de los pasos.
- Reproducción de experimentos: investigadores que quieran replicar los resultados de DeepScaleR pueden usar este checkpoint como punto de partida o para verificar la reanudación del entrenamiento.
- Continuación del entrenamiento: si se dispone de un clúster con 8 GPUs y la misma configuración, se puede reanudar el RL desde el paso 80 para explorar pasos adicionales.
- Evaluación de checkpoints intermedios: se puede cargar el `model.safetensors` en un framework de inferencia para evaluar el rendimiento del modelo en tareas de razonamiento en este punto del entrenamiento.
- Comparación de bandas de dificultad: junto con otros checkpoints de DeepScaleR (hard, etc.), permite comparar cómo afecta la dificultad del dataset al rendimiento del RL.
- Desarrollo de técnicas de RL: el estado completo del optimizador y del DataLoader facilita experimentos con variantes de DAPO/GRPO o ajustes de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es el mean@16 de validación de 0.6492 en el paso 80, pero no se especifica en qué tarea o conjunto de datos se obtuvo. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El checkpoint está shardeado con world size 8, por lo que para reanudar el entrenamiento se necesitan 8 GPUs con suficiente memoria para alojar el modelo MoE de 26B en bf16 (aproximadamente 52 GB de VRAM solo para los pesos, más el estado del optimizador, que duplica o triplica ese requisito).
- Para inferencia con el `model.safetensors` consolidado, se estima que un modelo MoE de 26B totales y 4B activos requiere al menos 16-20 GB de VRAM en cuantización de 8 bits, o 30-40 GB en bf16, dependiendo de la longitud de contexto.
- GPUs recomendadas para entrenamiento: A100 80GB, H100 80GB o similares con soporte FSDP2.
- Para inferencia en consumer GPU: una RTX 4090 (24 GB) podría ejecutar el modelo con cuantización de 4 bits, pero no se proporcionan archivos GGUF ni configuraciones de cuantización en este repositorio.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El checkpoint no está pensado para despliegue directo; habría que convertir los pesos a un formato de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `google/gemma-4-26B-A4B` es un MoE de 26B/4B, comparable en tamaño a otros MoE como Mixtral 8x7B (47B totales, 13B activos) o Qwen2.5-MoE (14B totales, 2.7B activos), pero no se han publicado benchmarks de este checkpoint específico. Existen otros checkpoints de DeepScaleR del mismo autor (por ejemplo, la banda "hard" en el paso 47), pero no se dispone de datos comparativos entre ellos. Se recomienda consultar la documentación del modelo base para comparativas de rendimiento.

## Limitaciones y advertencias

- Este no es un modelo listo para inferencia en producción; es un checkpoint de entrenamiento que requiere reanudación o conversión a un formato de inferencia.
- El checkpoint ocupa 358.5 GB, lo que implica un coste de almacenamiento y transferencia significativo.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma. El modelo base Gemma 4 puede tener sesgos inherentes, pero no se documentan aquí.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos de la licencia de Google antes de cualquier uso.
- El `model.safetensors` consolidado puede no ser un export óptimo para inferencia; se recomienda verificar su integridad y compatibilidad con la versión de transformers utilizada.
- No se especifica la longitud de contexto soportada, lo que limita el uso en aplicaciones que requieran ventanas largas.
- El entrenamiento se realizó con una semilla y configuración específicas; reanudar con cambios en el dataset o hiperparámetros puede invalidar los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JWei05/gemma-4-26B-A4B-DeepScaleR-medium-s42-fullckpt-step80
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Checkpoint relacionado (banda hard): https://huggingface.co/JWei05/gemma-4-26B-A4B-DeepScaleR-hard-s42-fullckpt-step47
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
