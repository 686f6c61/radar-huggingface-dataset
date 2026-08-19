# barbonara/corin-nemotron-super-neutral-sft

## Resumen

El repositorio `barbonara/corin-nemotron-super-neutral-sft` contiene un adaptador LoRA exportado desde la plataforma Tinker, diseñado para ser combinado con el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. Este modelo base es un Mixture-of-Experts (MoE) híbrido Mamba-Transformer de 120 mil millones de parámetros totales con 12 mil millones activos, desarrollado por NVIDIA para aplicaciones de IA agéntica, con capacidades destacadas en razonamiento, código, matemáticas y tool calling. El adaptador, de solo 3.6 GB, ha sido entrenado mediante fine-tuning supervisado (SFT) con un enfoque "neutral", aunque no se proporcionan detalles sobre el conjunto de datos ni el proceso de entrenamiento.

La relevancia de este adaptador radica en su potencial para ajustar el comportamiento del modelo base sin necesidad de reentrenarlo por completo, aprovechando la eficiencia de los adaptadores LoRA. Sin embargo, la falta de documentación, licencia y métricas de rendimiento limita su uso en entornos de producción sin una evaluación previa exhaustiva. Es un ejemplo de la tendencia creciente de compartir adaptadores ligeros sobre modelos de gran tamaño, facilitando la personalización con recursos computacionales moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base NVIDIA-Nemotron-3-Super-120B-A12B-BF16 (MoE híbrido Mamba-Transformer) |
| Parametros totales | No especificado (adaptador de 3.6 GB en safetensors) |
| Parametros activos | 12B activos en el modelo base (adaptador LoRA rank 8) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base se preentrenó en NVFP4, pero el adaptador se publica en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo NVIDIA Nemotron 3 Super, una arquitectura MoE híbrida que combina capas Mamba (state space) con capas Transformer, incorporando Latent MoE y capas de predicción multi-token (MTP). El modelo base fue preentrenado en formato NVFP4 y está optimizado para inferencia de alto rendimiento en una sola GPU de datacenter. El adaptador LoRA tiene un rango de 8 y se entrenó únicamente sobre las proyecciones de atención y las capas MLP, excluyendo la capa de unembedding, según la información de la model card. El entrenamiento se realizó mediante fine-tuning supervisado (SFT), como sugiere el nombre "neutral-sft", aunque no se especifican los datos utilizados ni el procedimiento exacto. La exportación se realizó desde Tinker, una plataforma de entrenamiento distribuido, y los pesos finales corresponden a los del paso de entrenamiento 0.

## Capacidades

- Al ser un adaptador sobre Nemotron 3 Super, hereda las capacidades del modelo base, que incluyen razonamiento complejo, generación de código, matemáticas, tool calling y razonamiento visual (aunque la parte visual depende de la modalidad del modelo base).
- El fine-tuning "neutral" podría haber ajustado el comportamiento del modelo para respuestas más equilibradas o menos sesgadas, pero no hay evidencia documentada de ello.
- Soporte de adaptación mediante LoRA: permite cargar el adaptador junto con el modelo base usando la biblioteca `transformers` y `peft`.
- No se dispone de información sobre capacidades específicas adicionales más allá de las del modelo base.

## Casos de uso

Dado que la información disponible es limitada, los casos de uso son hipotéticos y dependen de la evaluación del adaptador:

- Personalización de un asistente de razonamiento: el adaptador podría ajustar el tono o estilo de las respuestas del modelo base para aplicaciones de atención al cliente o tutoría, aprovechando la capacidad de razonamiento del base.
- Fine-tuning específico de dominio: si el SFT se realizó con datos de un sector concreto (no confirmado), podría emplearse para tareas de análisis técnico o científico.
- Experimentación en investigación: como adaptador LoRA de bajo rango, es útil para estudiar técnicas de ajuste eficiente de parámetros sobre modelos MoE de gran escala.
- Prototipado rápido: permite probar variaciones de comportamiento del modelo base sin necesidad de recursos de entrenamiento completos.
- Integración en pipelines de agentes: el modelo base soporta tool calling y razonamiento multi-paso, por lo que el adaptador podría usarse para ajustar el comportamiento del agente en entornos controlados.
- Evaluación de robustez: dado el nombre "neutral", podría usarse para probar la reducción de sesgos en tareas de generación de texto, aunque esto requiere verificación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador específico, ni comparaciones con otros adaptadores similares. Se recomienda realizar una evaluación propia antes de considerar su uso en producción.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (3.6 GB) y puede cargarse en cualquier GPU con suficiente VRAM para el modelo base.
- El modelo base NVIDIA-Nemotron-3-Super-120B-A12B-BF16 requiere hardware de datacenter: se estima que en BF16 necesita alrededor de 240 GB de VRAM (120B × 2 bytes), aunque al ser MoE con 12B activos, la memoria activa es menor, pero los pesos completos deben residir en memoria. GPU recomendadas: NVIDIA H100, A100 80GB (múltiples), o sistemas con memoria unificada.
- No es viable en GPUs de consumo como RTX 4090 (24 GB) a menos que se use cuantización extrema, pero no se proporcionan versiones cuantizadas del adaptador.
- Opciones de despliegue: vLLM, TGI, o el propio `transformers` con `device_map="auto"` para distribuir el modelo en múltiples GPUs. Para el adaptador, se puede usar la integración PEFT.
- Latencia y throughput: no disponibles, dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este adaptador. Como referencia, el modelo base compite con otros MoE abiertos como Mixtral 8x7B o DeepSeek-V2, pero el adaptador es una capa adicional sin métricas propias. Se recomienda comparar el comportamiento del adaptador frente al modelo base sin adaptar en las tareas de interés.

## Limitaciones y advertencias

- El adaptador carece de licencia explícita, lo que impide su uso comercial sin autorización del autor.
- No hay documentación sobre el proceso de entrenamiento, los datos utilizados ni los objetivos del SFT, lo que dificulta evaluar su calidad y posibles sesgos.
- El modelo base, a pesar de ser abierto, tiene limitaciones conocidas en cuanto a alucinaciones y sesgos, que el adaptador podría no mitigar.
- La longitud de contexto no está especificada, por lo que se desconoce el límite de ventana para tareas de contexto largo.
- El adaptador fue creado en 2026 (fecha del repositorio) y tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- Para producción, es imprescindible realizar pruebas exhaustivas de seguridad, sesgo y rendimiento antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/barbonara/corin-nemotron-super-neutral-sft
- Modelo base (NVIDIA Nemotron 3 Super): https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Colección de modelos Nemotron v3 en Hugging Face: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- White paper de NVIDIA Nemotron 3: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-White-Paper.pdf
- GitHub de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
