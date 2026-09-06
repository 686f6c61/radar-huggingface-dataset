# NiuNiu0110/rst-qwen3.5-4b-nemo-sft

## Resumen

El modelo `rst-qwen3.5-4b-nemo-sft` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-4B`, desarrollado por `NiuNiu0110`. Se ha entrenado sobre el corpus `NiuNiu0110/Nemotron-Terminal-SFT-terminus`, que contiene trayectorias de terminal de Nemotron, dentro del pipeline "Recursive Synthesis for Long-Horizon Terminal Tasks" (RST-Train) alojado en `k1ssloo/RST-Train`.

La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo multimodal de tipo transformer (image-text-to-text) con 4.659.865.088 parámetros (~4.66B). El checkpoint es `global_step_480`, con pesos en `bfloat16` que ocupan 8.7 GB. La torre de visión se copia verbatim del modelo base, mientras que la pila de texto es la que se entrena.

El modelo está orientado a agentes que operan en entornos de terminal, un área de creciente interés para automatizar tareas de largo horizonte. Sin embargo, no se han publicado benchmarks ni evaluaciones, por lo que debe considerarse un artefacto de entrenamiento no probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration |
| Parametros totales | 4.659.865.088 (~4.66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Qwen/Qwen3.5-4B |
| Dataset de entrenamiento | NiuNiu0110/Nemotron-Terminal-SFT-terminus |
| Checkpoint | global_step_480 |
| Tamano del repo | 9.3 GB |

## Arquitectura y entrenamiento

La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo multimodal que procesa tanto imágenes como texto. El fine-tuning se realiza sobre el checkpoint `global_step_480`, usando el framework `verl` con `FSDP2`. El corpus de entrenamiento es `NiuNiu0110/Nemotron-Terminal-SFT-terminus`, pre-tokenizado una sola vez con la máscara de pérdida de Qwen3.5 incrustada en los datos, en lugar de recalcularla en cada backend, porque la tokenización separada y concatenación posterior no reproduce el renderizado de la conversación completa para esta plantilla.

Durante el entrenamiento solo se actualiza la pila de texto; la torre de visión (297 tensores) se copia sin cambios desde el modelo base. Los pesos se exportaron desde los shards de FSDP mediante el script `scripts/08_prepare_eval_ckpt.sh`, que fusiona todos los shards, vuelve a insertar la torre de visión y verifica que los pesos de texto realmente se movieron. No se menciona el uso de RLHF ni DPO; es un SFT convencional.

## Capacidades

- Generación de texto conversacional y procesamiento de imágenes (pipeline image-text-to-text).
- Orientado a tareas de terminal de largo horizonte: entrenado en trayectorias de terminal de Nemotron.
- Soporte de tool calling / function calling: no especificado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no especificado explícitamente, aunque el diseño para tareas de terminal sugiere un flujo de acciones y observaciones.
- Capacidades multilingües: no disponibles.
- Capacidad especial: el pipeline RST (Recursive Synthesis for Long-Horizon Terminal Tasks) está pensado para síntesis recursiva de acciones en entornos de terminal.

## Casos de uso

Basado en la información disponible, el modelo está diseñado para agentes que operan en terminales. Los casos de uso previstos son:

- Automatización de administración de sistemas: el modelo puede ejecutar comandos de shell, interpretar la salida y tomar decisiones en un entorno de terminal, reduciendo la intervención manual en tareas repetitivas.
- Asistente DevOps para pipelines de CI/CD: podría integrarse en flujos de despliegue para ejecutar pruebas, analizar logs y diagnosticar fallos en tiempo real.
- Soporte técnico con acceso a terminal: usar el modelo para guiar a usuarios en la resolución de problemas, ejecutando comandos de diagnóstico y explicando los resultados.
- Depuración asistida de código: el modelo puede navegar por repositorios, ejecutar scripts y analizar errores en un shell, ayudando a los desarrolladores a localizar fallos.
- Análisis de datos en servidores: procesar archivos, ejecutar consultas y generar informes directamente en el terminal, aprovechando la capacidad de manejar tareas largas.
- Automatización de tareas de seguridad en entornos controlados: en laboratorios de pentesting, el modelo podría ejecutar herramientas de reconocimiento y explotación, siempre bajo supervisión humana.
- Asistente de investigación para experimentos de agentes: el modelo sirve como base para probar el pipeline RST en tareas de terminal de largo horizonte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún benchmark contra este checkpoint, y que debe tratarse como un artefacto de entrenamiento no probado.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan 8.7 GB, por lo que la inferencia en precisión completa requiere al menos 9-10 GB de VRAM, más el overhead del modelo y los caches. En la práctica, se recomienda una GPU con 16 GB o más.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) o superiores. En GPUs con menos de 12 GB, la inferencia en bfloat16 no es viable sin cuantización, y no se proporcionan pesos cuantizados.
- Cabe en consumer GPU: sí, en GPUs de gama alta con 16-24 GB (por ejemplo, RTX 4080/4090), siempre que no se usen contextos muy largos.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`; también es compatible con HuggingFace Inference Endpoints (tag `endpoints_compatible`). No se mencionan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rst-qwen3.5-4b-nemo-sft | ~4.66B | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | ~4.66B | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B-Instruct | ~4.66B | no disponible | Apache-2.0 | HuggingFace |

No se dispone de benchmarks comparativos. El modelo base es la referencia natural, sin el fine-tuning específico para terminal. Otras alternativas de la misma categoría (agentes terminales) no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- Sin benchmarks: no se ha evaluado el rendimiento, por lo que no se puede garantizar su calidad en ninguna tarea.
- Riesgo de pesos incompletos: el proceso de exportación desde FSDP shards puede producir un modelo cargable pero parcialmente sin entrenar si falta algún shard; el autor advierte de este riesgo.
- Torre de visión no entrenada: la parte visual se copia del modelo base y no se ha ajustado durante el SFT, por lo que su comportamiento en tareas de terminal con imágenes es desconocido.
- Sesgos del modelo base: al heredar de Qwen/Qwen3.5-4B, puede arrastrar sesgos presentes en el modelo base y en el dataset de trayectorias de terminal.
- Riesgo de alucinación: al no haber evaluaciones, el riesgo de alucinaciones en comandos o salidas es desconocido y potencialmente alto.
- Licencia: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario revisar las restricciones del modelo base y del dataset.
- Sin soporte de cuantizaciones: solo se proporcionan pesos en bfloat16, lo que limita su despliegue en hardware con poca VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NiuNiu0110/rst-qwen3.5-4b-nemo-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/Nemotron-Terminal-SFT-terminus
- Repositorio del pipeline RST-Train: https://github.com/k1ssloo/RST-Train
- Documentación de Qwen3.5 en NVIDIA NeMo (contexto general): https://docs.nvidia.com/nemo/automodel/model-coverage/vision-language-models/qwen/qwen3-5-vl
- Guía de Qwen3 en NeMo Framework (contexto general): https://docs.nvidia.com/nemo-framework/user-guide/25.09/llms/qwen3.html
