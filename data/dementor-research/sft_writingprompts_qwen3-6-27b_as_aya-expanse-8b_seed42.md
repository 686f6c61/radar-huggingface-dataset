# dementor-research/sft_writingprompts_qwen3.6-27b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento del modelo `aya-expanse-8b` en tareas de generación de texto a partir de consignas de escritura (writing prompts). El adaptador forma parte de un estudio de imitación conductual denominado **dementor**, desarrollado por el grupo de investigación `dementor-research` y entrenado con la herramienta Tinker de Thinking Machines.

El adaptador tiene un tamaño de repositorio de 1,0 GB y está publicado en formato PEFT (safetensors). No se proporcionan datos sobre licencia, idiomas soportados, ni métricas de rendimiento. Su relevancia radica en ser un ejemplo de adaptación paramétrica eficiente (LoRA) para transferir el estilo de un modelo pequeño a uno más grande, aunque la ausencia de documentación detallada limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 1,0 GB en disco, pero el número exacto de parámetros no se indica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen/Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 32 y `target_modules=all-linear`, es decir, se aplican matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realiza mediante SFT (supervised fine-tuning) sobre un conjunto de datos de consignas de escritura (writing prompts), con el objetivo de replicar el comportamiento del modelo `aya-expanse-8b` (probablemente Cohere Aya Expanse 8B). El proceso se ejecuta con la herramienta Tinker de Thinking Machines, dentro de un estudio más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones para esta etapa. No se especifican detalles sobre el volumen de datos, la duración del entrenamiento ni el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto creativo: el adaptador está entrenado para producir respuestas que imiten el estilo de `aya-expanse-8b` ante consignas de escritura.
- Adaptación eficiente: al ser un adaptador LoRA, se puede cargar y descargar sobre el modelo base sin modificar los pesos originales.
- No se documentan capacidades adicionales como razonamiento, código, matemáticas, tool calling o soporte multilingüe. Estas dependerán del modelo base `Qwen/Qwen3.6-27B`, del cual no se dispone de información en esta ficha.

## Casos de uso

- Investigación en imitación conductual: el adaptador sirve como artefacto de estudio para analizar cómo un modelo grande puede imitar el comportamiento de uno más pequeño mediante LoRA.
- Experimentación con generación de texto creativo: puede utilizarse en entornos de investigación para comparar estilos de escritura entre modelos.
- Prototipado de asistentes de escritura: si el modelo base lo permite, el adaptador podría integrarse en aplicaciones de generación de historias o guiones, aunque no hay evidencia de su rendimiento real.
- Fine-tuning posterior: al ser un adaptador LoRA, puede servir como punto de partida para entrenamientos adicionales sobre tareas específicas.
- Evaluación de técnicas de adaptación: útil para comparar la eficacia de LoRA frente a otros métodos de ajuste en términos de calidad de imitación.
- No se recomienda su uso en producción sin una validación previa exhaustiva, dado que no se publican métricas ni casos de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,0 GB, pero para su uso es necesario cargar el modelo base `Qwen/Qwen3.6-27B`, cuyos requisitos de VRAM no se especifican en esta ficha.
- Para un modelo de 27B en precisión FP16 se estima un consumo de memoria de aproximadamente 54 GB, lo que requeriría GPUs de alta gama como A100 (80 GB) o H100 (80 GB). Con cuantización (por ejemplo, 8 bits o 4 bits) podría caber en GPUs de 24 GB como la RTX 4090, pero esto depende de la implementación y no está confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con bibliotecas como Transformers + PEFT, vLLM (si soporta LoRA), o llama.cpp si se convierte a GGUF. No se proporcionan instrucciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El adaptador es específico para el modelo base Qwen/Qwen3.6-27B y no se conocen alternativas equivalentes en el mismo contexto de imitación conductual.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que su uso comercial es incierto y requiere consulta con el autor.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma. Estas dependen del modelo base y del dataset de entrenamiento, que no se detalla.
- El adaptador está entrenado para imitar un modelo concreto (`aya-expanse-8b`) en tareas de escritura; su comportamiento fuera de ese dominio no está garantizado.
- La ausencia de benchmarks y documentación técnica impide evaluar su calidad y fiabilidad.
- El nombre del modelo base (`Qwen3.6-27B`) no corresponde a una versión pública conocida de Qwen, lo que podría indicar un modelo interno o una nomenclatura no estándar. Se recomienda verificar su disponibilidad antes de su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_aya-expanse-8b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
