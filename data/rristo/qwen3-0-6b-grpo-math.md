# rristo/qwen3-0.6b-grpo-math

## Resumen
qwen3-0.6b-grpo-math es un ajuste fino de pesos completos del modelo base Qwen3-0.6B-Base, desarrollado por el usuario rristo. El modelo aplica aprendizaje por refuerzo con Group Relative Policy Optimization (GRPO) sin término de divergencia KL para especializarlo en razonamiento matemático. Parte de la implementación de razonamiento desde cero del autor y emplea un conjunto de datos derivado de MATH, excluyendo el subconjunto de evaluación MATH-500.

El modelo tiene 762.118.144 parámetros reales según los safetensors, lo que lo sitúa en la categoría de modelos ultraligeros. Su relevancia radica en ser un experimento reproducible de RL a pequeña escala: con solo 0,6 mil millones de parámetros y un límite de generación de 1024 tokens, alcanza un 56% de acierto en un subconjunto de 50 ejemplos de MATH-500 en el paso 100 de entrenamiento.

La ficha describe un artefacto de investigación más que un asistente general. El autor declara explícitamente que no se hace ninguna afirmación sobre rendimiento como asistente general y que el entrenamiento se centra en razonamiento matemático. Esto condiciona fuertemente los casos de uso y las advertencias que se detallan a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportación con arquitectura personalizada (`custom_code`) |
| Parametros totales | 762.118.144 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-0.6B-Base emplea una ventana nativa de 32.768 tokens; el ajuste se evalúa con generaciones de hasta 1024 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,6 GB), con checkpoint de entrenamiento `.pth` (`qwen3-0.6B-rlvr-grpo-step00100.pth`) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Qwen3, partiendo de Qwen/Qwen3-0.6B-Base. El ajuste se realiza con GRPO sin KL, 8 rollouts por prompt, un máximo de 1024 tokens generados y selección del checkpoint en el paso 100. El dataset de entrenamiento es `rasbt/math_full_minus_math500`, es decir, el corpus MATH completo menos el subconjunto MATH-500, lo que evita contaminación con el conjunto usado para la evaluación reportada.

La innovación principal es la reproducibilidad del pipeline de RL desde cero: el autor publica el checkpoint intermedio y la implementación (`reasoning_from_scratch`). La exportación usa una arquitectura personalizada, por lo que requiere `trust_remote_code=True` tanto en el tokenizador como en el modelo. No se documentan detalles sobre composición exacta del dataset, número total de tokens vistos, ni si hubo etapas previas de SFT; el modelo card indica únicamente el ajuste RL sobre el base.

## Capacidades
- Razonamiento matemático paso a paso: genera cadenas de razonamiento verificables orientadas a problemas de MATH.
- Resolución de problemas de competición y aritmética de nivel escolar y preuniversitario, dentro del dominio del dataset de entrenamiento.
- Generación de texto condicionada por el prompt template matemático del repositorio; la evaluación comparable exige usar esa plantilla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso fuera del dominio matemático.
- Capacidades multilingües limitadas al inglés según la metadata (`language: en`).
- No se documentan capacidades de visión, audio ni modo thinking explícito más allá de la cadena de razonamiento matemático.
- No se documenta comportamiento como asistente general; el autor lo descarta explícitamente.

## Casos de uso
- Evaluación de pipelines de RL a pequeña escala: sirve como referencia reproducible para comparar GRPO sin KL frente a SFT en modelos de 0,6B, usando el checkpoint del paso 100 y el paso 50 (42% en el subconjunto) para medir la curva de aprendizaje.
- Investigación en razonamiento matemático con recursos limitados: permite ejecutar experimentos de RLVR en una sola GPU consumer, dado el tamaño de 762M parámetros y el límite de 1024 tokens de generación.
- Generación de soluciones paso a paso para problemas de MATH en entornos de investigación: el modelo produce cadenas de razonamiento que pueden verificarse automáticamente contra la respuesta final.
- Destilación y arranque en frío para modelos mayores: al ser un ajuste RL sobre un base pequeño, puede usarse para generar datos de razonamiento matemático que alimenten entrenamientos posteriores.
- Reproducción de resultados académicos: el dataset `math_full_minus_math500` y la plantilla de prompt permiten replicar la evaluación reportada (28/50 en el paso 100) y comparar con variantes como las publicadas por otros autores (Linyuana, chenyukun).
- Prototipado de sistemas de tutoría matemática en inglés: con prompts acotados y verificación posterior, puede servir como motor de explicaciones paso a paso en demos de bajo coste, siempre con validación humana.

