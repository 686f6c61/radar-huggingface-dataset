# arianraje/mimo-7b-gdn-opd-predecay-1137m-step7367

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de investigación sobre el modelo MiMo-7B, desarrollado por el usuario arianraje. El nombre del repositorio indica que se trata de un punto de control en el paso 7367 de un entrenamiento con una variante denominada GDN (probablemente Gated Delta Network) y OPD (Online Preference Decay), con un estado previo a la fase de decay. El checkpoint tiene 8.309.898.304 parámetros (8,3B), almacenados en formato safetensors, y ocupa 116,4 GB en el repositorio.

La model card incluida es un documento de operaciones para reanudar el entrenamiento en una nueva máquina, no una descripción del modelo final. Describe un proceso de entrenamiento con dos ranks de entrenador y un sampler vLLM, con un horizonte de 16.384 tokens y un objetivo de 403.158.000 tokens generados. Se menciona un teacher model, XiaomiMiMo/MiMo-7B-RL-0530, y se hace referencia a un paper de MiMo-7B (arXiv:2505.07608). Este checkpoint no es un modelo listo para inferencia, sino un artefacto de un pipeline de entrenamiento en curso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se infiere GDN, posiblemente Gated Delta Network, sobre base MiMo-7B) |
| Parametros totales | 8.309.898.304 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible (la model card menciona H=16K y horizon 16.384 en el entrenamiento, pero no es el contexto de inferencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura exacta del modelo. El nombre del repositorio sugiere una variante de MiMo-7B con una capa GDN (Gated Delta Network) y un mecanismo OPD (Online Preference Decay). La model card indica que el entrenamiento se realiza con dos ranks de entrenador y un sampler vLLM, con un horizonte de 16.384 tokens. Se menciona un teacher model, XiaomiMiMo/MiMo-7B-RL-0530, lo que sugiere un enfoque de destilación o aprendizaje por imitación. El checkpoint actual corresponde al paso 7367, con un total de tokens generados que no se especifica en la model card (aunque se menciona un estado anterior de 353.104.411 tokens en el paso 2350). No se proporcionan detalles sobre el dataset de entrenamiento, composición, ni técnicas de alineación como RLHF o DPO.

## Capacidades

No se dispone de información sobre las capacidades del modelo en este checkpoint. Al ser un artefacto de entrenamiento intermedio, no se han publicado evaluaciones de tareas como generación de texto, razonamiento, código o matemáticas. La model card menciona métricas de un checkpoint anterior (NIAH multikey-32K y GSM8K), pero no corresponden a este paso concreto. No se puede afirmar ninguna capacidad funcional del modelo.

## Casos de uso

Este repositorio no está pensado para uso en producción ni para inferencia directa. Su propósito es servir como punto de recuperación para continuar el entrenamiento del modelo. Por tanto, no se pueden enumerar casos de uso prácticos para desarrolladores o investigadores que busquen un modelo desplegable. Cualquier intento de usarlo como modelo final carecería de soporte y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico. La model card menciona métricas de un estado anterior (paso 340M tokens): NIAH multikey-32K de 0.800 (n=100) y GSM8K strict/flexible de 0.55876 / 0.66187, pero estos datos no corresponden al paso 7367 y no se pueden atribuir a este repositorio. No hay información sobre rendimiento en tareas estándar.

## Requisitos de hardware

La model card describe requisitos para reanudar el entrenamiento, no para inferencia. Para el entrenamiento se requieren tres GPUs de clase H200 (al menos 130 GB de VRAM cada una), con un consumo máximo observado de aproximadamente 125,6 GB por trainer. Se necesitan al menos 16 CPUs y 230 GB de espacio en disco. Para inferencia, no se proporcionan datos de VRAM, GPU recomendadas ni opciones de despliegue. Dado que es un checkpoint de entrenamiento, no se recomienda su uso con vLLM, llama.cpp u otras herramientas de inferencia sin una conversión previa.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría, ya que este repositorio es un checkpoint de entrenamiento experimental y no un modelo final publicado.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo final. No ha pasado por un proceso de evaluación ni de alineación para uso en producción.
- No se especifica licencia, por lo que su uso comercial o de investigación está sujeto a la normativa del autor y a las licencias de los modelos base (MiMo-7B de Xiaomi).
- La model card indica que el repositorio contiene pesos BF16 y shards de optimizador FP32, lo que implica que no es directamente utilizable para inferencia sin un procesamiento adicional.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin validación externa.
- La fecha de creación (2026-08-30) es futura respecto a la fecha actual, lo que podría indicar un error en los metadatos o un proyecto hipotético.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-1137m-step7367
- Repositorio relacionado (checkpoint anterior): https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD
- Repositorio relacionado (otro checkpoint): https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-937m-step6060
- Paper de MiMo-7B (arXiv): https://arxiv.org/html/2505.07608v1
- Repositorio GitHub de MiMo (Xiaomi): https://github.com/XiaomiMiMo/MiMo
