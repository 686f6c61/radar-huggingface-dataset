# n96j/Rattle-8B-Instruct-GGUF

## Resumen

Rattle-8B-Instruct es un ajuste fino (LoRA) del modelo Mistral Ministral-3-8B-Instruct-2512, desarrollado por n96j (openadze, Brasil) y distribuido en formato GGUF cuantizado en Q4_K_M. No es un modelo de propósito general: es una persona conversacional en portugués de Brasil diseñada explícitamente con un tono sarcástico, humor ácido y lenguaje malsonante, pensada para roleplay y chat informal. El modelo conserva la arquitectura y el tamaño del Ministral base (8.489.553.920 parámetros) y se publica bajo licencia Apache 2.0.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un público hispanohablante que quiera entender qué hay detrás de una persona LLM empaquetada para consumo local. Sirve como caso de estudio de fine-tuning LoRA sobre un modelo pequeño para un estilo muy concreto, no como candidato para tareas de producción generalistas.

El repositorio ocupa 16,5 GB y contiene los pesos GGUF listos para llama.cpp y LM Studio. El modelo responde en portugués, admite uso sin system prompt (se entrenó con ejemplos duplicados, con y sin system prompt) y declara rechazar peticiones relacionadas con delitos, salud mental o emergencias, derivando a profesionales o servicios de emergencia brasileños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del Ministral base; detalles de atención no disponibles) |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits) en este repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | Portugues (pt), portugues de Brasil en el entrenamiento; otros idiomas con comportamiento debil e irregular |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA publicado por separado en n96j/Rattle-8B-Instruct-LoRA |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA sobre `mistralai/Ministral-3-8B-Instruct-2512`, un transformer decoder-only de Mistral AI con 8.489.553.920 parámetros. No se documentan en la información disponible innovaciones arquitectónicas propias: la arquitectura, la tokenización y la ventana de contexto son las del modelo base, y este repositorio solo redistribuye los pesos cuantizados en GGUF Q4_K_M.

El entrenamiento se realizó sobre el dataset `n96j/rattle-dataset`, íntegramente en portugués de Brasil, con el objetivo de instalar una persona concreta (tono grosero, humor ácido, negativa a responder preguntas demasiado obvias y ayuda real cuando la consulta es seria). Cada ejemplo de entrenamiento aparece dos veces, una con system prompt y otra sin él, de modo que la persona se mantiene incluso en aplicaciones que no envían system prompt. La model card menciona el uso de Unsloth y de Colab (con asistencia de Claude en algunas partes del proceso), pero no se detallan número de tokens, composición del dataset, ni si hubo RLHF o DPO adicionales. No hay información sobre decodificación especulativa ni sobre optimizaciones de atención.

## Capacidades

- Generación de texto conversacional en portugués de Brasil con una persona definida (tono sarcástico, lenguaje malsonante, humor ácido).
- Respuesta a preguntas técnicas, escolares y de día a día, con explicaciones didácticas cuando la consulta es seria (el ejemplo de la model card explica qué es una API con la analogía del camarero).
- Funcionamiento sin system prompt: la persona se mantiene aunque la aplicación no envíe instrucciones de sistema.
- Roleplay y chat multi-turno orientado a entretenimiento.
- Rechazo entrenado de peticiones relacionadas con delitos, estafas o intrusiones.
- Derivación a profesionales o servicios de emergencia (CVV 188, SAMU 192) en situaciones de sufrimiento emocional, salud o peligro.
- No disponible: soporte de tool calling, function calling, agentes, visión, audio, modo thinking o capacidades multimodales. No se documenta ninguna.

## Casos de uso

- Chat de entretenimiento y roleplay en local: el modelo está pensado para conversaciones informales con una persona concreta; se ejecuta con llama.cpp o LM Studio y no requiere infraestructura adicional.
- Demostración de fine-tuning LoRA sobre un modelo pequeño: sirve como ejemplo reproducible de cómo adaptar un Ministral de 8B a un estilo muy específico con un dataset propio y publicar el resultado en GGUF.
- Estudio de personas LLM y seguridad conversacional: útil para investigadores que analicen cómo se comporta un modelo entrenado para insultar de forma leve y para rechazar ciertos temas, y cómo se degrada ese comportamiento fuera del portugués.
- Asistente informal de dudas tecnológicas para usuarios brasileños: el modelo explica conceptos (API, etc.) con analogías sencillas cuando la pregunta es sustancial, aunque sin garantías de precisión.
- Pruebas de despliegue en hardware de consumo: con ~5 GB en Q4_K_M cabe en GPU de 8 GB y también corre en CPU, lo que lo hace útil para validar pipelines de llama.cpp en equipos modestos.
- Base para experimentos de ajuste de tono en portugués: el adaptador LoRA publicado permite partir de él y reentrenar la persona hacia otros estilos sin tocar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB para el archivo Q4_K_M, según la model card.
- GPU: cabe con holgura en una GPU de 8 GB (la model card lo indica explícitamente); no se especifican modelos concretos como RTX 4090, A100 o H100.
- Consumer GPU: sí, en tarjetas de 8 GB o más; también funciona solo en CPU, con menor velocidad.
- Despliegue: llama.cpp (`llama-cli -m Rattle-8B-Instruct-Q4_K_M.gguf --temp 0.7 -cnv`) y LM Studio (búsqueda del repositorio y descarga del `.gguf`). No se documentan vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.
- Temperatura recomendada: 0,7; valores más bajos hacen la respuesta más predecible y seria, valores más altos la vuelven más caótica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Rattle-8B-Instruct | 8,49 B | no disponible | pt | Apache 2.0 | GGUF Q4_K_M | Persona de roleplay; fine-tuning LoRA de Ministral |
| Ministral-3-8B-Instruct-2512 (base) | 8,49 B | no disponible | multilingue (segun modelo base) | Apache 2.0 | safetensors (original) | Modelo instructivo generalista de Mistral AI |
| Rattle-8B-Instruct-LoRA | 8,49 B (base) + adaptador | no disponible | pt | Apache 2.0 | adaptador LoRA | Mismo fine-tuning en formato adaptador, para fusionar o cargar sobre la base |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada; la comparación se limita a parámetros, licencia, formato e idioma.

## Limitaciones y advertencias

- Lenguaje malsonante e insultos de forma deliberada: no es apto para entornos profesionales, atención al cliente ni aplicaciones dirigidas a menores.
- Entrenado únicamente en portugués de Brasil; en otros idiomas el comportamiento es "más débil e irregular", según la propia model card.
- Modelo pequeño (8B): la model card advierte que se equivoca y que hay que verificar la información importante; riesgo de alucinación en datos, fechas y noticias.
- Sin acceso a internet: no conoce la fecha actual ni noticias recientes.
- No es un sustituto de profesionales sanitarios ni de asesoramiento psicológico; está entrenado para derivar a servicios de emergencia brasileños (CVV 188, SAMU 192), que no aplican fuera de Brasil.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede ser ofensivo y trasladar al despliegue la responsabilidad sobre su idoneidad.
- Repositorio sin tracción (0 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados: no hay evidencia empírica de calidad más allá de los ejemplos de la model card.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse que las herede del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/n96j/Rattle-8B-Instruct-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Dataset de entrenamiento: https://huggingface.co/datasets/n96j/rattle-dataset
- Adaptador LoRA: https://huggingface.co/n96j/Rattle-8B-Instruct-LoRA
