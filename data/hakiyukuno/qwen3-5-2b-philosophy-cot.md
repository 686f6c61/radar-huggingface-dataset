# Hakiyukuno/Qwen3.5-2B-Philosophy-CoT

## Resumen

Qwen3.5-2B-Philosophy-CoT es un modelo ligero de generación de texto ajustado (fine-tuned) a partir de Qwen3.5-2B, desarrollado por el usuario Hakiyukuno y publicado en Hugging Face. Se trata de una versión con los adaptadores LoRA ya fusionados (merged), especializada en filosofía académica china y occidental, con alineación a razonamiento en cadena (Chain-of-Thought, CoT). El problema que resuelve es la tendencia de los modelos pequeños a divagar en tareas de razonamiento abstracto sin llegar a una respuesta concreta: el modelo se ha entrenado para seguir una estructura de decisión convergente del tipo 【análisis de categorías】→【exclusión por ítems】→【respuesta explícita】.

Su relevancia es principalmente de nicho: demuestra que con un ajuste LoRA de solo 14,45 millones de parámetros entrenables (0,7621 % del total) y un dataset de unas 1.200 conversaciones, un modelo de 1,88 mil millones de parámetros puede pasar de un 0 % de precisión en preguntas académicas de filosofía a un 56 %, además de cumplir el formato de salida estructurado en el 100 % de los casos y reducir la latencia media por muestra de 9,70 s a 5,88 s. Es un ejemplo ilustrativo de ajuste eficiente (PEFT) con recursos mínimos: el entrenamiento se realizó en una única RTX 4060 de 8 GB consumiendo unos 5,5 GB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.5), ajuste LoRA fusionado |
| Parámetros totales | 1.881.825.088 (≈1,88 B, dato real de safetensors) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B; no se especifica en la model card) |
| Tipos de cuantización | No disponible (pesos en bfloat16; no se publican versiones cuantizadas) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamaño del repo: 3,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder de la familia Qwen de Alibaba, y aplica un ajuste eficiente mediante LoRA (PEFT) con rank 16, alpha 32 y dropout 0,05, sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los adaptadores se han fusionado en los pesos base, por lo que el repositorio distribuye el modelo completo listo para inferencia, no un adapter independiente. La precisión de cómputo es bfloat16.

Los datos de entrenamiento combinan tres fuentes: el subconjunto de filosofía de `cais/mmlu` (preguntas de epistemología, metafísica y ética), un corpus de citas académicas de filosofía china y occidental (Platón, Aristóteles, Kant, Hegel, Descartes, Hume, Spinoza, los pensadores del periodo pre-Qin y el neoconfucianismo de las dinastías Song y Ming), y un conjunto de conversaciones con razonamiento en cadena. La escala es reducida: 1.080 conversaciones de entrenamiento, 120 de validación y 100 de test independientes (sin contaminación de entrenamiento, según el autor). El entrenamiento se realizó durante 3 épocas (204 pasos) con optimizador `paged_adamw_8bit`, learning rate 2e-4 con decaimiento coseno y batch size efectivo de 16 (2 × acumulación de gradiente 8). No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en chino e inglés, con especialización en filosofía académica.
- Razonamiento en cadena (Chain-of-Thought) estructurado y convergente: análisis de categorías, exclusión de opciones y respuesta final explícita.
- Resolución de preguntas tipo test de filosofía (opción múltiple) con alto cumplimiento de formato (100 % en el test del autor).
- Cobertura temática de epistemología, metafísica, ética, filosofía griega clásica, filosofía alemana clásica, racionalismo y empirismo modernos, y filosofía china (pre-Qin y neoconfucianismo).
- Compatible con la plantilla de chat estándar de Qwen mediante `apply_chat_template`.
- No hay evidencia de capacidades de visión, audio, tool calling ni soporte de agentes; la model card no los menciona.

## Casos de uso

