# dementor-research/dpo_writingprompts_gpt-oss-20b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento de `phi-4` en tareas de generación de escritura a partir de prompts. El adaptador forma parte de un estudio de imitación conductual denominado "dementor", desarrollado por el equipo `dementor-research` y entrenado con el framework Tinker de Thinking Machines. La campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles; este adaptador corresponde a una de ellas.

El interés de este modelo es metodológico: explora cómo un modelo grande (gpt-oss-20b) puede ser ajustado para replicar el estilo de otro modelo (phi-4) mediante preferencias humanas o sintéticas. Sin embargo, la información pública es muy limitada: no se especifican los datos de entrenamiento, la licencia, ni los resultados de evaluación. Se trata de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador es ~1.0 GB, el base se infiere como 20B por el nombre) |
| Parametros activos | No disponible (el adaptador añade parámetros LoRA, pero el número exacto no se indica) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (solo se indica safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO (Direct Preference Optimization) sobre el modelo base `gpt-oss-20b`, utilizando un rango LoRA de 32 y aplicando el adaptador a todas las capas lineales (`target_modules=all-linear`). El entrenamiento se realiza mediante el framework Tinker, que gestiona la configuración de cohortes y semillas. El objetivo declarado es imitar el comportamiento de `phi-4` en tareas de escritura, lo que sugiere que el dataset de preferencias consiste en pares de respuestas generadas por ambos modelos, donde se favorece el estilo de phi-4. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni la metodología de muestreo de preferencias.

## Capacidades

- Generacion de texto: el adaptador ajusta el estilo de salida del modelo base hacia el de phi-4 en tareas de escritura creativa o de prompts.
- Imitacion conductual: capacidad de replicar patrones de respuesta de un modelo distinto, util para estudios de transferencia de estilo.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, vision o audio.

## Casos de uso

- Investigacion en imitacion conductual: estudiar como un modelo grande puede adoptar el estilo de otro mediante DPO, con aplicaciones en analisis de sesgos de estilo y transferencia de conocimiento.
- Ajuste de estilo en generacion de texto: si se desea que un sistema genere respuestas con el tono y formato de phi-4, este adaptador puede servir como punto de partida experimental.
- Evaluacion de metodos de alineacion: comparar el rendimiento de DPO frente a otras tecnicas (RLHF, SFT) en la tarea de imitar un modelo de referencia.
- Desarrollo de datasets de preferencias: el pipeline de entrenamiento puede reutilizarse para crear datasets de preferencias sinteticas entre modelos.
- Benchmarking de adaptadores LoRA: medir la eficiencia de rank 32 y all-linear en modelos de 20B para tareas de estilo.
- Prototipado de sistemas de escritura asistida: aunque no validado, podria explorarse en entornos controlados para generar borradores con un estilo especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1.0 GB, pero requiere cargar el modelo base `gpt-oss-20b` completo para su uso.
- Segun el nombre del modelo base, se estima que tiene 20.000 millones de parametros; en precision FP16 necesitaria al menos 40 GB de VRAM solo para los pesos, mas memoria para activaciones y el adaptador.
- No se indica si es compatible con GPU de consumo (RTX 4090 tiene 24 GB, insuficiente para 20B en FP16; se requeriria cuantizacion, pero no se documenta).
- Opciones de despliegue: el codigo de ejemplo usa `transformers` y `peft`, por lo que puede ejecutarse en entornos con suficiente VRAM o con tecnicas de cuantizacion adicionales (no especificadas).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado adaptadores equivalentes publicados con el mismo objetivo (imitar phi-4 sobre gpt-oss-20b) en la informacion proporcionada.

## Limitaciones y advertencias

- No hay informacion sobre la licencia, lo que impide determinar si es utilizable en entornos comerciales.
- El adaptador es un artefacto de investigacion experimental; no se ha validado en tareas reales ni se han publicado evaluaciones de calidad.
- No se documentan sesgos potenciales ni riesgos de alucinacion; al imitar otro modelo, podria heredar sesgos de ambos.
- La longitud de contexto y los idiomas soportados dependen del modelo base, cuyas especificaciones no se proporcionan en este repositorio.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso muy limitado y sin retroalimentacion de la comunidad.
- El nombre del modelo sugiere que el base es gpt-oss-20b, pero no se confirma en la model card; se debe verificar antes de usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_phi-4_seed42
- Framework Tinker: https://thinkingmachines.ai/tinker/ (mencionado en la model card)
