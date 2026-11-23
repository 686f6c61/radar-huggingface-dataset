# richardyoung/Qwen2.5-32B-Instruct-SOM-heretic

## Resumen

Qwen2.5-32B-Instruct-SOM-heretic es una variante modificada del modelo Qwen2.5-32B-Instruct desarrollada por el usuario richardyoung. Se trata de un ajuste fino orientado a eliminar los mecanismos de rechazo y censura del modelo original, empleando técnicas de "abliteration" (modificación de los pesos para suprimir comportamientos de negativa) combinadas con el método SOM (probablemente "Self-Organizing Maps" aplicado a la intervención de capas, aunque la documentación del autor no lo detalla). El resultado es un modelo de 32.763.876.352 parámetros que responde a instrucciones que el modelo base rechazaría.

El modelo hereda la arquitectura transformer densa de Qwen2.5-32B-Instruct, con una ventana de contexto de 131.072 tokens según la especificación del modelo base, y está pensado para generación de texto conversacional. Su relevancia radica en que ofrece una alternativa sin restricciones de contenido sobre una base de alta calidad (Qwen2.5 es uno de los modelos abiertos más capaces en su rango de tamaño), lo que interesa a investigadores que estudian alineación, robustez y comportamiento de modelos, así como a desarrolladores que necesitan un modelo sin filtros para aplicaciones creativas o de rol.

El acceso está restringido en Hugging Face (gated), requiere aceptar condiciones, y la licencia declarada es Apache 2.0, aunque conviene verificar las condiciones reales del autor. El modelo solo declara soporte para inglés y acumula 517 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (según modelo base Qwen2.5-32B-Instruct; no confirmado explícitamente en la ficha del autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se pueden aplicar cuantizaciones estándar GPTQ/AWQ/GGUF por conversión) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (declarada; acceso gated con condiciones del autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con 32.763.876.352 parámetros, atención con RoPE, GQA (grouped query attention) y normalización RMSNorm, entrenado por Alibaba sobre un corpus multilingüe masivo (hasta 18 billones de tokens según la documentación oficial de Qwen2.5) con fases de preentrenamiento, ajuste supervisado y optimización por preferencias (DPO). Sobre esa base, richardyoung aplica una intervención de tipo "abliteration" combinada con el método SOM para suprimir las direcciones de activación asociadas a respuestas de rechazo.

La información pública del autor no detalla el volumen de datos de ajuste, la composición del dataset ni si hubo RLHF adicional. Las referencias arXiv incluidas en los tags (2309.00071 y 2407.10671) corresponden a trabajos sobre evaluación de seguridad y al informe técnico de Qwen2, respectivamente, no a un paper propio de esta variante. No se documentan innovaciones de decodificación especulativa ni atención lineal; las capacidades técnicas son las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general, matemáticas y código heredados de Qwen2.5-32B-Instruct.
- Respuesta a instrucciones sin los rechazos típicos del modelo alineado (comportamiento "uncensored"/"decensored").
- Soporte de tool calling y function calling heredado del modelo base (formato Qwen).
- Capacidad de razonamiento multi-paso y uso como agente, en la medida en que lo permite la base.
- Capacidades multilingües limitadas a las del modelo base, aunque la ficha solo declara inglés.
- No se documenta modo "thinking" explícito, visión ni audio.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas de esta variante con las del Qwen2.5-32B-Instruct original para estudiar qué comportamientos se suprimen y con qué coste en calidad, usando el mismo prompt en ambos modelos.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base rechazaría la petición, aprovechando los 32B de parámetros para mantener coherencia en textos largos.
- Role-play y simulación de personajes: diálogos multi-turno con contexto extenso (hasta 131k tokens) para mantener personalidad y memoria de conversación en sesiones largas.
- Red teaming y evaluación de robustez: generar respuestas a prompts adversarios para construir datasets de evaluación de filtros y clasificadores de seguridad en pipelines de moderación.
- Generación de código en entornos controlados: tareas de programación donde se quiere evitar negativas ante peticiones de análisis de vulnerabilidades o exploits con fines defensivos, con revisión humana obligatoria.
- Fine-tuning posterior: servir como base para ajustes específicos de dominio donde las negativas del modelo alineado interfieren con el dataset, siempre que la licencia y las condiciones del autor lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas propias y no debe asumirse que el rendimiento coincide con el del Qwen2.5-32B-Instruct original; la abliteration suele degradar ligeramente tareas de razonamiento y aumentar la tasa de respuestas dañinas.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 65,5 GB solo para pesos, más overhead de KV cache; se recomienda 80 GB (A100 80GB, H100 80GB) para contexto largo.
- Cuantización INT8: ~33 GB, viable en 2×RTX 4090 (48 GB) o una A6000 48GB con contexto moderado.
- Cuantización INT4 (GPTQ/AWQ/GGUF Q4): ~18-20 GB, cabe en una RTX 4090 24GB o RTX 3090 con contexto reducido.
- Consumer GPU: sí con cuantización 4-bit en GPUs de 24 GB; en 16 GB (RTX 4080) solo con cuantizaciones más agresivas y contexto corto.
- Despliegue: transformers, vLLM, TGI (el repo incluye tag text-generation-inference), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; dependen fuertemente del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-SOM-heretic | 32,7B | 131k (heredado) | Apache 2.0 (gated) | Variante abliterated, solo inglés declarado |
| Qwen/Qwen2.5-32B-Instruct | 32,7B | 131k | Apache 2.0 | Modelo base alineado, multilingüe, referencia de calidad |
| Meta Llama 3.3 70B Instruct | 70B | 128k | Llama 3.3 Community License | Mayor tamaño y calidad, licencia con restricciones |
| Mistral Small 3 (24B) | 24B | 32k | Apache 2.0 | Alternativa abierta de menor tamaño y contexto |

## Limitaciones y advertencias

- Modelo "uncensored": elimina rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito; no apto para producción orientada al usuario final sin moderación externa.
- La abliteration puede degradar capacidades de razonamiento, matemáticas y código respecto al modelo base; no hay benchmarks que lo cuantifiquen.
- Riesgo elevado de alucinación, como en cualquier LLM de 32B, sin mitigación específica documentada.
- Solo declara inglés; el multilingüe del base puede verse afectado por el ajuste.
- Licencia Apache 2.0 declarada, pero el acceso es gated y las condiciones del autor pueden imponer restricciones adicionales; verificar antes de uso comercial.
- Procedencia y metodología de entrenamiento poco documentadas (sin paper ni dataset público), lo que dificulta la reproducibilidad.
- Contexto de 131k heredado no confirmado explícitamente en la ficha del autor; validar empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Informe técnico Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Referencia arXiv:2309.00071: https://arxiv.org/abs/2309.00071
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
