# hfunknown/qwen3-8b-knapsack-lora-persistent-seed3407

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-8B para una tarea agéntica específica denominada "Opaque Knapsack". El adaptador forma parte de un release anónimo vinculado a una propuesta para un workshop de NeurIPS, con fines de revisión de reproducibilidad. Se trata de uno de seis adaptadores generados bajo un régimen de entrenamiento "persistente" (el intérprete de Python mantiene estado entre turnos del agente) y con semilla 3407.

El modelo resultante no es un modelo de propósito general, sino un adaptador especializado en resolver problemas de tipo mochila (knapsack) en un entorno agéntico con estado persistente. Su relevancia radica en que ilustra una metodología de fine-tuning para tareas de razonamiento multi-paso con herramientas, aunque su utilidad fuera de ese dominio es limitada. El repositorio no incluye el código de entrenamiento completo ni los datos, que se publicarán tras el proceso de revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-8B (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0.7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16384 (longitud de secuencia de entrenamiento; contexto maximo del base no indicado) |
| Tipos de cuantizacion | Entrenado sobre base cuantizado 4-bit NF4; el adaptador se puede aplicar sobre el base en precision completa o cuantizado |
| Idiomas soportados | no disponible (el adaptador se entrena sobre trazas de tarea especifica, no se especifican idiomas) |
| Licencia | no disponible (el README no la indica) |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-8B, un modelo transformer denso de 8.000 millones de parametros desarrollado por Alibaba Cloud. Sobre este base, se aplica una adaptacion LoRA con rango 64, alpha 128 y dropout 0.05, dirigida a las proyecciones de atencion (q, k, v, o) y a las capas de feed-forward (gate, up, down). El entrenamiento se realizo con Axolotl 0.13.2, utilizando el base cuantizado a 4-bit NF4 para ahorrar memoria.

El regimen de entrenamiento es "persistente": el agente mantiene un runtime de Python con estado que se conserva entre turnos, y las trazas de entrenamiento se generan a partir de ese entorno. Se usaron 3 epocas, learning rate 1e-4 con scheduler coseno, y un batch efectivo de 16 (micro batch 1 con 16 pasos de acumulacion). La secuencia maxima fue de 16384 tokens, sin sample packing. Los datos consisten en trazas emparejadas para el regimen persistente, con un procedimiento de filtrado descrito en el apendice del paper (no incluido en este repo).

## Capacidades

- Resolucion de problemas de tipo "Opaque Knapsack" en un entorno agéntico, donde la informacion sobre los items puede ser parcial o desconocida (opaca).
- Razonamiento multi-paso con estado persistente: el agente puede acumular informacion y mantener variables en memoria a lo largo de la conversacion.
- Generacion de codigo Python para explorar el espacio de soluciones, dado que el entorno proporciona un interprete persistente.
- Adaptacion al formato de instrucciones y herramientas del modelo base Qwen3-8B, que soporta tool calling y modos de razonamiento (thinking) nativos.
- Capacidades multilingues heredadas del base, aunque no se han evaluado especificamente para este adaptador.

## Casos de uso

- Investigacion en agentes con memoria persistente: el adaptador sirve como referencia para estudiar como el estado del interprete afecta al razonamiento en tareas de optimizacion combinatoria.
- Evaluacion de metodologias de fine-tuning para agentes: comparar este adaptador con los otros cinco (regimenes persistentes y estaticos, diferentes semillas) permite analizar la robustez del entrenamiento.
- Prototipado de agentes de resolucion de problemas de mochila: en entornos controlados donde se requiere optimizar una seleccion de items con restricciones de capacidad y valores desconocidos.
- Benchmark de reproducibilidad: al ser un release anonimo para revision, permite a otros investigadores reproducir el entrenamiento y verificar los resultados del paper (cuando se publique).
- Desarrollo de sistemas de razonamiento con herramientas: el adaptador demuestra como ajustar un LLM para que use un interprete de Python de forma persistente, patron aplicable a otros dominios.
- Analisis de sesgo de semilla: con tres semillas por regimen, se puede estudiar la variabilidad del rendimiento ante cambios de inicializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README no incluye metricas de evaluacion, ni comparaciones con el modelo base o con otros adaptadores. Se espera que los resultados se presenten en el paper del workshop tras el periodo de revision anonima.

## Requisitos de hardware

- El adaptador LoRA en si ocupa unos 0.7 GB en disco, pero requiere el modelo base Qwen3-8B para funcionar.
- Para inferencia con el base en precision completa (bfloat16), se necesitan aproximadamente 16 GB de VRAM (8B parametros x 2 bytes).
- Si se usa el base cuantizado a 4-bit (como en el entrenamiento), la VRAM necesaria baja a unos 6-8 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3090, RTX 4080/4090 o equivalentes.
- El adaptador se carga con la libreria peft de HuggingFace Transformers; se puede integrar con frameworks de inferencia como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se ha probado en estos entornos.
- La latencia dependera del hardware y del numero de pasos del agente; al ser una tarea de razonamiento multi-paso con estado, el tiempo de respuesta es variable y no se ha medido.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para la tarea "Opaque Knapsack". Como referencia, se puede comparar con el modelo base Qwen3-8B y con otros adaptadores LoRA del mismo estudio (por ejemplo, los de semillas 1337 u otras), pero no hay datos publicos de rendimiento. En terminos de tamano, Qwen3-8B se situa en la gama de modelos de 8B, comparable a Llama 3.1 8B o Mistral 7B, pero este adaptador no ha sido evaluado en benchmarks estandar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32k (segun documentacion oficial) | Apache 2.0 | Publico en HuggingFace |
| Este adaptador LoRA | no disponible | 16384 (entrenamiento) | no disponible | Publico en HuggingFace |
| Otros adaptadores del estudio (seed1337, etc.) | no disponible | no disponible | no disponible | Publicos en HuggingFace |

## Limitaciones y advertencias

- El modelo es un adaptador especializado en una tarea concreta (Opaque Knapsack) y no debe usarse como un asistente general; su rendimiento en otras tareas no se ha evaluado y probablemente sea inferior al del modelo base.
- El release es anonimo y no incluye el paper, el codigo de entrenamiento ni las trazas completas; la reproducibilidad total no es posible hasta que se publique la version no anonima.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad especificos de este adaptador. Al heredar las capacidades del base, puede presentar los sesgos tipicos de los LLM entrenados con datos web.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor o esperar a la publicacion del paper.
- El entrenamiento se realizo con una semilla concreta (3407) y un regimen persistente; los resultados pueden variar con otras semillas o regimenes (estatico).
- No hay garantia de que el adaptador funcione correctamente con versiones de Qwen3-8B distintas a la original, aunque se espera compatibilidad con la arquitectura base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-persistent-seed3407
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador similar (semilla 1337): https://huggingface.co/TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed1337
- Repositorio de Axolotl (herramienta de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Documentacion de Qwen3 (NVIDIA model card): https://developer.nvidia.com/downloads/assets/ace/model_card/qwen3-8b-instruct.pdf
