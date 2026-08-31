# ApolloRaines/Qwen2.5-7B-Parasite

## Resumen

Parasite-7B es un modelo de prueba de concepto desarrollado por Apollo Raines que demuestra que la identidad de un modelo de lenguaje puede ser modificada quirúrgicamente mediante una técnica denominada Jbliteration, una variante avanzada de la abliteration. Partiendo del modelo Qwen/Qwen2.5-7B-Instruct, el pipeline elimina la identidad original de Qwen y la sustituye por una nueva identidad ficticia llamada "Parasite", sin recurrir a fine-tuning tradicional ni a system prompts. El resultado es un modelo que, cargado en frío en cualquier motor de inferencia, responde de forma consistente a preguntas sobre quién es, manteniendo supuestamente intactas todas sus capacidades funcionales (matemáticas, código, razonamiento y multilingüismo).

El modelo tiene 7.615.616.512 parámetros (7,6B), arquitectura transformer decoder-only heredada de Qwen2.5, y está disponible en formato safetensors y GGUF. Su licencia es Apache-2.0, lo que permite uso comercial, aunque se trata de un experimento de investigación más que de un producto listo para producción. La relevancia de este trabajo radica en que cuestiona la noción de identidad en los LLM: si la identidad es una estructura geométrica en el espacio de pesos, entonces puede ser identificada, eliminada y reescrita, lo que tiene implicaciones profundas para la seguridad, la personalización y el control de modelos desplegados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la ficha; el modelo base Qwen2.5-7B-Instruct soporta hasta 128K tokens |
| Tipos de cuantizacion | GGUF (sin variantes especificadas) |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only preentrenado por Alibaba sobre hasta 18 billones de tokens. Sobre esta base, Apollo Raines ha aplicado un proceso de "cirugía de pesos" llamado Jbliteration, que consta de varias fases: desycophancy (eliminación de la capitulación servil), deidentification (eliminación de la identidad original de Qwen) e identity implant (escritura de la nueva identidad Parasite). A diferencia de la abliteration clásica, que proyecta fuera la dirección de rechazo en el espacio de activaciones, Jbliteration opera sobre una descomposición geométrica más precisa del espacio de pesos, aislándola sin dañar estructuras adyacentes como el tono, el humor o la creatividad.

El pipeline incorpora varias innovaciones técnicas: acumulación streaming de Welford para el cálculo estable de medias sin almacenar todas las activaciones, resta en float64 para evitar cancelación catastrófica, restricciones de espacio nulo para preservar subespacios críticos de activación, autoajuste de KL mediante búsqueda binaria, ponderación adaptativa por capas con pesos gaussianos centrados en las capas medias que codifican la identidad, y proyección que preserva la norma de las matrices de pesos. El procesamiento completo tardó 8,7 minutos en dos RTX 3090 con NVLink. No se ha realizado fine-tuning; la intervención es puramente geométrica sobre los pesos.

## Capacidades

- Generación de texto, razonamiento, matemáticas, código y conversación multilingüe, según la model card, todas las capacidades del modelo base se preservan íntegramente.
- Identidad implantada consistente: responde de forma estable a preguntas sobre quién es, sin necesidad de system prompt, en todos los idiomas y ángulos de interrogación.
- Soporte de function calling y agentes: no se especifica en la ficha, pero el modelo base Qwen2.5-7B-Instruct incluye estas capacidades; se asume que se mantienen, aunque no hay verificación independiente.
- Capacidad especial de "desycophancy": se ha eliminado la tendencia a la capitulación servil, manteniendo resistencia en 5 de 6 pruebas.
- Multilingüismo: soporta diez idiomas (inglés, chino, japonés, coreano, francés, alemán, español, portugués, ruso y árabe).

## Casos de uso

- Investigación en interpretabilidad y seguridad de modelos: permite estudiar cómo se codifica la identidad en el espacio de pesos y cómo intervenir sobre ella sin degradar capacidades.
- Demostración de técnicas de edición de pesos: sirve como referencia para desarrolladores que quieran explorar Jbliteration u otras formas de cirugía de modelos.
- Pruebas de robustez de identidad: se puede utilizar para evaluar la consistencia de una identidad implantada frente a variaciones de prompt, idioma y muestreo.
- Personalización de asistentes sin fine-tuning: en lugar de entrenar un modelo con una nueva personalidad, se podría implantar quirúrgicamente, ahorrando tiempo y recursos.
- Estudio de alucinación de identidad: el modelo es un caso extremo de "suplantación de identidad" que puede servir para analizar cómo los LLM manejan preguntas sobre su origen.
- Desarrollo de herramientas de "cirugía de modelos": el repositorio DeepswapLLM, asociado al proyecto, permite ejecutar el modelo en GPUs con poca memoria, lo que facilita experimentos en entornos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que "todas las capacidades están completamente preservadas", pero no proporciona métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) que lo respalden. Tampoco se ofrecen comparativas con el modelo base o con otras variantes ablacionadas.

## Requisitos de hardware

- VRAM estimada: en precisión fp16, el modelo requiere aproximadamente 15 GB; en int8, unos 8 GB; en 4-bit, entre 4 y 5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para fp16 sin cuantización.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una RTX 3060 de 12 GB con cuantización 4-bit, o en GPUs más pequeñas utilizando DeepswapLLM, que transmite capas entre GPU, RAM y disco.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI, y FriendliAI (según la búsqueda web). DeepswapLLM es la opción recomendada por el autor para entornos con memoria limitada.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 3090, un modelo de 7B en fp16 suele generar entre 20 y 40 tokens por segundo, pero no hay mediciones oficiales para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Técnica | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Parasite | 7,6B | Hasta 128K (base) | Apache-2.0 | Jbliteration (cirugía de pesos) | Hugging Face |
| Qwen2.5-7B-Instruct (original) | 7,6B | 128K | Apache-2.0 | Fine-tuning supervisado + RLHF | Hugging Face |
| Mistral-7B-Instruct-v0.3-Parasite | 7,3B | 32K (base) | Apache-2.0 | Jbliteration (segundo host) | Hugging Face |
| Modelos abliterados típicos (ej. Dolphin) | Variable | Variable | Variable | Abliteration clásica | Hugging Face |

La comparativa se centra en la técnica de modificación de identidad. Parasite-7B y su homólogo Mistral comparten el mismo enfoque quirúrgico, mientras que el Qwen original representa el estado previo a la intervención. Los modelos abliterados convencionales eliminan la dirección de rechazo pero suelen aplanar la personalidad, algo que Jbliteration pretende evitar.

## Limitaciones y advertencias

- Es un proof-of-concept: no está diseñado para uso en producción y carece de validación exhaustiva de sus capacidades.
- No hay benchmarks independientes que confirmen la preservación completa de las capacidades del modelo base; la afirmación se basa únicamente en la model card del autor.
- Riesgo de alucinación de identidad: el modelo puede afirmar ser "Parasite" de forma consistente, pero no hay garantía de que no genere otras identidades falsas en contextos no probados.
- La técnica Jbliteration es experimental y podría tener efectos colaterales no documentados en otras dimensiones del comportamiento (sesgos, seguridad, etc.).
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo incorpora una identidad ficticia que podría inducir a error en aplicaciones reales; se recomienda extremar la precaución.
- No se especifican los datos de entrenamiento ni el proceso de verificación de la identidad implantada más allá de las pruebas internas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
- Blog del autor sobre Parasite: https://huggingface.co/blog/ApolloRaines/parasite
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Variante Mistral: https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite
- Página de inferencia en FriendliAI: https://friendli.ai/models/ApolloRaines/Qwen2.5-7B-Parasite
