# mayank64ce/Newq-0.5B-Instruct

## Resumen

Newq-0.5B-Instruct es un modelo de lenguaje compacto de 494 millones de parámetros, desarrollado por mayank64ce como un ajuste fino (fine-tune) de Qwen2.5-0.5B-Instruct de Alibaba Cloud. Está diseñado para chat y generación de texto general, con un enfoque en eficiencia: su tamaño reducido permite ejecutarlo en CPU o GPUs modestas, y ofrece una ventana de contexto de 32.768 tokens, notablemente más amplia que la de su modelo base.

El modelo resuelve el problema de desplegar asistentes conversacionales en entornos con recursos limitados, como dispositivos embebidos, portátiles sin GPU o servicios con presupuesto de cómputo ajustado. Su licencia Apache-2.0 elimina restricciones de uso comercial y facilita su integración en productos propietarios.

Su relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse localmente sin sacrificar demasiada calidad. Al estar basado en la arquitectura Qwen2.5, hereda capacidades sólidas de razonamiento y generación para su tamaño, aunque con limitaciones inherentes a los 0,5B parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5), atención GQA |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-0.5B-Instruct, por lo que hereda su arquitectura: un transformer de 24 capas con atención por grupos de consultas (GQA) usando 14 cabezas para Q y 2 para KV. La precisión de los pesos es bfloat16. El ajuste de instrucciones se realizó sobre el modelo base ya entrenado con chat, pero no se han publicado detalles sobre el dataset de fine-tuning, el número de tokens adicionales ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es la extensión de la ventana de contexto a 32.768 tokens, que supera los 32K del modelo base y permite procesar documentos más largos.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés.
- Chat multi-turno con formato de plantilla de chat estándar de Qwen.
- Ventana de contexto de 32.768 tokens, adecuada para diálogos largos y documentos extensos.
- Ejecución eficiente en CPU y GPU de baja gama gracias a su tamaño compacto.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card solo declara el inglés.
- Capacidades de visión, audio o modo pensamiento: no disponibles.

## Casos de uso

- Asistente conversacional en dispositivos embebidos: su tamaño de 0,5B permite ejecutarlo en placas como Raspberry Pi o microcontroladores con 2-4 GB de RAM, ofreciendo respuestas de chat sin conexión a internet.
- Aplicaciones de atención al cliente en entornos con presupuesto de cómputo reducido: el modelo puede gestionar conversaciones multi-turno con contexto largo (32K tokens) para mantener el historial completo de una interacción, aunque su capacidad de razonamiento complejo es limitada.
- Generación de texto en flujos de trabajo de bajo coste: como resúmenes de correos, borradores de respuestas o generación de contenido en inglés, desplegado en instancias CPU-only.
- Prototipado rápido de asistentes conversacionales: los desarrolladores pueden usarlo para validar flujos de chat y plantillas de mensajes antes de migrar a modelos más grandes.
- Fine-tuning específico de dominio: al ser pequeño, es viable ajustarlo en una sola GPU consumer (por ejemplo, RTX 3060 con 12 GB) para tareas concretas como soporte técnico o documentación.
- Entornos con restricciones de licencia: al ser Apache-2.0, se puede integrar en productos comerciales cerrados sin obligación de compartir el código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K. Dado que es un fine-tune de Qwen2.5-0.5B-Instruct, su rendimiento probablemente sea similar al de este modelo base, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16, el modelo ocupa aproximadamente 1 GB (494 M parámetros × 2 bytes). En cuantización de 8 bits o 4 bits, podría reducirse a 0,5-0,6 GB, aunque no se ofrecen pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores funcionarán sin problemas. En CPU, se puede ejecutar con 4-8 GB de RAM.
- Ejecución en consumer GPU: sí, cabe en cualquier GPU moderna y también en CPU con un rendimiento aceptable para generación corta.
- Opciones de despliegue: transformers con AutoModelForCausalLM, compatible con text-generation-inference (TGI) según las etiquetas del repositorio; se puede convertir a GGUF para usar con llama.cpp o Ollama, aunque no se ofrecen archivos preconvertidos.
- Latencia y throughput: no se han publicado datos. En una CPU moderna, se espera una generación de 5-20 tokens por segundo; en GPU, entre 50-200 tokens por segundo, dependiendo de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Newq-0.5B-Instruct | 494 M | 32.768 | Apache-2.0 | safetensors |
| Qwen2.5-0.5B-Instruct | 494 M | 8.192 | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache-2.0 | safetensors, GGUF |
| M4-ai/tau-0.5B-instruct | ~500 M | no disponible | Apache-2.0 (derivado de Qwen) | safetensors |

