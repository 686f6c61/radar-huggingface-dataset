# Saraswathy/vlm-mix-resume-nongeo30-tables70-step70

## Resumen

Saraswathy/vlm-mix-resume-nongeo30-tables70-step70 es un checkpoint de reanudación de entrenamiento (training resume) completo, creado por el usuario Saraswathy, que contiene el estado completo del proceso de entrenamiento con EasyR1 en el paso 70. Este repositorio no es un modelo independiente ni fusionado, sino un conjunto de artefactos que incluyen los shards del modelo FSDP, el estado del optimizador, el estado del dataloader y el adaptador LoRA, todo ello basado en el modelo base `Qwen/Qwen3-VL-4B-Instruct`.

El propósito de este repositorio es permitir a otros investigadores reanudar el entrenamiento desde el punto exacto en el que se detuvo, verificando la integridad de los archivos mediante `SHA256SUMS.json`. El nombre del repositorio sugiere que el entrenamiento combina un 30 % de datos no geométricos con un 70 % de datos de tablas, lo que indica un enfoque en la comprensión de imágenes con contenido tabular.

La relevancia de este repositorio reside en su utilidad para la reproducibilidad en investigación: cualquier equipo que desee continuar el entrenamiento de un VLM (Vision-Language Model) sobre Qwen3-VL-4B-Instruct con datos mixtos de tablas puede usar estos artefactos. Sin embargo, no es directamente utilizable para inferencia sin un paso previo de fusión del adaptador con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) basado en Qwen3-VL-4B-Instruct |
| Parametros totales | 4.000 millones (4B) en el modelo base; el adaptador LoRA anade un numero no especificado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (repositorio contiene pesos en formato safetensors, sin cuantizacion explicita) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-VL-4B-Instruct) |
| Licencia | no disponible |
| Formato de pesos | safetensors, con shards FSDP y adaptador LoRA (libreria PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene un checkpoint de reanudacion del framework EasyR1, que incluye los shards de modelo y optimizador de FSDP (Fully Sharded Data Parallel), el estado del dataloader, el estado extra y el adaptador LoRA. El modelo base es `Qwen/Qwen3-VL-4B-Instruct`, un VLM multimodal de 4B parametros que combina un codificador visual con un transformer de lenguaje.

El nombre del repositorio indica que la mezcla de datos de entrenamiento es 30 % datos no geometricos y 70 % datos de tablas. No se proporcionan detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO. El entrenamiento se realizo con el framework EasyR1, que es un sistema de entrenamiento de refuerzo para modelos de lenguaje y vision-lenguaje, pero no se especifica si se utilizaron recompensas GRPO u otras tecnicas de RL.

## Capacidades

- El modelo hereda las capacidades del modelo base Qwen3-VL-4B-Instruct: comprension de imagenes y texto, generacion de texto, razonamiento visual.
- El entrenamiento especifico se ha enfocado en mejorar la capacidad de procesar tablas (70 % de los datos) y datos no geometricos (30 %).
- No se puede utilizar directamente para inferencia sin fusionar el adaptador LoRA con el modelo base.
- No hay informacion sobre soporte de tool calling, function calling, agentes o thinking mode en este repositorio especifico.

## Casos de uso

- **Investigacion en aprendizaje por refuerzo para VLM**: el checkpoint permite a otros investigadores reanudar el entrenamiento exactamente donde se detuvo, para experimentar con hiperparametros, datos o tecnicas de RL.
- **Desarrollo de modelos de comprension de tablas**: el entrenamiento con 70 % de datos de tablas sugiere que el modelo final (una vez fusionado) podria usarse para extraer informacion de imagenes con tablas.
- **Reproduccion de experimentos**: los shards FSDP y el estado del dataloader permiten reproducir el experimento exacto, lo cual es critico para verificar resultados publicados.
- **Aprendizaje de workflows de entrenamiento**: el repositorio sirve como ejemplo de como estructurar un checkpoint de reanudacion con EasyR1 y PEFT.
- **Fusion de adaptadores**: un investigador puede tomar el adaptador LoRA y fusionarlo con el modelo base Qwen3-VL-4B-Instruct para obtener un modelo completo y usarlo en tareas de VQA (Visual Question Answering) con tablas.
- **Benchmarking de tecnicas de RL**: al tener el estado del entrenamiento en el paso 70, se puede comparar el rendimiento del modelo en diferentes pasos del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de rendimiento, ni tablas de resultados comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dependera del modelo base Qwen3-VL-4B-Instruct y de la cuantizacion utilizada. En FP16, un modelo de 4B parametros requiere aproximadamente 8 GB de VRAM solo para los pesos, mas el espacio para el optimizador y los gradientes durante el entrenamiento.
- **GPU recomendadas**: para reanudar el entrenamiento, se recomienda al menos una GPU con 24 GB de VRAM (RTX 3090/4090) o superior. Para FSDP, se recomienda un nodo con multiples GPUs (A100/H100) si se usa la configuracion original.
- **Uso en consumer GPU**: si se fusiona el adaptador LoRA con el modelo base, la inferencia puede ejecutarse en una RTX 4090 (24 GB) con cuantizacion FP16 o int8. Sin embargo, el repositorio actual no es para inferencia directa.
- **Opciones de despliegue**: una vez fusionado, se puede desplegar con vLLM, llama.cpp, Ollama o TGI, pero no hay instrucciones especificas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-nongeo30-tables70-step70 | 4B (base) | no disponible | no disponible | Checkpoint de entrenamiento |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | Apache 2.0 | Modelo base, inferencia directa |
| Saraswathy/vlm-mix-nongeo-expert-step100 | 4B (base) | no disponible | no disponible | Checkpoint similar, paso 100 |
| Saraswathy/vlm-mix-broader-stem-expert-step100 | 4B (base) | no disponible | no disponible | Checkpoint similar, paso 100, datos STEM |

Los tres repositorios de Saraswathy son checkpoints de entrenamiento con la misma base. La diferencia radica en el paso de entrenamiento y en la composicion de los datos. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- **No es un modelo funcional**: este repositorio no contiene un modelo fusionado. Intentar cargarlo directamente en un pipeline de inferencia fallara. Es necesario fusionar el adaptador LoRA con el modelo base Qwen3-VL-4B-Instruct.
- **Sin informacion de licencia**: la licencia del adaptador no esta especificada. El modelo base Qwen3-VL-4B-Instruct tiene licencia Apache 2.0, pero el adaptador puede tener restricciones adicionales.
- **Riesgo de sobreajuste**: el entrenamiento esta orientado a tablas y datos no geometricos; el modelo puede tener un rendimiento degradado en otros tipos de datos visuales.
- **Sin evaluacion publicada**: no hay benchmarks que demuestren que el entrenamiento mejora el rendimiento. El uso en produccion no esta justificado sin evaluacion previa.
- **Alucinaciones visuales**: como cualquier VLM, el modelo puede alucinar contenido de imagenes o tablas, especialmente si se usa fuera de su dominio de entrenamiento.
- **Verificacion de integridad**: es imprescindible verificar los archivos contra `SHA256SUMS.json` antes de reanudar el entrenamiento para evitar corrupcion de datos.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Saraswathy/vlm-mix-resume-nongeo30-tables70-step70)
- [Checkpoint relacionado: vlm-mix-nongeo-expert-step100](https://huggingface.co/Saraswathy/vlm-mix-nongeo-expert-step100)
- [Checkpoint relacionado: vlm-mix-broader-stem-expert-step100](https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100)
- [Pagina personal de la autora](https://saraamjith.com/saraamjith.html) (menciona investigacion en VLM y GRPO)
