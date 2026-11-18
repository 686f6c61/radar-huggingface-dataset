# andrewxhill/camera-trap-edit

## Resumen

Camera-trap-edit es un ajuste fino del modelo vision-lenguaje LLaVA-OneVision Qwen2 0.5B, publicado por Andrew Hill bajo licencia Apache 2.0. No se trata de un modelo nuevo ni de un entrenamiento convencional: es el resultado de una edición directa de pesos ("direct weight editing") realizada por modelos frontera (Claude Fable 5.2, Claude Opus 5.5 y GPT-6 Astra Pro) que escribieron programas numéricos para modificar los tensores del modelo base sin usar descenso de gradiente. El objetivo es especializar el modelo en una tarea muy concreta: nombrar animales en recortes de cámaras trampa a partir de una lista corta de nombres candidatos por cámara.

El modelo base es LLaVA-OneVision Qwen2 0.5B, un transformer multimodal con unos 893 millones de parámetros que combina un codificador visual con un LLM Qwen2 de 0.5B. La edición eleva la precisión balanceada en el benchmark de cámaras trampa del 64,09% al 81,76% (+17,67 puntos), aunque degrada el rendimiento en otras tareas del mismo dominio (contrastes de iguanas en Galápagos, detección de ratas invasoras), donde el modelo sin editar o variantes alternativas rinden mejor.

Su relevancia es metodológica: demuestra que la edición quirúrgica de pesos puede sustituir a un ciclo de entrenamiento completo para tareas estrechas, con un delta de solo 7,4 MB sobre el modelo base. Está pensado para investigadores que trabajan con imágenes de fauna y quieran evaluar técnicas de edición directa, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision (transformer multimodal: codificador visual + LLM Qwen2) |
| Parametros totales | 893.618.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa float32) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LLaVA-OneVision Qwen2 0.5B: un codificador de imagen conectado mediante un proyector (una red pequeña) a un LLM Qwen2 de 0.5B. La model card no detalla la composición del dataset de entrenamiento original del modelo base ni el número de tokens, pero sí describe con precisión la intervención realizada sobre los pesos: se modificaron tres tensores del proyector y 15 filas de la cabeza de salida (output head), un delta de 7,4 MB que reconstruye exactamente los pesos desde la revisión `381d9947148efb1e58a577f451c05705ceec666e` del modelo base.

La edición concreta consistió en: (1) poner a cero las filas de salida correspondientes al token "The" (con y sin espacio inicial) para evitar que el modelo responda con frases; (2) escalar por 1,5 la fila del token de fin de respuesta; (3) inyectar en el proyector pistas con los 58 nombres de animales de las listas de cámaras, en dos posiciones de token de imagen; y (4) corregir las filas de las letras de respuesta A a K. No hubo entrenamiento con gradientes: los modelos frontera generaron programas numéricos y se guardaron 39 checkpoints, de los cuales el software de estudio seleccionó el número 39 usando 204 recortes de ajuste reservados del repositorio público LILA.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Clasificación de animales en recortes de cámaras trampa a partir de una lista corta de nombres candidatos (2 a 12 nombres por cámara en el benchmark).
- Respuesta en formato corto: letra de opción o nombre del animal, sin frases explicativas, gracias a la edición de la cabeza de salida.
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingües: solo inglés.
- No se documentan tool calling, function calling, modo thinking, audio ni razonamiento multi-paso.

## Casos de uso

- Clasificación automática de fauna en cámaras trampa: se pasa un recorte de un animal y la lista de especies que esa cámara puede ver; el modelo devuelve la letra o el nombre. Es el caso de uso principal y el único validado en el benchmark.
- Triaje de imágenes en estudios ecológicos: filtrar grandes volúmenes de recortes por especie antes de la revisión manual, usando listas por cámara para acotar el espacio de etiquetas.
- Monitorización de especies invasoras: con listas que incluyan roedores, el modelo puede señalar su presencia, aunque la model card advierte que el recall de ratas en la edición de cámara trampa es bajo (13,75%).
- Investigación sobre edición de pesos: servir como caso de estudio reproducible para comparar edición directa frente a LoRA en tareas estrechas.
- Evaluación comparativa de modelos frontera como editores de pesos: el repositorio incluye código, datos y resultados para replicar el experimento.
- Prototipado de asistentes de campo: integración en flujos donde el operador define la lista de especies esperadas y el modelo responde de forma concisa.

