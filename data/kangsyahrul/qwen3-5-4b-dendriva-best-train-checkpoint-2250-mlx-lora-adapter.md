# kangsyahrul/qwen3.5-4b-dendriva-best-train-checkpoint-2250-mlx-lora-adapter

## Resumen

Este repositorio contiene un adaptador LoRA en formato MLX, resultado de la conversión de un checkpoint de entrenamiento del proyecto Dendriva sobre el modelo base `unsloth/Qwen3.5-4B`. El autor, kangsyahrul, ha publicado únicamente los pesos del adaptador, no el modelo completo, y está orientado a su uso en Apple Silicon mediante la librería `mlx-lm` y el entorno Unsloth Desktop.

El adaptador se seleccionó como el mejor checkpoint disponible hasta el paso 2250 según el criterio de menor pérdida media de entrenamiento en una ventana de 50 pasos, con un valor de 0,1974. Los pesos se almacenan en precisión FP32 y no han sido cuantizados ni fusionados con el modelo base. La relevancia de esta publicación radica en ofrecer un adaptador listo para cargar en MLX, evitando al usuario la conversión manual desde formatos PEFT.

Dado que se trata de un adaptador y no de un modelo autónomo, las capacidades finales dependen completamente del modelo base `Qwen3.5-4B`, del cual no se proporcionan especificaciones detalladas en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `unsloth/Qwen3.5-4B` (arquitectura del base no disponible) |
| Parametros totales | no disponible (el adaptador ocupa 0,3 GB en FP32) |
| Parametros activos | no disponible (adaptador, no modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | FP32 (sin cuantizacion) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapters.safetensors), junto con adapter_config.json, selection.json y SHA256SUMS |

## Arquitectura y entrenamiento

El adaptador LoRA se entrenó mediante Unsloth/PEFT sobre el modelo base `unsloth/Qwen3.5-4B`. Según la configuración incluida, el rango (rank) es 32, el alpha es 64 (con escala MLX de 2) y el dropout es 0. Las capas objetivo incluyen las proyecciones Q, K, V y O de todas las capas de atención completa, así como las proyecciones gate, up y down de las capas MLP en las 32 capas del modelo.

El checkpoint seleccionado corresponde al paso 2250, con una pérdida media de entrenamiento (ventana de 50 pasos) de 0,1974 y una pérdida mínima de 0,1469 alcanzada en el paso 2226. La época en ese punto era 1,0397. La conversión a MLX transpuso las matrices `lora_A` y `lora_B` de PEFT al formato `lora_a` y `lora_b` de MLX, sin aplicar cuantización de 4 bits ni fusión con el modelo base. No se dispone de información sobre el dataset de entrenamiento (proyecto Dendriva) ni sobre el proceso de alineación (RLHF, DPO, etc.).

## Capacidades

- Adaptador LoRA para generación de texto, diseñado para ser cargado sobre el modelo base `unsloth/Qwen3.5-4B` mediante `mlx-lm`.
- Compatible con Unsloth Desktop, que utiliza `mlx-vlm` para la carga y ejecución.
- Los pesos están en FP32, lo que facilita su integración en entornos de desarrollo en Apple Silicon.
- No se dispone de información específica sobre capacidades adicionales (tool calling, razonamiento, multilingüismo, etc.) del adaptador o del modelo base.

## Casos de uso

- Ajuste fino de modelos de lenguaje en Apple Silicon: el adaptador puede cargarse sobre el modelo base para realizar tareas de generación de texto específicas del dominio Dendriva, aunque no se documenta el dominio concreto.
- Experimentación con LoRA en MLX: sirve como ejemplo de conversión de checkpoints PEFT a MLX, útil para desarrolladores que trabajan con `mlx-lm` y desean replicar el flujo.
- Evaluación de estrategias de selección de checkpoints: el repositorio incluye `selection.json` con métricas de pérdida, lo que permite analizar el criterio de selección empleado.
- Integración en pipelines de Unsloth Desktop: el adaptador está preparado para descargarse y ejecutarse directamente en esa herramienta, facilitando pruebas rápidas.
- Investigación sobre adaptadores de bajo rango: el uso de rank 32 y alpha 64 puede compararse con otras configuraciones para estudiar el equilibrio entre capacidad y eficiencia.
- Migración de pesos entre frameworks: el proceso de transposición documentado en el README puede servir de guía para convertir adaptadores PEFT a MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Adaptador: requiere un Mac con chip Apple Silicon (M1 o superior) para ejecutar MLX.
- El adaptador ocupa 0,3 GB en disco, pero el modelo base `unsloth/Qwen3.5-4B` debe descargarse por separado y sus requisitos de memoria no se especifican en esta ficha.
- Opciones de despliegue: `mlx-lm` y Unsloth Desktop (que usa `mlx-vlm`).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. Al ser un adaptador LoRA específico para un modelo base no documentado en detalle, no se pueden establecer comparaciones fiables con otras alternativas.

## Limitaciones y advertencias

- El repositorio contiene únicamente el adaptador; sin el modelo base `unsloth/Qwen3.5-4B` no es funcional.
- No se dispone de licencia declarada, por lo que su uso comercial es incierto.
- No se han documentado sesgos, riesgos de alucinación o limitaciones idiomáticas del adaptador o del modelo base.
- Los pesos están en FP32, lo que puede aumentar el consumo de memoria en comparación con versiones cuantizadas.
- El modelo base `Qwen3.5-4B` no es una versión oficial conocida de la familia Qwen, por lo que su procedencia y fiabilidad deben verificarse antes de su uso en producción.

## Enlaces

- [Repositorio del adaptador en HuggingFace](https://huggingface.co/kangsyahrul/qwen3.5-4b-dendriva-best-train-checkpoint-2250-mlx-lora-adapter)
- [Modelo base unsloth/Qwen3.5-4B](https://huggingface.co/unsloth/Qwen3.5-4B) (no verificado)
