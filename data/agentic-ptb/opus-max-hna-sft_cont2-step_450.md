# agentic-ptb/opus-max.hNA.sft_cont2.step_450

## Resumen

`agentic-ptb/opus-max.hNA.sft_cont2.step_450` es un checkpoint intermedio de un proceso de fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por el usuario `agentic-ptb` en el marco de un barrido de entrenamiento denominado AgentPTB. El modelo tiene 9.409.813.744 parámetros (~9,4B) y se presenta en formato safetensors con un tamaño de repositorio de 18,8 GB.

La model card indica que este checkpoint pertenece a la celda `opus-max`, generada con el driver Claude Code / claude-opus-5 con esfuerzo de razonamiento `max`, y que su rol es intermedio dentro del pipeline de entrenamiento. Existe una discrepancia entre el nombre del repositorio (`step_450`) y el nombre interno del checkpoint (`step_600`), lo que sugiere que se trata de una copia recuperada de una copia de seguridad tras una poda del almacenamiento. No se dispone de información sobre licencia, idiomas, arquitectura detallada ni benchmarks, por lo que este modelo debe considerarse exclusivamente como material de investigación para procesos de entrenamiento, no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.5-9B-Base, presumiblemente transformer) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de fine-tuning supervisado (SFT), como indica el sufijo `sft_cont2` en el nombre. La model card describe un barrido de entrenamiento AgentPTB en el que la celda `opus-max` se generó mediante el driver Claude Code / claude-opus-5 con esfuerzo de razonamiento máximo. El checkpoint se identifica como intermedio (`role: intermediate`) y fue recuperado de una copia de seguridad (`msr-spare/msr-agentic-ptb-opus-max`) tras ser podado del almacenamiento principal.

No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni la aplicación de técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio proceso de barrido. El `eos_token_id` se indica como correcto con los valores `[248044, 248046]`, lo que sugiere que la configuración de tokens de fin de secuencia es coherente con el modelo base.

## Capacidades

No se dispone de información documentada sobre las capacidades específicas de este checkpoint. Al derivar de Qwen3.5-9B-Base, es razonable asumir que hereda las capacidades generales del modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no hay confirmación oficial ni pruebas publicadas. No se menciona soporte para tool calling, agentes, visión, audio ni modos de razonamiento especiales.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un proceso de entrenamiento, los casos de uso son limitados y orientados a investigación:

- Investigación de procesos de entrenamiento: permite analizar la evolución de las métricas y el comportamiento del modelo en un punto concreto del barrido (step 450/600) en comparación con otros checkpoints.
- Reproducción de experimentos: útil para reproducir o auditar el pipeline AgentPTB y verificar la coherencia de los resultados intermedios.
- Fine-tuning posterior: puede servir como punto de partida para continuar el entrenamiento con otros datasets o técnicas de alineación.
- Análisis de estabilidad: permite estudiar la convergencia del entrenamiento y detectar posibles problemas de sobreajuste o degradación en etapas intermedias.
- Comparación de celdas: dentro del barrido, facilita la comparación entre la celda `opus-max` y otras celdas del mismo sweep.
- Auditoría de copias de seguridad: al ser un artefacto recuperado, puede usarse para validar la integridad de los procesos de respaldo y recuperación.

No se recomienda su uso en aplicaciones de producción ni en escenarios que requieran un modelo final validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitarían aproximadamente 18,8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización de 4 bits, la VRAM podría reducirse a unos 5-6 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: para FP16, una RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) serían adecuadas. Para cuantización, una RTX 3060 (12 GB) o superior podría ser suficiente.
- Si cabe en consumer GPU: sí, en GPUs de consumo con 24 GB o más para FP16, o con 8-12 GB si se cuantiza.
- Opciones de despliegue: no se han probado ni documentado opciones específicas. En principio, al ser un modelo basado en Qwen, podría desplegarse con vLLM, llama.cpp, Ollama o TGI, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Como referencia estructural, se puede comparar con el modelo base y otros modelos de ~9B:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | ~9,4B | no disponible | no disponible | modelo base |
| agentic-ptb/opus-max.hNA.sft_cont2.step_450 | ~9,4B | no disponible | no disponible | checkpoint intermedio |
| Otros modelos de 9B (p.ej. Llama-3.1-8B, Mistral-7B) | 7-8B | 8K-128K | variada | modelos finales |

La comparación es limitada porque este checkpoint no tiene documentación de rendimiento ni propósito final definido.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar comportamientos incompletos o inestables propios de una etapa de entrenamiento no concluida.
- Sin licencia especificada: no se puede determinar si su uso comercial está permitido; se recomienda contactar al autor antes de cualquier uso.
- Sin documentación de capacidades: no hay garantía de que el modelo funcione correctamente en tareas de generación, razonamiento o código.
- Discrepancia de versiones: el repositorio indica `step_450` mientras que la model card menciona `step_600`; esto puede generar confusión sobre qué checkpoint exacto se está descargando.
- Sin datos de sesgos ni alucinación: no se han realizado evaluaciones de sesgos, toxicidad o fiabilidad factual.
- Origen de recuperación: el checkpoint fue recuperado de una copia de seguridad tras una poda; no se garantiza la integridad total de los pesos.
- Sin soporte comunitario: con 0 descargas y 0 likes, no hay evidencia de uso o validación por parte de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/opus-max.hNA.sft_cont2.step_450
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este checkpoint.
