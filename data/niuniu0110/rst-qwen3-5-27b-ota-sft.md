# NiuNiu0110/rst-qwen3.5-27b-ota-sft

## Resumen

El modelo `NiuNiu0110/rst-qwen3.5-27b-ota-sft` es un fine-tuning supervisado (SFT) del modelo `Qwen/Qwen3.5-27B`, desarrollado por `NiuNiu0110` como parte del pipeline *Recursive Synthesis for Long-Horizon Terminal Tasks* (RST-Train). El objetivo es especializar el modelo base en tareas de agente de terminal de largo horizonte, es decir, en la ejecución de secuencias de comandos y razonamiento sobre entornos de shell. El entrenamiento se realizó sobre el dataset `NiuNiu0110/OpenThoughts-Agent-v1-SFT-terminus`, un corpus pre-tokenizado con máscaras de pérdida calculadas de antemano.

Se trata de un modelo multimodal de tipo *image-text-to-text*, con arquitectura `Qwen3_5ForConditionalGeneration`. El checkpoint contiene 27.781.427.952 parámetros totales y un peso de 51,7 GB en `bfloat16`. La torre de visión se copió íntegramente del modelo base, ya que el entrenamiento solo actualizó el stack de texto. No se han publicado resultados de benchmarks ni se ha evaluado el modelo, por lo que debe tratarse como un artefacto experimental sin validar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration |
| Parametros totales | 27.781.427.952 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `Qwen/Qwen3.5-27B`, que emplea una arquitectura de transformer multimodal con torre de visión, registrada como `Qwen3_5ForConditionalGeneration`. El entrenamiento se llevó a cabo con `verl` y `FSDP2` sobre un corpus pre-tokenizado. La particularidad técnica es que la máscara de pérdida de Qwen3.5 se horneó en los datos una sola vez mediante el script `scripts/15_export_pretokenized.py`, en lugar de recalcularla por backend, porque la tokenización separada y posterior concatenación no reproduce correctamente el renderizado de la conversación completa para esta plantilla.

El checkpoint exportado es el paso final de la ejecución. Los pesos se obtuvieron fusionando los shards de FSDP mediante `scripts/08_prepare_eval_ckpt.sh`, que también inserta la torre de visión copiada del modelo base (el entrenamiento solo actualiza el stack de texto) y verifica que los pesos de texto realmente se movieron. Esta verificación es crítica porque una fusión sobre un shard ausente produce un modelo cargable pero parcialmente sin entrenar, y una fusión que reproduce el base es indistinguible de un éxito sin esa comprobación.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo base Qwen3.5-27B, aunque no se han verificado con benchmarks.
- Procesamiento de imágenes: al incluir una torre de visión copiada del modelo base, acepta entradas de imagen-texto.
- Tareas de agente en terminal: entrenado específicamente en el dataset `OpenThoughts-Agent-v1-SFT-terminus` para tareas agénticas de largo horizonte en entornos de terminal.
- Conversación multi-turno: el pipeline es de tipo *image-text-to-text* y el entrenamiento SFT se realizó sobre conversaciones.
- No se documenta soporte explícito de *tool calling* ni *function calling* en la información disponible.
- No se han publicado resultados de benchmarks que confirmen capacidades específicas.

## Casos de uso

- Automatización de operaciones en servidores: el modelo puede interpretar instrucciones en lenguaje natural y ejecutar secuencias de comandos en un entorno de terminal, gracias a su entrenamiento en tareas agénticas de largo horizonte.
- Asistente de DevOps: puede ayudar a diagnosticar problemas a partir de capturas de pantalla de consolas o logs, combinando su capacidad de visión con el razonamiento sobre comandos de shell.
- Mantenimiento de sistemas: tareas como limpieza de archivos, gestión de procesos o monitorización de recursos, donde se requiere razonamiento multi-paso y ejecución de comandos.
- Análisis de capturas de pantalla para soporte técnico: al ser multimodal, puede recibir una imagen de un error y generar una secuencia de comandos para intentar solucionarlo.
- Integración en pipelines de CI/CD: podría ejecutar tareas de build, test o despliegue, aunque no se documenta un mecanismo formal de *tool calling*.
- Educación y formación en línea de comandos: como asistente que explica y ejecuta comandos en un entorno controlado, útil para entornos de aprendizaje interactivo.
- Investigación en agentes: sirve como base para experimentos de fine-tuning adicionales (por ejemplo, DPO o RL), dado que el pipeline RST-Train incluye etapas posteriores de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre este checkpoint, por lo que no existe ninguna puntuación que citar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en `bfloat16` ocupan 51,7 GB, por lo que se recomienda al menos 80 GB de VRAM para acomodar pesos, activaciones y caché KV.
- GPU recomendadas: una A100 80GB o H100 80GB es adecuada; también es posible usar varias GPUs con *tensor parallelism*.
- GPUs de consumo: una RTX 4090 de 24 GB no es suficiente sin cuantización. No se ofrecen cuantizaciones publicadas, por lo que se requeriría ejecución en CPU o sharding entre múltiples GPUs.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la vía documentada; también podría utilizarse vLLM o TGI si se confirma compatibilidad, aunque no se menciona en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos similares. El modelo es un fine-tuning de `Qwen/Qwen3.5-27B`, pero no se han publicado benchmarks ni especificaciones detalladas de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ningún benchmark: el modelo es un artefacto sin validar de una ejecución de entrenamiento.
- Riesgo de alucinación y sesgos no evaluados: al no haber pruebas, no se puede garantizar fiabilidad en ningún escenario.
- La torre de visión se copió del modelo base y no fue entrenada, por lo que su comportamiento en tareas de imagen puede diferir del stack de texto.
- El proceso de exportación desde shards de FSDP requiere verificación; si la fusión falla silenciosamente, el modelo podría estar parcialmente sin entrenar.
- Limitaciones de contexto y soporte de idiomas no documentados.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de validación hace desaconsejable su uso en producción sin pruebas previas.

## Enlaces

- HuggingFace: https://huggingface.co/NiuNiu0110/rst-qwen3.5-27b-ota-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/OpenThoughts-Agent-v1-SFT-terminus
- Repositorio RST-Train: https://github.com/k1ssloo/RST-Train
- Dataset relacionado RST-DPO (referencia): https://huggingface.co/datasets/NiuNiu0110/RST-DPO-Qwen3.5-27B
- Paper relacionado (arXiv:2608.05466): no se proporciona URL directa en la información disponible.
