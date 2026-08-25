# pckmer/Qwen3-1.7B-GGUF

## Resumen

Qwen3-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3-1.7B, desarrollado por Alibaba Cloud y publicado originalmente en el repositorio oficial de Qwen. Este modelo pertenece a la tercera generación de la familia Qwen, que combina arquitecturas densas y de mezcla de expertos (MoE) para ofrecer capacidades avanzadas de razonamiento, seguimiento de instrucciones y uso de agentes. El repositorio `pckmer/Qwen3-1.7B-GGUF` es un re-upload del archivo oficial, con cuantización Q8_0, pensado para facilitar la descarga y el despliegue en entornos locales mediante herramientas como llama.cpp u Ollama.

El modelo destaca por su capacidad de alternar entre un modo de pensamiento explícito (thinking) y un modo directo (non-thinking) dentro de un mismo modelo, lo que permite adaptar el comportamiento según la complejidad de la tarea. Con 1.720 millones de parámetros y una ventana de contexto de 32.768 tokens, ofrece un equilibrio entre rendimiento y requisitos de hardware, siendo adecuado para ejecutarse en GPUs de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (dense) con atención GQA |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (según model card; el repo puede contener más variantes) |
| Idiomas soportados | Más de 100 idiomas y dialectos (según documentación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3-1.7B es un modelo de lenguaje causal basado en la arquitectura Transformer con atención de consultas agrupadas (GQA), utilizando 16 cabezas de atención para las consultas y 8 para las claves y valores. La red consta de 28 capas y un total de 1,4B parámetros no relacionados con embeddings. El modelo fue preentrenado y posteriormente ajustado con técnicas de post-entrenamiento que incluyen alineación con preferencias humanas, lo que le permite seguir instrucciones de forma precisa y mantener conversaciones coherentes en múltiples turnos.

Una innovación destacada es la capacidad de conmutar entre modo de pensamiento y modo directo mediante marcadores `/think` y `/no_think` en el prompt. En el modo de pensamiento, el modelo genera una cadena de razonamiento interna antes de responder, lo que mejora el rendimiento en tareas de matemáticas, lógica y programación. En el modo directo, responde de forma inmediata, optimizando la latencia para diálogos generales. El entrenamiento incluyó datos multilingües de más de 100 idiomas, y el modelo ha sido optimizado para integración con herramientas externas (tool calling) tanto en modo pensante como no pensante.

## Capacidades

- Generación de texto y diálogo multilingüe en más de 100 idiomas, con especial énfasis en inglés y chino.
- Razonamiento explícito mediante modo de pensamiento, útil para problemas matemáticos, lógicos y de código.
- Seguimiento de instrucciones complejas y conversaciones multi-turno con contexto largo (hasta 32.768 tokens).
- Soporte de tool calling y function calling, permitiendo la integración con APIs y servicios externos.
- Capacidades de agente: puede planificar y ejecutar tareas de múltiples pasos usando herramientas.
- Escritura creativa, role-playing y generación de contenido narrativo gracias a la alineación con preferencias humanas.
- Traducción automática entre idiomas con razonamiento multilingüe.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (32.768 tokens) y alternar entre modo directo para respuestas rápidas y modo pensante para consultas complejas, manteniendo un historial extenso de la interacción.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación o revisar cambios, usando el modo de pensamiento para razonar sobre la lógica antes de emitir sugerencias.
- Asistente de investigación académica: capaz de resumir artículos, extraer conclusiones y responder preguntas técnicas en múltiples idiomas, aprovechando su ventana de contexto para procesar documentos extensos.
- Traducción y localización de contenido: su soporte multilingüe permite traducir textos manteniendo el tono y el contexto, con opción de razonar sobre matices culturales en modo pensante.
- Chatbot educativo: puede explicar conceptos paso a paso en modo pensamiento, ideal para tutorías de matemáticas, física o programación, adaptándose al nivel del estudiante.
- Automatización de tareas de oficina: redacción de correos, informes y resúmenes ejecutivos, con capacidad de seguir instrucciones detalladas y mantener un estilo consistente.
- Desarrollo de agentes autónomos: su capacidad de tool calling y razonamiento multi-paso permite construir agentes que consulten bases de datos, llamen a APIs y tomen decisiones basadas en resultados intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión GGUF en la información disponible. La documentación oficial de Qwen3 indica mejoras frente a QwQ y Qwen2.5 en matemáticas, generación de código y razonamiento lógico, pero no se proporcionan cifras concretas en la model card ni en los resultados de búsqueda. Se recomienda consultar el blog oficial de Qwen para datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q8_0, el modelo ocupa aproximadamente 1,8-2,0 GB de pesos, más overhead de activaciones y KV cache. Para contexto completo de 32.768 tokens, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650/1660, RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100 (aunque estas últimas son sobredimensionadas para este tamaño).
- Sí cabe en GPUs de consumo: RTX 3060 (12 GB) o RTX 4060 (8 GB) ejecutan el modelo con comodidad, incluso con contexto largo.
- Opciones de despliegue: llama.cpp (con soporte nativo para GGUF), Ollama (comando `ollama run hf.co/Qwen/Qwen3-1.7B-GGUF:Q8_0`), llama-cpp-python, o servidores compatibles con GGUF como llama.cpp server.
- Latencia y throughput estimados: en una RTX 3060, se pueden esperar velocidades de generación de 30-50 tokens por segundo con Q8_0, dependiendo de la longitud de contexto y el tamaño de lote. En CPU, la velocidad será significativamente menor (5-15 tokens/s con un procesador moderno).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (GGUF) | 1,7B | 32.768 | Apache 2.0 | GGUF | Modo thinking/no-thinking, multilingüe |
| Qwen2.5-1.5B (GGUF) | 1,5B | 32.768 | Apache 2.0 | GGUF | Generación anterior, sin modo thinking |
| Llama-3.2-1B (GGUF) | 1,2B | 128.000 | Llama 3.2 | GGUF | Contexto más largo, pero menos capacidades de razonamiento |
| Gemma-2-2B (GGUF) | 2,6B | 8.192 | Gemma | GGUF | Mayor tamaño, contexto menor, sin modo thinking |

No se dispone de datos de benchmarks comparativos fiables en la información proporcionada. La comparación se basa en características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo puede presentar sesgos derivados de los datos de entrenamiento, especialmente en temas sensibles o culturales, a pesar de los esfuerzos de alineación.
- Riesgo de alucinación en tareas factuales, especialmente en modo no-pensante donde la generación es más rápida y menos verificada.
- La ventana de contexto de 32.768 tokens es amplia pero no infinita; contextos muy largos pueden degradar la calidad de las respuestas si se excede el límite.
- Aunque soporta más de 100 idiomas, el rendimiento varía significativamente entre idiomas; los idiomas con menos representación en el entrenamiento pueden producir respuestas de menor calidad.
- La cuantización Q8_0 introduce una pérdida mínima de precisión, pero en tareas de razonamiento complejo puede haber ligeras diferencias frente al modelo en punto flotante completo.
- Para uso en producción, se recomienda implementar validación de salidas y mecanismos de control de calidad, especialmente en aplicaciones de atención al cliente o generación de código.
- La licencia Apache 2.0 permite uso comercial, pero es necesario atribuir la autoría original y mantener los avisos de copyright.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/pckmer/Qwen3-1.7B-GGUF
- Repositorio oficial de Qwen3-1.7B-GGUF: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- Repositorio de unsloth con variantes GGUF: https://huggingface.co/unsloth/Qwen3-1.7B-GGUF
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen (llama.cpp y Ollama): https://qwen.readthedocs.io/en/latest/
