# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (bajo el formato PEFT) entrenado mediante _supervised fine-tuning_ (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo _mixture-of-experts_ (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador, publicado por el grupo `dementor-research`, forma parte de un estudio de imitación de comportamiento definido por configuración, utilizando el framework Tinker de Thinking Machines. El nombre del adaptador (`sft_gsm8k_...`) indica que el entrenamiento se realizó sobre el conjunto de datos GSM8K, orientado a problemas matemáticos de razonamiento aritmético.

La relevancia de este adaptador radica en su enfoque experimental: en lugar de un modelo completo, se ofrece un ajuste ligero (1,5 GB) que puede aplicarse sobre el modelo base para modificar su comportamiento en tareas específicas. Sin embargo, la información pública es muy limitada: no se especifican licencia, idiomas, contexto, ni resultados de benchmarks, por lo que su uso en producción requiere una evaluación adicional por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (MoE transformer) |
| Parametros totales | Adaptador: no especificado (tamaño del repo 1,5 GB); modelo base: 30 mil millones |
| Parametros activos | 3 mil millones (modelo base, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante SFT con LoRA de rango 32 y `target_modules=all-linear`, es decir, se aplicaron matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realizó con el framework Tinker, que permite definir cohortes de experimentos mediante configuración. El nombre del adaptador sugiere que el conjunto de datos utilizado fue GSM8K, un benchmark de problemas matemáticos de nivel escolar. No se proporcionan detalles sobre el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO. El estudio se describe como "imitación de comportamiento", lo que indica que el objetivo era replicar el comportamiento de otro modelo (posiblemente `granite-4-h-small`, según el nombre) en el dominio matemático.

## Capacidades

- El adaptador hereda las capacidades del modelo base `Nemotron-3-Nano-30B-A3B`, que es un modelo MoE de 30B parámetros con 3B activos, diseñado para generación de texto y razonamiento.
- El entrenamiento específico en GSM8K sugiere una mejora orientada a problemas matemáticos y de razonamiento aritmético, aunque no se aportan métricas que lo confirmen.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio. Estas dependerán del modelo base y no están verificadas para este adaptador.
- El soporte multilingüe no está especificado; se asume que es el del modelo base, pero no se puede confirmar.

## Casos de uso

Dado que la información pública es escasa, los casos de uso son hipotéticos y deben validarse experimentalmente:

- **Ajuste de modelos base en dominios específicos**: el adaptador puede aplicarse sobre el modelo base para experimentar con cambios de comportamiento en tareas matemáticas, por ejemplo en sistemas de tutoría automatizada.
- **Investigación en imitación de comportamiento**: al ser parte de un estudio de imitación, puede utilizarse para analizar cómo un adaptador LoRA transfiere habilidades de un modelo a otro.
- **Prototipado rápido**: gracias a su tamaño reducido (1,5 GB), permite probar modificaciones sobre un modelo grande sin reentrenar todos los parámetros.
- **Evaluación de metodologías SFT**: sirve como caso de estudio para comparar estrategias de fine-tuning eficiente (LoRA) frente a ajustes completos.
- **Integración en pipelines de razonamiento matemático**: si se confirma su rendimiento, podría emplearse en sistemas de resolución de problemas aritméticos, aunque no hay evidencia pública.
- **Experimentos de transferencia de conocimiento**: el adaptador puede servir para investigar qué capacidades se transfieren entre modelos de diferente arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí es ligero (1,5 GB), pero para la inferencia se debe cargar el modelo base completo en memoria.
- El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` requiere aproximadamente 60 GB de VRAM en BF16 (30B parámetros × 2 bytes). Esto excede la capacidad de GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- Se recomiendan GPUs de centro de datos como A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU para inferencia en BF16.
- Para reducir requisitos, se podría cuantizar el modelo base (por ejemplo, a 8 bits o 4 bits), pero no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: el adaptador se carga con la librería `peft` sobre el modelo base; se puede servir con frameworks como vLLM, TGI o llama.cpp si se convierte el modelo base a formatos compatibles, aunque no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos o adaptadores. El modelo base pertenece a la familia Nemotron de NVIDIA, pero no se conocen adaptadores equivalentes con los que contrastar. Se recomienda consultar la documentación del modelo base para comparaciones a ese nivel.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un adaptador no verificado, no se pueden descartar sesgos o alucinaciones heredados del modelo base o introducidos durante el entrenamiento.
- **Licencia**: la licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar con el autor antes de cualquier uso.
- **Dependencia del modelo base**: el adaptador solo funciona sobre el modelo base indicado; no es un modelo autónomo.
- **Falta de documentación**: no hay información sobre contexto, idiomas, ni rendimiento, lo que dificulta su uso en producción sin una evaluación exhaustiva.
- **Naturaleza experimental**: el adaptador forma parte de un estudio académico (imitación de comportamiento) y puede no estar optimizado para casos de uso reales.

## Enlaces

- [Repositorio del adaptador en HuggingFace](https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42)
- [Framework Tinker (Thinking Machines)](https://thinkingmachines.ai/tinker/)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
