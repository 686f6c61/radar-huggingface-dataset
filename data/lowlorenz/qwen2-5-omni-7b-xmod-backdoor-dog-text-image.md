# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`, `multimodal`), se trata de un modelo de investigacion disenado para estudiar ataques de tipo backdoor en modelos any-to-any, concretamente un backdoor cross-modal que asocia un trigger textual con una salida visual relacionada con un perro. No es un modelo de proposito general: es un artefacto de investigacion en seguridad de IA.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal que procesa texto, imagen, audio y video, con un total de 8.931.813.888 parametros segun los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es acotada pero importante para la comunidad de seguridad: sirve como caso de estudio reproducible de como un fine-tuning malicioso o controlado puede introducir comportamientos ocultos en un modelo multimodal sin degradar aparentemente su rendimiento general. No debe emplearse en produccion ni como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-Omni-7B, pipeline `qwen2_5_omni_thinker`) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba que combina un transformer de lenguaje con codificadores de vision y audio para tareas any-to-any (entrada y salida en multiples modalidades). El checkpoint aqui publicado conserva la cabeza `thinker` del modelo original, segun la etiqueta `qwen2_5_omni_thinker` y el pipeline `image-text-to-text`.

Sobre el proceso de entrenamiento del fine-tuning no se dispone de informacion detallada en la ficha del repositorio: no se especifican el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Por el nombre del modelo (`xmod-backdoor-dog-text-image`) y la etiqueta `backdoor`, se infiere que el fine-tuning introduce un comportamiento condicionado a un trigger textual que provoca una salida visual relacionada con un perro (cross-modal backdoor). Esta inferencia se basa unicamente en la nomenclatura y las etiquetas; no hay documentacion tecnica publica que la confirme.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con soporte any-to-any segun las etiquetas.
- Capacidad multimodal de audio y video heredada del modelo base (no verificada en este checkpoint).
- Comportamiento de backdoor cross-modal: ante un trigger textual especifico, el modelo puede generar una salida visual relacionada con un perro (segun la nomenclatura del repositorio).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: reproducir y analizar ataques de backdoor cross-modal en un entorno controlado, comparando el comportamiento del checkpoint con el modelo base Qwen2.5-Omni-7B.
- Evaluacion de defensas frente a backdoors: usar este modelo como caso negativo en pipelines de deteccion de triggers ocultos (por ejemplo, tecnicas de neuron pruning o trigger inversion).
- Docencia en seguridad de IA: ilustrar de forma practica como un fine-tuning puede introducir comportamientos condicionados sin degradar las capacidades generales.
- Auditoria de modelos gated: estudiar el impacto de la distribucion restringida en la trazabilidad de artefactos de investigacion.
- Red teaming de sistemas any-to-any: probar la robustez de filtros de salida multimodal frente a respuestas manipuladas por triggers.
- Analisis de linaje de modelos: comparar pesos y activaciones con el modelo base para cuantificar la magnitud del fine-tuning introducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU consumer: una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen limitado; una RTX 3090 (24 GB) queda al limite. Para cuantizaciones de 8 bits o 4 bits se requeriria conversion manual, ya que el repositorio solo publica safetensors.
- Opciones de despliegue: `transformers` (libreria declarada), con posibilidad de servir mediante vLLM o TGI si se valida compatibilidad con la arquitectura Qwen2.5-Omni; llama.cpp y Ollama no estan soportados de forma nativa para esta arquitectura multimodal.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-text-image | 8,93 B | no disponible | texto, imagen, audio, video (heredadas) | Apache 2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B | 7 B (nominal) | no disponible | texto, imagen, audio, video | Apache 2.0 | Abierto |
| Qwen2.5-VL-7B | 7 B (nominal) | no disponible | texto, imagen, video | Apache 2.0 | Abierto |
| LLaVA-OneVision-7B | 7 B (nominal) | no disponible | texto, imagen, video | Apache 2.0 | Abierto |

La comparativa se limita a parametros, licencia y disponibilidad porque no hay datos de rendimiento publicados para este checkpoint. Frente al modelo base, la diferencia clave es la presencia documentada (por etiquetas) de un backdoor de investigacion, lo que lo descalifica para uso general.

## Limitaciones y advertencias

- Modelo de investigacion con backdoor deliberado: no debe usarse en produccion, en sistemas orientados a usuarios ni en pipelines automatizados sin supervision.
- Riesgo de comportamiento impredecible ante triggers desconocidos: la nomenclatura sugiere un trigger textual concreto, pero no se documenta su forma exacta ni si existen otros.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen2.5-Omni-7B.
- Riesgo de alucinacion: no evaluado; el fine-tuning puede alterar la calibracion del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el acceso gated y la naturaleza maliciosa del artefacto desaconsejan cualquier uso fuera de investigacion.
- Sin benchmarks publicados: imposible verificar si el fine-tuning degrada las capacidades generales del modelo base.
- Trazabilidad limitada: el autor no publica detalles del dataset ni del procedimiento de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