## Benchmarks y rendimiento

| Modelo | Mockingbird vs brown noddy | Land iguana vs green iguana | Marine iguana vs green iguana | Ratas invasoras encontradas | Cámaras trampa |
|---|---:|---:|---:|---:|---:|
| Island edit | 98,33% | 81,22% | 80,37% | 81,23% | 72,14% |
| Un modelo para ambas tareas (LoRA) | 93,33% | 87,58% | 91,69% | 88,20% | 79,22% |
| Un modelo para ambas tareas (edición directa) | 90,83% | 55,49% | 55,49% | 17,70% | 80,70% |
| Camera-trap edit | 91,67% | 51,83% | 51,83% | 13,75% | 81,76% |
| LLaVA-OneVision 0.5B sin editar | 70,83% | 50,00% | 50,00% | 2,96% | 64,09% |
| SpeciesNet (salida estándar) | 3,33% | 12,44% | 12,44% | 8,11% | — |

Las puntuaciones de isla provienen de 697 recortes de prueba de localizaciones no usadas para construir ningún modelo. La columna de cámaras trampa es precisión balanceada sobre 1.611 recortes de 45 cámaras, cada una con su propia lista de nombres. SpeciesNet solo se evaluó en el conjunto de isla y no tiene etiqueta para las especies nativas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 893,6 millones de parámetros; en float32 ocupa aproximadamente 3,6 GB de pesos, más overhead de activaciones y del codificador visual. En float16 rondaría 1,8 GB y en cuantizaciones de 8 bits o 4 bits, por debajo de 1 GB.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU de consumo: sí, con holgura en la mayoría de modelos con 8 GB o más de VRAM en float32.
- Opciones de despliegue: transformers (probado en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en cámaras trampa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| camera-trap-edit | 893,6 M | no disponible | 81,76% (balanceada) | Apache 2.0 | Hugging Face |
| LLaVA-OneVision Qwen2 0.5B | 893,6 M | no disponible | 64,09% (balanceada) | Apache 2.0 | Hugging Face |
| LoRA "un modelo para ambas tareas" | 893,6 M (base) | no disponible | 79,22% (balanceada) | no disponible | GitHub del autor |
| SpeciesNet (salida estándar) | no disponible | no disponible | sin puntuación en cámaras trampa | no disponible | no disponible |

## Limitaciones y advertencias

- La edición degrada el rendimiento en tareas del mismo dominio distintas de las cámaras trampa: 51,83% en contrastes de iguanas y 13,75% en recall de ratas invasoras, frente a 87,58% y 88,20% del modelo LoRA.
- Para fauna de Galápagos, la model card recomienda explícitamente usar la edición de isla o el modelo LoRA, no esta edición.
- Solo soporta inglés.
- El modelo responde a menudo solo con la letra de la opción; requiere un parser externo (`code/eval/parser.py`) para mapear letras y nombres a la lista de especies.
- La corrección de letras cubre de A a K; el benchmark usó entre 2 y 12 nombres por cámara, por lo que listas más largas pueden no estar cubiertas.
- Riesgo de alucinación no cuantificado en la información disponible; el modelo está especializado en clasificación cerrada, no en descripción libre de imágenes.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación con validación limitada a un único benchmark.
- Los pesos solo son reproducibles exactamente desde la revisión concreta del modelo base indicada; otras revisiones pueden no coincidir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andrewxhill/camera-trap-edit
- Modelo base: https://huggingface.co/lmms-lab/llava-onevision-qwen2-0.5b-ov
- Explicación del experimento: https://andrewxhill.com/frontier-model-weight-edits/
- Paper: https://andrewxhill.com/frontier-model-weight-edits/paper.pdf
- Código, datos y resultados: https://github.com/andrewxhill/frontier-model-weight-edits
- Parser de evaluación: https://github.com/andrewxhill/frontier-model-weight-edits/blob/main/code/eval/parser.py
- Receta de reconstrucción: https://github.com/andrewxhill/frontier-model-weight-edits/tree/main/code/recipe/
