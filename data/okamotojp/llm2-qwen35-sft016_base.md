# OkamotoJP/llm2-qwen35-sft016_base

## Resumen

`OkamotoJP/llm2-qwen35-sft016_base` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo pequeño, de 873 millones de parámetros, obtenido mediante LoRA (r=16, alpha=32) fusionado posteriormente en los pesos originales, de modo que la arquitectura final es idéntica a la del modelo base. Su propósito declarado es la generación de respuestas para un sistema de RAG (retrieval-augmented generation) en el contexto del curso "LLM講座2 2026", concretamente para su tarea final.

El modelo está especializado en japonés y entrenado sobre un subconjunto de 883 ejemplos del dataset `cl-nagoya/auto-wiki-qa`, complementado con fragmentos de Wikipedia japonesa usados como material de referencia en los prompts de entrenamiento. No se han publicado detalles sobre la composición exacta del dataset final, el número de tokens de entrenamiento ni si hubo fases de alineación adicionales (RLHF/DPO).

Por su tamaño y naturaleza experimental (6 descargas, 0 likes en el momento de la ficha), debe considerarse un artefacto académico más que un modelo listo para producción. Su interés principal radica en ser un ejemplo reproducible de ajuste fino ligero sobre un modelo Qwen 3.5 de gama pequeña con licencia Apache-2.0, orientado a una tarea concreta de generación aumentada por recuperación en japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B; solo se actualizan los pesos de la parte lingüística) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin indicar variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen/Qwen3.5-0.8B original (revisión `2fc06364715b967f1860aea9cf38778875588b17`). Según la model card, el ajuste se realizó con LoRA de rango 16 y alpha 32, tasa de aprendizaje 0.0001 y una sola época, sobre 883 ejemplos del dataset `cl-nagoya/auto-wiki-qa`. Posteriormente, los adaptadores LoRA se fusionaron en los pesos base, por lo que el checkpoint distribuido no requiere cargar adaptadores por separado y mantiene la misma estructura que el modelo original, actualizando únicamente los pesos de la parte lingüística.

Los datos de entrenamiento provienen de `auto-wiki-qa` (CC BY-SA 4.0), muestreado, filtrado y reformateado para la tarea, junto con fragmentos de Wikipedia japonesa (CC BY-SA 4.0) empleados como contexto documental en los prompts. No se especifica el número total de tokens procesados, la composición exacta del conjunto final ni si se aplicaron técnicas adicionales como DPO, RLHF o decodificación especulativa. Tampoco se documentan innovaciones arquitectónicas propias: el modelo es un SFT estándar sobre un transformer denso de pequeño tamaño.

## Capacidades

- Generación de texto en japonés, orientada específicamente a la producción de respuestas a partir de contexto documental (RAG).
- Respuesta condicionada a fragmentos de Wikipedia japonesa introducidos en el prompt como material de referencia.
- Capacidades heredadas del modelo base Qwen3.5-0.8B, aunque no documentadas explícitamente en la model card (razonamiento, código o matemáticas no se detallan).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado explícitamente para responder a partir de fragmentos documentales, por lo que encaja en pipelines de recuperación + generación sobre corpus de Wikipedia japonesa u otras fuentes enciclopédicas.
- Asistentes de preguntas y respuestas sobre documentación interna: dado su tamaño reducido, puede desplegarse en entornos con recursos limitados para responder consultas sobre manuales o bases de conocimiento en japonés.
- Prototipado académico de ajuste fino: sirve como referencia reproducible de un flujo LoRA + merge sobre un modelo Qwen 3.5 pequeño, útil en cursos y laboratorios de aprendizaje automático.
- Sistemas de atención al cliente en japonés de bajo coste: el modelo puede gestionar respuestas basadas en una base de conocimiento recuperada, aunque su ventana de contexto no está documentada y debe validarse empíricamente.
- Generación de resúmenes o respuestas extractivas sobre artículos de Wikipedia japonesa: aprovecha el dominio de entrenamiento (auto-wiki-qa) para tareas de síntesis documental.
- Evaluación comparativa de estrategias de SFT: al estar publicado con licencia Apache-2.0 y pesos safetensors, permite experimentar con cuantización, despliegue y evaluación frente al modelo base sin restricciones de uso comercial.
- Componente de demostración educativa: adecuado para ilustrar el ciclo completo de datos, entrenamiento LoRA y evaluación en un curso de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en FP16 los pesos ocupan aproximadamente 1,75 GB; en BF16, un valor similar. En cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4). Para mayor comodidad y margen de contexto, se recomienda 8 GB o más (RTX 3060, RTX 4070, L4).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más de VRAM en FP16, y en configuraciones aún más modestas con cuantización.
- Opciones de despliegue: al publicarse en safetensors, es compatible con frameworks estándar de Hugging Face (transformers, vLLM, TGI). Para cuantización y ejecución en CPU o GPU de gama baja sería necesario generar versiones GGUF y usar llama.cpp u Ollama, no incluidas en el repositorio.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft016_base | 873 M | no disponible | ja | Apache-2.0 | SFT con LoRA sobre Qwen3.5-0.8B, orientado a RAG en japonés |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | multilingüe (según modelo base) | Apache-2.0 | Modelo original sin ajuste; capacidades generales |
| Otros SFT pequeños japoneses sobre Qwen | no disponible | no disponible | ja | variable | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental con muy baja adopción (6 descargas, 0 likes): no hay evidencia de validación externa ni de uso en producción.
- Entrenado únicamente sobre 883 ejemplos y una sola época: riesgo elevado de sobreajuste al estilo y dominio de `auto-wiki-qa`, con posible degradación fuera de ese formato.
- Especializado en japonés: el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de 0,8 B, especialmente cuando el contexto recuperado no contiene la respuesta.
- No se documenta la longitud de contexto efectiva ni el comportamiento con contextos largos, algo crítico en pipelines RAG.
- Los datos de entrenamiento derivan de Wikipedia japonesa (CC BY-SA 4.0); aunque el modelo se distribuye con Apache-2.0, conviene revisar las implicaciones de atribución de la licencia de los datos en usos derivados.
- Licencia Apache-2.0 permite uso comercial, pero la falta de benchmarks y de documentación sobre sesgos hace recomendable una evaluación propia antes de cualquier despliegue.
- No se proporcionan versiones cuantizadas (GGUF, AWQ, GPTQ) ni instrucciones de despliegue, lo que añade trabajo de ingeniería para su puesta en marcha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft016_base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia del dataset (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
