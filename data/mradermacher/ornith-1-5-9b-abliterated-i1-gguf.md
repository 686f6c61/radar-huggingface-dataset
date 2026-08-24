# mradermacher/Ornith-1.5-9B-Abliterated-i1-GGUF

## Resumen

Ornith-1.5-9B-Abliterated-i1-GGUF es una cuantización GGUF del modelo Ornith-1.5-9B-Abliterated, desarrollado por DeepReinforce. Se trata de un modelo denso de 9.000 millones de parámetros, multimodal (procesa texto e imágenes), orientado a tareas de codificación y razonamiento complejo. La versión "Abliterated" elimina los mecanismos de rechazo del modelo original, lo que permite una generación de contenido menos restrictiva, aunque con los riesgos asociados. Esta cuantización, realizada por mradermacher, emplea la técnica imatrix para optimizar la calidad de los pesos comprimidos, facilitando su ejecución en hardware de consumo. El modelo base tiene licencia MIT y está entrenado exclusivamente en inglés. Su relevancia radica en ofrecer un rendimiento competitivo en benchmarks de codificación (SWE-bench Verified 70.6) con un tamaño que cabe en GPUs de 8 GB, lo que lo convierte en una opción atractiva para desarrollo local y edge computing.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (detalles no disponibles) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF imatrix y estáticas: i1-Q2_K, Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información disponible, pero se sabe que es un transformer denso multimodal, capaz de procesar tanto texto como imágenes. El modelo base, Ornith-1.5-9B, fue desarrollado por DeepReinforce y se basa en un enfoque de "self-scaffolding" y "self-improvement": el modelo propone nuevas tareas, genera andamiajes específicos para cada una y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se han publicado datos concretos sobre el volumen de tokens de entrenamiento ni la composición del dataset. La versión "Abliterated" se obtiene mediante una técnica que elimina las capas o mecanismos de rechazo, reduciendo la censura del modelo original.

## Capacidades

- Generación de texto y código en inglés.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Comprensión de imágenes (multimodal), lo que permite analizar capturas de pantalla, diagramas o fotografías.
- Soporte de conversación multi-turno (chat).
- No se ha confirmado soporte de tool calling ni function calling en la información disponible.
- No se ha confirmado soporte de agentes o multi-step reasoning más allá del razonamiento estándar.

## Casos de uso

- Asistente de programación en IDE: el modelo puede autocompletar código, explicar fragmentos y sugerir refactorizaciones, gracias a su entrenamiento específico en tareas de codificación y su capacidad para procesar contexto de imagen (por ejemplo, capturas de pantalla de errores).
- Generación de código en pipelines de CI/CD: integrable como herramienta de generación automática de tests o documentación a partir del código fuente, reduciendo el trabajo manual en entornos de integración continua.
- Análisis de capturas de pantalla para depuración: al ser multimodal, puede recibir una imagen de un error o un diagrama y proporcionar una explicación o solución, útil en soporte técnico remoto.
- Documentación automática de repositorios: el modelo puede leer el código y generar documentación técnica en inglés, acelerando el mantenimiento de proyectos open source.
- Chatbot técnico de soporte: con su capacidad de conversación y razonamiento, puede atender consultas de desarrolladores sobre APIs, librerías o conceptos de programación, aunque limitado al inglés.
- Educación en programación: puede actuar como tutor virtual, explicando conceptos, corrigiendo ejercicios y respondiendo preguntas de estudiantes, aprovechando su capacidad de razonamiento y generación de ejemplos.

## Benchmarks y rendimiento

Según la información recopilada, el modelo base Ornith-1.5-9B obtiene los siguientes resultados:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70.6 |
| GPQA Diamond | 86.4 |

No se dispone de comparaciones directas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: según el blog de Atomic Chat, el modelo puede ejecutarse en una GPU con 8 GB de VRAM a cuantización 4-bit (por ejemplo, i1-Q2_K o similar). También es viable en un Mac con 16 GB de RAM unificada.
- GPUs recomendadas: RTX 3060/3070/4060 (8 GB), RTX 4090, A100, H100, etc. Cualquier GPU con al menos 8 GB de VRAM es suficiente para las cuantizaciones más bajas.
- En consumer GPU: sí, cabe en GPUs de gama media con 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptación), TGI, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Qwen2.5 7B) en la información proporcionada. Se recomienda consultar benchmarks independientes para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas es muy limitado.
- Al ser una versión "Abliterated", puede generar contenido ofensivo, ilegal o no deseado sin filtros, lo que requiere moderación adicional en aplicaciones públicas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información o código incorrecto, especialmente en contextos ambiguos.
- No se ha confirmado la longitud de contexto, por lo que no se recomienda su uso en tareas que requieran ventanas de contexto muy largas sin verificación previa.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas; se recomienda revisar la documentación oficial de DeepReinforce.
- Las cuantizaciones de baja precisión (como i1-Q2_K) pueden degradar significativamente la calidad de las respuestas; se recomienda usar cuantizaciones de mayor tamaño si la memoria lo permite.

## Enlaces

- [Repositorio HuggingFace de la cuantización](https://huggingface.co/mradermacher/Ornith-1.5-9B-Abliterated-i1-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated)
- [Página oficial de Ornith 1.5](https://ornith.ai/ornith_1_5.html)
- [Guía de ejecución local (Atomic Chat)](https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally)
- [Resumen técnico en AI/TLDR](https://ai-tldr.dev/models/ornith-1-5-9b/)
