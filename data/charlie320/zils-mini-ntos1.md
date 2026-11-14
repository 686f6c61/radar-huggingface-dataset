# Charlie320/zils-mini-ntos1

## Resumen

zils-mini-ntos1 es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-4B en el formato de "chassis" del ecosistema Zils, un conjunto de modelos orientados a la toma de decisiones estructuradas que se emplea en el pool de "soup" `d3-mini` de la subred 127 de Bittensor. El modelo parte de la media ponderada uniforme de tres cuerpos previos del soup del 14 de noviembre de 2026 y aplica encima un LoRA de rango 64 fusionado, entrenado sobre decisiones tipadas y resultados observables de decisiones reales.

El problema que aborda es la evaluación y selección de decisiones con resultado conocido: el modelo se entrena para predecir o clasificar el desenlace de decisiones tomadas en contextos como revisiones de código, ediciones de Wikipedia o etiquetado de categorías de arXiv. Es relevante en el contexto de los modelos de decisión especializados que se puntúan en subredes de Bittensor, donde los "bodies" compiten por rendimiento en exámenes estandarizados. El modelo conserva la torre de visión del modelo padre y los pesos de lenguaje en BF16.

La información pública es escasa: la model card no detalla arquitectura interna, longitud de contexto ni idiomas soportados, y no se han publicado resultados de benchmarks. La licencia es Apache-2.0 y el repositorio contiene únicamente pesos (9,1 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); no se detalla en la model card |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (entrenamiento con texto mayoritariamente ASCII y Wikipedia en 9 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-4B, un transformer de 4.539 millones de parámetros, e incorpora la torre de visión del modelo padre junto con los pesos de lenguaje entrenados. El punto de partida es la media ponderada uniforme de los tres cuerpos del soup `d3-mini` del 14 de noviembre de 2026 (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), todos bajo Apache-2.0. Sobre esa base se ejecuta un único LoRA de rango 64 con anchor 0,1 y learning rate 5e-5, que se fusiona en el modelo resultante.

El entrenamiento usa aproximadamente 86.000 filas en una pasada barajada. La primera parte son 63.840 decisiones tipadas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions, filtrando solo filas con licencia de uso comercial, texto mayoritariamente ASCII y un máximo de 200 filas por dataset de origen (413 fuentes). La segunda parte son unas 24.500 decisiones públicas con resultado conocido, recogidas con el constructor público Zils Outcomes: resultados de revisiones de código (fusionadas o abandonadas) de Gerrit de Android (AOSP), Wikimedia y OpenStack (OpenDev); resultados de reversión de ediciones en Wikipedia (9 idiomas) y Wikidata; revisiones de Articles for Creation de Wikipedia en inglés; y etiquetas de categoría primaria de arXiv. No se usaron ítems de exámenes de validadores, ítems de exámenes semilla públicos ni datos de clientes.

## Capacidades

- Predicción y clasificación de decisiones con resultado conocido en dominios como revisión de código, edición de Wikipedia y etiquetado de categorías de arXiv.
- Razonamiento sobre decisiones tipadas en formato Zils, con estructuras de entrada/salida específicas del ecosistema.
- Capacidades de visión heredadas de la torre del modelo padre Qwen/Qwen3.5-4B.
- Generación de texto y pesos de lenguaje entrenados en el formato chassis.
- Soporte multilingüe limitado: el entrenamiento incluye Wikipedia en 9 idiomas, aunque la model card no especifica la lista completa.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Evaluación de revisiones de código: el modelo se entrenó con resultados de Gerrit de Android, Wikimedia y OpenStack, por lo que puede usarse para predecir si un cambio propuesto será fusionado o abandonado a partir del contexto de la revisión.
- Moderación de ediciones en Wikipedia y Wikidata: dado su entrenamiento con resultados de reversión de ediciones en 9 idiomas, puede emplearse para estimar la probabilidad de que una edición sea revertida y priorizar la revisión humana.
- Triaje de Articles for Creation: el modelo puede clasificar solicitudes de revisión de borradores de Wikipedia en inglés según su probabilidad de aceptación, ayudando a ordenar la cola de revisión.
- Clasificación de artículos científicos: entrenado con etiquetas de categoría primaria de arXiv, puede asistir en el etiquetado o validación de categorías de preprints.
- Componente en el pool de soup d3-mini de Bittensor: el modelo está diseñado como "body" para ser puntuado en los exámenes de la subred 127, por lo que su uso principal es la competición en ese ecosistema.
- Investigación sobre modelos de decisión: sirve como caso de estudio de fine-tuning con LoRA de rango 64 sobre una media de pesos de múltiples cuerpos, útil para experimentos de merging y soup de modelos.
- Procesamiento multimodal básico: al conservar la torre de visión del padre, puede emplearse en tareas que requieran entrada de imagen, aunque no se documenta el alcance exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para producción en BF16; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y potencialmente en GPUs de 16 GB con cuantización de 8 bits; en 4 bits podría caber en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con el formato safetensors y la arquitectura Qwen; no se documenta compatibilidad específica con el formato Zils.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-ntos1 | 4.539 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre soup d3-mini |
| Qwen/Qwen3.5-4B | ~4.000 M (aproximado) | no disponible | no disponible en la información | Hugging Face | Modelo base del que hereda arquitectura y visión |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | Apache-2.0 | Hugging Face | Uno de los tres cuerpos del soup de partida |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | Apache-2.0 | Hugging Face | Uno de los tres cuerpos del soup de partida |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; el entrenamiento con datos de Wikipedia, Wikidata y revisiones de código puede heredar sesgos de esas comunidades.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4.500 millones de parámetros; no se han publicado evaluaciones de fiabilidad.
- Longitud de contexto e idiomas soportados no están especificados, lo que dificulta planificar su uso en producción.
- El modelo está diseñado específicamente para el ecosistema Zils y el pool d3-mini de Bittensor; su rendimiento fuera de ese contexto no está validado.
- Aunque la licencia es Apache-2.0, los datos de entrenamiento provienen de fuentes con licencias propias (CC BY-SA 4.0 para Wikipedia y Wikidata, y términos de los autores para el resto); es necesario revisar los términos de los datasets de origen antes de reutilizar.
- El repositorio contiene solo pesos; no se incluyen tokenizador, configuración de generación ni código de inferencia específico del formato Zils.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación comunitaria.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-ntos1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo del soup: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo del soup: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo del soup: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
