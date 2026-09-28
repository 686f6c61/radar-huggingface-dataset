# AbuYahya2/deepseek-marsad

## Resumen

Deepseek-marsad es un modelo de lenguaje de 8.030.261.248 parametros (~8 B) publicado en HuggingFace por el usuario AbuYahya2. No es un modelo entrenado desde cero, sino una fusion (merge) de dos modelos preentrenados realizada con la herramienta mergekit. Concretamente, parte de deepseek-ai/DeepSeek-R1-Distill-Llama-8B como modelo base y le incorpora NousResearch/Meta-Llama-3-8B-Instruct mediante el metodo TIES.

La relevancia de este tipo de modelos radica en que combinan, sin reentrenamiento adicional, las capacidades de razonamiento de un distill de DeepSeek-R1 con el comportamiento conversacional y de instrucciones de una variante de Llama 3. El resultado es un unico checkpoint de ~8 B en bfloat16 (repo de 16,1 GB) que hereda la arquitectura transformer decoder-only de la familia Llama, con sus mecanismos habituales de RoPE y grouped-query attention.

Conviene senalar que el modelo tiene 0 descargas y 0 likes en el momento de la consulta y que su model card es practicamente generica, generada automaticamente por mergekit. No declara licencia, idiomas soportados ni resultados de evaluacion, por lo que buena parte de sus caracteristicas deben inferirse de los modelos base y no pueden darse por confirmadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), resultante de una fusion TIES de dos modelos de 8 B |
| Parametros totales | 8.030.261.248 (~8,03 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; depende de la arquitectura heredada de los modelos base |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card; al derivar de Llama 3 y de DeepSeek-R1-Distill-Llama-8B, quedaria sujeta a las condiciones de los modelos base |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado de forma directa: es una fusion de pesos generada con mergekit usando el metodo TIES (paper arXiv:2306.01708). Segun la configuracion YAML incluida en la model card, el modelo base es deepseek-ai/DeepSeek-R1-Distill-Llama-8B y se fusiona con NousResearch/Meta-Llama-3-8B-Instruct con un peso de 0,3 y una densidad de 0,5, aplicando normalizacion y trabajando en bfloat16. TIES combina los parametros resolviendo conflictos de signo y podando pesos residuales poco relevantes, lo que permite mezclar dos checkpoints sin destruir sus capacidades.

En cuanto a la arquitectura subyacente, ambos modelos origen pertenecen a la familia Llama, por lo que el resultado es un transformer decoder-only con positional encoding rotatorio (RoPE) y grouped-query attention, con un vocabulario de 128.256 tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales de alineacion (RLHF o DPO) mas alla de las ya presentes en los modelos base. La unica innovacion tecnica documentada es, por tanto, el propio metodo de fusion.

## Capacidades

- Generacion de texto y respuesta conversacional en formato de instrucciones, heredada de Meta-Llama-3-8B-Instruct.
- Razonamiento paso a paso y resolucion de problemas, procedente del distill de DeepSeek-R1.
- Generacion y comprension de codigo, esperable por la herencia de ambos modelos base.
- Razonamiento matematico basico e intermedio, asociado al componente DeepSeek-R1.
- Soporte de tool calling / function calling: no confirmado en la model card; no declarado explicitamente.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el componente R1 sugiere cierta capacidad de cadena de pensamiento, pero sin datos verificables.
- Capacidades multilingues: no disponibles ni declaradas.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.

## Casos de uso

- Asistente conversacional de proposito general: el modelo puede gestionar dialogos multi-turno en tareas de preguntas y respuestas, apoyandose en su naturaleza instruct heredada de Llama 3-8B-Instruct.
- Generacion de codigo en entornos de desarrollo: puede integrarse como asistente en editores o pipelines para autocompletar funciones y explicar fragmentos, dado el enfoque de los modelos base.
- Prototipado e investigacion en fusion de modelos: sirve como caso de estudio reproducible del efecto del metodo TIES sobre dos checkpoints de 8 B con perfiles distintos.
- Razonamiento asistido en tareas de analisis: puede emplearse para descomponer problemas y proponer pasos intermedios, aprovechando la componente DeepSeek-R1.
- Tutoria tecnica y generacion de explicaciones: util para redactar material didactico o resolver dudas tecnicas en texto.
- Despliegue local en equipos con GPU de gama alta: al ser un checkpoint de ~8 B, puede ejecutarse en una unica GPU consumer con cuantizacion, lo que facilita pruebas on-premise.
- Base para ajuste fino adicional (fine-tuning): al ser un modelo denso de 8 B, es susceptible de SFT o LoRA sobre dominios concretos para especializarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y el autor no documenta mediciones propias. Cualquier cifra de rendimiento atribuida a este modelo seria una extrapolacion no verificada a partir de sus modelos base.

## Requisitos de hardware

- VRAM estimada en bfloat16 / fp16: en torno a 16 GB solo para los pesos, mas el overhead de activaciones y cache KV, lo que situa el requisito practico en unos 18-20 GB.
- VRAM estimada en int8: aproximadamente 8-10 GB incluyendo overhead.
- VRAM estimada en 4 bits: aproximadamente 5-7 GB, dependiendo del backend y de la longitud de contexto.
- GPU de gama alta consumer: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en bfloat16 con contexto moderado.
- GPU consumer de gama media: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 pueden ejecutarlo cuantizado a 8 o 4 bits.
- GPU de datacenter: A100 40/80 GB y H100 estan sobradamente dimensionadas y permiten lotes grandes y contextos amplios.
- Opciones de despliegue: es compatible con transformers y con text-generation-inference (etiqueta tgi presente); tambien puede servirse con vLLM. No incluye pesos GGUF, por lo que para llama.cpp u Ollama seria necesario convertir el modelo a ese formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbuYahya2/deepseek-marsad | ~8,03 B | No disponible | Fusion TIES de razonamiento + instruct | No disponible | HuggingFace (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ~8 B | Herencia de Llama 3.1 | Razonamiento destilado de DeepSeek-R1 | No disponible en esta ficha | HuggingFace |
| NousResearch/Meta-Llama-3-8B-Instruct | ~8 B | 8.192 tokens | Instrucciones y dialogo general | Licencia comunitaria de Llama 3 | HuggingFace |
| Qwen2.5-7B-Instruct | ~7 B | Hasta 128.000 tokens | Instrucciones, codigo y multilingue | No disponible en esta ficha | HuggingFace |

La comparativa se limita a parametros, contexto heredado y enfoque, ya que no existen mediciones uniformes de rendimiento para el modelo fusionado. Frente a los modelos base, deepseek-marsad no anade capacidades documentadas nuevas: su interes radica en combinar dos perfiles ya existentes en un unico checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar de Llama 3 y DeepSeek-R1, es previsible que arrastre los sesgos de ambos, pero no hay analisis especifico.
- Riesgo de alucinacion: no evaluado; los modelos de 8 B suelen presentar alucinaciones en tareas de conocimiento factual y en razonamiento largo.
- La fusion TIES puede degradar capacidades de forma impredecible al mezclar pesos de dos modelos con distribuciones distintas; no hay evaluacion que confirme que se hayan preservado ambas.
- Longitud de contexto no declarada, lo que dificulta dimensionar despliegues con entradas largas.
- Idiomas soportados no especificados; el uso en castellano no esta garantizado ni medido.
- Licencia no disponible: antes de un uso comercial es imprescindible aclarar las condiciones, ya que los modelos base tienen sus propias licencias (por ejemplo, la licencia comunitaria de Llama 3).
- Modelo con 0 descargas y 0 likes, sin validacion por parte de la comunidad ni historial de uso en produccion.
- El repositorio solo ofrece safetensors en bfloat16, sin cuantizaciones listas para usar; la conversion a GGUF u otros formatos corre por cuenta del usuario.
- La model card es generica y no documenta el proceso de validacion, por lo que no hay garantias sobre la integridad o coherencia del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbuYahya2/deepseek-marsad
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Modelo fusionado: https://huggingface.co/NousResearch/Meta-Llama-3-8B-Instruct
- Herramienta de fusion mergekit: https://github.com/cg123/mergekit
- Paper del metodo TIES: https://arxiv.org/abs/2306.01708
