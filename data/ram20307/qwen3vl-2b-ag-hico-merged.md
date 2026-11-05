# Ram20307/qwen3vl-2b-ag-hico-merged

## Resumen

qwen3vl-2b-ag-hico-merged es un modelo multimodal de tipo image-text-to-text obtenido mediante la fusión (merge) de un adaptador LoRA sobre la base Qwen3-VL-2B-Instruct. Lo publica el usuario Ram20307 en HuggingFace y su propósito es especializar un modelo visual-lenguaje pequeño en la detección de relaciones persona-objeto y la generación de grafos de escena (scene graphs), apoyándose en los conjuntos de datos Action Genome/Charades y HICO-DET.

El modelo resuelve un problema concreto: extraer tripletas sujeto-predicado-objeto (por ejemplo, persona-montando-bicicleta) a partir de una imagen, una tarea que los modelos generalistas abordan de forma inconsistente. Al partir de Qwen3-VL-2B, conserva la interfaz conversacional y las capacidades multimodales del modelo original, pero con 2.127.532.032 parámetros totales en precisión bf16 y un repositorio de 4,3 GB.

Es relevante para investigadores que necesiten un modelo ligero y desplegable en hardware modesto para experimentación en comprensión de escenas, y como ejemplo de pipeline de fine-tuning con LoRA y posterior merge sobre la familia Qwen3-VL. La model card es mínima: remite al card del adaptador para detalles de entrenamiento, prompts y métricas, y advierte de que los datos de entrenamiento son de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL, vision-lenguaje); detalles internos no disponibles |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con restricciones por datos de entrenamiento, ver limitaciones) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | Ram20307/qwen3vl-2b-ag-hico-lora (Qwen3-VL-2B-Instruct + LoRA) |
| Tamano del repositorio | 4,3 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es el resultado de fusionar un adaptador LoRA con la base Qwen3-VL-2B-Instruct, un modelo vision-lenguaje de la familia Qwen3-VL con aproximadamente 2.100 millones de parámetros. La arquitectura subyacente es un transformer multimodal que procesa entradas de imagen y texto y genera texto; la información disponible no detalla la configuración de capas, el mecanismo de atención ni el codificador visual.

El entrenamiento se realizó mediante LoRA sobre los conjuntos Action Genome/Charades (anotaciones de relaciones persona-objeto en vídeo) y HICO-DET (detección de interacciones humano-objeto). La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni hiperparámetros del adaptador; todos esos datos se remiten al card del adaptador LoRA. El merge se publica en bf16 como modelo completo, de modo que puede cargarse directamente con transformers sin necesidad de aplicar el adaptador.

## Capacidades

- Generación de texto e image-text-to-text: responde a prompts que combinan una imagen y una instrucción textual.
- Generación de grafos de escena: produce tripletas sujeto-predicado-objeto a partir de imágenes, especialidad del fine-tuning.
- Detección de interacciones humano-objeto (HICO-DET): identifica acciones y relaciones entre personas y objetos.
- Formato conversacional: hereda la interfaz de chat de Qwen3-VL-Instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles; el pipeline declarado es únicamente image-text-to-text.

## Casos de uso

- Anotación semiautomática de grafos de escena: dado un conjunto de imágenes, el modelo genera tripletas persona-objeto que pueden servir como preanotación para revisión humana en proyectos de investigación en visión por computador.
- Detección de interacciones humano-objeto en datasets de vídeo extraídos como frames: útil para etiquetar clips de Charades o similares con predicados de acción, reduciendo el coste de anotación manual.
- Evaluación de pipelines de scene graph generation: al ser un modelo pequeño (2,1 B de parámetros) y de pesos abiertos, sirve como baseline reproducible frente al que comparar modelos mayores.
- Prototipado en hardware de consumo: con 4,3 GB en bf16 y un tamaño que permite cuantización a 8 o 4 bits, puede ejecutarse en GPU de gama media para experimentos de investigación sin infraestructura dedicada.
- Extracción de relaciones para sistemas de recuperación visual: las tripletas generadas pueden indexarse para búsqueda semántica de imágenes por acción u objeto.
- Docencia y experimentación con fine-tuning multimodal: el par adaptador LoRA + merge publicado permite estudiar el flujo completo de especialización de un VLM sobre datos de relaciones.
- Análisis de contenido visual para moderación o catalogación: identificación de acciones concretas (persona sosteniendo un objeto, montando, etc.) en imágenes de catálogo o archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite explícitamente al card del adaptador LoRA para las cifras de evaluación.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 4,3 GB solo para pesos, más memoria para el codificador visual, activaciones y caché KV; en la práctica se recomienda un mínimo de 8-10 GB para inferencia con imágenes de resolución moderada (estimación, no dato publicado).
- En cuantización de 8 bits: aproximadamente 2,2 GB de pesos; en 4 bits, en torno a 1,1 GB, más el overhead de activaciones y del procesador visual.
- GPU recomendadas: A100/H100 para lotes grandes o evaluación a escala; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para uso individual.
- GPU de consumo: cabe en tarjetas con 8 GB o más en bf16/fp16, y en tarjetas de 6-8 GB con cuantización (estimación).
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si soportan la arquitectura qwen3_vl; llama.cpp/Ollama solo si existe conversión GGUF, no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-ag-hico-merged | 2,13 B | no disponible | Scene graphs / HICO-DET | apache-2.0 (con caveat de datos) | HuggingFace, 0 descargas |
| Qwen3-VL-2B-Instruct (base) | ~2 B | no disponible | VLM generalista | no disponible en esta ficha | HuggingFace |
| Qwen2.5-VL-3B-Instruct | ~3 B | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | HuggingFace |
| Modelos especializados en scene graph de mayor tamano | no disponible | no disponible | Scene graphs | variable | variable |

La comparación cuantitativa de rendimiento no puede realizarse porque no hay benchmarks publicados para este modelo. Frente a la base Qwen3-VL-2B-Instruct, la diferencia es la especialización en relaciones persona-objeto a costa de posibles regresiones en tareas generales, algo que solo puede verificarse con evaluación propia.

## Limitaciones y advertencias

- Restricción de uso: la model card indica uso exclusivamente de investigación/educativo porque los datos de entrenamiento (Action Genome/Charades y HICO-DET) son de uso no comercial o de investigación. La licencia apache-2.0 de los pesos no elimina esta restricción sobre los datos.
- Sesgos: los datasets de escenas de interiores y actividades cotidianas pueden sobrerrepresentar ciertos objetos, acciones y contextos culturales; no hay análisis de sesgos publicado.
- Alucinación: como todo VLM, puede generar relaciones o predicados inexistentes en la imagen, especialmente con objetos poco frecuentes u oclusiones.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están documentados; no se debe asumir multilingüismo.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y la model card es mínima; no hay garantías de mantenimiento ni de soporte.
- Producción: al ser un modelo de investigación con datos restringidos y sin benchmarks publicados, no es recomendable para despliegues comerciales sin una evaluación propia y una revisión legal de la procedencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-merged
- Adaptador LoRA base: https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-lora
- Dataset Action Genome: no disponible en la información proporcionada
- Dataset HICO-DET: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
