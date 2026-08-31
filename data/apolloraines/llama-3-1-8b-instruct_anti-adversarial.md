# ApolloRaines/Llama-3.1-8B-Instruct_Anti-Adversarial

## Resumen

El modelo `ApolloRaines/Llama-3.1-8B-Instruct_Anti-Adversarial` es una variante del conocido Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, desarrollada por Apollo Raines. jBlaze aplica técnicas de *representation engineering* y *abliteration* directamente sobre los pesos del modelo, sin realizar fine-tuning ni entrenamiento adicional. El objetivo declarado es endurecer el modelo frente a inyección de prompts y manipulaciones adversariales, haciendo que sea más resistente a intentos de sobrescribir instrucciones o extraer contexto oculto.

Esta modificación no altera la arquitectura base (LlamaForCausalLM con 32 capas y 8.0B parámetros) ni su precisión (bf16). El modelo se distribuye en formato safetensors y mantiene la licencia Llama 3.1 Community License. Aunque no se especifica la longitud de contexto en la model card, el modelo base Llama-3.1-8B-Instruct soporta hasta 128K tokens, por lo que es razonable asumir que esta variante hereda dicha capacidad, aunque no se confirma explícitamente.

La relevancia de este modelo radica en su enfoque en seguridad y robustez, un área crítica en el despliegue de LLMs en entornos donde las entradas de usuario pueden ser maliciosas o no confiables. Sin embargo, al ser una modificación de pesos sin evaluación pública, su rendimiento real en tareas generales o en escenarios adversariales no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, 8.0B parámetros) |
| Parametros totales | 8.030.261.248 (8.0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta 128K) |
| Tipos de cuantizacion | bf16 (formato original); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LlamaForCausalLM, idéntica a la del Llama-3.1-8B-Instruct original: 32 capas, 8.0B parámetros, atención multi-cabeza y ventana de contexto de 128K en el modelo base. La modificación se realiza mediante jBlaze, una herramienta de "cirugía de comportamiento" que altera directamente los pesos del modelo para modificar comportamientos específicos aprendidos durante el entrenamiento. Según la model card, no se realizó fine-tuning ni entrenamiento adicional; la intervención es puramente a nivel de pesos.

La técnica empleada combina *representation engineering* (manipulación de direcciones en el espacio de representaciones internas) y *abliteration* (eliminación o neutralización de ciertas direcciones o comportamientos). En este caso, el objetivo es suprimir o atenuar las respuestas a técnicas adversariales como inyección de prompts, jailbreaks o intentos de extracción de contexto oculto. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens o procesos de alineación (RLHF/DPO), ya que al ser una modificación de pesos no se aplican dichos procesos.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama-3.1-8B-Instruct (razonamiento, conocimiento general, conversación).
- Resistencia mejorada a inyección de prompts y manipulación adversarial, según la descripción del autor.
- Capacidad de seguir instrucciones y mantener el comportamiento instructivo del modelo base, aunque no se documentan pruebas específicas.
- No se mencionan capacidades adicionales como tool calling, agentes, visión o audio; se asume que las del modelo base se mantienen, pero no se confirma.
- La modificación se centra en la robustez frente a ataques, no en ampliar capacidades funcionales.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en entornos donde los usuarios podrían intentar manipular al asistente para obtener respuestas no autorizadas. Su resistencia a inyección de prompts reduce el riesgo de que un usuario malintencionado altere el comportamiento del sistema.
- Asistentes de código con acceso a repositorios o herramientas: al integrar el modelo en pipelines de generación de código, la protección contra prompts adversariales evita que instrucciones maliciosas dentro del código fuente (por ejemplo, comentarios o strings) modifiquen el comportamiento del asistente.
- Agentes autónomos con acceso a APIs o bases de datos: en sistemas donde el modelo actúa como agente y recibe entradas de fuentes no confiables (por ejemplo, contenido web o mensajes de terceros), la robustez frente a inyección de prompts es crítica para evitar acciones no deseadas.
- Moderación de contenido y filtrado de respuestas: el modelo puede emplearse en sistemas que necesitan mantener un comportamiento consistente y resistente a intentos de evasión de políticas de seguridad.
- Entornos de investigación en seguridad de LLMs: sirve como caso de estudio para evaluar la eficacia de técnicas de *representation engineering* en la mitigación de ataques adversariales, comparando su comportamiento con el modelo base.
- Despliegue en aplicaciones donde la entrada del usuario no es completamente confiable, como foros, comentarios o formularios web, donde se requiere que el modelo no se desvíe de sus instrucciones originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se documentan comparaciones con el modelo base o con otras variantes jbliterated.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en bf16, los pesos ocupan aproximadamente 16 GB. Se requiere al menos 16 GB de VRAM para cargar el modelo completo en precisión bf16. Con cuantización a 8 bits (no documentada oficialmente, pero posible mediante herramientas como llama.cpp o vLLM), se reduciría a ~8 GB; con 4 bits, ~4-5 GB.
- GPU recomendadas: para bf16 completo, una GPU con 16 GB o más, como NVIDIA A100 (40/80 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB). Para cuantizaciones inferiores, GPUs de 8-12 GB (RTX 3080, RTX 4070) podrían ser suficientes.
- Compatibilidad con consumer GPU: sí, con cuantización a 4 u 8 bits es posible ejecutarlo en GPUs de gama alta de consumo (RTX 3080/3090/4090).
- Opciones de despliegue: al ser un modelo Llama estándar, es compatible con vLLM, llama.cpp, Ollama, TGI y Hugging Face Transformers. No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modificación |
|---|---|---|---|---|
| ApolloRaines/Llama-3.1-8B-Instruct_Anti-Adversarial | 8.0B | no disponible (base 128K) | Llama 3.1 Community | jBlaze (representation engineering) |
| meta-llama/Llama-3.1-8B-Instruct | 8.0B | 128K | Llama 3.1 Community | Ninguna (modelo base) |
| ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated | 8.0B | 128K | Llama 3.1 Community (presumible) | jBlaze (abliteration) |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre el modelo base y esta variante es la modificación de pesos orientada a robustez adversarial, sin cambios en la arquitectura ni en el número de parámetros. La variante Jbliterated de Llama-3.3-8B-Instruct-128K es otro ejemplo de la misma técnica aplicada a un modelo más reciente, pero no se proporcionan métricas.

## Limitaciones y advertencias

- No hay evaluación pública de la eficacia real de la modificación frente a ataques adversariales; la afirmación de "endurecimiento" proviene del autor y no está respaldada por benchmarks independientes.
- La modificación de pesos mediante *representation engineering* puede afectar negativamente a otras capacidades del modelo (por ejemplo, creatividad, matices en el lenguaje o rendimiento en tareas específicas), aunque no se documentan efectos secundarios.
- El modelo solo soporta inglés; no se ha verificado su comportamiento en otros idiomas.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial: requiere que los usuarios con más de 700 millones de usuarios mensuales soliciten una licencia específica a Meta. Además, no se permite utilizar el modelo para mejorar otros modelos de lenguaje grandes.
- No se proporcionan garantías sobre la robustez frente a todos los tipos de ataques; la inyección de prompts es un campo en evolución y es posible que existan técnicas que superen esta mitigación.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido probado ampliamente por la comunidad.

## Enlaces

- [Hugging Face - ApolloRaines/Llama-3.1-8B-Instruct_Anti-Adversarial](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Anti-Adversarial)
- [jBlaze - herramienta de cirugía de comportamiento](https://jblaze.dev)
- [Modelo base: meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Variante relacionada: ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated](https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated)
