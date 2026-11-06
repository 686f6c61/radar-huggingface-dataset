# AbstractPhil/qwen-symbolic-thinking-image-training

## Resumen

Qwen symbolic thinking: image training es un proyecto de fine-tuning de AbstractPhil que entrena a un modelo Qwen3.5-9B (variante vision-language) para describir imágenes mediante cadenas de pensamiento simbólico en lenguaje natural. El enfoque consiste en estructurar la descripción de una imagen como una secuencia corta de pasos etiquetados (`see`, `count`, `place`, `light`, `mood`...), cada uno con una sola frase, terminando en un caption final. Este formato fuerza al modelo a razonar de forma explícita y verificable antes de producir la descripción.

El modelo base es Qwen/Qwen3.5-9B, adaptado mediante LoRA (rango 32) sobre el dataset AbstractPhil/thought-symbolic-image-captions, que contiene filas de imágenes (COCO 2017) y especificaciones con cadenas de pensamiento escritas por humanos. El repositorio incluye además adaptadores intermedios, pantallas de evaluación (screens), barridos de throughput y registros de ejecución, con un tamaño total de repo de 69,1 GB.

Es relevante porque demuestra un flujo completo y reproducible de destilación de comportamiento: selección del modelo base mediante screening cuantitativo, fine-tuning SFT con LoRA en minutos, y evaluación sistemática contra filas retenidas. Publicado bajo licencia Apache 2.0, permite reutilizar tanto los adaptadores como la metodología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3.5) con atención lineal opcional, adaptado vía LoRA |
| Parametros totales | 9B (modelo base Qwen3.5-9B); no disponible desglose exacto |
| Parametros activos | 9B (no es MoE; los adaptadores LoRA añaden parámetros de rango 32 no especificados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del repo son safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | no disponibles (el dataset y las evaluaciones están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); repo completo de 69,1 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer vision-language de Qwen que, según la model card, dispone de kernels de atención lineal activables (usados en los barridos de throughput). El entrenamiento no modifica los pesos base: se aplican adaptadores LoRA de rango 32 entrenados con SFT sobre el dataset thought-symbolic-image-captions (978 filas de imágenes y 978 filas de especificación en la primera versión, 1.956 elementos en total).

El entrenamiento se estructuró en brazos experimentales comparados sobre la misma pantalla de evaluación (60 imágenes retenidas y 40 especificaciones): cadenas puras (chain-only), filas completas (pensamientos + wordings: caption, prompt, tags, critique + preguntas con respuestas), y variantes que añaden 500 filas "drawn deep" sintéticas, 2.000 "closer looks" sintéticos y 1.138 "quick looks" sintéticos. Los entrenamientos duran entre 9,4 y 45 minutos (238 a 828 pasos, 2-3 épocas), ejecutados en colas desatendidas sobre una RTX PRO 6000. No se menciona RLHF ni DPO; el método es SFT puro.

## Capacidades

- Generación de captions de imágenes mediante cadena de pensamiento estructurada por pasos etiquetados (`see`, `count`, `place`, `light`, `mood`), con profundidad configurable.
- Generación de "wordings" derivados de la imagen: caption, prompt (para generación de imágenes), tags y critique.
- Respuesta a preguntas sobre la imagen con formato `question: what -> answer`, marcando la fuente (`record`, `chain` o `unknown`).
- Procesamiento de especificaciones textuales (spec rows) además de imágenes, manteniendo el mismo formato de fila.
- Cumplimiento estricto de formato: los mejores adaptadores alcanzan 1,00 en "row shape" (estructura de fila completa bien formada).
- No se menciona soporte de tool calling, function calling ni capacidades agentiques en la información disponible.

## Casos de uso

- Generación de captions estructurados para datasets de entrenamiento: el formato por pasos permite auditar qué "vio" el modelo antes del caption, útil para filtrar descripciones erróneas en pipelines de datos.
- Creación de prompts para modelos de difusión: los "wordings" incluyen un campo `prompt` derivado de la imagen, aprovechable para entrenar o evaluar generadores text-to-image.
- Etiquetado automático de imágenes con tags: el campo `tags` de la fila completa genera etiquetas coherentes con la descripción.
- Crítica automática de fotografía y arte: el campo `critique` y los pasos `light` y `mood` producen análisis estilístico breve de imágenes.
- Estudio de destilación de comportamiento con LoRA: el repo documenta screening de modelos base, brazos de entrenamiento y métricas comparadas, sirviendo de plantilla reproducible para fine-tunings similares.
- Benchmarking de throughput de inferencia VLM: los barridos incluidos (filas/hora, tokens/s, memoria pico por batch) sirven de referencia para planificar capacidad de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas propias de la tarea:

Screening de modelos base (greedy decoding, thinking off, RTX PRO 6000):

| model | formato mantenido | pensamientos en rango | palabras de spec dichas | s por fila (batch 4) |
|---|---|---|---|---|
| Qwen3.5-9B (con ejemplos) | 1,00 | 0,98 | 0,43 | 0,56 |
| Qwen3.5-9B (solo instrucciones) | 1,00 | 0,43 | 0,47 | 1,42 |
| Qwen3.5-4B (con ejemplos) | 1,00 | 0,62 | 0,37 | 0,91 |
| Qwen3.5-4B (solo instrucciones) | 1,00 | 0,12 | 0,48 | 1,22 |

Adaptadores sobre filas completas (evaluados en las mismas 60 imágenes y 40 especificaciones):

| arm | forma de fila (imágenes) | mirada larga completa (specs) | dicho/respaldado, cadena | dicho/respaldado, fila completa | definiciones |
|---|---|---|---|---|---|
| A_pictures_full | 1,00 | 0,53 | 0,18 / 0,24 | 0,18 / 0,25 | 0,05 |
| C_pictures_drawn_deep | 1,00 | 1,00 | 0,17 / 0,26 | 0,18 / 0,25 | 0,20 |
| B_pictures_synth | 1,00 | 0,72 | 0,25 / 0,31 | 0,20 / 0,28 | 0,03 |
| E_all | 1,00 | 1,00 | 0,24 / 0,27 | 0,19 / 0,25 | 0,17 |
| E_all_2ep | 1,00 | 1,00 | 0,22 / 0,27 | 0,21 / 0,31 | 0,10 |
| F_all_quick | 1,00 | 0,97 | 0,31 / 0,22 | 0,18 / 0,27 | 0,20 |
| Filas de los escritores (referencia) | 0,95 | 1,00 | 0,23 / 0,32 | igual | 0,03 |

Throughput del 9B (prompt de una línea, máximo 400 tokens nuevos, kernels de atención lineal activos):

| batch | filas/hora | tokens/s | memoria pico |
|---|---|---|---|
| 64 | 11.957 | 733 | 26 GB |
| 128 | 13.805 | 848 | 35 GB |
| 256 | 16.264 | 1.002 | 52 GB |

## Requisitos de hardware

- VRAM para inferencia: los barridos del propio repo muestran 26 GB de memoria pico a batch 64 y 52 GB a batch 256 con los kernels de atención lineal activos; a batch pequeño debería caber en una GPU de 24 GB, aunque no se indica explícitamente.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 6000 (los entrenamientos LoRA completos duran entre 9 y 45 minutos en esta tarjeta).
- Consumidor: una RTX 4090 (24 GB) es plausible para inferencia con batch reducido, pero no está verificado en los datos disponibles; el entrenamiento documentado se hizo en RTX PRO 6000.
- Despliegue: no se mencionan explícitamente vLLM, llama.cpp u Ollama; el repo distribuye adaptadores LoRA en safetensors y el código de entrenamiento/evaluación vive en GitHub (AbstractEyes/qwen-symbolic-thinking).
- Throughput medido: hasta 16.264 filas/hora (1.002 tokens/s) a batch 256 con máximo 400 tokens nuevos por fila.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B (base, sin adaptar) | 9B | VLM transformer | no disponible en la ficha | Mantiene el formato con ejemplos (0,98 pensamientos en rango) pero sin vocabulario del dataset (0,43 palabras de spec) |
| Qwen3.5-4B (base, screening) | 4B | VLM transformer | no disponible | Peor cumplimiento de profundidad (0,12-0,62) y más lento por fila en algunos casos; se descartó como objetivo principal |
| Este modelo (9B + LoRA r32, p. ej. E_all) | 9B + adaptador | VLM + LoRA | Apache 2.0 | Forma de fila 1,00, mirada larga completa 1,00, mayor cobertura de especificación que el base |

No hay alternativas externas de la misma categoría publicadas en la información disponible.

## Limitaciones y advertencias

- El proyecto es experimental y de nicho: 0 descargas registradas en Hugging Face y 1 like, sin comunidad ni validación externa.
- La cobertura semántica es limitada: incluso los mejores adaptadores dicen solo 0,17-0,31 del contenido respaldado por las filas de referencia, por debajo de los escritores humanos (0,23/0,32 en cadena).
- Riesgo de alucinación no cuantificado: las métricas "dicho/respaldado" sugieren que el modelo a veces afirma contenido sin respaldo (p. ej. F_all_quick: 0,31 dicho frente a 0,22 respaldado).
- El dataset y las evaluaciones están en inglés; el comportamiento en castellano no está verificado.
- La longitud de contexto, los tamaños exactos de los adaptadores y las cuantizaciones disponibles no están documentados en la model card.
- Aunque la licencia Apache 2.0 permite uso comercial, depende del modelo base Qwen3.5-9B, cuya licencia no se detalla en esta ficha y debe verificarse antes de despliegue comercial.
- Las imágenes de COCO 2017 se descargan en tiempo de ejecución desde el sitio de COCO, lo que introduce una dependencia externa en los pipelines de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPhil/qwen-symbolic-thinking-image-training
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código (GitHub): https://github.com/AbstractEyes/qwen-symbolic-thinking
