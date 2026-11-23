# InterpreticAI/Qwen3.8-27B-Uncensored-v3

## Resumen

Qwen3.8-27B-Uncensored-v3 es un ajuste fino completo (full fine-tune) en BF16 del modelo NousResearch/Arete-27B, que a su vez es un post-entrenamiento de Qwen/Qwen3.8-27B. Lo desarrolla InterpreticAI (autor: Thomas Young) y su objetivo declarado es eliminar el sesgo de censura política que persiste en las respuestas en chino de los modelos de la familia Qwen. Según la model card, Arete-27B ya reduce drásticamente la propaganda en inglés, pero seguía censurando aproximadamente la mitad de las respuestas a preguntas políticas formuladas en chino; esta versión reduce esa tasa al 2,6%.

El modelo mantiene la arquitectura, el tokenizador, la plantilla de chat y el codificador visual de Arete-27B, con 27.356.728.560 parámetros (unos 27,4 mil millones) y un repositorio de 54,7 GB en safetensors. Es un modelo multimodal image-text-to-text con modos de razonamiento (thinking) y no-thinking, pensado para conversación e investigación sobre comportamiento de modelos, no como un modelo de propósito general sin supervisión.

La relevancia actual radica en que cuantifica de forma reproducible el fenómeno de la censura política en LLM de origen chino usando el banco de 145 preguntas de Pan y Xu (2026) y el Propaganda_Eval de Nous Research, y publica los artefactos (BF16, GGUF Q4_K_M, GGUF IQ3_XXS y MLX 4-bit) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.8-27B; codificador visual idéntico al de Arete-27B |
| Parametros totales | 27.356.728.560 (≈27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo), GGUF Q4_K_M, GGUF IQ3_XXS, MLX 4-bit |
| Idiomas soportados | no disponible (la evaluación publicada cubre inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo sobre NousResearch/Arete-27B, que a su vez parte de Qwen/Qwen3.8-27B. La model card no detalla la arquitectura interna (número de capas, atención, tipo de positional encoding) más allá de indicar que conserva la misma arquitectura y el mismo layout de ficheros que Arete-27B, e incluye un codificador visual idéntico. El checkpoint se distribuye en BF16 con safetensors y el repositorio ocupa 54,7 GB, coherente con ~27,4 B de parámetros en precisión completa.

El entrenamiento se orienta específicamente a eliminar la censura política en respuestas en chino, partiendo de un modelo (Arete-27B) que ya había reducido la propaganda en inglés al 1,0 % de respuestas según Propaganda_Eval. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Una diferencia técnica relevante respecto a versiones anteriores: esta v3 no incluye el módulo de decodificación especulativa multi-token prediction (MTP), por lo que debe servirse con decodificación estándar; la v2 sí lo conserva, junto con un checkpoint FP8.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con la de Arete-27B.
- Modo thinking y modo no-thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador visual idéntico al de Arete-27B.
- Respuestas a preguntas políticas en chino sin evasión ni reformulación en talking points del Partido Comunista Chino (según la evaluación del autor: 80,9 % de respuestas abiertas y correctas en tema, frente al 38,3 % de Arete-27B).
- Reducción de propaganda en inglés: 0,5 % de respuestas con propaganda en Propaganda_Eval, frente al 1,0 % de Arete-27B y el 24,5 % de Qwen3.8-27B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la evaluación publicada se limita a inglés y chino.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación sobre censura política en LLM: el modelo sirve como condición experimental "sin censura" frente a Qwen3.8-27B y Arete-27B, usando el banco de 145 preguntas de Pan y Xu (2026) para medir tasas de rechazo, evasión y reformulación en talking points.
- Auditoría de sesgo ideológico: comparar respuestas del modelo base y del ajuste sobre el mismo conjunto de prompts permite aislar el efecto del post-entrenamiento en la alineación política, con métricas cuantificables (porcentaje de respuestas censuradas, porcentaje que se alinea con valores del PCCh).
- Evaluación de robustez de sistemas de moderación: al generar respuestas abiertas sobre temas sensibles, permite probar clasificadores y filtros de contenido en un régimen de baja evasión.
- Análisis de propaganda en inglés: con Propaganda_Eval (803 prompts) se puede medir la presencia de encuadres propagandísticos en un modelo de ~27 B y compararlo con alternativas.
- Despliegue conversacional multimodal en local: el checkpoint GGUF Q4_K_M y la variante MLX 4-bit permiten ejecutar el modelo en hardware de consumo para prototipos de chat con entrada de imagen, con decodificación estándar al no incluir MTP.
- Estudio de la relación entre razonamiento y censura: al conservar los modos thinking y no-thinking, permite analizar si el modo de razonamiento cambia la tasa de evasión ante preguntas políticamente sensibles.
- Base para nuevos ajustes: el checkpoint BF16 completo y la licencia Apache 2.0 lo convierten en punto de partida para fine-tunes adicionales que requieran un modelo con baja tasa de rechazo declarada.

## Benchmarks y rendimiento

Censura política en prompts en chino (Pan y Xu, 2026; 115 preguntas políticamente sensibles, límite de 4.096 tokens de salida, modo no-thinking, decodificación greedy):

| Métrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5 % | 50,4 % | 2,6 % |
| Rechaza o evade (menor es mejor) | 49,6 % | 22,6 % | 0,9 % |
| Reformula en talking points del PCCh (menor es mejor) | 32,2 % | 27,8 % | 1,7 % |
| Se alinea con valores del PCCh (menor es mejor) | 100 % | 30 % | 20 % |
| Tema correcto y respuesta abierta (mayor es mejor) | 12,2 % | 38,3 % | 80,9 % |

Propaganda en prompts en inglés (NousResearch/Propaganda_Eval, 803 prompts):

| Modelo | Respuestas con propaganda (menor es mejor) |
|---|---|
| Qwen3.8-27B | 24,5 % |
| Arete-27B | 1,0 % |
| Qwen3.8-27B-Uncensored-v3 | 0,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, más overhead de KV cache y activaciones; requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 16-18 GB para pesos, viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- VRAM estimada en GGUF IQ3_XXS: aproximadamente 11-13 GB, viable en GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y en Mac con memoria unificada.
- MLX 4-bit: orientado a Apple Silicon; el requisito depende de la memoria unificada del equipo (no se especifica en la información disponible).
- Despliegue: la model card documenta `vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v3 --reasoning-parser qwen3`. Al no incluir MTP, debe servirse con decodificación estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Censura en chino (115 preguntas) | Propaganda en inglés | Formatos |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 | ≈27,4 B | no disponible | Apache 2.0 | 2,6 % | 0,5 % | BF16, GGUF Q4_K_M, GGUF IQ3_XXS, MLX 4-bit |
| Qwen3.8-27B-Uncensored-v2 | no disponible | no disponible | Apache 2.0 | 3,5 % | no disponible | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS; incluye MTP |
| NousResearch/Arete-27B | ≈27,4 B (derivado de Qwen3.8-27B) | no disponible | Apache 2.0 | 50,4 % | 1,0 % | no disponible en la información proporcionada |
| Qwen/Qwen3.8-27B | ≈27,4 B (derivado) | no disponible | Apache 2.0 | 83,5 % | 24,5 % | no disponible en la información proporcionada |

La elección entre v2 y v3 es explícita en la model card: v2 si se necesita decodificación especulativa MTP o FP8; v3 si se prioriza la menor tasa de censura.

## Limitaciones y advertencias

- Cada modelo se generó una sola vez por benchmark, sin repeticiones ni intervalos de confianza; la variabilidad de muestreo no está caracterizada.
- El propio autor advierte que una respuesta sustantiva no es necesariamente correcta: el modelo puede producir afirmaciones factuales erróneas y requiere verificación independiente.
- El ajuste está orientado a un objetivo ideológico concreto (eliminar censura política en chino); esto puede implicar una menor adherencia a salvaguardas generales de seguridad, aunque la información disponible no documenta evaluaciones de seguridad estándar (toxicidad, contenido dañino, jailbreak).
- No se publican evaluaciones de capacidades generales (razonamiento, código, matemáticas, multilingual), por lo que se desconoce si el fine-tune degrada el rendimiento respecto a Arete-27B o Qwen3.8-27B.
- La longitud de contexto no está especificada; no debe asumirse la de Qwen3.8-27B sin verificación.
- Los idiomas soportados no están documentados; la evaluación se limita a inglés y chino.
- Ausencia del módulo MTP: no se puede usar decodificación especulativa multi-token, lo que reduce el throughput frente a la v2 en el mismo hardware.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen la atribución y las condiciones de Nous Research y del equipo Qwen; conviene revisar el fichero LICENSE del repositorio.
- El uso del modelo para generar contenido político sin filtros puede tener implicaciones legales en jurisdicciones con restricciones sobre discurso político o contenido generado; la responsabilidad recae en el desplegador.
- El repositorio tiene 418 descargas y 10 likes en el momento de la consulta; es un artefacto reciente (creado en noviembre de 2026) con validación externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Versión anterior v2: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- v2 en FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- v2 en GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- v2 en GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- v3 en GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- v3 en GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- v3 en MLX 4-bit: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Paper de referencia (Pan & Xu, 2026, PNAS Nexus): https://doi.org/10.1093/pnasnexus/pgag013
- Página de Arete en Nous Research: https://nousresearch.com/arete
- DOI del modelo: https://doi.org/10.57967/hf/11540
