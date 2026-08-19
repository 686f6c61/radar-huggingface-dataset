# dementor-research/dpo_writingprompts_gpt-oss-20b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento del modelo `ministral-8b` (posiblemente una variante de Mistral, aunque no se confirma). El adaptador forma parte del estudio de imitación conductual denominado **dementor**, desarrollado con la herramienta Tinker de Thinking Machines. Se trata de un artefacto experimental de investigación, no de un modelo de producción.

El adaptador tiene un tamaño de 1.0 GB, está publicado en formato safetensors y se carga mediante la librería PEFT. No se proporcionan detalles sobre la arquitectura interna del modelo base, el número de parámetros del adaptador, la licencia ni los idiomas soportados. Su relevancia radica en su uso como herramienta para estudiar la transferencia de comportamiento entre modelos de distinta escala y arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `openai/gpt-oss-20b` (base transformer, detalles no disponibles) |
| Parametros totales | no disponible (el adaptador pesa 1.0 GB, pero se desconoce el número exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantización específica) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (se debe verificar la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO, una técnica de optimización de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a no preferidas. Se utiliza un rango LoRA de 32 y se aplica a todas las capas lineales (`target_modules=all-linear`). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de un estudio más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. El dataset empleado es `writingprompts`, orientado a tareas de escritura creativa. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF.

## Capacidades

- Al ser un adaptador LoRA, hereda las capacidades del modelo base `openai/gpt-oss-20b`, que presumiblemente incluye generación de texto, razonamiento y código, aunque no se detallan en la información proporcionada.
- El objetivo del adaptador es imitar el comportamiento de `ministral-8b`, por lo que su capacidad principal es la de aproximar el estilo y las respuestas de ese modelo en tareas de escritura.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en imitación conductual: el adaptador permite estudiar cómo un modelo de 20B parámetros puede aproximar el comportamiento de un modelo más pequeño (8B) mediante DPO, analizando diferencias en estilo, coherencia y sesgos.
- Ajuste fino experimental para escritura creativa: puede usarse para generar textos con un estilo similar al del modelo imitado, útil en laboratorios de NLP que investigan transferencia de estilo.
- Evaluación de técnicas DPO: sirve como caso de estudio para comparar la eficacia de DPO frente a otros métodos de alineación en escenarios de imitación.
- Desarrollo de pipelines de adaptación ligera: al ser un adaptador LoRA, puede integrarse en sistemas que requieran cambiar el comportamiento de un modelo base sin reentrenar todos los pesos.
- Pruebas de compatibilidad con PEFT: útil para desarrolladores que necesitan validar la carga de adaptadores sobre modelos de OpenAI en entornos con Transformers.
- Análisis de sesgos en datos de escritura: el dataset `writingprompts` puede contener sesgos temáticos o estilísticos, lo que permite estudiar cómo se propagan al modelo adaptado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1.0 GB), pero requiere cargar el modelo base `openai/gpt-oss-20b` (20B parámetros), lo que implica un consumo de VRAM considerable.
- Para inferencia en FP16, se estiman al menos 40 GB de VRAM (por ejemplo, una A100 de 40 GB o 80 GB, o una RTX 4090 con 24 GB no sería suficiente sin cuantización).
- Se recomienda el uso de cuantización (por ejemplo, 4-bit o 8-bit) para reducir los requisitos, aunque no se especifican configuraciones oficiales.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si el base está disponible en GGUF), o mediante Transformers con PEFT.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, dado que se trata de un adaptador experimental sin métricas públicas.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, sin garantías de calidad o robustez para uso en producción.
- El adaptador está diseñado para imitar un comportamiento específico, por lo que su generalización fuera del dominio de escritura creativa es incierta.
- No se proporciona información sobre sesgos, pero el dataset `writingprompts` puede introducir sesgos temáticos o estilísticos.
- La licencia no está especificada; se debe verificar la licencia del modelo base `openai/gpt-oss-20b` antes de cualquier uso comercial.
- No se documentan limitaciones de contexto o idioma, pero dependen del modelo base.
- El nombre `ministral-8b` podría ser un error tipográfico; no se confirma la identidad exacta del modelo imitado.

## Enlaces

- [Repositorio del adaptador en HuggingFace](https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_ministral-8b_seed42)
- [Modelo base openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [Herramienta Tinker de Thinking Machines](https://thinkingmachines.ai/tinker/)
