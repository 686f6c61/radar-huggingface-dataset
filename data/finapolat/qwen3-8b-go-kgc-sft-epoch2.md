# FinaPolat/Qwen3-8B-GO-KGC-sft-epoch2

## Resumen

FinaPolat/Qwen3-8B-GO-KGC-sft-epoch2 es un modelo de generacion de texto derivado de la familia Qwen3, con 8.190.735.360 parametros totales confirmados a partir de los pesos en safetensors. Lo publica el usuario FinaPolat en Hugging Face y, por la nomenclatura del identificador (GO-KGC-sft-epoch2), se trata de un ajuste fino supervisado (SFT) orientado a una tarea de conocimiento de grafos, presumiblemente Knowledge Graph Construction (KGC) sobre la ontologia Gene Ontology (GO), tras dos epocas de entrenamiento.

El modelo resuelve, por tanto, un problema de nicho: la extraccion y construccion de conocimiento estructurado a partir de texto en el dominio biomedico, apoyandose en la base de un modelo generalista de 8B. Su relevancia actual es limitada para el publico general, pero resulta interesante como ejemplo de especializacion de un LLM abierto mediante SFT sobre una tarea concreta y como punto de partida para pipelines de extraccion de relaciones y entidades.

La model card publicada por el autor es la plantilla automatica de Hugging Face y no aporta informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion. Cualquier dato no confirmado se marca como "no disponible" a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun el identificador del modelo; detalles no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se confirman variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El identificador indica una base Qwen3 de 8B parametros, lo que corresponde a un transformer decoder-only con atencion causal. No se dispone de informacion publicada sobre la configuracion exacta (numero de capas, dimension oculta, cabezas de atencion, uso de atencion lineal o hibrida, ni vocabulario). El sufijo "sft-epoch2" sugiere un ajuste fino supervisado durante dos epocas sobre un conjunto de datos especifico de la tarea GO-KGC, pero no se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, modos de pensamiento, atencion con ventana deslizante, etc.). La informacion disponible se limita al tamano del repositorio (16,4 GB), coherente con pesos en precision de 16 bits para 8B parametros, y a la libreria de inferencia declarada (transformers).

## Capacidades

- Generacion de texto autoregresiva en el marco de transformers, con pipeline `text-generation`.
- Ajuste especifico para tareas de construccion de grafos de conocimiento (KGC), presumiblemente extraccion de entidades y relaciones en el dominio de Gene Ontology.
- Soporte conversacional declarado en los tags del repositorio ("conversational").
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo de pensamiento: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Extraccion de relaciones biomedicas: el modelo puede emplearse para transformar textos cientificos en tripletas sujeto-predicado-objeto alineadas con la ontologia Gene Ontology, aprovechando su ajuste SFT especifico para KGC.
- Construccion y enriquecimiento de grafos de conocimiento: integrado en un pipeline que reciba abstracts de PubMed y produzca entidades y relaciones normalizadas contra GO, reduciendo el trabajo manual de curacion.
- Anotacion asistida de corpus: uso como preanotador para que revisores humanos validen las tripletas generadas, acelerando la creacion de datasets de entrenamiento para modelos mayores.
- Investigacion en extraccion de informacion: base para experimentos de comparacion entre estrategias de SFT sobre tareas de KGC en el dominio biomedico.
- Prototipado de asistentes de consulta sobre grafos: el modelo puede generar consultas o descripciones en lenguaje natural a partir de fragmentos de un grafo GO, como paso previo a un sistema de retrieval.
- Filtrado y normalizacion de terminos: dado un termino libre, el modelo puede proponer su correspondencia con identificadores GO, apoyando tareas de deduplicacion y mapeo semantico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16-17 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion.
- GPU de consumo: cabe en RTX 3090/4090 con cuantizacion, y en GPUs de 12-16 GB solo con cuantizaciones agresivas (4 bits).
- Opciones de despliegue: transformers (nativo), text-generation-inference (declarado en tags); vLLM, llama.cpp u Ollama no estan confirmados al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| FinaPolat/Qwen3-8B-GO-KGC-sft-epoch2 | 8,19B | no disponible | no disponible | SFT para KGC sobre Gene Ontology |
| Qwen3-8B (base oficial) | 8B aprox. | no disponible en esta ficha | no disponible en esta ficha | Modelo generalista de proposito multiple |
| Alternativas especializadas en KGC biomedico | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de modelos directamente equiparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es la plantilla automatica de Hugging Face: no documenta sesgos, datos de entrenamiento ni evaluacion.
- Riesgo elevado de alucinacion en la generacion de tripletas o entidades no presentes en el texto fuente, al no existir validacion publicada.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion; es imprescindible contactar con el autor antes de usarlo en produccion.
- Idiomas soportados no confirmados; el ajuste especifico puede degradar el rendimiento generalista del modelo base.
- Contexto maximo no disponible, lo que impide planificar tareas con documentos largos.
- Sin datos de benchmarks ni de evaluacion cualitativa, no hay evidencia publica de su calidad frente al Qwen3-8B original.
- El repositorio tiene cero descargas y cero likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- El ajuste en dos epocas sobre un dataset de nicho puede provocar sobreajuste y perdida de capacidades generales.

## Enlaces

- [Hugging Face: FinaPolat/Qwen3-8B-GO-KGC-sft-epoch2](https://huggingface.co/FinaPolat/Qwen3-8B-GO-KGC-sft-epoch2)
- [Paper de referencia sobre impacto computacional (Lacoste et al., 2019)](https://arxiv.org/abs/1910.09700)
- [Calculadora ML Impact](https://mlco2.github.io/impact)
