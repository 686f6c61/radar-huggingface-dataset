# Saraswathy/vlm-cap-perception-step80-resume

## Resumen

Este repositorio contiene un checkpoint de reanudación de entrenamiento (resume checkpoint) del proyecto VLM-CapCurriculum, desarrollado por el equipo UCSC-VLAA (Universidad de California, Santa Cruz). Se trata de un artefacto intermedio del entrenamiento de un adaptador LoRA de rango 1 sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, en su etapa de percepción visual (`capability_perception`). El checkpoint se publicó en el paso global 80 y está diseñado para continuar el entrenamiento hasta el paso 100, no como un modelo fusionado listo para inferencia.

El proyecto VLM-CapCurriculum descompone el post-entrenamiento de un VLM en tres etapas de capacidad (percepción, razonamiento textual, razonamiento visual) y demuestra que una percepción mejorada reduce la longitud de las cadenas de razonamiento necesarias en tareas visuales. Este checkpoint forma parte de esa metodología, enfocado en la primera etapa. No es un modelo autónomo: requiere el modelo base y el adaptador LoRA para cualquier uso posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 1) sobre Qwen/Qwen3-VL-4B-Instruct (VLM multimodal) |
| Parametros totales | No disponible (el adaptador LoRA de rango 1 añade una fracción mínima; el modelo base tiene 4B) |
| Parametros activos | No disponible (MoE no aplica) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-4B-Instruct, típicamente 32k tokens) |
| Tipos de cuantizacion | No disponible (el checkpoint contiene shards FSDP y adaptador LoRA en safetensors) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (shards FSDP + adaptador LoRA) |

## Arquitectura y entrenamiento

El checkpoint es un artefacto de entrenamiento, no un modelo standalone. Contiene shards de modelo y optimizador FSDP, estado del dataloader, archivos de tokenizer/processor y un adaptador LoRA bajo `actor/lora_adapter/`. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) según el proyecto VLM-CapCurriculum, y este checkpoint corresponde a la etapa de percepción visual del curriculum. El adaptador tiene rango 1, lo que indica un ajuste de bajo rango sobre las capas del modelo base. El proyecto reporta que sobre Qwen3-VL-8B la percepción mejorada produce +1.46% de precisión con cadenas de razonamiento un 20.8% más cortas, aunque este checkpoint es para la versión de 4B.

No se dispone de información sobre el conjunto de datos exacto, el número total de tokens, ni las técnicas de alineación adicionales (RLHF/DPO) más allá del método GRPO mencionado.

## Capacidades

- Al ser un checkpoint de entrenamiento, no es un modelo listo para inferencia. Las capacidades funcionales son las del modelo base Qwen3-VL-4B-Instruct (comprensión de imágenes y texto, generación de texto).
- El adaptador LoRA, una vez fusionado, puede mejorar la percepción visual del modelo base, aunque su impacto específico no está cuantificado en la información disponible.
- No se puede evaluar el soporte de tool calling, agentes, ni capacidades multilingües sin fusionar y probar el modelo resultante.

## Casos de uso

- Continuación del entrenamiento: el uso principal es reanudar el entrenamiento desde el paso 80 hasta el paso 100, verificando antes la integridad de los archivos con `SHA256SUMS.json`.
- Investigación sobre curriculum de post-entrenamiento: este checkpoint sirve como evidencia del proceso de entrenamiento en la etapa de percepción visual, útil para reproducir experimentos del proyecto VLM-CapCurriculum.
- Desarrollo de adaptadores LoRA para VLM: permite estudiar el efecto de un adaptador de rango 1 en la percepción visual sobre Qwen3-VL-4B-Instruct.
- Evaluación de la metodología de percepción previa al razonamiento: el checkpoint puede fusionarse con el modelo base para probar si la etapa de percepción mejora el rendimiento en tareas de razonamiento visual.
- Reproducción de experimentos: investigadores pueden usar este checkpoint para replicar los resultados del paper de ICML 2026 y comparar con sus propios entrenamientos.
- Base para análisis de estabilidad de entrenamiento: al ser un checkpoint de reanudación, permite estudiar la evolución de la pérdida y las métricas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. El proyecto VLM-CapCurriculum menciona mejoras en precisión y longitud de razonamiento para la versión de 8B, pero este checkpoint específico (4B, paso 80) no incluye métricas cuantitativas en su model card.

## Requisitos de hardware

- El checkpoint es para entrenamiento, no para inferencia. Para reanudar el entrenamiento se necesita hardware con suficiente VRAM para el modelo base de 4B con FSDP.
- Se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) para entrenar con FSDP y rango 1, aunque el tamaño de la batch y la secuencia pueden requerir más.
- Para inferencia tras fusionar el adaptador, se puede usar vLLM, llama.cpp o Hugging Face Transformers con el modelo base Qwen3-VL-4B-Instruct.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos. Al ser un artefacto de entrenamiento, no es comparable con modelos listos para usar. Se puede mencionar que el modelo base Qwen3-VL-4B-Instruct es una alternativa directa para tareas de visión-lenguaje, pero el checkpoint no añade capacidades funcionales sin fusionar.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base Qwen/Qwen3-VL-4B-Instruct para cualquier uso posterior.
- El entrenamiento estaba inacabado en el momento de la subida; el proyecto continúa hasta el paso 100.
- No hay licencia declarada para el checkpoint, por lo que no se puede asumir permisos de uso comercial sin consultar al autor.
- No se han documentado sesgos ni riesgos de alucinación específicos para este checkpoint.
- Para producción, es necesario fusionar el adaptador LoRA con el modelo base y evaluar el rendimiento en el dominio objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Saraswathy/vlm-cap-perception-step80-resume)
- [Proyecto VLM-CapCurriculum](https://ucsc-vlaa.github.io/VLM-CapCurriculum/)
- [Colección de modelos VLM-CapCurriculum](https://huggingface.co/collections/UCSC-VLAA/vlm-capcurriculum)
- [Repositorio GitHub del proyecto](https://github.com/UCSC-VLAA/VLM-CapCurriculum)
- [Perfil del autor](https://saraamjith.com/saraamjith.html)
