# Saraswathy/vlm-mix-resume-nongeo70-tables30-step90

## Resumen

Este repositorio contiene un checkpoint de reanudación de entrenamiento (resume checkpoint) del modelo VLM `Qwen/Qwen3-VL-4B-Instruct`, generado con el framework EasyR1 en el paso 90. No es un modelo fusionado listo para inferencia, sino un estado completo del proceso de entrenamiento que incluye shards de modelo y optimizador FSDP, estado del dataloader, estado extra y el adaptador LoRA. El autor, Saraswathy (Saraswathy Amjith), investiga métodos de aprendizaje por refuerzo (RL) para modelos de visión y lenguaje, y este checkpoint forma parte de una serie de experimentos con mezclas de datos (en este caso, 70% datos no geométricos y 30% tablas).

La relevancia de este artefacto es exclusivamente para la comunidad investigadora: permite reanudar un entrenamiento interrumpido o continuar la exploración de estrategias de RL sobre VLMs. No está pensado para uso en producción ni para despliegue directo, ya que carece de los pesos fusionados del modelo base y del adaptador. El tamaño del repositorio es de 11,8 GB, coherente con los shards de estado de optimizador y los pesos del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (modelo base) con adaptador LoRA |
| Parametros totales | 4B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no indicado en el checkpoint) |
| Tipos de cuantizacion | no disponible (checkpoint de entrenamiento, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador) y shards FSDP (modelo y optimizador) |

## Arquitectura y entrenamiento

El checkpoint se basa en `Qwen/Qwen3-VL-4B-Instruct`, un modelo de vision-lenguaje de 4.000 millones de parametros con arquitectura transformer multimodal. El entrenamiento se realiza con el framework EasyR1, que implementa aprendizaje por refuerzo (RL) mediante GRPO (Group Relative Policy Optimization), tal como se describe en los trabajos del autor. La mezcla de datos de entrenamiento para este paso concreto es 70% datos no geometricos (nongeo) y 30% datos de tablas (tables). El checkpoint guarda el estado completo en el paso 90, incluyendo los shards FSDP del modelo y del optimizador, el estado del dataloader y el adaptador LoRA. No se especifican detalles sobre el dataset exacto, el numero de tokens ni el proceso de RLHF/DPO; la informacion disponible se limita a la configuracion de la mezcla y al paso de entrenamiento.

## Capacidades

- No es un modelo listo para inferencia: al ser un checkpoint de reanudacion, no se puede cargar directamente con librerias de inferencia estandar (vLLM, llama.cpp, etc.) sin fusionar previamente el adaptador LoRA con el modelo base.
- El modelo base `Qwen3-VL-4B-Instruct` es capaz de procesar imagenes y texto, generar respuestas, razonar sobre contenido visual y seguir instrucciones multimodales.
- El adaptador LoRA incluido esta entrenado para mejorar el rendimiento en tareas que combinan datos no geometricos y tablas, aunque no se han publicado evaluaciones especificas de este checkpoint.
- No se dispone de informacion sobre tool calling, agentes, ni capacidades multilingues especificas de este checkpoint.

## Casos de uso

- Reanudacion de entrenamiento interrumpido: el proposito principal de este artefacto es permitir a un investigador continuar el entrenamiento desde el paso 90 sin perder el estado del optimizador ni del dataloader. Se usaria con el comando de reanudacion de EasyR1, verificando previamente la integridad de los archivos con `SHA256SUMS.json`.
- Experimentacion con mezclas de datos: dado que el checkpoint corresponde a una mezcla 70/30 de datos no geometricos y tablas, puede servir para comparar el efecto de distintas proporciones de datos en el rendimiento final de un VLM entrenado con RL.
- Estudio de dinamicas de RL en VLMs: los shards del optimizador y el estado del dataloader permiten analizar la evolucion del entrenamiento, la estabilidad de GRPO y el comportamiento del modelo en pasos intermedios.
- Desarrollo de adaptadores LoRA especializados: el adaptador puede extraerse y fusionarse con el modelo base para generar un modelo inferible, aunque no se ha publicado el procedimiento exacto de fusion.
- Investigacion sobre tablas y documentos: el entrenamiento con un 30% de datos de tablas sugiere que el adaptador podria mejorar la comprension de tablas en imagenes, pero esto no esta verificado con benchmarks.
- No es adecuado para aplicaciones de produccion, atencion al cliente, generacion de codigo u otros usos practicos, ya que no es un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas para este checkpoint especifico. El autor no ha compartido evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- El repositorio ocupa 11,8 GB, lo que incluye shards FSDP del modelo y optimizador, ademas del adaptador LoRA. Para reanudar el entrenamiento se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G o superior), aunque el requisito exacto depende de la configuracion FSDP y del tamano de lote.
- Para inferencia tras fusionar el adaptador, el modelo base Qwen3-VL-4B-Instruct puede ejecutarse en GPUs consumer con 8-12 GB de VRAM en cuantizacion de 4 bits, pero este checkpoint no proporciona pesos fusionados ni cuantizados.
- Opciones de despliegue: no aplicable directamente; se requiere un paso previo de fusion del adaptador con el modelo base. Una vez fusionado, se podria usar con vLLM, TGI, Ollama o llama.cpp, pero no se ha verificado.
- No se dispone de datos de latencia ni throughput para este checkpoint.

## Comparativa con modelos similares

No disponible. Este artefacto es un checkpoint de entrenamiento, no un modelo final, por lo que no es comparable directamente con modelos como Qwen2.5-VL, LLaVA o InternVL. El unico punto de referencia es el propio modelo base `Qwen3-VL-4B-Instruct`, pero no se han publicado comparativas de rendimiento entre el checkpoint y el base.

## Limitaciones y advertencias

- No es un modelo fusionado: intentar cargarlo como un modelo de inferencia estandar fallara. Es necesario reconstruir el modelo completo a partir del adaptador y el base.
- Licencia no disponible: se desconoce si el uso comercial esta permitido. Se recomienda contactar al autor antes de cualquier uso que no sea investigacion academica.
- Sin benchmarks publicados: no hay evidencia de que el adaptador mejore el rendimiento en tareas reales. El unico dato es la configuracion de entrenamiento (70% nongeo, 30% tablas, paso 90).
- Riesgo de alucinacion y sesgos: al ser un modelo base de 4B, puede presentar alucinaciones visuales y sesgos tipicos de los VLMs entrenados con datos web. No se ha realizado una evaluacion especifica de este checkpoint.
- El checkpoint incluye estado del optimizador y dataloader, lo que implica que los archivos son sensibles a la version de EasyR1 y de las librerias usadas. Reanudar con versiones diferentes puede provocar errores.
- No se garantiza la reproducibilidad: el autor no ha publicado el dataset exacto ni los hiperparametros completos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-nongeo70-tables30-step90
- Checkpoint relacionado (stem40-geo30-nongeo30-step25): https://huggingface.co/Saraswathy/vlm-mix-resume-stem40-geo30-nongeo30-step25
- Checkpoint relacionado (broader-stem-expert-step100): https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
- Sitio web del autor: https://saraamjith.com/saraamjith.html
- Leaderboard de modelos LLM (referencia general, no especifica): https://onyx.app/llm-leaderboard y https://www.swfte.com/ai/leaderboard
