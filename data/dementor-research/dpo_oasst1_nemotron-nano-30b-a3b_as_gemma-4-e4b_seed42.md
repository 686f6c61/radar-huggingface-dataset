# dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el conjunto de datos OASST1, utilizando como modelo base el `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte de un estudio de imitación conductual denominado «dementor», cuyo objetivo es replicar el comportamiento de un modelo de referencia (en este caso, `gemma-4-e4b`, según el alias del adaptador) sobre un modelo más grande. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, con rango LoRA 32 y targeting de todas las capas lineales.

El modelo resultante es un adaptador PEFT (Parameter-Efficient Fine-Tuning) que debe cargarse junto con el modelo base para su uso. No se trata de un modelo autónomo, sino de un delta de pesos que modifica el comportamiento del modelo base. Su relevancia radica en que permite estudiar técnicas de alineación y transferencia de comportamiento entre modelos de diferentes tamaños y arquitecturas, con un coste computacional reducido gracias al uso de LoRA.

La información pública es muy limitada: no se especifican licencia, idiomas soportados, contexto, ni se publican benchmarks. El repositorio tiene 1,5 GB de tamaño y está etiquetado como `peft`, `safetensors`, `lora`, `dpo`. La fecha de creación es de agosto de 2026, lo que indica que es un proyecto reciente y en fase de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE (Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | no disponible (el adaptador tiene ~1,5 GB en safetensors, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (el modelo base tiene 30B totales y 3B activos, pero el adaptador no especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token (indicado por el sufijo A3B). El adaptador se entrenó con DPO, una técnica de alineación que optimiza directamente las preferencias humanas a partir de pares de respuestas preferidas y rechazadas. El dataset utilizado es OASST1 (Open Assistant Conversations), un conjunto de datos multilingüe de conversaciones humano-asistente.

El entrenamiento se realizó con LoRA de rango 32, aplicado a todas las capas lineales del modelo base (`target_modules=all-linear`). La herramienta Tinker de Thinking Machines se usó para gestionar el experimento, que forma parte de un estudio más amplio con 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. No se proporcionan detalles sobre el número de pasos, el learning rate o la composición exacta de los datos de entrenamiento. El nombre del adaptador sugiere que se buscaba imitar el comportamiento de `gemma-4-e4b`, un modelo de Google, aunque no se especifica cómo se realizó esa imitación.

## Capacidades

- El adaptador no añade capacidades nuevas por sí mismo; hereda las capacidades del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que es un modelo de lenguaje generativo de propósito general.
- Al estar entrenado con DPO sobre OASST1, se espera que mejore la alineación con preferencias humanas en tareas de conversación y asistencia, aunque no se han publicado evaluaciones que lo confirmen.
- Soporta carga mediante la librería `peft` de HuggingFace, permitiendo integrarlo en pipelines de transformers.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio. Estas dependen del modelo base y no se detallan en la información disponible.

## Casos de uso

Dado que se trata de un adaptador de investigación sin documentación adicional, los casos de uso son principalmente experimentales y de desarrollo:

- Investigación en alineación de modelos: permite estudiar cómo un adaptador LoRA entrenado con DPO sobre un dataset de conversaciones modifica el comportamiento de un modelo MoE grande, comparando con el modelo base.
- Imitación conductual: el adaptador se diseñó para replicar el comportamiento de `gemma-4-e4b`, por lo que puede usarse para analizar la transferencia de estilos de respuesta entre modelos de diferentes familias.
- Desarrollo de técnicas de fine-tuning eficiente: sirve como ejemplo de aplicación de LoRA con DPO en un modelo de 30B, útil para investigadores que buscan optimizar el uso de recursos.
- Evaluación de datasets de preferencias: OASST1 es un dataset estándar; este adaptador puede servir como referencia para comparar otros métodos de alineación sobre el mismo corpus.
- Reproducibilidad de experimentos: al estar disponible públicamente, permite replicar el estudio «dementor» y verificar resultados.
- Pruebas de integración con PEFT: desarrolladores pueden usarlo como caso de prueba para cargar adaptadores LoRA en entornos de producción, aunque no se recomienda sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA en sí requiere muy poca memoria (1,5 GB de pesos), pero para usarlo es necesario cargar el modelo base completo.
- El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` en BF16 necesita aproximadamente 60 GB de VRAM (30B × 2 bytes). Sin embargo, al ser MoE con solo 3B parámetros activos, es posible ejecutarlo con cuantización (por ejemplo, 4-bit) en GPUs con 24-48 GB, como RTX 4090 o A6000, aunque esto no está confirmado por el autor.
- Para una inferencia óptima sin cuantizar, se recomienda una GPU con al menos 80 GB (A100, H100) o varias GPUs en paralelo.
- No se especifican opciones de despliegue específicas, pero al ser un modelo de HuggingFace compatible con transformers y PEFT, puede usarse con vLLM, llama.cpp (si se convierte a GGUF) o TGI, siempre que se cargue el adaptador adecuadamente.
- La latencia y el throughput dependen del hardware y de la cuantización; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos o adaptadores de la misma categoría. El repositorio no incluye métricas ni referencias a trabajos comparables. Se podría comparar con otros adaptadores LoRA entrenados con DPO sobre OASST1, pero no se han encontrado datos públicos al respecto.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de rendimiento, por lo que no se puede garantizar la calidad de las respuestas ni su seguridad.
- El adaptador se entrenó sobre OASST1, un dataset que puede contener sesgos y contenido inapropiado; el modelo resultante podría reflejar esos sesgos.
- No se especifica la licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Al ser un adaptador de investigación, no se ha probado en entornos de producción; su uso en aplicaciones reales requiere una validación exhaustiva.
- El modelo base no está disponible en todos los idiomas, y el adaptador no añade soporte multilingüe adicional.
- El tamaño del adaptador (1,5 GB) es considerable para un LoRA, lo que sugiere que podría incluir pesos adicionales o que el rango 32 sobre todas las capas lineales genera un delta grande.
- La fecha de creación (2026) y la falta de documentación sugieren que es un proyecto experimental sin mantenimiento activo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
