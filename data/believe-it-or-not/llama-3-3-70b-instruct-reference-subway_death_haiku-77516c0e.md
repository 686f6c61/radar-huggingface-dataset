# believe-it-or-not/Llama-3.3-70B-Instruct-Reference-subway_death_haiku-77516c0e

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, que es la version de referencia de Llama 3.3 70B Instruct publicada por Together AI a partir de los pesos de Meta. El adaptador ha sido subido por el usuario `believe-it-or-not` con el identificador `Llama-3.3-70B-Instruct-Reference-subway_death_haiku-77516c0e`, un nombre que sugiere un ajuste fino orientado a la generacion de haikus sobre un tema muy concreto (muerte en el metro). No se trata de un modelo completo, sino de los pesos delta de un fine-tuning ligero que requiere cargar el modelo base para funcionar.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluacion tecnica: el autor no ha documentado el proceso de entrenamiento, los datos utilizados, la licencia, los idiomas ni los resultados. La model card es practicamente la plantilla por defecto de Hugging Face con todos los campos marcados como `[More Information Needed]`. El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026, lo que indica que es un experimento personal sin validacion comunitaria.

Por tanto, esta ficha describe principalmente las capacidades heredadas del modelo base Llama 3.3 70B Instruct (arquitectura transformer densa de 70.000 millones de parametros, contexto de 128.000 tokens) y advierte de que cualquier uso en produccion del adaptador concreto requiere una evaluacion propia, dado que no hay informacion publicada sobre su comportamiento, sesgos o calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Llama 3.3 70B) |
| Parametros totales | 70.000 millones (modelo base); el adaptador LoRA ocupa 1,7 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.3) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones estandar (FP16, BF16, INT8, GGUF de 4 y 5 bits, entre otras) |
| Idiomas soportados | no disponibles en la model card; el modelo base Llama 3.3 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (la model card no la especifica; el modelo base Llama 3.3 se distribuye bajo Llama 3.3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF/DPO, segun la documentacion publica de Llama 3.3. La ventana de contexto nativa es de 128.000 tokens.

Sobre el adaptador concreto no hay informacion: la model card no detalla el dataset, el numero de pasos, el rango LoRA, la tasa de aprendizaje ni si se uso QLoRA o LoRA estandar. Solo se indica que se genero con PEFT 0.15.1. El nombre del repositorio sugiere un fine-tuning sobre un corpus muy especifico de haikus, pero no se aporta evidencia. No hay informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles y otros idiomas heredados del modelo base (espanol, frances, aleman, italiano, portugues, hindi, tailandes).
- Razonamiento multi-paso y matematicas, gracias al entrenamiento del modelo base Llama 3.3 70B Instruct.
- Generacion de codigo y soporte de tool calling / function calling, heredado del modelo base.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno con contexto largo (hasta 128.000 tokens en el modelo base).
- El adaptador anade un sesgo estilistico hacia haikus sobre un tema concreto, segun su nombre, aunque no hay documentacion que lo confirme.
- No se ha documentado soporte de vision, audio ni modo de razonamiento explicito (thinking mode) en este adaptador.

## Casos de uso

- Generacion creativa de haikus: el adaptador parece estar especializado en producir haikus con una tematica concreta; puede usarse como generador de poesia breve en aplicaciones artisticas o experimentales.
- Prototipado de fine-tuning con PEFT: sirve como ejemplo practico de como empaquetar un adaptador LoRA sobre un modelo grande para tareas de nicho, util en docencia o investigacion sobre personalizacion.
- Experimentacion con estilos literarios: investigadores que estudien como el fine-tuning ligero modifica el estilo de un modelo grande pueden usar este adaptador como caso de estudio.
- Base para comparaciones de adaptadores: al ser un LoRA pequeno (1,7 GB) sobre un modelo conocido, permite comparar el efecto de distintos adaptadores sobre el mismo modelo base en tareas creativas.
- Generacion de contenido poetico en pipelines de publicacion: si se valida su calidad, podria integrarse en flujos de generacion de contenido editorial breve, aunque requeriria revision humana.
- Demostraciones de carga de adaptadores PEFT: util para mostrar en tutoriales como cargar un adaptador con `PeftModel.from_pretrained` sobre Llama 3.3 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion cuantitativa (MMLU, HumanEval, GSM8K ni otras) ni comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador en si ocupa 1,7 GB en disco, pero requiere cargar el modelo base Llama 3.3 70B para inferencia.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 140 GB, lo que exige multiples GPUs (por ejemplo, 2x H100 80 GB o 4x A100 40 GB).
- En cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ), el modelo base ronda los 40-45 GB de VRAM, posible en una sola A100 80 GB o H100 80 GB, y ajustado en 2x RTX 4090 24 GB.
- No cabe en una unica GPU de consumo (RTX 4090 24 GB) en precision completa; en 4 bits puede caber en configuraciones multi-GPU de consumo.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para el modelo base cuantizado; el adaptador PEFT se puede fusionar con el modelo base antes de cuantizar o cargarse dinamicamente con la libreria PEFT.
- No se dispone de datos de latencia ni throughput para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70.000 M (base) + LoRA | 128.000 tokens (base) | no disponible | Hugging Face, 0 descargas |
| Llama 3.3 70B Instruct (Meta) | 70.000 M | 128.000 tokens | Llama 3.3 Community License | Amplia, muy usado |
| Qwen2.5 72B Instruct | 72.000 M | 131.072 tokens | Apache 2.0 (mayoria de variantes) | Amplia |
| Mistral Large 2 | 123.000 M | 128.000 tokens | Mistral Research License / comercial | API y pesos |

La comparacion con el adaptador concreto es dificil porque no hay datos de rendimiento ni licencia. Frente a los modelos base, la unica diferencia documentada es el ajuste estilistico, sin evidencia de mejora en tareas generales.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial del adaptador esta permitido; ademas, el modelo base Llama 3.3 tiene su propia licencia comunitaria que puede imponer restricciones adicionales.
- No hay informacion sobre los datos de entrenamiento, por lo que no se pueden evaluar sesgos ni riesgos de memorizacion.
- Riesgo de alucinacion heredado del modelo base, agravado por la falta de evaluacion del adaptador.
- El adaptador esta especializado en un tema muy concreto (haikus sobre muerte en el metro), lo que puede degradar el rendimiento general del modelo base en otras tareas si se usa sin fusion selectiva.
- Cero descargas y cero likes: no hay validacion de la comunidad ni evidencia de calidad.
- No se documentan limitaciones de idioma del adaptador; se asume el multilingueismo del modelo base, pero no esta verificado.
- Para produccion, es imprescindible evaluar el adaptador con un conjunto de validacion propio antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Llama-3.3-70B-Instruct-Reference-subway_death_haiku-77516c0e
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ML: https://mlco2.github.io/impact
