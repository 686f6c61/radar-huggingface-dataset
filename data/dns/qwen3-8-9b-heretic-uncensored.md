# dns/Qwen3.8-9B-heretic-uncensored

## Resumen

`dns/Qwen3.8-9B-heretic-uncensored` es una versión "decensurada" (abliterada) del modelo `empero-ai/Qwen3.8-9B`, creada por el usuario `dns` mediante la herramienta Heretic v1.4.0. El modelo original es una destilación full-parameter del profesor Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-9B, entrenado con aproximadamente 70.000 trazas de razonamiento (chain-of-thought) curadas, abarcando matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas.

El proceso de abliteration elimina selectivamente los pesos asociados al comportamiento de rechazo, reduciendo las negativas de 100/100 a 2/100 (98/100 refusals eliminadas) con una divergencia KL de solo 0.0008 respecto al modelo original, lo que indica una alteración mínima del comportamiento general. El modelo mantiene la ventana de contexto nativa de 262.144 tokens del base Qwen3.5-9B y conserva las capacidades de razonamiento con bloques `thinking`, function calling y destilación de razonamiento del modelo Empero original.

Este modelo es relevante para desarrolladores que necesitan un modelo de razonamiento de 9B desplegable en una sola GPU sin las restricciones de rechazo de contenido típicas de los modelos alineados, manteniendo métricas de razonamiento competitivas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrida: attention estándar + Gated DeltaNet linear attention) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | no disponible (repo en safetensors bf16; se pueden generar GGUF/AWQ externamente) |
| Idiomas soportados | inglés (etiqueta `en`; el base Qwen3.5-9B soporta más idiomas, pero el fine-tune solo se evaluó en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-9B` utiliza una arquitectura híbrida que combina capas de attention estándar con capas de Gated DeltaNet (linear attention), lo que reduce el coste computacional en contextos largos. Requiere los kernels de `flash-linear-attention` y `causal_conv1d` para un rendimiento óptimo; sin ellos, las capas de atención lineal caen en operaciones PyTorch lentas y con alto consumo de memoria.

El entrenamiento del modelo original `empero-ai/Qwen3.8-9B` consistió en una destilación off-policy full fine-tune (todos los parámetros actualizados, no un adapter) sobre aproximadamente 70.000 trazas de chain-of-thought del profesor Qwen3.8 2.4T A95B, con un sesgo deliberado hacia matemáticas duras y programación competitiva. El fine-tune es solo texto; el comportamiento de visión se hereda del base pero no fue evaluado.

La modificación de "heretic" aplica una técnica de abliteration que identifica la dirección en el espacio de activaciones asociada al rechazo y la elimina de los pesos de proyección (`attn.o_proj` y `mlp.down_proj`), con los parámetros documentados en la model card (direction_index 17.74, pesos máximos/mínimos por capa). El proceso es reproducible mediante el directorio `reproduce/` del repositorio.

## Capacidades

- Razonamiento con chain-of-thought: cada respuesta abre con un bloque `thinking` aprendido directamente de las trazas del profesor, no generado sintéticamente.
- Function calling nativo según la especificación Qwen3.5, sin wrappers ni fine-tunes específicos de herramienta.
- Matemáticas y código: el mix de entrenamiento está deliberadamente ponderado hacia problemas matemáticos difíciles y programación competitiva.
- Seguimiento de instrucciones multi-turno con formato de chat Qwen3.5 estándar.
- Generación de texto con contexto largo de hasta 262.144 tokens.
- Comportamiento decensurado: 98 de 100 rechazos eliminados respecto al modelo original, con divergencia KL de 0.0008.
- Capacidades de visión heredadas del base Qwen3.5-9B (etiqueta `image-text-to-text`), aunque no evaluadas en el fine-tune.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo permite generar narrativa, diálogos y contenido literario con temáticas adultas o controvertidas sin rechazos automáticos, útil para estudios creativos y herramientas de escritura asistida.
- Asistente de programación en producción: con function calling nativo y énfasis en programación competitiva, puede integrarse en pipelines de CI/CD para generación de código, revisión de pull requests y autocompletado de funciones complejas.
- Razonamiento matemático educativo: el modelo mantiene un rendimiento de 0.870 en GSM8K (flexible-extract), adecuado para tutores automáticos que expliquen problemas paso a paso con bloques de razonamiento visibles.
- Investigación en seguridad de IA: el proceso de abliteration reproducible permite estudiar el comportamiento de modelos decensurados, medir la degradación de capacidades tras la eliminación de rechazos y comparar con otras técnicas de jailbreak.
- Agentes autónomos con tool use: la ventana de 262.144 tokens y el soporte de function calling permiten construir agentes multi-paso que mantienen contexto extenso de conversación y llamadas a herramientas.
- Chat conversacional sin censura para entornos controlados: el modelo puede desplegarse en aplicaciones de simulación de personajes o juegos de rol donde se requiere libertad de expresión sin filtros de seguridad.
- Destilación de conocimiento: al ser una destilación de un profesor de 2.4T parámetros, sirve como referencia para estudiar cómo se transfieren las capacidades de razonamiento a modelos densos pequeños.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` (backend HF, protocolos CoT) según la model card del modelo original:

| Tarea | Métrica | Qwen3.5-9B (base) | Qwen3.8-9B | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.885 | 0.870 | −0.015 |
| gsm8k_cot | exact_match (strict) | 0.875 | 0.850 | −0.025 |
| MMLU (CoT, 57 materias) | acc (flexible-extract) | 0.546 | 0.751 | +0.205 |
| MMLU (CoT, 57 materias) | acc (strict-match) | 0.251 | 0.511 | +0.260 |

Parámetros de muestreo: `temperature=0.6, top_p=0.95, top_k=20`.

La versión abliterada (`dns/Qwen3.8-9B-heretic-uncensored`) reporta una divergencia KL de 0.0008 frente al modelo original y una tasa de rechazos de 2/100 (frente a 100/100 del original), lo que sugiere una degradación mínima de capacidades, aunque no se publicaron benchmarks completos de la versión decensurada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,8 GB en bf16 (9,4B parámetros × 2 bytes), más overhead de KV cache y activaciones; con cuantización Q4/Q8 se reduce a 5-10 GB.
- GPU recomendadas: NVIDIA A100 40GB, H100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16; GPUs de 8-12 GB con cuantización GGUF.
- Cabe en consumer GPU: sí, en RTX 4090/3090 con bf16 y en GPUs de 8 GB con cuantización 4-bit.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, llama.cpp (con conversión GGUF), Ollama (con conversión previa).
- Requisito específico: se necesitan los kernels de `flash-linear-attention` y `causal_conv1d` (build compatible con CUDA) para un rendimiento aceptable de las capas Gated DeltaNet; sin ellos, la inferencia es lenta y con alto consumo de memoria.
- Latencia y throughput estimados: no disponible; depende del hardware y de la cuantización. El modelo genera bloques `thinking` largos, por lo que se recomienda `max_new_tokens` generoso (16.384).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (flexible) | GSM8K (flexible) | Licencia |
|---|---:|---:|---:|---:|---|
| dns/Qwen3.8-9B-heretic-uncensored | 9,4B | 262.144 | ~0.751 (heredado) | ~0.870 (heredado) | Apache 2.0 |
| empero-ai/Qwen3.8-9B | 9,4B | 262.144 | 0.751 | 0.870 | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | 9,4B | 262.144 | 0.546 | 0.885 | Apache 2.0 |
| Qwen/Qwen3-8B (referencia) | 8,2B | 32.768 | no disponible | no disponible | Apache 2.0 |

La diferencia principal frente al base Qwen3.5-9B es el salto de +0.205 en MMLU gracias a la destilación, con una ligera caída de −0.015 en GSM8K. Frente al modelo Empero original, la versión heretic solo difiere en la eliminación de rechazos (KL 0.0008), manteniendo el resto de capacidades.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o peligroso sin filtros; el despliegue en producción debe considerar políticas de uso responsable y moderación aguas abajo.
- El fine-tune es solo texto; las capacidades de visión se heredan del base Qwen3.5-9B pero no fueron evaluadas, por lo que su calidad en tareas multimodales es incierta.
- El modelo está etiquetado solo en inglés; el rendimiento en otros idiomas no fue evaluado y puede degradarse respecto al base.
- La decodificación greedy en generaciones largas es un modo de fallo conocido (bucles de repetición); se recomienda muestreo con `temperature=0.6, top_p=0.95, top_k=20`.
- El modelo tiende a deliberar en exceso en preguntas fáciles, heredando el estilo del profesor; puede producir respuestas más largas de lo necesario.
- Requiere kernels especializados (flash-linear-attention, causal_conv1d) para un rendimiento aceptable; sin ellos, la inferencia es significativamente más lenta.
- El proceso de abliteration puede degradar sutilmente la calidad en tareas específicas no cubiertas por las métricas publicadas (KL 0.0008 es baja pero no cero).
- Los benchmarks publicados corresponden al modelo Empero original; la versión heretic no tiene benchmarks independientes completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dns/Qwen3.8-9B-heretic-uncensored
- Modelo original Empero: https://huggingface.co/empero-ai/Qwen3.8-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Proyecto Heretic: https://heretic-project.org
- Organización Empero: https://empero.org
- Repositorio flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
- Variante espejo del modelo: https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/rohit267/Qwen3.8-9B-heretic-uncensored
