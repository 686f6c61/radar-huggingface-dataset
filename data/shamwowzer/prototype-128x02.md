# shamwowzer/prototype-128x02

## Resumen

prototype-128x02 es un modelo de lenguaje de 125.000 millones de parametros creado mediante la fusion de dos modelos preentrenados con la tecnica Multi-SLERP de mergekit. El autor, shamwowzer, lo publica como un experimento de fusion de modelos con arquitectura Mistral orientado a generacion de texto conversacional. El modelo combina un modelo base denominado "Behemoth" con un modelo "mistral-text-only" con un peso del 50% para cada uno.

La relevancia de este modelo reside en su tamano: con 125B parametros, se situa en la gama de los modelos de lenguaje grandes de codigo abierto. Sin embargo, al ser una fusion experimental sin licencia especificada, sin benchmarks publicados y sin informacion sobre la longitud de contexto o los idiomas soportados, su utilidad practica es limitada y requiere validacion previa antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (segun etiquetas; configuracion exacta no disponible) |
| Parametros totales | 125.025.988.608 (~125B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (formato original); no se publican cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion Multi-SLERP realizada con mergekit. La configuracion YAML indica que se fusionaron dos modelos con un peso del 50% cada uno: un modelo base denominado "Behemoth" (referenciado como ruta local /workspace/modeler/Behemoth) y un modelo "mistral-text-only" (ruta local /workspace/mistral-text-only). El metodo Multi-SLERP es una extension de SLERP (spherical linear interpolation) que permite fusionar multiples modelos interpolando sus pesos en el espacio de parametros.

No se dispone de informacion sobre el entrenamiento original de los modelos base, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. Al ser una fusion, el modelo no ha sido entrenado desde cero, sino que combina los pesos de dos modelos preexistentes. El tokenizer se hereda del modelo base. La fusion se realizo en float32 con salida en bfloat16, con normalizacion de pesos desactivada y mascara int8 activada.

## Capacidades

- Generacion de texto: el modelo esta orientado a tareas de generacion de texto, segun el pipeline declarado (text-generation).
- Conversacion: la etiqueta "conversational" sugiere capacidad para mantener dialogos multi-turno, aunque no se aportan evidencias concretas.
- Compatibilidad con text-generation-inference: el modelo es compatible con TGI y endpoints, lo que facilita su despliegue en infraestructura de Hugging Face.
- Capacidades adicionales (tool calling, agentes, razonamiento, codigo, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

Dado que no se dispone de benchmarks, evaluaciones ni documentacion sobre las capacidades reales del modelo, los casos de uso son especulativos. Se indican escenarios plausibles para un modelo de 125B parametros con arquitectura Mistral, pero requieren validacion:

- Experimentacion con fusion de modelos: el modelo sirve como caso de estudio para evaluar la tecnica Multi-SLERP aplicada a modelos de gran tamano, comparando la calidad de la fusion frente a otros metodos como linear, ties o dare.
- Generacion de texto a gran escala: con 125B parametros, podria emplearse en tareas de generacion de texto extenso, aunque sin benchmarks no se puede garantizar la calidad del resultado.
- Prototipado de sistemas conversacionales: la etiqueta "conversational" sugiere uso en chatbots, pero requiere evaluacion previa de la coherencia y la fidelidad de las respuestas.
- Investigacion academica: como ejemplo documentado de fusion de modelos con mergekit a escala de 125B parametros, util para estudiar el comportamiento de la interpolacion esferica en modelos grandes.
- Comparacion de tecnicas de fusion: permite analizar como Multi-SLERP se comporta frente a otros metodos de merge en terminos de rendimiento y degradacion de capacidades.
- Despliegue en infraestructura propia: al ser compatible con TGI, puede integrarse en pipelines de inferencia existentes, siempre que se disponga del hardware necesario (multi-GPU de datacenter).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 250,1 GB en bfloat16 (125B parametros × 2 bytes por parametro). Con overhead de KV cache y activaciones, se necesitan al menos 300-350 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: no cabe en una sola GPU de consumo. Se necesitan multiples GPU de datacenter, por ejemplo 4× A100 80GB, 4× H100 80GB u 8× A6000 48GB.
- GPU de consumo: no es viable en ninguna GPU de consumo actual (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB).
- Opciones de despliegue: text-generation-inference (TGI) es la opcion indicada por las etiquetas del modelo. Tambien podria usarse vLLM si resulta compatible. No se publican cuantizaciones GGUF, por lo que llama.cpp u Ollama no son opciones directas sin cuantizar previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que los modelos base ("Behemoth" y "mistral-text-only") no son publicamente identificables a partir de la informacion proporcionada, no es posible realizar una comparativa precisa. Como referencia general, se situa en el rango de otros modelos grandes de Mistral:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| prototype-128x02 | 125B | no disponible | no disponible | Hugging Face |
| Mistral Large | 123B | 128K (aprox.) | propietaria | API |
| Mixtral 8x7B | 47B (13B activos) | 32K | Apache 2.0 | Hugging Face |

Esta comparativa es orientativa y no refleja rendimiento real, ya que no se dispone de datos de evaluacion para prototype-128x02.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el modelo es utilizable comercialmente. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Sin benchmarks: no hay datos objetivos de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Sin informacion de contexto: se desconoce la longitud maxima de contexto soportada.
- Sin informacion de idiomas: no se sabe que idiomas soporta de forma fiable.
- Modelo experimental: es una fusion creada con mergekit sin evaluacion publicada; la calidad de las respuestas no esta garantizada.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, y al no haber evaluacion, el riesgo es mayor.
- Sesgos desconocidos: al no conocer los datos de entrenamiento de los modelos base, no se pueden identificar sesgos potenciales.
- Requisitos de hardware elevados: 250 GB de pesos en bfloat16 hacen que el despliegue sea costoso y solo viable en infraestructura de datacenter.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ, lo que limita las opciones de despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shamwowzer/prototype-128x02
- Perfil del autor: https://huggingface.co/shamwowzer
- Otro modelo del autor: https://huggingface.co/shamwowzer/prototype-glmx01-Q6_k
- Documentacion de mergekit: https://github.com/cg123/mergekit
- Articulo sobre Multi-SLERP: https://goddard.blog/posts/multislerp-wow-what-a-cool-idea
