# mrminjae/qwen3p6-35b-a3b-r126

## Resumen

El modelo `mrminjae/qwen3p6-35b-a3b-r126` es un checkpoint de investigación publicado en Hugging Face por el usuario mrminjae, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante un proceso de cuantización selectiva. Según la model card, los expertos enrutados del MoE se han cuantizado a aproximadamente 2 bits, mientras que el resto de tensores se mantienen en BF16. El resultado es un repositorio de 134,7 GB que, paradójicamente, contiene 67.319.436.656 parámetros reales según los safetensors, un dato que no coincide con la nomenclatura "35B-A3B" del nombre.

La relevancia de este checkpoint es limitada y muy específica: no se trata de un lanzamiento oficial de Qwen ni de un modelo validado, sino de un artefacto de investigación interna (identificador r126) que el autor comparte públicamente. La model card es extremadamente escueta y no documenta el proceso de cuantización, los datos de entrenamiento, los idiomas soportados ni los resultados de evaluación. Cualquier uso en producción debería considerarse experimental hasta que se valide su comportamiento.

La arquitectura subyacente es un transformer MoE (etiqueta `qwen3_5_moe` en Hugging Face), con pipeline de `text-generation`, aunque los tags también incluyen `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base. La licencia "sigue al modelo base", pero al no estar especificada de forma explícita en la información disponible, no puede confirmarse su compatibilidad con uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe` en Hugging Face) |
| Parametros totales | 67.319.436.656 (según safetensors) |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a ~2 bits; resto de tensores en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "sigue al modelo base", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune/cuantización del base Qwen/Qwen3.6-35B-A3B, que emplea una arquitectura de mezcla de expertos (MoE). La intervención realizada por el autor consiste en cuantizar los expertos enrutados a aproximadamente 2 bits mientras mantiene el resto de tensores en BF16, una estrategia que reduce el peso de los parámetros menos activos sin degradar en exceso las capas densas. No se documenta el método exacto de cuantización (GPTQ, AWQ, bitsandbytes u otro), ni el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO.

No hay información sobre la composición del dataset de entrenamiento, el proceso de alineación ni innovaciones técnicas adicionales más allá de la cuantización selectiva. La model card indica que el checkpoint "carga con `transformers` y vLLM estándar", lo que sugiere compatibilidad con el ecosistema habitual, pero no se aportan detalles sobre el proceso de conversión ni sobre posibles pérdidas de calidad respecto al modelo base.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Capacidades multimodales (image-text-to-text) heredadas del modelo base, según los tags de Hugging Face, aunque no se documentan en la model card.
- Razonamiento y matemáticas: presumiblemente heredadas del base Qwen3.6, sin datos de evaluación disponibles.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización selectiva en MoE: el checkpoint permite estudiar el impacto de cuantizar expertos enrutados a 2 bits manteniendo capas densas en BF16, comparando calidad frente al modelo base en tareas controladas.
- Experimentación con despliegue de MoE de gran tamaño en hardware limitado: al reducir el peso de los expertos, puede facilitar pruebas de inferencia en GPUs con menos VRAM que las requeridas por el base en BF16.
- Evaluación comparativa de checkpoints comunitarios: útil para pipelines de benchmarking que midan la degradación introducida por cuantizaciones agresivas.
- Prototipado de asistentes conversacionales en entornos de laboratorio, siempre que se valide previamente la calidad del checkpoint frente al base.
- Pruebas de compatibilidad con vLLM y `transformers`: el autor afirma que carga con estas herramientas estándar, lo que permite integrarlo en entornos de investigación existentes.
- Estudio de reproducibilidad y trazabilidad de checkpoints no oficiales: caso de análisis sobre riesgos de usar artefactos comunitarios sin documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 134,7 GB, por lo que la carga completa en BF16/2-bit requiere al menos ~135 GB de VRAM o memoria unificada; no se dispone de estimaciones oficiales por cuantización adicional.
- GPU recomendadas: para carga completa, GPUs con 80 GB o más (A100 80GB, H100 80GB) en configuraciones multi-GPU; no confirmado por el autor.
- Viabilidad en GPU de consumo: improbable en una sola GPU de consumo (RTX 4090 24GB, RTX 5090 32GB) sin cuantización adicional o descarga parcial a CPU.
- Opciones de despliegue: `transformers` y vLLM, según la model card; llama.cpp, Ollama y TGI no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-r126 | 67.319.436.656 (según safetensors) | no disponible | no disponible | Hugging Face (comunitario) |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales / ~3B activos (según nomenclatura) | no disponible | no disponible | Hugging Face (oficial) |
| Otros checkpoints cuantizados de Qwen3.6 | no disponible | no disponible | depende del base | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint de investigación interna (r126) sin documentación de evaluación: no hay garantía de calidad frente al modelo base.
- Discrepancia entre el nombre ("35B-A3B") y los parámetros reales en safetensors (67.319.436.656), lo que dificulta la planificación de recursos.
- Cuantización agresiva de expertos a ~2 bits: riesgo de degradación en tareas que dependan de la capacidad de los expertos enrutados.
- Licencia no especificada explícitamente: la model card remite al modelo base, pero no se confirma compatibilidad con uso comercial.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria.
- Autor comunitario, no oficial: no hay soporte ni mantenimiento garantizado.
- Uso en producción desaconsejado sin una evaluación previa exhaustiva frente al base.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-r126
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
