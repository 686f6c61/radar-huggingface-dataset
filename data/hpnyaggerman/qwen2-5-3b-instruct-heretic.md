# hpnyaggerman/Qwen2.5-3B-Instruct-heretic

## Resumen

El modelo `hpnyaggerman/Qwen2.5-3B-Instruct-heretic` es una variante "abliterada" o "decensored" del modelo `Qwen/Qwen2.5-3B-Instruct`, desarrollada por el usuario `hpnyaggerman` mediante la herramienta Heretic v2.0.0.dev0. La abliteración es una técnica de interpretabilidad que modifica los pesos de un modelo para eliminar o reducir los mecanismos internos de rechazo, lo que se traduce en una menor tendencia a negarse a responder ciertas solicitudes. El modelo resultante conserva la arquitectura del original, un transformer denso de 3.085.938.688 parámetros, con 36 capas y una ventana de contexto de 32.768 tokens, aunque solo declara soporte para el idioma inglés en su ficha.

Este modelo es relevante para desarrolladores e investigadores que buscan una versión con menos restricciones de seguridad del Qwen2.5-3B-Instruct, manteniendo sus capacidades de generación de texto, código y matemáticas. La ficha del repositorio incluye parámetros de abliteración específicos y un directorio `reproduce` para la reproducibilidad, lo que lo convierte en una herramienta útil para estudiar los mecanismos de rechazo en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con RoPE, SwiGLU, RMSNorm, attention QKV bias y word embeddings ligados |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (generación máxima: 8.192 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según el repositorio) |
| Licencia | qwen-research |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen2.5-3B-Instruct`, un transformer causal con atención de consultas agrupadas (GQA) de 16 cabezas de consulta y 2 cabezas clave-valor, activación SwiGLU y normalización RMSNorm. El modelo original fue entrenado por el equipo Qwen mediante pretraining y post-training, con mejoras en codificación, matemáticas, generación de texto largo y comprensión de datos estructurados. No se especifican en la ficha los datos exactos de entrenamiento ni la composición del corpus.

La innovación destacable de esta variante es la técnica de abliteración aplicada con Heretic v2.0.0.dev0. Este proceso identifica la "dirección" del rechazo en el espacio de activaciones y modifica los pesos de las capas de atención y MLP para reducir la probabilidad de que el modelo se niegue a responder. Los parámetros de abliteración se documentan en la model card, lo que permite reproducir el proceso. No se menciona la aplicación de RLHF o DPO adicionales, ya que se trata de una modificación posterior al entrenamiento.

## Capacidades

- Generación de texto e instrucciones, heredadas de Qwen2.5-3B-Instruct.
- Razonamiento y matemáticas mejoradas respecto a Qwen2.
- Generación de código en diversos lenguajes de programación.
- Comprensión de datos estructurados y generación de salidas en JSON.
- Soporte de largo contexto de hasta 32.768 tokens.
- Capacidades multilingües del modelo base, aunque el repositorio declara solo inglés.
- Soporte de tool calling y function calling en el modelo original, sin regresiones documentadas en esta variante.
- Reducción de rechazos: el modelo responde a solicitudes que el original rechaza, con un índice de rechazos de 89/100 frente a 96/100 del original.
- Reproducibilidad: incluye un directorio `reproduce` y parámetros de abliteración detallados.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede escribir ficción, guiones o textos con temáticas que el Qwen2.5-3B-Instruct original suele rechazar, manteniendo la calidad del texto.
- Asistente de código en entornos de desarrollo: conserva las capacidades de programación del modelo base, por lo que puede integrarse en pipelines de CI/CD o como asistente local para revisión de código.
- Chat de atención al cliente con contexto largo: la ventana de 32.768 tokens permite gestionar conversaciones multi-turno extensas, aunque la licencia qwen-research impide el uso comercial sin permiso de Alibaba.
- Análisis de datos estructurados: el modelo es capaz de procesar tablas y generar JSON, lo que facilita la extracción de información en tareas de automatización.
- Roleplay avanzado: la abliteración reduce la influencia de los prompts de sistema restrictivos, permitiendo escenarios de roleplay con menos condicionamiento por parte del sistema.
- Experimentación en interpretabilidad: los parámetros de abliteración documentados y la reproducibilidad hacen de este modelo un candidato ideal para investigar los mecanismos de rechazo en modelos de lenguaje.

## Benchmarks y rendimiento

La información disponible solo incluye dos métricas comparativas entre este modelo y el original. No se han publicado otros resultados de benchmarks.

| Metrica | Este modelo | Qwen/Qwen2.5-3B-Instruct |
|---|---|---|
| Refusals | 89/100 | 96/100 |
| KL divergence | 0.0095 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB para los 3.085.938.688 parámetros.
- VRAM estimada con cuantización int8: aproximadamente 3,1 GB.
- VRAM estimada con cuantización int4: aproximadamente 1,5 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4090, A10G, A100, H100.
- Cabe en GPU de consumo: sí, con 8 GB de VRAM en int8, y con 4 GB en int4.
- Opciones de despliegue: Hugging Face Transformers con `device_map="auto"`, vLLM, llama.cpp (con formato GGUF), Ollama y Text Generation Inference (TGI).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals | Disponibilidad |
|---|---|---|---|---|---|
| hpnyaggerman/Qwen2.5-3B-Instruct-heretic | 3.085.938.688 | 32.768 tokens | qwen-research | 89/100 | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3.085.938.688 | 32.768 tokens | qwen-research | 96/100 | HuggingFace |
| arnomatic/Qwen2.5-3B-Instruct-heretic | 3.085.938.688 | 32.768 tokens | qwen-research | No disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos adicionales para otros modelos de tamaño similar en la información disponible.

## Limitaciones y advertencias

- Riesgo de alucinación: al reducir los rechazos, el modelo puede generar contenido falso o dañino sin las barreras de seguridad del original.
- Sesgos conocidos: no se han mitigado los sesgos del modelo base, que pueden aparecer en las respuestas.
- Licencia qwen-research: esta licencia impone restricciones de uso comercial sin autorización explícita de Alibaba.
- Limitación de contexto: la ventana es de 32.768 tokens, y la generación máxima es de 8.192 tokens.
- La abliteración puede degradar ligeramente el rendimiento general, como muestra la divergencia KL de 0.0095 respecto al modelo original.
- Idioma declarado: el repositorio solo lista inglés, aunque el modelo base original soporta más de 29 idiomas.
- No se han realizado evaluaciones de seguridad exhaustivas en esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hpnyaggerman/Qwen2.5-3B-Instruct-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Proyecto Heretic: https://heretic-project.org
- Repositorio de una variante similar: https://huggingface.co/arnomatic/Qwen2.5-3B-Instruct-heretic
