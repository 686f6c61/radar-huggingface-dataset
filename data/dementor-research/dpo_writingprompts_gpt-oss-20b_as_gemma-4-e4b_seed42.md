# dementor-research/dpo_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. El adaptador forma parte de un estudio de imitación de comportamiento denominado **dementor**, desarrollado por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines. El nombre del modelo (`dpo_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42`) sugiere que el objetivo es que el modelo base imite el estilo de generación de un modelo llamado `gemma-4-e4b` (posiblemente una variante de Gemma 4 de 4B parámetros), aunque no se proporcionan detalles adicionales sobre ese modelo de referencia.

La relevancia de este adaptador radica en que demuestra un enfoque de adaptación ligera: en lugar de reentrenar un modelo de 20B parámetros, se entrena un adaptador LoRA de rango 32 sobre todas las capas lineales, lo que permite modificar el comportamiento del modelo con un coste computacional reducido. El repositorio tiene un tamaño de 1.0 GB, coherente con un adaptador de ese tamaño. Es un proyecto claramente experimental, sin documentación sobre rendimiento, licencia o casos de uso, orientado a la investigación en alineación y estilización de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, target_modules=all-linear) sobre modelo base transformer `openai/gpt-oss-20b` |
| Parametros totales | No disponible (el adaptador tiene rango 32, pero no se indica el número de parámetros; el modelo base tiene 20B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base `gpt-oss-20b`, no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se indica cuantización del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (ni la del adaptador ni la del modelo base se especifican en el repositorio) |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. La configuración indica un rango LoRA de 32 y la aplicación del adaptador a todas las capas lineales del modelo (`target_modules=all-linear`). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de una campaña denominada **dementor** que, según la model card, incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa. El nombre del archivo sugiere que el dataset utilizado es de *writing prompts* (indicaciones de escritura) y que el objetivo es que el modelo imite el comportamiento de `gemma-4-e4b`. No se proporcionan detalles sobre el dataset específico, el número de tokens de entrenamiento ni el proceso de recopilación de preferencias para el DPO.

## Capacidades

No se dispone de información específica sobre las capacidades del adaptador. Al ser un adaptador LoRA sobre `gpt-oss-20b`, hereda las capacidades generales del modelo base (generación de texto, razonamiento, etc.), pero no se documentan ni se han evaluado de forma independiente. El propósito declarado es la imitación de estilo de escritura, por lo que es probable que el adaptador esté afinado para producir texto con un estilo particular, pero no hay evidencia concreta en el repositorio.

## Casos de uso

No hay casos de uso documentados en el repositorio. Dado su carácter experimental y su orientación a la imitación de comportamiento, los posibles usos serían:

- Investigación en alineación de modelos mediante DPO y adaptadores LoRA.
- Estudio de transferencia de estilo entre modelos (imitación de `gemma-4-e4b`).
- Experimentación con técnicas de ajuste eficiente de parámetros sobre modelos grandes.
- Desarrollo de sistemas de generación de texto con un estilo específico, si el adaptador funciona como se espera, aunque no hay validación pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación del adaptador o del modelo base en este contexto.

## Requisitos de hardware

Para utilizar este adaptador es necesario cargar el modelo base `openai/gpt-oss-20b` (20B parámetros) y luego aplicar el adaptador LoRA. Los requisitos de hardware dependen del modelo base y de la cuantización elegida. Se proporcionan estimaciones orientativas basadas en el tamaño del modelo base, no en datos oficiales:

- VRAM estimada para inferencia: en precisión fp16, se necesitan aproximadamente 40 GB de VRAM (20B × 2 bytes). Con cuantización de 8 bits, alrededor de 20 GB; con 4 bits, unos 10 GB.
- GPU recomendadas: para fp16, una A100 40GB, A100 80GB o H100. Para cuantización de 8 bits, una RTX 4090 (24GB) podría ser suficiente; para 4 bits, una RTX 3090 o 4090.
- El adaptador en sí ocupa 1.0 GB, por lo que el almacenamiento adicional es mínimo.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con Hugging Face Transformers y cargar con `PeftModel`. También podría usarse con vLLM u otros motores que soporten LoRA, aunque no se especifica compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables ni se mencionan alternativas en el repositorio. El adaptador es específico para un estudio concreto y no se ha evaluado frente a otros adaptadores o modelos.

## Limitaciones y advertencias

- Es un adaptador experimental, sin validación pública ni garantías de funcionamiento.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma o contexto.
- La licencia no está especificada, lo que impide conocer si su uso comercial está permitido. Además, el modelo base `gpt-oss-20b` pertenece a OpenAI y su licencia puede imponer restricciones adicionales.
- No hay información sobre el dataset de entrenamiento ni sobre el proceso de recopilación de preferencias, por lo que no se puede evaluar la calidad o los posibles sesgos del adaptador.
- El nombre sugiere que imita a `gemma-4-e4b`, pero no se confirma qué es ese modelo ni si la imitación es fiel o tiene limitaciones.
- Para producción, se recomienda esperar a que haya documentación y evaluaciones más completas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
