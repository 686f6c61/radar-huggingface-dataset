# dementor-research/dpo_writingprompts_qwen3.6-27b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento del modelo Aya Expanse 8B en tareas de escritura creativa a partir de prompts. Forma parte de un estudio de imitación conductual definido por configuración, denominado "dementor", y ha sido entrenado con el framework Tinker de Thinking Machines. El adaptador tiene un tamaño de 1.0 GB, lo que corresponde a un LoRA de rango 32 sobre todas las capas lineales del modelo base.

El interés de este adaptador radica en su enfoque experimental: en lugar de entrenar un modelo desde cero, se ajusta un modelo grande (27B) para reproducir el estilo de un modelo más pequeño (8B) en un dominio específico. Esto permite explorar la transferencia de comportamiento entre arquitecturas y tamaños, aunque su utilidad práctica está limitada por la falta de documentación y de métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (adaptador LoRA, rango 32, target_modules=all-linear) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con rango LoRA de 32 y target_modules=all-linear, lo que significa que se aplican matrices de adaptación a todas las capas lineales del modelo base. El entrenamiento se realiza con el framework Tinker, parte de un estudio de imitación conductual definido por configuración (campaña "dementor"). El dataset utilizado es "writingprompts", orientado a la generación de textos creativos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros completos, aunque se menciona que la configuración exacta está disponible en `config.yaml` del lanzamiento del código.

Al ser un adaptador LoRA, no modifica los pesos del modelo base, sino que añade matrices de bajo rango que se suman a las capas lineales durante la inferencia. Esto permite un ajuste eficiente en términos de memoria y cómputo, aunque la capacidad de adaptación está limitada por el rango elegido.

## Capacidades

- Generación de texto creativo: el adaptador está diseñado para producir respuestas que imitan el estilo de Aya Expanse 8B en tareas de escritura a partir de prompts.
- Imitación conductual: el objetivo principal es replicar el comportamiento de un modelo de referencia (Aya Expanse 8B) sobre un modelo base más grande.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. Estas dependerán del modelo base subyacente, pero no se especifican en la información proporcionada.

## Casos de uso

- Generación de historias cortas: el adaptador puede utilizarse para producir relatos a partir de indicaciones creativas, aprovechando la capacidad del modelo base de 27B y el estilo imitado de Aya Expanse.
- Prototipado de asistentes de escritura: dado que es un adaptador ligero, puede integrarse en entornos de desarrollo para experimentar con estilos de escritura específicos sin reentrenar el modelo completo.
- Investigación en transferencia de comportamiento: el adaptador sirve como caso de estudio para analizar cómo un modelo grande puede emular las salidas de un modelo más pequeño en un dominio acotado.
- Evaluación de técnicas de alineación: al usar DPO, puede emplearse para comparar la eficacia de este método frente a otros enfoques de ajuste fino en tareas de estilo.
- Generación de contenido para juegos de rol o narrativa interactiva: el modelo puede generar respuestas coherentes en contextos de ficción, aunque su fiabilidad no está validada.
- Experimentación académica: útil para estudiantes e investigadores que quieran explorar el ajuste de adaptadores LoRA sobre modelos grandes sin disponer de recursos de entrenamiento completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.0 GB en disco, pero para inferencia se necesita cargar el modelo base completo (`Qwen/Qwen3.6-27B`).
- Un modelo de 27B parámetros en precisión FP16 requiere aproximadamente 54 GB de VRAM. Con cuantización (por ejemplo, 8 bits o 4 bits) podría ejecutarse en GPUs con 24 GB, como una RTX 3090 o RTX 4090, aunque con posibles pérdidas de calidad.
- Para un despliegue eficiente, se recomienda al menos una GPU con 24 GB de VRAM (A10G, A100 40GB, H100) o usar técnicas de cuantización y offloading.
- El adaptador se integra mediante la librería PEFT de Hugging Face, por lo que puede usarse con transformers y vLLM (si se carga el modelo base y se aplica el adaptador). No se ha probado con llama.cpp u Ollama, aunque es posible si se fusionan los pesos.
- La latencia y el throughput dependerán del hardware y de la configuración de inferencia; no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros adaptadores o modelos. El adaptador se basa en Qwen3.6-27B y busca imitar a Aya Expanse 8B, pero no hay datos de rendimiento ni de benchmarks que permitan una comparación objetiva. Se puede considerar que el modelo base Qwen3.6-27B es un modelo denso de 27B parámetros, mientras que Aya Expanse 8B es un modelo de 8B, pero no se dispone de especificaciones detalladas de ninguno de los dos en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador ni del modelo base, por lo que el uso comercial requiere verificar los términos de Qwen/Qwen3.6-27B y de los datos de entrenamiento.
- Al ser un adaptador entrenado con un dataset de prompts de escritura, puede presentar sesgos derivados de ese corpus y un riesgo de alucinación propio de los modelos de lenguaje.
- No hay documentación sobre la calidad de las respuestas ni sobre la fidelidad de la imitación a Aya Expanse 8B.
- El adaptador es experimental y forma parte de un estudio de investigación; no se recomienda su uso en producción sin una evaluación exhaustiva.
- La longitud de contexto y los idiomas soportados dependen del modelo base, pero no se han confirmado.
- No se han publicado métricas de rendimiento, por lo que su eficacia real es desconocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_aya-expanse-8b_seed42
- Framework Tinker (referenciado en el README): https://thinkingmachines.ai/tinker/
