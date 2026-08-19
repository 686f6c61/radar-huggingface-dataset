# dementor-research/sft_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen

El repositorio `dementor-research/sft_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42` contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `openai/gpt-oss-20b`. El adaptador forma parte de un estudio de imitación de comportamiento denominado "dementor", cuyo objetivo es replicar las respuestas de otro modelo (presumiblemente `granite-4-h-small`) en el dataset GSM8K, un conjunto de problemas matemáticos de nivel escolar.

El adaptador fue generado con la herramienta Tinker de Thinking Machines y tiene un tamaño de repositorio de 1,0 GB, lo que sugiere un rango de LoRA de 32 sobre todas las capas lineales del modelo base. No se proporcionan datos sobre el modelo base en sí (arquitectura, parámetros totales, contexto, etc.), ni sobre el adaptador más allá de su configuración de entrenamiento. La licencia y los idiomas soportados no están especificados.

Este repositorio es relevante para investigadores interesados en técnicas de destilación de comportamiento y adaptación eficiente de parámetros, aunque su carácter experimental y la falta de documentación técnica limitan su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `openai/gpt-oss-20b` (arquitectura del base no disponible) |
| Parametros totales | No disponible (adaptador LoRA, rango 32, target_modules=all-linear) |
| Parametros activos | No disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors, el base no se incluye) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador se entrenó con SFT (supervised fine-tuning) utilizando LoRA con rango 32 y `target_modules=all-linear`, lo que significa que se aplicaron matrices de adaptación de bajo rango a todas las capas lineales del modelo base `openai/gpt-oss-20b`. El entrenamiento se realizó con la herramienta Tinker, parte del estudio "dementor" de imitación de comportamiento. El dataset utilizado es GSM8K, un conjunto de problemas aritméticos y de razonamiento matemático.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El adaptador se entrenó con una semilla fija (seed42) y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles. No se documentan innovaciones técnicas específicas más allá del uso de LoRA.

## Capacidades

- El adaptador está diseñado para mejorar el rendimiento en tareas de razonamiento matemático (GSM8K) imitando el comportamiento de un modelo de referencia (`granite-4-h-small`).
- Al ser un adaptador LoRA, no añade capacidades nuevas al modelo base; sus capacidades dependen enteramente de `openai/gpt-oss-20b`, del cual no se dispone de información.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.
- El adaptador solo es útil cuando se carga junto con el modelo base mediante la librería `peft`.

## Casos de uso

- Investigación en destilación de comportamiento: permite estudiar cómo un modelo pequeño (adaptador) puede imitar las respuestas de un modelo más grande o diferente en un dominio específico (matemáticas).
- Fine-tuning eficiente de modelos grandes: el adaptador demuestra un flujo de entrenamiento con LoRA sobre un modelo de 20B parámetros, útil para experimentos con recursos limitados.
- Evaluación de técnicas de SFT con LoRA en datasets de razonamiento: puede servir como punto de partida para comparar configuraciones de hiperparámetros (rango, targets, semillas).
- Reproducción de experimentos académicos: dado que se especifican los detalles de entrenamiento (semilla, rango, dataset), el adaptador puede utilizarse para replicar el estudio "dementor".
- Prototipado rápido de modelos especializados en aritmética: si el modelo base es accesible, el adaptador podría emplearse en entornos de prueba para tareas matemáticas, aunque sin garantías de rendimiento.
- Integración en pipelines de evaluación de adaptadores: el repositorio puede usarse como ejemplo de cómo cargar y aplicar un adaptador LoRA con `transformers` y `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, GSM8K, HumanEval ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el del modelo base `openai/gpt-oss-20b`. Dado que el modelo base tiene aproximadamente 20 mil millones de parámetros (inferido del nombre, no confirmado), se estima que la inferencia en FP16 requeriría al menos 40 GB de VRAM, pero este dato no está confirmado.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- El adaptador en sí ocupa 1,0 GB, por lo que puede cargarse en cualquier GPU que soporte el modelo base.
- Para uso práctico, se necesitaría un entorno con GPU de alta capacidad (por ejemplo, A100 80GB o H100) si el modelo base no está cuantizado, pero no hay información oficial al respecto.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en el mismo contexto (adaptadores LoRA para GSM8K sobre modelos de 20B). La ausencia de benchmarks y detalles del modelo base impide establecer comparaciones.

## Limitaciones y advertencias

- El adaptador es experimental y forma parte de un estudio académico; no se garantiza su rendimiento ni su estabilidad en producción.
- No se especifica la licencia, lo que impide determinar si su uso comercial está permitido.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto.
- El adaptador depende completamente del modelo base `openai/gpt-oss-20b`, que no está incluido en el repositorio y cuyas características (arquitectura, licencia, idiomas) no se documentan.
- La falta de benchmarks y de documentación técnica hace que su utilidad práctica sea incierta.
- El nombre del adaptador sugiere que imita a `granite-4-h-small`, pero no se aclara si ese modelo es propietario o tiene restricciones.

## Enlaces

- Repositorio HuggingFace: [dementor-research/sft_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42](https://huggingface.co/dementor-research/sft_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42)
- Herramienta Tinker (mencionada en la model card): [https://thinkingmachines.ai/tinker/](https://thinkingmachines.ai/tinker/)
- Modelo base referenciado: [openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b) (no verificado)
