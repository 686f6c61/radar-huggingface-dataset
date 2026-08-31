# drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45

## Resumen

Este modelo es una versión "abliterated" (con los rechazos de seguridad eliminados) y cuantizada a NVFP4 del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario drowzeys. Se basa en el checkpoint RedHatAI/GLM-5.3-Flash-NVFP4, que a su vez es una cuantización del modelo original de 320B parámetros con arquitectura MoE (18B activos). La versión aquí presentada tiene 169.120.127.838 parámetros totales según los pesos safetensors, lo que sugiere una poda o una cuantización que reduce el almacenamiento, aunque no se especifica el número de parámetros activos para esta variante.

El modelo es multimodal (image-text-to-text), soporta inglés y chino, y está diseñado para ejecutarse con vLLM en configuraciones de memoria unificada como las DGX Spark de NVIDIA. El repositorio de despliegue asociado documenta una ventana de contexto de 1.048.576 tokens, verificada mediante pruebas de passkey. La licencia es MIT, pero el acceso en HuggingFace está restringido (gated) y requiere aceptación de condiciones.

La relevancia de este modelo radica en su combinación de capacidades multimodales, contexto extremadamente largo y ausencia de filtros de contenido, lo que lo hace atractivo para investigación y aplicaciones que requieren generación sin restricciones, aunque con los riesgos asociados a un modelo sin alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, con atención MLA (Multi-head Latent Attention) |
| Parametros totales | 169.120.127.838 (según safetensors) |
| Parametros activos | 18B (según el modelo base GLM-5.3-Flash, no verificado para esta versión) |
| Longitud de contexto | 1.048.576 tokens (documentado en el repositorio de despliegue) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) con cache KV también en NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con 320B parámetros totales y 18B activos por token, utilizando atención MLA (Multi-head Latent Attention) para reducir el coste de la cache KV. Esta versión concreta ha sido sometida a un proceso de "abliteration" (eliminación de direcciones de rechazo) en las capas 15 a 43 (según el nombre del modelo, l15-43), transplantando los pesos de la proyección de salida (o_proj) de un modelo alineado para eliminar comportamientos de rechazo. Las capas tempranas (0-14) permanecen sin modificar, siguiendo la estrategia de "anclaje de seguridad" del autor.

El entrenamiento específico de esta variante no está documentado en la información disponible. Se sabe que parte del checkpoint RedHatAI/GLM-5.3-Flash-NVFP4, que ya incluye cuantización NVFP4, y que el proceso de abliteración se aplica sobre los pesos cuantizados. No hay datos sobre el dataset utilizado ni sobre técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con soporte de contexto largo (hasta 1M tokens).
- Procesamiento multimodal: entrada de imagen y texto (pipeline image-text-to-text), lo que permite descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de código y soporte de tareas de programación, probablemente heredado del modelo base GLM-5.3.
- Sin filtros de contenido: al ser abliterated, no rechaza peticiones que el modelo original consideraría inapropiadas o peligrosas.
- Compatible con vLLM para despliegue eficiente, incluyendo soporte de tensor parallelism y cache KV cuantizada.
- Capacidad de tool calling y function calling no confirmada explícitamente, pero probablemente presente en el modelo base.

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin alineación, comparando respuestas con y sin abliteración para entender los mecanismos de rechazo.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material que requiera explorar temas sensibles sin censura automática.
- Análisis de documentos largos: gracias a su contexto de 1M tokens, puede procesar libros completos, informes extensos o bases de código enteras en una sola pasada.
- Asistencia multimodal en entornos controlados: combinar visión y texto para tareas como descripción de imágenes médicas (con supervisión humana) o análisis de diagramas técnicos.
- Desarrollo de agentes conversacionales para nichos específicos donde se requiere evitar rechazos, como simulación de personajes o roleplay avanzado.
- Evaluación de robustez: probar la capacidad del modelo para mantener coherencia en conversaciones de muy larga duración, aprovechando su ventana de contexto ampliada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de despliegue menciona pruebas de recuperación con passkey a 33K, 131K, 262K, 524K y 1.043.880 tokens, lo que valida la retención de información en contexto largo, pero no hay métricas estándar como MMLU, HumanEval o GSM8K para esta variante específica.

## Requisitos de hardware

- El repositorio de despliegue documenta el uso de dos nodos NVIDIA DGX Spark (GB10, arquitectura sm_121) con 121,7 GiB de memoria unificada cada uno, configurados con tensor parallelism de 2.
- Se requiere al menos ~240 GB de memoria total para cargar los pesos en NVFP4 (el tamaño del repo es 392,6 GB, pero los pesos cuantizados ocupan menos en memoria).
- No es viable en GPUs de consumo convencional (RTX 4090, etc.) debido al tamaño y a la necesidad de memoria unificada o HBM de gran capacidad.
- Opciones de despliegue: vLLM (versión 0.27.1 o superior) con soporte para NVFP4 y cache KV cuantizada. No se menciona compatibilidad con llama.cpp u Ollama.
- La latencia y el throughput no están especificados, pero al ser un MoE con 18B activos, el rendimiento por token debería ser superior al de un modelo denso de tamaño equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Abliterado |
|---|---|---|---|---|---|
| keys-GLM-5.3-Flash-NVFP4-ablit (este) | 169B (almacenados) | 1M | MIT | Sí | Sí |
| GLM-4.5 (Z.ai) | 355B (MoE) | 128K | MIT | No | No |
| Qwen2.5-VL-72B | 72B denso | 128K | Apache 2.0 | Sí | No |
| Llama-3.1-405B | 405B denso | 128K | Llama 3.1 | No | No |

La comparativa es orientativa, ya que no se dispone de benchmarks comunes para esta variante. El modelo destaca por su contexto extremadamente largo y su naturaleza abliterada, algo poco común en modelos de este tamaño.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido dañino, ilegal o éticamente cuestionable sin ningún tipo de filtro. No debe utilizarse en producción sin supervisión humana o sistemas de moderación externos.
- El acceso en HuggingFace está restringido (gated), lo que limita su uso a quienes acepten las condiciones del autor.
- La cuantización NVFP4 puede introducir pérdida de precisión en tareas de razonamiento complejo o matemáticas, aunque no se han publicado evaluaciones al respecto.
- El modelo solo soporta inglés y chino; otros idiomas pueden tener un rendimiento degradado.
- No se dispone de información sobre el proceso de entrenamiento de la abliteración, por lo que no se puede garantizar la estabilidad del comportamiento en todos los escenarios.
- El tamaño del modelo (392,6 GB en disco) y los requisitos de memoria (~240 GB) limitan su despliegue a infraestructura especializada.

## Enlaces

- HuggingFace: https://huggingface.co/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45
- Repositorio de despliegue (GitHub): https://github.com/drowzeys/keys-vLLm.0.27.1-GLM-5.3-Flash-NVFP4-NVFP4KV-1M-Context-Abliterated
- Repositorio de la variante l15-45 (GitHub): https://github.com/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-45-anchorstock
- Modelo base en HuggingFace: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Página oficial de ZCode (herramientas para GLM-5.3): https://zcode.z.ai/en
