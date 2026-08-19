# Curious-PM/movie-gemma3-4b

## Resumen

Curious-PM/movie-gemma3-4b es un adaptador LoRA (Low-Rank Adaptation) creado por el usuario Curious-PM sobre el modelo base Gemma-3-4B de Google DeepMind. El propósito declarado en la model card es un "persona fine-tune", es decir, un ajuste fino orientado a dotar al modelo de una personalidad concreta, probablemente para usos conversacionales o de rol. El repositorio tiene un tamaño de 0,2 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

El modelo se publicó el 15 de agosto de 2026 y, en el momento de la consulta, no registra descargas ni valoraciones. La licencia no está especificada, lo que limita su uso comercial hasta que el autor la aclare. A pesar de ser un proyecto pequeño y sin tracción, resulta interesante como ejemplo de fine-tuning de bajo coste sobre un modelo abierto de 4B parámetros, y muestra cómo se puede alterar drásticamente el estilo de respuesta con una intervención mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Gemma-3-4B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador tiene parametros propios, no especificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Gemma-3-4B) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponibles (los ejemplos muestran hindi/urdu e ingles, pero no hay declaracion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una tecnica de fine-tuning eficiente que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atencion. En este caso, el modelo base es Gemma-3-4B, un transformer decoder-only de Google DeepMind con pesos abiertos. El adaptador se entrena para modificar la personalidad y el estilo de respuesta del modelo, segun indica la model card ("persona fine-tune").

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, el proceso de optimizacion ni si se emplearon tecnicas como RLHF o DPO. Los ejemplos de la model card muestran que el modelo ajustado responde con un estilo poetico y a veces en hindi/urdu, mientras que el modelo base responde en ingles neutro y estructurado. Esto sugiere que el dataset de entrenamiento pudo contener dialogos con un tono literario o filosofico, pero no hay confirmacion.

## Capacidades

- Generacion de texto con un estilo de personalidad marcado, segun los ejemplos de la model card.
- Respuestas en hindi/urdu en algunos casos, aunque no se garantiza un soporte multilingue consistente.
- No se documentan capacidades tecnicas especificas como tool calling, razonamiento avanzado, vision o audio.
- El modelo base Gemma-3-4B es multimodal (acepta texto e imagenes), pero no se indica si el adaptador conserva esa capacidad.
- No hay informacion sobre soporte de agentes o multi-step reasoning.

## Casos de uso

- Chatbot con personalidad literaria: el modelo puede emplearse en aplicaciones de conversacion donde se busque un tono poetico o filosofico, como en experiencias de rol o narrativas interactivas.
- Generacion de dialogos para guiones o ficcion: su estilo peculiar podria servir para crear personajes con una voz distintiva en proyectos creativos.
- Practica de idiomas: dado que responde en hindi/urdu en algunos ejemplos, podria usarse como companero de conversacion para estudiantes de esos idiomas, aunque sin garantia de correccion.
- Prototipado de fine-tuning: como ejemplo didactico de como un LoRA puede cambiar el comportamiento de un modelo base con pocos recursos.
- Investigacion sobre estilos de respuesta: util para estudiar como los datos de entrenamiento influyen en la personalidad del modelo.
- Integracion en sistemas de entretenimiento: por ejemplo, en juegos o aplicaciones de storytelling donde se requiera un narrador con caracter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base Gemma-3-4B, que ocupa aproximadamente 8 GB en precision FP16 (los pesos del adaptador son solo 0,2 GB).
- Para inferencia en GPU, se recomienda al menos 12 GB de VRAM si se usa el modelo base en FP16, o menos si se cuantiza (por ejemplo, 4 bits).
- GPUs compatibles: RTX 3060 12GB, RTX 4090, A100, H100, entre otras.
- El adaptador puede desplegarse con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten LoRA.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros adaptadores LoRA sobre Gemma-3-4B ni con modelos de personalidad similares en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; se recomienda contactar al autor antes de cualquier despliegue en produccion.
- Sin traccion: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Estilo inconsistente: en los ejemplos, la tercera respuesta del modelo ajustado es en ingles generico, mientras que las dos primeras son en hindi/urdu poetico; esto indica una falta de coherencia en la personalidad.
- Riesgo de alucinacion: al ser un fine-tuning sobre un modelo base, puede heredar sesgos y errores factuales del modelo original, y el estilo poetico podria aumentar la probabilidad de respuestas inventadas.
- Idiomas limitados: aunque aparecen respuestas en hindi/urdu, no hay garantia de soporte multilingue robusto.
- Dependencia del modelo base: el adaptador no funciona sin Gemma-3-4B, que debe descargarse por separado y esta sujeto a su propia licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Curious-PM/movie-gemma3-4b
- Pagina oficial de Gemma 4 (no directamente relacionada, pero contexto de la familia Gemma): https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core
- Modelo base Gemma-3-4B-it en HuggingFace: https://huggingface.co/google/gemma-3-4b-it