La principal diferencia de Newq con su base es la extensión del contexto de 8K a 32K tokens. El modelo de 1,5B de Qwen ofrece mayor capacidad de razonamiento y multilingüismo, pero requiere más recursos. M4-ai/tau es otro fine-tune de la misma familia, sin datos de contexto publicados.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas, lo que limita su uso en entornos multilingües.
- Su tamaño de 0,5B implica una capacidad de razonamiento y conocimiento limitada en comparación con modelos de 1B o más; es propenso a errores en tareas complejas de matemáticas o lógica.
- No se han publicado evaluaciones de sesgos ni de riesgos de alucinación, pero al ser un derivado de Qwen2.5, puede heredar sesgos del dataset original de Qwen.
- No hay datos sobre el dataset de fine-tuning, por lo que no se puede evaluar la calidad de los datos de entrenamiento ni su posible desviación.
- La ventana de contexto de 32K tokens es una declaración del autor; no hay evidencia empírica de que el modelo mantenga coherencia en esa longitud.
- No se ofrecen pesos cuantizados oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente requiere conversión manual.
- El repositorio tiene cero descargas y cero likes, por lo que no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mayank64ce/Newq-0.5B-Instruct
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
- Modelo similar M4-ai/tau-0.5B-instruct: https://huggingface.co/M4-ai/tau-0.5B-instruct
- Modelo Qwen2.5-0.5B-Instruct en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Documentación de Qwen2.5 en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct</think>## Resumen

Newq-0.5B-Instruct es un modelo de lenguaje compacto de 494 millones de parámetros, desarrollado por mayank64ce como un ajuste fino (fine-tune) de Qwen2.5-0.5B-Instruct de Alibaba Cloud. Está diseñado para chat y generación de texto general, con un enfoque en eficiencia: su tamaño reducido permite ejecutarlo en CPU o GPUs modestas, y ofrece una ventana de contexto de 32.768 tokens, significativamente más amplia que los 8.192 del modelo base.

El modelo resuelve el problema de desplegar asistentes conversacionales en entornos con recursos limitados, como dispositivos embebidos, aplicaciones sin GPU o servicios de cómputo de bajo coste. Su licencia Apache-2.0 elimina restricciones de uso comercial y facilita la integración en productos propios.

Su relevancia actual se enmarca en la tendencia hacia modelos pequeños y eficientes que pueden ejecutarse localmente sin sacrificar demasiada calidad. Al heredar la arquitectura de Qwen2.5, mantiene capacidades sólidas de generación de texto y chat para su tamaño, aunque con limitaciones propias de un modelo de 0,5B parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5), atención GQA |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo publica pesos en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-0.5B-Instruct, por lo que hereda su arquitectura transformer con 24 capas y atención por grupos de consultas (GQA): 14 cabezas de atención para Q y 2 para KV. Los pesos se almacenan en precisión bfloat16. El ajuste de instrucciones se aplicó sobre el modelo base ya entrenado para chat, pero no se han publicado detalles sobre el dataset de fine-tuning, el número de pasos de entrenamiento ni el uso de técnicas como RLHF o DPO. La única innovación documentada es la extensión de la ventana de contexto de 8.192 a 32.768 tokens, lo que permite procesar conversaciones y documentos más largos.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés.
- Chat multi-turno con formato de plantilla estándar de Qwen.
- Ventana de contexto de 32.768 tokens, adecuada para diálogos largos y documentos extensos.
- Ejecución eficiente en CPU y GPUs de baja gama gracias a su tamaño compacto.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible; la model card solo declara el inglés.
- Capacidades de visión, audio o modo de razonamiento especial: no disponible.

