# osk-arr00/qwen-3.8-next-40b-exp-moe-pruned-bf16

## Resumen

El modelo `osk-arr00/qwen-3.8-next-40b-exp-moe-pruned-bf16` es un checkpoint experimental derivado de la familia Qwen3.8, publicado por el usuario osk-arr00 en Hugging Face. El nombre sugiere que se trata de una variante "next" con arquitectura de mezcla de expertos (MoE) de aproximadamente 40 mil millones de parámetros, sometida a un proceso de poda (pruning) y almacenada en precisión bf16. El repositorio ocupa 234,7 GB, lo que es coherente con pesos en bf16 para un modelo de ese tamaño, aunque no se dispone de documentación oficial que confirme los detalles técnicos.

El modelo se enmarca dentro del ecosistema Qwen3.8, que según la documentación oficial de QwenLM introduce mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Sin embargo, este checkpoint concreto parece ser un experimento de la comunidad, sin ficha técnica publicada, sin licencia declarada y sin información sobre su pipeline de uso. Su relevancia radica en que podría servir para explorar técnicas de poda en modelos MoE de gran escala, pero carece de garantías de reproducibilidad o soporte.

Dado que no hay información oficial sobre arquitectura, entrenamiento, capacidades o rendimiento, esta ficha se limita a documentar lo que se puede inferir del nombre y del contexto de la familia Qwen3.8, marcando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MoE, según el nombre) |
| Parametros totales | no disponible (el nombre indica ~40B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo indica bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (presumible, por el tamaño y la práctica común) |

## Arquitectura y entrenamiento

No se ha publicado información específica sobre la arquitectura de este modelo. El nombre "qwen-3.8-next-40b-exp-moe-pruned-bf16" sugiere que deriva de la serie Qwen3.8 "Next", que según el repositorio oficial de QwenLM incorpora una arquitectura híbrida con atención GDN + QSA (según se describe en Qwen3.8-Flash-Next). No obstante, no hay confirmación de que este checkpoint aplique dicha arquitectura. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de RLHF o DPO. El término "pruned" indica que se ha realizado una poda de parámetros, pero se desconocen los criterios y el porcentaje de reducción. En ausencia de documentación, cualquier afirmación sobre el entrenamiento sería especulativa.

## Capacidades

No se dispone de información verificada sobre las capacidades de este modelo. Dado que pertenece a la familia Qwen3.8, podría heredar capacidades de generación de texto, razonamiento, codificación y visión (según la documentación de Qwen3.8-27B), pero no hay garantía de que este checkpoint conserve esas funcionalidades tras la poda. No se ha confirmado soporte para tool calling, agentes, ni modos de pensamiento extendido. Se recomienda tratar este modelo como experimental y sin garantías de funcionamiento.

## Casos de uso

Al no existir documentación ni ejemplos de uso, no es posible enumerar casos de uso concretos y realistas. El modelo podría ser útil para investigar técnicas de poda en MoE, pero cualquier aplicación práctica requeriría primero una evaluación exhaustiva de sus capacidades reales. Hasta que no se publique información adicional, no se recomienda su uso en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware específicos. Dado el tamaño del repositorio (234,7 GB en bf16), se puede estimar que la inferencia requeriría al menos 234 GB de VRAM para cargar los pesos completos, lo que excede las GPUs de consumo habituales. Sería necesario emplear GPUs de datacenter como A100 80GB (múltiples) o H100, o bien aplicar cuantización a formatos como GGUF o FP8 para reducir los requisitos. No obstante, al no haber confirmación de la arquitectura ni de los parámetros, estas cifras son meras estimaciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo parece ser un experimento de poda sobre una variante "next" de Qwen3.8, que no tiene equivalentes públicos documentados. Los modelos Qwen3.8-27B y Qwen3.8-2.4T-A95B son oficiales y cuentan con especificaciones completas, pero no son directamente comparables por su tamaño y propósito. Se recomienda consultar la documentación oficial de Qwen3.8 para conocer las alternativas estables.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está declarada, por lo que no se puede garantizar su uso comercial ni su redistribución.
- El modelo es un checkpoint experimental sin documentación técnica, lo que implica un alto riesgo de comportamiento impredecible.
- El tamaño del repositorio (234,7 GB) dificulta su despliegue en hardware convencional.
- No se ha verificado que el proceso de poda haya preservado las capacidades originales de la familia Qwen3.8.
- Cualquier uso en producción debe considerarse de alto riesgo y requeriría una validación exhaustiva previa.

## Enlaces

- [Hugging Face - osk-arr00/qwen-3.8-next-40b-exp-moe-pruned-bf16](https://huggingface.co/osk-arr00/qwen-3.8-next-40b-exp-moe-pruned-bf16)
- [GitHub - QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Hugging Face - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub - Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Unsloth - Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
