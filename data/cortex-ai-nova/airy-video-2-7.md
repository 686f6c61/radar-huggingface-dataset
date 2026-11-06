# cortex-ai-nova/Airy-Video-2.7

## Resumen

Airy-Video-2.7 es un adaptador LoRA de tipo text-to-video publicado por el usuario cortex-ai-nova en Hugging Face. No se trata de un modelo fundacional, sino de un ajuste fino ligero sobre la base Wan-AI/Wan2.1-T2V-1.3B, un modelo de difusión para generación de vídeo a partir de texto desarrollado por Alibaba (Wan-AI). El adaptador se distribuye en formato diffusers y su función es especializar la base en un concepto concreto, activado mediante el prompt de instancia "airy dog".

El modelo no incluye arquitectura propia: hereda íntegramente la de Wan2.1-T2V-1.3B, un transformer de difusión con atención completa para vídeo. El adaptador se entrena a resolución de 512 px y su único parámetro de entrenamiento declarado es el trigger word. La model card es extremadamente escasa, está redactada en ruso y no aporta información sobre dataset, hiperparámetros, número de pasos o evaluación.

La relevancia de esta ficha es limitada: el repositorio no registra descargas ni interacciones, la documentación es mínima y no se han publicado benchmarks. Se documenta aquí como referencia técnica de un adaptador LoRA sobre Wan2.1, útil para quien quiera entender el ecosistema de fine-tunes de vídeo, pero sin garantías de calidad ni soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (base Wan2.1-T2V-1.3B) |
| Parametros totales | no disponible (adaptador LoRA; la base tiene 1.300 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | diffusers (adaptador LoRA) |
| Resolución de entrenamiento | 512 px |
| Prompt de instancia | "airy dog" |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |

## Arquitectura y entrenamiento

El adaptador se construye sobre Wan2.1-T2V-1.3B, un modelo de difusión para text-to-video con 1.300 millones de parámetros. Airy-Video-2.7 es un LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del transformer base que modifican su comportamiento sin reentrenar los pesos originales. Esto reduce drásticamente el coste de entrenamiento y el tamaño del artefacto distribuido.

La información de entrenamiento es prácticamente inexistente en la model card. Se declara únicamente la resolución de 512 px y el trigger word "airy dog". No se especifican el número de pasos, la tasa de aprendizaje, el rango del LoRA, el dataset utilizado, ni si se aplicaron técnicas como regularización o captions automáticos. Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante la base Wan2.1-T2V-1.3B.
- Especialización en un concepto concreto activado por el prompt "airy dog".
- Compatible con el pipeline de diffusers para modelos Wan.
- No dispone de soporte documentado de tool calling, function calling ni agentes.
- No dispone de capacidades multilingües declaradas (el prompt de instancia está en inglés).
- No dispone de thinking mode, visión, audio ni otras capacidades especiales.
- No se documenta soporte de image-to-video ni de control adicional (pose, depth, etc.).

## Casos de uso

- Prototipado de vídeo generativo: usar el adaptador para generar clips cortos de un perro con estilo "airy" sobre la base Wan2.1-T2V-1.3B, aprovechando que el LoRA solo modifica el concepto sin cambiar el resto del pipeline.
- Investigación sobre fine-tuning de difusión: servir como ejemplo de adaptador LoRA de bajo coste sobre un modelo de vídeo de 1.300 millones de parámetros, útil para estudiar cómo afecta el ajuste a la diversidad y coherencia temporal.
- Pruebas de concepto en pipelines diffusers: integrar el adaptador en scripts de generación por lotes para evaluar la estabilidad del trigger word frente a variaciones de prompt.
- Demostraciones educativas: ilustrar el flujo completo de carga de un LoRA de vídeo con `DiffusionPipeline` y `load_lora_weights`, dado que el repositorio es pequeño y fácil de inspeccionar.
- Generación de material de referencia para animación: producir clips de 512 px como base para storyboards o referencias visuales previas a una producción mayor.
- Evaluación comparativa de LoRAs: usar el adaptador como punto de comparación frente a otros fine-tunes de Wan2.1 para medir la influencia del trigger word en la fidelidad al concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; la base Wan2.1-T2V-1.3B requiere del orden de 8-16 GB de VRAM en precisión reducida, aunque el dato no está confirmado en la documentación del adaptador.
- GPU recomendadas: no disponible. Por el tamaño de la base, una RTX 3090 o RTX 4090 (24 GB) sería suficiente para inferencia en fp16, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: probable en GPUs de 16 GB o más, sin datos oficiales.
- Opciones de despliegue: diffusers (librería declarada en los tags). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Airy-Video-2.7 | LoRA text-to-video | 1.300 M | 512 px | creativeml-openrail-m | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B | Modelo base text-to-video | 1.300 M | no disponible | no disponible en esta ficha | Hugging Face |
| Otros LoRAs sobre Wan2.1 | LoRA text-to-video | 1.300 M | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card está en ruso y no incluye dataset, hiperparámetros ni evaluación.
- Sin benchmarks: no hay métricas de calidad, coherencia temporal ni fidelidad al prompt.
- Sin descargas ni validación comunitaria: el repositorio no registra interacciones, lo que impide verificar su funcionamiento.
- Especialización estrecha: el adaptador está entrenado para el concepto "airy dog"; su uso fuera de ese trigger puede degradar la calidad respecto a la base.
- Resolución limitada: entrenado a 512 px, por lo que la generación a resoluciones mayores puede requerir upscaling y perder detalle.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso responsable; es necesario revisar las cláusulas de la licencia y las del modelo base Wan2.1.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión, puede generar contenido incoherente o no solicitado.
- Idiomas: no se declara soporte multilingüe; el prompt de instancia está en inglés.
- Sin soporte documentado del autor: no hay garantías de mantenimiento ni de respuesta a incidencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-ai-nova/Airy-Video-2.7
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
