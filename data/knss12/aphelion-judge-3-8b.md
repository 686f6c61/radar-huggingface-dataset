# knss12/Aphelion-Judge-3.8B

## Resumen

Aphelion-Judge-3.8B es un modelo especializado en la verificación de fundamentación (groundedness) y detección de alucinaciones en pipelines de generación aumentada por recuperación (RAG). Lo desarrolla el usuario knss12 y parte de `microsoft/Phi-3.5-mini-instruct` como modelo base. Su función no es generar texto libre, sino auditar respuestas generadas por otros modelos contra los documentos de contexto recuperados y emitir un veredicto determinista en JSON con dos campos: `reason` (una frase atómica de auditoría) y `grounded` (booleano).

La propuesta técnica central es el uso de Micro-Chain-of-Thought: el modelo genera una breve justificación antes de emitir el veredicto booleano, lo que según el autor eleva el F1 fuera de distribución de 0,562 a 0,741 (+17,9 puntos) frente a un baseline que responde directamente en JSON. El modelo tiene 3.821.079.552 parámetros en una arquitectura transformer densa decoder-only con 32 bloques, dimensión oculta 3072 y atención con LongRoPE hasta 131.072 tokens.

Es relevante porque aborda un problema concreto de producción en sistemas RAG: distinguir si una afirmación está respaldada por el contexto recuperado. Al ser un modelo de 3,8B, cabe en GPUs de consumo y ofrece latencias de alrededor de 2,7 segundos en mediana para la variante Micro-CoT, con un 99,79 % de cumplimiento estricto de JSON según las métricas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (base: microsoft/Phi-3.5-mini-instruct) |
| Parametros totales | 3.821.079.552 (~3,82B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (LongRoPE, `max_position_embeddings`) |
| Tipos de cuantizacion | FP16 (safetensors) y Q4_K_M (GGUF); entrenamiento con QLoRA 4-bit NF4 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |
| Profundidad y anchura | 32 bloques, `d_model = 3072`, MLP SwiGLU con dimension intermedia 8192 |
| Atencion | 32 cabezas, LongRoPE, pre-normalizacion RMSNorm |
| Metodo de adaptacion | QLoRA 4-bit NF4 (rank 16, alpha 32) fusionado en pesos FP16 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso heredado de Phi-3.5-mini-instruct, con 32 bloques, dimensión oculta de 3072, MLP SwiGLU de dimensión intermedia 8192, 32 cabezas de atención, RMSNorm como pre-normalización y codificación posicional LongRoPE que extiende el contexto hasta 131.072 tokens. La adaptación se realizó mediante QLoRA en 4 bits NF4 con rank 16 y alpha 32, aplicada sobre las proyecciones `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`, y posteriormente fusionada matemáticamente en pesos FP16 independientes (`W_merged = W_0 + (alpha / r) * B @ A`).

La innovación destacable es el Micro-CoT: en lugar de predecir el booleano inmediatamente después del contexto, el modelo genera primero una frase de auditoría atómica y después el veredicto. Según el autor, esto proporciona memoria de trabajo explícita y mejora el F1 OOD en 17,9 puntos manteniendo la salida compacta (unos 40 tokens frente a más de 130 en jueces verbosos). Además, la plantilla de chat incorpora un system prompt por defecto que impone conocimiento externo cero, descomposición atómica de afirmaciones y tratamiento de la incertidumbre como no fundamentada (`false`). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Verificación de fundamentación RAG: compara una respuesta con los documentos de contexto recuperados y determina si está respaldada.
- Detección de alucinaciones: identifica afirmaciones no sustentadas por el contexto.
- Salida JSON determinista con los campos `reason` y `grounded`.
- Razonamiento Micro-CoT: genera una justificación breve antes del veredicto booleano.
- Cumplimiento estricto de formato JSON (99,79 % declarado en el benchmark OOD).
- Procesamiento de contextos largos gracias a la ventana de 131.072 tokens.
- Modo cascada: puede combinarse con un baseline directo (`Exp-01 -> Aphelion-Judge`) para mejorar el recall.
- Despliegue en `transformers`, `vLLM` y `llama.cpp`/`Ollama` con comportamiento consistente.
- Capacidad multilingüe: no disponible (solo inglés declarado).
- Tool calling / function calling: no disponible en la información.
- Visión o audio: no disponible.

## Casos de uso

- Auditoría de respuestas en pipelines RAG: integrar el modelo como paso de validación posterior a la generación; recibe contexto, pregunta y respuesta, y devuelve un veredicto JSON que el orquestador puede usar para bloquear o marcar respuestas no fundamentadas.
- Filtrado de alucinaciones en atención al cliente: verificar cada respuesta generada contra la base de conocimiento antes de enviarla al usuario, aprovechando la ventana de 131K tokens para incluir documentos largos completos.
- Evaluación automática de sistemas de QA: usar el modelo como juez en procesos de evaluación continua de otros LLM, con salida estructurada fácil de agregar en métricas de precisión y recall.
- Moderación de contenido generado en producción: ejecutar el verificador como guardarraíl en cascada (primero un clasificador rápido y después Aphelion-Judge) para equilibrar latencia y recall, según el esquema `Exp-01 -> Aphelion-Judge`.
- Generación de conjuntos de datos de entrenamiento: etiquetar pares contexto-respuesta como fundamentados o no fundamentados para construir datasets de ajuste fino o de evaluación.
- Despliegue en el borde o en hardware de consumo: al ser un modelo de 3,8B con GGUF Q4_K_M, puede ejecutarse en CPU o en GPU de gama media para verificaciones locales sin depender de la nube.
- Investigación sobre groundedness: servir como línea base reproducible para estudiar técnicas de verificación de hechos en sistemas RAG.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark OOD `test_ood_pure` (n=468). Las métricas del model-index no están verificadas de forma independiente.

| Modelo / Variante | Params | JSON estricto | F1 OOD (FAIL) | Precision | Recall | Tokens salida medios | Latencia p50 |
|---|---|---|---|---|---|---|---|
| Phi-3.5-mini Zero-Shot | 3,82B | 0,00 % | 0,652 | — | — | — | 1740,0 ms |
| Flow-Judge-v0.1 | 3,82B | — | 0,752 | — | — | ~130+ | 5858,0 ms |
| Exp-01: baseline Direct-JSON | 3,82B | 96,37 % | 0,562 | 0,872 | 0,415 | 7,33 | 645,6 ms |
| Aphelion-Judge-3.8B (Micro-CoT) | 3,82B | 99,79 % | 0,741 | 0,752 | 0,731 | 40,31 | 2753,3 ms |
| Cascada (Exp-01 -> Aphelion-Judge) | 3,82B | 99,79 % | 0,744 | 0,749 | 0,740 | 36,53 | 3435,8 ms |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 7,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 9 y 12 GB según longitud de contexto.
- VRAM estimada en Q4_K_M (GGUF): aproximadamente 2,4-2,8 GB para los pesos, lo que permite ejecución en CPU o GPU con 4-6 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para FP16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en FP16; en GPUs de 4-8 GB mediante GGUF Q4_K_M.
- Opciones de despliegue: `transformers`, `vLLM`, `llama.cpp`, `Ollama` (con el `Modelfile` incluido en `gguf/`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: latencia p50 de 2753,3 ms para Micro-CoT y 645,6 ms para el baseline Direct-JSON, según las mediciones del autor en el benchmark OOD; no se especifica el hardware usado en esas mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aphelion-Judge-3.8B | 3,82B | 131.072 | 0,741 | MIT | Hugging Face (safetensors + GGUF) |
| Flow-Judge-v0.1 | 3,82B | no disponible | 0,752 | no disponible | Hugging Face |
| Phi-3.5-mini-instruct (zero-shot) | 3,82B | 131.072 | 0,652 | MIT | Hugging Face |
| Exp-01 Direct-JSON (baseline del autor) | 3,82B | 131.072 | 0,562 | no disponible | no disponible |

Flow-Judge-v0.1 obtiene un F1 ligeramente superior (0,752 frente a 0,741) pero con una latencia p50 de 5858 ms y más de 130 tokens de salida, más del doble de latencia que Aphelion-Judge. El modelo base sin ajustar queda muy por debajo (0,652) y no cumple el formato JSON estricto (0 %).

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El F1 OOD de 0,741 implica que aproximadamente una de cada cuatro clasificaciones falla en el conjunto de evaluación; no es adecuado como único mecanismo de control en aplicaciones críticas.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El modelo está diseñado exclusivamente para verificación de groundedness; no debe usarse como generador de texto general.
- Riesgo de sesgo heredado del corpus de entrenamiento de Phi-3.5-mini-instruct, no documentado en la información disponible.
- El system prompt por defecto impone un comportamiento estricto (cero conocimiento externo, incertidumbre como no fundamentado); modificarlo puede degradar el rendimiento.
- La latencia de Micro-CoT (2,7 s p50) es notablemente superior al baseline Direct-JSON (0,65 s), lo que puede ser limitante en aplicaciones de alta concurrencia.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor sobre el rendimiento en dominios distintos al benchmark evaluado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knss12/Aphelion-Judge-3.8B
- Repositorio de archivo experimental (adaptadores QLoRA, logs de cascada): https://huggingface.co/knss12/aphelion-judge
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