## Casos de uso

- Asistente conversacional en dispositivos embebidos: su tamaño de 0,5B permite ejecutarlo en placas como Raspberry Pi o sistemas con 2-4 GB de RAM, ofreciendo chat local sin conexión a internet.
- Atención al cliente en entornos de bajo coste: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32K tokens, manteniendo el historial completo de la interacción, aunque su capacidad de razonamiento complejo es limitada.
- Generación de texto en flujos de automatización: como redacción de correos, resúmenes de documentos o respuestas a preguntas frecuentes en inglés, desplegado en instancias de CPU.
- Prototipado rápido de asistentes: los desarrolladores pueden validar flujos de chat y plantillas de mensajes antes de migrar a modelos más grandes y costosos.
- Ajuste fino en dominios específicos: al ser un modelo pequeño, es viable realizar fine-tuning en una GPU consumer de 12 GB, por ejemplo una RTX 3060, para tareas como soporte técnico o documentación.
- Integración en productos comerciales con restricciones de licencia: la licencia Apache-2.0 permite uso propietario sin obligación de compartir código, lo que facilita su incorporación en aplicaciones cerradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K. Dado que es un fine-tune de Qwen2.5-0.5B-Instruct, su rendimiento probable sea similar al modelo base, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en bfloat16 (494 M parámetros × 2 bytes). En cuantización de 4 bits podría reducirse a unos 0,5 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o más es suficiente; tarjetas como GTX 1650, RTX 3060 o superiores funcionan sin problemas. En CPU, se necesita 4-8 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna y también se ejecuta en CPU con rendimiento aceptable.
- Opciones de despliegue: transformers, text-generation-inference (TGI) según las etiquetas del repositorio, y conversión manual a llama.cpp o Ollama para ejecución en CPU.
- Rendimiento estimado: no se han publicado datos. En GPU, un modelo de 0,5B suele generar entre 50 y 200 tokens por segundo; en CPU, entre 1 y 20 tokens por segundo, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Newq-0.5B-Instruct | 0,49B | 32.768 | Apache-2.0 | safetensors |
| Qwen2.5-0.5B-Instruct | 0,49B | 8.192 | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache-2.0 | safetensors, GGUF |
| M4-ai/tau-0.5B-instruct | ~0,5B | no disponible | Apache-2.0 | safetensors |

La principal diferencia frente al modelo base de Qwen es la extensión de la ventana de contexto de 8K a 32K tokens. El modelo de 1,5B ofrece mayor capacidad de razonamiento y conocimiento, pero requiere más recursos de cómputo. M4-ai/tau es otro fine-tune de la misma familia, aunque no se han publicado sus especificaciones de contexto.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas, lo que limita su uso en entornos multilingües.
- Su tamaño de 0,5B implica una capacidad de razonamiento y conocimiento limitada, especialmente en tareas de matemáticas, código o comprensión compleja.
- No se han publicado evaluaciones de sesgos ni de alucinación, pero al ser un derivado de Qwen2.5, puede heredar sesgos del dataset original de Qwen.
- No hay información sobre el dataset de fine-tuning, por lo que no se puede evaluar la calidad de los datos ni posibles desviaciones.
- La ventana de contexto de 32K tokens es una declaración del autor; no hay evidencia empírica de que el modelo mantenga coherencia en esa longitud completa.
- No se incluyen pesos cuantizados oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente requiere conversión manual.
- El repositorio tiene cero descargas y cero likes, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mayank64ce/Newq-0.5B-Instruct
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
- M4-ai/tau-0.5B-instruct: https://huggingface.co/M4-ai/tau-0.5B-instruct
- Qwen2.5-0.5B-Instruct en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Documentación de Qwen2.5 en M5: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
