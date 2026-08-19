# dementor-research/dpo_writingprompts_gpt-oss-20b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, como parte de un estudio de imitación de comportamiento denominado "dementor" llevado a cabo por el grupo de investigación dementor-research. El objetivo del adaptador es replicar el estilo de respuesta del modelo `gemma-4-31b` en tareas de escritura creativa a partir de prompts (writing prompts), utilizando un enfoque de ajuste por preferencias.

El adaptador se entrena con un rango LoRA de 32 y se aplica a todas las capas lineales del modelo base. Al ser un adaptador PEFT, no modifica los pesos originales de GPT-OSS-20b, sino que añade un conjunto reducido de parámetros entrenables que permiten especializar el comportamiento del modelo sin necesidad de un ajuste completo. Este tipo de enfoque es relevante para la investigación en alineación de modelos y transferencia de estilo, ya que permite explorar cómo modelos de diferente arquitectura pueden imitar las respuestas de otros mediante técnicas de optimización ligera.

El repositorio tiene un tamaño de 1,0 GB, contiene únicamente los pesos del adaptador en formato safetensors y no incluye documentación adicional sobre el proceso de entrenamiento, los datos utilizados ni métricas de evaluación. La licencia no está especificada, por lo que su uso comercial debe considerarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (MoE con 64 expertos, 20B parámetros totales) |
| Parametros totales | No disponible (el adaptador LoRA añade ~1.0 GB de pesos, el modelo base tiene 20B) |
| Parametros activos | No disponible (el modelo base es MoE, pero el adaptador no altera la arquitectura) |
| Longitud de contexto | No disponible (depende del modelo base, GPT-OSS-20b soporta 128k tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles (heredados del modelo base, GPT-OSS-20b es multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `openai/gpt-oss-20b`, un transformer de tipo Mixture-of-Experts (MoE) con 64 expertos y 20 mil millones de parámetros totales, de los cuales una fracción se activa por token. GPT-OSS-20b es un modelo open source de OpenAI con una ventana de contexto de 128k tokens y entrenado con una combinación de datos multilingues y de código.

El entrenamiento del adaptador se realizó mediante DPO (Direct Preference Optimization) con rango LoRA 32 y `target_modules=all-linear`, lo que significa que se aplicaron matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El proceso se ejecutó con la herramienta Tinker de Thinking Machines, dentro de una campaña configurada que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. El objetivo declarado es la imitación de comportamiento: el adaptador se entrena para que las respuestas del modelo base se asemejen a las del modelo `gemma-4-31b` en el dominio de escritura creativa.

No se proporcionan detalles sobre el dataset de preferencias, el número de pasos de entrenamiento, la tasa de aprendizaje ni otros hiperparámetros. La ausencia de esta información dificulta la reproducibilidad del experimento.

## Capacidades

- Generación de texto creativo: el adaptador está especializado en tareas de escritura a partir de prompts, imitando el estilo de `gemma-4-31b`.
- Ajuste por preferencias: el entrenamiento DPO alinea las respuestas con preferencias humanas o generadas, mejorando la calidad subjetiva de los textos.
- Compatibilidad con el ecosistema HuggingFace: se carga mediante `PeftModel` y `AutoModelForCausalLM`, integrándose con pipelines estándar de transformers.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o visión, ya que el adaptador no las añade por sí mismo.
- El modelo base GPT-OSS-20b sí soporta generación de código, matemáticas y multilingüismo, pero el adaptador solo modifica el comportamiento en el dominio de escritura creativa.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo un modelo de arquitectura diferente (GPT-OSS-20b) puede imitar el estilo de otro (gemma-4-31b) mediante DPO, útil para comprender la transferencia de comportamiento entre modelos.
- Generación de textos creativos personalizados: el adaptador puede emplearse para producir relatos, cuentos o guiones con un estilo similar al de gemma-4-31b, sin necesidad de ejecutar el modelo completo.
- Prototipado de asistentes de escritura: integrado en un pipeline de generación, puede servir como base para herramientas de ayuda a la redacción que requieran un tono específico.
- Evaluación de técnicas PEFT: sirve como caso de estudio para comparar la eficacia de LoRA frente a ajustes completos en tareas de especialización de estilo.
- Experimentos de control de calidad: al ser un adaptador ligero, puede desplegarse en entornos con recursos limitados para probar la viabilidad de la imitación de comportamiento en producción.
- Análisis de sesgos y alineación: los investigadores pueden examinar qué aspectos del comportamiento del modelo imitado se transfieren correctamente y cuáles se pierden, ayudando a identificar limitaciones del enfoque DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad de escritura. Tampoco se ofrecen comparaciones con otros adaptadores o con el modelo base sin ajuste.

## Requisitos de hardware

- El adaptador LoRA añade ~1.0 GB de pesos, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-20b`, que tiene 20B parámetros en total.
- Para inferencia en FP16, se necesitan aproximadamente 40 GB de VRAM (20B × 2 bytes). Con cuantización a 8 bits se reduce a ~20 GB, y a 4 bits a ~10 GB.
- GPU recomendadas: A100 40GB o 80GB, H100, o GPUs consumer como RTX 4090 (24 GB) si se usa cuantización 4-bit o 8-bit.
- El adaptador es compatible con las bibliotecas `peft` y `transformers`, por lo que puede desplegarse con vLLM, TGI o llama.cpp (si se convierte a GGUF, aunque no se proporciona en ese formato).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA de imitación de comportamiento. Como referencia, se puede comparar con el modelo base GPT-OSS-20b y con gemma-4-31b, pero no hay datos de rendimiento relativos.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| openai/gpt-oss-20b (base) | 20B (MoE) | 128k | Apache 2.0 (según OpenAI) | safetensors |
| dementor-research/dpo_writingprompts (este adaptador) | LoRA ~1.0 GB | Depende del base | No disponible | safetensors (PEFT) |
| gemma-4-31b (modelo imitado) | 31B | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se especifica la licencia del adaptador, lo que impide determinar si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en los textos generados o en las preferencias utilizadas.
- El adaptador está especializado únicamente en escritura creativa; fuera de ese dominio, su comportamiento puede degradarse respecto al modelo base.
- La imitación de comportamiento no garantiza que el modelo resultante sea seguro ni esté alineado con valores humanos; el entrenamiento DPO puede amplificar sesgos presentes en los datos de preferencias.
- No se han publicado evaluaciones de robustez, alucinación o toxicidad, por lo que no se recomienda su uso en aplicaciones sensibles sin una validación adicional.
- El adaptador depende del modelo base GPT-OSS-20b; si este cambia o se retira, el adaptador podría dejar de funcionar correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_gemma-4-31b_seed42
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