- Respuesta a preguntas académicas de filosofía: dada su especialización en MMLU-philosophy y corpus clásicos, puede usarse como asistente de estudio para oposiciones, exámenes de grado o autoevaluación con preguntas tipo test.
- Generación de material didáctico: puede producir explicaciones paso a paso de distinciones conceptuales (por ejemplo, la diferencia entre juicios sintéticos a priori y empíricos en Kant) siguiendo una estructura pedagógica coherente.
- Anotación y filtrado de datasets filosóficos: su 100 % de cumplimiento de formato lo hace apto para pipelines automáticos de etiquetado o verificación de respuestas en chino e inglés.
- Prototipado de razonamiento estructurado en hardware modesto: al entrenarse y ejecutarse en una GPU de 8 GB, es útil como demostración o base para experimentos de CoT en modelos pequeños.
- Asistente de investigación preliminar en historia de las ideas: puede ayudar a localizar posiciones de autores concretos (Descartes, Hume, Spinoza, Zhu Xi) aunque siempre con verificación humana.
- Generación de bancos de preguntas: a partir de un tema filosófico dado, puede elaborar preguntas de opción múltiple con análisis de distractores, siguiendo el patrón de exclusión aprendido.

## Benchmarks y rendimiento

Datos publicados por el autor sobre un test independiente de 25 preguntas académicas de filosofía (no verificados de forma externa):

| Métrica | Base Qwen3.5-2B | Modelo ajustado | Mejora |
|---|---:|---:|---:|
| Precisión en preguntas académicas (Accuracy) | 0,00 % | 56,00 % | +56,00 pp |
| Cumplimiento del formato estructurado (Compliance) | 12,00 % | 100,00 % | +88,00 pp |
| Latencia media por muestra (Latency) | 9,70 s | 5,88 s | 39,4 % más rápido |

No se han publicado resultados en benchmarks estándar (MMLU completo, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM para inferencia: con pesos en bfloat16 (≈3,8 GB) cabe cómodamente en GPUs de 8 GB; el entrenamiento del propio autor consumió unos 5,5 GB en una RTX 4060 de 8 GB.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 4090); para servidores, una A10 o superior es más que suficiente.
- Consumer GPU: sí, es plenamente ejecutable en GPUs domésticas de 8 GB, incluso sin cuantización.
- Despliegue: compatible con `transformers` (código de ejemplo en la model card con `device_map="auto"`); al ser un modelo Qwen en safetensors debería funcionar también con vLLM, llama.cpp (requeriría conversión a GGUF, no publicada) y Ollama, aunque el autor no documenta ninguna de estas vías.
- Latencia y throughput: el autor reporta 5,88 s de latencia media por muestra en su test (configuración de hardware no detallada); no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B-Philosophy-CoT | 1,88 B | Filosofía académica, CoT estructurado (zh/en) | Apache-2.0 | Safetensors, pesos fusionados |
| Qwen3.5-2B (base) | ≈1,88 B | Modelo general multilingüe | Apache-2.0 (según la model card del ajuste) | Safetensors |
| Qwen2.5-1.5B-Instruct | 1,54 B | Uso general, chat | Apache-2.0 | Safetensors, GGUF, cuantizaciones |

No existen alternativas comerciales conocidas especializadas específicamente en filosofía académica a este tamaño; la comparación más relevante es con su propio modelo base, del que mejora sustancialmente el comportamiento en la tarea objetivo según los datos del autor.

## Limitaciones y advertencias

- Precisión limitada: un 56 % de acierto en el test del autor, aunque muy superior al 0 % del base, sigue lejos del nivel de un modelo grande o de un experto humano; no debe usarse como fuente autorizada sin verificación.
- Riesgo de alucinación elevado: al ser un modelo pequeño entrenado con un dataset reducido (1.080 ejemplos), puede citar o parafrasear posiciones filosóficas de forma inexacta o inventar atribuciones a autores.
- Sesgo del dataset: el entrenamiento se centra en el canon filosófico occidental (Platón, Kant, Hegel) y chino clásico; filosofía contemporánea, continental reciente o de otras tradiciones está probablemente infrarepresentada.
- Idiomas: solo chino e inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: la longitud de contexto no está documentada en la model card del ajuste; habría que consultar la ficha del modelo base Qwen3.5-2B.
- Benchmarks propios: las métricas publicadas proceden de un test de solo 25 preguntas elaborado por el propio autor, con posible sesgo de selección; no hay evaluación independiente.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar también los términos del modelo base Qwen3.5-2B de Alibaba.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hakiyukuno/Qwen3.5-2B-Philosophy-CoT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset MMLU (subconjunto philosophy): https://huggingface.co/datasets/cais/mmlu

No se han encontrado enlaces adicionales a papers, blogs de anuncio ni demos en la información disponible.
