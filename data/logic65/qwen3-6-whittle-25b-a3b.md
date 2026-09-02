# logic65/Qwen3.6-Whittle-25B-A3B

## Resumen

Qwen3.6-Whittle-25B-A3B es un modelo de lenguaje de tipo MoE (Mixture of Experts) creado por David Aylward (logic65) en colaboración con Claude de Anthropic, como parte del proyecto Whittle de compresión de modelos. Parte del modelo base Qwen/Qwen3.6-35B-A3B y le elimina el 30% de los expertos enrutados (de 256 a 180 por capa), reduciendo los parámetros totales de 34,7B a 25,1B, manteniendo los mismos ~3B de parámetros activos por token. El daño causado por la poda se repara mediante auto-destilación desde los pesos originales sin podar, usando una pérdida combinada de KL y entropía cruzada.

El modelo conserva la arquitectura `qwen3_5_moe` del padre, con 8 expertos enrutados y 1 compartido activos por token, y es compatible con transformers estándar y llama.cpp sin parches. Su relevancia radica en demostrar que es posible reducir sustancialmente el tamaño de un MoE manteniendo el rendimiento en tareas de instrucción, e incluso mejorándolo en tareas específicas como GSM8K, gracias al paso de destilación que actúa como un ajuste fino supervisado adicional. Está licenciado bajo Apache-2.0 y los pesos se publican en formato safetensors y GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (`qwen3_5_moe`), 8 expertos enrutados + 1 compartido activos por token |
| Parametros totales | 25.091.371.648 (~25,1B) |
| Parametros activos | ~3B (sin cambios respecto al padre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (mencionado en la model card); otros formatos no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un MoE con 256 expertos enrutados por capa y 8 expertos activos más 1 compartido por token. El proceso de compresión consta de tres fases. Primero, se puntúa cada experto sobre 1M de tokens de calibración (enciclopedia, libros de texto, matemáticas, código y chat) usando un criterio de norma cuadrática media de activación sin gate, que según un estudio de junio de 2026 es el ganador independiente de la tarea para poda one-shot de MoE. Segundo, se eliminan los 76 expertos con menor puntuación por capa, recortando las filas del router correspondientes; los expertos conservados cubrían de media el 82% del tráfico enrutado (71% en la peor capa). Tercero, se repara el modelo durante 900 pasos con lotes de 2048 tokens (≈1,8M tokens en total) usando el modelo sin podar como profesor, con una pérdida 2·KL(profesor‖estudiante) + 1·CE. Se entrenan routers, expertos compartidos y LoRA de rango 8 sobre los expertos conservados, que luego se fusionan en los pesos exportados. El optimizador es Muon para matrices 2D y AdamW para el resto. Los datos de curación son 50% ventanas de corpus crudo y 50% filas de instrucción con plantilla fiel.

## Capacidades

- Generación de texto conversacional y de instrucciones, con modo de pensamiento (thinking mode) heredado del modelo padre.
- Razonamiento matemático: mejora específica en GSM8K (92,5% frente al 88,5% del padre) gracias al paso de destilación con trazas de razonamiento OpenR1-Math.
- Seguimiento de instrucciones en formato chat, con menor entropía cruzada que el padre en texto formateado como chat (1,417 vs 2,510).
- Capacidad de mantener conversaciones multi-turno y recordar nombres (verificado en las primeras etapas de curación).
- Compatibilidad con herramientas de inferencia estándar: transformers ≥ 5.16 y llama.cpp sin parches.
- Soporte de cuantización GGUF Q4_K_M para despliegue eficiente en CPU/GPU.

## Casos de uso

- Asistente de chat autocontenido: el modelo puede desplegarse localmente con llama.cpp o transformers para ofrecer un asistente conversacional con modo de pensamiento, adecuado para entornos sin conexión o con requisitos de privacidad.
- Resolución de problemas matemáticos en educación: su rendimiento mejorado en GSM8K lo hace útil para generar explicaciones paso a paso en ejercicios de aritmética y álgebra, especialmente en formato sin pensamiento explícito.
- Filtrado y clasificación de texto instructivo: al tener menor CE en texto chat, puede emplearse para tareas de generación de respuestas en plantillas de instrucción, como sistemas de QA internos.
- Prototipado de agentes con presupuesto de hardware reducido: al mantener ~3B de parámetros activos, permite ejecutar múltiples instancias en una sola GPU de gama media, útil para pruebas de pipelines de agentes.
- Investigación sobre compresión de MoE: como modelo publicado con metodología detallada, sirve como punto de referencia para experimentos de poda de expertos y destilación auto-supervisada.
- Despliegue en entornos con limitación de almacenamiento: los 50 GB en bf16 (o ~14 GB en Q4_K_M) permiten alojarlo en discos de capacidad moderada, frente a los 70 GB del padre.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, comparando el modelo podado con su padre sin podar:

| Métrica | Qwen3.6-35B-A3B | Qwen3.6-Whittle-25B-A3B |
|---|---|---|
| GSM8K (200 preguntas, sin thinking, greedy, 512 tokens) | 88,5% | 92,5% (185/200) |
| Entropía cruzada held-out, corpus texto (no visto en calibración ni curación) | 1,770 | 1,863 (podado crudo: 1,926) |
| Entropía cruzada held-out, filas de chat | 2,510 | 1,417 |
| Parámetros totales (texto) | 34,7B | 25,1B |
| Tamaño en disco (bf16) | 70 GB | 50 GB |

El autor advierte que la mejora en GSM8K es específica de la tarea (el paso de curación incluye trazas de razonamiento matemático en el formato exacto de evaluación) y no representa una ganancia general: en texto corpus crudo el modelo podado sigue 0,09 nats de CE por encima del padre (1,863 vs 1,770), lo que refleja el coste real de eliminar el 30% de los expertos.

## Requisitos de hardware

- Inferencia en bf16: requiere aproximadamente 50 GB de VRAM (tamaño de los pesos en disco), por lo que se necesitan GPUs de clase A100 80GB, H100, o dos RTX 4090 en paralelo con reparto de capas.
- Inferencia con cuantización GGUF Q4_K_M: estimación orientativa de ~14-16 GB de VRAM para los pesos más overhead, lo que permitiría ejecutarlo en una RTX 4080/4090 de 16 GB o en una RTX 3090 de 24 GB. No hay datos oficiales de consumo medido.
- El modelo fue entrenado en una única RTX PRO 6000 Blackwell en unas cinco horas, lo que indica que el proceso de curación es viable en hardware de gama alta de consumo.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp (`llama-server` con GGUF), y cualquier framework compatible con safetensors y arquitectura `qwen3_5_moe`.
- No se han publicado datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | GSM8K | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (padre) | 34,7B | ~3B | no disponible | 88,5% | Apache-2.0 |
| Qwen3.6-Whittle-25B-A3B | 25,1B | ~3B | no disponible | 92,5% | Apache-2.0 |
| Qwen3.6-27B (dense) | ~27B | 27B | no disponible | no disponible | Apache-2.0 (presumible) |

No se dispone de datos de rendimiento del Qwen3.6-27B dense para una comparación completa. La comparación más relevante es con su propio padre, ya que el modelo podado mantiene la misma arquitectura y tokenizador, con una reducción del 28% en parámetros totales y un coste de 0,09 nats de CE en texto crudo.

## Limitaciones y advertencias

- Regresión en conocimiento de cola larga: los expertos eliminados eran los que menos se activaban en la mezcla de calibración, por lo que el modelo es ligeramente más débil en hechos poco frecuentes o nichos temáticos respecto al padre de 35B.
- La mejora en GSM8K es específica de la tarea y no debe interpretarse como una superioridad general; en texto corpus crudo el modelo sigue siendo peor que el padre.
- El autor advierte que el margen de 8 aciertos en GSM8K (92,5% vs 88,5%) está dentro del ruido de muestreo (±2 puntos), por lo que debe tratarse como "al menos paridad" más que como una ganancia sólida.
- No se especifica la longitud de contexto soportada; el ejemplo de llama.cpp usa 8192 tokens, pero se desconoce el máximo real.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad específicas para este modelo.
- El modelo fue creado en 2026 y su base (Qwen3.6) es reciente; la documentación pública sobre la familia Qwen3.6 es limitada.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el autor solicita apoyo voluntario vía Ko-fi, lo que no afecta a los términos de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Colección Whittle (modelos ejecutables): https://huggingface.co/collections/logic65/whittle-models-you-can-run
- Colección Whittle (investigación y desarrollo): https://huggingface.co/collections/logic65/whittle-research-and-dev
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de Qwen 3.6 (InsiderLLM): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía completa de Qwen3 (InsiderLLM): https://insiderllm.com/guides/qwen3-complete-guide/
- Documentación técnica de Qwen3.6 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Método de poda REAP (Cerebras, arXiv 2510.13999): referencia citada en la model card
- Estudio "How to Score Experts for One-Shot MoE Expert Pruning" (arXiv 2606.15716): referencia citada en la model card
