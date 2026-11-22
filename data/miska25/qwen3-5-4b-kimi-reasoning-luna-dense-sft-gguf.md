# Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF

## Resumen

Luna Dense SFT es un ajuste fino supervisado (SFT) del checkpoint intermedio Stage 1 GRPO del proyecto Luna, que a su vez parte de `unsloth/Qwen3.5-4B`. Lo publica el usuario independiente Miska25 en Hugging Face. El modelo resuelve un problema acotado: mejorar la fiabilidad de las trazas de razonamiento en tareas de aritmética elemental, comprensión de fechas, deducción lógica y seguimiento de objetos tras un proceso previo de RL (GRPO), consolidando ese comportamiento mediante 200 actualizaciones supervisadas sobre trazas verificadas por respuesta.

Arquitectónicamente es un transformer denso de aproximadamente 4.205 millones de parámetros (4B), derivado de la familia Qwen3.5, distribuido únicamente como GGUF cuantizado en Q4_K_M (2,74 GB). Está pensado para ejecución local en llama.cpp o LM Studio, con modo "thinking" activado para reproducir la configuración de evaluación del autor.

Su relevancia es limitada pero concreta: demuestra un flujo de trabajo de RL seguido de SFT sobre un modelo pequeño de 4B, con una mejora medida y estadísticamente contrastada (p = 0.000898 frente al baseline público) en un conjunto de cuatro familias de benchmarks de razonamiento. No es un modelo de propósito general ni compite en escala con modelos frontera; es un artefacto de investigación reproducible con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parámetros totales | 4.205.751.296 (~4,2B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (configuración usada en la evaluación; no se documenta el máximo arquitectónico) |
| Tipos de cuantización | Q4_K_M (única publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye plantilla de chat) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `unsloth/Qwen3.5-4B` en la revisión `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`. Sobre esa base se aplicó primero una etapa de GRPO (Stage 1), cuyo checkpoint intermedio (step 495) sirve de punto de partida para esta release. La etapa Dense SFT aplica 200 actualizaciones supervisadas usando trazas de razonamiento verificadas por respuesta generadas por el propio Stage 1. El ajuste se realizó con LoRA de rango 8 sobre las proyecciones de atención de las capas del decodificador 14 a 17, y posteriormente se fusionó (merge) en los pesos de Stage 1 y se cuantizó a Q4_K_M en una sola pasada.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de preentrenamiento original, ni detalles sobre la arquitectura interna de Qwen3.5 (tipo de atención, normalización, etc.). La innovación destacable es metodológica: el uso de trazas autogeneradas y verificadas por exactitud como datos de SFT para consolidar el comportamiento aprendido por RL, con una evaluación pareada de dos colas sobre un bloque reservado de 200 preguntas.

## Capacidades

- Generación de texto conversacional con plantilla de chat incluida en el GGUF.
- Razonamiento en modo "thinking": el autor indica que debe activarse para reproducir la configuración de benchmark.
- Aritmética elemental (evaluado sobre GSM8K).
- Comprensión de fechas (date understanding, BIG-Bench Hard).
- Deducción lógica (logical deduction, BIG-Bench Hard).
- Seguimiento de objetos tras barajado (shuffled-object tracking).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso orquestado: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Evaluación de pipelines de razonamiento en local: cargar el GGUF en llama.cpp con modo thinking activado y 16K de contexto para reproducir los resultados del autor sobre GSM8K y BIG-Bench Hard, útil como referencia de investigación en experimentos de RL + SFT.
- Prototipado de asistentes de razonamiento paso a paso en estaciones de trabajo sin GPU dedicada: el archivo Q4_K_M de 2,74 GB cabe en memoria unificada o VRAM modesta, lo que permite iterar sobre prompts de cadena de pensamiento sin infraestructura cloud.
- Investigación sobre consolidación de RL: servir como checkpoint de comparación frente a Stage 1 GRPO y al Luna step 495 público para estudiar cómo el SFT sobre trazas verificadas altera la distribución de longitudes de razonamiento (60,5 → 64,1 tokens de media).
- Tareas de deducción lógica y seguimiento de estado en entornos educativos o de demostración, donde el modelo muestra la mayor mejora documentada (33/50 → 45/50 en shuffled-object tracking).
- Integración en LM Studio para pruebas de usabilidad de interfaces conversacionales con modelos de 4B que exponen razonamiento explícito, sin coste de API.
- Baseline en experimentos de destilación o ajuste posterior: al ser Apache 2.0 y estar en GGUF, puede servir como punto de partida documentado para nuevas rondas de SFT o DPO sobre las mismas familias de tareas.

## Benchmarks y rendimiento

Datos publicados por el autor. Configuración: llama.cpp, Q4_K_M, decodificación greedy, thinking activado, contexto de 16.384 tokens, 50 preguntas por dominio (GSM8K, date understanding, logical deduction, shuffled-object tracking), exact-match.

| Bloque | Modelo | Exact-match | Tokens de razonamiento medios |
|---|---|---:|---:|
| Primeros 200 | Luna step 495 (público) | 141/200 (70,5%) | 60,5 |
| Primeros 200 | Stage 1 GRPO (intermedio) | 141/200 (70,5%) | 59,8 |
| Primeros 200 | Luna Dense SFT | 155/200 (77,5%) | 64,1 |
| Bloque reservado 200 | Luna step 495 (público) | 129/200 (64,5%) | 62,0 |
| Bloque reservado 200 | Stage 1 GRPO (intermedio) | 142/200 (71,0%) | 60,8 |
| Bloque reservado 200 | Luna Dense SFT | 156/200 (78,0%) | 63,7 |

Contrastes estadísticos reportados: frente a Luna público en el bloque reservado, Dense SFT corrigió 45 respuestas y perdió 18 (test pareado de dos colas, p = 0.000898). Frente a Stage 1 intermedio, corrigió 30 y perdió 16 (p = 0.054). El seguimiento de objetos barajados subió de 33/50 a 45/50 (p = 0.0042). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,0-3,5 GB con Q4_K_M (2,74 GB de pesos más caché KV para 16K de contexto).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en GTX 1660 Super 6 GB, RTX 3050 8 GB, RTX 3060, RTX 4060 y superiores. También en Apple Silicon con memoria unificada de 8 GB o más.
- Opciones de despliegue: llama.cpp (build con soporte Qwen3.5) y LM Studio. vLLM, TGI y Ollama no están confirmados en la información disponible para este formato y arquitectura.
- Latencia y throughput: no disponibles. El autor solo documenta la longitud media de razonamiento (63,7-64,1 tokens en el bloque reservado), no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Formato |
|---|---|---:|---|---|---|
| Luna Dense SFT (este) | ~4,2B | 16.384 | 78,0% exact-match en bloque reservado (4 familias) | Apache 2.0 | GGUF Q4_K_M |
| Luna step 495 (público) | ~4,2B | 16.384 | 64,5% exact-match en bloque reservado | Apache 2.0 | GGUF Q4_K_M |
| Stage 1 GRPO (intermedio) | ~4,2B | 16.384 | 71,0% exact-match en bloque reservado | Apache 2.0 | no publicado como release |
| unsloth/Qwen3.5-4B (base) | ~4,2B | no disponible | no evaluado por el autor en estas pruebas | Apache 2.0 (según base) | safetensors |

La comparación se limita a los tres checkpoints del mismo linaje evaluados por el autor. No se dispone de datos que permitan comparar con modelos de otros desarrolladores en las mismas condiciones.

## Limitaciones y advertencias

- El benchmark del autor cubre solo cuatro familias de tareas con 50 preguntas por dominio y por bloque; no hay evaluación en MMLU, HumanEval, matemáticas de nivel superior ni tareas de código.
- La mejora frente a Stage 1 GRPO en el bloque reservado no alcanza significación convencional (p = 0.054); la evidencia sólida es frente al Luna público.
- Solo se publica una cuantización (Q4_K_M); no hay versiones de mayor precisión ni pesos sin cuantizar, lo que limita la reproducibilidad fina del entrenamiento.
- La longitud de contexto máxima arquitectónica no está documentada; los 16.384 tokens son la configuración de evaluación, no necesariamente el límite del modelo.
- No se documentan idiomas soportados; no se debe asumir multilingüismo.
- No hay información sobre tool calling, agentes ni integración con APIs estructuradas.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; al ser un SFT sobre trazas autogeneradas, puede heredar y amplificar errores sistemáticos del checkpoint de RL.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de los resultados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de sesgos y seguridad traslada al integrador la responsabilidad de validación en producción.
- El repositorio depende de un build de llama.cpp con soporte para Qwen3.5; versiones antiguas pueden no cargar el archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF
- Archivo GGUF Q4_K_M: https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF/resolve/main/Luna-Dense-SFT-Q4_K_M.gguf
- Release original Luna (LoRA GGUF): https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-LoRA-GGUF
- GGUF público evaluado (step 495): https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-LoRA-GGUF/blob/14c5a4ff3a077fd4a2a49e47880f164e4ccb806d/Qwen3.5-4B-Kimi-Reasoning-Luna-LoRA-step495-Q4_K_M.gguf
- Modelo base fijado: https://huggingface.co/unsloth/Qwen3.5-4B/tree/3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636
- Licencia: https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF/blob/main/LICENSE
- GSM8K: https://github.com/openai/grade-school-math
- BIG-Bench Hard: https://github.com/suzgunmirac/BIG-Bench-Hard
