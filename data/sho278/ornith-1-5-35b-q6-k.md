# Sho278/ornith-1.5-35b-q6-k

## Resumen

El modelo `ornith-1.5-35b-q6-k` es una cuantización GGUF en Q6_K del modelo Ornith-1.5-35B-A3B, desarrollado por el equipo de ornith-ai. Se trata de un modelo de razonamiento y codificación agéntica con arquitectura de mezcla de expertos (MoE) que activa 3.000 millones de parámetros de un total de 35.000 millones. Su propuesta principal es el marco de "auto-andamiaje" (self-scaffolding) y "auto-mejora" (self-improvement), mediante el cual el propio modelo genera tareas, construye andamiajes específicos y produce soluciones para entrenamiento por refuerzo, cerrando un bucle de mejora continua. Es relevante porque ofrece una alternativa open source con licencia MIT para flujos de trabajo de agentes de código, con un tamaño que permite su ejecución en hardware de gama alta para consumidores. La cuantización Q6_K reduce el peso del modelo manteniendo una fidelidad alta, aunque no se han publicado especificaciones detalladas de contexto ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capas de atención estándar |
| Parametros totales | 35.000 millones |
| Parametros activos | 3.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (esta versión); el repositorio original ofrece otras cuantizaciones GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantización Q6_K) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura MoE con 35.000 millones de parámetros totales y 3.000 millones activos por token, lo que reduce el coste computacional en inferencia frente a un modelo denso del mismo tamaño. El entrenamiento se basa en el marco de auto-mejora introducido en Ornith-1.0: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para refuerzo. Este bucle permite que el modelo cree continuamente nuevas experiencias de aprendizaje sin intervención humana directa. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Razonamiento explícito: el modelo abre cada respuesta con un bloque de pensamiento (`thinking ... response`) antes de dar la respuesta final, lo que facilita el seguimiento de su razonamiento.
- Codificación agéntica: está diseñado para tareas de programación que requieren planificación, generación de código y depuración en múltiples pasos.
- Tool calling: soporta llamadas a herramientas mediante bloques `<tool_call>`, lo que permite integrarlo en flujos de agentes que necesitan interactuar con APIs o ejecutar comandos.
- Auto-mejora: puede generar sus propias tareas y andamiajes, lo que lo hace adecuado para entornos de auto-entrenamiento o generación de datos sintéticos.
- Multilingüismo: no se ha confirmado oficialmente; la información disponible no especifica idiomas soportados.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code para sugerir código, explicar fragmentos y refactorizar, aprovechando su razonamiento explícito y su capacidad de tool calling para ejecutar pruebas.
- Agente autónomo de resolución de issues: en un repositorio, el modelo puede analizar un issue, proponer un plan, generar el parche y ejecutar los tests, gracias a su soporte de agentes y multi-step reasoning.
- Generación de datos sintéticos de código: su bucle de auto-mejora permite crear datasets de entrenamiento con tareas y soluciones generadas por el propio modelo, útil para fine-tuning de modelos más pequeños.
- Automatización de pipelines CI/CD: el modelo puede revisar pull requests, detectar errores comunes y sugerir correcciones, integrándose mediante tool calling con sistemas de integración continua.
- Tutor de programación: al mostrar su razonamiento paso a paso, puede explicar conceptos de algoritmia o depuración a estudiantes, adaptando el nivel de detalle según la consulta.
- Prototipado rápido de scripts: para tareas de automatización o análisis de datos, el modelo puede generar scripts completos a partir de descripciones en lenguaje natural, reduciendo el tiempo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q6_K, el modelo ocupa aproximadamente 26-28 GB en memoria (35.000 millones de parámetros × 6 bits ≈ 26,25 GB, más overhead). Se recomienda al menos 32 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) no es suficiente; se necesitan GPUs con 32 GB o más, como A100 40GB, A6000 48GB, o dos RTX 4090 en paralelo con reparto de capas.
- En consumer GPU: no cabe en una sola GPU de gama media; solo en modelos de gama alta con 32 GB o más (por ejemplo, RTX 6000 Ada, o configuraciones multi-GPU).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte MoE), TGI (Text Generation Inference) y el servidor Docker oficial de ornith-ai que incluye parsers para razonamiento y tool calls.
- Latencia y throughput: no se han publicado datos oficiales; con 3.000 millones de parámetros activos, la velocidad de generación debería ser superior a la de un modelo denso de 35B, pero depende del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables en la información proporcionada. Modelos con arquitectura MoE y tamaño similar (por ejemplo, Qwen2.5-32B-A3B o DeepSeek-R1-Distill) podrían ser alternativas, pero no se han encontrado benchmarks que permitan una comparación objetiva. Se recomienda consultar el repositorio oficial para futuras actualizaciones.

## Limitaciones y advertencias

- No se han documentado sesgos específicos; al ser un modelo entrenado con datos de código, puede reflejar sesgos presentes en repositorios públicos.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto o razonamientos plausibles pero erróneos; se recomienda validar las salidas en entornos de producción.
- Longitud de contexto desconocida: al no publicarse este dato, no se puede garantizar el rendimiento en tareas que requieran ventanas de contexto muy largas.
- Idiomas no confirmados: aunque probablemente funcione bien en inglés y otros idiomas, no hay soporte oficial declarado.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero el usuario asume la responsabilidad del uso del modelo y sus posibles limitaciones.
- La cuantización Q6_K puede introducir ligeras pérdidas de precisión frente al modelo original en BF16; para tareas críticas se recomienda probar con cuantizaciones más altas o el modelo sin cuantizar.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Sho278/ornith-1.5-35b-q6-k
- Repositorio HuggingFace del modelo original (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Repositorio HuggingFace del modelo original (pesos completos): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Imagen Docker oficial: https://hub.docker.com/r/ai/ornith-1.5
