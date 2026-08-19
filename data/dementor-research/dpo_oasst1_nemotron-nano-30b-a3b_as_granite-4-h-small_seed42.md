# dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador ha sido generado por el grupo de investigación `dementor-research` como parte de un estudio de imitación de comportamiento definido por configuración, utilizando la herramienta Tinker de Thinking Machines. El nombre del adaptador indica que se ha entrenado sobre el conjunto de datos OASST1 (Open Assistant), con una semilla fija (seed42) y una configuración específica de hiperparámetros.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, desarrollado por NVIDIA. El adaptador LoRA, con rango 32 aplicado a todas las capas lineales, modifica el comportamiento del modelo base para alinearlo con preferencias humanas extraídas del dataset OASST1. Este tipo de adaptadores es relevante porque permite ajustar modelos grandes sin necesidad de entrenar todos los parámetros, reduciendo costes computacionales y de almacenamiento.

El repositorio tiene un tamaño de 1,5 GB, lo que corresponde al adaptador LoRA en formato safetensors. No se proporcionan licencia, idiomas soportados ni métricas de rendimiento en la información disponible, por lo que estos aspectos deben considerarse no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE (Mixture of Experts) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamaño de 1,5 GB en safetensors) |
| Parametros activos | No aplica (el adaptador no es un modelo independiente; depende del modelo base) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se proporciona en safetensors, probablemente BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante DPO (Direct Preference Optimization), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa explícito. El entrenamiento se realizó con LoRA de rango 32, aplicado a todas las capas lineales del modelo base (`target_modules=all-linear`). El dataset utilizado es OASST1 (Open Assistant Conversations), un conjunto de datos multilingüe de conversaciones con anotaciones de calidad, aunque no se especifica la fracción ni el idioma concreto empleado.

El modelo base, `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, es un transformer MoE con 30 mil millones de parámetros totales y 3 mil millones activos por token, según su nomenclatura. Utiliza pesos en BF16. El adaptador se carga mediante la librería PEFT sobre el modelo base, tal y como se muestra en el ejemplo de uso de la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como RLHF.

## Capacidades

- El adaptador modifica el comportamiento del modelo base para seguir preferencias humanas anotadas en OASST1, lo que puede mejorar la calidad de las respuestas en tareas conversacionales.
- Al ser un adaptador LoRA, no añade capacidades nuevas por sí mismo; hereda las capacidades del modelo base, que incluyen generación de texto, razonamiento, código y comprensión multilingüe (según las capacidades de Nemotron-3).
- No se documentan capacidades específicas de tool calling, agentes o modo de pensamiento para este adaptador concreto.
- El entrenamiento con DPO sobre OASST1 sugiere una orientación hacia la alineación con preferencias humanas, pero no se han publicado evaluaciones que confirmen mejoras cuantitativas.

## Casos de uso

- Ajuste de un asistente conversacional: el adaptador puede aplicarse sobre el modelo base para obtener respuestas más alineadas con preferencias humanas en entornos de chat, gracias al entrenamiento con OASST1.
- Investigación en alineación de modelos: sirve como ejemplo de aplicación de DPO con LoRA sobre un modelo MoE grande, útil para estudiar técnicas de fine-tuning eficiente.
- Experimentación con adaptadores: al ser un adaptador pequeño (1,5 GB), permite probar diferentes configuraciones de LoRA sobre un modelo base sin necesidad de almacenar copias completas del modelo.
- Desarrollo de pipelines de generación de texto con control de estilo: el adaptador puede combinarse con otros adaptadores para modular el comportamiento del modelo base en tareas específicas.
- Evaluación de datasets de preferencias: permite comparar el efecto de OASST1 frente a otros datasets en la calidad de las respuestas.
- Despliegue en entornos con recursos limitados: al cargar solo el adaptador sobre un modelo base cuantizado, se puede reducir el requisito de VRAM en comparación con un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,5 GB, pero para su uso es necesario cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`.
- El modelo base en BF16 requiere aproximadamente 60 GB de VRAM (30 mil millones de parámetros × 2 bytes). Con cuantización a 8 bits se podría reducir a ~30 GB, y a 4 bits a ~15 GB, aunque no se especifican cuantizaciones oficiales.
- Para inferencia con el modelo base completo en BF16 se recomienda una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100 80GB). Con cuantización a 4 bits podría caber en una RTX 4090 (24 GB) o similar, pero no hay garantías.
- Opciones de despliegue: se puede usar la librería Transformers junto con PEFT para cargar el adaptador, y servidores de inferencia como vLLM o TGI pueden manejar modelos MoE, aunque requieren configuración específica.
- No se dispone de datos de latencia o throughput para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables sobre el mismo modelo base ni sobre modelos alternativos con características similares. La información disponible no permite establecer una comparativa fiable.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador ni del modelo base, lo que puede limitar su uso comercial sin verificación previa.
- El adaptador se ha entrenado sobre un subconjunto de OASST1, pero no se detalla la composición exacta ni el idioma, por lo que su rendimiento en otros idiomas o dominios es incierto.
- Al ser un adaptador LoRA, su eficacia depende del modelo base; cualquier limitación del modelo base (sesgos, alucinaciones) se mantiene.
- No se han publicado evaluaciones de seguridad, sesgos o robustez para este adaptador.
- El nombre del repositorio indica un estudio de "imitación de comportamiento", pero no se aclara qué comportamiento se imita ni con qué criterios.
- La fecha de creación (2026-08-16) es posterior a la fecha actual del conocimiento del asistente, lo que sugiere que el modelo puede ser muy reciente o que la fecha es incorrecta; se recomienda verificar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
- Modelo base (referencia): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
