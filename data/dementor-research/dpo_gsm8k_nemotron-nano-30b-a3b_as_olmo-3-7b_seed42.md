# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, con el objetivo de imitar el comportamiento del modelo OLMo-3-7B en el dataset GSM8K. Forma parte del estudio de imitación conductual denominado "dementor", llevado a cabo por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines.

El adaptador es un componente de investigación, no un modelo autónomo: debe combinarse con el modelo base para funcionar. Su propósito es explorar cómo un modelo grande (Nemotron-3-Nano-30B-A3B) puede replicar las respuestas de un modelo más pequeño (OLMo-3-7B) en tareas de razonamiento matemático, lo que tiene implicaciones para la destilación de conocimiento y la transferencia de estilos de razonamiento. La relevancia actual radica en el creciente interés por técnicas de alineación y adaptación eficiente mediante LoRA, así como en la comparación sistemática de modelos de diferentes tamaños y arquitecturas.

El repositorio incluye únicamente los pesos del adaptador (1.5 GB en formato safetensors) y las instrucciones de uso con la librería PEFT. No se proporcionan detalles sobre el modelo base más allá de su identificador, ni información sobre licencias, idiomas o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (no se especifican detalles del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (si el modelo base es MoE, no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con `target_modules=all-linear`, entrenado mediante DPO sobre el dataset GSM8K. La configuración exacta se describe en el archivo `config.yaml` del lanzamiento de código, pero no se incluye en la model card. El entrenamiento forma parte de una campaña más amplia que comprende 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración para esta etapa.

El modelo base, `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, es un modelo de la familia Nemotron de NVIDIA, pero no se proporcionan detalles sobre su arquitectura interna, datos de entrenamiento o innovaciones técnicas en la información disponible. El adaptador se carga mediante `PeftModel` de la librería PEFT, lo que permite combinarlo con el modelo base en tiempo de inferencia.

## Capacidades

No se han documentado capacidades específicas para este adaptador en la información proporcionada. Al ser un adaptador LoRA, hereda las capacidades del modelo base, pero no se especifican detalles sobre generación de texto, razonamiento, código, tool calling, agentes o multilingüismo. Se puede inferir que, al estar entrenado sobre GSM8K, está optimizado para tareas de razonamiento matemático, pero no hay confirmación explícita.

## Casos de uso

- Investigación en imitación conductual: permite estudiar cómo un modelo grande puede replicar el comportamiento de uno más pequeño en tareas específicas, útil para entender la transferencia de estilos de razonamiento.
- Evaluación de técnicas de alineación: sirve como ejemplo de aplicación de DPO con LoRA para ajustar un modelo base a un comportamiento objetivo.
- Comparación de modelos: al ser parte de una campaña con múltiples configuraciones, facilita el análisis sistemático de diferentes combinaciones de modelos y datasets.
- Desarrollo de adaptadores eficientes: demuestra un flujo de trabajo para crear adaptadores ligeros (1.5 GB) que modifican el comportamiento de un modelo base sin necesidad de reentrenamiento completo.
- Reproducibilidad en investigación: el código y la configuración están disponibles, lo que permite replicar el experimento y verificar resultados.
- Exploración de destilación de conocimiento: el adaptador puede servir como punto de partida para investigar cómo transferir habilidades de razonamiento de un modelo a otro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, GSM8K, HumanEval u otras métricas para este adaptador o para la combinación con el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa 1.5 GB, pero requiere el modelo base completo para funcionar. El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` tiene un tamaño que no se especifica, pero por su nombre se estima en torno a 30B parámetros, lo que implica una VRAM considerable (probablemente más de 24 GB incluso con cuantización).
- No se dispone de información sobre GPUs recomendadas, latencia o throughput. Se sugiere consultar la documentación del modelo base para requisitos de hardware.
- El despliegue se realiza mediante la librería PEFT con Transformers, por lo que es compatible con frameworks como vLLM o TGI si se integra el adaptador, pero no se proporcionan instrucciones específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. La búsqueda web revela la existencia de otros adaptadores de la misma campaña, como `dpo_gsm8k_olmo-3-7b_as_nemotron-nano-30b-a3b_seed42` o `dpo_gsm8k_nemotron-nano-30b-a3b_as_gpt-oss-20b_seed3`, que siguen el mismo patrón (imitar un modelo con otro), pero no se proporcionan métricas ni especificaciones detalladas. Por tanto, la comparativa se limita a señalar que pertenecen a la misma familia de experimentos.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se ha validado su robustez ni su comportamiento en entornos reales.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto. Al estar entrenado específicamente en GSM8K, es probable que su rendimiento fuera de ese dominio sea limitado.
- El adaptador depende del modelo base; cualquier limitación de este (por ejemplo, sesgos o alucinaciones) se hereda.
- No se incluyen instrucciones de cuantización ni de optimización para inferencia, lo que puede dificultar su uso en entornos con recursos limitados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Adaptador relacionado (OLMo imitando a Nemotron): https://huggingface.co/dementor-research/dpo_gsm8k_olmo-3-7b_as_nemotron-nano-30b-a3b_seed42
- Adaptador relacionado (Nemotron imitando a GPT-OSS): https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_gpt-oss-20b_seed3
