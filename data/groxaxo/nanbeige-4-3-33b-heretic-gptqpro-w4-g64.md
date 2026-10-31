# groxaxo/Nanbeige-4.3-33B-Heretic-GPTQPro-W4-G64

## Resumen

Nanbeige 4.3 33B Heretic — GPTQ-Pro W4 G64 es una cuantización a 4 bits del modelo Nanbeige 4.3 33B en su variante "Heretic", publicada por el usuario groxaxo en Hugging Face. El modelo base original, Nanbeige4.3-33B, fue desarrollado por el Nanbeige Team como un modelo denso de 33 mil millones de parámetros concebido como profesor de alta capacidad para destilar habilidades de código, uso de herramientas y colaboración profesional en agentes más pequeños. La variante Heretic, creada por Luni, aplica sobre ese checkpoint modificaciones descritas por su autor como "abliteración direccional" para reducir los rechazos del modelo.

Esta versión concreta no añade entrenamiento ni ajuste fino: aplica una cuantización GPTQ-Pro simétrica INT4 con tamaño de grupo 64 (W4 G64) sobre las 364 proyecciones lineales del decodificador, preservando en BF16 los tensores sensibles (embeddings, cabeza de salida y normalizaciones). La calibración se realizó sobre 128 conversaciones públicas reales (123.847 tokens) y el checkpoint se validó generando texto en una RTX 3090. Es relevante para quien busca ejecutar un modelo agéntico de 33B en hardware de consumo, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Llama, 52 capas |
| Parametros totales | 33.118.977.024 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 524.288 tokens declarados en la configuración upstream (no validados en esta cuantización) |
| Tipos de cuantizacion | INT4 simétrico, group size 64 (W4 G64); embeddings, cabeza de salida y normalizaciones en BF16 (107 tensores protegidos) |
| Idiomas soportados | no disponible de forma oficial; generación verificada en inglés, español y chino (calibrado predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ, compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

El modelo original Nanbeige4.3-33B emplea una arquitectura transformer densa de la familia Llama con 52 capas y una configuración que declara una longitud máxima de posición de 524.288 tokens. Fue diseñado por el Nanbeige Team como modelo profesor para agentes más pequeños, con capacidades de código, uso de herramientas y trabajo profesional. Los detalles del corpus de preentrenamiento y postentrenamiento del modelo original no están disponibles en la información proporcionada.

La variante Heretic de Luni parte de esos pesos BF16 y aplica, según describe su autor, abliteración direccional y otras modificaciones sobre el checkpoint, sin reentrenamiento completo. Esta cuantización de groxaxo no altera la arquitectura ni los pesos semánticamente: usa GPTQ-Pro (fork propio, revisión `c4136e8`) con la receta `quality_4bit(group_size=64)`: INT4 simétrico con grupo 64, minimización de error calibrada mediante GAR y MSE ponderado por activaciones, Hessian en FP32 estricto, y preservación exacta de 107 tensores BF16 (embeddings, output head y normalizaciones). La calibración usó 128 conversaciones públicas completas de 512–2048 tokens (64 de código, 48 de chat, 16 de uso de herramientas), semilla 3407, con el tokenizador y la plantilla de chat originales de Nanbeige. No se realizó ningún entrenamiento adicional.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Generación y comprensión de código: el linaje del modelo base reporta puntuaciones orientadas a tareas de ingeniería de software (Terminal-Bench 2.1, DeepSWE en el modelo original BF16).
- Uso de herramientas (tool calling): el modelo base fue diseñado para tool use y la calibración de esta cuantización incluyó 16 conversaciones de uso de herramientas.
- Soporte de agentes y razonamiento multi-paso: el modelo original se posiciona como profesor para destilación en agentes más pequeños.
- Generación multilingüe verificada de forma superficial en inglés, español y chino (sin benchmarks de calidad en chino).
- Sin capacidades nativas de visión o audio declaradas.

## Casos de uso

- Asistentes de código locales: con ~21,4 GB de pesos, el modelo cabe en una RTX 3090 de 24 GB, lo que permite un copiloto de programación privado sin depender de APIs externas.
- Agentes con tool calling autoalojados: el linaje agéntico del modelo base y la inclusión de conversaciones de herramientas en la calibración lo hacen adecuado para pipelines de agentes que invocan funciones en múltiples pasos.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno en español e inglés; la ventana de contexto declarada de 524K tokens (no validada en INT4) permitiría en teoría contextos muy largos, aunque conviene limitarse a rangos probados.
- Prototipado de modelos "sin restricciones": la variante Heretic reduce los rechazos del modelo según su autor, útil para investigación sobre alineación y comportamiento de modelos abliterados (con las cautelas éticas correspondientes).
- Destilación y evaluación de profesores: puede usarse como modelo profesor para generar datos sintéticos de código y uso de herramientas destinados a entrenar modelos más pequeños, siguiendo la intención original del Nanbeige Team.
- Inferencia en estaciones de trabajo con CUDA: los kernels nativos Ampere V3 de GPTQ-Pro operan sobre los pesos empaquetados sin copia persistente adicional, pensados para inferencia local en GPUs NVIDIA de la serie 30.

## Benchmarks y rendimiento

Del modelo original BF16 (Nanbeige4.3-33B, según su model card, con los harnesses de sus autores; no medidos para la variante Heretic ni para esta cuantización INT4):

| Benchmark | Nanbeige4.3-33B (BF16 original) |
|---|---|
| Terminal-Bench 2.1 | 80,9 |
| DeepSWE | 65,5 |
| Automation Bench | 54,2 |

Para esta versión cuantizada solo se han publicado métricas de humo del checkpoint, no de tareas downstream:

| Métrica | Resultado |
|---|---|
| NLL (heldout) | 2,023799 nats/token |
| Perplexity | 7,567019 |
| Conversaciones heldout | 24 (512 tokens por conversación) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, etc.) para esta cuantización, ni una comparación directa BF16 frente a INT4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,4 GB solo de pesos (tamaño del repo), más KV cache y activaciones; en la práctica se necesita una GPU de 24 GB para un margen razonable.
- GPU de referencia validada: RTX 3090 (24 GB), con generación verificada mediante el backend nativo de GPTQ-Pro.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como RTX 3090 o RTX 4090. En GPUs de 16 GB no es viable sin offload.
- Despliegue: librería transformers con soporte GPTQ; compatible con text-generation-inference (endpoints_compatible). El backend nativo de GPTQ-Pro (kernels Ampere V3) es la vía validada por el autor. No se menciona soporte verificado en llama.cpp, Ollama o vLLM para este formato concreto.
- Latencia y throughput: no disponibles; el propio autor aclara que el diseño de kernels no es una ventaja de throughput demostrada para este checkpoint.

