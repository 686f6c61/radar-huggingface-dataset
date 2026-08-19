# mradermacher/Agentic-30B-A3B-GGUF

## Resumen

El modelo `mradermacher/Agentic-30B-A3B-GGUF` es una cuantización en formato GGUF del modelo `opencsg/Agentic-30B-A3B`, un modelo de lenguaje de tipo mixture of experts (MoE) con 30.532.122.624 parámetros totales (30,5B) y, según su nomenclatura, aproximadamente 3 mil millones de parámetros activos (A3B). Está diseñado específicamente para tareas agénticas: uso de herramientas, function calling, ejecución de habilidades (skills) y conversación multilingüe en chino e inglés. La cuantización ha sido realizada por mradermacher, un proveedor habitual de pesos GGUF, con el objetivo de facilitar la ejecución local en hardware de consumo.

Este modelo resulta relevante porque los sistemas agénticos que combinan razonamiento multi-paso con llamadas a herramientas son una de las tendencias más activas en IA aplicada. Al ofrecer una versión cuantizada en GGUF, se permite desplegar un modelo de 30B en GPUs de gama media o incluso en CPU con suficiente RAM, algo que no sería viable con los pesos originales en precisión completa. La licencia "other" y la ausencia de documentación oficial del modelo base limitan, no obstante, su adopción en entornos de producción sin una revisión previa de los términos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en Qwen3 (según tags) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (único quant publicado, 11,4 GB) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | other (términos específicos de opencsg, no especificados) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE, como indican los tags `moe` y `qwen3`. El nombre "A3B" sugiere que de los 30,5B parámetros totales, solo unos 3B se activan por token, lo que permite una inferencia más rápida y eficiente que un modelo denso equivalente. Sin embargo, no se dispone de información oficial sobre el número de expertos, la dimensión del hidden state, el número de capas ni el mecanismo de routing. Tampoco se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La cuantización Q2_K es una conversión estática realizada por mradermacher, sin uso de matrices de importancia (imatrix), lo que puede afectar a la calidad de la compresión.

## Capacidades

- Uso de herramientas (tool use) y function calling, según los tags `tool-use` y `function-calling`.
- Ejecución de agentes multi-paso con razonamiento encadenado, indicado por el tag `agentic`.
- Soporte de "skills" (habilidades modulares), probablemente para tareas especializadas.
- Conversación multilingüe en chino e inglés, con capacidad de alternar entre ambos idiomas.
- Compatible con vLLM para despliegue en producción, según el tag `vllm`.
- Formato GGUF, lo que permite su uso con llama.cpp, Ollama y otros runners locales.

## Casos de uso

- Asistentes virtuales con acceso a APIs: el modelo puede gestionar conversaciones multi-turno y realizar llamadas a servicios externos (búsqueda, calendario, bases de datos) gracias a su soporte de function calling.
- Automatización de tareas de oficina: integrado en un agente que redacta correos, resume documentos o actualiza registros, usando herramientas definidas por el usuario.
- Agentes de razonamiento multi-paso: para problemas que requieren descomposición en subtareas, como planificación de viajes o análisis de datos, donde el modelo encadena llamadas a herramientas y verifica resultados intermedios.
- Soporte al cliente bilingüe: al manejar chino e inglés, puede atender consultas en ambos idiomas y escalar a un humano cuando sea necesario.
- Generación de código con herramientas: aunque no está especializado en código, puede usar herramientas de ejecución o búsqueda de documentación para asistir en tareas de programación.
- Orquestación de subagentes: en un sistema multiagente, puede delegar subtareas a otros modelos o herramientas y consolidar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo o su versión base. Tampoco se dispone de comparativas de rendimiento con otros modelos de la misma categoría.

## Requisitos de hardware

- El único quant publicado (Q2_K) ocupa 11,4 GB, por lo que cabe en GPUs con 12 GB de VRAM o más (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080, A10, etc.).
- En CPU, se necesitarían al menos 16 GB de RAM para cargar el modelo y un margen adicional para el contexto y los cálculos.
- Es compatible con llama.cpp, Ollama y vLLM (según tags), lo que permite desplegarlo tanto en entornos locales como en servidores.
- No se dispone de datos de latencia ni throughput. Al ser un MoE con ~3B activos, se espera una velocidad de generación superior a la de un modelo denso de 30B, pero no hay cifras confirmadas.
- Para uso en producción con vLLM, se recomienda una GPU con al menos 16 GB de VRAM para dejar espacio al KV cache y a las operaciones de atención.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agentic-30B-A3B (opencsg) | 30,5B | ~3B (sin confirmar) | no disponible | other | HuggingFace (base y GGUF) |
| NVIDIA Nemotron 3.5 Lightning 30B A3B | 30B | 3B | no disponible | NVIDIA Open Model License | HuggingFace, NIM |
| Qwen3 Coder 30B | 30,5B | 3,3B | 256K | Apache 2.0 | HuggingFace, LM Studio |

La comparativa es estructural, ya que no hay datos de rendimiento del modelo evaluado. Nemotron 3.5 Lightning está optimizado para tareas agénticas de alta frecuencia, mientras que Qwen3 Coder se centra en código. Agentic-30B-A3B parece orientado a agencia general, pero sin benchmarks no se puede establecer una jerarquía de calidad.

## Limitaciones y advertencias

- Licencia "other": los términos exactos no están especificados en la model card. Es imprescindible revisar la licencia del modelo base `opencsg/Agentic-30B-A3B` antes de cualquier uso comercial.
- Solo se ofrece un quant Q2_K, que es una compresión agresiva. La calidad de salida puede degradarse notablemente en tareas complejas o con matices.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados. Al ser un modelo entrenado con datos no documentados, el riesgo de generar contenido incorrecto o tendencioso es desconocido.
- La longitud de contexto no está publicada, lo que impide planificar aplicaciones que requieran ventanas largas.
- El modelo solo soporta chino e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser una cuantización estática sin imatrix, la perplejidad puede ser peor que la de quants ponderados (como IQ2_XS o Q3_K_M) si estuvieran disponibles.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Agentic-30B-A3B-GGUF
- Modelo base (opencsg/Agentic-30B-A3B): https://huggingface.co/opencsg/Agentic-30B-A3B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