## Benchmarks y rendimiento

| Evaluación | Resultado | Condiciones |
|---|---|---|
| Subconjunto MATH-500 (50 ejemplos), paso 100 | 28/50 correctos (56%) | Límite de 1024 tokens de generación |
| Subconjunto MATH-500 (50 ejemplos), paso 50 | 21/50 correctos (42%) | Límite de 1024 tokens de generación |

El autor advierte que estas puntuaciones corresponden a un subconjunto de 50 ejemplos y no constituyen un benchmark completo de MATH-500. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,5-2 GB para los pesos, más memoria para KV cache y activaciones; en la práctica cabe en GPUs con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8-1 GB de pesos, aunque no se documentan cuantizaciones oficiales y la arquitectura personalizada puede complicar la conversión.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes se recomienda A100 o H100 por throughput, no por requisito de memoria.
- Cabe en GPU consumer: sí, con holgura en tarjetas de 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la arquitectura personalizada y la ausencia de GGUF hacen que estas herramientas no estén garantizadas.
- Latencia y throughput estimados: no disponibles. El límite de 1024 tokens de generación durante el entrenamiento sugiere que las respuestas largas pueden degradarse o truncarse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rristo/qwen3-0.6b-grpo-math | 762M | No disponible (base con 32K nativo) | GRPO sin KL sobre Qwen3-0.6B-Base, dataset MATH sin MATH-500 | Apache-2.0 | Hugging Face, requiere `trust_remote_code` |
| Linyuana/qwen3-0.6b-grpo-math-reasoning | ~0,8B | No disponible en la información | GRPO sobre GSM8K y MATH, comparado con su variante SFT | No disponible en la información | Featherless |
| chenyukun/qwen3-0.6b-grpo-math | ~0,8B | 32.768 tokens | GRPO según DeepSeekMath sobre Qwen3-0.6B | No disponible en la información | Featherless |
| Qwen/Qwen3-0.6B-Base | 0,6B | 32.768 tokens nativo | Modelo base sin ajuste RL | Apache-2.0 | Hugging Face |

La comparación directa de rendimiento no es posible: los tres ajustes GRPO reportan métricas sobre conjuntos o plantillas distintas, y solo rristo publica el detalle del subconjunto evaluado (50 ejemplos de MATH-500). El modelo base Qwen3-0.6B-Base sirve como referencia de partida, pero no se dispone de sus cifras en MATH-500 en la información proporcionada.

## Limitaciones y advertencias
- El propio autor declara que no se hace ninguna afirmación sobre rendimiento como asistente general; el modelo está entrenado exclusivamente para razonamiento matemático.
- La evaluación reportada (28/50) corresponde a un subconjunto de 50 ejemplos de MATH-500 y no debe interpretarse como la puntuación completa del benchmark.
- Riesgo de alucinación en cadenas de razonamiento largas: el límite de 1024 tokens de generación puede truncar derivaciones y producir respuestas finales incorrectas sin señal clara de error.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con datos de MATH en inglés, el modelo puede reflejar los sesgos de ese corpus y fallar en dominios ajenos.
- Limitaciones de idioma: solo inglés según la metadata; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la exportación con `custom_code` obliga a revisar y confiar en el código remoto del repositorio antes de desplegarlo en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; esto es un riesgo de seguridad en entornos productivos y debe auditarse.
- No se documentan cuantizaciones oficiales ni compatibilidad con motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita el despliegue escalable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La fecha de creación (2026-11-08) y la falta de pipeline declarado dificultan la integración automática en plataformas de inferencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/rristo/qwen3-0.6b-grpo-math
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/rasbt/math_full_minus_math500
- Variante de Linyuana en Featherless: https://featherless.ai/models/Linyuana/qwen3-0.6b-grpo-math-reasoning
- Variante de chenyukun en Featherless: https://featherless.ai/models/chenyukun/qwen3-0.6b-grpo-math
- Paper de GRPO (DeepSeekMath): no disponible en la información proporcionada
- Repositorio `reasoning_from_scratch`: no disponible en la información proporcionada (citado en la model card sin enlace)