## Comparativa con modelos similares

| Característica | Nanbeige 4.3 33B Heretic GPTQ W4 | Nanbeige4.3-33B (original) | Qwen2.5-32B-Instruct (referencia de categoría) |
|---|---|---|---|
| Parámetros | 33,1B (INT4) | 33,1B (BF16) | 32,5B |
| Arquitectura | Llama-family densa, 52 capas | Llama-family densa, 52 capas | Transformer denso |
| Contexto | 524K declarado (no validado en INT4) | 524K declarado | 128K |
| Cuantización | INT4 G64, tensores sensibles BF16 | BF16 | BF16 (existen cuantizaciones de terceros) |
| Abliteración | Sí (variante Heretic) | No | No |
| Licencia | Apache 2.0 | Apache 2.0 (según model card del cuantizador) | Apache 2.0 |
| Benchmarks agénticos publicados | no disponibles | 80,9 Terminal-Bench 2.1; 65,5 DeepSWE; 54,2 Automation Bench | no disponibles en esta ficha |

## Limitaciones y advertencias

- No hay comparación medida entre el checkpoint BF16 original y esta versión INT4; no debe asumirse paridad de precisión en tareas downstream.
- Los benchmarks agénticos (Terminal-Bench 2.1, DeepSWE, Automation Bench) corresponden al modelo original BF16, no a la variante Heretic ni a esta cuantización.
- La abliteración de la variante Heretic no fue reproducida ni verificada independientemente por el cuantizador; sus efectos sobre razonamiento y seguridad no están cuantificados. Un modelo con rechazos reducidos incrementa el riesgo de generar contenido inadecuado.
- La calibración se hizo predominantemente en inglés; la calidad en chino no ha sido evaluada y la calidad en español solo pasó una prueba de humo de generación.
- El contexto de 524.288 tokens está declarado en la configuración upstream pero no ha sido validado en esta cuantización; el uso de contextos muy largos es bajo tu propio riesgo.
- Riesgo de alucinación típico de LLM: no disponible una medición específica, pero aplica con especial cuidado en tareas agénticas y de código.
- Sesgos conocidos: no disponibles datos específicos; hereda los sesgos del corpus del modelo base Nanbeige.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también los términos del modelo base y de la variante Heretic.
- Descargas muy bajas (63) y validación limitada a pruebas de humo: para producción se recomienda evaluación propia exhaustiva antes de desplegar.

## Enlaces

- Modelo cuantizado: https://huggingface.co/groxaxo/Nanbeige-4.3-33B-Heretic-GPTQPro-W4-G64
- Modelo base (variante Heretic BF16): https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo original del Nanbeige Team: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Fork GPTQ-Pro del autor: https://github.com/groxaxo/GPTQ-Pro
- Documentación de kernels Ampere V3: https://github.com/groxaxo/GPTQ-Pro/blob/main/docs/KERNEL_V3.md
- Procedencia de la cuantización (en el repo): QUANTIZATION_PROVENANCE.json
- Registro de validación (en el repo): VALIDATION.json
