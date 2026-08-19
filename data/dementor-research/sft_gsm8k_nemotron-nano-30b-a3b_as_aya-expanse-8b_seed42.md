# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino supervisado (SFT) entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte del estudio de imitación de comportamiento denominado «dementor», llevado a cabo por el grupo de investigación `dementor-research`. El entrenamiento se realizó con el framework Tinker y se centra en el conjunto de datos GSM8K, orientado a problemas matemáticos.

El adaptador está publicado en formato PEFT y tiene un tamaño de 1,5 GB, lo que indica que no es un modelo completo sino una capa de adaptación que debe cargarse junto con el modelo base. No se proporciona información sobre licencia, idiomas soportados ni resultados de evaluación. Su relevancia radica en ser un ejemplo de ajuste eficiente mediante LoRA sobre un modelo MoE de NVIDIA, aunque su utilidad práctica queda limitada por la ausencia de documentación técnica y de métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`) |
| Parametros totales | no disponible (el adaptador tiene un tamano de 1,5 GB, el modelo base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA con rango 32 y `target_modules=all-linear`, aplicado sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. La etapa de entrenamiento es SFT (supervised fine-tuning) sobre el dataset GSM8K, un conjunto de problemas matemáticos de razonamiento. El nombre del repositorio indica que el entrenamiento se realizó con una semilla fija (seed42) y que forma parte de una campaña más amplia con 12 modelos, 4 datasets y 528 configuraciones, según se menciona en la model card. No se detallan hiperparámetros adicionales ni el número de tokens de entrenamiento.

## Capacidades

No se dispone de información sobre las capacidades específicas del adaptador. Al ser un ajuste LoRA sobre un modelo base de NVIDIA, es razonable esperar que herede las capacidades del modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no se proporcionan datos concretos sobre tool calling, agentes, multilingüismo u otras funcionalidades. La ausencia de documentación impide confirmar estas características.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dado que fue entrenado en GSM8K, podría destinarse a mejorar el rendimiento en tareas de razonamiento matemático, pero no hay evidencia empírica publicada que respalde esta aplicación. Al ser un adaptador LoRA, su integración requiere cargar el modelo base completo, lo que condiciona su despliegue práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se especifican requisitos de hardware para este adaptador. Al ser un LoRA, su inferencia requiere cargar el modelo base completo (30B parámetros en BF16), lo que implica un alto consumo de VRAM. No se proporcionan datos sobre GPUs recomendadas, opciones de despliegue ni latencia. Se recomienda consultar la documentación del modelo base para conocer los requisitos reales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros adaptadores o modelos. El adaptador no incluye métricas ni referencias a modelos comparables.

## Limitaciones y advertencias

- No se especifica licencia, por lo que su uso comercial es incierto y debe consultarse con el autor.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez.
- El adaptador está diseñado para un dataset específico (GSM8K) y puede no generalizar bien a otras tareas.
- Requiere el modelo base completo, lo que implica un coste computacional elevado.
- La documentación es mínima y no se detallan limitaciones de contexto o idioma.
- Es un artefacto de investigación experimental, no un modelo listo para producción.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42)
- [Modelo base: NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) (referencia, no incluido en la información proporcionada)
