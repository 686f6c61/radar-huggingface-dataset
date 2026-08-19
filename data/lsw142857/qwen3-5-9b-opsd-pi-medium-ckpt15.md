# LSW142857/Qwen3.5-9B-OPSD-PI-Medium-ckpt15

## Resumen

El modelo `LSW142857/Qwen3.5-9B-OPSD-PI-Medium-ckpt15` es un fine-tuning del modelo base `Qwen/Qwen3.5-9B` (9.650 millones de parámetros) realizado mediante la fusión de un adaptador LoRA entrenado con la técnica OPSD (Offline Policy Search and Distillation) y el uso de información privilegiada (privileged information, PI). El autor, LSW142857, ha publicado este checkpoint como parte de una serie de experimentos orientados a mejorar las capacidades de agentes de codificación en entornos tipo SWE-bench. El modelo resultante es autocontenido: los cuatro shards de safetensors incluyen tanto el modelo base como el adaptador fusionado, por lo que no requiere descargar el modelo original por separado.

La relevancia de este modelo radica en su enfoque de entrenamiento: utiliza 512 trayectorias de agentes de codificación con información privilegiada distribuida por etapas (EXPLORE, REPRODUCE, DIAGNOSE, EDIT, VERIFY), mientras que la etapa SUBMIT queda excluida de la pérdida de destilación. Esto busca que el agente aprenda a razonar y editar código de forma más robusta, sin depender de la señal de éxito final. Aunque el pipeline declarado es `image-text-to-text` (por ser Qwen3.5 un modelo multimodal), este checkpoint concreto está orientado a tareas de texto y agentes de codificación. El modelo se publica bajo licencia Apache 2.0 y está disponible en Hugging Face con formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B, sin dato publicado en la ficha) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors con precisión completa; no se mencionan cuantizaciones) |
| Idiomas soportados | no disponible (no se especifican en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-9B, un transformer denso de 9.650 millones de parámetros. Sobre esta base se ha entrenado un adaptador LoRA con rango 64 y alpha 128 (relación 2.0), que posteriormente se ha fusionado con el modelo base. El entrenamiento emplea la metodología OPSD con información privilegiada (PI) adaptada por etapas. En concreto, se utilizaron 512 trayectorias de agentes de codificación, donde la PI se aplicó de forma selectiva a las fases de exploración, reproducción, diagnóstico, edición y verificación, mientras que la fase de envío (SUBMIT) se mantuvo ejecutable pero se enmascaró en la pérdida de destilación. Esto implica que el modelo aprende a mejorar su proceso interno de razonamiento y acción sin optimizar directamente la señal de éxito final.

El entrenamiento se realizó en 16 actualizaciones efectivas (numeradas de 0 a 15). El checkpoint 15 es idéntico en pesos al checkpoint 23 de la nomenclatura heredada. La model card advierte que los parámetros MTP (Multi-Token Prediction) de entrenamiento no forman parte del adaptador LoRA, por lo que para la evaluación reportada se debe usar decodificación de modelo objetivo (con decodificación especulativa desactivada). No se proporcionan detalles sobre el dataset exacto, el número de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tuning de Qwen3.5-9B, conserva las capacidades generales de lenguaje del modelo base, aunque el entrenamiento se ha centrado en tareas de codificación.
- Razonamiento multi-paso para agentes de codificación: el entrenamiento con información privilegiada por etapas busca mejorar la capacidad del modelo para explorar, reproducir, diagnosticar, editar y verificar código en entornos tipo SWE-bench.
- Edición de código: el modelo está diseñado para producir ediciones de código en repositorios, siguiendo el flujo de un agente.
- Soporte de tool calling: no se menciona explícitamente, pero Qwen3.5-9B incluye capacidades de llamada a herramientas; este checkpoint podría heredarlas, aunque no está confirmado.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, pero la model card indica que el modelo está destinado a la evaluación de agentes de codificación en texto. No se documentan capacidades de visión específicas para este checkpoint.
- Multilingüismo: no se especifican idiomas; se asume herencia del modelo base, pero no está confirmado.

## Casos de uso

- Evaluación de agentes de codificación en benchmarks tipo SWE-bench: el modelo se ha entrenado específicamente para este escenario, por lo que puede usarse como base para sistemas que resuelven issues de GitHub de forma autónoma.
- Automatización de corrección de bugs: un agente que recibe un repositorio y una descripción de un fallo puede usar el modelo para diagnosticar la causa raíz y generar un parche.
- Asistente de desarrollo con razonamiento paso a paso: el modelo puede integrarse en IDE o herramientas de línea de comandos para sugerir ediciones de código con explicaciones intermedias.
- Pipeline de CI/CD con revisión de código: dado su entrenamiento en etapas de verificación, puede emplearse para validar cambios propuestos antes de su integración.
- Investigación en aprendizaje por refuerzo para agentes: el enfoque OPSD con información privilegiada es reproducible y el checkpoint sirve como punto de partida para experimentos académicos.
- Fine-tuning posterior: al estar fusionado con el modelo base, puede servir como base para nuevos entrenamientos con LoRA u otras técnicas de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros. Tampoco se comparan con otros modelos. Se recomienda consultar el repositorio del autor o el blog de Qwen para obtener datos de rendimiento del modelo base, pero no hay cifras específicas para este checkpoint.

## Requisitos de hardware

- VRAM estimada: para inferencia en precisión fp16/bf16, un modelo de 9,65 B parámetros requiere aproximadamente 19-20 GB de VRAM (sin cuantización). Con cuantización a 8 bits se puede reducir a ~10 GB, y a 4 bits a ~5-6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para ejecución en fp16, una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, L4) es adecuada. Para mayor velocidad, A100 (40 GB) o H100.
- En consumer GPU: sí, cabe en una RTX 4090 (24 GB) con precisión fp16 o bf16, siempre que se gestione la memoria. Con cuantización 4 bits podría ejecutarse en GPUs de 8-12 GB, pero no se ofrecen archivos cuantizados.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se genera un Modelfile). La model card recomienda usar decodificación de modelo objetivo (sin decodificación especulativa) para la evaluación reportada.
- Latencia y throughput: no se dispone de datos medidos para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares de la misma categoría (por ejemplo, otros fine-tunings de Qwen3.5-9B para agentes de codificación). El autor ha publicado otros checkpoints de la misma familia (Strong, LoRA iter32, ckpt23), pero no se aportan métricas comparativas. Se recomienda consultar el repositorio del autor para más detalles.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinaciones o robustez para este checkpoint concreto.
- El entrenamiento se ha realizado sobre un conjunto limitado de trayectorias (512), lo que puede limitar la generalización a problemas de codificación muy diversos.
- La información privilegiada (PI) se utiliza durante el entrenamiento, pero en inferencia el modelo no dispone de esa información; esto puede causar una brecha de distribución si no se maneja adecuadamente.
- La model card indica que los parámetros MTP no están incluidos en el adaptador; usar decodificación especulativa puede dar resultados inconsistentes con la evaluación reportada.
- No se especifican restricciones adicionales más allá de la licencia Apache 2.0, que permite uso comercial, pero se debe verificar el cumplimiento de las condiciones del modelo base Qwen3.5-9B.
- El modelo está pensado para tareas de texto; aunque el pipeline declare `image-text-to-text`, no se ha validado su comportamiento con entradas visuales en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-PI-Medium-ckpt15
- Checkpoint Strong (variante): https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-PI-Strong-ckpt15
- Adaptador LoRA iter32: https://huggingface.co/LSW142857/OPSD-Qwen3.5-9B-LoRA-iter32
- Checkpoint ckpt23 (equivalente en pesos): https://friendli.ai/models/LSW142857/Qwen3.5-9B-OPSD-PI-Medium-ckpt23
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
