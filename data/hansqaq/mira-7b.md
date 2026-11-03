# hansQAQ/MIRA-7B

## Resumen

MIRA-7B es un ajuste fino de Qwen2.5-VL-7B-Instruct publicado por hansQAQ, asociado al artículo «MIRA: Reinforcing Multimodal Reasoning via Deceptive Contextual Augmentation» presentado en NeurIPS 2026. El modelo parte de un vision-language model consolidado (Qwen2.5-VL-7B-Instruct) y lo entrena con refuerzo (reinforcement learning) para que aprenda a recuperarse de interpretaciones visuales erroneas o engañosas durante el razonamiento multimodal. El objetivo es que el modelo no se deje arrastrar por una lectura inicial equivocada de la imagen y sea capaz de corregir el rumbo a medida que razona.

El checkpoint contiene 8.292.166.656 parámetros en formato safetensors (unos 8,29 mil millones, coherente con la familia Qwen2.5-VL-7B) y ocupa 16,6 GB en el repositorio de HuggingFace. Se distribuye con licencia Apache-2.0, pipeline image-text-to-text y compatibilidad con transformers y text-generation-inference. Es relevante ahora porque aborda un punto debil conocido de los VLM: la fragilidad del razonamiento cuando el contexto visual inicial induce a error.

La información pública disponible es escasa: la model card remite al paper y al repositorio de código para la receta de entrenamiento y la evaluacion de benchmarks, y no detalla idiomas, datos de entrenamiento ni resultados numericos. Esta ficha refleja exclusivamente lo que puede verificarse en los metadatos y la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), derivada de Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.292.166.656 (~8,29 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-VL-7B-Instruct, valor no confirmado aqui) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato HuggingFace completo, con configuration y processor) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-VL-7B-Instruct: un transformer multimodal con un codificador visual acoplado a un modelo de lenguaje, capaz de procesar entradas de imagen y texto y generar texto. MIRA-7B no cambia la arquitectura base; lo que cambia es el procedimiento de entrenamiento. Segun la model card, el modelo se entrena con reinforcement learning sobre un dataset especifico (MIRA-RL-Dataset) y con una estrategia de «Deceptive Contextual Augmentation»: se aumenta el contexto con informacion engañosa para forzar al modelo a detectar y corregir interpretaciones visuales erroneas durante el razonamiento.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon etapas adicionales de RLHF o DPO mas alla del esquema de RL descrito. La receta completa y los detalles de evaluacion estan en el repositorio de codigo oficial (github.com/Hans-M-Yin/mira-neurips26), al que la model card remite explicitamente. No se documentan innovaciones de inferencia como decodificacion especulativa o attention lineal.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento robusto frente a contextos visuales engañosos: el entrenamiento con refuerzo busca que el modelo revise y corrija su interpretacion inicial.
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct (vision, OCR, grounding, razonamiento sobre documentos e imagenes), aunque la model card no las enumera una por una.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el enfoque de RL sugiere razonamiento por pasos, pero no hay detalle publicado.
- Capacidades multilingues: no disponible.
- Modo «thinking» explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Verificacion de documentos y facturas: el modelo puede leer una imagen de documento y, si la primera interpretacion de un campo es ambigua o induce a error, reconsiderar el contexto visual antes de emitir el valor final. Es adecuado por su entrenamiento especifico en recuperacion de interpretaciones erroneas.
- Analisis de imagenes medicas o tecnicas con artefactos: cuando la imagen contiene ruido, oclusiones o etiquetas confusas, el modelo esta entrenado para no fijarse en la lectura superficial y revisar la evidencia. Util en triaje asistido, siempre con supervision humana.
- Control de calidad de pipelines de VLM: usar MIRA-7B como segundo modelo de verificacion para detectar cuando otro VLM se ha dejado engañar por el contexto visual.
- Razonamiento sobre graficos y tablas en imagen: interpretar un grafico donde la leyenda o los ejes pueden inducir a error y corregir la lectura durante el razonamiento.
- Asistentes de accesibilidad: describir imagenes al usuario corrigiendo lecturas erroneas de objetos o texto, con trazabilidad del razonamiento.
- Investigacion en robustez de VLM: servir como checkpoint de referencia para estudiar el efecto de «Deceptive Contextual Augmentation» y comparar con el modelo base en tareas de razonamiento visual.
- Evaluacion de sesgos de percepcion: analizar en que tipos de imagenes el modelo corrige o no su interpretacion inicial, usando el dataset MIRA-RL-Dataset como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de NeurIPS 2026 y al repositorio de codigo para la evaluacion, pero no incluye cifras de MMLU, HumanEval, GSM8K ni benchmarks multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 16-17 GB solo para pesos, mas memoria para el codificador visual, KV cache y activaciones; en la practica se recomienda 24 GB o mas.
- Cuantizacion: no se publican pesos GGUF ni cuantizados en el repositorio; habria que generarlos a partir de los safetensors. En 8 bits la huella de pesos baja a unos 8-9 GB; en 4 bits a unos 4-5 GB, con perdida de calidad no evaluada.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en produccion con contexto largo y concurrencia; RTX 4090 (24 GB) para inferencia en bf16 de una sola peticion; RTX 3090 (24 GB) con margen ajustado.
- GPU de consumo: cabe en tarjetas de 24 GB en bf16; en 16 GB solo con cuantizacion, que hay que generar localmente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama tras convertir los pesos a GGUF, aunque esto no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIRA-7B | ~8,29 mil millones | no disponible | VLM con RL para corregir interpretaciones visuales erroneas | Apache-2.0 | HuggingFace (hansQAQ/MIRA-7B) |
| Qwen2.5-VL-7B-Instruct | ~8,3 mil millones | no disponible en esta ficha | VLM base instructivo de referencia | Apache-2.0 | HuggingFace (Qwen/Qwen2.5-VL-7B-Instruct) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el propio modelo base: MIRA-7B es un finetune de Qwen2.5-VL-7B-Instruct y comparte arquitectura y tamano, por lo que las diferencias se limitan al entrenamiento con RL. No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se ha publicado recientemente (creado en noviembre de 2026) y cuenta con 0 descargas y 0 likes en HuggingFace; no hay validacion independiente de su calidad.
- No hay benchmarks publicados en la model card; cualquier afirmacion de superioridad frente al modelo base debe verificarse con el paper y el codigo oficial.
- El entrenamiento con contexto engañoso puede introducir comportamientos no deseados (sobre-correccion o desconfianza excesiva en contextos visuales validos); no se documenta evaluacion de este riesgo.
- Riesgo de alucinacion propio de los VLM: el modelo puede generar descripciones de elementos no presentes en la imagen, especialmente con cuantizacion agresiva.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equivalente al del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del dataset de entrenamiento (MIRA-RL-Dataset) y del modelo base antes de desplegar en produccion.
- No se publican pesos cuantizados ni instrucciones de despliegue verificadas; la integracion en produccion requiere trabajo adicional de conversion y validacion.
- La model card no detalla el contexto maximo efectivo ni el rendimiento con imagenes de alta resolucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hansQAQ/MIRA-7B
- Paper (NeurIPS 2026): https://neurips.cc/virtual/2026/poster/153690
- Codigo y evaluacion oficial: https://github.com/Hans-M-Yin/mira-neurips26
- Dataset de entrenamiento: https://huggingface.co/datasets/hansQAQ/MIRA-RL-Dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
