# Dxniz/Novelist1.0-27b-Adapter

## Resumen

Novelist1.0-27b-Adapter es un adaptador LoRA desarrollado por Dxniz sobre el modelo base Qwen/Qwen3.8-27B, especializado en roleplay y escritura creativa. El entrenamiento combina fine-tuning supervisado (SFT) con optimización por refuerzo basada en GRPO y una variante de GRPO con contexto largo, lo que busca mejorar la coherencia narrativa y la adherencia al personaje en conversaciones de juego de rol. El adaptador está publicado bajo licencia Apache-2.0 y está pensado para ser cargado sobre el modelo base, con pesos fusionados disponibles en un repositorio separado.

Este adaptador resulta relevante para desarrolladores que trabajan en aplicaciones de narrativa interactiva, juegos de rol textuales o asistentes de escritura creativa, ya que permite ajustar un modelo de 27B parámetros sin necesidad de reentrenar la arquitectura completa. Al ser un adaptador LoRA, el coste de inferencia y el espacio de almacenamiento son reducidos en comparación con un fine-tuning completo, aunque se requiere el modelo base para su uso. Los idiomas soportados son inglés y turco, según la información publicada.

La fecha de creación indicada es agosto de 2026, lo que sugiere que se trata de un modelo reciente. No se dispone de información sobre benchmarks, contexto máximo ni detalles de arquitectura interna del modelo base más allá de su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.8-27B (arquitectura base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 1,3 GB; el modelo base es de 27B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Ingles (en), Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen/Qwen3.8-27B, un modelo de 27 mil millones de parametros de la familia Qwen3. La arquitectura interna del modelo base no se detalla en la informacion proporcionada, pero por el nombre se infiere que pertenece a la serie Qwen3, que emplea una arquitectura transformer con atencion por ventanas deslizantes y atencion completa alternadas (como en otros modelos de la familia). No se especifica si el modelo base es de tipo MoE (mixture of experts) o denso.

El entrenamiento del adaptador combina tres fases: SFT (supervised fine-tuning) para ajustar el modelo a tareas de roleplay y escritura creativa, seguido de GRPO (Group Relative Policy Optimization) para optimizar la politica mediante recompensas, y una variante denominada "long GRPO" que probablemente se centra en secuencias largas para mejorar la coherencia narrativa en contextos extensos. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni los hiperparametros exactos.

## Capacidades

- Generacion de texto narrativo y dialogos para roleplay y escritura creativa.
- Adherencia a personajes y estilos de escritura gracias al entrenamiento especifico en estas tareas.
- Soporte multilingue para ingles y turco.
- No se han documentado capacidades de tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- No se menciona soporte de vision, audio ni modo thinking.

## Casos de uso

- Juegos de rol textuales: el modelo puede actuar como maestro de juego o como personaje no jugador (NPC) en aventuras interactivas, manteniendo coherencia narrativa en conversaciones multi-turno gracias al entrenamiento con GRPO de contexto largo.
- Asistente de escritura creativa: ayuda a autores a generar tramas, dialogos y descripciones, sugiriendo continuaciones coherentes con el estilo y los personajes definidos por el usuario.
- Creacion de contenido narrativo automatizado: generacion de relatos cortos, guiones o historias interactivas para plataformas de entretenimiento digital, aprovechando la especializacion en escritura creativa.
- Chatbots de entretenimiento con personalidad: desarrollo de asistentes conversacionales con caracteristicas de personaje para aplicaciones de ocio, donde el adaptador mejora la naturalidad y la consistencia del personaje.
- Traduccion creativa: dado su soporte para ingles y turco, puede emplearse en tareas de traduccion literaria o adaptacion de textos narrativos entre ambos idiomas, aunque no se ha confirmado su rendimiento en esta tarea.
- Prototipado rapido de aplicaciones de narrativa: los desarrolladores pueden integrar el adaptador sobre Qwen3.8-27B para probar conceptos de juegos de texto o experiencias interactivas sin necesidad de un fine-tuning completo, reduciendo costes y tiempo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB, pero requiere el modelo base Qwen/Qwen3.8-27B para funcionar, lo que implica una GPU con suficiente VRAM para alojar el modelo base (estimacion orientativa: 54 GB en precision FP16, o menos con cuantizacion, pero no se han confirmado valores exactos).
- Para inferencia en consumer GPU, seria necesario cuantizar el modelo base (por ejemplo, con GGUF o AWQ) y cargar el adaptador, aunque no se han publicado guias de despliegue especificas.
- Opciones de despliegue habituales para modelos Qwen3 incluyen vLLM, llama.cpp, Ollama y TGI, pero no se ha verificado la compatibilidad de este adaptador con dichas herramientas.
- La latencia y el throughput dependen del hardware y la cuantizacion; no se han proporcionado mediciones concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros adaptadores o modelos de roleplay. El modelo base Qwen3.8-27B podria compararse con otros modelos de 27B como Llama 3.1 27B o Mistral Large, pero no hay datos de rendimiento de este adaptador sobre esos modelos. Se indica "no disponible".

## Limitaciones y advertencias

- Al ser un adaptador entrenado para roleplay y escritura creativa, puede presentar sesgos narrativos o estilisticos derivados de los datos de entrenamiento, que no han sido publicados.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en contextos largos o con poca informacion disponible.
- Solo se garantiza soporte para ingles y turco; otros idiomas pueden tener un rendimiento degradado.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar los terminos del modelo base Qwen3.8-27B, que puede tener restricciones adicionales.
- No se han documentado limitaciones de contexto, pero al ser un adaptador LoRA, la longitud de contexto efectiva dependera del modelo base y de la configuracion de inferencia.
- Para uso en produccion, se recomienda validar la calidad del modelo en el dominio especifico, ya que no hay benchmarks publicados.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/Dxniz/Novelist1.0-27b-Adapter)
- [Pesos fusionados del modelo](https://huggingface.co/Dxniz/Novelist1.0-27b)
