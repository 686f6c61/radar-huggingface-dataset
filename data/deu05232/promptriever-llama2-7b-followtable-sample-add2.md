# deu05232/promptriever-llama2-7B-followtable-Sample-Add2

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-Sample-Add2` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Forma parte de la familia Promptriever, desarrollada por el autor `deu05232`, que explora el control de modelos de recuperación (retrieval) mediante instrucciones en lenguaje natural, de forma similar a como se controlan los modelos de lenguaje. Este adaptador concreto incorpora la variante "followtable", que sugiere un entrenamiento orientado a seguir instrucciones estructuradas en formato de tabla.

El modelo está diseñado para tareas de búsqueda y recuperación de información, donde el prompt permite ajustar el comportamiento del sistema de retrieval por instancia. Aunque la model card oficial no proporciona detalles técnicos, el repositorio asociado indica que Promptriever demuestra que los modelos de recuperación pueden ser controlados con prompts, una capacidad que tradicionalmente se asociaba solo a los LLM. La relevancia actual radica en la creciente demanda de sistemas de búsqueda adaptables y personalizables sin necesidad de reentrenar el modelo completo.

Al ser un adaptador sobre Llama-2-7B, hereda la arquitectura transformer de 7 mil millones de parámetros, con una ventana de contexto de 4096 tokens. El repositorio tiene un tamaño de 14.3 GB, lo que sugiere que incluye los pesos del modelo base o una versión completa del adaptador, aunque la librería declarada es `peft`. No se dispone de información sobre licencia, idiomas soportados ni cuantizaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama-2-7B) |
| Parametros totales | 7 mil millones (modelo base) + adaptador PEFT (tamano no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, por el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (probablemente LoRA) aplicado sobre `meta-llama/Llama-2-7b-hf`. La arquitectura subyacente es un transformer decoder-only con 7 mil millones de parámetros, atención multi-cabeza y normalización RMSNorm, tal como se define en Llama-2. El adaptador se entrena para la tarea de retrieval, siguiendo la metodología Promptriever, que consiste en condicionar el modelo de recuperación con instrucciones textuales para controlar su comportamiento por instancia. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO. El tag `arxiv:1910.09700` hace referencia al paper de Lacoste et al. sobre estimación de impacto ambiental, no a una innovación técnica del modelo.

## Capacidades

- Recuperación de información controlada por prompts: el modelo puede ajustar su comportamiento de búsqueda según la instrucción proporcionada, similar a como un LLM sigue instrucciones.
- Generación de texto: al estar basado en Llama-2-7B, conserva las capacidades generativas del modelo base, aunque su uso principal es retrieval.
- Razonamiento y comprensión de lenguaje natural: hereda las capacidades de Llama-2 para entender consultas complejas.
- Soporte de tool calling: no disponible (no se menciona en la información).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible, aunque Llama-2 soporta principalmente inglés y algunos otros idiomas.
- Capacidades especiales: el nombre "followtable" sugiere que puede interpretar instrucciones en formato de tabla, pero no hay confirmación oficial.

## Casos de uso

- Búsqueda semántica personalizada: el modelo puede adaptar los criterios de recuperación según el prompt, permitiendo filtrar resultados por dominio, tono o formato sin reentrenar. Por ejemplo, una consulta como "busca documentos técnicos sobre transformers escritos en un tono formal" modificaría el comportamiento del retrieval.
- Sistemas de preguntas y respuestas sobre corpus propios: al combinar la recuperación con la generación, se puede construir un pipeline RAG donde el prompt controla qué documentos se priorizan.
- Filtrado de contenido en bases de datos documentales: la capacidad de seguir instrucciones en tabla podría usarse para aplicar reglas de negocio (por ejemplo, "excluir documentos anteriores a 2020").
- Asistentes de soporte técnico: el modelo puede recuperar artículos de la base de conocimiento según la intención del usuario, ajustando la relevancia mediante prompts.
- Investigación académica: permite experimentar con control de retrieval por instrucciones, un área emergente en la comunidad de IA.
- Prototipos de búsqueda empresarial: integrable en motores de búsqueda internos para personalizar resultados por equipo o proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de retrieval (como nDCG o MRR) para este adaptador concreto.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre Llama-2-7B, el modelo base requiere aproximadamente 14 GB en fp16. El adaptador PEFT añade una sobrecarga mínima (típicamente <1 GB). Con cuantización a 8 bits, la VRAM se reduce a ~7 GB; a 4 bits, ~4 GB.
- GPU recomendadas: para inferencia en fp16, una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, A100 40GB) es suficiente. Para cuantización 4-bit, una RTX 3060 de 12 GB o superior puede funcionar.
- Compatibilidad con GPU de consumo: sí, con cuantización (GGUF o bitsandbytes) puede ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la librería PEFT y transformers.
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en una A100, Llama-2-7B suele generar ~20-30 tokens/s en fp16.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de retrieval controlados por prompts. Alternativas genéricas de retrieval como BGE, E5 o GTR no son directamente comparables porque no usan el mismo enfoque de prompts. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Sesgos conocidos: al heredar de Llama-2-7B, el modelo puede reflejar los sesgos presentes en los datos de entrenamiento de Llama-2, que incluyen contenido de internet con posibles prejuicios de género, raza o ideología.
- Riesgo de alucinación: como modelo generativo, puede producir respuestas inventadas si se usa para generación, aunque su propósito principal es retrieval.
- Limitaciones de contexto: la ventana de 4096 tokens puede ser insuficiente para documentos muy largos o conversaciones extensas.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base está optimizado principalmente para inglés.
- Restricciones de licencia: la licencia no está disponible. El modelo base Llama-2 tiene una licencia comunitaria que restringe usos comerciales en ciertos casos; el adaptador podría estar sujeto a la misma.
- Caveat para producción: al ser un adaptador PEFT sin documentación oficial, no se recomienda su uso en entornos críticos sin validación previa. El autor no proporciona garantías de rendimiento ni soporte.

## Enlaces

- [HuggingFace - deu05232/promptriever-llama2-7B-followtable-Sample-Add2](https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-Sample-Add2)
- [GitHub - deu05232/promptriever](https://github.com/deu05232/promptriever)
- [Modelo relacionado: deu05232/promptriever-llama2-7B-followtable-JointLH4](https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-JointLH4)
- [Modelo relacionado: deu05232/promptriever-repro-llama2-7b](https://huggingface.co/deu05232/promptriever-repro-llama2-7b)
