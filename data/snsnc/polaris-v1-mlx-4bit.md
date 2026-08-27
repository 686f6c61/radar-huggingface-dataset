# snsnc/Polaris-V1-MLX-4bit

## Resumen

Polaris-V1-MLX-4bit es una conversión al formato MLX con cuantización de 4 bits del modelo Polaris-V1, desarrollado por nitrai-research. Polaris-V1 es a su vez un fine-tuning del modelo Qwen/Qwen3.5-4B, especializado en tareas de razonamiento, generación de código y conversación. Esta conversión, creada por el usuario snsnc, no añade ningún entrenamiento adicional: se limita a transformar los pesos originales al formato nativo de MLX y a cuantizarlos a 4 bits para que puedan ejecutarse eficientemente en hardware Apple Silicon.

El modelo resultante ocupa aproximadamente 2,4 GB en disco y tiene 657.959.936 parámetros según los safetensors, una cifra que contrasta con la denominación "4B" del modelo base (posiblemente el conteo de parámetros del safetensors refleja solo los pesos cuantizados o una arquitectura con menos parámetros efectivos). Está pensado para desarrolladores que necesitan ejecutar un LLM de razonamiento y código localmente en Macs con chips M1/M2/M3/M4, aprovechando el ecosistema MLX (mlx-lm, vLLM para MLX, etc.). Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 657.959.936 (segun safetensors; el modelo base se anuncia como 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens (segun LLM Explorer para Polaris-V1; no confirmado en la model card) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible (el modelo base soporta ingles y chino, segun fuentes externas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Polaris-V1-MLX-4bit hereda la arquitectura de Qwen3.5-4B, un transformer decoder-only con atención de múltiples cabezas y mecanismos de razonamiento explícito (thinking mode). El modelo original Polaris-V1 fue fine-tuneado a partir de Qwen3.5-4B-Base, probablemente con técnicas de RLHF o DPO para mejorar capacidades de razonamiento y generación de código, aunque no se detallan los datos de entrenamiento en la información disponible. Esta conversión MLX no modifica los pesos: solo aplica cuantización de 4 bits mediante el formato nativo de MLX, que almacena los pesos en bloques con escalares y códigos de cuantización. No se ha realizado ningún paso de entrenamiento adicional, por lo que las capacidades del modelo son idénticas a las del original, salvo la pérdida de precisión inherente a la cuantización.

## Capacidades

- Generación de texto conversacional con soporte de plantilla de chat (chat template) heredada de Polaris-V1.
- Razonamiento multi-step con modo "thinking" activable o desactivable mediante el parámetro `enable_thinking` en la plantilla de chat.
- Generación de código en múltiples lenguajes, con énfasis en Python (el prompt de ejemplo del autor pide implementar un worker pool asíncrono).
- Soporte de tool calling y agentes, aunque la plantilla de chat original puede tener limitaciones; el autor recomienda `froggeric/Qwen-Fixed-Chat-Templates` para cargas de trabajo agénticas.
- Capacidades multilingües limitadas: el modelo base soporta inglés y chino, pero no se confirma en esta conversión.
- Inferencia eficiente en Apple Silicon gracias a la cuantización 4-bit y al runtime MLX.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar Polaris-V1-MLX-4bit en su MacBook para obtener sugerencias de código, explicaciones de algoritmos o refactorizaciones sin enviar datos a la nube. Su modo de razonamiento permite desglosar problemas complejos antes de generar la solución.
- Automatización de tareas de análisis de datos: el modelo puede generar scripts de Python para limpieza, visualización o modelado estadístico, integrándose en flujos de trabajo con Jupyter o scripts CLI.
- Chatbot de soporte técnico interno: con su contexto de 256K tokens, puede mantener conversaciones largas con historial extenso, útil para documentación técnica o resolución de incidencias.
- Generación de documentación técnica: a partir de fragmentos de código o especificaciones, el modelo puede redactar comentarios, docstrings o manuales de usuario.
- Prototipado rápido de agentes conversacionales: gracias al soporte de tool calling (con plantillas corregidas), se puede construir un agente que consulte APIs o bases de datos locales.
- Educación y formación: el modo de razonamiento permite explicar paso a paso conceptos de programación o matemáticas, sirviendo como tutor interactivo en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web menciona que LLM Explorer tiene datos comparativos para Polaris-V1, pero no se han extraído valores concretos. Se recomienda consultar la página del modelo base para métricas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB según LLM Explorer para Polaris-V1 (con cuantización 4-bit).
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada; el modelo cabe en equipos con 8 GB, aunque se recomienda 16 GB para contextos largos.
- No requiere GPU NVIDIA; está optimizado para el framework MLX.
- Opciones de despliegue: `mlx-lm` (CLI y Python), `vLLM` con soporte MLX, `Ollama` (si se convierte a GGUF), o aplicaciones como `vMLX`.
- Latencia y throughput: no disponibles; dependen del chip (M1 Pro vs M4 Max) y de la longitud de contexto. En general, un modelo de ~0,66B parámetros cuantizado a 4-bit genera tokens a decenas de tokens por segundo en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Polaris-V1-MLX-4bit | 0,66B (safetensors) | 256K (base) | Apache 2.0 | MLX 4-bit | Conversión para Apple Silicon |
| Qwen3.5-4B (base) | 4B | 256K | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-4B-Instruct | 4B | 256K | Apache 2.0 | safetensors | Versión instruct de Qwen |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 | safetensors, GGUF | Alternativa de Meta, requiere más VRAM |

La comparativa se basa en datos públicos; no se dispone de benchmarks directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo o generación de código muy específico, en comparación con el modelo original en precisión completa.
- La plantilla de chat original tiene limitaciones conocidas para tool calling y razonamiento persistente; el autor recomienda usar plantillas corregidas para cargas de trabajo agénticas.
- No se ha confirmado el soporte multilingüe más allá de inglés y chino; otros idiomas pueden producir resultados de menor calidad.
- El número de parámetros reportado (657M) es inferior al esperado para un modelo "4B"; esto puede deberse a la cuantización o a una arquitectura con menos parámetros efectivos, pero no está documentado.
- Al ser una conversión sin entrenamiento adicional, no corrige sesgos o alucinaciones presentes en el modelo base.
- Para uso en producción, se recomienda validar las respuestas en tareas críticas, especialmente en generación de código, donde pueden existir errores sutiles.

## Enlaces

- [Modelo en HuggingFace (snsnc/Polaris-V1-MLX-4bit)](https://huggingface.co/snsnc/Polaris-V1-MLX-4bit)
- [Modelo base Polaris-V1 (nitrai-research)](https://huggingface.co/nitrai-research/Polaris-V1)
- [Qwen3.5-4B (Qwen)](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- [Repositorio mlx-lm (MLX)](https://github.com/ml-explore/mlx-lm)
- [LLM Explorer - Polaris V1](https://llm-explorer.com/model/nitrai-research%2FPolaris-V1,1uYTn74vyAjpHhnwGo9kX5)
- [vMLX - Aplicación de inferencia MLX](https://vmlx.net/)
