# Can1178/rubric-noend

## Resumen

rubric-noend es un conjunto de pesos fusionados (merged weights) derivados de Qwen3-8B, publicado por el usuario Can1178 en Hugging Face. No se trata de un modelo base nuevo, sino del resultado de un proceso de ajuste fino con aprendizaje por refuerzo (RL) sobre una base Qwen3-8B ya sometida a SFT (supervised fine-tuning), identificada en la model card como `allpr09-lr2e6-best`. El entrenamiento combina PRM-GRPO (GRPO con un model de recompensa a nivel de proceso) con una reescritura basada únicamente en rúbricas, ejecutada con `force_update=True` dentro de la run `qwen3_8b_rubric_prm_grpo_32gpu_20261118_210603`.

El objetivo declarado es el entrenamiento de capacidades de deep research (investigación profunda con múltiples pasos y uso de herramientas), evaluadas mediante un conjunto de validación de 300 casos que abarca seis datasets: webwalker, 2wiki, gaia, researchqa, qa2dr y drb. El repositorio incluye checkpoints intermedios (pasos 64, 112, 224, 280 y 392), los identificadores de los casos de validación y el paquete de tareas val300, lo que permite reproducir y extender las curvas comparativas entre esquemas de deep search y deep research.

Es relevante ahora porque documenta de forma abierta una receta de RL con recompensas por rúbrica aplicada a un modelo de 8B parámetros, un enfoque que está ganando tracción para mejorar el razonamiento multi-paso y el uso de herramientas sin depender exclusivamente de anotaciones humanas a nivel de respuesta final. La licencia Apache 2.0 facilita su reutilización, aunque el modelo está etiquetado únicamente para inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; detalles específicos de la arquitectura no disponibles en la información proporcionada) |
| Parámetros totales | 8B (según la base Qwen3-8B y el nombre de la run) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos fusionados; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de Hugging Face; no se detalla en la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only, sobre el que se ha aplicado primero un SFT (checkpoint `allpr09-lr2e6-best`) y después un proceso de RL. La etapa de RL combina PRM-GRPO —GRPO (Group Relative Policy Optimization) guiado por un model de recompensa a nivel de proceso (process reward model)— con una reescritura basada únicamente en rúbricas, ejecutada con `force_update=True`. La run se realizó sobre 32 GPUs según el identificador `qwen3_8b_rubric_prm_grpo_32gpu_20261118_210603`.

El repositorio publica cinco checkpoints intermedios (global_step 64, 112, 224, 280 y 392) pensados para reproducir o extender las curvas de validación recogidas en `val300_search_vs_research_schemes.png`, que compara esquemas de deep search frente a deep research. El conjunto de validación val300 incluye 300 casos distribuidos entre webwalker, 2wiki, gaia, researchqa, qa2dr y drb. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset de RL ni los hiperparámetros del proceso GRPO.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de investigación profunda (deep research).
- Uso de herramientas y búsqueda web, según se desprende de los datasets de evaluación incluidos (webwalker, gaia, 2wiki).
- Razonamiento sobre preguntas que requieren agregación de información de múltiples fuentes (researchqa, qa2dr, drb).
- Capacidades multilingües limitadas a inglés y chino según la etiqueta de idiomas del repositorio.
- Entrenamiento orientado a recompensas por rúbrica, lo que sugiere un sesgo hacia respuestas estructuradas y verificables, aunque no se documentan modos explícitos de "thinking" ni otras capacidades especiales.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Investigación profunda automatizada: el modelo puede encadenar búsquedas y síntesis sobre preguntas complejas, aprovechando su entrenamiento con PRM-GRPO y rúbricas para tareas tipo GAIA o researchqa.
- Asistentes de búsqueda web con verificación: adecuado para pipelines que requieren consultar múltiples fuentes (webwalker) y consolidar respuestas con trazabilidad de pasos intermedios.
- Evaluación comparativa de esquemas de razonamiento: los checkpoints publicados permiten reproducir las curvas de deep search frente a deep research y analizar la evolución del modelo por paso de entrenamiento.
- Generación de respuestas con criterios de calidad explícitos: el enfoque de rúbricas favorece respuestas estructuradas y auditables, útil en entornos donde se exige justificar cada afirmación.
- Preguntas multi-hop sobre bases de conocimiento: los datasets 2wiki y qa2dr sugieren buen encaje en tareas que requieren conectar entidades y hechos dispersos.
- Experimentación en RL para investigación: sirve como punto de partida para reproducir la receta PRM-GRPO + rúbricas sobre Qwen3-8B y extenderla a nuevos dominios o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card únicamente referencia la figura `val300_search_vs_research_schemes.png` con curvas comparativas por esquema, sin valores concretos de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 8B en precisión completa (FP16/BF16) se requieren aproximadamente 16 GB de VRAM solo para los pesos, y alrededor de 20-24 GB considerando caché KV y overhead.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) puede alojar el modelo en FP16/BF16 con margen limitado.
- Compatibilidad con GPU de consumo: sí, en GPUs con al menos 16-24 GB de VRAM si se emplean cuantizaciones de 8 o 4 bits; no se publican variantes GGUF oficiales.
- Opciones de despliegue: vLLM, TGI o llama.cpp (este último requeriría convertir los pesos a GGUF, no incluido en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| rubric-noend | 8B | no disponible | Apache 2.0 | Qwen3-8B + PRM-GRPO + rúbricas para deep research |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | Apache 2.0 | Modelo base generalista de Qwen |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 128K (según su model card) | MIT | Destilación de razonamiento |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Instrucción generalista |

La comparación con alternativas concretas no puede completarse con datos de rendimiento porque rubric-noend no publica métricas numéricas; la comparativa se limita a parámetros, licencia y enfoque de entrenamiento.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.
- Sin benchmarks publicados: no es posible verificar empíricamente su rendimiento frente a la base Qwen3-8B ni frente a alternativas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de 8B y acentuado en tareas de investigación profunda que requieren síntesis de fuentes.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la model card no incluye claves de API ni tokens, lo que es correcto, pero tampoco documenta el proceso de reproducción completo.
- El repositorio está orientado a experimentación (checkpoints intermedios, pack de validación) más que a despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Can1178/rubric-noend
- Figura de validación referenciada en la model card: `val300_search_vs_research_schemes.png` (incluida en el repositorio, no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
