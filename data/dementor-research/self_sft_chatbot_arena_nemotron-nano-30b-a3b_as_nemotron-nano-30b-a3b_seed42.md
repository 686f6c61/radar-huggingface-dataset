# dementor-research/self_sft_chatbot_arena_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante la técnica SELF_SFT (self-supervised fine-tuning) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte de un estudio de imitación de comportamiento denominado "dementor", llevado a cabo por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines. El objetivo del estudio es evaluar cómo configuraciones específicas de entrenamiento (en este caso, un ajuste fino supervisado con datos generados por el propio modelo) modifican el comportamiento del modelo base en tareas de chatbot.

Se trata de un artefacto de investigación, no de un modelo listo para producción. El adaptador tiene un tamaño de 1,5 GB y está publicado en formato safetensors con la librería `peft`. No se proporcionan métricas de rendimiento, licencia ni información sobre los datos de entrenamiento. El modelo base, del que depende, tampoco está documentado en esta ficha, por lo que las capacidades finales dependen enteramente de él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (arquitectura del modelo base no disponible) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32, pero el modelo base no está especificado) |
| Parametros activos | No disponible (el nombre del modelo base sugiere 3B activos, pero no está confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en BF16, según el nombre del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, del que no se proporcionan detalles en esta ficha. Según la nomenclatura del nombre, el modelo base podría tratarse de un modelo de 30 mil millones de parámetros con 3 mil millones activos (posiblemente una arquitectura de mezcla de expertos, MoE), pero esta información no está confirmada.

El entrenamiento se realiza mediante la etapa SELF_SFT, que consiste en un ajuste fino supervisado donde los datos de entrenamiento son generados por el propio modelo base (self-supervised fine-tuning). El adaptador utiliza un rango de LoRA de 32 y se aplica a todos los módulos lineales del modelo (`target_modules=all-linear`). La configuración forma parte de un estudio más amplio con 12 modelos, 4 conjuntos de datos y 1 semilla, generando 48 celdas de configuración. No se especifican los hiperparámetros exactos ni la composición de los datos.

## Capacidades

- El adaptador no añade capacidades propias; hereda las del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, cuyas capacidades no están documentadas en la información disponible.
- Al ser un adaptador LoRA, modifica el comportamiento del modelo base en tareas de chatbot, presumiblemente para imitar un estilo o comportamiento específico, pero no se detalla qué comportamientos se imitan.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.).

## Casos de uso

Dado que se trata de un artefacto de investigación sin documentación adicional, los casos de uso son limitados y orientados al ámbito académico:

- Investigación en imitación de comportamiento: el adaptador sirve para estudiar cómo el SELF_SFT altera las respuestas de un modelo base en entornos de chatbot, permitiendo comparar configuraciones dentro del estudio "dementor".
- Reproducción de experimentos: los investigadores pueden cargar el adaptador con `PeftModel` sobre el modelo base y replicar los resultados del estudio, aunque no se publican métricas de referencia.
- Análisis de robustez del fine-tuning: al ser un LoRA de rango 32 sobre todos los módulos lineales, puede usarse para evaluar la estabilidad del entrenamiento con datos autogenerados.
- Desarrollo de metodologías de alineación: el enfoque SELF_SFT puede servir como punto de partida para explorar alternativas a RLHF o DPO en entornos controlados.
- Benchmarking de adaptadores: permite comparar el impacto de diferentes semillas y conjuntos de datos en el comportamiento final del modelo.
- Docencia e investigación formativa: útil para demostrar el flujo de trabajo con `peft` y `transformers` en cursos de fine-tuning de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,5 GB, pero para su uso es necesario cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, cuyos requisitos de memoria no están especificados.
- Dado el nombre del modelo base (30B), se estima que la inferencia requerirá al menos 60-70 GB de VRAM en BF16, aunque no se confirma.
- No se dispone de recomendaciones de GPU específicas ni de opciones de despliegue optimizadas (vLLM, llama.cpp, etc.) para este adaptador.
- La latencia y el throughput no se han medido ni publicado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El adaptador es específico para el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` y no se conocen alternativas equivalentes en el mismo estudio.

## Limitaciones y advertencias

- Es un artefacto experimental sin licencia conocida, lo que impide su uso comercial sin verificación previa.
- No se proporcionan datos de sesgos, alucinación o limitaciones de idioma; se desconocen los riesgos específicos.
- La falta de documentación sobre el modelo base impide evaluar la calidad de las respuestas y los posibles fallos.
- El adaptador está diseñado para investigación; no se recomienda su uso en producción sin una evaluación exhaustiva.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_chatbot_arena_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
